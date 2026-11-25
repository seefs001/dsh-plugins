# dsh-pi-tools（`pi` 预设）

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）新增独立的 `pi` Agent 预设：把 Pi 编程工具、系统提示词和 MoeJS `codemode` 沙箱接入 DSH 的会话、权限、沙箱、模型路由与 MCP 体系中，不影响默认预设和其他会话。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 运行环境中可用的 `rg` 与 `fd`（可通过 `rgCommand` / `fdCommand` 指定路径） |
| 数据保存 | 会话工具选择写入会话日志（`plugin:dsh-pi-tools/selection`）；预设级默认工具存于 Host `pi_tools_defaults` storage domain |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/pi-tools"
```

包内已附带 macOS、Linux、Windows 的 x64 与 arm64 `moejs` runner，安装时无需 Go 环境。

本地修改 runner 或升级 Pi 后运行 `pnpm --filter dsh-pi-tools build:runner`（需 Go 1.25+），打包前运行 `pnpm --filter dsh-pi-tools build:runner:all` 更新六平台产物。开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/pi-tools"
```

安装后在「新建会话」选择 **`pi`** 预设即可使用。

## 核心能力

### 1. Pi 编程工具与 MoeJS codemode

- **文件与命令**：`read`、`bash`、`edit`、`write`、`ls`、`find`、`grep`，保持 Pi 的工具名称、描述与参数格式，底层通过 DSH 的 `ctx.fs`、`ctx.subprocess` 与 `ctx.sandbox` 执行。
- **`codemode`**：常驻 Go 子进程，每次脚本新建独立的 MoeJS runtime，支持 `Promise.allSettled`、`store` / `load`、`ALL_TOOLS`、`searchTools`、`describeTool`、`describeNamespace`。脚本无 Node、文件系统或网络直连权限，所有工具调用走当前步的 DSH 权限与沙箱管线。并发上限沿用 `PI_CODEMODE_MAX_WORKERS`（默认 `2`），与单脚本内的 `maxParallel` 独立。
- **回传预算**：默认整批文本保留约 8,000 字符；超出时保留首尾并将完整输出写入文件供 `read` 分段查看，图片照常返回。可在脚本首行写 `// @options: {"max_output_tokens": 4000}` 调整单次预算。
- **编辑差异与实时轨迹**：成功的 `edit` 在直接调用和 `codemode` 子步骤中均可展开「编辑差异」查看增删行；`codemode` 子步骤默认折叠，折叠时显示执行进度和失败步数。
- **`tool_search`**：BM25 延迟工具发现，命中后从下一轮请求起成为直接可调用工具。
- **Skill 正文提醒**：请求前自动追踪哪些 Skill 的完整指令仍保留在上下文中，避免重复加载。
- **请求适配**：在兼容路由上为 `codemode` 恢复 `constrainedSampling`；在孤立 `SyntaxError` / `ReferenceError` 中附带 `String.raw` 等转义指引；遇到 `anthropic-messages` 中继将纯工具结果轮次误报为 `assistant message prefill`（HTTP 400）时，自动改写该次请求的文本块并重试一次，不重跑工具。

### 2. 挂载的 DSH 能力

`cordis.patch.yml` 在 `pi` 预设内独立挂载了 DSH 原生能力：

- **计划与时间线**：独立 `planMode`（`exit_plan_mode`）；同时启用官方 `@deepseek-ai/dsh-timeline` 时透传 `timeline_*` 工具（默认关闭，按需勾选）。
- **子代理、技能与工作流**：`subagent`、`list_subagent_models`、`send_message`、`list_agents`、`wait_agent`、`ask_user_question`、`skill`，以及默认关闭、按需勾选的 `workflow`（DSH PTC）和 ACP 子代理工具。
- **后台任务、定时与目标**：`job_*`、`/goal`，以及默认关闭、按需勾选的 `create_goal` / `get_goal` / `update_goal`、`schedule_*`。
- **联网、展示与扩展**：`web_fetch`、`web_search`，以及默认关闭、按需勾选的 `present`、`office_*`、`plugin_manager`、`plugin_market`、`cordis_inspect`。
- **全局工具透传**：默认开启 `grok_search`、`openai_search`，以及启用对应官方可选包后的 `session_*`、`enter_worktree` / `exit_worktree`；按需勾选 `openai_image`、`grok_image`、`subagent_antigravity`、`subagent_cursor`、`subagent_acp_claude_code`、`timeline_*`、`terminal_*`。
- **上下文裁剪与压缩**：内置 `tool-result-pruner` 与 `compaction-basic`（可通过 `DSH_PI_SUMMARY_PROVIDER` / `DSH_PI_SUMMARY_MODEL` 指定摘要模型）。

### 3. 会话工具选择器与 MCP

在空白 `pi` 会话中点击 **Tools** 打开选择器（首轮开始后锁定）：

- 支持 **精简视图**（按分组开关）与 **逐个设置**（支持搜索与「只看已保留」）。
- **设为默认** 会将与预设默认值的差异保存到 `pi_tools_defaults`，对之后新建的 `pi` 会话生效。
- **刷新 MCP** 重启已桥接的 MCP 服务器并重新拉取工具目录。默认 `mcpServers: ['*']`、`mcpExposure: codemode`，自动接入所有全局 DSH MCP 命名空间（包括 `dsh-pi-mcp` 同步的服务）。

## 配置项

`cordis.patch.yml` 中 `dsh-pi-tools` 支持：`tools`、`codemode`、`toolSearch`、`scopedTools`、`globalTools`、`optInTools`、`mcpServers`、`mcpExposure`、`maxParallel`（默认 `10`）、`rgCommand`、`fdCommand`；前端展示与 `/pi-tools/options` 路由通过 `presentationOnly: true` 挂载。

更多说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/pi-tools)。
