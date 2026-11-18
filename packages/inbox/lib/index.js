import { artifactOf, startSummary } from './summary.js'

/** Only the latest turn outcome belongs to the Inbox. Questions and approvals have native owners. */
export const name = 'dsh-inbox'
export const inject = ['sessionProjections']
export const KEY = 'dsh-inbox-outcome'
const reasons = new Set(['completed', 'blocked', 'error', 'max-tokens', 'interrupted', 'stopped'])
const uint = value => Number.isSafeInteger(value) && value >= 0

function schema(accept) {
  return {
    parse(value) { if (!accept(value)) throw new TypeError('Invalid Inbox checkpoint'); return value },
    safeParse(value) {
      try { return { success: true, data: this.parse(value) } }
      catch (error) { return { success: false, error } }
    },
  }
}
const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const isOutcome = v => v === null || (isRecord(v) && Object.keys(v).every(k => ['seq', 'time', 'reason', 'file'].includes(k)) && (!Object.hasOwn(v, 'file') || v.file === true) && uint(v.seq) && uint(v.time) && v.time <= 8.64e15 && reasons.has(v.reason))

export const definition = {
  key: KEY,
  stateVersion: 2,
  stateSchema: schema(v => isRecord(v) && typeof v.file === 'boolean' && uint(v.floor) && isOutcome(v.outcome)),
  init: (_header, inheritedEventCount = 0) => ({ floor: inheritedEventCount, file: false, outcome: null }),
  apply(state, event) {
    if (event.seq < state.floor) return state // A normal fork is a new task, not a copy of its parent's completed work.
    if (event.type === 'turn/start') return { ...state, file: false, outcome: null }
    if (event.type === 'tool/result' && artifactOf(event)) return { ...state, file: true }
    if (event.type !== 'turn/end') return state
    const kind = event.data.reason.kind
    if (kind === 'aborted' || kind === 'forked') return state.outcome === null ? state : { ...state, outcome: null }
    return { ...state, outcome: { seq: event.seq, time: event.time, reason: reasons.has(kind) ? kind : 'stopped', ...(state.file ? { file: true } : {}) } }
  },
  wire: { summary: true, viewSchema: schema(isOutcome), view: state => state.outcome },
}

export async function apply(ctx) {
  await ctx.sessionProjections.register(definition)
  ctx.inject(['storageDomain', 'sessionQuery', 'sessionController', 'llm', 'connection', 'webServer'], startSummary)
}
