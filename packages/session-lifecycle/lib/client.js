window.__ModuleLoader__.load({
  id: 'dsh-session-lifecycle',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement
    const NS = 'session-lifecycle'
    const KEY = 'session-lifecycle-outcome'
    const attentionRank = { approval: 3, 'plan-review': 2, question: 1 }
    const WORKING_GRACE_MS = 2000
    const SHELF_LIMIT = 20

    const copy = {
      en: {
        later: 'Deferred questions', laterAction: 'Ask later', custom: 'Choose date and time…', apply: 'Apply', cancel: 'Cancel', returned: 'Recently returned', incomplete: 'Some older sessions still need to be checked.',
        title: 'Triage', intro: 'Only conversations waiting for you count toward the badge.',
        attention: 'Needs you', updates: 'Updates', working: 'Working', snoozed: 'Snoozed', settled: 'Settled',
        noAttention: 'Nothing needs your input right now.', noUpdates: 'No unread turn updates.', loading: 'Loading conversations…',
        question: 'Question for you', approval: 'Approval requested', 'plan-review': 'Plan to review',
        completed: 'Turn ended', error: 'Turn failed', blocked: 'Turn blocked', interrupted: 'Turn interrupted', 'max-tokens': 'Token limit reached', stopped: 'Turn stopped',
        worker: 'Subtask', running: 'Working', queued: 'Continuation queued', seen: 'Mark read', seenBatch: 'Mark shown updates read', more: 'Show more',
        unavailable: 'Workspace state unavailable. Showing the last available data.', syncing: 'Lifecycle shelves are not syncing.', retry: 'Retry',
        settle: 'Settle', unsettle: 'Un-settle', snooze: 'Snooze', wake: 'Wake now', keepActive: 'Never auto-settle', followAuto: 'Allow auto-settle',
        settledToast: 'Settled', unsettledToast: 'Back in the list', snoozedToast: 'Snoozed until {when}', wokeToast: 'Woken', exemptToast: 'Will not auto-settle', followToast: 'Follows the auto-settle setting',
        undo: 'Undo', opFailed: 'Could not update the session', approvalBlocks: 'Answer the approval first',
        hour: 'In 1 hour', hours3: 'In 3 hours', evening: 'This evening', tomorrow: 'Tomorrow', monday: 'Next Monday',
        until: 'Until {when}', settledAuto: 'Auto-settled {when}', settledUser: 'Settled {when}',
        childFailure: 'Subtask reported a problem; no parent conclusion yet.',
        go: 'Open conversation', answer: 'Answer in conversation', scope: 'View approval scope', plan: 'Review plan', file: 'View file', inspect: 'View source',
        back: 'Back to Triage', settings: 'Settings', lifecycle: 'Session shelves',
        autoSettle: 'Auto-settle idle sessions', autoOff: 'Off', days: 'After {n} days', day: 'After 1 day',
        autoHint: 'Idle sessions settle automatically. Pinned, active, snoozed, waiting, and exempt sessions stay put; sending a message brings a settled session back.',
        foldWorking: 'Fold working sessions', foldHint: 'Running sessions move to a collapsed Working section and return when they finish or need you.',
        on: 'On', off: 'Off', saved: 'Saved',
        ai: 'AI summary', basis: 'Source: root assistant reply', route: 'Provider / model', summaryOff: 'Off · status only', disabled: 'Disable automatic summaries', enable: 'Enable for new turns here', trial: 'Try once (may incur a charge)',
        preview: 'Exact excerpt sent to this model', noSample: 'No eligible update selected.', noText: 'Status only for this update; nothing to send.',
        sample: 'Choose a root turn to preview', select: 'Select…', summaries: 'Summaries',
        policy: 'Sends new finished root replies in the chosen directory (runs in the background). Plain text only; daily quota includes trials and resets at 00:00 UTC. Avoid enabling sensitive directories.',
        budget: 'Calls today', saving: 'Working…', active: 'Enabled for', loadError: 'Unavailable or access denied', nativeFile: 'Registered deliverable', retrySettings: 'Reload settings',
        directory: 'Working directory (exact match)', modelIssue: 'Last summary failed; showing session status.', catalogIssue: 'Model list unavailable. You can still disable automatic summaries.',
        missing: 'Older conversations without a summary yet: ', recover: 'Load next batch', recovering: 'Loading history…',
      },
      zh: {
        later: '稍后回答的问题', laterAction: '稍后回答', custom: '选择日期和时间…', apply: '确定', cancel: '取消', returned: '最近返回', incomplete: '部分旧会话仍待核对。',
        title: '待处理', intro: '只有需要你处理的会话才会计入角标。',
        attention: '需要你', updates: '可回看', working: '进行中', snoozed: '已暂缓', settled: '已归置',
        noAttention: '目前没有需要你处理的请求。', noUpdates: '没有未读的轮次更新。', loading: '正在读取会话…',
        question: '有个问题需要你回答', approval: '等待审批', 'plan-review': '等待审阅计划',
        completed: '本轮已结束', error: '本轮出错', blocked: '本轮受阻', interrupted: '本轮中断', 'max-tokens': '达到输出上限', stopped: '本轮停止',
        worker: '子任务', running: '正在工作', queued: '等待继续执行', seen: '标为已读', seenBatch: '将已显示的更新标为已读', more: '显示更多',
        unavailable: '工作区状态暂不可用，先显示最近一次的数据。', syncing: '会话架子未同步。', retry: '重试',
        settle: '归置', unsettle: '取消归置', snooze: '暂缓', wake: '立即唤醒', keepActive: '永不自动归置', followAuto: '允许自动归置',
        settledToast: '已归置', unsettledToast: '已放回列表', snoozedToast: '已暂缓到 {when}', wokeToast: '已唤醒', exemptToast: '不会自动归置', followToast: '按设置自动归置',
        undo: '撤销', opFailed: '更新会话失败', approvalBlocks: '先处理审批再暂缓',
        hour: '1 小时后', hours3: '3 小时后', evening: '今晚', tomorrow: '明天', monday: '下周一',
        until: '{when} 唤醒', settledAuto: '{when} 自动归置', settledUser: '{when} 归置',
        childFailure: '子任务报了错，主会话这边还没出结论。',
        go: '打开会话', answer: '到会话回答', scope: '查看审批范围', plan: '审阅完整计划', file: '查看文件', inspect: '查看原文',
        back: '返回待处理', settings: '设置', lifecycle: '会话架子',
        autoSettle: '自动归置闲置会话', autoOff: '关闭', days: '{n} 天后', day: '1 天后',
        autoHint: '闲置超时后自动归置。置顶、进行中、暂缓、待处理及永不归置的会话除外；发新消息会自动放回列表。',
        foldWorking: '折叠进行中的会话', foldHint: '运行中的会话移进可折叠的「进行中」区，结束、失败或需要你时回到列表。',
        on: '开', off: '关', saved: '已保存',
        ai: 'AI 摘要', basis: '依据：主会话回复原文', route: '供应商 / 模型', summaryOff: '关闭 · 只看会话状态', disabled: '关闭自动摘要', enable: '为此目录的新轮次启用', trial: '试算一次（可能计费）',
        preview: '发给所选模型的原文节选', noSample: '尚未选择可用更新。', noText: '这条只记录了会话状态，没有可发送的正文。',
        sample: '选一条根会话更新看看效果', select: '请选择…', summaries: '摘要',
        policy: '仅发送所选目录内新完成的根会话纯文本回复（后台运行）。试算计入每日额度，UTC 00:00 重置。请勿对敏感目录开启。',
        budget: '今日已用', saving: '处理中…', active: '当前已启用', loadError: '暂不可用或无权访问', nativeFile: '已登记交付物', retrySettings: '重新读取设置',
        directory: '工作目录（仅此目录）', modelIssue: '上次摘要生成失败，当前仅显示会话状态。', catalogIssue: '模型目录暂不可用，仍可关闭自动摘要。',
        missing: '还没生成结果摘要的旧会话：', recover: '再读一批', recovering: '正在读取…',
      },
    }

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

    const valuesOf = (list, row) => list.projectionsBySession[row.id]?.values ?? row.projectionValues ?? {}
    const FAILURES = new Set(['error', 'interrupted', 'blocked', 'max-tokens'])

    function collect({ list, statuses, workspaces, life, now, lastWorking, mainId }) {
      const archived = new Set(workspaces.archivedSessionIds ?? [])
      const pinned = new Set(workspaces.pinnedSessionIds ?? [])
      const records = life.sessions ?? {}
      const groups = new Map(), memo = new Map(), locations = new Map()
      const board = { attention: [], updates: [], working: [], snoozed: [], settled: [], later: [], returned: [], missing: [], verify: [], wake: [], deadline: Infinity }
      for (const ws of workspaces.items ?? []) for (const id of ws.sessionIds) locations.set(id, ws.title || ws.path)
      for (const row of Object.values(list.byId)) {
        const root = owningRoot(row, list.byId, archived, memo)
        if (!root || root.blank || row.formatStatus === 'migration-required' || root.formatStatus === 'migration-required') continue
        let group = groups.get(root.id)
        if (!group) {
          group = {
            id: root.id, title: root.displayTitle || root.id, workspace: locations.get(root.id) || root.cwd || '',
            at: root.updatedAt, children: 0, running: false, queued: false, request: null, outcome: null, target: root.id,
            failures: [], calls: [], holds: [], pendingStartUntil: 0, lastChildEnd: 0, pinned: pinned.has(root.id), current: root.id === mainId, record: records[root.id] ?? null,
          }
          groups.set(root.id, group)
        }
        const status = statuses.get(row.id), values = valuesOf(list, row)
        const running = status?.running ?? row.running
        if (!Object.hasOwn(values, KEY)) board.missing.push(row.id)
        if (row === root) {
          const end = values[KEY]
          group.outcome = end ? { seq: end.seq, time: end.time, reason: end.reason, file: end.file === true } : null
          group.running = running
        } else {
          if (running) group.children++
          const out = values[KEY]
          if (!running && out) group.lastChildEnd = Math.max(group.lastChildEnd, out.time)
          if (!running && out && FAILURES.has(out.reason)) group.failures.push({ id: row.id, title: row.displayTitle || row.id, outcome: { ...out } })
        }
        group.queued ||= Boolean(values.inbox?.['next-turn']?.length)
        const out = values[KEY]
        if (!running && (!out || row.updatedAt > out.time)) group.pendingStartUntil = Math.max(group.pendingStartUntil, row.updatedAt + 120_000)
        for (const request of requestsFor(status, values)) {
          if (!request.verified && !running && list.projectionsBySession[row.id]?.state !== 'ready') { board.verify.push(row.id); continue }
          const call = JSON.stringify([row.id, request.callId])
          if (request.parkable) group.calls.push(call)
          const until = request.parkable && records[row.id]?.holds?.[request.callId]
          if (until > now) { group.holds.push({ request, until, target: row.id, childTitle: row === root ? null : row.displayTitle }); board.deadline = Math.min(board.deadline, until); continue }
          const record = group.record
          if (record?.snoozedUntil > now && request.parkable && record.snoozedCalls?.includes(call)) continue
          if (!group.request || attentionRank[request.kind] > attentionRank[group.request.kind] || (request.kind === group.request.kind && row === root && group.target !== root.id)) {
            group.request = request; group.target = row.id; group.childTitle = row === root ? null : row.displayTitle
          }
        }
      }
      for (const group of groups.values()) {
        const record = group.record
        for (const hold of group.holds) board.later.push({ ...group, ...hold })
        const out = group.outcome
        const failure = group.failures.toSorted((a, b) => b.outcome.time - a.outcome.time)[0]
        const failedAt = Math.max(out && FAILURES.has(out.reason) ? out.time : 0, failure?.outcome.time ?? 0)
        const pending = group.pendingStartUntil > now
        if (pending) board.deadline = Math.min(board.deadline, group.pendingStartUntil)
        const busy = group.running || group.children > 0 || group.queued || pending
        const last = lastWorking.get(group.id)
        if (busy) lastWorking.set(group.id, { busyAt: now })
        else if (last?.busyAt && now - last.busyAt <= 60_000) lastWorking.set(group.id, { until: now + WORKING_GRACE_MS })
        const graceUntil = Math.max(lastWorking.get(group.id)?.until ?? 0, out?.reason === 'completed' ? out.time + WORKING_GRACE_MS : 0)
        const freshChildFailure = failure && failure.outcome.time >= group.at && failure.outcome.time > (out?.time ?? 0) && failure.outcome.seq > (records[failure.id]?.seen ?? -1)
        const working = !freshChildFailure && (busy || (failedAt < (out?.time ?? 1) && graceUntil > now))
        if (!busy && graceUntil > now) board.deadline = Math.min(board.deadline, graceUntil)
        else if (!busy) lastWorking.delete(group.id)
        const snoozed = record?.snoozedUntil > now
        const wakeBy = group.request ? 'question' : failedAt > record?.snoozedAt ? 'failure' : null
        if (snoozed && wakeBy) board.wake.push({ id: group.id, by: wakeBy, snoozedAt: record.snoozedAt })
        if (snoozed) board.deadline = Math.min(board.deadline, record.snoozedUntil)
        if (group.request) { board.attention.push(group); continue }
        if (snoozed && !wakeBy) { board.snoozed.push(group); continue }
        const settled = Boolean(record?.settledAt) && Math.max(group.at, failedAt) <= record.settledAt
        if (settled && !busy) { board.settled.push(group); continue }
        if (working) { if (!group.holds.length) board.working.push(group); continue }
        const returnedAt = Math.max(out?.time ?? 0, group.lastChildEnd, record?.wokeAt ?? 0, record?.keptAt ?? 0, record?.snoozedUntil <= now ? record.snoozedUntil : 0)
        if (returnedAt > now - 86_400_000 && !group.holds.length) {
          board.returned.push({ ...group, returnedAt }); board.deadline = Math.min(board.deadline, returnedAt + 86_400_000)
        }
        if (group.holds.length) continue
        const seen = id => records[id]?.seen ?? -1
        if (failure && (!out || failure.outcome.time > out.time)) {
          if (failure.outcome.seq > seen(failure.id)) board.updates.push({ ...group, outcome: failure.outcome, target: failure.id, outcomeId: failure.id, childTitle: failure.title })
          continue
        }
        if (out && out.seq > seen(group.id)) board.updates.push(group)
      }
      board.returned.sort((a, b) => b.returnedAt - a.returnedAt || a.id.localeCompare(b.id))
      board.later.sort((a, b) => a.until - b.until)
      board.attention.sort((a, b) => attentionRank[b.request.kind] - attentionRank[a.request.kind] || a.at - b.at || a.id.localeCompare(b.id))
      board.updates.sort((a, b) => b.outcome.time - a.outcome.time || a.id.localeCompare(b.id))
      board.working.sort((a, b) => b.at - a.at || a.id.localeCompare(b.id))
      board.snoozed.sort((a, b) => a.record.snoozedUntil - b.record.snoozedUntil || a.id.localeCompare(b.id))
      board.settled.sort((a, b) => b.record.settledAt - a.record.settledAt || a.id.localeCompare(b.id))
      board.missing.sort((a, b) => list.byId[b].updatedAt - list.byId[a].updatedAt || a.localeCompare(b))
      return board
    }

    function hiddenIds(board, foldWorking, returned = true) {
      const ids = []
      for (const g of board.attention) if (!g.pinned) ids.push(g.id)
      for (const section of returned ? ['snoozed', 'settled', 'returned'] : ['snoozed', 'settled']) for (const g of board[section]) if (!g.pinned && (section !== 'returned' || !g.current)) ids.push(g.id)
      if (foldWorking) for (const g of board.working) if (!g.pinned && !g.current) ids.push(g.id)
      return ids.filter(id => /^[\w.:-]+$/.test(id))
    }

    function snoozePresets(now = new Date()) {
      const at = (days, hour) => { const d = new Date(now); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return +d }
      const monday = ((8 - now.getDay()) % 7) || 7
      return [
        { id: 'hour', until: +now + 3_600_000 },
        { id: 'hours3', until: +now + 3 * 3_600_000 },
        { id: 'evening', until: at(0, 18) },
        { id: 'tomorrow', until: at(1, 9) },
        { id: 'monday', until: at(monday, 9) },
      ].filter(p => p.until > +now + 60_000)
    }

    async function postOp(payload) {
      const res = await fetch('session-lifecycle/op', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `HTTP ${res.status}`)
      }
      return res.json()
    }
    async function operation(action, args, signal) {
      const res = await fetch('session-lifecycle/summary', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...args, action }), signal })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'HTTP ' + res.status)
      return res.json()
    }

    function createStore() {
      let state = { status: 'loading', sessions: {}, settings: { autoSettleAfterDays: 7, foldWorking: true } }
      const listeners = new Set()
      return {
        getSnapshot: () => state,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
        set(next) { state = { ...state, ...next }; for (const fn of listeners) fn() },
      }
    }

    const svg = (size, children, extra = {}) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...extra }, ...children)
    const IconShelves = ({ size = 16 }) => svg(size, [h('path', { key: 1, d: 'm3 7 9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4' })])
    const IconSettle = ({ size = 16 }) => svg(size, [h('path', { key: 1, d: 'M4 7h16v12H4zM3 4h18v3H3zM10 11h4' })])
    const IconSnooze = ({ size = 16 }) => svg(size, [h('circle', { key: 1, cx: 12, cy: 13, r: 7 }), h('path', { key: 2, d: 'M12 10v3l2 2M5 4 3 6M19 4l2 2' })])
    const IconWake = ({ size = 16 }) => svg(size, [h('path', { key: 1, d: 'M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4' }), h('circle', { key: 2, cx: 12, cy: 12, r: 4 })])
    const IconChevron = ({ open, size = 14 }) => svg(size, [h('path', { key: 1, d: open ? 'm6 9 6 6 6-6' : 'm9 6 6 6-6 6' })])

    const SIDEBAR_CSS = `
.sl-host:empty{display:none}
.sl-top{margin-bottom:8px;padding-bottom:6px;border-bottom:.5px solid var(--dsw-alias-border-l1,transparent)}
.sl-bottom{margin-top:10px;padding-top:6px;border-top:.5px solid var(--dsw-alias-border-l1,transparent)}
.sl-section+.sl-section{margin-top:4px}
.sl-row{position:relative;display:flex;align-items:center;height:32px;border-radius:var(--dsw-radius-md,8px);border-inline:var(--dsh-sidebar-paint-inset,3px) solid transparent;background-clip:padding-box;box-sizing:border-box;padding:0 8px 0 calc(var(--dsh-sidebar-row-padding,12px) - var(--dsh-sidebar-paint-inset,3px));cursor:pointer;user-select:none;color:var(--dsw-alias-label-secondary)}
.sl-row:focus-visible{outline:none;box-shadow:inset 0 0 0 1.5px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.sl-row.sl-selected{background-color:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.sl-row:hover{background-color:var(--dsw-alias-interactive-bg-hover)}}
.sl-head{font-size:12px;color:var(--dsw-alias-label-tertiary)}
.sl-head .sl-title{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.sl-attn .sl-head .sl-title{color:var(--dsw-alias-state-warn-primary,var(--dsw-alias-label-primary))}
.sl-slot{flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:20px;color:var(--dsw-alias-label-tertiary)}
.sl-title{flex:1;min-width:0;margin:0 6px 0 var(--dsh-sidebar-label-gap,6px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:20px}
.sl-member .sl-title{color:var(--dsw-alias-label-primary)}
.sl-note{flex:none;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.sl-attn .sl-note{color:var(--dsw-alias-state-warn-primary,var(--dsw-alias-label-tertiary))}
.sl-count{font-size:12px;color:var(--dsw-alias-label-tertiary)}
.sl-actions{flex:none;display:none;align-items:center;gap:2px;margin-right:-4px}
@media (hover:hover){.sl-member:hover .sl-actions,.sl-member:focus-within .sl-actions{display:inline-flex}.sl-member:hover .sl-note,.sl-member:focus-within .sl-note{display:none}}
.sl-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.sl-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.sl-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}}
.sl-running{width:6px;height:6px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));animation:sl-pulse 1.4s ease-in-out infinite}
.sl-dot{width:6px;height:6px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-warn-primary)}
.sl-badge{position:absolute;inset-inline-start:65%;top:-.55em;font-size:10px;font-weight:600;padding:0 4px;border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-brand-primary)}
@keyframes sl-pulse{50%{opacity:.35}}
.sl-more{font:inherit;font-size:12px;width:100%;border:0;background:none;text-align:start}
@media (prefers-reduced-motion:reduce){.sl-running{animation:none}}
`

    const PAGE_CSS = `
.sl-page{height:100%;min-width:0;box-sizing:border-box;overflow:auto;container-type:inline-size;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}
.sl-page *{box-sizing:border-box}
.sl-body{max-width:960px;margin:auto;padding:28px clamp(24px,4vw,48px) 64px}
[data-platform=darwin] .sl-body{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.sl-page header,.sl-phead,.sl-pactions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sl-page header,.sl-phead{justify-content:space-between}
.sl-page h1{margin:0;font-size:20px;line-height:28px;font-weight:500}
.sl-page h2,.sl-page summary{font-size:14px;line-height:22px;font-weight:500}
.sl-page h2,.sl-page ul{margin:0}
.sl-page h3{margin:24px 0 4px;font-size:14px;font-weight:500}
.sl-page p{line-height:1.55;margin:5px 0}
.sl-page .muted,.sl-page small,.sl-page footer{color:var(--dsw-alias-label-secondary);font-size:12px}
.sl-page small{display:block;overflow-wrap:anywhere}
.sl-page section,.sl-page details.fold{margin-top:24px}
.sl-page ul{list-style:none;padding:0}
.sl-page li{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:4px 10px;align-items:start;padding:10px 0;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.sl-page li>.symbol{color:var(--dsw-alias-label-tertiary);text-align:center;line-height:22px}
.sl-page li strong{display:block;font-weight:500;line-height:22px;overflow-wrap:anywhere}
.sl-page .count{margin-inline-start:6px;color:var(--dsw-alias-label-tertiary);font-weight:400}
.sl-page button,.sl-page select{font:inherit;font-size:13px;min-height:30px;padding:0 10px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);cursor:pointer}
.sl-page :is(button,select,summary):focus-visible,.sl-back:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.sl-page button:disabled{opacity:.5;cursor:default}
.sl-page button.primary{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}
.sl-page button.quiet{border-color:transparent;background:transparent;color:var(--dsw-alias-label-secondary)}
@media (hover:hover){.sl-page button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.sl-page button.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}.sl-page button.quiet:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.sl-back:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.sl-page label{display:block;margin:14px 0 4px;font-size:13px;color:var(--dsw-alias-label-secondary)}
.sl-page select{width:100%;max-width:520px}
.sl-page blockquote{margin:8px 0;padding-inline-start:12px;border-inline-start:2px solid var(--dsw-alias-border-l2);white-space:pre-wrap;overflow-wrap:anywhere}
.sl-page [role=status]:empty{display:none}
.sl-back{font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);background:transparent;border:0;border-radius:var(--dsw-radius-sm,8px);padding:4px 8px;cursor:pointer}
@media (pointer:coarse){.sl-page select{font-size:16px}}
@container(max-width:620px){.sl-body{padding:20px 20px 48px}[data-platform=darwin] .sl-body{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}.sl-page li{grid-template-columns:20px minmax(0,1fr)}.sl-page li>.sl-pactions{grid-column:2;justify-content:flex-start}}
`

    return {
      inject: ['slots', 'locale', 'sessions', 'layout', 'uiWorkspace', 'uiSession', 'workspaces', 'contextMenus'],
      apply(ctx) {
        for (const [lang, messages] of Object.entries(copy)) ctx.effect(() => ctx.locale.register(NS, lang, messages), `${NS}: ${lang}`)
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = SIDEBAR_CSS + PAGE_CSS
          document.head.append(style)
          return () => style.remove()
        }, `${NS}: styles`)
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, () => String(v)), t(key))
        const fmt = ms => new Intl.DateTimeFormat(ctx.locale.getSnapshot().active, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(ms)
        const store = createStore()
        const lastWorking = new Map()
        let origin = null

        let stream
        const connect = () => {
          stream?.close()
          stream = new EventSource('session-lifecycle/events')
          stream.addEventListener('message', event => {
            try {
              const data = JSON.parse(event.data)
              store.set({ status: 'ready', sessions: data.sessions ?? {}, settings: data.settings ?? store.getSnapshot().settings })
            } catch { store.set({ status: 'error' }) }
          })
          stream.addEventListener('error', () => store.set({ status: 'error' }))
        }
        ctx.effect(() => { connect(); return () => stream.close() }, `${NS}: follow Host state`)

        const notifyFailure = error => ctx.contextMenus.notify(`${t('opFailed')}: ${error?.message ?? error}`, false)
        const recordOf = id => store.getSnapshot().sessions[id] ?? null
        async function change(sessionId, payload, toast) {
          try {
            const { before, after } = await postOp({ ...payload, sessionId })
            ctx.contextMenus.notify(toast, true, { label: t('undo'), failureLabel: t('opFailed'),
              run: () => postOp({ action: 'restore', sessionId, record: before, expected: after }),
            })
          } catch (error) { notifyFailure(error) }
        }
        const settle = id => change(id, { action: 'settle' }, t('settledToast'))
        const unsettle = id => change(id, { action: 'unsettle' }, t('unsettledToast'))
        const wake = id => change(id, { action: 'wake', by: 'user' }, t('wokeToast'))
        const snooze = (id, until, openCalls) => change(id, { action: 'snooze', until, openCalls }, tf('snoozedToast', { when: fmt(until) }))
        const exempt = (id, never) => change(id, { action: 'auto_settle', mode: never ? 'never' : 'follow' }, t(never ? 'exemptToast' : 'followToast'))
        const saveSettings = settings => postOp({ action: 'settings', settings }).catch(notifyFailure)
        const markSeen = async marks => {
          try { for (let i = 0; i < marks.length; i += 200) await postOp({ action: 'seen', marks: marks.slice(i, i + 200) }) }
          catch (error) { notifyFailure(error) }
        }
        const hold = (row, until) => postOp({ action: 'hold', sessionId: row.target, callId: row.request.callId, until }).catch(notifyFailure)

        const status = ctx.uiSession.sessionStatus
        let boardCache = null
        const mainIdOf = list => Object.values(list.byId).find(s => (s.retainedBy?.mainView ?? 0) > 0)?.id
        function currentBoard() {
          const list = ctx.sessions.list.getSnapshot(), statuses = status.getSnapshot(), workspaces = ctx.workspaces.list.getSnapshot(), life = store.getSnapshot()
          const now = Date.now()
          const c = boardCache
          if (c && c.list === list && c.statuses === statuses && c.workspaces === workspaces && c.life === life && now < c.board.deadline && now - c.at < 30_000) return c.board
          const board = collect({ list, statuses, workspaces, life, now, lastWorking, mainId: mainIdOf(list) })
          boardCache = { list, statuses, workspaces, life, board, at: now }
          return board
        }

        const waking = new Set()
        ctx.effect(() => {
          const check = () => {
            if (store.getSnapshot().status !== 'ready') return
            if (ctx.sessions.list.getSnapshot().phase !== 'ready' || ctx.workspaces.list.getSnapshot().phase !== 'ready') return
            for (const { id, by, snoozedAt } of currentBoard().wake) {
              if (waking.has(id)) continue
              waking.add(id)
              postOp({ action: 'wake', sessionId: id, by, snoozedAt }).catch(() => {}).finally(() => waking.delete(id))
            }
          }
          const offs = [store.subscribe(check), status.subscribe(check), ctx.sessions.list.subscribe(check), ctx.workspaces.list.subscribe(check)]
          return () => { for (const off of offs) off() }
        }, `${NS}: wake on request`)

        ctx.effect(() => {
          let source, unbind, sending, visibleId, outcome
          const acknowledge = () => {
            if (!source || !outcome || (recordOf(visibleId)?.seen ?? -1) >= outcome.seq || !document.hasFocus() || document.hidden) return
            if (!source.getSnapshot().entries.some(({ event }) => event.type === 'turn/end' && event.seq === outcome.seq && event.time === outcome.time)) return
            const key = JSON.stringify([visibleId, outcome.seq]); if (sending === key) return
            sending = key; void markSeen([{ sessionId: visibleId, seq: outcome.seq }]).finally(() => { if (sending === key) sending = null })
          }
          const sync = () => {
            const list = ctx.sessions.list.getSnapshot()
            visibleId = !document.hidden && document.hasFocus() && store.getSnapshot().status === 'ready' && ctx.layout.panelInfo.getSnapshot().activePanelId === null ? mainIdOf(list) : null
            const row = list.byId[visibleId], next = row && ctx.sessions.binding(row.id)?.eventSource
            outcome = row && !(status.getSnapshot().get(row.id)?.running ?? row.running) && valuesOf(list, row)[KEY]
            if (source !== next) { unbind?.(); source = next; unbind = source?.subscribe(acknowledge) }
            acknowledge()
          }
          const offs = [ctx.sessions.list.subscribe(sync), ctx.layout.panelInfo.subscribe(sync), store.subscribe(sync), status.subscribe(sync)]
          window.addEventListener('focus', sync); window.addEventListener('blur', sync); document.addEventListener('visibilitychange', sync); sync()
          return () => { unbind?.(); for (const off of offs) off(); window.removeEventListener('focus', sync); window.removeEventListener('blur', sync); document.removeEventListener('visibilitychange', sync) }
        }, `${NS}: read marks`)

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
              if (!idle(id)) continue
              try { await ctx.sessions.refreshProjections(id) } catch {}
            }
          } finally { verifying = false }
        }

        ctx.effect(() => ctx.contextMenus.register({
          id: NS,
          target: 'session',
          order: 160,
          observe: () => [store, ctx.locale, status, ctx.sessions.list, ctx.workspaces.list],
          resolve: ({ sessionId }) => {
            const list = ctx.sessions.list.getSnapshot(), row = list.byId[sessionId]
            if (!row || row.origin === 'subagent' || row.blank || ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(sessionId) || store.getSnapshot().status !== 'ready') return []
            const record = recordOf(sessionId), now = Date.now()
            const board = currentBoard()
            const group = [...board.attention, ...board.snoozed, ...board.settled, ...board.working].find(g => g.id === sessionId)
            const actions = []
            const isSettled = Boolean(record?.settledAt) && !(row.updatedAt > record.settledAt)
            if (record?.snoozedUntil > now) actions.push({ id: 'wake', label: t('wake'), icon: { key: `${NS}.wake` }, separatorBefore: true, failureLabel: t('opFailed'), run: () => wake(sessionId) })
            else {
              const approval = group?.request && !group.request.parkable
              actions.push({
                id: 'snooze', label: t('snooze'), icon: { key: `${NS}.snooze` }, separatorBefore: true,
                ...(approval ? { disabled: true, label: `${t('snooze')} · ${t('approvalBlocks')}` } : {}),
                children: approval ? undefined : snoozePresets().map(p => ({
                  id: p.id, label: `${t(p.id)} · ${fmt(p.until)}`, failureLabel: t('opFailed'),
                  run: () => snooze(sessionId, p.until, group?.calls ?? []),
                })).concat({ id: 'custom', label: t('custom'), run: () => chooseTime(until => snooze(sessionId, until, group?.calls ?? [])) }),
              })
            }
            actions.push(isSettled
              ? { id: 'unsettle', label: t('unsettle'), icon: { key: `${NS}.settle` }, failureLabel: t('opFailed'), run: () => unsettle(sessionId) }
              : { id: 'settle', disabled: !!group?.request || board.working.some(g => g.id === sessionId), label: t('settle'), icon: { key: `${NS}.settle` }, failureLabel: t('opFailed'), run: () => settle(sessionId) })
            const never = record?.autoSettle === 'never'
            actions.push({ id: 'auto', label: never ? t('followAuto') : t('keepActive'), failureLabel: t('opFailed'), run: () => exempt(sessionId, !never) })
            return actions
          },
        }), `${NS}: session menu`)
        for (const [key, MenuIcon] of [[`${NS}.settle`, IconSettle], [`${NS}.snooze`, IconSnooze], [`${NS}.wake`, IconWake]]) {
          ctx.slots.inject('contextMenu.icon', () => ctx.slots.register({ name: 'contextMenu.icon', key }, () => h(MenuIcon, { size: 16 })))
        }

        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const useLife = () => React.useSyncExternalStore(store.subscribe, store.getSnapshot)
        const useList = () => React.useSyncExternalStore(fn => ctx.sessions.list.subscribe(fn), () => ctx.sessions.list.getSnapshot())
        const useStatus = () => React.useSyncExternalStore(fn => status.subscribe(fn), () => status.getSnapshot())
        const useWorkspaces = () => React.useSyncExternalStore(fn => ctx.workspaces.list.subscribe(fn), () => ctx.workspaces.list.getSnapshot())
        function useBoard() {
          const list = useList(), statuses = useStatus(), workspaces = useWorkspaces(), life = useLife()
          const [tick, bump] = React.useReducer(n => n + 1, 0)
          const board = React.useMemo(() => collect({ list, statuses, workspaces, life, now: Date.now(), lastWorking, mainId: mainIdOf(list) }), [list, statuses, workspaces, life, tick])
          React.useEffect(() => {
            if (!Number.isFinite(board.deadline)) return undefined
            const timer = setTimeout(bump, Math.min(2 ** 31 - 1, Math.max(50, board.deadline - Date.now() + 20)))
            return () => clearTimeout(timer)
          }, [board.deadline])
          const ready = list.phase === 'ready' && workspaces.phase === 'ready' && life.status !== 'loading'
          React.useEffect(() => { if (ready && board.verify.length) void verifyQuestions(board.verify) }, [ready, board.verify])
          return { board, ready, list, workspaces, life }
        }

        function useListArea() {
          const [found, setFound] = React.useState({ area: null, suspended: true, manual: false })
          React.useEffect(() => {
            let frame = 0
            const check = () => {
              frame = 0
              const area = document.querySelector('[data-sidebar-list-area]')
              const input = document.querySelector('[data-sidebar-workspace-header] input')
              // external: DSH workspace view order is only exposed via localStorage dsh.workspace.view.v5
              let view
              try { view = JSON.parse(localStorage.getItem('dsh.workspace.view.v5')) } catch {}
              const suspended = !input || Boolean(input.value.trim()) || view?.archivedFilter === 'only'
              const manual = view?.orderBy === 'manual'
              setFound(prev => prev.area === area && prev.suspended === suspended && prev.manual === manual ? prev : { area, suspended, manual })
            }
            const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
            check()
            const observer = new MutationObserver(schedule)
            observer.observe(document.body, { childList: true, subtree: true })
            document.addEventListener('input', schedule, true); window.addEventListener('storage', schedule)
            return () => { observer.disconnect(); window.removeEventListener('storage', schedule); document.removeEventListener('input', schedule, true); if (frame) cancelAnimationFrame(frame) }
          }, [])
          return found
        }
        function usePlacement(area, el, where) {
          React.useLayoutEffect(() => {
            if (!area) return undefined
            const place = () => {
              if (where === 'end') { if (area.lastElementChild !== el) area.appendChild(el); return }
              const groups = area.querySelector(':scope > .sgs-host')
              const placed = groups ? el.previousSibling === groups : area.firstChild === el
              if (!placed) area.insertBefore(el, groups ? groups.nextSibling : area.firstChild)
            }
            place()
            const observer = new MutationObserver(place)
            observer.observe(area, { childList: true })
            return () => { observer.disconnect(); el.remove() }
          }, [area, el, where])
        }
        const folds = (() => {
          const KEY_FOLDS = 'dsh-session-lifecycle:open'
          let open
          try { open = JSON.parse(localStorage.getItem(KEY_FOLDS) ?? 'null') } catch { open = null }
          let value = { attention: true, returned: true, working: false, snoozed: false, settled: false, ...(open && typeof open === 'object' ? open : {}) }
          const listeners = new Set()
          return {
            getSnapshot: () => value,
            subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
            toggle(section) {
              value = { ...value, [section]: !value[section] }
              try { localStorage.setItem(KEY_FOLDS, JSON.stringify(value)) } catch {}
              for (const fn of listeners) fn()
            },
          }
        })()

        const noteFor = (section, g) => {
          if (section === 'returned') return fmt(g.returnedAt)
          if (section === 'attention') return [t(g.request.kind), g.childTitle].filter(Boolean).join(' · ')
          if (section === 'snoozed') return tf('until', { when: fmt(g.record.snoozedUntil) })
          if (section === 'settled') return tf(g.record.settledBy === 'auto' ? 'settledAuto' : 'settledUser', { when: fmt(g.record.settledAt) })
          if (section === 'working') return g.queued && !g.running ? t('queued') : g.children ? `${t('worker')} × ${g.children}` : ''
          return ''
        }
        function SidebarMember({ g, section, selectedId }) {
          const open = () => ctx.uiWorkspace.openSession(section === 'attention' ? g.target : g.id)
          const stop = fn => e => { e.preventDefault(); e.stopPropagation(); fn() }
          const action = section === 'snoozed' ? ['wake', IconWake, () => wake(g.id)]
            : section === 'settled' ? ['unsettle', IconWake, () => unsettle(g.id)]
              : section === 'returned' ? ['settle', IconSettle, () => settle(g.id)] : null
          return h('div', {
            className: `sl-row sl-member${selectedId === g.id || selectedId === g.target ? ' sl-selected' : ''}`,
            role: 'treeitem', tabIndex: 0, title: g.title, 'data-session-id': g.id,
            draggable: true,
            onDragStart: e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', g.id) },
            onClick: open,
            onKeyDown: e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); open() } },
            onContextMenu: e => { e.preventDefault(); e.stopPropagation(); ctx.contextMenus.open({ kind: 'session', value: { sessionId: g.id, displayTitle: g.title } }, { x: e.clientX, y: e.clientY }) },
          },
          h('span', { className: 'sl-slot' }, section === 'working' ? h('span', { className: 'sl-running', 'aria-hidden': true }) : section === 'attention' ? h('span', { className: 'sl-dot', 'aria-hidden': true }) : null),
          h('span', { className: 'sl-title' }, g.title),
          h('span', { className: 'sl-note' }, noteFor(section, g)),
          action && h('span', { className: 'sl-actions' }, h('button', { type: 'button', className: 'sl-btn', tabIndex: -1, title: t(action[0]), 'aria-label': `${t(action[0])}: ${g.title}`, onClick: stop(action[2]) }, h(action[1], { size: 14 }))))
        }
        function SidebarSection({ section, items, selectedId }) {
          useLocale()
          const open = React.useSyncExternalStore(folds.subscribe, folds.getSnapshot)[section]
          const [limit, setLimit] = React.useState(section === 'returned' ? 5 : SHELF_LIMIT)
          if (!items.length) return null
          return h('div', { className: `sl-section sl-${section === 'attention' ? 'attn' : section}`, role: 'group', 'aria-label': t(section) },
            h('div', { className: 'sl-row sl-head', role: 'button', tabIndex: 0, 'aria-expanded': open, onClick: () => folds.toggle(section), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); folds.toggle(section) } } },
              h('span', { className: 'sl-slot' }, h(IconChevron, { open })),
              h('span', { className: 'sl-title' }, t(section)),
              h('span', { className: 'sl-count' }, items.length)),
            open && items.slice(0, limit).map(g => h(SidebarMember, { key: g.id, g, section, selectedId })),
            open && items.length > limit && h('button', { type: 'button', className: 'sl-row sl-more', onClick: () => setLimit(n => n + SHELF_LIMIT) }, h('span', { className: 'sl-slot' }), h('span', { className: 'sl-title' }, t('more'))))
        }
        const picker = createStore()
        const chooseTime = choose => picker.set({ choose })
        function TimePicker() {
          useLocale()
          const { choose } = React.useSyncExternalStore(picker.subscribe, picker.getSnapshot)
          const ref = React.useRef(null), input = React.useRef(null)
          React.useEffect(() => { if (choose) ref.current?.showModal() }, [choose])
          if (!choose) return null
          const close = () => picker.set({ choose: null })
          return h('dialog', { ref, 'aria-label': t('custom'), onCancel: close, onClose: close },
            h('form', { onSubmit: e => { e.preventDefault(); const until = new Date(input.current.value).getTime(); if (until > Date.now()) { close(); choose(until) } else { input.current.setCustomValidity(t('custom')); input.current.reportValidity() } } },
              h('label', null, t('custom'), ' ', h('input', { type: 'datetime-local', required: true, ref: input, onInput: e => e.currentTarget.setCustomValidity('') })),
              h('button', { type: 'submit' }, t('apply')), h('button', { type: 'button', onClick: close }, t('cancel'))))
        }
        function SidebarShelves() {
          useLocale()
          const { area, suspended, manual } = useListArea()
          const { board, ready, life, list } = useBoard()
          const top = React.useMemo(() => { const el = document.createElement('div'); el.className = 'sl-host sl-top'; return el }, [])
          const bottom = React.useMemo(() => { const el = document.createElement('div'); el.className = 'sl-host sl-bottom'; return el }, [])
          usePlacement(area, top, 'start')
          usePlacement(area, bottom, 'end')
          if (!area || !ready || life.status !== 'ready' || suspended) return null
          const foldWorking = life.settings?.foldWorking !== false
          const hidden = hiddenIds(board, foldWorking, !manual)
          const hideCss = hidden.length === 0 ? '' : `${hidden.map(id => `[data-sidebar-list-area] :is([data-row-key="session:${id}"],[data-group-session-id="${id}"])`).join(',')}{display:none!important}`
          const selectedId = mainIdOf(list)
          const attention = board.attention.filter(g => !g.pinned)
          const working = foldWorking ? board.working.filter(g => !g.pinned && !g.current) : []
          return h(React.Fragment, null,
            hideCss && h('style', null, hideCss),
            ReactDOM.createPortal(h(React.Fragment, null,
              h(SidebarSection, { section: 'attention', items: attention, selectedId }),
              h(SidebarSection, { section: 'working', items: working, selectedId }),
              !manual && h(SidebarSection, { section: 'returned', items: board.returned.filter(g => !g.pinned && !g.current), selectedId })), top),
            ReactDOM.createPortal(h(React.Fragment, null,
              h(SidebarSection, { section: 'snoozed', items: board.snoozed.filter(g => !g.pinned), selectedId }),
              h(SidebarSection, { section: 'settled', items: board.settled.filter(g => !g.pinned), selectedId })), bottom))
        }
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: `${NS}-sidebar`, order: 1010 }, () => h(React.Fragment, null, h(SidebarShelves), h(TimePicker))))

        const button = (label, onClick, kind = '', extra = {}) => h('button', { type: 'button', onClick, className: kind, ...extra }, label)
        const option = (value, label) => h('option', { key: value, value }, label)
        const filePart = s => encodeURIComponent(s).replace(/%3A/gi, ':')
        const fileAddress = (id, path) => `dsh-resource://file/session/${filePart(id)}/${path.replace(/\\/g, '/').split('/').map(filePart).join('/')}`
        const keyFor = row => JSON.stringify([row.id, row.target, row.request?.callId ?? row.request?.kind ?? row.outcome?.seq ?? null])

        function Icon({ size = 18 }) {
          const { board, ready } = useBoard()
          const count = ready ? board.attention.length : 0
          return h('span', { style: { position: 'relative', display: 'inline-flex' } }, h(IconShelves, { size }),
            count > 0 && h('span', { className: 'sl-badge', title: `${t('attention')}: ${count}` }, count > 99 ? '99+' : count))
        }

        function LifecycleSettings({ life }) {
          const settings = life.settings ?? {}
          const days = settings.autoSettleAfterDays
          return h('section', null, h('h2', null, t('lifecycle')),
            h('label', { htmlFor: 'sl-auto' }, t('autoSettle')),
            h('select', { id: 'sl-auto', value: days === null ? 'off' : String(days), onChange: e => saveSettings({ autoSettleAfterDays: e.target.value === 'off' ? null : Number(e.target.value) }) },
              option('off', t('autoOff')), ...[1, 3, 7, 14, 30, 90].map(n => option(String(n), n === 1 ? t('day') : tf('days', { n })))),
            h('p', { className: 'muted' }, t('autoHint')),
            h('label', { htmlFor: 'sl-fold' }, t('foldWorking')),
            h('select', { id: 'sl-fold', value: settings.foldWorking === false ? 'off' : 'on', onChange: e => saveSettings({ foldWorking: e.target.value === 'on' }) }, option('on', t('on')), option('off', t('off'))),
            h('p', { className: 'muted' }, t('foldHint')))
        }

        function SummarySettings({ rows, list }) {
          const [data, setData] = React.useState(null), [choice, choose] = React.useState(''), [sample, pick] = React.useState('')
          const [cwd, setCwd] = React.useState('')
          const dirs = [...new Set(Object.values(list.byId).filter(r => r.origin !== 'subagent' && !r.blank && r.cwd).map(r => r.cwd))].toSorted()
          const [src, setSrc] = React.useState(null), [result, setResult] = React.useState(null), [busy, setBusy] = React.useState(false), [notice, say] = React.useState('')
          const [reload, refresh] = React.useReducer(n => n + 1, 0), active = React.useRef(null), lock = React.useRef(false)
          React.useEffect(() => { const ctl = new AbortController(); active.current = ctl; return () => ctl.abort() }, [])
          React.useEffect(() => { const ctl = new AbortController(); operation('settings', {}, ctl.signal).then(value => { if (!ctl.signal.aborted) { setData(value); setCwd(value.state.cwd || ''); choose(value.state.route ? JSON.stringify(value.state.route) : '') } }).catch(e => { if (!ctl.signal.aborted) say(`${t('loadError')}: ${e.message}`) }); return () => ctl.abort() }, [reload])
          React.useEffect(() => { const ctl = new AbortController(); setResult(null); setSrc(null); if (sample) { const [id, seq] = JSON.parse(sample); operation('source', { id, seq }, ctl.signal).then(s => { if (!ctl.signal.aborted) setSrc({ ...s, sample }) }).catch(e => { if (!ctl.signal.aborted) say(e.message) }) } return () => ctl.abort() }, [sample])
          const current = src?.sample === sample ? src : null
          const run = async action => {
            if (lock.current || !data) return
            const route = choice && JSON.parse(choice), [id, seq] = sample ? JSON.parse(sample) : []
            lock.current = true; setBusy(true); say(''); setResult(null)
            try {
              const v = await operation(action, { id, seq, route, cwd, lines: action === 'trial' ? current?.lines : undefined }, active.current.signal)
              if (active.current.signal.aborted) return
              if (action === 'trial') setResult(v)
              else { setData({ ...data, state: v }); if (action === 'disable') choose(''); say(t('saved')) }
            } catch (e) { if (!active.current.signal.aborted) say(e.message) } finally {
              if (action === 'trial' && !active.current.signal.aborted) { try { const next = await operation('settings', {}, active.current.signal); if (!active.current.signal.aborted) setData(next) } catch {} }
              lock.current = false; if (!active.current.signal.aborted) setBusy(false)
            }
          }
          const state = data?.state, choices = rows.filter(r => !r.outcomeId && list.byId[r.id]?.cwd === cwd).map(r => [JSON.stringify([r.id, r.outcome.seq]), r.title])
          return h('section', null, h('h2', null, t('summaries')),
            h('p', { className: 'muted' }, t('policy')), state && h('p', null, state.route ? `${t('active')}: ${state.route.provider} / ${state.route.model} · ${state.cwd}` : t('summaryOff')),
            state && h('small', null, `${t('budget')}: ${state.spent} / ${state.limit} (UTC)`), state?.lastIssue && h('small', null, t('modelIssue')), data?.catalogUnavailable && h('small', null, t('catalogIssue')),
            !data ? button(t('retrySettings'), refresh) : h(React.Fragment, null,
              h('label', { htmlFor: 'sl-route' }, t('route')), h('select', { id: 'sl-route', value: choice, disabled: busy, onChange: e => { choose(e.target.value); setResult(null); say('') } }, option('', t('select')), data.groups.flatMap(g => g.models.map(m => option(JSON.stringify({ provider: g.id, model: m }), `${g.id} / ${m}`)))),
              h('label', { htmlFor: 'sl-dir' }, t('directory')), h('select', { id: 'sl-dir', value: cwd, disabled: busy, onChange: e => { setCwd(e.target.value); pick(''); setResult(null); say('') } }, option('', t('select')), [...new Set([...(cwd ? [cwd] : []), ...dirs])].map(dir => option(dir, dir))),
              h('label', { htmlFor: 'sl-sample' }, t('sample')), h('select', { id: 'sl-sample', value: sample, disabled: busy, onChange: e => { pick(e.target.value); say('') } }, option('', t('select')), choices.map(([v, l]) => option(v, l))),
              current ? h('div', null, h('small', null, current.cwd), h('p', null, current.eligible ? t('preview') : t('noText')), current.eligible && h('blockquote', null, current.lines.join('\n'))) : h('p', { className: 'muted' }, t(sample ? 'loading' : 'noSample')),
              h('div', { className: 'sl-pactions' }, button(t('trial'), () => run('trial'), '', { disabled: busy || !choice || !current?.eligible || state.spent >= state.limit }), button(t('enable'), () => run('enable'), 'primary', { disabled: busy || !choice || !cwd }), state.route && button(t('disabled'), () => run('disable'), 'quiet', { disabled: busy }))),
            result && h('blockquote', null, `${t('ai')} · ${result.route.model}\n${result.quotes.join('\n')}`), h('p', { role: 'status' }, busy ? t('saving') : notice))
        }

        function ReturnLink(props) {
          useLocale()
          const [error, setError] = React.useState(''), here = origin?.target === props.sessionId ? origin : null
          const openFile = () => { if (origin !== here || !here?.file) return; try { ctx.get('sidebarRight').openResource(fileAddress(props.sessionId, here.file.path)); here.file = null; setError('') } catch (e) { setError(e.message) } }
          React.useEffect(() => { if (here?.file && !here.attempted) { here.attempted = true; openFile() } }, [here])
          if (!here) return null
          return h(React.Fragment, null,
            button(t('back'), () => { if (origin === here) ctx.layout.selectPanel(NS) }, 'sl-back'), error && here.file && button(t('file'), openFile, 'sl-back', { title: error }))
        }

        function Evidence({ row, go }) {
          const [open, show] = React.useState(false), [source, set] = React.useState(null), [error, fail] = React.useState('')
          React.useEffect(() => { if (!open) return undefined; const ctl = new AbortController(); fail(''); operation('source', { id: row.id, seq: row.outcome.seq }, ctl.signal).then(s => { if (!ctl.signal.aborted) set(s) }).catch(e => { if (!ctl.signal.aborted) fail(e.message) }); return () => ctl.abort() }, [open, row.id, row.outcome.seq])
          return h('details', { className: 'source', open, onToggle: e => show(e.currentTarget.open) }, h('summary', null, t('basis')),
            open && h(React.Fragment, null, source && h('small', null, row.title + ' · #' + source.sourceSeq), source && h('blockquote', null, source.lines.join('\n')), !source && h('small', null, error || t('loading')), button(t('inspect'), () => go(row), 'quiet')))
        }

        function Rows({ items, section, limit, more, owner, editable, cache, go, noPreview }) {
          const shown = items.slice(0, limit)
          return h(React.Fragment, null, h('ul', null, shown.map(row => {
            const update = section === 'updates', r = row.request, child = Boolean(row.outcomeId)
            const reason = r?.kind ?? (update ? row.outcome.reason : section === 'working' ? (row.queued && !row.running ? 'queued' : 'running') : null)
            const file = owner && update && !child && row.outcome.file && keyFor(row) !== noPreview && Boolean(ctx.get('sidebarRight'))
            const ai = owner && update && !child ? cache.get(JSON.stringify([row.id, row.outcome.seq])) : null
            const title = r?.detail || row.title
            const note = [reason && t(reason), r?.detail ? row.title : '', row.childTitle, row.workspace, update ? fmt(row.outcome.time) : null,
              section === 'snoozed' || section === 'settled' ? noteFor(section, row) : section === 'later' ? tf('until', { when: fmt(row.until) }) : null, row.children ? `${t('worker')} × ${row.children}` : null].filter(Boolean).join(' · ')
            const label = file ? 'file' : r?.kind === 'approval' ? 'scope' : r?.kind === 'plan-review' ? 'plan' : r ? 'answer' : update ? 'inspect' : 'go'
            return h('li', { key: keyFor(row), 'data-triage-key': keyFor(row), 'data-area': section, 'data-root': row.id }, h('span', { className: 'symbol', 'aria-hidden': true }, r ? (r.kind === 'question' ? '?' : '◇') : child ? '!' : file ? '▤' : '·'),
              h('div', { className: 'text' }, h('strong', null, title), h('small', null, note), child && h('p', { className: 'muted' }, t('childFailure')), file && h('small', null, t('nativeFile')),
                ai && h('div', null, h('small', null, t('ai') + ' · ' + ai.route.model), h('p', null, ai.quotes.join(' ')), h(Evidence, { row, go }))),
              h('div', { className: 'sl-pactions' },
                button(t(label), () => go(row, file), section === 'attention' ? 'primary' : ''),
                editable && update && button(t('seen'), () => markSeen([{ sessionId: row.outcomeId ?? row.id, seq: row.outcome.seq }]), 'quiet', { 'aria-label': `${t('seen')}: ${row.title}` }),
                section === 'snoozed' && button(t('wake'), () => wake(row.id), 'quiet'),
                section === 'settled' && button(t('unsettle'), () => unsettle(row.id), 'quiet'),
                editable && section === 'updates' && button(t('settle'), () => settle(row.id), 'quiet'),
                editable && section === 'later' && button(t('wake'), () => hold(row, 0), 'quiet'),
                editable && section === 'attention' && r?.parkable && h('select', { value: '', 'aria-label': t('laterAction'), onChange: e => {
                  const value = e.target.value; if (value === 'custom') chooseTime(until => hold(row, until)); else if (+value > Date.now()) void hold(row, +value)
                } }, option('', t('laterAction')), ...snoozePresets().map(p => option(String(p.until), t(p.id))), option('custom', t('custom')))))
          })), items.length > limit && button(t('more'), more, 'quiet'))
        }

        function Page(props) {
          useLocale()
          const { board, ready, workspaces, list, life } = useBoard()
          // external: DSH has no direct owner-role hook; pluginManager/listPlugins is owner-only
          const owner = props.useRemoteAccess?.('pluginManager/listPlugins')
          const [view, setView] = React.useState('board'), [notice, say] = React.useState(''), [cache, setCache] = React.useState(new Map())
          const [limits, setLimits] = React.useState(() => origin?.limits ?? { attention: 16, updates: 16, working: 16, snoozed: 16, settled: 16, later: 16 })
          const [open, setOpen] = React.useState(() => origin?.open ?? { working: false, snoozed: false, settled: false, later: false })
          const [busy, setBusy] = React.useState(false)
          const checked = React.useRef(new Set()), alive = React.useRef(true)
          React.useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
          const [noPreview, setNoPreview] = React.useState(null)
          const scroller = React.useRef(null), restore = React.useRef(origin), nav = React.useRef(0)
          const visibleRows = () => [...(scroller.current?.querySelectorAll('li[data-triage-key]') ?? [])].filter(n => n.getClientRects().length)
          React.useLayoutEffect(() => {
            const saved = restore.current
            if (!ready || !saved || !scroller.current) return
            restore.current = null; if (origin === saved) origin = null
            const nodes = visibleRows(), byKey = new Map(nodes.map(n => [n.dataset.triageKey, n]))
            const row = byKey.get(saved.key) ?? nodes.find(n => n.dataset.root === saved.id) ?? saved.neighbors.map(k => byKey.get(k)).find(Boolean)
            scroller.current.scrollTop = saved.offset
            const target = row?.querySelector('button') ?? scroller.current.querySelector('h1'); target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: 'nearest' })
          })
          const go = async (row, file) => {
            const keys = visibleRows().map(node => node.dataset.triageKey), key = keyFor(row), request = ++nav.current
            const saved = { target: row.target, key, id: row.id, offset: scroller.current?.scrollTop ?? 0, neighbors: keys.slice(keys.indexOf(key) + 1), limits, open }
            try {
              if (file) { const src = await operation('source', { id: row.id, seq: row.outcome.seq }); if (!src.artifact) throw new Error(t('loadError')); saved.file = src.artifact }
              if (request !== nav.current || !alive.current || ctx.layout.panelInfo.getSnapshot().activePanelId !== NS) return
              origin = saved; ctx.uiWorkspace.openSession(row.target)
            } catch (e) { if (alive.current && request === nav.current) { say(e.message); if (file) setNoPreview(key) } }
          }
          const versions = JSON.stringify(board.updates.filter(r => !r.outcomeId && !r.outcome.file).slice(0, limits.updates).map(r => ({ id: r.id, seq: r.outcome.seq })))
          React.useEffect(() => {
            if (!owner || !ready || versions === '[]' || view !== 'board') return undefined
            const ctl = new AbortController(), items = JSON.parse(versions); let timer, reading = false
            const load = async () => {
              if (document.hidden || reading || ctl.signal.aborted) return
              clearTimeout(timer); reading = true
              try {
                const found = new Map(); let pending = false
                for (let i = 0; i < items.length; i += 64) { const data = await operation('cached', { items: items.slice(i, i + 64) }, ctl.signal); pending ||= data.pending; for (const r of data.items) if (r.result) found.set(JSON.stringify([r.id, r.seq]), r.result) }
                if (!ctl.signal.aborted) { setCache(found); if (pending) timer = setTimeout(load, 8000) }
              } catch {} finally { reading = false }
            }
            void load(); document.addEventListener('visibilitychange', load)
            return () => { ctl.abort(); clearTimeout(timer); document.removeEventListener('visibilitychange', load) }
          }, [owner, ready, versions, view])
          const incomplete = [...new Set([...board.verify, ...board.missing])]
          const retrievable = incomplete.filter(id => !['ready', 'migration-required'].includes(list.projectionsBySession[id]?.state))
          const candidates = retrievable.filter(id => !checked.current.has(id))
          const recover = async () => {
            if (busy) return
            setBusy(true)
            if (!candidates.length) checked.current.clear()
            try {
              for (const id of (candidates.length ? candidates : retrievable).slice(0, 8)) {
                if (!alive.current) break
                checked.current.add(id)
                try { await ctx.sessions.refreshProjections(id) } catch {}
              }
            } finally { if (alive.current) setBusy(false) }
          }
          const firstBatch = React.useRef(false)
          React.useEffect(() => { if (ready && candidates.length && !firstBatch.current) { firstBatch.current = true; void recover() } })
          const editable = life.status === 'ready'
          const rows = (items, section) => h(Rows, { items, section, owner, editable, cache, go, noPreview, limit: limits[section], more: () => setLimits(l => ({ ...l, [section]: l[section] + 24 })) })
          const count = (section, n) => h(React.Fragment, null, t(section), h('span', { className: 'count' }, n))
          const shownUpdates = board.updates.slice(0, limits.updates)
          return h('main', { className: 'sl-page', ref: scroller }, h('div', { className: 'sl-body' },
            view === 'settings' ? h(React.Fragment, null,
              h('header', null, h('h1', null, t('settings')), button(t('back'), () => setView('board'), 'quiet')),
              editable && h(LifecycleSettings, { life }),
              owner && h(SummarySettings, { rows: board.updates, list })) : h(React.Fragment, null,
              h('header', null, h('h1', { tabIndex: -1 }, t('title')), owner && button(t('settings'), () => { nav.current++; setCache(new Map()); setView('settings') }, 'quiet')),
              h('p', { className: 'muted' }, ready && board.attention.length ? `${t('attention')}: ${board.attention.length}` : t('intro')),
              h('p', { role: 'status' }, notice),
              workspaces.state === 'error' && h('p', { role: 'status' }, t('unavailable')),
              life.status === 'error' && h('p', { role: 'status' }, t('syncing'), ' ', button(t('retry'), connect, 'quiet')),
              !ready ? h('p', { role: 'status' }, t('loading')) : h(React.Fragment, null,
                h('section', null, h('div', { className: 'sl-phead' }, h('h2', null, count('attention', board.attention.length))),
                  board.attention.length ? rows(board.attention, 'attention') : h('p', { className: 'muted' }, t(incomplete.length ? 'incomplete' : 'noAttention'))),
                h('section', null, h('div', { className: 'sl-phead' }, h('h2', null, count('updates', board.updates.length)),
                  editable && shownUpdates.length > 1 && button(`${t('seenBatch')} (${shownUpdates.length})`, () => markSeen(shownUpdates.map(r => ({ sessionId: r.outcomeId ?? r.id, seq: r.outcome.seq }))), 'quiet')),
                  board.updates.length ? rows(board.updates, 'updates') : h('p', { className: 'muted' }, t('noUpdates'))),
                ...['working', 'later', 'snoozed', 'settled'].map(section => board[section].length > 0 && h('details', {
                  className: 'fold', key: section, open: open[section],
                  onToggle: e => { const next = e.currentTarget.open; setOpen(p => p[section] === next ? p : { ...p, [section]: next }) },
                }, h('summary', null, count(section, board[section].length)), rows(board[section], section))),
                retrievable.length > 0 && h('footer', null, t('missing') + retrievable.length + ' ', button(t(busy ? 'recovering' : 'recover'), recover, '', { disabled: busy }))))))
        }

        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: `${NS}-return`, order: 5, locale: NS }, ReturnLink))
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: NS, locale: NS }, Page))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: NS, order: 18, locale: NS, label: () => t('title') }, Icon))
      },
      _internal: { collect, hiddenIds, snoozePresets, owningRoot, requestsFor },
    }
  },
})
