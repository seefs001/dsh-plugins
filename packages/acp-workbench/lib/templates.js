import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const PROVIDER_TEMPLATES = [
  { id: 'cursor', label: 'Cursor', bin: 'cursor-agent', args: ['acp'], defaultProvider: true },
  { id: 'antigravity', label: 'Antigravity', bin: 'agy', args: ['acp'], defaultProvider: true },
  // external: @agentclientprotocol/claude-agent-acp serves ACP on stdio without CLI arguments
  { id: 'claude-code', label: 'Claude Code', bin: 'claude-agent-acp', args: [], defaultProvider: true },
  // external: @agentclientprotocol/codex-acp serves ACP on stdio without CLI arguments
  { id: 'codex', label: 'Codex', bin: 'codex-acp', args: [], defaultProvider: false },
  { id: 'gemini', label: 'Gemini CLI', bin: 'gemini', args: ['--acp'], defaultProvider: false },
  { id: 'opencode', label: 'OpenCode', bin: 'opencode', args: ['acp'], defaultProvider: false },
  { id: 'copilot', label: 'GitHub Copilot', bin: 'copilot', args: ['--acp'], defaultProvider: false },
]

const CLI_SEARCH_DIRS = ['.local/bin', '.bun/bin']
const TEMPLATE_CACHE_TTL_MS = 60_000
let cachedDefaultTemplates = null
let cachedDefaultAt = 0

export function resolveCliCommand(name, { home = homedir(), exists = existsSync } = {}) {
  for (const dir of CLI_SEARCH_DIRS) {
    const candidate = join(home, dir, name)
    if (exists(candidate)) return candidate
  }
  return name
}

export function resolveProviderTemplates(options) {
  if (options === undefined) {
    const now = Date.now()
    if (cachedDefaultTemplates && now - cachedDefaultAt < TEMPLATE_CACHE_TTL_MS) {
      return cachedDefaultTemplates
    }
    cachedDefaultTemplates = PROVIDER_TEMPLATES.map(template => ({
      id: template.id,
      label: template.label,
      bin: template.bin,
      command: resolveCliCommand(template.bin),
      args: [...template.args],
      defaultProvider: template.defaultProvider,
    }))
    cachedDefaultAt = now
    return cachedDefaultTemplates
  }
  return PROVIDER_TEMPLATES.map(template => ({
    id: template.id,
    label: template.label,
    bin: template.bin,
    command: resolveCliCommand(template.bin, options),
    args: [...template.args],
    defaultProvider: template.defaultProvider,
  }))
}

export function defaultProviders(options) {
  return resolveProviderTemplates(options)
    .filter(template => template.defaultProvider)
    .map(({ id, label, command, args }) => ({ id, label, command, args, models: [] }))
}
