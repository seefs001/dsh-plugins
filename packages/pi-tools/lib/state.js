import { z } from './harness.js'

export const STATE_META = 'dshPiTools'
export const emptyState = () => ({ store: {}, loaded: [] })

// Both mutations are carried by existing successful tool/result events. No new
// Session event type, eager side write, or shared per-preset mutable state.
export function applyState(state, event) {
  if (event.type !== 'tool/result' || event.data.message.isError) return state
  const update = event.data.meta?.[STATE_META]
  if (update?.version !== 1) return state
  if (update.kind === 'store' && update.writes) {
    const store = new Map(Object.entries(state.store))
    for (const key of update.writes.delete) store.delete(key)
    for (const [key, value] of Object.entries(update.writes.set)) store.set(key, value)
    return { ...state, store: Object.fromEntries(store) }
  }
  if (update.kind === 'loaded' && Array.isArray(update.names)) {
    return { ...state, loaded: [...new Set([...state.loaded, ...update.names])] }
  }
  return state
}

export const stateDefinition = {
  key: 'dsh-pi-tools:state',
  stateVersion: 1,
  stateSchema: z.object({ store: z.record(z.string(), z.json()), loaded: z.array(z.string()) }),
  init: emptyState,
  apply: applyState,
}
