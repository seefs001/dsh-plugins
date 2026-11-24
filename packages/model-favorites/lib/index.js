import { ACTIONS, DOMAIN_SPEC, OpError, applyOp } from './state.js'

export const name = 'model-favorites'
export const inject = ['storageDomain', 'webServer', 'connection']

export const STATE_PATH = '/model-favorites/state'
export const OP_PATH = '/model-favorites/op'
export const TOOL_NAME = 'model_favorites'

const MAX_BODY_BYTES = 64 * 1024

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

// external: DSH reload can overlap storageDomain close and open
async function openDomain(ctx) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ctx.storageDomain.open(DOMAIN_SPEC)
    } catch (error) {
      if (error?.code !== 'already-open' || attempt >= 20) throw error
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
}

const TOOL_DESCRIPTION = [
  'Manage the user\'s starred favorite models shown at the top of the DSH model picker.',
  'Actions: list; add {provider, model}; remove {provider, model}; toggle {provider, model};',
  'move {provider, model, direction: "up" | "down" | toIndex}; reorder {favorites: [{provider, model}]}; clear.',
  'Every action returns the complete resulting favorites list.',
].join(' ')

export function apply(ctx) {
  let closed = false
  let tail = Promise.resolve()
  const ready = openDomain(ctx)
  ready.catch(error => ctx.logger?.warn?.(`model-favorites: cannot open storage: ${error?.message ?? error}`))

  ctx.effect(() => async () => {
    closed = true
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'model-favorites: storage domain')

  const run = op => {
    const task = tail.then(async () => {
      if (closed) throw new OpError('model favorites are unloading')
      const domain = await ready
      const current = domain.global.get()
      const { state, result } = applyOp(current, op)
      if (state !== current) await domain.global.set(state)
      return { ...result, favorites: state.favorites }
    })
    tail = task.catch(() => {})
    return task
  }

  const rejected = (res, peer) => {
    if (peer?.principal?.kind === 'owner') return false
    res.statusCode = peer === undefined ? 401 : 403
    res.end()
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try {
        await tail
        const domain = await ready
        sendJson(res, 200, { favorites: domain.global.get().favorites })
      } catch (error) {
        sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
    },
  }), `model-favorites: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: OP_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let op = null
      try { op = JSON.parse(raw) } catch {}
      try {
        sendJson(res, 200, await run(op))
      } catch (error) {
        sendJson(res, error instanceof OpError ? 400 : 500, { message: error?.message ?? String(error) })
      }
    },
  }), `model-favorites: POST ${OP_PATH}`)

  ctx.inject(['tools'], toolCtx => {
    toolCtx.effect(() => toolCtx.tools.register({
      name: TOOL_NAME,
      description: TOOL_DESCRIPTION,
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ACTIONS, description: 'Operation to perform.' },
          provider: { type: 'string', description: 'Provider id for add/remove/toggle/move.' },
          model: { type: 'string', description: 'Model id for add/remove/toggle/move.' },
          direction: { type: 'string', enum: ['up', 'down'], description: 'Move direction for move.' },
          toIndex: { type: 'integer', minimum: 0, description: 'Zero-based destination index for move.' },
          favorites: {
            type: 'array',
            description: 'Complete ordered list for reorder.',
            items: {
              type: 'object',
              properties: {
                provider: { type: 'string' },
                model: { type: 'string' },
              },
              required: ['provider', 'model'],
              additionalProperties: false,
            },
          },
        },
        required: ['action'],
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      },
      async execute(args) {
        return await run(args)
      },
    }), `model-favorites: ${TOOL_NAME} tool`)
  })
}

export { ACTIONS, DOMAIN_SPEC, OpError, applyOp, favoriteKey, normalizeEntry, normalizeState } from './state.js'
