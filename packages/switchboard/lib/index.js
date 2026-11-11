/**
 * dsh-switchboard — Host-only plugin.
 *
 * Connects this DSH Host to a Switchboard relay as the `dsh` harness
 * connector (switchboard spec §14.1). The relay dispatches runs; each run
 * becomes one prompt in a bound DSH session, and that turn's events stream
 * back as `run.event` frames until its `turn/end` produces `run.end`.
 *
 * - Sessions: created or resumed through `sessionController`, prompted with
 *   `requestId = runId`; the turn that claims that message is the run.
 *   A user turn on a bound session that the relay did not dispatch (typed in
 *   the GUI) is announced with `run.open{origin:'gui'}` and streamed too.
 * - Permissions: the relay's profile maps to a DSH permission preset; the
 *   approval policy is always `ask` for relay sessions.
 * - Approvals: for bound sessions the relay and the GUI race (first answer
 *   wins); when the relay wins the GUI card is withdrawn through the request
 *   signal. See switchboard/docs/spikes/dsh.md (S1).
 * - Worktree runs: when a dispatch names a worktree, the session runs in
 *   `<workspace>/.switchboard/worktrees/<runId>` and its commits are uploaded
 *   as a git bundle before `run.end`.
 *
 * Connector state (unacked frames, processed ids) and the session bindings
 * live in one `switchboard_connector` storage-domain document.
 */
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, realpath, rm, mkdir } from 'node:fs/promises'
import { hostname, tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { Connector, frame, ulid } from './vendor/switchboard-kit.js'

export const name = 'switchboard'
export const inject = ['sessionController', 'storageDomain', 'approval']

export const VERSION = '0.1.0'
export const HARNESS = 'dsh'
export const DOMAIN_NAME = 'switchboard_connector'

/** Target knobs per relay profile (spec §11.3). Approval is always `ask`. */
export const PROFILE_KNOBS = {
  readonly: { sandbox: 'read-only', approval: 'ask' },
  'workspace-write': { sandbox: 'workspace-write', approval: 'ask' },
}
export const DEFAULT_PROFILES = { readonly: 'read-only', 'workspace-write': 'workspace-write' }
const SANDBOX_RANK = { 'read-only': 0, 'workspace-write': 1, 'danger-full-access': 2 }

const SUMMARY_MAX = 300
const TITLE_MAX = 120
const BRIEF_MAX = 200
const THINKING_MAX = 500

const execFileAsync = promisify(execFile)
const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const str = v => typeof v === 'string' ? v.trim() : ''
const clip = (s, max) => s.length > max ? `${s.slice(0, max - 1)}…` : s
const errMessage = e => e instanceof Error ? e.message : String(e)

/** Normalize plugin config; never throws. */
export function normalizeConfig(raw) {
  const c = isRecord(raw) ? raw : {}
  const workspaces = {}
  if (isRecord(c.workspaces)) {
    for (const [k, v] of Object.entries(c.workspaces)) if (str(k) && str(v)) workspaces[str(k)] = str(v)
  }
  const profiles = { ...DEFAULT_PROFILES }
  if (isRecord(c.profiles)) {
    for (const key of Object.keys(PROFILE_KNOBS)) if (str(c.profiles[key])) profiles[key] = str(c.profiles[key])
  }
  return {
    relayUrl: str(c.relayUrl),
    hostId: str(c.hostId) || hostname(),
    tokenRef: str(c.tokenRef) || 'SWITCHBOARD_TOKEN',
    workspaces,
    profiles,
    approvalMode: c.approvalMode === 'exclusive' ? 'exclusive' : 'race',
  }
}

/** Host token: dsh credentials first, then the process environment. */
export async function resolveToken(ctx, ref) {
  try {
    const hit = await ctx.get?.('credentials')?.resolve(ref)
    if (typeof hit?.value === 'string' && hit.value !== '') return hit.value
  } catch {}
  const env = process.env[ref]
  return typeof env === 'string' && env !== '' ? env : undefined
}

// ---------- storage ----------

const DOMAIN_STATE = {
  parse(raw) {
    if (!isRecord(raw)) throw new TypeError('switchboard state must be an object')
    return {
      version: 1,
      connector: isRecord(raw.connector) ? raw.connector : null,
      bindings: isRecord(raw.bindings) ? raw.bindings : {},
    }
  },
  safeParse(value) {
    try { return { success: true, data: DOMAIN_STATE.parse(value) } } catch (error) { return { success: false, error } }
  },
}
export const DOMAIN_SPEC = {
  name: DOMAIN_NAME,
  version: 1,
  global: { schema: DOMAIN_STATE, initial: { version: 1, connector: null, bindings: {} } },
  tables: {},
}

async function openDomain(ctx) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ctx.storageDomain.open(DOMAIN_SPEC)
    } catch (error) {
      if (error?.code !== 'already-open' || attempt >= 20) throw error
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
}

/** One document holds connector state and bindings; writes are serialized. */
function domainStore(domain) {
  let tail = Promise.resolve()
  const update = patch => {
    const task = tail.then(() => domain.global.set({ ...domain.global.get(), ...patch(domain.global.get()) }))
    tail = task.catch(() => {})
    return task
  }
  return {
    connectorStore: {
      async load() {
        const s = domain.global.get().connector
        return { processed: [], runs: {}, pendingFrames: [], ...s }
      },
      save: state => update(() => ({ connector: state })),
    },
    bindings: () => ({ ...domain.global.get().bindings }),
    setBinding: (sessionId, binding) => update(cur => {
      const bindings = { ...cur.bindings }
      if (binding === undefined) delete bindings[sessionId]
      else bindings[sessionId] = binding
      return { bindings }
    }),
    flush: () => tail,
  }
}

// ---------- event mapping ----------

/** Short title for a tool call from its JSON arguments. */
export function toolTitle(tool, args) {
  let parsed = args
  if (typeof args === 'string') { try { parsed = JSON.parse(args) } catch { return clip(`${tool} ${args}`, TITLE_MAX) } }
  if (isRecord(parsed)) {
    for (const key of ['command', 'cmd', 'path', 'file_path', 'query', 'url', 'pattern', 'description']) {
      if (typeof parsed[key] === 'string' && parsed[key]) return clip(parsed[key], TITLE_MAX)
    }
    const first = Object.values(parsed).find(v => typeof v === 'string' && v)
    if (first) return clip(first, TITLE_MAX)
  }
  return tool
}

function textOf(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.filter(b => b?.type === 'text' && typeof b.text === 'string').map(b => b.text).join('')
}

/** Add numeric usage fields (nested objects are summed one level deep). */
export function addUsage(total, usage) {
  if (!isRecord(usage)) return total
  const out = { ...total }
  for (const [k, v] of Object.entries(usage)) {
    if (typeof v === 'number') out[k] = (typeof out[k] === 'number' ? out[k] : 0) + v
    else if (isRecord(v)) out[k] = addUsage(isRecord(out[k]) ? out[k] : {}, v)
  }
  return out
}

/** Map a `turn/end` reason to a run.end status and reason. */
export function endStatusOf(reason, cancelled) {
  const kind = reason?.kind
  if (cancelled || kind === 'interrupted' || kind === 'aborted') return { status: 'cancelled', reason: kind }
  if (kind === 'completed' || kind === 'max-tokens') return { status: 'succeeded', reason: kind === 'max-tokens' ? kind : undefined }
  return { status: 'failed', reason: kind === 'error' ? clip(str(reason?.error?.message) || 'error', SUMMARY_MAX) : (kind ?? 'unknown') }
}

/** Prompt content for one rendered relay prompt. */
export function promptContent(prompt) {
  let text = prompt?.text ?? ''
  const attachments = Array.isArray(prompt?.attachments) ? prompt.attachments : []
  if (attachments.length) {
    text += `\n\nAttachments:\n${attachments.map(a => `- ${a.name}${a.mime ? ` (${a.mime})` : ''}: ${a.url} sha256=${a.sha256}`).join('\n')}`
  }
  return [{ type: 'text', text }]
}

// ---------- git worktree ----------

async function git(cwd, ...args) {
  const { stdout } = await execFileAsync('git', ['-C', cwd, ...args], { maxBuffer: 64 * 1024 * 1024 })
  return stdout.trim()
}

/** Create `<workspace>/.switchboard/worktrees/<runId>` on a new branch with a local commit author. */
export async function createWorktree(workspacePath, runId, wt) {
  const path = join(workspacePath, '.switchboard', 'worktrees', runId)
  await mkdir(join(workspacePath, '.switchboard', 'worktrees'), { recursive: true })
  const base = await git(workspacePath, 'rev-parse', '--verify', `${wt.baseRef}^{commit}`)
  await git(workspacePath, 'worktree', 'add', '-b', wt.branch, path, base)
  if (wt.commitAuthor) {
    // Per-worktree config keeps the author out of the main checkout.
    await git(path, 'config', 'extensions.worktreeConfig', 'true')
    await git(path, 'config', '--worktree', 'user.name', wt.commitAuthor.name)
    await git(path, 'config', '--worktree', 'user.email', wt.commitAuthor.email)
  }
  return { path, base, branch: wt.branch }
}

/** Bundle `base..branch` when the worktree has commits; `undefined` otherwise. */
export async function bundleWorktree(wt) {
  const head = await git(wt.path, 'rev-parse', 'HEAD')
  const log = await git(wt.path, 'log', '--format=%H %s', `${wt.base}..${head}`)
  if (!log) return undefined
  const commits = log.split('\n').map(line => ({ sha: line.slice(0, 40), subject: line.slice(41) }))
  const diffstat = await git(wt.path, 'diff', '--stat', `${wt.base}..${head}`)
  const dir = await mkdtemp(join(tmpdir(), 'switchboard-bundle-'))
  try {
    const file = join(dir, 'run.bundle')
    await git(wt.path, 'bundle', 'create', file, `${wt.base}..${wt.branch}`)
    return { data: new Uint8Array(await readFile(file)), meta: { base: wt.base, head, branch: wt.branch, commits, diffstat } }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

// ---------- the bridge ----------

/**
 * Wire the DSH side of the connector. Returns the HarnessHandler plus hooks
 * for tests; `apply` connects it to a Connector.
 * @param ctx - plugin context.
 * @param config - normalized config.
 * @param store - binding store (`bindings`, `setBinding`).
 * @param getConnector - lazily returns the Connector (frames, run handles).
 */
export function createBridge(ctx, config, store, getConnector) {
  const log = (level, msg) => ctx.logger?.[level]?.(`switchboard: ${msg}`)
  /** runId -> run */
  const runs = new Map()
  /** sessionId -> run owning the session's current turn */
  const active = new Map()
  /** approvalId -> { runId, resolve } */
  const approvals = new Map()

  const bound = sessionId => sessionId !== undefined && Object.hasOwn(store.bindings(), sessionId)
  const sessionIdOf = session => session?.id ?? session?.header?.id

  const newRun = (runId, sessionId, kind) => {
    const run = { runId, sessionId, kind, turn: undefined, handle: getConnector().handle(runId), usage: undefined, cancelled: false, worktree: undefined, ending: false }
    runs.set(runId, run)
    return run
  }

  const settleApprovals = (runId, outcome) => {
    for (const [id, a] of approvals) if (a.runId === runId) { approvals.delete(id); a.resolve(outcome) }
  }

  const finish = async (run, status, reason) => {
    if (run.ending || run.handle.ended) return
    run.ending = true
    if (active.get(run.sessionId) === run) active.delete(run.sessionId)
    settleApprovals(run.runId, 'cancelled')
    try {
      if (run.worktree) {
        try {
          const bundle = await bundleWorktree(run.worktree)
          if (bundle) await run.handle.putArtifact({ artifactId: ulid(), kind: 'git-bundle', data: bundle.data, meta: bundle.meta })
        } catch (error) {
          run.handle.event({ type: 'notice', level: 'warn', text: `git bundle failed: ${errMessage(error)}` })
        }
      }
    } finally {
      run.handle.end(status, reason, run.usage)
      runs.delete(run.runId)
    }
  }

  // --- permissions (spec §11.3, spike S2) ---
  const applyProfile = (agent, profile) => {
    const target = PROFILE_KNOBS[profile]
    if (!target) throw new Error(`unknown profile "${profile}"`)
    const session = agent.session
    const presets = ctx.get?.('permissionPresets')
    const presetName = config.profiles[profile]
    let spec
    if (presets && presetName) { try { spec = presets.resolve(presetName) } catch {} }
    if (spec) {
      if (spec.approval !== 'ask') throw new Error(`preset "${presetName}" uses approval "${spec.approval}"; relay sessions require "ask"`)
      if ((SANDBOX_RANK[spec.sandbox] ?? 99) > SANDBOX_RANK[target.sandbox]) throw new Error(`preset "${presetName}" (sandbox ${spec.sandbox}) is wider than profile ${profile}`)
      presets.set(session, presetName)
    } else {
      const current = ctx.get?.('sandboxPolicy')?.resolve({ session })?.mode
      if (current !== target.sandbox) session.append('sandbox/mode', { mode: target.sandbox })
      if (ctx.approval.effectivePolicy(session) !== 'ask') ctx.approval.setPolicy(agent, 'ask')
    }
    const policy = ctx.approval.effectivePolicy(session)
    if (policy !== 'ask') throw new Error(`approval policy is "${policy}" after applying ${profile}; refusing to run`)
    const mode = ctx.get?.('sandboxPolicy')?.resolve({ session })?.mode
    if (mode !== undefined && (SANDBOX_RANK[mode] ?? 99) > SANDBOX_RANK[target.sandbox]) throw new Error(`sandbox is "${mode}" after applying ${profile}; refusing to run`)
  }

  const resolveAgent = async sessionId => {
    const found = await ctx.sessionController.resolveAgent(sessionId)
    if (found?.error) throw found.error
    return found?.agent ?? found
  }

  // --- HarnessHandler ---
  const handler = {
    async dispatch(d, handle) {
      if (d.binding.harness !== HARNESS) throw new Error(`harness ${d.binding.harness} is not served by this connector`)
      const wsPath = config.workspaces[d.binding.workspace]
      if (!wsPath) throw new Error(`unknown workspace "${d.binding.workspace}"`)
      const workspacePath = await realpath(wsPath)
      let sessionId = d.binding.sessionId
      let worktree
      if (sessionId !== undefined) {
        // Resuming a worktree session: keep uploading its bundle.
        const prev = store.bindings()[sessionId]
        if (prev?.worktree) worktree = prev.worktree
      } else {
        let cwd = workspacePath
        if (d.binding.worktree) {
          worktree = await createWorktree(workspacePath, d.runId, d.binding.worktree)
          cwd = worktree.path
        }
        sessionId = (await ctx.sessionController.create({ cwd })).sessionId
      }
      const agent = await resolveAgent(sessionId)
      applyProfile(agent, d.binding.profile)
      await store.setBinding(sessionId, {
        conversationId: d.conversationId,
        workspace: d.binding.workspace,
        profile: d.binding.profile,
        ...worktree ? { worktree } : {},
      })
      const run = { runId: d.runId, sessionId, kind: 'relay', turn: undefined, handle, usage: undefined, cancelled: false, worktree, ending: false, mode: d.mode }
      runs.set(d.runId, run)
      try {
        await ctx.sessionController.prompt({ requestId: d.runId, sessionId, mode: d.mode ?? 'queue', content: promptContent(d.prompt) }, new AbortController().signal)
      } catch (error) {
        runs.delete(d.runId)
        throw error
      }
      handle.accepted(sessionId)
    },

    async cancel(runId) {
      const run = runs.get(runId)
      if (!run) return
      run.cancelled = true
      settleApprovals(runId, 'cancelled')
      if (run.turn !== undefined) {
        try { ctx.sessionController.cancel({ sessionId: run.sessionId }) } catch (error) { log('warn', `cancel failed: ${errMessage(error)}`) }
        return
      }
      // Not started yet: drop it from the inbox.
      try {
        const agent = ctx.get?.('agents')?.get?.(run.sessionId)
        const item = agent?.inbox?.nextTurn?.find(m => m?.source?.rpcId === runId) ?? agent?.inbox?.nextStep?.find(m => m?.source?.rpcId === runId)
        if (item) await ctx.sessionController.updateQueue({ sessionId: run.sessionId, itemId: item.id, action: { kind: 'remove' } })
      } catch (error) {
        log('warn', `dequeue failed: ${errMessage(error)}`)
      }
      await finish(run, 'cancelled', 'cancelled before start')
    },

    resolveApproval(approvalId, outcome) {
      const a = approvals.get(approvalId)
      if (!a) return
      approvals.delete(approvalId)
      a.resolve(outcome)
    },

    async closeSession(_harness, sessionId) {
      // Forget the binding; the DSH session itself stays.
      await store.setBinding(sessionId, undefined)
    },

    onOrphanedRun(runId) {
      log('info', `run ${runId} was interrupted by a restart`)
    },
  }

  // --- turn correlation (spike S4) ---
  const onClaimed = ({ agent, message, turn }) => {
    const sessionId = sessionIdOf(agent?.session)
    if (!bound(sessionId) || message?.source?.kind !== 'user') return
    const owner = active.get(sessionId)
    const rpcId = message.source.rpcId
    const relayRun = rpcId === undefined ? undefined : runs.get(rpcId)
    if (relayRun && relayRun.sessionId === sessionId && relayRun.turn === undefined) {
      if (owner && owner.turn === turn && owner !== relayRun) {
        // Steered into a turn another run owns: that run carries the output.
        relayRun.turn = turn
        relayRun.handle.event({ type: 'notice', level: 'info', text: `steered into run ${owner.runId}` })
        void finish(relayRun, 'succeeded', `steered-into:${owner.runId}`)
        return
      }
      relayRun.turn = turn
      active.set(sessionId, relayRun)
      return
    }
    if (owner && owner.turn === turn) return
    // A user turn the relay did not dispatch: the GUI (spec Q21).
    const runId = ulid()
    const text = clip(textOf(message.content), 2000)
    getConnector().sendFrame(frame({ type: 'run.open', runId, harness: HARNESS, sessionId, origin: 'gui', ...text ? { text } : {} }))
    const run = newRun(runId, sessionId, 'gui')
    run.turn = turn
    run.worktree = store.bindings()[sessionId]?.worktree
    active.set(sessionId, run)
  }

  const onSessionEvent = (session, event) => {
    const sessionId = sessionIdOf(session)
    const run = active.get(sessionId)
    if (!run || !bound(sessionId)) return
    const data = event?.data ?? {}
    switch (event?.type) {
      case 'assistant/message': {
        if (data.turn !== undefined && data.turn !== run.turn) return
        run.usage = addUsage(run.usage ?? {}, data.usage)
        const blocks = Array.isArray(data.message?.content) ? data.message.content : []
        for (const b of blocks) {
          if (b?.type === 'reasoning' && str(b.text)) run.handle.event({ type: 'thinking', summary: clip(b.text.trim(), THINKING_MAX) })
        }
        const text = textOf(blocks)
        if (text) run.handle.event({ type: 'text.final', text })
        return
      }
      case 'tool/call':
        run.handle.event({ type: 'tool.start', callId: String(data.callId ?? ''), name: String(data.name ?? 'tool'), title: toolTitle(String(data.name ?? 'tool'), data.arguments) })
        return
      case 'tool/result': {
        if (event.surfaceOp !== undefined && event.surfaceOp !== 'append') return
        const m = data.message ?? {}
        const brief = clip(textOf(m.content).trim(), BRIEF_MAX)
        run.handle.event({ type: 'tool.end', callId: String(m.toolCallId ?? ''), ok: m.isError !== true, ...brief ? { brief } : {} })
        return
      }
      case 'todo/write': {
        const todos = Array.isArray(data.todos) ? data.todos : []
        run.handle.event({ type: 'plan', items: todos.map(t => ({ text: String(t?.content ?? ''), status: String(t?.status ?? 'pending') })) })
        return
      }
      case 'turn/end': {
        if (data.turn !== run.turn) return
        const { status, reason } = endStatusOf(data.reason, run.cancelled)
        void finish(run, status, reason)
        return
      }
      default:
    }
  }

  const onStream = ({ agent, frame: f }) => {
    const run = active.get(sessionIdOf(agent?.session))
    if (!run || f?.type !== 'chunk' || f.chunk?.type !== 'text-delta' || !f.chunk.text) return
    if (f.turn !== undefined && f.turn !== run.turn) return
    run.handle.event({ type: 'text.delta', text: f.chunk.text })
  }

  const onStatus = ({ agent, status }) => {
    if (status !== 'idle') return
    const run = active.get(sessionIdOf(agent?.session))
    // Safety net: turn/end normally ends the run before the agent goes idle.
    if (run) void finish(run, run.cancelled ? 'cancelled' : 'failed', 'idle-without-turn-end')
  }

  // --- approvals (spike S1) ---
  const onApproval = (req, next) => {
    const sessionId = sessionIdOf(req?.agent?.session)
    const run = bound(sessionId) ? active.get(sessionId) : undefined
    if (!run) return next()
    const approvalId = ulid()
    const reason = str(req.displayReason) || str(req.reason)
    const relay = new Promise(resolve => approvals.set(approvalId, { runId: run.runId, resolve }))
    run.handle.requestApproval({
      approvalId,
      toolName: String(req.toolName ?? 'tool'),
      summary: clip(reason ? `${req.toolName}: ${reason}` : String(req.toolName ?? 'tool'), SUMMARY_MAX),
      detail: { sessionId, ...req.callId !== undefined ? { callId: req.callId } : {}, ...reason ? { reason } : {} },
    })
    const original = req.signal
    const own = new AbortController()
    let racing = false
    if (config.approvalMode === 'race') {
      try {
        req.signal = original ? AbortSignal.any([original, own.signal]) : own.signal
        racing = req.signal !== original
      } catch {}
    }
    const withdraw = (outcome, decidedBy) => {
      if (!approvals.delete(approvalId)) return
      run.handle.approvalWithdrawn(approvalId, outcome, decidedBy)
    }
    return new Promise(resolve => {
      let done = false
      const settle = outcome => {
        if (done) return
        done = true
        original?.removeEventListener('abort', onAbort)
        resolve(outcome)
      }
      const onAbort = () => {
        withdraw('cancelled', 'harness')
        own.abort()
        settle('cancelled')
      }
      if (original?.aborted) return onAbort()
      original?.addEventListener('abort', onAbort, { once: true })
      relay.then(outcome => {
        if (done) return
        own.abort(new Error('answered by the relay'))
        settle(outcome)
      })
      if (racing) {
        Promise.resolve().then(next).then(outcome => {
          // `unavailable`: nobody answered locally; keep waiting for the relay.
          if (done || !['allowed-once', 'rejected', 'cancelled'].includes(outcome)) return
          withdraw(outcome, 'gui')
          settle(outcome)
        }, () => {})
      }
    })
  }

  const dispose = () => {
    for (const [id, a] of approvals) { approvals.delete(id); a.resolve('unavailable') }
  }

  return { handler, onClaimed, onSessionEvent, onStream, onStatus, onApproval, dispose, runs, active }
}

export function apply(ctx, rawConfig) {
  const config = normalizeConfig(rawConfig)
  const log = (level, msg) => ctx.logger?.[level]?.(`switchboard: ${msg}`)
  if (!config.relayUrl) {
    log('warn', 'relayUrl is not configured; connector disabled')
    return
  }

  let connector
  let stopped = false
  const domainReady = openDomain(ctx)
  const storeReady = domainReady.then(domainStore)
  let store
  const bridgeStore = {
    bindings: () => store?.bindings() ?? {},
    setBinding: (id, b) => store.setBinding(id, b),
  }
  const bridge = createBridge(ctx, config, bridgeStore, () => connector)

  ctx.on('agent/inbox/claimed', bridge.onClaimed, { global: true })
  ctx.on('session/event', bridge.onSessionEvent)
  ctx.on('agent/assistant-stream', bridge.onStream, { global: true })
  ctx.on('agent/status', bridge.onStatus, { global: true })
  // Prepend so the relay race is set up before the GUI forwarder reads the request signal.
  ctx.on('approval/request', bridge.onApproval, { prepend: true })

  const started = (async () => {
    store = await storeReady
    const token = await resolveToken(ctx, config.tokenRef)
    if (!token) throw new Error(`host token "${config.tokenRef}" not found in credentials or environment`)
    const workspaces = []
    for (const [wsName, path] of Object.entries(config.workspaces)) {
      try { workspaces.push({ name: wsName, path: await realpath(path) }) } catch { log('warn', `workspace "${wsName}" path ${path} does not exist; skipped`) }
    }
    if (stopped) return
    connector = new Connector({
      relayUrl: config.relayUrl,
      hostId: config.hostId,
      token,
      harnesses: [HARNESS],
      workspaces,
      version: VERSION,
      store: store.connectorStore,
      handler: bridge.handler,
      log: (level, msg, data) => log(level, data ? `${msg} ${JSON.stringify(data)}` : msg),
    })
    connector.onState(s => log('info', `relay ${s}`))
    await connector.start()
  })()
  started.catch(error => log('warn', `cannot start: ${errMessage(error)}`))

  ctx.effect(() => () => {
    stopped = true
    bridge.dispose()
    started
      .catch(() => {})
      .then(() => connector?.stop())
      .then(() => store?.flush())
      .finally(() => domainReady.then(d => d.close()).catch(() => {}))
  }, 'switchboard: relay connection')

  return { bridge, started, connector: () => connector }
}
