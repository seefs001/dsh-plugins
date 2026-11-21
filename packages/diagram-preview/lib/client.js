window.__ModuleLoader__.load({
  id: 'dsh-diagram-preview',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const slot = 'conversation.chat.markdown.fence'
    const ns = 'diagramPreview'
    const engines = { mermaid: 'mermaid', mmd: 'mermaid', dot: 'graphviz', graphviz: 'graphviz', echarts: 'echarts', svg: 'svg' }
    const titles = { mermaid: 'Mermaid', graphviz: 'Graphviz', echarts: 'ECharts', svg: 'SVG' }
    const css = `
.dsh-diagram { min-width:0; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; overflow:hidden; }
.dsh-diagram-tools { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; padding:5px 10px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-secondary); font-size:12px; }
.dsh-diagram-tools button { font:inherit; cursor:pointer; background:transparent; color:inherit; border:1px solid transparent; padding:3px 8px; border-radius:5px; }
.dsh-diagram-tools button[aria-pressed=true] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); border-color:var(--dsw-alias-border-l2); }
.dsh-diagram-controls { display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
.dsh-diagram-tools select { font:inherit; padding:3px 4px; border:1px solid var(--dsw-alias-border-l2); border-radius:5px; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); }
.dsh-diagram :is(button,select):focus-visible { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:-2px; }
.dsh-diagram-picture { padding:10px; background:var(--dsw-alias-bg-base); }
.dsh-diagram [data-paper=true] { color-scheme:only light; background:Canvas; }
.dsh-diagram-open { display:block; width:100%; margin:0; padding:0; border:0; background:transparent; cursor:zoom-in; }
.dsh-diagram-open img { display:block; margin:auto; width:78%; height:auto; max-height:24rem; object-fit:contain; }
.dsh-diagram-open[data-size=small] img { width:52%; max-height:14rem; }
.dsh-diagram-open[data-size=large] img { width:100%; max-height:40rem; }
.dsh-diagram-open span { display:block; width:max-content; margin:6px 0 0 auto; padding:1px 5px; border-radius:4px; font-size:11px; color:var(--dsw-alias-label-secondary); background:var(--dsw-alias-bg-layer-1); }
.dsh-diagram-dialog { box-sizing:border-box; width:96vw; height:92dvh; max-width:100vw; max-height:100dvh; padding:0; margin:auto; border:1px solid var(--dsw-alias-border-l2); border-radius:10px; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); }
.dsh-diagram-dialog[open] { display:flex; flex-direction:column; }
.dsh-diagram-dialog::backdrop { background:color-mix(in srgb,var(--dsw-alias-label-primary) 45%,transparent); }
.dsh-diagram-viewport { flex:1; min-height:0; container-type:size; overflow:auto; overscroll-behavior:contain; }
.dsh-diagram-sheet { display:grid; place-items:center; width:max-content; min-width:100%; min-height:100%; }
.dsh-diagram-sheet img { display:block; height:auto; max-width:none; }
.dsh-diagram > [role=status] { padding:6px 10px; font-size:12px; color:var(--dsw-alias-label-secondary); overflow-wrap:anywhere; }
.dsh-diagram [data-failed] { color:var(--dsw-alias-state-warn-primary); }
.dsh-diagram-stage iframe { position:absolute; left:0; top:0; width:760px; height:440px; border:0; visibility:hidden; pointer-events:none; }
.dsh-diagram-stage { position:relative; height:0; overflow:hidden; }
`

    function LargePreview({ picture, title, paper, ratio, t, dismiss }) {
      const ref = React.useRef(null)
      const [zoom, setZoom] = React.useState(100)
      const label = `${title} · ${t('enlarge')}`
      React.useEffect(() => {
        const dialog = ref.current
        dialog.showModal()
        return () => dialog.close()
      }, [])
      return h('dialog', { ref, className: 'dsh-diagram-dialog', 'aria-label': label,
        onClose: e => { if (!e.currentTarget.open) dismiss() },
        onClick: e => { if (e.target === e.currentTarget) e.currentTarget.close() },
      }, h('header', { className: 'dsh-diagram-tools' }, h('strong', null, label),
        h('div', { className: 'dsh-diagram-controls' },
          h('select', { 'aria-label': t('zoom'), value: zoom, onChange: e => setZoom(Number(e.target.value)) },
            [100, 150, 200, 300, 400].map(n => h('option', { key: n, value: n }, n === 100 ? t('fit') : `${n}%`))),
          h('button', { type: 'button', onClick: () => ref.current.close() }, t('close')))),
      h('div', { className: 'dsh-diagram-viewport', 'data-paper': paper, tabIndex: 0, role: 'region', 'aria-label': label },
        h('div', { className: 'dsh-diagram-sheet' }, h('img', { src: picture, alt: title,
          style: { width: `min(${zoom}cqw, ${zoom * ratio}cqh)` },
        }))))
    }

    function startFrame() {
      const nonce = document.currentScript.nonce
      window.addEventListener('message', async function receive(event) {
        if (event.source !== window.parent || !event.ports[0]) return
        window.removeEventListener('message', receive)
        const port = event.ports[0]
        const { library, engine, code, scheme } = event.data
        try {
          const script = document.createElement('script')
          script.nonce = nonce
          script.textContent = library
          document.head.append(script)
          let svg
          if (engine === 'mermaid') {
            window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', htmlLabels: false,
              theme: scheme === 'dark' ? 'dark' : 'default', suppressErrorRendering: true })
            svg = (await window.mermaid.render('diagram', code, document.body)).svg
          } else if (engine === 'graphviz') {
            const viz = await window.Viz.instance()
            svg = viz.renderString(code, { format: 'svg' })
          } else {
            const option = JSON.parse(code)
            if (!option || typeof option !== 'object' || Array.isArray(option) || !('series' in option || 'baseOption' in option)) {
              throw new Error('Expected an ECharts option object with series or baseOption')
            }
            const chart = window.echarts.init(null, scheme === 'dark' ? 'dark' : undefined,
              { renderer: 'svg', ssr: true, width: 760, height: 420 })
            try {
              chart.setOption({ ...option, animation: false })
              svg = chart.renderToSVGString()
            } finally { chart.dispose() }
          }
          port.postMessage({ svg })
        } catch (err) {
          port.postMessage({ error: String(err?.message || err).slice(0, 360) })
        } finally { port.close() }
      })
    }

    function renderInFrame(stage, request, signal, timeoutText) {
      const frame = document.createElement('iframe')
      frame.sandbox = 'allow-scripts'
      frame.tabIndex = -1
      frame.setAttribute('aria-hidden', 'true')
      const nonce = Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8, '0')).join('')
      const policy = `default-src 'none'; script-src 'nonce-${nonce}' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'`
      frame.srcdoc = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><body><script nonce="${nonce}">(${startFrame.toString()})();</script>`
      return new Promise((resolve, reject) => {
        const { port1, port2 } = new MessageChannel()
        const done = (fn, value) => {
          clearTimeout(timer)
          signal.removeEventListener('abort', abort)
          port1.close()
          port2.close()
          frame.remove()
          fn(value)
        }
        const abort = () => done(reject, signal.reason)
        const timer = setTimeout(() => done(reject, new Error(timeoutText)), 20000)
        signal.addEventListener('abort', abort, { once: true })
        port1.addEventListener('message', ({ data }) => typeof data.svg === 'string' && data.svg
          ? done(resolve, data.svg) : done(reject, new Error(data.error)), { once: true })
        port1.start()
        // external: sandboxed srcdoc iframe has opaque origin, so transfer a private MessagePort with '*'
        frame.addEventListener('load', () => {
          try { frame.contentWindow.postMessage(request, '*', [port2]) }
          catch (err) { done(reject, err) }
        }, { once: true })
        stage.append(frame)
      })
    }

    return {
      inject: ['slots', 'locale', 'theme'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(ns, {
          en: { preview: 'Preview', code: 'Code', loading: 'Rendering diagram…', failed: 'Preview unavailable. Showing the original code.', timeout: 'Renderer timed out.', invalid: 'Invalid SVG image.',
            size: 'Preview size', small: 'Small', medium: 'Medium', large: 'Large', enlarge: 'View larger', zoom: 'Zoom', fit: 'Fit to window', close: 'Close' },
          zh: { preview: '预览', code: '代码', loading: '正在渲染图表…', failed: '无法预览，已显示原代码。', timeout: '渲染超时。', invalid: '无效的 SVG 图像。',
            size: '预览尺寸', small: '小图', medium: '中图', large: '大图', enlarge: '查看大图', zoom: '缩放', fit: '适应窗口', close: '关闭' },
        }))
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = css
          document.head.append(style)
          return () => style.remove()
        })
        const subscribe = fn => ctx.on('theme/change', fn)
        const getScheme = () => ctx.theme.getTheme().active.colorScheme

        function Diagram({ lang, code, children, t, scheme }) {
          const engine = engines[lang]
          const stage = React.useRef(null)
          const [source, setSource] = React.useState(false)
          const [size, setSize] = React.useState('medium')
          const [openRatio, setOpenRatio] = React.useState(null)
          const image = React.useRef(null)
          const [picture, setPicture] = React.useState('')
          const [error, setError] = React.useState('')
          const [attempt, retry] = React.useReducer(n => n + 1, 0)
          React.useEffect(() => {
            const controller = new AbortController()
            const { signal } = controller
            async function render() {
              let svg = code
              if (engine !== 'svg') {
                const library = await require.async(`./client.${engine}.js`)
                if (signal.aborted) return
                svg = await renderInFrame(stage.current, { engine, library, code, scheme }, signal, t('timeout'))
              }
              if (!signal.aborted) setPicture(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
            }
            render().catch(err => { if (!signal.aborted) setError(err.message || t('invalid')) })
            return () => controller.abort()
          }, [engine, code, scheme, attempt, t])

          const showCode = source || Boolean(error)
          function preview() {
            setSource(false)
            if (error) { setError(''); setPicture(''); retry() }
          }
          const button = (label, active, click) => h('button', { type: 'button', 'aria-pressed': active, onClick: click }, label)
          const title = titles[engine]
          const paper = engine === 'svg' || engine === 'graphviz'
          return h('section', { className: 'dsh-diagram', 'aria-label': title },
            h('header', { className: 'dsh-diagram-tools' }, h('strong', null, title), h('div', { className: 'dsh-diagram-controls' },
              !showCode && picture && h('select', { 'aria-label': t('size'), title: t('size'), value: size, onChange: e => setSize(e.target.value) },
                ['small', 'medium', 'large'].map(s => h('option', { key: s, value: s }, t(s)))),
              button(t('preview'), !showCode, preview), button(t('code'), showCode, () => setSource(true)))),
            h('div', { className: 'dsh-diagram-stage', ref: stage }),
            error && h('div', { role: 'status', 'data-failed': '' }, `${t('failed')} ${error}`),
            showCode ? children : picture
              ? h('div', { className: 'dsh-diagram-picture', 'data-paper': paper },
                h('button', { type: 'button', className: 'dsh-diagram-open', 'data-size': size, 'aria-haspopup': 'dialog',
                  onClick: () => setOpenRatio(image.current.naturalWidth / image.current.naturalHeight || 1),
                }, h('img', { ref: image, src: picture, alt: title, onError: () => setError(t('invalid')) }), h('span', null, t('enlarge'))))
              : h('div', { role: 'status' }, t('loading')),
            openRatio !== null && h(LargePreview, { title, picture, paper, ratio: openRatio, t, dismiss: () => setOpenRatio(null) }))
        }

        function Fence(props) {
          const scheme = React.useSyncExternalStore(subscribe, getScheme)
          if (props.streaming) return props.children
          return h(Diagram, { ...props, scheme, key: `${scheme}:${props.lang}:${props.code}` })
        }
        ctx.slots.inject(slot, () => Object.keys(engines).map(key => ctx.slots.register({
          name: slot, key, id: 'dsh-diagram-preview', locale: ns,
        }, Fence)))
      },
    }
  },
})
