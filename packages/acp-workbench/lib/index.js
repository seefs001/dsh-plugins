import { DOMAIN_SPEC } from './store.js'
import { Workbench } from './manager.js'
import { NativeAcp } from './native.js'

export const name = 'acp-workbench'
export const inject = ['storageDomain', 'subprocess', 'webServer', 'connection', 'tools', 'llm', 'agents', 'sessions', 'subagents', 'attachments']
const BASE = '/acp-workbench'
const TOOL_ACTIONS = ['list', 'create', 'get', 'events', 'connect', 'prompt', 'cancel', 'disconnect', 'rename', 'archive', 'restore']
const USER_ONLY = new Set(['provider-save', 'provider-remove', 'diagnose', 'models', 'discover', 'import', 'respond', 'configure', 'native-stop', 'native-reset', 'native-connect', 'native-command'])

function send(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

async function body(req) {
  let bytes = 0
  const chunks = []
  for await (const chunk of req) {
    bytes += chunk.length
    if (bytes > 1024 * 1024) throw new Error('Request exceeds 1 MiB')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/** Model output is explicitly bounded; the stored event remains available by sequence. */
function toolValue(value) {
  const text = JSON.stringify(value)
  if (text.length <= 48_000) return value
  if (Array.isArray(value.events)) {
    const events = []
    let size = 0
    for (const event of value.events) {
      const encoded = JSON.stringify(event)
      const item = encoded.length > 12_000 ? { seq: event.seq, at: event.at, type: event.type,
        truncated: true, preview: encoded.slice(0, 12_000), fullEvent: 'Open the raw event in ACP Workbench.' } : event
      const length = JSON.stringify(item).length
      if (events.length && size + length > 40_000) break
      events.push(item)
      size += length
    }
    const next = events.at(-1)?.seq ?? value.next
    return { events, next, total: value.total, more: next < value.total, bounded: true }
  }
  return { truncated: true, preview: text.slice(0, 48_000), fullResult: 'Open ACP Workbench for the full result.' }
}

export async function apply(ctx) {
  let revision = 0
  let changeTimer
  let closed = false
  const streams = new Set()
  const changed = () => {
    if (closed) return
    revision++
    if (!changeTimer) changeTimer = setTimeout(() => {
      changeTimer = undefined
      const frame = `data: ${JSON.stringify({ revision })}\n\n`
      for (const res of streams) {
        // A stalled browser reconnects from persisted sequence, not an unbounded socket queue.
        if (res.writableLength > 1024 * 1024) res.end()
        else res.write(frame)
      }
    }, 80)
  }
  const domain = await ctx.storageDomain.open(DOMAIN_SPEC)
  let native
  const manager = new Workbench({ domain, subprocess: ctx.subprocess, changed,
    modelsChanged: providerId => native && ctx.emit('llm/models-updated', native.route(providerId)),
    log: message => ctx.logger.warn(message),
    autoApprove: (session, params) => native?.autoApprove(session, params) ?? null })
  native = new NativeAcp(ctx, manager)
  try { await manager.initialize(); await native.initialize() } catch (error) { await native.close(); await manager.close(); throw error }

  const admit = (req, res) => {
    const admission = ctx.connection.admit(req)
    if ('rejection' in admission) { res.statusCode = admission.rejection; res.end(); return null }
    if (admission.peer.principal.kind !== 'owner') { res.statusCode = 403; res.end(); return null }
    return admission.peer
  }
  const register = (path, handler) => ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: BASE + path, handler }), `acp-workbench: ${path}`)
  register('/state', async (req, res) => {
    if (!admit(req, res)) return
    if (req.method !== 'GET') return send(res, 405, { message: 'GET only' })
    send(res, 200, manager.snapshot({ kind: 'user' }))
  })
  register('/op', async (req, res) => {
    const peer = admit(req, res)
    if (!peer) return
    if (req.method !== 'POST') return send(res, 405, { message: 'POST only' })
    try {
      const op = await body(req)
      if (USER_ONLY.has(op?.action) && peer.interactions !== 'answer') return send(res, 403, { message: 'Open the workbench as the human user to perform this operation' })
      let result
      if (op?.action?.startsWith('native-')) {
        const sessionId = op.dshSessionId
        if (!['native-reset', 'native-trace'].includes(op.action) && (typeof sessionId !== 'string' || !sessionId.length || sessionId.length > 256)) throw new Error('A native DSH session id is required')
        switch (op.action) {
          case 'native-snapshot': result = native.snapshot(sessionId); break
          case 'native-connect': result = await native.connect(sessionId, op.externalId); break
          case 'native-command': result = await native.command(sessionId, op.command, op.arguments, op.externalId); break
          case 'native-stop': result = await native.stop(sessionId); break
          case 'native-reset': result = await native.reset(op.externalId); break
          case 'native-trace': result = native.trace(op); break
          default: throw new Error('Unknown native ACP operation')
        }
      } else {
        result = op.action === 'configure' && manager.session(op.sessionId, { kind: 'user' }).native
          ? await native.configure(op) : await manager.operate(op, { kind: 'user' })
        if (['provider-save', 'provider-remove'].includes(op.action)) native.syncProviders()
      }
      send(res, 200, result)
    } catch (error) { send(res, 400, { message: error.message ?? String(error) }) }
  })
  register('/events', (req, res) => {
    if (!admit(req, res)) return
    if (req.method !== 'GET') return send(res, 405, { message: 'GET only' })
    res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', connection: 'keep-alive', 'x-accel-buffering': 'no' })
    res.write(`retry: 2000\ndata: ${JSON.stringify({ revision })}\n\n`)
    streams.add(res)
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25_000)
    res.on('close', () => { clearInterval(heartbeat); streams.delete(res) })
  })

  ctx.tools.register({
    name: 'acp_workbench',
    description: 'Advanced ACP history and standalone-session diagnostics. For normal delegation, prefer subagent_cursor or subagent_antigravity: they create native continuable DSH children visible in this conversation. This legacy tool creates separate external sessions; prompt returns acceptance, not completion. Conversations bound to DSH are read-only here (get/events). Records are scoped to this DSH session. Human permissions and configuration stay in the UI. External CLI tools are not sandboxed by DSH.',
    parameters: {
      type: 'object', properties: {
        action: { type: 'string', enum: TOOL_ACTIONS },
        sessionId: { type: 'string', description: 'Workbench session id, not the external provider or DSH session id.' },
        providerId: { type: 'string', description: 'create: provider id returned by list.' },
        cwd: { type: 'string', description: 'create: absolute local workspace directory.' },
        title: { type: 'string', description: 'create/rename: session title.' },
        text: { type: 'string', description: 'prompt: message, up to 200000 characters. The session must be connected and idle.' },
        after: { type: 'integer', minimum: 0, description: 'events: return events after this sequence; use next for subsequent pages.' },
        limit: { type: 'integer', minimum: 1, maximum: 200, description: 'events: page size, default 80; output may be reduced to fit the response budget.' },
      }, required: ['action'], additionalProperties: false,
    },
    output: { schema: { type: 'object' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    isConcurrencySafe: args => ['list', 'get', 'events'].includes(args?.action),
    async execute(args, exec) {
      if (!TOOL_ACTIONS.includes(args?.action)) throw new Error('Unknown or human-only workbench operation')
      const sessionId = exec.agent?.session?.id
      if (!sessionId) throw new Error('ACP Workbench requires an owning DSH session')
      exec.signal.throwIfAborted()
      return toolValue(await manager.operate(args, { kind: 'agent', sessionId }))
    },
  })

  ctx.effect(() => async () => {
    if (closed) return
    closed = true
    clearTimeout(changeTimer)
    for (const res of streams) res.end()
    streams.clear()
    await native.close()
    await manager.close()
    clearTimeout(changeTimer)
  }, 'acp-workbench: close processes and storage')
}
