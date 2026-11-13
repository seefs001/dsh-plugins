import { readFile } from 'node:fs/promises'
import { validateToolArguments } from '@earendil-works/pi-ai/utils/validation'
import { CODEMODE_STRING_GUIDANCE } from './codemode-syntax.js'

export const PI_VERSION = '1.5.0'
const entry = import.meta.resolve('@earendil-works/pi-coding-agent')
const manifest = JSON.parse(await readFile(new URL('../package.json', entry), 'utf8'))
if (manifest.version !== PI_VERSION) {
  throw new Error(`dsh-pi-tools requires Pi ${PI_VERSION}; resolved ${manifest.version}`)
}

// These private module paths are intentionally coupled to the exact version above.
// Import the tools, not Pi's CLI, extension loader, settings, or agent loop.
const [read, bash, edit, write, mime, prompt, shell, find, grep, ls, codemode, search, truncation, paths, mcp] = await Promise.all([
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
  'core/tools/path-utils.js',
  'extensions/mcp/tools.js',
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
export const { truncateHead, truncateLine, formatSize, DEFAULT_MAX_BYTES, GREP_MAX_LINE_LENGTH } = truncation
export const detectImageMimeType = mime.detectSupportedImageMimeType
export const getShellConfig = shell.getShellConfig

export function toolPrompt(definitions) {
  const sections = prompt.buildSystemPromptSections({
    cwd: '.',
    selectedTools: definitions.map(tool => tool.name),
    toolSnippets: Object.fromEntries(definitions.map(tool => [tool.name, tool.promptSnippet])),
    toolGuidelines: Object.fromEntries(definitions.map(tool => [tool.name, tool.promptGuidelines ?? []])),
  })
  return [
    'You are a coding assistant running inside DeepSeek Harness with the Pi 1.5.0 tool set.',
    sections.tools,
    sections.rules,
    ...definitions.some(tool => tool.name === 'codemode') ? [CODEMODE_STRING_GUIDANCE] : [],
    'DSH owns session permissions and the execution environment. A denied operation remains denied; do not work around it. Tool parameters do not support permission escalation. Ask the user to change permissions when necessary.',
  ].join('\n\n')
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
