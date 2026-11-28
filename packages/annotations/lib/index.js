import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { isAbsolute, resolve as resolvePath } from 'node:path'
import {
  DOMAIN_SPEC,
  OpError,
  applyOp,
  formatAnnotationsContext,
  getSessionItems,
  markConsumed,
  pendingDraftItems,
  validSessionId,
} from './state.js'

export const name = 'annotations'
export const inject = ['storageDomain', 'webServer', 'connection']

export const STATE_PATH = '/annotations/state'
export const OP_PATH = '/annotations/op'
export const SOURCE_KIND = 'annotations'

const MAX_BODY_BYTES = 128 * 1024
const MAX_STALE_CHECK_BYTES = 512 * 1024

async function annotateOutdatedItems(items, cwd, signal) {
  if (!cwd || !Array.isArray(items) || items.length === 0) return items
  const cache = new Map()
  const out = []
  for (const item of items) {
    if (signal?.aborted) return out.concat(items.slice(out.length))
    const anchor = item?.anchor
    if (anchor?.kind !== 'git-diff' || anchor.source !== 'local' || anchor.side !== 'R' || !anchor.path || !anchor.snippet) {
      out.push(item)
      continue
    }
    const snippet = anchor.snippet.trim()
    if (!snippet) {
      out.push(item)
      continue
    }
    const target = isAbsolute(anchor.path) ? anchor.path : resolvePath(cwd, anchor.path)
    let text = cache.get(target)
    if (text === undefined) {
      try {
        const buf = await readFile(target)
        text = buf.byteLength <= MAX_STALE_CHECK_BYTES ? buf.toString('utf8').replace(/\r\n?/g, '\n') : null
      } catch {
        text = null
      }
      cache.set(target, text)
    }
    if (text !== null && !text.includes(snippet)) {
      out.push({ ...item, status: 'outdated' })
    } else {
      out.push(item)
    }
  }
  return out
}

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function buildInjectedMessage(formatted, turn) {
  return deepFreeze(structuredClone({
    id: randomUUID(),
    role: 'user',
    content: [{ type: 'text', text: formatted.text }],
    source: {
      kind: SOURCE_KIND,
      form: 'notice',
      summary: formatted.summary,
      annotationIds: formatted.annotationIds,
      ...(Number.isInteger(turn) && turn > 0 ? { turn } : {}),
    },
  }))
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

function sessionIdFromQuery(req) {
  try {
    const url = new URL(req.url ?? '', 'http://localhost')
    return url.searchParams.get('sessionId') ?? ''
  } catch {
    return ''
  }
}

export function apply(ctx) {
  let closed = false
  let tail = Promise.resolve()
  const ready = openDomain(ctx)
  ready.catch(error => ctx.logger?.warn?.(`annotations: cannot open storage: ${error?.message ?? error}`))

  ctx.effect(() => async () => {
    closed = true
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'annotations: storage domain')

  const run = op => {
    const task = tail.then(async () => {
      if (closed) throw new OpError('annotations plugin is unloading')
      const domain = await ready
      const current = domain.global.get()
      const { state, result } = applyOp(current, op)
      if (state !== current) await domain.global.set(state)
      return result
    })
    tail = task.catch(() => {})
    return task
  }

  const consumeIds = (sessionId, ids, turn) => {
    const task = tail.then(async () => {
      if (closed) return
      const domain = await ready
      const current = domain.global.get()
      const next = markConsumed(current, sessionId, ids, turn)
      if (next !== current) await domain.global.set(next)
    })
    tail = task.catch(() => {})
    return task
  }

  ctx.on('session/event', (session, event) => {
    if (event?.type !== 'user/message') return
    const source = event.data?.source
    if (source?.kind !== SOURCE_KIND || !Array.isArray(source.annotationIds) || source.annotationIds.length === 0) return
    const sessionId = typeof session?.id === 'string' ? session.id : ''
    if (!sessionId) return
    void consumeIds(sessionId, source.annotationIds, source.turn)
  }, { global: true })

  ctx.on('agent/pre-step', async ({ agent, turn, signal }, next) => {
    const decision = await next()
    if (decision.kind === 'reject' || signal?.aborted) return decision
    if (!Array.isArray(decision.messages) || decision.messages.length === 0) return decision
    if (decision.messages.some(message => message?.source?.kind === SOURCE_KIND)) return decision
    const firstUserIndex = decision.messages.findIndex(message => message?.source?.kind === 'user')
    if (firstUserIndex < 0) return decision

    const sessionId = typeof agent?.session?.id === 'string'
      ? agent.session.id
      : (typeof agent?.id === 'string' ? agent.id : '')
    if (!validSessionId(sessionId)) return decision

    let pending = []
    try {
      await tail
      if (closed || signal?.aborted) return decision
      const domain = await ready
      pending = pendingDraftItems(domain.global.get(), sessionId)
    } catch {
      return decision
    }
    if (pending.length === 0) return decision

    const cwd = ctx.get?.('workingDirectory')?.get?.(agent?.session) ?? agent?.session?.header?.cwd ?? ''
    const checked = await annotateOutdatedItems(pending, cwd, signal)
    if (closed || signal?.aborted) return decision

    const formatted = formatAnnotationsContext(checked, turn)
    if (!formatted) return decision
    const injected = buildInjectedMessage(formatted, turn)
    const messages = [
      ...decision.messages.slice(0, firstUserIndex),
      injected,
      ...decision.messages.slice(firstUserIndex),
    ]
    return { ...decision, messages }
  })

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
      const sessionId = sessionIdFromQuery(req)
      if (!validSessionId(sessionId)) return sendJson(res, 400, { message: 'sessionId query parameter is required' })
      try {
        await tail
        const domain = await ready
        const state = domain.global.get()
        const bucket = state.sessions[sessionId.trim()]
        sendJson(res, 200, {
          sessionId: sessionId.trim(),
          items: getSessionItems(state, sessionId),
          updatedAt: bucket?.updatedAt ?? 0,
        })
      } catch (error) {
        sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
    },
  }), `annotations: GET ${STATE_PATH}`)

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
  }), `annotations: POST ${OP_PATH}`)
}

export {
  ACTIONS,
  DOMAIN_SPEC,
  OpError,
  applyOp,
  formatAnnotationsContext,
  getSessionItems,
  markConsumed,
  pendingDraftItems,
} from './state.js'
