import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

// external: DSH has no pi-ai request hook, so wrap Models.prototype.streamSimple on DSH's pi-ai instance
const KEY = Symbol.for('dsh-plugins.pi-ai-request-transforms')
const VERSION = 1

function piAiDirectory() {
  const anchor = process.env.DSH_INSTALL_DIR ? join(process.env.DSH_INSTALL_DIR, 'package.json') : process.argv[1]
  if (!anchor) throw new Error('not running inside a DSH installation')
  const require = createRequire(realpathSync(anchor))
  let directory = dirname(realpathSync(require.resolve('@deepseek-ai/dsh-llm-pi-ai/package.json')))
  for (;;) {
    const candidate = join(directory, 'node_modules', '@earendil-works', 'pi-ai')
    if (existsSync(join(candidate, 'package.json'))) return realpathSync(candidate)
    const parent = dirname(directory)
    if (parent === directory) throw new Error('cannot find the pi-ai package used by @deepseek-ai/dsh-llm-pi-ai')
    directory = parent
  }
}

async function install() {
  const directory = piAiDirectory()
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))
  const entry = manifest.exports?.['./models']
  const file = typeof entry === 'string' ? entry : entry?.import ?? entry?.default
  if (typeof file !== 'string') throw new Error(`pi-ai ${manifest.version} has no ./models export`)
  const { createModels } = await import(pathToFileURL(join(directory, file)).href)
  if (typeof createModels !== 'function') throw new Error(`pi-ai ${manifest.version} has no createModels()`)
  const prototype = Object.getPrototypeOf(createModels())
  const original = prototype?.streamSimple
  if (typeof original !== 'function') throw new Error(`pi-ai ${manifest.version} Models has no streamSimple()`)
  const transforms = new Set()
  prototype.streamSimple = function streamSimple(model, context, options) {
    let request = { model, context, options }
    for (const transform of transforms) {
      try {
        request = transform(request) ?? request
      } catch (error) {
        console.warn('[dsh-plugins] pi-ai request transform failed:', error)
      }
    }
    return original.call(this, request.model, request.context, request.options)
  }
  return { version: VERSION, piAi: manifest.version, transforms }
}

export async function addPiAiRequestTransform(transform) {
  globalThis[KEY] ??= install()
  let registry
  try {
    registry = await globalThis[KEY]
  } catch (error) {
    globalThis[KEY] = undefined
    throw error
  }
  if (registry.version !== VERSION) throw new Error(`incompatible pi-ai hook version ${registry.version}`)
  registry.transforms.add(transform)
  return { piAi: registry.piAi, remove: () => registry.transforms.delete(transform) }
}
