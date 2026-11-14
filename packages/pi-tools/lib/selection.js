import { appendPluginRecord, pluginRecordOf, z } from './harness.js'

// Session-owned tool selection stored as an ignorable plugin record, so a
// stock DSH reader keeps the Session even without this plugin.
export const SELECTION_RECORD = 'plugin:dsh-pi-tools/selection'
export const OPTIONS_PATH = '/pi-tools/options'

const toolList = z.array(z.string())

function selectionOf(data) {
  if (!data || typeof data !== 'object' || typeof data.agentPreset !== 'string') return undefined
  if (data.tools === null) return { agentPreset: data.agentPreset, tools: null }
  const parsed = toolList.safeParse(data.tools)
  return parsed.success ? { agentPreset: data.agentPreset, tools: parsed.data } : undefined
}

// A preset change resets the selection, matching the first-turn creation flow.
// A record only applies to the preset it names.
export const selectionDefinition = {
  key: 'dsh-pi-tools:selection',
  stateVersion: 1,
  stateSchema: z.object({ agentPreset: z.string().nullable(), tools: toolList.nullable() }),
  init: header => ({ agentPreset: header?.agentPreset ?? null, tools: null }),
  apply: (state, event) => {
    if (event.type === 'agent-preset/selected') return { agentPreset: event.data.agentPreset, tools: null }
    const record = pluginRecordOf(event)
    if (record?.type !== SELECTION_RECORD) return state
    const selection = selectionOf(record.data)
    return selection && (state.agentPreset === null || selection.agentPreset === state.agentPreset)
      ? { agentPreset: selection.agentPreset, tools: selection.tools } : state
  },
}

export const isSelectionEvent = event => event.type === 'agent-preset/selected' || event.type === SELECTION_RECORD

export function appendSelection(session, agentPreset, tools) {
  return appendPluginRecord(session, SELECTION_RECORD, { agentPreset, tools })
}

// Every live preset generation; the single Web route finds the owning one.
export const liveLoadouts = new Set()

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > 256 * 1024) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function send(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

// GET ?sessionId= reads the catalog and committed selection of a blank Pi Session.
// POST { sessionId, tools } commits a selection before the first turn.
export function registerOptionsRoute(ctx) {
  ctx.inject(['webServer', 'connection', 'sessionController', 'agents'], scope => {
    scope.effect(() => scope.webServer.register({
      kind: 'exact', path: OPTIONS_PATH,
      handler: async (req, res) => {
        const admission = scope.connection.admit(req)
        if ('rejection' in admission || admission.peer.principal.kind !== 'owner') {
          res.writeHead('rejection' in admission ? admission.rejection : 403)
          res.end()
          return
        }
        try {
          const post = req.method === 'POST'
          if (!post && req.method !== 'GET') return send(res, 405, { message: 'GET or POST only' })
          const body = post ? await readBody(req) : undefined
          const sessionId = post ? body?.sessionId : new URL(req.url, 'http://local').searchParams.get('sessionId')
          if (typeof sessionId !== 'string' || !sessionId) return send(res, 400, { message: 'sessionId is required' })
          const resolved = await scope.sessionController.resolveAgent(sessionId)
          if (!resolved.agent) return send(res, 404, { message: resolved.error?.message ?? 'Session is unavailable' })
          const agent = resolved.agent
          const loadout = [...liveLoadouts].find(candidate => candidate.contains(agent))
          if (!loadout) return send(res, 200, { applicable: false })
          const boundary = scope.agents.turnBoundaryOf(agent.session)
          const editable = boundary.openTurnStartSeq === null && boundary.lastTurn === 0
          const state = loadout.selection.stateOf(agent.session)
          if (!post) {
            return send(res, 200, { applicable: true, editable, catalog: loadout.catalog(), tools: state.tools })
          }
          if (!editable) return send(res, 409, { message: 'This session has already started' })
          const agentPreset = state.agentPreset
          if (!agentPreset) return send(res, 409, { message: 'The session has no Agent preset' })
          const tools = body.tools === null ? null : loadout.parseSelection(body).tools
          if (JSON.stringify(state.tools) !== JSON.stringify(tools)) appendSelection(agent.session, agentPreset, tools)
          send(res, 200, { ok: true, tools })
        } catch (error) {
          if (!res.headersSent) send(res, 400, { message: error instanceof Error ? error.message : String(error) })
        }
      },
    }), `pi-tools: ${OPTIONS_PATH}`)
  })
}
