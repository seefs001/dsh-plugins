# dsh-acp-workbench

把本机 ACP（Agent Client Protocol）CLI 接入 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH），在原生会话、时间线与子代理树内直接运行外部编码 Agent，默认预设 **Cursor**、**Antigravity** 与 **Claude Code**，支持添加任意兼容 ACP v1 的本机 CLI。

> **安全边界**：外部 CLI 使用自身的登录态、计费、工具集与文件权限，运行在 DSH 工具沙箱之外。插件会展示并转发 CLI 发起的权限和交互请求；切勿把密钥或令牌填入命令行参数。

## 执行模式与入口

| 入口 | 方式 | 适用场景 |
| --- | --- | --- |
| **会话内直接执行** | 在模型选择器选中 `acp-*` 提供方下的模型 | 将整条 DSH 会话交给外部 CLI，保留原生输入框、附件、停止按钮与消息时间线 |
| **DSH 委派子任务** | 保留普通 DSH 主模型，调用 `subagent_cursor`、`subagent_antigravity` 或 `subagent_acp_claude_code` | 由 DSH 主模型拆解任务、并行委派并用 `send_message` 续聊，父会话直接审批 |
| **ACP 工作台**（左侧栏） | 分 **项目** / **活动** / **提供方** 三页 | 集中管理多项目会话、工作树、文件、终端、脚本、Git 审阅、定时任务与 CLI 配置 |

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

`cordis.patch.yml` 会自动注册插件及 `subagent_cursor`、`subagent_antigravity`、`subagent_acp_claude_code` 三个子代理工具（`subagent_acp_claude_code` 与 DSH 内置非 ACP 工具 `subagent_claude_code` 并存）。

### 2. 配置本机 CLI

1. 在终端完成目标 CLI 的安装与登录。
2. 打开侧栏 **ACP 工作台 → 提供方**，核对默认命令或新增提供方：

| ID | 名称 | 默认命令（优先 `~/.local/bin/`，否则取 `PATH`） | 默认参数 |
| --- | --- | --- | --- |
| `cursor` | Cursor | `cursor-agent` | `["acp"]` |
| `antigravity` | Antigravity | `agy` | `["acp"]` |
| `claude-code` | Claude Code | `claude-agent-acp` | `[]` |

3. 填写项目绝对路径后可按需执行：
   - **检查能力**：执行 ACP `initialize`，查看协议版本、登录方式与能力清单。
   - **刷新模型**：通过空会话读取候选模型与元信息（上下文窗口、输出上限、思考强度），勾选需要显示的模型并点击 **保存模型选择**。
   - **查找 CLI 会话**：通过 `session/list` 查看该目录下已有的 CLI 会话。

## 核心功能

### 会话内直接执行

- **模型与思考强度**：主模型选择器展示你勾选的模型及 `CLI default`。切换模型和思考强度时，插件在发消息前同步到 CLI（支持标准 `thought_level` 与 Cursor 变体）。
- **CLI 设置浮层**：在模型菜单点击 **CLI 设置**，可直接在输入框上方切换 CLI 模式与配置项、打开右侧工作区面板（文件 / Git 改动 / 终端）、手动执行 CLI 命令，或连接/接续外部会话。
- **接续与复制 CLI 历史**：首条消息前打开 **CLI 设置 → 接续 CLI 会话**，可列出当前目录的历史会话；点 **在这里接续** 直接连接旧上下文，支持 `session/fork` 的 CLI 还可通过 **从副本继续** 复制最新历史到独立上下文。
- **`/cli:` 命令补全**：连接空闲时在行首输入 `/` 可从 CLI 分组插入 `/cli:<命令>`，发送后按普通文本交给外部 CLI。
- **执行轨迹与折叠回复**：
  - 每轮回答旁的 **执行轨迹** 运行时默认展开、重开历史时默认折叠；支持 **概览**（合并连续读取/搜索/网页查阅）与 **逐条** 视图。
  - 区分写入文件与多文件补丁（支持按文件筛选）、流式终端输出（保留末尾 32 Ki 字符与退出码/信号）、MCP 结构化结果、网页工具来源，以及 Claude ACP 内部子任务下钻视图。
  - 展示任务清单与方案正文、上下文压缩摘要、会话提醒（最近 8 条）和窗口/累计 token 用量。
  - 轮次结束后支持在回复末尾一键 **收起结果 / 展开结果**。
- **审批与表单**：权限审批、提问、Claude `AskUserQuestion` 表单（`elicitation/create`）与计划审批均在输入框上方处理。仅当 DSH 会话显式使用完全访问预设（`danger-full-access` 且 `approval: never`）且 CLI 提供 `allow_once` 时自动放行单次请求，持久授权、提问与计划审批始终人工确认。

### 项目工作台（ACP 工作台 → 项目）

以 DSH 工作区为单位集中管理多 Agent 协作：

- **启动与共享工作树**：选择项目目录或独立工作树启动新 Agent，支持保存跨项目复用的 **启动配置**；托管工作树可开启多个共享同一份代码的 Agent，各自保留独立会话、CLI 上下文和审批，支持归档后 **重建缺失的工作树**。
- **会话与文件浏览**：支持按当前项目或全部项目检索会话、筛置顶与批量归档/恢复；按生效工作目录提供 **按名称查找** 与 **浏览目录**，可直接预览或跳到文件侧栏。
- **会话终端与 `paseo.json` 脚本**：实时查看会话保留终端；运行/停止 `paseo.json` 中的脚本，使用 `$PASEO_PORT` 的服务支持 **带回环端口启动**（`HOST=127.0.0.1`）与 TCP **监测端口**。
- **项目审阅与 Git 对比**：汇总待回应请求与各轮结果（**待审阅** / **全部结果**），集成 DSH Forge 对比工作树、暂存区、基线分支与连续提交范围，支持查看补丁新旧两侧文件。
- **定时任务**：创建延时、固定间隔、每日或 Cron 定时投递任务，支持投递到已有会话、首次新建后复用或每次新建。

### 活动索引（ACP 工作台 → 活动）

跨所有绑定按优先级分组展示：**等你回应**、**进行中**、**需查看**、**最近活动** 与 **历史**（已归档/已退役）。支持跳转原 DSH 会话、重命名、连接/断开、停止本轮、新建外部上下文，以及分页查看原始 RPC 事件。

## 上下文交接与恢复

- 每个 DSH 会话与每个 ACP 提供方一一绑定；会话分叉会建立新的远端上下文。
- 首次接入或从普通 DSH 模型切回时，自动交接未同步的历史文本（上限 **200,000 字符**，超限报错）。
- 断线重连或冷子任务续聊优先调用 `session/resume`，不支持时回退 `session/load`；Host 重启后中断的轮次标记为 `interrupted`，不会自动重发。

## 存储与架构

外部绑定、配置与原始事件分块保存在 DSH Host 的 `acp_workbench` storage domain（`version: 1`，`per-record` 布局），DSH 原生消息由核心保存：

| 表名 | 用途 |
| --- | --- |
| `providers` | 提供方配置、已勾选模型与缓存的能力/模型清单 |
| `sessions` | 外部会话绑定、`native` 关联与各轮运行摘要 |
| `chunks` | 原始 ACP 事件分块（每块 64 条，150 ms 合并刷盘） |
| `checkout_links` | 共享工作树参与会话的关联记录 |
| `scripts` | `paseo.json` 脚本最近一次运行状态与输出尾部（上限 8 KiB） |

| 模块 | 职责 |
| --- | --- |
| `lib/index.js` | Cordis 插件入口与 owner 鉴权 HTTP/SSE 接口（`/acp-workbench/*`） |
| `lib/transport.js` | 受管子进程 NDJSON JSON-RPC 传输、超时与优雅退出 |
| `lib/store.js` | `acp_workbench` 存储域管理、串行队列与分块分页 |
| `lib/manager.js` | 外部会话生命周期、能力探测、模型发现、会话列表与交互仲裁 |
| `lib/native.js` | `acp-*` LLM 适配器、`SubagentProvider` 注册、上下文交接与流式事件转换 |
| `lib/trace.js` / `models.js` / `forms.js` / `notices.js` / `usage.js` / `activity.js` | 轨迹折叠、模型变体映射、表单校验、提醒与用量投影、活动分组 |
| `lib/projects.js` / `checkouts.js` / `shared.js` / `project-files.js` / `scripts.js` / `service-ports.js` / `review.js` | 项目启动配置、工作树管理、文件检索浏览、脚本与端口探测、项目审阅 |
| `lib/client.js` | 浏览器端界面组件（共享一条 SSE 连接） |

## 开发检查

在仓库根目录运行：

```bash
pnpm install
pnpm run check
```

完整使用文档见 [在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/acp-workbench)。
