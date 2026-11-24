import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const GIT_TIMEOUT_MS = 5_000
const GH_TIMEOUT_MS = 15_000
const MAX_BUFFER = 2 * 1024 * 1024
const MAX_MENTIONS = 20
const MAX_MENTION_RUNS = 5
const DEFAULT_HOSTS = ['github.com']
const VALID_SEGMENT = /^[A-Za-z0-9._-]+$/

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

export function validateRepoTarget(host, owner, repo, allowedHosts = normalizeHosts()) {
  if (typeof host !== 'string' || typeof owner !== 'string' || typeof repo !== 'string') return null
  const cleanHost = host.trim().toLowerCase()
  const cleanOwner = owner.trim()
  const cleanRepo = repo.trim()
  if (!allowedHosts.has(cleanHost)) return null
  if (!VALID_SEGMENT.test(cleanOwner) || !VALID_SEGMENT.test(cleanRepo)) return null
  if (cleanOwner === '.' || cleanOwner === '..' || cleanRepo === '.' || cleanRepo === '..') return null
  return {
    host: cleanHost,
    owner: cleanOwner,
    repo: cleanRepo,
    fullName: `${cleanOwner}/${cleanRepo}`,
    url: `https://${cleanHost}/${cleanOwner}/${cleanRepo}`,
  }
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

  const cleanPath = pathPart.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.git$/i, '')
  const parts = cleanPath.split('/').filter(Boolean)
  if (parts.length !== 2) return null

  return validateRepoTarget(host, parts[0], parts[1], allowedHosts)
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

async function runGhGraphqlTolerant(args, signal) {
  try {
    return await runGhJson(args, signal)
  } catch (error) {
    // external: gh api graphql exits non-zero when any individual alias has a GraphQL error even though partial data is on stdout
    const stdout = typeof error?.stdout === 'string' ? error.stdout.trim() : ''
    if (stdout.startsWith('{')) {
      try {
        const parsed = JSON.parse(stdout)
        if (parsed && typeof parsed === 'object' && 'data' in parsed) return parsed
      } catch {}
    }
    throw error
  }
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

function stripFencedCodeBlocks(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, ' ')
}

function collectConversationTexts(events) {
  if (!Array.isArray(events)) return []
  const texts = []
  for (const event of events) {
    if (!event || typeof event !== 'object') continue
    if (event.type === 'user/message') {
      const sourceKind = event.data?.source?.kind
      if (sourceKind && sourceKind !== 'user' && sourceKind !== 'steering') continue
      const blocks = event.data?.content
      if (Array.isArray(blocks)) {
        for (const block of blocks) {
          if (block?.type === 'text' && typeof block.text === 'string' && block.text) {
            texts.push(block.text)
          }
        }
      }
    } else if (event.type === 'assistant/message') {
      const blocks = event.data?.message?.content
      if (Array.isArray(blocks)) {
        for (const block of blocks) {
          if (block?.type === 'text' && typeof block.text === 'string' && block.text) {
            texts.push(block.text)
          }
        }
      }
    }
  }
  return texts
}

export function extractGitHubMentions(events, defaultTarget = null, allowedHosts = normalizeHosts()) {
  const texts = collectConversationTexts(events)
  if (texts.length === 0) return []

  const found = new Map()
  const record = (key, entry) => {
    found.delete(key)
    found.set(key, entry)
  }

  const urlPattern = /https?:\/\/([A-Za-z0-9.-]+(?::\d+)?)\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)\/(issues|pull|actions\/runs)\/(\d+)(?=[/?#\s),.\]}"'`]|$)/gi
  const crossRepoPattern = /(?<![A-Za-z0-9._/@:-])([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([A-Za-z0-9._-]{1,100})#([1-9]\d{0,6})\b/g
  const keywordNumPattern = /\b(?:PR|pull\s+request|issue)s?\s+#?([1-9]\d{0,6})\b/gi
  const bareHashPattern = /(?<![A-Za-z0-9_&#:/.-])#([1-9]\d{0,6})\b/g

  for (const rawText of texts) {
    for (const match of rawText.matchAll(urlPattern)) {
      const [, rawHost, rawOwner, rawRepo, segment, rawId] = match
      const target = validateRepoTarget(rawHost, rawOwner, rawRepo, allowedHosts)
      if (!target) continue
      const lowerSeg = segment.toLowerCase()
      if (lowerSeg === 'actions/runs') {
        const key = `run:${target.host}/${target.fullName}/${rawId}`
        record(key, {
          key,
          kind: 'run',
          explicit: true,
          ...target,
          runId: rawId,
          url: `${target.url}/actions/runs/${rawId}`,
        })
      } else {
        const number = Number.parseInt(rawId, 10)
        if (!Number.isSafeInteger(number) || number <= 0) continue
        const key = `item:${target.host}/${target.fullName}#${number}`
        record(key, {
          key,
          kind: lowerSeg === 'pull' ? 'pr' : 'issue',
          explicit: true,
          ...target,
          number,
          url: `${target.url}/${lowerSeg}/${number}`,
        })
      }
    }

    const prose = stripFencedCodeBlocks(rawText)
    const defaultHost = defaultTarget?.host ?? 'github.com'

    for (const match of prose.matchAll(crossRepoPattern)) {
      const [, rawOwner, rawRepo, rawNum] = match
      const target = validateRepoTarget(defaultHost, rawOwner, rawRepo, allowedHosts)
      if (!target) continue
      const number = Number.parseInt(rawNum, 10)
      if (!Number.isSafeInteger(number) || number <= 0) continue
      const key = `item:${target.host}/${target.fullName}#${number}`
      if (!found.has(key)) {
        record(key, {
          key,
          kind: 'auto',
          explicit: false,
          ...target,
          number,
          url: `${target.url}/issues/${number}`,
        })
      } else {
        record(key, found.get(key))
      }
    }

    if (defaultTarget) {
      for (const pattern of [keywordNumPattern, bareHashPattern]) {
        for (const match of prose.matchAll(pattern)) {
          const number = Number.parseInt(match[1], 10)
          if (!Number.isSafeInteger(number) || number <= 0) continue
          const key = `item:${defaultTarget.host}/${defaultTarget.fullName}#${number}`
          if (!found.has(key)) {
            record(key, {
              key,
              kind: 'auto',
              explicit: false,
              host: defaultTarget.host,
              owner: defaultTarget.owner,
              repo: defaultTarget.repo,
              fullName: defaultTarget.fullName,
              number,
              url: `${defaultTarget.url}/issues/${number}`,
            })
          } else {
            record(key, found.get(key))
          }
        }
      }
    }
  }

  return [...found.values()].toReversed().slice(0, MAX_MENTIONS)
}

function buildMentionGraphqlQuery(refs) {
  const fields = refs.map((ref, idx) => `
    m${idx}: repository(owner: ${JSON.stringify(ref.owner)}, name: ${JSON.stringify(ref.repo)}) {
      nameWithOwner
      item: issueOrPullRequest(number: ${ref.number}) {
        __typename
        ... on Issue {
          number title url state stateReason createdAt updatedAt
          author { login }
          comments { totalCount }
          labels(first: 5) { nodes { name color } }
          assignees(first: 3) { nodes { login } }
        }
        ... on PullRequest {
          number title url state isDraft createdAt updatedAt
          headRefName baseRefName reviewDecision additions deletions changedFiles
          author { login }
          comments { totalCount }
          labels(first: 5) { nodes { name color } }
          commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
        }
      }
    }
  `).join('\n')
  return `query {\n${fields}\n}`
}

export async function resolveGitHubMentions(refs, signal) {
  if (!Array.isArray(refs) || refs.length === 0) return []

  const itemRefs = refs.filter(ref => ref.kind !== 'run')
  const runRefs = refs.filter(ref => ref.kind === 'run').slice(0, MAX_MENTION_RUNS)

  const resolvedByKey = new Map()

  const itemsByHost = new Map()
  for (const ref of itemRefs) {
    const list = itemsByHost.get(ref.host) ?? []
    list.push(ref)
    itemsByHost.set(ref.host, list)
  }

  const hostTasks = [...itemsByHost.entries()].map(async ([host, hostRefs]) => {
    const query = buildMentionGraphqlQuery(hostRefs)
    try {
      const payload = await runGhGraphqlTolerant([
        'api', 'graphql',
        '--hostname', host,
        '-f', `query=${query}`,
      ], signal)
      const data = payload?.data ?? {}
      hostRefs.forEach((ref, idx) => {
        const repoNode = data[`m${idx}`]
        const item = repoNode?.item
        if (!item) return
        const canonicalFull = repoNode.nameWithOwner || ref.fullName
        const [canonicalOwner, canonicalRepo] = canonicalFull.includes('/') ? canonicalFull.split('/') : [ref.owner, ref.repo]
        if (item.__typename === 'PullRequest') {
          resolvedByKey.set(ref.key, {
            kind: 'pr',
            host: ref.host,
            owner: canonicalOwner,
            repo: canonicalRepo,
            fullName: canonicalFull,
            ...mapPullRequest(item),
          })
        } else if (item.__typename === 'Issue') {
          resolvedByKey.set(ref.key, {
            kind: 'issue',
            host: ref.host,
            owner: canonicalOwner,
            repo: canonicalRepo,
            fullName: canonicalFull,
            ...mapIssue(item),
          })
        }
      })
    } catch {
      for (const ref of hostRefs) {
        if (!ref.explicit) continue
        resolvedByKey.set(ref.key, {
          kind: ref.kind === 'pr' ? 'pr' : 'issue',
          host: ref.host,
          owner: ref.owner,
          repo: ref.repo,
          fullName: ref.fullName,
          number: ref.number,
          title: `${ref.fullName}#${ref.number}`,
          url: ref.url,
          state: 'UNKNOWN',
          isDraft: false,
          author: '',
          updatedAt: null,
          labels: [],
          unresolved: true,
        })
      }
    }
  })

  const runTasks = runRefs.map(async ref => {
    try {
      const runData = await runGhJson([
        'api', '--hostname', ref.host,
        `repos/${ref.owner}/${ref.repo}/actions/runs/${ref.runId}`,
      ], signal)
      resolvedByKey.set(ref.key, {
        kind: 'run',
        host: ref.host,
        owner: ref.owner,
        repo: ref.repo,
        fullName: ref.fullName,
        ...mapRun(runData),
      })
    } catch {
      resolvedByKey.set(ref.key, {
        kind: 'run',
        host: ref.host,
        owner: ref.owner,
        repo: ref.repo,
        fullName: ref.fullName,
        id: Number(ref.runId),
        name: 'Actions',
        displayTitle: `Run #${ref.runId}`,
        url: ref.url,
        status: null,
        conclusion: null,
        updatedAt: null,
        unresolved: true,
      })
    }
  })

  await Promise.allSettled([...hostTasks, ...runTasks])

  const ordered = []
  for (const ref of refs) {
    const resolved = resolvedByKey.get(ref.key)
    if (resolved) ordered.push(resolved)
  }
  return ordered
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
      latestRelease: null,
    }
  }

  const runs = runsRes.status === 'fulfilled' && Array.isArray(runsRes.value?.workflow_runs)
    ? runsRes.value.workflow_runs.slice(0, 10).map(mapRun)
    : []

  const pullRequests = (repoNode.openPrs?.nodes ?? []).filter(Boolean).map(mapPullRequest)
  const issues = (repoNode.openIssues?.nodes ?? []).filter(Boolean).map(mapIssue)

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
    latestRelease: repoNode.latestRelease ?? null,
  }
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
