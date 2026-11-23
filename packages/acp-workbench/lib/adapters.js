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

const ADAPTERS = {
  cursor: {
    id: 'cursor',
    catalogMode: 'cursor-extension',
    mapDefaultToAuto: true,
    probePerModelConfig: false,
  },
  antigravity: {
    id: 'antigravity',
    catalogMode: 'config-variants',
    mapDefaultToAuto: false,
    probePerModelConfig: false,
    asyncToolWakeup: true,
  },
  'claude-code': {
    id: 'claude-code',
    catalogMode: 'probe-models',
    mapDefaultToAuto: false,
    probePerModelConfig: true,
  },
  generic: {
    id: 'generic',
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
  return ADAPTERS.generic
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
