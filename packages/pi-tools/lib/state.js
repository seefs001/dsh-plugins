import { z } from './harness.js'

export const STATE_META = 'dshPiTools'
export const MAX_PERSISTED_VALUE_BYTES = 16 * 1024
export const MAX_PERSISTED_STORE_BYTES = 64 * 1024
export const emptyState = () => ({ store: {}, loaded: [] })

export function jsonByteLength(value) {
  try {
    const serialized = JSON.stringify(value)
    return serialized === undefined ? 0 : Buffer.byteLength(serialized, 'utf8')
  } catch {
    return Infinity
  }
}

export function boundPersistedStore(entries) {
  const kept = []
  let total = 0
  for (let i = entries.length - 1; i >= 0; i--) {
    const [key, value] = entries[i]
    const size = jsonByteLength(value) + Buffer.byteLength(key, 'utf8') + 6
    if (size > MAX_PERSISTED_VALUE_BYTES) continue
    if (total + size > MAX_PERSISTED_STORE_BYTES) continue
    kept.push([key, value])
    total += size
  }
  kept.reverse()
  return Object.fromEntries(kept)
}

export function applyState(state, event) {
  if (event.type !== 'tool/result' || event.data.message.isError) return state
  const update = event.data.meta?.[STATE_META]
  if (update?.version !== 1) return state
  if (update.kind === 'store' && update.writes) {
    const store = new Map(Object.entries(state.store))
    for (const key of update.writes.delete) store.delete(key)
    for (const [key, value] of Object.entries(update.writes.set)) {
      store.delete(key)
      if (jsonByteLength(value) <= MAX_PERSISTED_VALUE_BYTES) store.set(key, value)
    }
    return { ...state, store: boundPersistedStore([...store.entries()]) }
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
