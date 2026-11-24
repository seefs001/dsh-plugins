import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { PassThrough, Writable } from 'node:stream'
import { test } from 'node:test'
import { probeCodexAppServer, runJsonCli } from '../lib/subscription.js'

function createFakeChild({ onStdinWrite, onTerminate, waitForExit } = {}) {
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
    write(chunk, encoding, callback) {
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
      onTerminate?.(child)
      finish({ exitCode: null, signal: 'SIGTERM' })
    },
    waitForExit: waitForExit ?? (async () => {
      await done
      return true
    }),
  })
  return child
}

function createSubprocess(spawnImpl) {
  return {
    async resolveExecutable(command) {
      return `/usr/bin/${command}`
    },
    spawn: spawnImpl,
  }
}

test('runJsonCli isolates stdin EPIPE and stderr/stdout stream errors without crashing', async () => {
  let spawnedChild
  const subprocess = createSubprocess(() => {
    spawnedChild = createFakeChild()
    queueMicrotask(() => {
      spawnedChild.stdin.emit('error', Object.assign(new Error('write EPIPE'), { code: 'EPIPE' }))
      spawnedChild.stderr.emit('error', Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' }))
      spawnedChild.stdout.write('{"ok":true}\n')
      spawnedChild.stdout.end()
      spawnedChild.finish({ exitCode: 0, signal: null })
    })
    return spawnedChild
  })

  const data = await runJsonCli(subprocess, 'cursor', ['--json'], '/tmp', 2_000)
  assert.deepEqual(data, { ok: true })
  assert.ok(spawnedChild.terminated >= 1)
})

test('runJsonCli terminates hung child on timeout without leaving orphans', async () => {
  let spawnedChild
  const subprocess = createSubprocess(() => {
    spawnedChild = createFakeChild()
    return spawnedChild
  })

  await assert.rejects(
    () => runJsonCli(subprocess, 'cursor', ['--slow'], '/tmp', 40),
    /Command timed out after 40 ms/u,
  )
  assert.ok(spawnedChild.terminated >= 1)
})

test('probeCodexAppServer completes RPC sequence and cleans up child', async () => {
  let spawnedChild
  const subprocess = createSubprocess(() => {
    spawnedChild = createFakeChild({
      onStdinWrite(text, callback, child) {
        callback()
        for (const line of text.trim().split('\n')) {
          if (!line) continue
          const msg = JSON.parse(line)
          if (msg.method === 'initialize') {
            child.stdout.write(`${JSON.stringify({ id: msg.id, result: { userAgent: 'codex' } })}\n`)
          } else if (msg.method === 'account/read') {
            child.stdout.write(`${JSON.stringify({ id: msg.id, result: { account: { email: 'a@b.c', planType: 'pro' } } })}\n`)
          } else if (msg.method === 'account/rateLimits/read') {
            child.stdout.write(`${JSON.stringify({ id: msg.id, result: { rateLimits: { primary: { usedPercent: 10 } } } })}\n`)
          }
        }
      },
    })
    return spawnedChild
  })

  const res = await probeCodexAppServer(subprocess, 'codex', '/tmp', { name: 'dsh', version: '0.2.3' }, 2_000)
  assert.equal(res.accountResult.account.email, 'a@b.c')
  assert.equal(res.rateLimitsResult.rateLimits.primary.usedPercent, 10)
  assert.ok(spawnedChild.terminated >= 1)
})

test('probeCodexAppServer isolates EPIPE during initialize and after initialize without unhandled error', async () => {
  let firstChild
  const subprocess1 = createSubprocess(() => {
    firstChild = createFakeChild({
      onStdinWrite(_text, callback) {
        callback(Object.assign(new Error('write EPIPE'), { code: 'EPIPE' }))
      },
    })
    return firstChild
  })

  await assert.rejects(
    () => probeCodexAppServer(subprocess1, 'codex', '/tmp', { name: 'dsh', version: '0.2.3' }, 2_000),
    /EPIPE/u,
  )
  assert.ok(firstChild.terminated >= 1)

  let secondChild
  const subprocess2 = createSubprocess(() => {
    secondChild = createFakeChild({
      onStdinWrite(text, callback, child) {
        const msg = JSON.parse(text.trim())
        if (msg.method === 'initialize') {
          callback()
          child.stdout.write(`${JSON.stringify({ id: msg.id, result: {} })}\n`)
          return
        }
        callback(Object.assign(new Error('Channel closed'), { code: 'ERR_IPC_CHANNEL_CLOSED' }))
      },
    })
    return secondChild
  })

  await assert.rejects(
    () => probeCodexAppServer(subprocess2, 'codex', '/tmp', { name: 'dsh', version: '0.2.3' }, 2_000),
    /Channel closed|Codex app-server/u,
  )
  assert.ok(secondChild.terminated >= 1)
})

test('probeCodexAppServer handles already-destroyed stdin and late EPIPE safely', async () => {
  let spawnedChild
  const subprocess = createSubprocess(() => {
    spawnedChild = createFakeChild()
    spawnedChild.stdin.destroy()
    return spawnedChild
  })

  await assert.rejects(
    () => probeCodexAppServer(subprocess, 'codex', '/tmp', { name: 'dsh', version: '0.2.3' }, 2_000),
    /stdin is closed/u,
  )
  spawnedChild.stdin.emit('error', Object.assign(new Error('late EPIPE'), { code: 'EPIPE' }))
  assert.ok(spawnedChild.terminated >= 1)
})
