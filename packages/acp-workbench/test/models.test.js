import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  advertisedModels,
  advertisedModes,
  cleanLabel,
  extractLegacyOverrides,
  modelContextWindow,
  modelDetails,
  parseContextSize,
  parseParameterizedModelId,
  reasoningOption,
  reasoningSelection,
  resolveLiveThinkingUpdates,
  visibleModels,
  wireModelId,
} from '../lib/models.js'

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
