window.__ModuleLoader__.load({
  id: 'dsh-paseo-hub',
  factory(require) {
    const React = require('react')
    const {
      Button, CodeBlock, DisclosureRow, Input, JsonBlock, Modal, PathLabel, SegmentedTabs, StateDot, Switch, Tag, TextShimmer,
      IconApiOutlineRegular, IconChevronDownOutlineRegular, IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular,
      IconCloseOutlineRegular, IconCopyOutlineRegular, IconEllipsisOutlineRegular, IconInspectOutlineRegular,
      IconPlayOutlineRegular, IconPlusOutlineRegular, IconRefreshOutlineRegular, IconRightUpOutlineRegular,
      IconSearchOutlineRegular, IconSettingsOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'paseo-hub'
    const PANEL_ID = 'paseo-hub'
    const PAGE_SIZES = [10, 20, 50]

    const EN = {
      tab_api: 'Hub API',
      apiIntro: 'Manage organization triggers and manual runs via the Hub API without connecting this Host as a daemon.',
      apiCredentials: 'Organization API access',
      apiConfigure: 'Configure',
      apiHideConfigure: 'Hide settings',
      apiConfigured: 'Key saved',
      apiNotConfigured: 'No key saved',
      apiWritesEnabled: 'Agent writes enabled',
      apiCheck: 'Check read access',
      apiKeyHintLong: 'Create a scoped key in Hub → API keys. Stored in Host credentials for this origin (separate from daemon credentials).',
      apiKeyLabel: 'Organization API key',
      apiKeyUnchanged: 'Leave blank to keep the saved key',
      apiToolWrites: 'Allow agent tools to install triggers and dispatch runs',
      apiToolHint: 'Reads use paseo_hub; writes use paseo_hub_write (disabled by default).',
      apiSave: 'Save API access',
      apiSaved: 'Saved. Click “Check read access” to verify.',
      apiForget: 'Remove saved key',
      apiForgetTitle: 'Remove API access?',
      apiForgetText: 'Removes the saved key locally without revoking it in Hub or disconnecting this daemon.',
      apiBusy: 'Another API request is in progress.',
      badResponse: 'Unexpected response (HTTP {status}).',
      apiSections: 'Organization operations',
      api_triggers: 'Triggers',
      api_dispatch: 'Manual run',
      api_resources: 'Resources',
      api_legacy: 'Legacy configuration',
      apiSearch: 'Search trigger names or IDs',
      apiNew: 'New from template',
      apiSelectHint: 'Select a trigger from the list to inspect its YAML, or create one from the template.',
      apiEnabled: 'Enabled',
      apiDisabled: 'Disabled',
      apiValidated: 'Validated',
      apiYaml: 'Trigger YAML',
      apiYamlHint: 'Install creates or updates by name and activates immediately. Target daemon must be online during validation.',
      apiValidate: 'Validate only',
      apiValid: 'Validation passed.',
      apiInstall: 'Install / update',
      apiInstallTitle: 'Activate this configuration?',
      apiInstallText: 'Creates or replaces the trigger immediately. Verify name, filters, target directory, and mode.',
      apiInstalled: 'Installed and activated.',
      apiRotateWebhookSecret: 'Rotate webhook secret',
      apiRotateWebhookSecretTitle: 'Rotate webhook secret?',
      apiRotateWebhookSecretText: 'Replaces the current Bearer secret immediately and shows the new secret once.',
      apiWebhookSecretRotated: 'Webhook secret rotated. Copy it from the API response now.',
      apiDispatch: 'Dispatch run',
      apiDispatchTitle: 'Dispatch a Hub run?',
      apiDispatchText: 'Starts a real run on the target daemon. The actor must match trigger filters.',
      apiDispatched: 'Dispatch accepted.',
      apiDispatchHint: 'Pick a manual.run trigger whose from_users filter allows this actor. Use text for prompts, or JSON for legacy structured inputs.',
      apiProject: 'Project slug',
      apiLoadProjects: 'Load projects',
      apiTrigger: 'Manual trigger name',
      apiActor: 'Actor',
      apiInput: 'Input / prompt',
      apiInputJson: 'Parse input as JSON',
      apiDeliveryKey: 'Delivery key',
      apiNewDeliveryKey: 'New key',
      apiDeliveryHint: 'Reuse this key when retrying the same run; generate a new key for a separate run.',
      apiRevision: 'Expected version ID (optional)',
      apiRead_projects: 'List projects',
      apiRead_resources: 'Daemons & integrations',
      'apiRead_setup-resources': 'Provider filter IDs',
      apiResourceHint: 'Read-only organization resources (first 100 projects shown here; use paseo_hub for pagination).',
      apiLegacyHint: 'Paste a JSON bundle ({ projectSlug, files: [{ path, content }] }, up to 8 MiB). Replaces the project’s full active configuration.',
      apiLegacyBundle: 'Legacy JSON configuration bundle',
      apiLegacyInstallText: 'Replaces the project’s entire active configuration without merging.',
      apiResult: 'API response',
      apiViewActivity: 'View activity',
      group_api: 'Organization API',
      panel: 'Paseo Hub',
      intro: 'Run Paseo Hub automations locally as DSH sessions.',
      introLong: 'Triggers from GitHub, Slack, Discord, Linear, and Telegram start local DSH sessions with provider "dsh" while this Host is running.',
      refresh: 'Refresh',
      tabsLabel: 'Paseo Hub sections',
      tab_overview: 'Overview',
      tab_runs: 'Runs',
      tab_activity: 'Activity',
      tab_setup: 'Setup',
      origin: 'Hub address',
      originHint: 'Hub origin without a path, e.g. https://hub.example.com.',
      apiKey: 'Organization API key (optional)',
      apiKeyHint: 'Leave empty to sign in via browser. Requires the "Enroll daemons" scope.',
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
      disconnectText: 'Revokes this daemon in Hub so triggers stop reaching this Host. Existing DSH sessions stay. Hub: {hub}',
      stat_total: 'Runs',
      stat_running: 'Running',
      stat_finished: 'Finished',
      stat_failed: 'Failed',
      stat_last24h: 'Last 24 hours',
      latestRuns: 'Latest runs',
      latestActivity: 'Latest activity',
      viewAll: 'View all',
      modes: 'Available modes',
      modesHint: 'Each Hub mode maps to a DSH permission preset specified via agent.mode.',
      noPresets: 'No permission presets configured. Enable @deepseek-ai/dsh-permission-presets.',
      defaultMode: 'Default',
      triggerYaml: 'Trigger snippet',
      triggerHint: 'Paste into a Hub trigger and replace daemon and cwd.',
      settings: 'Plugin settings',
      agentPreset: 'Agent preset',
      deploymentDefault: 'Deployment default',
      listWorkspaces: 'List run directories in sidebar',
      yes: 'Yes',
      no: 'No',
      settingsHint: 'Configure these on the Plugins page.',
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
      noRuns: 'No Hub runs yet.',
      noMatches: 'No matching results.',
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
      forgetText: 'Keeps the DSH session locally; Hub can no longer address this run.',
      runActivity: 'Run activity',
      level: 'Level',
      level_problems: 'Problems',
      group: 'Source',
      group_connection: 'Connection',
      group_run: 'Runs',
      group_op: 'Page actions',
      group_hub: 'Hub requests',
      noActivity: 'No activity recorded.',
      clearActivity: 'Clear activity',
      clearActivityTitle: 'Clear all activity?',
      clearActivityText: 'Deletes all local activity logs. Runs and sessions stay.',
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
      wrap: 'Wrap',
      unwrap: 'Unwrap',
      truncated: 'Truncated',
      done: 'Done',
      loadFailed: 'Could not load Paseo Hub',
      opFailed: 'Failed',
      retry: 'Retry',
      never: 'never',
      justNow: 'just now',
      updated: 'Updated {time}',
      tvRead: 'Paseo Hub',
      tvWrite: 'Paseo Hub write',
      tvStopped: 'Stopped',
      tvInspect: 'Inspect',
      tvInput: 'IN',
      tvOutput: 'OUT',
      statusRow: 'Host and link status',
      machine_laptop: 'Laptop',
      machine_desktop: 'Desktop',
      machine_mini: 'Mini',
      machine_workstation: 'Workstation',
      machine_cloud: 'Cloud',
      machine_container: 'Container',
      machine_board: 'Board',
      machine_server: 'Server',
      channel_local: 'Local',
      channel_tailscale: 'Tailscale',
      channel_direct: 'Direct',
      latency: 'Ping',
      latencyPending: 'Measuring…',
      latencyOffline: 'Offline',
      lastHeartbeat: 'Last heartbeat',
    }

    const ZH = {
      tab_api: 'Hub API',
      apiIntro: '通过组织 API 直接管理触发器和手动运行，不依赖本机 daemon 是否在线。',
      apiCredentials: '组织 API 访问',
      apiConfigure: '配置凭据',
      apiHideConfigure: '收起配置',
      apiConfigured: '已保存 Key',
      apiNotConfigured: '未配置 Key',
      apiWritesEnabled: '已开启 Agent 写入',
      apiCheck: '检查读取权限',
      apiKeyHintLong: '在 Hub → API keys 创建带权限的 Key，仅存在本机 Host 凭据中并绑定当前地址（与 daemon 凭据分开）。',
      apiKeyLabel: '组织 API key',
      apiKeyUnchanged: '留空保留当前已保存的 Key',
      apiToolWrites: '允许 Agent 工具安装触发器和触发运行',
      apiToolHint: '只读查询走 paseo_hub；写入走 paseo_hub_write（默认关闭）。',
      apiSave: '保存 API 访问',
      apiSaved: '已保存，点击“检查读取权限”验证。',
      apiForget: '移除已保存的 Key',
      apiForgetTitle: '移除 API 访问？',
      apiForgetText: '仅删除本地保存的 Key，不会在 Hub 撤销，也不影响 daemon 连接。',
      apiBusy: '另一个 API 请求正在进行。',
      badResponse: '响应异常（HTTP {status}）。',
      apiSections: '组织操作',
      api_triggers: '触发器',
      api_dispatch: '手动运行',
      api_resources: '资源',
      api_legacy: '旧版配置',
      apiSearch: '搜索触发器名称或 ID',
      apiNew: '从模板新建',
      apiSelectHint: '从左侧选择一个触发器查看或编辑 YAML，或点击「从模板新建」。',
      apiEnabled: '已启用',
      apiDisabled: '已停用',
      apiValidated: '已校验',
      apiYaml: '触发器 YAML',
      apiYamlHint: '安装按名称创建或覆盖并立即生效；校验时目标 daemon 需在线。',
      apiValidate: '仅校验',
      apiValid: '校验通过。',
      apiInstall: '安装 / 更新',
      apiInstallTitle: '激活这份配置？',
      apiInstallText: '按名称新建或覆盖触发器并立即生效，请核对名称、筛选条件、目录与 mode。',
      apiInstalled: '已安装并激活。',
      apiRotateWebhookSecret: '轮换 Webhook Secret',
      apiRotateWebhookSecretTitle: '轮换 Webhook Secret？',
      apiRotateWebhookSecretText: '将立即替换当前 Bearer secret 并仅展示一次新 secret。',
      apiWebhookSecretRotated: '已轮换 Webhook secret，请立即从下方 API 响应中复制保存。',
      apiDispatch: '触发运行',
      apiDispatchTitle: '触发 Hub 运行？',
      apiDispatchText: '将在目标 daemon 上启动真实任务，actor 需符合触发器筛选条件。',
      apiDispatched: '已接受触发请求。',
      apiDispatchHint: '选择已配置的 manual.run 触发器，actor 须符合 from_users 白名单；旧版结构化输入可勾选 JSON。',
      apiProject: '项目 slug',
      apiLoadProjects: '加载项目',
      apiTrigger: '手动触发器名称',
      apiActor: 'Actor',
      apiInput: '输入 / 提示词',
      apiInputJson: '将输入解析为 JSON',
      apiDeliveryKey: 'Delivery key',
      apiNewDeliveryKey: '生成新 Key',
      apiDeliveryHint: '重试同一次任务请保留此 Key；发起新任务时再生成新 Key。',
      apiRevision: '预期版本 ID（可选）',
      apiRead_projects: '查询项目',
      apiRead_resources: 'Daemon 与集成',
      'apiRead_setup-resources': '平台筛选 ID',
      apiResourceHint: '只读查询组织资源（此处最多列 100 个项目，分页查询请用 paseo_hub 工具）。',
      apiLegacyHint: '粘贴含 projectSlug 与 files: [{path, content}] 的 JSON bundle（上限 8 MiB），安装会整份替换项目活动配置。',
      apiLegacyBundle: '旧版配置 JSON bundle',
      apiLegacyInstallText: '将整份替换目标项目的活动配置，不合并文件。',
      apiResult: 'API 响应',
      apiViewActivity: '查看活动',
      group_api: '组织 API',
      panel: 'Paseo Hub',
      intro: '在本机把 Paseo Hub 自动化跑成 DSH 会话。',
      introLong: '来自 GitHub、Slack、Discord、Linear 和 Telegram 的触发会在本机启动 provider 为 "dsh" 的 DSH 会话。',
      refresh: '刷新',
      tabsLabel: 'Paseo Hub 分区',
      tab_overview: '概览',
      tab_runs: '运行',
      tab_activity: '活动',
      tab_setup: '设置',
      origin: 'Hub 地址',
      originHint: '仅填 origin，不含路径，例如 https://hub.example.com。',
      apiKey: '组织 API key（可选）',
      apiKeyHint: '留空则走浏览器授权登录；使用 Key 需带 “Enroll daemons” 权限。',
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
      disconnectText: '将在 Hub 撤销本机 daemon，触发不再下发；已有 DSH 会话保留。Hub：{hub}',
      stat_total: '运行',
      stat_running: '运行中',
      stat_finished: '已完成',
      stat_failed: '失败',
      stat_last24h: '近 24 小时',
      latestRuns: '最近运行',
      latestActivity: '最近活动',
      viewAll: '查看全部',
      modes: '可选 mode',
      modesHint: '每个 Hub mode 对应一个 DSH 权限预设，在触发器里通过 agent.mode 指定。',
      noPresets: '未配置权限预设，请启用 @deepseek-ai/dsh-permission-presets。',
      defaultMode: '默认',
      triggerYaml: '触发器片段',
      triggerHint: '粘贴到 Hub 触发器并替换 daemon 名称和目录。',
      settings: '插件设置',
      agentPreset: 'Agent 预设',
      deploymentDefault: '部署默认',
      listWorkspaces: '在侧栏列出运行目录',
      yes: '是',
      no: '否',
      settingsHint: '在插件页修改配置。',
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
      noRuns: '暂无 Hub 运行记录。',
      noMatches: '没有匹配的结果。',
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
      forgetText: '本地 DSH 会话保留，Hub 将不再索引这次运行。',
      runActivity: '运行活动',
      level: '级别',
      level_problems: '问题',
      group: '来源',
      group_connection: '连接',
      group_run: '运行',
      group_op: '页面操作',
      group_hub: 'Hub 请求',
      noActivity: '暂无活动记录。',
      clearActivity: '清空活动',
      clearActivityTitle: '清空全部活动？',
      clearActivityText: '删除本机全部活动记录，运行与会话保留。',
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
      wrap: '换行',
      unwrap: '不换行',
      truncated: '已截断',
      done: '已完成',
      loadFailed: '加载 Paseo Hub 失败',
      opFailed: '失败',
      retry: '重试',
      never: '从未',
      justNow: '刚刚',
      updated: '{time}更新',
      tvRead: 'Paseo Hub',
      tvWrite: 'Paseo Hub 写入',
      tvStopped: '已中止',
      tvInspect: '查看',
      tvInput: '输入',
      tvOutput: '输出',
      statusRow: '宿主机与链路状态',
      machine_laptop: '笔记本',
      machine_desktop: '台式机',
      machine_mini: '迷你主机',
      machine_workstation: '工作站',
      machine_cloud: '云主机',
      machine_container: '容器',
      machine_board: '开发板',
      machine_server: '服务器',
      channel_local: '本地',
      channel_tailscale: 'Tailscale',
      channel_direct: '直连',
      latency: '延迟',
      latencyPending: '测速中…',
      latencyOffline: '离线',
      lastHeartbeat: '上次心跳',
    }

    const CSS = `
.ph-page{--ph-mono:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);container-type:inline-size;height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.ph-page *,.ph-page *::before,.ph-page *::after{box-sizing:border-box}
.ph-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.ph-inner{display:flex;flex-direction:column;gap:20px;width:min(100%,1080px);margin:0 auto;padding:28px clamp(20px,3.5vw,44px) 56px}
[data-platform=darwin] .ph-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.ph-inner{padding:20px 16px 48px}[data-platform=darwin] .ph-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.ph-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:12px 16px}
.ph-heading{min-width:0;flex:1 1 300px;display:flex;flex-direction:column;gap:4px}
.ph-titlerow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ph-h1{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.01em}
.ph-intro{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ph-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:none}
.ph-updated{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.ph-stack{display:flex;flex-direction:column;gap:16px;min-width:0}
.ph-hero{display:flex;flex-direction:column;gap:14px;padding:16px 18px;border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0}
.ph-hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ph-hero-title{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 240px}
.ph-hero-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.ph-hero-h2{margin:0;font-size:15px;line-height:22px;font-weight:600;overflow-wrap:anywhere}
.ph-box{display:flex;flex-direction:column;border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-border-l2);min-width:0}
.ph-box-pad{padding:16px 18px;gap:12px}
.ph-box-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 16px;border-bottom:.5px solid var(--dsw-alias-border-l1);border-top-left-radius:inherit;border-top-right-radius:inherit;background:var(--dsw-alias-bg-layer-1)}
.ph-box-title{display:flex;align-items:center;gap:8px;min-width:0}
.ph-box-title h2,.ph-box-title h3{margin:0;font-size:14px;line-height:20px;font-weight:500}
.ph-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.ph-error{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}
.ph-banner{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ph-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 32%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 6%,var(--dsw-alias-bg-layer-1))}
.ph-banner[data-tone=warn]{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 34%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 8%,var(--dsw-alias-bg-layer-1))}
.ph-banner[data-tone=warn]>svg{color:var(--dsw-alias-state-warn-primary)}
.ph-banner[data-tone=ok]{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 30%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 7%,var(--dsw-alias-bg-layer-1))}
.ph-banner>svg{flex:none;margin-top:2px}
.ph-banner-body{flex:1;min-width:0;margin:0;overflow-wrap:anywhere;white-space:pre-wrap;font:inherit}
.ph-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ph-facts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px 16px;margin:0;padding-top:12px;border-top:.5px solid var(--dsw-alias-border-l1)}
.ph-status-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;padding:7px 10px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);min-width:0}
.ph-status-item{display:inline-flex;align-items:center;gap:5px;min-width:0;max-width:100%}
.ph-status-item>svg{flex:none;color:var(--dsw-alias-label-tertiary)}
.ph-status-strong{color:var(--dsw-alias-label-primary);font-weight:500;white-space:nowrap}
.ph-status-muted{color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ph-status-proto{padding:0 5px;border-radius:4px;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-family:var(--ph-mono);font-size:10.5px;line-height:16px;text-transform:uppercase;color:var(--dsw-alias-label-secondary);flex:none}
.ph-status-sep{width:1px;height:12px;background:var(--dsw-alias-border-l1);flex:none}
.ph-status-latency{margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap}
.ph-status-latency[data-tone=ok]{color:var(--dsw-alias-state-success-primary)}
.ph-status-latency[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}
.ph-status-latency[data-tone=slow]{color:var(--dsw-alias-state-error-primary)}
.ph-status-latency[data-tone=idle]{color:var(--dsw-alias-label-tertiary)}
@container (max-width:560px){.ph-status-latency{margin-left:0}}
.ph-fact{display:flex;flex-direction:column;gap:3px;min-width:0}
.ph-fact dt{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.ph-fact dd{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin:0;font-size:12.5px;line-height:18px;min-width:0;overflow-wrap:anywhere}
.ph-code{padding:1px 6px;border-radius:5px;background:var(--dsw-alias-bg-layer-2);font-family:var(--ph-mono);font-size:12px;box-decoration-break:clone;overflow-wrap:anywhere}
.ph-link{display:inline-flex;align-items:center;gap:4px;color:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));text-decoration:none;font-size:12px;overflow-wrap:anywhere}
@media (hover:hover){.ph-link:hover{text-decoration:underline;text-underline-offset:3px}}
.ph-extbtn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;text-decoration:none;white-space:nowrap;transition:background-color .15s}
@media (hover:hover){.ph-extbtn:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.ph-extbtn[data-primary=true]{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base));height:32px;padding:0 14px;font-size:13px}
.ph-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:10px}
.ph-stat{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .15s,border-color .15s}
@media (hover:hover){.ph-stat:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2))}}
.ph-stat b{font-size:20px;line-height:28px;font-weight:600;font-variant-numeric:tabular-nums}
.ph-stat span{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ph-stat[data-tone=danger] b{color:var(--dsw-alias-state-error-primary)}
.ph-stat[data-tone=info] b{color:var(--dsw-alias-state-business-primary)}
.ph-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ph-search-wrap{position:relative;flex:1 1 240px;min-width:180px}
.ph-search-end{position:absolute;right:6px;top:50%;transform:translateY(-50%);display:flex;align-items:center}
.ph-kbd{min-width:18px;padding:0 5px;border:.5px solid var(--dsw-alias-border-l2);border-radius:4px;font-size:11px;line-height:17px;text-align:center;color:var(--dsw-alias-label-tertiary);pointer-events:none}
.ph-select{height:32px;padding:0 26px 0 10px;border:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer}
.ph-select[data-size=sm]{height:28px;font-size:12px;padding:0 22px 0 8px}
.ph-chips{display:flex;gap:5px;flex-wrap:wrap;align-items:center}
.ph-chip{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;transition:background-color .15s,border-color .15s,color .15s}
@media (hover:hover){.ph-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.ph-chip[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-bg-layer-2));border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font-weight:500}
.ph-chip b{font-weight:400;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.ph-rows{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ph-row{padding:11px 16px;border-top:.5px solid var(--dsw-alias-border-l1)}
.ph-row:first-child{border-top:0}
.ph-rowline{display:flex;align-items:center;gap:12px;min-width:0}
.ph-rowmain{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.ph-rowtitle{display:flex;align-items:center;gap:6px;min-width:0;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.ph-rowtitle>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13.5px;line-height:20px;font-weight:500}
@media (hover:hover){.ph-rowtitle:hover>span{text-decoration:underline;text-underline-offset:3px}}
.ph-rowmeta{display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden}
.ph-rowmeta>span{overflow:hidden;text-overflow:ellipsis}
.ph-rowmeta>span:last-child{flex:1;min-width:0}
.ph-sep{flex:none}
.ph-rowend{display:flex;align-items:center;gap:6px;flex:none}
.ph-rowerror{margin:5px 0 0 18px;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}
.ph-detail{margin:10px 0 2px;padding:12px 14px;border-radius:var(--dsw-radius-sm,10px);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1)}
.ph-detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px 18px;margin:0}
.ph-detail-span{grid-column:1 / -1}
.ph-menuwrap{position:relative}
.ph-menu{position:absolute;right:0;top:calc(100% + 4px);z-index:20;min-width:184px;padding:4px;border:0;border-radius:var(--dsw-radius-lg,16px);background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-2));backdrop-filter:var(--dsw-menu-backdrop-filter);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.18))}
@media (max-width:768px),(pointer:coarse){.ph-menu{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base));backdrop-filter:none;-webkit-backdrop-filter:none}}
.ph-menuitem{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 10px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;text-align:left;cursor:pointer;white-space:nowrap}
@media (hover:hover){.ph-menuitem:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.ph-menuitem:disabled{opacity:.4;cursor:default}
.ph-menuitem[data-danger]{color:var(--dsw-alias-state-error-primary)}
.ph-menusep{height:.5px;margin:4px 6px;background:var(--dsw-alias-border-l1)}
.ph-event{display:flex;align-items:flex-start;gap:10px;padding:11px 16px;border-top:.5px solid var(--dsw-alias-border-l1)}
.ph-event:first-child{border-top:0}
.ph-event-dot{flex:none;margin-top:6px}
.ph-event-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.ph-event-msg{margin:0;font-size:13px;line-height:20px;overflow-wrap:anywhere}
.ph-event[data-level=error] .ph-event-msg{color:var(--dsw-alias-state-error-primary)}
.ph-event-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.ph-event-time{flex:none;font-size:12px;line-height:20px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-variant-numeric:tabular-nums}
.ph-textlink{padding:0;border:0;background:none;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;font-family:var(--ph-mono)}
@media (hover:hover){.ph-textlink:hover{color:var(--dsw-alias-label-primary);text-decoration:underline;text-underline-offset:3px}}
.ph-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:40px 20px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);text-align:center;color:var(--dsw-alias-label-secondary)}
.ph-empty p{margin:0}
.ph-pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ph-pager-side{display:flex;align-items:center;gap:6px}
.ph-pages{display:flex;align-items:center;gap:2px}
.ph-page-btn{min-width:28px;height:28px;padding:0 6px;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
@media (hover:hover){.ph-page-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.ph-page-btn:disabled{opacity:.35;cursor:default}
.ph-page-btn[aria-current=page]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-weight:500}
.ph-gap{min-width:20px;text-align:center;color:var(--dsw-alias-label-tertiary)}
.ph-form{display:flex;flex-direction:column;gap:14px}
.ph-form-narrow{max-width:560px}
.ph-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px}
@container (max-width:640px){.ph-form-grid{grid-template-columns:minmax(0,1fr)}}
.ph-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.ph-field>label,.ph-field-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);font-weight:500}
.ph-inline-row{display:flex;align-items:center;gap:8px;min-width:0}
.ph-inline-row>:first-child{flex:1;min-width:0}
.ph-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
.ph-switch-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
.ph-switch-copy strong{font-size:13px;font-weight:500}
.ph-usercode-box{display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-base);border:.5px solid var(--dsw-alias-border-l2)}
.ph-usercode{margin:0;font-family:var(--ph-mono);font-size:26px;line-height:34px;letter-spacing:4px;font-weight:600}
.ph-editor{width:100%;min-height:320px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:12px/1.6 var(--ph-mono);resize:vertical;tab-size:2;white-space:pre}
.ph-editor:focus{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary))}
.ph-editor:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.ph-editor-short{min-height:120px;white-space:pre-wrap}
.ph-api-split{display:grid;grid-template-columns:minmax(260px,330px) minmax(0,1fr);gap:16px;align-items:start}
@container (max-width:780px){.ph-api-split{grid-template-columns:minmax(0,1fr)}}
.ph-api-rail{display:flex;flex-direction:column;gap:10px;min-width:0}
.ph-trig-list{display:flex;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none}
.ph-trig-item{display:flex;align-items:center;gap:8px;width:100%;padding:9px 11px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,10px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .15s,border-color .15s}
@media (hover:hover){.ph-trig-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.ph-trig-item[aria-current=true]{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l2)}
.ph-trig-item:disabled{opacity:.5;cursor:default}
.ph-trig-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.ph-trig-name{font-weight:500;font-size:13px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ph-mode{display:flex;align-items:center;gap:12px;padding:10px 16px;border-top:.5px solid var(--dsw-alias-border-l1)}
.ph-mode:first-child{border-top:0}
.ph-mode-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.ph-mode-main b{font-size:13px;line-height:20px;font-weight:500}
.ph-mode-main span{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);font-family:var(--ph-mono)}
.ph-tag-inner{display:inline-flex;align-items:center;gap:5px}
.ph-danger-text{color:var(--dsw-alias-state-error-primary)}
.ph-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}
.ph-toast{position:sticky;bottom:16px;align-self:center;z-index:30;padding:6px 14px;border-radius:999px;background:var(--dsw-alias-toast-bg,var(--dsw-alias-label-primary));color:var(--dsw-alias-toast-label,var(--dsw-alias-bg-layer-3));font-size:12px;line-height:18px;box-shadow:var(--dsw-elevation-soft,0 2px 8px rgba(0,0,0,.16));pointer-events:none}
.ph-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ph-mono-input input{font-family:var(--ph-mono);font-size:12.5px}
@media (max-width:640px){.ph-rowmeta>span:not(:first-child),.ph-rowmeta>.ph-sep,.ph-kbd{display:none}}
.ph-page [role=tablist]{max-width:100%;overflow-x:auto;scrollbar-width:none}
.ph-page [role=tablist]::-webkit-scrollbar{display:none}
.ph-page [role=tab]{white-space:nowrap;flex:none}
@media (pointer:coarse){.ph-editor,.ph-select{font-size:16px}.ph-select{min-height:36px;height:36px}}
.ph-tv{display:flex;flex-direction:column}
.ph-tv-row{min-width:0}
.ph-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.ph-tv-summary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.ph-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.ph-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.ph-tv-body{display:flex;flex-direction:column;min-width:0}
.ph-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.ph-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.ph-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.ph-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.ph-tv-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.ph-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.ph-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.ph-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.ph-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.ph-tv-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.ph-tv:hover .ph-tv-inspect{opacity:1}.ph-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.ph-tv-inspect{opacity:1}}
`

    const STATE_TONE = { connected: 'success', connecting: 'warning', reconnecting: 'warning', signing_in: 'warning', revoked: 'danger', not_connected: 'outline' }
    const STATE_DOT = { connected: 'done', connecting: 'ongoing', reconnecting: 'ongoing', signing_in: 'ongoing', revoked: 'error', not_connected: 'idle' }
    const STATUS_TONE = { running: 'info', finished: 'success', completed: 'success', failed: 'danger', canceled: 'warning', idle: 'neutral', archived: 'outline' }
    const STATUS_DOT = { running: 'ongoing', finished: 'done', completed: 'done', failed: 'error', canceled: 'warning', idle: 'idle', archived: 'idle' }
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

    function randomUuid() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
      if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const b = new Uint8Array(16)
        crypto.getRandomValues(b)
        b[6] = (b[6] & 0x0f) | 0x40
        b[8] = (b[8] & 0x3f) | 0x80
        const hex = Array.from(b, x => x.toString(16).padStart(2, '0')).join('')
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      }
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    }

    const IconHub = ({ size = 16 }) => h('svg', {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true,
    },
    h('circle', { cx: 6.5, cy: 6.5, r: 2.5 }),
    h('circle', { cx: 17.5, cy: 6.5, r: 2.5 }),
    h('circle', { cx: 12, cy: 17, r: 3 }),
    h('path', { d: 'M8 8.5l2.6 5.6M16 8.5l-2.6 5.6' }))

    const MACHINE_KINDS = new Set(['laptop', 'desktop', 'mini', 'workstation', 'cloud', 'container', 'board', 'server'])
    const PLATFORM_LABELS = { darwin: 'macOS', linux: 'Linux', win32: 'Windows' }

    const formatLatency = ms => {
      if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return null
      if (ms < 1) return '<1 ms'
      if (ms < 1000) return `${Math.round(ms)} ms`
      return `${(ms / 1000).toFixed(1)} s`
    }

    const latencyTone = ms => {
      if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return 'idle'
      if (ms < 120) return 'ok'
      if (ms < 350) return 'warn'
      return 'slow'
    }

    const svgProps = size => ({
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    })

    const IconMachine = ({ kind, size = 13 }) => {
      const p = svgProps(size)
      switch (kind) {
        case 'laptop':
          return h('svg', p, h('rect', { x: 4, y: 5, width: 16, height: 11, rx: 2 }), h('path', { d: 'M2 19h20' }))
        case 'desktop':
          return h('svg', p, h('rect', { x: 3, y: 4, width: 18, height: 12, rx: 2 }), h('path', { d: 'M8 20h8M12 16v4' }))
        case 'mini':
          return h('svg', p, h('rect', { x: 3, y: 7, width: 18, height: 10, rx: 2.5 }), h('circle', { cx: 17, cy: 12, r: 1 }))
        case 'workstation':
          return h('svg', p, h('rect', { x: 6, y: 3, width: 12, height: 18, rx: 2 }), h('path', { d: 'M9 7h6M9 11h6' }), h('circle', { cx: 12, cy: 16.5, r: 1 }))
        case 'cloud':
          return h('svg', p, h('path', { d: 'M7 18h10a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7.2 8.7 4 4 0 0 0 7 18Z' }))
        case 'container':
          return h('svg', p, h('path', { d: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z' }), h('path', { d: 'M4 7.5 12 12l8-4.5M12 12v9' }))
        case 'board':
          return h('svg', p, h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 2 }), h('path', { d: 'M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4' }))
        default:
          return h('svg', p, h('rect', { x: 3, y: 4, width: 18, height: 6, rx: 1.5 }), h('rect', { x: 3, y: 14, width: 18, height: 6, rx: 1.5 }), h('circle', { cx: 7, cy: 7, r: 0.7 }), h('circle', { cx: 7, cy: 17, r: 0.7 }))
      }
    }

    const IconChannel = ({ kind, size = 12 }) => {
      const p = svgProps(size)
      if (kind === 'local') {
        return h('svg', p, h('rect', { x: 3, y: 4, width: 18, height: 12, rx: 2 }), h('path', { d: 'M8 20h8M12 16v4' }))
      }
      if (kind === 'tailscale') {
        return h('svg', p,
          h('circle', { cx: 6, cy: 12, r: 1.5 }),
          h('circle', { cx: 12, cy: 12, r: 1.5 }),
          h('circle', { cx: 18, cy: 12, r: 1.5 }),
          h('circle', { cx: 12, cy: 6, r: 1.5 }),
          h('circle', { cx: 12, cy: 18, r: 1.5 }))
      }
      return h('svg', p, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18' }))
    }

    const IconLatency = ({ size = 12 }) => h('svg', svgProps(size), h('path', { d: 'M3 12h4l2.5-6 5 12 2.5-6H21' }))

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'paseo-hub: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'paseo-hub: zh')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'paseo-hub: styles')
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
          const [bump, setBump] = React.useState(0)
          const { n, ...selection } = params
          const identity = `${path}?${qs(selection)}`
          const key = `${identity}&n=${encodeURIComponent(n ?? 0)}&r=${bump}`
          const load = React.useCallback(async signal => {
            try {
              const data = await request(key, { signal })
              if (!signal?.aborted) setState({ identity, data, error: null, loading: false, at: new Date().toISOString() })
            } catch (error) {
              if (!signal?.aborted && error?.name !== 'AbortError') {
                setState(prev => ({ ...(prev.identity === identity ? prev : { identity, data: null }), error: String(error?.message ?? error), loading: false }))
              }
            }
          }, [key])
          usePoll(load, [load], fast)
          const reload = React.useCallback(() => setBump(v => v + 1), [])
          return { ...(state.identity === identity ? state : { data: null, loading: true, error: null }), reload }
        }

        function StatusTag({ tone, dotState, children, title }) {
          return h(Tag, { tone, title },
            h('span', { className: 'ph-tag-inner' },
              dotState ? h(StateDot, { state: dotState, size: 7 }) : null,
              children))
        }

        function ConfirmModal({ title, text, confirmLabel, destructive, onConfirm, onClose }) {
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState(null)
          const run = async () => {
            setBusy(true)
            setError(null)
            const message = await onConfirm()
            if (message) { setBusy(false); setError(message); return }
            onClose()
          }
          return h(Modal, {
            open: true,
            onClose: () => { if (!busy) onClose() },
            title,
            closeLabel: t('cancel'),
            description: text,
            tone: destructive ? 'warning' : undefined,
            footer: h(React.Fragment, null,
              h(Button, { variant: 'outline', disabled: busy, 'data-modal-autofocus': destructive || undefined, onClick: onClose }, t('cancel')),
              h(Button, {
                variant: 'primary',
                className: destructive ? 'ph-danger-fill' : undefined,
                disabled: busy, 'aria-busy': busy,
                'data-modal-autofocus': !destructive || undefined,
                onClick: () => void run(),
              }, confirmLabel)),
          }, error ? h('p', { className: 'ph-error', role: 'alert' }, `${t('opFailed')}: ${error}`) : null)
        }

        function Menu({ items }) {
          const [open, setOpen] = React.useState(false)
          const ref = React.useRef(null)
          React.useEffect(() => {
            if (!open) return undefined
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
            h(Button, {
              size: 'sm', variant: 'ghost',
              icon: h(IconEllipsisOutlineRegular, { size: 15 }),
              'aria-label': t('more'), title: t('more'), 'aria-haspopup': 'menu', 'aria-expanded': open,
              onClick: () => setOpen(v => !v),
            }),
            open ? h('div', { className: 'ph-menu', role: 'menu', onKeyDown: onKey },
              items.filter(Boolean).map((item, i) => item === '-'
                ? h('div', { key: `sep-${i}`, className: 'ph-menusep', role: 'separator' })
                : h('button', {
                  key: item.label, type: 'button', role: 'menuitem', className: 'ph-menuitem',
                  'data-danger': item.danger ? '' : undefined, disabled: item.disabled,
                  onClick: () => { setOpen(false); item.onSelect() },
                }, item.label))) : null)
        }

        function Pager({ data, onPage, onSize }) {
          if (!data || data.total === 0) return null
          const { page, pages, pageSize, total } = data
          const from = (page - 1) * pageSize + 1
          const to = Math.min(total, page * pageSize)
          const list = []
          for (let n = 1; n <= pages; n++) {
            if (n === 1 || n === pages || Math.abs(n - page) <= 1) list.push(n)
            else if (list[list.length - 1] !== '…') list.push('…')
          }
          return h('nav', { className: 'ph-pager', 'aria-label': t('pagination') },
            h('div', { className: 'ph-pager-side' },
              h('span', { 'aria-live': 'polite' }, tf('range', { from, to, total })),
              h('label', { className: 'ph-pager-side' }, h('span', null, t('perPage')),
                h('select', { className: 'ph-select', 'data-size': 'sm', value: pageSize, onChange: e => onSize(Number(e.target.value)) },
                  PAGE_SIZES.map(n => h('option', { key: n, value: n }, n))))),
            pages > 1 ? h('div', { className: 'ph-pages' },
              h('button', { type: 'button', className: 'ph-page-btn', disabled: page <= 1, onClick: () => onPage(page - 1), 'aria-label': t('prev'), title: t('prev') }, h(IconChevronLeftOutlineRegular, { size: 13 })),
              list.map((n, i) => n === '…'
                ? h('span', { key: `gap-${i}`, className: 'ph-gap', 'aria-hidden': true }, '…')
                : h('button', { key: n, type: 'button', className: 'ph-page-btn', 'aria-current': n === page ? 'page' : undefined, 'aria-label': tf('pageN', { n }), onClick: () => onPage(n) }, n)),
              h('button', { type: 'button', className: 'ph-page-btn', disabled: page >= pages, onClick: () => onPage(page + 1), 'aria-label': t('next'), title: t('next') }, h(IconChevronRightOutlineRegular, { size: 13 }))) : null)
        }

        function SearchBox({ value, onChange, placeholder, inputRef }) {
          return h('div', { className: 'ph-search-wrap' },
            h(Input, {
              ref: inputRef,
              type: 'search',
              icon: h(IconSearchOutlineRegular, { size: 14 }),
              value,
              placeholder,
              'aria-label': t('search'),
              onChange: e => onChange(e.target.value),
              onKeyDown: e => { if (e.key === 'Escape' && value) { e.stopPropagation(); onChange('') } },
            }),
            h('span', { className: 'ph-search-end' }, value
              ? h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCloseOutlineRegular, { size: 11 }), 'aria-label': t('clearFilters'), onClick: () => onChange('') })
              : h('kbd', { className: 'ph-kbd', 'aria-hidden': true }, '/')))
        }

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

        function useDebounced(value, ms = 250) {
          const [out, setOut] = React.useState(value)
          React.useEffect(() => { const id = setTimeout(() => setOut(value), ms); return () => clearTimeout(id) }, [value, ms])
          return out
        }

        function ConnectionStatusRow({ data }) {
          const host = data.host ?? {}
          const machineKind = MACHINE_KINDS.has(host.machineKind) ? host.machineKind : 'server'
          const osLabel = PLATFORM_LABELS[host.platform] ?? host.platform ?? null
          const hostMeta = [osLabel, host.hostname].filter(Boolean).join(' · ')
          const channel = data.channel ?? null
          const channelKind = channel?.kind === 'local' || channel?.kind === 'tailscale' ? channel.kind : 'direct'
          const channelEndpoint = channel?.endpoint ?? null
          const formattedLatency = data.state === 'connected' ? formatLatency(data.latencyMs) : null
          const tone = data.state === 'connected' ? latencyTone(data.latencyMs) : 'idle'
          const latencyText = data.state === 'connected'
            ? (formattedLatency ?? t('latencyPending'))
            : t('latencyOffline')
          const latencyTitle = data.lastPongAt ? `${t('lastHeartbeat')}: ${fmt(data.lastPongAt)}` : undefined
          return h('div', { className: 'ph-status-row', role: 'group', 'aria-label': t('statusRow') },
            h('span', { className: 'ph-status-item', 'data-part': 'host', title: hostMeta || undefined },
              h(IconMachine, { kind: machineKind, size: 13 }),
              h('span', { className: 'ph-status-strong' }, t(`machine_${machineKind}`)),
              hostMeta ? h('span', { className: 'ph-status-muted' }, hostMeta) : null),
            channel ? h(React.Fragment, null,
              h('span', { className: 'ph-status-sep', 'aria-hidden': true }),
              h('span', { className: 'ph-status-item', 'data-part': 'channel', title: channelEndpoint ?? undefined },
                h(IconChannel, { kind: channelKind, size: 12 }),
                h('span', { className: 'ph-status-strong' }, t(`channel_${channelKind}`)),
                channel.protocol ? h('span', { className: 'ph-status-proto' }, channel.protocol) : null,
                channelEndpoint ? h('span', { className: 'ph-status-muted' }, channelEndpoint) : null)) : null,
            h('span', { className: 'ph-status-item ph-status-latency', 'data-part': 'latency', 'data-tone': tone, title: latencyTitle },
              h(IconLatency, { size: 12 }),
              h('span', null, `${t('latency')} ${latencyText}`)))
        }

        function ConnectionHero({ data }) {
          const { op, confirm, copy } = useApp()
          return h('section', { className: 'ph-hero', 'aria-labelledby': 'ph-conn' },
            h('div', { className: 'ph-hero-top' },
              h('div', { className: 'ph-hero-title' },
                h('div', { className: 'ph-hero-row' },
                  h('h2', { className: 'ph-hero-h2', id: 'ph-conn' }, data.slug ?? t('connection')),
                  h(StatusTag, { tone: STATE_TONE[data.state], dotState: STATE_DOT[data.state] }, t(`state_${data.state}`))),
                h('a', { className: 'ph-link', href: data.hubOrigin, target: '_blank', rel: 'noreferrer' },
                  data.hubOrigin, h(IconRightUpOutlineRegular, { size: 11 }))),
              h('div', { className: 'ph-actions' },
                h('a', { className: 'ph-extbtn', href: data.hubOrigin, target: '_blank', rel: 'noreferrer' },
                  t('openHub'), h(IconRightUpOutlineRegular, { size: 12 })),
                data.state === 'connected' ? null : h(Button, { size: 'sm', variant: 'outline', onClick: () => void op({ action: 'reconnect' }) }, t('reconnect')),
                h(Button, {
                  size: 'sm', variant: 'ghost', className: 'ph-danger-text',
                  onClick: () => confirm({
                    title: t('disconnectTitle'), text: tf('disconnectText', { hub: data.hubOrigin }), confirmLabel: t('disconnect'), destructive: true,
                    onConfirm: () => op({ action: 'disconnect' }),
                  }),
                }, t('disconnect')))),
            h(ConnectionStatusRow, { data }),
            data.lastError ? h('div', { className: 'ph-banner', 'data-tone': data.state === 'revoked' ? 'error' : 'warn', role: 'status' },
              h(IconWarningTriangleOutlineRegular, { size: 14 }),
              h('p', { className: 'ph-banner-body' }, data.lastError)) : null,
            h('dl', { className: 'ph-facts-grid' },
              h('div', { className: 'ph-fact' },
                h('dt', null, t('daemonId')),
                h('dd', null,
                  h('code', { className: 'ph-code' }, data.daemonId),
                  h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCopyOutlineRegular, { size: 12 }), 'aria-label': t('copy'), title: t('copy'), onClick: () => copy(data.daemonId) }))),
              h('div', { className: 'ph-fact' },
                h('dt', null, t('since')),
                h('dd', { title: fmt(data.connectedAt) }, data.state === 'connected' ? ago(data.connectedAt) : '—')),
              h('div', { className: 'ph-fact' },
                h('dt', null, t('enrolled')),
                h('dd', { title: fmt(data.enrolledAt) }, fmt(data.enrolledAt))),
              h('div', { className: 'ph-fact' },
                h('dt', null, t('permissions')),
                h('dd', null, (data.permissions ?? []).length
                  ? (data.permissions ?? []).map(p => h(Tag, { key: p, tone: 'neutral' }, p))
                  : '—'))))
        }

        function Stats({ stats, onPick }) {
          const items = [
            ['total', 'all', stats.total],
            ['running', 'running', stats.running, stats.running > 0 ? 'info' : undefined],
            ['finished', 'finished', stats.finished + stats.completed],
            ['failed', 'failed', stats.failed, stats.failed > 0 ? 'danger' : undefined],
            ['last24h', 'all', stats.last24h],
          ]
          return h('div', { className: 'ph-stats' }, items.map(([key, filter, value, tone]) =>
            h('button', { key, type: 'button', className: 'ph-stat', 'data-tone': tone, onClick: () => onPick(filter) },
              h('b', null, value), h('span', null, t(`stat_${key}`)))))
        }

        function Overview({ data, goto }) {
          return h('div', { className: 'ph-stack' },
            h(ConnectionHero, { data }),
            h(Stats, { stats: data.stats, onPick: status => goto('runs', { status }) }),
            h('section', { className: 'ph-box', 'aria-labelledby': 'ph-latest-runs' },
              h('div', { className: 'ph-box-head' },
                h('div', { className: 'ph-box-title' },
                  h('h2', { id: 'ph-latest-runs' }, t('latestRuns')),
                  h(Tag, { tone: 'neutral' }, data.stats.total)),
                data.stats.total > 0 ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => goto('runs') }, t('viewAll')) : null),
              data.recent.length === 0
                ? h('div', { className: 'ph-empty', style: { border: 0, borderRadius: 0 } }, h(IconHub, { size: 24 }), h('p', null, t('noRuns')))
                : h('ul', { className: 'ph-rows' }, data.recent.map(run => h(RunRow, { key: run.sessionId, run, compact: true })))),
            h('section', { className: 'ph-box', 'aria-labelledby': 'ph-latest-activity' },
              h('div', { className: 'ph-box-head' },
                h('div', { className: 'ph-box-title' },
                  h('h2', { id: 'ph-latest-activity' }, t('latestActivity'))),
                data.activity.length > 0 ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => goto('activity') }, t('viewAll')) : null),
              data.activity.length === 0
                ? h('div', { className: 'ph-empty', style: { border: 0, borderRadius: 0, padding: '24px 16px' } }, h('p', null, t('noActivity')))
                : h('div', null, data.activity.map(event => h(EventRow, { key: event.id, event })))))
        }

        function RunRow({ run, compact }) {
          const { runOp, confirm, copy, goto } = useApp()
          const [open, setOpen] = React.useState(false)
          const archived = run.status === 'archived'
          const meta = [ago(run.createdAt), run.modeId, run.model, run.cwd].filter(Boolean)
          return h('li', { className: 'ph-row' },
            h('div', { className: 'ph-rowline' },
              h('div', { className: 'ph-rowmain' },
                h('button', { type: 'button', className: 'ph-rowtitle', 'aria-expanded': open, onClick: () => setOpen(v => !v), title: open ? t('hideDetails') : t('details') },
                  h(open ? IconChevronDownOutlineRegular : IconChevronRightOutlineRegular, { size: 12 }),
                  h('span', null, run.title || run.sessionId)),
                h('div', { className: 'ph-rowmeta', title: fmt(run.createdAt) }, meta.flatMap((part, i) => [
                  i ? h('span', { key: `s${i}`, className: 'ph-sep', 'aria-hidden': true }, '·') : null,
                  h('span', { key: i }, part),
                ]))),
              h('div', { className: 'ph-rowend' },
                h(StatusTag, { tone: STATUS_TONE[run.status], dotState: STATUS_DOT[run.status] }, t(`status_${run.status}`)),
                run.running ? h(Button, { size: 'sm', variant: 'outline', onClick: () => void runOp('cancel-run', run.sessionId) }, t('stop')) : null,
                canOpen() ? h(Button, { size: 'sm', variant: 'outline', onClick: () => openSession(run.sessionId) }, t('openSession')) : null,
                compact ? null : h(Menu, { items: [
                  { label: t('copyId'), onSelect: () => copy(run.sessionId) },
                  { label: t('copyPath'), onSelect: () => copy(run.cwd) },
                  { label: t('runActivity'), onSelect: () => goto('activity', { sessionId: run.sessionId }) },
                  '-',
                  archived
                    ? { label: t('restore'), onSelect: () => void runOp('restore-run', run.sessionId) }
                    : { label: t('archive'), onSelect: () => void runOp('archive-run', run.sessionId) },
                  archived ? { label: t('forget'), danger: true, onSelect: () => confirm({
                    title: t('forgetTitle'), text: t('forgetText'), confirmLabel: t('forget'), destructive: true,
                    onConfirm: () => runOp('forget-run', run.sessionId),
                  }) } : null,
                ] }))),
            run.lastError && !open ? h('p', { className: 'ph-rowerror' }, run.lastError) : null,
            open ? h('div', { className: 'ph-detail' },
              h('dl', { className: 'ph-detail-grid' },
                h('div', { className: 'ph-fact' },
                  h('dt', null, t('sessionId')),
                  h('dd', null,
                    h('code', { className: 'ph-code' }, run.sessionId),
                    h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCopyOutlineRegular, { size: 12 }), 'aria-label': t('copyId'), title: t('copyId'), onClick: () => copy(run.sessionId) }))),
                h('div', { className: 'ph-fact' },
                  h('dt', null, t('directory')),
                  h('dd', null,
                    run.cwd ? h(PathLabel, { path: run.cwd }) : '—',
                    run.cwd ? h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCopyOutlineRegular, { size: 12 }), 'aria-label': t('copyPath'), title: t('copyPath'), onClick: () => copy(run.cwd) }) : null)),
                h('div', { className: 'ph-fact' },
                  h('dt', null, t('mode')),
                  h('dd', null, run.preset && run.preset !== run.modeId ? `${run.modeId} → ${run.preset}` : run.modeId ?? '—')),
                h('div', { className: 'ph-fact' },
                  h('dt', null, t('model')),
                  h('dd', null, run.model ?? t('deploymentDefault'))),
                run.thinkingOptionId ? h('div', { className: 'ph-fact' }, h('dt', null, t('effort')), h('dd', null, run.thinkingOptionId)) : null,
                run.worktree ? h('div', { className: 'ph-fact' }, h('dt', null, t('worktree')), h('dd', null, `${run.worktree.branch} · ${run.worktree.path}`)) : null,
                h('div', { className: 'ph-fact' }, h('dt', null, t('hubTools')), h('dd', null, run.hubTools ? t('mounted') : t('notMounted'))),
                h('div', { className: 'ph-fact' }, h('dt', null, t('createdAt')), h('dd', null, fmt(run.createdAt))),
                h('div', { className: 'ph-fact' }, h('dt', null, t('lastActivity')), h('dd', null, run.lastActivityAt ? `${fmt(run.lastActivityAt)} · ${tf('turns', { n: run.turns })}` : '—')),
                run.finishedAt ? h('div', { className: 'ph-fact' }, h('dt', null, t('finishedAt')), h('dd', null, fmt(run.finishedAt))) : null,
                run.lastError ? h('div', { className: 'ph-fact ph-detail-span' }, h('dt', null, t('lastError')), h('dd', { className: 'ph-error' }, run.lastError)) : null)) : null)
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
          return h('div', { className: 'ph-stack' },
            h('div', { className: 'ph-filters' },
              h(SearchBox, { value: q, onChange: setQ, placeholder: t('searchRuns'), inputRef })),
            h('div', { className: 'ph-chips', role: 'group', 'aria-label': t('status') },
              RUN_FILTERS.filter(key => key === 'all' || key === status || (stats?.[key] ?? 0) > 0).map(key =>
                h('button', { key, type: 'button', className: 'ph-chip', 'aria-pressed': status === key, onClick: () => setStatus(key) },
                  key === 'all' ? t('filter_all') : t(`status_${key}`),
                  h('b', null, key === 'all' ? stats?.total ?? '' : stats?.[key] ?? 0)))),
            res.error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' },
              h(IconWarningTriangleOutlineRegular, { size: 14 }),
              h('p', { className: 'ph-banner-body' }, res.error),
              h(Button, { size: 'sm', variant: 'outline', onClick: () => res.reload() }, t('retry'))) : null,
            data && data.total === 0
              ? h('div', { className: 'ph-empty' },
                h('p', null, filtered ? t('noMatches') : t('noRuns')),
                filtered ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setQ(''); setStatus('all') } }, t('clearFilters')) : null)
              : data ? h('section', { className: 'ph-box', 'aria-busy': res.loading },
                h('ul', { className: 'ph-rows' }, data.items.map(run => h(RunRow, { key: run.sessionId, run })))) : null,
            h(Pager, { data, onPage: setPage, onSize: setSize }))
        }

        function EventRow({ event }) {
          const { goto } = useApp()
          const dotState = event.level === 'error' ? 'error' : event.level === 'warn' ? 'warning' : 'idle'
          return h('div', { className: 'ph-event', 'data-level': event.level },
            h('span', { className: 'ph-event-dot' }, h(StateDot, { state: dotState, size: 7 })),
            h('div', { className: 'ph-event-main' },
              h('p', { className: 'ph-event-msg' }, event.message),
              h('div', { className: 'ph-event-meta' },
                h('span', null, t(`group_${event.kind.split('.')[0]}`) || event.kind),
                event.sessionId ? h(React.Fragment, null,
                  h('span', { 'aria-hidden': true }, '·'),
                  h('button', { type: 'button', className: 'ph-textlink', title: t('runActivity'), onClick: () => goto('activity', { sessionId: event.sessionId }) }, event.sessionId.replace(/^session-/, '').slice(0, 8)),
                  canOpen() ? h('button', { type: 'button', className: 'ph-textlink', onClick: () => openSession(event.sessionId) }, t('openSession')) : null) : null),
              event.kind === 'api.dispatch' && event.detail
                ? h(JsonBlock, { label: t('apiResult'), payload: event.detail, defaultOpen: false, truncatedLabel: t('truncated') })
                : null),
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
          return h('div', { className: 'ph-stack' },
            h('div', { className: 'ph-filters' },
              h(SearchBox, { value: q, onChange: setQ, placeholder: t('searchActivity'), inputRef }),
              h('label', null, h('span', { className: 'ph-sr' }, t('group')),
                h('select', { className: 'ph-select', value: group, onChange: e => setGroup(e.target.value) },
                  GROUPS.map(key => h('option', { key, value: key }, key === 'all' ? `${t('group')}: ${t('filter_all')}` : t(`group_${key}`))))),
              h('label', null, h('span', { className: 'ph-sr' }, t('level')),
                h('select', { className: 'ph-select', value: level, onChange: e => setLevel(e.target.value) },
                  h('option', { value: 'all' }, `${t('level')}: ${t('filter_all')}`),
                  h('option', { value: 'problems' }, t('level_problems')))),
              h(Button, {
                size: 'sm', variant: 'ghost', className: 'ph-danger-text',
                disabled: !data || data.total === 0,
                onClick: () => confirm({
                  title: t('clearActivityTitle'), text: t('clearActivityText'), confirmLabel: t('clear'), destructive: true,
                  onConfirm: () => op({ action: 'clear-activity' }),
                }),
              }, t('clearActivity'))),
            sessionId ? h('div', { className: 'ph-chips' },
              h('button', { type: 'button', className: 'ph-chip', 'aria-pressed': true, onClick: () => setSessionId(''), title: t('clearFilters') },
                `${t('session')}: ${sessionId.replace(/^session-/, '').slice(0, 8)}`,
                h(IconCloseOutlineRegular, { size: 10 }))) : null,
            res.error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' },
              h(IconWarningTriangleOutlineRegular, { size: 14 }),
              h('p', { className: 'ph-banner-body' }, res.error),
              h(Button, { size: 'sm', variant: 'outline', onClick: () => res.reload() }, t('retry'))) : null,
            data && data.total === 0
              ? h('div', { className: 'ph-empty' },
                h('p', null, filtered ? t('noMatches') : t('noActivity')),
                filtered ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setQ(''); setLevel('all'); setGroup('all'); setSessionId('') } }, t('clearFilters')) : null)
              : data ? h('section', { className: 'ph-box', 'aria-busy': res.loading },
                data.items.map(event => h(EventRow, { key: event.id, event }))) : null,
            h(Pager, { data, onPage: setPage, onSize: setSize }))
        }

        function SetupTab({ data }) {
          const { copy } = useApp()
          const mode = data.defaultModeId ?? data.modes[0]?.id ?? '<mode>'
          const snippet = `run:\n  target: { daemon: ${data.slug ?? '<daemon>'}, cwd: /path/to/project }\n  agent:\n    provider: dsh\n    model: <provider>/<model>   # optional\n    mode: ${mode}\n  prompt: Describe the task.`
          const toolbarLabels = { copy: t('copy'), copied: t('copied'), wrap: t('wrap'), unwrap: t('unwrap') }
          return h('div', { className: 'ph-stack' },
            h('section', { className: 'ph-box', 'aria-labelledby': 'ph-modes' },
              h('div', { className: 'ph-box-head' },
                h('div', { className: 'ph-box-title' },
                  h('h2', { id: 'ph-modes' }, t('modes')),
                  h(Tag, { tone: 'neutral' }, data.modes.length)),
                h('span', { className: 'ph-note' }, t('modesHint'))),
              !data.presetsAvailable || data.modes.length === 0
                ? h('div', { className: 'ph-box-pad' },
                  h('div', { className: 'ph-banner', 'data-tone': 'warn' },
                    h(IconWarningTriangleOutlineRegular, { size: 14 }),
                    h('p', { className: 'ph-banner-body' }, t('noPresets'))))
                : h('div', null, data.modes.map(entry => h('div', { key: entry.id, className: 'ph-mode' },
                  h('div', { className: 'ph-mode-main' },
                    h('b', null, entry.label),
                    entry.label === entry.id && entry.preset === entry.id ? null : h('span', null, entry.preset === entry.id ? entry.id : `${entry.id} → ${entry.preset}`)),
                  entry.id === data.defaultModeId ? h(Tag, { tone: 'info' }, t('defaultMode')) : null,
                  h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCopyOutlineRegular, { size: 13 }), 'aria-label': `${t('copy')} ${entry.id}`, title: t('copy'), onClick: () => copy(entry.id) }))))),

            h('section', { className: 'ph-box ph-box-pad', 'aria-labelledby': 'ph-snippet' },
              h('div', { className: 'ph-box-title' }, h('h2', { id: 'ph-snippet' }, t('triggerYaml'))),
              h('p', { className: 'ph-note' }, t('triggerHint')),
              h(CodeBlock, { code: snippet, lang: 'yaml', copyLabel: t('copy'), copiedLabel: t('copied'), toolbarLabels })),

            h('section', { className: 'ph-box ph-box-pad', 'aria-labelledby': 'ph-settings' },
              h('div', { className: 'ph-box-title' }, h('h2', { id: 'ph-settings' }, t('settings'))),
              h('dl', { className: 'ph-facts-grid', style: { borderTop: 0, paddingTop: 0 } },
                h('div', { className: 'ph-fact' }, h('dt', null, t('agentPreset')), h('dd', null, data.config?.agentPreset ?? t('deploymentDefault'))),
                h('div', { className: 'ph-fact' }, h('dt', null, t('listWorkspaces')), h('dd', null, data.config?.listWorkspaces ? t('yes') : t('no')))),
              h('p', { className: 'ph-note' }, t('settingsHint'))))
        }

        async function apiRequest(args) {
          const res = await fetch('paseo-hub/api', { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify(args) })
          let result
          try { result = await res.json() } catch { throw new Error(tf('badResponse', { status: res.status })) }
          if (!res.ok) {
            const issues = (result.issues ?? []).map(issue => `${(issue.path ?? []).join('.')}: ${issue.message}`)
            throw new Error([result.message ?? `HTTP ${res.status}`, result.requiredScope, ...issues, result.requestId ? `requestId: ${result.requestId}` : ''].filter(Boolean).join('\n'))
          }
          return result
        }

        function ApiConsole({ data }) {
          const { confirm, copy, nonce, goto } = useApp()
          const [saved, setSaved] = React.useState(data.api ?? { configured: false })
          const [showConfig, setShowConfig] = React.useState(() => !data.api?.configured)
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
          const [selectedTrigger, setSelectedTrigger] = React.useState(null)
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
          const [deliveryKey, setDeliveryKey] = React.useState(() => {
            try { return sessionStorage.getItem('paseo-hub:deliveryKey') || randomUuid() } catch { return randomUuid() }
          })
          React.useEffect(() => {
            try { sessionStorage.setItem('paseo-hub:deliveryKey', deliveryKey) } catch {}
          }, [deliveryKey])
          const [bundle, setBundle] = React.useState('{\n  "projectSlug": "default",\n  "files": []\n}')
          const [validatedBundle, setValidatedBundle] = React.useState(null)
          const inputRef = React.useRef(null)
          useSlashFocus(inputRef)

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
            setSelectedTrigger(null)
            setEditor(true); setValidated(null); setResult(null)
            setYaml(`name: manual-task\nenabled: true\non:\n  manual.run: {}\nrun:\n  target: { daemon: ${data.slug ?? 'my-daemon'}, cwd: /path/to/project }\n  agent:\n    provider: dsh\n    mode: ${data.defaultModeId ?? 'workspace-write'}\n  prompt: "Complete the task and call hub.finish_execution."\n  max_runtime: 1h\n  idle_timeout: 5m\n`)
          }
          const openTrigger = item => job(async () => {
            const value = await apiRequest({ action: 'get-trigger', name: item.id })
            setSelectedTrigger(item)
            setYaml(value.trigger.yaml)
            setValidated(null)
            setEditor(true)
            setResult(null)
          })
          const save = e => {
            e.preventDefault()
            void job(async () => {
              const value = await apiRequest({ action: 'configure', origin, apiKey, toolWrites })
              setSaved(value); setApiKey(''); setResult(null); setResource(null); setProjects([]); setValidated(null); setValidatedBundle(null); setShowConfig(false); setNotice(t('apiSaved'))
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
          const rotateWebhookSecret = () => {
            if (!selectedTrigger) return
            confirm({
              title: t('apiRotateWebhookSecretTitle'),
              text: `${saved.origin}\n${selectedTrigger.name}\n${t('apiRotateWebhookSecretText')}`,
              confirmLabel: t('apiRotateWebhookSecret'),
              destructive: true,
              onConfirm: () => job(async () => {
                setResult(await apiRequest({ action: 'rotate-webhook-secret', triggerId: selectedTrigger.id }))
                setNotice(t('apiWebhookSecretRotated'))
              }),
            })
          }
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

          const sectionItems = ['triggers', 'dispatch', 'resources', 'legacy'].map(key => ({
            id: `ph-api-tab-${key}`, panelId: 'ph-api-panel', value: key, label: t(`api_${key}`),
          }))

          return h('div', { className: 'ph-stack' },
            h('p', { className: 'ph-note' }, t('apiIntro')),
            h('section', { className: 'ph-hero', 'aria-label': t('apiCredentials') },
              h('div', { className: 'ph-hero-top' },
                h('div', { className: 'ph-hero-title' },
                  h('div', { className: 'ph-hero-row' },
                    h('h2', { className: 'ph-hero-h2' }, t('apiCredentials')),
                    h(StatusTag, { tone: saved.configured ? 'success' : 'outline', dotState: saved.configured ? 'done' : 'idle' }, saved.configured ? t('apiConfigured') : t('apiNotConfigured')),
                    saved.configured && saved.toolWrites ? h(Tag, { tone: 'warning' }, t('apiWritesEnabled')) : null),
                  saved.configured ? h('span', { className: 'ph-note' }, saved.origin) : null),
                h('div', { className: 'ph-actions' },
                  saved.configured ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => void check() }, t('apiCheck')) : null,
                  h(Button, {
                    size: 'sm', variant: showConfig ? 'outline' : 'ghost',
                    icon: h(IconSettingsOutlineRegular, { size: 13 }),
                    'aria-expanded': showConfig,
                    onClick: () => setShowConfig(v => !v),
                  }, t(showConfig ? 'apiHideConfigure' : 'apiConfigure')))),
              showConfig ? h('form', { className: 'ph-form ph-form-narrow', onSubmit: save, style: { paddingTop: 10, borderTop: '.5px solid var(--dsw-alias-border-l1)' } },
                h('p', { className: 'ph-note' }, t('apiKeyHintLong')),
                h('div', { className: 'ph-field' },
                  h('label', { htmlFor: 'ph-api-origin' }, t('origin')),
                  h(Input, { id: 'ph-api-origin', type: 'url', required: true, value: origin, placeholder: 'https://hub.example.com', onChange: e => setOrigin(e.target.value) })),
                h('div', { className: 'ph-field' },
                  h('label', { htmlFor: 'ph-api-key' }, t('apiKeyLabel')),
                  h(Input, {
                    id: 'ph-api-key', type: 'password', autoComplete: 'new-password', value: apiKey,
                    required: !saved.configured || origin.replace(/\/$/, '') !== saved.origin,
                    placeholder: saved.configured ? t('apiKeyUnchanged') : '',
                    onChange: e => setApiKey(e.target.value),
                  })),
                h('div', { className: 'ph-switch-row' },
                  h('div', { className: 'ph-switch-copy' },
                    h('strong', null, t('apiToolWrites')),
                    h('span', { className: 'ph-note' }, t('apiToolHint'))),
                  h(Switch, { checked: toolWrites, onChange: setToolWrites, label: t('apiToolWrites') })),
                h('div', { className: 'ph-actions' },
                  h(Button, { type: 'submit', size: 'sm', variant: 'primary', disabled: busy }, t('apiSave')),
                  saved.configured ? h(Button, {
                    size: 'sm', variant: 'ghost', className: 'ph-danger-text', disabled: busy,
                    onClick: () => confirm({
                      title: t('apiForgetTitle'), text: t('apiForgetText'), confirmLabel: t('apiForget'), destructive: true,
                      onConfirm: () => job(async () => { setSaved(await apiRequest({ action: 'forget-key' })); setApiKey(''); setResult(null); setResource(null); setProjects([]); setShowConfig(true) }),
                    }),
                  }, t('apiForget')) : null)) : null),

            error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' },
              h(IconWarningTriangleOutlineRegular, { size: 14 }),
              h('pre', { className: 'ph-banner-body' }, error),
              h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCloseOutlineRegular, { size: 12 }), 'aria-label': t('cancel'), onClick: () => setError(null) })) : null,

            notice ? h('div', { className: 'ph-banner', 'data-tone': 'ok', role: 'status' },
              h('p', { className: 'ph-banner-body' }, notice),
              h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCloseOutlineRegular, { size: 12 }), 'aria-label': t('cancel'), onClick: () => setNotice('') })) : null,

            saved.configured ? h(React.Fragment, null,
              h(SegmentedTabs, {
                size: 'sm',
                label: t('apiSections'),
                value: section,
                onChange: next => { setSection(next); setError(null); setResult(null); setNotice('') },
                items: sectionItems,
              }),

              h('div', { id: 'ph-api-panel', role: 'tabpanel', className: 'ph-stack' },
                section === 'triggers' ? h('div', { className: 'ph-api-split' },
                  h('aside', { className: 'ph-api-rail' },
                    h('div', { className: 'ph-filters' },
                      h(SearchBox, { value: query, onChange: setQuery, inputRef, placeholder: t('apiSearch') }),
                      h(Button, { size: 'sm', variant: 'outline', icon: h(IconRefreshOutlineRegular, { size: 13 }), disabled: busy, title: t('refresh'), 'aria-label': t('refresh'), onClick: () => void job(reloadList) }),
                      h(Button, { size: 'sm', variant: 'primary', icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: busy, onClick: makeTemplate }, t('apiNew'))),
                    list && list.total === 0 ? h('div', { className: 'ph-empty' }, h('p', null, t('noMatches'))) : null,
                    list && list.items.length > 0 ? h('ul', { className: 'ph-trig-list' }, list.items.map(item => h('li', { key: item.id },
                      h('button', {
                        type: 'button', className: 'ph-trig-item', disabled: busy,
                        'aria-current': selectedTrigger?.id === item.id || undefined,
                        onClick: () => void openTrigger(item),
                      },
                      h('div', { className: 'ph-trig-body' },
                        h('span', { className: 'ph-trig-name' }, item.name),
                        h('span', { className: 'ph-note' }, item.format)),
                      h(Tag, { tone: item.enabled ? 'success' : 'outline' }, item.enabled ? t('apiEnabled') : t('apiDisabled')))))) : null,
                    h(Pager, { data: list, onPage: setPage, onSize: size => { setPageSize(size); setPage(1) } })),

                  editor ? h('section', { className: 'ph-box ph-box-pad' },
                    h('div', { className: 'ph-hero-top' },
                      h('div', { className: 'ph-box-title' },
                        h('h3', null, selectedTrigger ? selectedTrigger.name : t('apiYaml')),
                        validated === yaml && yaml.trim() ? h(Tag, { tone: 'success' }, t('apiValidated')) : null),
                      h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCopyOutlineRegular, { size: 13 }), disabled: busy, onClick: () => copy(yaml) }, t('copy'))),
                    h('textarea', { className: 'ph-editor', 'aria-label': t('apiYaml'), value: yaml, spellCheck: false, disabled: busy, onChange: e => { setYaml(e.target.value); setValidated(null) } }),
                    h('p', { className: 'ph-note' }, t('apiYamlHint')),
                    h('div', { className: 'ph-actions' },
                      h(Button, { size: 'sm', variant: 'outline', disabled: busy || !yaml.trim(), onClick: () => void validate() }, t('apiValidate')),
                      h(Button, { size: 'sm', variant: 'primary', disabled: busy || validated !== yaml, onClick: install }, t('apiInstall')),
                      selectedTrigger && /\bwebhook\.received\b/u.test(yaml)
                        ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: rotateWebhookSecret }, t('apiRotateWebhookSecret'))
                        : null))
                    : h('div', { className: 'ph-empty' },
                      h('p', null, t('apiSelectHint')),
                      h(Button, { size: 'sm', variant: 'outline', icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: busy, onClick: makeTemplate }, t('apiNew')))) : null,

                section === 'dispatch' ? h('section', { className: 'ph-box ph-box-pad' },
                  h('p', { className: 'ph-note' }, t('apiDispatchHint')),
                  h('form', { className: 'ph-form', onSubmit: dispatch },
                    h('div', { className: 'ph-form-grid' },
                      h('div', { className: 'ph-field' },
                        h('label', { htmlFor: 'ph-disp-proj' }, t('apiProject')),
                        h('div', { className: 'ph-inline-row' },
                          h(Input, { id: 'ph-disp-proj', required: true, value: projectSlug, list: 'ph-api-projects', onChange: e => setProjectSlug(e.target.value) }),
                          h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => void readResource('projects') }, t('apiLoadProjects'))),
                        h('datalist', { id: 'ph-api-projects' }, projects.map(p => h('option', { key: p.id, value: p.slug }, p.name)))),
                      h('div', { className: 'ph-field' },
                        h('label', { htmlFor: 'ph-disp-trig' }, t('apiTrigger')),
                        h(Input, { id: 'ph-disp-trig', required: true, value: trigger, onChange: e => setTrigger(e.target.value) })),
                      h('div', { className: 'ph-field' },
                        h('label', { htmlFor: 'ph-disp-actor' }, t('apiActor')),
                        h(Input, { id: 'ph-disp-actor', required: true, value: actor, onChange: e => setActor(e.target.value) })),
                      h('div', { className: 'ph-field' },
                        h('label', { htmlFor: 'ph-disp-rev' }, t('apiRevision')),
                        h(Input, { id: 'ph-disp-rev', className: 'ph-mono-input', value: expectedVersionId, onChange: e => setExpectedVersionId(e.target.value) }))),
                    h('div', { className: 'ph-field' },
                      h('label', { htmlFor: 'ph-disp-input' }, t('apiInput')),
                      h('textarea', { id: 'ph-disp-input', className: 'ph-editor ph-editor-short', value: input, onChange: e => setInput(e.target.value) })),
                    h('div', { className: 'ph-switch-row' },
                      h('div', { className: 'ph-switch-copy' }, h('strong', null, t('apiInputJson'))),
                      h(Switch, { checked: inputJson, onChange: setInputJson, label: t('apiInputJson') })),
                    h('div', { className: 'ph-field' },
                      h('label', { htmlFor: 'ph-disp-dk' }, t('apiDeliveryKey')),
                      h('div', { className: 'ph-inline-row' },
                        h(Input, { id: 'ph-disp-dk', className: 'ph-mono-input', required: true, value: deliveryKey, onChange: e => setDeliveryKey(e.target.value) }),
                        h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => { setDeliveryKey(randomUuid()); setResult(null) } }, t('apiNewDeliveryKey'))),
                      h('p', { className: 'ph-note' }, t('apiDeliveryHint'))),
                    h('div', { className: 'ph-actions' },
                      h(Button, { type: 'submit', size: 'sm', variant: 'primary', disabled: busy }, t('apiDispatch'))))) : null,

                section === 'resources' ? h('section', { className: 'ph-box ph-box-pad' },
                  h('div', { className: 'ph-actions' }, ['projects', 'resources', 'setup-resources'].map(action =>
                    h(Button, { key: action, size: 'sm', variant: 'outline', disabled: busy, onClick: () => void readResource(action) }, t(`apiRead_${action}`)))),
                  h('p', { className: 'ph-note' }, t('apiResourceHint')),
                  resource ? h(JsonBlock, { label: t('api_resources'), payload: resource, defaultOpen: true, truncatedLabel: t('truncated') }) : null) : null,

                section === 'legacy' ? h('section', { className: 'ph-box ph-box-pad' },
                  h('p', { className: 'ph-note' }, t('apiLegacyHint')),
                  h('textarea', { className: 'ph-editor', 'aria-label': t('apiLegacyBundle'), spellCheck: false, value: bundle, disabled: busy, onChange: e => { setBundle(e.target.value); setValidatedBundle(null) } }),
                  h('div', { className: 'ph-actions' },
                    h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => void job(async () => { const args = JSON.parse(bundle); setValidatedBundle(null); setResult(await apiRequest({ ...args, action: 'validate-configuration' })); setValidatedBundle(bundle); setNotice(t('apiValid')) }) }, t('apiValidate')),
                    h(Button, { size: 'sm', variant: 'primary', disabled: busy || validatedBundle !== bundle, onClick: () => confirm({ title: t('apiInstallTitle'), text: `${saved.origin}\n${t('apiLegacyInstallText')}`, confirmLabel: t('apiInstall'), onConfirm: () => job(async () => { setResult(await apiRequest({ ...JSON.parse(bundle), action: 'install-configuration' })); setNotice(t('apiInstalled')) }) }) }, t('apiInstall')))) : null)) : null,

            result ? h('section', { className: 'ph-box ph-box-pad' },
              h('div', { className: 'ph-hero-top' },
                h('div', { className: 'ph-box-title' }, h('h3', null, t('apiResult'))),
                h('div', { className: 'ph-actions' },
                  h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCopyOutlineRegular, { size: 13 }), onClick: () => copy(JSON.stringify(result, null, 2)) }, t('copy')),
                  h(Button, { size: 'sm', variant: 'ghost', onClick: () => goto('activity') }, t('apiViewActivity')))),
              h(JsonBlock, { label: t('apiResult'), payload: result, defaultOpen: true, truncatedLabel: t('truncated') })) : null)
        }

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
          return h('section', { className: 'ph-hero', 'aria-labelledby': 'ph-signin' },
            h('div', { className: 'ph-hero-title' },
              h('h2', { className: 'ph-hero-h2', id: 'ph-signin' }, t('signInTitle')),
              h('p', { className: 'ph-note' }, t('introLong'))),
            h('form', { className: 'ph-form ph-form-narrow', onSubmit: submit },
              h('div', { className: 'ph-field' },
                h('label', { htmlFor: 'ph-signin-origin' }, t('origin')),
                h(Input, { id: 'ph-signin-origin', type: 'url', required: true, placeholder: 'https://hub.example.com', value: origin, autoComplete: 'url', onChange: e => setOrigin(e.target.value) }),
                h('span', { className: 'ph-note' }, t('originHint'))),
              h('div', { className: 'ph-field' },
                h('label', { htmlFor: 'ph-signin-key' }, t('apiKey')),
                h(Input, { id: 'ph-signin-key', type: 'password', value: apiKey, autoComplete: 'off', onChange: e => setApiKey(e.target.value) }),
                h('span', { className: 'ph-note' }, t('apiKeyHint'))),
              error || data.lastError ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' },
                h(IconWarningTriangleOutlineRegular, { size: 14 }),
                h('p', { className: 'ph-banner-body' }, error ?? data.lastError)) : null,
              h('div', { className: 'ph-actions' },
                h(Button, { type: 'submit', variant: 'primary', disabled: !origin.trim() || busy, 'aria-busy': busy }, t('signIn')))))
        }

        function Pending({ data }) {
          const { op, copy } = useApp()
          const login = data.login
          if (login?.method !== 'browser') {
            return h('section', { className: 'ph-hero', 'aria-live': 'polite' },
              h('div', { className: 'ph-hero-top' },
                h(StatusTag, { tone: 'warning', dotState: 'ongoing' }, t(login?.method === 'starting' ? 'signingIn' : 'enrolling')),
                login?.method === 'starting' ? h(Button, { size: 'sm', variant: 'outline', onClick: () => void op({ action: 'cancel-sign-in' }) }, t('cancel')) : null))
          }
          return h('section', { className: 'ph-hero', 'aria-live': 'polite', 'aria-labelledby': 'ph-pending' },
            h('div', { className: 'ph-hero-row' },
              h('h2', { className: 'ph-hero-h2', id: 'ph-pending' }, t('signingIn')),
              h(StatusTag, { tone: 'warning', dotState: 'ongoing' }, t('state_signing_in'))),
            h('p', { className: 'ph-note' }, t('code')),
            h('div', null,
              h('div', { className: 'ph-usercode-box' },
                h('p', { className: 'ph-usercode' }, login.userCode),
                h(Button, { size: 'sm', variant: 'ghost', icon: h(IconCopyOutlineRegular, { size: 14 }), 'aria-label': t('copyCode'), title: t('copyCode'), onClick: () => copy(login.userCode) }))),
            h('dl', { className: 'ph-facts-grid' },
              h('div', { className: 'ph-fact' }, h('dt', null, t('hub')), h('dd', null, login.origin)),
              h('div', { className: 'ph-fact' }, h('dt', null, t('expires')), h('dd', { title: fmt(login.expiresAt) }, ago(login.expiresAt)))),
            h('div', { className: 'ph-actions' },
              h('a', { className: 'ph-extbtn', 'data-primary': 'true', href: login.verificationUriComplete, target: '_blank', rel: 'noreferrer' },
                t('openApproval'), h(IconRightUpOutlineRegular, { size: 13 })),
              h(Button, { variant: 'outline', onClick: () => void op({ action: 'cancel-sign-in' }) }, t('cancel'))))
        }

        const TABS = ['overview', 'runs', 'activity', 'api', 'setup']

        function HubPage() {
          useLocale()
          const [nonce, setNonce] = React.useState(0)
          const [fast, setFast] = React.useState(false)
          const state = useResource('paseo-hub/state', { n: nonce }, fast)
          const data = state.data
          React.useEffect(() => setFast(data?.state === 'signing_in' || data?.state === 'connecting'), [data?.state])
          const [tab, setTab] = React.useState(() => (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('paseo-hub:tab') : null) || 'overview')
          const [tabArgs, setTabArgs] = React.useState(null)
          const [dialog, setDialog] = React.useState(null)
          const [toast, setToast] = React.useState(null)
          const [, tick] = React.useReducer(n => n + 1, 0)
          React.useEffect(() => {
            const id = setInterval(() => {
              if (typeof document === 'undefined' || document.visibilityState === 'visible') tick()
            }, 30_000)
            return () => clearInterval(id)
          }, [])
          React.useEffect(() => {
            if (!toast) return undefined
            const ms = toast.tone === 'error' ? 5000 : 2200
            const id = setTimeout(() => setToast(null), ms)
            return () => clearTimeout(id)
          }, [toast])

          const refresh = React.useCallback(() => setNonce(n => n + 1), [])
          const app = React.useMemo(() => {
            const op = async payload => {
              try {
                await request('paseo-hub/op', { method: 'POST', body: JSON.stringify(payload) })
                refresh()
                return null
              } catch (error) {
                const message = String(error?.message ?? error)
                setToast({ tone: 'error', text: `${t('opFailed')}: ${message}` })
                return message
              }
            }
            return {
              nonce,
              op,
              runOp: async (action, sessionId) => { const failed = await op({ action, sessionId }); if (!failed) setToast({ tone: 'ok', text: t('done') }); return failed },
              confirm: setDialog,
              copy: async text => {
                try { await navigator.clipboard.writeText(text); setToast({ tone: 'ok', text: t('copied') }) } catch { setToast({ tone: 'error', text: t('opFailed') }) }
              },
              goto: (next, args = null) => { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('paseo-hub:tab', next); setTab(next); setTabArgs(args) },
            }
          }, [nonce, refresh])

          const enrolled = data?.daemonId != null
          const current = TABS.includes(tab) ? tab : 'overview'
          const tabItems = data ? TABS.map(key => ({
            id: `ph-tab-${key}`,
            panelId: 'ph-tabpanel',
            value: key,
            label: key === 'runs' && data.stats.running > 0 ? `${t(`tab_${key}`)} (${data.stats.running})` : t(`tab_${key}`),
          })) : []

          return h(Ctx.Provider, { value: app }, h('div', { className: 'ph-page' },
            h('div', { className: 'ph-inner' },
              h('header', { className: 'ph-head' },
                h('div', { className: 'ph-heading' },
                  h('div', { className: 'ph-titlerow' },
                    h('h1', { className: 'ph-h1' }, t('panel')),
                    data ? h(StatusTag, { tone: STATE_TONE[data.state], dotState: STATE_DOT[data.state], title: data.lastError ?? undefined }, t(`state_${data.state}`)) : null),
                  h('p', { className: 'ph-intro' }, t('intro'))),
                h('div', { className: 'ph-toolbar' },
                  state.at ? h('span', { className: 'ph-updated', title: fmt(state.at) }, tf('updated', { time: ago(state.at) })) : null,
                  h(Button, { size: 'sm', variant: 'outline', icon: h(IconRefreshOutlineRegular, { size: 13 }), 'aria-label': t('refresh'), title: t('refresh'), onClick: refresh }, t('refresh')))),
              state.error ? h('div', { className: 'ph-banner', 'data-tone': 'error', role: 'alert' },
                h(IconWarningTriangleOutlineRegular, { size: 14 }),
                h('p', { className: 'ph-banner-body' }, `${t('loadFailed')}: ${state.error}`),
                h(Button, { size: 'sm', variant: 'outline', onClick: refresh }, t('retry'))) : null,
              data ? h(SegmentedTabs, {
                size: 'sm',
                label: t('tabsLabel'),
                value: current,
                onChange: next => app.goto(next),
                items: tabItems,
              }) : null,
              data && current === 'overview' && !enrolled && data.state === 'signing_in' ? h(Pending, { data }) : null,
              data && current === 'overview' && !enrolled && data.state !== 'signing_in' ? h(SignIn, { data }) : null,
              data ? h('div', { id: 'ph-tabpanel', role: 'tabpanel', 'aria-labelledby': `ph-tab-${current}`, className: 'ph-stack' },
                current === 'overview' && enrolled ? h(Overview, { data, goto: app.goto }) : null,
                current === 'runs' ? h(RunsTab, { initial: tabArgs }) : null,
                current === 'activity' ? h(ActivityTab, { initial: tabArgs }) : null,
                current === 'api' ? h(ApiConsole, { data }) : null,
                current === 'setup' ? h(SetupTab, { data }) : null) : null,
              toast ? h('div', { className: 'ph-toast', role: toast.tone === 'error' ? 'alert' : 'status' }, toast.text) : null),
            dialog ? h(ConfirmModal, { ...dialog, onClose: () => setDialog(null) }) : null))
        }

        function parseHubCall(phase, block) {
          const settled = phase === 'result' && block && 'kind' in block
          const call = settled ? block.call : block
          let args = {}
          try {
            const parsed = JSON.parse(call?.argsRaw ?? '{}')
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed
          } catch {}
          const text = settled && Array.isArray(block.content)
            ? block.content.filter(item => item.type === 'text').map(item => item.text).join('\n') : ''
          let payload = null
          if (text) { try { payload = JSON.parse(text) } catch {} }
          const action = typeof args.action === 'string' ? args.action : block?.args?.text?.('action') ?? ''
          const failed = settled && (block.isError || payload?.ok === false)
          const state = phase === 'preparing' ? 'preparing'
            : !settled ? 'running'
              : block.error?.code === 'interrupted' ? 'stopped'
                : failed ? 'error' : 'ok'
          return { state, action, args, payload, text }
        }

        function hubSummary(parsed) {
          if (parsed.state === 'error') {
            return parsed.payload?.message || parsed.payload?.error || parsed.text.split('\n')[0] || ''
          }
          const { args, payload } = parsed
          const parts = []
          const target = args.trigger || args.name || args.triggerId || args.projectSlug || args.query
          if (typeof target === 'string' && target) parts.push(target)
          if (payload && typeof payload === 'object') {
            if (typeof payload.triggerRunId === 'string') parts.push(`run ${payload.triggerRunId.slice(0, 8)}`)
            else if (typeof payload.path === 'string') parts.push(payload.path)
            else if (typeof payload.total === 'number') parts.push(`${payload.total}`)
            else if (Array.isArray(payload.items)) parts.push(`${payload.items.length}`)
            else if (typeof payload.valid === 'boolean') parts.push(payload.valid ? 'valid' : 'invalid')
            else if (typeof payload.configured === 'boolean') parts.push(payload.configured ? 'configured' : 'unconfigured')
          }
          return parts.join(' · ')
        }

        function HubToolRow({ toolName, phase, block, inspect, useDisclosure }) {
          const { expanded, toggle } = useDisclosure()
          const parsed = parseHubCall(phase, block)
          const running = parsed.state === 'preparing' || parsed.state === 'running'
          const write = toolName === 'paseo_hub_write'
          const detail = parsed.state === 'stopped' ? t('tvStopped') : hubSummary(parsed)
          const summary = parsed.state === 'error' || parsed.state === 'stopped' ? detail : [parsed.action, detail].filter(Boolean).join(' · ')
          const inputText = Object.keys(parsed.args).length > 0 ? JSON.stringify(parsed.args, null, 2) : ''
          const outputText = parsed.payload !== null ? JSON.stringify(parsed.payload, null, 2) : parsed.text
          const expandable = parsed.state !== 'preparing' && Boolean(inputText || outputText)
          const open = expanded && expandable
          return h('div', { className: 'ph-tv', 'data-tool': toolName, 'data-state': parsed.state },
            h(DisclosureRow, {
              rowClassName: 'ph-tv-row',
              icon: write ? h(IconPlayOutlineRegular, { size: 14 }) : h(IconApiOutlineRegular, { size: 14 }),
              title: t(write ? 'tvWrite' : 'tvRead'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: parsed.state === 'preparing' || !summary ? null : h(React.Fragment, null,
                h('span', { className: 'ph-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `ph-tv-summary${parsed.state === 'error' ? ' is-err' : parsed.state === 'stopped' ? ' is-stop' : ''}` },
                  h(TextShimmer, null, summary))),
            },
            open ? h('div', { className: 'ph-tv-body' },
              h('div', { className: 'ph-tv-io' },
                inputText ? h('div', { className: 'ph-tv-io-sec' },
                  h('span', { className: 'ph-tv-io-label' }, t('tvInput')),
                  h('span', { className: 'ph-tv-io-text' }, inputText)) : null,
                inputText && outputText ? h('span', { className: 'ph-tv-io-div', 'aria-hidden': true }) : null,
                outputText ? h('div', { className: 'ph-tv-io-sec' },
                  h('span', { className: 'ph-tv-io-label' }, t('tvOutput')),
                  h('span', { className: 'ph-tv-io-text', 'data-error': parsed.state === 'error' || undefined }, outputText)) : null),
              inspect ? h('button', { type: 'button', className: 'ph-tv-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('tvInspect')) : null) : null))
        }

        for (const key of ['paseo_hub', 'paseo_hub_write']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview', key, locale: NS, priority: -10,
          }, HubToolRow))
        }

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, HubPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 45, locale: NS, label: () => t('panel'),
        }, ({ size }) => h(IconHub, { size: size ?? 16 })))
      },
    }
  },
})
