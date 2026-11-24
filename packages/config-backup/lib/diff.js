import { isDeepStrictEqual } from 'node:util'

export const HOME_TOKEN = '{{$HOME}}'
const MASKED = '••••••'
const MAX_DIFF_ENTRIES = 80
const MAX_TEXT_DIFF_LINES = 80

export function isPlainObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function deepEqual(a, b) {
  return isDeepStrictEqual(a, b)
}

export function mergeLayers(under, over) {
  if (!isPlainObject(under) || !isPlainObject(over)) return structuredClone(over)
  const merged = structuredClone(under)
  for (const [key, value] of Object.entries(over)) {
    if (value === undefined) continue
    merged[key] = Object.hasOwn(merged, key) ? mergeLayers(merged[key], value) : structuredClone(value)
  }
  return merged
}

export function normalizeHomePaths(value, homeDir) {
  if (!homeDir) return value
  const cleanHome = homeDir.replace(/[\\/]+$/, '')
  if (!cleanHome) return value
  const walk = node => {
    if (typeof node === 'string') {
      if (node === cleanHome) return HOME_TOKEN
      if (node.startsWith(`${cleanHome}/`) || node.startsWith(`${cleanHome}\\`)) {
        return `${HOME_TOKEN}${node.slice(cleanHome.length)}`
      }
      return node
    }
    if (Array.isArray(node)) return node.map(walk)
    if (isPlainObject(node)) {
      const out = {}
      for (const [key, entry] of Object.entries(node)) out[key] = walk(entry)
      return out
    }
    return node
  }
  return walk(value)
}

export function expandHomePaths(value, homeDir) {
  if (!homeDir) return value
  const cleanHome = homeDir.replace(/[\\/]+$/, '')
  if (!cleanHome) return value
  const walk = node => {
    if (typeof node === 'string') {
      if (node === HOME_TOKEN) return cleanHome
      if (node.startsWith(`${HOME_TOKEN}/`) || node.startsWith(`${HOME_TOKEN}\\`)) {
        return `${cleanHome}${node.slice(HOME_TOKEN.length)}`
      }
      return node
    }
    if (Array.isArray(node)) return node.map(walk)
    if (isPlainObject(node)) {
      const out = {}
      for (const [key, entry] of Object.entries(node)) out[key] = walk(entry)
      return out
    }
    return node
  }
  return walk(value)
}

export function collectSecretPaths(schema, value) {
  const paths = []
  const walk = (node, current, path) => {
    if (!node) return
    if (node.meta?.role === 'secret') {
      if (current !== undefined) paths.push(path)
      return
    }
    switch (node.type) {
      case 'object': {
        const dict = node.dict ?? {}
        if (!isPlainObject(current)) return
        for (const [key, child] of Object.entries(dict)) {
          walk(child, current[key], [...path, key])
        }
        return
      }
      case 'dict': {
        if (!isPlainObject(current)) return
        for (const [key, entry] of Object.entries(current)) {
          walk(node.inner, entry, [...path, key])
        }
        return
      }
      case 'array': {
        if (!Array.isArray(current)) return
        current.forEach((entry, index) => walk(node.inner, entry, [...path, String(index)]))
        return
      }
      case 'union':
      case 'intersect': {
        for (const child of node.list ?? []) walk(child, current, path)
        return
      }
      case 'transform': {
        walk(node.inner, current, path)
        return
      }
      default:
        return
    }
  }
  walk(schema, value, [])
  const unique = new Map()
  for (const path of paths) unique.set(JSON.stringify(path), path)
  return [...unique.values()]
}

function deleteAtPath(root, path) {
  if (path.length === 0) return undefined
  const [head, ...rest] = path
  if (Array.isArray(root)) {
    const idx = Number(head)
    if (!Number.isInteger(idx) || idx < 0 || idx >= root.length) return root
    const next = [...root]
    if (rest.length === 0) next[idx] = undefined
    else next[idx] = deleteAtPath(root[idx], rest)
    return next
  }
  if (!isPlainObject(root) || !Object.hasOwn(root, head)) return root
  const next = { ...root }
  if (rest.length === 0) delete next[head]
  else {
    const child = deleteAtPath(root[head], rest)
    if (child === undefined) delete next[head]
    else next[head] = child
  }
  return next
}

export function getAtPath(root, path) {
  let cursor = root
  for (const segment of path) {
    if (cursor === null || cursor === undefined) return undefined
    if (Array.isArray(cursor)) {
      const idx = Number(segment)
      if (!Number.isInteger(idx) || idx < 0 || idx >= cursor.length) return undefined
      cursor = cursor[idx]
    } else if (isPlainObject(cursor) && Object.hasOwn(cursor, segment)) {
      cursor = cursor[segment]
    } else {
      return undefined
    }
  }
  return cursor
}

export function setAtPath(root, path, value) {
  if (path.length === 0) return value
  const [head, ...rest] = path
  if (Array.isArray(root)) {
    const idx = Number(head)
    if (!Number.isInteger(idx) || idx < 0 || idx >= root.length) return root
    const next = [...root]
    next[idx] = rest.length === 0 ? value : setAtPath(root[idx], rest, value)
    return next
  }
  const next = isPlainObject(root) ? { ...root } : {}
  next[head] = rest.length === 0 ? value : setAtPath(next[head], rest, value)
  return next
}

export function stripSecretsBySchema(schema, value) {
  const secretPaths = collectSecretPaths(schema, value)
  let cleaned = structuredClone(value)
  for (const path of secretPaths) {
    cleaned = deleteAtPath(cleaned, path)
  }
  return {
    value: cleaned === undefined ? {} : cleaned,
    secretPaths,
  }
}

export function restorePreservedSecrets(nextValue, currentValue, secretPaths) {
  let merged = structuredClone(nextValue)
  let preservedCount = 0
  for (const path of secretPaths ?? []) {
    if (!Array.isArray(path) || path.length === 0) continue
    if (getAtPath(merged, path) !== undefined) continue
    const existing = getAtPath(currentValue, path)
    if (existing !== undefined) {
      merged = setAtPath(merged, path, structuredClone(existing))
      preservedCount++
    }
  }
  return { value: merged, preservedCount }
}

function summarizeLeaf(value, isSecret) {
  if (isSecret) return MASKED
  if (value === undefined) return undefined
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    if (value.length <= 96) return JSON.stringify(value)
    return `${JSON.stringify(value.slice(0, 92))}… (${value.length} chars)`
  }
  if (Array.isArray(value)) {
    const json = JSON.stringify(value)
    if (json.length <= 96) return json
    return `[${value.length} items]`
  }
  const json = JSON.stringify(value)
  if (json.length <= 96) return json
  return `{${Object.keys(value).length} keys}`
}

export function diffValues(before, after, secretPaths = []) {
  const secretSet = new Set(secretPaths.map(path => path.join('.')))
  const changes = []
  let truncated = 0

  const record = entry => {
    if (changes.length < MAX_DIFF_ENTRIES) changes.push(entry)
    else truncated++
  }

  const walk = (left, right, path) => {
    if (deepEqual(left, right)) return
    const joined = path.join('.')
    const isSecret = secretSet.has(joined)
    if (isPlainObject(left) && isPlainObject(right)) {
      const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].toSorted()
      for (const key of keys) {
        const hasLeft = Object.hasOwn(left, key)
        const hasRight = Object.hasOwn(right, key)
        const childPath = [...path, key]
        const childJoined = childPath.join('.')
        const childSecret = secretSet.has(childJoined)
        if (!hasLeft && hasRight) {
          record({
            path: childJoined,
            kind: 'add',
            after: summarizeLeaf(right[key], childSecret),
          })
        } else if (hasLeft && !hasRight) {
          record({
            path: childJoined,
            kind: 'remove',
            before: summarizeLeaf(left[key], childSecret),
          })
        } else {
          walk(left[key], right[key], childPath)
        }
      }
      return
    }
    if (left === undefined) {
      record({ path: joined || '$', kind: 'add', after: summarizeLeaf(right, isSecret) })
    } else if (right === undefined) {
      record({ path: joined || '$', kind: 'remove', before: summarizeLeaf(left, isSecret) })
    } else {
      record({
        path: joined || '$',
        kind: 'change',
        before: summarizeLeaf(left, isSecret),
        after: summarizeLeaf(right, isSecret),
      })
    }
  }

  walk(before, after, [])
  return { changes, truncated }
}

export function diffTables(beforeTables, afterTables, mode = 'merge') {
  const tableNames = [...new Set([...Object.keys(beforeTables ?? {}), ...Object.keys(afterTables ?? {})])].toSorted()
  const details = []
  let added = 0
  let modified = 0
  let removed = 0
  for (const table of tableNames) {
    const left = beforeTables?.[table] ?? {}
    const right = afterTables?.[table] ?? {}
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].toSorted()
    const tableChanges = []
    for (const key of keys) {
      const hasLeft = Object.hasOwn(left, key)
      const hasRight = Object.hasOwn(right, key)
      if (!hasLeft && hasRight) {
        added++
        if (tableChanges.length < MAX_DIFF_ENTRIES) {
          tableChanges.push({ path: `${table}.${key}`, kind: 'add', after: summarizeLeaf(right[key], false) })
        }
      } else if (hasLeft && !hasRight) {
        if (mode === 'replace') {
          removed++
          if (tableChanges.length < MAX_DIFF_ENTRIES) {
            tableChanges.push({ path: `${table}.${key}`, kind: 'remove', before: summarizeLeaf(left[key], false) })
          }
        }
      } else if (!deepEqual(left[key], right[key])) {
        modified++
        if (tableChanges.length < MAX_DIFF_ENTRIES) {
          tableChanges.push({
            path: `${table}.${key}`,
            kind: 'change',
            before: summarizeLeaf(left[key], false),
            after: summarizeLeaf(right[key], false),
          })
        }
      }
    }
    if (tableChanges.length > 0) details.push(...tableChanges)
  }
  return { added, modified, removed, changes: details.slice(0, MAX_DIFF_ENTRIES), truncated: Math.max(0, details.length - MAX_DIFF_ENTRIES) }
}

export function diffText(before, after) {
  const left = (before ?? '').split('\n')
  const right = (after ?? '').split('\n')
  if (before === after) return { added: 0, removed: 0, lines: [], truncated: 0 }
  let added = 0
  let removed = 0
  const lines = []
  let i = 0
  let j = 0
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      i++
      j++
      continue
    }
    const lookRight = i < left.length ? right.indexOf(left[i], j + 1) : -1
    const lookLeft = j < right.length ? left.indexOf(right[j], i + 1) : -1
    if (lookRight !== -1 && (lookLeft === -1 || lookRight - j <= lookLeft - i) && lookRight - j <= 8) {
      while (j < lookRight) {
        added++
        lines.push({ kind: 'add', line: right[j] })
        j++
      }
    } else if (lookLeft !== -1 && lookLeft - i <= 8) {
      while (i < lookLeft) {
        removed++
        lines.push({ kind: 'remove', line: left[i] })
        i++
      }
    } else {
      if (i < left.length) {
        removed++
        lines.push({ kind: 'remove', line: left[i] })
        i++
      }
      if (j < right.length) {
        added++
        lines.push({ kind: 'add', line: right[j] })
        j++
      }
    }
  }
  return {
    added,
    removed,
    lines: lines.slice(0, MAX_TEXT_DIFF_LINES),
    truncated: Math.max(0, lines.length - MAX_TEXT_DIFF_LINES),
  }
}
