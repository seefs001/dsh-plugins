import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { PassThrough, Writable } from 'node:stream'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { MCP_META_KEYS, MCP_PROXY_SERVER_NAME, handleMcpBridgeRequest } from '../lib/mcp-bridge.js'
import { buildForwardHeaders, createStdioBridge } from '../lib/mcp-stdio.js'

const STDIO_BIN = fileURLToPath(new URL('../lib/mcp-stdio.js', import.meta.url))

function createBridgeServer() {
  const seenHeaders = []
  const ctx = {
    get(service) {
      if (service === 'mcpManager') {
        return { list: () => [{ name: 'linear', configured: true, status: { state: 'connected' } }] }
      }
      if (service === 'tools') {
        const def = {
          name: 'mcp__linear__ping_tool',
          description: 'Ping linear',
          parameters: { type: 'object', properties: {} },
          async execute() { return { ok: true } },
        }
        return {
          definitions: () => [def],
          get: name => (name === def.name ? def : null),
        }
      }
      return null
    },
  }
  const server = createServer(async (req, res) => {
    seenHeaders.push({ ...req.headers })
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    const result = await handleMcpBridgeRequest(ctx, body, {
      targetServer: MCP_PROXY_SERVER_NAME,
      headers: req.headers,
    })
    res.writeHead(result.status, {
      'content-type': 'application/json',
      'mcp-session-id': 'sess-123',
      ...result.headers,
    })
    res.end(result.body ? JSON.stringify(result.body) : '')
  })
  return { server, seenHeaders }
}

test('buildForwardHeaders sets MCP-Protocol-Version, Mcp-Method, and Mcp-Name cleanly for 2026-07-28', () => {
  const initHeaders = buildForwardHeaders(
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2026-07-28' } },
    { token: 'tok', protocolVersion: '2026-07-28' },
  )
  assert.equal(initHeaders['Mcp-Method'], 'initialize')
  assert.equal(initHeaders['MCP-Protocol-Version'], undefined)

  const envelopeHeaders = buildForwardHeaders(
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'list_tools',
        arguments: {},
        _meta: { [MCP_META_KEYS.protocolVersion]: '2026-07-28' },
      },
    },
    { token: 'tok', sessionId: 'sess-1' },
  )
  assert.equal(envelopeHeaders['MCP-Protocol-Version'], '2026-07-28')
  assert.equal(envelopeHeaders['Mcp-Method'], 'tools/call')
  assert.equal(envelopeHeaders['Mcp-Name'], 'list_tools')
  assert.equal(envelopeHeaders['Mcp-Session-Id'], 'sess-1')
})

test('createStdioBridge negotiates 2026-07-28, forwards headers, returns -32602 on unknown tool, and exits cleanly on stdin close', async () => {
  const { server, seenHeaders } = createBridgeServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  const url = `http://127.0.0.1:${port}/acp-workbench/mcp/dsh_mcp`

  try {
    const input = new PassThrough()
    const output = new PassThrough()
    const chunks = []
    output.on('data', chunk => chunks.push(chunk))
    const exitCode = await new Promise(resolve => {
      createStdioBridge({
        url,
        token: 'secret-token',
        input,
        output,
        onExit: resolve,
      })
      input.write(`${JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2026-07-28', capabilities: {} },
      })}\n`)
      input.write(`${JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'unregistered_tool',
          arguments: {},
          _meta: {
            [MCP_META_KEYS.protocolVersion]: '2026-07-28',
            [MCP_META_KEYS.clientCapabilities]: {},
          },
        },
      })}\n`)
      input.end()
    })

    assert.equal(exitCode, 0)
    const lines = Buffer.concat(chunks).toString('utf8').trim().split('\n').map(line => JSON.parse(line))
    const initResp = lines.find(item => item.id === 1)
    const errResp = lines.find(item => item.id === 2)
    assert.equal(initResp.result.protocolVersion, '2026-07-28')
    assert.equal(errResp.error.code, -32602)
    const callHeaders = seenHeaders.find(headers => headers['mcp-method'] === 'tools/call')
    assert.equal(callHeaders['mcp-protocol-version'], '2026-07-28')
    assert.equal(callHeaders['mcp-name'], 'unregistered_tool')
  } finally {
    server.closeAllConnections?.()
    await new Promise(resolve => server.close(resolve))
  }
})

test('createStdioBridge guards stdout EPIPE and aborts in-flight requests cleanly', async () => {
  const input = new PassThrough()
  let aborted = false
  let releaseFetch
  const brokenOutput = new Writable({
    write(_chunk, _enc, callback) {
      const err = Object.assign(new Error('broken pipe'), { code: 'EPIPE' })
      callback(err)
    },
  })

  const exitPromise = new Promise(resolve => {
    createStdioBridge({
      url: 'http://127.0.0.1:1/mcp',
      token: 'tok',
      input,
      output: brokenOutput,
      fetchImpl: (_url, init) => new Promise((_res, rej) => {
        init.signal.addEventListener('abort', () => {
          aborted = true
          rej(new Error('aborted'))
        })
        releaseFetch = () => {
          brokenOutput.emit('error', Object.assign(new Error('write EPIPE'), { code: 'EPIPE' }))
        }
      }),
      onExit: resolve,
    })
  })

  input.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping', params: {} })}\n`)
  await new Promise(resolve => setImmediate(resolve))
  releaseFetch()
  const code = await exitPromise
  assert.equal(code, 0)
  assert.equal(aborted, true)
})

test('mcp-stdio subprocess exits cleanly on stdin close with 2026-07-28 initialize', async () => {
  const { server } = createBridgeServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()

  try {
    const child = spawn(process.execPath, [STDIO_BIN], {
      env: {
        ...process.env,
        DSH_ACP_MCP_URL: `http://127.0.0.1:${port}/acp-workbench/mcp/dsh_mcp`,
        DSH_ACP_MCP_TOKEN: 'test-token',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const stdout = []
    const stderr = []
    child.stdout.on('data', chunk => stdout.push(chunk))
    child.stderr.on('data', chunk => stderr.push(chunk))
    child.stdin.write(`${JSON.stringify({
      jsonrpc: '2.0',
      id: 7,
      method: 'initialize',
      params: { protocolVersion: '2026-07-28', capabilities: {} },
    })}\n`)
    child.stdin.end()

    const [exitCode, signal] = await new Promise((resolve, reject) => {
      child.once('error', reject)
      child.once('exit', (code, sig) => resolve([code, sig]))
    })

    assert.equal(exitCode, 0)
    assert.equal(signal, null)
    assert.equal(Buffer.concat(stderr).toString('utf8'), '')
    const parsed = JSON.parse(Buffer.concat(stdout).toString('utf8').trim())
    assert.equal(parsed.id, 7)
    assert.equal(parsed.result.protocolVersion, '2026-07-28')
  } finally {
    server.closeAllConnections?.()
    await new Promise(resolve => server.close(resolve))
  }
})
