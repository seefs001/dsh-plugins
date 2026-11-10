import assert from 'node:assert/strict'
import { test } from 'node:test'
import { apply, sameSelection, selectionOf } from '../lib/index.js'

test('selectionOf', () => {
  assert.deepEqual(selectionOf({ provider: 'p', model: 'm', reasoningEffort: 'high', extra: 1 }), { provider: 'p', model: 'm', reasoningEffort: 'high' })
  assert.deepEqual(selectionOf({ provider: 'p', model: 'm' }), { provider: 'p', model: 'm' })
  assert.equal(selectionOf({ provider: 'p' }), undefined)
  assert.equal(selectionOf(undefined), undefined)
})

test('sameSelection treats missing and undefined effort alike', () => {
  assert.equal(sameSelection({ provider: 'p', model: 'm' }, { provider: 'p', model: 'm', reasoningEffort: undefined }), true)
  assert.equal(sameSelection({ provider: 'p', model: 'm', reasoningEffort: 'low' }, { provider: 'p', model: 'm' }), false)
  assert.equal(sameSelection(undefined, { provider: 'p', model: 'm' }), false)
})

test('saves top-level selections and skips subagents', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const root = {}; const child = {}
  const saved = []; const emitted = []
  let handler
  const ctx = {
    on: (_, fn) => { handler = fn },
    effect: () => {},
    emit: (name, arg) => emitted.push([name, arg]),
    get: () => ({ get: id => ({ top: root, sub: child })[id], roots: () => [root] }),
    agentDefaultModel: {
      currentSelection: () => ({ provider: 'p', model: 'old' }),
      saveSelection: async s => { saved.push(s) },
    },
  }
  apply(ctx)
  handler({ id: 'sub' }, { type: 'model/selection', data: { provider: 'p', model: 'x' } })
  handler({ id: 'top' }, { type: 'other' })
  handler({ id: 'top' }, { type: 'model/selection', data: { provider: 'p', model: 'new', reasoningEffort: 'high' } })
  await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(saved, [{ provider: 'p', model: 'new', reasoningEffort: 'high' }])
  t.mock.timers.tick(400)
  assert.deepEqual(emitted, [['llm/models-updated', 'p']])
})
