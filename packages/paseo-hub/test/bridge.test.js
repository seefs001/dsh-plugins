import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HubBridge } from '../lib/bridge.js'
import { validateAgent } from '../lib/catalog.js'

const CATALOG = {
  default: { provider: 'messages', model: 'claude-sonnet-4' },
  groups: [
    {
      id: 'messages',
      name: 'Anthropic',
      models: [
        {
          id: 'claude-sonnet-4',
          name: 'Claude Sonnet 4',
          reasoning: { defaultEffort: 'medium', efforts: [{ id: 'low' }, { id: 'medium' }, { id: 'high' }] },
        },
      ],
    },
  ],
  failures: [],
}

const MODES = {
  entries: [{ id: 'workspace-write', preset: 'workspace-write', option: { name: 'Workspace write' } }],
  defaultModeId: 'workspace-write',
}

function makeHarness(overrides = {}) {
  const sent = []
  const calls = {
    modelCatalog: [],
    unarchive: [],
    resolveAgent: [],
    cancel: [],
    prompt: [],
    puts: [],
  }
  const agents = new Map(overrides.agents ?? [])
  const archivedSessionIds = [...(overrides.archivedSessionIds ?? [])]
  const runs = new Map(overrides.runs ?? [])

  const store = {
    bySession: id => runs.get(id),
    byKey: key => [...runs.values()].find(run => run.key === key),
    sessions: () => [...runs.keys()],
    put: async run => {
      runs.set(run.sessionId, run)
      calls.puts.push(run)
    },
    remove: async key => {
      for (const [id, run] of runs.entries()) {
        if (run.key === key) runs.delete(id)
      }
    },
  }

  const ctx = {
    agents: { get: id => agents.get(id) },
    workspaceRegistry: { archivedSessionIds },
    workspaceController: {
      unarchiveSession: async ({ sessionId }) => {
        calls.unarchive.push(sessionId)
        const idx = archivedSessionIds.indexOf(sessionId)
        if (idx >= 0) archivedSessionIds.splice(idx, 1)
      },
      archiveSession: async ({ sessionId }) => {
        if (!archivedSessionIds.includes(sessionId)) archivedSessionIds.push(sessionId)
      },
      create: async () => {},
    },
    sessionController: {
      modelCatalog: async (...args) => {
        calls.modelCatalog.push(args)
        if (overrides.modelCatalog) return overrides.modelCatalog(...args)
        return CATALOG
      },
      resolveAgent: async sessionId => {
        calls.resolveAgent.push(sessionId)
        if (overrides.resolveAgent) return overrides.resolveAgent(sessionId, agents)
        const loaded = { id: sessionId, status: 'idle', session: { header: { cwd: '/repo' } } }
        agents.set(sessionId, loaded)
        return { agent: loaded }
      },
      cancel: ({ sessionId }) => {
        calls.cancel.push(sessionId)
        const agent = agents.get(sessionId)
        if (agent) agent.status = 'idle'
      },
      prompt: async (req, signal) => {
        calls.prompt.push({ req, hasSignal: signal instanceof AbortSignal })
        return { accepted: true }
      },
    },
    get: name => (name === 'permissionPresets'
      ? { catalog: () => ({ defaultPreset: 'workspace-write', options: [{ value: 'workspace-write', name: 'Workspace write' }] }) }
      : undefined),
  }

  const bridge = new HubBridge(ctx, {
    send: frame => sent.push(frame),
    store,
    config: {},
    permissions: ['hub.execute'],
    daemonId: 'daemon-1',
    hostname: overrides.hostname !== undefined ? overrides.hostname : 'dev-mac',
    machineKind: overrides.machineKind !== undefined ? overrides.machineKind : 'laptop',
    log: () => {},
  })

  return { bridge, sent, calls, agents, archivedSessionIds, runs }
}

test('hello / serverInfo emits real hostname and detected machineKind', async () => {
  const { bridge, sent } = makeHarness({ hostname: 'studio-box', machineKind: 'workstation' })
  await bridge.receive({ type: 'hello' })

  assert.equal(sent.length, 1)
  assert.equal(sent[0].type, 'session')
  assert.equal(sent[0].message.type, 'status')
  assert.deepEqual(sent[0].message.payload.hostname, 'studio-box')
  assert.deepEqual(sent[0].message.payload.machineKind, 'workstation')
  assert.equal(sent[0].message.payload.serverId, 'dsh-daemon-1')
})

test('serverInfo omits machineKind when detection yields null', async () => {
  const { bridge, sent } = makeHarness({ hostname: 'linux-box', machineKind: null })
  await bridge.receive({ type: 'hello' })

  assert.equal(sent[0].message.payload.hostname, 'linux-box')
  assert.equal('machineKind' in sent[0].message.payload, false)
})

test('validateAgent accepts optional absolute cwd and rejects relative cwd', () => {
  assert.deepEqual(
    validateAgent({ provider: 'dsh', cwd: '/workspace/repo', model: 'messages/claude-sonnet-4' }, { catalog: CATALOG, modes: MODES }),
    [],
  )
  assert.deepEqual(
    validateAgent({ provider: 'dsh', model: 'messages/claude-sonnet-4' }, { catalog: CATALOG, modes: MODES }),
    [],
  )
  const issues = validateAgent({ provider: 'dsh', cwd: 'relative/dir' }, { catalog: CATALOG, modes: MODES })
  assert.equal(issues.length, 1)
  assert.deepEqual(issues[0].path, ['cwd'])
})

test('hub.execution.agent.validate.request passes optional cwd to catalog lookup and validation', async () => {
  const workspaceCatalog = {
    default: { provider: 'workspace', model: 'scoped-model' },
    groups: [{ id: 'workspace', name: 'Workspace', models: [{ id: 'scoped-model', name: 'Scoped' }] }],
    failures: [],
  }
  const { bridge, sent, calls } = makeHarness({
    modelCatalog: arg => (arg?.cwd === '/workspace/app' ? workspaceCatalog : CATALOG),
  })

  await bridge.receive({
    type: 'session',
    message: {
      type: 'hub.execution.agent.validate.request',
      requestId: 'req-1',
      provider: 'dsh',
      cwd: '/workspace/app',
      model: 'workspace/scoped-model',
    },
  })
  await bridge.receive({
    type: 'session',
    message: {
      type: 'hub.execution.agent.validate.request',
      requestId: 'req-2',
      provider: 'dsh',
      model: 'workspace/scoped-model',
    },
  })
  await bridge.receive({
    type: 'session',
    message: {
      type: 'hub.execution.agent.validate.request',
      requestId: 'req-3',
      provider: 'dsh',
      cwd: 'relative/path',
    },
  })

  assert.deepEqual(calls.modelCatalog, [[{ cwd: '/workspace/app' }], [], [{ cwd: 'relative/path' }]])
  assert.equal(sent[0].message.type, 'hub.execution.agent.validate.response')
  assert.deepEqual(sent[0].message.payload, { requestId: 'req-1', valid: true, issues: [], error: null })
  assert.equal(sent[1].message.payload.valid, false)
  assert.deepEqual(sent[1].message.payload.issues[0].path, ['model'])
  assert.equal(sent[2].message.payload.valid, false)
  assert.deepEqual(sent[2].message.payload.issues[0].path, ['cwd'])
})

test('interrupt prompt restores archived session, wakes agent, and starts a turn', async () => {
  const run = { key: 'k1', sessionId: 'session-arch', cwd: '/repo', createdAt: '2026-11-24T00:00:00.000Z', archivedAt: '2026-11-24T01:00:00.000Z' }
  const { bridge, sent, calls, runs } = makeHarness({
    runs: [['session-arch', run]],
    archivedSessionIds: ['session-arch'],
  })

  await bridge.receive({
    type: 'session',
    message: {
      type: 'send_agent_message_request',
      requestId: 'req-int',
      messageId: 'msg-int',
      agentId: 'session-arch',
      text: 'Urgent follow-up',
      activeTurnBehavior: 'interrupt',
    },
  })

  assert.deepEqual(calls.unarchive, ['session-arch'])
  assert.deepEqual(calls.resolveAgent, ['session-arch'])
  assert.deepEqual(calls.cancel, [])
  assert.equal(runs.get('session-arch').archivedAt, null)
  assert.equal(calls.prompt.length, 1)
  assert.equal(calls.prompt[0].req.mode, 'queue')
  assert.equal(calls.prompt[0].req.sessionId, 'session-arch')
  const response = sent.find(frame => frame.message.type === 'send_agent_message_response')
  assert.equal(response.message.payload.accepted, true)
  assert.equal(response.message.payload.activeTurnBehavior, 'interrupt')
  assert.equal(response.message.payload.deliveryStatus, 'queued')
})

test('steer prompt to unloaded or idle session wakes and starts a turn via queue mode', async () => {
  const run = { key: 'k2', sessionId: 'session-cold', cwd: '/repo', createdAt: '2026-11-24T00:00:00.000Z', archivedAt: null }
  const { bridge, sent, calls } = makeHarness({
    runs: [['session-cold', run]],
  })

  await bridge.receive({
    type: 'session',
    message: {
      type: 'send_agent_message_request',
      requestId: 'req-steer-cold',
      agentId: 'session-cold',
      text: 'Wake up and check CI',
      activeTurnBehavior: 'steer',
    },
  })

  assert.deepEqual(calls.resolveAgent, ['session-cold'])
  assert.equal(calls.prompt.length, 1)
  assert.equal(calls.prompt[0].req.mode, 'queue')
  const response = sent.find(frame => frame.message.type === 'send_agent_message_response')
  assert.equal(response.message.payload.accepted, true)
  assert.equal(response.message.payload.activeTurnBehavior, 'steer')
})

test('interrupt cancels a running turn before queueing new turn while steer injects next-step', async () => {
  const run = { key: 'k3', sessionId: 'session-run', cwd: '/repo', createdAt: '2026-11-24T00:00:00.000Z', archivedAt: null }
  const liveAgent = { id: 'session-run', status: 'running', session: { header: { cwd: '/repo' } } }
  const { bridge, sent, calls } = makeHarness({
    runs: [['session-run', run]],
    agents: [['session-run', liveAgent]],
  })

  await bridge.receive({
    type: 'session',
    message: {
      type: 'send_agent_message_request',
      requestId: 'req-steer-live',
      agentId: 'session-run',
      text: 'Adjust approach',
      activeTurnBehavior: 'steer',
    },
  })
  assert.deepEqual(calls.cancel, [])
  assert.equal(calls.prompt[0].req.mode, 'steer')

  await bridge.receive({
    type: 'session',
    message: {
      type: 'send_agent_message_request',
      requestId: 'req-int-live',
      agentId: 'session-run',
      text: 'Stop and do X instead',
      activeTurnBehavior: 'interrupt',
    },
  })
  assert.deepEqual(calls.cancel, ['session-run'])
  assert.equal(calls.prompt[1].req.mode, 'queue')
  const responses = sent.filter(frame => frame.message.type === 'send_agent_message_response')
  assert.equal(responses[0].message.payload.activeTurnBehavior, 'steer')
  assert.equal(responses[1].message.payload.activeTurnBehavior, 'interrupt')
})

test('sendMessage rejects unknown activeTurnBehavior and failed session restoration', async () => {
  const run = { key: 'k4', sessionId: 'session-err', cwd: '/repo', createdAt: '2026-11-24T00:00:00.000Z', archivedAt: null }
  const { bridge, sent } = makeHarness({
    runs: [['session-err', run]],
    resolveAgent: async () => ({ error: new Error('session file missing') }),
  })

  await bridge.receive({
    type: 'session',
    message: {
      type: 'send_agent_message_request',
      requestId: 'req-bad-mode',
      agentId: 'session-err',
      text: 'hello',
      activeTurnBehavior: 'invalid-mode',
    },
  })
  await bridge.receive({
    type: 'session',
    message: {
      type: 'send_agent_message_request',
      requestId: 'req-missing',
      agentId: 'session-err',
      text: 'hello',
      activeTurnBehavior: 'interrupt',
    },
  })

  const responses = sent.filter(frame => frame.message.type === 'send_agent_message_response')
  assert.equal(responses[0].message.payload.accepted, false)
  assert.equal(responses[1].message.payload.accepted, false)
  assert.match(responses[1].message.payload.error, /session file missing/)
})
