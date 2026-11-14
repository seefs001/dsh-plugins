/**
 * dsh-service-tier — Host half.
 *
 * Sends `service_tier: "priority"` for the `provider/model` pairs marked fast,
 * only on `openai-responses` routes. DSH 0.2.2-rc.2 removed the
 * `llm-pi-ai/model-defaults` waterfall, so the option is added by wrapping
 * pi-ai's request entry point (see pi-ai-hook.js). Two small authenticated JSON routes let the browser toggle read
 * and persist the choice in this plugin's own config (`tiers`).
 */
import { addPiAiRequestTransform, catalogProvidersWithApi } from './pi-ai-hook.js'

export const name = 'service-tier'
export const inject = ['webServer', 'connection']

export const RESPONSES_API = 'openai-responses'
export const PI_AI_PACKAGE = '@deepseek-ai/dsh-llm-pi-ai'
export const STATE_PATH = '/service-tier/state'
export const SET_PATH = '/service-tier/set'
const MAX_BODY_BYTES = 16 * 1024

/** Keep only `provider/model` keys marked `priority`. */
export function normalizeTiers(raw) {
  const out = {}
  if (raw === null || typeof raw !== 'object') return out
  for (const [key, value] of Object.entries(raw)) {
    if (value === 'priority' && key.indexOf('/') > 0) out[key] = 'priority'
  }
  return out
}

/** Return `tiers` with `provider/model` switched on or off. */
export function toggleTier(tiers, provider, model, fast) {
  const key = `${provider}/${model}`
  const next = { ...tiers }
  if (fast) next[key] = 'priority'
  else delete next[key]
  return next
}

/** pi-ai provider ids whose route speaks the OpenAI Responses API, read from the composed config. */
export function responsesProviders(editor, catalogResponses = new Set()) {
  if (editor === undefined) return []
  try {
    for (const { entry, inherited, override } of editor.configuration()) {
      const pkg = entry?.options?.name ?? entry?.name
      if (pkg !== PI_AI_PACKAGE) continue
      const providers = { ...inherited?.providers, ...override?.providers }
      // A catalog route without its own `api` (e.g. `openai` through a gateway)
      // keeps the catalog's Responses protocol.
      return Object.entries(providers)
        .filter(([id, p]) => p?.api === RESPONSES_API || (p && p.api === undefined && catalogResponses.has(id)))
        .map(([id]) => id)
    }
  } catch {}
  return []
}

function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(payload))
}

/** Read a request body up to MAX_BODY_BYTES; `null` when it is larger. */
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

/**
 * Add `service_tier: "priority"` to Responses requests of fast `provider/model`
 * pairs. pi-ai's simple-stream options drop `serviceTier`, so the field goes
 * in through `onPayload`, after any payload hook DSH already set.
 */
export function serviceTierTransform(readTiers) {
  return request => {
    const { model, options } = request
    if (model?.api !== RESPONSES_API || readTiers()[`${model.provider}/${model.id}`] === undefined) return request
    const previous = options?.onPayload
    return {
      ...request,
      options: {
        ...options,
        onPayload: async (params, payloadModel) => {
          const next = (await previous?.(params, payloadModel)) ?? params
          return { ...next, service_tier: 'priority' }
        },
      },
    }
  }
}

export async function apply(ctx, config) {
  let tiers = normalizeTiers(config?.tiers)

  // DSH 0.2.2-rc.1 still has this waterfall; later releases use the pi-ai hook below.
  ctx.on('llm-pi-ai/model-defaults', (request, next) => {
    const base = next() ?? {}
    if (request.api !== RESPONSES_API || tiers[`${request.provider}/${request.model}`] === undefined) return base
    return { ...base, serviceTier: 'priority' }
  })
  const hooked = addPiAiRequestTransform(serviceTierTransform(() => tiers))
  const catalogResponses = catalogProvidersWithApi(RESPONSES_API).catch(error => {
    ctx.logger?.warn?.(`service-tier: cannot read the pi-ai catalog; catalog routes show no toggle (${error instanceof Error ? error.message : error})`)
    return new Set()
  })

  const rejected = (req, res) => {
    const rejection = ctx.connection.requestRejection(req)
    if (rejection === undefined) return false
    res.statusCode = rejection
    res.end()
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      sendJson(res, 200, { tiers, responsesProviders: responsesProviders(ctx.get('configEditor'), await catalogResponses) })
    },
  }), `service-tier: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: SET_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let body = null
      try { body = JSON.parse(raw) } catch {}
      const { provider, model, fast } = body ?? {}
      if (typeof provider !== 'string' || provider === '' || typeof model !== 'string' || model === '' || typeof fast !== 'boolean') {
        return sendJson(res, 400, { message: 'expected { provider: string, model: string, fast: boolean }' })
      }
      const entry = ctx.fiber.entry
      const editor = ctx.get('configEditor')
      if (entry === undefined || editor === undefined) {
        return sendJson(res, 500, { message: 'configuration cannot be saved in this profile' })
      }
      const next = toggleTier(tiers, provider, model, fast)
      // Live immediately; the config edit persists it (and restarts this plugin).
      tiers = next
      sendJson(res, 200, { tiers })
      editor.edit(entry, current => ({ ...current, tiers: next }))
        .catch(error => ctx.logger?.warn?.(`service-tier: failed to save tiers: ${error?.message ?? error}`))
    },
  }), `service-tier: POST ${SET_PATH}`)

  try {
    const hook = await hooked
    ctx.effect(() => hook.remove, 'service-tier: pi-ai request transform')
  } catch (error) {
    ctx.logger?.warn?.(`service-tier: priority requests are unavailable (${error instanceof Error ? error.message : error})`)
  }
}
