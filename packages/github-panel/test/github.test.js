import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  buildGitEnv,
  clearExecutableCache,
  detectGitHubRepo,
  execResolvedCli,
  extractGitHubMentions,
  normalizeHosts,
  parseGitRemotesOutput,
  resolveCliExecutable,
  selectGitHubRemote,
} from '../lib/github.js'

const defaultTarget = {
  host: 'github.com',
  owner: 'acme',
  repo: 'demo',
  fullName: 'acme/demo',
  url: 'https://github.com/acme/demo',
}

test('extractGitHubMentions records nodeKey, seq, role, matchText, and snippet per message', () => {
  const events = [
    {
      seq: 10,
      type: 'user/message',
      data: {
        id: 'u1',
        source: { kind: 'user' },
        content: [{ type: 'text', text: 'Please check PR #42 and also https://github.com/other/repo/issues/7 today.' }],
      },
    },
    {
      seq: 18,
      type: 'assistant/message',
      data: {
        turn: 1,
        step: 2,
        message: {
          content: [{ type: 'text', text: 'I reviewed #42 and linked it with https://github.com/acme/demo/actions/runs/987654321.' }],
        },
      },
    },
  ]

  const refs = extractGitHubMentions(events, defaultTarget, normalizeHosts())
  const byKey = new Map(refs.map(ref => [ref.key, ref]))

  const pr42 = byKey.get('item:github.com/acme/demo#42')
  assert.ok(pr42)
  assert.equal(pr42.occurrences.length, 2)
  assert.equal(pr42.occurrences[0].seq, 18)
  assert.equal(pr42.occurrences[0].role, 'assistant')
  assert.equal(pr42.occurrences[0].nodeKey, '14:assistant-step1:2')
  assert.equal(pr42.occurrences[0].turn, 1)
  assert.equal(pr42.occurrences[0].matchText, '#42')
  assert.match(pr42.occurrences[0].snippet, /reviewed #42/)

  assert.equal(pr42.occurrences[1].seq, 10)
  assert.equal(pr42.occurrences[1].role, 'user')
  assert.equal(pr42.occurrences[1].nodeKey, '13:input-messageu1')
  assert.equal(pr42.occurrences[1].matchText, 'PR #42')
  assert.match(pr42.occurrences[1].snippet, /check PR #42/)

  const issue7 = byKey.get('item:github.com/other/repo#7')
  assert.ok(issue7)
  assert.equal(issue7.occurrences.length, 1)
  assert.equal(issue7.occurrences[0].matchText, 'https://github.com/other/repo/issues/7')

  const run = byKey.get('run:github.com/acme/demo/987654321')
  assert.ok(run)
  assert.equal(run.occurrences.length, 1)
  assert.equal(run.occurrences[0].nodeKey, '14:assistant-step1:2')
})

test('extractGitHubMentions ignores #numbers inside fenced code blocks and keeps accurate snippet offsets', () => {
  const events = [
    {
      seq: 25,
      type: 'user/message',
      data: {
        id: 'u2',
        source: { kind: 'user' },
        content: [{ type: 'text', text: '```js\nconst color = "#999"\n```\nActually look at acme/demo#15 here.' }],
      },
    },
  ]

  const refs = extractGitHubMentions(events, defaultTarget, normalizeHosts())
  assert.equal(refs.length, 1)
  assert.equal(refs[0].number, 15)
  assert.equal(refs[0].occurrences.length, 1)
  assert.equal(refs[0].occurrences[0].matchText, 'acme/demo#15')
  assert.match(refs[0].occurrences[0].snippet, /Actually look at acme\/demo#15 here\./)
})

function withTempDir(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'dsh-gh-panel-'))
  return Promise.resolve()
    .then(() => fn(dir))
    .finally(() => rmSync(dir, { recursive: true, force: true }))
}

function runRealGit(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

test('resolveCliExecutable resolves bare commands only from absolute PATH entries and caches lookups', async () => {
  await withTempDir(async base => {
    clearExecutableCache()
    const binA = path.join(base, 'bin-a')
    const binB = path.join(base, 'bin-b')
    mkdirSync(binA)
    mkdirSync(binB)
    const nonExec = path.join(binA, 'gh')
    writeFileSync(nonExec, '#!/bin/sh\nexit 0\n')
    chmodSync(nonExec, 0o644)
    const realExec = path.join(binB, 'gh')
    writeFileSync(realExec, '#!/bin/sh\nexit 0\n')
    chmodSync(realExec, 0o755)

    const env = { PATH: `.:./relative::${binA}:${binB}` }
    const checked = []
    const cache = new Map()
    const inflight = new Map()

    const first = await resolveCliExecutable('gh', {
      env,
      cache,
      inflight,
      isExecutableFile: async candidate => {
        checked.push(candidate)
        return candidate === realExec
      },
    })
    assert.equal(first, realExec)
    assert.deepEqual(checked, [nonExec, realExec])

    const second = await resolveCliExecutable('gh', {
      env,
      cache,
      inflight,
      isExecutableFile: async () => {
        throw new Error('should use cache')
      },
    })
    assert.equal(second, realExec)

    await assert.rejects(
      () => resolveCliExecutable('./gh', { env, cache: new Map(), inflight: new Map() }),
      error => error.code === 'ENOENT',
    )
    await assert.rejects(
      () => resolveCliExecutable('gh', { env: { PATH: '.:./bin:' }, cache: new Map(), inflight: new Map() }),
      error => error.code === 'ENOENT',
    )

    const resolvedReal = await resolveCliExecutable('gh', { env, cache: new Map(), inflight: new Map() })
    assert.equal(resolvedReal, realExec)
  })
})

test('execResolvedCli invalidates cache and retries once on ENOENT, EACCES, ENOEXEC, and UNKNOWN', async () => {
  for (const code of ['ENOENT', 'EACCES', 'ENOEXEC', 'UNKNOWN']) {
    const cache = new Map()
    const inflight = new Map()
    const env = { PATH: '/opt/first:/opt/second' }
    let available = '/opt/first/gh'
    const execTargets = []

    const result = await execResolvedCli('gh', ['--version'], { env }, {
      cache,
      inflight,
      isExecutableFile: async candidate => candidate === available,
      execFile: async target => {
        execTargets.push(target)
        if (execTargets.length === 1) {
          available = '/opt/second/gh'
          throw Object.assign(new Error(`failed with ${code}`), { code })
        }
        return { stdout: 'gh ok\n', stderr: '' }
      },
    })

    assert.equal(result.stdout, 'gh ok\n')
    assert.deepEqual(execTargets, ['/opt/first/gh', '/opt/second/gh'])
  }

  const cache = new Map()
  const inflight = new Map()
  const env = { PATH: '/opt/first' }
  let attempts = 0
  await assert.rejects(
    () => execResolvedCli('gh', ['--version'], { env }, {
      cache,
      inflight,
      isExecutableFile: async candidate => candidate === '/opt/first/gh',
      execFile: async () => {
        attempts += 1
        throw Object.assign(new Error('persistent ENOEXEC'), { code: 'ENOEXEC' })
      },
    }),
    error => error.code === 'ENOEXEC',
  )
  assert.equal(attempts, 2)

  let nonRetryAttempts = 0
  await assert.rejects(
    () => execResolvedCli('gh', ['--version'], { env }, {
      cache,
      inflight,
      isExecutableFile: async candidate => candidate === '/opt/first/gh',
      execFile: async () => {
        nonRetryAttempts += 1
        throw Object.assign(new Error('exit 1'), { code: 1 })
      },
    }),
    error => error.code === 1,
  )
  assert.equal(nonRetryAttempts, 1)
})

test('buildGitEnv strips repository and inline config overrides', () => {
  const env = buildGitEnv({
    PATH: '/usr/bin:/bin',
    GIT_DIR: '/tmp/fake',
    GIT_WORK_TREE: '/tmp/wt',
    GIT_IMPLICIT_WORK_TREE: '1',
    GIT_NAMESPACE: 'ns',
    GIT_SUPER_PREFIX: 'sub/',
    GIT_DISCOVERY_ACROSS_FILESYSTEM: '1',
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'core.fsmonitor',
    GIT_CONFIG_VALUE_0: 'evil',
  })
  assert.equal(env.PATH, '/usr/bin:/bin')
  assert.equal(env.GIT_DIR, undefined)
  assert.equal(env.GIT_WORK_TREE, undefined)
  assert.equal(env.GIT_IMPLICIT_WORK_TREE, undefined)
  assert.equal(env.GIT_NAMESPACE, undefined)
  assert.equal(env.GIT_SUPER_PREFIX, undefined)
  assert.equal(env.GIT_DISCOVERY_ACROSS_FILESYSTEM, undefined)
  assert.equal(env.GIT_CONFIG_COUNT, undefined)
  assert.equal(env.GIT_CONFIG_KEY_0, undefined)
  assert.equal(env.GIT_CONFIG_VALUE_0, undefined)
  assert.equal(env.GIT_TERMINAL_PROMPT, '0')
  assert.equal(env.GIT_OPTIONAL_LOCKS, '0')
  assert.equal(env.GIT_NO_LAZY_FETCH, '1')
  assert.equal(env.LC_ALL, 'C')
})

test('detectGitHubRepo rejects bare-repository-shaped non-repo dirs, bare repos, .git dir, and polluted GIT_DIR', async () => {
  await withTempDir(async base => {
    const bareShapedDot = path.join(base, 'bare-shaped-dot')
    mkdirSync(path.join(bareShapedDot, 'objects'), { recursive: true })
    mkdirSync(path.join(bareShapedDot, 'refs'), { recursive: true })
    writeFileSync(path.join(bareShapedDot, 'HEAD'), 'ref: refs/heads/main\n')
    writeFileSync(
      path.join(bareShapedDot, 'config'),
      '[core]\n\trepositoryformatversion = 0\n\tbare = false\n\tworktree = .\n[remote "origin"]\n\turl = https://github.com/evil/repo.git\n',
    )
    assert.equal(await detectGitHubRepo(bareShapedDot, normalizeHosts()), null)

    const bareShapedParent = path.join(base, 'parent-case', 'fake')
    mkdirSync(path.join(bareShapedParent, 'objects'), { recursive: true })
    mkdirSync(path.join(bareShapedParent, 'refs'), { recursive: true })
    writeFileSync(path.join(bareShapedParent, 'HEAD'), 'ref: refs/heads/main\n')
    writeFileSync(
      path.join(bareShapedParent, 'config'),
      '[core]\n\trepositoryformatversion = 0\n\tbare = false\n\tworktree = ..\n[remote "origin"]\n\turl = https://github.com/evil/repo.git\n',
    )
    assert.equal(await detectGitHubRepo(bareShapedParent, normalizeHosts()), null)

    const bareRepo = path.join(base, 'actual-bare.git')
    mkdirSync(bareRepo)
    runRealGit(bareRepo, ['init', '--bare'])
    runRealGit(bareRepo, ['remote', 'add', 'origin', 'https://github.com/acme/bare.git'])
    assert.equal(await detectGitHubRepo(bareRepo, normalizeHosts()), null)

    const realRepo = path.join(base, 'real-repo')
    mkdirSync(realRepo)
    runRealGit(realRepo, ['init', '-b', 'main'])
    runRealGit(realRepo, ['config', 'user.email', 'test@example.com'])
    runRealGit(realRepo, ['config', 'user.name', 'Test'])
    runRealGit(realRepo, ['remote', 'add', 'origin', 'https://github.com/acme/real.git'])
    writeFileSync(path.join(realRepo, 'README.md'), 'ok\n')
    runRealGit(realRepo, ['add', 'README.md'])
    runRealGit(realRepo, ['commit', '-m', 'init'])

    assert.equal(await detectGitHubRepo(path.join(realRepo, '.git'), normalizeHosts()), null)

    const plainDir = path.join(base, 'not-a-repo')
    mkdirSync(plainDir)
    const prevGitDir = process.env.GIT_DIR
    const prevWorkTree = process.env.GIT_WORK_TREE
    process.env.GIT_DIR = path.join(realRepo, '.git')
    process.env.GIT_WORK_TREE = realRepo
    try {
      assert.equal(await detectGitHubRepo(plainDir, normalizeHosts()), null)
    } finally {
      if (prevGitDir === undefined) delete process.env.GIT_DIR
      else process.env.GIT_DIR = prevGitDir
      if (prevWorkTree === undefined) delete process.env.GIT_WORK_TREE
      else process.env.GIT_WORK_TREE = prevWorkTree
    }

    const worktreeDir = path.join(base, 'linked-wt')
    runRealGit(realRepo, ['worktree', 'add', '-b', 'wt-branch', worktreeDir])
    const detectedWt = await detectGitHubRepo(worktreeDir, normalizeHosts())
    assert.ok(detectedWt)
    assert.equal(detectedWt.fullName, 'acme/real')
    assert.equal(detectedWt.branch, 'wt-branch')
  })
})

test('selectGitHubRemote and detectGitHubRepo handle non-origin remotes, slashed remotes, and newly created never-pushed branches', async () => {
  const remotes = parseGitRemotesOutput([
    'origin\thttps://github.com/alice/demo.git (fetch)',
    'origin\thttps://github.com/alice/demo.git (push)',
    'team/upstream\thttps://github.com/org/demo.git (fetch)',
    'team/upstream\thttps://github.com/org/demo.git (push)',
  ].join('\n'))
  const selectedSlashed = selectGitHubRemote(remotes, 'team/upstream/main', normalizeHosts())
  assert.ok(selectedSlashed)
  assert.equal(selectedSlashed.remoteName, 'team/upstream')
  assert.equal(selectedSlashed.fullName, 'org/demo')

  await withTempDir(async base => {
    const repo = path.join(base, 'non-origin-repo')
    mkdirSync(repo)
    runRealGit(repo, ['init', '-b', 'main'])
    runRealGit(repo, ['config', 'user.email', 'test@example.com'])
    runRealGit(repo, ['config', 'user.name', 'Test'])
    runRealGit(repo, ['remote', 'add', 'backup', 'https://github.com/acme/backup.git'])
    runRealGit(repo, ['remote', 'add', 'corp', 'https://github.com/acme/app.git'])

    const unborn = await detectGitHubRepo(repo, normalizeHosts())
    assert.ok(unborn)
    assert.equal(unborn.branch, 'main')
    assert.equal(unborn.shortSha, null)
    assert.equal(unborn.detached, false)
    assert.equal(unborn.upstream, null)

    writeFileSync(path.join(repo, 'file.txt'), 'hello\n')
    runRealGit(repo, ['add', 'file.txt'])
    runRealGit(repo, ['commit', '-m', 'init'])
    runRealGit(repo, ['update-ref', 'refs/tags/main', 'HEAD'])
    runRealGit(repo, ['update-ref', 'refs/remotes/corp/main', 'HEAD'])
    runRealGit(repo, ['symbolic-ref', 'refs/remotes/corp/HEAD', 'refs/remotes/corp/main'])
    runRealGit(repo, ['branch', '--set-upstream-to=corp/main', 'main'])

    const onMain = await detectGitHubRepo(repo, normalizeHosts())
    assert.ok(onMain)
    assert.equal(onMain.branch, 'main')
    assert.equal(onMain.remoteName, 'corp')
    assert.equal(onMain.fullName, 'acme/app')
    assert.equal(onMain.upstream, 'corp/main')

    runRealGit(repo, ['checkout', '-b', 'feat/never-pushed'])
    const onNewBranch = await detectGitHubRepo(repo, normalizeHosts())
    assert.ok(onNewBranch)
    assert.equal(onNewBranch.branch, 'feat/never-pushed')
    assert.equal(onNewBranch.detached, false)
    assert.equal(onNewBranch.upstream, null)
    assert.equal(onNewBranch.remoteName, 'corp')
    assert.equal(onNewBranch.fullName, 'acme/app')

    runRealGit(repo, ['remote', 'add', 'origin', 'https://github.com/alice/fork.git'])
    runRealGit(repo, ['config', 'remote.pushDefault', 'corp'])
    const withPushDefault = await detectGitHubRepo(repo, normalizeHosts())
    assert.ok(withPushDefault)
    assert.equal(withPushDefault.remoteName, 'corp')
    assert.equal(withPushDefault.fullName, 'acme/app')

    runRealGit(repo, ['config', '--unset', 'remote.pushDefault'])
    runRealGit(repo, ['checkout', '-b', 'feat/local-track', '--track', 'refs/heads/main'])
    const withLocalTrack = await detectGitHubRepo(repo, normalizeHosts())
    assert.ok(withLocalTrack)
    assert.equal(withLocalTrack.branch, 'feat/local-track')
    assert.equal(withLocalTrack.remoteName, 'corp')
    assert.equal(withLocalTrack.fullName, 'acme/app')
  })
})
