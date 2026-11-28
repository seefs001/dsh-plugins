window.__ModuleLoader__.load({
  id: 'dsh-annotations',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    let primitives = null
    try { primitives = require('@deepseek-ai/dsh-client-ui-primitives') } catch {}
    const h = React.createElement

    const NS = 'annotations'
    const STATE_PATH = 'annotations/state'
    const OP_PATH = 'annotations/op'
    const CHANNEL_NAME = 'dsh-annotations'
    const FORGE_SOURCE_ID = 'dsh-annotations'
    const HL_DRAFT = 'dsh-ann-draft'
    const HL_JUMP = 'dsh-ann-jump'
    const JUMP_MS = 1800
    const WAKE_COOLDOWN_MS = 10_000
    const AFFIX_CHARS = 48
    const PREFIX_FALLBACK = 44
    const QUICK_INTENTS = ['note', 'fix', 'question']
    // external: mirrors dsh chat selection exclusions so ranges align with rendered DOM
    const SKIP = '[data-quote-jump],[data-dann-ui],script,style,textarea,[contenteditable="true"],[data-composer-seat],.katex-mathml,[data-text-interaction-exclude],.sr-only,[aria-hidden="true"]:not(.katex-html),button:not(code button)'
    const BLOCKS = 'p,li,pre,td,th,blockquote,h1,h2,h3,h4,h5,h6,dd,dt,figcaption,[data-message-bubble]'

    const DICTS = {
      en: {
        quoteAdd: 'Quote text',
        annotate: 'Annotate',
        annotateFile: 'Annotate file',
        addToAnnotations: 'Annotate',
        modalTitleNew: 'Add annotation',
        modalTitleEdit: 'Edit annotation',
        notePlaceholder: 'Write a note, attached automatically to your next message…',
        noteLabel: 'Annotation note',
        save: 'Save',
        add: 'Add',
        cancel: 'Cancel',
        close: 'Close',
        dockPending: '{n} annotations attached to next message',
        dockTitle: 'Annotations',
        dockExpand: 'Expand annotations',
        dockCollapse: 'Collapse annotations',
        dockSendNow: 'Send',
        dockSendHint: 'Send annotations now without extra text',
        dockDefaultPrompt: 'Please address the attached annotations.',
        dockClear: 'Clear all',
        intentNote: 'Note',
        intentFix: 'Fix',
        intentQuestion: 'Question',
        intentRevise: 'Revise',
        intentConstraint: 'Rule',
        statusDraft: 'Pending',
        statusConsumed: 'Sent',
        sentTurn: 'Turn {n}',
        jump: 'Jump to target',
        edit: 'Edit',
        requeue: 'Add again',
        remove: 'Delete',
        notFound: 'Target is not in the loaded view',
        toolbarLabel: 'Annotations ({n})',
        saveFailed: 'Could not save annotation',
      },
      zh: {
        quoteAdd: '引用文本',
        annotate: '标注',
        annotateFile: '标注此文件',
        addToAnnotations: '加入标注',
        modalTitleNew: '添加标注',
        modalTitleEdit: '编辑标注',
        notePlaceholder: '写下批注，下次发送消息时自动附带…',
        noteLabel: '标注内容',
        save: '保存',
        add: '添加',
        cancel: '取消',
        close: '关闭',
        dockPending: '下条消息附带 {n} 条标注',
        dockTitle: '标注',
        dockExpand: '展开标注列表',
        dockCollapse: '收起标注列表',
        dockSendNow: '直接发送',
        dockSendHint: '不写补充说明，直接把待发标注发给 Agent',
        dockDefaultPrompt: '请处理附带的标注。',
        dockClear: '清空',
        intentNote: '说明',
        intentFix: '修改',
        intentQuestion: '追问',
        intentRevise: '修订',
        intentConstraint: '约束',
        statusDraft: '待发送',
        statusConsumed: '已发送',
        sentTurn: '第 {n} 轮',
        jump: '定位原文',
        edit: '编辑',
        requeue: '再次加入',
        remove: '删除',
        notFound: '原文不在当前已加载视图中',
        toolbarLabel: '标注 ({n})',
        saveFailed: '保存标注失败',
      },
    }

    const CSS_TEXT = `
.dann-selbar{display:inline-flex;align-items:center;overflow:hidden;padding:0;border-radius:999px;corner-shape:round;background:var(--dsw-alias-button-floating-fill);--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);box-shadow:var(--dsw-elevation-panel)}
.dann-selbtn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);cursor:pointer;white-space:nowrap}
.dann-selbtn[data-accent="true"]{color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary))}
.dann-selbtn:focus-visible{background:var(--dsw-alias-button-floating-hover);outline:none}
@media (hover:hover){.dann-selbtn:hover{background:var(--dsw-alias-button-floating-hover)}}
.dann-seldiv{width:.5px;height:14px;background:var(--dsw-alias-border-l2);flex:none}

.dann-pop{position:fixed;z-index:10050;width:min(368px,calc(100vw - 24px));padding:10px 12px 12px;box-sizing:border-box;border:0;border-radius:var(--dsw-radius-lg);--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);font-family:Inter,var(--dsw-font-family);box-shadow:var(--dsw-elevation-prominent);display:flex;flex-direction:column;gap:8px}
.dann-pop-top{display:flex;align-items:flex-start;gap:8px}
.dann-excerpt{flex:1 1 auto;min-width:0;margin:0;padding:4px 8px;border-left:2px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-markdown-code-block,var(--dsw-alias-bg-module-platform));color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-12);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere}
.dann-excerpt[data-code="true"]{font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:1.45}
.dann-textarea{display:block;box-sizing:border-box;width:100%;min-height:72px;max-height:172px;padding:8px 10px;resize:vertical;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);outline:none;background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);font-family:Inter,var(--dsw-font-family)}
.dann-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}
.dann-textarea:focus{border-color:var(--dsw-alias-state-business-primary)}
.dann-pop-err{color:var(--dsw-alias-state-error-primary);font:var(--dsw-font-xxs-12);overflow-wrap:anywhere}
.dann-pop-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:2px}
.dann-intent-group{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-base))}
.dann-intent-pill{height:22px;padding:0 7px;border:none;border-radius:var(--dsw-radius-xs);background:transparent;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12);cursor:pointer;transition:background-color .12s,color .12s}
.dann-intent-pill:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}
@media (hover:hover){.dann-intent-pill:hover{color:var(--dsw-alias-label-primary)}}
.dann-intent-pill[data-active="true"]{background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:0 .5px 1px rgba(0,0,0,.08)}
.dann-pop-acts{display:inline-flex;align-items:center;gap:6px;flex:none;margin-left:auto}

.dann-hover{position:fixed;z-index:10040;max-width:min(320px,calc(100vw - 24px));min-width:140px;padding:8px 10px;box-sizing:border-box;border:0;border-radius:var(--dsw-radius-md);--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);font-family:Inter,var(--dsw-font-family);box-shadow:var(--dsw-elevation-prominent);display:flex;align-items:flex-start;gap:8px;animation:dann-hover-in .12s ease-out}
@keyframes dann-hover-in{from{opacity:0}to{opacity:1}}
.dann-hover-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}
.dann-hover-note{max-height:132px;overflow-y:auto;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dann-hover-acts{display:inline-flex;align-items:center;gap:2px;flex:none;margin:-2px -4px 0 0}

.dann-dock{box-sizing:border-box;flex:none;width:calc(100% - var(--dsh-composer-side-clearance,0px) * 2 - var(--dsh-composer-dock-inset,0px) * 2);max-width:calc(var(--dsh-composer-card-max-width,760px) - var(--dsh-composer-dock-inset,0px) * 2);margin:0 auto;padding:0 var(--dsh-composer-dock-inset,0px)}
.dann-dock-panel{position:relative;isolation:isolate;overflow:hidden;width:100%;border:0;border-radius:var(--dsw-radius-lg);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);background:var(--dsw-specific-menu);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);backdrop-filter:var(--dsw-menu-backdrop-filter);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);font-family:Inter,var(--dsw-font-family);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
@media (max-width:768px),(pointer:coarse){.dann-dock-panel{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base));backdrop-filter:none;-webkit-backdrop-filter:none}}
.dann-dock-bar{box-sizing:border-box;display:flex;align-items:center;gap:8px;min-height:36px;padding:4px 8px 4px 12px}
.dann-dock-header-btn{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;padding:2px 0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-weight:500;text-align:left;cursor:pointer;overflow:hidden;white-space:nowrap}
.dann-dock-header-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.dann-lead{display:grid;flex:none;place-items:center;width:16px;height:16px;color:var(--dsw-alias-label-tertiary)}
.dann-dock-single{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0}
.dann-single-quote{flex:0 1 42%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 6px;border-radius:var(--dsw-radius-xs);border:none;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12);cursor:pointer;text-align:left}
@media (hover:hover){.dann-single-quote:hover{color:var(--dsw-alias-state-business-primary)}}
.dann-single-quote:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dann-single-note{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:2px 0;border:none;background:transparent;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);text-align:left;cursor:pointer}
@media (hover:hover){.dann-single-note:hover{color:var(--dsw-alias-state-business-primary)}}
.dann-single-note:focus-visible{border-radius:var(--dsw-radius-xs);outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dann-dock-right{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:auto}
.dann-icon-btn{display:grid;flex:none;place-items:center;width:26px;height:26px;padding:0;border:none;border-radius:999px;corner-shape:round;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background-color .12s,color .12s}
@media (hover:hover){.dann-icon-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dann-icon-btn[data-danger="true"]:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}}
.dann-icon-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.dann-icon-btn:disabled{opacity:.45;cursor:default}

.dann-drawer{border-top:.5px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column}
.dann-list{max-height:208px;overflow-y:auto;margin:0;padding:0;list-style:none}
.dann-row{box-sizing:border-box;display:flex;align-items:flex-start;gap:8px;width:100%;padding:7px 8px 7px 12px}
.dann-row + .dann-row{box-shadow:inset 0 1px 0 var(--dsw-alias-border-l1)}
.dann-row-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}
.dann-row-top{display:flex;align-items:center;gap:6px;min-width:0}
.dann-row-target{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0;border:none;background:transparent;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12);text-align:left;cursor:pointer}
@media (hover:hover){.dann-row-target:hover{color:var(--dsw-alias-state-business-primary)}}
.dann-row-target:focus-visible{border-radius:var(--dsw-radius-xs);outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dann-row-note{padding:0;border:none;background:transparent;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;cursor:pointer}
@media (hover:hover){.dann-row-note:hover{color:var(--dsw-alias-state-business-primary)}}
.dann-row-note:focus-visible{border-radius:var(--dsw-radius-xs);outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dann-row-acts{display:inline-flex;align-items:center;gap:2px;flex:none}
.dann-drawer-foot{display:flex;align-items:center;justify-content:flex-end;gap:6px;padding:4px 8px;border-top:.5px solid var(--dsw-alias-border-l1)}
.dann-notice{padding:6px 12px;border-top:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-state-error-primary);font:var(--dsw-font-xxs-12)}

.dann-forge-card{padding:10px 12px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);font-family:Inter,var(--dsw-font-family)}
.dann-forge-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px}
.dann-forge-meta{display:flex;flex:1 1 auto;flex-wrap:wrap;align-items:center;gap:6px;min-width:0;min-height:20px}
.dann-forge-note{white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dann-forge-acts{display:inline-flex;align-items:center;gap:2px;flex:none;margin:-4px -4px 0 0}

.dann-toolbar-btn{display:inline-flex;flex:none;align-items:center;gap:6px;height:28px;padding:0 8px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);white-space:nowrap;cursor:pointer}
@media (hover:hover){.dann-toolbar-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.dann-toolbar-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.dann-toolbar-count{padding:0 5px;border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}

.dann-fb-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);cursor:pointer;white-space:nowrap}
.dann-fb-btn[data-variant="primary"]{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-label-on-color))}
.dann-fb-btn[data-variant="ghost"]{border-color:transparent;color:var(--dsw-alias-label-secondary)}
.dann-fb-btn:disabled{opacity:.45;cursor:default}
.dann-fb-tag{display:inline-flex;align-items:center;padding:0 6px;border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-12)}

::highlight(${HL_DRAFT}){background-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 18%,transparent);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 65%,transparent);text-decoration-thickness:1.5px;text-underline-offset:2px}
::highlight(${HL_JUMP}){background-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 22%,transparent);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 45%,transparent);text-decoration-thickness:1.5px;text-underline-offset:2px}
[data-dann-flash]{border-radius:var(--dsw-radius-xs,4px);animation:dann-flash ${JUMP_MS}ms cubic-bezier(.22,1,.36,1) forwards}
@keyframes dann-flash{0%,28%{background-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 7%,transparent);box-shadow:0 0 0 6px color-mix(in srgb,var(--dsw-alias-state-business-primary) 7%,transparent)}100%{background-color:transparent;box-shadow:0 0 0 6px transparent}}
@media (prefers-reduced-motion:reduce){[data-dann-flash]{animation:none;background-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 7%,transparent);box-shadow:0 0 0 6px color-mix(in srgb,var(--dsw-alias-state-business-primary) 7%,transparent)}}
@media (pointer:coarse){.dann-textarea{font-size:16px}}
@media (max-width:600px){.dann-pop{left:12px!important;right:12px!important;bottom:max(12px,env(safe-area-inset-bottom))!important;top:auto!important;width:auto}.dann-dock-bar{padding:4px 6px 4px 10px;gap:6px}.dann-single-quote{max-width:42%}}
`

    const IconPin = ({ size = 14 }) => h('svg', { viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'M3.5 3.5h9v7.5H7l-3.5 2.5V3.5Z' }),
      h('path', { d: 'M6 6.5h4M6 8.8h2.5' }))

    const FallbackChevronDown = ({ size = 14 }) => h('svg', { viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'M4 6l4 4 4-4' }))

    const FallbackChevronUp = ({ size = 14 }) => h('svg', { viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'M4 10l4-4 4 4' }))

    const FallbackClose = ({ size = 14 }) => h('svg', { viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', 'aria-hidden': true },
      h('path', { d: 'M4.5 4.5l7 7M11.5 4.5l-7 7' }))

    const FallbackEdit = ({ size = 14 }) => h('svg', { viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'M11.2 2.8a1.4 1.4 0 0 1 2 2L6 12l-2.8.8.8-2.8 7.2-7.2Z' }))

    const FallbackRefresh = ({ size = 14 }) => h('svg', { viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'M12.5 8a4.5 4.5 0 1 1-1.2-3.1M12.5 3v2.5H10' }))

    const FallbackTrash = ({ size = 14 }) => h('svg', { viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'M3.5 4.5h9M6 4.5V3.2h4v1.3M5 4.5l.5 8h5l.5-8' }))

    const Button = primitives?.Button ?? function FallbackButton({ variant, icon, children, ...rest }) {
      return h('button', { type: 'button', className: 'dann-fb-btn', 'data-variant': variant, ...rest }, icon, children)
    }

    const Tag = primitives?.Tag ?? function FallbackTag({ children }) {
      return h('span', { className: 'dann-fb-tag' }, children)
    }

    const Tooltip = primitives?.Tooltip ?? function FallbackTooltip({ children }) {
      return children
    }

    const MenuItemButton = primitives?.MenuItemButton ?? function FallbackMenuItem({ icon, onSelect, children, ...rest }) {
      return h('button', {
        type: 'button',
        role: 'menuitem',
        className: 'dann-fb-btn',
        'data-variant': 'ghost',
        onClick: onSelect,
        ...rest,
      }, icon, children)
    }

    const IconChevronDown = primitives?.IconChevronDownOutlineRegular ?? FallbackChevronDown
    const IconChevronUp = primitives?.IconChevronUpOutlineRegular ?? FallbackChevronUp
    const IconClose = primitives?.IconCloseOutlineRegular ?? FallbackClose
    const IconEdit = primitives?.IconEditOutlineRegular ?? FallbackEdit
    const IconRefresh = primitives?.IconRefreshOutlineRegular ?? FallbackRefresh
    const IconTrash = primitives?.IconTrashOutlineRegular ?? FallbackTrash

    const isSpace = c => c === 32 || c === 160 || (c >= 9 && c <= 13) || c === 0x2028 || c === 0x2029 || c === 0x3000 || c === 0xFEFF || (c >= 0x2000 && c <= 0x200B)

    function compact(text) {
      let out = ''
      for (let i = 0; i < text.length; i++) if (!isSpace(text.charCodeAt(i))) out += text[i]
      return out
    }

    const oneLine = text => String(text ?? '').replace(/\s+/gu, ' ').trim()

    function indexText(root) {
      const doc = root.ownerDocument
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement
          if (parent === null || parent.closest(SKIP)) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })
      const nodes = []
      const nodeOf = []
      const offsetOf = []
      let flat = ''
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const data = node.data
        const n = nodes.push(node) - 1
        for (let i = 0; i < data.length; i++) {
          if (isSpace(data.charCodeAt(i))) continue
          flat += data[i]
          nodeOf.push(n)
          offsetOf.push(i)
        }
      }
      return { flat, nodes, nodeOf, offsetOf }
    }

    function captureSelectionAnchor(fallbackText) {
      const sel = typeof window !== 'undefined' ? window.getSelection?.() : null
      const rawText = (fallbackText || sel?.toString() || '').trim()
      if (!rawText) return null
      let speaker = 'assistant'
      let messageKey
      let turnSeq
      let prefix = ''
      let suffix = ''
      let rect = null
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        const box = range.getBoundingClientRect?.()
        if (box && (box.width > 0 || box.height > 0)) rect = { left: box.left, top: box.top, right: box.right, bottom: box.bottom }
        const startEl = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement
        const flowRow = startEl?.closest?.('[data-chat-flow-kind]') ?? null
        const bubble = startEl?.closest?.('[data-message-bubble]') ?? null
        const kind = flowRow?.getAttribute?.('data-chat-flow-kind') ?? ''
        if (kind === 'user' || bubble !== null) speaker = 'user'
        const nodeKey = flowRow?.getAttribute?.('data-chat-node-key')
        if (nodeKey) messageKey = nodeKey
        const turnAttr = flowRow?.getAttribute?.('data-chat-turn')
        const parsedTurn = turnAttr ? Number.parseInt(turnAttr, 10) : NaN
        if (Number.isInteger(parsedTurn) && parsedTurn > 0) turnSeq = parsedTurn

        const scope = flowRow ?? startEl?.closest?.('[data-conversation-scroll]') ?? null
        if (scope) {
          try {
            const preRange = scope.ownerDocument.createRange()
            preRange.selectNodeContents(scope)
            preRange.setEnd(range.startContainer, range.startOffset)
            const preText = preRange.toString()
            prefix = preText.slice(Math.max(0, preText.length - AFFIX_CHARS))
            const sufRange = scope.ownerDocument.createRange()
            sufRange.selectNodeContents(scope)
            sufRange.setStart(range.endContainer, range.endOffset)
            suffix = sufRange.toString().slice(0, AFFIX_CHARS)
          } catch {}
        }
      }
      return {
        anchor: {
          kind: 'message-text',
          speaker,
          quote: rawText,
          ...(prefix ? { prefix } : {}),
          ...(suffix ? { suffix } : {}),
          ...(messageKey ? { messageKey } : {}),
          ...(turnSeq !== undefined ? { turnSeq } : {}),
        },
        rect,
      }
    }

    function locateAnchorRange(anchor, doc = document) {
      if (!anchor || anchor.kind !== 'message-text') return null
      const scroller = doc.querySelector?.('[data-conversation-scroll]') ?? null
      if (!scroller) return null
      const preferred = anchor.messageKey
        ? scroller.querySelector?.(`[data-chat-node-key="${CSS?.escape ? CSS.escape(anchor.messageKey) : anchor.messageKey}"]`) ?? null
        : null
      const searchIn = container => {
        const index = indexText(container)
        const target = compact(anchor.quote)
        if (!target) return null
        const pre = compact(anchor.prefix ?? '')
        const suf = compact(anchor.suffix ?? '')
        let needle = target
        const matches = []
        for (let at = index.flat.indexOf(needle); at >= 0; at = index.flat.indexOf(needle, at + 1)) matches.push(at)
        if (matches.length === 0 && target.length > PREFIX_FALLBACK) {
          needle = target.slice(0, PREFIX_FALLBACK)
          for (let at = index.flat.indexOf(needle); at >= 0; at = index.flat.indexOf(needle, at + 1)) matches.push(at)
        }
        if (matches.length === 0) return null
        let best = matches[0]
        let bestScore = -1
        for (const at of matches) {
          let score = 0
          if (pre) {
            const before = index.flat.slice(Math.max(0, at - pre.length), at)
            if (before === pre) score += 4
            else if (before.endsWith(pre.slice(-16))) score += 2
          }
          if (suf) {
            const after = index.flat.slice(at + needle.length, at + needle.length + suf.length)
            if (after === suf) score += 4
            else if (after.startsWith(suf.slice(0, 16))) score += 2
          }
          if (score > bestScore) {
            bestScore = score
            best = at
          }
        }
        const end = best + needle.length - 1
        const range = doc.createRange()
        range.setStart(index.nodes[index.nodeOf[best]], index.offsetOf[best])
        range.setEnd(index.nodes[index.nodeOf[end]], index.offsetOf[end] + 1)
        return { range, root: scroller }
      }
      return (preferred ? searchIn(preferred) : null) ?? searchIn(scroller)
    }

    function revealAncestors(node, root) {
      let changed = false
      for (let p = node.parentElement; p !== null && p !== root; p = p.parentElement) {
        if (p.hidden || p.getAttribute('hidden') === 'until-found') { p.dispatchEvent(new Event('beforematch', { bubbles: true })); changed = true }
        if (p.tagName === 'DETAILS' && !p.open) { p.open = true; changed = true }
      }
      return changed
    }

    function scrollRangeIntoView(range, root) {
      const el = range.startContainer.parentElement
      const block = el?.closest?.(BLOCKS) ?? el
      if (!block || !block.isConnected) return null
      const rect = range.getBoundingClientRect()
      if (root && rect.height > 0) {
        const box = root.getBoundingClientRect()
        const delta = rect.height > box.height * 0.6
          ? rect.top - box.top - 80
          : rect.top + rect.height / 2 - (box.top + box.height / 2)
        root.scrollTop += delta
      } else {
        block.scrollIntoView?.({ block: 'center', behavior: 'instant' })
      }
      return block
    }

    let jumpTimer = null
    let flashedEl = null
    let activeDraftRanges = []

    function clearJumpHighlight() {
      if (jumpTimer !== null) { clearTimeout(jumpTimer); jumpTimer = null }
      if (globalThis.CSS?.highlights) CSS.highlights.delete(HL_JUMP)
      if (flashedEl) { flashedEl.removeAttribute('data-dann-flash'); flashedEl = null }
    }

    function jumpToMessageAnchor(anchor) {
      clearJumpHighlight()
      const found = locateAnchorRange(anchor)
      if (!found) return false
      revealAncestors(found.range.startContainer, found.root)
      const block = scrollRangeIntoView(found.range, found.root)
      if (!block) return false
      if (globalThis.Highlight && globalThis.CSS?.highlights) {
        CSS.highlights.set(HL_JUMP, new Highlight(found.range))
      }
      flashedEl = block
      flashedEl.removeAttribute('data-dann-flash')
      void flashedEl.offsetWidth
      flashedEl.setAttribute('data-dann-flash', '')
      jumpTimer = setTimeout(clearJumpHighlight, JUMP_MS)
      return true
    }

    function syncChatHighlights(drafts) {
      const nextEntries = []
      const draftRanges = []
      for (const item of drafts) {
        if (item.anchor?.kind !== 'message-text') continue
        const found = locateAnchorRange(item.anchor)
        if (!found) continue
        draftRanges.push(found.range)
        nextEntries.push({ item, range: found.range })
      }
      activeDraftRanges = nextEntries
      draftRectCache = null
      if (!globalThis.Highlight || !globalThis.CSS?.highlights) return
      if (draftRanges.length > 0) CSS.highlights.set(HL_DRAFT, new Highlight(...draftRanges))
      else CSS.highlights.delete(HL_DRAFT)
    }

    let draftRectCache = null
    function invalidateDraftRectCache() {
      draftRectCache = null
    }

    function getDraftRectEntries() {
      if (draftRectCache !== null) return draftRectCache
      const built = []
      for (const entry of activeDraftRanges) {
        if (!entry.range.startContainer?.isConnected) continue
        const rects = entry.range.getClientRects?.()
        if (!rects || rects.length === 0) continue
        const boxes = []
        for (const r of rects) {
          boxes.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom })
        }
        if (boxes.length > 0) built.push({ item: entry.item, boxes })
      }
      draftRectCache = built
      return built
    }

    function hitDraftHighlight(x, y) {
      for (const entry of getDraftRectEntries()) {
        for (const r of entry.boxes) {
          if (x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2) {
            return { item: entry.item, rect: r }
          }
        }
      }
      return null
    }

    function clearChatHighlights() {
      clearJumpHighlight()
      activeDraftRanges = []
      draftRectCache = null
      if (!globalThis.CSS?.highlights) return
      CSS.highlights.delete(HL_DRAFT)
    }

    function shortTargetText(anchor) {
      if (anchor.kind === 'git-diff') {
        const base = anchor.path.split('/').pop() || anchor.path
        if (anchor.side === 'file' || anchor.startLine === undefined) return base
        const range = anchor.endLine && anchor.endLine !== anchor.startLine
          ? `${anchor.startLine}-${anchor.endLine}`
          : String(anchor.startLine)
        return `${base}:${range}`
      }
      const line = oneLine(anchor.quote)
      return line.length <= 28 ? line : `${line.slice(0, 27)}…`
    }

    function formatDiffPlace(anchor) {
      if (anchor.side === 'file' || anchor.startLine === undefined) return anchor.path
      const range = anchor.endLine && anchor.endLine !== anchor.startLine
        ? `${anchor.startLine}-${anchor.endLine}`
        : String(anchor.startLine)
      return `${anchor.path}:${anchor.side}${range}`
    }

    function computePopoverStyle(rect) {
      if (typeof window === 'undefined') return { top: 80, left: 24 }
      const vw = window.innerWidth || 800
      const vh = window.innerHeight || 600
      const w = Math.min(368, vw - 24)
      const estH = 224
      if (!rect) return { top: Math.max(16, Math.round((vh - estH) / 2)), left: Math.max(12, Math.round((vw - w) / 2)) }
      const left = Math.max(12, Math.min(vw - w - 12, Math.round(rect.left)))
      const below = rect.bottom + 10
      const top = below + estH <= vh - 12
        ? Math.round(below)
        : Math.max(12, Math.round(rect.top - estH - 10))
      return { top, left }
    }

    function computeHoverStyle(rect) {
      if (typeof window === 'undefined' || !rect) return { top: 60, left: 16 }
      const vw = window.innerWidth || 800
      const maxW = Math.min(320, vw - 24)
      const left = Math.max(12, Math.min(vw - maxW - 12, Math.round(rect.left)))
      if (rect.top >= 110) {
        return { top: Math.round(rect.top - 8), left, transform: 'translateY(-100%)' }
      }
      return { top: Math.round(rect.bottom + 8), left }
    }

    function buildForgeMap(items, targetSource) {
      const byPath = new Map()
      const kind = targetSource?.kind === 'change' ? 'cr' : 'local'
      const url = targetSource?.kind === 'change' ? targetSource.url : undefined
      for (const item of items) {
        if (item.status === 'resolved') continue
        const { anchor } = item
        if (anchor?.kind !== 'git-diff' || anchor.source !== kind) continue
        if (kind === 'cr' && url && anchor.changeUrl && anchor.changeUrl !== url) continue
        const place = anchor.side === 'file' || anchor.startLine === undefined
          ? 'file'
          : { side: anchor.side, startLine: anchor.startLine, endLine: anchor.endLine ?? anchor.startLine }
        const entry = {
          key: item.id,
          place,
          ...(anchor.digest ? { digest: anchor.digest } : {}),
          version: `${item.updatedAt}:${item.status}:${item.enabled ? 1 : 0}`,
        }
        const list = byPath.get(anchor.path)
        if (list) list.push(entry)
        else byPath.set(anchor.path, [entry])
      }
      return byPath
    }

    const MAX_STORED_SESSIONS = 32
    const EMPTY_SESSION = Object.freeze({ items: [], loaded: false, loading: false, saving: false, error: null, fetchedAt: 0 })

    function createStore() {
      const sessions = new Map()
      const listeners = new Map()
      const inflight = new Map()
      const generations = new Map()
      let channel = null

      const get = sessionId => (sessionId ? sessions.get(sessionId) ?? EMPTY_SESSION : EMPTY_SESSION)

      const bumpGen = sessionId => {
        const next = (generations.get(sessionId) ?? 0) + 1
        generations.set(sessionId, next)
        return next
      }

      const notify = sessionId => {
        const set = listeners.get(sessionId)
        if (!set) return
        for (const fn of set) fn()
      }

      const setSession = (sessionId, patch) => {
        const prev = get(sessionId)
        const next = { ...prev, ...patch }
        sessions.delete(sessionId)
        sessions.set(sessionId, next)
        if (sessions.size > MAX_STORED_SESSIONS) {
          for (const id of sessions.keys()) {
            if (id === sessionId || listeners.has(id) || inflight.has(id)) continue
            sessions.delete(id)
            generations.delete(id)
            if (sessions.size <= MAX_STORED_SESSIONS) break
          }
        }
        notify(sessionId)
        return next
      }

      const postSync = (sessionId, items, updatedAt) => {
        if (!channel || typeof BroadcastChannel !== 'function') return
        try { BroadcastChannel.prototype.postMessage.call(channel, { type: 'sync', sessionId, items, updatedAt }) } catch {}
      }

      const load = (sessionId, force = false) => {
        if (!sessionId) return Promise.resolve([])
        const current = get(sessionId)
        if (!force && current.loaded) return Promise.resolve(current.items)
        const existing = inflight.get(sessionId)
        if (existing && !force) return existing
        const gen = bumpGen(sessionId)
        setSession(sessionId, { loading: true, error: null })
        const url = `${STATE_PATH}?sessionId=${encodeURIComponent(sessionId)}`
        const req = fetch(url, { headers: { accept: 'application/json' } })
          .then(async res => {
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
            const items = Array.isArray(data.items) ? data.items : []
            if (generations.get(sessionId) !== gen) return get(sessionId).items
            setSession(sessionId, { items, loaded: true, loading: false, error: null, fetchedAt: Date.now() })
            return items
          })
          .catch(error => {
            if (generations.get(sessionId) === gen) {
              setSession(sessionId, { loading: false, error: error?.message ?? String(error) })
            }
            return get(sessionId).items
          })
          .finally(() => {
            if (inflight.get(sessionId) === req) inflight.delete(sessionId)
          })
        inflight.set(sessionId, req)
        return req
      }

      const operate = async payload => {
        const sessionId = payload?.sessionId
        if (!sessionId) throw new Error('missing sessionId')
        bumpGen(sessionId)
        setSession(sessionId, { saving: true, error: null })
        try {
          const res = await fetch(OP_PATH, {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify(payload),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
          bumpGen(sessionId)
          const items = Array.isArray(data.items) ? data.items : get(sessionId).items
          setSession(sessionId, { items, loaded: true, saving: false, error: null, fetchedAt: Date.now() })
          postSync(sessionId, items, data.updatedAt ?? Date.now())
          return data
        } catch (error) {
          setSession(sessionId, { saving: false, error: error?.message ?? String(error) })
          throw error
        }
      }

      const subscribe = (sessionId, fn) => {
        if (!sessionId) return () => {}
        let set = listeners.get(sessionId)
        if (!set) { set = new Set(); listeners.set(sessionId, set) }
        set.add(fn)
        return () => {
          set.delete(fn)
          if (set.size === 0) listeners.delete(sessionId)
        }
      }

      const connect = () => {
        if (typeof BroadcastChannel === 'function') {
          try {
            channel = new BroadcastChannel(CHANNEL_NAME)
            channel.addEventListener('message', event => {
              const msg = event?.data
              if (msg?.type === 'sync' && typeof msg.sessionId === 'string' && Array.isArray(msg.items)) {
                bumpGen(msg.sessionId)
                setSession(msg.sessionId, { items: msg.items, loaded: true, loading: false, error: null, fetchedAt: Date.now() })
              }
            })
          } catch {
            channel = null
          }
        }
        return () => {
          try { channel?.close?.() } catch {}
          channel = null
          sessions.clear()
          inflight.clear()
          generations.clear()
          clearChatHighlights()
        }
      }

      return { get, load, operate, subscribe, connect }
    }

    function createUiBus() {
      let draft = null
      let revealSeq = 0
      let revealTarget = null
      const listeners = new Set()
      const emit = () => { for (const fn of listeners) fn() }
      return {
        get: () => draft,
        getReveal: () => revealSeq,
        getRevealTarget: () => revealTarget,
        subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn) },
        open: next => { draft = next; emit() },
        close: () => { if (draft !== null) { draft = null; emit() } },
        revealDock: sessionId => { revealTarget = sessionId; revealSeq += 1; emit() },
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', DICTS.en), 'annotations: locale en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICTS.zh), 'annotations: locale zh')
        const bindT = () => ctx.locale.bind(NS)

        const store = createStore()
        const uiBus = createUiBus()

        ctx.effect(() => store.connect(), 'annotations: broadcast channel')

        let styleEl = null
        const ensureStyles = () => {
          if (styleEl || typeof document === 'undefined' || !document.head) return
          styleEl = document.createElement('style')
          styleEl.dataset.plugin = 'dsh-annotations'
          styleEl.textContent = CSS_TEXT
          document.head.appendChild(styleEl)
        }
        ctx.effect(() => () => {
          styleEl?.remove()
          styleEl = null
          clearChatHighlights()
        }, 'annotations: styles')

        const useStyleEffect = React.useLayoutEffect ?? React.useEffect

        const useLocaleT = () => {
          const rev = React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot()?.revision ?? 0)
          return React.useMemo(() => bindT(), [rev])
        }

        const useSessionAnnotations = sessionId => {
          const snap = React.useSyncExternalStore(
            React.useCallback(fn => store.subscribe(sessionId, fn), [sessionId]),
            () => store.get(sessionId),
          )
          React.useEffect(() => {
            if (sessionId) void store.load(sessionId)
          }, [sessionId])
          return snap
        }

        const intentLabel = (t, intent) => {
          switch (intent) {
            case 'fix': return t('intentFix')
            case 'question': return t('intentQuestion')
            case 'revise': return t('intentRevise')
            case 'constraint': return t('intentConstraint')
            default: return t('intentNote')
          }
        }

        const notifyUser = (text, ok = false) => {
          const menus = ctx.get?.('contextMenus')
          if (typeof menus?.notify === 'function') {
            menus.notify(text, ok)
            return true
          }
          return false
        }

        const openDiffTarget = (sessionId, anchor) => {
          const forge = ctx.get('forgeChanges')
          if (!forge || anchor.kind !== 'git-diff') return false
          try {
            const source = anchor.source === 'cr' && anchor.changeUrl
              ? { kind: 'change', url: anchor.changeUrl }
              : { kind: 'local' }
            forge.open({ sessionId, source }, { path: anchor.path })
            return true
          } catch {
            return false
          }
        }

        function AnnotationComposer({ request, onClose }) {
          useStyleEffect(ensureStyles, [])
          const t = useLocaleT()
          const [note, setNote] = React.useState(request.initialNote ?? '')
          const [intent, setIntent] = React.useState(request.initialIntent ?? (
            request.anchor.kind === 'git-diff' ? 'fix' : 'note'
          ))
          const [busy, setBusy] = React.useState(false)
          const [err, setErr] = React.useState('')
          const inputRef = React.useRef(null)
          const popRef = React.useRef(null)

          React.useEffect(() => {
            inputRef.current?.focus?.()
          }, [])

          React.useEffect(() => {
            if (typeof document === 'undefined') return undefined
            const onKey = event => {
              if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
              }
            }
            const onPointer = event => {
              if (popRef.current && !popRef.current.contains(event.target)) onClose()
            }
            document.addEventListener('keydown', onKey)
            document.addEventListener('pointerdown', onPointer)
            return () => {
              document.removeEventListener('keydown', onKey)
              document.removeEventListener('pointerdown', onPointer)
            }
          }, [onClose])

          const submit = async () => {
            const clean = note.trim()
            if (!clean || busy) return
            setBusy(true)
            setErr('')
            try {
              if (request.mode === 'edit' && request.itemId) {
                await store.operate({ sessionId: request.sessionId, action: 'update', id: request.itemId, note: clean, intent })
              } else {
                await store.operate({ sessionId: request.sessionId, action: 'add', anchor: request.anchor, note: clean, intent })
              }
              onClose()
            } catch (error) {
              setErr(error?.message || t('saveFailed'))
              setBusy(false)
            }
          }

          const removeItem = async () => {
            if (!request.itemId || busy) return
            setBusy(true)
            try {
              await store.operate({ sessionId: request.sessionId, action: 'remove', id: request.itemId })
              onClose()
            } catch (error) {
              setErr(error?.message || t('saveFailed'))
              setBusy(false)
            }
          }

          const excerpt = request.anchor.kind === 'git-diff'
            ? (request.anchor.snippet || formatDiffPlace(request.anchor))
            : request.anchor.quote
          const pos = React.useMemo(() => computePopoverStyle(request.rect), [request.rect])
          const intentOptions = QUICK_INTENTS.includes(intent) ? QUICK_INTENTS : [...QUICK_INTENTS, intent]

          const card = h('div', {
            ref: popRef,
            className: 'dann-pop',
            'data-dann-ui': '',
            role: 'dialog',
            'aria-label': request.mode === 'edit' ? t('modalTitleEdit') : t('modalTitleNew'),
            style: pos,
          },
          h('div', { className: 'dann-pop-top' },
            h('p', { className: 'dann-excerpt', 'data-code': request.anchor.kind === 'git-diff' ? 'true' : undefined }, excerpt),
            h('button', {
              type: 'button',
              className: 'dann-icon-btn',
              onClick: onClose,
              'aria-label': t('close'),
            }, h(IconClose, { size: 14 }))),
          h('textarea', {
            ref: inputRef,
            className: 'dann-textarea',
            value: note,
            placeholder: t('notePlaceholder'),
            'aria-label': t('noteLabel'),
            disabled: busy,
            onChange: event => setNote(event.target.value),
            onKeyDown: event => {
              if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
                event.preventDefault()
                void submit()
              }
            },
          }),
          err ? h('div', { className: 'dann-pop-err', role: 'alert' }, err) : null,
          h('div', { className: 'dann-pop-foot' },
            h('div', { className: 'dann-intent-group', role: 'group' },
              intentOptions.map(code => h('button', {
                key: code,
                type: 'button',
                className: 'dann-intent-pill',
                'aria-pressed': intent === code,
                'data-active': intent === code ? 'true' : undefined,
                onClick: () => setIntent(code),
              }, intentLabel(t, code)))),
            h('div', { className: 'dann-pop-acts' },
              request.mode === 'edit' && request.itemId
                ? h(Tooltip, { portal: true, label: t('remove'), side: 'top', delayMs: 500 },
                  h('button', {
                    type: 'button',
                    className: 'dann-icon-btn',
                    'data-danger': 'true',
                    'aria-label': t('remove'),
                    disabled: busy,
                    onClick: () => void removeItem(),
                  }, h(IconTrash, { size: 14 })))
                : null,
              h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: onClose }, t('cancel')),
              h(Button, { size: 'sm', variant: 'primary', disabled: busy || !note.trim(), onClick: () => void submit() },
                request.mode === 'edit' ? t('save') : t('add')))))

          if (typeof document !== 'undefined' && ReactDOM?.createPortal && document.body) {
            return ReactDOM.createPortal(card, document.body)
          }
          return card
        }

        function SelectionActionBar({ sessionId, dismiss, readText, clearSelection, inputActions, useSession }) {
          useStyleEffect(ensureStyles, [])
          const t = useLocaleT()
          const enabled = useSession
            ? useSession(s => !s.removed && (s.subagent === null || s.subagent.address.mode === 'continuable'))
            : true

          React.useEffect(() => {
            if (!enabled) dismiss()
          }, [enabled, dismiss])

          if (!enabled) return null

          const onQuote = () => {
            const text = readText()
            if (text === null) { dismiss(); return }
            if (!inputActions?.insertQuote?.(text)) return
            clearSelection()
            dismiss()
          }

          const onAnnotate = () => {
            const text = readText()
            if (text === null) { dismiss(); return }
            const captured = captureSelectionAnchor(text)
            if (!captured) { dismiss(); return }
            clearSelection()
            dismiss()
            uiBus.open({
              mode: 'create',
              sessionId,
              anchor: captured.anchor,
              rect: captured.rect,
            })
          }

          return h('div', { className: 'dann-selbar', 'data-dann-ui': '', role: 'toolbar' },
            h('button', {
              type: 'button',
              className: 'dann-selbtn',
              'aria-label': t('quoteAdd'),
              onPointerDown: event => { event.preventDefault() },
              onClick: onQuote,
            }, t('quoteAdd')),
            h('span', { className: 'dann-seldiv', 'aria-hidden': true }),
            h('button', {
              type: 'button',
              className: 'dann-selbtn',
              'data-accent': 'true',
              'aria-label': t('annotate'),
              onPointerDown: event => { event.preventDefault() },
              onClick: onAnnotate,
            }, h(IconPin, { size: 13 }), t('annotate')))
        }

        function InputDock({ sessionId, inputState, inputActions }) {
          const t = useLocaleT()
          const snap = useSessionAnnotations(sessionId)
          const activeComposer = React.useSyncExternalStore(uiBus.subscribe, uiBus.get)
          const revealSeq = React.useSyncExternalStore(uiBus.subscribe, uiBus.getReveal)
          const [expanded, setExpanded] = React.useState(false)
          const [notice, setNotice] = React.useState('')
          const [hoverCard, setHoverCard] = React.useState(null)
          const hoverItemIdRef = React.useRef(null)
          const updateHoverCard = React.useCallback(next => {
            hoverItemIdRef.current = next ? next.item.id : null
            setHoverCard(next)
          }, [])
          const prevPhaseRef = React.useRef(inputState?.phase)
          const prevRevealRef = React.useRef(revealSeq)
          const dockRef = React.useRef(null)
          const overCardRef = React.useRef(false)
          const hoverTimersRef = React.useRef({ open: null, close: null })

          const drafts = React.useMemo(() => snap.items.filter(item => item.status === 'draft'), [snap.items])
          const hasDrafts = Boolean(sessionId && drafts.length > 0)

          React.useEffect(() => {
            if (!hasDrafts || activeComposer) {
              updateHoverCard(null)
              overCardRef.current = false
            }
          }, [hasDrafts, activeComposer, updateHoverCard])

          React.useEffect(() => {
            if (drafts.length <= 1 && expanded) setExpanded(false)
          }, [drafts.length, expanded])

          React.useEffect(() => {
            if (revealSeq !== prevRevealRef.current) {
              prevRevealRef.current = revealSeq
              if (uiBus.getRevealTarget() === sessionId) {
                if (drafts.length > 1) setExpanded(true)
                dockRef.current?.scrollIntoView?.({ block: 'nearest' })
              }
            }
          }, [revealSeq, sessionId, drafts.length])

          React.useEffect(() => {
            if (!notice) return undefined
            const timer = setTimeout(() => setNotice(''), 3000)
            return () => clearTimeout(timer)
          }, [notice])

          React.useEffect(() => {
            if (!sessionId) return undefined
            const phase = inputState?.phase
            const prev = prevPhaseRef.current
            prevPhaseRef.current = phase
            if (prev === 'sending' && phase !== 'sending') {
              const hasPending = store.get(sessionId).items.some(item => item.status === 'draft')
              if (hasPending) {
                void store.load(sessionId, true)
                const timer = setTimeout(() => { void store.load(sessionId, true) }, 700)
                return () => clearTimeout(timer)
              }
            }
            return undefined
          }, [sessionId, inputState?.phase])

          React.useEffect(() => {
            if (!sessionId || typeof window === 'undefined' || typeof document === 'undefined') return undefined
            const onWake = () => {
              if (document.visibilityState === 'hidden') return
              const current = store.get(sessionId)
              if (Date.now() - current.fetchedAt < WAKE_COOLDOWN_MS) return
              void store.load(sessionId, true)
            }
            const onShortcut = event => {
              if (!(event.metaKey || event.ctrlKey) || !event.shiftKey || event.key.toLowerCase() !== 'a') return
              const sel = window.getSelection?.()
              if (!sel || sel.isCollapsed) return
              const anchorEl = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement
              if (!anchorEl?.closest?.('[data-conversation-scroll]')) return
              const captured = captureSelectionAnchor(sel.toString())
              if (!captured) return
              event.preventDefault()
              sel.removeAllRanges?.()
              uiBus.open({ mode: 'create', sessionId, anchor: captured.anchor, rect: captured.rect })
            }
            window.addEventListener('focus', onWake)
            document.addEventListener('visibilitychange', onWake)
            document.addEventListener('keydown', onShortcut)
            return () => {
              window.removeEventListener('focus', onWake)
              document.removeEventListener('visibilitychange', onWake)
              document.removeEventListener('keydown', onShortcut)
            }
          }, [sessionId])

          React.useEffect(() => {
            syncChatHighlights(drafts)
            return () => { clearChatHighlights() }
          }, [drafts])

          React.useEffect(() => {
            if (!hasDrafts || typeof document === 'undefined') return undefined
            const clearTimers = () => {
              if (hoverTimersRef.current.open !== null) { clearTimeout(hoverTimersRef.current.open); hoverTimersRef.current.open = null }
              if (hoverTimersRef.current.close !== null) { clearTimeout(hoverTimersRef.current.close); hoverTimersRef.current.close = null }
            }
            const scheduleClose = () => {
              if (hoverTimersRef.current.open !== null) { clearTimeout(hoverTimersRef.current.open); hoverTimersRef.current.open = null }
              if (hoverItemIdRef.current === null || hoverTimersRef.current.close !== null) return
              hoverTimersRef.current.close = setTimeout(() => {
                hoverTimersRef.current.close = null
                if (!overCardRef.current) updateHoverCard(null)
              }, 160)
            }
            let rafId = 0
            let pendingX = 0
            let pendingY = 0
            let pendingTarget = null
            const flushMove = () => {
              rafId = 0
              if (uiBus.get() !== null) return
              if (overCardRef.current) return
              const target = pendingTarget
              if (!target || typeof target.closest !== 'function' || !target.closest('[data-conversation-scroll]')) {
                scheduleClose()
                return
              }
              if (target.closest('[data-dann-ui]')) return
              const hit = hitDraftHighlight(pendingX, pendingY)
              if (!hit) {
                scheduleClose()
                return
              }
              if (hoverTimersRef.current.close !== null) {
                clearTimeout(hoverTimersRef.current.close)
                hoverTimersRef.current.close = null
              }
              if (hoverItemIdRef.current === hit.item.id) return
              if (hoverTimersRef.current.open !== null) clearTimeout(hoverTimersRef.current.open)
              const delay = hoverItemIdRef.current !== null ? 0 : 120
              hoverTimersRef.current.open = setTimeout(() => {
                hoverTimersRef.current.open = null
                updateHoverCard({ item: hit.item, rect: hit.rect })
              }, delay)
            }
            const onPointerMove = event => {
              if (event.pointerType === 'touch') return
              pendingX = event.clientX
              pendingY = event.clientY
              pendingTarget = event.target
              if (!rafId) rafId = requestAnimationFrame(flushMove)
            }
            const onScroll = () => {
              invalidateDraftRectCache()
              clearTimers()
              overCardRef.current = false
              if (hoverItemIdRef.current !== null) updateHoverCard(null)
            }
            const onResize = () => {
              invalidateDraftRectCache()
            }
            const onChatClick = event => {
              if (event.defaultPrevented || event.button !== 0) return
              const target = event.target
              if (!target || typeof target.closest !== 'function') return
              if (!target.closest('[data-conversation-scroll]')) return
              if (target.closest('[data-dann-ui],[data-quote-jump],a,button,input,textarea,summary')) return
              const sel = window.getSelection?.()
              if (sel && !sel.isCollapsed) return
              const hit = hitDraftHighlight(event.clientX, event.clientY)
              if (!hit) return
              clearTimers()
              updateHoverCard(null)
              uiBus.open({
                mode: 'edit',
                sessionId,
                itemId: hit.item.id,
                anchor: hit.item.anchor,
                initialNote: hit.item.note,
                initialIntent: hit.item.intent,
                rect: hit.rect,
              })
            }
            document.addEventListener('pointermove', onPointerMove, { passive: true })
            document.addEventListener('scroll', onScroll, true)
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') window.addEventListener('resize', onResize, { passive: true })
            document.addEventListener('click', onChatClick)
            return () => {
              if (rafId) cancelAnimationFrame(rafId)
              clearTimers()
              document.removeEventListener('pointermove', onPointerMove)
              document.removeEventListener('scroll', onScroll, true)
              if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') window.removeEventListener('resize', onResize)
              document.removeEventListener('click', onChatClick)
            }
          }, [hasDrafts, sessionId, updateHoverCard])

          useStyleEffect(() => {
            if (hasDrafts) ensureStyles()
          }, [hasDrafts])

          const composerNode = activeComposer && activeComposer.sessionId === sessionId
            ? h(AnnotationComposer, { request: activeComposer, onClose: uiBus.close })
            : null

          if (!hasDrafts) return composerNode

          const reportNotFound = () => {
            if (!notifyUser(t('notFound'), false)) setNotice(t('notFound'))
          }

          const handleJump = item => {
            if (item.anchor.kind === 'git-diff') {
              if (!openDiffTarget(sessionId, item.anchor)) reportNotFound()
              return
            }
            if (!jumpToMessageAnchor(item.anchor)) reportNotFound()
          }

          const openEdit = item => {
            uiBus.open({
              mode: 'edit',
              sessionId,
              itemId: item.id,
              anchor: item.anchor,
              initialNote: item.note,
              initialIntent: item.intent,
            })
          }

          const composerEmpty = typeof inputState?.draft !== 'string' || inputState.draft.trim() === ''
          const handleSendNow = () => {
            if (!inputActions) return
            if (composerEmpty && typeof inputActions.setDraft === 'function') {
              inputActions.setDraft(t('dockDefaultPrompt'))
            }
            inputActions.submit?.()
          }

          const single = drafts.length === 1 ? drafts[0] : null
          const liveHovered = hoverCard && !activeComposer
            ? drafts.find(item => item.id === hoverCard.item.id) ?? null
            : null
          const hoverEl = liveHovered
            ? h('div', {
              className: 'dann-hover',
              'data-dann-ui': '',
              role: 'tooltip',
              style: computeHoverStyle(hoverCard.rect),
              onPointerEnter: () => {
                overCardRef.current = true
                if (hoverTimersRef.current.close !== null) {
                  clearTimeout(hoverTimersRef.current.close)
                  hoverTimersRef.current.close = null
                }
              },
              onPointerLeave: () => {
                overCardRef.current = false
                if (hoverTimersRef.current.close !== null) clearTimeout(hoverTimersRef.current.close)
                hoverTimersRef.current.close = setTimeout(() => {
                  hoverTimersRef.current.close = null
                  if (!overCardRef.current) updateHoverCard(null)
                }, 140)
              },
            },
            h('div', { className: 'dann-hover-body' },
              liveHovered.intent !== 'note' ? h('div', null, h(Tag, { tone: 'neutral' }, intentLabel(t, liveHovered.intent))) : null,
              h('div', { className: 'dann-hover-note' }, liveHovered.note)),
            h('div', { className: 'dann-hover-acts' },
              h(Tooltip, { portal: true, label: t('edit'), side: 'top', delayMs: 400 },
                h('button', {
                  type: 'button',
                  className: 'dann-icon-btn',
                  'aria-label': t('edit'),
                  onClick: () => {
                    const rect = hoverCard.rect
                    overCardRef.current = false
                    updateHoverCard(null)
                    uiBus.open({
                      mode: 'edit',
                      sessionId,
                      itemId: liveHovered.id,
                      anchor: liveHovered.anchor,
                      initialNote: liveHovered.note,
                      initialIntent: liveHovered.intent,
                      rect,
                    })
                  },
                }, h(IconEdit, { size: 13 }))),
              h(Tooltip, { portal: true, label: t('remove'), side: 'top', delayMs: 400 },
                h('button', {
                  type: 'button',
                  className: 'dann-icon-btn',
                  'data-danger': 'true',
                  'aria-label': t('remove'),
                  onClick: () => {
                    overCardRef.current = false
                    updateHoverCard(null)
                    void store.operate({ sessionId, action: 'remove', id: liveHovered.id })
                  },
                }, h(IconTrash, { size: 13 })))))
            : null
          const hoverNode = hoverEl && typeof document !== 'undefined' && ReactDOM?.createPortal && document.body
            ? ReactDOM.createPortal(hoverEl, document.body)
            : hoverEl

          return h(React.Fragment, null,
            composerNode,
            hoverNode,
            h('div', { ref: dockRef, className: 'dann-dock', 'data-dann-ui': '' },
              h('div', { className: 'dann-dock-panel' },
                single
                  ? h('div', { className: 'dann-dock-bar' },
                    h('span', { className: 'dann-lead', 'aria-hidden': true }, h(IconPin, { size: 15 })),
                    h('div', { className: 'dann-dock-single' },
                      h('button', {
                        type: 'button',
                        className: 'dann-single-quote',
                        title: t('jump'),
                        onClick: () => handleJump(single),
                      }, shortTargetText(single.anchor)),
                      single.intent !== 'note' ? h(Tag, { tone: 'neutral' }, intentLabel(t, single.intent)) : null,
                      h('button', {
                        type: 'button',
                        className: 'dann-single-note',
                        title: t('edit'),
                        onClick: () => openEdit(single),
                      }, oneLine(single.note))),
                    h('div', { className: 'dann-dock-right' },
                      composerEmpty && inputActions
                        ? h(Tooltip, { portal: true, label: t('dockSendHint'), side: 'top', delayMs: 500 },
                          h(Button, { size: 'sm', variant: 'outline', onClick: handleSendNow }, t('dockSendNow')))
                        : null,
                      h(Tooltip, { portal: true, label: t('edit'), side: 'top', delayMs: 500 },
                        h('button', {
                          type: 'button',
                          className: 'dann-icon-btn',
                          'aria-label': t('edit'),
                          onClick: () => openEdit(single),
                        }, h(IconEdit, { size: 14 }))),
                      h(Tooltip, { portal: true, label: t('remove'), side: 'top', delayMs: 500 },
                        h('button', {
                          type: 'button',
                          className: 'dann-icon-btn',
                          'data-danger': 'true',
                          'aria-label': t('remove'),
                          onClick: () => void store.operate({ sessionId, action: 'remove', id: single.id }),
                        }, h(IconClose, { size: 14 })))))
                  : h(React.Fragment, null,
                    h('div', { className: 'dann-dock-bar' },
                      h('button', {
                        type: 'button',
                        className: 'dann-dock-header-btn',
                        'aria-expanded': expanded,
                        'aria-label': expanded ? t('dockCollapse') : t('dockExpand'),
                        onClick: () => setExpanded(v => !v),
                      },
                      h('span', { className: 'dann-lead', 'aria-hidden': true }, h(IconPin, { size: 15 })),
                      h('span', null, t('dockPending', { n: drafts.length }))),
                      h('div', { className: 'dann-dock-right' },
                        composerEmpty && inputActions
                          ? h(Tooltip, { portal: true, label: t('dockSendHint'), side: 'top', delayMs: 500 },
                            h(Button, { size: 'sm', variant: 'outline', onClick: handleSendNow }, t('dockSendNow')))
                          : null,
                        h(Tooltip, { portal: true, label: expanded ? t('dockCollapse') : t('dockExpand'), side: 'top', delayMs: 500 },
                          h('button', {
                            type: 'button',
                            className: 'dann-icon-btn',
                            'aria-expanded': expanded,
                            'aria-label': expanded ? t('dockCollapse') : t('dockExpand'),
                            onClick: () => setExpanded(v => !v),
                          }, expanded ? h(IconChevronDown, { size: 14 }) : h(IconChevronUp, { size: 14 }))))),
                    expanded
                      ? h('div', { className: 'dann-drawer' },
                        h('ul', { className: 'dann-list' },
                          drafts.map(item => h('li', { key: item.id, className: 'dann-row' },
                            h('div', { className: 'dann-row-main' },
                              h('div', { className: 'dann-row-top' },
                                item.intent !== 'note' ? h(Tag, { tone: 'neutral' }, intentLabel(t, item.intent)) : null,
                                h('button', {
                                  type: 'button',
                                  className: 'dann-row-target',
                                  title: t('jump'),
                                  onClick: () => handleJump(item),
                                }, item.anchor.kind === 'git-diff' ? formatDiffPlace(item.anchor) : `“${oneLine(item.anchor.quote)}”`)),
                              h('button', {
                                type: 'button',
                                className: 'dann-row-note',
                                title: t('edit'),
                                onClick: () => openEdit(item),
                              }, item.note)),
                            h('div', { className: 'dann-row-acts' },
                              h(Tooltip, { portal: true, label: t('edit'), side: 'bottom', delayMs: 500 },
                                h('button', {
                                  type: 'button',
                                  className: 'dann-icon-btn',
                                  'aria-label': t('edit'),
                                  onClick: () => openEdit(item),
                                }, h(IconEdit, { size: 14 }))),
                              h(Tooltip, { portal: true, label: t('remove'), side: 'bottom', delayMs: 500 },
                                h('button', {
                                  type: 'button',
                                  className: 'dann-icon-btn',
                                  'data-danger': 'true',
                                  'aria-label': t('remove'),
                                  onClick: () => void store.operate({ sessionId, action: 'remove', id: item.id }),
                                }, h(IconTrash, { size: 14 }))))))),
                        h('div', { className: 'dann-drawer-foot' },
                          h(Button, {
                            size: 'sm',
                            variant: 'ghost',
                            disabled: snap.saving,
                            onClick: () => void store.operate({ sessionId, action: 'clear', scope: 'draft' }),
                          }, t('dockClear'))))
                      : null),
                notice ? h('div', { className: 'dann-notice', role: 'status' }, notice) : null)))
        }

        function ForgeCommentAction({ target, selection, empty, busy, send }) {
          useStyleEffect(ensureStyles, [])
          const t = useLocaleT()
          const onClick = () => {
            send(async body => {
              const clean = String(body ?? '').trim()
              if (!clean) return undefined
              try {
                await store.operate({
                  sessionId: target.sessionId,
                  action: 'add',
                  anchor: {
                    kind: 'git-diff',
                    source: target.source?.kind === 'change' ? 'cr' : 'local',
                    ...(target.source?.kind === 'change' && target.source.url ? { changeUrl: target.source.url } : {}),
                    path: selection.path,
                    side: selection.side,
                    startLine: selection.startLine,
                    endLine: selection.endLine,
                  },
                  note: clean,
                  intent: 'fix',
                })
                return undefined
              } catch (error) {
                return error?.message || t('saveFailed')
              }
            })
          }
          return h(Button, {
            size: 'sm',
            variant: 'outline',
            disabled: empty || busy,
            onClick,
          }, t('addToAnnotations'))
        }

        function ForgeLineAnnotationCard({ target, annotation }) {
          useStyleEffect(ensureStyles, [])
          const t = useLocaleT()
          const snap = useSessionAnnotations(target?.sessionId)
          const item = snap.items.find(entry => entry.id === annotation?.key)
          if (!item) return null
          const isDraft = item.status === 'draft'
          return h('div', { className: 'dann-forge-card', 'data-dann-ui': '' },
            h('div', { className: 'dann-forge-head' },
              h('div', { className: 'dann-forge-meta' },
                item.intent !== 'note' ? h(Tag, { tone: 'neutral' }, intentLabel(t, item.intent)) : null,
                h(Tag, { tone: isDraft ? 'warning' : 'neutral' }, isDraft ? t('statusDraft') : (item.consumedAtTurn ? t('sentTurn', { n: item.consumedAtTurn }) : t('statusConsumed')))),
              h('div', { className: 'dann-forge-acts' },
                h(Tooltip, { portal: true, label: t('edit'), side: 'bottom', delayMs: 500 },
                  h('button', {
                    type: 'button',
                    className: 'dann-icon-btn',
                    'aria-label': t('edit'),
                    onClick: () => uiBus.open({
                      mode: 'edit',
                      sessionId: target.sessionId,
                      itemId: item.id,
                      anchor: item.anchor,
                      initialNote: item.note,
                      initialIntent: item.intent,
                    }),
                  }, h(IconEdit, { size: 14 }))),
                !isDraft
                  ? h(Tooltip, { portal: true, label: t('requeue'), side: 'bottom', delayMs: 500 },
                    h('button', {
                      type: 'button',
                      className: 'dann-icon-btn',
                      'aria-label': t('requeue'),
                      onClick: () => void store.operate({ sessionId: target.sessionId, action: 'requeue', id: item.id }),
                    }, h(IconRefresh, { size: 14 })))
                  : null,
                h(Tooltip, { portal: true, label: t('remove'), side: 'bottom', delayMs: 500 },
                  h('button', {
                    type: 'button',
                    className: 'dann-icon-btn',
                    'data-danger': 'true',
                    'aria-label': t('remove'),
                    onClick: () => void store.operate({ sessionId: target.sessionId, action: 'remove', id: item.id }),
                  }, h(IconTrash, { size: 14 }))))),
            h('div', { className: 'dann-forge-note' }, item.note))
        }

        function ForgeFileMenuAction({ target, file, dismiss }) {
          useStyleEffect(ensureStyles, [])
          const t = useLocaleT()
          return h(MenuItemButton, {
            icon: h(IconPin, { size: 14 }),
            onSelect: () => {
              dismiss?.()
              uiBus.open({
                mode: 'create',
                sessionId: target.sessionId,
                anchor: {
                  kind: 'git-diff',
                  source: target.source?.kind === 'change' ? 'cr' : 'local',
                  ...(target.source?.kind === 'change' && target.source.url ? { changeUrl: target.source.url } : {}),
                  path: file.path,
                  side: 'file',
                  ...(file.digest ? { digest: file.digest } : {}),
                },
              })
            },
          }, t('annotateFile'))
        }

        function ForgeToolbarBadge({ target, form, close }) {
          useStyleEffect(ensureStyles, [])
          const t = useLocaleT()
          const snap = useSessionAnnotations(target?.sessionId)
          const count = React.useMemo(() => {
            const expected = target?.source?.kind === 'change' ? 'cr' : 'local'
            return snap.items.filter(item => item.status === 'draft' && item.anchor?.kind === 'git-diff' && item.anchor.source === expected).length
          }, [snap.items, target?.source?.kind])
          if (count === 0) return null
          const onReveal = () => {
            close?.()
            uiBus.revealDock(target?.sessionId)
          }
          if (form === 'menu') {
            return h(MenuItemButton, {
              icon: h(IconPin, { size: 14 }),
              onSelect: onReveal,
            }, t('toolbarLabel', { n: count }))
          }
          return h('button', {
            type: 'button',
            className: 'dann-toolbar-btn',
            'aria-label': t('toolbarLabel', { n: count }),
            onClick: onReveal,
          },
          h(IconPin, { size: 14 }),
          h('span', null, t('dockTitle')),
          h('span', { className: 'dann-toolbar-count' }, count))
        }

        ctx.slots.inject('conversation.chat.text-interaction', () => ctx.slots.register({
          name: 'conversation.chat.text-interaction',
          key: 'quote',
          priority: -10,
          locale: NS,
        }, SelectionActionBar))

        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'annotations',
          order: 10,
          locale: NS,
        }, InputDock))

        ctx.slots.inject('forge.diff.comment.actions', () => ctx.slots.register({
          name: 'forge.diff.comment.actions',
          id: 'annotations',
          order: 10,
          locale: NS,
        }, ForgeCommentAction))

        ctx.slots.inject('forge.diff.line.annotation', () => ctx.slots.register({
          name: 'forge.diff.line.annotation',
          key: FORGE_SOURCE_ID,
          locale: NS,
        }, ForgeLineAnnotationCard))

        ctx.slots.inject('forge.changes.file.menu', () => ctx.slots.register({
          name: 'forge.changes.file.menu',
          id: 'annotations',
          order: 10,
          locale: NS,
        }, ForgeFileMenuAction))

        ctx.slots.inject('forge.changes.toolbar', () => ctx.slots.register({
          name: 'forge.changes.toolbar',
          id: 'annotations',
          order: 10,
          locale: NS,
        }, ForgeToolbarBadge))

        ctx.inject(['forgeChanges'], scope => {
          scope.effect(() => scope.forgeChanges.registerAnnotations({
            id: FORGE_SOURCE_ID,
            order: 10,
            observe(target) {
              const sessionId = target.sessionId
              const targetSource = target.source
              let cachedItems = null
              let cachedMap = new Map()
              const getSnapshot = () => {
                const items = store.get(sessionId).items
                if (items !== cachedItems) {
                  cachedItems = items
                  cachedMap = buildForgeMap(items, targetSource)
                }
                return cachedMap
              }
              return {
                getSnapshot,
                subscribe(listener) {
                  void store.load(sessionId)
                  return store.subscribe(sessionId, listener)
                },
              }
            },
          }), 'annotations: forge annotation source')
        })
      },
      _internal: {
        DICTS,
        compact,
        shortTargetText,
        formatDiffPlace,
        buildForgeMap,
        computePopoverStyle,
        captureSelectionAnchor,
        locateAnchorRange,
        createStore,
      },
    }
  },
})
