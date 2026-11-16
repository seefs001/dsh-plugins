/**
 * Hub HTTP and WebSocket transport. This is the subset of the Paseo daemon's
 * relationship protocol that Hub serves: CLI device login, one-time daemon
 * enrollment, the authenticated daemon WebSocket, and revocation.
 */
import { createHash } from 'node:crypto'
import { WebSocket } from './runtime.js'

const REQUEST_TIMEOUT_MS = 15_000
const PING_INTERVAL_MS = 10_000
const PONG_TIMEOUT_MS = 45_000

export class HubHttpError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HubHttpError'
    this.status = status
  }
}

/** Canonical `https://host[:port]` origin, rejecting paths, credentials, and non-HTTP schemes. */
export function normalizeHubOrigin(value) {
  let url
  try { url = new URL(String(value ?? '').trim()) } catch { throw new Error('Enter a Hub address such as https://hub.example.com') }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('The Hub address must start with https:// or http://')
  if (url.username || url.password) throw new Error('The Hub address cannot include credentials')
  if (url.search || url.hash) throw new Error('The Hub address cannot include a query or fragment')
  if (url.pathname !== '/' && url.pathname !== '') throw new Error('Use the Hub origin without a path')
  return url.origin
}

export const credentialVerifier = secret => createHash('sha256').update(secret).digest('base64url')

async function request(origin, path, { method = 'POST', bearer, body, signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  timer.unref?.()
  const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal
  let response
  try {
    response = await fetch(`${origin}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        ...bearer ? { authorization: `Bearer ${bearer}` } : {},
        ...body === undefined ? {} : { 'content-type': 'application/json' },
      },
      ...body === undefined ? {} : { body: JSON.stringify(body) },
      signal: combined,
    })
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`Hub did not answer ${path} in time`, { cause: error })
    throw new Error(`Hub is unreachable: ${error?.cause?.code ?? error?.message ?? error}`, { cause: error })
  } finally {
    clearTimeout(timer)
  }
  let payload = null
  const text = await response.text()
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = null }
  }
  return { status: response.status, ok: response.ok, payload }
}

/** Start the CLI device login: the user approves `verificationUriComplete` in a browser. */
export async function startDeviceLogin(origin) {
  const { status, payload } = await request(origin, '/api/v1/cli-authorizations', { body: {} })
  if (status === 429) throw new HubHttpError('Hub is rate limiting sign-ins; try again in a few seconds', status)
  if (status === 404) throw new HubHttpError('This address does not serve Paseo Hub (no CLI sign-in endpoint)', status)
  if (status !== 201 || typeof payload?.deviceCode !== 'string') throw new HubHttpError(`Hub sign-in could not start (HTTP ${status})`, status)
  return payload
}

/** One poll: `pending`, `slow_down`, `authorized` (with credential), `denied`, `expired`, or `disclosed`. */
export async function pollDeviceLogin(origin, deviceCode) {
  const { status, payload } = await request(origin, '/api/v1/cli-authorizations/poll', { body: { deviceCode } })
  if (status !== 200 || typeof payload?.status !== 'string') {
    if (status === 429) return { status: 'slow_down', interval: 10 }
    throw new HubHttpError(`Hub sign-in polling failed (HTTP ${status})`, status)
  }
  return payload
}

/** Exchange an organization credential for a short-lived, single-use enrollment token. */
export async function issueEnrollmentToken(origin, credential) {
  const { status, payload } = await request(origin, '/api/v1/daemons/enrollment-tokens', { bearer: credential })
  if (status === 401) throw new HubHttpError('Hub rejected the sign-in credential; sign in again', status)
  if (status === 403) throw new HubHttpError('Your Hub role cannot enroll daemons; ask an organization owner or admin', status)
  if (status !== 201 || typeof payload?.token !== 'string') throw new HubHttpError(`Hub could not issue an enrollment token (HTTP ${status})`, status)
  return payload.token
}

/** Enroll this Host; returns `{ daemonId, slug, permissions, webSocketUrl }`. Idempotent per daemonId. */
export async function enrollDaemon(origin, input) {
  const { status, payload } = await request(origin, '/api/daemons/enroll', {
    bearer: input.token,
    body: {
      daemonId: input.daemonId,
      idempotencyKey: input.idempotencyKey,
      ...input.hostname ? { hostname: input.hostname } : {},
      serverId: input.serverId,
      daemonPublicKey: input.daemonPublicKey,
      credentialVerifier: credentialVerifier(input.secret),
      permissions: input.permissions,
    },
  })
  if (status === 401 || status === 403) throw new HubHttpError('Hub refused the enrollment token; sign in again', status)
  if (status === 409) throw new HubHttpError(`Another daemon in this organization already uses the name "${payload?.slug ?? input.hostname}"; rename or revoke it in Hub, then sign in again`, status)
  if (status !== 200 || typeof payload?.webSocketUrl !== 'string') throw new HubHttpError(`Hub enrollment failed (HTTP ${status})`, status)
  const socket = new URL(payload.webSocketUrl)
  const hub = new URL(origin)
  if (socket.host !== hub.host || socket.protocol !== (hub.protocol === 'https:' ? 'wss:' : 'ws:')) {
    throw new Error('Hub returned a WebSocket address on another origin; refusing it')
  }
  return payload
}

/** Revoke this daemon on Hub. 401/403/404 mean it is already gone. */
export async function revokeDaemon(origin, daemonId, secret) {
  const { status } = await request(origin, `/api/daemons/${encodeURIComponent(daemonId)}`, { method: 'DELETE', bearer: secret })
  if (status >= 400 && ![401, 403, 404].includes(status)) throw new HubHttpError(`Hub revocation failed (HTTP ${status})`, status)
}

/**
 * Open the daemon socket. Calls exactly one of `rejected(status)` (credential
 * refused: the relationship is over), `closed(code, reason)`, or `failed(error)`
 * after `connected(socket)`, or instead of it.
 */
export function openDaemonSocket({ webSocketUrl, daemonId, secret }, events) {
  const socket = new WebSocket(webSocketUrl, {
    handshakeTimeout: REQUEST_TIMEOUT_MS,
    headers: {
      authorization: `Bearer ${secret}`,
      'x-paseo-daemon-id': daemonId,
      'x-paseo-session-protocol': '1',
    },
  })
  let settled = false
  let heartbeat
  let lastPong = 0
  const stop = () => { clearInterval(heartbeat); heartbeat = undefined }
  const settle = (fn) => {
    if (settled) return
    settled = true
    stop()
    fn()
  }
  socket.on('pong', () => { lastPong = Date.now() })
  socket.once('open', () => {
    lastPong = Date.now()
    heartbeat = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) return
      if (Date.now() - lastPong >= PONG_TIMEOUT_MS) {
        socket.terminate()
        settle(() => events.failed(new Error('Hub WebSocket heartbeat timed out')))
        return
      }
      socket.ping()
    }, PING_INTERVAL_MS)
    heartbeat.unref?.()
    events.connected(socket)
  })
  socket.once('unexpected-response', (_req, res) => {
    const status = res.statusCode
    res.destroy()
    socket.terminate()
    settle(() => (status === 401 || status === 403 ? events.rejected(status) : events.closed(1006, `HTTP ${status}`)))
  })
  socket.once('close', (code, reason) => settle(() => events.closed(code, reason?.toString?.() ?? '')))
  socket.once('error', error => {
    socket.terminate()
    settle(() => events.failed(error))
  })
  return { close: () => { settled = true; stop(); socket.close() } }
}
