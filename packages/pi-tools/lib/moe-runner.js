import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const binary = fileURLToPath(new URL(`../bin/${process.platform}-${process.arch}/moejs${process.platform === 'win32' ? '.exe' : ''}`, import.meta.url))

function message([kind, a, b, c]) {
  if (kind === 'call' || kind === 'global') return { type: 'call', target: kind === 'call' ? 'tool' : 'global', id: a, name: b, args: c ?? undefined }
  if (kind === 'done') return a ? { type: 'done', ok: true, value: b ?? undefined, writes: c } : { type: 'done', ok: false, error: b }
  if (kind === 'crash') return { type: 'crash', message: a }
  if (kind !== 'output') throw new Error('Invalid MoeJS event')
  return { type: 'output', item: a === 'image' ? { type: 'image', data: b, mimeType: c } : { type: 'text', text: b, ...(a === 'console' && { console: true }) } }
}

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

const MAX_IDLE_WORKERS = 2
const IDLE_WORKER_MS = 60_000
const CLOSE_TIMEOUT_MS = 2_000

export class MoeRunnerPool {
  workers = new Set()
  sequence = 0
  closed = false

  spawn() {
    const child = spawn(binary, [], { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true, env: {} })
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity })
    const worker = { child, lines, exited: false, idleTimer: null }
    this.workers.add(worker)
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
    child.on('error', error => {
      if (child.pid === undefined) {
        worker.exited = true
        this.workers.delete(worker)
      }
      this.fail(worker, error)
    })
    child.stdin.on('error', error => this.fail(worker, error))
    child.once('close', (code, signal) => {
      worker.exited = true
      clearTimeout(worker.idleTimer)
      worker.idleTimer = null
      worker.lines.close()
      this.workers.delete(worker)
      const job = worker.job
      if (job) {
        job.events.failure({ kind: 'sandbox', message: `MoeJS runner closed (${signal ?? code})` })
        this.release(worker, job)
      }
    })
    return worker
  }

  retire(worker) {
    clearTimeout(worker.idleTimer)
    worker.idleTimer = null
    worker.failed = true
    worker.lines.close()
    if (!worker.exited && worker.child.pid !== undefined) worker.child.kill('SIGKILL')
    else this.workers.delete(worker)
  }

  fail(worker, error) {
    if (worker.failed) return
    worker.failed = true
    clearTimeout(worker.idleTimer)
    worker.idleTimer = null
    worker.lines.close()
    const job = worker.job
    if (job) {
      job.events.failure({ kind: 'sandbox', message: `MoeJS runner: ${error.message}` })
      this.release(worker, job)
    }
    if (!worker.exited && worker.child.pid !== undefined) worker.child.kill('SIGKILL')
    else this.workers.delete(worker)
  }

  release(worker, job) {
    if (worker.job !== job) return
    clearTimeout(job.killTimer)
    worker.job = undefined
    job.release()
    worker.child.unref()
    worker.child.stdin.unref?.()
    worker.child.stdout.unref?.()
    if (this.closed || worker.failed || worker.exited || worker.child.killed) return
    let idleCount = 0
    for (const candidate of this.workers) {
      if (!candidate.job && !candidate.failed && !candidate.exited && !candidate.child.killed) idleCount++
    }
    if (idleCount > MAX_IDLE_WORKERS) {
      this.retire(worker)
      return
    }
    clearTimeout(worker.idleTimer)
    worker.idleTimer = setTimeout(() => {
      worker.idleTimer = null
      if (!worker.job && !worker.exited) this.retire(worker)
    }, IDLE_WORKER_MS)
    worker.idleTimer.unref?.()
  }

  launch(data, events, acquire) {
    if (this.closed) throw new Error('MoeJS pool disposed')
    const release = acquire()
    let worker
    try { worker = [...this.workers].find(w => !w.job && !w.failed && !w.exited && !w.child.killed) ?? this.spawn() }
    catch (error) { release(); throw error }
    clearTimeout(worker.idleTimer)
    worker.idleTimer = null
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
    await Promise.all([...this.workers].map(worker => {
      clearTimeout(worker.idleTimer)
      worker.idleTimer = null
      worker.lines.close()
      const { child } = worker
      if (worker.exited || child.exitCode !== null || child.signalCode !== null || child.pid === undefined) {
        this.workers.delete(worker)
        return Promise.resolve()
      }
      return new Promise(resolve => {
        const done = () => {
          clearTimeout(timer)
          child.off('close', done)
          this.workers.delete(worker)
          resolve()
        }
        const timer = setTimeout(done, CLOSE_TIMEOUT_MS)
        timer.unref?.()
        child.ref()
        child.once('close', done)
        child.kill('SIGKILL')
      })
    }))
  }
}
