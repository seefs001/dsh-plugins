/** Browser-only companion. Artwork is remotely referenced, not MIT-licensed package content. */
window.__ModuleLoader__.load({
  id: 'dsh-ai-mascot',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'ai-mascot'
    const SOURCE = 'https://selinlee.github.io/ai-moe-atlas/zh/chibi/'
    const ART = {
      gpt: 'https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/openai/preview.webp',
      claude: 'https://selinlee.github.io/ai-moe-atlas/generated/super-chibi-v1/claude/preview.webp',
    }
    const SIGNS = { idle: '·', thinking: '···', replying: '✎', reading: '▤', searching: '⌕', writing: '</>', terminal: '>_', delegating: '⋈', waiting: '?', done: '✦', error: '!' }
    const DICTS = {
      zh: {
        label: 'AI 吉祥物',
        gpt_thinking: '理理思路…', gpt_replying: '把思路写下来', gpt_reading: '翻翻资料',
        gpt_searching: '找找线索', gpt_writing: '敲几行代码', gpt_terminal: '跑一下命令',
        gpt_delegating: '和小伙伴对一下', gpt_waiting: '到你啦', gpt_done: '这一轮搞定', gpt_error: '卡住了，看看对话',
        claude_thinking: '想一想…', claude_replying: '写给你看', claude_reading: '读一读资料',
        claude_searching: '去找点线索', claude_writing: '把代码写好', claude_terminal: '看看命令怎么说',
        claude_delegating: '找小伙伴商量', claude_waiting: '这里需要你', claude_done: '这一轮好啦', claude_error: '遇到问题了，看看对话',
        settings: '吉祥物设置', close: '关闭设置', collapse: '收起吉祥物', expand: '展开吉祥物', motion: '播放动作',
        small: '小', normal: '标准', size: '大小', source: '角色来源与署名',
        credit: 'ZipZipPipe 原设 · AI Moe Atlas Q 版参考，非官方。仅非商业参考使用，素材不属于插件 MIT 授权。',
        unavailable: '角色图片暂时没加载出来', move: '拖动移动，方向键微调位置',
      },
      en: {
        label: 'AI Mascot',
        gpt_thinking: 'Thinking it through…', gpt_replying: 'Putting it into words', gpt_reading: 'Checking the references',
        gpt_searching: 'Looking for clues', gpt_writing: 'Typing some code', gpt_terminal: 'Running a command',
        gpt_delegating: 'Checking with the team', gpt_waiting: 'Your turn', gpt_done: 'This round is done', gpt_error: 'Hit a snag. Check the chat.',
        claude_thinking: 'Let me think…', claude_replying: 'Writing it out for you', claude_reading: 'Reading through',
        claude_searching: 'Looking around', claude_writing: 'Working on the code', claude_terminal: 'Checking the terminal',
        claude_delegating: 'Asking a friend', claude_waiting: 'Over to you', claude_done: 'All done for this round', claude_error: 'Something went wrong. See the chat.',
        settings: 'Mascot settings', close: 'Close settings', collapse: 'Collapse mascot', expand: 'Expand mascot', motion: 'Animate',
        small: 'Small', normal: 'Normal', size: 'Size', source: 'Artwork & attribution',
        credit: 'Original design: ZipZipPipe. Q-version reference: AI Moe Atlas. Unofficial, non-commercial reference use only. Artwork is not covered by this plugin’s MIT license.',
        unavailable: 'The character image could not be loaded', move: 'Drag to move; arrow keys to adjust',
      },
    }

    function characterFor(selection) {
      const model = selection?.model?.toLowerCase() ?? ''
      if (/claude/.test(model)) return 'claude'
      if (/(?:^|[\s/_-])(?:gpt|chatgpt|codex|o[134])(?:$|[\s._/-])/.test(model)) return 'gpt'
      return null
    }

    function classifyTool(name) {
      const leaf = name.split(/\.|__|\//).at(-1).toLowerCase()
      if (/^(read|read_image|read_file|readfile|skill|web_fetch|fetch|open|list|ls)$/.test(leaf)) return 'reading'
      if (/(search|grep|glob|recall)/.test(leaf)) return 'searching'
      if (/^(write|edit|apply_patch|str_replace|str_replace_editor|write_file|notebook_edit)$/.test(leaf)) return 'writing'
      if (/^(bash|pwsh|shell|exec|execute|terminal|job_output|job_list|job_kill)$/.test(leaf)) return 'terminal'
      if (/(subagent|teammate|send_message|workflow|wait_agent)/.test(leaf)) return 'delegating'
      if (/^(ask_user_question|ask_user)$/.test(leaf)) return 'waiting'
      return 'thinking'
    }

    function liveActivity(chat) {
      const legacy = chat?.legacy
      let latest
      function visit(calls) {
        for (const call of calls ?? []) {
          if (call.phase !== 'start' && call.phase !== 'preparing') continue
          if (!latest || call.time >= latest.time) latest = call
          visit(call.subCalls)
        }
      }
      visit(legacy?.runningCalls)
      if (latest) return latest.phase === 'preparing' ? 'thinking' : classifyTool(latest.name)
      const last = legacy?.partial?.blocks.at(-1)
      return last?.kind === 'text' && last.text ? 'replying' : 'thinking'
    }

    function endedWithReply(chat) {
      const last = chat?.legacy?.nodes.at(-1)
      return last?.kind === 'assistant' && !last.interrupted && last.blocks.some(block => block.kind === 'text' && block.text.trim())
    }

    /** One current observer owns publication; old observer cleanup cannot clear a new session. */
    function createBridge() {
      let owner
      let facts
      let snapshot = null
      let timer
      const listeners = new Set()
      function set(next) {
        if (JSON.stringify(snapshot) === JSON.stringify(next)) return
        snapshot = next
        for (const listener of listeners) listener()
      }
      function cancelTimer() { clearTimeout(timer); timer = undefined }
      return {
        getSnapshot: () => snapshot,
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
        publish(token, next) {
          const justFinished = owner === token && facts?.running && !next.running && next.success && !next.error && !next.waiting
          const stillDone = owner === token && snapshot?.activity === 'done' && !next.running && !next.error && !next.waiting
          owner = token
          facts = next
          cancelTimer()
          const activity = next.waiting ? 'waiting'
            : next.running ? next.activity
              : next.error ? 'error'
                : justFinished || stillDone ? 'done' : 'idle'
          set({ sessionId: next.sessionId, character: next.character, activity })
          if (activity === 'done') {
            const completed = snapshot
            timer = setTimeout(() => {
              if (owner === token && snapshot === completed) set({ ...completed, activity: 'idle' })
            }, 2400)
          }
        },
        release(token) {
          if (owner !== token) return
          cancelTimer()
          owner = undefined
          facts = undefined
          set(null)
        },
        dispose() { cancelTimer(); listeners.clear(); snapshot = null; facts = undefined; owner = undefined },
      }
    }

    const CSS = `
.dsh-mascot{position:fixed;right:var(--mascot-right);bottom:max(22px,env(safe-area-inset-bottom));width:156px;z-index:20;pointer-events:none;font-family:inherit;color:var(--dsw-alias-label-primary,#302b39);--mascot-accent:#9580be;--mascot-scale:1;--mascot-right:max(20px,env(safe-area-inset-right))}
.dsh-mascot[data-compact=true][data-size]{width:40px}
.dsh-mascot[data-dragging=true] .dsh-mascot-stage,.dsh-mascot[data-dragging=true] .dsh-mascot-mini{cursor:grabbing}
.dsh-mascot-stage,.dsh-mascot .dsh-mascot-mini{touch-action:none;user-select:none;cursor:grab}
.dsh-mascot-stage:focus-visible{outline:2px solid var(--mascot-accent);outline-offset:3px;border-radius:8px}
.dsh-mascot[data-character=claude]{--mascot-accent:#ca7853}
.dsh-mascot[data-size=small]{--mascot-scale:.78;width:130px}
.dsh-mascot button,.dsh-mascot a,.dsh-mascot input{font:inherit}
.dsh-mascot button{cursor:pointer}
.dsh-mascot button:focus-visible,.dsh-mascot a:focus-visible,.dsh-mascot input:focus-visible{outline:2px solid var(--mascot-accent);outline-offset:3px}
.dsh-mascot-bubble{margin:0 auto 10px;padding:8px 12px;border:1px solid color-mix(in srgb,var(--mascot-accent) 24%,transparent);border-radius:14px 14px 3px 14px;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 3px 15px #00000009;font-size:12px;line-height:1.4;text-align:center;width:fit-content;max-width:156px;position:relative}
.dsh-mascot-stage{position:relative;height:calc(168px * var(--mascot-scale));display:flex;justify-content:center;align-items:flex-end;pointer-events:auto}
.dsh-mascot-sticker{position:relative;width:136px;height:168px;flex:none;transform:scale(var(--mascot-scale));transform-origin:bottom center}
.dsh-mascot-portrait{position:absolute;inset:0;transform-origin:50% 90%}
.dsh-mascot-portrait img{position:absolute;width:136px!important;max-width:none!important;height:168px!important;inset:0;user-select:none;pointer-events:none}
.dsh-mascot-sign{position:absolute;right:-4px;top:12px;display:grid;place-items:center;min-width:30px;height:30px;padding:0 5px;border-radius:10px;background:var(--mascot-accent);color:white;box-shadow:0 3px 9px #0002;font:600 15px ui-monospace,monospace;transform:rotate(9deg)}
.dsh-mascot-prop{position:absolute;left:20px;right:20px;bottom:27px;height:34px;border:2px solid #fff8;border-radius:5px;background:#413b50;color:#e7e1f3;text-align:left;padding:5px 8px;font:12px ui-monospace,monospace;box-shadow:0 5px 12px #0003;transform:rotate(-3deg)}
.dsh-mascot-prop::after{content:'_';animation:dsh-mascot-blink 1.4s steps(2,end) infinite}
.dsh-mascot[data-activity=reading] .dsh-mascot-prop{background:#f4ebd5;color:#947954;height:40px;border-color:#fff;transform:perspective(100px) rotateX(12deg);box-shadow:inset 44px 0 #f8f2e6,0 5px 12px #0002}
.dsh-mascot[data-activity=reading] .dsh-mascot-prop::after{content:'≡  │  ≡';animation:none}
.dsh-mascot[data-activity=replying] .dsh-mascot-prop{left:30px;right:30px;background:#faf4e9;color:#947954;border-color:#fff;transform:rotate(-6deg);box-shadow:0 4px 10px #0002}
.dsh-mascot[data-activity=replying] .dsh-mascot-prop::before{content:'';position:absolute;inset:10px 24px 9px 10px;background:repeating-linear-gradient(to bottom,#b9a48566 0 1px,transparent 1px 7px)}
.dsh-mascot[data-activity=replying] .dsh-mascot-prop::after{content:'✎';position:absolute;right:7px;top:5px;font-size:23px;animation:dsh-mascot-pencil 1.8s ease-in-out infinite}
.dsh-mascot[data-activity=terminal] .dsh-mascot-prop{background:#243831;color:#b7e4c3;border-color:#b7e4c355}
.dsh-mascot[data-activity=searching] .dsh-mascot-sign{font-size:32px}
.dsh-mascot[data-activity=waiting] .dsh-mascot-sign{background:#b48235}
.dsh-mascot[data-activity=error] .dsh-mascot-sign{background:#bd5a62}
.dsh-mascot-controls{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:8px;pointer-events:auto}
.dsh-mascot-control{display:grid;place-items:center;width:24px;height:24px;border:1px solid #8882;border-radius:50%;color:inherit;background:var(--dsw-alias-bg-layer-1,#fff);font-size:13px;opacity:.65}
.dsh-mascot-control:hover{opacity:1}
.dsh-mascot-panel{pointer-events:auto;position:absolute;bottom:34px;right:min(0px,calc(100vw - var(--mascot-right) - min(280px,100vw - 16px) - 8px));box-sizing:border-box;width:min(280px,calc(100vw - 16px));max-height:calc(100vh - var(--mascot-bottom,max(22px,env(safe-area-inset-bottom))) - 42px);overflow-y:auto;padding:14px;border:1px solid #8883;border-radius:14px;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 8px 30px #0002;font-size:12px}
.dsh-mascot-panel header{display:flex;justify-content:space-between;align-items:center;font-weight:600;margin-bottom:12px}
.dsh-mascot-panel label{display:flex;align-items:center;gap:8px;margin:10px 0}
.dsh-mascot-sizes{display:flex;align-items:center;gap:8px}
.dsh-mascot-sizes button{border:1px solid #8883;border-radius:7px;padding:4px 9px;background:transparent;color:inherit}
.dsh-mascot-sizes button[aria-pressed=true]{background:var(--mascot-accent);color:#fff}
.dsh-mascot-panel p{opacity:.65;font-size:10px;line-height:1.6;margin:12px 0 5px}
.dsh-mascot-panel a{color:var(--mascot-accent);font-size:11px}
.dsh-mascot-mini{pointer-events:auto;margin-left:auto;width:40px;height:40px;border:1px solid #8883;border-radius:50%;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--mascot-accent);box-shadow:0 3px 12px #0001;font:600 14px ui-monospace,monospace}
.dsh-mascot-fallback{position:absolute;inset:0;display:grid;place-items:center;background:#f5f2fa;color:#6e5b8d;font-size:14px}
.dsh-mascot[data-motion=on] .dsh-mascot-portrait{animation:dsh-mascot-breathe 4s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=thinking] .dsh-mascot-portrait{animation:dsh-mascot-think 3.2s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=thinking] .dsh-mascot-sign{animation:dsh-mascot-dots 2s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=reading] .dsh-mascot-portrait{animation:dsh-mascot-nod 2.8s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=searching] .dsh-mascot-portrait{animation:dsh-mascot-look 2.8s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=searching] .dsh-mascot-sign{animation:dsh-mascot-scan 2.8s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=writing] .dsh-mascot-portrait{animation:dsh-mascot-type .9s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=replying] .dsh-mascot-portrait{animation:dsh-mascot-reply 2.4s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=terminal] .dsh-mascot-portrait{animation:dsh-mascot-console 3.8s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=delegating] .dsh-mascot-portrait{animation:dsh-mascot-collaborate 2.6s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=delegating] .dsh-mascot-sign{animation:dsh-mascot-connect 2.6s ease-in-out infinite}
.dsh-mascot[data-motion=on][data-activity=waiting] .dsh-mascot-portrait{animation-duration:5s}
.dsh-mascot[data-motion=on][data-activity=done] .dsh-mascot-portrait{animation:dsh-mascot-hop .8s ease-out 1}
.dsh-mascot[data-motion=on][data-activity=done] .dsh-mascot-sign{animation:dsh-mascot-spark .8s ease-out 1}
.dsh-mascot[data-motion=on][data-activity=error] .dsh-mascot-portrait{animation:dsh-mascot-shake .28s ease-in-out 2}
.dsh-mascot[data-motion=off] *,.dsh-mascot[data-motion=off] *::before,.dsh-mascot[data-motion=off] *::after{animation:none!important}
@keyframes dsh-mascot-breathe{50%{transform:translateY(-1.5px)}}
@keyframes dsh-mascot-think{50%{transform:rotate(-2.5deg) translateY(-1px)}}
@keyframes dsh-mascot-dots{50%{opacity:.5}}
@keyframes dsh-mascot-nod{50%{transform:rotate(1.5deg) translateY(2px)}}
@keyframes dsh-mascot-look{25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}
@keyframes dsh-mascot-scan{0%,100%{transform:rotate(9deg) translateX(-3px)}50%{transform:rotate(9deg) translateX(3px)}}
@keyframes dsh-mascot-type{25%{transform:translateY(1.5px) rotate(-.6deg)}75%{transform:translateY(.5px) rotate(.6deg)}}
@keyframes dsh-mascot-reply{50%{transform:rotate(1deg) translateY(-1px)}}
@keyframes dsh-mascot-pencil{25%{transform:translate(-2px,2px) rotate(-8deg)}75%{transform:translate(1px,0) rotate(3deg)}}
@keyframes dsh-mascot-console{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(-2deg) translateY(-1px)}}
@keyframes dsh-mascot-collaborate{35%{transform:rotate(2deg) translateY(-1px)}70%{transform:rotate(-1deg)}}
@keyframes dsh-mascot-connect{50%{transform:rotate(9deg) scale(1.08)}}
@keyframes dsh-mascot-hop{35%{transform:translateY(-7px) rotate(-2deg)}70%{transform:translateY(0) rotate(1deg)}}
@keyframes dsh-mascot-spark{40%{transform:rotate(15deg) scale(1.18)}}
@keyframes dsh-mascot-shake{25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
@keyframes dsh-mascot-blink{50%{opacity:.4}}
@media(prefers-reduced-motion:reduce){.dsh-mascot *,.dsh-mascot *::before,.dsh-mascot *::after{animation:none!important}}
@media(max-width:600px){.dsh-mascot{--mascot-right:12px;bottom:12px;--mascot-scale:.7;width:116px}.dsh-mascot[data-size=small]{--mascot-scale:.6;width:106px}.dsh-mascot-bubble{font-size:11px;max-width:120px;padding:6px 9px}}
`

    /** Remove only edge-connected near-white pixels, preserving white clothing and hair. */
    function cutout(image) {
      const canvas = document.createElement('canvas')
      canvas.width = 425
      canvas.height = 525
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 134, 425, 525, 0, 0, 425, 525)
      const pixels = context.getImageData(0, 0, 425, 525)
      const { data } = pixels
      const queue = new Int32Array(425 * 525)
      let head = 0
      let tail = 0
      function visit(index) {
        const offset = index * 4
        if (!data[offset + 3] || data[offset] < 242 || data[offset + 1] < 242 || data[offset + 2] < 242) return
        data[offset + 3] = 0
        queue[tail++] = index
      }
      for (let x = 0; x < 425; x++) { visit(x); visit(524 * 425 + x) }
      for (let y = 0; y < 525; y++) { visit(y * 425); visit(y * 425 + 424) }
      while (head < tail) {
        const index = queue[head++]
        if (index % 425) visit(index - 1)
        if (index % 425 < 424) visit(index + 1)
        if (index >= 425) visit(index - 425)
        if (index < 524 * 425) visit(index + 425)
      }
      context.putImageData(pixels, 0, 0)
      return canvas.toDataURL('image/png')
    }

    function constrain(position, element) {
      const rect = element.getBoundingClientRect()
      return {
        right: Math.max(8, Math.min(position.right, window.innerWidth - rect.width - 8)),
        bottom: Math.max(8, Math.min(position.bottom, window.innerHeight - rect.height - 8)),
      }
    }

    const PREF_KEY = 'dsh-ai-mascot:preferences'
    function readPreferences() {
      try {
        const saved = JSON.parse(localStorage.getItem(PREF_KEY))
        const position = saved?.position
        return {
          compact: saved?.compact === true, motion: saved?.motion !== false, size: saved?.size === 'small' ? 'small' : 'normal',
          position: Number.isFinite(position?.right) && Number.isFinite(position?.bottom) ? position : null,
        }
      } catch { return { compact: false, motion: true, size: 'normal', position: null } }
    }

    return {
      inject: ['slots', 'locale', 'modelDirectories'],
      apply(ctx) {
        const bridge = createBridge()
        ctx.effect(() => () => bridge.dispose(), 'ai-mascot: activity')
        for (const [lang, dictionary] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dictionary), `ai-mascot: ${lang}`)
        }
        const t = ctx.locale.bind(NS)
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-ai-mascot'
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, 'ai-mascot: styles')

        /** Headless session seat borrows the displayed binding, never retains another Session. */
        function Observer({ sessionId, useSession, useChat, useSessionStatus, directory }) {
          const token = React.useMemo(() => ({}), [sessionId])
          const running = useSession(session => session.running)
          const error = useSession(session => Boolean(session.promptError || session.lastAgentError))
          const waiting = useSessionStatus(status => Boolean(status.get(sessionId)?.pendingInteraction))
          const activity = useChat(liveActivity)
          const success = useChat(endedWithReply)
          const selection = React.useSyncExternalStore(directory.subscribe.bind(directory), directory.getSnapshot.bind(directory))?.current
          const character = characterFor(selection)
          React.useEffect(() => () => bridge.release(token), [token])
          React.useEffect(() => {
            bridge.publish(token, { sessionId, character, running, error, waiting, activity, success })
          }, [token, sessionId, character, running, error, waiting, activity, success])
          return null
        }

        function Companion({ usePanelInfo }) {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const facts = React.useSyncExternalStore(bridge.subscribe, bridge.getSnapshot)
          const panel = usePanelInfo(info => info.activePanelId)
          const [preferences, setPreferences] = React.useState(readPreferences)
          const [settings, setSettings] = React.useState(false)
          const [failed, setFailed] = React.useState(null)
          const [images, setImages] = React.useState({})
          const [position, setPosition] = React.useState(preferences.position)
          const [dragging, setDragging] = React.useState(false)
          const element = React.useRef(null)
          const drag = React.useRef(null)
          const suppressClick = React.useRef(false)
          const change = patch => setPreferences(previous => {
            const next = { ...previous, ...patch }
            try { localStorage.setItem(PREF_KEY, JSON.stringify(next)) } catch { /* Preferences still work for this tab. */ }
            return next
          })
          React.useLayoutEffect(() => {
            const fit = () => setPosition(previous => {
              if (!previous || !element.current) return previous
              const next = constrain(previous, element.current)
              return next.right === previous.right && next.bottom === previous.bottom ? previous : next
            })
            fit()
            window.addEventListener('resize', fit)
            return () => window.removeEventListener('resize', fit)
          }, [preferences.size, preferences.compact, facts?.character, facts?.activity, panel])
          React.useEffect(() => {
            if (facts?.character && panel === null) return
            const current = drag.current
            drag.current = null
            setDragging(false)
            if (current?.next) change({ position: current.next })
          }, [facts?.character, panel])
          React.useEffect(() => {
            if (!settings) return
            const onKey = event => { if (event.key === 'Escape') setSettings(false) }
            document.addEventListener('keydown', onKey)
            return () => document.removeEventListener('keydown', onKey)
          }, [settings])
          function startDrag(event) {
            if (!event.isPrimary || event.button !== 0) return
            const rect = element.current.getBoundingClientRect()
            drag.current = {
              id: event.pointerId, x: event.clientX, y: event.clientY,
              right: window.innerWidth - rect.right, bottom: window.innerHeight - rect.bottom,
              next: null,
            }
            suppressClick.current = false
            event.currentTarget.setPointerCapture(event.pointerId)
          }
          function moveDrag(event) {
            const current = drag.current
            if (!current || current.id !== event.pointerId) return
            const dx = event.clientX - current.x
            const dy = event.clientY - current.y
            if (!current.next && Math.hypot(dx, dy) < 4) return
            current.next = constrain({ right: current.right - dx, bottom: current.bottom - dy }, element.current)
            suppressClick.current = true
            setDragging(true)
            setPosition(current.next)
          }
          function endDrag(event) {
            const current = drag.current
            if (!current || current.id !== event.pointerId) return
            drag.current = null
            setDragging(false)
            if (current.next) change({ position: current.next })
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
          }
          function moveWithKeys(event) {
            const direction = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[event.key]
            if (!direction) return
            event.preventDefault()
            const rect = element.current.getBoundingClientRect()
            const step = event.shiftKey ? 20 : 5
            const next = constrain({ right: window.innerWidth - rect.right + direction[0] * step, bottom: window.innerHeight - rect.bottom + direction[1] * step }, element.current)
            setPosition(next)
            change({ position: next })
          }
          const movable = { onPointerDown: startDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag, onLostPointerCapture: endDrag, onKeyDown: moveWithKeys }
          if (!facts?.character || panel !== null) return null
          const { character, activity } = facts
          const name = character === 'gpt' ? 'GPT' : 'Claude'
          const message = activity === 'idle' ? '' : t(`${character}_${activity}`)
          const root = {
            ref: element, className: 'dsh-mascot', 'data-character': character, 'data-activity': activity,
            'data-size': preferences.size, 'data-motion': preferences.motion ? 'on' : 'off',
            'data-compact': preferences.compact, 'data-dragging': dragging,
            style: position ? { right: position.right, bottom: position.bottom, '--mascot-right': `${position.right}px`, '--mascot-bottom': `${position.bottom}px` } : undefined,
            onPointerDownCapture: () => { suppressClick.current = false },
            onClickCapture: event => {
              if (!suppressClick.current || event.detail === 0) return
              suppressClick.current = false
              event.preventDefault()
              event.stopPropagation()
            },
          }
          const button = (label, content, onClick, extra = {}) => h('button', { type: 'button', className: 'dsh-mascot-control', title: label, 'aria-label': label, onClick, ...extra }, content)
          if (preferences.compact) return h('aside', root,
            h('button', { ...movable, type: 'button', className: 'dsh-mascot-mini', title: message ? `${message} · ${t('move')}` : t('move'), 'aria-label': t('expand'), onClick: () => change({ compact: false }) }, SIGNS[activity]))
          return h('aside', { ...root, 'aria-label': `${name} · ${t('label')}` },
            h('div', { className: message ? 'dsh-mascot-bubble' : undefined, role: 'status', 'aria-live': 'polite', 'aria-atomic': true }, message),
            h('div', { ...movable, className: 'dsh-mascot-stage', role: 'group', tabIndex: 0, 'aria-label': t('move'), title: t('move') },
              h('div', { className: 'dsh-mascot-sticker', 'aria-hidden': true },
                h('div', { className: 'dsh-mascot-portrait' },
                  failed === character
                    ? h('div', { className: 'dsh-mascot-fallback', title: t('unavailable') }, name)
                    : h('img', {
                      key: character, src: images[character] ?? ART[character], alt: '', draggable: false,
                      crossOrigin: 'anonymous', referrerPolicy: 'no-referrer', style: { visibility: images[character] ? 'visible' : 'hidden' },
                      onLoad: event => {
                        if (images[character]) return
                        try {
                          const source = cutout(event.currentTarget)
                          setImages(previous => ({ ...previous, [character]: source }))
                        } catch { setFailed(character) }
                      },
                      onError: () => setFailed(character),
                    })),
                activity === 'idle' ? null : h('div', { className: 'dsh-mascot-sign' }, SIGNS[activity]),
                ['reading', 'writing', 'terminal', 'replying'].includes(activity)
                  ? h('div', { className: 'dsh-mascot-prop' }, activity === 'writing' ? '</> ' : activity === 'terminal' ? '$ ' : '') : null)),
            h('div', { className: 'dsh-mascot-controls' },
              button(t('settings'), '⚙', () => setSettings(!settings), { 'aria-expanded': settings }),
              button(t('collapse'), '−', () => { change({ compact: true }); setSettings(false) })),
            settings ? h('section', { className: 'dsh-mascot-panel', role: 'region', 'aria-label': t('settings') },
              h('header', null, t('settings'), button(t('close'), '×', () => setSettings(false))),
              h('label', null, h('input', { type: 'checkbox', checked: preferences.motion, onChange: event => change({ motion: event.target.checked }) }), t('motion')),
              h('div', { className: 'dsh-mascot-sizes' }, h('span', null, t('size')),
                ...['small', 'normal'].map(size => h('button', { key: size, type: 'button', 'aria-pressed': preferences.size === size, onClick: () => change({ size }) }, t(size)))),
              h('p', null, t('credit')),
              h('a', { href: SOURCE, target: '_blank', rel: 'noreferrer' }, t('source'))) : null)
        }

        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities', id: 'ai-mascot-observer', order: 1000,
          inject: sessionId => ({ directory: ctx.modelDirectories.directoryFor(sessionId).store }),
        }, Observer))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'ai-mascot', order: 1000,
        }, Companion))
      },
    }
  },
})
