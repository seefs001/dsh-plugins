import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const noop = () => null
const primitives = {
  DisclosureRow: noop,
  FileTypeIcon: noop,
  IconBrowseOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
  Switch: noop,
  Tag: noop,
  TextShimmer: noop,
}

test('image-gen client parses multi-image results and publishes turn-tail gallery data', () => {
  const { id, plugin } = loadClient(clientPath, { '@deepseek-ai/dsh-client-ui-primitives': primitives })
  assert.equal(id, 'dsh-image-gen')
  const { parseImageBlock, imageGenTurnDefinition, selectTurnImages } = plugin._internal

  const parsed = parseImageBlock('result', {
    kind: 'tool-result',
    isError: false,
    call: { argsRaw: JSON.stringify({ prompt: 'A cat on Mars' }) },
    meta: {
      model: 'gpt-image-1',
      images: [
        { path: '/repo/generated-images/cat-1.png', revisedPrompt: 'Detailed cat on Mars', attachment: { attachmentId: 'a1', width: 1024, height: 1024, bytes: 12000 } },
        { path: '/repo/generated-images/cat-2.png', attachment: { attachmentId: 'a2', width: 1024, height: 1024, bytes: 11000 } },
      ],
    },
    content: [{ type: 'text', text: 'Generated 2 images' }],
  })
  assert.equal(parsed.state, 'ok')
  assert.equal(parsed.prompt, 'A cat on Mars')
  assert.equal(parsed.images.length, 2)
  assert.equal(parsed.images[0].revisedPrompt, 'Detailed cat on Mars')

  const startEvent = { type: 'turn/start', seq: 1, data: { turn: 3 } }
  const callEvent = { type: 'tool/call', seq: 2, data: { turn: 3, callId: 'c1', name: 'openai_image', arguments: '{"prompt":"Mars"}' } }
  const resultEvent = {
    type: 'tool/result',
    seq: 4,
    surfaceOp: 'append',
    data: {
      turn: 3,
      message: { isError: false, source: { callId: 'c1' }, content: [] },
      meta: { images: [{ path: '/repo/mars.png', attachment: { attachmentId: 'att-1' } }] },
    },
  }
  assert.deepEqual(structuredClone(imageGenTurnDefinition.match(startEvent)), { id: '3', role: 'start' })
  assert.deepEqual(structuredClone(imageGenTurnDefinition.match(callEvent)), { id: '3', role: 'update' })
  assert.deepEqual(structuredClone(imageGenTurnDefinition.match(resultEvent)), { id: '3', role: 'update' })

  let state = imageGenTurnDefinition.start({}, { event: startEvent })
  state = imageGenTurnDefinition.update({ state }, { event: callEvent })
  state = imageGenTurnDefinition.update({ state }, { event: resultEvent })
  const location = imageGenTurnDefinition.buildLocationData({ state }, 'turn', undefined)
  assert.equal(location.kind, 'turn')
  assert.equal(location.turn, 3)
  assert.equal(location.value.generated.length, 1)

  const turn = { end: { seq: 5 }, data: new Map([[location.key, location.value]]) }
  const selected = selectTurnImages({ turn, seq: 5 })
  assert.equal(selected.length, 1)
  assert.equal(selected[0].path, '/repo/mars.png')
  assert.equal(selectTurnImages({ turn: { end: { seq: 3 }, data: turn.data }, seq: 3 }).length, 0)
})

test('image-gen client registers toolviews and conversation.chat.turnTail', () => {
  const { plugin } = loadClient(clientPath, { '@deepseek-ai/dsh-client-ui-primitives': primitives })
  const slots = []
  let registeredDef
  const ctx = {
    effect: (fn, label) => { if (label === 'image-gen: turn data') fn() },
    on: () => () => {},
    locale: { register: () => {}, bind: () => key => key },
    uiConversation: {
      events: { register: def => { registeredDef = def; return () => {} } },
      imageUrl: (sessionId, att) => Promise.resolve(`/img/${sessionId}/${att.attachmentId}`),
    },
    slots: {
      inject: (name, fn) => { if (name === 'tool.call.toolview' || name === 'conversation.chat.turnTail') slots.push(fn()) },
      register: (options, component) => ({ options, component }),
      entries: () => [],
    },
  }
  plugin.apply(ctx)
  assert.ok(registeredDef)
  assert.deepEqual(slots.filter(s => s.options.name === 'tool.call.toolview').map(s => s.options.key), ['openai_image', 'grok_image'])
  const tail = slots.find(s => s.options.name === 'conversation.chat.turnTail')
  assert.ok(tail)
  assert.equal(tail.options.id, 'image-gen-gallery')
  assert.ok('image-gen.tail.images' in tail.options.children)
})
