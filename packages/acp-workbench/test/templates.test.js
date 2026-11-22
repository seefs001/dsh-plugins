import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'
import { defaultProviders, PROVIDER_TEMPLATES, resolveCliCommand, resolveProviderTemplates } from '../lib/templates.js'
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

test('resolveCliCommand prefers ~/.local/bin, then ~/.bun/bin, then bare binary name', () => {
  const present = new Set([
    '/home/dev/.local/bin/agy',
    '/home/dev/.bun/bin/claude-agent-acp',
    '/home/dev/.bun/bin/agy',
  ])
  const opts = { home: '/home/dev', exists: path => present.has(path) }

  assert.equal(resolveCliCommand('agy', opts), '/home/dev/.local/bin/agy')
  assert.equal(resolveCliCommand('claude-agent-acp', opts), '/home/dev/.bun/bin/claude-agent-acp')
  assert.equal(resolveCliCommand('codex-acp', opts), 'codex-acp')
})

test('resolveProviderTemplates exposes verified ACP templates and defaultProviders filters defaults', () => {
  const opts = { home: '/home/dev', exists: () => false }
  const templates = resolveProviderTemplates(opts)

  assert.deepEqual(
    templates.map(item => [item.id, item.command, item.args]),
    [
      ['cursor', 'cursor-agent', ['acp']],
      ['antigravity', 'agy', ['acp']],
      ['claude-code', 'claude-agent-acp', []],
      ['codex', 'codex-acp', []],
      ['gemini', 'gemini', ['--acp']],
      ['opencode', 'opencode', ['acp']],
      ['copilot', 'copilot', ['--acp']],
    ],
  )
  assert.equal(templates.length, PROVIDER_TEMPLATES.length)

  const defaults = defaultProviders(opts)
  assert.deepEqual(defaults.map(item => item.id), ['cursor', 'antigravity', 'claude-code'])
  assert.ok(defaults.every(item => Array.isArray(item.models) && item.models.length === 0))
})

test('Workbench snapshot includes providerTemplates and initializes default providers', async () => {
  const manager = new Workbench({
    domain: createMemoryDomain(),
    subprocess: {},
    changed: () => {},
    modelsChanged: () => {},
    log: () => {},
  })
  await manager.initialize()

  const snap = manager.snapshot()
  assert.deepEqual(snap.providers.map(item => item.id), ['cursor', 'antigravity', 'claude-code'])
  assert.deepEqual(
    snap.providerTemplates.map(item => item.id),
    ['cursor', 'antigravity', 'claude-code', 'codex', 'gemini', 'opencode', 'copilot'],
  )

  await manager.close()
})

test('acp-workbench client bundle loads cleanly with preset template strings', () => {
  const noop = () => null
  const primitives = new Proxy({}, { get: () => noop })
  const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })
  assert.equal(id, 'dsh-acp-workbench')
  assert.equal(typeof plugin.apply, 'function')
})
