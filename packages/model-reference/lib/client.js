window.__ModuleLoader__.load({
  id: 'dsh-model-reference',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'model-reference'
    const SOURCE = 'model-reference'
    const HASH_HOST_ID = 'model-reference'

    function hashMenuBus() {
      if (typeof window === 'undefined') return null
      if (!window.__DSH_HASH_MENU__) {
        const sources = new Map()
        const listeners = new Set()
        const hosts = new Set()
        let rev = 0
        const emit = () => { rev++; listeners.forEach(fn => fn()) }
        window.__DSH_HASH_MENU__ = {
          register(source) {
            sources.set(source.id, source)
            emit()
            return () => {
              if (sources.get(source.id) === source) {
                sources.delete(source.id)
                emit()
              }
            }
          },
          registerHost(hostId) {
            hosts.add(hostId)
            emit()
            return () => {
              hosts.delete(hostId)
              emit()
            }
          },
          isActiveHost(hostId) {
            return hosts.values().next().value === hostId
          },
          listSources() {
            return [...sources.values()].toSorted((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id))
          },
          subscribe(fn) {
            listeners.add(fn)
            return () => listeners.delete(fn)
          },
          getSnapshot() { return rev },
        }
      }
      return window.__DSH_HASH_MENU__
    }

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

    function parseRef(ref) {
      const q = ref.indexOf('?')
      const route = q < 0 ? ref : ref.slice(0, q)
      const params = new URLSearchParams(q < 0 ? '' : ref.slice(q + 1))
      const i = route.indexOf('/')
      const rawTier = params.get('tier')
      const tier = rawTier === 'priority' || rawTier === 'ultrafast' ? rawTier : undefined
      return { provider: route.slice(0, i), model: route.slice(i + 1), effort: params.get('effort') ?? undefined, tier, fast: tier !== undefined }
    }

    function serialize(ref) {
      const r = parseRef(ref)
      const parts = [`provider=${r.provider}`, `model=${r.model}`]
      if (r.effort) parts.push(`reasoning_effort=${r.effort}`)
      if (r.tier) parts.push(`service_tier=${r.tier}`)
      return `#model(${parts.join(', ')})`
    }

    const SENT = /#model\(provider=([^,\s()]+), model=([^()\r\n]+?)(?:, reasoning_effort=([^,\s()]+))?(?:, service_tier=(priority|ultrafast))?\)/gu
    const sentRule = {
      id: 'model',
      order: 30,
      match(text, from) {
        SENT.lastIndex = from
        const m = SENT.exec(text)
        if (!m) return undefined
        const data = { provider: m[1], model: m[2], fast: m[4] !== undefined }
        if (m[3] !== undefined) data.effort = m[3]
        return { id: 'model', start: m.index, end: m.index + m[0].length, data }
      },
    }

    function chipLabel(data, groups) {
      const group = groups?.find(g => g.id === data.provider)
      const baseModel = data.model.replace(/\[[^[\]]*\]$/u, '')
      const model = group?.models.find(m => m.id === data.model)
        ?? (baseModel !== data.model ? group?.models.find(m => m.id === baseModel) : undefined)
      const effortName = data.effort === undefined ? undefined : model?.reasoning?.efforts.find(e => e.id === data.effort)?.name ?? data.effort
      return `#${model?.name ?? data.model}${effortName ? ` · ${effortName}` : ''}${data.fast ? ' ⚡' : ''}`
    }

    const prefs = {
      state: { efforts: {}, tiers: {}, fastProviders: [] },
      listeners: new Set(),
      get: () => prefs.state,
      subscribe(fn) { prefs.listeners.add(fn); return () => prefs.listeners.delete(fn) },
      set(patch) { prefs.state = { ...prefs.state, ...patch }; prefs.listeners.forEach(fn => fn()) },
      async loadEfforts() {
        try {
          const r = await fetch('model-reference/state', { headers: { accept: 'application/json' } })
          if (r.ok) prefs.set({ efforts: (await r.json()).efforts ?? {} })
        } catch {}
        return prefs.state.efforts
      },
      refresh() {
        const json = path => fetch(path, { headers: { accept: 'application/json' } }).then(r => r.ok ? r.json() : null).catch(() => null)
        prefs.loadEfforts()
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
      const tier = p.fastProviders.includes(item.provider) ? p.tiers[key] : undefined
      const fast = tier === 'priority' || tier === 'ultrafast'
      const params = new URLSearchParams()
      if (effort !== undefined) params.set('effort', effort)
      if (fast) params.set('tier', tier)
      const qs = params.toString()
      return { ...item, effort, effortName, fast, ref: qs ? `${key}?${qs}` : key }
    }

    function restoreEffort(selection, state, efforts) {
      const current = state.current
      if (current?.provider === selection.provider && current.model === selection.model) return selection
      const model = state.groups.find(g => g.id === selection.provider)?.models.find(m => m.id === selection.model)
      const reasoning = model?.reasoning
      if (selection.reasoningEffort !== undefined && selection.reasoningEffort !== reasoning?.defaultEffort) return selection
      const effort = efforts[`${selection.provider}/${selection.model}`]
      if (!reasoning?.efforts.some(e => e.id === effort)) return selection
      return { ...selection, reasoningEffort: effort }
    }

    // external: DSH has no model-selection transform hook, so patch ModelDirectory.prototype.select
    function installEffortMemory(ModelDirectory) {
      const original = ModelDirectory.prototype.select
      async function select(selection) {
        const state = this.store.getSnapshot()
        const sameModel = state.current?.provider === selection.provider && state.current.model === selection.model
        const efforts = sameModel ? prefs.state.efforts : await prefs.loadEfforts()
        return original.call(this, restoreEffort(selection, state, efforts))
      }
      ModelDirectory.prototype.select = select
      return () => {
        if (ModelDirectory.prototype.select === select) ModelDirectory.prototype.select = original
      }
    }

    const Bolt = () => h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true },
      h('path', { d: 'M9.2 1.5 3.5 9h4l-.8 5.5L12.5 7h-4z', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }))

    const CSS = `
.mh-anchor{display:none}
.mh-menu{position:absolute;left:0;right:0;bottom:calc(100% + 4px);z-index:100;box-sizing:border-box;display:flex;flex-direction:column;max-height:min(320px,45dvh);overflow-y:auto;overscroll-behavior:contain;padding:4px;border-radius:12px;background:var(--dsw-specific-menu);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);backdrop-filter:var(--dsw-menu-backdrop-filter);box-shadow:var(--dsw-elevation-prominent);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1)}
@media (max-width:768px),(pointer:coarse){.mh-menu{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base));backdrop-filter:none;-webkit-backdrop-filter:none}}
.mh-title{padding:5px 8px 2px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary)}
.mh-title:not(:first-child){margin-top:4px;padding-top:7px;border-top:.5px solid var(--dsw-alias-border-l1)}
.mh-item{display:flex;align-items:center;gap:6px;width:100%;min-height:34px;padding:6px 8px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;text-align:left;cursor:pointer}
.mh-item[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover)}
.mh-hash{flex:none;width:18px;text-align:center;color:var(--dsw-alias-menu-icon)}
.mh-name{flex:none;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mh-meta{flex:none;display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.mh-bolt{display:inline-flex;color:var(--dsw-alias-state-warn-primary)}
.mh-desc{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;font-size:12px;color:var(--dsw-alias-label-tertiary)}
[data-composer-card] span[title^="#"]>span[aria-hidden="true"]{display:none}
`

    return {
      inject: ['slots', 'locale', 'modelDirectories', 'inputTriggers', 'sessions', 'uiConversation'],
      apply(ctx) {
        const { ModelDirectory } = require('@deepseek-ai/dsh-client-ui-model-selection')
        ctx.effect(() => installEffortMemory(ModelDirectory), 'model-reference: restore model efforts')
        ctx.effect(() => ctx.locale.register(NS, 'en', { title: 'Reference a model', aria: 'Models', fast: 'Fast' }), 'model-reference: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', { title: '引用模型', aria: '模型', fast: '快速' }), 'model-reference: zh')
        ctx.effect(() => {
          if (typeof document === 'undefined') return undefined
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'model-reference: styles')
        const t = ctx.locale.bind(NS)

        // external: DSH attaches reference codecs through inputTriggers.registerSource('@')
        ctx.effect(() => ctx.inputTriggers.registerSource({
          trigger: '@', name: SOURCE, showGroupTitle: false, order: 1000,
          candidates: async () => [],
          onPick: () => undefined,
          codec: { clipboardText: ref => { const r = parseRef(ref); return `#${r.provider}/${r.model}` }, serialize: ref => Promise.resolve(serialize(ref)) },
        }), 'model-reference: codec source')

        const { ReferenceChip } = require('@deepseek-ai/dsh-client-ui-primitives')
        ctx.uiConversation.userText.register(sentRule)
        function SentModelReference({ node, raw, directory }) {
          const groups = React.useSyncExternalStore(
            fn => directory ? directory.store.subscribe(fn) : () => {},
            () => directory ? directory.store.getSnapshot().groups : undefined)
          React.useEffect(() => {
            const s = directory?.store.getSnapshot()
            if (s && s.groups.length === 0 && s.status !== 'loading') directory.load().catch(() => {})
          }, [directory])
          return h(ReferenceChip, { label: chipLabel(node.data, groups), title: raw })
        }
        ctx.slots.inject('conversation.user.text.node', () => ctx.slots.register({
          name: 'conversation.user.text.node', key: 'model', priority: 100,
          inject: sessionId => {
            let directory = null
            try { directory = ctx.modelDirectories.directoryFor(sessionId) } catch {}
            return { directory }
          },
        }, SentModelReference))

        const directoryFor = sessionId => {
          try { return ctx.modelDirectories.directoryFor(sessionId) } catch { return null }
        }
        const bus = hashMenuBus()
        if (bus) {
          ctx.effect(() => bus.registerHost(HASH_HOST_ID), 'model-reference: hash menu host')
          ctx.effect(() => bus.register({
            id: 'models',
            order: 20,
            title: () => t('title'),
            onOpen(sessionId) {
              prefs.refresh()
              const directory = directoryFor(sessionId)
              const s = directory?.store.getSnapshot()
              if (s && s.groups.length === 0 && s.status !== 'loading') directory.load().catch(() => {})
            },
            subscribe(sessionId, listener) {
              const directory = directoryFor(sessionId)
              const offs = [
                prefs.subscribe(listener),
                ctx.locale.subscribe(listener),
                directory ? directory.store.subscribe(listener) : null,
              ].filter(Boolean)
              return () => { for (const off of offs) off() }
            },
            getItems(sessionId, query) {
              const dir = directoryFor(sessionId)?.store.getSnapshot()
              if (!dir) return []
              const p = prefs.get()
              return match(dir.groups, query).map(it => {
                const decorated = decorate(it, p, dir.current)
                return {
                  key: `model:${decorated.provider}/${decorated.model}`,
                  prefix: '#',
                  name: decorated.name,
                  meta: decorated.effortName,
                  fast: decorated.fast,
                  desc: decorated.providerName,
                  raw: decorated,
                }
              })
            },
            pick(item, { sessionId, span, inputActions }) {
              const ref = item.ref
              const label = `#${item.name}${item.effortName ? ` · ${item.effortName}` : ''}${item.fast ? ' ⚡' : ''}`
              const reference = { source: SOURCE, ref, label, clipboardText: `#${item.provider}/${item.model}` }
              const actx = ctx.sessions.scope(sessionId)
              const ok = actx?.bail(actx, 'slash/input-insert-reference', { reference, span }) === true
              if (!ok) inputActions.insertText(`${serialize(ref)} `, span)
            },
          }), 'model-reference: hash menu source')
        }

        function HashMenuBody({ sessionId, useInput, inputActions, bus: activeBus, busRev }) {
          const localeSnap = React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const listId = React.useId()
          const draftRev = useInput(s => s.draftRev)
          const phase = useInput(s => s.phase)
          const anchorRef = React.useRef(null)
          const [hit, setHit] = React.useState(null)
          const [index, setIndex] = React.useState(0)
          const [sourceTick, setSourceTick] = React.useState(0)
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
          const sources = React.useMemo(() => activeBus.listSources(), [activeBus, busRev])
          React.useEffect(() => {
            if (!open) return undefined
            const bump = () => setSourceTick(n => n + 1)
            const offs = sources.map(src => {
              src.onOpen?.(sessionId)
              return src.subscribe?.(sessionId, bump)
            }).filter(Boolean)
            return () => { for (const off of offs) off() }
          }, [open, sources, sessionId])

          const { sections, flat } = React.useMemo(() => {
            if (!open) return { sections: [], flat: [] }
            const nextSections = []
            const nextFlat = []
            for (const source of sources) {
              const items = source.getItems(sessionId, hit.query)
              if (!items.length) continue
              const mapped = items.map(item => {
                const entry = { source, item, flatIndex: nextFlat.length }
                nextFlat.push(entry)
                return entry
              })
              nextSections.push({ id: source.id, title: source.title(), items: mapped })
            }
            return { sections: nextSections, flat: nextFlat }
          }, [open, sources, sessionId, hit, sourceTick, localeSnap])

          React.useEffect(() => { setIndex(0) }, [hit?.query])
          const visible = open && flat.length > 0
          const activeIndex = visible ? Math.min(index, flat.length - 1) : 0

          const pick = React.useCallback(entry => {
            if (!hit || !entry) return
            const caret = inputActions.captureInsertion()
            const span = { start: caret.end - hit.length, end: caret.end, draftRev: caret.draftRev }
            entry.source.pick(entry.item.raw, { sessionId, span, inputActions })
            setHit(null)
          }, [hit, inputActions, sessionId])

          const dismiss = React.useCallback(() => {
            if (hit) dismissed.current = hit.query
            setHit(null)
          }, [hit])

          React.useEffect(() => {
            if (!visible) return undefined
            const onKey = ev => {
              if (ev.isComposing || ev.keyCode === 229) return
              const c = card()
              if (!c || !(ev.target instanceof Node) || !c.contains(ev.target)) return
              let handled = true
              if (ev.key === 'ArrowDown') setIndex(i => (i + 1) % flat.length)
              else if (ev.key === 'ArrowUp') setIndex(i => (i - 1 + flat.length) % flat.length)
              else if ((ev.key === 'Enter' || ev.key === 'Tab') && !ev.shiftKey) pick(flat[Math.min(index, flat.length - 1)])
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
          }, [visible, flat, index, pick, dismiss])

          React.useEffect(() => {
            if (visible) document.getElementById(`${listId}-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
          }, [visible, activeIndex, listId])

          return h(React.Fragment, null,
            h('span', { ref: anchorRef, className: 'mh-anchor' }),
            visible ? h('div', { className: 'mh-menu', role: 'listbox', 'aria-label': t('aria'), 'aria-activedescendant': `${listId}-opt-${activeIndex}` },
              sections.map(sec => h(React.Fragment, { key: sec.id },
                h('div', { className: 'mh-title', role: 'presentation' }, sec.title),
                sec.items.map(entry => {
                  const it = entry.item
                  const i = entry.flatIndex
                  return h('button', {
                    key: it.key, id: `${listId}-opt-${i}`, type: 'button', role: 'option',
                    className: 'mh-item', 'aria-selected': i === activeIndex,
                    onMouseDown: ev => { ev.preventDefault(); pick(entry) },
                    onMouseMove: i === activeIndex ? undefined : () => setIndex(i),
                  },
                  h('span', { className: 'mh-hash', 'aria-hidden': true }, it.prefix ?? '#'),
                  h('span', { className: 'mh-name' }, it.name),
                  it.meta || it.fast ? h('span', { className: 'mh-meta' },
                    it.meta ? h('span', null, it.meta) : null,
                    it.fast ? h('span', { className: 'mh-bolt', role: 'img', 'aria-label': t('fast') }, h(Bolt)) : null) : null,
                  it.desc ? h('span', { className: 'mh-desc' }, it.desc) : null)
                })))) : null)
        }

        function HashMenu(props) {
          const activeBus = hashMenuBus()
          const busRev = React.useSyncExternalStore(
            fn => activeBus ? activeBus.subscribe(fn) : () => {},
            () => activeBus ? activeBus.getSnapshot() : 0)
          if (!activeBus || !activeBus.isActiveHost(HASH_HOST_ID)) return null
          return h(HashMenuBody, { ...props, bus: activeBus, busRev })
        }

        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({
          name: 'conversation.input.overlay', id: 'model-reference', order: 1000,
          label: () => t('title'),
          inject: sessionId => ({ sessionId }),
        }, HashMenu))
      },
      _internal: { parseRef, serialize, sentRule, chipLabel, match, decorate, restoreEffort, installEffortMemory },
    }
  },
})
