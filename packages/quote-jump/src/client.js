window.__ModuleLoader__.load({
  id: 'dsh-quote-jump',
  factory(require) {
    const React = require('react')
    const { IconCheckOutlineRegular, IconCopyOutlineRegular } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'quoteJump'
    const HIGHLIGHT = 'dsh-quote-jump'
    const HIGHLIGHT_MS = 2400
    const PREFIX = 48
    // external: mirrors dsh chat selection exclusions so quoted text aligns with rendered DOM
    const SKIP = '[data-quote-jump],script,style,textarea,[contenteditable="true"],[data-composer-seat],.katex-mathml,[data-text-interaction-exclude],.sr-only,[aria-hidden="true"]:not(.katex-html),button:not(code button)'

    const CSS_TEXT = `
.dqj-quote{display:block;position:relative;margin:2px 0 6px;padding:5px 32px 5px 14px;border-radius:var(--dsw-radius-md,8px);
  background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent);color:var(--dsw-alias-label-secondary);
  font-size:.93em;line-height:1.55;text-align:left;cursor:pointer;transition:background-color .12s}
.dqj-quote::before{content:"";position:absolute;left:5px;top:7px;bottom:7px;width:2.5px;border-radius:2px;
  background:var(--dsw-alias-brand-primary);opacity:.75}
.dqj-copy{position:absolute;top:5px;right:5px;display:inline-flex;align-items:center;justify-content:center;
  width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;
  color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:0;transition:opacity .12s,background-color .12s,color .12s}
.dqj-quote:hover .dqj-copy,.dqj-quote:focus-within .dqj-copy,.dqj-copy[data-copied="true"]{opacity:1}
.dqj-copy[data-copied="true"]{color:var(--dsw-alias-state-success-primary)}
@media (hover:hover){.dqj-copy:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.dqj-copy{opacity:.85}}
.dqj-copy:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dqj-text{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere}
.dqj-hint{display:block;margin-top:2px;font-size:12px;color:var(--dsw-alias-state-error-primary)}
.dqj-quote[data-state=missing]::before{background:var(--dsw-alias-state-error-primary)}
@media (hover:hover){.dqj-quote:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent)}}
.dqj-quote:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dqj-inline{color:var(--dsw-alias-label-secondary)}
::highlight(${HIGHLIGHT}){background-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,transparent)}
[data-dqj-flash]{border-radius:6px;animation:dqj-flash ${HIGHLIGHT_MS}ms ease-out forwards}
@keyframes dqj-flash{0%,60%{box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent)}100%{box-shadow:0 0 0 3px transparent;background-color:transparent}}
@media (prefers-reduced-motion:reduce){[data-dqj-flash]{animation:none;box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent)}}
`

    const isSpace = c => c === 32 || c === 160 || (c >= 9 && c <= 13) || c === 0x2028 || c === 0x2029 || c === 0x3000 || c === 0xFEFF || (c >= 0x2000 && c <= 0x200B)

    function compact(text) {
      let out = ''
      for (let i = 0; i < text.length; i++) if (!isSpace(text.charCodeAt(i))) out += text[i]
      return out
    }

    function indexText(root, exclude) {
      const doc = root.ownerDocument
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement
          if (parent === null || exclude.contains(node) || parent.closest(SKIP)) return NodeFilter.FILTER_REJECT
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

    function pickMatch(index, needle, anchor) {
      let chosen = -1
      for (let at = index.flat.indexOf(needle); at >= 0; at = index.flat.indexOf(needle, at + 1)) {
        const node = index.nodes[index.nodeOf[at + needle.length - 1]]
        if (node.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING) chosen = at
        else break
      }
      return chosen
    }

    function findRange(el, quote) {
      const target = compact(quote)
      if (target === '') return null
      const root = el.closest('[data-conversation-scroll]')
      if (!root) return null
      const exclude = el.closest('[data-chat-flow-kind="user"], [data-message-bubble]') ?? el
      const index = indexText(root, exclude)
      let needle = target
      let start = pickMatch(index, needle, exclude)
      if (start < 0 && target.length > PREFIX) {
        needle = target.slice(0, PREFIX)
        start = pickMatch(index, needle, exclude)
      }
      if (start < 0) return null
      const end = start + needle.length - 1
      const range = el.ownerDocument.createRange()
      range.setStart(index.nodes[index.nodeOf[start]], index.offsetOf[start])
      range.setEnd(index.nodes[index.nodeOf[end]], index.offsetOf[end] + 1)
      return { range, root }
    }

    function reveal(node, root) {
      let changed = false
      for (let p = node.parentElement; p !== null && p !== root; p = p.parentElement) {
        if (p.hidden || p.getAttribute('hidden') === 'until-found') { p.dispatchEvent(new Event('beforematch', { bubbles: true })); changed = true }
        if (p.tagName === 'DETAILS' && !p.open) { p.open = true; changed = true }
      }
      return changed
    }

    const BLOCKS = 'p,li,pre,td,th,blockquote,h1,h2,h3,h4,h5,h6,dd,dt,figcaption,[data-message-bubble]'

    function blockOf(range) {
      const el = range.startContainer.parentElement
      return el?.closest(BLOCKS) ?? el
    }

    function inView(range, scroller) {
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return false
      const box = scroller?.getBoundingClientRect() ?? { top: 0, bottom: innerHeight }
      return rect.bottom > box.top + 8 && rect.top < box.bottom - 8
    }

    // external: dsh chat tail-follow overrides smooth scroll, so scroll instantly
    function scrollToRange(range, block) {
      const scroller = block.closest('[data-conversation-scroll]')
      const rect = range.getBoundingClientRect()
      if (scroller !== null && rect.height > 0) {
        const box = scroller.getBoundingClientRect()
        const delta = rect.height > box.height * 0.6
          ? rect.top - box.top - 80
          : rect.top + rect.height / 2 - (box.top + box.height / 2)
        scroller.scrollTop += delta
      }
      if (!inView(range, scroller)) block.scrollIntoView({ block: 'center', behavior: 'instant' })
      return scroller
    }

    let clearTimer = null
    let flashed = null
    let reland = null
    let revealFrame = null
    function clearHighlight() {
      if (clearTimer !== null) clearTimeout(clearTimer)
      clearTimer = null
      clearTimeout(reland)
      cancelAnimationFrame(revealFrame)
      reland = null
      revealFrame = null
      if (globalThis.CSS?.highlights) CSS.highlights.delete(HIGHLIGHT)
      if (flashed !== null) { flashed.removeAttribute('data-dqj-flash'); flashed = null }
    }

    function scrollAndHighlight(range) {
      const block = blockOf(range)
      if (block === null || !block.isConnected) return false
      const scroller = scrollToRange(range, block)
      // external: re-land once if dsh chat tail-follow resets scrollTop
      reland = setTimeout(() => { if (range.startContainer.isConnected && !inView(range, scroller)) scrollToRange(range, block) }, 150)
      if (globalThis.Highlight && globalThis.CSS?.highlights) CSS.highlights.set(HIGHLIGHT, new Highlight(range))
      flashed = block
      flashed.removeAttribute('data-dqj-flash')
      void flashed.offsetWidth
      flashed.setAttribute('data-dqj-flash', '')
      clearTimer = setTimeout(clearHighlight, HIGHLIGHT_MS)
      return true
    }

    function jumpTo(el, quote) {
      clearHighlight()
      const found = findRange(el, quote)
      if (found === null) return false
      if (reveal(found.range.startContainer, found.root)) {
        revealFrame = requestAnimationFrame(() => {
          revealFrame = requestAnimationFrame(() => {
            if (!el.isConnected) return
            const again = findRange(el, quote)
            scrollAndHighlight(again?.range ?? found.range)
          })
        })
        return true
      }
      return scrollAndHighlight(found.range)
    }

    const oneLine = text => text.replace(/\s+/gu, ' ').trim()
    const plainQuoteBody = text => String(text ?? '').replace(/^>[ \t]?/gmu, '').trim()

    async function copyText(text) {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text)
          return true
        } catch {}
      }
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        ta.remove()
        return ok
      } catch {
        return false
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', {
          jump: 'Jump to the quoted text',
          notFound: 'The quoted text is not in the loaded conversation',
          copy: 'Copy quote',
          copied: 'Copied',
        }), 'quote-jump: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', {
          jump: '跳转到原文',
          notFound: '原文不在当前已加载的对话里',
          copy: '复制引用',
          copied: '已复制',
        }), 'quote-jump: zh')
        const t = ctx.locale.bind(NS)

        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-quote-jump'
          style.textContent = CSS_TEXT
          document.head.appendChild(style)
          return () => { style.remove(); clearHighlight() }
        }, 'quote-jump: styles')

        function QuoteJump({ node, interactive }) {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const ref = React.useRef(null)
          const [missing, setMissing] = React.useState(false)
          const [copied, setCopied] = React.useState(false)
          React.useEffect(() => {
            if (!missing) return undefined
            const timer = setTimeout(() => setMissing(false), 3500)
            return () => clearTimeout(timer)
          }, [missing])
          React.useEffect(() => {
            if (!copied) return undefined
            const timer = setTimeout(() => setCopied(false), 1500)
            return () => clearTimeout(timer)
          }, [copied])
          const text = node.data.text

          if (!interactive) return h('span', { className: 'dqj-inline', 'data-quote-jump': '' }, `❝ ${oneLine(text)} `)

          const activate = event => {
            event.stopPropagation()
            const selection = window.getSelection()
            if (selection && !selection.isCollapsed && ref.current?.contains(selection.anchorNode)) return
            if (ref.current === null) return
            const ok = jumpTo(ref.current, text)
            setMissing(!ok)
          }
          const onCopy = event => {
            event.preventDefault()
            event.stopPropagation()
            const body = plainQuoteBody(text)
            if (!body) return
            void copyText(body).then(ok => { if (ok) setCopied(true) })
          }
          return h('span', {
            ref,
            className: 'dqj-quote',
            'data-quote-jump': '',
            'data-state': missing ? 'missing' : undefined,
            role: 'button',
            tabIndex: 0,
            title: t('jump'),
            'aria-label': t('jump'),
            onClick: activate,
            onKeyDown: event => {
              if (event.target !== event.currentTarget) return
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              activate(event)
            },
          },
          h('span', { className: 'dqj-text' }, text),
          h('button', {
            type: 'button',
            className: 'dqj-copy',
            'data-copied': copied ? 'true' : undefined,
            title: copied ? t('copied') : t('copy'),
            'aria-label': copied ? t('copied') : t('copy'),
            onClick: onCopy,
          }, h(copied ? IconCheckOutlineRegular : IconCopyOutlineRegular, { size: 13 })),
          missing ? h('span', { className: 'dqj-hint', role: 'status' }, t('notFound')) : null)
        }

        ctx.slots.inject('conversation.user.text.node', () => ctx.slots.register({
          name: 'conversation.user.text.node',
          key: 'quote',
          priority: 50,
        }, QuoteJump))
      },
      _internal: { compact },
    }
  },
})
