/** Workspace registry management without deleting directories or session logs. */
window.__ModuleLoader__.load({
  id: 'dsh-workspace-manager',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'workspace-manager'
    const EN = {
      panel: 'Workspace manager',
      description: 'Remove saved workspace entries, not files or sessions. Changes also update the built-in workspace picker.',
      scan: 'Check directories',
      scanning: 'Checking directories…',
      cleanup: 'Clean up invalid entries',
      cleanupHint: 'Cleanup checks all workspaces, regardless of the search filter. Disconnected drives may look missing. Review the paths before confirming.',
      search: 'Search names or paths',
      empty: 'No saved workspaces.',
      noMatches: 'No matching workspaces.',
      loading: 'Loading workspaces…',
      remove: 'Remove',
      directory: 'Directory exists',
      missing: 'Directory missing',
      'not-directory': 'Not a directory',
      unavailable: 'Could not check',
      unchecked: 'Not checked',
      sessions: '{n} sessions',
      confirmOne: 'Remove workspace “{title}” from the list?\n\n{path}\n\nFiles and sessions will be kept.',
      confirmMany: 'Remove these {n} invalid workspace entries? Files and sessions will be kept.\n\nCheck for disconnected drives before confirming:',
      removed: 'Removed {n} workspace entries. Files and sessions were kept.',
      noneInvalid: 'No missing or non-directory paths found.',
      scanFailed: 'Could not check directories',
      removeFailed: 'Removal stopped. Remaining entries were not removed',
      listFailed: 'Could not load workspaces',
    }
    const ZH = {
      panel: '工作区管理',
      description: '只移除工作区记录，不删除磁盘文件或会话。移除后，原生工作区选择器也会同步更新。',
      scan: '检查目录',
      scanning: '正在检查目录…',
      cleanup: '清理失效记录',
      cleanupHint: '清理会检查全部工作区，不受搜索条件影响。断开的磁盘也可能显示为不存在，确认前请核对路径。',
      search: '搜索名称或路径',
      empty: '没有已保存的工作区。',
      noMatches: '没有匹配的工作区。',
      loading: '正在加载工作区…',
      remove: '移除',
      directory: '目录存在',
      missing: '目录不存在',
      'not-directory': '不是目录',
      unavailable: '无法检查',
      unchecked: '未检查',
      sessions: '{n} 个会话',
      confirmOne: '从列表移除工作区“{title}”？\n\n{path}\n\n磁盘文件和会话都会保留。',
      confirmMany: '移除以下 {n} 条失效工作区记录？磁盘文件和会话都会保留。\n\n请先确认这些路径不是暂时断开的磁盘：',
      removed: '已移除 {n} 条工作区记录，磁盘文件和会话均已保留。',
      noneInvalid: '没有发现不存在或非目录的路径。',
      scanFailed: '检查目录失败',
      removeFailed: '移除已停止，后续记录未移除',
      listFailed: '加载工作区失败',
    }
    const invalid = check => check?.status === 'missing' || check?.status === 'not-directory'
    const statuses = new Set(['directory', 'missing', 'not-directory', 'unavailable'])
    const useSource = source => React.useSyncExternalStore(
      fn => source.subscribe(fn), () => source.getSnapshot())

    function IconFolder({ size = 16 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z' }),
        h('path', { d: 'M8 13h8' }))
    }

    const CSS = `
.wm-page{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
.wm-inner{max-width:960px;margin:auto;padding:30px 24px 64px}
.wm-title{margin:0 0 12px;font-size:20px;font-weight:500}
.wm-hint{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6}
.wm-actions{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 12px}
.wm-btn{padding:6px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:13px;cursor:pointer}
.wm-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
.wm-btn:disabled{opacity:.45;cursor:default}
.wm-danger{color:var(--dsw-alias-state-error-primary,#d44)}
.wm-page button:focus-visible,.wm-search:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.wm-search{box-sizing:border-box;width:100%;margin:8px 0 16px;padding:9px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;font-size:13px}
.wm-list{list-style:none;margin:0;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;overflow:hidden}
.wm-row{display:flex;align-items:center;gap:12px;padding:14px 16px}
.wm-row+.wm-row{border-top:1px solid var(--dsw-alias-border-l2)}
.wm-details{flex:1;min-width:0}
.wm-name{font-size:14px;font-weight:500;overflow-wrap:anywhere}
.wm-path{margin:5px 0;font-family:monospace;font-size:12px;overflow-wrap:anywhere;color:var(--dsw-alias-label-secondary)}
.wm-meta{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.wm-notice{font-size:13px;line-height:1.6;overflow-wrap:anywhere}
@media(max-width:520px){.wm-inner{padding:20px 12px}.wm-row{padding:12px;gap:8px}}
`

    return {
      inject: ['slots', 'locale', 'workspaces'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'workspace-manager: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'workspace-manager: zh')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => t(key).replace(/\{(\w+)\}/g, (match, field) => String(vars[field] ?? match))
        const controller = new AbortController()
        let closed = false
        let state = { checks: new Map(), busy: false, scanning: false, error: null, message: null }
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
        ctx.effect(() => () => { closed = true; controller.abort(); listeners.clear() }, 'workspace-manager: close')

        async function scan() {
          update({ scanning: true, checks: new Map() })
          try {
            const response = await fetch('workspace-manager/check', {
              headers: { accept: 'application/json' }, cache: 'no-store', signal: controller.signal,
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const body = await response.json()
            if (!Array.isArray(body.checks) || body.checks.some(row =>
              !row || typeof row.workspaceId !== 'string' || typeof row.path !== 'string' || !statuses.has(row.status))) {
              throw new Error('Invalid directory check response')
            }
            const checks = new Map(body.checks.map(row => [row.workspaceId, row]))
            update({ checks })
            return checks
          } finally {
            update({ scanning: false })
          }
        }

        // All removals use the native API, including its authorization and live updates.
        async function run(action, workspace) {
          if (closed || state.busy) return
          update({ busy: true, error: null, message: null })
          let removed = 0
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
                return check?.path === row.path && invalid(check)
              })
              if (candidates.length === 0) {
                update({ message: t('noneInvalid') })
                return
              }
            }
            stage = 'remove'
            const question = action === 'remove'
              ? tf('confirmOne', { title: workspace.title, path: workspace.path })
              : `${tf('confirmMany', { n: candidates.length })}\n\n${candidates.map(row => row.path).join('\n')}`
            if (!window.confirm(question)) return
            for (const row of candidates) {
              if (closed) return
              const current = ctx.workspaces.list.getSnapshot().items.find(item => item.workspaceId === row.workspaceId)
              if (!current) continue
              await ctx.workspaces.delete(row.workspaceId)
              removed++
            }
            update({ message: tf('removed', { n: removed }) })
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
          React.useEffect(() => { void run('scan') }, [])
          const search = query.trim().toLocaleLowerCase()
          const rows = list.items.filter(row => `${row.title}\n${row.path}`.toLocaleLowerCase().includes(search))
          const disabled = view.busy || list.phase !== 'ready' || list.state !== 'idle'
          return h('section', { className: 'wm-page', 'aria-label': t('panel') },
            h('style', null, CSS),
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
              rows.length === 0 ? h('p', { className: 'wm-hint' }, list.phase !== 'ready' ? t('loading') : list.items.length ? t('noMatches') : t('empty')) :
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
                }))))
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
