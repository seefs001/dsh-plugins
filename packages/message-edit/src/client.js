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
      clear: 'Fork and resend', clearHint: 'Creates a new session from just before this message and resends the edited text. The current session stays untouched.',
      keep: 'Edit in this session', keepHint: 'Updates this message in the current session without switching sessions.',
      clearLater: 'Clear later messages and resend', clearLaterHint: 'Checked by default: clears later messages and model context, then immediately generates a new reply (uncheck to only rewrite text and keep later history). Completed actions are not undone.',
      keepUnavailable: 'This message has already been compacted or cleared from context, so it can no longer be edited in place.',
      forkUnavailable: 'There is no earlier history to branch from.',
      submitClear: 'Branch and send', submitKeep: 'Save to context', submitTrim: 'Save and resend',
      edited: 'Edited', compacted: '(no longer in context)',
      empty: 'The message cannot be empty.', unchanged: 'Nothing changed.',
    }
    const ZH = {
      edit: '编辑', editHint: '编辑这条消息', title: '编辑消息', cancel: '取消', close: '关闭',
      copy: '复制', copied: '已复制', copyFailed: '无法复制消息。',
      loading: '正在加载…', working: '正在处理…',
      clear: '分叉并重发', clearHint: '另开一个新会话，从这条消息之前重新发送修改后的内容，原会话保持不变。',
      keep: '在当前会话修改', keepHint: '在当前会话直接改写这条消息，不切换会话。',
      clearLater: '清空后续消息并重新回答', clearLaterHint: '默认勾选：隐藏后续消息、清空后续模型上下文并立即重新生成回复（取消勾选则仅改写正文并保留后续内容）。已经做过的操作不会撤回。',
      keepUnavailable: '这条消息已被压缩或从上下文中清空，无法在原处改写。',
      forkUnavailable: '这条消息之前没有可分支的历史。',
      submitClear: '分支并发送', submitKeep: '保存到上下文', submitTrim: '保存并重新回答',
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
[data-actions-reveal='hover'] .dme-actions,:is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering']):has(~ :is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering']):not([data-dme-hidden])) .dme-actions{opacity:0;transition:opacity 80ms ease}
[data-actions-reveal='hover']:is(:hover,:focus-within) .dme-actions,:is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering']):has(~ :is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering']):not([data-dme-hidden])):is(:hover,:focus-within) .dme-actions{opacity:1}}
[data-dme-hidden]{display:none!important}
.dme-dialog{box-sizing:border-box;width:min(680px,calc(100vw - 32px));max-height:calc(100dvh - 48px);padding:0;border:0;border-radius:var(--dsw-radius-lg,16px);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-prominent);font:inherit;font-size:14px;line-height:1.6;text-align:left}
.dme-dialog[open]{display:flex;flex-direction:column}
.dme-dialog::backdrop{background:var(--dsw-alias-bg-mask-1)}
.dme-dialog *{box-sizing:border-box}
.dme-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.dme-head h2{margin:0;font-size:16px;font-weight:500}
.dme-body{display:flex;flex-direction:column;gap:14px;padding:16px 20px;overflow-y:auto}
.dme-text{width:100%;min-height:160px;max-height:50dvh;resize:vertical;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:1.6}
.dme-modes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0;padding:0;border:0}
.dme-mode{display:flex;gap:8px;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);cursor:pointer}
.dme-mode:has(input:checked){border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-active)}
.dme-mode:has(input:disabled){opacity:.5;cursor:not-allowed}
.dme-mode input{margin:3px 0 0;accent-color:var(--dsw-alias-state-business-primary)}
.dme-mode b{display:block;font-size:13px;font-weight:500}
.dme-mode span{display:block;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.dme-error{margin:0;padding:8px 12px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}
.dme-note{margin:0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dme-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:.5px solid var(--dsw-alias-border-l1)}
.dme-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 14px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.dme-btn:not(.dme-icon){border-radius:999px;corner-shape:round}
.dme-btn:disabled{opacity:.4;cursor:not-allowed}
.dme-primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-weight:500}
.dme-icon{width:30px;height:30px;padding:0;border:0;color:var(--dsw-alias-label-secondary)}
.dme-btn:focus-visible,.dme-action:focus-visible,.dme-text:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media(hover:hover){.dme-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dme-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media(pointer:coarse){.dme-text{font-size:16px}}
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

    const EMPTY_STATE = { edited: {}, hiddenRanges: [], hiddenSeqs: [] }
    function isSeqInRanges(seq, ranges) {
      if (typeof seq !== 'number') return false
      for (const [afterSeq, beforeSeq] of ranges) {
        if (seq > afterSeq && seq < beforeSeq) return true
      }
      return false
    }
    function isNodeHidden(node, state, hiddenRetryRpcIds) {
      if (!node) return false
      if (isSeqInRanges(node.anchorSeq, state.hiddenRanges)) return true
      if (state.hiddenSeqs.includes(node.anchorSeq)) return true
      if (node.kind === 'turn-process' && isSeqInRanges(node.location?.turn?.end?.seq, state.hiddenRanges)) return true
      if (node.kind === 'turn-trigger' && node.data?.source?.kind === 'retry'
        && typeof node.data.source.rpcId === 'string' && hiddenRetryRpcIds.has(node.data.source.rpcId)) return true
      return false
    }

    const lists = new Map()
    function syncFlow(ctx, flowEl, rec, sessionId, entry, force) {
      const binding = ctx.sessions.binding?.(sessionId)
      const conversation = binding && ctx.uiConversation?.binding?.(binding)
      const chat = conversation?.target?.('chat')?.getSnapshot?.()
      const grouped = conversation?.snapshot?.getSnapshot?.()?.views?.grouped?.('chat')
      const { value, hiddenRetryRpcIds } = entry
      const hasHiding = value.hiddenRanges.length > 0 || value.hiddenSeqs.length > 0 || hiddenRetryRpcIds.size > 0
      if (!hasHiding && !rec.hadHidden) {
        rec.lastOrder = chat?.order
        rec.lastEntries = grouped?.entries
        rec.lastValue = value
        rec.lastRetrySize = hiddenRetryRpcIds.size
        return
      }
      if (!force && rec.lastOrder === chat?.order && rec.lastEntries === grouped?.entries
        && rec.lastValue === value && rec.lastRetrySize === hiddenRetryRpcIds.size) return
      rec.lastOrder = chat?.order
      rec.lastEntries = grouped?.entries
      rec.lastValue = value
      rec.lastRetrySize = hiddenRetryRpcIds.size
      const hiddenNodes = new Set()
      const hiddenGroups = new Set()
      if (hasHiding && chat?.nodes) {
        for (const key of chat.order ?? []) {
          if (isNodeHidden(chat.nodes.get(key), value, hiddenRetryRpcIds)) hiddenNodes.add(key)
        }
        for (const item of grouped?.entries ?? []) {
          if (item.kind !== 'group') continue
          const members = grouped.groupSource?.(item.key)?.getSnapshot?.()?.members
          if (members?.length && members.every(m => hiddenNodes.has(m.key) || isNodeHidden(chat.nodes.get(m.key), value, hiddenRetryRpcIds))) {
            hiddenGroups.add(item.key)
          }
        }
      }
      let anyHidden = false
      for (const child of flowEl.children) {
        const nodeKey = child.getAttribute('data-chat-node-key')
        const groupKey = child.getAttribute('data-chat-group-key')
        const shouldHide = (nodeKey !== null && hiddenNodes.has(nodeKey))
          || (groupKey !== null && hiddenGroups.has(groupKey))
        if (shouldHide) {
          anyHidden = true
          if (!child.hasAttribute('data-dme-hidden')) child.setAttribute('data-dme-hidden', '')
        } else if (child.hasAttribute('data-dme-hidden')) {
          child.removeAttribute('data-dme-hidden')
        }
      }
      rec.hadHidden = anyHidden
    }
    function syncAllFlows(ctx, sessionId, entry, force) {
      for (const [flowEl, rec] of entry.flows) syncFlow(ctx, flowEl, rec, sessionId, entry, force)
    }
    function ensureBinding(ctx, sessionId, entry) {
      if (entry.bindingCleanup) return
      const binding = ctx.sessions.binding?.(sessionId)
      const conversation = binding && ctx.uiConversation?.binding?.(binding)
      if (!binding || !conversation) return
      const unsubs = []
      const chatTarget = conversation.target?.('chat')
      if (typeof chatTarget?.subscribe === 'function') {
        unsubs.push(chatTarget.subscribe(() => syncAllFlows(ctx, sessionId, entry, false)))
      }
      if (typeof conversation.snapshot?.subscribe === 'function') {
        unsubs.push(conversation.snapshot.subscribe(() => syncAllFlows(ctx, sessionId, entry, false)))
      }
      if (typeof binding.eventSource?.subscribe === 'function') {
        unsubs.push(binding.eventSource.subscribe(() => {
          const change = binding.eventSource.getSnapshot?.()?.change
          if (change?.kind !== 'append') return
          if (change.entries?.some(({ event }) => event?.type === 'user/message' && event.surfaceOp !== undefined && event.surfaceOp !== 'append')) {
            void entry.refresh()
          }
        }))
      }
      entry.bindingCleanup = () => { for (const unsub of unsubs) unsub() }
    }
    function disposeStore(entry, restoreDom) {
      for (const [flowEl, rec] of entry.flows) {
        if (rec.frame) cancelAnimationFrame(rec.frame)
        rec.observer.disconnect()
        if (restoreDom) {
          for (const child of flowEl.children) {
            if (child.hasAttribute('data-dme-hidden')) child.removeAttribute('data-dme-hidden')
          }
        }
      }
      entry.flows.clear()
      entry.bindingCleanup?.()
      entry.bindingCleanup = null
    }
    function maybeDisposeStore(sessionId, entry) {
      if (entry.listeners.size || entry.flows.size) return
      disposeStore(entry, false)
      if (lists.get(sessionId) === entry) lists.delete(sessionId)
    }
    function editsStore(ctx, sessionId) {
      let entry = lists.get(sessionId)
      if (!entry) {
        entry = { value: EMPTY_STATE, hiddenRetryRpcIds: new Set(), listeners: new Set(), flows: new Map(), generation: 0, bindingCleanup: null }
        entry.refresh = () => {
          const generation = ++entry.generation
          return op({ action: 'list', sessionId }).then(v => {
            if (generation !== entry.generation) return
            entry.value = {
              edited: v.edited ?? {},
              hiddenRanges: Array.isArray(v.hiddenRanges) ? v.hiddenRanges : [],
              hiddenSeqs: Array.isArray(v.hiddenSeqs) ? v.hiddenSeqs : [],
            }
            syncAllFlows(ctx, sessionId, entry, true)
            for (const fn of entry.listeners) fn()
          }).catch(() => {})
        }
        lists.set(sessionId, entry)
        void entry.refresh()
      }
      return entry
    }
    function attachFlow(ctx, sessionId, flowEl) {
      const entry = editsStore(ctx, sessionId)
      ensureBinding(ctx, sessionId, entry)
      let rec = entry.flows.get(flowEl)
      if (!rec) {
        const schedule = () => {
          const { value, hiddenRetryRpcIds } = entry
          if (!rec.hadHidden && value.hiddenRanges.length === 0 && value.hiddenSeqs.length === 0 && hiddenRetryRpcIds.size === 0) return
          if (rec.frame) return
          rec.frame = requestAnimationFrame(() => {
            rec.frame = 0
            syncFlow(ctx, flowEl, rec, sessionId, entry, true)
          })
        }
        const observer = new MutationObserver(schedule)
        rec = { refs: 0, observer, frame: 0, hadHidden: false, lastOrder: null, lastEntries: null, lastValue: null, lastRetrySize: -1 }
        entry.flows.set(flowEl, rec)
        observer.observe(flowEl, { childList: true })
      }
      rec.refs++
      syncFlow(ctx, flowEl, rec, sessionId, entry, true)
      return () => {
        rec.refs--
        if (rec.refs <= 0) {
          if (rec.frame) cancelAnimationFrame(rec.frame)
          rec.observer.disconnect()
          entry.flows.delete(flowEl)
          maybeDisposeStore(sessionId, entry)
        }
      }
    }

    // external: dsh child-slot declarations have a single owner, so mirror conversation.chat.user.before into a private slot
    function mirrorSlot(ctx, source, target) {
      ctx.slots.inject(target, () => {
        let disposers = []
        const sync = () => {
          for (const dispose of disposers) dispose()
          disposers = []
          for (const entry of ctx.slots.entries(source)) {
            disposers.push(ctx.slots.register({
              ...entry,
              ...entry.options,
              name: target,
            }, entry.component))
          }
        }
        const off = ctx.on('slots/changed', name => { if (name === source) sync() })
        sync()
        return () => {
          off()
          for (const dispose of disposers) dispose()
        }
      })
    }

    function Pencil() {
      return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4' }))
    }
    function CloseIcon() {
      return h('svg', { viewBox: '0 0 14 14', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', 'aria-hidden': true },
        h('path', { d: 'M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5' }))
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'uiWorkspace', 'uiConversation'],
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
        ctx.effect(() => () => {
          for (const entry of lists.values()) disposeStore(entry, true)
          lists.clear()
        }, 'message-edit: edit cache')
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())

        function Dialog({ sessionId, rpcId, onClose, onDone }) {
          useLocale()
          const ref = React.useRef(null)
          const backdropPress = React.useRef(false)
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
              if (!v.inContext && v.forkAt !== null && v.forkAt !== undefined) setMode('clear')
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
                const result = await op({ action: 'rewrite', sessionId, rpcId, text, clearLater, autoContinue: clearLater })
                if (alive.current) onDone(text, result)
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
            onPointerDown: e => { backdropPress.current = e.target === ref.current },
            onClick: e => {
              if (backdropPress.current && e.target === ref.current && !busy) onClose()
              backdropPress.current = false
            },
            onKeyDown: e => {
              e.stopPropagation()
              if (!e.nativeEvent.isComposing && e.keyCode !== 229 && e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !busy && info) { e.preventDefault(); void submit() }
            },
          },
          h('div', { className: 'dme-head' }, h('h2', null, t('title')),
            h('button', { type: 'button', className: 'dme-btn dme-icon', onClick: onClose, disabled: busy, 'aria-label': t('close'), title: t('close') }, h(CloseIcon))),
          h('div', { className: 'dme-body' },
            info ? h('textarea', { className: 'dme-text', 'aria-label': t('title'), value: text, autoFocus: true, disabled: busy, onChange: e => { setText(e.target.value); setError('') } })
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
            h('button', { type: 'button', className: 'dme-btn dme-primary', title: '⌘↵ / Ctrl+↵', onClick: submit, disabled: busy || !info || (mode === 'clear' ? !canClear : !canKeep) },
              busy && info ? t('working') : t(mode === 'clear' ? 'submitClear' : clearLater ? 'submitTrim' : 'submitKeep'))))
        }

        function UserMessage({ node, sessionId, loadImage, renderFactorySlot, renderSlotChain }) {
          useLocale()
          const rowRef = React.useRef(null)
          const data = node.data
          const rpcId = data.source?.kind === 'user' ? data.source.rpcId : undefined
          const subscribe = React.useCallback(fn => {
            const store = editsStore(ctx, sessionId)
            store.listeners.add(fn)
            return () => {
              store.listeners.delete(fn)
              maybeDisposeStore(sessionId, store)
            }
          }, [sessionId])
          const edited = React.useSyncExternalStore(subscribe, () => lists.get(sessionId)?.value.edited[rpcId])
          React.useLayoutEffect(() => {
            const seat = rowRef.current?.closest('[data-chat-node-key]')
            const flowEl = rowRef.current?.closest('[data-slot="conversation.chat.flow"]') ?? seat?.parentElement
            if (!flowEl) return
            return attachFlow(ctx, sessionId, flowEl)
          }, [sessionId])
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
          React.useEffect(() => {
            if (!copyError) return
            const timer = setTimeout(() => setCopyError(false), 3500)
            return () => clearTimeout(timer)
          }, [copyError])
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
          return h('div', { ref: rowRef, className: 'dme-row' },
            renderSlotChain('message-edit.user.before', { source: data.source, kind: node.kind }, { fallback: null }),
            renderFactorySlot('conversation.chat.user.content', { content, facts, interactive: true, loadImage }),
            h('div', { className: 'dme-actions' },
              edited ? h('span', { className: 'dme-badge' }, t('edited'), edited.inContext ? '' : ` ${t('compacted')}`) : null,
              h('time', { className: 'dme-time', dateTime: date.toISOString(), title: date.toLocaleString() }, clock),
              h('button', { type: 'button', className: 'dme-action', onClick: copy, title: t(copied ? 'copied' : 'copy'), 'aria-label': t(copied ? 'copied' : 'copy') },
                h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true },
                  copied ? h('path', { d: 'm5 12 4 4L19 6' }) : h(React.Fragment, null, h('rect', { x: 8, y: 8, width: 12, height: 12, rx: 2 }), h('path', { d: 'M16 8V4H4v12h4' })))),
              typeof rpcId === 'string' ? h('button', { type: 'button', className: 'dme-action', title: t('editHint'), 'aria-label': t('editHint'), 'aria-haspopup': 'dialog', onClick: () => setOpen(true) }, h(Pencil)) : null),
            copyError ? h('p', { className: 'dme-error', role: 'alert' }, t('copyFailed')) : null,
            open ? h(Dialog, { key: JSON.stringify([sessionId, rpcId]), sessionId, rpcId, onClose: () => setOpen(false), onDone: (text, result) => {
              const store = lists.get(sessionId)
              if (!store) return
              if (typeof result?.continuationRpcId === 'string') store.hiddenRetryRpcIds.add(result.continuationRpcId)
              const hiddenRanges = result?.cleared && typeof result.originalSeq === 'number' && typeof result.seq === 'number'
                ? [...store.value.hiddenRanges, [result.originalSeq, result.seq]]
                : store.value.hiddenRanges
              store.value = {
                ...store.value,
                edited: { ...store.value.edited, [rpcId]: { text, inContext: true } },
                hiddenRanges,
              }
              syncAllFlows(ctx, sessionId, store, true)
              for (const notify of store.listeners) notify()
              setOpen(false)
              void store.refresh()
            } }) : null)
        }

        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
          name: 'conversation.chat.node', key: 'user', priority: -10,
          children: { 'message-edit.user.before': { kind: 'chain', scope: 'session' } },
        }, UserMessage))
        mirrorSlot(ctx, 'conversation.chat.user.before', 'message-edit.user.before')
      },
    }
  },
})
