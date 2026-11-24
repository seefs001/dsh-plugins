import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { test } from 'node:test'
import { Workbench } from '../lib/manager.js'

function createMemoryDomain() {
  let globalData = {}
  const tables = new Map()
  const table = name => {
    if (!tables.has(name)) tables.set(name, new Map())
    const map = tables.get(name)
    return {
      get: key => map.get(key),
      entries: () => [...map.entries()],
      put: async (key, value) => { map.set(key, structuredClone(value)) },
      delete: async key => { map.delete(key) },
    }
  }
  return {
    global: {
      get: () => structuredClone(globalData),
      set: async next => { globalData = structuredClone(next) },
    },
    table,
    flush: async () => {},
    close: async () => {},
  }
}

function createFakeSubprocess(handler) {
  return {
    resolveExecutable: async command => command,
    spawn: () => {
      const stdin = new PassThrough()
      const stdout = new PassThrough()
      const stderr = new PassThrough()
      const done = Promise.withResolvers()
      const finish = () => {
        stdout.end()
        stderr.end()
        queueMicrotask(() => done.resolve({ exitCode: 0, signal: null }))
      }
      stdin.on('end', finish)
      const child = Object.assign(new EventEmitter(), {
        stdin,
        stdout,
        stderr,
        done: done.promise,
        waitForExit: () => done.promise,
        kill: finish,
        terminate: async () => { finish(); await done.promise },
      })
      const send = message => stdout.write(`${JSON.stringify(message)}\n`)
      let buffer = ''
      stdin.setEncoding('utf8')
      stdin.on('data', chunk => {
        buffer += chunk
        while (buffer.includes('\n')) {
          const index = buffer.indexOf('\n')
          const line = buffer.slice(0, index).trim()
          buffer = buffer.slice(index + 1)
          if (!line) continue
          const message = JSON.parse(line)
          void Promise.resolve(handler(message, send, child))
        }
      })
      return child
    },
  }
}

test('Workbench probe(models) probes per-model configOptions for Claude Code, records auth status, and calls session/close', async () => {
  const rpcLog = []
  let closedSessionId = null
  const byModel = {
    default: [
      { id: 'model', category: 'model', type: 'select', currentValue: 'default', options: [{ value: 'default', name: 'Default (recommended)' }, { value: 'opus', name: 'Opus 5.5 (opus)' }, { value: 'haiku', name: 'Claude Haiku 4.5 (haiku)' }] },
      { id: 'mode', category: 'mode', type: 'select', currentValue: 'default', options: [{ value: 'default', name: 'Default' }, { value: 'plan', name: 'Plan' }] },
      { id: 'effort', category: 'thought_level', type: 'select', currentValue: 'high', options: [{ value: 'low', name: 'Low' }, { value: 'high', name: 'High' }] },
    ],
    opus: [
      { id: 'model', category: 'model', type: 'select', currentValue: 'opus', options: [{ value: 'default', name: 'Default (recommended)' }, { value: 'opus', name: 'Opus 5.5 (opus)' }, { value: 'haiku', name: 'Claude Haiku 4.5 (haiku)' }] },
      { id: 'effort', category: 'thought_level', type: 'select', currentValue: 'high', options: [{ value: 'low', name: 'Low' }, { value: 'high', name: 'High' }, { value: 'max', name: 'Max' }] },
      { id: 'fast', name: 'Fast', description: 'Faster responses', category: 'model_config', type: 'boolean', currentValue: false },
      { id: 'ultracode', name: 'Ultracode', category: 'model_config', type: 'boolean', currentValue: false },
    ],
    haiku: [
      { id: 'model', category: 'model', type: 'select', currentValue: 'haiku', options: [{ value: 'default', name: 'Default (recommended)' }, { value: 'opus', name: 'Opus 5.5 (opus)' }, { value: 'haiku', name: 'Claude Haiku 4.5 (haiku)' }] },
      { id: 'effort', category: 'thought_level', type: 'select', currentValue: 'low', options: [{ value: 'low', name: 'Low' }] },
    ],
  }

  const subprocess = createFakeSubprocess((msg, send) => {
    rpcLog.push(msg)
    if (msg.method === 'initialize') {
      assert.deepEqual(msg.params.clientCapabilities.session.configOptions.boolean, {})
      send({
        jsonrpc: '2.0',
        method: 'auth/status_update',
        params: { state: 'authenticated', accounts: [{ email: 'dev@example.com' }] },
      })
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: 1,
          agentInfo: { name: '@agentclientprotocol/claude-agent-acp', title: 'Claude Agent', version: '0.107.4' },
          agentCapabilities: {
            loadSession: true,
            promptCapabilities: { image: true },
            sessionCapabilities: { close: {}, options: {}, resume: {} },
          },
          _meta: { steering: { supported: true } },
        },
      })
      return
    }
    if (msg.method === 'session/new') {
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: { sessionId: 'probe-1', configOptions: byModel.default },
      })
      return
    }
    if (msg.method === 'session/set_config_option') {
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: { configOptions: byModel[msg.params.value] ?? [] },
      })
      return
    }
    if (msg.method === 'session/close') {
      closedSessionId = msg.params.sessionId
      send({ jsonrpc: '2.0', id: msg.id, result: {} })
    }
  })

  const manager = new Workbench({
    domain: createMemoryDomain(),
    subprocess,
    changed: () => {},
    modelsChanged: () => {},
    log: () => {},
  })
  await manager.initialize()

  const probed = await manager.probe('claude-code', process.cwd(), 'models')
  assert.equal(closedSessionId, 'probe-1')
  assert.deepEqual(probed.models.map(item => item.id), ['opus', 'haiku'])
  assert.equal(probed.meta?.steering, true)

  const opus = probed.models.find(item => item.id === 'opus')
  assert.deepEqual(opus.options.map(item => item.id), ['fast', 'ultracode'])
  assert.equal(opus.options.find(item => item.id === 'fast')?.type, 'boolean')
  assert.equal(opus.contextWindow, 1_000_000)

  const haiku = probed.models.find(item => item.id === 'haiku')
  assert.equal(haiku.options, undefined)
  assert.equal(haiku.contextWindow, 200_000)

  const snap = manager.snapshot()
  assert.equal(snap.authByProvider['claude-code']?.state, 'authenticated')
  assert.equal(snap.authByProvider['claude-code']?.accounts?.[0]?.email, 'dev@example.com')

  await manager.close()
})

test('Workbench supports initialConfigOptions, URL elicitation + complete_elicitation, usage context caching, and _session/steering', async () => {
  let receivedInitialConfig = null
  let receivedSteer = null
  let elicitationReply = null
  let sendToClient = null
  let promptId = null

  const subprocess = createFakeSubprocess((msg, send) => {
    sendToClient = send
    if (msg.method === 'initialize') {
      assert.deepEqual(msg.params.clientCapabilities.elicitation, { form: {}, url: {} })
      assert.deepEqual(msg.params.clientCapabilities.session.configOptions.boolean, {})
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: 1,
          agentInfo: { name: '@agentclientprotocol/claude-agent-acp', title: 'Claude Agent', version: '0.107.4' },
          agentCapabilities: {
            loadSession: true,
            promptCapabilities: { image: true },
            sessionCapabilities: { close: {}, options: {}, resume: {} },
          },
          _meta: { steering: { supported: true } },
        },
      })
      return
    }
    if (msg.method === 'session/new') {
      receivedInitialConfig = msg.params.configOptions
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          sessionId: 'sess-1',
          configOptions: [
            { id: 'model', category: 'model', type: 'select', currentValue: 'opus', options: [{ value: 'opus', name: 'Opus 5.5' }] },
            { id: 'fast', category: 'model_config', type: 'boolean', currentValue: true },
          ],
        },
      })
      return
    }
    if (msg.method === 'session/prompt') {
      promptId = msg.id
      send({
        jsonrpc: '2.0',
        method: 'session/update',
        params: {
          sessionId: 'sess-1',
          update: {
            sessionUpdate: 'usage_update',
            used: 12000,
            size: 500000,
            _meta: { '_claude/model': 'opus' },
          },
        },
      })
      send({
        jsonrpc: '2.0',
        id: 99,
        method: 'elicitation/create',
        params: {
          sessionId: 'sess-1',
          mode: 'url',
          elicitationId: 'elicit-oauth',
          message: 'Open OAuth login',
          url: 'https://example.com/auth',
        },
      })
      return
    }
    if (msg.method === '_session/steering') {
      receivedSteer = msg.params
      send({ jsonrpc: '2.0', id: msg.id, result: { accepted: true } })
      return
    }
    if (msg.id === 99) {
      elicitationReply = msg.result
    }
  })

  const manager = new Workbench({
    domain: createMemoryDomain(),
    subprocess,
    changed: () => {},
    modelsChanged: () => {},
    log: () => {},
  })
  await manager.initialize()

  const detail = await manager.create({ providerId: 'claude-code', cwd: process.cwd(), connect: false })
  const session = manager.session(detail.id)
  await manager.connect(session, {
    initialConfigOptions: [{ configId: 'model', value: 'opus' }, { configId: 'fast', value: true }],
  })
  assert.deepEqual(receivedInitialConfig, [{ configId: 'model', value: 'opus' }, { configId: 'fast', value: true }])

  await manager.prompt(session, 'Run task')
  await new Promise(resolve => setTimeout(resolve, 40))

  const overviewWaiting = manager.overview(session)
  assert.equal(overviewWaiting.interactions.length, 1)
  assert.equal(overviewWaiting.interactions[0].kind, 'url')
  assert.equal(overviewWaiting.interactions[0].urlInfo.url, 'https://example.com/auth')

  sendToClient({
    jsonrpc: '2.0',
    method: 'session/complete_elicitation',
    params: { sessionId: 'sess-1', elicitationId: 'elicit-oauth' },
  })
  await new Promise(resolve => setTimeout(resolve, 30))
  assert.deepEqual(elicitationReply, { action: 'accept' })
  assert.equal(manager.overview(session).interactions.length, 0)

  const steerRes = await manager.steer(session, 'Skip docs update')
  assert.equal(steerRes.steered, true)
  assert.equal(receivedSteer.sessionId, 'sess-1')
  assert.deepEqual(receivedSteer.prompt, [{ type: 'text', text: 'Skip docs update' }])

  sendToClient({ jsonrpc: '2.0', id: promptId, result: { stopReason: 'end_turn' } })
  await manager.runtimes.get(session.id)?.completion

  const provider = manager.provider('claude-code')
  assert.equal(provider.advertised.models.find(item => item.id === 'opus')?.contextWindow, 500000)

  await manager.close()
})

test('Workbench tracks Antigravity background tasks across deferred end_turn, timer promotion, and daemon kill', async () => {
  let sendToClient = null
  let promptId = null

  const subprocess = createFakeSubprocess((msg, send) => {
    sendToClient = send
    if (msg.method === 'initialize') {
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: 1,
          agentInfo: { name: 'antigravity', title: 'Antigravity', version: '1.0.0' },
          agentCapabilities: { loadSession: true },
        },
      })
      return
    }
    if (msg.method === 'session/new') {
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: { sessionId: 'agy-1' },
      })
      return
    }
    if (msg.method === 'session/prompt') {
      promptId = msg.id
    }
  })

  const manager = new Workbench({
    domain: createMemoryDomain(),
    subprocess,
    changed: () => {},
    modelsChanged: () => {},
    log: () => {},
    asyncWakeup: { settleMs: 40, silentSettleMs: 120, idleTimeoutMs: 200 },
    backgroundTaskPromoteMs: 40,
  })
  await manager.initialize()

  const detail = await manager.create({ providerId: 'antigravity', cwd: process.cwd(), connect: false })
  const session = manager.session(detail.id)
  await manager.connect(session)
  await manager.prompt(session, 'Install dependencies')
  await new Promise(resolve => setTimeout(resolve, 15))

  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: {
      sessionId: 'agy-1',
      update: {
        sessionUpdate: 'tool_call',
        toolCallId: 'call_fast',
        name: 'run_command',
        kind: 'execute',
        status: 'in_progress',
        rawInput: { CommandLine: 'ls', WaitMsBeforeAsync: 5000, toolSummary: 'List files' },
      },
    },
  })
  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: {
      sessionId: 'agy-1',
      update: {
        sessionUpdate: 'tool_call_update',
        toolCallId: 'call_fast',
        name: 'run_command',
        kind: 'execute',
        status: 'completed',
        rawInput: { CommandLine: 'ls', WaitMsBeforeAsync: 5000, toolSummary: 'List files' },
        rawOutput: { output: 'Command exited with code 0.\nREADME.md', exit_code: 0 },
      },
    },
  })
  await new Promise(resolve => setTimeout(resolve, 15))
  assert.equal(manager.overview(session).backgroundTasks.length, 0)

  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: {
      sessionId: 'agy-1',
      update: {
        sessionUpdate: 'tool_call',
        toolCallId: 'call_bg',
        name: 'run_command',
        kind: 'execute',
        status: 'in_progress',
        rawInput: { CommandLine: 'npm install', WaitMsBeforeAsync: 10000, toolSummary: 'Install npm deps' },
      },
    },
  })
  sendToClient({ jsonrpc: '2.0', id: promptId, result: { stopReason: 'end_turn' } })
  await new Promise(resolve => setTimeout(resolve, 20))

  const duringBg = manager.overview(session).backgroundTasks
  assert.equal(duringBg.length, 1)
  assert.equal(duringBg[0].id, 'call_bg')
  assert.equal(duringBg[0].label, 'Install npm deps')
  assert.equal(duringBg[0].command, 'npm install')
  assert.equal(duringBg[0].status, 'running')
  assert.equal(duringBg[0].kind, 'command')

  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: {
      sessionId: 'agy-1',
      update: {
        sessionUpdate: 'tool_call',
        toolCallId: 'call_daemon',
        name: 'run_command',
        kind: 'execute',
        status: 'in_progress',
        rawInput: { CommandLine: 'pnpm dev', IsDaemon: true, toolSummary: 'Dev server' },
      },
    },
  })
  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: {
      sessionId: 'agy-1',
      update: {
        sessionUpdate: 'tool_call_update',
        toolCallId: 'call_daemon',
        name: 'run_command',
        kind: 'execute',
        status: 'completed',
        rawInput: { CommandLine: 'pnpm dev', IsDaemon: true, toolSummary: 'Dev server' },
        rawOutput: { output: 'Tool is running as a background task with task id: agy-1/task-9' },
      },
    },
  })
  await new Promise(resolve => setTimeout(resolve, 15))
  const daemonTask = manager.overview(session).backgroundTasks.find(item => item.id === 'call_daemon')
  assert.equal(daemonTask?.status, 'running')
  assert.equal(daemonTask?.isDaemon, true)
  assert.equal(daemonTask?.taskId, 'agy-1/task-9')

  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: {
      sessionId: 'agy-1',
      update: {
        sessionUpdate: 'tool_call_update',
        toolCallId: 'call_bg',
        name: 'run_command',
        kind: 'execute',
        status: 'completed',
        rawInput: { CommandLine: 'npm install', WaitMsBeforeAsync: 10000, toolSummary: 'Install npm deps' },
        rawOutput: { output: 'Command exited with code 0.\nadded 10 packages', exit_code: 0 },
      },
    },
  })
  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: {
      sessionId: 'agy-1',
      update: {
        sessionUpdate: 'tool_call_update',
        toolCallId: 'call_kill',
        name: 'manage_task',
        status: 'completed',
        rawInput: { Action: 'kill', TaskId: 'agy-1/task-9' },
      },
    },
  })
  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: { sessionId: 'agy-1', update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'Done' } } },
  })
  sendToClient({
    jsonrpc: '2.0',
    method: 'session/update',
    params: { sessionId: 'agy-1', update: { sessionUpdate: 'usage_update', used: 100, size: 10000 } },
  })
  await manager.runtimes.get(session.id)?.completion

  const afterTasks = manager.overview(session).backgroundTasks
  const finishedBg = afterTasks.find(item => item.id === 'call_bg')
  assert.equal(finishedBg?.status, 'completed')
  assert.equal(finishedBg?.exitCode, 0)
  assert.match(finishedBg?.output ?? '', /added 10 packages/u)
  const killedDaemon = afterTasks.find(item => item.id === 'call_daemon')
  assert.equal(killedDaemon?.status, 'cancelled')

  await manager.close()
})

test('Workbench maps legacyModes on resume and configure without failing with invalid_params, and records probe latency', async () => {
  const receivedCalls = []
  let shouldFailProbe = false

  const subprocess = createFakeSubprocess((msg, send) => {
    receivedCalls.push(msg)
    if (msg.method === 'initialize') {
      if (shouldFailProbe) {
        send({ jsonrpc: '2.0', id: msg.id, error: { code: -32000, message: 'CLI unavailable' } })
        return
      }
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: 1,
          agentInfo: { name: 'Hermes ACP', version: '0.9.1' },
          agentCapabilities: {
            loadSession: true,
            sessionCapabilities: { close: {}, options: {}, resume: {} },
          },
        },
      })
      return
    }
    if (msg.method === 'session/resume') {
      const modeOpt = msg.params.configOptions?.find(item => item.configId === 'edit_approval_policy' || item.configId === 'mode')
      if (modeOpt && !['ask', 'workspace_session', 'session'].includes(modeOpt.value)) {
        send({ jsonrpc: '2.0', id: msg.id, error: { code: -32602, message: 'invalid_params: unknown mode' } })
        return
      }
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          sessionId: msg.params.sessionId,
          configOptions: [{
            id: 'edit_approval_policy',
            category: 'mode',
            type: 'select',
            currentValue: modeOpt?.value ?? 'ask',
            options: [
              { value: 'ask', name: 'Ask' },
              { value: 'workspace_session', name: 'Workspace session' },
              { value: 'session', name: 'Session' },
            ],
          }],
        },
      })
      return
    }
    if (msg.method === 'session/set_config_option') {
      if (msg.params.configId !== 'edit_approval_policy' || !['ask', 'workspace_session', 'session'].includes(msg.params.value)) {
        send({ jsonrpc: '2.0', id: msg.id, error: { code: -32602, message: 'invalid_params' } })
        return
      }
      send({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          configOptions: [{
            id: 'edit_approval_policy',
            category: 'mode',
            type: 'select',
            currentValue: msg.params.value,
            options: [
              { value: 'ask', name: 'Ask' },
              { value: 'workspace_session', name: 'Workspace session' },
              { value: 'session', name: 'Session' },
            ],
          }],
        },
      })
    }
  })

  const manager = new Workbench({
    domain: createMemoryDomain(),
    subprocess,
    changed: () => {},
    modelsChanged: () => {},
    log: () => {},
  })
  await manager.initialize()
  await manager.saveProvider({
    id: 'hermes',
    label: 'Hermes',
    command: 'hermes',
    args: ['acp'],
    models: [],
  })

  const diag = await manager.probe('hermes', process.cwd(), 'diagnose')
  assert.equal(typeof diag.latencyMs, 'number')
  assert.ok(diag.latencyMs >= 0)
  const snapReady = manager.snapshot()
  assert.equal(snapReady.probeByProvider.hermes?.status, 'ready')
  assert.equal(snapReady.probeByProvider.hermes?.agentLabel, 'Hermes ACP 0.9.1')
  assert.equal(typeof snapReady.probeByProvider.hermes?.latencyMs, 'number')

  const created = await manager.create(
    { providerId: 'hermes', cwd: process.cwd(), connect: false, remoteId: 'hermes-persisted-1' },
    { sessionId: 'dsh-1', route: 'acp-hermes', runs: [{ id: 'r1', state: 'completed' }], preferences: { mode: 'accept_edits', options: {} } },
  )
  const session = manager.session(created.id)
  await manager.connect(session, {
    initialConfigOptions: [{ configId: 'mode', value: 'accept_edits' }],
  })

  const resumeCall = receivedCalls.find(item => item.method === 'session/resume')
  assert.deepEqual(resumeCall?.params.configOptions, [{ configId: 'mode', value: 'workspace_session' }])
  assert.equal(session.native.preferences.mode, 'workspace_session')

  await manager.configure(session, { modeId: 'dont_ask' })
  const setConfigCall = receivedCalls.find(item => item.method === 'session/set_config_option')
  assert.deepEqual(setConfigCall?.params, {
    sessionId: 'hermes-persisted-1',
    configId: 'edit_approval_policy',
    value: 'session',
  })

  await manager.disconnect(session)

  shouldFailProbe = true
  await assert.rejects(() => manager.probe('hermes', process.cwd(), 'diagnose'), /CLI unavailable/u)
  const snapErr = manager.snapshot()
  assert.equal(snapErr.probeByProvider.hermes?.status, 'error')
  assert.match(snapErr.probeByProvider.hermes?.error ?? '', /CLI unavailable/u)

  await manager.close()
})
