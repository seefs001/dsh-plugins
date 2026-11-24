import { StringDecoder } from 'node:string_decoder'

const MAX_FRAME_BYTES = 16 * 1024 * 1024
const DEFAULT_GRACE_EXIT_MS = 1_000
const DEFAULT_TERMINATE_WAIT_MS = 5_000

function safeEnd(stream) {
  if (!stream || stream.destroyed || stream.writableEnded) return
  try {
    stream.end()
  } catch {}
}

function safeTerminate(child) {
  if (typeof child?.terminate !== 'function') return
  try {
    child.terminate()
  } catch {}
}

async function waitWithTimeout(waitFn, timeoutMs) {
  const controller = new AbortController()
  let timer
  const timeout = new Promise(resolve => {
    timer = setTimeout(() => {
      controller.abort()
      resolve(false)
    }, timeoutMs)
  })
  const attempt = Promise.resolve().then(() => waitFn(controller.signal)).then(Boolean, () => false)
  try {
    return await Promise.race([attempt, timeout])
  } finally {
    clearTimeout(timer)
  }
}

async function awaitBounded(promise, timeoutMs) {
  if (!promise || typeof promise.then !== 'function') return
  let timer
  const timeout = new Promise(resolve => {
    timer = setTimeout(resolve, timeoutMs)
  })
  try {
    await Promise.race([promise.catch(() => {}), timeout])
  } finally {
    clearTimeout(timer)
  }
}

export class RpcError extends Error {
  constructor(message, code = -32603) {
    super(message)
    this.name = 'RpcError'
    this.code = code
  }
}

export class AcpConnection {
  constructor(child, {
    onNotification,
    onRequest,
    onExit,
    onStderr,
    graceExitMs = DEFAULT_GRACE_EXIT_MS,
    terminateWaitMs = DEFAULT_TERMINATE_WAIT_MS,
  } = {}) {
    this.child = child
    this.handlers = { onNotification, onRequest, onExit, onStderr }
    this.graceExitMs = Number.isFinite(graceExitMs) && graceExitMs > 0 ? graceExitMs : DEFAULT_GRACE_EXIT_MS
    this.terminateWaitMs = Number.isFinite(terminateWaitMs) && terminateWaitMs > 0 ? terminateWaitMs : DEFAULT_TERMINATE_WAIT_MS
    this.pending = new Map()
    this.nextId = 0
    this.closed = false
    this.stopping = false
    this.decoder = new StringDecoder('utf8')
    this.stderrDecoder = new StringDecoder('utf8')
    this.buffer = ''
    this.notificationTail = Promise.resolve()
    if (!child?.stdin || !child?.stdout || !child?.stderr) throw new Error('ACP requires piped stdin, stdout and stderr')
    child.on?.('error', error => this.fail(error))
    child.stdin.on('error', error => this.fail(error))
    child.stdout.on('error', error => this.fail(error))
    child.stdout.on('data', data => this.consume(this.decoder.write(data)))
    child.stdout.on('end', () => {
      if (this.closed) return
      const tail = this.decoder.end()
      if (tail) this.consume(tail)
      if (!this.stopping) this.fail(new Error('ACP stdout closed'))
    })
    child.stderr.on('data', data => {
      if (this.closed) return
      try { onStderr?.(this.stderrDecoder.write(data)) } catch (error) { this.fail(error) }
    })
    child.stderr.on('error', error => this.fail(error))
    this.done = Promise.resolve(child.done).then(outcome => {
      const how = outcome?.signal ? `signal ${outcome.signal}` : `code ${outcome?.exitCode ?? 'unknown'}`
      this.fail(new Error(`Agent process exited (${how})`))
      return outcome
    }, error => { this.fail(error); throw error })
    this.done.catch(() => {})
  }

  consume(text) {
    if (this.closed) return
    this.buffer += text
    let start = 0
    let newline
    while ((newline = this.buffer.indexOf('\n', start)) !== -1) {
      const line = this.buffer.slice(start, newline).trim()
      start = newline + 1
      if (!line) continue
      let message
      try { message = JSON.parse(line) } catch {
        this.fail(new Error('Agent wrote non-JSON data to ACP stdout'))
        return
      }
      if (!message || message.jsonrpc !== '2.0') {
        this.fail(new Error('Invalid ACP JSON-RPC envelope'))
        return
      }
      this.receive(message)
      if (this.closed) return
    }
    this.buffer = this.buffer.slice(start)
    const units = this.buffer.length
    if (units > MAX_FRAME_BYTES || (units * 3 > MAX_FRAME_BYTES && Buffer.byteLength(this.buffer) > MAX_FRAME_BYTES)) {
      this.fail(new Error('ACP frame exceeds 16 MiB'))
    }
  }

  receive(message) {
    if (typeof message.method === 'string') {
      if (message.id !== undefined && message.id !== null) {
        void Promise.resolve().then(() => this.handlers.onRequest(message.method, message.params ?? {}, message.id)).then(
          result => this.reply(message.id, { result: result ?? {} }),
          error => this.reply(message.id, { error: { code: error?.code ?? -32603, message: error?.message ?? 'Request failed' } }),
        ).catch(error => this.fail(error))
      } else {
        this.notificationTail = this.notificationTail.then(() => this.handlers.onNotification(message.method, message.params ?? {}))
        this.notificationTail.catch(error => this.fail(error))
      }
      return
    }
    const pending = this.pending.get(message.id)
    if (!pending) return
    this.pending.delete(message.id)
    clearTimeout(pending.timer)
    void this.notificationTail.then(() => {
      if (message.error) pending.reject(new RpcError(message.error.message ?? 'ACP request failed', message.error.code))
      else pending.resolve(message.result ?? {})
    }, pending.reject)
  }

  write(message) {
    if (this.closed) throw new Error('ACP connection is closed')
    const stdin = this.child.stdin
    if (!stdin || stdin.destroyed || stdin.writableEnded) {
      const error = new Error('ACP stdin is closed')
      this.fail(error)
      throw error
    }
    const line = `${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`
    try {
      stdin.write(line, error => {
        if (error) this.fail(error)
      })
    } catch (error) {
      this.fail(error)
      throw error
    }
  }

  reply(id, payload) {
    if (this.closed) return
    try { this.write({ id, ...payload }) } catch (error) { this.fail(error) }
  }

  request(method, params, timeoutMs = 30_000) {
    if (this.closed) return Promise.reject(new Error('ACP connection is closed'))
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      const timer = Number.isFinite(timeoutMs) && timeoutMs > 0 ? setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`ACP ${method} timed out after ${timeoutMs} ms`))
      }, timeoutMs) : undefined
      this.pending.set(id, { resolve, reject, timer })
      try { this.write({ id, method, params }) } catch (error) {
        clearTimeout(timer)
        this.pending.delete(id)
        reject(error)
      }
    })
  }

  notify(method, params) { this.write({ method, params }) }

  fail(error) {
    if (this.closed) return
    this.closed = true
    this.buffer = ''
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer)
      pending.reject(error)
    }
    this.pending.clear()
    if (!this.stopping) {
      safeEnd(this.child.stdin)
      safeTerminate(this.child)
      try { this.handlers.onExit?.(error) } catch {}
    }
  }

  async stop() {
    if (this.stopPromise) return this.stopPromise
    this.stopping = true
    this.stopPromise = (async () => {
      safeEnd(this.child.stdin)
      this.fail(new Error('ACP connection disconnected'))
      if (typeof this.child.waitForExit === 'function') {
        const exited = await waitWithTimeout(signal => this.child.waitForExit(signal), this.graceExitMs)
        if (!exited) safeTerminate(this.child)
        const terminated = exited || await waitWithTimeout(signal => this.child.waitForExit(signal), this.terminateWaitMs)
        if (!terminated) safeTerminate(this.child)
      } else {
        safeTerminate(this.child)
      }
      await awaitBounded(this.done, this.terminateWaitMs)
      await this.notificationTail.catch(() => {})
    })()
    return this.stopPromise
  }
}
