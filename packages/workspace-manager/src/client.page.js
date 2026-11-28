window.__ModuleLoader__.load({
  id: 'dsh-workspace-manager',
  chunk: 'client.page.js',
  factory(require) {
    const React = require('react')
    const {
      Button, Checkbox, Input, Modal, PathLabel, StateDot, Tag,
      IconCopyOutlineRegular, IconRefreshOutlineRegular, IconSearchOutlineRegular,
      IconTrashOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement

    const isInvalid = status => status === 'missing' || status === 'not-directory'
    const STATUS_ORDER = { missing: 0, 'not-directory': 1, unavailable: 2, unchecked: 3, directory: 4 }
    const STATUS_DOT = { directory: 'done', missing: 'error', 'not-directory': 'error', unavailable: 'warning', unchecked: 'idle' }
    const STATUS_TAG = { directory: 'success', missing: 'danger', 'not-directory': 'danger', unavailable: 'warning', unchecked: 'outline' }

    const CSS = `
.wm-page{container-type:inline-size;height:100%;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.wm-page *,.wm-page *::before,.wm-page *::after{box-sizing:border-box}
.wm-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.wm-inner{display:flex;flex-direction:column;gap:18px;width:100%;max-width:calc(960px + 2 * clamp(24px,4vw,48px));margin:0 auto;padding:28px clamp(24px,4vw,48px) 48px}
[data-platform=darwin] .wm-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.wm-inner{padding:20px 20px 48px}[data-platform=darwin] .wm-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.wm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.wm-head-copy{display:flex;flex-direction:column;gap:4px;flex:1 1 280px;min-width:0}
.wm-title{margin:0;font-size:20px;line-height:28px;font-weight:500}
.wm-note{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.wm-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:none}
.wm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
@container (max-width:680px){.wm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
.wm-stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,16px);background:var(--dsw-alias-card-fill);color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .15s,border-color .15s}
@media (hover:hover){.wm-stat:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wm-stat[aria-pressed=true]{background:var(--dsw-specific-sidebar-nav-item-active);border-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2))}
.wm-stat-top{display:flex;align-items:center;gap:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.wm-stat-val{font-size:20px;line-height:26px;font-weight:500;font-variant-numeric:tabular-nums}
.wm-stat[data-tone=danger] .wm-stat-val{color:var(--dsw-alias-state-error-primary)}
.wm-stat[data-tone=warning] .wm-stat-val{color:var(--dsw-alias-state-warn-primary)}
.wm-banner{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l1);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.wm-banner>svg{flex:none}
.wm-banner-text{flex:1;min-width:0;overflow-wrap:anywhere}
.wm-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,transparent);background:var(--dsw-alias-interactive-bg-hover-danger)}
.wm-banner[data-tone=warn]{border-color:var(--dsw-alias-state-warn-secondary);background:var(--dsw-alias-state-warn-tertiary)}
.wm-banner[data-tone=warn]>svg{color:var(--dsw-alias-state-warn-primary)}
.wm-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wm-search{flex:1 1 240px;min-width:0}
.wm-select{height:32px;padding:0 26px 0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-module-platform) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 8px center/12px 12px;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;appearance:none}
.wm-batch{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-state-warn-tertiary);border:.5px solid var(--dsw-alias-state-warn-secondary);font-size:12px}
.wm-batch-count{flex:1 1 auto;font-weight:500}
.wm-list{display:flex;flex-direction:column;list-style:none;margin:0;padding:0;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-alias-card-fill);overflow:hidden}
.wm-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-top:.5px solid var(--dsw-alias-border-l1);transition:background-color .12s}
.wm-row:first-child{border-top:0}
@media (hover:hover){.wm-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wm-row[data-selected=true]{background:var(--dsw-specific-sidebar-nav-item-active)}
.wm-check{flex:none}
.wm-details{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}
.wm-row-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.wm-name{font-size:13.5px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
.wm-tag-inner{display:inline-flex;align-items:center;gap:5px}
.wm-path-row{display:flex;align-items:center;gap:6px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.wm-path{flex:0 1 auto;min-width:0;max-width:100%}
.wm-row-actions{display:flex;align-items:center;gap:4px;flex:none}
.wm-danger-text{color:var(--dsw-alias-state-error-primary)}
.wm-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}
.wm-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 20px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:14px}
.wm-empty p{margin:0}
.wm-confirm{display:flex;flex-direction:column;gap:10px}
.wm-confirm p{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.wm-confirm-paths{margin:0;padding:8px 10px;list-style:none;max-height:36vh;overflow:auto;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-markdown-code-block);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}
.wm-confirm-paths li+li{margin-top:4px;padding-top:4px;border-top:.5px solid var(--dsw-alias-border-l1)}
.wm-confirm-paths li{overflow-wrap:anywhere}
.wm-toast{position:sticky;bottom:14px;align-self:center;padding:5px 12px;border-radius:999px;background:var(--dsw-alias-toast-bg,var(--dsw-alias-label-primary));color:var(--dsw-alias-toast-label,var(--dsw-alias-bg-base));font-size:12px;line-height:18px;box-shadow:var(--dsw-elevation-panel);pointer-events:none}
.wm-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
`

    function createWorkspacesPage({ ctx, t, tf, useSource, styleRef, openCleanupDialog, IconFolder }) {
      const controller = new AbortController()
      let closed = false
      let state = { checks: new Map(), busy: false, scanning: false, error: null, message: null, confirm: null }
      const ensurePageStyles = () => {
        if (styleRef.page || typeof document === 'undefined' || !document.head) return
        styleRef.page = document.createElement('style')
        styleRef.page.textContent = CSS
        document.head.append(styleRef.page)
      }
      const listeners = new Set()
      const store = {
        getSnapshot: () => state,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
      }
      const update = patch => {
        if (closed) return
        state = { ...state, ...patch }
        listeners.forEach(fn => fn())
      }
      let pendingResolve = null
      const askConfirm = payload => new Promise(resolve => {
        pendingResolve?.(false)
        pendingResolve = resolve
        update({ confirm: payload })
      })
      const finishConfirm = ok => {
        const resolve = pendingResolve
        pendingResolve = null
        update({ confirm: null })
        resolve?.(ok)
      }
      async function scan() {
        update({ scanning: true })
        try {
          const response = await fetch('workspace-manager/check', {
            headers: { accept: 'application/json' }, cache: 'no-store', signal: controller.signal,
          })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const body = await response.json()
          if (!Array.isArray(body?.checks)) throw new Error('Invalid directory check response')
          const checks = new Map(body.checks.map(row => [row.workspaceId, row]))
          update({ checks })
          return checks
        } finally {
          update({ scanning: false })
        }
      }

      async function run(action, payload) {
        if (closed || state.busy) return []
        update({ busy: true, error: null, message: null })
        const removedIds = []
        let skipped = 0
        const summary = message => skipped ? `${message} ${tf('skipped', { n: skipped })}` : message
        let stage = action === 'scan' || action === 'cleanup' ? 'scan' : 'remove'
        try {
          let candidates
          if (action === 'remove') {
            candidates = [payload]
          } else if (action === 'remove-selected') {
            candidates = payload
          } else {
            const checks = await scan()
            if (action === 'scan' || closed) return []
            candidates = ctx.workspaces.list.getSnapshot().items.filter(row => {
              const check = checks.get(row.workspaceId)
              if (check?.path !== row.path || check.status === 'unavailable') { skipped++; return false }
              return isInvalid(check.status)
            })
            if (candidates.length === 0) {
              update({ message: summary(t('noneInvalid')) })
              return []
            }
          }
          if (!candidates.length) return []
          stage = 'remove'
          const confirmPayload = action === 'remove'
            ? {
              title: t('confirmTitle'),
              body: tf('confirmOne', { title: candidates[0].title }),
              paths: [candidates[0].path],
              driveNote: false,
            }
            : action === 'remove-selected'
              ? {
                title: tf('confirmSelectedTitle', { n: candidates.length }),
                body: tf('confirmSelected', { n: candidates.length }),
                paths: candidates.map(row => row.path),
                driveNote: false,
              }
              : {
                title: tf('confirmManyTitle', { n: candidates.length }),
                body: tf('confirmMany', { n: candidates.length }),
                paths: candidates.map(row => row.path),
                driveNote: true,
              }
          if (!await askConfirm(confirmPayload)) return []
          for (const row of candidates) {
            if (closed) return removedIds
            const current = ctx.workspaces.list.getSnapshot().items.find(item => item.workspaceId === row.workspaceId)
            if (!current) continue
            if (current.path !== row.path) { skipped++; continue }
            await ctx.workspaces.delete(row.workspaceId)
            removedIds.push(row.workspaceId)
          }
          update({ message: summary(tf('removed', { n: removedIds.length })) })
          return removedIds
        } catch (error) {
          update({
            error: `${t(stage === 'scan' ? 'scanFailed' : 'removeFailed')}: ${error.message ?? String(error)}`,
            message: removedIds.length > 0 ? tf('removed', { n: removedIds.length }) : null,
          })
          return removedIds
        } finally {
          update({ busy: false })
        }
      }

      function WorkspacesPage() {
        useSource(ctx.locale)
        const useStyleEffect = React.useLayoutEffect ?? React.useEffect
        useStyleEffect(ensurePageStyles, [])
        const list = useSource(ctx.workspaces.list)
        const view = useSource(store)
        const [query, setQuery] = React.useState('')
        const [filter, setFilter] = React.useState('all')
        const [sortBy, setSortBy] = React.useState('status')
        const [selected, setSelected] = React.useState(() => new Set())
        const [toast, setToast] = React.useState('')

        React.useEffect(() => {
          void run('scan')
          return () => finishConfirm(false)
        }, [])

        React.useEffect(() => {
          if (!toast) return undefined
          const timer = setTimeout(() => setToast(''), 1500)
          return () => clearTimeout(timer)
        }, [toast])

        const validIds = React.useMemo(() => new Set(list.items.map(item => item.workspaceId)), [list.items])
        const selectedIds = React.useMemo(() => [...selected].filter(id => validIds.has(id)), [selected, validIds])

        const statusOf = row => {
          const check = view.checks.get(row.workspaceId)
          return check?.path === row.path ? check.status : 'unchecked'
        }

        const counts = React.useMemo(() => {
          let healthy = 0
          let invalidCount = 0
          let unavailable = 0
          for (const row of list.items) {
            const status = statusOf(row)
            if (status === 'directory') healthy++
            else if (isInvalid(status)) invalidCount++
            else if (status === 'unavailable') unavailable++
          }
          return { total: list.items.length, healthy, invalid: invalidCount, unavailable }
        }, [list.items, view.checks])

        const search = query.trim().toLocaleLowerCase()
        const rows = React.useMemo(() => {
          const filtered = list.items.filter(row => {
            const status = statusOf(row)
            if (filter === 'healthy' && status !== 'directory') return false
            if (filter === 'invalid' && !isInvalid(status)) return false
            if (filter === 'unavailable' && status !== 'unavailable') return false
            if (!search) return true
            return `${row.title}\n${row.path}`.toLocaleLowerCase().includes(search)
          })
          return filtered.toSorted((a, b) => {
            if (sortBy === 'sessions') return b.sessionIds.length - a.sessionIds.length || a.title.localeCompare(b.title)
            if (sortBy === 'name') return a.title.localeCompare(b.title) || a.path.localeCompare(b.path)
            const sa = STATUS_ORDER[statusOf(a)] ?? 9
            const sb = STATUS_ORDER[statusOf(b)] ?? 9
            return sa - sb || b.sessionIds.length - a.sessionIds.length || a.title.localeCompare(b.title)
          })
        }, [list.items, view.checks, filter, search, sortBy])

        const disabled = view.busy || list.phase !== 'ready' || list.state !== 'idle'
        const hasFilters = Boolean(search) || filter !== 'all'

        const [anchorId, setAnchorId] = React.useState(null)

        const toggleSelect = (id, checked, shiftKey = false) => {
          setSelected(prev => {
            const next = new Set(prev)
            if (shiftKey && anchorId !== null) {
              const order = rows.map(row => row.workspaceId)
              const from = order.indexOf(anchorId)
              const to = order.indexOf(id)
              if (from >= 0 && to >= 0) {
                const [lo, hi] = from <= to ? [from, to] : [to, from]
                for (let i = lo; i <= hi; i++) {
                  if (checked) next.add(order[i])
                  else next.delete(order[i])
                }
                return next
              }
            }
            if (checked) next.add(id)
            else next.delete(id)
            return next
          })
          setAnchorId(id)
        }

        React.useEffect(() => {
          if (selectedIds.length === 0) return undefined
          const onKey = e => {
            if (e.key === 'Escape') setSelected(new Set())
          }
          window.addEventListener('keydown', onKey)
          return () => window.removeEventListener('keydown', onKey)
        }, [selectedIds.length])

        const removeSelected = async () => {
          const targets = list.items.filter(item => selected.has(item.workspaceId))
          const removed = await run('remove-selected', targets)
          if (removed.length) {
            setSelected(prev => {
              const next = new Set(prev)
              for (const id of removed) next.delete(id)
              return next
            })
          }
        }

        const copyPath = async path => {
          try {
            await navigator.clipboard.writeText(path)
            setToast(t('copied'))
          } catch {}
        }

        const statCards = [
          { key: 'all', label: t('filterAll'), value: counts.total, dot: 'idle' },
          { key: 'healthy', label: t('filterHealthy'), value: counts.healthy, dot: 'done' },
          { key: 'invalid', label: t('filterInvalid'), value: counts.invalid, dot: 'error', tone: counts.invalid > 0 ? 'danger' : undefined },
          { key: 'unavailable', label: t('filterUnavailable'), value: counts.unavailable, dot: 'warning', tone: counts.unavailable > 0 ? 'warning' : undefined },
        ]

        return h('section', { className: 'wm-page', 'aria-label': t('panel') },
          h('div', { className: 'wm-inner' },
            h('header', { className: 'wm-head' },
              h('div', { className: 'wm-head-copy' },
                h('h1', { className: 'wm-title' }, t('panel')),
                h('p', { className: 'wm-note' }, t('description'))),
              h('div', { className: 'wm-head-actions' },
                h(Button, {
                  size: 'sm', variant: 'outline',
                  icon: h(IconTrashOutlineRegular, { size: 14 }),
                  disabled: view.busy,
                  onClick: () => void openCleanupDialog(),
                }, t('cleanupBtn')),
                h(Button, {
                  size: 'sm', variant: 'outline',
                  icon: view.scanning ? h(StateDot, { state: 'ongoing', size: 12 }) : h(IconRefreshOutlineRegular, { size: 14 }),
                  disabled: view.busy,
                  onClick: () => void run('scan'),
                }, view.scanning ? t('scanning') : t('scan')),
                counts.invalid > 0
                  ? h(Button, {
                    size: 'sm', variant: 'primary', className: 'wm-danger-fill',
                    icon: h(IconTrashOutlineRegular, { size: 14 }),
                    disabled,
                    onClick: () => void run('cleanup'),
                  }, tf('cleanup', { n: counts.invalid }))
                  : h(Button, {
                    size: 'sm', variant: 'ghost',
                    disabled: disabled || list.items.length === 0,
                    onClick: () => void run('cleanup'),
                  }, t('cleanupIdle')))),

            h('div', { className: 'wm-stats', role: 'group', 'aria-label': t('panel') },
              statCards.map(card => h('button', {
                key: card.key, type: 'button', className: 'wm-stat',
                'aria-pressed': filter === card.key,
                'data-tone': card.tone,
                onClick: () => setFilter(card.key),
              },
              h('span', { className: 'wm-stat-top' },
                h(StateDot, { state: card.dot, size: 7 }),
                card.label),
              h('span', { className: 'wm-stat-val' }, card.value)))),

            list.state === 'error'
              ? h('div', { className: 'wm-banner', 'data-tone': 'error', role: 'alert' },
                h(IconWarningTriangleOutlineRegular, { size: 14 }),
                h('span', { className: 'wm-banner-text' }, `${t('listFailed')}: ${list.error?.message ?? ''}`))
              : null,
            view.error
              ? h('div', { className: 'wm-banner', 'data-tone': 'error', role: 'alert' },
                h(IconWarningTriangleOutlineRegular, { size: 14 }),
                h('span', { className: 'wm-banner-text' }, view.error))
              : null,
            !view.error && counts.invalid > 0
              ? h('div', { className: 'wm-banner', 'data-tone': 'warn', role: 'status' },
                h(IconWarningTriangleOutlineRegular, { size: 14 }),
                h('span', { className: 'wm-banner-text' }, tf('invalidFound', { n: counts.invalid }), ' ', t('cleanupHint')))
              : null,
            view.message && !view.error
              ? h('div', { className: 'wm-banner', role: 'status', 'aria-live': 'polite' },
                h('span', { className: 'wm-banner-text' }, view.message))
              : null,

            h('div', { className: 'wm-toolbar' },
              h(Input, {
                type: 'search',
                className: 'wm-search',
                icon: h(IconSearchOutlineRegular, { size: 14 }),
                value: query,
                placeholder: t('search'),
                'aria-label': t('search'),
                onChange: event => setQuery(event.target.value),
              }),
              h('select', {
                className: 'wm-select',
                value: sortBy,
                'aria-label': t('sortLabel'),
                onChange: event => setSortBy(event.target.value),
              },
              h('option', { value: 'status' }, t('sortStatus')),
              h('option', { value: 'sessions' }, t('sortSessions')),
              h('option', { value: 'name' }, t('sortName'))),
              rows.length > 0
                ? h(Button, {
                  size: 'sm', variant: 'ghost', disabled,
                  onClick: () => setSelected(new Set(rows.map(r => r.workspaceId))),
                }, t('selectAll'))
                : null),

            selectedIds.length > 0
              ? h('div', { className: 'wm-batch', role: 'region', 'aria-live': 'polite' },
                h('span', { className: 'wm-batch-count' }, tf('selectedCount', { n: selectedIds.length })),
                h(Button, { size: 'sm', variant: 'ghost', disabled, onClick: () => setSelected(new Set()) }, t('clearSelection')),
                h(Button, {
                  size: 'sm', variant: 'primary', className: 'wm-danger-fill', disabled,
                  icon: h(IconTrashOutlineRegular, { size: 13 }),
                  onClick: () => void removeSelected(),
                }, tf('removeSelected', { n: selectedIds.length })))
              : null,

            list.phase !== 'ready' && list.state !== 'error'
              ? h('div', { className: 'wm-empty', role: 'status' },
                h(StateDot, { state: 'ongoing', size: 16 }),
                h('p', null, t('loading')))
              : rows.length === 0
                ? (list.state === 'error' ? null : h('div', { className: 'wm-empty' },
                  h(IconFolder, { size: 24 }),
                  h('p', null, hasFilters ? t('noMatches') : t('empty')),
                  !hasFilters ? h('p', { className: 'wm-note' }, t('emptyHint')) : null,
                  hasFilters ? h(Button, { size: 'sm', variant: 'outline', onClick: () => { setQuery(''); setFilter('all') } }, t('resetFilters')) : null))
                : h('ul', { className: 'wm-list' }, rows.map(row => {
                  const check = view.checks.get(row.workspaceId)
                  const status = check?.path === row.path ? check.status : 'unchecked'
                  const checked = selected.has(row.workspaceId)
                  const sessionCount = row.sessionIds.length
                  return h('li', {
                    key: row.workspaceId,
                    className: 'wm-row',
                    'data-selected': checked || undefined,
                    onClick: e => {
                      if (disabled || e.target?.closest?.('button,input,a,select,label')) return
                      if (e.shiftKey) {
                        e.preventDefault()
                        window.getSelection?.()?.removeAllRanges?.()
                        toggleSelect(row.workspaceId, !checked, true)
                      } else if (e.metaKey || e.ctrlKey) {
                        e.preventDefault()
                        toggleSelect(row.workspaceId, !checked, false)
                      }
                    },
                  },
                    h('span', {
                      onClick: e => {
                        if (!disabled && e.shiftKey) {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleSelect(row.workspaceId, !checked, true)
                        }
                      },
                    },
                    h(Checkbox, {
                      className: 'wm-check',
                      checked,
                      disabled,
                      label: h('span', { className: 'wm-sr-only' }, tf('selectRow', { title: row.title })),
                      title: tf('selectRow', { title: row.title }),
                      onChange: next => toggleSelect(row.workspaceId, next, false),
                    })),
                    h('div', { className: 'wm-details' },
                      h('div', { className: 'wm-row-top' },
                        h('span', { className: 'wm-name' }, row.title),
                        h(Tag, { tone: STATUS_TAG[status] ?? 'outline' },
                          h('span', { className: 'wm-tag-inner' },
                            h(StateDot, { state: view.scanning && status === 'unchecked' ? 'ongoing' : STATUS_DOT[status] ?? 'idle', size: 7 }),
                            t(status),
                            status === 'unavailable' && check?.code ? ` (${check.code})` : '')),
                        h(Tag, { tone: 'quiet' }, sessionCount === 1 ? t('sessionOne') : tf('sessions', { n: sessionCount }))),
                      h('div', { className: 'wm-path-row' },
                        h(PathLabel, { path: row.path, className: 'wm-path' }))),
                    h('div', { className: 'wm-row-actions' },
                      h(Button, {
                        size: 'sm', variant: 'ghost',
                        icon: h(IconCopyOutlineRegular, { size: 13 }),
                        title: t('copyPath'),
                        'aria-label': `${t('copyPath')}: ${row.path}`,
                        onClick: () => void copyPath(row.path),
                      }),
                      h(Button, {
                        size: 'sm', variant: 'ghost', className: 'wm-danger-text',
                        disabled,
                        'aria-label': `${t('remove')} ${row.title}`,
                        onClick: () => void run('remove', row),
                      }, t('remove'))))
                })),
            toast ? h('div', { className: 'wm-toast', role: 'status' }, toast) : null),
          view.confirm ? h(Modal, {
            open: true,
            onClose: () => finishConfirm(false),
            title: view.confirm.title,
            closeLabel: t('cancel'),
            footer: h(React.Fragment, null,
              h(Button, { variant: 'outline', 'data-modal-autofocus': true, onClick: () => finishConfirm(false) }, t('cancel')),
              h(Button, { variant: 'primary', className: 'wm-danger-fill', onClick: () => finishConfirm(true) }, t('remove'))),
          }, h('div', { className: 'wm-confirm' },
            h('p', null, view.confirm.body),
            view.confirm.driveNote ? h('p', null, t('confirmDriveNote')) : null,
            h('ul', { className: 'wm-confirm-paths' },
              view.confirm.paths.map(path => h('li', { key: path }, path))))) : null)
      }
      return {
        WorkspacesPage,
        dispose() {
          closed = true
          finishConfirm(false)
          controller.abort()
          listeners.clear()
        },
      }
    }

    return { createWorkspacesPage }
  },
})
