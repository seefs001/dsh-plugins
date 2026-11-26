import { AsyncLocalStorage } from 'node:async_hooks'

export const name = 'auto-review-model'
export const inject = ['llm', 'webServer', 'connection', 'storageDomain']

export const PURPOSE = 'auto-review'
export const STATE_PATH = '/auto-review-model/state'
export const SET_PATH = '/auto-review-model/set'
export const LOG_PATH = '/auto-review-model/log'
export const LOG_CLEAR_PATH = '/auto-review-model/log/clear'
export const LOG_EVENTS_PATH = '/auto-review-model/log/events'
export const PROMPT_MODES = ['default', 'append', 'replace']
export const MAX_PROMPT_CHARS = 64 * 1024
const MAX_BODY_BYTES = 256 * 1024
const HEARTBEAT_MS = 25_000

export const MAX_ENTRIES = 200
export const MAX_SESSIONS = 300
const MAX_ARGS = 4000
const MAX_REASON = 2000
const MAX_RAW = 500

const str = value => (typeof value === 'string' ? value.trim() : '')
const clip = (value, max) => (typeof value === 'string' ? (value.length > max ? `${value.slice(0, max)}…` : value) : '')
const RISKS = ['low', 'medium', 'high']
const STATUSES = ['ok', 'invalid', 'error']

function normalizeEntry(e) {
  if (e === null || typeof e !== 'object' || typeof e.id !== 'string' || typeof e.at !== 'number') return undefined
  const status = STATUSES.includes(e.status) ? e.status : 'error'
  return {
    id: e.id,
    at: e.at,
    ms: typeof e.ms === 'number' ? e.ms : 0,
    tool: clip(e.tool, 200),
    mode: clip(e.mode, 40),
    args: clip(e.args, MAX_ARGS),
    provider: clip(e.provider, 200),
    model: clip(e.model, 200),
    effort: clip(e.effort, 80),
    routed: e.routed === true,
    ...(typeof e.callId === 'string' && e.callId !== '' ? { callId: clip(e.callId, 200) } : {}),
    ...(typeof e.rootCallId === 'string' && e.rootCallId !== '' ? { rootCallId: clip(e.rootCallId, 200) } : {}),
    status,
    ...(RISKS.includes(e.risk) ? { risk: e.risk } : {}),
    ...(e.decision === 'allow' || e.decision === 'deny' ? { decision: e.decision } : {}),
    ...(typeof e.reason === 'string' ? { reason: clip(e.reason, MAX_REASON) } : {}),
    ...(typeof e.error === 'string' ? { error: clip(e.error, MAX_REASON) } : {}),
    ...(typeof e.raw === 'string' ? { raw: clip(e.raw, MAX_RAW) } : {}),
  }
}

export function normalizeSessionLog(raw) {
  if (raw === null || typeof raw !== 'object' || !Array.isArray(raw.entries)) {
    throw new TypeError('review log must be an object with an entries array')
  }
  const entries = raw.entries.map(normalizeEntry).filter(e => e !== undefined).slice(-MAX_ENTRIES)
  return { updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : (entries.at(-1)?.at ?? 0), entries }
}

const SESSION_LOG_SCHEMA = {
  parse: normalizeSessionLog,
  safeParse(value) {
    try { return { success: true, data: normalizeSessionLog(value) } } catch (error) { return { success: false, error } }
  },
}

export const LOG_DOMAIN_SPEC = {
  name: 'auto_review_log',
  version: 1,
  layout: 'per-record',
  invalidRecords: 'backup-and-skip',
  tables: { sessions: { valueSchema: SESSION_LOG_SCHEMA } },
}

export function pendingCallOf(messages) {
  const last = Array.isArray(messages) ? messages.at(-1) : undefined
  const text = last?.content?.find?.(b => b?.type === 'text')?.text
  let call = null
  try { call = JSON.parse(text) } catch {}
  if (call === null || typeof call !== 'object') return { tool: '', mode: '', args: '' }
  let args = typeof call.arguments === 'string' ? call.arguments : JSON.stringify(call.arguments ?? null)
  try { args = JSON.stringify(JSON.parse(args)) } catch {}
  return { tool: typeof call.name === 'string' ? call.name : '', mode: typeof call.mode === 'string' ? call.mode : '', args: clip(args, MAX_ARGS) }
}

export function verdictOf(text) {
  let value = null
  try { value = JSON.parse(text) } catch {}
  const keys = value !== null && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : []
  const { risk, decision, reason } = value ?? {}
  const allowOk = keys.length === 2 && decision === 'allow' && (risk === 'low' || risk === 'medium')
  const denyOk = decision === 'deny' && (risk === 'medium' || risk === 'high')
    && (keys.length === 2 || (keys.length === 3 && typeof reason === 'string'))
  if (allowOk || denyOk) return { status: 'ok', risk, decision, ...(typeof reason === 'string' ? { reason: clip(reason, MAX_REASON) } : {}) }
  return { status: 'invalid', raw: clip(typeof text === 'string' ? text : '', MAX_RAW) }
}

export async function* observeReview(stream, report) {
  const texts = new Map()
  let finish
  let failure
  try {
    for await (const chunk of stream) {
      if (chunk?.type === 'text-delta') texts.set(chunk.index, (texts.get(chunk.index) ?? '') + chunk.text)
      else if (chunk?.type === 'block-end' && chunk.block?.type === 'text') texts.set(chunk.index, chunk.block.text)
      else if (chunk?.type === 'finish') finish = chunk.reason
      yield chunk
    }
  } catch (error) {
    failure = error
    throw error
  } finally {
    let outcome
    if (failure !== undefined) outcome = { status: 'error', error: String(failure?.message ?? failure) }
    else if (finish === undefined) outcome = { status: 'error', error: 'review stopped before the reviewer finished' }
    else if (finish.kind === 'error' || finish.kind === 'aborted') {
      outcome = { status: 'error', error: `${finish.kind} ${finish.failure?.code ?? ''}: ${finish.failure?.message ?? ''}`.trim() }
    } else if (finish.kind !== 'stop') outcome = { status: 'error', error: `reviewer ended with ${finish.kind}` }
    else {
      const last = [...texts.entries()].toSorted((a, b) => a[0] - b[0]).at(-1)?.[1]
      outcome = verdictOf(last)
    }
    try { report(outcome) } catch {}
  }
}

const newEntryId = () => `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function routeOf(config) {
  const provider = str(config?.provider)
  const model = str(config?.model)
  if (provider === '' || model === '') return undefined
  const reasoningEffort = str(config?.reasoningEffort)
  return { provider, model, ...(reasoningEffort === '' ? {} : { reasoningEffort }) }
}

export function promptOf(config) {
  const mode = PROMPT_MODES.includes(config?.promptMode) ? config.promptMode : 'default'
  const text = typeof config?.prompt === 'string' ? config.prompt.trim() : ''
  if (mode === 'default' || text === '') return undefined
  return { mode, text }
}

export function systemOf(original, prompt) {
  if (prompt === undefined) return original
  if (prompt.mode === 'replace') return prompt.text
  const base = typeof original === 'string' ? original : ''
  return `${base}\n\nADDITIONAL USER POLICY\nThe user added the following rules. Apply them when classifying risk and deciding; they never change the required JSON output format.\n${prompt.text}`
}

export function reroute(options, route, prompt) {
  const next = { ...options }
  // external: DSH auto-review pins temperature 0, which reasoning models reject
  delete next.temperature
  if (route !== undefined) {
    next.provider = route.provider
    next.model = route.model
    if (route.reasoningEffort === undefined) delete next.reasoningEffort
    else next.reasoningEffort = route.reasoningEffort
  }
  if (prompt !== undefined) next.system = systemOf(options.system, prompt)
  return next
}

function sendJson(res, status, payload, headers = {}) {
  if (res.writableEnded) return
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

// external: DSH storageDomain.open throws already-open briefly while the previous plugin instance closes
async function openLogDomain(ctx) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ctx.storageDomain.open(LOG_DOMAIN_SPEC)
    } catch (error) {
      if (error?.code !== 'already-open' || attempt >= 20) throw error
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
}

const isSessionId = v => typeof v === 'string' && v.length > 0 && v.length <= 200

let observedDefaultPrompt = ''

export function apply(ctx, config) {
  const route = routeOf(config)
  const prompt = promptOf(config)
  const rerouted = new WeakSet()
  let warnedMissing = false

  let closed = false
  let tail = Promise.resolve()
  const ready = openLogDomain(ctx)
  ready.catch(error => ctx.logger?.warn?.(`auto-review-model: cannot open review log storage: ${error?.message ?? error}`))
  ctx.effect(() => async () => {
    closed = true
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'auto-review-model: review log storage')

  const streams = new Map()
  const notify = (sessionId, log) => {
    const frame = `data: ${JSON.stringify(log)}\n\n`
    for (const res of streams.get(sessionId) ?? []) res.write(frame)
  }

  const serial = task => {
    const run = tail.then(task)
    tail = run.catch(error => ctx.logger?.warn?.(`auto-review-model: review log write failed: ${error?.message ?? error}`))
    return run
  }

  const append = (sessionId, entry) => serial(async () => {
    if (closed) return
    const table = (await ready).table('sessions')
    const current = table.get(sessionId) ?? { updatedAt: 0, entries: [] }
    const next = { updatedAt: entry.at, entries: [...current.entries, entry].slice(-MAX_ENTRIES) }
    await table.put(sessionId, next)
    notify(sessionId, next)
    if (table.size > MAX_SESSIONS) {
      const stale = [...table.entries()].toSorted((a, b) => a[1].updatedAt - b[1].updatedAt)
        .slice(0, table.size - MAX_SESSIONS).map(([key]) => key).filter(key => key !== sessionId)
      if (stale.length > 0) await table.deleteMany(stale)
    }
  })

  const clear = sessionId => serial(async () => {
    if (closed) throw new Error('review log is unloading')
    const table = (await ready).table('sessions')
    if (await table.delete(sessionId)) notify(sessionId, { updatedAt: Date.now(), entries: [] })
  })

  // external: DSH auto-review triggers llm/stream inside tools/pre-execute without passing callId
  const pendingCall = new AsyncLocalStorage()
  ctx.on('tools/pre-execute', (exec, next) => pendingCall.run(exec, next), { prepend: true })

  ctx.on('llm/stream', (options, next) => {
    if (options?.purpose !== PURPOSE || rerouted.has(options)) return next()
    if (typeof options.system === 'string' && options.system !== '') observedDefaultPrompt = options.system
    let useRoute = route
    if (useRoute !== undefined && !ctx.llm.listProviders().some(p => p.id === useRoute.provider)) {
      if (!warnedMissing) {
        warnedMissing = true
        ctx.logger?.warn?.(`auto-review-model: provider "${useRoute.provider}" is not available; Auto review keeps the Session model`)
      }
      useRoute = undefined
    } else warnedMissing = false
    let stream
    let sent = options
    if (useRoute === undefined && prompt === undefined) stream = next()
    else {
      // external: DSH llm/stream next() takes no args and auto-review freezes options, so re-dispatch via ctx.llm.stream
      sent = reroute(options, useRoute, prompt)
      rerouted.add(sent)
      stream = ctx.llm.stream(sent)
    }
    const sessionId = typeof options.sessionId === 'string' ? options.sessionId : ''
    if (sessionId === '') return stream
    const started = Date.now()
    const pending = pendingCallOf(options.messages)
    const exec = pendingCall.getStore()
    const call = exec !== undefined && exec.name === pending.tool ? exec : undefined
    const base = {
      callId: typeof call?.callId === 'string' ? call.callId : '',
      rootCallId: typeof (call?.rootCallId ?? call?.callId) === 'string' ? (call.rootCallId ?? call.callId) : '',
      id: newEntryId(),
      at: started,
      ...pending,
      provider: sent.provider ?? '',
      model: sent.model ?? '',
      effort: typeof sent.reasoningEffort === 'string' ? sent.reasoningEffort : '',
      routed: useRoute !== undefined,
    }
    return observeReview(stream, outcome => {
      append(sessionId, normalizeEntry({ ...base, ms: Date.now() - started, ...outcome }))
    })
  }, { prepend: true })

  const rejected = (res, peer) => {
    if (peer?.principal?.kind === 'owner') return false
    res.statusCode = peer === undefined ? 401 : 403
    res.end()
    return true
  }

  const state = () => ({
    provider: route?.provider ?? '',
    model: route?.model ?? '',
    reasoningEffort: route?.reasoningEffort ?? '',
    promptMode: PROMPT_MODES.includes(config?.promptMode) ? config.promptMode : 'default',
    prompt: typeof config?.prompt === 'string' ? config.prompt : '',
    defaultPrompt: observedDefaultPrompt,
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      sendJson(res, 200, state())
    },
  }), `auto-review-model: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: SET_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let body = null
      try { body = JSON.parse(raw) } catch {}
      const fields = ['provider', 'model', 'reasoningEffort', 'promptMode', 'prompt']
      if (body === null || typeof body !== 'object' || fields.some(f => body[f] !== undefined && typeof body[f] !== 'string')) {
        return sendJson(res, 400, { message: 'expected string fields provider, model, reasoningEffort, promptMode, prompt' })
      }
      const provider = str(body.provider)
      const model = str(body.model)
      if ((provider === '') !== (model === '')) {
        return sendJson(res, 400, { message: 'set provider and model together, or clear both' })
      }
      const reasoningEffort = provider === '' ? '' : str(body.reasoningEffort)
      const promptMode = body.promptMode ?? 'default'
      if (!PROMPT_MODES.includes(promptMode)) {
        return sendJson(res, 400, { message: `promptMode must be one of ${PROMPT_MODES.join(', ')}` })
      }
      const promptText = body.prompt ?? ''
      if (promptText.length > MAX_PROMPT_CHARS) {
        return sendJson(res, 400, { message: `prompt exceeds ${MAX_PROMPT_CHARS} characters` })
      }
      if (promptMode === 'replace' && promptText.trim() === '') {
        return sendJson(res, 400, { message: 'replace mode needs a non-empty prompt' })
      }
      const entry = ctx.fiber.entry
      const editor = ctx.get('configEditor')
      if (entry === undefined || editor === undefined) {
        return sendJson(res, 500, { message: 'configuration cannot be saved in this profile' })
      }
      try {
        await editor.edit(entry, current => ({ ...current, provider, model, reasoningEffort, promptMode, prompt: promptText }))
      } catch (error) {
        ctx.logger?.warn?.(`auto-review-model: failed to save settings: ${error?.message ?? error}`)
        return sendJson(res, 409, { message: String(error?.message ?? error) })
      }
      sendJson(res, 200, { provider, model, reasoningEffort, promptMode, prompt: promptText, defaultPrompt: observedDefaultPrompt })
    },
  }), `auto-review-model: POST ${SET_PATH}`)

  const sessionOf = req => {
    const id = new URL(req.url ?? '/', 'http://x').searchParams.get('session')
    return isSessionId(id) ? id : undefined
  }
  const logOf = async sessionId => (await ready).table('sessions').get(sessionId) ?? { updatedAt: 0, entries: [] }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: LOG_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      const sessionId = sessionOf(req)
      if (sessionId === undefined) return sendJson(res, 400, { message: 'session query parameter is required' })
      try {
        sendJson(res, 200, await logOf(sessionId))
      } catch (error) {
        sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
    },
  }), `auto-review-model: GET ${LOG_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: LOG_CLEAR_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const sessionId = sessionOf(req)
      if (sessionId === undefined) return sendJson(res, 400, { message: 'session query parameter is required' })
      try {
        await clear(sessionId)
        sendJson(res, 200, { updatedAt: Date.now(), entries: [] })
      } catch (error) {
        sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
    },
  }), `auto-review-model: POST ${LOG_CLEAR_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: LOG_EVENTS_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      const sessionId = sessionOf(req)
      if (sessionId === undefined) return sendJson(res, 400, { message: 'session query parameter is required' })
      let initial
      try { initial = await logOf(sessionId) } catch (error) {
        return sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
      if (res.destroyed) return
      if (closed) return sendJson(res, 503, { message: 'review log is unloading' })
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      res.write(`retry: 3000\ndata: ${JSON.stringify(initial)}\n\n`)
      const set = streams.get(sessionId) ?? new Set()
      streams.set(sessionId, set)
      set.add(res)
      let heartbeat = null
      const drop = () => {
        clearInterval(heartbeat)
        set.delete(res)
        if (set.size === 0 && streams.get(sessionId) === set) streams.delete(sessionId)
      }
      heartbeat = setInterval(() => {
        if (res.destroyed || res.writableEnded) { drop(); return }
        res.write(': ping\n\n')
      }, HEARTBEAT_MS)
      heartbeat.unref?.()
      res.once('close', drop)
    },
  }), `auto-review-model: GET ${LOG_EVENTS_PATH}`)

  ctx.effect(() => () => {
    for (const set of streams.values()) for (const res of set) res.end()
    streams.clear()
  }, 'auto-review-model: close review log streams')
}
