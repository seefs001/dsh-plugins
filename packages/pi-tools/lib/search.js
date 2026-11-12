import { basename, dirname, join, relative } from 'node:path'
import { createInterface } from 'node:readline'
import { DEFAULT_MAX_BYTES, GREP_MAX_LINE_LENGTH, formatSize, relativizeFindResultPath, truncateHead, truncateLine } from './pi.js'

// Pi 1.5.0's grep has no injectable spawn operation. Keep its public definition
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
  const args = ['--glob', '--color=never', '--hidden']
  let insideGit = false
  for (let current = root; ; current = dirname(current)) {
    if (await ops.exists(join(current, '.git'))) { insideGit = true; break }
    if (dirname(current) === current) break
  }
  if (!insideGit) args.push('--no-require-git')
  args.push('--max-results', String(limit))
  let effective = pattern
  if (pattern.includes('/')) {
    args.push('--full-path')
    if (!pattern.startsWith('/') && !pattern.startsWith('**/') && pattern !== '**') effective = `**/${pattern}`
    if (process.platform === 'win32') effective = effective.replaceAll('/', String.raw`[/\\]`)
  }
  args.push('--', effective, root)
  const paths = []
  const result = await ops.lines('fd', args, line => { if (line) paths.push(line) })
  if (result.exitCode !== 0 && paths.length === 0) throw new Error(result.stderr || `fd exited with code ${result.exitCode}`)
  return paths.map(path => relativizeFindResultPath(path, root))
}

export async function runGrep(args, ops) {
  const root = await ops.path(args.path || '.')
  const directory = await ops.isDirectory(root)
  const limit = Math.max(1, args.limit ?? 100)
  const context = args.context && args.context > 0 ? args.context : 0
  const argv = ['--no-config', '--json', '--line-number', '--color=never', '--hidden']
  if (args.ignoreCase) argv.push('--ignore-case')
  if (args.literal) argv.push('--fixed-strings')
  if (args.glob) argv.push('--glob', args.glob)
  argv.push('--', args.pattern, root)
  const matches = []
  let count = 0
  const result = await ops.lines('rg', argv, line => {
    if (!line.trim()) return
    let event
    try { event = JSON.parse(line) } catch { return }
    if (event.type !== 'match') return
    count++
    if (event.data?.path?.text && typeof event.data.line_number === 'number') matches.push(event.data)
    return count >= limit ? false : undefined
  })
  if (!result.limited && result.exitCode !== 0 && result.exitCode !== 1) {
    throw new Error(result.stderr || `ripgrep exited with code ${result.exitCode}`)
  }
  if (!count) return { content: [{ type: 'text', text: 'No matches found' }] }
  const output = []
  const cache = new Map()
  let linesTruncated = false
  const lineText = text => {
    const value = truncateLine(text.replace(/\r/g, ''))
    linesTruncated ||= value.wasTruncated
    return value.text
  }
  for (const match of matches) {
    const path = match.path.text
    const candidate = directory ? relative(root, path) : ''
    const label = candidate && !candidate.startsWith('..') ? candidate.replaceAll('\\', '/') : basename(path)
    const number = match.line_number
    if (!context && match.lines?.text !== undefined) {
      output.push(`${label}:${number}: ${lineText(match.lines.text.replace(/\r\n/g, '\n').replace(/\n$/, ''))}`)
      continue
    }
    if (!cache.has(path)) {
      try { cache.set(path, (await ops.readFile(path)).replace(/\r\n/g, '\n').split('\n')) }
      catch { cache.set(path, []) }
    }
    const lines = cache.get(path)
    if (!lines.length) { output.push(`${label}:${number}: (unable to read file)`); continue }
    for (let current = Math.max(1, number - context); current <= Math.min(lines.length, number + context); current++) {
      const separator = current === number ? ':' : '-'
      output.push(`${label}${separator}${current}${separator} ${lineText(lines[current - 1] ?? '')}`)
    }
  }
  const truncation = truncateHead(output.join('\n'), { maxLines: Number.MAX_SAFE_INTEGER })
  const details = {}
  const notices = []
  if (result.limited) {
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
