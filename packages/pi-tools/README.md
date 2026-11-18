# dsh-pi-tools（`pi` 预设）

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）提供一个独立的 `pi` Agent 预设：把 Pi 原版的编程工具、系统提示词和 QuickJS `codemode` 沙箱接入 DSH 原有的会话、权限、沙箱、模型路由与 MCP 连接中，不改 DSH 源码，也不影响默认预设和其他会话。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 运行环境中可用的 `rg` 与 `fd`（可通过 `rgCommand` / `fdCommand` 配置）；同时联动 `dsh-work-timeline` |
| 数据保存 | 会话选择写入会话日志（`plugin:dsh-pi-tools/selection`）；保存的预设默认工具存于 Host `pi_tools_defaults` storage domain |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/pi-tools"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/pi-tools"
```

安装后在「新建会话」页面选择 **`pi`** 预设即可使用。

## 核心能力

### 1. Pi 原版工具与 QuickJS codemode

- **基础编程工具**：`read`、`bash`、`edit`、`write`、`ls`、`find`、`grep`，保留 Pi 原版的工具名称、描述与参数 Schema，底层全部通过 DSH 的 `ctx.fs`、`ctx.subprocess` 与 `ctx.sandbox` 执行。
- **`codemode`**：Pi 的 QuickJS Worker 沙箱（仅接受 `{ code: string }`），脚本内可使用 `Promise.allSettled`、`store` / `load`、`ALL_TOOLS`、`searchTools`、`describeTool`、`describeNamespace` 调用当前步已放行的工具。无 Node/文件系统/网络直连权限，一切外调走受控 DSH 工具管线。
- **`tool_search`**：BM25 延迟工具发现工具，搜索命中后从下一轮模型调用起即可直接调用对应工具。
- **语法采样恢复**：通过 `lib/pi-ai-hook.js` 为支持 OpenAI grammar tools 的路由恢复 `constrainedSampling`（不支持的路由保持 JSON `{ code }` 传输），并在遇到孤立 `SyntaxError` / `ReferenceError` 时附带 `String.raw` 与转义提示。

### 2. 挂载的原生 DSH 能力

`cordis.patch.yml` 在 `pi` 预设内独立挂载了 DSH 原生能力（不污染其他预设）：

- **工作时间线与计划模式**：`work_read`、`work_update`（由 `dsh-work-timeline/tools` 提供，取代旧 `todo_write`）以及隔离的 `planMode`（`exit_plan_mode`）。
- **子代理、技能与工作流**：`subagent`、`subagent_fork`、`list_subagent_models`、`send_message`、`list_agents`、`wait_agent`、`ask_user_question`、`skill`（含 `/` 补全）、`workflow`（DSH PTC）。
- **后台任务、定时与目标**：`job_*`、`schedule_*`、`create_goal` / `get_goal` / `update_goal`、`/goal`。
- **联网、演示与 Office（部分默认需在选择器勾选）**：`web_fetch`、`web_search`、`present`、`office_*`、`plugin_manager`、`plugin_market`、`cordis_inspect_*`。
- **全局工具透传**：`grok_search`、`openai_search`、`openai_image`、`grok_image`、`subagent_agy`、`subagent_cursor`。
- **上下文裁剪与压缩**：内置 `tool-result-pruner` 与 `compaction-basic`（可通过环境变量 `DSH_PI_SUMMARY_PROVIDER` / `DSH_PI_SUMMARY_MODEL` 单独指定压缩摘要模型）。

### 3. 会话工具选择器、默认配置与 MCP 刷新

在空白 `pi` 新会话顶部点击 **Tools** 打开配置弹窗（首轮开始后锁定）：

- **简洁视图 / 逐工具视图**：按 Pi 工具、DSH 分类与 MCP 服务分组筛选和勾选，支持「仅看已选」与 **设为默认**（保存预设级默认差异至 `pi_tools_defaults`）。
- **刷新 MCP**：按需重启已桥接的 DSH MCP 服务器并等待就绪，刷新目录中的新工具列表。
- **MCP 曝光模式**：支持 `codemode`（默认）、`deferred`、`direct`、`hidden`；`'*'` 自动桥接所有全局 DSH MCP 命名空间（包括 `dsh-pi-mcp` 同步过来的服务器）。

## 预设配置项

`cordis.patch.yml` 中 `dsh-pi-tools` 支持的字段包括 `tools`、`codemode`、`toolSearch`、`scopedTools`、`globalTools`、`optInTools`、`mcpServers`、`mcpExposure`、`maxParallel`（默认 `10`）、`rgCommand`、`fdCommand`；前端伴侣入口通过 `presentationOnly: true` 挂载 `/pi-tools/options` 与 `codemode` / `tool_search` 结果卡片。

更多使用说明、系统提示词与兼容边界见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/pi-tools)。
