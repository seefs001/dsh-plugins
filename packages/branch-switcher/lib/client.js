/** Enhance the existing Hero worktree seat; no DOM patching or application rebuild. */
window.__ModuleLoader__.load({
  id: 'dsh-branch-switcher',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'branchSwitcher'
    const SLOT = 'conversation.hero.options'
    const ENTRY = 'forge-panel.worktree'
    const EN = {
      switch: 'Switch branch', search: 'Search local branches', loading: 'Loading branches…', switching: 'Switching branch…',
      current: 'Current', detached: 'Detached HEAD', empty: 'No matching local branches.', retry: 'Retry', close: 'Close',
      hint: 'Switch the existing checkout. Other sessions using this directory see the same branch. Uncommitted changes are kept unless Git refuses the switch.',
      local: 'Existing local branches only. No fetch, branch creation, stash, or force.',
      worktree: 'New worktree', worktreeHint: 'Create an isolated checkout when the first message is sent.',
      readonly: 'Branch switching is unavailable in read-only mode.',
      changed: 'Switched to {branch}', choose: 'Switch to {branch}',
    }
    const ZH = {
      switch: '切换分支', search: '搜索本地分支', loading: '正在加载分支…', switching: '正在切换分支…',
      current: '当前', detached: '游离 HEAD', empty: '没有匹配的本地分支。', retry: '重试', close: '关闭',
      hint: '切换当前工作目录，共用此目录的其他会话也会受影响。未提交改动会保留；可能覆盖改动时，Git 会拒绝切换。',
      local: '只切换已有本地分支，不拉取、不建分支、不暂存、不强制覆盖。',
      worktree: '新建工作树', worktreeHint: '发送首条消息时创建独立工作目录。',
      readonly: '只读模式下不能切换分支。',
      changed: '已切换到 {branch}', choose: '切换到 {branch}',
    }
    const CSS = `
.dbs-root{display:inline-flex;flex:none;align-items:center;gap:2px;min-width:0}
.dbs-chip,.dbs-toggle{display:inline-flex;align-items:center;gap:6px;min-width:0;height:28px;padding:0 8px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;font-weight:500;line-height:20px;white-space:nowrap;cursor:pointer}
.dbs-chip{max-width:200px}.dbs-chip svg{width:14px;height:14px;flex:none}.dbs-label{overflow:hidden;text-overflow:ellipsis;min-width:0}
.dbs-toggle input{width:14px;height:14px;flex:none;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:inherit}
.dbs-chip:disabled,.dbs-toggle:has(input:disabled){color:var(--dsw-alias-label-dimmed);cursor:default}
.dbs-chip:focus-visible,.dbs-toggle:has(input:focus-visible),.dbs-pop button:focus-visible,.dbs-search:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dbs-toggle input:focus-visible{outline:none}
.dbs-pop{box-sizing:border-box;position:fixed;inset:auto;margin:0;width:min(360px,calc(100vw - 24px));max-height:calc(100dvh - 24px);padding:8px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 8px 32px var(--dsw-alias-bg-mask-1);font:inherit;font-size:13px;text-align:left;overflow:auto}
.dbs-pop::backdrop{background:transparent}
.dbs-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 4px 8px;font-weight:500}
.dbs-search{box-sizing:border-box;width:100%;height:34px;margin:0 0 6px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit}
.dbs-list{max-height:240px;overflow:auto;overscroll-behavior:contain}
.dbs-row{display:flex;align-items:center;gap:8px;width:100%;min-height:34px;padding:7px 10px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dbs-row[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active)}
.dbs-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:12px}
.dbs-note{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px}.dbs-hint{margin:8px 4px 4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6;overflow-wrap:anywhere;white-space:normal}
.dbs-small{color:var(--dsw-alias-label-tertiary);font-size:11px}
.dbs-error{margin:8px 4px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.dbs-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:10px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1)}
.dbs-btn{min-height:32px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.dbs-primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);border-color:transparent}.dbs-btn:disabled{opacity:.45;cursor:default}
.dbs-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@media(hover:hover){.dbs-chip:hover:not(:disabled),.dbs-toggle:hover:not(:has(input:disabled)),.dbs-row:hover:not(:disabled),.dbs-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dbs-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media(max-width:600px){.dbs-root{flex-direction:column;align-items:flex-end;gap:0}.dbs-chip{max-width:120px}}
`
    function BranchIcon() {
      return h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, 'aria-hidden': true },
        h('circle', { cx: 4, cy: 3, r: 1.5 }), h('circle', { cx: 4, cy: 13, r: 1.5 }),
        h('circle', { cx: 12, cy: 4, r: 1.5 }), h('path', { d: 'M4 4.5v7M12 5.5C12 10 4 7 4 11.5' }))
    }
    return {
      inject: ['slots', 'locale', 'remote', 'remote.commands', 'remote.forgePanel'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN))
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH))
        const t = ctx.locale.bind(NS)
        const tf = (key, branch) => t(key).replace('{branch}', branch)
        async function request(sessionId, args) {
          const response = await ctx.remote.commands.execute(sessionId, `/branch-switcher ${JSON.stringify(args)}`, [])
          if (!response.ok) throw new Error(response.error.message)
          const result = response.value?.result
          if (result?.kind !== 'success') throw new Error(result?.text ?? 'Branch switcher command unavailable')
          return JSON.parse(result.text)
        }
        function BranchSeat(props) {
          const panel = props.usePanel(snapshot => snapshot.state)
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const [pending, setPending] = React.useState(false)
          const [loading, setLoading] = React.useState(false)
          const [listed, setListed] = React.useState(null)
          const [query, setQuery] = React.useState('')
          const [candidate, setCandidate] = React.useState(null)
          const [error, setError] = React.useState(null)
          const [message, setMessage] = React.useState('')
          const button = React.useRef(null)
          const popup = React.useRef(null)
          const search = React.useRef(null)
          const mounted = React.useRef(true)
          React.useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
          const readonly = panel?.worktree.blocker === 'read-only'
          const state = panel?.checkout
          const branch = state?.state === 'ready' ? state.checkout.branch : null
          const label = branch ?? t('detached')
          const rows = (listed?.branches ?? []).filter(name => name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
          const close = () => { popup.current?.hidePopover(); button.current?.focus() }
          async function load() {
            setLoading(true); setError(null); setListed(null); setCandidate(null)
            try {
              const result = await request(props.sessionId, { action: 'list' })
              if (mounted.current) setListed(result)
            } catch (failure) { if (mounted.current) setError(failure.message) }
            finally { if (mounted.current) setLoading(false) }
          }
          function show() {
            if (popup.current.matches(':popover-open')) { close(); return }
            const rect = button.current.getBoundingClientRect()
            const width = Math.min(360, window.innerWidth - 24)
            popup.current.style.left = `${Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))}px`
            popup.current.style.top = `${Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - 440))}px`
            popup.current.showPopover()
            search.current?.focus()
            setQuery(''); setMessage('')
            void load()
          }
          async function switchBranch() {
            if (!candidate || !listed || pending) return
            setPending(true); setError(null)
            try {
              const result = await request(props.sessionId, { action: 'switch', branch: candidate, root: listed.root, current: listed.current })
              // Re-read the native panel, so both this seat and the later worktree base use Git's answer.
              await ctx.remote.forgePanel.refresh(props.sessionId)
              if (mounted.current) { setMessage(tf('changed', result.current)); close() }
            } catch (failure) { if (mounted.current) setError(failure.message) }
            finally { if (mounted.current) setPending(false) }
          }
          async function worktree() {
            setPending(true); setError(null)
            try { await props.request(branch) }
            catch (failure) { if (mounted.current) setError(failure.message) }
            finally { if (mounted.current) setPending(false) }
          }
          function keys(event) {
            if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
            const buttons = [...popup.current.querySelectorAll('[data-dbs-branch]')]
            if (!buttons.length) return
            const index = buttons.indexOf(document.activeElement)
            const next = index < 0 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1)
              : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
            event.preventDefault(); buttons[next].focus()
          }
          // Keep the shipped base selector, withdrawal and creation behavior once requested.
          if (panel?.worktree.request || panel?.worktree.creation) return h(props.original, props)
          if (!panel?.worktree.editable || panel.worktree.blocker === 'not-git' || state?.state !== 'ready') return null
          const worktreeBlocked = panel.worktree.blocker !== null
          return h('span', { className: 'dbs-root', 'data-branch-switcher': '' },
            h('style', null, CSS),
            h('button', { ref: button, type: 'button', className: 'dbs-chip', disabled: pending || readonly,
              'aria-label': `${t('switch')}: ${label}`, title: readonly ? t('readonly') : `${t('switch')}: ${label}`, 'aria-haspopup': 'dialog', onClick: show },
            h(BranchIcon), h('span', { className: 'dbs-label' }, label), h('span', { 'aria-hidden': true }, '⌄')),
            h('label', { className: 'dbs-toggle', title: worktreeBlocked ? props.t(`worktree.blocked.${panel.worktree.blocker}`) : t('worktreeHint') },
              h('input', { type: 'checkbox', checked: false, disabled: pending || worktreeBlocked, onChange: () => void worktree() }), t('worktree')),
            h('span', { role: 'status', className: 'dbs-status' }, message),
            h('div', { ref: popup, popover: 'auto', role: 'dialog', 'aria-label': t('switch'), className: 'dbs-pop', onKeyDown: keys },
              h('div', { className: 'dbs-heading' }, t('switch'), h('button', { type: 'button', className: 'dbs-btn', 'aria-label': t('close'), onClick: close }, '×')),
              h('input', { ref: search, type: 'search', className: 'dbs-search', placeholder: t('search'), 'aria-label': t('search'), value: query, disabled: pending,
                onChange: event => { setQuery(event.target.value); setCandidate(null) },
                onKeyDown: event => { if (event.key === 'Enter' && rows[0]) { event.preventDefault(); setCandidate(rows[0]) } } }),
              h('div', { className: 'dbs-list', 'aria-busy': loading || pending },
                loading ? h('p', { className: 'dbs-hint', role: 'status' }, t('loading')) : rows.map(name => h('button', {
                  key: name, type: 'button', className: 'dbs-row', title: name, 'data-dbs-branch': '', 'aria-pressed': candidate === name,
                  disabled: pending, onClick: () => setCandidate(name),
                }, h('span', { className: 'dbs-name' }, name), name === listed.current ? h('span', { className: 'dbs-note' }, t('current')) : null)),
                !loading && listed && !rows.length ? h('p', { className: 'dbs-hint' }, t('empty')) : null),
              error ? h('p', { className: 'dbs-error', role: 'alert' }, error) : null,
              h('p', { className: 'dbs-hint' }, readonly ? t('readonly') : t('hint')),
              h('p', { className: 'dbs-hint dbs-small' }, t('local')),
              h('div', { className: 'dbs-actions' },
                error ? h('button', { type: 'button', className: 'dbs-btn', disabled: pending || loading, onClick: () => void load() }, t('retry')) : null,
                h('button', { type: 'button', className: 'dbs-btn dbs-primary', disabled: !candidate || candidate === listed?.current || pending || readonly,
                  title: candidate ? tf('choose', candidate) : undefined, onClick: () => void switchBranch() }, pending ? t('switching') : t('switch')))))
        }
        ctx.slots.inject(SLOT, () => {
          let dispose
          let base
          const sync = () => {
            const next = ctx.slots.entries(SLOT).find(entry => entry.options.id === ENTRY && entry.component !== BranchSeat)
            if (next === base) return
            dispose?.(); dispose = undefined; base = next
            if (!base) return
            const original = base.component
            dispose = ctx.slots.register({
              name: SLOT, id: ENTRY, priority: -10, order: base.options.order,
              locale: base.locale, inject: sessionId => ({ ...base.inject(sessionId), original }),
            }, BranchSeat)
          }
          const unsubscribe = ctx.slots.subscribe(SLOT, sync)
          sync()
          return () => { unsubscribe(); dispose?.() }
        })
      },
    }
  },
})
