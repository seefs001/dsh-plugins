import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const noop = () => null
const primitives = {
  Button: noop,
  Checkbox: noop,
  Input: noop,
  Modal: noop,
  StateDot: noop,
  Switch: noop,
  Tag: noop,
  IconCheckOutlineRegular: noop,
  IconChevronDownOutlineRegular: noop,
  IconChevronRightOutlineRegular: noop,
  IconInfoOutlineRegular: noop,
  IconRefreshOutlineRegular: noop,
  IconWarningTriangleOutlineRegular: noop,
}

test('config-backup client registers under dsh-config-backup and uses ctx.locale.bind without ctx.locale.t', () => {
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
    useCallback: fn => fn,
    useEffect: () => {},
  }
  const { id, plugin } = loadClient(clientPath, {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })
  assert.equal(id, 'dsh-config-backup')

  let active = 'en'
  const dicts = new Map()
  const slots = new Map()
  const locale = {
    register(ns, entries) {
      dicts.set(ns, entries)
      return () => dicts.delete(ns)
    },
    bind(ns) {
      return (key, params) => {
        const template = dicts.get(ns)?.[active]?.[key] ?? dicts.get(ns)?.en?.[key] ?? key
        if (!params) return template
        return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
      }
    },
    subscribe: () => () => {},
    getSnapshot: () => ({ active, revision: 1 }),
  }

  const ctx = {
    locale,
    effect: (fn, label) => (label === 'config-backup: styles' ? undefined : fn()),
    slots: {
      inject: (_name, fn) => fn(),
      register: (options, component) => {
        slots.set(`${options.name}:${options.id ?? options.key ?? ''}`, { options, component })
        return () => {}
      },
    },
  }

  plugin.apply(ctx)

  const registered = dicts.get('config-backup')
  assert.ok(registered?.en && registered?.zh)
  assert.deepEqual(Object.keys(registered.en).toSorted(), Object.keys(registered.zh).toSorted())

  const panelEntry = slots.get('sidebar.panellist:config-backup')
  assert.ok(panelEntry)
  assert.equal(panelEntry.options.label(), 'Config backup')
  active = 'zh'
  assert.equal(panelEntry.options.label(), '配置备份')

  const iconEl = panelEntry.component({ size: 16 })
  assert.equal(iconEl.type, 'svg')

  const mainEntry = slots.get('main:config-backup')
  assert.ok(mainEntry)
  const pageEl = mainEntry.component()
  assert.equal(pageEl.type, 'div')
  assert.equal(pageEl.props.className, 'cb-page')
})
