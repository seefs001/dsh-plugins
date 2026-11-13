import { homedir } from 'node:os'
import { join } from 'node:path'

const SERVER_NAME = /^[A-Za-z0-9_-]{1,32}$/
const ENV_REF = /\$\{([^}]*)\}/g
const ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/

const expandHome = value => value.startsWith('~/') ? join(homedir(), value.slice(2)) : value

// Pi reads `${VAR}` from its environment. DSH resolves `${credential:VAR}` from
// stored credentials, then the launch environment, so secrets stay out of config.
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

/**
 * Convert one Pi `mcpServers` entry to a dsh-mcp-manager registration.
 * @returns `undefined` for a disabled entry; throws for an entry DSH cannot run.
 */
export function convertServer(name, raw) {
  if (!SERVER_NAME.test(name)) throw new Error('server name must match [A-Za-z0-9_-]{1,32}')
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('entry must be an object')
  if (raw.enabled === false) return undefined
  if (raw.oauth !== undefined) throw new Error('OAuth servers are not supported by the DSH MCP manager')
  const type = raw.type
  if (type !== undefined && !['stdio', 'http', 'streamable-http'].includes(type)) throw new Error(`unsupported type "${type}"`)

  const entry = {}
  if (typeof raw.timeout === 'number' && raw.timeout > 0) entry.toolCallTimeoutMs = Math.round(raw.timeout * 1000)

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

/**
 * Convert a parsed Pi `mcp.json` document.
 * @returns registrations by server name and per-server skip reasons.
 */
export function convertConfig(document) {
  const servers = document?.mcpServers
  if (servers === undefined) return { entries: new Map(), skipped: [] }
  if (typeof servers !== 'object' || servers === null || Array.isArray(servers)) throw new Error('"mcpServers" must be an object')
  const entries = new Map()
  const skipped = []
  // Pi treats names that differ only in "-" and "_" as one server; keep the first.
  const seen = new Set()
  for (const [name, raw] of Object.entries(servers)) {
    const key = name.replaceAll('-', '_')
    if (seen.has(key)) {
      skipped.push({ name, reason: 'duplicates another server name after "-"/"_" normalization' })
      continue
    }
    seen.add(key)
    try {
      const entry = convertServer(name, raw)
      if (entry) entries.set(name, entry)
    } catch (error) {
      skipped.push({ name, reason: error.message })
    }
  }
  return { entries, skipped }
}
