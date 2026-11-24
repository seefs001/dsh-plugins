import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))

function loadClientWithDom(modules = {}, doc = null) {
  let registered
  const window = { __ModuleLoader__: { load: record => { registered = record } } }
  const sandbox = {
    window,
    document: doc,
    console,
    setTimeout,
    clearTimeout,
    AbortController,
    URL,
    URLSearchParams,
    JSON,
    Date,
    Map,
    Set,
  }
  vm.runInNewContext(readFileSync(clientPath, 'utf8'), sandbox, { filename: clientPath })
  const require = id => {
    if (id in modules) return modules[id]
    if (id === 'react') return { createElement: () => null }
    throw new Error(`unexpected require(${id})`)
  }
  return { id: registered.id, plugin: registered.factory(require) }
}

function createReactStub(states = []) {
  let stateIndex = 0
  return {
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children: children.flat() }
    },
    useState(initial) {
      const idx = stateIndex++
      if (idx < states.length) return [states[idx], () => {}]
      const value = typeof initial === 'function' ? initial() : initial
      return [value, () => {}]
    },
    useEffect() {},
  }
}

function collectText(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join('')
  return collectText(node.children)
}

test('git-changes client loads, registers slots and locales, and exposes internals', () => {
  const react = createReactStub()
  const appended = []
  const doc = {
    visibilityState: 'visible',
    createElement: tag => ({ tag, dataset: {}, textContent: '', remove() {} }),
    head: { appendChild: el => { appended.push(el) } },
    addEventListener() {},
    removeEventListener() {},
  }
  const { id, plugin } = loadClientWithDom({ react }, doc)
  assert.equal(id, 'dsh-git-changes')
  assert.equal(typeof plugin.apply, 'function')
  assert.deepEqual([...plugin.inject], ['slots', 'locale', 'sidebarRight', 'remote', 'remote.forgePanel'])

  const locales = new Map()
  const registeredSlots = []
  const ctx = {
    effect(fn) {
      return fn()
    },
    on() {
      return () => {}
    },
    locale: {
      register(ns, lang, dict) {
        locales.set(`${ns}:${lang}`, dict)
        return () => {}
      },
    },
    slots: {
      inject(_name, fn) {
        return fn()
      },
      register(options, component) {
        registeredSlots.push({ options, component })
        return () => {}
      },
      entries() {
        return []
      },
      subscribe() {
        return () => {}
      },
    },
    sidebarRight: { openResource() {} },
    remote: {
      forgePanel: {
        follow() {
          return { async *[Symbol.asyncIterator]() {} }
        },
        async localDiff() {
          return { ok: true, value: { files: [], omitted: 0 } }
        },
      },
    },
  }

  plugin.apply(ctx)

  assert.deepEqual(
    Object.keys(locales.get('gitChanges:en')).toSorted(),
    Object.keys(locales.get('gitChanges:zh')).toSorted(),
  )
  assert.equal(appended.length, 1)
  assert.equal(registeredSlots.length, 1)
  assert.equal(registeredSlots[0].options.name, 'conversation.composer.dock')
  assert.equal(registeredSlots[0].options.id, 'git-changes')

  assert.deepEqual(
    { ...plugin._internal.totals([{ additions: 3, deletions: 1 }, { additions: 2, deletions: 4 }], 2) },
    { additions: 5, deletions: 5, files: 2, omitted: 2 },
  )
  assert.equal(plugin._internal.totals(null), null)
  assert.equal(plugin._internal.localAddress('s/1'), 'dsh-resource://forge-changes/s%2F1/local')
})

test('git-changes trigger handles non-origin remotes without remote HEAD and newly created never-pushed branches', () => {
  const { plugin } = loadClientWithDom()
  const { trigger } = plugin._internal

  assert.equal(trigger(null), null)
  assert.equal(trigger({ checkout: { state: 'none' }, local: null }), null)
  assert.equal(trigger({ checkout: { state: 'pending' }, local: null }), null)

  const unbornKey = trigger({
    checkout: { state: 'ready', checkout: { root: '/repo', branch: 'main', commit: null } },
    local: null,
  })
  assert.equal(unbornKey, '/repo\nmain\nnull\n')

  const mainKey = trigger({
    checkout: { state: 'ready', checkout: { root: '/repo', branch: 'main', commit: 'abc1234' } },
    local: null,
  })
  const neverPushedKey = trigger({
    checkout: { state: 'ready', checkout: { root: '/repo', branch: 'feat/never-pushed', commit: 'abc1234' } },
    local: undefined,
  })
  assert.notEqual(mainKey, neverPushedKey)
  assert.equal(neverPushedKey, '/repo\nfeat/never-pushed\nabc1234\n')
})

test('git-changes pill renders newly created unborn and never-pushed branches and hides non-git dirs', () => {
  const doc = {
    visibilityState: 'visible',
    createElement: tag => ({ tag, dataset: {}, textContent: '', remove() {} }),
    head: { appendChild() {} },
    addEventListener() {},
    removeEventListener() {},
  }
  const panelState = {
    checkout: { state: 'ready', checkout: { root: '/repo', branch: 'feat/local-only', commit: null } },
    local: null,
  }
  const react = createReactStub([
    panelState,
    0,
    { key: '/repo\nfeat/local-only\nnull\n', sum: { additions: 4, deletions: 0, files: 1, omitted: 0 } },
  ])
  const { plugin } = loadClientWithDom({ react }, doc)

  const registeredSlots = []
  plugin.apply({
    effect: fn => fn(),
    on: () => () => {},
    locale: { register: () => () => {} },
    slots: {
      inject: (_name, fn) => fn(),
      register: (options, component) => {
        registeredSlots.push({ options, component })
        return () => {}
      },
      entries: () => [],
      subscribe: () => () => {},
    },
    sidebarRight: { openResource() {} },
    remote: {
      forgePanel: {
        follow: () => ({ async *[Symbol.asyncIterator]() {} }),
        localDiff: async () => ({ ok: true, value: { files: [], omitted: 0 } }),
      },
    },
  })

  const t = key => key
  const pillElement = registeredSlots[0].component({ sessionId: 's1', t })
  const rendered = pillElement.type(pillElement.props)
  const text = collectText(rendered)
  assert.match(text, /feat\/local-only/)
  assert.match(text, /\+4/)

  const hiddenReact = createReactStub([{ checkout: { state: 'none' }, local: null }, 0, null])
  const { plugin: hiddenPlugin } = loadClientWithDom({ react: hiddenReact }, doc)
  const hiddenSlots = []
  hiddenPlugin.apply({
    effect: fn => fn(),
    on: () => () => {},
    locale: { register: () => () => {} },
    slots: {
      inject: (_name, fn) => fn(),
      register: (options, component) => {
        hiddenSlots.push({ options, component })
        return () => {}
      },
      entries: () => [],
      subscribe: () => () => {},
    },
    sidebarRight: { openResource() {} },
    remote: {
      forgePanel: {
        follow: () => ({ async *[Symbol.asyncIterator]() {} }),
        localDiff: async () => ({ ok: true, value: { files: [], omitted: 0 } }),
      },
    },
  })
  const hiddenEl = hiddenSlots[0].component({ sessionId: 's2', t })
  assert.equal(hiddenEl.type(hiddenEl.props), null)
})
