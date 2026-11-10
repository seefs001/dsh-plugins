# 插件仓库体检报告

仓库：dsh-plugins · 生成时间：2026-11-10T11:44:42.165Z

分支：main · 提交：e4e9192 · 工作区：有未提交改动

> 本报告只做静态扫描。未加载插件、安装依赖、运行测试或验证 DSH 运行时兼容性。未发现静态错误不代表插件功能正常。Git 信息不可用时，不推断工作区干净。

## 总览

| 插件 | 错误 | 警告 | Host | Web | 有文档页 | 有改动 |
|---:|---:|---:|---:|---:|---:|---:|
| 11 | 0 | 1 | 11 | 9 | 10 | 1 |

错误和警告按 finding 计数，不是插件数。文档覆盖只检查约定路径是否存在；测试文件数只表示存量，不表示测试已通过。

## 插件清单

| 插件 | 版本 | 组成 | 静态状态 | 源码文件 / 字节 | 测试文件 | 文档 | 改动 |
|---|---|---|---|---:|---:|---|---|
| [dsh-agent-team](<file:///Users/seefs/work/dsh-plugins/packages/agent-team>) | 0.1.0 | host | 通过 | 1 / 665 | 0 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/agent-team.mdx>) | 是 |
| [dsh-auto-review-model](<file:///Users/seefs/work/dsh-plugins/packages/auto-review-model>) | 1.0.0 | host + web | 通过 | 2 / 60242 | 0 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/auto-review-model.mdx>) | 否 |
| [dsh-git-changes](<file:///Users/seefs/work/dsh-plugins/packages/git-changes>) | 0.1.0 | host + web | 有警告 | 2 / 12578 | 0 | 缺少 | 否 |
| [dsh-model-reference](<file:///Users/seefs/work/dsh-plugins/packages/model-reference>) | 1.3.0 | host + web | 通过 | 2 / 16152 | 2 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/model-reference.mdx>) | 否 |
| [dsh-quote-jump](<file:///Users/seefs/work/dsh-plugins/packages/quote-jump>) | 1.0.0 | host + web | 通过 | 2 / 12010 | 0 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/quote-jump.mdx>) | 否 |
| [dsh-recent-sessions](<file:///Users/seefs/work/dsh-plugins/packages/recent-sessions>) | 1.0.0 | host + web | 通过 | 2 / 3522 | 1 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/recent-sessions.mdx>) | 否 |
| [dsh-remember-model](<file:///Users/seefs/work/dsh-plugins/packages/remember-model>) | 1.2.0 | host | 通过 | 1 / 2638 | 1 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/remember-model.mdx>) | 否 |
| [dsh-service-tier](<file:///Users/seefs/work/dsh-plugins/packages/service-tier>) | 1.2.0 | host + web | 通过 | 2 / 9537 | 2 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/service-tier.mdx>) | 否 |
| [dsh-session-groups](<file:///Users/seefs/work/dsh-plugins/packages/session-groups>) | 1.0.0 | host + web | 通过 | 2 / 50956 | 0 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/session-groups.mdx>) | 否 |
| [dsh-tool-lens](<file:///Users/seefs/work/dsh-plugins/packages/tool-lens>) | 0.1.0 | host + web | 通过 | 2 / 34021 | 0 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/tool-lens.mdx>) | 否 |
| [dsh-web-access](<file:///Users/seefs/work/dsh-plugins/packages/web-access>) | 0.1.0 | host + web | 通过 | 2 / 43196 | 0 | [有](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/web-access.mdx>) | 否 |

## 仓库级提示

无仓库级提示。

## 插件详情

### dsh-agent-team

An opt-in Agent Team preset with named teammates, peer messaging, and a shared task board.

目录：[packages/agent-team](<file:///Users/seefs/work/dsh-plugins/packages/agent-team>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/agent-team.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/agent-team.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Agent Team | Adds a selectable Agent Team preset with named teammates, direct messages, and a shared task board. Other presets and the default selection stay unchanged. | description, title |
| zh | Agent Team 团队模式 | 新增可选的 Agent Team 预设，支持具名队友、直接通信和共享任务板。不修改其他预设或默认模式。 | description, title |

**Findings**

未发现静态问题。

### dsh-auto-review-model

Routes dsh Auto review requests to a model you pick from the locally available models, instead of the session's own model.

目录：[packages/auto-review-model](<file:///Users/seefs/work/dsh-plugins/packages/auto-review-model>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/auto-review-model.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/auto-review-model.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Auto review model | Lets Auto review judge tool calls with a model you pick from the locally available models, and add your own rules to its review prompt or replace it. | description, title |
| zh | 自动审查模型 | 让自动审查（Auto review）用你从本地可用模型中挑选的模型判断工具调用，并可在审查提示词后追加自己的规则或整段替换。 | description, title |

**Findings**

未发现静态问题。

### dsh-git-changes

A Git changes entry below the dsh composer: branch, added and deleted lines, and changed files; click to open the diff in the right Sidebar.

目录：[packages/git-changes](<file:///Users/seefs/work/dsh-plugins/packages/git-changes>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：缺少

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Git changes | Shows the branch and changed lines below the composer; click to open the diff in the right Sidebar. Needs Change requests &amp; worktrees. | description, title |
| zh | Git 变更 | 在输入框下方显示分支和改动行数，点击在右侧打开 diff。需要启用“变更请求和工作树”。 | description, title |

**Findings**

| 级别 | 代码 | 说明 | 位置 |
|---|---|---|---|
| 警告 | docs-missing | Add the conventional documentation page: apps/docs/content/docs/plugins/git-changes.mdx | [apps/docs/content/docs/plugins/git-changes.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/git-changes.mdx>) |

### dsh-model-reference

Type \# in the dsh composer to insert a model chip carrying that model's last reasoning effort and fast mode.

目录：[packages/model-reference](<file:///Users/seefs/work/dsh-plugins/packages/model-reference>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/model-reference.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/model-reference.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | \# Model reference | Type \# in the composer to insert a model chip, like an @ reference. The chip carries that model's last reasoning effort and fast mode, so you can ask the agent to run a subagent on a specific model. | description, title |
| zh | \# 引用模型 | 在输入框输入 \# 选择模型，像 @ 引用一样插入模型标签，并带上该模型上次使用的推理强度和快速模式，可让 agent 按指定模型开子 agent。 | description, title |

**Findings**

未发现静态问题。

### dsh-quote-jump

Shows quotes in dsh user messages as blocks; clicking one scrolls to the quoted text and highlights it.

目录：[packages/quote-jump](<file:///Users/seefs/work/dsh-plugins/packages/quote-jump>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/quote-jump.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/quote-jump.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Quote jump | Shows quotes in your messages as blocks. Click one to scroll to the quoted text and highlight it. | description, title |
| zh | 引用跳转 | 消息里的引用显示为引用块，点击后滚动到原文并高亮。 | description, title |

**Findings**

未发现静态问题。

### dsh-recent-sessions

Lists sessions in the dsh @ reference menu by last activity, newest first.

目录：[packages/recent-sessions](<file:///Users/seefs/work/dsh-plugins/packages/recent-sessions>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/recent-sessions.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/recent-sessions.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Recent sessions first | Lists sessions in the @ reference menu by last activity, newest first. | description, title |
| zh | 最近会话优先 | @ 引用菜单里的会话按最近活动时间排序，最新的排在最前。 | description, title |

**Findings**

未发现静态问题。

### dsh-remember-model

Saves the model and reasoning effort picked in a dsh session as the default for new sessions.

目录：[packages/remember-model](<file:///Users/seefs/work/dsh-plugins/packages/remember-model>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/remember-model.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/remember-model.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Remember last model | Saves the model and reasoning effort you pick in a session as the default, so new sessions start on it. | description, title |
| zh | 记住上次模型 | 把你在会话里选择的模型和推理强度存为默认，新会话直接沿用。 | description, title |

**Findings**

未发现静态问题。

### dsh-service-tier

A ⚡ fast-mode toggle beside the dsh model picker that sends service\_tier "priority" for OpenAI Responses models.

目录：[packages/service-tier](<file:///Users/seefs/work/dsh-plugins/packages/service-tier>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/service-tier.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/service-tier.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Fast mode \(service tier\) | Adds a ⚡ toggle beside the model picker for OpenAI Responses models. When it is on, requests for that model use service\_tier "priority". | description, title |
| zh | 快速模式（service tier） | 为 OpenAI Responses 接口的模型在模型选择器旁加一个 ⚡ 开关，开启后该模型的请求使用 service\_tier "priority"。 | description, title |

**Findings**

未发现静态问题。

### dsh-session-groups

Custom session groups for the dsh Web UI, stored on the Host, with pinned sessions leading each group.

目录：[packages/session-groups](<file:///Users/seefs/work/dsh-plugins/packages/session-groups>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/session-groups.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/session-groups.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Session groups | Organize sessions into your own groups, pin sessions inside each group, and keep the groups on the Host for every browser and the agent. | description, title |
| zh | 会话分组 | 把会话放进自定义分组，每个分组内可置顶会话；分组保存在 Host，所有浏览器和 agent 共享。 | description, title |

**Findings**

未发现静态问题。

### dsh-tool-lens

Richer tool-call rows for the dsh Chat. First lens: the skill row opens the skill's SKILL.md in the right Sidebar.

目录：[packages/tool-lens](<file:///Users/seefs/work/dsh-plugins/packages/tool-lens>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/tool-lens.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/tool-lens.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Tool lens | Richer tool-call rows in the Chat. Click a skill row's name to open its SKILL.md in the right sidebar. | description, title |
| zh | 工具透镜 | 增强对话里的工具调用展示。点击技能行的名称，在右侧栏打开对应的 SKILL.md。 | description, title |

**Findings**

未发现静态问题。

### dsh-web-access

Web search tools for dsh: pick a local Responses model and hosted web\_search / x\_search per backend, configured from the Plugins page.

目录：[packages/web-access](<file:///Users/seefs/work/dsh-plugins/packages/web-access>) · Node：^22.19.0 \|\| &gt;=24.0.0 · DSH：&gt;=0.2.2-rc.1 &lt;0.3.0

README：有 · 图标：有 · Bundle patch：有 · 文档页：[apps/docs/content/docs/plugins/web-access.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/web-access.mdx>)

**导出**

| 名称 | 目标 | 文件存在 |
|---|---|---|
| . | ./lib/index.js | 是 |
| ./client | ./lib/client.js | 是 |
| ./icon | ./icon.svg | 是 |
| ./locale/\*.json | ./locale/\*.json | 未检查 |
| ./package.json | ./package.json | 是 |

**语言**

| 语言 | 标题 | 描述 | Meta 键 |
|---|---|---|---|
| en | Web access | Adds grok\_search \(web + X\) and openai\_search tools. Pick a local Responses model and search type for each on this page. | description, title |
| zh | 联网搜索 | 新增 grok\_search（网页 + X）和 openai\_search 工具。在本页为每个工具选择本地 Responses 模型和搜索类型。 | description, title |

**Findings**

未发现静态问题。

## 依赖清单

仅按 manifest 声明汇总，不解析锁文件，也不推断传递依赖、实际安装状态或漏洞。

### 仓库内部依赖

未声明仓库内部依赖。

### 外部依赖

| 依赖 | 声明范围 | 类型 | 使用插件 |
|---|---|---|---|
| @deepseek-ai/dsh-experimental-tool-agent-team | 0.2.2-rc.1 | dependency | agent-team |

## 工作区改动快照

| Git 状态 | 路径 |
|---|---|
|  M | [CHANGELOG.md](<file:///Users/seefs/work/dsh-plugins/CHANGELOG.md>) |
|  M | [README.md](<file:///Users/seefs/work/dsh-plugins/README.md>) |
|  M | [README.zh.md](<file:///Users/seefs/work/dsh-plugins/README.zh.md>) |
| ?? | [apps/docs/content/docs/plugins/agent-team.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/agent-team.mdx>) |
|  M | [apps/docs/content/docs/plugins/index.mdx](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/index.mdx>) |
|  M | [apps/docs/content/docs/plugins/meta.json](<file:///Users/seefs/work/dsh-plugins/apps/docs/content/docs/plugins/meta.json>) |
| ?? | [packages/agent-team/LICENSE](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/LICENSE>) |
| ?? | [packages/agent-team/README.md](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/README.md>) |
| ?? | [packages/agent-team/cordis.patch.yml](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/cordis.patch.yml>) |
| ?? | [packages/agent-team/icon.svg](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/icon.svg>) |
| ?? | [packages/agent-team/lib/index.js](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/lib/index.js>) |
| ?? | [packages/agent-team/locale/en.json](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/locale/en.json>) |
| ?? | [packages/agent-team/locale/zh.json](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/locale/zh.json>) |
| ?? | [packages/agent-team/package.json](<file:///Users/seefs/work/dsh-plugins/packages/agent-team/package.json>) |
|  M | [pnpm-lock.yaml](<file:///Users/seefs/work/dsh-plugins/pnpm-lock.yaml>) |
| ?? | [reports/plugin-inspector-review.md](<file:///Users/seefs/work/dsh-plugins/reports/plugin-inspector-review.md>) |
| ?? | [reports/plugin-inspector-validation.md](<file:///Users/seefs/work/dsh-plugins/reports/plugin-inspector-validation.md>) |
| ?? | [scripts/inspect-plugins.mjs](<file:///Users/seefs/work/dsh-plugins/scripts/inspect-plugins.mjs>) |
| ?? | [scripts/plugin-inspector/README.md](<file:///Users/seefs/work/dsh-plugins/scripts/plugin-inspector/README.md>) |
| ?? | [scripts/plugin-inspector/contract.md](<file:///Users/seefs/work/dsh-plugins/scripts/plugin-inspector/contract.md>) |
| ?? | [scripts/plugin-inspector/format-markdown.mjs](<file:///Users/seefs/work/dsh-plugins/scripts/plugin-inspector/format-markdown.mjs>) |
| ?? | [scripts/plugin-inspector/render-html.mjs](<file:///Users/seefs/work/dsh-plugins/scripts/plugin-inspector/render-html.mjs>) |
| ?? | [scripts/plugin-inspector/scan.mjs](<file:///Users/seefs/work/dsh-plugins/scripts/plugin-inspector/scan.mjs>) |
