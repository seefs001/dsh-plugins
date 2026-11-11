/**
 * Worktree handling for relay runs (switchboard spec §9.4, binding.worktree v2):
 * fetch origin refspecs, start at an exact commit, optional branch (one worktree
 * per branch, reused), restore agent-config paths to a trusted version, and
 * bundle the commits produced since `start`.
 */
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export async function git(cwd, ...args) {
  const { stdout } = await execFileAsync('git', ['-C', cwd, ...args], { maxBuffer: 64 * 1024 * 1024 })
  return stdout.trim()
}

async function tryGit(cwd, ...args) {
  try { return await git(cwd, ...args) } catch { return undefined }
}

export const worktreeRoot = workspacePath => join(workspacePath, '.switchboard', 'worktrees')
export const slug = s => s.replace(/[^\w.-]+/g, '-').replace(/^[-.]+|-+$/g, '').slice(0, 80) || 'worktree'

/** Local ref a fetched refspec without a destination lands in. */
export const fetchedRef = src => `refs/switchboard/fetched/${src.replace(/^refs\//, '')}`

/** Branches that may be reset to `start` when they already exist locally. */
export const MANAGED_BRANCH_PREFIX = 'switchboard/'

async function resolveCommit(repo, ref) {
  const sha = await tryGit(repo, 'rev-parse', '--verify', '--quiet', `${ref}^{commit}`)
    ?? await tryGit(repo, 'rev-parse', '--verify', '--quiet', `${fetchedRef(ref)}^{commit}`)
  if (!sha) throw new Error(`cannot resolve ${ref} to a commit`)
  return sha
}

/** `.env*` style entries are prefixes; others match the path or anything below it. */
export function matchesRestore(entries, file) {
  return entries.some(e => e.endsWith('*') ? file.startsWith(e.slice(0, -1)) : file === e || file.startsWith(`${e}/`))
}

async function branchWorktree(repo, branch) {
  const out = await git(repo, 'worktree', 'list', '--porcelain')
  let path
  for (const line of out.split('\n')) {
    if (line.startsWith('worktree ')) path = line.slice('worktree '.length)
    else if (line === `branch refs/heads/${branch}`) return path
  }
  return undefined
}

async function inside(root, path) {
  const rel = relative(await realpath(root), await realpath(path))
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

async function clearSkipWorktree(path) {
  const files = (await git(path, 'ls-files', '-v')).split('\n').filter(l => l.startsWith('S ')).map(l => l.slice(2))
  if (files.length) await git(path, 'update-index', '--no-skip-worktree', '--', ...files)
}

/**
 * Restore tracked files matching `restorePaths` to their `restoreFrom` version,
 * deleting those absent there, and mark them skip-worktree so the agent's
 * commits never carry the substitution. Files absent from HEAD stay absent.
 */
async function restoreConfig(path, restorePaths, restoreFrom) {
  if (!restorePaths.length) return []
  const head = (await git(path, 'ls-tree', '-r', '--name-only', 'HEAD')).split('\n').filter(Boolean)
  const matched = head.filter(f => matchesRestore(restorePaths, f))
  if (!matched.length) return []
  const source = new Set(restoreFrom ? (await git(path, 'ls-tree', '-r', '--name-only', restoreFrom)).split('\n') : [])
  const restore = matched.filter(f => source.has(f))
  if (restore.length) await git(path, 'restore', `--source=${restoreFrom}`, '--worktree', '--', ...restore)
  for (const file of matched.filter(m => !source.has(m))) await rm(join(path, file), { force: true, recursive: true })
  await git(path, 'update-index', '--skip-worktree', '--', ...matched)
  return matched
}

/**
 * Create or reuse the worktree for one run.
 * @returns `{ path, base, branch?, restored }`; `base` is the resolved start commit (bundle base).
 */
export async function prepareWorktree(workspacePath, runId, wt) {
  for (const spec of wt.fetch ?? []) {
    await git(workspacePath, 'fetch', '--no-tags', 'origin', spec.includes(':') ? spec : `+${spec}:${fetchedRef(spec)}`)
  }
  const base = await resolveCommit(workspacePath, wt.start)
  const restoreFrom = wt.restoreFrom ? await resolveCommit(workspacePath, wt.restoreFrom) : undefined
  const root = worktreeRoot(workspacePath)
  await mkdir(root, { recursive: true })
  let path
  if (wt.branch) {
    path = await branchWorktree(workspacePath, wt.branch)
    if (path !== undefined) {
      if (!await inside(root, path)) throw new Error(`branch ${wt.branch} is checked out outside ${root}`)
      await clearSkipWorktree(path)
      await git(path, 'reset', '--hard', base)
      await git(path, 'clean', '-fd')
    } else {
      path = join(root, slug(wt.branch))
      if (await tryGit(workspacePath, 'rev-parse', '--verify', '--quiet', `refs/heads/${wt.branch}`)) {
        if (!wt.branch.startsWith(MANAGED_BRANCH_PREFIX)) throw new Error(`branch ${wt.branch} already exists and is not a ${MANAGED_BRANCH_PREFIX} branch`)
        await git(workspacePath, 'worktree', 'add', path, wt.branch)
        await git(path, 'reset', '--hard', base)
      } else {
        await git(workspacePath, 'worktree', 'add', '-b', wt.branch, path, base)
      }
    }
  } else {
    path = join(root, slug(runId))
    await git(workspacePath, 'worktree', 'add', '--detach', path, base)
  }
  if (wt.commitAuthor) {
    // Per-worktree config keeps the author out of the main checkout.
    await git(path, 'config', 'extensions.worktreeConfig', 'true')
    await git(path, 'config', '--worktree', 'user.name', wt.commitAuthor.name)
    await git(path, 'config', '--worktree', 'user.email', wt.commitAuthor.email)
  }
  const restored = await restoreConfig(path, wt.restorePaths ?? [], restoreFrom)
  return { path, base, ...wt.branch ? { branch: wt.branch } : {}, restored }
}

/** Bundle `base..tip` when the worktree has new commits; `undefined` otherwise. */
export async function bundleWorktree(wt) {
  const head = await git(wt.path, 'rev-parse', 'HEAD')
  const log = await git(wt.path, 'log', '--format=%H %s', `${wt.base}..${head}`)
  if (!log) return undefined
  const commits = log.split('\n').map(line => ({ sha: line.slice(0, 40), subject: line.slice(41) }))
  const diffstat = await git(wt.path, 'diff', '--stat', `${wt.base}..${head}`)
  const dir = await mkdtemp(join(tmpdir(), 'switchboard-bundle-'))
  try {
    const file = join(dir, 'run.bundle')
    await git(wt.path, 'bundle', 'create', file, `${wt.base}..${wt.branch ? `refs/heads/${wt.branch}` : 'HEAD'}`)
    return {
      data: new Uint8Array(await readFile(file)),
      meta: { base: wt.base, head, ...wt.branch ? { branch: wt.branch } : {}, commits, diffstat },
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
