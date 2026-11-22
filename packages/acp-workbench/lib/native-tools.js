import { randomBytes } from 'node:crypto'

const MAX_TOOL_NAME = 64
const MAX_READ_LINES = 5000
const TERMINAL_STATUS = new Set(['completed', 'failed', 'cancelled', 'canceled'])

const firstText = (...values) => values.find(value => typeof value === 'string' && value.trim() !== '')
const unwrap = block => block?.type === 'content' ? block.content : block
const plainText = block => unwrap(block)?.type === 'text' && typeof unwrap(block).text === 'string'
const unfence = text => /^(`{3,})[^\n`]*\r?\n([\s\S]*)\r?\n\1\s*$/u.exec(text)?.[2] ?? text
const validDiff = block => block?.type === 'diff' && typeof block.path === 'string' && block.path.trim() !== '' && typeof block.newText === 'string' && (block.oldText == null || typeof block.oldText === 'string')
const positiveInt = value => typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : undefined
const isPlainObject = value => typeof value === 'object' && value !== null && !Array.isArray(value)
const textList = value => Array.isArray(value) && value.every(item => typeof item === 'string') ? value.map(item => item.trim()).filter(Boolean) : []

export function makeCallId() {
  return `acp_${randomBytes(8).toString('hex')}`
}

export function sanitizeToolName(raw) {
  const cleaned = typeof raw === 'string' ? raw.trim().replace(/[^a-zA-Z0-9_-]+/gu, '_').replace(/^_+|_+$/gu, '') : ''
  return (cleaned || 'acp_tool').slice(0, MAX_TOOL_NAME)
}

export function isToolTerminal(tool) {
  return typeof tool?.status === 'string' && TERMINAL_STATUS.has(tool.status)
}

export function hasToolInput(tool) {
  if (!tool) return false
  if (tool.status && tool.status !== 'pending') return true
  if (isPlainObject(tool.rawInput) && Object.keys(tool.rawInput).length > 0) return true
  if (Array.isArray(tool.locations) && tool.locations.some(item => typeof item?.path === 'string' && item.path)) return true
  if (Array.isArray(tool.content) && tool.content.some(block => block && block.type !== 'terminal')) return true
  return false
}

function mcpIdentity(tool) {
  const wireName = firstText(tool.name)
  const metaName = firstText(tool._meta?.claudeCode?.toolName)
  const raw = tool.rawInput
  if (wireName && metaName && wireName !== metaName) return null
  const name = wireName || metaName
  if (name) {
    if (!name.startsWith('mcp__')) return null
    const index = name.indexOf('__', 5)
    if (index > 5 && firstText(name.slice(5, index)) && firstText(name.slice(index + 2))) {
      return { server: name.slice(5, index), name: name.slice(index + 2), wireName: name, args: raw }
    }
    return null
  }
  if (firstText(raw?.server) && firstText(raw?.tool) && Object.hasOwn(raw, 'arguments') && tool.title === `Tool: ${raw.server}/${raw.tool}`) {
    return { server: raw.server, name: raw.tool, wireName: `mcp__${raw.server}__${raw.tool}`, args: raw.arguments }
  }
  return null
}

function webAddress(value) {
  if (typeof value !== 'string' || !/^https?:\/\//iu.test(value) || /[\s\\\p{Cc}]/u.test(value)) return null
  try {
    const parsed = new URL(value)
    return parsed.hostname && !parsed.username && !parsed.password ? value : null
  } catch {
    return null
  }
}

function webAction(tool, input) {
  const name = firstText(tool.name, tool._meta?.claudeCode?.toolName)
  const same = !tool.name || !tool._meta?.claudeCode?.toolName || tool.name === tool._meta.claudeCode.toolName
  const url = firstText(input.url, input.Url)
  const query = firstText(input.query, input.Query, input.SearchTerm)
  const mode = same && (name === 'WebSearch' || name === 'search_web')
    ? 'search'
    : same && (name === 'WebFetch' || name === 'read_url_content')
      ? 'page'
      : 'unknown'
  const action = input.action
  if (!name && typeof input.query === 'string' && action && ['search', 'open_page', 'find_in_page'].includes(action.type)) {
    const queries = textList(action.queries)
    return {
      mode: action.type === 'open_page' ? 'page' : action.type === 'find_in_page' ? 'find' : 'search',
      url: firstText(action.url),
      query,
      queries: [...new Set([...queries, firstText(action.query), query].filter(Boolean))],
    }
  }
  const queries = [...new Set([...textList(input.queries), query].filter(Boolean))]
  return { mode, url, query, queries }
}

function commandFromInput(input, terminal, kind) {
  const direct = firstText(input.command, input.CommandLine, input.cmd)
  if (direct) return direct
  const argv = Array.isArray(input.command) && input.command.length && input.command.every(item => typeof item === 'string') ? input.command : null
  if (argv && (terminal || kind === 'execute')) return argv.join(' ')
  return undefined
}

function pathFromTool(tool, input) {
  const direct = firstText(input.file_path, input.path, input.filePath, input.AbsolutePath, input.TargetFile)
  if (direct) return direct
  const location = (Array.isArray(tool.locations) ? tool.locations : []).find(item => typeof item?.path === 'string' && item.path.trim())
  return location?.path
}

function diffsFromTool(tool) {
  const blocks = Array.isArray(tool.content) ? tool.content.filter(validDiff) : []
  return blocks.map(block => ({ path: block.path, oldText: block.oldText ?? null, newText: block.newText }))
}

const EXT_LANG = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  json: 'json',
  jsonc: 'jsonc',
  md: 'markdown',
  mdx: 'mdx',
  py: 'python',
  rs: 'rust',
  go: 'go',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  ps1: 'powershell',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  svg: 'xml',
  sql: 'sql',
  c: 'c',
  h: 'c',
  cc: 'cpp',
  cpp: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  java: 'java',
  kt: 'kotlin',
  kts: 'kotlin',
  swift: 'swift',
  rb: 'ruby',
  php: 'php',
  lua: 'lua',
  zig: 'zig',
  graphql: 'graphql',
  gql: 'graphql',
  vue: 'vue',
  svelte: 'svelte',
  ini: 'ini',
  env: 'dotenv',
}

function languageForFilePath(filePath) {
  if (typeof filePath !== 'string' || !filePath) return undefined
  const base = filePath.replace(/\\/gu, '/').split('/').pop()?.toLowerCase() ?? ''
  if (base === 'dockerfile') return 'dockerfile'
  if (base === 'makefile') return 'makefile'
  const dot = base.lastIndexOf('.')
  if (dot <= 0 || dot === base.length - 1) return undefined
  return EXT_LANG[base.slice(dot + 1)]
}

function moveEndpoints(input, paths) {
  const from = firstText(input.from, input.old_path, input.oldPath, input.source, input.source_path, input.src, paths[0])
  const to = firstText(input.to, input.new_path, input.newPath, input.destination, input.dest, input.dst, paths.find(item => item !== from))
  return from && to && from !== to ? { from, to } : null
}

function buildMinimalPatch(paths, kind, input = {}) {
  const lines = ['*** Begin Patch']
  if (kind === 'move') {
    const endpoints = moveEndpoints(input, paths)
    if (endpoints) {
      lines.push(`*** Update File: ${endpoints.from}`, `*** Move to: ${endpoints.to}`, '@@', ' ', '*** End Patch')
      return lines.join('\n')
    }
  }
  for (const path of paths) {
    if (kind === 'delete') {
      lines.push(`*** Delete File: ${path}`)
    } else {
      lines.push(`*** Update File: ${path}`, '@@', ' ')
    }
  }
  lines.push('*** End Patch')
  return lines.join('\n')
}

function validInclude(include) {
  if (typeof include !== 'string') return false
  const trimmed = include.trim()
  if (!trimmed || trimmed.startsWith('!')) return false
  let depth = 0
  for (const ch of trimmed) {
    if (ch === '{') depth++
    else if (ch === '}') depth = Math.max(0, depth - 1)
    else if (ch === ',' && depth === 0) return false
  }
  return true
}

function isGlobTool(tool, input) {
  const rawName = (firstText(tool.name, tool._meta?.claudeCode?.toolName, tool.title) ?? '').toLowerCase()
  if (rawName === 'glob' || rawName === 'find_by_name' || rawName === 'list_dir' || rawName.startsWith('glob ')) return true
  if (rawName === 'grep' || rawName === 'grep_search' || rawName.startsWith('grep ')) return false
  if (typeof input.include === 'string' || typeof input.output_mode === 'string') return false
  return typeof input.glob === 'string' || (typeof input.pattern === 'string' && /[*?[\]{}]/u.test(input.pattern) && input.query === undefined)
}

function safeObject(value) {
  if (isPlainObject(value)) return value
  if (value === undefined) return {}
  return { value }
}

function stripTitlePrefix(title) {
  if (typeof title !== 'string') return ''
  return title.trim().slice(0, 200)
}

export function mapToolCall(tool, terminal) {
  const input = isPlainObject(tool?.rawInput) ? tool.rawInput : {}
  const mcp = mcpIdentity(tool ?? {})
  if (mcp) {
    const argsObj = safeObject(mcp.args)
    return { name: sanitizeToolName(mcp.wireName), argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'mcp' }
  }
  const rawName = firstText(tool?.name, tool?._meta?.claudeCode?.toolName)
  const kind = tool?.kind
  const diffs = diffsFromTool(tool ?? {})
  const path = kind !== 'fetch' ? pathFromTool(tool ?? {}, input) : undefined
  const command = commandFromInput(input, terminal, kind)

  if (rawName === 'TodoWrite' || rawName === 'todo_write') {
    const todos = mapPlanTodos(input.todos ?? [])
    const argsObj = { todos }
    return { name: 'todo_write', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'plan' }
  }

  if (kind === 'read' || rawName === 'Read' || rawName === 'view_file') {
    const target = path
    if (target) {
      const offset = positiveInt(input.offset ?? input.start_line ?? input.StartLine)
      const endLine = positiveInt(input.end_line ?? input.EndLine)
      const limit = positiveInt(input.limit) ?? (offset && endLine && endLine >= offset ? endLine - offset + 1 : undefined)
      const argsObj = { file_path: target, ...(offset ? { offset } : {}), ...(limit ? { limit } : {}) }
      return { name: 'read', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'read' }
    }
  }

  const isWrite = rawName === 'Write' || rawName === 'write_to_file' || (kind === 'edit' && input.old_string === undefined && input.TargetContent === undefined && (typeof input.content === 'string' || typeof input.CodeContent === 'string' || typeof input.file_text === 'string' || typeof input.file_content === 'string'))
  if (isWrite && path) {
    const content = input.content ?? input.CodeContent ?? input.file_text ?? input.file_content ?? ''
    const argsObj = { file_path: path, content: typeof content === 'string' ? content : '' }
    return { name: 'write', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'write' }
  }

  if (kind === 'edit' || kind === 'delete' || kind === 'move' || diffs.length > 0 || rawName === 'Edit' || rawName === 'MultiEdit' || rawName === 'NotebookEdit' || rawName === 'replace_file_content' || rawName === 'multi_replace_file_content') {
    const uniquePaths = [...new Set([...diffs.map(item => item.path), ...(path ? [path] : [])])]
    if (uniquePaths.length > 1 || kind === 'delete' || kind === 'move') {
      const moveTargets = kind === 'move' ? moveEndpoints(input, uniquePaths) : null
      const patchPaths = moveTargets ? [moveTargets.from, moveTargets.to] : uniquePaths
      const argsObj = patchPaths.length > 0
        ? { input: buildMinimalPatch(patchPaths, kind, input) }
        : safeObject(input)
      return { name: 'apply_patch', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: kind ?? 'edit' }
    }
    if (uniquePaths.length === 1) {
      const oldString = typeof input.old_string === 'string'
        ? input.old_string
        : typeof input.old_str === 'string'
          ? input.old_str
          : typeof input.TargetContent === 'string'
            ? input.TargetContent
            : undefined
      const newString = typeof input.new_string === 'string'
        ? input.new_string
        : typeof input.new_str === 'string'
          ? input.new_str
          : typeof input.ReplacementContent === 'string'
            ? input.ReplacementContent
            : undefined
      const replaceAll = typeof input.replace_all === 'boolean'
        ? input.replace_all
        : typeof input.AllowMultiple === 'boolean'
          ? input.AllowMultiple
          : undefined
      const argsObj = {
        file_path: uniquePaths[0],
        ...(oldString !== undefined ? { old_string: oldString } : {}),
        ...(newString !== undefined ? { new_string: newString } : {}),
        ...(replaceAll !== undefined ? { replace_all: replaceAll } : {}),
      }
      return { name: 'edit', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'edit' }
    }
  }

  if (kind === 'execute' || terminal || command || rawName === 'Bash' || rawName === 'PowerShell' || rawName === 'run_command') {
    const cmd = command || stripTitlePrefix(tool?.title) || 'command'
    const description = firstText(input.description, tool?.title) || cmd.slice(0, 120)
    const workdir = firstText(input.workdir, input.cwd, input.Cwd, terminal?.cwd)
    const argsObj = { command: cmd, description, ...(workdir ? { workdir } : {}) }
    return { name: 'bash', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'execute' }
  }

  if (kind === 'fetch' || rawName === 'WebSearch' || rawName === 'WebFetch' || rawName === 'search_web' || rawName === 'read_url_content') {
    const web = webAction(tool ?? {}, input)
    if (web.mode === 'page' || (web.url && web.mode !== 'search')) {
      const argsObj = { url: web.url ?? firstText(input.url, input.Url, tool?.title) ?? '' }
      if (argsObj.url) return { name: 'web_fetch', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'fetch' }
    }
    if (web.queries.length > 0) {
      const argsObj = { queries: web.queries }
      return { name: 'web_search', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'fetch' }
    }
  }

  if (kind === 'search' || rawName === 'Grep' || rawName === 'Glob' || rawName === 'grep_search' || rawName === 'find_by_name' || rawName === 'list_dir') {
    const searchPath = firstText(input.path, input.SearchPath, input.SearchDirectory, input.DirectoryPath, input.directory)
    const pattern = firstText(input.pattern, input.Pattern, input.query, input.Query, input.SearchTerm, input.glob, rawName === 'list_dir' ? '*' : undefined, tool?.title)
    if (pattern) {
      if (isGlobTool(tool ?? {}, input)) {
        const argsObj = { pattern, ...(searchPath ? { path: searchPath } : {}) }
        return { name: 'glob', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'search' }
      }
      const rawInclude = typeof input.include === 'string'
        ? input.include
        : typeof input.Includes === 'string'
          ? input.Includes
          : Array.isArray(input.Includes) && input.Includes.length === 1 && typeof input.Includes[0] === 'string'
            ? input.Includes[0]
            : undefined
      const include = validInclude(rawInclude) ? rawInclude.trim() : undefined
      const argsObj = { pattern, ...(searchPath ? { path: searchPath } : {}), ...(include ? { include } : {}) }
      return { name: 'grep', argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: 'search' }
    }
  }

  const fallbackName = sanitizeToolName(rawName || tool?.kind || 'acp_tool')
  const baseArgs = safeObject(input)
  const title = stripTitlePrefix(tool?.title)
  const argsObj = Object.keys(baseArgs).length > 0
    ? baseArgs
    : title ? { description: title } : {}
  return { name: fallbackName, argumentsObj: argsObj, argumentsJson: JSON.stringify(argsObj), originalKind: kind ?? 'other' }
}

function resultBody(tool, terminal, originalKind) {
  const blocks = Array.isArray(tool?.content) ? tool.content.filter(Boolean) : []
  const raw = tool?.rawOutput
  const display = blocks.filter(plainText).map(block => unfence(unwrap(block).text)).join('\n')
  const rawBlocks = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []
  const io = [raw?.stdout, raw?.stderr].filter(item => typeof item === 'string' && item).join('\n')
  const terminalOutput = (originalKind === 'execute' || terminal) && (raw?.call_id == null || raw?.call_id === tool?.toolCallId)
    ? firstText(terminal?.text, raw?.aggregated_output) ?? (io || firstText(raw?.output))
    : undefined
  const patchOutput = originalKind === 'edit' && raw?.call_id === tool?.toolCallId && typeof raw?.success === 'boolean' && isPlainObject(raw?.changes) ? io : undefined
  const text = terminalOutput
    ?? (display || patchOutput || firstText(raw, raw?.output, raw?.content, raw?.text, raw?.error?.message, raw?.error, raw?.message)
      || rawBlocks.filter(plainText).map(block => unfence(unwrap(block).text)).join('\n'))
  return { text: typeof text === 'string' ? text : '', blocks, rawBlocks }
}

function exitStatusOf(tool, terminal) {
  const out = tool?.rawOutput ?? {}
  const lastExit = tool?.toolCallId && tool?._meta?.terminal_exit?.terminal_id === tool.toolCallId ? tool._meta.terminal_exit : null
  const exitCode = terminal?.exitCode
    ?? (out.call_id == null || out.call_id === tool?.toolCallId ? [out.exitCode, out.exit_code, out.return_code].find(Number.isInteger) : undefined)
    ?? (Number.isInteger(lastExit?.exit_code) ? lastExit.exit_code : undefined)
  const signal = terminal?.signal ?? firstText(lastExit?.signal)
  return { exitCode, signal }
}

function parseNumberedRead(text) {
  if (!text) return null
  const rows = text.replace(/\r?\n$/u, '').split(/\r?\n/u)
  if (!rows.length || rows.length > MAX_READ_LINES) return null
  const parsed = []
  let previous = 0
  for (const line of rows) {
    const match = /^\s*(\d+)(?:\t|→)(.*)$/u.exec(line)
    if (!match) return null
    const number = Number(match[1])
    if (!Number.isInteger(number) || number < 1 || number <= previous) return null
    previous = number
    parsed.push({ number, text: match[2] })
  }
  return parsed
}

function parsePlainRead(text, offset = 1) {
  if (!text) return null
  const rows = text.replace(/\r?\n$/u, '').split(/\r?\n/u)
  if (!rows.length || rows.length > MAX_READ_LINES) return null
  return rows.map((line, index) => ({ number: offset + index, text: line }))
}

function parseSearchResult(raw, text, input = {}) {
  const mode = raw?.mode ?? input.output_mode ?? ([true, 'true'].includes(input['-c']) ? 'count' : undefined)
  if (mode === 'count') return null
  const paths = raw?.filenames ?? raw?.paths
  const listed = Array.isArray(paths) && paths.every(item => typeof item === 'string' && item.trim())
  if (mode !== 'content' && listed && (paths.length || !text)) {
    return { shape: 'paths', paths: [...paths], total: paths.length, truncated: raw?.truncated === true }
  }
  if (mode === 'files_with_matches') return null
  const output = mode === 'content' ? firstText(raw?.content, text) : text
  if (!output) return null
  const files = new Map()
  const rows = output.replace(/\r?\n$/u, '').split(/\r?\n/u)
  const single = mode === 'content' && listed && paths.length === 1 && (raw?.numFiles == null || raw.numFiles === 1) ? paths[0] : null
  for (const line of rows) {
    if (!single && mode === 'content' && /^\d+:/u.test(line)) return null
    const bare = single && /^(\d+):(.*)$/u.exec(line)
    const match = bare ? [null, single, bare[1], bare[2]] : /^(.+?):(\d+):(.*)$/u.exec(line)
    if (!match || !Number.isInteger(Number(match[2])) || Number(match[2]) < 1) return null
    if (!files.has(match[1])) files.set(match[1], { path: match[1], matches: [] })
    files.get(match[1]).matches.push({ lineNumber: Number(match[2]), line: match[3] })
  }
  if (!files.size) return null
  return { shape: 'matches', files: [...files.values()], total: rows.length, truncated: raw?.truncated === true }
}

function parseStructuredWebSearch(raw, text) {
  const list = Array.isArray(raw?.sources) ? raw.sources : Array.isArray(raw?.results) ? raw.results : null
  if (!list) return null
  const sources = []
  const seen = new Set()
  for (const item of list) {
    if (!isPlainObject(item)) continue
    const url = webAddress(firstText(item.url, item.link, item.href))
    if (!url || seen.has(url)) continue
    seen.add(url)
    const title = firstText(item.title, item.name)
    const snippet = firstText(item.snippet, item.description, item.excerpt)
    const publishedAt = firstText(item.publishedAt, item.published_at, item.date)
    sources.push({
      url,
      ...(title ? { title } : {}),
      ...(snippet ? { snippet } : {}),
      ...(publishedAt ? { publishedAt } : {}),
    })
  }
  const answer = firstText(raw?.answer, raw?.summary, text)
  if (!sources.length && !answer) return null
  return {
    sources,
    ...(answer ? { answer } : {}),
    truncated: raw?.truncated === true,
  }
}

// external: Claude Code WebSearch emits "Title (url)" lines interleaved with plain text
function parseWebSearchSources(text) {
  if (!text) return null
  const sources = []
  const answerLines = []
  for (const line of text.split(/\r?\n/u)) {
    const hit = /^(.+) \((https?:\/\/[^\s]+)\)$/iu.exec(line)
    const url = hit && webAddress(hit[2])
    if (url) sources.push({ title: hit[1].trim(), url })
    else if (line.trim()) answerLines.push(line)
  }
  if (!sources.length) return null
  const answer = answerLines.join('\n').trim()
  return { sources, ...(answer ? { answer } : {}), truncated: false }
}

function isCallFailed(tool, originalKind, exitCode, signal) {
  const out = tool?.rawOutput
  if (tool?.status === 'failed') return true
  if (originalKind === 'mcp') return out?.isError === true || out?.is_error === true
  if (out?.isError === true || out?.is_error === true) return true
  if (exitCode !== undefined && exitCode !== 0) return true
  if (signal) return true
  return false
}

export function mapToolResult(mappedCall, tool, terminal, { cwd, aborted = false, interrupted = false } = {}) {
  if (aborted || interrupted || tool?.status === 'cancelled' || tool?.status === 'canceled') {
    const label = aborted ? 'Tool execution canceled' : 'Tool execution interrupted'
    return {
      content: [{ type: 'text', text: label }],
      isError: true,
      error: { name: aborted ? 'AbortError' : 'Interrupted', code: aborted ? 'ABORTED' : 'interrupted', reason: label },
    }
  }
  const { name, argumentsObj, originalKind } = mappedCall
  const { text } = resultBody(tool, terminal, originalKind)
  const { exitCode, signal } = exitStatusOf(tool, terminal)
  const failed = isCallFailed(tool, originalKind, exitCode, signal)

  if (name === 'bash') {
    const resolvedCwd = firstText(terminal?.cwd, argumentsObj.workdir, cwd)
    const meta = resolvedCwd && resolvedCwd.startsWith('/') ? { cwd: resolvedCwd } : undefined
    const hasExitSignal = signal !== undefined || exitCode !== undefined
    if (failed && !hasExitSignal && !text) {
      return {
        content: [{ type: 'text', text: 'Command failed' }],
        isError: true,
        error: { name: 'ToolExecutionError', code: 'EXECUTION_FAILED', reason: 'Command failed' },
        ...(meta ? { meta } : {}),
      }
    }
    let output = text
    if (signal) output = `${output}\n[killed by signal: ${signal}]`
    else if (exitCode !== undefined && exitCode !== 0) output = `${output}\n[exit code: ${exitCode}]`
    return {
      content: [{ type: 'text', text: output }],
      isError: failed && !hasExitSignal,
      ...(failed && !hasExitSignal ? { error: { name: 'ToolExecutionError', code: 'EXECUTION_FAILED' } } : {}),
      ...(meta ? { meta } : {}),
    }
  }

  if (name === 'read' && !failed) {
    const filePath = argumentsObj.file_path
    const lang = languageForFilePath(filePath)
    const offsetArg = positiveInt(argumentsObj.offset) ?? 1
    const lines = parseNumberedRead(text) ?? parsePlainRead(text, offsetArg)
    if (filePath && lines && lines.length > 0) {
      const offset = lines[0].number
      const totalLines = lines.at(-1).number
      const body = lines.map(line => `${line.number}\t${line.text}`).join('\n')
      return {
        content: [{ type: 'text', text: `<path>${filePath}</path>\n<type>file</type>\n<content>\n${body}\n</content>` }],
        isError: false,
        meta: { path: filePath, offset, lines, totalLines, ...(lang ? { lang } : {}) },
      }
    }
    return {
      content: [{ type: 'text', text: text || '(empty)' }],
      isError: false,
      ...(filePath ? { meta: { path: filePath, ...(lang ? { lang } : {}) } } : {}),
    }
  }

  if ((name === 'write' || name === 'edit' || name === 'apply_patch') && !failed) {
    let diffs = diffsFromTool(tool ?? {})
    const filePath = argumentsObj.file_path ?? diffs[0]?.path
    if (!diffs.length && filePath) {
      if (name === 'edit' && Array.isArray(tool?.rawInput?.ReplacementChunks) && tool.rawInput.ReplacementChunks.length > 0) {
        diffs = tool.rawInput.ReplacementChunks
          .filter(chunk => isPlainObject(chunk) && typeof chunk.ReplacementContent === 'string')
          .map(chunk => ({
            path: filePath,
            oldText: typeof chunk.TargetContent === 'string' && chunk.TargetContent ? chunk.TargetContent : null,
            newText: chunk.ReplacementContent,
          }))
      } else if (name === 'edit' && typeof argumentsObj.new_string === 'string') {
        diffs = [{ path: filePath, oldText: argumentsObj.old_string || null, newText: argumentsObj.new_string }]
      } else if (name === 'write' && typeof argumentsObj.content === 'string') {
        diffs = [{ path: filePath, oldText: null, newText: argumentsObj.content }]
      }
    }
    const meta = {
      ...(filePath ? { path: filePath } : {}),
      ...(diffs.length > 0 ? { diffs } : {}),
    }
    return {
      content: [{ type: 'text', text: text || (filePath ? `Updated ${filePath}` : 'Applied changes') }],
      isError: false,
      ...(Object.keys(meta).length > 0 ? { meta } : {}),
    }
  }

  if ((name === 'grep' || name === 'glob') && !failed) {
    const parsed = parseSearchResult(tool?.rawOutput, text, isPlainObject(tool?.rawInput) ? tool.rawInput : {})
    if (parsed && ((name === 'grep' && parsed.shape === 'matches') || (name === 'glob' && parsed.shape === 'paths'))) {
      return {
        content: [{ type: 'text', text: text || (parsed.shape === 'paths' ? parsed.paths.join('\n') : '') }],
        isError: false,
        meta: parsed,
      }
    }
    return {
      content: [{ type: 'text', text: text || '(no matches)' }],
      isError: false,
    }
  }

  if (name === 'web_search' && !failed) {
    const parsed = parseStructuredWebSearch(tool?.rawOutput, text) ?? parseWebSearchSources(text)
    if (parsed) {
      return {
        content: [{ type: 'text', text }],
        isError: false,
        meta: parsed,
      }
    }
    return { content: [{ type: 'text', text: text || '(no results)' }], isError: false }
  }

  if (name === 'web_fetch' && !failed) {
    const url = argumentsObj.url
    const statusCode = Number.isInteger(tool?.rawOutput?.statusCode) ? tool.rawOutput.statusCode : 200
    return {
      content: [{ type: 'text', text: text || '(empty response)' }],
      isError: false,
      ...(url ? { meta: { url, statusCode, truncated: false } } : {}),
    }
  }

  if (name === 'todo_write' && !failed) {
    return {
      content: [{ type: 'text', text: text || 'Updated task list.' }],
      isError: false,
    }
  }

  if (failed) {
    const reason = text || 'Tool execution failed'
    return {
      content: [{ type: 'text', text: reason }],
      isError: true,
      error: { name: 'ToolExecutionError', code: 'EXECUTION_FAILED', reason: reason.slice(0, 400) },
    }
  }

  return {
    content: [{ type: 'text', text: text || 'Completed' }],
    isError: false,
  }
}

function normalizeTodoStatus(raw) {
  if (raw === 'completed' || raw === 'done') return 'completed'
  if (raw === 'in_progress' || raw === 'active' || raw === 'running') return 'in_progress'
  return 'pending'
}

export function mapPlanTodos(entries) {
  if (!Array.isArray(entries)) return []
  const seen = new Set()
  const todos = []
  for (const entry of entries) {
    const content = typeof entry?.content === 'string' ? entry.content.trim()
      : typeof entry?.text === 'string' ? entry.text.trim()
        : typeof entry?.title === 'string' ? entry.title.trim() : ''
    if (!content || seen.has(content)) continue
    seen.add(content)
    todos.push({ content, status: normalizeTodoStatus(entry.status) })
  }
  return todos
}
