/**
 * dsh-orbit-bridge — browser half.
 *
 * An "Orbit bridge" launcher in the sidebar panel list opens a main panel that
 * shows each routine (rule card), its recent runs (result cards), errors, and
 * the unreviewed Schedule draft. Every change goes to the Host over
 * `orbit-bridge/op`; the page reloads `orbit-bridge/state` after each change
 * and every 15 seconds while it is open.
 */
window.__ModuleLoader__.load({
  id: 'dsh-orbit-bridge',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'orbit-bridge'
    const PANEL_ID = 'orbit-bridge'
    const POLL_MS = 15_000

    const EN = {
      panel: 'Orbit bridge',
      intro: 'Read-only watch over Orbit projects. Reports new, changed, and missing tasks since the last check (due-date and staleness rules are not supported yet).',
      newRoutine: 'New routine',
      empty: 'No routines yet.',
      title: 'Name',
      projects: 'Orbit project ids (comma separated)',
      server: 'MCP server name',
      rrule: 'Schedule RRULE (optional, draft only)',
      target: 'Schedule target',
      preset: 'Restricted agent preset (draft only)',
      cwd: 'Session directory (optional)',
      save: 'Save as draft',
      cancel: 'Cancel',
      edit: 'Edit',
      check: 'Check now',
      confirm: 'Confirm and enable',
      confirmText: 'Enable "{title}"? Agents will be able to run read-only checks on {n} Orbit project(s) from a restricted session (no schedules created or writes to Orbit).',
      pause: 'Pause',
      resume: 'Resume',
      archive: 'Archive',
      archiveText: 'Archive "{title}"? It stops accepting runs and cannot be edited; history stays.',
      status_draft: 'Draft', status_active: 'Active', status_paused: 'Paused', status_archived: 'Archived',
      revision: 'Revision {n}',
      scope: 'Scope',
      forbidden: 'Read-only: no task edits, comments, chat/docs reads, or deploys',
      offline: 'Checks run only when you click Check now or when a Schedule you created starts an agent while this Host is online.',
      pausedNote: 'Pausing stops the bridge from accepting runs, though any Schedule you set up separately may still open sessions until paused on the Automation page.',
      editNote: 'Saving puts this routine back in draft until you confirm it again.',
      conflict: 'This routine was updated while you were editing. Cancel and try again.',
      lastTrigger: 'Last run started',
      lastObserved: 'Last complete read',
      lastProcessed: 'Last processed result',
      never: 'never',
      identity: 'Connection',
      writeScopes: 'This connection also has write permissions ({s}). The bridge only reads, though a dedicated read-only connection is safer.',
      schedule: 'Schedule draft',
      scheduleMissing: 'No Schedule draft yet: fill in {f} first.',
      scheduleWarn: 'Schedules are created on the Automation page, not here. Before setting one up, make sure the preset only exposes: {t}, otherwise the bridge will reject the run.',
      copy: 'Copy JSON',
      copied: 'Copied',
      runs: 'Recent runs',
      noRuns: 'No runs yet.',
      mode_attended: 'Check now',
      mode_agent: 'Agent',
      state_reading: 'Reading Orbit',
      state_waiting: 'Waiting for agent summary',
      state_succeeded: 'Changes reported',
      state_no_change: 'No change',
      state_baseline: 'Baseline saved',
      state_failed: 'Failed',
      state_cancelled: 'Cancelled',
      changesProgram: 'Diff generated directly from Orbit data',
      summaryModel: 'Summary and facts submitted by the agent',
      sum_first: 'First check: saved a baseline of {n} tasks for future comparisons.',
      sum_reset: 'Scope or Orbit connection changed: saved a fresh baseline of {n} tasks.',
      sum_no_change: 'Checked {n} tasks; nothing changed since the last check.',
      sum_changes: '{a} new, {s} status changes, {f} field changes, {m} missing.',
      err_partial: 'Orbit read was incomplete, so no diff was generated and the baseline stayed put.',
      err_interrupted: 'Host stopped before this run finished; not marked as processed.',
      err_no_outcome: 'The agent did not submit a result in time; not marked as processed.',
      err_routine_changed: 'Routine changed during this run, so the result was discarded.',
      err_cancelled: 'Tool call was cancelled; not marked as processed.',
      err_storage: 'Saving the run failed.',
      coverage: '{n} tasks, {p} pages, {c}',
      coverage_complete: 'complete read',
      coverage_partial: 'partial read',
      added: 'New', status: 'Status', fields: 'Changed', missing: 'Missing or hidden',
      missingHint: 'deleted, moved out of scope, or access changed; check in Orbit',
      facts: 'Facts', inferences: 'Inferences (judgment)', limitations: 'Limitations',
      notDone: 'Read-only run: no Orbit tasks, comments, or messages were changed.',
      readErrors: 'Read errors',
      loadFailed: 'Could not load Orbit bridge',
      opFailed: 'Failed',
      retry: 'Retry',
    }
    const ZH = {
      panel: 'Orbit 执行桥',
      intro: '只读巡检 Orbit 项目，对比上次检查报告新增、变动或消失的任务（暂不支持按到期或未更新天数筛选）。',
      newRoutine: '新建规则',
      empty: '还没有规则。',
      title: '名称',
      projects: 'Orbit 项目 ID（逗号分隔）',
      server: 'MCP 服务名',
      rrule: 'Schedule RRULE（可选，仅草稿）',
      target: 'Schedule 目标',
      preset: '受限 Agent preset（仅草稿）',
      cwd: '会话目录（可选）',
      save: '保存为草稿',
      cancel: '取消',
      edit: '修改',
      check: '立即检查',
      confirm: '确认启用',
      confirmText: '启用「{title}」？启用后 Agent 可以在受限会话里只读检查这 {n} 个 Orbit 项目（不会创建 Schedule 或写入 Orbit）。',
      pause: '暂停',
      resume: '恢复',
      archive: '归档',
      archiveText: '归档「{title}」？归档后无法修改也不会再跑，历史记录会保留。',
      status_draft: '草稿', status_active: '已启用', status_paused: '已暂停', status_archived: '已归档',
      revision: '第 {n} 版',
      scope: '范围',
      forbidden: '只读限制：不改任务、不发评论、不读聊天或文档、不触发部署',
      offline: '只有点“立即检查”或由你另建的 Schedule 触发时才会运行，且需要本 Host 在线。',
      pausedNote: '暂停后执行桥会拒收新任务，但不会停掉你在自动化任务页面另建的 Schedule，需要的话请去那边一并暂停。',
      editNote: '保存后规则会退回草稿，需要重新确认后才能给 Agent 用。',
      conflict: '编辑期间这条规则在别处被改过了，请取消后重新打开。',
      lastTrigger: '最近开始运行',
      lastObserved: '最近完整读取',
      lastProcessed: '最近已处理结果',
      never: '从未',
      identity: '连接',
      writeScopes: '这个连接还带写权限（{s}）。执行桥不会去写，但换成专用只读连接会更稳妥。',
      schedule: 'Schedule 草稿',
      scheduleMissing: '还没有 Schedule 草稿：请先填好 {f}。',
      scheduleWarn: '这里只生成草稿，不会替你创建 Schedule。去自动化页面创建前，请确认该 preset 只开放了这些工具：{t}，否则执行桥会拒绝这次运行。',
      copy: '复制 JSON',
      copied: '已复制',
      runs: '最近运行',
      noRuns: '还没有运行记录。',
      mode_attended: '立即检查',
      mode_agent: 'Agent',
      state_reading: '正在读取 Orbit',
      state_waiting: '等待 Agent 提交结果',
      state_succeeded: '已报告变化',
      state_no_change: '无变化',
      state_baseline: '已建立基线',
      state_failed: '失败',
      state_cancelled: '已取消',
      changesProgram: '直接由 Orbit 数据比对出的差异',
      summaryModel: '摘要与事实由 Agent 提交',
      sum_first: '首次检查：已记下 {n} 个任务作为基线，下次起开始对比变化。',
      sum_reset: '范围或 Orbit 连接变了：已重新记录 {n} 个任务的基线，本次不做对比。',
      sum_no_change: '完整查了 {n} 个任务，跟上次比没有变化。',
      sum_changes: '新增 {a}，状态变化 {s}，字段变化 {f}，消失 {m}。',
      err_partial: '这次没能把 Orbit 读全，没有生成差异，基线也没动。',
      err_interrupted: '运行还没结束 Host 就停了，本次未记为已处理。',
      err_no_outcome: 'Agent 超时没提交结果，本次未记为已处理。',
      err_routine_changed: '运行途中规则被修改、暂停或归档，结果已丢弃。',
      err_cancelled: '工具调用被取消，本次未记为已处理。',
      err_storage: '保存运行记录失败。',
      coverage: '{n} 个任务，{p} 页，{c}',
      coverage_complete: '完整读取',
      coverage_partial: '部分读取',
      added: '新增', status: '状态', fields: '字段变化', missing: '消失或不可见',
      missingHint: '可能被删了、移出范围或权限变了，去 Orbit 核对一下',
      facts: '事实', inferences: '推断（判断）', limitations: '限制',
      notDone: '只读巡检：未改动任何任务、评论或消息。',
      readErrors: '读取错误',
      loadFailed: '无法加载 Orbit 执行桥',
      opFailed: '失败',
      retry: '重试',
    }

    const CSS = `
.ob-page{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
.ob-inner{max-width:880px;margin:0 auto;padding:24px 24px 48px;display:flex;flex-direction:column;gap:16px}
.ob-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.ob-h1{margin:0;font-size:20px;line-height:28px;font-weight:600}
.ob-muted{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}
.ob-card{border:.5px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);padding:16px;display:flex;flex-direction:column;gap:10px}
.ob-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ob-title{font-size:15px;line-height:22px;font-weight:600;margin:0;flex:1;min-width:0}
.ob-badge{font-size:12px;line-height:18px;padding:0 8px;border-radius:9px;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.ob-badge[data-tone=ok]{color:var(--dsw-alias-state-success-primary);border-color:currentColor}
.ob-badge[data-tone=warn]{color:var(--dsw-alias-state-warn-primary);border-color:currentColor}
.ob-badge[data-tone=error]{color:var(--dsw-alias-state-error-primary);border-color:currentColor}
.ob-badge[data-tone=idle]{color:var(--dsw-alias-state-idle-primary);border-color:currentColor}
.ob-btn{height:28px;padding:0 12px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.ob-btn:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary)}
.ob-btn:disabled{opacity:.5;cursor:default}
.ob-btn[data-primary]{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}
.ob-grid{display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;font-size:13px;line-height:20px;margin:0}
.ob-grid dt{color:var(--dsw-alias-label-secondary)}
.ob-grid dd{margin:0;min-width:0;overflow-wrap:anywhere}
.ob-note{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);margin:0}
.ob-warn{font-size:12px;line-height:18px;color:var(--dsw-alias-state-warn-primary);margin:0}
.ob-error{font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary);margin:0;overflow-wrap:anywhere}
.ob-pre{margin:0;padding:8px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-size:12px;line-height:18px;overflow:auto;max-height:240px;white-space:pre-wrap;overflow-wrap:anywhere}
.ob-run{border-top:.5px solid var(--dsw-alias-border-l1);padding-top:10px;display:flex;flex-direction:column;gap:6px}
.ob-list{margin:0;padding-left:18px;font-size:13px;line-height:20px}
.ob-list a{color:var(--dsw-alias-brand-primary)}
.ob-key{font-family:ui-monospace,monospace;font-size:11px;color:var(--dsw-alias-label-secondary)}
.ob-form{display:grid;grid-template-columns:1fr;gap:8px}
.ob-field{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.ob-input{height:30px;padding:0 8px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
textarea.ob-input{height:auto;min-height:48px;padding:6px 8px;resize:vertical}
.ob-section{font-size:13px;font-weight:600;margin:0}
`

    const STATUS_TONE = { draft: 'idle', active: 'ok', paused: 'warn', archived: 'idle' }
    const STATE_TONE = { running: 'warn', succeeded: 'ok', no_change: 'ok', baseline: 'idle', failed: 'error', cancelled: 'idle' }

    async function request(path, init) {
      const res = await fetch(path, { ...init, headers: { accept: 'application/json', ...init?.body ? { 'content-type': 'application/json' } : {} } })
      let body = null
      try { body = await res.json() } catch {}
      if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`)
      return body
    }

    function IconOrbit({ size }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true },
        h('circle', { cx: 12, cy: 12, r: 6.5 }),
        h('circle', { cx: 12, cy: 12, r: 2, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 18, cy: 7.5, r: 1.6, fill: 'currentColor', stroke: 'none' }))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'orbit-bridge: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'orbit-bridge: zh')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), t(key))
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const fmt = iso => iso ? new Date(iso).toLocaleString() : t('never')

        function useBridge() {
          const [state, setState] = React.useState({ data: null, error: null })
          const generation = React.useRef(0)
          const load = React.useCallback(async signal => {
            const own = ++generation.current
            try {
              const data = await request('orbit-bridge/state', { signal })
              if (own === generation.current && !signal?.aborted) setState({ data, error: null })
            } catch (error) {
              if (own === generation.current && !signal?.aborted && error?.name !== 'AbortError') setState(prev => ({ data: prev.data, error: String(error?.message ?? error) }))
            }
          }, [])
          React.useEffect(() => {
            const controller = new AbortController()
            let timer
            const poll = async () => {
              if (!timer || document.visibilityState === 'visible') await load(controller.signal)
              if (!controller.signal.aborted) timer = setTimeout(poll, POLL_MS)
            }
            void poll()
            return () => { clearTimeout(timer); controller.abort(); generation.current++ }
          }, [load])
          /** Run one Host operation; returns the error message, or null on success. */
          const op = React.useCallback(async payload => {
            try {
              await request('orbit-bridge/op', { method: 'POST', body: JSON.stringify(payload) })
              await load()
              return null
            } catch (error) {
              const message = String(error?.message ?? error)
              return message.includes('changed since you loaded it') ? `${t('conflict')} (${message})` : message
            }
          }, [load])
          return { ...state, load, op }
        }

        /** A button that disables itself while its action runs and shows the failure beside it. */
        function ActionButton({ label, onRun, primary, disabled, confirmText }) {
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState(null)
          const mounted = React.useRef(true)
          React.useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
          const click = async () => {
            if (confirmText && !window.confirm(confirmText)) return
            setBusy(true)
            setError(null)
            try {
              const message = await onRun()
              if (mounted.current) setError(message)
            } catch (failure) { if (mounted.current) setError(failure.message) } finally { if (mounted.current) setBusy(false) }
          }
          return h(React.Fragment, null,
            h('button', { type: 'button', className: 'ob-btn', 'data-primary': primary ? '' : undefined, disabled: disabled || busy, 'aria-busy': busy, onClick: click }, label),
            error ? h('span', { className: 'ob-error', role: 'alert' }, `${t('opFailed')}: ${error}`) : null)
        }

        function RoutineForm({ routine, note, onSubmit, onCancel }) {
          const s = routine?.schedule ?? {}
          const [form, setForm] = React.useState({
            title: routine?.title ?? '', projectIds: (routine?.projectIds ?? []).join(', '), serverName: routine?.serverName ?? 'orbit',
            rrule: s.rrule ?? '', target: s.target ?? 'new', agentPreset: s.agentPreset ?? '', cwd: s.cwd ?? '',
          })
          const field = (key, label, props = {}) => h('label', { className: 'ob-field' }, label,
            h(props.multiline ? 'textarea' : 'input', { className: 'ob-input', value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }), ...props.multiline ? { rows: 2 } : {} }))
          const payload = () => ({
            title: form.title, serverName: form.serverName,
            projectIds: form.projectIds.split(/[\s,]+/).filter(Boolean),
            schedule: { rrule: form.rrule.replace(/\r\n?/g, '\n').trim(), target: form.target, agentPreset: form.agentPreset, cwd: form.cwd },
          })
          return h('div', { className: 'ob-card' },
            note ? h('p', { className: 'ob-warn' }, note) : null,
            h('div', { className: 'ob-form' },
              field('title', t('title')),
              field('projectIds', t('projects')),
              field('serverName', t('server')),
              field('rrule', t('rrule'), { multiline: true }),
              h('label', { className: 'ob-field' }, t('target'),
                h('select', { className: 'ob-input', value: form.target, onChange: e => setForm({ ...form, target: e.target.value }) },
                  h('option', { value: 'new' }, 'new'), h('option', { value: 'new_once' }, 'new_once'))),
              field('agentPreset', t('preset')),
              field('cwd', t('cwd'))),
            h('div', { className: 'ob-row' },
              h(ActionButton, { label: t('save'), primary: true, onRun: () => onSubmit(payload()) }),
              h('button', { type: 'button', className: 'ob-btn', onClick: onCancel }, t('cancel'))))
        }

        function isWebLink(value) {
          try { return ['https:', 'http:'].includes(new URL(value).protocol) } catch { return false }
        }

        function ChangeList({ changes }) {
          if (!changes?.length) return null
          return h('ul', { className: 'ob-list' }, changes.map(c => h('li', { key: c.key },
            h('strong', null, t(c.kind)), ' ',
            isWebLink(c.url) ? h('a', { href: c.url, target: '_blank', rel: 'noreferrer' }, c.identifier ?? c.taskId) : (c.identifier ?? c.taskId),
            ' ', c.title,
            c.kind === 'status' ? ` (${c.from ?? '?'} → ${c.to ?? '?'})` : null,
            c.kind === 'fields' ? ` (${c.fields.join(', ')})` : null,
            c.kind === 'missing' ? ` (${t('missingHint')})` : null,
            ' ', h('span', { className: 'ob-key' }, c.key))))
        }

        function Claims({ title, items }) {
          if (!items?.length) return null
          return h(React.Fragment, null, h('p', { className: 'ob-section' }, title),
            h('ul', { className: 'ob-list' }, items.map((item, i) => h('li', { key: i }, item.claim,
              item.uncertainty ? ` (${item.uncertainty})` : null,
              item.changeKeys?.length ? h('span', { className: 'ob-key' }, ` [${item.changeKeys.join(', ')}]`) : null))))
        }

        /** Program outcomes are rebuilt from state and counts so they follow the UI language. */
        function programSummary(run) {
          const n = run.observation?.objectCount ?? 0
          if (run.state === 'baseline') return tf(run.outcome.reason === 'first' ? 'sum_first' : 'sum_reset', { n })
          if (run.state === 'no_change') return tf('sum_no_change', { n })
          const c = run.outcome.counts ?? {}
          return tf('sum_changes', { a: c.added ?? 0, s: c.status ?? 0, f: c.fields ?? 0, m: c.missing ?? 0 })
        }

        function RunCard({ run }) {
          const obs = run.observation
          const stateLabel = run.state === 'running' ? t(run.observedAt ? 'state_waiting' : 'state_reading') : t(`state_${run.state}`)
          const errorText = run.error ? (EN[`err_${run.error.kind}`] ? t(`err_${run.error.kind}`) : run.error.kind) : null
          return h('div', { className: 'ob-run' },
            h('div', { className: 'ob-row' },
              h('span', { className: 'ob-badge', 'data-tone': STATE_TONE[run.state] }, stateLabel),
              h('span', { className: 'ob-badge' }, t(`mode_${run.mode}`)),
              h('span', { className: 'ob-note' }, fmt(run.startedAt))),
            obs ? h('p', { className: 'ob-note' }, tf('coverage', { n: obs.objectCount, p: obs.pageCount, c: t(`coverage_${obs.coverage}`) })) : null,
            run.outcome?.source === 'program' ? h('p', { className: 'ob-muted' }, programSummary(run)) : null,
            run.outcome?.source === 'model' ? h(React.Fragment, null,
              h('p', { className: 'ob-note' }, t('summaryModel')),
              h('p', { className: 'ob-muted' }, run.outcome.summary)) : null,
            run.changes?.length ? h('p', { className: 'ob-note' }, t('changesProgram')) : null,
            h(ChangeList, { changes: run.changes }),
            h(Claims, { title: t('facts'), items: run.outcome?.facts }),
            h(Claims, { title: t('inferences'), items: run.outcome?.inferences }),
            run.outcome?.limitations?.length ? h(Claims, { title: t('limitations'), items: run.outcome.limitations.map(claim => ({ claim })) }) : null,
            run.error ? h('p', { className: 'ob-error' }, errorText, h('br'), h('span', { className: 'ob-key' }, `${run.error.kind}: ${run.error.message}`)) : null,
            obs?.readErrors?.length ? h('p', { className: 'ob-error' }, `${t('readErrors')}: ${obs.readErrors.map(e => `${e.kind}: ${e.message}`).join('; ')}`) : null,
            run.state === 'succeeded' || run.state === 'no_change' ? h('p', { className: 'ob-note' }, t('notDone')) : null)
        }

        function ScheduleDraft({ draft, allowed, serverName }) {
          const [copied, setCopied] = React.useState(false)
          if (!draft.request) return h('p', { className: 'ob-note' }, tf('scheduleMissing', { f: draft.missing.join(', ') }))
          const json = JSON.stringify(draft.request, null, 2)
          const tools = [...allowed.bridge, ...allowed.orbitReads.map(n => `mcp__${serverName}__${n}`)].join(', ')
          return h(React.Fragment, null,
            h('p', { className: 'ob-warn' }, tf('scheduleWarn', { t: tools })),
            h('pre', { className: 'ob-pre' }, json),
            h('div', { className: 'ob-row' }, h('button', {
              type: 'button', className: 'ob-btn',
              onClick: () => navigator.clipboard?.writeText(json).then(() => setCopied(true), () => setCopied(false)),
            }, copied ? t('copied') : t('copy'))))
        }

        function RoutineCard({ routine, allowed, op }) {
          // The revision the form was opened at; polling must not move it.
          const [editing, setEditing] = React.useState(null)
          const id = routine.id
          const run = action => () => op({ action, routineId: id, expectedRevision: routine.revision })
          const identity = routine.runs.find(r => r.observation?.identity)?.observation.identity
          if (editing !== null) {
            return h(RoutineForm, {
              routine,
              note: routine.status === 'active' || routine.status === 'paused' ? t('editNote') : null,
              onCancel: () => setEditing(null),
              onSubmit: async payload => {
                const error = await op({ action: 'update', routineId: id, expectedRevision: editing, ...payload })
                if (!error) setEditing(null)
                return error
              },
            })
          }
          const s = routine.status
          return h('section', { className: 'ob-card', 'aria-label': routine.title },
            h('div', { className: 'ob-row' },
              h('h2', { className: 'ob-title' }, routine.title),
              h('span', { className: 'ob-badge', 'data-tone': STATUS_TONE[s] }, t(`status_${s}`)),
              h('span', { className: 'ob-note' }, tf('revision', { n: routine.revision }))),
            h('dl', { className: 'ob-grid' },
              h('dt', null, t('scope')), h('dd', null, `${routine.serverName}: ${routine.projectIds.join(', ')}`),
              h('dt', null, t('lastTrigger')), h('dd', null, fmt(routine.lastTriggerAt)),
              h('dt', null, t('lastObserved')), h('dd', null, fmt(routine.observedAt)),
              h('dt', null, t('lastProcessed')), h('dd', null, fmt(routine.processedAt)),
              identity ? h(React.Fragment, null, h('dt', null, t('identity')), h('dd', null, `${identity.workspace} · ${identity.scopes.join(', ')}`)) : null),
            h('p', { className: 'ob-note' }, t('forbidden')),
            h('p', { className: 'ob-note' }, t('offline')),
            s === 'paused' ? h('p', { className: 'ob-warn' }, t('pausedNote')) : null,
            identity?.writeScopes?.length ? h('p', { className: 'ob-warn' }, tf('writeScopes', { s: identity.writeScopes.join(', ') })) : null,
            s === 'archived' ? null : h('div', { className: 'ob-row' },
              s === 'draft' || s === 'active' ? h(ActionButton, { label: t('check'), onRun: run('check') }) : null,
              s === 'draft' ? h(ActionButton, { label: t('confirm'), primary: true, onRun: run('confirm'), confirmText: tf('confirmText', { title: routine.title, n: routine.projectIds.length }) }) : null,
              s === 'active' ? h(ActionButton, { label: t('pause'), onRun: run('pause') }) : null,
              s === 'paused' ? h(ActionButton, { label: t('resume'), onRun: run('resume') }) : null,
              h('button', { type: 'button', className: 'ob-btn', onClick: () => setEditing(routine.revision) }, t('edit')),
              h(ActionButton, { label: t('archive'), onRun: run('archive'), confirmText: tf('archiveText', { title: routine.title }) })),
            h('p', { className: 'ob-section' }, t('schedule')),
            h(ScheduleDraft, { draft: routine.scheduleDraft, allowed, serverName: routine.serverName }),
            h('p', { className: 'ob-section' }, t('runs')),
            routine.runs.length === 0 ? h('p', { className: 'ob-note' }, t('noRuns')) : routine.runs.map(r => h(RunCard, { key: r.id, run: r })))
        }

        function BridgePage() {
          useLocale()
          const { data, error, load, op } = useBridge()
          const [creating, setCreating] = React.useState(false)
          return h('div', { className: 'ob-page' },
            h('style', null, CSS),
            h('div', { className: 'ob-inner' },
              h('div', { className: 'ob-head' },
                h('h1', { className: 'ob-h1' }, t('panel')),
                h('button', { type: 'button', className: 'ob-btn', disabled: creating, onClick: () => setCreating(true) }, t('newRoutine'))),
              h('p', { className: 'ob-muted' }, t('intro')),
              error ? h('div', { className: 'ob-row' },
                h('p', { className: 'ob-error', role: 'alert' }, `${t('loadFailed')}: ${error}`),
                h('button', { type: 'button', className: 'ob-btn', onClick: () => load() }, t('retry'))) : null,
              creating ? h(RoutineForm, {
                onCancel: () => setCreating(false),
                onSubmit: async payload => {
                  const failure = await op({ action: 'create', ...payload })
                  if (!failure) setCreating(false)
                  return failure
                },
              }) : null,
              data && data.routines.length === 0 && !creating ? h('p', { className: 'ob-note' }, t('empty')) : null,
              (data?.routines ?? []).map(routine => h(RoutineCard, { key: routine.id, routine, allowed: data.allowedTools, op }))))
        }

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, BridgePage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 40, locale: NS, label: () => t('panel'),
        }, ({ size }) => h(IconOrbit, { size: size ?? 16 })))
      },
    }
  },
})
