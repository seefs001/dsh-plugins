import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const noop = () => null
const primitives = {
  Button: noop,
  CodeBlock: noop,
  DisclosureRow: noop,
  Input: noop,
  JsonBlock: noop,
  Modal: noop,
  PathLabel: noop,
  SegmentedTabs: noop,
  StateDot: noop,
  Switch: noop,
  Tag: noop,
  TextShimmer: noop,
  IconApiOutlineRegular: noop,
  IconChevronDownOutlineRegular: noop,
  IconChevronLeftOutlineRegular: noop,
  IconChevronRightOutlineRegular: noop,
  IconCloseOutlineRegular: noop,
  IconCopyOutlineRegular: noop,
  IconEllipsisOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
  IconPlayOutlineRegular: noop,
  IconPlusOutlineRegular: noop,
  IconRefreshOutlineRegular: noop,
  IconRightUpOutlineRegular: noop,
  IconSearchOutlineRegular: noop,
  IconSettingsOutlineRegular: noop,
  IconWarningTriangleOutlineRegular: noop,
}

function collectText(node, out = []) {
  if (node == null || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    for (const item of node) collectText(item, out)
    return out
  }
  if (typeof node === 'object') {
    if (typeof node.type === 'function') {
      collectText(node.type(node.props ?? {}), out)
      return out
    }
    if (node.children) collectText(node.children, out)
    if (node.props?.children) collectText(node.props.children, out)
  }
  return out
}

function findNode(node, predicate) {
  if (node == null || typeof node !== 'object') return null
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findNode(item, predicate)
      if (hit) return hit
    }
    return null
  }
  if (predicate(node)) return node
  if (typeof node.type === 'function') {
    const rendered = node.type(node.props ?? {})
    const hit = findNode(rendered, predicate)
    if (hit) return hit
  }
  if (node.children) {
    const hit = findNode(node.children, predicate)
    if (hit) return hit
  }
  if (node.props?.children) {
    const hit = findNode(node.props.children, predicate)
    if (hit) return hit
  }
  return null
}

function setupClient(initialStateData = null) {
  let stateCallIndex = 0
  const contextValues = new Map()
  const reactStub = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    createContext: defaultValue => {
      const ctx = {
        _default: defaultValue,
        Provider: ({ value, children }) => {
          contextValues.set(ctx, value)
          return { type: 'Provider', props: { value, children }, children: Array.isArray(children) ? children : [children] }
        },
      }
      return ctx
    },
    useContext: ctx => (contextValues.has(ctx) ? contextValues.get(ctx) : ctx._default),
    useSyncExternalStore: (subscribe, getSnapshot) => {
      const off = subscribe(() => {})
      if (typeof off === 'function') off()
      return getSnapshot()
    },
    useState: init => {
      const value = typeof init === 'function' ? init() : init
      const idx = stateCallIndex++
      if (initialStateData && idx === 2 && value && typeof value === 'object' && 'loading' in value) {
        return [{ identity: 'paseo-hub/state?', data: initialStateData, error: null, loading: false, at: '2026-11-25T00:00:00.000Z' }, () => {}]
      }
      return [value, () => {}]
    },
    useReducer: (_reducer, init) => [init, () => {}],
    useMemo: fn => fn(),
    useRef: current => ({ current }),
    useCallback: fn => fn,
    useEffect: () => {},
  }

  const prevStorage = globalThis.sessionStorage
  globalThis.sessionStorage = { getItem: () => null, setItem: () => {} }
  let loaded
  try {
    loaded = loadClient(clientPath, {
      react: reactStub,
      '@deepseek-ai/dsh-client-ui-primitives': primitives,
    })
  } finally {
    if (prevStorage === undefined) delete globalThis.sessionStorage
    else globalThis.sessionStorage = prevStorage
  }

  let active = 'en'
  const dicts = new Map()
  const slots = new Map()
  const locale = {
    register(ns, localeOrDicts, dict) {
      let byLang = dicts.get(ns)
      if (!byLang) {
        byLang = {}
        dicts.set(ns, byLang)
      }
      if (typeof localeOrDicts === 'string') byLang[localeOrDicts] = dict
      else Object.assign(byLang, localeOrDicts)
      return () => {}
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
    get: () => null,
    effect: (fn, label) => (label === 'paseo-hub: styles' ? undefined : fn()),
    slots: {
      inject: (_name, fn) => fn(),
      register: (options, component) => {
        slots.set(`${options.name}:${options.id ?? options.key ?? ''}`, { options, component })
        return () => {}
      },
    },
  }

  loaded.plugin.apply(ctx)
  return {
    id: loaded.id,
    dicts,
    slots,
    setLocale: lang => { active = lang },
    resetRender: () => { stateCallIndex = 0 },
  }
}

test('paseo-hub client registers under dsh-paseo-hub with aligned en/zh dictionaries and valid slots', () => {
  const { id, dicts, slots, setLocale } = setupClient()
  assert.equal(id, 'dsh-paseo-hub')

  const registered = dicts.get('paseo-hub')
  assert.ok(registered?.en && registered?.zh)
  assert.deepEqual(Object.keys(registered.en).toSorted(), Object.keys(registered.zh).toSorted())

  const panelEntry = slots.get('sidebar.panellist:paseo-hub')
  assert.ok(panelEntry)
  assert.equal(panelEntry.options.label(), 'Paseo Hub')
  setLocale('zh')
  assert.equal(panelEntry.options.label(), 'Paseo Hub')
  const iconEl = panelEntry.component({ size: 16 })
  const renderedIcon = typeof iconEl.type === 'function' ? iconEl.type(iconEl.props) : iconEl
  assert.equal(renderedIcon.type, 'svg')

  const readTool = slots.get('tool.call.toolview:paseo_hub')
  const writeTool = slots.get('tool.call.toolview:paseo_hub_write')
  assert.ok(readTool)
  assert.ok(writeTool)
  const toolEl = readTool.component({
    toolName: 'paseo_hub',
    phase: 'result',
    block: { kind: 'tool_result', call: { argsRaw: '{"action":"projects"}' }, content: [{ type: 'text', text: '{"total":2}' }] },
    useDisclosure: () => ({ expanded: false, toggle: () => {} }),
  })
  assert.equal(toolEl.props['data-tool'], 'paseo_hub')
  assert.equal(toolEl.props['data-state'], 'ok')

  const mainEntry = slots.get('main:paseo-hub')
  assert.ok(mainEntry)
  const pageEl = mainEntry.component()
  assert.ok(findNode(pageEl, node => node.props?.className === 'ph-page'))
})

test('ConnectionHero renders compact status row with host platform, channel, and live latency', () => {
  const connectedState = {
    state: 'connected',
    hubOrigin: 'https://hub.example.com',
    daemonId: 'daemon-123',
    slug: 'dev-mac',
    permissions: ['hub.execute'],
    enrolledAt: '2026-11-24T00:00:00.000Z',
    connectedAt: '2026-11-24T23:55:00.000Z',
    lastError: null,
    login: null,
    host: { hostname: 'dev-mac', machineKind: 'laptop', platform: 'darwin', arch: 'arm64' },
    channel: { kind: 'direct', protocol: 'wss', secure: true, endpoint: 'hub.example.com' },
    latencyMs: 24,
    lastPongAt: '2026-11-25T00:00:00.000Z',
    stats: { total: 0, running: 0, finished: 0, completed: 0, failed: 0, canceled: 0, idle: 0, archived: 0, last24h: 0 },
    recent: [],
    activity: [],
    modes: [],
    defaultModeId: null,
    presetsAvailable: true,
    api: { configured: false },
    config: { agentPreset: null, listWorkspaces: true },
  }

  const env = setupClient(connectedState)
  const mainEntry = env.slots.get('main:paseo-hub')
  env.resetRender()
  const treeEn = mainEntry.component()
  const statusRowEn = findNode(treeEn, node => node.props?.className === 'ph-status-row')
  assert.ok(statusRowEn)
  const textEn = collectText(statusRowEn).join(' ')
  assert.match(textEn, /Laptop/)
  assert.match(textEn, /macOS · dev-mac/)
  assert.match(textEn, /Direct/)
  assert.match(textEn, /wss/)
  assert.match(textEn, /hub\.example\.com/)
  assert.match(textEn, /Ping 24 ms/)
  const latencyNode = findNode(statusRowEn, node => node.props?.['data-part'] === 'latency')
  assert.equal(latencyNode?.props?.['data-tone'], 'ok')

  env.setLocale('zh')
  env.resetRender()
  const treeZh = mainEntry.component()
  const statusRowZh = findNode(treeZh, node => node.props?.className === 'ph-status-row')
  assert.ok(statusRowZh)
  const textZh = collectText(statusRowZh).join(' ')
  assert.match(textZh, /笔记本/)
  assert.match(textZh, /直连/)
  assert.match(textZh, /延迟 24 ms/)
})

test('ConnectionHero status row handles offline state and sub-millisecond or slow latency', () => {
  const reconnectingState = {
    state: 'reconnecting',
    hubOrigin: 'http://localhost:3000',
    daemonId: 'daemon-456',
    slug: 'docker-node',
    permissions: ['hub.execute'],
    enrolledAt: '2026-11-24T00:00:00.000Z',
    connectedAt: null,
    lastError: 'retrying',
    login: null,
    host: { hostname: 'docker-node', machineKind: 'container', platform: 'linux', arch: 'x64' },
    channel: { kind: 'local', protocol: 'ws', secure: false, endpoint: 'localhost:3000' },
    latencyMs: null,
    lastPongAt: null,
    stats: { total: 0, running: 0, finished: 0, completed: 0, failed: 0, canceled: 0, idle: 0, archived: 0, last24h: 0 },
    recent: [],
    activity: [],
    modes: [],
    defaultModeId: null,
    presetsAvailable: true,
    api: { configured: false },
    config: { agentPreset: null, listWorkspaces: true },
  }

  const env = setupClient(reconnectingState)
  const mainEntry = env.slots.get('main:paseo-hub')
  env.resetRender()
  const tree = mainEntry.component()
  const statusRow = findNode(tree, node => node.props?.className === 'ph-status-row')
  assert.ok(statusRow)
  const text = collectText(statusRow).join(' ')
  assert.match(text, /Container/)
  assert.match(text, /Linux · docker-node/)
  assert.match(text, /Local/)
  assert.match(text, /Ping Offline/)
  const latencyNode = findNode(statusRow, node => node.props?.['data-part'] === 'latency')
  assert.equal(latencyNode?.props?.['data-tone'], 'idle')

  const slowEnv = setupClient({
    ...reconnectingState,
    state: 'connected',
    channel: { kind: 'tailscale', protocol: 'wss', secure: true, endpoint: 'box.tail42.ts.net' },
    latencyMs: 1400,
    lastPongAt: '2026-11-25T00:00:00.000Z',
  })
  slowEnv.resetRender()
  const slowRow = findNode(slowEnv.slots.get('main:paseo-hub').component(), node => node.props?.className === 'ph-status-row')
  const slowText = collectText(slowRow).join(' ')
  assert.match(slowText, /Tailscale/)
  assert.match(slowText, /Ping 1\.4 s/)
  assert.equal(findNode(slowRow, node => node.props?.['data-part'] === 'latency')?.props?.['data-tone'], 'slow')
})
