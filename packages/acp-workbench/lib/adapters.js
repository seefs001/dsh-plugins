import { basename } from 'node:path'

const KNOWN_CLAUDE_CONTEXT = [
  { match: /\[1m\]|\b1m\s+context\b/iu, size: 1_000_000 },
  { match: /\bclaude[-_ ]?(?:opus|sonnet|haiku)[-_ ]+5[-_.]5\b|\b(?:opus|sonnet|haiku)\s+5\.5\b/iu, size: 1_000_000 },
  { match: /\bclaude[-_ ]?(?:opus|fable|mythos)[-_ ]+5(?:\b|[-_.][0-9])/iu, size: 1_000_000 },
  { match: /\b(?:opus|fable|mythos)\s+5(?:\.[0-9]+)?\b/iu, size: 1_000_000 },
  { match: /\bclaude[-_ ]?(?:opus|sonnet|haiku)[-_ ]+4[-_.][5678]\b|\b(?:opus|sonnet|haiku)\s+4\.[5678]\b/iu, size: 200_000 },
  { match: /\bclaude[-_ ]?sonnet[-_ ]+5\b|\bsonnet\s+5\b/iu, size: 200_000 },
]

const INTERACTIVE_TOOLS = new Set(['EnterPlanMode', 'ExitPlanMode', 'AskUserQuestion'])
const SHELL_TOOL_NAMES = new Set(['Bash', 'PowerShell', 'Shell', 'run_command', 'exec_command'])
const FETCH_TOOL_NAMES = new Set(['WebFetch', 'read_url_content', 'WebSearch', 'search_web'])
const SEARCH_TOOL_NAMES = new Set(['Grep', 'Glob', 'grep_search', 'find_by_name', 'list_dir', 'LS'])
const SHELL_FENCE_LANGS = new Set(['sh', 'bash', 'zsh', 'shell', 'powershell', 'ps1', 'cmd', 'console'])

const ADAPTERS = {
  cursor: {
    id: 'cursor',
    icon: 'cursor',
    catalogMode: 'cursor-extension',
    mapDefaultToAuto: true,
    probePerModelConfig: false,
    nativeInstructionFiles: ['AGENTS.md', 'CLAUDE.md'],
  },
  antigravity: {
    id: 'antigravity',
    icon: 'antigravity',
    catalogMode: 'config-variants',
    mapDefaultToAuto: false,
    probePerModelConfig: false,
    asyncToolWakeup: true,
    compactMcpBridge: true,
    promptUsageScope: 'turn',
    stepUsageFromWindow: true,
    nativeInstructionFiles: ['AGENTS.md'],
  },
  'claude-code': {
    id: 'claude-code',
    icon: 'claude-code',
    catalogMode: 'probe-models',
    mapDefaultToAuto: false,
    probePerModelConfig: true,
    nativeInstructionFiles: ['CLAUDE.md', 'CLAUDE.local.md'],
  },
  codex: {
    id: 'codex',
    icon: 'codex',
    catalogMode: 'probe-models',
    mapDefaultToAuto: false,
    probePerModelConfig: true,
    nativeInstructionFiles: ['AGENTS.md'],
  },
  hermes: {
    id: 'hermes',
    icon: 'hermes',
    catalogMode: 'probe-models',
    mapDefaultToAuto: false,
    probePerModelConfig: false,
    // external: Hermes exposes edit modes as session modes and edit_approval_policy config options; persisted sessions may hold the older session mode IDs
    legacyModes: {
      default: 'ask',
      accept_edits: 'workspace_session',
      dont_ask: 'session',
    },
  },
  generic: {
    id: 'generic',
    icon: 'generic',
    catalogMode: 'probe-models',
    mapDefaultToAuto: false,
    probePerModelConfig: true,
  },
}

export function resolveAdapter({ providerId, command, agentInfo, capabilities } = {}) {
  const agentName = `${agentInfo?.name ?? ''} ${agentInfo?.title ?? ''}`.toLowerCase()
  const bin = typeof command === 'string' && command ? basename(command).toLowerCase() : ''
  const meta = capabilities?._meta

  if (meta?.antigravity || agentName.includes('antigravity') || providerId === 'antigravity' || bin === 'agy') {
    return ADAPTERS.antigravity
  }
  if (meta?.claudeCode || agentName.includes('claude') || providerId === 'claude-code' || bin.includes('claude')) {
    return ADAPTERS['claude-code']
  }
  if (agentName.includes('cursor') || providerId === 'cursor' || bin === 'cursor-agent' || bin === 'agent') {
    return ADAPTERS.cursor
  }
  if (agentName.includes('codex') || providerId === 'codex' || bin === 'codex-acp' || bin === 'codex') {
    return ADAPTERS.codex
  }
  if (agentName.includes('hermes') || providerId === 'hermes' || bin === 'hermes') {
    return ADAPTERS.hermes
  }
  return ADAPTERS.generic
}

export function legacyModesOf(adapter, provider) {
  const result = {}
  for (const source of [adapter?.legacyModes, provider?.legacyModes]) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) continue
    for (const [legacyId, targetId] of Object.entries(source)) {
      if (typeof legacyId === 'string' && legacyId.trim() && typeof targetId === 'string' && targetId.trim()) {
        result[legacyId.trim()] = targetId.trim()
      }
    }
  }
  return result
}

function unwrapContentBlock(block) {
  return block?.type === 'content' ? block.content : block
}

function parseCodeFence(text) {
  const match = /^(`{3,})([^\n`]*)\r?\n([\s\S]*)\r?\n\1\s*$/u.exec(text.trim())
  if (!match) return { lang: '', body: text }
  return { lang: match[2].trim().toLowerCase(), body: match[3] }
}

function validHttpUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//iu.test(value) || /[\s\\\p{Cc}]/u.test(value)) return null
  try {
    const parsed = new URL(value)
    return parsed.hostname && !parsed.username && !parsed.password ? value : null
  } catch {
    return null
  }
}

export function extractToolStartInput(tool, adapter) {
  if (!tool || typeof tool !== 'object' || Array.isArray(tool)) return null
  if (adapter?.toolStartInputCarryOver === false) return null
  const rawInput = tool.rawInput && typeof tool.rawInput === 'object' && !Array.isArray(tool.rawInput) ? tool.rawInput : {}
  const kind = tool.kind
  const name = typeof tool.name === 'string' && tool.name.trim()
    ? tool.name.trim()
    : typeof tool._meta?.claudeCode?.toolName === 'string' && tool._meta.claudeCode.toolName.trim()
      ? tool._meta.claudeCode.toolName.trim()
      : ''
  const isExecute = kind === 'execute' || SHELL_TOOL_NAMES.has(name)
  const isFetch = kind === 'fetch' || FETCH_TOOL_NAMES.has(name)
  const isSearch = kind === 'search' || SEARCH_TOOL_NAMES.has(name)
  const hasCommand = Boolean(
    (typeof rawInput.command === 'string' && rawInput.command.trim())
    || (Array.isArray(rawInput.command) && rawInput.command.length > 0)
    || (typeof rawInput.CommandLine === 'string' && rawInput.CommandLine.trim())
    || (typeof rawInput.cmd === 'string' && rawInput.cmd.trim()),
  )
  const hasWorkdir = Boolean(
    (typeof rawInput.workdir === 'string' && rawInput.workdir.trim())
    || (typeof rawInput.cwd === 'string' && rawInput.cwd.trim())
    || (typeof rawInput.Cwd === 'string' && rawInput.Cwd.trim())
    || (typeof rawInput.working_directory === 'string' && rawInput.working_directory.trim()),
  )
  const hasUrl = Boolean(
    (typeof rawInput.url === 'string' && rawInput.url.trim())
    || (typeof rawInput.Url === 'string' && rawInput.Url.trim()),
  )
  const hasSearchKey = Boolean(
    (typeof rawInput.pattern === 'string' && rawInput.pattern.trim())
    || (typeof rawInput.Pattern === 'string' && rawInput.Pattern.trim())
    || (typeof rawInput.query === 'string' && rawInput.query.trim())
    || (typeof rawInput.Query === 'string' && rawInput.Query.trim())
    || (typeof rawInput.SearchTerm === 'string' && rawInput.SearchTerm.trim())
    || (typeof rawInput.glob === 'string' && rawInput.glob.trim()),
  )
  const hasPath = Boolean(
    (typeof rawInput.file_path === 'string' && rawInput.file_path.trim())
    || (typeof rawInput.path === 'string' && rawInput.path.trim())
    || (typeof rawInput.filePath === 'string' && rawInput.filePath.trim())
    || (typeof rawInput.Path === 'string' && rawInput.Path.trim())
    || (typeof rawInput.AbsolutePath === 'string' && rawInput.AbsolutePath.trim())
    || (typeof rawInput.TargetFile === 'string' && rawInput.TargetFile.trim())
    || (typeof rawInput.target_file === 'string' && rawInput.target_file.trim()),
  )

  const extracted = {}
  const blocks = Array.isArray(tool.content) ? tool.content : []
  for (const rawBlock of blocks) {
    if (!rawBlock || typeof rawBlock !== 'object') continue
    if (!hasPath && !extracted.file_path && rawBlock.type === 'diff' && typeof rawBlock.path === 'string' && rawBlock.path.trim()) {
      extracted.file_path = rawBlock.path.trim()
      continue
    }
    const block = unwrapContentBlock(rawBlock)
    if (block?.type !== 'text' || typeof block.text !== 'string') continue
    const trimmed = block.text.trim()
    if (!trimmed) continue
    const { lang, body } = parseCodeFence(trimmed)
    const inner = body.trim()
    if (!inner) continue

    if (!hasCommand && !extracted.command) {
      const cwdAndCmd = /^(?:cwd|workdir):\s*([^\r\n]+)\r?\n\$\s+([\s\S]+)$/iu.exec(inner)
      if (cwdAndCmd) {
        if (!hasWorkdir && !extracted.workdir && cwdAndCmd[1].trim()) extracted.workdir = cwdAndCmd[1].trim()
        const cmd = cwdAndCmd[2].trim()
        if (cmd) extracted.command = cmd
      } else if (inner.startsWith('$ ') || inner.startsWith('$\t')) {
        const cmd = inner.slice(1).trim()
        if (cmd) extracted.command = cmd
      } else if (isExecute && lang && SHELL_FENCE_LANGS.has(lang)) {
        extracted.command = inner
      }
    }

    if (isFetch && !hasUrl && !extracted.url && !inner.includes('\n')) {
      const candidate = /^(?:(?:GET|POST|HEAD|FETCH)\s+)?(\S+)$/iu.exec(inner)?.[1]
      const url = validHttpUrl(candidate)
      if (url) extracted.url = url
    }

    if (isSearch && !hasSearchKey && !extracted.pattern && !extracted.query && !extracted.glob && !inner.includes('\n')) {
      const kv = /^(pattern|query|glob):\s*(.+)$/iu.exec(inner)
      if (kv && kv[2].trim()) {
        extracted[kv[1].toLowerCase()] = kv[2].trim()
      }
    }
  }

  if (isExecute && !hasCommand && !extracted.command && typeof tool.title === 'string') {
    const title = tool.title.trim()
    if (title.startsWith('$ ')) {
      const cmd = title.slice(2).trim()
      if (cmd) extracted.command = cmd
    } else {
      const tick = /^`([^`]+)`$/u.exec(title)
      if (tick && tick[1].trim()) extracted.command = tick[1].trim()
    }
  }

  if (isFetch && !hasUrl && !extracted.url && typeof tool.title === 'string') {
    const urlMatch = /(https?:\/\/[^\s)]+)/iu.exec(tool.title)
    const url = urlMatch ? validHttpUrl(urlMatch[1]) : null
    if (url) extracted.url = url
  }

  return Object.keys(extracted).length > 0 ? extracted : null
}

export function isAutoDefaultModel(raw, adapter) {
  if (raw?.id !== 'default') return false
  if (adapter?.mapDefaultToAuto) return true
  const name = typeof raw?.name === 'string' ? raw.name.trim().toLowerCase() : ''
  return name === 'auto'
}

export function inferContextWindow(raw, adapter) {
  const haystack = [raw?.id, raw?.name, raw?.description].filter(item => typeof item === 'string' && item).join(' ')
  if (!haystack) return undefined
  const explicit = /(?:\[|\b)(\d+(?:\.\d+)?)\s*([km])(?:\]|\s+context\b)/iu.exec(haystack)
  if (explicit) {
    const amount = Number(explicit[1])
    if (Number.isFinite(amount) && amount > 0) {
      return Math.round(amount * (explicit[2].toLowerCase() === 'm' ? 1_000_000 : 1_000))
    }
  }
  if (adapter?.id === 'claude-code') {
    for (const entry of KNOWN_CLAUDE_CONTEXT) {
      if (entry.match.test(haystack)) return entry.size
    }
  }
  return undefined
}

export function booleanSelectValues(choices) {
  if (!Array.isArray(choices) || choices.length !== 2) return null
  const values = choices.map(item => typeof item === 'string' ? item : item?.value ?? item?.id)
  if (values.some(item => typeof item !== 'string' || !item)) return null
  const lower = values.map(item => item.toLowerCase())
  const trueIdx = lower.findIndex(item => item === 'true' || item === 'on')
  const falseIdx = lower.findIndex(item => item === 'false' || item === 'off')
  if (trueIdx < 0 || falseIdx < 0 || trueIdx === falseIdx) return null
  return { on: values[trueIdx], off: values[falseIdx] }
}

export function extractAgentMeta(info, sessionResult) {
  const result = {}
  const tier = sessionResult?._meta?.antigravity?.tier
  if (tier && typeof tier === 'object' && typeof tier.name === 'string' && tier.name.trim()) {
    result.tier = {
      name: tier.name.trim(),
      ...(typeof tier.id === 'string' && tier.id.trim() ? { id: tier.id.trim() } : {}),
    }
  }
  if (info?._meta?.steering?.supported === true) result.steering = true
  if (info?.agentCapabilities?._meta?.claudeCode?.promptQueueing === true) result.promptQueueing = true
  if (info?.agentCapabilities?._meta?.antigravity?.systemPrompt?.append === true) result.systemPromptAppend = true
  if (info?.agentCapabilities?.sessionCapabilities?.additionalDirectories) result.additionalDirectories = true
  if (info?.agentCapabilities?.promptCapabilities?.embeddedContext === true) result.embeddedContext = true
  if (info?.agentCapabilities?.auth?.logout) result.authLogout = true
  if (Array.isArray(info?.authMethods) && info.authMethods.length) {
    const methods = info.authMethods
      .filter(item => item && typeof item === 'object' && typeof item.id === 'string' && item.id.trim())
      .slice(0, 16)
      .map(item => ({
        id: item.id.trim(),
        ...(typeof item.name === 'string' && item.name.trim() ? { name: item.name.trim() } : {}),
        ...(typeof item.description === 'string' && item.description.trim() ? { description: item.description.trim() } : {}),
      }))
    if (methods.length) result.authMethods = methods
  }
  const agentInfo = info?.agentInfo ?? info?.serverInfo
  if (agentInfo && typeof agentInfo === 'object') {
    const label = [agentInfo.title ?? agentInfo.name, agentInfo.version].filter(v => typeof v === 'string' && v.trim()).join(' ')
    if (label) result.agentLabel = label
  }
  return Object.keys(result).length ? result : undefined
}

export function isInteractivePermission(params) {
  const options = Array.isArray(params?.options) ? params.options : []
  const allowOnceCount = options.filter(item => item?.kind === 'allow_once').length
  if (allowOnceCount > 1) return true
  const tool = params?.toolCall
  if (!tool) return false
  if (tool.kind === 'switch_mode') return true
  const name = tool.name ?? tool._meta?.claudeCode?.toolName
  if (typeof name === 'string' && INTERACTIVE_TOOLS.has(name)) return true
  return false
}
