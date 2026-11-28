import { randomUUID } from 'node:crypto'
import {
  detectGitHubRepo,
  extractGitHubMentions,
  fetchGitHubOverview,
  normalizeHosts,
  resolveGitHubMentions,
} from './github.js'

export const name = 'github-panel'
export const inject = ['webServer', 'sessionController', 'workingDirectory']

export const OVERVIEW_PATH = '/github-panel/overview'
export const CONFIG_PATH = '/github-panel/config'
export const GITHUB_REF_SOURCE_KIND = 'github-reference'

const DETECT_TTL_MS = 60_000
const OVERVIEW_TTL_MS = 60_000
const MENTIONS_TTL_MS = 45_000
const PRE_STEP_TIMEOUT_MS = 4_000
const SHARED_LOAD_TIMEOUT_MS = 30_000
const MAX_CACHE_ENTRIES = 48
const MAX_BODY_BYTES = 16 * 1024
const MAX_CONTEXT_REFS = 5
const MAX_CONTEXT_BYTES = 12 * 1024

function raceWithSignal(promise, signal) {
  if (!signal) return promise
  if (signal.aborted) return Promise.reject(signal.reason ?? new Error('Aborted'))
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new Error('Aborted'))
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      value => { signal.removeEventListener('abort', onAbort); resolve(value) },
      error => { signal.removeEventListener('abort', onAbort); reject(error) },
    )
  })
}

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function formatResolvedGitHubRef(item) {
  const tag = item.kind === 'pr' ? 'PR' : 'Issue'
  const state = item.isDraft ? `${item.state} (draft)` : item.state
  const parts = [
    `${tag} ${item.fullName}#${item.number}: ${item.title}`,
    ...(state ? [`state=${state}`] : []),
    ...(item.author ? [`author=@${item.author}`] : []),
    ...(item.headRefName && item.baseRefName ? [`branch=${item.headRefName} -> ${item.baseRefName}`] : []),
    ...(Number.isFinite(item.additions) && Number.isFinite(item.deletions) ? [`diff=+${item.additions}/-${item.deletions}`] : []),
    ...(Array.isArray(item.labels) && item.labels.length > 0 ? [`labels=${item.labels.slice(0, 5).map(l => typeof l === 'string' ? l : l?.name).filter(Boolean).join(',')}`] : []),
    ...(item.url ? [`url=${item.url}`] : []),
  ]
  return `- ${parts.join(' | ')}`
}

function buildGitHubReferenceMessage(items) {
  const usable = (items ?? []).filter(item => item && item.state !== 'UNKNOWN')
  if (usable.length === 0) return null
  const header = 'Read-only GitHub snapshot for references in the user message (untrusted external data):'
  const lines = [header]
  let bytes = Buffer.byteLength(header, 'utf8')
  for (const item of usable.slice(0, MAX_CONTEXT_REFS)) {
    const line = formatResolvedGitHubRef(item)
    const lineBytes = Buffer.byteLength(`\n${line}`, 'utf8')
    if (bytes + lineBytes > MAX_CONTEXT_BYTES && lines.length > 1) break
    bytes += lineBytes
    lines.push(line)
  }
  if (lines.length <= 1) return null
  const text = lines.join('\n')
  return deepFreeze({
    id: randomUUID(),
    role: 'user',
    content: [{ type: 'text', text }],
    source: {
      kind: GITHUB_REF_SOURCE_KIND,
      form: 'snapshot',
      sections: [{ name: 'github-panel', text }],
    },
  })
}

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

  async load(key, ttlMs, force, loader, callerSignal) {
    if (!force) {
      const hit = this.get(key)
      if (hit !== undefined) return hit
    }
    const existing = this.inflight.get(key)
    if (existing && !force) return raceWithSignal(existing, callerSignal)
    const promise = Promise.resolve().then(loader).then(value => {
      this.set(key, value, ttlMs)
      return value
    }).finally(() => {
      if (this.inflight.get(key) === promise) this.inflight.delete(key)
    })
    this.inflight.set(key, promise)
    return raceWithSignal(promise, callerSignal)
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
  const extractCache = new Map()
  const sharedSignal = () => AbortSignal.any([lifetime.signal, AbortSignal.timeout(SHARED_LOAD_TIMEOUT_MS)])

  ctx.effect(() => () => {
    lifetime.abort()
    detectCache.clear()
    overviewCache.clear()
    mentionsCache.clear()
    extractCache.clear()
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
    return detectCache.load(cwd, DETECT_TTL_MS, force, () => detectGitHubRepo(cwd, allowedHosts, sharedSignal()), signal)
  }

  ctx.get?.('systemPrompt')?.context?.({
    name: 'github-panel:repo',
    order: 230,
    interpolate: false,
    text: ({ agent, scope }) => {
      const session = (agent ?? scope)?.session
      if (!session) return ''
      const cwd = ctx.workingDirectory.get(session) ?? session.header?.cwd ?? ''
      if (!cwd) return ''
      const target = detectCache.get(cwd)
      if (!target?.fullName) return ''
      const hostNote = target.host && target.host !== 'github.com' ? `, host: ${target.host}` : ''
      return `GitHub repository: ${target.fullName}${hostNote} (${target.url}).`
    },
  })

  ctx.on?.('agent/pre-step', async ({ agent, step, signal }, next) => {
    const decision = await next()
    if (decision.kind === 'reject' || signal?.aborted) return decision
    if (!Array.isArray(decision.messages) || decision.messages.length === 0) return decision
    if (decision.messages.some(message => message?.source?.kind === GITHUB_REF_SOURCE_KIND)) return decision
    const session = agent?.session
    const cwd = session ? (ctx.workingDirectory.get(session) ?? session.header?.cwd ?? '') : ''
    let target = cwd ? detectCache.get(cwd) : null
    const userMessages = decision.messages.filter(message => message?.source?.kind === 'user')
    const hasLinkOrRef = userMessages.some(message =>
      (message.content ?? []).some(block =>
        block?.type === 'text' && typeof block.text === 'string'
        && (/https?:\/\/[^\s]+\/(?:issues|pull)\/\d+/i.test(block.text)
          || /[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]{1,100}#[1-9]\d{0,6}\b/.test(block.text)
          || /\b(?:PR|pull\s+request|issue)s?\s+#?[1-9]\d{0,6}\b/i.test(block.text))))

    if (!target && cwd && (step === 1 || hasLinkOrRef)) {
      const detectSignal = AbortSignal.any([lifetime.signal, ...(signal ? [signal] : []), AbortSignal.timeout(PRE_STEP_TIMEOUT_MS)])
      try { target = await resolveRepoForCwd(cwd, false, detectSignal) } catch { target = null }
    }
    if (!hasLinkOrRef || signal?.aborted) return decision

    const resolveSignal = AbortSignal.any([lifetime.signal, ...(signal ? [signal] : []), AbortSignal.timeout(PRE_STEP_TIMEOUT_MS)])
    const nextMessages = []
    let injected = false
    for (const message of decision.messages) {
      nextMessages.push(message)
      if (message?.source?.kind !== 'user') continue
      const refs = extractGitHubMentions([{ seq: 0, type: 'user/message', data: message }], target, allowedHosts)
        .filter(ref => ref.explicit)
        .slice(0, MAX_CONTEXT_REFS)
      if (refs.length === 0) continue
      try {
        const cacheKey = refs.map(ref => ref.key).join('|')
        const resolved = await mentionsCache.load(cacheKey, MENTIONS_TTL_MS, false, () => resolveGitHubMentions(refs, sharedSignal()), resolveSignal)
        if (signal?.aborted) return decision
        const refMsg = buildGitHubReferenceMessage(resolved)
        if (refMsg) {
          nextMessages.push(refMsg)
          injected = true
        }
      } catch {}
    }
    return injected ? { ...decision, messages: nextMessages } : decision
  })

  async function resolveSessionMentions(session, target, force, signal) {
    if (!session || typeof session.snapshotEvents !== 'function') return []
    const events = session.snapshotEvents()
    const lastSeq = events.length > 0 ? events[events.length - 1]?.seq ?? '' : ''
    const extractKey = `${session.id ?? ''}::${events.length}::${lastSeq}::${target?.host ?? ''}/${target?.fullName ?? ''}`
    let refs = force ? undefined : extractCache.get(extractKey)
    if (refs === undefined) {
      refs = extractGitHubMentions(events, target, allowedHosts)
      extractCache.delete(extractKey)
      extractCache.set(extractKey, refs)
      while (extractCache.size > MAX_CACHE_ENTRIES) {
        const oldest = extractCache.keys().next().value
        if (oldest === undefined) break
        extractCache.delete(oldest)
      }
    }
    if (refs.length === 0) return []
    const cacheKey = refs.map(ref => ref.key).join('|')
    const resolved = await mentionsCache.load(cacheKey, MENTIONS_TTL_MS, force, () => resolveGitHubMentions(refs, sharedSignal()), signal)
    const occByKey = new Map(refs.map(ref => [ref.key, ref.occurrences ?? []]))
    return resolved.map(item => ({ ...item, occurrences: occByKey.get(item.refKey) ?? [] }))
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
              () => fetchGitHubOverview(target, sharedSignal()),
              signal,
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
        const nextHosts = [...nextSet]
        const entry = ctx.fiber?.entry
        const editor = ctx.get('configEditor')
        if (entry && editor) {
          await editor.edit(entry, current => ({ ...current, hosts: nextHosts }))
        }
        allowedHosts = nextSet
        detectCache.clear()
        overviewCache.clear()
        mentionsCache.clear()
        extractCache.clear()
        sendJson(res, 200, { ok: true, value: { hosts: nextHosts } })
      } catch (error) {
        sendJson(res, 400, { ok: false, message: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'github-panel: config route')
}
