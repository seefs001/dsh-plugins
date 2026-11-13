import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Use the running Harness's public exports, never another installed generation.
// This also supports source launches whose release has not reached npm yet.
const anchor = process.env.DSH_INSTALL_DIR
  ? join(process.env.DSH_INSTALL_DIR, 'package.json')
  : process.argv[1]
if (!anchor) throw new Error('Pi tools must run inside a DSH installation')
const require = createRequire(realpathSync(anchor))
const load = specifier => import(pathToFileURL(require.resolve(specifier)).href)
const [tools, pipeline, schema] = await Promise.all([
  load('@deepseek-ai/dsh-tools'),
  load('@deepseek-ai/dsh-tools/pipeline'),
  load('@deepseek-ai/schemastery'),
])
const toolsRequire = createRequire(require.resolve('@deepseek-ai/dsh-tools'))
const { scopeOf, scopeChainOf } = await import(pathToFileURL(toolsRequire.resolve('@deepseek-ai/dsh-scope')).href)
const projectionRequire = createRequire(require.resolve('@deepseek-ai/dsh-session-projection'))
const { z } = await import(pathToFileURL(projectionRequire.resolve('zod')).href)

export const { ToolExecutionPipeline, executeToolBatch } = pipeline
export const { ToolNotFoundError, projectToolSchema } = tools
export const Schema = schema.default
export { z, scopeOf, scopeChainOf }

export const Config = Schema.object({
  presentationOnly: Schema.boolean().default(false).description('Mount only the Web presentation companion; do not register tools, prompts, or state.'),
  tools: Schema.array(Schema.union(['read', 'bash', 'edit', 'write', 'grep', 'find', 'ls']))
    .default(['read', 'bash', 'edit', 'write', 'grep', 'find', 'ls']),
  codemode: Schema.boolean().default(true),
  toolSearch: Schema.boolean().default(true),
  scopedTools: Schema.array(Schema.string().min(1)).default([])
    .description('Native DSH tool names mounted in this preset, enabled by default unless the session has an explicit selection.'),
  globalTools: Schema.array(Schema.string().min(1)).default([])
    .description('Native global tools enabled by default, retaining their original registration and activation conditions.'),
  optInTools: Schema.array(Schema.string().min(1)).default([])
    .description('Names from scopedTools or globalTools that stay in the picker but are off until the session selects them.'),
  mcpServers: Schema.array(Schema.string()).default([]),
  mcpExposure: Schema.union(['direct', 'codemode', 'deferred', 'hidden']).default('codemode'),
  maxParallel: Schema.natural().min(1).default(10),
  rgCommand: Schema.string().default('rg'),
  fdCommand: Schema.string().default('fd'),
})

export function normalizeConfig(raw = {}) {
  const config = Config(raw)
  if (new Set(config.tools).size !== config.tools.length) throw new Error('Pi tool names must be unique')
  if (new Set(config.scopedTools).size !== config.scopedTools.length) throw new Error('Pi scoped tool names must be unique')
  const nativeNames = [...config.scopedTools, ...config.globalTools]
  if (new Set(nativeNames).size !== nativeNames.length) throw new Error('Pi native tool names must be unique across scopedTools and globalTools')
  for (const server of config.mcpServers) {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(server)) throw new Error(`Invalid MCP server name: ${server}`)
  }
  if (!config.codemode && config.mcpExposure === 'codemode' && config.mcpServers.length) {
    throw new Error('MCP codemode exposure requires codemode')
  }
  if (!config.toolSearch && config.mcpExposure === 'deferred' && config.mcpServers.length) {
    throw new Error('Deferred MCP exposure requires toolSearch')
  }
  return config
}
