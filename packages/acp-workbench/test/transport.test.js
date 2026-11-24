import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { PassThrough, Writable } from 'node:stream'
import { test } from 'node:test'
import { AcpConnection } from '../lib/transport.js'

function createMockChild({ onStdinWrite, onTerminate, waitForExit } = {}) {
  const emitter = new EventEmitter()
  const stdout = new PassThrough()
  const stderr = new PassThrough()
  let resolveDone
  let settled = false
  const done = new Promise(resolve => { resolveDone = resolve })
  const finish = (outcome = { exitCode: 0, signal: null }) => {
    if (settled) return
    settled = true
    resolveDone(outcome)
  }
  const stdin = new Writable({
    write(chunk, _enc, callback) {
      if (onStdinWrite) {
        onStdinWrite(chunk.toString('utf8'), callback, child)
        return
      }
      callback()
    },
  })
  const child = Object.assign(emitter, {
    stdin,
    stdout,
    stderr,
    done,
    finish,
    terminated: 0,
    terminate() {
      child.terminated++
      if (onTerminate) onTerminate(child)
      finish({ exitCode: null, signal: 'SIGTERM' })
    },
    waitForExit: waitForExit ?? (async () => {
      await done
      return true
    }),
  })
  return child
}

test('AcpConnection isolates async EPIPE and ERR_IPC_CHANNEL_CLOSED on stdin without crashing', async () => {
  const exitErrors = []
  const child = createMockChild({
    onStdinWrite(_text, callback) {
      callback(Object.assign(new Error('write EPIPE'), { code: 'EPIPE' }))
    },
  })
  const conn = new AcpConnection(child, {
    onExit: error => exitErrors.push(error),
  })

  await assert.rejects(() => conn.request('initialize', {}, 2_000), /EPIPE/u)
  assert.equal(conn.closed, true)
  assert.equal(exitErrors.length, 1)
  assert.equal(child.terminated, 1)

  child.stdin.emit('error', Object.assign(new Error('late EPIPE'), { code: 'EPIPE' }))
  child.emit('error', Object.assign(new Error('IPC closed'), { code: 'ERR_IPC_CHANNEL_CLOSED' }))
})

test('AcpConnection handles destroyed stdin and throwing terminate safely', async () => {
  const exitErrors = []
  const child = createMockChild({
    onTerminate() {
      throw new Error('ESRCH')
    },
  })
  const conn = new AcpConnection(child, {
    onExit: error => exitErrors.push(error),
  })

  child.stdin.destroy()
  await assert.rejects(() => conn.request('ping', {}, 2_000), /stdin is closed/u)
  assert.equal(conn.closed, true)
  assert.equal(exitErrors.length, 1)
  assert.equal(child.terminated, 1)
})

test('AcpConnection.stop terminates stubborn children and never hangs when waitForExit fails', async () => {
  let calls = 0
  const child = createMockChild({
    onTerminate() {},
    waitForExit(signal) {
      calls++
      if (calls === 1) {
        return new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')))
        })
      }
      return Promise.reject(new Error('observer lost'))
    },
  })

  const conn = new AcpConnection(child, {
    graceExitMs: 25,
    terminateWaitMs: 40,
  })
  const pending = assert.rejects(
    () => conn.request('session/prompt', {}, 30_000),
    /ACP connection disconnected/u,
  )

  await conn.stop()
  await pending
  assert.ok(child.terminated >= 1)
})

test('AcpConnection handles null error rejections in onRequest cleanly', async () => {
  const written = []
  const child = createMockChild({
    onStdinWrite(text, callback) {
      written.push(JSON.parse(text.trim()))
      callback()
    },
  })
  const conn = new AcpConnection(child, {
    onRequest: async () => { throw null },
    graceExitMs: 25,
    terminateWaitMs: 40,
  })

  child.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: 42, method: 'fs/read', params: {} })}\n`)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(written.length, 1)
  assert.equal(written[0].id, 42)
  assert.equal(written[0].error.code, -32603)
  await conn.stop()
})
