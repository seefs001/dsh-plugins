import { randomUUID } from 'node:crypto'

/** User-owned workspace launches. DSH owns project membership, identity, archive and checkout cleanup. */
export class ProjectLauncher {
  constructor(ctx, native, sharing) { this.ctx = ctx; this.native = native; this.sharing = sharing }

  capabilities() {
    const enabled = !!(this.ctx.get('workspaceRegistry') && this.ctx.get('sessionController'))
    return { enabled, sharing: enabled && this.sharing.enabled(), worktree: enabled && !!this.ctx.get('worktrees') && !!this.ctx.get('workingDirectory'),
      profiles: this.native.manager.store.domain.global.get().launchProfiles ?? [] }
  }

  async selection(providerId, model = 'default', effort) {
    const provider = this.native.route(providerId)
    const entry = await this.native.resolveModel(provider, model)
    if (effort !== undefined && !entry.reasoning?.efforts.some(item => item.id === effort)) throw new Error('This model does not offer that reasoning effort')
    return { provider, model, ...(effort === undefined ? {} : { reasoningEffort: effort }) }
  }

  /** A saved launch choice, not a live setting: editing/deleting one never changes an Agent. */
  async profile(op) {
    const remove = op.action === 'profile-remove'
    const name = typeof op.name === 'string' && op.name.trim()
    if (!remove) {
      if (!name || name.length > 80 || !['local', 'worktree'].includes(op.isolation)) throw new Error('Enter a profile name and isolation mode')
      await this.selection(op.providerId, op.model, op.effort)
    }
    const store = this.native.manager.store
    const id = op.id ?? randomUUID()
    let conflict
    await store.enqueue(async () => {
      const current = store.domain.global.get(), list = current.launchProfiles ?? []
      const others = list.filter(p => p.id !== id)
      if ((op.id || remove) && others.length === list.length) conflict = 'This launch profile no longer exists'
      else if (!remove && others.some(p => p.name === name)) conflict = 'A launch profile already has this name'
      if (conflict) return // A user conflict is not a storage failure.
      const profile = { id, name, providerId: op.providerId, model: op.model ?? 'default', isolation: op.isolation, ...(op.effort ? { effort: op.effort } : {}) }
      await store.domain.global.set({ ...current, launchProfiles: remove ? others : [...others, profile] })
    })
    if (conflict) throw new Error(conflict)
    this.native.manager.changed()
    return { id }
  }

  async launch({ workspaceId, providerId, model = 'default', effort, title, isolation = 'local', branch, from, checkoutSessionId, checkoutRevision }) {
    const registry = this.ctx.get('workspaceRegistry')
    const controller = this.ctx.get('sessionController')
    const project = registry?.get(workspaceId)
    if (!project || !controller) throw new Error('Select an available DSH workspace')
    if (!['local', 'worktree', 'shared'].includes(isolation)) throw new Error('Unknown isolation mode')
    if (isolation === 'shared' && (branch || from || !checkoutSessionId || !checkoutRevision)) throw new Error('Select an existing managed worktree in this project')
    const tree = isolation === 'worktree' && this.ctx.get('worktrees')
    if (isolation === 'worktree' && !this.capabilities().worktree) throw new Error('DSH worktrees are unavailable')
    for (const [value, max] of [[title, 160], [branch, 200], [from, 250]]) {
      if (value !== undefined && (typeof value !== 'string' || value.length > max || [...value].some(c => c.charCodeAt(0) < 32))) throw new Error('Invalid launch field')
    }
    const selection = await this.selection(providerId, model, effort)
    const source = this.native.provider(selection.provider)
    await this.native.manager.directory(project.path)
    this.native.manager.store.assertWritable()
    const link = isolation === 'shared' ? await this.sharing.selection(workspaceId, checkoutSessionId, checkoutRevision) : null
    // No reusable blank ID: opening a second agent must not retarget an existing conversation.
    const { sessionId } = await controller.create({ workspaceId })
    try {
      const agent = await this.native.openAgent(sessionId)
      if (link) await this.sharing.join(agent, workspaceId, checkoutSessionId, checkoutRevision, link)
      const worktree = tree ? await tree.create(agent, { name: branch?.trim() || undefined, from: from?.trim() || undefined }) : null
      if (worktree && this.native.cwd(agent) !== worktree.path) throw new Error('DSH did not enter the isolated checkout')
      await controller.rename({ sessionId, title: title?.trim() || `${source.label} · ${worktree?.branch ?? link?.branch ?? project.title}`.slice(0, 160) })
      // This launch config belongs to this session only; the normal model picker also saves a global default.
      agent.model.select(selection)
      // No ACP binding yet: the user may adopt CLI history before sending their first message.
      return { sessionId, ready: true, cwd: this.native.cwd(agent), worktree, ...(link ? { sharedWith: link.ownerId } : {}) }
    } catch (error) {
      // The core already owns this durable session. Do not retry by silently creating another, delete a
      // partially created checkout or launch on the source tree. Surface the recoverable identity.
      return { sessionId, ready: false, error: error.message ?? String(error) }
    }
  }
}
