window.__ModuleLoader__.load({
  id: 'dsh-cheat-sheet',
  factory(require) {
    const React = require('react')
    const {
      DisclosureRow, TextShimmer,
      IconInspectOutlineRegular, IconSkillOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'cheat-sheet'
    const DICTS = {
      en: {
        title: 'Skill cheat sheet',
        loading: 'Loading skills…',
        loadFailed: 'Could not load skills: {message}',
        tvStopped: 'Stopped',
        tvInspect: 'Inspect',
        tvInput: 'IN',
        tvOutput: 'OUT',
        tvPinsCount: '{n} pinned',
        tvPinned: 'pinned',
        tvUnpinned: 'unpinned',
      },
      zh: {
        title: 'Skill 速查表',
        loading: '正在加载 Skill…',
        loadFailed: '无法加载 Skill：{message}',
        tvStopped: '已中止',
        tvInspect: '查看',
        tvInput: '输入',
        tvOutput: '输出',
        tvPinsCount: '{n} 个置顶',
        tvPinned: '已置顶',
        tvUnpinned: '已取消置顶',
      },
    }

    const TRIGGER_CSS = `
.dcs-trigger{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;cursor:pointer;height:28px;padding:0 8px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;font-weight:500;white-space:nowrap;transition:background-color .15s,color .15s}
.dcs-trigger svg{flex:none;width:14px;height:14px}
.dcs-trigger:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media(hover:hover){.dcs-trigger:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
@media(max-width:480px){.dcs-trigger span{display:none}}
`

    const TV_CSS = `
.dcs-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.dcs-tv-summary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.dcs-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.dcs-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.dcs-tv-body{display:flex;flex-direction:column;min-width:0}
.dcs-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.dcs-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.dcs-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.dcs-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.dcs-tv-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.dcs-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.dcs-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.dcs-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.dcs-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.dcs-tv-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media(hover:hover){.dcs-tv:hover .dcs-tv-inspect{opacity:1}.dcs-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media(hover:none){.dcs-tv-inspect{opacity:1}}
`

    const svg = (children, props) => h('svg', { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }, ...children)
    const SheetIcon = () => svg([h('rect', { key: 'r', x: 3.5, y: 2.5, width: 13, height: 15, rx: 2 }), h('path', { key: 'p', d: 'M7 6.5h6M7 10h6M7 13.5h3' })])

    return {
      inject: ['slots', 'locale', 'remote', 'remote.skills'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dict), `cheat-sheet: ${lang}`)
        }
        const styleRef = { tv: null, dialog: null }
        const cleanups = []
        const ensureTvStyles = () => {
          if (styleRef.tv || typeof document === 'undefined' || !document.head) return
          styleRef.tv = document.createElement('style')
          styleRef.tv.textContent = TV_CSS
          document.head.append(styleRef.tv)
        }
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = TRIGGER_CSS
          document.head.append(style)
          return () => {
            style.remove()
            styleRef.tv?.remove()
            styleRef.tv = null
            styleRef.dialog?.remove()
            styleRef.dialog = null
            while (cleanups.length) cleanups.pop()?.()
          }
        }, 'cheat-sheet: styles')

        let SheetComp = null
        let sheetPromise = null
        const listeners = new Set()
        const initSheet = mod => {
          if (!SheetComp) {
            const built = mod.createSheet(ctx, styleRef)
            SheetComp = built.Sheet
            if (typeof built.dispose === 'function') cleanups.push(built.dispose)
          }
          return SheetComp
        }
        const loadSheet = () => {
          if (SheetComp) return Promise.resolve(SheetComp)
          if (!sheetPromise && typeof require.async === 'function') {
            sheetPromise = require.async('./client.page.js').then(mod => {
              const comp = initSheet(mod)
              for (const fn of listeners) fn()
              return comp
            }, err => {
              sheetPromise = null
              throw err
            })
          }
          return sheetPromise
        }
        function SheetLoader(props) {
          const [, setTick] = React.useState(0)
          React.useEffect(() => {
            const onReady = () => setTick(n => n + 1)
            listeners.add(onReady)
            if (!SheetComp) loadSheet()?.catch(() => { props.onDismiss?.() })
            return () => { listeners.delete(onReady) }
          }, [])
          return SheetComp ? h(SheetComp, props) : null
        }
        function Trigger(props) {
          const [open, setOpen] = React.useState(false)
          return h(React.Fragment, null,
            h('button', {
              type: 'button', className: 'dcs-trigger', title: props.t('title'), 'aria-haspopup': 'dialog',
              onClick: () => setOpen(true),
            }, h(SheetIcon), h('span', null, props.t('title'))),
            open ? (SheetComp ? h(SheetComp, { ...props, key: props.sessionId, onDismiss: () => setOpen(false) }) : h(SheetLoader, { ...props, key: props.sessionId, onDismiss: () => setOpen(false) })) : null)
        }

        function CheatSheetToolRow({ phase, block, inspect, useDisclosure, t }) {
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(ensureTvStyles, [])
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
          let detail = ''
          if (state === 'stopped') detail = t('tvStopped')
          else if (state === 'error') detail = text.split('\n')[0] || ''
          else if (typeof args.name === 'string' && args.name) {
            detail = `${args.name}${typeof args.pinned === 'boolean' ? ` · ${t(args.pinned ? 'tvPinned' : 'tvUnpinned')}` : ''}`
          } else if (Array.isArray(payload?.pinned)) {
            detail = t('tvPinsCount', { n: payload.pinned.length })
          }
          const summary = state === 'error' || state === 'stopped' ? detail : [action, detail].filter(Boolean).join(' · ')
          const inputText = Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ''
          const outputText = payload !== null ? JSON.stringify(payload, null, 2) : text
          const expandable = state !== 'preparing' && Boolean(inputText || outputText)
          const open = expanded && expandable
          return h('div', { className: 'dcs-tv', 'data-tool': 'cheat_sheet', 'data-state': state },
            h(DisclosureRow, {
              rowClassName: 'dcs-tv-row',
              icon: h(IconSkillOutlineRegular, { size: 14 }),
              title: t('title'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: state === 'preparing' || !summary ? null : h(React.Fragment, null,
                h('span', { className: 'dcs-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `dcs-tv-summary${state === 'error' ? ' is-err' : state === 'stopped' ? ' is-stop' : ''}` },
                  h(TextShimmer, null, summary))),
            },
            open ? h('div', { className: 'dcs-tv-body' },
              h('div', { className: 'dcs-tv-io' },
                inputText ? h('div', { className: 'dcs-tv-io-sec' },
                  h('span', { className: 'dcs-tv-io-label' }, t('tvInput')),
                  h('span', { className: 'dcs-tv-io-text' }, inputText)) : null,
                inputText && outputText ? h('span', { className: 'dcs-tv-io-div', 'aria-hidden': true }) : null,
                outputText ? h('div', { className: 'dcs-tv-io-sec' },
                  h('span', { className: 'dcs-tv-io-label' }, t('tvOutput')),
                  h('span', { className: 'dcs-tv-io-text', 'data-error': state === 'error' || undefined }, outputText)) : null),
              inspect ? h('button', { type: 'button', className: 'dcs-tv-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('tvInspect')) : null) : null))
        }

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview', key: 'cheat_sheet', locale: NS, priority: -10,
        }, CheatSheetToolRow))

        const listSkills = (sessionId, signal) => ctx.remote.skills.list({ sessionId }, signal)
        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left', id: 'cheat-sheet', order: 80, locale: NS,
          inject: () => ({ listSkills }),
        }, Trigger))
      },
    }
  },
})
