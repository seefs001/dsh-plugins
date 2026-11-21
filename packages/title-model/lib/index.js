export const name = 'title-model'
export const inject = ['configEditor', 'webServer', 'connection']

export const STATE_PATH = '/title-model/state'
export const SET_PATH = '/title-model/set'
const PROVIDERS = new Map([
  ['@deepseek-ai/dsh-session-title-first-prompt-llm', 'first-prompt'],
  ['@deepseek-ai/dsh-session-title-all-prompts-llm', 'all-prompts'],
])
const MAX_BODY_BYTES = 16 * 1024
// external: Cordis 4.1 FiberState.ACTIVE is a TS const enum with no JS export
const ACTIVE = 2

function routeOf(entry) {
  const config = entry.fiber.effectiveConfig
  return { provider: config.provider ?? '', model: config.model ?? '' }
}

export function createController(editor) {
  const entries = () => editor.entries().filter(entry =>
    PROVIDERS.has(entry.options.name) && !entry.options.disabled && entry.fiber?.state === ACTIVE)

  const state = () => ({
    generators: entries().map(entry => ({
      id: entry.options.id,
      strategy: PROVIDERS.get(entry.options.name),
      ...routeOf(entry),
    })),
  })

  const set = async (input) => {
    if (input === null || typeof input !== 'object' || Array.isArray(input)
      || typeof input.provider !== 'string' || typeof input.model !== 'string'
      || (input.generator !== undefined && typeof input.generator !== 'string')) {
      throw new Error('Expected provider and model strings, and an optional generator id')
    }
    const provider = input.provider.trim()
    const model = input.model.trim()
    if ((provider === '') !== (model === '')) throw new Error('Set provider and model together, or clear both')
    const candidates = entries()
    const entry = input.generator === undefined && candidates.length === 1
      ? candidates[0] : candidates.find(row => row.options.id === input.generator)
    if (entry === undefined) throw new Error('Choose an available generator id from title_model get')
    await editor.edit(entry, current => {
      const next = { ...current }
      if (provider === '') {
        // external: DSH native title providers require absent keys to follow the session
        delete next.provider
        delete next.model
      } else {
        next.provider = provider
        next.model = model
      }
      return next
    })
    const saved = state()
    const accepted = saved.generators.find(row => row.id === entry.options.id)
    if (accepted === undefined || accepted.provider !== provider || accepted.model !== model) {
      throw new Error('The title generator did not activate the requested model; reload its configuration')
    }
    return saved
  }
  return { state, set }
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) throw new Error('Request body exceeds 16 KiB')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function apply(ctx) {
  const controller = createController(ctx.configEditor)

  for (const [path, method] of [[STATE_PATH, 'GET'], [SET_PATH, 'POST']]) {
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact', path,
      handler: async (req, res) => {
        const admission = ctx.connection.admit(req)
        if ('rejection' in admission) return sendJson(res, admission.rejection, { message: 'Authentication required' })
        if (admission.peer !== ctx.connection.browserPeer) return sendJson(res, 403, { message: 'Browser owner access required' })
        if (req.method !== method) {
          res.setHeader('allow', method)
          return sendJson(res, 405, { message: `${method} only` })
        }
        if (method === 'GET') return sendJson(res, 200, controller.state())
        let input
        try { input = await readJson(req) } catch (error) {
          return sendJson(res, 400, { message: String(error?.message ?? error) })
        }
        try { sendJson(res, 200, await controller.set(input)) } catch (error) {
          sendJson(res, 409, { message: String(error?.message ?? error) })
        }
      },
    }), `title-model: ${method} ${path}`)
  }

  ctx.inject(['tools'], toolCtx => {
    toolCtx.effect(() => toolCtx.tools.register({
      name: 'title_model',
      description: 'Read or set the model used by active native session title generators.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['get', 'set'] },
          generator: { type: 'string', description: 'Generator id from get; optional when exactly one is active.' },
          provider: { type: 'string', description: 'set: provider id; empty string with empty model follows the session.' },
          model: { type: 'string', description: 'set: model id, paired with provider.' },
        },
        required: ['action'],
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object', properties: { generators: { type: 'array', items: { type: 'object' } } }, required: ['generators'] },
        render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      },
      isConcurrencySafe: args => args?.action === 'get',
      async execute(args) {
        if (args?.action === 'get') return controller.state()
        if (args?.action === 'set') return controller.set(args)
        throw new Error('Expected action get or set')
      },
    }), 'title-model: title_model tool')
  })
}
