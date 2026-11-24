export const MAX_FAVORITES = 200
export const MAX_ID_LENGTH = 200
export const ACTIONS = ['list', 'add', 'remove', 'toggle', 'move', 'reorder', 'clear']

export class OpError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpError'
  }
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)

const isId = value => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_ID_LENGTH

export const favoriteKey = (provider, model) => `${provider}\0${model}`

export function normalizeEntry(raw) {
  if (!isRecord(raw) || !isId(raw.provider) || !isId(raw.model)) return null
  return { provider: raw.provider.trim(), model: raw.model.trim() }
}

export function normalizeState(raw) {
  if (raw === null || typeof raw !== 'object' || !Array.isArray(raw.favorites)) {
    throw new TypeError('model favorites state must be an object with a favorites array')
  }
  const seen = new Set()
  const favorites = []
  for (const item of raw.favorites) {
    const clean = normalizeEntry(item)
    if (!clean) continue
    const key = favoriteKey(clean.provider, clean.model)
    if (seen.has(key)) continue
    seen.add(key)
    favorites.push(clean)
    if (favorites.length >= MAX_FAVORITES) break
  }
  return { version: 1, favorites }
}

export const STATE_SCHEMA = {
  parse: normalizeState,
  safeParse(value) {
    try { return { success: true, data: normalizeState(value) } } catch (error) { return { success: false, error } }
  },
}

export const DOMAIN_SPEC = {
  name: 'model_favorites',
  version: 1,
  global: { schema: STATE_SCHEMA, initial: { version: 1, favorites: [] } },
  tables: {},
}

function requireEntry(op) {
  const entry = normalizeEntry(op)
  if (!entry) throw new OpError('provider and model must be non-empty strings')
  return entry
}

const indexOfEntry = (favorites, entry) => favorites.findIndex(
  item => item.provider === entry.provider && item.model === entry.model,
)

export function applyOp(state, op) {
  if (!isRecord(op) || typeof op.action !== 'string') {
    throw new OpError(`action must be one of ${ACTIONS.join(', ')}`)
  }
  switch (op.action) {
    case 'list':
      return { state, result: {} }
    case 'add': {
      const entry = requireEntry(op)
      if (indexOfEntry(state.favorites, entry) >= 0) {
        return { state, result: { favorited: true } }
      }
      if (state.favorites.length >= MAX_FAVORITES) {
        throw new OpError(`at most ${MAX_FAVORITES} favorite models`)
      }
      return {
        state: { ...state, favorites: [...state.favorites, entry] },
        result: { favorited: true },
      }
    }
    case 'remove': {
      const entry = requireEntry(op)
      const index = indexOfEntry(state.favorites, entry)
      if (index < 0) return { state, result: { favorited: false } }
      return {
        state: { ...state, favorites: state.favorites.toSpliced(index, 1) },
        result: { favorited: false },
      }
    }
    case 'toggle': {
      const entry = requireEntry(op)
      const index = indexOfEntry(state.favorites, entry)
      if (index >= 0) {
        return {
          state: { ...state, favorites: state.favorites.toSpliced(index, 1) },
          result: { favorited: false },
        }
      }
      if (state.favorites.length >= MAX_FAVORITES) {
        throw new OpError(`at most ${MAX_FAVORITES} favorite models`)
      }
      return {
        state: { ...state, favorites: [...state.favorites, entry] },
        result: { favorited: true },
      }
    }
    case 'move': {
      const entry = requireEntry(op)
      const index = indexOfEntry(state.favorites, entry)
      if (index < 0) throw new OpError(`model "${entry.provider}/${entry.model}" is not in favorites`)
      let target = index
      if (op.direction === 'up') target = Math.max(0, index - 1)
      else if (op.direction === 'down') target = Math.min(state.favorites.length - 1, index + 1)
      else if (Number.isInteger(op.toIndex)) target = Math.max(0, Math.min(state.favorites.length - 1, op.toIndex))
      else throw new OpError('move requires direction ("up" | "down") or integer toIndex')
      if (target === index) return { state, result: {} }
      const next = state.favorites.slice()
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return { state: { ...state, favorites: next }, result: {} }
    }
    case 'reorder': {
      if (!Array.isArray(op.favorites)) throw new OpError('favorites must be an array')
      const seen = new Set()
      const next = []
      for (const item of op.favorites) {
        const clean = normalizeEntry(item)
        if (!clean) throw new OpError('each favorite must have non-empty provider and model')
        const key = favoriteKey(clean.provider, clean.model)
        if (seen.has(key)) continue
        seen.add(key)
        next.push(clean)
        if (next.length >= MAX_FAVORITES) break
      }
      const unchanged = next.length === state.favorites.length
        && next.every((item, i) => item.provider === state.favorites[i].provider && item.model === state.favorites[i].model)
      if (unchanged) return { state, result: {} }
      return { state: { ...state, favorites: next }, result: {} }
    }
    case 'clear': {
      if (state.favorites.length === 0) return { state, result: {} }
      return { state: { ...state, favorites: [] }, result: {} }
    }
    default:
      throw new OpError(`action must be one of ${ACTIONS.join(', ')}`)
  }
}
