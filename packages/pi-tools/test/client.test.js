import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'
import { runGrep } from '../lib/search.js'

const clientPath = fileURLToPath(new URL('../client.js', import.meta.url))
const noop = () => null
const primitives = {
  Button: noop,
  Checkbox: noop,
  CodeBlock: noop,
  DiffBlock: noop,
  DisclosureRow: noop,
  Input: noop,
  Modal: noop,
  ReadBlock: noop,
  SearchBlock: noop,
  Tag: noop,
  TerminalBlock: noop,
  TextShimmer: noop,
  diffTotals: () => ({ added: 0, removed: 0 }),
  languageForPath: () => 'javascript',
  IconApiOutlineRegular: noop,
  IconBrowseOutlineRegular: noop,
  IconChevronRightOutlineRegular: noop,
  IconCodeOutlineRegular: noop,
  IconEditOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
  IconSearchOutlineRegular: noop,
}

test('pi-tools client detects Pi calls, computes streaming KB, and registers all toolview keys', () => {
  const { id, plugin } = loadClient(clientPath, { '@deepseek-ai/dsh-client-ui-primitives': primitives })
  assert.equal(id, 'dsh-pi-tools')
  const { isPiCall, streamingKb, callSummary, rowState, DIRECT_KEYS, WRAPPED_KEYS } = plugin._internal

  assert.equal(isPiCall({ toolName: 'codemode', phase: 'start', block: {} }), true)
  assert.equal(isPiCall({ toolName: 'edit', phase: 'result', block: { meta: { piVersion: '1.6.0' } } }), true)
  assert.equal(isPiCall({ toolName: 'edit', phase: 'result', block: { meta: {} } }), false)
  assert.equal(isPiCall({
    toolName: 'read',
    phase: 'start',
    block: { args: { has: key => key === 'path' } },
  }), true)
  assert.equal(isPiCall({
    toolName: 'read',
    phase: 'start',
    block: { args: { has: key => key === 'file_path' } },
  }), false)

  assert.equal(streamingKb({
    args: { has: key => key === 'code', stringLength: () => 2500 },
  }, ['code']), 3)
  assert.equal(streamingKb({ args: { has: () => false, stringLength: () => 0 } }, ['code']), null)

  const t = key => key
  assert.equal(callSummary([], t), 'noCalls')
  assert.equal(callSummary([{ name: 'read' }, { name: 'read' }, { name: 'grep' }], t), 'read × 2, grep')
  assert.equal(rowState('preparing', {}), 'preparing')
  assert.equal(rowState('result', { kind: 'tool-result', isError: true, error: { code: 'interrupted' } }), 'stopped')

  const registered = []
  const ctx = {
    effect: () => {},
    locale: { register: () => {}, bind: () => key => key },
    slots: {
      inject: (name, fn) => {
        if (name !== 'tool.call.toolview') return
        for (const item of fn()) registered.push(item)
      },
      register: (options, component) => ({ options, component }),
      entries: () => [],
    },
  }
  plugin.apply(ctx)
  const keys = registered.map(item => item.options.key)
  for (const key of DIRECT_KEYS) assert.ok(keys.includes(key))
  for (const key of WRAPPED_KEYS) {
    const entry = registered.find(item => item.options.key === key)
    assert.ok(entry)
    assert.equal(entry.options.priority, -1)
  }
})

test('pi-tools runGrep emits structured SearchBlock meta', async () => {
  const events = [
    JSON.stringify({
      type: 'match',
      data: { path: { text: 'sample.js' }, line_number: 1, lines: { text: 'const alpha = 1\n' } },
    }),
    JSON.stringify({
      type: 'match',
      data: { path: { text: 'sample.js' }, line_number: 2, lines: { text: 'const beta = alpha + 2\n' } },
    }),
  ]
  const ops = {
    path: async () => '/repo',
    isDirectory: async () => true,
    lines: async (_cmd, _argv, onLine) => {
      for (const line of events) onLine(line)
      return { exitCode: 0, stderr: '' }
    },
  }
  const result = await runGrep({ pattern: 'alpha', literal: true }, ops)
  assert.equal(result.meta.shape, 'matches')
  assert.equal(result.meta.total, 2)
  assert.equal(result.meta.truncated, false)
  assert.equal(result.meta.files.length, 1)
  assert.equal(result.meta.files[0].path, '/repo/sample.js')
  assert.deepEqual(result.meta.files[0].matches.map(match => match.lineNumber), [1, 2])
})
