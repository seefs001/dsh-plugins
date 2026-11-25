window.__ModuleLoader__.load({
  id: 'dsh-subagent-peek',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const {
      IconPanelLeftOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'subagent-peek'
    const SUBAGENT_CHAT_PREFIX = 'dsh-resource://subagentchat/session/'
    const FAIL_REASONS = new Set(['error', 'blocked', 'interrupted', 'max-tokens'])
    const ATTENTION_KINDS = new Set(['approval', 'plan-review', 'question'])

    const COPY = {
      en: {
        pillTitle: 'Subagents ({count})',
        pillRunning: '{n} working',
        pillAttention: '{n} need you',
        pillFailed: '{n} failed',
        menuHeader: 'Subagents',
        working: 'Working',
        approval: 'Approval',
        'plan-review': 'Plan',
        question: 'Input',
        failed: 'Failed',
        done: 'Done',
        external: 'External',
        openAside: 'Open in right sidebar',
        noEntries: 'No subagents.',
      },
      zh: {
        pillTitle: '子代理 ({count})',
        pillRunning: '{n} 个运行中',
        pillAttention: '{n} 个需要你',
        pillFailed: '{n} 个失败',
        menuHeader: '子代理树',
        working: '运行中',
        approval: '等待审批',
        'plan-review': '审阅计划',
        question: '等待回答',
        failed: '失败',
        done: '已完成',
        external: '外部任务',
        openAside: '在右侧栏打开',
        noEntries: '暂无子代理。',
      },
    }

    const CSS = `
.sp-pill{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 7px;border:0;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--dsw-alias-border-l3));border-radius:var(--dsw-radius-sm,6px);background:none;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-family,inherit);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums;cursor:pointer;flex:none}
.sp-pill:focus-visible{outline:none;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
@media (hover:hover){.sp-pill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.sp-pill[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.sp-pill[data-tone=warn]{box-shadow:inset 0 0 0 .5px color-mix(in srgb,var(--dsw-alias-state-warn-primary) 60%,transparent);color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 7%,transparent)}
.sp-pill[data-tone=error]{box-shadow:inset 0 0 0 .5px color-mix(in srgb,var(--dsw-alias-state-error-primary) 60%,transparent);color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 7%,transparent)}
.sp-dot-run{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));flex:none;animation:sp-pulse 1.4s ease-in-out infinite}
.sp-dot-warn{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-warn-primary);flex:none}
.sp-dot-err{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-error-primary);flex:none}
.sp-dot-done{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));flex:none}
.sp-dot-idle{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-border-l3);flex:none}
@keyframes sp-pulse{50%{opacity:.35}}
.sp-menu{position:fixed;z-index:9999;width:300px;max-width:calc(100vw - 16px);max-height:360px;overflow:auto;padding:4px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));box-shadow:var(--dsw-elevation-medium,0 10px 28px rgba(0,0,0,.2));display:flex;flex-direction:column;gap:2px}
.sp-menu-head{display:flex;align-items:center;justify-content:space-between;padding:5px 8px;font-size:11px;font-weight:500;color:var(--dsw-alias-label-tertiary);border-bottom:.5px solid var(--dsw-alias-border-l1);margin-bottom:2px}
.sp-row{display:flex;align-items:center;gap:6px;min-height:30px;padding:4px 6px;border-radius:var(--dsw-radius-sm,6px);color:var(--dsw-alias-label-primary);cursor:pointer;font-size:12px;line-height:16px}
.sp-row[data-disabled=true]{cursor:default;color:var(--dsw-alias-label-tertiary)}
@media (hover:hover){.sp-row:not([data-disabled=true]):hover{background:var(--dsw-alias-interactive-bg-hover)}}
.sp-row-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sp-row-meta{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.sp-row-meta[data-tone=warn]{color:var(--dsw-alias-state-warn-primary);font-weight:500}
.sp-row-meta[data-tone=error]{color:var(--dsw-alias-state-error-primary);font-weight:500}
.sp-row-aside{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:0;transition:opacity 100ms ease}
.sp-row:focus-within .sp-row-aside{opacity:1}
@media (hover:hover){.sp-row:hover .sp-row-aside{opacity:1}.sp-row-aside:hover{background:var(--dsw-alias-interactive-bg-hover-solid,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}}
@media (hover:none){.sp-row-aside{opacity:1}}
@media (prefers-reduced-motion:reduce){.sp-dot-run{animation:none}}
`

    const IconTree = ({ size = 13 }) => h('svg', {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    },
    h('circle', { key: 1, cx: 6, cy: 6, r: 2.5 }),
    h('circle', { key: 2, cx: 18, cy: 10, r: 2.5 }),
    h('circle', { key: 3, cx: 18, cy: 18, r: 2.5 }),
    h('path', { key: 4, d: 'M8.5 6h3a2 2 0 0 1 2 2v8a2 2 0 0 0 2 2M13.5 10h2' }))

    function formatElapsed(ms) {
      const sec = Math.max(0, Math.floor(ms / 1000))
      if (sec < 60) return `${sec}s`
      const min = Math.floor(sec / 60)
      if (min < 60) return `${min}m ${String(sec % 60).padStart(2, '0')}s`
      const hr = Math.floor(min / 60)
      return `${hr}h ${String(min % 60).padStart(2, '0')}m`
    }

    function formatAge(at, now) {
      if (!at) return ''
      const diff = Math.max(0, now - at)
      const min = Math.floor(diff / 60_000)
      if (min < 1) return '<1m'
      if (min < 60) return `${min}m`
      const hr = Math.floor(min / 60)
      if (hr < 24) return `${hr}h`
      return `${Math.floor(hr / 24)}d`
    }

    function catalogEntriesFor(parentId, list) {
      const proj = list?.projectionsBySession?.[parentId]?.values?.subagentCatalog
        ?? list?.byId?.[parentId]?.projectionValues?.subagentCatalog
      const seen = new Set()
      const entries = []
      if (Array.isArray(proj)) {
        for (const item of proj) {
          if (!item?.id || seen.has(item.id)) continue
          seen.add(item.id)
          entries.push(item)
        }
      }
      const extras = Object.values(list?.byId ?? {})
        .filter(row => row?.origin === 'subagent' && row.parentId === parentId && !seen.has(row.id))
        .toSorted((a, b) => (a.createdAt ?? a.updatedAt ?? 0) - (b.createdAt ?? b.updatedAt ?? 0))
      for (const row of extras) {
        seen.add(row.id)
        entries.push({ id: row.id, name: row.displayTitle || row.id, mode: 'continuable', createdAt: row.createdAt ?? row.updatedAt ?? 0 })
      }
      return entries
    }

    function pendingKindFor(status) {
      const live = status?.pendingInteraction
      if (!live || live.review !== undefined) return null
      if (ATTENTION_KINDS.has(live.kind)) {
        const intent = live.questions?.find(q => q.intent)?.intent?.kind
        if (intent === 'approval' || intent === 'plan-review') return intent
        return live.kind
      }
      return null
    }

    function buildDescendantTree(rootId, list, statuses, seenDoneAt, now = Date.now()) {
      const rows = []
      const visited = new Set([rootId])
      const walk = (parentId, depth) => {
        for (const entry of catalogEntriesFor(parentId, list)) {
          if (visited.has(entry.id)) continue
          visited.add(entry.id)
          const summary = list?.byId?.[entry.id]
          const status = statuses?.get?.(entry.id)
          const external = entry.mode === 'external'
          const running = !external && Boolean(status?.running ?? summary?.running)
          const attention = external ? null : pendingKindFor(status)
          const timing = summary?.projectionValues?.subagentTiming
          const outcome = list?.projectionsBySession?.[entry.id]?.values?.['session-lifecycle-outcome']
            ?? summary?.projectionValues?.['session-lifecycle-outcome']
          const failed = !external && !running && (
            timing?.lastTurnCompleted === false
            || (outcome && FAIL_REASONS.has(outcome.reason))
          )
          const done = !external && !running && !failed && (
            timing?.lastTurnCompleted === true
            || outcome?.reason === 'completed'
          )
          const finishedAt = Math.max(outcome?.time ?? 0, timing?.active?.through ?? 0, summary?.updatedAt ?? 0)
          const unseenDone = done && finishedAt > (seenDoneAt.get(entry.id) ?? 0)
          const since = timing?.active?.since ?? entry.createdAt ?? summary?.updatedAt ?? now
          const durationMs = running ? Math.max(0, now - since) : 0
          const name = summary?.displayTitle || entry.name || entry.id
          rows.push({
            id: entry.id,
            name,
            depth,
            mode: entry.mode ?? 'continuable',
            external,
            running,
            attention,
            failed,
            done,
            unseenDone,
            durationMs,
            idleAt: summary?.updatedAt ?? entry.createdAt ?? 0,
            finishedAt,
          })
          if (!external) walk(entry.id, depth + 1)
        }
      }
      walk(rootId, 0)
      return rows
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'uiWorkspace', 'uiSession.sessionStatus'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, COPY), `${NS}: dictionaries`)
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, `${NS}: styles`)

        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, () => String(v)), t(key))
        const seenDoneAt = new Map()
        const statusSource = ctx.uiSession.sessionStatus
        const useSource = source => React.useSyncExternalStore(fn => source.subscribe(fn), () => source.getSnapshot())

        function SubagentPeekControl({ sessionId }) {
          useSource(ctx.locale)
          const list = useSource(ctx.sessions.list)
          const statuses = useSource(statusSource)
          const [menuRect, setMenuRect] = React.useState(null)
          const [, bump] = React.useReducer(n => n + 1, 0)
          const btnRef = React.useRef(null)
          const menuRef = React.useRef(null)

          const now = Date.now()
          const rows = React.useMemo(
            () => buildDescendantTree(sessionId, list, statuses, seenDoneAt, now),
            [sessionId, list, statuses, menuRect !== null ? Math.floor(now / 1000) : 0],
          )

          const runningCount = rows.filter(r => r.running).length
          const attentionCount = rows.filter(r => Boolean(r.attention)).length
          const failedCount = rows.filter(r => r.failed).length
          const menuOpen = menuRect !== null

          React.useEffect(() => {
            if (!menuOpen || runningCount === 0) return undefined
            const timer = setInterval(bump, 1000)
            return () => clearInterval(timer)
          }, [menuOpen, runningCount])

          React.useEffect(() => {
            if (!menuOpen) return undefined
            const onDown = e => {
              if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return
              setMenuRect(null)
            }
            const onKey = e => { if (e.key === 'Escape') setMenuRect(null) }
            const onResize = () => setMenuRect(null)
            window.addEventListener('pointerdown', onDown, true)
            window.addEventListener('keydown', onKey)
            window.addEventListener('resize', onResize)
            return () => {
              window.removeEventListener('pointerdown', onDown, true)
              window.removeEventListener('keydown', onKey)
              window.removeEventListener('resize', onResize)
            }
          }, [menuOpen])

          if (rows.length === 0) return null

          const tone = attentionCount > 0 ? 'warn' : failedCount > 0 ? 'error' : undefined
          const summaryParts = [
            tf('pillTitle', { count: rows.length }),
            runningCount > 0 ? tf('pillRunning', { n: runningCount }) : '',
            attentionCount > 0 ? tf('pillAttention', { n: attentionCount }) : '',
            failedCount > 0 ? tf('pillFailed', { n: failedCount }) : '',
          ].filter(Boolean)
          const tooltip = summaryParts.join(' · ')
          const sidebarRight = ctx.get?.('sidebarRight')

          const toggle = () => {
            if (menuOpen) { setMenuRect(null); return }
            const rect = btnRef.current?.getBoundingClientRect()
            if (rect) {
              setMenuRect(rect)
              if (typeof ctx.sessions.refreshProjections === 'function') {
                void ctx.sessions.refreshProjections(sessionId).catch(() => {})
              }
            }
          }

          const openRow = (row, aside = false) => {
            if (row.external) return
            seenDoneAt.set(row.id, Math.max(Date.now(), row.finishedAt || 0))
            setMenuRect(null)
            if (aside && typeof sidebarRight?.openResource === 'function') {
              sidebarRight.openResource(`${SUBAGENT_CHAT_PREFIX}${encodeURIComponent(row.id)}`, {
                kind: 'subagentchat',
                preferNewPane: true,
              })
              return
            }
            ctx.uiWorkspace.openSession(row.id)
          }

          return h(React.Fragment, null,
            h('button', {
              ref: btnRef,
              type: 'button',
              className: 'sp-pill',
              'data-tone': tone,
              title: tooltip,
              'aria-label': tooltip,
              'aria-haspopup': 'menu',
              'aria-expanded': menuOpen,
              onClick: toggle,
            },
            runningCount > 0
              ? h('span', { className: 'sp-dot-run', 'aria-hidden': true })
              : h(IconTree, { size: 12 }),
            h('span', null, rows.length)),
            menuOpen && ReactDOM.createPortal(
              h('div', {
                ref: menuRef,
                className: 'sp-menu',
                role: 'menu',
                'aria-label': t('menuHeader'),
                style: {
                  top: `${Math.min(window.innerHeight - 280, Math.max(8, menuRect.bottom + 6))}px`,
                  left: `${Math.min(window.innerWidth - 312, Math.max(8, menuRect.left))}px`,
                },
              },
              h('div', { className: 'sp-menu-head' },
                h('span', null, t('menuHeader')),
                h('span', null, rows.length)),
              rows.map(row => {
                const dotClass = row.attention ? 'sp-dot-warn'
                  : row.failed ? 'sp-dot-err'
                    : row.running ? 'sp-dot-run'
                      : row.unseenDone ? 'sp-dot-done' : 'sp-dot-idle'
                const metaText = row.external ? t('external')
                  : row.attention ? t(row.attention)
                    : row.failed ? t('failed')
                      : row.running ? formatElapsed(row.durationMs)
                        : formatAge(row.idleAt, now)
                const metaTone = row.attention ? 'warn' : row.failed ? 'error' : undefined
                return h('div', {
                  key: row.id,
                  role: 'menuitem',
                  tabIndex: row.external ? -1 : 0,
                  className: 'sp-row',
                  'data-disabled': row.external || undefined,
                  style: { paddingLeft: `${8 + Math.min(row.depth, 4) * 14}px` },
                  onClick: () => openRow(row, false),
                  onKeyDown: e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); openRow(row, false) } },
                },
                h('span', { className: dotClass, 'aria-hidden': true }),
                h('span', { className: 'sp-row-name', title: row.name }, row.name),
                metaText && h('span', { className: 'sp-row-meta', 'data-tone': metaTone }, metaText),
                !row.external && typeof sidebarRight?.openResource === 'function' && h('button', {
                  type: 'button',
                  className: 'sp-row-aside',
                  title: t('openAside'),
                  'aria-label': `${t('openAside')}: ${row.name}`,
                  onClick: e => { e.preventDefault(); e.stopPropagation(); openRow(row, true) },
                }, h(IconPanelLeftOutlineRegular, { size: 13 })))
              })),
              document.body))
        }

        ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
          name: 'conversation.session.header.actions',
          id: NS,
          order: 20,
          locale: NS,
        }, SubagentPeekControl))
      },
      _internal: { COPY, buildDescendantTree, formatElapsed, formatAge },
    }
  },
})
