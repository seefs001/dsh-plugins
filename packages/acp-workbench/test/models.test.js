import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  BYPASS_MODE_ID,
  advertisedModels,
  advertisedModes,
  cleanLabel,
  extractLegacyOverrides,
  hasNativeBypassMode,
  isBypassModeId,
  modelContextWindow,
  modelDetails,
  parseContextSize,
  parseParameterizedModelId,
  preferredBypassModeId,
  reasoningOption,
  reasoningSelection,
  resolveInitialConfigOptions,
  resolveLiveThinkingUpdates,
  resolveModeId,
  underlyingModeForBypass,
  visibleModels,
  wireModelId,
  withBypassMode,
} from '../lib/models.js'
import { resolveAdapter } from '../lib/adapters.js'

const CURSOR_CATALOG = {
  models: [
    {
      value: 'default',
      name: 'Auto',
      description: 'Balanced quality and speed',
      configOptions: [],
    },
    {
      value: 'claude-opus-5',
      name: 'Claude 5 Opus',
      description: 'Most capable Claude model',
      configOptions: [
        {
          id: 'thinking',
          name: 'Thinking',
          category: 'thought_level',
          type: 'select',
          currentValue: 'true',
          options: [
            { value: 'false', name: 'Off' },
            { value: 'true', name: 'On' },
          ],
        },
        {
          id: 'effort',
          name: 'Effort',
          category: 'thought_level',
          type: 'select',
          currentValue: 'high',
          options: [
            { value: 'low', name: 'Low' },
            { value: 'medium', name: 'Medium' },
            { value: 'high', name: 'High' },
            { value: 'max', name: 'Max' },
          ],
        },
        {
          id: 'context',
          name: 'Context',
          category: 'model_config',
          type: 'select',
          currentValue: '300k',
          options: [
            { value: '300k', name: '300K' },
            { value: '1m', name: '1M' },
          ],
        },
        {
          id: 'fast',
          name: 'Fast\u200B\u200B',
          category: 'model_config',
          type: 'select',
          currentValue: 'false',
          options: [
            { value: 'false', name: 'Off' },
            { value: 'true', name: 'On' },
          ],
        },
      ],
    },
    {
      value: 'gpt-5.6-sol',
      name: 'GPT-5.6 Sol',
      configOptions: [
        {
          id: 'reasoning',
          name: 'Reasoning',
          category: 'thought_level',
          type: 'select',
          currentValue: 'medium',
          options: [
            { value: 'low', name: 'Low' },
            { value: 'medium', name: 'Medium' },
            { value: 'high', name: 'High' },
            { value: 'xhigh', name: 'Extra High' },
          ],
        },
        {
          id: 'context',
          name: 'Context',
          category: 'model_config',
          type: 'select',
          currentValue: '272k',
          options: [
            { value: '272k', name: '272K' },
            { value: '1m', name: '1M' },
          ],
        },
      ],
    },
    {
      value: 'gemini-4-carbon',
      name: 'Gemini 4 Carbon',
      configOptions: [
        {
          id: 'thinking',
          name: 'Thinking',
          category: 'thought_level',
          type: 'select',
          currentValue: 'true',
          options: [
            { value: 'false', name: 'Off' },
            { value: 'true', name: 'On' },
          ],
        },
      ],
    },
  ],
}

test('cleanLabel strips zero-width characters and parseContextSize converts K/M suffixes', () => {
  assert.equal(cleanLabel('Fast\u200B\u200B'), 'Fast')
  assert.equal(cleanLabel('\uFEFF 300K \u200D'), '300K')
  assert.equal(parseContextSize('300k'), 300_000)
  assert.equal(parseContextSize('272K'), 272_000)
  assert.equal(parseContextSize('1m'), 1_000_000)
  assert.equal(parseContextSize('1.5M'), 1_500_000)
  assert.equal(parseContextSize('invalid'), undefined)
})

test('advertisedModels parses Cursor catalog with Auto mapping, dual thought_level, context, and fast', () => {
  const models = advertisedModels(null, { promptCapabilities: { image: true } }, CURSOR_CATALOG)
  assert.equal(models.length, 4)

  const auto = models.find(item => item.id === 'auto')
  assert.ok(auto)
  assert.equal(auto.wireId, 'default')
  assert.equal(auto.name, 'Auto')
  assert.equal(wireModelId(auto), 'default')

  const opus = models.find(item => item.id === 'claude-opus-5')
  assert.ok(opus)
  assert.equal(opus.contextWindow, 300_000)
  assert.deepEqual(opus.inputModalities, ['text', 'image'])
  assert.deepEqual(
    opus.reasoning.efforts.map(item => item.id),
    ['off', 'low', 'medium', 'high', 'max'],
  )
  assert.equal(opus.reasoning.defaultEffort, 'high')
  assert.equal(opus.reasoning.configId, 'effort')
  assert.equal(opus.reasoning.toggleConfigId, 'thinking')
  assert.equal(opus.reasoning.toggleOnValue, 'true')
  assert.equal(opus.reasoning.toggleOffValue, 'false')
  assert.equal(opus.reasoning.offEffortId, 'off')

  const fastOpt = opus.options.find(item => item.id === 'fast')
  assert.equal(fastOpt?.name, 'Fast')
  assert.equal(fastOpt?.defaultValue, 'false')
  assert.equal(modelContextWindow(opus), 300_000)
  assert.equal(modelContextWindow(opus, { context: '1m' }), 1_000_000)

  const sol = models.find(item => item.id === 'gpt-5.6-sol')
  assert.equal(sol.contextWindow, 272_000)
  assert.equal(sol.reasoning.configId, 'reasoning')
  assert.equal(sol.reasoning.toggleConfigId, undefined)
  assert.deepEqual(sol.reasoning.efforts.map(item => item.id), ['low', 'medium', 'high', 'xhigh'])

  const carbon = models.find(item => item.id === 'gemini-4-carbon')
  assert.equal(carbon.reasoning.configId, 'thinking')
  assert.deepEqual(carbon.reasoning.efforts.map(item => item.id), ['false', 'true'])
})

test('reasoningSelection and resolveLiveThinkingUpdates handle dual thinking+effort including hidden effort when thinking is off', () => {
  const models = advertisedModels(null, null, CURSOR_CATALOG)
  const opus = models.find(item => item.id === 'claude-opus-5')

  assert.deepEqual(reasoningSelection(opus, 'off'), {
    modelId: 'claude-opus-5',
    updates: [{ configId: 'thinking', value: 'false' }],
  })
  assert.deepEqual(reasoningSelection(opus, 'max'), {
    modelId: 'claude-opus-5',
    updates: [
      { configId: 'thinking', value: 'true' },
      { configId: 'effort', value: 'max' },
    ],
  })

  const liveWithoutEffort = [
    {
      id: 'thinking',
      category: 'thought_level',
      type: 'select',
      currentValue: 'false',
      options: [{ value: 'false', name: 'Off' }, { value: 'true', name: 'On' }],
    },
  ]
  assert.deepEqual(resolveLiveThinkingUpdates(liveWithoutEffort, 'max', opus), [
    { configId: 'thinking', value: 'true' },
    { configId: 'effort', value: 'max' },
  ])
  assert.deepEqual(resolveLiveThinkingUpdates(liveWithoutEffort, 'off', opus), [
    { configId: 'thinking', value: 'false' },
  ])
})

test('reasoningOption respects thinking=false default as off when merged with effort', () => {
  const result = reasoningOption([
    {
      id: 'thinking',
      category: 'thought_level',
      type: 'select',
      currentValue: 'false',
      options: [{ value: 'false', name: 'Off' }, { value: 'true', name: 'On' }],
    },
    {
      id: 'effort',
      category: 'thought_level',
      type: 'select',
      currentValue: 'high',
      options: [{ value: 'low', name: 'Low' }, { value: 'high', name: 'High' }],
    },
  ])
  assert.equal(result.defaultEffort, 'off')
})

test('advertisedModes extracts mode options from configOptions or session modes', () => {
  const fromConfig = advertisedModes({
    configOptions: [{
      id: 'mode',
      category: 'mode',
      type: 'select',
      currentValue: 'agent',
      options: [{ value: 'agent', name: 'Agent' }, { value: 'plan', name: 'Plan' }, { value: 'ask', name: 'Ask' }],
    }],
  })
  assert.equal(fromConfig.configId, 'mode')
  assert.equal(fromConfig.currentModeId, 'agent')
  assert.equal(fromConfig.options.length, 3)

  const fromLegacy = advertisedModes({
    modes: {
      currentModeId: 'plan',
      availableModes: [{ id: 'agent', name: 'Agent' }, { id: 'plan', name: 'Plan' }],
    },
  })
  assert.equal(fromLegacy.configId, undefined)
  assert.equal(fromLegacy.currentModeId, 'plan')
  assert.deepEqual(fromLegacy.options.map(item => item.value), ['agent', 'plan'])
})

test('visibleModels shows all advertised models by default, respects hiddenModels, and deduplicates legacy bracketed IDs', () => {
  const advertised = advertisedModels(null, null, CURSOR_CATALOG)
  const provider = {
    advertised: { models: advertised },
    models: [
      { id: 'claude-opus-5[thinking=true,context=300k,effort=high,fast=false]', name: 'Old Opus' },
      { id: 'default[]', name: 'Old Auto' },
      { id: 'custom-model', name: 'Custom Model' },
    ],
    hiddenModels: ['gemini-4-carbon'],
  }

  const list = visibleModels(provider)
  assert.deepEqual(list.map(item => item.id), ['auto', 'claude-opus-5', 'gpt-5.6-sol', 'custom-model'])

  const legacyDetails = modelDetails(provider, 'claude-opus-5[thinking=true,context=1m,effort=max,fast=true]')
  assert.equal(legacyDetails.id, 'claude-opus-5')
  assert.equal(legacyDetails.reasoning.toggleConfigId, 'thinking')
})

test('parseParameterizedModelId and extractLegacyOverrides parse legacy Cursor bracketed variants', () => {
  assert.deepEqual(parseParameterizedModelId('claude-opus-5[thinking=true,context=1m,effort=max,fast=true]'), {
    baseId: 'claude-opus-5',
    params: { thinking: 'true', context: '1m', effort: 'max', fast: 'true' },
  })
  assert.deepEqual(extractLegacyOverrides('claude-opus-5[thinking=true,context=1m,effort=max,fast=true]'), {
    baseId: 'claude-opus-5',
    effort: 'max',
    options: { fast: 'true', context: '1m' },
  })
  assert.deepEqual(extractLegacyOverrides('claude-opus-5[thinking=false,effort=high]'), {
    baseId: 'claude-opus-5',
    effort: 'off',
    options: {},
  })
  assert.deepEqual(extractLegacyOverrides('claude-opus-5'), {
    baseId: 'claude-opus-5',
    effort: undefined,
    options: {},
  })
})

test('advertisedModels synthesizes canonical Antigravity base models and per-model thought_level from session/new', () => {
  const agyResult = {
    models: {
      currentModelId: 'gemini-4-neon',
      availableModels: [
        { modelId: 'gemini-4-neon-low', name: 'Gemini 4 Neon (Low)' },
        { modelId: 'gemini-4-neon-medium', name: 'Gemini 4 Neon (Medium)' },
        { modelId: 'gemini-4-neon-high', name: 'Gemini 4 Neon (High)' },
        { modelId: 'gemini-4-neon-xhigh', name: 'Gemini 4 Neon (Extra)' },
        { modelId: 'claude-opus-5-5-low', name: 'Claude Opus 5.5 (Low)' },
        { modelId: 'claude-opus-5-5-medium', name: 'Claude Opus 5.5 (Medium)' },
        { modelId: 'claude-opus-5-5-high', name: 'Claude Opus 5.5 (High)' },
        { modelId: 'gemini-pro-orchestrator-neon', name: 'Orchestrator Neon' },
        { modelId: 'gpt-oss-120b-medium', name: 'GPT-OSS 120B (Medium)' },
      ],
    },
    configOptions: [
      {
        id: 'model',
        category: 'model',
        type: 'select',
        currentValue: 'gemini-4-neon',
        options: [
          { value: 'gemini-4-neon', name: 'Gemini 4 Neon' },
          { value: 'claude-opus-5-5', name: 'Claude Opus 5.5' },
          { value: 'gemini-pro-orchestrator-neon', name: 'Orchestrator Neon' },
          { value: 'gpt-oss-120b-medium', name: 'GPT-OSS 120B (Medium)' },
        ],
      },
      {
        id: 'thought_level',
        name: 'Thought Level',
        category: 'thought_level',
        type: 'select',
        currentValue: 'high',
        options: [
          { value: 'low', name: 'Low' },
          { value: 'medium', name: 'Medium' },
          { value: 'high', name: 'High' },
          { value: 'xhigh', name: 'Extra' },
        ],
      },
      {
        id: 'mode',
        category: 'mode',
        type: 'select',
        currentValue: 'default',
        options: [{ value: 'default', name: 'Default' }, { value: 'plan', name: 'Plan' }],
      },
    ],
  }

  const models = advertisedModels(agyResult, { promptCapabilities: { image: true } })
  assert.deepEqual(models.map(item => item.id), [
    'gemini-4-neon',
    'claude-opus-5-5',
    'gemini-pro-orchestrator-neon',
    'gpt-oss-120b-medium',
  ])

  const neon = models.find(item => item.id === 'gemini-4-neon')
  assert.deepEqual(neon.reasoning.efforts.map(item => item.id), ['low', 'medium', 'high', 'xhigh'])
  assert.equal(neon.reasoning.efforts.find(item => item.id === 'xhigh')?.name, 'Extra')
  assert.equal(neon.reasoning.defaultEffort, 'high')

  const opus = models.find(item => item.id === 'claude-opus-5-5')
  assert.deepEqual(opus.reasoning.efforts.map(item => item.id), ['low', 'medium', 'high'])
  assert.equal(opus.reasoning.configId, 'thought_level')
  assert.equal(opus.reasoning.defaultEffort, 'high')

  assert.equal(models.find(item => item.id === 'gemini-pro-orchestrator-neon')?.reasoning, undefined)
  assert.equal(models.find(item => item.id === 'gpt-oss-120b-medium')?.reasoning, undefined)

  const provider = {
    advertised: { models },
    models: [
      { id: 'gemini-4-neon-xhigh', name: 'Legacy Neon Extra' },
      { id: 'claude-opus-5-5-low', name: 'Legacy Opus Low' },
    ],
  }
  assert.deepEqual(visibleModels(provider).map(item => item.id), [
    'gemini-4-neon',
    'claude-opus-5-5',
    'gemini-pro-orchestrator-neon',
    'gpt-oss-120b-medium',
  ])
  assert.deepEqual(extractLegacyOverrides('gemini-4-neon-xhigh', provider), {
    baseId: 'gemini-4-neon',
    effort: 'xhigh',
    options: {},
  })
  assert.equal(modelDetails(provider, 'claude-opus-5-5-low').id, 'claude-opus-5-5')
})

test('advertisedModels drops non-Auto default for Claude Code and preserves boolean fast/ultracode/agent options', () => {
  const claudeAdapter = { id: 'claude-code', mapDefaultToAuto: false }
  const catalog = {
    models: [
      { value: 'default', name: 'Default (recommended)', description: 'Opus 5.5', configOptions: [] },
      {
        value: 'opus',
        name: 'Opus 5.5 (opus)',
        description: 'Custom Opus model (claude-opus-5-5)',
        configOptions: [
          {
            id: 'effort',
            category: 'thought_level',
            type: 'select',
            currentValue: 'high',
            options: [{ value: 'default', name: 'Default' }, { value: 'low', name: 'Low' }, { value: 'high', name: 'High' }, { value: 'max', name: 'Max' }],
          },
          { id: 'fast', name: 'Fast mode', description: 'Faster responses', category: 'model_config', type: 'boolean', currentValue: false },
          { id: 'ultracode', name: 'Ultracode', category: 'model_config', type: 'boolean', currentValue: false },
          { id: 'agent', name: 'Agent', type: 'select', currentValue: 'default', options: [{ value: 'default', name: 'Default' }, { value: 'reviewer', name: 'Reviewer' }] },
        ],
      },
      {
        value: 'haiku',
        name: 'Claude Haiku 4.5 (haiku)',
        configOptions: [
          {
            id: 'effort',
            category: 'thought_level',
            type: 'select',
            currentValue: 'default',
            options: [{ value: 'default', name: 'Default' }, { value: 'low', name: 'Low' }],
          },
        ],
      },
    ],
  }

  const models = advertisedModels(null, { promptCapabilities: { image: true } }, catalog, claudeAdapter)
  assert.deepEqual(models.map(item => item.id), ['opus', 'haiku'])
  const opus = models.find(item => item.id === 'opus')
  assert.equal(opus.contextWindow, 1_000_000)
  assert.deepEqual(opus.options.map(item => [item.id, item.type]), [
    ['fast', 'boolean'],
    ['ultracode', 'boolean'],
    ['agent', 'select'],
  ])
  assert.equal(opus.options.find(item => item.id === 'fast')?.description, 'Faster responses')
  assert.equal(models.find(item => item.id === 'haiku')?.contextWindow, 200_000)
})

test('resolveModeId and resolveInitialConfigOptions map legacyModes only when deprecated and target is available', () => {
  const hermes = resolveAdapter({ providerId: 'hermes' })
  const policyModes = {
    configId: 'edit_approval_policy',
    currentModeId: 'ask',
    options: [
      { value: 'ask', name: 'Ask' },
      { value: 'workspace_session', name: 'Workspace session' },
      { value: 'session', name: 'Session' },
    ],
  }

  assert.equal(resolveModeId('default', policyModes, hermes), 'ask')
  assert.equal(resolveModeId('accept_edits', policyModes, hermes), 'workspace_session')
  assert.equal(resolveModeId('dont_ask', policyModes, hermes), 'session')
  assert.equal(resolveModeId('ask', policyModes, hermes), 'ask')

  const stillLegacyModes = {
    options: [{ value: 'default', name: 'Default' }, { value: 'ask', name: 'Ask' }],
  }
  assert.equal(resolveModeId('default', stillLegacyModes, hermes), 'default')

  const unrelatedModes = {
    options: [{ value: 'strict', name: 'Strict' }],
  }
  assert.equal(resolveModeId('default', unrelatedModes, hermes), 'default')

  const normalized = resolveInitialConfigOptions(
    [
      { configId: 'model', value: 'hermes-3' },
      { configId: 'mode', value: 'accept_edits' },
    ],
    { modes: policyModes, adapter: hermes },
  )
  assert.deepEqual(normalized, [
    { configId: 'model', value: 'hermes-3' },
    { configId: 'edit_approval_policy', value: 'workspace_session' },
  ])

  const advertised = advertisedModes(
    {
      configOptions: [{
        id: 'edit_approval_policy',
        category: 'mode',
        type: 'select',
        currentValue: 'dont_ask',
        options: [{ value: 'ask', name: 'Ask' }, { value: 'session', name: 'Session' }],
      }],
    },
    hermes,
  )
  assert.equal(advertised.currentModeId, 'session')
})

test('withBypassMode appends synthetic bypass mode unless provider natively advertises one', () => {
  const agyModes = {
    configId: 'mode',
    currentModeId: 'default',
    options: [
      { value: 'default', name: 'Default' },
      { value: 'accept-edits', name: 'Accept edits' },
      { value: 'auto', name: 'Auto' },
      { value: 'plan', name: 'Plan' },
    ],
  }
  assert.equal(hasNativeBypassMode(agyModes), false)
  const enhancedAgy = withBypassMode(agyModes)
  assert.deepEqual(enhancedAgy.options.map(item => item.value), ['default', 'accept-edits', 'auto', 'plan', BYPASS_MODE_ID])
  assert.equal(underlyingModeForBypass(agyModes), 'auto')
  assert.equal(preferredBypassModeId(agyModes), BYPASS_MODE_ID)

  const cursorModes = {
    configId: 'mode',
    currentModeId: 'agent',
    options: [
      { value: 'agent', name: 'Agent' },
      { value: 'plan', name: 'Plan' },
      { value: 'ask', name: 'Ask' },
    ],
  }
  assert.equal(underlyingModeForBypass(cursorModes), 'agent')

  const claudeModes = {
    configId: 'mode',
    currentModeId: 'default',
    options: [
      { value: 'default', name: 'Manual' },
      { value: 'bypassPermissions', name: 'Bypass permissions' },
    ],
  }
  assert.equal(isBypassModeId('bypassPermissions'), true)
  assert.equal(isBypassModeId(BYPASS_MODE_ID), true)
  assert.equal(isBypassModeId('auto'), false)
  assert.equal(hasNativeBypassMode(claudeModes), true)
  assert.equal(withBypassMode(claudeModes), claudeModes)
  assert.equal(preferredBypassModeId(claudeModes), 'bypassPermissions')
})
