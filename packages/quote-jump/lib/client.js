/**
 * dsh-quote-jump — browser-only plugin.
 *
 * Replaces the built-in quote pill in user messages with a quote block. Clicking
 * the block finds the quoted text earlier in the same conversation, scrolls it
 * into view and highlights it for a moment.
 */
window.__ModuleLoader__.load({
  id: 'dsh-quote-jump',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'quoteJump'
    const HIGHLIGHT = 'dsh-quote-jump'
    const HIGHLIGHT_MS = 2400
    const PREFIX = 48
    // Mirrors what the Chat leaves out when it copies a selection, so quoted text lines up with the DOM.
    const SKIP = '[data-quote-jump],script,style,textarea,[contenteditable="true"],[data-composer-seat],.katex-mathml,[data-text-interaction-exclude],.sr-only,[aria-hidden="true"]:not(.katex-html),button:not(code button)'

    const CSS_TEXT = `
.dqj-quote{display:block;position:relative;margin:2px 0 6px;padding:5px 10px 5px 14px;border-radius:8px;
  background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent);color:var(--dsw-alias-label-secondary);
  font-size:.93em;line-height:1.55;text-align:left;cursor:pointer;transition:background-color .12s}
.dqj-quote::before{content:"";position:absolute;left:5px;top:7px;bottom:7px;width:2.5px;border-radius:2px;
  background:var(--dsw-alias-brand-primary);opacity:.75}
.dqj-text{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere}
.dqj-hint{display:block;margin-top:2px;font-size:12px;color:var(--dsw-alias-state-error-primary)}
.dqj-quote[data-state=missing]::before{background:var(--dsw-alias-state-error-primary)}
@media (hover:hover){.dqj-quote:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent)}}
.dqj-quote:focus-visible{outline:1.5px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dqj-inline{color:var(--dsw-alias-label-secondary)}
::highlight(${HIGHLIGHT}){background-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,transparent)}
[data-dqj-flash]{border-radius:6px;animation:dqj-flash ${HIGHLIGHT_MS}ms ease-out forwards}
@keyframes dqj-flash{0%,60%{box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent)}100%{box-shadow:0 0 0 3px transparent;background-color:transparent}}
`

    const isSpace = c => c === 32 || c === 160 || (c >= 9 && c <= 13) || c === 0x2028 || c === 0x2029 || c === 0x3000 || c === 0xFEFF || (c >= 0x2000 && c <= 0x200B)

    /** Text with every whitespace code unit removed, so DOM layout differences do not matter. */
    function compact(text) {
      let out = ''
      for (let i = 0; i < text.length; i++) if (!isSpace(text.charCodeAt(i))) out += text[i]
      return out
    }

    /** Compact text of `root` with a map back to (text node, offset), skipping the quoting bubble. */
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

    /** Pick the last occurrence that precedes `anchor` in document order, else the first one. */
    function pickMatch(index, needle, anchor) {
      let chosen = -1
      for (let at = index.flat.indexOf(needle); at >= 0; at = index.flat.indexOf(needle, at + 1)) {
        const node = index.nodes[index.nodeOf[at]]
        if (node.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING) chosen = at
        else { if (chosen < 0) chosen = at; break }
      }
      return chosen
    }

    function findRange(el, quote) {
      const target = compact(quote)
      if (target === '') return null
      const root = el.closest('[data-conversation-scroll]') ?? el.ownerDocument.body
      const exclude = el.closest('[data-message-bubble]') ?? el
      const index = indexText(root, exclude)
      let needle = target
      let start = pickMatch(index, needle, el)
      if (start < 0 && target.length > PREFIX) {
        needle = target.slice(0, PREFIX)
        start = pickMatch(index, needle, el)
      }
      if (start < 0) return null
      const end = start + needle.length - 1
      const range = el.ownerDocument.createRange()
      range.setStart(index.nodes[index.nodeOf[start]], index.offsetOf[start])
      range.setEnd(index.nodes[index.nodeOf[end]], index.offsetOf[end] + 1)
      return { range, root }
    }

    /** Open folded ancestors: `hidden="until-found"` rows listen for beforematch, details open directly. */
    function reveal(node, root) {
      let changed = false
      for (let p = node.parentElement; p !== null && p !== root; p = p.parentElement) {
        if (p.hidden || p.getAttribute('hidden') === 'until-found') { p.dispatchEvent(new Event('beforematch', { bubbles: true })); changed = true }
        if (p.tagName === 'DETAILS' && !p.open) { p.open = true; changed = true }
      }
      return changed
    }

    const BLOCKS = 'p,li,pre,td,th,blockquote,h1,h2,h3,h4,h5,h6,dd,dt,figcaption,[data-message-bubble]'

    /** The visible block that holds the match, for scrolling and the outline flash. */
    function blockOf(range) {
      const el = range.startContainer.parentElement
      return el?.closest(BLOCKS) ?? el
    }

    /** Whether the range sits inside the visible part of the conversation scroller. */
    function inView(range, scroller) {
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return false
      const box = scroller?.getBoundingClientRect() ?? { top: 0, bottom: innerHeight }
      return rect.bottom > box.top + 8 && rect.top < box.bottom - 8
    }

    /** Scroll instantly: a smooth scroll lasts long enough for the Chat's tail-follow to undo it. */
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
    function clearHighlight() {
      if (clearTimer !== null) clearTimeout(clearTimer)
      clearTimer = null
      if (globalThis.CSS?.highlights) CSS.highlights.delete(HIGHLIGHT)
      if (flashed !== null) { flashed.removeAttribute('data-dqj-flash'); flashed = null }
    }

    function scrollAndHighlight(range) {
      const block = blockOf(range)
      if (block === null || !block.isConnected) return false
      const scroller = scrollToRange(range, block)
      // Re-land once if the Chat's own scroll logic moved the view back.
      setTimeout(() => { if (range.startContainer.isConnected && !inView(range, scroller)) scrollToRange(range, block) }, 150)

      clearHighlight()
      if (globalThis.Highlight && globalThis.CSS?.highlights) CSS.highlights.set(HIGHLIGHT, new Highlight(range))
      flashed = block
      flashed.removeAttribute('data-dqj-flash')
      void flashed.offsetWidth
      flashed.setAttribute('data-dqj-flash', '')
      clearTimer = setTimeout(clearHighlight, HIGHLIGHT_MS)
      return true
    }

    /** @returns whether the quoted text was found. */
    function jumpTo(el, quote) {
      const found = findRange(el, quote)
      if (found === null) return false
      if (reveal(found.range.startContainer, found.root)) {
        // Let the owner render the unfolded row before measuring.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const again = findRange(el, quote)
          scrollAndHighlight(again?.range ?? found.range)
        }))
        return true
      }
      return scrollAndHighlight(found.range)
    }

    const oneLine = text => text.replace(/\s+/gu, ' ').trim()

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', { jump: 'Jump to the quoted text', notFound: 'The quoted text is not in the loaded conversation' }), 'quote-jump: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', { jump: '跳转到原文', notFound: '原文不在当前已加载的对话里' }), 'quote-jump: zh')
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
          React.useEffect(() => {
            if (!missing) return undefined
            const timer = setTimeout(() => setMissing(false), 2000)
            return () => clearTimeout(timer)
          }, [missing])
          const text = node.data.text

          // Single-line and preview contexts keep a compact inline excerpt.
          if (!interactive) return h('span', { className: 'dqj-inline', 'data-quote-jump': '' }, `❝ ${oneLine(text)} `)

          const activate = event => {
            event.stopPropagation()
            const selection = window.getSelection()
            if (selection && !selection.isCollapsed && ref.current?.contains(selection.anchorNode)) return
            if (ref.current === null) return
            const ok = jumpTo(ref.current, text)
            console.debug('[dsh-quote-jump]', ok ? 'jumped' : 'source not found', { quote: text.slice(0, 80) })
            if (!ok) setMissing(true)
          }
          return h('span', {
            ref,
            className: 'dqj-quote',
            'data-quote-jump': '',
            'data-state': missing ? 'missing' : undefined,
            role: 'button',
            tabIndex: 0,
            title: t('jump'),
            onClick: activate,
            onKeyDown: event => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              activate(event)
            },
          }, h('span', { className: 'dqj-text' }, text),
          missing ? h('span', { className: 'dqj-hint', role: 'status' }, t('notFound')) : null)
        }

        // The built-in renderer registers this key at priority 100; the lowest priority renders.
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
