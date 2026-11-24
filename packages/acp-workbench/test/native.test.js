import assert from 'node:assert/strict'
import { test } from 'node:test'
import { advertisedModels, advertisedModes } from '../lib/models.js'
import { NativeAcp } from '../lib/native.js'

function createHarness() {
  const sessionEvents = []
  let seq = 0
  let currentTurn = 0
  let currentStep = 0
  let stepStartSeq = 0
  let installedExecutor = null
  const baseCalls = []
  const baseExecutor = {
    sections: [{ name: 'base-tools', order: 10, text: 'base' }],
    describe: defs => defs,
    execute: async input => {
      baseCalls.push(input)
      return {
        results: input.calls.map(call => ({ callId: call.id, result: { content: [{ type: 'text', text: 'base-ok' }], isError: false } })),
        additionalContexts: [],
        concluded: false,
      }
    },
  }
  const toolsService = {
    selectExecutor: () => installedExecutor ?? baseExecutor,
    setExecutor: executor => {
      assert.equal(installedExecutor, null)
      installedExecutor = executor
      return () => { installedExecutor = { executor: undefined } }
    },
    execute: input => (installedExecutor ?? baseExecutor).execute(input),
  }
  const listeners = new Map()
  const session = {
    id: 'dsh-1',
    header: { cwd: '/repo', origin: 'user' },
    requestHeader: () => ({ config: { provider: 'acp-claude', model: 'default' } }),
    append: (type, data, extra = {}) => {
      const event = { seq: ++seq, type, data, ...extra }
      sessionEvents.push(event)
      for (const fn of listeners.get('session/event') ?? []) fn(session, event)
      return event
    },
    eventAt: targetSeq => sessionEvents.find(event => event.seq === targetSeq),
    snapshotEvents: fromSeq => sessionEvents.filter(event => event.seq >= fromSeq),
  }
  const agent = {
    id: 'dsh-1',
    status: 'running',
    session,
    model: { current: () => ({ provider: 'acp-claude', model: 'default' }) },
    ctx: { tools: toolsService },
  }
  const ctx = {
    on: (name, fn) => {
      if (!listeners.has(name)) listeners.set(name, new Set())
      listeners.get(name).add(fn)
      return () => listeners.get(name)?.delete(fn)
    },
    get: () => undefined,
    emit: () => {},
    llm: { registerAdapter: () => Object.assign(() => {}, { replace: () => {} }) },
    subagents: {
      registerProvider: () => () => {},
      rootOf: target => target,
      namesOf: () => ({ self: 'main' }),
    },
    agents: {
      get: id => id === agent.id ? agent : null,
      turnBoundaryOf: () => ({ openTurnStartSeq: stepStartSeq, lastTurn: currentTurn, lastStepBoundary: { kind: 'start', seq: stepStartSeq } }),
    },
    attachments: {
      imageLimits: { maxImageBytes: 1024 * 1024 },
      saveImage: async () => ({ id: 'img-1', mediaType: 'image/png' }),
    },
  }

  const acpSessions = new Map()
  const subscribers = new Map()
  const runtimes = new Map()
  const promptCalls = []
  let activePrompt = null
  let nextPrompt = Promise.withResolvers()
  const manager = {
    store: {
      providers: new Map([['claude', { id: 'claude', label: 'Claude Code', models: [] }]]),
      sessions: acpSessions,
      domain: { table: () => ({ get: () => undefined }) },
      saveSession: async () => {},
      flush: async () => {},
    },
    runtimes,
    provider: id => manager.store.providers.get(id),
    session: id => acpSessions.get(id),
    directory: async cwd => cwd,
    overview: s => ({ id: s.id, providerId: s.providerId, cwd: s.cwd, state: s.state }),
    changed: () => {},
    log: () => {},
    create: async ({ providerId, cwd }, nativeIdentity) => {
      const record = {
        id: 'acp-ext-1',
        providerId,
        cwd,
        state: 'idle',
        eventSeq: 0,
        capabilities: { promptCapabilities: { image: true } },
        native: nativeIdentity,
      }
      acpSessions.set(record.id, record)
      return record
    },
    connect: async record => {
      runtimes.set(record.id, { interactions: new Map(), completion: null })
    },
    subscribe: (id, fn) => {
      if (!subscribers.has(id)) subscribers.set(id, new Set())
      subscribers.get(id).add(fn)
      return () => subscribers.get(id)?.delete(fn)
    },
    prompt: async (record, text, options) => {
      promptCalls.push({ text, options })
      const deferred = Promise.withResolvers()
      const rt = runtimes.get(record.id)
      rt.turnId = options.turnId
      rt.completion = deferred.promise
      activePrompt = {
        session: record,
        turnId: options.turnId,
        send: (update, method = 'session/update') => {
          record.eventSeq += 1
          const event = {
            type: 'notification',
            data: {
              replay: false,
              turnId: options.turnId,
              method,
              params: method === 'session/update' ? { update } : update,
            },
          }
          for (const fn of subscribers.get(record.id) ?? []) fn(event)
        },
        interact: (kind, params, id = 'perm-1') => {
          record.eventSeq += 1
          const event = {
            type: 'interaction',
            data: {
              id,
              kind,
              replay: false,
              turnId: options.turnId,
              params,
            },
          }
          for (const fn of subscribers.get(record.id) ?? []) fn(event)
        },
        finish: (stopReason = 'end_turn') => {
          rt.turnId = null
          deferred.resolve({ stopReason })
        },
        fail: error => {
          rt.turnId = null
          deferred.reject(error)
        },
      }
      nextPrompt.resolve(activePrompt)
    },
    cancel: async record => {
      const rt = runtimes.get(record.id)
      if (rt && activePrompt?.session === record) activePrompt.finish('cancelled')
    },
    disconnect: async () => {},
  }

  const native = new NativeAcp(ctx, manager)

  async function runTurn(messages, drive, signal) {
    currentTurn += 1
    currentStep = 0
    activePrompt = null
    nextPrompt = Promise.withResolvers()
    const history = [...messages]
    const lastUser = messages.at(-1)
    let startedDrive = false
    while (true) {
      stepStartSeq = session.append('step/start', { turn: currentTurn, step: currentStep }).seq
      if (currentStep === 0 && lastUser) {
        session.append('user/message', { id: lastUser.id })
      }
      const chunks = []
      const blocks = []
      let finishEvent = null
      const gen = native.stream({ sessionId: agent.id, provider: 'acp-claude', messages: history, signal }, 'default')
      const iter = gen[Symbol.asyncIterator]()
      const stepPromise = (async () => {
        while (true) {
          const next = await iter.next()
          if (next.done) break
          const chunk = next.value
          chunks.push(chunk)
          if (chunk.type === 'block-end') blocks.push(chunk.block)
          if (chunk.type === 'finish') finishEvent = chunk
        }
      })()
      if (!startedDrive) {
        startedDrive = true
        void nextPrompt.promise.then(prompt => drive(prompt))
      }
      await stepPromise
      const message = {
        id: `asst-${currentTurn}-${currentStep}`,
        role: 'assistant',
        content: blocks,
        source: {
          provider: 'acp-claude',
          model: 'default',
          ...(finishEvent?.replayState ? { replayState: finishEvent.replayState } : {}),
        },
      }
      session.append('assistant/message', { turn: currentTurn, step: currentStep, message }, { surfaceOp: 'append' })
      history.push(message)
      const toolCalls = blocks.filter(block => block.type === 'tool-call')
      if (!toolCalls.length) {
        session.append('step/end', { turn: currentTurn, step: currentStep })
        session.append('turn/end', { turn: currentTurn })
        return { history, finishEvent }
      }
      const execResult = await toolsService.execute({
        calls: toolCalls,
        signal: signal ?? new AbortController().signal,
        agent,
        log: { turn: currentTurn, step: currentStep },
      })
      for (const entry of execResult.results) {
        history.push({
          id: `tool-${entry.callId}`,
          role: 'tool',
          source: { kind: 'tool', callId: entry.callId },
          toolCallId: entry.callId,
          content: entry.result.content,
          isError: entry.result.isError,
        })
      }
      session.append('step/end', { turn: currentTurn, step: currentStep })
      if (execResult.concluded) {
        session.append('turn/end', { turn: currentTurn })
        return { history, finishEvent }
      }
      currentStep += 1
    }
  }

  return { native, manager, agent, session, sessionEvents, toolsService, baseCalls, promptCalls, runTurn, ctx }
}

test('streams interleaved reasoning, text, and tools across ordered native steps', async () => {
  const h = createHarness()
  await h.native.initialize()
  const userMessage = { id: 'u1', role: 'user', content: [{ type: 'text', text: 'Fix the bug' }] }

  await h.runTurn([userMessage], async p => {
    p.send({ sessionUpdate: 'agent_thought_chunk', content: { type: 'text', text: 'First read file.' } })
    p.send({ sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'Inspecting app.js' } })
    p.send({ sessionUpdate: 'tool_call', toolCallId: 't1', kind: 'read', name: 'Read', status: 'pending', rawInput: {} })
    await new Promise(resolve => setTimeout(resolve, 15))
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 't1',
      status: 'completed',
      rawInput: { file_path: '/repo/app.js' },
      content: [{ type: 'content', content: { type: 'text', text: '1\tconst x = 1' } }],
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    p.send({ sessionUpdate: 'agent_thought_chunk', content: { type: 'text', text: 'Now edit and test.' } })
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 't2',
      kind: 'edit',
      name: 'Edit',
      status: 'in_progress',
      rawInput: { file_path: '/repo/app.js', old_string: '1', new_string: '2' },
    })
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 't3',
      kind: 'execute',
      name: 'Bash',
      status: 'in_progress',
      rawInput: { command: 'pnpm test', description: 'Run tests' },
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 't2',
      status: 'completed',
      content: [{ type: 'diff', path: '/repo/app.js', oldText: '1', newText: '2' }],
    })
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 't3',
      status: 'completed',
      rawOutput: { stdout: 'ok', exitCode: 0 },
    })
    await new Promise(resolve => setTimeout(resolve, 20))
    p.send({ sessionUpdate: 'agent_thought_chunk', content: { type: 'text', text: 'Done!' } })
    p.send({ sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'Fixed app.js and tests pass.' } })
    p.finish('end_turn')
  })

  const timeline = h.sessionEvents
    .filter(event => ['assistant/message', 'tool/call', 'tool/result'].includes(event.type))
    .map(event => {
      if (event.type === 'assistant/message') {
        return {
          type: event.type,
          step: event.data.step,
          blocks: event.data.message.content.map(b => b.type === 'tool-call' ? `${b.type}:${b.name}` : `${b.type}:${b.text}`),
          version: event.data.message.source.replayState.response.acp.version,
        }
      }
      if (event.type === 'tool/call') return { type: event.type, step: event.data.step, name: event.data.name }
      return { type: event.type, step: event.data.step, isError: event.data.message.isError, hasMeta: Boolean(event.data.meta) }
    })

  assert.deepEqual(timeline, [
    { type: 'assistant/message', step: 0, blocks: ['reasoning:First read file.', 'text:Inspecting app.js', 'tool-call:read'], version: 2 },
    { type: 'tool/call', step: 0, name: 'read' },
    { type: 'tool/result', step: 0, isError: false, hasMeta: true },
    { type: 'assistant/message', step: 1, blocks: ['reasoning:Now edit and test.', 'tool-call:edit', 'tool-call:bash'], version: 2 },
    { type: 'tool/call', step: 1, name: 'edit' },
    { type: 'tool/call', step: 1, name: 'bash' },
    { type: 'tool/result', step: 1, isError: false, hasMeta: true },
    { type: 'tool/result', step: 1, isError: false, hasMeta: true },
    { type: 'assistant/message', step: 2, blocks: ['reasoning:Done!', 'text:Fixed app.js and tests pass.'], version: 2 },
  ])

  const acpSession = h.manager.store.sessions.get('acp-ext-1')
  assert.equal(acpSession.native.runs[0].nativeVersion, 2)
  assert.equal(acpSession.native.runs[0].lastStep, 2)
  assert.equal(acpSession.native.runs[0].state, 'completed')

  await h.toolsService.execute({
    calls: [{ id: 'native-call-1', name: 'bash', arguments: '{"command":"ls"}' }],
    signal: new AbortController().signal,
    agent: h.agent,
  })
  assert.equal(h.baseCalls.length, 1)
  await h.native.close()
})

test('maps nested subcalls to ptc-dispatch events and plans to todo_write', async () => {
  const h = createHarness()
  await h.native.initialize()
  const userMessage = { id: 'u1', role: 'user', content: [{ type: 'text', text: 'Plan and inspect' }] }

  await h.runTurn([userMessage], async p => {
    p.send({
      sessionUpdate: 'plan',
      entries: [
        { content: 'Check repo', status: 'in_progress' },
        { content: 'Write fix', status: 'pending' },
      ],
    })
    p.send({
      sessionUpdate: 'plan',
      entries: [
        { content: 'Check repo', status: 'in_progress' },
        { content: 'Write fix', status: 'pending' },
      ],
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 'parent-1',
      kind: 'other',
      name: 'Agent',
      status: 'in_progress',
      rawInput: { description: 'Inspect codebase' },
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 'child-1',
      kind: 'read',
      name: 'Read',
      status: 'in_progress',
      rawInput: { file_path: '/repo/README.md' },
      _meta: { claudeCode: { parentToolUseId: 'parent-1' } },
    })
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 'child-1',
      status: 'completed',
      content: [{ type: 'content', content: { type: 'text', text: '1\t# Hello' } }],
      _meta: { claudeCode: { parentToolUseId: 'parent-1' } },
    })
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 'parent-1',
      status: 'completed',
      content: [{ type: 'content', content: { type: 'text', text: 'Subagent finished' } }],
    })
    p.finish('end_turn')
  })

  const todoEvents = h.sessionEvents.filter(event => event.type === 'todo/write')
  assert.equal(todoEvents.length, 1)
  assert.deepEqual(todoEvents[0].data.todos, [
    { content: 'Check repo', status: 'in_progress' },
    { content: 'Write fix', status: 'pending' },
  ])

  const ptcStarts = h.sessionEvents.filter(event => event.type === 'tool/ptc-dispatch-start')
  const ptcEnds = h.sessionEvents.filter(event => event.type === 'tool/ptc-dispatch')
  assert.equal(ptcStarts.length, 1)
  assert.equal(ptcEnds.length, 1)
  assert.equal(ptcStarts[0].data.name, 'read')
  assert.equal(ptcEnds[0].data.parentCallId, ptcStarts[0].data.parentCallId)
  assert.equal(ptcEnds[0].data.isError, false)

  const assistantSteps = h.sessionEvents.filter(event => event.type === 'assistant/message')
  assert.equal(assistantSteps.length, 2)
  await h.native.close()
})

test('turn 2 handoff skips owned assistant and tool messages from turn 1', async () => {
  const h = createHarness()
  await h.native.initialize()
  const u1 = { id: 'u1', role: 'user', content: [{ type: 'text', text: 'Run check' }] }
  const turn1 = await h.runTurn([u1], async p => {
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 't1',
      kind: 'execute',
      name: 'Bash',
      status: 'completed',
      rawInput: { command: 'echo hi', description: 'Echo' },
      rawOutput: { stdout: 'hi', exitCode: 0 },
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    p.send({ sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'Done running check.' } })
    p.finish('end_turn')
  })

  const u2 = { id: 'u2', role: 'user', content: [{ type: 'text', text: 'Now summarize' }] }
  await h.runTurn([...turn1.history, u2], async p => {
    p.send({ sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'Summary.' } })
    p.finish('end_turn')
  })

  assert.equal(h.promptCalls.length, 2)
  assert.equal(h.promptCalls[1].text, 'Now summarize')
  await h.native.close()
})

test('settles stale unclosed tool call when top-level output resumes', async () => {
  const h = createHarness()
  await h.native.initialize()
  const u1 = { id: 'u1', role: 'user', content: [{ type: 'text', text: 'Run' }] }

  await h.runTurn([u1], async p => {
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 'stale-1',
      kind: 'read',
      name: 'Read',
      status: 'in_progress',
      rawInput: { file_path: '/repo/missing.js' },
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    p.send({ sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'Continuing anyway.' } })
    await new Promise(resolve => setTimeout(resolve, 260))
    p.finish('end_turn')
  })

  const results = h.sessionEvents.filter(event => event.type === 'tool/result')
  assert.equal(results.length, 1)
  const messages = h.sessionEvents.filter(event => event.type === 'assistant/message')
  assert.equal(messages.length, 2)
  assert.equal(messages[1].data.message.content[0].text, 'Continuing anyway.')
  await h.native.close()
})

function cursorCatalogFixture() {
  return {
    models: [
      { value: 'default', name: 'Auto', configOptions: [] },
      {
        value: 'claude-opus-5',
        name: 'Claude 5 Opus',
        configOptions: [
          {
            id: 'thinking', name: 'Thinking', category: 'thought_level', type: 'select', currentValue: 'true',
            options: [{ value: 'false', name: 'Off' }, { value: 'true', name: 'On' }],
          },
          {
            id: 'effort', name: 'Effort', category: 'thought_level', type: 'select', currentValue: 'high',
            options: [{ value: 'low', name: 'Low' }, { value: 'high', name: 'High' }, { value: 'max', name: 'Max' }],
          },
          {
            id: 'context', name: 'Context', category: 'model_config', type: 'select', currentValue: '300k',
            options: [{ value: '300k', name: '300K' }, { value: '1m', name: '1M' }],
          },
          {
            id: 'fast', name: 'Fast\u200B\u200B', category: 'model_config', type: 'select', currentValue: 'false',
            options: [{ value: 'false', name: 'Off' }, { value: 'true', name: 'On' }],
          },
        ],
      },
      {
        value: 'composer-2',
        name: 'Composer 2',
        configOptions: [],
      },
    ],
  }
}

test('listModels auto-shows advertised models, honors hiddenModels, and resolves legacy bracketed IDs', async () => {
  const h = createHarness()
  const advertised = advertisedModels(null, { promptCapabilities: { image: true } }, cursorCatalogFixture())
  h.manager.store.providers.set('cursor', {
    id: 'cursor',
    label: 'Cursor CLI',
    models: [],
    hiddenModels: ['composer-2'],
    advertised: { models: advertised },
  })
  await h.native.initialize()

  const listed = await h.native.listModels('acp-cursor')
  assert.deepEqual(listed.map(item => item.id), ['default', 'auto', 'claude-opus-5'])

  const opus = listed.find(item => item.id === 'claude-opus-5')
  assert.equal(opus.context?.contextWindow, 300_000)
  assert.equal(opus.badge?.text, 'ACP · 300K/1M · Fast · image')
  assert.deepEqual(opus.reasoning?.efforts.map(item => item.id), ['off', 'low', 'high', 'max'])

  const hiddenResolved = await h.native.resolveModel('acp-cursor', 'composer-2')
  assert.equal(hiddenResolved.id, 'composer-2')

  const legacyResolved = await h.native.resolveModel('acp-cursor', 'claude-opus-5[thinking=true,context=1m,effort=max,fast=true]')
  assert.equal(legacyResolved.id, 'claude-opus-5[thinking=true,context=1m,effort=max,fast=true]')
  assert.equal(legacyResolved.name, 'Claude 5 Opus')
  await h.native.close()
})

test('setOption stores draft preferences before connecting and applyModel sends mode, model, thinking+effort, fast, and context in order', async () => {
  const h = createHarness()
  const catalog = cursorCatalogFixture()
  const advertised = advertisedModels(null, { promptCapabilities: { image: true } }, catalog)
  const modes = advertisedModes({
    configOptions: [{
      id: 'mode', category: 'mode', type: 'select', currentValue: 'agent',
      options: [{ value: 'agent', name: 'Agent' }, { value: 'plan', name: 'Plan' }, { value: 'ask', name: 'Ask' }],
    }],
  })
  h.manager.store.providers.set('cursor', {
    id: 'cursor',
    label: 'Cursor CLI',
    models: [],
    hiddenModels: [],
    advertised: { models: advertised, modes },
  })
  h.agent.status = 'idle'
  h.agent.model = { current: () => ({ provider: 'acp-cursor', model: 'claude-opus-5' }) }

  const calls = []
  const sessionByModel = {
    default: [],
    'claude-opus-5': structuredClone(catalog.models[1].configOptions),
    'composer-2': [],
  }
  const acpSession = {
    id: 'acp-ext-cursor',
    providerId: 'cursor',
    cwd: '/repo',
    state: 'idle',
    models: { currentModelId: 'default' },
    configOptions: [
      {
        id: 'mode', category: 'mode', type: 'select', currentValue: 'agent',
        options: [{ value: 'agent', name: 'Agent' }, { value: 'plan', name: 'Plan' }, { value: 'ask', name: 'Ask' }],
      },
      {
        id: 'model', category: 'model', type: 'select', currentValue: 'default',
        options: [{ value: 'default', name: 'Auto' }, { value: 'claude-opus-5', name: 'Claude 5 Opus' }, { value: 'composer-2', name: 'Composer 2' }],
      },
    ],
    native: { sessionId: 'dsh-1', route: 'acp-cursor', runs: [] },
  }
  h.manager.configure = async (target, op) => {
    calls.push(op)
    if (op.configId === 'model') {
      const modeOpt = target.configOptions.find(item => item.id === 'mode')
      const modelOpt = target.configOptions.find(item => item.id === 'model')
      modelOpt.currentValue = op.value
      target.models.currentModelId = op.value
      target.configOptions = [modeOpt, modelOpt, ...structuredClone(sessionByModel[op.value] ?? [])]
      return target
    }
    const opt = target.configOptions.find(item => item.id === op.configId)
    if (opt) opt.currentValue = op.value
    return target
  }

  await h.native.initialize()

  const snap1 = await h.native.setOption({ dshSessionId: 'dsh-1', route: 'acp-cursor', modeId: 'plan' })
  assert.equal(snap1.controls.mode, 'plan')
  const snap2 = await h.native.setOption({ dshSessionId: 'dsh-1', route: 'acp-cursor', configId: 'fast', value: 'true' })
  assert.equal(snap2.controls.values.fast, 'true')
  const snap3 = await h.native.setOption({ dshSessionId: 'dsh-1', route: 'acp-cursor', configId: 'context', value: '1m' })
  assert.equal(snap3.controls.values.context, '1m')
  assert.equal(snap3.controls.connected, false)

  const identity = h.native.bindingIdentity(h.agent, 'acp-cursor')
  assert.deepEqual(identity.preferences, { mode: 'plan', options: { fast: 'true', context: '1m' } })

  await h.native.applyModel(acpSession, 'claude-opus-5', 'max')
  assert.deepEqual(calls, [
    { configId: 'mode', value: 'plan' },
    { configId: 'model', value: 'claude-opus-5' },
    { configId: 'effort', value: 'max' },
    { configId: 'fast', value: 'true' },
    { configId: 'context', value: '1m' },
  ])

  calls.length = 0
  await h.native.applyModel(acpSession, 'claude-opus-5', 'off')
  assert.deepEqual(calls, [{ configId: 'thinking', value: 'false' }])

  calls.length = 0
  await h.native.applyModel(acpSession, 'claude-opus-5', 'low')
  assert.deepEqual(calls, [
    { configId: 'thinking', value: 'true' },
    { configId: 'effort', value: 'low' },
  ])

  calls.length = 0
  await h.native.applyModel(acpSession, 'composer-2', undefined)
  assert.deepEqual(calls, [{ configId: 'model', value: 'composer-2' }])

  await h.native.close()
})

test('DSH full-access preset does not auto-approve ACP permission requests', async () => {
  const h = createHarness()
  h.ctx.get = key => key === 'permissionPresets'
    ? { current: () => 'danger-full-access', resolve: () => ({ sandbox: 'danger-full-access', approval: 'never' }) }
    : undefined
  await h.native.initialize()

  assert.equal(h.native.autoApprove, undefined)
  assert.equal('fullAccess' in h.native.snapshot('dsh-1'), false)

  await h.native.close()
})

test('renders markdown plan_update documents in native stream', async () => {
  const h = createHarness()
  await h.native.initialize()
  const userMessage = { id: 'u1', role: 'user', content: [{ type: 'text', text: 'Draft plan' }] }

  await h.runTurn([userMessage], async p => {
    p.send({
      sessionUpdate: 'plan_update',
      plan: {
        planId: 'plan-1',
        type: 'markdown',
        path: '.claude/plans/fix.md',
        content: '# Fix Plan\n\n1. Update parser\n2. Add tests',
      },
    })
    p.finish('end_turn')
  })

  const messages = h.sessionEvents.filter(event => event.type === 'assistant/message')
  assert.equal(messages.length, 1)
  const text = messages[0].data.message.content.map(b => b.text).join('')
  assert.match(text, /\*\*Plan\*\* \(`\.claude\/plans\/fix\.md`\)/u)
  assert.match(text, /# Fix Plan/u)
  await h.native.close()
})

test('coerces boolean and on/off select options, builds initialConfigOptions, and supports active-turn steering', async () => {
  const h = createHarness()
  const claudeAdapter = { id: 'claude-code', mapDefaultToAuto: false }
  const advertised = advertisedModels(null, { promptCapabilities: { image: true } }, {
    models: [
      {
        value: 'opus',
        name: 'Opus 5.5',
        configOptions: [
          { id: 'effort', category: 'thought_level', type: 'select', currentValue: 'high', options: [{ value: 'low', name: 'Low' }, { value: 'high', name: 'High' }] },
          { id: 'fast', name: 'Fast', category: 'model_config', type: 'boolean', currentValue: false },
          { id: 'ultracode', name: 'Ultracode', category: 'model_config', type: 'boolean', currentValue: false },
        ],
      },
    ],
  }, claudeAdapter)
  h.manager.store.providers.set('claude', {
    id: 'claude',
    label: 'Claude Code',
    models: [],
    advertised: {
      models: advertised,
      modes: { configId: 'mode', currentModeId: 'default', options: [{ value: 'default', name: 'Default' }, { value: 'plan', name: 'Plan' }] },
    },
  })
  h.agent.status = 'idle'
  h.agent.model = { current: () => ({ provider: 'acp-claude', model: 'opus' }) }

  const calls = []
  h.manager.configure = async (target, op) => {
    calls.push(op)
    const opt = target.configOptions.find(item => item.id === op.configId)
    if (opt) opt.currentValue = op.value
    return target
  }
  const steered = []
  h.manager.steer = async (session, text) => {
    steered.push({ id: session.id, text })
    return { steered: true }
  }

  await h.native.initialize()
  await h.native.setOption({ dshSessionId: 'dsh-1', route: 'acp-claude', modeId: 'plan' })
  await h.native.setOption({ dshSessionId: 'dsh-1', route: 'acp-claude', configId: 'fast', value: true })
  await h.native.setOption({ dshSessionId: 'dsh-1', route: 'acp-claude', configId: 'ultracode', value: 'on' })

  const acpSession = {
    id: 'acp-ext-claude',
    providerId: 'claude',
    cwd: '/repo',
    state: 'running',
    agentMeta: { steering: true },
    configOptions: [
      { id: 'mode', category: 'mode', type: 'select', currentValue: 'default', options: [{ value: 'default', name: 'Default' }, { value: 'plan', name: 'Plan' }] },
      { id: 'model', category: 'model', type: 'select', currentValue: 'opus', options: [{ value: 'opus', name: 'Opus 5.5' }] },
      { id: 'fast', category: 'model_config', type: 'select', currentValue: 'off', options: [{ value: 'off', name: 'Off' }, { value: 'on', name: 'On' }] },
      { id: 'ultracode', category: 'model_config', type: 'boolean', currentValue: false },
    ],
    native: { sessionId: 'dsh-1', route: 'acp-claude', runs: [] },
  }
  h.manager.store.sessions.set(acpSession.id, acpSession)
  h.manager.runtimes.set(acpSession.id, { turnId: 'turn-1', closing: false, canceling: false, interactions: new Map() })

  const initial = h.native.initialConfigOptionsFor(acpSession, 'opus', 'low')
  assert.deepEqual(initial, [
    { configId: 'model', value: 'opus' },
    { configId: 'effort', value: 'low' },
    { configId: 'mode', value: 'plan' },
    { configId: 'fast', value: true },
    { configId: 'ultracode', value: true },
  ])

  await h.native.applyModel(acpSession, 'opus', undefined)
  assert.deepEqual(calls, [
    { configId: 'mode', value: 'plan' },
    { configId: 'fast', value: 'on' },
    { configId: 'ultracode', value: true },
  ])

  const snap = h.native.snapshot('dsh-1')
  assert.equal(snap.controls.canSteer, true)

  await h.native.steer('dsh-1', 'Focus on parser.js only')
  assert.deepEqual(steered, [{ id: 'acp-ext-claude', text: 'Focus on parser.js only' }])

  await h.native.close()
})

test('waits for Claude Code Bash rawInput past terminal placeholder, parallel launch, and permission prompt', async () => {
  const h = createHarness()
  await h.native.initialize()
  const u1 = { id: 'u1', role: 'user', content: [{ type: 'text', text: 'Check repo' }] }

  await h.runTurn([u1], async p => {
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 'bash-1',
      title: 'Terminal',
      kind: 'execute',
      status: 'pending',
      rawInput: {},
      content: [{ type: 'terminal', terminalId: 'bash-1' }],
      _meta: { claudeCode: { toolName: 'Bash' }, terminal_info: { terminal_id: 'bash-1', cwd: '/repo' } },
    })
    p.send({
      sessionUpdate: 'tool_call',
      toolCallId: 'bash-2',
      title: 'Terminal',
      kind: 'execute',
      status: 'pending',
      rawInput: {},
      content: [{ type: 'terminal', terminalId: 'bash-2' }],
      _meta: { claudeCode: { toolName: 'Bash' }, terminal_info: { terminal_id: 'bash-2', cwd: '/repo' } },
    })
    await new Promise(resolve => setTimeout(resolve, 350))
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 'bash-1',
      title: '`git status`',
      status: 'in_progress',
      rawInput: { command: 'git status', description: 'Check git status' },
    })
    p.interact('permission', {
      toolCall: {
        toolCallId: 'bash-2',
        title: '`pnpm test`',
        kind: 'execute',
        rawInput: { command: 'pnpm test', description: 'Run tests' },
      },
      options: [],
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 'bash-1',
      status: 'completed',
      rawInput: {},
      _meta: { terminal_output: { terminal_id: 'bash-1', data: 'clean\n' }, terminal_exit: { terminal_id: 'bash-1', exit_code: 0 } },
    })
    p.send({
      sessionUpdate: 'tool_call_update',
      toolCallId: 'bash-2',
      status: 'completed',
      rawInput: {},
      _meta: { terminal_output: { terminal_id: 'bash-2', data: 'pass\n' }, terminal_exit: { terminal_id: 'bash-2', exit_code: 0 } },
    })
    await new Promise(resolve => setTimeout(resolve, 20))
    p.finish('end_turn')
  })

  const calls = h.sessionEvents
    .filter(event => event.type === 'tool/call')
    .map(event => ({ name: event.data.name, args: JSON.parse(event.data.arguments) }))

  assert.deepEqual(calls, [
    { name: 'bash', args: { command: 'git status', description: 'Check git status', workdir: '/repo' } },
    { name: 'bash', args: { command: 'pnpm test', description: 'Run tests', workdir: '/repo' } },
  ])
  await h.native.close()
})

