window.__ModuleLoader__.load({
  id: 'dsh-branch-switcher',
  factory(require) {
    const React = require('react')
    const {
      DisclosureRow, JsonBlock, Tag, TextShimmer,
      IconBranchOutlineRegular, IconInspectOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'branchSwitcher'
    const SLOT = 'conversation.hero.options'
    const ENTRY = 'forge-panel.worktree'
    const EN = {
      switch: 'Switch branch', search: 'Search local branches', loading: 'Loading branches…', switching: 'Switching branch…',
      current: 'Current', detached: 'Detached HEAD', empty: 'No matching local branches.', retry: 'Retry', close: 'Close',
      hint: 'Switches the branch in this working directory (other sessions sharing it also change). Git blocks switches with conflicting uncommitted changes.',
      local: 'Existing local branches only.',
      worktree: 'New worktree', worktreeHint: 'Create an isolated checkout when the first message is sent.',
      readonly: 'Branch switching is unavailable in read-only mode.',
      refreshFailed: 'Switched branches, though the panel failed to refresh:', changed: 'Switched to {branch}', choose: 'Switch to {branch}',
      tvTitle: 'Branch switcher', tvStopped: 'Stopped', tvInspect: 'Inspect', tvResult: 'Result', tvCount: '{n} branches',
    }
    const ZH = {
      switch: '切换分支', search: '搜索本地分支', loading: '正在加载分支…', switching: '正在切换分支…',
      current: '当前', detached: '游离 HEAD', empty: '没有匹配的本地分支。', retry: '重试', close: '关闭',
      hint: '会切换当前目录的分支，共用同一目录的其他会话也会同步变更。未提交改动有冲突时 Git 会阻止切换。',
      local: '仅切换已有本地分支。',
      worktree: '新建工作树', worktreeHint: '发送首条消息时创建独立工作目录。',
      readonly: '只读模式下不能切换分支。',
      refreshFailed: '分支已切换，但面板刷新失败：', changed: '已切换到 {branch}', choose: '切换到 {branch}',
      tvTitle: '切换分支', tvStopped: '已中止', tvInspect: '查看', tvResult: '结果', tvCount: '{n} 个分支',
    }
    const CSS = `
.dbs-root{display:inline-flex;flex:none;align-items:center;gap:2px;min-width:0}
.dbs-chip,.dbs-toggle{display:inline-flex;align-items:center;gap:6px;min-width:0;height:28px;padding:0 8px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;font-weight:500;line-height:20px;white-space:nowrap;cursor:pointer}
.dbs-chip{max-width:200px}.dbs-chip svg{width:14px;height:14px;flex:none}.dbs-label{overflow:hidden;text-overflow:ellipsis;min-width:0}
.dbs-toggle input{width:14px;height:14px;flex:none;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:inherit}
.dbs-chip:disabled,.dbs-toggle:has(input:disabled){color:var(--dsw-alias-label-dimmed);cursor:default}
.dbs-chip:focus-visible,.dbs-toggle:has(input:focus-visible),.dbs-pop button:focus-visible,.dbs-search:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dbs-toggle input:focus-visible{outline:none}
.dbs-pop{box-sizing:border-box;position:fixed;inset:auto;margin:0;width:min(360px,calc(100vw - 24px));max-height:calc(100dvh - 24px);padding:8px;border:0;border-radius:var(--dsw-radius-lg,16px);background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-2));backdrop-filter:var(--dsw-menu-backdrop-filter);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);color:var(--dsw-alias-label-primary);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);font:inherit;font-size:13px;text-align:left;overflow:auto}
.dbs-pop::backdrop{background:transparent}
.dbs-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 4px 8px;font-weight:500}
.dbs-search{box-sizing:border-box;width:100%;height:32px;margin:0 0 6px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:inherit;font:inherit}
.dbs-list{max-height:240px;overflow:auto;overscroll-behavior:contain}
.dbs-row{display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:6px 10px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dbs-row[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active)}
.dbs-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px}
.dbs-note{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px}.dbs-hint{margin:8px 4px 4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6;overflow-wrap:anywhere;white-space:normal}
.dbs-small{color:var(--dsw-alias-label-tertiary);font-size:11px}
.dbs-error{margin:8px 4px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.dbs-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:10px;padding-top:8px;border-top:.5px solid var(--dsw-alias-border-l1)}
.dbs-btn{display:inline-flex;align-items:center;justify-content:center;height:30px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;font-size:13px;cursor:pointer}
.dbs-btn:not(.dbs-close){border-radius:999px;corner-shape:round}
.dbs-close{width:26px;height:26px;padding:0;border:0;color:var(--dsw-alias-label-secondary)}
.dbs-primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);border-color:transparent}.dbs-btn:disabled{opacity:.45;cursor:default}
.dbs-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@media(hover:hover){.dbs-chip:hover:not(:disabled),.dbs-toggle:hover:not(:has(input:disabled)),.dbs-row:hover:not(:disabled),.dbs-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dbs-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media(pointer:coarse){.dbs-search{font-size:16px}}
@media(max-width:600px){.dbs-root{flex-direction:column;align-items:flex-end;gap:0}.dbs-chip{max-width:120px}}
.dbs-tv{display:flex;flex-direction:column}
.dbs-tv-row{min-width:0}
.dbs-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.dbs-tv-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.dbs-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.dbs-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.dbs-tv-tag{flex:none;margin-left:6px}
.dbs-tv-body{display:flex;flex-direction:column;gap:6px;margin:4px 0 4px 4px}
.dbs-tv-pre{margin:0;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-markdown-code-block-small,12px/18px monospace);white-space:pre-wrap;overflow-wrap:anywhere;max-height:240px;overflow:auto}
.dbs-tv-pre[data-error]{color:var(--dsw-alias-state-error-primary)}
.dbs-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity .1s}
.dbs-tv-inspect:focus-visible{opacity:1}
@media(hover:hover){.dbs-tv:hover .dbs-tv-inspect{opacity:1}.dbs-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media(hover:none){.dbs-tv-inspect{opacity:1}}
`
    function BranchIcon() {
      return h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, 'aria-hidden': true },
        h('circle', { cx: 4, cy: 3, r: 1.5 }), h('circle', { cx: 4, cy: 13, r: 1.5 }),
        h('circle', { cx: 12, cy: 4, r: 1.5 }), h('path', { d: 'M4 4.5v7M12 5.5C12 10 4 7 4 11.5' }))
    }
    function ChevronDownIcon() {
      return h('svg', { viewBox: '0 0 14 14', width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M3.5 5.25 7 8.75l3.5-3.5' }))
    }
    function CloseIcon() {
      return h('svg', { viewBox: '0 0 14 14', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', 'aria-hidden': true },
        h('path', { d: 'M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5' }))
    }
    return {
      inject: ['slots', 'locale', 'remote', 'remote.forgePanel'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN))
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH))
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        })
        const t = ctx.locale.bind(NS)
        const tf = (key, branch) => t(key).replace('{branch}', () => branch)
        async function request(sessionId, args, signal) {
          const response = await fetch('branch-switcher/op', {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ ...args, sessionId }),
            signal,
          })
          let data
          try { data = await response.json() } catch { throw new Error(`HTTP ${response.status}`) }
          if (!response.ok || !data?.ok) throw new Error(data?.message || `HTTP ${response.status}`)
          return data.value
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
          const latestList = React.useRef(0)
          const listAbort = React.useRef(null)
          const mounted = React.useRef(true)
          React.useEffect(() => {
            mounted.current = true
            return () => {
              mounted.current = false
              listAbort.current?.abort()
            }
          }, [])
          const readonly = panel?.worktree.blocker === 'read-only'
          const state = panel?.checkout
          const branch = state?.state === 'ready' ? state.checkout.branch : null
          const label = branch ?? t('detached')
          const rows = (listed?.branches ?? []).filter(name => name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
          const close = () => { popup.current?.hidePopover(); button.current?.focus() }
          async function load() {
            const id = ++latestList.current
            const active = () => mounted.current && latestList.current === id
            listAbort.current?.abort()
            const controller = new AbortController()
            listAbort.current = controller
            setLoading(true); setError(null); setListed(null); setCandidate(null)
            try {
              const result = await request(props.sessionId, { action: 'list' }, controller.signal)
              if (active()) setListed(result)
            } catch (failure) { if (active()) setError(failure.message) }
            finally { if (active()) setLoading(false) }
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
              if (mounted.current) { setListed(null); setCandidate(null) }
              try {
                const refreshed = await ctx.remote.forgePanel.refresh(props.sessionId)
                if (!refreshed.ok) throw new Error(refreshed.error.message)
              } catch (failure) { throw new Error(`${t('refreshFailed')} ${failure.message}`, { cause: failure }) }
              if (mounted.current) { setMessage(tf('changed', result.current)); close() }
            } catch (failure) { if (mounted.current) setError(failure.message) }
            finally { if (mounted.current) setPending(false) }
          }
          async function worktree() {
            setPending(true); setError(null)
            try {
              const result = await props.request(branch ?? null, null)
              if (result && result.ok === false) throw new Error(result.error?.message ?? 'Worktree request failed')
            } catch (failure) { if (mounted.current) setError(failure.message) }
            finally { if (mounted.current) setPending(false) }
          }
          function keys(event) {
            if (event.nativeEvent.isComposing || event.keyCode === 229 || !['ArrowDown', 'ArrowUp'].includes(event.key)) return
            const buttons = [...popup.current.querySelectorAll('[data-dbs-branch]')]
            if (!buttons.length) return
            const index = buttons.indexOf(document.activeElement)
            const next = index < 0 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1)
              : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
            event.preventDefault(); buttons[next].focus()
          }
          if (panel?.worktree.request || panel?.worktree.creation) {
            const { original: Original, ...originalProps } = props
            return h(Original, originalProps)
          }
          if (!panel?.worktree.editable || panel.worktree.blocker === 'not-git' || state?.state !== 'ready') return null
          const worktreeBlocked = panel.worktree.blocker !== null
          return h('span', { className: 'dbs-root', 'data-branch-switcher': '' },
            h('button', { ref: button, type: 'button', className: 'dbs-chip', disabled: pending || readonly,
              'aria-label': `${t('switch')}: ${label}`, title: readonly ? t('readonly') : `${t('switch')}: ${label}`, 'aria-haspopup': 'dialog', onClick: show },
            h(BranchIcon), h('span', { className: 'dbs-label' }, label), h(ChevronDownIcon)),
            h('label', { className: 'dbs-toggle', title: worktreeBlocked ? props.t(`worktree.blocked.${panel.worktree.blocker}`) : t('worktreeHint') },
              h('input', { type: 'checkbox', checked: false, disabled: pending || worktreeBlocked, onChange: () => void worktree() }), t('worktree')),
            h('span', { role: 'status', className: 'dbs-status' }, message),
            h('div', { ref: popup, popover: 'auto', role: 'dialog', 'aria-label': t('switch'), className: 'dbs-pop', onKeyDown: keys },
              h('div', { className: 'dbs-heading' }, t('switch'), h('button', { type: 'button', className: 'dbs-btn dbs-close', 'aria-label': t('close'), onClick: close }, h(CloseIcon))),
              h('input', { ref: search, type: 'search', className: 'dbs-search', placeholder: t('search'), 'aria-label': t('search'), value: query, disabled: pending,
                onChange: event => { setQuery(event.target.value); setCandidate(null) },
                onKeyDown: event => { if (!event.nativeEvent.isComposing && event.keyCode !== 229 && event.key === 'Enter' && rows[0]) { event.preventDefault(); setCandidate(rows[0]) } } }),
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
        function BranchToolRow({ phase, block, inspect, useDisclosure }) {
          const { expanded, toggle } = useDisclosure()
          const settled = phase === 'result' && block && 'kind' in block
          const call = settled ? block.call : block
          let args = {}
          try {
            const parsed = JSON.parse(call?.argsRaw ?? '{}')
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed
          } catch {}
          const text = settled && Array.isArray(block.content)
            ? block.content.filter(item => item.type === 'text').map(item => item.text).join('\n') : ''
          let payload = null
          if (text) { try { payload = JSON.parse(text) } catch {} }
          const action = typeof args.action === 'string' ? args.action : block?.args?.text?.('action') ?? ''
          const state = phase === 'preparing' ? 'preparing'
            : !settled ? 'running'
              : block.error?.code === 'interrupted' ? 'stopped'
                : block.isError ? 'error' : 'ok'
          const running = state === 'preparing' || state === 'running'
          let summary = ''
          if (state === 'stopped') summary = t('tvStopped')
          else if (state === 'error') summary = text.split('\n')[0] || ''
          else if (action === 'switch' && typeof args.branch === 'string') {
            summary = typeof args.current === 'string' && args.current ? `${args.current} → ${args.branch}` : args.branch
          } else if (Array.isArray(payload?.branches)) {
            const count = t('tvCount').replace('{n}', String(payload.branches.length))
            summary = payload.current ? `${payload.current} · ${count}` : count
          }
          const expandable = Boolean(text)
          const open = expanded && expandable
          return h('div', { className: 'dbs-tv', 'data-tool': 'branch_switcher', 'data-state': state },
            h(DisclosureRow, {
              rowClassName: 'dbs-tv-row',
              icon: h(IconBranchOutlineRegular, { size: 14 }),
              title: t('tvTitle'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: state === 'preparing' ? null : h(React.Fragment, null,
                action ? h(Tag, { className: 'dbs-tv-tag', tone: state === 'error' ? 'error' : 'outline' }, action) : null,
                summary ? h(React.Fragment, null,
                  h('span', { className: 'dbs-tv-sep', 'aria-hidden': true }),
                  h('span', { className: `dbs-tv-summary${state === 'error' ? ' is-err' : state === 'stopped' ? ' is-stop' : ''}` },
                    h(TextShimmer, null, summary))) : null),
            },
            open ? h('div', { className: 'dbs-tv-body' },
              payload !== null
                ? h(JsonBlock, { label: t('tvResult'), payload, defaultOpen: true })
                : h('pre', { className: 'dbs-tv-pre', 'data-error': state === 'error' || undefined }, text),
              inspect ? h('button', { type: 'button', className: 'dbs-tv-inspect', onClick: inspect },
                h(IconInspectOutlineRegular, { size: 12 }), t('tvInspect')) : null) : null))
        }

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview', key: 'branch_switcher', locale: NS, priority: -10,
        }, BranchToolRow))

        const SessionSeat = props => h(BranchSeat, { ...props, key: props.sessionId })
        ctx.slots.inject(SLOT, () => {
          let dispose
          let base
          const sync = () => {
            const next = ctx.slots.entries(SLOT).find(entry => entry.options.id === ENTRY && entry.component !== SessionSeat)
            if (next === base) return
            dispose?.(); dispose = undefined; base = next
            if (!base) return
            const original = base.component
            dispose = ctx.slots.register({
              name: SLOT, id: ENTRY, priority: -10, order: base.options.order,
              locale: base.locale, inject: sessionId => ({ ...base.inject(sessionId), original }),
            }, SessionSeat)
          }
          const unsubscribe = ctx.slots.subscribe(SLOT, sync)
          sync()
          return () => { unsubscribe(); dispose?.() }
        })
      },
    }
  },
})
