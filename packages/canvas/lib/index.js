import { randomUUID } from 'node:crypto'
import { dirname, isAbsolute, resolve } from 'node:path'
import { compileArtifact, formatDiagnosticsSummary, getSdkDeclarations } from './compiler.js'
import {
  createDataDirectoryWatcher,
  getBotsRootDir,
  globCanvasData,
  parseDataUri,
  patchCanvasDataFile,
  readCanvasDataFile,
  readGitHostData,
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
import { appendRevision, DOMAIN_SPEC, MAX_STATE_JSON_BYTES, MAX_STATE_KEYS } from './store.js'
import {
  computeLineDiff,
  createGlobalCanvasWatcher,
  createWorkspaceWatcher,
  deleteCanvasFile,
  deleteGlobalCanvasFile,
  discoverCanvasFiles,
  discoverGlobalCanvasFiles,
  getArtifactKind,
  getGlobalCanvasesRoot,
  normalizeSlug,
  readCanvasFile,
  readGlobalCanvasFile,
  resolveCanvasPath,
  resolveGlobalCanvasPath,
  writeCanvasFile,
  writeGlobalCanvasFile,
} from './workspace.js'

export const name = 'canvas'
export const inject = ['storageDomain', 'webServer', 'connection', 'systemPrompt']

export const STATE_PATH = '/canvas/state'
export const OP_PATH = '/canvas/op'
export const EVENTS_PATH = '/canvas/events'
export const PROVIDER_NAME = 'dsh-canvas'
export const GLOBAL_SESSION_ID = '__global__'

const MAX_BODY_BYTES = 512 * 1024
const HEARTBEAT_MS = 25_000

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
  const watchers = new Map()
  const streams = new Set()
  const agentHandles = new Map()
  const watchedDataDirs = new Set()
  let globalWatcher = null

  const ready = openDomain(ctx).then(domain => {
    for (const [id, entry] of domain.table('sessions').entries()) sessionMap.set(id, entry)
    for (const [path, entry] of domain.table('states').entries()) stateMap.set(path, entry)
    for (const [path, entry] of domain.table('revisions').entries()) revisionMap.set(path, entry)
    return domain
  })
  ready.catch(error => ctx.logger?.warn?.(`canvas: cannot open storage: ${error?.message ?? error}`))

  const dataWatcher = createDataDirectoryWatcher(() => {
    dataTick += 1
    broadcastDataTick()
  })

  const agentCwd = agent => ctx.get('workingDirectory')?.get(agent?.session) ?? agent?.session?.header?.cwd ?? ''

  const resolveSessionCwd = (sessionId, fallbackCwd = '') => {
    if (sessionId === GLOBAL_SESSION_ID) return ''
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
      if (!stream.res.destroyed) {
        try { stream.res.write(payload) } catch {}
      }
    }
  }

  function registerWatchedDir(dir) {
    if (!dir || closed) return
    watchedDataDirs.add(dir)
    dataWatcher.sync([...watchedDataDirs])
  }

  async function saveSessionEntry(sessionId, patch) {
    const domain = await ready
    const prev = sessionMap.get(sessionId) ?? { enabled: false, cwd: '', activePath: '', updatedAt: 0 }
    const next = {
      enabled: patch.enabled !== undefined ? Boolean(patch.enabled) : prev.enabled,
      cwd: patch.cwd !== undefined ? patch.cwd : prev.cwd,
      activePath: patch.activePath !== undefined ? patch.activePath : prev.activePath,
      updatedAt: Date.now(),
    }
    await domain.table('sessions').put(sessionId, next)
    sessionMap.set(sessionId, next)
    return next
  }

  async function saveStateEntry(filePath, values) {
    const domain = await ready
    const keys = Object.keys(values)
    if (keys.length > MAX_STATE_KEYS) throw new OpError(`Canvas state exceeds ${MAX_STATE_KEYS} keys`)
    if (Buffer.byteLength(JSON.stringify(values), 'utf8') > MAX_STATE_JSON_BYTES) {
      throw new OpError(`Canvas state exceeds ${MAX_STATE_JSON_BYTES} bytes`)
    }
    const next = { values, updatedAt: Date.now() }
    await domain.table('states').put(filePath, next)
    stateMap.set(filePath, next)
    return next
  }

  async function recordRevision(filePath, source, reason, errorCount) {
    const domain = await ready
    const existing = revisionMap.get(filePath)
    const { changed, entry } = appendRevision(existing, { source, reason, errorCount })
    if (changed) {
      await domain.table('revisions').put(filePath, entry)
      revisionMap.set(filePath, entry)
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

  async function buildCanvasRecordFromFile(file, reason) {
    const kind = file.kind ?? getArtifactKind(file.path)
    const compiled = compileCached(file.path, file.source, kind)
    const errorCount = compiled.diagnostics.filter(d => d.severity === 'error').length
    const revEntry = await recordRevision(file.path, file.source, reason ?? 'Disk sync', errorCount)
    const state = stateMap.get(file.path)?.values ?? {}
    const revisions = revEntry.entries.map((entry, idx) => ({
      revision: entry.revision,
      time: entry.time,
      reason: entry.reason,
      errorCount: entry.errorCount,
      diff: computeLineDiff(idx > 0 ? revEntry.entries[idx - 1].source : '', entry.source),
    }))
    return {
      path: file.path,
      relativePath: file.relativePath,
      name: file.name,
      kind,
      scope: file.scope ?? 'workspace',
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

  async function buildCanvasRecord(cwd, filePath, reason) {
    const file = await readCanvasFile(cwd, filePath)
    return buildCanvasRecordFromFile(file, reason)
  }

  async function buildGlobalCanvasRecord(filePath, reason) {
    const file = await readGlobalCanvasFile(filePath)
    return buildCanvasRecordFromFile(file, reason)
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

  function ensureGlobalWatcher() {
    if (closed) return
    if (!globalWatcher) {
      globalWatcher = createGlobalCanvasWatcher(() => {
        broadcastSession(GLOBAL_SESSION_ID).catch(() => {})
      })
    } else {
      globalWatcher.sync()
    }
  }

  async function snapshotForGlobal() {
    await ready
    const entry = sessionMap.get(GLOBAL_SESSION_ID) ?? { enabled: true, cwd: '', activePath: '', updatedAt: 0 }
    const files = await discoverGlobalCanvasFiles()
    ensureGlobalWatcher()
    const canvases = []
    for (const filePath of files) {
      try {
        canvases.push(await buildGlobalCanvasRecord(filePath))
      } catch {}
    }
    const activePath = canvases.some(c => c.path === entry.activePath)
      ? entry.activePath
      : canvases[0]?.path ?? ''
    return {
      sessionId: GLOBAL_SESSION_ID,
      scope: 'global',
      enabled: true,
      cwd: getGlobalCanvasesRoot(),
      activePath,
      canvases,
      dataTick,
    }
  }

  async function snapshotForSession(sessionId, fallbackCwd = '') {
    if (sessionId === GLOBAL_SESSION_ID) return snapshotForGlobal()
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
      scope: 'workspace',
      enabled: entry.enabled,
      cwd,
      activePath,
      canvases,
      dataTick,
    }
  }

  async function broadcastSession(sessionId) {
    for (const stream of streams) {
      if (stream.sessionId !== sessionId) continue
      try {
        const snap = await snapshotForSession(stream.sessionId, stream.cwd)
        if (!stream.res.destroyed) stream.res.write(`data: ${JSON.stringify(snap)}\n\n`)
      } catch {}
    }
  }

  async function broadcastForCwd(cwd) {
    const seen = new Set()
    for (const stream of streams) {
      if (stream.sessionId === GLOBAL_SESSION_ID) continue
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
      if (spec.pattern.startsWith('bots://')) registerWatchedDir(getBotsRootDir())
      else if (spec.pattern.startsWith('workspace://') && cwd) registerWatchedDir(resolve(cwd))
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
        description: 'Create or update a Canvas artifact (.canvas.tsx, .canvas.html, or .canvas.svg) in the workspace or global ~/.dsh/canvases directory, run validation/type-checking, and refresh live preview.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Canvas slug (e.g. "latency-audit") or path ending in .canvas.tsx, .canvas.html, or .canvas.svg.' },
            source: { type: 'string', description: 'Complete source code for the artifact.' },
            reason: { type: 'string', description: 'Short revision summary shown in the Canvas history tab.' },
            scope: { type: 'string', enum: ['workspace', 'global'], description: 'Target scope: workspace (default) or global (~/.dsh/canvases).' },
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
          const isGlobal = args.scope === 'global'
          const cwd = isGlobal ? '' : (agentCwd(exec?.agent ?? agent) || resolveSessionCwd(targetSid))
          if (!isGlobal && !cwd) throw new Error('Session has no workspace directory (cwd).')
          const saved = isGlobal
            ? await writeGlobalCanvasFile(args.path, args.source)
            : await writeCanvasFile(cwd, args.path, args.source)
          clearCompileCache(saved.path)
          const record = isGlobal
            ? await buildGlobalCanvasRecord(saved.path, args.reason ?? 'Agent update')
            : await buildCanvasRecord(cwd, saved.path, args.reason ?? 'Agent update')
          if (isGlobal) {
            await saveSessionEntry(GLOBAL_SESSION_ID, { enabled: true, activePath: saved.path })
            await broadcastSession(GLOBAL_SESSION_ID)
          } else {
            await saveSessionEntry(targetSid, { cwd, activePath: saved.path })
            await broadcastSession(targetSid)
          }
          return {
            ok: record.ok,
            path: record.path,
            relativePath: record.relativePath,
            kind: record.kind,
            scope: record.scope,
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
        description: 'Read the current persisted interactive useCanvasState values (user selections, filters, edits) for a workspace or global Canvas file.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Canvas slug or path ending in .canvas.tsx, .canvas.html, or .canvas.svg.' },
            scope: { type: 'string', enum: ['workspace', 'global'], description: 'Target scope: workspace (default) or global.' },
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
          const isGlobal = args.scope === 'global'
          let full
          if (isGlobal) {
            full = resolveGlobalCanvasPath(args.path)
          } else {
            const targetSid = exec?.agent?.session?.id ?? agent.session?.id
            const cwd = agentCwd(exec?.agent ?? agent) || resolveSessionCwd(targetSid)
            if (!cwd) throw new Error('Session has no workspace directory (cwd).')
            full = resolveCanvasPath(cwd, args.path)
          }
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

  ctx.systemPrompt.section({
    name: 'canvas:session',
    order: 65,
    interpolate: false,
    text: ({ agent, scope }) => {
      const session = (agent ?? scope)?.session
      if (!session || !isEnabled(session.id)) return ''
      return buildSystemPromptSection(agentCwd(agent) || resolveSessionCwd(session.id))
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

    const sessionId = op.scope === 'global' ? GLOBAL_SESSION_ID : op.sessionId
    if (!isSessionId(sessionId)) throw new OpError('sessionId is required')
    const isGlobal = sessionId === GLOBAL_SESSION_ID

    if (op.action === 'queryData') {
      await ready
      const cwd = isGlobal ? (typeof op.cwd === 'string' ? op.cwd : '') : resolveSessionCwd(sessionId, op.cwd)
      return queryDataSubscriptions(op.subscriptions, cwd)
    }

    const task = tail.then(async () => {
      if (closed) throw new OpError('canvas plugin is unloading')
      await ready

      const cwd = isGlobal ? '' : resolveSessionCwd(sessionId, op.cwd)

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
        await saveSessionEntry(sessionId, { enabled, ...(cwd ? { cwd } : {}) })
        syncSessionAgents(sessionId)
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'select') {
        const nextPath = typeof op.path === 'string' ? op.path : ''
        await saveSessionEntry(sessionId, { activePath: nextPath, ...(cwd ? { cwd } : {}) })
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'refresh') {
        const prefix = isGlobal ? getGlobalCanvasesRoot() : cwd
        if (prefix) {
          for (const key of compileCache.keys()) {
            if (key.startsWith(prefix)) compileCache.delete(key)
          }
        }
        dataTick += 1
        broadcastDataTick()
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'create') {
        if (!isGlobal && !cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const tpl = typeof op.template === 'string'
          ? CANVAS_TEMPLATES.find(item => item.id === op.template)
          : null
        const kind = op.kind ?? tpl?.kind ?? 'react'
        const slug = normalizeSlug(op.name || tpl?.slug || 'overview')
        const source = typeof op.source === 'string' && op.source.trim()
          ? op.source
          : tpl?.source ?? STARTER_TEMPLATE
        const saved = isGlobal
          ? await writeGlobalCanvasFile(slug, source, kind)
          : await writeCanvasFile(cwd, slug, source, kind)
        clearCompileCache(saved.path)
        const record = isGlobal
          ? await buildGlobalCanvasRecord(saved.path, 'Created')
          : await buildCanvasRecord(cwd, saved.path, 'Created')
        await saveSessionEntry(sessionId, { ...(cwd ? { cwd } : {}), activePath: saved.path })
        await broadcastSession(sessionId)
        return { ...(await snapshotForSession(sessionId, cwd)), created: record.path }
      }

      if (op.action === 'save') {
        if (!isGlobal && !cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        if (typeof op.source !== 'string') throw new OpError('source must be a string')
        const saved = isGlobal
          ? await writeGlobalCanvasFile(op.path, op.source)
          : await writeCanvasFile(cwd, op.path, op.source)
        clearCompileCache(saved.path)
        if (isGlobal) await buildGlobalCanvasRecord(saved.path, op.reason ?? 'Edited in Canvas')
        else await buildCanvasRecord(cwd, saved.path, op.reason ?? 'Edited in Canvas')
        await saveSessionEntry(sessionId, { ...(cwd ? { cwd } : {}), activePath: saved.path })
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'restore') {
        if (!isGlobal && !cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = isGlobal ? resolveGlobalCanvasPath(op.path) : resolveCanvasPath(cwd, op.path)
        const revNum = Number(op.revision)
        const entry = revisionMap.get(full)
        const target = entry?.entries.find(r => r.revision === revNum)
        if (!target) throw new OpError(`Revision ${revNum} not found`)
        if (isGlobal) await writeGlobalCanvasFile(full, target.source)
        else await writeCanvasFile(cwd, full, target.source)
        clearCompileCache(full)
        if (isGlobal) await buildGlobalCanvasRecord(full, `Restored revision ${revNum}`)
        else await buildCanvasRecord(cwd, full, `Restored revision ${revNum}`)
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'delete') {
        if (!isGlobal && !cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = isGlobal ? await deleteGlobalCanvasFile(op.path) : await deleteCanvasFile(cwd, op.path)
        clearCompileCache(full)
        const domain = await ready
        await domain.table('states').delete(full)
        await domain.table('revisions').delete(full)
        stateMap.delete(full)
        revisionMap.delete(full)
        if (sessionMap.get(sessionId)?.activePath === full) {
          await saveSessionEntry(sessionId, { activePath: '' })
        }
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'setState') {
        if (!isGlobal && !cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = isGlobal ? resolveGlobalCanvasPath(op.path) : resolveCanvasPath(cwd, op.path)
        if (typeof op.key !== 'string' || !op.key || op.key.length > 128) throw new OpError('Invalid state key')
        const prev = stateMap.get(full)?.values ?? {}
        const nextValues = { ...prev, [op.key]: op.value }
        await saveStateEntry(full, nextValues)
        await broadcastSession(sessionId)
        return { path: full, values: nextValues }
      }

      if (op.action === 'resetState') {
        if (!isGlobal && !cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = isGlobal ? resolveGlobalCanvasPath(op.path) : resolveCanvasPath(cwd, op.path)
        const domain = await ready
        await domain.table('states').delete(full)
        stateMap.delete(full)
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
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
      if (res.destroyed || closed) return res.end()
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      const stream = { sessionId, cwd, res }
      streams.add(stream)
      try {
        const initial = await snapshotForSession(sessionId, cwd)
        if (!res.destroyed) res.write(`retry: 3000\ndata: ${JSON.stringify(initial)}\n\n`)
      } catch {}
      const heartbeat = setInterval(() => {
        if (!res.destroyed) res.write(': ping\n\n')
      }, HEARTBEAT_MS)
      res.once('close', () => {
        clearInterval(heartbeat)
        streams.delete(stream)
      })
    },
  }), `canvas: GET ${EVENTS_PATH}`)

  ctx.effect(() => async () => {
    closed = true
    for (const stream of streams) stream.res.end()
    streams.clear()
    for (const entry of watchers.values()) entry.watcher.close()
    watchers.clear()
    globalWatcher?.close()
    globalWatcher = null
    dataWatcher.close()
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'canvas: cleanup')
}
