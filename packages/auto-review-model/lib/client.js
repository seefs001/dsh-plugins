/**
 * dsh-auto-review-model — browser half.
 *
 * Settings on this bundle's Plugins page: pick the Auto review model from the
 * Host's live model catalog (the same providers and models as the composer's
 * model picker), plus an optional reasoning effort.
 */
window.__ModuleLoader__.load({
  id: 'dsh-auto-review-model',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement
    // Mirrors MAX_ENTRIES in the Host half.
    const MAX_LOG = 200
    // The panel shows this many newest reviews at a time and never grows taller than PANEL_MAX_HEIGHT.
    const PAGE_SIZE = 20
    const PANEL_MAX_HEIGHT = 360
    const NS = 'auto-review-model'
    const KEY = 'dsh-auto-review-model'
    const PACKAGE = 'dsh-auto-review-model'
    const SEP = '\u0000'

    const en = {
      title: 'Auto review model',
      hint: 'Auto review sends one extra request per tool call. Choose the model that judges those calls. "Same as session" keeps the built-in behavior.',
      model: 'Model',
      effort: 'Reasoning effort',
      sameAsSession: 'Same as session',
      modelDefault: 'Model default',
      unavailable: '(unavailable)',
      loading: 'Loading models…',
      loadFailed: 'Could not load the model list.',
      partial: 'Some providers failed to load their models.',
      retry: 'Retry',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved.',
      saveFailed: 'Save failed: ',
      warning: 'The reviewer must answer with strict JSON. Small models may fail often, and a failed review blocks the tool call.',
      promptTitle: 'Review prompt',
      promptMode: 'Mode',
      modeDefault: 'Built-in',
      modeAppend: 'Append rules',
      modeReplace: 'Replace',
      appendHint: 'Your rules are added after the built-in policy. Risk levels and the JSON output format stay as built in.',
      replaceHint: 'Your text replaces the built-in policy entirely. It must still make the reviewer return exactly one of: {"risk":"low","decision":"allow"}, {"risk":"medium","decision":"allow"}, {"risk":"medium","decision":"deny","reason":"..."}, {"risk":"high","decision":"deny","reason":"..."}. Any other output fails the review and blocks the call.',
      appendPlaceholder: 'For example:\n- Treat git push as medium risk unless I named the branch.\n- Deleting files under /tmp is low risk.',
      loadDefault: 'Load built-in prompt',
      defaultUnknown: 'The built-in prompt becomes available after Auto review runs once.',
      restartNeeded: 'The Host is still running an older version of this plugin. Restart dsh to enable review prompt settings.',
      chipPrefix: 'Review',
      chipSession: 'Same as session',
      chipTitle: 'Auto review model: {model}',
      chipTitleSession: 'Auto review uses this session\'s model (the composer model picker).',
      chipMissing: 'Provider "{provider}" is not available; Auto review falls back to the session model.',
      chipPrompt: 'Review prompt: {mode}',
      chipOpen: 'Click to change the review model.',
      chipOpenLog: 'Click to see this session\'s reviews.',
      logTitle: 'Auto reviews in this session',
      logSummary: '{allow} allowed · {deny} denied · {fail} failed',
      logSettings: 'Review settings',
      logClear: 'Clear',
      logClearConfirm: 'Delete the stored review records of this session?',
      logLoading: 'Loading…',
      logEmpty: 'No reviews yet. Each tool call reviewed in Auto mode appears here.',
      logUnavailable: 'The Host is still running an older version of this plugin. Restart dsh to record reviews.',
      logLimit: 'Keeps the latest {n} reviews per session, stored on this machine.',
      logAllow: 'Allowed',
      logDeny: 'Denied',
      logFailed: 'Review failed',
      logInvalid: 'Invalid answer',
      logRaw: 'Reviewer said:',
      logSessionModel: 'session model',
      logMore: 'Show older ({n} more)',
      logJump: 'Jump to this tool call',
      logJumpPtc: 'Jump to the run_code call that made this call',
      logJumpMissing: 'This call is not in the loaded conversation. Scroll up to load older messages, then try again.',
      risk_low: 'low',
      risk_medium: 'medium',
      risk_high: 'high',
    }
    const zh = {
      title: '自动审查模型',
      hint: '自动审查会为每次工具调用额外发一次请求。在这里选择负责审查的模型；“跟随会话”保持内置行为。',
      model: '模型',
      effort: '推理强度',
      sameAsSession: '跟随会话',
      modelDefault: '模型默认',
      unavailable: '（不可用）',
      loading: '正在加载模型…',
      loadFailed: '无法加载模型列表。',
      partial: '部分 provider 的模型加载失败。',
      retry: '重试',
      save: '保存',
      saving: '保存中…',
      saved: '已保存。',
      saveFailed: '保存失败：',
      warning: '审查模型必须输出严格的 JSON。小模型可能经常失败，审查失败时该工具调用不会执行。',
      promptTitle: '审查提示词',
      promptMode: '模式',
      modeDefault: '内置',
      modeAppend: '追加规则',
      modeReplace: '替换',
      appendHint: '你的规则会接在内置策略后面。风险分级和 JSON 输出格式保持内置不变。',
      replaceHint: '你的文本会完整替换内置策略，但仍须让审查模型只输出以下之一：{"risk":"low","decision":"allow"}、{"risk":"medium","decision":"allow"}、{"risk":"medium","decision":"deny","reason":"..."}、{"risk":"high","decision":"deny","reason":"..."}。其他输出都会导致审查失败，工具调用被拦下。',
      appendPlaceholder: '例如：\n- git push 一律视为 medium，除非我点名了分支。\n- 删除 /tmp 下的文件视为低风险。',
      loadDefault: '载入内置提示词',
      defaultUnknown: '内置提示词要在自动审查运行过一次后才能载入。',
      restartNeeded: 'Host 仍在运行旧版插件，重启 dsh 后才能使用审查提示词设置。',
      chipPrefix: '审查',
      chipSession: '跟随会话',
      chipTitle: '自动审查模型：{model}',
      chipTitleSession: '自动审查使用当前会话的模型（即输入框模型选择器里的模型）。',
      chipMissing: 'Provider「{provider}」当前不可用，自动审查会回退到会话模型。',
      chipPrompt: '审查提示词：{mode}',
      chipOpen: '点击修改审查模型。',
      chipOpenLog: '点击查看本会话的审查记录。',
      logTitle: '本会话的自动审查',
      logSummary: '放行 {allow} · 拒绝 {deny} · 失败 {fail}',
      logSettings: '审查设置',
      logClear: '清空',
      logClearConfirm: '删除本会话已保存的审查记录？',
      logLoading: '加载中…',
      logEmpty: '还没有审查记录。自动审查模式下每次工具调用都会出现在这里。',
      logUnavailable: 'Host 仍在运行旧版插件，重启 dsh 后才会记录审查。',
      logLimit: '每个会话保留最近 {n} 条，存储在本机。',
      logAllow: '放行',
      logDeny: '拒绝',
      logFailed: '审查失败',
      logInvalid: '回复不合规',
      logRaw: '审查模型回复：',
      logSessionModel: '会话模型',
      logMore: '显示更早的（还有 {n} 条）',
      logJump: '跳转到这次工具调用',
      logJumpPtc: '跳转到发起这次调用的 run_code',
      logJumpMissing: '这次调用不在已加载的对话里。往上滚动加载更早的消息后再试。',
      risk_low: '低风险',
      risk_medium: '中风险',
      risk_high: '高风险',
    }

    const CSS = `
.arm{--arm-line:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);--arm-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.arm-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.arm-hint,.arm-note{color:var(--dsw-alias-label-secondary);line-height:20px}
.arm-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.arm-note.err{color:var(--dsw-alias-state-error-primary)}
.arm-note.ok{color:var(--dsw-alias-state-success-primary)}
.arm-row{display:grid;grid-template-columns:120px minmax(0,360px);gap:8px;align-items:center}
.arm-row>span{color:var(--dsw-alias-label-secondary)}
.arm select{height:32px;min-width:0;padding:0 8px;border:var(--arm-line);border-radius:var(--arm-r);background:var(--dsw-alias-button-elevated-fill,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}
.arm select:disabled,.arm textarea:disabled{opacity:.6;cursor:default}
.arm textarea{min-height:160px;padding:8px 10px;border:var(--arm-line);border-radius:var(--arm-r);background:var(--dsw-alias-markdown-code-block,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:12px/1.6 "SF Mono","JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;resize:vertical}
.arm select:focus-visible,.arm textarea:focus-visible,.arm-btn:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.arm-section{display:flex;flex-direction:column;gap:12px;padding-top:16px;border-top:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1)}
.arm-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.arm-btn{height:30px;padding:0 14px;border:var(--arm-line);border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;transition:background-color .15s}
.arm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.arm-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}
.arm-btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary)))}
.arm-btn:disabled{opacity:.4;cursor:default}
@media (max-width:560px){.arm-row{grid-template-columns:1fr}}
`

    async function getJson(path, init) {
      const r = await fetch(path, { ...init, headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      return data
    }

    // Fill fields an older Host omits, so the page never shows an undefined mode.
    const MODES = ['default', 'append', 'replace']
    function normalize(s) {
      const text = v => (typeof v === 'string' ? v : '')
      return {
        provider: text(s?.provider),
        model: text(s?.model),
        reasoningEffort: text(s?.reasoningEffort),
        promptMode: MODES.includes(s?.promptMode) ? s.promptMode : 'default',
        prompt: text(s?.prompt),
        defaultPrompt: text(s?.defaultPrompt),
        // An older Host omits promptMode and silently drops prompt settings.
        legacy: s === null || typeof s !== 'object' || !('promptMode' in s),
      }
    }

    const CHIP_CSS = `
.arm-chip{display:inline-flex;align-items:center;gap:4px;max-width:220px;height:24px;padding:0 8px;border:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);border-radius:999px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:22px;white-space:nowrap;cursor:default;user-select:none}
button.arm-chip{background:transparent;font:inherit;font-size:12px;cursor:pointer;transition:background-color .15s}
button.arm-chip:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
button.arm-chip:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.arm-chip b{font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis}
.arm-chip.warn{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.arm-chip.warn b{color:inherit}
.arm-chip-count{min-width:16px;padding:0 5px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.15));font-size:11px;line-height:16px;text-align:center}
.arm-chip-count.err{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted,#fff)}
.arm-pop{position:fixed;z-index:1000;display:flex;flex-direction:column;border:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-elevated,var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base)));box-shadow:0 8px 28px rgba(0,0,0,.18);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;overflow:hidden}
.arm-pop-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px 8px 12px;border-bottom:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1)}
.arm-pop-title{font-size:13px;font-weight:500;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.arm-pop-actions{display:flex;gap:4px;flex:none}
.arm-pop-btn{height:24px;padding:0 10px;border:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}
.arm-pop-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.arm-pop-btn:disabled{opacity:.4;cursor:default}
.arm-pop-empty{padding:16px 12px;color:var(--dsw-alias-label-secondary)}
.arm-pop-foot{padding:6px 12px;border-top:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:11px}
.arm-log{margin:0;padding:4px 0;list-style:none;overflow-y:auto;min-height:0;flex:1}
.arm-log-row{padding:0 4px}
.arm-log-line{display:flex;align-items:center;gap:2px}
.arm-log-more{display:flex;justify-content:center;padding:6px 0 4px}
.arm-log-detail .arm-log-args{max-height:96px}
.arm-log-line>.arm-log-head{flex:1;min-width:0}
.arm-log-jump{flex:none;width:24px;height:24px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer}
.arm-log-jump:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
.arm-log-jump:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary))}
.arm-log-reason.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
[data-arm-flash]{border-radius:8px;animation:arm-flash 1600ms ease-out forwards}
@keyframes arm-flash{0%,40%{box-shadow:0 0 0 2px var(--dsw-alias-link,var(--dsw-alias-brand-primary))}100%{box-shadow:0 0 0 2px transparent}}
.arm-log-head{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;padding:5px 8px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.arm-log-head:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.arm-log-time,.arm-log-dim{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.arm-log-tool{font-family:"SF Mono","JetBrains Mono",ui-monospace,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.arm-log-verdict{white-space:nowrap}
.arm-log-verdict.ok{color:var(--dsw-alias-state-success-primary)}
.arm-log-verdict.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.arm-log-verdict.err{color:var(--dsw-alias-state-error-primary)}
.arm-log-reason{padding:0 8px 4px 74px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.arm-log-reason.full{padding:0;white-space:pre-wrap;overflow-wrap:anywhere}
.arm-log-detail{display:flex;flex-direction:column;gap:4px;padding:2px 8px 8px 74px}
.arm-log-meta{color:var(--dsw-alias-label-secondary)}
.arm-log-args{margin:0;max-height:160px;overflow:auto;padding:6px 8px;border-radius:6px;background:var(--dsw-alias-markdown-code-block,var(--dsw-alias-bg-layer-2));font:11px/1.5 "SF Mono","JetBrains Mono",ui-monospace,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
`

    return {
      inject: ['slots', 'locale', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'auto-review-model: dictionaries')
        const t = ctx.locale.bind(NS)

        // Shared snapshot of the saved review route and the model catalog, read by every composer chip.
        let shared = { config: null, groups: [] }
        const listeners = new Set()
        const publish = next => { shared = { ...shared, ...next }; listeners.forEach(fn => fn()) }
        const refreshConfig = () => getJson('auto-review-model/state').then(raw => publish({ config: normalize(raw) })).catch(() => {})
        const refreshCatalog = () => ctx.remote.session.modelCatalog()
          .then(res => { if (res.ok) publish({ groups: res.value.groups }) }).catch(() => {})
        const refreshAll = () => { refreshConfig(); refreshCatalog() }
        const subscribe = fn => {
          if (listeners.size === 0) refreshAll()
          listeners.add(fn)
          return () => listeners.delete(fn)
        }
        ctx.effect(() => {
          const offs = [
            ctx.remote.$on('llm/adapters-updated', refreshCatalog),
            ctx.remote.$on('settings/document-updated', refreshAll),
          ]
          // Saving restarts the Host half; refresh when the user comes back to the tab.
          window.addEventListener('focus', refreshConfig)
          return () => { offs.forEach(off => { try { off() } catch {} }); window.removeEventListener('focus', refreshConfig) }
        }, 'auto-review-model: chip data')

        /** Follow one session's stored review log over SSE while mounted. */
        function useReviewLog(sessionId, enabled) {
          const [log, setLog] = React.useState({ status: 'loading', entries: [] })
          React.useEffect(() => {
            if (!enabled || !sessionId) return undefined
            const es = new EventSource(`auto-review-model/log/events?session=${encodeURIComponent(sessionId)}`)
            es.onmessage = e => {
              let data = null
              try { data = JSON.parse(e.data) } catch {}
              if (data && Array.isArray(data.entries)) setLog({ status: 'ready', entries: data.entries })
            }
            // An older Host has no log route; the browser keeps retrying, so stop after the first failure before any data.
            es.onerror = () => setLog(l => {
              if (l.status === 'loading') { es.close(); return { status: 'unavailable', entries: [] } }
              return l
            })
            return () => es.close()
          }, [sessionId, enabled])
          return log
        }

        const fmtTime = at => {
          const d = new Date(at)
          const p = n => String(n).padStart(2, '0')
          return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
        }
        const fmtMs = ms => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`)

        /** Verdict label and tone for one entry. */
        function verdictOf(e) {
          if (e.status === 'error') return { tone: 'err', text: t('logFailed') }
          if (e.status === 'invalid') return { tone: 'err', text: t('logInvalid') }
          return { tone: e.decision === 'allow' ? (e.risk === 'low' ? 'ok' : 'warn') : 'err', text: `${t(e.decision === 'allow' ? 'logAllow' : 'logDeny')} · ${t(`risk_${e.risk}`)}` }
        }

        /** Open folded ancestors: `hidden="until-found"` rows listen for beforematch, details open directly. */
        function reveal(el) {
          let changed = false
          for (let p = el.parentElement; p !== null; p = p.parentElement) {
            if (p.hidden || p.getAttribute('hidden') === 'until-found') { p.dispatchEvent(new Event('beforematch', { bubbles: true })); changed = true }
            if (p.tagName === 'DETAILS' && !p.open) { p.open = true; changed = true }
          }
          return changed
        }

        const findCard = id => document.querySelector(`[data-chat-call-id="${CSS.escape(id)}"]`)

        /** Scroll instantly: a smooth scroll lasts long enough for the Chat's tail-follow to undo it. */
        function land(card) {
          const scroller = card.closest('[data-conversation-scroll]')
          if (scroller !== null) {
            const rect = card.getBoundingClientRect()
            const box = scroller.getBoundingClientRect()
            scroller.scrollTop += rect.height > box.height * 0.6
              ? rect.top - box.top - 80
              : rect.top + rect.height / 2 - (box.top + box.height / 2)
          } else card.scrollIntoView({ block: 'center', behavior: 'instant' })
        }

        let flashed = null
        let flashTimer = null
        /** Scroll the tool card of one reviewed call into view and flash it; `false` when it is not loaded. */
        function jumpToCall(id) {
          let card = findCard(id)
          if (card === null) return false
          if (reveal(card)) card = findCard(id) ?? card
          land(card)
          // Re-land once if the Chat's own scroll logic moved the view back.
          setTimeout(() => { const again = findCard(id); if (again !== null) land(again) }, 150)
          if (flashed !== null) flashed.removeAttribute('data-arm-flash')
          if (flashTimer !== null) clearTimeout(flashTimer)
          flashed = card
          card.removeAttribute('data-arm-flash')
          void card.offsetWidth
          card.setAttribute('data-arm-flash', '')
          flashTimer = setTimeout(() => { card.removeAttribute('data-arm-flash'); flashed = null; flashTimer = null }, 1600)
          return true
        }

        function ReviewRow({ entry, onJump }) {
          const [open, setOpen] = React.useState(false)
          const [missing, setMissing] = React.useState(false)
          const v = verdictOf(entry)
          const detail = entry.reason ?? entry.error ?? (entry.raw !== undefined ? `${t('logRaw')} ${entry.raw}` : undefined)
          const target = entry.rootCallId || entry.callId
          const jump = () => {
            if (onJump(target)) setMissing(false)
            else setMissing(true)
          }
          return h('li', { className: 'arm-log-row' },
            h('div', { className: 'arm-log-line' },
              h('button', { type: 'button', className: 'arm-log-head', onClick: () => setOpen(!open), 'aria-expanded': open },
                h('span', { className: 'arm-log-time' }, fmtTime(entry.at)),
                h('span', { className: 'arm-log-tool' }, entry.tool || '?', entry.mode === 'ptc-inner' ? h('span', { className: 'arm-log-dim' }, ' (PTC)') : null),
                h('span', { className: `arm-log-verdict ${v.tone}` }, v.text)),
              target ? h('button', {
                type: 'button', className: 'arm-log-jump', onClick: jump,
                title: t(entry.mode === 'ptc-inner' ? 'logJumpPtc' : 'logJump'), 'aria-label': t('logJump'),
              }, '↗') : null),
            missing ? h('div', { className: 'arm-log-reason warn' }, t('logJumpMissing')) : null,
            detail === undefined || open ? null : h('div', { className: 'arm-log-reason' }, detail),
            open ? h('div', { className: 'arm-log-detail' },
              detail === undefined ? null : h('div', { className: 'arm-log-reason full' }, detail),
              h('div', { className: 'arm-log-meta' },
                `${entry.provider}/${entry.model}${entry.effort ? ` (${entry.effort})` : ''}`,
                entry.routed ? '' : ` · ${t('logSessionModel')}`,
                ` · ${fmtMs(entry.ms)}`),
              entry.args ? h('pre', { className: 'arm-log-args' }, entry.args) : null) : null)
        }

        function ReviewPanel({ anchor, log, sessionId, onClose }) {
          const ref = React.useRef(null)
          const [pos, setPos] = React.useState(null)
          const [clearing, setClearing] = React.useState(false)
          React.useLayoutEffect(() => {
            const place = () => {
              const r = anchor.current?.getBoundingClientRect()
              if (!r) return
              const width = Math.min(440, window.innerWidth - 16)
              // Cap the height so a long log scrolls inside the panel instead of growing up the page.
              setPos({ left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)), bottom: window.innerHeight - r.top + 6, width, maxHeight: Math.min(PANEL_MAX_HEIGHT, Math.max(160, r.top - 16)) })
            }
            place()
            window.addEventListener('resize', place)
            return () => window.removeEventListener('resize', place)
          }, [anchor])
          React.useEffect(() => {
            const onDown = e => {
              if (ref.current?.contains(e.target) || anchor.current?.contains(e.target)) return
              onClose()
            }
            const onKey = e => { if (e.key === 'Escape') onClose() }
            document.addEventListener('pointerdown', onDown, true)
            document.addEventListener('keydown', onKey)
            return () => { document.removeEventListener('pointerdown', onDown, true); document.removeEventListener('keydown', onKey) }
          }, [anchor, onClose])
          const nav = ctx.get('pluginNavigation')
          const [shown, setShown] = React.useState(PAGE_SIZE)
          const entries = log.entries.slice().reverse()
          const visible = entries.slice(0, shown)
          const hidden = entries.length - visible.length
          const counts = { allow: 0, deny: 0, fail: 0 }
          for (const e of log.entries) {
            if (e.status !== 'ok') counts.fail++
            else if (e.decision === 'allow') counts.allow++
            else counts.deny++
          }
          const clear = async () => {
            if (!window.confirm(t('logClearConfirm'))) return
            setClearing(true)
            try { await getJson(`auto-review-model/log/clear?session=${encodeURIComponent(sessionId)}`, { method: 'POST', body: '{}' }) } catch {}
            setClearing(false)
          }
          if (pos === null) return null
          return ReactDOM.createPortal(h('div', {
            ref, className: 'arm-pop', role: 'dialog', 'aria-label': t('logTitle'),
            style: { left: pos.left, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight },
          },
            h('style', null, CHIP_CSS),
            h('div', { className: 'arm-pop-head' },
              h('div', { className: 'arm-pop-title' }, t('logTitle'),
                log.status === 'ready' ? h('span', { className: 'arm-log-dim' }, ` ${t('logSummary', { allow: counts.allow, deny: counts.deny, fail: counts.fail })}`) : null),
              h('div', { className: 'arm-pop-actions' },
                nav === undefined ? null : h('button', { type: 'button', className: 'arm-pop-btn', onClick: () => { onClose(); nav.openBundle(PACKAGE) } }, t('logSettings')),
                entries.length === 0 ? null : h('button', { type: 'button', className: 'arm-pop-btn', disabled: clearing, onClick: clear }, t('logClear')))),
            log.status === 'loading' ? h('div', { className: 'arm-pop-empty' }, t('logLoading'))
              : log.status === 'unavailable' ? h('div', { className: 'arm-pop-empty' }, t('logUnavailable'))
              : entries.length === 0 ? h('div', { className: 'arm-pop-empty' }, t('logEmpty'))
              : h('ul', { className: 'arm-log' },
                visible.map(e => h(ReviewRow, { key: e.id, entry: e, onJump: id => { const ok = jumpToCall(id); if (ok) onClose(); return ok } })),
                hidden === 0 ? null : h('li', { className: 'arm-log-more' },
                  h('button', { type: 'button', className: 'arm-pop-btn', onClick: () => setShown(n => n + PAGE_SIZE) }, t('logMore', { n: hidden })))),
            h('div', { className: 'arm-pop-foot' }, t('logLimit', { n: MAX_LOG }))), document.body)
        }

        function ReviewChip({ useProjection, sessionId }) {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const data = React.useSyncExternalStore(subscribe, () => shared)
          const permissions = useProjection('permissions')
          const auto = permissions?.currentValue === 'auto'
          const log = useReviewLog(sessionId, auto)
          const [open, setOpen] = React.useState(false)
          const anchor = React.useRef(null)
          const close = React.useCallback(() => setOpen(false), [])
          if (!auto || data.config === null) return null
          const { provider, model, reasoningEffort, promptMode } = data.config
          const group = data.groups.find(g => g.id === provider)
          const found = group?.models.find(m => m.id === model)
          const missing = provider !== '' && data.groups.length > 0 && group === undefined
          const name = provider === '' ? t('chipSession') : (found?.name ?? model) + (reasoningEffort ? ` · ${reasoningEffort}` : '')
          const lines = [provider === '' ? t('chipTitleSession') : t('chipTitle', { model: `${group?.name ?? provider} / ${found?.name ?? model}${reasoningEffort ? ` (${reasoningEffort})` : ''}` })]
          if (missing) lines.push(t('chipMissing', { provider }))
          if (promptMode !== 'default') lines.push(t('chipPrompt', { mode: t(promptMode === 'append' ? 'modeAppend' : 'modeReplace') }))
          lines.push(t('chipOpenLog'))
          const total = log.entries.length
          const denied = log.entries.filter(e => e.status !== 'ok' || e.decision === 'deny').length
          return h(React.Fragment, null,
            h('button', {
              ref: anchor, type: 'button', onClick: () => setOpen(!open), 'aria-expanded': open, 'aria-haspopup': 'dialog',
              className: missing ? 'arm-chip warn' : 'arm-chip', title: lines.join('\n'), 'aria-label': lines.join(' '),
            },
              h('style', null, CHIP_CSS),
              h('span', null, t('chipPrefix')),
              h('b', null, name),
              total === 0 ? null : h('span', { className: denied > 0 ? 'arm-chip-count err' : 'arm-chip-count' }, denied > 0 ? `${denied}/${total}` : String(total))),
            open ? h(ReviewPanel, { anchor, log, sessionId, onClose: close }) : null)
        }

        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'auto-review-model.chip',
          order: 100,
          locale: NS,
        }, ReviewChip))

        function Settings() {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const [catalog, setCatalog] = React.useState({ status: 'loading', groups: [], partial: false })
          const [saved, setSaved] = React.useState(null)
          const [draft, setDraft] = React.useState(null)
          const [status, setStatus] = React.useState({ kind: 'idle' })

          const loadCatalog = React.useCallback(async () => {
            setCatalog(c => ({ ...c, status: 'loading' }))
            try {
              const res = await ctx.remote.session.modelCatalog()
              if (!res.ok) throw res.error ?? new Error('catalog')
              setCatalog({ status: 'ready', groups: res.value.groups, partial: res.value.failures.length > 0 })
            } catch {
              setCatalog(c => ({ ...c, status: 'error' }))
            }
          }, [])

          React.useEffect(() => {
            loadCatalog()
            getJson('auto-review-model/state')
              .then(raw => { const s = normalize(raw); setSaved(s); setDraft(s) })
              .catch(e => setStatus({ kind: 'err', message: e.message }))
            const offs = [
              ctx.remote.$on('llm/adapters-updated', loadCatalog),
              ctx.remote.$on('settings/document-updated', loadCatalog),
            ]
            return () => offs.forEach(off => { try { off() } catch {} })
          }, [loadCatalog])

          const value = draft ?? { provider: '', model: '', reasoningEffort: '', promptMode: 'default', prompt: '' }
          const key = value.provider === '' ? '' : `${value.provider}${SEP}${value.model}`
          const found = catalog.groups.find(g => g.id === value.provider)?.models.find(m => m.id === value.model)
          const efforts = found?.reasoning?.efforts ?? []
          const dirty = saved !== null && ['provider', 'model', 'reasoningEffort', 'promptMode', 'prompt'].some(f => saved[f] !== value[f])
          const replaceEmpty = value.promptMode === 'replace' && value.prompt.trim() === ''

          const onModel = e => {
            const [provider = '', model = ''] = e.target.value === '' ? [] : e.target.value.split(SEP)
            setDraft({ ...value, provider, model, reasoningEffort: '' })
            setStatus({ kind: 'idle' })
          }
          const onEffort = e => {
            setDraft({ ...value, reasoningEffort: e.target.value })
            setStatus({ kind: 'idle' })
          }
          const onMode = e => {
            const promptMode = e.target.value
            const prompt = promptMode === 'replace' && value.prompt.trim() === '' && saved?.defaultPrompt ? saved.defaultPrompt : value.prompt
            setDraft({ ...value, promptMode, prompt })
            setStatus({ kind: 'idle' })
          }
          const onPrompt = e => {
            setDraft({ ...value, prompt: e.target.value })
            setStatus({ kind: 'idle' })
          }
          const loadDefault = () => {
            if (saved?.defaultPrompt) setDraft({ ...value, prompt: saved.defaultPrompt })
          }
          const save = async () => {
            setStatus({ kind: 'saving' })
            try {
              const { defaultPrompt: _ignored, legacy: _legacy, ...body } = value
              const s = normalize(await getJson('auto-review-model/set', { method: 'POST', body: JSON.stringify(body) }))
              setSaved(s)
              setDraft(s)
              publish({ config: s })
              setStatus({ kind: 'ok' })
            } catch (e) {
              setStatus({ kind: 'err', message: e.message })
            }
          }

          const modelOptions = [h('option', { key: '', value: '' }, t('sameAsSession'))]
          for (const g of catalog.groups) {
            modelOptions.push(h('optgroup', { key: g.id, label: g.name },
              g.models.map(m => h('option', { key: m.id, value: `${g.id}${SEP}${m.id}` }, m.name))))
          }
          if (key !== '' && found === undefined) {
            modelOptions.push(h('option', { key: 'missing', value: key }, `${value.provider}/${value.model} ${t('unavailable')}`))
          }
          const effortOptions = [h('option', { key: '', value: '' }, t('modelDefault'))]
            .concat(efforts.map(ef => h('option', { key: ef.id, value: ef.id }, ef.name)))
          if (value.reasoningEffort !== '' && !efforts.some(ef => ef.id === value.reasoningEffort)) {
            effortOptions.push(h('option', { key: 'missing', value: value.reasoningEffort }, `${value.reasoningEffort} ${t('unavailable')}`))
          }

          const busy = status.kind === 'saving' || saved === null
          return h('div', { className: 'arm' },
            h('style', null, CSS),
            h('h4', { className: 'arm-title' }, t('title')),
            h('div', { className: 'arm-hint' }, t('hint')),
            h('label', { className: 'arm-row' },
              h('span', null, t('model')),
              h('select', { value: key, onChange: onModel, disabled: busy }, modelOptions)),
            value.provider === '' ? null : h('label', { className: 'arm-row' },
              h('span', null, t('effort')),
              h('select', { value: value.reasoningEffort, onChange: onEffort, disabled: busy || (efforts.length === 0 && value.reasoningEffort === '') }, effortOptions)),
            catalog.status === 'loading' ? h('div', { className: 'arm-note' }, t('loading')) : null,
            catalog.status === 'error' ? h('div', { className: 'arm-note err' }, t('loadFailed'), ' ',
              h('button', { type: 'button', className: 'arm-btn', onClick: loadCatalog }, t('retry'))) : null,
            catalog.partial ? h('div', { className: 'arm-note warn' }, t('partial')) : null,
            value.provider === '' ? null : h('div', { className: 'arm-note warn' }, t('warning')),
            h('div', { className: 'arm-section' },
              h('h4', { className: 'arm-title' }, t('promptTitle')),
              saved?.legacy ? h('div', { className: 'arm-note warn' }, t('restartNeeded')) : null,
              h('label', { className: 'arm-row' },
                h('span', null, t('promptMode')),
                h('select', { value: value.promptMode, onChange: onMode, disabled: busy || saved?.legacy },
                  h('option', { value: 'default' }, t('modeDefault')),
                  h('option', { value: 'append' }, t('modeAppend')),
                  h('option', { value: 'replace' }, t('modeReplace')))),
              value.promptMode === 'default' ? null : h('div', { className: value.promptMode === 'replace' ? 'arm-note warn' : 'arm-hint' },
                t(value.promptMode === 'replace' ? 'replaceHint' : 'appendHint')),
              value.promptMode === 'default' ? null : h('textarea', {
                value: value.prompt, onChange: onPrompt, disabled: busy, spellCheck: false,
                placeholder: value.promptMode === 'append' ? t('appendPlaceholder') : '',
                rows: value.promptMode === 'replace' ? 18 : 8,
              }),
              value.promptMode !== 'replace' ? null : h('div', { className: 'arm-actions' },
                h('button', { type: 'button', className: 'arm-btn', disabled: busy || !saved?.defaultPrompt, onClick: loadDefault }, t('loadDefault')),
                saved?.defaultPrompt ? null : h('span', { className: 'arm-note' }, t('defaultUnknown')))),
            h('div', { className: 'arm-actions' },
              h('button', { type: 'button', className: 'arm-btn primary', disabled: busy || !dirty || replaceEmpty, onClick: save },
                status.kind === 'saving' ? t('saving') : t('save')),
              status.kind === 'ok' ? h('span', { className: 'arm-note ok' }, t('saved')) : null,
              status.kind === 'err' ? h('span', { className: 'arm-note err' }, t('saveFailed') + status.message) : null))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: KEY,
          locale: NS,
        }, Settings))
      },
    }
  },
})
