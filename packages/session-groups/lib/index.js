export const name = 'session-groups'
export const inject = ['storageDomain', 'webServer', 'connection']

export const STATE_PATH = '/session-groups/state'
export const OP_PATH = '/session-groups/op'
export const EVENTS_PATH = '/session-groups/events'
export const TOOL_NAME = 'session_groups'
export const ACTIONS = ['list', 'create', 'rename', 'delete', 'move_group', 'add', 'add_many', 'remove', 'pin']

const MAX_BODY_BYTES = 64 * 1024
const MAX_NAME = 80
const MAX_GROUPS = 200
const HEARTBEAT_MS = 25_000

export class OpError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpError'
  }
}

const isId = v => typeof v === 'string' && v.length > 0 && v.length <= 200

export function normalizeState(raw) {
  if (raw === null || typeof raw !== 'object' || !Array.isArray(raw.groups)) {
    throw new TypeError('session groups state must be an object with a groups array')
  }
  const seenGroups = new Set()
  const seenSessions = new Set()
  const groups = []
  for (const g of raw.groups) {
    if (g === null || typeof g !== 'object' || !isId(g.id) || seenGroups.has(g.id)) continue
    seenGroups.add(g.id)
    const sessionIds = []
    for (const id of Array.isArray(g.sessionIds) ? g.sessionIds : []) {
      if (isId(id) && !seenSessions.has(id)) { seenSessions.add(id); sessionIds.push(id) }
    }
    const members = new Set(sessionIds)
    const pinned = [...new Set(Array.isArray(g.pinned) ? g.pinned : [])].filter(id => members.has(id))
    const label = typeof g.name === 'string' && g.name.trim() ? g.name.trim().slice(0, MAX_NAME) : 'Group'
    groups.push({ id: g.id, name: label, sessionIds, pinned })
  }
  return { version: 1, groups }
}

export const STATE_SCHEMA = {
  parse: normalizeState,
  safeParse(value) {
    try { return { success: true, data: normalizeState(value) } } catch (error) { return { success: false, error } }
  },
}

export const DOMAIN_SPEC = {
  name: 'session_groups',
  version: 1,
  global: { schema: STATE_SCHEMA, initial: { version: 1, groups: [] } },
  tables: {},
}

const newGroupId = () => `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

function requireName(value) {
  const label = typeof value === 'string' ? value.trim() : ''
  if (!label) throw new OpError('name must be a non-empty string')
  return label.slice(0, MAX_NAME)
}

function requireGroup(state, groupId) {
  const group = state.groups.find(g => g.id === groupId)
  if (!group) throw new OpError(`group "${groupId}" does not exist`)
  return group
}

function requireSession(value) {
  if (!isId(value)) throw new OpError('sessionId must be a non-empty string')
  return value
}

const withoutSession = (groups, sessionId) => groups.map(g => g.sessionIds.includes(sessionId)
  ? { ...g, sessionIds: g.sessionIds.filter(id => id !== sessionId), pinned: g.pinned.filter(id => id !== sessionId) }
  : g)

export function applyOp(state, op) {
  const action = op?.action
  switch (action) {
    case 'list':
      return { state, result: {} }
    case 'create': {
      if (state.groups.length >= MAX_GROUPS) throw new OpError(`at most ${MAX_GROUPS} groups`)
      const group = { id: newGroupId(), name: requireName(op.name), sessionIds: [], pinned: [] }
      let groups = state.groups
      if (op.sessionId !== undefined) {
        const sessionId = requireSession(op.sessionId)
        groups = withoutSession(groups, sessionId)
        group.sessionIds.push(sessionId)
      } else if (op.sessionIds !== undefined) {
        if (!Array.isArray(op.sessionIds)) throw new OpError('sessionIds must be an array')
        const incoming = [...new Set(op.sessionIds.map(requireSession))]
        const moving = new Set(incoming)
        groups = groups.map(g => g.sessionIds.some(id => moving.has(id))
          ? { ...g, sessionIds: g.sessionIds.filter(id => !moving.has(id)), pinned: g.pinned.filter(id => !moving.has(id)) }
          : g)
        group.sessionIds.push(...incoming)
      }
      return { state: { ...state, groups: [...groups, group] }, result: { groupId: group.id } }
    }
    case 'rename': {
      const group = requireGroup(state, op.groupId)
      const label = requireName(op.name)
      if (group.name === label) return { state, result: {} }
      return { state: { ...state, groups: state.groups.map(g => g === group ? { ...g, name: label } : g) }, result: {} }
    }
    case 'delete': {
      const group = requireGroup(state, op.groupId)
      return { state: { ...state, groups: state.groups.filter(g => g !== group) }, result: {} }
    }
    case 'move_group': {
      const group = requireGroup(state, op.groupId)
      if (op.beforeGroupId !== undefined && op.beforeGroupId !== null) requireGroup(state, op.beforeGroupId)
      if (op.beforeGroupId === group.id) return { state, result: {} }
      const rest = state.groups.filter(g => g !== group)
      const at = op.beforeGroupId ? rest.findIndex(g => g.id === op.beforeGroupId) : rest.length
      rest.splice(at, 0, group)
      return { state: { ...state, groups: rest }, result: {} }
    }
    case 'add': {
      const group = requireGroup(state, op.groupId)
      const sessionId = requireSession(op.sessionId)
      if (group.sessionIds.includes(sessionId)) return { state, result: {} }
      const groups = withoutSession(state.groups, sessionId)
        .map(g => g.id === group.id ? { ...g, sessionIds: [...g.sessionIds, sessionId] } : g)
      return { state: { ...state, groups }, result: {} }
    }
    case 'add_many': {
      const group = requireGroup(state, op.groupId)
      if (!Array.isArray(op.sessionIds) || op.sessionIds.length === 0) throw new OpError('sessionIds must be a non-empty array')
      const incoming = [...new Set(op.sessionIds.map(requireSession))]
      const toAdd = incoming.filter(id => !group.sessionIds.includes(id))
      if (toAdd.length === 0) return { state, result: {} }
      const moving = new Set(toAdd)
      const groups = state.groups.map(g => {
        if (g.id === group.id) return { ...g, sessionIds: [...g.sessionIds, ...toAdd] }
        if (!g.sessionIds.some(id => moving.has(id))) return g
        return { ...g, sessionIds: g.sessionIds.filter(id => !moving.has(id)), pinned: g.pinned.filter(id => !moving.has(id)) }
      })
      return { state: { ...state, groups }, result: {} }
    }
    case 'remove': {
      const sessionId = requireSession(op.sessionId)
      if (!state.groups.some(g => g.sessionIds.includes(sessionId))) return { state, result: {} }
      return { state: { ...state, groups: withoutSession(state.groups, sessionId) }, result: {} }
    }
    case 'pin': {
      const sessionId = requireSession(op.sessionId)
      if (typeof op.pinned !== 'boolean') throw new OpError('pinned must be a boolean')
      const group = state.groups.find(g => g.sessionIds.includes(sessionId))
      if (!group) throw new OpError(`session "${sessionId}" is not in any group`)
      const isPinned = group.pinned.includes(sessionId)
      if (isPinned === op.pinned) return { state, result: {} }
      const pinned = op.pinned ? [sessionId, ...group.pinned] : group.pinned.filter(id => id !== sessionId)
      return { state: { ...state, groups: state.groups.map(g => g === group ? { ...g, pinned } : g) }, result: {} }
    }
    default:
      throw new OpError(`action must be one of ${ACTIONS.join(', ')}`)
  }
}

function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

// external: DSH reload can overlap storageDomain close and open
async function openDomain(ctx) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ctx.storageDomain.open(DOMAIN_SPEC)
    } catch (error) {
      if (error?.code !== 'already-open' || attempt >= 20) throw error
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
}

const TOOL_DESCRIPTION = [
  'Manage the user\'s custom session groups shown in the "Session groups" panel of the Web UI.',
  'A session belongs to at most one group; adding it to another group moves it. Pinned sessions lead their group.',
  'Actions: list; create {name, sessionId?, sessionIds?}; rename {groupId, name}; delete {groupId} (sessions are kept);',
  'move_group {groupId, beforeGroupId?} (omit beforeGroupId to move last); add {groupId, sessionId}; add_many {groupId, sessionIds}; remove {sessionId};',
  'pin {sessionId, pinned}. Every action returns the complete resulting groups.',
].join(' ')

export function apply(ctx) {
  let closed = false
  let tail = Promise.resolve()
  const ready = openDomain(ctx)
  ready.catch(error => ctx.logger?.warn?.(`session-groups: cannot open storage: ${error?.message ?? error}`))
  ctx.effect(() => async () => {
    closed = true
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'session-groups: storage domain')

  const streams = new Set()
  const broadcast = state => {
    if (streams.size === 0) return
    const frame = `data: ${JSON.stringify(state)}\n\n`
    for (const res of streams) {
      if (res.destroyed || res.writableEnded) { streams.delete(res); continue }
      try {
        if (res.writableLength > 1024 * 1024) { res.end(); streams.delete(res) }
        else res.write(frame)
      } catch {
        streams.delete(res)
      }
    }
  }

  const run = op => {
    const task = tail.then(async () => {
      if (closed) throw new OpError('session groups are unloading')
      const domain = await ready
      const current = domain.global.get()
      const { state, result } = applyOp(current, op)
      if (state !== current) {
        await domain.global.set(state)
        broadcast(state)
      }
      return { ...result, groups: state.groups }
    })
    tail = task.catch(() => {})
    return task
  }

  const rejected = (res, peer) => {
    if (peer?.principal?.kind === 'owner') return false
    res.statusCode = peer === undefined ? 401 : 403
    res.end()
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try {
        const domain = await ready
        sendJson(res, 200, { groups: domain.global.get().groups })
      } catch (error) {
        sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
    },
  }), `session-groups: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: OP_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let op = null
      try { op = JSON.parse(raw) } catch {}
      try {
        sendJson(res, 200, await run(op))
      } catch (error) {
        sendJson(res, error instanceof OpError ? 400 : 500, { message: error?.message ?? String(error) })
      }
    },
  }), `session-groups: POST ${OP_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: EVENTS_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      let domain
      try { domain = await ready } catch (error) {
        return sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
      if (res.destroyed) return
      if (closed) return sendJson(res, 503, { message: 'session groups are unloading' })
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      res.write(`retry: 3000\ndata: ${JSON.stringify(domain.global.get())}\n\n`)
      streams.add(res)
      let heartbeat = null
      const drop = () => { clearInterval(heartbeat); streams.delete(res) }
      heartbeat = setInterval(() => {
        if (res.destroyed || res.writableEnded) { drop(); return }
        res.write(': ping\n\n')
      }, HEARTBEAT_MS)
      heartbeat.unref?.()
      res.once('close', drop)
    },
  }), `session-groups: GET ${EVENTS_PATH}`)

  ctx.effect(() => () => {
    for (const res of streams) res.end()
    streams.clear()
  }, 'session-groups: close event streams')

  ctx.inject(['tools'], toolCtx => {
    toolCtx.effect(() => toolCtx.tools.register({
      name: TOOL_NAME,
      description: TOOL_DESCRIPTION,
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ACTIONS, description: 'Operation to perform.' },
          groupId: { type: 'string', description: 'Target group id (from list).' },
          beforeGroupId: { type: 'string', description: 'move_group: place before this group; omit to move last.' },
          name: { type: 'string', description: 'create/rename: group name.' },
          sessionId: { type: 'string', description: 'Session id for add/remove/pin, or the first member for create.' },
          sessionIds: { type: 'array', items: { type: 'string' }, description: 'Session ids for add_many or create.' },
          pinned: { type: 'boolean', description: 'pin: true to pin, false to unpin.' },
        },
        required: ['action'],
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      },
      async execute(args) {
        return await run(args)
      },
    }), `session-groups: ${TOOL_NAME} tool`)
  })
}
