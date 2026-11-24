import {
  classifyGhError,
  detectGitHubRepo,
  fetchGitHubDetail,
  fetchGitHubOverview,
  normalizeHosts,
  rerunFailedJobs,
} from './github.js'

export const name = 'github-panel'
export const inject = ['webServer', 'sessionController', 'workingDirectory']

export const OVERVIEW_PATH = '/github-panel/overview'
export const DETAIL_PATH = '/github-panel/detail'
export const ACTION_PATH = '/github-panel/action'

const DETECT_TTL_MS = 15_000
const OVERVIEW_TTL_MS = 60_000
const DETAIL_TTL_MS = 30_000
const MAX_CACHE_ENTRIES = 48
const MAX_BODY_BYTES = 16 * 1024

class TtlCache {
  constructor(maxEntries) {
    this.maxEntries = maxEntries
    this.entries = new Map()
    this.inflight = new Map()
  }

  get(key) {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key)
      return undefined
    }
    this.entries.delete(key)
    this.entries.set(key, entry)
    return entry.value
  }

  set(key, value, ttlMs) {
    this.entries.delete(key)
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs })
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value
      if (oldest === undefined) break
      this.entries.delete(oldest)
    }
  }

  deletePrefix(prefix) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key)
    }
  }

  async load(key, ttlMs, force, loader) {
    if (!force) {
      const hit = this.get(key)
      if (hit !== undefined) return hit
    }
    const existing = this.inflight.get(key)
    if (existing && !force) return existing
    const promise = Promise.resolve().then(loader).then(value => {
      this.set(key, value, ttlMs)
      return value
    }).finally(() => {
      if (this.inflight.get(key) === promise) this.inflight.delete(key)
    })
    this.inflight.set(key, promise)
    return promise
  }

  clear() {
    this.entries.clear()
    this.inflight.clear()
  }
}

function sendJson(res, status, data) {
  if (res.writableEnded || res.destroyed) return
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(data))
}

async function readJsonBody(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.byteLength
    if (bytes > MAX_BODY_BYTES) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Request body must be a JSON object')
  }
  return parsed
}

function parseQuery(req) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  return url.searchParams
}

function requireOwner(res, peer) {
  if (peer?.principal?.kind === 'owner') return true
  res.writeHead(peer === undefined ? 401 : 403)
  res.end()
  return false
}

export function apply(ctx, config = {}) {
  const allowedHosts = normalizeHosts(config?.hosts)
  const lifetime = new AbortController()
  const detectCache = new TtlCache(MAX_CACHE_ENTRIES)
  const overviewCache = new TtlCache(MAX_CACHE_ENTRIES)
  const detailCache = new TtlCache(MAX_CACHE_ENTRIES)

  ctx.effect(() => () => {
    lifetime.abort()
    detectCache.clear()
    overviewCache.clear()
    detailCache.clear()
  }, 'github-panel: cache and lifetime')

  async function resolveSessionCwd(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId || sessionId.length > 200) return ''
    try {
      const resolved = await ctx.sessionController.resolveAgent(sessionId)
      if (!resolved || 'error' in resolved || !resolved.agent) return ''
      const session = resolved.agent.session
      return ctx.workingDirectory.get(session) ?? session?.header?.cwd ?? ''
    } catch {
      return ''
    }
  }

  async function resolveRepoForSession(sessionId, force, signal) {
    const cwd = await resolveSessionCwd(sessionId)
    if (!cwd) return null
    return detectCache.load(cwd, DETECT_TTL_MS, force, () => detectGitHubRepo(cwd, allowedHosts, signal))
  }

  function makeSignal(res) {
    const requestAbort = new AbortController()
    const onClose = () => { if (!res.writableEnded) requestAbort.abort() }
    res.on?.('close', onClose)
    return {
      signal: AbortSignal.any([lifetime.signal, requestAbort.signal]),
      cleanup: () => res.off?.('close', onClose),
    }
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: OVERVIEW_PATH,
    handler: async (req, res, peer) => {
      if (!requireOwner(res, peer)) return
      if (req.method !== 'GET') {
        res.writeHead(405, { allow: 'GET' })
        res.end()
        return
      }
      const { signal, cleanup } = makeSignal(res)
      try {
        const params = parseQuery(req)
        const sessionId = params.get('sessionId') ?? ''
        const force = params.get('refresh') === '1'
        const target = await resolveRepoForSession(sessionId, force, signal)
        if (!target) {
          sendJson(res, 200, { ok: true, value: { linked: false } })
          return
        }
        const repoKey = `${target.host}/${target.fullName}`
        const value = await overviewCache.load(
          repoKey,
          OVERVIEW_TTL_MS,
          force,
          () => fetchGitHubOverview(target, signal),
        )
        sendJson(res, 200, { ok: true, value: { ...value, remote: target } })
      } catch (error) {
        sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : String(error) })
      } finally {
        cleanup()
      }
    },
  }), 'github-panel: overview route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: DETAIL_PATH,
    handler: async (req, res, peer) => {
      if (!requireOwner(res, peer)) return
      if (req.method !== 'GET') {
        res.writeHead(405, { allow: 'GET' })
        res.end()
        return
      }
      const { signal, cleanup } = makeSignal(res)
      try {
        const params = parseQuery(req)
        const sessionId = params.get('sessionId') ?? ''
        const kind = params.get('kind') ?? ''
        const id = params.get('id') ?? ''
        const force = params.get('refresh') === '1'
        const target = await resolveRepoForSession(sessionId, false, signal)
        if (!target) {
          sendJson(res, 404, { ok: false, message: 'No GitHub repository linked to this session.' })
          return
        }
        const cacheKey = `${target.host}/${target.fullName}:${kind}:${id}`
        const value = await detailCache.load(
          cacheKey,
          DETAIL_TTL_MS,
          force,
          () => fetchGitHubDetail(target, kind, id, signal),
        )
        sendJson(res, 200, { ok: true, value })
      } catch (error) {
        const info = classifyGhError(error, 'github.com')
        sendJson(res, 400, { ok: false, authState: info.authState, message: info.message })
      } finally {
        cleanup()
      }
    },
  }), 'github-panel: detail route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ACTION_PATH,
    handler: async (req, res, peer) => {
      if (!requireOwner(res, peer)) return
      if (req.method !== 'POST') {
        res.writeHead(405, { allow: 'POST' })
        res.end()
        return
      }
      const { signal, cleanup } = makeSignal(res)
      try {
        const body = await readJsonBody(req)
        const target = await resolveRepoForSession(body.sessionId, false, signal)
        if (!target) {
          sendJson(res, 404, { ok: false, message: 'No GitHub repository linked to this session.' })
          return
        }
        if (body.action === 'rerun-failed') {
          const result = await rerunFailedJobs(target, body.runId, signal)
          const prefix = `${target.host}/${target.fullName}`
          overviewCache.deletePrefix(prefix)
          detailCache.deletePrefix(`${prefix}:run:`)
          sendJson(res, 200, { ok: true, value: result })
          return
        }
        sendJson(res, 400, { ok: false, message: `Unsupported action: ${String(body.action ?? '')}` })
      } catch (error) {
        const info = classifyGhError(error, 'github.com')
        sendJson(res, 400, { ok: false, authState: info.authState, message: info.message })
      } finally {
        cleanup()
      }
    },
  }), 'github-panel: action route')
}
