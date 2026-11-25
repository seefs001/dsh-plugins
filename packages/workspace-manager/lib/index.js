import { execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const name = 'workspace-manager'
export const inject = ['workspaceRegistry', 'webServer', 'connection']

const GIT_TIMEOUT_MS = 4000
const GIT_CACHE_TTL_MS = 60_000
const MAX_BODY_BYTES = 64 * 1024

export function isLinkedWorktreePaths(gitDir, commonDir, cwd) {
  if (!gitDir || !commonDir) return false
  return resolve(cwd, gitDir) !== resolve(cwd, commonDir)
}

async function runGit(cwd, args) {
  const { stdout } = await execFileAsync('git', ['--no-optional-locks', '-C', cwd, ...args], {
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: 256 * 1024,
    windowsHide: true,
  })
  return stdout
}

async function inspect(workspace) {
  const row = { workspaceId: workspace.id, path: workspace.path }
  try {
    const entry = await stat(row.path)
    return { ...row, status: entry.isDirectory() ? 'directory' : 'not-directory' }
  } catch (error) {
    if (error.code === 'ENOENT') return { ...row, status: 'missing' }
    if (error.code === 'ENOTDIR') return { ...row, status: 'not-directory' }
    return { ...row, status: 'unavailable', code: error.code ?? 'UNKNOWN' }
  }
}

async function inspectWorktree(cwd, cache) {
  const now = Date.now()
  const hit = cache.get(cwd)
  if (hit && now - hit.at < GIT_CACHE_TTL_MS) return hit.value
  try {
    const raw = await runGit(cwd, ['rev-parse', '--git-dir', '--git-common-dir', '--abbrev-ref', 'HEAD'])
    const lines = raw.trim().split(/\r?\n/)
    const [gitDir, commonDir, branch] = lines
    if (!isLinkedWorktreePaths(gitDir, commonDir, cwd)) {
      const value = { linked: false, clean: false, branch: '' }
      cache.set(cwd, { at: now, value })
      return value
    }
    const statusOut = await runGit(cwd, ['status', '--porcelain=v1'])
    const clean = statusOut.trim().length === 0
    const commonAbs = resolve(cwd, commonDir)
    const value = { linked: true, clean, branch: branch || '', mainRoot: dirname(commonAbs) }
    cache.set(cwd, { at: now, value })
    return value
  } catch {
    const value = { linked: false, clean: false, branch: '' }
    cache.set(cwd, { at: now, value })
    return value
  }
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(payload))
}

async function collectIdleJobs(ctx, sessions, currentSessionId) {
  const jobs = ctx.get?.('jobs')
  if (!jobs || typeof jobs.list !== 'function') return []
  const sessionMap = new Map(sessions.map(s => [s.sessionId, s]))
  const runningIds = new Set(sessions.filter(s => s.running).map(s => s.sessionId))
  const seen = new Set()
  const idleJobs = []
  const collectFor = owner => {
    let rows = []
    try { rows = jobs.list(owner) } catch { return }
    for (const job of rows) {
      if (!job?.id || seen.has(job.id)) continue
      seen.add(job.id)
      if (job.status !== 'running') continue
      const jobOwner = job.owner ?? owner ?? null
      if (jobOwner && (jobOwner === currentSessionId || runningIds.has(jobOwner))) continue
      const meta = jobOwner ? sessionMap.get(jobOwner) : null
      idleJobs.push({
        jobId: job.id,
        owner: jobOwner,
        kind: job.kind || 'job',
        label: job.label || job.command || job.description || job.id,
        sessionTitle: meta?.displayTitle || meta?.title || jobOwner || '',
        startedAt: job.startedAt ?? job.createdAt ?? 0,
      })
    }
  }
  collectFor(undefined)
  for (const s of sessions) {
    if (s.sessionId) collectFor(s.sessionId)
  }
  return idleJobs
}

export function apply(ctx) {
  const gitCache = new Map()
  const rejected = (res, peer) => {
    if (peer?.principal?.kind === 'owner') return false
    res.statusCode = peer === undefined ? 401 : 403
    res.end()
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/workspace-manager/check',
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try {
        const checks = []
        for (const workspace of ctx.workspaceRegistry.list()) checks.push(await inspect(workspace))
        sendJson(res, 200, { checks })
      } catch (error) {
        sendJson(res, 503, { message: error.message ?? String(error) })
      }
    },
  }), 'workspace-manager: directory checks')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/workspace-manager/cleanup-scan',
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try {
        const url = new URL(req.url ?? '/workspace-manager/cleanup-scan', 'http://localhost')
        const currentWorkspaceId = url.searchParams.get('currentWorkspaceId') || ''
        const currentSessionId = url.searchParams.get('currentSessionId') || ''
        const workspaces = ctx.workspaceRegistry.list()
        let sessions = []
        const controller = ctx.get?.('sessionController')
        if (controller && typeof controller.list === 'function') {
          try {
            const listed = await controller.list({}, AbortSignal.timeout(10_000))
            sessions = Array.isArray(listed?.items) ? listed.items : []
          } catch {}
        }
        const runningSessionIds = new Set(sessions.filter(s => s.running).map(s => s.sessionId))
        const invalidWorkspaces = []
        const cleanWorktrees = []
        for (const ws of workspaces) {
          const check = await inspect(ws)
          if (check.status === 'missing' || check.status === 'not-directory') {
            if (ws.id !== currentWorkspaceId) {
              invalidWorkspaces.push({
                workspaceId: ws.id,
                title: ws.title || ws.path,
                path: ws.path,
                status: check.status,
                sessionCount: Array.isArray(ws.sessionIds) ? ws.sessionIds.length : 0,
              })
            }
            continue
          }
          if (check.status !== 'directory' || ws.id === currentWorkspaceId) continue
          const wsSessions = Array.isArray(ws.sessionIds) ? ws.sessionIds : []
          const hasBusy = wsSessions.some(id => id === currentSessionId || runningSessionIds.has(id))
          if (hasBusy) continue
          const wt = await inspectWorktree(ws.path, gitCache)
          if (wt.linked && wt.clean) {
            cleanWorktrees.push({
              workspaceId: ws.id,
              title: ws.title || ws.path,
              path: ws.path,
              branch: wt.branch,
              sessionCount: wsSessions.length,
            })
          }
        }
        const idleJobs = await collectIdleJobs(ctx, sessions, currentSessionId)
        sendJson(res, 200, { invalidWorkspaces, idleJobs, cleanWorktrees })
      } catch (error) {
        sendJson(res, 503, { message: error.message ?? String(error) })
      }
    },
  }), 'workspace-manager: cleanup scan')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/workspace-manager/cleanup-action',
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      if (req.headers['content-type']?.split(';')[0] !== 'application/json') return sendJson(res, 415, { message: 'JSON only' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let body = null
      try { body = JSON.parse(raw) } catch {}
      if (!body || typeof body !== 'object') return sendJson(res, 400, { message: 'Invalid JSON body' })

      if (body.action === 'stop-job') {
        const jobs = ctx.get?.('jobs')
        if (!jobs || typeof jobs.kill !== 'function') return sendJson(res, 503, { message: 'Jobs service unavailable' })
        if (typeof body.jobId !== 'string' || !body.jobId) return sendJson(res, 400, { message: 'Missing jobId' })
        try {
          const outcome = jobs.kill(body.jobId, body.owner || undefined, 'cleaned up by user')
          return sendJson(res, 200, { ok: true, outcome })
        } catch (error) {
          return sendJson(res, 400, { message: error?.message ?? String(error) })
        }
      }

      if (body.action === 'remove-worktree') {
        const targetPath = typeof body.path === 'string' ? body.path : ''
        const listed = ctx.workspaceRegistry.list().find(ws => ws.path === targetPath)
        if (!listed) return sendJson(res, 404, { message: 'Workspace not found' })
        gitCache.delete(targetPath)
        const wt = await inspectWorktree(targetPath, gitCache)
        if (!wt.linked) return sendJson(res, 400, { message: 'Directory is not a linked Git worktree' })
        if (!wt.clean) return sendJson(res, 409, { message: 'Worktree has uncommitted changes; skipped for safety' })
        try {
          await runGit(wt.mainRoot, ['worktree', 'remove', targetPath])
          gitCache.delete(targetPath)
          return sendJson(res, 200, { ok: true })
        } catch (error) {
          return sendJson(res, 500, { message: error?.message ?? String(error) })
        }
      }

      return sendJson(res, 400, { message: 'Unsupported cleanup action' })
    },
  }), 'workspace-manager: cleanup action')
}
