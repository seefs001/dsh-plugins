window.__ModuleLoader__.load({
  id: 'dsh-model-favorites',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
    const {
      DisclosureRow,
      StateDot,
      Tag,
      TextShimmer,
      IconCheckOutlineRegular,
      IconChevronDownOutlineRegular,
      IconChevronRightOutlineRegular,
      IconChevronUpOutlineRegular,
      IconInspectOutlineRegular,
      IconTrashOutlineRegular,
    } = primitives
    const h = React.createElement

    const NS = 'model-favorites'
    const PANE_KEY = 'favorites'
    const STATE_PATH = 'model-favorites/state'
    const OP_PATH = 'model-favorites/op'
    const CHANNEL_NAME = 'dsh-model-favorites'
    const FAV_PREFIX = 'fav:'
    const ROOT_QUICK_LIMIT = 5
    const WAKE_COOLDOWN_MS = 15_000
    const COMMAND_RETRY_MS = 500
    const COMMAND_MAX_RETRIES = 20

    const DICTS = {
      en: {
        favorites: 'Favorites',
        manage: 'Manage favorites',
        empty: 'No favorite models yet.',
        emptyHint: 'Click the star next to any model in the Model list, or star the current model above.',
        starAdd: 'Add {model} to favorites',
        starRemove: 'Remove {model} from favorites',
        starCurrent: 'Star current model',
        unstarCurrent: 'Unstar current model',
        moveUp: 'Move up',
        moveDown: 'Move down',
        remove: 'Remove',
        unavailable: 'Unavailable',
        count: '{count}',
        more: '+{count} more in Manage favorites',
        saveFailed: 'Could not update favorites: {message}',
        switchFailed: 'Could not switch model: {message}',
        sessionInUse: 'This session is currently in use by another DSH instance.',
        tvTitle: 'Favorite models',
        tvCount: '{count} starred',
        tvStopped: 'Stopped',
        tvInspect: 'Inspect',
        tvInput: 'IN',
        tvOutput: 'OUT',
      },
      zh: {
        favorites: '收藏模型',
        manage: '管理收藏',
        empty: '暂无收藏模型',
        emptyHint: '在「模型」列表中点击任意模型旁的星标，或点击上方按钮收藏当前模型。',
        starAdd: '收藏 {model}',
        starRemove: '取消收藏 {model}',
        starCurrent: '收藏当前模型',
        unstarCurrent: '取消收藏当前模型',
        moveUp: '上移',
        moveDown: '下移',
        remove: '移除',
        unavailable: '不可用',
        count: '{count}',
        more: '另有 {count} 个，点上方管理全部',
        saveFailed: '更新收藏失败：{message}',
        switchFailed: '切换模型失败：{message}',
        sessionInUse: '当前会话已被其他 DSH 实例占用。',
        tvTitle: '收藏模型',
        tvCount: '{count} 个收藏',
        tvStopped: '已中止',
        tvInspect: '查看',
        tvInput: '输入',
        tvOutput: '输出',
      },
    }

    const CSS = `
[data-model-menu] [role="menuitemradio"] [data-provider-id]{display:block;width:100%;min-width:0}
.mf-label-row{display:flex;align-items:center;gap:6px;width:100%;min-width:0}
.mf-label-text{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mf-badged{display:inline-flex;align-items:center;max-width:100%;gap:4px;vertical-align:baseline;white-space:nowrap}
.mf-badged-text{min-width:0;overflow:hidden;text-overflow:ellipsis}
.mf-badge{flex:none}
.mf-star{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-left:-3px;border:0;border-radius:var(--dsw-radius-xs,6px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:.28;transition:opacity .12s,color .12s,background-color .12s}
.mf-star[data-favorited="true"]{color:var(--dsw-alias-state-warn-primary);opacity:1}
[role="menuitemradio"]:hover .mf-star,[role="menuitemradio"][data-highlighted] .mf-star,[role="menuitemradio"]:focus-visible .mf-star{opacity:.85}
[role="menuitemradio"]:hover .mf-star[data-favorited="true"],[role="menuitemradio"][data-highlighted] .mf-star[data-favorited="true"],.mf-star:hover{opacity:1}
@media (hover:hover){.mf-star:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-warn-primary)}}
@media (hover:none){.mf-star{opacity:.5}}
.mf-group{padding-bottom:4px;margin-bottom:4px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.mf-group-title{display:flex;align-items:center;justify-content:space-between;padding:5px 7px 3px;font-size:11px;line-height:15px;font-weight:500;color:var(--dsw-alias-label-tertiary);user-select:none}
.mf-opt{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:100%;min-height:34px;padding:5px 7px;border:0;border-radius:var(--dsw-radius-md,8px);outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;line-height:18px;text-align:left;cursor:pointer}
.mf-opt:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.mf-opt:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.mf-opt:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.mf-opt-copy{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:6px}
.mf-opt-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mf-opt-provider{flex:0 1 auto;max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.mf-check{display:grid;place-items:center;flex:0 0 14px;color:var(--dsw-alias-label-primary)}
.mf-check svg{width:14px;height:14px}
.mf-divider{height:.5px;margin:4px 4px;background:var(--dsw-alias-border-l1)}
.mf-cell{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:100%;height:34px;padding:0 8px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;text-align:left;cursor:pointer;outline:none}
.mf-cell:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.mf-cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.mf-cell:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.mf-cell-label{flex:0 0 auto;white-space:nowrap}
.mf-cell-value{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;color:var(--dsw-alias-label-tertiary)}
.mf-cell-chev{flex:0 0 auto;display:inline-flex;color:var(--dsw-alias-label-tertiary)}
.mf-quick-star{flex:none;display:inline-flex;color:var(--dsw-alias-state-warn-primary)}
.mf-quick-more{padding:3px 8px 4px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary)}
.mf-pane{display:flex;flex-direction:column;gap:2px}
.mf-pane-top{padding-bottom:4px;margin-bottom:2px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.mf-pane-row{display:flex;align-items:center;gap:2px;border-radius:var(--dsw-radius-md,8px)}
@media (hover:hover){.mf-pane-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.mf-pane-pick{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:6px;min-height:32px;padding:4px 6px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;line-height:18px;text-align:left;cursor:pointer;outline:none}
.mf-pane-pick:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.mf-pane-pick:focus-visible{box-shadow:inset 0 0 0 1.5px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.mf-pane-meta{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.mf-pane-sub{font-size:11px;line-height:14px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mf-pane-actions{flex:none;display:inline-flex;align-items:center;gap:1px;padding-right:3px}
.mf-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-xs,6px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;outline:none}
.mf-icon-btn:disabled{opacity:.3;cursor:default}
.mf-icon-btn:focus-visible{box-shadow:0 0 0 1.5px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
@media (hover:hover){.mf-icon-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}}
.mf-icon-btn[data-star="true"]{color:var(--dsw-alias-state-warn-primary)}
.mf-empty{padding:10px 8px;display:flex;flex-direction:column;gap:4px;font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary)}
.mf-empty-title{color:var(--dsw-alias-label-secondary);font-weight:500}
.mf-error{padding:5px 7px;margin-bottom:4px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:15px}
.mf-tv-row{position:relative}
.mf-tv-head{display:flex;align-items:center;gap:6px;min-width:0;font-size:13px;line-height:20px}
.mf-tv-label{color:var(--dsw-alias-label-secondary);white-space:nowrap}
.mf-tv-dot{color:var(--dsw-alias-label-tertiary);flex:none}
.mf-tv-arg{color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.mf-tv-body{padding:4px 0 2px 4px;display:flex;flex-direction:column;gap:6px}
.mf-tv-io{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.mf-tv-card{padding:6px 8px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l2);min-width:0}
.mf-tv-cap{font-size:10px;line-height:14px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary);margin-bottom:3px}
.mf-tv-pre{margin:0;font-family:var(--dsw-font-mono,monospace);font-size:11px;line-height:15px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word;max-height:140px;overflow:auto}
.mf-tv-inspect{display:inline-flex;align-items:center;gap:4px;align-self:flex-start;height:24px;padding:0 8px;border-radius:var(--dsw-radius-xs,6px);border:.5px solid var(--dsw-alias-border-l3);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;opacity:0;transition:opacity .12s,background-color .12s}
.mf-tv-row:hover .mf-tv-inspect,.mf-tv-row:focus-within .mf-tv-inspect,.mf-tv-inspect:focus-visible{opacity:1}
@media (hover:hover){.mf-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
`

    const favoriteKey = (provider, model) => `${provider}\0${model}`

    function normalizeFavorites(raw) {
      if (!Array.isArray(raw)) return []
      const seen = new Set()
      const out = []
      for (const item of raw) {
        if (!item || typeof item !== 'object') continue
        const provider = typeof item.provider === 'string' ? item.provider.trim() : ''
        const model = typeof item.model === 'string' ? item.model.trim() : ''
        if (!provider || !model) continue
        const key = favoriteKey(provider, model)
        if (seen.has(key)) continue
        seen.add(key)
        out.push({ provider, model })
      }
      return out
    }

    function matchesQuery(entry, query) {
      const trimmed = typeof query === 'string' ? query.trim().toLowerCase() : ''
      if (!trimmed) return true
      const parts = trimmed.split(/\s+/).filter(Boolean)
      const hay = `${entry.model.name} ${entry.model.id} ${entry.provider.name} ${entry.provider.id} ${entry.model.description ?? ''}`.toLowerCase()
      return parts.every(part => {
        if (hay.includes(part)) return true
        let pos = 0
        for (const ch of part) {
          pos = hay.indexOf(ch, pos)
          if (pos < 0) return false
          pos += 1
        }
        return true
      })
    }

    function resolveFavorites(favorites, groups, accountProviderName) {
      const lookup = new Map()
      for (const group of Array.isArray(groups) ? groups : []) {
        const provider = {
          id: group.id,
          name: group.id === 'deepseek-account' && accountProviderName ? accountProviderName : group.name,
        }
        for (const model of Array.isArray(group.models) ? group.models : []) {
          lookup.set(favoriteKey(group.id, model.id), { provider, model })
        }
      }
      return favorites.map(fav => {
        const hit = lookup.get(favoriteKey(fav.provider, fav.model))
        if (hit) {
          return {
            provider: hit.provider,
            model: hit.model,
            available: true,
          }
        }
        return {
          provider: { id: fav.provider, name: fav.provider },
          model: { id: fav.model, name: fav.model },
          available: false,
        }
      })
    }

    function buildSelection(entry) {
      const defaultEffort = entry.model?.reasoning?.defaultEffort
      return {
        provider: entry.provider.id,
        model: entry.model.id,
        ...(defaultEffort === undefined ? {} : { reasoningEffort: defaultEffort }),
      }
    }

    function reorderCommandOptions(rows, favorites, groupLabel) {
      if (!Array.isArray(rows) || rows.length === 0 || !Array.isArray(favorites) || favorites.length === 0) return rows
      const byId = new Map()
      for (const row of rows) {
        if (typeof row?.id === 'string') byId.set(row.id, row)
      }
      const pinned = []
      for (const fav of favorites) {
        const row = byId.get(`${fav.provider}/${fav.model}`)
        if (!row) continue
        pinned.push({
          ...row,
          id: `${FAV_PREFIX}${row.id}`,
          group: { name: '__favorites__', label: groupLabel },
        })
      }
      if (pinned.length === 0) return rows
      return [...pinned, ...rows]
    }

    function createStore() {
      let state = {
        favorites: [],
        keys: new Set(),
        loaded: false,
        loading: false,
        saving: false,
        error: null,
        fetchedAt: 0,
      }
      const listeners = new Set()
      let inflightLoad = null
      let opTail = Promise.resolve()
      let channel = null

      const emit = () => {
        for (const fn of listeners) fn()
      }

      const setState = patch => {
        const nextFavorites = patch.favorites !== undefined ? normalizeFavorites(patch.favorites) : state.favorites
        const nextKeys = patch.favorites !== undefined
          ? new Set(nextFavorites.map(item => favoriteKey(item.provider, item.model)))
          : state.keys
        state = {
          ...state,
          ...patch,
          favorites: nextFavorites,
          keys: nextKeys,
        }
        emit()
      }

      const postSync = favorites => {
        if (!channel || typeof BroadcastChannel !== 'function') return
        try { BroadcastChannel.prototype.postMessage.call(channel, { type: 'sync', favorites }) } catch {}
      }

      const load = async (force = false) => {
        if (inflightLoad) return inflightLoad
        if (!force && state.loaded) return state.favorites
        setState({ loading: true, error: null })
        inflightLoad = fetch(STATE_PATH, { headers: { accept: 'application/json' } })
          .then(async res => {
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
            const favorites = normalizeFavorites(data.favorites)
            setState({ favorites, loaded: true, loading: false, error: null, fetchedAt: Date.now() })
            return favorites
          })
          .catch(error => {
            setState({ loading: false, error: error?.message ?? String(error) })
            return state.favorites
          })
          .finally(() => {
            inflightLoad = null
          })
        return inflightLoad
      }

      const ensureLoaded = () => {
        if (state.loaded) return Promise.resolve(state.favorites)
        return load(false)
      }

      const refreshIfStale = () => {
        if (typeof document !== 'undefined' && document.hidden) return
        if (!state.loaded) return
        if (Date.now() - state.fetchedAt < WAKE_COOLDOWN_MS) return
        void load(true)
      }

      const mutate = (op, optimisticFn) => {
        const task = opTail.then(async () => {
          const previous = state.favorites
          if (optimisticFn) {
            setState({ favorites: optimisticFn(previous), saving: true, error: null })
          } else {
            setState({ saving: true, error: null })
          }
          try {
            const res = await fetch(OP_PATH, {
              method: 'POST',
              headers: { 'content-type': 'application/json', accept: 'application/json' },
              body: JSON.stringify(op),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
            const favorites = normalizeFavorites(data.favorites)
            setState({ favorites, loaded: true, saving: false, error: null, fetchedAt: Date.now() })
            postSync(favorites)
            return { ok: true, favorites }
          } catch (error) {
            const message = error?.message ?? String(error)
            setState({ favorites: previous, saving: false, error: message })
            return { ok: false, error: message }
          }
        })
        opTail = task.catch(() => {})
        return task
      }

      const toggle = (provider, model) => mutate(
        { action: 'toggle', provider, model },
        prev => {
          const idx = prev.findIndex(item => item.provider === provider && item.model === model)
          return idx >= 0 ? prev.toSpliced(idx, 1) : [...prev, { provider, model }]
        },
      )

      const remove = (provider, model) => mutate(
        { action: 'remove', provider, model },
        prev => prev.filter(item => !(item.provider === provider && item.model === model)),
      )

      const move = (provider, model, direction) => mutate(
        { action: 'move', provider, model, direction },
        prev => {
          const idx = prev.findIndex(item => item.provider === provider && item.model === model)
          if (idx < 0) return prev
          const target = direction === 'up' ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1)
          if (target === idx) return prev
          const next = prev.slice()
          const [moved] = next.splice(idx, 1)
          next.splice(target, 0, moved)
          return next
        },
      )

      const attach = () => {
        const onMessage = event => {
          if (event?.data?.type === 'sync' && Array.isArray(event.data.favorites)) {
            setState({ favorites: event.data.favorites, loaded: true, error: null, fetchedAt: Date.now() })
          }
        }
        if (typeof BroadcastChannel === 'function') {
          channel = new BroadcastChannel(CHANNEL_NAME)
          channel.addEventListener('message', onMessage)
        }
        const onWake = () => refreshIfStale()
        if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
          window.addEventListener('focus', onWake)
        }
        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
          document.addEventListener('visibilitychange', onWake)
        }
        return () => {
          try { channel?.removeEventListener('message', onMessage) } catch {}
          try { channel?.close() } catch {}
          channel = null
          if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
            window.removeEventListener('focus', onWake)
          }
          if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
            document.removeEventListener('visibilitychange', onWake)
          }
        }
      }

      return {
        get: () => state,
        subscribe(fn) {
          listeners.add(fn)
          return () => listeners.delete(fn)
        },
        load,
        ensureLoaded,
        refreshIfStale,
        toggle,
        remove,
        move,
        attach,
      }
    }

    function StarIcon({ filled, size = 13 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        'aria-hidden': true,
      }, h('path', {
        d: 'M8 1.6l1.82 3.69 4.07.59-2.95 2.87.7 4.05L8 10.89 4.36 12.8l.7-4.05-2.95-2.87 4.07-.59L8 1.6z',
        fill: filled ? 'currentColor' : 'none',
        stroke: 'currentColor',
        strokeWidth: 1.3,
        strokeLinejoin: 'round',
      }))
    }

    function resolveBadgeText(ctx, text) {
      if (typeof ctx.locale?.resolveText === 'function') return ctx.locale.resolveText(text)
      if (typeof text === 'string') return text
      if (text && typeof text === 'object') return text.zh ?? text.en ?? Object.values(text)[0] ?? ''
      return ''
    }

    function renderBadgeName(ctx, model, placement) {
      if (!model?.badge) return model?.name ?? ''
      const badgeEl = Tag
        ? h(Tag, { className: 'mf-badge', tone: model.badge.tone }, resolveBadgeText(ctx, model.badge.text))
        : h('span', { className: 'mf-badge' }, resolveBadgeText(ctx, model.badge.text))
      return h('span', { className: 'mf-badged' },
        placement === 'trigger' ? h(React.Fragment, null, badgeEl, ' ') : null,
        h('span', { className: 'mf-badged-text' }, model.name),
        placement === 'trigger' ? null : h(React.Fragment, null, ' ', badgeEl))
    }

    function findNativeOptionButton(groupsEl, providerId, modelId) {
      if (!groupsEl || typeof groupsEl.querySelectorAll !== 'function') return null
      const buttons = groupsEl.querySelectorAll('button[role="menuitemradio"]')
      for (const btn of buttons) {
        if (btn.closest?.('[data-mf-favorites-host]')) continue
        const marker = btn.querySelector?.('[data-provider-id][data-model-id]')
        if (marker?.getAttribute?.('data-provider-id') === providerId
          && marker?.getAttribute?.('data-model-id') === modelId) {
          return btn
        }
      }
      return null
    }

    return {
      inject: ['slots', 'locale', 'modelDirectories'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', DICTS.en), 'model-favorites: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICTS.zh), 'model-favorites: zh')

        const t = ctx.locale.bind(NS)
        const modelT = ctx.locale.bind('model')
        const store = createStore()
        ctx.effect(() => store.attach(), 'model-favorites: sync')

        ctx.effect(() => {
          if (typeof document === 'undefined' || !document.head) return undefined
          const style = document.createElement('style')
          style.dataset.dshModelFavorites = ''
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, 'model-favorites: styles')

        const accountProviderName = () => {
          const translated = modelT('provider.account')
          return translated && translated !== 'provider.account' ? translated : ''
        }

        const useFavorites = () => React.useSyncExternalStore(store.subscribe, store.get)
        const useLocaleSnap = () => React.useSyncExternalStore(
          fn => ctx.locale.subscribe ? ctx.locale.subscribe(fn) : () => {},
          () => ctx.locale.getSnapshot ? ctx.locale.getSnapshot() : 'en',
        )

        const EMPTY_DIR = {
          store: {
            subscribe: () => () => {},
            getSnapshot: () => ({ current: null, groups: [], failures: [], status: 'idle', pending: null, error: null }),
          },
          select: async () => undefined,
        }

        const directoryFor = sessionId => {
          try { return ctx.modelDirectories.directoryFor(sessionId) } catch { return EMPTY_DIR }
        }

        const menuHosts = new WeakMap()
        let nextToken = 1

        function claimMenuHost(menuEl, groupsEl, onHostChange) {
          let entry = menuHosts.get(menuEl)
          const token = nextToken++
          if (!entry) {
            const host = document.createElement('div')
            host.setAttribute('data-mf-favorites-host', '')
            if (typeof groupsEl.prepend === 'function') groupsEl.prepend(host)
            else groupsEl.insertBefore(host, groupsEl.firstChild ?? null)
            entry = {
              host,
              groupsEl,
              owner: token,
              members: new Map(),
            }
            menuHosts.set(menuEl, entry)
          } else if (entry.host.parentNode !== groupsEl) {
            if (typeof groupsEl.prepend === 'function') groupsEl.prepend(entry.host)
            else groupsEl.insertBefore(entry.host, groupsEl.firstChild ?? null)
            entry.groupsEl = groupsEl
          }
          entry.members.set(token, onHostChange)
          if (entry.owner === token) onHostChange({ host: entry.host, menuEl, groupsEl })
          else onHostChange(null)

          return () => {
            const current = menuHosts.get(menuEl)
            if (!current) return
            current.members.delete(token)
            if (current.members.size === 0) {
              current.host.remove()
              menuHosts.delete(menuEl)
              return
            }
            if (current.owner === token) {
              const next = current.members.entries().next().value
              if (next) {
                current.owner = next[0]
                next[1]({ host: current.host, menuEl, groupsEl: current.groupsEl })
              }
            }
          }
        }

        function ModelListFavorites({ menuEl, groupsEl, directory }) {
          useLocaleSnap()
          const favState = useFavorites()
          const dir = React.useSyncExternalStore(
            fn => directory.store.subscribe(fn),
            () => directory.store.getSnapshot(),
          )
          const [query, setQuery] = React.useState(() => menuEl.querySelector?.('input[role="searchbox"]')?.value ?? '')

          React.useEffect(() => {
            const syncQuery = () => {
              const input = menuEl.querySelector?.('input[role="searchbox"]')
              setQuery(input?.value ?? '')
            }
            syncQuery()
            const onInput = event => {
              if (event?.target?.getAttribute?.('role') === 'searchbox') {
                setQuery(event.target.value ?? '')
              }
            }
            const onClick = () => {
              if (typeof requestAnimationFrame === 'function') requestAnimationFrame(syncQuery)
              else syncQuery()
            }
            menuEl.addEventListener?.('input', onInput, true)
            menuEl.addEventListener?.('click', onClick, true)
            return () => {
              menuEl.removeEventListener?.('input', onInput, true)
              menuEl.removeEventListener?.('click', onClick, true)
            }
          }, [menuEl])

          const accountName = accountProviderName()
          const resolved = React.useMemo(
            () => resolveFavorites(favState.favorites, dir.groups, accountName).filter(item => item.available),
            [favState.favorites, dir.groups, accountName],
          )
          const filtered = React.useMemo(
            () => resolved.filter(item => matchesQuery(item, query)),
            [resolved, query],
          )

          if (filtered.length === 0) return null
          const busy = dir.pending !== null

          const pick = entry => {
            const nativeBtn = findNativeOptionButton(groupsEl, entry.provider.id, entry.model.id)
            if (nativeBtn && !nativeBtn.disabled) {
              nativeBtn.click()
              return
            }
            if (dir.current?.provider === entry.provider.id && dir.current?.model === entry.model.id) return
            void directory.select(buildSelection(entry))
          }

          return h('div', { className: 'mf-group', role: 'group', 'aria-label': t('favorites') },
            h('div', { className: 'mf-group-title', role: 'presentation' },
              h('span', null, t('favorites')),
              h('span', null, String(filtered.length))),
            filtered.map(entry => {
              const selected = dir.current?.provider === entry.provider.id && dir.current?.model === entry.model.id
              const isPending = dir.pending?.provider === entry.provider.id && dir.pending?.model === entry.model.id
              return h('button', {
                key: favoriteKey(entry.provider.id, entry.model.id),
                type: 'button',
                role: 'menuitemradio',
                'aria-checked': selected,
                className: 'mf-opt',
                disabled: busy,
                title: `${entry.model.name} · ${entry.provider.name}`,
                onClick: () => pick(entry),
              },
              h('span', {
                role: 'button',
                tabIndex: -1,
                className: 'mf-star',
                'data-favorited': 'true',
                'aria-label': t('starRemove', { model: entry.model.name }),
                title: t('starRemove', { model: entry.model.name }),
                onMouseDown: event => { event.preventDefault(); event.stopPropagation() },
                onClick: event => {
                  event.preventDefault()
                  event.stopPropagation()
                  void store.toggle(entry.provider.id, entry.model.id)
                },
              }, h(StarIcon, { filled: true })),
              h('span', { className: 'mf-opt-copy' },
                h('span', { className: 'mf-opt-name' }, renderBadgeName(ctx, entry.model, 'option')),
                h('span', { className: 'mf-opt-provider' }, entry.provider.name)),
              h('span', { className: 'mf-check' },
                isPending
                  ? (StateDot ? h(StateDot, { state: 'ongoing' }) : '…')
                  : selected
                    ? (IconCheckOutlineRegular ? h(IconCheckOutlineRegular) : '✓')
                    : null))
            }))
        }

        function ModelLabel({ provider, model, placement, directory }) {
          useLocaleSnap()
          const favState = useFavorites()
          const spanRef = React.useRef(null)
          const [portalTarget, setPortalTarget] = React.useState(null)
          const isOption = placement === 'option'

          React.useEffect(() => {
            if (!isOption) return undefined
            void store.ensureLoaded()
            const node = spanRef.current
            const menuEl = node?.closest?.('[data-model-menu]')
            const groupsEl = menuEl?.querySelector?.('div[role="menu"]')
            if (!menuEl || !groupsEl) return undefined
            return claimMenuHost(menuEl, groupsEl, setPortalTarget)
          }, [isOption])

          if (!isOption) return renderBadgeName(ctx, model, placement)

          const favorited = favState.keys.has(favoriteKey(provider.id, model.id))
          const label = t(favorited ? 'starRemove' : 'starAdd', { model: model.name })

          return h(React.Fragment, null,
            h('span', { ref: spanRef, className: 'mf-label-row' },
              h('span', {
                role: 'button',
                tabIndex: -1,
                className: 'mf-star',
                'data-favorited': favorited ? 'true' : 'false',
                'aria-label': label,
                title: label,
                onMouseDown: event => { event.preventDefault(); event.stopPropagation() },
                onClick: event => {
                  event.preventDefault()
                  event.stopPropagation()
                  void store.toggle(provider.id, model.id)
                },
              }, h(StarIcon, { filled: favorited })),
              h('span', { className: 'mf-label-text' }, renderBadgeName(ctx, model, placement))),
            portalTarget && typeof ReactDOM?.createPortal === 'function'
              ? ReactDOM.createPortal(
                  h(ModelListFavorites, {
                    menuEl: portalTarget.menuEl,
                    groupsEl: portalTarget.groupsEl,
                    directory,
                  }),
                  portalTarget.host,
                )
              : null)
        }

        ctx.slots.inject('conversation.input.model.label', () => ctx.slots.register({
          name: 'conversation.input.model.label',
          id: 'model-favorites-label',
          locale: NS,
          inject: sessionId => ({ directory: directoryFor(sessionId) }),
        }, ModelLabel))

        function FavoritesMenuOptions({ locked, dismiss, reportFailure, openPane, directory }) {
          useLocaleSnap()
          const favState = useFavorites()
          const dir = React.useSyncExternalStore(
            fn => directory.store.subscribe(fn),
            () => directory.store.getSnapshot(),
          )
          const [switchingKey, setSwitchingKey] = React.useState(null)

          React.useEffect(() => {
            void store.ensureLoaded()
          }, [])

          const accountName = accountProviderName()
          const resolved = React.useMemo(
            () => resolveFavorites(favState.favorites, dir.groups, accountName),
            [favState.favorites, dir.groups, accountName],
          )
          const available = resolved.filter(item => item.available)
          const quick = available.slice(0, ROOT_QUICK_LIMIT)
          const overflow = available.length - quick.length
          const busy = locked || switchingKey !== null || dir.pending !== null

          const selectFavorite = async entry => {
            if (dir.current?.provider === entry.provider.id && dir.current?.model === entry.model.id) {
              dismiss()
              return
            }
            const key = favoriteKey(entry.provider.id, entry.model.id)
            setSwitchingKey(key)
            try {
              const result = await directory.select(buildSelection(entry))
              if (!result) return
              if (result.ok) {
                dismiss()
                return
              }
              const message = result.error?.code === 'session/writer-held'
                ? t('sessionInUse')
                : t('switchFailed', { message: `${result.error?.code ?? 'error'}: ${result.error?.message ?? ''}` })
              reportFailure(message)
            } catch (error) {
              reportFailure(t('switchFailed', { message: error?.message ?? String(error) }))
            } finally {
              setSwitchingKey(null)
            }
          }

          return h(React.Fragment, null,
            h('div', { className: 'mf-divider', role: 'separator' }),
            h('button', {
              type: 'button',
              role: 'menuitem',
              className: 'mf-cell',
              'data-model-menu-pane': PANE_KEY,
              onClick: () => openPane({ key: PANE_KEY, title: t('favorites') }),
            },
            h('span', { className: 'mf-cell-label' }, t('favorites')),
            h('span', { className: 'mf-cell-value' }, favState.favorites.length > 0 ? t('count', { count: favState.favorites.length }) : '0'),
            h('span', { className: 'mf-cell-chev' },
              IconChevronRightOutlineRegular ? h(IconChevronRightOutlineRegular, { size: 12 }) : '›')),
            quick.map(entry => {
              const key = favoriteKey(entry.provider.id, entry.model.id)
              const selected = dir.current?.provider === entry.provider.id && dir.current?.model === entry.model.id
              const pending = switchingKey === key
                || (dir.pending?.provider === entry.provider.id && dir.pending?.model === entry.model.id)
              return h('button', {
                key,
                type: 'button',
                role: 'menuitemradio',
                'aria-checked': selected,
                className: 'mf-opt',
                disabled: busy,
                title: `${entry.model.name} · ${entry.provider.name}`,
                onClick: () => { void selectFavorite(entry) },
              },
              h('span', { className: 'mf-quick-star', 'aria-hidden': true }, h(StarIcon, { filled: true, size: 12 })),
              h('span', { className: 'mf-opt-copy' },
                h('span', { className: 'mf-opt-name' }, entry.model.name)),
              h('span', { className: 'mf-check' },
                pending
                  ? (StateDot ? h(StateDot, { state: 'ongoing' }) : '…')
                  : selected
                    ? (IconCheckOutlineRegular ? h(IconCheckOutlineRegular) : '✓')
                    : null))
            }),
            overflow > 0
              ? h('div', { className: 'mf-quick-more' }, t('more', { count: overflow }))
              : null)
        }

        ctx.slots.inject('conversation.input.model.options', () => ctx.slots.register({
          name: 'conversation.input.model.options',
          id: 'model-favorites',
          order: 10,
          label: () => t('favorites'),
          locale: NS,
          inject: sessionId => ({ directory: directoryFor(sessionId) }),
        }, FavoritesMenuOptions))

        function FavoritesDetailPane({ locked, dismiss, reportFailure, directory }) {
          useLocaleSnap()
          const favState = useFavorites()
          const dir = React.useSyncExternalStore(
            fn => directory.store.subscribe(fn),
            () => directory.store.getSnapshot(),
          )
          const [switchingKey, setSwitchingKey] = React.useState(null)

          React.useEffect(() => {
            void store.ensureLoaded()
          }, [])

          const accountName = accountProviderName()
          const resolved = React.useMemo(
            () => resolveFavorites(favState.favorites, dir.groups, accountName),
            [favState.favorites, dir.groups, accountName],
          )
          const current = dir.current
          const currentFavorited = current ? favState.keys.has(favoriteKey(current.provider, current.model)) : false
          const busy = locked || switchingKey !== null || dir.pending !== null

          const toggleCurrent = async () => {
            if (!current) return
            const outcome = await store.toggle(current.provider, current.model)
            if (!outcome.ok) reportFailure(t('saveFailed', { message: outcome.error }))
          }

          const selectEntry = async entry => {
            if (!entry.available) return
            if (current?.provider === entry.provider.id && current?.model === entry.model.id) {
              dismiss()
              return
            }
            const key = favoriteKey(entry.provider.id, entry.model.id)
            setSwitchingKey(key)
            try {
              const result = await directory.select(buildSelection(entry))
              if (!result) return
              if (result.ok) {
                dismiss()
                return
              }
              const message = result.error?.code === 'session/writer-held'
                ? t('sessionInUse')
                : t('switchFailed', { message: `${result.error?.code ?? 'error'}: ${result.error?.message ?? ''}` })
              reportFailure(message)
            } catch (error) {
              reportFailure(t('switchFailed', { message: error?.message ?? String(error) }))
            } finally {
              setSwitchingKey(null)
            }
          }

          const moveEntry = async (entry, direction) => {
            const outcome = await store.move(entry.provider.id, entry.model.id, direction)
            if (!outcome.ok) reportFailure(t('saveFailed', { message: outcome.error }))
          }

          const removeEntry = async entry => {
            const outcome = await store.remove(entry.provider.id, entry.model.id)
            if (!outcome.ok) reportFailure(t('saveFailed', { message: outcome.error }))
          }

          return h('div', { className: 'mf-pane' },
            favState.error ? h('div', { className: 'mf-error', role: 'alert' }, t('saveFailed', { message: favState.error })) : null,
            current ? h('div', { className: 'mf-pane-top' },
              h('button', {
                type: 'button',
                className: 'mf-cell',
                autoFocus: true,
                disabled: favState.saving,
                onClick: () => { void toggleCurrent() },
              },
              h('span', { className: 'mf-quick-star', 'aria-hidden': true }, h(StarIcon, { filled: currentFavorited })),
              h('span', { className: 'mf-cell-label' }, t(currentFavorited ? 'unstarCurrent' : 'starCurrent')))) : null,
            resolved.length === 0
              ? h('div', { className: 'mf-empty' },
                  h('span', { className: 'mf-empty-title' }, t('empty')),
                  h('span', null, t('emptyHint')))
              : resolved.map((entry, index) => {
                  const key = favoriteKey(entry.provider.id, entry.model.id)
                  const selected = current?.provider === entry.provider.id && current?.model === entry.model.id
                  const pending = switchingKey === key
                    || (dir.pending?.provider === entry.provider.id && dir.pending?.model === entry.model.id)
                  return h('div', { key, className: 'mf-pane-row' },
                    h('button', {
                      type: 'button',
                      className: 'mf-pane-pick',
                      disabled: busy || !entry.available,
                      title: `${entry.model.name} · ${entry.provider.name}`,
                      onClick: () => { void selectEntry(entry) },
                    },
                    h('span', { className: 'mf-pane-meta' },
                      h('span', { className: 'mf-opt-name' }, entry.model.name),
                      h('span', { className: 'mf-pane-sub' },
                        entry.available ? entry.provider.name : `${entry.provider.name} · ${t('unavailable')}`)),
                    h('span', { className: 'mf-check' },
                      pending
                        ? (StateDot ? h(StateDot, { state: 'ongoing' }) : '…')
                        : selected
                          ? (IconCheckOutlineRegular ? h(IconCheckOutlineRegular) : '✓')
                          : null)),
                    h('div', { className: 'mf-pane-actions' },
                      h('button', {
                        type: 'button',
                        className: 'mf-icon-btn',
                        disabled: index === 0 || favState.saving,
                        'aria-label': t('moveUp'),
                        title: t('moveUp'),
                        onClick: () => { void moveEntry(entry, 'up') },
                      }, IconChevronUpOutlineRegular ? h(IconChevronUpOutlineRegular, { size: 12 }) : '↑'),
                      h('button', {
                        type: 'button',
                        className: 'mf-icon-btn',
                        disabled: index === resolved.length - 1 || favState.saving,
                        'aria-label': t('moveDown'),
                        title: t('moveDown'),
                        onClick: () => { void moveEntry(entry, 'down') },
                      }, IconChevronDownOutlineRegular ? h(IconChevronDownOutlineRegular, { size: 12 }) : '↓'),
                      h('button', {
                        type: 'button',
                        className: 'mf-icon-btn',
                        'data-star': entry.available ? 'true' : undefined,
                        disabled: favState.saving,
                        'aria-label': t('remove'),
                        title: t('remove'),
                        onClick: () => { void removeEntry(entry) },
                      }, entry.available
                        ? h(StarIcon, { filled: true, size: 12 })
                        : (IconTrashOutlineRegular ? h(IconTrashOutlineRegular, { size: 12 }) : '×'))))
                }))
        }

        ctx.slots.inject('conversation.input.model.pane', () => ctx.slots.register({
          name: 'conversation.input.model.pane',
          key: PANE_KEY,
          locale: NS,
          inject: sessionId => ({ directory: directoryFor(sessionId) }),
        }, FavoritesDetailPane))

        // external: DSH commandUi registers /model popupSelect asynchronously without a transform hook
        ctx.effect(() => {
          let patched = null
          const tryPatch = () => {
            if (patched) return true
            const cmdUi = ctx.get?.('commandUi')
            const contrib = cmdUi?.live?.contributions?.get?.('model')
            if (!contrib?.ui || contrib.ui.kind !== 'popupSelect') return false
            const originalOptions = contrib.ui.options
            const originalOnSelect = contrib.ui.onSelect
            contrib.ui.options = async session => {
              const [rows] = await Promise.all([
                originalOptions(session),
                store.ensureLoaded().catch(() => store.get().favorites),
              ])
              return reorderCommandOptions(rows, store.get().favorites, t('favorites'))
            }
            contrib.ui.onSelect = async (option, session) => {
              const normalized = typeof option?.id === 'string' && option.id.startsWith(FAV_PREFIX)
                ? { ...option, id: option.id.slice(FAV_PREFIX.length) }
                : option
              return originalOnSelect(normalized, session)
            }
            patched = { ui: contrib.ui, originalOptions, originalOnSelect }
            return true
          }
          let tries = 0
          const timer = tryPatch() ? null : setInterval(() => {
            if (tryPatch() || ++tries >= COMMAND_MAX_RETRIES) clearInterval(timer)
          }, COMMAND_RETRY_MS)
          return () => {
            if (timer) clearInterval(timer)
            if (patched) {
              patched.ui.options = patched.originalOptions
              patched.ui.onSelect = patched.originalOnSelect
              patched = null
            }
          }
        }, 'model-favorites: /model command order')

        function ModelFavoritesToolView({ call, result, state, inspect }) {
          useLocaleSnap()
          const [open, setOpen] = React.useState(false)
          const args = call?.arguments && typeof call.arguments === 'object' ? call.arguments : {}
          const action = typeof args.action === 'string' ? args.action : 'list'
          const target = args.provider && args.model ? `${args.provider}/${args.model}` : ''
          let parsed = null
          try {
            const text = Array.isArray(result?.content) ? result.content.map(c => c.text ?? '').join('') : ''
            if (text) parsed = JSON.parse(text)
          } catch {}
          const count = Array.isArray(parsed?.favorites) ? parsed.favorites.length : null
          const summary = [
            action,
            target,
            count !== null ? t('tvCount', { count }) : '',
          ].filter(Boolean).join(' · ')
          const running = state === 'running' || state === 'pending'
          const labelNode = running && TextShimmer ? h(TextShimmer, null, t('tvTitle')) : h('span', { className: 'mf-tv-label' }, t('tvTitle'))
          const header = h('span', { className: 'mf-tv-head' },
            labelNode,
            summary ? h('span', { className: 'mf-tv-dot', 'data-shimmer-decoration': '' }, '·') : null,
            summary ? h('span', { className: 'mf-tv-arg' }, summary) : null,
            state === 'stopped' ? h('span', { className: 'mf-tv-arg' }, t('tvStopped')) : null)

          const body = open ? h('div', { className: 'mf-tv-body' },
            h('div', { className: 'mf-tv-io' },
              h('div', { className: 'mf-tv-card' },
                h('div', { className: 'mf-tv-cap' }, t('tvInput')),
                h('pre', { className: 'mf-tv-pre' }, JSON.stringify(args, null, 2))),
              h('div', { className: 'mf-tv-card' },
                h('div', { className: 'mf-tv-cap' }, t('tvOutput')),
                h('pre', { className: 'mf-tv-pre' }, parsed ? JSON.stringify(parsed, null, 2) : ''))),
            inspect ? h('button', { type: 'button', className: 'mf-tv-inspect', onClick: inspect },
              IconInspectOutlineRegular ? h(IconInspectOutlineRegular, { size: 12 }) : null,
              t('tvInspect')) : null) : null

          if (DisclosureRow) {
            return h('div', { className: 'mf-tv-row' },
              h(DisclosureRow, { open, onToggle: () => setOpen(v => !v), label: header }, body))
          }
          return h('div', { className: 'mf-tv-row' },
            h('button', { type: 'button', onClick: () => setOpen(v => !v) }, header),
            body)
        }

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview',
          key: 'model_favorites',
          locale: NS,
        }, ModelFavoritesToolView))
      },
      _internal: {
        DICTS,
        favoriteKey,
        normalizeFavorites,
        matchesQuery,
        resolveFavorites,
        buildSelection,
        reorderCommandOptions,
        createStore,
      },
    }
  },
})
