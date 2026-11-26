import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const CORDIS_CTX_BUILTINS = new Set([
  'accessor',
  'bail',
  'baseUrl',
  'effect',
  'emit',
  'events',
  'extend',
  'fiber',
  'get',
  'inject',
  'intercept',
  'isolate',
  'logger',
  'mixin',
  'on',
  'once',
  'parallel',
  'plugin',
  'provide',
  'reflect',
  'registry',
  'runtime',
  'serial',
  'set',
  'waterfall',
])

const KNOWN_NESTED_SERVICES = {
  uiSession: new Set(['sessionStatus']),
  remote: new Set(['session', 'skills', 'forgePanel', 'sessionStatus', 'userQuestions', 'toolResults']),
}

const RESERVED_PROPS = new Set(['prototype', 'then'])

function isSpecialProp(prop) {
  return typeof prop === 'symbol'
    || RESERVED_PROPS.has(prop)
    || String(parseInt(prop, 10)) === prop
    || prop.startsWith('_')
}

function normalizeInject(inject) {
  const out = new Set()
  if (Array.isArray(inject)) {
    for (const item of inject) if (typeof item === 'string') out.add(item)
  } else if (inject && typeof inject === 'object') {
    for (const key of Object.keys(inject)) out.add(key)
  }
  return out
}

function guardContext(ctx, allowed) {
  if (!ctx || typeof ctx !== 'object') return ctx
  return new Proxy(ctx, {
    get(target, prop, receiver) {
      if (isSpecialProp(prop)) return Reflect.get(target, prop, receiver)
      if (prop === 'inject') {
        const rawInject = Reflect.get(target, prop, receiver)
        if (typeof rawInject !== 'function') return rawInject
        return (deps, callback, ...rest) => {
          const merged = new Set(allowed)
          for (const dep of normalizeInject(deps)) merged.add(dep)
          const wrappedCb = typeof callback === 'function'
            ? (childCtx, ...cbRest) => callback(guardContext(childCtx, merged), ...cbRest)
            : callback
          return rawInject.call(target, deps, wrappedCb, ...rest)
        }
      }
      if (CORDIS_CTX_BUILTINS.has(prop)) return Reflect.get(target, prop, receiver)
      if (!allowed.has(prop)) {
        throw new Error(`cannot get property "${prop}" without inject`)
      }
      const value = Reflect.get(target, prop, receiver)
      const nestedKnown = KNOWN_NESTED_SERVICES[prop]
      if (!nestedKnown || !value || typeof value !== 'object') return value
      return new Proxy(value, {
        get(subTarget, subProp, subReceiver) {
          if (typeof subProp === 'string' && nestedKnown.has(subProp) && !allowed.has(`${prop}.${subProp}`)) {
            throw new Error(`cannot get property "${prop}.${subProp}" without inject`)
          }
          return Reflect.get(subTarget, subProp, subReceiver)
        },
      })
    },
  })
}

export function loadClient(file, modules = {}) {
  let registered
  const window = { __ModuleLoader__: { load: record => { registered = record } } }
  const sandbox = { window, atob, btoa, TextDecoder, TextEncoder, URL, URLSearchParams, AbortController, Uint8Array, JSON, Date }
  vm.runInNewContext(readFileSync(file, 'utf8'), sandbox, { filename: file })
  if (!registered) throw new Error(`${file} did not call window.__ModuleLoader__.load`)
  const require = id => {
    if (id in modules) return modules[id]
    if (id === 'react') return { createElement: () => null }
    throw new Error(`unexpected require(${id})`)
  }
  const rawPlugin = registered.factory(require)
  if (!rawPlugin || typeof rawPlugin !== 'object' || typeof rawPlugin.apply !== 'function') {
    return { id: registered.id, plugin: rawPlugin }
  }
  const allowed = normalizeInject(rawPlugin.inject)
  const plugin = {
    ...rawPlugin,
    apply(ctx, ...rest) {
      return rawPlugin.apply(guardContext(ctx, allowed), ...rest)
    },
  }
  return { id: registered.id, plugin }
}
