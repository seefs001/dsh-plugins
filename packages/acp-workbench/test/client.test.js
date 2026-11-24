import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const noop = () => null
const primitives = {
  Button: noop,
  CodeBlock: noop,
  DiffBlock: noop,
  DisclosureRow: noop,
  HoverCard: props => ({ type: 'HoverCard', props }),
  HoverCardGroup: props => ({ type: 'HoverCardGroup', props }),
  Input: noop,
  JsonBlock: noop,
  MarkdownText: noop,
  MarqueeText: props => ({ type: 'MarqueeText', props }),
  Menu: noop,
  MenuSurface: noop,
  Modal: noop,
  PathLabel: noop,
  ReadBlock: noop,
  SearchBlock: noop,
  SegmentedTabs: noop,
  StateDot: props => ({ type: 'StateDot', props }),
  Switch: noop,
  Tag: noop,
  TerminalBlock: props => ({ type: 'TerminalBlock', props }),
  TextShimmer: props => ({ type: 'TextShimmer', props }),
  Tooltip: noop,
  WebBlock: noop,
  diffTotals: () => ({ added: 0, removed: 0 }),
  extractMarkdownPlainText: text => String(text ?? ''),
  useHoverMarquee: () => ({}),
  IconBranchOutlineRegular: noop,
  IconBrowseOutlineRegular: noop,
  IconCheckOutlineRegular: noop,
  IconChecklistOutlineRegular: noop,
  IconClockOutlineRegular: noop,
  IconCloseOutlineRegular: noop,
  IconCodeOutlineRegular: noop,
  IconEditOutlineRegular: noop,
  IconGlobeOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
  IconPlayOutlineRegular: noop,
  IconRightUpOutlineRegular: noop,
  IconSearchOutlineRegular: noop,
  IconSparkleRegular: noop,
  IconStopFillRegular: noop,
  IconUsersOutlineRegular: noop,
  IconChevronDownOutlineRegular: noop,
  IconChevronLeftOutlineRegular: noop,
  IconChevronRightOutlineRegular: noop,
  IconChevronUpOutlineRegular: noop,
  IconInfoOutlineRegular: noop,
  IconPlusOutlineRegular: noop,
  IconWarningTriangleOutlineRegular: noop,
}

test('acp-workbench client registers background tasks panel slots, keeps en/zh keys aligned, and renders live tasks', () => {
  let idCounter = 0
  const reactStub = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useSyncExternalStore: (subscribe, getSnapshot) => {
      const off = subscribe(() => {})
      if (typeof off === 'function') off()
      return getSnapshot()
    },
    useState: init => [typeof init === 'function' ? init() : init, () => {}],
    useRef: current => ({ current }),
    useMemo: fn => fn(),
    useCallback: fn => fn,
    useEffect: () => {},
    useLayoutEffect: () => {},
    useId: () => `id-${++idCounter}`,
  }
  const { id, plugin } = loadClient(clientPath, {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })
  assert.equal(id, 'dsh-acp-workbench')

  let active = 'en'
  const dicts = new Map()
  const slots = new Map()
  const convEvents = []
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
    effect: (fn, label) => (label === 'acp-workbench: styles' ? undefined : fn()),
    get: () => undefined,
    inputTriggers: { registerSource: () => () => {} },
    uiConversation: { events: { register: spec => { convEvents.push(spec); return () => {} } } },
    uiWorkspace: { openSession: () => {} },
    slots: {
      entries: () => [],
      inject: (_name, fn) => {
        const res = fn()
        if (res && typeof res[Symbol.iterator] === 'function') {
          Array.from(res)
        }
      },
      register: (options, component) => {
        slots.set(`${options.name}:${options.id ?? options.key ?? ''}`, { options, component })
        return () => {}
      },
    },
  }

  plugin.apply(ctx)

  const registered = dicts.get('acp-workbench')
  assert.ok(registered?.en && registered?.zh)
  assert.deepEqual(Object.keys(registered.en).toSorted(), Object.keys(registered.zh).toSorted())

  const sectionEntry = slots.get('conversation.session.panel.section:acp-background-tasks')
  assert.ok(sectionEntry)
  assert.equal(sectionEntry.options.order, 305)
  assert.equal(sectionEntry.options.label(), 'ACP background tasks')
  active = 'zh'
  assert.equal(sectionEntry.options.label(), 'ACP 后台任务')

  const progressEntry = slots.get('conversation.session.panel.section.actions:acp-background-tasks')
  assert.ok(progressEntry)
  const indicatorEntry = slots.get('conversation.session.panel.indicator:acp-background-tasks.running')
  assert.ok(indicatorEntry)
  assert.equal(indicatorEntry.options.order, 25)

  assert.equal(sectionEntry.component({ sessionId: 'sess-empty' }), null)
  assert.equal(progressEntry.component({ sessionId: 'sess-empty' }), null)
  assert.equal(indicatorEntry.component({ sessionId: 'sess-empty', panelShown: false }), null)

  const waitSpec = convEvents.find(spec => spec.kind === 'acp-wait')
  assert.ok(waitSpec)
  const activeNode = waitSpec.buildViewNode({
    key: 'k',
    id: '1',
    start: { location: { kind: 'turn', turn: { status: 'open' } } },
    matches: [],
    state: { turn: 1, phase: 'active', lastSeq: 5, lastActivityAt: Date.now(), closed: false },
  })
  assert.equal(activeNode?.kind, 'acp-wait')
})

function walkTree(node, visit) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const item of node) walkTree(item, visit)
    return
  }
  visit(node)
  if (typeof node.type === 'function') {
    walkTree(node.type(node.props ?? {}), visit)
    return
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) walkTree(child, visit)
  }
}

function collectText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join('')
  if (!node || typeof node !== 'object') return ''
  if (typeof node.type === 'function') return collectText(node.type(node.props ?? {}))
  return (node.children ?? []).map(collectText).join('')
}

test('acp-workbench renders compact single-line engine status rows with icon badge, readiness state, and probe latency', () => {
  let idCounter = 0
  let stateCallIndex = 0
  const workbenchSnapshot = {
    providers: [
      { id: 'cursor', label: 'Cursor', command: 'cursor-agent', args: ['acp'], models: [] },
      { id: 'antigravity', label: 'Antigravity', command: 'agy', args: ['acp'], models: [] },
      { id: 'hermes', label: 'Hermes', command: 'hermes', args: ['acp'], models: [] },
    ],
    providerTemplates: [],
    activeByProvider: { cursor: { connected: 1, working: 0, waiting: 0 } },
    authByProvider: {},
    probeByProvider: {
      cursor: { status: 'ready', latencyMs: 42, checkedAt: '2026-11-25T00:00:00Z' },
      antigravity: { status: 'ready', latencyMs: 1250, checkedAt: '2026-11-25T00:00:00Z' },
      hermes: { status: 'error', latencyMs: 18, error: 'spawn ENOENT', checkedAt: '2026-11-25T00:00:00Z' },
    },
    localUsageByProvider: {},
    defaultCwd: '/repo',
    storageError: null,
  }
  const reactStub = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useSyncExternalStore: (subscribe, getSnapshot) => {
      const off = subscribe(() => {})
      if (typeof off === 'function') off()
      return getSnapshot()
    },
    useState: init => {
      const idx = stateCallIndex++
      const value = typeof init === 'function' ? init() : init
      if (idx === 3) return [workbenchSnapshot, () => {}]
      if (idx === 4) return [true, () => {}]
      return [value, () => {}]
    },
    useRef: current => ({ current }),
    useMemo: fn => fn(),
    useCallback: fn => fn,
    useEffect: () => {},
    useLayoutEffect: () => {},
    useId: () => `id-${++idCounter}`,
  }
  const { plugin } = loadClient(clientPath, {
    react: reactStub,
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })

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
    effect: (fn, label) => (label === 'acp-workbench: styles' ? undefined : fn()),
    get: () => undefined,
    inputTriggers: { registerSource: () => () => {} },
    uiConversation: { events: { register: () => () => {} } },
    uiWorkspace: { openSession: () => {} },
    slots: {
      entries: () => [],
      inject: (_name, fn) => {
        const res = fn()
        if (res && typeof res[Symbol.iterator] === 'function') Array.from(res)
      },
      register: (options, component) => {
        slots.set(`${options.name}:${options.id ?? options.key ?? ''}`, { options, component })
        return () => {}
      },
    },
  }
  plugin.apply(ctx)

  const pageEntry = slots.get('main:acp-workbench')
  assert.ok(pageEntry)

  stateCallIndex = 0
  const tree = pageEntry.component({})
  const engineRows = []
  walkTree(tree, node => {
    if (node.props?.className === 'aw-engine-row') engineRows.push(node)
  })
  assert.ok(engineRows.length >= 3)

  const cursorRow = engineRows.find(row => row.props['data-engine'] === 'cursor')
  const agyRow = engineRows.find(row => row.props['data-engine'] === 'antigravity')
  const hermesRow = engineRows.find(row => row.props['data-engine'] === 'hermes')
  assert.ok(cursorRow && agyRow && hermesRow)

  assert.match(collectText(cursorRow), /Cursor.*1 connected.*42 ms/u)
  assert.match(collectText(agyRow), /Antigravity.*Ready.*1\.3 s/u)
  assert.match(collectText(hermesRow), /Hermes.*Unavailable/u)
  assert.doesNotMatch(collectText(hermesRow), /18 ms/u)

  active = 'zh'
  stateCallIndex = 0
  const zhTree = pageEntry.component({})
  const zhRows = []
  walkTree(zhTree, node => {
    if (node.props?.className === 'aw-engine-row') zhRows.push(node)
  })
  assert.match(collectText(zhRows.find(row => row.props['data-engine'] === 'cursor')), /Cursor.*已连接 1.*42 ms/u)
  assert.match(collectText(zhRows.find(row => row.props['data-engine'] === 'antigravity')), /Antigravity.*就绪.*1\.3 s/u)
})
