/**
 * dsh-paseo-hub — browser half.
 *
 * A "Paseo Hub" launcher in the sidebar panel list opens a main page with five
 * tabs: Overview (connection, counts, latest runs and activity), Runs (search,
 * status filter, pagination, per-run actions), Activity (the Host's journal of
 * connection changes, Hub requests and run outcomes), and Setup (modes and the
 * trigger snippet). Hub API manages the organization independently of enrollment.
 *
 * Reads: `paseo-hub/state`, `paseo-hub/runs`, `paseo-hub/events`. Writes:
 * `paseo-hub/op` and `paseo-hub/api`. Local lists refresh every 10 seconds while the page is visible,
 * every 2 seconds while signing in.
 */
window.__ModuleLoader__.load({
  id: 'dsh-paseo-hub',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'paseo-hub'
    const PANEL_ID = 'paseo-hub'
    const PAGE_SIZES = [10, 20, 50]

    const EN = {
      "tab_api": "Hub API",
      "apiIntro": "Manage organization triggers and manual runs directly via API, even when this Host isn\u2019t connected as a daemon. Public API keys can\u2019t manage members, connections, projects, or list all Hub runs.",
      "apiCredentials": "Organization API access",
      "apiConfigured": "Key saved",
      "apiNotConfigured": "No key saved",
      "apiCheck": "Check read access",
      "apiKeyHintLong": "Create a scoped key in Hub → API keys. Stored only in Host credentials for this Hub origin (separate from daemon credentials). Use HTTPS outside localhost.",
      "apiKeyLabel": "Organization API key",
      "apiKeyUnchanged": "Leave blank to keep the saved key for this origin",
      "apiToolWrites": "Allow agent tools to install triggers and dispatch runs",
      "apiToolHint": "Reads use paseo_hub; writes use paseo_hub_write (off by default, and still gated by the agent\u2019s tool permissions). Only you can toggle this.",
      "apiSave": "Save API access",
      "apiSaved": "API access saved locally. Use “Check read access” to verify.",
      "apiForget": "Remove saved key",
      "apiForgetTitle": "Remove API access?",
      "apiForgetText": "Removes this plugin’s organization key locally. It does not revoke the key in Hub or disconnect this Host.",
      "apiBusy": "Another API operation is in progress.",
      "apiUnavailable": "Restart DSH to load the new Hub API Host endpoint.",
      "apiSections": "Organization operations",
      "api_triggers": "Triggers",
      "api_dispatch": "Manual run",
      "api_resources": "Resources",
      "api_legacy": "Legacy configuration",
      "apiSearch": "Search trigger names or IDs",
      "apiNew": "New from template",
      "apiEdit": "View / edit YAML",
      "apiEnabled": "Enabled",
      "apiDisabled": "Disabled",
      "apiYaml": "Trigger YAML",
      "apiYamlHint": "Install creates or updates by YAML name and immediately activates the revision. Set enabled: false in YAML to disable a trigger. The target daemon must be online for validation. Validate again after editing.",
      "apiValidate": "Validate only",
      "apiValid": "Validation passed. Nothing installed.",
      "apiInstall": "Install / update",
      "apiInstallTitle": "Activate this configuration?",
      "apiInstallText": "Creates or replaces the trigger with this YAML name. It becomes active immediately and may start automatic work. Check the name, filters, target directory, and mode.",
      "apiInstalled": "Installed and activated in Hub.",
      "apiDispatch": "Dispatch run",
      "apiDispatchTitle": "Dispatch a real Hub run?",
      "apiDispatchText": "The selected trigger may execute code and perform external operations. The actor must be permitted by its filters.",
      "apiDispatched": "Dispatch accepted. The response is a receipt, not a live completion status.",
      "apiDispatchHint": "Choose a configured manual.run trigger. The actor must match its from_users allowlist. API input follows your Hub version: use text for prompt input, or JSON for older structured inputs.",
      "apiProject": "Project slug",
      "apiLoadProjects": "Load project choices",
      "apiTrigger": "Manual trigger name",
      "apiActor": "Actor",
      "apiInput": "Input / prompt",
      "apiInputJson": "Parse input as JSON",
      "apiDeliveryKey": "Delivery key",
      "apiNewDeliveryKey": "New key for a new run",
      "apiDeliveryHint": "Keep this key for retries of the same intended run. Hub provides durable deduplication, not guaranteed exactly-once execution or response replay. After a timeout check Hub first. Generate a new key only for a separate run.",
      "apiRevision": "Expected version ID (optional)",
      "apiRead_projects": "List projects",
      "apiRead_resources": "Daemons & integrations",
      "apiRead_setup-resources": "Provider filter IDs",
      "apiResourceHint": "Read-only resources from the key’s organization. Project choices show the first 100 matches; use the agent’s paged projects action for larger lists.",
      "apiLegacyHint": "Advanced: paste a complete JSON bundle with projectSlug and files: [{path, content}]. Include .paseo/hub.yml, direct workflow YAMLs and referenced partials. Local request limit: 8 MiB. This replaces the project’s complete active configuration, not one file.",
      "apiLegacyBundle": "Legacy JSON configuration bundle",
      "apiLegacyInstallText": "Replaces the entire active configuration of the project in this JSON bundle, including workflows. It does not merge files.",
      "apiResult": "API response",
      "apiViewActivity": "View local activity",
      "group_api": "Organization API",
      panel: 'Paseo Hub',
      intro: 'Run Paseo Hub automations as DSH sessions on this Host.',
      introLong: 'Hub triggers from GitHub, Slack, Discord, Linear, and Telegram start DSH sessions here with provider "dsh". Runs happen only while this Host is running.',
      refresh: 'Refresh',
      tabsLabel: 'Paseo Hub sections',
      tab_overview: 'Overview',
      tab_runs: 'Runs',
      tab_activity: 'Activity',
      tab_setup: 'Setup',
      origin: 'Hub address',
      originHint: 'The address you open Hub at, for example https://hub.example.com.',
      apiKey: 'Organization API key (optional)',
      apiKeyHint: 'Leave empty to approve the sign-in in your browser. A key needs the "Enroll daemons" scope.',
      signInTitle: 'Connect this Host',
      signIn: 'Sign in',
      signingIn: 'Waiting for approval',
      openApproval: 'Open approval page',
      code: 'Confirm this code in Hub',
      copyCode: 'Copy code',
      expires: 'Expires',
      cancel: 'Cancel',
      enrolling: 'Enrolling this Host…',
      state_not_connected: 'Not connected',
      state_signing_in: 'Signing in',
      state_connecting: 'Connecting',
      state_connected: 'Connected',
      state_reconnecting: 'Reconnecting',
      state_revoked: 'Revoked',
      connection: 'Connection',
      hub: 'Hub',
      daemon: 'Daemon',
      daemonId: 'Daemon ID',
      permissions: 'Permissions',
      since: 'Connected since',
      enrolled: 'Enrolled',
      reconnect: 'Reconnect now',
      openHub: 'Open Hub',
      disconnect: 'Disconnect',
      disconnectTitle: 'Disconnect from Hub?',
      disconnectText: 'Hub revokes this daemon and its triggers stop reaching this Host. Existing DSH sessions stay. Hub: {hub}',
      stat_total: 'Runs',
      stat_running: 'Running',
      stat_finished: 'Finished',
      stat_failed: 'Failed',
      stat_last24h: 'Last 24 hours',
      latestRuns: 'Latest runs',
      latestActivity: 'Latest activity',
      viewAll: 'View all',
      modes: 'Modes Hub can choose',
      modesHint: 'Each Hub mode is a DSH permission preset. A trigger names one with agent.mode; the run never gets a wider preset.',
      noPresets: 'No permission presets are configured, so Hub runs cannot start. Configure @deepseek-ai/dsh-permission-presets.',
      defaultMode: 'Default',
      triggerYaml: 'Trigger snippet',
      triggerHint: 'Paste into a Hub trigger. Replace the daemon name and directory.',
      settings: 'Plugin settings',
      agentPreset: 'Agent preset',
      deploymentDefault: 'Deployment default',
      listWorkspaces: 'List run directories in the sidebar',
      yes: 'Yes',
      no: 'No',
      settingsHint: 'Change these in the plugin configuration on the Plugins page.',
      search: 'Search',
      searchRuns: 'Search title, directory, model, or session ID',
      searchActivity: 'Search messages',
      status: 'Status',
      filter_all: 'All',
      status_running: 'Running',
      status_finished: 'Finished',
      status_completed: 'Turn done',
      status_failed: 'Failed',
      status_canceled: 'Canceled',
      status_idle: 'Idle',
      status_archived: 'Archived',
      noRuns: 'No Hub runs yet. They appear here when a Hub trigger fires.',
      noMatches: 'Nothing matches these filters.',
      clearFilters: 'Clear filters',
      turns: '{n} turns',
      createdAt: 'Started',
      lastActivity: 'Last activity',
      finishedAt: 'Finished',
      directory: 'Directory',
      model: 'Model',
      effort: 'Effort',
      mode: 'Mode',
      worktree: 'Worktree',
      sessionId: 'Session ID',
      lastError: 'Last error',
      hubTools: 'Hub tools',
      mounted: 'Mounted',
      notMounted: 'None',
      openSession: 'Open',
      more: 'More actions',
      details: 'Details',
      hideDetails: 'Hide details',
      copyId: 'Copy session ID',
      copyPath: 'Copy directory',
      stop: 'Stop',
      archive: 'Archive',
      restore: 'Restore',
      forget: 'Remove from list',
      forgetTitle: 'Remove this run from the list?',
      forgetText: 'The DSH session stays. Hub can no longer address this run from this Host.',
      runActivity: 'Run activity',
      level: 'Level',
      level_problems: 'Problems',
      group: 'Source',
      group_connection: 'Connection',
      group_run: 'Runs',
      group_op: 'Page actions',
      group_hub: 'Hub requests',
      noActivity: 'No activity recorded yet.',
      clearActivity: 'Clear activity',
      clearActivityTitle: 'Clear all activity?',
      clearActivityText: 'Deletes every activity entry on this Host. Runs and sessions stay.',
      clear: 'Clear',
      session: 'Session',
      range: '{from}–{to} of {total}',
      perPage: 'Per page',
      prev: 'Previous page',
      next: 'Next page',
      pageN: 'Page {n}',
      pagination: 'Pagination',
      copied: 'Copied',
      copy: 'Copy',
      done: 'Done',
      loadFailed: 'Could not load Paseo Hub',
      opFailed: 'Failed',
      retry: 'Retry',
      legacyHost: 'The Host is still running the previous version of this plugin. Restart DSH to enable the run list, activity, and run actions.',
      never: 'never',
      justNow: 'just now',
      updated: 'Updated {time}',
    }
    const ZH = {
      "tab_api": "Hub API",
      "apiIntro": "直接通过 API 管理组织里的触发器和手动运行，不依赖本机 daemon 是否在线（公开 API key 无法管理成员、连接、项目，也不能列出全部 Hub 运行）。",
      "apiCredentials": "组织 API 访问",
      "apiConfigured": "已保存 Key",
      "apiNotConfigured": "未配置 Key",
      "apiCheck": "检查读取权限",
      "apiKeyHintLong": "去 Hub → API keys 创建一个带对应权限的 Key。只会存在这台 Host 的凭据里并绑定当前 Hub 地址，不和 daemon 混用。非本机地址请走 HTTPS。",
      "apiKeyLabel": "组织 API key",
      "apiKeyUnchanged": "留空则保留当前已保存的 Key",
      "apiToolWrites": "允许 Agent 工具安装配置和触发真实运行",
      "apiToolHint": "查询和校验走 paseo_hub；写入走 paseo_hub_write（默认关闭，且受当前 Agent 工具权限限制），只有你能开这个开关。",
      "apiSave": "保存 API 访问",
      "apiSaved": "已在本地保存。点击“检查读取权限”验证连接。",
      "apiForget": "移除已保存的 Key",
      "apiForgetTitle": "移除 API 访问？",
      "apiForgetText": "仅删除插件本地保存的组织 Key，不在 Hub 撤销 Key，也不会断开本机 daemon。",
      "apiBusy": "另一个 API 操作正在进行。",
      "apiUnavailable": "请重启 DSH，加载新增的 Hub API Host 接口。",
      "apiSections": "组织操作",
      "api_triggers": "触发器",
      "api_dispatch": "手动运行",
      "api_resources": "资源",
      "api_legacy": "旧版配置",
      "apiSearch": "搜索触发器名称或 ID",
      "apiNew": "从模板新建",
      "apiEdit": "查看 / 编辑 YAML",
      "apiEnabled": "已启用",
      "apiDisabled": "已停用",
      "apiYaml": "触发器 YAML",
      "apiYamlHint": "安装按 YAML name 创建或更新，并立即激活版本。设 enabled: false 可停用触发器。校验要求目标 daemon 在线。编辑后需重新校验。",
      "apiValidate": "仅校验",
      "apiValid": "校验通过，尚未安装。",
      "apiInstall": "安装 / 更新",
      "apiInstallTitle": "激活这份配置？",
      "apiInstallText": "按 YAML name 新建或覆盖触发器，立即生效，可能启动自动化任务。请核对名称、筛选条件、目标目录及 mode。",
      "apiInstalled": "已在 Hub 安装并激活。",
      "apiDispatch": "触发运行",
      "apiDispatchTitle": "触发真实 Hub 运行？",
      "apiDispatchText": "选定的触发器可能执行代码和对外操作。actor 必须符合触发器筛选条件。",
      "apiDispatched": "已接受触发请求。返回的是回执，不是实时完成状态。",
      "apiDispatchHint": "选择已配置的 manual.run 触发器，actor 必须符合 from_users 白名单。input 根据 Hub 版本可使用提示词文本，旧版结构化输入可切换为 JSON。",
      "apiProject": "项目 slug",
      "apiLoadProjects": "加载项目选项",
      "apiTrigger": "手动触发器名称",
      "apiActor": "Actor",
      "apiInput": "输入 / 提示词",
      "apiInputJson": "将输入解析为 JSON",
      "apiDeliveryKey": "Delivery key",
      "apiNewDeliveryKey": "为新运行生成 Key",
      "apiDeliveryHint": "重试同一次任务请保留此 Key。Hub 持久去重，但不保证恰好执行一次或重放旧响应。超时后先到 Hub 核对；只有新任务才生成新 Key。",
      "apiRevision": "预期版本 ID（可选）",
      "apiRead_projects": "查询项目",
      "apiRead_resources": "Daemon 与集成",
      "apiRead_setup-resources": "平台筛选 ID",
      "apiResourceHint": "只读查询 Key 所属组织的资源。项目选项展示前 100 条，更多项目可用 agent 工具分页查询。",
      "apiLegacyHint": "高级功能：粘贴含 projectSlug、files: [{path, content}] 的完整 JSON bundle。包含 .paseo/hub.yml、直接工作流 YAML 及引用的 partial。单次本地请求上限 8 MiB。安装会替换项目整份活动配置，不是修改单个文件。",
      "apiLegacyBundle": "旧版配置 JSON bundle",
      "apiLegacyInstallText": "替换 JSON 中目标项目的整份活动配置及工作流，不会合并文件。",
      "apiResult": "API 响应",
      "apiViewActivity": "查看本地活动",
      "group_api": "组织 API",
      panel: 'Paseo Hub',
      intro: '在这台 Host 上把 Paseo Hub 自动化作为 DSH 会话运行。',
      introLong: 'Hub 来自 GitHub、Slack、Discord、Linear 和 Telegram 的触发会在这里启动 DSH 会话，provider 为 "dsh"。只在 Host 运行期间工作。',
      refresh: '刷新',
      tabsLabel: 'Paseo Hub 分区',
      tab_overview: '概览',
      tab_runs: '运行',
      tab_activity: '活动',
      tab_setup: '设置',
      origin: 'Hub 地址',
      originHint: '你打开 Hub 用的地址，例如 https://hub.example.com。',
      apiKey: '组织 API key（可选）',
      apiKeyHint: '留空则在浏览器里批准登录。使用 key 时需要 “Enroll daemons” 权限。',
      signInTitle: '连接这台 Host',
      signIn: '登录',
      signingIn: '等待批准',
      openApproval: '打开批准页面',
      code: '在 Hub 中核对此代码',
      copyCode: '复制代码',
      expires: '过期时间',
      cancel: '取消',
      enrolling: '正在注册这台 Host…',
      state_not_connected: '未连接',
      state_signing_in: '登录中',
      state_connecting: '连接中',
      state_connected: '已连接',
      state_reconnecting: '重连中',
      state_revoked: '已撤销',
      connection: '连接',
      hub: 'Hub',
      daemon: 'Daemon',
      daemonId: 'Daemon ID',
      permissions: '权限',
      since: '连接时间',
      enrolled: '注册时间',
      reconnect: '立即重连',
      openHub: '打开 Hub',
      disconnect: '断开',
      disconnectTitle: '断开与 Hub 的连接？',
      disconnectText: 'Hub 会撤销这个 daemon，它的触发不再到达这台 Host。已有的 DSH 会话保留。Hub：{hub}',
      stat_total: '运行',
      stat_running: '运行中',
      stat_finished: '已完成',
      stat_failed: '失败',
      stat_last24h: '近 24 小时',
      latestRuns: '最近运行',
      latestActivity: '最近活动',
      viewAll: '查看全部',
      modes: 'Hub 可选的 mode',
      modesHint: '每个 Hub mode 对应一个 DSH 权限预设。触发器用 agent.mode 指定，运行不会拿到更宽的预设。',
      noPresets: '没有配置权限预设，Hub 运行无法启动。请配置 @deepseek-ai/dsh-permission-presets。',
      defaultMode: '默认',
      triggerYaml: '触发器片段',
      triggerHint: '粘贴到 Hub 触发器里，替换 daemon 名称和目录。',
      settings: '插件设置',
      agentPreset: 'Agent 预设',
      deploymentDefault: '部署默认',
      listWorkspaces: '在侧栏列出运行目录',
      yes: '是',
      no: '否',
      settingsHint: '在插件页的插件配置里修改。',
      search: '搜索',
      searchRuns: '搜索标题、目录、模型或会话 ID',
      searchActivity: '搜索消息',
      status: '状态',
      filter_all: '全部',
      status_running: '运行中',
      status_finished: '已完成',
      status_completed: '本轮结束',
      status_failed: '失败',
      status_canceled: '已取消',
      status_idle: '空闲',
      status_archived: '已归档',
      noRuns: '还没有 Hub 运行。Hub 触发后会显示在这里。',
      noMatches: '没有符合筛选条件的结果。',
      clearFilters: '清除筛选',
      turns: '{n} 轮',
      createdAt: '开始',
      lastActivity: '最后活动',
      finishedAt: '完成',
      directory: '目录',
      model: '模型',
      effort: '推理强度',
      mode: 'Mode',
      worktree: 'Worktree',
      sessionId: '会话 ID',
      lastError: '最近错误',
      hubTools: 'Hub 工具',
      mounted: '已挂载',
      notMounted: '无',
      openSession: '打开',
      more: '更多操作',
      details: '详情',
      hideDetails: '收起详情',
      copyId: '复制会话 ID',
      copyPath: '复制目录',
      stop: '停止',
      archive: '归档',
      restore: '恢复',
      forget: '从列表移除',
      forgetTitle: '从列表移除这次运行？',
      forgetText: 'DSH 会话保留。Hub 之后无法再通过这台 Host 访问这次运行。',
      runActivity: '运行活动',
      level: '级别',
      level_problems: '问题',
      group: '来源',
      group_connection: '连接',
      group_run: '运行',
      group_op: '页面操作',
      group_hub: 'Hub 请求',
      noActivity: '还没有活动记录。',
      clearActivity: '清空活动',
      clearActivityTitle: '清空全部活动？',
      clearActivityText: '删除这台 Host 上的全部活动记录。运行和会话保留。',
      clear: '清空',
      session: '会话',
      range: '第 {from}–{to} 条，共 {total} 条',
      perPage: '每页',
      prev: '上一页',
      next: '下一页',
      pageN: '第 {n} 页',
      pagination: '分页',
      copied: '已复制',
      copy: '复制',
      done: '已完成',
      loadFailed: '无法加载 Paseo Hub',
      opFailed: '失败',
      retry: '重试',
      legacyHost: 'Host 仍在运行这个插件的旧版本。重启 DSH 后启用运行列表、活动记录和运行操作。',
      never: '从未',
      justNow: '刚刚',
      updated: '{time}更新',
    }

    // Geometry and type follow the Plugin Manager page; controls copy the host
    // Button, Tag, SegmentedTabs, Input and Modal primitives under the ph- prefix.
    const CSS = `
.ph-page{--ph-inset:clamp(24px,4vw,48px);--ph-hover:var(--dsw-alias-interactive-bg-hover);--ph-line:var(--dsw-alias-border-l2);--ph-tertiary:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));--ph-focus:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));--ph-mono:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);height:100%;overflow-x:hidden;overflow-y:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
@media (max-width:767px){.ph-page{--ph-inset:20px}}
.ph-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--ph-focus);outline-offset:-2px}
.ph-inner{max-width:960px;margin:0 auto;padding:28px var(--ph-inset) 48px;display:flex;flex-direction:column;gap:24px}
[data-platform=darwin] .ph-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.ph-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:12px 16px}
.ph-heading{min-width:0;flex:1 1 320px}
.ph-titlerow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ph-h1{margin:0;font-size:20px;line-height:28px;font-weight:500}
.ph-intro{margin:4px 0 0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.ph-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ph-updated{font-size:12px;line-height:18px;color:var(--ph-tertiary);white-space:nowrap}
.ph-tabs{--ph-tabs-inset:2px;position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:minmax(72px,auto);width:fit-content;max-width:100%;padding:var(--ph-tabs-inset);border-radius:calc(var(--dsw-radius-md,8px) + var(--ph-tabs-inset));background:var(--dsw-alias-bg-module-platform)}
.ph-tab{position:relative;height:30px;padding:0 14px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:14px;line-height:20px;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.ph-tab:hover{color:var(--dsw-alias-label-primary)}
.ph-tab[aria-selected=true]{background:var(--dsw-alias-bg-layer-3);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);font-weight:500}
.ph-tabcount{font-size:12px;color:var(--ph-tertiary);font-weight:400}
.ph-section{display:flex;flex-direction:column;gap:12px;min-width:0}
.ph-sechead{display:flex;align-items:center;gap:10px;min-height:28px}
.ph-sectitle{margin:0;font-size:14px;line-height:20px;font-weight:500}
.ph-seccount{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ph-sechead>.ph-spacer{flex:1}
.ph-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.ph-warn{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-state-warn-primary);overflow-wrap:anywhere}
.ph-error{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}
.ph-banner{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 14px;border:.5px solid var(--ph-line);border-radius:var(--dsw-radius-md,8px);font-size:13px;line-height:20px}
.ph-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.ph-banner[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}
.ph-banner>p{flex:1;margin:0;min-width:0;overflow-wrap:anywhere}
.ph-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 10px;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;box-shadow:inset 0 0 0 var(--dsh-hairline-width,.5px) var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;white-space:nowrap;cursor:pointer;text-decoration:none}
.ph-btn:hover:not(:disabled){background:var(--ph-hover)}
.ph-btn:disabled{cursor:not-allowed;opacity:.4}
.ph-btn[data-variant=primary]{box-shadow:none;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base))}
.ph-btn[data-variant=primary]:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-button-primary-fill))}
.ph-btn[data-variant=ghost]{box-shadow:none;color:var(--dsw-alias-label-secondary)}
.ph-btn[data-variant=ghost]:hover:not(:disabled){color:var(--dsw-alias-label-primary)}
.ph-btn[data-variant=danger]{color:var(--dsw-alias-state-error-primary)}
.ph-btn[data-size=md]{height:32px;padding:0 14px;font-size:13px;border-radius:var(--dsw-radius-md,8px)}
.ph-icon{width:28px;padding:0;box-shadow:none;color:var(--ph-tertiary)}
.ph-icon:hover:not(:disabled){color:var(--dsw-alias-label-primary)}
.ph-icon[aria-expanded=true]{background:var(--ph-hover);color:var(--dsw-alias-label-primary)}
.ph-tag{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px;font-weight:500;white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}
.ph-tag[data-tone=outline]{background:transparent;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--ph-line));color:var(--ph-tertiary)}
.ph-tag[data-tone=success]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 10%,transparent);color:var(--dsw-alias-state-success-primary)}
.ph-tag[data-tone=info]{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent);color:var(--dsw-alias-state-business-primary)}
.ph-tag[data-tone=warning]{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);color:var(--dsw-alias-state-warn-primary)}
.ph-tag[data-tone=danger]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,transparent);color:var(--dsw-alias-state-error-primary)}
.ph-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.ph-tag[data-pulse] .ph-dot{animation:ph-pulse 1.4s ease-in-out infinite}
@keyframes ph-pulse{50%{opacity:.3}}
.ph-facts{margin:0}
.ph-facts>div{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px;padding:8px 2px;box-sizing:border-box;border-bottom:.5px solid var(--ph-line)}
.ph-facts>div:last-child{border-bottom:0}
.ph-facts dt{flex:none;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.ph-facts dd{display:flex;align-items:center;justify-content:flex-end;gap:4px;min-width:0;margin:0;font-size:13px;line-height:20px;text-align:end;overflow-wrap:anywhere}
.ph-code{padding:2px 6px;border-radius:4px;background:var(--dsw-alias-bg-module-platform);font-family:var(--ph-mono);font-size:12px;box-decoration-break:clone}
.ph-link{color:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));text-decoration:none}
.ph-link:hover{text-decoration:underline;text-underline-offset:3px}
.ph-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ph-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px}
.ph-stat{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border:.5px solid var(--ph-line);border-radius:var(--dsw-radius-lg,12px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ph-stat:hover{background:var(--ph-hover)}
.ph-stat b{font-size:20px;line-height:28px;font-weight:500;font-variant-numeric:tabular-nums}
.ph-stat span{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ph-stat[data-tone=danger] b{color:var(--dsw-alias-state-error-primary)}
.ph-stat[data-tone=info] b{color:var(--dsw-alias-state-business-primary)}
.ph-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ph-search{display:flex;align-items:center;flex:1 1 240px;min-width:0;height:32px;padding-right:4px;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4,var(--ph-line));border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base));color:var(--ph-tertiary)}
.ph-search:focus-within{border-color:var(--ph-focus)}
.ph-search>svg{flex:none;margin:0 6px 0 10px}
.ph-search input{flex:1;min-width:0;height:100%;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.ph-search input::placeholder{color:var(--dsw-alias-label-dimmed,var(--ph-tertiary))}
.ph-search input::-webkit-search-cancel-button{display:none}
.ph-kbd{flex:none;min-width:16px;margin-right:4px;padding:0 4px;border:.5px solid var(--ph-line);border-radius:4px;font-size:11px;line-height:16px;text-align:center;color:var(--ph-tertiary)}
.ph-select{box-sizing:border-box;height:32px;padding:0 28px 0 10px;border:.5px solid var(--dsw-alias-border-l4,var(--ph-line));border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.ph-select[data-size=sm]{height:28px;font-size:12px;padding:0 24px 0 8px}
.ph-chips{display:flex;gap:4px;flex-wrap:wrap}
.ph-chip{height:28px;padding:0 10px;border:0;border-radius:999px;background:transparent;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.ph-chip:hover{color:var(--dsw-alias-label-primary);background:var(--ph-hover)}
.ph-chip[aria-pressed=true]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);box-shadow:none}
.ph-chip b{font-weight:400;opacity:.7;margin-left:4px;font-variant-numeric:tabular-nums}
.ph-rows{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ph-row{padding:10px 2px;border-bottom:.5px solid var(--ph-line)}
.ph-row:last-child{border-bottom:0}
.ph-rowline{display:flex;align-items:center;gap:12px;min-width:0}
.ph-rowmain{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.ph-rowtitle{display:flex;align-items:center;gap:8px;min-width:0;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ph-rowtitle>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13.5px;line-height:20px;font-weight:500}
.ph-rowtitle:hover>span{text-decoration:underline;text-underline-offset:3px}
.ph-rowmeta{display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;line-height:18px;color:var(--ph-tertiary);white-space:nowrap;overflow:hidden}
.ph-rowmeta>span{overflow:hidden;text-overflow:ellipsis}
.ph-rowmeta>span:last-child{flex:1;min-width:0}
.ph-sep{flex:none}
.ph-rowend{display:flex;align-items:center;gap:4px;flex:none}
.ph-rowerror{margin:4px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}
.ph-detail{margin:10px 0 2px;padding:4px 14px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-module-platform)}
.ph-detail .ph-facts>div{min-height:36px;padding:6px 0}
.ph-detail .ph-code{background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base))}
.ph-menuwrap{position:relative}
.ph-menu{position:absolute;right:0;top:calc(100% + 4px);z-index:20;min-width:184px;padding:4px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.18)),inset 0 0 0 .5px var(--dsw-alias-border-l3)}
.ph-menuitem{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 10px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;text-align:left;cursor:pointer;white-space:nowrap}
.ph-menuitem:hover:not(:disabled),.ph-menuitem:focus-visible{background:var(--ph-hover);outline:none}
.ph-menuitem:disabled{opacity:.4;cursor:default}
.ph-menuitem[data-danger]{color:var(--dsw-alias-state-error-primary)}
.ph-menusep{height:.5px;margin:4px 6px;background:var(--ph-line)}
.ph-event{display:flex;align-items:flex-start;gap:10px;padding:10px 2px;border-bottom:.5px solid var(--ph-line)}
.ph-event:last-child{border-bottom:0}
.ph-event-dot{flex:none;width:6px;height:6px;margin-top:7px;border-radius:50%;background:var(--ph-tertiary)}
.ph-event[data-level=warn] .ph-event-dot{background:var(--dsw-alias-state-warn-primary)}
.ph-event[data-level=error] .ph-event-dot{background:var(--dsw-alias-state-error-primary)}
.ph-event-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ph-event-msg{margin:0;font-size:13px;line-height:20px;overflow-wrap:anywhere}
.ph-event[data-level=error] .ph-event-msg{color:var(--dsw-alias-state-error-primary)}
.ph-event-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;line-height:18px;color:var(--ph-tertiary)}
.ph-event-time{flex:none;font-size:12px;line-height:20px;color:var(--ph-tertiary);white-space:nowrap;font-variant-numeric:tabular-nums}
.ph-textlink{padding:0;border:0;background:none;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;font-family:var(--ph-mono)}
.ph-textlink:hover{color:var(--dsw-alias-label-primary);text-decoration:underline;text-underline-offset:3px}
.ph-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:48px 24px;border:.5px dashed var(--ph-line);border-radius:var(--dsw-radius-lg,12px);text-align:center;font-size:13px;line-height:20px;color:var(--ph-tertiary)}
.ph-pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ph-pager-side{display:flex;align-items:center;gap:6px}
.ph-pages{display:flex;align-items:center;gap:2px}
.ph-page-btn{min-width:28px;height:28px;padding:0 6px;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.ph-page-btn:hover:not(:disabled){background:var(--ph-hover);color:var(--dsw-alias-label-primary)}
.ph-page-btn:disabled{opacity:.35;cursor:default}
.ph-page-btn[aria-current=page]{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font-weight:500}
.ph-gap{min-width:20px;text-align:center;color:var(--ph-tertiary)}
.ph-form{display:flex;flex-direction:column;gap:16px;max-width:560px}
.ph-field{display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:20px}
.ph-input{box-sizing:border-box;height:34px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l4,var(--ph-line));border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.ph-input:focus-visible{outline:none;border-color:var(--ph-focus)}
.ph-usercode{margin:0;font-family:var(--ph-mono);font-size:28px;line-height:36px;letter-spacing:4px;font-weight:500}
.ph-pre{position:relative;margin:0;padding:12px 14px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-module-platform);font-family:var(--ph-mono);font-size:12px;line-height:18px;white-space:pre;overflow-x:auto}
.ph-pre-wrap{position:relative}
.ph-pre-wrap>.ph-btn{position:absolute;top:6px;right:6px;background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-base))}
.ph-modes{display:flex;flex-direction:column}
.ph-mode{display:flex;align-items:center;gap:12px;min-height:44px;padding:8px 2px;box-sizing:border-box;border-bottom:.5px solid var(--ph-line)}
.ph-mode:last-child{border-bottom:0}
.ph-mode-main{flex:1;min-width:0;display:flex;flex-direction:column}
.ph-mode-main b{font-size:13px;line-height:20px;font-weight:500}
.ph-mode-main span{font-size:12px;line-height:18px;color:var(--ph-tertiary)}
.ph-dialog{box-sizing:border-box;width:min(400px,calc(100vw - 32px));padding:0;border:0;border-radius:var(--dsw-radius-panel,16px);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent,0 12px 40px rgba(0,0,0,.24))}
.ph-dialog::backdrop{background:rgba(0,0,0,.32)}
.ph-dialog h2{margin:0;padding:22px 24px 0;font-size:16px;line-height:24px;font-weight:500}
.ph-dialog p{margin:12px 24px 0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.ph-dialog footer{display:flex;justify-content:flex-end;gap:8px;padding:20px 24px 24px}
.ph-btn[data-variant=destructive]{box-shadow:none;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground,#fff)}
.ph-api-credentials>summary{cursor:pointer;font-size:13px;line-height:22px;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.ph-api-credentials[open]>summary{margin-bottom:16px}
.ph-check{display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary)}
.ph-check input{margin-top:3px;accent-color:var(--dsw-alias-label-link)}
.ph-editor{min-height:320px;width:100%;resize:vertical;font-family:var(--dsw-font-family-mono,monospace);font-size:12px;line-height:1.6;padding:12px;tab-size:2;white-space:pre}
.ph-editor-short{min-height:120px;white-space:pre-wrap}
.ph-json{max-height:440px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}
.ph-api-error{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;flex:1}
.ph-api-name{display:block;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.ph-toast{position:sticky;bottom:16px;align-self:center;z-index:30;padding:6px 14px;border-radius:999px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);font-size:12px;line-height:18px;box-shadow:var(--dsw-elevation-soft,0 2px 8px rgba(0,0,0,.16));pointer-events:none}
.ph-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:640px){.ph-rowmeta>span:not(:first-child),.ph-rowmeta>.ph-sep{display:none}.ph-kbd{display:none}}
@media (pointer:coarse){.ph-input,.ph-search input,.ph-select{font-size:16px}}
@media (prefers-reduced-motion:reduce){.ph-tag[data-pulse] .ph-dot{animation:none}}
`

    const STATE_TONE = { connected: 'success', connecting: 'warning', reconnecting: 'warning', signing_in: 'warning', revoked: 'danger', not_connected: 'outline' }
    const STATUS_TONE = { running: 'info', finished: 'success', completed: 'success', failed: 'danger', canceled: 'warning', idle: 'neutral', archived: 'outline' }
    const RUN_FILTERS = ['all', 'running', 'finished', 'completed', 'failed', 'canceled', 'idle', 'archived']
    const GROUPS = ['all', 'connection', 'run', 'op', 'hub', 'api']

    async function request(path, init) {
      const res = await fetch(path, { ...init, headers: { accept: 'application/json', ...init?.body ? { 'content-type': 'application/json' } : {} } })
      let body = null
      try { body = await res.json() } catch {}
      if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`)
      return body
    }

    const qs = params => Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== 'all').map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')

    const svg = (size, ...children) => h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, ...children)
    const Icon = {
      refresh: ({ size = 14 }) => svg(size, h('path', { d: 'M13 3.5V6h-2.5M3 12.5V10h2.5M12.6 6A5 5 0 0 0 3.6 5M3.4 10a5 5 0 0 0 9 1' })),
      search: ({ size = 14 }) => svg(size, h('circle', { cx: 7, cy: 7, r: 4.5 }), h('path', { d: 'M10.5 10.5 14 14' })),
      close: ({ size = 12 }) => svg(size, h('path', { d: 'M4 4l8 8M12 4l-8 8' })),
      more: ({ size = 14 }) => svg(size, h('circle', { cx: 3.5, cy: 8, r: .6, fill: 'currentColor' }), h('circle', { cx: 8, cy: 8, r: .6, fill: 'currentColor' }), h('circle', { cx: 12.5, cy: 8, r: .6, fill: 'currentColor' })),
      left: ({ size = 14 }) => svg(size, h('path', { d: 'M10 3.5 5.5 8l4.5 4.5' })),
      right: ({ size = 14 }) => svg(size, h('path', { d: 'M6 3.5 10.5 8 6 12.5' })),
      chevron: ({ size = 14, open }) => svg(size, h('path', { d: open ? 'M3.5 6 8 10.5 12.5 6' : 'M6 3.5 10.5 8 6 12.5' })),
      external: ({ size = 12 }) => svg(size, h('path', { d: 'M9.5 2.5h4v4M13.5 2.5 8 8M11.5 9.5v4h-9v-9h4' })),
      copy: ({ size = 13 }) => svg(size, h('rect', { x: 5.5, y: 5.5, width: 8, height: 8, rx: 1.5 }), h('path', { d: 'M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2' })),
      hub: ({ size = 16 }) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true },
        h('circle', { cx: 6.5, cy: 6.5, r: 2.5 }), h('circle', { cx: 17.5, cy: 6.5, r: 2.5 }), h('circle', { cx: 12, cy: 17, r: 3 }), h('path', { d: 'M8 8.5l2.6 5.6M16 8.5l-2.6 5.6' })),
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'paseo-hub: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'paseo-hub: zh')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), t(key))
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const lang = () => (ctx.locale.getSnapshot()?.active === 'zh' ? 'zh-CN' : ctx.locale.getSnapshot()?.active) || undefined
        const fmt = iso => iso ? new Date(iso).toLocaleString(lang()) : t('never')
        const ago = iso => {
          if (!iso) return t('never')
          const seconds = Math.round((Date.parse(iso) - Date.now()) / 1000)
          if (Math.abs(seconds) < 45) return t('justNow')
          const rtf = new Intl.RelativeTimeFormat(lang(), { numeric: 'auto', style: 'short' })
          for (const [unit, size] of [['day', 86400], ['hour', 3600], ['minute', 60]]) {
            if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
          }
          return rtf.format(seconds, 'second')
        }
        const openSession = id => ctx.get('uiWorkspace')?.openSession(id)
        const canOpen = () => ctx.get('uiWorkspace') != null

        // ---- shared state ----

        const Ctx = React.createContext(null)
        const useApp = () => React.useContext(Ctx)

        function usePoll(load, deps, fast) {
          React.useEffect(() => {
            const controller = new AbortController()
            let timer
            const poll = async () => {
              if (document.visibilityState === 'visible' || !timer) await load(controller.signal)
              if (!controller.signal.aborted) timer = setTimeout(poll, fast ? 2_000 : 10_000)
            }
            void poll()
            return () => { clearTimeout(timer); controller.abort() }
          }, [...deps, fast])
        }

        function useResource(path, params, fast = false) {
          const [state, setState] = React.useState({ data: null, error: null, loading: true })
          const { n, ...selection } = params
          const identity = `${path}?${qs(selection)}`
          const key = `${identity}&n=${encodeURIComponent(n ?? 0)}`
          const load = React.useCallback(async signal => {
            try {
              const data = await request(key, { signal })
              if (!signal?.aborted) setState({ identity, data, error: null, loading: false, at: new Date().toISOString() })
            } catch (error) {
              if (!signal?.aborted && error?.name !== 'AbortError') setState(prev => ({ ...(prev.identity === identity ? prev : { identity, data: null }), error: String(error?.message ?? error), loading: false }))
            }
          }, [key])
          usePoll(load, [load], fast)
          return state.identity === identity ? state : { data: null, loading: true, error: null }
        }

        // ---- primitives ----

        function Btn({ variant, size, icon, label, children, ...rest }) {
          return h('button', { type: 'button', className: `ph-btn${icon && !label && !children ? ' ph-icon' : ''}`, 'data-variant': variant, 'data-size': size, ...rest }, icon ? h(icon) : null, label ?? children)
        }

        function Tag({ tone, pulse, children, title }) {
          return h('span', { className: 'ph-tag', 'data-tone': tone, 'data-pulse': pulse ? '' : undefined, title }, h('span', { className: 'ph-dot', 'aria-hidden': true }), children)
        }

        function Confirm({ title, text, confirmLabel, destructive, onConfirm, onClose }) {
          const ref = React.useRef(null)
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState(null)
          React.useEffect(() => {
            const dialog = ref.current
            const previous = document.activeElement
            dialog.showModal()
            return () => { dialog.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true }) }
          }, [])
          const run = async () => {
            setBusy(true)
            setError(null)
            const message = await onConfirm()
            if (message) { setBusy(false); setError(message); return }
            onClose()
          }
          return h('dialog', {
            ref, className: 'ph-dialog', 'aria-labelledby': 'ph-dialog-title',
            onCancel: e => { e.preventDefault(); if (!busy) onClose() },
            onClick: e => { if (e.target === ref.current && !busy) onClose() },
            onKeyDown: e => e.stopPropagation(),
          },
            h('h2', { id: 'ph-dialog-title' }, title),
            h('p', null, text),
            error ? h('p', { className: 'ph-error', role: 'alert' }, `${t('opFailed')}: ${error}`) : null,
            h('footer', null,
              h(Btn, { size: 'md', onClick: onClose, disabled: busy, autoFocus: destructive }, t('cancel')),
              h(Btn, { size: 'md', variant: destructive ? 'destructive' : 'primary', onClick: run, disabled: busy, 'aria-busy': busy, autoFocus: !destructive }, confirmLabel)))
        }

        function Menu({ items }) {
          const [open, setOpen] = React.useState(false)
          const ref = React.useRef(null)
          React.useEffect(() => {
            if (!open) return
            const away = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
            const key = e => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus() } }
            document.addEventListener('pointerdown', away)
            document.addEventListener('keydown', key)
            ref.current?.querySelector('[role=menuitem]:not(:disabled)')?.focus()
            return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', key) }
          }, [open])
          const onKey = e => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
            e.preventDefault()
            const list = [...ref.current.querySelectorAll('[role=menuitem]:not(:disabled)')]
            const at = list.indexOf(document.activeElement)
            list[(at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus()
          }
          return h('div', { className: 'ph-menuwrap', ref },
            h(Btn, { icon: Icon.more, 'aria-label': t('more'), title: t('more'), 'aria-haspopup': 'menu', 'aria-expanded': open, onClick: () => setOpen(v => !v) }),
            open ? h('div', { className: 'ph-menu', role: 'menu', onKeyDown: onKey },
              items.filter(Boolean).map((item, i) => item === '-'
                ? h('div', { key: `sep-${i}`, className: 'ph-menusep', role: 'separator' })
                : h('button', { key: item.label, type: 'button', role: 'menuitem', className: 'ph-menuitem', 'data-danger': item.danger ? '' : undefined, disabled: item.disabled, onClick: () => { setOpen(false); item.onSelect() } }, item.label))) : null)
        }

        function Pager({ data, onPage, onSize }) {
          if (!data || data.total === 0) return null
          const { page, pages, pageSize, total } = data
          const from = (page - 1) * pageSize + 1
          const to = Math.min(total, page * pageSize)
          const list = []
          const push = n => list.push(n)
          for (let n = 1; n <= pages; n++) {
            if (n === 1 || n === pages || Math.abs(n - page) <= 1) push(n)
            else if (list[list.length - 1] !== '…') push('…')
          }
          return h('nav', { className: 'ph-pager', 'aria-label': t('pagination') },
            h('div', { className: 'ph-pager-side' },
              h('span', { 'aria-live': 'polite' }, tf('range', { from, to, total })),
              h('label', { className: 'ph-pager-side' }, h('span', null, t('perPage')),
                h('select', { className: 'ph-select', 'data-size': 'sm', value: pageSize, onChange: e => onSize(Number(e.target.value)) },
                  PAGE_SIZES.map(n => h('option', { key: n, value: n }, n))))),
            pages > 1 ? h('div', { className: 'ph-pages' },
              h('button', { type: 'button', className: 'ph-page-btn', disabled: page <= 1, onClick: () => onPage(page - 1), 'aria-label': t('prev'), title: t('prev') }, h(Icon.left)),
              list.map((n, i) => n === '…'
                ? h('span', { key: `gap-${i}`, className: 'ph-gap', 'aria-hidden': true }, '…')
                : h('button', { key: n, type: 'button', className: 'ph-page-btn', 'aria-current': n === page ? 'page' : undefined, 'aria-label': tf('pageN', { n }), onClick: () => onPage(n) }, n)),
              h('button', { type: 'button', className: 'ph-page-btn', disabled: page >= pages, onClick: () => onPage(page + 1), 'aria-label': t('next'), title: t('next') }, h(Icon.right))) : null)
        }

        function SearchBox({ value, onChange, placeholder, inputRef }) {
          return h('label', { className: 'ph-search' },
            h(Icon.search),
            h('span', { className: 'ph-sr' }, t('search')),
            h('input', { ref: inputRef, type: 'search', value, placeholder, onChange: e => onChange(e.target.value), onKeyDown: e => { if (e.key === 'Escape' && value) { e.stopPropagation(); onChange('') } } }),
            value
              ? h('button', { type: 'button', className: 'ph-page-btn', 'aria-label': t('clearFilters'), onClick: () => onChange('') }, h(Icon.close))
              : h('kbd', { className: 'ph-kbd', 'aria-hidden': true }, '/'))
        }

        /** `/` focuses the list's search box unless the user is typing elsewhere. */
        function useSlashFocus(ref) {
          React.useEffect(() => {
            const onKey = e => {
              if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
              const el = document.activeElement
              if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
              if (!ref.current?.isConnected) return
              e.preventDefault()
              ref.current.focus()
            }
            document.addEventListener('keydown', onKey)
            return () => document.removeEventListener('keydown', onKey)
          }, [ref])
        }

        /** Debounced copy of a search value, so typing does not refetch per keystroke. */
        function useDebounced(value, ms = 250) {
          const [out, setOut] = React.useState(value)
          React.useEffect(() => { const id = setTimeout(() => setOut(value), ms); return () => clearTimeout(id) }, [value, ms])
          return out
        }

        // ---- overview ----

        function ConnectionSection({ data }) {
          const { op, confirm, copy } = useApp()
          const tone = STATE_TONE[data.state]
          return h('section', { className: 'ph-section', 'aria-labelledby': 'ph-conn' },
            h('div', { className: 'ph-sechead' },
              h('h2', { className: 'ph-sectitle', id: 'ph-conn' }, t('connection')),
              h('span', { className: 'ph-spacer' }),
              h('div', { className: 'ph-actions' },
                h('a', { className: 'ph-btn', href: data.hubOrigin, target: '_blank', rel: 'noreferrer' }, t('openHub'), h(Icon.external)),
                data.state === 'connected' ? null : h(Btn, { onClick: () => op({ action: 'reconnect' }) }, t('reconnect')),
                h(Btn, {
                  variant: 'danger',
                  onClick: () => confirm({
                    title: t('disconnectTitle'), text: tf('disconnectText', { hub: data.hubOrigin }), confirmLabel: t('disconnect'), destructive: true,
                    onConfirm: () => op({ action: 'disconnect' }),
                  }),
                }, t('disconnect')))),
            data.lastError ? h('div', { className: 'ph-banner', 'data-tone': data.state === 'revoked' ? 'error' : 'warn', role: 'status' }, h('p', null, data.lastError)) : null,
            h('dl', { className: 'ph-facts' },
              h('div', null, h('dt', null, t('status')), h('dd', null, h(Tag, { tone, pulse: tone === 'warning' }, t(`state_${data.state}`)))),
              h('div', null, h('dt', null, t('hub')), h('dd', null, h('a', { className: 'ph-link', href: data.hubOrigin, target: '_blank', rel: 'noreferrer' }, data.hubOrigin))),
              h('div', null, h('dt', null, t('daemon')), h('dd', null, data.slug ?? '—')),
              h('div', null, h('dt', null, t('daemonId')), h('dd', null, h('code', { className: 'ph-code' }, data.daemonId),
                h(Btn, { icon: Icon.copy, 'aria-label': t('copy'), title: t('copy'), onClick: () => copy(data.daemonId) }))),
              h('div', null, h('dt', null, t('permissions')), h('dd', null, (data.permissions ?? []).map(p => h('code', { key: p, className: 'ph-code' }, p)))),
              h('div', null, h('dt', null, t('since')), h('dd', { title: fmt(data.connectedAt) }, data.state === 'connected' ? ago(data.connectedAt) : '—')),
              h('div', null, h('dt', null, t('enrolled')), h('dd', { title: fmt(data.enrolledAt) }, fmt(data.enrolledAt)))))
        }

        function Stats({ stats, onPick }) {
          const items = [
            ['total', 'all', stats.total],
            ['running', 'running', stats.running, 'info'],
            ['finished', 'finished', stats.finished + stats.completed],
            ['failed', 'failed', stats.failed, stats.failed > 0 ? 'danger' : undefined],
            ['last24h', 'all', stats.last24h],
          ]
          return h('div', { className: 'ph-stats' }, items.map(([key, filter, value, tone]) =>
            h('button', { key, type: 'button', className: 'ph-stat', 'data-tone': tone, onClick: () => onPick(filter) },
              h('b', null, value), h('span', null, t(`stat_${key}`)))))
        }

        function Overview({ data, goto }) {
          return h(React.Fragment, null,
            h(Stats, { stats: data.stats, onPick: status => goto('runs', { status }) }),
            h(ConnectionSection, { data }),
            h('section', { className: 'ph-section', 'aria-labelledby': 'ph-latest-runs' },
              h('div', { className: 'ph-sechead' },
                h('h2', { className: 'ph-sectitle', id: 'ph-latest-runs' }, t('latestRuns')),
                h('span', { className: 'ph-seccount' }, data.stats.total),
                h('span', { className: 'ph-spacer' }),
                data.stats.total > 0 ? h(Btn, { variant: 'ghost', onClick: () => goto('runs') }, t('viewAll'), h(Icon.right, { size: 12 })) : null),
              data.recent.length === 0
                ? h('div', { className: 'ph-empty' }, h(Icon.hub, { size: 24 }), t('noRuns'))
                : h('ul', { className: 'ph-rows' }, data.recent.map(run => h(RunRow, { key: run.sessionId, run, compact: true })))),
            h('section', { className: 'ph-section', 'aria-labelledby': 'ph-latest-activity' },
              h('div', { className: 'ph-sechead' },
                h('h2', { className: 'ph-sectitle', id: 'ph-latest-activity' }, t('latestActivity')),
                h('span', { className: 'ph-spacer' }),
                data.activity.length > 0 ? h(Btn, { variant: 'ghost', onClick: () => goto('activity') }, t('viewAll'), h(Icon.right, { size: 12 })) : null),
              data.activity.length === 0
                ? h('p', { className: 'ph-note' }, t('noActivity'))
                : h('div', null, data.activity.map(event => h(EventRow, { key: event.id, event })))))
        }

        // ---- runs ----

        function RunRow({ run, compact }) {
          const { runOp, confirm, copy, goto } = useApp()
          const [open, setOpen] = React.useState(false)
          const archived = run.status === 'archived'
          const meta = [ago(run.createdAt), run.modeId, run.model, run.cwd].filter(Boolean)
          return h('li', { className: 'ph-row' },
            h('div', { className: 'ph-rowline' },
              h('div', { className: 'ph-rowmain' },
                h('button', { type: 'button', className: 'ph-rowtitle', 'aria-expanded': open, onClick: () => setOpen(v => !v), title: open ? t('hideDetails') : t('details') },
                  h(Icon.chevron, { size: 12, open }), h('span', null, run.title || run.sessionId)),
                h('div', { className: 'ph-rowmeta', title: fmt(run.createdAt) }, meta.flatMap((part, i) => [
                  i ? h('span', { key: `s${i}`, className: 'ph-sep', 'aria-hidden': true }, '·') : null,
                  h('span', { key: i }, part),
                ]))),
              h('div', { className: 'ph-rowend' },
                h(Tag, { tone: STATUS_TONE[run.status], pulse: run.status === 'running' }, t(`status_${run.status}`)),
                run.running ? h(Btn, { onClick: () => runOp('cancel-run', run.sessionId) }, t('stop')) : null,
                canOpen() ? h(Btn, { onClick: () => openSession(run.sessionId) }, t('openSession')) : null,
                compact ? null : h(Menu, { items: [
                  { label: t('copyId'), onSelect: () => copy(run.sessionId) },
                  { label: t('copyPath'), onSelect: () => copy(run.cwd) },
                  { label: t('runActivity'), onSelect: () => goto('activity', { sessionId: run.sessionId }) },
                  '-',
                  archived
                    ? { label: t('restore'), onSelect: () => runOp('restore-run', run.sessionId) }
                    : { label: t('archive'), onSelect: () => runOp('archive-run', run.sessionId) },
                  archived ? { label: t('forget'), danger: true, onSelect: () => confirm({
                    title: t('forgetTitle'), text: t('forgetText'), confirmLabel: t('forget'), destructive: true,
                    onConfirm: () => runOp('forget-run', run.sessionId),
                  }) } : null,
                ] }))),
            run.lastError && !open ? h('p', { className: 'ph-rowerror' }, run.lastError) : null,
            open ? h('div', { className: 'ph-detail' }, h('dl', { className: 'ph-facts' },
              h('div', null, h('dt', null, t('sessionId')), h('dd', null, h('code', { className: 'ph-code' }, run.sessionId), h(Btn, { icon: Icon.copy, 'aria-label': t('copyId'), title: t('copyId'), onClick: () => copy(run.sessionId) }))),
              h('div', null, h('dt', null, t('directory')), h('dd', null, h('code', { className: 'ph-code' }, run.cwd), h(Btn, { icon: Icon.copy, 'aria-label': t('copyPath'), title: t('copyPath'), onClick: () => copy(run.cwd) }))),
              h('div', null, h('dt', null, t('mode')), h('dd', null, run.preset && run.preset !== run.modeId ? `${run.modeId} → ${run.preset}` : run.modeId ?? '—')),
              h('div', null, h('dt', null, t('model')), h('dd', null, run.model ?? t('deploymentDefault'))),
              run.thinkingOptionId ? h('div', null, h('dt', null, t('effort')), h('dd', null, run.thinkingOptionId)) : null,
              run.worktree ? h('div', null, h('dt', null, t('worktree')), h('dd', null, `${run.worktree.branch} · ${run.worktree.path}`)) : null,
              h('div', null, h('dt', null, t('hubTools')), h('dd', null, run.hubTools ? t('mounted') : t('notMounted'))),
              h('div', null, h('dt', null, t('createdAt')), h('dd', null, fmt(run.createdAt))),
              h('div', null, h('dt', null, t('lastActivity')), h('dd', null, run.lastActivityAt ? `${fmt(run.lastActivityAt)} · ${tf('turns', { n: run.turns })}` : '—')),
              run.finishedAt ? h('div', null, h('dt', null, t('finishedAt')), h('dd', null, fmt(run.finishedAt))) : null,
              run.lastError ? h('div', null, h('dt', null, t('lastError')), h('dd', { className: 'ph-error' }, run.lastError)) : null)) : null)
        }

        function RunsTab({ initial }) {
          const { nonce } = useApp()
          const [q, setQ] = React.useState('')
          const [status, setStatus] = React.useState(initial?.status ?? 'all')
          React.useEffect(() => { if (initial?.status) setStatus(initial.status) }, [initial])
          const [page, setPage] = React.useState(1)
          const [pageSize, setPageSize] = React.useState(() => Number(localStorage.getItem('paseo-hub:pageSize')) || 20)
          const search = useDebounced(q)
          const inputRef = React.useRef(null)
          useSlashFocus(inputRef)
          React.useEffect(() => setPage(1), [search, status, pageSize])
          const res = useResource('paseo-hub/runs', { q: search, status, page, pageSize, n: nonce })
          const data = res.data
          const stats = data?.stats
          const setSize = n => { localStorage.setItem('paseo-hub:pageSize', String(n)); setPageSize(n) }
          const filtered = search || status !== 'all'
          return h('section', { className: 'ph-section' },
            h('div', { className: 'ph-filters' },
              h(SearchBox, { value: q, onChange: setQ, placeholder: t('searchRuns'), inputRef })),
            h('div', { className: 'ph-chips', role: 'group', 'aria-label': t('status') },
              RUN_FILTERS.filter(key => key === 'all' || key === status || (stats?.[key] ?? 0) > 0).map(key =>
                h('button', { key, type: 'button', className: 'ph-chip', 'aria-pressed': status === key, onClick: () => setStatus(key) },
                  key === 'all' ? t('filter_all') : t(`status_${key}`), h('b', null, key === 'all' ? stats?.total ?? '' : stats?.[key] ?? 0)))),
            res.error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' }, h('p', null, res.error), h(Btn, { onClick: () => res.reload() }, t('retry'))) : null,
            data && data.total === 0
              ? h('div', { className: 'ph-empty' }, filtered ? t('noMatches') : t('noRuns'),
                  filtered ? h(Btn, { onClick: () => { setQ(''); setStatus('all') } }, t('clearFilters')) : null)
              : data ? h('ul', { className: 'ph-rows', 'aria-busy': res.loading }, data.items.map(run => h(RunRow, { key: run.sessionId, run }))) : null,
            h(Pager, { data, onPage: setPage, onSize: setSize }))
        }

        // ---- activity ----

        function EventRow({ event }) {
          const { goto } = useApp()
          return h('div', { className: 'ph-event', 'data-level': event.level },
            h('span', { className: 'ph-event-dot', 'aria-hidden': true }),
            h('div', { className: 'ph-event-main' },
              h('p', { className: 'ph-event-msg' }, event.message),
              h('div', { className: 'ph-event-meta' },
                h('span', null, t(`group_${event.kind.split('.')[0]}`) || event.kind),
                event.sessionId ? h(React.Fragment, null, h('span', { 'aria-hidden': true }, '·'),
                  h('button', { type: 'button', className: 'ph-textlink', title: t('runActivity'), onClick: () => goto('activity', { sessionId: event.sessionId }) }, event.sessionId.replace(/^session-/, '').slice(0, 8)),
                  canOpen() ? h('button', { type: 'button', className: 'ph-textlink', onClick: () => openSession(event.sessionId) }, t('openSession')) : null) : null),
              event.kind === 'api.dispatch' && event.detail ? h('details', null,
                h('summary', { className: 'ph-textlink' }, t('apiResult')),
                h('pre', { className: 'ph-pre ph-json', tabIndex: 0 }, JSON.stringify(event.detail, null, 2))) : null),
            h('time', { className: 'ph-event-time', dateTime: event.at, title: fmt(event.at) }, ago(event.at)))
        }

        function ActivityTab({ initial }) {
          const { op, confirm, nonce } = useApp()
          const [q, setQ] = React.useState('')
          const [level, setLevel] = React.useState('all')
          const [group, setGroup] = React.useState('all')
          const [sessionId, setSessionId] = React.useState(initial?.sessionId ?? '')
          const [page, setPage] = React.useState(1)
          const [pageSize, setPageSize] = React.useState(() => Number(localStorage.getItem('paseo-hub:pageSize')) || 20)
          React.useEffect(() => { setSessionId(initial?.sessionId ?? '') }, [initial])
          const search = useDebounced(q)
          const inputRef = React.useRef(null)
          useSlashFocus(inputRef)
          React.useEffect(() => setPage(1), [search, level, group, sessionId, pageSize])
          const res = useResource('paseo-hub/events', { q: search, level, group, sessionId, page, pageSize, n: nonce })
          const data = res.data
          const setSize = n => { localStorage.setItem('paseo-hub:pageSize', String(n)); setPageSize(n) }
          const filtered = search || level !== 'all' || group !== 'all' || sessionId
          return h('section', { className: 'ph-section' },
            h('div', { className: 'ph-filters' },
              h(SearchBox, { value: q, onChange: setQ, placeholder: t('searchActivity'), inputRef }),
              h('label', null, h('span', { className: 'ph-sr' }, t('group')),
                h('select', { className: 'ph-select', value: group, onChange: e => setGroup(e.target.value) },
                  GROUPS.map(key => h('option', { key, value: key }, key === 'all' ? `${t('group')}: ${t('filter_all')}` : t(`group_${key}`))))),
              h('label', null, h('span', { className: 'ph-sr' }, t('level')),
                h('select', { className: 'ph-select', value: level, onChange: e => setLevel(e.target.value) },
                  h('option', { value: 'all' }, `${t('level')}: ${t('filter_all')}`),
                  h('option', { value: 'problems' }, t('level_problems')))),
              h(Btn, { size: 'md', variant: 'ghost', disabled: !data || data.total === 0, onClick: () => confirm({
                title: t('clearActivityTitle'), text: t('clearActivityText'), confirmLabel: t('clear'), destructive: true,
                onConfirm: () => op({ action: 'clear-activity' }),
              }) }, t('clearActivity'))),
            sessionId ? h('div', { className: 'ph-chips' },
              h('button', { type: 'button', className: 'ph-chip', 'aria-pressed': true, onClick: () => setSessionId(''), title: t('clearFilters') },
                `${t('session')}: ${sessionId.replace(/^session-/, '').slice(0, 8)} `, h(Icon.close, { size: 10 }))) : null,
            res.error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' }, h('p', null, res.error), h(Btn, { onClick: () => res.reload() }, t('retry'))) : null,
            data && data.total === 0
              ? h('div', { className: 'ph-empty' }, filtered ? t('noMatches') : t('noActivity'),
                  filtered ? h(Btn, { onClick: () => { setQ(''); setLevel('all'); setGroup('all'); setSessionId('') } }, t('clearFilters')) : null)
              : data ? h('div', { 'aria-busy': res.loading }, data.items.map(event => h(EventRow, { key: event.id, event }))) : null,
            h(Pager, { data, onPage: setPage, onSize: setSize }))
        }

        // ---- setup ----

        function SetupTab({ data }) {
          const { copy } = useApp()
          const mode = data.defaultModeId ?? data.modes[0]?.id ?? '<mode>'
          const snippet = `run:\n  target: { daemon: ${data.slug ?? '<daemon>'}, cwd: /path/to/project }\n  agent:\n    provider: dsh\n    model: <provider>/<model>   # optional\n    mode: ${mode}\n  prompt: Describe the task.`
          return h(React.Fragment, null,
            h('section', { className: 'ph-section', 'aria-labelledby': 'ph-modes' },
              h('div', { className: 'ph-sechead' }, h('h2', { className: 'ph-sectitle', id: 'ph-modes' }, t('modes')), h('span', { className: 'ph-seccount' }, data.modes.length)),
              h('p', { className: 'ph-note' }, t('modesHint')),
              !data.presetsAvailable || data.modes.length === 0
                ? h('div', { className: 'ph-banner', 'data-tone': 'warn' }, h('p', null, t('noPresets')))
                : h('div', { className: 'ph-modes' }, data.modes.map(entry => h('div', { key: entry.id, className: 'ph-mode' },
                    h('div', { className: 'ph-mode-main' }, h('b', null, entry.label), entry.label === entry.id && entry.preset === entry.id ? null : h('span', null, entry.preset === entry.id ? entry.id : `${entry.id} → ${entry.preset}`)),
                    entry.id === data.defaultModeId ? h(Tag, { tone: 'info' }, t('defaultMode')) : null,
                    h(Btn, { icon: Icon.copy, 'aria-label': `${t('copy')} ${entry.id}`, title: t('copy'), onClick: () => copy(entry.id) }))))),
            h('section', { className: 'ph-section', 'aria-labelledby': 'ph-snippet' },
              h('div', { className: 'ph-sechead' }, h('h2', { className: 'ph-sectitle', id: 'ph-snippet' }, t('triggerYaml'))),
              h('p', { className: 'ph-note' }, t('triggerHint')),
              h('div', { className: 'ph-pre-wrap' },
                h('pre', { className: 'ph-pre' }, snippet),
                h(Btn, { icon: Icon.copy, onClick: () => copy(snippet) }, t('copy')))),
            h('section', { className: 'ph-section', 'aria-labelledby': 'ph-settings' },
              h('div', { className: 'ph-sechead' }, h('h2', { className: 'ph-sectitle', id: 'ph-settings' }, t('settings'))),
              h('dl', { className: 'ph-facts' },
                h('div', null, h('dt', null, t('agentPreset')), h('dd', null, data.config?.agentPreset ?? t('deploymentDefault'))),
                h('div', null, h('dt', null, t('listWorkspaces')), h('dd', null, data.config?.listWorkspaces ? t('yes') : t('no')))),
              h('p', { className: 'ph-note' }, t('settingsHint'))))
        }

        // ---- organization API console ----

        async function apiRequest(args) {
          const res = await fetch('paseo-hub/api', { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify(args) })
          let result
          try { result = await res.json() } catch { throw new Error(t('apiUnavailable')) }
          if (!res.ok) {
            const issues = (result.issues ?? []).map(issue => `${(issue.path ?? []).join('.')}: ${issue.message}`)
            throw new Error([result.message ?? `HTTP ${res.status}`, result.requiredScope, ...issues, result.requestId ? `requestId: ${result.requestId}` : ''].filter(Boolean).join('\n'))
          }
          return result
        }

        function ApiConsole({ data }) {
          const { confirm, copy, nonce, goto } = useApp()
          const [saved, setSaved] = React.useState(data.api ?? { configured: false })
          const [origin, setOrigin] = React.useState(data.api?.origin ?? data.hubOrigin ?? '')
          const [apiKey, setApiKey] = React.useState('')
          const [toolWrites, setToolWrites] = React.useState(data.api?.toolWrites === true)
          const [busy, setBusy] = React.useState(false)
          const lock = React.useRef(false)
          const [error, setError] = React.useState(null)
          const [notice, setNotice] = React.useState('')
          const [section, setSection] = React.useState('triggers')
          const [list, setList] = React.useState(null)
          const [query, setQuery] = React.useState('')
          const search = useDebounced(query)
          const [page, setPage] = React.useState(1)
          const [pageSize, setPageSize] = React.useState(10)
          const [editor, setEditor] = React.useState(false)
          const [yaml, setYaml] = React.useState('')
          const [validated, setValidated] = React.useState(null)
          const [result, setResult] = React.useState(null)
          const [resource, setResource] = React.useState(null)
          const [projects, setProjects] = React.useState([])
          const [projectSlug, setProjectSlug] = React.useState('default')
          const [trigger, setTrigger] = React.useState('')
          const [actor, setActor] = React.useState('automation')
          const [input, setInput] = React.useState('')
          const [inputJson, setInputJson] = React.useState(false)
          const [expectedVersionId, setExpectedVersionId] = React.useState('')
          const [deliveryKey, setDeliveryKey] = React.useState(() => sessionStorage.getItem('paseo-hub:deliveryKey') || crypto.randomUUID())
          React.useEffect(() => { sessionStorage.setItem('paseo-hub:deliveryKey', deliveryKey) }, [deliveryKey])
          const [bundle, setBundle] = React.useState('{\n  "projectSlug": "default",\n  "files": []\n}')
          const [validatedBundle, setValidatedBundle] = React.useState(null)
          const inputRef = React.useRef(null)
          useSlashFocus(inputRef)

          // The key itself is never read back. Saving/forgetting updates this
          // component immediately; Host polling only supplies non-secret status.
          React.useEffect(() => setPage(1), [search])
          React.useEffect(() => {
            if (!saved.configured) { setList(null); return }
            let alive = true
            setList(null)
            apiRequest({ action: 'triggers', query: search, page, pageSize }).then(value => {
              if (alive) setList(value)
            }).catch(e => { if (alive) setError(e.message) })
            return () => { alive = false }
          }, [saved, search, page, pageSize, nonce])

          const job = async fn => {
            if (lock.current) return t('apiBusy')
            lock.current = true
            setBusy(true); setError(null); setNotice('')
            try { await fn(); return null } catch (e) { setError(e.message); return e.message }
            finally { lock.current = false; setBusy(false) }
          }
          const reloadList = async () => setList(await apiRequest({ action: 'triggers', query: search, page, pageSize }))
          const makeTemplate = () => {
            setEditor(true); setValidated(null); setResult(null)
            setYaml(`name: manual-task\nenabled: true\non:\n  manual.run: {}\nrun:\n  target: { daemon: ${data.slug ?? 'my-daemon'}, cwd: /path/to/project }\n  agent:\n    provider: dsh\n    mode: ${data.defaultModeId ?? 'workspace-write'}\n  prompt: "Complete the task and call hub.finish_execution."\n  max_runtime: 1h\n  idle_timeout: 5m\n`)
          }
          const save = e => {
            e.preventDefault()
            void job(async () => {
              const value = await apiRequest({ action: 'configure', origin, apiKey, toolWrites })
              setSaved(value); setApiKey(''); setResult(null); setResource(null); setProjects([]); setValidated(null); setValidatedBundle(null); setNotice(t('apiSaved'))
            })
          }
          const validate = () => job(async () => {
            setValidated(null)
            const value = await apiRequest({ action: 'validate-trigger', yaml })
            setValidated(yaml); setResult(value); setNotice(t('apiValid'))
          })
          const install = () => confirm({
            title: t('apiInstallTitle'), text: `${saved.origin}\n${t('apiInstallText')}`, confirmLabel: t('apiInstall'),
            onConfirm: () => job(async () => {
              setResult(await apiRequest({ action: 'install-trigger', yaml }))
              setNotice(t('apiInstalled')); await reloadList()
            }),
          })
          const dispatch = e => {
            e.preventDefault()
            let parsed = input
            if (inputJson) {
              try { parsed = JSON.parse(input) } catch (parseError) { setError(parseError.message); return }
            }
            const args = { action: 'dispatch', projectSlug, trigger, actor, deliveryKey, input: parsed, ...(expectedVersionId.trim() ? { expectedVersionId: expectedVersionId.trim() } : {}) }
            confirm({
              title: t('apiDispatchTitle'), text: `${saved.origin}\n${projectSlug} / ${trigger}\n${t('apiDispatchText')}`, confirmLabel: t('apiDispatch'),
              onConfirm: () => job(async () => { setResult(await apiRequest(args)); setNotice(t('apiDispatched')) }),
            })
          }
          const readResource = action => job(async () => {
            const value = await apiRequest({ action, pageSize: 100 })
            setResource(value)
            if (action === 'projects') setProjects(value.items)
          })
          const check = () => job(async () => { setResult(await apiRequest({ action: 'check' })) })
          const configureSection = h('details', { className: 'ph-api-credentials', open: !saved.configured || undefined },
            h('summary', null, t('apiCredentials'), saved.configured ? ` · ${saved.origin}` : ''),
            h('section', { className: 'ph-section' },
            h('div', { className: 'ph-sechead' }, h('h2', { className: 'ph-sectitle' }, t('apiCredentials')),
              h('span', { className: 'ph-spacer' }),
              h(Tag, { tone: saved.configured ? 'success' : 'outline' }, saved.configured ? t('apiConfigured') : t('apiNotConfigured')),
              saved.configured ? h(Btn, { disabled: busy, onClick: check }, t('apiCheck')) : null),
            h('p', { className: 'ph-note' }, t('apiKeyHintLong')),
            h('form', { className: 'ph-form', onSubmit: save },
              h('label', { className: 'ph-field' }, t('origin'), h('input', { className: 'ph-input', type: 'url', required: true, value: origin, placeholder: 'https://hub.example.com', onChange: e => setOrigin(e.target.value) })),
              h('label', { className: 'ph-field' }, t('apiKeyLabel'), h('input', { className: 'ph-input', type: 'password', autoComplete: 'new-password', value: apiKey, required: !saved.configured || origin.replace(/\/$/, '') !== saved.origin, placeholder: saved.configured ? t('apiKeyUnchanged') : '', onChange: e => setApiKey(e.target.value) })),
              h('label', { className: 'ph-check' }, h('input', { type: 'checkbox', checked: toolWrites, onChange: e => setToolWrites(e.target.checked) }), t('apiToolWrites')),
              h('p', { className: 'ph-note' }, t('apiToolHint')),
              h('div', { className: 'ph-actions' },
                h('button', { type: 'submit', className: 'ph-btn', 'data-variant': 'primary', disabled: busy }, t('apiSave')),
                saved.configured ? h(Btn, { variant: 'danger', disabled: busy, onClick: () => confirm({
                  title: t('apiForgetTitle'), text: t('apiForgetText'), confirmLabel: t('apiForget'), destructive: true,
                  onConfirm: () => job(async () => { setSaved(await apiRequest({ action: 'forget-key' })); setApiKey(''); setResult(null); setResource(null); setProjects([]) }),
                }) }, t('apiForget')) : null))))

          return h(React.Fragment, null,
            h('p', { className: 'ph-note' }, t('apiIntro')),
            !data.api ? h('div', { className: 'ph-banner', 'data-tone': 'warn' }, h('p', null, t('apiUnavailable'))) : null,
            configureSection,
            error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' }, h('pre', { className: 'ph-api-error' }, error), h(Btn, { icon: Icon.close, 'aria-label': t('cancel'), onClick: () => setError(null) })) : null,
            notice ? h('p', { className: 'ph-note', role: 'status' }, notice) : null,
            saved.configured ? h(React.Fragment, null,
              h('div', { className: 'ph-chips', role: 'group', 'aria-label': t('apiSections') }, ['triggers', 'dispatch', 'resources', 'legacy'].map(key =>
                h('button', { key, type: 'button', className: 'ph-chip', 'aria-pressed': section === key, onClick: () => { setSection(key); setError(null); setResult(null); setNotice('') } }, t(`api_${key}`)))),
              section === 'triggers' ? h('section', { className: 'ph-section' },
                h('div', { className: 'ph-filters' }, h(SearchBox, { value: query, onChange: setQuery, inputRef, placeholder: t('apiSearch') }),
                  h(Btn, { disabled: busy, onClick: () => job(reloadList) }, t('refresh')),
                  h(Btn, { disabled: busy, variant: 'primary', onClick: makeTemplate }, t('apiNew'))),
                list && list.total === 0 ? h('div', { className: 'ph-empty' }, t('noMatches')) : null,
                list ? h('ul', { className: 'ph-rows' }, list.items.map(item => h('li', { key: item.id, className: 'ph-row' },
                  h('div', { className: 'ph-rowline' }, h('div', { className: 'ph-rowmain' }, h('strong', { className: 'ph-api-name' }, item.name), h('span', { className: 'ph-note' }, item.format)),
                    h(Tag, { tone: item.enabled ? 'success' : 'outline' }, item.enabled ? t('apiEnabled') : t('apiDisabled')),
                    h(Btn, { disabled: busy, onClick: () => job(async () => { const value = await apiRequest({ action: 'get-trigger', name: item.id }); setYaml(value.trigger.yaml); setValidated(null); setEditor(true); setResult(null) }) }, t('apiEdit')))))) : null,
                h(Pager, { data: list, onPage: setPage, onSize: size => { setPageSize(size); setPage(1) } }),
                editor ? h('div', { className: 'ph-section' },
                  h('div', { className: 'ph-sechead' }, h('h3', { className: 'ph-sectitle' }, t('apiYaml')), h('span', { className: 'ph-spacer' }), h(Btn, { disabled: busy, onClick: () => copy(yaml), icon: Icon.copy }, t('copy'))),
                  h('textarea', { className: 'ph-input ph-editor', 'aria-label': t('apiYaml'), value: yaml, spellCheck: false, disabled: busy, onChange: e => { setYaml(e.target.value); setValidated(null) } }),
                  h('p', { className: 'ph-note' }, t('apiYamlHint')),
                  h('div', { className: 'ph-actions' }, h(Btn, { disabled: busy || !yaml.trim(), onClick: validate }, t('apiValidate')),
                    h(Btn, { variant: 'primary', disabled: busy || validated !== yaml, onClick: install }, t('apiInstall')))) : null) : null,
              section === 'dispatch' ? h('section', { className: 'ph-section' },
                h('p', { className: 'ph-note' }, t('apiDispatchHint')),
                h('form', { className: 'ph-form', onSubmit: dispatch },
                  h('label', { className: 'ph-field' }, t('apiProject'), h('input', { className: 'ph-input', required: true, value: projectSlug, list: 'ph-api-projects', onChange: e => setProjectSlug(e.target.value) })),
                  h('datalist', { id: 'ph-api-projects' }, projects.map(p => h('option', { key: p.id, value: p.slug }, p.name))),
                  h(Btn, { disabled: busy, onClick: () => readResource('projects') }, t('apiLoadProjects')),
                  h('label', { className: 'ph-field' }, t('apiTrigger'), h('input', { className: 'ph-input', required: true, value: trigger, onChange: e => setTrigger(e.target.value) })),
                  h('label', { className: 'ph-field' }, t('apiActor'), h('input', { className: 'ph-input', required: true, value: actor, onChange: e => setActor(e.target.value) })),
                  h('label', { className: 'ph-field' }, t('apiInput'), h('textarea', { className: 'ph-input ph-editor ph-editor-short', value: input, onChange: e => setInput(e.target.value) })),
                  h('label', { className: 'ph-check' }, h('input', { type: 'checkbox', checked: inputJson, onChange: e => setInputJson(e.target.checked) }), t('apiInputJson')),
                  h('label', { className: 'ph-field' }, t('apiDeliveryKey'), h('input', { className: 'ph-input', required: true, value: deliveryKey, onChange: e => setDeliveryKey(e.target.value) })),
                  h('div', { className: 'ph-actions' }, h(Btn, { disabled: busy, onClick: () => { setDeliveryKey(crypto.randomUUID()); setResult(null) } }, t('apiNewDeliveryKey'))),
                  h('p', { className: 'ph-note' }, t('apiDeliveryHint')),
                  h('label', { className: 'ph-field' }, t('apiRevision'), h('input', { className: 'ph-input', value: expectedVersionId, onChange: e => setExpectedVersionId(e.target.value) })),
                  h('div', { className: 'ph-actions' }, h('button', { type: 'submit', className: 'ph-btn', 'data-variant': 'primary', disabled: busy }, t('apiDispatch'))))) : null,
              section === 'resources' ? h('section', { className: 'ph-section' },
                h('div', { className: 'ph-actions' }, ['projects', 'resources', 'setup-resources'].map(action => h(Btn, { key: action, disabled: busy, onClick: () => readResource(action) }, t(`apiRead_${action}`)))),
                h('p', { className: 'ph-note' }, t('apiResourceHint')),
                resource ? h('pre', { className: 'ph-pre ph-json', tabIndex: 0 }, JSON.stringify(resource, null, 2)) : null) : null,
              section === 'legacy' ? h('section', { className: 'ph-section' },
                h('p', { className: 'ph-note' }, t('apiLegacyHint')),
                h('textarea', { className: 'ph-input ph-editor', 'aria-label': t('apiLegacyBundle'), spellCheck: false, value: bundle, disabled: busy, onChange: e => { setBundle(e.target.value); setValidatedBundle(null) } }),
                h('div', { className: 'ph-actions' },
                  h(Btn, { disabled: busy, onClick: () => job(async () => { const args = JSON.parse(bundle); setValidatedBundle(null); setResult(await apiRequest({ ...args, action: 'validate-configuration' })); setValidatedBundle(bundle); setNotice(t('apiValid')) }) }, t('apiValidate')),
                  h(Btn, { variant: 'primary', disabled: busy || validatedBundle !== bundle, onClick: () => confirm({ title: t('apiInstallTitle'), text: `${saved.origin}\n${t('apiLegacyInstallText')}`, confirmLabel: t('apiInstall'), onConfirm: () => job(async () => { setResult(await apiRequest({ ...JSON.parse(bundle), action: 'install-configuration' })); setNotice(t('apiInstalled')) }) }) }, t('apiInstall')))) : null) : null,
            result ? h('section', { className: 'ph-section' }, h('div', { className: 'ph-sechead' }, h('h3', { className: 'ph-sectitle' }, t('apiResult')), h('span', { className: 'ph-spacer' }), h(Btn, { icon: Icon.copy, onClick: () => copy(JSON.stringify(result, null, 2)) }, t('copy'))),
              h('pre', { className: 'ph-pre ph-json', tabIndex: 0 }, JSON.stringify(result, null, 2)),
              h(Btn, { variant: 'ghost', onClick: () => goto('activity') }, t('apiViewActivity'))) : null)
        }

        // ---- sign-in ----

        function SignIn({ data }) {
          const { op } = useApp()
          const [origin, setOrigin] = React.useState(() => data.login?.origin ?? data.hubOrigin ?? '')
          const [apiKey, setApiKey] = React.useState('')
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState(null)
          const submit = async e => {
            e.preventDefault()
            setBusy(true)
            setError(null)
            const message = await op({ action: 'sign-in', origin, ...apiKey.trim() ? { apiKey } : {} })
            setBusy(false)
            setError(message)
          }
          return h('section', { className: 'ph-section', 'aria-labelledby': 'ph-signin' },
            h('div', { className: 'ph-sechead' }, h('h2', { className: 'ph-sectitle', id: 'ph-signin' }, t('signInTitle'))),
            h('p', { className: 'ph-note' }, t('introLong')),
            h('form', { className: 'ph-form', onSubmit: submit },
              h('label', { className: 'ph-field' }, t('origin'),
                h('input', { className: 'ph-input', type: 'url', required: true, placeholder: 'https://hub.example.com', value: origin, autoComplete: 'url', onChange: e => setOrigin(e.target.value) }),
                h('span', { className: 'ph-note' }, t('originHint'))),
              h('label', { className: 'ph-field' }, t('apiKey'),
                h('input', { className: 'ph-input', type: 'password', value: apiKey, autoComplete: 'off', onChange: e => setApiKey(e.target.value) }),
                h('span', { className: 'ph-note' }, t('apiKeyHint'))),
              error || data.lastError ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' }, h('p', null, error ?? data.lastError)) : null,
              h('div', { className: 'ph-actions' },
                h('button', { type: 'submit', className: 'ph-btn', 'data-variant': 'primary', 'data-size': 'md', disabled: !origin.trim() || busy, 'aria-busy': busy }, t('signIn')))))
        }

        function Pending({ data }) {
          const { op, copy } = useApp()
          const login = data.login
          if (login?.method !== 'browser') return h('section', { className: 'ph-section', 'aria-live': 'polite' },
            h(Tag, { tone: 'warning', pulse: true }, t(login?.method === 'starting' ? 'signingIn' : 'enrolling')),
            login?.method === 'starting' ? h(Btn, { size: 'md', onClick: () => op({ action: 'cancel-sign-in' }) }, t('cancel')) : null)
          return h('section', { className: 'ph-section', 'aria-live': 'polite', 'aria-labelledby': 'ph-pending' },
            h('div', { className: 'ph-sechead' }, h('h2', { className: 'ph-sectitle', id: 'ph-pending' }, t('signingIn')), h(Tag, { tone: 'warning', pulse: true }, t('state_signing_in'))),
            h('p', { className: 'ph-note' }, t('code')),
            h('div', { className: 'ph-actions' },
              h('p', { className: 'ph-usercode' }, login.userCode),
              h(Btn, { icon: Icon.copy, 'aria-label': t('copyCode'), title: t('copyCode'), onClick: () => copy(login.userCode) })),
            h('dl', { className: 'ph-facts' },
              h('div', null, h('dt', null, t('hub')), h('dd', null, login.origin)),
              h('div', null, h('dt', null, t('expires')), h('dd', { title: fmt(login.expiresAt) }, ago(login.expiresAt)))),
            h('div', { className: 'ph-actions' },
              h('a', { className: 'ph-btn', 'data-variant': 'primary', 'data-size': 'md', href: login.verificationUriComplete, target: '_blank', rel: 'noreferrer' }, t('openApproval'), h(Icon.external)),
              h(Btn, { size: 'md', onClick: () => op({ action: 'cancel-sign-in' }) }, t('cancel'))))
        }

        // ---- page ----

        const TABS = ['overview', 'runs', 'activity', 'api', 'setup']
        const EMPTY_STATS = { total: 0, last24h: 0, running: 0, finished: 0, completed: 0, failed: 0, canceled: 0, idle: 0, archived: 0 }

        function HubPage() {
          useLocale()
          const [nonce, setNonce] = React.useState(0)
          const [fast, setFast] = React.useState(false)
          const state = useResource('paseo-hub/state', { n: nonce }, fast)
          // A Host still running 0.1.0 sends `runs` instead of stats and has no list routes until DSH restarts.
          const legacy = state.data != null && state.data.stats === undefined
          const data = React.useMemo(() => {
            if (!state.data || !legacy) return state.data
            const recent = (state.data.runs ?? []).map(run => ({ ...run, status: run.running ? 'running' : run.archivedAt ? 'archived' : 'idle' }))
            const stats = { ...EMPTY_STATS, total: recent.length, last24h: recent.filter(run => Date.parse(run.createdAt) >= Date.now() - 86_400_000).length }
            for (const run of recent) stats[run.status] += 1
            return { ...state.data, stats, recent: recent.slice(0, 5), activity: [] }
          }, [state.data, legacy])
          React.useEffect(() => setFast(data?.state === 'signing_in' || data?.state === 'connecting'), [data?.state])
          const [tab, setTab] = React.useState(() => sessionStorage.getItem('paseo-hub:tab') || 'overview')
          const [tabArgs, setTabArgs] = React.useState(null)
          const [dialog, setDialog] = React.useState(null)
          const [toast, setToast] = React.useState(null)
          const [, tick] = React.useReducer(n => n + 1, 0)
          React.useEffect(() => { const id = setInterval(tick, 30_000); return () => clearInterval(id) }, [])
          React.useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 1600); return () => clearTimeout(id) }, [toast])

          const refresh = React.useCallback(() => setNonce(n => n + 1), [])
          const app = React.useMemo(() => {
            const op = async payload => {
              try {
                await request('paseo-hub/op', { method: 'POST', body: JSON.stringify(payload) })
                refresh()
                return null
              } catch (error) {
                const message = String(error?.message ?? error)
                setToast(`${t('opFailed')}: ${message}`)
                return message
              }
            }
            return {
              nonce,
              op,
              runOp: async (action, sessionId) => { const failed = await op({ action, sessionId }); if (!failed) setToast(t('done')); return failed },
              confirm: setDialog,
              copy: async text => {
                try { await navigator.clipboard.writeText(text); setToast(t('copied')) } catch { setToast(t('opFailed')) }
              },
              goto: (next, args = null) => { sessionStorage.setItem('paseo-hub:tab', next); setTab(next); setTabArgs(args) },
            }
          }, [nonce, refresh])

          const enrolled = data?.daemonId != null
          const current = TABS.includes(tab) ? tab : 'overview'
          const tone = data ? STATE_TONE[data.state] : undefined
          const onTabKey = e => {
            const at = TABS.indexOf(current)
            const next = e.key === 'ArrowRight' ? TABS[(at + 1) % TABS.length] : e.key === 'ArrowLeft' ? TABS[(at - 1 + TABS.length) % TABS.length] : null
            if (!next) return
            e.preventDefault()
            app.goto(next)
            e.currentTarget.querySelector(`#ph-tab-${next}`)?.focus()
          }

          return h(Ctx.Provider, { value: app }, h('div', { className: 'ph-page' },
            h('style', null, CSS),
            h('div', { className: 'ph-inner' },
              h('header', { className: 'ph-head' },
                h('div', { className: 'ph-heading' },
                  h('div', { className: 'ph-titlerow' },
                    h('h1', { className: 'ph-h1' }, t('panel')),
                    data ? h(Tag, { tone, pulse: tone === 'warning', title: data.lastError ?? undefined }, t(`state_${data.state}`)) : null),
                  h('p', { className: 'ph-intro' }, t('intro'))),
                h('div', { className: 'ph-toolbar' },
                  state.at ? h('span', { className: 'ph-updated', title: fmt(state.at) }, tf('updated', { time: ago(state.at) })) : null,
                  h(Btn, { icon: Icon.refresh, 'aria-label': t('refresh'), title: t('refresh'), onClick: refresh }))),
              state.error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' },
                h('p', null, `${t('loadFailed')}: ${state.error}`), h(Btn, { onClick: refresh }, t('retry'))) : null,
              legacy ? h('div', { className: 'ph-banner', 'data-tone': 'warn', role: 'status' }, h('p', null, t('legacyHost'))) : null,
              data ? h('div', { className: 'ph-tabs', role: 'tablist', 'aria-label': t('tabsLabel'), onKeyDown: onTabKey },
                TABS.map(key => h('button', {
                  key, id: `ph-tab-${key}`, type: 'button', role: 'tab', className: 'ph-tab',
                  'aria-selected': current === key, 'aria-controls': 'ph-tabpanel', tabIndex: current === key ? 0 : -1,
                  onClick: () => app.goto(key),
                }, t(`tab_${key}`),
                key === 'runs' && data.stats.running > 0 ? h('span', { className: 'ph-tabcount' }, data.stats.running) : null))) : null,
              data && current === 'overview' && !enrolled && data.state === 'signing_in' ? h(Pending, { data }) : null,
              data && current === 'overview' && !enrolled && data.state !== 'signing_in' ? h(SignIn, { data }) : null,
              data ? h('div', { id: 'ph-tabpanel', role: 'tabpanel', 'aria-labelledby': `ph-tab-${current}`, style: { display: 'flex', flexDirection: 'column', gap: 32 } },
                current === 'overview' && enrolled ? h(Overview, { data, goto: app.goto }) : null,
                current === 'runs' ? h(RunsTab, { initial: tabArgs }) : null,
                current === 'activity' ? h(ActivityTab, { initial: tabArgs }) : null,
                current === 'api' ? h(ApiConsole, { data }) : null,
                current === 'setup' ? h(SetupTab, { data }) : null) : null,
              toast ? h('div', { className: 'ph-toast', role: 'status' }, toast) : null),
            dialog ? h(Confirm, { ...dialog, onClose: () => setDialog(null) }) : null))
        }

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, HubPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 45, locale: NS, label: () => t('panel'),
        }, ({ size }) => h(Icon.hub, { size: size ?? 16 })))
      },
    }
  },
})
