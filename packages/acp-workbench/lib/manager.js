import { randomUUID } from 'node:crypto'
import { realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, isAbsolute } from 'node:path'
import { StringDecoder } from 'node:string_decoder'
import { AcpConnection, RpcError } from './transport.js'
import { WorkbenchStore } from './store.js'
import { advertisedModels, advertisedModes, inputModalities, resolveInitialConfigOptions, resolveModeId } from './models.js'
import { extractAgentMeta, extractToolStartInput, resolveAdapter } from './adapters.js'
import { contextWindow, rateLimitInfo } from './usage.js'
import {
  accountFromAuthStatus,
  buildClaudeSubscription,
  computeLocalUsageByProvider,
  mergeRateLimitIntoSubscription,
  normalizeAntigravityUsage,
  normalizeCodexRateLimits,
  normalizeCursorCliUsage,
  probeCodexAppServer,
  runJsonCli,
} from './subscription.js'
import { rememberNotice } from './notices.js'
import { formFields, formResponse, urlElicitation, urlResponse } from './forms.js'
import { activityOf } from './activity.js'
import { agySubagentIdOf, anchorCompaction, cliParentOf } from './trace.js'
import { defaultProviders, resolveProviderTemplates } from './templates.js'

export { advertisedModels }

const ACTIVE = new Set(['starting', 'idle', 'running', 'waiting', 'canceling'])
const now = () => new Date().toISOString()
const str = (value, name, max = 1000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${name} must be non-empty text (max ${max})`)
  return value.trim()
}
const MAX_MODELS = 200
const MAX_HIDDEN_MODELS = 500
const MAX_PROBE_MODELS = 24
const MAX_ADDITIONAL_DIRS = 32
const MAX_EXCLUDED_MCP_SERVERS = 64
const MCP_SERVER_NAME_RE = /^[A-Za-z0-9_-]{1,64}$/u
const MAX_SYSTEM_PROMPT_APPEND = 16_384
const CLIENT_CAPABILITY_META = { parameterizedModelPicker: true }
const ASYNC_WAKEUP_SETTLE_MS = 1_500
const ASYNC_WAKEUP_SILENT_SETTLE_MS = 15_000
const ASYNC_WAKEUP_IDLE_TIMEOUT_MS = 120_000
const ASYNC_WAKEUP_TERMINAL_ALERT_RE = /^\s*(?:⚠|⚠️)\s*(?:individual\s+quota\s+reached|quota\s+(?:reached|exceeded|limit)|rate\s+limit)/iu
const DEFAULT_PROBE_TIMEOUT_MS = 90_000
const AGY_VERSION_TIMEOUT_MS = 8_000
const AGY_VERSION_CACHE_LIMIT = 32
const MIN_AGY_VERSION = [1, 5, 1]
const MIN_AGY_VERSION_LABEL = '1.5.1'

function parseSemverTriplet(text) {
  const match = /\b(\d+)\.(\d+)\.(\d+)\b/u.exec(String(text ?? ''))
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function isVersionAtLeast(actual, minimum) {
  for (let i = 0; i < 3; i++) {
    if (actual[i] !== minimum[i]) return actual[i] > minimum[i]
  }
  return true
}

async function statSignature(filePath) {
  if (typeof filePath !== 'string' || !filePath) return null
  try {
    const info = await stat(filePath)
    return `${info.mtimeMs}:${info.size}`
  } catch {
    return null
  }
}
const CHUNK_PRUNE_INTERVAL_MS = 15 * 60 * 1000
const BACKGROUND_TASK_PROMOTE_MS = 5_000
const MAX_BACKGROUND_TASKS = 40
const MAX_TASK_LABEL_CHARS = 200
const MAX_TASK_COMMAND_CHARS = 2_000
const MAX_TASK_OUTPUT_CHARS = 16_384
const COMMAND_TOOL_NAMES = new Set(['run_command', 'Bash', 'PowerShell', 'Shell', 'exec_command'])
const SUBAGENT_TOOL_NAMES = new Set(['invoke_subagent', 'Agent', 'Task'])
const IMMEDIATE_BACKGROUND_NAMES = new Set(['schedule', 'run_workflow', 'invoke_subagent'])
const BG_TASK_ID_RE = /task id:\s*([^\s\r\n]+)/iu
const EXIT_CODE_RE = /^Command exited with code (\d+)\./mu

function isDaemonToolCall(update) {
  const input = update?.args ?? update?.rawInput
  if (input && typeof input === 'object' && input.IsDaemon === true) return true
  if (update?.name === 'schedule' && !(input && typeof input === 'object' && typeof input.DurationSeconds === 'number')) return true
  return false
}

function clipTaskText(value, limit, fromEnd = false) {
  if (typeof value !== 'string') return ''
  if (value.length <= limit) return value
  return fromEnd ? value.slice(-limit) : `${value.slice(0, limit - 1)}…`
}

function firstTaskLine(value, limit = MAX_TASK_LABEL_CHARS) {
  if (typeof value !== 'string') return ''
  for (const line of value.split(/\r?\n/u)) {
    const clean = line.trim().replace(/\s+/gu, ' ')
    if (clean) return clipTaskText(clean, limit)
  }
  return ''
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function taskInputOf(update) {
  const input = update?.args ?? update?.rawInput
  return input && typeof input === 'object' && !Array.isArray(input) ? input : null
}

function taskToolNameOf(update) {
  return firstNonEmptyString(update?.name, update?._meta?.claudeCode?.toolName)
}

function taskOutputTextOf(update) {
  const raw = update?.rawOutput
  if (typeof raw === 'string' && raw) return raw
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    if (typeof raw.output === 'string' && raw.output) return raw.output
    const parts = [raw.stdout, raw.stderr, raw.text, raw.result, raw.error].filter(v => typeof v === 'string' && v)
    if (parts.length) return parts.join('\n')
  }
  if (Array.isArray(update?.content)) {
    const parts = []
    for (const block of update.content) {
      if (block?.type === 'content' && block.content?.type === 'text' && typeof block.content.text === 'string') {
        parts.push(block.content.text)
      } else if (block?.type === 'text' && typeof block.text === 'string') {
        parts.push(block.text)
      }
    }
    if (parts.length) return parts.join('\n')
  }
  return ''
}

function taskExitCodeOf(update, outputText) {
  const raw = update?.rawOutput
  if (raw && typeof raw === 'object') {
    if (Number.isInteger(raw.exit_code)) return raw.exit_code
    if (Number.isInteger(raw.exitCode)) return raw.exitCode
  }
  if (typeof outputText === 'string' && outputText) {
    const match = EXIT_CODE_RE.exec(outputText)
    if (match) return Number(match[1])
  }
  return null
}

function taskKindOf(update, input, name) {
  if (isDaemonToolCall(update)) return 'daemon'
  if (name === 'schedule') return 'schedule'
  if (name === 'run_workflow') return 'workflow'
  if (SUBAGENT_TOOL_NAMES.has(name)) return 'subagent'
  if (COMMAND_TOOL_NAMES.has(name) || update?.kind === 'execute') return 'command'
  return 'task'
}

function isTrackableBackgroundCandidate(update, input, name) {
  if (name === 'manage_task') return false
  if (isDaemonToolCall(update) || input?.run_in_background === true) return true
  if (IMMEDIATE_BACKGROUND_NAMES.has(name)) return true
  if (COMMAND_TOOL_NAMES.has(name) || update?.kind === 'execute') return true
  return false
}

function isImmediateBackgroundTask(update, input, name) {
  return isDaemonToolCall(update) || input?.run_in_background === true || IMMEDIATE_BACKGROUND_NAMES.has(name)
}

function taskLabelOf(update, input, name) {
  let raw = ''
  if (SUBAGENT_TOOL_NAMES.has(name)) {
    raw = firstNonEmptyString(input?.Role, input?.description, input?.TypeName, update?.title, name)
  } else if (name === 'schedule') {
    const timer = typeof input?.DurationSeconds === 'number' && Number.isFinite(input.DurationSeconds) ? `Timer (${input.DurationSeconds}s)` : ''
    raw = firstNonEmptyString(input?.Prompt, input?.CronExpression, timer, update?.title, name)
  } else if (name === 'run_workflow') {
    raw = firstNonEmptyString(input?.Description, input?.ScriptPath, update?.title, name)
  } else {
    raw = firstNonEmptyString(input?.toolSummary, input?.description, input?.CommandLine, input?.command, update?.title, name)
  }
  return firstTaskLine(raw) || name || 'Background task'
}

function taskCommandOf(update, input, name, label) {
  let raw = ''
  if (SUBAGENT_TOOL_NAMES.has(name)) {
    raw = firstNonEmptyString(input?.Prompt, input?.prompt, input?.Role, update?.title, label)
  } else if (name === 'schedule') {
    raw = firstNonEmptyString(input?.Prompt, input?.CronExpression, update?.title, label)
  } else if (name === 'run_workflow') {
    raw = firstNonEmptyString(input?.Description, input?.ScriptPath, update?.title, label)
  } else {
    const startCmd = extractToolStartInput(update)?.command
    raw = firstNonEmptyString(input?.CommandLine, input?.command, startCmd, update?.title, label)
  }
  return clipTaskText(raw || label, MAX_TASK_COMMAND_CHARS)
}

function serializeBackgroundTask(entry) {
  return {
    id: entry.id,
    toolCallId: entry.toolCallId,
    name: entry.name,
    kind: entry.kind,
    label: entry.label,
    command: entry.command,
    status: entry.status,
    isDaemon: entry.isDaemon,
    taskId: entry.taskId,
    startedAt: entry.startedAt,
    finishedAt: entry.finishedAt,
    exitCode: entry.exitCode,
    output: entry.output,
    outputTruncated: entry.outputTruncated,
    turnId: entry.turnId,
  }
}

export function summary(session, runtime) {
  const { id, providerId, title, cwd, state, remoteId, createdAt, updatedAt, archived, eventSeq, lastError, stopReason } = session
  return { id, providerId, title, cwd, state, remoteId, createdAt, updatedAt, archived, eventSeq, lastError, stopReason,
    activity: activityOf(session, runtime),
    reviewRevision: session.native ? [session.native.runs.at(-1)?.id, session.native.runs.at(-1)?.state, session.native.runs.at(-1)?.messageId, session.native.reviewVersion].join(':') : null,
    native: session.native ? { sessionId: session.native.sessionId, rootSessionId: session.native.rootSessionId, parentSessionId: session.native.parentSessionId, route: session.native.route, retired: !!session.native.retired } : null }
}

const CLIENT_INFO = { name: 'dsh-acp-workbench', version: '0.2.0' }
const DEFAULT_IDLE_DISCONNECT_MS = 15 * 60_000
const DEFAULT_MAX_IDLE_RUNTIMES = 4
const LOCAL_USAGE_CACHE_TTL_MS = 60_000
const STREAM_NOTIFY_MS = 400
const TRACE_DIRECT_TYPES = new Set(['turn-result', 'stderr', 'interaction', 'interaction-result', 'interaction-expired', 'turn-error', 'configuration-error'])
const TERMINAL_UPDATE_STATUS = new Set(['completed', 'failed', 'cancelled', 'canceled'])

function affectsTrace(type, data) {
  if (TRACE_DIRECT_TYPES.has(type)) return true
  if (type === 'lifecycle') return Boolean(data?.message)
  if (type !== 'notification' || data?.replay) return false
  const cursorMethod = data.method?.replace(/^_/u, '')
  if (cursorMethod === 'cursor/task' || cursorMethod === 'cursor/update_todos') return true
  if (data.method !== 'session/update') return false
  const update = data.params?.update
  const kind = update?.sessionUpdate
  if (!kind) return false
  if (kind === 'agent_message_chunk' || kind === 'user_message_chunk') return Boolean(cliParentOf(update))
  if (kind === 'agent_thought_chunk') return false
  return kind === 'tool_call'
    || kind === 'tool_call_update'
    || kind === 'notice'
    || kind === 'compaction_update'
    || kind === 'compaction_summary_chunk'
    || kind === 'plan'
    || kind === 'plan_update'
    || kind === 'plan_removed'
    || kind === 'usage_update'
}

function notificationNotifyMode(method, params, replaying) {
  if (replaying) return 'none'
  if (method === '$/cancel_request' || method === 'session/complete_elicitation') return 'state'
  const cursorMethod = method?.replace(/^_/u, '')
  if (cursorMethod === 'cursor/update_todos' || cursorMethod === 'cursor/task') return 'state'
  if (method !== 'session/update') return 'none'
  const update = params?.update
  const kind = update?.sessionUpdate
  if (!kind) return 'none'
  if (kind === 'agent_message_chunk' || kind === 'agent_thought_chunk' || kind === 'user_message_chunk') {
    return cliParentOf(update) ? 'stream' : 'none'
  }
  if (kind === 'compaction_summary_chunk') return 'stream'
  if (kind === 'tool_call_update') {
    if (TERMINAL_UPDATE_STATUS.has(update.status)) return 'state'
    if (Array.isArray(update.content) && update.content.some(item => item?.type === 'diff')) return 'state'
    if (update.rawInput && typeof update.rawInput === 'object' && Object.keys(update.rawInput).length > 0) return 'state'
    return 'stream'
  }
  return 'state'
}

export class Workbench {
  constructor({
    domain,
    subprocess,
    changed,
    modelsChanged,
    log,
    autoApprove,
    mcpServersFor,
    hostBridgePromptFor,
    onInteractionOpen,
    onInteractionClose,
    asyncWakeup,
    backgroundTaskPromoteMs,
    idleDisconnectMs,
    maxIdleRuntimes,
    chunkRetentionDays,
    archivedChunkRetentionDays,
    maxChunkBytes,
  }) {
    this.subprocess = subprocess
    this.changed = changed
    this.modelsChanged = modelsChanged
    this.log = log
    this.autoApprove = autoApprove
    this.mcpServersFor = mcpServersFor
    this.hostBridgePromptFor = hostBridgePromptFor
    this.onInteractionOpen = onInteractionOpen
    this.onInteractionClose = onInteractionClose
    this.agyVersionCache = new Map()
    this.agyVersionInFlight = new Map()
    this.asyncWakeupSettleMs = asyncWakeup?.settleMs ?? ASYNC_WAKEUP_SETTLE_MS
    this.asyncWakeupSilentSettleMs = asyncWakeup?.silentSettleMs ?? ASYNC_WAKEUP_SILENT_SETTLE_MS
    this.asyncWakeupIdleTimeoutMs = asyncWakeup?.idleTimeoutMs ?? ASYNC_WAKEUP_IDLE_TIMEOUT_MS
    this.backgroundTaskPromoteMs = Number.isFinite(backgroundTaskPromoteMs) && backgroundTaskPromoteMs >= 0 ? backgroundTaskPromoteMs : BACKGROUND_TASK_PROMOTE_MS
    this.idleDisconnectMs = idleDisconnectMs ?? DEFAULT_IDLE_DISCONNECT_MS
    this.maxIdleRuntimes = maxIdleRuntimes ?? DEFAULT_MAX_IDLE_RUNTIMES
    this.chunkRetentionDays = Number.isFinite(chunkRetentionDays) && chunkRetentionDays >= 0 ? chunkRetentionDays : undefined
    this.archivedChunkRetentionDays = Number.isFinite(archivedChunkRetentionDays) && archivedChunkRetentionDays >= 0 ? archivedChunkRetentionDays : undefined
    this.maxChunkBytes = Number.isFinite(maxChunkBytes) && maxChunkBytes >= 0 ? maxChunkBytes : undefined
    this.runtimes = new Map()
    this.listeners = new Map()
    this.probes = new Set()
    this.authByProvider = new Map()
    this.probeByProvider = new Map()
    this.streamNotifyTimers = new Map()
    this.localUsageCache = null
    this.localUsageCacheAt = 0
    this.chunkPruneTimer = null
    this.pruningChunks = false
    this.lastChunkPruneAt = 0
    this.closed = false
    this.store = new WorkbenchStore(domain, error => {
      this.log?.(`ACP storage: ${error.message}`)
      this.changed()
    })
  }

  async initialize() {
    const global = this.store.domain.global.get()
    if (!global.initialized) {
      for (const provider of defaultProviders()) {
        if (!this.store.providers.has(provider.id)) await this.store.saveProvider(provider)
      }
      await this.store.domain.global.set({ ...global, initialized: true })
    }
    for (const session of this.store.sessions.values()) {
      if (ACTIVE.has(session.state)) {
        const idle = session.state === 'idle'
        session.state = 'disconnected'
        session.lastError = idle ? null : 'Host restarted; reconnect explicitly to resume this conversation.'
        this.store.append(session, 'lifecycle', { state: 'disconnected', reason: 'host-restart' })
        await this.store.saveSession(session)
      }
    }
    await this.store.flush()
    await this.pruneStorageChunks()
    if (!this.closed && !this.chunkPruneTimer) {
      this.chunkPruneTimer = setInterval(() => {
        void this.pruneStorageChunks().catch(error => this.log?.(`ACP storage prune: ${error.message}`))
      }, CHUNK_PRUNE_INTERVAL_MS)
      this.chunkPruneTimer.unref?.()
    }
  }

  async pruneStorageChunks() {
    if (this.closed || this.pruningChunks) return null
    this.pruningChunks = true
    try {
      const pruned = await this.store.pruneChunks({
        ...(this.chunkRetentionDays !== undefined ? { maxAgeDays: this.chunkRetentionDays } : {}),
        ...(this.archivedChunkRetentionDays !== undefined ? { archivedMaxAgeDays: this.archivedChunkRetentionDays } : {}),
        ...(this.maxChunkBytes !== undefined ? { maxTotalBytes: this.maxChunkBytes } : {}),
        activeSessionIds: new Set(this.runtimes.keys()),
      })
      if (pruned.deletedChunks > 0) {
        this.log?.(`ACP storage pruned ${pruned.deletedChunks} chunk(s) across ${pruned.deletedSessions} session(s) (${Math.round(pruned.freedBytes / 1024)} KiB)`)
      }
      return pruned
    } finally {
      this.pruningChunks = false
      this.lastChunkPruneAt = Date.now()
    }
  }

  provider(id) {
    const provider = this.store.providers.get(id)
    if (!provider) throw new Error('Unknown ACP provider')
    return provider
  }

  session(id) {
    const session = this.store.sessions.get(id)
    if (!session) throw new Error('Unknown workbench session')
    return session
  }

  invalidateLocalUsageCache() {
    this.localUsageCache = null
    this.localUsageCacheAt = 0
  }

  localUsageSnapshot() {
    const nowMs = Date.now()
    if (this.localUsageCache && nowMs - this.localUsageCacheAt < LOCAL_USAGE_CACHE_TTL_MS) {
      return this.localUsageCache
    }
    this.localUsageCache = computeLocalUsageByProvider(this.store.sessions.values(), nowMs)
    this.localUsageCacheAt = nowMs
    return this.localUsageCache
  }

  notifyStream(sessionId, delayMs = STREAM_NOTIFY_MS) {
    if (this.closed || typeof sessionId !== 'string' || !sessionId) return
    if (this.streamNotifyTimers.has(sessionId)) return
    const timer = setTimeout(() => {
      this.streamNotifyTimers.delete(sessionId)
      if (!this.closed) this.changed(sessionId)
    }, delayMs)
    timer.unref?.()
    this.streamNotifyTimers.set(sessionId, timer)
  }

  clearStreamNotify(sessionId) {
    const timer = this.streamNotifyTimers.get(sessionId)
    if (!timer) return
    clearTimeout(timer)
    this.streamNotifyTimers.delete(sessionId)
  }

  snapshot() {
    const activeByProvider = {}
    let recentCwd = ''
    let recentAt = ''
    for (const session of this.store.sessions.values()) {
      if (session.cwd && (!recentAt || session.updatedAt > recentAt)) {
        recentCwd = session.cwd
        recentAt = session.updatedAt
      }
      const runtime = this.runtimes.get(session.id)
      if (!runtime || runtime.closing) continue
      const bucket = activeByProvider[session.providerId] ?? { connected: 0, working: 0, waiting: 0 }
      bucket.connected += 1
      if (runtime.interactions.size > 0 || session.state === 'waiting') bucket.waiting += 1
      else if (runtime.turnId || session.state === 'running' || session.state === 'starting') bucket.working += 1
      activeByProvider[session.providerId] = bucket
    }
    return {
      providers: [...this.store.providers.values()],
      providerTemplates: resolveProviderTemplates(),
      activeByProvider,
      authByProvider: Object.fromEntries(this.authByProvider),
      probeByProvider: Object.fromEntries(this.probeByProvider),
      localUsageByProvider: this.localUsageSnapshot(),
      defaultCwd: recentCwd || homedir(),
      storageError: this.store.failure?.message ?? null,
    }
  }

  backgroundTasksOf(session) {
    const runtime = this.runtimes.get(session.id)
    if (!runtime || runtime.closing || !runtime.backgroundTasks?.size) return []
    const items = []
    for (const entry of runtime.backgroundTasks.values()) {
      if (entry.visible) items.push(serializeBackgroundTask(entry))
    }
    return items
  }

  overview(session) {
    const runtime = this.runtimes.get(session.id)
    const interactions = runtime && !runtime.closing && !runtime.canceling
      ? [...runtime.interactions.values()]
        .filter(item => !item.responding)
        .map(item => item.fields
          ? { ...item.public, fields: item.fields }
          : item.urlInfo
            ? { ...item.public, urlInfo: item.urlInfo }
            : item.public)
      : []
    return { ...summary(session, runtime), interactions, backgroundTasks: this.backgroundTasksOf(session) }
  }

  // external: ACP session/new may emit available_commands_update before returning its sessionId
  commandReport(session) {
    const rt = this.runtimes.get(session.id)
    return rt && !rt.closing && session.remoteId ? rt.commandReports?.get(session.remoteId) : null
  }

  detail(session) {
    const report = this.commandReport(session)
    return { ...this.overview(session), capabilities: session.capabilities ?? {}, agentMeta: session.agentMeta ?? null, authMethods: session.authMethods ?? [], modes: session.modes ?? null,
      models: session.models ?? null, configOptions: session.configOptions ?? [], commands: report?.commands ?? [], commandStamp: report?.stamp ?? null, usage: session.lastContext?.window ?? null,
      injectedMcp: session.injectedMcp ?? [],
      additionalDirectories: session.additionalDirectories ?? [],
      systemPromptAppendApplied: Boolean(session.systemPromptAppendApplied),
      storageError: this.store.failure?.message ?? null }
  }

  record(session, type, data, { notify = true, workbench = false } = {}) {
    const event = this.store.append(session, type, data)
    if (affectsTrace(type, data) && session.native?.runs?.length) {
      const turnId = data?.turnId
      const targetRun = turnId
        ? session.native.runs.findLast(item => item.id === turnId) ?? session.native.runs.at(-1)
        : session.native.runs.at(-1)
      if (targetRun) targetRun.traceVersion = (targetRun.traceVersion ?? 0) + 1
    }
    if (type === 'turn-result') this.invalidateLocalUsageCache()
    if (notify === 'stream') this.notifyStream(session.id)
    else if (notify) this.changed(session.id, undefined, workbench ? { workbench: true } : undefined)
    for (const listener of this.listeners.get(session.id) ?? []) listener(event)
    return event
  }

  subscribe(sessionId, listener) {
    const listeners = this.listeners.get(sessionId) ?? new Set()
    listeners.add(listener)
    this.listeners.set(sessionId, listeners)
    return () => {
      listeners.delete(listener)
      if (!listeners.size) this.listeners.delete(sessionId)
    }
  }

  clearIdleTimer(runtime) {
    if (!runtime) return
    clearTimeout(runtime.idleTimer)
    runtime.idleTimer = null
    runtime.idleSince = 0
  }

  canAutoReap(session, runtime) {
    if (!session || !runtime || runtime.closing || runtime.shutdown) return false
    if (session.state !== 'idle' || runtime.turnId || runtime.interactions.size > 0) return false
    if (!session.remoteId) return false
    return Boolean(session.capabilities?.sessionCapabilities?.resume || session.capabilities?.loadSession)
  }

  scheduleIdleReap(session) {
    const runtime = this.runtimes.get(session.id)
    if (!runtime) return
    this.clearIdleTimer(runtime)
    if (!this.canAutoReap(session, runtime)) return
    runtime.idleSince = Date.now()
    if (this.idleDisconnectMs > 0) {
      runtime.idleTimer = setTimeout(() => {
        if (this.isCurrent(session, runtime) && this.canAutoReap(session, runtime)) {
          void this.disconnect(session, 'idle-timeout').catch(error => this.log?.(error.message))
        }
      }, this.idleDisconnectMs)
      runtime.idleTimer.unref?.()
    }
    if (Number.isFinite(this.maxIdleRuntimes) && this.maxIdleRuntimes >= 0) {
      const candidates = []
      for (const [id, candidateRuntime] of this.runtimes) {
        if (id === session.id) continue
        const candidateSession = this.store.sessions.get(id)
        if (this.canAutoReap(candidateSession, candidateRuntime)) {
          candidates.push({ session: candidateSession, idleSince: candidateRuntime.idleSince || 0 })
        }
      }
      const totalIdle = candidates.length + 1
      if (totalIdle > this.maxIdleRuntimes) {
        candidates.sort((a, b) => a.idleSince - b.idleSince)
        const overflow = totalIdle - this.maxIdleRuntimes
        for (const item of candidates.slice(0, overflow)) {
          void this.disconnect(item.session, 'idle-evicted').catch(error => this.log?.(error.message))
        }
      }
    }
  }

  async transition(session, state, detail = {}) {
    session.state = state
    if (state === 'idle') this.scheduleIdleReap(session)
    else this.clearIdleTimer(this.runtimes.get(session.id))
    this.record(session, 'lifecycle', { state, ...detail }, { workbench: true })
    if (this.store.dirty?.size > 0) {
      await this.store.flush()
    } else {
      await this.store.saveSession(session)
      await this.store.flush()
    }
  }

  async directory(value) {
    if (!isAbsolute(str(value, 'cwd', 4096))) throw new Error('cwd must be absolute')
    const cwd = await realpath(value)
    if (!(await stat(cwd)).isDirectory()) throw new Error('cwd is not a directory')
    return cwd
  }

  async operate(op) {
    if (!op || typeof op !== 'object' || Array.isArray(op)) throw new Error('Expected an operation object')
    if (this.closed) throw new Error('ACP Workbench is unloading')
    switch (op.action) {
      case 'list': return this.snapshot()
      case 'provider-save': return this.saveProvider(op.provider)
      case 'provider-remove': {
        const provider = this.provider(op.providerId)
        if ([...this.store.sessions.values()].some(s => s.providerId === provider.id && this.runtimes.has(s.id))) throw new Error('Disconnect this provider’s sessions first')
        await this.store.removeProvider(provider.id)
        this.probeByProvider.delete(provider.id)
        this.changed()
        return { removed: provider.id }
      }
      case 'diagnose': return this.probe(op.providerId, op.cwd, 'diagnose')
      case 'models': return this.probe(op.providerId, op.cwd, 'models')
      case 'discover': return this.probe(op.providerId, op.cwd, 'discover', op.cursor)
      case 'usage': return this.refreshUsage(op.providerId, op.cwd)
      case 'auth-login': return this.authenticate(op.providerId, op.methodId, op.cwd)
      case 'auth-logout': return this.logout(op.providerId, op.cwd)
      default: break
    }
    const session = this.session(op.sessionId)
    switch (op.action) {
      case 'get': return this.detail(session)
      case 'events':
        if (!Number.isSafeInteger(op.after ?? 0) || (op.after ?? 0) < 0 || !Number.isSafeInteger(op.limit ?? 80) || (op.limit ?? 80) < 1) throw new Error('after must be a non-negative integer and limit a positive integer')
        return this.store.events(session, op.after ?? 0, op.limit ?? 80)
      case 'disconnect':
        if (op.unlessRunning && activityOf(session, this.runtimes.get(session.id)).stopId) throw new Error('A turn is now active; stop it explicitly before disconnecting')
        await this.disconnect(session); return this.detail(session)
      case 'respond': return this.respond(session, op)
      case 'configure': return this.configure(session, op)
      case 'rename': session.title = str(op.title, 'title', 160); break
      case 'archive':
        if (this.runtimes.has(session.id)) throw new Error('Disconnect before archiving')
        session.archived = true
        session.archivedAt = now()
        this.invalidateLocalUsageCache()
        break
      case 'restore':
        session.archived = false
        delete session.archivedAt
        this.invalidateLocalUsageCache()
        break
      default: throw new Error(`Unknown ACP action: ${op.action}`)
    }
    session.updatedAt = now()
    await this.store.saveSession(session)
    this.changed(session.id)
    return this.detail(session)
  }

  async saveProvider(raw) {
    const id = str(raw?.id, 'provider.id', 60)
    if (!/^[a-z][a-z0-9-]*$/.test(id)) throw new Error('Provider id must use lowercase letters, digits and hyphens')
    const command = str(raw.command, 'command', 4096)
    if (!Array.isArray(raw.args) || raw.args.some(x => typeof x !== 'string' || x.length > 4096)) throw new Error('args must be an array of strings')
    if (raw.args.length > 64) throw new Error('Too many command arguments')
    const models = raw.models ?? []
    if (!Array.isArray(models) || models.length > MAX_MODELS) throw new Error(`models must be an array of at most ${MAX_MODELS} entries`)
    const seen = new Set()
    const cleanModels = models.map(model => {
      const modelId = str(model?.id, 'model id', 200)
      if (modelId === 'default') throw new Error('"default" is reserved for the CLI default model')
      if (seen.has(modelId)) throw new Error(`Duplicate model id: ${modelId}`)
      seen.add(modelId)
      return { id: modelId, name: model.name?.trim() ? str(model.name, 'model name', 200) : modelId }
    })
    const previous = this.store.providers.get(id)
    const rawHidden = raw.hiddenModels === undefined ? previous?.hiddenModels ?? [] : raw.hiddenModels
    if (!Array.isArray(rawHidden) || rawHidden.length > MAX_HIDDEN_MODELS || rawHidden.some(item => typeof item !== 'string' || !item.trim() || item.length > 200)) {
      throw new Error(`hiddenModels must be an array of at most ${MAX_HIDDEN_MODELS} model ids`)
    }
    const hiddenModels = [...new Set(rawHidden.map(item => item.trim()))]
    const rawLegacyModes = raw.legacyModes === undefined ? previous?.legacyModes : raw.legacyModes
    let legacyModes
    if (rawLegacyModes !== undefined && rawLegacyModes !== null) {
      if (typeof rawLegacyModes !== 'object' || Array.isArray(rawLegacyModes)) {
        throw new Error('legacyModes must be an object mapping old mode ids to target mode ids')
      }
      const cleanLegacy = {}
      for (const [oldId, targetId] of Object.entries(rawLegacyModes)) {
        cleanLegacy[str(oldId, 'legacy mode id', 100)] = str(targetId, 'target mode id', 100)
      }
      if (Object.keys(cleanLegacy).length) legacyModes = cleanLegacy
    }
    const rawContextPolicy = raw.contextPolicy === undefined ? previous?.contextPolicy : raw.contextPolicy
    let contextPolicy
    if (rawContextPolicy !== undefined && rawContextPolicy !== null) {
      if (typeof rawContextPolicy !== 'object' || Array.isArray(rawContextPolicy)) {
        throw new Error('contextPolicy must be an object')
      }
      const cleanPolicy = {}
      for (const key of ['agentInstructions', 'timeContext', 'nowledgeContext']) {
        if (rawContextPolicy[key] !== undefined) {
          if (typeof rawContextPolicy[key] !== 'boolean') throw new Error(`contextPolicy.${key} must be a boolean`)
          if (rawContextPolicy[key] === false) cleanPolicy[key] = false
        }
      }
      if (rawContextPolicy.systemPromptAppend !== undefined) {
        if (typeof rawContextPolicy.systemPromptAppend !== 'boolean') throw new Error('contextPolicy.systemPromptAppend must be a boolean')
        if (rawContextPolicy.systemPromptAppend === true) cleanPolicy.systemPromptAppend = true
      }
      if (Object.keys(cleanPolicy).length) contextPolicy = cleanPolicy
    }
    const rawExtraDirs = raw.additionalDirectories === undefined ? previous?.additionalDirectories : raw.additionalDirectories
    let additionalDirectories
    if (rawExtraDirs !== undefined && rawExtraDirs !== null) {
      if (!Array.isArray(rawExtraDirs) || rawExtraDirs.length > MAX_ADDITIONAL_DIRS) {
        throw new Error(`additionalDirectories must be an array of at most ${MAX_ADDITIONAL_DIRS} absolute directory paths`)
      }
      const cleanDirs = []
      const seenDirs = new Set()
      for (const entry of rawExtraDirs) {
        if (typeof entry !== 'string' || entry.length > 4096) throw new Error('Each additional directory must be a path string')
        const trimmed = entry.trim()
        if (!trimmed) continue
        if (!isAbsolute(trimmed)) throw new Error(`Additional directory must be an absolute path: ${trimmed}`)
        if (!seenDirs.has(trimmed)) {
          seenDirs.add(trimmed)
          cleanDirs.push(trimmed)
        }
      }
      if (cleanDirs.length) additionalDirectories = cleanDirs
    }
    const rawExcludedMcp = raw.excludedMcpServers === undefined ? previous?.excludedMcpServers : raw.excludedMcpServers
    let excludedMcpServers
    if (rawExcludedMcp !== undefined && rawExcludedMcp !== null) {
      if (!Array.isArray(rawExcludedMcp) || rawExcludedMcp.length > MAX_EXCLUDED_MCP_SERVERS) {
        throw new Error(`excludedMcpServers must be an array of at most ${MAX_EXCLUDED_MCP_SERVERS} server names`)
      }
      const cleanExcluded = []
      const seenExcluded = new Set()
      for (const entry of rawExcludedMcp) {
        if (typeof entry !== 'string') throw new Error('Each excluded MCP server name must be a string')
        const trimmed = entry.trim()
        if (!trimmed) continue
        if (!MCP_SERVER_NAME_RE.test(trimmed)) {
          throw new Error(`Invalid excluded MCP server name: ${trimmed}`)
        }
        if (!seenExcluded.has(trimmed)) {
          seenExcluded.add(trimmed)
          cleanExcluded.push(trimmed)
        }
      }
      if (cleanExcluded.length) excludedMcpServers = cleanExcluded
    }
    const rawSystemAppend = raw.systemPromptAppend === undefined ? previous?.systemPromptAppend : raw.systemPromptAppend
    let systemPromptAppend
    if (rawSystemAppend !== undefined && rawSystemAppend !== null) {
      if (typeof rawSystemAppend !== 'string') throw new Error('systemPromptAppend must be a string')
      const trimmed = rawSystemAppend.trim()
      if (trimmed.length > MAX_SYSTEM_PROMPT_APPEND) {
        throw new Error(`systemPromptAppend must be at most ${MAX_SYSTEM_PROMPT_APPEND} characters`)
      }
      if (trimmed) systemPromptAppend = trimmed
    }
    const provider = { id, label: str(raw.label, 'label', 100), command, args: raw.args, models: cleanModels,
      ...(hiddenModels.length ? { hiddenModels } : {}),
      ...(legacyModes ? { legacyModes } : {}),
      ...(contextPolicy ? { contextPolicy } : {}),
      ...(additionalDirectories ? { additionalDirectories } : {}),
      ...(excludedMcpServers ? { excludedMcpServers } : {}),
      ...(systemPromptAppend ? { systemPromptAppend } : {}),
      ...(previous?.advertised ? { advertised: previous.advertised } : {}),
      ...(previous?.defaults ? { defaults: previous.defaults } : {}),
      ...(previous?.subscription ? { subscription: previous.subscription } : {}) }
    if (previous && (previous.command !== provider.command || JSON.stringify(previous.args) !== JSON.stringify(provider.args))) {
      this.probeByProvider.delete(id)
    }
    await this.store.saveProvider(provider)
    this.changed()
    return provider
  }

  recordProbeStatus(providerId, info) {
    if (!providerId || !info || typeof info !== 'object') return
    const next = {
      status: info.status === 'error' ? 'error' : 'ready',
      ...(Number.isFinite(info.latencyMs) && info.latencyMs >= 0 ? { latencyMs: Math.round(info.latencyMs) } : {}),
      checkedAt: now(),
      ...(typeof info.agentLabel === 'string' && info.agentLabel.trim() ? { agentLabel: info.agentLabel.trim() } : {}),
      ...(typeof info.error === 'string' && info.error.trim() ? { error: info.error.trim().slice(0, 240) } : {}),
    }
    this.probeByProvider.set(providerId, next)
    this.changed()
  }

  recordAuthStatus(providerId, params) {
    if (!providerId || !params || typeof params !== 'object') return
    const state = typeof params.state === 'string' && params.state.trim() ? params.state.trim() : null
    const accounts = Array.isArray(params.accounts)
      ? params.accounts
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          ...(typeof item.email === 'string' && item.email ? { email: item.email } : {}),
          ...(typeof item.name === 'string' && item.name ? { name: item.name } : {}),
          ...(typeof item.label === 'string' && item.label ? { label: item.label } : {}),
          ...(typeof item.description === 'string' && item.description ? { description: item.description } : {}),
          ...(typeof item.active === 'boolean' ? { active: item.active } : {}),
          ...(typeof item.methodId === 'string' && item.methodId ? { methodId: item.methodId } : {}),
          ...(typeof item.subscriptionType === 'string' && item.subscriptionType ? { subscriptionType: item.subscriptionType } : {}),
          ...(typeof item._meta?.claudeCode?.detail === 'string' && item._meta.claudeCode.detail ? { detail: item._meta.claudeCode.detail } : {}),
        }))
        .filter(item => Object.keys(item).length > 0)
      : []
    if (!state && !accounts.length) return
    const next = { state: state ?? 'unknown', accounts, updatedAt: now() }
    const prev = this.authByProvider.get(providerId)
    if (prev && prev.state === next.state && JSON.stringify(prev.accounts) === JSON.stringify(next.accounts)) return
    this.authByProvider.set(providerId, next)
    this.changed()
  }

  async saveProviderSubscription(providerId, subscription) {
    const provider = this.store.providers.get(providerId)
    if (!provider || !subscription) return null
    await this.store.saveProvider({ ...provider, subscription })
    this.changed()
    return subscription
  }

  async noteRateLimit(providerId, rateLimit) {
    if (!providerId || !rateLimit) return
    const provider = this.store.providers.get(providerId)
    if (!provider) return
    const adapter = resolveAdapter({ providerId: provider.id, command: provider.command })
    const next = mergeRateLimitIntoSubscription(provider.subscription, rateLimit, adapter.id, now())
    if (!next) return
    await this.saveProviderSubscription(providerId, next)
  }

  async noteAdvertised(providerId, models, capabilities, { modes, meta, authoritative = false } = {}) {
    const provider = this.store.providers.get(providerId)
    if (!provider) return
    const previous = provider.advertised
    const known = new Map(previous?.models?.map(model => [model.id, model]) ?? [])
    const inputs = inputModalities(capabilities) ?? previous?.inputModalities
    const nextModes = modes ?? previous?.modes
    const nextMeta = meta ? { ...previous?.meta, ...meta } : previous?.meta
    const nextModels = models.length
      ? (authoritative
        ? models.map(model => {
          const prev = known.get(model.id)
          return !model.contextWindow && prev?.contextWindow ? { ...model, contextWindow: prev.contextWindow } : model
        })
        : models.map(model => ({ ...known.get(model.id), ...model })))
      : previous?.models ?? []
    const facts = {
      models: nextModels,
      ...(inputs ? { inputModalities: inputs } : {}),
      ...(nextModes ? { modes: nextModes } : {}),
      ...(nextMeta ? { meta: nextMeta } : {}),
    }
    const prevFacts = {
      models: previous?.models ?? [],
      ...(previous?.inputModalities ? { inputModalities: previous.inputModalities } : {}),
      ...(previous?.modes ? { modes: previous.modes } : {}),
      ...(previous?.meta ? { meta: previous.meta } : {}),
    }
    let nextDefaults = provider.defaults
    if (nextModes && typeof provider.defaults?.mode === 'string' && provider.defaults.mode) {
      const adapter = resolveAdapter({ providerId: provider.id, command: provider.command })
      const resolvedDefaultMode = resolveModeId(provider.defaults.mode, nextModes, adapter, provider)
      if (resolvedDefaultMode && resolvedDefaultMode !== provider.defaults.mode) {
        nextDefaults = { ...provider.defaults, mode: resolvedDefaultMode }
      }
    }
    if (JSON.stringify(prevFacts) === JSON.stringify(facts) && nextDefaults === provider.defaults) return
    await this.store.saveProvider({
      ...provider,
      ...(nextDefaults ? { defaults: nextDefaults } : {}),
      advertised: { at: now(), ...facts },
    })
    this.changed()
    this.modelsChanged?.(providerId)
  }

  async noteModelContextWindow(providerId, modelId, size) {
    if (!providerId || typeof modelId !== 'string' || !modelId || !Number.isFinite(size) || size <= 0) return
    const provider = this.store.providers.get(providerId)
    const advertised = provider?.advertised?.models
    if (!Array.isArray(advertised) || !advertised.length) return
    const target = advertised.find(model => model.id === modelId || model.wireId === modelId)
    if (!target || target.contextWindow === size) return
    const nextModels = advertised.map(model => model === target ? { ...model, contextWindow: size } : model)
    await this.store.saveProvider({ ...provider, advertised: { ...provider.advertised, at: now(), models: nextModels } })
    this.changed()
    this.modelsChanged?.(providerId)
  }

  async fetchCursorCatalog(connection) {
    try {
      // external: Cursor ACP exposes per-model configOptions via cursor/list_available_models without mutating CLI preferences
      const result = await connection.request('cursor/list_available_models', {}, 15_000)
      return Array.isArray(result?.models) && result.models.length > 0 ? result : null
    } catch (error) {
      if (error instanceof RpcError && error.code === -32601) return null
      this.log?.(`ACP cursor model catalog: ${error.message}`)
      return null
    }
  }

  async closeRemoteSession(connection, capabilities, sessionId) {
    if (!sessionId || !capabilities?.sessionCapabilities?.close || connection?.closed) return
    try { await connection.request('session/close', { sessionId }, 2_000) } catch {}
  }

  async deleteRemoteSession(connection, capabilities, sessionId) {
    if (!sessionId || !capabilities?.sessionCapabilities?.delete || connection?.closed) return
    try { await connection.request('session/delete', { sessionId }, 2_000) } catch {}
  }

  async probePerModelCatalog(connection, result, adapter) {
    const sessionId = result?.sessionId
    const modelOption = (result?.configOptions ?? []).find(item => item?.category === 'model' && item.type === 'select')
    const optionModels = (modelOption?.options ?? []).flatMap(group => group.options ?? [group])
      .filter(item => typeof item?.value === 'string' && item.value)
    if (!sessionId || !modelOption?.id || optionModels.length < 2) return null
    const current = modelOption.currentValue
    const candidates = optionModels
      .filter(item => item.value !== 'default' || adapter?.mapDefaultToAuto)
      .slice(0, MAX_PROBE_MODELS)
    if (!candidates.length) return null
    const models = []
    for (const item of candidates) {
      let configOptions
      if (item.value === current) {
        configOptions = result.configOptions ?? []
      } else {
        try {
          const switched = await connection.request('session/set_config_option', {
            sessionId,
            configId: modelOption.id,
            value: item.value,
          }, 15_000)
          configOptions = switched?.configOptions ?? []
        } catch {
          configOptions = []
        }
      }
      models.push({
        value: item.value,
        name: item.name,
        ...(typeof item.description === 'string' ? { description: item.description } : {}),
        configOptions,
      })
    }
    return models.length ? { models } : null
  }

  async create(op, native) {
    this.store.assertWritable()
    const provider = this.provider(op.providerId)
    const cwd = await this.directory(op.cwd)
    if (this.closed) throw new Error('ACP Workbench is unloading')
    const session = { id: randomUUID(), providerId: provider.id, title: op.title ? str(op.title, 'title', 160) : `${provider.label} · ${cwd.split('/').at(-1) || cwd}`,
      cwd, state: 'disconnected', remoteId: op.remoteId ?? null,
      createdAt: now(), updatedAt: now(), archived: false, eventSeq: 0, lastError: null, stopReason: null, native }
    await this.store.saveSession(session)
    this.invalidateLocalUsageCache()
    this.record(session, 'lifecycle', { state: 'disconnected', reason: op.remoteId ? 'imported' : 'created' }, { workbench: true })
    await this.store.flush()
    if (op.connect !== false) await this.connect(session)
    return this.detail(session)
  }

  async spawn(provider, cwd, handlers) {
    const command = await this.subprocess.resolveExecutable(provider.command, undefined, AbortSignal.timeout(10_000))
    if (this.closed) throw new Error('ACP Workbench is unloading')
    const child = this.subprocess.spawn({ argv: [command, ...provider.args], cwd,
      stdio: { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' }, graceMs: 3000 })
    return new AcpConnection(child, handlers)
  }

  async readAgyVersion(command, prefix, cwd) {
    const binarySig = await statSignature(command)
    const scriptSig = prefix[0] ? await statSignature(prefix[0]) : null
    const cacheKey = binarySig ? JSON.stringify([command, binarySig, prefix, scriptSig]) : null
    if (cacheKey && this.agyVersionCache.has(cacheKey)) return this.agyVersionCache.get(cacheKey)
    if (cacheKey && this.agyVersionInFlight.has(cacheKey)) return this.agyVersionInFlight.get(cacheKey)

    const task = (async () => {
      let child
      try {
        child = this.subprocess.spawn({
          argv: [command, ...prefix, '--version'],
          cwd,
          stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
          graceMs: 1000,
        })
      } catch {
        return undefined
      }
      const decoder = new StringDecoder('utf8')
      let out = ''
      let timedOut = false
      const timer = setTimeout(() => {
        timedOut = true
        try { child.terminate?.() } catch {}
      }, AGY_VERSION_TIMEOUT_MS)
      timer.unref?.()
      child.stdout?.on('data', chunk => {
        if (out.length < 4096) out += decoder.write(chunk)
      })
      child.stdout?.on('error', () => {})
      child.stderr?.on('error', () => {})
      child.stderr?.resume?.()
      try {
        const outcome = await Promise.race([
          Promise.resolve(child.done).catch(() => null),
          new Promise(resolve => {
            const guard = setTimeout(() => resolve(null), AGY_VERSION_TIMEOUT_MS + 1500)
            guard.unref?.()
          }),
        ])
        out += decoder.end()
        if (timedOut || !outcome || outcome.exitCode !== 0) return undefined
        const line = out.split(/\r?\n/u).map(s => s.trim()).find(Boolean)
        return line || undefined
      } finally {
        clearTimeout(timer)
        try { child.terminate?.() } catch {}
      }
    })()

    if (cacheKey) {
      this.agyVersionInFlight.set(cacheKey, task)
    }
    try {
      const version = await task
      if (cacheKey && version !== undefined) {
        if (this.agyVersionCache.size >= AGY_VERSION_CACHE_LIMIT) {
          const oldest = this.agyVersionCache.keys().next().value
          if (oldest !== undefined) this.agyVersionCache.delete(oldest)
        }
        this.agyVersionCache.set(cacheKey, version)
      }
      return version
    } finally {
      if (cacheKey) this.agyVersionInFlight.delete(cacheKey)
    }
  }

  async assertAntigravityVersion(provider, cwd) {
    const adapter = resolveAdapter({ providerId: provider.id, command: provider.command })
    if (adapter.id !== 'antigravity') return
    const args = Array.isArray(provider.args) ? provider.args : []
    const acpIndex = args.lastIndexOf('acp')
    if (acpIndex < 0 && basename(provider.command).toLowerCase() !== 'agy') return
    const prefix = acpIndex >= 0 ? args.slice(0, acpIndex) : []
    let command
    try {
      command = await this.subprocess.resolveExecutable(provider.command, undefined, AbortSignal.timeout(10_000))
    } catch {
      return
    }
    const version = await this.readAgyVersion(command, prefix, cwd)
    const parsed = version ? parseSemverTriplet(version) : null
    if (parsed && !isVersionAtLeast(parsed, MIN_AGY_VERSION)) {
      throw new Error(`Antigravity CLI ${version} is below the minimum supported ACP version ${MIN_AGY_VERSION_LABEL}. Upgrade agy and try again.`)
    }
  }

  async withProbe(providerId, rawCwd, use, options = {}) {
    const provider = this.provider(providerId)
    const cwd = await this.directory(typeof rawCwd === 'string' && rawCwd.trim() ? rawCwd : homedir())
    const startedAt = performance.now()
    const probeTimeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : DEFAULT_PROBE_TIMEOUT_MS
    let connection
    try {
      await this.assertAntigravityVersion(provider, cwd)
      connection = await this.spawn(provider, cwd, {
        onNotification: (method, params) => {
          if (method === 'auth/status_update' || method === '_auth/status_update') this.recordAuthStatus(provider.id, params)
          options.onNotification?.(method, params)
        },
        onRequest: () => { throw new RpcError('Client operations are unavailable during CLI setup', -32601) },
      })
    } catch (error) {
      this.recordProbeStatus(provider.id, { status: 'error', latencyMs: performance.now() - startedAt, error: error.message ?? String(error) })
      throw error
    }
    this.probes.add(connection)
    let probeTimer = null
    const deadline = new Promise((_, reject) => {
      probeTimer = setTimeout(() => {
        const timeoutError = new Error(`ACP probe for ${provider.id} timed out after ${probeTimeoutMs} ms`)
        this.recordProbeStatus(provider.id, { status: 'error', latencyMs: performance.now() - startedAt, error: timeoutError.message })
        void connection.stop()
        reject(timeoutError)
      }, probeTimeoutMs)
      probeTimer.unref?.()
    })
    const runProbe = async () => {
      if (this.closed) throw new Error('ACP Workbench is unloading')
      let info
      try {
        info = await connection.request('initialize', {
          protocolVersion: 1,
          clientCapabilities: {
            session: { configOptions: { boolean: {} } },
            _meta: CLIENT_CAPABILITY_META,
          },
          clientInfo: CLIENT_INFO,
        })
      } catch (error) {
        this.recordProbeStatus(provider.id, { status: 'error', latencyMs: performance.now() - startedAt, error: error.message ?? String(error) })
        throw error
      }
      const latencyMs = Math.max(0, Math.round(performance.now() - startedAt))
      if (info.protocolVersion !== 1) {
        const versionError = new Error(`Unsupported ACP version ${info.protocolVersion}`)
        this.recordProbeStatus(provider.id, { status: 'error', latencyMs, error: versionError.message })
        throw versionError
      }
      const meta = extractAgentMeta(info, null)
      this.recordProbeStatus(provider.id, { status: 'ready', latencyMs, agentLabel: meta?.agentLabel })
      return await use({ connection, info, provider, cwd, latencyMs })
    }
    try {
      return await Promise.race([runProbe(), deadline])
    } finally {
      clearTimeout(probeTimer)
      try { await connection.stop() } finally { this.probes.delete(connection) }
    }
  }

  async historyPage(connection, info, cwd, cursor) {
    const caps = info.agentCapabilities, sessions = caps?.sessionCapabilities
    if (!sessions?.list) throw new Error('This provider does not advertise session/list')
    const page = await connection.request('session/list', { cwd, ...(cursor ? { cursor } : {}) })
    return { ...page, canFork: !!sessions.fork && !!(caps.loadSession || sessions.resume) }
  }

  async forkHistory(providerId, cwd, choice, checkTarget) {
    return this.withProbe(providerId, cwd, async ({ connection, info }) => {
      const page = await this.historyPage(connection, info, cwd, choice.cursor)
      if (!page.canFork) throw new Error('This CLI does not advertise a fork that can be reopened')
      const effective = await checkTarget()
      const row = page.sessions?.find(s => s.sessionId === choice.remoteId && (s.cwd === cwd || s.cwd === effective))
      if (!row) throw new Error('The source is no longer in this checkout’s CLI history. Refresh the list.')
      let result
      try { result = await connection.request('session/fork', { sessionId: row.sessionId, cwd, mcpServers: [] }, 60_000) }
      catch (error) { throw new Error(`Fork not confirmed. Refresh CLI history before trying again: ${error.message}`, { cause: error }) }
      const id = result?.sessionId
      if (typeof id !== 'string' || !id.trim() || id.length > 1000 || page.sessions.some(s => s.sessionId === id)) throw new Error('The CLI did not return a distinct fork ID. No context was bound. Refresh CLI history.')
      return { id, title: row.title }
    })
  }

  async probe(providerId, rawCwd, mode, cursor) {
    return this.withProbe(providerId, rawCwd, async ({ connection, info, provider, cwd, latencyMs }) => {
      const adapter = resolveAdapter({ providerId: provider.id, command: provider.command, agentInfo: info.agentInfo, capabilities: info.agentCapabilities })
      if (mode === 'diagnose') {
        const meta = extractAgentMeta(info, null)
        return { command: [provider.command, ...provider.args], ...info, latencyMs, ...(meta ? { agentMeta: meta } : {}), authStatus: this.authByProvider.get(provider.id) ?? null }
      }
      if (mode === 'models') {
        // external: ACP only advertises models inside a session/new response
        const result = await connection.request('session/new', { cwd, mcpServers: [] }, 60_000)
        try {
          let catalog = adapter.catalogMode === 'cursor-extension' ? await this.fetchCursorCatalog(connection) : null
          if (!catalog && adapter.probePerModelConfig) {
            catalog = await this.probePerModelCatalog(connection, result, adapter)
          }
          const models = advertisedModels(result, info.agentCapabilities, catalog, adapter)
          const modes = advertisedModes(result, adapter, provider)
          const meta = extractAgentMeta(info, result)
          await this.noteAdvertised(provider.id, models, info.agentCapabilities, {
            modes,
            meta,
            authoritative: !!catalog || adapter.catalogMode === 'config-variants',
          })
          return { models, modes, meta, latencyMs, sessionId: result.sessionId ?? null }
        } finally {
          await this.closeRemoteSession(connection, info.agentCapabilities, result?.sessionId)
        }
      }
      return this.historyPage(connection, info, cwd, cursor)
    })
  }

  async refreshUsage(providerId, rawCwd) {
    const provider = this.provider(providerId)
    const cwd = await this.directory(typeof rawCwd === 'string' && rawCwd.trim() ? rawCwd : homedir())
    const adapter = resolveAdapter({ providerId: provider.id, command: provider.command })
    const fetchedAt = now()

    if (adapter.id === 'cursor') {
      const [aboutRes, statusRes] = await Promise.allSettled([
        runJsonCli(this.subprocess, provider.command, ['about', '--format', 'json'], cwd, 10_000),
        runJsonCli(this.subprocess, provider.command, ['status', '--format', 'json'], cwd, 10_000),
      ])
      const aboutJson = aboutRes.status === 'fulfilled' ? aboutRes.value : null
      const statusJson = statusRes.status === 'fulfilled' ? statusRes.value : null
      if (!aboutJson && !statusJson) {
        const message = aboutRes.reason?.message ?? statusRes.reason?.message ?? 'Failed to inspect Cursor CLI status'
        throw new Error(message)
      }
      const subscription = normalizeCursorCliUsage(aboutJson, statusJson, fetchedAt)
      await this.saveProviderSubscription(provider.id, subscription)
      return subscription
    }

    if (adapter.id === 'codex') {
      try {
        const { accountResult, rateLimitsResult } = await probeCodexAppServer(this.subprocess, provider.command, cwd, CLIENT_INFO, 12_000)
        const subscription = normalizeCodexRateLimits(accountResult, rateLimitsResult, fetchedAt)
        await this.saveProviderSubscription(provider.id, subscription)
        return subscription
      } catch (error) {
        if (!provider.command) throw error
      }
    }

    if (adapter.id === 'claude-code') {
      const textChunks = []
      let probeRateLimit = null
      let targetSessionId = null
      return this.withProbe(provider.id, cwd, async ({ connection, info }) => {
        if (info.agentCapabilities?.auth?.status) {
          try {
            const authResp = await connection.request('auth/status', {}, 5_000)
            if (authResp && typeof authResp === 'object') this.recordAuthStatus(provider.id, authResp)
          } catch {}
        }
        const created = await connection.request('session/new', { cwd, mcpServers: [] }, 60_000)
        targetSessionId = created?.sessionId ?? null
        try {
          if (targetSessionId) {
            await connection.request('session/prompt', {
              sessionId: targetSessionId,
              prompt: [{ type: 'text', text: '/usage' }],
            }, 25_000)
          }
        } finally {
          await this.closeRemoteSession(connection, info.agentCapabilities, targetSessionId)
          await this.deleteRemoteSession(connection, info.agentCapabilities, targetSessionId)
        }
        const subscription = buildClaudeSubscription({
          markdown: textChunks.join(''),
          authStatus: this.authByProvider.get(provider.id),
          rateLimit: probeRateLimit,
          fetchedAt,
        })
        await this.saveProviderSubscription(provider.id, subscription)
        return subscription
      }, {
        onNotification: (method, params) => {
          if (method !== 'session/update') return
          if (targetSessionId && params?.sessionId && params.sessionId !== targetSessionId) return
          const update = params?.update
          if (update?.sessionUpdate === 'agent_message_chunk' && update.content?.type === 'text' && typeof update.content.text === 'string') {
            textChunks.push(update.content.text)
          } else if (update?.sessionUpdate === 'usage_update') {
            const rl = rateLimitInfo(update)
            if (rl) probeRateLimit = rl
          }
        },
      })
    }

    return this.withProbe(provider.id, cwd, async ({ connection, info }) => {
      const detected = resolveAdapter({ providerId: provider.id, command: provider.command, agentInfo: info.agentInfo, capabilities: info.agentCapabilities })
      if (info.agentCapabilities?.auth?.status) {
        try {
          const authResp = await connection.request('auth/status', {}, 5_000)
          if (authResp && typeof authResp === 'object') this.recordAuthStatus(provider.id, authResp)
        } catch {}
      }
      if (detected.id === 'antigravity') {
        const result = await connection.request('session/new', { cwd, mcpServers: [] }, 60_000)
        try {
          const meta = extractAgentMeta(info, result)
          if (meta) await this.noteAdvertised(provider.id, [], info.agentCapabilities, { meta })
          const subscription = normalizeAntigravityUsage(meta?.tier, this.authByProvider.get(provider.id), fetchedAt)
          await this.saveProviderSubscription(provider.id, subscription)
          return subscription
        } finally {
          await this.closeRemoteSession(connection, info.agentCapabilities, result?.sessionId)
        }
      }
      const account = accountFromAuthStatus(this.authByProvider.get(provider.id))
      const subscription = {
        fetchedAt,
        adapterId: detected.id,
        source: 'acp-initialize',
        quotaSupported: false,
        quotaNote: account?.state === 'unauthenticated' ? 'signed_out' : 'acp_not_exposed',
        ...(account ? { account } : {}),
        windows: [],
      }
      await this.saveProviderSubscription(provider.id, subscription)
      return subscription
    })
  }

  async authenticate(providerId, methodId, rawCwd) {
    const cleanMethodId = str(methodId, 'methodId', 120)
    const provider = this.provider(providerId)
    return this.withProbe(provider.id, rawCwd, async ({ connection, info }) => {
      const methods = Array.isArray(info.authMethods) ? info.authMethods : []
      if (methods.length && !methods.some(item => item?.id === cleanMethodId)) {
        throw new Error(`Authentication method "${cleanMethodId}" is not advertised by ${provider.label}`)
      }
      const result = await connection.request('authenticate', { methodId: cleanMethodId }, 60_000)
      if (info.agentCapabilities?.auth?.status) {
        try {
          const authResp = await connection.request('auth/status', {}, 5_000)
          if (authResp && typeof authResp === 'object') this.recordAuthStatus(provider.id, authResp)
        } catch {}
      }
      const meta = extractAgentMeta(info, null)
      if (meta) await this.noteAdvertised(provider.id, [], info.agentCapabilities, { meta })
      if (provider.subscription?.quotaNote === 'signed_out') {
        const nextSub = { ...provider.subscription, fetchedAt: now() }
        delete nextSub.quotaNote
        await this.saveProviderSubscription(provider.id, nextSub)
      }
      return {
        authenticated: true,
        methodId: cleanMethodId,
        result: result ?? {},
        authMethods: methods,
        authStatus: this.authByProvider.get(provider.id) ?? null,
      }
    })
  }

  async logout(providerId, rawCwd) {
    const provider = this.provider(providerId)
    if ([...this.store.sessions.values()].some(s => s.providerId === provider.id && this.runtimes.has(s.id))) {
      throw new Error('Disconnect this provider’s active sessions before signing out')
    }
    return this.withProbe(provider.id, rawCwd, async ({ connection, info }) => {
      if (!info.agentCapabilities?.auth?.logout) {
        throw new Error(`${provider.label} does not advertise auth/logout`)
      }
      const result = await connection.request('auth/logout', {}, 15_000)
      this.authByProvider.set(provider.id, { state: 'unauthenticated', accounts: [], updatedAt: now() })
      const nextSub = {
        fetchedAt: now(),
        adapterId: resolveAdapter({ providerId: provider.id, command: provider.command, agentInfo: info.agentInfo, capabilities: info.agentCapabilities }).id,
        source: 'acp-logout',
        quotaSupported: false,
        quotaNote: 'signed_out',
        account: { state: 'unauthenticated' },
        windows: [],
      }
      await this.saveProviderSubscription(provider.id, nextSub)
      const meta = extractAgentMeta(info, null)
      if (meta) await this.noteAdvertised(provider.id, [], info.agentCapabilities, { meta })
      return { loggedOut: true, result: result ?? {} }
    })
  }

  async resolveAdditionalDirectories(rawDirs, primaryCwd) {
    if (!Array.isArray(rawDirs) || !rawDirs.length) return []
    const resolved = []
    const seen = new Set(primaryCwd ? [primaryCwd] : [])
    for (const raw of rawDirs.slice(0, MAX_ADDITIONAL_DIRS)) {
      if (typeof raw !== 'string') continue
      const trimmed = raw.trim()
      if (!trimmed || !isAbsolute(trimmed)) continue
      try {
        const real = await realpath(trimmed)
        if (!(await stat(real)).isDirectory()) continue
        if (!seen.has(real)) {
          seen.add(real)
          resolved.push(real)
        }
      } catch (error) {
        this.log?.(`ACP skipped unavailable additional directory "${trimmed}": ${error.message}`)
      }
    }
    return resolved
  }

  isCurrent(session, runtime) { return !this.closed && this.runtimes.get(session.id) === runtime && !runtime.closing }

  async connect(session, { initialConfigOptions, systemPromptAppend, additionalDirectories } = {}) {
    if (this.closed) throw new Error('ACP Workbench is unloading')
    this.store.assertWritable()
    if (session.native?.retired) throw new Error('This external context was retired; its history is read-only')
    if (session.archived) throw new Error('Restore this session before connecting')
    if (this.runtimes.has(session.id)) throw new Error('Session is already connected or starting')
    if (session.remoteId && [...this.store.sessions.values()].some(other => other.id !== session.id && other.providerId === session.providerId && other.remoteId === session.remoteId && this.runtimes.has(other.id))) {
      throw new Error('This CLI session is already in use by another record. Open its original DSH conversation.')
    }
    const provider = structuredClone(this.provider(session.providerId))
    const runtime = { generation: randomUUID(), connection: null, interactions: new Map(), closing: false, replaying: !!session.remoteId, turnId: null, adapter: null }
    runtime.spawnReady = new Promise(resolve => { runtime.releaseSpawn = resolve })
    this.runtimes.set(session.id, runtime)
    session.lastError = null
    const probeStartedAt = performance.now()
    let initialized = false
    try {
      await this.transition(session, 'starting')
      if (!this.isCurrent(session, runtime)) throw new Error('Connection was canceled before startup')
      const connection = await this.spawn(provider, session.cwd, {
        onNotification: (method, params) => this.notification(session, runtime, method, params),
        onRequest: async (method, params, wireId) => {
          try { return await this.request(session, runtime, method, params, wireId) } catch (error) {
            if (this.store.failure) await this.failed(session, runtime, error)
            throw error
          }
        },
        onStderr: text => {
          if (this.isCurrent(session, runtime) && text) this.record(session, 'stderr', { text }, { notify: 'stream' })
        },
        onExit: error => { void this.failed(session, runtime, error).catch(e => this.log?.(e.message)) },
      })
      runtime.connection = connection
      runtime.releaseSpawn()
      if (!this.isCurrent(session, runtime)) { await connection.stop(); throw new Error('Connection was canceled during startup') }
      const info = await connection.request('initialize', {
        protocolVersion: 1,
        clientCapabilities: {
          fs: { readTextFile: false, writeTextFile: false },
          terminal: false,
          plan: {},
          elicitation: { form: {}, url: {} },
          session: { compaction: {}, notices: {}, configOptions: { boolean: {} } },
          _meta: { terminal_output: true, terminal_output_delta: true, ...CLIENT_CAPABILITY_META },
        },
        clientInfo: CLIENT_INFO,
      })
      if (info.protocolVersion !== 1) throw new Error(`Unsupported ACP version ${info.protocolVersion}`)
      initialized = true
      const initMeta = extractAgentMeta(info, null)
      this.recordProbeStatus(provider.id, {
        status: 'ready',
        latencyMs: Math.max(0, Math.round(performance.now() - probeStartedAt)),
        agentLabel: initMeta?.agentLabel,
      })
      session.capabilities = info.agentCapabilities ?? {}
      session.authMethods = info.authMethods ?? []
      runtime.adapter = resolveAdapter({ providerId: provider.id, command: provider.command, agentInfo: info.agentInfo, capabilities: session.capabilities })
      this.record(session, 'initialize', info)
      const canResume = !!session.capabilities.sessionCapabilities?.resume
      const canLoad = !!session.capabilities.loadSession
      if (session.remoteId && !canLoad && !canResume) throw new Error('This provider cannot load or resume the previous session; create a new one explicitly')
      const captureImport = session.native?.imported && !session.native.replayRange
      const localHistory = session.native && !captureImport && (session.historyLoaded || session.native.runs.some(run => run.state === 'completed'))
      const method = !session.remoteId ? 'session/new' : canResume && (localHistory || !canLoad) ? 'session/resume' : 'session/load'
      const normalizedInitialConfig = resolveInitialConfigOptions(initialConfigOptions, {
        modes: provider.advertised?.modes,
        adapter: runtime.adapter,
        provider,
      })
      const useInitialConfig = Array.isArray(normalizedInitialConfig) && normalizedInitialConfig.length > 0 && !!session.capabilities.sessionCapabilities?.options
      const rawExtraDirs = [
        ...(Array.isArray(provider.additionalDirectories) ? provider.additionalDirectories : []),
        ...(Array.isArray(additionalDirectories) ? additionalDirectories : []),
      ]
      const validExtraDirs = session.capabilities.sessionCapabilities?.additionalDirectories
        ? await this.resolveAdditionalDirectories(rawExtraDirs, session.cwd)
        : []
      const rawHostBridge = typeof this.hostBridgePromptFor === 'function'
        ? this.hostBridgePromptFor(session, runtime.adapter)
        : ''
      const hostBridgePrompt = typeof rawHostBridge === 'string' ? rawHostBridge.trim() : ''
      const dshSystemAppend = typeof systemPromptAppend === 'string' ? systemPromptAppend.trim() : ''
      const appendParts = [
        hostBridgePrompt,
        typeof provider.systemPromptAppend === 'string' ? provider.systemPromptAppend.trim() : '',
        dshSystemAppend,
      ].filter(Boolean)
      const combinedAppend = appendParts.length
        ? appendParts.join('\n\n').slice(0, MAX_SYSTEM_PROMPT_APPEND)
        : ''
      const useSystemPromptAppend = Boolean(
        combinedAppend && session.capabilities._meta?.antigravity?.systemPrompt?.append === true,
      )
      const injectedMcp = typeof this.mcpServersFor === 'function' ? (this.mcpServersFor(session, runtime.adapter) ?? []) : []
      const baseParams = { cwd: session.cwd, mcpServers: injectedMcp, ...(session.remoteId ? { sessionId: session.remoteId } : {}) }
      const plainBaseParams = injectedMcp.length ? { ...baseParams, mcpServers: [] } : baseParams
      const withExtensions = base => ({
        ...base,
        ...(useInitialConfig ? { configOptions: normalizedInitialConfig } : {}),
        ...(validExtraDirs.length ? { additionalDirectories: validExtraDirs } : {}),
        ...(useSystemPromptAppend ? { _meta: { antigravity: { systemPrompt: { append: combinedAppend } } } } : {}),
      })
      const hasExtensions = useInitialConfig || validExtraDirs.length > 0 || useSystemPromptAppend
      const params = hasExtensions ? withExtensions(baseParams) : baseParams
      const from = session.eventSeq + 1
      let extensionsAccepted = hasExtensions
      const openSession = async (targetParams, fallbackBase) => {
        try {
          return await connection.request(method, targetParams, 60_000)
        } catch (error) {
          if (hasExtensions && error instanceof RpcError && error.code === -32602 && this.isCurrent(session, runtime)) {
            extensionsAccepted = false
            try { return await connection.request(method, fallbackBase, 60_000) } catch (retryError) {
              if (method !== 'session/resume' || !canLoad || !(retryError instanceof RpcError) || retryError.code !== -32601 || !this.isCurrent(session, runtime)) throw retryError
              return connection.request('session/load', fallbackBase, 60_000)
            }
          }
          if (method !== 'session/resume' || !canLoad || !(error instanceof RpcError) || error.code !== -32601 || !this.isCurrent(session, runtime)) throw error
          return connection.request('session/load', targetParams, 60_000)
        }
      }
      let result
      let acceptedMcp = injectedMcp
      try {
        result = await openSession(params, baseParams)
      } catch (error) {
        if (!injectedMcp.length || !(error instanceof RpcError) || error.code !== -32602 || !this.isCurrent(session, runtime)) throw error
        this.log?.(`ACP ${session.providerId} rejected injected mcpServers (${error.message}); retrying without MCP bridge`)
        acceptedMcp = []
        extensionsAccepted = hasExtensions
        const plainParams = hasExtensions ? withExtensions(plainBaseParams) : plainBaseParams
        result = await openSession(plainParams, plainBaseParams)
      }
      if (!this.isCurrent(session, runtime)) throw new Error('Connection was canceled during startup')
      session.injectedMcp = acceptedMcp.map(entry => ({
        name: entry.name,
        transport: entry.type === 'http' ? 'http' : 'stdio',
      }))
      session.additionalDirectories = extensionsAccepted ? validExtraDirs : []
      session.hostBridgePromptApplied = Boolean(extensionsAccepted && useSystemPromptAppend && hostBridgePrompt)
      session.hostBridgePromptChars = session.hostBridgePromptApplied ? hostBridgePrompt.length : 0
      session.systemPromptAppendApplied = Boolean(extensionsAccepted && useSystemPromptAppend && dshSystemAppend)
      session.historyLoaded = true
      if (captureImport) session.native.replayRange = { from, to: session.eventSeq }
      if (!session.remoteId) {
        session.remoteId = str(result.sessionId, 'ACP sessionId', 1000)
        for (const id of runtime.commandReports?.keys() ?? []) if (id !== session.remoteId) runtime.commandReports.delete(id)
        for (const id of runtime.noticeHeads?.keys() ?? []) if (id !== session.remoteId) runtime.noticeHeads.delete(id)
      }
      session.modes = result.modes ?? session.modes ?? null
      session.models = result.models ?? session.models ?? null
      session.configOptions = result.configOptions ?? session.configOptions ?? []
      session.agentMeta = extractAgentMeta(info, result) ?? null
      const liveModes = advertisedModes({ modes: session.modes, configOptions: session.configOptions }, runtime.adapter, provider)
      if (liveModes && typeof session.native?.preferences?.mode === 'string' && session.native.preferences.mode) {
        const resolvedMode = resolveModeId(session.native.preferences.mode, liveModes, runtime.adapter, provider)
        if (resolvedMode && resolvedMode !== session.native.preferences.mode) {
          session.native.preferences.mode = resolvedMode
        }
      }
      runtime.replaying = false
      this.record(session, 'session', result)
      const catalog = runtime.adapter.catalogMode === 'cursor-extension' ? await this.fetchCursorCatalog(connection) : null
      if (!this.isCurrent(session, runtime)) throw new Error('Connection was canceled during startup')
      await this.noteAdvertised(session.providerId, advertisedModels(result, session.capabilities, catalog, runtime.adapter), session.capabilities, {
        modes: liveModes,
        meta: session.agentMeta ?? undefined,
        authoritative: !!catalog || runtime.adapter.catalogMode === 'config-variants',
      })
      await this.transition(session, 'idle')
    } catch (error) {
      if (!initialized) {
        this.recordProbeStatus(provider.id, {
          status: 'error',
          latencyMs: Math.max(0, Math.round(performance.now() - probeStartedAt)),
          error: error.message ?? String(error),
        })
      }
      runtime.releaseSpawn()
      await this.failed(session, runtime, error)
      throw error
    }
  }

  async notification(session, runtime, method, params) {
    if (!this.isCurrent(session, runtime)) return
    if (method === 'auth/status_update' || method === '_auth/status_update') {
      this.recordAuthStatus(session.providerId, params)
      return
    }
    if (params.sessionId && session.remoteId && params.sessionId !== session.remoteId) return
    const owner = method === 'session/update' ? anchorCompaction(session, runtime, params, session.eventSeq + 1) : undefined
    const notifyMode = notificationNotifyMode(method, params, runtime.replaying)
    const event = this.record(session, 'notification', { method, params, replay: runtime.replaying, turnId: runtime.turnId, ...(owner !== undefined && { compactionOwner: owner }),
      ...(params.update?.sessionUpdate === 'notice' && session.state === 'starting' && { noticePhase: 'connect' }) }, { notify: notifyMode === 'none' ? false : notifyMode })
    if (method === '$/cancel_request') {
      const match = [...runtime.interactions].find(([, p]) => !p.responding && (p.public.kind === 'form' || p.public.kind === 'url') && p.wireId != null && p.wireId === params.requestId)
      if (match) {
        const [id, pending] = match
        runtime.interactions.delete(id)
        try { this.onInteractionClose?.({ id, session }) } catch {}
        pending.resolve({ action: 'cancel' })
        this.record(session, 'interaction-expired', { id, reason: 'withdrawn' })
        if (runtime.turnId && !runtime.canceling) await this.transition(session, runtime.interactions.size ? 'waiting' : 'running')
      }
      return
    }
    if (method === 'session/complete_elicitation') {
      const targetId = params.elicitationId
      const match = [...runtime.interactions].find(([, p]) => !p.responding && p.public.kind === 'url' && (!targetId || p.urlInfo?.elicitationId === targetId))
      if (match) {
        const [id, pending] = match
        runtime.interactions.delete(id)
        try { this.onInteractionClose?.({ id, session }) } catch {}
        pending.resolve({ action: 'accept' })
        this.record(session, 'interaction-result', { id, result: { action: 'accept' }, completedExternally: true })
        if (runtime.turnId && !runtime.canceling) await this.transition(session, runtime.interactions.size ? 'waiting' : 'running')
      }
      return
    }
    const update = method === 'session/update' ? params.update : null
    if (!update) return
    const starts = runtime.callStarts, callId = update.toolCallId
    const topLevel = !cliParentOf(update)
    if (starts && !runtime.replaying && typeof callId === 'string' && callId) {
      const parent = cliParentOf(update)
      if (update.sessionUpdate === 'tool_call') starts.set(callId, starts.has(callId) ? null : { seq: event.seq, parent })
      else if (update.sessionUpdate === 'tool_call_update' && parent && starts.has(callId) && starts.get(callId)?.parent !== parent) starts.set(callId, null)
    }
    if (!runtime.replaying && topLevel && !agySubagentIdOf(update) && (update.sessionUpdate === 'tool_call' || update.sessionUpdate === 'tool_call_update')) {
      this.trackBackgroundTask(session, runtime, update, event.at)
    }
    if (!runtime.replaying && runtime.turnId && runtime.adapter?.asyncToolWakeup && topLevel) {
      this.trackAsyncWakeup(session, runtime, update)
    }
    switch (update.sessionUpdate) {
      case 'notice': if (!runtime.turnId) rememberNotice(runtime, event); break
      case 'config_option_update': {
        session.configOptions = update.configOptions ?? []
        const prov = this.store.providers.get(session.providerId)
        void this.noteAdvertised(session.providerId, advertisedModels({ models: session.models, configOptions: session.configOptions }, session.capabilities, null, runtime.adapter), undefined, {
          modes: advertisedModes({ modes: session.modes, configOptions: session.configOptions }, runtime.adapter, prov),
        }).catch(error => this.log?.(error.message))
        break
      }
      case 'current_mode_update': session.modes = { ...session.modes, currentModeId: update.currentModeId }; break
      case 'available_commands_update': {
        if (typeof params.sessionId !== 'string' || !params.sessionId || cliParentOf(update) || !Array.isArray(update.availableCommands)) break
        const commands = [], seen = new Set()
        for (const item of update.availableCommands) {
          if (typeof item?.name !== 'string' || !item.name || /[\s\p{Cc}]/u.test(item.name) || item.name.startsWith('/') || seen.has(item.name)) continue
          seen.add(item.name)
          commands.push({ name: item.name, description: typeof item.description === 'string' ? item.description : '', ...(typeof item.input?.hint === 'string' && { input: { hint: item.input.hint } }) })
        }
        ;(runtime.commandReports ??= new Map()).set(params.sessionId, { stamp: runtime.generation + ':' + event.seq, commands })
        break
      }
      case 'usage_update': {
        const window = contextWindow(update)
        const rateLimit = rateLimitInfo(update)
        if (!runtime.replaying && session.remoteId && params.sessionId === session.remoteId && !cliParentOf(update)) {
          if (window) {
            session.lastContext = { remoteId: session.remoteId, at: event.at, window }
            const currentModelId = session.configOptions?.find(o => o.category === 'model')?.currentValue ?? session.models?.currentModelId
            if (currentModelId && currentModelId !== 'default') {
              void this.noteModelContextWindow(session.providerId, currentModelId, window.size).catch(error => this.log?.(error.message))
            }
            if (window.model && window.model !== currentModelId) {
              void this.noteModelContextWindow(session.providerId, window.model, window.size).catch(error => this.log?.(error.message))
            }
          }
          if (rateLimit) {
            void this.noteRateLimit(session.providerId, rateLimit).catch(error => this.log?.(error.message))
          }
        }
        break
      }
      case 'session_info_update': if (update.title) session.title = update.title; break
      default: break
    }
  }

  async request(session, runtime, method, params, wireId) {
    const elicitation = method === 'elicitation/create'
    if (!this.isCurrent(session, runtime) || runtime.canceling) return elicitation ? { action: 'cancel' } : { outcome: { outcome: 'cancelled' } }
    if (elicitation && (!session.remoteId || params.sessionId !== session.remoteId || params.requestId != null)) throw new RpcError('A form must address the active CLI session', -32602)
    if (params.sessionId && session.remoteId && params.sessionId !== session.remoteId) throw new RpcError('Wrong session', -32602)
    const normalized = method.replace(/^_/, '')
    if (normalized === 'cursor/update_todos' || normalized === 'cursor/task') {
      // external: some Cursor CLI builds attach a JSON-RPC id to notification extensions
      await this.notification(session, runtime, method, params)
      return {}
    }
    let kind
    if (elicitation) kind = params.mode === 'url' ? 'url' : 'form'
    else if (normalized === 'session/request_permission') kind = 'permission'
    else if (normalized === 'cursor/ask_question') kind = 'question'
    else if (normalized === 'cursor/create_plan') kind = 'plan'
    else throw new RpcError(`Unsupported client method: ${method}`, -32601)
    if (!runtime.turnId) throw new RpcError('Interactive requests require an active prompt', -32600)
    if (runtime.deferredEnd) this.clearDeferredTimers(runtime.deferredEnd)
    const id = randomUUID()
    const interaction = { id, kind, method, params, turnId: runtime.turnId, createdAt: now() }
    const launch = kind === 'permission' && runtime.callStarts?.get(params.toolCall?.toolCallId)
    if (launch && launch.parent === cliParentOf(params.toolCall)) interaction.callStartSeq = launch.seq
    let automatic = null
    try { if (kind === 'permission') automatic = this.autoApprove?.(session, params) ?? null } catch (error) { this.log?.(`ACP auto-approval: ${error.message}`) }
    const option = automatic === null ? null : params.options?.find(item => item.optionId === automatic)
    if (option?.kind === 'allow_once' || option?.kind === 'allow_always') {
      const result = { outcome: { outcome: 'selected', optionId: option.optionId } }
      this.record(session, 'interaction', interaction)
      this.record(session, 'interaction-result', { id, result, automatic: 'bypass-mode', optionKind: option.kind ?? null, optionName: option.name ?? null })
      await this.store.flush()
      if (!this.isCurrent(session, runtime) || runtime.canceling || runtime.turnId !== interaction.turnId) return { outcome: { outcome: 'cancelled' } }
      return result
    }
    let resolve
    const answer = new Promise(r => { resolve = r })
    const fields = kind === 'form' ? formFields(params) : null
    const urlInfo = kind === 'url' ? urlElicitation(params) : null
    runtime.interactions.set(id, { public: interaction, fields, urlInfo, wireId, resolve })
    interaction.requestSeq = this.record(session, 'interaction', interaction).seq
    try { this.onInteractionOpen?.({ id, session, interaction }) } catch {}
    await this.transition(session, 'waiting')
    return answer
  }

  async respond(session, op) {
    const runtime = this.runtimes.get(session.id)
    const pending = runtime?.interactions.get(op.interactionId)
    if (!pending || pending.responding || runtime.closing || runtime.canceling) throw new Error('This interaction has expired or already been answered')
    const { kind, params } = pending.public
    let result
    if (kind === 'form') result = formResponse(pending.fields, op)
    else if (kind === 'url') result = urlResponse(op)
    else if (op.cancel === true) result = { outcome: { outcome: 'cancelled' } }
    else if (kind === 'permission') {
      if (!params.options?.some(o => o.optionId === op.optionId)) throw new Error('Choose an advertised permission option')
      result = { outcome: { outcome: 'selected', optionId: op.optionId } }
    } else if (kind === 'plan') {
      if (typeof op.accept !== 'boolean') throw new Error('Plan response requires accept: true or false')
      result = { outcome: op.accept ? { outcome: 'accepted' } : { outcome: 'rejected', reason: op.reason || 'Rejected by user' } }
    } else if (op.skip === true) result = { outcome: { outcome: 'skipped', reason: 'Skipped by user' } }
    else {
      if (!Array.isArray(op.answers) || op.answers.length !== params.questions?.length) throw new Error('Supply an answer for every question, or skip the question request')
      const seen = new Set()
      for (const answer of op.answers) {
        const question = params.questions?.find(q => q.id === answer.questionId)
        if (!question || seen.has(answer.questionId) || !Array.isArray(answer.selectedOptionIds) || answer.selectedOptionIds.some(id => !question.options.some(o => o.id === id)) || (!question.allowMultiple && answer.selectedOptionIds.length > 1)) throw new Error('Invalid question answer')
        seen.add(answer.questionId)
      }
      result = { outcome: { outcome: 'answered', answers: op.answers } }
    }
    pending.responding = true
    const chosen = kind === 'permission' && !op.cancel ? params.options.find(option => option.optionId === op.optionId) : null
    try {
      this.record(session, 'interaction-result', { id: pending.public.id, result: kind === 'form' || kind === 'url' ? { action: result.action } : result, ...(chosen ? { optionName: chosen.name ?? chosen.optionId, optionKind: chosen.kind } : {}) })
      await this.store.flush()
    } catch (error) {
      await this.failed(session, runtime, error)
      throw error
    }
    if (!this.isCurrent(session, runtime) || runtime.canceling || !runtime.interactions.has(op.interactionId)) throw new Error('Interaction expired while saving the response')
    runtime.interactions.delete(op.interactionId)
    try { this.onInteractionClose?.({ id: op.interactionId, session }) } catch {}
    pending.resolve(result)
    if (runtime.deferredEnd) this.syncDeferredIdleTimer(session, runtime, runtime.deferredEnd)
    await this.transition(session, runtime.interactions.size ? 'waiting' : 'running')
    return { answered: op.interactionId }
  }

  clearDeferredTimers(state) {
    if (!state) return
    clearTimeout(state.settleTimer)
    clearTimeout(state.wakeupTimer)
    state.settleTimer = null
    state.wakeupTimer = null
  }

  clearDeferredEnd(runtime) {
    if (!runtime?.deferredEnd) return
    this.clearDeferredTimers(runtime.deferredEnd)
    runtime.deferredEnd = null
  }

  armDeferredTimer(session, runtime, state, kind, delayMs) {
    this.clearDeferredTimers(state)
    state[kind] = setTimeout(() => {
      state[kind] = null
      if (!this.isCurrent(session, runtime) || runtime.canceling || runtime.deferredEnd !== state) return
      if (runtime.interactions.size > 0 || (runtime.openBackgroundCalls?.size ?? 0) > 0) return
      void state.finish()
    }, delayMs)
  }

  syncDeferredIdleTimer(session, runtime, state, delayMs = this.asyncWakeupIdleTimeoutMs) {
    if (!state) return
    if ((runtime.openBackgroundCalls?.size ?? 0) === 0 && runtime.interactions.size === 0) {
      this.armDeferredTimer(session, runtime, state, 'wakeupTimer', delayMs)
    } else {
      this.clearDeferredTimers(state)
    }
  }

  clearBackgroundTaskTimers(runtime) {
    if (!runtime?.backgroundTasks) return
    for (const entry of runtime.backgroundTasks.values()) {
      clearTimeout(entry.promoteTimer)
      entry.promoteTimer = null
    }
  }

  trimBackgroundTasks(runtime) {
    const map = runtime?.backgroundTasks
    if (!map || map.size <= MAX_BACKGROUND_TASKS) return
    for (const [key, entry] of map) {
      if (map.size <= MAX_BACKGROUND_TASKS) break
      if (entry.status !== 'running') map.delete(key)
    }
  }

  promoteBackgroundTask(session, runtime, entry) {
    if (!entry || entry.visible) return
    clearTimeout(entry.promoteTimer)
    entry.promoteTimer = null
    entry.visible = true
    this.changed(session.id)
  }

  promoteOpenBackgroundTasks(session, runtime) {
    const open = runtime?.openBackgroundCalls
    if (!open?.size) return
    const map = (runtime.backgroundTasks ??= new Map())
    let dirty = false
    for (const callId of open) {
      let entry = map.get(callId)
      if (!entry) {
        const meta = runtime.openCallMeta?.get(callId)
        if (!meta) continue
        const input = taskInputOf(meta.update)
        const name = taskToolNameOf(meta.update) || meta.update?.kind || 'task'
        const label = taskLabelOf(meta.update, input, name)
        entry = {
          id: callId,
          toolCallId: callId,
          name,
          kind: taskKindOf(meta.update, input, name),
          label,
          command: taskCommandOf(meta.update, input, name, label),
          status: 'running',
          isDaemon: isDaemonToolCall(meta.update),
          taskId: null,
          startedAt: meta.startedAt,
          finishedAt: null,
          exitCode: null,
          output: '',
          outputTruncated: false,
          turnId: runtime.turnId ?? null,
          visible: true,
          promoteTimer: null,
        }
        map.set(callId, entry)
        dirty = true
        continue
      }
      if (!entry.visible) {
        clearTimeout(entry.promoteTimer)
        entry.promoteTimer = null
        entry.visible = true
        dirty = true
      }
    }
    if (dirty) this.changed(session.id)
  }

  settleTurnBackgroundTasks(runtime, turnId, status) {
    if (!runtime?.backgroundTasks || !turnId) return
    const finishedAt = Date.now()
    for (const [callId, entry] of runtime.backgroundTasks) {
      if (entry.turnId !== turnId || entry.status !== 'running' || entry.isDaemon) continue
      clearTimeout(entry.promoteTimer)
      entry.promoteTimer = null
      if (!entry.visible) {
        runtime.backgroundTasks.delete(callId)
      } else {
        entry.status = status
        entry.finishedAt = finishedAt
      }
    }
    this.trimBackgroundTasks(runtime)
  }

  trackBackgroundTask(session, runtime, update, eventAt) {
    const callId = typeof update?.toolCallId === 'string' && update.toolCallId ? update.toolCallId : null
    if (!callId) return
    const ts = Date.parse(eventAt) || Date.now()
    const input = taskInputOf(update)
    const name = taskToolNameOf(update)
    const terminal = update.status === 'completed' || update.status === 'failed' || update.status === 'cancelled'
    const outputText = taskOutputTextOf(update)
    const map = (runtime.backgroundTasks ??= new Map())

    if (name === 'manage_task' && terminal) {
      const action = firstNonEmptyString(input?.Action, input?.action).toLowerCase()
      const taskId = firstNonEmptyString(input?.TaskId, input?.taskId, input?.job_id)
      if (action === 'kill' && taskId) {
        for (const entry of map.values()) {
          if (entry.taskId === taskId && entry.status === 'running') {
            clearTimeout(entry.promoteTimer)
            entry.promoteTimer = null
            entry.status = 'cancelled'
            entry.finishedAt = ts
            entry.visible = true
            this.trimBackgroundTasks(runtime)
          }
        }
      }
      return
    }

    if (runtime.openCallMeta) {
      if (terminal) runtime.openCallMeta.delete(callId)
      else {
        const prevMeta = runtime.openCallMeta.get(callId)
        runtime.openCallMeta.set(callId, {
          startedAt: prevMeta?.startedAt ?? ts,
          update: prevMeta ? { ...prevMeta.update, ...update, rawInput: input ?? prevMeta.update.rawInput } : update,
        })
      }
    }

    let entry = map.get(callId)
    if (!entry) {
      if (!isTrackableBackgroundCandidate(update, input, name)) return
      const immediate = isImmediateBackgroundTask(update, input, name) || Boolean(runtime.deferredEnd)
      if (terminal && !immediate) return
      const resolvedName = name || update.kind || 'task'
      const label = taskLabelOf(update, input, resolvedName)
      entry = {
        id: callId,
        toolCallId: callId,
        name: resolvedName,
        kind: taskKindOf(update, input, resolvedName),
        label,
        command: taskCommandOf(update, input, resolvedName, label),
        status: 'running',
        isDaemon: isDaemonToolCall(update),
        taskId: null,
        startedAt: ts,
        finishedAt: null,
        exitCode: null,
        output: '',
        outputTruncated: false,
        turnId: runtime.turnId ?? null,
        visible: immediate,
        promoteTimer: null,
      }
      if (!immediate && !terminal) {
        const rawWait = typeof input?.WaitMsBeforeAsync === 'number' && Number.isFinite(input.WaitMsBeforeAsync)
          ? input.WaitMsBeforeAsync
          : this.backgroundTaskPromoteMs
        const delay = Math.min(Math.max(rawWait, 0), this.backgroundTaskPromoteMs)
        entry.promoteTimer = setTimeout(() => {
          entry.promoteTimer = null
          if (!this.isCurrent(session, runtime) || entry.status !== 'running') return
          this.promoteBackgroundTask(session, runtime, entry)
        }, delay)
        entry.promoteTimer.unref?.()
      }
      map.set(callId, entry)
    } else {
      const resolvedName = name || entry.name
      if (name && entry.name !== name) entry.name = name
      if (input || update.title) {
        entry.kind = taskKindOf(update, input, resolvedName)
        entry.label = taskLabelOf(update, input, resolvedName)
        entry.command = taskCommandOf(update, input, resolvedName, entry.label)
      }
      if (isDaemonToolCall(update)) {
        entry.isDaemon = true
        entry.kind = 'daemon'
      }
      if (!entry.visible && (isImmediateBackgroundTask(update, input, resolvedName) || runtime.deferredEnd)) {
        this.promoteBackgroundTask(session, runtime, entry)
      }
    }

    const bgMatch = outputText ? BG_TASK_ID_RE.exec(outputText) : null
    if (bgMatch) entry.taskId = bgMatch[1]

    if (terminal) {
      clearTimeout(entry.promoteTimer)
      entry.promoteTimer = null
      if (entry.isDaemon && update.status === 'completed' && entry.taskId) {
        entry.visible = true
        if (outputText) {
          entry.outputTruncated = outputText.length > MAX_TASK_OUTPUT_CHARS
          entry.output = clipTaskText(outputText, MAX_TASK_OUTPUT_CHARS, true)
        }
        return
      }
      if (!entry.visible) {
        map.delete(callId)
        return
      }
      entry.status = update.status === 'failed' ? 'failed' : update.status === 'cancelled' ? 'cancelled' : 'completed'
      entry.finishedAt = ts
      if (outputText) {
        entry.outputTruncated = outputText.length > MAX_TASK_OUTPUT_CHARS
        entry.output = clipTaskText(outputText, MAX_TASK_OUTPUT_CHARS, true)
      }
      const exitCode = taskExitCodeOf(update, outputText)
      if (exitCode !== null) entry.exitCode = exitCode
      this.trimBackgroundTasks(runtime)
    }
  }

  trackAsyncWakeup(session, runtime, update) {
    const open = runtime.openBackgroundCalls
    const callId = typeof update.toolCallId === 'string' && update.toolCallId ? update.toolCallId : null
    const state = runtime.deferredEnd
    switch (update.sessionUpdate) {
      case 'tool_call':
        if (callId && open) {
          if (isDaemonToolCall(update) || update.status === 'completed' || update.status === 'failed' || update.status === 'cancelled') open.delete(callId)
          else open.add(callId)
        }
        if (state) {
          state.hasMessageOutput = false
          this.syncDeferredIdleTimer(session, runtime, state)
        }
        break
      case 'tool_call_update':
        if (callId && open && (update.status === 'completed' || update.status === 'failed' || update.status === 'cancelled' || isDaemonToolCall(update))) {
          open.delete(callId)
        }
        if (state) {
          state.hasMessageOutput = false
          this.syncDeferredIdleTimer(session, runtime, state)
        }
        break
      case 'agent_thought_chunk':
        if (state) this.syncDeferredIdleTimer(session, runtime, state)
        break
      case 'agent_message_chunk':
        if (state) {
          state.hasMessageOutput = true
          const text = update.content?.type === 'text' && typeof update.content.text === 'string' ? update.content.text : ''
          const delay = ASYNC_WAKEUP_TERMINAL_ALERT_RE.test(text) ? this.asyncWakeupSettleMs : this.asyncWakeupIdleTimeoutMs
          this.syncDeferredIdleTimer(session, runtime, state, delay)
        }
        break
      case 'usage_update':
        if (state) {
          if ((open?.size ?? 0) === 0 && runtime.interactions.size === 0) {
            const delay = state.hasMessageOutput ? this.asyncWakeupSettleMs : this.asyncWakeupSilentSettleMs
            this.armDeferredTimer(session, runtime, state, 'settleTimer', delay)
          } else {
            this.clearDeferredTimers(state)
            state.hasMessageOutput = false
          }
        }
        break
      default:
        break
    }
  }

  expire(session, runtime, reason) {
    for (const [id, pending] of runtime.interactions) {
      try { this.onInteractionClose?.({ id, session }) } catch {}
      pending.resolve(pending.public.kind === 'form' || pending.public.kind === 'url' ? { action: 'cancel' } : { outcome: { outcome: 'cancelled' } })
      if (!this.store.failure) this.record(session, 'interaction-expired', { id, reason })
    }
    runtime.interactions.clear()
    runtime.callStarts = null
  }

  requireIdle(session) {
    this.store.assertWritable()
    const runtime = this.runtimes.get(session.id)
    if (!runtime || runtime.closing || session.state !== 'idle') throw new Error('Session must be connected and idle')
    return runtime
  }

  async prompt(session, rawText, options = {}) {
    const text = str(rawText, 'text', 200_000)
    const runtime = this.requireIdle(session)
    if (runtime.turnId) throw new Error('A prompt is already in progress')
    runtime.turnId = options.turnId ?? randomUUID()
    runtime.callStarts = new Map()
    runtime.openCallMeta = new Map()
    runtime.openBackgroundCalls = runtime.adapter?.asyncToolWakeup ? new Set() : null
    runtime.deferredEnd = null
    runtime.canceling = false
    const turnId = runtime.turnId
    session.stopReason = null
    session.turnError = null
    try {
      this.record(session, 'user-message', { text, turnId,
        attachments: options.content?.filter(p => p.type !== 'text').map(p => ({ type: p.type, mimeType: p.mimeType ?? null, name: p.name ?? null, uri: p.uri ?? null })) ?? [] })
      await this.transition(session, 'running')
    } catch (error) { await this.failed(session, runtime, error); throw error }
    if (!this.isCurrent(session, runtime) || runtime.canceling) throw new Error('Prompt canceled before sending')
    const rpc = runtime.connection.request('session/prompt', { sessionId: session.remoteId, prompt: options.content ?? [{ type: 'text', text }] }, 0)
    const deferred = Promise.withResolvers()
    runtime.completion = deferred.promise
    let finished = false
    const finishTurn = async result => {
      if (finished || !this.isCurrent(session, runtime) || runtime.turnId !== turnId) return result
      finished = true
      clearTimeout(runtime.cancelTimer)
      this.clearDeferredEnd(runtime)
      this.expire(session, runtime, 'turn-finished')
      this.settleTurnBackgroundTasks(runtime, turnId, result?.stopReason === 'cancelled' ? 'cancelled' : 'completed')
      session.stopReason = result.stopReason ?? null
      runtime.turnId = null
      runtime.canceling = false
      runtime.openCallMeta = null
      runtime.openBackgroundCalls = null
      this.record(session, 'turn-result', { turnId, ...result })
      await this.transition(session, 'idle')
      return result
    }
    rpc.then(async result => {
      if (!this.isCurrent(session, runtime) || runtime.turnId !== turnId) {
        deferred.resolve(result)
        return
      }
      // external: Antigravity ACP resolves session/prompt with end_turn when the model yields to await a non-daemon background tool, then resumes asynchronously on completion
      if (
        runtime.adapter?.asyncToolWakeup
        && !runtime.canceling
        && result?.stopReason === 'end_turn'
        && (runtime.openBackgroundCalls?.size ?? 0) > 0
      ) {
        runtime.deferredEnd = {
          turnId,
          result,
          hasMessageOutput: false,
          settleTimer: null,
          wakeupTimer: null,
          finish: async override => {
            try { deferred.resolve(await finishTurn(override ?? result)) }
            catch (error) { deferred.reject(error) }
          },
          abort: error => {
            this.clearDeferredEnd(runtime)
            if (!finished) {
              finished = true
              deferred.reject(error)
            }
          },
        }
        this.promoteOpenBackgroundTasks(session, runtime)
        this.log?.(`ACP deferred end_turn for ${turnId}: awaiting ${runtime.openBackgroundCalls.size} background tool(s)`)
        return
      }
      try { deferred.resolve(await finishTurn(result)) }
      catch (error) { deferred.reject(error) }
    }, async error => {
      if (this.agentRejected(session, runtime, error) && runtime.turnId === turnId) {
        finished = true
        clearTimeout(runtime.cancelTimer)
        this.clearDeferredEnd(runtime)
        this.expire(session, runtime, 'turn-error')
        this.settleTurnBackgroundTasks(runtime, turnId, 'failed')
        runtime.turnId = null
        runtime.canceling = false
        runtime.openCallMeta = null
        runtime.openBackgroundCalls = null
        session.turnError = error.message
        this.record(session, 'turn-error', { turnId, message: error.message, code: error.code })
        try { await this.transition(session, 'idle') } catch (failure) { await this.failed(session, runtime, failure) }
        deferred.reject(error)
        return
      }
      await this.failed(session, runtime, error)
      if (!finished) {
        finished = true
        deferred.reject(error)
      }
    })
    runtime.completion.catch(error => this.log?.(`ACP prompt: ${error.message}`))
    return { accepted: true, sessionId: session.id, turnId }
  }

  async steer(session, rawText, options = {}) {
    const text = str(rawText, 'text', 200_000)
    const runtime = this.runtimes.get(session.id)
    if (!runtime || runtime.closing || !runtime.turnId || runtime.canceling) throw new Error('Steering requires an active turn')
    if (!session.agentMeta?.steering) throw new Error('This provider does not advertise active-turn steering')
    const result = await runtime.connection.request('_session/steering', {
      sessionId: session.remoteId,
      prompt: options.content ?? [{ type: 'text', text }],
      _meta: { steering: { idleBehavior: 'promptRequired' } },
    }, 30_000)
    this.record(session, 'steer', { text, turnId: runtime.turnId, result: result ?? {} })
    return { steered: true, sessionId: session.id, turnId: runtime.turnId }
  }

  agentRejected(session, runtime, error) {
    return error instanceof RpcError && this.isCurrent(session, runtime) && !runtime.connection?.closed
  }

  async configure(session, op, { chosen = false } = {}) {
    const runtime = this.requireIdle(session)
    const provider = this.store.providers.get(session.providerId)
    const adapter = runtime.adapter ?? resolveAdapter({ providerId: session.providerId, command: provider?.command })
    const modeOption = session.configOptions?.find(o => o?.category === 'mode' && o.type === 'select')
    const modeOptionChoices = modeOption?.options?.flatMap(o => o.options ?? [o]) ?? []
    let method, params, fallbackConfigParams = null
    if (op.modeId !== undefined) {
      const directMode = session.modes?.availableModes?.some(m => m.id === op.modeId)
      if (directMode) {
        method = 'session/set_mode'
        params = { modeId: op.modeId }
        if (modeOption) {
          const mappedConfigValue = resolveModeId(op.modeId, modeOptionChoices, adapter, provider)
          if (modeOptionChoices.some(o => o.value === mappedConfigValue)) {
            fallbackConfigParams = { configId: modeOption.id, value: mappedConfigValue }
          }
        }
      } else {
        const resolvedInModes = resolveModeId(op.modeId, session.modes, adapter, provider)
        if (session.modes?.availableModes?.some(m => m.id === resolvedInModes)) {
          method = 'session/set_mode'
          params = { modeId: resolvedInModes }
        } else if (modeOption) {
          const resolvedInConfig = resolveModeId(op.modeId, modeOptionChoices, adapter, provider)
          if (!modeOptionChoices.some(o => o.value === resolvedInConfig)) throw new Error('Unknown mode')
          method = 'session/set_config_option'
          params = { configId: modeOption.id, value: resolvedInConfig }
        } else {
          throw new Error('Unknown mode')
        }
      }
    } else if (op.configId !== undefined) {
      const option = session.configOptions?.find(o => o.id === op.configId) ?? (op.configId === 'mode' ? modeOption : undefined)
      const choices = option?.options?.flatMap(o => o.options ?? [o]) ?? []
      const targetValue = option?.category === 'mode' && option.type === 'select' && typeof op.value === 'string'
        ? resolveModeId(op.value, choices, adapter, provider)
        : op.value
      const valid = option && (option.type === 'boolean' ? typeof targetValue === 'boolean'
        : chosen && option.category === 'model' ? typeof targetValue === 'string' && targetValue.length > 0 : choices.some(o => o.value === targetValue))
      if (!valid) throw new Error('Unknown configuration option or value')
      method = 'session/set_config_option'
      params = { configId: option.id, value: targetValue }
    } else {
      if (typeof op.modelId !== 'string' || !op.modelId || (!chosen && !session.models?.availableModels?.some(m => m.modelId === op.modelId))) throw new Error('Unknown model')
      method = 'session/set_model'
      params = { modelId: op.modelId }
    }
    session.state = 'starting'
    this.changed(session.id)
    try {
      let result
      try {
        result = await runtime.connection.request(method, { sessionId: session.remoteId, ...params })
      } catch (error) {
        if (method === 'session/set_mode' && fallbackConfigParams && error instanceof RpcError && error.code === -32602 && this.isCurrent(session, runtime)) {
          method = 'session/set_config_option'
          params = fallbackConfigParams
          result = await runtime.connection.request(method, { sessionId: session.remoteId, ...params })
        } else {
          throw error
        }
      }
      if (!this.isCurrent(session, runtime)) throw new Error('Session disconnected during configuration')
      if (op.modelId !== undefined) session.models = { ...session.models, currentModelId: op.modelId }
      if (result.configOptions) {
        session.configOptions = result.configOptions
        await this.noteAdvertised(session.providerId, advertisedModels({ ...result, models: result.models ?? session.models }, session.capabilities, null, runtime.adapter), undefined, {
          modes: advertisedModes({ modes: result.modes ?? session.modes, configOptions: result.configOptions }, adapter, provider),
        })
      } else if (method === 'session/set_config_option') {
        const option = session.configOptions.find(o => o.id === params.configId)
        if (option) option.currentValue = params.value
      }
      if (method === 'session/set_mode' && session.modes) session.modes.currentModeId = params.modeId
      this.record(session, 'configuration', { method, params, result })
      await this.transition(session, 'idle')
      return this.detail(session)
    } catch (error) {
      if (this.agentRejected(session, runtime, error)) {
        this.record(session, 'configuration-error', { method, params, message: error.message, code: error.code })
        try { await this.transition(session, 'idle') } catch (failure) { await this.failed(session, runtime, failure) }
        throw error
      }
      await this.failed(session, runtime, error)
      throw error
    }
  }

  async cancel(session) {
    const runtime = this.runtimes.get(session.id)
    if (!runtime || runtime.canceling) return
    if (session.state === 'starting') return this.disconnect(session)
    if (!runtime.turnId) return
    const turnId = runtime.turnId
    const deferred = runtime.deferredEnd
    runtime.canceling = true
    this.clearDeferredEnd(runtime)
    this.expire(session, runtime, 'user-cancel')
    try { await this.transition(session, 'canceling') } catch (error) { await this.disconnect(session, 'cancel-persistence-failed'); throw error }
    if (!this.isCurrent(session, runtime) || !runtime.canceling || runtime.turnId !== turnId) return
    try { runtime.connection.notify('session/cancel', { sessionId: session.remoteId }) } catch (error) { await this.failed(session, runtime, error); throw error }
    if (deferred) {
      await deferred.finish({ ...deferred.result, stopReason: 'cancelled' })
      return
    }
    runtime.cancelTimer = setTimeout(() => {
      if (runtime.turnId === turnId && runtime.canceling) void this.disconnect(session, 'cancel-timeout').catch(error => this.log?.(error.message))
    }, 5_000)
  }

  async failed(session, runtime, error) {
    if (runtime.shutdown) return runtime.shutdown
    if (!this.isCurrent(session, runtime)) return
    const deferred = runtime.deferredEnd
    runtime.closing = true
    this.clearIdleTimer(runtime)
    clearTimeout(runtime.cancelTimer)
    this.clearDeferredEnd(runtime)
    this.expire(session, runtime, 'connection-failed')
    this.clearBackgroundTaskTimers(runtime)
    runtime.openCallMeta = null
    runtime.openBackgroundCalls = null
    deferred?.abort(error instanceof Error ? error : new Error(String(error)))
    session.lastError = error.message ?? String(error)
    runtime.shutdown = (async () => {
      try {
        await runtime.spawnReady
        try { await runtime.connection?.stop() } catch (failure) { session.lastError += `; cleanup failed: ${failure.message}` }
        await this.transition(session, 'error', { message: session.lastError })
      } finally {
        this.clearStreamNotify(session.id)
        if (this.runtimes.get(session.id) === runtime) this.runtimes.delete(session.id)
        this.store.evictSessionCache?.(session.id)
        this.changed(session.id, undefined, { workbench: true })
      }
    })()
    return runtime.shutdown
  }

  async disconnect(session, reason = 'user-disconnect') {
    const runtime = this.runtimes.get(session.id)
    if (!runtime) return
    if (runtime.shutdown) return runtime.shutdown
    const deferred = runtime.deferredEnd
    runtime.closing = true
    this.clearIdleTimer(runtime)
    clearTimeout(runtime.cancelTimer)
    this.clearDeferredEnd(runtime)
    this.expire(session, runtime, reason)
    this.clearBackgroundTaskTimers(runtime)
    runtime.openCallMeta = null
    runtime.openBackgroundCalls = null
    deferred?.abort(new Error(`Session disconnected: ${reason}`))
    runtime.shutdown = (async () => {
      try {
        await runtime.spawnReady
        if (runtime.connection && runtime.turnId && !runtime.connection.closed) runtime.connection.notify('session/cancel', { sessionId: session.remoteId })
        if (runtime.connection && !runtime.connection.closed && session.remoteId) {
          await this.closeRemoteSession(runtime.connection, session.capabilities, session.remoteId)
        }
        await runtime.connection?.stop()
        await this.transition(session, 'disconnected', { reason })
      } catch (error) {
        session.lastError = `Disconnect cleanup failed: ${error.message}`
        await this.transition(session, 'error', { message: session.lastError })
        throw error
      } finally {
        this.clearStreamNotify(session.id)
        if (this.runtimes.get(session.id) === runtime) this.runtimes.delete(session.id)
        this.store.evictSessionCache?.(session.id)
        this.changed(session.id, undefined, { workbench: true })
        if (!this.closed && Date.now() - this.lastChunkPruneAt >= CHUNK_PRUNE_INTERVAL_MS) {
          void this.pruneStorageChunks().catch(error => this.log?.(`ACP storage prune: ${error.message}`))
        }
      }
    })()
    return runtime.shutdown
  }

  async close() {
    this.closed = true
    clearInterval(this.chunkPruneTimer)
    this.chunkPruneTimer = null
    for (const timer of this.streamNotifyTimers.values()) clearTimeout(timer)
    this.streamNotifyTimers.clear()
    const results = await Promise.allSettled([
      ...[...this.runtimes.keys()].map(id => this.disconnect(this.store.sessions.get(id), 'plugin-unload')),
      ...[...this.probes].map(connection => connection.stop()),
    ])
    await this.store.close()
    const failures = results.filter(r => r.status === 'rejected').map(r => r.reason)
    if (failures.length) throw new AggregateError(failures, 'Some ACP processes failed to stop')
  }
}
