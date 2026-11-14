/**
 * dsh-message-edit — browser half.
 *
 * Adds an edit control above each of your messages. "Clear later messages"
 * forks the session just before the message and sends the edited copy there;
 * "Keep later messages" rewrites the message in the model context of the
 * current session without rerunning anything.
 */
window.__ModuleLoader__.load({
  id: 'dsh-message-edit',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement
    const NS = 'messageEdit'
    const EN = {
      edit: 'Edit', editHint: 'Edit this message', title: 'Edit message', cancel: 'Cancel', close: 'Close',
      loading: 'Loading…', working: 'Working…',
      clear: 'Clear later messages', clearHint: 'Branch into a new session from just before this message and send the edited version. This session stays unchanged.',
      keep: 'Keep later messages', keepHint: 'Rewrite this message in the model context of this session. Later messages stay; nothing reruns. The chat still shows the original text.',
      keepUnavailable: 'This message was compacted, so it can no longer be rewritten in place.',
      forkUnavailable: 'There is no earlier history to branch from.',
      submitClear: 'Branch and send', submitKeep: 'Save to context',
      edited: 'Edited in context', showEdited: 'What the model now sees', compacted: '(since compacted)',
      empty: 'The message cannot be empty.', unchanged: 'Nothing changed.',
    }
    const ZH = {
      edit: '编辑', editHint: '编辑这条消息', title: '编辑消息', cancel: '取消', close: '关闭',
      loading: '正在加载…', working: '正在处理…',
      clear: '清理后续消息', clearHint: '从这条消息之前分出新会话，发送修改后的消息并重新回答。当前会话保持不变。',
      keep: '保留后续消息', keepHint: '只在当前会话的模型上下文里改写这条消息，后续消息保留，不会重新回答。聊天记录仍显示原文。',
      keepUnavailable: '这条消息已被压缩，无法在原处改写。',
      forkUnavailable: '这条消息之前没有可分支的历史。',
      submitClear: '分支并发送', submitKeep: '保存到上下文',
      edited: '上下文已修改', showEdited: '模型现在看到的内容', compacted: '（之后已被压缩）',
      empty: '消息不能为空。', unchanged: '内容没有变化。',
    }
    const CSS = `
.dme-before{display:flex;justify-content:flex-end;align-items:center;gap:6px;min-height:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dme-before:empty{display:none}
.dme-badge svg{width:14px;height:14px;flex:none}
.dme-badge{display:inline-flex;align-items:center;gap:4px;padding:0 6px;border:0;border-radius:6px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;white-space:nowrap;cursor:pointer}
.dme-preview{box-sizing:border-box;align-self:flex-end;max-width:min(560px,100%);margin:4px 0 6px;padding:8px 12px;border:1px dashed var(--dsw-alias-border-l3);border-radius:10px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
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
.dme-btn:focus-visible,.dme-badge:focus-visible,.dme-text:focus-visible{outline:2px solid var(--dsw-alias-brand-primary-new-colorprimary-new-color);outline-offset:2px}
@media(hover:hover){.dme-badge:hover,.dme-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dme-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media(max-width:600px){.dme-modes{grid-template-columns:1fr}}
`

    async function op(body) {
      const response = await fetch('message-edit/op', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      })
      let data
      try { data = await response.json() } catch { throw new Error(`HTTP ${response.status}`) }
      if (!data.ok) throw new Error(data.message || `HTTP ${response.status}`)
      return data.value
    }

    // One shared, invalidatable edit list per session for every badge in it.
    const lists = new Map()
    function editsStore(sessionId) {
      let entry = lists.get(sessionId)
      if (!entry) {
        entry = { value: {}, listeners: new Set(), loading: null }
        entry.refresh = () => {
          entry.loading = op({ action: 'list', sessionId }).then(v => {
            entry.value = v.edited
            for (const fn of entry.listeners) fn()
          }).catch(() => {})
          return entry.loading
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
          const [mode, setMode] = React.useState('clear')
          const [busy, setBusy] = React.useState(true)
          const [error, setError] = React.useState('')
          React.useEffect(() => {
            alive.current = true
            const node = ref.current
            const previous = document.activeElement
            node.showModal()
            op({ action: 'inspect', sessionId, rpcId }).then(v => {
              if (!alive.current) return
              setInfo(v); setText(v.text)
              if (v.forkAt === null && v.inContext) setMode('keep')
            }).catch(e => { if (alive.current) setError(e.message) })
              .finally(() => { if (alive.current) setBusy(false) })
            return () => {
              alive.current = false
              node.close()
              if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
            }
          }, [])
          const canClear = info?.forkAt !== null && info?.forkAt !== undefined
          const canKeep = Boolean(info?.inContext)
          const submit = async () => {
            if (!text.trim()) { setError(t('empty')); return }
            if (mode === 'keep' && text === info.text) { setError(t('unchanged')); return }
            setBusy(true); setError('')
            try {
              if (mode === 'keep') {
                await op({ action: 'rewrite', sessionId, rpcId, text })
                onDone()
              } else {
                const childId = await ctx.sessions.fork({ sessionId, atSeq: info.forkAt, increaseTitle: true })
                await op({ action: 'send', sessionId: childId, sourceSessionId: sessionId, rpcId, text })
                onClose()
                ctx.uiWorkspace.openSession(childId)
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
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !busy && info) { e.preventDefault(); void submit() }
            },
          },
          h('div', { className: 'dme-head' }, h('h2', null, t('title')),
            h('button', { type: 'button', className: 'dme-btn dme-icon', onClick: onClose, disabled: busy, 'aria-label': t('close'), title: t('close') }, '✕')),
          h('div', { className: 'dme-body' },
            info ? h('textarea', { className: 'dme-text', value: text, autoFocus: true, disabled: busy, onChange: e => { setText(e.target.value); setError('') } })
              : h('p', { className: 'dme-note', role: 'status' }, t('loading')),
            info ? h('fieldset', { className: 'dme-modes' },
              mode_('clear', t('clear'), t('clearHint'), !canClear, t('forkUnavailable')),
              mode_('keep', t('keep'), t('keepHint'), !canKeep, t('keepUnavailable'))) : null,
            error ? h('p', { className: 'dme-error', role: 'alert' }, error) : null),
          h('div', { className: 'dme-foot' },
            h('button', { type: 'button', className: 'dme-btn', onClick: onClose, disabled: busy }, t('cancel')),
            h('button', { type: 'button', className: 'dme-btn dme-primary', onClick: submit, disabled: busy || !info || (mode === 'clear' ? !canClear : !canKeep) },
              busy && info ? t('working') : t(mode === 'clear' ? 'submitClear' : 'submitKeep'))))
        }

        function Before({ matched: rpcId, sessionId }) {
          useLocale()
          const store = editsStore(sessionId)
          const edited = React.useSyncExternalStore(fn => { store.listeners.add(fn); return () => store.listeners.delete(fn) }, () => store.value[rpcId])
          const [open, setOpen] = React.useState(false)
          const [show, setShow] = React.useState(false)
          const anchor = React.useRef(null)
          const [actions, setActions] = React.useState(null)
          // The bubble's own action row (time + copy) has no slot; mount the icon into it, after Copy.
          React.useLayoutEffect(() => {
            const wrapper = anchor.current?.parentElement
            const row = wrapper?.parentElement
            const found = row && [...row.children].toReversed().find(c => c !== wrapper && c.querySelector(':scope > button'))
            setActions(prev => (prev === (found ?? null) ? prev : found ?? null))
          })
          const copy = actions?.querySelector(':scope > button:not([data-dme])')
          const icon = document.getElementById('dsw-icon-edit-outline-regular')
            ? h('svg', { width: 16, height: 16, 'aria-hidden': true }, h('use', { href: '#dsw-icon-edit-outline-regular' }))
            : h(Pencil)
          const entry = h('button', {
            type: 'button', 'data-dme': '', className: copy?.className ?? 'dme-btn dme-icon',
            title: t('editHint'), 'aria-label': t('editHint'), 'aria-haspopup': 'dialog', onClick: () => setOpen(true),
          }, icon)
          return h(React.Fragment, null,
            h('div', { ref: anchor, className: 'dme-before' },
              edited ? h('button', { type: 'button', className: 'dme-badge', 'aria-expanded': show, onClick: () => setShow(v => !v), title: t('showEdited') },
                h(Pencil), t('edited'), edited.inContext ? '' : ` ${t('compacted')}`) : null),
            actions ? ReactDOM.createPortal(entry, actions) : null,
            edited && show ? h('div', { className: 'dme-preview', 'aria-label': t('showEdited') }, edited.text) : null,
            open ? h(Dialog, { sessionId, rpcId, onClose: () => setOpen(false), onDone: () => { setOpen(false); setShow(true); void store.refresh() } }) : null)
        }

        ctx.slots.inject('conversation.chat.user.before', () => ctx.slots.register({
          name: 'conversation.chat.user.before',
          select: owner => owner.kind === 'user' && owner.source?.kind === 'user' && typeof owner.source.rpcId === 'string' ? owner.source.rpcId : null,
        }, Before))
      },
    }
  },
})
