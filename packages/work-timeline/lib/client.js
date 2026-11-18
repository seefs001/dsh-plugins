window.__ModuleLoader__.load({
  id: 'dsh-work-timeline',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const KEY = 'dsh-work-timeline'
    const TYPE = 'dsh-work-timeline/work'
    const VIEWS = ['plan', 'process', 'artifacts']
    const ROLES = ['deliverable', 'evidence']
    const DICTS = {
      en: {
        title: 'Work timeline', overview: 'Work overview', open: 'Open work details',
        dockLabel: 'Work: {title}. {progress}. Open details.',
        plan: 'Plan', process: 'Process', artifacts: 'Artifacts', views: 'Work views',
        pending: 'Pending', in_progress: 'In progress', blocked: 'Blocked', completed: 'Completed', canceled: 'Canceled',
        'work.active': 'Active', 'work.blocked': 'Blocked', 'work.completed': 'Reported complete', 'work.canceled': 'Canceled',
        progress: '{done} of {total} done', progressEmpty: 'No steps yet', progressCanceled: 'All steps canceled',
        countBlocked: '{n} blocked', countCanceled: '{n} canceled',
        now: 'Current', waitingOn: 'Waiting on', blockedBy: 'Blocked: {reason}', blockedMany: '{n} blocked · {reason}',
        details: 'Details', 'attn.blocked': 'Blocked · {n}', 'attn.in_progress': 'Reported in progress · {n}', 'attn.next': 'Next step',
        'more.blocked': '{n} more blocked', 'more.in_progress': '{n} more in progress', viewAll: 'View all {n}',
        outcome: 'Reported outcome', stepOutcome: 'Result',
        reported: 'Status is the agent’s latest report. It does not mean the agent is running now or that results were verified.',
        inherited: 'Inherited', inheritedHint: 'This plan was inherited from the source session; new revisions belong to this session.',
        revision: 'Revision {n}', revisionShort: 'Rev {n}', latest: 'Latest', updatedAt: 'Updated {time}',
        earlier: 'Showing the latest {n} revisions. Earlier ones remain in the conversation.',
        changeAdded: 'Added', changeUpdated: 'Edited', workChanged: 'Work marked {status}', noChanges: 'No step or artifact changes in this revision.',
        noHistory: 'No revisions recorded yet.',
        deliverable: 'Deliverable', evidence: 'Evidence', 'group.deliverable': 'Deliverables', 'group.evidence': 'Evidence',
        fileNote: 'Opens the current file in preview. Links are references, not saved versions.',
        openFile: 'Open {name}', filterStep: 'Step', allSteps: 'All steps', unlinked: 'Not linked to a step',
        noArtifacts: 'No artifacts linked yet. The agent links deliverables and evidence through work_update.',
        noArtifactsFilter: 'No artifacts match this step.',
        noSteps: 'No steps recorded yet.', showInPlan: 'Show step in plan', stepRef: 'Step: {title}',
        emptyTitle: 'No work recorded',
        emptyBody: 'When the agent tracks multi-step work with work_update, its plan, revisions and linked files appear here.',
        showLess: 'Show less',
        legacy: 'Task list', error: 'Could not open: {message}',
      },
      zh: {
        title: '工作时间线', overview: '工作概览', open: '打开工作详情',
        dockLabel: '工作：{title}。{progress}。打开详情。',
        plan: '计划', process: '过程', artifacts: '产物', views: '工作视图',
        pending: '待开始', in_progress: '进行中', blocked: '受阻', completed: '已完成', canceled: '已取消',
        'work.active': '推进中', 'work.blocked': '受阻', 'work.completed': '报告已完成', 'work.canceled': '已取消',
        progress: '已完成 {done}/{total}', progressEmpty: '尚无步骤', progressCanceled: '所有步骤均已取消',
        countBlocked: '{n} 项受阻', countCanceled: '{n} 项取消',
        now: '当前', waitingOn: '等待', blockedBy: '受阻：{reason}', blockedMany: '{n} 项受阻：{reason}',
        details: '详情', 'attn.blocked': '受阻 · {n}', 'attn.in_progress': '报告进行中 · {n}', 'attn.next': '下一步',
        'more.blocked': '另有 {n} 项受阻', 'more.in_progress': '另有 {n} 项进行中', viewAll: '查看全部 {n} 项',
        outcome: '报告结果', stepOutcome: '结果',
        reported: '状态来自 Agent 最近一次报告，不代表 Agent 正在运行，也不代表结果已验证。',
        inherited: '继承', inheritedHint: '计划继承自来源会话，之后的修订只属于当前会话。',
        revision: '修订 {n}', revisionShort: '修订 {n}', latest: '最新', updatedAt: '更新于 {time}',
        earlier: '展示最近 {n} 次修订，更早的记录保留在对话中。',
        changeAdded: '新增', changeUpdated: '修改', workChanged: '工作状态改为{status}', noChanges: '本次修订没有步骤或产物变化。',
        noHistory: '还没有修订记录。',
        deliverable: '交付物', evidence: '依据', 'group.deliverable': '交付物', 'group.evidence': '依据',
        fileNote: '在预览中打开文件的当前内容。这里是文件引用，不是历史快照。',
        openFile: '打开 {name}', filterStep: '步骤', allSteps: '所有步骤', unlinked: '未关联步骤',
        noArtifacts: '还没有关联产物。Agent 通过 work_update 关联交付物和依据。',
        noArtifactsFilter: '这个步骤没有关联产物。',
        noSteps: '尚未记录步骤。', showInPlan: '在计划中查看步骤', stepRef: '步骤：{title}',
        emptyTitle: '还没有工作记录',
        emptyBody: 'Agent 用 work_update 跟踪多步骤任务后，计划、修订过程和关联文件会显示在这里。',
        showLess: '收起',
        legacy: '任务清单', error: '无法打开：{message}',
      },
    }
    const CSS = `
.wt{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
:where(.wt) *,:where(.wt) *::before,:where(.wt) *::after{box-sizing:border-box}
:where(.wt) :is(button,select){font:inherit;color:inherit;margin:0}
:where(.wt) button{cursor:pointer;background:transparent;border:0;padding:0;text-align:left}
.wt :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
:where(.wt) :is(p,h2,h3,ol,ul){margin:0;padding:0}
.wt ol,.wt ul{list-style:none}
.wt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.wt-ellipsis{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wt-glyph{display:inline-grid;flex:none;place-items:center;width:16px;height:16px;color:var(--dsw-alias-label-tertiary)}
.wt-glyph[data-status=in_progress]{color:var(--dsw-alias-state-business-primary)}
.wt-glyph[data-status=blocked]{color:var(--dsw-alias-state-warn-primary)}
.wt-glyph[data-status=completed]{color:var(--dsw-alias-state-success-primary)}
.wt-glyph[data-status=canceled]{color:var(--dsw-alias-state-idle-primary)}
.wt-glyph .wt-on{stroke:var(--dsw-alias-label-on-color)}
.wt-meter{display:flex;gap:2px;height:4px;min-width:0}
.wt-meter>span{flex:1 1 0;min-width:2px;border-radius:2px;background:var(--dsw-alias-border-l2)}
.wt-meter>[data-status=completed]{background:var(--dsw-alias-state-success-primary)}
.wt-meter>[data-status=in_progress]{background:var(--dsw-alias-state-business-primary)}
.wt-meter>[data-status=blocked]{background:var(--dsw-alias-state-warn-primary)}
.wt-meter>[data-status=canceled]{background:transparent;box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}
.wt-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}

/* Composer dock: same column, surface and type scale as the host Todo and Goal cards. */
.wt-dock{container-type:inline-size;flex:none;margin:0 auto;
  width:calc(100% - 2 * var(--dsh-composer-side-clearance,16px) - 4 * var(--dsh-composer-dock-inset,8px));
  max-width:calc(var(--dsh-composer-card-max-width,760px) - 4 * var(--dsh-composer-dock-inset,8px))}
.wt-card{position:relative;isolation:isolate;overflow:hidden;border-radius:var(--dsw-radius-md,12px);
  --dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-panel);
  --dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
.wt-card::before{content:'';position:absolute;z-index:-1;inset:0;border-radius:inherit;pointer-events:none;
  background:var(--dsw-specific-menu,var(--dsw-alias-bg-base));backdrop-filter:var(--dsw-menu-backdrop-filter)}
.wt-dock-main{display:flex;align-items:center;gap:10px;width:100%;min-height:36px;padding:4px 10px 4px 12px;border-radius:inherit}
@media (hover:hover){.wt-dock-main:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wt-dock-title{flex:0 1 auto;max-width:45%;font-weight:500;line-height:24px}
.wt-dock-focus{flex:1 1 0;color:var(--dsw-alias-label-tertiary)}
.wt-dock-focus[data-status=blocked]{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.wt-dock-count{flex:none;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px}
.wt-dock .wt-meter{flex:none;width:56px}
.wt-chevron{display:inline-grid;flex:none;place-items:center;width:14px;height:14px;color:var(--dsw-alias-label-tertiary)}
.wt-dock .wt-error{padding:0 12px 6px}
.wt-legacy-list{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto;padding:2px 12px 8px}
.wt-legacy-list li{display:flex;align-items:center;gap:10px;color:var(--dsw-alias-label-secondary);min-width:0}
@container (max-width:460px){.wt-dock-focus{display:none}.wt-dock-title{flex:1 1 auto;max-width:none}}
@container (max-width:300px){.wt-dock .wt-meter{display:none}}

/* Sidebar page: one scroll container holding the overview, tab strip and the selected view. */
.wt-page{container-type:inline-size;display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.wt-head{flex:none;display:flex;flex-direction:column;gap:10px;padding:16px 20px 12px}
.wt-page-error{margin:0 20px 8px}
.wt-meta-toggle{display:inline-flex;align-items:center;gap:2px;margin-left:auto}
.wt-meta{display:flex;flex-direction:column;gap:4px;padding-left:10px;border-left:2px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.wt-attn{display:flex;flex-direction:column;gap:2px;padding-left:10px;border-left:2px solid var(--dsw-alias-border-l2)}
.wt-attn[data-kind=blocked]{border-left-color:var(--dsw-alias-state-warn-primary)}
.wt-attn[data-kind=blocked]>.wt-label{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.wt-attn[data-kind=in_progress]{border-left-color:var(--dsw-alias-state-business-primary)}
.wt-attn>.wt-link{align-self:flex-start}
.wt-attn-row{display:flex;align-items:flex-start;gap:8px;width:calc(100% + 12px);margin:0 -6px;padding:3px 6px;border-radius:6px;min-width:0}
@media (hover:hover){.wt-attn-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wt-attn-row .wt-glyph{margin-top:2px}.wt-attn-row .wt-chevron{margin-top:3px}
.wt-attn-text{display:flex;flex-direction:column;flex:1 1 auto;min-width:0}
.wt-attn-step{font-weight:500;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wt-attn-why{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.wt-deliv{display:flex;flex-direction:column;gap:6px}
.wt-deliv .wt-chips{align-items:center;margin:0}
.wt-count{color:var(--dsw-alias-label-tertiary);font-weight:400}
.wt-outcome-text{white-space:pre-wrap;overflow-wrap:anywhere}
.wt-outcome-text[data-clamped=true]{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.wt-eyebrow{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.wt-pill{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px 0 6px;border-radius:11px;font-weight:500;
  color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-card-fill,var(--dsw-alias-bg-layer-1))}
.wt-pill .wt-glyph{width:14px;height:14px}
.wt-pill[data-tone=active]{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary,var(--dsw-alias-bg-layer-1))}
.wt-pill[data-tone=blocked]{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary));background:var(--dsw-alias-state-warn-tertiary,var(--dsw-alias-bg-layer-1))}
.wt-pill[data-tone=completed]{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-state-success-tertiary,var(--dsw-alias-bg-layer-1))}
.wt-tag{padding:0 6px;border-radius:var(--dsw-radius-xs,4px);border:0.5px solid var(--dsw-alias-border-l2)}
.wt-head h2{font-size:16px;line-height:24px;font-weight:600;overflow-wrap:anywhere}
.wt-objective{color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere}
:where(.wt-head) [data-clamped=true]{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.wt-progress{display:flex;flex-direction:column;gap:6px}
.wt-progress-text{display:flex;flex-wrap:wrap;gap:0 12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}
.wt-progress-text strong{color:var(--dsw-alias-label-primary);font-weight:500}
.wt-progress-text [data-tone=warn]{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.wt-outcome{padding:6px 0 0 10px;
  border-left:2px solid var(--dsw-alias-border-l2);overflow-wrap:anywhere;white-space:pre-wrap}
.wt-outcome[data-tone=completed]{border-left-color:var(--dsw-alias-state-success-primary)}
.wt-label{display:block;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;font-weight:500}
.wt-note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.wt-tabs{flex:none;display:flex;gap:2px;margin:0 20px;padding:2px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-card-fill,var(--dsw-alias-bg-layer-1))}
.wt-tab{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:0;height:28px;padding:0 8px;
  border-radius:6px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
@media (hover:hover){.wt-tab:hover{color:var(--dsw-alias-label-primary)}}
.wt-tab[aria-selected=true]{color:var(--dsw-alias-label-primary);font-weight:500;background:var(--dsw-alias-bg-base);
  box-shadow:0 0 0 0.5px var(--dsw-alias-border-l1)}
.wt-tab-count{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;font-variant-numeric:tabular-nums}
.wt-body{flex:none;padding:14px 20px 24px}
.wt-body>.wt-error{margin-bottom:10px}
.wt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;height:100%;min-height:200px;padding:32px 28px;text-align:center}
.wt-empty svg{color:var(--dsw-alias-label-tertiary);margin-bottom:4px}
.wt-empty h2{font-size:14px;line-height:22px;font-weight:500}
.wt-empty p,.wt-inline-empty{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;max-width:320px}
.wt-inline-empty{padding:12px 0}

/* Plan stepper. */
.wt-steps{display:flex;flex-direction:column}
.wt-step{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr);column-gap:12px;padding:6px 8px 14px;margin:0 -8px;border-radius:var(--dsw-radius-sm,8px);scroll-margin:12px}
.wt-step:not(:last-child)::before{content:'';position:absolute;left:15.5px;top:28px;bottom:-4px;width:1px;background:var(--dsw-alias-border-l2)}
.wt-step[data-status=completed]:not(:last-child)::before{background:var(--dsw-alias-state-success-primary);opacity:.45}
.wt-step .wt-glyph{margin-top:2px}
.wt-step[data-focus=true]{background:var(--dsw-alias-card-fill,var(--dsw-alias-bg-layer-1))}
.wt-step[data-selected=true]{box-shadow:inset 0 0 0 1px var(--dsw-alias-state-business-primary)}
.wt-step:focus{outline:none}
.wt-step-main{display:flex;flex-direction:column;gap:4px;min-width:0}
.wt-step-head{display:flex;align-items:baseline;gap:8px;min-width:0}
.wt-step-title{flex:1 1 auto;min-width:0;overflow-wrap:anywhere;font-weight:500}
.wt-step[data-status=pending] .wt-step-title{font-weight:400}
.wt-step[data-status=canceled] .wt-step-title{color:var(--dsw-alias-label-tertiary);text-decoration:line-through;font-weight:400}
.wt-now{flex:none;padding:0 6px;border-radius:var(--dsw-radius-xs,4px);font-size:11px;line-height:18px;font-weight:500;
  color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary,transparent)}
.wt-step-status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.wt-callout{padding:6px 10px;border-radius:var(--dsw-radius-sm,8px);overflow-wrap:anywhere;white-space:pre-wrap;
  color:var(--dsw-alias-label-primary);background:var(--dsw-alias-state-warn-tertiary,var(--dsw-alias-bg-layer-1))}
.wt-callout .wt-label{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.wt-step-outcome{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;white-space:pre-wrap}
.wt-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
.wt-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;height:26px;padding:0 8px;border-radius:var(--dsw-radius-sm,8px);
  border:0.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary-dimmed,var(--dsw-alias-label-primary));font-size:12px}
@media (hover:hover){.wt-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wt-chip svg{flex:none;color:var(--dsw-alias-label-tertiary)}
.wt-chip[data-role=deliverable] svg{color:var(--dsw-alias-link,var(--dsw-alias-brand-primary))}

/* Process timeline. */
.wt-revs{display:flex;flex-direction:column}
.wt-rev{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr);column-gap:12px;padding-bottom:18px}
.wt-rev:not(:last-child)::before{content:'';position:absolute;left:7.5px;top:14px;bottom:-2px;width:1px;background:var(--dsw-alias-border-l2)}
.wt-rev-dot{width:9px;height:9px;margin:6px auto 0;border-radius:50%;border:1.5px solid var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-base)}
.wt-rev[data-latest=true] .wt-rev-dot{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary)}
.wt-rev-main{display:flex;flex-direction:column;gap:6px;min-width:0}
.wt-rev-head{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px}
.wt-rev-head strong{font-weight:500}
.wt-rev-head time{color:var(--dsw-alias-label-tertiary);font-size:12px}
.wt-rev-reason{overflow-wrap:anywhere;white-space:pre-wrap;color:var(--dsw-alias-label-secondary)}
.wt-changes{display:flex;flex-direction:column;border-radius:var(--dsw-radius-sm,8px);border:0.5px solid var(--dsw-alias-border-l1);overflow:hidden}
.wt-change{display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:5px 10px;min-width:0}
.wt-changes>li+li{border-top:0.5px solid var(--dsw-alias-border-l1)}
@media (hover:hover){.wt-change:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.wt-change-title{flex:1 1 auto}
.wt-change-delta{flex:none;max-width:55%;color:var(--dsw-alias-label-tertiary);font-size:12px}
.wt-change-delta b{font-weight:500;color:var(--dsw-alias-label-secondary)}
.wt-work-change{color:var(--dsw-alias-label-secondary);font-size:12px}

/* Artifacts. */
.wt-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:8px;min-width:0}
.wt-toolbar label{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px}
.wt-toolbar select{flex:1 1 auto;min-width:0;max-width:100%;height:28px;padding:0 6px;border-radius:var(--dsw-radius-sm,8px);
  border:0.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
.wt-group+.wt-group{margin-top:18px}
.wt-group h3{display:flex;gap:6px;margin-bottom:8px;font-size:12px;line-height:18px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.wt-group h3 span{color:var(--dsw-alias-label-tertiary);font-weight:400}
.wt-files{display:flex;flex-direction:column;gap:8px}
.wt-file{border-radius:var(--dsw-radius-md,12px);border:0.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-card-fill,var(--dsw-alias-bg-layer-1));scroll-margin:12px;overflow:hidden}
.wt-file[data-selected=true]{box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary)}
.wt-file:focus{outline:none}
.wt-file-open{display:grid;grid-template-columns:32px minmax(0,1fr);gap:10px;width:100%;padding:10px 12px;align-items:start}
@media (hover:hover){.wt-file-open:hover{background:var(--dsw-alias-card-fill-hover,var(--dsw-alias-interactive-bg-hover))}}
.wt-file-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:8px;border:0.5px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-tertiary)}
.wt-file[data-role=deliverable] .wt-file-icon{color:var(--dsw-alias-link,var(--dsw-alias-brand-primary))}
.wt-file-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.wt-file-name{font-weight:500;overflow-wrap:anywhere}
.wt-file-path{font-family:var(--ds-font-family-code,ui-monospace,Menlo,Consolas);font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.wt-file-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere;white-space:pre-wrap}
.wt-file-step{display:flex;padding:0 12px 10px 54px}
.wt-link{max-width:100%;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;border-radius:4px}
@media (hover:hover){.wt-link:hover{color:var(--dsw-alias-link,var(--dsw-alias-brand-primary))}}

@container (max-width:360px){
  .wt-head{padding:12px 14px 10px}.wt-tabs{margin:0 14px}.wt-body{padding:12px 14px 20px}
  .wt-tab-count{display:none}.wt-file-step{padding-left:12px}.wt-change{flex-wrap:wrap}.wt-change-delta{max-width:100%}
}

`
    const encode = value => encodeURIComponent(value).replace(/%3A/gi, ':')
    // Public Session file-address format; opening stays in the Host's authorized filesystem.
    const fileAddress = (sessionId, path) => `dsh-resource://file/session/${encode(sessionId)}/${path.replace(/\\/g, '/').split('/').map(encode).join('/')}`
    const svg = (size, viewBox, children, extra) => h('svg', { width: size, height: size, viewBox, fill: 'none', 'aria-hidden': true, focusable: 'false', ...extra }, ...children)

    /** Work glyph: two finished steps run along a rail into the document they produced. */
    function WorkGlyph({ size = 16, className }) {
      return svg(size, '0 0 24 24', [
        h('path', { key: 'd', d: 'M13 4h4.2L21 7.8v10.7a1.5 1.5 0 0 1-1.5 1.5H13a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 13 4Z', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' }),
        h('path', { key: 'f', d: 'M17 4.2v3a.8.8 0 0 0 .8.8h3', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' }),
        h('path', { key: 'l', d: 'M14.5 12h3.5M14.5 15h2.5', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('path', { key: 'r', d: 'M5 8.6v1.8M5 14.4c0 2.5 1.6 4 4 4h2.5', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('circle', { key: 'a', cx: 5, cy: 6.5, r: 1.9, fill: 'currentColor' }),
        h('circle', { key: 'b', cx: 5, cy: 12.5, r: 1.9, fill: 'currentColor' }),
      ], { className })
    }
    function StatusGlyph({ status }) {
      const ring = h('circle', { key: 'ring', cx: 8, cy: 8, r: 5.75, stroke: 'currentColor', strokeWidth: 1.5 })
      const parts = {
        pending: [ring],
        in_progress: [ring, h('path', { key: 'half', d: 'M8 4.5a3.5 3.5 0 0 1 0 7Z', fill: 'currentColor' })],
        blocked: [ring, h('path', { key: 'bar', d: 'M8 5v3.4', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }), h('circle', { key: 'dot', cx: 8, cy: 10.75, r: 0.9, fill: 'currentColor' })],
        completed: [h('circle', { key: 'fill', cx: 8, cy: 8, r: 6.5, fill: 'currentColor' }), h('path', { key: 'check', className: 'wt-on', d: 'M5.4 8.2l1.8 1.8 3.5-3.7', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' })],
        canceled: [ring, h('path', { key: 'slash', d: 'M5.5 10.5l5-5', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' })],
      }
      return h('span', { className: 'wt-glyph', 'data-status': status }, svg(16, '0 0 16 16', parts[status] ?? parts.pending))
    }
    const FileGlyph = ({ size = 14 }) => svg(size, '0 0 16 16', [
      h('path', { key: 'p', d: 'M4.5 2h4.6L12 4.9v8.6a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Z', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }),
      h('path', { key: 'f', d: 'M9 2.2V5h2.8', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }),
    ])
    const Chevron = ({ up, down }) => h('span', { className: 'wt-chevron', 'aria-hidden': true },
      svg(14, '0 0 16 16', [h('path', { key: 'c', d: up ? 'M4 10l4-4 4 4' : down ? 'M4 6l4 4 4-4' : 'M6 4l4 4-4 4', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' })]))

    const count = steps => {
      const result = { pending: 0, in_progress: 0, blocked: 0, completed: 0, canceled: 0 }
      for (const step of steps) result[step.status] += 1
      return { ...result, total: steps.length - result.canceled }
    }
    const focusOf = steps => steps.find(step => step.status === 'blocked') ?? steps.find(step => step.status === 'in_progress') ?? steps.find(step => step.status === 'pending')
    const toneOf = snapshot => snapshot.status !== 'active' ? snapshot.status : snapshot.steps.some(step => step.status === 'blocked') ? 'blocked' : 'active'
    const glyphOf = tone => tone === 'active' ? 'in_progress' : tone
    const progressText = (sum, t) => sum.total === 0 ? t(sum.canceled ? 'progressCanceled' : 'progressEmpty') : t('progress', { done: sum.completed, total: sum.total })
    function Meter({ steps }) {
      // One segment per step keeps order visible; long plans collapse into proportional runs.
      const segments = steps.length <= 24
        ? steps.map(step => ({ key: step.id, status: step.status, grow: 1 }))
        : ['completed', 'in_progress', 'blocked', 'pending', 'canceled'].map(status => ({ key: status, status, grow: steps.filter(step => step.status === status).length })).filter(item => item.grow)
      return h('span', { className: 'wt-meter', 'aria-hidden': true }, segments.map(item => h('span', { key: item.key, 'data-status': item.status, style: { flexGrow: item.grow } })))
    }

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs'],
      apply(ctx) {
        for (const [language, dictionary] of Object.entries(DICTS)) ctx.effect(() => ctx.locale.register(KEY, language, dictionary))
        const translate = ctx.locale.bind(KEY)
        const subscribe = listener => ctx.locale.subscribe(listener)
        const getLocale = () => ctx.locale.getSnapshot()
        function useLocale() { React.useSyncExternalStore(subscribe, getLocale); return translate }
        const formatTime = time => {
          try { return new Intl.DateTimeFormat(getLocale().active, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(time)) }
          catch { return new Date(time).toLocaleString() }
        }
        const style = h('style', null, CSS)

        function LegacyDock({ todos, t }) {
          const [open, setOpen] = React.useState(false)
          const sum = count(todos)
          return h('div', { className: 'wt wt-dock' }, style,
            h('section', { className: 'wt-card', 'aria-label': t('legacy') },
              h('button', { type: 'button', className: 'wt-dock-main', 'aria-expanded': open, onClick: () => setOpen(value => !value) },
                h('span', { className: 'wt-glyph', 'aria-hidden': true }, h(WorkGlyph, { size: 16 })),
                h('span', { className: 'wt-dock-title wt-ellipsis' }, t('legacy')),
                h('span', { className: 'wt-dock-focus wt-ellipsis' }, focusOf(todos)?.content ?? ''),
                h('span', { className: 'wt-dock-count' }, sum.total ? `${sum.completed}/${sum.total}` : progressText(sum, t)),
                h(Chevron, { up: !open, down: open })),
              open && h('ul', { className: 'wt-legacy-list' }, todos.map((item, index) => h('li', { key: `${index}:${item.content}` },
                h(StatusGlyph, { status: item.status }), h('span', { className: 'wt-sr' }, t(item.status)),
                h('span', { className: 'wt-ellipsis' }, item.content))))))
        }

        function Dock({ useProjection }) {
          const t = useLocale()
          const state = useProjection(KEY)
          const todos = useProjection('todos')
          const [error, setError] = React.useState('')
          const current = state?.current
          if (!current) return todos?.length ? h(LegacyDock, { todos, t }) : null
          const snapshot = current.snapshot
          const tone = toneOf(snapshot)
          const sum = count(snapshot.steps)
          const focus = snapshot.status === 'active' ? focusOf(snapshot.steps) : undefined
          const blockedCount = snapshot.steps.filter(step => step.status === 'blocked').length
          const detail = !focus ? snapshot.outcome : focus.status !== 'blocked' ? focus.content
            : blockedCount > 1 ? t('blockedMany', { n: blockedCount, reason: focus.blocker }) : t('blockedBy', { reason: focus.blocker })
          const open = () => {
            try { ctx.sidebarRight.openTab(KEY); setError('') } catch (failure) { setError(failure.message) }
          }
          return h('div', { className: 'wt wt-dock' }, style,
            h('div', { className: 'wt-card' },
              h('button', {
                type: 'button', className: 'wt-dock-main', onClick: open, title: t('open'),
                'aria-label': t('dockLabel', { title: snapshot.title, progress: `${t(`work.${tone}`)}, ${progressText(sum, t)}` }),
              },
              h(StatusGlyph, { status: glyphOf(tone) }),
              h('span', { className: 'wt-dock-title wt-ellipsis' }, snapshot.title),
              h('span', { className: 'wt-dock-focus wt-ellipsis', 'data-status': focus?.status }, detail),
              sum.total > 0 && h('span', { className: 'wt-dock-count' }, `${sum.completed}/${sum.total}`),
              sum.total > 0 && h(Meter, { steps: snapshot.steps }),
              h(Chevron, {})),
              error && h('p', { role: 'alert', className: 'wt-error' }, t('error', { message: error }))))
        }


        /** What the reader should look at first: every blocker, else reported in-progress steps, else the next pending step. */
        function Attention({ snapshot, showStep, t }) {
          if (snapshot.status !== 'active') return null
          const blocked = snapshot.steps.filter(step => step.status === 'blocked')
          const active = snapshot.steps.filter(step => step.status === 'in_progress')
          const next = snapshot.steps.find(step => step.status === 'pending')
          const [kind, items] = blocked.length ? ['blocked', blocked] : active.length ? ['in_progress', active] : next ? ['next', [next]] : []
          if (!kind) return null
          const shown = items.slice(0, 2)
          return h('div', { className: 'wt-attn', 'data-kind': kind },
            h('span', { className: 'wt-label' }, t(`attn.${kind}`, { n: items.length })),
            h('ul', null, shown.map(step => h('li', { key: step.id },
              h('button', { type: 'button', className: 'wt-attn-row', title: t('showInPlan'), onClick: () => showStep(step.id) },
                h(StatusGlyph, { status: step.status }),
                h('span', { className: 'wt-attn-text' },
                  h('span', { className: 'wt-attn-step' }, step.content),
                  step.blocker && h('span', { className: 'wt-attn-why' }, step.blocker)),
                h(Chevron, {}))))),
            items.length > shown.length && h('button', { type: 'button', className: 'wt-link', onClick: () => showStep(items[shown.length].id) },
              t(`more.${kind}`, { n: items.length - shown.length })))
        }

        /** Explicit deliverables only; evidence stays in the Artifacts view and no file is promoted as primary or latest. */
        function Deliverables({ snapshot, preview, openAll, t }) {
          const items = snapshot.artifacts.filter(artifact => artifact.role === 'deliverable')
          if (!items.length) return null
          const shown = items.slice(0, 3)
          return h('div', { className: 'wt-deliv' },
            h('span', { className: 'wt-label' }, t('group.deliverable'), ' ', h('span', { className: 'wt-count' }, items.length)),
            h('div', { className: 'wt-chips' },
              shown.map(artifact => h('button', {
                key: artifact.id, type: 'button', className: 'wt-chip', 'data-role': 'deliverable', title: artifact.path,
                'aria-label': t('openFile', { name: artifact.title }), onClick: () => preview(artifact),
              }, h(FileGlyph, {}), h('span', { className: 'wt-ellipsis' }, artifact.title))),
              items.length > shown.length && h('button', { type: 'button', className: 'wt-link', onClick: openAll }, t('viewAll', { n: items.length }))))
        }

        function Overview({ state, details, setDetails, showStep, preview, openAll, prefix, t }) {
          const work = state.current
          const snapshot = work.snapshot
          const tone = toneOf(snapshot)
          const sum = count(snapshot.steps)
          const latest = state.history.at(-1)
          // Clamped text has one guaranteed full-text entry: the always-present Details toggle.
          const clamp = !details
          return h('header', { className: 'wt-head', 'aria-label': t('overview') },
            h('div', { className: 'wt-eyebrow' },
              h('span', { className: 'wt-pill', 'data-tone': tone, title: t('reported') }, h(StatusGlyph, { status: glyphOf(tone) }), t(`work.${tone}`)),
              state.inherited && h('span', { className: 'wt-tag' }, t('inherited')),
              h('button', { type: 'button', className: 'wt-link wt-meta-toggle', 'aria-expanded': details, 'aria-controls': `${prefix}-meta`, onClick: () => setDetails(value => !value) },
                t(details ? 'showLess' : 'details'), h(Chevron, { up: details, down: !details }))),
            details && h('div', { className: 'wt-meta', id: `${prefix}-meta` },
              h('p', null, t('revisionShort', { n: work.revision }),
                latest && h(React.Fragment, null, ' · ', h('time', { dateTime: new Date(latest.time).toISOString() }, t('updatedAt', { time: formatTime(latest.time) })))),
              h('p', null, t('reported')),
              state.inherited && h('p', null, t('inheritedHint'))),
            h('h2', { 'data-clamped': clamp }, snapshot.title),
            h('p', { className: 'wt-objective', 'data-clamped': clamp }, snapshot.objective),
            snapshot.steps.length > 0 && h('div', { className: 'wt-progress' },
              h(Meter, { steps: snapshot.steps }),
              h('p', { className: 'wt-progress-text' },
                h('strong', null, progressText(sum, t)),
                sum.blocked > 0 && h('span', { 'data-tone': 'warn' }, t('countBlocked', { n: sum.blocked })),
                sum.canceled > 0 && h('span', null, t('countCanceled', { n: sum.canceled })))),
            h(Attention, { snapshot, showStep, t }),
            snapshot.outcome && h('div', { className: 'wt-outcome', 'data-tone': snapshot.status },
              h('span', { className: 'wt-label' }, t('outcome')),
              h('p', { className: 'wt-outcome-text', 'data-clamped': clamp }, snapshot.outcome)),
            h(Deliverables, { snapshot, preview, openAll, t }))
        }

        function PlanView({ snapshot, selected, register, preview, t }) {
          if (!snapshot.steps.length) return h('p', { className: 'wt-inline-empty' }, t('noSteps'))
          const focus = snapshot.status === 'active' ? focusOf(snapshot.steps) : undefined
          return h('ol', { className: 'wt-steps', 'aria-label': t('plan') }, snapshot.steps.map(step => {
            const linked = snapshot.artifacts.filter(artifact => artifact.stepId === step.id)
            return h('li', {
              key: step.id, className: 'wt-step', tabIndex: -1, ref: register(`step:${step.id}`),
              'data-status': step.status, 'data-focus': step === focus, 'data-selected': step.id === selected,
              'aria-current': step === focus ? 'step' : undefined,
            },
            h(StatusGlyph, { status: step.status }),
            h('div', { className: 'wt-step-main' },
              h('div', { className: 'wt-step-head' },
                h('span', { className: 'wt-step-title' }, step.content),
                step === focus && h('span', { className: 'wt-now' }, t('now'))),
              h('span', { className: 'wt-step-status' }, t(step.status)),
              step.blocker && h('div', { className: 'wt-callout' }, h('span', { className: 'wt-label' }, t('waitingOn')), step.blocker),
              step.outcome && h('p', { className: 'wt-step-outcome' }, step.outcome),
              linked.length > 0 && h('div', { className: 'wt-chips' }, linked.map(artifact => h('button', {
                key: artifact.id, type: 'button', className: 'wt-chip', 'data-role': artifact.role,
                title: artifact.path, 'aria-label': `${t('openFile', { name: artifact.title })} (${t(artifact.role)})`,
                onClick: () => preview(artifact),
              }, h(FileGlyph, {}), h('span', { className: 'wt-ellipsis' }, artifact.title))))))
          }))
        }

        function ProcessView({ state, showStep, showArtifact, t }) {
          const { history, current } = state
          if (!history.length) return h('p', { className: 'wt-inline-empty' }, t('noHistory'))
          const steps = new Set(current.snapshot.steps.map(step => step.id))
          const artifacts = new Set(current.snapshot.artifacts.map(artifact => artifact.id))
          const delta = change => h('span', { className: 'wt-change-delta wt-ellipsis' }, change.previous && change.previous !== change.status
            ? h(React.Fragment, null, t(change.previous), ' → ', h('b', null, t(change.status)))
            : h(React.Fragment, null, t(change.previous ? 'changeUpdated' : 'changeAdded'), ' · ', h('b', null, t(change.status))))
          const item = (change, onClick) => h('li', { key: change.key },
            h('button', { type: 'button', className: 'wt-change', onClick, disabled: !onClick },
              change.artifact ? h('span', { className: 'wt-glyph' }, h(FileGlyph, {})) : h(StatusGlyph, { status: change.status }),
              h('span', { className: 'wt-change-title wt-ellipsis' }, change.title), delta(change)))
          return h(React.Fragment, null,
            current.revision > history.length && h('p', { className: 'wt-note', style: { marginBottom: 12 } }, t('earlier', { n: history.length })),
            h('ol', { className: 'wt-revs', 'aria-label': t('process') }, history.map((row, index) => {
              const previous = history[index - 1]
              const workChanged = previous ? previous.status !== row.status : row.revision === 1 && row.status !== 'active'
              const changes = [
                ...row.steps.map(change => item({ ...change, key: `s:${change.id}` }, steps.has(change.id) ? () => showStep(change.id) : undefined)),
                ...row.artifacts.map(change => item({ ...change, key: `a:${change.id}`, artifact: true }, artifacts.has(change.id) ? () => showArtifact(change.id) : undefined)),
              ]
              return h('li', { key: row.revision, className: 'wt-rev', 'data-latest': index === history.length - 1 },
                h('span', { className: 'wt-rev-dot', 'aria-hidden': true }),
                h('div', { className: 'wt-rev-main' },
                  h('div', { className: 'wt-rev-head' },
                    h('strong', null, t('revision', { n: row.revision })),
                    index === history.length - 1 && h('span', { className: 'wt-now' }, t('latest')),
                    h('time', { dateTime: new Date(row.time).toISOString() }, formatTime(row.time))),
                  h('p', { className: 'wt-rev-reason' }, row.reason),
                  workChanged && h('p', { className: 'wt-work-change' }, t('workChanged', { status: t(`work.${row.status}`) })),
                  changes.length ? h('ul', { className: 'wt-changes' }, changes) : h('p', { className: 'wt-note' }, t('noChanges'))))
            }).toReversed()))
        }

        function ArtifactsView({ snapshot, filter, setFilter, selected, register, preview, showStep, filterId, t }) {
          if (!snapshot.artifacts.length) return h('p', { className: 'wt-inline-empty' }, t('noArtifacts'))
          const steps = new Map(snapshot.steps.map(step => [step.id, step]))
          const used = snapshot.steps.filter(step => snapshot.artifacts.some(artifact => artifact.stepId === step.id))
          const hasUnlinked = snapshot.artifacts.some(artifact => !artifact.stepId)
          const visible = snapshot.artifacts.filter(artifact => !filter || (filter === '\0' ? !artifact.stepId : artifact.stepId === filter))
          return h(React.Fragment, null,
            used.length > 0 && h('div', { className: 'wt-toolbar' },
              h('label', { htmlFor: filterId }, t('filterStep')),
              h('select', { id: filterId, value: filter, onChange: event => setFilter(event.target.value) },
                h('option', { value: '' }, t('allSteps')),
                used.map(step => h('option', { key: step.id, value: step.id }, step.content)),
                hasUnlinked && h('option', { value: '\0' }, t('unlinked')))),
            h('p', { className: 'wt-note', style: { marginBottom: 14 } }, t('fileNote')),
            visible.length === 0 && h('p', { className: 'wt-inline-empty' }, t('noArtifactsFilter')),
            ROLES.map(role => {
              const items = visible.filter(artifact => artifact.role === role)
              if (!items.length) return null
              return h('section', { key: role, className: 'wt-group', 'aria-label': t(`group.${role}`) },
                h('h3', null, t(`group.${role}`), h('span', null, items.length)),
                h('ul', { className: 'wt-files' }, items.map(artifact => h('li', {
                  key: artifact.id, className: 'wt-file', 'data-role': role, 'data-selected': artifact.id === selected,
                  tabIndex: -1, ref: register(`artifact:${artifact.id}`),
                },
                h('button', { type: 'button', className: 'wt-file-open', onClick: () => preview(artifact), 'aria-label': `${t('openFile', { name: artifact.title })}, ${artifact.path}` },
                  h('span', { className: 'wt-file-icon', 'aria-hidden': true }, h(FileGlyph, { size: 16 })),
                  h('span', { className: 'wt-file-text' },
                    h('span', { className: 'wt-file-name' }, artifact.title),
                    h('span', { className: 'wt-file-path' }, artifact.path),
                    artifact.description && h('span', { className: 'wt-file-desc' }, artifact.description))),
                artifact.stepId && steps.has(artifact.stepId) && h('div', { className: 'wt-file-step' },
                  h('button', { type: 'button', className: 'wt-link wt-ellipsis', title: t('showInPlan'), onClick: () => showStep(artifact.stepId) },
                    t('stepRef', { title: steps.get(artifact.stepId).content })))))))
            }))
        }

        function WorkBody({ state, sessionId, actions }) {
          const t = useLocale()
          const snapshot = state.current.snapshot
          const [view, setView] = React.useState('plan')
          const [target, setTarget] = React.useState(null)
          const [filter, setFilter] = React.useState('')
          const [error, setError] = React.useState('')
          const [details, setDetails] = React.useState(false)
          const [jump, setJump] = React.useState(0)
          const nodes = React.useRef(new Map())
          const tabs = React.useRef([])
          const strip = React.useRef(null)
          const prefix = React.useId()
          const register = key => element => { if (element) nodes.current.set(key, element); else nodes.current.delete(key) }
          React.useEffect(() => {
            if (!target) return
            const element = nodes.current.get(target)
            element?.scrollIntoView?.({ block: 'nearest' })
            element?.focus({ preventScroll: true })
          }, [target, view, jump])
          // The page is the only scroller: keep the tab strip in view so the selected view starts on screen.
          const select = next => { setView(next); setTarget(null); strip.current?.scrollIntoView?.({ block: 'start' }) }
          const locate = key => { setTarget(key); setJump(value => value + 1) }
          const showStep = id => { setView('plan'); locate(`step:${id}`) }
          const showArtifact = id => { setView('artifacts'); setFilter(''); locate(`artifact:${id}`) }
          const preview = artifact => {
            try { actions.openResource(fileAddress(sessionId, artifact.path), { destination: 'sidebar' }); setError('') }
            catch (failure) { setError(failure.message) }
          }
          const onKeyDown = event => {
            const index = VIEWS.indexOf(view)
            const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: VIEWS.length - 1 }[event.key]
            if (next === undefined) return
            event.preventDefault()
            const wrapped = (next + VIEWS.length) % VIEWS.length
            select(VIEWS[wrapped])
            tabs.current[wrapped]?.focus()
          }
          const counts = { plan: snapshot.steps.length, process: state.current.revision, artifacts: snapshot.artifacts.length }
          const selected = target?.split(':').slice(1).join(':')
          const openAll = () => { setFilter(''); select('artifacts') }
          return h('section', { className: 'wt wt-page', 'aria-label': t('title') }, style,
            h(Overview, { state, details, setDetails, showStep, preview, openAll, prefix, t }),
            error && h('p', { role: 'alert', className: 'wt-error wt-page-error' }, t('error', { message: error })),
            h('div', { className: 'wt-tabs', ref: strip, role: 'tablist', 'aria-label': t('views'), onKeyDown }, VIEWS.map((name, index) => h('button', {
              key: name, type: 'button', role: 'tab', className: 'wt-tab', id: `${prefix}-${name}`,
              'aria-selected': view === name, 'aria-controls': `${prefix}-panel`, tabIndex: view === name ? 0 : -1,
              ref: element => { tabs.current[index] = element }, onClick: () => select(name),
            }, t(name), h('span', { className: 'wt-tab-count' }, counts[name])))),
            h('div', { className: 'wt-body', role: 'tabpanel', tabIndex: 0, id: `${prefix}-panel`, 'aria-labelledby': `${prefix}-${view}` },
              view === 'plan' ? h(PlanView, { snapshot, selected: target?.startsWith('step:') ? selected : '', register, preview, t })
                : view === 'process' ? h(ProcessView, { state, showStep, showArtifact, t })
                  : h(ArtifactsView, { snapshot, filter, setFilter, selected: target?.startsWith('artifact:') ? selected : '', register, preview, showStep, filterId: `${prefix}-filter`, t })))
        }

        function Panel({ useProjection, useTabInfo, sessionId }) {
          const t = useLocale()
          const state = useProjection(KEY)
          const { tab } = useTabInfo()
          if (!state?.current) {
            return h('section', { className: 'wt wt-page', 'aria-label': t('title') }, style,
              h('div', { className: 'wt-empty' }, h(WorkGlyph, { size: 32 }), h('h2', null, t('emptyTitle')), h('p', null, t('emptyBody'))))
          }
          return h(WorkBody, { key: `${sessionId}:${state.current.id}`, state, sessionId, actions: tab.actions })
        }

        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: TYPE, kind: KEY, title: () => translate('title'),
          guide: [{ id: 'work', order: 30, icon: WorkGlyph, title: () => translate('title'), description: () => `${translate('plan')} · ${translate('process')} · ${translate('artifacts')}` }],
        }))
        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TYPE }, Panel))
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'todo', order: 0 }, Dock))
      },
    }
  },
})
