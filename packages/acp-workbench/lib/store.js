const CHUNK_SIZE = 64
const FLUSH_DEBOUNCE_MS = 1000
const MAX_DIFF_PAIR_CHARS = 32 * 1024
const MAX_DIFF_SIDE_CHARS = 32 * 1024
const MAX_NEW_TEXT_CHARS = 64 * 1024
const MAX_TOOL_TEXT_CHARS = 16 * 1024
const MAX_TOOL_FIELD_CHARS = 16 * 1024
const MAX_COMPACT_DEPTH = 6
const DIFF_CONTEXT_LINES = 5
const DEFAULT_CHUNK_RETENTION_DAYS = 30
const DEFAULT_ARCHIVED_CHUNK_RETENTION_DAYS = 7
const DEFAULT_MAX_CHUNK_BYTES = 50 * 1024 * 1024
const DAY_MS = 24 * 60 * 60 * 1000

function truncateText(text, limit) {
  if (typeof text !== 'string' || text.length <= limit) return text
  const omitted = text.length - limit
  return `${text.slice(0, limit)}\n… [truncated ${omitted} chars]`
}

function compactValue(value, limit, depth = 0) {
  if (typeof value === 'string') return truncateText(value, limit)
  if (!value || typeof value !== 'object' || depth >= MAX_COMPACT_DEPTH) return value
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map(item => {
      const compacted = compactValue(item, limit, depth + 1)
      if (compacted !== item) changed = true
      return compacted
    })
    return changed ? next : value
  }
  let changed = false
  const next = {}
  for (const [k, v] of Object.entries(value)) {
    const compacted = compactValue(v, limit, depth + 1)
    if (compacted !== v) changed = true
    next[k] = compacted
  }
  return changed ? next : value
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

function compactContentItem(item) {
  if (!item || typeof item !== 'object') return item
  if (item.type === 'diff') return compactDiffBlock(item)
  if (item.type === 'content' && typeof item.content?.text === 'string' && item.content.text.length > MAX_TOOL_TEXT_CHARS) {
    return {
      ...item,
      content: { ...item.content, text: truncateText(item.content.text, MAX_TOOL_TEXT_CHARS) },
      compacted: true,
    }
  }
  if (typeof item.text === 'string' && item.text.length > MAX_TOOL_TEXT_CHARS) {
    return { ...item, text: truncateText(item.text, MAX_TOOL_TEXT_CHARS), compacted: true }
  }
  return item
}

function compactEventData(type, clonedData) {
  if (type !== 'notification' || clonedData?.method !== 'session/update') return clonedData
  const update = clonedData.params?.update
  if (!update || (update.sessionUpdate !== 'tool_call_update' && update.sessionUpdate !== 'tool_call')) return clonedData
  let nextUpdate = update
  let changed = false
  if (Array.isArray(update.content)) {
    let contentChanged = false
    const nextContent = update.content.map(item => {
      const compacted = compactContentItem(item)
      if (compacted !== item) contentChanged = true
      return compacted
    })
    if (contentChanged) {
      nextUpdate = { ...nextUpdate, content: nextContent }
      changed = true
    }
  }
  for (const field of ['args', 'rawInput', 'rawOutput', 'result']) {
    if (update[field] === undefined) continue
    const compacted = compactValue(update[field], MAX_TOOL_FIELD_CHARS)
    if (compacted !== update[field]) {
      nextUpdate = { ...nextUpdate, [field]: compacted }
      changed = true
    }
  }
  if (!changed) return clonedData
  return {
    ...clonedData,
    params: {
      ...clonedData.params,
      update: nextUpdate,
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
    this.nativeBySession = new Map()
    this.nativeByRoot = new Map()
    this.dirty = new Map()
    this.chunks = new Map()
    this.chunkBytes = new Map()
    this.tail = Promise.resolve()
    this.failure = null
    for (const session of this.sessions.values()) this.indexNativeSession(session)
    let needsFullScan = false
    for (const session of this.sessions.values()) {
      if (!Number.isInteger(session.eventSeq) || session.eventSeq < 0) {
        needsFullScan = true
        break
      }
    }
    const chunksTable = domain.table('chunks')
    if (needsFullScan) {
      for (const [, chunk] of chunksTable.entries()) {
        const session = this.sessions.get(chunk.sessionId)
        if (session) session.eventSeq = Math.max(session.eventSeq ?? 0, chunk.events.at(-1)?.seq ?? 0)
      }
    } else {
      for (const session of this.sessions.values()) {
        let index = Math.floor(Math.max(0, (session.eventSeq ?? 0) - 1) / CHUNK_SIZE)
        for (let probe = 0; probe < 8; probe++) {
          const chunk = chunksTable.get(`${session.id}_${index}`)
          if (!chunk) break
          const lastSeq = chunk.events.at(-1)?.seq ?? 0
          if (lastSeq > (session.eventSeq ?? 0)) session.eventSeq = lastSeq
          if (chunk.events.length < CHUNK_SIZE) break
          index += 1
        }
      }
    }
  }

  assertWritable() {
    if (this.failure) throw new Error(`ACP history could not be saved: ${this.failure.message}`)
  }

  enqueue(operation) {
    const task = this.tail.then(async () => {
      const value = await operation()
      this.failure = null
      return value
    })
    this.tail = task.then(() => {}, error => {
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

  indexNativeSession(session) {
    const native = session?.native
    if (!native) return
    if (typeof native.sessionId === 'string' && native.sessionId) {
      let bucket = this.nativeBySession.get(native.sessionId)
      if (!bucket) { bucket = new Set(); this.nativeBySession.set(native.sessionId, bucket) }
      bucket.add(session.id)
    }
    if (typeof native.rootSessionId === 'string' && native.rootSessionId) {
      let bucket = this.nativeByRoot.get(native.rootSessionId)
      if (!bucket) { bucket = new Set(); this.nativeByRoot.set(native.rootSessionId, bucket) }
      bucket.add(session.id)
    }
  }

  nativeSessions(sessionId, includeChildren = true) {
    const own = this.nativeBySession.get(sessionId)
    const rooted = includeChildren ? this.nativeByRoot.get(sessionId) : null
    if (!own?.size && !rooted?.size) return []
    const result = []
    const seen = new Set()
    if (own) {
      for (const id of own) {
        const session = this.sessions.get(id)
        if (session?.native?.sessionId === sessionId) { seen.add(id); result.push(session) }
      }
    }
    if (rooted) {
      for (const id of rooted) {
        if (seen.has(id)) continue
        const session = this.sessions.get(id)
        if (session?.native?.rootSessionId === sessionId) { seen.add(id); result.push(session) }
      }
    }
    return result
  }

  async saveSession(session) {
    const copy = structuredClone(session)
    await this.enqueue(() => this.domain.table('sessions').put(copy.id, copy))
    this.sessions.set(session.id, session)
    this.indexNativeSession(session)
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
    const pendingDirty = [...this.dirty]
    const chunks = pendingDirty.map(([key, chunk]) => [key, { sessionId: chunk.sessionId, events: chunk.events.slice() }])
    this.dirty.clear()
    const sessions = [...new Set(chunks.map(([, c]) => c.sessionId))].map(id => structuredClone(this.sessions.get(id))).filter(Boolean)
    return this.enqueue(async () => {
      try {
        for (const [key, chunk] of chunks) {
          await this.domain.table('chunks').put(key, chunk)
          this.chunkBytes.set(key, Buffer.byteLength(JSON.stringify(chunk), 'utf8'))
        }
        for (const session of sessions) {
          await this.domain.table('sessions').put(session.id, session)
          const live = this.sessions.get(session.id)
          if (live) this.indexNativeSession(live)
        }
      } catch (error) {
        for (const [key, chunk] of pendingDirty) {
          if (!this.dirty.has(key)) this.dirty.set(key, chunk)
        }
        throw error
      }
      for (const [key, chunk] of chunks) {
        if (this.dirty.has(key)) continue
        const seq = this.sessions.get(chunk.sessionId)?.eventSeq ?? 0
        if (key !== `${chunk.sessionId}_${Math.floor(Math.max(0, seq - 1) / CHUNK_SIZE)}`) this.chunks.delete(key)
      }
    })
  }

  evictSessionCache(sessionId) {
    const prefix = `${sessionId}_`
    for (const key of this.chunks.keys()) {
      if (key.startsWith(prefix) && !this.dirty.has(key)) this.chunks.delete(key)
    }
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

  async deleteChunkKeys(keys) {
    if (!keys.length) return 0
    for (const key of keys) {
      this.dirty.delete(key)
      this.chunks.delete(key)
      this.chunkBytes.delete(key)
    }
    const table = this.domain.table('chunks')
    await this.enqueue(async () => {
      if (typeof table.deleteMany === 'function') {
        await table.deleteMany(keys)
        return
      }
      for (const key of keys) await table.delete(key)
    })
    return keys.length
  }

  async deleteSessionChunks(sessionId) {
    const table = this.domain.table('chunks')
    const keys = []
    for (const [key, chunk] of table.entries()) {
      if (chunk?.sessionId === sessionId) keys.push(key)
    }
    return this.deleteChunkKeys(keys)
  }

  async pruneChunks({
    maxAgeDays = DEFAULT_CHUNK_RETENTION_DAYS,
    archivedMaxAgeDays = DEFAULT_ARCHIVED_CHUNK_RETENTION_DAYS,
    maxTotalBytes = DEFAULT_MAX_CHUNK_BYTES,
    activeSessionIds = new Set(),
    nowMs = Date.now(),
  } = {}) {
    if (maxAgeDays <= 0 && archivedMaxAgeDays <= 0 && maxTotalBytes <= 0) {
      return { deletedChunks: 0, deletedSessions: 0, freedBytes: 0 }
    }
    const table = this.domain.table('chunks')
    const groups = new Map()
    for (const [key, chunk] of table.entries()) {
      const sessionId = chunk?.sessionId ?? ''
      let group = groups.get(sessionId)
      if (!group) {
        group = { sessionId, keys: [], bytes: 0 }
        groups.set(sessionId, group)
      }
      group.keys.push(key)
      let bytes = this.chunkBytes.get(key)
      if (bytes === undefined) {
        bytes = Buffer.byteLength(JSON.stringify(chunk), 'utf8')
        this.chunkBytes.set(key, bytes)
      }
      group.bytes += bytes
    }
    const keysToDelete = []
    let deletedSessions = 0
    let freedBytes = 0
    const remaining = []
    let remainingBytes = 0
    for (const group of groups.values()) {
      if (activeSessionIds.has(group.sessionId)) {
        remainingBytes += group.bytes
        continue
      }
      const session = this.sessions.get(group.sessionId)
      if (!session) {
        keysToDelete.push(...group.keys)
        deletedSessions += 1
        freedBytes += group.bytes
        continue
      }
      const archived = session.archived === true
      const stamp = Date.parse(archived ? (session.archivedAt ?? session.updatedAt ?? session.createdAt ?? '') : (session.updatedAt ?? session.createdAt ?? ''))
      const ageMs = Number.isFinite(stamp) ? Math.max(0, nowMs - stamp) : 0
      const limitDays = archived ? archivedMaxAgeDays : maxAgeDays
      if (limitDays > 0 && Number.isFinite(stamp) && ageMs >= limitDays * DAY_MS) {
        keysToDelete.push(...group.keys)
        deletedSessions += 1
        freedBytes += group.bytes
        continue
      }
      remaining.push({ ...group, archived, stamp: Number.isFinite(stamp) ? stamp : 0 })
      remainingBytes += group.bytes
    }
    if (maxTotalBytes > 0 && remainingBytes > maxTotalBytes) {
      remaining.sort((a, b) => (a.archived === b.archived ? a.stamp - b.stamp : a.archived ? -1 : 1))
      for (const group of remaining) {
        if (remainingBytes <= maxTotalBytes) break
        keysToDelete.push(...group.keys)
        deletedSessions += 1
        freedBytes += group.bytes
        remainingBytes -= group.bytes
      }
    }
    const deletedChunks = await this.deleteChunkKeys(keysToDelete)
    return { deletedChunks, deletedSessions, freedBytes }
  }

  async close() {
    clearTimeout(this.timer)
    let failure
    try { await this.flush(); await this.tail } catch (error) { failure = error }
    await this.domain.close()
    if (failure) throw failure
  }
}
