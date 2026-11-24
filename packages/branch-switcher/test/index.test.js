import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import { BranchSwitcher, OP_PATH, apply, buildAbsolutePathEnv, buildGitEnv } from '../lib/index.js'

function createGitHarness(state) {
  const calls = []
  const resolveCalls = []
  const makeChild = (stdout, stderr = '', exitCode = 0) => ({
    done: Promise.resolve({ exitCode, signal: null }),
    collected: {
      stdout: { readFrom: () => ({ text: stdout, lossy: false }) },
      stderr: { readFrom: () => ({ text: stderr, lossy: false }) },
    },
    terminate: () => {},
    waitForExit: async () => {},
  })
  const subprocess = {
    resolveExecutable: async (name, env) => {
      resolveCalls.push({ name, env })
      if (typeof state.resolveExecutable === 'function') {
        return state.resolveExecutable(name, env, resolveCalls.length)
      }
      return `/usr/bin/${name}`
    },
    spawn: spec => {
      calls.push(spec.argv)
      if (typeof state.onSpawn === 'function') {
        const override = state.onSpawn(spec, calls.length)
        if (override) return override
      }
      const sub = spec.argv.slice(6)
      if (sub[0] === 'rev-parse') {
        const insideWorkTree = state.insideWorkTree ?? 'true'
        const isBare = state.isBare ?? 'false'
        const insideGitDir = state.insideGitDir ?? 'false'
        const gitDir = state.gitDir ?? `${state.root}/.git`
        const prefix = state.prefix ?? ''
        return makeChild(`${insideWorkTree}\n${isBare}\n${insideGitDir}\n${gitDir}\n${prefix}\n${state.root}\n`)
      }
      if (sub[0] === 'symbolic-ref') {
        if (state.current === null) return makeChild('', '', 1)
        const ref = state.currentRef ?? `refs/heads/${state.current}`
        return makeChild(`${ref}\n`, '', 0)
      }
      if (sub[0] === 'for-each-ref') return makeChild(`${state.branches.join('\n')}\n`)
      if (sub[0] === 'show-ref') {
        const branch = sub[3].replace(/^refs\/heads\//, '')
        return state.branches.includes(branch) ? makeChild('', '', 0) : makeChild('', 'missing', 1)
      }
      if (sub[0] === 'switch') {
        state.current = sub[3]
        return makeChild('', '', 0)
      }
      return makeChild('', `unexpected git ${sub.join(' ')}`, 1)
    },
  }
  const services = {
    workingDirectory: { get: () => state.cwd },
    sandboxPolicy: { resolve: () => ({ mode: state.mode ?? 'danger-full-access' }) },
    subprocess,
  }
  const agent = {
    ctx: { get: key => services[key] },
    session: { events: state.events ?? [] },
    runMaintenance: fn => fn(new AbortController().signal),
  }
  return { agent, calls, resolveCalls }
}

function createHarness(options = {}) {
  const routes = []
  const commands = []
  const tools = []
  const effects = []
  const scope = {
    webServer: {
      register: route => {
        routes.push(route)
        return () => {}
      },
    },
    connection: {
      admit: options.admit ?? (() => ({ peer: { principal: { kind: 'owner' } } })),
    },
    sessionController: {
      resolveAgent: options.resolveAgent ?? (async () => ({ agent: options.agent })),
    },
    effect: fn => { effects.push(fn()) },
  }
  const ctx = {
    effect: fn => { effects.push(fn()) },
    inject: (_deps, fn) => { fn(scope) },
    commands: { register: def => { commands.push(def); return () => {} } },
    tools: { register: def => { tools.push(def); return () => {} } },
  }
  apply(ctx)
  return { route: routes.find(item => item.path === OP_PATH), commands, tools }
}

async function invoke(route, opts = {}) {
  const { method = 'POST', body } = opts
  const peer = 'peer' in opts ? opts.peer : { principal: { kind: 'owner' } }
  const raw = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)
  const req = Readable.from(raw ? [Buffer.from(raw)] : [])
  req.method = method
  const res = new EventEmitter()
  res.writableEnded = false
  res.destroyed = false
  res.statusCode = 200
  res.headers = {}
  let payload = ''
  res.writeHead = (status, headers = {}) => {
    res.statusCode = status
    res.headers = headers
  }
  res.end = chunk => {
    if (chunk) payload += chunk
    res.writableEnded = true
  }
  await route.handler(req, res, peer)
  return { status: res.statusCode, headers: res.headers, text: payload, json: payload ? JSON.parse(payload) : null }
}

test('branch-switcher registers HTTP route, command, and tool', async () => {
  const state = { root: '/repo', cwd: '/repo', current: 'main', branches: ['main', 'feat'] }
  const { agent } = createGitHarness(state)
  const { route, commands, tools } = createHarness({ agent })
  assert.ok(route)
  assert.equal(route.kind, 'exact')
  assert.equal(commands.length, 1)
  assert.equal(commands[0].name, 'branch-switcher')
  assert.equal(tools.length, 1)
  assert.equal(tools[0].name, 'branch_switcher')

  const listed = await invoke(route, { body: { sessionId: 's1', action: 'list' } })
  assert.equal(listed.status, 200)
  assert.deepEqual(listed.json, {
    ok: true,
    value: { root: '/repo', cwd: '/repo', current: 'main', branches: ['main', 'feat'] },
  })
})

test('branch-switcher HTTP endpoint switches branches including from detached HEAD', async () => {
  const state = { root: '/repo', cwd: '/repo', current: null, branches: ['main', 'feat'] }
  const { agent, calls } = createGitHarness(state)
  const { route } = createHarness({ agent })

  const switched = await invoke(route, {
    body: { sessionId: 's1', action: 'switch', branch: 'feat', root: '/repo', current: null },
  })
  assert.equal(switched.status, 200)
  assert.deepEqual(switched.json, {
    ok: true,
    value: { root: '/repo', cwd: '/repo', previous: null, current: 'feat' },
  })
  assert.ok(calls.some(argv => argv.slice(6).join(' ') === 'switch --no-guess -- feat'))
})

test('branch-switcher HTTP endpoint enforces owner admission, POST method, and session lookup', async () => {
  const missing = createHarness({ resolveAgent: async () => ({ error: { code: 'NOT_FOUND', message: 'No session' } }) })
  assert.equal((await invoke(missing.route, { body: { sessionId: 's1', action: 'list' }, peer: { principal: { kind: 'guest' } } })).status, 403)
  assert.equal((await invoke(missing.route, { body: { sessionId: 's1', action: 'list' }, peer: undefined })).status, 401)
  const wrongMethod = await invoke(missing.route, { method: 'GET' })
  assert.equal(wrongMethod.status, 405)
  assert.equal(wrongMethod.headers.allow, 'POST')

  const noSessionId = await invoke(missing.route, { body: { action: 'list' } })
  assert.equal(noSessionId.status, 400)
  assert.equal(noSessionId.json.ok, false)

  const notFound = await invoke(missing.route, { body: { sessionId: 'missing', action: 'list' } })
  assert.equal(notFound.status, 404)
  assert.deepEqual(notFound.json, { ok: false, message: 'No session' })
})

test('branch-switcher filters PATH to absolute entries, cleans git env, caches git, and retries once on exec errors', async () => {
  const filtered = buildAbsolutePathEnv({ PATH: '.:./bin::/usr/local/bin:/usr/bin:/usr/bin' }, 'posix')
  assert.deepEqual(filtered.env, { PATH: '/usr/local/bin:/usr/bin' })

  const env = buildGitEnv({ GIT_CONFIG_KEY_0: 'core.hooksPath', GIT_CONFIG_VALUE_0: '/tmp/hooks' })
  assert.equal(env.GIT_DIR, undefined)
  assert.equal(env.GIT_WORK_TREE, undefined)
  assert.equal(env.GIT_IMPLICIT_WORK_TREE, undefined)
  assert.equal(env.GIT_CONFIG_KEY_0, undefined)
  assert.equal(env.GIT_CONFIG_VALUE_0, undefined)

  const cachedState = { root: '/repo', cwd: '/repo', current: 'main', branches: ['main', 'feat'] }
  const cachedHarness = createGitHarness(cachedState)
  const switcher = new BranchSwitcher(new AbortController().signal)
  const listed = await switcher.run(cachedHarness.agent, { action: 'list' })
  assert.equal(listed.current, 'main')
  assert.equal(cachedHarness.resolveCalls.length, 1)

  for (const code of ['ENOENT', 'EACCES', 'ENOEXEC', 'UNKNOWN']) {
    let failedOnce = false
    const retryState = {
      root: '/repo',
      cwd: '/repo',
      current: 'main',
      branches: ['main', 'feat'],
      resolveExecutable: async (_name, _env, count) => (count === 1 ? '/opt/old/git' : '/opt/new/git'),
      onSpawn: spec => {
        if (!failedOnce) {
          failedOnce = true
          assert.equal(spec.argv[0], '/opt/old/git')
          return {
            done: Promise.reject(Object.assign(new Error(`spawn ${code}`), { code })),
            collected: {
              stdout: { readFrom: () => ({ text: '', lossy: false }) },
              stderr: { readFrom: () => ({ text: '', lossy: false }) },
            },
            terminate: () => {},
            waitForExit: async () => {},
          }
        }
        assert.equal(spec.argv[0], '/opt/new/git')
        return null
      },
    }
    const harness = createGitHarness(retryState)
    const res = await switcher.run(harness.agent, { action: 'list' })
    assert.equal(res.current, 'main')
    assert.equal(harness.resolveCalls.length, 2)
  }
})

test('branch-switcher rejects bare-repository-shaped non-repo directories and supports non-origin never-pushed branches', async () => {
  const switcher = new BranchSwitcher(new AbortController().signal)

  for (const badState of [
    { root: '/fake', cwd: '/fake', current: 'main', branches: [], insideWorkTree: 'false' },
    { root: '/fake', cwd: '/fake', current: 'main', branches: [], isBare: 'true' },
    { root: '/fake', cwd: '/fake', current: 'main', branches: [], insideGitDir: 'true' },
    { root: '/fake', cwd: '/fake', current: 'main', branches: [], gitDir: '/fake' },
    { root: '/parent', cwd: '/parent/fake', current: 'main', branches: [], gitDir: '/parent/fake', prefix: 'fake/' },
  ]) {
    const { agent } = createGitHarness(badState)
    await assert.rejects(
      () => switcher.run(agent, { action: 'list' }),
      /not inside a Git work tree/,
    )
  }

  const base = mkdtempSync(path.join(tmpdir(), 'dsh-bs-'))
  try {
    const repo = path.join(base, 'repo')
    mkdirSync(repo)
    execFileSync('git', ['init', '-b', 'main'], { cwd: repo })
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: repo })
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: repo })
    execFileSync('git', ['remote', 'add', 'upstream', 'https://github.com/acme/demo.git'], { cwd: repo })

    const makeRealAgent = targetCwd => {
      const subprocess = {
        resolveExecutable: async () => execFileSync('which', ['git'], { encoding: 'utf8' }).trim(),
        spawn: ({ argv, cwd, env }) => {
          let stdout = ''
          let stderr = ''
          let exitCode = 0
          const mergedEnv = { ...process.env }
          for (const [k, v] of Object.entries(env ?? {})) {
            if (v === undefined) delete mergedEnv[k]
            else mergedEnv[k] = v
          }
          try {
            stdout = execFileSync(argv[0], argv.slice(1), { cwd, env: mergedEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
          } catch (error) {
            stdout = String(error.stdout ?? '')
            stderr = String(error.stderr ?? '')
            exitCode = typeof error.status === 'number' ? error.status : 1
          }
          return {
            done: Promise.resolve({ exitCode, signal: null }),
            collected: {
              stdout: { readFrom: () => ({ text: stdout, lossy: false }) },
              stderr: { readFrom: () => ({ text: stderr, lossy: false }) },
            },
            terminate: () => {},
            waitForExit: async () => {},
          }
        },
      }
      const services = {
        workingDirectory: { get: () => targetCwd },
        sandboxPolicy: { resolve: () => ({ mode: 'danger-full-access' }) },
        subprocess,
      }
      return {
        ctx: { get: key => services[key] },
        session: { events: [] },
        runMaintenance: fn => fn(new AbortController().signal),
      }
    }

    const unbornListed = await switcher.run(makeRealAgent(repo), { action: 'list' })
    assert.equal(unbornListed.current, 'main')
    assert.deepEqual(unbornListed.branches, ['main'])

    const unbornNoop = await switcher.run(makeRealAgent(repo), {
      action: 'switch', branch: 'main', root: unbornListed.root, current: 'main',
    })
    assert.equal(unbornNoop.current, 'main')

    writeFileSync(path.join(repo, 'a.txt'), 'hi\n')
    execFileSync('git', ['add', 'a.txt'], { cwd: repo })
    execFileSync('git', ['commit', '-m', 'init'], { cwd: repo })
    execFileSync('git', ['checkout', '-b', 'feat/never-pushed'], { cwd: repo })

    const listed = await switcher.run(makeRealAgent(repo), { action: 'list' })
    assert.equal(listed.current, 'feat/never-pushed')
    assert.deepEqual(listed.branches, ['feat/never-pushed', 'main'])

    const switched = await switcher.run(makeRealAgent(repo), {
      action: 'switch', branch: 'main', root: listed.root, current: 'feat/never-pushed',
    })
    assert.equal(switched.previous, 'feat/never-pushed')
    assert.equal(switched.current, 'main')

    const bareShaped = path.join(base, 'bare-shaped')
    mkdirSync(path.join(bareShaped, 'objects'), { recursive: true })
    mkdirSync(path.join(bareShaped, 'refs'), { recursive: true })
    writeFileSync(path.join(bareShaped, 'HEAD'), 'ref: refs/heads/main\n')
    writeFileSync(
      path.join(bareShaped, 'config'),
      '[core]\n\trepositoryformatversion = 0\n\tbare = false\n\tworktree = .\n',
    )
    await assert.rejects(
      () => switcher.run(makeRealAgent(bareShaped), { action: 'list' }),
      /not inside a Git work tree/,
    )
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})
