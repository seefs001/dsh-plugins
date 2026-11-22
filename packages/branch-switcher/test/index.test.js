import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import { OP_PATH, apply } from '../lib/index.js'

function createGitHarness(state) {
  const calls = []
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
    resolveExecutable: async name => `/usr/bin/${name}`,
    spawn: ({ argv }) => {
      calls.push(argv)
      const sub = argv.slice(6)
      if (sub[0] === 'rev-parse') return makeChild(`${state.root}\n`)
      if (sub[0] === 'symbolic-ref') {
        return state.current === null ? makeChild('', '', 1) : makeChild(`refs/heads/${state.current}\n`, '', 0)
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
  return { agent, calls }
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
