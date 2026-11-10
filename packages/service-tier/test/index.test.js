import assert from 'node:assert/strict'
import { test } from 'node:test'
import { apply, normalizeTiers, responsesProviders, toggleTier } from '../lib/index.js'

test('normalizeTiers keeps only priority provider/model keys', () => {
  assert.deepEqual(normalizeTiers({ 'a/b': 'priority', 'c/d': 'flex', e: 'priority' }), { 'a/b': 'priority' })
  assert.deepEqual(normalizeTiers(undefined), {})
})

test('toggleTier does not mutate', () => {
  const before = { 'a/b': 'priority' }
  assert.deepEqual(toggleTier(before, 'c', 'd', true), { 'a/b': 'priority', 'c/d': 'priority' })
  assert.deepEqual(toggleTier(before, 'a', 'b', false), {})
  assert.deepEqual(before, { 'a/b': 'priority' })
})

test('responsesProviders reads openai-responses providers from the pi-ai row', () => {
  const editor = {
    configuration: () => [
      { entry: { name: 'other' } },
      {
        entry: { name: '@deepseek-ai/dsh-llm-pi-ai' },
        inherited: { providers: { a: { api: 'openai-responses' }, b: { api: 'anthropic-messages' } } },
        override: { providers: { b: { api: 'openai-responses' }, c: { api: 'openai-completions' } } },
      },
    ],
  }
  assert.deepEqual(responsesProviders(editor), ['a', 'b'])
  assert.deepEqual(responsesProviders(undefined), [])
  assert.deepEqual(responsesProviders({ configuration: () => { throw new Error('x') } }), [])
})

test('model-defaults waterfall adds serviceTier only for fast Responses models', () => {
  let waterfall
  const ctx = {
    on: (name, fn) => { if (name === 'llm-pi-ai/model-defaults') waterfall = fn },
    effect: () => {},
  }
  apply(ctx, { tiers: { 'r/fast': 'priority' } })
  const next = () => ({ temperature: 1 })
  assert.deepEqual(waterfall({ api: 'openai-responses', provider: 'r', model: 'fast' }, next), { temperature: 1, serviceTier: 'priority' })
  assert.deepEqual(waterfall({ api: 'openai-responses', provider: 'r', model: 'slow' }, next), { temperature: 1 })
  assert.deepEqual(waterfall({ api: 'anthropic-messages', provider: 'r', model: 'fast' }, next), { temperature: 1 })
})
