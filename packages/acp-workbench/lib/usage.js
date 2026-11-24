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

function recordWindow(rows, windows, key, event, window) {
  let row = windows.get(key)
  if (!row) {
    row = { kind: 'usage-window', seq: event.seq, turnId: event.data.turnId ?? null, replay: !!event.data.replay }
    windows.set(key, row); rows.push(row)
  }
  row.window = window; row.at = event.at
}

export { contextWindow, rateLimitInfo, sessionTotals, recordWindow }
