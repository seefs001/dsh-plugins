import { createCodemodeToolDefinition } from './codemode-budget.js'
import { createDefinitions, createToolSearchToolDefinition, jsonValue, PI_VERSION, prepareArguments, resolveToCwd, schemaOf, toolPrompt } from './pi.js'
import { createOperations } from './operations.js'
import { Config, normalizeConfig } from './harness.js'
import { STATE_META, stateDefinition } from './state.js'
import { PiLoadout } from './loadout.js'
import { registerOptionsRoute, selectionDefinition } from './selection.js'
import { addPiAiRequestTransform } from './pi-ai-hook.js'
import { messagesPrefillTransform } from './messages-prefill.js'
import { PiExecutor } from './executor.js'
import { runGrep } from './search.js'
import { apply as registerSkillContext } from './skill-context.js'

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

const MAX_META_READ_LINES = 5000

function readLinesMeta(path, text, offset = 1, details) {
  if (typeof text !== 'string') return undefined
  const body = text.replace(/\n\n\[(?:Showing lines|[\d.]+(?:B|KB|MB) limit)[^\]]*\]\s*$/u, '')
  const rows = body === '' ? [] : body.split(/\r?\n/u)
  if (rows.length > MAX_META_READ_LINES) return undefined
  const lines = rows.map((line, index) => ({ number: offset + index, text: line }))
  const totalLines = Number.isInteger(details?.truncation?.totalLines)
    ? details.truncation.totalLines
    : Math.max(offset + lines.length - 1, lines.length)
  return { path, offset, lines, totalLines }
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
          meta: {},
        },
        required: ['content'],
      },
      render: (_args, value) => value.content,
      presentationMeta: (_args, value) => ({
        ...value.meta,
        piVersion: PI_VERSION,
        ...(value.details ? { pi: value.details } : {}),
        ...(value.file ? { piFile: value.file } : {}),
        ...(value.state ? { [STATE_META]: value.state } : {}),
      }),
    },
    async execute(args, exec) {
      let result
      let file
      let meta
      if (definition.name === 'codemode' || definition.name === 'tool_search') {
        if (!executor) throw new Error('Pi execution requires the preset executor')
        result = definition.name === 'codemode' ? await executor.codemode(args, exec) : await executor.search(args, exec)
      } else {
        const cwd = exec.agent
          ? await ctx.workingDirectory.ensure(exec.agent, exec.signal)
          : ctx.workingDirectory.defaultDirectory
        const operations = createOperations(ctx, exec, cwd, config)
        let capturedBefore = null
        let capturedAfter = null
        let capturedPaths = null
        if (definition.name === 'edit') {
          const origRead = operations.edit.readFile
          const origWrite = operations.edit.writeFile
          operations.edit = {
            ...operations.edit,
            readFile: async path => {
              const buf = await origRead(path)
              capturedBefore = buf.toString('utf8')
              return buf
            },
            writeFile: async (path, text) => {
              await origWrite(path, text)
              capturedAfter = text
            },
          }
        } else if (definition.name === 'find') {
          const origGlob = operations.find.glob
          operations.find = {
            ...operations.find,
            glob: async (pattern, root, options) => {
              const paths = await origGlob(pattern, root, options)
              capturedPaths = paths
              return paths
            },
          }
        } else if (definition.name === 'ls') {
          const origReaddir = operations.ls.readdir
          operations.ls = {
            ...operations.ls,
            readdir: async input => {
              const entries = await origReaddir(input)
              capturedPaths = entries
              return entries
            },
          }
        }
        try {
          const tool = definition.name === 'grep' ? definition : createDefinitions(cwd, operations, [definition.name])[0]
          const input = prepareArguments(tool, args, exec)
          if (definition.name === 'write' && typeof input.path === 'string') {
            try { capturedBefore = (await operations.read.readFile(input.path)).toString('utf8') } catch { capturedBefore = null }
          }
          result = definition.name === 'grep'
            ? await runGrep(input, operations.grep)
            : await tool.execute(exec.callId, input, exec.signal)
          if (definition.name === 'edit') {
            const target = resolveToCwd(input.path, cwd)
            file = { path: target, line: result.details?.firstChangedLine ?? 1 }
            meta = {
              path: target,
              ...(capturedAfter !== null ? { diffs: [{ path: target, oldText: capturedBefore, newText: capturedAfter }] } : {}),
            }
          } else if (definition.name === 'write' && typeof input.path === 'string') {
            const target = resolveToCwd(input.path, cwd)
            file = { path: target, line: 1 }
            meta = {
              path: target,
              ...(typeof input.content === 'string' ? { diffs: [{ path: target, oldText: capturedBefore, newText: input.content }] } : {}),
            }
          } else if (definition.name === 'read' && typeof input.path === 'string' && !result.content.some(block => block.type === 'image')) {
            const target = resolveToCwd(input.path, cwd)
            const offset = Number.isInteger(input.offset) && input.offset >= 1 ? input.offset : 1
            file = { path: target, line: offset }
            const text = result.content.filter(block => block.type === 'text').map(block => block.text).join('\n')
            meta = readLinesMeta(target, text, offset, result.details) ?? { path: target }
          } else if (definition.name === 'grep' && result.meta) {
            meta = result.meta
          } else if ((definition.name === 'find' || definition.name === 'ls') && Array.isArray(capturedPaths)) {
            meta = {
              shape: 'paths',
              paths: capturedPaths,
              total: capturedPaths.length,
              truncated: Boolean(result.details?.resultLimitReached || result.details?.entryLimitReached || result.details?.truncation?.truncated),
            }
          } else if (definition.name === 'bash') {
            meta = { cwd }
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
      return jsonValue({ content, details: result.details, structuredContent: result.structuredContent, state: result.state, file, meta })
    },
    projectContent: (exec, result) => {
      const authored = errors.get(exec.token)
      errors.delete(exec.token)
      if (!result.isError || !result.error || result.error.info) return undefined
      return authored?.message === result.error.message ? authored.content : [{ type: 'text', text: result.error.message }]
    },
  }))
}

// external: DSH drops constrainedSampling from tool declarations before calling pi-ai
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

async function installRequestTransforms(ctx) {
  try {
    const sampling = codemodeSamplingTransform()
    const hook = await addPiAiRequestTransform(request => messagesPrefillTransform(sampling(request)))
    ctx.effect(() => hook.remove, 'pi-tools: model request compatibility')
  } catch (error) {
    ctx.logger?.warn?.(`pi-tools: model request compatibility unavailable (${error instanceof Error ? error.message : error})`)
  }
}

export async function apply(ctx, rawConfig = {}) {
  const config = normalizeConfig(rawConfig)
  if (config.presentationOnly) {
    registerOptionsRoute(ctx)
    await installRequestTransforms(ctx)
    return
  }
  if (config.scopedTools.includes('work_read') && config.scopedTools.includes('work_update')) {
    await ctx.inject(['workTimeline'], scope => scope.workTimeline.registerTools(scope)).await()
  }
  await registerSkillContext(ctx)
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
      const cwd = scope?.session ? ctx.workingDirectory.get(scope.session) : ctx.workingDirectory.defaultDirectory
      return toolPrompt(selected, { cwd, mcpServers: servers, mcpExposure: config.mcpExposure })
    },
    interpolate: false,
  })
}
