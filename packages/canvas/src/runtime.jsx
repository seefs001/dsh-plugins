import React from 'react'
import { createRoot } from 'react-dom/client'
import { ActionContext, StateContext, ThemeContext, useCanvasAction, useCanvasState, useHostTheme } from './context.js'
import { BarChart, LineChart, PieChart, UsageBar } from './charts.jsx'
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
  mergeStyle,
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
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.categories.red.fg, marginBottom: 6 }}>
            Canvas runtime error
          </div>
          <pre style={{ margin: 0, fontSize: 12, fontFamily: theme.typography.mono, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: theme.text.secondary }}>
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function CanvasShell({ store }) {
  const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
  const theme = snapshot.theme
  const stateContext = React.useMemo(() => ({
    values: snapshot.state,
    setKey: store.setStateKey,
  }), [snapshot.state, store.setStateKey])

  React.useEffect(() => {
    document.documentElement.style.colorScheme = theme.kind
    document.body.style.background = theme.bg.editor
    document.body.style.color = theme.text.primary
    document.body.style.fontFamily = theme.typography.sans
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
        <ActionContext.Provider value={store.dispatchAction}>
          <div style={{ padding: '18px 20px 32px', minHeight: '100vh', boxSizing: 'border-box', background: theme.bg.editor, color: theme.text.primary }}>
            <CanvasErrorBoundary key={snapshot.revisionKey} theme={theme} onError={store.reportError}>
              <Component />
            </CanvasErrorBoundary>
          </div>
        </ActionContext.Provider>
      </StateContext.Provider>
    </ThemeContext.Provider>
  )
}

function createBridgeStore(port) {
  let snap = {
    theme: resolveTheme(null),
    state: {},
    Component: null,
    revisionKey: 0,
    loadError: '',
  }
  const listeners = new Set()
  const notify = () => { for (const fn of listeners) fn() }
  const update = patch => { snap = { ...snap, ...patch }; notify() }

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
        if (id === 'react') return React
        throw new Error(`Canvas import "${id}" is forbidden. Import only from "dsh/canvas".`)
      }
      try {
        factory(canvasRequire, moduleObj, moduleObj.exports, React)
        const Component = moduleObj.exports?.default ?? moduleObj.exports
        if (typeof Component !== 'function') {
          throw new Error('Canvas module must default-export a React component function.')
        }
        update({ Component, revisionKey, loadError: '' })
        port.postMessage({ type: 'runtime/ready', revisionKey })
      } catch (error) {
        const message = String(error?.message ?? error)
        update({ Component: null, revisionKey, loadError: message })
        store.reportError(error)
      }
    },
  }
  return store
}

let activeStore = null
let activeRoot = null

window.__DSH_CANVAS_RUNTIME__ = {
  init(port, initialTheme, initialState) {
    activeStore = createBridgeStore(port)
    activeStore.setTheme(initialTheme)
    activeStore.replaceState(initialState)
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
  mountCanvas(factory, revisionKey) {
    activeStore?.mountFactory(factory, revisionKey)
  },
  reportError(message) {
    activeStore?.reportError(new Error(message))
  },
}
