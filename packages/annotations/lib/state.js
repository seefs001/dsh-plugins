import { randomUUID } from 'node:crypto'

export const MAX_SESSIONS = 120
export const MAX_PER_SESSION = 80
export const MAX_SESSION_ID_CHARS = 200
export const MAX_NOTE_CHARS = 2000
export const MAX_QUOTE_CHARS = 2000
export const MAX_SNIPPET_CHARS = 4000
export const MAX_AFFIX_CHARS = 80
export const MAX_PATH_CHARS = 512
export const MAX_DIGEST_CHARS = 128
export const MAX_INJECT_ITEMS = 20
export const MAX_INJECT_BYTES = 24 * 1024
export const CONTEXT_SUMMARY_MAX_CHARS = 120

export const INTENTS = ['note', 'fix', 'question', 'revise', 'constraint']
export const STATUSES = ['draft', 'consumed', 'resolved', 'outdated']
export const ACTIONS = ['list', 'add', 'update', 'remove', 'toggle', 'requeue', 'clear', 'setAllEnabled']

export class OpError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpError'
  }
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)

const clampText = (value, max) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.replace(/\r\n?/g, '\n').trim()
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max)
}

const clampRaw = (value, max) => {
  if (typeof value !== 'string') return ''
  const normalized = value.replace(/\r\n?/g, '\n')
  return normalized.length <= max ? normalized : normalized.slice(0, max)
}

const positiveInt = value => (Number.isInteger(value) && value > 0 ? value : undefined)

export function validSessionId(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_SESSION_ID_CHARS
}

export function normalizeAnchor(raw) {
  if (!isRecord(raw) || typeof raw.kind !== 'string') return null
  if (raw.kind === 'git-diff') {
    const path = clampText(raw.path, MAX_PATH_CHARS)
    if (!path) return null
    const source = raw.source === 'cr' ? 'cr' : 'local'
    const side = raw.side === 'L' || raw.side === 'R' ? raw.side : 'file'
    const startLine = side === 'file' ? undefined : positiveInt(raw.startLine)
    const endLine = side === 'file' ? undefined : positiveInt(raw.endLine) ?? startLine
    if (side !== 'file' && startLine === undefined) return null
    const lo = startLine !== undefined && endLine !== undefined ? Math.min(startLine, endLine) : undefined
    const hi = startLine !== undefined && endLine !== undefined ? Math.max(startLine, endLine) : undefined
    const digest = clampText(raw.digest, MAX_DIGEST_CHARS)
    const snippet = clampRaw(raw.snippet, MAX_SNIPPET_CHARS)
    const changeUrl = source === 'cr' ? clampText(raw.changeUrl, MAX_PATH_CHARS) : ''
    return {
      kind: 'git-diff',
      source,
      path,
      side,
      ...(lo !== undefined ? { startLine: lo, endLine: hi } : {}),
      ...(digest ? { digest } : {}),
      ...(snippet ? { snippet } : {}),
      ...(changeUrl ? { changeUrl } : {}),
    }
  }
  if (raw.kind === 'message-text') {
    const speaker = raw.speaker === 'user' ? 'user' : raw.speaker === 'assistant' ? 'assistant' : null
    if (!speaker) return null
    const quote = clampText(raw.quote, MAX_QUOTE_CHARS)
    if (!quote) return null
    const prefix = clampRaw(raw.prefix, MAX_AFFIX_CHARS)
    const suffix = clampRaw(raw.suffix, MAX_AFFIX_CHARS)
    const messageKey = clampText(raw.messageKey, 160)
    const turnSeq = positiveInt(raw.turnSeq)
    return {
      kind: 'message-text',
      speaker,
      quote,
      ...(prefix ? { prefix } : {}),
      ...(suffix ? { suffix } : {}),
      ...(messageKey ? { messageKey } : {}),
      ...(turnSeq !== undefined ? { turnSeq } : {}),
    }
  }
  return null
}

export function normalizeItem(raw) {
  if (!isRecord(raw)) return null
  const id = clampText(raw.id, 128)
  const shortId = clampText(raw.shortId, 16)
  const anchor = normalizeAnchor(raw.anchor)
  if (!id || !shortId || !anchor) return null
  const note = clampText(raw.note, MAX_NOTE_CHARS)
  const intent = INTENTS.includes(raw.intent) ? raw.intent : 'note'
  const status = STATUSES.includes(raw.status) ? raw.status : 'draft'
  const enabled = typeof raw.enabled === 'boolean' ? raw.enabled : status === 'draft'
  const createdAt = Number.isFinite(raw.createdAt) ? Math.floor(raw.createdAt) : 0
  const updatedAt = Number.isFinite(raw.updatedAt) ? Math.floor(raw.updatedAt) : createdAt
  const consumedAtTurn = positiveInt(raw.consumedAtTurn)
  return {
    id,
    shortId,
    anchor,
    note,
    intent,
    enabled,
    status,
    ...(consumedAtTurn !== undefined ? { consumedAtTurn } : {}),
    createdAt,
    updatedAt,
  }
}

function pruneBucketItems(items) {
  if (items.length <= MAX_PER_SESSION) return items
  const priority = status => (status === 'draft' ? 3 : status === 'outdated' ? 2 : status === 'consumed' ? 1 : 0)
  const indexed = items.map((item, idx) => ({ item, idx }))
  indexed.sort((a, b) => priority(b.item.status) - priority(a.item.status) || b.item.updatedAt - a.item.updatedAt || b.idx - a.idx)
  const kept = indexed.slice(0, MAX_PER_SESSION)
  kept.sort((a, b) => a.idx - b.idx)
  return kept.map(entry => entry.item)
}

export function normalizeBucket(raw) {
  if (!isRecord(raw) || !Array.isArray(raw.items)) return null
  const seen = new Set()
  const items = []
  for (const entry of raw.items) {
    const clean = normalizeItem(entry)
    if (!clean || seen.has(clean.id)) continue
    seen.add(clean.id)
    items.push(clean)
  }
  const pruned = pruneBucketItems(items)
  let maxSeq = Number.isInteger(raw.nextSeq) && raw.nextSeq >= 1 ? raw.nextSeq : 1
  for (const item of pruned) {
    const m = /^A(\d+)$/.exec(item.shortId)
    if (m) maxSeq = Math.max(maxSeq, Number(m[1]) + 1)
  }
  const updatedAt = Number.isFinite(raw.updatedAt) ? Math.floor(raw.updatedAt) : 0
  return { nextSeq: maxSeq, updatedAt, items: pruned }
}

function pruneSessions(sessions) {
  const entries = Object.entries(sessions).filter(([, bucket]) => bucket.items.length > 0)
  if (entries.length <= MAX_SESSIONS) return Object.fromEntries(entries)
  entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt)
  return Object.fromEntries(entries.slice(0, MAX_SESSIONS))
}

export function normalizeState(raw) {
  if (!isRecord(raw) || !isRecord(raw.sessions)) {
    throw new TypeError('annotations state must be an object with a sessions map')
  }
  const sessions = {}
  for (const [sessionId, bucketRaw] of Object.entries(raw.sessions)) {
    if (!validSessionId(sessionId)) continue
    const clean = normalizeBucket(bucketRaw)
    if (clean && clean.items.length > 0) sessions[sessionId.trim()] = clean
  }
  return { version: 1, sessions: pruneSessions(sessions) }
}

export const STATE_SCHEMA = {
  parse: normalizeState,
  safeParse(value) {
    try { return { success: true, data: normalizeState(value) } } catch (error) { return { success: false, error } }
  },
}

export const DOMAIN_SPEC = {
  name: 'annotations',
  version: 1,
  global: { schema: STATE_SCHEMA, initial: { version: 1, sessions: {} } },
  tables: {},
}

export function getSessionItems(state, sessionId) {
  if (!validSessionId(sessionId)) return []
  return state.sessions[sessionId.trim()]?.items ?? []
}

function withBucket(state, sessionId, bucket) {
  const nextSessions = { ...state.sessions }
  if (!bucket || bucket.items.length === 0) delete nextSessions[sessionId]
  else nextSessions[sessionId] = { ...bucket, items: pruneBucketItems(bucket.items) }
  return { version: 1, sessions: pruneSessions(nextSessions) }
}

export function applyOp(state, op, now = Date.now()) {
  if (!isRecord(op) || typeof op.action !== 'string') {
    throw new OpError(`action must be one of ${ACTIONS.join(', ')}`)
  }
  if (!validSessionId(op.sessionId)) {
    throw new OpError('sessionId must be a non-empty string')
  }
  const sessionId = op.sessionId.trim()
  const existing = state.sessions[sessionId] ?? { nextSeq: 1, updatedAt: 0, items: [] }

  switch (op.action) {
    case 'list':
      return { state, result: { sessionId, items: existing.items, updatedAt: existing.updatedAt } }

    case 'add': {
      const anchor = normalizeAnchor(op.anchor)
      if (!anchor) throw new OpError('valid anchor is required')
      const note = clampText(op.note ?? '', MAX_NOTE_CHARS)
      if (!note) throw new OpError('annotation note must not be empty')
      const intent = INTENTS.includes(op.intent) ? op.intent : 'note'
      const item = {
        id: randomUUID(),
        shortId: `A${existing.nextSeq}`,
        anchor,
        note,
        intent,
        enabled: op.enabled !== false,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      }
      const nextBucket = {
        nextSeq: existing.nextSeq + 1,
        updatedAt: now,
        items: [...existing.items, item],
      }
      const nextState = withBucket(state, sessionId, nextBucket)
      const items = getSessionItems(nextState, sessionId)
      return { state: nextState, result: { sessionId, item, items, updatedAt: now } }
    }

    case 'update': {
      const id = clampText(op.id, 128)
      const idx = existing.items.findIndex(item => item.id === id)
      if (idx < 0) throw new OpError('annotation not found')
      const current = existing.items[idx]
      const nextNote = op.note !== undefined ? clampText(op.note, MAX_NOTE_CHARS) : current.note
      if (!nextNote) throw new OpError('annotation note must not be empty')
      const nextIntent = op.intent !== undefined
        ? (INTENTS.includes(op.intent) ? op.intent : current.intent)
        : current.intent
      const nextStatus = op.status !== undefined
        ? (STATUSES.includes(op.status) ? op.status : current.status)
        : current.status
      const nextEnabled = typeof op.enabled === 'boolean' ? op.enabled : current.enabled
      const updated = {
        ...current,
        note: nextNote,
        intent: nextIntent,
        status: nextStatus,
        enabled: nextEnabled,
        updatedAt: now,
      }
      const nextItems = existing.items.with(idx, updated)
      const nextState = withBucket(state, sessionId, { ...existing, updatedAt: now, items: nextItems })
      return { state: nextState, result: { sessionId, item: updated, items: getSessionItems(nextState, sessionId), updatedAt: now } }
    }

    case 'toggle': {
      const id = clampText(op.id, 128)
      const idx = existing.items.findIndex(item => item.id === id)
      if (idx < 0) throw new OpError('annotation not found')
      const current = existing.items[idx]
      const updated = { ...current, enabled: !current.enabled, updatedAt: now }
      const nextItems = existing.items.with(idx, updated)
      const nextState = withBucket(state, sessionId, { ...existing, updatedAt: now, items: nextItems })
      return { state: nextState, result: { sessionId, item: updated, items: getSessionItems(nextState, sessionId), updatedAt: now } }
    }

    case 'requeue': {
      const id = clampText(op.id, 128)
      const idx = existing.items.findIndex(item => item.id === id)
      if (idx < 0) throw new OpError('annotation not found')
      const current = existing.items[idx]
      const { consumedAtTurn: _dropped, ...rest } = current
      const updated = { ...rest, status: 'draft', enabled: true, updatedAt: now }
      const nextItems = existing.items.with(idx, updated)
      const nextState = withBucket(state, sessionId, { ...existing, updatedAt: now, items: nextItems })
      return { state: nextState, result: { sessionId, item: updated, items: getSessionItems(nextState, sessionId), updatedAt: now } }
    }

    case 'remove': {
      const id = clampText(op.id, 128)
      const idx = existing.items.findIndex(item => item.id === id)
      if (idx < 0) return { state, result: { sessionId, removed: false, items: existing.items, updatedAt: existing.updatedAt } }
      const nextItems = existing.items.toSpliced(idx, 1)
      const nextState = withBucket(state, sessionId, { ...existing, updatedAt: now, items: nextItems })
      return { state: nextState, result: { sessionId, removed: true, items: getSessionItems(nextState, sessionId), updatedAt: now } }
    }

    case 'clear': {
      const scope = op.scope === 'all' || op.scope === 'consumed' || op.scope === 'resolved' ? op.scope : 'draft'
      const nextItems = scope === 'all'
        ? []
        : existing.items.filter(item => item.status !== scope)
      if (nextItems.length === existing.items.length) {
        return { state, result: { sessionId, items: existing.items, updatedAt: existing.updatedAt } }
      }
      const nextState = withBucket(state, sessionId, { ...existing, updatedAt: now, items: nextItems })
      return { state: nextState, result: { sessionId, items: getSessionItems(nextState, sessionId), updatedAt: now } }
    }

    case 'setAllEnabled': {
      const enabled = Boolean(op.enabled)
      let changed = false
      const nextItems = existing.items.map(item => {
        if (item.status !== 'draft' || item.enabled === enabled) return item
        changed = true
        return { ...item, enabled, updatedAt: now }
      })
      if (!changed) return { state, result: { sessionId, items: existing.items, updatedAt: existing.updatedAt } }
      const nextState = withBucket(state, sessionId, { ...existing, updatedAt: now, items: nextItems })
      return { state: nextState, result: { sessionId, items: getSessionItems(nextState, sessionId), updatedAt: now } }
    }

    default:
      throw new OpError(`unknown action "${op.action}"`)
  }
}

export function markConsumed(state, sessionId, ids, turn, now = Date.now()) {
  if (!validSessionId(sessionId) || !Array.isArray(ids) || ids.length === 0) return state
  const sid = sessionId.trim()
  const existing = state.sessions[sid]
  if (!existing) return state
  const target = new Set(ids)
  let changed = false
  const nextItems = existing.items.map(item => {
    if (!target.has(item.id) || item.status !== 'draft') return item
    changed = true
    return {
      ...item,
      status: 'consumed',
      enabled: false,
      ...(positiveInt(turn) !== undefined ? { consumedAtTurn: turn } : {}),
      updatedAt: now,
    }
  })
  if (!changed) return state
  return withBucket(state, sid, { ...existing, updatedAt: now, items: nextItems })
}

export function pendingDraftItems(state, sessionId) {
  return getSessionItems(state, sessionId).filter(item => item.status === 'draft' && item.enabled)
}

function escapeAttr(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeTagBody(value) {
  return String(value ?? '').replaceAll('</excerpt>', '&lt;/excerpt&gt;').replaceAll('</note>', '&lt;/note&gt;')
}

function boundSummary(summary) {
  return summary.length <= CONTEXT_SUMMARY_MAX_CHARS
    ? summary
    : `${summary.slice(0, CONTEXT_SUMMARY_MAX_CHARS - 1)}…`
}

function shortAnchorLabel(item) {
  const { anchor } = item
  if (anchor.kind === 'git-diff') {
    const base = anchor.path.split('/').pop() || anchor.path
    if (anchor.side === 'file' || anchor.startLine === undefined) return base
    const range = anchor.endLine && anchor.endLine !== anchor.startLine
      ? `${anchor.startLine}-${anchor.endLine}`
      : String(anchor.startLine)
    return `${base}:${range}`
  }
  return anchor.speaker === 'user' ? 'user' : 'assistant'
}

export function formatAnnotationsContext(items, turn) {
  if (!Array.isArray(items) || items.length === 0) return null
  const selected = items.slice(0, MAX_INJECT_ITEMS)
  const blocks = []
  const includedIds = []
  let usedBytes = 0
  const header = `<user-annotations count="${selected.length}"${positiveInt(turn) !== undefined ? ` turn="${turn}"` : ''}>`
  const footer = '</user-annotations>'
  usedBytes += Buffer.byteLength(`${header}\n${footer}`, 'utf8')

  for (const item of selected) {
    const { anchor } = item
    const attrs = [`id="${escapeAttr(item.shortId)}"`]
    if (anchor.kind === 'git-diff') {
      attrs.push('source="git-diff"')
      attrs.push(`scope="${escapeAttr(anchor.source)}"`)
      attrs.push(`path="${escapeAttr(anchor.path)}"`)
      attrs.push(`side="${escapeAttr(anchor.side)}"`)
      if (anchor.startLine !== undefined) {
        const lines = anchor.endLine && anchor.endLine !== anchor.startLine
          ? `${anchor.startLine}-${anchor.endLine}`
          : String(anchor.startLine)
        attrs.push(`lines="${lines}"`)
      }
      if (anchor.digest) attrs.push(`digest="${escapeAttr(anchor.digest)}"`)
    } else {
      attrs.push(`source="${anchor.speaker === 'user' ? 'user-message' : 'assistant-message'}"`)
      if (anchor.turnSeq !== undefined) attrs.push(`turn="${anchor.turnSeq}"`)
    }
    if (item.intent && item.intent !== 'note') attrs.push(`intent="${escapeAttr(item.intent)}"`)
    if (item.status === 'outdated') attrs.push('status="outdated"')

    const excerptRaw = anchor.kind === 'git-diff' ? (anchor.snippet ?? '') : anchor.quote
    const buildBlock = excerptText => {
      const parts = [`  <item ${attrs.join(' ')}>`]
      if (excerptText) parts.push(`    <excerpt>\n${escapeTagBody(excerptText)}\n    </excerpt>`)
      parts.push(`    <note>${escapeTagBody(item.note)}</note>`)
      parts.push('  </item>')
      return parts.join('\n')
    }

    let block = buildBlock(excerptRaw)
    let blockBytes = Buffer.byteLength(`${block}\n`, 'utf8')
    if (usedBytes + blockBytes > MAX_INJECT_BYTES && excerptRaw.length > 240) {
      block = buildBlock(`${excerptRaw.slice(0, 240)}…`)
      blockBytes = Buffer.byteLength(`${block}\n`, 'utf8')
    }
    if (usedBytes + blockBytes > MAX_INJECT_BYTES && blocks.length > 0) break
    usedBytes += blockBytes
    blocks.push(block)
    includedIds.push(item.id)
  }

  if (blocks.length === 0) return null
  const includedItems = selected.filter(item => includedIds.includes(item.id))
  const labels = includedItems.slice(0, 4).map(item => `${item.shortId} ${shortAnchorLabel(item)}`)
  const extra = includedItems.length > 4 ? ` +${includedItems.length - 4}` : ''
  const summary = boundSummary(`${includedItems.length} annotation${includedItems.length === 1 ? '' : 's'}: ${labels.join(', ')}${extra}`)
  const text = `${header}\n${blocks.join('\n')}\n${footer}`
  return { text, summary, annotationIds: includedIds, count: includedItems.length }
}
