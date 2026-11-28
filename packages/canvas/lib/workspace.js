import { watch } from 'node:fs'
import { lstat, mkdir, readdir, readFile, realpath, stat, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

export const CANVAS_EXT = '.canvas.tsx'
export const HTML_EXT = '.canvas.html'
export const SVG_EXT = '.canvas.svg'
export const CANVAS_EXTENSIONS = [CANVAS_EXT, HTML_EXT, SVG_EXT]
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

export function getArtifactKind(filePath) {
  if (typeof filePath !== 'string') return 'react'
  if (filePath.endsWith(HTML_EXT)) return 'html'
  if (filePath.endsWith(SVG_EXT)) return 'svg'
  return 'react'
}

export function isCanvasFileName(name) {
  return typeof name === 'string' && CANVAS_EXTENSIONS.some(ext => name.endsWith(ext))
}

export function stripCanvasExtension(name) {
  for (const ext of CANVAS_EXTENSIONS) {
    if (name.endsWith(ext)) return name.slice(0, -ext.length)
  }
  return name
}

export function isWithinDirectory(rootDir, targetPath) {
  const root = resolve(rootDir)
  const target = resolve(targetPath)
  const rel = relative(root, target)
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
}

async function assertRealpathWithin(rootDir, targetPath, { allowMissingLeaf = false, allowEqual = false } = {}) {
  const realRoot = await realpath(resolve(rootDir))
  if (allowMissingLeaf) {
    try {
      const info = await lstat(targetPath)
      if (info.isSymbolicLink()) {
        const realTarget = await realpath(targetPath)
        if (!isWithinDirectory(realRoot, realTarget)) {
          throw new Error('Canvas path must stay within the session workspace directory.')
        }
        return realTarget
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  let cur = targetPath
  let equalOk = allowEqual
  for (;;) {
    try {
      const realCur = await realpath(cur)
      if (isWithinDirectory(realRoot, realCur) || (equalOk && realCur === realRoot)) return realCur
      throw new Error('Canvas path must stay within the session workspace directory.')
    } catch (error) {
      if (!allowMissingLeaf || error?.code !== 'ENOENT') throw error
      const parent = dirname(cur)
      if (parent === cur) throw error
      cur = parent
      equalOk = true
    }
  }
}

export function normalizeSlug(name) {
  const raw = String(name ?? '')
    .trim()
    .replace(/\.canvas\.(?:tsx|html|svg)$/i, '')
    .replace(/\.(?:tsx|html|svg)$/i, '')
  const cleaned = raw
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)
  return cleaned || 'untitled'
}

function extFromKind(kind) {
  if (kind === 'html') return HTML_EXT
  if (kind === 'svg') return SVG_EXT
  return CANVAS_EXT
}

export function resolveCanvasPath(cwd, inputPath, kind) {
  if (typeof cwd !== 'string' || !cwd.trim() || !isAbsolute(cwd)) {
    throw new Error('Workspace directory (cwd) must be an absolute path.')
  }
  const root = resolve(cwd)
  const raw = typeof inputPath === 'string' ? inputPath.trim() : ''
  if (!raw || raw.includes('\0')) throw new Error('Canvas path or name is required.')

  const defaultExt = extFromKind(kind)
  let target
  if (isAbsolute(raw)) {
    target = resolve(raw)
  } else if (raw.includes('/') || raw.includes('\\') || (raw.includes('.') && !isCanvasFileName(raw))) {
    target = resolve(root, raw)
  } else if (isCanvasFileName(raw)) {
    const ext = CANVAS_EXTENSIONS.find(e => raw.endsWith(e)) ?? defaultExt
    target = resolve(root, DEFAULT_DIR, `${normalizeSlug(raw)}${ext}`)
  } else {
    target = resolve(root, DEFAULT_DIR, `${normalizeSlug(raw)}${defaultExt}`)
  }

  if (!isCanvasFileName(target)) {
    throw new Error(`Canvas file must end with "${CANVAS_EXT}", "${HTML_EXT}", or "${SVG_EXT}".`)
  }
  if (!isWithinDirectory(root, target)) {
    throw new Error('Canvas path must stay within the session workspace directory.')
  }
  return target
}

export function deriveTitle(filePath, source = '') {
  const kind = getArtifactKind(filePath)
  if (kind === 'html' || kind === 'svg') {
    const titleTag = /<title[^>]*>([^<]+)<\/title>/i.exec(source)
    if (titleTag?.[1]?.trim()) return titleTag[1].trim().slice(0, 80)
    const h1Html = /<h1[^>]*>([^<]+)<\/h1>/i.exec(source)
    if (h1Html?.[1]?.trim()) return h1Html[1].trim().slice(0, 80)
  } else {
    const h1 = /<H1[^>]*>([^<{]+)<\/H1>/.exec(source)
    if (h1?.[1]?.trim()) return h1[1].trim().slice(0, 80)
  }
  const stem = stripCanvasExtension(basename(filePath))
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
    if (entry.isFile() && isCanvasFileName(entry.name)) {
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
      if (entry.isFile() && isCanvasFileName(entry.name)) {
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
  await assertRealpathWithin(cwd, full)
  const [source, info] = await Promise.all([readFile(full, 'utf8'), stat(full)])
  const rel = relative(resolve(cwd), full).split(sep).join('/')
  return {
    path: full,
    relativePath: rel,
    name: basename(full),
    kind: getArtifactKind(full),
    title: deriveTitle(full, source),
    source,
    mtimeMs: info.mtimeMs,
    size: info.size,
  }
}

export async function writeCanvasFile(cwd, inputPath, source, kind) {
  const full = resolveCanvasPath(cwd, inputPath, kind)
  await assertRealpathWithin(cwd, full, { allowMissingLeaf: true })
  await mkdir(dirname(full), { recursive: true })
  await assertRealpathWithin(cwd, dirname(full), { allowEqual: true })
  await writeFile(full, source, 'utf8')
  return readCanvasFile(cwd, full)
}

export async function deleteCanvasFile(cwd, inputPath) {
  const full = resolveCanvasPath(cwd, inputPath)
  await assertRealpathWithin(cwd, dirname(full), { allowEqual: true })
  await unlink(full)
  return full
}

export function createWorkspaceWatcher(cwd, onChange) {
  const root = resolve(cwd)
  const watched = new Map()
  let timer = null

  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      onChange()
    }, 180)
  }

  const syncDirs = dirs => {
    const next = new Set(dirs)
    for (const [dir, handle] of watched) {
      if (!next.has(dir)) {
        try { handle.close() } catch {}
        watched.delete(dir)
      }
    }
    for (const dir of next) {
      if (watched.has(dir)) continue
      try {
        const handle = watch(dir, { persistent: false }, (_event, filename) => {
          if (!filename || isCanvasFileName(String(filename)) || String(filename) === '.dsh' || String(filename) === 'canvases') {
            schedule()
          }
        })
        handle.on('error', () => {
          try { handle.close() } catch {}
          watched.delete(dir)
        })
        watched.set(dir, handle)
      } catch {}
    }
  }

  return {
    sync(filePaths = []) {
      const dirs = [root, join(root, '.dsh'), join(root, DEFAULT_DIR)]
      for (const file of filePaths) dirs.push(dirname(file))
      syncDirs(dirs)
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

export function computeLineDiff(beforeSource, afterSource) {
  const a = beforeSource ? beforeSource.split('\n') : []
  const b = afterSource ? afterSource.split('\n') : []
  const m = a.length
  const n = b.length

  if (m === 0 && n === 0) return { added: 0, removed: 0, lines: [] }
  if (m * n > 200_000) {
    return {
      added: n,
      removed: m,
      lines: [
        ...a.slice(0, 60).map((content, idx) => ({ type: 'removed', oldLine: idx + 1, content })),
        ...b.slice(0, 60).map((content, idx) => ({ type: 'added', newLine: idx + 1, content })),
      ],
    }
  }

  const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const raw = []
  let i = 0
  let j = 0
  let added = 0
  let removed = 0
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      raw.push({ type: 'context', oldLine: i + 1, newLine: j + 1, content: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      raw.push({ type: 'removed', oldLine: i + 1, content: a[i] })
      removed++
      i++
    } else {
      raw.push({ type: 'added', newLine: j + 1, content: b[j] })
      added++
      j++
    }
  }
  while (i < m) {
    raw.push({ type: 'removed', oldLine: i + 1, content: a[i] })
    removed++
    i++
  }
  while (j < n) {
    raw.push({ type: 'added', newLine: j + 1, content: b[j] })
    added++
    j++
  }

  const keep = new Uint8Array(raw.length)
  for (let idx = 0; idx < raw.length; idx++) {
    if (raw[idx].type !== 'context') {
      const start = Math.max(0, idx - 2)
      const end = Math.min(raw.length - 1, idx + 2)
      for (let k = start; k <= end; k++) keep[k] = 1
    }
  }

  const lines = []
  let skipped = false
  for (let idx = 0; idx < raw.length; idx++) {
    if (keep[idx]) {
      if (skipped && lines.length > 0) lines.push({ type: 'hunk', content: '...' })
      skipped = false
      lines.push(raw[idx])
    } else {
      skipped = true
    }
  }

  return { added, removed, lines: lines.slice(0, 240) }
}
