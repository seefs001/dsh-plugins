window.__ModuleLoader__.load({
  id: 'dsh-paseo-hub',
  factory(require) {
    const React = require('react')
    const {
      DisclosureRow, TextShimmer,
      IconApiOutlineRegular, IconInspectOutlineRegular, IconPlayOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'paseo-hub'
    const PANEL_ID = 'paseo-hub'

    const EN = {
      panel: 'Paseo Hub',
      loading: 'Loading…',
      loadFailed: 'Could not load Paseo Hub',
      tvRead: 'Paseo Hub',
      tvWrite: 'Paseo Hub write',
      tvStopped: 'Stopped',
      tvInspect: 'Inspect',
      tvInput: 'IN',
      tvOutput: 'OUT',
    }

    const ZH = {
      panel: 'Paseo Hub',
      loading: '正在加载…',
      loadFailed: '加载 Paseo Hub 页面失败',
      tvRead: 'Paseo Hub',
      tvWrite: 'Paseo Hub 写入',
      tvStopped: '已中止',
      tvInspect: '查看',
      tvInput: '输入',
      tvOutput: '输出',
    }

    const TV_CSS = `
.ph-tv{display:flex;flex-direction:column}
.ph-tv-row{min-width:0}
.ph-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.ph-tv-summary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.ph-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.ph-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.ph-tv-body{display:flex;flex-direction:column;min-width:0}
.ph-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.ph-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.ph-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.ph-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.ph-tv-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.ph-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.ph-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.ph-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.ph-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.ph-tv-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.ph-tv:hover .ph-tv-inspect{opacity:1}.ph-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.ph-tv-inspect{opacity:1}}
`

    const IconHub = ({ size = 16 }) => h('svg', {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true,
    },
    h('circle', { cx: 6.5, cy: 6.5, r: 2.5 }),
    h('circle', { cx: 17.5, cy: 6.5, r: 2.5 }),
    h('circle', { cx: 12, cy: 17, r: 3 }),
    h('path', { d: 'M8 8.5l2.6 5.6M16 8.5l-2.6 5.6' }))

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'paseo-hub: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'paseo-hub: zh')
        const styleRef = { tv: null, page: null }
        const cleanups = []
        const ensureTvStyles = () => {
          if (styleRef.tv || typeof document === 'undefined' || !document.head) return
          styleRef.tv = document.createElement('style')
          styleRef.tv.textContent = TV_CSS
          document.head.append(styleRef.tv)
        }
        ctx.effect(() => () => {
          styleRef.tv?.remove()
          styleRef.tv = null
          styleRef.page?.remove()
          styleRef.page = null
          while (cleanups.length) cleanups.pop()?.()
        }, 'paseo-hub: styles')
        const t = ctx.locale.bind(NS)

        function parseHubCall(phase, block) {
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
          const failed = settled && (block.isError || payload?.ok === false)
          const state = phase === 'preparing' ? 'preparing'
            : !settled ? 'running'
              : block.error?.code === 'interrupted' ? 'stopped'
                : failed ? 'error' : 'ok'
          return { state, action, args, payload, text }
        }

        function hubSummary(parsed) {
          if (parsed.state === 'error') {
            return parsed.payload?.message || parsed.payload?.error || parsed.text.split('\n')[0] || ''
          }
          const { args, payload } = parsed
          const parts = []
          const target = args.trigger || args.name || args.triggerId || args.projectSlug || args.query
          if (typeof target === 'string' && target) parts.push(target)
          if (payload && typeof payload === 'object') {
            if (typeof payload.triggerRunId === 'string') parts.push(`run ${payload.triggerRunId.slice(0, 8)}`)
            else if (typeof payload.path === 'string') parts.push(payload.path)
            else if (typeof payload.total === 'number') parts.push(`${payload.total}`)
            else if (Array.isArray(payload.items)) parts.push(`${payload.items.length}`)
            else if (typeof payload.valid === 'boolean') parts.push(payload.valid ? 'valid' : 'invalid')
            else if (typeof payload.configured === 'boolean') parts.push(payload.configured ? 'configured' : 'unconfigured')
          }
          return parts.join(' · ')
        }

        function HubToolRow({ toolName, phase, block, inspect, useDisclosure }) {
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(ensureTvStyles, [])
          const { expanded, toggle } = useDisclosure()
          const parsed = parseHubCall(phase, block)
          const running = parsed.state === 'preparing' || parsed.state === 'running'
          const write = toolName === 'paseo_hub_write'
          const detail = parsed.state === 'stopped' ? t('tvStopped') : hubSummary(parsed)
          const summary = parsed.state === 'error' || parsed.state === 'stopped' ? detail : [parsed.action, detail].filter(Boolean).join(' · ')
          const inputText = Object.keys(parsed.args).length > 0 ? JSON.stringify(parsed.args, null, 2) : ''
          const outputText = parsed.payload !== null ? JSON.stringify(parsed.payload, null, 2) : parsed.text
          const expandable = parsed.state !== 'preparing' && Boolean(inputText || outputText)
          const open = expanded && expandable
          return h('div', { className: 'ph-tv', 'data-tool': toolName, 'data-state': parsed.state },
            h(DisclosureRow, {
              rowClassName: 'ph-tv-row',
              icon: write ? h(IconPlayOutlineRegular, { size: 14 }) : h(IconApiOutlineRegular, { size: 14 }),
              title: t(write ? 'tvWrite' : 'tvRead'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: parsed.state === 'preparing' || !summary ? null : h(React.Fragment, null,
                h('span', { className: 'ph-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `ph-tv-summary${parsed.state === 'error' ? ' is-err' : parsed.state === 'stopped' ? ' is-stop' : ''}` },
                  h(TextShimmer, null, summary))),
            },
            open ? h('div', { className: 'ph-tv-body' },
              h('div', { className: 'ph-tv-io' },
                inputText ? h('div', { className: 'ph-tv-io-sec' },
                  h('span', { className: 'ph-tv-io-label' }, t('tvInput')),
                  h('span', { className: 'ph-tv-io-text' }, inputText)) : null,
                inputText && outputText ? h('span', { className: 'ph-tv-io-div', 'aria-hidden': true }) : null,
                outputText ? h('div', { className: 'ph-tv-io-sec' },
                  h('span', { className: 'ph-tv-io-label' }, t('tvOutput')),
                  h('span', { className: 'ph-tv-io-text', 'data-error': parsed.state === 'error' || undefined }, outputText)) : null),
              inspect ? h('button', { type: 'button', className: 'ph-tv-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('tvInspect')) : null) : null))
        }

        let PageComp = null
        let pagePromise = null
        const listeners = new Set()
        const initPage = mod => {
          if (!PageComp) {
            const built = mod.createHubPage(ctx, styleRef, IconHub)
            PageComp = built.HubPage
            if (typeof built.dispose === 'function') cleanups.push(built.dispose)
          }
          return PageComp
        }
        const loadPage = () => {
          if (PageComp) return Promise.resolve(PageComp)
          if (!pagePromise && typeof require.async === 'function') {
            pagePromise = require.async('./client.page.js').then(mod => {
              const comp = initPage(mod)
              for (const fn of listeners) fn()
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
            listeners.add(onReady)
            if (!PageComp) loadPage()?.catch(e => setErr(e?.message || t('loadFailed')))
            return () => { listeners.delete(onReady) }
          }, [])
          if (PageComp) return h(PageComp, props)
          if (err) return h('div', { style: { padding: 24, color: 'var(--dsw-alias-state-error-primary)' } }, err)
          return h('div', { style: { padding: 24, color: 'var(--dsw-alias-label-secondary)' } }, t('loading'))
        }
        function LazyHubPage(props) {
          if (typeof require.syncChunk === 'function') {
            return initPage(require.syncChunk('./client.page.js'))(props)
          }
          return PageComp ? h(PageComp, props) : h(PageLoader, props)
        }

        for (const key of ['paseo_hub', 'paseo_hub_write']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview', key, locale: NS, priority: -10,
          }, HubToolRow))
        }

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, LazyHubPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 45, locale: NS, label: () => t('panel'),
        }, ({ size }) => h(IconHub, { size: size ?? 16 })))
      },
    }
  },
})
