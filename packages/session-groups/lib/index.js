/**
 * dsh-session-groups — Host half.
 *
 * Owns user-defined session groups: name, member sessions, and the pinned
 * members that lead each group. State is one validated document in the
 * `session_groups` storage domain (`~/.dsh/storages` with the json backend),
 * so every browser and the agent see the same groups.
 *
 * Every mutation goes through `applyOp`. The browser calls it over
 * `POST /session-groups/op`, follows changes on `GET /session-groups/events`
 * (SSE), and the agent calls it through the `session_groups` tool.
 */
export const name = 'session-groups'
export const inject = ['storageDomain', 'webServer', 'connection']

export const STATE_PATH = '/session-groups/state'
export const OP_PATH = '/session-groups/op'
export const EVENTS_PATH = '/session-groups/events'
export const TOOL_NAME = 'session_groups'
export const ACTIONS = ['list', 'create', 'rename', 'delete', 'move_group', 'add', 'remove', 'pin']

const MAX_BODY_BYTES = 64 * 1024
const MAX_NAME = 80
const MAX_GROUPS = 200
const HEARTBEAT_MS = 25_000

/** A rejected operation; the message is shown to the user or the agent. */
export class OpError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpError'
  }
}

const isId = v => typeof v === 'string' && v.length > 0 && v.length <= 200

/**
 * Normalize a stored or proposed state: drop malformed entries, keep each
 * session in at most one group (first wins), and keep `pinned` a subset of
 * `sessionIds`.
 */
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

/** Zod-shaped validator the storage domain calls at its durable boundary. */
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

/**
 * Apply one operation to a state.
 * @returns `{ state, result }`; `state` is the input reference when nothing changes.
 * @throws OpError for invalid input.
 */
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
      // A newly pinned session goes to the top of its group.
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

/** Open the domain, retrying while a previous generation of this plugin is still closing it. */
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
  'Actions: list; create {name, sessionId?}; rename {groupId, name}; delete {groupId} (sessions are not deleted);',
  'move_group {groupId, beforeGroupId?} (omit beforeGroupId to move last); add {groupId, sessionId}; remove {sessionId};',
  'pin {sessionId, pinned}. Every action returns the complete resulting groups.',
].join(' ')

export function apply(ctx) {
  let closed = false
  const ready = openDomain(ctx)
  ready.catch(error => ctx.logger?.warn?.(`session-groups: cannot open storage: ${error?.message ?? error}`))
  ctx.effect(() => () => {
    closed = true
    ready.then(domain => domain.close()).catch(() => {})
  }, 'session-groups: storage domain')

  const streams = new Set()
  const broadcast = state => {
    const frame = `data: ${JSON.stringify(state)}\n\n`
    for (const res of streams) res.write(frame)
  }

  // Mutations run one at a time so concurrent callers never lose a write.
  let tail = Promise.resolve()
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

  const rejected = (req, res) => {
    const rejection = ctx.connection.requestRejection(req)
    if (rejection === undefined) return false
    res.statusCode = rejection
    res.end()
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return
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
    handler: async (req, res) => {
      if (rejected(req, res)) return
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
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      let domain
      try { domain = await ready } catch (error) {
        return sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      res.write(`retry: 3000\ndata: ${JSON.stringify(domain.global.get())}\n\n`)
      streams.add(res)
      const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS)
      const drop = () => { clearInterval(heartbeat); streams.delete(res) }
      req.on('close', drop)
      res.on('close', drop)
    },
  }), `session-groups: GET ${EVENTS_PATH}`)

  ctx.effect(() => () => {
    for (const res of streams) res.end()
    streams.clear()
  }, 'session-groups: close event streams')

  // Agent tool: the same operations, available only where the tool registry exists.
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
