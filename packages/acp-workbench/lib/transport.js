import { StringDecoder } from 'node:string_decoder'

const MAX_FRAME_BYTES = 16 * 1024 * 1024

export class RpcError extends Error {
  constructor(message, code = -32603) {
    super(message)
    this.name = 'RpcError'
    this.code = code
  }
}

/** NDJSON JSON-RPC over the exact managed process supplied by DSH. */
export class AcpConnection {
  constructor(child, { onNotification, onRequest, onExit, onStderr }) {
    this.child = child
    this.handlers = { onNotification, onRequest, onExit, onStderr }
    this.pending = new Map()
    this.nextId = 0
    this.closed = false
    this.stopping = false
    this.decoder = new StringDecoder('utf8')
    this.stderrDecoder = new StringDecoder('utf8')
    this.buffer = ''
    this.notificationTail = Promise.resolve()
    if (!child.stdin || !child.stdout || !child.stderr) throw new Error('ACP requires piped stdin, stdout and stderr')
    child.stdin.on('error', error => this.fail(error))
    child.stdout.on('error', error => this.fail(error))
    child.stdout.on('data', data => this.consume(this.decoder.write(data)))
    child.stdout.on('end', () => {
      const tail = this.decoder.end()
      if (tail) this.consume(tail)
      if (!this.stopping) this.fail(new Error('ACP stdout closed'))
    })
    child.stderr.on('data', data => {
      try { onStderr?.(this.stderrDecoder.write(data)) } catch (error) { this.fail(error) }
    })
    child.stderr.on('error', error => this.fail(error))
    // Observe both process failure and protocol closure; done remains awaitable by stop().
    this.done = child.done.then(outcome => {
      const how = outcome.signal ? `signal ${outcome.signal}` : `code ${outcome.exitCode ?? 'unknown'}`
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
    // Only the unterminated frame is bounded; complete lines were already consumed.
    // UTF-8 needs at least one byte per UTF-16 unit and at most three, so byteLength runs only near the limit.
    const units = this.buffer.length
    if (units > MAX_FRAME_BYTES || (units * 3 > MAX_FRAME_BYTES && Buffer.byteLength(this.buffer) > MAX_FRAME_BYTES)) {
      this.fail(new Error('ACP frame exceeds 16 MiB'))
    }
  }

  receive(message) {
    if (typeof message.method === 'string') {
      if (message.id !== undefined && message.id !== null) {
        // Requests can wait for humans; they must not block streaming notifications.
        void Promise.resolve().then(() => this.handlers.onRequest(message.method, message.params ?? {})).then(
          result => this.reply(message.id, { result: result ?? {} }),
          error => this.reply(message.id, { error: { code: error.code ?? -32603, message: error.message ?? 'Request failed' } }),
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
    // Every prior notification has been handed to the manager before settlement.
    void this.notificationTail.then(() => {
      if (message.error) pending.reject(new RpcError(message.error.message ?? 'ACP request failed', message.error.code))
      else pending.resolve(message.result ?? {})
    }, pending.reject)
  }

  write(message) {
    if (this.closed) throw new Error('ACP connection is closed')
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n')
  }

  reply(id, payload) {
    if (!this.closed) this.write({ id, ...payload })
  }

  request(method, params, timeoutMs = 30_000) {
    if (this.closed) return Promise.reject(new Error('ACP connection is closed'))
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      const timer = timeoutMs > 0 ? setTimeout(() => {
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
      this.child.terminate()
      this.handlers.onExit?.(error)
    }
  }

  async stop() {
    if (this.stopPromise) return this.stopPromise
    this.stopping = true
    this.stopPromise = (async () => {
      try { this.child.stdin.end() } catch {}
      this.fail(new Error('ACP connection disconnected'))
      const exited = await this.child.waitForExit(AbortSignal.timeout(1_000)).catch(() => false)
      if (!exited) this.child.terminate()
      await this.child.waitForExit()
      // Process and handler failures already closed the connection through fail().
      // Stopping only awaits quiescence; replaying them here would turn every later
      // disconnect into a cleanup failure.
      await this.done.catch(() => {})
      await this.notificationTail.catch(() => {})
    })()
    return this.stopPromise
  }
}
