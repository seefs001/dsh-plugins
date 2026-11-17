/** Host-persisted preferences and observed, successful skill loads. */
export const isSkillName = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)

export class InputError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InputError'
  }
}

function parseState(value) {
  if (!value || !Array.isArray(value.pinned) || !value.pinned.every(isSkillName)
    || !value.counts || typeof value.counts !== 'object' || Array.isArray(value.counts)) {
    throw new TypeError('Invalid cheat-sheet state')
  }
  const entries = Object.entries(value.counts)
  if (entries.some(([name, count]) => !isSkillName(name) || !Number.isSafeInteger(count) || count < 0)) {
    throw new TypeError('Invalid cheat-sheet usage counts')
  }
  return { pinned: [...new Set(value.pinned)], counts: Object.fromEntries(entries) }
}

const schema = {
  parse: parseState,
  safeParse(value) {
    try { return { success: true, data: parseState(value) } } catch (error) { return { success: false, error } }
  },
}

export const DOMAIN_SPEC = {
  name: 'cheat_sheet', version: 1,
  global: { schema, initial: { pinned: [], counts: {} } },
  tables: {},
}

export function setPinned(state, name, pinned) {
  if (!isSkillName(name)) throw new InputError('name must be a valid skill name')
  if (typeof pinned !== 'boolean') throw new InputError('pinned must be a boolean')
  if (state.pinned.includes(name) === pinned) return state
  return { ...state, pinned: pinned ? [...state.pinned, name] : state.pinned.filter(item => item !== name) }
}

export function recordUse(state, name) {
  if (!isSkillName(name)) return state
  const count = Object.hasOwn(state.counts, name) ? state.counts[name] : 0
  if (count === Number.MAX_SAFE_INTEGER) return state
  return { ...state, counts: { ...state.counts, [name]: count + 1 } }
}

/** A committed explicit /name injection, not merely text mentioning /name. */
export function explicitSkill(event) {
  if (event.type !== 'user/message' || (event.surfaceOp !== undefined && event.surfaceOp !== 'append')) return undefined
  const source = event.data.source
  return source?.kind === 'skill-invocation' && isSkillName(source.name) ? source.name : undefined
}

/** Final successful tool value from the native skill tool, including nested codemode calls. */
export function loadedSkill(exec, result) {
  return exec.name === 'skill' && result.isError === false && isSkillName(result.value?.name)
    ? result.value.name : undefined
}
