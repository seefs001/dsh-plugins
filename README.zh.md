<div align="center">

# dsh-plugins

32 个独立的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）插件，覆盖模型选择、会话管理、对话阅读与工具集成。

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[在线文档](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | 中文

</div>

## 概览

每个插件位于 `packages/<name>`，可单独安装、启用、停用和移除。

- **Host**：运行在 DSH 后端进程。
- **Web**：运行在 `dsh web` 浏览器界面。
- **Host + Web**：包含两端。

## 插件目录

### 模型与审查

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | 输入 `#` 插入模型标签，携带该模型上次的推理强度和快速模式。 | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | 为 OpenAI Responses 请求切换快速（`priority`）或超快（`ultrafast`）档位。 | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | 记住顶层会话刚选好的模型和推理强度，新建会话自动沿用。 | Host |
| [`dsh-title-model`](packages/title-model) | 为对话标题单独指定模型。 | Host + Web |
| [`dsh-subagent-model`](packages/subagent-model) | 在子代理输入框右下角显示其记录的模型和推理强度。 | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | 为 Auto review 单独指定模型和提示词，并查看会话审查日志。需要 `@deepseek-ai/dsh-experimental-auto-review`。 | Host + Web |
| [`dsh-roles`](packages/roles) | 在侧栏管理带系统提示词与专属技能的角色，并在模型菜单按会话切换。 | Host + Web |

### 会话与工作区

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | 将 `@` 菜单中的会话按最近活动倒序排列。 | Web |
| [`dsh-session-lifecycle`](packages/session-lifecycle) | 按需要你、进行中、暂缓和归置整理会话，集中处理待答请求与轮次结果。 | Host + Web |
| [`dsh-session-groups`](packages/session-groups) | 自定义侧栏会话分组与组内置顶，通过 Host 跨浏览器同步。 | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | 查看已保存的工作区记录并清理失效条目。 | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | 新会话发第一条消息前直接切换已有本地分支。需要 Change requests & worktrees。 | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | 在输入框下方显示当前分支和未提交改动统计，点击打开右侧 diff。需要 Change requests & worktrees。 | Web |
| [`dsh-github-panel`](packages/github-panel) | 会话目录关联 GitHub 仓库时，在右侧会话面板展示仓库概览、打开中的 PR、Issue、Actions 状态与最新发布，并在右栏查看详情。需要 `gh` CLI。 | Host + Web |
| [`dsh-keep-awake`](packages/keep-awake) | DSH Host 运行期间阻止 macOS 闲置休眠。 | Host |

### 对话阅读

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-diagram-preview`](packages/diagram-preview) | 在对话中预览 Mermaid、Graphviz、ECharts 和 SVG 图表，并支持切回源码。 | Web |
| [`dsh-canvas`](packages/canvas) | 按会话按需开启的交互式 React 画布：基于工作区 `.canvas.tsx` 文件，提供 TypeScript 诊断、沙箱热重载、持久化状态、版本对比与宿主联动。 | Host + Web |
| [`dsh-side-chat`](packages/side-chat) | 在右栏沿用主聊预设独立追问，按需将引用带回主聊草稿。 | Web |
| [`dsh-quote-jump`](packages/quote-jump) | 把用户消息中的引用渲染为可点击块，点击跳回原文并高亮。 | Web |
| [`dsh-tool-lens`](packages/tool-lens) | 在工具调用行直接打开技能文件、完整输出、搜索命中文件和子代理对话。 | Web |
| [`dsh-message-actions`](packages/message-actions) | 回复旁的 **Wait, what?** 用独立模型调用解释回复内容。 | Host + Web |
| [`dsh-message-edit`](packages/message-edit) | 悬停自己的消息即可就地改写或分叉重发。 | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | 右下角可拖拽的 GPT / Claude 小伙伴，跟随当前对话状态活动。角色素材另有非商业条款。 | Web |
| [`dsh-acp-workbench`](packages/acp-workbench) | 在 DSH 会话中直接运行 Cursor、Antigravity、Claude Code 等本机 ACP CLI，或委派可续聊子代理。外部 CLI 不受 DSH 沙箱限制。 | Host + Web |

### 工具与集成

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-prompt-shortcut`](packages/prompt-shortcut) | 在 DSH Host 跨浏览器收藏常用话术，支持导入导出与 `/snippets`，搜索后插入光标处。 | Host + Web |
| [`dsh-cheat-sheet`](packages/cheat-sheet) | 搜索会话技能、置顶常用项、按实际使用次数排序，一键插入 `/命令`。 | Host + Web |
| [`dsh-web-access`](packages/web-access) | 提供 `grok_search`（网页与 X）和 `openai_search`，复用已有 Responses provider 的托管搜索。 | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | 提供 `openai_image` 和 `grok_image`，复用已有 Responses provider 生成并保存图片。 | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | 独立的 `pi` 预设：Pi 原版工具、MoeJS `codemode`、会话工具选择器与 MCP 刷新。 | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | 共享 Pi 的 `~/.pi/agent/mcp.json` 到 DSH，修改热同步并在插件页开关各服务。 | Host + Web |
| [`dsh-paseo-hub`](packages/paseo-hub) | 把 DSH Host 注册为 Paseo Hub daemon 运行触发，并提供组织 API 控制台与工具。 | Host + Web |
| [`dsh-bark-notify`](packages/bark-notify) | 智能体提问、提交计划或请求权限审批时通过 Bark 推送到手机。 | Host + Web |

## 安装

从 GitHub 安装单个插件到目标 profile（以 `web` 为例）：

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

把 `model-reference` 换成上表任意目录名，或在 DSH Web 的 **Plugins** 页面粘贴同一条 `github:` 地址。

从本地克隆安装：

```bash
git clone https://github.com/seefs001/dsh-plugins.git
cd dsh-plugins
dsh plugin --profile web add "link:$PWD/packages/model-reference"
```

返回 `applied` 表示 Host 侧立即生效；返回 `restart-required` 需重启该 profile 的 DSH；浏览器部分在刷新页面后加载。

## 配置与数据存储

- **profile 配置（`cordis.patch.yml`）**：`model-reference`、`service-tier`、`auto-review-model`、`message-actions`、`web-access`、`image-gen`、`bark-notify`。
- **Host storage domain（`~/.dsh/storages`）**：`session_groups`、`roles`、`cheat_sheet`、`auto_review_log`、`message_actions`、`session_lifecycle`、`session_lifecycle_summary`、`pi_tools_defaults`、`paseo_hub`、`acp_workbench`、`canvas`。
- **DSH credentials**：`bark-notify/device`、`paseo-hub/{daemon,api}`。
- **会话日志与浏览器存储**：`pi-tools` 工具选择保存在会话日志；`prompt-shortcut` 片段、`ai-mascot` 偏好与 `session-lifecycle` 分区折叠状态保存在浏览器 `localStorage`。

## 在线文档

[在线文档站](https://seefs001.github.io/dsh-plugins/) 使用 Fumadocs 构建并部署到 GitHub Pages：

```bash
pnpm run docs:dev        # 本地预览（http://localhost:3000）
pnpm run docs:typecheck  # MDX 与 TypeScript 检查
pnpm run docs:build      # 静态导出到 apps/docs/out
```

## 本地开发

```bash
pnpm install
pnpm run check   # oxlint + 清单与文档校验 + node:test
```

目录结构、构建例外与 lint 规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

插件源码采用 [MIT](LICENSE) 许可证。`dsh-ai-mascot` 引用的角色素材另有非商业条款，见[素材与署名说明](packages/ai-mascot/README.md#artwork-and-rights)。
