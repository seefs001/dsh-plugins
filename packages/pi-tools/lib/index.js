import { createCodemodeToolDefinition, createDefinitions, createToolSearchToolDefinition, jsonValue, PI_VERSION, prepareArguments, resolveToCwd, schemaOf, toolPrompt } from './pi.js'
import { createOperations } from './operations.js'
import { Config, normalizeConfig } from './harness.js'
import { STATE_META, stateDefinition } from './state.js'
import { PiLoadout } from './loadout.js'
import { registerOptionsRoute, selectionDefinition } from './selection.js'
import { addPiAiRequestTransform } from './pi-ai-hook.js'
import { PiExecutor } from './executor.js'
import { runGrep } from './search.js'

export { Config }
export const name = 'pi-tools'
export const inject = ['tools', 'systemPrompt', 'fs', 'subprocess', 'sandbox', 'sandboxPolicy', 'workingDirectory', 'attachments', 'sessionProjections']

async function convertContent(ctx, content) {
  return Promise.all(content.map(async block => {
    if (block.type === 'text') return { type: 'text', text: block.text }
    if (block.type === 'image') {
      const attachment = await ctx.attachments.saveImage({
        data: Buffer.from(block.data, 'base64'),
        mediaType: block.mimeType,
      })
      return { type: 'image', attachment }
    }
    throw new Error(`Unsupported Pi content type: ${block.type}`)
  }))
}

export function piDefinitions(cwd, config) {
  return [
    ...createDefinitions(cwd, undefined, config.tools),
    ...config.codemode ? [createCodemodeToolDefinition({ models: false })] : [],
    ...config.toolSearch ? [createToolSearchToolDefinition({ tools: {
      getAllTools: () => [], getActiveTools: () => [], setActiveTools: () => {},
    } })] : [],
  ]
}

export function createTools(ctx, config = normalizeConfig(), executor) {
  const errors = new WeakMap()
  return piDefinitions(ctx.workingDirectory.defaultDirectory, config).map(definition => ({
    ...schemaOf(definition),
    isConcurrencySafe: () => ['read', 'ls', 'find', 'grep'].includes(definition.name),
    output: {
      schema: {
        type: 'object',
        properties: {
          content: { type: 'array', items: { type: 'object' } },
          details: {},
          structuredContent: {},
          state: {},
          file: {},
        },
        required: ['content'],
      },
      render: (_args, value) => value.content,
      presentationMeta: (_args, value) => ({
        piVersion: PI_VERSION,
        ...(value.details ? { pi: value.details } : {}),
        ...(value.file ? { piFile: value.file } : {}),
        ...(value.state ? { [STATE_META]: value.state } : {}),
      }),
    },
    async execute(args, exec) {
      let result
      let file
      if (definition.name === 'codemode' || definition.name === 'tool_search') {
        if (!executor) throw new Error('Pi execution requires the preset executor')
        result = definition.name === 'codemode' ? await executor.codemode(args, exec) : await executor.search(args, exec)
      } else {
        const cwd = exec.agent
          ? await ctx.workingDirectory.ensure(exec.agent, exec.signal)
          : ctx.workingDirectory.defaultDirectory
        const operations = createOperations(ctx, exec, cwd, config)
        try {
          const tool = definition.name === 'grep' ? definition : createDefinitions(cwd, operations, [definition.name])[0]
          const input = prepareArguments(tool, args, exec)
          result = definition.name === 'grep'
            ? await runGrep(input, operations.grep)
            : await tool.execute(exec.callId, input, exec.signal)
          if (['read', 'edit', 'write'].includes(definition.name)) {
            file = { path: resolveToCwd(input.path, cwd), line: definition.name === 'edit'
              ? result.details?.firstChangedLine ?? 1 : input.offset ?? 1 }
          }
        } finally {
          await operations.drain()
        }
      }
      const content = await convertContent(ctx, result.content)
      if (result.isError) {
        const message = content.filter(block => block.type === 'text').map(block => block.text).join('\n')
        errors.set(exec.token, { message, content })
        if (result.structuredContent !== undefined) {
          executor?.rememberStructuredError(exec, { message, content, value: result.structuredContent })
        }
        throw new Error(message)
      }
      return jsonValue({ content, details: result.details, structuredContent: result.structuredContent, state: result.state, file })
    },
    // Preserve Pi script errors' partial text/images before post-execute policy.
    // Never replace authoritative structured Harness errors or cancellation.
    projectContent: (exec, result) => {
      const authored = errors.get(exec.token)
      errors.delete(exec.token)
      if (!result.isError || !result.error || result.error.info) return undefined
      return authored?.message === result.error.message ? authored.content : [{ type: 'text', text: result.error.message }]
    },
  }))
}

// Stock DSH drops `constrainedSampling` from tool declarations before pi-ai.
// Re-attach Pi's codemode grammar to the exact Pi codemode declaration so
// pi-ai can use raw-JavaScript custom-tool transport where the route supports it.
export function codemodeSamplingTransform(codemode = createCodemodeToolDefinition({ models: false })) {
  const parameters = JSON.stringify(jsonValue(codemode.parameters))
  const constrainedSampling = jsonValue(codemode.constrainedSampling)
  return request => {
    const tools = request.context?.tools
    if (!Array.isArray(tools) || !tools.some(tool => tool?.name === 'codemode' && tool.constrainedSampling === undefined)) return request
    return {
      ...request,
      context: {
        ...request.context,
        tools: tools.map(tool => tool?.name === 'codemode' && tool.constrainedSampling === undefined
          && JSON.stringify(tool.parameters) === parameters ? { ...tool, constrainedSampling } : tool),
      },
    }
  }
}

async function restoreCodemodeSampling(ctx) {
  try {
    const hook = await addPiAiRequestTransform(codemodeSamplingTransform())
    ctx.effect(() => hook.remove, 'pi-tools: codemode grammar sampling')
  } catch (error) {
    ctx.logger?.warn?.(`pi-tools: codemode grammar sampling is unavailable; codemode uses JSON transport (${error instanceof Error ? error.message : error})`)
  }
}

export async function apply(ctx, rawConfig = {}) {
  const config = normalizeConfig(rawConfig)
  if (config.presentationOnly) {
    registerOptionsRoute(ctx)
    await restoreCodemodeSampling(ctx)
    return
  }
  const state = await ctx.sessionProjections.register(stateDefinition)
  const selection = await ctx.sessionProjections.register(selectionDefinition)
  const definitions = piDefinitions(ctx.workingDirectory.defaultDirectory, config)
  const loadout = new PiLoadout(ctx, config, state, definitions, selection)
  const executor = new PiExecutor(ctx, config, loadout)
  for (const tool of createTools(ctx, config, executor)) {
    ctx.tools.register(tool, { when: ({ agent }) => loadout.enabled(tool.name, agent) })
  }
  ctx.tools.setExecutor(executor)
  ctx.systemPrompt.section({
    name: 'pi-tools:persona',
    order: 0,
    complete: true,
    text: ({ scope }) => {
      const selected = definitions.filter(tool => loadout.enabled(tool.name, scope))
      const servers = [...new Set([...loadout.bridges.keys()]
        .filter(toolName => loadout.enabled(toolName, scope))
        .map(toolName => loadout.serverOf(toolName))
        .filter(server => server !== undefined))].toSorted()
      return toolPrompt(selected) + loadout.delegationPrompt(scope) + (servers.length && config.mcpExposure !== 'hidden'
        ? `\n\nMCP tool namespaces enabled in this session: ${servers.map(server => `mcp__${server}`).join(', ')}.\n`
          + (selected.some(tool => tool.name === 'codemode') ? 'Use codemode searchTools()/describeTool() to discover callable tools. ' : '')
          + (selected.some(tool => tool.name === 'tool_search') ? 'Use tool_search to load additional model-facing tool declarations. ' : '')
          + 'MCP connections and credentials are managed by DeepSeek Harness; remote MCP access is not limited by the local filesystem sandbox.'
        : '')
    },
    interpolate: false,
  })
}
