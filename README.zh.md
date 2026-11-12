<div align="center">

# dsh-plugins

seefs 的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）插件集，涵盖模型选择、会话管理、联网搜索、Git diff 与对话小伙伴。

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[文档](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | 中文

</div>

## 插件

| 包 | 作用 | 组成 |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | 在输入框输入 `#` 插入模型标签，带上该模型上次的推理强度和快速模式。 | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | 在模型选择器旁加 ⚡ 开关，为 OpenAI Responses 模型发送 `service_tier: "priority"`。 | Host + Web |
| [`dsh-subagent-model`](<packages/subagent-model/README.md>) | 在子代理输入框右下角显示只读模型名和推理强度，主代理的选择器保持不变。 | Web |
| [`dsh-remember-model`](packages/remember-model) | 新会话沿用你上次选择的模型和推理强度。 | Host |
| [`dsh-keep-awake`](<packages/keep-awake/README.md>) | DSH 运行期间防止 macOS 自动休眠，仍可正常息屏和锁屏。需要 DSH rc.2 或更新版本。 | Host |
| [`dsh-recent-sessions`](packages/recent-sessions) | `@` 菜单里的会话按最近活动排序，最新的在前。 | Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | 移除已保存的工作区，检查并批量清理失效目录记录，不删除文件或会话。需要 DSH rc.2 或更新版本。 | Host + Web |
| [`dsh-session-groups`](packages/session-groups) | 拖拽会话加入自定义分组，调整分组顺序并在组内置顶。 | Host + Web |
| [`dsh-compaction-status`](packages/compaction-status) | 自动压缩或 `/compact` 时，在输入框上方显示紧凑的状态与已等待时间。 | Host + Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | 指定 Auto review 模型与提示词，查看会话审查日志并跳转到工具调用。需要启用 `@deepseek-ai/dsh-experimental-auto-review`。 | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | 用户消息里的引用显示为引用块，点击后滚动到原文并高亮。 | Web |
| [`dsh-tool-lens`](packages/tool-lens) | 更好用的工具调用行。技能行可在右侧边栏打开该技能的 `SKILL.md`。 | Web |
| [`dsh-web-access`](packages/web-access) | 新增 `grok_search`（网页 + X）和 `openai_search` 工具，在 Plugins 页选择本地 Responses 模型和搜索类型。 | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | 在输入框下方显示分支与未提交改动统计，点击打开右侧 diff。需要 Change requests & worktrees。 | Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | 可拖动的 GPT / Claude 小伙伴，跟随当前显示的对话活动。 | Web |

按需安装即可。部分插件需要先启用 dsh 实验 bundle 或配置 provider，具体条件见各包说明。`dsh-model-reference` 和 `dsh-service-tier` 一起装时，`#` 标签会带上 ⚡。

## 环境要求

- dsh `>=0.2.2-rc.1 <0.3.0`
- Node.js `^22.19.0 || >=24`
- 浏览器端插件需要 Web 界面（`dsh web`）。

## 安装

从 GitHub 安装到某个 profile（这里是 `web`），用 `path:` 指定仓库里的单个包：

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/service-tier"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/subagent-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/remember-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/recent-sessions"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/workspace-manager"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/session-groups"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/compaction-status"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/auto-review-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/quote-jump"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/tool-lens"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/web-access"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/git-changes"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/ai-mascot"
```

也可以在 Web 界面的 **Plugins** 页粘贴同样的地址安装。安装后 bundle 会自动启用；开启 `patchReload: live` 时无需重启。

从本地克隆安装：

```bash
git clone https://github.com/seefs001/dsh-plugins.git
dsh plugin --profile web add link:$PWD/dsh-plugins/packages/model-reference
```

## 配置

插件设置（`model-reference` 的推理强度、`service-tier` 的快速模型、`auto-review-model` 的模型和提示词，以及 `web-access` 的搜索设置）通过 dsh 的 config editor 写入 profile 的 `cordis.patch.yml`。会话分组和审查日志分别保存在 Host 的 `session_groups`、`auto_review_log` storage domain。AI 小伙伴的位置、尺寸、收起状态与动画偏好保存在浏览器 localStorage，不写入 profile。存储上限和隐私说明见各包 README。

## 文档

[文档站](https://seefs001.github.io/dsh-plugins/)使用 Fumadocs，已配置 GitHub Pages 部署工作流，包含安装指南、全部插件、配置与开发说明。

```bash
pnpm run docs:dev        # 本地预览
pnpm run docs:typecheck  # 文档类型检查
pnpm run docs:build      # 静态导出到 apps/docs/out
```

首次启用 Pages 的步骤见 [apps/docs/README.md](apps/docs/README.md)。

## 开发

```bash
pnpm install
pnpm run check   # oxlint + manifest 校验 + node:test
```

插件都是无需构建的原生 ES 模块。目录结构与约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

插件代码采用 [MIT](LICENSE)。AI 小伙伴引用的角色素材另有非商业使用条款，不属于 MIT 授权范围，见[素材与署名说明](packages/ai-mascot/README.md#artwork-and-rights)。
