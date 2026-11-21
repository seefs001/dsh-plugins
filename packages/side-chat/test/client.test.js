import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)))
const { encodeId, prefix, isSide, mention, buildPrompt, listSideChats } = plugin._internal

const expectedEncode = value => Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')

test('registers under the package name', () => assert.equal(id, 'dsh-side-chat'))

test('encodeId matches canonical base64url JSON encoding including Unicode', () => {
  for (const sample of ['session-1', 'session/with+chars=?', '会话-中文-🚀']) {
    assert.equal(encodeId(sample), expectedEncode(sample))
  }
})

test('prefix and isSide scope child sessions to parent', () => {
  const scope = prefix('session-main')
  assert.equal(isSide(`${scope}deadbeef`), true)
  assert.equal(isSide('session-main'), false)
})

test('mention escapes backslashes and closing brackets', () => {
  assert.equal(
    mention('s-1', 'foo [bar]\\baz'),
    `@[foo [bar\\]\\\\baz](dsh-session:${expectedEncode('s-1')})`,
  )
})

test('buildPrompt joins main mention, blockquoted selection, and trimmed question', () => {
  const ref = `@[Main](dsh-session:${expectedEncode('s-1')})`
  assert.equal(
    buildPrompt('s-1', 'Main', 'line 1\nline 2', '  why?  '),
    `${ref}\n\n> line 1\n> line 2\n\nwhy?`,
  )
  assert.equal(buildPrompt('s-1', 'Main', '', '  hello  '), `${ref}\n\nhello`)
})

test('listSideChats filters by parent scope, hides archived/blank, and sorts newest first', () => {
  const scope = prefix('p1')
  const other = prefix('p2')
  const a = `${scope}a`
  const b = `${scope}b`
  const c = `${scope}c`
  const d = `${scope}d`
  const e = `${other}e`
  const byId = {
    [a]: { updatedAt: 100, blank: false },
    [b]: { updatedAt: 300, blank: false },
    [c]: { updatedAt: 400, blank: true },
    [d]: { updatedAt: 500, blank: false },
    [e]: { updatedAt: 900, blank: false },
    p1: { updatedAt: 999, blank: false },
  }
  assert.deepEqual(listSideChats([a, b, c, d, e, 'p1'], byId, [d], 'p1'), [b, a])
})
