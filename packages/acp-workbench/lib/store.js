const CHUNK_SIZE = 64
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

/** Ordered writes, coalesced streaming tails, and a stable sequence for paging. */
export class WorkbenchStore {
  constructor(domain, onError) {
    this.domain = domain
    this.onError = onError
    this.sessions = new Map([...domain.table('sessions').entries()].map(([key, value]) => [key, structuredClone(value)]))
    this.providers = new Map([...domain.table('providers').entries()].map(([key, value]) => [key, structuredClone(value)]))
    // Native snapshots are polled while calls stream; never rescan every project link for a composer badge.
    this.sharedGroups = new Map()
    for (const [, link] of domain.table('checkout_links').entries()) this.indexCheckoutLink(link)
    this.dirty = new Map()
    // Keep the latest chunk while its previous snapshot is still being written.
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

  indexCheckoutLink(link) {
    if (!link.ready) return
    this.sharedGroups.set(link.ownerId, link.workspaceId)
    this.sharedGroups.set(link.sessionId, link.workspaceId)
  }

  async saveCheckoutLink(link) {
    await this.enqueue(() => this.domain.table('checkout_links').put(link.sessionId, link))
    this.indexCheckoutLink(link)
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
    const event = { seq, at: new Date().toISOString(), type, data: structuredClone(data) }
    chunk.events.push(event)
    session.eventSeq = seq
    session.updatedAt = event.at
    if (!this.timer) this.timer = setTimeout(() => { this.flush().catch(() => {}) }, 150)
    return event
  }

  async flush() {
    clearTimeout(this.timer)
    this.timer = undefined
    const chunks = [...this.dirty].map(([key, chunk]) => [key, structuredClone(chunk)])
    this.dirty.clear()
    const sessions = [...new Set(chunks.map(([, c]) => c.sessionId))].map(id => structuredClone(this.sessions.get(id))).filter(Boolean)
    return this.enqueue(async () => {
      for (const [key, chunk] of chunks) await this.domain.table('chunks').put(key, chunk)
      for (const session of sessions) await this.domain.table('sessions').put(session.id, session)
      // Written chunks are served by the domain again. Keep only each session's open tail
      // and anything appended while this write ran, so long histories do not stay cached twice.
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
