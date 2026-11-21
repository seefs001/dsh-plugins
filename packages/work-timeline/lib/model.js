import { isAbsolute } from 'node:path'

export const KEY = 'dsh-work-timeline'
export const META = 'dshWorkTimeline'
export const STATUSES = ['pending', 'in_progress', 'blocked', 'completed', 'canceled']
export const HISTORY_LIMIT = 100
const finished = status => status === 'completed' || status === 'canceled'
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function object(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object')
  for (const key of Object.keys(value)) if (!fields.includes(key)) throw new TypeError(`Unknown field: ${key}`)
  return value
}
function text(value, field, optional = false) {
  if (optional && value === undefined) return ''
  if (typeof value !== 'string' || (!optional && !value.trim())) throw new TypeError(`${field} must be nonempty text`)
  return value.trim()
}
function choice(value, values, field) {
  if (!values.includes(value)) throw new TypeError(`Invalid ${field}: ${value}`)
  return value
}
function list(value, parse) {
  if (!Array.isArray(value)) throw new TypeError('Expected a complete array')
  const result = value.map(parse)
  if (new Set(result.map(item => item.id)).size !== result.length) throw new TypeError('IDs must be unique within each list')
  return result
}
function step(value) {
  object(value, ['id', 'content', 'status', 'blocker', 'outcome'])
  const result = {
    id: text(value.id, 'step.id'), content: text(value.content, 'step.content'),
    status: choice(value.status, STATUSES, 'step.status'),
    blocker: text(value.blocker, 'blocker', true), outcome: text(value.outcome, 'outcome', true),
  }
  if (result.status === 'blocked' && !result.blocker) throw new Error(`Step ${result.id} needs a blocker`)
  if (result.status !== 'blocked' && result.blocker) throw new Error(`Clear the resolved blocker on step ${result.id}`)
  if (result.status === 'completed' && !result.outcome) throw new Error(`Step ${result.id} needs an outcome; completion is a report, not verification`)
  return result
}
function artifact(value) {
  object(value, ['id', 'title', 'path', 'stepId', 'description', 'role'])
  const result = {
    id: text(value.id, 'artifact.id'), title: text(value.title, 'artifact.title'), path: text(value.path, 'artifact.path'),
    stepId: text(value.stepId, 'artifact.stepId', true), description: text(value.description, 'description', true),
    role: choice(value.role, ['deliverable', 'evidence'], 'artifact.role'),
  }
  if (!isAbsolute(result.path) || result.path.includes('\0')) throw new Error('Artifact paths must be absolute Session filesystem paths')
  return result
}

export function parseSnapshot(value) {
  object(value, ['title', 'objective', 'status', 'outcome', 'steps', 'artifacts'])
  const result = {
    title: text(value.title, 'title'), objective: text(value.objective, 'objective'),
    status: choice(value.status, ['active', 'completed', 'canceled'], 'work.status'),
    outcome: text(value.outcome, 'outcome', true), steps: list(value.steps, step), artifacts: list(value.artifacts, artifact),
  }
  const ids = new Set(result.steps.map(item => item.id))
  for (const item of result.artifacts) if (item.stepId && !ids.has(item.stepId)) throw new Error(`Unknown artifact step: ${item.stepId}`)
  if (finished(result.status) && (!result.outcome || result.steps.some(item => !finished(item.status)))) {
    throw new Error('Closing work requires an outcome and no unfinished steps')
  }
  return result
}

export function prepareUpdate(current, args, newId) {
  object(args, ['action', 'workId', 'expectedRevision', 'reason', 'snapshot'])
  choice(args.action, ['create', 'replace'], 'action')
  const snapshot = parseSnapshot(args.snapshot)
  const reason = text(args.reason, 'reason')
  if (!Number.isSafeInteger(args.expectedRevision) || args.expectedRevision < 0) throw new Error('expectedRevision must be a nonnegative integer')
  const revision = current?.revision ?? 0
  if (args.expectedRevision !== revision) throw new Error(`Revision conflict: current revision is ${revision}. Call work_read before retrying.`)
  if (args.action === 'create') {
    if (args.workId !== undefined) throw new Error('create does not accept workId')
    if (current?.snapshot.status === 'active') throw new Error('Finish or cancel the active work before creating another')
    return { changed: true, work: { id: newId, revision: 1, snapshot, reason } }
  }
  if (!current || args.workId !== current.id) throw new Error('Work identity mismatch. Call work_read.')
  for (const key of ['steps', 'artifacts']) {
    const ids = new Set(snapshot[key].map(item => item.id))
    for (const old of current.snapshot[key]) if (!ids.has(old.id)) throw new Error(`Do not silently remove ${key} ID ${old.id}; keep prior records (cancel obsolete steps).`)
  }
  if (same(current.snapshot, snapshot)) return { changed: false, work: current }
  return { changed: true, work: { id: current.id, revision: revision + 1, snapshot, reason } }
}

function changes(before = [], after) {
  const prior = new Map(before.map(item => [item.id, item]))
  return after.flatMap((item, index) => {
    const old = prior.get(item.id)
    if (same(old, item) && before[index]?.id === item.id) return []
    return [{ id: item.id, title: item.content ?? item.title, status: item.status ?? item.role,
      previous: old?.status ?? old?.role ?? '', kind: old ? 'updated' : 'added' }]
  })
}

export const emptyState = (_header, inheritedEventCount = 0) => ({ current: null, history: [], inherited: false, inheritedEventCount })

export function foldWork(state, event) {
  if (event.type !== 'tool/result' || event.data.message.isError) return state
  const update = event.data.meta?.[META]
  if (update?.version !== 1 || !update.changed) return state
  const work = update.work
  if (!work || typeof work.id !== 'string' || !Number.isSafeInteger(work.revision) || work.revision < 1) return state
  try { parseSnapshot(work.snapshot); text(work.reason, 'reason') } catch { return state }
  const previous = state.current?.id === work.id ? state.current : null
  if (previous && previous.revision >= work.revision) return state
  const record = { revision: work.revision, seq: event.seq, time: event.time, reason: work.reason,
    status: work.snapshot.status, title: work.snapshot.title,
    steps: changes(previous?.snapshot.steps, work.snapshot.steps),
    artifacts: changes(previous?.snapshot.artifacts, work.snapshot.artifacts) }
  return { current: work, history: [...(previous ? state.history : []), record].slice(-HISTORY_LIMIT),
    inherited: event.seq < state.inheritedEventCount, inheritedEventCount: state.inheritedEventCount }
}

// external: DSH sessionProjections accepts parse/safeParse schemas without a Zod dependency
export const stateSchema = {
  parse(value) {
    object(value, ['current', 'history', 'inherited', 'inheritedEventCount'])
    if (!Array.isArray(value.history) || typeof value.inherited !== 'boolean'
      || !Number.isSafeInteger(value.inheritedEventCount) || value.inheritedEventCount < 0) throw new TypeError('Invalid work projection')
    if (value.current !== null) {
      const { id, revision, snapshot, reason } = value.current
      text(id, 'id'); text(reason, 'reason'); parseSnapshot(snapshot)
      if (!Number.isSafeInteger(revision) || revision < 1) throw new TypeError('Invalid revision')
    }
    for (const row of value.history) {
      if (!Number.isFinite(row.time) || !Number.isInteger(row.seq) || !Number.isInteger(row.revision)
        || typeof row.reason !== 'string' || !Array.isArray(row.steps) || !Array.isArray(row.artifacts)) throw new TypeError('Invalid revision history')
    }
    return value
  },
  safeParse(value) {
    try { return { success: true, data: this.parse(value) } } catch (error) { return { success: false, error } }
  },
}
export const definition = {
  key: KEY, stateVersion: 1, stateSchema, init: emptyState, apply: foldWork,
  wire: { viewSchema: stateSchema, view: state => state, summary: false },
}
