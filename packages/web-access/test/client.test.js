import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const noop = () => null
const primitives = {
  DisclosureRow: noop,
  IconGlobeOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
  Switch: noop,
  Tag: noop,
  TextShimmer: noop,
  WebBlock: noop,
}

test('web-access client parses grok_search/openai_search blocks and registers SearchRow natively', () => {
  const { id, plugin } = loadClient(clientPath, { '@deepseek-ai/dsh-client-ui-primitives': primitives })
  assert.equal(id, 'dsh-web-access')
  const { parseSearchBlock } = plugin._internal

  const parsed = parseSearchBlock('grok_search', 'result', {
    kind: 'tool-result',
    isError: false,
    call: { argsRaw: JSON.stringify({ query: 'dsh plugins', sources: ['web', 'x'] }) },
    meta: { answer: 'Found docs.', sources: [{ url: 'https://example.com', title: 'Docs' }], model: 'grok-4' },
    content: [{ type: 'text', text: 'Found docs.' }],
  })
  assert.equal(parsed.state, 'ok')
  assert.equal(parsed.query, 'dsh plugins')
  assert.equal(parsed.answer, 'Found docs.')
  assert.deepEqual(structuredClone(parsed.channels), ['web', 'x'])
  assert.equal(parsed.sources.length, 1)

  const registered = []
  const ctx = {
    effect: () => {},
    locale: { register: () => {}, bind: () => key => key },
    slots: {
      inject: (name, fn) => { if (name === 'tool.call.toolview') registered.push(fn()) },
      register: (options, component) => ({ options, component }),
    },
  }
  plugin.apply(ctx)
  assert.deepEqual(registered.map(entry => entry.options.key), ['grok_search', 'openai_search'])
})
