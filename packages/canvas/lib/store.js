export const MAX_REVISIONS = 25
export const MAX_STATE_KEYS = 200
export const MAX_STATE_JSON_BYTES = 256 * 1024

function schemaOf(parse) {
  return {
    parse,
    safeParse(value) {
      try {
        return { success: true, data: parse(value) }
      } catch (error) {
        return { success: false, error }
      }
    },
  }
}

export function normalizeSessionEntry(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('session entry must be an object')
  }
  return {
    enabled: Boolean(raw.enabled),
    cwd: typeof raw.cwd === 'string' ? raw.cwd.trim().slice(0, 1024) : '',
    activePath: typeof raw.activePath === 'string' ? raw.activePath.trim().slice(0, 1024) : '',
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0,
  }
}

export function normalizeStateEntry(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('canvas state entry must be an object')
  }
  const values = {}
  if (raw.values && typeof raw.values === 'object' && !Array.isArray(raw.values)) {
    const entries = Object.entries(raw.values).slice(0, MAX_STATE_KEYS)
    for (const [key, val] of entries) {
      if (typeof key === 'string' && key.length > 0 && key.length <= 128) values[key] = val
    }
  }
  const encoded = JSON.stringify(values)
  if (Buffer.byteLength(encoded, 'utf8') > MAX_STATE_JSON_BYTES) {
    throw new TypeError(`canvas state exceeds ${MAX_STATE_JSON_BYTES} bytes`)
  }
  return {
    values,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0,
  }
}

export function normalizeRevisionsEntry(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('canvas revisions entry must be an object')
  }
  const items = Array.isArray(raw.entries) ? raw.entries : []
  const entries = []
  for (const item of items.slice(-MAX_REVISIONS)) {
    if (!item || typeof item !== 'object') continue
    if (!Number.isSafeInteger(item.revision) || item.revision < 1) continue
    if (typeof item.source !== 'string') continue
    entries.push({
      revision: item.revision,
      time: Number.isFinite(item.time) ? item.time : 0,
      reason: typeof item.reason === 'string' ? item.reason.slice(0, 200) : '',
      source: item.source,
      errorCount: Number.isSafeInteger(item.errorCount) && item.errorCount >= 0 ? item.errorCount : 0,
    })
  }
  return {
    entries,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0,
  }
}

export function appendRevision(existing, { source, reason, errorCount, time = Date.now() }) {
  const entries = existing?.entries ? [...existing.entries] : []
  const last = entries[entries.length - 1]
  if (last && last.source === source) {
    return { changed: false, entry: existing ?? { entries, updatedAt: time } }
  }
  const nextRevision = (last?.revision ?? 0) + 1
  entries.push({
    revision: nextRevision,
    time,
    reason: typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 200) : 'Saved',
    source,
    errorCount: Number.isSafeInteger(errorCount) ? errorCount : 0,
  })
  return {
    changed: true,
    entry: {
      entries: entries.slice(-MAX_REVISIONS),
      updatedAt: time,
    },
  }
}

export const DOMAIN_SPEC = {
  name: 'canvas',
  version: 1,
  tables: {
    sessions: { valueSchema: schemaOf(normalizeSessionEntry) },
    states: { valueSchema: schemaOf(normalizeStateEntry) },
    revisions: { valueSchema: schemaOf(normalizeRevisionsEntry) },
  },
}
