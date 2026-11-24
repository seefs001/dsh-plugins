# dsh-acp-workbench

把本机 ACP（Agent Client Protocol）CLI 接入 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH），在原生会话、时间线与子代理树内直接运行外部编码 Agent，默认预设 **Cursor**、**Antigravity** 与 **Claude Code**，支持添加任意兼容 ACP v1 的本机 CLI。

> **安全边界**：外部 CLI 使用自身的登录态、计费、工具集与文件权限，运行在 DSH 工具沙箱之外。插件会展示并转发 CLI 发起的权限和交互请求；切勿把密钥或令牌填入命令行参数。

## 执行模式与入口

| 入口 | 方式 | 适用场景 |
| --- | --- | --- |
| **会话内直接执行** | 在模型选择器选中 `acp-*` 提供方下的模型 | 将整条 DSH 会话交给外部 CLI，保留原生输入框、附件、停止按钮与消息时间线 |
| **跨引擎双向委派** | 原生 DSH 与任意 ACP CLI 共用聚合工具 `spawn_agent`、`list_providers`、`send_message`、`list_agents`、`read_agent_result`、`interrupt_agent` | 任意方向互相派生可续聊子会话（支持 `isolation: "worktree"` 隔离工作树），结果自动回流并在 2 秒静默窗口内批合并唤醒父 Agent |
| **ACP 工作台**（左侧栏） | 提供方与模型目录管理中心 | 配置本机 CLI 提供方、检测协议能力、拉取与筛选展示在 DSH 模型选择器中的模型 |

父代理用 `send_message` 给自己的 ACP 子代理补充要求时，回执只确认 DSH 已接收。正在运行的外部 CLI 不会被打断；补充要求留给下一次 ACP 请求。要改变当前请求，请由用户在工作台使用实时引导，且 CLI 必须声明支持该能力。

## 安装与配置

### 1. 安装插件

从 GitHub 安装到目标 profile（以 `web` 为例）：

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/acp-workbench"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/acp-workbench"
```

`cordis.patch.yml` 会自动注册插件，为原生 DSH 模型注册聚合委派工具（`spawn_agent`、`list_providers`、`read_agent_result`，搭配 DSH 内置 `send_message` / `list_agents` / `interrupt_agent`），并在连接外部 ACP CLI 时自动注入本机 Session-scoped MCP 桥接（`http` 优先，不支持时自动回退 `stdio`）。

### 2. 配置本机 CLI

1. 在终端完成目标 CLI 的安装与登录。
2. 打开侧栏 **ACP 工作台 → 提供方**，核对默认命令或点击 **新增提供方** 从内置预设模板（Cursor、Antigravity、Claude Code、Codex、Gemini CLI、OpenCode、GitHub Copilot）一键填入：

| ID | 名称 | 默认命令（优先 `~/.local/bin/` 或 `~/.bun/bin/`，否则取 `PATH`） | 默认参数 | 默认预置 |
| --- | --- | --- | --- | --- |
| `cursor` | Cursor | `cursor-agent` | `["acp"]` | 是 |
| `antigravity` | Antigravity | `agy` | `["acp"]` | 是 |
| `claude-code` | Claude Code | `claude-agent-acp` | `[]` | 是 |
| `codex` | Codex | `codex-acp` | `[]` | 模板 |
| `gemini` | Gemini CLI | `gemini` | `["--acp"]` | 模板 |
| `opencode` | OpenCode | `opencode` | `["acp"]` | 模板 |
| `copilot` | GitHub Copilot | `copilot` | `["--acp"]` | 模板 |

3. 在左侧选中提供方后，可直接在右侧顶部一键执行：
   - **刷新模型**：拉取全部可用模型及各自属性（Cursor 支持通过 `cursor/list_available_models` 一次性获取完整参数化模型目录），默认全部出现在 DSH 模型选择器中，可按关键词与能力标签筛选并隐藏不需要的模型。
   - **检查能力**：执行 ACP `initialize`，查看协议版本、登录方式与能力清单。
   - **CLI 配置**：按需展开编辑可执行文件、参数数组与探测工作目录。

## 核心功能

### 会话内直接执行

- **模型与属性选择**：主模型选择器展示所有可见模型及 `CLI default`，并原生支持逐模型思考强度（含将双思考项的 `Off` 合并进强度选择）。输入框右侧工具栏根据当前模型动态提供 `Mode`（Agent / Plan / Ask）、`Context`（如 300K / 1M）与 `Fast` 闪电开关，首轮发消息前也可预先配置。
- **CLI 设置浮层**：在模型菜单点击 **CLI 设置**，可在输入框上方切换 CLI 模式与配置项、打开右侧工作区面板（文件 / Git 改动 / 终端）、手动执行 CLI 命令，或连接/接续外部会话。
- **接续与复制 CLI 历史**：首条消息前打开 **CLI 设置 → 接续 CLI 会话**，可列出当前目录的历史会话；点 **在这里接续** 直接连接旧上下文，支持 `session/fork` 的 CLI 还可通过 **从副本继续** 复制最新历史到独立上下文。
- **`/cli:` 命令补全**：连接空闲时在行首输入 `/` 可从 CLI 分组插入 `/cli:<命令>`，发送后按普通文本交给外部 CLI。
- **原生时间线渲染**：推理、正文、图片、工具调用与结果、任务计划及嵌套子调用按时间顺序原生渲染进 DSH 对话流，保留历史会话中的旧执行轨迹折叠兼容。
- **审批与表单**：权限审批、提问、Claude `AskUserQuestion` 表单（`elicitation/create`）与计划审批均在输入框上方处理。仅当 DSH 会话显式使用完全访问预设（`danger-full-access` 且 `approval: never`）且 CLI 提供 `allow_once` 时自动放行单次请求，持久授权、提问与计划审批始终人工确认。

### 提供方与模型目录（ACP 工作台）

采用左侧提供方列表 + 右侧模型目录主区设计：

- **提供方概览与预设模板**：左侧显示各 CLI 提供方的可见/总模型数、已缓存订阅档位或峰值用量百分比、命令行预览与活跃连接状态；顶部 **新增提供方** 与 **CLI 配置** 内置常见 ACP CLI 预设模板，可一键填入默认命令与参数（已有同名 ID 时自动避重）。
- **订阅与用量卡片**：展示各提供方的登录状态、账号与订阅档位、按需刷新的配额窗口进度条与重置时间（Claude Code 通过 ACP `/usage` 与 `_claude/rateLimit`、Codex 通过 `codex app-server`、Cursor 通过 CLI `about`/`status`、Antigravity 通过 ACP 档位元信息），以及基于 DSH 本地记录的近 24 小时、近 7 天与累计会话/轮次统计。
- **模型目录筛选与可见性管理**：按名称/ID 搜索，支持按 `全部 / 已显示 / 已隐藏 / 思考 / Fast / 多上下文` 标签快速过滤，直观展示思考强度、上下文窗口、Fast、图片输入与输出上限，支持全部显示/全部隐藏与顶部未保存更改提示。
- **按需展开的配置与诊断**：命令行参数与工作目录覆盖收纳在可折叠的 **CLI 配置** 面板，协议能力与原始 JSON 诊断收纳在可关闭的 **检查能力** 面板，不干扰模型目录浏览。

## 上下文交接与恢复

- **上下文交接与恢复**（补充说明）：转发给外部 CLI 时会自动跳过 DSH 宿主专属的 `skill` 目录提醒，并将重复包含 JSON 与 `rendered_markdown` 的 Nowledge Mem 上下文快照折叠为 Markdown 正文；当第三方功能（如 `@deepseek-ai/dsh-timeline` 周期摘要）向 `acp-*` 路由发起带 `purpose` 的辅助补全请求时，可通过 `config.utilityProvider` / `config.utilityModel` / `config.utilityReasoningEffort`（或环境变量 `DSH_ACP_UTILITY_PROVIDER` / `DSH_ACP_UTILITY_MODEL` / `DSH_ACP_UTILITY_EFFORT`）透明回退到普通文本模型。
- 每个 DSH 会话与每个 ACP 提供方一一绑定；会话分叉会建立新的远端上下文。
- 首次接入或从普通 DSH 模型切回时，自动交接未同步的历史文本（上限 **200,000 字符**，超限报错）。
- 断线重连或冷子任务续聊优先调用 `session/resume`，不支持时回退 `session/load`；Host 重启后中断的轮次标记为 `interrupted`，不会自动重发。

## 存储与架构

外部绑定、配置与原始事件分块保存在 DSH Host 的 `acp_workbench` storage domain（`version: 1`，`per-record` 布局），DSH 原生消息由核心保存：

| 表名 | 用途 |
| --- | --- |
| `providers` | 提供方配置、隐藏模型清单与缓存的能力/模型/模式目录 |
| `sessions` | 外部会话绑定、`native` 关联与各轮运行摘要 |
| `chunks` | 原始 ACP 事件分块（每块 64 条，1000 ms 合并刷盘，大 diff 自动窗口裁剪；启动按 `chunkRetentionDays` / `archivedChunkRetentionDays` / `maxChunkBytes` 自动清理旧分块） |

| 模块 | 职责 |
| --- | --- |
| `lib/index.js` | Cordis 插件入口与 owner 鉴权 HTTP/SSE 接口（`/acp-workbench/*`） |
| `lib/transport.js` | 受管子进程 NDJSON JSON-RPC 传输、超时与优雅退出 |
| `lib/store.js` | `acp_workbench` 存储域管理、串行队列与分块分页 |
| `lib/manager.js` | 外部会话生命周期、能力探测、模型发现与交互仲裁 |
| `lib/native.js` | `acp-*` LLM 适配器、`SubagentProvider` 注册、上下文交接、逐模型属性下发与流式事件转换 |
| `lib/native-tools.js` | ACP 工具调用/结果/任务计划到 DSH 原生工具与 PTC 事件的映射 |
| `lib/models.js` | 参数化模型协议、Cursor 模型目录解析、双思考项合并与旧变体迁移 |
| `lib/trace.js` / `forms.js` / `notices.js` / `usage.js` / `subscription.js` / `activity.js` | 轨迹折叠、表单校验、提醒与用量投影、订阅配额探针与本地统计、活动状态汇总 |
| `lib/client.js` | 浏览器端界面组件（提供方与模型工作台、输入框快捷属性栏、CLI 设置与审批交互） |

## 开发检查

在仓库根目录运行：

```bash
pnpm install
pnpm run check
```

完整使用文档见 [在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/acp-workbench)。
