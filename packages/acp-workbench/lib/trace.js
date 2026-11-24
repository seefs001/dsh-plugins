import { noticeReceipt } from './notices.js'
import { contextWindow, sessionTotals, recordWindow } from './usage.js'

const MAX_LOG_CHARS = 64 * 1024
const MAX_PROGRESS = 16 * 1024
const AGY_SUBAGENT_CALL_RE = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):.+$/iu

export function cliParentOf(update) {
  const id = update?._meta?.claudeCode?.parentToolUseId
  return typeof id === 'string' && id.trim() ? id : undefined
}

// external: Antigravity ACP prefixes subagent toolCallIds with "<conversationId>:<callId>" without parentToolUseId metadata
export function agySubagentIdOf(update) {
  const id = update?.toolCallId
  if (typeof id !== 'string') return undefined
  const match = AGY_SUBAGENT_CALL_RE.exec(id)
  return match ? match[1] : undefined
}

export function isSubagentLaunchTool(update) {
  const name = update?.name ?? update?._meta?.claudeCode?.toolName
  return name === 'Agent' || name === 'Task' || name === 'invoke_subagent'
}

export function recordAgySubagentLaunch(launches, update) {
  const name = update?.name ?? update?._meta?.claudeCode?.toolName
  if (name !== 'invoke_subagent' || typeof update?.toolCallId !== 'string' || !update.toolCallId) return
  if (!launches.some(entry => entry.toolCallId === update.toolCallId)) {
    launches.push({ toolCallId: update.toolCallId, boundConvId: null })
  }
}

export function resolveAgyParent(launches, parents, subagentId) {
  if (!subagentId) return undefined
  const existing = parents.get(subagentId)
  if (existing) return existing
  const unbound = launches.find(entry => !entry.boundConvId)
  if (unbound) {
    unbound.boundConvId = subagentId
    parents.set(subagentId, unbound.toolCallId)
    return unbound.toolCallId
  }
  const last = launches.at(-1)
  if (last) {
    parents.set(subagentId, last.toolCallId)
    return last.toolCallId
  }
  return undefined
}

function taskProgress(trace, update, seq, parent) {
  const input = update.sessionUpdate === 'user_message_chunk', content = update.content
  const text = content?.type === 'text' ? content.text : content?.type === 'resource' ? content.resource?.text : undefined
  const last = trace.rows.at(-1)
  if (typeof text !== 'string') {
    trace.rows.push({ kind: 'task-progress', seq, cliParent: parent, input, media: content?.mimeType || content?.type || 'content' })
  } else if (last?.kind === 'task-progress' && last.cliParent === parent && last.input === input && !last.media && trace.progressSeq === seq - 1) {
    const remaining = MAX_PROGRESS - last.text.length
    last.text += text.slice(0, remaining)
    if (text.length > remaining) last.clipped = true
  } else if (text) trace.rows.push({ kind: 'task-progress', seq, cliParent: parent, input, text: text.slice(0, MAX_PROGRESS), clipped: text.length > MAX_PROGRESS })
  trace.progressSeq = seq
}
export const defined = value => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null))
const isPlainObj = value => typeof value === 'object' && value !== null && !Array.isArray(value)

export function mergeToolUpdate(previous, update) {
  const prev = previous ?? {}
  const next = defined(update ?? {})
  const merged = { ...prev, ...next }
  if (isPlainObj(prev.rawInput) && Object.keys(prev.rawInput).length > 0 && isPlainObj(next.rawInput) && Object.keys(next.rawInput).length === 0) {
    merged.rawInput = prev.rawInput
  }
  if (Array.isArray(prev.locations) && prev.locations.length > 0 && Array.isArray(next.locations) && next.locations.length === 0) {
    merged.locations = prev.locations
  }
  if (isPlainObj(prev._meta) && isPlainObj(next._meta)) {
    merged._meta = { ...prev._meta, ...defined(next._meta) }
  }
  return merged
}

export function mergePermissionToolCall(previous, call) {
  if (!isPlainObj(call)) return previous ?? {}
  const patch = {
    kind: call.kind,
    name: call.name,
    rawInput: call.rawInput,
    locations: call.locations,
    _meta: call._meta,
  }
  const hasPrevInput = isPlainObj(previous?.rawInput) && Object.keys(previous.rawInput).length > 0
  const hasCallInput = isPlainObj(call.rawInput) && Object.keys(call.rawInput).length > 0
  if (typeof call.title === 'string' && call.title.trim() && (hasCallInput || !hasPrevInput)) {
    patch.title = call.title
  }
  return mergeToolUpdate(previous, patch)
}

function updatePatchFrame(row, update) {
  if (Array.isArray(update.content) && (row.patchFrame || ['edit','move','delete'].includes(update.kind ?? row.tool.kind) || update.content.some(b => b?.type === 'diff'))) {
    const stage = update.sessionUpdate === 'tool_call' ? 'launch' : update.status === 'completed' ? 'completed' : update.status === 'failed' ? 'failed' : 'update'
    const rawKey = ['rawOutput','rawInput'].find(k => update[k]?.call_id === update.toolCallId && update[k]?.changes)
    row.patchFrame = { stage, rawKey }
  } else if (row.patchFrame?.rawKey && update[row.patchFrame.rawKey] != null) row.patchFrame = { stage: row.patchFrame.stage }
}

// external: Codex appends terminal_output chunks while Claude Code replaces the full transcript under the same key
export function foldTerminal(row, u) {
  const id = u.toolCallId, m = u._meta, info = m?.terminal_info
  if (u.sessionUpdate === 'tool_call' && row.tool.toolCallId) row.terminal = null
  if (typeof id !== 'string' || !id || !m || row.terminal === null) return
  if (!row.terminal && info?.terminal_id === id && Array.isArray(u.content) && u.content.some(b => b?.type === 'terminal' && b.terminalId === id)) {
    const input = u.rawInput, mode = ['Bash','PowerShell'].includes(m.claudeCode?.toolName) ? 'replace'
      : input?.call_id === id && Array.isArray(input.command) && Array.isArray(input.parsed_cmd) ? 'append' : 'unknown'
    row.terminal = { id, mode, ...(typeof info.cwd === 'string' && { cwd: info.cwd }) }
  }
  const term = row.terminal
  if (!term || term.exited || (info && info.terminal_id !== id)) return
  const delta = m.terminal_output_delta, packet = delta ?? m.terminal_output
  if (packet?.terminal_id === id && typeof packet.data === 'string') {
    const append = !!delta || term.mode === 'append', old = append ? term.text ?? '' : '', limit = 32768
    term.clipped = (append && !!term.clipped) || old.length + packet.data.length > limit
    term.text = (old + packet.data.slice(-limit)).slice(-limit)
    if (!delta && term.mode === 'unknown') term.partial = true
  }
  const exit = m.terminal_exit
  if (exit?.terminal_id === id) {
    term.exited = true
    if (Number.isInteger(exit.exit_code)) term.exitCode = exit.exit_code
    if (typeof exit.signal === 'string' && exit.signal.trim()) term.signal = exit.signal
  }
  if (packet?.terminal_id === id) {
    const meta = { ...m }; delete meta.terminal_output; delete meta.terminal_output_delta
    return { ...u, _meta: meta }
  }
}

export function namedPlan(update) {
  const p = update?.sessionUpdate === 'plan_update' ? update.plan : null
  const id = update?.sessionUpdate === 'plan_removed' ? update.planId : p?.planId
  if (typeof id !== 'string' || !id.trim()) return null
  if (!p) return { id, type: 'removed' }
  if (p.type === 'markdown' && typeof p.content === 'string') return { id, type: 'markdown', content: p.content, ...(typeof p.path === 'string' && p.path && { path: p.path }) }
  if (p.type === 'items' && Array.isArray(p.entries) && p.entries.every(e => typeof e?.content === 'string' && typeof e.status === 'string')) return { id, type: 'items', entries: p.entries }
  return null
}

function compactionFacts(value) {
  if (!value || typeof value !== 'object') return null
  const facts = {}
  if (['automatic', 'idle', 'manual'].includes(value.trigger)) facts.trigger = value.trigger
  for (const name of ['preTokens', 'postTokens', 'durationMs']) if (Number.isSafeInteger(value[name]) && value[name] >= 0) facts[name] = value[name]
  return Object.keys(facts).length ? facts : null
}

function summaryPart(b, seq, index) {
  if (!b || typeof b.type !== 'string') return null
  if (b.type === 'text') return typeof b.text === 'string' ? { type: 'text', text: b.text } : null
  const r = b.type === 'resource' ? b.resource : b
  if (!r || typeof r !== 'object') return null
  const part = { type: b.type, seq, index }
  for (const key of ['mimeType', 'uri', 'name', 'description']) if (typeof r[key] === 'string') part[key] = r[key]
  if (b.type === 'resource' && typeof r.text === 'string') part.text = r.text
  return part
}

function foldCompaction(rows, entities, scope, event, update) {
  const id = update.compactionId, chunk = update.sessionUpdate === 'compaction_summary_chunk', sid = event.data.params?.sessionId
  if (typeof id !== 'string' || !id.trim() || typeof sid !== 'string' || !sid || (!chunk && (typeof update.status !== 'string' || !update.status.trim()))) return
  const part = chunk ? summaryPart(update.content, event.seq, -1) : null
  if (chunk && !part) return
  const key = JSON.stringify([scope, sid, id]); let row = entities.get(key)
  if (!row) {
    row = { kind: 'compaction', seq: event.seq, id, sid, status: 'in_progress', parts: [], replay: !!event.data.replay, turnId: event.data.turnId ?? null }
    rows.push(row); entities.set(key, row)
  }
  if (event.data.compactionOwner && event.data.compactionOwner !== event.data.turnId) row.late = true
  if (chunk) {
    const last = row.parts.at(-1)
    if (part.type === 'text' && last?.type === 'text') last.text += part.text
    else row.parts.push(part)
    return
  }
  row.status = update.status
  if (update.summary === null) row.parts = []
  else if (Array.isArray(update.summary)) row.parts = update.summary.map((entry, index) => summaryPart(entry, event.seq, index)).filter(Boolean)
  if (update.error === null || typeof update.error === 'string') row.error = update.error
  if (Object.hasOwn(update, '_meta')) {
    const meta = update._meta?.jetbrains?.air?.contextCompaction
    row.facts = meta?.version === 1 ? compactionFacts(meta) : null
    const parent = cliParentOf(update)
    row.cliParent = row.cliParent === undefined || row.cliParent === parent ? parent : null
  }
}

export function anchorCompaction(session, runtime, params, seq) {
  const u = params.update, id = u?.compactionId
  if (!session.native || runtime.replaying || !session.remoteId || params.sessionId !== session.remoteId || typeof id !== 'string' || !id.trim()) return undefined
  if (u.sessionUpdate === 'compaction_summary_chunk' ? !summaryPart(u.content, seq, -1) : u.sessionUpdate !== 'compaction_update' || typeof u.status !== 'string' || !u.status.trim()) return undefined
  const anchors = session.compactionAnchors ??= []
  let anchor = anchors.find(a => a.id === id && a.sid === params.sessionId)
  if (!anchor) {
    const owner = runtime.turnId && session.native.runs.some(r => r.id === runtime.turnId) ? runtime.turnId : null
    anchor = { id, sid: params.sessionId, owner }; anchors.push(anchor)
  } else if (anchor.owner && anchor.owner !== runtime.turnId) {
    const ranges = anchor.late ??= [], last = ranges.at(-1)
    if (last && last.to === seq - 1) last.to = seq
    else ranges.push({ from: seq, to: seq })
    const run = session.native.runs.find(r => r.id === anchor.owner)
    if (run) { run.compactionRevision = seq; session.native.compactionRevision = seq }
  }
  return anchor.owner
}

export function applyLateCompactions(trace, store, session, run) {
  const through = trace.lateThrough ?? 0
  if (!(run.compactionRevision > through)) return
  for (const a of session.compactionAnchors ?? []) {
    if (a.owner !== run.id || !a.late || !trace.compactions.has(JSON.stringify([run.id, a.sid, a.id]))) continue
    for (const { from, to } of a.late) {
      let after = Math.max(from - 1, through)
      while (after < to) {
        const page = store.events(session, after, Math.min(to - after, 200))
        for (const e of page.events) {
          const u = e.data.params?.update
          if (e.seq <= to && e.data.compactionOwner === a.owner && e.data.params?.sessionId === a.sid && u?.compactionId === a.id && !e.data.replay) foldCompaction(trace.rows, trace.compactions, run.id, e, u)
        }
        if (page.next <= after) break
        after = page.next
      }
    }
  }
  trace.lateThrough = run.compactionRevision
}

export function createTrace() {
  return { through: 0, section: 0, rows: [], tools: new Map(), plans: new Map(), compactions: new Map(), windows: new Map(), questions: new Map(), agyLaunches: [], agyParents: new Map(), log: null }
}

export function cursorTaskToolUpdate(params) {
  if (!isPlainObj(params)) return null
  const id = typeof params.toolCallId === 'string' && params.toolCallId.trim()
    ? params.toolCallId.trim()
    : typeof params.taskId === 'string' && params.taskId.trim()
      ? params.taskId.trim()
      : typeof params.id === 'string' && params.id.trim()
        ? params.id.trim()
        : null
  if (!id) return null
  const rawStatus = typeof params.status === 'string' ? params.status.toLowerCase() : ''
  const status = rawStatus === 'completed' || rawStatus === 'done' || rawStatus === 'succeeded' ? 'completed'
    : rawStatus === 'failed' || rawStatus === 'error' ? 'failed'
      : rawStatus === 'cancelled' || rawStatus === 'canceled' ? 'cancelled'
        : rawStatus === 'pending' ? 'pending' : 'in_progress'
  const description = typeof params.description === 'string' && params.description.trim()
    ? params.description.trim()
    : typeof params.title === 'string' && params.title.trim() ? params.title.trim() : 'Cursor task'
  const resultText = typeof params.result === 'string' ? params.result
    : typeof params.output === 'string' ? params.output
      : typeof params.summary === 'string' ? params.summary
        : typeof params.error === 'string' ? params.error : ''
  return {
    toolCallId: `cursor_task:${id}`,
    name: 'Agent',
    kind: 'think',
    title: description,
    status,
    rawInput: defined({
      description,
      prompt: typeof params.prompt === 'string' ? params.prompt : undefined,
      model: typeof params.model === 'string' ? params.model : undefined,
      subagent_type: typeof params.subagentType === 'string' ? params.subagentType : typeof params.type === 'string' ? params.type : undefined,
      durationMs: Number.isFinite(params.durationMs) ? params.durationMs : Number.isFinite(params.duration) ? params.duration : undefined,
    }),
    ...(resultText ? { content: [{ type: 'content', content: { type: 'text', text: resultText } }] } : {}),
  }
}

export function foldEvents(trace, events, remoteId, runId) {
  for (const event of events) {
    if (event.seq <= trace.through) continue
    trace.through = event.seq
    const data = event.data ?? {}
    if (data.replay) { trace.section = event.seq; continue }
    const update = data.method === 'session/update' ? data.params?.update : null
    const cursorMethod = data.method?.replace(/^_/, '')
    const kind = update?.sessionUpdate, plan = namedPlan(update)
    const parent = cliParentOf(update) ?? resolveAgyParent(trace.agyLaunches, trace.agyParents, agySubagentIdOf(update))
    if (kind === 'agent_message_chunk' || kind === 'agent_thought_chunk' || kind === 'user_message_chunk' || plan || kind === 'plan' ||
      cursorMethod === 'cursor/update_todos' || event.type === 'user-message') trace.section = event.seq
    if (cursorMethod === 'cursor/task') {
      const taskUpdate = cursorTaskToolUpdate(data.params)
      if (taskUpdate) {
        let row = trace.tools.get(taskUpdate.toolCallId)
        if (!row) {
          row = { kind: 'tool', seq: event.seq, section: trace.section, tool: {}, cliTask: true }
          trace.tools.set(taskUpdate.toolCallId, row)
          trace.rows.push(row)
        }
        row.tool = mergeToolUpdate(row.tool, taskUpdate)
      }
      continue
    }
    if ((kind === 'tool_call' || kind === 'tool_call_update') && update.toolCallId) {
      let row = trace.tools.get(update.toolCallId)
      if (!row) {
        row = { kind: 'tool', seq: event.seq, section: trace.section, tool: {} }
        trace.tools.set(update.toolCallId, row)
        trace.rows.push(row)
      }
      updatePatchFrame(row, update)
      if ((update.kind ?? row.tool.kind) === 'fetch' && Array.isArray(update.content)) {
        row.webFrame = update.sessionUpdate === 'tool_call' ? 'launch' : update.status === 'failed' ? 'failure' : update.status === 'completed' || update.rawOutput != null ? 'result' : 'update'
      }
      row.tool = mergeToolUpdate(row.tool, foldTerminal(row, update) ?? update)
      if (parent) row.cliParent = row.cliParent === undefined || row.cliParent === parent ? parent : null
      if (isSubagentLaunchTool(row.tool)) {
        row.cliTask = true
        recordAgySubagentLaunch(trace.agyLaunches, row.tool)
      }
    } else if (parent && (kind === 'agent_message_chunk' || kind === 'user_message_chunk')) {
      taskProgress(trace, update, event.seq, parent)
    } else if (kind === 'notice') {
      const row = data.turnId && data.turnId === runId && noticeReceipt(event, remoteId)
      if (row) { trace.rows.push(row); trace.section = event.seq }
    } else if (kind === 'compaction_update' || kind === 'compaction_summary_chunk') {
      if (data.turnId && (!Object.hasOwn(data, 'compactionOwner') || data.compactionOwner === data.turnId)) foldCompaction(trace.rows, trace.compactions, data.turnId, event, update)
      trace.section = event.seq
    } else if (plan) {
      const key = JSON.stringify(['named', plan.id])
      let row = trace.plans.get(key)
      if (!row) {
        row = { kind: 'plan', seq: event.seq, cliParent: parent }
        trace.plans.set(key, row); trace.rows.push(row)
      } else if (plan.type !== 'removed') {
        if (row.plan.type === 'removed') row.cliParent = parent
        else if (row.cliParent !== parent) row.cliParent = null
      }
      row.plan = plan
    } else if (kind === 'plan' || data.method?.replace(/^_/, '') === 'cursor/update_todos') {
      const key = JSON.stringify([data.method, data.params?.toolCallId, parent])
      let row = trace.plans.get(key)
      if (!row) {
        row = { kind: 'plan', seq: event.seq, entries: [], ...(parent ? { cliParent: parent } : {}) }
        trace.plans.set(key, row)
        trace.rows.push(row)
      }
      const entries = update?.entries ?? data.params?.todos ?? []
      row.entries = data.params?.merge ? [...new Map([...row.entries, ...entries].map(entry => [entry.id, entry])).values()] : entries
    } else if (kind === 'usage_update' && data.turnId && typeof data.params?.sessionId === 'string' && data.params.sessionId && !parent) {
      const window = contextWindow(update)
      if (window) recordWindow(trace.rows, trace.windows, data.turnId, event, window)
    } else if (event.type === 'turn-result' && data.turnId) {
      const totals = sessionTotals(data.usage)
      if (totals) trace.rows.push({ kind: 'usage-totals', seq: event.seq, totals, stopReason: data.stopReason })
    } else if (event.type === 'stderr') {
      if (!trace.log || trace.rows.at(-1) !== trace.log) {
        trace.log = { kind: 'log', seq: event.seq, text: '' }
        trace.rows.push(trace.log)
      }
      trace.log.text = (trace.log.text + (data.text ?? '')).slice(-MAX_LOG_CHARS)
    } else if (event.type === 'interaction') {
      const params = data.params ?? {}
      if (data.kind === 'permission' && params.toolCall?.toolCallId) {
        const toolRow = trace.tools.get(params.toolCall.toolCallId)
        if (toolRow) toolRow.tool = mergePermissionToolCall(toolRow.tool, params.toolCall)
      }
      if (data.kind === 'question') trace.questions.set(data.id, params.questions ?? [])
      trace.rows.push({ kind: 'interaction', seq: event.seq, id: data.id, interaction: data.kind,
        cliParent: cliParentOf(params.toolCall) ?? resolveAgyParent(trace.agyLaunches, trace.agyParents, agySubagentIdOf(params.toolCall)), title: params.toolCall?.title ?? params.name ?? params.title ?? params.message ?? null, toolCallId: params.toolCall?.toolCallId ?? null,
        options: (params.options ?? []).map(option => ({ id: option.optionId, name: option.name ?? option.optionId, kind: option.kind ?? null })) })
    } else if (event.type === 'interaction-result') {
      const outcome = data.result?.outcome ?? {}
      const questions = trace.questions.get(data.id) ?? []
      const answers = (outcome.answers ?? []).map(answer => {
        const q = questions.find(item => item.id === answer.questionId)
        return { prompt: q?.prompt ?? q?.title ?? answer.questionId, choices: (answer.selectedOptionIds ?? []).map(id => q?.options?.find(o => o.id === id)?.label ?? id) }
      })
      trace.questions.delete(data.id)
      trace.rows.push({ kind: 'answered', seq: event.seq, id: data.id, outcome: outcome.outcome ?? null, ...(data.result?.action && { formAction: data.result.action }),
        reason: outcome.reason, answers, optionId: outcome.optionId ?? null, optionName: data.optionName ?? null, optionKind: data.optionKind ?? null, automatic: data.automatic ?? null })
    } else if (event.type === 'interaction-expired') {
      trace.questions.delete(data.id)
      trace.rows.push({ kind: 'expired', seq: event.seq, id: data.id, reason: data.reason ?? null })
    } else if (event.type === 'turn-error' || event.type === 'configuration-error' || (event.type === 'lifecycle' && data.message)) {
      trace.rows.push({ kind: 'error', seq: event.seq, source: event.type, message: data.message ?? '' })
    }
  }
  return trace
}
