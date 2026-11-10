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

/** True when `sessionId` belongs to a top-level agent (or no agent registry is mounted). */
export function isTopLevelSession(agents, sessionId) {
  const agent = agents?.get?.(sessionId)
  return agent === undefined || agents.roots().includes(agent)
}

export function apply(ctx, config) {
  let efforts = normalizeEfforts(config?.efforts)

  ctx.on('session/event', (session, event) => {
    if (event?.type !== 'model/selection') return
    const { provider, model, reasoningEffort } = event.data ?? {}
    if (typeof provider !== 'string' || typeof model !== 'string' || typeof reasoningEffort !== 'string') return
    // Subagents pick their own models; only what the person picks counts.
    if (!isTopLevelSession(ctx.get('agents'), session.id)) return
    const key = `${provider}/${model}`
    if (efforts[key] === reasoningEffort) return
    efforts = { ...efforts, [key]: reasoningEffort }

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
