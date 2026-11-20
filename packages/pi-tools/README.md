# dsh-pi-tools（`pi` 预设）

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）提供一个独立的 `pi` Agent 预设：把 Pi 原版的编程工具、系统提示词和 MoeJS `codemode` 沙箱接入 DSH 原有的会话、权限、沙箱、模型路由与 MCP 连接中，不改 DSH 源码，也不影响默认预设和其他会话。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 运行环境中可用的 `rg` 与 `fd`（可通过 `rgCommand` / `fdCommand` 配置）；不需要安装其他同仓插件 |
| 数据保存 | 会话选择写入会话日志（`plugin:dsh-pi-tools/selection`）；保存的预设默认工具存于 Host `pi_tools_defaults` storage domain |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/pi-tools"
```

发布包包含 macOS、Linux、Windows 的 x64 和 arm64 runner；使用安装包不需要 Go，也不需要执行安装脚本。

本地开发时，修改 runner 或升级 Pi 后先运行 `pnpm --filter dsh-pi-tools build:runner`（Go 1.25+）。交付前运行 `pnpm --filter dsh-pi-tools build:runner:all` 更新六个平台的 `bin/` 和生成的 Pi 适配器；Git 子目录安装与 tarball 使用同一份预构建文件。开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/pi-tools"
```

安装后在「新建会话」页面选择 **`pi`** 预设即可使用。

## 核心能力

### 1. Pi 原版工具与 MoeJS codemode

- **基础编程工具**：`read`、`bash`、`edit`、`write`、`ls`、`find`、`grep`，保留 Pi 原版的工具名称、描述与参数 Schema，底层全部通过 DSH 的 `ctx.fs`、`ctx.subprocess` 与 `ctx.sandbox` 执行。
- **`codemode`**：默认使用常驻 Go 子进程，每次脚本新建 MoeJS runtime（仅接受 `{ code: string }`），脚本内可使用 `Promise.allSettled`、`store` / `load`、`ALL_TOOLS`、`searchTools`、`describeTool`、`describeNamespace` 调用当前步已放行的工具。无 Node/文件系统/网络直连权限，一切外调走受控 DSH 工具管线。
- **回传预算**：默认整批文本保留约 8,000 个字符。超出时保留首尾，完整文本写入返回路径，可用 `read` 分段查看，无需重跑。图片仍正常返回；要调整单次预算，在脚本首行设置 `// @options: {"max_output_tokens": 4000}`。
- **Skill 正文提醒**：Pi 在请求前提示哪些 Skill 的完整指令仍可见。目录、失败调用和未返回正文的 `codemode` 调用不算；重复加载不重复发布名单，正文被裁剪或压缩移除后更新提醒。
- **实时轨迹**：`codemode` 的子步骤默认折叠。点击「脚本」可随时展开或收起；展开后可实时查看每个工具调用的参数和结果，折叠时仍能看到执行进度和失败步数。
- **`tool_search`**：BM25 延迟工具发现工具，搜索命中后从下一轮模型调用起即可直接调用对应工具。
- **语法采样恢复**：通过 `lib/pi-ai-hook.js` 为支持 OpenAI grammar tools 的路由恢复 `constrainedSampling`（不支持的路由保持 JSON `{ code }` 传输），并在遇到孤立 `SyntaxError` / `ReferenceError` 时附带 `String.raw` 与转义提示。

所有使用 `anthropic-messages` 协议的模型路由均保留正常请求的原始格式。仅当上游把消息末尾已配对的工具结果误报为 `assistant message prefill`（HTTP 400）时，插件才将结果中的字符串转为等价文本块，并在同一条消息末尾附上纯文本边界标记 `[End of tool results.]`，重发一次模型请求。标记不包含用户指令，也不写入会话历史。不会重跑工具；其他 400 或重发后的错误仍原样返回。

### 2. 挂载的原生 DSH 能力

`cordis.patch.yml` 在 `pi` 预设内独立挂载了 DSH 原生能力（不污染其他预设）：

- **工作时间线与计划模式**：只有另行安装并启用 `dsh-work-timeline` 后，Pi 才提供 `work_read`、`work_update`；不安装时仍可使用 `planMode`（`exit_plan_mode`）。
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

`cordis.patch.yml` 中 `dsh-pi-tools` 支持的字段包括 `tools`、`codemode`、`codemodeBackend`、`toolSearch`、`scopedTools`、`globalTools`、`optInTools`、`mcpServers`、`mcpExposure`、`maxParallel`（默认 `10`）、`rgCommand`、`fdCommand`；前端伴侣入口通过 `presentationOnly: true` 挂载 `/pi-tools/options` 与 `codemode` / `tool_search` 结果卡片。

`codemodeBackend` 默认为 `moejs`，可显式设为 `quickjs` 作对照或回退。脚本失败或 runner 退出不会换引擎重跑。并发上限沿用 Pi 的 `PI_CODEMODE_MAX_WORKERS`（默认 2），与单个脚本内部的 `maxParallel` 独立。

更多使用说明、系统提示词与兼容边界见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/pi-tools)。
