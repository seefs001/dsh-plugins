import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const noop = () => null
const primitives = {
  IconPanelLeftOutlineRegular: noop,
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

test('subagent-peek aligns dictionaries and builds multi-level descendant tree in spawn order', () => {
  const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
    'react-dom': { createPortal: node => node },
  })
  assert.equal(id, 'dsh-subagent-peek')
  assert.deepEqual(
    Object.keys(plugin._internal.COPY.en).toSorted(),
    Object.keys(plugin._internal.COPY.zh).toSorted(),
  )

  const now = 200_000
  const list = {
    byId: {
      root: { id: 'root', displayTitle: 'Main' },
      c1: {
        id: 'c1', displayTitle: 'Researcher', origin: 'subagent', parentId: 'root', running: true, updatedAt: now - 5000,
        projectionValues: { subagentTiming: { active: { since: now - 12_000 } } },
      },
      c2: {
        id: 'c2', displayTitle: 'Verifier', origin: 'subagent', parentId: 'c1', running: false, updatedAt: now - 3000,
        projectionValues: { subagentTiming: { lastTurnCompleted: false } },
      },
      c3: {
        id: 'c3', displayTitle: 'Writer', origin: 'subagent', parentId: 'root', running: false, updatedAt: now - 2000,
        projectionValues: { subagentTiming: { lastTurnCompleted: true } },
      },
    },
    projectionsBySession: {
      root: { values: { subagentCatalog: [{ id: 'c1', name: 'Researcher', mode: 'continuable' }, { id: 'c3', name: 'Writer', mode: 'continuable' }] } },
      c1: { values: { subagentCatalog: [{ id: 'c2', name: 'Verifier', mode: 'continuable' }] } },
    },
  }
  const statuses = new Map([
    ['c1', { running: true, pendingInteraction: { kind: 'question', questions: [{ intent: { kind: 'approval' } }] } }],
  ])
  const rows = plugin._internal.buildDescendantTree('root', list, statuses, new Map(), now)
  assert.deepEqual(JSON.parse(JSON.stringify(rows.map(r => [r.id, r.depth]))), [['c1', 0], ['c2', 1], ['c3', 0]])
  assert.equal(rows[0].running, true)
  assert.equal(rows[0].attention, 'approval')
  assert.equal(rows[1].failed, true)
  assert.equal(rows[2].done, true)
  assert.equal(rows[2].unseenDone, true)
})

test('subagent-peek registers conversation.session.header.actions slot and renders count pill', () => {
  const { plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
    'react-dom': { createPortal: node => node },
  })
  const registered = []
  const ctx = {
    locale: createLocaleStub(),
    effect(fn, label) {
      if (label === 'subagent-peek: styles') return () => {}
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
    sessions: {
      list: {
        getSnapshot: () => ({
          byId: {
            root: { id: 'root' },
            c1: { id: 'c1', displayTitle: 'Child 1', origin: 'subagent', parentId: 'root', running: true },
          },
          projectionsBySession: {
            root: { values: { subagentCatalog: [{ id: 'c1', name: 'Child 1', mode: 'continuable' }] } },
          },
        }),
        subscribe: () => () => {},
      },
      refreshProjections: async () => {},
    },
    uiWorkspace: { openSession() {} },
    uiSession: { sessionStatus: { getSnapshot: () => new Map(), subscribe: () => () => {} } },
    get: () => null,
  }
  plugin.apply(ctx)
  assert.equal(registered.length, 1)
  assert.equal(registered[0].meta.name, 'conversation.session.header.actions')
  assert.equal(registered[0].meta.id, 'subagent-peek')
  const rendered = registered[0].component({ sessionId: 'root' })
  assert.ok(rendered)
  assert.equal(registered[0].component({ sessionId: 'empty' }), null)
})
