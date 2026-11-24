import { basename } from 'node:path'
import { StringDecoder } from 'node:string_decoder'
import { resolveCliCommand } from './templates.js'

const MAX_CLI_BYTES = 1024 * 1024
const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

export const DASHBOARD_URLS = {
  cursor: 'https://cursor.com/settings',
  'claude-code': 'https://claude.ai/settings/usage',
  codex: 'https://chatgpt.com/codex/settings/usage',
}

const PLAN_LABELS = {
  free: 'Free',
  plus: 'Plus',
  pro: 'Pro',
  prolite: 'Pro Lite',
  max: 'Max',
  team: 'Team',
  enterprise: 'Enterprise',
  ultra: 'Ultra',
}

const CLAUDE_RATE_LIMIT_WINDOWS = {
  five_hour: { id: 'five_hour', windowKind: 'five_hour', label: '5-hour limit', windowMinutes: 300 },
  seven_day: { id: 'seven_day', windowKind: 'seven_day', label: 'Weekly · all models', windowMinutes: 10080 },
  seven_day_opus: { id: 'seven_day_opus', windowKind: 'model_weekly', modelName: 'Opus', label: 'Weekly · Opus', windowMinutes: 10080 },
  seven_day_sonnet: { id: 'seven_day_sonnet', windowKind: 'model_weekly', modelName: 'Sonnet', label: 'Weekly · Sonnet', windowMinutes: 10080 },
  seven_day_overage_included: { id: 'seven_day_overage_included', windowKind: 'seven_day', label: 'Weekly · included models', windowMinutes: 10080 },
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function unescapeMarkdown(value) {
  return value.replace(/\\([\\`*_[\]<>|])/g, '$1').trim()
}

function clampPercent(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10
}

function toIsoTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const ms = value < 1e12 ? value * 1000 : value
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  return undefined
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'window'
}

export function normalizePlanLabel(raw) {
  const text = cleanText(raw)
  if (!text) return undefined
  const key = text.toLowerCase().replace(/[\s_-]+/g, '')
  return PLAN_LABELS[key] ?? text
}

export function accountFromAuthStatus(authStatus, fallbackPlan) {
  const first = authStatus?.accounts?.find(item => item?.active) ?? authStatus?.accounts?.[0]
  const rawState = cleanText(authStatus?.state)
  const state = rawState === 'authenticated' || rawState === 'signed_in' ? 'authenticated'
    : rawState === 'unauthenticated' || rawState === 'signed_out' || rawState === 'not_authenticated' ? 'unauthenticated'
      : first ? 'authenticated' : 'unknown'
  const email = cleanText(first?.email)
  const name = cleanText(first?.name)
  const label = cleanText(first?.label)
  const plan = normalizePlanLabel(first?.subscriptionType) ?? normalizePlanLabel(fallbackPlan)
  const authDetail = cleanText(first?.description) ?? cleanText(first?.detail)
  if (state === 'unknown' && !email && !name && !label && !plan && !authDetail) return undefined
  return {
    state,
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
    ...(label ? { label } : {}),
    ...(plan ? { plan } : {}),
    ...(authDetail ? { authDetail } : {}),
  }
}

function classifyClaudeWindow(label) {
  if (/^5-hour\b/iu.test(label)) {
    return { id: 'five_hour', windowKind: 'five_hour', label, windowMinutes: 300 }
  }
  if (/^Weekly\s*·\s*all models$/iu.test(label)) {
    return { id: 'seven_day', windowKind: 'seven_day', label, windowMinutes: 10080 }
  }
  const modelMatch = /^Weekly\s*·\s*(.+)$/iu.exec(label)
  if (modelMatch) {
    const modelName = modelMatch[1].trim()
    return {
      id: `seven_day_${slugify(modelName)}`,
      windowKind: 'model_weekly',
      modelName,
      label,
      windowMinutes: 10080,
    }
  }
  if (/extra\s+usage/iu.test(label)) {
    return { id: 'extra_usage', windowKind: 'extra_usage', label }
  }
  return { id: slugify(label), windowKind: 'custom', label }
}

export function parseClaudeUsageMarkdown(markdown) {
  const text = typeof markdown === 'string' ? markdown : ''
  const result = { plan: undefined, windows: [], activity: undefined }
  if (!text.trim()) return result

  const subMatch = /^>\s*Claude\s+(.+?)\s+subscription\s+usage\s*$/imu.exec(text)
  if (subMatch) result.plan = normalizePlanLabel(unescapeMarkdown(subMatch[1]))

  let section = ''
  const seen = new Set()
  const activity = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    if (/^###\s+/.test(line)) {
      const heading = line.replace(/^###\s+/, '').trim().toLowerCase()
      if (heading === 'limits') section = 'limits'
      else if (heading.includes('using your limits')) section = 'behaviors'
      else section = heading
      continue
    }
    if (section === 'limits') {
      const match = /^\*\*(.+?)\*\*\s*(?:—|--|-)\s*\*\*(\d+(?:\.\d+)?)%\*\*(?:\s*·\s*Resets\s+(.+))?$/u.exec(line)
      if (!match) continue
      const label = unescapeMarkdown(match[1])
      const usedPercent = clampPercent(Number(match[2]))
      if (usedPercent === undefined) continue
      const resetsText = match[3] ? unescapeMarkdown(match[3]) : undefined
      const meta = classifyClaudeWindow(label)
      if (seen.has(meta.id)) continue
      seen.add(meta.id)
      const status = usedPercent >= 100 ? 'rejected' : usedPercent >= 80 ? 'allowed_warning' : 'allowed'
      result.windows.push({
        ...meta,
        usedPercent,
        status,
        ...(resetsText ? { resetsText } : {}),
      })
    } else if (section === 'behaviors') {
      const periodMatch = /^\*\*Last\s+(24h|7d)\*\*\s*·\s*(\d+)\s+requests?\s*·\s*(\d+)\s+sessions?/iu.exec(line)
      if (!periodMatch) continue
      const key = periodMatch[1].toLowerCase() === '24h' ? 'day' : 'week'
      activity[key] = { requests: Number(periodMatch[2]), sessions: Number(periodMatch[3]) }
    }
  }
  if (activity.day || activity.week) result.activity = activity
  return result
}

export function buildClaudeSubscription({ markdown, authStatus, rateLimit, fetchedAt }) {
  const parsed = parseClaudeUsageMarkdown(markdown)
  const account = accountFromAuthStatus(authStatus, parsed.plan)
  const base = {
    fetchedAt,
    adapterId: 'claude-code',
    source: 'acp-usage',
    quotaSupported: true,
    dashboardUrl: DASHBOARD_URLS['claude-code'],
    ...(account ? { account } : {}),
    windows: parsed.windows,
    ...(parsed.activity ? { activity: parsed.activity } : {}),
    ...(parsed.windows.length === 0 ? {
      quotaNote: account?.state === 'unauthenticated' ? 'signed_out' : 'custom_endpoint_or_api',
    } : {}),
  }
  return rateLimit ? mergeRateLimitIntoSubscription(base, rateLimit, 'claude-code', fetchedAt) : base
}

export function mergeRateLimitIntoSubscription(previous, rateLimit, adapterId, fetchedAt) {
  if (!rateLimit) return previous ?? null
  const windows = Array.isArray(previous?.windows) ? previous.windows.map(item => ({ ...item })) : []
  let extraUsage = previous?.extraUsage ? { ...previous.extraUsage } : undefined

  if (rateLimit.overageEnabled !== undefined || rateLimit.overageStatus || rateLimit.isUsingOverage !== undefined) {
    extraUsage = {
      ...extraUsage,
      enabled: rateLimit.overageEnabled ?? extraUsage?.enabled ?? true,
      ...(rateLimit.overageStatus ? { status: rateLimit.overageStatus } : {}),
      ...(rateLimit.overageResetsAt ? { resetsAt: rateLimit.overageResetsAt } : {}),
      ...(rateLimit.isUsingOverage !== undefined ? { active: rateLimit.isUsingOverage } : {}),
    }
  }

  if (rateLimit.rateLimitType === 'overage') {
    extraUsage = {
      ...extraUsage,
      enabled: true,
      ...(rateLimit.usedPercent !== undefined ? { usedPercent: rateLimit.usedPercent } : {}),
      ...(rateLimit.status ? { status: rateLimit.status } : {}),
      ...(rateLimit.resetsAt ? { resetsAt: rateLimit.resetsAt } : {}),
    }
  } else if (rateLimit.rateLimitType) {
    const spec = CLAUDE_RATE_LIMIT_WINDOWS[rateLimit.rateLimitType] ?? {
      id: slugify(rateLimit.rateLimitType),
      windowKind: 'custom',
      label: rateLimit.rateLimitType,
    }
    const existing = windows.find(item => item.id === spec.id)
    if (existing) {
      if (rateLimit.usedPercent !== undefined) existing.usedPercent = rateLimit.usedPercent
      if (rateLimit.status) existing.status = rateLimit.status
      if (rateLimit.resetsAt) {
        existing.resetsAt = rateLimit.resetsAt
        delete existing.resetsText
      }
    } else if (rateLimit.usedPercent !== undefined || (rateLimit.status && rateLimit.status !== 'allowed')) {
      windows.push({
        ...spec,
        ...(rateLimit.usedPercent !== undefined ? { usedPercent: rateLimit.usedPercent } : {}),
        ...(rateLimit.status ? { status: rateLimit.status } : {}),
        ...(rateLimit.resetsAt ? { resetsAt: rateLimit.resetsAt } : {}),
      })
    }
  }

  const next = {
    ...previous,
    fetchedAt: previous?.fetchedAt ?? fetchedAt,
    adapterId: previous?.adapterId ?? adapterId,
    source: previous?.source ?? 'acp-rate-limit',
    quotaSupported: true,
    dashboardUrl: previous?.dashboardUrl ?? DASHBOARD_URLS[adapterId],
    windows,
    ...(extraUsage ? { extraUsage } : {}),
    liveRateLimit: {
      at: fetchedAt,
      ...(rateLimit.status ? { status: rateLimit.status } : {}),
      ...(rateLimit.rateLimitType ? { rateLimitType: rateLimit.rateLimitType } : {}),
      ...(rateLimit.resetsAt ? { resetsAt: rateLimit.resetsAt } : {}),
    },
  }
  if (windows.length > 0 && next.quotaNote === 'custom_endpoint_or_api') delete next.quotaNote
  return next
}

export function normalizeCursorCliUsage(aboutJson, statusJson, fetchedAt) {
  const userInfo = statusJson?.userInfo && typeof statusJson.userInfo === 'object' ? statusJson.userInfo : null
  const isAuth = typeof statusJson?.isAuthenticated === 'boolean'
    ? statusJson.isAuthenticated
    : statusJson?.status === 'authenticated'
      ? true
      : Boolean(cleanText(aboutJson?.userEmail) || cleanText(aboutJson?.subscriptionTier))
  const email = cleanText(userInfo?.email) ?? cleanText(aboutJson?.userEmail)
  const fullName = [cleanText(userInfo?.firstName), cleanText(userInfo?.lastName)].filter(Boolean).join(' ')
  const plan = normalizePlanLabel(aboutJson?.subscriptionTier)
  const state = statusJson || aboutJson ? (isAuth ? 'authenticated' : 'unauthenticated') : 'unknown'
  return {
    fetchedAt,
    adapterId: 'cursor',
    source: 'cli-about',
    quotaSupported: false,
    quotaNote: state === 'unauthenticated' ? 'signed_out' : 'cli_not_exposed',
    dashboardUrl: DASHBOARD_URLS.cursor,
    account: {
      state,
      ...(email ? { email } : {}),
      ...(fullName ? { name: fullName } : {}),
      ...(plan ? { plan } : {}),
    },
    windows: [],
  }
}

export function normalizeAntigravityUsage(tier, authStatus, fetchedAt) {
  const plan = normalizePlanLabel(tier?.name)
  const baseAccount = accountFromAuthStatus(authStatus, plan)
  const account = baseAccount
    ? { ...baseAccount, state: baseAccount.state === 'unknown' && plan ? 'authenticated' : baseAccount.state }
    : (plan ? { state: 'authenticated', plan } : { state: 'unknown' })
  return {
    fetchedAt,
    adapterId: 'antigravity',
    source: 'acp-session',
    quotaSupported: false,
    quotaNote: account.state === 'unauthenticated' ? 'signed_out' : 'acp_not_exposed',
    account,
    windows: [],
  }
}

function codexWindowSpec(bucket, slot, entry) {
  const mins = Number.isFinite(entry.windowDurationMins) && entry.windowDurationMins > 0 ? Math.round(entry.windowDurationMins) : undefined
  const limitId = cleanText(bucket.limitId) ?? 'codex'
  const limitName = cleanText(bucket.limitName)
  const id = `${limitId}:${slot}`
  if (limitName) {
    return { id, windowKind: 'model_window', modelName: limitName, label: limitName, ...(mins ? { windowMinutes: mins } : {}) }
  }
  if (mins === 300) return { id, windowKind: 'five_hour', label: '5-hour limit', windowMinutes: mins }
  if (mins === 10080) return { id, windowKind: 'seven_day', label: '7-day limit', windowMinutes: mins }
  return { id, windowKind: 'duration', label: mins ? `${mins}m limit` : slot, ...(mins ? { windowMinutes: mins } : {}) }
}

export function normalizeCodexRateLimits(accountResult, rateLimitsResult, fetchedAt) {
  const buckets = []
  const byId = rateLimitsResult?.rateLimitsByLimitId
  if (byId && typeof byId === 'object') {
    for (const bucket of Object.values(byId)) {
      if (bucket && typeof bucket === 'object') buckets.push(bucket)
    }
  }
  if (!buckets.length && rateLimitsResult?.rateLimits && typeof rateLimitsResult.rateLimits === 'object') {
    buckets.push(rateLimitsResult.rateLimits)
  }

  const windows = []
  let plan
  let credits
  for (const bucket of buckets) {
    if (!plan) plan = normalizePlanLabel(bucket.planType)
    if (!credits && bucket.credits && typeof bucket.credits === 'object') {
      credits = {
        hasCredits: Boolean(bucket.credits.hasCredits),
        unlimited: Boolean(bucket.credits.unlimited),
        ...(cleanText(bucket.credits.balance) ? { balance: cleanText(bucket.credits.balance) } : {}),
      }
    }
    for (const slot of ['primary', 'secondary']) {
      const entry = bucket[slot]
      if (!entry || typeof entry !== 'object') continue
      const usedPercent = clampPercent(entry.usedPercent)
      if (usedPercent === undefined) continue
      const resetsAt = toIsoTimestamp(entry.resetsAt)
      const status = bucket.rateLimitReachedType || usedPercent >= 100
        ? 'rejected'
        : usedPercent >= 80 ? 'allowed_warning' : 'allowed'
      windows.push({
        ...codexWindowSpec(bucket, slot, entry),
        usedPercent,
        status,
        ...(resetsAt ? { resetsAt } : {}),
      })
    }
  }

  const resetCount = rateLimitsResult?.rateLimitResetCredits?.availableCount
  if (Number.isSafeInteger(resetCount) && resetCount > 0) {
    credits = { hasCredits: false, unlimited: false, ...credits, resetCreditsAvailable: resetCount }
  }

  const rawAccount = accountResult?.account && typeof accountResult.account === 'object' ? accountResult.account : null
  const email = cleanText(rawAccount?.email)
  if (!plan) plan = normalizePlanLabel(rawAccount?.planType)
  const authDetail = rawAccount?.type === 'apiKey' ? 'API key' : rawAccount?.type === 'chatgpt' ? 'ChatGPT' : undefined
  const authenticated = Boolean(rawAccount || rateLimitsResult?.accountId || windows.length > 0 || plan)
  const account = {
    state: authenticated ? 'authenticated' : accountResult?.requiresOpenaiAuth ? 'unauthenticated' : 'unknown',
    ...(email ? { email } : {}),
    ...(plan ? { plan } : {}),
    ...(authDetail ? { authDetail } : {}),
  }

  return {
    fetchedAt,
    adapterId: 'codex',
    source: 'codex-app-server',
    quotaSupported: true,
    dashboardUrl: DASHBOARD_URLS.codex,
    account,
    windows,
    ...(credits ? { credits } : {}),
    ...(windows.length === 0 ? {
      quotaNote: account.state === 'unauthenticated' ? 'signed_out' : 'custom_endpoint_or_api',
    } : {}),
  }
}

export function computeLocalUsageByProvider(sessions, nowMs = Date.now()) {
  const cutoff24h = nowMs - DAY_MS
  const cutoff7d = nowMs - WEEK_MS
  const byProvider = {}

  for (const session of sessions) {
    const pid = session?.providerId
    if (!pid) continue
    const bucket = byProvider[pid] ??= {
      last24h: { sessions: 0, turns: 0 },
      last7d: { sessions: 0, turns: 0 },
      total: { sessions: 0, turns: 0 },
    }
    bucket.total.sessions += 1
    const runs = Array.isArray(session.native?.runs) ? session.native.runs : []
    if (runs.length > 0) {
      let in24h = false
      let in7d = false
      for (const run of runs) {
        bucket.total.turns += 1
        const ts = Date.parse(run?.startedAt ?? run?.finishedAt ?? '')
        if (!Number.isFinite(ts)) continue
        if (ts >= cutoff7d) {
          bucket.last7d.turns += 1
          in7d = true
        }
        if (ts >= cutoff24h) {
          bucket.last24h.turns += 1
          in24h = true
        }
      }
      if (in7d) bucket.last7d.sessions += 1
      if (in24h) bucket.last24h.sessions += 1
    } else {
      const ts = Date.parse(session.updatedAt ?? session.createdAt ?? '')
      if (Number.isFinite(ts)) {
        if (ts >= cutoff7d) bucket.last7d.sessions += 1
        if (ts >= cutoff24h) bucket.last24h.sessions += 1
      }
    }
  }
  return byProvider
}

export async function runJsonCli(subprocess, command, args, cwd, timeoutMs = 10_000) {
  const executable = await subprocess.resolveExecutable(command, undefined, AbortSignal.timeout(5_000))
  const child = subprocess.spawn({
    argv: [executable, ...args],
    cwd,
    stdio: { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
    graceMs: 1_500,
  })
  const stdoutChunks = []
  let bytes = 0
  let overflow = false
  child.stdout?.on('data', chunk => {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += buf.length
    if (bytes > MAX_CLI_BYTES) {
      overflow = true
      child.terminate()
      return
    }
    stdoutChunks.push(buf)
  })
  child.stderr?.resume?.()
  try { child.stdin?.end() } catch {}

  let timer
  try {
    const timedOut = new Promise((_, reject) => {
      timer = setTimeout(() => {
        child.terminate()
        reject(new Error(`Command timed out after ${timeoutMs} ms`))
      }, timeoutMs)
    })
    const outcome = await Promise.race([child.done, timedOut])
    if (overflow) throw new Error('Command output exceeded 1 MiB')
    if (outcome?.exitCode !== 0 && outcome?.exitCode !== undefined && outcome?.exitCode !== null) {
      throw new Error(`Command exited with code ${outcome.exitCode}`)
    }
    const text = Buffer.concat(stdoutChunks).toString('utf8').trim()
    if (!text) return null
    return JSON.parse(text)
  } finally {
    clearTimeout(timer)
    try { child.terminate() } catch {}
    await child.done.catch(() => {})
  }
}

export async function probeCodexAppServer(subprocess, command, cwd, clientInfo, timeoutMs = 12_000) {
  const bin = typeof command === 'string' && command ? basename(command).toLowerCase() : ''
  const candidate = bin === 'codex' ? command : resolveCliCommand('codex')
  let executable
  try {
    executable = await subprocess.resolveExecutable(candidate, undefined, AbortSignal.timeout(5_000))
  } catch {
    executable = await subprocess.resolveExecutable('codex', undefined, AbortSignal.timeout(5_000))
  }

  // external: codex app-server speaks NDJSON JSON-RPC without a jsonrpc: "2.0" field on responses
  const child = subprocess.spawn({
    argv: [executable, 'app-server'],
    cwd,
    stdio: { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
    graceMs: 1_500,
  })
  child.stderr?.resume?.()

  const decoder = new StringDecoder('utf8')
  const pending = new Map()
  let buffer = ''
  let nextId = 0
  let settled = false

  const failAll = error => {
    if (settled) return
    settled = true
    for (const item of pending.values()) {
      clearTimeout(item.timer)
      item.reject(error)
    }
    pending.clear()
  }

  const request = (method, params) => {
    const id = ++nextId
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`Codex ${method} timed out after ${timeoutMs} ms`))
      }, timeoutMs)
      pending.set(id, { resolve, reject, timer })
      try {
        child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`)
      } catch (error) {
        clearTimeout(timer)
        pending.delete(id)
        reject(error)
      }
    })
  }

  const consume = chunk => {
    buffer += chunk
    if (buffer.length > MAX_CLI_BYTES) {
      failAll(new Error('Codex app-server output exceeded 1 MiB'))
      child.terminate()
      return
    }
    let start = 0
    let nl
    while ((nl = buffer.indexOf('\n', start)) !== -1) {
      const line = buffer.slice(start, nl).trim()
      start = nl + 1
      if (!line) continue
      let message
      try { message = JSON.parse(line) } catch { continue }
      if (message?.id === undefined || message?.id === null) continue
      const item = pending.get(message.id)
      if (!item) continue
      pending.delete(message.id)
      clearTimeout(item.timer)
      if (message.error) item.reject(new Error(message.error.message ?? 'Codex RPC failed'))
      else item.resolve(message.result ?? {})
    }
    buffer = buffer.slice(start)
  }

  child.stdout?.on('data', data => consume(decoder.write(data)))
  child.stdout?.on('end', () => {
    const tail = decoder.end()
    if (tail) consume(tail)
    failAll(new Error('Codex app-server closed unexpectedly'))
  })
  child.done.then(() => failAll(new Error('Codex app-server exited')), failAll)

  try {
    await request('initialize', { clientInfo, capabilities: {} })
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'initialized', params: {} })}\n`)
    const [accountResult, rateLimitsResult] = await Promise.all([
      request('account/read', {}).catch(() => null),
      request('account/rateLimits/read', {}),
    ])
    return { accountResult, rateLimitsResult }
  } finally {
    failAll(new Error('Codex probe finished'))
    try { child.stdin?.end() } catch {}
    try { child.terminate() } catch {}
    await child.done.catch(() => {})
  }
}
