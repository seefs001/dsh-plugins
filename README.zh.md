<div align="center">

# dsh-plugins

seefs 自用的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）插件集，日常使用，跟随最新 DSH 持续更新。每个插件是独立的 bundle，覆盖模型选择、会话管理、对话阅读和新工具。

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[文档](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | 中文

</div>

## 插件

“运行位置”说明插件有 Host 部分、浏览器部分，还是两者都有。

### 模型与审查

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | 在输入框输入 `#` 插入模型标签，带上该模型上次的推理强度和快速模式。 | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | 模型选择器旁的 ⚡ 开关，为 OpenAI Responses 模型发送 `service_tier: "priority"`。 | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | 新会话使用你最近选择的模型和推理强度。 | Host |
| [`dsh-title-model`](packages/title-model) | 为对话标题单独选择模型，保留标题生成策略和主对话模型。 | Host + Web |
| [`dsh-subagent-model`](packages/subagent-model) | 在子代理输入框显示它记录的模型和推理强度。只读，主代理的选择器不变。 | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | 为 Auto review 选择模型和提示词，查看每个会话的审查日志。需要 `@deepseek-ai/dsh-experimental-auto-review`。 | Host + Web |
| [`dsh-roles`](packages/roles) | 在独立侧栏管理页编辑角色提示词、自带技能和本地技能引用，在输入框的模型菜单里为会话切换角色。 | Host + Web |

### 会话与工作区

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | `@` 菜单里的会话按最近活动排序。 | Web |
| [`dsh-session-groups`](packages/session-groups) | 自定义会话分组和组内置顶，所有浏览器和 Agent 共享。 | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | 移除保存的工作区记录，清理目录已不存在的条目，不删文件和会话。 | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | 新会话发出首条消息前，在新建会话页切换到已有的本地分支。需要 Change requests & worktrees。 | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | 输入框下方显示分支和未提交改动，点击打开 diff。需要 Change requests & worktrees。 | Web |
| [`dsh-keep-awake`](packages/keep-awake) | Host 运行期间阻止 macOS 闲置休眠，屏幕仍可熄灭和锁定。 | Host |

### 对话阅读

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-compaction-status`](packages/compaction-status) | 上下文压缩时，在输入框上方显示一行状态和已等待时间。 | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | 用户消息里的引用变成可点击的块，跳回原文并高亮。 | Web |
| [`dsh-tool-lens`](packages/tool-lens) | 工具调用行可以打开技能文件、完整输出、结果文件和子代理对话。 | Web |
| [`dsh-message-actions`](packages/message-actions) | 回复旁的 **Wait, what?** 用独立模型调用解释这条回复，不写入对话。 | Host + Web |
| [`dsh-message-edit`](packages/message-edit) | 在自己的消息上点 **编辑**：分支重发（清理后续消息），或只改写模型上下文、保留后续消息。 | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | 可拖动的 GPT / Claude 角色，跟随当前显示的对话。角色素材另有非商业条款。 | Web |

### 工具与集成

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-cheat-sheet`](packages/cheat-sheet) | 搜索当前会话可主动调用的技能，置顶常用项，默认按实际使用频次降序，把命令写入输入框，不自动发送或执行技能。 | Host + Web |
| [`dsh-web-access`](packages/web-access) | 新增 `grok_search`（网页和 X）与 `openai_search`，使用已有 Responses provider 的托管搜索。 | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | 新增 `openai_image` 与 `grok_image`，使用已有 Responses provider 的托管画图工具，并把图片保存为文件。 | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | 独立的 `pi` 预设：Pi 原版编程工具和系统提示词、QuickJS codemode、会话工具选择、预设默认工具保存和 MCP 刷新。不需要改 DSH 源码。 | Host + Web |
| [`dsh-work-timeline`](packages/work-timeline) | 会话里的工作计划、修订过程和关联产物，显示在输入框摘要条和右侧面板。替换 Pi 预设的 TODO 清单，`work_read` 和 `work_update` 由 `dsh-pi-tools` 挂载。 | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | 把 Pi 的 `~/.pi/agent/mcp.json` 里的 MCP 服务器注册到 DSH MCP 管理器，改文件即时生效。 | Host |
| [`dsh-orbit-bridge`](packages/orbit-bridge) | 只读巡检 Orbit 项目：完整分页、本地运行记录、相对上次已处理检查的变化列表。不写 Orbit。 | Host + Web |
| [`dsh-paseo-hub`](packages/paseo-hub) | 把 Paseo Hub 触发作为 DSH 会话运行，查看本机运行与活动，或通过组织 API 控制台和工具管理触发器、手动触发任务。 | Host + Web |

按需安装即可。同时装了 `dsh-model-reference` 和 `dsh-service-tier` 时，`#` 标签会带上 ⚡。

## 环境要求

- 最新版 DSH。这些插件是我自用的，只跟随最新 DSH 和本仓库 `main` 分支，不维护旧版本兼容。
- 带 Web 部分的插件需要 Web 界面（`dsh web`）。

## 安装

从 GitHub 把一个包装进 profile，这里以 `web` 为例。`path:` 参数选择包：

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

把 `model-reference` 换成表里的任意目录名即可。也可以在 Web 界面的 **Plugins** 页粘贴同样的 `github:` 地址。

安装后 Plugin Manager 会选中这个 bundle。profile 启用了 HMR 时立即生效，结果显示 `applied`；显示 `restart-required` 时，重启这个 profile 的 DSH。浏览器部分在刷新页面后加载。

从本地克隆安装：

```bash
git clone https://github.com/seefs001/dsh-plugins.git
cd dsh-plugins
dsh plugin --profile web add link:$PWD/packages/model-reference
```

## 配置

大部分设置在界面里完成，由 DSH 的 config editor 写入 profile 的 `cordis.patch.yml`，包括 `model-reference` 的推理强度、`service-tier` 的快速模型、`auto-review-model` 的模型和提示词、通过 `title-model` 设置的原生标题模型、`message-actions` 的解释模型，以及 `web-access` 的搜索设置。

会话分组、审查日志、回复解释，以及 Orbit 执行桥的规则和运行记录保存在 Host 的 storage domain（`session_groups`、`auto_review_log`、`message_actions`、`orbit_bridge`）。角色库和角色选择保存在 `roles`。Paseo Hub 的 daemon 关系、本机运行和活动保存在 `paseo_hub`，daemon 凭据和单独保存的组织 API key 使用 DSH credentials。Pi 的工具选择写入会话日志，保存的预设默认工具使用 `pi_tools_defaults`。工作时间线的快照随会话日志里的 `work_update` 工具结果保存。AI 吉祥物的位置和显示偏好保存在浏览器 localStorage。存储上限和隐私说明见各包 README。

## 文档

[文档站](https://seefs001.github.io/dsh-plugins/)包括安装、配置与数据、依赖与使用边界，以及每个插件的页面。站点用 Fumadocs 构建，部署到 GitHub Pages。

```bash
pnpm run docs:dev        # 本地预览
pnpm run docs:typecheck  # 文档类型检查
pnpm run docs:build      # 静态导出到 apps/docs/out
```

Pages 的设置步骤见 [apps/docs/README.md](apps/docs/README.md)。

## 开发

```bash
pnpm install
pnpm run check   # oxlint + manifest 校验 + node:test
```

大多数插件是无需构建的原生 ES 模块。目录结构、例外情况和发布步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

插件代码采用 [MIT](LICENSE)。AI 吉祥物引用的角色素材另有非商业条款，不在 MIT 授权范围内，见[素材与署名说明](packages/ai-mascot/README.md#artwork-and-rights)。
