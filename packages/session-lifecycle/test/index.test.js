import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyOp, DEFAULT_SETTINGS, normalizeSettings, normalizeState } from '../lib/index.js'

test('normalizeSettings keeps afterPutAway default and validates values', () => {
  assert.deepEqual(normalizeSettings({}), DEFAULT_SETTINGS)
  assert.equal(normalizeSettings({ afterPutAway: 'next' }).afterPutAway, 'next')
  assert.equal(normalizeSettings({ afterPutAway: 'invalid' }).afterPutAway, 'quiet')
})

test('unread clears seen, settled, and snoozed and sets keptAt', () => {
  const initial = normalizeState({
    sessions: {
      s1: { settledAt: 1000, settledBy: 'user', seen: 42 },
    },
  })
  const { state } = applyOp(initial, { action: 'unread', sessionId: 's1' }, 5000)
  assert.equal(state.sessions.s1.seen, undefined)
  assert.equal(state.sessions.s1.settledAt, undefined)
  assert.equal(state.sessions.s1.keptAt, 5000)

  const restored = applyOp(state, {
    action: 'restore',
    sessionId: 's1',
    record: initial.sessions.s1,
    expected: state.sessions.s1,
    restoreSeen: true,
  }, 6000)
  assert.equal(restored.state.sessions.s1.seen, 42)
  assert.equal(restored.state.sessions.s1.settledAt, 1000)
})

test('ack_woke clears wokeAt without affecting other fields', () => {
  const initial = normalizeState({
    sessions: {
      s1: { wokeAt: 2000, wokeBy: 'timer', keptAt: 1500, seen: 9 },
    },
  })
  const { state } = applyOp(initial, { action: 'ack_woke', sessionId: 's1' }, 3000)
  assert.equal(state.sessions.s1.wokeAt, undefined)
  assert.equal(state.sessions.s1.keptAt, 1500)
  assert.equal(state.sessions.s1.seen, 9)
})

test('batch and restore_batch support atomic multi-session sweep and undo', () => {
  const initial = normalizeState({ sessions: {} })
  const batchRes = applyOp(initial, { action: 'batch', op: 'settle', sessionIds: ['s1', 's2'] }, 10_000)
  assert.equal(batchRes.result.entries.length, 2)
  assert.equal(batchRes.state.sessions.s1.settledAt, 10_000)
  assert.equal(batchRes.state.sessions.s2.settledAt, 10_000)

  const undoRes = applyOp(batchRes.state, {
    action: 'restore_batch',
    entries: batchRes.result.entries.map(e => ({ sessionId: e.sessionId, record: e.before, expected: e.after })),
  }, 11_000)
  assert.equal(undoRes.result.restored, 2)
  assert.equal(undoRes.state.sessions.s1, undefined)
  assert.equal(undoRes.state.sessions.s2, undefined)
})
