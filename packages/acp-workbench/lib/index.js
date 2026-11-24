import { DOMAIN_SPEC } from './store.js'
import { Workbench } from './manager.js'
import { NativeAcp } from './native.js'

export const name = 'acp-workbench'
export const inject = ['storageDomain', 'subprocess', 'webServer', 'connection', 'llm', 'agents', 'sessions', 'subagents', 'attachments']
const BASE = '/acp-workbench'
const USER_ONLY = new Set(['provider-save', 'provider-remove', 'diagnose', 'models', 'discover', 'usage', 'respond', 'configure', 'native-stop', 'native-steer', 'native-reset', 'native-connect', 'native-discover', 'native-adopt', 'native-fork', 'native-command', 'native-set-option'])

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

export async function apply(ctx, config = {}) {
  let revision = 0
  let changeTimer
  let closed = false
  const streams = new Set()
  const changedRecords = new Set()
  let globalChange = false
  const changedConversations = new Set()
  const changed = (recordId, conversationId) => {
    if (closed) return
    if (typeof recordId === 'string') changedRecords.add(recordId)
    else if (typeof conversationId === 'string') changedConversations.add(conversationId)
    else globalChange = true
    revision++
    if (!changeTimer) changeTimer = setTimeout(() => {
      changeTimer = undefined
      const conversations = new Set(changedConversations)
      changedConversations.clear()
      for (const id of changedRecords) {
        const binding = manager.store.sessions.get(id)?.native
        if (binding) { conversations.add(binding.sessionId); if (binding.rootSessionId) conversations.add(binding.rootSessionId) }
      }
      const frame = `data: ${JSON.stringify({ revision, ...(globalChange ? {} : { conversations: [...conversations], activityChanged: changedRecords.size > 0 }) })}\n\n`
      globalChange = false
      changedRecords.clear()
      for (const res of streams) {
        if (res.writableLength > 1024 * 1024) res.end()
        else res.write(frame)
      }
    }, 80)
  }
  const domain = await ctx.storageDomain.open(DOMAIN_SPEC)
  const bridge = { native: null }
  const manager = new Workbench({ domain, subprocess: ctx.subprocess, changed,
    modelsChanged: providerId => bridge.native && ctx.emit('llm/models-updated', bridge.native.route(providerId)),
    log: message => ctx.logger.warn(message),
    autoApprove: (session, params) => bridge.native?.autoApprove(session, params) ?? null,
    mcpServersFor: session => bridge.native?.mcpServersFor(session) ?? [],
    chunkRetentionDays: config.chunkRetentionDays,
    archivedChunkRetentionDays: config.archivedChunkRetentionDays,
    maxChunkBytes: config.maxChunkBytes })
  const native = new NativeAcp(ctx, manager, config)
  bridge.native = native
  try { await manager.initialize(); await native.initialize() } catch (error) { await native.close(); await manager.close(); throw error }

  const admit = (res, peer) => {
    if (peer === undefined) { res.statusCode = 401; res.end(); return null }
    if (peer.principal.kind !== 'owner') { res.statusCode = 403; res.end(); return null }
    return peer
  }
  const register = (path, handler) => ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: BASE + path, handler }), `acp-workbench: ${path}`)
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: BASE + '/mcp',
    auth: 'anonymous',
    handler: (req, res) => native.delegation.handleMcpRequest(req, res),
  }), 'acp-workbench: /mcp')
  register('/state', async (req, res, peer) => {
    if (!admit(res, peer)) return
    if (req.method !== 'GET') return send(res, 405, { message: 'GET only' })
    send(res, 200, manager.snapshot())
  })
  register('/op', async (req, res, peer) => {
    if (!admit(res, peer)) return
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
          case 'native-discover': result = await native.discover(sessionId, op.route, op.cursor); break
          case 'native-fork': result = await native.maintainConnection(sessionId, { fork: op }); break
          case 'native-adopt': result = await native.maintainConnection(sessionId, { adoption: op }); break
          case 'native-connect': result = await native.connect(sessionId, op.externalId, op.route); break
          case 'native-command': result = await native.command(sessionId, op.command, op.arguments, op.externalId, op.commandStamp); break
          case 'native-stop': result = await native.stop(sessionId, op.externalId, op.stopId); break
          case 'native-steer': result = await native.steer(sessionId, op.text, op.externalId); break
          case 'native-reset': result = await native.reset(op.externalId); break
          case 'native-trace': result = native.trace(op); break
          case 'native-set-option': result = await native.setOption(op); break
          default: throw new Error('Unknown native ACP operation')
        }
      } else {
        result = op.action === 'configure' ? await native.configure(op) : await manager.operate(op)
        if (['provider-save', 'provider-remove'].includes(op.action)) native.syncProviders()
      }
      send(res, 200, result)
    } catch (error) { send(res, 400, { message: error.message ?? String(error) }) }
  })
  register('/events', (req, res, peer) => {
    if (!admit(res, peer)) return
    if (req.method !== 'GET') return send(res, 405, { message: 'GET only' })
    res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', connection: 'keep-alive', 'x-accel-buffering': 'no' })
    res.write(`retry: 2000\ndata: ${JSON.stringify({ revision })}\n\n`)
    streams.add(res)
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25_000)
    res.on('close', () => { clearInterval(heartbeat); streams.delete(res) })
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
