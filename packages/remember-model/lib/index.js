export const name = 'remember-model'
export const inject = ['agentDefaultModel']

export const REFRESH_DELAY_MS = 400
const MAX_PENDING_SESSIONS = 128

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

export function isTopLevelSession(agents, sessionId) {
  const agent = agents?.get(sessionId)
  return agent === undefined || agents.roots().includes(agent)
}

export function apply(ctx, config = {}) {
  const onlyAfterTurn = config?.onlyAfterTurn === true
  const staged = new Map()
  let pending = null
  let saves = 0
  let closed = false

  const remember = next => {
    const save = saves === 0 && sameSelection(ctx.agentDefaultModel.currentSelection(), next)
      ? Promise.resolve()
      : ctx.agentDefaultModel.saveSelection(next)
    saves++
    save
      .then(() => {
        if (closed) return
        if (pending !== null) clearTimeout(pending)
        // external: DSH browsers cache the default model until llm/models-updated triggers a reload
        pending = setTimeout(() => {
          pending = null
          try { ctx.emit('llm/models-updated', next.provider) } catch {}
        }, REFRESH_DELAY_MS)
      })
      .catch(error => ctx.logger?.warn?.(`remember-model: failed to save default model: ${error?.message ?? error}`))
      .finally(() => { saves-- })
  }

  ctx.on('session/event', (session, event) => {
    if (!session?.id) return
    if (event?.type === 'model/selection') {
      const next = selectionOf(event.data)
      if (next === undefined) return
      if (!isTopLevelSession(ctx.get('agents'), session.id)) return
      if (!onlyAfterTurn) {
        remember(next)
        return
      }
      staged.delete(session.id)
      staged.set(session.id, next)
      while (staged.size > MAX_PENDING_SESSIONS) {
        const oldest = staged.keys().next().value
        if (oldest === undefined) break
        staged.delete(oldest)
      }
      return
    }
    if (onlyAfterTurn && event?.type === 'turn/start') {
      const next = staged.get(session.id)
      if (!next) return
      staged.delete(session.id)
      if (!isTopLevelSession(ctx.get('agents'), session.id)) return
      remember(next)
    }
  })

  ctx.effect(() => () => {
    closed = true
    staged.clear()
    if (pending !== null) clearTimeout(pending)
  }, 'remember-model: refresh timer')
}
