/**
 * dsh-image-gen — Host half.
 *
 * Registers agent image tools that call the hosted `image_generation` tool through
 * one of your local llm-pi-ai Responses routes, the same way dsh-web-access
 * calls hosted search. Per backend you pick a local provider/model; the
 * endpoint and key come from that provider route (`baseURL`, `apiKeyEnv`).
 *
 * - `openai` → `openai_image`: OpenAI hosted image_generation (size, quality, background, format).
 * - `grok`   → `grok_image`: xAI hosted image_generation (Grok Imagine; aspect ratio via the prompt).
 *
 * Images are written to `outputDir` under the agent's working directory and
 * stored as durable attachments, so the conversation shows them. The calling
 * model receives the images only when its route declares image input.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve } from 'node:path'

export const name = 'image-gen'
export const inject = ['tools', 'webServer', 'connection']

export const PI_AI_PACKAGE = '@deepseek-ai/dsh-llm-pi-ai'
export const RESPONSES_API = 'openai-responses'
export const STATE_PATH = '/image-gen/state'
export const SET_PATH = '/image-gen/set'
const MAX_BODY_BYTES = 16 * 1024
const MAX_PROMPT = 32_000

export const DEFAULTS = {
  timeoutMs: 300_000,
  outputDir: 'generated-images',
  openai: { enabled: true, provider: '', model: '' },
  grok: { enabled: true, provider: '', model: '' },
}

export const KINDS = {
  openai: { tool: 'openai_image', label: 'OpenAI' },
  grok: { tool: 'grok_image', label: 'Grok' },
}

export const OPENAI_SIZES = ['auto', '1024x1024', '1536x1024', '1024x1536']
export const OPENAI_QUALITIES = ['auto', 'low', 'medium', 'high']
export const OPENAI_BACKGROUNDS = ['auto', 'opaque', 'transparent']
export const OPENAI_FORMATS = ['png', 'jpeg', 'webp']
export const GROK_ASPECTS = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '2:1', '1:2', '21:9']

const INSTRUCTIONS = 'You are an image generator. Call the image_generation tool exactly once to create a new image from the user prompt. Do not ask questions. After the image is generated, reply with one short sentence.'

/** A tool failure whose message is shown to the model. */
export class ImageError extends Error {}

const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const str = v => (typeof v === 'string' ? v.trim() : '')

// ---------------------------------------------------------------- config

export function backendOf(kind, raw) {
  const d = DEFAULTS[kind]
  const r = isRecord(raw) ? raw : {}
  return { kind, enabled: r.enabled === undefined ? d.enabled : r.enabled === true, provider: str(r.provider), model: str(r.model) }
}

/** A relative output directory may not climb out of the working directory. */
export function outputDirOf(raw) {
  const dir = str(raw) || DEFAULTS.outputDir
  if (!isAbsolute(dir) && relative('.', dir).startsWith('..')) return DEFAULTS.outputDir
  return dir
}

export function settingsOf(config) {
  const timeoutMs = Number.isFinite(config?.timeoutMs) && config.timeoutMs > 0 ? config.timeoutMs : DEFAULTS.timeoutMs
  return { timeoutMs, outputDir: outputDirOf(config?.outputDir), openai: backendOf('openai', config?.openai), grok: backendOf('grok', config?.grok) }
}

/** Why a backend cannot register a tool; `undefined` when it can. */
export function unusable(b) {
  if (!b.enabled) return 'disabled'
  if (b.provider === '' || b.model === '') return 'no model selected'
  return undefined
}

// ---------------------------------------------------------------- routes

export function piAiProviders(editor) {
  if (editor === undefined) return {}
  try {
    for (const { entry, inherited, override } of editor.configuration()) {
      const pkg = entry?.options?.name ?? entry?.name
      if (pkg === PI_AI_PACKAGE) return { ...inherited?.providers, ...override?.providers }
    }
  } catch {}
  return {}
}

/** Provider ids whose route speaks the Responses API. */
export const responsesProviders = providers => Object.entries(providers).filter(([, p]) => p?.api === RESPONSES_API).map(([id]) => id)

export function routeOf(providers, id) {
  const p = providers[id]
  if (!isRecord(p)) throw new ImageError(`provider "${id}" is not configured in llm-pi-ai`)
  if (p.api !== RESPONSES_API) throw new ImageError(`provider "${id}" uses ${p.api ?? 'an unknown api'}, not ${RESPONSES_API}`)
  const baseURL = str(p.baseURL).replace(/\/+$/, '').replace(/\/responses$/, '')
  if (!URL.canParse(baseURL)) throw new ImageError(`provider "${id}" has no usable baseURL`)
  const headers = isRecord(p.headers) ? Object.fromEntries(Object.entries(p.headers).filter(([, v]) => typeof v === 'string')) : {}
  return { baseURL, apiKeyEnv: str(p.apiKeyEnv), headers }
}

export async function apiKeyOf(ctx, apiKeyEnv) {
  if (apiKeyEnv === '') return null
  try {
    const hit = await ctx.get('credentials')?.resolve(apiKeyEnv)
    if (typeof hit?.value === 'string' && hit.value !== '') return hit.value
  } catch {}
  const env = process.env[apiKeyEnv]
  return typeof env === 'string' && env !== '' ? env : undefined
}

export async function ready(ctx, b) {
  try {
    const route = routeOf(piAiProviders(ctx.get('configEditor')), b.provider)
    return (await apiKeyOf(ctx, route.apiKeyEnv)) !== undefined
  } catch {
    return false
  }
}

// ---------------------------------------------------------------- arguments

const pick = (args, field, allowed) => {
  const v = args?.[field]
  if (v === undefined || v === null) return undefined
  if (!allowed.includes(v)) throw new ImageError(`${field} must be one of ${allowed.join(', ')}`)
  return v
}

export function promptOf(args) {
  const p = typeof args?.prompt === 'string' ? args.prompt.trim() : ''
  if (p === '') throw new ImageError('prompt must be a non-empty string')
  if (p.length > MAX_PROMPT) throw new ImageError(`prompt exceeds ${MAX_PROMPT} characters`)
  return p
}

/** The hosted `image_generation` tool entry for one call. */
export function imageTool(b, args) {
  if (b.kind === 'grok') return { type: 'image_generation', action: 'generate' }
  const size = pick(args, 'size', OPENAI_SIZES)
  const quality = pick(args, 'quality', OPENAI_QUALITIES)
  const background = pick(args, 'background', OPENAI_BACKGROUNDS)
  const format = pick(args, 'output_format', OPENAI_FORMATS)
  if (background === 'transparent' && format === 'jpeg') throw new ImageError('transparent background needs output_format png or webp')
  return {
    type: 'image_generation',
    action: 'generate',
    ...(size ? { size } : {}),
    ...(quality ? { quality } : {}),
    ...(background ? { background } : {}),
    ...(format ? { output_format: format } : {}),
  }
}

/** The Responses request body for one call. */
export function requestBody(b, args) {
  const prompt = promptOf(args)
  const tool = imageTool(b, args)
  if (b.kind === 'grok') {
    // xAI's tool takes no size parameter; the model follows a ratio named in the prompt.
    const aspect = pick(args, 'aspect_ratio', GROK_ASPECTS)
    const text = aspect ? `${prompt}\n\nAspect ratio: ${aspect}.` : prompt
    return { model: b.model, input: [{ role: 'system', content: INSTRUCTIONS }, { role: 'user', content: text }], tools: [tool] }
  }
  return {
    model: b.model,
    instructions: INSTRUCTIONS,
    input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }],
    tools: [tool],
    tool_choice: { type: 'image_generation' },
    store: false,
  }
}

// ---------------------------------------------------------------- responses

/** Media type from magic bytes; `undefined` for anything that is not PNG, JPEG, WebP, or GIF. */
export function sniff(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (bytes.length >= 6 && bytes.toString('ascii', 0, 4) === 'GIF8') return 'image/gif'
  return undefined
}

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

/** Parse a Responses SSE body into the final response, failing on stream errors. */
export function parseSse(text) {
  const items = []
  let completed
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block.split(/\r?\n/).filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n')
    if (data === '' || data === '[DONE]') continue
    let event
    try { event = JSON.parse(data) } catch { continue }
    if (!isRecord(event)) continue
    if (event.type === 'error') throw new ImageError(`stream error: ${event.message ?? event.error?.message ?? event.code ?? 'unknown'}`)
    if (event.type === 'response.failed') throw new ImageError(`response failed: ${event.response?.error?.message ?? 'unknown'}`)
    if (event.type === 'response.output_item.done' && isRecord(event.item)) items.push(event.item)
    if ((event.type === 'response.completed' || event.type === 'response.incomplete') && isRecord(event.response)) completed = event.response
  }
  if (completed === undefined && items.length === 0) throw new ImageError('stream ended without a response')
  // Some servers drop the base64 from the final response; prefer the per-item copies when they carry it.
  const finalOutput = Array.isArray(completed?.output) ? completed.output : []
  const hasImage = list => list.some(i => i?.type === 'image_generation_call' && typeof i.result === 'string' && i.result !== '')
  const output = hasImage(finalOutput) || !hasImage(items) ? (finalOutput.length > 0 ? finalOutput : items) : items
  return { ...completed, output }
}

/**
 * Images and the model's text from Responses `output`. OpenAI names the
 * rewritten prompt `revised_prompt`; xAI names the prompt it wrote `prompt`.
 */
export function extractImages(output) {
  const images = []
  const text = []
  const failures = []
  for (const item of Array.isArray(output) ? output.filter(isRecord) : []) {
    if (item.type === 'image_generation_call') {
      if (typeof item.result !== 'string' || item.result === '') {
        failures.push(item.status ?? 'no result')
        continue
      }
      const bytes = Buffer.from(item.result.replace(/^data:[^,]*,/, ''), 'base64')
      const mediaType = sniff(bytes)
      if (mediaType === undefined) throw new ImageError('image_generation returned data that is not PNG, JPEG, WebP, or GIF')
      const revised = str(item.revised_prompt) || str(item.prompt)
      images.push({ bytes, mediaType, ...(revised ? { revisedPrompt: revised } : {}) })
    } else if (item.type === 'message' && Array.isArray(item.content)) {
      for (const part of item.content) if (isRecord(part) && typeof part.text === 'string' && part.text.trim() !== '') text.push(part.text.trim())
    }
  }
  return { images, text: text.join('\n\n'), failures }
}

const redact = (text, secret) => (secret ? String(text).split(secret).join('[redacted]') : String(text))

function errorDetail(text, secret) {
  let detail = text
  try {
    const body = JSON.parse(text)
    detail = body?.error?.message ?? body?.error ?? body?.detail ?? body?.message ?? text
    if (typeof detail !== 'string') detail = JSON.stringify(detail)
  } catch {}
  return redact(detail, secret).slice(0, 500)
}

/** Run one hosted image generation on a backend and return the decoded images. */
export async function generate(ctx, b, args, signal) {
  const body = requestBody(b, args)
  const route = routeOf(piAiProviders(ctx.get('configEditor')), b.provider)
  const key = await apiKeyOf(ctx, route.apiKeyEnv)
  if (key === undefined) throw new ImageError(`provider "${b.provider}" has no key: ${route.apiKeyEnv} is not set (store it on the Models page or export it)`)
  const endpoint = `${route.baseURL}/responses`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { ...route.headers, 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(key ? { authorization: `Bearer ${key}` } : {}) },
    body: JSON.stringify(body),
    signal,
  })
  const text = await response.text()
  if (!response.ok) throw new ImageError(`${endpoint} HTTP ${response.status}: ${errorDetail(text, key)}`)
  let parsed
  if ((response.headers.get('content-type') ?? '').includes('text/event-stream') || /^\s*(event|data):/.test(text)) parsed = parseSse(text)
  else {
    try { parsed = JSON.parse(text) } catch { throw new ImageError(`${endpoint} returned a body that is neither JSON nor SSE`) }
    if (parsed?.status === 'failed') throw new ImageError(`response failed: ${parsed.error?.message ?? 'unknown'}`)
  }
  const result = extractImages(parsed.output)
  if (result.images.length === 0) {
    const why = result.failures.length > 0 ? `image_generation ${result.failures.join(', ')}` : 'the model did not call image_generation'
    throw new ImageError(`${why}${result.text ? `; model said: ${redact(result.text, key).slice(0, 500)}` : ''}`)
  }
  return result.images
}

// ---------------------------------------------------------------- output

const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)

/** The agent's working directory, or the default one outside an agent. */
async function cwdOf(ctx, exec) {
  const wd = ctx.get('workingDirectory')
  if (wd === undefined) throw new ImageError('no working directory service is mounted')
  return exec.agent ? wd.ensure(exec.agent, exec.signal) : wd.defaultDirectory
}

/** Whether the calling model route declares image input. */
async function modelSeesImages(ctx, exec) {
  try {
    const routed = exec.agent?.session.requestHeader()?.config
    const provider = routed?.provider ?? exec.agent?.options.provider
    const model = routed?.model ?? exec.agent?.options.model
    const llm = ctx.get('llm')
    if (provider === undefined || model === undefined || llm === undefined) return false
    const info = await llm.resolveModelInfo(provider, model, exec.signal)
    return Array.isArray(info?.inputModalities) && info.inputModalities.includes('image')
  } catch {
    return false
  }
}

/** Write the images to disk and the attachment store. */
export async function saveImages(ctx, exec, b, images, outputDir) {
  const cwd = await cwdOf(ctx, exec)
  const dir = resolve(cwd, outputDir)
  await mkdir(dir, { recursive: true })
  const base = `${b.kind}-${stamp()}-${Math.random().toString(36).slice(2, 6)}`
  const attachments = ctx.get('attachments')
  const out = []
  for (const [i, image] of images.entries()) {
    const file = `${base}${images.length > 1 ? `-${i + 1}` : ''}.${EXT[image.mediaType]}`
    const path = join(dir, file)
    await writeFile(path, image.bytes, { flag: 'wx' })
    let attachment
    try {
      attachment = await attachments?.saveImage({ data: image.bytes, mediaType: image.mediaType, name: file })
    } catch (error) {
      ctx.logger?.warn?.(`image-gen: attachment store rejected ${file}: ${error?.message ?? error}`)
    }
    out.push({
      path,
      mediaType: image.mediaType,
      bytes: image.bytes.length,
      ...(image.revisedPrompt ? { revisedPrompt: image.revisedPrompt } : {}),
      ...(isRecord(attachment) ? { attachment: JSON.parse(JSON.stringify(attachment)) } : {}),
    })
  }
  return out
}

// ---------------------------------------------------------------- tools

function optionalParameters(properties) {
  return Object.fromEntries(Object.entries(properties).map(([key, schema]) => {
    if (key === 'prompt') return [key, schema]
    const { description, ...shape } = schema
    return [key, {
      oneOf: [shape, { type: 'null' }],
      description: `${description} Optional: omit or set null to use the default.`,
    }]
  }))
}

const PROMPT = { type: 'string', description: 'What to draw: subject, composition, style, and any text to render, in natural language.' }

export const OPENAI_PARAMETERS = {
  type: 'object',
  properties: optionalParameters({
    prompt: PROMPT,
    size: { type: 'string', enum: OPENAI_SIZES, description: 'Pixel size: square, landscape 1536x1024, or portrait 1024x1536. Default auto.' },
    quality: { type: 'string', enum: OPENAI_QUALITIES, description: 'Rendering quality; higher is slower. Default auto.' },
    background: { type: 'string', enum: OPENAI_BACKGROUNDS, description: 'transparent needs output_format png or webp. Default auto.' },
    output_format: { type: 'string', enum: OPENAI_FORMATS, description: 'File format. Default png.' },
  }),
  required: ['prompt'],
  additionalProperties: false,
}

export const GROK_PARAMETERS = {
  type: 'object',
  properties: optionalParameters({
    prompt: PROMPT,
    aspect_ratio: { type: 'string', enum: GROK_ASPECTS, description: 'Width:height ratio. Default: the model picks.' },
  }),
  required: ['prompt'],
  additionalProperties: false,
}

export const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    provider: { type: 'string' },
    model: { type: 'string' },
    visible: { type: 'boolean' },
    images: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          mediaType: { type: 'string' },
          bytes: { type: 'integer' },
          revisedPrompt: { type: 'string' },
          attachment: { type: 'object' },
        },
        required: ['path', 'mediaType', 'bytes'],
      },
    },
  },
  required: ['provider', 'model', 'visible', 'images'],
}

/** Model-facing blocks: the saved paths, then the images when the caller can see them. */
export function renderResult(value) {
  const lines = [`Generated ${value.images.length} image${value.images.length === 1 ? '' : 's'} with ${value.model}:`]
  for (const image of value.images) {
    lines.push(`- ${image.path}`)
    if (image.revisedPrompt) lines.push(`  prompt used: ${image.revisedPrompt}`)
  }
  if (!value.visible) lines.push('', 'The images are not attached because the current model does not accept image input.')
  const blocks = [{ type: 'text', text: lines.join('\n') }]
  if (value.visible) for (const image of value.images) if (image.attachment) blocks.push({ type: 'image', attachment: image.attachment })
  return blocks
}

function describe(b) {
  return `Generate an image from a text prompt with ${b.model}. Saves the image to a file and returns its path.`
}

export function toolOf(ctx, b, settings) {
  const toolName = KINDS[b.kind].tool
  const { timeoutMs, outputDir } = settings
  return {
    name: toolName,
    description: describe(b),
    parameters: b.kind === 'openai' ? OPENAI_PARAMETERS : GROK_PARAMETERS,
    output: {
      schema: OUTPUT_SCHEMA,
      render: (_args, value) => renderResult(value),
      presentationMeta: (_args, value) => ({
        images: value.images.map(({ path, attachment }) => ({ path, ...(attachment ? { attachment } : {}) })),
      }),
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const signal = AbortSignal.any([exec.signal, AbortSignal.timeout(timeoutMs)])
      try {
        const images = await generate(ctx, b, args, signal)
        const saved = await saveImages(ctx, exec, b, images, outputDir)
        const visible = saved.some(image => image.attachment) && await modelSeesImages(ctx, exec)
        return { provider: `${b.provider}/${b.model}`, model: b.model, visible, images: saved }
      } catch (error) {
        if (error instanceof ImageError || exec.signal.aborted) throw error
        if (error?.name === 'TimeoutError' || signal.aborted) throw new ImageError(`${toolName} timed out after ${timeoutMs} ms`)
        throw new ImageError(`${toolName} failed: ${error?.message ?? error}`)
      }
    },
  }
}

// ---------------------------------------------------------------- settings routes

function sendJson(res, status, payload, headers = {}) {
  if (res.writableEnded) return
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
/** Validate a settings-page body; returns the config to save or an error message. */
export function parseSettings(body) {
  if (!isRecord(body)) return { error: 'expected { openai, grok, outputDir }' }
  const out = {}
  if (typeof body.outputDir !== 'string') return { error: 'outputDir must be a string' }
  const dir = str(body.outputDir) || DEFAULTS.outputDir
  if (outputDirOf(dir) !== dir) return { error: 'outputDir must stay inside the working directory or be absolute' }
  out.outputDir = dir
  for (const kind of Object.keys(KINDS)) {
    const raw = body[kind]
    if (!isRecord(raw)) return { error: `${kind} must be an object` }
    if (typeof raw.enabled !== 'boolean') return { error: `${kind}.enabled must be a boolean` }
    for (const f of ['provider', 'model']) if (typeof raw[f] !== 'string') return { error: `${kind}.${f} must be a string` }
    if ((str(raw.provider) === '') !== (str(raw.model) === '')) return { error: `${kind}: set provider and model together, or clear both` }
    const { kind: _k, ...rest } = backendOf(kind, raw)
    out[kind] = rest
  }
  return { value: out }
}

export function apply(ctx, config) {
  const settings = settingsOf(config)
  for (const kind of Object.keys(KINDS)) {
    const b = settings[kind]
    if (unusable(b) !== undefined) continue
    // Offered only while the route resolves and its key is present.
    ctx.tools.register(toolOf(ctx, b, settings), { when: () => ready(ctx, b) })
  }

  const rejected = (req, res) => {
    const rejection = ctx.connection.requestRejection(req)
    if (rejection === undefined) return false
    res.statusCode = rejection
    res.end()
    return true
  }
  const strip = ({ kind: _k, ...rest }) => rest
  const state = async () => {
    const providers = piAiProviders(ctx.get('configEditor'))
    const status = {}
    for (const kind of Object.keys(KINDS)) {
      const b = settings[kind]
      status[kind] = unusable(b) ?? ((await ready(ctx, b)) ? 'ready' : 'route or key missing')
    }
    return { outputDir: settings.outputDir, openai: strip(settings.openai), grok: strip(settings.grok), responsesProviders: responsesProviders(providers), status }
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      sendJson(res, 200, await state())
    },
  }), `image-gen: GET ${STATE_PATH}`)

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
      const parsed = parseSettings(body)
      if (parsed.error !== undefined) return sendJson(res, 400, { message: parsed.error })
      const entry = ctx.fiber.entry
      const editor = ctx.get('configEditor')
      if (entry === undefined || editor === undefined) return sendJson(res, 500, { message: 'configuration cannot be saved in this profile' })
      try {
        // Saving restarts this plugin, which re-registers the tools.
        await editor.edit(entry, current => ({ ...current, ...parsed.value }))
      } catch (error) {
        ctx.logger?.warn?.(`image-gen: failed to save settings: ${error?.message ?? error}`)
        return sendJson(res, 409, { message: String(error?.message ?? error) })
      }
      sendJson(res, 200, parsed.value)
    },
  }), `image-gen: POST ${SET_PATH}`)
}
