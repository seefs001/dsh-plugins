import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

// DSH has no request hook for pi-ai options or tool declarations. This wraps
// the prototype of the pi-ai `Models` collection that DSH's llm-pi-ai adapter
// uses. It depends on DSH internals: when the layout changes, install() throws
// and the caller must log it instead of failing silently.
// Identical copies live in dsh-pi-tools and dsh-service-tier; keep them in sync.
const KEY = Symbol.for('dsh-plugins.pi-ai-request-transforms')
const VERSION = 1

export function piAiDirectory() {
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

/**
 * Built-in pi-ai catalog providers with at least one model on `api`.
 * A route that names such a provider without its own `api` inherits it.
 * @throws when DSH's pi-ai layout is not the expected one.
 */
export async function catalogProvidersWithApi(api) {
  const directory = piAiDirectory()
  const { builtinProviders } = await import(pathToFileURL(join(directory, 'dist', 'providers', 'all.js')).href)
  return new Set(builtinProviders()
    .filter(provider => (provider.getModels?.() ?? []).some(model => model.api === api))
    .map(provider => provider.id))
}

/**
 * Add one request transform: ({ model, context, options }) => same shape.
 * Transforms must return new objects instead of mutating their input.
 * @returns the remover and the pi-ai version that was hooked.
 * @throws when DSH's pi-ai layout is not the expected one.
 */
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
