import { randomUUID } from 'node:crypto'
import path from 'node:path'

export const name = 'branch-switcher'
export const inject = ['agents', 'commands', 'tools', 'subprocess', 'sandbox', 'sandboxPolicy', 'workingDirectory']
export const OP_PATH = '/branch-switcher/op'

const COMMAND = 'branch-switcher'
const SOURCE_KIND = 'branch-switcher'
const CONTEXT_SUMMARY_MAX_CHARS = 120

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function boundSummary(summary) {
  const clean = String(summary ?? '').replace(/\s+/gu, ' ').trim()
  return clean.length <= CONTEXT_SUMMARY_MAX_CHARS
    ? clean
    : `${clean.slice(0, CONTEXT_SUMMARY_MAX_CHARS - 1)}…`
}

function injectBranchSwitchNotice(agent, previous, current, root) {
  if (!agent || previous === current) return
  const fromLabel = previous ? `"${previous}"` : 'detached HEAD'
  const toLabel = current ? `"${current}"` : 'detached HEAD'
  const summary = boundSummary(`Switched branch ${previous ?? 'detached HEAD'} -> ${current ?? 'detached HEAD'}`)
  const message = deepFreeze({
    id: randomUUID(),
    role: 'user',
    content: [{ type: 'text', text: `The local Git branch changed from ${fromLabel} to ${toLabel} in ${root}.` }],
    source: { kind: SOURCE_KIND, form: 'notice', summary, previous, current },
  })
  const pending = Array.isArray(agent.inbox?.nextStep)
    ? agent.inbox.nextStep.filter(item => item?.source?.kind === SOURCE_KIND)
    : []
  if (pending.length > 0 && typeof agent.inbox?.replace === 'function') {
    agent.inbox.replace(pending[0].id, message)
    for (const extra of pending.slice(1)) agent.inbox.remove?.(extra.id)
  } else if (typeof agent.inject === 'function') {
    agent.inject(message)
  }
}
const MAX_OUTPUT = 1024 * 1024
const MAX_BODY = 64 * 1024
const MAX_EXEC_CACHE = 16
const LOCAL_HEAD_PREFIX = 'refs/heads/'
const RETRYABLE_EXEC_CODES = new Set(['ENOENT', 'EACCES', 'ENOEXEC', 'UNKNOWN'])
const STRIPPED_GIT_ENV = [
  'GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
  'GIT_CEILING_DIRECTORIES', 'GIT_PREFIX', 'GIT_SHALLOW_FILE', 'GIT_GRAFT_FILE',
  'GIT_REPLACE_REF_BASE', 'GIT_ATTR_SOURCE', 'GIT_IMPLICIT_WORK_TREE', 'GIT_NAMESPACE',
  'GIT_SUPER_PREFIX', 'GIT_DISCOVERY_ACROSS_FILESYSTEM',
]

const executableCaches = new WeakMap()

export function buildGitEnv(baseEnv = process.env) {
  const env = Object.fromEntries(STRIPPED_GIT_ENV.map(key => [key, undefined]))
  for (const key of Object.keys(baseEnv ?? {})) {
    if (/^GIT_CONFIG_(?:KEY|VALUE)_\d+$/i.test(key)) env[key] = undefined
  }
  env.GIT_TERMINAL_PROMPT = '0'
  env.GIT_OPTIONAL_LOCKS = '0'
  env.GIT_NO_LAZY_FETCH = '1'
  env.LC_ALL = 'C'
  return env
}

export function buildAbsolutePathEnv(baseEnv = process.env, platform = process.platform) {
  const pathMod = platform === 'win32' ? path.win32 : path.posix
  const sep = platform === 'win32' ? ';' : ':'
  let pathKey = 'PATH'
  let rawPath = baseEnv?.PATH
  if (rawPath === undefined && platform === 'win32' && baseEnv) {
    const entry = Object.entries(baseEnv).find(([key]) => key.toUpperCase() === 'PATH')
    if (entry) [pathKey, rawPath] = entry
  }
  const dirs = []
  if (typeof rawPath === 'string' && rawPath) {
    for (const segment of rawPath.split(sep)) {
      const cleaned = platform === 'win32' && segment.startsWith('"') && segment.endsWith('"')
        ? segment.slice(1, -1)
        : segment
      if (!cleaned || !pathMod.isAbsolute(cleaned)) continue
      if (!dirs.includes(cleaned)) dirs.push(cleaned)
    }
  }
  const filteredPath = dirs.join(sep)
  return {
    env: rawPath === undefined ? undefined : { [pathKey]: filteredPath },
    key: `${platform}\0${filteredPath}`,
  }
}

function getExecutableCache(subprocess) {
  let cache = executableCaches.get(subprocess)
  if (!cache) {
    cache = new Map()
    executableCaches.set(subprocess, cache)
  }
  return cache
}

async function resolveGitExecutable(subprocess, signal) {
  const { env, key } = buildAbsolutePathEnv()
  const cache = getExecutableCache(subprocess)
  const cached = cache.get(key)
  if (cached) return { executable: cached, key, cache }
  const executable = await subprocess.resolveExecutable('git', env, signal)
  if (typeof executable !== 'string' || !executable || !path.isAbsolute(executable)) {
    throw Object.assign(new Error('Resolved git executable must be an absolute path'), { code: 'ENOENT' })
  }
  if (cache.size >= MAX_EXEC_CACHE) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, executable)
  return { executable, key, cache }
}

function isSameOrAncestorPath(ancestor, target) {
  const rel = path.relative(path.resolve(ancestor), path.resolve(target))
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel))
}

async function resolveWorktreeRoot(git) {
  const output = (await git([
    'rev-parse',
    '--is-inside-work-tree',
    '--is-bare-repository',
    '--is-inside-git-dir',
    '--absolute-git-dir',
    '--show-prefix',
    '--show-toplevel',
  ])).text
  const lines = output.split(/\r?\n/)
  if (lines.length < 6) throw new Error('Current directory is not inside a Git work tree')
  const [insideWorkTree, isBare, insideGitDir, gitDir, prefix, root] = lines
  if (insideWorkTree !== 'true' || isBare !== 'false' || insideGitDir !== 'false' || !root || !gitDir) {
    throw new Error('Current directory is not inside a Git work tree')
  }
  const canonicalCwd = prefix ? path.resolve(root, prefix) : path.resolve(root)
  if (isSameOrAncestorPath(gitDir, root) || isSameOrAncestorPath(gitDir, canonicalCwd)) {
    throw new Error('Current directory is not inside a Git work tree')
  }
  return root
}

function hasStartedTurn(ctx, session, fallbackAgents) {
  const agents = ctx.get?.('agents') ?? fallbackAgents
  if (typeof agents?.turnBoundaryOf === 'function') {
    const boundary = agents.turnBoundaryOf(session)
    return boundary.lastTurn > 0 || boundary.openTurnStartSeq !== null
  }
  const events = typeof session?.snapshotEvents === 'function' ? session.snapshotEvents() : []
  return Array.isArray(events) && events.some(event => event.type === 'turn/start')
}

export class BranchSwitcher {
  constructor(signal, agents) {
    this.signal = signal
    this.agents = agents
  }

  async run(agent, args, callerSignal) {
    if (!agent) throw new Error('A Session is required')
    if (!args || !['list', 'switch'].includes(args.action)) throw new Error('Expected action: list or switch')
    const operation = new AbortController()
    const signal = AbortSignal.any([this.signal, operation.signal, ...(callerSignal ? [callerSignal] : [])])
    const ctx = agent.ctx
    // external: DSH agent.ctx does not pre-inject consumer services; resolve via ctx.get
    const workingDirectory = ctx.get('workingDirectory')
    const sandboxPolicy = ctx.get('sandboxPolicy')
    const subprocess = ctx.get('subprocess')
    if (!workingDirectory || !sandboxPolicy || !subprocess) {
      throw new Error('The Session execution environment requires working-directory, sandbox policy and subprocess providers')
    }
    const session = agent.session
    const cwd = workingDirectory.get(session)
    const git = async (argv, allowed = [0]) => {
      const timeout = AbortSignal.any([signal, AbortSignal.timeout(15_000)])
      const policy = sandboxPolicy.resolve({ session })
      const env = buildGitEnv()
      const runOnce = async () => {
        const { executable, key, cache } = await resolveGitExecutable(subprocess, timeout)
        const command = [executable, '--no-optional-locks', '-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', ...argv]
        let confined = command
        if (policy.mode !== 'danger-full-access') {
          const sandbox = ctx.get('sandbox')
          if (!sandbox) throw new Error(`The Session execution environment requires a sandbox provider in ${policy.mode} mode`)
          confined = (await sandbox.confine(command, policy, timeout)).argv
        }
        timeout.throwIfAborted()
        let child
        try {
          child = subprocess.spawn({
            argv: confined, cwd, env, signal: timeout, graceMs: 1000,
            stdio: { stdin: 'ignore', stdout: { maxBytes: MAX_OUTPUT }, stderr: { maxBytes: MAX_OUTPUT } },
          })
          const outcome = await child.done
          timeout.throwIfAborted()
          const stdout = child.collected.stdout.readFrom(0)
          const stderr = child.collected.stderr.readFrom(0)
          if (!allowed.includes(outcome.exitCode)) throw new Error(stderr.text.trim() || `git ${argv[0]} failed (${outcome.signal ?? outcome.exitCode})`)
          if (stdout.lossy || stderr.lossy) throw new Error('Git output exceeded 1 MiB; narrow the repository branch list')
          return { text: stdout.text.trimEnd(), exitCode: outcome.exitCode }
        } catch (error) {
          throw { error, key, cache }
        } finally {
          if (child) {
            child.terminate()
            await child.waitForExit()
          }
        }
      }
      try {
        return await runOnce()
      } catch (wrapped) {
        const failure = wrapped && typeof wrapped === 'object' && 'error' in wrapped ? wrapped.error : wrapped
        const code = failure?.code ?? failure?.cause?.code
        if (!RETRYABLE_EXEC_CODES.has(code) || timeout.aborted || !wrapped?.cache) throw failure
        wrapped.cache.delete(wrapped.key)
        try {
          return await runOnce()
        } catch (retryWrapped) {
          throw retryWrapped && typeof retryWrapped === 'object' && 'error' in retryWrapped ? retryWrapped.error : retryWrapped
        }
      }
    }
    const current = async () => {
      const result = await git(['symbolic-ref', '--quiet', 'HEAD'], [0, 1])
      if (result.exitCode !== 0) return null
      const ref = result.text.trim()
      return ref.startsWith(LOCAL_HEAD_PREFIX) ? ref.slice(LOCAL_HEAD_PREFIX.length) : null
    }
    const root = await resolveWorktreeRoot(git)
    if (args.action === 'list') {
      const branch = await current()
      const refs = (await git(['for-each-ref', '--sort=-committerdate', '--format=%(refname:lstrip=2)', 'refs/heads/'])).text
      const branches = refs ? refs.split(/\r?\n/).filter(Boolean) : []
      return { root, cwd, current: branch, branches: branch ? [branch, ...branches.filter(value => value !== branch)] : branches }
    }
    if (typeof args.branch !== 'string' || !args.branch || args.branch.includes('\0')) throw new Error('An existing local branch is required')
    if (typeof args.root !== 'string' || args.root !== root || !Object.hasOwn(args, 'current')) {
      throw new Error('Refresh the branch list before switching')
    }
    return agent.runMaintenance(async maintenanceSignal => {
      const abort = () => { operation.abort(maintenanceSignal.reason) }
      maintenanceSignal.addEventListener('abort', abort, { once: true })
      try {
        maintenanceSignal.throwIfAborted()
        signal.throwIfAborted()
        if (hasStartedTurn(ctx, session, this.agents)) throw new Error('Branches can only be switched before the first message')
        const policy = sandboxPolicy.resolve({ session })
        if (policy.mode === 'read-only') throw new Error('Branch switching is unavailable in read-only mode')
        if (workingDirectory.get(session) !== cwd) throw new Error('The Session directory changed; refresh the branch list')
        if (await current() !== args.current) throw new Error('The current branch changed; refresh the branch list')
        if (args.branch !== args.current) {
          await git(['show-ref', '--verify', '--quiet', `refs/heads/${args.branch}`])
          maintenanceSignal.throwIfAborted()
          await git(['switch', '--no-guess', '--', args.branch])
        }
        const nextCurrent = await current()
        if (nextCurrent !== args.current) injectBranchSwitchNotice(agent, args.current, nextCurrent, root)
        return { root, cwd, previous: args.current, current: nextCurrent }
      } finally {
        maintenanceSignal.removeEventListener('abort', abort)
      }
    })
  }
}

async function readBody(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.byteLength
    if (bytes > MAX_BODY) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Request body must be a JSON object')
  }
  return parsed
}

export function apply(ctx) {
  const lifetime = new AbortController()
  const service = new BranchSwitcher(lifetime.signal, ctx.agents)
  const tasks = new Set()
  const run = (agent, args, signal) => {
    const task = service.run(agent, args, signal)
    tasks.add(task)
    task.finally(() => tasks.delete(task)).catch(() => {})
    return task
  }
  ctx.effect(() => async () => {
    lifetime.abort()
    await Promise.allSettled(tasks)
  }, 'branch-switcher: pending operations')
  ctx.inject(['webServer', 'connection', 'sessionController'], scope => {
    scope.effect(() => scope.webServer.register({
      kind: 'exact',
      path: OP_PATH,
      handler: async (req, res, peer) => {
        if (peer?.principal?.kind !== 'owner') {
          res.writeHead(peer === undefined ? 401 : 403)
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST' })
          res.end()
          return
        }
        const requestAbort = new AbortController()
        const onClose = () => { if (!res.writableEnded) requestAbort.abort() }
        res.on?.('close', onClose)
        let status = 200
        let body
        try {
          const { sessionId, ...args } = await readBody(req)
          if (typeof sessionId !== 'string' || !sessionId) throw new Error('sessionId is required')
          const resolved = await scope.sessionController.resolveAgent(sessionId)
          if ('error' in resolved || !resolved.agent) {
            status = 404
            body = { ok: false, message: resolved.error?.message ?? resolved.error?.code ?? 'Session is unavailable' }
          } else {
            body = { ok: true, value: await run(resolved.agent, args, requestAbort.signal) }
          }
        } catch (error) {
          status = 400
          body = { ok: false, message: error instanceof Error ? error.message : String(error) }
        } finally {
          res.off?.('close', onClose)
        }
        if (res.writableEnded || res.destroyed) return
        res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(body))
      },
    }), 'branch-switcher: owner HTTP operations')
  })
  ctx.effect(() => ctx.commands.register({
    name: COMMAND,
    description: 'List local branches or switch an existing branch before the first message. Switching affects every Session sharing this checkout.',
    input: { hint: '{"action":"list"} or {"action":"switch","branch":"name","root":"...","current":"..."}' },
    handler: async ({ agent, rawInput, signal }) => {
      try {
        return { kind: 'success', text: JSON.stringify(await run(agent, JSON.parse(rawInput), signal)) }
      } catch (error) {
        return { kind: 'error', text: error.message }
      }
    },
  }), 'branch-switcher: user command')
  ctx.effect(() => ctx.tools.register({
    name: 'branch_switcher',
    description: 'List local Git branches (action: list) or switch an existing local branch before the first message (action: switch with branch, root, and current from list). Changes the shared working directory; does not create, fetch, stash, reset, or force-switch.',
    parameters: { type: 'object', properties: {
      action: { type: 'string', enum: ['list', 'switch'] }, branch: { type: 'string' },
      root: { type: 'string' }, current: { oneOf: [{ type: 'string' }, { type: 'null' }] },
    }, required: ['action'], additionalProperties: false },
    output: { schema: { type: 'object' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    timeoutMs: 120_000,
    execute: (args, exec) => run(exec.agent, args, exec.signal),
  }), 'branch-switcher: agent operation')
}
