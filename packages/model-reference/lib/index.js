import { randomUUID } from 'node:crypto'

export const name = 'model-reference'
export const inject = ['webServer', 'connection']

export const STATE_PATH = '/model-reference/state'
export const SOURCE_KIND = 'model-reference'

const MODEL_REF_RE = /#model\(provider=([^,\s()]+), model=([^()\r\n]+?)(?:, reasoning_effort=([^,\s()]+))?(?:, service_tier=(priority|ultrafast))?\)/gu
const CONTEXT_SUMMARY_MAX_CHARS = 120
const MAX_MODEL_REFS = 8

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function boundSummary(summary) {
  const clean = String(summary ?? '').replace(/\s+/gu, ' ').trim()
  return clean.length <= CONTEXT_SUMMARY_MAX_CHARS
    ? clean
    : `${clean.slice(0, CONTEXT_SUMMARY_MAX_CHARS - 1)}…`
}

export function extractModelReferences(message) {
  if (message?.source?.kind !== 'user') return []
  const refs = []
  const seen = new Set()
  for (const block of message.content ?? []) {
    if (block?.type !== 'text' || typeof block.text !== 'string' || !block.text.includes('#model(')) continue
    for (const match of block.text.matchAll(MODEL_REF_RE)) {
      const provider = match[1]
      const model = match[2]
      const reasoningEffort = match[3]
      const serviceTier = match[4]
      const key = `${provider}/${model}|${reasoningEffort ?? ''}|${serviceTier ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      refs.push({
        provider,
        model,
        ...(reasoningEffort ? { reasoningEffort } : {}),
        ...(serviceTier ? { serviceTier } : {}),
      })
      if (refs.length >= MAX_MODEL_REFS) return refs
    }
  }
  return refs
}

export function buildModelReferenceMessage(refs, groups = []) {
  if (!Array.isArray(refs) || refs.length === 0) return null
  const lines = [
    'Resolved `#model(...)` references from the user message (use these exact fields if delegating or selecting a model):',
  ]
  const labels = []
  for (const ref of refs) {
    const group = groups.find(g => g?.id === ref.provider)
    const modelEntry = group?.models?.find(m => m?.id === ref.model)
    const routeKind = ref.provider.startsWith('acp-') ? 'acp' : 'dsh'
    const displayName = modelEntry?.name ?? ref.model
    labels.push(`${displayName}${ref.reasoningEffort ? ` (${ref.reasoningEffort})` : ''}`)
    const fields = [
      `provider=${JSON.stringify(ref.provider)}`,
      `model=${JSON.stringify(ref.model)}`,
      `route=${routeKind}`,
      ...(ref.reasoningEffort ? [`reasoningEffort=${JSON.stringify(ref.reasoningEffort)}`] : []),
      ...(ref.serviceTier ? [`serviceTier=${JSON.stringify(ref.serviceTier)}`] : []),
      ...(group?.name ? [`providerName=${JSON.stringify(group.name)}`] : []),
      ...(modelEntry?.name ? [`displayName=${JSON.stringify(modelEntry.name)}`] : []),
    ]
    lines.push(`- ${fields.join(', ')}`)
  }
  const summary = boundSummary(`Referenced model${refs.length === 1 ? '' : 's'}: ${labels.join(', ')}`)
  return deepFreeze({
    id: randomUUID(),
    role: 'user',
    content: [{ type: 'text', text: lines.join('\n') }],
    source: {
      kind: SOURCE_KIND,
      form: 'notice',
      summary,
      references: refs,
    },
  })
}

export function normalizeEfforts(raw) {
  const out = {}
  if (raw === null || typeof raw !== 'object') return out
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value !== '' && key.indexOf('/') > 0) out[key] = value
  }
  return out
}

export function isTopLevelSession(agents, sessionId) {
  const agent = agents?.get(sessionId)
  return agent === undefined || agents.roots().includes(agent)
}

export function apply(ctx, config) {
  let efforts = normalizeEfforts(config?.efforts)

  ctx.on('session/event', (session, event) => {
    if (event?.type !== 'model/selection') return
    const { provider, model, reasoningEffort } = event.data ?? {}
    if (typeof provider !== 'string' || typeof model !== 'string') return
    if (reasoningEffort !== undefined && (typeof reasoningEffort !== 'string' || reasoningEffort === '')) return
    if (!isTopLevelSession(ctx.get('agents'), session.id)) return
    const key = `${provider}/${model}`
    if (efforts[key] === reasoningEffort) return
    efforts = { ...efforts }
    if (reasoningEffort === undefined) delete efforts[key]
    else efforts[key] = reasoningEffort

    const entry = ctx.fiber.entry
    const editor = ctx.get('configEditor')
    if (entry === undefined || editor === undefined) return
    const saved = efforts
    editor.edit(entry, current => ({ ...current, efforts: saved }))
      .catch(error => ctx.logger?.warn?.(`model-reference: failed to save efforts: ${error?.message ?? error}`))
  })

  ctx.on('agent/pre-step', async ({ signal }, next) => {
    const decision = await next()
    if (decision.kind === 'reject' || signal?.aborted) return decision
    if (!Array.isArray(decision.messages) || decision.messages.length === 0) return decision
    if (decision.messages.some(message => message?.source?.kind === SOURCE_KIND)) return decision
    const hasCandidate = decision.messages.some(message => extractModelReferences(message).length > 0)
    if (!hasCandidate) return decision
    let groups = []
    try {
      const controller = ctx.get?.('sessionController')
      if (typeof controller?.modelCatalog === 'function') {
        const catalog = await controller.modelCatalog()
        if (Array.isArray(catalog?.groups)) groups = catalog.groups
      }
    } catch {}
    if (signal?.aborted) return decision
    const nextMessages = []
    let injected = false
    for (const message of decision.messages) {
      nextMessages.push(message)
      const refs = extractModelReferences(message)
      if (refs.length === 0) continue
      const refMsg = buildModelReferenceMessage(refs, groups)
      if (refMsg) {
        nextMessages.push(refMsg)
        injected = true
      }
    }
    return injected ? { ...decision, messages: nextMessages } : decision
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: (req, res, peer) => {
      if (peer?.principal?.kind !== 'owner') {
        res.statusCode = peer === undefined ? 401 : 403
        res.end()
        return
      }
      const ok = req.method === 'GET'
      res.statusCode = ok ? 200 : 405
      if (!ok) res.setHeader('allow', 'GET')
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.setHeader('cache-control', 'no-store')
      res.end(JSON.stringify(ok ? { efforts } : { message: 'GET only' }))
    },
  }), `model-reference: GET ${STATE_PATH}`)
}
