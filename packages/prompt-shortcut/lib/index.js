export const name = 'prompt-shortcut'

export const STATE_PATH = '/prompt-shortcut/state'
export const OP_PATH = '/prompt-shortcut/op'

const MAX_ITEMS = 200
const MAX_TITLE = 120
const MAX_BODY = 16_000
const MAX_BODY_BYTES = 256 * 1024

class InputError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InputError'
  }
}

const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)

function normalizeItem(raw) {
  if (!isRecord(raw)) return null
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim().slice(0, 64) : ''
  const body = typeof raw.body === 'string' ? raw.body.slice(0, MAX_BODY) : ''
  if (!id || !body.trim()) return null
  const title = (typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : body.trim().split(/\r?\n/, 1)[0]).slice(0, MAX_TITLE)
  const pinnedAt = Number.isSafeInteger(raw.pinnedAt) && raw.pinnedAt > 0 ? raw.pinnedAt : 0
  const usedAt = Number.isSafeInteger(raw.usedAt) && raw.usedAt > 0 ? raw.usedAt : 0
  return { id, title, body, pinnedAt, usedAt }
}

function normalizeState(raw) {
  const s = isRecord(raw) ? raw : {}
  const seen = new Set()
  const items = []
  for (const entry of Array.isArray(s.items) ? s.items : []) {
    const clean = normalizeItem(entry)
    if (!clean || seen.has(clean.id)) continue
    seen.add(clean.id)
    items.push(clean)
    if (items.length >= MAX_ITEMS) break
  }
  return {
    version: 1,
    items,
    sampleHidden: s.sampleHidden === true,
  }
}

export const DOMAIN_SPEC = {
  name: 'prompt_shortcut',
  version: 1,
  global: {
    schema: {
      parse: normalizeState,
      safeParse(value) {
        try { return { success: true, data: normalizeState(value) } } catch (error) { return { success: false, error } }
      },
    },
    initial: { version: 1, items: [], sampleHidden: false },
  },
  tables: {},
}

function applyOp(state, op) {
  if (!isRecord(op) || typeof op.action !== 'string') throw new InputError('Invalid operation')
  if (op.action === 'upsert') {
    const item = normalizeItem(op.item)
    if (!item) throw new InputError('Invalid snippet item')
    const idx = state.items.findIndex(r => r.id === item.id)
    if (idx >= 0) {
      const items = state.items.map((r, i) => (i === idx ? { ...r, title: item.title, body: item.body } : r))
      return { ...state, items }
    }
    const items = [item, ...state.items].slice(0, MAX_ITEMS)
    return { ...state, items }
  }
  if (op.action === 'remove') {
    if (typeof op.id !== 'string' || !op.id) throw new InputError('id is required')
    const items = state.items.filter(r => r.id !== op.id)
    return { ...state, items }
  }
  if (op.action === 'restore') {
    const item = normalizeItem(op.item)
    if (!item) throw new InputError('Invalid snippet item')
    if (state.items.some(r => r.id === item.id)) return state
    const rawIndex = Number.isInteger(op.index) ? op.index : 0
    const index = Math.max(0, Math.min(rawIndex, state.items.length))
    const items = state.items.toSpliced(index, 0, item).slice(0, MAX_ITEMS)
    return { ...state, items }
  }
  if (op.action === 'pin') {
    if (typeof op.id !== 'string' || !op.id) throw new InputError('id is required')
    const pinnedAt = op.pinned ? Date.now() : 0
    const items = state.items.map(r => (r.id === op.id ? { ...r, pinnedAt } : r))
    return { ...state, items }
  }
  if (op.action === 'touch') {
    if (typeof op.id !== 'string' || !op.id) throw new InputError('id is required')
    const usedAt = Date.now()
    const items = state.items.map(r => (r.id === op.id ? { ...r, usedAt } : r))
    return { ...state, items }
  }
  if (op.action === 'sample') {
    return { ...state, sampleHidden: op.hidden === true }
  }
  if (op.action === 'import') {
    const incoming = Array.isArray(op.items) ? op.items.map(normalizeItem).filter(Boolean) : []
    const byId = new Map(state.items.map(r => [r.id, r]))
    const merged = [...state.items]
    for (const item of incoming) {
      if (byId.has(item.id)) continue
      byId.set(item.id, item)
      merged.push(item)
      if (merged.length >= MAX_ITEMS) break
    }
    const sampleHidden = typeof op.sampleHidden === 'boolean' ? op.sampleHidden : state.sampleHidden
    return { ...state, items: merged, sampleHidden }
  }
  throw new InputError(`Unsupported action: ${op.action}`)
}

function sendJson(res, status, value, headers = {}) {
  if (res.writableEnded || res.destroyed) return
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  })
  res.end(JSON.stringify(value))
}

async function readJsonBody(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.byteLength
    if (bytes > MAX_BODY_BYTES) throw new InputError('Request body is too large')
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new InputError('Invalid JSON body')
  }
}

// external: DSH plugin reload can start a new instance before the previous one closes storageDomain
async function openDomain(storageDomain) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await storageDomain.open(DOMAIN_SPEC)
    } catch (error) {
      if (attempt >= 20 || (error?.code !== 'already-open' && !/already open|lock|busy/i.test(String(error?.message ?? error)))) throw error
      await new Promise(resolve => setTimeout(resolve, 60 * (attempt + 1)))
    }
  }
}

export function apply(ctx) {
  ctx.inject(['storageDomain', 'webServer'], scope => {
    let closed = false
    let tail = Promise.resolve()
    const ready = openDomain(scope.storageDomain)
    ready.catch(error => ctx.logger?.warn?.(`prompt-shortcut: cannot open storage: ${error?.message ?? error}`))

    const write = change => {
      const task = tail.then(async () => {
        if (closed) throw new Error('prompt-shortcut is unloading')
        const domain = await ready
        if (closed) throw new Error('prompt-shortcut is unloading')
        const current = domain.global.get()
        const next = change(current)
        if (next !== current) await domain.global.set(next)
        return domain.global.get()
      })
      tail = task.catch(() => {})
      return task
    }

    scope.effect(() => async () => {
      closed = true
      await tail
      const domain = await ready.catch(() => null)
      await domain?.close()
    }, 'prompt-shortcut: storage')

    scope.effect(() => scope.webServer.register({
      kind: 'exact',
      path: STATE_PATH,
      handler: async (req, res, peer) => {
        if (peer?.principal?.kind !== 'owner') {
          sendJson(res, peer === undefined ? 401 : 403, { message: 'Unauthorized' })
          return
        }
        if (req.method !== 'GET') {
          sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
          return
        }
        try {
          const domain = await ready
          await tail
          sendJson(res, 200, domain.global.get())
        } catch (error) {
          sendJson(res, 503, { message: `storage unavailable: ${error instanceof Error ? error.message : String(error)}` })
        }
      },
    }), 'prompt-shortcut: state route')

    scope.effect(() => scope.webServer.register({
      kind: 'exact',
      path: OP_PATH,
      handler: async (req, res, peer) => {
        if (peer?.principal?.kind !== 'owner') {
          sendJson(res, peer === undefined ? 401 : 403, { message: 'Unauthorized' })
          return
        }
        if (req.method !== 'POST') {
          sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
          return
        }
        try {
          const body = await readJsonBody(req)
          const next = await write(state => applyOp(state, body))
          sendJson(res, 200, next)
        } catch (error) {
          sendJson(res, error instanceof InputError ? 400 : 500, { message: error instanceof Error ? error.message : String(error) })
        }
      },
    }), 'prompt-shortcut: op route')
  })
}
