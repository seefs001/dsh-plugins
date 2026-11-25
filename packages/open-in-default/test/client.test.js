import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const noop = () => null
const primitives = {
  IconChevronDownOutlineRegular: noop,
  IconRightUpOutlineRegular: noop,
}

const reactStub = {
  Fragment: Symbol('Fragment'),
  createElement: (type, props, ...children) => ({ type, props, children }),
  useSyncExternalStore: (subscribe, getSnapshot) => {
    const off = subscribe(() => {})
    if (typeof off === 'function') off()
    return getSnapshot()
  },
  useState: init => [typeof init === 'function' ? init() : init, () => {}],
  useRef: current => ({ current }),
  useEffect: () => {},
}

function createLocaleStub() {
  const dicts = new Map()
  return {
    register(ns, tables) {
      dicts.set(ns, tables)
      return () => {}
    },
    bind(ns) {
      return key => dicts.get(ns)?.en?.[key] ?? key
    },
    getSnapshot: () => ({ active: 'en' }),
    subscribe: () => () => {},
  }
}

test('open-in-default aligns en/zh dictionaries and resolves preferred editor fallback', () => {
  const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
    'react-dom': { createPortal: node => node },
  })
  assert.equal(id, 'dsh-open-in-default')
  assert.deepEqual(
    Object.keys(plugin._internal.COPY.en).toSorted(),
    Object.keys(plugin._internal.COPY.zh).toSorted(),
  )
  assert.equal(plugin._internal.resolvePreferred(['cursor', 'vscode'], 'vscode'), 'vscode')
  assert.equal(plugin._internal.resolvePreferred(['cursor', 'vscode'], 'missing'), 'cursor')
  assert.equal(plugin._internal.resolvePreferred([], 'vscode'), null)
  assert.equal(
    plugin._internal.resolveSessionPath('s1', { byId: { s1: { cwd: '/tmp/repo' } } }, { items: [] }),
    '/tmp/repo',
  )
  assert.equal(
    plugin._internal.resolveSessionPath('s2', { byId: {} }, { items: [{ path: '/tmp/ws', sessionIds: ['s2'] }] }),
    '/tmp/ws',
  )
})

test('open-in-default registers header utility slot and renders cleanly before apps load', () => {
  const { plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
    'react-dom': { createPortal: node => node },
  })
  const registered = []
  const skipEffects = new Set(['open-in-default: styles', 'open-in-default: lifecycle'])
  const ctx = {
    locale: createLocaleStub(),
    effect(fn, label) {
      if (skipEffects.has(label)) return () => {}
      const cleanup = fn()
      return typeof cleanup === 'function' ? cleanup : () => {}
    },
    slots: {
      inject(_name, fn) { fn() },
      register(meta, component) {
        registered.push({ meta, component })
        return () => {}
      },
    },
    sessions: { list: { getSnapshot: () => ({ byId: { s1: { cwd: '/tmp/repo' } } }), subscribe: () => () => {} } },
    workspaces: { list: { getSnapshot: () => ({ items: [] }), subscribe: () => () => {} } },
    get: () => null,
  }
  plugin.apply(ctx)
  assert.equal(registered.length, 1)
  assert.equal(registered[0].meta.name, 'conversation.session.header.utilities')
  assert.equal(registered[0].meta.id, 'open-in-default')
  assert.equal(registered[0].component({ sessionId: 's1' }), null)
})
