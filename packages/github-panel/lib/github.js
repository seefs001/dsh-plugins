import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const GIT_TIMEOUT_MS = 5_000
const GH_TIMEOUT_MS = 15_000
const MAX_BUFFER = 2 * 1024 * 1024
const DEFAULT_HOSTS = ['github.com']
const VALID_SEGMENT = /^[A-Za-z0-9._-]+$/
const VALID_TAG = /^[^\s\0/][^ \0]*$/

const STRIPPED_GIT_ENV = [
  'GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
  'GIT_CEILING_DIRECTORIES', 'GIT_PREFIX', 'GIT_SHALLOW_FILE', 'GIT_GRAFT_FILE',
  'GIT_REPLACE_REF_BASE', 'GIT_ATTR_SOURCE',
]

const SECRET_ENV_PATTERN = /(?:^DSH_|TOKEN|SECRET|PASSWORD|KEY)/i

function buildGitEnv() {
  const env = { ...process.env }
  for (const key of STRIPPED_GIT_ENV) delete env[key]
  env.GIT_TERMINAL_PROMPT = '0'
  env.GIT_OPTIONAL_LOCKS = '0'
  env.GIT_NO_LAZY_FETCH = '1'
  env.LC_ALL = 'C'
  return env
}

function buildGhEnv() {
  const env = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) continue
    if (SECRET_ENV_PATTERN.test(key)) continue
    env[key] = value
  }
  env.GH_PROMPT_DISABLED = '1'
  env.GH_NO_UPDATE_NOTIFIER = '1'
  env.NO_COLOR = '1'
  env.CLICOLOR = '0'
  env.PAGER = 'cat'
  env.GH_PAGER = 'cat'
  env.LC_ALL = 'C'
  return env
}

export function normalizeHosts(hosts) {
  const list = Array.isArray(hosts) && hosts.length > 0 ? hosts : DEFAULT_HOSTS
  const out = new Set()
  for (const item of list) {
    if (typeof item !== 'string') continue
    const clean = item.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    if (clean) out.add(clean)
  }
  if (out.size === 0) out.add('github.com')
  return out
}

export function parseGitHubRemoteUrl(rawUrl, allowedHosts = normalizeHosts()) {
  if (typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  let host = ''
  let pathPart = ''

  const scpMatch = /^(?:[^@\s/]+@)?([A-Za-z0-9.-]+):([^\s]+)$/.exec(trimmed)
  if (scpMatch && !trimmed.includes('://')) {
    host = scpMatch[1].toLowerCase()
    pathPart = scpMatch[2]
  } else {
    let parsed
    try {
      parsed = new URL(trimmed)
    } catch {
      return null
    }
    if (!['https:', 'http:', 'ssh:', 'git:'].includes(parsed.protocol)) return null
    const isHttp = parsed.protocol === 'https:' || parsed.protocol === 'http:'
    host = (isHttp && parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname).toLowerCase()
    pathPart = parsed.pathname
  }

  if (!allowedHosts.has(host)) return null

  const cleanPath = pathPart.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.git$/i, '')
  const parts = cleanPath.split('/').filter(Boolean)
  if (parts.length !== 2) return null

  const [owner, repo] = parts
  if (!VALID_SEGMENT.test(owner) || !VALID_SEGMENT.test(repo)) return null
  if (owner === '.' || owner === '..' || repo === '.' || repo === '..') return null

  return {
    host,
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    url: `https://${host}/${owner}/${repo}`,
  }
}

export function parseGitRemotesOutput(text) {
  const map = new Map()
  for (const line of String(text || '').split(/\r?\n/)) {
    const match = /^(\S+)\s+(\S+)\s+\((fetch|push)\)$/.exec(line.trim())
    if (!match) continue
    const [, name, url, kind] = match
    const existing = map.get(name) ?? {}
    existing[kind] = url
    map.set(name, existing)
  }
  return map
}

export function selectGitHubRemote(remotesMap, upstreamRef, allowedHosts) {
  const candidates = []
  if (typeof upstreamRef === 'string' && upstreamRef.includes('/')) {
    const upstreamRemote = upstreamRef.split('/')[0]
    if (upstreamRemote) candidates.push(upstreamRemote)
  }
  candidates.push('origin', 'upstream')
  for (const name of remotesMap.keys()) {
    if (!candidates.includes(name)) candidates.push(name)
  }

  for (const name of candidates) {
    const entry = remotesMap.get(name)
    if (!entry) continue
    const parsed = parseGitHubRemoteUrl(entry.fetch ?? entry.push, allowedHosts)
    if (parsed) return { ...parsed, remoteName: name }
  }
  return null
}

async function runGit(cwd, args, signal) {
  const combined = signal ? AbortSignal.any([signal, AbortSignal.timeout(GIT_TIMEOUT_MS)]) : AbortSignal.timeout(GIT_TIMEOUT_MS)
  const { stdout } = await execFileAsync(
    'git',
    ['--no-optional-locks', '-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', ...args],
    { cwd, env: buildGitEnv(), maxBuffer: MAX_BUFFER, signal: combined, encoding: 'utf8' },
  )
  return stdout.trim()
}

export async function detectGitHubRepo(cwd, allowedHosts, signal) {
  if (typeof cwd !== 'string' || !cwd) return null
  let root
  try {
    root = await runGit(cwd, ['rev-parse', '--show-toplevel'], signal)
  } catch {
    return null
  }
  if (!root) return null

  const [remotesRes, branchRes, shaRes, upstreamRes] = await Promise.allSettled([
    runGit(root, ['remote', '-v'], signal),
    runGit(root, ['symbolic-ref', '--quiet', '--short', 'HEAD'], signal),
    runGit(root, ['rev-parse', '--short', 'HEAD'], signal),
    runGit(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'], signal),
  ])

  if (remotesRes.status !== 'fulfilled') return null
  const remotesMap = parseGitRemotesOutput(remotesRes.value)
  const selected = selectGitHubRemote(remotesMap, upstreamRes.status === 'fulfilled' ? upstreamRes.value : null, allowedHosts)
  if (!selected) return null

  const branch = branchRes.status === 'fulfilled' && branchRes.value ? branchRes.value : null
  const shortSha = shaRes.status === 'fulfilled' && shaRes.value ? shaRes.value : null
  const upstream = upstreamRes.status === 'fulfilled' && upstreamRes.value ? upstreamRes.value : null

  return {
    ...selected,
    root,
    branch,
    shortSha,
    detached: branch === null,
    upstream,
  }
}

export function classifyGhError(error, host) {
  const code = error?.code
  if (code === 'ENOENT') {
    return {
      authState: 'unavailable',
      message: 'GitHub CLI (gh) is not installed on the host.',
      loginCommand: null,
    }
  }
  if (error?.name === 'AbortError' || code === 'ABORT_ERR') {
    return {
      authState: 'unavailable',
      message: 'GitHub request timed out.',
      loginCommand: null,
    }
  }
  const stderr = typeof error?.stderr === 'string' ? error.stderr.trim() : ''
  const stdout = typeof error?.stdout === 'string' ? error.stdout.trim() : ''
  const detail = firstDiagnosticLine(stderr) || firstDiagnosticLine(stdout) || (error instanceof Error ? error.message : String(error))

  if (/not logged into|gh auth login|authentication|bad credentials|requires authentication|HTTP 401/i.test(`${stderr}\n${stdout}\n${detail}`)) {
    return {
      authState: 'unauthenticated',
      message: detail || `Sign in to ${host} with GitHub CLI.`,
      loginCommand: `gh auth login --hostname ${host}`,
    }
  }
  if (/rate limit|secondary rate limit|HTTP 429|API rate limit exceeded/i.test(`${stderr}\n${stdout}\n${detail}`)) {
    return {
      authState: 'rate-limited',
      message: detail || 'GitHub API rate limit exceeded.',
      loginCommand: null,
    }
  }
  if (/Could not resolve to a Repository|NOT_FOUND|HTTP 404/i.test(`${stderr}\n${stdout}\n${detail}`)) {
    return {
      authState: 'not-found',
      message: detail || 'Repository not found or inaccessible.',
      loginCommand: null,
    }
  }
  return {
    authState: 'error',
    message: detail || 'Unable to query GitHub.',
    loginCommand: null,
  }
}

function firstDiagnosticLine(text) {
  if (!text) return ''
  for (const line of text.split(/\r?\n/)) {
    const clean = line.trim()
    if (!clean) continue
    if (clean.startsWith('{')) {
      try {
        const parsed = JSON.parse(text)
        if (typeof parsed?.message === 'string' && parsed.message) return parsed.message
        if (Array.isArray(parsed?.errors) && typeof parsed.errors[0]?.message === 'string') return parsed.errors[0].message
      } catch {}
    }
    return clean.slice(0, 260)
  }
  return ''
}

async function runGh(args, signal, timeoutMs = GH_TIMEOUT_MS) {
  const combined = signal ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs)
  const { stdout } = await execFileAsync('gh', args, {
    env: buildGhEnv(),
    maxBuffer: MAX_BUFFER,
    signal: combined,
    encoding: 'utf8',
  })
  return stdout
}

async function runGhJson(args, signal) {
  const stdout = await runGh(args, signal)
  return JSON.parse(stdout)
}

const OVERVIEW_QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    nameWithOwner
    description
    url
    isPrivate
    isArchived
    stargazerCount
    forkCount
    pushedAt
    viewerPermission
    primaryLanguage { name color }
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(first: 10) {
            nodes {
              oid
              abbreviatedOid
              messageHeadline
              committedDate
              commitUrl
              author {
                name
                user { login }
              }
            }
          }
        }
      }
    }
    openPrs: pullRequests(states: OPEN, first: 15, orderBy: { field: UPDATED_AT, direction: DESC }) {
      totalCount
      nodes {
        number
        title
        url
        isDraft
        state
        createdAt
        updatedAt
        headRefName
        baseRefName
        reviewDecision
        additions
        deletions
        changedFiles
        author { login }
        comments { totalCount }
        labels(first: 5) { nodes { name color } }
        commits(last: 1) {
          nodes {
            commit {
              statusCheckRollup { state }
            }
          }
        }
      }
    }
    openIssues: issues(states: OPEN, first: 15, orderBy: { field: UPDATED_AT, direction: DESC }) {
      totalCount
      nodes {
        number
        title
        url
        state
        createdAt
        updatedAt
        author { login }
        comments { totalCount }
        labels(first: 5) { nodes { name color } }
        assignees(first: 3) { nodes { login } }
      }
    }
    latestRelease {
      tagName
      name
      url
      publishedAt
      isPrerelease
      isDraft
    }
  }
}
`

const PR_DETAIL_QUERY = `
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      title
      url
      body
      state
      isDraft
      mergeable
      mergeStateStatus
      reviewDecision
      createdAt
      updatedAt
      mergedAt
      closedAt
      headRefName
      baseRefName
      additions
      deletions
      changedFiles
      author { login }
      labels(first: 10) { nodes { name color } }
      reviewRequests(first: 10) {
        nodes {
          requestedReviewer {
            __typename
            ... on User { login }
            ... on Team { name slug }
          }
        }
      }
      commits(last: 1) {
        nodes {
          commit {
            oid
            statusCheckRollup {
              state
              contexts(first: 30) {
                nodes {
                  __typename
                  ... on CheckRun { name status conclusion detailsUrl }
                  ... on StatusContext { context state targetUrl }
                }
              }
            }
          }
        }
      }
      comments(last: 20) {
        totalCount
        nodes {
          id
          body
          createdAt
          url
          author { login }
        }
      }
    }
  }
}
`

const ISSUE_DETAIL_QUERY = `
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    issue(number: $number) {
      number
      title
      url
      body
      state
      stateReason
      createdAt
      updatedAt
      closedAt
      author { login }
      labels(first: 10) { nodes { name color } }
      assignees(first: 6) { nodes { login } }
      milestone { title dueOn }
      comments(last: 20) {
        totalCount
        nodes {
          id
          body
          createdAt
          url
          author { login }
        }
      }
    }
  }
}
`

function mapLabels(connection) {
  return (connection?.nodes ?? [])
    .filter(Boolean)
    .map(label => ({ name: label.name, color: label.color || null }))
}

function mapPullRequest(node) {
  const rollupState = node.commits?.nodes?.[0]?.commit?.statusCheckRollup?.state ?? null
  return {
    number: node.number,
    title: node.title,
    url: node.url,
    isDraft: Boolean(node.isDraft),
    state: node.state,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    headRefName: node.headRefName,
    baseRefName: node.baseRefName,
    reviewDecision: node.reviewDecision ?? null,
    additions: node.additions ?? 0,
    deletions: node.deletions ?? 0,
    changedFiles: node.changedFiles ?? 0,
    author: node.author?.login ?? 'ghost',
    commentsCount: node.comments?.totalCount ?? 0,
    labels: mapLabels(node.labels),
    checksState: rollupState,
  }
}

function mapIssue(node) {
  return {
    number: node.number,
    title: node.title,
    url: node.url,
    state: node.state,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    author: node.author?.login ?? 'ghost',
    commentsCount: node.comments?.totalCount ?? 0,
    labels: mapLabels(node.labels),
    assignees: (node.assignees?.nodes ?? []).filter(Boolean).map(user => user.login),
  }
}

function mapRun(run) {
  return {
    id: run.id,
    name: run.name ?? '',
    displayTitle: run.display_title || run.name || `#${run.run_number ?? run.id}`,
    runNumber: run.run_number ?? null,
    headBranch: run.head_branch ?? null,
    headSha: typeof run.head_sha === 'string' ? run.head_sha.slice(0, 7) : null,
    event: run.event ?? null,
    status: run.status ?? null,
    conclusion: run.conclusion ?? null,
    url: run.html_url ?? null,
    actor: run.actor?.login ?? null,
    createdAt: run.created_at ?? null,
    updatedAt: run.updated_at ?? null,
    startedAt: run.run_started_at ?? null,
  }
}

function mapCommit(node) {
  return {
    oid: node.oid,
    shortOid: node.abbreviatedOid,
    headline: node.messageHeadline,
    committedDate: node.committedDate,
    url: node.commitUrl,
    author: node.author?.user?.login || node.author?.name || 'unknown',
  }
}

export async function fetchGitHubOverview(target, signal) {
  const gqlArgs = [
    'api', 'graphql',
    '--hostname', target.host,
    '-F', `owner=${target.owner}`,
    '-F', `name=${target.repo}`,
    '-f', `query=${OVERVIEW_QUERY}`,
  ]
  const runsArgs = [
    'api',
    '--hostname', target.host,
    `repos/${target.owner}/${target.repo}/actions/runs?per_page=10`,
  ]

  const [gqlRes, runsRes] = await Promise.allSettled([
    runGhJson(gqlArgs, signal),
    runGhJson(runsArgs, signal),
  ])

  if (gqlRes.status !== 'fulfilled') {
    const failure = classifyGhError(gqlRes.reason, target.host)
    return {
      linked: true,
      authState: failure.authState,
      error: failure.message,
      loginCommand: failure.loginCommand,
      fetchedAt: Date.now(),
      remote: target,
      repo: null,
      pullRequests: [],
      pullRequestsTotal: 0,
      issues: [],
      issuesTotal: 0,
      runs: [],
      commits: [],
      latestRelease: null,
    }
  }

  const payload = gqlRes.value
  const repoNode = payload?.data?.repository
  if (!repoNode) {
    const msg = payload?.errors?.[0]?.message || 'Repository not found.'
    const failure = classifyGhError(new Error(msg), target.host)
    return {
      linked: true,
      authState: failure.authState,
      error: failure.message,
      loginCommand: failure.loginCommand,
      fetchedAt: Date.now(),
      remote: target,
      repo: null,
      pullRequests: [],
      pullRequestsTotal: 0,
      issues: [],
      issuesTotal: 0,
      runs: [],
      commits: [],
      latestRelease: null,
    }
  }

  const runs = runsRes.status === 'fulfilled' && Array.isArray(runsRes.value?.workflow_runs)
    ? runsRes.value.workflow_runs.slice(0, 10).map(mapRun)
    : []

  const pullRequests = (repoNode.openPrs?.nodes ?? []).filter(Boolean).map(mapPullRequest)
  const issues = (repoNode.openIssues?.nodes ?? []).filter(Boolean).map(mapIssue)
  const commits = (repoNode.defaultBranchRef?.target?.history?.nodes ?? []).filter(Boolean).map(mapCommit)

  return {
    linked: true,
    authState: 'ready',
    error: null,
    loginCommand: null,
    fetchedAt: Date.now(),
    remote: target,
    repo: {
      fullName: repoNode.nameWithOwner,
      description: repoNode.description ?? '',
      url: repoNode.url,
      isPrivate: Boolean(repoNode.isPrivate),
      isArchived: Boolean(repoNode.isArchived),
      stars: repoNode.stargazerCount ?? 0,
      forks: repoNode.forkCount ?? 0,
      pushedAt: repoNode.pushedAt ?? null,
      defaultBranch: repoNode.defaultBranchRef?.name ?? null,
      primaryLanguage: repoNode.primaryLanguage ?? null,
      viewerPermission: repoNode.viewerPermission ?? null,
    },
    pullRequests,
    pullRequestsTotal: repoNode.openPrs?.totalCount ?? pullRequests.length,
    issues,
    issuesTotal: repoNode.openIssues?.totalCount ?? issues.length,
    runs,
    commits,
    latestRelease: repoNode.latestRelease ?? null,
  }
}

function mapCheckContext(node) {
  if (!node) return null
  if (node.__typename === 'CheckRun') {
    return {
      name: node.name,
      status: node.status,
      conclusion: node.conclusion ?? null,
      url: node.detailsUrl ?? null,
    }
  }
  if (node.__typename === 'StatusContext') {
    return {
      name: node.context,
      status: 'COMPLETED',
      conclusion: node.state ?? null,
      url: node.targetUrl ?? null,
    }
  }
  return null
}

function mapComments(connection) {
  return (connection?.nodes ?? []).filter(Boolean).map(comment => ({
    id: comment.id,
    author: comment.author?.login ?? 'ghost',
    body: typeof comment.body === 'string' ? comment.body.slice(0, 24_000) : '',
    createdAt: comment.createdAt,
    url: comment.url,
  }))
}

export async function fetchGitHubDetail(target, kind, id, signal) {
  if (kind === 'pr') {
    const number = Number.parseInt(String(id), 10)
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error('Invalid pull request number')
    const data = await runGhJson([
      'api', 'graphql',
      '--hostname', target.host,
      '-F', `owner=${target.owner}`,
      '-F', `name=${target.repo}`,
      '-F', `number=${number}`,
      '-f', `query=${PR_DETAIL_QUERY}`,
    ], signal)
    const pr = data?.data?.repository?.pullRequest
    if (!pr) throw new Error(data?.errors?.[0]?.message || `Pull request #${number} not found`)
    const rollup = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup ?? null
    const checks = (rollup?.contexts?.nodes ?? []).map(mapCheckContext).filter(Boolean)
    const reviewers = (pr.reviewRequests?.nodes ?? []).map(item => {
      const reviewer = item?.requestedReviewer
      if (!reviewer) return null
      return reviewer.__typename === 'Team' ? reviewer.name || reviewer.slug : reviewer.login
    }).filter(Boolean)
    return {
      kind: 'pr',
      number: pr.number,
      title: pr.title,
      url: pr.url,
      body: typeof pr.body === 'string' ? pr.body.slice(0, 48_000) : '',
      state: pr.state,
      isDraft: Boolean(pr.isDraft),
      mergeable: pr.mergeable ?? null,
      mergeStateStatus: pr.mergeStateStatus ?? null,
      reviewDecision: pr.reviewDecision ?? null,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      mergedAt: pr.mergedAt ?? null,
      closedAt: pr.closedAt ?? null,
      headRefName: pr.headRefName,
      baseRefName: pr.baseRefName,
      additions: pr.additions ?? 0,
      deletions: pr.deletions ?? 0,
      changedFiles: pr.changedFiles ?? 0,
      author: pr.author?.login ?? 'ghost',
      labels: mapLabels(pr.labels),
      reviewers,
      checksState: rollup?.state ?? null,
      checks,
      commentsTotal: pr.comments?.totalCount ?? 0,
      comments: mapComments(pr.comments),
    }
  }

  if (kind === 'issue') {
    const number = Number.parseInt(String(id), 10)
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error('Invalid issue number')
    const data = await runGhJson([
      'api', 'graphql',
      '--hostname', target.host,
      '-F', `owner=${target.owner}`,
      '-F', `name=${target.repo}`,
      '-F', `number=${number}`,
      '-f', `query=${ISSUE_DETAIL_QUERY}`,
    ], signal)
    const issue = data?.data?.repository?.issue
    if (!issue) throw new Error(data?.errors?.[0]?.message || `Issue #${number} not found`)
    return {
      kind: 'issue',
      number: issue.number,
      title: issue.title,
      url: issue.url,
      body: typeof issue.body === 'string' ? issue.body.slice(0, 48_000) : '',
      state: issue.state,
      stateReason: issue.stateReason ?? null,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      closedAt: issue.closedAt ?? null,
      author: issue.author?.login ?? 'ghost',
      labels: mapLabels(issue.labels),
      assignees: (issue.assignees?.nodes ?? []).filter(Boolean).map(user => user.login),
      milestone: issue.milestone ?? null,
      commentsTotal: issue.comments?.totalCount ?? 0,
      comments: mapComments(issue.comments),
    }
  }

  if (kind === 'run') {
    const runId = String(id).trim()
    if (!/^\d+$/.test(runId)) throw new Error('Invalid workflow run id')
    const [runData, jobsData] = await Promise.all([
      runGhJson(['api', '--hostname', target.host, `repos/${target.owner}/${target.repo}/actions/runs/${runId}`], signal),
      runGhJson(['api', '--hostname', target.host, `repos/${target.owner}/${target.repo}/actions/runs/${runId}/jobs?per_page=30`], signal),
    ])
    const jobs = Array.isArray(jobsData?.jobs)
      ? jobsData.jobs.map(job => ({
        id: job.id,
        name: job.name,
        status: job.status ?? null,
        conclusion: job.conclusion ?? null,
        startedAt: job.started_at ?? null,
        completedAt: job.completed_at ?? null,
        url: job.html_url ?? null,
        steps: Array.isArray(job.steps)
          ? job.steps.map(step => ({
            number: step.number,
            name: step.name,
            status: step.status ?? null,
            conclusion: step.conclusion ?? null,
          }))
          : [],
      }))
      : []
    return {
      kind: 'run',
      ...mapRun(runData),
      jobs,
    }
  }

  if (kind === 'release') {
    const tag = String(id).trim()
    if (!tag || !VALID_TAG.test(tag) || tag.includes('..')) throw new Error('Invalid release tag')
    const rel = await runGhJson([
      'api', '--hostname', target.host,
      `repos/${target.owner}/${target.repo}/releases/tags/${encodeURIComponent(tag)}`,
    ], signal)
    return {
      kind: 'release',
      tagName: rel.tag_name ?? tag,
      name: rel.name || rel.tag_name || tag,
      body: typeof rel.body === 'string' ? rel.body.slice(0, 48_000) : '',
      url: rel.html_url ?? null,
      publishedAt: rel.published_at ?? rel.created_at ?? null,
      isPrerelease: Boolean(rel.prerelease),
      isDraft: Boolean(rel.draft),
      author: rel.author?.login ?? null,
      assets: Array.isArray(rel.assets)
        ? rel.assets.slice(0, 15).map(asset => ({
          name: asset.name,
          size: asset.size ?? 0,
          downloadCount: asset.download_count ?? 0,
          url: asset.browser_download_url ?? null,
        }))
        : [],
    }
  }

  throw new Error(`Unsupported detail kind: ${kind}`)
}

export async function rerunFailedJobs(target, runId, signal) {
  const cleanId = String(runId).trim()
  if (!/^\d+$/.test(cleanId)) throw new Error('Invalid workflow run id')
  await runGh([
    'api', '--hostname', target.host,
    '-X', 'POST',
    `repos/${target.owner}/${target.repo}/actions/runs/${cleanId}/rerun-failed-jobs`,
  ], signal)
  return { ok: true, runId: cleanId }
}
