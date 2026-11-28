import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'
import {
  OP_PATH,
  STATE_PATH,
  apply as applyServer,
} from '../lib/index.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))

function createReactStub() {
  return {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children: children.flat() }
    },
    useState(initial) {
      return [typeof initial === 'function' ? initial() : initial, () => {}]
    },
    useEffect() {},
    useRef(value) { return { current: value } },
    useMemo(fn) { return fn() },
    useCallback(fn) { return fn },
    useSyncExternalStore(_sub, snap) { return snap() },
  }
}

function collectText(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join('')
  return collectText(node.children)
}

test('annotations client registers slots, locales, Forge source, and renders selection bar + dock', () => {
  const react = createReactStub()
  const { id, plugin } = loadClient(clientPath, { react, 'react-dom': { createPortal: x => x } })
  assert.equal(id, 'dsh-annotations')
  assert.deepEqual([...plugin.inject], ['slots', 'locale'])

  const locales = new Map()
  const slots = []
  const forgeSources = []
  const ctx = {
    effect(fn) { return fn() },
    get() { return undefined },
    inject(deps, cb) {
      if (deps.includes('forgeChanges')) {
        cb({
          effect: fn => fn(),
          forgeChanges: {
            registerAnnotations(source) {
              forgeSources.push(source)
              return () => {}
            },
          },
        })
      }
    },
    locale: {
      register(ns, lang, dict) {
        locales.set(`${ns}:${lang}`, dict)
        return () => {}
      },
      bind(ns) {
        const dict = locales.get(`${ns}:zh`) ?? {}
        return (key, params) => {
          let text = dict[key] ?? key
          if (params) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v))
          return text
        }
      },
      subscribe() { return () => {} },
      getSnapshot() { return { revision: 1 } },
    },
    slots: {
      inject(_name, fn) { return fn() },
      register(options, component) {
        slots.push({ options, component })
        return () => {}
      },
    },
  }

  plugin.apply(ctx)

  assert.deepEqual(
    Object.keys(locales.get('annotations:en')).toSorted(),
    Object.keys(locales.get('annotations:zh')).toSorted(),
  )
  assert.deepEqual(
    slots.map(s => s.options.name),
    [
      'conversation.chat.text-interaction',
      'conversation.input.dock',
      'forge.diff.comment.actions',
      'forge.diff.line.annotation',
      'forge.changes.file.menu',
      'forge.changes.toolbar',
    ],
  )
  assert.equal(slots[0].options.key, 'quote')
  assert.equal(slots[0].options.priority, -10)
  assert.equal(forgeSources.length, 1)

  const SelectionBar = slots[0].component
  const renderedBar = SelectionBar({
    sessionId: 's1',
    dismiss() {},
    readText: () => 'hello',
    clearSelection() {},
    inputActions: { insertQuote: () => true },
    useSession: sel => sel({ removed: false, subagent: null }),
  })
  const barText = collectText(renderedBar)
  assert.match(barText, /引用文本/)
  assert.match(barText, /标注/)

  const InputDock = slots[1].component
  assert.equal(InputDock({ sessionId: 's1', inputState: { phase: 'plain', draft: '' }, inputActions: {} }), null)
})

test('annotations server injects pending annotations on pre-step and marks them consumed on session/event', async () => {
  let stored = { version: 1, sessions: {} }
  const routes = new Map()
  const listeners = new Map()
  const disposers = []

  const ctx = {
    effect(fn) {
      const d = fn()
      if (typeof d === 'function') disposers.push(d)
      return d
    },
    on(event, fn) {
      const list = listeners.get(event) ?? []
      list.push(fn)
      listeners.set(event, list)
      return () => {}
    },
    storageDomain: {
      async open() {
        return {
          global: {
            get: () => stored,
            async set(next) { stored = next },
          },
          async close() {},
        }
      },
    },
    webServer: {
      register(route) {
        routes.set(route.path, route.handler)
        return () => {}
      },
    },
    connection: {},
  }

  applyServer(ctx)

  const invoke = async (path, method, body) => {
    const req = Readable.from(body ? [Buffer.from(JSON.stringify(body))] : [])
    req.method = method
    req.url = path
    let status = 200
    let payload = ''
    const res = {
      set statusCode(v) { status = v },
      get statusCode() { return status },
      setHeader() {},
      end(chunk) { payload = chunk ?? '' },
    }
    const basePath = path.split('?')[0]
    await routes.get(basePath)(req, res, { principal: { kind: 'owner' } })
    return { status, body: payload ? JSON.parse(payload) : null }
  }

  const addDiff = await invoke(OP_PATH, 'POST', {
    sessionId: 'sess-1',
    action: 'add',
    anchor: { kind: 'git-diff', source: 'local', path: 'src/auth.ts', side: 'R', startLine: 42, endLine: 45, snippet: 'throw new Error()' },
    note: 'Return 401 instead of throwing',
    intent: 'fix',
  })
  assert.equal(addDiff.status, 200)
  assert.equal(addDiff.body.item.shortId, 'A1')

  const addUser = await invoke(OP_PATH, 'POST', {
    sessionId: 'sess-1',
    action: 'add',
    anchor: { kind: 'message-text', speaker: 'user', quote: 'keep legacy config' },
    note: 'Drop legacy support',
    intent: 'revise',
  })
  assert.equal(addUser.status, 200)
  assert.equal(addUser.body.item.shortId, 'A2')

  const preStep = listeners.get('agent/pre-step')[0]
  const userMsg = { id: 'u1', role: 'user', content: [{ type: 'text', text: 'Address A1 and A2' }], source: { kind: 'user' } }
  const decision = await preStep(
    { agent: { session: { id: 'sess-1' } }, turn: 3, step: 1, signal: new AbortController().signal },
    async () => ({ kind: 'enter', messages: [userMsg] }),
  )
  assert.equal(decision.messages.length, 2)
  assert.equal(decision.messages[0].source.kind, 'annotations')
  assert.equal(decision.messages[0].source.form, 'notice')
  assert.match(decision.messages[0].content[0].text, /source="git-diff"/)
  assert.match(decision.messages[0].content[0].text, /source="user-message"/)
  assert.equal(decision.messages[1], userMsg)

  const beforeEvent = await invoke(`${STATE_PATH}?sessionId=sess-1`, 'GET')
  assert.equal(beforeEvent.body.items.filter(i => i.status === 'draft').length, 2)

  const onSessionEvent = listeners.get('session/event')[0]
  onSessionEvent({ id: 'sess-1' }, { type: 'user/message', data: decision.messages[0] })

  const afterEvent = await invoke(`${STATE_PATH}?sessionId=sess-1`, 'GET')
  assert.equal(afterEvent.body.items.filter(i => i.status === 'consumed').length, 2)
  assert.equal(afterEvent.body.items[0].consumedAtTurn, 3)

  for (const dispose of disposers) await dispose()
})
