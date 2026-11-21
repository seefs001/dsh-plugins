import { randomUUID } from 'node:crypto'
import { open, realpath, stat } from 'node:fs/promises'
import { basename, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { HUB_PROVIDER, providerSnapshotEntry, resolveModes, splitHubModelId, validateAgent } from './catalog.js'

export const HUB_SERVER = 'hub'
const PROTOCOL_FEATURES = {
  hubAgentRpc: true,
  agentRequestReceipts: true,
  providersSnapshot: true,
  providersSnapshotCwd: true,
  hubAgentFileRead: true,
  backgroundWorkspaces: true,
  backgroundAgents: true,
}
const MIME = {
  '.txt': 'text/plain', '.md': 'text/markdown', '.json': 'application/json', '.csv': 'text/csv', '.html': 'text/html',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.zip': 'application/zip', '.log': 'text/plain', '.yaml': 'text/yaml', '.yml': 'text/yaml',
  '.diff': 'text/x-diff', '.patch': 'text/x-diff',
}

class RpcError extends Error {}

const textOf = content => (content ?? []).filter(block => block.type === 'text').map(block => block.text).join('')

export function agentSnapshot(ctx, sessionId, run) {
  const agent = ctx.agents.get(sessionId)
  const session = agent?.session ?? ctx.get?.('sessions')?.get?.(sessionId)
  const archived = ctx.workspaceRegistry?.archivedSessionIds?.includes(sessionId) === true
  const status = agent === undefined ? 'idle' : agent.status === 'running' ? 'running' : 'idle'
  const current = agent?.model?.current?.()
  const now = new Date().toISOString()
  return {
    id: sessionId,
    workspaceId: sessionId,
    provider: HUB_PROVIDER,
    cwd: session?.header?.cwd ?? run?.cwd ?? '',
    model: current ? `${current.provider}/${current.model}` : run?.model ?? null,
    thinkingOptionId: current?.reasoningEffort ?? run?.thinkingOptionId ?? null,
    modeId: run?.modeId ?? null,
    status,
    title: run?.title ?? null,
    createdAt: run?.createdAt ?? now,
    updatedAt: now,
    ...archived ? { archivedAt: run?.archivedAt ?? now } : {},
    background: true,
    labels: {},
    capabilities: { supportsStreaming: true, supportsSessionPersistence: true, supportsDynamicModes: false, supportsMcpServers: true },
    persistence: null,
    requiresAttention: false,
  }
}

export class HubBridge {
  constructor(ctx, options) {
    this.ctx = ctx
    this.send = options.send
    this.store = options.store
    this.config = options.config
    this.permissions = options.permissions
    this.daemonId = options.daemonId
    this.log = options.log
    this.journal = options.journal ?? { add() {} }
    this.watched = new Set()
    this.observingDirectory = false
    this.callNames = new Map()
    this.pendingCreates = new Map()
    this.closed = false
  }

  close() {
    this.closed = true
    this.watched.clear()
  }

  emit(message) {
    if (this.closed) return
    try { this.send({ type: 'session', message }) } catch (error) { this.log('warn', `send failed: ${error?.message ?? error}`) }
  }

  reply(type, requestId, payload) {
    this.emit({ type, payload: { requestId, ...payload } })
  }

  rpcError(requestId, requestType, error) {
    this.emit({ type: 'rpc_error', payload: { requestId, requestType, error: error?.message ?? String(error) } })
  }

  isRelevant(sessionId) {
    return this.watched.has(sessionId) || (this.observingDirectory && this.store.bySession(sessionId) !== undefined)
  }

  serverInfo() {
    this.emit({
      type: 'status',
      payload: {
        status: 'server_info',
        serverId: `dsh-${this.daemonId}`,
        hostname: null,
        version: 'dsh-paseo-hub',
        permissions: this.permissions,
        features: PROTOCOL_FEATURES,
      },
    })
  }

  async receive(frame) {
    if (frame?.type === 'hello') return this.serverInfo()
    if (frame?.type !== 'session' || typeof frame.message?.type !== 'string') return
    const message = frame.message
    const { type, requestId } = message
    try {
      switch (type) {
        case 'get_providers_snapshot_request': return await this.providersSnapshot(message)
        case 'refresh_providers_snapshot_request': return this.reply('refresh_providers_snapshot_response', requestId, { acknowledged: true })
        case 'hub.execution.agent.validate.request': return await this.validate(message)
        case 'create_agent_request': return await this.create(message)
        case 'fetch_agent_request': return this.reply('fetch_agent_response', requestId, { agent: this.fetchAgent(message.agentId) })
        case 'fetch_agents_request': return this.fetchAgents(message)
        case 'agent.timeline.set_subscription.request': return this.setTimelineSubscription(message)
        case 'send_agent_message_request': return await this.sendMessage(message)
        case 'cancel_agent_request': return this.cancel(message)
        case 'archive_workspace_request': return await this.archive(message)
        case 'workspace.recovery.inspect.request': return this.inspectRecovery(message)
        case 'workspace.recovery.restore.request': return await this.restore(message)
        case 'workspace.title.set.request': return await this.setTitle(message)
        case 'workspace.label.assignment.set.request': return this.reply('workspace.label.assignment.set.response', requestId, { label: message.label, workspaceLabels: [message.label?.name].filter(Boolean) })
        case 'hub.agent.file.read.request': return await this.readFile(message)
        default:
          if (typeof requestId === 'string') this.rpcError(requestId, type, new Error(`${type} is not supported by DeepSeek Harness`))
      }
    } catch (error) {
      if (typeof requestId !== 'string') return
      this.log('warn', `${type} failed: ${error?.message ?? error}`)
      this.journal.add({
        kind: type === 'create_agent_request' ? 'run.create-failed' : 'hub.request-failed',
        level: 'error',
        message: `${type} failed: ${error?.message ?? error}`,
        sessionId: typeof message.agentId === 'string' ? message.agentId : typeof message.workspaceId === 'string' ? message.workspaceId : null,
      })
      if (type === 'create_agent_request') return this.emit({ type: 'status', payload: { status: 'agent_create_failed', requestId, error: error?.message ?? String(error) } })
      this.rpcError(requestId, type, error)
    }
  }

  async catalogs() {
    const [catalog, permissions] = await Promise.all([
      this.ctx.sessionController.modelCatalog(),
      Promise.resolve(this.ctx.get?.('permissionPresets')?.catalog?.()),
    ])
    return { catalog, modes: resolveModes(this.config, permissions) }
  }

  async providersSnapshot(message) {
    const { catalog, modes } = await this.catalogs()
    const now = new Date()
    this.reply('get_providers_snapshot_response', message.requestId, {
      ...message.cwd === undefined ? {} : { cwd: message.cwd },
      entries: [providerSnapshotEntry({ catalog, modes, now })],
      generatedAt: now.toISOString(),
    })
  }

  async validate(message) {
    let issues = []
    let error = null
    try {
      issues = validateAgent(message, await this.catalogs())
    } catch (failure) {
      error = failure?.message ?? String(failure)
    }
    this.emit({
      type: 'hub.execution.agent.validate.response',
      payload: { requestId: message.requestId, valid: error === null && issues.length === 0, issues, error },
    })
  }

  fetchAgent(agentId) {
    const run = this.store.bySession(agentId)
    if (run === undefined && this.ctx.agents.get(agentId) === undefined) return null
    return agentSnapshot(this.ctx, agentId, run)
  }

  fetchAgents(message) {
    if (message.subscribe) this.observingDirectory = true
    const entries = this.store.sessions().map(sessionId => ({ agent: this.fetchAgent(sessionId) })).filter(entry => entry.agent)
    this.reply('fetch_agents_response', message.requestId, {
      subscriptionId: message.subscribe?.subscriptionId ?? null,
      entries,
      pageInfo: { nextCursor: null, prevCursor: null, hasMore: false },
    })
  }

  setTimelineSubscription(message) {
    this.watched = new Set(Array.isArray(message.agentIds) ? message.agentIds : [])
    this.reply('agent.timeline.set_subscription.response', message.requestId, { agentIds: [...this.watched] })
  }

  async create(message) {
    const key = typeof message.idempotencyKey === 'string' ? message.idempotencyKey : undefined
    if (key !== undefined && this.pendingCreates.has(key)) {
      const sessionId = await this.pendingCreates.get(key)
      return this.acknowledgeCreate(message.requestId, sessionId)
    }
    const task = this.createSession(message, key)
    if (key !== undefined) this.pendingCreates.set(key, task)
    try {
      const sessionId = await task
      this.acknowledgeCreate(message.requestId, sessionId)
    } finally {
      if (key !== undefined) this.pendingCreates.delete(key)
    }
  }

  acknowledgeCreate(requestId, sessionId) {
    this.emit({
      type: 'status',
      payload: { status: 'agent_created', requestId, agentId: sessionId, agent: agentSnapshot(this.ctx, sessionId, this.store.bySession(sessionId)) },
    })
  }

  async createSession(message, key) {
    const config = message.config ?? {}
    if (config.provider !== HUB_PROVIDER) throw new RpcError(`This DeepSeek Harness host runs only provider '${HUB_PROVIDER}', not '${config.provider}'`)
    const existing = key === undefined ? undefined : this.store.byKey(key)
    if (existing !== undefined && (this.ctx.agents.get(existing.sessionId) !== undefined || await this.sessionExists(existing.sessionId))) {
      return existing.sessionId
    }
    if (typeof config.cwd !== 'string' || !isAbsolute(config.cwd)) throw new RpcError('Hub agent cwd must be an absolute path')
    const { catalog, modes } = await this.catalogs()
    const issues = validateAgent({
      provider: config.provider,
      model: config.model,
      modeId: config.modeId,
      thinkingOptionId: config.thinkingOptionId,
      providerOptions: config.providerOptions,
    }, { catalog, modes })
    if (issues.length > 0) throw new RpcError(issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; '))
    const modeId = config.modeId ?? modes.defaultModeId
    const preset = modes.entries.find(entry => entry.id === modeId)?.preset
    if (preset === undefined) throw new RpcError('No DSH permission preset is configured for Hub runs')

    const hub = config.mcpServers?.[HUB_SERVER]
    if (hub !== undefined && (hub.type !== 'http' || typeof hub.url !== 'string')) throw new RpcError('Hub MCP server must be an HTTP server')
    const preapproved = (config.toolPolicy?.preapproved ?? []).filter(grant => grant?.kind === 'mcp' && grant.server === HUB_SERVER).map(grant => grant.tool)
    for (const name of Object.keys(config.mcpServers ?? {})) {
      if (name !== HUB_SERVER) throw new RpcError(`MCP server '${name}' is not supported; only Hub's own server is mounted`)
    }

    let cwd = config.cwd
    let worktree
    if (message.worktree !== undefined) ({ cwd, worktree } = await this.prepareWorktree(cwd, message.worktree))

    const sessionId = `session-${randomUUID()}`
    const record = {
      key: key ?? sessionId,
      sessionId,
      cwd,
      model: config.model ?? null,
      thinkingOptionId: config.thinkingOptionId ?? null,
      modeId,
      preset,
      title: typeof config.title === 'string' ? config.title : null,
      hub: hub === undefined ? null : { url: hub.url, headers: hub.headers ?? {} },
      preapproved,
      env: sanitizeEnv(message.env),
      worktree: worktree ?? null,
      createdAt: new Date().toISOString(),
      archivedAt: null,
      outcome: 'created',
      turns: 0,
      lastActivityAt: null,
      lastError: null,
      finishedAt: null,
    }
    await this.store.put(record)
    try {
      const created = await this.ctx.sessionController.create({
        cwd,
        sessionId,
        ...this.config.agentPreset ? { agentPreset: this.config.agentPreset } : {},
      })
      if (created.sessionId !== sessionId) throw new Error(`DSH reused session ${created.sessionId} instead of creating ${sessionId}`)
      const agent = this.ctx.agents.get(sessionId)
      if (agent === undefined) throw new Error('the created DSH session has no live agent')
      const permissionPresets = this.ctx.get?.('permissionPresets')
      if (permissionPresets === undefined) throw new Error('permission presets are unavailable, so the Hub mode cannot be applied')
      permissionPresets.set(agent.session, preset)
      const split = config.model === undefined ? undefined : splitHubModelId(config.model)
      if (split !== undefined || config.thinkingOptionId !== undefined) {
        const current = agent.model.current?.() ?? catalog.default
        await this.ctx.sessionController.selectModel({
          sessionId,
          provider: split?.provider ?? current.provider,
          model: split?.model ?? current.model,
          ...config.thinkingOptionId === undefined ? {} : { reasoningEffort: config.thinkingOptionId },
        })
      }
      if (record.title) await this.ctx.sessionController.rename({ sessionId, title: record.title.slice(0, 200) }).catch(() => {})
      await this.listWorkspace(cwd)
      this.journal.add({ kind: 'run.created', message: `Run started: ${record.title ?? sessionId} (${modeId}${record.model ? `, ${record.model}` : ''})`, sessionId })
      return sessionId
    } catch (error) {
      await this.store.remove(record.key).catch(() => {})
      throw error
    }
  }

  async listWorkspace(cwd) {
    if (this.config.listWorkspaces === false) return
    try {
      await this.ctx.workspaceController.create({ path: cwd })
    } catch (error) {
      this.log('warn', `could not add ${cwd} to the workspace list: ${error?.message ?? error}`)
    }
  }

  async sessionExists(sessionId) {
    try {
      const found = await this.ctx.sessionController.resolveAgent(sessionId)
      return !('error' in found)
    } catch {
      return false
    }
  }

  async prepareWorktree(cwd, target) {
    const worktrees = this.ctx.get?.('worktrees')
    if (worktrees === undefined) throw new RpcError('Hub asked for a worktree, but this DSH profile has no worktree service (enable Change requests & worktrees)')
    if (target.mode !== 'branch-off') throw new RpcError(`Worktree mode '${target.mode}' is not supported on DeepSeek Harness; use branch-off`)
    // external: DSH worktrees.create requires a live Agent to resolve the repo, so open and archive a temporary session
    const helper = await this.ctx.sessionController.create({ cwd })
    const agent = this.ctx.agents.get(helper.sessionId)
    try {
      const created = await worktrees.create(agent, { name: target.newBranch, ...target.base ? { from: target.base } : {} })
      return { cwd: created.path, worktree: { branch: created.branch, path: created.path } }
    } finally {
      await this.ctx.workspaceController?.archiveSession?.({ sessionId: helper.sessionId, stopActivity: true }).catch(() => {})
    }
  }

  async sendMessage(message) {
    const run = this.store.bySession(message.agentId)
    if (run === undefined) throw new RpcError(`Agent ${message.agentId} is not a Hub agent on this host`)
    if (this.ctx.workspaceRegistry?.archivedSessionIds?.includes(message.agentId)) throw new RpcError('Agent workspace is archived; restore it first')
    await this.ctx.sessionController.prompt({
      requestId: String(message.messageId ?? message.requestId),
      sessionId: message.agentId,
      mode: message.activeTurnBehavior === 'steer' && this.ctx.agents.get(message.agentId)?.status === 'running' ? 'steer' : 'queue',
      content: [{ type: 'text', text: String(message.text ?? '') }],
    }, AbortSignal.timeout(30_000))
    this.journal.add({ kind: 'run.message', message: `Hub sent a follow-up: ${String(message.text ?? '').slice(0, 160)}`, sessionId: message.agentId })
    this.reply('send_agent_message_response', message.requestId, { agentId: message.agentId, accepted: true, error: null })
  }

  cancel(message) {
    const agent = this.ctx.agents.get(message.agentId)
    if (agent !== undefined && agent.status === 'running') this.ctx.sessionController.cancel({ sessionId: message.agentId })
    this.journal.add({ kind: 'run.canceled', level: 'warn', message: 'Hub canceled the run', sessionId: message.agentId })
    this.reply('cancel_agent_response', message.requestId, { agentId: message.agentId, success: true, error: null })
  }

  async archive(message) {
    const sessionId = message.workspaceId
    const run = this.store.bySession(sessionId)
    if (run === undefined) throw new RpcError(`Workspace ${sessionId} is not a Hub workspace on this host`)
    if (!this.ctx.workspaceRegistry?.archivedSessionIds?.includes(sessionId)) {
      await this.ctx.workspaceController.archiveSession({ sessionId, stopActivity: true })
    }
    await this.store.put({ ...run, archivedAt: new Date().toISOString() })
    this.journal.add({ kind: 'run.archived', message: 'Hub archived the run', sessionId })
    this.reply('archive_workspace_response', message.requestId, { workspaceId: sessionId, success: true, error: null })
    this.publishUpdate(sessionId)
  }

  inspectRecovery(message) {
    const sessionId = message.workspaceId
    const archived = this.ctx.workspaceRegistry?.archivedSessionIds?.includes(sessionId) === true
    const known = this.store.bySession(sessionId) !== undefined
    const state = !known
      ? { kind: 'unavailable', reason: 'workspace_not_found' }
      : archived ? { kind: 'recoverable' } : { kind: 'unavailable', reason: 'workspace_not_archived' }
    this.reply('workspace.recovery.inspect.response', message.requestId, { state })
  }

  async restore(message) {
    const sessionId = message.workspaceId
    const run = this.store.bySession(sessionId)
    if (run === undefined) throw new RpcError(`Workspace ${sessionId} is not a Hub workspace on this host`)
    if (this.ctx.workspaceRegistry?.archivedSessionIds?.includes(sessionId)) {
      await this.ctx.workspaceController.unarchiveSession({ sessionId })
    }
    await this.ctx.sessionController.resolveAgent(sessionId)
    await this.store.put({ ...run, archivedAt: null })
    this.journal.add({ kind: 'run.restored', message: 'Hub restored the run', sessionId })
    this.reply('workspace.recovery.restore.response', message.requestId, { workspaceId: sessionId, accepted: true, error: null })
    this.publishUpdate(sessionId)
  }

  async setTitle(message) {
    const sessionId = message.workspaceId
    const run = this.store.bySession(sessionId)
    const title = typeof message.title === 'string' ? message.title.trim().slice(0, 200) : ''
    if (run !== undefined && title) {
      await this.ctx.sessionController.rename({ sessionId, title })
      await this.store.put({ ...run, title })
    }
    this.reply('workspace.title.set.response', message.requestId, { workspaceId: sessionId, accepted: run !== undefined, title: title || null, error: run === undefined ? 'unknown workspace' : null })
  }

  async readFile(message) {
    try {
      const run = this.store.bySession(message.agentId)
      if (run === undefined) throw new Error('unknown Hub agent')
      const session = this.ctx.agents.get(message.agentId)?.session
      const cwdRoot = await realpath(this.ctx.get?.('workingDirectory')?.get?.(session) ?? session?.header?.cwd ?? run.cwd)
      const target = await realpath(resolve(cwdRoot, String(message.path ?? '')))
      const inside = relative(cwdRoot, target)
      if (inside === '' || inside.startsWith('..') || isAbsolute(inside) || inside.split(sep)[0] === '..') throw new Error('path is outside the agent working directory')
      const info = await stat(target)
      if (!info.isFile()) throw new Error('path is not a file')
      if (info.size > message.maxBytes) throw new Error(`File ${inside} is larger than ${message.maxBytes} bytes`)
      const handle = await open(target, 'r')
      let bytes
      try { bytes = await handle.readFile() } finally { await handle.close() }
      if (bytes.byteLength > message.maxBytes) throw new Error(`File ${inside} is larger than ${message.maxBytes} bytes`)
      this.reply('hub.agent.file.read.response', message.requestId, {
        file: {
          path: inside.split(sep).join('/'),
          fileName: basename(target),
          mimeType: MIME[extname(target).toLowerCase()] ?? 'application/octet-stream',
          size: bytes.byteLength,
          contentBase64: bytes.toString('base64'),
        },
        error: null,
      })
    } catch (error) {
      this.reply('hub.agent.file.read.response', message.requestId, { file: null, error: error?.message ?? String(error) })
    }
  }

  publishUpdate(sessionId) {
    if (!this.isRelevant(sessionId)) return
    this.emit({ type: 'agent_update', payload: { kind: 'upsert', agent: agentSnapshot(this.ctx, sessionId, this.store.bySession(sessionId)) } })
  }

  stream(sessionId, event) {
    if (!this.watched.has(sessionId)) return
    this.emit({ type: 'agent_stream', payload: { agentId: sessionId, event: { provider: HUB_PROVIDER, ...event }, timestamp: new Date().toISOString() } })
  }

  onStatus(sessionId) {
    this.publishUpdate(sessionId)
  }

  onSessionEvent(sessionId, event) {
    switch (event.type) {
      case 'turn/start':
        return this.stream(sessionId, { type: 'turn_started' })
      case 'turn/end': {
        const reason = event.data.reason
        if (reason?.kind === 'aborted') return this.stream(sessionId, { type: 'turn_canceled', reason: 'interrupted' })
        if (reason?.kind === 'error') return this.stream(sessionId, { type: 'turn_failed', error: reason.error?.message ?? 'DSH turn failed' })
        return this.stream(sessionId, { type: 'turn_completed' })
      }
      case 'user/message': {
        if (event.data.source?.kind !== 'user') return
        return this.stream(sessionId, { type: 'timeline', item: { type: 'user_message', text: textOf(event.data.content), messageId: event.data.source.rpcId ?? event.data.id } })
      }
      case 'assistant/message': {
        const message = event.data.message
        const reasoning = (message.content ?? []).filter(block => block.type === 'reasoning').map(block => block.text).join('')
        if (reasoning) this.stream(sessionId, { type: 'timeline', item: { type: 'reasoning', text: reasoning } })
        const text = textOf(message.content)
        if (text) this.stream(sessionId, { type: 'timeline', item: { type: 'assistant_message', text, messageId: message.id } })
        return
      }
      case 'tool/call': {
        const calls = this.callNames.get(sessionId) ?? new Map()
        calls.set(event.data.callId, event.data.name)
        this.callNames.set(sessionId, calls)
        return this.stream(sessionId, { type: 'timeline', item: toolItem(event.data.callId, event.data.name, 'running', event.data.arguments) })
      }
      case 'tool/result': {
        const callId = event.data.message.toolCallId
        const calls = this.callNames.get(sessionId)
        const name = calls?.get(callId) ?? 'tool'
        calls?.delete(callId)
        const failed = event.data.message.isError === true
        return this.stream(sessionId, { type: 'timeline', item: toolItem(callId, name, failed ? 'failed' : 'completed', undefined, failed ? textOf(event.data.message.content).slice(0, 2000) || 'failed' : null) })
      }
    }
  }
}

function toolItem(callId, name, status, args, error = null) {
  let input = null
  if (typeof args === 'string' && args) {
    try { input = JSON.parse(args) } catch { input = args }
  }
  return {
    type: 'tool_call',
    callId,
    name,
    status,
    error,
    detail: { type: 'unknown', input, output: null },
  }
}

function sanitizeEnv(env) {
  const result = {}
  for (const [key, value] of Object.entries(env ?? {})) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || key.toUpperCase().startsWith('DSH_')) continue
    if (typeof value !== 'string' || value.includes('\0')) continue
    result[key] = value
  }
  return result
}
