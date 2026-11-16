/**
 * dsh-paseo-hub — Host half.
 *
 * Connects this DSH Host to Paseo Hub as a daemon. Sign-in (CLI device login
 * or an organization API key) issues a one-time enrollment token; enrollment
 * stores a per-relationship secret in DSH credentials and the relationship in
 * the `paseo_hub` storage domain. While enrolled, the plugin keeps the daemon
 * WebSocket open with backoff and answers Hub through `HubBridge`.
 *
 * Per Hub session, Agent setup mounts Hub's MCP server on that Agent's scope,
 * `tools/pre-execute` allows exactly the Hub tools Hub preapproved, and bash
 * commands receive the run's Hub environment (for example a short-lived
 * GH_TOKEN). Nothing reaches other sessions.
 */
import { hostname } from 'node:os'
import { randomBytes, randomUUID } from 'node:crypto'
import { Schema } from './runtime.js'
import {
  HubHttpError,
  enrollDaemon,
  issueEnrollmentToken,
  normalizeHubOrigin,
  openDaemonSocket,
  pollDeviceLogin,
  revokeDaemon,
  startDeviceLogin,
} from './hub.js'
import { HUB_SERVER, HubBridge } from './bridge.js'
import { resolveModes } from './catalog.js'

export const name = 'paseo-hub'
export const inject = ['sessionController', 'agents', 'storageDomain', 'credentials', 'webServer', 'connection', 'tools', 'workspaceController', 'workspaceRegistry']

export const STATE_PATH = '/paseo-hub/state'
export const OP_PATH = '/paseo-hub/op'
const MAX_BODY_BYTES = 16 * 1024
const RUNS_KEPT = 300
const PERMISSIONS = ['hub.execute']
const RECONNECT_MIN_MS = 1_000
const RECONNECT_MAX_MS = 60_000
const CREDENTIAL_SCOPE = 'paseo-hub'
const CREDENTIAL_ID = 'daemon'

export const Config = Schema.object({
  modes: Schema.dict(Schema.string()).default({})
    .description('Hub mode -> DSH permission preset. Empty offers every configured preset under its own name.'),
  defaultMode: Schema.string().default('')
    .description('Mode for a Hub agent that names none; empty uses the permission presets default.'),
  agentPreset: Schema.string().default('')
    .description('Agent preset for Hub sessions; empty uses the deployment default.'),
  listWorkspaces: Schema.boolean().default(true)
    .description('Add each Hub run directory to the sidebar workspace list, so its sessions are visible.'),
})

// ---- persistence ----

const validator = parse => ({
  parse,
  safeParse(value) {
    try { return { success: true, data: parse(value) } } catch (error) { return { success: false, error } }
  },
})
const str = (value, label) => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label}: expected a non-empty string`)
  return value
}
const relationshipSchema = validator(value => {
  if (value === null) return null
  for (const key of ['daemonId', 'idempotencyKey', 'hubOrigin', 'webSocketUrl', 'createdAt']) str(value?.[key], key)
  if (!Array.isArray(value.permissions)) throw new Error('permissions: expected an array')
  return value
})
const runSchema = validator(value => {
  for (const key of ['key', 'sessionId', 'cwd', 'createdAt']) str(value?.[key], key)
  return value
})
export const DOMAIN_SPEC = {
  name: 'paseo_hub',
  version: 1,
  layout: 'per-record',
  global: { schema: relationshipSchema, initial: null },
  tables: { runs: { valueSchema: runSchema } },
}

/** Hub runs keyed by Hub's idempotency key, with a session index. */
class RunStore {
  constructor(domain) {
    this.domain = domain
    this.table = domain.table('runs')
    this.index = new Map()
    for (const [, run] of this.table.entries()) this.index.set(run.sessionId, run)
  }

  byKey(key) { return this.table.get(key) }
  bySession(sessionId) { return this.index.get(sessionId) }
  sessions() { return [...this.index.keys()] }
  list() { return [...this.index.values()].toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)) }

  async put(run) {
    await this.table.put(run.key, run)
    this.index.set(run.sessionId, run)
    if (this.table.size > RUNS_KEPT) {
      const stale = this.list().slice(RUNS_KEPT).filter(old => old.archivedAt !== null)
      for (const old of stale) this.index.delete(old.sessionId)
      await this.table.deleteMany(stale.map(old => old.key))
    }
  }

  async remove(key) {
    const run = this.table.get(key)
    if (run !== undefined) this.index.delete(run.sessionId)
    await this.table.delete(key)
  }
}

// ---- connection lifecycle ----

/**
 * One relationship: `not_connected` -> `signing_in` -> `connecting` <->
 * `connected` / `reconnecting`; `revoked` when Hub refuses the credential.
 */
class Connector {
  constructor(ctx, config, domain, store) {
    this.ctx = ctx
    this.config = config
    this.domain = domain
    this.store = store
    this.state = 'not_connected'
    this.lastError = null
    this.connectedAt = null
    this.login = null
    this.loginAbort = null
    this.socket = null
    this.bridge = null
    this.retryTimer = null
    this.retryDelay = RECONNECT_MIN_MS
    this.generation = 0
    this.stopped = false
  }

  log(level, msg) { this.ctx.logger?.[level]?.(`paseo-hub: ${msg}`) }
  get relationship() { return this.domain.global.get() }
  credentialKey() { return `${CREDENTIAL_SCOPE}/${CREDENTIAL_ID}` }

  async secret() {
    const record = await this.ctx.credentials.readRecord(this.credentialKey())
    return record?.kind === 'grant' && typeof record.payload?.secret === 'string' ? record.payload.secret : undefined
  }

  async start() {
    if (this.relationship === null) return
    this.connect()
  }

  stop() {
    this.stopped = true
    this.generation += 1
    clearTimeout(this.retryTimer)
    this.loginAbort?.abort()
    this.socket?.close()
    this.bridge?.close()
    this.socket = null
    this.bridge = null
  }

  snapshot() {
    const rel = this.relationship
    return {
      state: this.state,
      hubOrigin: rel?.hubOrigin ?? null,
      daemonId: rel?.daemonId ?? null,
      slug: rel?.slug ?? null,
      permissions: rel?.permissions ?? [],
      enrolledAt: rel?.createdAt ?? null,
      connectedAt: this.connectedAt,
      lastError: this.lastError,
      login: this.login,
    }
  }

  // -- sign-in --

  async signIn({ origin: rawOrigin, apiKey }) {
    if (this.relationship !== null) throw new Error('This Host is already enrolled; disconnect first to switch Hubs')
    if (this.state === 'signing_in') throw new Error('A sign-in is already in progress')
    const origin = normalizeHubOrigin(rawOrigin)
    this.lastError = null
    if (typeof apiKey === 'string' && apiKey.trim()) {
      this.state = 'signing_in'
      this.login = { origin, method: 'api-key' }
      void this.finishEnrollment(origin, apiKey.trim())
      return
    }
    const started = await startDeviceLogin(origin)
    const abort = new AbortController()
    this.loginAbort = abort
    this.state = 'signing_in'
    this.login = {
      origin,
      method: 'browser',
      userCode: started.userCode,
      verificationUri: started.verificationUri,
      verificationUriComplete: started.verificationUriComplete,
      expiresAt: started.expiresAt,
    }
    void this.pollLogin(origin, started, abort.signal)
  }

  cancelSignIn() {
    if (this.state !== 'signing_in') return
    this.loginAbort?.abort()
    this.loginAbort = null
    this.login = null
    this.state = 'not_connected'
  }

  async pollLogin(origin, started, signal) {
    let interval = Math.max(1, started.interval ?? 5)
    const deadline = Date.parse(started.expiresAt)
    try {
      while (!signal.aborted) {
        await new Promise(resolve => { const t = setTimeout(resolve, interval * 1000); t.unref?.() })
        if (signal.aborted) return
        if (Date.now() > deadline) throw new Error('The sign-in request expired; start again')
        const poll = await pollDeviceLogin(origin, started.deviceCode)
        if (signal.aborted) return
        if (poll.status === 'pending') continue
        if (poll.status === 'slow_down') { interval = Math.max(interval + 5, poll.interval ?? interval); continue }
        if (poll.status === 'authorized') return await this.finishEnrollment(origin, poll.credential)
        if (poll.status === 'denied') throw new Error('The sign-in was denied in Hub')
        throw new Error(poll.status === 'expired' ? 'The sign-in request expired; start again' : `Sign-in ended: ${poll.status}`)
      }
    } catch (error) {
      if (signal.aborted) return
      this.failSignIn(error)
    }
  }

  failSignIn(error) {
    this.lastError = error?.message ?? String(error)
    this.log('warn', `sign-in failed: ${this.lastError}`)
    this.login = null
    this.loginAbort = null
    this.state = 'not_connected'
  }

  async finishEnrollment(origin, credential) {
    try {
      const token = await issueEnrollmentToken(origin, credential)
      const secret = randomBytes(32).toString('base64url')
      const daemonId = randomUUID()
      const idempotencyKey = randomUUID()
      // Store the secret before Hub knows its verifier, so a crash never leaves
      // an enrolled daemon whose credential this Host cannot present.
      await this.ctx.credentials.modifyRecord(this.credentialKey(), async () => ({ kind: 'grant', payload: { secret, daemonId } }))
      const enrollment = await enrollDaemon(origin, {
        token,
        daemonId,
        idempotencyKey,
        hostname: hostname().replace(/\.local$/u, ''),
        serverId: `dsh-${daemonId}`,
        daemonPublicKey: `dsh-${daemonId}`,
        secret,
        permissions: PERMISSIONS,
      })
      if (!PERMISSIONS.every(permission => enrollment.permissions?.includes(permission))) {
        await revokeDaemon(origin, enrollment.daemonId, secret).catch(() => {})
        throw new Error('Hub did not grant hub.execute; this Host cannot run Hub automations without it')
      }
      await this.domain.global.set({
        daemonId: enrollment.daemonId,
        idempotencyKey,
        hubOrigin: origin,
        slug: enrollment.slug ?? null,
        webSocketUrl: enrollment.webSocketUrl,
        permissions: enrollment.permissions,
        createdAt: new Date().toISOString(),
      })
      this.login = null
      this.loginAbort = null
      this.log('info', `enrolled with ${origin} as ${enrollment.slug ?? enrollment.daemonId}`)
      this.connect()
    } catch (error) {
      await this.ctx.credentials.deleteRecord(this.credentialKey()).catch(() => {})
      this.failSignIn(error)
    }
  }

  // -- socket --

  async connect() {
    if (this.stopped) return
    const rel = this.relationship
    const secret = rel === null ? undefined : await this.secret()
    if (rel === null) { this.state = 'not_connected'; return }
    if (secret === undefined) {
      this.state = 'revoked'
      this.lastError = 'The daemon credential is missing from DSH credentials; disconnect and sign in again'
      return
    }
    const generation = ++this.generation
    this.state = this.connectedAt === null && this.state !== 'reconnecting' ? 'connecting' : 'reconnecting'
    this.socket = openDaemonSocket({ webSocketUrl: rel.webSocketUrl, daemonId: rel.daemonId, secret }, {
      connected: socket => {
        if (generation !== this.generation) return socket.close()
        const bridge = new HubBridge(this.ctx, {
          send: frame => socket.send(JSON.stringify(frame)),
          store: this.store,
          config: this.config,
          permissions: rel.permissions,
          daemonId: rel.daemonId,
          log: (level, msg) => this.log(level, msg),
        })
        this.bridge = bridge
        socket.on('message', data => {
          let frame
          try { frame = JSON.parse(String(data)) } catch { return socket.close(4400, 'invalid frame') }
          void bridge.receive(frame)
        })
        this.state = 'connected'
        this.connectedAt = new Date().toISOString()
        this.lastError = null
        this.retryDelay = RECONNECT_MIN_MS
        this.log('info', `connected to ${rel.hubOrigin}`)
      },
      rejected: status => {
        if (generation !== this.generation) return
        this.dropBridge()
        this.state = 'revoked'
        this.lastError = `Hub refused this daemon's credential (HTTP ${status}); it was revoked in Hub. Disconnect and sign in again.`
        this.log('warn', this.lastError)
      },
      closed: (code, reason) => {
        if (generation !== this.generation) return
        this.dropBridge()
        if (code === 4403) {
          this.state = 'revoked'
          this.lastError = `Hub closed the connection: ${reason || 'revoked'}`
          return
        }
        this.scheduleReconnect(`closed (${code}${reason ? ` ${reason}` : ''})`)
      },
      failed: error => {
        if (generation !== this.generation) return
        this.dropBridge()
        this.scheduleReconnect(error?.message ?? String(error))
      },
    })
  }

  dropBridge() {
    this.bridge?.close()
    this.bridge = null
    this.socket = null
  }

  scheduleReconnect(reason) {
    if (this.stopped) return
    this.state = 'reconnecting'
    this.lastError = `Hub connection ${reason}; retrying in ${Math.round(this.retryDelay / 1000)}s`
    clearTimeout(this.retryTimer)
    this.retryTimer = setTimeout(() => { void this.connect() }, this.retryDelay)
    this.retryTimer.unref?.()
    this.retryDelay = Math.min(this.retryDelay * 2, RECONNECT_MAX_MS)
  }

  reconnectNow() {
    if (this.relationship === null) throw new Error('This Host is not enrolled')
    clearTimeout(this.retryTimer)
    this.generation += 1
    this.socket?.close()
    this.dropBridge()
    this.retryDelay = RECONNECT_MIN_MS
    void this.connect()
  }

  async disconnect() {
    const rel = this.relationship
    this.cancelSignIn()
    this.generation += 1
    clearTimeout(this.retryTimer)
    this.socket?.close()
    this.dropBridge()
    let warning = null
    if (rel !== null) {
      const secret = await this.secret()
      if (secret !== undefined) {
        try { await revokeDaemon(rel.hubOrigin, rel.daemonId, secret) } catch (error) {
          warning = `Removed locally, but Hub revocation failed: ${error?.message ?? error}. Revoke ${rel.slug ?? rel.daemonId} on Hub's Daemons page.`
        }
      }
    }
    await this.ctx.credentials.deleteRecord(this.credentialKey()).catch(() => {})
    await this.domain.global.set(null)
    this.state = 'not_connected'
    this.connectedAt = null
    this.lastError = warning
    return { warning }
  }
}

// ---- HTTP helpers ----

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
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

// ---- shell environment for Hub runs ----

/**
 * Merge a Hub run's env into bash requests of that run's Session. The shell
 * executor carries `request.env` after its credential scrub, and the managed
 * `dshEnv` snapshot still wins, so no Hub value can displace a DSH_* fact.
 * Returns a restore function.
 */
function installShellEnv(ctx, store) {
  const shell = ctx.get('shell')
  const target = shell?.[Symbol.for('cordis.original')] ?? shell
  if (!target || typeof target.resolve !== 'function') return () => {}
  const original = target.resolve
  const hadOwn = Object.hasOwn(target, 'resolve')
  const wrapped = function resolveWithHubEnv(request) {
    const sessionId = request?.dshEnv?.DSH_SESSION_ID
    const env = sessionId === undefined ? undefined : store.bySession(sessionId)?.env
    if (env === undefined || Object.keys(env).length === 0) return original.call(this, request)
    return original.call(this, { ...request, env: { ...env, ...request.env } })
  }
  target.resolve = wrapped
  return () => {
    if (target.resolve !== wrapped) return
    if (hadOwn) target.resolve = original
    else delete target.resolve
  }
}

// ---- plugin entry ----

export function apply(ctx, config) {
  let connector
  let store
  const fibers = new Map()
  const ready = ctx.storageDomain.open(DOMAIN_SPEC).then(async domain => {
    store = new RunStore(domain)
    connector = new Connector(ctx, config, domain, store)
    await connector.start()
    // Runs recorded before workspace listing existed are still invisible; list their directories once.
    if (config.listWorkspaces !== false) {
      const paths = new Set(store.list().filter(run => run.archivedAt === null).map(run => run.cwd))
      for (const path of paths) {
        await ctx.workspaceController.create({ path })
          .catch(error => ctx.logger?.warn?.(`paseo-hub: could not add ${path} to the workspace list: ${error?.message ?? error}`))
      }
    }
    return domain
  })
  ready.catch(error => ctx.logger?.error?.(`paseo-hub: storage unavailable: ${error?.message ?? error}`))
  ctx.effect(() => () => {
    connector?.stop()
    for (const fiber of fibers.values()) void Promise.resolve(fiber.dispose?.()).catch(() => {})
    fibers.clear()
    void ready.then(domain => domain.close()).catch(() => {})
  }, 'paseo-hub: connector')

  // Mount Hub's MCP server on a Hub session's own Agent scope, for fresh and resumed Agents.
  ctx.on('agent/created', async ({ agent }) => {
    await ready.catch(() => {})
    const run = store?.bySession(agent.id)
    if (run?.hub == null) return
    try {
      const fiber = await mountHubMcp(agent, run)
      fibers.set(agent, fiber)
      agent.ctx.effect(() => () => { fibers.delete(agent) }, 'paseo-hub: hub mcp owner')
    } catch (error) {
      ctx.logger?.warn?.(`paseo-hub: Hub tools unavailable for ${agent.id}: ${error?.message ?? error}`)
    }
  })

  ctx.on('agent/status', ({ agent }) => {
    if (store?.bySession(agent.id) !== undefined) connector?.bridge?.onStatus(agent.id)
  })

  ctx.on('session/event', (session, event) => {
    const sessionId = session?.header?.id
    if (sessionId === undefined || store?.bySession(sessionId) === undefined) return
    connector?.bridge?.onSessionEvent(sessionId, event)
  })

  // Hub preapproves its own tools because nobody is at the keyboard for them.
  // Allow exactly those names, in exactly those sessions; everything else keeps DSH policy.
  ctx.on('tools/pre-execute', async (exec, next) => {
    const run = exec.agent === undefined ? undefined : store?.bySession(exec.agent.id)
    if (run !== undefined && run.preapproved?.some(tool => exec.name === `mcp__${HUB_SERVER}__${tool}`)) return { kind: 'allow' }
    return next()
  }, { prepend: true })

  ctx.effect(() => {
    let restore = () => {}
    void ready.then(() => { restore = installShellEnv(ctx, store) }).catch(() => {})
    return () => restore()
  }, 'paseo-hub: shell env')

  const owner = (req, res) => {
    const admission = ctx.connection.admit(req)
    if ('rejection' in admission) { res.statusCode = admission.rejection; res.end(); return false }
    if (admission.peer.principal.kind !== 'owner') { res.statusCode = 403; res.end(); return false }
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res) => {
      if (!owner(req, res)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' })
      try {
        await ready
        const presets = ctx.get('permissionPresets')
        const modes = resolveModes(config, presets?.catalog?.())
        sendJson(res, 200, {
          ...connector.snapshot(),
          modes: modes.entries.map(entry => ({ id: entry.id, preset: entry.preset, label: entry.option?.name ?? entry.id })),
          defaultModeId: modes.defaultModeId,
          presetsAvailable: presets !== undefined,
          runs: store.list().slice(0, 20).map(run => ({
            sessionId: run.sessionId,
            title: run.title,
            cwd: run.cwd,
            model: run.model,
            modeId: run.modeId,
            createdAt: run.createdAt,
            archivedAt: run.archivedAt,
            running: ctx.agents.get(run.sessionId)?.status === 'running',
          })),
        })
      } catch (error) {
        sendJson(res, 503, { message: `Paseo Hub storage is unavailable: ${error?.message ?? error}` })
      }
    },
  }), `paseo-hub: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: OP_PATH,
    handler: async (req, res) => {
      if (!owner(req, res)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: 'Request body is too large' })
      let op
      try { op = JSON.parse(raw) } catch { return sendJson(res, 400, { message: 'Invalid JSON' }) }
      try {
        await ready
        switch (op?.action) {
          case 'sign-in': await connector.signIn({ origin: op.origin, apiKey: op.apiKey }); return sendJson(res, 200, connector.snapshot())
          case 'cancel-sign-in': connector.cancelSignIn(); return sendJson(res, 200, connector.snapshot())
          case 'reconnect': connector.reconnectNow(); return sendJson(res, 200, connector.snapshot())
          case 'disconnect': {
            const { warning } = await connector.disconnect()
            return sendJson(res, 200, { ...connector.snapshot(), warning })
          }
          default: return sendJson(res, 400, { message: `Unknown action: ${op?.action}` })
        }
      } catch (error) {
        sendJson(res, error instanceof HubHttpError || error instanceof Error ? 400 : 500, { message: error?.message ?? String(error) })
      }
    },
  }), `paseo-hub: POST ${OP_PATH}`)
}

async function mountHubMcp(agent, run) {
  const { McpClient } = await import('./runtime.js')
  // DSH names these tools mcp__hub__<tool>, the exact name Hub watches for.
  return agent.ctx.plugin(McpClient, McpClient.Config({
    transport: 'streamable-http',
    serverName: HUB_SERVER,
    url: run.hub.url,
    headers: run.hub.headers,
    failOnStartupError: false,
  }))
}
