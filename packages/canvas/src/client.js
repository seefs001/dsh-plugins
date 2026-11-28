window.__ModuleLoader__.load({
  id: 'dsh-canvas',
  factory(require) {
    const React = require('react')
    let primitives = null
    try { primitives = require('@deepseek-ai/dsh-client-ui-primitives') } catch {}
    const h = React.createElement
    const KEY = 'dsh-canvas'
    const NS = 'canvas'
    const VIEWS = ['preview', 'source', 'history', 'inspect']

    const DICTS = {
      en: {
        title: 'Canvas',
        subtitle: 'Live sandboxed React, HTML, and SVG artifacts with reactive data binding',
        modeLabel: 'Session Canvas',
        modeOn: 'Enabled for this session (skill & tools active)',
        modeOff: 'Disabled for this session (zero prompt/tool injection)',
        on: 'On',
        off: 'Off',
        newCanvas: 'New',
        newTitle: 'New Canvas',
        newPrompt: 'Canvas name (kebab-case or .canvas.html / .canvas.svg)',
        create: 'Create',
        cancel: 'Cancel',
        fromTemplate: 'Templates',
        refresh: 'Refresh',
        openFile: 'Open file',
        fullscreen: 'Fullscreen',
        exportHtml: 'Export',
        exported: 'Exported standalone artifact',
        close: 'Close',
        preview: 'Preview',
        source: 'Source',
        history: 'History',
        inspect: 'Diagnostics',
        save: 'Save & Recompile',
        saving: 'Saving…',
        copy: 'Copy',
        copied: 'Copied',
        delete: 'Delete',
        deleteTitle: 'Delete Canvas',
        confirmDelete: 'Delete {name} from disk?',
        deleteWarning: 'This permanently removes the file from disk.',
        restore: 'Restore',
        resetState: 'Reset state',
        askFix: 'Ask Agent to Fix',
        noWorkspace: 'This session has no workspace directory yet.',
        emptyTitle: 'No Canvas artifacts yet',
        emptyBody: 'Enable Session Canvas above to let the agent author interactive .canvas.tsx / .canvas.html / .canvas.svg views, or start from a template.',
        createStarter: 'Create starter canvas',
        enableSession: 'Enable for this session',
        disableSession: 'Disable for this session',
        loadingRuntime: 'Loading sandbox runtime…',
        compileBlocked: 'Preview paused until blocking syntax or policy errors are fixed.',
        runtimeError: 'Runtime error',
        tsErrors: '{n} errors',
        tsOk: 'OK',
        noDiagnostics: 'No TypeScript or policy diagnostics.',
        persistedState: 'Persisted useCanvasState',
        noState: 'No interactive state stored yet.',
        revisions: 'Revisions',
        noRevisions: 'No saved revisions yet.',
        revLabel: 'Rev {n}',
        activeCount: '{n} canvases',
        dockOpen: 'Open Canvas panel',
        unsaved: 'Unsaved edits',
        actionNotice: 'Copied to clipboard',
        dataPatched: 'Updated data file',
        sessionSent: 'Message sent to session',
        scheduleTriggered: 'Triggered scheduled task',
        iteratePlaceholder: 'Ask agent to tweak this canvas… (Enter to send)',
        iterateSend: 'Iterate',
        openInCanvas: 'Open',
        artifactBuilding: 'Writing artifact…',
        tvStopped: 'Stopped',
        tvInspect: 'Inspect',
        tvOutput: 'OUT',
        fixPrompt: 'Please fix the following errors in `{path}`:\n\n{errors}',
        iteratePrompt: 'Update the canvas `{path}` ({title}):\n{request}',
      },
      zh: {
        title: '画布',
        subtitle: '支持实时数据绑定的沙箱交互式 React / HTML / SVG 画布',
        modeLabel: '当前会话画布',
        modeOn: '已在当前会话启用（已注入画布技能与工具）',
        modeOff: '当前会话未启用（零提示词/工具注入）',
        on: '已开启',
        off: '未开启',
        newCanvas: '新建',
        newTitle: '新建画布',
        newPrompt: '画布名称（kebab-case，或带 .canvas.html / .canvas.svg 后缀）',
        create: '创建',
        cancel: '取消',
        fromTemplate: '模板',
        refresh: '刷新',
        openFile: '打开文件',
        fullscreen: '全屏预览',
        exportHtml: '导出',
        exported: '已导出独立文件',
        close: '关闭',
        preview: '预览',
        source: '源码',
        history: '历史',
        inspect: '诊断与状态',
        save: '保存并重新编译',
        saving: '保存中…',
        copy: '复制',
        copied: '已复制',
        delete: '删除',
        deleteTitle: '删除画布',
        confirmDelete: '确定从磁盘删除 {name}？',
        deleteWarning: '该操作会直接从磁盘移除文件。',
        restore: '恢复此版本',
        resetState: '重置状态',
        askFix: '让智能体修复',
        noWorkspace: '当前会话还没有关联工作区目录。',
        emptyTitle: '暂无画布文件',
        emptyBody: '开启上方“当前会话画布”让智能体编写 .canvas.tsx / .canvas.html / .canvas.svg 交互视图，或从模板新建。',
        createStarter: '创建示例画布',
        enableSession: '在当前会话启用',
        disableSession: '在当前会话关闭',
        loadingRuntime: '正在加载沙箱运行时…',
        compileBlocked: '存在语法或安全策略错误，修复后恢复预览。',
        runtimeError: '运行时错误',
        tsErrors: '{n} 处错误',
        tsOk: '正常',
        noDiagnostics: '无 TypeScript 或策略诊断错误。',
        persistedState: '持久化的 useCanvasState',
        noState: '尚无已保存的交互状态。',
        revisions: '修订记录',
        noRevisions: '暂无修订记录。',
        revLabel: '版本 {n}',
        activeCount: '{n} 个画布',
        dockOpen: '打开画布面板',
        unsaved: '有未保存改动',
        actionNotice: '已复制到剪贴板',
        dataPatched: '已更新数据文件',
        sessionSent: '已发送消息到目标会话',
        scheduleTriggered: '已触发定时任务',
        iteratePlaceholder: '微调这个画布…（按 Enter 发送给智能体）',
        iterateSend: '发送调整',
        openInCanvas: '打开',
        artifactBuilding: '正在编写画布…',
        tvStopped: '已中止',
        tvInspect: '查看',
        tvOutput: '输出',
        fixPrompt: '请修复 `{path}` 中的以下错误：\n\n{errors}',
        iteratePrompt: '请调整画布 `{path}`（{title}）：\n{request}',
      },
    }

    const SANDBOX_UTILITY_CSS = [
      'html,body{margin:0;padding:0;min-height:100%}*{box-sizing:border-box}',
      '.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.block{display:block}.hidden{display:none}',
      '.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.flex-1{flex:1 1 0%}.shrink-0{flex-shrink:0}',
      '.items-center{align-items:center}.items-start{align-items:flex-start}.items-end{align-items:flex-end}',
      '.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}',
      '.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}',
      '.gap-1{gap:4px}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}.gap-6{gap:24px}',
      '.p-1{padding:4px}.p-2{padding:8px}.p-3{padding:12px}.p-4{padding:16px}.p-6{padding:24px}',
      '.px-2{padding-left:8px;padding-right:8px}.px-3{padding-left:12px;padding-right:12px}.px-4{padding-left:16px;padding-right:16px}',
      '.py-1{padding-top:4px;padding-bottom:4px}.py-2{padding-top:8px;padding-bottom:8px}.py-3{padding-top:12px;padding-bottom:12px}',
      '.m-0{margin:0}.mt-2{margin-top:8px}.mt-4{margin-top:16px}.mb-2{margin-bottom:8px}.mb-4{margin-bottom:16px}',
      '.w-full{width:100%}.h-full{height:100%}.min-w-0{min-width:0}',
      '.rounded{border-radius:6px}.rounded-md{border-radius:8px}.rounded-lg{border-radius:12px}.rounded-full{border-radius:999px}',
      '.border{border:1px solid var(--cv-border,rgba(128,128,128,.2))}',
      '.bg-surface{background:var(--cv-surface,rgba(128,128,128,.08))}.bg-elevated{background:var(--cv-elevated,rgba(128,128,128,.12))}',
      '.text-xs{font-size:11px;line-height:16px}.text-sm{font-size:12.5px;line-height:18px}.text-base{font-size:13.5px;line-height:20px}.text-lg{font-size:16px;line-height:24px}.text-xl{font-size:20px;line-height:28px}',
      '.text-muted{color:var(--cv-text-secondary,inherit);opacity:.85}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}',
      '.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}',
      '.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.overflow-auto{overflow:auto}.space-y-2>*+*{margin-top:8px}.space-y-3>*+*{margin-top:12px}.space-y-4>*+*{margin-top:16px}',
    ].join('')

    const TRIGGER_CSS = `
.cv-anchor{display:inline-flex;min-width:0;max-width:100%;overflow:hidden;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px))}
.cv-trigger{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:100%;overflow:hidden;margin:0;padding:1px 8px;border:0;border-radius:var(--dsw-radius-sm,8px);
  background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;cursor:pointer}
.cv-trigger svg{flex:none;width:14px;height:14px}
@media (max-width:600px){.cv-anchor{flex:none}.cv-trigger{min-height:22px;gap:4px;padding:1px 5px}.cv-label{display:none}}
@media (hover:hover){.cv-trigger:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}
.cv-trigger:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.cv-trigger[data-enabled=true]{color:var(--dsw-alias-label-secondary)}
.cv-dot{flex:none;width:6px;height:6px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-success-primary)}
.cv-count{color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:400;font-variant-numeric:tabular-nums}
.cv-tab-icon{flex:none;color:var(--dsw-alias-label-tertiary)}
`

    const CSS = `
.cv{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
:where(.cv) *,:where(.cv) *::before,:where(.cv) *::after{box-sizing:border-box}
:where(.cv) :is(button,select,input,textarea){font:inherit;color:inherit;margin:0}
:where(.cv) button{cursor:pointer;background:transparent;border:0;padding:0;text-align:left}
.cv :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.cv-ellipsis{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}

.cv-dock{container-type:inline-size;flex:none;margin:0 auto;
  width:calc(100% - 2 * var(--dsh-composer-side-clearance,16px) - 4 * var(--dsh-composer-dock-inset,8px));
  max-width:calc(var(--dsh-composer-card-max-width,760px) - 4 * var(--dsh-composer-dock-inset,8px))}
.cv-dock-card{position:relative;isolation:isolate;overflow:hidden;border-radius:var(--dsw-radius-md,12px);
  --dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-panel)}
.cv-dock-card::before{content:'';position:absolute;z-index:-1;inset:0;border-radius:inherit;pointer-events:none;
  background:var(--dsw-specific-menu,var(--dsw-alias-bg-base));backdrop-filter:var(--dsw-menu-backdrop-filter)}
@media (max-width:768px),(pointer:coarse){.cv-dock-card::before{background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));backdrop-filter:none;-webkit-backdrop-filter:none}}
.cv-dock-btn{display:flex;align-items:center;gap:10px;width:100%;min-height:36px;padding:4px 12px;border-radius:inherit}
@media (hover:hover){.cv-dock-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.cv-dock-title{flex:0 1 auto;max-width:48%;font-weight:500}
.cv-dock-path{flex:1 1 0;color:var(--dsw-alias-label-tertiary);font-size:12px;font-family:var(--ds-font-family-code,ui-monospace,monospace)}
.cv-pill{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:999px;font-size:11px;font-weight:500;flex:none}
.cv-pill[data-tone=ok]{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-state-success-tertiary)}
.cv-pill[data-tone=err]{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}
.cv-pill[data-tone=neutral]{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform)}

.cv-panel{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base)}
.cv-head{flex:none;display:flex;flex-direction:column;gap:8px;padding:12px 14px 10px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.cv-row{display:flex;align-items:center;gap:8px;min-width:0}
.cv-row-wrap{display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-width:0}
.cv-mode{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 10px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-card-fill);border:.5px solid var(--dsw-alias-border-l2)}
.cv-mode-copy{display:flex;flex-direction:column;min-width:0}
.cv-mode-title{font-size:12.5px;font-weight:500;line-height:17px}
.cv-mode-hint{font-size:11.5px;color:var(--dsw-alias-label-tertiary);line-height:16px}
.cv-switch{flex:none;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:999px;font-size:11.5px;font-weight:500;border:.5px solid var(--dsw-alias-border-l3);background:transparent;color:var(--dsw-alias-label-secondary);transition:background-color .15s,color .15s}
@media (hover:hover){.cv-switch:hover:not([aria-checked=true]){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.cv-switch[aria-checked=true]{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}

.cv-select{flex:1 1 140px;min-width:0;height:28px;padding:0 24px 0 8px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-module-platform) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 6px center/12px 12px;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;appearance:none}
.cv-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:28px;padding:0 10px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l3);background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:500;white-space:nowrap;transition:background-color .15s}
@media (hover:hover){.cv-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.cv-btn[data-primary=true]:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
.cv-btn:disabled{opacity:.45;cursor:default}
.cv-btn[data-primary=true]{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}
.cv-btn[data-danger=true]{color:var(--dsw-alias-state-error-primary)}
.cv-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}

.cv-tabs{flex:none;display:flex;gap:2px;margin:8px 14px 0;padding:2px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-module-platform)}
.cv-tab{flex:1 1 0;height:26px;padding:0 8px;border-radius:var(--dsw-radius-xs,6px);text-align:center;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap;transition:background-color .15s,color .15s}
@media (hover:hover){.cv-tab:hover:not([aria-selected=true]){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.cv-tab[aria-selected=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}

.cv-banner{flex:none;display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 14px 0;padding:7px 10px;border-radius:var(--dsw-radius-sm,8px);font-size:12px;background:var(--dsw-alias-interactive-bg-hover-danger);border:.5px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,transparent);color:var(--dsw-alias-state-error-primary)}
.cv-notice{flex:none;margin:8px 14px 0;padding:6px 10px;border-radius:var(--dsw-radius-sm,8px);font-size:12px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}

.cv-body{flex:1 1 0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.cv-frame-wrap{flex:1 1 0;min-height:0;position:relative;display:flex;flex-direction:column}
.cv-frame{flex:1 1 0;width:100%;height:100%;border:0;background:var(--dsw-alias-bg-base)}
.cv-scroll{flex:1 1 0;min-height:0;overflow-y:auto;padding:12px 14px 24px;display:flex;flex-direction:column;gap:12px}

.cv-iterate{flex:none;display:flex;align-items:center;gap:6px;padding:8px 12px;border-top:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-card-fill)}
.cv-iterate-input{flex:1 1 0;min-width:0;height:28px;padding:0 10px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:12px}

.cv-editor-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.cv-editor-path{font-size:11.5px;color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code,ui-monospace,monospace)}
.cv-textarea{width:100%;flex:1 1 320px;min-height:280px;padding:10px 12px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:12px;line-height:18px;resize:none;tab-size:2}

.cv-empty{flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:48px 24px;text-align:center;color:var(--dsw-alias-label-tertiary)}
.cv-empty h2{margin:0;font-size:15px;font-weight:500;color:var(--dsw-alias-label-primary)}
.cv-empty p{margin:0;max-width:360px;font-size:13px;line-height:20px}

.cv-diag-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.cv-diag{padding:8px 10px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-card-fill);font-size:12px}
.cv-diag-meta{display:flex;align-items:center;gap:8px;font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:11px;color:var(--dsw-alias-state-error-primary);margin-bottom:3px}
.cv-pre{margin:0;padding:10px 12px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-markdown-code-block);font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:11.5px;line-height:17px;overflow-x:auto;white-space:pre-wrap;word-break:break-word}

.cv-rev-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.cv-rev-row{display:flex;align-items:center;gap:6px;padding:4px 8px 4px 4px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-card-fill)}
.cv-rev-row[data-active=true]{border-color:var(--dsw-alias-border-l3);background:var(--dsw-specific-sidebar-nav-item-active)}
.cv-rev-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:1 1 auto;min-width:0;padding:3px 6px;border-radius:var(--dsw-radius-xs,6px);font-size:12px}
@media (hover:hover){.cv-rev-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.cv-diff{border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-sm,8px);overflow:auto;font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:11.5px;line-height:18px;max-height:360px}
.cv-diff-line{display:flex;white-space:pre;min-width:max-content}
.cv-diff-line[data-type=added]{background:var(--dsw-alias-code-diff-added);color:var(--dsw-alias-state-success-primary)}
.cv-diff-line[data-type=removed]{background:var(--dsw-alias-code-diff-deleted);color:var(--dsw-alias-state-error-primary)}
.cv-diff-num{width:38px;padding:0 5px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;flex:none}
.cv-diff-mark{width:16px;text-align:center;user-select:none;flex:none}

.cv-dialog{box-sizing:border-box;width:96vw;height:92dvh;max-width:100vw;max-height:100dvh;padding:0;margin:auto;border:0;border-radius:var(--dsw-radius-lg,16px);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-prominent);overflow:hidden}
.cv-dialog[open]{display:flex;flex-direction:column}
.cv-dialog::backdrop{background:var(--dsw-alias-bg-mask-1)}
.cv-dialog-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-card-fill)}

.cv-tv{position:relative;display:flex;flex-direction:column;min-width:0}
.cv-tv-row{min-width:0}
.cv-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.cv-tv-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.cv-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.cv-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.cv-tv-suffix{flex:none;margin-left:4px;white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.cv-tv-body{display:flex;flex-direction:column;min-width:0}
.cv-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.cv-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.cv-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.cv-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.cv-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.cv-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.cv-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.cv-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.cv-tv-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.cv-toolcard-actions{position:absolute;top:0;right:0;display:inline-flex;align-items:center;gap:4px;height:calc(24px + var(--dsh-content-font-delta,0px));padding-left:20px;background:linear-gradient(to right,transparent,var(--dsw-alias-bg-base) 18px);opacity:0;transition:opacity 100ms ease}
.cv-tv:hover>.cv-toolcard-actions,.cv-tv:focus-within>.cv-toolcard-actions{opacity:1}
.cv-tv-open{display:inline-flex;align-items:center;height:20px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:16px;cursor:pointer}
.cv-tv-open:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.cv-tv:hover .cv-tv-inspect{opacity:1}.cv-tv-inspect:hover,.cv-tv-open:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.cv-tv-inspect{opacity:1}.cv-toolcard-actions{position:static;align-self:flex-start;height:auto;margin:2px 0 2px 4px;padding-left:0;background:none;opacity:1}}
@media (pointer:coarse){.cv-select,.cv-iterate-input,.cv-textarea{font-size:16px}.cv-select,.cv-iterate-input,.cv-btn{min-height:34px;height:auto;padding-block:4px}}
@media (prefers-reduced-motion:reduce){.cv-tv-inspect,.cv-toolcard-actions{transition:none}}
`

    function CanvasIcon({ size = 14, className }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
        strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className,
      },
      h('rect', { x: 2, y: 2.25, width: 12, height: 11.5, rx: 2 }),
      h('path', { d: 'M2 5.75h12' }),
      h('path', { d: 'M6.25 5.75v8' }),
      h('path', { d: 'M8.75 8.75h2.75' }),
      h('path', { d: 'M8.75 11.25h1.75' }))
    }

    const encode = s => encodeURIComponent(s)
    const fileAddress = (sessionId, path) => `dsh-resource://file/session/${encode(sessionId)}/${path.replace(/\\/g, '/').split('/').map(encode).join('/')}`

    function resolveTargetPath(cwd, target) {
      if (typeof target !== 'string' || !target.trim()) return ''
      const clean = target.trim()
      if (clean.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(clean)) return clean
      if (!cwd) return clean
      return `${cwd.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`
    }

    function readHostTheme(scheme) {
      const overrides = {}
      if (typeof document !== 'undefined' && typeof getComputedStyle === 'function') {
        const cs = getComputedStyle(document.body || document.documentElement)
        const pick = (key, cssVar) => {
          const val = cs.getPropertyValue(cssVar).trim()
          if (val) overrides[key] = val
        }
        pick('bgEditor', '--dsw-alias-bg-base')
        pick('bgChrome', '--dsw-alias-bg-layer-1')
        pick('bgElevated', '--dsw-alias-bg-layer-2')
        pick('textPrimary', '--dsw-alias-label-primary')
        pick('textSecondary', '--dsw-alias-label-secondary')
        pick('textTertiary', '--dsw-alias-label-tertiary')
        pick('accentPrimary', '--dsw-alias-state-business-primary')
        pick('accentControl', '--dsw-alias-state-business-primary')
        pick('success', '--dsw-alias-state-success-primary')
        pick('warn', '--dsw-alias-state-warn-primary')
        pick('error', '--dsw-alias-state-error-primary')
      }
      return { kind: scheme === 'light' ? 'light' : 'dark', overrides }
    }

    function sandboxBootstrap() {
      const nonce = document.currentScript.nonce
      let activeScript = null
      let activeKind = 'react'
      let activePort = null

      function applySimpleTheme(theme) {
        if (!theme || typeof theme !== 'object') return
        const isLight = theme.kind === 'light'
        const o = theme.overrides || {}
        const r = document.documentElement.style
        r.colorScheme = isLight ? 'light' : 'dark'
        r.setProperty('--cv-bg', o.bgEditor || (isLight ? '#ffffff' : '#111318'))
        r.setProperty('--cv-surface', o.bgChrome || (isLight ? '#f6f7f9' : '#171a21'))
        r.setProperty('--cv-elevated', o.bgElevated || (isLight ? '#ffffff' : '#1e222b'))
        r.setProperty('--cv-border', isLight ? 'rgba(17,24,39,0.12)' : 'rgba(255,255,255,0.12)')
        r.setProperty('--cv-text', o.textPrimary || (isLight ? '#111827' : '#eceff4'))
        r.setProperty('--cv-text-secondary', o.textSecondary || (isLight ? '#4b5563' : '#b2bac9'))
        r.setProperty('--cv-accent', o.accentPrimary || (isLight ? '#2563eb' : '#4f8ff7'))
      }

      function runReactCode(code, revisionKey) {
        if (activeScript) activeScript.remove()
        const script = document.createElement('script')
        script.nonce = nonce
        script.textContent = `window.__DSH_CANVAS_RUNTIME__.mountCanvas(function(require, module, exports, React) {\n${code}\n}, ${JSON.stringify(revisionKey)});`
        activeScript = script
        document.body.append(script)
      }

      function runHtmlArtifact(htmlSource, theme) {
        applySimpleTheme(theme)
        const doc = new DOMParser().parseFromString(htmlSource, 'text/html')
        const root = document.getElementById('dsh-canvas-root')
        root.innerHTML = ''
        for (const el of document.head.querySelectorAll('[data-cv-html-style]')) el.remove()
        for (const styleEl of doc.querySelectorAll('style')) {
          const clone = document.createElement('style')
          clone.setAttribute('data-cv-html-style', '1')
          clone.textContent = styleEl.textContent
          document.head.append(clone)
        }
        const scripts = []
        for (const node of Array.from(doc.body.childNodes)) {
          if (node.nodeName === 'SCRIPT') {
            if (!node.getAttribute('src')) scripts.push(node.textContent || '')
          } else {
            root.append(document.importNode(node, true))
          }
        }
        for (const inlineCode of scripts) {
          const s = document.createElement('script')
          s.nonce = nonce
          s.textContent = inlineCode
          root.append(s)
        }
        activePort?.postMessage({ type: 'runtime/ready' }, [])
      }

      function runSvgArtifact(svgSource, theme) {
        applySimpleTheme(theme)
        const root = document.getElementById('dsh-canvas-root')
        root.innerHTML = ''
        const wrap = document.createElement('div')
        wrap.style.cssText = 'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--cv-bg);overflow:auto;'
        wrap.innerHTML = svgSource
        const svg = wrap.querySelector('svg')
        if (svg) svg.style.maxWidth = '100%'
        root.append(wrap)
        activePort?.postMessage({ type: 'runtime/ready' }, [])
      }

      window.addEventListener('error', event => {
        if (window.__DSH_CANVAS_RUNTIME__) {
          window.__DSH_CANVAS_RUNTIME__.reportError(event.message || 'Unhandled canvas error')
        } else if (activePort) {
          activePort.postMessage({ type: 'runtime/error', message: event.message || 'Unhandled artifact error', stack: '' }, [])
        }
      })
      window.addEventListener('unhandledrejection', event => {
        const msg = String(event.reason?.message ?? event.reason ?? 'Unhandled promise rejection')
        if (window.__DSH_CANVAS_RUNTIME__) window.__DSH_CANVAS_RUNTIME__.reportError(msg)
        else activePort?.postMessage({ type: 'runtime/error', message: msg, stack: '' }, [])
      })
      window.addEventListener('message', function receive(event) {
        if (event.source !== window.parent || !event.ports[0]) return
        window.removeEventListener('message', receive)
        const port = event.ports[0]
        activePort = port
        const { runtime, theme, state, data, code, kind, revisionKey } = event.data
        activeKind = kind || 'react'
        try {
          if (activeKind === 'html') {
            runHtmlArtifact(code, theme)
          } else if (activeKind === 'svg') {
            runSvgArtifact(code, theme)
          } else {
            const rtScript = document.createElement('script')
            rtScript.nonce = nonce
            rtScript.textContent = runtime
            document.head.append(rtScript)
            window.__DSH_CANVAS_RUNTIME__.init(port, theme, state, data)
            if (typeof code === 'string') runReactCode(code, revisionKey)
          }
        } catch (err) {
          port.postMessage({ type: 'runtime/error', message: String(err?.message ?? err), stack: '' })
        }
        port.addEventListener('message', ({ data: msg }) => {
          if (!msg || typeof msg !== 'object') return
          if (msg.type === 'host/theme') {
            if (activeKind === 'react') window.__DSH_CANVAS_RUNTIME__?.setTheme(msg.theme)
            else applySimpleTheme(msg.theme)
          } else if (msg.type === 'host/state') {
            window.__DSH_CANVAS_RUNTIME__?.replaceState(msg.state)
          } else if (msg.type === 'host/data') {
            window.__DSH_CANVAS_RUNTIME__?.replaceData(msg.data)
          } else if (msg.type === 'host/code') {
            if (activeKind === 'html') runHtmlArtifact(msg.code, msg.theme)
            else if (activeKind === 'svg') runSvgArtifact(msg.code, msg.theme)
            else runReactCode(msg.code, msg.revisionKey)
          }
        })
        port.start()
      })
    }

    function buildSrcDoc(nonce) {
      const policy = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'`
      return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>${SANDBOX_UTILITY_CSS}</style></head><body><div id="dsh-canvas-root"></div><script nonce="${nonce}">(${sandboxBootstrap.toString()})();</script></body></html>`
    }

    function triggerDownload(filename, content, mime) {
      const blob = new Blob([content], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.append(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    function buildStandaloneExportHtml(canvas, runtime, theme, liveData) {
      if (canvas.kind === 'html') return canvas.source
      if (canvas.kind === 'svg') {
        return `<!doctype html><html><head><meta charset="utf-8"><title>${canvas.title}</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#111318;padding:24px}</style></head><body>${canvas.source}</body></html>`
      }
      const payload = JSON.stringify({
        theme,
        state: canvas.state ?? {},
        data: liveData ?? { files: {}, globs: {}, host: {} },
        code: canvas.compiled ?? '',
      }).replace(/</g, '\\u003c')
      const safeRuntime = String(runtime ?? '').replace(/<\/script/gi, '<\\/script')
      return `<!doctype html><html><head><meta charset="utf-8"><title>${canvas.title}</title><style>${SANDBOX_UTILITY_CSS}</style></head><body><div id="dsh-canvas-root"></div><script>${safeRuntime}</script><script>(function(){var p=${payload};var noopPort={postMessage:function(){}};window.__DSH_CANVAS_RUNTIME__.init(noopPort,p.theme,p.state,p.data);var fn=new Function('require','module','exports','React',p.code);window.__DSH_CANVAS_RUNTIME__.mountCanvas(fn,'export');})();</script></body></html>`
    }

    let runtimePromise = null
    const loadRuntime = () => {
      if (!runtimePromise) runtimePromise = require.async('./client.runtime.js')
      return runtimePromise
    }

    async function readJsonResponse(response) {
      let data = null
      try { data = await response.json() } catch {}
      if (!response.ok) throw new Error(data?.message ?? `HTTP ${response.status}`)
      if (!data || typeof data !== 'object') throw new Error(`HTTP ${response.status}`)
      return data
    }

    const sessionStores = new Map()

    function createSessionStore(sessionId, initialCwd) {
      let cwd = initialCwd || ''
      let state = {
        status: 'loading',
        sessionId,
        enabled: false,
        cwd,
        activePath: '',
        canvases: [],
        dataTick: 0,
        error: '',
      }
      const listeners = new Set()
      let es = null

      const emit = () => { for (const fn of listeners) fn() }
      const shouldStream = snap => Boolean(snap?.enabled) || (Array.isArray(snap?.canvases) && snap.canvases.length > 0)
      const applySnapshot = data => {
        if (!data || typeof data !== 'object') return
        state = {
          status: 'ready',
          sessionId: data.sessionId ?? sessionId,
          enabled: Boolean(data.enabled),
          cwd: data.cwd ?? cwd,
          activePath: data.activePath ?? '',
          canvases: Array.isArray(data.canvases) ? data.canvases : [],
          dataTick: Number(data.dataTick ?? state.dataTick ?? 0),
          error: '',
        }
        if (listeners.size > 0) {
          if (shouldStream(state)) connect()
          else disconnect()
        }
        emit()
      }

      const queryString = () => {
        const params = new URLSearchParams({ sessionId })
        if (cwd) params.set('cwd', cwd)
        return params.toString()
      }

      const fetchState = async () => {
        try {
          const res = await fetch(`/canvas/state?${queryString()}`, { cache: 'no-store' })
          applySnapshot(await readJsonResponse(res))
        } catch (err) {
          state = { ...state, status: 'error', error: err.message }
          emit()
        }
      }

      const connect = () => {
        if (es || listeners.size === 0 || !shouldStream(state)) return
        const stream = new EventSource(`/canvas/events?${queryString()}`)
        es = stream
        stream.addEventListener('message', e => {
          try { applySnapshot(JSON.parse(e.data)) } catch {}
        })
        stream.addEventListener('data', e => {
          try {
            const payload = JSON.parse(e.data)
            state = { ...state, dataTick: Number(payload?.dataTick ?? (state.dataTick + 1)) }
            emit()
          } catch {}
        })
        stream.addEventListener('error', () => {
          if (stream.readyState === EventSource.CLOSED && es === stream) es = null
        })
      }

      const disconnect = () => {
        if (es) {
          es.close()
          es = null
        }
      }

      return {
        getSnapshot: () => state,
        setCwd(nextCwd) {
          if (!nextCwd || nextCwd === cwd) return
          cwd = nextCwd
          const wasStreaming = Boolean(es)
          disconnect()
          if (listeners.size > 0) {
            if (wasStreaming && shouldStream(state)) connect()
            else void fetchState()
          }
        },
        subscribe(fn) {
          listeners.add(fn)
          if (listeners.size === 1) {
            if (shouldStream(state)) connect()
            else void fetchState()
          }
          return () => {
            listeners.delete(fn)
            if (listeners.size === 0) disconnect()
          }
        },
        async op(payload) {
          const res = await fetch('/canvas/op', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              ...(cwd ? { cwd } : {}),
              ...payload,
            }),
          })
          const data = await readJsonResponse(res)
          if (Array.isArray(data.canvases)) applySnapshot(data)
          return data
        },
      }
    }

    function getSessionStore(sessionId, cwd) {
      let store = sessionStores.get(sessionId)
      if (!store) {
        store = createSessionStore(sessionId, cwd)
        sessionStores.set(sessionId, store)
      } else if (cwd) {
        store.setCwd(cwd)
      }
      return store
    }

    function useCanvasSession(sessionId, cwd) {
      const store = React.useMemo(() => (sessionId ? getSessionStore(sessionId, cwd) : null), [sessionId])
      React.useEffect(() => {
        if (store && cwd) store.setCwd(cwd)
      }, [store, cwd])
      const snapshot = React.useSyncExternalStore(
        React.useCallback(cb => (store ? store.subscribe(cb) : () => {}), [store]),
        () => (store ? store.getSnapshot() : { status: 'idle', sessionId: '', enabled: false, cwd: '', activePath: '', canvases: [], dataTick: 0, error: '' }),
      )
      return { snapshot, op: store ? store.op : async () => ({}) }
    }

    return {
      name: KEY,
      inject: ['slots', 'locale', 'theme', 'sidebarRight', 'sidebarRightTabs'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, DICTS), 'canvas: locale')
        let detailStyleEl = null
        const ensureDetailStyles = () => {
          if (detailStyleEl || typeof document === 'undefined' || !document.head) return
          detailStyleEl = document.createElement('style')
          detailStyleEl.textContent = CSS
          document.head.append(detailStyleEl)
        }
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = TRIGGER_CSS
          document.head.append(style)
          return () => {
            style.remove()
            detailStyleEl?.remove()
            detailStyleEl = null
          }
        }, 'canvas: styles')

        const translate = ctx.locale.bind(NS)
        const subscribeLocale = fn => ctx.locale.subscribe(fn)
        const localeSnapshot = () => ctx.locale.getSnapshot()
        const useLocale = () => {
          React.useSyncExternalStore(subscribeLocale, localeSnapshot)
          return translate
        }
        const subscribeTheme = fn => ctx.on('theme/change', fn)
        const getScheme = () => ctx.theme.getTheme()?.active?.colorScheme ?? 'dark'
        const useScheme = () => React.useSyncExternalStore(subscribeTheme, getScheme)
        const openSidebar = params => ctx.sidebarRight.openTab(KEY, params ? { params } : undefined)

        function SandboxFrame({ canvas, scheme, dataTick, queryData, onSetState, onAction, onRuntimeError, onLiveData, t }) {
          const hostRef = React.useRef(null)
          const portRef = React.useRef(null)
          const readyRef = React.useRef(false)
          const subsRef = React.useRef(null)
          const [loading, setLoading] = React.useState(true)
          const callbacksRef = React.useRef({ onSetState, onAction, onRuntimeError, queryData, onLiveData })
          callbacksRef.current = { onSetState, onAction, onRuntimeError, queryData, onLiveData }

          const compiled = canvas.compiled
          const kind = canvas.kind || 'react'
          const revisionKey = `${canvas.path}:${canvas.revision}:${canvas.mtimeMs}`

          const fetchAndPushData = React.useCallback(async () => {
            if (!subsRef.current || !portRef.current || !callbacksRef.current.queryData) return
            try {
              const data = await callbacksRef.current.queryData(subsRef.current)
              callbacksRef.current.onLiveData?.(data)
              portRef.current?.postMessage({ type: 'host/data', data }, [])
            } catch {}
          }, [])

          React.useEffect(() => {
            if (!compiled) {
              setLoading(false)
              return undefined
            }
            let canceled = false
            let frame = null
            let port1 = null
            setLoading(true)
            readyRef.current = false
            subsRef.current = null

            const runtimeTask = kind === 'react' ? loadRuntime() : Promise.resolve('')
            runtimeTask.then(runtime => {
              if (canceled || !hostRef.current) return
              const nonce = Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8, '0')).join('')
              frame = document.createElement('iframe')
              frame.className = 'cv-frame'
              frame.sandbox = 'allow-scripts'
              frame.title = canvas.title
              frame.srcdoc = buildSrcDoc(nonce)
              const channel = new MessageChannel()
              port1 = channel.port1
              portRef.current = port1

              port1.addEventListener('message', ({ data }) => {
                if (!data || typeof data !== 'object') return
                if (data.type === 'runtime/ready') {
                  readyRef.current = true
                  setLoading(false)
                  callbacksRef.current.onRuntimeError('')
                } else if (data.type === 'runtime/error') {
                  setLoading(false)
                  callbacksRef.current.onRuntimeError(data.message || 'Canvas runtime error')
                } else if (data.type === 'state/set') {
                  callbacksRef.current.onSetState(data.key, data.value)
                } else if (data.type === 'action') {
                  callbacksRef.current.onAction(data.action)
                } else if (data.type === 'data/subscribe') {
                  subsRef.current = data.subscriptions
                  fetchAndPushData()
                } else if (data.type === 'data/refresh') {
                  fetchAndPushData()
                }
              })
              port1.start()

              // external: sandboxed srcdoc iframe has opaque origin, so transfer a private MessagePort with '*'
              frame.addEventListener('load', () => {
                if (canceled) return
                try {
                  frame.contentWindow.postMessage(
                    {
                      runtime,
                      theme: readHostTheme(scheme),
                      state: canvas.state ?? {},
                      code: compiled,
                      kind,
                      revisionKey,
                    },
                    '*',
                    [channel.port2],
                  )
                } catch (err) {
                  setLoading(false)
                  callbacksRef.current.onRuntimeError(err.message)
                }
              }, { once: true })

              hostRef.current.replaceChildren(frame)
            }).catch(err => {
              if (canceled) return
              setLoading(false)
              callbacksRef.current.onRuntimeError(err.message)
            })

            return () => {
              canceled = true
              readyRef.current = false
              portRef.current = null
              subsRef.current = null
              try { port1?.close() } catch {}
              if (frame) frame.remove()
            }
          }, [canvas.path, kind, Boolean(compiled)])

          React.useEffect(() => {
            if (!portRef.current || !readyRef.current || !compiled) return
            portRef.current.postMessage({ type: 'host/code', code: compiled, theme: readHostTheme(scheme), revisionKey }, [])
          }, [compiled, revisionKey])

          React.useEffect(() => {
            if (!portRef.current || !readyRef.current) return
            portRef.current.postMessage({ type: 'host/theme', theme: readHostTheme(scheme) }, [])
          }, [scheme])

          React.useEffect(() => {
            if (!portRef.current || !readyRef.current || kind !== 'react') return
            portRef.current.postMessage({ type: 'host/state', state: canvas.state ?? {} }, [])
          }, [canvas.state, kind])

          React.useEffect(() => {
            if (!readyRef.current || !subsRef.current) return
            fetchAndPushData()
          }, [dataTick, fetchAndPushData])

          if (!compiled) {
            return h('div', { className: 'cv-empty' }, h('p', null, t('compileBlocked')))
          }

          return h('div', { className: 'cv-frame-wrap' },
            loading && h('div', { className: 'cv-notice', role: 'status' }, t('loadingRuntime')),
            h('div', { ref: hostRef, className: 'cv-frame-wrap' }))
        }

        function FullscreenDialog({ canvas, scheme, dataTick, queryData, onSetState, onAction, onRuntimeError, onLiveData, onExport, onClose, t }) {
          const dialogRef = React.useRef(null)
          const backdropPress = React.useRef(false)
          React.useEffect(() => {
            const el = dialogRef.current
            el.showModal()
            return () => { if (el.open) el.close() }
          }, [])
          return h('dialog', {
            ref: dialogRef,
            className: 'cv cv-dialog',
            'aria-label': canvas.title,
            onClose: e => { if (!e.currentTarget.open) onClose() },
            onPointerDown: e => { backdropPress.current = e.target === e.currentTarget },
            onClick: e => {
              if (backdropPress.current && e.target === e.currentTarget) e.currentTarget.close()
              backdropPress.current = false
            },
          },
          h('header', { className: 'cv-dialog-head' },
            h('div', { className: 'cv-row' },
              h('strong', { className: 'cv-ellipsis' }, canvas.title),
              h('span', { className: 'cv-pill', 'data-tone': 'neutral' }, (canvas.kind || 'react').toUpperCase())),
            h('div', { className: 'cv-row' },
              onExport && h('button', { type: 'button', className: 'cv-btn', onClick: onExport }, t('exportHtml')),
              h('button', { type: 'button', className: 'cv-btn', onClick: () => dialogRef.current?.close() }, t('close')))),
          h('div', { className: 'cv-body' },
            h(SandboxFrame, { canvas, scheme, dataTick, queryData, onSetState, onAction, onRuntimeError, onLiveData, t })))
        }

        function ComposerTrigger({ sessionId, useSessions }) {
          const t = useLocale()
          const cwd = useSessions ? (useSessions(s => s.byId?.[sessionId]?.cwd ?? '') ?? '') : ''
          const { snapshot } = useCanvasSession(sessionId, cwd)
          if (!sessionId) return null
          return h('span', { className: 'cv-anchor', 'data-canvas': '' },
            h('button', {
              type: 'button',
              className: 'cv-trigger',
              'data-enabled': snapshot.enabled ? 'true' : undefined,
              title: snapshot.enabled ? t('modeOn') : t('modeOff'),
              'aria-label': t('title'),
              onClick: () => openSidebar(),
            },
            h(CanvasIcon, { size: 14 }),
            h('span', { className: 'cv-label' }, t('title')),
            snapshot.canvases.length > 0 && h('span', { className: 'cv-count' }, snapshot.canvases.length),
            snapshot.enabled && h('span', { className: 'cv-dot', 'aria-hidden': true })))
        }

        function TabTitle() {
          const t = useLocale()
          return h(React.Fragment, null, h(CanvasIcon, { size: 15, className: 'cv-tab-icon' }), t('title'))
        }

        function InputDock({ sessionId, useSessions }) {
          const t = useLocale()
          const cwd = useSessions ? (useSessions(s => s.byId?.[sessionId]?.cwd ?? '') ?? '') : ''
          const { snapshot } = useCanvasSession(sessionId, cwd)
          const activeDock = Boolean(sessionId && snapshot.enabled && snapshot.canvases.length > 0)
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(() => { if (activeDock) ensureDetailStyles() }, [activeDock])
          if (!activeDock) return null
          const active = snapshot.canvases.find(c => c.path === snapshot.activePath) ?? snapshot.canvases[0]
          return h('div', { className: 'cv cv-dock' },
            h('div', { className: 'cv-dock-card' },
              h('button', { type: 'button', className: 'cv-dock-btn', title: t('dockOpen'), onClick: () => openSidebar({ path: active.path }) },
                h(CanvasIcon, { size: 15 }),
                h('span', { className: 'cv-dock-title cv-ellipsis' }, active.title),
                h('span', { className: 'cv-dock-path cv-ellipsis' }, active.relativePath),
                h('span', { className: 'cv-pill', 'data-tone': active.errorCount > 0 ? 'err' : 'ok' },
                  active.errorCount > 0 ? t('tsErrors', { n: active.errorCount }) : t('tsOk')),
                snapshot.canvases.length > 1 && h('span', { className: 'cv-pill', 'data-tone': 'neutral' }, t('activeCount', { n: snapshot.canvases.length })))))
        }

        function CanvasToolCard({ phase, block, inspect, useDisclosure }) {
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(ensureDetailStyles, [])
          const t = useLocale()
          const [localExpanded, setLocalExpanded] = React.useState(false)
          const disclosure = typeof useDisclosure === 'function' ? useDisclosure() : null
          const expanded = disclosure ? disclosure.expanded : localExpanded
          const toggle = disclosure ? disclosure.toggle : () => setLocalExpanded(v => !v)
          const settled = phase === 'result' && block && 'kind' in block
          const call = settled ? block.call : block
          let args = {}
          try {
            const parsed = JSON.parse(call?.argsRaw ?? '{}')
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed
          } catch {}
          const text = settled && Array.isArray(block.content)
            ? block.content.filter(item => item.type === 'text').map(item => item.text).join('\n')
            : ''
          let payload = null
          if (text) { try { payload = JSON.parse(text) } catch {} }

          const errCount = Number(payload?.errorCount ?? 0)
          const state = phase === 'preparing' ? 'preparing'
            : !settled ? 'running'
              : block?.error?.code === 'interrupted' ? 'stopped'
                : (block?.isError || errCount > 0) ? 'error' : 'ok'
          const running = state === 'preparing' || state === 'running'
          const title = payload?.title || ''
          const rel = payload?.relativePath || args.path || ''
          const kind = (payload?.kind || (String(rel).endsWith('.canvas.html') ? 'html' : String(rel).endsWith('.canvas.svg') ? 'svg' : 'react')).toUpperCase()
          const settledWithCue = state === 'error' || state === 'stopped'

          let summary = ''
          if (state === 'stopped') summary = t('tvStopped')
          else if (state === 'error') summary = (block?.isError && text ? text.split('\n')[0] : '') || t('tsErrors', { n: errCount || 1 })
          else if (title && rel && title !== rel) summary = `${title} · ${rel}`
          else summary = rel || title || (running ? t('artifactBuilding') : '')

          const suffix = settledWithCue ? '' : [
            kind,
            !running && payload?.revision ? t('revLabel', { n: payload.revision }) : '',
          ].filter(Boolean).join(' · ')

          const formattedOutput = payload !== null ? JSON.stringify(payload, null, 2) : text
          const expandable = state !== 'preparing' && Boolean(formattedOutput)
          const open = expanded && expandable

          const openCard = event => {
            event?.stopPropagation?.()
            openSidebar(payload?.path ? { path: payload.path } : undefined)
          }

          const DisclosureRow = primitives?.DisclosureRow
          const TextShimmer = primitives?.TextShimmer
          const IconInspect = primitives?.IconInspectOutlineRegular
          const shimmer = (content, props) => (TextShimmer ? h(TextShimmer, props ?? null, content) : h('span', props ?? null, content))

          const row = DisclosureRow
            ? h(DisclosureRow, {
              rowClassName: 'cv-tv-row',
              icon: h(CanvasIcon, { size: 14 }),
              title: t('title'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: state === 'preparing' ? null : h(React.Fragment, null,
                summary ? h(React.Fragment, null,
                  h('span', { className: 'cv-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                  h('span', { className: `cv-tv-summary${state === 'error' ? ' is-err' : state === 'stopped' ? ' is-stop' : ''}` },
                    shimmer(summary))) : null,
                suffix ? shimmer(`· ${suffix}`, { className: 'cv-tv-suffix' }) : null),
            },
            open ? h('div', { className: 'cv-tv-body' },
              h('div', { className: 'cv-tv-io' },
                h('div', { className: 'cv-tv-io-sec' },
                  h('span', { className: 'cv-tv-io-label' }, t('tvOutput')),
                  h('span', { className: 'cv-tv-io-text', 'data-error': state === 'error' || undefined }, formattedOutput))),
              inspect ? h('button', { type: 'button', className: 'cv-tv-inspect', onClick: inspect },
                IconInspect ? h(IconInspect) : null, t('tvInspect')) : null) : null)
            : h('div', { className: 'cv-tv-row' }, t('title'), summary ? ` · ${summary}` : '')

          return h('div', { className: 'cv-tv', 'data-tool': 'canvas_write', 'data-state': state },
            row,
            !running && h('div', { className: 'cv-toolcard-actions' },
              h('button', { type: 'button', className: 'cv-tv-open', onClick: openCard }, t('openInCanvas'))))
        }

        function CanvasWorkspace({ sessionId, cwd, tab, inputActions }) {
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(ensureDetailStyles, [])
          const t = useLocale()
          const scheme = useScheme()
          const { snapshot, op } = useCanvasSession(sessionId, cwd)

          const [view, setView] = React.useState('preview')
          const [draft, setDraft] = React.useState('')
          const [dirty, setDirty] = React.useState(false)
          const [saving, setSaving] = React.useState(false)
          const [busy, setBusy] = React.useState(false)
          const [runtimeErr, setRuntimeErr] = React.useState('')
          const [notice, setNotice] = React.useState('')
          const [selectedRev, setSelectedRev] = React.useState(null)
          const [fullscreen, setFullscreen] = React.useState(false)
          const [createDialog, setCreateDialog] = React.useState(null)
          const [deleteDialog, setDeleteDialog] = React.useState(null)
          const [iterateText, setIterateText] = React.useState('')
          const liveDataRef = React.useRef(null)

          const active = snapshot.canvases.find(c => c.path === snapshot.activePath) ?? snapshot.canvases[0] ?? null

          React.useEffect(() => {
            const navPath = tab?.navigation?.params?.path
            if (navPath && navPath !== snapshot.activePath) {
              op({ action: 'select', path: navPath }).catch(() => {})
            }
          }, [tab?.navigation?.revision])

          React.useEffect(() => {
            if (!active) {
              setDraft('')
              setDirty(false)
              setSelectedRev(null)
              setRuntimeErr('')
              return
            }
            if (!dirty) setDraft(active.source)
            setSelectedRev(active.revision)
          }, [active?.path, active?.revision, active?.mtimeMs])

          const flash = message => {
            setNotice(message)
            setTimeout(() => setNotice(prev => (prev === message ? '' : prev)), 2600)
          }

          const handleToggle = async () => {
            setBusy(true)
            try { await op({ action: 'toggle', enabled: !snapshot.enabled }) }
            catch (err) { flash(err.message) }
            finally { setBusy(false) }
          }

          const submitCreate = async (enteredName, templateId) => {
            const nameToUse = (enteredName || '').trim() || 'overview'
            setBusy(true)
            try {
              await op({ action: 'create', name: nameToUse, ...(templateId ? { template: templateId } : {}) })
              setView('preview')
              setDirty(false)
              setCreateDialog(null)
            } catch (err) {
              flash(err.message)
            } finally {
              setBusy(false)
            }
          }

          const handleCreate = async templateId => {
            const defaultName = templateId === 'repo-radar' ? 'repo-radar'
              : templateId === 'html-prototype' ? 'prototype.canvas.html'
                : 'overview'
            if (templateId) {
              await submitCreate(defaultName, templateId)
              return
            }
            setCreateDialog({ value: defaultName })
          }

          const handleSave = async () => {
            if (!active) return
            setSaving(true)
            try {
              await op({ action: 'save', path: active.path, source: draft, reason: 'Edited in Canvas' })
              setDirty(false)
              setRuntimeErr('')
            } catch (err) {
              flash(err.message)
            } finally {
              setSaving(false)
            }
          }

          const confirmDeleteNow = async target => {
            if (!target) return
            setBusy(true)
            try {
              await op({ action: 'delete', path: target.path })
              setDirty(false)
              setRuntimeErr('')
              setDeleteDialog(null)
            } catch (err) {
              flash(err.message)
            } finally {
              setBusy(false)
            }
          }

          const handleDelete = () => {
            if (!active) return
            setDeleteDialog({ name: active.name, path: active.path, relativePath: active.relativePath })
          }

          const handleRestore = async revNumber => {
            if (!active) return
            setBusy(true)
            try {
              await op({ action: 'restore', path: active.path, revision: revNumber })
              setDirty(false)
              setView('preview')
            } catch (err) {
              flash(err.message)
            } finally {
              setBusy(false)
            }
          }

          const handleExport = async () => {
            if (!active) return
            try {
              const runtime = active.kind === 'react' ? await loadRuntime() : ''
              const html = buildStandaloneExportHtml(active, runtime, readHostTheme(scheme), liveDataRef.current)
              const baseName = active.name.replace(/\.canvas\.(?:tsx|html|svg)$/i, '')
              const ext = active.kind === 'svg' ? 'svg' : 'html'
              triggerDownload(
                `${baseName}.${ext}`,
                active.kind === 'svg' ? active.source : html,
                active.kind === 'svg' ? 'image/svg+xml;charset=utf-8' : 'text/html;charset=utf-8',
              )
              flash(t('exported'))
            } catch (err) {
              flash(err.message)
            }
          }

          const insertPrompt = text => {
            if (!text || !inputActions) return
            try {
              const span = inputActions.captureInsertion?.() ?? { start: 0, end: 0 }
              inputActions.insertText(text, span)
            } catch {}
          }

          const handleAskFix = () => {
            if (!active) return
            const parts = []
            for (const d of active.diagnostics) {
              parts.push(`- L${d.line}:${d.column} [${d.code}] ${d.message}`)
            }
            if (runtimeErr) parts.push(`- Runtime: ${runtimeErr}`)
            if (parts.length === 0) return
            insertPrompt(t('fixPrompt', { path: active.relativePath, errors: parts.join('\n') }))
          }

          const handleIterate = e => {
            e.preventDefault()
            const req = iterateText.trim()
            if (!req || !active) return
            insertPrompt(t('iteratePrompt', { path: active.relativePath, title: active.title, request: req }))
            setIterateText('')
          }

          const queryData = React.useCallback(subscriptions => op({ action: 'queryData', subscriptions }), [op])

          const handleAction = async action => {
            if (!action || typeof action !== 'object') return
            try {
              if (action.type === 'openFile' && typeof action.path === 'string') {
                const resolved = resolveTargetPath(snapshot.cwd || cwd, action.path)
                if (resolved) ctx.sidebarRight.openResource(fileAddress(sessionId, resolved))
              } else if (action.type === 'askInChat' && typeof action.prompt === 'string') {
                if (inputActions) insertPrompt(action.prompt)
                else navigator.clipboard?.writeText(action.prompt).then(() => flash(t('actionNotice'))).catch(() => {})
              } else if (action.type === 'copyText' && typeof action.text === 'string') {
                await navigator.clipboard?.writeText(action.text)
                flash(t('actionNotice'))
              } else if (action.type === 'patchData' && typeof action.uri === 'string') {
                await op({ action: 'patchData', ...action })
                flash(t('dataPatched'))
              } else if (action.type === 'sendToSession' && typeof action.sessionId === 'string' && typeof action.prompt === 'string') {
                await op({ action: 'sendToSession', targetSessionId: action.sessionId, prompt: action.prompt, mode: action.mode })
                flash(t('sessionSent'))
              } else if (action.type === 'triggerSchedule' && typeof action.taskId === 'string') {
                await op({ action: 'triggerSchedule', taskId: action.taskId })
                flash(t('scheduleTriggered'))
              } else if (action.type === 'openCanvas' && typeof action.path === 'string') {
                await op({ action: 'select', path: action.path })
              }
            } catch (err) {
              flash(err.message)
            }
          }

          const handleSetState = (key, value) => {
            if (!active) return
            op({ action: 'setState', path: active.path, key, value }).catch(() => {})
          }

          const effectiveCwd = snapshot.cwd || cwd
          const revRow = active?.revisions?.find(r => r.revision === selectedRev) ?? active?.revisions?.[active.revisions.length - 1] ?? null
          const hasErrors = Boolean(active && (active.errorCount > 0 || runtimeErr))

          const renderBody = () => h(React.Fragment, null,
            h('div', { className: 'cv-tabs', role: 'tablist' }, VIEWS.map(name => h('button', {
              key: name,
              type: 'button',
              role: 'tab',
              className: 'cv-tab',
              'aria-selected': view === name,
              onClick: () => setView(name),
            }, name === 'inspect' && hasErrors ? `${t(name)} (${active.errorCount + (runtimeErr ? 1 : 0)})` : t(name)))),

            hasErrors && h('div', { className: 'cv-banner', role: 'alert' },
              h('span', { className: 'cv-ellipsis' }, runtimeErr ? `${t('runtimeError')}: ${runtimeErr}` : t('tsErrors', { n: active.errorCount })),
              inputActions && h('button', { type: 'button', className: 'cv-btn', onClick: handleAskFix }, t('askFix'))),

            h('div', { className: 'cv-body' },
              view === 'preview' && h(React.Fragment, null,
                h(SandboxFrame, {
                  canvas: active,
                  scheme,
                  dataTick: snapshot.dataTick,
                  queryData,
                  onSetState: handleSetState,
                  onAction: handleAction,
                  onRuntimeError: setRuntimeErr,
                  onLiveData: data => { liveDataRef.current = data },
                  t,
                }),
                inputActions && h('form', { className: 'cv-iterate', onSubmit: handleIterate },
                  h('input', {
                    type: 'text',
                    className: 'cv-iterate-input',
                    value: iterateText,
                    placeholder: t('iteratePlaceholder'),
                    'aria-label': t('iteratePlaceholder'),
                    onChange: e => setIterateText(e.target.value),
                  }),
                  h('button', { type: 'submit', className: 'cv-btn', 'data-primary': true, disabled: !iterateText.trim() }, t('iterateSend')))),

              view === 'source' && h('div', { className: 'cv-scroll' },
                h('div', { className: 'cv-editor-bar' },
                  h('span', { className: 'cv-editor-path cv-ellipsis' }, active.relativePath),
                  h('div', { className: 'cv-row' },
                    dirty && h('span', { className: 'cv-pill', 'data-tone': 'neutral' }, t('unsaved')),
                    h('button', { type: 'button', className: 'cv-btn', onClick: () => handleAction({ type: 'copyText', text: draft }) }, t('copy')),
                    h('button', { type: 'button', className: 'cv-btn', 'data-primary': true, disabled: saving || !dirty, onClick: handleSave }, saving ? t('saving') : t('save')),
                    h('button', { type: 'button', className: 'cv-btn', 'data-danger': true, disabled: busy, onClick: handleDelete }, t('delete')))),
                h('textarea', {
                  className: 'cv-textarea',
                  'aria-label': t('source'),
                  value: draft,
                  spellCheck: false,
                  onChange: e => { setDraft(e.target.value); setDirty(true) },
                  onKeyDown: e => {
                    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                      e.preventDefault()
                      if (dirty && !saving) handleSave()
                    }
                  },
                })),

              view === 'history' && h('div', { className: 'cv-scroll' },
                h('div', { className: 'cv-editor-bar' },
                  h('strong', null, t('revisions')),
                  h('span', { className: 'cv-editor-path' }, t('revLabel', { n: active.revision }))),
                active.revisions.length === 0
                  ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-secondary)' } }, t('noRevisions'))
                  : h(React.Fragment, null,
                    h('ul', { className: 'cv-rev-list' }, active.revisions.toReversed().map(r => h('li', { key: r.revision, className: 'cv-rev-row', 'data-active': revRow?.revision === r.revision ? 'true' : undefined },
                      h('button', {
                        type: 'button',
                        className: 'cv-rev-btn',
                        'aria-current': revRow?.revision === r.revision ? 'true' : undefined,
                        onClick: () => setSelectedRev(r.revision),
                      },
                      h('span', { className: 'cv-ellipsis' }, `${t('revLabel', { n: r.revision })} · ${r.reason}`),
                      h('span', { className: 'cv-row' },
                        h('span', { style: { color: 'var(--dsw-alias-state-success-primary)', fontSize: 11 } }, `+${r.diff?.added ?? 0}`),
                        h('span', { style: { color: 'var(--dsw-alias-state-error-primary)', fontSize: 11 } }, `-${r.diff?.removed ?? 0}`))),
                      r.revision !== active.revision && h('button', {
                        type: 'button',
                        className: 'cv-btn',
                        onClick: () => handleRestore(r.revision),
                      }, t('restore'))))),
                    revRow?.diff?.lines?.length > 0 && h('div', { className: 'cv-diff' },
                      revRow.diff.lines.map((line, idx) => h('div', { key: idx, className: 'cv-diff-line', 'data-type': line.type },
                        h('span', { className: 'cv-diff-num' }, line.oldLine ?? ''),
                        h('span', { className: 'cv-diff-num' }, line.newLine ?? ''),
                        h('span', { className: 'cv-diff-mark' }, line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '),
                        h('span', null, line.content)))))),

              view === 'inspect' && h('div', { className: 'cv-scroll' },
                h('div', { className: 'cv-editor-bar' },
                  h('strong', null, t('inspect')),
                  hasErrors && inputActions && h('button', { type: 'button', className: 'cv-btn', 'data-primary': true, onClick: handleAskFix }, t('askFix'))),
                active.diagnostics.length === 0 && !runtimeErr
                  ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-secondary)' } }, t('noDiagnostics'))
                  : h('ul', { className: 'cv-diag-list' },
                    runtimeErr && h('li', { className: 'cv-diag' },
                      h('div', { className: 'cv-diag-meta' }, t('runtimeError')),
                      h('div', null, runtimeErr)),
                    active.diagnostics.map((d, idx) => h('li', { key: idx, className: 'cv-diag' },
                      h('div', { className: 'cv-diag-meta' }, `L${d.line}:${d.column} · ${d.code}`),
                      h('div', null, d.message)))),
                h('div', { className: 'cv-editor-bar', style: { marginTop: 8 } },
                  h('strong', null, t('persistedState')),
                  Object.keys(active.state ?? {}).length > 0 && h('button', {
                    type: 'button',
                    className: 'cv-btn',
                    onClick: () => op({ action: 'resetState', path: active.path }).catch(() => {}),
                  }, t('resetState'))),
                Object.keys(active.state ?? {}).length === 0
                  ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-secondary)' } }, t('noState'))
                  : h('pre', { className: 'cv-pre' }, JSON.stringify(active.state, null, 2)))))

          const ModalComp = primitives?.Modal
          const InputComp = primitives?.Input
          const ButtonComp = primitives?.Button

          const renderModals = () => {
            if (!ModalComp) return null
            return h(React.Fragment, null,
              createDialog && h(ModalComp, {
                open: true,
                title: t('newTitle'),
                onClose: () => { if (!busy) setCreateDialog(null) },
                footer: h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
                  ButtonComp
                    ? h(ButtonComp, { variant: 'ghost', size: 'sm', disabled: busy, onClick: () => setCreateDialog(null) }, t('cancel'))
                    : h('button', { type: 'button', className: 'cv-btn', disabled: busy, onClick: () => setCreateDialog(null) }, t('cancel')),
                  ButtonComp
                    ? h(ButtonComp, { variant: 'primary', size: 'sm', disabled: busy || !createDialog.value.trim(), onClick: () => submitCreate(createDialog.value) }, t('create'))
                    : h('button', { type: 'button', className: 'cv-btn', 'data-primary': true, disabled: busy || !createDialog.value.trim(), onClick: () => submitCreate(createDialog.value) }, t('create'))),
              },
              h('form', {
                style: { display: 'flex', flexDirection: 'column', gap: 8 },
                onSubmit: e => {
                  e.preventDefault()
                  if (!busy && createDialog.value.trim()) void submitCreate(createDialog.value)
                },
              },
              h('label', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, t('newPrompt')),
              InputComp
                ? h(InputComp, {
                  autoFocus: true,
                  value: createDialog.value,
                  disabled: busy,
                  onChange: e => setCreateDialog(prev => prev ? { ...prev, value: e.target.value } : null),
                })
                : h('input', {
                  type: 'text',
                  autoFocus: true,
                  value: createDialog.value,
                  disabled: busy,
                  onChange: e => setCreateDialog(prev => prev ? { ...prev, value: e.target.value } : null),
                }))),
              deleteDialog && h(ModalComp, {
                open: true,
                title: t('deleteTitle'),
                onClose: () => { if (!busy) setDeleteDialog(null) },
                footer: h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
                  ButtonComp
                    ? h(ButtonComp, { variant: 'ghost', size: 'sm', disabled: busy, onClick: () => setDeleteDialog(null) }, t('cancel'))
                    : h('button', { type: 'button', className: 'cv-btn', disabled: busy, onClick: () => setDeleteDialog(null) }, t('cancel')),
                  ButtonComp
                    ? h(ButtonComp, { variant: 'primary', className: 'cv-danger-fill', size: 'sm', disabled: busy, onClick: () => confirmDeleteNow(deleteDialog) }, t('delete'))
                    : h('button', { type: 'button', className: 'cv-btn', 'data-danger': true, disabled: busy, onClick: () => confirmDeleteNow(deleteDialog) }, t('delete'))),
              },
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                h('p', { style: { margin: 0 } }, t('confirmDelete', { name: deleteDialog.name })),
                deleteDialog.relativePath && h('code', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, deleteDialog.relativePath),
                h('p', { style: { margin: 0, fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' } }, t('deleteWarning')))))
          }

          return h('section', { className: 'cv cv-panel', 'aria-label': t('title') },
            h('header', { className: 'cv-head' },
              h('div', { className: 'cv-mode' },
                h('div', { className: 'cv-mode-copy' },
                  h('span', { className: 'cv-mode-title' }, t('modeLabel')),
                  h('span', { className: 'cv-mode-hint' }, snapshot.enabled ? t('modeOn') : t('modeOff'))),
                h('button', {
                  type: 'button',
                  role: 'switch',
                  'aria-checked': snapshot.enabled,
                  className: 'cv-switch',
                  disabled: busy || !sessionId,
                  onClick: handleToggle,
                }, snapshot.enabled ? t('on') : t('off'))),
              effectiveCwd && h('div', { className: 'cv-row-wrap' },
                snapshot.canvases.length > 0 && h('select', {
                  className: 'cv-select',
                  'aria-label': t('title'),
                  value: active?.path ?? '',
                  onChange: e => { setDirty(false); setRuntimeErr(''); op({ action: 'select', path: e.target.value }).catch(() => {}) },
                }, snapshot.canvases.map(c => h('option', { key: c.path, value: c.path }, `${c.title} (${c.relativePath})`))),
                h('button', { type: 'button', className: 'cv-btn', disabled: busy, onClick: () => handleCreate() }, `+ ${t('newCanvas')}`),
                h('button', { type: 'button', className: 'cv-btn', disabled: busy, onClick: () => op({ action: 'refresh' }).catch(() => {}) }, t('refresh')),
                active && h('button', { type: 'button', className: 'cv-btn', onClick: () => handleAction({ type: 'openFile', path: active.path }) }, t('openFile')),
                active && h('button', { type: 'button', className: 'cv-btn', onClick: handleExport }, t('exportHtml')),
                active?.compiled && h('button', { type: 'button', className: 'cv-btn', onClick: () => setFullscreen(true) }, t('fullscreen')))),

            notice && h('div', { className: 'cv-notice', role: 'status' }, notice),
            snapshot.error && h('div', { className: 'cv-banner', role: 'alert' }, h('span', null, snapshot.error)),

            !effectiveCwd
              ? h('div', { className: 'cv-empty' }, h(CanvasIcon, { size: 28 }), h('p', null, t('noWorkspace')))
              : !active
                ? h('div', { className: 'cv-empty' },
                  h(CanvasIcon, { size: 30 }),
                  h('h2', null, t('emptyTitle')),
                  h('p', null, t('emptyBody')),
                  h('div', { className: 'cv-row-wrap', style: { justifyContent: 'center' } },
                    !snapshot.enabled && h('button', { type: 'button', className: 'cv-btn', 'data-primary': true, disabled: busy, onClick: handleToggle }, t('enableSession')),
                    h('button', { type: 'button', className: 'cv-btn', disabled: busy, onClick: () => handleCreate('repo-radar') }, 'Repo Radar'),
                    h('button', { type: 'button', className: 'cv-btn', disabled: busy, onClick: () => handleCreate('starter') }, t('createStarter'))))
                : renderBody(),

            fullscreen && active && h(FullscreenDialog, {
              canvas: active,
              scheme,
              dataTick: snapshot.dataTick,
              queryData,
              onSetState: handleSetState,
              onAction: handleAction,
              onRuntimeError: setRuntimeErr,
              onLiveData: data => { liveDataRef.current = data },
              onExport: handleExport,
              onClose: () => setFullscreen(false),
              t,
            }),
            renderModals())
        }

        function CanvasPanel({ sessionId, useSessions, useTabInfo, inputActions }) {
          const cwd = useSessions ? (useSessions(s => s.byId?.[sessionId]?.cwd ?? '') ?? '') : ''
          const { tab } = useTabInfo()
          return h(CanvasWorkspace, { sessionId, cwd, tab, inputActions })
        }

        ctx.inject(['commandUi'], scope => scope.effect(() => scope.commandUi.register({
          name: 'canvas',
          label: () => translate('title'),
          description: () => translate('subtitle'),
          available: () => true,
          ui: { kind: 'action', run: () => openSidebar() },
        })), 'canvas: command')

        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: KEY,
          kind: KEY,
          keepMounted: true,
          title: () => translate('title'),
          guide: [{
            id: 'canvas',
            order: 35,
            icon: CanvasIcon,
            title: () => translate('title'),
            description: () => translate('subtitle'),
          }],
        }), 'canvas: sidebar tab')

        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: KEY }, CanvasPanel))
        ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: KEY }, TabTitle))
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'canvas', order: 5 }, InputDock))
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({ name: 'conversation.composer.dock', id: 'canvas', order: 15 }, ComposerTrigger))
        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key: 'canvas_write', locale: NS, priority: -10 }, CanvasToolCard))
      },
      _internal: { buildSrcDoc, resolveTargetPath, fileAddress, readHostTheme, readJsonResponse },
    }
  },
})
