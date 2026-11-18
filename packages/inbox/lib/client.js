window.__ModuleLoader__.load({
  id: 'dsh-inbox',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-inbox'
    const KEY = 'dsh-inbox-outcome'
    const PREFIX = 'dsh-inbox:seen:v1:'
    const identity = x => x
    const attentionRank = { approval: 3, 'plan-review': 2, question: 1 }
    const copy = {
      en: { title: 'Inbox', intro: 'Only conversations waiting for you count toward the badge.', attention: 'Needs you', updates: 'Updates', working: 'In progress', noAttention: 'Nothing needs your input.', incomplete: 'No confirmed requests in the summaries read so far.', noUpdates: 'No unread turn updates.', loading: 'Loading conversations…', question: 'Question for you', approval: 'Approval requested', 'plan-review': 'Plan to review', completed: 'Turn ended', error: 'Turn failed', blocked: 'Turn blocked', interrupted: 'Turn interrupted', 'max-tokens': 'Token limit reached', stopped: 'Turn stopped', worker: 'Subtask', running: 'Working', seen: 'Mark read', seenBatch: 'Mark shown updates read', more: 'Show more', missing: 'Older conversations without an outcome summary:', recover: 'Check next batch', recovering: 'Checking history…', checked: 'Checked this visit; some summaries are still unavailable.', absent: 'The Host did not provide these summaries. Check that the Host plugin is enabled and reconnect.', partialUpdates: 'No unread updates in the summaries read so far.', retry: 'Retry missing summaries', unavailable: 'Workspace state unavailable. Showing the last available data.', memory: 'Read marks last for this visit only: browser storage is unavailable.', verifying: 'Checking saved question state:', queued: 'Continuation queued' },
      zh: { title: '收件箱', intro: '角标只数需要你处理的会话。', attention: '需要你', updates: '可回看', working: '进行中', noAttention: '目前没有需要你处理的请求。', incomplete: '已读取的摘要中没有已确认的请求。', noUpdates: '没有未读的轮次更新。', loading: '正在读取会话…', question: '有个问题需要你回答', approval: '等待审批', 'plan-review': '等待审阅计划', completed: '本轮已结束', error: '本轮出错', blocked: '本轮受阻', interrupted: '本轮中断', 'max-tokens': '达到输出上限', stopped: '本轮停止', worker: '子任务', running: '正在工作', seen: '标为已读', seenBatch: '将已显示的更新标为已读', more: '显示更多', missing: '尚无结果摘要的历史会话：', recover: '补读下一批', recovering: '正在补读…', checked: '本次已检查，仍有会话缺少摘要。', absent: 'Host 没有提供这些摘要。请检查 Host 插件是否启用，再重新连接。', partialUpdates: '已读取的摘要中没有未读更新。', retry: '重试缺失项', unavailable: '工作区状态暂不可用，显示最近一次数据。', memory: '浏览器存储不可用，已读标记仅在本次访问有效。', verifying: '待核实的历史问题：', queued: '等待继续执行' },
    }

    // An opaque id + monotonically increasing session log seq, never titles or answers.
    // The seq is part of the key: a slow tab cannot overwrite a newer receipt. Drop
    // the previous marker only AFTER the new one has been written successfully.
    function createReceipts(storage) {
      const cache = new Map(), listeners = new Set()
      let version = 0, volatile = !storage
      let batching = false
      const publish = () => { version++; if (!batching) for (const fn of listeners) fn() }
      const get = id => cache.get(id) ?? -1
      const key = (id, seq) => `${PREFIX}${seq}:${id}`
      const parseKey = raw => {
        if (!raw?.startsWith(PREFIX)) return null
        const split = raw.indexOf(':', PREFIX.length), digits = raw.slice(PREFIX.length, split)
        const seq = Number(digits)
        return split > PREFIX.length && /^\d+$/.test(digits) && Number.isSafeInteger(seq) ? { id: raw.slice(split + 1), seq } : null
      }
      const load = () => {
        try {
          for (let i = 0; i < (storage?.length ?? 0); ++i) {
            const mark = parseKey(storage.key(i))
            if (mark && mark.seq > get(mark.id)) cache.set(mark.id, mark.seq)
          }
        } catch { volatile = true }
      }
      load()
      return {
        get, version: () => version, volatile: () => volatile,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
        seen(id, seq) {
          const prev = get(id)
          if (!Number.isSafeInteger(seq) || seq <= prev) return
          cache.set(id, seq)
          try {
            storage?.setItem(key(id, seq), '1')
            if (prev >= 0) storage?.removeItem(key(id, prev))
          } catch { volatile = true }
          publish()
        },
        seenBatch(rows) {
          const before = version
          batching = true
          try { for (const row of rows) this.seen(row.outcomeId ?? row.id, row.outcome.seq) }
          finally { batching = false; if (version !== before) publish() }
        },
        external(event) {
          if (event.storageArea !== storage) return
          if (event.key === null) { cache.clear(); load() }
          else {
            const mark = parseKey(event.key)
            if (!mark) return
            if (event.newValue !== null && mark.seq > get(mark.id)) cache.set(mark.id, mark.seq)
            else if (event.newValue === null && mark.seq === get(mark.id)) { cache.delete(mark.id); load() }
            else return
          }
          publish()
        },
      }
    }

    // A fork with a parent is still an independent thread. Only a subagent rolls up.
    function owningRoot(row, byId, archived, memo) {
      let current = row
      const path = new Set()
      while (current && !memo.has(current.id) && !archived.has(current.id) && !path.has(current.id)) {
        if (current.origin !== 'subagent') break
        path.add(current.id)
        current = byId[current.parentId]
      }
      const root = !current || archived.has(current.id) || path.has(current.id) ? null
        : memo.get(current.id) ?? (current.origin !== 'subagent' ? current : null)
      for (const id of path) memo.set(id, root)
      return root
    }

    // Keep each call independent. The native live interaction wins over a matching log hint.
    function requestsFor(status, values) {
      const all = [], live = status?.pendingInteraction
      const queued = new Set([...(values.inbox?.['next-step'] ?? []), ...(values.inbox?.['next-turn'] ?? [])]
        .filter(m => m?.source?.kind === 'user-question-reply').map(m => m.source.callId))
      const add = (kind, questions, callId, verified) => {
        if (callId && (queued.has(callId) || all.some(r => r.callId === callId))) return
        const intent = questions?.find(q => q.intent)?.intent?.kind
        if (intent === 'approval' || intent === 'plan-review') kind = intent
        all.push({ kind, detail: questions?.[0]?.question, callId, verified, parkable: Boolean(callId && kind === 'question' && questions?.length && questions.every(q => !q.intent)) })
      }
      if (live && live.review === undefined && Object.hasOwn(attentionRank, live.kind)) add(live.kind, live.questions, live.callId, true)
      for (const q of values.userQuestions?.active ?? []) {
        if (q.state !== 'continued' || q.questions?.some(item => item.intent?.kind === 'approval')) continue
        add('question', q.questions, q.callId, false)
      }
      return all
    }

    const parkId = (id, callId) => JSON.stringify([id, callId])
    function createHolds(storage) {
      const prefix = 'dsh-inbox:later:v1:', map = new Map(), listeners = new Set(); let revision = 0, volatile = !storage
      const fire = () => { revision++; for (const fn of listeners) fn() }
      const load = () => {
        try { for (let i = (storage?.length ?? 0) - 1; i >= 0; i--) {
          const k = storage.key(i); if (!k?.startsWith(prefix)) continue
          const n = Number(storage.getItem(k)); if (Number.isSafeInteger(n) && n > Date.now()) map.set(k.slice(prefix.length), n); else storage.removeItem(k)
        } } catch { volatile = true }
      }
      load()
      return { get: k => map.get(k) ?? 0, version: () => revision, volatile: () => volatile,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
        set(k, until) { if (until) map.set(k, until); else map.delete(k); try { if (until) storage?.setItem(prefix + k, String(until)); else storage?.removeItem(prefix + k) } catch { volatile = true }; fire() },
        external(e) { if (e.storageArea !== storage || (e.key !== null && !e.key.startsWith(prefix))) return; map.clear(); load(); fire() },
      }
    }

    const valuesOf = (list, row) => list.projectionsBySession[row.id]?.values ?? row.projectionValues ?? {}
    function collect(list, statuses, workspaces, seen, now, hold) {
      const archived = new Set(workspaces.archivedSessionIds)
      const groups = new Map(), memo = new Map(), locations = new Map()
      const board = { attention: [], updates: [], working: [], later: [], missing: [], verify: [], deadline: Infinity }
      for (const ws of workspaces.items) for (const id of ws.sessionIds) locations.set(id, ws.title || ws.path)
      for (const row of Object.values(list.byId)) {
        const root = owningRoot(row, list.byId, archived, memo)
        if (!root || root.blank || row.formatStatus === 'migration-required' || root.formatStatus === 'migration-required') continue
        let group = groups.get(root.id)
        if (!group) {
          group = { id: root.id, title: root.displayTitle || root.id, workspace: locations.get(root.id) || root.cwd || '',
            at: root.updatedAt, children: 0, running: false, queued: false, request: null, outcome: null, target: root.id, failures: [], holds: [] }
          groups.set(root.id, group)
        }
        const status = statuses.get(row.id), values = valuesOf(list, row)
        const running = status?.running ?? row.running
        if (row === root) {
          // Capture the displayed watermark; click handlers never consult a newer store value.
          const end = values[KEY]
          group.outcome = end ? { seq: end.seq, time: end.time, reason: end.reason, file: end.file === true } : null
          group.running = running
          group.queued = Boolean(values.inbox?.['next-turn']?.length) // A next-step injection alone does not wake an idle agent.
          if (!Object.hasOwn(values, KEY)) board.missing.push(root.id)
        } else {
          if (running) group.children++
          const out = values[KEY]
          if (!running && out && ['error', 'interrupted', 'blocked'].includes(out.reason)) group.failures.push({ id: row.id, title: row.displayTitle || row.id, outcome: { ...out } })
        }
        for (const request of requestsFor(status, values)) {
          if (!request.verified && !running && list.projectionsBySession[row.id]?.state !== 'ready') { board.verify.push(row.id); continue }
          const key = parkId(row.id, request.callId), until = request.parkable ? hold(key) : 0
          if (until > now) { group.holds.push({ request, until, key, target: row.id }); board.deadline = Math.min(board.deadline, until); continue }
          if (!group.request || attentionRank[request.kind] > attentionRank[group.request.kind] || (request.kind === group.request.kind && row === root && group.target !== root.id)) {
            group.request = request; group.target = row.id; group.childTitle = row === root ? null : row.displayTitle
          }
        }
      }
      for (const group of groups.values()) {
        for (const parked of group.holds) board.later.push({ ...group, ...parked })
        if (group.request) { board.attention.push(group); continue }
        if (group.running || group.children || group.queued) { if (!group.holds.length) board.working.push(group); continue }
        const failure = group.failures.toSorted((a, b) => b.outcome.time - a.outcome.time)[0]
        const out = group.outcome
        if (failure && (!out || failure.outcome.time > out.time)) {
          if (failure.outcome.seq <= seen(failure.id)) continue
          board.updates.push({ ...group, outcome: failure.outcome, target: failure.id, outcomeId: failure.id, childTitle: failure.title }); continue
        }
        if (group.holds.length || !out || out.seq <= seen(group.id)) continue
        const delay = out.time + 2000 - now
        if (out.reason === 'completed' && delay > 0 && delay <= 2000) { board.deadline = Math.min(board.deadline, out.time + 2000); board.working.push(group) } else board.updates.push(group)
      }
      board.later.sort((a, b) => a.until - b.until)
      board.missing.sort((a, b) => list.byId[b].updatedAt - list.byId[a].updatedAt || a.localeCompare(b))
      board.attention.sort((a, b) => attentionRank[b.request.kind] - attentionRank[a.request.kind] || a.at - b.at || a.id.localeCompare(b.id))
      board.updates.sort((a, b) => b.outcome.time - a.outcome.time || a.id.localeCompare(b.id))
      board.working.sort((a, b) => b.at - a.at || a.id.localeCompare(b.id))
      return board
    }

    Object.assign(copy.en, {"settings":"Summary settings","back":"Back to Inbox","go":"Open conversation","answer":"Answer in conversation","scope":"View approval scope","plan":"Review plan","file":"View file","later":"Later","moreActions":"More actions","hour":"In one hour","tomorrow":"Tomorrow at 09:00","restore":"Show now","until":"Show again","childFailure":"Subtask reported a problem. No coordinator conclusion is implied.","ai":"AI summary","basis":"Source: root assistant report","route":"Provider / model","off":"Off · native facts only","disabled":"Disable automatic summaries","enable":"Enable for new turns here","trial":"Try once (may incur a charge)","preview":"Exact source excerpt sent to this model","noSample":"No eligible update selected. New calls are off unless explicitly enabled.","noText":"Only native facts for this update; nothing to send.","sample":"Choose a root turn to inspect","select":"Select…","policy":"Only the selected directory’s new root reports may be sent, even with this page closed. No tools, attachments, history backfill, or model fallback. Daily budget includes trials and resets at 00:00 UTC.","budget":"Calls today","done":"Saved","saving":"Working…","active":"Enabled for","loadError":"Unavailable or access denied","parked":"Question deferred","resumed":"Question restored","local":"Browser storage unavailable. Read marks and reminders last for this visit only.","nativeFile":"Registered deliverable","inspect":"View source","on":"Automatic summary","retrySettings":"Reload settings"})
    Object.assign(copy.zh, {"settings":"摘要设置","back":"返回收件箱","go":"打开会话","answer":"到会话回答","scope":"查看审批范围","plan":"审阅完整计划","file":"查看文件","later":"稍后处理","moreActions":"更多操作","hour":"1 小时后","tomorrow":"明早 09:00","restore":"现在处理","until":"重新提醒","childFailure":"子任务记录了异常，这不代表主会话已有结论。","ai":"AI 摘要","basis":"依据：主会话回复原文","route":"供应商 / 模型","off":"关闭 · 只显示原生状态","disabled":"关闭自动摘要","enable":"为此目录的新轮次启用","trial":"试算一次（可能计费）","preview":"发给所选模型的原文节选","noSample":"未选可用更新。未曾启用时不会发起模型调用。","noText":"这条更新只显示原生事实，不发送原文。","sample":"选择一条根会话更新以查看依据","select":"请选择…","policy":"只发送选定目录中新结束的根会话报告，关掉页面后也可能计费。不发工具日志、附件，不补算历史，不自动换模型。试算也计入每日预算，UTC 00:00 重置。","budget":"今日已用","done":"已保存","saving":"处理中…","active":"当前已启用","loadError":"暂不可用或无权访问","parked":"问题已稍后处理","resumed":"问题已恢复","local":"浏览器存储不可用，已读和稍后标记仅本次访问有效。","nativeFile":"已登记交付物","inspect":"查看原文","on":"自动摘要","retrySettings":"重新读取设置"})
    copy.en.directory = 'Working directory (exact match)'; copy.zh.directory = '工作目录（仅此目录）'
    copy.en.modelIssue = 'The last automatic summary was unavailable. Native facts are unchanged.'; copy.zh.modelIssue = '上次自动摘要未生成，仍显示原生事实。'
    copy.en.catalogIssue = 'Model list unavailable. You can still disable automatic summaries.'; copy.zh.catalogIssue = '模型目录暂不可用，仍可关闭自动摘要。'
    copy.zh.policy += ' 自由文本可能含敏感信息，请不要为敏感目录启用。'; copy.en.policy += ' Free text can contain secrets. Do not enable sensitive directories.'
    const CSS = `
.dshi{height:100%;min-width:0;box-sizing:border-box;overflow:auto;container-type:inline-size;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}.dshi *{box-sizing:border-box}.dshi-body{max-width:960px;margin:auto;padding:28px clamp(24px,4vw,48px) 64px}.dshi header,.dshi-head,.dshi-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dshi header,.dshi-head{justify-content:space-between}.dshi h1{margin:0;font-size:20px;line-height:28px;font-weight:500}.dshi h2,.dshi summary{font-size:14px;line-height:22px;font-weight:550}.dshi h2,.dshi ul{margin:0}.dshi p{line-height:1.55;margin:5px 0}.dshi .muted,.dshi small,.dshi footer{color:var(--dsw-alias-label-secondary)}.dshi small,.dshi footer{font-size:12px}.dshi section,.dshi footer,.dshi .fold{margin-top:24px}.dshi ul{list-style:none;padding:0}.dshi li{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:10px;padding:14px 0;border-bottom:1px solid var(--dsw-alias-border-l1);align-items:start}.dshi .text{min-width:0;overflow-wrap:anywhere}.dshi strong{font-size:14px;font-weight:550}.dshi small{display:block;margin-top:3px;overflow-wrap:anywhere}.dshi .symbol{color:var(--dsw-alias-label-secondary);line-height:22px;text-align:center}.dshi button,.dshi select,.dshi .hold summary,.dshi-back{cursor:pointer;font:inherit;font-size:13px;line-height:20px;color:inherit;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);padding:4px 9px;max-width:100%;overflow-wrap:anywhere}.dshi button:hover,.dshi summary:hover,.dshi-back:hover{background:var(--dsw-alias-bg-layer-1)}.dshi .quiet{border-color:transparent;color:var(--dsw-alias-label-secondary);background:transparent}.dshi .primary{color:var(--dsw-alias-bg-base);background:var(--dsw-alias-brand-primary);border-color:transparent}.dshi button:disabled{cursor:default;opacity:.5}.dshi button:focus-visible,.dshi select:focus-visible,.dshi summary:focus-visible,.dshi-back:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dshi summary{cursor:pointer;width:fit-content}.dshi .count{color:var(--dsw-alias-label-secondary);font-weight:400;margin-inline-start:7px}.dshi .dshi-actions{justify-content:flex-end;align-items:flex-start}.dshi .hold{position:relative}.dshi .hold summary{list-style:none}.dshi .hold[open]>div{position:absolute;inset-inline-end:0;z-index:2;min-width:155px;padding:5px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base)}.dshi .hold button{display:block;width:100%;text-align:start}.dshi .source{margin:8px 0}.dshi .source summary{font-size:12px;color:var(--dsw-alias-label-secondary)}.dshi .settings{max-width:660px}.dshi .settings label{display:block;margin:16px 0 5px}.dshi .settings select{width:100%}.dshi .settings .dshi-actions{margin:16px 0;justify-content:flex-start}.dshi blockquote{margin:8px 0;padding-inline-start:12px;border-inline-start:2px solid var(--dsw-alias-border-l2);white-space:pre-wrap;overflow-wrap:anywhere}.dshi [role=status]:empty{display:none}.dshi-back{background:transparent;color:var(--dsw-alias-label-primary)}
@container(max-width:620px){.dshi-body{padding:20px 20px 48px}.dshi li{grid-template-columns:20px minmax(0,1fr)}.dshi li>.dshi-actions{grid-column:2;justify-content:flex-start}.dshi .hold[open]>div{position:static}.dshi button,.dshi select,.dshi .hold summary{min-height:36px}}@container(max-width:385px){.dshi li{grid-template-columns:minmax(0,1fr)}.dshi li>.symbol{display:none}.dshi li>.dshi-actions{grid-column:1}}
`
    async function operation(action, args, signal) {
      const res = await fetch('dsh-inbox/summary', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...args, action }), signal })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'HTTP ' + res.status)
      return res.json()
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'layout', 'uiWorkspace'],
      apply(ctx) {
        for (const [lang, messages] of Object.entries(copy)) ctx.effect(() => ctx.locale.register(NS, lang, messages), `${NS}: ${lang}`)
        const t = ctx.locale.bind(NS)
        let storage
        try { storage = window.localStorage } catch { /* Keep this visit usable. */ }
        const receipts = createReceipts(storage), holds = createHolds(storage)
        let origin = null
        ctx.effect(() => {
          window.addEventListener('storage', receipts.external); window.addEventListener('storage', holds.external)
          let source, unsubscribeHistory, outcome, visibleId
          const acknowledge = () => {
            if (!source || !outcome || receipts.get(visibleId) >= outcome.seq || !document.hasFocus() || document.visibilityState !== 'visible') return
            // Opening navigation (or a failed history read) is not proof of delivery.
            if (source.getSnapshot().entries.some(({ event }) => event.seq === outcome.seq && event.type === 'turn/end' && event.time === outcome.time)) receipts.seen(visibleId, outcome.seq)
          }
          const markVisible = () => {
            const list = ctx.sessions.list.getSnapshot()
            const visible = document.visibilityState === 'visible' && document.hasFocus() && ctx.layout.panelInfo.getSnapshot().activePanelId === null
            const row = visible && Object.values(list.byId).find(s => s.retainedBy.mainView > 0)
            const next = row ? ctx.sessions.binding(row.id)?.eventSource : undefined
            visibleId = row?.id
            outcome = row && !row.running && valuesOf(list, row)[KEY]
            if (source !== next) {
              unsubscribeHistory?.(); source = next; unsubscribeHistory = next?.subscribe(acknowledge)
            }
            acknowledge()
          }
          const unlist = ctx.sessions.list.subscribe(markVisible), unpanel = ctx.layout.panelInfo.subscribe(markVisible)
          window.addEventListener('focus', markVisible); window.addEventListener('blur', markVisible); document.addEventListener('visibilitychange', markVisible)
          markVisible()
          return () => {
            unlist(); unpanel(); unsubscribeHistory?.(); window.removeEventListener('storage', receipts.external); window.removeEventListener('storage', holds.external)
            window.removeEventListener('focus', markVisible); window.removeEventListener('blur', markVisible); document.removeEventListener('visibilitychange', markVisible)
          }
        }, `${NS}: receipts`)
        // Native projection reads are single-flight and do not activate an agent. The
        // icon validates only candidate questions, one at a time; never sweep history.
        const queue = new Set()
        let verifying = false, mounted = true
        ctx.effect(() => () => { mounted = false })
        async function verifyQuestions(ids) {
          const idle = id => (ctx.sessions.list.getSnapshot().projectionsBySession[id]?.state ?? 'idle') === 'idle'
          for (const id of ids) if (idle(id)) queue.add(id)
          if (verifying) return
          verifying = true
          try {
            for (const id of queue) {
              if (!mounted) break
              queue.delete(id)
              if (!idle(id)) continue // Errors need a manual retry; reconnect resets native load state.
              try { await ctx.sessions.refreshProjections(id) } catch { /* Manual retry remains available. */ }
            }
          } finally { verifying = false }
        }
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        function useBoard(props) {
          const list = props.useSessions(identity), status = props.useSessionStatus(identity), ws = props.useWorkspaces(identity)
          const version = React.useSyncExternalStore(receipts.subscribe, receipts.version)
          const holdVersion = React.useSyncExternalStore(holds.subscribe, holds.version)
          const [tick, wake] = React.useReducer(n => n + 1, 0)
          const board = React.useMemo(() => collect(list, status, ws, receipts.get, Date.now(), holds.get), [list, status, ws, version, holdVersion, tick])
          React.useEffect(() => {
            if (!Number.isFinite(board.deadline)) return
            const timer = setTimeout(wake, Math.max(1, board.deadline - Date.now()))
            return () => clearTimeout(timer)
          }, [board.deadline])
          const ready = list.phase === 'ready' && ws.phase === 'ready'
          React.useEffect(() => { if (ready && board.verify.length) void verifyQuestions(board.verify) }, [ready, board.verify])
          return { board, ready, ws, list }
        }
        function Icon(props) {
          const { board, ready } = useBoard(props)
          const count = ready ? board.attention.length : 0, size = props.size ?? 18
          return h('span', { style: { position: 'relative', display: 'inline-flex' } },
            h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round', 'aria-hidden': true },
              h('path', { d: 'M2.5 14 6.2 5h11.6l3.7 9v5H2.5zM3 14h5.5l1.4 2H14l1.4-2H21' })),
            count > 0 && h('span', { title: `${t('attention')}: ${count}`, style: { position: 'absolute', insetInlineStart: '65%', top: '-.55em', fontSize: 10, fontWeight: 650, padding: '0 3px', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-brand-primary)' } }, count > 99 ? '99+' : count))
        }
        const button = (label, onClick, kind = '', extra = {}) => h('button', { type: 'button', onClick, className: kind, ...extra }, label)
        const keyFor = row => JSON.stringify([row.id, row.target, row.request?.callId ?? row.request?.kind ?? row.outcome?.seq ?? null])
        const option = (value, label) => h('option', { key: value, value }, label)
        const filePart = s => encodeURIComponent(s).replace(/%3A/gi, ':')
        const fileAddress = (id, path) => `dsh-resource://file/session/${filePart(id)}/${path.replace(/\\/g, '/').split('/').map(filePart).join('/')}`
        function Settings({ rows, list, close }) {
          const [data, setData] = React.useState(null), [choice, choose] = React.useState(''), [sample, pick] = React.useState('')
          const [cwd, setCwd] = React.useState('')
          const dirs = [...new Set(Object.values(list.byId).filter(r => r.origin !== 'subagent' && !r.blank && r.cwd).map(r => r.cwd))].toSorted()
          const [src, setSrc] = React.useState(null), [result, setResult] = React.useState(null), [busy, setBusy] = React.useState(false), [notice, say] = React.useState('')
          const [reload, refresh] = React.useReducer(n => n + 1, 0), active = React.useRef(null), lock = React.useRef(false), title = React.useRef(null)
          React.useEffect(() => { const ctl = new AbortController(); active.current = ctl; title.current?.focus(); return () => ctl.abort() }, [])
          React.useEffect(() => { const ctl = new AbortController(); operation('settings', {}, ctl.signal).then(value => { if (!ctl.signal.aborted) { setData(value); setCwd(value.state.cwd || ''); choose(value.state.route ? JSON.stringify(value.state.route) : '') } }).catch(e => { if (!ctl.signal.aborted) say(`${t('loadError')}: ${e.message}`) }); return () => ctl.abort() }, [reload])
          React.useEffect(() => { const ctl = new AbortController(); setResult(null); setSrc(null); if (sample) { const [id, seq] = JSON.parse(sample); operation('source', { id, seq }, ctl.signal).then(s => { if (!ctl.signal.aborted) setSrc({ ...s, sample }) }).catch(e => { if (!ctl.signal.aborted) say(e.message) }) }; return () => ctl.abort() }, [sample])
          const current = src?.sample === sample ? src : null
          const run = async action => {
            if (lock.current || !data) return
            const route = choice && JSON.parse(choice), [id, seq] = sample ? JSON.parse(sample) : []
            lock.current = true; setBusy(true); say(''); setResult(null)
            try { const v = await operation(action, { id, seq, route, cwd, lines: action === 'trial' ? current?.lines : undefined }, active.current.signal)
              if (active.current.signal.aborted) return
              if (action === 'trial') setResult(v)
              else { setData({ ...data, state: v }); if (action === 'disable') choose(''); say(t('done')) }
            } catch (e) { if (!active.current.signal.aborted) say(e.message) } finally {
              // Failed provider attempts can still consume a budget slot.
              if (action === 'trial' && !active.current.signal.aborted) { try { const next = await operation('settings', {}, active.current.signal); if (!active.current.signal.aborted) setData(next) } catch { /* Keep the original outcome visible. */ } }
              lock.current = false; if (!active.current.signal.aborted) setBusy(false)
            }
          }
          const state = data?.state, choices = rows.filter(r => !r.outcomeId && list.byId[r.id]?.cwd === cwd).map(r => [JSON.stringify([r.id, r.outcome.seq]), r.title])
          return h('div', { className: 'settings' }, h('header', null, h('h1', { tabIndex: -1, ref: title }, t('settings')), button(t('back'), close, 'quiet')),
            h('p', { className: 'muted' }, t('policy')), state && h('p', null, state.route ? `${t('active')}: ${state.route.provider} / ${state.route.model} · ${state.cwd}` : t('off')),
            state && h('small', null, `${t('budget')}: ${state.spent} / ${state.limit} (UTC)`), state?.lastIssue && h('small', null, t('modelIssue')), data?.catalogUnavailable && h('small', null, t('catalogIssue')),
            !data ? button(t('retrySettings'), refresh) : h(React.Fragment, null,
              h('label', { htmlFor: 'dshi-route' }, t('route')), h('select', { id: 'dshi-route', value: choice, disabled: busy, onChange: e => { choose(e.target.value); setResult(null); say('') } }, option('', t('select')), data.groups.flatMap(g => g.models.map(m => option(JSON.stringify({ provider: g.id, model: m }), `${g.id} / ${m}`)))),
              h('label', { htmlFor: 'dshi-dir' }, t('directory')), h('select', { id: 'dshi-dir', value: cwd, disabled: busy, onChange: e => { setCwd(e.target.value); pick(''); setResult(null); say('') } }, option('', t('select')), [...new Set([...(cwd ? [cwd] : []), ...dirs])].map(dir => option(dir, dir))),
              h('label', { htmlFor: 'dshi-sample' }, t('sample')), h('select', { id: 'dshi-sample', value: sample, disabled: busy, onChange: e => { pick(e.target.value); say('') } }, option('', t('select')), choices.map(([v, l]) => option(v, l))),
              current ? h('div', null, h('small', null, current.cwd), h('p', null, current.eligible ? t('preview') : t('noText')), current.eligible && h('blockquote', null, current.lines.join('\n'))) : h('p', { className: 'muted' }, t(sample ? 'loading' : 'noSample')),
              h('div', { className: 'dshi-actions' }, button(t('trial'), () => run('trial'), '', { disabled: busy || !choice || !current?.eligible || state.spent >= state.limit }), button(t('enable'), () => run('enable'), 'primary', { disabled: busy || !choice || !cwd }), state.route && button(t('disabled'), () => run('disable'), 'quiet', { disabled: busy }))),
            result && h('blockquote', null, `${t('ai')} · ${result.route.model}\n${result.quotes.join('\n')}`), h('p', { role: 'status' }, busy ? t('saving') : notice))
        }
        function ReturnLink(props) {
          useLocale()
          const [error, setError] = React.useState(''), here = origin?.target === props.sessionId ? origin : null
          const openFile = () => { if (origin !== here || !here?.file) return; try { ctx.get('sidebarRight').openResource(fileAddress(props.sessionId, here.file.path)); here.file = null; setError('') } catch (e) { setError(e.message) } }
          React.useEffect(() => { if (here?.file && !here.attempted) { here.attempted = true; openFile() } }, [here])
          if (!here) return null
          return h(React.Fragment, null, h('style', null, '.dshi-back{font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);background:transparent;border:0;border-radius:6px;padding:4px 8px;cursor:pointer}.dshi-back:hover{background:var(--dsw-alias-bg-layer-1)}'), button(t('back'), () => { if (origin === here) ctx.layout.selectPanel(NS) }, 'dshi-back'), error && here.file && button(t('file'), openFile, 'dshi-back', { title: error }))
        }
        function Evidence({ row, go }) {
          const [open, show] = React.useState(false), [source, set] = React.useState(null), [error, fail] = React.useState('')
          React.useEffect(() => { if (!open) return; const ctl = new AbortController(); fail(''); operation('source', { id: row.id, seq: row.outcome.seq }, ctl.signal).then(s => { if (!ctl.signal.aborted) set(s) }).catch(e => { if (!ctl.signal.aborted) fail(e.message) }); return () => ctl.abort() }, [open, row.id, row.outcome.seq])
          return h('details', { className: 'source', open, onToggle: e => show(e.currentTarget.open) }, h('summary', null, t('basis')), open && h(React.Fragment, null, source && h('small', null, row.title + ' · #' + source.sourceSeq), source && h('blockquote', null, source.lines.join('\n')), !source && h('small', null, error || t('loading')), button(t('inspect'), () => go(row), 'quiet')))
        }
        function SnoozeMenu({ dates, choose }) {
          const [since, opened] = React.useState(0), next = new Date(since); next.setDate(next.getDate() + 1); next.setHours(9, 0, 0, 0)
          const pick = until => { if (until > Date.now()) choose(until); else opened(Date.now()) }
          return h('details', { className: 'hold', onToggle: e => opened(e.currentTarget.open ? Date.now() : 0), onKeyDown: e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus() } } }, h('summary', { 'aria-label': t('later'), title: t('moreActions') }, '···'), since > 0 && h('div', null, button(t('hour') + ' · ' + dates.format(since + 3600000), () => pick(since + 3600000), 'quiet'), button(t('tomorrow') + ' · ' + dates.format(+next), () => pick(+next), 'quiet')))
        }
        function Rows({ items, section, limit, more, owner, cache, noPreview, go, say, remember, scroller }) {
          const lang = ctx.locale.getSnapshot().active, dates = React.useMemo(() => new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), [lang])
          const shown = items.slice(0, limit)
          const change = (row, until) => { remember(row, scroller.current); holds.set(parkId(row.target, row.request.callId), until); say(t(until ? 'parked' : 'resumed')) }
          return h(React.Fragment, null, h('ul', null, shown.map(row => {
            const update = section === 'updates', parked = section === 'later', k = keyFor(row), r = row.request, child = !!row.outcomeId
            const reason = r?.kind ?? (update ? row.outcome.reason : row.queued ? 'queued' : 'running')
            const file = owner && update && !child && row.outcome.file && noPreview !== k && !!ctx.get('sidebarRight')
            const ai = owner && update && !child ? cache.get(JSON.stringify([row.id, row.outcome.seq])) : null
            const title = r?.detail || row.title, note = [t(reason), r?.detail ? row.title : '', row.childTitle, row.workspace, update ? dates.format(row.outcome.time) : null, parked ? t('until') + ' ' + dates.format(row.until) : null, row.children ? t('worker') + ' × ' + row.children : null].filter(Boolean).join(' · ')
            const label = file ? 'file' : r?.kind === 'approval' ? 'scope' : r?.kind === 'plan-review' ? 'plan' : r ? 'answer' : update ? 'inspect' : 'go'
            return h('li', { key: k, 'data-inbox-key': k, 'data-root': row.id, 'data-area': section }, h('span', { className: 'symbol', 'aria-hidden': true }, r ? r.kind === 'question' ? '?' : '◇' : child ? '!' : file ? '▤' : '·'),
              h('div', { className: 'text' }, h('strong', null, title), h('small', null, note), child && h('p', { className: 'muted' }, t('childFailure')), file && h('small', null, t('nativeFile')),
                ai && h('div', null, h('small', null, t('ai') + ' · ' + ai.route.model), h('p', null, ai.quotes.join(' ')), h(Evidence, { row, go }))),
              h('div', { className: 'dshi-actions' }, parked ? button(t('restore'), () => change(row, 0)) : button(t(label), () => go(row, file), section === 'attention' ? 'primary' : ''),
                update && button(t('seen'), () => { remember(row, scroller.current); receipts.seen(row.outcomeId ?? row.id, row.outcome.seq) }, 'quiet', { 'aria-label': t('seen') + ': ' + row.title }),
                !parked && r?.parkable && h(SnoozeMenu, { dates, choose: until => change(row, until) })))
          })), items.length > limit && button(t('more'), more, 'quiet'))
        }
        function Page(props) {
          useLocale()
          const { board, ready, ws, list } = useBoard(props)
          const checked = React.useRef(new Set()), active = React.useRef(true), inFlight = React.useRef(false)
          const [busy, setBusy] = React.useState(false)
          React.useEffect(() => { active.current = true; return () => { active.current = false } }, [])
          const owner = props.useRemoteAccess('pluginManager/listPlugins') // owner-only in DSH; the HTTP handler independently admits the principal.
          const [noPreview, setNoPreview] = React.useState(null)
          const [settings, setSettings] = React.useState(false), [notice, say] = React.useState(''), [cache, setCache] = React.useState(new Map())
          const [limits, setLimits] = React.useState(() => origin?.limits ?? { attention: 16, updates: 16, working: 16, later: 16 }), [folds, setFolds] = React.useState(() => origin?.folds ?? { working: false, later: false })
          const scroller = React.useRef(null), restore = React.useRef(origin), settingsButton = React.useRef(null), returnSettings = React.useRef(false), nav = React.useRef(0)
          const ordering = React.useRef(origin?.ordering ?? []), order = new Map(ordering.current.map((id, index) => [id, index]))
          const attention = board.attention.toSorted((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity))
          React.useLayoutEffect(() => { if (ready) ordering.current = attention.map(r => r.id) })
          // Snapshot the displayed order before handing control to a native conversation.
          const capture = (row, el) => ({ key: keyFor(row), id: row.id, target: row.target, offset: el?.scrollTop ?? 0, area: el && [...el.querySelectorAll('li[data-inbox-key]')].find(n => n.dataset.inboxKey === keyFor(row))?.dataset.area, order: el ? [...el.querySelectorAll('li[data-inbox-key]')].filter(n => n.getClientRects().length).map(n => n.dataset.inboxKey) : [], limits, folds, ordering: ordering.current })
          const remember = (row, el) => { restore.current = capture(row, el) }
          const go = async (row, file) => {
            const saved = capture(row, scroller.current), turn = ++nav.current
            try { if (file) { const src = await operation('source', { id: row.id, seq: row.outcome.seq }); if (!src.artifact) throw new Error(t('loadError')); saved.file = src.artifact }
              if (turn !== nav.current || !active.current || ctx.layout.panelInfo.getSnapshot().activePanelId !== NS) return
              origin = saved; ctx.uiWorkspace.openSession(row.target)
            } catch (e) { if (origin === saved) origin = null; if (active.current && turn === nav.current) { say(e.message); if (file) setNoPreview(keyFor(row)) } }
          }
          React.useLayoutEffect(() => {
            if (!ready || settings || !scroller.current) return
            if (returnSettings.current) { returnSettings.current = false; settingsButton.current?.focus(); return }
            const o = restore.current; if (!o) return
            restore.current = null; if (origin === o) origin = null
            const el = scroller.current, nodes = [...el.querySelectorAll('li[data-inbox-key]')].filter(n => n.getClientRects().length), byKey = new Map(nodes.map(n => [n.dataset.inboxKey, n]))
            const neighbors = o.order.slice(o.order.indexOf(o.key) + 1).map(k => byKey.get(k)).filter(Boolean)
            const next = byKey.get(o.key) ?? nodes.find(n => n.dataset.root === o.id && n.dataset.area === 'attention') ?? neighbors.find(n => n.dataset.area === o.area) ?? nodes.find(n => n.dataset.area === o.area) ?? nodes.find(n => n.dataset.area === 'attention')
            el.scrollTop = o.offset; const target = next?.querySelector('.dshi-actions button') ?? el.querySelector('h1'); target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: 'nearest' })
          })
          // No idle polling. Refresh the result cache only while the Host has matching work.
          const versions = JSON.stringify(board.updates.filter(r => !r.outcomeId && !r.outcome.file).slice(0, limits.updates).map(r => ({ id: r.id, seq: r.outcome.seq })))
          React.useEffect(() => {
            if (!owner || !ready || versions === '[]' || settings) return
            const ctl = new AbortController(), items = JSON.parse(versions); let timer, reading = false
            const load = async () => {
              if (document.hidden || reading || ctl.signal.aborted) return
              clearTimeout(timer); reading = true
              try { const found = new Map(); let pending = false
                for (let i = 0; i < items.length; i += 64) { const data = await operation('cached', { items: items.slice(i, i + 64) }, ctl.signal); pending ||= data.pending; for (const r of data.items) if (r.result) found.set(JSON.stringify([r.id, r.seq]), r.result) }
                if (!ctl.signal.aborted) { setCache(found); if (pending) timer = setTimeout(load, 8000) }
              } catch { /* Optional service: native facts remain available. */ } finally { reading = false }
            }
            void load(); document.addEventListener('visibilitychange', load); return () => { ctl.abort(); clearTimeout(timer); document.removeEventListener('visibilitychange', load) }
          }, [owner, ready, versions, settings])
          const firstBatch = React.useRef(false)
          const incomplete = [...new Set([...board.verify, ...board.missing])]
          const retrievable = incomplete.filter(id => !['ready', 'migration-required'].includes(list.projectionsBySession[id]?.state))
          const candidates = retrievable.filter(id => !checked.current.has(id))
          const recover = async () => {
            if (inFlight.current) return
            inFlight.current = true; setBusy(true)
            if (!candidates.length) checked.current.clear()
            try {
              for (const id of (candidates.length ? candidates : retrievable).slice(0, 8)) {
                if (!active.current) break
                checked.current.add(id)
                try { await ctx.sessions.refreshProjections(id) } catch { /* Still counted as missing; retry is explicit. */ }
              }
            } finally { inFlight.current = false; if (active.current) setBusy(false) }
          }
          // Opening the panel pays for one small sequential replay batch; never scan all
          // history in the sidebar or keep retrying a denied/unsupported session.
          React.useEffect(() => {
            if (ready && candidates.length && !firstBatch.current) {
              firstBatch.current = true
              void recover()
            }
          })
          const view = (items, section) => h(Rows, { items, section, owner, cache, noPreview, go, say, remember, scroller, limit: limits[section], more: () => setLimits(l => ({ ...l, [section]: l[section] + 24 })) })
          const count = (section, n) => h(React.Fragment, null, t(section), h('span', { className: 'count' }, n))
          return h('main', { className: 'dshi', ref: scroller }, h('style', null, CSS), h('div', { className: 'dshi-body' }, settings && owner ? h(Settings, { rows: board.updates, list, close: () => { setSettings(false); returnSettings.current = true } }) : h(React.Fragment, null,
            h('header', null, h('h1', { tabIndex: -1 }, t('title')), owner && button(t('settings'), () => { nav.current++; setCache(new Map()); setSettings(true) }, 'quiet', { ref: settingsButton })), h('p', { className: 'muted' }, ready && board.attention.length ? t('attention') + ': ' + board.attention.length : t('intro')),
            h('p', { role: 'status' }, notice), ws.state === 'error' && h('p', { role: 'status' }, t('unavailable')),
            !ready ? h('p', { role: 'status' }, t('loading')) : h(React.Fragment, null,
              ...['attention', 'updates'].map(section => { const items = section === 'attention' ? attention : board.updates, shown = items.slice(0, limits[section]); return h('section', { key: section }, h('div', { className: 'dshi-head' }, h('h2', null, count(section, items.length)), section === 'updates' && shown.length > 1 && button(t('seenBatch') + ' (' + shown.length + ')', () => receipts.seenBatch(shown), 'quiet')), items.length ? view(items, section) : h('p', { className: 'muted' }, t(section === 'attention' ? incomplete.length ? 'incomplete' : 'noAttention' : incomplete.length ? 'partialUpdates' : 'noUpdates'))) }),
              ...['working', 'later'].map(section => board[section].length > 0 && h('details', { className: 'fold', key: section, open: folds[section], onToggle: e => { const next = e.currentTarget.open; setFolds(p => p[section] === next ? p : { ...p, [section]: next }) } }, h('summary', null, count(section, board[section].length)), view(board[section], section))),
              incomplete.length > 0 && h('footer', null, board.verify.length > 0 && h('p', null, t('verifying'), board.verify.length),
                board.missing.length > 0 && t('missing') + board.missing.length + ' ', retrievable.length > 0 && button(t(busy ? 'recovering' : candidates.length ? 'recover' : 'retry'), recover, '', { disabled: busy }), !busy && !candidates.length && h('p', null, t(retrievable.length ? 'checked' : 'absent'))),
              (receipts.volatile() || holds.volatile()) && h('footer', null, t('local'))))))
        }
        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: NS + '-return', order: 5, locale: NS }, ReturnLink))
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: NS, locale: NS }, Page))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: NS, order: 18, locale: NS, label: () => t('title') }, Icon))
      },
    }
  },
})
