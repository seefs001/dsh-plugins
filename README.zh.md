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
| [`dsh-model-reference`](packages/model-reference) | 输入 `#` 插入模型标签，自动带上该模型上次的推理强度和快速模式。 | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | 给 OpenAI Responses 请求切换快速档，支持的模型还可选超快档。 | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | 记住你在会话里刚选好的模型和推理强度，开新会话直接沿用。 | Host |
| [`dsh-title-model`](packages/title-model) | 为对话标题单独选一个模型，不影响主对话模型和标题策略。 | Host + Web |
| [`dsh-subagent-model`](packages/subagent-model) | 在子代理输入框右下角显示它记录的模型和推理强度（只读，不影响主代理）。 | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | 为 Auto review 单独选模型和审查提示词，还能看每个会话的审查日志。需要 `@deepseek-ai/dsh-experimental-auto-review`。 | Host + Web |
| [`dsh-roles`](packages/roles) | 在侧栏管理常用角色、提示词和技能，在模型菜单里按会话切换。 | Host + Web |

### 会话与工作区

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | `@` 菜单里的会话按最近活动排序，刚聊过的排最前。 | Web |
| [`dsh-inbox`](packages/inbox) | 跨会话收件箱，只把需要你拍板或回答的会话计入角标，子任务自动归到主会话下。 | Host + Web |
| [`dsh-session-groups`](packages/session-groups) | 自定义会话分组和组内置顶，所有浏览器和 Agent 同步共享。 | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | 移除保存过的工作区记录、清理失效目录条目，不动磁盘文件和会话。 | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | 新会话发第一条消息前，直接在页面里切换到已有本地分支。需要 Change requests & worktrees。 | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | 输入框下方显示当前分支和未提交改动，点一下打开右侧 diff。需要 Change requests & worktrees。 | Web |
| [`dsh-keep-awake`](packages/keep-awake) | Host 运行期间阻止 Mac 闲置休眠，屏幕仍照常熄灭和锁屏。 | Host |

### 对话阅读

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-compaction-status`](packages/compaction-status) | 压缩上下文时，在输入框上方显示状态和已等待时间。 | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | 把消息里的引用变成可点击卡片，点一下跳回原文并高亮。 | Web |
| [`dsh-tool-lens`](packages/tool-lens) | 点工具调用行就能打开技能文件、完整输出、结果文件和子代理对话。 | Web |
| [`dsh-message-actions`](packages/message-actions) | 回复旁的 **Wait, what?** 用独立模型把话重新讲明白，不写进主对话。 | Host + Web |
| [`dsh-message-edit`](packages/message-edit) | 悬停自己的消息点 **编辑**，默认在当前会话改写并清空后续上下文；也支持分叉重发。 | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | 可拖动的 GPT / Claude 小伙伴，跟着当前对话做动作。角色素材另有非商业条款。 | Web |
| [`dsh-acp-workbench`](packages/acp-workbench) | 让会话改由 Cursor、Antigravity 等本机 ACP 工具执行，或委派可续聊的原生子任务；轨迹和审批留在当前会话。外部 CLI 不受 DSH 沙箱限制。 | Host + Web |

### 工具与集成

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-prompt-shortcut`](packages/prompt-shortcut) | 收藏常用话术，搜一搜插到光标处，留给你补完再发。 | Web |
| [`dsh-cheat-sheet`](packages/cheat-sheet) | 搜索可用技能、置顶常用项（按实际使用次数排序），点一下把命令填进输入框。 | Host + Web |
| [`dsh-web-access`](packages/web-access) | 新增 `grok_search`（网页和 X）与 `openai_search`，走已有 Responses provider 的托管搜索。 | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | 新增 `openai_image` 与 `grok_image`，走已有 Responses provider 的托管画图，并把图片保存为文件。 | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | 独立的 `pi` 预设：Pi 原版编程工具与提示词、QuickJS codemode、会话工具选择、预设默认工具保存和 MCP 刷新。不需要改 DSH 源码。 | Host + Web |
| [`dsh-work-timeline`](packages/work-timeline) | 会话里的工作计划、修订记录和关联产物（显示在输入框摘要条和右侧面板，替换 Pi 预设的 TODO 清单；`work_read` 和 `work_update` 由 `dsh-pi-tools` 提供）。 | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | 在 DSH 里共用 Pi 的 `~/.pi/agent/mcp.json`，改文件热更新生效。 | Host |
| [`dsh-orbit-bridge`](packages/orbit-bridge) | 只读巡检 Orbit 项目，对比上次检查列出新增和变动任务，不写 Orbit。 | Host + Web |
| [`dsh-paseo-hub`](packages/paseo-hub) | 把 Paseo Hub 触发作为 DSH 会话跑在本机，查看运行与活动，或直接通过组织 API 管理触发器。 | Host + Web |

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
