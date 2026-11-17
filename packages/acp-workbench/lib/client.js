window.__ModuleLoader__.load({
  id: 'dsh-acp-workbench',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, DiffBlock, DisclosureRow, Input, JsonBlock, PathLabel, SegmentedTabs, StateDot, Switch, Tag,
      IconChevronDownOutlineRegular, IconChevronUpOutlineRegular, IconInfoOutlineRegular, IconPlusOutlineRegular,
      IconStopFillRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const NS = 'acp-workbench'

    const en = {
      panel: 'ACP Settings', panelHint: 'Providers, capability checks and stored execution records. Conversations stay in your normal DSH sessions.',
      tabProviders: 'Providers', tabRecords: 'Records', live: 'Live', offline: 'Reconnecting…',
      engine: 'ACP engine', useEngine: 'Run this conversation through {name}', showInfo: 'About ACP engines', hideInfo: 'Hide details',
      engineHint: 'Choose a specific model under an ACP provider in the normal model picker. Keep using the normal composer, attachments and Stop button; replies stay in this timeline.',
      delegateHint: 'To keep a DSH model in charge, ask it to use subagent_cursor or subagent_antigravity instead. Those children can be followed up with send_message.',
      warning: 'External agents use their own login, tools and file access. DSH tool restrictions do not sandbox them, and approvals cover only the requests the CLI actually sends.',
      engineOn: '{name} · ACP', notConnected: 'Connects on your next message',
      connect: 'Connect', reconnect: 'Reconnect', disconnect: 'Disconnect', cancelConnect: 'Cancel',
      newContext: 'New external context', newContextConfirm: 'Start a new external conversation from the next message? DSH history and earlier execution records are kept.',
      restoreTo: 'Back to {model}', restoreTitle: 'Switch this conversation back to the DSH model it used before',
      restoreHint: 'No earlier DSH model was saved for this conversation. Use the model picker to switch back.',
      moreOptions: 'Show engine options', lessOptions: 'Hide engine options', switchEngine: 'Switch engine',
      connection: 'Connection', configuration: 'Configuration', commands: 'CLI commands', usage: 'Usage', directory: 'Directory',
      noConfig: 'Connect to load the models, modes and options this CLI advertises.',
      model: 'Model', mode: 'Mode', commandPick: 'Command…', commandArgs: 'Arguments', commandRun: 'Run',
      commandHint: 'Sent to the external CLI as a normal message. Slash commands typed in the composer still belong to DSH.',
      usageContext: 'Context {used} / {size} ({percent}%)', usageCost: 'Cost {amount} {currency}',
      unknownUsage: 'Not reported by this agent. ACP does not expose account quota.',
      children: 'ACP subagents', stop: 'Stop', pending: 'Needs you', expand: 'Show trace', collapse: 'Hide trace',
      'state.starting': 'Connecting', 'state.idle': 'Ready', 'state.running': 'Running', 'state.waiting': 'Needs your response',
      'state.canceling': 'Stopping', 'state.disconnected': 'Disconnected', 'state.error': 'Error', 'state.preparing': 'Preparing',
      'state.completed': 'Completed', 'state.interrupted': 'Interrupted', 'state.failed': 'Failed',
      trace: '{name} execution', traceTools: '{n} tool calls', traceTool: '1 tool call', traceFiles: '{n} files changed', traceFile: '1 file changed',
      handoff: 'DSH context handed off', sameContext: 'Same external context',
      viewTimeline: 'Timeline', viewRaw: 'Raw events', older: 'Load earlier', loading: 'Loading…',
      noEvents: 'No execution events yet.', noActivity: 'No tool activity in this turn.',
      stderr: 'CLI log output', stopReason: 'Turn ended: {reason}', turnError: 'Agent error: {message}', configError: 'Setting refused: {message}',
      plan: 'Plan', highPriority: 'High',
      permission: 'Permission request', question: 'Question from the agent', 'kind.plan': 'Plan for approval',
      permanent: 'An “always” choice may be remembered by the CLI for later requests.',
      approve: 'Approve plan', reject: 'Reject', rejectReason: 'Reason (optional)', answer: 'Submit answers', skip: 'Skip', dismiss: 'Cancel request',
      'event.interaction': 'Asked: {title}', 'event.answered': 'Response sent', 'event.expired': 'Request expired',
      input: 'Input', output: 'Output', terminal: 'Terminal {id}', tool: 'Tool call',
      user: 'You', assistant: 'Agent', thinking: 'Reasoning', replay: 'History replay',
      truncated: '… {n} characters in total', copy: 'Copy', copied: 'Copied', wrap: 'Wrap lines', unwrap: 'Do not wrap', code: 'Code',
      expandLines: 'Show {n} more lines', collapseLines: 'Show less', expandLinesAria: 'Show {n} hidden lines', collapseLinesAria: 'Hide expanded lines',
      providerList: 'Providers', addProvider: 'New provider', editProvider: 'Edit provider', newProviderTitle: 'New provider',
      fieldId: 'ID', fieldLabel: 'Display name', fieldCommand: 'Executable', fieldCommandHint: 'Absolute path or a name on PATH.',
      fieldArgs: 'Arguments', fieldArgsHint: 'JSON array of strings, for example ["acp"]. Never put credentials here.',
      save: 'Save', saved: 'Saved', remove: 'Remove', removeConfirm: 'Remove this provider configuration? Its records are kept.',
      argsInvalid: 'Arguments must be a JSON array of strings.',
      providerHint: 'Log in with the CLI in a terminal first. Saving never starts a process; changes apply to the next connection.',
      check: 'Check this provider', checkHint: 'Starts the CLI in the directory and runs ACP initialize only. No task is sent.',
      cwd: 'Working directory', cwdPlaceholder: '/absolute/path/to/project',
      diagnose: 'Check capabilities', discover: 'Find CLI sessions', capabilities: 'Capabilities', agent: 'Agent', protocol: 'Protocol',
      refreshModels: 'Refresh models', modelsHint: 'Creates an empty ACP session to read candidate models. No task is sent and your model picker stays unchanged.',
      modelsLoaded: '{n} candidate models found.', modelPickerHint: 'Choose this conversation’s model in the normal DSH model picker.',
      visibleModels: 'Models in the picker', modelSelectionHint: 'Check the models you want to show, then save. CLI default is always available.',
      saveModels: 'Save model selection', modelsSaved: 'Model picker updated.', noModels: 'Refresh models to load the choices.',
      modelInfoHint: 'CLI-reported details follow the selected models into the picker. Unknown capacities are not filled in. Use the picker’s reasoning control when advertised.',
      modelContext: 'Context: {n} tokens', modelOutput: 'Output limit: {n} tokens', modelInput: 'Input: {types}',
      modelEfforts: 'Reasoning: {levels}', modelInfoUnknown: 'No model details advertised', modalityText: 'text', modalityImage: 'image',
      authMethods: 'Sign-in methods', rawResult: 'Raw result', none: 'None advertised',
      'cap.loadSession': 'Resume sessions', 'cap.image': 'Image input', 'cap.audio': 'Audio input', 'cap.embeddedContext': 'Embedded context',
      'cap.list': 'Session list', 'cap.mcpHttp': 'MCP over HTTP', 'cap.mcpSse': 'MCP over SSE',
      discovered: 'CLI sessions in this directory', import: 'Import', more: 'More', noDiscovered: 'No sessions found.',
      importHint: 'Importing adds a local record only; connect it to load the conversation.',
      loginHint: 'If sign-in fails, run the CLI login command in a terminal, then reconnect.',
      search: 'Search title or directory', showArchived: 'Show archived', noRecords: 'No execution records yet.', noMatch: 'No records match.',
      nativeTag: 'DSH conversation', childTag: 'Subagent', standaloneTag: 'Standalone', retiredTag: 'Retired', archivedTag: 'Archived',
      pickRecord: 'Select a record to inspect its history.', remoteId: 'Remote session', dshSession: 'DSH session', updated: 'Updated', provider: 'Provider',
      rename: 'Rename', archive: 'Archive', unarchive: 'Restore', stopTurn: 'Stop turn', back: 'All records',
      archiveHint: 'Disconnect before archiving. Archiving never deletes workspace files or CLI history.',
      nativeReadOnly: 'This record belongs to a DSH conversation. Send messages from that conversation.',
      storageError: 'History could not be saved: {message}',
    }
    const zh = {
      panel: 'ACP 设置', panelHint: '管理提供方、检查能力、查看执行记录。对话仍在原有 DSH 会话中进行。',
      tabProviders: '提供方', tabRecords: '执行记录', live: '实时', offline: '正在重连…',
      engine: 'ACP 引擎', useEngine: '用 {name} 执行当前会话', showInfo: '了解 ACP 引擎', hideInfo: '收起说明',
      engineHint: '在原模型选择器中选择 ACP 提供方下的具体模型。输入框、附件和停止按钮照常使用，回复保留在当前时间线。',
      delegateHint: '如需由 DSH 模型主导，可保留当前模型，让它调用 subagent_cursor 或 subagent_antigravity 委派子任务，之后用 send_message 续聊。',
      warning: '外部 Agent 使用自己的登录、工具和文件权限，不受 DSH 工具沙箱约束。审批只覆盖 CLI 实际发出的请求。',
      engineOn: '{name} · ACP', notConnected: '发送消息时自动连接',
      connect: '连接', reconnect: '重新连接', disconnect: '断开', cancelConnect: '取消',
      newContext: '新建外部上下文', newContextConfirm: '从下一条消息开始新建外部对话？DSH 历史和旧执行记录仍然保留。',
      restoreTo: '切回 {model}', restoreTitle: '把当前会话切回之前使用的 DSH 模型',
      restoreHint: '没有保存此会话之前的 DSH 模型，请用模型选择器切回。',
      moreOptions: '展开引擎选项', lessOptions: '收起引擎选项', switchEngine: '切换引擎',
      connection: '连接', configuration: '配置', commands: 'CLI 命令', usage: '用量', directory: '目录',
      noConfig: '连接后会载入此 CLI 公布的模型、模式和选项。',
      model: '模型', mode: '模式', commandPick: '选择命令…', commandArgs: '参数', commandRun: '运行',
      commandHint: '作为普通消息发给外部 CLI。输入框中的斜杠命令仍由 DSH 处理。',
      usageContext: '上下文 {used} / {size}（{percent}%）', usageCost: '费用 {amount} {currency}',
      unknownUsage: '此 Agent 尚未上报。ACP 不提供账号剩余额度。',
      children: 'ACP 子任务', stop: '停止', pending: '待处理', expand: '展开轨迹', collapse: '收起轨迹',
      'state.starting': '连接中', 'state.idle': '就绪', 'state.running': '执行中', 'state.waiting': '等待你回应',
      'state.canceling': '停止中', 'state.disconnected': '已断开', 'state.error': '错误', 'state.preparing': '准备中',
      'state.completed': '已完成', 'state.interrupted': '已中断', 'state.failed': '失败',
      trace: '{name} 执行轨迹', traceTools: '{n} 次工具调用', traceTool: '1 次工具调用', traceFiles: '修改 {n} 个文件', traceFile: '修改 1 个文件',
      handoff: '已交接 DSH 上下文', sameContext: '延续外部上下文',
      viewTimeline: '时间线', viewRaw: '原始事件', older: '加载更早记录', loading: '加载中…',
      noEvents: '尚无执行事件。', noActivity: '本轮没有工具活动。',
      stderr: 'CLI 日志输出', stopReason: '本轮结束：{reason}', turnError: 'Agent 报错：{message}', configError: '设置被拒绝：{message}',
      plan: '计划', highPriority: '高',
      permission: '权限请求', question: 'Agent 提问', 'kind.plan': '计划审批',
      permanent: '选择“总是”类选项后，CLI 可能在后续请求中沿用。',
      approve: '批准计划', reject: '拒绝', rejectReason: '理由（可选）', answer: '提交答案', skip: '跳过', dismiss: '取消请求',
      'event.interaction': '请求：{title}', 'event.answered': '已回应', 'event.expired': '请求已过期',
      input: '输入', output: '输出', terminal: '终端 {id}', tool: '工具调用',
      user: '你', assistant: 'Agent', thinking: '思考', replay: '历史回放',
      truncated: '… 共 {n} 个字符', copy: '复制', copied: '已复制', wrap: '自动换行', unwrap: '取消换行', code: '代码',
      expandLines: '再显示 {n} 行', collapseLines: '收起', expandLinesAria: '显示隐藏的 {n} 行', collapseLinesAria: '收起展开的行',
      providerList: '提供方', addProvider: '新增提供方', editProvider: '编辑提供方', newProviderTitle: '新增提供方',
      fieldId: 'ID', fieldLabel: '显示名称', fieldCommand: '可执行文件', fieldCommandHint: '绝对路径或 PATH 中的名称。',
      fieldArgs: '参数', fieldArgsHint: 'JSON 字符串数组，例如 ["acp"]。不要填写密钥。',
      save: '保存', saved: '已保存', remove: '删除', removeConfirm: '删除此提供方配置？其执行记录仍然保留。',
      argsInvalid: '参数必须是 JSON 字符串数组。',
      providerHint: '先在终端完成 CLI 登录。保存不会启动进程，修改在下次连接时生效。',
      check: '检查提供方', checkHint: '在该目录启动 CLI，只执行 ACP initialize，不发送任务。',
      cwd: '工作目录', cwdPlaceholder: '/项目/的/绝对路径',
      diagnose: '检查能力', discover: '查找 CLI 会话', capabilities: '能力', agent: 'Agent', protocol: '协议',
      refreshModels: '刷新模型', modelsHint: '新建空 ACP 会话读取候选模型，不发送任务，也不会自动改变主模型选择器。',
      modelsLoaded: '发现 {n} 个候选模型。', modelPickerHint: '请在原 DSH 模型选择器中选择此会话使用的模型。',
      visibleModels: '显示在模型选择器中的模型', modelSelectionHint: '勾选需要显示的模型并保存。CLI default 始终保留。',
      saveModels: '保存模型选择', modelsSaved: '模型列表已更新。', noModels: '请先刷新模型以载入候选项。',
      modelInfoHint: '已选模型会携带 CLI 公布的信息。未公布的容量不补猜测值；支持思考强度时，可在原模型选择器中调整。',
      modelContext: '上下文：{n} tokens', modelOutput: '输出上限：{n} tokens', modelInput: '输入：{types}',
      modelEfforts: '思考强度：{levels}', modelInfoUnknown: 'CLI 未公布模型信息', modalityText: '文本', modalityImage: '图片',
      authMethods: '登录方式', rawResult: '原始结果', none: '未公布',
      'cap.loadSession': '恢复会话', 'cap.image': '图片输入', 'cap.audio': '音频输入', 'cap.embeddedContext': '嵌入上下文',
      'cap.list': '会话列表', 'cap.mcpHttp': 'HTTP MCP', 'cap.mcpSse': 'SSE MCP',
      discovered: '此目录下的 CLI 会话', import: '导入', more: '更多', noDiscovered: '没有找到会话。',
      importHint: '导入只创建本地记录，主动连接后才会载入对话。',
      loginHint: '若登录失败，请在终端执行 CLI 的登录命令后重新连接。',
      search: '搜索标题或目录', showArchived: '显示已归档', noRecords: '还没有执行记录。', noMatch: '没有匹配的记录。',
      nativeTag: 'DSH 会话', childTag: '子任务', standaloneTag: '独立', retiredTag: '已退役', archivedTag: '已归档',
      pickRecord: '选择一条记录查看历史。', remoteId: '远端会话', dshSession: 'DSH 会话', updated: '更新于', provider: '提供方',
      rename: '改名', archive: '归档', unarchive: '恢复归档', stopTurn: '停止本轮', back: '全部记录',
      archiveHint: '归档前请先断开。归档不会删除工作区文件或 CLI 历史。',
      nativeReadOnly: '这条记录属于 DSH 会话，请在该会话中发送消息。',
      storageError: '历史记录无法保存：{message}',
    }

    const CSS = `
.acpw{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
:where(.acpw) *,:where(.acpw) *::before,:where(.acpw) *::after{box-sizing:border-box}
:where(.acpw) :is(p,h1,h2,h3,ul,ol,dl,dd,fieldset,legend){margin:0;padding:0}
:where(.acpw) :is(ul,ol){list-style:none}
:where(.acpw) fieldset{border:0;min-width:0}
.acpw :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.aw-muted{color:var(--dsw-alias-label-tertiary)}
.aw-ellipsis{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.aw-row{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.aw-grow{flex:1 1 auto;min-width:0}
.aw-strong{font-weight:500}
.aw-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.aw-note{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.aw-warn{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.aw-warn>svg{flex:none;margin-top:1px;color:var(--dsw-alias-state-warn-primary)}
.aw-mono{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;overflow-wrap:anywhere}
.aw-select{height:28px;max-width:200px;min-width:0;padding:0 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:inherit;font:inherit;font-size:12px;text-overflow:ellipsis}
.aw-select:disabled{opacity:.55}
.aw-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-field>span:first-child{font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-field .aw-input{width:100%}
.aw-textarea{width:100%;min-height:60px;resize:vertical;padding:8px 10px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:inherit;font-family:var(--dsw-font-mono,ui-monospace,Menlo,monospace);font-size:12px;line-height:18px}
.aw-toggle{display:inline-grid;place-items:center;flex:none;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
@media (hover:hover){.aw-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}

/* Composer dock: same column, surface and type scale as the host Todo and Goal cards. */
.aw-dock{container-type:inline-size;display:flex;flex-direction:column;gap:6px;flex:none;margin:0 auto;
  width:calc(100% - 2 * var(--dsh-composer-side-clearance,16px) - 4 * var(--dsh-composer-dock-inset,8px));
  max-width:calc(var(--dsh-composer-card-max-width,760px) - 4 * var(--dsh-composer-dock-inset,8px))}
.aw-card{position:relative;isolation:isolate;border-radius:var(--dsw-radius-md,12px);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-panel)}
.aw-card::before{content:'';position:absolute;z-index:-1;inset:0;border-radius:inherit;pointer-events:none;background:var(--dsw-specific-menu,var(--dsw-alias-bg-base));backdrop-filter:var(--dsw-menu-backdrop-filter)}
.aw-card[data-tone=warn]{--dsw-elevation-stroke-color:var(--dsw-alias-state-warn-primary)}
.aw-bar{display:flex;align-items:center;gap:8px;min-height:36px;padding:4px 6px 4px 12px;min-width:0}
.aw-bar-title{font-weight:500;white-space:nowrap}
.aw-quiet .aw-bar{min-height:32px;padding-left:4px}
.aw-quiet .aw-label{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.aw-info{display:flex;flex-direction:column;gap:6px;padding:0 4px 6px}
.aw-pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.aw-panel{display:flex;flex-direction:column;gap:14px;padding:12px;border-top:1px solid var(--dsw-alias-border-l1);max-height:min(46vh,440px);overflow-y:auto;overscroll-behavior:contain}
.aw-section{display:flex;flex-direction:column;gap:8px;min-width:0}
.aw-section>h3{font-size:12px;font-weight:500;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.aw-config{display:flex;flex-wrap:wrap;gap:10px 16px}
.aw-config .aw-field{flex:1 1 160px;max-width:280px}
.aw-config .aw-select{max-width:none;width:100%}
.aw-model-list{display:flex;flex-direction:column;max-height:280px;overflow-y:auto;overscroll-behavior:contain}
.aw-switch{display:inline-flex;align-items:center;gap:8px;font-size:12px}
.aw-bar-error{padding:0 12px 8px}
@container (max-width:560px){.aw-bar .aw-hide-narrow{display:none}}

/* Pending human interaction */
.aw-ask{display:flex;flex-direction:column;gap:10px;padding:12px 14px;min-width:0}
.aw-ask-inline{border-radius:10px;border:1px solid var(--dsw-alias-state-warn-primary)}
.aw-ask-head{display:flex;align-items:center;gap:8px;font-weight:500}
.aw-ask-head>svg{color:var(--dsw-alias-state-warn-primary);flex:none}
.aw-ask-body{display:flex;flex-direction:column;gap:8px;min-width:0;max-height:min(40vh,360px);overflow:auto}
.aw-ask-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.aw-ask-actions .aw-reason{flex:1 1 160px;max-width:280px}
.aw-question{display:flex;flex-direction:column;gap:4px}
.aw-question legend{font-weight:500;margin-bottom:4px}
.aw-option{display:flex;align-items:flex-start;gap:8px;padding:5px 8px;border-radius:8px;cursor:pointer}
@media (hover:hover){.aw-option:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-option input{margin:3px 0 0;flex:none}

/* ACP subagents */
.aw-child{border-top:1px solid var(--dsw-alias-border-l1)}
.aw-child-body{padding:0 12px 10px}

/* Execution trace (chat node and records) */
.aw-trace{margin:2px 0;min-width:0}
.aw-trace-head{display:flex;align-items:center;gap:8px;min-height:28px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.aw-trace-body{display:flex;flex-direction:column;gap:8px;padding:4px 0 6px;min-width:0}
.aw-trace-meta{display:flex;align-items:center;flex-wrap:wrap;gap:4px 12px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:0}
.aw-trace-meta .aw-path{max-width:min(100%,360px)}
.aw-summary{color:var(--dsw-alias-label-tertiary);font-size:12px;margin-left:8px;font-weight:400}
.aw-list{display:flex;flex-direction:column;gap:2px;min-width:0}
.aw-detail{display:flex;flex-direction:column;gap:8px;padding:2px 0 8px 26px;min-width:0}
.aw-locs{display:flex;flex-direction:column;gap:2px;font-size:12px;min-width:0}
.aw-text{white-space:pre-wrap;overflow-wrap:anywhere}
.aw-plan{display:flex;flex-direction:column;gap:4px;padding:4px 0 4px 4px}
.aw-plan>h3{font-size:12px;font-weight:500;color:var(--dsw-alias-label-tertiary)}
.aw-plan li{display:flex;align-items:flex-start;gap:8px;min-width:0}
.aw-plan li>span:first-child{margin-top:4px;flex:none}
.aw-plan li[data-status=completed] .aw-plan-text{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}
.aw-event{display:flex;align-items:center;gap:8px;min-height:24px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:0;overflow-wrap:anywhere}
.aw-event[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.aw-event>svg{flex:none}
.aw-log{margin:0;max-height:240px;overflow:auto;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--dsw-font-mono,ui-monospace,Menlo,monospace);font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.aw-msg{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);min-width:0}
.aw-msg[data-role=user]{background:var(--dsw-alias-bg-layer-2);margin-left:32px}
.aw-msg-head{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.aw-img{max-width:100%;max-height:360px;border-radius:8px}

/* Sidebar page */
.aw-page{container-type:inline-size;display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base)}
.aw-page-inner{display:flex;flex-direction:column;gap:16px;width:min(100%,980px);margin:0 auto;padding:20px 24px 40px}
.aw-head{display:flex;align-items:flex-start;gap:12px}
.aw-head h1{font-size:18px;line-height:26px;font-weight:600}
.aw-live{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;margin-top:4px}
.aw-tabs{max-width:340px}
.aw-banner{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.aw-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.aw-banner>svg{flex:none;margin-top:1px}
.aw-banner-text{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-split{display:grid;grid-template-columns:minmax(200px,250px) minmax(0,1fr);gap:16px;align-items:start}
@container (max-width:700px){.aw-split{grid-template-columns:minmax(0,1fr)}}
.aw-nav{display:flex;flex-direction:column;gap:2px;min-width:0}
.aw-item{display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;min-width:0}
@media (hover:hover){.aw-item:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-item[aria-current=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-bg-layer-2))}
.aw-item-top{display:flex;align-items:center;gap:8px;min-width:0}
.aw-item-sub{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:0}
.aw-stack{display:flex;flex-direction:column;gap:16px;min-width:0}
.aw-box{display:flex;flex-direction:column;gap:14px;padding:16px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);min-width:0}
.aw-box-head{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.aw-box-head h2{font-size:14px;font-weight:600;line-height:20px}
.aw-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.aw-form .aw-wide{grid-column:1/-1}
@container (max-width:560px){.aw-form{grid-template-columns:minmax(0,1fr)}}
.aw-facts{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:4px 16px;font-size:12px;line-height:18px}
.aw-facts dt{color:var(--dsw-alias-label-tertiary)}
.aw-facts dd{min-width:0;overflow-wrap:anywhere}
.aw-tags{display:flex;flex-wrap:wrap;gap:6px}
.aw-found{display:flex;flex-direction:column;gap:2px}
.aw-found li{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:8px;min-width:0}
@media (hover:hover){.aw-found li:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-empty{padding:24px 12px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:12px}
.aw-filter{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.aw-filter .aw-input{flex:1 1 220px}
`

    const ACTIVE_RUN = new Set(['preparing', 'running', 'waiting', 'canceling'])
    const CONNECTED = new Set(['starting', 'idle', 'running', 'waiting', 'canceling'])
    const BUSY = new Set(['starting', 'running', 'waiting', 'canceling'])
    const DOT = { preparing: 'ongoing', starting: 'ongoing', running: 'ongoing', canceling: 'ongoing', waiting: 'warning', idle: 'done', completed: 'done', error: 'error', failed: 'error' }
    const TOOL_DOT = { in_progress: 'ongoing', completed: 'done', failed: 'error' }
    const PLAN_DOT = { in_progress: 'ongoing', completed: 'done' }
    const MESSAGE_UPDATES = new Set(['agent_message_chunk', 'agent_thought_chunk', 'user_message_chunk'])
    const EMPTY = []

    async function api(op, signal) {
      const response = await fetch('/acp-workbench/op', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(op), signal })
      const value = await response.json().catch(() => null)
      if (!response.ok) throw new Error(value?.message ?? `HTTP ${response.status}`)
      if (value === null && op.action !== 'native-trace') throw new Error('Invalid response from ACP Workbench')
      return value
    }
    const uniqueEvents = events => [...new Map(events.map(event => [event.seq, event])).values()].toSorted((a, b) => a.seq - b.seq)
    const updateOf = event => event?.data?.method === 'session/update' ? event.data.params?.update ?? null : null
    const defined = value => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null))
    const basename = path => String(path).split(/[\\/]/).filter(Boolean).at(-1) ?? String(path)
    const clock = at => { try { return new Date(at).toLocaleTimeString() } catch { return '' } }
    const stamp = at => { try { return new Date(at).toLocaleString() } catch { return String(at ?? '') } }
    const number = value => { try { return new Intl.NumberFormat().format(value) } catch { return String(value) } }
    /** Live dots spin; once the turn has ended an unfinished item no longer claims progress. */
    const settle = (state, live) => state === 'ongoing' && !live ? 'idle' : state
    const eventLabel = event => [event.type, event.data?.method, updateOf(event)?.sessionUpdate].filter(Boolean).join(' · ')

    /** Fold transport chunks into readable rows, retaining sequence numbers for raw-event inspection. */
    function timeline(events) {
      const rows = []
      const tools = new Map()
      const plans = new Map()
      for (const event of events) {
        const data = event.data ?? {}
        const update = updateOf(event)
        const kind = update?.sessionUpdate
        const role = event.type === 'user-message' ? 'user' : kind === 'agent_message_chunk' ? 'assistant' : kind === 'agent_thought_chunk' ? 'thinking' : kind === 'user_message_chunk' ? 'user' : null
        const text = update?.content?.type === 'text' ? update.content.text : null
        const previous = rows.at(-1)
        if (role && (text !== null || event.type === 'user-message')) {
          const value = text ?? data.text ?? ''
          if (previous?.kind === 'message' && previous.role === role && previous.turnId === data.turnId && previous.replay === !!data.replay) previous.text += value
          else rows.push({ kind: 'message', seq: event.seq, at: event.at, role, text: value, replay: !!data.replay, turnId: data.turnId })
        } else if (role && update?.content) {
          rows.push({ kind: 'content', seq: event.seq, role, content: update.content, replay: !!data.replay })
        } else if (kind === 'tool_call' || kind === 'tool_call_update') {
          const key = `${data.replay ? 'replay' : data.turnId}:${update.toolCallId}`
          let row = tools.get(key)
          if (!row) { row = { kind: 'tool', seq: event.seq, tool: {}, replay: !!data.replay }; tools.set(key, row); rows.push(row) }
          row.tool = { ...row.tool, ...defined(update) }
        } else if (kind === 'plan' || data.method?.replace(/^_/, '') === 'cursor/update_todos') {
          const key = `${data.replay ? 'replay' : data.turnId}:${data.method}:${data.params?.toolCallId ?? ''}`
          let row = plans.get(key)
          if (!row) { row = { kind: 'plan', seq: event.seq, entries: [] }; plans.set(key, row); rows.push(row) }
          const entries = update?.entries ?? data.params?.todos ?? []
          row.entries = data.params?.merge ? [...new Map([...row.entries, ...entries].map(entry => [entry.id, entry])).values()] : entries
        } else if (event.type === 'stderr') {
          if (previous?.kind === 'stderr') previous.text += data.text ?? ''
          else rows.push({ kind: 'stderr', seq: event.seq, text: data.text ?? '' })
        } else if (!MESSAGE_UPDATES.has(kind)) rows.push({ kind: 'event', ...event })
      }
      return rows
    }

    /** Ordered, labelled controls for every option the CLI actually advertised. */
    function configEntries(session, t) {
      const entries = []
      for (const option of session.configOptions ?? []) {
        if (!option?.id) continue
        const label = option.name ?? option.id
        if (option.type === 'boolean') entries.push({ id: option.id, label, category: option.category, kind: 'boolean', value: !!option.currentValue, op: value => ({ configId: option.id, value }) })
        else entries.push({ id: option.id, label, category: option.category, kind: 'select', value: option.currentValue ?? '',
          options: (option.options ?? []).flatMap(group => group.options ?? [group]).map(item => ({ value: item.value, label: item.name ?? String(item.value) })),
          op: value => ({ configId: option.id, value }) })
      }
      if (!entries.some(entry => entry.category === 'mode') && session.modes?.availableModes?.length) {
        entries.push({ id: '__mode', label: t('mode'), category: 'mode', kind: 'select', value: session.modes.currentModeId ?? '',
          options: session.modes.availableModes.map(mode => ({ value: mode.id, label: mode.name ?? mode.id })), op: value => ({ modeId: value }) })
      }
      if (!entries.some(entry => entry.category === 'model') && session.models?.availableModels?.length) {
        entries.push({ id: '__model', label: t('model'), category: 'model', kind: 'select', value: session.models.currentModelId ?? '',
          options: session.models.availableModels.map(model => ({ value: model.modelId, label: model.name ?? model.modelId })), op: value => ({ modelId: value }) })
      }
      return entries
    }

    return {
      name: 'acp-workbench', inject: ['slots', 'locale', 'layout', 'uiConversation'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'acp-workbench: locale')
        const t = ctx.locale.bind(NS)
        const subscribeLocale = listener => ctx.locale.subscribe(listener)
        const localeSnapshot = () => ctx.locale.getSnapshot()
        function useT() { React.useSyncExternalStore(subscribeLocale, localeSnapshot); return t }
        const stateText = state => t(`state.${state}`)

        // One stylesheet for every dock, trace and page instance.
        ctx.effect(() => {
          const style = document.createElement('style')
          style.setAttribute('data-acp-workbench', '')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'acp-workbench: styles')

        // One shared change feed. Browsers cap concurrent connections per origin, so every
        // dock, trace and page subscribes here instead of opening its own EventSource.
        const feed = { listeners: new Set(), watchers: new Set(), online: true, stream: null }
        // Copy first: a listener may unsubscribe while being notified.
        const notify = set => { for (const listener of Array.from(set)) listener() }
        const setOnline = value => { if (feed.online !== value) { feed.online = value; notify(feed.watchers) } }
        function subscribeLive(listener) {
          feed.listeners.add(listener)
          if (!feed.stream) {
            const stream = new EventSource('/acp-workbench/events')
            stream.addEventListener('open', () => setOnline(true))
            // The server sends the current revision on every (re)connect, so a message also covers recovery.
            stream.addEventListener('message', () => { setOnline(true); notify(feed.listeners) })
            stream.addEventListener('error', () => setOnline(false))
            feed.stream = stream
          }
          return () => {
            feed.listeners.delete(listener)
            if (!feed.listeners.size) { feed.stream?.close(); feed.stream = null }
          }
        }
        const watchOnline = listener => { feed.watchers.add(listener); return () => feed.watchers.delete(listener) }
        const useOnline = () => React.useSyncExternalStore(watchOnline, () => feed.online)
        ctx.effect(() => () => { feed.stream?.close(); feed.stream = null; feed.listeners.clear(); feed.watchers.clear() }, 'acp-workbench: live updates')

        const nativeSources = new Map()
        function nativeSource(sessionId) {
          const existing = nativeSources.get(sessionId)
          if (existing) return existing
          const listeners = new Set()
          let current = { data: null, error: '' }
          let controller = null
          let unsubscribe = null
          let loading = false
          let again = false
          const publish = value => { current = value; notify(listeners) }
          const refresh = async () => {
            if (!controller) return
            if (loading) { again = true; return }
            const own = controller
            loading = true
            try {
              do {
                again = false
                try {
                  const data = await api({ action: 'native-snapshot', dshSessionId: sessionId }, own.signal)
                  if (!own.signal.aborted) publish({ data, error: '' })
                } catch (error) { if (!own.signal.aborted) publish({ ...current, error: error.message }) }
              } while (again && !own.signal.aborted)
            } finally { loading = false }
            // A new subscription began while the previous one was still loading.
            if (controller && controller !== own) void refresh()
          }
          const stop = () => { controller?.abort(); controller = null; unsubscribe?.(); unsubscribe = null }
          const source = {
            getSnapshot: () => current,
            refresh,
            stop,
            subscribe(listener) {
              listeners.add(listener)
              if (listeners.size === 1) {
                controller = new AbortController()
                unsubscribe = subscribeLive(() => { void refresh() })
                void refresh()
              }
              return () => { listeners.delete(listener); if (!listeners.size) stop() }
            },
          }
          nativeSources.set(sessionId, source)
          return source
        }
        ctx.effect(() => () => { for (const source of nativeSources.values()) source.stop(); nativeSources.clear() }, 'acp-workbench: native subscriptions')

        function useNative(sessionId) {
          const source = React.useMemo(() => nativeSource(sessionId), [sessionId])
          const snapshot = React.useSyncExternalStore(source.subscribe, source.getSnapshot)
          const [pending, setPending] = React.useState(0)
          const [error, setError] = React.useState('')
          const run = React.useCallback(async op => {
            setPending(count => count + 1); setError('')
            try { const result = await api(op); void source.refresh(); return result }
            catch (failure) { setError(failure.message); return null }
            finally { setPending(count => count - 1) }
          }, [source])
          return { ...snapshot, busy: pending > 0, error: error || snapshot.error, run }
        }

        function useDiffLabels() {
          const locale = React.useSyncExternalStore(subscribeLocale, localeSnapshot)
          return React.useMemo(() => ({
            copy: t('copy'), copied: t('copied'), wrapLabel: t('wrap'), unwrapLabel: t('unwrap'), codeLabel: t('code'),
            expand: n => t('expandLines', { n }), collapse: t('collapseLines'), expandAria: n => t('expandLinesAria', { n }), collapseAria: t('collapseLinesAria'),
          }), [locale])
        }
        const truncated = n => t('truncated', { n: number(n) })
        const Json = ({ label, payload, open }) => h(JsonBlock, { label, payload, defaultOpen: !!open, truncatedLabel: truncated })
        const Toggle = ({ open, onClick, label }) => h('button', { type: 'button', className: 'aw-toggle', 'aria-expanded': open, 'aria-label': label, title: label, onClick },
          h(open ? IconChevronUpOutlineRegular : IconChevronDownOutlineRegular, { size: 14 }))
        function Status({ state, live = true }) {
          return h('span', { className: 'aw-row', style: { gap: 6, flexWrap: 'nowrap' } }, h(StateDot, { state: settle(DOT[state] ?? 'idle', live), size: 8 }), h('span', { className: 'aw-ellipsis' }, stateText(state)))
        }

        function Blocks({ blocks }) {
          const labels = useDiffLabels()
          const list = (blocks ?? EMPTY).filter(Boolean)
          const diffs = list.filter(block => block.type === 'diff' && typeof block.path === 'string')
          return h(React.Fragment, null,
            diffs.length ? h(DiffBlock, { labels, diffs: diffs.map(diff => ({ path: diff.path, oldText: diff.oldText ?? undefined, newText: diff.newText ?? '' })) }) : null,
            list.filter(block => block.type !== 'diff').map((block, index) => h(Block, { key: index, block })))
        }

        function Block({ block }) {
          const content = block.type === 'content' ? block.content : block
          if (block.type === 'terminal') return h('p', { className: 'aw-note' }, t('terminal', { id: block.terminalId ?? '' }))
          if (content?.type === 'text') return h('div', { className: 'aw-text' }, content.text)
          if (content?.type === 'image' && content.data && /^image\/(png|jpeg|webp|gif)$/.test(content.mimeType ?? '')) {
            return h('img', { className: 'aw-img', src: `data:${content.mimeType};base64,${content.data}`, alt: '' })
          }
          if (content?.type === 'resource_link') return h('p', { className: 'aw-mono' }, content.name ?? content.uri)
          if (content?.type === 'resource' && typeof content.resource?.text === 'string') {
            return h('div', { className: 'aw-field' }, h('span', { className: 'aw-mono' }, content.resource.uri ?? ''), h('pre', { className: 'aw-log' }, content.resource.text))
          }
          return h(Json, { label: content?.type ?? block.type ?? 'content', payload: block })
        }

        function ToolRow({ tool, live }) {
          const [open, setOpen] = React.useState(false)
          const toggle = React.useCallback(() => setOpen(value => !value), [])
          const status = tool.status ?? 'pending'
          const locations = (tool.locations ?? EMPTY).filter(location => typeof location?.path === 'string')
          const expandable = !!(tool.content?.length || locations.length || tool.rawInput !== undefined || tool.rawOutput !== undefined)
          const where = locations[0] ? `${basename(locations[0].path)}${locations[0].line ? `:${locations[0].line}` : ''}` : null
          const meta = [tool.kind && tool.kind !== 'other' ? tool.kind : null, where].filter(Boolean).join(' · ')
          return h(DisclosureRow, {
            icon: h(StateDot, { state: settle(TOOL_DOT[status] ?? 'idle', live) }),
            title: tool.title || tool.toolCallId || t('tool'),
            open, expandable, onToggle: toggle, expandOnRowClick: expandable, keepContentWhenOpen: true,
            running: live && (status === 'in_progress' || status === 'pending'),
            collapsedContent: meta ? h('span', { className: 'aw-summary' }, meta) : null,
          }, open ? h('div', { className: 'aw-detail' },
            locations.length ? h('div', { className: 'aw-locs' }, locations.map((location, index) =>
              h(PathLabel, { key: index, path: `${location.path}${location.line ? `:${location.line}` : ''}` }))) : null,
            h(Blocks, { blocks: tool.content }),
            tool.rawInput !== undefined ? h(Json, { label: t('input'), payload: tool.rawInput }) : null,
            tool.rawOutput !== undefined ? h(Json, { label: t('output'), payload: tool.rawOutput }) : null) : null)
        }

        function PlanRow({ entries, live }) {
          return h('ol', { className: 'aw-plan', 'aria-label': t('plan') }, h('h3', null, t('plan')),
            entries.map((entry, index) => h('li', { key: entry.id ?? index, 'data-status': entry.status },
              h(StateDot, { state: settle(PLAN_DOT[entry.status] ?? 'idle', live), appearance: 'step', size: 12 }),
              h('span', { className: 'aw-plan-text aw-grow' }, entry.content ?? entry.title ?? ''),
              entry.priority === 'high' ? h(Tag, { tone: 'warning' }, t('highPriority')) : null)))
        }

        function StderrRow({ text }) {
          const [open, setOpen] = React.useState(false)
          const toggle = React.useCallback(() => setOpen(value => !value), [])
          const lines = text.split('\n').filter(Boolean).length
          return h(DisclosureRow, {
            icon: h(IconInfoOutlineRegular, { size: 14 }), title: t('stderr'), open, expandable: true, onToggle: toggle, expandOnRowClick: true,
            collapsedContent: h('span', { className: 'aw-summary' }, String(lines)),
          }, open ? h('div', { className: 'aw-detail' }, h('pre', { className: 'aw-log' }, text)) : null)
        }

        function MessageRow({ row }) {
          const head = h('div', { className: 'aw-msg-head' }, h('span', null, t(row.role)), row.replay ? h(Tag, { tone: 'quiet' }, t('replay')) : null,
            row.at ? h('span', null, clock(row.at)) : null)
          return h('div', { className: 'aw-msg', 'data-role': row.role }, head, h('div', { className: row.role === 'thinking' ? 'aw-text aw-muted' : 'aw-text' }, row.text))
        }

        const CONVERSATION_EVENTS = new Set(['turn-error', 'configuration-error', 'interaction', 'interaction-result', 'interaction-expired'])
        // Handshakes, metadata updates and routine lifecycle are useful in records, noise beside a reply.
        const shownBesideReply = row => CONVERSATION_EVENTS.has(row.type) || (row.type === 'lifecycle' && !!row.data?.message)
        /** Lifecycle, results and interaction outcomes as single quiet lines. */
        function EventRow({ row, live }) {
          const data = row.data ?? {}
          switch (row.type) {
            case 'lifecycle':
              return h('div', { className: 'aw-event', 'data-tone': data.state === 'error' ? 'error' : undefined },
                h(StateDot, { state: settle(DOT[data.state] ?? 'idle', live), size: 8 }), h('span', null, stateText(data.state)),
                data.message || data.reason ? h('span', { className: 'aw-ellipsis', title: data.message ?? data.reason }, `· ${data.message ?? data.reason}`) : null)
            case 'turn-result': return h('div', { className: 'aw-event' }, t('stopReason', { reason: data.stopReason ?? '—' }))
            case 'turn-error': return h('div', { className: 'aw-event', 'data-tone': 'error' }, t('turnError', { message: data.message ?? '' }))
            case 'configuration-error': return h('div', { className: 'aw-event', 'data-tone': 'error' }, t('configError', { message: data.message ?? '' }))
            case 'interaction': return h('div', { className: 'aw-event' }, h(IconInfoOutlineRegular, { size: 14 }),
              h('span', { className: 'aw-ellipsis' }, t('event.interaction', { title: data.params?.toolCall?.title ?? data.params?.name ?? data.params?.title ?? t(data.kind === 'plan' ? 'kind.plan' : data.kind ?? 'permission') })))
            case 'interaction-result': return h('div', { className: 'aw-event' }, t('event.answered'), h('span', { className: 'aw-mono' }, data.result?.outcome?.outcome ?? ''))
            case 'interaction-expired': return h('div', { className: 'aw-event' }, t('event.expired'), data.reason ? h('span', { className: 'aw-mono' }, data.reason) : null)
            default: return h(Json, { label: eventLabel(row), payload: row.data })
          }
        }

        function TraceList({ events = EMPTY, folded, raw, live, conversation }) {
          const rows = React.useMemo(() => raw ? EMPTY : folded ?? timeline(events), [events, folded, raw])
          if (raw) {
            if (!events.length) return h('p', { className: 'aw-note' }, t('noEvents'))
            return h('div', { className: 'aw-list' }, events.map(event => h(Json, { key: event.seq, label: `#${event.seq} · ${eventLabel(event)} · ${clock(event.at)}`, payload: event })))
          }
          const items = rows.map(row => {
            const key = `${row.kind}:${row.seq}`
            if (row.kind === 'tool') return h(ToolRow, { key, tool: row.tool, live: live && !row.replay })
            if (row.kind === 'plan') return h(PlanRow, { key, entries: row.entries, live })
            if (row.kind === 'stderr' || row.kind === 'log') return h(StderrRow, { key, text: row.text })
            if (row.kind === 'error') return h('div', { key, className: 'aw-event', 'data-tone': 'error' }, row.message)
            if (row.kind === 'interaction') return h(EventRow, { key, live, row: { type: 'interaction', data: { kind: row.interaction, params: { title: row.title } } } })
            if (row.kind === 'answered') return h(EventRow, { key, live, row: { type: 'interaction-result', data: { result: { outcome: { outcome: row.outcome } } } } })
            if (row.kind === 'expired') return h(EventRow, { key, live, row: { type: 'interaction-expired', data: { reason: row.reason } } })
            // DSH already renders the reply itself beside a conversation trace.
            if (row.kind === 'message') return conversation ? null : h(MessageRow, { key, row })
            if (row.kind === 'content') return conversation ? null : h('div', { key, className: 'aw-msg' }, h(Block, { block: row.content }))
            return conversation && !shownBesideReply(row) ? null : h(EventRow, { key, row, live })
          }).filter(Boolean)
          if (!items.length) return h('p', { className: 'aw-note' }, t(conversation ? 'noActivity' : 'noEvents'))
          return h('div', { className: 'aw-list' }, items)
        }

        function InteractionCard({ item, sessionId, run, disabled, inline }) {
          const tt = useT()
          const [answers, setAnswers] = React.useState({})
          const [reason, setReason] = React.useState('')
          const params = item.params ?? {}
          const send = values => run({ action: 'respond', sessionId, interactionId: item.id, ...values })
          let body
          let actions
          let note = null
          if (item.kind === 'permission') {
            const call = params.toolCall ?? {}
            const options = params.options ?? EMPTY
            body = [
              h('div', { key: 'title', className: 'aw-row' }, h('span', { className: 'aw-strong aw-ellipsis' }, call.title ?? call.toolCallId ?? ''), call.kind ? h(Tag, { tone: 'quiet' }, call.kind) : null),
              call.locations?.length ? h('div', { key: 'locations', className: 'aw-locs' }, call.locations.filter(l => typeof l?.path === 'string').map((location, index) => h(PathLabel, { key: index, path: location.path }))) : null,
              call.content?.length ? h(Blocks, { key: 'content', blocks: call.content }) : null,
              call.rawInput !== undefined ? h(Json, { key: 'input', label: tt('input'), payload: call.rawInput, open: !call.content?.length }) : null,
            ]
            actions = options.map(option => h(Button, {
              key: option.optionId, size: 'sm', disabled, onClick: () => send({ optionId: option.optionId }),
              variant: option.kind === 'allow_once' ? 'primary' : option.kind?.startsWith('reject') ? 'ghost' : 'outline',
              title: option.kind?.endsWith('always') ? tt('permanent') : undefined,
            }, option.name ?? option.optionId))
            if (options.some(option => option.kind?.endsWith('always'))) note = tt('permanent')
          } else if (item.kind === 'plan') {
            body = [
              params.name ? h('span', { key: 'name', className: 'aw-strong' }, params.name) : null,
              params.overview ? h('p', { key: 'overview', className: 'aw-note' }, params.overview) : null,
              params.plan ? h('pre', { key: 'plan', className: 'aw-log' }, params.plan) : null,
            ]
            actions = [
              h(Button, { key: 'approve', size: 'sm', variant: 'primary', disabled, onClick: () => send({ accept: true }) }, tt('approve')),
              h(Input, { key: 'reason', className: 'aw-reason', value: reason, disabled, placeholder: tt('rejectReason'), 'aria-label': tt('rejectReason'), onChange: event => setReason(event.target.value) }),
              h(Button, { key: 'reject', size: 'sm', variant: 'outline', disabled, onClick: () => send({ accept: false, ...(reason.trim() ? { reason: reason.trim() } : {}) }) }, tt('reject')),
            ]
          } else {
            const questions = params.questions ?? EMPTY
            body = [
              params.title ? h('span', { key: 'title', className: 'aw-strong' }, params.title) : null,
              ...questions.map(question => h('fieldset', { key: question.id, className: 'aw-question' }, h('legend', null, question.prompt ?? question.title ?? ''),
                (question.options ?? EMPTY).map(option => h('label', { key: option.id, className: 'aw-option' },
                  h('input', {
                    type: question.allowMultiple ? 'checkbox' : 'radio', name: `${item.id}-${question.id}`, disabled,
                    checked: (answers[question.id] ?? EMPTY).includes(option.id),
                    onChange: event => setAnswers(old => ({ ...old, [question.id]: question.allowMultiple
                      ? event.target.checked ? [...(old[question.id] ?? []), option.id] : (old[question.id] ?? []).filter(id => id !== option.id)
                      : [option.id] })),
                  }),
                  h('span', null, option.label ?? option.id, option.description ? h('span', { className: 'aw-note', style: { display: 'block' } }, option.description) : null))))),
            ]
            actions = [
              h(Button, { key: 'answer', size: 'sm', variant: 'primary', disabled: disabled || questions.some(question => !answers[question.id]?.length),
                onClick: () => send({ answers: questions.map(question => ({ questionId: question.id, selectedOptionIds: answers[question.id] ?? [] })) }) }, tt('answer')),
              h(Button, { key: 'skip', size: 'sm', variant: 'ghost', disabled, onClick: () => send({ skip: true }) }, tt('skip')),
            ]
          }
          const title = tt(item.kind === 'plan' ? 'kind.plan' : item.kind)
          return h('section', { className: inline ? 'aw-ask aw-ask-inline' : 'aw-card aw-ask', 'data-tone': 'warn', 'aria-label': title },
            h('div', { className: 'aw-ask-head' }, h(IconWarningTriangleOutlineRegular, { size: 16 }), h('span', null, title)),
            h('div', { className: 'aw-ask-body' }, body),
            h('div', { className: 'aw-ask-actions' }, actions, h('span', { className: 'aw-grow' }),
              h(Button, { size: 'sm', variant: 'ghost', disabled, onClick: () => send({ cancel: true }) }, tt('dismiss'))),
            note ? h('p', { className: 'aw-note' }, note) : null)
        }

        function ConfigControl({ entry, disabled, onChange, compact }) {
          if (entry.kind === 'boolean') {
            return h('span', { className: 'aw-switch' }, h(Switch, { checked: entry.value, disabled, label: entry.label, onChange: value => onChange(entry.op(value)) }), h('span', null, entry.label))
          }
          const known = entry.options.some(option => option.value === entry.value)
          const select = h('select', { className: 'aw-select', value: entry.value, disabled, 'aria-label': entry.label, title: entry.label, onChange: event => onChange(entry.op(event.target.value)) },
            known ? null : h('option', { value: entry.value }, entry.value || '—'),
            entry.options.map(option => h('option', { key: option.value, value: option.value }, option.label)))
          return compact ? select : h('label', { className: 'aw-field' }, h('span', null, entry.label), select)
        }

        function usageText(usage) {
          if (!usage) return t('unknownUsage')
          const parts = []
          if (Number.isFinite(usage.used) && Number.isFinite(usage.size) && usage.size > 0) {
            parts.push(t('usageContext', { used: number(usage.used), size: number(usage.size), percent: Math.round(usage.used / usage.size * 100) }))
          }
          if (Number.isFinite(usage.cost?.amount)) parts.push(t('usageCost', { amount: number(usage.cost.amount), currency: usage.cost.currency ?? '' }))
          return parts.length ? parts.join(' · ') : null
        }

        function CommandForm({ session, onRun, disabled }) {
          const tt = useT()
          const [command, setCommand] = React.useState('')
          const [args, setArgs] = React.useState('')
          React.useEffect(() => { setCommand(''); setArgs('') }, [session.id])
          const chosen = session.commands.find(item => item.name === command)
          const submit = async event => {
            event.preventDefault()
            if (disabled || !command) return
            if (await onRun(command, args)) setArgs('')
          }
          return h('form', { className: 'aw-section', onSubmit: submit },
            h('div', { className: 'aw-row', style: { flexWrap: 'nowrap' } },
              h('select', { className: 'aw-select', value: command, disabled, 'aria-label': tt('commands'), onChange: event => { setCommand(event.target.value); setArgs('') } },
                h('option', { value: '' }, tt('commandPick')), session.commands.map(item => h('option', { key: item.name, value: item.name }, `/${item.name}`))),
              h(Input, { className: 'aw-grow', value: args, disabled: disabled || !command, placeholder: chosen?.input?.hint || tt('commandArgs'), 'aria-label': tt('commandArgs'), onChange: event => setArgs(event.target.value) }),
              h(Button, { type: 'submit', size: 'sm', variant: 'outline', disabled: disabled || !command || session.state !== 'idle' }, tt('commandRun'))),
            h('p', { className: 'aw-note' }, chosen?.description || tt('commandHint')))
        }

        /** One external run beside its native reply: collapsed to a summary, expanded to the tool trace. */
        function NativeTrace({ sessionId, turn, step, messageId, reference, canWrite, interactions = false }) {
          const tt = useT()
          const view = useNative(sessionId)
          const [fallback, setFallback] = React.useState(null)
          const [events, setEvents] = React.useState(EMPTY)
          const [ready, setReady] = React.useState(false)
          const [raw, setRaw] = React.useState(false)
          const [error, setError] = React.useState('')
          const [loadingOlder, setLoadingOlder] = React.useState(false)
          const after = React.useRef(0)
          const started = React.useRef(false)
          const generation = React.useRef(0)
          const matches = run => reference ? run.id === reference.turnId : messageId && run.messageId ? run.messageId === messageId : run.turn === turn && run.step === step
          // The snapshot carries recent runs only; an older run falls back to an exact lookup.
          const current = view.data?.sessions.find(s => (reference ? s.id === reference.sessionId : s.native.sessionId === sessionId) && s.native.runs.some(matches))
          const session = current ?? fallback
          const run = session?.native.runs.findLast(matches)
          const active = !!run && ACTIVE_RUN.has(run.state)
          const pending = run && interactions ? session.interactions.filter(item => item.turnId === run.id) : EMPTY
          const target = run?.to ?? session?.eventSeq ?? 0
          const from = run?.from ?? 1
          const traceReady = !!fallback?.native.runs.some(matches)
          // Keep every execution step inline. The Host folds token chunks and updates per tool,
          // so a long run does not require paging its raw stream just to show the ordered steps.
          React.useEffect(() => {
            const controller = new AbortController()
            void api({ action: 'native-trace', dshSessionId: sessionId, turn, step, messageId,
              ...(reference ? { externalId: reference.sessionId, runId: reference.turnId } : {}) }, controller.signal)
              .then(value => { if (!controller.signal.aborted) { setFallback(value); setError('') } })
              .catch(failure => { if (!controller.signal.aborted) setError(failure.message) })
            return () => controller.abort()
          }, [sessionId, turn, step, messageId, reference?.sessionId, reference?.turnId, target])
          React.useEffect(() => {
            started.current = false
            generation.current++
            setEvents(EMPTY)
            setReady(false)
          }, [session?.id, run?.id, raw])
          // Raw diagnostics stay lazy and paged; the normal timeline already has all folded rows.
          React.useEffect(() => {
            if (!raw || !session || !run) return
            if (!started.current) { after.current = Math.max(0, from - 1, target - 200); started.current = true }
            if (after.current >= target) { setReady(true); return }
            const controller = new AbortController()
            const own = generation.current
            void (async () => {
              try {
                while (after.current < target && !controller.signal.aborted) {
                  const page = await api({ action: 'events', sessionId: session.id, after: after.current, limit: 200 }, controller.signal)
                  if (controller.signal.aborted || own !== generation.current) return
                  if (page.next <= after.current) break
                  after.current = Math.min(page.next, target)
                  setEvents(old => uniqueEvents([...old, ...page.events.filter(event => event.seq <= target && event.seq >= from)]))
                }
                setReady(true)
                setError('')
              } catch (failure) { if (!controller.signal.aborted) setError(failure.message) }
            })()
            return () => controller.abort()
          }, [session?.id, run?.id, target, raw])
          if (!session || !run) return error ? h('p', { className: 'aw-error', role: 'alert' }, error) : null
          const older = async () => {
            const first = events[0]?.seq ?? target + 1
            setLoadingOlder(true)
            try {
              const page = await api({ action: 'events', sessionId: session.id, after: Math.max(from - 1, first - 201), limit: Math.min(200, first - from) })
              setEvents(old => uniqueEvents([...page.events.filter(event => event.seq >= from && event.seq < first), ...old]))
            } catch (failure) { setError(failure.message) } finally { setLoadingOlder(false) }
          }
          const name = view.data?.providers.find(provider => provider.id === session.providerId)?.label ?? session.providerId
          const state = active ? (run.state === 'preparing' ? 'preparing' : session.state) : run.state
          const files = run.files?.length ?? 0
          const summary = [
            state === 'completed' ? null : stateText(state),
            run.tools ? (run.tools === 1 ? tt('traceTool') : tt('traceTools', { n: run.tools })) : null,
            files ? (files === 1 ? tt('traceFile') : tt('traceFiles', { n: files })) : null,
          ].filter(Boolean).join(' · ')
          return h('section', { className: 'acpw aw-trace', 'aria-label': tt('trace', { name }) },
            h('div', { className: 'aw-trace-head' },
              h(StateDot, { state: DOT[state] ?? 'idle' }),
              h('span', null, tt('trace', { name })),
              summary ? h('span', null, summary) : null),
            h('div', { className: 'aw-trace-body' },
              h('div', { className: 'aw-trace-meta' },
                h(PathLabel, { path: session.cwd, className: 'aw-path' }),
                h('span', null, run.handoff ? tt('handoff') : tt('sameContext')),
                run.stopReason && run.stopReason !== 'end_turn' ? h('span', null, tt('stopReason', { reason: run.stopReason })) : null,
                h('span', { className: 'aw-grow' }),
                raw && events[0]?.seq > from ? h(Button, { size: 'sm', variant: 'ghost', disabled: loadingOlder, onClick: older }, tt('older')) : null,
                h(Button, { size: 'sm', variant: 'ghost', 'aria-pressed': raw, onClick: () => setRaw(!raw) }, tt(raw ? 'viewTimeline' : 'viewRaw'))),
              (raw ? ready || events.length : traceReady) ? h(TraceList, { events, folded: raw ? undefined : fallback.rows, raw, live: active, conversation: true }) : h('p', { className: 'aw-note' }, tt('loading')),
              run.error ? h('p', { className: 'aw-error', role: 'alert' }, run.error) : null,
              error || view.error ? h('p', { className: 'aw-error', role: 'alert' }, error || view.error) : null,
              pending.map(item => h(InteractionCard, { key: item.id, item, sessionId: session.id, run: view.run, disabled: view.busy || !canWrite, inline: true }))))
        }

        function ChildRow({ child, sessionId, view, canWrite }) {
          const tt = useT()
          const pending = child.interactions?.length ?? 0
          const [open, setOpen] = React.useState(null)
          const expanded = open ?? pending > 0
          const latest = child.native.runs.at(-1)
          return h('div', { className: 'aw-child' },
            h('div', { className: 'aw-bar' },
              h(StateDot, { state: DOT[child.state] ?? 'idle' }),
              h('span', { className: 'aw-strong aw-ellipsis' }, child.native.name ?? child.title),
              h('span', { className: 'aw-muted aw-hide-narrow' }, stateText(child.state)),
              pending ? h(Tag, { tone: 'warning' }, tt('pending')) : null,
              h('span', { className: 'aw-grow' }),
              BUSY.has(child.state) ? h(Button, { size: 'sm', variant: 'ghost', icon: h(IconStopFillRegular, { size: 14 }), disabled: !canWrite,
                onClick: () => view.run({ action: 'native-stop', dshSessionId: child.native.sessionId }) }, tt('stop')) : null,
              latest ? h(Toggle, { open: expanded, label: tt(expanded ? 'collapse' : 'expand'), onClick: () => setOpen(!expanded) }) : null),
            expanded && latest ? h('div', { className: 'aw-child-body' },
              h(NativeTrace, { sessionId, reference: { sessionId: child.id, turnId: latest.id }, canWrite, interactions: true })) : null)
        }

        function NativeDock(props) {
          const tt = useT()
          const canWrite = props.useAccess('session/prompt')
          const view = useNative(props.sessionId)
          const data = view.data
          if (!data?.providers?.length) return view.error ? h('div', { className: 'acpw aw-dock' }, h('p', { className: 'aw-error', role: 'alert' }, view.error)) : null
          const selected = data.selected?.provider
          const provider = data.providers.find(item => item.route === selected) ?? null
          const own = provider ? data.sessions.findLast(s => s.native.sessionId === props.sessionId && s.native.route === selected && !s.native.retired) ?? null : null
          const children = data.sessions.filter(s => s.native.sessionId !== props.sessionId && !s.native.retired)
          if (!own?.interactions?.length && !children.length && !view.error) return null
          return h('div', { className: 'acpw aw-dock' },
            (own?.interactions ?? EMPTY).map(item => h(InteractionCard, { key: item.id, item, sessionId: own.id, run: view.run, disabled: view.busy || !canWrite })),
            children.length ? h('section', { className: 'aw-card', 'aria-label': tt('children') },
              h('div', { className: 'aw-bar' }, h('span', { className: 'aw-bar-title' }, tt('children')), h('span', { className: 'aw-muted' }, String(children.length))),
              children.map(child => h(ChildRow, { key: child.id, child, sessionId: props.sessionId, view, canWrite }))) : null,
            view.error ? h('p', { className: 'aw-error', role: 'alert' }, view.error) : null)
        }

        ctx.uiConversation.events.register({
          kind: 'acp-route',
          match: { 'request/context': event => ({ id: String(event.seq), role: 'start' }) },
          start: (_context, match) => ({ provider: match.event.data.provider }),
          update: (_context, match) => ({ provider: match.event.data.provider }),
        })
        const traceMatch = event => ({ id: `${event.data.turn}:${event.data.step}`, role: 'start' })
        const traceState = (event, previous) => {
          const source = event.data.message?.source
          return { turn: event.data.turn, step: event.data.step, seq: event.seq,
            provider: source ? source.provider : previous?.provider,
            reference: source?.replayState?.response?.acp ?? previous?.reference, messageId: event.data.message?.id ?? previous?.messageId }
        }
        ctx.uiConversation.events.register({
          kind: 'acp-run', target: 'chat',
          match: {
            'assistant/live-chunk': event => event.data.chunk.type === 'block-start' ? traceMatch(event) : null,
            'assistant/message': event => event.surfaceOp === 'append' ? traceMatch(event) : null,
          },
          start: (_context, match, reader) => traceState(match.event, reader.previous('acp-route')?.state),
          update: (context, match) => ({ ...traceState(match.event, context.state), seq: context.state.seq }),
          buildViewNode: context => context.state?.provider?.startsWith('acp-') ? { key: context.key, id: context.id, kind: 'acp-run', target: 'chat',
            // Claude Code's timeline stands outside Chat's step and Turn process disclosures.
            ...(context.state.provider === 'acp-claude-code' ? { groupTree: 'turn' } : {}),
            anchorSeq: context.state.seq, location: context.start?.location ?? { kind: 'unresolved' }, visibility: 'visible', data: context.state } : null,
        })
        function NativeNode(props) {
          return h(NativeTrace, { sessionId: props.sessionId, ...props.node.data, canWrite: props.useAccess('session/prompt') })
        }
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({ name: 'conversation.composer.dock', id: 'acp-native', order: 40 }, NativeDock))
        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({ name: 'conversation.chat.node', key: 'acp-run' }, NativeNode))

        /* ---------------------------------------------------------------- sidebar page */

        function useWorkbench(selected) {
          const [data, setData] = React.useState({ providers: EMPTY, sessions: EMPTY, storageError: null })
          const [detail, setDetail] = React.useState(null)
          const [events, setEvents] = React.useState(EMPTY)
          const [error, setError] = React.useState('')
          const kick = React.useRef(null)
          const active = React.useRef(null)
          React.useEffect(() => {
            const controller = new AbortController()
            active.current = controller
            let cursor = null
            let loading = false
            let again = false
            setDetail(null)
            setEvents(EMPTY)
            const refresh = async () => {
              if (loading) { again = true; return }
              loading = true
              try {
                do {
                  again = false
                  try {
                    const response = await fetch('/acp-workbench/state', { signal: controller.signal })
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    const next = await response.json()
                    if (controller.signal.aborted) return
                    setData(next)
                    if (selected) {
                      const session = await api({ action: 'get', sessionId: selected }, controller.signal)
                      if (controller.signal.aborted) return
                      setDetail(session)
                      if (cursor === null) cursor = Math.max(0, (session.eventSeq ?? 0) - 200)
                      if (cursor < (session.eventSeq ?? 0)) {
                        const page = await api({ action: 'events', sessionId: selected, after: cursor, limit: 200 }, controller.signal)
                        if (controller.signal.aborted) return
                        cursor = page.next
                        setEvents(old => uniqueEvents([...old, ...page.events]))
                        if (page.more) again = true
                      }
                    }
                    setError('')
                  } catch (failure) { if (!controller.signal.aborted) setError(failure.message) }
                } while (again && !controller.signal.aborted)
              } finally { loading = false }
            }
            kick.current = refresh
            void refresh()
            const unsubscribe = subscribeLive(() => { void refresh() })
            return () => { controller.abort(); unsubscribe(); kick.current = null }
          }, [selected])
          const older = async () => {
            const first = events[0]?.seq ?? 1
            if (first <= 1) return
            const signal = active.current?.signal
            const page = await api({ action: 'events', sessionId: selected, after: Math.max(0, first - 201), limit: Math.min(200, first - 1) }, signal)
            if (!signal?.aborted) setEvents(old => uniqueEvents([...page.events, ...old]))
          }
          return { data, detail: detail?.id === selected ? detail : null, events, error, older, refresh: () => kick.current?.() }
        }

        const blankProvider = () => ({ id: '', label: '', command: '', args: '["acp"]' })
        const capabilityTags = info => {
          const agent = info.agentCapabilities ?? {}
          return [
            ['cap.loadSession', agent.loadSession], ['cap.list', agent.sessionCapabilities?.list], ['cap.image', agent.promptCapabilities?.image],
            ['cap.audio', agent.promptCapabilities?.audio], ['cap.embeddedContext', agent.promptCapabilities?.embeddedContext],
            ['cap.mcpHttp', agent.mcpCapabilities?.http], ['cap.mcpSse', agent.mcpCapabilities?.sse],
          ].map(([key, value]) => ({ key, on: !!value }))
        }

        function CapabilityReport({ info }) {
          const tt = useT()
          const agentInfo = info.agentInfo ?? info.serverInfo
          return h('div', { className: 'aw-section' },
            h('dl', { className: 'aw-facts' },
              agentInfo ? h(React.Fragment, null, h('dt', null, tt('agent')), h('dd', null, [agentInfo.title ?? agentInfo.name, agentInfo.version].filter(Boolean).join(' '))) : null,
              h('dt', null, tt('protocol')), h('dd', null, `ACP v${info.protocolVersion ?? '?'}`),
              h('dt', null, tt('authMethods')), h('dd', null, info.authMethods?.length ? info.authMethods.map(method => method.name ?? method.id).join(', ') : tt('none'))),
            h('div', { className: 'aw-tags', 'aria-label': tt('capabilities') }, capabilityTags(info).map(item => h(Tag, { key: item.key, tone: item.on ? 'success' : 'quiet' }, tt(item.key)))),
            h(Json, { label: tt('rawResult'), payload: info }))
        }

        function ProvidersTab({ providers, run, busy, cwdHint, onImported }) {
          const tt = useT()
          const [editing, setEditing] = React.useState(providers[0]?.id ?? '')
          const [draft, setDraft] = React.useState(() => providers[0] ? { ...providers[0], args: JSON.stringify(providers[0].args) } : blankProvider())
          const [notice, setNotice] = React.useState('')
          const [cwd, setCwd] = React.useState(cwdHint ?? '')
          const [report, setReport] = React.useState(null)
          const [discovery, setDiscovery] = React.useState(null)
          const [modelCount, setModelCount] = React.useState(null)
          const [selectedModels, setSelectedModels] = React.useState(() => providers[0]?.models ?? [])
          const [modelsSaved, setModelsSaved] = React.useState(false)
          const saved = providers.find(provider => provider.id === editing)
          const modelChoices = [...[...(saved?.advertised?.models ?? []), ...(saved?.models ?? []), ...selectedModels]
            .reduce((map, model) => map.set(model.id, { ...map.get(model.id), ...model }), new Map()).values()].filter(model => model.id !== 'default')
          const modelInfo = model => [model.description,
            model.inputModalities?.length ? tt('modelInput', { types: model.inputModalities.map(type => tt(type === 'image' ? 'modalityImage' : 'modalityText')).join(' / ') }) : null,
            model.contextWindow ? tt('modelContext', { n: model.contextWindow }) : null,
            model.maxTokens ? tt('modelOutput', { n: model.maxTokens }) : null,
            model.reasoning ? tt('modelEfforts', { levels: model.reasoning.efforts.map(effort => effort.name).join(' / ') }) : null,
          ].filter(Boolean).join(' · ') || tt('modelInfoUnknown')
          const canSaveModels = !!saved && !busy && JSON.stringify(selectedModels) !== JSON.stringify(saved.models ?? [])
          const edit = provider => {
            setEditing(provider?.id ?? '')
            setDraft(provider ? { ...provider, args: JSON.stringify(provider.args) } : blankProvider())
            setNotice(''); setReport(null); setDiscovery(null); setModelCount(null)
            setSelectedModels(provider?.models ?? []); setModelsSaved(false)
          }
          React.useEffect(() => { if (!editing && providers[0] && !draft.id && !draft.command) edit(providers[0]) }, [providers.length])
          // Records arrive after the first render; offer the latest record's directory once known.
          React.useEffect(() => { if (!cwd && cwdHint) setCwd(cwdHint) }, [cwdHint])
          const change = key => event => { setDraft(old => ({ ...old, [key]: event.target.value })); setNotice('') }
          const save = async event => {
            event.preventDefault()
            let args
            try { args = JSON.parse(draft.args) } catch { args = null }
            if (!Array.isArray(args) || args.some(item => typeof item !== 'string')) { setNotice(tt('argsInvalid')); return }
            const value = await run({ action: 'provider-save', provider: { id: draft.id.trim(), label: draft.label, command: draft.command, args, models: saved?.models ?? [] } })
            if (value) { setEditing(value.id); setNotice(tt('saved')) }
          }
          const remove = async () => {
            if (!saved || !window.confirm(tt('removeConfirm'))) return
            if (await run({ action: 'provider-remove', providerId: saved.id })) edit(providers.find(provider => provider.id !== saved.id))
          }
          const discover = async cursor => {
            const value = await run({ action: 'discover', providerId: saved.id, cwd, ...(cursor ? { cursor } : {}) })
            if (value) setDiscovery(old => cursor && old ? { ...value, sessions: [...old.sessions, ...(value.sessions ?? [])] } : { ...value, sessions: value.sessions ?? [] })
          }
          const saveModels = async () => {
            const value = await run({ action: 'provider-save', provider: { ...saved, models: selectedModels } })
            if (value) { setSelectedModels(value.models); setModelsSaved(true) }
          }
          const canCheck = !!saved && !busy && !!cwd.trim()
          return h('div', { className: 'aw-split' },
            h('nav', { className: 'aw-nav', 'aria-label': tt('providerList') },
              providers.map(provider => h('button', { key: provider.id, type: 'button', className: 'aw-item', 'aria-current': provider.id === editing, onClick: () => edit(provider) },
                h('span', { className: 'aw-item-top' }, h('span', { className: 'aw-strong aw-ellipsis' }, provider.label), h(Tag, { tone: 'quiet' }, provider.id)),
                h('span', { className: 'aw-item-sub aw-mono aw-ellipsis' }, [provider.command, ...provider.args].join(' ')))),
              h(Button, { size: 'sm', variant: 'ghost', icon: h(IconPlusOutlineRegular, { size: 14 }), onClick: () => edit(null) }, tt('addProvider'))),
            h('div', { className: 'aw-stack' },
              h('form', { className: 'aw-box', onSubmit: save },
                h('div', { className: 'aw-box-head' }, h('h2', null, saved ? tt('editProvider') : tt('newProviderTitle'))),
                h('p', { className: 'aw-note' }, tt('providerHint')),
                h('div', { className: 'aw-form' },
                  h('label', { className: 'aw-field' }, h('span', null, tt('fieldLabel')), h(Input, { className: 'aw-input', value: draft.label, required: true, onChange: change('label') })),
                  h('label', { className: 'aw-field' }, h('span', null, tt('fieldId')), h(Input, { className: 'aw-input aw-mono', value: draft.id, required: true, pattern: '[a-z][a-z0-9-]*', disabled: !!saved, onChange: change('id') })),
                  h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldCommand')), h(Input, { className: 'aw-input aw-mono', value: draft.command, required: true, onChange: change('command') }),
                    h('span', { className: 'aw-note' }, tt('fieldCommandHint'))),
                  h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldArgs')), h('textarea', { className: 'aw-textarea', value: draft.args, rows: 2, required: true, spellCheck: false, onChange: change('args') }),
                    h('span', { className: 'aw-note' }, tt('fieldArgsHint')))),
                h('div', { className: 'aw-row' },
                  h(Button, { type: 'submit', size: 'sm', variant: 'primary', disabled: busy }, tt('save')),
                  saved ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: remove }, tt('remove')) : null,
                  notice ? h('span', { className: notice === tt('saved') ? 'aw-note' : 'aw-error', role: 'status' }, notice) : null)),
              saved ? h('section', { className: 'aw-box', 'aria-label': tt('check') },
                h('div', { className: 'aw-box-head' }, h('h2', null, tt('check'))),
                h('p', { className: 'aw-note' }, tt('checkHint')),
                h('label', { className: 'aw-field' }, h('span', null, tt('cwd')), h(Input, { className: 'aw-input aw-mono', value: cwd, placeholder: tt('cwdPlaceholder'), onChange: event => setCwd(event.target.value) })),
                h('div', { className: 'aw-row' },
                  h(Button, { size: 'sm', variant: 'outline', disabled: !canCheck, onClick: async () => { const value = await run({ action: 'diagnose', providerId: saved.id, cwd: cwd.trim() }); if (value) setReport(value) } }, tt('diagnose')),
                  h(Button, { size: 'sm', variant: 'outline', disabled: !canCheck, onClick: async () => { const value = await run({ action: 'models', providerId: saved.id, cwd: cwd.trim() }); if (value) setModelCount(value.models.length) } }, tt('refreshModels')),
                  h(Button, { size: 'sm', variant: 'ghost', disabled: !canCheck, onClick: () => discover() }, tt('discover'))),
                h('p', { className: 'aw-note' }, tt('modelsHint')),
                modelCount !== null ? h('p', { className: 'aw-note', role: 'status' }, tt('modelsLoaded', { n: modelCount })) : null,
                h('fieldset', { className: 'aw-section' },
                  h('legend', { className: 'aw-strong' }, tt('visibleModels')),
                  h('p', { className: 'aw-note' }, tt('modelSelectionHint')),
                  h('p', { className: 'aw-note' }, tt('modelInfoHint')),
                  modelChoices.length ? h('div', { className: 'aw-model-list' }, modelChoices.map(model => h('label', { key: model.id, className: 'aw-option' },
                    h('input', { type: 'checkbox', checked: selectedModels.some(item => item.id === model.id), disabled: busy, onChange: event => {
                      const checked = event.target.checked
                      setSelectedModels(old => checked ? [...old, { id: model.id, name: model.name ?? model.id }] : old.filter(item => item.id !== model.id))
                      setModelsSaved(false)
                    } }),
                    h('span', { className: 'aw-grow' }, h('span', null, model.name ?? model.id),
                      h('span', { className: 'aw-item-sub aw-mono', style: { display: 'block' } }, model.id),
                      h('span', { className: 'aw-item-sub', style: { display: 'block' } }, modelInfo(model))))))
                    : h('p', { className: 'aw-note' }, tt('noModels')),
                  h('div', { className: 'aw-row' },
                    h(Button, { size: 'sm', variant: 'primary', disabled: !canSaveModels, onClick: saveModels }, tt('saveModels')),
                    modelsSaved ? h('span', { className: 'aw-note', role: 'status' }, tt('modelsSaved')) : null)),
                report ? h(CapabilityReport, { info: report }) : null,
                discovery ? h('div', { className: 'aw-section' }, h('h3', { className: 'aw-note' }, tt('discovered')), h('p', { className: 'aw-note' }, tt('importHint')),
                  discovery.sessions.length ? h('ul', { className: 'aw-found' }, discovery.sessions.map(found => h('li', { key: found.sessionId },
                    h('span', { className: 'aw-grow' }, h('span', { className: 'aw-ellipsis', style: { display: 'block' } }, found.title ?? found.sessionId),
                      h('span', { className: 'aw-item-sub aw-mono aw-ellipsis', style: { display: 'block' } }, [found.cwd, found.updatedAt ? stamp(found.updatedAt) : null].filter(Boolean).join(' · '))),
                    h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: async () => {
                      const value = await run({ action: 'import', providerId: saved.id, remoteId: found.sessionId, cwd: found.cwd ?? cwd.trim(), ...(found.title ? { title: found.title } : {}) })
                      if (value) onImported(value.id)
                    } }, tt('import'))))) : h('p', { className: 'aw-empty' }, tt('noDiscovered')),
                  discovery.nextCursor ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => discover(discovery.nextCursor) }, tt('more')) : null) : null,
                h('p', { className: 'aw-note' }, tt('loginHint'))) : null))
        }

        function recordKind(session) {
          if (!session.native) return 'standaloneTag'
          return session.native.sessionId === session.native.rootSessionId || !session.native.rootSessionId ? 'nativeTag' : 'childTag'
        }

        function RecordDetail({ session, events, view, run, busy, onBack, providers }) {
          const tt = useT()
          const [raw, setRaw] = React.useState(false)
          const [title, setTitle] = React.useState(session.title)
          React.useEffect(() => setTitle(session.title), [session.id, session.title])
          const connected = CONNECTED.has(session.state)
          const provider = providers.find(item => item.id === session.providerId)
          const entries = configEntries(session, tt).filter(entry => !session.native || entry.category !== 'model')
          return h('div', { className: 'aw-stack' },
            h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' },
                h(Button, { size: 'sm', variant: 'ghost', onClick: onBack }, `← ${tt('back')}`),
                h('span', { className: 'aw-grow' }),
                h(Status, { state: session.state })),
              h('form', { className: 'aw-row', onSubmit: event => { event.preventDefault(); if (title.trim() && title !== session.title) void run({ action: 'rename', sessionId: session.id, title }) } },
                h(Input, { className: 'aw-grow', value: title, 'aria-label': tt('rename'), onChange: event => setTitle(event.target.value) }),
                h(Button, { type: 'submit', size: 'sm', variant: 'ghost', disabled: busy || !title.trim() || title === session.title }, tt('rename'))),
              h('div', { className: 'aw-tags' }, h(Tag, { tone: 'outline' }, provider?.label ?? session.providerId), h(Tag, { tone: 'quiet' }, tt(recordKind(session))),
                session.native?.retired ? h(Tag, { tone: 'quiet' }, tt('retiredTag')) : null, session.archived ? h(Tag, { tone: 'quiet' }, tt('archivedTag')) : null),
              h('dl', { className: 'aw-facts' },
                h('dt', null, tt('directory')), h('dd', null, h(PathLabel, { path: session.cwd })),
                session.remoteId ? h(React.Fragment, null, h('dt', null, tt('remoteId')), h('dd', { className: 'aw-mono' }, session.remoteId)) : null,
                session.native ? h(React.Fragment, null, h('dt', null, tt('dshSession')), h('dd', { className: 'aw-mono' }, session.native.sessionId)) : null,
                h('dt', null, tt('updated')), h('dd', null, stamp(session.updatedAt))),
              session.lastError ? h('p', { className: 'aw-error', role: 'alert' }, session.lastError) : null,
              session.native ? h('p', { className: 'aw-note' }, tt('nativeReadOnly'), ' ', tt('modelPickerHint')) : null,
              h('div', { className: 'aw-row' },
                connected ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => run({ action: 'disconnect', sessionId: session.id }) }, tt('disconnect'))
                  : h(Button, { size: 'sm', variant: 'outline', disabled: busy || session.archived, onClick: () => run(session.native ? { action: 'native-connect', dshSessionId: session.native.sessionId, externalId: session.id } : { action: 'connect', sessionId: session.id }) }, tt(session.remoteId ? 'reconnect' : 'connect')),
                BUSY.has(session.state) && (session.native || session.state !== 'starting') ? h(Button, { size: 'sm', variant: 'ghost', icon: h(IconStopFillRegular, { size: 14 }), disabled: busy, onClick: () => run(session.native ? { action: 'native-stop', dshSessionId: session.native.sessionId } : { action: 'cancel', sessionId: session.id }) }, tt(session.state === 'starting' ? 'cancelConnect' : 'stopTurn')) : null,
                session.native && !session.native.retired ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy || BUSY.has(session.state), onClick: () => { if (window.confirm(tt('newContextConfirm'))) void run({ action: 'native-reset', externalId: session.id }) } }, tt('newContext')) : null,
                session.archived
                  ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => run({ action: 'restore', sessionId: session.id }) }, tt('unarchive'))
                  : h(Button, { size: 'sm', variant: 'ghost', disabled: busy || connected, title: tt('archiveHint'), onClick: () => run({ action: 'archive', sessionId: session.id }) }, tt('archive')))),
            session.interactions?.map(item => h(InteractionCard, { key: item.id, item, sessionId: session.id, run, disabled: busy, inline: true })),
            entries.length || session.usage ? h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' }, h('h2', null, tt('configuration'))),
              entries.length ? h('div', { className: 'aw-config' }, entries.map(entry => h(ConfigControl, { key: entry.id, entry, disabled: busy || session.state !== 'idle',
                onChange: values => run({ action: 'configure', sessionId: session.id, ...values }) }))) : null,
              h('p', { className: 'aw-note' }, usageText(session.usage) ?? '')) : null,
            session.native && !session.native.retired && session.commands?.length ? h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' }, h('h2', null, tt('commands'))),
              h(CommandForm, { session, disabled: busy || session.state !== 'idle',
                onRun: async (command, args) => !!(await run({ action: 'native-command', dshSessionId: session.native.sessionId, externalId: session.id, command, arguments: args })) })) : null,
            h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' }, h('h2', null, tt(raw ? 'viewRaw' : 'viewTimeline')), h('span', { className: 'aw-grow' }),
                events[0]?.seq > 1 ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => view.older().catch(() => {}) }, tt('older')) : null,
                h(Button, { size: 'sm', variant: 'ghost', 'aria-pressed': raw, onClick: () => setRaw(!raw) }, tt(raw ? 'viewTimeline' : 'viewRaw'))),
              h(TraceList, { events, raw, live: BUSY.has(session.state), conversation: false })))
        }

        function RecordsTab({ view, run, busy, selected, onSelect, providers }) {
          const tt = useT()
          const [query, setQuery] = React.useState('')
          const [archived, setArchived] = React.useState(false)
          const sessions = view.data.sessions
          if (selected && view.detail) return h(RecordDetail, { session: view.detail, events: view.events, view, run, busy, providers, onBack: () => onSelect(null) })
          if (selected) return h('p', { className: 'aw-empty' }, tt('loading'))
          const needle = query.trim().toLowerCase()
          const visible = sessions.filter(session => (archived || !session.archived) && (!needle || `${session.title} ${session.cwd}`.toLowerCase().includes(needle)))
          return h('div', { className: 'aw-stack' },
            h('div', { className: 'aw-filter' },
              h(Input, { className: 'aw-input', type: 'search', value: query, placeholder: tt('search'), 'aria-label': tt('search'), onChange: event => setQuery(event.target.value) }),
              h('span', { className: 'aw-switch' }, h(Switch, { checked: archived, label: tt('showArchived'), onChange: setArchived }), h('span', null, tt('showArchived')))),
            !sessions.length ? h('p', { className: 'aw-empty' }, tt('noRecords'))
              : !visible.length ? h('p', { className: 'aw-empty' }, tt('noMatch'))
                : h('div', { className: 'aw-nav' }, visible.map(session => h('button', { key: session.id, type: 'button', className: 'aw-item', onClick: () => onSelect(session.id) },
                  h('span', { className: 'aw-item-top' },
                    h(StateDot, { state: DOT[session.state] ?? 'idle', size: 8 }),
                    h('span', { className: 'aw-strong aw-ellipsis aw-grow' }, session.title),
                    h(Tag, { tone: 'quiet' }, tt(recordKind(session))),
                    session.archived ? h(Tag, { tone: 'quiet' }, tt('archivedTag')) : null),
                  h('span', { className: 'aw-item-sub aw-ellipsis' }, [providers.find(item => item.id === session.providerId)?.label ?? session.providerId, stateText(session.state), session.cwd, stamp(session.updatedAt)].join(' · '))))))
        }

        function Page() {
          const tt = useT()
          const online = useOnline()
          const [tab, setTab] = React.useState('providers')
          const [selected, setSelected] = React.useState(null)
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState('')
          const view = useWorkbench(selected)
          const run = async op => {
            setBusy(true); setError('')
            try { const result = await api(op); view.refresh(); return result }
            catch (failure) { setError(failure.message); return null }
            finally { setBusy(false) }
          }
          const problem = error || view.error
          return h('div', { className: 'acpw aw-page' }, h('div', { className: 'aw-page-inner' },
            h('header', { className: 'aw-head' },
              h('div', { className: 'aw-grow' }, h('h1', null, tt('panel')), h('p', { className: 'aw-note' }, tt('panelHint'))),
              h('span', { className: 'aw-live', role: 'status' }, h(StateDot, { state: online ? 'done' : 'warning', size: 8 }), tt(online ? 'live' : 'offline'))),
            h(SegmentedTabs, { className: 'aw-tabs', size: 'sm', label: tt('panel'), value: tab, onChange: setTab, items: [
              { value: 'providers', label: tt('tabProviders'), id: 'aw-tab-providers', panelId: 'aw-panel-providers' },
              { value: 'records', label: `${tt('tabRecords')} · ${view.data.sessions.length}`, id: 'aw-tab-records', panelId: 'aw-panel-records' },
            ] }),
            view.data.storageError ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), tt('storageError', { message: view.data.storageError })) : null,
            problem ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), problem) : null,
            h('div', { role: 'tabpanel', id: `aw-panel-${tab}`, 'aria-labelledby': `aw-tab-${tab}` },
              tab === 'providers'
                ? h('div', { className: 'aw-stack' },
                  h('div', { className: 'aw-banner' }, h(IconInfoOutlineRegular, { size: 14 }),
                    h('div', { className: 'aw-banner-text' }, h('span', null, tt('engineHint')), h('span', null, tt('delegateHint')), h('span', null, tt('warning')))),
                  h(ProvidersTab, { providers: view.data.providers, run, busy, cwdHint: view.data.sessions[0]?.cwd, onImported: id => { setSelected(id); setTab('records') } }))
                : h(RecordsTab, { view, run, busy, selected, onSelect: setSelected, providers: view.data.providers }))))
        }
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: NS, locale: NS }, Page))
        function Icon({ size = 16 }) {
          return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
            h('rect', { x: 3, y: 4, width: 18, height: 13, rx: 2 }), h('path', { d: 'm7 8 3 2.5L7 13m6 0h4M8 21h8m-4-4v4' }))
        }
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: NS, order: 46, locale: NS, label: () => t('panel') }, Icon))
      },
    }
  },
})
