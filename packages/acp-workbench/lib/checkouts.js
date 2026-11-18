import { createHash } from 'node:crypto'
import { isAbsolute, join, relative, sep } from 'node:path'
import { checkoutMarker } from './shared.js'

const within = (root, cwd) => { const rest = relative(root, cwd); return rest === '' || !(rest === '..' || rest.startsWith('..' + sep) || isAbsolute(rest)) }
const revision = (...values) => createHash('sha256').update(JSON.stringify(values)).digest('hex')

// A directory can survive an interrupted cleanup without being a checkout. Never remove or repair such an entry in place.
async function location(fs, path, signal) {
  const type = (await fs.lstat(path, undefined, signal))?.type ?? 'missing'
  if (type !== 'directory') return type
  return (await fs.lstat(join(path, '.git'), undefined, signal))?.type === 'file' ? type : 'incomplete'
}

/** The core ensure() otherwise switches a missing cwd back to header.cwd before the first prompt, even without an ACP binding. */
export async function guardManagedCheckout(ctx, agent, cwd, signal, link) {
  const projections = ctx.get('sessionProjections'), fs = ctx.get('fs')
  if (link && (!link.ready || !cwd || !within(link.path, cwd) || !fs || await checkoutMarker(fs, link.path, signal) !== link.marker ||
      (cwd !== link.path && (await fs.lstat(cwd, undefined, signal))?.type !== 'directory'))) {
    throw new Error('The shared checkout is unavailable or the session left it. No ACP input was sent. Inspect Working directory in ACP Workbench.')
  }
  if (!cwd || !ctx.get('worktrees') || !projections || !fs) return
  const entries = projections.snapshot(agent.session, ['worktree']).values.worktree ?? []
  const used = entries.findLast(({ worktree }) => within(worktree.path, cwd))
  if (!used) return
  if (await location(fs, used.worktree.path, signal) !== 'directory' ||
    (cwd !== used.worktree.path && (await fs.lstat(cwd, undefined, signal))?.type !== 'directory')) {
    throw new Error('The recorded worktree is missing or incomplete. Inspect Working directory in ACP Workbench before continuing. No input was sent to the source checkout.')
  }
}

/** DSH's creation projection proves ownership; the archive registry, cleanup attempt and actual path answer different questions. */
export class ProjectCheckouts {
  constructor(ctx, native) {
    this.ctx = ctx; this.native = native; this.jobs = new Map(); this.life = new AbortController()
    ctx.on('workspace/session-activity', async ({ sessionId }, next) => {
      const rest = await next(); return this.jobs.has(sessionId) ? [...rest, { kind: 'acp-worktree-restore' }] : rest
    })
    ctx.on('workspace/session-stop', async ({ sessionId }) => {
      const job = this.jobs.get(sessionId)
      if (job) { job.cancel.abort(new Error('Session archived during worktree restoration')); await job.done.catch(() => {}) }
    })
  }

  enabled() { return ['workspaceRegistry', 'sessionQuery', 'worktrees', 'sessionProjections', 'workingDirectory', 'fs'].every(k => !!this.ctx.get(k)) }
  workspace({ workspaceId, dshSessionId }) {
    if (!this.enabled()) throw new Error('DSH worktree inspection is unavailable')
    const workspace = this.ctx.get('workspaceRegistry').get(workspaceId)
    if (!workspace?.sessionIds.includes(dshSessionId)) throw new Error('Select a conversation in this project')
    return workspace
  }

  /** Inspect any registered session, including cold/archived ones, without loading an Agent or waiting for cleanup. */
  async info(op, signal = this.life.signal) {
    this.workspace(op)
    const id = op.dshSessionId, ctx = this.ctx
    const { cwd, entries, attempt, readOnly } = await ctx.get('sessionQuery').inspectSession(id, s => ({
      cwd: ctx.get('workingDirectory').get(s), entries: ctx.get('sessionProjections').snapshot(s, ['worktree']).values.worktree ?? [],
      attempt: ctx.get('worktrees').cleanupOf(s, null), readOnly: ctx.get('sandboxPolicy')?.resolve({ session: s }).mode === 'read-only',
    }), signal)
    const cleanup = await attempt
    const stat = async path => (await ctx.get('fs').lstat(path, undefined, signal))?.type ?? 'missing'
    const current = await stat(cwd)
    const link = this.native.checkoutLink(id)
    const borrowed = link && link.workspaceId === op.workspaceId ? [{ worktree: { path: link.path, branch: link.branch, baseCommit: link.baseCommit, repositoryRoot: link.repositoryRoot }, owned: false, shared: true }] : []
    const trees = await Promise.all([...entries, ...borrowed].map(async ({ worktree: w, owned, shared = false }) => ({ ...w, owned, shared,
      ownerId: owned ? id : shared ? link.ownerId : null, incompleteJoin: shared && !link.ready,
      location: await location(ctx.get('fs'), w.path, signal), inUseHere: within(w.path, cwd),
      revision: revision(op.workspaceId, id, cwd, w.path, w.branch, w.baseCommit, w.repositoryRoot, owned),
    })))
    return { sessionId: id, archived: ctx.get('workspaceRegistry').archivedSessionIds.includes(id), cwd, current, trees, cleanup,
      readOnly, restoring: this.jobs.has(id), busy: !!ctx.agents.get(id) && ctx.agents.get(id).status !== 'idle' }
  }

  /** Known participants of this launch group, not every process touching the path. Check live-preferred cwd and workspace/archival membership. */
  async details(op) {
    const value = await this.info(op), registry = this.ctx.get('workspaceRegistry'), project = this.workspace(op)
    const active = new Set(project.sessionIds.filter(id => !registry.archivedSessionIds.includes(id)))
    for (const w of value.trees) {
      if (!w.ownerId) continue
      const ids = [w.ownerId, ...[...this.native.manager.store.domain.table('checkout_links').entries()]
        .filter(([, l]) => l.ready && l.ownerId === w.ownerId && l.path === w.path && l.workspaceId === op.workspaceId).map(([id]) => id)]
      const peers = await Promise.all(ids.filter(id => active.has(id)).map(async id => {
        const cwd = await this.ctx.get('sessionQuery').inspectSession(id, s => this.ctx.get('workingDirectory').get(s), this.life.signal)
        return within(w.path, cwd) ? id : null
      }))
      w.participants = peers.filter(Boolean)
    }
    return value
  }

  eligible(op, state) {
    const item = state.trees.find(w => w.revision === op.revision)
    if (state.archived) throw new Error('Restore the conversation before rebuilding its worktree')
    if (!item?.owned || !item.inUseHere) throw new Error('The recorded checkout or working directory changed. Inspect the conversation again.')
    if (state.readOnly) throw new Error('The session policy is read-only')
    if (item.location !== 'missing') throw new Error('The worktree path already exists; nothing was overwritten')
    return item
  }

  async restore(op) {
    this.workspace(op)
    const id = op.dshSessionId
    if (this.jobs.has(id)) throw new Error('Worktree restoration is already in progress')
    const cancel = new AbortController(), signal = AbortSignal.any([cancel.signal, this.life.signal])
    const job = { cancel }; this.jobs.set(id, job)
    job.done = (async () => {
      const state = await this.info(op, signal)
      this.eligible(op, state)
      if (state.busy) throw new Error('The DSH conversation must be idle to rebuild a worktree')
      const agent = await this.native.openAgent(id)
      if (!agent || agent.status !== 'idle') throw new Error('The DSH conversation must be open and idle')
      return await agent.runMaintenance(async ownerSignal => {
        const work = AbortSignal.any([ownerSignal, signal])
        const current = this.eligible(op, await this.info(op, work))
        work.throwIfAborted()
        const { path, branch, baseCommit, repositoryRoot } = current
        // Never accept a browser-supplied path, revision or branch for the Git operation.
        const restored = await this.ctx.get('worktrees').restore(agent, { path, branch, baseCommit, repositoryRoot }, work)
        return { ...restored, cwd: this.native.cwd(agent) }
      })
    })()
    try { return await job.done } finally { this.jobs.delete(id); this.native.manager.changed(undefined, id) }
  }

  async close() {
    this.life.abort(new Error('ACP Workbench is unloading'))
    await Promise.allSettled([...this.jobs.values()].map(job => job.done))
  }
}
