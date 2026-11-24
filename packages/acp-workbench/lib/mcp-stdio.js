#!/usr/bin/env node
import { createInterface } from 'node:readline'

const url = process.env.DSH_ACP_MCP_URL
const token = process.env.DSH_ACP_MCP_TOKEN

if (!url || !token) {
  process.stderr.write('dsh-acp-workbench MCP stdio bridge requires DSH_ACP_MCP_URL and DSH_ACP_MCP_TOKEN\n')
  process.exit(1)
}

function writeMessage(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`)
}

let inFlight = 0
let inputEnded = false

function maybeExit() {
  if (inputEnded && inFlight === 0) process.exit(0)
}

async function forward(rawLine) {
  let parsed
  try {
    parsed = JSON.parse(rawLine)
  } catch {
    writeMessage({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })
    return
  }
  const hasId = parsed && typeof parsed === 'object' && Object.hasOwn(parsed, 'id')
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: rawLine,
    })
    const text = await response.text()
    if (!hasId) return
    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const body = JSON.parse(text)
        if (body?.error?.message) {
          writeMessage(body)
          return
        }
        if (typeof body?.message === 'string') message = body.message
      } catch {}
      writeMessage({ jsonrpc: '2.0', id: parsed.id, error: { code: -32603, message } })
      return
    }
    if (text.trim()) {
      process.stdout.write(`${text.trim()}\n`)
    }
  } catch (error) {
    if (hasId) {
      writeMessage({
        jsonrpc: '2.0',
        id: parsed.id,
        error: { code: -32603, message: error?.message ?? String(error) },
      })
    }
  }
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity })
rl.on('line', line => {
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
