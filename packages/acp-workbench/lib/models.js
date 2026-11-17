/** CLI discovery facts stay separate from the user's selected model IDs. */
const choices = option => (option?.options ?? []).flatMap(group => group.options ?? [group])
const positive = value => Number.isFinite(value) && value > 0
const named = value => ({ id: value.value, name: value.name ?? value.value,
  ...(typeof value.description === 'string' ? { description: value.description } : {}) })

/** The native bridge accepts text and images; other CLI modalities are not implemented. */
export function inputModalities(capabilities) {
  return capabilities ? ['text', ...(capabilities.promptCapabilities?.image ? ['image'] : [])] : undefined
}

function reasoningOption(options) {
  const option = options?.find(item => item.category === 'thought_level' && item.type === 'select')
  if (!option?.id) return undefined
  const efforts = choices(option).filter(item => typeof item.value === 'string').map(named)
  if (!efforts.length) return undefined
  return { efforts, configId: option.id,
    ...(efforts.some(item => item.id === option.currentValue) ? { defaultEffort: option.currentValue } : {}) }
}

/**
 * Cursor's variant catalog includes explicit reasoning_effort parameter values. Match families
 * only within that advertised catalog; never manufacture an ID or enable parameterized mode.
 * Other parameters remain part of the family, so changing effort cannot also enable Max/fast.
 */
function variant(id) {
  const match = /^(.+)\[([^[\]]+)\]$/.exec(id)
  if (!match) return null
  const parameters = match[2].split(',').map(part => part.trim().split('=').map(value => value.trim()))
  if (parameters.some(pair => pair.length !== 2 || !pair[0] || !pair[1])) return null
  const values = new Map(parameters)
  if (values.size !== parameters.length || !values.has('reasoning_effort')) return null
  const effort = values.get('reasoning_effort')
  values.delete('reasoning_effort')
  return { family: JSON.stringify([match[1], [...values].toSorted(([a], [b]) => a.localeCompare(b))]), effort }
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
    if (!parsed || model.reasoning?.configId) return model
    const order = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']
    const variants = [...new Map(groups.get(parsed.family).map(item => [item.id, item])).values()]
      .toSorted((a, b) => {
        const left = order.indexOf(a.id), right = order.indexOf(b.id)
        return (left < 0 ? order.length : left) - (right < 0 ? order.length : right)
      })
    return { ...model, reasoning: { efforts: variants.map(({ id, name }) => ({ id, name })),
      defaultEffort: parsed.effort, variants } }
  })
}

/** Standard ACP descriptions and model-specific options, without guessed capacities or costs. */
export function advertisedModels(result, capabilities) {
  const listed = result?.models?.availableModels
  const modelOption = (result?.configOptions ?? []).find(item => item.category === 'model' && item.type !== 'boolean')
  const source = Array.isArray(listed) && listed.length
    ? listed.filter(model => typeof model?.modelId === 'string').map(model => ({ ...model, id: model.modelId }))
    : choices(modelOption).map(model => ({ ...model, id: model.value }))
  const current = modelOption?.currentValue ?? result?.models?.currentModelId
  const modalities = inputModalities(capabilities)
  const models = source.filter(model => typeof model.id === 'string' && model.id).map(model => {
    const reasoning = reasoningOption(model.configOptions ?? (model.id === current ? result.configOptions : undefined))
    const inputs = Array.isArray(model.inputModalities) ? model.inputModalities.filter(item => (item === 'text' || item === 'image') && (!modalities || modalities.includes(item))) : modalities
    const context = model.contextWindow ?? model.context?.contextWindow
    return { id: model.id, name: model.name ?? model.id,
      ...(typeof model.description === 'string' ? { description: model.description } : {}),
      ...(inputs ? { inputModalities: inputs } : {}),
      ...(positive(context) ? { contextWindow: context } : {}),
      ...(positive(model.maxTokens) ? { maxTokens: model.maxTokens } : {}),
      ...(reasoning ? { reasoning } : {}) }
  })
  return variantReasoning(models)
}

/** Resolve a selected model against discovery facts without adding candidates to the picker. */
export function modelDetails(provider, id) {
  const known = provider.advertised?.models?.find(model => model.id === id)
  const selected = provider.models?.find(model => model.id === id)
  return { ...known, ...selected, id }
}

/** Only the public DSH reasoning contract leaves the adapter; wire mappings stay plugin-owned. */
export function reasoningInfo(model) {
  const reasoning = model.reasoning
  return reasoning ? { efforts: reasoning.efforts,
    ...(reasoning.defaultEffort === undefined ? {} : { defaultEffort: reasoning.defaultEffort }) } : undefined
}

/** One advertised variant or one live thought-level config option, never a guessed wire value. */
export function reasoningSelection(model, effort) {
  if (effort === undefined) return { modelId: model.id }
  const reasoning = model.reasoning
  if (!reasoning?.efforts.some(item => item.id === effort)) throw new Error(`Unsupported ACP reasoning effort: ${effort}`)
  if (reasoning.variants) {
    const target = reasoning.variants.find(item => item.id === effort)
    if (!target) throw new Error(`No advertised ACP variant for reasoning effort: ${effort}`)
    return { modelId: target.modelId }
  }
  if (!reasoning.configId) throw new Error('The CLI did not advertise a reasoning configuration option')
  return { modelId: model.id, configId: reasoning.configId, value: effort }
}
