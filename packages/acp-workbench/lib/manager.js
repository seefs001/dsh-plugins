import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { AcpConnection, RpcError } from './transport.js'
import { WorkbenchStore } from './store.js'

const ACTIVE = new Set(['starting', 'idle', 'running', 'waiting', 'canceling'])
const USER_ONLY = new Set(['provider-save', 'provider-remove', 'diagnose', 'models', 'discover', 'import', 'respond', 'configure'])
/** Model tools may inspect a DSH-bound conversation; its lifecycle belongs to the conversation controls. */
const AGENT_NATIVE_READ = new Set(['get', 'events'])
const now = () => new Date().toISOString()
const str = (value, name, max = 1000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${name} must be non-empty text (max ${max})`)
  return value.trim()
}
const cli = name => existsSync(join(homedir(), '.local/bin', name)) ? join(homedir(), '.local/bin', name) : name
const DEFAULT_PROVIDERS = [
  { id: 'cursor', label: 'Cursor', command: cli('cursor-agent'), args: ['acp'], models: [] },
  { id: 'antigravity', label: 'Antigravity', command: cli('agy'), args: ['acp'], models: [] },
  // Claude Code speaks ACP through @agentclientprotocol/claude-agent-acp, which serves stdio without arguments.
  { id: 'claude-code', label: 'Claude Code', command: cli('claude-agent-acp'), args: [], models: [] },
]
// Before defaults were tracked individually, the first start seeded exactly these.
const ORIGINAL_DEFAULTS = ['cursor', 'antigravity']
const MAX_MODELS = 200

/** Models a session result advertises, through the standard model list or a `model` config option. */
export function advertisedModels(result) {
  const listed = result?.models?.availableModels
  if (Array.isArray(listed) && listed.length) {
    return listed.filter(model => typeof model?.modelId === 'string').map(model => ({ id: model.modelId, name: model.name ?? model.modelId }))
  }
  const option = (result?.configOptions ?? []).find(item => item?.category === 'model' && item.type !== 'boolean')
  return (option?.options ?? []).flatMap(group => group.options ?? [group])
    .filter(item => typeof item?.value === 'string').map(item => ({ id: item.value, name: item.name ?? item.value }))
}

export function summary(session) {
  const { id, providerId, title, cwd, state, remoteId, createdAt, updatedAt, archived, eventSeq, lastError, stopReason, ownerSessionId } = session
  return { id, providerId, title, cwd, state, remoteId, createdAt, updatedAt, archived, eventSeq, lastError, stopReason, ownerSessionId,
    native: session.native ? { sessionId: session.native.sessionId, route: session.native.route, retired: !!session.native.retired } : null }
}

/** The sole business Interface for browser actions and scoped model tools. */
const CLIENT_INFO = { name: 'dsh-acp-workbench', version: '0.2.0' }

export class Workbench {
  constructor({ domain, subprocess, changed, log, autoApprove }) {
    this.subprocess = subprocess
    this.changed = changed
    this.log = log
    /** Optional policy: returns the option id to select for a permission request, or null to ask the user. */
    this.autoApprove = autoApprove
    this.runtimes = new Map()
    this.listeners = new Map()
    this.probes = new Set()
    this.closed = false
    this.store = new WorkbenchStore(domain, error => {
      this.log?.(`ACP storage: ${error.message}`)
      this.changed()
    })
  }

  async initialize() {
    // Seed each default provider once. A default the user removed stays removed, and a
    // default added in a later version still reaches existing installations.
    const global = this.store.domain.global.get()
    const seeded = new Set(global.seeded ?? (global.initialized ? ORIGINAL_DEFAULTS : []))
    let seed = !global.initialized
    for (const provider of DEFAULT_PROVIDERS) {
      if (seeded.has(provider.id)) continue
      if (!this.store.providers.has(provider.id)) await this.store.saveProvider(provider)
      seeded.add(provider.id)
      seed = true
    }
    if (seed) await this.store.domain.global.set({ ...global, initialized: true, seeded: [...seeded] })
    for (const session of this.store.sessions.values()) {
      if (ACTIVE.has(session.state)) {
        session.state = 'disconnected'
        session.lastError = 'Host restarted; reconnect explicitly to resume this conversation.'
        this.store.append(session, 'lifecycle', { state: 'disconnected', reason: 'host-restart' })
        await this.store.saveSession(session)
      }
    }
    await this.store.flush()
  }

  provider(id) {
    const provider = this.store.providers.get(id)
    if (!provider) throw new Error('Unknown ACP provider')
    return provider
  }

  session(id, caller) {
    const session = this.store.sessions.get(id)
    if (!session) throw new Error('Unknown workbench session')
    if (caller.kind !== 'user' && session.ownerSessionId !== caller.sessionId) throw new Error('This external session belongs to another DSH session; open it in ACP Workbench as the user')
    return session
  }

  snapshot(caller) {
    return {
      providers: [...this.store.providers.values()],
      sessions: [...this.store.sessions.values()].filter(s => caller.kind === 'user' || s.ownerSessionId === caller.sessionId).map(summary).toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      storageError: this.store.failure?.message ?? null,
    }
  }

  detail(session) {
    const runtime = this.runtimes.get(session.id)
    return { ...summary(session), capabilities: session.capabilities ?? {}, authMethods: session.authMethods ?? [], modes: session.modes ?? null,
      models: session.models ?? null, configOptions: session.configOptions ?? [], commands: session.commands ?? [], usage: session.usage ?? null,
      interactions: runtime ? [...runtime.interactions.values()].map(({ public: value }) => value) : [],
      storageError: this.store.failure?.message ?? null }
  }

  record(session, type, data) {
    const event = this.store.append(session, type, data)
    this.changed(session.id)
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

  async transition(session, state, detail = {}) {
    session.state = state
    this.changed(session.id)
    this.record(session, 'lifecycle', { state, ...detail })
    await this.store.saveSession(session)
    await this.store.flush()
  }

  async directory(value) {
    if (!isAbsolute(str(value, 'cwd', 4096))) throw new Error('cwd must be absolute')
    const cwd = await realpath(value)
    if (!(await stat(cwd)).isDirectory()) throw new Error('cwd is not a directory')
    return cwd
  }

  async operate(op, caller) {
    if (!op || typeof op !== 'object' || Array.isArray(op)) throw new Error('Expected an operation object')
    if (this.closed) throw new Error('ACP Workbench is unloading')
    if (USER_ONLY.has(op.action) && caller.kind !== 'user') throw new Error('This operation requires the human user in ACP Workbench')
    switch (op.action) {
      case 'list': return this.snapshot(caller)
      case 'provider-save': return this.saveProvider(op.provider)
      case 'provider-remove': {
        const provider = this.provider(op.providerId)
        if ([...this.store.sessions.values()].some(s => s.providerId === provider.id && this.runtimes.has(s.id))) throw new Error('Disconnect this provider’s sessions first')
        await this.store.removeProvider(provider.id)
        this.changed()
        return { removed: provider.id }
      }
      case 'diagnose': return this.probe(op.providerId, op.cwd, 'diagnose')
      case 'models': return this.probe(op.providerId, op.cwd, 'models')
      case 'discover': return this.probe(op.providerId, op.cwd, 'discover', op.cursor)
      case 'create': return this.create(op, caller)
      case 'import': return this.create({ ...op, remoteId: str(op.remoteId, 'remoteId', 1000), connect: false }, caller)
      default: break
    }
    const session = this.session(op.sessionId, caller)
    // Archiving or disconnecting a binding from a model tool would break the conversation's ACP route.
    if (caller.kind !== 'user' && session.native && !AGENT_NATIVE_READ.has(op.action)) {
      throw new Error('This ACP conversation is bound to DSH. It is read-only for tools; the user manages it from the conversation controls.')
    }
    switch (op.action) {
      case 'get': return this.detail(session)
      case 'events':
        if (!Number.isSafeInteger(op.after ?? 0) || (op.after ?? 0) < 0 || !Number.isSafeInteger(op.limit ?? 80) || (op.limit ?? 80) < 1) throw new Error('after must be a non-negative integer and limit a positive integer')
        return this.store.events(session, op.after ?? 0, op.limit ?? 80)
      case 'connect': await this.connect(session); return this.detail(session)
      case 'prompt':
        if (session.native) throw new Error('This ACP conversation is bound to DSH. Send messages using its normal composer.')
        return this.prompt(session, op.text)
      case 'cancel': await this.cancel(session); return this.detail(session)
      case 'disconnect': await this.disconnect(session); return this.detail(session)
      case 'respond': return this.respond(session, op)
      case 'configure': return this.configure(session, op)
      case 'rename': session.title = str(op.title, 'title', 160); break
      case 'archive':
        if (this.runtimes.has(session.id)) throw new Error('Disconnect before archiving')
        session.archived = true
        break
      case 'restore': session.archived = false; break
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
    // Models the CLI advertised are discovery facts, not user settings; keep them across edits.
    const previous = this.store.providers.get(id)
    const provider = { id, label: str(raw.label, 'label', 100), command, args: raw.args, models: cleanModels,
      ...(previous?.advertised ? { advertised: previous.advertised } : {}) }
    await this.store.saveProvider(provider)
    this.changed()
    return provider
  }

  /** Cache candidates for ACP Settings; discovery never changes the user-selected model list. */
  async noteAdvertised(providerId, models) {
    const provider = this.store.providers.get(providerId)
    if (!provider || !models.length) return
    if (JSON.stringify(provider.advertised?.models) === JSON.stringify(models)) return
    await this.store.saveProvider({ ...provider, advertised: { at: now(), models } })
    this.changed()
  }

  async create(op, caller) {
    this.store.assertWritable()
    const provider = this.provider(op.providerId)
    const cwd = await this.directory(op.cwd)
    if (this.closed) throw new Error('ACP Workbench is unloading')
    const session = { id: randomUUID(), providerId: provider.id, title: op.title ? str(op.title, 'title', 160) : `${provider.label} · ${cwd.split('/').at(-1) || cwd}`,
      cwd, state: 'disconnected', remoteId: op.remoteId ?? null, ownerSessionId: caller.kind === 'user' ? null : caller.sessionId,
      createdAt: now(), updatedAt: now(), archived: false, eventSeq: 0, lastError: null, stopReason: null }
    await this.store.saveSession(session)
    this.record(session, 'lifecycle', { state: 'disconnected', reason: op.remoteId ? 'imported' : 'created' })
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

  async probe(providerId, rawCwd, mode, cursor) {
    const provider = this.provider(providerId)
    const cwd = await this.directory(rawCwd)
    const connection = await this.spawn(provider, cwd, {
      onNotification: () => {}, onRequest: () => { throw new RpcError('Read-only capability probe', -32601) },
    })
    this.probes.add(connection)
    try {
      if (this.closed) throw new Error('ACP Workbench is unloading')
      const info = await connection.request('initialize', { protocolVersion: 1, clientCapabilities: {}, clientInfo: CLIENT_INFO })
      if (info.protocolVersion !== 1) throw new Error(`Unsupported ACP version ${info.protocolVersion}`)
      if (mode === 'diagnose') return { command: [provider.command, ...provider.args], ...info }
      if (mode === 'models') {
        // ACP only reports models for a session. The user asked for this explicitly; the
        // empty session is never prompted.
        const result = await connection.request('session/new', { cwd, mcpServers: [] }, 60_000)
        const models = advertisedModels(result)
        await this.noteAdvertised(provider.id, models)
        return { models, sessionId: result.sessionId ?? null }
      }
      if (!info.agentCapabilities?.sessionCapabilities?.list) throw new Error('This provider does not advertise session/list')
      return await connection.request('session/list', { cwd, ...(cursor ? { cursor } : {}) })
    } finally { try { await connection.stop() } finally { this.probes.delete(connection) } }
  }

  isCurrent(session, runtime) { return !this.closed && this.runtimes.get(session.id) === runtime && !runtime.closing }

  async connect(session) {
    if (this.closed) throw new Error('ACP Workbench is unloading')
    this.store.assertWritable()
    if (session.archived) throw new Error('Restore this session before connecting')
    if (this.runtimes.has(session.id)) throw new Error('Session is already connected or starting')
    const provider = structuredClone(this.provider(session.providerId))
    const runtime = { generation: randomUUID(), connection: null, interactions: new Map(), closing: false, replaying: !!session.remoteId, turnId: null }
    runtime.spawnReady = new Promise(resolve => { runtime.releaseSpawn = resolve })
    this.runtimes.set(session.id, runtime)
    session.lastError = null
    try {
      await this.transition(session, 'starting')
      if (!this.isCurrent(session, runtime)) throw new Error('Connection was canceled before startup')
      const connection = await this.spawn(provider, session.cwd, {
        onNotification: (method, params) => this.notification(session, runtime, method, params),
        onRequest: (method, params) => this.request(session, runtime, method, params),
        onStderr: text => {
          if (this.isCurrent(session, runtime) && text) this.record(session, 'stderr', { text })
        },
        onExit: error => { void this.failed(session, runtime, error).catch(e => this.log?.(e.message)) },
      })
      runtime.connection = connection
      runtime.releaseSpawn()
      if (!this.isCurrent(session, runtime)) { await connection.stop(); throw new Error('Connection was canceled during startup') }
      // The picker selects opaque CLI variant IDs, not separate model parameters.
      const info = await connection.request('initialize', {
        protocolVersion: 1, clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false }, clientInfo: CLIENT_INFO,
      })
      if (info.protocolVersion !== 1) throw new Error(`Unsupported ACP version ${info.protocolVersion}`)
      session.capabilities = info.agentCapabilities ?? {}
      session.authMethods = info.authMethods ?? []
      this.record(session, 'initialize', info)
      if (session.remoteId && !session.capabilities.loadSession) throw new Error('This provider cannot load the previous session; create a new one explicitly')
      const result = await connection.request(session.remoteId ? 'session/load' : 'session/new', {
        cwd: session.cwd, mcpServers: [], ...(session.remoteId ? { sessionId: session.remoteId } : {}),
      }, 60_000)
      if (!this.isCurrent(session, runtime)) throw new Error('Connection was canceled during startup')
      if (!session.remoteId) session.remoteId = str(result.sessionId, 'ACP sessionId', 1000)
      session.modes = result.modes ?? session.modes ?? null
      session.models = result.models ?? session.models ?? null
      session.configOptions = result.configOptions ?? session.configOptions ?? []
      runtime.replaying = false
      this.record(session, 'session', result)
      await this.noteAdvertised(session.providerId, advertisedModels(result))
      await this.transition(session, 'idle')
    } catch (error) {
      runtime.releaseSpawn()
      await this.failed(session, runtime, error)
      throw error
    }
  }

  async notification(session, runtime, method, params) {
    if (!this.isCurrent(session, runtime)) return
    if (params.sessionId && session.remoteId && params.sessionId !== session.remoteId) return
    this.record(session, 'notification', { method, params, replay: runtime.replaying, turnId: runtime.turnId })
    const update = method === 'session/update' ? params.update : null
    if (!update) return
    switch (update.sessionUpdate) {
      case 'config_option_update':
        session.configOptions = update.configOptions ?? []
        await this.noteAdvertised(session.providerId, advertisedModels({ configOptions: session.configOptions }))
        break
      case 'current_mode_update': session.modes = { ...session.modes, currentModeId: update.currentModeId }; break
      case 'available_commands_update': session.commands = update.availableCommands ?? []; break
      case 'usage_update': session.usage = update; break
      case 'session_info_update': if (update.title) session.title = update.title; break
      default: break
    }
  }

  async request(session, runtime, method, params) {
    if (!this.isCurrent(session, runtime) || runtime.canceling) return { outcome: { outcome: 'cancelled' } }
    if (params.sessionId && session.remoteId && params.sessionId !== session.remoteId) throw new RpcError('Wrong session', -32602)
    const normalized = method.replace(/^_/, '')
    let kind
    if (normalized === 'session/request_permission') kind = 'permission'
    else if (normalized === 'cursor/ask_question') kind = 'question'
    else if (normalized === 'cursor/create_plan') kind = 'plan'
    else throw new RpcError(`Unsupported client method: ${method}`, -32601)
    if (!runtime.turnId) throw new RpcError('Interactive requests require an active prompt', -32600)
    const id = randomUUID()
    const interaction = { id, kind, method, params, turnId: runtime.turnId, createdAt: now() }
    let automatic = null
    try { if (kind === 'permission') automatic = this.autoApprove?.(session, params) ?? null } catch (error) { this.log?.(`ACP auto-approval: ${error.message}`) }
    const option = automatic === null ? null : params.options?.find(item => item.optionId === automatic)
    if (option) {
      // Recorded and flushed before the agent hears the answer, exactly like a human response.
      const result = { outcome: { outcome: 'selected', optionId: option.optionId } }
      this.record(session, 'interaction', interaction)
      this.record(session, 'interaction-result', { id, result, automatic: 'full-access', optionKind: option.kind ?? null, optionName: option.name ?? null })
      await this.store.flush()
      return result
    }
    let resolve
    const answer = new Promise(r => { resolve = r })
    runtime.interactions.set(id, { public: interaction, resolve })
    this.record(session, 'interaction', interaction)
    await this.transition(session, 'waiting')
    return answer
  }

  async respond(session, op) {
    const runtime = this.runtimes.get(session.id)
    const pending = runtime?.interactions.get(op.interactionId)
    if (!pending || pending.responding || runtime.closing || runtime.canceling) throw new Error('This interaction has expired or already been answered')
    const { kind, params } = pending.public
    let result
    if (op.cancel === true) result = { outcome: { outcome: 'cancelled' } }
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
    this.record(session, 'interaction-result', { id: pending.public.id, result })
    await this.store.flush()
    // A cancel/disconnect may have happened while the answer was persisted.
    if (!this.isCurrent(session, runtime) || runtime.canceling || !runtime.interactions.has(op.interactionId)) throw new Error('Interaction expired while saving the response')
    runtime.interactions.delete(op.interactionId)
    pending.resolve(result)
    await this.transition(session, runtime.interactions.size ? 'waiting' : 'running')
    return { answered: op.interactionId }
  }

  expire(session, runtime, reason) {
    for (const [id, pending] of runtime.interactions) {
      pending.resolve({ outcome: { outcome: 'cancelled' } })
      if (!this.store.failure) this.record(session, 'interaction-expired', { id, reason })
    }
    runtime.interactions.clear()
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
    runtime.canceling = false
    const turnId = runtime.turnId
    session.stopReason = null
    try {
      this.record(session, 'user-message', { text, turnId,
        attachments: options.content?.filter(p => p.type !== 'text').map(p => ({ type: p.type, mimeType: p.mimeType ?? null, name: p.name ?? null, uri: p.uri ?? null })) ?? [] })
      await this.transition(session, 'running')
    } catch (error) { await this.failed(session, runtime, error); throw error }
    if (!this.isCurrent(session, runtime) || runtime.canceling) throw new Error('Prompt canceled before sending')
    const completion = runtime.connection.request('session/prompt', { sessionId: session.remoteId, prompt: options.content ?? [{ type: 'text', text }] }, 0)
    runtime.completion = completion.then(async result => {
      if (!this.isCurrent(session, runtime)) return
      clearTimeout(runtime.cancelTimer)
      this.expire(session, runtime, 'turn-finished')
      session.stopReason = result.stopReason ?? null
      runtime.turnId = null
      runtime.canceling = false
      this.record(session, 'turn-result', { turnId, ...result })
      await this.transition(session, 'idle')
      return result
    }, async error => {
      if (this.agentRejected(session, runtime, error) && runtime.turnId === turnId) {
        // The agent answered with an error (authentication, quota, invalid input). The process and
        // its remote session are still healthy, so keep them for the next prompt instead of reloading.
        clearTimeout(runtime.cancelTimer)
        this.expire(session, runtime, 'turn-error')
        runtime.turnId = null
        runtime.canceling = false
        this.record(session, 'turn-error', { turnId, message: error.message, code: error.code })
        try { await this.transition(session, 'idle') } catch (failure) { await this.failed(session, runtime, failure) }
        throw error
      }
      await this.failed(session, runtime, error)
      throw error
    })
    runtime.completion.catch(error => this.log?.(`ACP prompt: ${error.message}`))
    return { accepted: true, sessionId: session.id, turnId }
  }

  /** An error reply from a live connection, as opposed to a transport or process failure. */
  agentRejected(session, runtime, error) {
    return error instanceof RpcError && this.isCurrent(session, runtime) && !runtime.connection?.closed
  }

  /**
   * Apply one mode, model or option change to an idle connection.
   * @param options.chosen - the value comes from the user's model picker, which may list models
   *   the CLI never advertised; the CLI decides whether it accepts them.
   */
  async configure(session, op, { chosen = false } = {}) {
    const runtime = this.requireIdle(session)
    let method, params
    if (op.modeId !== undefined) {
      if (!session.modes?.availableModes?.some(m => m.id === op.modeId)) throw new Error('Unknown mode')
      method = 'session/set_mode'
      params = { modeId: op.modeId }
    } else if (op.configId !== undefined) {
      const option = session.configOptions?.find(o => o.id === op.configId)
      const choices = option?.options?.flatMap(o => o.options ?? [o]) ?? []
      const valid = option && (option.type === 'boolean' ? typeof op.value === 'boolean'
        : chosen && option.category === 'model' ? typeof op.value === 'string' && op.value.length > 0 : choices.some(o => o.value === op.value))
      if (!valid) throw new Error('Unknown configuration option or value')
      method = 'session/set_config_option'
      params = { configId: op.configId, value: op.value }
    } else {
      if (typeof op.modelId !== 'string' || !op.modelId || (!chosen && !session.models?.availableModels?.some(m => m.modelId === op.modelId))) throw new Error('Unknown model')
      method = 'session/set_model'
      params = { modelId: op.modelId }
    }
    // Exclude prompts and another config mutation until the external result settles.
    session.state = 'starting'
    this.changed(session.id)
    try {
      const result = await runtime.connection.request(method, { sessionId: session.remoteId, ...params })
      if (!this.isCurrent(session, runtime)) throw new Error('Session disconnected during configuration')
      if (result.configOptions) {
        session.configOptions = result.configOptions
        await this.noteAdvertised(session.providerId, advertisedModels(result))
      } else if (op.configId !== undefined) {
        // Without an echoed option list, record the accepted value so it is not re-applied every turn.
        const option = session.configOptions.find(o => o.id === op.configId)
        if (option) option.currentValue = op.value
      }
      if (op.modeId !== undefined) session.modes.currentModeId = op.modeId
      if (op.modelId !== undefined) session.models = { ...session.models, currentModelId: op.modelId }
      this.record(session, 'configuration', { method, params, result })
      await this.transition(session, 'idle')
      return this.detail(session)
    } catch (error) {
      if (this.agentRejected(session, runtime, error)) {
        // A refused setting leaves the previous configuration in place; the connection stays usable.
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
    runtime.canceling = true
    this.expire(session, runtime, 'user-cancel')
    try { await this.transition(session, 'canceling') } catch (error) { await this.disconnect(session, 'cancel-persistence-failed'); throw error }
    // A rejected interaction can finish the prompt while cancellation is persisting.
    if (!this.isCurrent(session, runtime) || !runtime.canceling || runtime.turnId !== turnId) return
    runtime.cancelTimer = setTimeout(() => {
      if (runtime.turnId === turnId && runtime.canceling) void this.disconnect(session, 'cancel-timeout').catch(error => this.log?.(error.message))
    }, 5_000)
    try { runtime.connection.notify('session/cancel', { sessionId: session.remoteId }) } catch (error) { await this.failed(session, runtime, error); throw error }
  }

  async failed(session, runtime, error) {
    if (runtime.shutdown) return runtime.shutdown
    if (!this.isCurrent(session, runtime)) return
    runtime.closing = true
    clearTimeout(runtime.cancelTimer)
    this.expire(session, runtime, 'connection-failed')
    session.lastError = error.message ?? String(error)
    runtime.shutdown = (async () => {
      try {
        await runtime.spawnReady
        try { await runtime.connection?.stop() } catch (failure) { session.lastError += `; cleanup failed: ${failure.message}` }
        await this.transition(session, 'error', { message: session.lastError })
      } finally {
        if (this.runtimes.get(session.id) === runtime) this.runtimes.delete(session.id)
        this.changed(session.id)
      }
    })()
    return runtime.shutdown
  }

  async disconnect(session, reason = 'user-disconnect') {
    const runtime = this.runtimes.get(session.id)
    if (!runtime) return
    if (runtime.shutdown) return runtime.shutdown
    runtime.closing = true
    clearTimeout(runtime.cancelTimer)
    this.expire(session, runtime, reason)
    runtime.shutdown = (async () => {
      try {
        await runtime.spawnReady
        if (runtime.connection && runtime.turnId && !runtime.connection.closed) runtime.connection.notify('session/cancel', { sessionId: session.remoteId })
        await runtime.connection?.stop()
        await this.transition(session, 'disconnected', { reason })
      } catch (error) {
        session.lastError = `Disconnect cleanup failed: ${error.message}`
        await this.transition(session, 'error', { message: session.lastError })
        throw error
      } finally {
        if (this.runtimes.get(session.id) === runtime) this.runtimes.delete(session.id)
        this.changed(session.id)
      }
    })()
    return runtime.shutdown
  }

  async close() {
    // disconnect checks generation independently; stop admission before awaiting cleanup.
    this.closed = true
    const results = await Promise.allSettled([
      ...[...this.runtimes.keys()].map(id => this.disconnect(this.store.sessions.get(id), 'plugin-unload')),
      ...[...this.probes].map(connection => connection.stop()),
    ])
    await this.store.close()
    const failures = results.filter(r => r.status === 'rejected').map(r => r.reason)
    if (failures.length) throw new AggregateError(failures, 'Some ACP processes failed to stop')
  }
}
