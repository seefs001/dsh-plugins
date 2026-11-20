import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const binary = fileURLToPath(new URL(`../bin/${process.platform}-${process.arch}/moejs${process.platform === 'win32' ? '.exe' : ''}`, import.meta.url))

// Pi's VmLauncher protocol. No DSH objects or functions enter the child.
function message([kind, a, b, c]) {
  if (kind === 'call' || kind === 'global') return { type: 'call', target: kind === 'call' ? 'tool' : 'global', id: a, name: b, args: c ?? undefined }
  if (kind === 'done') return a ? { type: 'done', ok: true, value: b ?? undefined, writes: c } : { type: 'done', ok: false, error: b }
  if (kind === 'crash') return { type: 'crash', message: a }
  if (kind !== 'output') throw new Error('Invalid MoeJS event')
  return { type: 'output', item: a === 'image' ? { type: 'image', data: b, mimeType: c } : { type: 'text', text: b, ...(a === 'console' && { console: true }) } }
}

// Multiple presets can share one host process. Keep the idle processes under
// the same process-wide admission limit as active ones, without sharing VMs.
let shared
export function borrowRunnerPool() {
  shared ??= { pool: new MoeRunnerPool(), owners: 0 }
  const owner = shared
  owner.owners++
  let closed = false
  return {
    launch(...args) {
      if (closed) throw new Error('MoeJS pool disposed')
      return owner.pool.launch(...args)
    },
    async close() {
      if (closed) return
      closed = true
      if (--owner.owners === 0) { shared = undefined; await owner.pool.close() }
    },
  }
}

// Each process owns at most one run. Admission is already bounded by Pi. A
// slot isn't returned until the VM unwinds, or until the process actually exits.
export class MoeRunnerPool {
  workers = new Set()
  sequence = 0
  closed = false

  spawn() {
    const child = spawn(binary, [], { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true, env: {} })
    const worker = { child }
    this.workers.add(worker)
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity })
    lines.on('line', line => {
      const job = worker.job
      if (!job) return
      try {
        const [id, event] = JSON.parse(line)
        if (id !== job.id) throw new Error('Unexpected MoeJS run id')
        const msg = message(event)
        job.ended = msg.type === 'done' || msg.type === 'crash'
        if (!job.stopping) job.events.message(msg)
        if (job.stopping && job.ended) this.release(worker, job)
      } catch (error) { this.fail(worker, error) }
    })
    child.on('error', error => this.fail(worker, error))
    child.stdin.on('error', error => this.fail(worker, error))
    child.once('close', (code, signal) => {
      this.workers.delete(worker)
      const job = worker.job
      if (job) {
        job.events.failure({ kind: 'sandbox', message: `MoeJS runner closed (${signal ?? code})` })
        this.release(worker, job)
      }
    })
    return worker
  }

  fail(worker, error) {
    worker.failed = true
    worker.child.kill('SIGKILL')
    worker.job?.events.failure({ kind: 'sandbox', message: `MoeJS runner: ${error.message}` })
  }

  release(worker, job) {
    if (worker.job !== job) return
    clearTimeout(job.killTimer)
    worker.job = undefined
    job.release()
    worker.child.unref()
    worker.child.stdin.unref?.()
    worker.child.stdout.unref?.()
  }

  launch(data, events, acquire) {
    if (this.closed) throw new Error('MoeJS pool disposed')
    const release = acquire()
    let worker
    try { worker = [...this.workers].find(w => !w.job && !w.failed && !w.child.killed) ?? this.spawn() }
    catch (error) { release(); throw error }
    const job = { id: ++this.sequence, events, release, ended: false, stopping: false }
    worker.job = job
    const { child } = worker
    child.ref(); child.stdin.ref?.(); child.stdout.ref?.()
    const send = frame => child.stdin.write(`${JSON.stringify({ ...frame, run: job.id })}\n`)
    send({ type: 'start', data })
    return {
      post: result => { if (!job.stopping && !job.ended) send(result) },
      stop: async () => {
        if (worker.job !== job || job.stopping) return
        job.stopping = true
        if (job.ended) this.release(worker, job)
        else {
          if (!child.killed && child.stdin.writable) send({ type: 'cancel' })
          job.killTimer = setTimeout(() => child.kill('SIGKILL'), 100).unref()
        }
      },
    }
  }

  async close() {
    this.closed = true
    await Promise.all([...this.workers].map(({ child }) => new Promise(resolve => {
      child.ref()
      child.once('close', resolve)
      child.kill('SIGKILL')
    })))
  }
}
