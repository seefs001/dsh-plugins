import assert from 'node:assert/strict'
import test from 'node:test'
import { DelegationHub } from '../lib/delegation.js'

function createHarness() {
  const activations = []
  const savedPreferences = []
  const agents = new Map()
  const rootAgent = {
    id: 'root-session',
    status: 'running',
    model: { current: () => ({ provider: 'acp-antigravity', model: 'gemini-4-neon' }) },
  }
  agents.set(rootAgent.id, rootAgent)

  const descendants = [
    {
      kind: 'child',
      id: 'child-1',
      parentId: 'root-session',
      depth: 1,
      path: 'worker-a',
      name: 'worker-a',
      mode: 'continuable',
      label: 'Worker A task',
      activity: 'running',
      hasChildren: true,
    },
    {
      kind: 'child',
      id: 'child-2',
      parentId: 'child-1',
      depth: 2,
      name: 'helper',
      mode: 'continuable',
      label: 'Nested helper',
      activity: 'inactive',
      hasChildren: false,
    },
    {
      kind: 'diagnostic',
      id: 'child-bad',
      parentId: 'root-session',
      depth: 1,
      reason: 'unavailable',
    },
  ]

  const ctx = {
    agents: { get: id => agents.get(id) },
    subagents: {
      getProvider: name => (name === 'spawn' ? { name: 'spawn' } : undefined),
      resolveMaxDepth: () => 2,
      rootOf: () => rootAgent,
      namesOf: () => ({ self: 'lead', parent: undefined }),
      capacityOf: () => ({ running: 1, limit: 8 }),
      listDescendants: async () => descendants,
      startActivation: async spec => {
        activations.push(spec)
        return { name: spec.name ?? 'worker', childId: spec.childId }
      },
    },
  }

  const manager = {
    store: {
      providers: new Map([
        ['antigravity', { id: 'antigravity', label: 'Antigravity', advertised: {} }],
      ]),
    },
    runtimes: new Map(),
  }

  const native = {
    ctx,
    manager,
    cwd: () => '/tmp/workspace',
    route: id => `acp-${id}`,
    sessions: () => [],
    savePreferences: async (...args) => {
      savedPreferences.push(args)
    },
  }

  const hub = new DelegationHub(native, route => typeof route === 'string' && route.startsWith('acp-'))
  return { hub, rootAgent, activations, savedPreferences, agents }
}

test('spawnAgent wraps prompt as ContentBlock[] for ctx.subagents.startActivation', async () => {
  const { hub, rootAgent, activations, savedPreferences } = createHarness()
  const result = await hub.spawnAgent(rootAgent, {
    provider: 'acp-antigravity',
    model: 'gemini-4-neon',
    reasoningEffort: 'high',
    modeId: 'auto',
    name: 'worker-a',
    prompt: 'Inspect the repository and run tests',
  }, new AbortController().signal)

  assert.equal(result.agent, 'worker-a')
  assert.equal(activations.length, 1)
  assert.deepEqual(activations[0].prompt, [
    { type: 'text', text: 'Inspect the repository and run tests' },
  ])
  assert.equal(savedPreferences.length, 1)
  assert.deepEqual(savedPreferences[0][2], { mode: 'auto', options: {} })
})

test('listAgents reads flat SubagentDescendantListEntry rows and skips diagnostics', async () => {
  const { hub, rootAgent, agents } = createHarness()
  agents.set('child-1', {
    id: 'child-1',
    status: 'running',
    model: { current: () => ({ provider: 'acp-antigravity', model: 'gemini-4-neon' }) },
  })

  const result = await hub.listAgents(rootAgent, new AbortController().signal)
  assert.equal(result.self, 'lead')
  assert.equal(result.agents.length, 3)
  assert.equal(result.agents[0].name, 'lead')
  assert.equal(result.agents[1].name, 'worker-a')
  assert.equal(result.agents[1].parent, 'lead')
  assert.equal(result.agents[1].label, 'Worker A task')
  assert.equal(result.agents[2].name, 'worker-a/helper')
  assert.equal(result.agents[2].parent, 'worker-a')
  assert.equal(result.agents[2].label, 'Nested helper')
})
