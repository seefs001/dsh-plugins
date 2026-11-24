import {
  classifyGhError,
  detectGitHubRepo,
  extractGitHubMentions,
  fetchGitHubOverview,
  normalizeHosts,
  rerunFailedJobs,
  resolveGitHubMentions,
  validateRepoTarget,
} from './github.js'

export const name = 'github-panel'
export const inject = ['webServer', 'sessionController', 'workingDirectory']

export const OVERVIEW_PATH = '/github-panel/overview'
export const ACTION_PATH = '/github-panel/action'
export const CONFIG_PATH = '/github-panel/config'

const DETECT_TTL_MS = 15_000
const OVERVIEW_TTL_MS = 60_000
const MENTIONS_TTL_MS = 45_000
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
  let allowedHosts = normalizeHosts(config?.hosts)
  const lifetime = new AbortController()
  const detectCache = new TtlCache(MAX_CACHE_ENTRIES)
  const overviewCache = new TtlCache(MAX_CACHE_ENTRIES)
  const mentionsCache = new TtlCache(MAX_CACHE_ENTRIES)

  ctx.effect(() => () => {
    lifetime.abort()
    detectCache.clear()
    overviewCache.clear()
    mentionsCache.clear()
  }, 'github-panel: cache and lifetime')

  async function resolveSessionContext(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId || sessionId.length > 200) {
      return { cwd: '', session: null }
    }
    try {
      const resolved = await ctx.sessionController.resolveAgent(sessionId)
      if (!resolved || 'error' in resolved || !resolved.agent) return { cwd: '', session: null }
      const session = resolved.agent.session
      const cwd = ctx.workingDirectory.get(session) ?? session?.header?.cwd ?? ''
      return { cwd, session }
    } catch {
      return { cwd: '', session: null }
    }
  }

  async function resolveRepoForCwd(cwd, force, signal) {
    if (!cwd) return null
    return detectCache.load(cwd, DETECT_TTL_MS, force, () => detectGitHubRepo(cwd, allowedHosts, signal))
  }

  async function resolveSessionMentions(session, target, force, signal) {
    if (!session || typeof session.snapshotEvents !== 'function') return []
    const events = session.snapshotEvents()
    const refs = extractGitHubMentions(events, target, allowedHosts)
    if (refs.length === 0) return []
    const cacheKey = refs.map(ref => ref.key).join('|')
    return mentionsCache.load(cacheKey, MENTIONS_TTL_MS, force, () => resolveGitHubMentions(refs, signal))
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
        const { cwd, session } = await resolveSessionContext(sessionId)
        const target = await resolveRepoForCwd(cwd, force, signal)

        const [overview, mentions] = await Promise.all([
          target
            ? overviewCache.load(
              `${target.host}/${target.fullName}`,
              OVERVIEW_TTL_MS,
              force,
              () => fetchGitHubOverview(target, signal),
            )
            : Promise.resolve(null),
          resolveSessionMentions(session, target, force, signal),
        ])

        if (!target) {
          sendJson(res, 200, { ok: true, value: { linked: false, mentions } })
          return
        }
        sendJson(res, 200, { ok: true, value: { ...overview, remote: target, mentions } })
      } catch (error) {
        sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : String(error) })
      } finally {
        cleanup()
      }
    },
  }), 'github-panel: overview route')

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
        let target = null
        if (body.owner && body.repo) {
          target = validateRepoTarget(body.host || 'github.com', body.owner, body.repo, allowedHosts)
        } else {
          const { cwd } = await resolveSessionContext(body.sessionId)
          target = await resolveRepoForCwd(cwd, false, signal)
        }
        if (!target) {
          sendJson(res, 404, { ok: false, message: 'No GitHub repository linked to this session.' })
          return
        }
        if (body.action === 'rerun-failed') {
          const result = await rerunFailedJobs(target, body.runId, signal)
          const prefix = `${target.host}/${target.fullName}`
          overviewCache.deletePrefix(prefix)
          mentionsCache.clear()
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

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: CONFIG_PATH,
    handler: async (req, res, peer) => {
      if (!requireOwner(res, peer)) return
      if (req.method === 'GET') {
        sendJson(res, 200, { ok: true, value: { hosts: [...allowedHosts] } })
        return
      }
      if (req.method !== 'POST') {
        res.writeHead(405, { allow: 'GET, POST' })
        res.end()
        return
      }
      try {
        const body = await readJsonBody(req)
        const nextSet = normalizeHosts(body.hosts)
        allowedHosts = nextSet
        const nextHosts = [...nextSet]
        detectCache.clear()
        overviewCache.clear()
        mentionsCache.clear()
        const entry = ctx.fiber?.entry
        const editor = ctx.get('configEditor')
        if (entry && editor) {
          await editor.edit(entry, current => ({ ...current, hosts: nextHosts }))
        }
        sendJson(res, 200, { ok: true, value: { hosts: nextHosts } })
      } catch (error) {
        sendJson(res, 400, { ok: false, message: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'github-panel: config route')
}
