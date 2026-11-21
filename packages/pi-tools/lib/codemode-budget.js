import { createCodemodeToolDefinition as createNativeTool, sliceHead, sliceTail, writeOutputFile } from './pi.js'
import { borrowRunnerPool } from './moe-runner.js'

const DEFAULT_TOKENS = 2000
// external: Pi output estimator counts 4 UTF-16 code units per token
const TEXT_BUDGET = DEFAULT_TOKENS * 4

function describe(description) {
  return description
    .replace('QuickJS sandbox', 'MoeJS sandbox')
    .replace('"max_output_tokens": 10000', `"max_output_tokens": ${DEFAULT_TOKENS}`)
    .replace('- Optional first line:', `- Batch text defaults to ~${TEXT_BUDGET} characters; oversized results link to the full output. Override on the first line:`)
}

function hasExplicitBudget(source) {
  const firstLine = source.split('\n', 1)[0].trimStart()
  const prefix = '// @options:'
  return firstLine.startsWith(prefix) && Object.hasOwn(JSON.parse(firstLine.slice(prefix.length)), 'max_output_tokens')
}

async function budgetResult(result, source) {
  const [header, ...items] = result.content
  const chars = items.reduce((n, item) => n + (item.type === 'text' ? item.text.length : 0), 0)
  if (chars <= TEXT_BUDGET || hasExplicitBudget(source)) return result

  const parts = []
  const media = []
  for (const [i, item] of items.entries()) {
    if (item.type !== 'text') media.push(item)
    else if (items[i + 1]?.type === 'image') {
      // external: Pi codemode appends each image's file label as the last line of the preceding text block
      const label = item.text.lastIndexOf('\n') + 1
      if (label) parts.push(item.text.slice(0, label - 1))
      media.push({ type: 'text', text: item.text.slice(label) })
    } else parts.push(item.text)
  }
  let body = parts.join('\n')
  if (body.length <= TEXT_BUDGET) return result
  let path = result.details.fullOutputPath
  if (path) {
    const footer = `\n\n[Full output: ${path} (read with offset/limit)]`
    if (body.endsWith(footer)) body = body.slice(0, -footer.length)
  } else {
    if (body.startsWith('Warning: truncated output') && body.includes('\n\n[Could not save the full output:')) return result
    try {
      const original = items.filter(item => item.type === 'text').map(item => item.text).join('\n')
      path = await writeOutputFile('pi-codemode', '.txt', original)
    } catch (error) {
      return { ...result, content: [...result.content, { type: 'text', text: `Could not save the full output; kept the original result: ${error.message}` }] }
    }
  }
  const preview = `${sliceHead(body, TEXT_BUDGET / 2)}\n… output omitted …\n${sliceTail(body, TEXT_BUDGET / 2)}\n\n[Full output: ${path} (read with offset/limit)]`
  return { ...result, details: { ...result.details, fullOutputPath: path }, content: [header, { type: 'text', text: preview }, ...media] }
}

export function createCodemodeToolDefinition(options = {}) {
  const tool = createNativeTool(options)
  return {
    ...tool,
    description: describe(tool.description),
    prepareLoadout(loadout) {
      const prepared = tool.prepareLoadout(loadout)
      prepared.descriptions.codemode = describe(prepared.descriptions.codemode)
      return prepared
    },
    async execute(id, args, signal, onUpdate, ctx) {
      const { executeCodemode } = await import('./generated/moe-execute.js')
      const runnerPool = options.runnerPool ?? borrowRunnerPool()
      try {
        return await budgetResult(await executeCodemode(id, args, signal, onUpdate, ctx, { ...options, runnerPool }), args.code)
      } finally {
        if (!options.runnerPool) await runnerPool.close()
      }
    },
  }
}
