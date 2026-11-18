/** ACP usage_update is window occupancy; session/prompt.usage is cumulative. Neither is per-request billing. */
const tokenCount = n => Number.isSafeInteger(n) && n >= 0

function contextWindow(update) {
  if (update?.sessionUpdate !== 'usage_update' || !tokenCount(update.used) || !tokenCount(update.size) || !update.size) return null
  const cost = update.cost, model = update._meta?.['_claude/model']
  return { used: update.used, size: update.size, ...(typeof model === 'string' && model.trim() && { model }), ...(Number.isFinite(cost?.amount) && cost.amount >= 0 && typeof cost.currency === 'string' && cost.currency.trim() && { cost: { amount: cost.amount, currency: cost.currency } }) }
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

export { contextWindow, sessionTotals, recordWindow }
