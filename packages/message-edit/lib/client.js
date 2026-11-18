/**
 * dsh-message-edit — browser half.
 *
 * Renders your messages with saved edits and a Copy / Edit action row. By default, editing
 * overwrites the message and clears later model context in the current
 * session without rerunning anything. Keeping later context is optional;
 * forking and resending is an explicit alternative.
 */
window.__ModuleLoader__.load({
  id: 'dsh-message-edit',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'messageEdit'
    const EN = {
      edit: 'Edit', editHint: 'Edit this message', title: 'Edit message', cancel: 'Cancel', close: 'Close',
      copy: 'Copy', copied: 'Copied', copyFailed: 'Could not copy the message.',
      loading: 'Loading…', working: 'Working…',
      clear: 'Fork and resend', clearHint: 'Create a separate session from just before this message and resend the edited version there. This session stays unchanged.',
      keep: 'Overwrite in this session', keepHint: 'Rewrite this message in the current session’s model context without switching sessions or rerunning anything. The message bubble and Copy action use the saved text.',
      clearLater: 'Clear later context', clearLaterHint: 'On by default: remove all later messages and tool results from the model context. Uncheck to keep them. Chat history remains visible; completed actions are not undone.',
      keepUnavailable: 'This message was compacted or cleared from context, so it can no longer be rewritten in place.',
      forkUnavailable: 'There is no earlier history to branch from.',
      submitClear: 'Branch and send', submitKeep: 'Save to context', submitTrim: 'Save and clear later context',
      edited: 'Edited', compacted: '(no longer in context)',
      empty: 'The message cannot be empty.', unchanged: 'Nothing changed.',
    }
    const ZH = {
      edit: '编辑', editHint: '编辑这条消息', title: '编辑消息', cancel: '取消', close: '关闭',
      copy: '复制', copied: '已复制', copyFailed: '无法复制消息。',
      loading: '正在加载…', working: '正在处理…',
      clear: '分叉并重发', clearHint: '另建一个会话，从这条消息之前的历史重新回答。当前会话保持不变。',
      keep: '覆盖当前会话', keepHint: '在当前会话的模型上下文里改写这条消息，不切换会话，也不会重新回答。消息气泡和复制按钮都会使用保存后的文字。',
      clearLater: '清空后续上下文', clearLaterHint: '默认勾选：从模型上下文中移除这条消息之后的所有消息和工具结果。取消勾选则保留。聊天历史仍可见，已执行的操作不会撤销。',
      keepUnavailable: '这条消息已被压缩或从上下文中清空，无法在原处改写。',
      forkUnavailable: '这条消息之前没有可分支的历史。',
      submitClear: '分支并发送', submitKeep: '保存到上下文', submitTrim: '保存并清空后续上下文',
      edited: '已编辑', compacted: '（已不在上下文中）',
      empty: '消息不能为空。', unchanged: '内容没有变化。',
    }
    const CSS = `
.dme-row{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.dme-actions{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;min-height:calc(28px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary)}
.dme-time,.dme-badge{font-size:var(--dsh-content-font-size-secondary,13px);line-height:24px;white-space:nowrap}
.dme-time{padding-right:12px}
.dme-action{display:inline-flex;align-items:center;justify-content:center;width:calc(28px + var(--dsh-content-font-delta,0px));height:calc(28px + var(--dsh-content-font-delta,0px));padding:6px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:inherit;cursor:pointer}
.dme-action svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px))}
@media(hover:hover){.dme-action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
[data-actions-reveal='hover'] .dme-actions,:is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering']):has(~ :is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering'])) .dme-actions{opacity:0;transition:opacity 80ms ease}
[data-actions-reveal='hover']:is(:hover,:focus-within) .dme-actions,:is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering']):has(~ :is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering'])):is(:hover,:focus-within) .dme-actions{opacity:1}}
.dme-dialog{box-sizing:border-box;width:min(680px,calc(100vw - 32px));max-height:calc(100dvh - 48px);padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 24px 80px var(--dsw-alias-bg-mask-2);font:inherit;font-size:14px;line-height:1.6;text-align:left}
.dme-dialog[open]{display:flex;flex-direction:column}
.dme-dialog::backdrop{background:var(--dsw-alias-bg-mask-1)}
.dme-dialog *{box-sizing:border-box}
.dme-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dme-head h2{margin:0;font-size:16px;font-weight:600}
.dme-body{display:flex;flex-direction:column;gap:14px;padding:16px 20px;overflow-y:auto}
.dme-text{width:100%;min-height:160px;max-height:50dvh;resize:vertical;padding:10px 12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:1.6}
.dme-modes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0;padding:0;border:0}
.dme-mode{display:flex;gap:8px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;cursor:pointer}
.dme-mode:has(input:checked){border-color:var(--dsw-alias-brand-primary-new-colorprimary-new-color);background:var(--dsw-alias-interactive-bg-active)}
.dme-mode:has(input:disabled){opacity:.5;cursor:not-allowed}
.dme-mode input{margin:3px 0 0;accent-color:var(--dsw-alias-brand-primary-new-colorprimary-new-color)}
.dme-mode b{display:block;font-size:13px;font-weight:600}
.dme-mode span{display:block;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.dme-error{margin:0;padding:8px 12px;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}
.dme-note{margin:0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dme-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid var(--dsw-alias-border-l1)}
.dme-btn{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:6px 14px;border:1px solid var(--dsw-alias-border-l3);border-radius:9px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.dme-btn:disabled{opacity:.4;cursor:not-allowed}
.dme-primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dme-icon{width:32px;min-height:32px;padding:0;border-color:transparent}
.dme-btn:focus-visible,.dme-action:focus-visible,.dme-text:focus-visible{outline:2px solid var(--dsw-alias-brand-primary-new-colorprimary-new-color);outline-offset:2px}
@media(hover:hover){.dme-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dme-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media(max-width:600px){.dme-modes{grid-template-columns:1fr}}
`

    async function op(body, signal) {
      const response = await fetch('message-edit/op', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal,
      })
      let data
      try { data = await response.json() } catch { throw new Error(`HTTP ${response.status}`) }
      if (!data.ok) throw new Error(data.message || `HTTP ${response.status}`)
      return data.value
    }

    // One shared, invalidatable edit list per session for its bubbles and badges.
    const lists = new Map()
    function editsStore(sessionId) {
      let entry = lists.get(sessionId)
      if (!entry) {
        entry = { value: {}, listeners: new Set(), generation: 0 }
        entry.refresh = () => {
          const generation = ++entry.generation
          return op({ action: 'list', sessionId }).then(v => {
            if (generation !== entry.generation) return
            entry.value = v.edited
            for (const fn of entry.listeners) fn()
          }).catch(() => {})
        }
        lists.set(sessionId, entry)
        void entry.refresh()
      }
      return entry
    }

    function Pencil() {
      return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4' }))
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'uiWorkspace'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'message-edit: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'message-edit: zh')
        const t = ctx.locale.bind(NS)
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, 'message-edit: styles')
        ctx.effect(() => () => lists.clear(), 'message-edit: edit cache')
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())

        function Dialog({ sessionId, rpcId, onClose, onDone }) {
          useLocale()
          const ref = React.useRef(null)
          const alive = React.useRef(true)
          const [info, setInfo] = React.useState(null)
          const [text, setText] = React.useState('')
          const [mode, setMode] = React.useState('keep')
          const [clearLater, setClearLater] = React.useState(true)
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState('')
          React.useEffect(() => {
            alive.current = true
            const node = ref.current
            const previous = document.activeElement
            node.showModal()
            const controller = new AbortController()
            op({ action: 'inspect', sessionId, rpcId }, controller.signal).then(v => {
              if (controller.signal.aborted) return
              setInfo(v); setText(v.text)
            }).catch(e => { if (!controller.signal.aborted) setError(e.message) })
            return () => {
              alive.current = false
              controller.abort()
              node.close()
              if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
            }
          }, [])
          const canClear = info?.forkAt !== null && info?.forkAt !== undefined
          const canKeep = Boolean(info?.inContext)
          const submit = async () => {
            if (!text.trim()) { setError(t('empty')); return }
            if (!info || busy || (mode === 'keep' ? !canKeep : !canClear)) return
            if (mode === 'keep' && !clearLater && text === info.text) { setError(t('unchanged')); return }
            setBusy(true); setError('')
            try {
              if (mode === 'keep') {
                await op({ action: 'rewrite', sessionId, rpcId, text, clearLater })
                if (alive.current) onDone(text)
              } else {
                const childId = await ctx.sessions.fork({ sessionId, atSeq: info.forkAt, increaseTitle: true })
                await op({ action: 'send', sessionId: childId, sourceSessionId: sessionId, rpcId, text })
                if (!alive.current) return
                ctx.uiWorkspace.openSession(childId)
                onClose()
              }
            } catch (e) {
              if (alive.current) { setError(e.message); setBusy(false) }
            }
          }
          const mode_ = (value, label, hint, disabled, note) => h('label', { className: 'dme-mode' },
            h('input', { type: 'radio', name: 'dme-mode', value, checked: mode === value, disabled: disabled || busy, onChange: () => setMode(value) }),
            h('div', null, h('b', null, label), h('span', null, disabled && info ? note : hint)))
          return h('dialog', {
            ref, className: 'dme-dialog', 'aria-label': t('title'),
            onCancel: e => { e.preventDefault(); if (!busy) onClose() },
            onKeyDown: e => {
              e.stopPropagation()
              if (!e.nativeEvent.isComposing && e.keyCode !== 229 && e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !busy && info) { e.preventDefault(); void submit() }
            },
          },
          h('div', { className: 'dme-head' }, h('h2', null, t('title')),
            h('button', { type: 'button', className: 'dme-btn dme-icon', onClick: onClose, disabled: busy, 'aria-label': t('close'), title: t('close') }, '✕')),
          h('div', { className: 'dme-body' },
            info ? h('textarea', { className: 'dme-text', value: text, autoFocus: true, disabled: busy, onChange: e => { setText(e.target.value); setError('') } })
              : !error && h('p', { className: 'dme-note', role: 'status' }, t('loading')),
            info ? h('fieldset', { className: 'dme-modes' },
              mode_('keep', t('keep'), t('keepHint'), !canKeep, t('keepUnavailable')),
              mode_('clear', t('clear'), t('clearHint'), !canClear, t('forkUnavailable'))) : null,
            info && mode === 'keep' ? h('label', { className: 'dme-mode' },
              h('input', { type: 'checkbox', checked: clearLater, disabled: busy || !canKeep, onChange: e => { setClearLater(e.target.checked); setError('') } }),
              h('div', null, h('b', null, t('clearLater')), h('span', null, t('clearLaterHint')))) : null,
            error ? h('p', { className: 'dme-error', role: 'alert' }, error) : null),
          h('div', { className: 'dme-foot' },
            h('button', { type: 'button', className: 'dme-btn', onClick: onClose, disabled: busy }, t('cancel')),
            h('button', { type: 'button', className: 'dme-btn dme-primary', onClick: submit, disabled: busy || !info || (mode === 'clear' ? !canClear : !canKeep) },
              busy && info ? t('working') : t(mode === 'clear' ? 'submitClear' : clearLater ? 'submitTrim' : 'submitKeep'))))
        }

        function UserMessage({ node, sessionId, loadImage, renderFactorySlot, renderSlotChain }) {
          useLocale()
          const data = node.data
          const rpcId = data.source?.kind === 'user' ? data.source.rpcId : undefined
          const subscribe = React.useCallback(fn => {
            const store = editsStore(sessionId)
            store.listeners.add(fn)
            return () => {
              store.listeners.delete(fn)
              if (!store.listeners.size && lists.get(sessionId) === store) lists.delete(sessionId)
            }
          }, [sessionId])
          const edited = React.useSyncExternalStore(subscribe, () => lists.get(sessionId)?.value[rpcId])
          const [open, setOpen] = React.useState(false)
          const [copied, setCopied] = React.useState(false)
          const [copyError, setCopyError] = React.useState(false)
          const content = React.useMemo(() => {
            const texts = [], attachments = [], extraBlocks = []
            for (const block of data.content) {
              if (block.type === 'text' && typeof block.text === 'string') texts.push(block.text)
              else if (block.type === 'image' && block.attachment) attachments.push({ type: 'image', image: { attachment: block.attachment } })
              else if (block.type === 'file' && block.attachment) attachments.push({ type: 'file', file: block.attachment })
              else extraBlocks.push(block)
            }
            return { text: edited?.text ?? texts.join(''), attachments, extraBlocks, referenceLabels: data.referenceLabels }
          }, [data.content, data.referenceLabels, edited?.text])
          const facts = React.useMemo(() => ({
            ...(data.referenceLabels === undefined ? {} : { sessionLabels: data.referenceLabels }),
            ...(data.skillNames === undefined ? {} : { skillNames: data.skillNames }),
          }), [data.referenceLabels, data.skillNames])
          React.useEffect(() => {
            setCopied(false); setCopyError(false)
          }, [content.text])
          React.useEffect(() => {
            if (!copied) return
            const timer = setTimeout(() => setCopied(false), 2000)
            return () => clearTimeout(timer)
          }, [copied])
          const copy = async () => {
            try {
              await navigator.clipboard.writeText(content.text)
              setCopied(true); setCopyError(false)
            } catch { setCopyError(true) }
          }
          const date = new Date(data.time)
          const clock = date.toDateString() === new Date().toDateString()
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          return h('div', { className: 'dme-row' },
            renderSlotChain('conversation.chat.user.before', { source: data.source, kind: node.kind }, { fallback: null }),
            renderFactorySlot('conversation.chat.user.content', { content, facts, interactive: true, loadImage }),
            h('div', { className: 'dme-actions' },
              edited ? h('span', { className: 'dme-badge' }, t('edited'), edited.inContext ? '' : ` ${t('compacted')}`) : null,
              h('time', { className: 'dme-time', dateTime: date.toISOString(), title: date.toLocaleString() }, clock),
              h('button', { type: 'button', className: 'dme-action', onClick: copy, title: t(copied ? 'copied' : 'copy'), 'aria-label': t(copied ? 'copied' : 'copy') },
                h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true },
                  copied ? h('path', { d: 'm5 12 4 4L19 6' }) : h(React.Fragment, null, h('rect', { x: 8, y: 8, width: 12, height: 12, rx: 2 }), h('path', { d: 'M16 8V4H4v12h4' })))),
              typeof rpcId === 'string' ? h('button', { type: 'button', className: 'dme-action', title: t('editHint'), 'aria-label': t('editHint'), 'aria-haspopup': 'dialog', onClick: () => setOpen(true) }, h(Pencil)) : null),
            copyError ? h('p', { className: 'dme-error', role: 'alert' }, t('copyFailed')) : null,
            open ? h(Dialog, { key: JSON.stringify([sessionId, rpcId]), sessionId, rpcId, onClose: () => setOpen(false), onDone: text => {
              const store = lists.get(sessionId)
              if (!store) return
              store.value = { ...store.value, [rpcId]: { text, inContext: true } }
              for (const notify of store.listeners) notify()
              setOpen(false)
              void store.refresh()
            } }) : null)
        }

        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
          name: 'conversation.chat.node', key: 'user', priority: -10,
          children: { 'conversation.chat.user.before': { kind: 'chain', scope: 'session' } },
        }, UserMessage))
      },
    }
  },
})
