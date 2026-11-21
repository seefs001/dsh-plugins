window.__ModuleLoader__.load({
  id: 'dsh-git-changes',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'gitChanges'
    const SLOT = 'conversation.composer.dock'
    const DEBOUNCE_MS = 400
    const TAB_SLOT = 'sidebar.right.pane.tab'
    const CHANGES_ID = '@deepseek-ai/dsh-experimental-client-ui-forge/changes'
    const TAB_PRIORITY = -10
    const localAddress = sessionId => `dsh-resource://forge-changes/${encodeURIComponent(sessionId)}/local`

    const CSS_TEXT = `
.dgc-anchor{min-width:0;display:inline-flex;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px))}
.dgc-pill{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:100%;margin:0;padding:1px 8px;border:none;border-radius:var(--dsw-radius-sm);
  background:0 0;color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;cursor:pointer}
.dgc-pill svg{flex:none;width:14px;height:14px}
@media (hover:hover){.dgc-pill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}
.dgc-pill:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dgc-branch{min-width:0;max-width:160px;overflow:hidden;text-overflow:ellipsis}
.dgc-sep{color:var(--dsw-alias-label-caption)}
.dgc-add{color:var(--dsw-alias-state-success-primary)}
.dgc-del{color:var(--dsw-alias-state-error-primary)}
`

    const IconBranch = () => h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', 'aria-hidden': true },
      h('circle', { cx: 4.5, cy: 3.5, r: 1.5 }),
      h('circle', { cx: 4.5, cy: 12.5, r: 1.5 }),
      h('circle', { cx: 11.5, cy: 5.5, r: 1.5 }),
      h('path', { d: 'M4.5 5v6M11.5 7c0 2.5-2.5 3-5 3.5' }))

    const DICTS = {
      en: {
        files: '{n} files',
        file: '1 file',
        clean: 'No changes',
        loading: 'Reading changes…',
        unavailable: 'Diff unavailable',
        omitted: '{n} more untracked',
        detached: 'Detached',
        open: 'Open changes in the side panel',
        scope: 'Uncommitted, including untracked files',
      },
      zh: {
        files: '{n} 个文件',
        file: '1 个文件',
        clean: '无改动',
        loading: '正在读取改动…',
        unavailable: '无法读取差异',
        omitted: '另有 {n} 个未跟踪文件',
        detached: '游离 HEAD',
        open: '在右侧打开变更',
        scope: '未提交，含未跟踪文件',
      },
    }

    function totals(files, omitted = 0) {
      if (files === null || files === undefined) return null
      let additions = 0
      let deletions = 0
      for (const file of files) { additions += file.additions; deletions += file.deletions }
      return { additions, deletions, files: files.length, omitted }
    }

    function trigger(panel) {
      if (panel === null || panel.checkout?.state !== 'ready') return null
      const { checkout } = panel.checkout
      const local = panel.local === null ? '' : panel.local.files.map(f => `${f.path}:${f.additions}:${f.deletions}`).join('|')
      return `${checkout.root}\n${checkout.branch}\n${checkout.commit}\n${local}`
    }

    function createFollower(ctx) {
      return function usePanel(sessionId) {
        const [state, setState] = React.useState(null)
        const [generation, setGeneration] = React.useState(0)
        React.useEffect(() => ctx.on('connection/reset', () => setGeneration(n => n + 1)), [])
        React.useEffect(() => {
          if (sessionId === undefined) return undefined
          const controller = new AbortController()
          let stream
          try {
            stream = ctx.remote.forgePanel.follow(sessionId, controller.signal)
          } catch (error) {
            console.warn('[dsh-git-changes] cannot follow the forge panel:', error)
            return undefined
          }
          ;(async () => {
            try {
              for await (const frame of stream) {
                if (controller.signal.aborted) return
                setState(frame)
              }
            } catch {}
          })()
          return () => {
            controller.abort()
            stream?.dispose?.()
          }
        }, [sessionId, generation])
        return state
      }
    }

    function createUncommitted(ctx) {
      return function useUncommitted(sessionId, key) {
        const [summary, setResult] = React.useState(null)
        React.useEffect(() => {
          if (sessionId === undefined || key === null) { setResult(null); return undefined }
          const controller = new AbortController()
          const timer = setTimeout(async () => {
            try {
              const result = await ctx.remote.forgePanel.localDiff(sessionId, { kind: 'uncommitted' }, controller.signal)
              if (controller.signal.aborted) return
              const value = result?.ok ? result.value : null
              setResult({ key, sum: totals(value?.files, value?.omitted) })
            } catch (error) {
              if (!controller.signal.aborted) {
                console.warn('[dsh-git-changes] uncommitted diff failed:', error)
                setResult({ key, sum: null })
              }
            }
          }, DEBOUNCE_MS)
          return () => { clearTimeout(timer); controller.abort() }
        }, [sessionId, key])
        return summary?.key === key ? summary.sum : undefined
      }
    }

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'remote', 'remote.forgePanel'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dict), `git-changes: ${lang}`)
        }
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-git-changes'
          style.textContent = CSS_TEXT
          document.head.appendChild(style)
          return () => style.remove()
        }, 'git-changes: styles')

        const usePanel = createFollower(ctx)
        const useUncommitted = createUncommitted(ctx)
        const open = sessionId => {
          try {
            ctx.sidebarRight.openResource(localAddress(sessionId))
          } catch (error) {
            console.error('[dsh-git-changes] open changes failed:', error)
          }
        }

        function GitChangesPill({ sessionId, t }) {
          const panel = usePanel(sessionId)
          const sum = useUncommitted(sessionId, trigger(panel))
          if (panel === null || panel.checkout?.state !== 'ready') return null
          const { checkout } = panel.checkout
          const branch = checkout.branch ?? (checkout.commit ? checkout.commit.slice(0, 7) : t('detached'))
          const parts = []
          if (sum == null) {
            parts.push(h('span', { key: 'state' }, t(sum === undefined ? 'loading' : 'unavailable')))
          } else if (sum.files === 0 && sum.omitted === 0) {
            parts.push(h('span', { key: 'clean' }, t('clean')))
          } else {
            parts.push(
              h('span', { key: 'a', className: 'dgc-add' }, `+${sum.additions}`),
              h('span', { key: 'd', className: 'dgc-del' }, `−${sum.deletions}`),
              h('span', { key: 's', className: 'dgc-sep', 'aria-hidden': true }, '·'),
              h('span', { key: 'f' }, sum.files === 1 ? t('file') : t('files').replace('{n}', String(sum.files))),
            )
          }
          if (sum?.omitted > 0) parts.push(h('span', { key: 'omitted' }, t('omitted').replace('{n}', String(sum.omitted))))
          return h('span', { className: 'dgc-anchor', 'data-git-changes': true },
            h('button', {
              type: 'button',
              className: 'dgc-pill',
              title: `${t('open')} (${t('scope')})`,
              onClick: () => open(sessionId),
            },
            h(IconBranch),
            h('span', { className: 'dgc-branch' }, branch),
            ...parts))
        }

        ctx.slots.inject(SLOT, () => ctx.slots.register({
          name: SLOT,
          id: 'git-changes',
          order: 2,
          locale: NS,
        }, props => h(GitChangesPill, { ...props, key: props.sessionId })))

        // external: DSH forge changes tab defaults to Branch scope with no setting
        const seeded = new Set()
        const baseEntry = self => {
          let best
          for (const entry of ctx.slots.entries(TAB_SLOT)) {
            if (entry.options?.key !== CHANGES_ID || entry.component === self) continue
            const priority = entry.options.priority ?? 0
            if (priority <= TAB_PRIORITY) continue
            if (best === undefined || priority < (best.options.priority ?? 0)) best = entry
          }
          return best
        }
        function UncommittedFirst(props) {
          const { useTabInfo, useStore, actions } = props
          const { tab } = useTabInfo()
          const choices = useStore(store => store.byTab?.[tab.id])
          const local = typeof tab.contentId === 'string' && tab.contentId.endsWith('/local')
          React.useEffect(() => {
            if (!local || choices === undefined) return
            const id = `${props.sessionId}:${tab.id}`
            if (seeded.has(id)) return
            seeded.add(id)
            if (choices.scope === 'branch') actions.scoped(tab.id, 'uncommitted')
          }, [local, choices, tab.id])
          const base = baseEntry(UncommittedFirst)
          return base === undefined ? null : h(base.component, props)
        }
        ctx.slots.inject(TAB_SLOT, () => {
          let dispose
          let base
          const sync = () => {
            const next = baseEntry(UncommittedFirst)
            if (next === base) return
            dispose?.()
            dispose = undefined
            base = next
            if (!base) return
            // external: DSH slot entries store locale, inject, and store on the entry rather than options
            const options = { name: TAB_SLOT, key: CHANGES_ID, priority: TAB_PRIORITY }
            if (base.locale !== undefined) options.locale = base.locale
            if (base.inject !== undefined) options.inject = base.inject
            if (base.store !== undefined) options.store = base.store
            try {
              dispose = ctx.slots.register(options, UncommittedFirst)
            } catch (error) {
              console.warn('[dsh-git-changes] cannot default the changes tab to Uncommitted:', error)
            }
          }
          const unsubscribe = ctx.slots.subscribe(TAB_SLOT, sync)
          sync()
          return () => { unsubscribe(); dispose?.() }
        })
      },
      _internal: { totals, localAddress },
    }
  },
})
