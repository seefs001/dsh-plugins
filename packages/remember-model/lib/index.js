/**
 * dsh-remember-model — Host-only plugin.
 *
 * Remembers the last model picked in a top-level session: every recorded
 * `model/selection` event becomes the default selection for new agents.
 *
 * The Host already saves the default, but browsers cache the model catalog
 * (which carries that default) per Host generation and only reload it on a
 * few remote events. Without a reload, a new session's selector keeps showing
 * the old default. After each save this plugin emits `llm/models-updated`,
 * which every connected browser answers by reloading the catalog.
 */
export const name = 'remember-model'
export const inject = ['agentDefaultModel']

/** Let the Host's own save of the same selection settle before refreshing browsers. */
export const REFRESH_DELAY_MS = 400

/** Build a selection from a `model/selection` payload, or `undefined` when it is malformed. */
export function selectionOf(data) {
  if (typeof data?.provider !== 'string' || typeof data?.model !== 'string') return undefined
  return {
    provider: data.provider,
    model: data.model,
    ...typeof data.reasoningEffort === 'string' ? { reasoningEffort: data.reasoningEffort } : {},
  }
}

export function sameSelection(a, b) {
  return a?.provider === b?.provider && a?.model === b?.model
    && (a?.reasoningEffort ?? undefined) === (b?.reasoningEffort ?? undefined)
}

/** Keep subagent selections out of user defaults on both rc.1 and rc.2. */
export function isTopLevelSession(agents, sessionId, subagents) {
  const agent = agents?.get?.(sessionId)
  if (agent === undefined) return true
  if (typeof agents.roots === 'function') return agents.roots().includes(agent)
  return subagents === undefined || subagents.rootOf(agent) === agent
}

export function apply(ctx) {
  let pending = null

  ctx.on('session/event', (session, event) => {
    if (event?.type !== 'model/selection') return
    const next = selectionOf(event.data)
    if (next === undefined) return
    // Subagent sessions select their own models; only top-level sessions count.
    if (!isTopLevelSession(ctx.get('agents'), session.id, ctx.get('subagents'))) return

    const save = sameSelection(ctx.agentDefaultModel.currentSelection(), next)
      ? Promise.resolve()
      : ctx.agentDefaultModel.saveSelection(next)
    save
      .catch(error => ctx.logger?.warn?.(`remember-model: failed to save default model: ${error?.message ?? error}`))
      .then(() => {
        if (pending !== null) clearTimeout(pending)
        pending = setTimeout(() => {
          pending = null
          try { ctx.emit('llm/models-updated', next.provider) } catch {}
        }, REFRESH_DELAY_MS)
      })
  })

  ctx.effect(() => () => {
    if (pending !== null) clearTimeout(pending)
  }, 'remember-model: refresh timer')
}
