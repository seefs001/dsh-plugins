import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { createBridge, endStatusOf, normalizeConfig, toolTitle } from '../lib/index.js'
import { Connector, MemoryStore, frame } from '../lib/vendor/switchboard-kit.js'

// ---------- minimal relay: RFC 6455 text frames over node:http ----------

function encodeWs(text) {
  const payload = Buffer.from(text)
  const len = payload.length
  const head = len < 126 ? Buffer.from([0x81, len])
    : len < 65536 ? Buffer.from([0x81, 126, len >> 8, len & 255])
      : Buffer.concat([Buffer.from([0x81, 127]), (() => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(len)); return b })()])
  return Buffer.concat([head, payload])
}

function startRelay() {
  const frames = []
  const waiters = []
  const sockets = new Set()
  let socket
  let auth
  const server = createServer()
  server.on('upgrade', (req, sock) => {
    auth = req.headers.authorization
    const accept = createHash('sha1').update(`${req.headers['sec-websocket-key']}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64')
    sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`)
    socket = sock
    sockets.add(sock)
    let buf = Buffer.alloc(0)
    sock.on('data', chunk => {
      buf = Buffer.concat([buf, chunk])
      while (buf.length >= 2) {
        const opcode = buf[0] & 15
        let len = buf[1] & 127
        let off = 2
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4 }
        else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10 }
        const masked = (buf[1] & 128) !== 0
        const mask = masked ? buf.subarray(off, off + 4) : null
        if (masked) off += 4
        if (buf.length < off + len) return
        const payload = Buffer.from(buf.subarray(off, off + len))
        if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4]
        buf = buf.subarray(off + len)
        if (opcode === 8) { sock.end(); return }
        if (opcode !== 1) continue
        const f = JSON.parse(payload.toString())
        if (f.type === 'ack' && f.frameIds.length === 0) continue // heartbeat
        frames.push(f)
        const hit = waiters.findIndex(w => w.match(f))
        if (hit >= 0) waiters.splice(hit, 1)[0].resolve(f)
      }
    })
    sock.on('error', () => {})
  })
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({
    url: `ws://127.0.0.1:${server.address().port}/connect`,
    frames,
    get auth() { return auth },
    send: f => socket.write(encodeWs(JSON.stringify(frame(f)))),
    /** Resolve with the first frame (already received or future) matching. */
    next(match, timeoutMs = 3000) {
      const pred = typeof match === 'string' ? f => f.type === match : match
      const hit = frames.find(f => pred(f) && !f.__taken)
      if (hit) { hit.__taken = true; return Promise.resolve(hit) }
      return new Promise((done, reject) => {
        const t = setTimeout(() => reject(new Error(`timeout waiting for frame ${typeof match === 'string' ? match : 'match'}`)), timeoutMs)
        waiters.push({ match: pred, resolve: f => { clearTimeout(t); f.__taken = true; done(f) } })
      })
    },
    close: () => new Promise(r => { for (const s of sockets) s.destroy(); server.close(() => r()) }),
  })))
}

// ---------- fake DSH host ----------

function fakeHost() {
  const calls = { create: [], prompt: [], cancel: [], updateQueue: [], appended: [] }
  const agents = new Map()
  const agentOf = id => {
    if (!agents.has(id)) {
      agents.set(id, {
        id,
        inbox: { nextTurn: [], nextStep: [] },
        session: { id, append: (type, data) => calls.appended.push({ id, type, data }) },
      })
    }
    return agents.get(id)
  }
  let n = 0
  const ctx = {
    logger: { info() {}, warn() {}, error() {} },
    get: name => name === 'agents' ? { get: id => agents.get(id) } : undefined,
    approval: { effectivePolicy: () => 'ask', setPolicy() {} },
    sessionController: {
      async create(req) { calls.create.push(req); return { sessionId: `s${++n}` } },
      async resolveAgent(id) { return { agent: agentOf(id) } },
      async prompt(req) { calls.prompt.push(req); return { accepted: true } },
      cancel(req) { calls.cancel.push(req); return { accepted: true } },
      async updateQueue(req) { calls.updateQueue.push(req); return { accepted: true } },
    },
  }
  return { ctx, calls, agentOf }
}

function memoryBindings() {
  let bindings = {}
  return {
    bindings: () => ({ ...bindings }),
    setBinding: async (id, b) => { bindings = { ...bindings }; if (b === undefined) delete bindings[id]; else bindings[id] = b },
  }
}

const settle = () => new Promise(r => setTimeout(r, 30))

// ---------- shared setup ----------

let relay, host, bridge, connector, workspace

before(async () => {
  workspace = await mkdtemp(join(tmpdir(), 'sb-ws-'))
  relay = await startRelay()
  host = fakeHost()
  const config = normalizeConfig({ relayUrl: relay.url, hostId: 'mac', workspaces: { ws: workspace } })
  bridge = createBridge(host.ctx, config, memoryBindings(), () => connector)
  connector = new Connector({
    relayUrl: relay.url, hostId: 'mac', token: 'tok', harnesses: ['dsh'],
    workspaces: [{ name: 'ws', path: workspace }], version: 'test',
    store: new MemoryStore(), handler: bridge.handler,
  })
  await connector.start()
  const hello = await relay.next('hello')
  assert.equal(hello.hostId, 'mac')
  assert.equal(relay.auth, 'Bearer tok')
  relay.send({ type: 'welcome', serverTime: Date.now(), approvalTimeoutMs: 60_000, ackedSeqs: {} })
})

after(async () => {
  bridge.dispose()
  await connector.stop()
  await relay.close()
  await rm(workspace, { recursive: true, force: true })
})

async function dispatch(runId, extra = {}) {
  relay.send({
    type: 'run.dispatch', runId, conversationId: 'tg:1',
    binding: { harness: 'dsh', workspace: 'ws', profile: 'workspace-write', ...extra },
    prompt: { text: `hello ${runId}` }, mode: 'queue',
  })
  const accepted = await relay.next(f => f.type === 'run.accepted' && f.runId === runId)
  return accepted.sessionId
}

// ---------- tests ----------

test('dispatch -> streamed events -> run.end', async () => {
  const sessionId = await dispatch('R1')
  assert.equal(host.calls.create.at(-1).cwd.endsWith(workspace.split('/').at(-1)), true)
  const p = host.calls.prompt.at(-1)
  assert.deepEqual({ requestId: p.requestId, sessionId: p.sessionId, mode: p.mode }, { requestId: 'R1', sessionId, mode: 'queue' })
  assert.equal(p.content[0].text, 'hello R1')
  // No permission preset service: knobs are written directly.
  assert.ok(host.calls.appended.some(e => e.id === sessionId && e.type === 'sandbox/mode' && e.data.mode === 'workspace-write'))

  const agent = host.agentOf(sessionId)
  const session = agent.session
  bridge.onClaimed({ agent, message: { source: { kind: 'user', rpcId: 'R1' }, content: [] }, turn: 1 })
  bridge.onStream({ agent, frame: { type: 'chunk', turn: 1, chunk: { type: 'text-delta', text: 'Hel' } } })
  bridge.onSessionEvent(session, { type: 'tool/call', data: { callId: 'c1', name: 'bash', arguments: '{"command":"ls -la"}' } })
  bridge.onSessionEvent(session, { type: 'tool/result', surfaceOp: 'append', data: { message: { toolCallId: 'c1', isError: false, content: [{ type: 'text', text: 'a\nb' }] } } })
  bridge.onSessionEvent(session, { type: 'todo/write', data: { todos: [{ content: 'step', status: 'in_progress' }] } })
  bridge.onSessionEvent(session, { type: 'assistant/message', data: { turn: 1, usage: { input: 10, output: 5 }, message: { content: [{ type: 'reasoning', text: 'think' }, { type: 'text', text: 'Hello' }] } } })
  bridge.onSessionEvent(session, { type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } })

  const delta = await relay.next('run.delta')
  assert.equal(delta.text, 'Hel')
  const end = await relay.next(f => f.type === 'run.end' && f.runId === 'R1')
  assert.equal(end.status, 'succeeded')
  assert.deepEqual(end.usage, { input: 10, output: 5 })
  const events = relay.frames.filter(f => f.type === 'run.event' && f.runId === 'R1')
  assert.deepEqual(events.map(f => f.event.type), ['tool.start', 'tool.end', 'plan', 'thinking', 'text.final'])
  assert.deepEqual(events.map(f => f.seq), [0, 1, 2, 3, 4])
  assert.equal(end.seq, 5)
  assert.equal(events[0].event.title, 'ls -la')
  assert.equal(events[4].event.text, 'Hello')
  assert.equal(bridge.active.size, 0)
})

test('approval: relay wins and the GUI request signal is aborted', async () => {
  const sessionId = await dispatch('R2', { sessionId: 's1' })
  const agent = host.agentOf(sessionId)
  bridge.onClaimed({ agent, message: { source: { kind: 'user', rpcId: 'R2' }, content: [] }, turn: 2 })

  const original = new AbortController()
  const req = { agent, toolName: 'bash', callId: 'c9', reason: 'escalate sandbox', signal: original.signal }
  let guiSignal
  const next = () => {
    guiSignal = req.signal // the GUI forwarder reads the signal when it runs
    return new Promise((_, reject) => guiSignal.addEventListener('abort', () => reject(new Error('dismissed'))))
  }
  const outcome = bridge.onApproval(req, next)
  const ask = await relay.next('approval.request')
  assert.equal(ask.runId, 'R2')
  assert.equal(ask.toolName, 'bash')
  assert.match(ask.summary, /escalate sandbox/)
  await settle()
  assert.equal(guiSignal.aborted, false)
  relay.send({ type: 'approval.resolve', approvalId: ask.approvalId, outcome: 'allowed-once', decidedBy: 'tg:owner' })
  assert.equal(await outcome, 'allowed-once')
  assert.equal(guiSignal.aborted, true, 'GUI prompt is withdrawn')
  assert.equal(original.signal.aborted, false, 'the host request signal is untouched')
})

test('approval: GUI wins and the relay is told', async () => {
  const agent = host.agentOf('s1')
  const req = { agent, toolName: 'write', signal: new AbortController().signal }
  const outcome = bridge.onApproval(req, async () => 'rejected')
  const ask = await relay.next('approval.request')
  assert.equal(await outcome, 'rejected')
  const withdrawn = await relay.next('approval.withdrawn')
  assert.deepEqual({ id: withdrawn.approvalId, outcome: withdrawn.outcome, by: withdrawn.decidedBy }, { id: ask.approvalId, outcome: 'rejected', by: 'gui' })
})

test('approval on an unbound session goes to next()', async () => {
  const agent = host.agentOf('unbound')
  const outcome = await bridge.onApproval({ agent, toolName: 'bash' }, async () => 'allowed-once')
  assert.equal(outcome, 'allowed-once')
})

test('cancel: cancels the turn, settles approvals, ends cancelled', async () => {
  const agent = host.agentOf('s1')
  const pending = bridge.onApproval({ agent, toolName: 'bash', signal: new AbortController().signal }, () => new Promise(() => {}))
  await relay.next('approval.request')
  relay.send({ type: 'run.cancel', runId: 'R2' })
  assert.equal(await pending, 'cancelled')
  await settle()
  assert.deepEqual(host.calls.cancel.at(-1), { sessionId: 's1' })
  bridge.onSessionEvent(agent.session, { type: 'turn/end', data: { turn: 2, reason: { kind: 'interrupted' } } })
  const end = await relay.next(f => f.type === 'run.end' && f.runId === 'R2')
  assert.equal(end.status, 'cancelled')
})

test('cancel before the turn starts removes the queued prompt', async () => {
  const sessionId = await dispatch('R3', { sessionId: 's1' })
  const agent = host.agentOf(sessionId)
  agent.inbox.nextTurn.push({ id: 'item-1', source: { kind: 'user', rpcId: 'R3' } })
  relay.send({ type: 'run.cancel', runId: 'R3' })
  const end = await relay.next(f => f.type === 'run.end' && f.runId === 'R3')
  assert.equal(end.status, 'cancelled')
  assert.deepEqual(host.calls.updateQueue.at(-1), { sessionId: 's1', itemId: 'item-1', action: { kind: 'remove' } })
  agent.inbox.nextTurn.length = 0
})

test('GUI turn on a bound session -> run.open and streamed run', async () => {
  const agent = host.agentOf('s1')
  bridge.onClaimed({ agent, message: { source: { kind: 'user', rpcId: 'gui-req' }, content: [{ type: 'text', text: 'from the GUI' }] }, turn: 3 })
  const open = await relay.next('run.open')
  assert.deepEqual({ harness: open.harness, sessionId: open.sessionId, origin: open.origin, text: open.text }, { harness: 'dsh', sessionId: 's1', origin: 'gui', text: 'from the GUI' })
  bridge.onSessionEvent(agent.session, { type: 'assistant/message', data: { turn: 3, message: { content: [{ type: 'text', text: 'ok' }] } } })
  bridge.onSessionEvent(agent.session, { type: 'turn/end', data: { turn: 3, reason: { kind: 'completed' } } })
  const end = await relay.next(f => f.type === 'run.end' && f.runId === open.runId)
  assert.equal(end.status, 'succeeded')
  const final = relay.frames.find(f => f.type === 'run.event' && f.runId === open.runId)
  assert.equal(final.event.text, 'ok')

  // Unbound sessions are ignored.
  bridge.onClaimed({ agent: host.agentOf('other'), message: { source: { kind: 'user' }, content: [] }, turn: 1 })
  await settle()
  assert.equal(relay.frames.filter(f => f.type === 'run.open').length, 1)
})

test('session.close forgets the binding', async () => {
  relay.send({ type: 'session.close', harness: 'dsh', sessionId: 's1' })
  await settle()
  const agent = host.agentOf('s1')
  bridge.onClaimed({ agent, message: { source: { kind: 'user' }, content: [] }, turn: 4 })
  await settle()
  assert.equal(relay.frames.filter(f => f.type === 'run.open').length, 1)
})

test('profile guard rejects a never-approval preset', async () => {
  const { ctx } = fakeHost()
  ctx.get = name => name === 'permissionPresets' ? { resolve: () => ({ sandbox: 'workspace-write', approval: 'never' }), set() { throw new Error('must not apply') } } : undefined
  const b = createBridge(ctx, normalizeConfig({ relayUrl: 'ws://x', workspaces: { ws: workspace } }), memoryBindings(), () => ({ handle: () => ({}) }))
  await assert.rejects(
    b.handler.dispatch({ runId: 'RX', conversationId: 'c', binding: { harness: 'dsh', workspace: 'ws', profile: 'workspace-write' }, prompt: { text: 'x', attachments: [] }, mode: 'queue' }, { accepted() {} }),
    /require "ask"/,
  )
})

test('helpers', () => {
  assert.equal(toolTitle('read', '{"path":"/a/b"}'), '/a/b')
  assert.equal(toolTitle('x', 'not json'), 'x not json')
  assert.deepEqual(endStatusOf({ kind: 'completed' }), { status: 'succeeded', reason: undefined })
  assert.equal(endStatusOf({ kind: 'error', error: { message: 'boom' } }).reason, 'boom')
  assert.equal(endStatusOf({ kind: 'completed' }, true).status, 'cancelled')
  const c = normalizeConfig({ profiles: { readonly: 'ro' }, approvalMode: 'bogus' })
  assert.deepEqual(c.profiles, { readonly: 'ro', 'workspace-write': 'workspace-write' })
  assert.equal(c.approvalMode, 'race')
})
