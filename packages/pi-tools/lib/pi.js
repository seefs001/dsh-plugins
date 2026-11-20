import { readFile } from 'node:fs/promises'
import { validateToolArguments } from '@earendil-works/pi-ai/utils/validation'

export const PI_VERSION = '1.6.0'
const entry = import.meta.resolve('@earendil-works/pi-coding-agent')
const manifest = JSON.parse(await readFile(new URL('../package.json', entry), 'utf8'))
if (manifest.version !== PI_VERSION) {
  throw new Error(`dsh-pi-tools requires Pi ${PI_VERSION}; resolved ${manifest.version}`)
}

// These private module paths are intentionally coupled to the exact version above.
// Import the tools, not Pi's CLI, extension loader, settings, or agent loop.
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

export const factories = {
  read: read.createReadToolDefinition,
  bash: bash.createBashToolDefinition,
  edit: edit.createEditToolDefinition,
  write: write.createWriteToolDefinition,
  grep: grep.createGrepToolDefinition,
  find: find.createFindToolDefinition,
  ls: ls.createLsToolDefinition,
}
export const { createCodemodeToolDefinition, createCodemodeDescription } = codemode
export const { createToolSearchToolDefinition } = search
export const { toToolExposure } = mcp
export const { relativizeFindResultPath } = find
export const { resolveToCwd } = paths
export const { writeOutputFile } = outputFiles
export const { sliceHead, sliceTail, truncateHead, truncateLine, formatSize, DEFAULT_MAX_BYTES, GREP_MAX_LINE_LENGTH } = truncation
export const detectImageMimeType = mime.detectSupportedImageMimeType
export const getShellConfig = shell.getShellConfig

// Keep Pi's complete prompt, including its preamble, docs, and cwd. Runtime
// facts and enforcement still belong to DSH, not to a rewritten Pi persona.
export function toolPrompt(definitions, { cwd = '.', mcpServers = [], mcpExposure = 'codemode' } = {}) {
  const servers = mcpPrompt.renderServersSection(mcpServers.map(name => ({
    entry: { name, config: { exposure: mcpExposure } },
  })))
  return prompt.buildSystemPrompt({
    cwd,
    selectedTools: definitions.map(tool => tool.name),
    toolSnippets: Object.fromEntries(definitions.map(tool => [tool.name, tool.promptSnippet])),
    toolGuidelines: Object.fromEntries(definitions.map(tool => [tool.name, tool.promptGuidelines ?? []])),
    sections: servers ? { mcp_servers: servers } : {},
  })
}

export function createDefinitions(cwd, operations, names = Object.keys(factories)) {
  return names.map(name => factories[name](cwd, {
    ...(operations ? { operations: operations[name] } : {}),
    // There is no Pi SessionManager inside DSH. Do not advertise fictitious PI_* metadata.
    ...(name === 'bash' ? { exposeSessionEnvironment: false } : {}),
  }))
}

// Strip TypeBox's non-JSON metadata without changing the model-facing schema.
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

export const buildPiPromptSections = prompt.buildSystemPromptSections
