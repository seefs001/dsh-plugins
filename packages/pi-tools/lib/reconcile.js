import { createHash } from 'node:crypto'

export const INTERNAL_PREFIX = 'pi_internal_'

const CORE_SIGNATURE_KEYS = new Set([
  'name',
  'description',
  'parameters',
  'output',
  'timeoutMs',
  'constrainedSampling',
])

function canonicalize(value, seen) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) return 'null'
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return 'null'
    return JSON.stringify(value)
  }
  if (typeof value.toJSON === 'function') return canonicalize(value.toJSON(), seen)
  if (seen.has(value)) return '"[Circular]"'
  seen.add(value)
  try {
    if (Array.isArray(value)) {
      return `[${value.map(item => canonicalize(item, seen)).join(',')}]`
    }
    const parts = []
    for (const key of Object.keys(value).toSorted()) {
      const item = value[key]
      if (item === undefined || typeof item === 'function' || typeof item === 'symbol') continue
      parts.push(`${JSON.stringify(key)}:${canonicalize(item, seen)}`)
    }
    return `{${parts.join(',')}}`
  } finally {
    seen.delete(value)
  }
}

export function canonicalJson(value) {
  return canonicalize(value, new Set())
}

export function toolSignature(tool, options = {}) {
  const extra = {}
  if (tool && typeof tool === 'object') {
    for (const key of Object.keys(tool)) {
      if (CORE_SIGNATURE_KEYS.has(key)) continue
      const item = tool[key]
      if (item === undefined || typeof item === 'function' || typeof item === 'symbol') continue
      extra[key] = item
    }
  }
  return canonicalJson({
    name: tool?.name ?? '',
    description: tool?.description ?? '',
    parameters: tool?.parameters ?? null,
    outputSchema: tool?.output?.schema ?? null,
    timeoutMs: tool?.timeoutMs ?? null,
    constrainedSampling: tool?.constrainedSampling ?? null,
    hasPresentationMeta: typeof tool?.output?.presentationMeta === 'function',
    hasProjectContent: typeof tool?.projectContent === 'function',
    hasFinalizeContent: typeof tool?.finalizeContent === 'function',
    hasIsConcurrencySafe: typeof tool?.isConcurrencySafe === 'function',
    hasPresentCall: typeof tool?.presentCall === 'function',
    hasPresentResult: typeof tool?.presentResult === 'function',
    hasPrepareArguments: typeof tool?.prepareArguments === 'function',
    passthrough: Boolean(options.passthrough),
    scoped: options.sourceScope !== undefined,
    extra,
  })
}

export function internalAliasOf(name) {
  return INTERNAL_PREFIX + createHash('sha256').update(name).digest('hex').slice(0, 24)
}

export function buildBridgeDefinitions(name, alias, record, execute) {
  const original = record.original
  const output = {
    schema: original.output.schema,
    render: (args, value) => record.original.output.render(args, value),
    ...(typeof original.output.presentationMeta === 'function' ? {
      presentationMeta: (args, value) => record.original.output.presentationMeta?.(args, value),
    } : {}),
  }
  const shared = {
    ...original,
    output,
    execute,
    ...(typeof original.projectContent === 'function' ? {
      projectContent: (exec, result) => record.original.projectContent?.(exec, result),
    } : {}),
    ...(typeof original.finalizeContent === 'function' ? {
      finalizeContent: (exec, result) => record.original.finalizeContent?.(exec, result),
    } : {}),
    ...(typeof original.isConcurrencySafe === 'function' ? {
      isConcurrencySafe: input => record.original.isConcurrencySafe?.(input) ?? false,
    } : {}),
    ...(typeof original.presentCall === 'function' ? {
      presentCall: input => record.original.presentCall?.(input),
    } : {}),
    ...(typeof original.presentResult === 'function' ? {
      presentResult: (input, result) => record.original.presentResult?.(input, result),
    } : {}),
    ...(typeof original.prepareArguments === 'function' ? {
      prepareArguments: input => record.original.prepareArguments?.(input),
    } : {}),
  }
  return {
    direct: { ...shared, name },
    nested: { ...shared, name: alias },
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

export function reconcileBridges(bridges, internal, available, {
  registerDirect,
  registerInternal,
  releaseScopedBindings,
  createExecute,
  logger,
}) {
  const removed = []
  const updated = []
  const added = []
  const kept = []
  const failed = []
  const replacedSet = new Set()
  const nextSignatures = new Map()
  for (const [name, entry] of available) {
    nextSignatures.set(name, toolSignature(entry.original, entry))
  }
  for (const [name, record] of bridges) {
    const current = available.get(name)
    const nextSig = nextSignatures.get(name)
    if (current && nextSig === record.signature && current.sourceScope === record.sourceScope) {
      record.original = current.original
      if (record.passthrough) record.direct = current.original
      kept.push(name)
      continue
    }
    bridges.delete(name)
    if (record.alias !== undefined) internal.delete(record.alias)
    try {
      record.dispose?.()
    } catch (error) {
      logger?.warn?.(`pi-tools: cannot dispose bridge "${name}": ${errorMessage(error)}`)
    }
    if (current) replacedSet.add(name)
    else removed.push(name)
  }
  for (const [name, { original, sourceScope, passthrough }] of available) {
    if (bridges.has(name)) continue
    const signature = nextSignatures.get(name)
    if (passthrough) {
      const record = {
        signature,
        original,
        direct: original,
        sourceScope,
        passthrough,
        dispose: () => releaseScopedBindings?.(name),
      }
      bridges.set(name, record)
      if (replacedSet.has(name)) updated.push(name)
      else added.push(name)
      continue
    }
    const alias = internalAliasOf(name)
    const record = {
      alias,
      signature,
      original,
      sourceScope,
      passthrough,
      direct: null,
      nested: null,
      dispose: null,
    }
    const execute = createExecute(name, record)
    const { direct, nested } = buildBridgeDefinitions(name, alias, record, execute)
    record.direct = direct
    record.nested = nested
    let releaseInternal
    let releaseDirect
    try {
      releaseInternal = registerInternal(nested, name)
      releaseDirect = registerDirect(direct, name)
    } catch (error) {
      try { releaseDirect?.() } catch {}
      try { releaseInternal?.() } catch {}
      failed.push({ name, error: errorMessage(error) })
      logger?.warn?.(`pi-tools: cannot bridge "${name}": ${errorMessage(error)}`)
      continue
    }
    record.dispose = () => {
      try { releaseDirect?.() } finally { releaseInternal?.() }
    }
    bridges.set(name, record)
    internal.set(alias, name)
    if (replacedSet.has(name)) updated.push(name)
    else added.push(name)
  }
  return {
    mutated: removed.length > 0 || updated.length > 0 || added.length > 0,
    kept,
    added,
    updated,
    removed,
    failed,
  }
}

export function reconcileOwnTools(active, tools, { register, optionsOf, logger }) {
  const desired = new Map()
  const nextSignatures = new Map()
  for (const tool of tools) {
    desired.set(tool.name, tool)
    nextSignatures.set(tool.name, toolSignature(tool))
  }
  const removed = []
  const updated = []
  const added = []
  const kept = []
  const failed = []
  const replacedSet = new Set()
  for (const [name, record] of active) {
    const nextSig = nextSignatures.get(name)
    if (nextSig !== undefined && nextSig === record.signature) {
      kept.push(name)
      continue
    }
    active.delete(name)
    try {
      record.dispose?.()
    } catch (error) {
      logger?.warn?.(`pi-tools: cannot dispose tool "${name}": ${errorMessage(error)}`)
    }
    if (nextSig !== undefined) replacedSet.add(name)
    else removed.push(name)
  }
  for (const [name, tool] of desired) {
    if (active.has(name)) continue
    const signature = nextSignatures.get(name)
    try {
      const dispose = register(tool, optionsOf?.(tool))
      active.set(name, { signature, dispose })
      if (replacedSet.has(name)) updated.push(name)
      else added.push(name)
    } catch (error) {
      failed.push({ name, error: errorMessage(error) })
      logger?.warn?.(`pi-tools: cannot register tool "${name}": ${errorMessage(error)}`)
    }
  }
  return {
    mutated: removed.length > 0 || updated.length > 0 || added.length > 0,
    kept,
    added,
    updated,
    removed,
    failed,
  }
}
