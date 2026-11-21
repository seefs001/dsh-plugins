import { createHash } from 'node:crypto'
import { join } from 'node:path'

const mismatch = () => new Error('The selected worktree changed or is no longer available. Refresh Working directory before starting an agent.')

export async function checkoutMarker(fs, path, signal) {
  if (fs.processPath(await fs.resolve(path, { signal })) !== path) return null
  const file = join(path, '.git'), meta = await fs.lstat(file, undefined, signal)
  if (meta?.type !== 'file' || !(meta.size > 0 && meta.size <= 16384)) return null
  const text = await fs.readText(await fs.resolve(file, { signal }), signal)
  if (!/^gitdir: [^\n\0]+\n?$/.test(text)) return null
  return createHash('sha256').update(text).digest('hex')
}

async function registered(ctx, ownerId, tree, signal) {
  const policy = await ctx.get('sessionQuery').inspectSession(ownerId, s => ctx.get('sandboxPolicy').resolve({ session: s }), signal)
  const git = await ctx.subprocess.resolveExecutable('git', undefined, signal)
  const command = [git, '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', 'worktree', 'list', '--porcelain', '-z']
  const argv = policy.mode === 'danger-full-access' ? command : (await ctx.get('sandbox').confine(command, policy, signal)).argv
  const env = { GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_NO_LAZY_FETCH: '1' }
  for (const key of Object.keys(process.env)) if (key.startsWith('GIT_') && !(key in env)) env[key] = undefined
  const child = ctx.subprocess.spawn({ argv, cwd: tree.repositoryRoot, env, signal, graceMs: 200,
    stdio: { stdin: 'ignore', stdout: { maxBytes: 512 * 1024 }, stderr: { maxBytes: 4096 } } })
  try {
    const outcome = await child.done
    signal.throwIfAborted()
    const output = child.collected.stdout.readFrom(0)
    if (outcome.exitCode !== 0 || output.lossy) throw new Error('Git could not confirm the registered worktree in the source repository')
    return output.text.split('\0\0').some(record => {
      const fields = record.split('\0')
      return fields[0] === 'worktree ' + tree.path && fields.includes('branch refs/heads/' + tree.branch) && !fields.some(f => f === 'prunable' || f.startsWith('prunable '))
    })
  } finally { child.terminate(); await child.waitForExit() }
}

export class CheckoutSharing {
  constructor(ctx, native, checkouts) { this.ctx = ctx; this.native = native; this.checkouts = checkouts }
  enabled() { return this.checkouts.enabled() && !!this.ctx.get('sandboxPolicy') && !!this.ctx.get('sandbox') }

  async selection(workspaceId, sessionId, revision) {
    if (!this.enabled()) throw new Error('DSH worktree sharing is unavailable')
    const signal = AbortSignal.any([this.checkouts.life.signal, AbortSignal.timeout(10000)])
    const state = await this.checkouts.info({ workspaceId, dshSessionId: sessionId }, signal)
    const tree = state.trees.find(w => w.revision === revision && (w.owned || w.shared) && !w.incompleteJoin && w.inUseHere && w.location === 'directory')
    if (state.archived || !tree || state.current !== 'directory') throw mismatch()
    const ownerId = tree.ownerId
    if (tree.shared) {
      const origin = await this.checkouts.info({ workspaceId, dshSessionId: ownerId }, signal)
      if (!origin.trees.some(w => w.owned && w.path === tree.path && w.repositoryRoot === tree.repositoryRoot && w.branch === tree.branch && w.baseCommit === tree.baseCommit)) throw mismatch()
    }
    const marker = await checkoutMarker(this.ctx.get('fs'), tree.path, signal)
    if (!marker || (tree.shared && this.native.checkoutLink(sessionId)?.marker !== marker) || !await registered(this.ctx, ownerId, tree, signal)) throw mismatch()
    const { path, branch, baseCommit, repositoryRoot } = tree
    return { path, branch, baseCommit, repositoryRoot, ownerId, marker }
  }

  async join(agent, workspaceId, sourceSession, revision, link) {
    const store = this.native.manager.store
    const record = { ...link, workspaceId, sessionId: agent.id, ready: false }
    const persist = ready => store.saveCheckoutLink({ ...record, ready })
    await persist(false)
    const cwd = await this.ctx.get('workingDirectory').set(agent, link.path, this.checkouts.life.signal)
    const final = await this.selection(workspaceId, sourceSession, revision)
    if (cwd !== link.path || final.marker !== link.marker) throw mismatch()
    await persist(true)
    this.native.manager.changed(undefined, link.ownerId)
    this.native.manager.changed(undefined, agent.id)
  }
}
