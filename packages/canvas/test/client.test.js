import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)))
const { buildSrcDoc, resolveTargetPath, fileAddress, readJsonResponse } = plugin._internal

test('registers under package name dsh-canvas', () => {
  assert.equal(id, 'dsh-canvas')
})

test('sandbox srcdoc enforces strict nonce-only CSP with zero network and zero unsafe-eval', () => {
  const html = buildSrcDoc('abc123')
  assert.match(html, /default-src 'none'/)
  assert.match(html, /script-src 'nonce-abc123'/)
  assert.match(html, /connect-src 'none'/)
  assert.ok(!html.includes('unsafe-eval'))
  assert.match(html, /<script nonce="abc123">/)
})

test('resolveTargetPath resolves workspace-relative and absolute paths cleanly', () => {
  assert.equal(resolveTargetPath('/repo', 'src/app.ts'), '/repo/src/app.ts')
  assert.equal(resolveTargetPath('/repo/', '/other/file.ts'), '/other/file.ts')
  assert.equal(
    fileAddress('s-1', '/repo/.dsh/canvases/demo.canvas.tsx'),
    'dsh-resource://file/session/s-1/%2Frepo%2F.dsh%2Fcanvases%2Fdemo.canvas.tsx'.replace(/%2F/g, '/'),
  )
})

test('built client.runtime.js chunk loads under dsh-canvas module id', () => {
  const chunk = readFileSync(fileURLToPath(new URL('../lib/client.runtime.js', import.meta.url)), 'utf8')
  assert.match(chunk, /window\.__ModuleLoader__\.load\(\{\s*id:\s*'dsh-canvas',\s*chunk:\s*'client\.runtime\.js'/)
})

test('readJsonResponse handles empty and non-JSON error responses without SyntaxError', async () => {
  await assert.rejects(
    readJsonResponse(new Response('', { status: 404 })),
    /HTTP 404/,
  )
  await assert.rejects(
    readJsonResponse(new Response(JSON.stringify({ message: 'sessionId is required' }), { status: 400 })),
    /sessionId is required/,
  )
  const ok = await readJsonResponse(new Response(JSON.stringify({ enabled: true }), { status: 200 }))
  assert.deepEqual(ok, { enabled: true })
})

test('apply uses real DSH locale and theme client APIs during boot and render', () => {
  const reactStub = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props, children }),
    useSyncExternalStore: (subscribe, getSnapshot) => {
      const off = subscribe(() => {})
      if (typeof off === 'function') off()
      return getSnapshot()
    },
    useMemo: fn => fn(),
    useEffect: () => {},
    useCallback: fn => fn,
    useState: init => [typeof init === 'function' ? init() : init, () => {}],
    useRef: current => ({ current }),
  }
  const { plugin: livePlugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), { react: reactStub })

  const registeredDicts = new Map()
  const slotEntries = new Map()
  const sidebarTabs = []
  const commands = []
  const openedTabs = []
  const themeListeners = new Set()

  const locale = {
    register(ns, dicts) {
      registeredDicts.set(ns, dicts)
      return () => registeredDicts.delete(ns)
    },
    bind(ns) {
      return (key, vars) => {
        const raw = registeredDicts.get(ns)?.en?.[key] ?? key
        return vars ? raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : raw
      }
    },
    subscribe: () => () => {},
    getSnapshot: () => ({ active: 'en' }),
  }
  const theme = {
    getTheme: () => ({ active: { colorScheme: 'light' } }),
  }

  const ctx = {
    locale,
    theme,
    sidebarRight: {
      openTab: (kind, opts) => openedTabs.push({ kind, opts }),
      openResource: () => {},
    },
    sidebarRightTabs: {
      register: def => {
        sidebarTabs.push(def)
        return () => {}
      },
    },
    slots: {
      inject: (_name, fn) => fn(),
      register: (opts, component) => {
        slotEntries.set(`${opts.name}:${opts.id ?? opts.key ?? ''}`, { opts, component })
        return () => {}
      },
    },
    effect: (fn, label) => (label === 'canvas: styles' ? undefined : fn()),
    on: (event, fn) => {
      if (event === 'theme/change') themeListeners.add(fn)
      return () => themeListeners.delete(fn)
    },
    get: () => undefined,
    inject: (deps, fn) => {
      if (deps.includes('commandUi')) {
        fn({
          effect: cb => cb(),
          commandUi: {
            register: cmd => {
              commands.push(cmd)
              return () => {}
            },
          },
        })
      }
    },
  }

  livePlugin.apply(ctx)

  assert.equal(slotEntries.has('sidebar.panellist:dsh-canvas-apps'), false)
  assert.equal(slotEntries.has('main:dsh-canvas-apps'), false)

  assert.equal(sidebarTabs.length, 1)
  assert.equal(sidebarTabs[0].title(), 'Canvas')
  assert.equal(sidebarTabs[0].guide[0].title(), 'Canvas')
  assert.match(sidebarTabs[0].guide[0].description(), /Live sandboxed/)

  assert.equal(commands.length, 1)
  assert.equal(commands[0].label(), 'Canvas')
  commands[0].ui.run()
  assert.equal(openedTabs.length, 1)
  assert.equal(openedTabs[0].kind, 'dsh-canvas')

  const tabTitle = slotEntries.get('sidebar.right.pane.tab.title:dsh-canvas')
  assert.ok(tabTitle.component())

  const panelSlot = slotEntries.get('sidebar.right.pane.tab:dsh-canvas')
  const workspaceEl = panelSlot.component({ sessionId: '', useTabInfo: () => ({ tab: null }) })
  assert.ok(workspaceEl.type(workspaceEl.props))

  const toolCard = slotEntries.get('tool.call.toolview:canvas_write')
  const cardEl = toolCard.component({
    phase: 'result',
    block: {
      kind: 'tool_result',
      call: { argsRaw: JSON.stringify({ path: 'board.canvas.tsx' }) },
      content: [{ type: 'text', text: JSON.stringify({ title: 'Board', path: '/repo/.dsh/canvases/board.canvas.tsx', revision: 1 }) }],
    },
  })
  const actionsDiv = cardEl.children.find(c => c?.props?.className === 'cv-toolcard-actions')
  actionsDiv.children[0].props.onClick()
  assert.equal(openedTabs.length, 2)
  assert.equal(openedTabs[1].kind, 'dsh-canvas')
  assert.equal(openedTabs[1].opts?.params?.path, '/repo/.dsh/canvases/board.canvas.tsx')
})
