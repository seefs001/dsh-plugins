import { basename } from 'node:path'

export const name = 'bark-notify'
export const inject = ['credentials', 'webServer', 'connection']

export const CREDENTIAL_KEY = 'bark-notify/device'
export const ENV_REF = 'DSH_BARK_KEY'
export const STATE_PATH = '/bark-notify/state'
export const SET_PATH = '/bark-notify/set'
export const TEST_PATH = '/bark-notify/test'

const MAX_BODY_BYTES = 16 * 1024
const FETCH_TIMEOUT_MS = 8_000
const MAX_DELAY_MS = 600_000
const DEDUPE_TTL_MS = 30_000
const DEDUPE_MAX = 200

export const DEFAULTS = {
  enabled: true,
  serverUrl: 'https://api.day.app',
  method: 'get',
  notifyQuestions: true,
  notifyApprovals: true,
  notifyErrors: true,
  notifyFinished: false,
  notifyAcp: true,
  delayMs: 0,
  sound: 'alarm',
  group: 'dsh',
  includeContent: true,
  openUrl: '',
}

const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const str = v => (typeof v === 'string' ? v.trim() : '')
const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)
const singleLine = text => str(text).replace(/\s+/g, ' ')

export function normalizeServerUrl(raw) {
  const input = str(raw)
  if (input === '') throw new Error('serverUrl is required')
  let url
  try { url = new URL(input) } catch { throw new Error('serverUrl must be a valid URL') }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('serverUrl must use http or https')
  if (url.username !== '' || url.password !== '') throw new Error('serverUrl must not contain embedded credentials')
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`
}

export function normalizeOpenUrl(raw) {
  const input = str(raw)
  if (input === '') return ''
  let url
  try { url = new URL(input) } catch { throw new Error('openUrl must be a valid URL') }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('openUrl must use http or https')
  if (url.username !== '' || url.password !== '') throw new Error('openUrl must not contain embedded credentials')
  return url.toString()
}

export function settingsOf(config) {
  const c = isRecord(config) ? config : {}
  let serverUrl = DEFAULTS.serverUrl
  try { if (str(c.serverUrl) !== '') serverUrl = normalizeServerUrl(c.serverUrl) } catch {}
  let openUrl = DEFAULTS.openUrl
  try { openUrl = normalizeOpenUrl(c.openUrl) } catch {}
  const delayRaw = Number(c.delayMs)
  const delayMs = Number.isInteger(delayRaw) && delayRaw >= 0 && delayRaw <= MAX_DELAY_MS ? delayRaw : DEFAULTS.delayMs
  return {
    enabled: c.enabled === undefined ? DEFAULTS.enabled : c.enabled === true,
    serverUrl,
    method: c.method === 'post' ? 'post' : 'get',
    notifyQuestions: c.notifyQuestions === undefined ? DEFAULTS.notifyQuestions : c.notifyQuestions === true,
    notifyApprovals: c.notifyApprovals === undefined ? DEFAULTS.notifyApprovals : c.notifyApprovals === true,
    notifyErrors: c.notifyErrors === undefined ? DEFAULTS.notifyErrors : c.notifyErrors === true,
    notifyFinished: c.notifyFinished === undefined ? DEFAULTS.notifyFinished : c.notifyFinished === true,
    notifyAcp: c.notifyAcp === undefined ? DEFAULTS.notifyAcp : c.notifyAcp === true,
    delayMs,
    sound: clip(singleLine(c.sound ?? DEFAULTS.sound), 128),
    group: clip(singleLine(c.group ?? DEFAULTS.group), 128),
    includeContent: c.includeContent === undefined ? DEFAULTS.includeContent : c.includeContent === true,
    openUrl,
  }
}

export function parseSettings(raw) {
  if (!isRecord(raw)) return { error: 'expected a JSON object' }
  const bool = (v, field) => (typeof v === 'boolean' ? v : new Error(`${field} must be a boolean`))
  const fields = {}
  for (const k of ['enabled', 'notifyQuestions', 'notifyApprovals', 'notifyErrors', 'notifyFinished', 'notifyAcp', 'includeContent']) {
    const v = raw[k] === undefined ? DEFAULTS[k] : bool(raw[k], k)
    if (v instanceof Error) return { error: v.message }
    fields[k] = v
  }
  let serverUrl
  try { serverUrl = normalizeServerUrl(raw.serverUrl ?? DEFAULTS.serverUrl) }
  catch (err) { return { error: err.message } }
  let openUrl
  try { openUrl = normalizeOpenUrl(raw.openUrl ?? '') }
  catch (err) { return { error: err.message } }
  const method = raw.method ?? DEFAULTS.method
  if (method !== 'get' && method !== 'post') return { error: 'method must be "get" or "post"' }
  const delayMs = raw.delayMs === undefined ? DEFAULTS.delayMs : Number(raw.delayMs)
  if (!Number.isInteger(delayMs) || delayMs < 0 || delayMs > MAX_DELAY_MS) {
    return { error: `delayMs must be an integer between 0 and ${MAX_DELAY_MS}` }
  }
  const sound = singleLine(raw.sound ?? '')
  const group = singleLine(raw.group ?? '')
  if (sound.length > 128 || group.length > 128) return { error: 'sound and group must be at most 128 characters' }

  let deviceKey
  if (raw.deviceKey !== undefined) {
    if (typeof raw.deviceKey !== 'string') return { error: 'deviceKey must be a string' }
    const trimmed = raw.deviceKey.trim()
    if (trimmed !== '') {
      if (trimmed.length > 512 || /[\s/\\?#]/u.test(trimmed)) {
        return { error: 'deviceKey contains invalid characters or whitespace' }
      }
      deviceKey = trimmed
    }
  }
  const clearKey = raw.clearKey === true
  if (clearKey && deviceKey !== undefined) return { error: 'cannot both set and clear deviceKey' }

  return {
    value: { ...fields, serverUrl, method, delayMs, sound, group, openUrl },
    deviceKey,
    clearKey,
  }
}

export function maskSecret(secret) {
  if (typeof secret !== 'string' || secret === '') return ''
  if (secret.length <= 6) return '••••'
  return `${secret.slice(0, 3)}••••${secret.slice(-3)}`
}

export function redactSecret(text, secret) {
  const s = typeof text === 'string' ? text : String(text ?? '')
  if (!secret) return s
  return s.replaceAll(secret, '[redacted]').replaceAll(encodeURIComponent(secret), '[redacted]')
}

const safeSegment = (text, max) => clip(singleLine(text).replaceAll('/', '⁄') || 'DSH', max)

export function buildBarkRequest({ serverUrl, deviceKey, method, title, content, sound, group, openUrl }) {
  const keyPart = encodeURIComponent(deviceKey)
  if (method === 'post') {
    return {
      url: `${serverUrl}/${keyPart}`,
      init: {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          title: clip(singleLine(title) || 'DSH', 100),
          body: clip(str(content) || 'DSH', 500),
          ...(sound ? { sound } : {}),
          ...(group ? { group } : {}),
          ...(openUrl ? { url: openUrl } : {}),
        }),
      },
    }
  }
  const params = new URLSearchParams()
  if (sound) params.set('sound', sound)
  if (group) params.set('group', group)
  if (openUrl) params.set('url', openUrl)
  const qs = params.toString()
  const path = `${serverUrl}/${keyPart}/${encodeURIComponent(safeSegment(title, 80))}/${encodeURIComponent(safeSegment(content, 240))}`
  return {
    url: qs ? `${path}?${qs}` : path,
    init: { method: 'GET' },
  }
}

function sessionLabel(ctx, agent) {
  if (!agent) return 'DSH'
  let root = agent
  try { root = ctx.get('subagents')?.rootOf?.(agent) ?? agent } catch {}
  const session = root?.session ?? agent?.session
  try {
    const title = ctx.get('sessionTitle')?.get?.(session)?.title
    if (typeof title === 'string' && title.trim() !== '') return clip(singleLine(title), 32)
  } catch {}
  const cwd = session?.header?.cwd
  if (typeof cwd === 'string' && cwd.trim() !== '') {
    const base = basename(cwd.trim())
    if (base) return clip(singleLine(base), 32)
  }
  const id = session?.id ?? agent?.id
  return typeof id === 'string' && id !== '' ? clip(id, 16) : 'DSH'
}

export function formatQuestionNotification(ctx, request, includeContent) {
  const label = sessionLabel(ctx, request?.agent)
  const questions = Array.isArray(request?.questions) ? request.questions : []
  const first = questions[0]
  const isPlan = questions.some(q => q?.intent?.kind === 'plan-review')
  const isApproval = questions.some(q => q?.intent?.kind === 'approval')
  const kindLabel = isPlan ? '审阅计划' : isApproval ? '请求授权' : '需要回答'
  const title = `[DSH] ${kindLabel} · ${label}`
  if (!includeContent || !first) {
    return { title, content: `会话「${label}」有待处理交互，请回 DSH 查看` }
  }
  const parts = []
  if (first.header && first.header !== first.question) parts.push(`${singleLine(first.header)}: ${singleLine(first.question)}`)
  else if (first.question) parts.push(singleLine(first.question))
  if (questions.length > 1) parts.push(`(共 ${questions.length} 题)`)
  if (!isPlan && Array.isArray(first.options) && first.options.length > 0) {
    const labels = first.options.slice(0, 4).map(o => singleLine(o?.label)).filter(Boolean)
    if (labels.length > 0) parts.push(`选项: ${labels.join(' / ')}`)
  }
  return { title, content: clip(parts.join(' · ') || `会话「${label}」等待你的回复`, 240) }
}

export function formatApprovalNotification(ctx, request, includeContent) {
  const label = sessionLabel(ctx, request?.agent)
  const tool = singleLine(request?.toolName || 'tool')
  const title = `[DSH] 需要审批 · ${label}`
  if (!includeContent) {
    return { title, content: `会话「${label}」请求审批工具 ${tool}` }
  }
  const localized = request?.displayReason?.zh ?? request?.displayReason?.en
  const reason = singleLine(localized || request?.reason || '')
  const body = reason ? `工具 ${tool}: ${reason}` : `工具 ${tool} 等待你的审批`
  return { title, content: clip(body, 240) }
}

function sessionObjectLabel(ctx, session) {
  if (!session) return 'DSH'
  try {
    const title = ctx.get('sessionTitle')?.get?.(session)?.title
    if (typeof title === 'string' && title.trim() !== '') return clip(singleLine(title), 32)
  } catch {}
  const cwd = session?.header?.cwd ?? session?.cwd
  if (typeof cwd === 'string' && cwd.trim() !== '') {
    const base = basename(cwd.trim())
    if (base) return clip(singleLine(base), 32)
  }
  const id = session?.id
  return typeof id === 'string' && id !== '' ? clip(id, 16) : 'DSH'
}

export function formatErrorNotification(ctx, payload, includeContent) {
  const label = sessionLabel(ctx, payload?.agent)
  const title = `[DSH] 运行出错 · ${label}`
  if (!includeContent) {
    return { title, content: `会话「${label}」运行出错，请回 DSH 查看` }
  }
  const err = payload?.error
  const detail = singleLine(err instanceof Error ? err.message : typeof err === 'string' ? err : err?.message ?? '')
  return { title, content: clip(detail || `会话「${label}」运行出错`, 240) }
}

export function formatFinishedNotification(ctx, session, includeContent) {
  const label = sessionObjectLabel(ctx, session)
  const title = `[DSH] 轮次完成 · ${label}`
  return { title, content: includeContent ? `会话「${label}」已完成本轮回复` : `会话「${label}」已就绪` }
}

export function formatAcpInteractionNotification(ctx, payload, includeContent) {
  const acpSession = payload?.session
  const interaction = payload?.interaction
  const nativeId = acpSession?.native?.rootSessionId ?? acpSession?.native?.sessionId
  const nativeSession = nativeId ? ctx.get('sessions')?.get?.(nativeId) : undefined
  const label = nativeSession
    ? sessionObjectLabel(ctx, nativeSession)
    : acpSession?.title
      ? clip(singleLine(acpSession.title), 32)
      : acpSession?.cwd
        ? clip(singleLine(basename(acpSession.cwd)), 32)
        : clip(singleLine(acpSession?.providerId || 'ACP'), 32)
  const kind = interaction?.kind
  const kindLabel = kind === 'permission' ? 'ACP 需要审批' : kind === 'plan' ? 'ACP 审阅计划' : 'ACP 需要回答'
  const title = `[DSH] ${kindLabel} · ${label}`
  if (!includeContent) {
    return { title, content: `外部 CLI 会话「${label}」等待你的处理` }
  }
  const params = interaction?.params ?? {}
  const summary = kind === 'permission'
    ? singleLine(params.toolCall?.title || params.toolCall?.name || params.title || '')
    : singleLine(params.message || params.title || params.questions?.[0]?.question || '')
  return { title, content: clip(summary || `外部 CLI 会话「${label}」等待你的处理`, 240) }
}

async function resolveKey(ctx) {
  try {
    const record = await ctx.credentials.readRecord(CREDENTIAL_KEY)
    const saved = record?.kind === 'grant' ? str(record.payload?.key) : ''
    if (saved !== '') return { key: saved, source: 'credentials' }
  } catch {}
  try {
    const hit = await ctx.credentials.resolve(ENV_REF)
    if (typeof hit?.value === 'string' && hit.value.trim() !== '') {
      return { key: hit.value.trim(), source: 'env' }
    }
  } catch {}
  const envVal = str(process.env[ENV_REF])
  if (envVal !== '') return { key: envVal, source: 'env' }
  return { key: '', source: 'none' }
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

export async function apply(ctx, config) {
  const settings = settingsOf(config)
  const life = new AbortController()
  const activeTimers = new Set()
  const acpPending = new Map()
  const erroredTurns = new Map()
  const recent = new Map()
  let closed = false

  const admitOwner = (res, peer) => {
    if (peer === undefined) { res.statusCode = 401; res.end(); return false }
    if (peer.principal.kind !== 'owner') { res.statusCode = 403; res.end(); return false }
    return true
  }

  const state = async (override = settings) => {
    const resolved = await resolveKey(ctx)
    return {
      ...override,
      hasKey: resolved.key !== '',
      maskedKey: maskSecret(resolved.key),
      keySource: resolved.source,
    }
  }

  const pushBark = async (payload, override = settings, explicitKey = '') => {
    const resolved = explicitKey ? { key: explicitKey, source: 'explicit' } : await resolveKey(ctx)
    if (resolved.key === '') throw new Error('Bark device key is not configured')
    const req = buildBarkRequest({
      serverUrl: override.serverUrl,
      deviceKey: resolved.key,
      method: override.method,
      title: payload.title,
      content: payload.content,
      sound: override.sound,
      group: override.group,
      openUrl: override.openUrl,
    })
    const signal = AbortSignal.any([life.signal, AbortSignal.timeout(FETCH_TIMEOUT_MS)])
    let response
    try {
      response = await fetch(req.url, { ...req.init, redirect: 'error', signal })
    } catch (error) {
      const wrapped = new Error(redactSecret(error?.message ?? error, resolved.key), { cause: error })
      if (error?.name === 'AbortError') wrapped.name = 'AbortError'
      throw wrapped
    }
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(redactSecret(`Bark HTTP ${response.status}${text ? `: ${clip(singleLine(text), 160)}` : ''}`, resolved.key))
    }
  }

  const shouldDedupe = key => {
    if (!key) return false
    const now = Date.now()
    const prev = recent.get(key)
    if (prev !== undefined && now - prev < DEDUPE_TTL_MS) return true
    recent.set(key, now)
    if (recent.size > DEDUPE_MAX) {
      for (const [k, ts] of recent) {
        if (now - ts >= DEDUPE_TTL_MS || recent.size > DEDUPE_MAX) recent.delete(k)
        else break
      }
    }
    return false
  }

  const scheduleNotification = (dedupeKey, buildPayload, signal, next) => {
    const outcomePromise = next()
    if (closed || !settings.enabled) return outcomePromise
    if (signal?.aborted || shouldDedupe(dedupeKey)) return outcomePromise

    const fire = () => {
      if (closed || signal?.aborted) return
      let payload
      try { payload = buildPayload() } catch { return }
      void pushBark(payload).catch(error => {
        if (!closed && error?.name !== 'AbortError') {
          ctx.logger?.warn?.(`bark-notify: failed to send notification: ${error?.message ?? error}`)
        }
      })
    }

    if (settings.delayMs <= 0) {
      fire()
      return outcomePromise
    }

    let settled = false
    let timer = null
    const cancel = () => {
      if (settled) return
      settled = true
      if (timer !== null) {
        clearTimeout(timer)
        activeTimers.delete(timer)
        timer = null
      }
      signal?.removeEventListener('abort', cancel)
    }

    timer = setTimeout(() => {
      cancel()
      fire()
    }, settings.delayMs)
    timer.unref?.()
    activeTimers.add(timer)
    signal?.addEventListener('abort', cancel, { once: true })
    void outcomePromise.then(cancel, cancel)
    return outcomePromise
  }

  ctx.on('user-questions/request', (request, next) => {
    if (!settings.enabled || !settings.notifyQuestions) return next()
    const sid = request?.agent?.session?.id ?? request?.agent?.id ?? ''
    const callId = request?.wait?.callId ?? ''
    const dedupeKey = sid && callId ? `q:${sid}:${callId}` : ''
    return scheduleNotification(
      dedupeKey,
      () => formatQuestionNotification(ctx, request, settings.includeContent),
      request?.signal,
      next,
    )
  }, { prepend: true })

  ctx.on('approval/request', (request, next) => {
    if (!settings.enabled || !settings.notifyApprovals) return next()
    const sid = request?.agent?.session?.id ?? request?.agent?.id ?? ''
    const callId = request?.callId ?? ''
    const dedupeKey = sid && callId ? `a:${sid}:${callId}` : ''
    return scheduleNotification(
      dedupeKey,
      () => formatApprovalNotification(ctx, request, settings.includeContent),
      request?.signal,
      next,
    )
  }, { prepend: true })

  const fireStandalone = (dedupeKey, buildPayload) => {
    if (closed || !settings.enabled || shouldDedupe(dedupeKey)) return
    let payload
    try { payload = buildPayload() } catch { return }
    void pushBark(payload).catch(error => {
      if (!closed && error?.name !== 'AbortError') {
        ctx.logger?.warn?.(`bark-notify: failed to send notification: ${error?.message ?? error}`)
      }
    })
  }

  ctx.on('agent/error', payload => {
    const sid = payload?.agent?.session?.id ?? payload?.agent?.id ?? ''
    if (sid && typeof payload?.turn === 'number') {
      erroredTurns.set(sid, payload.turn)
      if (erroredTurns.size > DEDUPE_MAX) {
        const oldest = erroredTurns.keys().next().value
        if (oldest !== undefined) erroredTurns.delete(oldest)
      }
    }
    if (!settings.enabled || !settings.notifyErrors) return
    const dedupeKey = sid ? `e:${sid}:${payload?.turn ?? ''}:${payload?.step ?? ''}` : ''
    fireStandalone(dedupeKey, () => formatErrorNotification(ctx, payload, settings.includeContent))
  })

  ctx.on('session/event', (session, event) => {
    if (!settings.enabled || !settings.notifyFinished) return
    if (event?.type !== 'turn/end') return
    if (session?.header?.origin === 'subagent') return
    const sid = session?.id ?? ''
    const turn = event?.turn ?? event?.data?.turn
    if (sid && turn !== undefined && erroredTurns.get(sid) === turn) {
      erroredTurns.delete(sid)
      return
    }
    const dedupeKey = sid ? `f:${sid}:${event?.seq ?? turn ?? ''}` : ''
    fireStandalone(dedupeKey, () => formatFinishedNotification(ctx, session, settings.includeContent))
  })

  ctx.on('acp-workbench/interaction-open', payload => {
    if (closed || !settings.enabled || !settings.notifyAcp) return
    const id = typeof payload?.id === 'string' ? payload.id : ''
    const dedupeKey = id ? `acp:${id}` : ''
    if (shouldDedupe(dedupeKey)) return
    const sendNow = () => {
      if (closed) return
      let body
      try { body = formatAcpInteractionNotification(ctx, payload, settings.includeContent) } catch { return }
      void pushBark(body).catch(error => {
        if (!closed && error?.name !== 'AbortError') {
          ctx.logger?.warn?.(`bark-notify: failed to send notification: ${error?.message ?? error}`)
        }
      })
    }
    if (settings.delayMs <= 0) {
      sendNow()
      return
    }
    const timer = setTimeout(() => {
      activeTimers.delete(timer)
      if (id) acpPending.delete(id)
      sendNow()
    }, settings.delayMs)
    timer.unref?.()
    activeTimers.add(timer)
    if (id) acpPending.set(id, timer)
  })

  ctx.on('acp-workbench/interaction-close', payload => {
    const id = typeof payload?.id === 'string' ? payload.id : ''
    const timer = id ? acpPending.get(id) : undefined
    if (timer === undefined) return
    clearTimeout(timer)
    activeTimers.delete(timer)
    acpPending.delete(id)
  })

  ctx.effect(() => () => {
    closed = true
    life.abort(new Error('bark-notify unloading'))
    for (const timer of activeTimers) clearTimeout(timer)
    activeTimers.clear()
    acpPending.clear()
    erroredTurns.clear()
  }, 'bark-notify: lifetime')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res, peer) => {
      if (!admitOwner(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      sendJson(res, 200, await state())
    },
  }), `bark-notify: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: SET_PATH,
    handler: async (req, res, peer) => {
      if (!admitOwner(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let body = null
      try { body = JSON.parse(raw) } catch {}
      const parsed = parseSettings(body)
      if (parsed.error !== undefined) return sendJson(res, 400, { message: parsed.error })

      const entry = ctx.fiber.entry
      const editor = ctx.get('configEditor')
      if (entry === undefined || editor === undefined) {
        return sendJson(res, 500, { message: 'configuration cannot be saved in this profile' })
      }

      try {
        if (parsed.clearKey) {
          await ctx.credentials.deleteRecord(CREDENTIAL_KEY)
        } else if (parsed.deviceKey !== undefined) {
          await ctx.credentials.modifyRecord(CREDENTIAL_KEY, async () => ({
            kind: 'grant',
            payload: { key: parsed.deviceKey },
          }))
        }
      } catch (error) {
        return sendJson(res, 500, { message: `failed to update credential: ${error?.message ?? error}` })
      }

      const confirmed = await state(parsed.value)
      try {
        await editor.edit(entry, current => ({ ...current, ...parsed.value }))
      } catch (error) {
        ctx.logger?.warn?.(`bark-notify: failed to save settings: ${error?.message ?? error}`)
        return sendJson(res, 409, { message: String(error?.message ?? error) })
      }
      sendJson(res, 200, confirmed)
    },
  }), `bark-notify: POST ${SET_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: TEST_PATH,
    handler: async (req, res, peer) => {
      if (!admitOwner(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let body = {}
      if (raw.trim() !== '') {
        try { body = JSON.parse(raw) } catch { return sendJson(res, 400, { message: 'invalid JSON body' }) }
      }
      const parsed = parseSettings({ ...settings, ...(isRecord(body) ? body : {}) })
      if (parsed.error !== undefined) return sendJson(res, 400, { message: parsed.error })
      try {
        await pushBark(
          { title: '[DSH] 测试通知', content: 'Bark 通知已连接，Agent 等待你确认时会推送到这里' },
          parsed.value,
          parsed.deviceKey ?? '',
        )
        sendJson(res, 200, { ok: true })
      } catch (error) {
        sendJson(res, 502, { message: error?.message ?? 'Bark request failed' })
      }
    },
  }), `bark-notify: POST ${TEST_PATH}`)
}
