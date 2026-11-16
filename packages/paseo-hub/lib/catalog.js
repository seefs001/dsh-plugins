/**
 * Pure translation between DSH catalogs and Hub's provider vocabulary.
 *
 * Hub sees one provider, `dsh`. A Hub model id is `<dsh provider>/<dsh model>`
 * (split at the first slash, as Hub splits `provider/model`), thinking options
 * are the model's reasoning efforts, and modes are DSH permission presets.
 */

export const HUB_PROVIDER = 'dsh'
export const HUB_PROVIDER_LABEL = 'DeepSeek Harness'

export function hubModelId(provider, model) {
  return `${provider}/${model}`
}

/** `deepseek/deepseek-v4` -> `{ provider: 'deepseek', model: 'deepseek-v4' }`; model ids may contain slashes. */
export function splitHubModelId(id) {
  const value = String(id ?? '')
  const at = value.indexOf('/')
  if (at <= 0 || at === value.length - 1) return undefined
  return { provider: value.slice(0, at), model: value.slice(at + 1) }
}

/** Hub mode id -> DSH preset name. Configured `modes` win; otherwise every selectable preset maps to itself. */
export function resolveModes(config, permissionCatalog) {
  const presets = (permissionCatalog?.options ?? []).filter(option => option.value !== 'custom')
  const known = new Map(presets.map(option => [option.value, option]))
  const configured = Object.entries(config?.modes ?? {})
  const entries = configured.length > 0
    ? configured.filter(([, preset]) => known.has(preset)).map(([mode, preset]) => ({ id: mode, preset, option: known.get(preset) }))
    : presets.map(option => ({ id: option.value, preset: option.value, option }))
  const fallback = config?.defaultMode || permissionCatalog?.defaultPreset
  const defaultModeId = entries.find(entry => entry.id === fallback)?.id
    ?? entries.find(entry => entry.preset === fallback)?.id
    ?? entries[0]?.id
    ?? null
  return { entries, defaultModeId }
}

/** Build the single `dsh` provider snapshot entry Hub stores and offers in its trigger editor. */
export function providerSnapshotEntry({ catalog, modes, now }) {
  const models = []
  for (const group of catalog?.groups ?? []) {
    for (const model of group.models ?? []) {
      const efforts = model.reasoning?.efforts ?? []
      const isDefault = catalog.default?.provider === group.id && catalog.default?.model === model.id
      models.push({
        provider: HUB_PROVIDER,
        id: hubModelId(group.id, model.id),
        label: model.name || model.id,
        description: `${group.name || group.id}${model.description ? ` · ${model.description}` : ''}`,
        ...isDefault ? { isDefault: true } : {},
        ...efforts.length > 0
          ? {
              thinkingOptions: efforts.map(effort => ({
                id: effort.id,
                label: effort.name || effort.id,
                ...effort.description ? { description: effort.description } : {},
                ...effort.id === model.reasoning?.defaultEffort ? { isDefault: true } : {},
              })),
              ...model.reasoning?.defaultEffort ? { defaultThinkingOptionId: model.reasoning.defaultEffort } : {},
            }
          : {},
      })
    }
  }
  const failures = (catalog?.failures ?? []).map(failure => `${failure.id ?? failure.provider ?? 'provider'}: ${failure.message ?? failure.error ?? 'unavailable'}`)
  return {
    provider: HUB_PROVIDER,
    status: models.length > 0 ? 'ready' : 'error',
    enabled: true,
    source: 'custom',
    label: HUB_PROVIDER_LABEL,
    description: 'Runs in DeepSeek Harness sessions on this Host, with its models and permission presets.',
    ...models.length === 0 ? { error: failures.join('; ') || 'No DSH model is available' } : {},
    models,
    modes: modes.entries.map(entry => ({
      id: entry.id,
      label: entry.option?.name || entry.id,
      ...entry.option?.description ? { description: entry.option.description } : {},
    })),
    defaultModeId: modes.defaultModeId,
    fetchedAt: now.toISOString(),
  }
}

/** The daemon's own verdict on a Hub agent configuration; issue paths use the daemon's field names. */
export function validateAgent({ provider, model, modeId, thinkingOptionId, providerOptions }, { catalog, modes }) {
  const issues = []
  if (provider !== HUB_PROVIDER) {
    issues.push({ path: ['provider'], message: `This DeepSeek Harness host runs only provider '${HUB_PROVIDER}'` })
    return issues
  }
  let resolved
  if (model !== undefined) {
    const split = splitHubModelId(model)
    const group = split && (catalog?.groups ?? []).find(candidate => candidate.id === split.provider)
    resolved = group?.models.find(candidate => candidate.id === split.model)
    if (!resolved) issues.push({ path: ['model'], message: `Model '${model}' is not available on this DeepSeek Harness host` })
  }
  if (modeId !== undefined && !modes.entries.some(entry => entry.id === modeId)) {
    issues.push({ path: ['modeId'], message: `Mode '${modeId}' is not a permission preset on this host (${modes.entries.map(entry => entry.id).join(', ') || 'none configured'})` })
  }
  if (thinkingOptionId !== undefined) {
    const efforts = resolved?.reasoning?.efforts
    if (model === undefined) {
      const fallback = splitHubModelId(hubModelId(catalog?.default?.provider, catalog?.default?.model))
      const group = fallback && (catalog?.groups ?? []).find(candidate => candidate.id === fallback.provider)
      const defaults = group?.models.find(candidate => candidate.id === fallback.model)?.reasoning?.efforts
      if (!defaults?.some(effort => effort.id === thinkingOptionId)) issues.push({ path: ['thinkingOptionId'], message: `Thinking option '${thinkingOptionId}' is not available for the default model` })
    } else if (resolved && !efforts?.some(effort => effort.id === thinkingOptionId)) {
      issues.push({ path: ['thinkingOptionId'], message: `Thinking option '${thinkingOptionId}' is not available for '${model}'` })
    }
  }
  if (providerOptions !== undefined && Object.keys(providerOptions).length > 0) {
    issues.push({ path: ['providerOptions'], message: 'DeepSeek Harness accepts no provider options; choose a mode (permission preset) instead' })
  }
  return issues
}
