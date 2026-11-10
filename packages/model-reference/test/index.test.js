import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isTopLevelSession, normalizeEfforts } from '../lib/index.js'

test('normalizeEfforts keeps provider/model keys with string efforts', () => {
  assert.deepEqual(normalizeEfforts({ 'a/b': 'high', bad: 'low', 'c/d': 1, '/e': 'x', 'f/g': '' }), { 'a/b': 'high' })
  assert.deepEqual(normalizeEfforts(null), {})
  assert.deepEqual(normalizeEfforts('nope'), {})
})

test('isTopLevelSession', () => {
  const root = {}; const child = {}
  const agents = { get: id => ({ r: root, c: child })[id], roots: () => [root] }
  assert.equal(isTopLevelSession(agents, 'r'), true)
  assert.equal(isTopLevelSession(agents, 'c'), false)
  assert.equal(isTopLevelSession(agents, 'unknown'), true)
  assert.equal(isTopLevelSession(undefined, 'r'), true)
})
