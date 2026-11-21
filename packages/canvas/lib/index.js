import { compileCanvas, formatDiagnosticsSummary, getSdkDeclarations } from './compiler.js'
import { buildSystemPromptSection, SKILL_CONTENT, SKILL_DESCRIPTION, SKILL_NAME, SKILL_WHEN_TO_USE, STARTER_TEMPLATE } from './skill.js'
import { appendRevision, DOMAIN_SPEC, MAX_STATE_JSON_BYTES, MAX_STATE_KEYS } from './store.js'
import {
  computeLineDiff,
  createWorkspaceWatcher,
  deleteCanvasFile,
  discoverCanvasFiles,
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

export async function apply(ctx) {
  let closed = false
  let tail = Promise.resolve()

  const sessionMap = new Map()
  const stateMap = new Map()
  const revisionMap = new Map()
  const compileCache = new Map()
  const watchers = new Map()
  const streams = new Set()
  const agentHandles = new Map()

  const ready = ctx.storageDomain.register(DOMAIN_SPEC).then(domain => {
    for (const [id, entry] of domain.table('sessions').entries()) sessionMap.set(id, entry)
    for (const [path, entry] of domain.table('states').entries()) stateMap.set(path, entry)
    for (const [path, entry] of domain.table('revisions').entries()) revisionMap.set(path, entry)
    return domain
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

  function compileCached(filePath, source) {
    const cached = compileCache.get(filePath)
    if (cached && cached.source === source) return cached.result
    const result = compileCanvas(source)
    compileCache.set(filePath, { source, result })
    return result
  }

  async function buildCanvasRecord(cwd, filePath, reason) {
    const file = await readCanvasFile(cwd, filePath)
    const compiled = compileCached(file.path, file.source)
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
    const targets = new Set()
    for (const stream of streams) {
      const streamCwd = resolveSessionCwd(stream.sessionId, stream.cwd)
      if (streamCwd === cwd) targets.add(stream.sessionId)
    }
    for (const sid of targets) await broadcastSession(sid)
  }

  function registerAgentTools(agent) {
    return agent.ctx.inject(['tools'], toolScope => {
      toolScope.effect(() => toolScope.tools.register({
        name: 'canvas_write',
        description: 'Write or update a workspace .canvas.tsx file, run TypeScript + policy checks against dsh/canvas, and refresh the live Canvas preview.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Canvas slug (e.g. "latency-audit") or workspace-relative/absolute path ending in .canvas.tsx.' },
            source: { type: 'string', description: 'Complete .canvas.tsx source importing only from "dsh/canvas" and default-exporting a React component.' },
            reason: { type: 'string', description: 'Short summary of what changed in this revision.' },
          },
          required: ['path', 'source'],
          additionalProperties: false,
        },
        output: {
          schema: { type: 'object' },
          render: (_args, value) => [{
            type: 'text',
            text: `${value.path} (rev ${value.revision})\n${formatDiagnosticsSummary(value.diagnostics)}`,
          }],
        },
        async execute(args, exec) {
          const sid = exec?.agent?.session?.id ?? agent.session?.id
          const cwd = agentCwd(exec?.agent ?? agent) || resolveSessionCwd(sid)
          if (!cwd) throw new Error('Session has no workspace directory (cwd).')
          const saved = await writeCanvasFile(cwd, args.path, args.source)
          const record = await buildCanvasRecord(cwd, saved.path, args.reason ?? 'Agent update')
          if (sid) {
            await saveSessionEntry(sid, { cwd, activePath: saved.path })
            await broadcastSession(sid)
          }
          return {
            ok: record.ok,
            path: record.path,
            relativePath: record.relativePath,
            title: record.title,
            revision: record.revision,
            errorCount: record.errorCount,
            diagnostics: record.diagnostics,
          }
        },
      }), 'canvas: canvas_write tool')

      toolScope.effect(() => toolScope.tools.register({
        name: 'canvas_check',
        description: 'Compile and TypeScript-check a workspace .canvas.tsx file against dsh/canvas and refresh its live preview.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Canvas slug or workspace path ending in .canvas.tsx.' },
          },
          required: ['path'],
          additionalProperties: false,
        },
        output: {
          schema: { type: 'object' },
          render: (_args, value) => [{
            type: 'text',
            text: `${value.path} (rev ${value.revision})\n${formatDiagnosticsSummary(value.diagnostics)}`,
          }],
        },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
          const sid = exec?.agent?.session?.id ?? agent.session?.id
          const cwd = agentCwd(exec?.agent ?? agent) || resolveSessionCwd(sid)
          if (!cwd) throw new Error('Session has no workspace directory (cwd).')
          const full = resolveCanvasPath(cwd, args.path)
          compileCache.delete(full)
          const record = await buildCanvasRecord(cwd, full, 'Checked by agent')
          if (sid) {
            await saveSessionEntry(sid, { cwd, activePath: full })
            await broadcastSession(sid)
          }
          return {
            ok: record.ok,
            path: record.path,
            relativePath: record.relativePath,
            title: record.title,
            revision: record.revision,
            errorCount: record.errorCount,
            diagnostics: record.diagnostics,
          }
        },
      }), 'canvas: canvas_check tool')

      toolScope.effect(() => toolScope.tools.register({
        name: 'canvas_state',
        description: 'Read the current persisted interactive useCanvasState values (user selections, filters, edits) for a workspace .canvas.tsx file.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Canvas slug or workspace path ending in .canvas.tsx.' },
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
          const sid = exec?.agent?.session?.id ?? agent.session?.id
          const cwd = agentCwd(exec?.agent ?? agent) || resolveSessionCwd(sid)
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
  }

  function syncAgentActivation(agent) {
    const handle = agentHandles.get(agent)
    if (!handle) return
    const active = isEnabled(agent.session?.id)
    if (active && !handle.toolsFiber) {
      handle.toolsFiber = registerAgentTools(agent)
    } else if (!active && handle.toolsFiber) {
      const fiber = handle.toolsFiber
      handle.toolsFiber = null
      fiber.dispose().catch(() => {})
    }
    if (handle.lastEnabled !== active) {
      handle.lastEnabled = active
      handle.skillControl?.invalidate()
    }
  }

  function syncSessionAgents(sessionId) {
    for (const agent of agentHandles.keys()) {
      if (agent.session?.id === sessionId) syncAgentActivation(agent)
    }
  }

  function providerFor(agent) {
    const skill = {
      name: SKILL_NAME,
      description: SKILL_DESCRIPTION,
      whenToUse: SKILL_WHEN_TO_USE,
      content: SKILL_CONTENT,
    }
    return {
      name: PROVIDER_NAME,
      discover() {
        if (!isEnabled(agent.session?.id)) return []
        return [{
          name: skill.name,
          description: skill.description,
          whenToUse: skill.whenToUse,
          invocation: { userInvocable: true, modelInvocable: true },
          source: 'plugin',
          provider: PROVIDER_NAME,
          rank: 240,
        }]
      },
      load(candidate) {
        if (!isEnabled(agent.session?.id) || candidate.name !== skill.name) return undefined
        return {
          name: skill.name,
          description: skill.description,
          whenToUse: skill.whenToUse,
          invocation: candidate.invocation,
          source: 'plugin',
          provider: PROVIDER_NAME,
          resourceBase: candidate.resourceBase,
          content: skill.content,
        }
      },
    }
  }

  ctx.inject(['agents'], scope => {
    const install = agent => {
      if (agentHandles.has(agent)) return
      const handle = { skillFiber: null, toolsFiber: null, skillControl: null, lastEnabled: null }
      agentHandles.set(agent, handle)
      handle.skillFiber = agent.ctx.inject(['skills'], agentScope => {
        agentScope.skills.registerProvider(control => {
          handle.skillControl = control
          return providerFor(agent)
        })
      })
      ready.then(() => {
        if (agentHandles.has(agent)) syncAgentActivation(agent)
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

    const sessionId = op.sessionId
    if (!isSessionId(sessionId)) throw new OpError('sessionId is required')

    const task = tail.then(async () => {
      if (closed) throw new OpError('canvas plugin is unloading')
      await ready

      const cwd = resolveSessionCwd(sessionId, op.cwd)

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
        if (cwd) {
          for (const key of compileCache.keys()) {
            if (key.startsWith(cwd)) compileCache.delete(key)
          }
        }
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'create') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const slug = normalizeSlug(op.name || 'overview')
        const source = typeof op.source === 'string' && op.source.trim() ? op.source : STARTER_TEMPLATE
        const saved = await writeCanvasFile(cwd, slug, source)
        const record = await buildCanvasRecord(cwd, saved.path, 'Created')
        await saveSessionEntry(sessionId, { cwd, activePath: saved.path })
        await broadcastSession(sessionId)
        return { ...(await snapshotForSession(sessionId, cwd)), created: record.path }
      }

      if (op.action === 'save') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        if (typeof op.source !== 'string') throw new OpError('source must be a string')
        const saved = await writeCanvasFile(cwd, op.path, op.source)
        compileCache.delete(saved.path)
        await buildCanvasRecord(cwd, saved.path, op.reason ?? 'Edited in Canvas')
        await saveSessionEntry(sessionId, { cwd, activePath: saved.path })
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'restore') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = resolveCanvasPath(cwd, op.path)
        const revNum = Number(op.revision)
        const entry = revisionMap.get(full)
        const target = entry?.entries.find(r => r.revision === revNum)
        if (!target) throw new OpError(`Revision ${revNum} not found`)
        await writeCanvasFile(cwd, full, target.source)
        compileCache.delete(full)
        await buildCanvasRecord(cwd, full, `Restored revision ${revNum}`)
        await broadcastSession(sessionId)
        return snapshotForSession(sessionId, cwd)
      }

      if (op.action === 'delete') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = await deleteCanvasFile(cwd, op.path)
        compileCache.delete(full)
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
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = resolveCanvasPath(cwd, op.path)
        if (typeof op.key !== 'string' || !op.key || op.key.length > 128) throw new OpError('Invalid state key')
        const prev = stateMap.get(full)?.values ?? {}
        const nextValues = { ...prev, [op.key]: op.value }
        await saveStateEntry(full, nextValues)
        await broadcastSession(sessionId)
        return { path: full, values: nextValues }
      }

      if (op.action === 'resetState') {
        if (!cwd) throw new OpError('Session workspace directory (cwd) is unavailable.')
        const full = resolveCanvasPath(cwd, op.path)
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

  const rejected = (req, res) => {
    const rejection = ctx.connection.requestRejection(req)
    if (rejection === undefined) return false
    res.statusCode = rejection
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
    handler: async (req, res) => {
      if (rejected(req, res)) return
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
    handler: async (req, res) => {
      if (rejected(req, res)) return
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
    handler: async (req, res) => {
      if (rejected(req, res)) return
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

  ctx.effect(() => () => {
    closed = true
    for (const stream of streams) stream.res.end()
    streams.clear()
    for (const entry of watchers.values()) entry.watcher.close()
    watchers.clear()
  }, 'canvas: cleanup')
}
