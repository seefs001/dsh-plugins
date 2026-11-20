import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { Minimatch } from 'minimatch'
import { createInterface } from 'node:readline'
import { DEFAULT_MAX_BYTES, GREP_MAX_LINE_LENGTH, formatSize, relativizeFindResultPath, truncateHead, truncateLine } from './pi.js'

// Pi's grep has no injectable spawn operation. Keep its public definition
// and formatting helpers; perform the search through DSH rather than child_process.
export async function runLines(ctx, command, args, cwd, signal, policy, onLine) {
  let argv = [await ctx.subprocess.resolveExecutable(command, undefined, signal), ...args]
  if (policy.mode !== 'danger-full-access') argv = (await ctx.sandbox.confine(argv, policy, signal)).argv
  signal.throwIfAborted()
  const child = ctx.subprocess.spawn({
    argv, cwd, signal, graceMs: 100,
    stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
  })
  const lines = createInterface({ input: child.stdout })
  let stderr = ''
  let limited = false
  let parseError
  const onErrorData = chunk => { stderr = (stderr + chunk.toString()).slice(-65536) }
  child.stderr.on('data', onErrorData)
  lines.on('line', line => {
    if (limited || parseError) return
    try {
      if (onLine(line) === false) {
        limited = true
        child.terminate()
      }
    } catch (error) {
      parseError = error
      child.terminate()
    }
  })
  try {
    const result = await child.done
    if (limited || parseError || signal.aborted) await child.waitForExit()
    signal.throwIfAborted()
    if (parseError) throw parseError
    return { ...result, stderr: stderr.trim(), limited }
  } finally {
    lines.close()
    child.stderr.off('data', onErrorData)
  }
}

export async function findPaths(ops, pattern, root, limit) {
  const args = ['--color=never', '--hidden']
  let insideGit = false
  for (let current = root; ; current = dirname(current)) {
    if (await ops.exists(join(current, '.git'))) { insideGit = true; break }
    if (dirname(current) === current) break
  }
  if (!insideGit) args.push('--no-require-git')
  const windows = process.platform === 'win32'
  let glob = (windows ? pattern.replaceAll('\\', '/') : pattern).replace(/^(?:\.\/)+/, '')
  const pathGlob = glob.includes('/')
  const anchored = pathGlob && !isAbsolute(glob)
  const ignoreCase = glob === glob.toLowerCase()
  // Like Pi, avoid fd's version-dependent --full-path glob handling on Windows.
  const matcher = windows && pathGlob
    ? new Minimatch(glob.replace(/\/\*\*$/, '/**/*'), { dot: true, noext: true, nocase: ignoreCase })
    : undefined
  if (matcher) {
    args.push('--', '', root)
  } else {
    args.push('--glob', '--max-results', String(limit))
    if (pathGlob) args.push('--full-path')
    if (anchored) {
      // fd matches absolute paths. Escape the literal root and keep smart case based on the user's glob.
      const prefix = root.replace(/\/+$/, '').replace(/[\\*?[\]{}]/g, '\\$&')
      glob = prefix + '/' + glob
      if (ignoreCase) args.push('--ignore-case')
    }
    args.push('--', glob, root)
  }
  const paths = []
  const result = await ops.lines('fd', args, line => {
    if (!line) return
    const path = relativizeFindResultPath(line, root)
    if (matcher && !matcher.match(anchored ? path : line)) return
    paths.push(path)
    if (matcher && paths.length >= limit) return false
  })
  if (result.exitCode !== 0 && paths.length === 0) throw new Error(result.stderr || `fd exited with code ${result.exitCode}`)
  return paths
}

// ripgrep encodes non-UTF-8 paths and lines as base64 rather than `text`.
function rgText(field) {
  return field?.text ?? (field?.bytes ? Buffer.from(field.bytes, 'base64').toString('utf8') : '')
}

export async function runGrep(args, ops) {
  const root = await ops.path(args.path || '.')
  const directory = await ops.isDirectory(root)
  const limit = Math.max(1, Math.floor(args.limit ?? 100))
  const context = Math.min(Math.max(0, Math.floor(args.context ?? 0)), Number.MAX_SAFE_INTEGER)
  const argv = ['--no-config', '--json', '--line-number', '--color=never', '--hidden']
  if (args.ignoreCase) argv.push('--ignore-case')
  if (args.literal) argv.push('--fixed-strings')
  if (args.glob) argv.push('--glob', args.glob.replace(/^(!?)(?:\.\/)+/, '$1'))
  if (context) argv.push('--context', String(context))
  // rg roots path-containing globs at its cwd, not at its positional argument.
  argv.push('--', args.pattern, directory ? '.' : root)
  const output = []
  let count = 0
  let totalBytes = 0
  let totalLines = 0
  let linesTruncated = false
  let matchLimitReached = false
  let lastFile
  let trailingEnd = 0
  const result = await ops.lines('rg', argv, line => {
    let event
    try { event = JSON.parse(line) } catch { return }
    const match = event.type === 'match'
    if (!match && event.type !== 'context') return
    const file = rgText(event.data?.path)
    const number = event.data?.line_number
    if (!file || typeof number !== 'number') return

    const withinLimit = count < limit
    const trailing = file === lastFile && number <= trailingEnd
    if (withinLimit || trailing) {
      const path = directory ? relative(root, resolve(root, file)) : ''
      const label = path && !path.startsWith('..') ? path.replaceAll('\\', '/') : basename(file)
      const value = truncateLine(rgText(event.data.lines).replace(/\r?\n?$/, ''))
      const sep = withinLimit && match ? ':' : '-'
      const row = `${label}${sep}${number}${sep} ${value.text}`
      if (totalBytes - 1 <= DEFAULT_MAX_BYTES) output.push(row)
      totalBytes += Buffer.byteLength(row) + 1
      totalLines++
      linesTruncated ||= value.wasTruncated
      lastFile = file
    }
    if (withinLimit) {
      if (match && ++count === limit) trailingEnd = number + context
    } else {
      // An extra match proves truncation; finish the last match's context first.
      matchLimitReached ||= match
      if (matchLimitReached && !(trailing && number < trailingEnd)) return false
    }
  }, directory ? root : undefined)
  if (!result.limited && result.exitCode !== 0 && result.exitCode !== 1) {
    throw new Error(result.stderr || `ripgrep exited with code ${result.exitCode}`)
  }
  if (!count) return { content: [{ type: 'text', text: 'No matches found' }] }
  const truncation = truncateHead(output.join('\n'), { maxLines: Number.MAX_SAFE_INTEGER })
  truncation.totalLines = totalLines
  truncation.totalBytes = totalBytes - 1
  const details = {}
  const notices = []
  if (matchLimitReached) {
    details.matchLimitReached = limit
    notices.push(`${limit} matches limit reached. Use limit=${limit * 2} for more, or refine pattern`)
  }
  if (truncation.truncated) {
    details.truncation = truncation
    notices.push(`${formatSize(DEFAULT_MAX_BYTES)} limit reached`)
  }
  if (linesTruncated) {
    details.linesTruncated = true
    notices.push(`Some lines truncated to ${GREP_MAX_LINE_LENGTH} chars. Use read tool to see full lines`)
  }
  return {
    content: [{ type: 'text', text: truncation.content + (notices.length ? `\n\n[${notices.join('. ')}]` : '') }],
    ...(Object.keys(details).length ? { details } : {}),
  }
}
