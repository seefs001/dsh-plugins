import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import {
  DOMAIN_SPEC,
  OP_PATH,
  OpError,
  STATE_PATH,
  TOOL_NAME,
  apply,
  applyOp,
  normalizeState,
} from '../lib/index.js'

function createMemoryHost() {
  let stored = structuredClone(DOMAIN_SPEC.global.initial)
  let closed = false
  const routes = new Map()
  const tools = new Map()
  const effects = []

  const ctx = {
    logger: { warn() {} },
    effect(fn) {
      const dispose = fn()
      if (typeof dispose === 'function') effects.push(dispose)
      return dispose
    },
    storageDomain: {
      async open(spec) {
        assert.equal(spec.name, 'model_favorites')
        return {
          global: {
            get: () => stored,
            async set(next) { stored = spec.global.schema.parse(next) },
          },
          async close() { closed = true },
        }
      },
    },
    webServer: {
      register(route) {
        routes.set(route.path, route)
        return () => routes.delete(route.path)
      },
    },
    inject(deps, fn) {
      if (deps.includes('tools')) fn(ctx)
    },
    tools: {
      register(tool) {
        tools.set(tool.name, tool)
        return () => tools.delete(tool.name)
      },
    },
  }

  apply(ctx)

  const invokeHttp = async (path, opts = {}) => {
    const method = opts.method ?? 'GET'
    const body = opts.body ?? ''
    const peer = 'peer' in opts ? opts.peer : { principal: { kind: 'owner' } }
    const route = routes.get(path)
    assert.ok(route, `route ${path} should be registered`)
    const req = Readable.from(body ? [Buffer.from(body, 'utf8')] : [])
    req.method = method
    const headers = {}
    let statusCode = 200
    let ended = ''
    const res = {
      set statusCode(code) { statusCode = code },
      get statusCode() { return statusCode },
      setHeader(k, v) { headers[k.toLowerCase()] = v },
      end(chunk = '') { ended += chunk },
    }
    await route.handler(req, res, peer)
    return {
      statusCode,
      headers,
      body: ended,
      json: ended ? JSON.parse(ended) : null,
    }
  }

  return {
    routes,
    tools,
    invokeHttp,
    getStored: () => stored,
    isClosed: () => closed,
    async dispose() {
      for (const fn of effects.toReversed()) await fn()
    },
  }
}

test('normalizeState deduplicates, trims, and filters invalid entries', () => {
  const result = normalizeState({
    favorites: [
      { provider: ' openai ', model: ' gpt-5 ' },
      { provider: 'openai', model: 'gpt-5' },
      { provider: '', model: 'bad' },
      { provider: 'anthropic', model: 'claude-sonnet-4-5' },
      null,
    ],
  })
  assert.deepEqual(result, {
    version: 1,
    favorites: [
      { provider: 'openai', model: 'gpt-5' },
      { provider: 'anthropic', model: 'claude-sonnet-4-5' },
    ],
  })
  assert.throws(() => normalizeState(null), TypeError)
})

test('applyOp supports add, remove, toggle, move, reorder, and clear', () => {
  let state = { version: 1, favorites: [] }

  let res = applyOp(state, { action: 'add', provider: 'openai', model: 'gpt-5' })
  state = res.state
  assert.equal(res.result.favorited, true)
  assert.equal(state.favorites.length, 1)

  res = applyOp(state, { action: 'toggle', provider: 'anthropic', model: 'claude-sonnet-4-5' })
  state = res.state
  assert.equal(res.result.favorited, true)
  assert.deepEqual(state.favorites, [
    { provider: 'openai', model: 'gpt-5' },
    { provider: 'anthropic', model: 'claude-sonnet-4-5' },
  ])

  res = applyOp(state, { action: 'move', provider: 'anthropic', model: 'claude-sonnet-4-5', direction: 'up' })
  state = res.state
  assert.deepEqual(state.favorites, [
    { provider: 'anthropic', model: 'claude-sonnet-4-5' },
    { provider: 'openai', model: 'gpt-5' },
  ])

  res = applyOp(state, {
    action: 'reorder',
    favorites: [
      { provider: 'openai', model: 'gpt-5' },
      { provider: 'deepseek-official', model: 'deepseek-reasoner' },
    ],
  })
  state = res.state
  assert.deepEqual(state.favorites, [
    { provider: 'openai', model: 'gpt-5' },
    { provider: 'deepseek-official', model: 'deepseek-reasoner' },
  ])

  res = applyOp(state, { action: 'toggle', provider: 'openai', model: 'gpt-5' })
  state = res.state
  assert.equal(res.result.favorited, false)
  assert.deepEqual(state.favorites, [{ provider: 'deepseek-official', model: 'deepseek-reasoner' }])

  res = applyOp(state, { action: 'clear' })
  state = res.state
  assert.deepEqual(state.favorites, [])

  assert.throws(() => applyOp(state, { action: 'unknown' }), OpError)
  assert.throws(() => applyOp(state, { action: 'add', provider: '', model: 'x' }), OpError)
})

test('HTTP endpoints enforce owner auth, persist ops, and expose agent tool', async () => {
  const host = createMemoryHost()

  const unauth = await host.invokeHttp(STATE_PATH, { peer: undefined })
  assert.equal(unauth.statusCode, 401)
  const forbidden = await host.invokeHttp(STATE_PATH, { peer: { principal: { kind: 'guest' } } })
  assert.equal(forbidden.statusCode, 403)

  const initial = await host.invokeHttp(STATE_PATH)
  assert.equal(initial.statusCode, 200)
  assert.deepEqual(initial.json, { favorites: [] })

  const added = await host.invokeHttp(OP_PATH, {
    method: 'POST',
    body: JSON.stringify({ action: 'toggle', provider: 'anthropic', model: 'claude-opus-4' }),
  })
  assert.equal(added.statusCode, 200)
  assert.equal(added.json.favorited, true)
  assert.deepEqual(added.json.favorites, [{ provider: 'anthropic', model: 'claude-opus-4' }])

  const badMethod = await host.invokeHttp(STATE_PATH, { method: 'POST' })
  assert.equal(badMethod.statusCode, 405)

  const badOp = await host.invokeHttp(OP_PATH, { method: 'POST', body: JSON.stringify({ action: 'nope' }) })
  assert.equal(badOp.statusCode, 400)

  const tool = host.tools.get(TOOL_NAME)
  assert.ok(tool)
  const toolRes = await tool.execute({ action: 'add', provider: 'openai', model: 'gpt-5' })
  assert.deepEqual(toolRes.favorites, [
    { provider: 'anthropic', model: 'claude-opus-4' },
    { provider: 'openai', model: 'gpt-5' },
  ])

  const fetched = await host.invokeHttp(STATE_PATH)
  assert.deepEqual(fetched.json.favorites, toolRes.favorites)

  await host.dispose()
  assert.equal(host.isClosed(), true)
})
