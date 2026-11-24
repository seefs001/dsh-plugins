import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MCP_META_KEYS,
  MCP_MODERN_PROTOCOL_VERSION,
  MCP_PROXY_SERVER_NAME,
  buildMcpInitializeResult,
  callForwardedMcpTool,
  callProxyMcpTool,
  handleMcpBridgeRequest,
  negotiateMcpProtocolVersion,
  parseMcpRequestContext,
} from '../lib/mcp-bridge.js'
import { RpcError } from '../lib/transport.js'

function createMockCtx() {
  const definitions = [
    {
      name: 'mcp__linear__list_issues',
      description: 'List Linear issues',
      parameters: { type: 'object', properties: { query: { type: 'string' } } },
      async execute(args) {
        return { issues: [{ title: args.query ?? 'all' }] }
      },
    },
  ]
  const byName = new Map(definitions.map(def => [def.name, def]))
  return {
    get(service) {
      if (service === 'mcpManager') {
        return {
          list() {
            return [{ name: 'linear', configured: true, status: { state: 'connected' } }]
          },
        }
      }
      if (service === 'tools') {
        return {
          definitions() { return definitions },
          get(name) { return byName.get(name) ?? null },
        }
      }
      return null
    },
  }
}

test('negotiateMcpProtocolVersion accepts 2026-07-28 and legacy revisions cleanly', () => {
  assert.equal(negotiateMcpProtocolVersion('2026-07-28'), '2026-07-28')
  assert.equal(negotiateMcpProtocolVersion('2025-11-25'), '2025-11-25')
  assert.equal(negotiateMcpProtocolVersion('2025-03-26'), '2025-03-26')
  assert.equal(negotiateMcpProtocolVersion('2026-09-01'), '2026-07-28')
  assert.equal(negotiateMcpProtocolVersion(undefined), '2025-03-26')
})

test('initialize accepts 2026-07-28 and stamps serverInfo metadata', async () => {
  const ctx = createMockCtx()
  const response = await handleMcpBridgeRequest(ctx, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: MCP_MODERN_PROTOCOL_VERSION,
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    },
  }, {
    targetServer: MCP_PROXY_SERVER_NAME,
    headers: { 'Mcp-Method': 'initialize' },
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers['mcp-protocol-version'], '2026-07-28')
  assert.equal(response.body.result.protocolVersion, '2026-07-28')
  assert.deepEqual(response.body.result._meta[MCP_META_KEYS.serverInfo], {
    name: 'dsh-acp-mcp',
    version: '0.2.0',
  })

  const legacy = buildMcpInitializeResult({ protocolVersion: '2025-03-26' }, { name: 'srv', version: '1.0.0' })
  assert.equal(legacy.protocolVersion, '2025-03-26')
  assert.equal(legacy._meta, undefined)
})

test('handleMcpBridgeRequest supports server/discover and 2026-07-28 headers plus _meta envelope', async () => {
  const ctx = createMockCtx()

  const discover = await handleMcpBridgeRequest(ctx, {
    jsonrpc: '2.0',
    id: 2,
    method: 'server/discover',
    params: {
      _meta: {
        [MCP_META_KEYS.protocolVersion]: '2026-07-28',
        [MCP_META_KEYS.clientCapabilities]: {},
      },
    },
  }, {
    targetServer: 'linear',
    headers: {
      'MCP-Protocol-Version': '2026-07-28',
      'mcp-method': 'server/discover',
    },
  })
  assert.equal(discover.status, 200)
  assert.deepEqual(discover.body.result.supportedVersions, ['2026-07-28'])
  assert.equal(discover.body.result._meta[MCP_META_KEYS.serverInfo].name, 'linear')

  const call = await handleMcpBridgeRequest(ctx, {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'list_issues',
      arguments: { query: 'bug' },
      _meta: {
        [MCP_META_KEYS.protocolVersion]: '2026-07-28',
        [MCP_META_KEYS.clientInfo]: { name: 'dsh', version: '0.2.3' },
        [MCP_META_KEYS.clientCapabilities]: {},
        [MCP_META_KEYS.logLevel]: 'info',
      },
    },
  }, {
    targetServer: 'linear',
    headers: {
      'MCP-Protocol-Version': '2026-07-28',
      'Mcp-Method': 'tools/call',
    },
  })
  assert.equal(call.status, 200)
  assert.equal(call.headers['mcp-protocol-version'], '2026-07-28')
  assert.deepEqual(call.body.result.structuredContent, { issues: [{ title: 'bug' }] })
  assert.equal(call.body.result._meta[MCP_META_KEYS.serverInfo].name, 'linear')
})

test('parseMcpRequestContext rejects header/body mismatches and malformed _meta envelopes', () => {
  const methodMismatch = parseMcpRequestContext(
    { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
    { 'mcp-method': 'tools/call' },
  )
  assert.equal(methodMismatch.ok, false)
  assert.equal(methodMismatch.status, 400)
  assert.equal(methodMismatch.code, -32020)

  const versionMismatch = parseMcpRequestContext(
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {
        _meta: {
          [MCP_META_KEYS.protocolVersion]: '2026-07-28',
          [MCP_META_KEYS.clientCapabilities]: {},
        },
      },
    },
    { 'MCP-Protocol-Version': '2025-03-26', 'mcp-method': 'tools/list' },
  )
  assert.equal(versionMismatch.ok, false)
  assert.equal(versionMismatch.status, 400)
  assert.equal(versionMismatch.code, -32020)

  const badEnvelope = parseMcpRequestContext(
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/list',
      params: {
        _meta: {
          [MCP_META_KEYS.protocolVersion]: 123,
        },
      },
    },
    {},
  )
  assert.equal(badEnvelope.ok, false)
  assert.equal(badEnvelope.status, 400)
  assert.equal(badEnvelope.code, -32602)
})

test('unregistered tool calls return JSON-RPC -32602 for both direct and proxy servers', async () => {
  const ctx = createMockCtx()

  await assert.rejects(
    () => callForwardedMcpTool(ctx, 'linear', 'does_not_exist', {}),
    error => error instanceof RpcError && error.code === -32602,
  )

  await assert.rejects(
    () => callProxyMcpTool(ctx, 'does_not_exist', {}),
    error => error instanceof RpcError && error.code === -32602,
  )

  const directResp = await handleMcpBridgeRequest(ctx, {
    jsonrpc: '2.0',
    id: 10,
    method: 'tools/call',
    params: { name: 'does_not_exist', arguments: {} },
  }, { targetServer: 'linear' })
  assert.equal(directResp.status, 200)
  assert.equal(directResp.body.error.code, -32602)
  assert.match(directResp.body.error.message, /Unknown tool/u)

  const proxyResp = await handleMcpBridgeRequest(ctx, {
    jsonrpc: '2.0',
    id: 11,
    method: 'tools/call',
    params: { name: 'not_a_proxy_tool', arguments: {} },
  }, { targetServer: MCP_PROXY_SERVER_NAME })
  assert.equal(proxyResp.status, 200)
  assert.equal(proxyResp.body.error.code, -32602)

  const innerUnknown = await callProxyMcpTool(ctx, 'call_tool', {
    server: 'linear',
    tool: 'missing_inner_tool',
    arguments: {},
  })
  assert.equal(innerUnknown.isError, true)
  assert.match(innerUnknown.content[0].text, /Unknown tool/u)
})
