<div align="center">

# dsh-plugins

seefs 维护的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）插件集。每个插件是独立的 bundle，覆盖模型选择、会话管理、对话阅读和新工具。

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[文档](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | 中文

</div>

## 插件

最低 DSH 版本默认是 rc.1，表里标了 rc.2 的除外。“运行位置”说明插件有 Host 部分、浏览器部分，还是两者都有。

### 模型与审查

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | 在输入框输入 `#` 插入模型标签，带上该模型上次的推理强度和快速模式。 | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | 模型选择器旁的 ⚡ 开关，为 OpenAI Responses 模型发送 `service_tier: "priority"`。 | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | 新会话使用你最近选择的模型和推理强度。 | Host |
| [`dsh-subagent-model`](packages/subagent-model) | 在子代理输入框显示它记录的模型和推理强度。只读，主代理的选择器不变。 | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | 为 Auto review 选择模型和提示词，查看每个会话的审查日志。需要 `@deepseek-ai/dsh-experimental-auto-review`。 | Host + Web |

### 会话与工作区

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | `@` 菜单里的会话按最近活动排序。 | Web |
| [`dsh-session-groups`](packages/session-groups) | 自定义会话分组和组内置顶，所有浏览器和 Agent 共享。 | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | 移除保存的工作区记录，清理目录已不存在的条目，不删文件和会话。rc.2。 | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | 新会话发出首条消息前，在新建会话页切换到已有的本地分支。rc.2，需要 Change requests & worktrees。 | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | 输入框下方显示分支和未提交改动，点击打开 diff。需要 Change requests & worktrees。 | Web |
| [`dsh-keep-awake`](packages/keep-awake) | Host 运行期间阻止 macOS 闲置休眠，屏幕仍可熄灭和锁定。rc.2。 | Host |

### 对话阅读

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-compaction-status`](packages/compaction-status) | 上下文压缩时，在输入框上方显示一行状态和已等待时间。 | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | 用户消息里的引用变成可点击的块，跳回原文并高亮。 | Web |
| [`dsh-tool-lens`](packages/tool-lens) | 工具调用行可以打开技能文件、完整输出、结果文件和子代理对话。 | Web |
| [`dsh-message-actions`](packages/message-actions) | 回复旁的 **Wait, what?** 用独立模型调用解释这条回复，不写入对话。rc.2。 | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | 可拖动的 GPT / Claude 角色，跟随当前显示的对话。角色素材另有非商业条款。 | Web |

### 工具与集成

| 包 | 作用 | 运行位置 |
|---|---|---|
| [`dsh-web-access`](packages/web-access) | 新增 `grok_search`（网页和 X）与 `openai_search`，使用已有 Responses provider 的托管搜索。 | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | 新增 `openai_image` 与 `grok_image`，使用已有 Responses provider 的托管画图工具，并把图片保存为文件。 | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | 独立的 `pi` 预设：Pi 1.5.0 原版编程工具、QuickJS codemode，以及按会话选择的 DSH 和 MCP 工具。rc.2，且需要预设选项相关的 DSH 改动，见其 README。 | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | 把 Pi 的 `~/.pi/agent/mcp.json` 里的 MCP 服务器注册到 DSH MCP 管理器，改文件即时生效。 | Host |
| [`dsh-switchboard`](packages/switchboard) | 把 DSH 接入 Switchboard 中继，让 Telegram、Discord 和 GitHub 的请求在 DSH 会话里运行。 | Host |

按需安装即可。同时装了 `dsh-model-reference` 和 `dsh-service-tier` 时，`#` 标签会带上 ⚡。

## 环境要求

- DSH `>=0.2.2-rc.1 <0.3.0`，上表标 rc.2 的包要求 `>=0.2.2-rc.2`。
- Node.js `^22.19.0 || >=24`。
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

大部分设置在界面里完成，由 DSH 的 config editor 写入 profile 的 `cordis.patch.yml`，包括 `model-reference` 的推理强度、`service-tier` 的快速模型、`auto-review-model` 的模型和提示词、`message-actions` 的解释模型，以及 `web-access` 的搜索设置。Switchboard 没有设置页，需要直接编辑 `cordis.patch.yml` 中它的那一行。

会话分组、审查日志、回复解释和 Switchboard 的连接状态保存在 Host 的 storage domain（`session_groups`、`auto_review_log`、`message_actions`、`switchboard_connector`）。Pi 的工具选择写入会话日志。AI 吉祥物的位置和显示偏好保存在浏览器 localStorage。存储上限和隐私说明见各包 README。

## 文档

[文档站](https://seefs001.github.io/dsh-plugins/)包括安装、配置与数据、版本要求与使用边界，以及每个插件的页面。站点用 Fumadocs 构建，部署到 GitHub Pages。

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
