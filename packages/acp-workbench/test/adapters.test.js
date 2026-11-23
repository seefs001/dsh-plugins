import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  booleanSelectValues,
  extractAgentMeta,
  inferContextWindow,
  isAutoDefaultModel,
  isInteractivePermission,
  resolveAdapter,
} from '../lib/adapters.js'

test('resolveAdapter detects cursor, antigravity, claude-code, and generic providers', () => {
  assert.equal(resolveAdapter({ agentInfo: { name: 'Antigravity ACP Server' } }).id, 'antigravity')
  assert.equal(resolveAdapter({ capabilities: { _meta: { antigravity: { tier: true } } } }).id, 'antigravity')
  assert.equal(resolveAdapter({ command: '/Users/me/.local/bin/agy' }).id, 'antigravity')

  assert.equal(resolveAdapter({ agentInfo: { name: '@agentclientprotocol/claude-agent-acp' } }).id, 'claude-code')
  assert.equal(resolveAdapter({ capabilities: { _meta: { claudeCode: { promptQueueing: true } } } }).id, 'claude-code')
  assert.equal(resolveAdapter({ command: '/Users/me/.bun/bin/claude-agent-acp' }).id, 'claude-code')

  assert.equal(resolveAdapter({ agentInfo: { name: 'Cursor ACP' } }).id, 'cursor')
  assert.equal(resolveAdapter({ command: '/Users/me/.local/bin/cursor-agent' }).id, 'cursor')

  assert.equal(resolveAdapter({ providerId: 'custom', command: '/usr/local/bin/my-agent' }).id, 'generic')
})

test('isAutoDefaultModel distinguishes Cursor Auto from Claude Default', () => {
  const cursor = resolveAdapter({ providerId: 'cursor' })
  const claude = resolveAdapter({ providerId: 'claude-code' })
  assert.equal(isAutoDefaultModel({ id: 'default', name: 'Auto' }, cursor), true)
  assert.equal(isAutoDefaultModel({ id: 'default', name: 'Auto' }, claude), true)
  assert.equal(isAutoDefaultModel({ id: 'default', name: 'Default (recommended)' }, claude), false)
  assert.equal(isAutoDefaultModel({ id: 'opus', name: 'Opus 5.5' }, claude), false)
})

test('inferContextWindow parses explicit suffixes and Claude model families', () => {
  const claude = resolveAdapter({ providerId: 'claude-code' })
  assert.equal(inferContextWindow({ id: 'sonnet[1m]', name: 'Sonnet 4.6 [1m]' }, claude), 1_000_000)
  assert.equal(inferContextWindow({ id: 'opus', name: 'Opus 5.5 (opus)', description: 'Custom Opus model (claude-opus-5-5)' }, claude), 1_000_000)
  assert.equal(inferContextWindow({ id: 'fable', name: 'Fable 5.1 (fable)', description: 'Custom Fable model (claude-fable-5-1)' }, claude), 1_000_000)
  assert.equal(inferContextWindow({ id: 'haiku', name: 'Claude Haiku 4.5' }, claude), 200_000)
  assert.equal(inferContextWindow({ id: 'custom-model', name: 'Custom 256k context' }, resolveAdapter({})), 256_000)
  assert.equal(inferContextWindow({ id: 'unknown', name: 'Unknown' }, claude), undefined)
})

test('booleanSelectValues recognizes both true/false and on/off pairs', () => {
  assert.deepEqual(booleanSelectValues([{ value: 'false' }, { value: 'true' }]), { on: 'true', off: 'false' })
  assert.deepEqual(booleanSelectValues([{ value: 'off' }, { value: 'on' }]), { on: 'on', off: 'off' })
  assert.equal(booleanSelectValues([{ value: 'low' }, { value: 'high' }]), null)
  assert.equal(booleanSelectValues([{ value: 'on' }]), null)
})

test('extractAgentMeta pulls Antigravity tier and Claude steering metadata', () => {
  const agyMeta = extractAgentMeta(
    {
      agentInfo: { name: 'Antigravity ACP Server', version: '1.5.10' },
      agentCapabilities: { _meta: { antigravity: { tier: true, systemPrompt: { append: true } } } },
    },
    { _meta: { antigravity: { tier: { name: 'Google AI Ultra', id: 'g1-ultra-tier' } } } },
  )
  assert.deepEqual(agyMeta, {
    tier: { name: 'Google AI Ultra', id: 'g1-ultra-tier' },
    systemPromptAppend: true,
    agentLabel: 'Antigravity ACP Server 1.5.10',
  })

  const claudeMeta = extractAgentMeta(
    {
      agentInfo: { title: 'Claude Agent', version: '0.107.4-preview.8' },
      agentCapabilities: { _meta: { claudeCode: { promptQueueing: true } } },
      _meta: { steering: { supported: true } },
    },
    null,
  )
  assert.deepEqual(claudeMeta, {
    steering: true,
    promptQueueing: true,
    agentLabel: 'Claude Agent 0.107.4-preview.8',
  })
})

test('isInteractivePermission protects multi-choice approvals and interactive tools', () => {
  assert.equal(isInteractivePermission({
    toolCall: { name: 'Bash', kind: 'execute' },
    options: [
      { optionId: 'allow', kind: 'allow_once' },
      { optionId: 'reject', kind: 'reject_once' },
    ],
  }), false)

  assert.equal(isInteractivePermission({
    toolCall: { name: 'Bash', kind: 'execute' },
    options: [
      { optionId: 'allow-1', kind: 'allow_once' },
      { optionId: 'allow-2', kind: 'allow_always' },
      { optionId: 'reject', kind: 'reject_once' },
    ],
  }), false)

  assert.equal(isInteractivePermission({
    toolCall: { name: 'Bash', kind: 'execute' },
    options: [
      { optionId: 'allow-1', kind: 'allow_once' },
      { optionId: 'allow-2', kind: 'allow_once' },
      { optionId: 'reject', kind: 'reject_once' },
    ],
  }), true)

  assert.equal(isInteractivePermission({
    toolCall: { _meta: { claudeCode: { toolName: 'ExitPlanMode' } }, kind: 'other' },
    options: [{ optionId: 'allow', kind: 'allow_once' }],
  }), true)

  assert.equal(isInteractivePermission({
    toolCall: { name: 'AskUserQuestion', kind: 'other' },
    options: [{ optionId: 'allow', kind: 'allow_once' }],
  }), true)

  assert.equal(isInteractivePermission({
    toolCall: { kind: 'switch_mode' },
    options: [{ optionId: 'allow', kind: 'allow_once' }],
  }), true)
})
