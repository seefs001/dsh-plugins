# Super Kanban 对 Work Timeline 的参考价值

调研基线：`topmindspace/dsh-super-kanban`，版本 `0.10.2`，提交 `98aca9f30e9d9093eee3db8aef74f136bb6480fa`。调研请求日期：2026-11-16。

## 结论

值得借鉴的重点是「需要人处理的事项优先」「交付物就近可达」「完成依据明确」，不是把 Work Timeline 改成四列看板。

Super Kanban 是跨会话任务管理层；Work Timeline 是单会话内由 Agent 显式更新、可从事件回放的工作记录。两者可以互补，不宜直接迁移整套扫描、研判和持久化架构。[S1][S2][L1]

## 调研范围与证据边界

- 读取 README、设计文档、架构、契约，以及 Client 的任务信号、详情抽屉、产物选择、续做逻辑和 Host 的人工验收处理。
- 查看仓库现有 `drawer-light.png`、`side-panel.png` 两张截图。作者说明截图使用虚构演示数据，因此它们是界面布局参考，不是实际运行可靠性的证明。[S1][S3]
- 未安装、未运行参考插件，未调用其模型或读取本机会话日志。未操作浏览器，未运行参考仓库脚本。
- 本次只新增这份报告，没有修改现有 Work Timeline 的 UI 重设计 diff。

## 最值得借鉴的六点

### 1. 首屏回答「我要看什么、处理什么」

参考插件的任务抽屉先展示目标、验收条件、待处理信号、主交付物和验收入口，再展示研判、关键事实和子任务。截图与实际渲染代码对应，不只是 README 宣传。[S3][S4]

**对我们的建议：** 保留「计划 / 过程 / 产物」，但把上方概览收紧为标题、状态、当前阻塞或下一步，以及明确交付物的入口。修订号、继承说明、状态来源解释降为次级信息或可展开说明，避免元信息挤占首屏。没有阻塞时不画空阻塞卡，没有交付物时不留大块占位。

这是本轮最值得先做的纯 UI 调整，现有 snapshot 已有 title、objective、steps、artifacts，不必增加业务状态。

### 2. 任务状态、会话运行与人工验收分开看

它分别提供任务列状态、`taskRunningLabel`、`attention` 和 `completionBasis`。人工验收写入 `completionBasis: "user"`，锁定状态并写入用户历史。`turn/end` 可以产生待审阅记录，但不会直接改变任务列状态。[S5][S6][S7]

**对我们的建议：** 继续坚持「报告完成不等于已验收」。若以后显示「会话运行中」，必须接入实际运行信号，不能从步骤 `in_progress` 推导。若增加人工验收，应有独立、可持久化的确认事实，关联具体工作修订，而不是客户端把绿色勾号点亮。

这不是纯 UI 改动。我们目前没有人工验收协议，不能只加按钮就宣称支持验收。

还要注意参考插件的用词：它把轮次结束后的提示也称为「待审批卡片条」，不能将它与 DSH 的工具权限审批混为一谈。[S7]

### 3. 交付物不要藏在第三个标签里

参考插件用 `primaryArtifactOf` 优先挑选非缺失的 deliverable，再按时间排序；如果只是普通文件，详情会写「最近修改文件」，不会一律称为交付物。概览内就能打开文件并查看来源。[S4][S8]

**对我们的建议：** 将显式 `role: deliverable` 的文件提升到概览或完成结果旁。依据仍放在产物视图。不要把任意修改文件自动升级成成果。

我们目前没有「主交付物」字段，也没有每个产物的发布时间。纯 UI 阶段可以显示明确交付物入口或列表，不应擅自挑一个并称为「主要」或「最新」。明确主产物需要后续协议设计。[L1]

### 4. 「继续处理」应生成可检查的草稿

参考实现先用本地模板整理目标、验收条件、关键事实、问题、未完成子任务和文件引用，再允许编辑并放入关联会话或新会话。输入框有草稿时保留原文；成功放置也由用户自己发送。[S9][S10]

**对我们的建议：** 我们已拥有工作目标、未完成步骤、阻塞和产物，可以生成「继续当前工作」或「整理交接」草稿，不需要额外调用模型。后续实现先核实当前 DSH 的输入框草稿契约，不能照抄参考仓库的桥接方法名。不要把继续按钮做成自动发送、自动启动或恢复后台任务的隐式授权。

### 5. 视觉层级依靠排版与动作位置，而不是堆卡片

仓库任务抽屉截图以标题、灰色分区标题、细分隔线和小图标组织内容，重点动作贴近对应事项；右侧会话视图保持紧凑行。设计文档要求窄容器切换单列、保留常用动作和可访问名称。[S3][S11]

**对我们的建议：** 保留刚重做的步骤轨道和宿主主题 token，进一步减少嵌套边框、重复状态标签和过大的固定概览。文件旁放预览，阻塞旁放定位步骤。先把单个会话侧栏做好，无需同时增加全局页与悬浮窗。

这是基于参考截图与源码的信息设计判断，不代表已看过我们新版页面的实际渲染。

### 6. 时间线用于解释变化，来源用于核对事实

参考插件在证据、关键事实和文件旁保留来源会话与事件序号，不能定位时不伪造序号；项目时间线去重同源事件并提供跳转入口。[S7][S11]

**对我们的建议：** 我们的历史已有 `reason`、`seq`、`time` 及步骤/产物变化。优先突出「新增产物」「解除阻塞」「调整计划」等有意义变化，而不是只显示修订编号。后续可核实宿主是否支持打开对应会话记录，再补来源跳转。无需再用模型摘要一遍已经结构化的变更。[L1]

## 不建议直接迁移的部分

| 参考实现 | 原因与替代方案 |
| --- | --- |
| 扫描磁盘会话日志和投影缓存，再由规则/LLM推断任务 | 它用于补全跨会话工作，适合其定位；我们已经有显式 `work_update` 事实源。迁移会增加第二套真相、模型预算、过期摘要与版本兼容问题。保留 Session projection。[S2][L1] |
| 四列拖拽、项目日程、任务合并、全局归档 | 这是跨任务规划，不是本次替换 Pi TODO 所需。若未来需要，作为上层汇总产品设计，不塞进每条会话的进度面板。[S1][S11] |
| 全局、侧栏、悬浮三套入口 | 参考插件还需维护三种形态的互斥和显示偏好；我们先保留输入区摘要和侧栏两处即可。[S11] |
| 快聊和另一套模型选择 | 与当前会话 Agent 的能力重叠，超出工作跟踪范围。[S1] |
| 根据会话停止或轮次结束直接完成工作 | 参考插件本身也没有把 `review` 等同于任务完成；我们更不应该这样做。[S7][L1] |

## 建议落地顺序

1. **先改信息布局，不改协议：** 收紧概览、突出阻塞和下一步、交付物入口前置、降低元信息权重、保留现有三视图。
2. **再考虑继续/交接草稿：** 核实 DSH 的草稿放置 API，明确不覆盖输入、不自动发送。
3. **单独设计人工验收：** 定义由谁确认、确认哪次修订、更新后如何显示；之后才考虑增加验收条件和对应入口。
4. **跨会话汇总最后考虑：** 优先聚合已有 Work 事实，不先引入磁盘扫描和 LLM 二次研判。

## 来源

所有远程源码链接固定到本次检查的提交。

- [S1 README：定位、功能与截图说明](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/README.md)
- [S2 架构：扫描、模型研判、本机状态与增量更新](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/docs/ARCHITECTURE.md)
- [S3 任务抽屉截图](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/docs/screenshots/drawer-light.png)；[右侧视图截图](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/docs/screenshots/side-panel.png)
- [S4 Client：任务概览与主交付物](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/client.js#L4739-L4796)
- [S5 Client：进度、运行状态与验收资格](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/client.js#L1283-L1324)
- [S6 Host：人工验收处理](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/server/service.mjs#L2737-L2763)
- [S7 契约：任务、证据、review 与人工验收](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/docs/CONTRACT.md)
- [S8 Client：产物规范化与主产物选择](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/client.js#L1597-L1627)
- [S9 Client：本地续做模板](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/client.js#L3881-L3924)
- [S10 Client：放置草稿、保护既有草稿](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/client.js#L4010-L4048)
- [S11 设计文档：信息层级、布局、时间线与入口](https://github.com/topmindspace/dsh-super-kanban/blob/98aca9f30e9d9093eee3db8aef74f136bb6480fa/docs/DESIGN.md)
- [L1 当前 Work Timeline 状态与事件投影](../packages/work-timeline/lib/model.js)；[当前 UI（本地未提交重设计）](../packages/work-timeline/lib/client.js)
