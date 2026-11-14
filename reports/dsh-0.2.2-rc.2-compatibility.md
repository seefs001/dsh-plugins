# DSH 0.2.2-rc.2 插件兼容性检查

检查时间：2026-11-12，Asia/Shanghai。

## 后续适配状态

已按用户要求完成三个插件的源码适配：

- remember-model / model-reference：rc.1 使用原有 `roots()`；rc.2 使用 `subagents.rootOf(agent)`，继续排除子代理选择。
- tool-lens：兼容旧 `subagentId` / `agent_id` 和新 `name` / `agent`，通过持久化目录解析名称及嵌套路径，在需要时读取冷目录；侧栏地址始终使用实际 Session ID 和直接父级。外部执行不打开本地会话，`lead` 不伪装成子代理。
- 三个受影响文件的 lint 无告警；JavaScript 语法检查、清单校验通过；现有测试 32/32 通过；没有新增或修改测试文件。
- 已用临时内存调用验证新旧根会话判断、旧 ID、新名称、嵌套名称、冷目录刷新及错误/外部目标。
- 用户已选择从官方 tag 构建，而非等待 npm 发布。独立源码目录为 [deepseek-harness-rc2](</Users/seefs/work/deepseek-harness-rc2>)，提交已核对为 `ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c`。
- 使用项目固定的 pnpm 11.28.5 安装依赖，执行 `pnpm run build:official --serial`，10 项 gate 全部通过，包括原生模块、Host/Client 编译与打包、Web 构建及两侧 aggregate 检查。新 CLI 输出 `0.2.2-rc.2`。
- 隔离的 home 和环回测试端口已通过启动与认证浏览器检查。真实 profile 解析了 24 层 bundle，没有跳过项；完整隔离依赖布局下没有插件导入或激活失败。插件页中现有启用项均保持启用，原先关闭的语音输入保持关闭。初次借用整个 node_modules 符号链接造成的 PTC 解析偏差已通过复制实体依赖目录纠正，不是 rc.2 API 不兼容。
- 额外发现第三方 `nowledge-mem-deepseek-harness@0.1.7` 未声明兼容 rc.2。向用户说明可能崩溃或数据丢失后，用户明确批准该插件与 `0.2.2-rc.2` 的精确版本豁免，已通过官方 CLI 添加；没有宽泛放行其他版本。
- 初始私有备份：[dsh-rc1-before-rc2-20261112-0150](</Users/seefs/.dsh-backups/dsh-rc1-before-rc2-20261112-0150>)，包含实际 DSH home、全局安装清单、原启动链接和插件 diff。切换程序会在停止 rc.1 后另做一致性备份。
- **实际服务已切换至 rc.2，原地址与插件加载检查通过。** 停服后完成一致性备份；实际切换与作业收尾结果见文末。临时 launchctl 作业已经撤销，不安装持久登录项。原 Bun 全局 rc.1 安装仍保留。
- 原地址认证页面和浏览器插件页通过；恢复会话后再次查询运行态，remember-model、model-reference、tool-lens、Nowledge、PTC 等已启用条目均为 `active`，Client 工具视图扩展仍正常注册。运行状态见 [upgrade-status.json](</Users/seefs/.dsh-backups/dsh-rc1-before-rc2-20261112-0150/upgrade-status.json>)。
- 验证边界：已覆盖新旧接口的临时契约调用、32 项现有测试、官方构建、隔离启动、原地址页面、实时插件状态和启动日志；未逐一手动回归所有历史子代理会话和完整工作流，不把插件开关或加载正常当作每项交互均经过端到端测试。

**以下为适配前的兼容性检查记录，保留原始发现和证据。**

## 结论

**不建议直接升级。仓库中 3 个插件存在确定的兼容性问题，且当前 web profile 正在引用这 3 个插件。**

- `dsh-remember-model`：切换模型时，保存默认模型的监听器会调用已移除的 `agents.roots()` 并抛错。
- `dsh-model-reference`：保存各模型推理强度的监听器有同样问题；不能因此推断整个 `#` 菜单都会失效。
- `dsh-tool-lens`：子代理侧栏快捷入口仍按旧 ID 协议解析；新版名称可能被误当作 Session ID，消息和中断行的入口也无法识别新参数。

这不是根据发布说明推测的结果。已对照 rc.1 与 rc.2 的官方源码，并调用仓库现有函数完成最小契约复现。但没有安装或运行 rc.2，不能把这些检查视为完整端到端验证。

## 版本与范围

| 项目 | 现场结果 |
|---|---|
| 当前 DSH | `0.2.2-rc.1` |
| 最新 GitHub Release | `dsh-v0.2.2-rc.2`，预发布版，2026-11-11 19:33:06 +08:00 发布 |
| 检查的上游版本 | rc.1 tag 与 rc.2 tag；rc.2 commit 为 `ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c` |
| npm 官方 registry | 查询时 `latest` / `next` 均仍为 `0.2.2-rc.1`，版本列表中没有 rc.2；不把 GitHub 发布等同于 npm 已可升级 |
| 插件范围 | 检查时仓库的全部 17 个包；下表不再列出此后已移除的插件，数量仍保留检查时的历史记录 |
| 当前安装关联 | Inspect 查到 remember-model、model-reference、tool-lens 的 Loader 条目；其安装目录均为指向本仓库的符号链接 |
| 元数据 | 全部 17 个包的 `engines.dsh` 均为 `>=0.2.2-rc.1 <0.3.0`，会放行 rc.2；57 条 Client inject 包名在 rc.2 中均仍存在 |
| 环境 | 当前 Node.js 为 `v26.12.0` |

来源：[官方发布](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.2)、[官方版本对比](https://github.com/deepseek-ai/deepseek-harness/compare/dsh-v0.2.2-rc.1...dsh-v0.2.2-rc.2)、[npm registry](https://registry.npmjs.org/@deepseek-ai%2Fdsh)。

## 确定受影响的插件

### 1. remember-model：默认模型记忆中断

位置：[isTopLevelSession](/Users/seefs/work/dsh-plugins/packages/remember-model/lib/index.js#L34-L52)。

插件先通过 `agents.get(sessionId)` 取出活跃 Agent，再执行 `agents.roots().includes(agent)`。rc.2 从 AgentRegistry 删除了 `roots()`，也移除了该层的运行时父子所有权字段。正常活跃会话的模型选择事件会进入这条调用路径。

最小复现：原函数在含 `get` 和 `roots` 的 rc.1 契约下返回 true；在仍有 `get`、但没有 `roots` 的 rc.2 契约下抛出 `TypeError: agents.roots is not a function`。

影响：该插件的默认模型保存和后续模型目录刷新路径中断。没有据此断言 DSH 本身无法切换模型，也没有假设原生默认模型保存能力全部消失。

### 2. model-reference：推理强度记忆中断

位置：[isTopLevelSession 及监听器](/Users/seefs/work/dsh-plugins/packages/model-reference/lib/index.js#L24-L50)。

该插件复制了相同的顶层 Agent 判断，最小契约复现也抛出相同 TypeError。影响的是用户切换模型后，按 `provider/model` 保存推理强度的功能。已有记录的读取、模型标签插入不一定随之失效。

这两个插件应改用当前 Subagent / Session 身份契约判断根会话，保留对子代理的排除；不能简单改成列举全部 Agent，否则会把子代理选择当作用户全局偏好。

上游证据：[rc.1 AgentRegistry，包含 roots](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.1/packages/core/agent/src/index.ts#L615-L629)、[rc.2 AgentRegistry，get/list 后不再提供 roots](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.2/packages/core/agent/src/index.ts#L575-L592)。

### 3. tool-lens：子代理快捷导航协议过期

位置：[subagentChild](/Users/seefs/work/dsh-plugins/packages/tool-lens/lib/client.js#L289-L299)、[openSubagent](/Users/seefs/work/dsh-plugins/packages/tool-lens/lib/client.js#L366-L386)。

rc.2 的变化：

- 委派结果由 `subagentId` 改为 `name`，文本变成 `started subagent <name>`。
- `send_message` 和 `interrupt_agent` 的参数由 `agent_id` 改为 `agent`，接受名称或 Session ID。

插件仍读取 `meta.subagentId`，否则从启动文本提取一个字符串并当成 Session ID。于是具名子代理 `reviewer` 会被拼入 Session 资源地址，而不是先解析其真实 ID。消息和中断行仍读取 `args.agent_id`，遇到新版参数时得不到目标。

最小复现：给现有 `subagentChild` 传入 rc.2 启动回执，返回 `reviewer`；传入 `send_message({ agent: 'reviewer', ... })` 的成功结果，返回 undefined。

影响范围是 tool-lens 增强的侧栏快捷按钮，不代表上游子代理工具本身不能运行。其余工具行也不能因此一概判为失效。迁移应识别新旧协议，并把名称解析为真实 Session ID，或从投影中查到对应条目后导航。

上游证据：[具名子代理迁移指南](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.2/docs/upgrade-guide/v0.2.2-alpha.3/subagent-names/guide.zh.md)、[rc.2 委派结果 schema 与 metadata](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.2/packages/subagent/tool-subagent/src/index.ts#L261-L272)、[rc.2 控制工具](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.2/packages/subagent/tool-subagent-control/src/index.ts)。

## 其余仍保留的插件

以下结论均为源码和契约层面的检查，**不是 rc.2 实机通过认证**。

| 插件 | 结果及建议回归点 |
|---|---|
| service-tier | 未发现确定断裂；使用的 `llm-pi-ai/model-defaults` 和配置访问路径仍在。验证 Responses 请求是否仍携带 priority。 |
| recent-sessions | 未发现确定断裂；Input Trigger 源码没有本轮变更，Session list 仍在。验证 `@` 会话排序。 |
| session-groups | 未发现确定断裂；注册的 Context Menu API 仍在，但上游侧栏布局、滚动与菜单有较大改动，验证入口、拖拽和右键菜单。 |
| compaction-status | 未发现确定断裂；投影注册和压缩事件契约仍能匹配，验证自动压缩与手动压缩状态消失。 |
| subagent-model | 未发现确定断裂；`session.subagent`、modelSelection 投影及输入框插槽仍存在。验证具名及嵌套子代理的模型显示。 |
| ai-mascot | 未发现确定断裂；其 Session 快照字段仍在，验证活动状态及浮动位置。 |
| quote-jump | 未发现确定 API 断裂；依赖聊天 DOM 与已加载历史，聊天历史加载和滚动行为有变动，优先做长对话跳转回归。 |
| auto-review-model | 未发现确定 API 断裂；Auto review 仍用 `purpose: 'auto-review'` 及 LLM stream，验证路由、日志和工具定位。 |
| web-access | 未发现确定断裂；这是插件自己的 Grok/OpenAI 搜索，不直接依赖被替换的原生搜索提供方。验证凭据可用性、工具注册和原生搜索屏蔽。 |
| git-changes | 未发现确定断裂；Forge follow、uncommitted localDiff 及 changes store 的 scoped 操作仍在。Forge 面板本轮改动较大，优先验证数字、打开面板及默认 Uncommitted 行为。 |
| pi-tools | 未发现确定断裂；工具注册、FS 和 subprocess 签名仍能匹配。本轮结构化错误扩展需要实际验证错误呈现；现有 lint 已有告警，见下文。 |
| switchboard | 未发现确定断裂；使用的 Session Controller、审批服务和 Agent 事件仍在。32 项现有测试覆盖了其部分桥接行为，但不是 rc.2 集成测试。 |

补充：已检查当前插件没有引用被删除的 `useAnchoredPosition` 或 `Menu.getAnchorRect`，所以不能仅凭浮层迁移说明就判定这些插件都要改。rc.2 也没有批量重命名本仓库引用的 Forge / Auto review 实验包；57 条 Client inject 依赖的身份检查全部通过。

## 插件之外必须注意的升级行为

1. **回退风险。** rc.2 创建具名子代理后，会写入 version 3 的 `subagent/catalog`。rc.1 不支持这种载荷，相关父会话无法直接用旧版打开。因此升级前备份会话存储；共享同一存储的进程同步升级，不要把“降级程序”当作完整回滚。
2. **归档工作树的行为改变。** 新版默认清理满足条件、由其记录创建的工作树，保留分支与提交。被忽略的文件不一定阻止清理。需要长期保留目录时，应预先核对 `retainOnArchive`。升级前旧建、没有创建记录的目录不在自动扫描范围内。
3. **原生搜索配置迁移。** 上游原生搜索默认提供方变化，与自定义 web-access 的 Grok/OpenAI 路径不能混为一谈。

来源：[具名目录持久化兼容性说明](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.2/docs/persistence-changes/2026-11-02-subagent-catalog-names.zh.md#compatibility)、[归档工作树迁移指南](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.2/docs/upgrade-guide/v0.2.2-rc.1/archive-worktrees/guide.zh.md)、[原生搜索迁移指南](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.2/docs/upgrade-guide/v0.2.2-rc.1/web-search-billing/guide.zh.md)。

## 验证记录与边界

- `pnpm run check`：未通过。lint 在既有 [pi-tools 源码](/Users/seefs/work/dsh-plugins/packages/pi-tools/lib/index.js#L84) 报 `no-shadow` 与 `no-array-sort` 两条告警，`--deny-warnings` 导致退出。这是在当前 rc.1 工作区发生的基线问题，不是升级造成的。
- `pnpm run validate`：通过，全部包清单有效。
- `pnpm run test`：32 / 32 通过。
- 两个 `isTopLevelSession` 函数及 tool-lens 协议解析的最小契约复现：确认上述兼容性问题。
- 17 个插件版本范围与 57 条 Client inject 包名检查：通过；此检查只能排除元数据阻挡和缺包，不能排除运行时 API 破坏。
- 没有新增或修改测试，没有修改插件源码、配置或锁文件，没有升级、重启、安装依赖或改变 profile。检查前已有的锁文件改动和未跟踪目录保留原样。本文件是唯一新增的检查记录。
- 未审计仓库之外的第三方插件内部实现，也未运行 rc.2 的浏览器端到端验证。

建议顺序：先修复两个根会话判断和 tool-lens 具名导航，再在隔离存储中回归模型记忆、子代理导航、Git 变更与长聊天定位，最后备份并升级实际 profile。

## 实际切换结果

- 原地址 http://192.168.31.72:3080 已切换至官方源码构建的 DSH 0.2.2-rc.2，进程 87340。
- 全局 dsh --version、带认证 HTTP 页面均通过。
- 原地址浏览器和关键插件开关：通过，TaskSpace 67 已正常关闭。
- 一致性备份：[quiescent-dsh-home](</Users/seefs/.dsh-backups/dsh-rc1-before-rc2-20261112-0150/quiescent-dsh-home>)。
- 切换状态：[upgrade-status.json](</Users/seefs/.dsh-backups/dsh-rc1-before-rc2-20261112-0150/upgrade-status.json>)。
- 这是独立官方 tag 源码构建；原 Bun 全局 rc.1 依赖未卸载。未提交或推送插件改动。

## 切换作业收尾与最终现场核对

- 发现 macOS `launchctl submit` 在进程退出后再次拉起切换程序。重复运行被旧 PID 身份检查挡住，但把状态重置为 waiting，并误追加了一条回滚说明。现场 CLI、监听进程和源码路径均确认 rc.2 一直在运行，没有发生回滚。
- 已移除临时 launchctl 作业，避免重复运行。移除后原地址仍由 rc.2 进程 87340 监听；没有安装持久登录项。
- 一致性备份为 233 MiB，包含实际会话、存储和 web profile。原 Bun 全局 rc.1 安装仍保留；若需要回退，必须一并恢复一致性备份，不能只换可执行文件。
- 当前官方源码提交与目标 tag 一致，源码 checkout 没有受跟踪改动；实际服务日志没有插件导入、激活、缺模块或旧 roots() 调用错误。
