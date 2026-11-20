/**
 * dsh-session-lifecycle — Host half.
 *
 * Owns the lifecycle of top-level sessions beyond the native pin/archive:
 * settle (a quiet "done" shelf, set by hand or after N idle days), snooze
 * (hidden until a time, waking early when the session needs you), per-session
 * read marks for turn outcomes, and the auto-settle preference.
 *
 * State is one validated document in the `session_lifecycle` storage domain,
 * so every browser and the agent see the same shelves. The browser calls
 * `POST /session-lifecycle/op`, follows `GET /session-lifecycle/events` (SSE),
 * and the agent uses the `session_lifecycle` tool. A one-minute sweep wakes
 * expired snoozes, wakes snoozes on a fresh failure or question, clears
 * settles the user has resumed, and applies auto-settle.
 *
 * The turn-outcome projection keeps the key `dsh-inbox-outcome` so outcomes
 * already cached for the former dsh-inbox plugin stay valid.
 */
import { artifactOf, startSummary } from './summary.js'

export const name = 'session-lifecycle'
export const inject = ['sessionProjections', 'storageDomain', 'webServer', 'connection', 'sessionController', 'workspaceRegistry', 'typertGateway']

export const KEY = 'dsh-inbox-outcome'
export const STATE_PATH = '/session-lifecycle/state'
export const OP_PATH = '/session-lifecycle/op'
export const EVENTS_PATH = '/session-lifecycle/events'
export const TOOL_NAME = 'session_lifecycle'
export const ACTIONS = ['list', 'settle', 'unsettle', 'snooze', 'wake', 'auto_settle', 'seen', 'hold', 'settings', 'restore']
export const AUTO_SETTLE_DAYS = [1, 3, 7, 14, 30, 90]
export const DEFAULT_SETTINGS = { autoSettleAfterDays: 7, foldWorking: true }

const DAY_MS = 86_400_000
const SWEEP_MS = 60_000
const MAX_BODY_BYTES = 256 * 1024
const MAX_SNOOZE_MS = 366 * DAY_MS
const HEARTBEAT_MS = 25_000

// ------------------------------------------------------- turn outcome projection
const reasons = new Set(['completed', 'blocked', 'error', 'max-tokens', 'interrupted', 'stopped'])
const uint = value => Number.isSafeInteger(value) && value >= 0
const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)
function schema(accept, label) {
  return {
    parse(value) { if (!accept(value)) throw new TypeError(`Invalid ${label}`); return value },
    safeParse(value) {
      try { return { success: true, data: this.parse(value) } } catch (error) { return { success: false, error } }
    },
  }
}
const isOutcome = v => v === null || (isRecord(v) && Object.keys(v).every(k => ['seq', 'time', 'reason', 'file'].includes(k))
  && (!Object.hasOwn(v, 'file') || v.file === true) && uint(v.seq) && uint(v.time) && v.time <= 8.64e15 && reasons.has(v.reason))

/** Latest turn outcome only: `{ seq, time, reason, file? }`, never chat text or tool arguments. */
export const definition = {
  key: KEY,
  stateVersion: 2,
  stateSchema: schema(v => isRecord(v) && typeof v.file === 'boolean' && uint(v.floor) && isOutcome(v.outcome), 'turn outcome checkpoint'),
  init: (_header, inheritedEventCount = 0) => ({ floor: inheritedEventCount, file: false, outcome: null }),
  apply(state, event) {
    if (event.seq < state.floor) return state // A fork is a new task, not a copy of its parent's completed work.
    if (event.type === 'turn/start') return { ...state, file: false, outcome: null }
    if (event.type === 'tool/result' && artifactOf(event)) return { ...state, file: true }
    if (event.type !== 'turn/end') return state
    const kind = event.data.reason.kind
    if (kind === 'aborted' || kind === 'forked') return state.outcome === null ? state : { ...state, outcome: null }
    return { ...state, outcome: { seq: event.seq, time: event.time, reason: reasons.has(kind) ? kind : 'stopped', ...(state.file ? { file: true } : {}) } }
  },
  wire: { summary: true, viewSchema: schema(isOutcome, 'turn outcome'), view: state => state.outcome },
}

// ------------------------------------------------------------- lifecycle state
/** A rejected operation; the message is shown to the user or the agent. */
export class OpError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpError'
  }
}

const isId = v => typeof v === 'string' && v.length > 0 && v.length <= 200 && !Object.hasOwn(Object.prototype, v)
const time = v => Number.isSafeInteger(v) && v > 0 && v <= 8.64e15
const callIds = v => Array.isArray(v) ? [...new Set(v.filter(isId))] : []

/**
 * One session record. Every field is optional; an empty record is dropped.
 * - `settledAt` + `settledBy`: on the settled shelf until the user prompts again.
 * - `keptAt`: the user un-settled it; auto-settle measures idleness from here.
 * - `snoozedUntil` / `snoozedAt` / `snoozedCalls`: hidden until the time; the
 *   questions already open at snooze time do not wake it early.
 * - `wokeAt` / `wokeBy`: the last wake, for the "woke" badge and idleness.
 * - `autoSettle: 'never'`: exempt from automatic settlement.
 * - `seen`: highest turn-outcome seq the user has read.
 */
function normalizeRecord(raw) {
  if (!isRecord(raw)) return null
  const r = {}
  if (time(raw.settledAt)) { r.settledAt = raw.settledAt; r.settledBy = raw.settledBy === 'auto' ? 'auto' : 'user' }
  if (time(raw.keptAt)) r.keptAt = raw.keptAt
  if (time(raw.snoozedUntil) && time(raw.snoozedAt)) {
    r.snoozedUntil = raw.snoozedUntil
    r.snoozedAt = raw.snoozedAt
    const calls = callIds(raw.snoozedCalls)
    if (calls.length) r.snoozedCalls = calls
  }
  if (time(raw.wokeAt)) { r.wokeAt = raw.wokeAt; r.wokeBy = ['timer', 'failure', 'question', 'user'].includes(raw.wokeBy) ? raw.wokeBy : 'timer' }
  if (raw.autoSettle === 'never') r.autoSettle = 'never'
  if (isRecord(raw.holds)) {
    const holds = Object.entries(raw.holds).filter(([id, until]) => isId(id) && time(until))
    if (holds.length) r.holds = Object.fromEntries(holds)
  }
  if (uint(raw.seen)) r.seen = raw.seen
  return Object.keys(r).length ? r : null
}

export function normalizeSettings(raw) {
  const s = isRecord(raw) ? raw : {}
  return {
    autoSettleAfterDays: s.autoSettleAfterDays === null ? null
      : AUTO_SETTLE_DAYS.includes(s.autoSettleAfterDays) ? s.autoSettleAfterDays : DEFAULT_SETTINGS.autoSettleAfterDays,
    foldWorking: typeof s.foldWorking === 'boolean' ? s.foldWorking : DEFAULT_SETTINGS.foldWorking,
  }
}

export function normalizeState(raw) {
  if (!isRecord(raw)) throw new TypeError('session lifecycle state must be an object')
  const sessions = {}
  for (const [id, value] of Object.entries(isRecord(raw.sessions) ? raw.sessions : {})) {
    if (!isId(id)) continue
    const record = normalizeRecord(value)
    if (record) sessions[id] = record
  }
  return { version: 1, sessions, settings: normalizeSettings(raw.settings) }
}

export const DOMAIN_SPEC = {
  name: 'session_lifecycle',
  version: 1,
  global: { schema: { parse: normalizeState, safeParse(value) { try { return { success: true, data: normalizeState(value) } } catch (error) { return { success: false, error } } } }, initial: { version: 1, sessions: {}, settings: DEFAULT_SETTINGS } },
  tables: {},
}

function requireSession(value) {
  if (!isId(value)) throw new OpError('sessionId must be a non-empty string')
  return value
}

const withRecord = (state, id, update) => {
  const current = state.sessions[id] ?? {}
  const next = normalizeRecord(update({ ...current }))
  const sessions = { ...state.sessions }
  if (next) sessions[id] = next
  else delete sessions[id]
  return { ...state, sessions }
}

// Read receipts are independent of placement; Undo must never roll one back.
function samePlacement(a, b) {
  const placement = r => { const p = normalizeRecord(r) ?? {}; delete p.seen; delete p.holds; return JSON.stringify(p) }
  return placement(a) === placement(b)
}
const clearSnooze = r => { delete r.snoozedUntil; delete r.snoozedAt; delete r.snoozedCalls; return r }
const clearSettle = r => { delete r.settledAt; delete r.settledBy; return r }

/** Parse `until` (epoch ms or ISO string) or `minutes` into a future wake time. */
function wakeTime(op, now) {
  let until
  if (op.minutes !== undefined) {
    if (!Number.isFinite(op.minutes) || op.minutes <= 0) throw new OpError('minutes must be a positive number')
    until = now + Math.round(op.minutes * 60_000)
  } else if (typeof op.until === 'number') until = op.until
  else if (typeof op.until === 'string') until = Date.parse(op.until)
  else throw new OpError('snooze needs until (epoch ms or ISO time) or minutes')
  if (!Number.isSafeInteger(until) || until <= now) throw new OpError('until must be in the future')
  if (until - now > MAX_SNOOZE_MS) throw new OpError('snooze at most one year')
  return until
}

/**
 * Apply one operation.
 * @returns `{ state, result }`; `state` is the input reference when nothing changes.
 * @throws OpError for invalid input.
 */
export function applyOp(state, op, now = Date.now()) {
  switch (op?.action) {
    case 'list':
      return { state, result: {} }
    case 'settle': {
      const id = requireSession(op.sessionId)
      return { state: withRecord(state, id, r => clearSnooze({ ...r, settledAt: now, settledBy: op.by === 'auto' ? 'auto' : 'user' })), result: {} }
    }
    case 'unsettle': {
      const id = requireSession(op.sessionId)
      if (!state.sessions[id]?.settledAt) return { state, result: {} }
      return { state: withRecord(state, id, r => ({ ...clearSettle(r), keptAt: now })), result: {} }
    }
    case 'snooze': {
      const id = requireSession(op.sessionId)
      const until = wakeTime(op, now)
      return { state: withRecord(state, id, r => ({ ...clearSettle(r), snoozedUntil: until, snoozedAt: now, snoozedCalls: callIds(op.openCalls) })), result: { until } }
    }
    case 'wake': {
      const id = requireSession(op.sessionId)
      if (!state.sessions[id]?.snoozedUntil || (op.snoozedAt !== undefined && state.sessions[id].snoozedAt !== op.snoozedAt)) return { state, result: {} }
      const by = ['failure', 'question', 'user'].includes(op.by) ? op.by : 'user'
      return { state: withRecord(state, id, r => ({ ...clearSnooze(r), wokeAt: now, wokeBy: by })), result: {} }
    }
    case 'auto_settle': {
      const id = requireSession(op.sessionId)
      if (op.mode !== 'never' && op.mode !== 'follow') throw new OpError('mode must be "never" or "follow"')
      if ((state.sessions[id]?.autoSettle === 'never') === (op.mode === 'never')) return { state, result: {} }
      return { state: withRecord(state, id, r => { if (op.mode === 'never') r.autoSettle = 'never'; else delete r.autoSettle; return r }), result: {} }
    }
    case 'hold': {
      const id = requireSession(op.sessionId), call = requireSession(op.callId)
      const until = op.until === 0 ? 0 : wakeTime(op, now)
      if (op.import && state.sessions[id]?.holds?.[call]) return { state, result: {} }
      return { state: withRecord(state, id, r => {
        const holds = { ...r.holds }
        if (until) holds[call] = until
        else delete holds[call]
        return { ...r, holds }
      }), result: {} }
    }
    case 'seen': {
      const marks = Array.isArray(op.marks) ? op.marks : [{ sessionId: op.sessionId, seq: op.seq }]
      if (marks.length > 500 || !marks.every(m => isId(m?.sessionId) && uint(m?.seq))) throw new OpError('Invalid read receipt batch')
      let sessions = state.sessions
      for (const { sessionId, seq } of marks) {
        if ((sessions[sessionId]?.seen ?? -1) >= seq) continue
        if (sessions === state.sessions) sessions = { ...sessions }
        sessions[sessionId] = { ...sessions[sessionId], seen: seq }
      }
      return { state: sessions === state.sessions ? state : { ...state, sessions }, result: {} }
    }
    case 'restore': {
      // Undo: put back the exact record captured before the undone action.
      const id = requireSession(op.sessionId)
      const current = state.sessions[id] ?? null
      if (!Object.hasOwn(op, 'expected') || !samePlacement(current, op.expected)) throw new OpError('Session changed; Undo is no longer available')
      const record = normalizeRecord({ ...op.record, seen: current?.seen, holds: current?.holds })
      if (JSON.stringify(record) === JSON.stringify(state.sessions[id] ?? null)) return { state, result: {} }
      const sessions = { ...state.sessions }
      if (record) sessions[id] = record
      else delete sessions[id]
      return { state: { ...state, sessions }, result: {} }
    }
    case 'settings': {
      const settings = normalizeSettings({ ...state.settings, ...(isRecord(op.settings) ? op.settings : {}) })
      if (JSON.stringify(settings) === JSON.stringify(state.settings)) return { state, result: {} }
      return { state: { ...state, settings }, result: {} }
    }
    default:
      throw new OpError(`action must be one of ${ACTIONS.join(', ')}`)
  }
}

// --------------------------------------------------------------------- sweep
const FAILURES = new Set(['error', 'blocked', 'interrupted', 'max-tokens'])

/** Open question call ids from the native `userQuestions` projection summary. */
export function openQuestionCalls(values) {
  const answered = new Set([...(values?.inbox?.['next-turn'] ?? []), ...(values?.inbox?.['next-step'] ?? [])]
    .filter(m => m?.source?.kind === 'user-question-reply').map(m => m.source.callId))
  return (values?.userQuestions?.active ?? []).map(q => q?.callId).filter(id => isId(id) && !answered.has(id))
}

/**
 * One sweep over the Host session list. Pure: it reads summaries and returns
 * the next state. Rules, in order, for each top-level session with a record or
 * an auto-settle candidate:
 * 1. A snooze whose time passed wakes (`timer`). A snooze wakes early when a
 *    turn failed after it began or a question opened that was not open then.
 * 2. A settle ends once the user prompts again (`updatedAt` after `settledAt`).
 * 3. Auto-settle: off for subagents, blank, pinned, archived, running,
 *    queued, question-waiting, snoozed, already settled, and `never` sessions;
 *    otherwise settles when the latest of prompt, turn end, un-settle and wake
 *    is older than the configured days.
 * Unlisted sessions keep their records: an incomplete catalog is not a deletion.
 */
export function sweep(state, summaries, { now = Date.now(), pinned = [], archived = [], pending = [] } = {}) {
  const days = state.settings.autoSettleAfterDays
  const pins = new Set(pinned), gone = new Set(archived)
  const sessions = { ...state.sessions }
  const facts = lifecycleFacts(summaries, archived, now, pending)
  let changed = false
  for (const [id, r] of Object.entries(sessions)) {
    if (!Object.values(r.holds ?? {}).some(until => until <= now)) continue
    const next = normalizeRecord({ ...r, holds: Object.fromEntries(Object.entries(r.holds).filter(([, until]) => until > now)) })
    if (next) sessions[id] = next; else delete sessions[id]
    changed = true
  }
  for (const [id, f] of facts) {
    const before = sessions[id]
    let r = before ? { ...before } : null
    if (r?.snoozedUntil) {
      const until = r.snoozedUntil
      const why = f.failure > r.snoozedAt ? 'failure' : f.decision || f.questions.some(call => !r.snoozedCalls?.includes(call)) ? 'question' : until <= now ? 'timer' : null
      if (why) r = { ...clearSnooze(r), wokeAt: why === 'timer' ? until : now, wokeBy: why }
    }
    if (r?.settledAt && (f.prompt > r.settledAt || f.failure > r.settledAt || f.decision || f.questions.length)) r = clearSettle(r)
    const ageFrom = Math.max(f.activity, r?.keptAt ?? 0, r?.wokeAt ?? 0)
    if (days !== null && !f.unknown && !f.busy && !f.decision && !f.questions.length && !pins.has(id) && !gone.has(id)
      && !r?.settledAt && !r?.snoozedUntil && r?.autoSettle !== 'never' && ageFrom > 0 && ageFrom < now - days * DAY_MS) {
      r = { ...r, settledAt: now, settledBy: 'auto' }
    }
    const next = normalizeRecord(r)
    if (JSON.stringify(next) === JSON.stringify(before ?? null)) continue
    changed = true
    if (next) sessions[id] = next
    else delete sessions[id]
  }
  return changed ? { ...state, sessions } : state
}

// Only delegated children roll up. A fork is an independent root, and an
// archived child, missing ancestor or cycle cannot claim another session.
function lifecycleFacts(rows, archived, now = Date.now(), pending = []) {
  const decisions = new Set(pending.filter(p => p.event === 'approval/request').map(p => String(p.agentId)))
  const liveQuestions = new Set(pending.filter(p => p.event === 'user-questions/request').map(p => String(p.agentId)))
  const byId = new Map(rows.map(row => [row.sessionId, row])), gone = new Set(archived), facts = new Map()
  for (const row of rows) {
    let root = row
    const path = new Set()
    while (root?.origin === 'subagent' && !path.has(root.sessionId) && !gone.has(root.sessionId)) {
      path.add(root.sessionId); root = byId.get(root.parentSessionId)
    }
    if (!root || root.origin === 'subagent' || gone.has(root.sessionId) || root.blank) continue
    const id = root.sessionId, f = facts.get(id) ?? { prompt: root.updatedAt, activity: 0, failure: 0, questions: [], busy: false, unknown: false, decision: false }
    const values = row.projections?.values ?? {}, out = values[KEY], qs = values.userQuestions?.active ?? []
    f.activity = Math.max(f.activity, row.updatedAt || 0, out?.time ?? 0)
    if (out && FAILURES.has(out.reason)) f.failure = Math.max(f.failure, out.time)
    const calls = openQuestionCalls(values)
    f.questions.push(...calls.map(call => JSON.stringify([row.sessionId, call])))
    // Gateway approvals are live interactions, not necessarily persisted question intents.
    f.decision ||= decisions.has(row.sessionId) || (liveQuestions.has(row.sessionId) && !calls.length)
    f.decision ||= qs.some(q => calls.includes(q.callId) && q.questions?.some(item => ['approval', 'plan-review'].includes(item.intent?.kind)))
    f.queued ||= Boolean(values.inbox?.['next-turn']?.length)
    f.busy ||= row.running || f.queued || values.goal?.phase === 'active' || (out == null && now - row.updatedAt < 120_000)
    f.otherWork ||= (row !== root && row.running) || values.goal?.phase === 'active'
    f.unknown ||= row.formatStatus === 'migration-required' || !Object.hasOwn(values, KEY) || !Object.hasOwn(values, 'userQuestions') || !Object.hasOwn(values, 'inbox')
    facts.set(id, f)
  }
  return facts
}

// ----------------------------------------------------------------- transport
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

/** Open the domain, retrying while a previous generation of this plugin is still closing it. */
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

const TOOL_ACTIONS = ['list', 'settle', 'unsettle', 'snooze', 'wake', 'auto_settle']
const TOOL_DESCRIPTION = 'Inspect or change the current top-level session’s sidebar placement, not its execution. Only change it when the user asks.'

export async function apply(ctx) {
  await ctx.sessionProjections.register(definition)
  ctx.inject(['storageDomain', 'sessionQuery', 'sessionController', 'llm', 'connection', 'webServer'], startSummary)

  let closed = false
  let tail = Promise.resolve()
  const ready = openDomain(ctx)
  ready.catch(error => ctx.logger?.warn?.(`session-lifecycle: cannot open storage: ${error?.message ?? error}`))
  ctx.effect(() => async () => {
    closed = true
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'session-lifecycle: storage domain')

  const streams = new Set()
  const broadcast = state => {
    const frame = `data: ${JSON.stringify(state)}\n\n`
    for (const res of streams) res.write(frame)
  }
  const current = domain => normalizeState(domain.global.get())

  // Mutations and sweeps run one at a time so no write is lost.
  const mutate = transform => {
    const task = tail.then(async () => {
      if (closed) throw new OpError('session lifecycle is unloading')
      const domain = await ready
      const before = current(domain)
      const { state, result } = await transform(before)
      if (state !== before) {
        await domain.global.set(state)
        broadcast(state)
      }
      return { ...result, state }
    })
    tail = task.catch(() => {})
    return task
  }
  const catalog = () => ctx.sessionController.list({}, AbortSignal.timeout(30_000)).then(value => value.items)
  const registry = () => ctx.workspaceRegistry
  const pending = () => ctx.typertGateway.getPendingRemoteEvents()
  const run = (op, ownTurn = false) => mutate(async state => {
    if (op?.action === 'snooze' || op?.action === 'settle') {
      const id = requireSession(op.sessionId), facts = lifecycleFacts(await catalog(), registry().archivedSessionIds, Date.now(), pending()).get(id)
      if (!facts) throw new OpError('Select a non-archived top-level session')
      if (op.action === 'snooze' && (facts.decision || facts.queued)) throw new OpError('Resolve the pending decision or queued turn first')
      if (op.action === 'settle' && ((ownTurn ? facts.otherWork || facts.queued : facts.busy) || facts.decision || facts.questions.length)) throw new OpError('Session is working or waiting for you')
      if (op.action === 'snooze') op = { ...op, openCalls: [...new Set([...facts.questions, ...callIds(op.openCalls)])] }
    }
    const change = applyOp(state, op)
    const before = state.sessions[op.sessionId] ?? null, after = change.state.sessions[op.sessionId] ?? null
    return { ...change, result: { ...change.result, before, after } }
  })

  const runSweep = () => mutate(async state => {
    const items = await catalog(), { pinnedSessionIds: pinned, archivedSessionIds: archived } = registry()
    if (!Array.isArray(pinned) || !Array.isArray(archived)) return { state, result: {} }
    const next = sweep(state, items, { pinned, archived, pending: pending() })
    if (next !== state) {
      for (const [sessionId, record] of Object.entries(next.sessions)) {
        if (record.settledBy !== 'auto' || state.sessions[sessionId]?.settledAt === record.settledAt) continue
        // A background job or scheduled continuation is not necessarily a running turn.
        const activities = await ctx.waterfall('workspace/session-activity', { sessionId }, () => Promise.resolve([]))
        if (!activities.length) continue
        if (state.sessions[sessionId]) next.sessions[sessionId] = state.sessions[sessionId]
        else delete next.sessions[sessionId]
      }
    }
    return { state: JSON.stringify(next.sessions) === JSON.stringify(state.sessions) ? state : next, result: {} }
  }).catch(error => ctx.logger?.warn?.(`session-lifecycle: sweep failed: ${error?.message ?? error}`))
  ctx.effect(() => {
    const first = setTimeout(runSweep, 5_000)
    const timer = setInterval(runSweep, SWEEP_MS)
    return () => { clearTimeout(first); clearInterval(timer) }
  }, 'session-lifecycle: sweep')

  const rejected = (req, res) => {
    const peer = ctx.connection.admit(req)
    if (!('rejection' in peer) && peer.peer.principal.kind === 'owner') return false
    res.statusCode = 'rejection' in peer ? peer.rejection : 403
    res.end()
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try { sendJson(res, 200, current(await ready)) } catch (error) {
        sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
    },
  }), `session-lifecycle: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: OP_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      if (req.headers['content-type']?.split(';')[0] !== 'application/json') return sendJson(res, 415, { message: 'JSON only' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let op = null
      try { op = JSON.parse(raw) } catch { /* Rejected by applyOp. */ }
      try {
        const { state, ...result } = await run(op)
        sendJson(res, 200, { ...result, settings: state.settings })
      } catch (error) {
        sendJson(res, error instanceof OpError ? 400 : 500, { message: error?.message ?? String(error) })
      }
    },
  }), `session-lifecycle: POST ${OP_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: EVENTS_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      let domain
      try { domain = await ready } catch (error) {
        return sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
      if (res.destroyed) return
      if (closed) return sendJson(res, 503, { message: 'session lifecycle is unloading' })
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      res.write(`retry: 3000\ndata: ${JSON.stringify(current(domain))}\n\n`)
      streams.add(res)
      const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS)
      res.once('close', () => { clearInterval(heartbeat); streams.delete(res) })
    },
  }), `session-lifecycle: GET ${EVENTS_PATH}`)

  ctx.effect(() => () => {
    for (const res of streams) res.end()
    streams.clear()
  }, 'session-lifecycle: close event streams')

  // Agent tool: the same operations, available only where the tool registry exists.
  ctx.inject(['tools'], toolCtx => {
    toolCtx.effect(() => toolCtx.tools.register({
      name: TOOL_NAME,
      description: TOOL_DESCRIPTION,
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: TOOL_ACTIONS, description: 'Operation to perform.' },
          until: { type: 'string', description: 'snooze: wake time as an ISO 8601 timestamp.' },
          minutes: { type: 'number', description: 'snooze: wake after this many minutes (alternative to until).' },
          mode: { type: 'string', enum: ['never', 'follow'], description: 'auto_settle: never auto-settle this session, or follow the setting.' },
        },
        required: ['action'],
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      },
      async execute(args, exec) {
        const session = exec.agent?.session
        if (!session || session.header.origin === 'subagent' || !TOOL_ACTIONS.includes(args.action)) throw new OpError('Requires a top-level session and a lifecycle action')
        const { state } = await run({ action: args.action, minutes: args.minutes, until: args.until, mode: args.mode, sessionId: session.id }, true)
        return { sessionId: session.id, record: state.sessions[session.id] ?? null }
      },
    }), `session-lifecycle: ${TOOL_NAME} tool`)
  })
}
