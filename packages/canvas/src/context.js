import React from 'react'
import { canvasTokens } from './tokens.js'

export const ThemeContext = React.createContext(canvasTokens)
export const StateContext = React.createContext({
  values: {},
  setKey() {},
})
export const ActionContext = React.createContext(() => {})
export const DataContext = React.createContext({
  files: {},
  globs: {},
  host: {},
  subscribeFile() { return () => {} },
  subscribeGlob() { return () => {} },
  subscribeHost() { return () => {} },
  refresh() {},
})

export function useHostTheme() {
  return React.useContext(ThemeContext)
}

export function useCanvasState(key, defaultValue) {
  const ctx = React.useContext(StateContext)
  const hasStored = Object.prototype.hasOwnProperty.call(ctx.values, key)
  const value = hasStored ? ctx.values[key] : defaultValue
  const latestRef = React.useRef(value)
  latestRef.current = value
  const setValue = React.useCallback(action => {
    const next = typeof action === 'function' ? action(latestRef.current) : action
    ctx.setKey(key, next)
  }, [ctx, key])
  return [value, setValue]
}

export function useCanvasAction() {
  return React.useContext(ActionContext)
}

export function useCanvasFile(uri, options = {}) {
  const ctx = React.useContext(DataContext)
  const parse = options?.parse ?? 'auto'
  const key = `${uri}::${parse}`
  React.useEffect(() => {
    if (!uri) return undefined
    return ctx.subscribeFile(key, { uri, parse })
  }, [ctx, key, uri, parse])
  const entry = ctx.files[key]
  return React.useMemo(() => ({
    loading: !entry,
    exists: Boolean(entry?.exists),
    data: entry?.data ?? null,
    content: entry?.content ?? '',
    frontmatter: entry?.frontmatter ?? null,
    path: entry?.path ?? '',
    relativePath: entry?.relativePath ?? '',
    mtimeMs: entry?.mtimeMs ?? 0,
    error: entry?.error ?? '',
    refresh: () => ctx.refresh(),
  }), [entry, ctx])
}

export function useCanvasGlob(pattern, options = {}) {
  const ctx = React.useContext(DataContext)
  const parse = options?.parse ?? (options?.frontmatter ? 'markdown' : 'auto')
  const limit = Number(options?.limit) || 100
  const key = `${pattern}::${parse}::${limit}`
  React.useEffect(() => {
    if (!pattern) return undefined
    return ctx.subscribeGlob(key, { pattern, parse, limit })
  }, [ctx, key, pattern, parse, limit])
  const entry = ctx.globs[key]
  return React.useMemo(() => ({
    loading: !entry,
    files: Array.isArray(entry?.files) ? entry.files : [],
    error: entry?.error ?? '',
    refresh: () => ctx.refresh(),
  }), [entry, ctx])
}

export function useHostData(source, params = {}) {
  const ctx = React.useContext(DataContext)
  const paramsJson = JSON.stringify(params ?? {})
  const key = `${source}::${paramsJson}`
  React.useEffect(() => {
    if (!source) return undefined
    return ctx.subscribeHost(key, { source, params: JSON.parse(paramsJson) })
  }, [ctx, key, source, paramsJson])
  const entry = ctx.host[key]
  return React.useMemo(() => ({
    loading: !entry,
    data: entry?.data ?? null,
    error: entry?.error ?? '',
    refresh: () => ctx.refresh(),
  }), [entry, ctx])
}
