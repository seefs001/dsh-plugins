import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isLinkedWorktreePaths } from '../lib/index.js'

test('isLinkedWorktreePaths distinguishes linked worktrees from primary checkouts', () => {
  assert.equal(isLinkedWorktreePaths('.git', '.git', '/tmp/repo'), false)
  assert.equal(isLinkedWorktreePaths('/tmp/repo/.git/worktrees/feat', '/tmp/repo/.git', '/tmp/feat'), true)
  assert.equal(isLinkedWorktreePaths('', '.git', '/tmp/repo'), false)
})
