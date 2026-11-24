window.__ModuleLoader__.load({
  id: 'dsh-side-chat',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const KIND = 'side-chat'
    const BODY = 'dsh-side-chat/conversation'
    const NS = 'sideChat'

    const EN = {
      title: 'Side Chat', newChat: 'New side chat', ask: 'Ask in Side Chat', main: 'Main conversation',
      question: 'What would you like to ask on the side?', send: 'Start', history: 'Side chats',
      intro: 'Uses the main chat’s preset and workspace. Replies stay here; file changes are shared.',
      back: 'Back to side chats', backShort: 'Back', bring: 'Reference in main draft',
      added: 'Reference added to main draft. Nothing was sent.',
      busyDraft: 'The main draft is busy. Try again once it is editable.', archive: 'Archive side chat',
      missingPreset: 'Could not determine the main chat’s agent preset. No side chat was created.',
      loading: 'Opening conversation…', retry: 'Retry', workspace: 'Waiting for workspace and sessions…',
      empty: 'No side chats yet.', removeQuote: 'Remove selection', untitled: 'Untitled side chat',
      justNow: 'just now', dismiss: 'Dismiss',
      archived: 'Archived “{name}”.', undo: 'Undo', undoFailed: 'Could not restore side chat', restored: 'Side chat restored.',
    }
    const ZH = {
      title: '侧聊', newChat: '新建侧聊', ask: '在侧聊中提问', main: '主聊',
      question: '想单独追问什么？', send: '开始', history: '已有侧聊',
      intro: '沿用主聊的 Agent 预设和工作区。回答留在侧聊，文件改动共享。',
      back: '返回侧聊列表', backShort: '返回', bring: '引用到主聊草稿',
      added: '已插入主聊草稿，未发送。',
      busyDraft: '主聊草稿暂不可编辑，请稍后再试。', archive: '归档侧聊',
      missingPreset: '无法确定主聊当前的 Agent 预设，未创建侧聊。',
      loading: '正在打开会话…', retry: '重试', workspace: '正在等待工作区和会话列表…',
      empty: '还没有侧聊。', removeQuote: '移除选区', untitled: '未命名侧聊',
      justNow: '刚刚', dismiss: '关闭提示',
      archived: '已归档「{name}」。', undo: '撤销', undoFailed: '恢复侧聊失败', restored: '已恢复侧聊。',
    }

    const CSS = `
.sc-anchor{display:inline-flex;min-width:0;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px))}
.sc-trigger{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:100%;margin:0;padding:1px 8px;border:0;border-radius:var(--dsw-radius-sm,8px);
  background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;cursor:pointer}
.sc-trigger svg{flex:none;width:14px;height:14px}
@media (hover:hover){.sc-trigger:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}
.sc-trigger:focus-visible,.sc-selection:focus-visible,.sc-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.sc-selection{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border:0;border-radius:999px;corner-shape:round;
  background:var(--dsw-alias-button-floating-fill,var(--dsw-alias-bg-layer-2));--dsw-elevation-stroke-color:var(--dsw-alias-border-l3);box-shadow:var(--dsw-elevation-panel);
  color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13,13px/18px inherit);white-space:nowrap;cursor:pointer}
.sc-selection svg{flex:none;color:var(--dsw-alias-label-secondary)}
@media (hover:hover){.sc-selection:hover{background:var(--dsw-alias-button-floating-hover,var(--dsw-alias-interactive-bg-hover))}}
.sc-tab-icon{flex:none;color:var(--dsw-alias-label-tertiary)}
.sc-dot{flex:none;width:6px;height:6px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-business-primary);animation:sc-pulse 1.4s ease-in-out infinite}
@keyframes sc-pulse{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.sc-dot{animation:none}}
.sc-count{color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:400;font-variant-numeric:tabular-nums}

.sc-page{container-type:inline-size;box-sizing:border-box;display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;
  background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
:where(.sc-page) *,:where(.sc-page) *::before,:where(.sc-page) *::after{box-sizing:border-box}
:where(.sc-page) :is(h3,p,ul,blockquote){margin:0;padding:0}
.sc-page ul{list-style:none}
.sc-ellipsis{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}

.sc-bar{flex:none;display:flex;align-items:center;gap:6px;height:38px;padding:0 8px 0 6px;border-bottom:.5px solid var(--dsw-alias-border-l3);min-width:0}
.sc-bar-title{flex:1;display:flex;align-items:center;gap:6px;min-width:0;font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary)}
.sc-bar-actions{flex:none;display:flex;align-items:center;gap:4px}

.sc-btn,.sc-icon-btn{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:26px;padding:0 9px;border:0;border-radius:var(--dsw-radius-sm,8px);
  background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;white-space:nowrap;cursor:pointer}
.sc-btn svg,.sc-icon-btn svg{flex:none}
.sc-btn[data-variant=outline]{box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.sc-btn[data-variant=primary]{height:28px;padding:0 12px;border-radius:999px;corner-shape:round;background:var(--dsw-alias-button-primary-fill);
  color:var(--dsw-alias-label-primary-foreground);font-weight:500}
.sc-icon-btn{width:26px;padding:0;color:var(--dsw-alias-label-tertiary)}
@media (hover:hover){
  .sc-btn:hover:not(:disabled),.sc-icon-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
  .sc-btn[data-variant=primary]:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover);color:var(--dsw-alias-label-primary-foreground)}
  .sc-icon-btn[data-danger]:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}
}
.sc-btn:disabled,.sc-icon-btn:disabled{opacity:.4;cursor:default}

.sc-notice{flex:none;display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:.5px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.sc-notice[data-tone=info]{color:var(--dsw-alias-state-success-primary)}
.sc-notice[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.sc-notice>span{flex:1;min-width:0;overflow-wrap:anywhere}

.sc-body{min-height:0;flex:1;display:flex;flex-direction:column;overflow:hidden}
.sc-body>*{min-height:0;flex:1}
.sc-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:32px 20px;text-align:center;
  color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.sc-state-error{color:var(--dsw-alias-state-error-primary);max-width:340px;overflow-wrap:anywhere}

.sc-list{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px 20px 24px;display:flex;flex-direction:column;gap:22px}
.sc-section{display:flex;flex-direction:column;gap:8px;min-width:0}
.sc-heading{display:flex;align-items:center;gap:6px;font-size:13px;line-height:20px;font-weight:500;color:var(--dsw-alias-label-primary)}
.sc-intro{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}

.sc-compose{display:flex;flex-direction:column;border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-border-l2);
  background:var(--dsw-alias-bg-layer-1);transition:border-color .12s}
.sc-compose:focus-within{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.sc-quote{position:relative;display:flex;align-items:flex-start;gap:6px;margin:10px 10px 0;padding:7px 8px 7px 12px;
  border-radius:var(--dsw-radius-sm,8px);background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.sc-quote::before{content:'';position:absolute;left:4px;top:7px;bottom:7px;width:2.5px;border-radius:2px;background:var(--dsw-alias-brand-primary);opacity:.75}
.sc-quote-text{flex:1;min-width:0;max-height:7.5em;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}
.sc-compose textarea{display:block;width:100%;min-height:84px;max-height:220px;resize:vertical;padding:10px 12px 6px;border:0;outline:0;
  background:transparent;color:var(--dsw-alias-label-primary);font:inherit;line-height:20px}
.sc-compose textarea:focus-visible{outline:none}
.sc-compose textarea::placeholder{color:var(--dsw-alias-label-tertiary)}
.sc-compose-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px 8px 12px}
.sc-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}

.sc-rows{display:flex;flex-direction:column;gap:2px}
.sc-row{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:6px 8px;border:0;border-radius:var(--dsw-radius-sm,8px);
  background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
.sc-row-icon{flex:none;color:var(--dsw-alias-label-tertiary)}
.sc-row-title{flex:1;font-size:13px;font-weight:500;line-height:20px}
.sc-row-time{flex:none;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;white-space:nowrap}
.sc-row-chev{flex:none;color:var(--dsw-alias-label-tertiary);opacity:.7}
@media (hover:hover){.sc-row:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.sc-row:disabled{opacity:.45;cursor:default}

.sc-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:24px 16px;border-radius:var(--dsw-radius-md,12px);
  border:.5px dashed var(--dsw-alias-border-l2);text-align:center;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}

@container (max-width:340px){
  .sc-list{padding:14px 14px 20px}
  .sc-bring-text,.sc-hint{display:none}
}
`

    const svg = (size, children, extra) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...extra,
    }, ...children)

    const SideChatIcon = ({ size = 14, className }) => svg(size, [
      h('path', { key: 'a', d: 'M9.5 7V3.25A1.25 1.25 0 0 0 8.25 2h-5A1.25 1.25 0 0 0 2 3.25v6.5L4.4 8h2.6' }),
      h('path', { key: 'b', d: 'M7.25 6.5h5.5A1.25 1.25 0 0 1 14 7.75v6.25L11.6 12H7.25A1.25 1.25 0 0 1 6 10.75v-3A1.25 1.25 0 0 1 7.25 6.5Z' }),
    ], { className })
    const BackIcon = () => svg(14, [h('path', { key: 'p', d: 'M10 3.5 5.5 8 10 12.5' })])
    const ChevronIcon = ({ className }) => svg(12, [h('path', { key: 'p', d: 'M6 3.5 10.5 8 6 12.5' })], { className })
    const CloseIcon = () => svg(12, [h('path', { key: 'p', d: 'M4 4l8 8M12 4l-8 8' })])
    const MentionIcon = () => svg(14, [
      h('path', { key: 'a', d: 'M6.5 9.5 3.25 6.25 6.5 3' }),
      h('path', { key: 'b', d: 'M3.5 6.25H10a3 3 0 0 1 0 6H8' }),
    ])
    const ArchiveIcon = () => svg(14, [
      h('rect', { key: 'a', x: 2, y: 2.5, width: 12, height: 3, rx: 1 }),
      h('path', { key: 'b', d: 'M3.25 5.5v6.75a1.25 1.25 0 0 0 1.25 1.25h7a1.25 1.25 0 0 0 1.25-1.25V5.5' }),
      h('path', { key: 'c', d: 'M6.5 8.5h3' }),
    ])

    const encodeId = id => btoa(Array.from(new TextEncoder().encode(JSON.stringify(id)), byte => String.fromCharCode(byte)).join(''))
      .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
    const prefix = parent => `sc.${encodeId(parent)}.`
    const isSide = id => id.startsWith('sc.')
    const nonce = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')
    const mention = (id, label) => `@[${label.replace(/[\\\]]/g, '\\$&')}](dsh-session:${encodeId(id)})`
    const buildPrompt = (parentId, mainLabel, quote, question) => [
      mention(parentId, mainLabel),
      quote && quote.split('\n').map(line => `> ${line}`).join('\n'),
      question.trim(),
    ].filter(Boolean).join('\n\n')
    const listSideChats = (ids, byId, archived, parentId) => {
      const scope = prefix(parentId)
      const hidden = new Set(archived)
      return ids
        .filter(item => item.startsWith(scope) && !hidden.has(item) && !byId[item].blank)
        .toSorted((a, b) => (byId[b].updatedAt ?? 0) - (byId[a].updatedAt ?? 0))
    }
    const fixedView = props => props.renderSlot('conversation.session', { view: 'chat' })
    const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)

    return {
      inject: ['slots', 'locale', 'sessions', 'uiConversation', 'sidebarRight', 'sidebarRightTabs', 'workspaces'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'side-chat: locale')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-side-chat'
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, 'side-chat: styles')

        const translate = ctx.locale.bind(NS)
        const canOpen = id => !isSide(id) && !ctx.sessions.subagentAddress(id)
        const open = params => ctx.sidebarRight.openTab(KIND, { params })
        const formatAgo = (timestamp, t) => {
          if (!timestamp) return ''
          const seconds = Math.round((timestamp - Date.now()) / 1000)
          if (Math.abs(seconds) < 45) return t('justNow')
          const active = ctx.locale.getSnapshot()?.active
          const lang = active === 'zh' ? 'zh-CN' : active || undefined
          const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: 'narrow' })
          for (const [unit, size] of [['day', 86400], ['hour', 3600], ['minute', 60]]) {
            if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
          }
          return rtf.format(seconds, 'second')
        }

        function Trigger({ sessionId, useSessions, useWorkspaces, t }) {
          const ids = useSessions(s => s.ids)
          const byId = useSessions(s => s.byId)
          const archived = useWorkspaces(s => s.archivedSessionIds)
          if (!canOpen(sessionId)) return null
          const chats = listSideChats(ids, byId, archived, sessionId)
          const running = chats.some(item => byId[item].running)
          return h('span', { className: 'sc-anchor', 'data-side-chat': '' },
            h('button', { type: 'button', className: 'sc-trigger', onClick: () => open({}) },
              h(SideChatIcon, { size: 14 }),
              h('span', null, t('title')),
              chats.length > 0 && h('span', { className: 'sc-count' }, chats.length),
              running && h('span', { className: 'sc-dot', 'aria-hidden': true })))
        }

        function TabTitle({ t }) {
          return h(React.Fragment, null, h(SideChatIcon, { size: 15, className: 'sc-tab-icon' }), t('title'))
        }

        function Selection({ readText, clearSelection, dismiss, t }) {
          return h('button', {
            type: 'button', className: 'sc-selection',
            onPointerDown: event => event.preventDefault(),
            onClick: () => {
              const quote = readText()
              if (quote) { open({ quote }); clearSelection() }
              dismiss()
            },
          }, h(SideChatIcon, { size: 14 }), t('ask'))
        }

        function Conversation({ renderFactorySlot }) {
          return renderFactorySlot('conversation.content', { variant: 'embedded', phase: 'active', hero: false }, { slots: { views: fixedView } })
        }

        function Thread({ id, SessionProvider, renderSlot, t }) {
          const [reference, setReference] = React.useState(null)
          const [error, setError] = React.useState('')
          const [attempt, retry] = React.useReducer(value => value + 1, 0)
          React.useEffect(() => {
            let active = true
            let acquired
            const controller = new AbortController()
            setReference(null)
            setError('')
            async function attach() {
              acquired = ctx.sessions.retain(id, { source: KIND, facets: { conversation: true }, signal: controller.signal })
              await acquired.ready
              if (active) setReference(acquired)
            }
            attach().catch(cause => {
              acquired?.release()
              acquired = undefined
              if (active) setError(cause.message)
            })
            return () => { active = false; controller.abort(); acquired?.release() }
          }, [id, attempt])
          if (error) {
            return h('div', { className: 'sc-state', role: 'alert' },
              h('p', { className: 'sc-state-error' }, error),
              h('button', { type: 'button', className: 'sc-btn', 'data-variant': 'outline', onClick: retry }, t('retry')))
          }
          if (!reference) return h('div', { className: 'sc-state', role: 'status' }, t('loading'))
          return h(SessionProvider, { session: reference }, renderSlot(BODY, {}))
        }

        function Panel(props) {
          const { tab } = props.useTabInfo()
          return h(Desk, {
            ...props,
            key: props.sessionId,
            revision: tab.navigation.revision,
            navQuote: tab.navigation.params?.quote ?? '',
          })
        }

        function Desk({ sessionId, revision, navQuote, useSessions, useWorkspaces, useProjection, inputActions, SessionProvider, renderSlot, t }) {
          const byId = useSessions(s => s.byId)
          const ids = useSessions(s => s.ids)
          const preset = useProjection('agentPreset')
          const listed = useSessions(s => s.phase === 'ready')
          const workspaces = useWorkspaces(s => s.items)
          const located = useWorkspaces(s => s.phase === 'ready')
          const archived = useWorkspaces(s => s.archivedSessionIds)
          const [id, setId] = React.useState(null)
          const [quote, setQuote] = React.useState(navQuote)
          const [question, setQuestion] = React.useState('')
          const [busy, setBusy] = React.useState(false)
          const [notice, setNotice] = React.useState(null)
          const pending = React.useRef(null)
          const lastRevision = React.useRef(revision)
          const inputRef = React.useRef(null)

          React.useEffect(() => {
            if (revision !== lastRevision.current) {
              lastRevision.current = revision
              if (!navQuote) return
              setQuote(navQuote)
              setId(null)
              setNotice(null)
            } else if (!navQuote) {
              return
            }
            requestAnimationFrame(() => inputRef.current?.focus())
          }, [revision, navQuote])

          React.useEffect(() => {
            if (notice?.tone !== 'info') return undefined
            const timer = setTimeout(() => setNotice(null), 2600)
            return () => clearTimeout(timer)
          }, [notice])

          const scope = prefix(sessionId)
          const chats = listSideChats(ids, byId, archived, sessionId)
          const label = child => byId[child]?.title || t('untitled')
          const show = child => { setId(child); setNotice(null) }
          const ready = listed && located
          const active = id ? byId[id] : undefined

          async function start(event) {
            event?.preventDefault()
            const trimmed = question.trim()
            if (busy || !ready || !trimmed) return
            setBusy(true); setNotice(null)
            try {
              const parentWorkspace = workspaces.find(item => item.sessionIds.includes(sessionId))
              if (!pending.current) {
                if (!preset) throw new Error(t('missingPreset'))
                pending.current = await ctx.sessions.create({
                  sessionId: scope + nonce(),
                  agentPreset: preset,
                  ...(parentWorkspace ? { workspaceId: parentWorkspace.workspaceId } : byId[sessionId]?.cwd ? { cwd: byId[sessionId].cwd } : {}),
                })
              }
              const child = pending.current
              const prompt = buildPrompt(sessionId, t('main'), quote, trimmed)
              await ctx.sessions.using(child, { source: KIND }, async ref => {
                const result = await ref.binding.session.prompt([{ type: 'text', text: prompt }], 'queue')
                if (!result.ok) throw new Error(result.error.message)
              })
              pending.current = null
              setQuote(''); setQuestion(''); show(child)
            } catch (cause) { setNotice({ tone: 'error', text: cause.message }) }
            finally { setBusy(false) }
          }

          function onKeyDown(event) {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              void start()
            }
          }

          function bring() {
            const span = inputActions.captureInsertion()
            const lead = span.end > 0 ? ' ' : ''
            const added = inputActions.insertText(`${lead}${mention(id, label(id))} `, { ...span, start: span.end })
            setNotice({ tone: added ? 'info' : 'error', text: t(added ? 'added' : 'busyDraft') })
          }

          async function archive() {
            const targetId = id
            const targetName = label(targetId)
            setBusy(true); setNotice(null)
            try {
              await ctx.workspaces.archiveSession(targetId)
              show(null)
              const menus = ctx.get?.('contextMenus')
              const toastText = t('archived').replace('{name}', targetName)
              if (menus?.notify && typeof ctx.workspaces.unarchiveSession === 'function') {
                menus.notify(toastText, true, {
                  label: t('undo'),
                  failureLabel: t('undoFailed'),
                  run: async () => {
                    await ctx.workspaces.unarchiveSession(targetId)
                    show(targetId)
                  },
                })
              } else {
                setNotice({ tone: 'info', text: toastText, undoId: targetId })
              }
            }
            catch (cause) { setNotice({ tone: 'error', text: cause.message }) }
            finally { setBusy(false) }
          }

          async function restoreArchived(targetId) {
            if (typeof ctx.workspaces.unarchiveSession !== 'function') return
            setBusy(true)
            try {
              await ctx.workspaces.unarchiveSession(targetId)
              setNotice({ tone: 'info', text: t('restored') })
              show(targetId)
            } catch (cause) {
              setNotice({ tone: 'error', text: cause.message })
            } finally {
              setBusy(false)
            }
          }

          const noticeBar = notice && h('div', {
            className: 'sc-notice', 'data-tone': notice.tone, role: notice.tone === 'error' ? 'alert' : 'status',
          },
          h('span', null, notice.text),
          notice.undoId && h('button', {
            type: 'button', className: 'sc-btn', disabled: busy, onClick: () => restoreArchived(notice.undoId),
          }, t('undo')),
          notice.tone === 'error' && h('button', {
            type: 'button', className: 'sc-icon-btn', 'aria-label': t('dismiss'), onClick: () => setNotice(null),
          }, h(CloseIcon)))

          return h('section', { className: 'sc-page', 'aria-label': t('title') },
            id && h('div', { className: 'sc-bar' },
              h('button', {
                type: 'button', className: 'sc-btn', disabled: busy, 'aria-label': t('back'), title: t('back'),
                onClick: () => show(null),
              }, h(BackIcon), h('span', null, t('backShort'))),
              h('div', { className: 'sc-bar-title', title: label(id) },
                active?.running && h('span', { className: 'sc-dot', 'aria-hidden': true }),
                h('span', { className: 'sc-ellipsis' }, label(id))),
              h('div', { className: 'sc-bar-actions' },
                h('button', {
                  type: 'button', className: 'sc-btn', 'data-variant': 'outline', disabled: busy, title: t('bring'), onClick: bring,
                }, h(MentionIcon), h('span', { className: 'sc-bring-text' }, t('bring'))),
                h('button', {
                  type: 'button', className: 'sc-icon-btn', 'data-danger': '', disabled: busy || active?.running,
                  'aria-label': t('archive'), title: t('archive'), onClick: archive,
                }, h(ArchiveIcon)))),
            noticeBar,
            id ? h('div', { className: 'sc-body' }, h(Thread, { key: id, id, SessionProvider, renderSlot, t }))
              : h('div', { className: 'sc-list' },
                h('div', { className: 'sc-section' },
                  h('h3', { className: 'sc-heading' }, t('newChat')),
                  h('p', { className: 'sc-intro' }, t('intro')),
                  h('form', { className: 'sc-compose', onSubmit: start },
                    quote && h('div', { className: 'sc-quote' },
                      h('blockquote', { className: 'sc-quote-text' }, quote),
                      h('button', {
                        type: 'button', className: 'sc-icon-btn', disabled: busy, 'aria-label': t('removeQuote'),
                        title: t('removeQuote'), onClick: () => setQuote(''),
                      }, h(CloseIcon))),
                    h('textarea', {
                      ref: inputRef, 'aria-label': t('question'), placeholder: t('question'),
                      value: question, disabled: busy, onKeyDown,
                      onChange: event => setQuestion(event.target.value),
                    }),
                    h('div', { className: 'sc-compose-foot' },
                      h('span', { className: 'sc-hint' }, isMac ? '⌘↵' : 'Ctrl+↵'),
                      h('button', {
                        type: 'submit', className: 'sc-btn', 'data-variant': 'primary',
                        disabled: busy || !ready || !question.trim(),
                      }, t('send'))))),
                h('div', { className: 'sc-section' },
                  h('h3', { className: 'sc-heading' },
                    t('history'),
                    chats.length > 0 && h('span', { className: 'sc-count' }, chats.length)),
                  chats.length
                    ? h('ul', { className: 'sc-rows' }, chats.map(child => {
                      const row = byId[child]
                      const time = formatAgo(row.updatedAt, t)
                      return h('li', { key: child },
                        h('button', { type: 'button', className: 'sc-row', disabled: busy, onClick: () => show(child) },
                          row.running ? h('span', { className: 'sc-dot', 'aria-hidden': true }) : h(SideChatIcon, { size: 14, className: 'sc-row-icon' }),
                          h('span', { className: 'sc-row-title sc-ellipsis' }, label(child)),
                          time && h('span', { className: 'sc-row-time' }, time),
                          h(ChevronIcon, { className: 'sc-row-chev' })))
                    }))
                    : h('div', { className: 'sc-empty' }, h(SideChatIcon, { size: 20 }), h('p', null, t(ready ? 'empty' : 'workspace'))))))
        }

        ctx.inject(['commandUi'], scope => scope.effect(() => scope.commandUi.register({
          name: 'side', label: () => translate('title'), description: () => translate('ask'),
          available: session => canOpen(session.sessionId),
          ui: { kind: 'action', run: () => open({}) },
        })))
        ctx.effect(() => ctx.sidebarRightTabs.register({ id: KIND, kind: KIND, keepMounted: true, title: () => translate('title') }))
        ctx.effect(() => ctx.uiConversation.interactions.register({
          id: KIND,
          onInteraction(request) {
            if (request.trigger !== 'contextmenu' || !request.hasSelection || !canOpen(request.sessionId) || !request.readText()) return
            request.preventDefault()
            request.open()
          },
        }))
        ctx.slots.inject('conversation.chat.text-interaction', () => ctx.slots.register({ name: 'conversation.chat.text-interaction', key: KIND, locale: NS }, Selection))
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({ name: 'conversation.composer.dock', id: KIND, order: 10, locale: NS }, Trigger))
        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: KIND, locale: NS, children: { [BODY]: { kind: 'single', scope: 'session' } } }, Panel))
        ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: KIND, locale: NS }, TabTitle))
        ctx.slots.inject(BODY, () => ctx.slots.register({ name: BODY }, Conversation))
      },
      _internal: { encodeId, prefix, isSide, mention, buildPrompt, listSideChats },
    }
  },
})
