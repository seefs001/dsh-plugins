import assert from 'node:assert/strict'
import test from 'node:test'
import { extractGitHubMentions, normalizeHosts } from '../lib/github.js'

const defaultTarget = {
  host: 'github.com',
  owner: 'acme',
  repo: 'demo',
  fullName: 'acme/demo',
  url: 'https://github.com/acme/demo',
}

test('extractGitHubMentions records nodeKey, seq, role, matchText, and snippet per message', () => {
  const events = [
    {
      seq: 10,
      type: 'user/message',
      data: {
        id: 'u1',
        source: { kind: 'user' },
        content: [{ type: 'text', text: 'Please check PR #42 and also https://github.com/other/repo/issues/7 today.' }],
      },
    },
    {
      seq: 18,
      type: 'assistant/message',
      data: {
        turn: 1,
        step: 2,
        message: {
          content: [{ type: 'text', text: 'I reviewed #42 and linked it with https://github.com/acme/demo/actions/runs/987654321.' }],
        },
      },
    },
  ]

  const refs = extractGitHubMentions(events, defaultTarget, normalizeHosts())
  const byKey = new Map(refs.map(ref => [ref.key, ref]))

  const pr42 = byKey.get('item:github.com/acme/demo#42')
  assert.ok(pr42)
  assert.equal(pr42.occurrences.length, 2)
  assert.equal(pr42.occurrences[0].seq, 18)
  assert.equal(pr42.occurrences[0].role, 'assistant')
  assert.equal(pr42.occurrences[0].nodeKey, '14:assistant-step1:2')
  assert.equal(pr42.occurrences[0].turn, 1)
  assert.equal(pr42.occurrences[0].matchText, '#42')
  assert.match(pr42.occurrences[0].snippet, /reviewed #42/)

  assert.equal(pr42.occurrences[1].seq, 10)
  assert.equal(pr42.occurrences[1].role, 'user')
  assert.equal(pr42.occurrences[1].nodeKey, '13:input-messageu1')
  assert.equal(pr42.occurrences[1].matchText, 'PR #42')
  assert.match(pr42.occurrences[1].snippet, /check PR #42/)

  const issue7 = byKey.get('item:github.com/other/repo#7')
  assert.ok(issue7)
  assert.equal(issue7.occurrences.length, 1)
  assert.equal(issue7.occurrences[0].matchText, 'https://github.com/other/repo/issues/7')

  const run = byKey.get('run:github.com/acme/demo/987654321')
  assert.ok(run)
  assert.equal(run.occurrences.length, 1)
  assert.equal(run.occurrences[0].nodeKey, '14:assistant-step1:2')
})

test('extractGitHubMentions ignores #numbers inside fenced code blocks and keeps accurate snippet offsets', () => {
  const events = [
    {
      seq: 25,
      type: 'user/message',
      data: {
        id: 'u2',
        source: { kind: 'user' },
        content: [{ type: 'text', text: '```js\nconst color = "#999"\n```\nActually look at acme/demo#15 here.' }],
      },
    },
  ]

  const refs = extractGitHubMentions(events, defaultTarget, normalizeHosts())
  assert.equal(refs.length, 1)
  assert.equal(refs[0].number, 15)
  assert.equal(refs[0].occurrences.length, 1)
  assert.equal(refs[0].occurrences[0].matchText, 'acme/demo#15')
  assert.match(refs[0].occurrences[0].snippet, /Actually look at acme\/demo#15 here\./)
})
