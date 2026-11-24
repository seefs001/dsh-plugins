import { applyImport, buildExportBundle, inspectInventory, previewImport } from './bundle.js'
import { BackupError } from './crypto.js'

export const name = 'config-backup'
export const inject = ['configEditor', 'profileContext', 'webServer', 'connection']

const MAX_BODY_BYTES = 10 * 1024 * 1024

function sendJson(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value)
  res.end(JSON.stringify(body))
}

async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new BackupError('BODY_TOO_LARGE', `Request body exceeds ${MAX_BODY_BYTES} bytes`, 413)
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8').trim()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new BackupError('INVALID_JSON', 'Request body is not valid JSON', 400)
  }
}

function rejectIfNotOwner(res, peer) {
  if (peer?.principal?.kind === 'owner') return false
  res.statusCode = peer === undefined ? 401 : 403
  res.end()
  return true
}

function handleError(res, error) {
  if (error instanceof BackupError) {
    sendJson(res, error.status, { code: error.code, message: error.message })
    return
  }
  sendJson(res, 500, { code: 'INTERNAL_ERROR', message: error?.message ?? String(error) })
}

export function apply(ctx) {
  let applyTail = Promise.resolve()

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/config-backup/inventory',
    handler: async (req, res, peer) => {
      if (rejectIfNotOwner(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try {
        sendJson(res, 200, await inspectInventory(ctx))
      } catch (error) {
        handleError(res, error)
      }
    },
  }), 'config-backup: GET /config-backup/inventory')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/config-backup/export',
    handler: async (req, res, peer) => {
      if (rejectIfNotOwner(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      try {
        const body = await readJsonBody(req)
        sendJson(res, 200, await buildExportBundle(ctx, body))
      } catch (error) {
        handleError(res, error)
      }
    },
  }), 'config-backup: POST /config-backup/export')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/config-backup/preview',
    handler: async (req, res, peer) => {
      if (rejectIfNotOwner(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      try {
        const body = await readJsonBody(req)
        sendJson(res, 200, await previewImport(ctx, body))
      } catch (error) {
        handleError(res, error)
      }
    },
  }), 'config-backup: POST /config-backup/preview')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/config-backup/apply',
    handler: async (req, res, peer) => {
      if (rejectIfNotOwner(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      try {
        const body = await readJsonBody(req)
        const task = applyTail.then(() => applyImport(ctx, body))
        applyTail = task.catch(() => {})
        sendJson(res, 200, await task)
      } catch (error) {
        handleError(res, error)
      }
    },
  }), 'config-backup: POST /config-backup/apply')
}
