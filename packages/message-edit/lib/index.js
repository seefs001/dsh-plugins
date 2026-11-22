import { randomUUID } from 'node:crypto'

export const name = 'message-edit'
export const inject = ['webServer', 'connection', 'sessionController', 'sessionQuery', 'sessions']
export const OP_PATH = '/message-edit/op'
const MAX_TEXT = 1_000_000

const isText = block => block?.type === 'text'
const textOf = content => (content ?? []).filter(isText).map(b => b.text).join('\n\n')
const isReplace = event => event.surfaceOp !== undefined && event.surfaceOp !== 'append'

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

function checkText(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('The edited message must not be empty')
  if (value.length > MAX_TEXT) throw new Error(`The edited message exceeds ${MAX_TEXT} characters`)
  return value
}

export function editedContent(content, text) {
  const out = []
  let placed = false
  for (const block of content ?? []) {
    if (!isText(block)) { out.push(block); continue }
    if (!placed) { out.push({ type: 'text', text }); placed = true }
  }
  if (!placed) out.unshift({ type: 'text', text })
  return out
}

const sameMessage = (event, rpcId) => event.type === 'user/message'
  && event.data.source?.kind === 'user' && event.data.source.rpcId === rpcId

export function locate(events, rpcId) {
  const index = events.findIndex(e => sameMessage(e, rpcId) && e.surfaceOp === 'append')
  if (index < 0) throw new Error('The message no longer exists in this session')
  const original = events[index]
  let current = original
  let inContext = true
  let edits = 0
  for (let i = index + 1; i < events.length; i++) {
    const e = events[i]
    if (!isReplace(e) || !e.sourceEventSeqs?.includes(current.seq)) continue
    const op = e.surfaceOp
    if (sameMessage(e, rpcId) && op.startSeq === current.seq) {
      current = e
      edits++
    } else {
      inContext = false
      break
    }
  }
  return { index, original, current, inContext, edits }
}

export function forkBoundary(events, index) {
  let start = -1
  for (let i = index - 1; i >= 0; i--) if (events[i].type === 'turn/end') { start = i; break }
  let boundary = start >= 0 ? events[start].seq : null
  for (let i = start + 1; i < index; i++) {
    const e = events[i]
    if (e.type === 'turn/start' || e.type === 'agent/inbox/spliced' || (e.type === 'user/message' && e.surfaceOp === 'append')) break
    boundary = e.seq
  }
  return boundary
}

export class MessageEdit {
  constructor(ctx) { this.ctx = ctx }

  async events(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId) throw new Error('sessionId is required')
    return (await this.ctx.sessionQuery.readSession(sessionId)).events
  }

  async agent(sessionId) {
    const result = await this.ctx.sessionController.resolveAgent(sessionId)
    if ('error' in result) throw new Error(`Session unavailable: ${result.error?.message ?? result.error?.code ?? 'unknown'}`)
    return result.agent
  }

  async inspect({ sessionId, rpcId }) {
    const events = await this.events(sessionId)
    const found = locate(events, rpcId)
    return {
      text: textOf(found.current.data.content),
      originalText: textOf(found.original.data.content),
      edits: found.edits,
      inContext: found.inContext,
      forkAt: forkBoundary(events, found.index),
    }
  }

  async list({ sessionId }) {
    const events = await this.events(sessionId)
    const edited = Object.create(null)
    const surfaceToRpcId = new Map()
    for (const e of events) {
      if (e.surfaceOp === 'append' && e.type === 'user/message' && e.data.source?.kind === 'user') {
        surfaceToRpcId.set(e.seq, e.data.source.rpcId)
      } else if (isReplace(e)) {
        for (const seq of e.sourceEventSeqs ?? []) {
          const rpcId = surfaceToRpcId.get(seq)
          if (rpcId === undefined) continue
          surfaceToRpcId.delete(seq)
          if (seq === e.surfaceOp.startSeq && sameMessage(e, rpcId)) {
            surfaceToRpcId.set(e.seq, rpcId)
            edited[rpcId] = { text: textOf(e.data.content), inContext: true, time: e.time }
          } else if (edited[rpcId]) edited[rpcId].inContext = false
        }
      }
    }
    return { edited }
  }

  async rewrite({ sessionId, rpcId, text, clearLater = true }) {
    checkText(text)
    if (typeof clearLater !== 'boolean') throw new Error('clearLater must be a boolean')
    const agent = await this.agent(sessionId)
    const session = agent.session
    if (!session || typeof agent.runMaintenance !== 'function') throw new Error('This session cannot be edited in place')
    let task
    try {
      task = agent.runMaintenance(async () => {
        const events = await this.events(sessionId)
        const found = locate(events, rpcId)
        if (!found.inContext) throw new Error('This message was compacted or cleared and is no longer in the model context')
        const nodes = session.surface.nodes
        const index = nodes.indexOf(found.current.seq)
        if (index < 0) throw new Error('This message is no longer in the model context')
        const replaced = clearLater ? nodes.slice(index) : [found.current.seq]
        if (textOf(found.current.data.content) === text && replaced.length === 1) return { seq: found.current.seq, unchanged: true }
        const data = deepFreeze(structuredClone({ ...found.current.data, content: editedContent(found.current.data.content, text) }))
        const event = session.append('user/message', data, {
          surfaceOp: { op: 'replace', startSeq: found.current.seq, endSeq: replaced.at(-1) },
          sourceEventSeqs: replaced,
        })
        return { seq: event.seq }
      })
    } catch (error) {
      throw new Error(`The agent is busy; stop it or wait until it finishes (${error.message})`, { cause: error })
    }
    const result = await task
    await this.ctx.sessions.flush(session).catch(error => this.ctx.logger.warn(`message-edit flush: ${error.message}`))
    return result
  }

  async send({ sessionId, sourceSessionId, rpcId, text }) {
    checkText(text)
    const found = locate(await this.events(sourceSessionId), rpcId)
    const agent = await this.agent(sessionId)
    const original = found.original.data
    // external: dsh session fork copies queued inbox items from the parent turn
    for (const item of [...(agent.inbox?.nextTurn ?? []), ...(agent.inbox?.nextStep ?? [])]) {
      if (item.id === original.id || item.source?.rpcId === rpcId) agent.inbox.remove(item.id)
    }
    const { clientTimeZone } = original.source
    const message = deepFreeze(structuredClone({
      role: 'user',
      id: randomUUID(),
      content: editedContent(original.content, text),
      source: { kind: 'user', rpcId: randomUUID(), ...(clientTimeZone ? { clientTimeZone } : {}) },
    }))
    agent.followup(message)
    return { sessionId }
  }

  run(op) {
    switch (op?.action) {
      case 'inspect': return this.inspect(op)
      case 'list': return this.list(op)
      case 'rewrite': return this.rewrite(op)
      case 'send': return this.send(op)
      default: throw new Error('Unknown message-edit action')
    }
  }
}

async function readBody(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.byteLength
    if (bytes > 4 * 1024 * 1024) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function apply(ctx) {
  const service = new MessageEdit(ctx)
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: OP_PATH,
    handler: async (req, res, peer) => {
      if (peer?.principal?.kind !== 'owner') {
        res.writeHead(peer === undefined ? 401 : 403)
        res.end()
        return
      }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'POST' }); res.end(); return }
      let status = 200
      let body
      try {
        body = { ok: true, value: await service.run(await readBody(req)) }
      } catch (error) {
        status = 400
        body = { ok: false, message: error.message }
      }
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end(JSON.stringify(body))
    },
  }), 'message-edit: owner HTTP operations')
}
