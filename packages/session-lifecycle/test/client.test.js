import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const noop = () => null
const primitives = {
  Button: noop,
  DisclosureRow: noop,
  Modal: noop,
  TextShimmer: noop,
  IconClockOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
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
  useReducer: (_fn, init) => [init, () => {}],
  useMemo: fn => fn(),
  useRef: current => ({ current }),
  useEffect: () => {},
  useLayoutEffect: () => {},
}

function createLocaleStub() {
  const dicts = new Map()
  let active = 'en'
  return {
    setActive(lang) { active = lang },
    register(ns, lang, messages) {
      if (!dicts.has(ns)) dicts.set(ns, new Map())
      dicts.get(ns).set(lang, messages)
      return () => {}
    },
    bind(ns) {
      return key => dicts.get(ns)?.get(active)?.[key] ?? dicts.get(ns)?.get('en')?.[key] ?? key
    },
    getSnapshot: () => ({ active }),
    subscribe: () => () => {},
  }
}

function createStoreStub(initial) {
  return {
    getSnapshot: () => initial,
    subscribe: () => () => {},
  }
}

test('session-lifecycle client registers slots, aligns en/zh dictionaries, evaluates panel label, and renders icon/page', () => {
  const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
    'react-dom': { createPortal: node => node },
  })
  assert.equal(id, 'dsh-session-lifecycle')
  assert.deepEqual(
    Object.keys(plugin._internal.copy.en).toSorted(),
    Object.keys(plugin._internal.copy.zh).toSorted(),
  )

  const registered = []
  const locale = createLocaleStub()
  const domEffects = new Set(['session-lifecycle: styles', 'session-lifecycle: follow Host state', 'session-lifecycle: read marks'])

  const ctx = {
    locale,
    effect(fn, label) {
      if (domEffects.has(label)) return () => {}
      const res = fn()
      return typeof res === 'function' ? res : () => {}
    },
    slots: {
      inject(_name, fn) { fn() },
      register(meta, component) {
        registered.push({ meta, component })
        return () => {}
      },
    },
    sessions: {
      list: createStoreStub({ phase: 'ready', byId: {}, projectionsBySession: {} }),
      binding: () => null,
      refreshProjections: async () => {},
    },
    layout: {
      panelInfo: createStoreStub({ activePanelId: null }),
      selectPanel() {},
    },
    uiWorkspace: {
      openSession() {},
      startSession() {},
      pinSession: async () => {},
    },
    uiSession: {
      sessionStatus: createStoreStub(new Map()),
    },
    workspaces: {
      list: createStoreStub({ phase: 'ready', items: [], pinnedSessionIds: [], archivedSessionIds: [] }),
    },
    contextMenus: {
      register: () => () => {},
      notify() {},
      open() {},
    },
    get: () => null,
  }

  plugin.apply(ctx)

  const panel = registered.find(r => r.meta.name === 'sidebar.panellist')
  assert.ok(panel)
  assert.equal(panel.meta.label(), 'Triage')
  locale.setActive('zh')
  assert.equal(panel.meta.label(), '待处理')
  const iconNode = panel.component({ size: 18 })
  assert.equal(iconNode.type, 'span')

  const mainEntry = registered.find(r => r.meta.name === 'main')
  assert.ok(mainEntry)
  const pageNode = mainEntry.component({})
  assert.equal(pageNode.type, 'main')
  assert.ok(registered.some(r => r.meta.name === 'shell.overlay'))
})

test('session-lifecycle collect computes workspace metadata, failed, and woke flags', () => {
  const { plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
    'react-dom': { createPortal: node => node },
  })
  const now = 100_000
  const board = plugin._internal.collect({
    list: {
      byId: {
        s1: {
          id: 's1', displayTitle: 'Fix login', cwd: '/repo/app', updatedAt: now - 10_000, running: false,
          projectionValues: { 'session-lifecycle-outcome': { seq: 5, time: now - 10_000, reason: 'error' } },
        },
      },
      projectionsBySession: {},
    },
    statuses: new Map(),
    workspaces: {
      items: [{ workspaceId: 'ws-1', title: 'App Repo', path: '/repo/app', sessionIds: ['s1'] }],
      pinnedSessionIds: [],
      archivedSessionIds: [],
    },
    life: {
      sessions: { s1: { wokeAt: now - 5000, wokeBy: 'timer' } },
      settings: {},
    },
    now,
    lastWorking: new Map(),
    mainId: null,
  })
  assert.equal(board.workspaces.length, 1)
  assert.equal(board.workspaces[0].id, 'ws-1')
  assert.equal(board.all.length, 1)
  assert.equal(board.all[0].failed, true)
  assert.equal(board.all[0].woke, true)
  assert.equal(plugin._internal.scoreSearch(board.all[0], 'login'), 2)
  assert.equal(plugin._internal.scoreSearch(board.all[0], 'app repo'), 1)
})
