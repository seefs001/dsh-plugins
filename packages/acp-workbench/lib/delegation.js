import { execFile } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { visibleModels } from './models.js'
import { resolveAdapter } from './adapters.js'
import {
  MCP_META_KEYS,
  MCP_MODERN_PROTOCOL_VERSION,
  MCP_PROXY_SERVER_NAME,
  buildMcpDiscoverResult,
  buildMcpInitializeResult,
  discoverDshMcpServers,
  handleMcpBridgeRequest,
  isModernMcpProtocolVersion,
  negotiateMcpProtocolVersion,
  parseMcpRequestContext,
} from './mcp-bridge.js'

const execFileAsync = promisify(execFile)
const STDIO_BRIDGE_PATH = fileURLToPath(new URL('./mcp-stdio.js', import.meta.url))
const MCP_SERVER_NAME = 'dsh_agents'
const EXCLUDED_FORWARD_SERVERS = new Set([MCP_SERVER_NAME, MCP_PROXY_SERVER_NAME])
const MAX_BODY_BYTES = 1024 * 1024
const MAX_RESULT_CHARS = 12_000
const AGENT_NAME_RE = /^[a-z][a-z0-9-]{0,31}$/u
const BRANCH_RE = /^[a-zA-Z0-9._/-]{1,80}$/u
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

function sanitizeAgentName(raw) {
  if (typeof raw !== 'string') return undefined
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .replace(/^[0-9-]+/u, '')
    .slice(0, 32)
    .replace(/-+$/gu, '')
  return slug && slug !== 'lead' && AGENT_NAME_RE.test(slug) ? slug : undefined
}

function sanitizeBranch(raw) {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed || !BRANCH_RE.test(trimmed)) return ''
  if (trimmed.startsWith('-') || trimmed.startsWith('/') || trimmed.endsWith('/') || trimmed.includes('..') || trimmed.includes('//') || trimmed.endsWith('.lock')) return ''
  return trimmed
}

function sanitizeRef(raw) {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 160 || trimmed.startsWith('-') || /[\s~^:?*[\]\\]/u.test(trimmed) || trimmed.includes('..')) return ''
  return trimmed
}

function compactText(text, max = MAX_RESULT_CHARS) {
  if (typeof text !== 'string') return ''
  if (text.length <= max) return text
  return `${text.slice(0, max)}\n… (truncated, ${text.length} chars total)`
}

function textFromContent(content) {
  if (!Array.isArray(content)) return ''
  return content
    .filter(block => block?.type === 'text' && typeof block.text === 'string' && block.text.trim())
    .map(block => block.text)
    .join('\n\n')
}

async function runGit(cwd, args, signal) {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    signal,
    timeout: 60_000,
    maxBuffer: 2 * 1024 * 1024,
  })
  return stdout.trim()
}

export async function createChildWorktree(sourceCwd, { name, branch, baseRef } = {}, signal) {
  if (!sourceCwd) throw new Error('Worktree isolation requires a parent session with a working directory')
  const repoRoot = await runGit(sourceCwd, ['rev-parse', '--show-toplevel'], signal)
  if (!repoRoot) throw new Error('Current directory is not inside a Git repository')
  const suffix = randomBytes(3).toString('hex')
  const safeBase = baseRef ? sanitizeRef(baseRef) : 'HEAD'
  if (baseRef && !safeBase) throw new Error('Invalid baseRef for git worktree')
  const chosenBranch = branch ? sanitizeBranch(branch) : `dsh-${sanitizeAgentName(name) ?? 'agent'}-${suffix}`
  if (branch && !chosenBranch) throw new Error('Invalid branch name for git worktree')
  const dirSlug = chosenBranch.replace(/[^a-zA-Z0-9._-]+/gu, '-').replace(/^-+|-+$/gu, '').slice(0, 64) || `agent-${suffix}`
  const poolDir = join(repoRoot, '.agents', 'worktrees')
  await mkdir(poolDir, { recursive: true })
  const targetPath = resolve(poolDir, `${dirSlug}-${suffix}`)
  let branchExists = false
  try {
    await runGit(repoRoot, ['show-ref', '--verify', '--quiet', `refs/heads/${chosenBranch}`], signal)
    branchExists = true
  } catch {}
  const args = branchExists && !baseRef
    ? ['worktree', 'add', targetPath, chosenBranch]
    : ['worktree', 'add', '-b', chosenBranch, targetPath, safeBase]
  await runGit(repoRoot, args, signal)
  return { path: targetPath, branch: chosenBranch, repoRoot }
}

const TOOL_SPECS = {
  list_providers: {
    name: 'list_providers',
    description: 'Discover available DSH native LLM providers and configured ACP CLI engines (Cursor, Antigravity, Claude Code, etc.), their models, modes, capabilities, and current subagent tree capacity.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        includeModels: { type: 'boolean', description: 'Include per-provider model lists (default true).' },
      },
    },
  },
  spawn_agent: {
    name: 'spawn_agent',
    description: 'Spawn a continuable child agent on either a native DSH model or any configured ACP CLI engine (e.g. "dsh", "cursor", "antigravity", "claude-code", or an exact provider route). Returns immediately after launching; results auto-deliver to your inbox when the child finishes, so do not poll. Use isolation="worktree" for parallel code edits to avoid file conflicts.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        prompt: { type: 'string', description: 'Complete, self-contained task instructions for the child agent.' },
        provider: { type: 'string', description: 'Target engine: "dsh" (native DSH model), an ACP provider ID/route ("cursor", "antigravity", "claude-code", "acp-*"), or a DSH LLM provider ID. Call list_providers to inspect options.' },
        model: { type: 'string', description: 'Optional model ID for the selected provider (defaults to provider default or CLI default).' },
        modeId: { type: 'string', description: 'Optional ACP CLI mode ID (e.g. plan/agent) advertised by list_providers.' },
        reasoningEffort: { type: 'string', description: 'Optional reasoning effort level supported by the selected model.' },
        name: { type: 'string', description: 'Optional short lowercase name unique among siblings (e.g. "reviewer", "ui-worker").' },
        label: { type: 'string', description: 'Optional short human-readable task label shown in the DSH subagent tree.' },
        isolation: { type: 'string', enum: ['inherit', 'worktree'], description: '"inherit" shares the current directory (best for read/review); "worktree" creates an isolated Git worktree branch for concurrent edits.' },
        branch: { type: 'string', description: 'Optional Git branch name when isolation="worktree".' },
        baseRef: { type: 'string', description: 'Optional local Git ref/commit to branch from when isolation="worktree" (defaults to HEAD).' },
        notifyOnFinish: { type: 'boolean', description: 'When true (default), DSH automatically delivers the child result to your inbox upon completion.' },
      },
      required: ['prompt'],
    },
  },
  list_agents: {
    name: 'list_agents',
    description: 'List all agents in the current collaboration tree (root "lead" and all native DSH / ACP subagents), including their names, engines, models, status, working directories, and pending approval counts.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  send_message: {
    name: 'send_message',
    description: 'Send a message to any agent in the current collaboration tree (parent "lead", child, or sibling) regardless of whether it runs on native DSH or an ACP CLI. Idle targets resume automatically.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        agent: { type: 'string', description: 'Target agent name from list_agents (e.g. "lead" or "reviewer").' },
        message: { type: 'string', description: 'Message text to deliver.' },
        behavior: { type: 'string', enum: ['followup', 'steer', 'interrupt'], description: '"followup" (default) delivers on the next turn/step; "steer" injects into an active turn when supported (otherwise falls back to followup); "interrupt" cancels an active descendant turn before delivering.' },
      },
      required: ['agent', 'message'],
    },
  },
  read_agent_result: {
    name: 'read_agent_result',
    description: 'Read the latest assistant response(s), status, and pending interaction count of an agent in your collaboration tree without loading its full tool trace.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        agent: { type: 'string', description: 'Target agent name from list_agents.' },
        tailTurns: { type: 'integer', description: 'Number of latest assistant replies to return (1-5, default 1).' },
      },
      required: ['agent'],
    },
  },
  interrupt_agent: {
    name: 'interrupt_agent',
    description: 'Request a running descendant subagent to stop its current turn. The subagent remains resumable via send_message.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        agent: { type: 'string', description: 'Name of a child or descendant agent from list_agents.' },
      },
      required: ['agent'],
    },
  },
}

const MCP_TOOL_LIST = Object.values(TOOL_SPECS).map(spec => ({
  name: spec.name,
  description: spec.description,
  inputSchema: spec.parameters,
}))

async function readJsonBody(req) {
  let bytes = 0
  const chunks = []
  for await (const chunk of req) {
    bytes += chunk.length
    if (bytes > MAX_BODY_BYTES) throw new Error('Request exceeds 1 MiB')
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8').trim()
  return text ? JSON.parse(text) : null
}

function writeJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders })
  res.end(JSON.stringify(payload))
}

export class DelegationHub {
  constructor(native, isRoute) {
    this.native = native
    this.ctx = native.ctx
    this.manager = native.manager
    this.isRoute = isRoute
    this.tokens = new Map()
    this.sessionTokens = new Map()
  }

  endpointUrl(serverName = MCP_SERVER_NAME) {
    const web = this.ctx.get('webServer')
    const port = web?.port
    if (!port) return null
    const host = web.host === '::1' ? '[::1]' : '127.0.0.1'
    const proto = web.tls ? 'https' : 'http'
    const base = `${proto}://${host}:${port}/acp-workbench/mcp`
    if (!serverName || serverName === MCP_SERVER_NAME) return base
    return `${base}/${encodeURIComponent(serverName)}`
  }

  mcpEntry(name, url, token, supportsHttp) {
    if (supportsHttp) {
      return {
        type: 'http',
        name,
        url,
        headers: [{ name: 'Authorization', value: `Bearer ${token}` }],
      }
    }
    return {
      name,
      command: process.execPath,
      args: [STDIO_BRIDGE_PATH],
      env: [
        { name: 'DSH_ACP_MCP_URL', value: url },
        { name: 'DSH_ACP_MCP_TOKEN', value: token },
      ],
    }
  }

  forwardedServerNames(caller) {
    return discoverDshMcpServers(this.ctx, caller, EXCLUDED_FORWARD_SERVERS)
  }

  issueToken(sessionId) {
    const existing = this.sessionTokens.get(sessionId)
    if (existing && this.tokens.has(existing)) return existing
    const token = randomBytes(32).toString('hex')
    this.tokens.set(token, { sessionId, issuedAt: Date.now() })
    this.sessionTokens.set(sessionId, token)
    return token
  }

  revokeSession(sessionId) {
    const token = this.sessionTokens.get(sessionId)
    if (!token) return
    this.sessionTokens.delete(sessionId)
    this.tokens.delete(token)
  }

  clearTokens() {
    this.tokens.clear()
    this.sessionTokens.clear()
  }

  mcpServersFor(session, adapter) {
    const dshSessionId = session?.native?.sessionId
    if (!dshSessionId) return []
    const delegationUrl = this.endpointUrl(MCP_SERVER_NAME)
    if (!delegationUrl) return []
    const token = this.issueToken(dshSessionId)
    const supportsHttp = session.capabilities?.mcpCapabilities?.http === true
    const caller = this.ctx.agents?.get?.(dshSessionId)
    const forwarded = this.forwardedServerNames(caller)
    const entries = [this.mcpEntry(MCP_SERVER_NAME, delegationUrl, token, supportsHttp)]
    if (!forwarded.length) return entries
    const resolvedAdapter = adapter ?? resolveAdapter({
      providerId: session?.providerId,
      capabilities: session?.capabilities,
    })
    if (resolvedAdapter?.compactMcpBridge) {
      const proxyUrl = this.endpointUrl(MCP_PROXY_SERVER_NAME)
      if (proxyUrl) entries.push(this.mcpEntry(MCP_PROXY_SERVER_NAME, proxyUrl, token, supportsHttp))
      return entries
    }
    for (const serverName of forwarded) {
      const serverUrl = this.endpointUrl(serverName)
      if (!serverUrl) continue
      entries.push(this.mcpEntry(serverName, serverUrl, token, supportsHttp))
    }
    return entries
  }

  async resolveDefaultDshRoute(caller) {
    const current = caller.model.current()
    if (current?.provider && !this.isRoute(current.provider)) {
      return { provider: current.provider, model: current.model }
    }
    const utility = this.native.utilityRoute()
    if (utility) return utility
    const providers = (this.ctx.llm?.listProviders?.() ?? []).filter(p => !this.isRoute(p.id))
    for (const provider of providers) {
      try {
        const models = await this.ctx.llm.listModels(provider.id)
        if (models.length) return { provider: provider.id, model: models[0].id }
      } catch {}
    }
    return null
  }

  async resolveTargetEngine(caller, args) {
    const rawProvider = typeof args.provider === 'string' ? args.provider.trim() : ''
    const requestedModel = typeof args.model === 'string' && args.model.trim() ? args.model.trim() : undefined
    const requestedEffort = typeof args.reasoningEffort === 'string' && args.reasoningEffort.trim() ? args.reasoningEffort.trim() : undefined

    if (!rawProvider || ['dsh', 'native', 'spawn'].includes(rawProvider.toLowerCase())) {
      if (!this.ctx.subagents.getProvider('spawn')) {
        throw new Error('Native DSH subagent provider ("spawn") is not registered in this profile')
      }
      const fallback = await this.resolveDefaultDshRoute(caller)
      const providerId = fallback?.provider
      const modelId = requestedModel ?? fallback?.model
      if (!providerId || !modelId) {
        throw new Error('No native DSH LLM provider/model is available; specify a provider from list_providers')
      }
      return {
        subagentProvider: 'spawn',
        route: providerId,
        model: modelId,
        isAcp: false,
        agentOptions: {
          provider: providerId,
          model: modelId,
          ...(requestedEffort ? { reasoningEffort: requestedEffort } : {}),
        },
      }
    }

    const acpProviders = [...this.manager.store.providers.values()]
    const matchedAcp = acpProviders.find(item =>
      item.id.toLowerCase() === rawProvider.toLowerCase()
      || this.native.route(item.id).toLowerCase() === rawProvider.toLowerCase()
      || item.label.toLowerCase() === rawProvider.toLowerCase(),
    )
    if (matchedAcp) {
      const route = this.native.route(matchedAcp.id)
      const model = requestedModel ?? 'default'
      return {
        subagentProvider: route,
        route,
        model,
        isAcp: true,
        agentOptions: {
          provider: route,
          model,
          ...(requestedEffort ? { reasoningEffort: requestedEffort } : {}),
        },
      }
    }

    const llmProviders = (this.ctx.llm?.listProviders?.() ?? []).filter(p => !this.isRoute(p.id))
    const matchedLlm = llmProviders.find(p => p.id.toLowerCase() === rawProvider.toLowerCase())
    if (matchedLlm) {
      if (!this.ctx.subagents.getProvider('spawn')) {
        throw new Error('Native DSH subagent provider ("spawn") is not registered in this profile')
      }
      let model = requestedModel
      if (!model) {
        const models = await this.ctx.llm.listModels(matchedLlm.id)
        model = models[0]?.id
      }
      if (!model) throw new Error(`Provider "${matchedLlm.id}" has no available models; specify model explicitly`)
      return {
        subagentProvider: 'spawn',
        route: matchedLlm.id,
        model,
        isAcp: false,
        agentOptions: {
          provider: matchedLlm.id,
          model,
          ...(requestedEffort ? { reasoningEffort: requestedEffort } : {}),
        },
      }
    }

    throw new Error(`Unknown provider "${rawProvider}". Call list_providers to see available DSH and ACP engines.`)
  }

  async listProviders(caller, { includeModels = true } = {}) {
    const dshProviders = []
    for (const provider of (this.ctx.llm?.listProviders?.() ?? [])) {
      if (this.isRoute(provider.id)) continue
      let models = []
      if (includeModels) {
        try {
          models = (await this.ctx.llm.listModels(provider.id)).slice(0, 40).map(item => ({
            id: item.id,
            name: item.name ?? item.id,
            ...(item.reasoning?.efforts?.length ? { reasoningEfforts: item.reasoning.efforts.map(e => e.id ?? e) } : {}),
          }))
        } catch {}
      }
      dshProviders.push({ id: provider.id, name: provider.name ?? provider.id, kind: 'dsh', models })
    }

    const acpProviders = [...this.manager.store.providers.values()].map(provider => ({
      id: provider.id,
      route: this.native.route(provider.id),
      label: provider.label,
      kind: 'acp',
      modes: (provider.advertised?.modes?.options ?? []).map(m => ({ id: m.value, name: m.name ?? m.value })),
      steering: !!provider.advertised?.meta?.steering,
      models: includeModels
        ? visibleModels(provider).slice(0, 40).map(m => ({
            id: m.id,
            name: m.name ?? m.id,
            ...(m.efforts?.length ? { reasoningEfforts: m.efforts.map(e => e.value ?? e) } : {}),
          }))
        : [],
    }))

    let capacity = null
    let callerInfo = null
    if (caller) {
      try { capacity = this.ctx.subagents.capacityOf(caller) } catch {}
      try {
        const names = this.ctx.subagents.namesOf(caller)
        const current = caller.model.current()
        callerInfo = { name: names.self, parent: names.parent ?? null, provider: current?.provider ?? null, model: current?.model ?? null }
      } catch {}
    }
    return {
      caller: callerInfo,
      capacity,
      spawnSupported: !!this.ctx.subagents.getProvider('spawn'),
      dshProviders,
      acpProviders,
    }
  }

  async spawnAgent(caller, args, signal) {
    const prompt = typeof args?.prompt === 'string' ? args.prompt.trim() : ''
    if (!prompt) throw new Error('prompt must be a non-empty string')
    const target = await this.resolveTargetEngine(caller, args)
    const parentCwd = this.native.cwd(caller)
    const requestedName = sanitizeAgentName(args.name)
    const label = typeof args.label === 'string' && args.label.trim()
      ? args.label.trim().slice(0, 120)
      : (requestedName || prompt.split('\n')[0].trim().slice(0, 80) || target.route)

    let childCwd = parentCwd
    let worktree = null
    if (args.isolation === 'worktree') {
      worktree = await createChildWorktree(parentCwd, {
        name: requestedName ?? label,
        branch: args.branch,
        baseRef: args.baseRef,
      }, signal)
      childCwd = worktree.path
    }

    const childId = randomUUID()
    if (target.isAcp && typeof args.modeId === 'string' && args.modeId.trim()) {
      await this.native.savePreferences(childId, target.route, { mode: args.modeId.trim(), options: {} })
    }

    const activation = await this.ctx.subagents.startActivation({
      provider: target.subagentProvider,
      parent: caller,
      childId,
      label,
      ...(requestedName ? { name: requestedName } : {}),
      prompt: [{ type: 'text', text: prompt }],
      ...(childCwd ? { cwd: childCwd } : {}),
      agentOptions: target.agentOptions,
      maxDepth: this.ctx.subagents.resolveMaxDepth(),
      delivery: args.notifyOnFinish === false ? 'caller' : 'parent',
      signal,
    })

    return {
      agent: activation.name,
      sessionId: activation.childId,
      parentSessionId: caller.id,
      provider: target.route,
      model: target.model,
      cwd: childCwd ?? null,
      ...(worktree ? { branch: worktree.branch, worktree: worktree.path } : {}),
      notifyOnFinish: args.notifyOnFinish !== false,
    }
  }

  async listAgents(caller, signal) {
    const root = this.ctx.subagents.rootOf(caller)
    const selfNames = this.ctx.subagents.namesOf(caller)
    const descendants = await this.ctx.subagents.listDescendants(root.id, signal)

    const describeLive = (sessionId, fallbackName, parentName, mode) => {
      const live = this.ctx.agents.get(sessionId)
      const selection = live?.model.current() ?? null
      const acpBindings = this.native.sessions(sessionId, false).filter(s => !s.native.retired && !s.archived)
      const latestAcp = acpBindings.at(-1)
      const runtime = latestAcp ? this.manager.runtimes.get(latestAcp.id) : null
      const pendingInteractions = runtime ? [...runtime.interactions.values()].filter(item => !item.responding).length : 0
      return {
        name: fallbackName,
        sessionId,
        parent: parentName,
        mode,
        status: live?.status ?? (latestAcp ? latestAcp.state : 'idle'),
        provider: selection?.provider ?? latestAcp?.native?.route ?? null,
        model: selection?.model ?? null,
        cwd: live ? this.native.cwd(live) : (latestAcp?.cwd ?? null),
        pendingInteractions,
        self: sessionId === caller.id,
      }
    }

    const rows = [describeLive(root.id, 'lead', null, 'root')]
    const nameById = new Map([[root.id, 'lead']])
    for (const item of descendants) {
      if (item.kind !== 'child') continue
      const parentId = item.parentId ?? root.id
      const parentPath = nameById.get(parentId) ?? parentId
      const fullName = item.path
        ?? (item.name
          ? (parentPath === 'lead' ? item.name : `${parentPath}/${item.name}`)
          : item.id)
      nameById.set(item.id, fullName)
      rows.push({
        ...describeLive(item.id, fullName, parentPath, item.mode),
        label: item.label ?? null,
      })
    }
    return {
      self: selfNames.self,
      capacity: this.ctx.subagents.capacityOf(caller),
      agents: rows,
    }
  }

  async sendMessage(caller, args, signal) {
    const targetName = typeof args?.agent === 'string' ? args.agent.trim() : ''
    const message = typeof args?.message === 'string' ? args.message : ''
    if (!targetName || !message.trim()) throw new Error('agent and non-empty message are required')
    const behavior = args.behavior ?? 'followup'
    const targetId = await this.ctx.subagents.resolveName(caller, targetName, signal)
    const senderName = this.ctx.subagents.namesOf(caller).self

    if (behavior === 'steer') {
      const activeAcp = this.native.active.get(targetId)
      const acpSession = activeAcp ? this.manager.store.sessions.get(activeAcp.externalId) : null
      if (acpSession?.agentMeta?.steering) {
        try {
          await this.manager.steer(acpSession, `[Message from ${senderName}]\n${message}`)
          return { delivered: 'steered', agent: targetName, sessionId: targetId }
        } catch {}
      }
    }

    if (behavior === 'interrupt') {
      try {
        this.ctx.subagents.interrupt(targetId, { kind: 'ancestor', agent: caller })
      } catch {}
    }

    const messageId = await this.ctx.subagents.sendMessage(
      caller,
      targetId,
      [{ type: 'text', text: message }],
      { signal },
    )
    return { messageId, delivered: behavior === 'interrupt' ? 'interrupted-and-queued' : 'queued', agent: targetName, sessionId: targetId }
  }

  async readAgentResult(caller, args, signal) {
    const targetName = typeof args?.agent === 'string' ? args.agent.trim() : ''
    if (!targetName) throw new Error('agent is required')
    const tailTurns = Number.isInteger(args?.tailTurns) ? Math.min(5, Math.max(1, args.tailTurns)) : 1
    const targetId = await this.ctx.subagents.resolveName(caller, targetName, signal)
    const live = this.ctx.agents.get(targetId)
    const session = live?.session ?? this.ctx.sessions.get(targetId)
    const acpBindings = this.native.sessions(targetId, false).filter(s => !s.native.retired && !s.archived)
    const latestAcp = acpBindings.at(-1)
    const runtime = latestAcp ? this.manager.runtimes.get(latestAcp.id) : null
    const pendingInteractions = runtime ? [...runtime.interactions.values()].filter(item => !item.responding).map(item => ({
      id: item.public.id,
      kind: item.public.kind,
      title: item.public.params?.title ?? item.public.params?.toolCall?.title ?? item.public.kind,
    })) : []

    const replies = []
    if (session && typeof session.snapshotEvents === 'function') {
      const events = session.snapshotEvents()
      const byTurn = new Map()
      for (const event of events) {
        if (event.type !== 'assistant/message') continue
        const text = textFromContent(event.data?.message?.content)
        if (!text) continue
        const turn = event.data?.turn ?? 0
        byTurn.set(turn, text)
      }
      const turns = [...byTurn.entries()].slice(-tailTurns)
      for (const [turn, text] of turns) {
        replies.push({ turn, text: compactText(text) })
      }
    }

    return {
      agent: targetName,
      sessionId: targetId,
      status: live?.status ?? latestAcp?.state ?? 'idle',
      provider: live?.model.current()?.provider ?? latestAcp?.native?.route ?? null,
      model: live?.model.current()?.model ?? null,
      cwd: live ? this.native.cwd(live) : (latestAcp?.cwd ?? null),
      pendingInteractions,
      replies,
    }
  }

  async interruptAgent(caller, args, signal) {
    const targetName = typeof args?.agent === 'string' ? args.agent.trim() : ''
    if (!targetName) throw new Error('agent is required')
    const targetId = await this.ctx.subagents.resolveName(caller, targetName, signal)
    this.ctx.subagents.interrupt(targetId, { kind: 'ancestor', agent: caller })
    return { accepted: true, agent: targetName, sessionId: targetId }
  }

  async executeTool(name, args, caller, signal) {
    switch (name) {
      case 'list_providers': return this.listProviders(caller, args ?? {})
      case 'spawn_agent': return this.spawnAgent(caller, args ?? {}, signal)
      case 'list_agents': return this.listAgents(caller, signal)
      case 'send_message': return this.sendMessage(caller, args ?? {}, signal)
      case 'read_agent_result': return this.readAgentResult(caller, args ?? {}, signal)
      case 'interrupt_agent': return this.interruptAgent(caller, args ?? {}, signal)
      default: throw new Error(`Unknown delegation tool: ${name}`)
    }
  }

  resolveTargetServer(req) {
    let parsedUrl
    try {
      parsedUrl = new URL(req.url ?? '/acp-workbench/mcp', 'http://127.0.0.1')
    } catch {
      return { errorStatus: 400, errorCode: -32600, errorMessage: 'Invalid MCP request URL' }
    }
    const prefix = '/acp-workbench/mcp/'
    if (parsedUrl.pathname.startsWith(prefix)) {
      const rawSegment = parsedUrl.pathname.slice(prefix.length).replace(/\/+$/u, '')
      if (!rawSegment || rawSegment.includes('/')) {
        return { errorStatus: 404, errorCode: -32601, errorMessage: 'Unknown MCP bridge server path' }
      }
      try {
        const decoded = decodeURIComponent(rawSegment)
        if (!decoded) return { errorStatus: 404, errorCode: -32601, errorMessage: 'Unknown MCP bridge server path' }
        return { server: decoded }
      } catch {
        return { errorStatus: 400, errorCode: -32600, errorMessage: 'Invalid MCP server name in path' }
      }
    }
    const queryServer = parsedUrl.searchParams.get('server')?.trim()
    return { server: queryServer || MCP_SERVER_NAME }
  }

  async handleMcpRequest(req, res) {
    const remote = req.socket?.remoteAddress ?? ''
    if (!LOOPBACK.has(remote)) {
      res.statusCode = 403
      res.end()
      return
    }
    const auth = req.headers.authorization ?? ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
    const binding = token ? this.tokens.get(token) : null
    if (!binding) {
      writeJson(res, 401, { jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Invalid or expired ACP delegation token' } })
      return
    }
    const resolved = this.resolveTargetServer(req)
    if (resolved.errorStatus) {
      writeJson(res, resolved.errorStatus, {
        jsonrpc: '2.0',
        id: null,
        error: { code: resolved.errorCode, message: resolved.errorMessage },
      })
      return
    }
    const targetServer = resolved.server
    const isDelegation = targetServer === MCP_SERVER_NAME
    if (req.method === 'DELETE') {
      res.writeHead(204, { 'cache-control': 'no-store' })
      res.end()
      return
    }
    if (req.method !== 'POST') {
      res.writeHead(405, { allow: 'POST, DELETE', 'cache-control': 'no-store' })
      res.end()
      return
    }

    let message
    try {
      message = await readJsonBody(req)
    } catch (error) {
      writeJson(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: error.message ?? 'Invalid JSON' } })
      return
    }

    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      writeJson(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid JSON-RPC request' } })
      return
    }

    const sessionHeader = { 'mcp-session-id': binding.sessionId }
    const caller = this.ctx.agents?.get?.(binding.sessionId)
    const controller = new AbortController()
    const onClose = () => {
      if (!res.writableEnded) controller.abort(new Error('MCP HTTP request closed'))
    }
    res.on('close', onClose)

    try {
      if (!isDelegation) {
        const outcome = await handleMcpBridgeRequest(this.ctx, message, {
          targetServer,
          caller,
          signal: controller.signal,
          headers: req.headers,
          excludedNames: EXCLUDED_FORWARD_SERVERS,
        })
        const headers = { ...sessionHeader, ...outcome.headers }
        if (outcome.body === null) {
          res.writeHead(outcome.status, { 'cache-control': 'no-store', ...headers })
          res.end()
        } else {
          writeJson(res, outcome.status, outcome.body, headers)
        }
        return
      }

      const hasId = Object.hasOwn(message, 'id')
      const id = message.id ?? null
      const context = parseMcpRequestContext(message, req.headers)
      if (!context.ok) {
        writeJson(res, context.status, { jsonrpc: '2.0', id, error: { code: context.code, message: context.message } }, sessionHeader)
        return
      }

      const negotiatedVersion = context.protocolVersion ? negotiateMcpProtocolVersion(context.protocolVersion) : undefined
      const responseHeaders = {
        ...sessionHeader,
        ...(negotiatedVersion ? { 'mcp-protocol-version': negotiatedVersion } : {}),
      }

      if (!hasId) {
        res.writeHead(202, { 'cache-control': 'no-store', ...responseHeaders })
        res.end()
        return
      }

      const serverInfo = { name: 'dsh-acp-agents', version: '0.2.0' }
      const attachMeta = result => (isModernMcpProtocolVersion(negotiatedVersion)
        ? { ...result, _meta: { ...result._meta, [MCP_META_KEYS.serverInfo]: serverInfo } }
        : result)
      const method = context.method

      if (method === 'initialize') {
        const result = buildMcpInitializeResult(message.params, serverInfo)
        writeJson(res, 200, { jsonrpc: '2.0', id, result }, { ...responseHeaders, 'mcp-protocol-version': result.protocolVersion })
        return
      }

      if (method === 'server/discover') {
        const result = buildMcpDiscoverResult(serverInfo)
        writeJson(res, 200, { jsonrpc: '2.0', id, result }, { ...responseHeaders, 'mcp-protocol-version': MCP_MODERN_PROTOCOL_VERSION })
        return
      }

      if (method === 'ping') {
        writeJson(res, 200, { jsonrpc: '2.0', id, result: attachMeta({}) }, responseHeaders)
        return
      }

      if (method === 'tools/list') {
        writeJson(res, 200, { jsonrpc: '2.0', id, result: attachMeta({ tools: MCP_TOOL_LIST }) }, responseHeaders)
        return
      }

      if (method === 'tools/call') {
        if (!caller) {
          writeJson(res, 200, {
            jsonrpc: '2.0',
            id,
            result: attachMeta({ isError: true, content: [{ type: 'text', text: 'Parent DSH session is no longer active.' }] }),
          }, responseHeaders)
          return
        }
        const toolName = message.params?.name
        if (typeof toolName !== 'string' || !toolName.trim() || !Object.hasOwn(TOOL_SPECS, toolName)) {
          writeJson(res, 200, {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Unknown delegation tool: ${String(toolName)}` },
          }, responseHeaders)
          return
        }
        const toolArgs = message.params?.arguments ?? {}
        try {
          const value = await this.executeTool(toolName, toolArgs, caller, controller.signal)
          writeJson(res, 200, {
            jsonrpc: '2.0',
            id,
            result: attachMeta({
              content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
              structuredContent: value,
            }),
          }, responseHeaders)
        } catch (error) {
          writeJson(res, 200, {
            jsonrpc: '2.0',
            id,
            result: attachMeta({
              isError: true,
              content: [{ type: 'text', text: error?.message ?? String(error) }],
            }),
          }, responseHeaders)
        }
        return
      }

      writeJson(res, 200, { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } }, responseHeaders)
    } finally {
      res.off('close', onClose)
    }
  }

  installHostTools() {
    if (typeof this.ctx.inject !== 'function') return
    const hub = this
    this.ctx.inject(['tools'], scope => {
      const registerTool = (spec, timeoutMs = 120_000) => {
        scope.effect(() => scope.tools.register({
          name: spec.name,
          description: spec.description,
          parameters: spec.parameters,
          output: {
            schema: { type: 'object' },
            render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
          },
          timeoutMs,
          async execute(args, exec) {
            if (!exec?.agent) throw new Error(`${spec.name} requires a calling DSH agent`)
            return hub.executeTool(spec.name, args, exec.agent, exec.signal)
          },
        }), `acp-workbench: tool ${spec.name}`)
      }
      registerTool(TOOL_SPECS.list_providers, 30_000)
      registerTool(TOOL_SPECS.spawn_agent, 120_000)
      registerTool(TOOL_SPECS.read_agent_result, 30_000)
    })

    this.ctx.inject(['systemPrompt'], scope => {
      scope.effect(() => scope.systemPrompt.context({
        name: 'acp-workbench:cross-engine-delegation',
        order: scope.systemPrompt.getContextOrder?.('SUBAGENT_DELEGATION') ?? 50,
        interpolate: false,
        text: ({ agent }) => {
          if (!agent) return ''
          const providers = [...this.manager.store.providers.values()].map(p => `${p.id} (${p.label})`)
          if (!providers.length) return ''
          return `Cross-engine delegation is available via list_providers and spawn_agent. You can delegate subtasks to native DSH ("dsh") or external ACP engines (${providers.join(', ')}), optionally with isolation="worktree" for parallel edits. Child results auto-deliver to your inbox; use send_message, list_agents, read_agent_result, and interrupt_agent to coordinate.`
        },
      }), 'acp-workbench: cross-engine prompt context')
    })
  }
}
