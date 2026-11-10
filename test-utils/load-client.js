/**
 * Evaluate a browser `lib/client.js` bundle in a sandbox and return the
 * plugin object its factory produces. Only the factory runs; `apply` does not.
 */
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

export function loadClient(file, modules = {}) {
  let registered
  const window = { __ModuleLoader__: { load: record => { registered = record } } }
  const sandbox = { window, atob, TextDecoder, URLSearchParams, Uint8Array, JSON, Date }
  vm.runInNewContext(readFileSync(file, 'utf8'), sandbox, { filename: file })
  if (!registered) throw new Error(`${file} did not call window.__ModuleLoader__.load`)
  const require = id => {
    if (id in modules) return modules[id]
    if (id === 'react') return { createElement: () => null }
    throw new Error(`unexpected require(${id})`)
  }
  return { id: registered.id, plugin: registered.factory(require) }
}
