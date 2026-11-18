/** Read model for the activity inbox. Never open a CLI, replay events or change attention on read. */
export function activityOf(session, runtime) {
  const run = session.native?.runs?.at(-1)
  const pending = runtime && !runtime.closing && !runtime.canceling
    ? [...runtime.interactions.values()].filter(item => !item.responding) : []
  const liveRun = run && (run.state === 'preparing' || run.state === 'running')
  const state = session.state
  let group = 'recent'
  if (session.archived || session.native?.retired) group = 'history'
  else if (pending.length) group = 'attention'
  else if (liveRun || ['starting', 'running', 'waiting', 'canceling'].includes(state)) group = 'working'
  else if (state === 'error' || session.lastError || ['failed', 'interrupted'].includes(run?.state) || session.turnError) group = 'review'
  return {
    group, pending: pending.length, request: pending[0]?.public.kind ?? null,
    runState: run?.state ?? null, issue: session.lastError || run?.error || session.turnError || null,
    stopId: liveRun ? run.id : !session.native ? runtime?.turnId ?? null : null,
  }
}
