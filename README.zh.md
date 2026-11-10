<div align="center">

# dsh-plugins

seefs 的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）插件集：让选模型、切模型更顺手，并改进 Web 界面的几处细节。

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](README.md) | 中文

</div>

## 插件

| 包 | 作用 | 组成 |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | 在输入框输入 `#` 插入模型标签，带上该模型上次的推理强度和快速模式。 | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | 在模型选择器旁加 ⚡ 开关，为 OpenAI Responses 模型发送 `service_tier: "priority"`。 | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | 新会话沿用你上次选择的模型和推理强度。 | Host |
| [`dsh-recent-sessions`](packages/recent-sessions) | `@` 菜单里的会话按最近活动排序，最新的在前。 | Web |
| [`dsh-session-groups`](packages/session-groups) | 在侧边栏面板里自定义会话分组，组内置顶的会话排在前面。 | Host + Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | 指定自动审查判断工具调用时用的模型和审查提示词。需要启用 `@deepseek-ai/dsh-experimental-auto-review`。 | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | 用户消息里的引用显示为引用块，点击后滚动到原文并高亮。 | Web |
| [`dsh-tool-lens`](packages/tool-lens) | 更好用的工具调用行。技能行可在右侧边栏打开该技能的 `SKILL.md`。 | Web |
| [`dsh-web-access`](packages/web-access) | 新增 `grok_search`（网页 + X）和 `openai_search` 工具，在 Plugins 页选择本地 Responses 模型和搜索类型。 | Host + Web |

每个插件都能单独使用。`dsh-model-reference` 和 `dsh-service-tier` 一起装时，`#` 标签会带上 ⚡。

## 环境要求

- dsh `>=0.2.2-rc.1 <0.3.0`
- Node.js `^22.19.0 || >=24`
- 浏览器端插件需要 Web 界面（`dsh web`）。

## 安装

从 GitHub 安装到某个 profile（这里是 `web`），用 `path:` 指定仓库里的单个包：

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/service-tier"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/remember-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/recent-sessions"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/session-groups"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/auto-review-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/quote-jump"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/tool-lens"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/web-access"
```

也可以在 Web 界面的 **Plugins** 页粘贴同样的地址安装。安装后 bundle 会自动启用；开启 `patchReload: live` 时无需重启。

从本地克隆安装：

```bash
git clone https://github.com/seefs001/dsh-plugins.git
dsh plugin --profile web add link:$PWD/dsh-plugins/packages/model-reference
```

## 配置

有状态的插件（`model-reference` 的推理强度、`service-tier` 的快速模型、`session-groups` 的分组、`auto-review-model` 的模型和提示词）通过 dsh 的 config editor 写入 profile 的 `cordis.patch.yml`，重启和升级后都会保留。各配置项见对应包的 README。

## 开发

```bash
pnpm install
pnpm run check   # oxlint + manifest 校验 + node:test
```

插件都是无需构建的原生 ES 模块。目录结构与约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
