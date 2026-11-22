import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const noop = () => null
const primitives = {
  DisclosureRow: noop,
  FileTypeIcon: noop,
  IconGlobeOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
  IconSkillOutlineRegular: noop,
  TextShimmer: noop,
}

test('tool-lens extracts grep line jumps, lsp locations, hosted search links, and extended subagents', () => {
  const { id, plugin } = loadClient(clientPath, { '@deepseek-ai/dsh-client-ui-primitives': primitives })
  assert.equal(id, 'dsh-tool-lens')
  const { AUGMENTED, fileAddressFor, searchFiles, lspLocations, webLinks, subagentChild } = plugin._internal

  for (const key of ['subagent_fork', 'spawn_teammate', 'wait_agent', 'pwsh', 'ralph', 'cordis_inspect', 'cordis_inspect_self', 'grok_search', 'openai_search']) {
    assert.ok(AUGMENTED.includes(key))
  }

  assert.equal(fileAddressFor('s1', '/repo', '/repo/a.js'), 'dsh-resource://file/session/s1//repo/a.js')
  assert.equal(fileAddressFor('s1', '/repo/worktree', './src/../lib/a.js'), 'dsh-resource://file/session/s1//repo/worktree/lib/a.js')
  assert.equal(fileAddressFor('s1', undefined, './src/a.js'), 'dsh-resource://file/session/s1/src/a.js')

  const grepFiles = searchFiles({
    kind: 'tool-result',
    isError: false,
    meta: {
      shape: 'matches',
      files: [{ path: '/repo/a.js', matches: [{ lineNumber: 12 }, { lineNumber: 45 }, { lineNumber: 12 }] }],
    },
  })
  assert.deepEqual(structuredClone(grepFiles), [{ path: '/repo/a.js', line: 12, lines: [12, 45], count: 3 }])

  const lsp = lspLocations({
    kind: 'tool-result',
    isError: false,
    content: [{
      type: 'text',
      text: '/repo/src/app.ts:18:4 export function main()\nsrc/util.ts:7:1 helper\n/repo/src/app.ts:42:9 main()',
    }],
  })
  assert.deepEqual(structuredClone(lsp), [
    { path: '/repo/src/app.ts', line: 18, lines: [18, 42], count: 2 },
    { path: 'src/util.ts', line: 7, lines: [7], count: 1 },
  ])

  const grokLinks = webLinks('grok_search', {
    kind: 'tool-result',
    isError: false,
    meta: { sources: [{ url: 'https://example.com/a', title: 'Example' }, { url: 'javascript:alert(1)' }] },
  })
  assert.deepEqual(structuredClone(grokLinks), [{ url: 'https://example.com/a', title: 'Example' }])

  assert.equal(subagentChild('subagent_fork', { kind: 'tool-result', isError: false, meta: { name: 'worker-1' } }), 'worker-1')
  assert.equal(subagentChild('spawn_teammate', { kind: 'tool-result', isError: false, call: { argsRaw: JSON.stringify({ name: 'reviewer' }) } }), 'reviewer')
  assert.equal(subagentChild('wait_agent', { kind: 'tool-result', isError: false, call: { argsRaw: JSON.stringify({ agent: 'reviewer' }) } }), 'reviewer')
})

test('tool-lens invalidates skill catalog on preset and plugin changes', async () => {
  const { plugin } = loadClient(clientPath, { '@deepseek-ai/dsh-client-ui-primitives': primitives })
  const listeners = new Map()
  const registered = []
  let listCalls = 0
  const ctx = {
    effect: (fn, label) => {
      if (label === 'tool-lens: skill catalog') fn()
    },
    on: () => {},
    locale: { register: () => {}, bind: () => key => key, subscribe: () => () => {}, getSnapshot: () => 'en' },
    sessions: { list: { getSnapshot: () => ({ byId: {} }) } },
    sidebarRight: { openResource: () => {} },
    remote: {
      $on: (event, fn) => {
        listeners.set(event, fn)
        return () => listeners.delete(event)
      },
      skills: {
        list: async () => {
          listCalls += 1
          return { ok: true, value: { skills: [{ name: 'demo', path: '/skills/demo/SKILL.md' }] } }
        },
      },
    },
    slots: {
      inject: (_name, fn) => registered.push(fn()),
      register: (options, component) => ({ options, component }),
      entries: () => [],
    },
  }
  plugin.apply(ctx)
  const skillEntry = registered.find(entry => entry.options.key === 'skill')
  const { openSkill } = skillEntry.options.inject('s1')
  await openSkill('demo')
  await openSkill('demo')
  assert.equal(listCalls, 1)

  listeners.get('agent-preset/selected')()
  await openSkill('demo')
  assert.equal(listCalls, 2)

  listeners.get('plugin-manager/changed')()
  await openSkill('demo')
  assert.equal(listCalls, 3)
})
