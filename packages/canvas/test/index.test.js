import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import { apply, EVENTS_PATH, OP_PATH, STATE_PATH } from '../lib/index.js'

function createMemoryDomain() {
  const tables = new Map()
  let closed = false
  return {
    get closed() { return closed },
    async close() { closed = true },
    table(name) {
      if (!tables.has(name)) tables.set(name, new Map())
      const map = tables.get(name)
      return {
        get: key => map.get(key),
        entries: () => map.entries(),
        async put(key, value) { map.set(key, value) },
        async delete(key) { map.delete(key) },
      }
    },
  }
}

function createFakeAgent(sessionId, cwd) {
  const registeredTools = new Map()
  let skillProvider = null
  let invalidations = 0

  const agent = {
    session: { id: sessionId, header: { cwd } },
    registeredTools,
    get invalidations() { return invalidations },
    async listSkills() { return skillProvider ? await skillProvider.list() : [] },
    async getSkill(candidate) { return skillProvider ? await skillProvider.get(candidate) : undefined },
    ctx: {
      inject(deps, fn) {
        const cleanups = []
        const scope = {
          effect(cb) {
            const dispose = cb()
            if (typeof dispose === 'function') cleanups.push(dispose)
          },
          skills: {
            registerProvider(factory) {
              skillProvider = factory({ invalidate() { invalidations++ } })
              cleanups.push(() => { skillProvider = null })
            },
          },
          tools: {
            register(def) {
              registeredTools.set(def.name, def)
              return () => { registeredTools.delete(def.name) }
            },
          },
        }
        fn(scope)
        return {
          async dispose() {
            while (cleanups.length > 0) cleanups.pop()()
          },
        }
      },
    },
  }
  return agent
}

function createHarness() {
  const domain = createMemoryDomain()
  const routes = new Map()
  const cleanups = []
  const promptSections = []
  const emitter = new EventEmitter()
  const agentsList = []

  const ctx = {
    get: () => undefined,
    storageDomain: {
      async open() { return domain },
    },
    connection: {
      requestRejection: () => undefined,
    },
    webServer: {
      register(route) {
        routes.set(route.path, route.handler)
        return () => { routes.delete(route.path) }
      },
    },
    systemPrompt: {
      section(def) { promptSections.push(def) },
    },
    effect(cb) {
      const cleanup = cb()
      if (typeof cleanup === 'function') cleanups.push(cleanup)
    },
    inject(deps, fn) {
      if (deps.includes('agents')) {
        const scope = {
          agents: { list: () => [...agentsList] },
          on: (event, handler) => emitter.on(event, handler),
          effect(cb) {
            const cleanup = cb()
            if (typeof cleanup === 'function') cleanups.push(cleanup)
          },
        }
        fn(scope)
      }
    },
  }

  function addAgent(sessionId, cwd) {
    const agent = createFakeAgent(sessionId, cwd)
    agentsList.push(agent)
    emitter.emit('agent/created', { agent })
    return agent
  }

  async function request(method, url, body) {
    const parsed = new URL(url, 'http://localhost')
    const handler = routes.get(parsed.pathname)
    assert.ok(handler, `missing route ${parsed.pathname}`)
    const req = Readable.from(body === undefined ? [] : [JSON.stringify(body)])
    req.method = method
    req.url = url
    req.headers = {}
    let statusCode = 200
    const chunks = []
    const res = new EventEmitter()
    res.destroyed = false
    res.writeHead = status => { statusCode = status }
    res.write = chunk => { chunks.push(String(chunk)) }
    res.end = chunk => {
      if (chunk !== undefined) chunks.push(String(chunk))
      res.destroyed = true
    }
    await handler(req, res)
    const raw = chunks.join('')
    return { status: statusCode, raw, json: raw ? JSON.parse(raw) : null }
  }

  async function dispose() {
    while (cleanups.length > 0) await cleanups.pop()()
  }

  return { ctx, domain, addAgent, request, promptSections, routes, dispose }
}

const VALID_CANVAS = `
import { H1, Stack, useCanvasState } from 'dsh/canvas'
export default function Report() {
  const [count, setCount] = useCanvasState('count', 0)
  return (
    <Stack>
      <H1>Latency Audit</H1>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
    </Stack>
  )
}
`

const UPDATED_CANVAS = `
import { H1, Stack, Text } from 'dsh/canvas'
export default function Report() {
  return (
    <Stack>
      <H1>Latency Audit v2</H1>
      <Text>Updated body</Text>
    </Stack>
  )
}
`

test('zero injection by default; per-session toggle activates skills, prompt, and tools only for opted-in session', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'dsh-canvas-test-'))
  const h = createHarness()
  try {
    await apply(h.ctx)
    const a1 = h.addAgent('s1', cwd)
    const a2 = h.addAgent('s2', cwd)
    await new Promise(resolve => setImmediate(resolve))

    assert.equal(a1.registeredTools.size, 0)
    assert.equal(a2.registeredTools.size, 0)
    assert.equal((await a1.listSkills()).length, 0)
    assert.equal(h.promptSections[0].text({ agent: a1 }), '')

    const enableRes = await h.request('POST', OP_PATH, { action: 'toggle', sessionId: 's1', cwd, enabled: true })
    assert.equal(enableRes.status, 200)
    assert.equal(enableRes.json.enabled, true)

    assert.deepEqual([...a1.registeredTools.keys()].toSorted(), ['canvas_check', 'canvas_state', 'canvas_write'])
    const a1Skills = await a1.listSkills()
    assert.equal(a1Skills.length, 1)
    assert.equal(a1Skills[0].name, 'canvas')
    const loadedSkill = await a1.getSkill(a1Skills[0])
    assert.match(loadedSkill.content, /DSH Canvas Authoring Guide/)
    assert.match(h.promptSections[0].text({ agent: a1 }), /Canvas mode is enabled/)

    assert.equal(a2.registeredTools.size, 0)
    assert.equal((await a2.listSkills()).length, 0)
    assert.equal(h.promptSections[0].text({ agent: a2 }), '')

    const disableRes = await h.request('POST', OP_PATH, { action: 'toggle', sessionId: 's1', cwd, enabled: false })
    assert.equal(disableRes.status, 200)
    assert.equal(disableRes.json.enabled, false)
    assert.equal(a1.registeredTools.size, 0)
    assert.equal((await a1.listSkills()).length, 0)
    assert.equal(h.promptSections[0].text({ agent: a1 }), '')
  } finally {
    await h.dispose()
    assert.equal(h.domain.closed, true)
    await rm(cwd, { recursive: true, force: true })
  }
})

test('workspace file lifecycle: canvas_write, revision diff, restore, persistent state, and canvas_state tool', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'dsh-canvas-life-'))
  const h = createHarness()
  try {
    await apply(h.ctx)
    const a1 = h.addAgent('s1', cwd)
    await new Promise(resolve => setImmediate(resolve))
    await h.request('POST', OP_PATH, { action: 'toggle', sessionId: 's1', cwd, enabled: true })

    const writeTool = a1.registeredTools.get('canvas_write')
    const writeRes = await writeTool.execute({ path: 'latency-audit', source: VALID_CANVAS, reason: 'Initial draft' }, { agent: a1 })
    assert.equal(writeRes.ok, true)
    assert.equal(writeRes.revision, 1)
    assert.equal(writeRes.relativePath, '.dsh/canvases/latency-audit.canvas.tsx')

    const onDisk = await readFile(writeRes.path, 'utf8')
    assert.equal(onDisk, VALID_CANVAS)

    const stateSet = await h.request('POST', OP_PATH, { action: 'setState', sessionId: 's1', cwd, path: writeRes.path, key: 'count', value: 7 })
    assert.equal(stateSet.status, 200)
    assert.equal(stateSet.json.values.count, 7)

    const stateTool = a1.registeredTools.get('canvas_state')
    const readBack = await stateTool.execute({ path: 'latency-audit' }, { agent: a1 })
    assert.deepEqual(readBack.values, { count: 7 })

    const writeRes2 = await writeTool.execute({ path: 'latency-audit', source: UPDATED_CANVAS, reason: 'Simplify view' }, { agent: a1 })
    assert.equal(writeRes2.ok, true)
    assert.equal(writeRes2.revision, 2)

    const getRes = await h.request('GET', `${STATE_PATH}?sessionId=s1&cwd=${encodeURIComponent(cwd)}`)
    assert.equal(getRes.status, 200)
    assert.equal(getRes.json.canvases.length, 1)
    assert.equal(getRes.json.canvases[0].revisions.length, 2)
    assert.ok(getRes.json.canvases[0].revisions[1].diff.added > 0)

    const restoreRes = await h.request('POST', OP_PATH, { action: 'restore', sessionId: 's1', cwd, path: writeRes.path, revision: 1 })
    assert.equal(restoreRes.status, 200)
    const restoredDisk = await readFile(writeRes.path, 'utf8')
    assert.equal(restoredDisk, VALID_CANVAS)

    const sseHandler = h.routes.get(EVENTS_PATH)
    const sseReq = Readable.from([])
    sseReq.method = 'GET'
    sseReq.url = `${EVENTS_PATH}?sessionId=s1&cwd=${encodeURIComponent(cwd)}`
    sseReq.headers = {}
    const sseRes = new EventEmitter()
    sseRes.destroyed = false
    const sseChunks = []
    sseRes.writeHead = () => {}
    sseRes.write = chunk => { sseChunks.push(String(chunk)) }
    sseRes.end = () => { sseRes.destroyed = true }
    await sseHandler(sseReq, sseRes)
    sseRes.emit('close')
    assert.ok(sseChunks.some(c => c.includes('latency-audit.canvas.tsx')))
  } finally {
    await h.dispose()
    await rm(cwd, { recursive: true, force: true })
  }
})
