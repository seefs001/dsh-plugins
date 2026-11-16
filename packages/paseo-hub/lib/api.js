/** Organization API operations shared by the page and agent tools. */
import { normalizeHubOrigin } from './hub.js'

const CREDENTIAL_KEY = 'paseo-hub/api'
const WRITE_ACTIONS = new Set(['install-trigger', 'install-configuration', 'dispatch'])
export const API_ACTIONS = ['status', 'check', 'projects', 'triggers', 'get-trigger', 'resources', 'setup-resources', 'validate-trigger', 'install-trigger', 'validate-configuration', 'install-configuration', 'dispatch']
const ENDPOINTS = {
  projects: ['GET', '/api/v1/projects', 'projects:read'],
  triggers: ['GET', '/api/v1/triggers', 'configuration:validate'],
  resources: ['GET', '/api/v1/configuration-resources', 'configuration:validate'],
  'setup-resources': ['GET', '/api/v1/setup-resources', 'configuration:validate'],
  'validate-trigger': ['POST', '/api/v1/triggers/validate', 'configuration:validate'],
  'install-trigger': ['POST', '/api/v1/triggers/install', 'configuration:install'],
  'validate-configuration': ['POST', '/api/v1/configurations/validate', 'configuration:validate'],
  'install-configuration': ['POST', '/api/v1/configurations/install', 'configuration:install'],
  dispatch: ['POST', '/api/v1/manual-runs', 'runs:dispatch'],
}
const text = (value, field, max = 200) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${field}: expected a non-empty string (max ${max} characters)`)
  return value.trim()
}
const redact = (value, secret) => {
  if (typeof value === 'string') return value.replaceAll(secret, '[credential removed]')
  if (Array.isArray(value)) return value.map(item => redact(item, secret))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k.replaceAll(secret, '[credential removed]'), redact(v, secret)]))
  return value
}
const pageOf = (items, args) => {
  const pageSize = Math.max(1, Math.min(100, Number.parseInt(args.pageSize, 10) || 20))
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.max(1, Math.min(pages, Number.parseInt(args.page, 10) || 1))
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize, pages }
}

export class ApiError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message)
    this.status = status
    this.extra = extra
  }
}
export const apiFailure = error => ({ message: error?.message ?? String(error), ...(error instanceof ApiError ? error.extra : {}) })

export class HubApi {
  constructor(credentials, journal) {
    this.credentials = credentials
    this.journal = journal
  }

  async credential() {
    const record = await this.credentials.readRecord(CREDENTIAL_KEY)
    return record?.kind === 'grant' && typeof record.payload?.apiKey === 'string' ? record.payload : null
  }

  async status() {
    const saved = await this.credential()
    return { configured: saved !== null, origin: saved?.origin ?? null, toolWrites: saved?.toolWrites === true }
  }

  // Authority-granting operations stay user-only: no tool can set a key, change
  // its origin, or enable its own write access. Enrollment uses a different key.
  async configure(args) {
    const origin = normalizeHubOrigin(args.origin)
    const previous = await this.credential()
    const apiKey = args.apiKey?.trim() || (previous?.origin === origin ? previous.apiKey : '')
    text(apiKey, 'API key', 8192)
    if (/\s/u.test(apiKey)) throw new Error('API key must not contain whitespace')
    await this.credentials.modifyRecord(CREDENTIAL_KEY, async () => ({
      kind: 'grant', payload: { origin, apiKey, toolWrites: args.toolWrites === true },
    }))
    this.journal.add({ kind: 'api.credential', message: `Organization API credential saved for ${origin}` })
    return this.status()
  }

  async forget() {
    await this.credentials.deleteRecord(CREDENTIAL_KEY)
    this.journal.add({ kind: 'api.credential', message: 'Organization API credential removed locally (not revoked in Hub)' })
    return this.status()
  }

  async request(saved, action, body, signal) {
    const [method, path, scope] = ENDPOINTS[action]
    let response
    let payload
    try {
      response = await fetch(`${saved.origin}${path}`, {
        method, redirect: 'error',
        headers: { accept: 'application/json', authorization: `Bearer ${saved.apiKey}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30_000)]) : AbortSignal.timeout(30_000),
      })
      payload = await response.json()
    } catch (error) {
      if (signal?.aborted) throw new Error('Hub API request canceled; a submitted write may still have taken effect. Check Hub before retrying.', { cause: error })
      throw new ApiError(`Hub API did not return JSON (${action}); check connectivity and Hub before retrying a write. ${String(error?.message ?? error).replaceAll(saved.apiKey, '[credential removed]')}`, 502)
    }
    // Never reflect the saved bearer, even if an upstream error echoes it.
    payload = redact(payload, saved.apiKey)
    if (!response.ok) throw new ApiError(payload?.detail ?? payload?.title ?? `Hub HTTP ${response.status}`, response.status, {
      code: payload?.code, requestId: payload?.requestId, issues: payload?.issues, requiredScope: scope,
    })
    return payload
  }

  async run(args, { source = 'page', signal } = {}) {
    if (!API_ACTIONS.includes(args?.action)) throw new Error('Unknown Hub API action')
    const { action } = args
    if (action === 'status') return this.status()
    const saved = await this.credential()
    if (!saved) throw new Error('Configure an organization API key in Paseo Hub → Hub API first')
    if (source === 'agent' && WRITE_ACTIONS.has(action) && !saved.toolWrites) throw new ApiError('Agent writes are disabled. Enable them yourself in Paseo Hub → Hub API; the tool cannot grant itself access.', 403)
    if (action === 'check') {
      const results = await Promise.all(['projects', 'triggers', 'resources'].map(async op => {
        try {
          const result = await this.request(saved, op, undefined, signal)
          return { action: op, ok: true, counts: Object.fromEntries(Object.entries(result).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length])) }
        } catch (error) { return { action: op, ok: false, ...apiFailure(error) } }
      }))
      return { origin: saved.origin, results, note: 'Read checks only. Install and dispatch scopes are checked by Hub when you use them.' }
    }
    let body
    if (action.endsWith('-trigger') && action !== 'get-trigger') {
      text(args.yaml, 'yaml', 1_000_000)
      body = { yaml: args.yaml }
    } else if (action.endsWith('-configuration')) {
      const projectSlug = text(args.projectSlug, 'projectSlug', 100)
      if (!Array.isArray(args.files) || args.files.length < 1 || args.files.length > 100) throw new Error('files: expected 1–100 configuration files')
      body = { projectSlug, files: args.files.map(file => {
        text(file.path, 'file.path', 512)
        if (typeof file.content !== 'string' || file.content.length > 1_000_000) throw new Error('file.content: expected a string up to 1,000,000 characters')
        return { path: file.path, content: file.content }
      }) }
    } else if (action === 'dispatch') {
      body = {
        projectSlug: text(args.projectSlug, 'projectSlug', 100), trigger: text(args.trigger, 'trigger'),
        actor: text(args.actor, 'actor'), deliveryKey: text(args.deliveryKey, 'deliveryKey'),
        ...(args.expectedVersionId ? { expectedVersionId: text(args.expectedVersionId, 'expectedVersionId') } : {}),
        input: args.input ?? '',
      }
    }
    try {
      const result = await this.request(saved, action === 'get-trigger' ? 'triggers' : action, body, signal)
      if (action === 'triggers' || action === 'projects') {
        const q = String(args.query ?? '').toLowerCase()
        const list = result[action]
        if (!Array.isArray(list)) throw new ApiError(`Invalid Hub response: missing ${action}`, 502)
        const filtered = list.filter(item => !q || [item.name, item.slug, item.id].some(v => v?.toLowerCase().includes(q)))
          .map(item => action === 'triggers' ? { id: item.id, name: item.name, enabled: item.enabled, format: item.format } : item)
        return { origin: saved.origin, ...pageOf(filtered, args) }
      }
      if (action === 'get-trigger') {
        const name = text(args.name, 'name')
        const trigger = result.triggers?.find(item => item.name === name || item.id === name)
        if (!trigger) throw new ApiError(`Trigger not found: ${name}`, 404)
        return { origin: saved.origin, trigger }
      }
      if (WRITE_ACTIONS.has(action) || action.startsWith('validate-')) {
        // No YAML, input, key, or provider payload in the local activity log.
        this.journal.add({ kind: `api.${action}`, message: `${source}: ${action} ${result.name ?? result.configuredTriggerName ?? result.projectSlug ?? ''}`, detail: action === 'dispatch' ? { triggerRunId: result.triggerRunId, deliveryKey: body.deliveryKey } : null })
      }
      return { origin: saved.origin, ...result }
    } catch (error) {
      this.journal.add({ kind: `api.${action}`, level: 'error', message: `${source}: ${action} failed (HTTP ${error.status ?? 'unknown'})` })
      throw error
    }
  }
}

/** Tool definitions deliberately cannot configure credentials or loosen policy. */
export function registerApiTools(ctx, api, ready) {
  const properties = {
    action: { type: 'string' },
    query: { type: 'string', description: 'List search, case insensitive.' },
    page: { type: 'integer', minimum: 1 }, pageSize: { type: 'integer', minimum: 1, maximum: 100 },
    name: { type: 'string', description: 'get-trigger: trigger name or ID from triggers.' },
    yaml: { type: 'string', description: 'Complete self-contained trigger YAML to validate or install.' },
    projectSlug: { type: 'string', description: 'Project slug, required for legacy configurations and manual dispatch.' },
    files: { type: 'array', description: 'Legacy configuration bundle: .paseo/hub.yml, workflows and referenced partials.', items: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'], additionalProperties: false } },
    trigger: { type: 'string', description: 'Configured manual.run trigger name.' },
    actor: { type: 'string', description: 'Must be allowed by the trigger from_users filter.' },
    deliveryKey: { type: 'string', description: 'Unique stable ID per intended dispatch. Reuse on an intentional retry; do not retry ambiguous writes blindly.' },
    expectedVersionId: { type: 'string', description: 'Optional active configuration revision guard for dispatch.' },
    input: { description: 'Dispatch input. Prefer textual key=value headers plus the prompt; legacy triggers may accept a JSON object.' },
  }
  for (const write of [false, true]) {
    const actions = API_ACTIONS.filter(a => WRITE_ACTIONS.has(a) === write)
    const keys = write ? ['action', 'yaml', 'projectSlug', 'files', 'trigger', 'actor', 'deliveryKey', 'expectedVersionId', 'input'] : ['action', 'query', 'page', 'pageSize', 'name', 'yaml', 'projectSlug', 'files']
    ctx.effect(() => ctx.tools.register({
      name: write ? 'paseo_hub_write' : 'paseo_hub',
      description: write
        ? 'Install/update an organization trigger or legacy configuration, or dispatch a manual run in Paseo Hub. Uses the saved organization key; requires user-enabled agent writes and Hub scopes. Installation activates the revision. Dispatch starts real work. Validate authored configuration before installing. Check Hub before retrying uncertain writes.'
        : 'Query Paseo Hub using the saved organization API key: credential status, read-access checks, paged projects/triggers, full trigger YAML, configuration/setup resources, or validation without installation. Lists omit YAML; get-trigger retrieves one document. No dashboard administration or credential access.',
      parameters: { type: 'object', properties: { ...Object.fromEntries(keys.map(k => [k, properties[k]])), action: { type: 'string', enum: actions } }, required: ['action'], additionalProperties: false },
      output: { schema: { type: 'object' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
      timeoutMs: 45_000,
      async execute(args, exec) {
        await ready
        if (!actions.includes(args?.action)) throw new Error('This action is not available through this tool')
        try { return await api.run(args, { source: 'agent', signal: exec?.signal }) } catch (error) { return { ok: false, ...apiFailure(error) } }
      },
    }), `paseo-hub: ${write ? 'write' : 'read'} API tool`)
  }
}
