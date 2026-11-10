/**
 * dsh-service-tier — browser half.
 *
 * A ⚡ toggle beside the model picker, shown only when the current model's
 * provider speaks the OpenAI Responses API.
 */
window.__ModuleLoader__.load({
  id: 'dsh-service-tier',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'service-tier'

    // One shared state per Client run: fast models and Responses providers.
    const store = {
      state: { tiers: {}, providers: [] },
      listeners: new Set(),
      get: () => store.state,
      subscribe(fn) { store.listeners.add(fn); return () => store.listeners.delete(fn) },
      set(patch) { store.state = { ...store.state, ...patch }; store.listeners.forEach(fn => fn()) },
      loading: null,
      load() {
        store.loading ??= fetch('service-tier/state', { headers: { accept: 'application/json' } })
          .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
          .then(d => store.set({ tiers: d.tiers ?? {}, providers: d.responsesProviders ?? [] }))
          .catch(() => { store.loading = null })
        return store.loading
      },
      async toggle(provider, model, fast) {
        const key = `${provider}/${model}`
        const prev = store.state.tiers
        const optimistic = { ...prev }
        if (fast) optimistic[key] = 'priority'
        else delete optimistic[key]
        store.set({ tiers: optimistic })
        try {
          const r = await fetch('service-tier/set', {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({ provider, model, fast }),
          })
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const d = await r.json()
          store.set({ tiers: d.tiers ?? optimistic })
        } catch {
          store.set({ tiers: prev })
        }
      },
    }
    const useTiers = () => React.useSyncExternalStore(store.subscribe, store.get)

    const CSS = `
.st-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.st-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.st-btn[aria-pressed=true]{color:var(--dsw-alias-state-warn-primary)}
`

    function Bolt({ on }) {
      return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true },
        h('path', {
          d: 'M9.2 1.5 3.5 9h4l-.8 5.5L12.5 7h-4z',
          fill: on ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round',
        }))
    }

    return {
      inject: ['slots', 'locale', 'modelDirectories'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', { label: 'Fast' }), 'service-tier: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', { label: '快速' }), 'service-tier: zh')
        const t = ctx.locale.bind(NS)

        function FastToggle({ directory }) {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const { tiers, providers } = useTiers()
          const dir = React.useSyncExternalStore(directory.subscribe.bind(directory), directory.getSnapshot.bind(directory))
          React.useEffect(() => { store.load() }, [])
          const current = dir?.current
          if (!current || !providers.includes(current.provider)) return null
          const on = tiers[`${current.provider}/${current.model}`] !== undefined
          return h(React.Fragment, null,
            h('style', null, CSS),
            h('button', {
              type: 'button', className: 'st-btn',
              'aria-pressed': on, 'aria-label': t('label'), title: t('label'),
              onClick: () => store.toggle(current.provider, current.model, !on),
            }, h(Bolt, { on })))
        }

        const EMPTY = { subscribe: () => () => {}, getSnapshot: () => null }
        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
          name: 'conversation.input.right', id: 'service-tier', order: 1000,
          label: () => t('label'),
          inject: sessionId => {
            try { return { directory: ctx.modelDirectories.directoryFor(sessionId).store } } catch { return { directory: EMPTY } }
          },
        }, FastToggle))
      },
    }
  },
})
