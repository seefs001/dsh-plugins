import { createHash } from 'node:crypto'
import { basename, resolve } from 'node:path'
import { allocateServicePort, sampleServicePort, validServicePort } from './service-ports.js'

const hash = (...parts) => createHash('sha256').update(JSON.stringify(parts)).digest('hex')
const screen = { offset: 0, count: 60, maxBytes: 8192 }
const active = run => run && ['starting', 'running'].includes(run.state)
const availableShell = shell => ['sh', 'bash', 'zsh', 'dash', 'ksh'].includes(basename(shell.path))

/** paseo.json is a list of choices, never authority to run anything. Terminals belong to DSH. */
export class WorkspaceScripts {
  constructor(ctx, native) {
    this.ctx = ctx; this.native = native; this.store = native.manager.store
    this.table = this.store.domain.table('scripts'); this.locks = new Set(); this.life = new AbortController(); this.jobs = new Set()
    this.pending = new Map(); this.allocating = new Set(); this.samples = new Map()
    if (this.terminals()) for (const [, run] of this.table.entries()) if (active(run)) this.track(run)
    ctx.on('workspace/session-activity', async ({ sessionId }, next) => {
      const items = [...this.pending.values()].filter(p => p.sessionId === sessionId).map(p => ({ id: p.key, label: p.name }))
      if (this.terminals()) for (const [, run] of this.table.entries()) {
        if (run.sessionId === sessionId && active(this.project(run)) && !this.pending.has(run.key)) items.push({ id: run.terminalId, label: run.name })
      }
      const rest = await next()
      return items.length ? [{ kind: 'acp-script', items }, ...rest] : rest
    })
    ctx.on('workspace/session-stop', async ({ sessionId }) => {
      // Core writes the archive gate first. A still-unpublished start checks it again before input.
      for (const [, run] of this.table.entries()) {
        if (!this.terminals() || run.sessionId !== sessionId || !active(this.project(run)) || this.info(run)?.control !== 'agent') continue
        const owner = ctx.agents.get(sessionId)
        if (owner) await this.stop(owner, run)
      }
    })
  }

  enabled() { return !!(this.ctx.get('terminalController') && this.ctx.get('workspaceFiles') && this.ctx.get('workingDirectory')) }
  terminals() { return this.ctx.get('terminalController') }
  async definitions(agent, cwd) {
    const files = this.ctx.get('workspaceFiles'), scope = { sessionId: agent.id, workspaceRoot: cwd }
    let file
    try {
      const info = await files.stat(scope, 'paseo.json', this.life.signal)
      if (info.absolutePath !== resolve(cwd, 'paseo.json')) throw new Error('paseo.json must be in this checkout, not a symlink')
      if (info.bytes > 262144) throw new Error('paseo.json exceeds 256 KiB')
      file = await files.readBytes(scope, 'paseo.json', {}, this.life.signal)
    } catch (error) { if (error.code === 'workspace-file/not-found') return []; throw error }
    if (file.absolutePath !== resolve(cwd, 'paseo.json') || file.data.byteLength > 262144) throw new Error('Invalid paseo.json location or size')
    const config = JSON.parse(new TextDecoder().decode(file.data)), scripts = config?.scripts
    if (!scripts || typeof scripts !== 'object' || Array.isArray(scripts)) return []
    return Object.entries(scripts).flatMap(([name, spec]) => {
      const command = typeof spec?.command === 'string' && spec.command.trim()
      if (!command || !name) return []
      const type = spec.type === 'service' ? 'service' : 'script'
      const autoPort = type === 'service' && spec.port == null && config.worktree?.servicePorts == null && !!agent.ctx.get('sandbox')
      return [{ name, command, type, autoPort, revision: hash(agent.id, cwd, name, command, type, autoPort), key: hash(cwd, name) }]
    })
  }

  async save(run) { await this.store.enqueue(() => this.table.put(run.key, run)); return run }
  info(run) { return this.terminals().list(run.sessionId).find(t => t.id === run.terminalId) }
  // Only backend exit evidence completes a run. A missing terminal is not a successful command.
  project(run) {
    const info = this.info(run)
    if (!active(run)) return { ...run, retained: !!info }
    if (!info) return { ...run, state: 'unavailable', retained: false }
    return { ...run, state: info.state, exitCode: info.exitCode, retained: true, takenOver: info.control === 'user' }
  }

  async operate(op) {
    if (!this.enabled()) throw new Error('DSH workspace files and terminal controller are required')
    if (typeof op.dshSessionId !== 'string' || !op.dshSessionId) throw new Error('Choose a DSH conversation')
    const agent = await this.native.openAgent(op.dshSessionId)
    if (!agent) throw new Error('Conversation is unavailable')
    const cwd = this.native.cwd(agent)
    if (!cwd) throw new Error('This conversation has no working directory')
    if (op.action === 'script-list') {
      const runs = [...this.table.entries()].filter(([, run]) => run.cwd === cwd).map(([, run]) => {
        const view = this.project(run); delete view.output; return view
      })
      let definitions = [], configError
      try { definitions = await this.definitions(agent, cwd) } catch (e) { configError = e.message }
      return { cwd, definitions, runs, configError }
    }
    if (typeof op.name !== 'string' || !op.name) throw new Error('Choose a script')
    const key = hash(cwd, op.name)
    if (op.action === 'script-health') return this.health(agent, key, op.terminalId)
    if (this.locks.has(key)) throw new Error('This script is changing state')
    this.locks.add(key)
    try {
      const run = this.table.get(key)
      if (op.action === 'script-start') {
        if (run && active(this.project(run))) throw new Error('This script is already running in this checkout')
        const spec = (await this.definitions(agent, cwd)).find(s => s.name === op.name)
        if (!spec || spec.revision !== op.revision) throw new Error('The checkout or script changed. Refresh and review the command again')
        if (op.assignPort != null && (op.assignPort !== true || !spec.autoPort)) throw new Error('Automatic ports require a service without a fixed port or custom port policy')
        this.pending.set(key, { key, name: spec.name, sessionId: agent.id })
        const port = op.assignPort ? await this.trackHelper(this.assignPort(agent, cwd)) : null
        try { return await this.start(agent, cwd, spec, port) } finally { if (port) this.allocating.delete(port) }
      }
      if (!run || run.sessionId !== agent.id || run.terminalId !== op.terminalId) throw new Error('Open the conversation and terminal that own this run')
      const info = this.info(run)
      if (op.action === 'script-log') {
        if (!info) return { text: run.output ?? '', retained: false }
        return await this.terminals().readScreen(agent, run.terminalId, screen)
      }
      if (op.action !== 'script-stop' || !active(this.project(run)) || info?.control !== 'agent') throw new Error('This script is not under workbench control')
      return await this.stop(agent, run)
    } finally { this.locks.delete(key); this.pending.delete(key) }
  }

  async stop(agent, run) {
    const output = (await this.terminals().readScreen(agent, run.terminalId, screen)).text
    if (this.info(run)?.control !== 'agent') throw new Error('The user has taken over this terminal')
    await this.terminals().close(agent, run.terminalId)
    const stopped = { ...run, state: 'stopped', output, endedAt: Date.now() }
    await this.store.enqueue(async () => { if (this.table.get(run.key)?.terminalId === run.terminalId) await this.table.put(run.key, stopped) })
    return stopped
  }

  async assignPort(agent, cwd) {
    // After the kernel releases its port, do not allocate it to another managed service that has not bound yet.
    for (let attempt = 0; attempt < 3; attempt++) {
      const port = await allocateServicePort(agent, cwd, this.life.signal)
      if (this.allocating.has(port) || [...this.table.entries()].some(([, r]) => r.servicePort === port && active(this.project(r)))) continue
      this.allocating.add(port); return port
    }
    throw new Error('No distinct loopback port was available; try starting the service again')
  }

  async health(agent, key, terminalId) {
    const current = () => {
      const run = this.table.get(key), info = run && this.info(run)
      if (!run || run.terminalId !== terminalId || run.sessionId !== agent.id || run.cwd !== this.native.cwd(agent) || run.type !== 'service' || !validServicePort(run.servicePort) || run.state !== 'running' || info?.state !== 'running' || info.control !== 'agent') throw new Error('This monitored service is no longer running under workbench control in this checkout')
      return run
    }
    const run = current(), old = this.samples.get(terminalId)
    if (old && (!old.finished || Date.now() - old.finished < 2400)) return old.result
    const sample = { finished: 0 }
    sample.result = this.trackHelper(sampleServicePort(agent, run, this.life.signal)).then(value => { current(); return value }).finally(() => { sample.finished = Date.now() })
    this.samples.set(terminalId, sample)
    return sample.result
  }

  async start(agent, cwd, spec, port) {
    this.store.assertWritable()
    const policy = agent.ctx.get('sandboxPolicy')?.resolve({ session: agent.session })
    if (!policy) throw new Error('The session sandbox policy is unavailable')
    const terminal = await this.terminals().openForAgent(agent, { title: `▶ ${spec.name}`.slice(0, 120), cwd, cols: 96, rows: 30,
      preferredShells: ['bash', 'sh', 'zsh'], policy, env: { DSH_WORKBENCH_SCRIPT: spec.command, ...(port ? { PASEO_PORT: String(port), HOST: '127.0.0.1' } : {}) } }, this.life.signal)
    let run
    try {
      if (!availableShell(terminal.info.shell) || this.native.cwd(agent) !== cwd) throw new Error('A POSIX shell in the reviewed checkout is required')
      // Persist identity before delivery. Never interpolate repository text into PTY keystrokes or replay on recovery.
      run = await this.save({ key: spec.key, name: spec.name, type: spec.type, command: spec.command, ...(port ? { servicePort: port } : {}), sessionId: agent.id, terminalId: terminal.id, cwd, startedAt: Date.now(), state: 'starting' })
      this.life.signal.throwIfAborted()
      if (this.ctx.get('workspaceRegistry')?.archivedSessionIds.includes(agent.id) || this.native.cwd(agent) !== cwd) throw new Error('The session was archived or changed checkout')
      await terminal.write('exec /bin/sh -c "$DSH_WORKBENCH_SCRIPT"\r')
      run = await this.save({ ...run, state: 'running' })
    } catch (error) {
      await terminal.close().catch(() => {})
      if (run) await this.save({ ...run, state: 'failed', endedAt: Date.now() })
      throw error
    }
    this.track(run)
    return this.project(run)
  }

  track(run) {
    const job = this.observe(run).catch(e => { if (!this.life.signal.aborted) this.ctx.logger.warn(e.message) })
    this.jobs.add(job); void job.finally(() => { this.jobs.delete(job); this.samples.delete(run.terminalId) })
  }

  async observe(run) {
    // Re-subscribable by persisted identity. A plugin reload does not take input or start a replacement.
    const controller = this.terminals(), signal = this.life.signal
    for await (const roster of controller.watch(run.sessionId, signal)) {
      if (signal.aborted) return
      const info = roster.find(t => t.id === run.terminalId)
      if (info?.state === 'running') continue
      const owner = this.ctx.agents.get(run.sessionId)
      const page = info && owner ? await controller.readScreen(owner, run.terminalId, screen).catch(() => null) : null
      if (signal.aborted) return
      await this.store.enqueue(async () => {
        const current = this.table.get(run.key)
        if (current?.terminalId === run.terminalId && active(current)) await this.table.put(run.key, { ...current, state: info?.state ?? 'unavailable',
          exitCode: info?.exitCode ?? null, endedAt: Date.now(), output: page?.text ?? '' })
      })
      return
    }
  }

  async trackHelper(job) {
    this.jobs.add(job)
    try { return await job } finally { this.jobs.delete(job) }
  }

  async close() { this.life.abort(); await Promise.allSettled(this.jobs) }
}
