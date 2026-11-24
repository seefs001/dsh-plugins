import { execFile } from 'node:child_process'
import { watch } from 'node:fs'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const MAX_DATA_FILE_BYTES = 512 * 1024
export const MAX_GLOB_FILES = 200
export const MAX_GLOB_DEPTH = 6

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'out',
  '.next',
  'build',
  'target',
  '.turbo',
  '.cache',
  'coverage',
  '.pnpm-store',
  '.venv',
  'venv',
  '__pycache__',
])

export function getDshHomeDir() {
  const envHome = process.env.DSH_HOME
  if (typeof envHome === 'string' && envHome.trim()) return resolve(envHome.trim())
  return join(homedir(), '.dsh')
}

export function getBotsRootDir() {
  return join(getDshHomeDir(), 'bots')
}

export function isWithinOrEqual(rootDir, targetPath) {
  const root = resolve(rootDir)
  const target = resolve(targetPath)
  const rel = relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

export function parseDataUri(uri, cwd = '') {
  if (typeof uri !== 'string' || !uri.trim() || uri.includes('\0')) {
    throw new Error('Data URI must be a non-empty string.')
  }
  const raw = uri.trim()
  if (raw.startsWith('bots://')) {
    const sub = raw.slice('bots://'.length).replace(/^\/+/, '')
    const root = getBotsRootDir()
    const full = resolve(root, sub)
    if (!isWithinOrEqual(root, full)) throw new Error('Data URI escapes bots root directory.')
    return { scheme: 'bots', root, rel: relative(root, full), full }
  }
  if (raw.startsWith('workspace://')) {
    if (!cwd || !isAbsolute(cwd)) throw new Error('Workspace directory (cwd) is unavailable for workspace:// URI.')
    const sub = raw.slice('workspace://'.length).replace(/^\/+/, '')
    const root = resolve(cwd)
    const full = resolve(root, sub)
    if (!isWithinOrEqual(root, full)) throw new Error('Data URI escapes workspace directory.')
    return { scheme: 'workspace', root, rel: relative(root, full), full }
  }
  throw new Error('Data URI must start with "workspace://" or "bots://".')
}

function parseScalar(raw) {
  const v = raw.trim()
  if (v === '' || v === 'null' || v === '~') return null
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v)
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1)
  }
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map(part => parseScalar(part))
  }
  return v
}

export function parseMarkdownFrontmatter(raw) {
  const text = String(raw ?? '')
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)
  if (!match) return { frontmatter: {}, content: text }
  const block = match[1]
  const content = text.slice(match[0].length)
  const frontmatter = {}
  let currentListKey = null
  for (const line of block.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const listItem = /^\s+-\s+(.*)$/.exec(line)
    if (listItem && currentListKey) {
      if (!Array.isArray(frontmatter[currentListKey])) frontmatter[currentListKey] = []
      frontmatter[currentListKey].push(parseScalar(listItem[1]))
      continue
    }
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line)
    if (kv) {
      const key = kv[1]
      const val = kv[2].trim()
      if (val === '') {
        frontmatter[key] = []
        currentListKey = key
      } else {
        frontmatter[key] = parseScalar(val)
        currentListKey = null
      }
    }
  }
  return { frontmatter, content }
}

function detectParseMode(filePath, requested) {
  if (requested && requested !== 'auto') return requested
  if (filePath.endsWith('.json')) return 'json'
  if (filePath.endsWith('.jsonl')) return 'lines'
  if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) return 'markdown'
  return 'text'
}

function parseContentByMode(raw, mode) {
  if (mode === 'json') {
    return { data: JSON.parse(raw), content: raw, frontmatter: null }
  }
  if (mode === 'lines') {
    const rows = raw.split(/\r?\n/).filter(Boolean).map(line => {
      try { return JSON.parse(line) } catch { return line }
    })
    return { data: rows, content: raw, frontmatter: null }
  }
  if (mode === 'markdown') {
    const parsed = parseMarkdownFrontmatter(raw)
    return { data: parsed.frontmatter, content: parsed.content, frontmatter: parsed.frontmatter }
  }
  return { data: raw, content: raw, frontmatter: null }
}

export async function readCanvasDataFile(uri, options = {}) {
  const { cwd = '', parse = 'auto' } = options
  let resolved
  try {
    resolved = parseDataUri(uri, cwd)
  } catch (error) {
    return { ok: false, uri, exists: false, data: null, content: '', frontmatter: null, error: error.message }
  }
  try {
    const info = await stat(resolved.full)
    if (!info.isFile()) {
      return { ok: false, uri, exists: false, data: null, content: '', frontmatter: null, error: 'Target is not a file.' }
    }
    if (info.size > MAX_DATA_FILE_BYTES) {
      return { ok: false, uri, exists: true, data: null, content: '', frontmatter: null, error: `File exceeds ${MAX_DATA_FILE_BYTES} bytes.` }
    }
    const raw = await readFile(resolved.full, 'utf8')
    const mode = detectParseMode(resolved.full, parse)
    const parsed = parseContentByMode(raw, mode)
    return {
      ok: true,
      uri,
      exists: true,
      path: resolved.full,
      relativePath: resolved.rel.replaceAll('\\', '/'),
      mtimeMs: info.mtimeMs,
      size: info.size,
      data: parsed.data,
      content: parsed.content,
      frontmatter: parsed.frontmatter,
      error: '',
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { ok: true, uri, exists: false, path: resolved.full, relativePath: resolved.rel.replaceAll('\\', '/'), mtimeMs: 0, size: 0, data: null, content: '', frontmatter: null, error: '' }
    }
    return { ok: false, uri, exists: false, data: null, content: '', frontmatter: null, error: error?.message ?? String(error) }
  }
}

function globToRegExp(glob) {
  let out = '^'
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i]
    if (ch === '*') {
      if (glob[i + 1] === '*') {
        if (glob[i + 2] === '/') {
          out += '(?:.*/)?'
          i += 2
        } else {
          out += '.*'
          i += 1
        }
      } else {
        out += '[^/]*'
      }
    } else if (ch === '?') {
      out += '[^/]'
    } else if ('\\^$.|+()[]{}'.includes(ch)) {
      out += `\\${ch}`
    } else {
      out += ch
    }
  }
  out += '$'
  return new RegExp(out)
}

function staticPrefixOfGlob(relPattern) {
  const parts = relPattern.split('/').filter(Boolean)
  const prefix = []
  for (const part of parts) {
    if (part.includes('*') || part.includes('?')) break
    prefix.push(part)
  }
  return prefix.join('/')
}

async function walkMatchingFiles(root, dir, depth, regex, out, limit) {
  if (depth > MAX_GLOB_DEPTH || out.length >= limit) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  entries.sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    if (out.length >= limit) return
    const full = join(dir, entry.name)
    const rel = relative(root, full).replaceAll('\\', '/')
    if (entry.isFile()) {
      if (regex.test(rel)) out.push({ full, rel })
    } else if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      await walkMatchingFiles(root, full, depth + 1, regex, out, limit)
    }
  }
}

export async function globCanvasData(pattern, options = {}) {
  const { cwd = '', parse = 'auto', limit = 100 } = options
  const cap = Math.max(1, Math.min(MAX_GLOB_FILES, Number(limit) || 100))
  let scheme = ''
  let root = ''
  let relPattern = ''
  if (typeof pattern === 'string' && pattern.startsWith('bots://')) {
    scheme = 'bots'
    root = getBotsRootDir()
    relPattern = pattern.slice('bots://'.length).replace(/^\/+/, '')
  } else if (typeof pattern === 'string' && pattern.startsWith('workspace://')) {
    if (!cwd || !isAbsolute(cwd)) {
      return { ok: false, pattern, files: [], error: 'Workspace directory (cwd) is unavailable.' }
    }
    scheme = 'workspace'
    root = resolve(cwd)
    relPattern = pattern.slice('workspace://'.length).replace(/^\/+/, '')
  } else {
    return { ok: false, pattern, files: [], error: 'Glob pattern must start with "workspace://" or "bots://".' }
  }

  if (!relPattern || relPattern.includes('..') || relPattern.includes('\0')) {
    return { ok: false, pattern, files: [], error: 'Invalid glob pattern.' }
  }

  const startPrefix = staticPrefixOfGlob(relPattern)
  const startDir = startPrefix ? resolve(root, startPrefix) : root
  if (!isWithinOrEqual(root, startDir)) {
    return { ok: false, pattern, files: [], error: 'Glob pattern escapes allowed root.' }
  }

  const regex = globToRegExp(relPattern)
  const matched = []
  await walkMatchingFiles(root, startDir, 0, regex, matched, cap)

  const files = []
  for (const item of matched) {
    const uri = `${scheme}://${item.rel}`
    const res = await readCanvasDataFile(uri, { cwd, parse })
    if (res.ok && res.exists) files.push(res)
  }
  return { ok: true, pattern, files, error: '' }
}

const ALLOWED_BOT_WRITE_RE = /^[a-z0-9][a-z0-9_-]{0,63}\/ledger\/[a-zA-Z0-9_./-]+\.(?:json|md)$/
const ALLOWED_WORKSPACE_WRITE_RE = /^\.dsh\/canvas-data\/[a-zA-Z0-9_./-]+\.(?:json|md)$/

export function isWritableDataUri(uri, cwd = '') {
  try {
    const parsed = parseDataUri(uri, cwd)
    const rel = parsed.rel.replaceAll('\\', '/')
    if (rel.includes('..')) return false
    if (parsed.scheme === 'bots') return ALLOWED_BOT_WRITE_RE.test(rel)
    if (parsed.scheme === 'workspace') return ALLOWED_WORKSPACE_WRITE_RE.test(rel)
    return false
  } catch {
    return false
  }
}

export async function patchCanvasDataFile(uri, payload, options = {}) {
  const { cwd = '' } = options
  if (!isWritableDataUri(uri, cwd)) {
    throw new Error('Write denied: patchData only allows bots://<bot>/ledger/*.{json,md} or workspace://.dsh/canvas-data/*.{json,md}.')
  }
  const resolved = parseDataUri(uri, cwd)
  const mode = payload?.mode ?? 'merge'
  await mkdir(dirname(resolved.full), { recursive: true })

  if (resolved.full.endsWith('.md')) {
    const content = typeof payload?.content === 'string' ? payload.content : ''
    if (Buffer.byteLength(content, 'utf8') > MAX_DATA_FILE_BYTES) {
      throw new Error(`Payload exceeds ${MAX_DATA_FILE_BYTES} bytes.`)
    }
    await writeFile(resolved.full, content, 'utf8')
    return readCanvasDataFile(uri, { cwd, parse: 'markdown' })
  }

  let current = {}
  try {
    const raw = await readFile(resolved.full, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') current = parsed
  } catch {}

  let next
  if (mode === 'replace') {
    next = payload?.value ?? payload?.patch ?? {}
  } else if (mode === 'upsertItem' && payload?.item && typeof payload.item === 'object') {
    const listKey = typeof payload.listKey === 'string' && payload.listKey ? payload.listKey : 'items'
    const idKey = typeof payload.idKey === 'string' && payload.idKey ? payload.idKey : 'id'
    const list = Array.isArray(current[listKey]) ? [...current[listKey]] : []
    const targetId = payload.item[idKey]
    const idx = targetId !== undefined ? list.findIndex(row => row && row[idKey] === targetId) : -1
    if (idx >= 0) list[idx] = { ...list[idx], ...payload.item }
    else list.push(payload.item)
    next = { ...current, [listKey]: list, updatedAt: new Date().toISOString() }
  } else if (mode === 'removeItem' && payload?.id !== undefined) {
    const listKey = typeof payload.listKey === 'string' && payload.listKey ? payload.listKey : 'items'
    const idKey = typeof payload.idKey === 'string' && payload.idKey ? payload.idKey : 'id'
    const list = Array.isArray(current[listKey]) ? current[listKey].filter(row => !row || row[idKey] !== payload.id) : []
    next = { ...current, [listKey]: list, updatedAt: new Date().toISOString() }
  } else {
    const patch = payload?.patch && typeof payload.patch === 'object' ? payload.patch : {}
    next = { ...current, ...patch, updatedAt: new Date().toISOString() }
  }

  const serialized = `${JSON.stringify(next, null, 2)}\n`
  if (Buffer.byteLength(serialized, 'utf8') > MAX_DATA_FILE_BYTES) {
    throw new Error(`Resulting JSON exceeds ${MAX_DATA_FILE_BYTES} bytes.`)
  }
  await writeFile(resolved.full, serialized, 'utf8')
  return readCanvasDataFile(uri, { cwd, parse: 'json' })
}

export async function readGitHostData(cwd) {
  if (!cwd || !isAbsolute(cwd)) return { isGit: false, branch: '', dirtyCount: 0, files: [], worktrees: [] }
  try {
    const [{ stdout: statusOut }, { stdout: wtOut }] = await Promise.all([
      execFileAsync('git', ['status', '--porcelain=v1', '-b'], { cwd, timeout: 4000, maxBuffer: 256 * 1024 }),
      execFileAsync('git', ['worktree', 'list', '--porcelain'], { cwd, timeout: 4000, maxBuffer: 256 * 1024 }).catch(() => ({ stdout: '' })),
    ])
    const lines = statusOut.split(/\r?\n/).filter(Boolean)
    let branch = ''
    const files = []
    for (const line of lines) {
      if (line.startsWith('## ')) {
        branch = line.slice(3).split('...')[0].trim()
      } else if (files.length < 60) {
        files.push({ status: line.slice(0, 2).trim() || 'M', path: line.slice(3).trim() })
      }
    }
    const worktrees = []
    let current = null
    for (const line of wtOut.split(/\r?\n/)) {
      if (line.startsWith('worktree ')) {
        if (current) worktrees.push(current)
        current = { path: line.slice(9).trim(), branch: '', head: '' }
      } else if (current && line.startsWith('HEAD ')) {
        current.head = line.slice(5).trim().slice(0, 12)
      } else if (current && line.startsWith('branch ')) {
        current.branch = line.slice(7).replace(/^refs\/heads\//, '').trim()
      }
    }
    if (current) worktrees.push(current)
    return {
      isGit: true,
      branch,
      dirtyCount: Math.max(0, lines.length - (lines[0]?.startsWith('## ') ? 1 : 0)),
      files,
      worktrees,
    }
  } catch {
    return { isGit: false, branch: '', dirtyCount: 0, files: [], worktrees: [] }
  }
}

export function createDataDirectoryWatcher(onChange) {
  const watched = new Map()
  let timer = null
  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      onChange()
    }, 220)
  }

  return {
    sync(dirs) {
      const next = new Set(dirs.filter(d => typeof d === 'string' && d))
      for (const [dir, handle] of watched) {
        if (!next.has(dir)) {
          try { handle.close() } catch {}
          watched.delete(dir)
        }
      }
      for (const dir of next) {
        if (watched.has(dir)) continue
        try {
          const handle = watch(dir, { persistent: false, recursive: process.platform === 'darwin' || process.platform === 'win32' }, schedule)
          handle.on('error', () => {
            try { handle.close() } catch {}
            watched.delete(dir)
          })
          watched.set(dir, handle)
        } catch {}
      }
    },
    close() {
      clearTimeout(timer)
      for (const handle of watched.values()) {
        try { handle.close() } catch {}
      }
      watched.clear()
    },
  }
}
