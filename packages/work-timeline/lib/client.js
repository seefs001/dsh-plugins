window.__ModuleLoader__.load({
  id: 'dsh-work-timeline',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const KEY = 'dsh-work-timeline'
    const TYPE = 'dsh-work-timeline/work'
    const DICTS = {
      en: {
        title: 'Work timeline', open: 'Open work details', plan: 'Plan', timeline: 'Timeline', artifacts: 'Artifacts',
        empty: 'No recorded work yet. Ask the agent to track a multi-step task with work_update.',
        pending: 'Pending', in_progress: 'In progress', blocked: 'Blocked', completed: 'Completed', canceled: 'Canceled', active: 'Active',
        reported: 'Last reported state. This does not imply the agent is currently running or the result is verified.',
        waiting: 'Blocked: {reason}', revision: 'Revision {n}', legacy: 'Task list',
        deliverable: 'Deliverable', evidence: 'Evidence', currentFile: 'Current file · not a saved version',
        preview: 'Preview file', noArtifacts: 'No explicitly linked artifacts yet.', all: 'All steps',
        linked: 'Artifacts ({n})', step: 'Step: {title}', inherited: 'This plan was inherited from the source session; updates belong to this session.',
        earlier: 'Showing the latest {n} revisions. Earlier records remain in the conversation.',
        recorded: 'Recorded', added: 'Added', updated: 'Updated', noSteps: 'No steps recorded.',
        latest: 'Current work', output: 'Outcome', error: 'Could not open the view: {message}',
      },
      zh: {
        title: '工作时间线', open: '打开工作详情', plan: '计划', timeline: '过程', artifacts: '产物',
        empty: '还没有工作记录。可以让 Agent 使用 work_update 跟踪多步骤任务。',
        pending: '待开始', in_progress: '进行中', blocked: '受阻', completed: '已完成', canceled: '已取消', active: '推进中',
        reported: '这里显示最后报告的状态，不代表 Agent 当前正在运行，也不代表结果已验证。',
        waiting: '受阻：{reason}', revision: '修订 {n}', legacy: '任务清单',
        deliverable: '交付物', evidence: '依据', currentFile: '当前文件 · 非历史快照',
        preview: '预览文件', noArtifacts: '还没有显式关联的产物。', all: '所有步骤',
        linked: '产物（{n}）', step: '步骤：{title}', inherited: '计划继承自来源会话，后续更新只属于当前会话。',
        earlier: '展示最近 {n} 次修订，更早的记录保留在对话中。',
        recorded: '记录于', added: '新增', updated: '更新', noSteps: '尚未记录步骤。',
        latest: '当前工作', output: '结果', error: '无法打开视图：{message}',
      },
    }
    const CSS = `
.wt{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.6}
.wt button,.wt select{font:inherit;color:inherit}
.wt button{cursor:pointer;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);padding:5px 9px;text-align:left}
.wt button:hover{background:var(--dsw-alias-bg-layer-1)}
.wt button:focus-visible,.wt select:focus-visible,.wt summary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.wt-dock{width:calc(100% - 48px);max-width:var(--dsh-composer-card-max-width);margin:0 auto;padding:4px 0}
.wt-dock>button{display:flex;align-items:center;gap:8px;width:100%;border:0;padding:6px 10px}
.wt-ellipsis{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:0;flex:1}
.wt-muted{color:var(--dsw-alias-label-secondary);font-size:12px}
.wt-panel{height:100%;overflow:auto;padding:20px;overscroll-behavior:contain}
.wt h2{font-size:18px;line-height:1.4;margin:4px 0 10px;overflow-wrap:anywhere}
.wt p{margin:7px 0;white-space:pre-wrap;overflow-wrap:anywhere}
.wt-nav{display:flex;gap:6px;margin:18px 0 14px;flex-wrap:wrap}
.wt-nav button[aria-pressed=true]{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.wt-list{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.wt-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:12px;min-width:0}
.wt-card[data-selected=true]{border-color:var(--dsw-alias-brand-primary)}
.wt-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
.wt-label{font-size:11px;white-space:nowrap;color:var(--dsw-alias-label-secondary)}
.wt-label[data-status=blocked],.wt-blocker{color:var(--dsw-alias-state-warn-primary)}
.wt-label[data-status=completed]{color:var(--dsw-alias-state-success-primary)}
.wt-label[data-status=canceled]{color:var(--dsw-alias-state-idle-primary)}
.wt-name{font-weight:600;overflow-wrap:anywhere;min-width:0}
.wt-path{display:block;overflow-wrap:anywhere;font-size:12px;color:var(--dsw-alias-label-secondary);margin:8px 0}
.wt-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.wt-filter{display:flex;gap:8px;align-items:center;margin-bottom:12px}
.wt-filter select{max-width:100%;min-width:0;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);padding:5px;border-radius:6px}
.wt-history{border-left:2px solid var(--dsw-alias-border-l1);margin-left:4px;padding-left:14px}
.wt-history li{padding:0 0 18px;list-style:none}
.wt-history ul{margin:8px 0 0;padding-left:16px}
.wt-history ul li{list-style:disc;padding:2px 0}
.wt-error{color:var(--dsw-alias-state-error-primary)}
.wt-legacy{max-height:240px;overflow:auto;padding:6px 10px}
@media(max-width:480px){.wt-panel{padding:14px}.wt-dock{width:calc(100% - 24px)}}
`
    const encode = value => encodeURIComponent(value).replace(/%3A/gi, ':')
    // Public Session file-address format; opening stays in the Host's authorized filesystem.
    const fileAddress = (sessionId, path) => `dsh-resource://file/session/${encode(sessionId)}/${path.replace(/\\/g, '/').split('/').map(encode).join('/')}`
    const badge = (status, t) => h('span', { className: 'wt-label', 'data-status': status }, t(status))

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs'],
      apply(ctx) {
        for (const [language, dictionary] of Object.entries(DICTS)) ctx.effect(() => ctx.locale.register(KEY, language, dictionary))
        const translate = ctx.locale.bind(KEY)
        const subscribe = listener => ctx.locale.subscribe(listener)
        const getLocale = () => ctx.locale.getSnapshot()
        function useLocale() { React.useSyncExternalStore(subscribe, getLocale); return translate }

        function Dock({ useProjection }) {
          const t = useLocale()
          const state = useProjection(KEY)
          const todos = useProjection('todos')
          const [error, setError] = React.useState('')
          const current = state?.current
          if (!current) {
            if (!todos?.length) return null
            return h('div', { className: 'wt wt-dock' }, h('style', null, CSS),
              h('details', { className: 'wt-legacy' }, h('summary', null, t('legacy')),
                h('ol', null, todos.map(item => h('li', { key: item.content }, item.content, ' · ', t(item.status))))))
          }
          const blocker = current.snapshot.steps.find(step => step.status === 'blocked')
          const open = () => {
            try { ctx.sidebarRight.openTab(KEY); setError('') } catch (failure) { setError(failure.message) }
          }
          return h('div', { className: 'wt wt-dock' }, h('style', null, CSS),
            h('button', { type: 'button', onClick: open, title: t('open') },
              h('span', { className: 'wt-ellipsis' }, current.snapshot.title),
              badge(blocker ? 'blocked' : current.snapshot.status, t), h('span', { 'aria-hidden': true }, '›')),
            blocker && h('p', { className: 'wt-blocker' }, t('waiting', { reason: blocker.blocker })),
            error && h('p', { role: 'alert', className: 'wt-error' }, t('error', { message: error })))
        }

        function WorkBody({ state, sessionId, actions }) {
          const t = useLocale()
          const [view, setView] = React.useState('plan')
          const [stepId, setStepId] = React.useState('')
          const [error, setError] = React.useState('')
          const work = state.current
          const snapshot = work.snapshot
          const steps = new Map(snapshot.steps.map(step => [step.id, step]))
          const showStep = id => { setStepId(id); setView('plan') }
          const preview = artifact => {
            try { actions.openResource(fileAddress(sessionId, artifact.path), { preferNewPane: true }); setError('') }
            catch (failure) { setError(failure.message) }
          }
          const plan = () => snapshot.steps.length ? h('ol', { className: 'wt-list' }, snapshot.steps.map(step => {
            const linked = snapshot.artifacts.filter(artifact => artifact.stepId === step.id).length
            return h('li', { className: 'wt-card', key: step.id, 'data-selected': step.id === stepId },
              h('div', { className: 'wt-row' }, h('span', { className: 'wt-name' }, step.content), badge(step.status, t)),
              step.blocker && h('p', { className: 'wt-blocker' }, step.blocker),
              step.outcome && h('p', null, step.outcome),
              linked > 0 && h('div', { className: 'wt-actions' }, h('button', { type: 'button', onClick: () => { setStepId(step.id); setView('artifacts') } }, t('linked', { n: linked }))))
          })) : h('p', { className: 'wt-muted' }, t('noSteps'))
          const timeline = () => h(React.Fragment, null,
            work.revision > state.history.length && h('p', { className: 'wt-muted' }, t('earlier', { n: state.history.length })),
            h('ol', { className: 'wt-history' }, state.history.toReversed().map(row => h('li', { key: row.revision },
              h('div', { className: 'wt-row' }, h('strong', null, t('revision', { n: row.revision })), badge(row.status, t)),
              h('time', { className: 'wt-muted', dateTime: new Date(row.time).toISOString() }, `${t('recorded')} ${new Date(row.time).toLocaleString()}`),
              h('p', null, row.reason),
              h('ul', null, row.steps.map(change => h('li', { key: change.id },
                h('button', { type: 'button', onClick: () => showStep(change.id) }, change.title), ' · ',
                change.previous ? `${t(change.previous)} → ${t(change.status)}` : `${t(change.kind)} · ${t(change.status)}`)),
              row.artifacts.map(change => h('li', { key: `artifact:${change.id}` },
                h('button', { type: 'button', onClick: () => { setStepId(''); setView('artifacts') } }, change.title), ' · ', t(change.kind))))))))
          const artifacts = () => {
            const visible = snapshot.artifacts.filter(artifact => !stepId || artifact.stepId === stepId)
            return h(React.Fragment, null,
              h('label', { className: 'wt-filter' }, t('artifacts'),
                h('select', { value: stepId, onChange: event => setStepId(event.target.value) },
                  h('option', { value: '' }, t('all')), snapshot.steps.map(step => h('option', { key: step.id, value: step.id }, step.content)))),
              visible.length === 0 ? h('p', { className: 'wt-muted' }, t('noArtifacts')) :
                h('ul', { className: 'wt-list' }, visible.map(artifact => h('li', { className: 'wt-card', key: artifact.id },
                  h('div', { className: 'wt-row' }, h('span', { className: 'wt-name' }, artifact.title), badge(artifact.role, t)),
                  artifact.description && h('p', null, artifact.description),
                  h('code', { className: 'wt-path' }, artifact.path), h('p', { className: 'wt-muted' }, t('currentFile')),
                  h('div', { className: 'wt-actions' },
                    h('button', { type: 'button', onClick: () => preview(artifact) }, t('preview')),
                    artifact.stepId && h('button', { type: 'button', onClick: () => showStep(artifact.stepId) }, t('step', { title: steps.get(artifact.stepId)?.content ?? artifact.stepId })))))))
          }
          return h('section', { className: 'wt wt-panel', 'aria-label': t('title') }, h('style', null, CSS),
            h('div', { className: 'wt-row' }, h('span', { className: 'wt-muted' }, t('latest')), badge(snapshot.status, t)),
            h('h2', null, snapshot.title), h('p', null, snapshot.objective),
            snapshot.outcome && h('p', null, h('strong', null, `${t('output')}: `), snapshot.outcome),
            state.inherited && h('p', { className: 'wt-muted' }, t('inherited')),
            h('p', { className: 'wt-muted' }, t('reported')),
            h('nav', { className: 'wt-nav', 'aria-label': t('title') }, ['plan', 'timeline', 'artifacts'].map(tab =>
              h('button', { type: 'button', key: tab, 'aria-pressed': view === tab, onClick: () => { setView(tab); setStepId('') } },
                t(tab), tab === 'artifacts' ? ` (${snapshot.artifacts.length})` : ''))),
            error && h('p', { role: 'alert', className: 'wt-error' }, t('error', { message: error })),
            view === 'plan' ? plan() : view === 'timeline' ? timeline() : artifacts())
        }

        function Panel({ useProjection, useTabInfo, sessionId }) {
          const t = useLocale()
          const state = useProjection(KEY)
          const { tab } = useTabInfo()
          if (!state?.current) return h('div', { className: 'wt wt-panel' }, h('style', null, CSS), h('p', null, t('empty')))
          return h(WorkBody, { key: `${sessionId}:${state.current.id}`, state, sessionId, actions: tab.actions })
        }
        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: TYPE, kind: KEY, title: () => translate('title'),
          guide: [{ id: 'work', order: 30, title: () => translate('title'), description: () => `${translate('plan')} · ${translate('timeline')} · ${translate('artifacts')}` }],
        }))
        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TYPE }, Panel))
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'todo', order: 0 }, Dock))
      },
    }
  },
})
