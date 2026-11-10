/**
 * dsh-git-changes — browser-only plugin.
 *
 * Adds one entry below the composer, beside the shipped activity and usage
 * pills: the checked-out branch, the added and deleted lines and the number of
 * changed files. Clicking it opens the forge panel's Local changes tab in the
 * right Sidebar.
 *
 * The numbers come from the forge panel's own Remote stream
 * (`forgePanel.follow`), so the plugin runs no Git and stays inactive in
 * profiles without `@deepseek-ai/dsh-experimental-forge-bundle`.
 */
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
    // Lower renders first; the forge body registers at the default 0.
    const TAB_PRIORITY = -10
    const WRAP_RETRY_MS = 100
    const WRAP_TRIES = 100
    // The forge panel's changes view: `dsh-resource://forge-changes/<session>/local`.
    const localAddress = sessionId => `dsh-resource://forge-changes/${encodeURIComponent(sessionId)}/local`

    const CSS_TEXT = `
.dgc-anchor{min-width:0;display:inline-flex;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px))}
.dgc-pill{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:100%;margin:0;padding:1px 8px;border:none;border-radius:var(--dsw-radius-sm);
  background:0 0;color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;cursor:pointer}
.dgc-pill svg{flex:none;width:14px;height:14px}
@media (hover:hover){.dgc-pill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}
.dgc-pill:focus-visible{outline:1.5px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dgc-branch{min-width:0;max-width:160px;overflow:hidden;text-overflow:ellipsis}
.dgc-sep{color:var(--dsw-alias-separator-primary,var(--dsw-alias-label-caption))}
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
        detached: 'Detached',
        open: 'Open changes in the side panel',
        scope: 'Uncommitted, including untracked files',
      },
      zh: {
        files: '{n} 个文件',
        file: '1 个文件',
        clean: '无改动',
        detached: '游离 HEAD',
        open: '在右侧打开变更',
        scope: '未提交，含未跟踪文件',
      },
    }

    /** Sum the added and deleted lines of a file list. */
    function totals(files) {
      if (files === null || files === undefined) return null
      let additions = 0
      let deletions = 0
      for (const file of files) { additions += file.additions; deletions += file.deletions }
      return { additions, deletions, files: files.length }
    }

    /**
     * What a change to the uncommitted totals must also change in the panel
     * frame: the checked-out commit (a commit empties them) and the Branch
     * summary (it covers the working tree).
     */
    function trigger(panel) {
      if (panel === null || panel.checkout?.state !== 'ready') return null
      const { checkout } = panel.checkout
      const local = panel.local === null ? '' : panel.local.files.map(f => `${f.path}:${f.additions}:${f.deletions}`).join('|')
      return `${checkout.root}\n${checkout.branch}\n${checkout.commit}\n${local}`
    }

    /**
     * Follow one Session's forge panel state while mounted; reopen after a
     * connection reset.
     */
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

    /** Read the Uncommitted scope again whenever the trigger moves, debounced. */
    function createUncommitted(ctx) {
      return function useUncommitted(sessionId, key) {
        const [files, setFiles] = React.useState(null)
        React.useEffect(() => {
          if (sessionId === undefined || key === null) { setFiles(null); return undefined }
          const controller = new AbortController()
          const timer = setTimeout(async () => {
            try {
              const result = await ctx.remote.forgePanel.localDiff(sessionId, { kind: 'uncommitted' }, controller.signal)
              if (controller.signal.aborted) return
              const value = result && typeof result === 'object' && 'ok' in result ? (result.ok ? result.value : null) : result
              setFiles(value?.files ?? null)
            } catch (error) {
              if (!controller.signal.aborted) {
                console.warn('[dsh-git-changes] uncommitted diff failed:', error)
                setFiles(null)
              }
            }
          }, DEBOUNCE_MS)
          return () => { clearTimeout(timer); controller.abort() }
        }, [sessionId, key])
        return files
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
          const uncommitted = useUncommitted(sessionId, trigger(panel))
          if (panel === null || panel.checkout?.state !== 'ready') return null
          const { checkout } = panel.checkout
          const branch = checkout.branch ?? (checkout.commit ? checkout.commit.slice(0, 7) : t('detached'))
          const sum = totals(uncommitted)
          const parts = []
          if (sum === null || sum.files === 0) {
            parts.push(h('span', { key: 'clean' }, t('clean')))
          } else {
            parts.push(
              h('span', { key: 'a', className: 'dgc-add' }, `+${sum.additions}`),
              h('span', { key: 'd', className: 'dgc-del' }, `−${sum.deletions}`),
              h('span', { key: 's', className: 'dgc-sep', 'aria-hidden': true }, '·'),
              h('span', { key: 'f' }, sum.files === 1 ? t('file') : t('files').replace('{n}', String(sum.files))),
            )
          }
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
        }, GitChangesPill))

        // The forge changes tab seeds every new tab with the Branch scope and
        // offers no setting for it. Wrap its body: render the forge component
        // unchanged and, once per new Local changes tab, choose Uncommitted.
        if (typeof ctx.slots.entries !== 'function') return
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
        // The forge body may register into the same declaration after this
        // callback runs, so wait for it briefly instead of giving up.
        ctx.slots.inject(TAB_SLOT, () => {
          let dispose = () => {}
          let timer
          let tries = 0
          let stopped = false
          const attempt = () => {
            if (stopped) return
            const base = baseEntry(UncommittedFirst)
            if (base === undefined) {
              if (++tries < WRAP_TRIES) timer = setTimeout(attempt, WRAP_RETRY_MS)
              else console.warn('[dsh-git-changes] forge changes tab not found; it keeps its Branch default')
              return
            }
            // A stored entry keeps only key/id/order/label/priority under
            // `options`; its store, inject face and locale sit on the entry.
            // Reusing the minted store handle gives the wrapped body the same
            // `useStore`/`actions` props forge's own registration supplies.
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
          attempt()
          return () => { stopped = true; clearTimeout(timer); dispose() }
        })
      },
      _internal: { totals, localAddress },
    }
  },
})
