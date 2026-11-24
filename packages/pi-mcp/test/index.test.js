import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import { convertConfig } from '../lib/convert.js'
import { SET_PATH, STATE_PATH, apply, entrySignature, reconcileServers } from '../lib/index.js'

function createStrictMcpManager({ asyncDispose = false, preExisting = [] } = {}) {
  const live = new Map()
  const events = []
  for (const name of preExisting) live.set(name, { external: true })
  return {
    live,
    events,
    register(name, entry) {
      if (live.has(name)) {
        throw new Error(`mcp-manager: server "${name}" is already configured or registered`)
      }
      live.set(name, entry)
      events.push({ type: 'register', name, entry })
      let done = false
      return () => {
        if (done) return
        done = true
        if (asyncDispose) {
          return new Promise(resolve => {
            setTimeout(() => {
              live.delete(name)
              events.push({ type: 'dispose', name })
              resolve()
            }, 10)
          })
        }
        live.delete(name)
        events.push({ type: 'dispose', name })
      }
    },
  }
}

async function invokeRoute(route, { method = 'GET', url = route.path, body, peer = { principal: { kind: 'owner' } } } = {}) {
  const raw = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)
  const req = Readable.from(raw ? [Buffer.from(raw)] : [])
  req.method = method
  req.url = url
  const res = new EventEmitter()
  res.writableEnded = false
  res.destroyed = false
  res.statusCode = 200
  res.headers = {}
  let text = ''
  res.writeHead = (status, headers = {}) => {
    res.statusCode = status
    res.headers = headers
  }
  res.end = chunk => {
    if (chunk) text += chunk
    res.writableEnded = true
  }
  await route.handler(req, res, peer)
  return { status: res.statusCode, json: text ? JSON.parse(text) : null }
}

function createPluginHarness(manager) {
  const routes = new Map()
  const cleanups = []
  const logs = { info: [], warn: [] }
  const logger = {
    info: msg => logs.info.push(msg),
    warn: msg => logs.warn.push(msg),
  }
  const webServer = {
    register: route => {
      routes.set(route.path, route)
      return () => routes.delete(route.path)
    },
  }
  const scope = {
    webServer,
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') cleanups.push(dispose)
      return dispose
    },
  }
  const ctx = {
    logger,
    mcpManager: manager,
    get: () => undefined,
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') cleanups.push(dispose)
      return dispose
    },
    inject: (_deps, fn) => { fn(scope) },
  }
  return {
    ctx,
    routes,
    logs,
    dispose: () => {
      for (const cleanup of cleanups.splice(0).toReversed()) cleanup()
    },
  }
}

test('entrySignature ignores object key order and detects every manifest field change', () => {
  const a = {
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'srv'],
    env: { ALPHA: '1', BETA: '2' },
    cwd: '/work',
    toolCallTimeoutMs: 30000,
    toolLoading: 'on-demand',
  }
  const b = {
    toolLoading: 'on-demand',
    toolCallTimeoutMs: 30000,
    cwd: '/work',
    env: { BETA: '2', ALPHA: '1' },
    args: ['-y', 'srv'],
    command: 'npx',
    transport: 'stdio',
  }
  assert.equal(entrySignature(a), entrySignature(b))
  assert.notEqual(entrySignature(a), entrySignature({ ...a, args: ['srv', '-y'] }))
  assert.notEqual(entrySignature(a), entrySignature({ ...a, env: { ALPHA: '1', BETA: '3' } }))
  assert.notEqual(entrySignature(a), entrySignature({ ...a, toolLoading: 'eager' }))
  assert.notEqual(entrySignature(a), entrySignature({ ...a, toolCallTimeoutMs: 60000 }))
  assert.notEqual(entrySignature(a), entrySignature({ ...a, cwd: '/other' }))
})

test('convertConfig does not let disabled or invalid servers block "-"/"_" siblings', () => {
  const { entries, skipped } = convertConfig({
    mcpServers: {
      'foo-bar': { enabled: false, command: 'old' },
      foo_bar: { command: 'new' },
      'bad-one': { oauth: {} },
      bad_one: { url: 'https://example.test/mcp' },
    },
  })
  assert.deepEqual([...entries.keys()], ['foo_bar', 'bad_one'])
  assert.equal(skipped.length, 1)
  assert.equal(skipped[0].name, 'bad-one')
})

test('reconcileServers is idempotent, disposes before re-registering on change, and removes deleted entries', async () => {
  const manager = createStrictMcpManager({ asyncDispose: true })
  const active = new Map()
  const logs = { info: [], warn: [] }
  const logger = { info: m => logs.info.push(m), warn: m => logs.warn.push(m) }

  const initial = new Map([
    ['alpha', { transport: 'stdio', command: 'node', args: ['a.js'], env: { A: '1', B: '2' } }],
    ['beta', { transport: 'streamable-http', url: 'https://b.test/mcp', headers: { X: '1', Y: '2' } }],
  ])
  const first = await reconcileServers(active, initial, { register: (n, e) => manager.register(n, e), logger })
  assert.deepEqual(first.added, ['alpha', 'beta'])
  assert.equal(manager.events.length, 2)

  manager.events.length = 0
  const reordered = new Map([
    ['alpha', { env: { B: '2', A: '1' }, args: ['a.js'], command: 'node', transport: 'stdio' }],
    ['beta', { headers: { Y: '2', X: '1' }, url: 'https://b.test/mcp', transport: 'streamable-http' }],
  ])
  const second = await reconcileServers(active, reordered, { register: (n, e) => manager.register(n, e), logger })
  assert.deepEqual(second.kept, ['alpha', 'beta'])
  assert.deepEqual(second.added, [])
  assert.deepEqual(second.updated, [])
  assert.deepEqual(second.removed, [])
  assert.deepEqual(manager.events, [])

  const updated = new Map([
    ['alpha', { transport: 'stdio', command: 'node', args: ['a.js'], env: { A: '1', B: '2' } }],
    ['beta', { transport: 'streamable-http', url: 'https://b.test/mcp', headers: { X: '1', Y: '9' } }],
    ['gamma', { transport: 'stdio', command: 'node', args: ['g.js'], env: {} }],
  ])
  const third = await reconcileServers(active, updated, { register: (n, e) => manager.register(n, e), logger })
  assert.deepEqual(third.kept, ['alpha'])
  assert.deepEqual(third.updated, ['beta'])
  assert.deepEqual(third.added, ['gamma'])
  assert.deepEqual(third.removed, [])
  assert.deepEqual(manager.events.map(e => `${e.type}:${e.name}`), ['dispose:beta', 'register:beta', 'register:gamma'])

  manager.events.length = 0
  const shrunk = new Map([
    ['alpha', { transport: 'stdio', command: 'node', args: ['a.js'], env: { A: '1', B: '2' } }],
  ])
  const fourth = await reconcileServers(active, shrunk, { register: (n, e) => manager.register(n, e), logger })
  assert.deepEqual(fourth.kept, ['alpha'])
  assert.deepEqual(fourth.removed, ['beta', 'gamma'])
  assert.deepEqual([...manager.live.keys()], ['alpha'])
  assert.deepEqual(manager.events.map(e => `${e.type}:${e.name}`), ['dispose:beta', 'dispose:gamma'])
})

test('reconcileServers isolates failing disposers and external registration conflicts', async () => {
  const manager = createStrictMcpManager({ preExisting: ['occupied'] })
  const active = new Map([
    ['broken', { signature: 'old', dispose: () => { throw new Error('dispose boom') } }],
  ])
  const warnings = []
  const logger = { info: () => {}, warn: msg => warnings.push(msg) }
  const next = new Map([
    ['occupied', { transport: 'stdio', command: 'node', args: [], env: {} }],
    ['healthy', { transport: 'stdio', command: 'node', args: ['ok.js'], env: {} }],
  ])
  const result = await reconcileServers(active, next, { register: (n, e) => manager.register(n, e), logger })
  assert.deepEqual(result.removed, ['broken'])
  assert.deepEqual(result.added, ['healthy'])
  assert.equal(result.failed.length, 1)
  assert.equal(result.failed[0].server, 'occupied')
  assert.equal(active.has('broken'), false)
  assert.equal(active.has('occupied'), false)
  assert.equal(active.has('healthy'), true)
  assert.ok(warnings.some(msg => msg.includes('cannot dispose "broken"')))
  assert.ok(warnings.some(msg => msg.includes('cannot register "occupied"')))
})

test('pi-mcp apply reconciles hot-reload edits, /set toggles, invalid JSON, and file deletion without conflicts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-pi-mcp-test-'))
  const file = join(dir, 'mcp.json')
  const prevDir = process.env.PI_CODING_AGENT_DIR
  const prevDisabled = process.env.DSH_PI_MCP_DISABLED_SERVERS
  process.env.PI_CODING_AGENT_DIR = dir
  delete process.env.DSH_PI_MCP_DISABLED_SERVERS

  const manager = createStrictMcpManager()
  const harness = createPluginHarness(manager)
  try {
    await writeFile(file, JSON.stringify({
      mcpServers: {
        one: { command: 'node', args: ['one.js'], env: { A: '1', B: '2' } },
        'two-srv': { url: 'https://two.test/mcp', headers: { Authorization: 'Bearer a' } },
      },
    }))
    await apply(harness.ctx, {})
    assert.deepEqual([...manager.live.keys()].toSorted(), ['one', 'two-srv'])
    const stateRoute = harness.routes.get(STATE_PATH)
    const setRoute = harness.routes.get(SET_PATH)

    manager.events.length = 0
    await writeFile(file, JSON.stringify({
      mcpServers: {
        one: { command: 'node', args: ['one.js'], env: { B: '2', A: '1' } },
        'two-srv': { url: 'https://two.test/mcp', headers: { Authorization: 'Bearer a' } },
      },
    }))
    const sameRes = await invokeRoute(stateRoute, { url: `${STATE_PATH}?reload=1` })
    assert.equal(sameRes.status, 200)
    assert.deepEqual(manager.events, [])

    await writeFile(file, JSON.stringify({
      mcpServers: {
        one: { command: 'node', args: ['one.js'], env: { A: '1', B: '2' } },
        two_srv: { url: 'https://two.test/mcp', headers: { Authorization: 'Bearer b' }, exposure: 'deferred' },
      },
    }))
    const changedRes = await invokeRoute(stateRoute, { url: `${STATE_PATH}?reload=1` })
    assert.equal(changedRes.status, 200)
    assert.deepEqual(manager.events.map(e => `${e.type}:${e.name}`), ['dispose:two-srv', 'register:two_srv'])
    assert.equal(manager.live.get('two_srv').toolLoading, 'on-demand')

    manager.events.length = 0
    await writeFile(file, '{ broken json')
    const invalidRes = await invokeRoute(stateRoute, { url: `${STATE_PATH}?reload=1` })
    assert.equal(invalidRes.status, 200)
    assert.equal(invalidRes.json.error, 'invalid JSON')
    assert.deepEqual([...manager.live.keys()].toSorted(), ['one', 'two_srv'])
    assert.deepEqual(manager.events, [])

    await writeFile(file, JSON.stringify({
      mcpServers: {
        one: { command: 'node', args: ['one.js'], env: { A: '1', B: '2' } },
        two_srv: { url: 'https://two.test/mcp', headers: { Authorization: 'Bearer b' }, exposure: 'deferred' },
      },
    }))
    const toggleRes = await invokeRoute(setRoute, {
      method: 'POST',
      body: { disabledServers: ['one'] },
    })
    assert.equal(toggleRes.status, 200)
    assert.deepEqual([...manager.live.keys()], ['two_srv'])
    assert.deepEqual(manager.events.map(e => `${e.type}:${e.name}`), ['dispose:one'])

    manager.events.length = 0
    await unlink(file)
    const missingRes = await invokeRoute(stateRoute, { url: `${STATE_PATH}?reload=1` })
    assert.equal(missingRes.status, 200)
    assert.equal(missingRes.json.exists, false)
    assert.deepEqual([...manager.live.keys()], [])
    assert.deepEqual(manager.events.map(e => `${e.type}:${e.name}`), ['dispose:two_srv'])
  } finally {
    harness.dispose()
    if (prevDir === undefined) delete process.env.PI_CODING_AGENT_DIR
    else process.env.PI_CODING_AGENT_DIR = prevDir
    if (prevDisabled === undefined) delete process.env.DSH_PI_MCP_DISABLED_SERVERS
    else process.env.DSH_PI_MCP_DISABLED_SERVERS = prevDisabled
    await rm(dir, { recursive: true, force: true })
  }
})
