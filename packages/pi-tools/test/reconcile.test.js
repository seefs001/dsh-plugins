import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  INTERNAL_PREFIX,
  canonicalJson,
  internalAliasOf,
  reconcileBridges,
  reconcileOwnTools,
  toolSignature,
} from '../lib/reconcile.js'

function makeTool(name, overrides = {}) {
  const version = overrides.version ?? 1
  const render = overrides.render ?? ((_args, value) => [{ type: 'text', text: `${name}:v${version}:${value}` }])
  const output = overrides.output ?? {
    schema: overrides.outputSchema ?? { type: 'string' },
    render,
    ...(overrides.presentationMeta ? { presentationMeta: overrides.presentationMeta } : {}),
  }
  return {
    name,
    description: overrides.description ?? `Tool ${name}`,
    parameters: overrides.parameters ?? { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    output,
    ...(overrides.timeoutMs !== undefined ? { timeoutMs: overrides.timeoutMs } : {}),
    ...(overrides.constrainedSampling !== undefined ? { constrainedSampling: overrides.constrainedSampling } : {}),
    ...(overrides.projectContent ? { projectContent: overrides.projectContent } : {}),
    ...(overrides.finalizeContent ? { finalizeContent: overrides.finalizeContent } : {}),
    ...(overrides.isConcurrencySafe ? { isConcurrencySafe: overrides.isConcurrencySafe } : {}),
    ...(overrides.presentCall ? { presentCall: overrides.presentCall } : {}),
    ...(overrides.presentResult ? { presentResult: overrides.presentResult } : {}),
    execute: overrides.execute ?? (async args => ({ tool: name, version, args })),
  }
}

function createStrictToolRegistry({ preExisting = [], onChange } = {}) {
  const registered = new Map()
  const events = []
  for (const name of preExisting) registered.set(name, { external: true })
  return {
    registered,
    events,
    register(definition, options = {}) {
      if (registered.has(definition.name)) {
        throw new Error(`tool "${definition.name}" is already registered in this scope`)
      }
      registered.set(definition.name, { definition, options })
      events.push({ type: 'register', name: definition.name })
      onChange?.('register', definition.name)
      let disposed = false
      return () => {
        if (disposed) return
        disposed = true
        registered.delete(definition.name)
        events.push({ type: 'dispose', name: definition.name })
        onChange?.('dispose', definition.name)
      }
    },
  }
}

test('canonicalJson and toolSignature ignore key order and detect every manifest field change', () => {
  assert.equal(
    canonicalJson({ b: 2, a: { y: 1, x: [1, 2] } }),
    canonicalJson({ a: { x: [1, 2], y: 1 }, b: 2 }),
  )
  assert.notEqual(canonicalJson([1, 2]), canonicalJson([2, 1]))

  const base = makeTool('mcp__srv__list', {
    parameters: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'number' } } },
    outputSchema: { type: 'object', properties: { ok: { type: 'boolean' }, count: { type: 'number' } } },
    timeoutMs: 5000,
    projectContent: () => undefined,
  })
  const reordered = makeTool('mcp__srv__list', {
    parameters: { properties: { b: { type: 'number' }, a: { type: 'string' } }, type: 'object' },
    outputSchema: { properties: { count: { type: 'number' }, ok: { type: 'boolean' } }, type: 'object' },
    timeoutMs: 5000,
    projectContent: () => undefined,
  })
  assert.equal(toolSignature(base), toolSignature(reordered))

  assert.notEqual(toolSignature(base), toolSignature(makeTool('mcp__srv__list', { description: 'Updated' })))
  assert.notEqual(toolSignature(base), toolSignature({ ...base, timeoutMs: 9000 }))
  assert.notEqual(toolSignature(base), toolSignature({ ...base, constrainedSampling: { type: 'regex', pattern: '.*' } }))
  assert.notEqual(toolSignature(base), toolSignature({ ...base, output: { ...base.output, schema: { type: 'number' } } }))
  assert.notEqual(toolSignature(base), toolSignature({ ...base, output: { ...base.output, presentationMeta: () => ({}) } }))
  assert.notEqual(toolSignature(base), toolSignature({ ...base, projectContent: undefined }))
  assert.notEqual(toolSignature(base), toolSignature({ ...base, isConcurrencySafe: () => true }))
  assert.notEqual(toolSignature(base, { passthrough: false }), toolSignature(base, { passthrough: true }))
  assert.notEqual(toolSignature(base, { sourceScope: undefined }), toolSignature(base, { sourceScope: {} }))
})

test('reconcileBridges keeps unchanged tools intact and refreshes live delegation on identical-manifest reconnect', async () => {
  const registry = createStrictToolRegistry()
  const bridges = new Map()
  const internal = new Map()
  const createExecute = (_name, record) => async (input, exec) => record.original.execute(input, exec)
  const opts = {
    registerDirect: direct => registry.register(direct),
    registerInternal: nested => registry.register(nested),
    createExecute,
  }

  const toolV1 = makeTool('mcp__srv__fetch', {
    version: 1,
    projectContent: () => [{ type: 'text', text: 'projected-v1' }],
    isConcurrencySafe: () => true,
  })
  const first = reconcileBridges(bridges, internal, new Map([
    ['mcp__srv__fetch', { original: toolV1, passthrough: false }],
  ]), opts)
  assert.deepEqual(first.added, ['mcp__srv__fetch'])
  assert.equal(first.mutated, true)
  const alias = internalAliasOf('mcp__srv__fetch')
  assert.equal(internal.get(alias), 'mcp__srv__fetch')
  assert.ok(alias.startsWith(INTERNAL_PREFIX))

  registry.events.length = 0
  const toolV2SameManifest = makeTool('mcp__srv__fetch', {
    version: 2,
    parameters: { required: ['query'], properties: { query: { type: 'string' } }, type: 'object' },
    projectContent: () => [{ type: 'text', text: 'projected-v2' }],
    isConcurrencySafe: () => false,
  })
  const second = reconcileBridges(bridges, internal, new Map([
    ['mcp__srv__fetch', { original: toolV2SameManifest, passthrough: false }],
  ]), opts)
  assert.deepEqual(second.kept, ['mcp__srv__fetch'])
  assert.deepEqual(second.added, [])
  assert.deepEqual(second.updated, [])
  assert.deepEqual(second.removed, [])
  assert.equal(second.mutated, false)
  assert.deepEqual(registry.events, [])

  const registeredDirect = registry.registered.get('mcp__srv__fetch').definition
  const execResult = await registeredDirect.execute({ query: 'hi' }, {})
  assert.equal(execResult.version, 2)
  assert.deepEqual(registeredDirect.output.render({}, 'ok'), [{ type: 'text', text: 'mcp__srv__fetch:v2:ok' }])
  assert.deepEqual(registeredDirect.projectContent({}, {}), [{ type: 'text', text: 'projected-v2' }])
  assert.equal(registeredDirect.isConcurrencySafe({}), false)
})

test('reconcileBridges disposes before re-registering on manifest changes (including in-place mutation) and removes deleted tools', () => {
  const registry = createStrictToolRegistry()
  const bridges = new Map()
  const internal = new Map()
  const releasedScoped = []
  const opts = {
    registerDirect: direct => registry.register(direct),
    registerInternal: nested => registry.register(nested),
    releaseScopedBindings: name => releasedScoped.push(name),
    createExecute: (_name, record) => async (input, exec) => record.original.execute(input, exec),
  }

  const unchanged = makeTool('mcp__srv__keep')
  const changing = makeTool('mcp__srv__edit', { description: 'Before' })
  const deleting = makeTool('mcp__srv__drop')
  const scoped = makeTool('web_fetch', { description: 'Scoped v1' })
  const scope = { id: 'preset-pi' }

  reconcileBridges(bridges, internal, new Map([
    ['mcp__srv__keep', { original: unchanged, passthrough: false }],
    ['mcp__srv__edit', { original: changing, passthrough: false }],
    ['mcp__srv__drop', { original: deleting, passthrough: false }],
    ['web_fetch', { original: scoped, sourceScope: scope, passthrough: true }],
  ]), opts)

  registry.events.length = 0
  changing.description = 'After in-place mutation'
  const scopedV2 = makeTool('web_fetch', { description: 'Scoped v2' })
  const added = makeTool('mcp__srv__new')

  const result = reconcileBridges(bridges, internal, new Map([
    ['mcp__srv__keep', { original: unchanged, passthrough: false }],
    ['mcp__srv__edit', { original: changing, passthrough: false }],
    ['mcp__srv__new', { original: added, passthrough: false }],
    ['web_fetch', { original: scopedV2, sourceScope: scope, passthrough: true }],
  ]), opts)

  assert.deepEqual(result.kept, ['mcp__srv__keep'])
  assert.deepEqual(result.updated, ['mcp__srv__edit', 'web_fetch'])
  assert.deepEqual(result.added, ['mcp__srv__new'])
  assert.deepEqual(result.removed, ['mcp__srv__drop'])
  assert.deepEqual(releasedScoped, ['web_fetch'])
  assert.equal(bridges.has('mcp__srv__drop'), false)
  assert.equal(internal.has(internalAliasOf('mcp__srv__drop')), false)
  assert.equal(registry.registered.get('mcp__srv__edit').definition.description, 'After in-place mutation')

  const editEvents = registry.events.filter(e => e.name === 'mcp__srv__edit' || e.name === internalAliasOf('mcp__srv__edit'))
  assert.deepEqual(editEvents.map(e => `${e.type}:${e.name === 'mcp__srv__edit' ? 'direct' : 'internal'}`), [
    'dispose:direct',
    'dispose:internal',
    'register:internal',
    'register:direct',
  ])
  assert.equal(registry.events.some(e => e.name === 'mcp__srv__keep'), false)
})

test('reconcileBridges rolls back partial alias registration on conflict and recovers once conflict clears', () => {
  const registry = createStrictToolRegistry({ preExisting: ['mcp__srv__conflict'] })
  const bridges = new Map()
  const internal = new Map()
  const warnings = []
  const opts = {
    registerDirect: direct => registry.register(direct),
    registerInternal: nested => registry.register(nested),
    createExecute: (_name, record) => async (input, exec) => record.original.execute(input, exec),
    logger: { warn: msg => warnings.push(msg) },
  }

  const conflicting = makeTool('mcp__srv__conflict')
  const healthy = makeTool('mcp__srv__ok')
  const first = reconcileBridges(bridges, internal, new Map([
    ['mcp__srv__conflict', { original: conflicting, passthrough: false }],
    ['mcp__srv__ok', { original: healthy, passthrough: false }],
  ]), opts)

  assert.equal(first.failed.length, 1)
  assert.equal(first.failed[0].name, 'mcp__srv__conflict')
  assert.deepEqual(first.added, ['mcp__srv__ok'])
  assert.equal(bridges.has('mcp__srv__conflict'), false)
  assert.equal(internal.has(internalAliasOf('mcp__srv__conflict')), false)
  assert.equal(registry.registered.has(internalAliasOf('mcp__srv__conflict')), false)
  assert.ok(warnings.some(msg => msg.includes('cannot bridge "mcp__srv__conflict"')))

  registry.registered.delete('mcp__srv__conflict')
  registry.events.length = 0
  const second = reconcileBridges(bridges, internal, new Map([
    ['mcp__srv__conflict', { original: conflicting, passthrough: false }],
    ['mcp__srv__ok', { original: healthy, passthrough: false }],
  ]), opts)
  assert.deepEqual(second.kept, ['mcp__srv__ok'])
  assert.deepEqual(second.added, ['mcp__srv__conflict'])
  assert.equal(second.failed.length, 0)
  assert.equal(bridges.has('mcp__srv__conflict'), true)
})

test('reconcileOwnTools is idempotent, replaces changed tools without conflict, and removes deleted tools', () => {
  const registry = createStrictToolRegistry()
  const active = new Map()
  const warnings = []
  const opts = {
    register: (tool, regOpts) => registry.register(tool, regOpts),
    optionsOf: tool => ({ when: () => Boolean(tool.name) }),
    logger: { warn: msg => warnings.push(msg) },
  }

  const read = makeTool('read', { description: 'Read v1' })
  const bash = makeTool('bash', { description: 'Bash v1' })
  const edit = makeTool('edit', { description: 'Edit v1' })

  const first = reconcileOwnTools(active, [read, bash, edit], opts)
  assert.deepEqual(first.added, ['read', 'bash', 'edit'])

  registry.events.length = 0
  const second = reconcileOwnTools(active, [
    makeTool('read', { description: 'Read v1' }),
    makeTool('bash', { description: 'Bash v1' }),
    makeTool('edit', { description: 'Edit v1' }),
  ], opts)
  assert.deepEqual(second.kept, ['read', 'bash', 'edit'])
  assert.equal(second.mutated, false)
  assert.deepEqual(registry.events, [])

  const third = reconcileOwnTools(active, [
    makeTool('read', { description: 'Read v1' }),
    makeTool('bash', { description: 'Bash v2' }),
    makeTool('grep', { description: 'Grep v1' }),
  ], opts)
  assert.deepEqual(third.kept, ['read'])
  assert.deepEqual(third.updated, ['bash'])
  assert.deepEqual(third.added, ['grep'])
  assert.deepEqual(third.removed, ['edit'])
  assert.deepEqual(registry.events.map(e => `${e.type}:${e.name}`), [
    'dispose:bash',
    'dispose:edit',
    'register:bash',
    'register:grep',
  ])
  assert.equal(registry.registered.get('bash').definition.description, 'Bash v2')
  assert.equal(registry.registered.has('edit'), false)
  assert.equal(warnings.length, 0)
})
