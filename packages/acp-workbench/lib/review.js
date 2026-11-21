const TERMINAL = new Set(['completed', 'interrupted', 'failed'])

export function replyExcerpt(message) {
  let excerpt = ''
  for (const block of message.content ?? []) {
    if (block.type !== 'text' || typeof block.text !== 'string') continue
    excerpt += (excerpt ? '\n' : '') + block.text.trim().slice(0, 801)
    if (excerpt.length > 800) break
  }
  return excerpt.length > 800 ? excerpt.slice(0, 799) + '…' : excerpt
}

export class ProjectReview {
  constructor(ctx, manager) { this.ctx = ctx; this.manager = manager }

  scope(id) {
    const registry = this.ctx.get('workspaceRegistry'), workspace = registry?.get(id)
    if (!workspace) throw new Error('Choose an available project')
    const members = new Set(workspace.sessionIds), archived = new Set(registry.archivedSessionIds)
    return s => s.native && !s.archived && !archived.has(s.native.sessionId) && !archived.has(s.native.rootSessionId)
      && (members.has(s.native.sessionId) || members.has(s.native.rootSessionId))
  }

  list({ workspaceId, filter = 'pending', before }) {
    if (!['pending', 'all'].includes(filter)) throw new Error('Unknown review filter')
    if (before !== undefined && typeof before !== 'string') throw new Error('Invalid review cursor')
    const includes = this.scope(workspaceId), matches = []
    let pending = 0
    for (const s of this.manager.store.sessions.values()) {
      if (!includes(s)) continue
      for (const r of s.native.runs) {
        if (!TERMINAL.has(r.state)) continue
        if (!r.reviewedAt) pending++
        else if (filter === 'pending') continue
        const at = r.finishedAt ?? r.startedAt
        const key = `${at}/${r.id}`
        if (before === undefined || key < before) matches.push({ key, at, s, r })
      }
    }
    matches.sort((a, b) => b.key < a.key ? -1 : b.key > a.key ? 1 : 0)
    const limit = 10, page = matches.slice(0, limit)
    return { pending, next: matches.length > limit ? page.at(-1).key : null, items: page.map(({ at, s, r }) => ({
      id: r.id, recordId: s.id, providerId: s.providerId, title: s.title, cwd: s.cwd, sessionId: s.native.sessionId,
      rootSessionId: s.native.rootSessionId, parentSessionId: s.native.parentSessionId, retired: !!s.native.retired,
      turn: r.turn, step: r.step, at, state: r.state, stopReason: r.stopReason, tools: r.tools, fileCount: r.files?.length ?? 0,
      files: r.files?.slice(0, 5) ?? [], reply: r.replyExcerpt, error: r.error, reviewed: r.reviewedAt ? 'seen' : 'pending',
    })) }
  }

  async acknowledge({ workspaceId, recordId, runId }) {
    const s = this.manager.session(recordId)
    if (!this.scope(workspaceId)(s)) throw new Error('This result does not belong to the selected project')
    const r = s.native.runs.find(item => item.id === runId)
    if (!r || !TERMINAL.has(r.state)) throw new Error('Select a finished run to mark as reviewed')
    this.manager.store.assertWritable()
    if (typeof r.reviewedAt !== 'string') {
      const previous = r.reviewedAt
      r.reviewedAt = new Date().toISOString()
      s.native.reviewVersion = (s.native.reviewVersion ?? 0) + 1
      try { await this.manager.store.saveSession(s) } catch (error) { r.reviewedAt = previous; this.manager.changed(s.id); throw error }
      this.manager.changed(s.id)
    } else await this.manager.store.tail
    this.manager.store.assertWritable()
    return { runId, reviewedAt: r.reviewedAt }
  }
}
