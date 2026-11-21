import { watch } from 'node:fs'
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

export const CANVAS_EXT = '.canvas.tsx'
export const DEFAULT_DIR = '.dsh/canvases'
export const MAX_CANVASES = 50

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

export function isWithinDirectory(rootDir, targetPath) {
  const root = resolve(rootDir)
  const target = resolve(targetPath)
  const rel = relative(root, target)
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

export function normalizeSlug(name) {
  const raw = String(name ?? '')
    .trim()
    .replace(/\.canvas\.tsx$/i, '')
    .replace(/\.tsx$/i, '')
  const cleaned = raw
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)
  return cleaned || 'untitled'
}

export function resolveCanvasPath(cwd, inputPath) {
  if (typeof cwd !== 'string' || !cwd.trim() || !isAbsolute(cwd)) {
    throw new Error('Workspace directory (cwd) must be an absolute path.')
  }
  const root = resolve(cwd)
  const raw = typeof inputPath === 'string' ? inputPath.trim() : ''
  if (!raw || raw.includes('\0')) throw new Error('Canvas path or name is required.')

  let target
  if (isAbsolute(raw)) {
    target = resolve(raw)
  } else if (raw.includes('/') || raw.includes('\\') || (raw.includes('.') && !raw.endsWith(CANVAS_EXT))) {
    target = resolve(root, raw)
  } else {
    target = resolve(root, DEFAULT_DIR, `${normalizeSlug(raw)}${CANVAS_EXT}`)
  }

  if (!target.endsWith(CANVAS_EXT)) {
    throw new Error(`Canvas file must end with "${CANVAS_EXT}".`)
  }
  if (!isWithinDirectory(root, target)) {
    throw new Error('Canvas path must stay within the session workspace directory.')
  }
  return target
}

export function deriveTitle(filePath, source = '') {
  const h1 = /<H1[^>]*>([^<{]+)<\/H1>/.exec(source)
  if (h1?.[1]?.trim()) return h1[1].trim().slice(0, 80)
  const stem = basename(filePath, CANVAS_EXT)
  return stem
    .split(/[-_]+/)
    .filter(Boolean)
    .map(part => (part === part.toUpperCase() ? part : part[0].toUpperCase() + part.slice(1)))
    .join(' ') || stem
}

async function scanDir(dir, depth, maxDepth, found) {
  if (depth > maxDepth || found.length >= MAX_CANVASES) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  entries.sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    if (found.length >= MAX_CANVASES) return
    const full = join(dir, entry.name)
    if (entry.isFile() && entry.name.endsWith(CANVAS_EXT)) {
      found.push(full)
    } else if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      if (entry.name.startsWith('.') && entry.name !== '.dsh') continue
      await scanDir(full, depth + 1, maxDepth, found)
    }
  }
}

export async function discoverCanvasFiles(cwd) {
  if (typeof cwd !== 'string' || !cwd.trim() || !isAbsolute(cwd)) return []
  const root = resolve(cwd)
  const found = []
  const seen = new Set()

  const defaultDir = join(root, DEFAULT_DIR)
  try {
    const entries = await readdir(defaultDir, { withFileTypes: true })
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(CANVAS_EXT)) {
        const full = join(defaultDir, entry.name)
        seen.add(full)
        found.push(full)
      }
    }
  } catch {}

  const rest = []
  await scanDir(root, 0, 4, rest)
  for (const full of rest) {
    if (!seen.has(full) && found.length < MAX_CANVASES) {
      seen.add(full)
      found.push(full)
    }
  }
  return found
}

export async function readCanvasFile(cwd, filePath) {
  const full = resolveCanvasPath(cwd, filePath)
  const [source, info] = await Promise.all([readFile(full, 'utf8'), stat(full)])
  const rel = relative(resolve(cwd), full).split(sep).join('/')
  return {
    path: full,
    relativePath: rel,
    name: basename(full),
    title: deriveTitle(full, source),
    source,
    mtimeMs: Math.trunc(info.mtimeMs),
    size: info.size,
  }
}

export async function writeCanvasFile(cwd, inputPath, source) {
  const full = resolveCanvasPath(cwd, inputPath)
  await mkdir(dirname(full), { recursive: true })
  await writeFile(full, source, 'utf8')
  return readCanvasFile(cwd, full)
}

export async function deleteCanvasFile(cwd, inputPath) {
  const full = resolveCanvasPath(cwd, inputPath)
  await unlink(full)
  return full
}

export function computeLineDiff(beforeText = '', afterText = '') {
  const a = beforeText === '' ? [] : beforeText.split('\n')
  const b = afterText === '' ? [] : afterText.split('\n')
  const maxMatrix = 900
  if (a.length > maxMatrix || b.length > maxMatrix) {
    const lines = []
    a.forEach((content, idx) => lines.push({ type: 'removed', oldLine: idx + 1, content }))
    b.forEach((content, idx) => lines.push({ type: 'added', newLine: idx + 1, content }))
    return { added: b.length, removed: a.length, lines }
  }

  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const lines = []
  let i = 0
  let j = 0
  let added = 0
  let removed = 0
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      lines.push({ type: 'context', oldLine: i + 1, newLine: j + 1, content: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push({ type: 'removed', oldLine: i + 1, content: a[i] })
      removed++
      i++
    } else {
      lines.push({ type: 'added', newLine: j + 1, content: b[j] })
      added++
      j++
    }
  }
  while (i < m) {
    lines.push({ type: 'removed', oldLine: i + 1, content: a[i] })
    removed++
    i++
  }
  while (j < n) {
    lines.push({ type: 'added', newLine: j + 1, content: b[j] })
    added++
    j++
  }
  return { added, removed, lines }
}

export function createWorkspaceWatcher(cwd, onChange) {
  const watchers = new Map()
  let closed = false
  let timer = null

  const schedule = () => {
    if (closed) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!closed) onChange()
    }, 140)
  }

  const attachDir = dir => {
    if (closed || watchers.has(dir)) return
    try {
      const watcher = watch(dir, { persistent: false }, (_eventType, fileName) => {
        if (!fileName || String(fileName).endsWith(CANVAS_EXT) || String(fileName) === '.dsh' || String(fileName) === 'canvases') {
          schedule()
        }
      })
      watcher.on('error', () => {
        watcher.close()
        watchers.delete(dir)
      })
      watchers.set(dir, watcher)
    } catch {}
  }

  return {
    sync(filePaths = []) {
      if (closed) return
      const desired = new Set([resolve(cwd), join(resolve(cwd), '.dsh'), join(resolve(cwd), DEFAULT_DIR)])
      for (const file of filePaths) desired.add(dirname(resolve(file)))
      for (const [dir, watcher] of watchers) {
        if (!desired.has(dir)) {
          watcher.close()
          watchers.delete(dir)
        }
      }
      for (const dir of desired) attachDir(dir)
    },
    close() {
      closed = true
      clearTimeout(timer)
      for (const watcher of watchers.values()) watcher.close()
      watchers.clear()
    },
  }
}
