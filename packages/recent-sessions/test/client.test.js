import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)))
const { sessionIdOf, sortRows } = plugin._internal

const b64url = s => Buffer.from(JSON.stringify(s)).toString('base64url')
const row = (sid, section = 'sessions') => ({ icon: 'session', section, sid, value: JSON.stringify({ mention: `[x](dsh-session:${b64url(sid)})` }) })

test('registers under the package name', () => assert.equal(id, 'dsh-recent-sessions'))

test('sessionIdOf decodes the base64url mention', () => {
  assert.equal(sessionIdOf(row('abc-123')), 'abc-123')
  assert.equal(sessionIdOf({ icon: 'file', value: '{}' }), undefined)
  assert.equal(sessionIdOf({ icon: 'session', value: 'not json' }), undefined)
})

test('sortRows sorts each session block newest first, stable, leaves other rows', () => {
  const byId = { a: { updatedAt: 1 }, b: { updatedAt: '2026-01-02T00:00:00Z' }, c: { updatedAt: 3 } }
  const file = { icon: 'file', section: 'files' }
  const rows = [file, row('a'), row('b'), row('c'), row('d'), row('e', 'other'), row('c', 'other')]
  const out = sortRows(rows, byId).map(r => r.sid ?? r.icon)
  assert.deepEqual(out, ['file', 'b', 'c', 'a', 'd', 'c', 'e'])
})
