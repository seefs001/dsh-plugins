/**
 * dsh-switchboard — Host-only plugin.
 *
 * Connects this DSH Host to a Switchboard relay as the `dsh` harness
 * connector (switchboard spec §14.1). The relay dispatches runs;
 * each run becomes one prompt in a bound DSH session, and that turn's events
 * stream back as `run.event` frames until its `turn/end` produces `run.end`.
 *
 * - Sessions: created or resumed through `sessionController`, prompted with
 *   `requestId = runId`; the turn that claims that message is the run.
 *   A user turn on a bound session that the relay did not dispatch (typed in
 *   the GUI) is announced with `run.open{origin:'gui'}` and streamed too.
 * - Permissions: the relay's profile maps to a DSH permission preset; the
 *   approval policy is always `ask` for relay sessions.
 * - Approvals: ACP-style options; relay and GUI race (first answer wins) and
 *   the GUI card is withdrawn through the request signal (spike S1).
 * - Isolation `untrusted` (spec §11.5, spike S6): fresh tainted session,
 *   readonly, and a `tools/pre-execute` gate that allows only in-process,
 *   workspace-confined read tools, so tool execution has no network path.
 * - Worktrees (binding.worktree): fetch, exact start, optional branch reused
 *   per branch, restored agent-config paths, git bundle uploaded before end.
 *
 * Connector state and session bindings live in one `switchboard_connector`
 * storage-domain document; artifact payloads live as files under `dataDir`.
 */
import { mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { homedir, hostname } from 'node:os'
import { join } from 'node:path'
import { bundleWorktree, prepareWorktree } from './git.js'
import { UNTRUSTED_TOOLS, untrustedDenial } from './isolation.js'
import { Connector, DEFAULT_APPROVAL_OPTIONS, decisionOf, emptyState, frame, ulid } from './vendor/switchboard-kit.js'

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
const CALL_MEMORY = 200

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
    untrustedIsolation: c.untrustedIsolation !== false,
    dataDir: str(c.dataDir) || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'switchboard'),
  }
}

/** Capabilities advertised for the dsh harness in hello. */
export function capabilitiesFor(config) {
  return { steer: true, loadSession: true, resume: true, close: true, modes: [], untrustedIsolation: config.untrustedIsolation }
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

/** `connector` is null until the Connector first saves its state. */
const DOMAIN_STATE = {
  parse(raw) {
    if (!isRecord(raw) || !(raw.connector === null || isRecord(raw.connector)) || !isRecord(raw.bindings) || !isRecord(raw.tainted)) {
      throw new TypeError('switchboard state must be { connector, bindings, tainted }')
    }
    return { connector: raw.connector, bindings: raw.bindings, tainted: raw.tainted }
  },
  safeParse(value) {
    try { return { success: true, data: DOMAIN_STATE.parse(value) } } catch (error) { return { success: false, error } }
  },
}
export const DOMAIN_SPEC = {
  name: DOMAIN_NAME,
  version: 1,
  global: { schema: DOMAIN_STATE, initial: { connector: null, bindings: {}, tainted: {} } },
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

/** Artifact payloads as files, so they never enter the storage-domain document. */
export function fileBlobs(dir) {
  const path = id => {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error(`invalid blob id: ${id}`)
    return join(dir, id)
  }
  return {
    async putBlob(id, data) {
      await mkdir(dir, { recursive: true })
      const tmp = `${path(id)}.tmp`
      await writeFile(tmp, data)
      await rename(tmp, path(id))
    },
    async getBlob(id) {
      try { return new Uint8Array(await readFile(path(id))) } catch { return null }
    },
    async deleteBlob(id) {
      await rm(path(id), { force: true })
    },
  }
}

/** One document holds connector state, bindings and tainted sessions; writes are serialized. */
export function domainStore(domain, blobs) {
  let tail = Promise.resolve()
  const update = patch => {
    const task = tail.then(() => domain.global.set({ ...domain.global.get(), ...patch(domain.global.get()) }))
    tail = task.catch(() => {})
    return task
  }
  const setIn = (key, id, value) => update(cur => {
    const next = { ...cur[key] }
    if (value === undefined) delete next[id]
    else next[id] = value
    return { [key]: next }
  })
  return {
    connectorStore: {
      load: async () => domain.global.get().connector ?? emptyState(),
      save: state => update(() => ({ connector: state })),
      ...blobs,
    },
    bindings: () => ({ ...domain.global.get().bindings }),
    setBinding: (sessionId, binding) => setIn('bindings', sessionId, binding),
    tainted: () => ({ ...domain.global.get().tainted }),
    setTainted: (sessionId, info) => setIn('tainted', sessionId, info),
    flush: () => tail,
  }
}

// ---------- event mapping ----------

const TOOL_KINDS = {
  read: 'read', read_image: 'read',
  grep: 'search', glob: 'search',
  edit: 'edit', write: 'edit', apply_patch: 'edit', str_replace_editor: 'edit',
  bash: 'execute', pwsh: 'execute', run_code: 'execute',
  terminal_open: 'execute', terminal_send: 'execute', terminal_read: 'execute', terminal_signal: 'execute', terminal_close: 'execute', terminal_list: 'execute',
  web_fetch: 'fetch', web_search: 'fetch', grok_search: 'fetch', openai_search: 'fetch',
  todo_write: 'think',
}

/** ACP tool kind for a DSH tool name. */
export const toolKind = tool => TOOL_KINDS[tool] ?? 'other'

function parseArgs(args) {
  if (typeof args !== 'string') return args
  try { return JSON.parse(args) } catch { return args }
}

/** File locations named by a tool call's arguments. */
export function locationsOf(args) {
  const parsed = parseArgs(args)
  if (!isRecord(parsed)) return []
  const out = []
  for (const key of ['file_path', 'path']) if (typeof parsed[key] === 'string' && parsed[key]) out.push(parsed[key])
  if (Array.isArray(parsed.paths)) for (const p of parsed.paths) if (typeof p === 'string' && p) out.push(p)
  return out.slice(0, 20)
}

/** Short title for a tool call from its JSON arguments. */
export function toolTitle(tool, args) {
  const parsed = parseArgs(args)
  if (typeof parsed === 'string') return clip(`${tool} ${parsed}`, TITLE_MAX)
  if (isRecord(parsed)) {
    for (const key of ['command', 'cmd', 'path', 'file_path', 'query', 'url', 'pattern', 'description']) {
      if (typeof parsed[key] === 'string' && parsed[key]) return clip(parsed[key], TITLE_MAX)
    }
    const first = Object.values(parsed).find(v => typeof v === 'string' && v)
    if (first) return clip(first, TITLE_MAX)
  }
  return tool
}

// Control, zero-width, bidi and Unicode-tag characters hidden from the owner's eye (spec A6).
const isHidden = cp => (cp < 0x20 && cp !== 0x09 && cp !== 0x0A && cp !== 0x0D) || cp === 0x7F
  || (cp >= 0x200B && cp <= 0x200F) || (cp >= 0x202A && cp <= 0x202E) || (cp >= 0x2060 && cp <= 0x2064)
  || cp === 0xFEFF || (cp >= 0xE0000 && cp <= 0xE007F)

/** Text safe to show in an approval card: hidden characters removed, truncation marked. */
export function displaySafe(text, max = SUMMARY_MAX) {
  const clean = Array.from(String(text ?? '')).filter(ch => !isHidden(ch.codePointAt(0))).join('').replace(/[ \t]+/g, ' ').trim()
  if (clean.length <= max) return clean
  const marker = ` … [truncated ${clean.length - max} chars]`
  return clean.slice(0, Math.max(0, max - marker.length)) + marker
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

/** Map a `turn/end` reason to run.end status, reason and ACP stopReason. */
export function endStatusOf(reason, cancelled) {
  const kind = reason?.kind
  if (cancelled || kind === 'interrupted' || kind === 'aborted') return { status: 'cancelled', reason: kind, stopReason: 'cancelled' }
  if (kind === 'completed') return { status: 'succeeded', reason: undefined, stopReason: 'end_turn' }
  if (kind === 'max-tokens') return { status: 'succeeded', reason: kind, stopReason: 'max_tokens' }
  return { status: 'failed', reason: kind === 'error' ? clip(str(reason?.error?.message) || 'error', SUMMARY_MAX) : (kind ?? 'unknown'), stopReason: undefined }
}

/** DSH approval outcome -> ACP selection over DEFAULT_APPROVAL_OPTIONS. */
export function selectionOf(outcome) {
  const want = outcome === 'allowed-once' ? 'allow_once' : outcome === 'rejected' ? 'reject_once' : undefined
  const opt = want && DEFAULT_APPROVAL_OPTIONS.find(o => o.kind === want)
  return opt ? { outcome: 'selected', optionId: opt.optionId, kind: opt.kind } : { outcome: 'cancelled' }
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

class RunRejected extends Error {}

// ---------- the bridge ----------

/**
 * Wire the DSH side of the connector. Returns the HarnessHandler plus hooks
 * for tests; `apply` connects it to a Connector.
 * @param ctx - plugin context.
 * @param config - normalized config.
 * @param store - `bindings`/`setBinding`, `tainted`/`setTainted`.
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
  /** callId -> { name, arguments }, for approval titles and locations */
  const calls = new Map()
  /** agent -> disposer of its untrusted tool restriction */
  const restrictions = new WeakMap()

  const bound = sessionId => sessionId !== undefined && Object.hasOwn(store.bindings(), sessionId)
  const taintOf = sessionId => sessionId === undefined ? undefined : store.tainted()[sessionId]
  const sessionIdOf = session => session?.id ?? session?.header?.id

  const newRun = (runId, sessionId, kind) => {
    const run = { runId, sessionId, kind, turn: undefined, handle: getConnector().handle(runId), usage: undefined, cancelled: false, worktree: undefined, ending: false }
    runs.set(runId, run)
    return run
  }

  const settleApprovals = (runId, outcome) => {
    for (const [id, a] of approvals) if (a.runId === runId) { approvals.delete(id); a.resolve(outcome) }
  }

  const finish = async (run, status, reason, stopReason) => {
    if (run.ending || run.handle.ended) return
    run.ending = true
    if (active.get(run.sessionId) === run) active.delete(run.sessionId)
    settleApprovals(run.runId, 'cancelled')
    try {
      if (run.worktree) {
        try {
          const bundle = await bundleWorktree(run.worktree)
          // Awaited: the relay stores and verifies every chunk before run.end.
          if (bundle) await run.handle.putArtifact({ artifactId: ulid(), kind: 'git-bundle', data: bundle.data, meta: bundle.meta })
        } catch (error) {
          run.handle.event({ type: 'notice', level: 'warn', text: `git bundle failed: ${errMessage(error)}` })
        }
      }
    } finally {
      run.handle.end(status, reason, run.usage, stopReason)
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

  /** Hide non-allowlisted global tools from a tainted agent; the pre-execute gate enforces regardless. */
  const restrictTools = agent => {
    if (restrictions.has(agent)) return
    try {
      const registry = ctx.get?.('tools')
      const known = registry?.view?.(agent)?.restrictableNames
      const tools = agent.ctx?.tools
      if (!known || !tools?.restrict) return
      const allow = UNTRUSTED_TOOLS.filter(n => known.has(n))
      const deny = [...known].filter(n => !allow.includes(n))
      if (deny.length) restrictions.set(agent, tools.restrict({ deny }))
    } catch (error) {
      log('warn', `tool restriction failed (gate still enforces): ${errMessage(error)}`)
    }
  }

  const resolveAgent = async sessionId => {
    const found = await ctx.sessionController.resolveAgent(sessionId)
    if (found?.error) throw found.error
    return found?.agent ?? found
  }

  const reject = (handle, reason, text) => {
    handle.event({ type: 'notice', level: 'warn', text })
    handle.end('failed', reason)
  }

  // --- HarnessHandler ---
  const handler = {
    async dispatch(d, handle) {
      try {
        await dispatchRun(d, handle)
      } catch (error) {
        if (!(error instanceof RunRejected)) throw error
      }
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
      await finish(run, 'cancelled', 'cancelled before start', 'cancelled')
    },

    resolveApproval(approvalId, selection) {
      const a = approvals.get(approvalId)
      if (!a) return
      approvals.delete(approvalId)
      a.resolve(decisionOf(selection))
    },

    async closeSession(_harness, sessionId) {
      // Forget the binding; the DSH session stays, and a tainted session stays tainted.
      await store.setBinding(sessionId, undefined)
    },

    onOrphanedRun(runId) {
      log('info', `run ${runId} was interrupted by a restart`)
    },
  }

  async function dispatchRun(d, handle) {
    if (d.binding.harness !== HARNESS) throw new Error(`harness ${d.binding.harness} is not served by this connector`)
    const wsPath = config.workspaces[d.binding.workspace]
    if (!wsPath) throw new Error(`unknown workspace "${d.binding.workspace}"`)
    const workspacePath = await realpath(wsPath)
    const untrusted = d.binding.isolation === 'untrusted'
    if (untrusted && !config.untrustedIsolation) {
      reject(handle, 'isolation-unsupported', 'untrusted isolation is disabled on this connector')
      throw new RunRejected()
    }
    let profile = d.binding.profile
    if (untrusted && profile !== 'readonly') {
      handle.event({ type: 'notice', level: 'info', text: `untrusted run: profile ${profile} lowered to readonly` })
      profile = 'readonly'
    }

    // Session choice: tainted sessions never serve standard runs; untrusted runs never reuse standard sessions.
    let sessionId = d.binding.sessionId
    if (sessionId !== undefined) {
      const tainted = taintOf(sessionId) !== undefined
      if (!untrusted && tainted) {
        reject(handle, 'isolation-mismatch', `session ${sessionId} handled untrusted content and cannot serve a standard run`)
        throw new RunRejected()
      }
      if (untrusted && !tainted) {
        handle.event({ type: 'notice', level: 'info', text: 'untrusted run: starting a fresh session' })
        sessionId = undefined
      }
    }

    let worktree
    let cwd = workspacePath
    if (d.binding.worktree) {
      worktree = await prepareWorktree(workspacePath, d.runId, d.binding.worktree)
      cwd = worktree.path
      if (worktree.restored.length) handle.event({ type: 'notice', level: 'info', text: `restored ${worktree.restored.length} agent-config path(s) to the trusted version` })
      // A resumed session must already live in this worktree.
      if (sessionId !== undefined && store.bindings()[sessionId]?.cwd !== cwd) sessionId = undefined
    } else if (sessionId !== undefined) {
      cwd = store.bindings()[sessionId]?.cwd ?? workspacePath
    }
    if (sessionId === undefined) sessionId = (await ctx.sessionController.create({ cwd })).sessionId

    const agent = await resolveAgent(sessionId)
    if (untrusted) {
      // Persist the taint before the session can run anything.
      await store.setTainted(sessionId, { cwd, runId: d.runId })
      restrictTools(agent)
    }
    applyProfile(agent, profile)
    await store.setBinding(sessionId, {
      conversationId: d.conversationId,
      workspace: d.binding.workspace,
      profile,
      isolation: untrusted ? 'untrusted' : 'standard',
      cwd,
      ...worktree ? { worktree: { path: worktree.path, base: worktree.base, ...worktree.branch ? { branch: worktree.branch } : {} } } : {},
    })
    const run = { runId: d.runId, sessionId, kind: 'relay', turn: undefined, handle, usage: undefined, cancelled: false, worktree: store.bindings()[sessionId]?.worktree, ending: false, mode: d.mode }
    runs.set(d.runId, run)
    try {
      await ctx.sessionController.prompt({ requestId: d.runId, sessionId, mode: d.mode ?? 'queue', content: promptContent(d.prompt) }, new AbortController().signal)
    } catch (error) {
      runs.delete(d.runId)
      throw error
    }
    handle.accepted(sessionId)
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
        void finish(relayRun, 'succeeded', `steered-into:${owner.runId}`, 'end_turn')
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

  const rememberCall = data => {
    if (data.callId === undefined) return
    calls.set(String(data.callId), { name: String(data.name ?? 'tool'), arguments: data.arguments })
    while (calls.size > CALL_MEMORY) calls.delete(calls.keys().next().value)
  }

  const onSessionEvent = (session, event) => {
    const sessionId = sessionIdOf(session)
    const data = event?.data ?? {}
    if (event?.type === 'tool/call' && bound(sessionId)) rememberCall(data)
    const run = active.get(sessionId)
    if (!run || !bound(sessionId)) return
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
      case 'tool/call': {
        const tool = String(data.name ?? 'tool')
        const locations = locationsOf(data.arguments)
        run.handle.event({ type: 'tool.start', callId: String(data.callId ?? ''), name: tool, title: toolTitle(tool, data.arguments), kind: toolKind(tool), ...locations.length ? { locations } : {} })
        return
      }
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
        const { status, reason, stopReason } = endStatusOf(data.reason, run.cancelled)
        void finish(run, status, reason, stopReason)
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
    if (run) void finish(run, run.cancelled ? 'cancelled' : 'failed', 'idle-without-turn-end', run.cancelled ? 'cancelled' : undefined)
  }

  // --- untrusted isolation gate (spike S6) ---
  const onPreExecute = async (exec, next) => {
    const taint = taintOf(sessionIdOf(exec?.agent?.session))
    if (taint === undefined) return next()
    const cwd = exec.agent.session?.header?.cwd ?? taint.cwd
    const reason = await untrustedDenial(exec, cwd)
    if (reason !== undefined) return { kind: 'deny', reason }
    return next()
  }

  // --- approvals (spike S1) ---
  const onApproval = (req, next) => {
    const sessionId = sessionIdOf(req?.agent?.session)
    // Tainted sessions never escalate: deny without asking the owner (spec §11.5, S7).
    if (taintOf(sessionId) !== undefined) return Promise.resolve('rejected')
    const run = bound(sessionId) ? active.get(sessionId) : undefined
    if (!run) return next()
    const approvalId = ulid()
    const toolName = String(req.toolName ?? 'tool')
    const reason = str(req.displayReason) || str(req.reason)
    const call = req.callId === undefined ? undefined : calls.get(String(req.callId))
    const title = displaySafe(call ? `${toolName}: ${toolTitle(toolName, call.arguments)}` : toolName, TITLE_MAX)
    const locations = call ? locationsOf(call.arguments) : []
    const relay = new Promise(resolve => approvals.set(approvalId, { runId: run.runId, resolve }))
    run.handle.requestApproval({
      approvalId,
      toolName,
      title,
      summary: displaySafe(reason ? `${title} — ${reason}` : title, SUMMARY_MAX),
      ...reason ? { description: displaySafe(reason, 2000) } : {},
      kind: toolKind(toolName),
      locations,
      options: DEFAULT_APPROVAL_OPTIONS,
      detail: { sessionId, ...req.callId !== undefined ? { callId: req.callId } : {} },
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
    const withdraw = (selection, decidedBy) => {
      if (!approvals.delete(approvalId)) return
      run.handle.approvalWithdrawn(approvalId, selection, decidedBy)
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
        withdraw({ outcome: 'cancelled' }, 'harness')
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
          withdraw(selectionOf(outcome), 'gui')
          settle(outcome)
        }, () => {})
      }
    })
  }

  const dispose = () => {
    for (const [id, a] of approvals) { approvals.delete(id); a.resolve('unavailable') }
  }

  return { handler, onClaimed, onSessionEvent, onStream, onStatus, onApproval, onPreExecute, dispose, runs, active }
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
  const storeReady = domainReady.then(domain => domainStore(domain, fileBlobs(join(config.dataDir, 'blobs'))))
  let store
  const bridgeStore = {
    bindings: () => store?.bindings() ?? {},
    setBinding: (id, b) => store.setBinding(id, b),
    tainted: () => store?.tainted() ?? {},
    setTainted: (id, info) => store.setTainted(id, info),
  }
  const bridge = createBridge(ctx, config, bridgeStore, () => connector)

  ctx.on('agent/inbox/claimed', bridge.onClaimed, { global: true })
  ctx.on('session/event', bridge.onSessionEvent)
  ctx.on('agent/assistant-stream', bridge.onStream, { global: true })
  ctx.on('agent/status', bridge.onStatus, { global: true })
  // Prepend so the relay race is set up before the GUI forwarder reads the request signal.
  ctx.on('approval/request', bridge.onApproval, { prepend: true })
  // Prepend so no other listener can allow a tainted call before the gate sees it.
  ctx.on('tools/pre-execute', bridge.onPreExecute, { prepend: true })

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
      capabilities: { [HARNESS]: capabilitiesFor(config) },
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
