import { addPiAiRequestTransform, catalogProvidersWithApi } from './pi-ai-hook.js'

export const name = 'service-tier'
export const inject = ['webServer', 'connection']

export const RESPONSES_API = 'openai-responses'
export const PI_AI_PACKAGE = '@deepseek-ai/dsh-llm-pi-ai'
export const STATE_PATH = '/service-tier/state'
export const SET_PATH = '/service-tier/set'
const MAX_BODY_BYTES = 16 * 1024

// external: https://developers.openai.com/api/docs/guides/ultrafast-mode
const ULTRAFAST_MODELS = ['gpt-6.2-sol', 'gpt-6.2-astra', 'gpt-6.1-sol', 'gpt-6-astra']

function supportsTier(model, tier) {
  return tier === 'priority' || (tier === 'ultrafast' && ULTRAFAST_MODELS.includes(model))
}

export function normalizeTiers(raw) {
  const out = {}
  if (raw === null || typeof raw !== 'object') return out
  for (const [key, value] of Object.entries(raw)) {
    const slash = key.indexOf('/')
    if (slash > 0 && supportsTier(key.slice(slash + 1), value)) out[key] = value
  }
  return out
}

export function toggleTier(tiers, provider, model, tier) {
  const key = `${provider}/${model}`
  const next = { ...tiers }
  if (tier === null) delete next[key]
  else if (supportsTier(model, tier)) next[key] = tier
  return next
}

export function responsesProviders(editor, catalogResponses = new Set()) {
  if (editor === undefined) return []
  try {
    for (const { entry, inherited, override } of editor.configuration()) {
      const pkg = entry?.options?.name ?? entry?.name
      if (pkg !== PI_AI_PACKAGE) continue
      const providers = { ...inherited?.providers, ...override?.providers }
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

// external: pi-ai streamSimple drops serviceTier from options, so inject it via onPayload
export function serviceTierTransform(readTiers) {
  return request => {
    const { model, options } = request
    if (model?.api !== RESPONSES_API) return request
    const tier = readTiers()[`${model.provider}/${model.id}`]
    if (tier === undefined) return request
    const previous = options?.onPayload
    return {
      ...request,
      options: {
        ...options,
        onPayload: async (params, payloadModel) => {
          const next = (await previous?.(params, payloadModel)) ?? params
          return { ...next, service_tier: tier }
        },
      },
    }
  }
}

export async function apply(ctx, config) {
  let tiers = normalizeTiers(config?.tiers)

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
      sendJson(res, 200, { tiers, responsesProviders: responsesProviders(ctx.get('configEditor'), await catalogResponses), ultrafastModels: ULTRAFAST_MODELS })
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
      const { provider, model, tier } = body ?? {}
      const valid = tier === null || supportsTier(model, tier)
      if (typeof provider !== 'string' || !provider || typeof model !== 'string' || !model || !valid) {
        return sendJson(res, 400, { message: 'expected provider, model and tier (priority, ultrafast or null)' })
      }
      const entry = ctx.fiber.entry
      const editor = ctx.get('configEditor')
      if (entry === undefined || editor === undefined) {
        return sendJson(res, 500, { message: 'configuration cannot be saved in this profile' })
      }
      try {
        let next
        await editor.edit(entry, current => {
          next = toggleTier(normalizeTiers(current.tiers), provider, model, tier)
          return { ...current, tiers: next }
        })
        tiers = next
        sendJson(res, 200, { tiers })
      } catch (error) {
        sendJson(res, 409, { message: error?.message ?? String(error) })
      }
    },
  }), `service-tier: POST ${SET_PATH}`)

  try {
    const hook = await hooked
    ctx.effect(() => hook.remove, 'service-tier: pi-ai request transform')
  } catch (error) {
    ctx.logger?.warn?.(`service-tier: service tier overrides are unavailable (${error instanceof Error ? error.message : error})`)
  }
}
