window.__ModuleLoader__.load({
  id: 'dsh-workspace-manager',
  factory(require) {
    const React = require('react')
    const {
      Button, Checkbox, Input, Modal, PathLabel, StateDot, Tag,
      IconCopyOutlineRegular, IconRefreshOutlineRegular, IconSearchOutlineRegular, IconTrashOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'workspace-manager'

    const EN = {
      panel: 'Workspace manager',
      description: 'Inspect saved workspace directories and remove stale records while keeping disk files and sessions intact.',
      scan: 'Check directories',
      scanning: 'Checking…',
      cleanup: 'Clean up invalid ({n})',
      cleanupIdle: 'Clean up invalid',
      cleanupHint: 'Disconnected external drives can appear missing. Verify paths before confirming removal.',
      search: 'Search workspace name or path…',
      empty: 'No saved workspaces yet.',
      emptyHint: 'Workspaces you open in DSH will appear here.',
      noMatches: 'No workspaces match the current filter.',
      resetFilters: 'Reset filters',
      loading: 'Loading workspaces…',
      remove: 'Remove',
      removeSelected: 'Remove selected ({n})',
      cancel: 'Cancel',
      confirmTitle: 'Remove workspace?',
      confirmManyTitle: 'Remove {n} invalid workspaces?',
      confirmSelectedTitle: 'Remove {n} selected workspaces?',
      confirmOne: 'Remove workspace “{title}”? Disk files and sessions are kept.',
      confirmMany: 'These {n} workspace records point to missing or non-directory paths. Disk files and sessions are kept.',
      confirmSelected: 'Remove these {n} selected workspace records? Disk files and sessions are kept.',
      confirmDriveNote: 'Disconnected external drives can also report as missing; double-check each path below.',
      filterAll: 'All',
      filterHealthy: 'Available',
      filterInvalid: 'Invalid',
      filterUnavailable: 'Unverified',
      sortLabel: 'Sort by',
      sortStatus: 'Status (issues first)',
      sortName: 'Name',
      sortSessions: 'Most sessions',
      selectAll: 'Select shown',
      clearSelection: 'Clear',
      selectedCount: '{n} selected',
      copyPath: 'Copy path',
      copied: 'Copied',
      directory: 'Directory exists',
      missing: 'Missing',
      'not-directory': 'Not a directory',
      unavailable: 'Unverified',
      unchecked: 'Not checked',
      sessions: '{n} sessions',
      sessionOne: '1 session',
      removed: 'Removed {n} workspace records.',
      noneInvalid: 'All checked workspace directories exist.',
      skipped: '{n} entries could not be verified or changed and were kept.',
      scanFailed: 'Could not check directories',
      removeFailed: 'Removal stopped before finishing',
      listFailed: 'Could not load workspaces',
      invalidFound: '{n} workspace directories appear missing or invalid.',
      selectRow: 'Select {title}',
    }
    const ZH = {
      panel: '工作区管理',
      description: '检查已保存的工作区目录并清理失效记录，磁盘文件与会话不受影响。',
      scan: '检查目录',
      scanning: '检查中…',
      cleanup: '清理失效记录 ({n})',
      cleanupIdle: '清理失效记录',
      cleanupHint: '未挂载的外接磁盘也会显示目录不存在，移除前请核对路径。',
      search: '搜索工作区名称或路径…',
      empty: '还没有已保存的工作区。',
      emptyHint: '在 DSH 中打开的工作区会列在这里。',
      noMatches: '没有符合当前筛选条件的工作区。',
      resetFilters: '重置筛选',
      loading: '正在加载工作区…',
      remove: '移除',
      removeSelected: '移除所选 ({n})',
      cancel: '取消',
      confirmTitle: '移除工作区？',
      confirmManyTitle: '移除 {n} 条失效工作区？',
      confirmSelectedTitle: '移除所选的 {n} 条工作区？',
      confirmOne: '移除工作区“{title}”？磁盘文件和会话会保留。',
      confirmMany: '以下 {n} 条工作区记录对应的目录不存在或不是目录。磁盘文件和会话会保留。',
      confirmSelected: '移除以下 {n} 条已选中的工作区记录？磁盘文件和会话会保留。',
      confirmDriveNote: '未挂载的外接磁盘也可能被判定为不存在，请确认下方路径。',
      filterAll: '全部',
      filterHealthy: '目录正常',
      filterInvalid: '已失效',
      filterUnavailable: '无法检查',
      sortLabel: '排序方式',
      sortStatus: '状态优先',
      sortName: '按名称',
      sortSessions: '按会话数',
      selectAll: '全选当前',
      clearSelection: '取消选择',
      selectedCount: '已选 {n} 项',
      copyPath: '复制路径',
      copied: '已复制',
      directory: '目录正常',
      missing: '目录不存在',
      'not-directory': '不是目录',
      unavailable: '无法检查',
      unchecked: '未检查',
      sessions: '{n} 个会话',
      sessionOne: '1 个会话',
      removed: '已移除 {n} 条工作区记录。',
      noneInvalid: '所有已检查的工作区目录均正常。',
      skipped: '有 {n} 条记录无法核实或路径已变更，已保留。',
      scanFailed: '检查目录失败',
      removeFailed: '移除已中断，剩余记录未移除',
      listFailed: '加载工作区失败',
      invalidFound: '检测到 {n} 个工作区目录不存在或异常。',
      selectRow: '选择 {title}',
    }

    const isInvalid = status => status === 'missing' || status === 'not-directory'
    const STATUS_ORDER = { missing: 0, 'not-directory': 1, unavailable: 2, unchecked: 3, directory: 4 }
    const STATUS_DOT = { directory: 'done', missing: 'error', 'not-directory': 'error', unavailable: 'warning', unchecked: 'idle' }
    const STATUS_TAG = { directory: 'success', missing: 'danger', 'not-directory': 'danger', unavailable: 'warning', unchecked: 'outline' }

    const useSource = source => React.useSyncExternalStore(
      fn => source.subscribe(fn), () => source.getSnapshot())

    function IconFolder({ size = 16 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z' }),
        h('path', { d: 'M8 13h8' }))
    }

    const CSS = `
.wm-page{container-type:inline-size;height:100%;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.wm-page *,.wm-page *::before,.wm-page *::after{box-sizing:border-box}
.wm-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.wm-inner{display:flex;flex-direction:column;gap:18px;width:min(100%,1080px);margin:0 auto;padding:28px clamp(20px,3.5vw,44px) 56px}
[data-platform=darwin] .wm-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.wm-inner{padding:20px 16px 48px}[data-platform=darwin] .wm-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.wm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
.wm-head-copy{display:flex;flex-direction:column;gap:4px;flex:1 1 280px;min-width:0}
.wm-title{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.01em}
.wm-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.wm-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:none}
.wm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
@container (max-width:680px){.wm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
.wm-stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .15s,border-color .15s}
@media (hover:hover){.wm-stat:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wm-stat[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}
.wm-stat-top{display:flex;align-items:center;gap:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.wm-stat-val{font-size:20px;line-height:26px;font-weight:600;font-variant-numeric:tabular-nums}
.wm-stat[data-tone=danger] .wm-stat-val{color:var(--dsw-alias-state-error-primary)}
.wm-stat[data-tone=warning] .wm-stat-val{color:var(--dsw-alias-state-warn-primary)}
.wm-banner{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.wm-banner>svg{flex:none}
.wm-banner-text{flex:1;min-width:0;overflow-wrap:anywhere}
.wm-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 7%,var(--dsw-alias-bg-layer-1))}
.wm-banner[data-tone=warn]{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 32%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 8%,var(--dsw-alias-bg-layer-1))}
.wm-banner[data-tone=warn]>svg{color:var(--dsw-alias-state-warn-primary)}
.wm-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wm-search{flex:1 1 240px;min-width:0}
.wm-select{height:32px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}
.wm-batch{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-radius:var(--dsw-radius-md,10px);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 9%,var(--dsw-alias-bg-layer-1));border:.5px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 30%,var(--dsw-alias-border-l2));font-size:12px}
.wm-batch-count{flex:1 1 auto;font-weight:500}
.wm-list{display:flex;flex-direction:column;list-style:none;margin:0;padding:0;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);overflow:hidden}
.wm-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-top:.5px solid var(--dsw-alias-border-l1);transition:background-color .12s}
.wm-row:first-child{border-top:0}
@media (hover:hover){.wm-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wm-row[data-selected=true]{background:var(--dsw-alias-bg-layer-1)}
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
.wm-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:44px 20px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);text-align:center;color:var(--dsw-alias-label-secondary)}
.wm-empty p{margin:0}
.wm-confirm{display:flex;flex-direction:column;gap:10px}
.wm-confirm p{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.wm-confirm-paths{margin:0;padding:8px 10px;list-style:none;max-height:36vh;overflow:auto;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-1);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}
.wm-confirm-paths li+li{margin-top:4px;padding-top:4px;border-top:.5px solid var(--dsw-alias-border-l1)}
.wm-confirm-paths li{overflow-wrap:anywhere}
.wm-toast{position:sticky;bottom:14px;align-self:center;padding:5px 12px;border-radius:999px;background:var(--dsw-alias-toast-bg,var(--dsw-alias-label-primary));color:var(--dsw-alias-toast-label,var(--dsw-alias-bg-base));font-size:12px;line-height:18px;box-shadow:var(--dsw-elevation-soft,0 2px 8px rgba(0,0,0,.16));pointer-events:none}
@container (max-width:560px){.wm-row{align-items:flex-start;flex-wrap:wrap}.wm-row-actions{width:100%;justify-content:flex-end;padding-top:4px}}
@media (pointer:coarse){.wm-select{font-size:16px}}
`

    return {
      inject: ['slots', 'locale', 'workspaces'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'workspace-manager: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'workspace-manager: zh')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'workspace-manager: styles')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => t(key).replace(/\{(\w+)\}/g, (match, field) => String(vars[field] ?? match))
        const controller = new AbortController()
        let closed = false
        let state = { checks: new Map(), busy: false, scanning: false, error: null, message: null, confirm: null }
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
        ctx.effect(() => () => { closed = true; finishConfirm(false); controller.abort(); listeners.clear() }, 'workspace-manager: close')

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

          const toggleSelect = (id, checked) => {
            setSelected(prev => {
              const next = new Set(prev)
              if (checked) next.add(id)
              else next.delete(id)
              return next
            })
          }

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
                    return h('li', { key: row.workspaceId, className: 'wm-row', 'data-selected': checked || undefined },
                      h(Checkbox, {
                        className: 'wm-check',
                        checked,
                        disabled,
                        label: '',
                        title: tf('selectRow', { title: row.title }),
                        onChange: next => toggleSelect(row.workspaceId, next),
                      }),
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

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: NS, locale: NS,
        }, WorkspacesPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: NS, order: 22, locale: NS, label: () => t('panel'),
        }, IconFolder))
      },
    }
  },
})
