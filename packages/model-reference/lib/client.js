/**
 * dsh-model-reference — browser half.
 *
 * Type `#` in the composer to open a model picker. Picking inserts a chip
 * (`provider/model?effort=…&fast=1`) that serializes for the model as
 * `#model(provider=…, model=…, reasoning_effort=…, service_tier=priority)`.
 */
window.__ModuleLoader__.load({
  id: 'dsh-model-reference',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'model-reference'
    const SOURCE = 'model-reference'

    // ---- `#` model reference ------------------------------------------------

    // Read `#query` from the DOM text node under a collapsed caret inside the composer card.
    function detectHash(card) {
      const sel = window.getSelection()
      if (!card || !sel || sel.rangeCount === 0 || !sel.isCollapsed) return null
      const node = sel.anchorNode
      if (!node || node.nodeType !== 3 || !card.contains(node)) return null
      const m = /(^|\s)#([^\s#]*)$/u.exec((node.textContent ?? '').slice(0, sel.anchorOffset))
      return m ? { query: m[2], length: m[2].length + 1 } : null
    }

    function match(groups, query) {
      const parts = query.toLowerCase().split(/[\s/]+/).filter(Boolean)
      const out = []
      for (const g of groups) for (const m of g.models) {
        const hay = `${m.name} ${m.id} ${g.name} ${g.id}`.toLowerCase()
        if (parts.every(p => hay.includes(p))) out.push({ provider: g.id, providerName: g.name, model: m.id, name: m.name, reasoning: m.reasoning })
      }
      return out
    }

    // ref is `provider/model` plus optional `?effort=<id>&fast=1`.
    function parseRef(ref) {
      const q = ref.indexOf('?')
      const route = q < 0 ? ref : ref.slice(0, q)
      const params = new URLSearchParams(q < 0 ? '' : ref.slice(q + 1))
      const i = route.indexOf('/')
      return { provider: route.slice(0, i), model: route.slice(i + 1), effort: params.get('effort') ?? undefined, fast: params.get('fast') === '1' }
    }
    // What the model reads for one chip.
    function serialize(ref) {
      const r = parseRef(ref)
      const parts = [`provider=${r.provider}`, `model=${r.model}`]
      if (r.effort) parts.push(`reasoning_effort=${r.effort}`)
      if (r.fast) parts.push('service_tier=priority')
      return `#model(${parts.join(', ')})`
    }

    // Remembered per-model efforts (this plugin's Host) and, when dsh-service-tier
    // is installed, its fast models. A missing route simply leaves defaults.
    const prefs = {
      state: { efforts: {}, tiers: {}, fastProviders: [] },
      listeners: new Set(),
      get: () => prefs.state,
      subscribe(fn) { prefs.listeners.add(fn); return () => prefs.listeners.delete(fn) },
      set(patch) { prefs.state = { ...prefs.state, ...patch }; prefs.listeners.forEach(fn => fn()) },
      refresh() {
        const json = path => fetch(path, { headers: { accept: 'application/json' } }).then(r => r.ok ? r.json() : null).catch(() => null)
        json('model-reference/state').then(d => { if (d) prefs.set({ efforts: d.efforts ?? {} }) })
        json('service-tier/state').then(d => { if (d) prefs.set({ tiers: d.tiers ?? {}, fastProviders: d.responsesProviders ?? [] }) })
      },
    }

    function decorate(item, p, current) {
      const key = `${item.provider}/${item.model}`
      const efforts = item.reasoning?.efforts ?? []
      let effort = p.efforts[key]
      if (effort === undefined && current && current.provider === item.provider && current.model === item.model) effort = current.reasoningEffort
      if (effort === undefined) effort = item.reasoning?.defaultEffort
      if (effort !== undefined && efforts.length > 0 && !efforts.some(e => e.id === effort)) effort = item.reasoning?.defaultEffort
      const effortName = effort === undefined ? undefined : efforts.find(e => e.id === effort)?.name ?? effort
      const fast = p.fastProviders.includes(item.provider) && p.tiers[key] !== undefined
      const params = new URLSearchParams()
      if (effort !== undefined) params.set('effort', effort)
      if (fast) params.set('fast', '1')
      const qs = params.toString()
      return { ...item, effort, effortName, fast, ref: qs ? `${key}?${qs}` : key }
    }

    const CSS = `
.mh-anchor{display:none}
.mh-menu{position:absolute;left:0;right:0;bottom:calc(100% + 4px);z-index:100;box-sizing:border-box;display:flex;flex-direction:column;max-height:320px;overflow-y:auto;padding:4px;border-radius:12px;background:var(--dsw-specific-menu);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);backdrop-filter:var(--dsw-menu-backdrop-filter);box-shadow:var(--dsw-elevation-prominent);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1)}
.mh-title{padding:6px 8px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary)}
.mh-item{display:flex;align-items:center;gap:6px;width:100%;min-height:34px;padding:6px 8px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;text-align:left;cursor:pointer}
.mh-item[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover)}
.mh-hash{flex:none;width:14px;text-align:center;color:var(--dsw-alias-menu-icon)}
.mh-name{flex:none;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mh-meta{flex:none;display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.mh-bolt{color:var(--dsw-alias-state-warn-primary)}
.mh-desc{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;font-size:12px;color:var(--dsw-alias-label-tertiary)}
[data-composer-card] span[title^="#"]>span[aria-hidden="true"]{display:none}
`

    return {
      inject: ['slots', 'locale', 'modelDirectories', 'inputTriggers', 'sessions'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', { title: 'Reference a model', aria: 'Models' }), 'model-reference: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', { title: '引用模型', aria: '模型' }), 'model-reference: zh')
        const t = ctx.locale.bind(NS)

        // Serializer owner for `#` chips. It never offers @ candidates.
        ctx.effect(() => ctx.inputTriggers.registerSource({
          trigger: '@', name: SOURCE, showGroupTitle: false, order: 1000,
          candidates: async () => [],
          onPick: () => undefined,
          codec: { clipboardText: ref => { const r = parseRef(ref); return `#${r.provider}/${r.model}` }, serialize: ref => Promise.resolve(serialize(ref)) },
        }), 'model-reference: codec source')

        function HashMenu({ sessionId, directory, useInput, inputActions }) {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const draftRev = useInput(s => s.draftRev)
          const phase = useInput(s => s.phase)
          const dir = React.useSyncExternalStore(
            fn => directory ? directory.store.subscribe(fn) : () => {},
            () => directory ? directory.store.getSnapshot() : null)
          const anchorRef = React.useRef(null)
          const [hit, setHit] = React.useState(null)
          const [index, setIndex] = React.useState(0)
          const dismissed = React.useRef(null)

          const card = () => anchorRef.current?.closest('[data-composer-card]') ?? null
          const recompute = React.useCallback(() => {
            if (phase !== 'plain' && phase !== 'claimed') { setHit(null); return }
            const found = detectHash(card())
            if (!found) { dismissed.current = null; setHit(null); return }
            if (dismissed.current === found.query) { setHit(null); return }
            setHit(prev => prev && prev.query === found.query && prev.length === found.length ? prev : found)
          }, [phase])
          React.useEffect(() => { const id = requestAnimationFrame(recompute); return () => cancelAnimationFrame(id) }, [recompute, draftRev])
          React.useEffect(() => {
            document.addEventListener('selectionchange', recompute)
            return () => document.removeEventListener('selectionchange', recompute)
          }, [recompute])

          const open = hit !== null
          const p = React.useSyncExternalStore(prefs.subscribe, prefs.get)
          React.useEffect(() => {
            if (!open) return
            prefs.refresh()
            if (directory && dir && dir.groups.length === 0 && dir.status !== 'loading') directory.load().catch(() => {})
          }, [open])
          const items = React.useMemo(() => open && dir ? match(dir.groups, hit.query).map(it => decorate(it, p, dir.current)) : [], [open, dir, hit, p])
          React.useEffect(() => { setIndex(0) }, [hit?.query])
          const visible = open && items.length > 0

          const pick = React.useCallback(item => {
            if (!hit) return
            const caret = inputActions.captureInsertion()
            const span = { start: caret.end - hit.length, end: caret.end, draftRev: caret.draftRev }
            const ref = item.ref
            const label = `#${item.name}${item.effortName ? ` · ${item.effortName}` : ''}${item.fast ? ' ⚡' : ''}`
            const reference = { source: SOURCE, ref, label, clipboardText: `#${item.provider}/${item.model}` }
            const actx = ctx.sessions.scope(sessionId)
            const ok = actx?.bail(actx, 'slash/input-insert-reference', { reference, span }) === true
            if (!ok) inputActions.insertText(`#${ref} `, span)
            setHit(null)
          }, [hit, inputActions, sessionId])

          const dismiss = React.useCallback(() => {
            if (hit) dismissed.current = hit.query
            setHit(null)
          }, [hit])

          React.useEffect(() => {
            if (!visible) return
            const onKey = ev => {
              if (ev.isComposing || ev.keyCode === 229) return
              const c = card()
              if (!c || !(ev.target instanceof Node) || !c.contains(ev.target)) return
              let handled = true
              if (ev.key === 'ArrowDown') setIndex(i => (i + 1) % items.length)
              else if (ev.key === 'ArrowUp') setIndex(i => (i - 1 + items.length) % items.length)
              else if ((ev.key === 'Enter' || ev.key === 'Tab') && !ev.shiftKey) pick(items[Math.min(index, items.length - 1)])
              else if (ev.key === 'Escape') dismiss()
              else handled = false
              if (handled) { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation() }
            }
            const onDown = ev => {
              const c = card()
              if (!(ev.target instanceof Node) || c?.contains(ev.target)) return
              dismiss()
            }
            window.addEventListener('keydown', onKey, true)
            document.addEventListener('pointerdown', onDown, true)
            return () => {
              window.removeEventListener('keydown', onKey, true)
              document.removeEventListener('pointerdown', onDown, true)
            }
          }, [visible, items, index, pick, dismiss])

          React.useEffect(() => {
            if (visible) document.getElementById(`mh-opt-${index}`)?.scrollIntoView({ block: 'nearest' })
          }, [visible, index])

          return h(React.Fragment, null,
            h('style', null, CSS),
            h('span', { ref: anchorRef, className: 'mh-anchor' }),
            visible ? h('div', { className: 'mh-menu', role: 'listbox', 'aria-label': t('aria'), 'aria-activedescendant': `mh-opt-${index}` },
              h('div', { className: 'mh-title', role: 'presentation' }, t('title')),
              items.map((it, i) => h('button', {
                key: `${it.provider}/${it.model}`, id: `mh-opt-${i}`, type: 'button', role: 'option',
                className: 'mh-item', 'aria-selected': i === index,
                onMouseDown: ev => { ev.preventDefault(); pick(it) },
                onMouseMove: i === index ? undefined : () => setIndex(i),
              },
              h('span', { className: 'mh-hash', 'aria-hidden': true }, '#'),
              h('span', { className: 'mh-name' }, it.name),
              it.effortName || it.fast ? h('span', { className: 'mh-meta' },
                it.effortName ? h('span', null, it.effortName) : null,
                it.fast ? h('span', { className: 'mh-bolt', 'aria-label': 'fast' }, '⚡') : null) : null,
              h('span', { className: 'mh-desc' }, it.providerName)))) : null)
        }

        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({
          name: 'conversation.input.overlay', id: 'model-reference', order: 1000,
          label: () => t('title'),
          inject: sessionId => {
            let directory = null
            try { directory = ctx.modelDirectories.directoryFor(sessionId) } catch {}
            return { sessionId, directory }
          },
        }, HashMenu))
      },
      // Pure helpers, exposed for tests.
      _internal: { parseRef, serialize, match, decorate },
    }
  },
})
