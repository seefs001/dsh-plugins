const tokenCount = n => Number.isSafeInteger(n) && n >= 0
const RATE_LIMIT_STATUSES = new Set(['allowed', 'allowed_warning', 'rejected'])

function normalizeIsoTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const ms = value < 1e12 ? value * 1000 : value
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  return undefined
}

function normalizeRateUtilization(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined
  // external: Anthropic unified rate-limit headers emit utilization as a 0..1 ratio, while structured /usage uses 0..100 percentages
  const percent = value <= 1 ? value * 100 : value
  return Math.round(Math.min(100, Math.max(0, percent)) * 10) / 10
}

function contextWindow(update) {
  if (update?.sessionUpdate !== 'usage_update' || !tokenCount(update.used) || !tokenCount(update.size) || !update.size) return null
  const cost = update.cost, model = update._meta?.['_claude/model']
  return { used: update.used, size: update.size, ...(typeof model === 'string' && model.trim() && { model }), ...(Number.isFinite(cost?.amount) && cost.amount >= 0 && typeof cost.currency === 'string' && cost.currency.trim() && { cost: { amount: cost.amount, currency: cost.currency } }) }
}

function rateLimitInfo(update) {
  const raw = update?.sessionUpdate === 'usage_update' ? update._meta?.['_claude/rateLimit'] : null
  if (!raw || typeof raw !== 'object') return null
  const status = RATE_LIMIT_STATUSES.has(raw.status) ? raw.status : undefined
  const rateLimitType = typeof raw.rateLimitType === 'string' && raw.rateLimitType.trim() ? raw.rateLimitType.trim() : undefined
  const usedPercent = normalizeRateUtilization(raw.utilization)
  const resetsAt = normalizeIsoTimestamp(raw.resetsAt)
  const overageStatus = RATE_LIMIT_STATUSES.has(raw.overageStatus) ? raw.overageStatus : undefined
  const overageResetsAt = normalizeIsoTimestamp(raw.overageResetsAt)
  const overageEnabled = typeof raw.overageEnabled === 'boolean' ? raw.overageEnabled : undefined
  const isUsingOverage = typeof raw.isUsingOverage === 'boolean' ? raw.isUsingOverage
    : typeof raw.overageInUse === 'boolean' ? raw.overageInUse : undefined
  if (!status && !rateLimitType && usedPercent === undefined && !overageStatus) return null
  return {
    ...(status ? { status } : {}),
    ...(rateLimitType ? { rateLimitType } : {}),
    ...(usedPercent !== undefined ? { usedPercent } : {}),
    ...(resetsAt ? { resetsAt } : {}),
    ...(overageStatus ? { overageStatus } : {}),
    ...(overageResetsAt ? { overageResetsAt } : {}),
    ...(overageEnabled !== undefined ? { overageEnabled } : {}),
    ...(isUsingOverage !== undefined ? { isUsingOverage } : {}),
  }
}

function sessionTotals(usage) {
  if (!tokenCount(usage?.totalTokens) || !tokenCount(usage.inputTokens) || !tokenCount(usage.outputTokens)) return null
  return Object.fromEntries(['totalTokens', 'inputTokens', 'outputTokens', 'cachedReadTokens', 'cachedWriteTokens', 'thoughtTokens'].filter(k => tokenCount(usage[k])).map(k => [k, usage[k]]))
}

function diffSessionTotals(current, previous) {
  if (!current) return null
  if (!previous) return current
  if (
    current.totalTokens < previous.totalTokens
    || current.inputTokens < previous.inputTokens
    || current.outputTokens < previous.outputTokens
  ) {
    return current
  }
  const delta = {
    totalTokens: current.totalTokens - previous.totalTokens,
    inputTokens: current.inputTokens - previous.inputTokens,
    outputTokens: current.outputTokens - previous.outputTokens,
  }
  for (const key of ['cachedReadTokens', 'cachedWriteTokens', 'thoughtTokens']) {
    if (tokenCount(current[key])) {
      const prev = tokenCount(previous[key]) ? previous[key] : 0
      if (current[key] < prev) return current
      delta[key] = current[key] - prev
    }
  }
  return delta
}

function toDshTokenUsage(usage) {
  if (!usage || !tokenCount(usage.totalTokens) || !tokenCount(usage.inputTokens) || !tokenCount(usage.outputTokens)) return null
  const rawIn = usage.inputTokens
  const rawOut = usage.outputTokens
  const rawTotal = usage.totalTokens
  const cacheRead = tokenCount(usage.cachedReadTokens) ? usage.cachedReadTokens : undefined
  const cacheWrite = tokenCount(usage.cachedWriteTokens) ? usage.cachedWriteTokens : undefined
  const thought = tokenCount(usage.thoughtTokens) ? usage.thoughtTokens : undefined
  const cacheSum = (cacheRead ?? 0) + (cacheWrite ?? 0)
  const thoughtSeparate = thought !== undefined
    && (rawIn + rawOut + thought === rawTotal || rawIn + cacheSum + rawOut + thought === rawTotal)
  const outputTokens = thoughtSeparate ? rawOut + thought : rawOut
  const promptBudget = rawTotal - outputTokens
  let inputTokens
  if (promptBudget === rawIn && cacheSum <= rawIn) {
    inputTokens = rawIn - cacheSum
  } else if (promptBudget === rawIn + cacheSum) {
    inputTokens = rawIn
  } else if (cacheSum <= rawIn && rawIn + outputTokens >= rawTotal) {
    inputTokens = rawIn - cacheSum
  } else {
    inputTokens = rawIn
  }
  const totalTokens = inputTokens + cacheSum + outputTokens
  if (totalTokens <= 0) return null
  return {
    inputTokens,
    outputTokens,
    totalTokens,
    ...(cacheRead !== undefined ? { cacheReadTokens: cacheRead } : {}),
    ...(cacheWrite !== undefined ? { cacheWriteTokens: cacheWrite } : {}),
    ...(thought !== undefined && thought <= outputTokens ? { reasoningTokens: thought } : {}),
  }
}

const CACHE_WARM_WINDOW_MS = 240_000

function isPerTurnUsage(current, previous, { adapter, turnUsedSum = 0, stepCount = 0 } = {}) {
  if (!current) return false
  if (adapter?.promptUsageScope === 'turn') return true
  if (stepCount > 0 && turnUsedSum > 0 && current.totalTokens === turnUsedSum) {
    if (!previous || current.totalTokens !== previous.totalTokens + turnUsedSum) return true
  }
  return false
}

function estimateStepUsage(windows, { prevPrompt = 0, prevAt = 0, isFirstOfTurn = true } = {}) {
  if (!Array.isArray(windows) || !windows.length) return null
  let inputTokens = 0
  let cacheReadTokens = 0
  let currentPrev = tokenCount(prevPrompt) ? prevPrompt : 0
  let currentAt = Number.isFinite(prevAt) && prevAt > 0 ? prevAt : 0
  let first = Boolean(isFirstOfTurn)
  for (const item of windows) {
    const used = item?.used
    if (!tokenCount(used) || used <= 0) continue
    const at = Number.isFinite(item?.at) && item.at > 0 ? item.at : 0
    const gapMs = first && currentAt > 0 && at >= currentAt ? at - currentAt : 0
    const cacheBase = first ? (currentPrev > 0 && gapMs <= CACHE_WARM_WINDOW_MS ? currentPrev : 0) : currentPrev
    const cached = Math.min(used, cacheBase)
    inputTokens += used - cached
    cacheReadTokens += cached
    currentPrev = used
    if (at > 0) currentAt = at
    first = false
  }
  const totalTokens = inputTokens + cacheReadTokens
  if (totalTokens <= 0) return null
  return {
    usage: {
      inputTokens,
      outputTokens: 0,
      totalTokens,
      cacheReadTokens,
      cacheWriteTokens: 0,
    },
    nextPrompt: currentPrev,
    nextAt: currentAt,
  }
}

function reconcileFinalStepUsage(turnUsage, emitted) {
  if (!turnUsage) return null
  if (!emitted || !tokenCount(emitted.totalTokens) || emitted.totalTokens <= 0) return turnUsage
  const remTotal = Math.max(0, turnUsage.totalTokens - emitted.totalTokens)
  if (remTotal <= 0) return null
  const rawRemOut = Math.max(0, turnUsage.outputTokens - (emitted.outputTokens ?? 0))
  const outputTokens = rawRemOut <= remTotal ? rawRemOut : (remTotal > 1 ? Math.floor(remTotal / 2) : remTotal)
  const remPrompt = remTotal - outputTokens
  const wantIn = Math.max(0, turnUsage.inputTokens - (emitted.inputTokens ?? 0))
  const wantCR = Math.max(0, (turnUsage.cacheReadTokens ?? 0) - (emitted.cacheReadTokens ?? 0))
  const wantCW = Math.max(0, (turnUsage.cacheWriteTokens ?? 0) - (emitted.cacheWriteTokens ?? 0))
  const wantSum = wantIn + wantCR + wantCW
  let inputTokens
  let cacheReadTokens
  let cacheWriteTokens
  if (wantSum === remPrompt) {
    inputTokens = wantIn
    cacheReadTokens = wantCR
    cacheWriteTokens = wantCW
  } else if (wantSum > 0) {
    cacheReadTokens = Math.min(remPrompt, Math.round(remPrompt * (wantCR / wantSum)))
    cacheWriteTokens = Math.min(remPrompt - cacheReadTokens, Math.round(remPrompt * (wantCW / wantSum)))
    inputTokens = remPrompt - cacheReadTokens - cacheWriteTokens
  } else {
    inputTokens = remPrompt
    cacheReadTokens = 0
    cacheWriteTokens = 0
  }
  const hasCacheRead = turnUsage.cacheReadTokens !== undefined || (emitted.cacheReadTokens ?? 0) > 0
  const hasCacheWrite = turnUsage.cacheWriteTokens !== undefined || (emitted.cacheWriteTokens ?? 0) > 0
  return {
    inputTokens,
    outputTokens,
    totalTokens: remTotal,
    ...(hasCacheRead ? { cacheReadTokens } : {}),
    ...(hasCacheWrite ? { cacheWriteTokens } : {}),
    ...(turnUsage.reasoningTokens !== undefined ? { reasoningTokens: Math.min(turnUsage.reasoningTokens, outputTokens) } : {}),
  }
}

function computeTps(outputTokens, decodeMs) {
  if (!tokenCount(outputTokens) || outputTokens <= 0 || typeof decodeMs !== 'number' || !Number.isFinite(decodeMs) || decodeMs <= 0) return undefined
  return Math.round((outputTokens / (decodeMs / 1000)) * 10) / 10
}

function recordWindow(rows, windows, key, event, window) {
  let row = windows.get(key)
  if (!row) {
    row = { kind: 'usage-window', seq: event.seq, turnId: event.data.turnId ?? null, replay: !!event.data.replay }
    windows.set(key, row); rows.push(row)
  }
  row.window = window; row.at = event.at
}

export {
  contextWindow,
  rateLimitInfo,
  sessionTotals,
  diffSessionTotals,
  isPerTurnUsage,
  toDshTokenUsage,
  estimateStepUsage,
  reconcileFinalStepUsage,
  computeTps,
  recordWindow,
}
