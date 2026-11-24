#!/usr/bin/env node
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { MCP_META_KEYS, isModernMcpProtocolVersion } from './mcp-bridge.js'

const SAFE_HEADER_VALUE_RE = /^[\x21-\x7e]+$/u
const SAFE_ASCII_TEXT_RE = /^[\x20-\x7e]+$/u
const IGNORED_OUTPUT_ERROR_CODES = new Set(['EPIPE', 'ERR_STREAM_DESTROYED', 'ERR_STREAM_WRITE_AFTER_END', 'ECONNRESET'])

function safeHeaderValue(value) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed && SAFE_HEADER_VALUE_RE.test(trimmed) ? trimmed : undefined
}

function extractMcpNameHeader(parsed) {
  if (!parsed || typeof parsed !== 'object') return undefined
  const params = parsed.params
  if (!params || typeof params !== 'object') return undefined
  let candidate
  if (parsed.method === 'tools/call' || parsed.method === 'prompts/get') candidate = params.name
  else if (parsed.method === 'resources/read') candidate = params.uri
  else if (parsed.method === 'tasks/get' || parsed.method === 'tasks/update' || parsed.method === 'tasks/cancel') candidate = params.taskId
  if (typeof candidate !== 'string') return undefined
  const trimmed = candidate.trim()
  return trimmed && SAFE_ASCII_TEXT_RE.test(trimmed) ? trimmed : undefined
}

export function buildForwardHeaders(parsed, { token, protocolVersion, sessionId } = {}) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  }
  const method = safeHeaderValue(parsed?.method)
  if (method) headers['Mcp-Method'] = method
  const rawEnvelopeVersion = parsed?.params?._meta?.[MCP_META_KEYS.protocolVersion]
  const envelopeVersion = safeHeaderValue(rawEnvelopeVersion)
  const effectiveVersion = envelopeVersion ?? (method !== 'initialize' ? safeHeaderValue(protocolVersion) : undefined)
  if (effectiveVersion) headers['MCP-Protocol-Version'] = effectiveVersion
  if (isModernMcpProtocolVersion(effectiveVersion)) {
    const mcpName = extractMcpNameHeader(parsed)
    if (mcpName) headers['Mcp-Name'] = mcpName
  }
  const safeSession = safeHeaderValue(sessionId)
  if (safeSession) headers['Mcp-Session-Id'] = safeSession
  return headers
}

export function createStdioBridge({
  url,
  token,
  input = process.stdin,
  output = process.stdout,
  stderr = process.stderr,
  fetchImpl = fetch,
  onExit = code => { process.exit(code) },
} = {}) {
  let inFlight = 0
  let pendingWrites = 0
  let inputEnded = false
  let outputClosed = false
  let exited = false
  let protocolVersion
  let sessionId
  const activeControllers = new Set()

  const finish = code => {
    if (exited) return
    exited = true
    onExit(code)
  }

  const abortAll = () => {
    for (const controller of activeControllers) {
      try { controller.abort() } catch {}
    }
    activeControllers.clear()
  }

  const maybeExit = () => {
    if (outputClosed) {
      finish(0)
      return
    }
    if (inputEnded && inFlight === 0 && pendingWrites === 0) {
      finish(0)
    }
  }

  const handleOutputError = error => {
    outputClosed = true
    abortAll()
    try { rl.close() } catch {}
    const code = !error || !error.code || IGNORED_OUTPUT_ERROR_CODES.has(error.code) ? 0 : 1
    finish(code)
  }

  const writeLine = line => {
    if (outputClosed || !output || output.destroyed || output.writableEnded) {
      outputClosed = true
      maybeExit()
      return
    }
    pendingWrites++
    let settled = false
    const onWritten = error => {
      if (settled) return
      settled = true
      pendingWrites--
      if (error) {
        handleOutputError(error)
        return
      }
      maybeExit()
    }
    try {
      output.write(line, onWritten)
    } catch (error) {
      onWritten(error)
    }
  }

  const writeMessage = payload => {
    writeLine(`${JSON.stringify(payload)}\n`)
  }

  output?.on?.('error', handleOutputError)
  output?.on?.('close', () => {
    outputClosed = true
    abortAll()
    try { rl.close() } catch {}
    maybeExit()
  })
  stderr?.on?.('error', () => {})
  input?.on?.('error', () => {
    inputEnded = true
    maybeExit()
  })

  const forward = async rawLine => {
    if (outputClosed) return
    let parsed
    try {
      parsed = JSON.parse(rawLine)
    } catch {
      writeMessage({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })
      return
    }
    const hasId = Boolean(parsed && typeof parsed === 'object' && Object.hasOwn(parsed, 'id'))
    const controller = new AbortController()
    activeControllers.add(controller)
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: buildForwardHeaders(parsed, { token, protocolVersion, sessionId }),
        body: rawLine,
        signal: controller.signal,
      })
      const headerSession = safeHeaderValue(response.headers?.get?.('mcp-session-id'))
      if (headerSession) sessionId = headerSession
      const headerVersion = safeHeaderValue(response.headers?.get?.('mcp-protocol-version'))
      const text = await response.text()
      if (outputClosed) return
      if (!hasId) return
      if (!response.ok) {
        let message = `HTTP ${response.status}`
        try {
          const body = JSON.parse(text)
          if (body?.error?.message) {
            writeMessage({
              jsonrpc: '2.0',
              ...body,
              id: body.id ?? parsed.id,
            })
            return
          }
          if (typeof body?.message === 'string') message = body.message
        } catch {}
        writeMessage({ jsonrpc: '2.0', id: parsed.id, error: { code: -32603, message } })
        return
      }
      const trimmed = text.trim()
      if (!trimmed) return
      if (parsed.method === 'initialize') {
        try {
          const body = JSON.parse(trimmed)
          const negotiated = safeHeaderValue(body?.result?.protocolVersion) ?? headerVersion
          if (negotiated) protocolVersion = negotiated
        } catch {}
      } else if (headerVersion && !protocolVersion) {
        protocolVersion = headerVersion
      }
      writeLine(`${trimmed}\n`)
    } catch (error) {
      if (outputClosed || controller.signal.aborted) return
      if (hasId) {
        writeMessage({
          jsonrpc: '2.0',
          id: parsed.id,
          error: { code: -32603, message: error?.message ?? String(error) },
        })
      }
    } finally {
      activeControllers.delete(controller)
    }
  }

  const rl = createInterface({ input, crlfDelay: Infinity })
  rl.on('line', line => {
    if (outputClosed) return
    const trimmed = line.trim()
    if (!trimmed) return
    inFlight++
    void forward(trimmed).finally(() => {
      inFlight--
      maybeExit()
    })
  })
  rl.on('close', () => {
    inputEnded = true
    maybeExit()
  })

  return {
    rl,
    close() {
      inputEnded = true
      abortAll()
      try { rl.close() } catch {}
      maybeExit()
    },
    getState() {
      return { protocolVersion, sessionId, inFlight, inputEnded, outputClosed }
    },
  }
}

function isMainModule() {
  if (!process.argv[1]) return false
  const selfPath = fileURLToPath(import.meta.url)
  try {
    return realpathSync(selfPath) === realpathSync(process.argv[1])
  } catch {
    return resolve(selfPath) === resolve(process.argv[1])
  }
}

if (isMainModule()) {
  const url = process.env.DSH_ACP_MCP_URL
  const token = process.env.DSH_ACP_MCP_TOKEN
  if (!url || !token) {
    try {
      process.stderr.write('dsh-acp-workbench MCP stdio bridge requires DSH_ACP_MCP_URL and DSH_ACP_MCP_TOKEN\n')
    } catch {}
    process.exit(1)
  }
  createStdioBridge({ url, token })
}
