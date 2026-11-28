window.__ModuleLoader__.load({id:"dsh-mobile-boost",factory(){const n="dsh-mobile-boost",o=`@media (max-width:768px),(pointer:coarse){
:root,body{--dsw-menu-backdrop-filter:none;--dsw-mask-blur:none;--dsw-specific-menu:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base))}
[data-sidebar-drawer][data-animating]{transition:none!important}
[data-sidebar-drawer][data-sidebar-collapsed] [data-sidebar-list-area]{content-visibility:auto;contain-intrinsic-size:auto 320px}
[data-chat-flow] [data-chat-flow-key]:not([hidden]):not([data-turn-process-hidden]):not([data-chat-motion]):not([data-chat-flow-kind="compaction"]):not(:nth-last-child(-n+4)){content-visibility:auto;contain-intrinsic-size:auto 96px}
[data-chat-flow][data-chat-motion]>*{transition:none!important}
[data-composer-card],[data-composer-input],[data-sidebar-list-area] [data-row-key]{touch-action:manipulation}
[data-composer-card]{box-shadow:0 0 0 .5px var(--dsw-alias-border-l2)}
}`;function e(a=typeof document<"u"?document:null){if(!a?.head)return;const t=a.createElement("style");return t.dataset.plugin=n,t.textContent=o,a.head.appendChild(t),()=>t.remove()}return{inject:[],apply(a){a.effect(()=>e(),"mobile-boost: styles")},_internal:{STYLE_ATTR:n,CSS:o,mountStyles:e}}}});
