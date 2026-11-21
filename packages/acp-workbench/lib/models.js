import { inferContextWindow, isAutoDefaultModel } from './adapters.js'

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/gu
const PARAMETERIZED_MODEL = /^([^[\]]+)\[([^[\]]*)\]$/u
const REASONING_KEYS = ['effort', 'reasoning_effort', 'reasoning', 'thinking']
const BOOLEAN_VALUES = new Set(['true', 'false', 'on', 'off'])
const EFFORT_ORDER = ['off', 'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'extra-high', 'max']
const EFFORT_SET = new Set(EFFORT_ORDER)

export const cleanLabel = value => typeof value === 'string' ? value.replace(ZERO_WIDTH, '').trim() : ''
const choices = option => (option?.options ?? []).flatMap(group => group.options ?? [group])
const positive = value => Number.isFinite(value) && value > 0
const namedChoice = value => ({
  id: value.value,
  name: cleanLabel(value.name ?? value.value) || value.value,
  ...(typeof value.description === 'string' && cleanLabel(value.description) ? { description: cleanLabel(value.description) } : {}),
})
const isBooleanChoices = list => list.length > 0 && list.every(item => BOOLEAN_VALUES.has(item.id.toLowerCase()))

export function parseContextSize(value) {
  if (typeof value !== 'string') return undefined
  const match = /^(\d+(?:\.\d+)?)\s*([km])$/iu.exec(value.trim())
  if (!match) return undefined
  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount <= 0) return undefined
  return Math.round(amount * (match[2].toLowerCase() === 'm' ? 1_000_000 : 1_000))
}

export function parseParameterizedModelId(id) {
  if (typeof id !== 'string') return { baseId: '', params: {} }
  const trimmed = id.trim()
  const match = PARAMETERIZED_MODEL.exec(trimmed)
  if (!match) return { baseId: trimmed, params: {} }
  const params = {}
  const body = match[2].trim()
  if (body) {
    for (const part of body.split(',')) {
      const separator = part.indexOf('=')
      if (separator <= 0) continue
      const key = part.slice(0, separator).trim()
      const value = part.slice(separator + 1).trim()
      if (key && value) params[key] = value
    }
  }
  return { baseId: match[1].trim(), params }
}

function matchFlatVariant(rawModelId, provider) {
  if (typeof rawModelId !== 'string') return null
  const trimmed = rawModelId.trim()
  const models = provider?.advertised?.models
  if (!trimmed || !Array.isArray(models) || !models.length) return null
  if (models.some(model => model.id === trimmed)) return null
  for (const model of models) {
    const prefix = `${model.id}-`
    if (!trimmed.startsWith(prefix)) continue
    const suffix = trimmed.slice(prefix.length)
    if (!suffix) continue
    const match = model.reasoning?.efforts?.find(item => item.id.toLowerCase() === suffix.toLowerCase())
    if (match) return { model, effort: match.id }
  }
  return null
}

export function extractLegacyOverrides(rawModelId, provider) {
  const { baseId, params } = parseParameterizedModelId(rawModelId)
  if (!baseId) return { baseId, effort: undefined, options: {} }
  if (baseId !== rawModelId?.trim()) {
    const effort = params.thinking === 'false'
      ? 'off'
      : params.effort ?? params.reasoning_effort ?? params.reasoning ?? params.thinking
    const options = {}
    if (params.fast !== undefined) options.fast = params.fast
    if (params.context !== undefined) options.context = params.context
    return { baseId, effort, options }
  }
  const flat = matchFlatVariant(rawModelId, provider)
  if (flat) return { baseId: flat.model.id, effort: flat.effort, options: {} }
  return { baseId, effort: undefined, options: {} }
}

export function inputModalities(capabilities) {
  return capabilities ? ['text', ...(capabilities.promptCapabilities?.image ? ['image'] : [])] : undefined
}

function metaReasoning(meta) {
  if (!meta || typeof meta !== 'object' || meta.supportsReasoningEffort === false) return undefined
  if (!Array.isArray(meta.reasoningEfforts) || !meta.reasoningEfforts.length) return undefined
  const seen = new Set()
  const efforts = []
  let markedDefault
  for (const item of meta.reasoningEfforts) {
    const id = typeof item?.value === 'string' && item.value ? item.value : typeof item?.id === 'string' && item.id ? item.id : null
    if (!id || seen.has(id)) return undefined
    seen.add(id)
    efforts.push({
      id,
      name: cleanLabel(item.label ?? item.name ?? id) || id,
      ...(typeof item.description === 'string' && cleanLabel(item.description) ? { description: cleanLabel(item.description) } : {}),
    })
    if (item.default && markedDefault === undefined) markedDefault = id
  }
  const defaultEffort = typeof meta.reasoningEffort === 'string' && seen.has(meta.reasoningEffort)
    ? meta.reasoningEffort
    : markedDefault
  return { efforts, ...(defaultEffort === undefined ? {} : { defaultEffort }) }
}

export function reasoningOption(options, meta) {
  const selects = (options ?? [])
    .filter(item => item?.category === 'thought_level' && item.type === 'select' && typeof item.id === 'string' && item.id)
    .map(option => ({
      id: option.id,
      currentValue: typeof option.currentValue === 'string' ? option.currentValue : undefined,
      choices: choices(option).filter(item => typeof item?.value === 'string' && item.value).map(namedChoice),
    }))
    .filter(option => option.choices.length > 0)

  if (!selects.length) return metaReasoning(meta)

  const toggles = selects.filter(option => isBooleanChoices(option.choices))
  const levels = selects.filter(option => !isBooleanChoices(option.choices))
  const effortOpt = levels.find(option => option.id === 'effort')
    ?? levels.find(option => option.id === 'reasoning_effort')
    ?? levels.find(option => option.id === 'reasoning')
    ?? levels[0]
  const toggleOpt = toggles.find(option => option.id === 'thinking') ?? toggles[0]

  if (effortOpt && toggleOpt) {
    const offChoice = toggleOpt.choices.find(item => item.id.toLowerCase() === 'false' || item.id.toLowerCase() === 'off')
    const onChoice = toggleOpt.choices.find(item => item.id.toLowerCase() === 'true' || item.id.toLowerCase() === 'on')
    const hasExistingOff = effortOpt.choices.some(item => item.id.toLowerCase() === 'off' || item.id.toLowerCase() === 'none')
    const offEffortId = offChoice && !hasExistingOff ? 'off' : undefined
    const efforts = [
      ...(offEffortId ? [{ id: offEffortId, name: offChoice.name || 'Off' }] : []),
      ...effortOpt.choices,
    ]
    const defaultEffort = offEffortId && toggleOpt.currentValue === offChoice.id
      ? offEffortId
      : effortOpt.choices.some(item => item.id === effortOpt.currentValue) ? effortOpt.currentValue : undefined
    return {
      efforts,
      configId: effortOpt.id,
      ...(defaultEffort === undefined ? {} : { defaultEffort }),
      ...(onChoice && offChoice ? {
        toggleConfigId: toggleOpt.id,
        toggleOnValue: onChoice.id,
        toggleOffValue: offChoice.id,
        ...(offEffortId ? { offEffortId } : {}),
      } : {}),
    }
  }

  const chosen = effortOpt ?? toggleOpt
  if (!chosen) return metaReasoning(meta)
  return {
    efforts: chosen.choices,
    configId: chosen.id,
    ...(chosen.choices.some(item => item.id === chosen.currentValue) ? { defaultEffort: chosen.currentValue } : {}),
  }
}

export function modelConfigOptions(options) {
  const result = []
  for (const option of options ?? []) {
    if (!option?.id || option.category === 'model' || option.category === 'mode' || option.category === 'thought_level') continue
    const name = cleanLabel(option.name ?? option.id) || option.id
    const description = typeof option.description === 'string' ? cleanLabel(option.description) : ''
    if (option.type === 'boolean') {
      result.push({
        id: option.id,
        name,
        ...(description ? { description } : {}),
        ...(option.category ? { category: option.category } : {}),
        type: 'boolean',
        defaultValue: Boolean(option.currentValue),
      })
      continue
    }
    if (option.type !== 'select') continue
    const list = choices(option)
      .filter(item => typeof item?.value === 'string' && item.value)
      .map(item => ({
        value: item.value,
        name: cleanLabel(item.name ?? item.value) || item.value,
        ...(typeof item.description === 'string' && cleanLabel(item.description) ? { description: cleanLabel(item.description) } : {}),
      }))
    if (!list.length) continue
    result.push({
      id: option.id,
      name,
      ...(description ? { description } : {}),
      ...(option.category ? { category: option.category } : {}),
      type: 'select',
      ...(typeof option.currentValue === 'string' ? { defaultValue: option.currentValue } : {}),
      choices: list,
    })
  }
  return result
}

export function advertisedModes(result) {
  const modeOption = (result?.configOptions ?? []).find(item => item?.category === 'mode' && item.type === 'select')
  if (modeOption) {
    const options = choices(modeOption)
      .filter(item => typeof item?.value === 'string' && item.value)
      .map(item => ({
        value: item.value,
        name: cleanLabel(item.name ?? item.value) || item.value,
        ...(typeof item.description === 'string' && cleanLabel(item.description) ? { description: cleanLabel(item.description) } : {}),
      }))
    if (options.length) {
      return {
        configId: modeOption.id,
        currentModeId: typeof modeOption.currentValue === 'string' ? modeOption.currentValue : options[0].value,
        options,
      }
    }
  }
  const available = result?.modes?.availableModes
  if (Array.isArray(available) && available.length) {
    const options = available
      .filter(item => typeof item?.id === 'string' && item.id)
      .map(item => ({
        value: item.id,
        name: cleanLabel(item.name ?? item.id) || item.id,
        ...(typeof item.description === 'string' && cleanLabel(item.description) ? { description: cleanLabel(item.description) } : {}),
      }))
    if (options.length) {
      return {
        currentModeId: typeof result.modes.currentModeId === 'string' ? result.modes.currentModeId : options[0].value,
        options,
      }
    }
  }
  return null
}

// external: older ACP CLIs encode reasoning effort inside bracketed model IDs alongside other variant params
function variant(id) {
  const { baseId, params } = parseParameterizedModelId(id)
  if (!baseId || baseId === id) return null
  const key = REASONING_KEYS.find(candidate => candidate in params)
  if (!key) return null
  const effort = params[key]
  const rest = Object.entries(params)
    .filter(([paramKey]) => paramKey !== key)
    .toSorted(([a], [b]) => a.localeCompare(b))
  return { family: JSON.stringify([baseId, rest]), effort }
}

function variantReasoning(models) {
  const groups = new Map()
  for (const model of models) {
    const parsed = variant(model.id)
    if (!parsed) continue
    const group = groups.get(parsed.family) ?? []
    group.push({ id: parsed.effort, name: parsed.effort, modelId: model.id })
    groups.set(parsed.family, group)
  }
  return models.map(model => {
    const parsed = variant(model.id)
    if (!parsed || model.reasoning) return model
    const variants = [...new Map(groups.get(parsed.family).map(item => [item.id, item])).values()]
      .toSorted((a, b) => {
        const left = EFFORT_ORDER.indexOf(a.id.toLowerCase()), right = EFFORT_ORDER.indexOf(b.id.toLowerCase())
        return (left < 0 ? EFFORT_ORDER.length : left) - (right < 0 ? EFFORT_ORDER.length : right)
      })
    if (variants.length < 2) return model
    return {
      ...model,
      reasoning: {
        efforts: variants.map(({ id, name }) => ({ id, name })),
        defaultEffort: parsed.effort,
        variants,
      },
    }
  })
}

export function modelContextWindow(model, optionOverrides) {
  const contextOpt = model?.options?.find(item => item.id === 'context' && item.type === 'select')
  const chosen = optionOverrides?.context ?? contextOpt?.defaultValue
  const parsed = parseContextSize(chosen)
  if (parsed) return parsed
  return positive(model?.contextWindow) ? model.contextWindow : undefined
}

function deriveSuffixThoughtConfig(baseId, availableModels, sessionConfigOptions) {
  if (!baseId || !Array.isArray(availableModels) || !availableModels.length) return undefined
  const prefix = `${baseId}-`
  const liveThought = (sessionConfigOptions ?? []).find(item => item?.category === 'thought_level' && item.type === 'select')
  const labelByValue = new Map(choices(liveThought).map(item => [item.value.toLowerCase(), cleanLabel(item.name ?? item.value)]))
  const seen = new Set()
  const matched = []
  for (const item of availableModels) {
    const candidate = item?.modelId
    if (typeof candidate !== 'string' || !candidate.startsWith(prefix)) continue
    const suffix = candidate.slice(prefix.length)
    const normalized = suffix.toLowerCase()
    if (!EFFORT_SET.has(normalized) || seen.has(normalized)) continue
    seen.add(normalized)
    const fallbackLabel = normalized === 'xhigh' ? 'Extra' : `${suffix[0].toUpperCase()}${suffix.slice(1)}`
    matched.push({
      value: suffix,
      name: labelByValue.get(normalized) || fallbackLabel,
    })
  }
  const hasExact = availableModels.some(item => item?.modelId === baseId)
  if (matched.length < 2 && (matched.length < 1 || hasExact)) return undefined
  matched.sort((a, b) => EFFORT_ORDER.indexOf(a.value.toLowerCase()) - EFFORT_ORDER.indexOf(b.value.toLowerCase()))
  const preferredDefault = matched.find(item => item.value.toLowerCase() === 'high')?.value
    ?? matched.find(item => item.value.toLowerCase() === 'medium')?.value
    ?? matched[0].value
  return [{
    id: liveThought?.id ?? 'thought_level',
    name: cleanLabel(liveThought?.name) || 'Thought Level',
    category: 'thought_level',
    type: 'select',
    currentValue: preferredDefault,
    options: matched,
  }]
}

function buildAdvertisedEntry(raw, { configOptions, modalities, hasExplicitAuto, adapter }) {
  const rawId = raw.id
  if (typeof rawId !== 'string' || !rawId) return null
  let id = rawId
  let wireId
  if (rawId === 'default') {
    if (!isAutoDefaultModel(raw, adapter) || hasExplicitAuto) return null
    id = 'auto'
    wireId = 'default'
  }
  const reasoning = reasoningOption(configOptions, raw._meta)
  const options = modelConfigOptions(configOptions)
  const inputs = Array.isArray(raw.inputModalities)
    ? raw.inputModalities.filter(item => (item === 'text' || item === 'image') && (!modalities || modalities.includes(item)))
    : modalities
  const contextOpt = options.find(item => item.id === 'context' && item.type === 'select')
  const context = raw.contextWindow
    ?? raw.context?.contextWindow
    ?? parseContextSize(contextOpt?.defaultValue)
    ?? inferContextWindow(raw, adapter)
  const name = cleanLabel(raw.name ?? id) || id
  const description = typeof raw.description === 'string' ? cleanLabel(raw.description) : ''
  return {
    id,
    ...(wireId ? { wireId } : {}),
    name,
    ...(description ? { description } : {}),
    ...(inputs ? { inputModalities: inputs } : {}),
    ...(positive(context) ? { contextWindow: context } : {}),
    ...(positive(raw.maxTokens) ? { maxTokens: raw.maxTokens } : {}),
    ...(reasoning ? { reasoning } : {}),
    ...(options.length ? { options } : {}),
  }
}

export function advertisedModels(result, capabilities, catalog = null, adapter = null) {
  const modalities = inputModalities(capabilities)
  if (Array.isArray(catalog?.models) && catalog.models.length > 0) {
    const hasExplicitAuto = catalog.models.some(item => item?.value === 'auto')
    return catalog.models
      .filter(item => typeof item?.value === 'string' && item.value)
      .map(item => buildAdvertisedEntry(
        { id: item.value, name: item.name, description: item.description, _meta: item._meta },
        { configOptions: item.configOptions ?? [], modalities, hasExplicitAuto, adapter },
      ))
      .filter(Boolean)
  }

  const listed = Array.isArray(result?.models?.availableModels) ? result.models.availableModels : []
  const modelOption = (result?.configOptions ?? []).find(item => item.category === 'model' && item.type !== 'boolean')
  const optionModels = choices(modelOption)
  const current = modelOption?.currentValue ?? result?.models?.currentModelId

  if (optionModels.length > 0) {
    const listedById = new Map(listed.filter(item => typeof item?.modelId === 'string').map(item => [item.modelId, item]))
    const source = optionModels.map(item => {
      const extra = listedById.get(item.value)
      return {
        ...extra,
        ...item,
        id: item.value,
        description: item.description ?? extra?.description,
      }
    })
    const hasExplicitAuto = source.some(item => item?.id === 'auto')
    const models = source
      .map(model => {
        const configOptions = model.configOptions
          ?? (model.id === current ? result?.configOptions : deriveSuffixThoughtConfig(model.id, listed, result?.configOptions))
        return buildAdvertisedEntry(model, {
          configOptions,
          modalities,
          hasExplicitAuto,
          adapter,
        })
      })
      .filter(Boolean)
    return variantReasoning(models)
  }

  const source = listed
    .filter(model => typeof model?.modelId === 'string')
    .map(model => ({ ...model, id: model.modelId }))
  const hasExplicitAuto = source.some(item => item?.id === 'auto')
  const models = source
    .map(model => buildAdvertisedEntry(model, {
      configOptions: model.configOptions ?? (model.id === current ? result?.configOptions : undefined),
      modalities,
      hasExplicitAuto,
      adapter,
    }))
    .filter(Boolean)
  return variantReasoning(models)
}

export function visibleModels(provider) {
  const hidden = new Set(provider?.hiddenModels ?? [])
  const advertised = provider?.advertised?.models ?? []
  const advertisedIds = new Set(advertised.map(model => model.id))
  const extras = (provider?.models ?? []).filter(model => {
    if (!model?.id || model.id === 'default' || advertisedIds.has(model.id)) return false
    const { baseId } = parseParameterizedModelId(model.id)
    if (baseId !== model.id && (advertisedIds.has(baseId) || (baseId === 'default' && advertisedIds.has('auto')))) return false
    if (matchFlatVariant(model.id, provider)) return false
    return true
  })
  return [...advertised, ...extras].filter(model => model.id !== 'default' && !hidden.has(model.id))
}

export function wireModelId(model) {
  return model?.wireId ?? model?.id
}

export function modelDetails(provider, id) {
  const direct = provider?.advertised?.models?.find(model => model.id === id)
  if (direct) {
    const selected = provider?.models?.find(model => model.id === id)
    return { ...direct, ...(selected ? { name: selected.name ?? direct.name } : {}), id }
  }
  const { baseId } = parseParameterizedModelId(id)
  const resolvedBase = baseId === 'default' ? 'auto' : baseId
  const byBase = resolvedBase && resolvedBase !== id
    ? provider?.advertised?.models?.find(model => model.id === resolvedBase)
    : undefined
  if (byBase) return { ...byBase, id: byBase.id }
  const flat = matchFlatVariant(id, provider)
  if (flat) return { ...flat.model, id: flat.model.id }
  const selected = provider?.models?.find(model => model.id === id)
  return { ...selected, id }
}

export function reasoningInfo(model) {
  const reasoning = model?.reasoning
  return reasoning ? {
    efforts: reasoning.efforts,
    ...(reasoning.defaultEffort === undefined ? {} : { defaultEffort: reasoning.defaultEffort }),
  } : undefined
}

export function reasoningSelection(model, effort) {
  const modelId = wireModelId(model)
  if (effort === undefined) return { modelId, updates: [] }
  const reasoning = model?.reasoning
  if (!reasoning?.efforts.some(item => item.id === effort)) {
    throw new Error(`Unsupported ACP reasoning effort: ${effort}`)
  }
  if (reasoning.variants) {
    const target = reasoning.variants.find(item => item.id === effort)
    if (!target) throw new Error(`No advertised ACP variant for reasoning effort: ${effort}`)
    return { modelId: target.modelId, updates: [] }
  }
  if (reasoning.toggleConfigId) {
    if (reasoning.offEffortId && effort === reasoning.offEffortId) {
      return { modelId, updates: [{ configId: reasoning.toggleConfigId, value: reasoning.toggleOffValue }] }
    }
    return {
      modelId,
      updates: [
        { configId: reasoning.toggleConfigId, value: reasoning.toggleOnValue },
        { configId: reasoning.configId, value: effort },
      ],
    }
  }
  if (!reasoning.configId) {
    return { modelId, updates: [], fallbackEffort: effort }
  }
  return { modelId, updates: [{ configId: reasoning.configId, value: effort }] }
}

export function resolveLiveThinkingUpdates(configOptions, effort, model) {
  if (effort === undefined) return []
  const live = reasoningOption(configOptions)
  if (live) {
    if (live.toggleConfigId && live.offEffortId && effort === live.offEffortId) {
      return [{ configId: live.toggleConfigId, value: live.toggleOffValue }]
    }
    if (live.efforts.some(item => item.id === effort)) {
      if (live.toggleConfigId) {
        return [
          { configId: live.toggleConfigId, value: live.toggleOnValue },
          { configId: live.configId, value: effort },
        ]
      }
      return [{ configId: live.configId, value: effort }]
    }
  }
  const fallback = reasoningSelection(model, effort)
  return fallback.updates ?? []
}
