import { homedir } from 'node:os'
import { join } from 'node:path'

const SERVER_NAME = /^[A-Za-z0-9_-]{1,32}$/
const ENV_REF = /\$\{([^}]*)\}/g
const ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/

const expandHome = value => value.startsWith('~/') ? join(homedir(), value.slice(2)) : value

function toTemplate(value, field) {
  if (typeof value !== 'string') throw new Error(`${field} must be a string`)
  if (value.startsWith('!')) throw new Error(`${field}: "!command" values are not supported`)
  return value.replace(ENV_REF, (_match, ref) => {
    if (!ENV_NAME.test(ref)) throw new Error(`${field}: unsupported reference "\${${ref}}"`)
    return `\${credential:${ref}}`
  })
}

function mapValues(object, field) {
  if (object === undefined) return {}
  if (typeof object !== 'object' || object === null || Array.isArray(object)) throw new Error(`${field} must be an object`)
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, toTemplate(value, `${field}.${key}`)]))
}

export function convertServer(name, raw) {
  if (!SERVER_NAME.test(name)) throw new Error('server name must match [A-Za-z0-9_-]{1,32}')
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('entry must be an object')
  if (raw.enabled === false) return undefined
  if (raw.oauth !== undefined) throw new Error('OAuth servers are not supported by the DSH MCP manager')
  const type = raw.type
  if (type !== undefined && !['stdio', 'http', 'streamable-http'].includes(type)) throw new Error(`unsupported type "${type}"`)

  const entry = {}
  if (typeof raw.timeout === 'number' && raw.timeout > 0) entry.toolCallTimeoutMs = Math.round(raw.timeout * 1000)
  if (raw.exposure === 'deferred' || raw.exposure === 'on-demand') entry.toolLoading = 'on-demand'
  else if (raw.exposure === 'eager' || raw.exposure === 'direct') entry.toolLoading = 'eager'

  if (raw.command !== undefined && type !== 'http' && type !== 'streamable-http') {
    if (typeof raw.command !== 'string' || !raw.command) throw new Error('command must be a non-empty string')
    if (raw.args !== undefined && !Array.isArray(raw.args)) throw new Error('args must be an array')
    return {
      ...entry,
      transport: 'stdio',
      command: toTemplate(expandHome(raw.command), 'command'),
      args: (raw.args ?? []).map((arg, index) => toTemplate(expandHome(String(arg)), `args[${index}]`)),
      env: mapValues(raw.env, 'env'),
      ...typeof raw.cwd === 'string' && raw.cwd ? { cwd: toTemplate(expandHome(raw.cwd), 'cwd') } : {},
    }
  }
  if (typeof raw.url === 'string' && raw.url && type !== 'stdio') {
    return {
      ...entry,
      transport: 'streamable-http',
      url: toTemplate(raw.url, 'url'),
      headers: mapValues(raw.headers, 'headers'),
    }
  }
  throw new Error('entry needs "command" (stdio) or "url" (streamable HTTP)')
}

const serverNames = value => new Set((Array.isArray(value) ? value : [])
  .filter(item => typeof item === 'string')
  .map(item => item.trim())
  .filter(Boolean))

export function convertConfig(document, options = {}) {
  if (document === null || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('mcp.json must contain a configuration object')
  }
  const servers = document.mcpServers
  if (servers === undefined) return { entries: new Map(), skipped: [] }
  if (typeof servers !== 'object' || servers === null || Array.isArray(servers)) throw new Error('"mcpServers" must be an object')
  const disabled = serverNames(options.disabledServers)
  const eager = serverNames(options.eagerServers)
  const entries = new Map()
  const skipped = []
  const seen = new Set()
  for (const [name, raw] of Object.entries(servers)) {
    if (disabled.has(name)) continue
    let entry
    try {
      entry = convertServer(name, raw)
    } catch (error) {
      skipped.push({ name, reason: error.message })
      continue
    }
    if (!entry) continue
    const key = name.replaceAll('-', '_')
    if (seen.has(key)) {
      skipped.push({ name, reason: 'duplicates another server name after "-"/"_" normalization' })
      continue
    }
    seen.add(key)
    if (eager.has(name)) entry.toolLoading = 'eager'
    entries.set(name, entry)
  }
  return { entries, skipped }
}
