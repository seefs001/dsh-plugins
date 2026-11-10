/** Host-owned progress, folded from the existing compaction lifecycle. */
export const name = 'compaction-status'
export const inject = ['sessionProjections']
export const PROJECTION_KEY = 'dsh-compaction-status'

/** Dependency-free validator for the registry's persisted and wire boundaries. */
export const STATE_SCHEMA = {
  parse(value) {
    if (value === null) return null
    if (typeof value !== 'object'
      || typeof value.id !== 'string' || value.id.length === 0
      || !Number.isFinite(value.startedAt)
      || (value.turn !== null && !Number.isInteger(value.turn))) {
      throw new TypeError('Invalid compaction status')
    }
    return { id: value.id, startedAt: value.startedAt, turn: value.turn }
  },
  safeParse(value) {
    try { return { success: true, data: this.parse(value) } } catch (error) { return { success: false, error } }
  },
}

export function foldCompaction(state, event) {
  if (event.type === 'compaction/start') {
    return { id: event.data.compactionId, startedAt: event.time, turn: event.data.turn }
  }
  if (state === null) return state
  if (event.type === 'compaction/end' && event.data.compactionId === state.id) return null
  // Recovery/fork seeds close inherited work; automatic compaction belongs to its turn.
  if (event.type === 'session/end-seed') return null
  if (event.type === 'turn/end' && state.turn !== null && event.data.turn === state.turn) return null
  return state
}

export async function apply(ctx) {
  await ctx.sessionProjections.register({
    key: PROJECTION_KEY,
    stateSchema: STATE_SCHEMA,
    stateVersion: 1,
    init: () => null,
    apply: foldCompaction,
    wire: { viewSchema: STATE_SCHEMA, view: state => state, summary: false },
  })
}
