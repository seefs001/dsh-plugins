const CHUNK_SIZE = 64
const FLUSH_DEBOUNCE_MS = 1000
const MAX_DIFF_PAIR_CHARS = 32 * 1024
const MAX_DIFF_SIDE_CHARS = 32 * 1024
const MAX_NEW_TEXT_CHARS = 64 * 1024
const DIFF_CONTEXT_LINES = 5

function truncateText(text, limit) {
  if (typeof text !== 'string' || text.length <= limit) return text
  const omitted = text.length - limit
  return `${text.slice(0, limit)}\n… [truncated ${omitted} chars]`
}

function compactDiffWindow(oldText, newText) {
  if (oldText.length + newText.length <= MAX_DIFF_PAIR_CHARS) return { oldText, newText }
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const minLen = Math.min(oldLines.length, newLines.length)
  let prefix = 0
  while (prefix < minLen && oldLines[prefix] === newLines[prefix]) prefix++
  let suffix = 0
  while (
    suffix < minLen - prefix
    && oldLines[oldLines.length - 1 - suffix] === newLines[newLines.length - 1 - suffix]
  ) suffix++
  const start = Math.max(0, prefix - DIFF_CONTEXT_LINES)
  const oldEnd = Math.min(oldLines.length, oldLines.length - suffix + DIFF_CONTEXT_LINES)
  const newEnd = Math.min(newLines.length, newLines.length - suffix + DIFF_CONTEXT_LINES)
  const trimmedOld = oldLines.slice(start, oldEnd).join('\n')
  const trimmedNew = newLines.slice(start, newEnd).join('\n')
  return {
    oldText: truncateText(trimmedOld, MAX_DIFF_SIDE_CHARS),
    newText: truncateText(trimmedNew, MAX_DIFF_SIDE_CHARS),
  }
}

function compactDiffBlock(item) {
  if (!item || typeof item !== 'object' || item.type !== 'diff') return item
  const hasOld = typeof item.oldText === 'string'
  const hasNew = typeof item.newText === 'string'
  if (hasOld && hasNew && item.oldText.length + item.newText.length > MAX_DIFF_PAIR_CHARS) {
    const compacted = compactDiffWindow(item.oldText, item.newText)
    return { ...item, ...compacted, compacted: true }
  }
  if (!hasOld && hasNew && item.newText.length > MAX_NEW_TEXT_CHARS) {
    return { ...item, newText: truncateText(item.newText, MAX_NEW_TEXT_CHARS), compacted: true }
  }
  if (hasOld && !hasNew && item.oldText.length > MAX_NEW_TEXT_CHARS) {
    return { ...item, oldText: truncateText(item.oldText, MAX_NEW_TEXT_CHARS), compacted: true }
  }
  return item
}

function compactEventData(type, clonedData) {
  if (type !== 'notification' || clonedData?.method !== 'session/update') return clonedData
  const update = clonedData.params?.update
  if (!update || (update.sessionUpdate !== 'tool_call_update' && update.sessionUpdate !== 'tool_call')) return clonedData
  if (!Array.isArray(update.content) || !update.content.some(item => item?.type === 'diff')) return clonedData
  let changed = false
  const nextContent = update.content.map(item => {
    const compacted = compactDiffBlock(item)
    if (compacted !== item) changed = true
    return compacted
  })
  if (!changed) return clonedData
  return {
    ...clonedData,
    params: {
      ...clonedData.params,
      update: { ...update, content: nextContent },
    },
  }
}

function diffUpdateCallId(event) {
  if (event?.type !== 'notification' || event.data?.method !== 'session/update') return null
  const update = event.data.params?.update
  if (update?.sessionUpdate !== 'tool_call_update' || typeof update.toolCallId !== 'string' || !update.toolCallId) return null
  if (!Array.isArray(update.content) || !update.content.some(item => item?.type === 'diff' && (typeof item.newText === 'string' || typeof item.oldText === 'string'))) return null
  return update.toolCallId
}

function elideSupersededDiff(event) {
  const update = event.data.params.update
  const nextContent = update.content.map(item => (
    item?.type === 'diff' && (typeof item.newText === 'string' || typeof item.oldText === 'string')
      ? { type: 'diff', ...(item.path === undefined ? {} : { path: item.path }), superseded: true }
      : item
  ))
  return {
    ...event,
    data: {
      ...event.data,
      params: {
        ...event.data.params,
        update: { ...update, content: nextContent },
      },
    },
  }
}

const schema = check => ({
  parse(value) { if (!check(value)) throw new Error('Invalid ACP workbench storage record'); return value },
  safeParse(value) { try { return { success: true, data: this.parse(value) } } catch (error) { return { success: false, error } } },
})
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
export const DOMAIN_SPEC = {
  name: 'acp_workbench', version: 1, layout: 'per-record',
  global: { schema: schema(v => object(v) && typeof v.initialized === 'boolean'), initial: { initialized: false } },
  tables: {
    checkout_links: { valueSchema: schema(v => object(v) && ['workspaceId', 'sessionId', 'ownerId', 'path', 'branch', 'baseCommit', 'repositoryRoot', 'marker'].every(k => typeof v[k] === 'string') && typeof v.ready === 'boolean') },
    scripts: { valueSchema: schema(v => object(v) && typeof v.terminalId === 'string' && typeof v.key === 'string' && typeof v.sessionId === 'string') },
    providers: { valueSchema: schema(v => object(v) && typeof v.id === 'string' && typeof v.command === 'string' && Array.isArray(v.args)) },
    sessions: { valueSchema: schema(v => object(v) && typeof v.id === 'string' && typeof v.cwd === 'string' && typeof v.providerId === 'string') },
    chunks: { valueSchema: schema(v => object(v) && typeof v.sessionId === 'string' && Array.isArray(v.events)) },
  },
}

export class WorkbenchStore {
  constructor(domain, onError) {
    this.domain = domain
    this.onError = onError
    this.sessions = new Map([...domain.table('sessions').entries()].map(([key, value]) => [key, structuredClone(value)]))
    this.providers = new Map([...domain.table('providers').entries()].map(([key, value]) => [key, structuredClone(value)]))
    this.dirty = new Map()
    this.chunks = new Map()
    this.tail = Promise.resolve()
    this.failure = null
    for (const [, chunk] of domain.table('chunks').entries()) {
      const session = this.sessions.get(chunk.sessionId)
      if (session) session.eventSeq = Math.max(session.eventSeq ?? 0, chunk.events.at(-1)?.seq ?? 0)
    }
  }

  assertWritable() {
    if (this.failure) throw new Error(`ACP history could not be saved: ${this.failure.message}`)
  }

  enqueue(operation) {
    this.assertWritable()
    const task = this.tail.then(() => { this.assertWritable(); return operation() })
    this.tail = task.catch(error => {
      this.failure = error
      this.onError?.(error)
    })
    return task
  }

  async saveProvider(provider) {
    const copy = structuredClone(provider)
    await this.enqueue(() => this.domain.table('providers').put(copy.id, copy))
    this.providers.set(copy.id, copy)
  }

  async removeProvider(id) {
    await this.enqueue(() => this.domain.table('providers').delete(id))
    this.providers.delete(id)
  }

  async saveSession(session) {
    const copy = structuredClone(session)
    await this.enqueue(() => this.domain.table('sessions').put(copy.id, copy))
    this.sessions.set(session.id, session)
  }

  append(session, type, data) {
    this.assertWritable()
    const seq = (session.eventSeq ?? 0) + 1
    const key = `${session.id}_${Math.floor((seq - 1) / CHUNK_SIZE)}`
    let chunk = this.chunks.get(key)
    if (!chunk) {
      const stored = this.domain.table('chunks').get(key)
      chunk = stored ? structuredClone(stored) : { sessionId: session.id, events: [] }
      this.chunks.set(key, chunk)
    }
    this.dirty.set(key, chunk)
    const at = new Date().toISOString()
    const cloned = structuredClone(data)
    const liveEvent = { seq, at, type, data: cloned }
    const compactedData = compactEventData(type, cloned)
    const persistedEvent = compactedData === cloned ? liveEvent : { seq, at, type, data: compactedData }
    const callId = diffUpdateCallId(persistedEvent)
    if (callId !== null) {
      for (let i = chunk.events.length - 1; i >= 0; i--) {
        if (diffUpdateCallId(chunk.events[i]) === callId) {
          chunk.events[i] = elideSupersededDiff(chunk.events[i])
        }
      }
    }
    chunk.events.push(persistedEvent)
    session.eventSeq = seq
    session.updatedAt = at
    if (!this.timer) this.timer = setTimeout(() => { this.flush().catch(() => {}) }, FLUSH_DEBOUNCE_MS)
    return liveEvent
  }

  async flush() {
    clearTimeout(this.timer)
    this.timer = undefined
    if (this.dirty.size === 0) return this.tail
    const chunks = [...this.dirty].map(([key, chunk]) => [key, { sessionId: chunk.sessionId, events: chunk.events.slice() }])
    this.dirty.clear()
    const sessions = [...new Set(chunks.map(([, c]) => c.sessionId))].map(id => structuredClone(this.sessions.get(id))).filter(Boolean)
    return this.enqueue(async () => {
      for (const [key, chunk] of chunks) await this.domain.table('chunks').put(key, chunk)
      for (const session of sessions) await this.domain.table('sessions').put(session.id, session)
      for (const [key, chunk] of chunks) {
        if (this.dirty.has(key)) continue
        const seq = this.sessions.get(chunk.sessionId)?.eventSeq ?? 0
        if (key !== `${chunk.sessionId}_${Math.floor(Math.max(0, seq - 1) / CHUNK_SIZE)}`) this.chunks.delete(key)
      }
    })
  }

  events(session, after = 0, limit = 80) {
    const count = Math.min(200, Math.max(1, Math.trunc(limit)))
    const from = Math.max(0, Math.trunc(after))
    const result = []
    for (let index = Math.floor(from / CHUNK_SIZE); index <= Math.floor(((session.eventSeq ?? 0) - 1) / CHUNK_SIZE); index++) {
      const key = `${session.id}_${index}`
      const chunk = this.chunks.get(key) ?? this.domain.table('chunks').get(key)
      if (chunk) for (const event of chunk.events) {
        if (event.seq > from) result.push(event)
        if (result.length >= count) return { events: result, next: result.at(-1).seq, total: session.eventSeq, more: result.at(-1).seq < session.eventSeq }
      }
    }
    return { events: result, next: result.at(-1)?.seq ?? from, total: session.eventSeq ?? 0, more: false }
  }

  async close() {
    clearTimeout(this.timer)
    let failure
    try { await this.flush(); await this.tail } catch (error) { failure = error }
    await this.domain.close()
    if (failure) throw failure
  }
}
