import { readFile } from 'node:fs/promises'
import { validateToolArguments } from '@earendil-works/pi-ai/utils/validation'

export const PI_VERSION = '1.7.0'
const entry = import.meta.resolve('@earendil-works/pi-coding-agent')
const manifest = JSON.parse(await readFile(new URL('../package.json', entry), 'utf8'))
if (manifest.version !== PI_VERSION) {
  throw new Error(`dsh-pi-tools requires Pi ${PI_VERSION}; resolved ${manifest.version}`)
}

// external: @earendil-works/pi-coding-agent does not export tool factories separately from its CLI
const [read, bash, edit, write, mime, prompt, shell, find, grep, ls, codemode, search, truncation, outputFiles, paths, mcp, mcpPrompt] = await Promise.all([
  'core/tools/read.js',
  'core/tools/bash.js',
  'core/tools/edit.js',
  'core/tools/write.js',
  'utils/mime.js',
  'core/system-prompt.js',
  'utils/shell.js',
  'core/tools/find.js',
  'core/tools/grep.js',
  'core/tools/ls.js',
  'extensions/codemode/tool.js',
  'extensions/tool-search/tool.js',
  'core/tools/truncate.js',
  'utils/output-files.js',
  'core/tools/path-utils.js',
  'extensions/mcp/tools.js',
  'extensions/mcp/index.js',
].map(path => import(new URL(path, entry).href)))

const factories = {
  read: read.createReadToolDefinition,
  bash: bash.createBashToolDefinition,
  edit: edit.createEditToolDefinition,
  write: write.createWriteToolDefinition,
  grep: grep.createGrepToolDefinition,
  find: find.createFindToolDefinition,
  ls: ls.createLsToolDefinition,
}
export const { createCodemodeToolDefinition } = codemode
export const { createToolSearchToolDefinition } = search
export const { toToolExposure } = mcp
export const { relativizeFindResultPath } = find
export const { resolveToCwd } = paths
export const { writeOutputFile } = outputFiles
export const { sliceHead, sliceTail, truncateHead, truncateLine, formatSize, DEFAULT_MAX_BYTES, GREP_MAX_LINE_LENGTH } = truncation
export const detectImageMimeType = mime.detectSupportedImageMimeType
export const getShellConfig = shell.getShellConfig

export function mcpServersContext(mcpServers = [], mcpExposure = 'codemode') {
  if (!Array.isArray(mcpServers) || mcpServers.length === 0) return ''
  return mcpPrompt.renderServersSection(mcpServers.map(name => ({
    entry: { name, config: { exposure: mcpExposure } },
  })))
}

export function toolPrompt(definitions, { cwd = '.', mcpServers = [], mcpExposure = 'codemode', includeDynamicContext = false } = {}) {
  const servers = includeDynamicContext ? mcpServersContext(mcpServers, mcpExposure) : ''
  const sections = prompt.buildSystemPromptSections({
    cwd,
    selectedTools: definitions.map(tool => tool.name),
    toolSnippets: Object.fromEntries(definitions.map(tool => [tool.name, tool.promptSnippet])),
    toolGuidelines: Object.fromEntries(definitions.map(tool => [tool.name, tool.promptGuidelines ?? []])),
    sections: servers ? { mcp_servers: servers } : {},
  })
  if (!includeDynamicContext) delete sections.cwd
  return Object.values(sections).filter(Boolean).join('\n\n')
}

export function createDefinitions(cwd, operations, names = Object.keys(factories)) {
  return names.map(name => factories[name](cwd, {
    ...(operations ? { operations: operations[name] } : {}),
    ...(name === 'bash' ? { exposeSessionEnvironment: false } : {}),
  }))
}

// external: TypeBox schemas carry non-JSON symbol metadata that breaks structured serialization
export function jsonValue(value) {
  return JSON.parse(JSON.stringify(value))
}

export function schemaOf(tool) {
  return {
    name: tool.name, description: tool.description, parameters: jsonValue(tool.parameters),
    ...tool.constrainedSampling === undefined ? {} : { constrainedSampling: jsonValue(tool.constrainedSampling) },
  }
}

export function prepareArguments(tool, args, exec) {
  const input = jsonValue(args)
  const prepared = tool.prepareArguments ? tool.prepareArguments(input) : input
  return validateToolArguments(tool, { id: exec.callId, name: tool.name, arguments: prepared })
}

export async function invoke(tool, args, exec, context, onUpdate) {
  return tool.execute(exec.callId, prepareArguments(tool, args, exec), exec.signal, onUpdate, context)
}
