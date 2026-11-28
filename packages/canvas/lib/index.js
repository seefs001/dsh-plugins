import { randomUUID } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { compileArtifact, formatDiagnosticsSummary, getSdkDeclarations } from './compiler.js'
import {
  createDataDirectoryWatcher,
  getBotsRootDir,
  globCanvasData,
  isWithinOrEqual,
  parseDataUri,
  patchCanvasDataFile,
  readCanvasDataFile,
  readGitHostData,
  staticPrefixOfGlob,
} from './data.js'
import {
  buildSystemPromptSection,
  CANVAS_TEMPLATES,
  SKILL_CONTENT,
  SKILL_DESCRIPTION,
  SKILL_NAME,
  SKILL_WHEN_TO_USE,
  STARTER_TEMPLATE,
} from './skill.js'
import { appendRevision, DOMAIN_SPEC, MAX_STATE_JSON_BYTES, MAX_STATE_KEYS, storageKeyOf } from './store.js'
import {
  computeLineDiff,
  createWorkspaceWatcher,
  deleteCanvasFile,
  discoverCanvasFiles,
  getArtifactKind,
  normalizeSlug,
  readCanvasFile,
  resolveCanvasPath,
  writeCanvasFile,
} from './workspace.js'

export const name = 'canvas'
export const inject = ['storageDomain', 'webServer', 'connection', 'systemPrompt']

export const STATE_PATH = '/canvas/state'
export const OP_PATH = '/canvas/op'
export const EVENTS_PATH = '/canvas/events'
export const PROVIDER_NAME = 'dsh-canvas'

const MAX_BODY_BYTES = 512 * 1024
const HEARTBEAT_MS = 25_000
const CONTEXT_SUMMARY_MAX_CHARS = 120
const MAX_CONTEXT_STATE_CHARS = 1600
const CANVAS_SOURCE_KIND = 'canvas'
const MAX_SESSIONS = 200
const MAX_STATES = 200
const MAX_REVISIONS = 120
const MAX_DIFF_CACHE = 128

async function deleteTableKeys(table, keys) {
  if (keys.length === 0) return
  if (typeof table.deleteMany === 'function') {
    await table.deleteMany(keys)
    return
  }
  for (const key of keys) await table.delete(key)
}

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function boundSummary(summary) {
  const clean = String(summary ?? '').replace(/\s+/gu, ' ').trim()
  return clean.length <= CONTEXT_SUMMARY_MAX_CHARS
    ? clean
    : `${clean.slice(0, CONTEXT_SUMMARY_MAX_CHARS - 1)}…`
}

function compactStatePreview(values) {
  if (!values || typeof values !== 'object') return ''
  const keys = Object.keys(values)
  if (keys.length === 0) return ''
  const raw = JSON.stringify(values)
  if (!raw || raw === '{}') return ''
  return raw.length <= MAX_CONTEXT_STATE_CHARS
    ? raw
    : `${raw.slice(0, MAX_CONTEXT_STATE_CHARS)}… (${raw.length} chars)`
}

function relativeDisplayPath(cwd, fullPath) {
  if (!fullPath) return ''
  if (!cwd) return fullPath
  const rel = relative(cwd, fullPath)
  return rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel : fullPath
}

export class OpError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpError'
  }
}

function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extraHeaders,
  })
  res.end(body)
}

async function readBody(req) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    total += buf.length
    if (total > MAX_BODY_BYTES) return null
    chunks.push(buf)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function isSessionId(v) {
  return typeof v === 'string' && v.length > 0 && v.length <= 200
}

// external: DSH plugin reload can start a new instance before the previous one closes storageDomain
async function openDomain(ctx) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ctx.storageDomain.open(DOMAIN_SPEC)
    } catch (error) {
      if (error?.code !== 'already-open' || attempt >= 20) throw error
      await new Promise(done => setTimeout(done, 250))
    }
  }
}

export function apply(ctx) {
  let closed = false
  let tail = Promise.resolve()
  let dataTick = 0

  const sessionMap = new Map()
  const stateMap = new Map()
  const revisionMap = new Map()
  const compileCache = new Map()
  const diffCache = new Map()
  const watchers = new Map()
  const streams = new Set()
  const agentHandles = new Map()
  const watchedDataDirs = new Set()

  const ready = openDomain(ctx).then(domain => {
    for (const [key, entry] of domain.table('sessions').entries()) sessionMap.set(entry?.sessionId || key, entry)
    for (const [key, entry] of domain.table('states').entries()) stateMap.set(entry?.path || key, entry)
    for (const [key, entry] of domain.table('revisions').entries()) revisionMap.set(entry?.path || key, entry)
    return domain
  })
  ready.catch(error => ctx.logger?.warn?.(`canvas: cannot open storage: ${error?.message ?? error}`))

  const dataWatcher = createDataDirectoryWatcher(() => {
    dataTick += 1
    broadcastDataTick()
  })

  const agentCwd = agent => ctx.get('workingDirectory')?.get(agent?.session) ?? agent?.session?.header?.cwd ?? ''

  const resolveSessionCwd = (sessionId, fallbackCwd = '') => {
    for (const agent of agentHandles.keys()) {
      if (agent.session?.id === sessionId) {
        const live = agentCwd(agent)
        if (live) return live
      }
    }
    if (typeof fallbackCwd === 'string' && fallbackCwd.trim()) return fallbackCwd.trim()
    return sessionMap.get(sessionId)?.cwd ?? ''
  }

  const isEnabled = sessionId => Boolean(sessionMap.get(sessionId)?.enabled)

  function broadcastDataTick() {
    if (closed) return
    const payload = `event: data\ndata: ${JSON.stringify({ dataTick })}\n\n`
    for (const stream of streams) {
      if (stream.res.destroyed || stream.res.writableEnded) {
        streams.delete(stream)
        continue
      }
      try {
        stream.res.write(payload)
      } catch {
        streams.delete(stream)
      }
    }
  }

  function registerWatchedDir(dir) {
    if (!dir || closed) return
    watchedDataDirs.add(dir)
    dataWatcher.sync([...watchedDataDirs])
  }

  function pruneIdleWatchers() {
    if (streams.size === 0) {
      for (const entry of watchers.values()) entry.watcher.close()
      watchers.clear()
      if (watchedDataDirs.size > 0) {
        watchedDataDirs.clear()
        dataWatcher.sync([])
      }
      return
    }
    const activeCwds = new Set()
    for (const stream of streams) {
      const c = resolveSessionCwd(stream.sessionId, stream.cwd)
      if (c) activeCwds.add(c)
    }
    for (const [cwd, entry] of watchers) {
      if (!activeCwds.has(cwd)) {
        entry.watcher.close()
        watchers.delete(cwd)
      }
    }
  }

  async function pruneMapTable(map, table, maxEntries) {
    if (map.size <= maxEntries) return
    const sorted = [...map.entries()].toSorted((a, b) => (a[1]?.updatedAt ?? 0) - (b[1]?.updatedAt ?? 0))
    const excess = sorted.slice(0, map.size - maxEntries)
    const keys = []
    for (const [k] of excess) {
      map.delete(k)
      keys.push(storageKeyOf(k))
    }
    await deleteTableKeys(table, keys)
  }

  async function saveSessionEntry(sessionId, patch) {
    const domain = await ready
    const prev = sessionMap.get(sessionId) ?? { enabled: false, cwd: '', activePath: '', updatedAt: 0 }
    const next = {
      sessionId,
      enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : prev.enabled,
      cwd: patch.cwd !== undefined ? patch.cwd : prev.cwd,
      activePath: patch.activePath !== undefined ? patch.activePath : prev.activePath,
      updatedAt: Date.now(),
    }
    await domain.table('sessions').put(storageKeyOf(sessionId), next)
    sessionMap.set(sessionId, next)
    await pruneMapTable(sessionMap, domain.table('sessions'), MAX_SESSIONS)
    return next
  }

  async function saveStateEntry(filePath, values) {
    const domain = await ready
    const keys = Object.keys(values)
    if (keys.length > MAX_STATE_KEYS) throw new OpError(`Canvas state exceeds ${MAX_STATE_KEYS} keys`)
    if (Buffer.byteLength(JSON.stringify(values), 'utf8') > MAX_STATE_JSON_BYTES) {
      throw new OpError(`Canvas state exceeds ${MAX_STATE_JSON_BYTES} bytes`)
    }
    const next = { path: filePath, values, updatedAt: Date.now() }
    await domain.table('states').put(storageKeyOf(filePath), next)
    stateMap.set(filePath, next)
    await pruneMapTable(stateMap, domain.table('states'), MAX_STATES)
    return next
  }

  async function recordRevision(filePath, source, reason, errorCount) {
    const domain = await ready
    const existing = revisionMap.get(filePath)
    const { changed, entry } = appendRevision(existing, { source, reason, errorCount })
    if (changed) {
      const stored = { ...entry, path: filePath, updatedAt: Date.now() }
      await domain.table('revisions').put(storageKeyOf(filePath), stored)
      revisionMap.set(filePath, stored)
      await pruneMapTable(revisionMap, domain.table('revisions'), MAX_REVISIONS)
      return stored
    }
    return entry
  }

  const MAX_COMPILE_CACHE = 64

  function compileCached(filePath, source, kind) {
    const cacheKey = `${filePath}::${kind}`
    const cached = compileCache.get(cacheKey)
    if (cached && cached.source === source) {
      compileCache.delete(cacheKey)
      compileCache.set(cacheKey, cached)
      return cached.result
    }
    const result = compileArtifact(source, kind)
    compileCache.delete(cacheKey)
    compileCache.set(cacheKey, { source, result })
    if (compileCache.size > MAX_COMPILE_CACHE) {
      const oldest = compileCache.keys().next().value
      if (oldest !== undefined) compileCache.delete(oldest)
    }
    return result
  }

  function clearCompileCache(filePath) {
    for (const key of compileCache.keys()) {
      if (key.startsWith(`${filePath}::`)) compileCache.delete(key)
    }
  }

  function cachedRevisionSummaries(filePath, entries) {
    const first = entries[0]?.revision ?? 0
    const last = entries[entries.length - 1]
    const cacheKey = `${filePath}::${first}::${last?.revision ?? 0}::${last?.time ?? 0}::${entries.length}`
    const cached = diffCache.get(cacheKey)
    if (cached) {
      diffCache.delete(cacheKey)
      diffCache.set(cacheKey, cached)
      return cached
    }
    const revisions = entries.map((entry, idx) => ({
      revision: entry.revision,
      time: entry.time,
      reason: entry.reason,
      errorCount: entry.errorCount,
      diff: computeLineDiff(idx > 0 ? entries[idx - 1].source : '', entry.source),
    }))
    diffCache.set(cacheKey, revisions)
    if (diffCache.size > MAX_DIFF_CACHE) {
      const oldest = diffCache.keys().next().value
      if (oldest !== undefined) diffCache.delete(oldest)
    }
    return revisions
  }

  function clearDiffCache(filePath) {
    const prefix = `${filePath}::`
    for (const key of diffCache.keys()) {
      if (key.startsWith(prefix)) diffCache.delete(key)
    }
  }

  async function buildCanvasRecord(cwd, filePath, reason) {
    const file = await readCanvasFile(cwd, filePath)
    const kind = file.kind ?? getArtifactKind(file.path)
    const compiled = compileCached(file.path, file.source, kind)
    const errorCount = compiled.diagnostics.filter(d => d.severity === 'error').length
    const revEntry = await recordRevision(file.path, file.source, reason ?? 'Disk sync', errorCount)
    const state = stateMap.get(file.path)?.values ?? {}
    const revisions = cachedRevisionSummaries(file.path, revEntry.entries)
    return {
      path: file.path,
      relativePath: file.relativePath,
      name: file.name,
      kind,
      title: file.title,
      source: file.source,
      compiled: compiled.compiled,
      ok: compiled.ok,
      diagnostics: compiled.diagnostics,
      errorCount,
      mtimeMs: file.mtimeMs,
      size: file.size,
      state,
      revision: revEntry.entries[revEntry.entries.length - 1]?.revision ?? 1,
      revisions,
    }
  }

  function ensureWatcher(cwd, files) {
    if (!cwd || closed) return
    let entry = watchers.get(cwd)
    if (!entry) {
      entry = {
        watcher: createWorkspaceWatcher(cwd, () => {
          broadcastForCwd(cwd).catch(() => {})
        }),
      }
      watchers.set(cwd, entry)
    }
    entry.watcher.sync(files)
  }

  async function snapshotForSession(sessionId, fallbackCwd = '') {
    await ready
    const entry = sessionMap.get(sessionId) ?? { enabled: false, cwd: '', activePath: '', updatedAt: 0 }
    const cwd = resolveSessionCwd(sessionId, fallbackCwd)
    const files = cwd ? await discoverCanvasFiles(cwd) : []
    if (cwd && (entry.enabled || files.length > 0)) ensureWatcher(cwd, files)

    const canvases = []
    for (const filePath of files) {
      try {
        canvases.push(await buildCanvasRecord(cwd, filePath))
      } catch {}
    }

    const activePath = canvases.some(c => c.path === entry.activePath)
      ? entry.activePath
      : canvases[0]?.path ?? ''

    return {
      sessionId,
      enabled: entry.enabled,
      cwd,
      activePath,
      canvases,
      dataTick,
    }
  }

  async function broadcastSession(sessionId, precomputed = null) {
    const byCwd = new Map()
    if (precomputed) byCwd.set(precomputed.cwd ?? '', precomputed)
    for (const stream of streams) {
      if (stream.sessionId !== sessionId) continue
      if (stream.res.destroyed || stream.res.writableEnded) {
        streams.delete(stream)
        continue
      }
      try {
        const targetCwd = resolveSessionCwd(stream.sessionId, stream.cwd)
        let snap = byCwd.get(targetCwd)
        if (!snap) {
          snap = await snapshotForSession(stream.sessionId, stream.cwd)
          byCwd.set(targetCwd, snap)
        }
        if (stream.res.destroyed || stream.res.writableEnded) {
          streams.delete(stream)
          continue
        }
        stream.res.write(`data: ${JSON.stringify(snap)}\n\n`)
      } catch {
        streams.delete(stream)
      }
    }
  }

  async function broadcastForCwd(cwd) {
    const seen = new Set()
    for (const stream of streams) {
      const streamCwd = resolveSessionCwd(stream.sessionId, stream.cwd)
      if (streamCwd !== cwd) continue
      if (seen.has(stream.sessionId)) continue
      seen.add(stream.sessionId)
      await broadcastSession(stream.sessionId)
    }
  }

  async function queryHostSource(source, params, cwd) {
    if (source === 'git') {
      const targetCwd = typeof params?.cwd === 'string' && isAbsolute(params.cwd) ? params.cwd : cwd
      return { ok: true, data: await readGitHostData(targetCwd), error: '' }
    }
    if (source === 'schedules') {
      const sched = ctx.get('schedule')
      if (!sched) return { ok: true, data: [], error: '' }
      try {
        const list = typeof sched.catalog === 'function'
          ? await sched.catalog()
          : (await sched.list?.({ limit: 100, offset: 0 }))?.items ?? []
        const activeFilter = params?.active
        const items = list
          .filter(item => activeFilter === undefined || (item.status === 'active') === Boolean(activeFilter))
          .map(item => ({
            id: String(item.id ?? ''),
            title: String(item.title ?? ''),
            status: String(item.status ?? ''),
            scheduledAt: String(item.scheduledAt ?? ''),
            scheduledAtLocal: String(item.scheduledAtLocal ?? ''),
            targetKind: String(item.target?.kind ?? ''),
            targetSessionId: String(item.target?.sessionId ?? ''),
          }))
        return { ok: true, data: items, error: '' }
      } catch (error) {
        return { ok: false, data: [], error: error?.message ?? String(error) }
      }
    }
    if (source === 'sessions') {
      const ctrl = ctx.get('sessionController')
      if (!ctrl?.list) {
        const items = [...agentHandles.keys()].map(agent => ({
          id: String(agent.session?.id ?? ''),
          title: String(agent.session?.header?.title ?? agent.session?.id ?? ''),
          cwd: agentCwd(agent),
          status: String(agent.status ?? 'idle'),
          updatedAt: Date.now(),
        }))
        return { ok: true, data: items, error: '' }
      }
      try {
        const res = await ctrl.list({}, AbortSignal.timeout(10_000))
        const rawItems = Array.isArray(res?.items) ? res.items : []
        const filterCwd = typeof params?.cwd === 'string' && params.cwd.trim() ? resolve(params.cwd.trim()) : ''
        const items = rawItems
          .filter(s => !filterCwd || (typeof s.cwd === 'string' && resolve(s.cwd) === filterCwd))
          .slice(0, 60)
          .map(s => ({
            id: String(s.id ?? s.sessionId ?? ''),
            title: String(s.title ?? s.name ?? s.id ?? ''),
            cwd: String(s.cwd ?? ''),
            status: String(s.status ?? 'idle'),
            updatedAt: Number(s.updatedAt ?? s.lastActiveAt ?? 0),
          }))
        return { ok: true, data: items, error: '' }
      } catch (error) {
        return { ok: false, data: [], error: error?.message ?? String(error) }
      }
    }
    return { ok: false, data: null, error: `Unknown host data source "${String(source)}".` }
  }

  async function queryDataSubscriptions(subscriptions, cwd) {
    const filesOut = {}
    const globsOut = {}
    const hostOut = {}

    const fileSpecs = subscriptions?.files && typeof subscriptions.files === 'object' ? subscriptions.files : {}
    for (const [key, spec] of Object.entries(fileSpecs)) {
      if (!spec || typeof spec.uri !== 'string') continue
      const res = await readCanvasDataFile(spec.uri, { cwd, parse: spec.parse ?? 'auto' })
      filesOut[key] = res
      try {
        const parsed = parseDataUri(spec.uri, cwd)
        registerWatchedDir(parsed.scheme === 'bots' ? getBotsRootDir() : dirname(parsed.full))
      } catch {}
    }

    const globSpecs = subscriptions?.globs && typeof subscriptions.globs === 'object' ? subscriptions.globs : {}
    for (const [key, spec] of Object.entries(globSpecs)) {
      if (!spec || typeof spec.pattern !== 'string') continue
      const res = await globCanvasData(spec.pattern, { cwd, parse: spec.parse ?? 'auto', limit: spec.limit })
      globsOut[key] = res
      if (spec.pattern.startsWith('bots://')) {
        registerWatchedDir(getBotsRootDir())
      } else if (spec.pattern.startsWith('workspace://') && cwd) {
        const root = resolve(cwd)
        const relPattern = spec.pattern.slice('workspace://'.length).replace(/^\/+/, '')
        const prefix = staticPrefixOfGlob(relPattern)
        const narrowed = prefix ? resolve(root, prefix) : root
        const useNarrowed = prefix && isWithinOrEqual(root, narrowed)
          && await stat(narrowed).then(info => info.isDirectory()).catch(() => false)
        registerWatchedDir(useNarrowed ? narrowed : root)
      }
    }

    const hostSpecs = subscriptions?.host && typeof subscriptions.host === 'object' ? subscriptions.host : {}
    for (const [key, spec] of Object.entries(hostSpecs)) {
      if (!spec || typeof spec.source !== 'string') continue
      hostOut[key] = await queryHostSource(spec.source, spec.params, cwd)
    }

    return { files: filesOut, globs: globsOut, host: hostOut, dataTick }
  }

  function syncAgent(agent) {
    const handle = agentHandles.get(agent)
    if (!handle) return
    const sid = agent.session?.id
    const active = isSessionId(sid) && isEnabled(sid)
    if (handle.active === active) return
    handle.active = active

    if (!active) {
      handle.toolsFiber?.dispose().catch(() => {})
      handle.toolsFiber = null
      handle.skillControl?.invalidate()
      return
    }

    handle.toolsFiber = agent.ctx.inject(['tools'], toolScope => {
      toolScope.effect(() => toolScope.tools.register({
        name: 'canvas_write',
        description: 'Create or update a Canvas artifact (.canvas.tsx, .canvas.html, or .canvas.svg) in the session workspace, run validation/type-checking, and refresh live preview.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Canvas slug (e.g. "latency-audit") or path ending in .canvas.tsx, .canvas.html, or .canvas.svg.' },
            source: { type: 'string', description: 'Complete source code for the artifact.' },
            reason: { type: 'string', description: 'Short revision summary shown in the Canvas history tab.' },
          },
          required: ['path', 'source'],
          additionalProperties: false,
        },
        output: {
          schema: { type: 'object' },
          render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
        },
        async execute(args, exec) {
          await ready
          const targetSid = exec?.agent?.session?.id ?? agent.session?.id
          const cwd = agentCwd(exec?.agent ?? agent) || resolveSessionCwd(targetSid)
          if (!cwd) throw new Error('Session has no workspace directory (cwd).')
          const saved = await writeCanvasFile(cwd, args.path, args.source)
          clearCompileCache(saved.path)
          const record = await buildCanvasRecord(cwd, saved.path, args.reason ?? 'Agent update')
          await saveSessionEntry(targetSid, { cwd, activePath: saved.path })
          await broadcastSession(targetSid)
          return {
            ok: record.ok,
            path: record.path,
            relativePath: record.relativePath,
            kind: record.kind,
            title: record.title,
            revision: record.revision,
            errorCount: record.errorCount,
            diagnostics: record.diagnostics,
            summary: formatDiagnosticsSummary(record.diagnostics),
          }
        },
      }), 'canvas: canvas_write tool')

      toolScope.effect(() => toolScope.tools.register({
        name: 'canvas_check',
        description: 'Run policy and TypeScript diagnostics on a Canvas artifact source string or existing file without saving.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Existing canvas slug or path to check.' },
            source: { type: 'string', description: 'Optional source string to check instead of reading from disk.' },
            kind: { type: 'string', enum: ['react', 'html', 'svg'], description: 'Artifact kind when checking raw source.' },
          },
          additionalProperties: false,
        },
        output: {
          schema: { type: 'object' },
          render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
        },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
          let source = args.source
          let kind = args.kind ?? 'react'
          if (typeof source !== 'string') {
            const targetSid = exec?.agent?.session?.id ?? agent.session?.id
            const cwd = agentCwd(exec?.agent ?? agent) || resolveSessionCwd(targetSid)
            if (!cwd) throw new Error('Session has no workspace directory (cwd).')
            if (!args.path) throw new Error('Provide either source or path.')
            const file = await readCanvasFile(cwd, args.path)
            source = file.source
            kind = file.kind
          } else if (typeof args.path === 'string' && args.path) {
            kind = getArtifactKind(args.path)
          }
          const result = compileArtifact(source, kind)
          return {
            ok: result.ok,
            kind,
            errorCount: result.diagnostics.filter(d => d.severity === 'error').length,
            diagnostics: result.diagnostics,
            summary: formatDiagnosticsSummary(result.diagnostics),
          }
        },
      }), 'canvas: canvas_check tool')

      toolScope.effect(() => toolScope.tools.register({
        name: 'canvas_state',
        description: 'Read the current persisted interactive useCanvasState values (user selections, filters, edits) for a workspace Canvas file.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Canvas slug or path ending in .canvas.tsx, .canvas.html, or .canvas.svg.' },
          },
          required: ['path'],
          additionalProperties: false,
        },
        output: {
          schema: { type: 'object' },
          render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
        },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
          await ready
          const targetSid = exec?.agent?.session?.id ?? agent.session?.id
          const cwd = agentCwd(exec?.agent ?? agent) || resolveSessionCwd(targetSid)
          if (!cwd) throw new Error('Session has no workspace directory (cwd).')
          const full = resolveCanvasPath(cwd, args.path)
          const entry = stateMap.get(full)
          return {
            path: full,
            values: entry?.values ?? {},
            updatedAt: entry?.updatedAt ?? 0,
          }
        },
      }), 'canvas: canvas_state tool')
    })

    handle.skillControl?.invalidate()
  }

  function syncSessionAgents(sessionId) {
    for (const agent of agentHandles.keys()) {
      if (agent.session?.id === sessionId) syncAgent(agent)
    }
  }

  ctx.inject(['agents'], scope => {
    const install = agent => {
      if (agentHandles.has(agent)) return
      const handle = { active: false, toolsFiber: null, skillFiber: null, skillControl: null }
      agentHandles.set(agent, handle)

      handle.skillFiber = agent.ctx.inject(['skills'], skillScope => {
        skillScope.skills.registerProvider(control => {
          handle.skillControl = control
          return {
            name: PROVIDER_NAME,
            async list() {
              const sid = agent.session?.id
              if (!isSessionId(sid) || !isEnabled(sid)) return []
              return [{
                name: SKILL_NAME,
                description: SKILL_DESCRIPTION,
                whenToUse: SKILL_WHEN_TO_USE,
                invocation: { modelInvocable: true, userInvocable: true },
                source: 'plugin',
                provider: PROVIDER_NAME,
                resourceBase: { kind: 'opaque', description: 'DSH Canvas built-in authoring guide' },
                rank: 240,
                locator: { plugin: PROVIDER_NAME, name: SKILL_NAME },
              }]
            },
            async get(candidate) {
              const sid = agent.session?.id
              if (!isSessionId(sid) || !isEnabled(sid)) return undefined
              if (candidate?.name !== SKILL_NAME) return undefined
              return {
                name: SKILL_NAME,
                description: SKILL_DESCRIPTION,
                whenToUse: SKILL_WHEN_TO_USE,
                invocation: candidate.invocation,
                source: 'plugin',
                provider: PROVIDER_NAME,
                resourceBase: candidate.resourceBase,
                content: SKILL_CONTENT,
              }
            },
          }
        })
      })

      ready.then(() => {
        if (!closed && agentHandles.has(agent)) syncAgent(agent)
      }).catch(() => {})
    }

    const uninstall = agent => {
      const handle = agentHandles.get(agent)
      if (!handle) return
      agentHandles.delete(agent)
      handle.toolsFiber?.dispose().catch(() => {})
      handle.skillFiber?.dispose().catch(() => {})
    }

    for (const agent of scope.agents.list()) install(agent)
    scope.on('agent/created', ({ agent }) => install(agent))
    scope.on('agent/disposed', ({ agent }) => uninstall(agent))
    scope.effect(() => () => {
      for (const agent of agentHandles.keys()) uninstall(agent)
    }, 'canvas: agent hooks')
  })

  function injectCanvasNotice(sessionId, summary, text) {
    const bound = boundSummary(summary)
    if (!bound || !text) return
    const message = deepFreeze({
      id: randomUUID(),
      role: 'user',
      content: [{ type: 'text', text }],
      source: { kind: CANVAS_SOURCE_KIND, form: 'notice', summary: bound },
    })
    for (const agent of agentHandles.keys()) {
      if (agent.session?.id !== sessionId) continue
      const pending = Array.isArray(agent.inbox?.nextStep)
        ? agent.inbox.nextStep.filter(item => item?.source?.kind === CANVAS_SOURCE_KIND)
        : []
      if (pending.length > 0 && typeof agent.inbox?.replace === 'function') {
        agent.inbox.replace(pending[0].id, message)
        for (const extra of pending.slice(1)) agent.inbox.remove?.(extra.id)
      } else if (typeof agent.inject === 'function') {
        agent.inject(message)
      }
    }
  }

  function renderCanvasRuntimeContext(session, agent) {
    if (!session || !isEnabled(session.id)) return ''
    const entry = sessionMap.get(session.id)
    const cwd = agentCwd(agent) || resolveSessionCwd(session.id)
    const activePath = entry?.activePath ?? ''
    const lines = []
    if (activePath) {
      const displayPath = relativeDisplayPath(cwd, activePath)
      lines.push(`Active canvas: ${displayPath}`)
      const cacheKey = `${activePath}::${getArtifactKind(activePath)}`
      const cached = compileCache.get(cacheKey)
      const errors = cached?.result?.diagnostics?.filter(d => d.severity === 'error').length ?? 0
      if (errors > 0) lines.push(`Active canvas compile errors: ${errors}`)
      const preview = compactStatePreview(stateMap.get(activePath)?.values)
      if (preview) lines.push(`Active canvas state: ${preview}`)
    }
    return lines.join('\n')
  }

  ctx.systemPrompt.section({
    name: 'canvas:session',
    order: 65,
    interpolate: false,
    replacement: '',
    retirement: 'Canvas mode is disabled for this session. Do not call canvas tools unless Canvas mode is enabled again.',
    text: ({ agent, scope }) => {
      const session = (agent ?? scope)?.session
      if (!session || !isEnabled(session.id)) return ''
      return buildSystemPromptSection()
    },
  })

  ctx.systemPrompt.context?.({
    name: 'canvas:runtime',
    order: 225,
    interpolate: false,
    text: ({ agent, scope }) => {
      const target = agent ?? scope
      return renderCanvasRuntimeContext(target?.session, target)
    },
  })

  async function runOp(op) {
    if (!op || typeof op !== 'object') throw new OpError('Invalid operation payload')
    if (op.action === 'sdk') return { declarations: getSdkDeclarations() }
    if (op.action === 'templates') {
      return {
        templates: CANVAS_TEMPLATES.map(({ id, title, kind, slug, description }) => ({ id, title, kind, slug, description })),
      }
    }

    const sessionId = op.sessionId
    if (!isSessionId(sessionId)) throw new OpError('sessionId is required')

    if (op.action === 'queryData') {
      await ready
      const cwd = resolveSessionCwd(sessionId, op.cwd)
      return queryDataSubscriptions(op.subscriptions, cwd)
    }

    const task = tail.then(async () => {
      if (closed) throw new OpError('canvas plugin is unloading')
      await ready

      const cwd = resolveSessionCwd(sessionId, op.cwd)

      if (op.action === 'patchData') {
        if (typeof op.uri !== 'string' || !op.uri.trim()) throw new OpError('uri is required')
        try {
          const result = await patchCanvasDataFile(op.uri, op, { cwd: cwd || op.cwd || '' })
          dataTick += 1
          broadcastDataTick()
          return { ok: true, result, dataTick }
        } catch (error) {
          throw new OpError(error?.message ?? String(error))
        }
      }

      if (op.action === 'sendToSession') {
        const targetSessionId = typeof op.targetSessionId === 'string' ? op.targetSessionId.trim() : ''
        const text = typeof op.prompt === 'string' ? op.prompt.trim() : ''
        if (!targetSessionId) throw new OpError('targetSessionId is required')
        if (!text) throw new OpError('prompt is required')
        const ctrl = ctx.get('sessionController')
        if (!ctrl?.prompt) throw new OpError('Session controller is unavailable on this host.')
        const mode = op.mode === 'steer' ? 'steer' : 'queue'
        await ctrl.prompt({
          requestId: `canvas-${randomUUID()}`,
          sessionId: targetSessionId,
          mode,
          content: [{ type: 'text', text }],
        }, AbortSignal.timeout(30_000))
        return { ok: true, sessionId: targetSessionId, mode }
      }

      if (op.action === 'triggerSchedule') {
        const taskId = typeof op.taskId === 'string' ? op.taskId.trim() : ''
        if (!taskId) throw new OpError('taskId is required')
        const sched = ctx.get('schedule')
        if (!sched?.run) throw new OpError('Schedule service is unavailable on this host.')
        const result = await sched.run({ id: taskId }, AbortSignal.timeout(15_000))
        dataTick += 1
        broadcastDataTick()
        return { ok: true, result, dataTick }
      }

      if (op.action === 'toggle') {
        const enabled = Boolean(op.enabled)
        const wasEnabled = isEnabled(sessionId)
        await saveSessionEntry(sessionId, { enabled, ...(cwd ? { cwd } : {}) })
        syncSessionAgents(sessionId)
        if (enabled !== wasEnabled) {
          const text = enabled
            ? 'The user enabled Canvas mode for this session.'
            : 'The user disabled Canvas mode for this session.'
          injectCanvasNotice(sessionId, text, text)
        }
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return snap
      }

      if (op.action === 'select') {
        const nextPath = typeof op.path === 'string' ? op.path : ''
        await saveSessionEntry(sessionId, { activePath: nextPath, ...(cwd ? { cwd } : {}) })
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return snap
      }

      if (op.action === 'refresh') {
        if (cwd) {
          const prefix = cwd.endsWith(sep) ? cwd : `${cwd}${sep}`
          for (const key of compileCache.keys()) {
            if (key.startsWith(prefix) || key.startsWith(`${cwd}::`)) compileCache.delete(key)
          }
        }
        dataTick += 1
        broadcastDataTick()
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return snap
      }

      if (op.action === 'create') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const tpl = typeof op.template === 'string'
          ? CANVAS_TEMPLATES.find(item => item.id === op.template)
          : null
        const kind = op.kind ?? tpl?.kind ?? 'react'
        const slug = normalizeSlug(op.name || tpl?.slug || 'overview')
        const source = typeof op.source === 'string' && op.source.trim()
          ? op.source
          : tpl?.source ?? STARTER_TEMPLATE
        const saved = await writeCanvasFile(cwd, slug, source, kind)
        clearCompileCache(saved.path)
        const record = await buildCanvasRecord(cwd, saved.path, 'Created')
        await saveSessionEntry(sessionId, { cwd, activePath: saved.path })
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return { ...snap, created: record.path }
      }

      if (op.action === 'save') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        if (typeof op.source !== 'string') throw new OpError('source must be a string')
        const saved = await writeCanvasFile(cwd, op.path, op.source)
        clearCompileCache(saved.path)
        const record = await buildCanvasRecord(cwd, saved.path, op.reason ?? 'Edited in Canvas')
        await saveSessionEntry(sessionId, { cwd, activePath: saved.path })
        const rel = relativeDisplayPath(cwd, saved.path)
        const summary = `User edited canvas ${rel}${record.errorCount > 0 ? ` (${record.errorCount} compile errors)` : ''}`
        injectCanvasNotice(
          sessionId,
          summary,
          `The user edited canvas "${rel}" directly in the Canvas panel (revision ${record.revision}, compile errors: ${record.errorCount}). Read it before making further edits.`,
        )
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return snap
      }

      if (op.action === 'restore') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = resolveCanvasPath(cwd, op.path)
        const revNum = Number(op.revision)
        const entry = revisionMap.get(full)
        const target = entry?.entries.find(r => r.revision === revNum)
        if (!target) throw new OpError(`Revision ${revNum} not found`)
        await writeCanvasFile(cwd, full, target.source)
        clearCompileCache(full)
        await buildCanvasRecord(cwd, full, `Restored revision ${revNum}`)
        const rel = relativeDisplayPath(cwd, full)
        const summary = `User restored canvas ${rel} to revision ${revNum}`
        injectCanvasNotice(sessionId, summary, `The user restored canvas "${rel}" to revision ${revNum}.`)
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return snap
      }

      if (op.action === 'delete') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = await deleteCanvasFile(cwd, op.path)
        clearCompileCache(full)
        clearDiffCache(full)
        const domain = await ready
        await domain.table('states').delete(storageKeyOf(full))
        await domain.table('revisions').delete(storageKeyOf(full))
        stateMap.delete(full)
        revisionMap.delete(full)
        if (sessionMap.get(sessionId)?.activePath === full) {
          await saveSessionEntry(sessionId, { activePath: '' })
        }
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return snap
      }

      if (op.action === 'setState') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = resolveCanvasPath(cwd, op.path)
        if (typeof op.key !== 'string' || !op.key || op.key.length > 128) throw new OpError('Invalid state key')
        const prev = stateMap.get(full)?.values ?? {}
        const nextValues = { ...prev, [op.key]: op.value }
        await saveStateEntry(full, nextValues)
        const rel = relativeDisplayPath(cwd, full)
        const preview = compactStatePreview(nextValues)
        const summary = `User updated canvas state ${rel} (${op.key})`
        injectCanvasNotice(
          sessionId,
          summary,
          `The user updated interactive state "${op.key}" in canvas "${rel}". Current state: ${preview || '{}'}`,
        )
        await broadcastSession(sessionId)
        return { path: full, values: nextValues }
      }

      if (op.action === 'resetState') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = resolveCanvasPath(cwd, op.path)
        const domain = await ready
        await domain.table('states').delete(storageKeyOf(full))
        stateMap.delete(full)
        const rel = relativeDisplayPath(cwd, full)
        const summary = `User reset canvas state for ${rel}`
        injectCanvasNotice(sessionId, summary, `The user reset interactive state for canvas "${rel}".`)
        const snap = await snapshotForSession(sessionId, cwd)
        await broadcastSession(sessionId, snap)
        return snap
      }

      throw new OpError(`Unknown action: ${String(op.action)}`)
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

  const queryParams = req => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    return {
      sessionId: url.searchParams.get('sessionId') ?? '',
      cwd: url.searchParams.get('cwd') ?? '',
    }
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      const { sessionId, cwd } = queryParams(req)
      if (!isSessionId(sessionId)) return sendJson(res, 400, { message: 'sessionId is required' })
      try {
        sendJson(res, 200, await snapshotForSession(sessionId, cwd))
      } catch (error) {
        sendJson(res, 500, { message: error?.message ?? String(error) })
      }
    },
  }), `canvas: GET ${STATE_PATH}`)

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
        sendJson(res, 200, await runOp(op))
      } catch (error) {
        sendJson(res, error instanceof OpError ? 400 : 500, { message: error?.message ?? String(error) })
      }
    },
  }), `canvas: POST ${OP_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: EVENTS_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      const { sessionId, cwd } = queryParams(req)
      if (!isSessionId(sessionId)) return sendJson(res, 400, { message: 'sessionId is required' })
      try {
        await ready
      } catch (error) {
        return sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
      if (res.destroyed || res.writableEnded || closed) return res.end()
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      const stream = { sessionId, cwd, res }
      let streamClosed = false
      let heartbeat = null
      const drop = () => {
        if (streamClosed) return
        streamClosed = true
        if (heartbeat) {
          clearInterval(heartbeat)
          heartbeat = null
        }
        streams.delete(stream)
        pruneIdleWatchers()
      }
      res.once('close', drop)
      streams.add(stream)
      try {
        const initial = await snapshotForSession(sessionId, cwd)
        if (streamClosed || closed || res.destroyed || res.writableEnded) {
          drop()
          return
        }
        res.write(`retry: 3000\ndata: ${JSON.stringify(initial)}\n\n`)
      } catch {}
      if (streamClosed || closed || res.destroyed || res.writableEnded) {
        drop()
        return
      }
      heartbeat = setInterval(() => {
        if (streamClosed || closed || res.destroyed || res.writableEnded) {
          drop()
          return
        }
        try {
          res.write(': ping\n\n')
        } catch {
          drop()
        }
      }, HEARTBEAT_MS)
      heartbeat.unref?.()
    },
  }), `canvas: GET ${EVENTS_PATH}`)

  ctx.effect(() => async () => {
    closed = true
    for (const stream of streams) stream.res.end()
    streams.clear()
    for (const entry of watchers.values()) entry.watcher.close()
    watchers.clear()
    dataWatcher.close()
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'canvas: cleanup')
}
