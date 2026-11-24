import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import { describeConnectionChannel, openDaemonSocket } from '../lib/hub.js'

class FakeWebSocket extends EventEmitter {
  static OPEN = 1
  static instances = []

  constructor(url, options) {
    super()
    this.url = url
    this.options = options
    this.readyState = FakeWebSocket.OPEN
    this.pings = 0
    this.terminated = false
    this.closed = false
    FakeWebSocket.instances.push(this)
  }

  ping() {
    this.pings += 1
  }

  terminate() {
    this.terminated = true
    this.readyState = 3
  }

  close() {
    this.closed = true
    this.readyState = 3
  }
}

test('describeConnectionChannel classifies local, tailscale, and direct WebSocket channels', () => {
  assert.deepEqual(describeConnectionChannel('wss://hub.example.com:443/ws'), {
    kind: 'direct',
    protocol: 'wss',
    secure: true,
    endpoint: 'hub.example.com',
  })
  assert.deepEqual(describeConnectionChannel('ws://localhost:3000/ws'), {
    kind: 'local',
    protocol: 'ws',
    secure: false,
    endpoint: 'localhost:3000',
  })
  assert.deepEqual(describeConnectionChannel('wss://hub.tail42.ts.net/ws'), {
    kind: 'tailscale',
    protocol: 'wss',
    secure: true,
    endpoint: 'hub.tail42.ts.net',
  })
  assert.deepEqual(describeConnectionChannel('wss://100.80.10.2:8443/ws'), {
    kind: 'tailscale',
    protocol: 'wss',
    secure: true,
    endpoint: '100.80.10.2:8443',
  })
  assert.equal(describeConnectionChannel(null), null)
  assert.equal(describeConnectionChannel('not-a-url'), null)
})

test('openDaemonSocket sends immediate ping on open and reports heartbeat latency on pong', () => {
  FakeWebSocket.instances = []
  let connected = false
  const heartbeats = []
  const handle = openDaemonSocket({
    webSocketUrl: 'wss://hub.example.com/ws',
    daemonId: 'd-1',
    secret: 'sec',
    WebSocketImpl: FakeWebSocket,
    pingIntervalMs: 60_000,
    pongTimeoutMs: 120_000,
  }, {
    connected: () => { connected = true },
    heartbeat: sample => heartbeats.push(sample),
    rejected: () => {},
    closed: () => {},
    failed: () => {},
  })

  const socket = FakeWebSocket.instances[0]
  assert.ok(socket)
  socket.emit('open')
  assert.equal(connected, true)
  assert.equal(socket.pings, 1)

  socket.emit('pong')
  assert.equal(heartbeats.length, 1)
  assert.equal(typeof heartbeats[0].latencyMs, 'number')
  assert.ok(heartbeats[0].latencyMs >= 0)
  assert.ok(Date.parse(heartbeats[0].lastPongAt) > 0)

  handle.close()
  assert.equal(socket.closed, true)
})

test('openDaemonSocket terminates and fails when heartbeat pong times out', async () => {
  FakeWebSocket.instances = []
  const failures = []
  const handle = openDaemonSocket({
    webSocketUrl: 'wss://hub.example.com/ws',
    daemonId: 'd-2',
    secret: 'sec',
    WebSocketImpl: FakeWebSocket,
    pingIntervalMs: 15,
    pongTimeoutMs: 25,
  }, {
    connected: () => {},
    heartbeat: () => {},
    rejected: () => {},
    closed: () => {},
    failed: err => failures.push(err),
  })

  const socket = FakeWebSocket.instances[0]
  socket.emit('open')
  await new Promise(resolve => setTimeout(resolve, 70))

  assert.equal(socket.terminated, true)
  assert.equal(failures.length, 1)
  assert.match(failures[0].message, /heartbeat timed out/i)
  handle.close()
})
