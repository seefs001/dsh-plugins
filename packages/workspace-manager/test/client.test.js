import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const noop = () => null
const primitives = {
  Button: noop,
  Checkbox: noop,
  Input: noop,
  Modal: noop,
  PathLabel: noop,
  StateDot: noop,
  Tag: noop,
  IconCopyOutlineRegular: noop,
  IconRefreshOutlineRegular: noop,
  IconSearchOutlineRegular: noop,
  IconTrashOutlineRegular: noop,
  IconWarningTriangleOutlineRegular: noop,
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
  useMemo: fn => fn(),
  useEffect: () => {},
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

test('workspace-manager aligns en/zh dictionaries and registers panel, footer action, and cleanup overlay', () => {
  const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })
  assert.equal(id, 'dsh-workspace-manager')
  assert.deepEqual(
    Object.keys(plugin._internal.EN).toSorted(),
    Object.keys(plugin._internal.ZH).toSorted(),
  )

  const registered = []
  const locale = createLocaleStub()
  const ctx = {
    locale,
    effect(fn, label) {
      if (label === 'workspace-manager: styles') return () => {}
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
    workspaces: {
      list: { getSnapshot: () => ({ phase: 'ready', state: 'idle', items: [] }), subscribe: () => () => {} },
      delete: async () => {},
    },
    get: () => null,
  }
  plugin.apply(ctx)
  const panel = registered.find(r => r.meta.name === 'sidebar.panellist')
  assert.ok(panel)
  assert.equal(panel.meta.label(), 'Workspace manager')
  locale.setActive('zh')
  assert.equal(panel.meta.label(), '工作区管理')

  const footer = registered.find(r => r.meta.name === 'sidebar.footer.action' && r.meta.id === 'workspace-manager-cleanup')
  assert.ok(footer)
  const footerWide = footer.component({ wide: true })
  assert.equal(footerWide.type, 'button')
  const footerRail = footer.component({ wide: false })
  assert.equal(footerRail.type, 'button')

  const overlay = registered.find(r => r.meta.name === 'shell.overlay' && r.meta.id === 'workspace-manager-cleanup-dialog')
  assert.ok(overlay)
  assert.ok(overlay.component({}))

  const main = registered.find(r => r.meta.name === 'main')
  assert.ok(main)
  assert.equal(main.component({}).type, 'section')
})
