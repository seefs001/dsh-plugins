import React from 'react'
import { canvasTokens } from './tokens.js'

export const ThemeContext = React.createContext(canvasTokens)
export const StateContext = React.createContext({
  values: {},
  setKey() {},
})
export const ActionContext = React.createContext(() => {})

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
