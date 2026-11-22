export const name = 'branch-switcher'
export const inject = ['commands', 'tools', 'subprocess', 'sandbox', 'sandboxPolicy', 'workingDirectory']
export const OP_PATH = '/branch-switcher/op'

const COMMAND = 'branch-switcher'
const MAX_OUTPUT = 1024 * 1024
const MAX_BODY = 64 * 1024
const GIT_ENV = {
  ...Object.fromEntries([
    'GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
    'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
    'GIT_CEILING_DIRECTORIES', 'GIT_PREFIX', 'GIT_SHALLOW_FILE', 'GIT_GRAFT_FILE',
    'GIT_REPLACE_REF_BASE', 'GIT_ATTR_SOURCE',
  ].map(key => [key, undefined])),
  GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', GIT_NO_LAZY_FETCH: '1', LC_ALL: 'C',
}

export class BranchSwitcher {
  constructor(signal) { this.signal = signal }

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
      const executable = await subprocess.resolveExecutable('git', undefined, timeout)
      const command = [executable, '--no-optional-locks', '-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', ...argv]
      let confined = command
      if (policy.mode !== 'danger-full-access') {
        const sandbox = ctx.get('sandbox')
        if (!sandbox) throw new Error(`The Session execution environment requires a sandbox provider in ${policy.mode} mode`)
        confined = (await sandbox.confine(command, policy, timeout)).argv
      }
      timeout.throwIfAborted()
      const child = subprocess.spawn({
        argv: confined, cwd, env: GIT_ENV, signal: timeout, graceMs: 1000,
        stdio: { stdin: 'ignore', stdout: { maxBytes: MAX_OUTPUT }, stderr: { maxBytes: MAX_OUTPUT } },
      })
      try {
        const outcome = await child.done
        timeout.throwIfAborted()
        const stdout = child.collected.stdout.readFrom(0)
        const stderr = child.collected.stderr.readFrom(0)
        if (!allowed.includes(outcome.exitCode)) throw new Error(stderr.text.trim() || `git ${argv[0]} failed (${outcome.signal ?? outcome.exitCode})`)
        if (stdout.lossy || stderr.lossy) throw new Error('Git output exceeded 1 MiB; narrow the repository branch list')
        return { text: stdout.text.trimEnd(), exitCode: outcome.exitCode }
      } finally {
        child.terminate()
        await child.waitForExit()
      }
    }
    const current = async () => {
      const result = await git(['symbolic-ref', '--quiet', 'HEAD'], [0, 1])
      return result.exitCode === 0 ? result.text.replace(/^refs\/heads\//, '') : null
    }
    const root = (await git(['rev-parse', '--show-toplevel'])).text
    if (args.action === 'list') {
      const branch = await current()
      const refs = (await git(['for-each-ref', '--sort=-committerdate', '--format=%(refname:lstrip=2)', 'refs/heads/'])).text
      const branches = refs ? refs.split('\n') : []
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
        if (session.events.some(event => event.type === 'turn/start')) throw new Error('Branches can only be switched before the first message')
        const policy = sandboxPolicy.resolve({ session })
        if (policy.mode === 'read-only') throw new Error('Branch switching is unavailable in read-only mode')
        if (workingDirectory.get(session) !== cwd) throw new Error('The Session directory changed; refresh the branch list')
        if (await current() !== args.current) throw new Error('The current branch changed; refresh the branch list')
        await git(['show-ref', '--verify', '--quiet', `refs/heads/${args.branch}`])
        if (args.branch !== args.current) {
          maintenanceSignal.throwIfAborted()
          await git(['switch', '--no-guess', '--', args.branch])
        }
        return { root, cwd, previous: args.current, current: await current() }
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
  const service = new BranchSwitcher(lifetime.signal)
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
      handler: async (req, res) => {
        const admission = scope.connection.admit(req)
        if ('rejection' in admission || admission.peer.principal.kind !== 'owner') {
          res.writeHead('rejection' in admission ? admission.rejection : 403)
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
