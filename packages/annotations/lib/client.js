window.__ModuleLoader__.load({
  id: 'dsh-annotations',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement

    const NS = 'annotations'
    const STATE_PATH = 'annotations/state'
    const OP_PATH = 'annotations/op'
    const CHANNEL_NAME = 'dsh-annotations'
    const FORGE_SOURCE_ID = 'dsh-annotations'
    const HL_DRAFT = 'dsh-ann-draft'
    const HL_CONSUMED = 'dsh-ann-consumed'
    const HL_JUMP = 'dsh-ann-jump'
    const JUMP_MS = 2200
    const WAKE_COOLDOWN_MS = 10_000
    const AFFIX_CHARS = 48
    const PREFIX_FALLBACK = 44
    const INTENTS = ['note', 'fix', 'question', 'revise', 'constraint']
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
        notePlaceholder: 'Write your annotation note…',
        noteLabel: 'Annotation note',
        save: 'Save',
        add: 'Add annotation',
        cancel: 'Cancel',
        close: 'Close',
        dockPending: '{n} pending',
        dockPendingShort: '{n}',
        dockTitle: 'Annotations',
        dockExpand: 'Expand annotations',
        dockCollapse: 'Collapse annotations',
        dockSendNow: 'Send',
        dockSendHint: 'Send pending annotations with a default prompt',
        dockDefaultPrompt: 'Please address the attached annotations.',
        dockClear: 'Clear pending',
        tabPending: 'Pending ({n})',
        tabSent: 'Sent ({n})',
        emptyPending: 'No pending annotations.',
        emptySent: 'No sent annotations yet.',
        sourceDiff: 'Diff',
        sourceAi: 'AI',
        sourceUser: 'Me',
        intentNote: 'Note',
        intentFix: 'Fix',
        intentQuestion: 'Question',
        intentRevise: 'Revise',
        intentConstraint: 'Rule',
        statusDraft: 'Pending',
        statusConsumed: 'Sent',
        statusOutdated: 'Outdated',
        sentTurn: 'Turn {n}',
        toggleInclude: 'Include in next turn',
        jump: 'Jump to target',
        edit: 'Edit',
        requeue: 'Re-queue',
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
        notePlaceholder: '写下你的标注说明…',
        noteLabel: '标注内容',
        save: '保存',
        add: '加入标注',
        cancel: '取消',
        close: '关闭',
        dockPending: '{n} 条待注入',
        dockPendingShort: '{n}',
        dockTitle: '标注',
        dockExpand: '展开标注列表',
        dockCollapse: '收起标注列表',
        dockSendNow: '直接发送',
        dockSendHint: '使用默认提示词立即发送待注入标注',
        dockDefaultPrompt: '请处理附带的标注。',
        dockClear: '清空待注入',
        tabPending: '待注入 ({n})',
        tabSent: '已发送 ({n})',
        emptyPending: '暂无待注入标注。',
        emptySent: '暂无已发送标注。',
        sourceDiff: 'Diff',
        sourceAi: 'AI',
        sourceUser: '我',
        intentNote: '备注',
        intentFix: '修改',
        intentQuestion: '追问',
        intentRevise: '修订',
        intentConstraint: '约束',
        statusDraft: '待注入',
        statusConsumed: '已发送',
        statusOutdated: '已过时',
        sentTurn: '第 {n} 轮',
        toggleInclude: '本轮附带注入',
        jump: '定位原文',
        edit: '编辑',
        requeue: '重新加入',
        remove: '删除',
        notFound: '原文不在当前已加载视图中',
        toolbarLabel: '标注 ({n})',
        saveFailed: '保存标注失败',
      },
    }

    const CSS_TEXT = `
.dann-selbar{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:999px;background:var(--dsw-alias-button-floating-fill);--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);box-shadow:var(--dsw-elevation-panel)}
.dann-selbtn{border:none;border-radius:999px;padding:4px 10px;background:transparent;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13,500 13px/18px inherit);cursor:pointer;white-space:nowrap}
.dann-selbtn[data-accent="true"]{color:var(--dsw-alias-brand-primary)}
.dann-selbtn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.dann-selbtn:hover{background:var(--dsw-alias-button-floating-hover,var(--dsw-alias-interactive-bg-hover))}}
.dann-seldiv{width:1px;height:14px;background:var(--dsw-alias-border-l2);flex:none}
.dann-pop{position:fixed;z-index:10050;width:min(368px,calc(100vw - 24px));border-radius:var(--dsw-radius-lg,12px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-elevated,var(--dsw-alias-bg-primary));color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-panel,0 10px 30px rgba(0,0,0,.22));padding:10px 12px;display:flex;flex-direction:column;gap:8px;box-sizing:border-box}
.dann-pop-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dann-pop-title{display:inline-flex;align-items:center;gap:6px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13px;font-weight:600}
.dann-excerpt{margin:0;padding:6px 8px;border-radius:var(--dsw-radius-sm,6px);background:var(--dsw-alias-bg-secondary);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.45;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere}
.dann-excerpt[data-code="true"]{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11.5px}
.dann-intents{display:flex;flex-wrap:wrap;gap:4px}
.dann-intent{border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:2px 8px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;cursor:pointer}
.dann-intent[data-active="true"]{border-color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-brand-primary);font-weight:500}
.dann-textarea{width:100%;min-height:66px;max-height:160px;resize:vertical;box-sizing:border-box;padding:7px 9px;border-radius:var(--dsw-radius-md,8px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-primary);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.45;outline:none}
.dann-textarea:focus{border-color:var(--dsw-alias-brand-primary)}
.dann-pop-foot{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dann-pop-err{font-size:11.5px;color:var(--dsw-alias-state-error-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dann-pop-acts{display:inline-flex;align-items:center;gap:6px;margin-left:auto}
.dann-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,6px);padding:4px 10px;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;line-height:16px;cursor:pointer;white-space:nowrap}
.dann-btn[data-primary="true"]{border-color:transparent;background:var(--dsw-alias-brand-primary);color:#fff}
.dann-btn[data-ghost="true"]{border-color:transparent;padding:3px 6px;color:var(--dsw-alias-label-secondary)}
.dann-btn[data-danger="true"]{color:var(--dsw-alias-state-error-primary)}
.dann-btn:disabled{opacity:.45;cursor:default}
@media (hover:hover){.dann-btn:not(:disabled):hover{background:var(--dsw-alias-interactive-bg-hover)}.dann-btn[data-primary="true"]:not(:disabled):hover{filter:brightness(1.06)}}
.dann-dock{width:100%;box-sizing:border-box;border-radius:var(--dsw-radius-md,10px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-secondary);color:var(--dsw-alias-label-primary);font-size:12px;margin-bottom:6px;overflow:hidden}
.dann-dock-bar{display:flex;align-items:center;gap:6px;padding:5px 8px;min-height:30px}
.dann-dock-toggle{display:inline-flex;align-items:center;gap:5px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-weight:500;padding:2px 4px;border-radius:var(--dsw-radius-sm,6px);cursor:pointer;white-space:nowrap;flex:none}
@media (hover:hover){.dann-dock-toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.dann-chips{display:flex;align-items:center;gap:4px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none}
.dann-chips::-webkit-scrollbar{display:none}
.dann-chip{display:inline-flex;align-items:center;gap:4px;max-width:170px;min-width:0;overflow:hidden;white-space:nowrap;padding:2px 7px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-primary);color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;cursor:pointer;flex:none}
.dann-chip[data-disabled="true"]{opacity:.48;text-decoration:line-through}
.dann-chip-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dann-id{font-weight:600;color:var(--dsw-alias-brand-primary);font-variant-numeric:tabular-nums}
.dann-dock-right{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:auto}
.dann-drawer{border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-primary);display:flex;flex-direction:column}
.dann-tabs{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 8px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dann-tab-row{display:inline-flex;gap:4px}
.dann-tab{border:none;border-radius:var(--dsw-radius-sm,6px);padding:2px 8px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11.5px;cursor:pointer}
.dann-tab[aria-selected="true"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:500}
.dann-list{max-height:220px;overflow-y:auto;padding:4px 6px;display:flex;flex-direction:column;gap:4px}
.dann-empty{padding:10px 8px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dann-row{display:flex;align-items:flex-start;gap:6px;padding:6px 7px;border-radius:var(--dsw-radius-sm,8px);border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-secondary)}
.dann-row[data-disabled="true"]{opacity:.55}
.dann-row-chk{margin-top:2px;flex:none;cursor:pointer}
.dann-row-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}
.dann-row-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dann-badge{display:inline-flex;align-items:center;padding:0 5px;border-radius:4px;font-size:10.5px;line-height:16px;font-weight:500;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
.dann-badge[data-tone="diff"]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,transparent);color:var(--dsw-alias-state-success-primary)}
.dann-badge[data-tone="ai"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}
.dann-badge[data-tone="user"]{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent);color:var(--dsw-alias-state-warn-primary)}
.dann-row-target{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11.5px;cursor:pointer;border:none;background:transparent;padding:0;text-align:left;max-width:100%}
.dann-row-note{font-size:12.5px;line-height:1.4;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}
.dann-row-acts{display:inline-flex;align-items:center;gap:2px;flex:none}
.dann-notice{padding:4px 8px;font-size:11.5px;color:var(--dsw-alias-state-error-primary);border-top:1px solid var(--dsw-alias-border-l1)}
.dann-forge-card{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:6px 8px;font-size:12px;line-height:1.45;color:var(--dsw-alias-label-primary)}
.dann-forge-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}
.dann-forge-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dann-forge-note{white-space:pre-wrap;overflow-wrap:anywhere}
.dann-forge-acts{display:inline-flex;align-items:center;gap:2px;flex:none}
.dann-toolbar-btn{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:none;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;white-space:nowrap}
@media (hover:hover){.dann-toolbar-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
::highlight(${HL_DRAFT}){background-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 24%,transparent);text-decoration:underline;text-decoration-color:var(--dsw-alias-state-warn-primary);text-decoration-thickness:1.5px}
::highlight(${HL_CONSUMED}){background-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 11%,transparent)}
::highlight(${HL_JUMP}){background-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 34%,transparent)}
[data-dann-flash]{border-radius:6px;animation:dann-flash ${JUMP_MS}ms ease-out forwards}
@keyframes dann-flash{0%,55%{box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent)}100%{box-shadow:0 0 0 3px transparent;background-color:transparent}}
@media (prefers-reduced-motion:reduce){[data-dann-flash]{animation:none;box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent)}}
@media (max-width:600px){.dann-dock-bar{padding:4px 6px;gap:4px}.dann-chip{max-width:118px;padding:1px 6px}.dann-hide-sm{display:none}}
`

    const IconPin = () => h('svg', { viewBox: '0 0 16 16', width: 13, height: 13, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'M3.5 3.5h9v7.5H7l-3.5 2.5V3.5Z' }),
      h('path', { d: 'M6 6.5h4M6 8.8h2.5' }))

    const IconChevron = ({ open }) => h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .12s' } },
      h('path', { d: 'M6 4l4 4-4 4' }))

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

    function syncChatHighlights(items) {
      if (!globalThis.Highlight || !globalThis.CSS?.highlights) return
      const draftRanges = []
      const consumedRanges = []
      for (const item of items) {
        if (item.anchor?.kind !== 'message-text' || item.status === 'resolved') continue
        const found = locateAnchorRange(item.anchor)
        if (!found) continue
        if (item.status === 'draft') draftRanges.push(found.range)
        else consumedRanges.push(found.range)
      }
      if (draftRanges.length > 0) CSS.highlights.set(HL_DRAFT, new Highlight(...draftRanges))
      else CSS.highlights.delete(HL_DRAFT)
      if (consumedRanges.length > 0) CSS.highlights.set(HL_CONSUMED, new Highlight(...consumedRanges))
      else CSS.highlights.delete(HL_CONSUMED)
    }

    function clearChatHighlights() {
      clearJumpHighlight()
      if (!globalThis.CSS?.highlights) return
      CSS.highlights.delete(HL_DRAFT)
      CSS.highlights.delete(HL_CONSUMED)
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
      const estH = 260
      if (!rect) return { top: Math.max(16, Math.round((vh - estH) / 2)), left: Math.max(12, Math.round((vw - w) / 2)) }
      const left = Math.max(12, Math.min(vw - w - 12, Math.round(rect.left)))
      const below = rect.bottom + 10
      const top = below + estH <= vh - 12
        ? Math.round(below)
        : Math.max(12, Math.round(rect.top - estH - 10))
      return { top, left }
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

    const EMPTY_SESSION = Object.freeze({ items: [], loaded: false, loading: false, saving: false, error: null, fetchedAt: 0 })

    function createStore() {
      const sessions = new Map()
      const listeners = new Map()
      const inflight = new Map()
      let channel = null

      const get = sessionId => (sessionId ? sessions.get(sessionId) ?? EMPTY_SESSION : EMPTY_SESSION)

      const notify = sessionId => {
        const set = listeners.get(sessionId)
        if (!set) return
        for (const fn of set) fn()
      }

      const setSession = (sessionId, patch) => {
        const prev = get(sessionId)
        const next = { ...prev, ...patch }
        sessions.set(sessionId, next)
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
        if (existing) return existing
        setSession(sessionId, { loading: true, error: null })
        const url = `${STATE_PATH}?sessionId=${encodeURIComponent(sessionId)}`
        const req = fetch(url, { headers: { accept: 'application/json' } })
          .then(async res => {
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
            const items = Array.isArray(data.items) ? data.items : []
            setSession(sessionId, { items, loaded: true, loading: false, error: null, fetchedAt: Date.now() })
            return items
          })
          .catch(error => {
            setSession(sessionId, { loading: false, error: error?.message ?? String(error) })
            return get(sessionId).items
          })
          .finally(() => {
            inflight.delete(sessionId)
          })
        inflight.set(sessionId, req)
        return req
      }

      const operate = async payload => {
        const sessionId = payload?.sessionId
        if (!sessionId) throw new Error('missing sessionId')
        setSession(sessionId, { saving: true, error: null })
        try {
          const res = await fetch(OP_PATH, {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify(payload),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
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
        if (typeof BroadcastChannel !== 'function') return () => {}
        try {
          channel = new BroadcastChannel(CHANNEL_NAME)
          channel.addEventListener('message', event => {
            const msg = event?.data
            if (msg?.type === 'sync' && typeof msg.sessionId === 'string' && Array.isArray(msg.items)) {
              setSession(msg.sessionId, { items: msg.items, loaded: true, loading: false, error: null, fetchedAt: Date.now() })
            }
          })
        } catch {
          channel = null
        }
        return () => {
          try { channel?.close?.() } catch {}
          channel = null
        }
      }

      return { get, load, operate, subscribe, connect }
    }

    function createComposerBus() {
      let draft = null
      const listeners = new Set()
      const emit = () => { for (const fn of listeners) fn() }
      return {
        get: () => draft,
        subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn) },
        open: next => { draft = next; emit() },
        close: () => { if (draft !== null) { draft = null; emit() } },
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', DICTS.en), 'annotations: locale en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICTS.zh), 'annotations: locale zh')
        const bindT = () => ctx.locale.bind(NS)

        const store = createStore()
        const composerBus = createComposerBus()

        ctx.effect(() => store.connect(), 'annotations: broadcast channel')

        ctx.effect(() => {
          if (typeof document === 'undefined') return () => {}
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-annotations'
          style.textContent = CSS_TEXT
          document.head.appendChild(style)
          return () => {
            style.remove()
            clearChatHighlights()
          }
        }, 'annotations: styles')

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

        const sourceBadge = (t, anchor) => {
          if (anchor.kind === 'git-diff') return { text: t('sourceDiff'), tone: 'diff' }
          if (anchor.speaker === 'user') return { text: t('sourceUser'), tone: 'user' }
          return { text: t('sourceAi'), tone: 'ai' }
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
          const t = useLocaleT()
          const [note, setNote] = React.useState(request.initialNote ?? '')
          const [intent, setIntent] = React.useState(request.initialIntent ?? (
            request.anchor.kind === 'git-diff' ? 'fix'
              : request.anchor.speaker === 'user' ? 'revise' : 'note'
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

          const badge = sourceBadge(t, request.anchor)
          const excerpt = request.anchor.kind === 'git-diff'
            ? (request.anchor.snippet || formatDiffPlace(request.anchor))
            : request.anchor.quote
          const pos = React.useMemo(() => computePopoverStyle(request.rect), [request.rect])

          const card = h('div', {
            ref: popRef,
            className: 'dann-pop',
            'data-dann-ui': '',
            role: 'dialog',
            'aria-label': request.mode === 'edit' ? t('modalTitleEdit') : t('modalTitleNew'),
            style: pos,
          },
          h('div', { className: 'dann-pop-head' },
            h('span', { className: 'dann-pop-title' },
              h('span', { className: 'dann-badge', 'data-tone': badge.tone }, badge.text),
              h('span', null, request.mode === 'edit' ? t('modalTitleEdit') : t('modalTitleNew'))),
            h('button', { type: 'button', className: 'dann-btn', 'data-ghost': 'true', onClick: onClose, 'aria-label': t('close') }, '×')),
          h('p', { className: 'dann-excerpt', 'data-code': request.anchor.kind === 'git-diff' ? 'true' : undefined }, excerpt),
          h('div', { className: 'dann-intents', role: 'group' },
            INTENTS.map(code => h('button', {
              key: code,
              type: 'button',
              className: 'dann-intent',
              'data-active': intent === code ? 'true' : undefined,
              onClick: () => setIntent(code),
            }, intentLabel(t, code)))),
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
          h('div', { className: 'dann-pop-foot' },
            err ? h('span', { className: 'dann-pop-err', role: 'alert' }, err) : null,
            h('div', { className: 'dann-pop-acts' },
              h('button', { type: 'button', className: 'dann-btn', disabled: busy, onClick: onClose }, t('cancel')),
              h('button', { type: 'button', className: 'dann-btn', 'data-primary': 'true', disabled: busy || !note.trim(), onClick: () => void submit() },
                request.mode === 'edit' ? t('save') : t('add')))))

          if (typeof document !== 'undefined' && ReactDOM?.createPortal && document.body) {
            return ReactDOM.createPortal(card, document.body)
          }
          return card
        }

        function SelectionActionBar({ sessionId, dismiss, readText, clearSelection, inputActions, useSession }) {
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
            composerBus.open({
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
            }, t('annotate')))
        }

        function InputDock({ sessionId, inputState, inputActions }) {
          const t = useLocaleT()
          const snap = useSessionAnnotations(sessionId)
          const activeComposer = React.useSyncExternalStore(composerBus.subscribe, composerBus.get)
          const [expanded, setExpanded] = React.useState(false)
          const [tab, setTab] = React.useState('draft')
          const [notice, setNotice] = React.useState('')
          const prevPhaseRef = React.useRef(inputState?.phase)

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
              const hasDraft = store.get(sessionId).items.some(item => item.status === 'draft' && item.enabled)
              if (hasDraft) {
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
              composerBus.open({ mode: 'create', sessionId, anchor: captured.anchor, rect: captured.rect })
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
            syncChatHighlights(snap.items)
            return () => { clearChatHighlights() }
          }, [snap.items])

          const drafts = React.useMemo(() => snap.items.filter(item => item.status === 'draft'), [snap.items])
          const sent = React.useMemo(() => snap.items.filter(item => item.status !== 'draft'), [snap.items])
          const activeDraftCount = React.useMemo(() => drafts.filter(item => item.enabled).length, [drafts])

          const composerNode = activeComposer && activeComposer.sessionId === sessionId
            ? h(AnnotationComposer, { request: activeComposer, onClose: composerBus.close })
            : null

          if (!sessionId || (drafts.length === 0 && sent.length === 0)) return composerNode

          const handleJump = item => {
            if (item.anchor.kind === 'git-diff') {
              if (!openDiffTarget(sessionId, item.anchor)) setNotice(t('notFound'))
              return
            }
            if (!jumpToMessageAnchor(item.anchor)) setNotice(t('notFound'))
          }

          const handleSendNow = () => {
            if (!inputActions || activeDraftCount === 0) return
            const currentDraft = typeof inputState?.draft === 'string' ? inputState.draft.trim() : ''
            if (!currentDraft && typeof inputActions.setDraft === 'function') {
              inputActions.setDraft(t('dockDefaultPrompt'))
            }
            inputActions.submit?.()
          }

          const visibleList = tab === 'draft' ? drafts : sent

          return h(React.Fragment, null,
            composerNode,
            h('div', { className: 'dann-dock', 'data-dann-ui': '' },
              h('div', { className: 'dann-dock-bar' },
                h('button', {
                  type: 'button',
                  className: 'dann-dock-toggle',
                  'aria-expanded': expanded,
                  'aria-label': expanded ? t('dockCollapse') : t('dockExpand'),
                  onClick: () => setExpanded(v => !v),
                },
                h(IconChevron, { open: expanded }),
                h(IconPin),
                h('span', { className: 'dann-hide-sm' }, drafts.length > 0 ? t('dockPending', { n: activeDraftCount }) : t('dockTitle')),
                h('span', { className: 'dann-id' }, drafts.length > 0 ? `(${activeDraftCount})` : `(${sent.length})`)),
                h('div', { className: 'dann-chips' },
                  drafts.slice(0, 6).map(item => h('button', {
                    key: item.id,
                    type: 'button',
                    className: 'dann-chip',
                    'data-disabled': item.enabled ? undefined : 'true',
                    title: `${item.shortId}: ${item.note}`,
                    onClick: () => handleJump(item),
                  },
                  h('span', { className: 'dann-id' }, item.shortId),
                  h('span', { className: 'dann-chip-label' }, shortTargetText(item.anchor))))),
                h('div', { className: 'dann-dock-right' },
                  activeDraftCount > 0 && inputActions
                    ? h('button', {
                      type: 'button',
                      className: 'dann-btn',
                      'data-primary': 'true',
                      title: t('dockSendHint'),
                      onClick: handleSendNow,
                    }, t('dockSendNow'))
                    : null,
                  drafts.length > 0
                    ? h('button', {
                      type: 'button',
                      className: 'dann-btn dann-hide-sm',
                      'data-ghost': 'true',
                      disabled: snap.saving,
                      onClick: () => void store.operate({ sessionId, action: 'clear', scope: 'draft' }),
                    }, t('dockClear'))
                    : null)),
              expanded
                ? h('div', { className: 'dann-drawer' },
                  h('div', { className: 'dann-tabs', role: 'tablist' },
                    h('div', { className: 'dann-tab-row' },
                      h('button', { type: 'button', role: 'tab', className: 'dann-tab', 'aria-selected': tab === 'draft', onClick: () => setTab('draft') }, t('tabPending', { n: drafts.length })),
                      h('button', { type: 'button', role: 'tab', className: 'dann-tab', 'aria-selected': tab === 'sent', onClick: () => setTab('sent') }, t('tabSent', { n: sent.length }))),
                    tab === 'draft' && drafts.length > 0
                      ? h('button', { type: 'button', className: 'dann-btn', 'data-ghost': 'true', onClick: () => void store.operate({ sessionId, action: 'clear', scope: 'draft' }) }, t('dockClear'))
                      : null),
                  h('div', { className: 'dann-list' },
                    visibleList.length === 0
                      ? h('div', { className: 'dann-empty' }, tab === 'draft' ? t('emptyPending') : t('emptySent'))
                      : visibleList.map(item => {
                        const badge = sourceBadge(t, item.anchor)
                        const isDraft = item.status === 'draft'
                        return h('div', { key: item.id, className: 'dann-row', 'data-disabled': isDraft && !item.enabled ? 'true' : undefined },
                          isDraft
                            ? h('input', {
                              type: 'checkbox',
                              className: 'dann-row-chk',
                              checked: item.enabled,
                              'aria-label': t('toggleInclude'),
                              onChange: () => void store.operate({ sessionId, action: 'toggle', id: item.id }),
                            })
                            : null,
                          h('div', { className: 'dann-row-main' },
                            h('div', { className: 'dann-row-meta' },
                              h('span', { className: 'dann-id' }, item.shortId),
                              h('span', { className: 'dann-badge', 'data-tone': badge.tone }, badge.text),
                              item.intent !== 'note' ? h('span', { className: 'dann-badge' }, intentLabel(t, item.intent)) : null,
                              !isDraft ? h('span', { className: 'dann-badge' }, item.consumedAtTurn ? t('sentTurn', { n: item.consumedAtTurn }) : t('statusConsumed')) : null),
                            h('button', {
                              type: 'button',
                              className: 'dann-row-target',
                              title: t('jump'),
                              onClick: () => handleJump(item),
                            }, item.anchor.kind === 'git-diff' ? formatDiffPlace(item.anchor) : `“${oneLine(item.anchor.quote)}”`),
                            h('div', { className: 'dann-row-note' }, item.note)),
                          h('div', { className: 'dann-row-acts' },
                            h('button', {
                              type: 'button',
                              className: 'dann-btn',
                              'data-ghost': 'true',
                              title: t('edit'),
                              onClick: () => composerBus.open({
                                mode: 'edit',
                                sessionId,
                                itemId: item.id,
                                anchor: item.anchor,
                                initialNote: item.note,
                                initialIntent: item.intent,
                              }),
                            }, t('edit')),
                            !isDraft
                              ? h('button', {
                                type: 'button',
                                className: 'dann-btn',
                                'data-ghost': 'true',
                                onClick: () => void store.operate({ sessionId, action: 'requeue', id: item.id }),
                              }, t('requeue'))
                              : null,
                            h('button', {
                              type: 'button',
                              className: 'dann-btn',
                              'data-ghost': 'true',
                              'data-danger': 'true',
                              onClick: () => void store.operate({ sessionId, action: 'remove', id: item.id }),
                            }, t('remove'))))
                      })))
                : null,
              notice ? h('div', { className: 'dann-notice', role: 'status' }, notice) : null))
        }

        function ForgeCommentAction({ target, selection, empty, busy, send }) {
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
          return h('button', {
            type: 'button',
            className: 'dann-btn',
            'data-primary': 'true',
            disabled: empty || busy,
            onClick,
          }, t('addToAnnotations'))
        }

        function ForgeLineAnnotationCard({ target, annotation }) {
          const t = useLocaleT()
          const snap = useSessionAnnotations(target?.sessionId)
          const item = snap.items.find(entry => entry.id === annotation?.key)
          if (!item) return null
          const isDraft = item.status === 'draft'
          return h('div', { className: 'dann-forge-card', 'data-dann-ui': '' },
            h('div', { className: 'dann-forge-body' },
              h('div', { className: 'dann-forge-meta' },
                h('span', { className: 'dann-id' }, item.shortId),
                h('span', { className: 'dann-badge', 'data-tone': 'diff' }, intentLabel(t, item.intent)),
                h('span', { className: 'dann-badge' }, isDraft ? t('statusDraft') : (item.consumedAtTurn ? t('sentTurn', { n: item.consumedAtTurn }) : t('statusConsumed')))),
              h('div', { className: 'dann-forge-note' }, item.note)),
            h('div', { className: 'dann-forge-acts' },
              h('button', {
                type: 'button',
                className: 'dann-btn',
                'data-ghost': 'true',
                onClick: () => composerBus.open({
                  mode: 'edit',
                  sessionId: target.sessionId,
                  itemId: item.id,
                  anchor: item.anchor,
                  initialNote: item.note,
                  initialIntent: item.intent,
                }),
              }, t('edit')),
              !isDraft
                ? h('button', {
                  type: 'button',
                  className: 'dann-btn',
                  'data-ghost': 'true',
                  onClick: () => void store.operate({ sessionId: target.sessionId, action: 'requeue', id: item.id }),
                }, t('requeue'))
                : null,
              h('button', {
                type: 'button',
                className: 'dann-btn',
                'data-ghost': 'true',
                'data-danger': 'true',
                onClick: () => void store.operate({ sessionId: target.sessionId, action: 'remove', id: item.id }),
              }, t('remove'))))
        }

        function ForgeFileMenuAction({ target, file, dismiss }) {
          const t = useLocaleT()
          return h('button', {
            type: 'button',
            className: 'dann-btn',
            'data-ghost': 'true',
            style: { width: '100%', justifyContent: 'flex-start', padding: '6px 10px' },
            onClick: () => {
              dismiss?.()
              composerBus.open({
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
          const t = useLocaleT()
          const snap = useSessionAnnotations(target?.sessionId)
          const count = React.useMemo(() => {
            const expected = target?.source?.kind === 'change' ? 'cr' : 'local'
            return snap.items.filter(item => item.status === 'draft' && item.enabled && item.anchor?.kind === 'git-diff' && item.anchor.source === expected).length
          }, [snap.items, target?.source?.kind])
          if (count === 0) return null
          return h('button', {
            type: 'button',
            className: form === 'menu' ? 'dann-btn' : 'dann-toolbar-btn',
            'data-ghost': form === 'menu' ? 'true' : undefined,
            onClick: () => {
              close?.()
              if (typeof document !== 'undefined') {
                document.querySelector?.('.dann-dock')?.scrollIntoView?.({ block: 'nearest' })
              }
            },
          }, h(IconPin), h('span', null, t('toolbarLabel', { n: count })))
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
