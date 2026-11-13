import { createHash } from 'node:crypto'

export const name = 'message-actions'
export const inject = ['storageDomain', 'sessionQuery', 'llm', 'webServer', 'connection', 'tools', 'sessionController']
export const OP_PATH = '/message-actions/op'
const MAX_RESULTS = 200

// Adapted from the user's wait-what skill. The call stays isolated from the Agent.
export const WAIT_WHAT_PROMPT = [
  "Wait, I don't understand where you've got to here. Re-pitch that: give me a little bit of context, talk in ASD-STE100 Simplified Technical English, and use the ubiquitous language from `GLOSSARY.md` (follow `GLOSSARY-MAP.md` to the right one if the repo has more than one).",
  '',
  'Apply that request to the original reply below. Explain the missing premise and connections; do not merely shorten the reply or answer the user question again.',
  "Respond in the original reply's language. Use ASD-STE100 for English and equivalent plain technical language for other languages.",
  'You have only the supplied text, without tools or project-file access. Keep project terms from the source; do not invent glossary entries or imply that you read project files.',
  '',
  'Previous user message (context only):',
  '{{user}}',
  '',
  'Original reply to explain:',
  '{{message}}',
].join('\n')

function text(value, label, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label}: expected 1–${max} characters`)
  return value
}

const validator = parse => ({
  parse,
  safeParse(value) {
    try { return { success: true, data: parse(value) } } catch (error) { return { success: false, error } }
  },
})
const resultSchema = validator(value => {
  for (const key of ['key', 'sessionId', 'messageId', 'provider', 'model', 'text', 'prompt', 'routeKey']) text(value?.[key], key, 2_000_000)
  if (!Number.isFinite(value.createdAt)) throw new Error('Invalid result timestamp')
  return value
})
export const DOMAIN_SPEC = {
  name: 'message_actions', version: 1, layout: 'per-record',
  tables: { results: { valueSchema: resultSchema } },
}

const blocksText = content => (content ?? []).filter(b => b.type === 'text').map(b => b.text).join('\n\n')

/** Read the exact durable assistant message, never a DOM copy or live token buffer. */
export function sourceOf(events, messageId) {
  let user = ''
  let config = {}
  for (const event of events) {
    if (event.type === 'user/message') user = blocksText(event.data.content)
    if (event.type === 'request/header') config = event.data.header.config
    if (event.type !== 'assistant/message' || event.data.message.id !== messageId) continue
    if (event.data.interrupted) throw new Error('The reply was interrupted; select a completed reply')
    const message = event.data.message
    const messageText = blocksText(message.content)
    if (!messageText.trim()) throw new Error('This reply has no text to process')
    const { provider, model } = message.source
    const sameRoute = provider === config.provider && model === config.model
    return { message: messageText, user, route: { provider, model, ...(sameRoute && config.reasoningEffort ? { reasoningEffort: config.reasoningEffort } : {}) } }
  }
  throw new Error('The selected reply no longer exists in this session')
}

export function renderPrompt(source) {
  return WAIT_WHAT_PROMPT.replace(/\{\{(message|user)\}\}/g, (_, key) => source[key])
}

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const settingsOf = config => ({
  provider: config?.provider?.trim() || '',
  model: config?.model?.trim() || '',
  reasoningEffort: config?.reasoningEffort?.trim() || '',
})
const keyOf = (sessionId, messageId, source) => hash([1, sessionId, messageId, source.message, source.user, source.route, WAIT_WHAT_PROMPT])

/** Shared Host operation seam for the HTTP UI and message_actions tool. */
export class MessageActions {
  constructor(ctx, domain, config) {
    this.settings = settingsOf(config)
    this.ctx = ctx
    this.domain = domain
    this.pending = new Set()
    this.tail = Promise.resolve()
  }

  mutate(fn) {
    const result = this.tail.then(fn)
    this.tail = result.catch(() => {})
    return result
  }

  async getSettings() {
    const { groups, failures } = await this.ctx.sessionController.modelCatalog()
    return { settings: this.settings, groups, failures }
  }

  async saveSettings(op, signal) {
    if (typeof op.provider !== 'string' || typeof op.model !== 'string') throw new Error('provider and model are required; use empty strings to follow the original reply')
    const settings = settingsOf(op)
    const { provider, model, reasoningEffort } = settings
    if (Boolean(provider) !== Boolean(model)) throw new Error('Select both a provider and a model')
    if (!provider && reasoningEffort) throw new Error('Original replies use their own reasoning effort')
    if (provider) {
      const { groups } = await this.ctx.sessionController.modelCatalog()
      const selected = groups.find(g => g.id === provider)?.models.find(m => m.id === model)
      if (!selected) throw new Error('The selected model is unavailable; refresh the model list')
      if (reasoningEffort && !selected.reasoning?.efforts.some(e => e.id === reasoningEffort)) throw new Error('Unsupported reasoning effort for this model')
    }
    const entry = this.ctx.fiber.entry
    const editor = this.ctx.get('configEditor')
    if (entry === undefined || editor === undefined) throw new Error('Configuration cannot be saved in this profile')
    signal?.throwIfAborted()
    await editor.edit(entry, current => ({ ...current, ...settings }))
    return { settings }
  }

  async source(sessionId, messageId, signal) {
    text(sessionId, 'sessionId', 200)
    text(messageId, 'messageId', 200)
    signal?.throwIfAborted()
    const source = sourceOf((await this.ctx.sessionQuery.readSession(sessionId)).events, messageId)
    const { provider, model, reasoningEffort } = this.settings
    if (provider) {
      if (!this.ctx.llm.listProviders().some(p => p.id === provider)) throw new Error('The configured Wait, what? provider is unavailable; choose another model in settings')
      source.route = { provider, model, ...(reasoningEffort ? { reasoningEffort } : {}) }
    }
    source.route = await this.ctx.llm.resolveCallConfig(source.route, signal)
    return source
  }

  async run(op, sessionId, signal, onText = () => {}) {
    signal?.throwIfAborted()
    switch (op?.action) {
      case 'get_settings': return this.getSettings()
      case 'save_settings': return this.saveSettings(op, signal)
      case 'inspect': {
        const source = await this.source(sessionId, op.messageId, signal)
        return { source, result: this.domain.table('results').get(keyOf(sessionId, op.messageId, source)) ?? null }
      }
      case 'generate': {
        const prompt = WAIT_WHAT_PROMPT
        const source = await this.source(sessionId, op.messageId, signal)
        const routeKey = hash(source.route)
        const key = keyOf(sessionId, op.messageId, source)
        const table = this.domain.table('results')
        const cached = table.get(key)
        if (cached && !op.force) return { result: cached, cached: true }
        if (this.pending.has(key)) throw new Error('This explanation is already generating; try again when they finish')
        this.pending.add(key)
        try {
          const blocks = new Map()
          let finish
          for await (const chunk of this.ctx.llm.stream({
            ...source.route,
            messages: [{ role: 'user', content: [{ type: 'text', text: renderPrompt(source) }] }],
            purpose: 'message-actions', signal,
          })) {
            signal?.throwIfAborted()
            if (chunk.type === 'text-delta') {
              blocks.set(chunk.index, (blocks.get(chunk.index) ?? '') + chunk.text)
              onText(chunk.text)
            } else if (chunk.type === 'block-end' && chunk.block.type === 'text') blocks.set(chunk.index, chunk.block.text)
            else if (chunk.type === 'finish') finish = chunk.reason
          }
          signal?.throwIfAborted()
          if (finish?.kind !== 'stop') throw new Error(finish?.failure?.message ?? `Generation did not complete (${finish?.kind ?? 'missing finish'})`)
          const output = [...blocks.entries()].toSorted((a, b) => a[0] - b[0]).map(([, v]) => v).join('\n\n')
          if (!output.trim()) throw new Error('The model returned no text')
          const result = { key, routeKey, sessionId, messageId: op.messageId, prompt, ...source.route, text: output, createdAt: Date.now() }
          await this.mutate(async () => {
            signal?.throwIfAborted()
            await table.put(key, result)
            const oldest = [...table.entries()].toSorted((a, b) => a[1].createdAt - b[1].createdAt)
            await table.deleteMany(oldest.slice(0, Math.max(0, oldest.length - MAX_RESULTS)).map(([id]) => id))
          })
          return { result, cached: false }
        } finally { this.pending.delete(key) }
      }
      default: throw new Error('Unknown message action')
    }
  }
}

async function readBody(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.byteLength
    if (bytes > 256 * 1024) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function apply(ctx, config) {
  const lifetime = new AbortController()
  const ready = ctx.storageDomain.open(DOMAIN_SPEC).then(domain => new MessageActions(ctx, domain, config))
  ready.catch(error => ctx.logger.warn(`message-actions storage: ${error.message}`))
  const tasks = new Set()
  const run = (op, sessionId, signal, onText) => {
    // Saving reconciles this very plugin. Never make disposal await its own save.
    // This operation uses no domain data and is governed by the caller's signal.
    if (op?.action === 'save_settings') return ready.then(service => service.run(op, sessionId, signal, onText))
    const combined = signal ? AbortSignal.any([signal, lifetime.signal]) : lifetime.signal
    const task = ready.then(service => service.run(op, sessionId, combined, onText))
    tasks.add(task)
    task.finally(() => tasks.delete(task)).catch(() => {})
    return task
  }
  ctx.effect(() => async () => {
    lifetime.abort()
    await Promise.allSettled(tasks)
    await ready.then(service => service.domain.close()).catch(() => {})
  }, 'message-actions: storage and requests')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: OP_PATH,
    handler: async (req, res) => {
      const admission = ctx.connection.admit(req)
      if ('rejection' in admission || admission.peer.principal.kind !== 'owner') {
        res.writeHead('rejection' in admission ? admission.rejection : 403)
        res.end()
        return
      }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'POST' }); res.end(); return }
      const controller = new AbortController()
      const abort = () => { if (!res.writableEnded) controller.abort() }
      res.on('close', abort)
      const send = value => { if (!res.destroyed && !res.writableEnded) res.write(`${JSON.stringify(value)}\n`) }
      try {
        const body = await readBody(req)
        res.writeHead(200, { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' })
        const value = await run(body, body.sessionId, controller.signal, delta => send({ type: 'delta', text: delta }))
        send({ type: 'done', value })
      } catch (error) {
        if (!res.headersSent) res.writeHead(400, { 'content-type': 'application/x-ndjson; charset=utf-8' })
        send({ type: 'error', message: error.message })
      } finally {
        res.off('close', abort)
        res.end()
      }
    },
  }), 'message-actions: owner HTTP operations')

  ctx.effect(() => ctx.tools.register({
    name: 'message_actions',
    description: 'Generate a cached Wait, what? explanation of one completed reply without replacing it. Fixed explanation prompt, no custom templates. Actions: get_settings; save_settings {provider,model,reasoningEffort?} (empty provider/model follows each original reply); inspect {messageId}; generate {messageId,force?}. Uses the dedicated configured model or the original reply model. Saves settings through the profile config editor; results persist on the Host. The UI does not add tool calls to the conversation; Agent calls use normal tool history.',
    parameters: { type: 'object', properties: {
      action: { type: 'string', enum: ['get_settings', 'save_settings', 'inspect', 'generate'] },
      provider: { type: 'string' }, model: { type: 'string' }, reasoningEffort: { type: 'string' }, messageId: { type: 'string' }, force: { type: 'boolean' },
    }, required: ['action'], additionalProperties: false },
    output: { schema: { type: 'object' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    timeoutMs: 300_000,
    execute: (args, exec) => run(args, exec.agent?.id, exec.signal),
  }), 'message-actions: agent operations')
}
