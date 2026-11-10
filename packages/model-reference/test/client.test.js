import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)))
const { parseRef, serialize, decorate } = plugin._internal
// Values from the vm sandbox live in another realm; copy them before deep-equal.
const plain = v => JSON.parse(JSON.stringify(v))
const match = (...args) => plain(plugin._internal.match(...args))

test('registers under the package name', () => assert.equal(id, 'dsh-model-reference'))

test('parseRef / serialize round trip', () => {
  assert.deepEqual(plain(parseRef('responses/gpt-6?effort=high&fast=1')), { provider: 'responses', model: 'gpt-6', effort: 'high', fast: true })
  assert.deepEqual(plain(parseRef('p/org/model')), { provider: 'p', model: 'org/model', fast: false })
  assert.equal(serialize('responses/gpt-6?effort=high&fast=1'), '#model(provider=responses, model=gpt-6, reasoning_effort=high, service_tier=priority)')
  assert.equal(serialize('p/m'), '#model(provider=p, model=m)')
})

const groups = [
  { id: 'responses', name: 'Responses', models: [{ id: 'gpt-6', name: 'GPT-6', reasoning: { efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }], defaultEffort: 'low' } }] },
  { id: 'messages', name: 'Messages', models: [{ id: 'claude', name: 'Claude' }] },
]

test('match: every query word must hit', () => {
  assert.deepEqual(match(groups, '').map(m => m.model), ['gpt-6', 'claude'])
  assert.deepEqual(match(groups, 'resp gpt').map(m => m.model), ['gpt-6'])
  assert.deepEqual(match(groups, 'messages/cla').map(m => m.model), ['claude'])
  assert.deepEqual(match(groups, 'zzz'), [])
})

test('decorate: remembered effort, fallback to default, fast flag', () => {
  const [gpt] = match(groups, 'gpt')
  const prefs = { efforts: { 'responses/gpt-6': 'high' }, tiers: { 'responses/gpt-6': 'priority' }, fastProviders: ['responses'] }
  const d = decorate(gpt, prefs, null)
  assert.equal(d.ref, 'responses/gpt-6?effort=high&fast=1')
  assert.equal(d.effortName, 'High')
  const stale = decorate(gpt, { efforts: { 'responses/gpt-6': 'gone' }, tiers: {}, fastProviders: [] }, null)
  assert.equal(stale.ref, 'responses/gpt-6?effort=low')
  const [claude] = match(groups, 'claude')
  assert.equal(decorate(claude, { efforts: {}, tiers: {}, fastProviders: [] }, null).ref, 'messages/claude')
})
