import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const h = React.createElement
const NS = 'messageActions'
const EN = {
  action: 'Wait, what?', title: 'Wait, what?', close: 'Close', settings: 'Model settings', hideSettings: 'Hide settings',
  actionHint: 'Explain this reply',
  source: 'Original reply', user: 'Previous user message',
  generate: 'Explain', regenerate: 'Regenerate', stop: 'Stop', generating: 'Generating…', loading: 'Loading…', retry: 'Retry',
  result: 'Explanation',
  stopped: 'Stopped', copy: 'Copy', copied: 'Copied', copyFailed: 'Copy failed. Select the text and copy it manually.',
  settingsTitle: 'Explanation model',
  followOriginal: 'Use each original reply’s model', selectModel: 'Model', effort: 'Reasoning effort', modelDefault: 'Model default',
  unavailable: '(unavailable)', save: 'Save model', saveAndExplain: 'Save and explain', saving: 'Saving…', saved: 'Model saved',
  refresh: 'Refresh models', unsaved: 'Unsaved changes', restart: 'Restart DSH to load the updated Wait, what? plugin.',
}
const ZH = {
  action: 'Wait, what?', title: 'Wait, what?', close: '关闭', settings: '模型设置', hideSettings: '收起设置',
  actionHint: '解释这条回复',
  source: '查看原回复', user: '上一条用户消息',
  generate: '重新解释', regenerate: '重新生成', stop: '停止', generating: '正在生成…', loading: '正在加载…', retry: '重试',
  result: '解释',
  stopped: '已停止', copy: '复制', copied: '已复制', copyFailed: '复制失败，请选中文字手动复制。',
  settingsTitle: '解释模型',
  followOriginal: '沿用每条原回复的模型', selectModel: '模型', effort: '推理强度', modelDefault: '模型默认',
  unavailable: '（不可用）', save: '保存模型', saveAndExplain: '保存并解释', saving: '正在保存…', saved: '模型已保存',
  refresh: '刷新模型列表', unsaved: '未保存', restart: '请重启 DSH 以加载更新后的 Wait, what? 插件。',
}
const CSS = `
.dma-entry{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 8px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.dma-entry svg,.dma-btn svg{width:16px;height:16px;flex:none}
.dma-dialog{box-sizing:border-box;width:min(780px,calc(100vw - 40px));max-height:min(800px,calc(100dvh - 48px));padding:0;overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:20px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 24px 80px var(--dsw-alias-bg-mask-2);font:inherit;font-size:14px;line-height:1.6;text-align:left}
.dma-dialog[open]{display:flex;flex-direction:column}
.dma-dialog::backdrop{background:var(--dsw-alias-bg-mask-1);backdrop-filter:blur(4px)}
.dma-dialog *,.dma-settings,.dma-settings *{box-sizing:border-box}
.dma-copy{position:fixed;width:1px;height:1px;opacity:0;pointer-events:none}
.dma-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex:none;padding:22px 24px 20px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dma-heading{display:flex;align-items:center;gap:12px;min-width:0}
.dma-mark{display:flex;align-items:center;justify-content:center;flex:none;width:38px;height:38px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-module-platform)}
.dma-mark svg{width:21px;height:21px}
.dma-header h2{margin:0;font-size:17px;line-height:24px;font-weight:600;letter-spacing:-.02em}
.dma-note{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6;overflow-wrap:anywhere}
.dma-header-actions{display:flex;align-items:center;gap:4px;flex:none}
.dma-body{min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
.dma-output{display:flex;flex-direction:column;gap:18px;min-width:0;padding:22px 24px 24px}
.dma-settings{display:flex;flex-direction:column;gap:16px;max-width:640px;min-width:0;padding:20px 24px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-layer-1)}
.dma-settings h4{margin:0;font-size:14px;line-height:22px;font-weight:600}
.dma-dialog .dma-settings{max-width:none;margin:20px 24px 0;padding:16px;background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-alias-border-l1)}
.dma-fields{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
.dma-fields.has-effort{grid-template-columns:minmax(0,2fr) minmax(140px,1fr)}
.dma-field{display:flex;flex-direction:column;gap:7px;min-width:0;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.dma-input{width:100%;min-width:0;min-height:38px;border:1px solid var(--dsw-alias-border-l3);border-radius:9px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.5;text-overflow:ellipsis}
.dma-input:disabled{opacity:.55}
.dma-buttons{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.dma-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex-shrink:0;min-height:36px;padding:6px 12px;border:1px solid var(--dsw-alias-border-l3);border-radius:9px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;white-space:nowrap}
.dma-btn:disabled{opacity:.4;cursor:not-allowed}
.dma-primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dma-quiet{border-color:transparent;color:var(--dsw-alias-label-secondary)}
.dma-quiet[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}
.dma-icon-btn{width:36px;padding:0}
.dma-error{margin:0;padding:10px 12px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 24%,transparent);border-radius:9px;background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}
.dma-btn:focus-visible,.dma-entry:focus-visible,.dma-input:focus-visible,.dma-dialog summary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary-new-colorprimary-new-color);outline-offset:3px}
.dma-status{display:inline-flex;align-items:center;gap:7px;min-height:20px;margin:0;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dma-status-dot{width:6px;height:6px;flex:none;border-radius:50%;background:var(--dsw-alias-label-tertiary)}
.dma-status.is-busy .dma-status-dot{width:12px;height:12px;border:1.5px solid var(--dsw-alias-border-l3);border-top-color:var(--dsw-alias-label-secondary);background:transparent;animation:dma-spin .8s linear infinite}
.dma-result{margin:0;min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:14px;line-height:1.8;user-select:text}
.dma-markdown{white-space:normal}
.dma-markdown p,.dma-markdown ul,.dma-markdown ol,.dma-markdown blockquote,.dma-markdown pre,.dma-markdown .dma-table{margin:16px 0}
.dma-markdown h1,.dma-markdown h2,.dma-markdown h3,.dma-markdown h4,.dma-markdown h5,.dma-markdown h6{margin:24px 0 12px;font-weight:600;line-height:1.4;letter-spacing:-.015em}
.dma-markdown h1{font-size:24px}.dma-markdown h2{font-size:21px}.dma-markdown h3{font-size:18px}.dma-markdown h4{font-size:16px}.dma-markdown h5,.dma-markdown h6{font-size:14px}
.dma-markdown>:first-child{margin-top:0}.dma-markdown>:last-child{margin-bottom:0}
.dma-markdown ul,.dma-markdown ol{padding-left:24px}.dma-markdown li+li{margin-top:5px}.dma-markdown li>p{margin:8px 0}.dma-markdown li>ul,.dma-markdown li>ol{margin:6px 0}
.dma-markdown .contains-task-list{list-style:none;padding-left:4px}.dma-markdown .task-list-item input{margin-right:8px;accent-color:var(--dsw-alias-brand-primary)}
.dma-markdown blockquote{padding:2px 0 2px 14px;border-left:3px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary)}.dma-markdown blockquote>:first-child{margin-top:0}.dma-markdown blockquote>:last-child{margin-bottom:0}
.dma-markdown code{padding:2px 5px;border-radius:5px;background:var(--dsw-alias-bg-module-platform);font:12px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace}
.dma-markdown pre{max-width:100%;padding:14px 16px;overflow-x:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-module-platform);white-space:pre;overflow-wrap:normal}
.dma-markdown pre code{padding:0;border-radius:0;background:transparent;font-size:12px}
.dma-markdown a{color:var(--dsw-alias-brand-primary-new-colorprimary-new-color);text-decoration:underline;text-underline-offset:3px}
.dma-markdown hr{margin:24px 0;border:0;border-top:1px solid var(--dsw-alias-border-l2)}
.dma-table{max-width:100%;overflow-x:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:10px}
.dma-markdown table{width:100%;border-collapse:collapse;font-size:13px;line-height:1.7}
.dma-markdown th,.dma-markdown td{padding:9px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);text-align:left;vertical-align:top}
.dma-markdown th{background:var(--dsw-alias-bg-module-platform);font-weight:600}.dma-markdown tr:last-child td{border-bottom:0}
.dma-markdown a:focus-visible,.dma-markdown pre:focus-visible,.dma-table:focus-visible{outline:2px solid var(--dsw-alias-brand-primary-new-colorprimary-new-color);outline-offset:3px}
.dma-skeleton{display:flex;flex-direction:column;gap:12px;min-height:120px;padding:12px 0}
.dma-skeleton span{height:10px;width:100%;border-radius:5px;background:var(--dsw-alias-bg-skeleton);animation:dma-pulse 1.6s ease-in-out infinite}
.dma-skeleton span:nth-child(2){width:88%}.dma-skeleton span:nth-child(3){width:63%}
.dma-source-details{padding-top:16px;border-top:1px solid var(--dsw-alias-border-l1)}
.dma-source-details summary{width:fit-content;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary);line-height:24px}
.dma-source{margin:12px 0 0;padding:12px 14px;border-radius:10px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.7}
.dma-source-label{margin-top:14px}
.dma-footer{display:flex;align-items:center;justify-content:flex-end;gap:20px;flex:none;padding:16px 24px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
@media(hover:hover){.dma-entry:hover,.dma-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dma-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@keyframes dma-spin{to{transform:rotate(360deg)}}@keyframes dma-pulse{50%{opacity:.4}}
@media(prefers-reduced-motion:reduce){.dma-status-dot,.dma-skeleton span{animation:none}}
@media(max-width:600px){.dma-dialog{width:calc(100vw - 24px);max-height:calc(100dvh - 24px);border-radius:16px}.dma-header{padding:18px 16px 16px;gap:12px;flex-wrap:wrap}.dma-heading{flex:1 1 200px}.dma-header-actions{margin-left:auto}.dma-mark{width:34px;height:34px;border-radius:10px}.dma-output{padding:18px 16px}.dma-settings{padding:16px}.dma-dialog .dma-settings{margin:16px 16px 0;padding:14px}.dma-fields.has-effort{grid-template-columns:minmax(0,1fr)}.dma-footer{padding:14px 16px;gap:12px;align-items:stretch;flex-direction:column}.dma-footer>.dma-btn{align-self:stretch}.dma-header-actions .dma-btn{min-height:36px}}
`

/** One owner-authenticated NDJSON operation; an explicit done frame is required. */
async function request(body, signal, onDelta = () => {}) {
  const response = await fetch('message-actions/op', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal,
  })
  if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result
  let completed = false
  const line = value => {
    if (!value.trim()) return
    const frame = JSON.parse(value)
    if (frame.type === 'error') throw new Error(frame.message)
    if (frame.type === 'delta') onDelta(frame.text)
    if (frame.type === 'done') { result = frame.value; completed = true }
  }
  try {
    for (;;) {
      const next = await reader.read()
      if (next.done) break
      buffer += decoder.decode(next.value, { stream: true })
      let at
      while ((at = buffer.indexOf('\n')) !== -1) { line(buffer.slice(0, at)); buffer = buffer.slice(at + 1) }
    }
    line(buffer + decoder.decode())
    if (!completed) throw new Error('The request ended before a result was saved')
    return result
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
}

function Icon({ name }) {
  const paths = {
    settings: 'M4 7h6m4 0h6M4 17h10m4 0h2M10 4v6m4 4v6',
    close: 'm6 6 12 12M6 18 18 6',
    copy: 'M9 9h11v11H9zM15 5V3H3v12h2',
    refresh: 'M20 7v5h-5M4 17v-5h5M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9',
    stop: 'M7 7h10v10H7z',
    check: 'm5 12 4 4L19 6',
  }
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] }))
}

// The renderer never interprets raw HTML. Links retain react-markdown's default
// URL filtering; image references are links so model output makes no image requests.
const markdownComponents = {
  a: ({ href, title, children }) => href
    ? h('a', { href, title, target: '_blank', rel: 'noopener noreferrer' }, children)
    : h(React.Fragment, null, children),
  img: ({ src, alt, title }) => src
    ? h('a', { href: src, title, target: '_blank', rel: 'noopener noreferrer' }, alt || src)
    : h(React.Fragment, null, alt),
  pre: ({ children }) => h('pre', { tabIndex: 0 }, children),
  table: ({ children }) => h('div', { className: 'dma-table', tabIndex: 0 }, h('table', null, children)),
}
const markdownPlugins = [remarkGfm]
function Markdown({ text }) {
  return h('div', { className: 'dma-result dma-markdown' },
    h(ReactMarkdown, { remarkPlugins: markdownPlugins, components: markdownComponents }, text))
}

function Wand() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'm4 20 12-12 4 4L8 24M14 10l4 4', transform: 'translate(0 -2)', strokeLinecap: 'round', strokeLinejoin: 'round' }),
    h('path', { d: 'M6 3v4M4 5h4M18 2v4M16 4h4M19 17v4M17 19h4', strokeLinecap: 'round' }))
}

export default {
  inject: ['slots', 'locale'],
  apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, 'en', EN))
    ctx.effect(() => ctx.locale.register(NS, 'zh', ZH))
    const t = ctx.locale.bind(NS)
    ctx.effect(() => {
      const style = document.createElement('style')
      style.textContent = CSS
      document.head.appendChild(style)
      return () => style.remove()
    }, 'message-actions: styles')
    function useLocale() {
      React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
    }
    const button = (label, onClick, disabled = false, className = '', icon = '', props = {}) => h('button', { ...props, type: 'button', className: `dma-btn ${className}`, onClick, disabled }, icon ? h(Icon, { name: icon }) : null, label)

    // Settings: loading -> idle -> saving -> idle/error. A failed save retains
    // the draft. Saving is single-flight; unmount aborts and ignores late replies.
    function Settings({ onSaved, onSaving } = {}) {
      useLocale()
      const alive = React.useRef(true)
      const active = React.useRef(null)
      const [data, setData] = React.useState(null)
      const [draft, setDraft] = React.useState(null)
      const [phase, setPhase] = React.useState('loading')
      const [error, setError] = React.useState('')
      const [notice, setNotice] = React.useState('')
      const perform = async body => {
        if (active.current) return undefined
        const controller = new AbortController()
        active.current = controller
        try { return await request(body, controller.signal) }
        finally { if (active.current === controller) active.current = null }
      }
      const load = async () => {
        setPhase('loading'); setError('')
        try {
          const value = await perform({ action: 'get_settings' })
          if (!alive.current || !value) return
          setData(value); setDraft(v => v ?? value.settings)
        } catch (e) { if (alive.current) setError(e.message) }
        finally { if (alive.current) setPhase('idle') }
      }
      React.useEffect(() => {
        alive.current = true
        void load()
        return () => { alive.current = false; active.current?.abort() }
      }, [])
      const busy = phase !== 'idle'
      if (!draft) return h('section', { className: 'dma-settings' },
        h('h4', null, t('settingsTitle')),
        error ? h('p', { className: 'dma-error', role: 'alert' }, error) : h('p', { className: 'dma-note', role: 'status' }, t('loading')),
        error ? button(t('retry'), load, busy) : null)

      const groups = data.groups
      const key = draft.provider ? JSON.stringify([draft.provider, draft.model]) : ''
      const selected = groups.find(g => g.id === draft.provider)?.models.find(m => m.id === draft.model)
      const efforts = selected?.reasoning?.efforts ?? []
      const dirty = ['provider', 'model', 'reasoningEffort'].some(f => data.settings[f] !== draft[f])
      const edit = patch => { setDraft(v => ({ ...v, ...patch })); setError(''); setNotice('') }
      const save = async () => {
        if (active.current) return
        setPhase('saving'); setError(''); setNotice(''); onSaving?.(true)
        try {
          const value = await perform({ action: 'save_settings', ...draft })
          if (!alive.current || !value) return
          setData(v => ({ ...v, settings: value.settings })); setDraft(value.settings); setNotice(t('saved'))
          onSaved?.()
        } catch (e) { if (alive.current) setError(e.message) }
        finally { if (alive.current) { setPhase('idle'); onSaving?.(false) } }
      }
      const hasEffort = Boolean(draft.provider && (efforts.length || draft.reasoningEffort))
      return h('section', { className: 'dma-settings', 'aria-busy': busy },
        h('h4', null, t('settingsTitle')),
        h('div', { className: `dma-fields${hasEffort ? ' has-effort' : ''}` },
          h('label', { className: 'dma-field' }, t('selectModel'), h('select', {
            className: 'dma-input', value: key, disabled: busy,
            onChange: e => { const [provider = '', model = ''] = e.target.value ? JSON.parse(e.target.value) : []; edit({ provider, model, reasoningEffort: '' }) },
          }, h('option', { value: '' }, t('followOriginal')),
          groups.map(g => h('optgroup', { key: g.id, label: g.name }, g.models.map(m => h('option', { key: m.id, value: JSON.stringify([g.id, m.id]) }, m.name)))),
          key && !selected ? h('option', { value: key }, `${draft.provider}/${draft.model} ${t('unavailable')}`) : null)),
          hasEffort ? h('label', { className: 'dma-field' }, t('effort'), h('select', {
            className: 'dma-input', value: draft.reasoningEffort, disabled: busy, onChange: e => edit({ reasoningEffort: e.target.value }),
          }, h('option', { value: '' }, t('modelDefault')),
          efforts.map(e => h('option', { key: e.id, value: e.id }, e.name)),
          draft.reasoningEffort && !efforts.some(e => e.id === draft.reasoningEffort) ? h('option', { value: draft.reasoningEffort }, `${draft.reasoningEffort} ${t('unavailable')}`) : null)) : null),
        data.failures.map(f => h('p', { key: f.id, className: 'dma-error', role: 'alert' }, `${f.name}: ${f.message}`)),
        error ? h('p', { className: 'dma-error', role: 'alert' }, error) : null,
        h('div', { className: 'dma-buttons' },
          button(t(phase === 'saving' ? 'saving' : onSaved ? 'saveAndExplain' : 'save'), save, busy || !dirty || Boolean(key && !selected), 'dma-primary'),
          button(t('refresh'), load, busy, 'dma-quiet', 'refresh')),
        dirty || notice ? h('p', { className: 'dma-status', role: 'status' }, dirty ? t('unsaved') : notice) : null)
    }

    function Dialog({ sessionId, messageId, onClose }) {
      useLocale()
      const dialog = React.useRef(null)
      const backdrop = React.useRef(false)
      const copyArea = React.useRef(null)
      const active = React.useRef(null)
      const alive = React.useRef(true)
      const [data, setData] = React.useState(null)
      const [showSettings, setShowSettings] = React.useState(false)
      const [saving, setSaving] = React.useState(false)
      const [phase, setPhase] = React.useState('loading')
      const [error, setError] = React.useState('')
      const [notice, setNotice] = React.useState('')
      const [stream, setStream] = React.useState('')
      const [copied, setCopied] = React.useState(false)
      const busy = phase === 'loading' || phase === 'generating' || saving
      const result = data?.result
      const op = async (body, onDelta) => {
        if (active.current) return undefined
        const controller = new AbortController()
        active.current = controller
        try { return await request({ ...body, sessionId, messageId }, controller.signal, onDelta) }
        finally { if (active.current === controller) active.current = null }
      }
      const generate = async (force = false) => {
        setPhase('generating'); setStream(''); setError(''); setNotice(''); setCopied(false)
        try {
          const value = await op({ action: 'generate', force }, delta => { if (alive.current) setStream(v => v + delta) })
          if (!alive.current || !value) return
          setData(v => ({ ...v, result: value.result }))
        } catch (e) {
          if (!alive.current) return
          if (e.name === 'AbortError') setNotice(t('stopped'))
          else setError(e.message)
        } finally { if (alive.current) { setPhase('idle'); setStream('') } }
      }
      const load = async () => {
        setPhase('loading'); setData(null); setError(''); setNotice(''); setCopied(false)
        try {
          const value = await op({ action: 'inspect' })
          if (!alive.current || !value) return
          if (!Object.hasOwn(value, 'result')) throw new Error(t('restart'))
          setData(value)
          if (!value.result) await generate()
        } catch (e) { if (alive.current) setError(e.message) }
        finally { if (alive.current) setPhase('idle') }
      }
      React.useEffect(() => {
        alive.current = true
        const node = dialog.current
        const previous = document.activeElement
        node.showModal()
        void load()
        return () => {
          alive.current = false
          active.current?.abort()
          node.close()
          if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
        }
      }, [])
      const copy = async event => {
        const trigger = event.currentTarget
        try {
          if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(result.text)
          else {
            copyArea.current.select()
            if (!document.execCommand('copy')) throw new Error('Copy unavailable')
            trigger.focus({ preventScroll: true })
          }
          if (alive.current) setCopied(true)
        } catch { if (alive.current) setError(t('copyFailed')) }
      }
      const waiting = phase === 'loading' || phase === 'generating'
      const displayText = phase === 'generating' ? stream : result?.text
      const status = phase === 'loading' ? t('loading') : phase === 'generating' ? t('generating') : saving ? t('saving') : notice
      const outside = event => {
        if (event.target !== dialog.current) return false
        const bounds = dialog.current.getBoundingClientRect()
        return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom
      }
      return h('dialog', {
        ref: dialog, className: 'dma-dialog', role: 'dialog', 'aria-modal': true, 'aria-label': t('title'),
        onCancel: e => { e.preventDefault(); if (!saving) onClose() }, onKeyDown: e => e.stopPropagation(),
        onPointerDown: e => { backdrop.current = outside(e) },
        onClick: e => {
          const dismiss = backdrop.current && outside(e)
          backdrop.current = false
          if (dismiss && !saving) onClose()
        },
      }, h('header', { className: 'dma-header' },
        h('div', { className: 'dma-heading' },
          h('span', { className: 'dma-mark', 'aria-hidden': true }, h(Wand)), h('h2', null, t('title'))),
        h('div', { className: 'dma-header-actions' },
          result ? button(t(copied ? 'copied' : 'copy'), copy, busy, 'dma-quiet', copied ? 'check' : 'copy') : null,
          button(t(showSettings ? 'hideSettings' : 'settings'), () => setShowSettings(v => !v), busy, 'dma-quiet', 'settings', { 'aria-expanded': showSettings, 'aria-controls': 'dma-model-settings' }),
          button(null, onClose, saving, 'dma-quiet dma-icon-btn', 'close', { 'aria-label': t('close'), title: t('close') }))),
      h('div', { className: 'dma-body' },
        h('div', { id: 'dma-model-settings', hidden: !showSettings },
          showSettings ? h(Settings, { onSaving: setSaving, onSaved: () => { setShowSettings(false); void load() } }) : null),
        h('section', { className: 'dma-output', 'aria-label': t('result') },
          status ? h('span', { className: `dma-status${waiting || saving ? ' is-busy' : ''}`, role: 'status', 'aria-live': 'polite' },
            waiting || saving ? h('span', { className: 'dma-status-dot', 'aria-hidden': true }) : null, status) : null,
          error ? h('p', { className: 'dma-error', role: 'alert' }, error) : null,
          displayText ? h(Markdown, { text: displayText })
            : waiting ? h('div', { className: 'dma-skeleton', 'aria-hidden': true }, h('span'), h('span'), h('span')) : null,
          data ? h('details', { className: 'dma-source-details' }, h('summary', null, t('source')), h('pre', { className: 'dma-result dma-source' }, data.source.message),
            data.source.user ? h(React.Fragment, null, h('p', { className: 'dma-note dma-source-label' }, t('user')), h('pre', { className: 'dma-result dma-source' }, data.source.user)) : null) : null,
          h('textarea', { ref: copyArea, className: 'dma-copy', readOnly: true, value: result?.text ?? '', tabIndex: -1, 'aria-hidden': true }))),
      showSettings ? null : h('footer', { className: 'dma-footer' },
        phase === 'generating' ? button(t('stop'), () => active.current?.abort(), false, 'dma-primary', 'stop')
          : button(t(!data ? 'retry' : result ? 'regenerate' : 'generate'), () => data ? generate(Boolean(result)) : load(), busy, 'dma-primary', result ? 'refresh' : '')))
    }

    function Action(props) {
      useLocale()
      const [open, setOpen] = React.useState(false)
      return h(React.Fragment, null,
        h('button', { type: 'button', className: 'dma-entry', title: t('actionHint'), 'aria-label': `${t('action')} · ${t('actionHint')}`, onClick: () => setOpen(true) }, h(Wand), t('action')),
        open ? h(Dialog, { key: `${props.sessionId}/${props.messageId}`, sessionId: props.sessionId, messageId: props.messageId, onClose: () => setOpen(false) }) : null)
    }
    ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({
      name: 'conversation.chat.assistant-actions', id: 'message-actions', order: 30, locale: NS,
    }, Action))
    ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
      name: 'plugins.bundle.config', key: 'dsh-message-actions', locale: NS,
    }, Settings))
  },
}
