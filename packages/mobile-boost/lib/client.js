window.__ModuleLoader__.load({
  id: 'dsh-mobile-boost',
  factory() {
    const STYLE_ATTR = 'dsh-mobile-boost'
    const CSS = `@media (max-width:768px),(pointer:coarse){
:root,body{--dsw-menu-backdrop-filter:none;--dsw-mask-blur:none;--dsw-specific-menu:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base))}
[data-sidebar-drawer][data-animating]{transition:none!important}
[data-sidebar-drawer][data-sidebar-collapsed] [data-sidebar-list-area]{content-visibility:auto;contain-intrinsic-size:auto 320px}
[data-chat-flow] [data-chat-flow-key]:not([hidden]):not([data-turn-process-hidden]):not([data-chat-motion]):not([data-chat-flow-kind="compaction"]):not(:nth-last-child(-n+4)){content-visibility:auto;contain-intrinsic-size:auto 96px}
[data-chat-flow][data-chat-motion]>*{transition:none!important}
[data-composer-card],[data-composer-input],[data-sidebar-list-area] [data-row-key]{touch-action:manipulation}
[data-composer-card]{box-shadow:0 0 0 .5px var(--dsw-alias-border-l2)}
}`

    function mountStyles(doc = typeof document !== 'undefined' ? document : null) {
      if (!doc?.head) return undefined
      const style = doc.createElement('style')
      style.dataset.plugin = STYLE_ATTR
      style.textContent = CSS
      doc.head.appendChild(style)
      return () => style.remove()
    }

    return {
      inject: [],
      apply(ctx) {
        ctx.effect(() => mountStyles(), 'mobile-boost: styles')
      },
      _internal: { STYLE_ATTR, CSS, mountStyles },
    }
  },
})
