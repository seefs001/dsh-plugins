/**
 * dsh-model-reference — Host half.
 *
 * Remembers the last reasoning effort picked for each `provider/model` in a
 * top-level session and serves it to the browser, so a `#` chip can carry the
 * effort that model was last used with. Efforts persist in this plugin's own
 * config (`efforts`) through the config editor.
 */
export const name = 'model-reference'
export const inject = ['webServer', 'connection']

export const STATE_PATH = '/model-reference/state'

/** Keep only `provider/model` keys with a string effort. */
export function normalizeEfforts(raw) {
  const out = {}
  if (raw === null || typeof raw !== 'object') return out
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value !== '' && key.indexOf('/') > 0) out[key] = value
  }
  return out
}

/** Keep subagent selections out of user preferences on both rc.1 and rc.2. */
export function isTopLevelSession(agents, sessionId, subagents) {
  const agent = agents?.get?.(sessionId)
  if (agent === undefined) return true
  if (typeof agents.roots === 'function') return agents.roots().includes(agent)
  return subagents === undefined || subagents.rootOf(agent) === agent
}

export function apply(ctx, config) {
  let efforts = normalizeEfforts(config?.efforts)

  ctx.on('session/event', (session, event) => {
    if (event?.type !== 'model/selection') return
    const { provider, model, reasoningEffort } = event.data ?? {}
    if (typeof provider !== 'string' || typeof model !== 'string') return
    if (reasoningEffort !== undefined && (typeof reasoningEffort !== 'string' || reasoningEffort === '')) return
    // Subagents pick their own models; only what the person picks counts.
    if (!isTopLevelSession(ctx.get('agents'), session.id, ctx.get('subagents'))) return
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

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) {
        res.statusCode = rejection
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
