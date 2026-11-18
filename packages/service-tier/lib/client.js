/**
 * dsh-service-tier — browser half.
 *
 * A service tier control beside the model picker, shown only when the current model's
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
      state: { tiers: {}, providers: [], ultrafastModels: [], saving: false, failure: null },
      listeners: new Set(),
      get: () => store.state,
      subscribe(fn) { store.listeners.add(fn); return () => store.listeners.delete(fn) },
      set(patch) { store.state = { ...store.state, ...patch }; store.listeners.forEach(fn => fn()) },
      loading: null,
      load() {
        store.loading ??= fetch('service-tier/state', { headers: { accept: 'application/json' } })
          .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
          .then(d => store.set({ tiers: d.tiers ?? {}, providers: d.responsesProviders ?? [], ultrafastModels: d.ultrafastModels ?? [] }))
          .catch(() => { store.loading = null })
        return store.loading
      },
      async setTier(provider, model, tier) {
        if (store.state.saving) return
        store.set({ saving: true, failure: null })
        try {
          const r = await fetch('service-tier/set', {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({ provider, model, tier }),
          })
          const d = await r.json()
          if (!r.ok) throw new Error(d.message ?? `HTTP ${r.status}`)
          store.set({ tiers: d.tiers })
        } catch (error) {
          store.set({ failure: { provider, model, message: error.message } })
        } finally { store.set({ saving: false }) }
      },
    }
    const useTiers = () => React.useSyncExternalStore(store.subscribe, store.get)

    const CSS = `
.st-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background-color .15s,color .15s}
.st-btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
.st-btn:disabled{opacity:.6;cursor:wait}
.st-error{max-width:22em;font-size:12px;overflow-wrap:anywhere;color:var(--dsw-alias-state-error-primary)}
.st-btn:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:-2px}
.st-btn[data-active=true]{color:var(--dsw-alias-state-warn-primary)}
.st-pop{position:fixed;inset:auto;margin:0;box-sizing:border-box;width:min(156px,calc(100vw - 16px));padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent);font-size:13px;overflow:auto}
.st-option{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:30px;padding:4px 8px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.st-option[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active)}
.st-option:hover{background:var(--dsw-alias-interactive-bg-hover)}
.st-option:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:-2px}
`

    function Bolt({ on, double = false }) {
      const width = double ? 28 : 16
      const path = {
        d: 'M9.2 1.5 3.5 9h4l-.8 5.5L12.5 7h-4z',
        fill: on ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round',
      }
      return h('svg', { viewBox: `0 0 ${width} 16`, width, height: 16, 'aria-hidden': true },
        h('path', path), double ? h('path', { ...path, transform: 'translate(12 0)' }) : null)
    }

    const CHOICES = [[null, 'default'], ['priority', 'label'], ['ultrafast', 'ultrafast']]

    function TierPicker({ tier, saving, setTier, t }) {
      const button = React.useRef(null)
      const popup = React.useRef(null)
      const id = React.useId()
      const selected = t(tier === 'ultrafast' ? 'ultrafast' : tier === 'priority' ? 'label' : 'default')
      const label = `${t('speed')}: ${selected}`

      function position(event) {
        const panel = popup.current
        const anchor = event.currentTarget.getBoundingClientRect()
        const width = Math.min(156, window.innerWidth - 16)
        const above = anchor.top - 14
        const below = window.innerHeight - anchor.bottom - 14
        const openAbove = above >= 108 || above >= below
        // The native top layer avoids clipping by the docked composer.
        panel.style.left = `${Math.max(8, Math.min(anchor.right - width, window.innerWidth - width - 8))}px`
        panel.style.top = openAbove ? 'auto' : `${anchor.bottom + 6}px`
        panel.style.bottom = openAbove ? `${window.innerHeight - anchor.top + 6}px` : 'auto'
        panel.style.maxHeight = `${Math.max(0, openAbove ? above : below)}px`
      }

      return h(React.Fragment, null,
        h('button', {
          ref: button, type: 'button', className: 'st-btn', disabled: saving, 'aria-busy': saving,
          'data-active': tier !== undefined, 'aria-label': label, title: saving ? t('saving') : label,
          'aria-haspopup': 'dialog', popovertarget: id, onClick: position,
        }, h(Bolt, { on: tier !== undefined, double: tier === 'ultrafast' })),
        h('div', { ref: popup, id, className: 'st-pop', popover: 'auto', role: 'dialog', 'aria-label': t('speed') },
          CHOICES.map(([value, key]) => {
            const active = value === (tier ?? null)
            return h('button', {
              key, type: 'button', className: 'st-option', 'aria-pressed': active, disabled: saving,
              onClick: () => {
                popup.current.hidePopover()
                button.current.focus()
                if (!active) setTier(value)
              },
            }, t(key), active ? h('span', { 'aria-hidden': true }, '✓') : null)
          })))
    }

    return {
      inject: ['slots', 'locale', 'modelDirectories'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', { label: 'Fast', speed: 'Service tier', default: 'Default speed', ultrafast: 'Ultrafast', saving: 'Saving service tier…', failed: 'Could not save service tier: ' }), 'service-tier: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', { label: '快速', speed: '服务档位', default: '默认速度', ultrafast: '超快', saving: '正在保存服务档位…', failed: '服务档位保存失败：' }), 'service-tier: zh')
        const t = ctx.locale.bind(NS)

        function FastToggle({ directory }) {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const { tiers, providers, ultrafastModels, saving, failure } = useTiers()
          const dir = React.useSyncExternalStore(directory.subscribe.bind(directory), directory.getSnapshot.bind(directory))
          React.useEffect(() => { store.load() }, [])
          const current = dir?.current
          if (!current || !providers.includes(current.provider)) return null
          const route = `${current.provider}/${current.model}`
          const tier = tiers[route]
          const on = tier !== undefined
          const setTier = value => store.setTier(current.provider, current.model, value)
          return h(React.Fragment, null,
            h('style', null, CSS),
            ultrafastModels.includes(current.model)
              ? h(TierPicker, { key: route, tier, saving, setTier, t })
              : h('button', {
                  type: 'button', className: 'st-btn', disabled: saving, 'aria-busy': saving,
                  'data-active': on, 'aria-pressed': on, 'aria-label': t('label'), title: t(saving ? 'saving' : 'label'),
                  onClick: () => setTier(on ? null : 'priority'),
                }, h(Bolt, { on })),
            failure?.provider === current.provider && failure.model === current.model
              ? h('span', { role: 'alert', className: 'st-error' }, t('failed') + failure.message) : null)
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
