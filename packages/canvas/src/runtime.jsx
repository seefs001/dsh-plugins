import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  ActionContext,
  DataContext,
  StateContext,
  ThemeContext,
  useCanvasAction,
  useCanvasFile,
  useCanvasGlob,
  useCanvasState,
  useHostData,
  useHostTheme,
} from './context.js'
import { BarChart, LineChart, PieChart, UsageBar } from './charts.jsx'
import {
  CodeBlock,
  Drawer,
  EmptyState,
  Kanban,
  KeyValue,
  Markdown,
  Modal,
  ProgressBar,
  SearchInput,
  SplitPane,
  Timeline,
} from './artifacts.jsx'
import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Code,
  CollapsibleSection,
  DAGView,
  DiffStats,
  DiffView,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  IconButton,
  Link,
  Pill,
  Row,
  Select,
  Spacer,
  Stack,
  Stat,
  Swatch,
  Table,
  Tabs,
  Text,
  TextArea,
  TextInput,
  TodoList,
  TodoListCard,
  Toggle,
  mergeStyle,
} from './components.jsx'
import { computeDAGLayout } from './dag.js'
import { Icon, ICON_NAMES, LUCIDE_ICONS } from './icons.jsx'
import {
  canvasPaletteDark,
  canvasPaletteLight,
  canvasTokens,
  canvasTokensLight,
  categoryPaletteDark,
  categoryPaletteLight,
  colorPalette,
  resolveTheme,
  usageColorSequence,
} from './tokens.js'

const SDK = {
  Fragment: React.Fragment,
  useState: React.useState,
  useEffect: React.useEffect,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useRef: React.useRef,
  useReducer: React.useReducer,
  useHostTheme,
  useCanvasState,
  useCanvasAction,
  useCanvasFile,
  useCanvasGlob,
  useHostData,
  colorPalette,
  categoryPaletteDark,
  categoryPaletteLight,
  usageColorSequence,
  canvasPaletteDark,
  canvasPaletteLight,
  canvasTokens,
  canvasTokensLight,
  resolveTheme,
  computeDAGLayout,
  BarChart,
  LineChart,
  PieChart,
  UsageBar,
  Stack,
  Row,
  Grid,
  Spacer,
  Divider,
  H1,
  H2,
  H3,
  Text,
  Code,
  Link,
  Card,
  CardHeader,
  CardBody,
  Callout,
  CollapsibleSection,
  Pill,
  Stat,
  Swatch,
  Button,
  IconButton,
  TextInput,
  TextArea,
  Select,
  Checkbox,
  Toggle,
  Tabs,
  Table,
  DiffView,
  DiffStats,
  TodoList,
  TodoListCard,
  DAGView,
  Markdown,
  CodeBlock,
  Modal,
  Drawer,
  SplitPane,
  EmptyState,
  ProgressBar,
  SearchInput,
  KeyValue,
  Timeline,
  Kanban,
  Icon,
  ICON_NAMES,
  mergeStyle,
}

const REACT_MODULE = {
  ...React,
  default: React,
}

const LUCIDE_MODULE = {
  ...LUCIDE_ICONS,
  Icon,
}

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.error) {
      const theme = this.props.theme
      const message = String(this.state.error?.message ?? this.state.error)
      const stack = typeof this.state.error?.stack === 'string' ? this.state.error.stack.slice(0, 1200) : ''
      return (
        <div
          style={{
            padding: 16,
            borderRadius: theme.radius.md,
            background: theme.categories.red.bg,
            border: `1px solid ${theme.categories.red.border}`,
            color: theme.text.primary,
            fontFamily: theme.typography.sans,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.categories.red.fg }}>
              Canvas runtime error
            </div>
            <button
              type="button"
              onClick={() => this.props.onAskFix?.(message, stack)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${theme.categories.red.border}`,
                background: theme.bg.editor,
                color: theme.text.primary,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Ask agent to fix
            </button>
          </div>
          <pre style={{ margin: 0, fontSize: 12, fontFamily: theme.typography.mono, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: theme.text.secondary }}>
            {message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function applyThemeVars(theme) {
  const root = document.documentElement.style
  root.colorScheme = theme.kind
  root.setProperty('--cv-bg', theme.bg.editor)
  root.setProperty('--cv-surface', theme.bg.chrome)
  root.setProperty('--cv-elevated', theme.bg.elevated)
  root.setProperty('--cv-border', theme.stroke.secondary)
  root.setProperty('--cv-border-strong', theme.stroke.primary)
  root.setProperty('--cv-text', theme.text.primary)
  root.setProperty('--cv-text-secondary', theme.text.secondary)
  root.setProperty('--cv-text-tertiary', theme.text.tertiary)
  root.setProperty('--cv-accent', theme.accent.primary)
  root.setProperty('--cv-success', theme.status.success)
  root.setProperty('--cv-warning', theme.status.warn)
  root.setProperty('--cv-error', theme.status.error)
  document.body.style.background = theme.bg.editor
  document.body.style.color = theme.text.primary
  document.body.style.fontFamily = theme.typography.sans
}

function CanvasShell({ store }) {
  const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
  const theme = snapshot.theme
  const stateContext = React.useMemo(() => ({
    values: snapshot.state,
    setKey: store.setStateKey,
  }), [snapshot.state, store.setStateKey])

  const dataContext = React.useMemo(() => ({
    files: snapshot.data.files,
    globs: snapshot.data.globs,
    host: snapshot.data.host,
    subscribeFile: store.subscribeFile,
    subscribeGlob: store.subscribeGlob,
    subscribeHost: store.subscribeHost,
    refresh: store.refreshData,
  }), [snapshot.data, store])

  React.useEffect(() => {
    applyThemeVars(theme)
  }, [theme])

  if (snapshot.loadError) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ padding: 14, borderRadius: theme.radius.md, background: theme.categories.red.bg, border: `1px solid ${theme.categories.red.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.categories.red.fg, marginBottom: 6 }}>Failed to load Canvas</div>
          <pre style={{ margin: 0, fontSize: 12, fontFamily: theme.typography.mono, whiteSpace: 'pre-wrap', color: theme.text.secondary }}>
            {snapshot.loadError}
          </pre>
        </div>
      </div>
    )
  }

  const Component = snapshot.Component
  if (!Component) return null

  return (
    <ThemeContext.Provider value={theme}>
      <StateContext.Provider value={stateContext}>
        <DataContext.Provider value={dataContext}>
          <ActionContext.Provider value={store.dispatchAction}>
            <div style={{ padding: '18px 20px 32px', minHeight: '100vh', boxSizing: 'border-box', background: theme.bg.editor, color: theme.text.primary }}>
              <CanvasErrorBoundary
                key={snapshot.revisionKey}
                theme={theme}
                onError={store.reportError}
                onAskFix={(message, stack) => store.dispatchAction({
                  type: 'askInChat',
                  prompt: `Fix the runtime error in the active canvas:\n${message}${stack ? `\n\nStack:\n${stack}` : ''}`,
                })}
              >
                <Component />
              </CanvasErrorBoundary>
            </div>
          </ActionContext.Provider>
        </DataContext.Provider>
      </StateContext.Provider>
    </ThemeContext.Provider>
  )
}

function createBridgeStore(port) {
  let snap = {
    theme: resolveTheme(null),
    state: {},
    data: { files: {}, globs: {}, host: {} },
    Component: null,
    revisionKey: 0,
    loadError: '',
  }
  const listeners = new Set()
  const notify = () => { for (const fn of listeners) fn() }
  const update = patch => { snap = { ...snap, ...patch }; notify() }

  const fileSubs = new Map()
  const globSubs = new Map()
  const hostSubs = new Map()
  let syncTimer = null

  const scheduleSyncSubs = () => {
    if (syncTimer !== null) return
    syncTimer = setTimeout(() => {
      syncTimer = null
      port.postMessage({
        type: 'data/subscribe',
        subscriptions: {
          files: Object.fromEntries([...fileSubs.entries()].map(([k, v]) => [k, v.spec])),
          globs: Object.fromEntries([...globSubs.entries()].map(([k, v]) => [k, v.spec])),
          host: Object.fromEntries([...hostSubs.entries()].map(([k, v]) => [k, v.spec])),
        },
      })
    }, 0)
  }

  const addSub = (map, key, spec) => {
    const existing = map.get(key)
    if (existing) {
      existing.count++
    } else {
      map.set(key, { count: 1, spec })
      scheduleSyncSubs()
    }
    return () => {
      const entry = map.get(key)
      if (!entry) return
      entry.count--
      if (entry.count <= 0) {
        map.delete(key)
        scheduleSyncSubs()
      }
    }
  }

  const store = {
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    getSnapshot() {
      return snap
    },
    setTheme(raw) {
      update({ theme: resolveTheme(raw) })
    },
    replaceState(nextState) {
      update({ state: nextState && typeof nextState === 'object' ? { ...nextState } : {} })
    },
    replaceData(nextData) {
      if (!nextData || typeof nextData !== 'object') return
      update({
        data: {
          files: nextData.files && typeof nextData.files === 'object' ? nextData.files : snap.data.files,
          globs: nextData.globs && typeof nextData.globs === 'object' ? nextData.globs : snap.data.globs,
          host: nextData.host && typeof nextData.host === 'object' ? nextData.host : snap.data.host,
        },
      })
    },
    subscribeFile(key, spec) {
      return addSub(fileSubs, key, spec)
    },
    subscribeGlob(key, spec) {
      return addSub(globSubs, key, spec)
    },
    subscribeHost(key, spec) {
      return addSub(hostSubs, key, spec)
    },
    refreshData() {
      port.postMessage({ type: 'data/refresh' })
    },
    setStateKey(key, value) {
      update({ state: { ...snap.state, [key]: value } })
      port.postMessage({ type: 'state/set', key, value })
    },
    dispatchAction(action) {
      if (!action || typeof action !== 'object' || typeof action.type !== 'string') return
      port.postMessage({ type: 'action', action })
    },
    reportError(error) {
      port.postMessage({
        type: 'runtime/error',
        message: String(error?.message ?? error),
        stack: typeof error?.stack === 'string' ? error.stack.slice(0, 2000) : '',
      })
    },
    mountFactory(factory, revisionKey) {
      const moduleObj = { exports: {} }
      const canvasRequire = id => {
        if (id === 'dsh/canvas') return SDK
        if (id === 'react') return REACT_MODULE
        if (id === 'lucide-react') return LUCIDE_MODULE
        throw new Error(`Disallowed module import "${id}".`)
      }
      try {
        factory(canvasRequire, moduleObj, moduleObj.exports, React)
        const exported = moduleObj.exports?.default ?? moduleObj.exports
        if (typeof exported !== 'function') {
          throw new Error('Canvas default export must be a React component function.')
        }
        update({ Component: exported, revisionKey: revisionKey ?? snap.revisionKey + 1, loadError: '' })
        port.postMessage({ type: 'runtime/ready' })
      } catch (err) {
        update({ Component: null, loadError: String(err?.message ?? err) })
        store.reportError(err)
      }
    },
  }

  return store
}

let activeRoot = null
let activeStore = null

window.__DSH_CANVAS_RUNTIME__ = {
  init(port, initialTheme, initialState, initialData) {
    activeStore = createBridgeStore(port)
    activeStore.setTheme(initialTheme)
    activeStore.replaceState(initialState)
    if (initialData) activeStore.replaceData(initialData)
    let container = document.getElementById('dsh-canvas-root')
    if (!container) {
      container = document.createElement('div')
      container.id = 'dsh-canvas-root'
      document.body.append(container)
    }
    if (!activeRoot) activeRoot = createRoot(container)
    activeRoot.render(<CanvasShell store={activeStore} />)
  },
  setTheme(raw) {
    activeStore?.setTheme(raw)
  },
  replaceState(nextState) {
    activeStore?.replaceState(nextState)
  },
  replaceData(nextData) {
    activeStore?.replaceData(nextData)
  },
  mountCanvas(factory, revisionKey) {
    activeStore?.mountFactory(factory, revisionKey)
  },
  reportError(message) {
    activeStore?.reportError(new Error(message))
  },
}
