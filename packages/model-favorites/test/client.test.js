import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))

function createReactStub() {
  return {
    Fragment: Symbol.for('react.fragment'),
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children: children.flat(Infinity).filter(v => v !== null && v !== undefined && v !== false) }
    },
    useState(initial) {
      return [typeof initial === 'function' ? initial() : initial, () => {}]
    },
    useRef(initial) {
      return { current: initial }
    },
    useMemo(fn) {
      return fn()
    },
    useEffect() {},
    useSyncExternalStore(_sub, getSnapshot) {
      return getSnapshot()
    },
  }
}

function loadClient({ react = createReactStub(), doc = null, fetchImpl = null, portals = [] } = {}) {
  let registered
  const window = {
    __ModuleLoader__: { load: record => { registered = record } },
    addEventListener() {},
    removeEventListener() {},
  }
  const sandbox = {
    window,
    document: doc,
    console,
    fetch: fetchImpl ?? (async () => ({ ok: true, status: 200, json: async () => ({ favorites: [] }) })),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame: fn => { fn(); return 1 },
    JSON,
    Date,
    Map,
    Set,
    WeakMap,
    Promise,
  }
  vm.runInNewContext(readFileSync(clientPath, 'utf8'), sandbox, { filename: clientPath })

  const primitives = {
    DisclosureRow: ({ label, children }) => react.createElement('div', { 'data-disclosure': true }, label, children),
    StateDot: ({ state }) => react.createElement('span', { 'data-state-dot': state }),
    Tag: ({ tone, children }) => react.createElement('span', { 'data-tag': tone }, children),
    TextShimmer: ({ children }) => react.createElement('span', { 'data-shimmer': true }, children),
    IconCheckOutlineRegular: () => react.createElement('svg', { 'data-icon': 'check' }),
    IconChevronDownOutlineRegular: () => react.createElement('svg', { 'data-icon': 'down' }),
    IconChevronRightOutlineRegular: () => react.createElement('svg', { 'data-icon': 'right' }),
    IconChevronUpOutlineRegular: () => react.createElement('svg', { 'data-icon': 'up' }),
    IconInspectOutlineRegular: () => react.createElement('svg', { 'data-icon': 'inspect' }),
    IconTrashOutlineRegular: () => react.createElement('svg', { 'data-icon': 'trash' }),
  }

  const require = id => {
    if (id === 'react') return react
    if (id === 'react-dom') return { createPortal: (node, target) => { portals.push({ node, target }); return node } }
    if (id === '@deepseek-ai/dsh-client-ui-primitives') return primitives
    throw new Error(`unexpected require(${id})`)
  }
  return { id: registered.id, plugin: registered.factory(require) }
}

function createLocaleStub() {
  const dicts = new Map()
  const listeners = new Set()
  const lang = 'zh'
  return {
    dicts,
    register(ns, localeOrMap, dict) {
      if (typeof localeOrMap === 'string') {
        dicts.set(`${ns}:${localeOrMap}`, dict)
      } else if (localeOrMap && typeof localeOrMap === 'object') {
        for (const [k, v] of Object.entries(localeOrMap)) dicts.set(`${ns}:${k}`, v)
      }
      return () => {}
    },
    bind(ns) {
      return (key, params = {}) => {
        const table = dicts.get(`${ns}:${lang}`) ?? dicts.get(`${ns}:en`) ?? {}
        const raw = table[key] ?? key
        return String(raw).replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`))
      }
    },
    resolveText(text) {
      if (typeof text === 'string') return text
      return text?.[lang] ?? text?.en ?? ''
    },
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    getSnapshot() {
      return lang
    },
  }
}

function collectText(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join('')
  if (typeof node.type === 'function') return collectText(node.type({ ...node.props, children: node.children }))
  return collectText(node.children)
}

function findNodes(node, predicate, out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) findNodes(item, predicate, out)
    return out
  }
  if (predicate(node)) out.push(node)
  if (node.children) findNodes(node.children, predicate, out)
  return out
}

test('model-favorites client registers slots, locales, evaluates labels, and renders first screen', () => {
  const appended = []
  const doc = {
    hidden: false,
    createElement: tag => ({ tag, dataset: {}, textContent: '', setAttribute() {}, remove() {} }),
    head: { appendChild: el => { appended.push(el) } },
    addEventListener() {},
    removeEventListener() {},
  }
  const { id, plugin } = loadClient({ doc })
  assert.equal(id, 'dsh-model-favorites')
  assert.deepEqual([...plugin.inject], ['slots', 'locale', 'modelDirectories'])

  const locale = createLocaleStub()
  locale.register('model', 'zh', { 'provider.account': 'DeepSeek 账号' })
  const registeredSlots = []
  const disposers = []

  const directorySnapshot = {
    current: { provider: 'openai', model: 'gpt-5' },
    groups: [
      {
        id: 'openai',
        name: 'OpenAI',
        models: [
          { id: 'gpt-5', name: 'GPT-5', badge: { tone: 'info', text: { en: 'New', zh: '新' } } },
        ],
      },
    ],
    failures: [],
    status: 'ready',
    pending: null,
    error: null,
  }
  const directory = {
    store: {
      subscribe: () => () => {},
      getSnapshot: () => directorySnapshot,
    },
    select: async () => ({ ok: true, value: undefined }),
  }

  const commandOptionsCalls = []
  const commandSelectCalls = []
  const modelContrib = {
    name: 'model',
    ui: {
      kind: 'popupSelect',
      options: async session => {
        commandOptionsCalls.push(session)
        return [{ id: 'openai/gpt-5', label: 'GPT-5', group: { name: 'openai', label: 'OpenAI' } }]
      },
      onSelect: async (option, session) => {
        commandSelectCalls.push({ option, session })
      },
    },
  }

  const ctx = {
    effect(fn) {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
      return dispose
    },
    locale,
    slots: {
      inject(_name, fn) { return fn() },
      register(options, component) {
        registeredSlots.push({ options, component })
        return () => {}
      },
    },
    modelDirectories: {
      directoryFor: () => directory,
    },
    get(service) {
      if (service === 'commandUi') {
        return { live: { contributions: new Map([['model', modelContrib]]) } }
      }
      return undefined
    },
  }

  plugin.apply(ctx)

  assert.deepEqual(
    Object.keys(locale.dicts.get('model-favorites:en')).toSorted(),
    Object.keys(locale.dicts.get('model-favorites:zh')).toSorted(),
  )
  assert.equal(appended.length, 1)

  const slotNames = registeredSlots.map(s => s.options.name)
  assert.deepEqual(slotNames, [
    'conversation.input.model.label',
    'conversation.input.model.options',
    'conversation.input.model.pane',
    'tool.call.toolview',
  ])

  for (const slot of registeredSlots) {
    if (typeof slot.options.label === 'function') {
      const evaluated = slot.options.label()
      assert.equal(typeof evaluated, 'string')
      assert.ok(evaluated.length > 0)
    }
  }

  const labelSlot = registeredSlots.find(s => s.options.name === 'conversation.input.model.label')
  const labelInjected = labelSlot.options.inject('sess-1')
  const triggerTree = labelSlot.component({
    provider: { id: 'openai', name: 'OpenAI' },
    model: directorySnapshot.groups[0].models[0],
    placement: 'trigger',
    selected: true,
    ...labelInjected,
  })
  assert.match(collectText(triggerTree), /GPT-5/)

  const optionTree = labelSlot.component({
    provider: { id: 'openai', name: 'OpenAI' },
    model: directorySnapshot.groups[0].models[0],
    placement: 'option',
    selected: true,
    ...labelInjected,
  })
  const starButtons = findNodes(optionTree, n => n.props?.role === 'button' && n.props?.className === 'mf-star')
  assert.equal(starButtons.length, 1)

  const optionsSlot = registeredSlots.find(s => s.options.name === 'conversation.input.model.options')
  const optionsTree = optionsSlot.component({
    locked: false,
    dismiss() {},
    reportFailure() {},
    openPane() {},
    ...optionsSlot.options.inject('sess-1'),
  })
  assert.match(collectText(optionsTree), /收藏模型/)

  const paneSlot = registeredSlots.find(s => s.options.name === 'conversation.input.model.pane')
  const paneTree = paneSlot.component({
    locked: false,
    dismiss() {},
    reportFailure() {},
    ...paneSlot.options.inject('sess-1'),
  })
  assert.match(collectText(paneTree), /收藏当前模型/)
  assert.match(collectText(paneTree), /暂无收藏模型/)

  const toolSlot = registeredSlots.find(s => s.options.name === 'tool.call.toolview')
  const toolTree = toolSlot.component({
    call: { arguments: { action: 'list' } },
    result: { content: [{ text: JSON.stringify({ favorites: [{ provider: 'openai', model: 'gpt-5' }] }) }] },
    state: 'done',
    inspect() {},
  })
  assert.match(collectText(toolTree), /收藏模型/)
  assert.match(collectText(toolTree), /1 个收藏/)

  for (const dispose of disposers) dispose()
})

test('client helpers filter, resolve, and pin favorites for /model command', () => {
  const { plugin } = loadClient()
  const { resolveFavorites, matchesQuery, reorderCommandOptions } = plugin._internal

  const groups = [
    {
      id: 'deepseek-account',
      name: 'DeepSeek',
      models: [{ id: 'deepseek-chat', name: 'DeepSeek Chat' }],
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      models: [{ id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' }],
    },
  ]
  const resolved = resolveFavorites(
    [
      { provider: 'deepseek-account', model: 'deepseek-chat' },
      { provider: 'missing', model: 'old-model' },
    ],
    groups,
    'DeepSeek 账号',
  )
  assert.equal(resolved.length, 2)
  assert.equal(resolved[0].available, true)
  assert.equal(resolved[0].provider.name, 'DeepSeek 账号')
  assert.equal(resolved[1].available, false)

  assert.equal(matchesQuery(resolved[0], 'ds chat'), true)
  assert.equal(matchesQuery(resolved[0], 'claude'), false)

  const rows = [
    { id: 'deepseek-account/deepseek-chat', label: 'DeepSeek Chat', group: { name: 'deepseek-account', label: 'DeepSeek 账号' } },
    { id: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5', group: { name: 'anthropic', label: 'Anthropic' } },
  ]
  const pinned = reorderCommandOptions(rows, [{ provider: 'anthropic', model: 'claude-sonnet-4-5' }], '收藏模型')
  assert.equal(pinned.length, 3)
  assert.equal(pinned[0].id, 'fav:anthropic/claude-sonnet-4-5')
  assert.equal(pinned[0].group.label, '收藏模型')
})
