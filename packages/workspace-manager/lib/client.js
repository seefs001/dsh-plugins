window.__ModuleLoader__.load({
  id: 'dsh-workspace-manager',
  factory(require) {
    const React = require('react')
    const { Button, Modal } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'workspace-manager'
    const EN = {
      panel: 'Workspace manager',
      description: 'Remove saved workspace records while keeping disk files and sessions intact.',
      scan: 'Check directories',
      scanning: 'Checking directories…',
      cleanup: 'Clean up missing entries',
      cleanupHint: 'Checks all workspaces regardless of search. Disconnected external drives also appear missing, so verify paths before confirming.',
      search: 'Search names or paths',
      empty: 'No saved workspaces.',
      noMatches: 'No matching workspaces.',
      loading: 'Loading workspaces…',
      remove: 'Remove',
      cancel: 'Cancel',
      confirmTitle: 'Remove workspace?',
      confirmManyTitle: 'Remove invalid workspaces?',
      directory: 'Directory exists',
      missing: 'Directory missing',
      'not-directory': 'Not a directory',
      unavailable: 'Could not check',
      unchecked: 'Not checked',
      sessions: '{n} sessions',
      confirmOne: 'Remove workspace “{title}”?\n\n{path}\n\nFiles and sessions are kept.',
      confirmMany: 'Remove these {n} invalid workspace entries? Files and sessions are kept:',
      removed: 'Removed {n} workspace entries.',
      noneInvalid: 'No missing or non-directory paths found.',
      skipped: '{n} entries could not be verified and were left alone.',
      scanFailed: 'Could not check directories',
      removeFailed: 'Removal stopped. Remaining entries were not removed',
      listFailed: 'Could not load workspaces',
    }
    const ZH = {
      panel: '工作区管理',
      description: '移除已保存的工作区记录，保留磁盘文件和会话。',
      scan: '检查目录',
      scanning: '正在检查目录…',
      cleanup: '清理失效记录',
      cleanupHint: '会检查全部工作区（不受搜索条件影响）。未挂载的外接磁盘也会显示目录不存在，确认前请核对路径。',
      search: '搜索名称或路径',
      empty: '没有已保存的工作区。',
      noMatches: '没有匹配的工作区。',
      loading: '正在加载工作区…',
      remove: '移除',
      cancel: '取消',
      confirmTitle: '移除工作区？',
      confirmManyTitle: '移除失效工作区？',
      directory: '目录存在',
      missing: '目录不存在',
      'not-directory': '不是目录',
      unavailable: '无法检查',
      unchecked: '未检查',
      sessions: '{n} 个会话',
      confirmOne: '移除工作区“{title}”？\n\n{path}\n\n磁盘文件和会话会保留。',
      confirmMany: '移除以下 {n} 条失效工作区记录？磁盘文件和会话会保留：',
      removed: '已移除 {n} 条工作区记录。',
      noneInvalid: '没有发现不存在或非目录的路径。',
      skipped: '有 {n} 条记录无法核实，已保留。',
      scanFailed: '检查目录失败',
      removeFailed: '移除已停止，后续记录未移除',
      listFailed: '加载工作区失败',
    }
    const invalid = check => check?.status === 'missing' || check?.status === 'not-directory'
    const useSource = source => React.useSyncExternalStore(
      fn => source.subscribe(fn), () => source.getSnapshot())

    function IconFolder({ size = 16 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z' }),
        h('path', { d: 'M8 13h8' }))
    }

    const CSS = `
.wm-page{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
.wm-inner{max-width:960px;margin:0 auto;padding:28px clamp(24px,4vw,48px) 64px}
[data-platform=darwin] .wm-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.wm-title{margin:0 0 8px;font-size:20px;line-height:28px;font-weight:500}
.wm-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.wm-actions{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 12px}
.wm-btn{display:inline-flex;align-items:center;justify-content:center;height:30px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;font-size:13px;line-height:20px;cursor:pointer}
@media (hover:hover){.wm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.wm-btn:disabled{opacity:.45;cursor:default}
.wm-danger{color:var(--dsw-alias-state-error-primary)}
.wm-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}
.wm-confirm-body{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);max-height:50vh;overflow:auto}
.wm-page button:focus-visible,.wm-search:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.wm-search{box-sizing:border-box;width:100%;height:34px;margin:8px 0 16px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;font-size:13px}
.wm-list{list-style:none;margin:0;padding:0;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);overflow:hidden}
.wm-row{display:flex;align-items:center;gap:12px;padding:14px 16px}
.wm-row+.wm-row{border-top:.5px solid var(--dsw-alias-border-l1)}
.wm-details{flex:1;min-width:0}
.wm-name{font-size:14px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
.wm-path{margin:4px 0;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:18px;overflow-wrap:anywhere;color:var(--dsw-alias-label-secondary)}
.wm-meta{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.wm-notice{font-size:13px;line-height:20px;overflow-wrap:anywhere}
@media (pointer:coarse){.wm-search{font-size:16px}}
@media (max-width:767px){.wm-inner{padding:24px 20px 48px}[data-platform=darwin] .wm-inner{padding-top:calc(24px + var(--dsh-frame-top-clearance,0px))}.wm-row{padding:12px;gap:8px}}
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
        const askConfirm = (title, body) => new Promise(resolve => {
          pendingResolve?.(false)
          pendingResolve = resolve
          update({ confirm: { title, body } })
        })
        const finishConfirm = ok => {
          const resolve = pendingResolve
          pendingResolve = null
          update({ confirm: null })
          resolve?.(ok)
        }
        ctx.effect(() => () => { closed = true; finishConfirm(false); controller.abort(); listeners.clear() }, 'workspace-manager: close')

        async function scan() {
          update({ scanning: true, checks: new Map() })
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

        async function run(action, workspace) {
          if (closed || state.busy) return
          update({ busy: true, error: null, message: null })
          let removed = 0
          let skipped = 0
          const summary = message => skipped ? `${message} ${tf('skipped', { n: skipped })}` : message
          let stage = action === 'remove' ? 'remove' : 'scan'
          try {
            let candidates
            if (action === 'remove') {
              candidates = [workspace]
            } else {
              const checks = await scan()
              if (action === 'scan' || closed) return
              candidates = ctx.workspaces.list.getSnapshot().items.filter(row => {
                const check = checks.get(row.workspaceId)
                if (check?.path !== row.path || check.status === 'unavailable') { skipped++; return false }
                return invalid(check)
              })
              if (candidates.length === 0) {
                update({ message: summary(t('noneInvalid')) })
                return
              }
            }
            stage = 'remove'
            const title = action === 'remove' ? t('confirmTitle') : t('confirmManyTitle')
            const question = action === 'remove'
              ? tf('confirmOne', { title: workspace.title, path: workspace.path })
              : `${tf('confirmMany', { n: candidates.length })}\n\n${candidates.map(row => row.path).join('\n')}`
            if (!await askConfirm(title, question)) return
            for (const row of candidates) {
              if (closed) return
              const current = ctx.workspaces.list.getSnapshot().items.find(item => item.workspaceId === row.workspaceId)
              if (!current) continue
              if (current.path !== row.path) { skipped++; continue }
              await ctx.workspaces.delete(row.workspaceId)
              removed++
            }
            update({ message: summary(tf('removed', { n: removed })) })
          } catch (error) {
            update({
              error: `${t(stage === 'scan' ? 'scanFailed' : 'removeFailed')}: ${error.message ?? String(error)}`,
              message: removed > 0 ? tf('removed', { n: removed }) : null,
            })
          } finally {
            update({ busy: false })
          }
        }

        function WorkspacesPage() {
          useSource(ctx.locale)
          const list = useSource(ctx.workspaces.list)
          const view = useSource(store)
          const [query, setQuery] = React.useState('')
          React.useEffect(() => {
            void run('scan')
            return () => finishConfirm(false)
          }, [])
          const search = query.trim().toLocaleLowerCase()
          const rows = list.items.filter(row => `${row.title}\n${row.path}`.toLocaleLowerCase().includes(search))
          const disabled = view.busy || list.phase !== 'ready' || list.state !== 'idle'
          return h('section', { className: 'wm-page', 'aria-label': t('panel') },
            h('div', { className: 'wm-inner' },
              h('h1', { className: 'wm-title' }, t('panel')),
              h('p', { className: 'wm-hint' }, t('description')),
              h('div', { className: 'wm-actions' },
                h('button', { type: 'button', className: 'wm-btn', disabled: view.busy, onClick: () => void run('scan') }, view.scanning ? t('scanning') : t('scan')),
                h('button', { type: 'button', className: 'wm-btn wm-danger', disabled: disabled || list.items.length === 0, onClick: () => void run('cleanup') }, t('cleanup'))),
              h('p', { className: 'wm-hint' }, t('cleanupHint')),
              h('input', { type: 'search', className: 'wm-search', value: query, placeholder: t('search'), 'aria-label': t('search'), onChange: event => setQuery(event.target.value) }),
              list.state === 'error' ? h('p', { className: 'wm-notice wm-danger', role: 'alert' }, `${t('listFailed')}: ${list.error?.message ?? ''}`) : null,
              view.error ? h('p', { className: 'wm-notice wm-danger', role: 'alert' }, view.error) : null,
              h('div', { role: 'status', 'aria-live': 'polite', className: 'wm-notice' }, view.scanning ? t('scanning') : view.message),
              rows.length === 0 ? list.state === 'error' ? null : h('p', { className: 'wm-hint' }, list.phase !== 'ready' ? t('loading') : list.items.length ? t('noMatches') : t('empty')) :
                h('ul', { className: 'wm-list' }, rows.map(row => {
                  const check = view.checks.get(row.workspaceId)
                  const status = check?.path === row.path ? check.status : 'unchecked'
                  return h('li', { key: row.workspaceId, className: 'wm-row' },
                    h('div', { className: 'wm-details' },
                      h('div', { className: 'wm-name' }, row.title),
                      h('div', { className: 'wm-path' }, row.path),
                      h('div', { className: 'wm-meta' },
                        h('span', { className: status === 'missing' || status === 'not-directory' ? 'wm-danger' : undefined }, t(status), status === 'unavailable' && check.code ? ` (${check.code})` : ''),
                        h('span', null, tf('sessions', { n: row.sessionIds.length })))),
                    h('button', { type: 'button', className: 'wm-btn wm-danger', disabled, 'aria-label': `${t('remove')} ${row.title}`, onClick: () => void run('remove', row) }, t('remove')))
                }))),
            view.confirm ? h(Modal, {
              open: true,
              onClose: () => finishConfirm(false),
              title: view.confirm.title,
              closeLabel: t('cancel'),
              footer: h(React.Fragment, null,
                h(Button, { variant: 'outline', 'data-modal-autofocus': true, onClick: () => finishConfirm(false) }, t('cancel')),
                h(Button, { variant: 'primary', className: 'wm-danger-fill', onClick: () => finishConfirm(true) }, t('remove'))),
            }, h('p', { className: 'wm-confirm-body' }, view.confirm.body)) : null)
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
