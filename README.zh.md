<div align="center">

# dsh-plugins

seefs 自用的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）插件集，共 32 个独立 bundle，覆盖模型选择、会话管理、对话阅读与工具集成，跟随最新 DSH 持续更新。

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[在线文档](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | 中文

</div>

## 概览

每个插件位于 `packages/<name>`，可单独安装、启用、停用和卸载，互不捆绑。

- **环境要求**：最新版 DSH 与本仓库 `main` 分支（不维护旧版本兼容）。带 `Web` 部分的插件需在 `dsh web` 下使用。
- **运行位置**：`Host` 运行在 DSH 服务进程；`Web` 运行在浏览器界面；`Host + Web` 包含两端。

## 插件目录

### 模型与审查

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | 输入 `#` 插入模型标签，自动带上该模型上次的推理强度和快速模式。 | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | 给 OpenAI Responses 请求切换快速（`priority`）或超快（`ultrafast`）档位。 | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | 记住顶层会话刚选好的模型和推理强度，新建会话直接沿用。 | Host |
| [`dsh-title-model`](packages/title-model) | 为对话标题单独选一个模型，不影响主对话模型和标题触发策略。 | Host + Web |
| [`dsh-subagent-model`](packages/subagent-model) | 在子代理输入框右下角显示它记录的模型和推理强度（只读）。 | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | 为 Auto review 单独选模型和审查提示词，并实时查看每个会话的审查日志。需要 `@deepseek-ai/dsh-experimental-auto-review`。 | Host + Web |
| [`dsh-roles`](packages/roles) | 在侧栏管理带系统提示词与专属技能的角色，并在模型菜单里按会话切换。 | Host + Web |

### 会话与工作区

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-session-search`](packages/session-search) | 点侧栏「搜索会话」打开大面板，按标题、工作区或正文找回对话。 | Web |
| [`dsh-recent-sessions`](packages/recent-sessions) | `@` 菜单里的会话按最近活动排序，刚聊过的排最前。 | Web |
| [`dsh-session-lifecycle`](packages/session-lifecycle) | 折叠进行中的会话，暂缓或归置线程；按主会话处理待答请求、子任务失败与轮次结果。 | Host + Web |
| [`dsh-session-groups`](packages/session-groups) | 自定义会话分组和组内置顶，所有浏览器和 Agent 通过 Host 同步共享。 | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | 检查并移除保存过的工作区记录、清理失效目录条目，不动磁盘文件和会话。 | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | 新会话发第一条消息前，直接在页面里切换到已有本地分支。需要 Change requests & worktrees。 | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | 在输入框下方显示当前分支和未提交改动统计，点一下打开右侧 diff。需要 Change requests & worktrees。 | Web |
| [`dsh-keep-awake`](packages/keep-awake) | DSH Host 运行期间阻止 macOS 闲置休眠，屏幕仍照常熄灭和锁屏。 | Host |

### 对话阅读

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-compaction-status`](packages/compaction-status) | 上下文压缩时，在输入框上方显示状态和已等待时间。 | Host + Web |
| [`dsh-diagram-preview`](packages/diagram-preview) | 在对话中预览 Mermaid、Graphviz、ECharts 和 SVG，随时切回原代码。 | Web |
| [`dsh-quote-jump`](packages/quote-jump) | 把用户消息里的引用变成可点击块，点一下跳回原文并高亮。 | Web |
| [`dsh-tool-lens`](packages/tool-lens) | 在工具调用行直接打开技能文件、完整输出、搜索命中文件和子代理对话。 | Web |
| [`dsh-message-actions`](packages/message-actions) | 回复旁的 **Wait, what?** 用独立模型把话重新讲明白，不写进主对话。 | Host + Web |
| [`dsh-message-edit`](packages/message-edit) | 悬停自己的消息即可就地改写（默认清空后续上下文，也可保留）或分叉重发。 | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | 右下角可拖拽的 GPT / Claude 小伙伴，跟随当前对话的真实活动。角色素材另有非商业条款。 | Web |
| [`dsh-acp-workbench`](packages/acp-workbench) | 在原会话直接运行 Cursor、Antigravity、Claude Code 等本机 ACP 工具，或委派可续聊原生子代理，附带项目工作流、轨迹和审批。外部 CLI 不受 DSH 沙箱限制。 | Host + Web |

### 工具与集成

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-prompt-shortcut`](packages/prompt-shortcut) | 在当前浏览器收藏常用话术，搜索后插入光标处，不自动发送。 | Web |
| [`dsh-cheat-sheet`](packages/cheat-sheet) | 搜索可用技能、置顶常用项（按实际使用次数排序），一键把 `/命令` 填进输入框。 | Host + Web |
| [`dsh-web-access`](packages/web-access) | 新增 `grok_search`（网页与 X）和 `openai_search`，复用已有 Responses provider 的托管搜索。 | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | 新增 `openai_image` 和 `grok_image`，复用已有 Responses provider 的托管画图并保存为文件。 | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | 独立的 `pi` 预设：Pi 原版编程工具、MoeJS `codemode`、会话工具选择器、预设默认与 MCP 刷新。 | Host + Web |
| [`dsh-work-timeline`](packages/work-timeline) | 会话里的工作计划、修订过程和产物面板（替换 `pi` 预设 TODO；工具由 `dsh-work-timeline/tools` 导出）。 | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | 在 DSH 里共用 Pi 的 `~/.pi/agent/mcp.json`，改文件热同步生效。 | Host |
| [`dsh-paseo-hub`](packages/paseo-hub) | 把 DSH Host 作为 daemon 接入 Paseo Hub 运行触发，并提供组织 API 控制台与工具。 | Host + Web |
| [`dsh-bark-notify`](packages/bark-notify) | 智能体提问、审阅计划或请求权限审批时，顺便通过 Bark 发送手机推送。 | Host + Web |

## 安装

从 GitHub 安装单个插件到目标 profile（以 `web` 为例）：

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

把 `model-reference` 换成上表任意目录名即可，也可以在 DSH Web 的 **Plugins** 页面粘贴同一条 `github:` 地址。

从本地克隆安装（开发调试）：

```bash
git clone https://github.com/seefs001/dsh-plugins.git
cd dsh-plugins
dsh plugin --profile web add "link:$PWD/packages/model-reference"
```

安装后若返回 `applied`，Host 端立即生效；返回 `restart-required` 则重启该 profile 的 DSH；浏览器部分在刷新页面后加载。

## 配置与数据存储

- **profile 配置（`cordis.patch.yml`）**：`model-reference` 推理强度、`service-tier` 档位、`auto-review-model` 模型与提示词、`message-actions` 模型、`web-access`、`image-gen` 与 `bark-notify` 非敏感设置（由 DSH `configEditor` 写入）。
- **Host storage domain（`~/.dsh/storages`）**：`session_groups`、`roles`、`cheat_sheet`、`auto_review_log`、`message_actions`、`dsh_inbox_summary`、`pi_tools_defaults`、`paseo_hub` 与 `acp_workbench`。
- **DSH credentials**：`bark-notify/device` 与 `paseo-hub/{daemon,api}`，密钥绝不写入配置文件。
- **会话日志与浏览器存储**：`pi-tools` 工具选择与 `work-timeline` 快照保存在会话日志；`inbox` 已读标记、`prompt-shortcut` 片段与 `ai-mascot` 偏好保存在当前浏览器 `localStorage`。

存储上限、隐私边界与详细用法见各包 `README.md` 及在线文档站。

## 在线文档

[在线文档站](https://seefs001.github.io/dsh-plugins/) 使用 Fumadocs 构建并部署到 GitHub Pages：

```bash
pnpm run docs:dev        # 本地预览（http://localhost:3000）
pnpm run docs:typecheck  # MDX 与 TypeScript 类型检查
pnpm run docs:build      # 静态导出到 apps/docs/out
```

Pages 部署说明见 [apps/docs/README.md](apps/docs/README.md)。

## 本地开发

```bash
pnpm install
pnpm run check   # oxlint + manifest 校验 + node:test
```

绝大多数插件为无需构建的原生 ES 模块。目录规范、构建例外（`pi-tools`、`message-actions`）与发布步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

插件源码采用 [MIT](LICENSE) 许可证。`dsh-ai-mascot` 引用的角色素材另有非商业条款，不包含在 MIT 授权内，见[素材与署名说明](packages/ai-mascot/README.md#artwork-and-rights)。
