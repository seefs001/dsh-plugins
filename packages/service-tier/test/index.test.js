import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeTiers, responsesProviders, serviceTierTransform, toggleTier } from '../lib/index.js'

test('normalizeTiers keeps supported provider/model tiers', () => {
  assert.deepEqual(
    normalizeTiers({
      'a/b': 'priority',
      'a/gpt-6.2-sol': 'ultrafast',
      'a/other': 'ultrafast',
      'c/d': 'flex',
      e: 'priority',
    }),
    { 'a/b': 'priority', 'a/gpt-6.2-sol': 'ultrafast' },
  )
  assert.deepEqual(normalizeTiers(undefined), {})
})

test('toggleTier sets, switches, and clears without mutating', () => {
  const before = { 'a/b': 'priority' }
  assert.deepEqual(toggleTier(before, 'c', 'd', 'priority'), { 'a/b': 'priority', 'c/d': 'priority' })
  assert.deepEqual(toggleTier(before, 'c', 'gpt-6.2-sol', 'ultrafast'), { 'a/b': 'priority', 'c/gpt-6.2-sol': 'ultrafast' })
  assert.deepEqual(toggleTier(before, 'c', 'd', 'ultrafast'), { 'a/b': 'priority' })
  assert.deepEqual(toggleTier(before, 'a', 'b', null), {})
  assert.deepEqual(before, { 'a/b': 'priority' })
})

test('responsesProviders reads openai-responses providers from the pi-ai row', () => {
  const editor = {
    configuration: () => [
      { entry: { name: 'other' } },
      {
        entry: { name: '@deepseek-ai/dsh-llm-pi-ai' },
        inherited: { providers: { a: { api: 'openai-responses' }, b: { api: 'anthropic-messages' }, d: {} } },
        override: { providers: { b: { api: 'openai-responses' }, c: { api: 'openai-completions' } } },
      },
    ],
  }
  assert.deepEqual(responsesProviders(editor, new Set(['d'])), ['a', 'b', 'd'])
  assert.deepEqual(responsesProviders(undefined), [])
  assert.deepEqual(responsesProviders({ configuration: () => { throw new Error('x') } }), [])
})

test('serviceTierTransform injects service_tier via onPayload for matching Responses models', async () => {
  const transform = serviceTierTransform(() => ({ 'r/fast': 'priority', 'r/gpt-6.2-sol': 'ultrafast' }))

  const matched = {
    model: { api: 'openai-responses', provider: 'r', id: 'fast' },
    options: { onPayload: async params => ({ ...params, existing: true }) },
  }
  const updated = transform(matched)
  assert.deepEqual(await updated.options.onPayload({ input: 'hi' }, matched.model), {
    input: 'hi',
    existing: true,
    service_tier: 'priority',
  })

  const ultra = { model: { api: 'openai-responses', provider: 'r', id: 'gpt-6.2-sol' }, options: {} }
  assert.deepEqual(await transform(ultra).options.onPayload({ input: 'hi' }, ultra.model), {
    input: 'hi',
    service_tier: 'ultrafast',
  })

  const untouched = { model: { api: 'openai-responses', provider: 'r', id: 'slow' }, options: {} }
  assert.equal(transform(untouched), untouched)

  const otherApi = { model: { api: 'anthropic-messages', provider: 'r', id: 'fast' }, options: {} }
  assert.equal(transform(otherApi), otherApi)
})
