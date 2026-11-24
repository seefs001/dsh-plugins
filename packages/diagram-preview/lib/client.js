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
.dsh-diagram { min-width:0; border:.5px solid var(--dsw-alias-border-l2); border-radius:var(--dsw-radius-md,12px); overflow:hidden; }
.dsh-diagram-tools { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; padding:5px 10px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-secondary); font-size:12px; border-bottom:.5px solid var(--dsw-alias-border-l1); }
.dsh-diagram-tools button { font:inherit; cursor:pointer; background:transparent; color:inherit; border:.5px solid transparent; padding:3px 8px; border-radius:var(--dsw-radius-xs,4px); }
@media (hover:hover) { .dsh-diagram-tools button:hover { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-interactive-bg-hover); } }
.dsh-diagram-tools button[aria-pressed=true] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); border-color:var(--dsw-alias-border-l3); }
.dsh-diagram-controls { display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
.dsh-diagram-tools select { font:inherit; padding:3px 6px; border:.5px solid var(--dsw-alias-border-l3); border-radius:var(--dsw-radius-xs,4px); color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); cursor:pointer; }
.dsh-diagram :is(button,select):focus-visible,.dsh-diagram-dialog :is(button,select):focus-visible { outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary)); outline-offset:1px; }
.dsh-diagram-picture { padding:10px; background:var(--dsw-alias-bg-base); }
.dsh-diagram [data-paper=true],.dsh-diagram-dialog [data-paper=true] { color-scheme:only light; background:Canvas; }
.dsh-diagram-open { display:block; width:100%; margin:0; padding:0; border:0; background:transparent; cursor:zoom-in; }
.dsh-diagram-open img { display:block; margin:auto; width:78%; height:auto; max-height:24rem; object-fit:contain; }
.dsh-diagram-open[data-size=small] img { width:52%; max-height:14rem; }
.dsh-diagram-open[data-size=large] img { width:100%; max-height:40rem; }
.dsh-diagram-open span { display:block; width:max-content; margin:6px 0 0 auto; padding:1px 6px; border-radius:var(--dsw-radius-xs,4px); font-size:11px; color:var(--dsw-alias-label-secondary); background:var(--dsw-alias-bg-layer-1); }
.dsh-diagram-dialog { box-sizing:border-box; width:96vw; height:92dvh; max-width:100vw; max-height:100dvh; padding:0; margin:auto; border:0; border-radius:var(--dsw-radius-lg,16px); color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-2); --dsw-elevation-stroke-color:var(--dsw-alias-border-l2); box-shadow:var(--dsw-elevation-prominent); overflow:hidden; }
.dsh-diagram-dialog[open] { display:flex; flex-direction:column; }
.dsh-diagram-dialog::backdrop { background:var(--dsw-alias-bg-mask-1); }
.dsh-diagram-viewport { flex:1; min-height:0; container-type:size; overflow:auto; overscroll-behavior:contain; }
.dsh-diagram-sheet { display:grid; place-items:center; width:max-content; min-width:100%; min-height:100%; }
.dsh-diagram-sheet img { display:block; height:auto; max-width:none; }
.dsh-diagram > [role=status] { padding:6px 10px; font-size:12px; color:var(--dsw-alias-label-secondary); overflow-wrap:anywhere; }
.dsh-diagram [data-failed] { color:var(--dsw-alias-state-warn-primary); }
.dsh-diagram-stage iframe { position:absolute; left:0; top:0; width:760px; height:440px; border:0; visibility:hidden; pointer-events:none; }
.dsh-diagram-stage { position:relative; height:0; overflow:hidden; }
@media (pointer:coarse) { .dsh-diagram-tools select { font-size:16px; } }
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
      window.addEventListener('message', function init(event) {
        if (event.source !== window.parent || !event.ports[0]) return
        window.removeEventListener('message', init)
        const port = event.ports[0]
        const { library, engine } = event.data
        let vizPromise = null
        let lastScheme = null
        try {
          const script = document.createElement('script')
          script.nonce = nonce
          script.textContent = library
          document.head.append(script)
          port.postMessage({ ready: true })
        } catch (err) {
          port.postMessage({ ready: false, error: String(err?.message || err).slice(0, 360) })
          port.close()
          return
        }
        port.addEventListener('message', async ({ data }) => {
          const { id, code, scheme } = data
          try {
            let svg
            if (engine === 'mermaid') {
              if (lastScheme !== scheme) {
                window.mermaid.initialize({
                  startOnLoad: false, securityLevel: 'strict', htmlLabels: false,
                  theme: scheme === 'dark' ? 'dark' : 'default', suppressErrorRendering: true,
                })
                lastScheme = scheme
              }
              const renderId = `diagram-${id}`
              svg = (await window.mermaid.render(renderId, code, document.body)).svg
              document.getElementById(renderId)?.remove()
              document.getElementById(`d${renderId}`)?.remove()
            } else if (engine === 'graphviz') {
              if (!vizPromise) vizPromise = window.Viz.instance()
              const viz = await vizPromise
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
            port.postMessage({ id, svg })
          } catch (err) {
            port.postMessage({ id, error: String(err?.message || err).slice(0, 360) })
          }
        })
        port.start()
      })
    }

    const MAX_SVG_CACHE = 64

    function createRendererPool() {
      const svgCache = new Map()
      const workers = new Map()
      const libraryPromises = new Map()
      let host = null
      let nextJobId = 1

      const getHost = () => {
        if (host?.isConnected) return host
        host = document.createElement('div')
        host.className = 'dsh-diagram-stage'
        host.setAttribute('aria-hidden', 'true')
        document.body.append(host)
        return host
      }

      const getCached = key => {
        const value = svgCache.get(key)
        if (value === undefined) return undefined
        svgCache.delete(key)
        svgCache.set(key, value)
        return value
      }

      const setCached = (key, value) => {
        svgCache.delete(key)
        svgCache.set(key, value)
        if (svgCache.size > MAX_SVG_CACHE) {
          const oldest = svgCache.keys().next().value
          if (oldest !== undefined) svgCache.delete(oldest)
        }
      }

      const loadLibrary = engine => {
        let promise = libraryPromises.get(engine)
        if (!promise) {
          promise = require.async(`./client.${engine}.js`).catch(err => {
            libraryPromises.delete(engine)
            throw err
          })
          libraryPromises.set(engine, promise)
        }
        return promise
      }

      const destroyWorker = engine => {
        const worker = workers.get(engine)
        if (!worker) return
        workers.delete(engine)
        worker.destroyed = true
        worker.port1?.close()
        worker.port2?.close()
        worker.frame?.remove()
      }

      const createWorker = async (engine, timeoutText) => {
        const library = await loadLibrary(engine)
        const frame = document.createElement('iframe')
        frame.sandbox = 'allow-scripts'
        frame.tabIndex = -1
        frame.setAttribute('aria-hidden', 'true')
        const nonce = Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8, '0')).join('')
        const policy = `default-src 'none'; script-src 'nonce-${nonce}' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'`
        frame.srcdoc = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><body><script nonce="${nonce}">(${startFrame.toString()})();</script>`
        const { port1, port2 } = new MessageChannel()
        const worker = { frame, port1, port2, queue: Promise.resolve(), destroyed: false }
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(timeoutText)), 20_000)
          const onReady = ({ data }) => {
            clearTimeout(timer)
            if (data?.ready) resolve()
            else reject(new Error(data?.error || 'Renderer failed to initialize'))
          }
          port1.addEventListener('message', onReady, { once: true })
          port1.start()
          // external: sandboxed srcdoc iframe has opaque origin, so transfer a private MessagePort with '*'
          frame.addEventListener('load', () => {
            try { frame.contentWindow.postMessage({ engine, library }, '*', [port2]) }
            catch (err) { clearTimeout(timer); reject(err) }
          }, { once: true })
          getHost().append(frame)
        }).catch(err => {
          port1.close()
          port2.close()
          frame.remove()
          throw err
        })
        return worker
      }

      const getWorker = (engine, timeoutText) => {
        let entry = workers.get(engine)
        if (!entry || entry.destroyed) {
          const promise = createWorker(engine, timeoutText).then(w => {
            if (workers.get(engine) === entry) workers.set(engine, w)
            else { w.port1.close(); w.port2.close(); w.frame.remove() }
            return w
          }).catch(err => {
            if (workers.get(engine) === entry) workers.delete(engine)
            throw err
          })
          entry = { pending: promise, queue: Promise.resolve(), destroyed: false }
          workers.set(engine, entry)
        }
        return entry
      }

      const render = (engine, code, scheme, signal, timeoutText) => {
        const cacheKey = `${engine}\0${scheme}\0${code}`
        const cached = getCached(cacheKey)
        if (cached !== undefined) return Promise.resolve(cached)
        const entry = getWorker(engine, timeoutText)
        const run = async () => {
          if (signal.aborted) throw signal.reason
          const worker = entry.pending ? await entry.pending : entry
          if (worker.destroyed) throw new Error(timeoutText)
          if (signal.aborted) throw signal.reason
          const id = nextJobId++
          return await new Promise((resolve, reject) => {
            const cleanup = () => {
              clearTimeout(timer)
              signal.removeEventListener('abort', onAbort)
              worker.port1.removeEventListener('message', onMessage)
            }
            const onAbort = () => {
              cleanup()
              reject(signal.reason)
            }
            const onMessage = ({ data }) => {
              if (data?.id !== id) return
              cleanup()
              if (typeof data.svg === 'string' && data.svg) {
                setCached(cacheKey, data.svg)
                resolve(data.svg)
              } else {
                reject(new Error(data?.error || 'Renderer failed'))
              }
            }
            const timer = setTimeout(() => {
              cleanup()
              destroyWorker(engine)
              reject(new Error(timeoutText))
            }, 20_000)
            signal.addEventListener('abort', onAbort, { once: true })
            worker.port1.addEventListener('message', onMessage)
            try {
              worker.port1.postMessage({ id, code, scheme })
            } catch (err) {
              cleanup()
              destroyWorker(engine)
              reject(err)
            }
          })
        }
        const job = entry.queue.then(run, run)
        entry.queue = job.catch(() => {})
        return job
      }

      const dispose = () => {
        for (const engine of workers.keys()) destroyWorker(engine)
        workers.clear()
        svgCache.clear()
        host?.remove()
        host = null
      }

      return { getCached, render, dispose }
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
        const pool = createRendererPool()
        ctx.effect(() => () => pool.dispose(), 'diagram-preview: renderer pool')
        const subscribe = fn => ctx.on('theme/change', fn)
        const getScheme = () => ctx.theme.getTheme().active.colorScheme
        const toDataUrl = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

        function Diagram({ lang, code, children, t, scheme }) {
          const engine = engines[lang]
          const [source, setSource] = React.useState(false)
          const [size, setSize] = React.useState('medium')
          const [openRatio, setOpenRatio] = React.useState(null)
          const image = React.useRef(null)
          const [picture, setPicture] = React.useState(() => {
            if (engine === 'svg') return toDataUrl(code)
            const cached = pool.getCached(`${engine}\0${scheme}\0${code}`)
            return cached !== undefined ? toDataUrl(cached) : ''
          })
          const [error, setError] = React.useState('')
          const [attempt, retry] = React.useReducer(n => n + 1, 0)
          React.useEffect(() => {
            if (engine === 'svg') { setPicture(toDataUrl(code)); return undefined }
            const cached = pool.getCached(`${engine}\0${scheme}\0${code}`)
            if (cached !== undefined) { setPicture(toDataUrl(cached)); return undefined }
            const controller = new AbortController()
            const { signal } = controller
            pool.render(engine, code, scheme, signal, t('timeout'))
              .then(svg => { if (!signal.aborted) setPicture(toDataUrl(svg)) })
              .catch(err => { if (!signal.aborted) setError(err?.message || t('invalid')) })
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
