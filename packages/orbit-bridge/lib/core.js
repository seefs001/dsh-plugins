/**
 * dsh-orbit-bridge — pure helpers shared by the Host half.
 *
 * Nothing here performs IO. The Host passes in one function that runs a single
 * Orbit read through the DSH tool pipeline; these helpers page, validate,
 * snapshot, and compare the results.
 */
import { createHash } from 'node:crypto'

/** Bumped when the snapshot fields or their comparison change; part of every scope digest. */
export const SNAPSHOT_FORMAT = 1
export const PAGE_LIMIT = 100
export const MAX_PAGES_PER_PROJECT = 50
export const MAX_TASKS = 2000
export const MAX_PROJECTS = 10

/** Orbit read tools the bridge itself calls, by raw MCP name. */
export const ORBIT_READS = ['get_me', 'list_task_statuses', 'list_tasks']
/** Orbit reads whose `project_id` must lie inside the open routine's projects. */
export const PROJECT_SCOPED_READS = ['list_task_statuses', 'list_tasks']

/** A failure that makes an observation partial; `kind` is shown to the user. */
export class ReadError extends Error {
  constructor(kind, message) {
    super(message)
    this.name = 'ReadError'
    this.kind = kind
  }
}

export const sha256 = text => createHash('sha256').update(text).digest('hex')

/** Stable JSON: object keys sorted, so equal values hash equally. */
export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).toSorted().map(k => `${JSON.stringify(k)}:${stableJson(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value ?? null)
}

export const isNonEmptyString = v => typeof v === 'string' && v.length > 0

/**
 * Pull the structured payload out of a canonical MCP tool value. dsh-mcp-client
 * returns `{ content, structuredContent? }`; Orbit sets `structuredContent` and
 * also mirrors it as JSON text in the first text block.
 */
export function structuredOf(value) {
  if (value !== null && typeof value === 'object' && value.structuredContent !== undefined) {
    const structured = value.structuredContent
    if (structured !== null && typeof structured === 'object' && !Array.isArray(structured)) return structured
    throw new ReadError('format', 'structuredContent is not an object')
  }
  const text = Array.isArray(value?.content) ? value.content.find(b => b?.type === 'text')?.text : undefined
  if (typeof text !== 'string') throw new ReadError('format', 'result has neither structuredContent nor a text block')
  let parsed
  try { parsed = JSON.parse(text) } catch { throw new ReadError('format', 'result text is not JSON') }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new ReadError('format', 'result JSON is not an object')
  return parsed
}

/**
 * Read every page of one list call.
 * @param read - `(args) => structured` for one Orbit call.
 * @param args - fixed arguments; `cursor` and `limit` are added per page.
 * @param onPage - receives each page's items.
 * @returns the number of pages read.
 * @throws ReadError on an invalid, empty, or repeated cursor, or past the page cap.
 */
export async function readAllPages(read, args, onPage) {
  const seen = new Set()
  let cursor = null
  for (let page = 1; ; page++) {
    if (page > MAX_PAGES_PER_PROJECT) throw new ReadError('page-limit', `more than ${MAX_PAGES_PER_PROJECT} pages`)
    const structured = await read({ ...args, limit: PAGE_LIMIT, ...cursor === null ? {} : { cursor } })
    if (!Array.isArray(structured.items)) throw new ReadError('format', 'page has no items array')
    if (!Object.hasOwn(structured, 'next_cursor')) throw new ReadError('format', 'page has no next_cursor field')
    onPage(structured.items)
    const next = structured.next_cursor
    if (next === null) return page
    if (!isNonEmptyString(next)) throw new ReadError('cursor', 'next_cursor is empty or not a string')
    if (seen.has(next) || next === cursor) throw new ReadError('cursor', 'next_cursor repeated; stopped to avoid a loop')
    seen.add(next)
    cursor = next
  }
}

const sortedIds = v => Array.isArray(v) ? [...new Set(v.filter(isNonEmptyString))].toSorted() : []
const orNull = v => v === undefined ? null : v

function requiredIds(task, field) {
  const value = task[field]
  if (!Array.isArray(value) || !value.every(isNonEmptyString)) {
    throw new ReadError('format', `task ${task.identifier ?? task.id} has no valid ${field} array`)
  }
  return [...new Set(value)].toSorted()
}

/**
 * The task fields a change is judged on. `version` is kept as evidence only.
 * Fields Orbit always returned in the live read are required; a malformed
 * task makes the observation partial instead of reading as "unchanged".
 * @throws ReadError('format') for a missing or mistyped required field.
 */
export function snapshotTask(task) {
  const label = task.identifier ?? task.id
  for (const [field, type] of [['identifier', 'string'], ['title', 'string'], ['status_id', 'string'], ['version', 'number']]) {
    if (typeof task[field] !== type || (type === 'string' && task[field] === '' && field !== 'title')) {
      throw new ReadError('format', `task ${label} has no valid ${field}`)
    }
  }
  if (task.description !== undefined && task.description !== null && typeof task.description !== 'string') {
    throw new ReadError('format', `task ${label} has a non-text description`)
  }
  return {
    identifier: task.identifier,
    url: typeof task.url === 'string' ? task.url : null,
    version: task.version,
    updatedAt: typeof task.updated_at === 'string' ? task.updated_at : null,
    fields: {
      title: task.title,
      statusId: task.status_id,
      priority: orNull(task.priority),
      assigneeIds: requiredIds(task, 'assignee_ids'),
      labelIds: requiredIds(task, 'label_ids'),
      parentTaskId: orNull(task.parent_task_id),
      milestoneId: orNull(task.milestone_id),
      cycleId: orNull(task.cycle_id),
      dueAt: orNull(task.due_at),
      dueStartAt: orNull(task.due_start_at),
      estimate: orNull(task.estimate),
      descriptionDigest: sha256(typeof task.description === 'string' ? task.description : '').slice(0, 16),
    },
  }
}

/**
 * Non-secret identity of the Orbit connection from `get_me`, and whether it
 * grants task reads on every routine project. Anything unverifiable fails.
 * @returns `{ fingerprint, summary }`.
 * @throws ReadError('grant') when the grant cannot be verified.
 */
export function identityOf(me, projectIds) {
  const userId = me?.user?.id ?? me?.service_account?.id
  const workspaceId = me?.workspace?.id
  const token = me?.token
  if (!isNonEmptyString(userId) || !isNonEmptyString(workspaceId) || token === null || typeof token !== 'object') {
    throw new ReadError('grant', 'get_me did not return a user or service account, workspace, and token')
  }
  const scopes = sortedIds(token.scopes)
  const granted = sortedIds(token.project_ids)
  if (!Array.isArray(token.scopes) || !Array.isArray(token.project_ids)) {
    throw new ReadError('grant', 'get_me did not list token scopes and project grants')
  }
  if (!scopes.includes('tasks:read')) throw new ReadError('grant', 'the connection lacks tasks:read')
  const missing = projectIds.filter(id => !granted.includes(id))
  if (missing.length > 0) throw new ReadError('grant', `the connection is not granted project(s) ${missing.join(', ')}`)
  const identity = { userId, workspaceId, tokenId: orNull(token.id), scopes, projectIds: granted }
  return {
    fingerprint: sha256(stableJson(identity)).slice(0, 24),
    summary: {
      workspace: typeof me.workspace.name === 'string' ? me.workspace.name : workspaceId,
      scopes,
      writeScopes: scopes.filter(s => s.endsWith(':write')),
      grantedProjects: granted.length,
    },
  }
}

export const scopeDigestOf = (serverName, projectIds) =>
  sha256(stableJson({ format: SNAPSHOT_FORMAT, serverName, projectIds: [...projectIds].toSorted() })).slice(0, 24)

/**
 * Observe every task of the routine's projects.
 * @param read - `(rawToolName, args) => structured`, one call through the tool pipeline.
 * @returns an Observation; `coverage` is `complete` only when every read succeeded.
 */
export async function observe(read, { serverName, projectIds }, now = () => new Date().toISOString()) {
  const startedAt = now()
  const tasks = {}
  const statuses = {}
  const readErrors = []
  let pageCount = 0
  let identity = null
  try {
    identity = identityOf(await read('get_me', {}), projectIds)
    for (const projectId of projectIds) {
      pageCount += await readAllPages(args => read('list_task_statuses', args), { project_id: projectId }, items => {
        for (const s of items) {
          if (!isNonEmptyString(s?.id) || typeof s.name !== 'string' || typeof s.category !== 'string') {
            throw new ReadError('format', 'a task status has no id, name, or category')
          }
          statuses[s.id] = { name: s.name, category: s.category }
        }
      })
      pageCount += await readAllPages(args => read('list_tasks', args), { project_id: projectId }, items => {
        for (const task of items) {
          if (!isNonEmptyString(task?.id)) throw new ReadError('format', 'a task has no id')
          if (task.project_id !== projectId) {
            throw new ReadError('scope', `task ${task.identifier ?? task.id} belongs to another project than the one requested`)
          }
          tasks[task.id] = { projectId, ...snapshotTask(task) }
          if (Object.keys(tasks).length > MAX_TASKS) throw new ReadError('task-limit', `more than ${MAX_TASKS} tasks`)
        }
      })
    }
  } catch (error) {
    readErrors.push({ kind: error instanceof ReadError ? error.kind : 'read', message: String(error?.message ?? error).slice(0, 500) })
  }
  const complete = readErrors.length === 0
  return {
    coverage: complete ? 'complete' : 'partial',
    scopeDigest: scopeDigestOf(serverName, projectIds),
    identityFingerprint: identity?.fingerprint ?? null,
    identity: identity?.summary ?? null,
    startedAt,
    completedAt: now(),
    pageCount,
    objectCount: Object.keys(tasks).length,
    // A partial read keeps counts and errors for diagnosis but never its objects.
    tasks: complete ? tasks : {},
    statuses: complete ? statuses : {},
    readErrors,
  }
}

const FIELD_ORDER = ['title', 'priority', 'assigneeIds', 'labelIds', 'parentTaskId', 'milestoneId', 'cycleId', 'dueAt', 'dueStartAt', 'estimate', 'descriptionDigest']

/** Whether a baseline observation can be compared with a new one. */
export const comparable = (base, next) => base !== null && base !== undefined
  && base.coverage === 'complete' && next.coverage === 'complete'
  && base.scopeDigest === next.scopeDigest && base.identityFingerprint === next.identityFingerprint

/**
 * Project changes between two comparable, complete observations.
 * Each change has a stable key: the same change against the same baseline
 * always produces the same key.
 */
export function diff(routineId, base, next) {
  const changes = []
  const statusName = (obs, id) => id === null ? null : obs.statuses[id]?.name ?? id
  const push = (taskId, task, kind, extra) => {
    const key = sha256(stableJson({ routineId, scope: next.scopeDigest, taskId, kind, state: extra.state ?? null })).slice(0, 16)
    const { state: _state, ...rest } = extra
    changes.push({ key, taskId, kind, identifier: task.identifier, title: task.fields.title, url: task.url, ...rest })
  }
  for (const [taskId, task] of Object.entries(next.tasks)) {
    const before = base.tasks[taskId]
    if (before === undefined) {
      push(taskId, task, 'added', { to: statusName(next, task.fields.statusId), state: task.fields })
      continue
    }
    if (before.fields.statusId !== task.fields.statusId) {
      push(taskId, task, 'status', {
        from: statusName(base, before.fields.statusId),
        to: statusName(next, task.fields.statusId),
        toCategory: task.fields.statusId === null ? null : next.statuses[task.fields.statusId]?.category ?? null,
        state: task.fields.statusId,
      })
    }
    const fields = FIELD_ORDER.filter(f => stableJson(before.fields[f]) !== stableJson(task.fields[f]))
    if (fields.length > 0) {
      push(taskId, task, 'fields', { fields, state: Object.fromEntries(fields.map(f => [f, task.fields[f]])) })
    }
  }
  for (const [taskId, task] of Object.entries(base.tasks)) {
    if (next.tasks[taskId] === undefined) push(taskId, task, 'missing', { state: null })
  }
  return changes
}

/** A plain-language, program-generated summary of a change list. */
export function programSummary(changes) {
  const count = kind => changes.filter(c => c.kind === kind).length
  return {
    added: count('added'),
    status: count('status'),
    fields: count('fields'),
    missing: count('missing'),
  }
}
