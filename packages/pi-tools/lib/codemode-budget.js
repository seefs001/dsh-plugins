import { createCodemodeToolDefinition as createNativeTool, sliceHead, sliceTail, writeOutputFile } from './pi.js'

import { borrowRunnerPool } from './moe-runner.js'

const DEFAULT_TOKENS = 2000
const TEXT_BUDGET = DEFAULT_TOKENS * 4 // Pi's output estimator counts UTF-16 code units.

function describe(description, backend) {
  if (backend === 'moejs') description = description.replace('QuickJS sandbox', 'MoeJS sandbox')
  return description.replace('"max_output_tokens": 10000', `"max_output_tokens": ${DEFAULT_TOKENS}`)
    .replace('- Optional first line:', `- Batch text defaults to ~${TEXT_BUDGET} characters; oversized results link to the full output. Override on the first line:`)
}

// Called only after native execution, so Pi has already validated the directive.
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
      // Pi appends the image's file label as the last line before the image.
      const label = item.text.lastIndexOf('\n') + 1
      if (label) parts.push(item.text.slice(0, label - 1))
      media.push({ type: 'text', text: item.text.slice(label) })
    } else parts.push(item.text)
  }
  let body = parts.join('\n')
  if (body.length <= TEXT_BUDGET) return result
  let path = result.details.fullOutputPath
  if (path) {
    // Pi already spilled the original. Never replace it with a file of its preview.
    const footer = `\n\n[Full output: ${path} (read with offset/limit)]`
    if (body.endsWith(footer)) body = body.slice(0, -footer.length)
  } else {
    // If Pi already reported a spill failure, keep its diagnostic and remaining evidence.
    if (body.startsWith('Warning: truncated output') && body.includes('\n\n[Could not save the full output:')) return result
    try {
      // Spill the untouched native text, including whitespace and image labels.
      const original = items.filter(item => item.type === 'text').map(item => item.text).join('\n')
      path = await writeOutputFile('pi-codemode', '.txt', original)
    } catch (error) {
      return { ...result, content: [...result.content, { type: 'text', text: `Could not save the full output; kept the original result: ${error.message}` }] }
    }
  }
  const preview = `${sliceHead(body, TEXT_BUDGET / 2)}\n… output omitted …\n${sliceTail(body, TEXT_BUDGET / 2)}\n\n[Full output: ${path} (read with offset/limit)]`
  return { ...result, details: { ...result.details, fullOutputPath: path }, content: [header, { type: 'text', text: preview }, ...media] }
}

// Apply the smaller default at the return boundary. Injecting an @options line
// into the user's source would shift QuickJS stack locations by one line.
export function createCodemodeToolDefinition(options = {}) {
  const backend = options.codemodeBackend ?? 'moejs'
  const tool = createNativeTool(options)
  return {
    ...tool,
    description: describe(tool.description, backend),
    prepareLoadout(loadout) {
      const prepared = tool.prepareLoadout(loadout)
      prepared.descriptions.codemode = describe(prepared.descriptions.codemode, backend)
      return prepared
    },
    async execute(id, args, signal, onUpdate, ctx) {
      if (backend === 'quickjs') return budgetResult(await tool.execute(id, args, signal, onUpdate, ctx), args.code)
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
