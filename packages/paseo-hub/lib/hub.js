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
  try {
    const response = await fetch(`${origin}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        ...bearer ? { authorization: `Bearer ${bearer}` } : {},
        ...body === undefined ? {} : { 'content-type': 'application/json' },
      },
      ...body === undefined ? {} : { body: JSON.stringify(body) },
      signal: combined,
    })
    const text = await response.text()
    let payload = null
    if (text) { try { payload = JSON.parse(text) } catch {} }
    return { status: response.status, ok: response.ok, payload }
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`Hub did not answer ${path} in time`, { cause: error })
    throw new Error(`Hub is unreachable: ${error?.cause?.code ?? error?.message ?? error}`, { cause: error })
  } finally {
    clearTimeout(timer)
  }
}

export async function startDeviceLogin(origin, signal) {
  const { status, payload } = await request(origin, '/api/v1/cli-authorizations', { body: {}, signal })
  if (status === 429) throw new HubHttpError('Hub is rate limiting sign-ins; try again in a few seconds', status)
  if (status === 404) throw new HubHttpError('This address does not serve Paseo Hub (no CLI sign-in endpoint)', status)
  if (status !== 201 || typeof payload?.deviceCode !== 'string') throw new HubHttpError(`Hub sign-in could not start (HTTP ${status})`, status)
  const link = new URL(payload.verificationUriComplete)
  if (!['https:', 'http:'].includes(link.protocol) || link.username || link.password || typeof payload.userCode !== 'string' || !Number.isFinite(Date.parse(payload.expiresAt))) throw new Error('Hub returned an invalid device sign-in response')
  return payload
}

export async function pollDeviceLogin(origin, deviceCode, signal) {
  const { status, payload } = await request(origin, '/api/v1/cli-authorizations/poll', { body: { deviceCode }, signal })
  if (status !== 200 || typeof payload?.status !== 'string') {
    if (status === 429) return { status: 'slow_down', interval: 10 }
    throw new HubHttpError(`Hub sign-in polling failed (HTTP ${status})`, status)
  }
  return payload
}

export async function issueEnrollmentToken(origin, credential) {
  const { status, payload } = await request(origin, '/api/v1/daemons/enrollment-tokens', { bearer: credential })
  if (status === 401) throw new HubHttpError('Hub rejected the sign-in credential; sign in again', status)
  if (status === 403) throw new HubHttpError('Your Hub role cannot enroll daemons; ask an organization owner or admin', status)
  if (status !== 201 || typeof payload?.token !== 'string') throw new HubHttpError(`Hub could not issue an enrollment token (HTTP ${status})`, status)
  return payload.token
}

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

export async function revokeDaemon(origin, daemonId, secret) {
  const { status } = await request(origin, `/api/daemons/${encodeURIComponent(daemonId)}`, { method: 'DELETE', bearer: secret })
  if (status >= 400 && ![401, 403, 404].includes(status)) throw new HubHttpError(`Hub revocation failed (HTTP ${status})`, status)
}

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
