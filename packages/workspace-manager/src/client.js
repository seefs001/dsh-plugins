window.__ModuleLoader__.load({
  id: 'dsh-workspace-manager',
  factory(require) {
    const React = require('react')
    const {
      Button, Modal, IconTrashOutlineRegular,
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
      cleanupBtn: 'Clean up',
      cleanupBtnTip: 'Clean up idle resources',
      cleanupTitle: 'Clean up',
      cleanupChecking: 'Scanning idle resources…',
      cleanupNothing: 'Nothing idle to clean up right now.',
      cleanupScopeNote: 'Skips the active session and workspace. Actions apply immediately.',
      cleanupGroupInvalid: 'Invalid workspaces',
      cleanupGroupJobs: 'Left-behind background jobs',
      cleanupGroupWorktrees: 'Clean linked worktrees',
      cleanupActionRemove: 'Remove',
      cleanupActionStop: 'Stop',
      cleanupAll: 'Clean up all ({n})',
      cleanupDone: 'Cleaned up {n} items.',
      cleanupFailed: 'Clean up failed',
      cleanupJobOwner: 'Session: {title}',
      cleanupWorktreeBranch: 'Branch: {branch}',
      close: 'Close',
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
      cleanupBtn: '清理闲置',
      cleanupBtnTip: '一步清理失效工作区、孤立后台任务与干净旧 worktree',
      cleanupTitle: '清理闲置',
      cleanupChecking: '正在扫描闲置资源…',
      cleanupNothing: '当前没有可清理的闲置项。',
      cleanupScopeNote: '已自动跳过当前会话与工作区；每项点击后立即执行。',
      cleanupGroupInvalid: '失效工作区',
      cleanupGroupJobs: '遗留后台任务',
      cleanupGroupWorktrees: '干净的旧 Worktree',
      cleanupActionRemove: '移除',
      cleanupActionStop: '停止',
      cleanupAll: '全部清理 ({n})',
      cleanupDone: '已清理 {n} 项闲置资源。',
      cleanupFailed: '清理失败',
      cleanupJobOwner: '所属会话：{title}',
      cleanupWorktreeBranch: '分支：{branch}',
      close: '关闭',
    }

    const useSource = source => React.useSyncExternalStore(
      fn => source.subscribe(fn), () => source.getSnapshot())

    function IconFolder({ size = 16 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z' }),
        h('path', { d: 'M8 13h8' }))
    }

    const CLEANUP_CSS = `
.wm-cu{display:flex;flex-direction:column;gap:12px;min-width:0}
.wm-cu :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wm-cu-block{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);overflow:hidden;background:var(--dsw-alias-card-fill)}
.wm-cu-head{display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--dsw-alias-bg-module-platform);user-select:none}
.wm-cu-head-btn{flex:1;min-width:0;display:flex;align-items:center;gap:8px;border:0;border-radius:var(--dsw-radius-xs,4px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:500;text-align:left;padding:0;cursor:pointer}
.wm-cu-count{font-size:12px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.wm-cu-list{list-style:none;margin:0;padding:0;border-top:.5px solid var(--dsw-alias-border-l1)}
.wm-cu-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-top:.5px solid var(--dsw-alias-border-l1)}
.wm-cu-item:first-child{border-top:0}
.wm-cu-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.wm-cu-name{font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wm-cu-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wm-cu-act{flex:none;min-width:64px;height:26px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.wm-cu-act:disabled{opacity:.5;cursor:default}
@media (hover:hover){.wm-cu-act:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.wm-cu-cards{display:flex;flex-direction:column;gap:8px}
.wm-cu-card{display:flex;align-items:center;gap:10px;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-card-fill)}
.wm-cu-note{margin:0;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.wm-cu-err{margin:0;font-size:12px;color:var(--dsw-alias-state-error-primary)}
.wm-cu-toast-float{position:fixed;left:50%;bottom:max(20px,env(safe-area-inset-bottom));transform:translateX(-50%);max-width:calc(100vw - 24px);z-index:10000;padding:6px 14px;border-radius:999px;background:var(--dsw-alias-toast-bg,var(--dsw-alias-label-primary));color:var(--dsw-alias-toast-label,var(--dsw-alias-bg-base));font-size:12px;line-height:18px;box-shadow:var(--dsw-elevation-panel);pointer-events:none}
@container (max-width:560px){.wm-row{align-items:flex-start;flex-wrap:wrap}.wm-row-actions{width:100%;justify-content:flex-end;padding-top:4px}}
@media (pointer:coarse){.wm-select{font-size:16px;height:36px;min-height:36px}}
`
    const FOOT_CSS = `
.wm-foot-btn{display:flex;align-items:center;gap:var(--dsh-sidebar-label-gap,8px);width:100%;min-height:32px;margin:0;padding:5px calc(var(--dsh-sidebar-row-padding,12px) - var(--dsh-sidebar-paint-inset,3px));box-sizing:border-box;border:0;border-inline:var(--dsh-sidebar-paint-inset,3px) solid transparent;border-radius:var(--dsw-radius-md,8px);background:transparent;background-clip:padding-box;color:var(--dsw-alias-label-primary);font:inherit;line-height:22px;cursor:pointer;text-align:left}
.wm-foot-btn[data-wide=false]{width:36px;height:36px;min-height:36px;padding:0;border-inline:0;background-clip:border-box;justify-content:center;margin:0}
.wm-foot-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
@media (hover:hover){.wm-foot-btn:hover{background-color:var(--dsw-alias-interactive-bg-hover)}}
`

    return {
      inject: ['slots', 'locale', 'workspaces'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'workspace-manager: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'workspace-manager: zh')
        const styleRef = { cleanup: null, page: null }
        const cleanups = []
        const ensureCleanupStyles = () => {
          if (styleRef.cleanup || typeof document === 'undefined' || !document.head) return
          styleRef.cleanup = document.createElement('style')
          styleRef.cleanup.textContent = CLEANUP_CSS
          document.head.append(styleRef.cleanup)
        }
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = FOOT_CSS
          document.head.append(style)
          return () => {
            style.remove()
            styleRef.cleanup?.remove()
            styleRef.cleanup = null
            styleRef.page?.remove()
            styleRef.page = null
            while (cleanups.length) cleanups.pop()?.()
          }
        }, 'workspace-manager: styles')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => t(key).replace(/\{(\w+)\}/g, (match, field) => String(vars[field] ?? match))
        const controller = new AbortController()
        let closed = false
        let cleanupState = { open: false, loading: false, acting: false, error: null, notice: '', data: { invalidWorkspaces: [], idleJobs: [], cleanWorktrees: [] } }
        const cleanupListeners = new Set()
        const cleanupStore = {
          getSnapshot: () => cleanupState,
          subscribe(fn) { cleanupListeners.add(fn); return () => cleanupListeners.delete(fn) },
        }
        let noticeTimer = null
        const setCleanup = patch => {
          if (closed) return
          cleanupState = { ...cleanupState, ...patch }
          cleanupListeners.forEach(fn => fn())
        }
        const flashCleanupNotice = text => {
          const menus = ctx.get?.('contextMenus')
          if (typeof menus?.notify === 'function') { menus.notify(text, true); return }
          clearTimeout(noticeTimer)
          setCleanup({ notice: text })
          noticeTimer = setTimeout(() => setCleanup({ notice: '' }), 2400)
        }
        const currentScope = () => {
          const sessionsApi = ctx.get?.('sessions')
          const listSnap = sessionsApi?.list?.getSnapshot?.()
          const mainSession = listSnap?.byId ? Object.values(listSnap.byId).find(s => (s.retainedBy?.mainView ?? 0) > 0) : null
          const currentSessionId = mainSession?.id || ''
          const wsItems = ctx.workspaces.list.getSnapshot()?.items ?? []
          const currentWs = currentSessionId
            ? wsItems.find(item => Array.isArray(item.sessionIds) && item.sessionIds.includes(currentSessionId))
            : null
          return { currentSessionId, currentWorkspaceId: currentWs?.workspaceId || '' }
        }
        async function openCleanupDialog() {
          if (closed || cleanupState.loading) return
          setCleanup({ loading: true, error: null })
          try {
            const { currentSessionId, currentWorkspaceId } = currentScope()
            const params = new URLSearchParams()
            if (currentWorkspaceId) params.set('currentWorkspaceId', currentWorkspaceId)
            if (currentSessionId) params.set('currentSessionId', currentSessionId)
            const qs = params.toString()
            const res = await fetch(`workspace-manager/cleanup-scan${qs ? `?${qs}` : ''}`, {
              headers: { accept: 'application/json' }, cache: 'no-store', signal: controller.signal,
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const body = await res.json()
            const data = {
              invalidWorkspaces: Array.isArray(body?.invalidWorkspaces) ? body.invalidWorkspaces : [],
              idleJobs: Array.isArray(body?.idleJobs) ? body.idleJobs : [],
              cleanWorktrees: Array.isArray(body?.cleanWorktrees) ? body.cleanWorktrees : [],
            }
            const total = data.invalidWorkspaces.length + data.idleJobs.length + data.cleanWorktrees.length
            if (total === 0) {
              setCleanup({ open: false, loading: false, data })
              flashCleanupNotice(t('cleanupNothing'))
              return
            }
            setCleanup({ open: true, loading: false, data, error: null })
          } catch (error) {
            setCleanup({ loading: false, error: `${t('cleanupFailed')}: ${error?.message ?? error}` })
            flashCleanupNotice(`${t('cleanupFailed')}: ${error?.message ?? error}`)
          }
        }
        async function postCleanupAction(payload) {
          const res = await fetch('workspace-manager/cleanup-action', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })
          const body = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`)
          return body
        }
        async function executeCleanupItem(kind, item) {
          if (closed || cleanupState.acting) return false
          setCleanup({ acting: true, error: null })
          try {
            if (kind === 'invalid') {
              await ctx.workspaces.delete(item.workspaceId)
              setCleanup({
                data: {
                  ...cleanupState.data,
                  invalidWorkspaces: cleanupState.data.invalidWorkspaces.filter(row => row.workspaceId !== item.workspaceId),
                },
              })
            } else if (kind === 'job') {
              await postCleanupAction({ action: 'stop-job', jobId: item.jobId, owner: item.owner })
              setCleanup({
                data: {
                  ...cleanupState.data,
                  idleJobs: cleanupState.data.idleJobs.filter(row => row.jobId !== item.jobId),
                },
              })
            } else if (kind === 'worktree') {
              await postCleanupAction({ action: 'remove-worktree', path: item.path })
              await ctx.workspaces.delete(item.workspaceId)
              setCleanup({
                data: {
                  ...cleanupState.data,
                  cleanWorktrees: cleanupState.data.cleanWorktrees.filter(row => row.workspaceId !== item.workspaceId),
                },
              })
            }
            const left = cleanupState.data.invalidWorkspaces.length + cleanupState.data.idleJobs.length + cleanupState.data.cleanWorktrees.length
            if (left === 0) setCleanup({ open: false })
            return true
          } catch (error) {
            setCleanup({ error: `${t('cleanupFailed')}: ${error?.message ?? error}` })
            return false
          } finally {
            setCleanup({ acting: false })
          }
        }
        async function executeCleanupAll() {
          if (closed || cleanupState.acting) return
          setCleanup({ acting: true, error: null })
          let done = 0
          const snap = cleanupState.data
          const remainingInvalid = []
          const remainingJobs = []
          const remainingWorktrees = []
          let lastError = null
          for (const item of snap.invalidWorkspaces) {
            try { await ctx.workspaces.delete(item.workspaceId); done++ } catch (e) { remainingInvalid.push(item); lastError = e }
          }
          for (const item of snap.idleJobs) {
            try { await postCleanupAction({ action: 'stop-job', jobId: item.jobId, owner: item.owner }); done++ } catch (e) { remainingJobs.push(item); lastError = e }
          }
          for (const item of snap.cleanWorktrees) {
            try {
              await postCleanupAction({ action: 'remove-worktree', path: item.path })
              await ctx.workspaces.delete(item.workspaceId)
              done++
            } catch (e) { remainingWorktrees.push(item); lastError = e }
          }
          const left = remainingInvalid.length + remainingJobs.length + remainingWorktrees.length
          setCleanup({
            acting: false,
            open: left > 0,
            error: lastError ? `${t('cleanupFailed')}: ${lastError?.message ?? lastError}` : null,
            data: { invalidWorkspaces: remainingInvalid, idleJobs: remainingJobs, cleanWorktrees: remainingWorktrees },
          })
          if (done > 0) flashCleanupNotice(tf('cleanupDone', { n: done }))
        }
        ctx.effect(() => () => { closed = true; clearTimeout(noticeTimer); controller.abort(); cleanupListeners.clear() }, 'workspace-manager: close')

        let PageComp = null
        let pagePromise = null
        const pageListeners = new Set()
        const initPage = mod => {
          if (!PageComp) {
            const built = mod.createWorkspacesPage({ ctx, t, tf, useSource, styleRef, openCleanupDialog, IconFolder })
            PageComp = built.WorkspacesPage
            if (typeof built.dispose === 'function') cleanups.push(built.dispose)
          }
          return PageComp
        }
        const loadPage = () => {
          if (PageComp) return Promise.resolve(PageComp)
          if (!pagePromise && typeof require.async === 'function') {
            pagePromise = require.async('./client.page.js').then(mod => {
              const comp = initPage(mod)
              for (const fn of pageListeners) fn()
              return comp
            }, err => {
              pagePromise = null
              throw err
            })
          }
          return pagePromise
        }
        function PageLoader(props) {
          const [err, setErr] = React.useState(null)
          const [, setTick] = React.useState(0)
          React.useEffect(() => {
            const onReady = () => setTick(n => n + 1)
            pageListeners.add(onReady)
            if (!PageComp) loadPage()?.catch(e => setErr(e?.message || String(e)))
            return () => { pageListeners.delete(onReady) }
          }, [])
          if (PageComp) return h(PageComp, props)
          if (err) return h('div', { style: { padding: 24, color: 'var(--dsw-alias-state-error-primary)' } }, err)
          return h('div', { style: { padding: 24, color: 'var(--dsw-alias-label-secondary)' } }, t('scanning'))
        }
        function LazyWorkspacesPage(props) {
          if (typeof require.syncChunk === 'function') {
            return initPage(require.syncChunk('./client.page.js'))(props)
          }
          return PageComp ? h(PageComp, props) : h(PageLoader, props)
        }

        function CleanupFooterAction({ wide }) {
          useSource(ctx.locale)
          const cu = useSource(cleanupStore)
          return h('button', {
            type: 'button',
            className: 'wm-foot-btn',
            'data-wide': wide ? 'true' : 'false',
            disabled: cu.loading,
            title: t('cleanupBtnTip'),
            'aria-label': t('cleanupBtn'),
            onClick: () => void openCleanupDialog(),
          },
          h(IconTrashOutlineRegular, { size: 16 }),
          wide ? h('span', null, cu.loading ? t('scanning') : t('cleanupBtn')) : null)
        }

        function CleanupOverlay() {
          useSource(ctx.locale)
          const cu = useSource(cleanupStore)
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(() => { if (cu.open || cu.notice) ensureCleanupStyles() }, [cu.open, Boolean(cu.notice)])
          const [openInvalid, setOpenInvalid] = React.useState(true)
          const [openWorktrees, setOpenWorktrees] = React.useState(true)
          const { invalidWorkspaces, idleJobs, cleanWorktrees } = cu.data
          const total = invalidWorkspaces.length + idleJobs.length + cleanWorktrees.length
          return h(React.Fragment, null,
            cu.notice ? h('div', { className: 'wm-cu-toast-float', role: 'status', 'aria-live': 'polite' }, cu.notice) : null,
            cu.open ? h(Modal, {
              open: true,
              onClose: () => { if (!cu.acting) setCleanup({ open: false }) },
              title: t('cleanupTitle'),
              closeLabel: t('close'),
              footer: h(React.Fragment, null,
                h(Button, { variant: 'outline', disabled: cu.acting, onClick: () => setCleanup({ open: false }) }, t('close')),
                total > 0 ? h(Button, { variant: 'primary', className: 'wm-danger-fill', disabled: cu.acting, onClick: () => void executeCleanupAll() }, tf('cleanupAll', { n: total })) : null),
            }, h('div', { className: 'wm-cu' },
              cu.error ? h('p', { className: 'wm-cu-err', role: 'alert' }, cu.error) : null,
              invalidWorkspaces.length > 0 ? h('div', { className: 'wm-cu-block' },
                h('div', { className: 'wm-cu-head' },
                  h('button', { type: 'button', className: 'wm-cu-head-btn', 'aria-expanded': openInvalid, onClick: () => setOpenInvalid(v => !v) },
                    h('span', null, openInvalid ? '▾' : '▸'),
                    h('span', null, t('cleanupGroupInvalid')),
                    h('span', { className: 'wm-cu-count' }, invalidWorkspaces.length))),
                openInvalid ? h('ul', { className: 'wm-cu-list' }, invalidWorkspaces.map(item => h('li', { key: item.workspaceId, className: 'wm-cu-item' },
                  h('div', { className: 'wm-cu-meta' },
                    h('span', { className: 'wm-cu-name' }, item.title),
                    h('span', { className: 'wm-cu-sub' }, `${t(item.status)} · ${item.path}`)),
                  h('button', {
                    type: 'button', className: 'wm-cu-act', disabled: cu.acting,
                    onClick: () => void executeCleanupItem('invalid', item),
                  }, t('cleanupActionRemove'))))) : null) : null,
              cleanWorktrees.length > 0 ? h('div', { className: 'wm-cu-block' },
                h('div', { className: 'wm-cu-head' },
                  h('button', { type: 'button', className: 'wm-cu-head-btn', 'aria-expanded': openWorktrees, onClick: () => setOpenWorktrees(v => !v) },
                    h('span', null, openWorktrees ? '▾' : '▸'),
                    h('span', null, t('cleanupGroupWorktrees')),
                    h('span', { className: 'wm-cu-count' }, cleanWorktrees.length))),
                openWorktrees ? h('ul', { className: 'wm-cu-list' }, cleanWorktrees.map(item => h('li', { key: item.workspaceId, className: 'wm-cu-item' },
                  h('div', { className: 'wm-cu-meta' },
                    h('span', { className: 'wm-cu-name' }, item.title),
                    h('span', { className: 'wm-cu-sub' }, [item.branch ? tf('cleanupWorktreeBranch', { branch: item.branch }) : '', item.path].filter(Boolean).join(' · '))),
                  h('button', {
                    type: 'button', className: 'wm-cu-act', disabled: cu.acting,
                    onClick: () => void executeCleanupItem('worktree', item),
                  }, t('cleanupActionRemove'))))) : null) : null,
              idleJobs.length > 0 ? h('div', { className: 'wm-cu-cards' },
                h('div', { className: 'wm-cu-sub' }, `${t('cleanupGroupJobs')} (${idleJobs.length})`),
                idleJobs.map(item => h('div', { key: item.jobId, className: 'wm-cu-card' },
                  h('div', { className: 'wm-cu-meta' },
                    h('span', { className: 'wm-cu-name' }, item.label),
                    h('span', { className: 'wm-cu-sub' }, item.sessionTitle ? tf('cleanupJobOwner', { title: item.sessionTitle }) : item.jobId)),
                  h('button', {
                    type: 'button', className: 'wm-cu-act', disabled: cu.acting,
                    onClick: () => void executeCleanupItem('job', item),
                  }, t('cleanupActionStop'))))) : null,
              h('p', { className: 'wm-cu-note' }, t('cleanupScopeNote')))) : null)
        }

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: NS, locale: NS,
        }, LazyWorkspacesPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: NS, order: 22, locale: NS, label: () => t('panel'),
        }, IconFolder))
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action', id: `${NS}-cleanup`, order: 20, locale: NS,
        }, CleanupFooterAction))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: `${NS}-cleanup-dialog`, order: 1020, locale: NS,
        }, CleanupOverlay))
      },
      _internal: { EN, ZH },
    }
  },
})
