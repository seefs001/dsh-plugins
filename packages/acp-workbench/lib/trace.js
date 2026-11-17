/**
 * Fold one run's raw ACP events into the rows a conversation shows beside the reply:
 * tool calls merged by id, plans, chronological CLI log segments, interaction outcomes and errors.
 * Message and thought chunks are excluded because DSH renders the reply itself, and
 * `session/load` history replays are excluded because they belong to earlier turns.
 * Folding is incremental: `through` is the last sequence applied.
 */
const MAX_LOG_CHARS = 64 * 1024
const defined = value => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null))

export function createTrace() {
  return { through: 0, rows: [], tools: new Map(), plans: new Map(), log: null }
}

export function foldEvents(trace, events) {
  for (const event of events) {
    if (event.seq <= trace.through) continue
    trace.through = event.seq
    const data = event.data ?? {}
    if (data.replay) continue
    const update = data.method === 'session/update' ? data.params?.update : null
    const kind = update?.sessionUpdate
    if ((kind === 'tool_call' || kind === 'tool_call_update') && update.toolCallId) {
      let row = trace.tools.get(update.toolCallId)
      if (!row) {
        row = { kind: 'tool', seq: event.seq, tool: {} }
        trace.tools.set(update.toolCallId, row)
        trace.rows.push(row)
      }
      // ToolCallUpdate fields replace earlier values; absent or null fields keep them.
      row.tool = { ...row.tool, ...defined(update) }
    } else if (kind === 'plan' || data.method?.replace(/^_/, '') === 'cursor/update_todos') {
      const key = `${data.method}:${data.params?.toolCallId ?? ''}`
      let row = trace.plans.get(key)
      if (!row) {
        row = { kind: 'plan', seq: event.seq, entries: [] }
        trace.plans.set(key, row)
        trace.rows.push(row)
      }
      const entries = update?.entries ?? data.params?.todos ?? []
      row.entries = data.params?.merge ? [...new Map([...row.entries, ...entries].map(entry => [entry.id, entry])).values()] : entries
    } else if (event.type === 'stderr') {
      if (!trace.log || trace.rows.at(-1) !== trace.log) {
        trace.log = { kind: 'log', seq: event.seq, text: '' }
        trace.rows.push(trace.log)
      }
      trace.log.text = (trace.log.text + (data.text ?? '')).slice(-MAX_LOG_CHARS)
    } else if (event.type === 'interaction') {
      const params = data.params ?? {}
      // A permission names its tool call, so the conversation can mark that row instead of adding one.
      trace.rows.push({ kind: 'interaction', seq: event.seq, id: data.id, interaction: data.kind,
        title: params.toolCall?.title ?? params.name ?? params.title ?? null, toolCallId: params.toolCall?.toolCallId ?? null,
        options: (params.options ?? []).map(option => ({ id: option.optionId, name: option.name ?? option.optionId, kind: option.kind ?? null })) })
    } else if (event.type === 'interaction-result') {
      trace.rows.push({ kind: 'answered', seq: event.seq, id: data.id, outcome: data.result?.outcome?.outcome ?? null,
        optionId: data.result?.outcome?.optionId ?? null, automatic: data.automatic ?? null })
    } else if (event.type === 'interaction-expired') {
      trace.rows.push({ kind: 'expired', seq: event.seq, id: data.id, reason: data.reason ?? null })
    } else if (event.type === 'turn-error' || event.type === 'configuration-error' || (event.type === 'lifecycle' && data.message)) {
      trace.rows.push({ kind: 'error', seq: event.seq, source: event.type, message: data.message ?? '' })
    }
  }
  return trace
}
