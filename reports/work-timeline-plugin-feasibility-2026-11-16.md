# 用 Work Timeline 插件替代 DSH TODO：深度调研与开发建议

日期：2026-11-16，Asia/Shanghai。

状态：研究提案，**不是已批准规格，也未实现插件**。基于当前 DSH 的运行时 Inspect、安装包源码、本仓库 Pi preset，以及外部一手资料。前置概念研究见 [workflow-timeline-vs-todo-research-2026-11-16.md](workflow-timeline-vs-todo-research-2026-11-16.md)。

## 0. 核心判断

**值得做；推荐做“会话内的工作进程追踪器”，不做一个新的工作流执行引擎。**

具体替换三件事：

1. 用有稳定步骤身份、阻塞原因和明确收尾的工作计划，替换 `content + 三态` 清单。
2. 用“当前状态 + 计划变更时间线 + 结果引用”替换单纯完成数量。
3. 让当前工作跨 turn 和上下文压缩保持可读，而不是仅靠模型记住之前的工具参数。

**融合的关键不是把所有内容画在一根时间轴上，而是让当前计划与实际经过属于同一项工作，并能互相解释。**

第一版可以不修改 DSH core，但必须对当前 Pi preset 做显式集成；仅安装一个全局同名工具不够。UI 有正式 slot 可替换，状态可由现有会话事件投影，最困难的限制是 codemode 嵌套调用的持久化语义。

### 推荐决策速览

| 问题 | 建议 | 理由 |
| --- | --- | --- |
| 产品定位 | Work Timeline，工作时间线 | 描述工作经过和当前推进，不承诺调度 |
| 数据归属 | 一个 Session 内的当前 Work | 延续现有所有权，避免一开始做共享任务平台 |
| 写协议 | 一份完整快照，步骤有稳定 ID，带期望 revision | 简单工具表面，同时防止改名丢身份、旧快照覆盖 |
| 读协议 | 独立 `work_read`，加简短运行时上下文 | 压缩后可恢复，不依赖历史工具参数仍在模型窗口 |
| 持久化 | 成功的顶层 `tool/result.meta` 携带完整状态 | 复用合法事件，不新造会话格式 |
| UI | 替换 TODO dock，保留聊天，展开变更时间线 | 改动集中，不重写 Conversation |
| 完成语义 | Agent 报告完成；验证依据单独展示 | 不把状态声明包装成验收事实 |
| codemode | 第一版禁止嵌套调用写工具，必须运行时拒绝 | 当前 Pi 不独立持久化子调用结果 meta |
| 多 Agent | 子 Agent 独立计划；主 Agent 汇总结果 | 不偷渡共享写入、分布式锁、任务调度 |
| 第一版不做 | DAG、自动推进、全局待办、自动重试、日历 | 它们属于另一层产品与执行机制 |

以上均为建议，不是对用户已有产品规则的假定。

## 1. 证据范围与核对边界

### 已核对

- Host Inspect：`Service.listService` 的 tools、sessionProjections、systemPrompt；`Event.listEvents` 的 tools/result；`Tool.listTools` 的实际 todo_write；`Config.listConfigs` 的工具和 Pi 包目录。
- Client Inspect：`conversation.input.dock`、`tool.call.toolview`、`sidebar.right.pane.tab` 的 live 声明、占位与 props。
- 安装包根目录：`/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/`。核对的 CLI manifest 版本为 **0.2.2-rc.3**；todo 包目录由 live Config 确认指向该安装树。Shell 未提供 DSH_INSTALL_DIR/DSH_NODE_EXECUTABLE，因此没有声称仅凭 shell 环境证明进程启动参数。
- live `dsh-pi-tools`：Config 返回 `/Users/seefs/.dsh/profiles/web/node_modules/dsh-pi-tools`；真实路径是本仓库 `packages/pi-tools`，版本 **0.3.0**。executor、loadout、state、patch 四个文件与当前工作区哈希一致。
- 外部：Ona 工程说明、Linear Agent 文档、Claude Agent SDK 类型、Codex 官方源码、Temporal 官方 UI 说明、OMG CMMN。
- Codex 查询时 main SHA：`98e1584a082234ae716a3cc69d4c6f2d3631cf2d`，提交时间 2026-11-16 07:33:58 UTC；plan handler/types 读取 current main，plan spec 用该 SHA 查询。

### 没有做

没有安装、卸载、启停插件，没有改 preset、产品代码或测试文件，没有调用业务 Remote 修改状态，没有读取真实用户会话日志，没有浏览器视觉验证，没有 prototype 或端到端运行。因此下文“可行”指**契约支持、源码路径可追踪**，不等于实现已验证。

## 2. 现有 TODO 到底有什么，缺什么

### 2.1 实际写入模型

`@deepseek-ai/dsh-tool-todo/src/index.ts`：

- 输入只有完整 `todos` 数组，每项是 `{ content, status }`。
- 状态为 pending / in_progress / completed。
- content 去空白后不能为空、不能重复；额外字段不接受。
- `allowParallelInProgress` 决定是否允许多个进行中。
- 工具直接向所属 Session append `todo/write`，然后返回清单和计数。
- 没有稳定 ID、原因、结果、依赖，也没有读回工具。[L1]

**注意：现有工具是在 execute 中写事件，而不是等工具最终结果提交。** 不应机械复制这种特殊内置事件写法，再发明第三方事件类型。

### 2.2 持久化与显示不是一回事

源码中的 todos projection：

```text
todo/write → 最新整份清单
turn/start → null
其他事件 → 原状态
```

所以准确说法是：**历史清单确实持久化，但“当前清单”在新一轮开始时被清空。** turn/end 不清空，结束后仍能看见；下一轮开始才清。文档 Summary 的“跨 turns 保持最新计划”不能替代这里的实际 reducer 行为。[L1]

这直接说明新插件需要显式 Work 生命周期，不应继续把“一个 turn”当作“整项工作的生命期”。

### 2.3 内置 UI 已经有差异展示

现有实现不是完全没有历史：

- 输入区 TodoPanel 展示 todos projection，按 content 作为 React key。
- 工具详情有新增、移除、状态变化、顺序调整等 diff。
- diff 按文字 title 匹配身份；改名会表现成删除旧项和新增新项。
- 若分页尚未取得前次清单，详情明确显示旧清单不可用。[L2][L3]

因此新插件的差异化不能只是“画一条时间线”。真正的新能力应该是：**身份稳定、跨轮连续、阻塞可解释、变化有原因、结果可追溯。**

### 2.4 当前 Pi preset 的特殊性

live Host 顶层 `include:tool-todo` 是 inactive，但当前 Agent 仍能调用 todo_write。原因不是 Inspect 不一致，而是当前 Pi preset 自己挂载了 `pi-todo`。

`packages/pi-tools/cordis.patch.yml`：

- `pi-todo` 注册 `@deepseek-ai/dsh-tool-todo`。
- `pi-tools.config.scopedTools` 包含 todo_write。
- Pi 的工具目录、直接调用和 codemode 绑定由自己的 loadout/executor 决定。[L4]

**替换必须同时处理：工具注册、Pi 工具目录、提示词与 UI。** 只隐藏原面板，模型仍会使用旧工具；只增加新工具，Pi 可能不暴露；同一 scope 重复注册同名工具会报错。[L5]

## 3. 外部实践：哪些值得借鉴，哪些不能照搬

| 一手样本 | 核对到的设计 | 值得借鉴 | 不能误读为 |
| --- | --- | --- | --- |
| Ona | 七个工具合成一个完整列表写入；消息有 group ID / item ID；工具消息聚合到步骤 | 减少工具选择，稳定关联身份，完整状态易恢复 | 每个 Agent 都需要复杂 DAG；步骤完成就是自动验证 |
| Claude Task 工具 | 创建返回任务身份；TaskUpdate 按 ID 更新；blocks/blockedBy、owner | 身份与文字分离，后续协作和依赖有位置 | 这些字段本身提供 timeline 或验收 |
| Codex update_plan | explanation + 完整 plan；三态；handler 发 PlanUpdate，不执行计划 | 变更原因应是一等信息；计划与执行分开 | 结构化清单就是执行器 |
| Linear Agent | 活动与 Agent Plan 并存；计划可随执行增删改 | 当前意图与过去活动分开存义、一起呈现 | 一个 timeline 就能替代未来计划 |
| Temporal | 把 scheduled/started/completed 组合成活动跨度，展示并行与重试 | 多条底层事件聚合为有意义的执行记录 | 只画 Timeline 就获得可靠恢复 |
| ACM / CMMN | 围绕 case 信息，随事件与新发现调整活动 | 以工作事项为中心，不强制预定全部路径 | 第一版必须支持 BPMN/CMMN 建模标准 |

来源：[E1] 至 [E7]。

### 3.1 Ona 的经验尤其相关

Ona 明确说 todo 同时承担**给人隐藏执行细节**的职责，并使用消息级 group/item 关联。它也描述了两个实际问题：问题被折叠藏住、最终答案被归到最后一步导致用户找不到。因此加入打断提醒、错误反馈和结束提示。[E1]

对本插件的启发：

- 当前 DSH 不应假装已经有所有消息到步骤的准确关联。
- 只提炼公开进展、工具结果和用户决策，不把模型内部推理记录当作需要公开的工作日志。
- 没有明确 ID 时，不要用“发生在某步骤进行中期间”当作强关联，尤其并行执行时。
- 第一版不接管聊天流的折叠。用户提问、权限请求、最终回答保持原位可见。
- 可以先展示“计划变更记录 + 用户/Agent 明确附上的证据”，比自动整理全量消息可靠。

### 3.2 稳定 ID 与完整快照不冲突

“完整列表更新”和“每项有稳定 ID”是两个独立选择。

完整快照降低工具调用和前端状态拼接复杂度；稳定 ID 则解决改名、重排和引用。第一版可以兼得，不必因为加了 ID 就立刻设计七八个增删改工具。

代价也必须正视：清单越大，每次更新的 token 越多。适合短期会话计划，不适合千条长期 backlog。应测量实际 token 与更新次数，再决定是否需要增量写入。

## 4. 建议的产品边界

### 4.1 第一版解决的用户问题

> 不再只看到“完成了几项”，而是随时知道 Agent 正在推进哪项工作、为什么停住、计划如何变化，以及结论来自哪里。

四个默认入口：

1. **现在**：当前步骤和工作目标。
2. **等待**：阻塞原因、需要用户做什么。
3. **接下来**：当前有效计划，不伪造具体日期。
4. **经过**：已发生的计划变更和结果引用。

### 4.2 与现有功能不重叠

- 不替换 DSH `goal`：goal 负责持续续跑，本插件负责工作可见性。Work 完成不能自动 complete goal，反之也不能自动把步骤全勾完。
- 不替换 `workflow` 工具：它是编排子 Agent 的执行能力，本插件只追踪计划与经过。
- 不替换 plan mode / exit_plan_mode：待批准的实现方案，与运行中的进度计划不同。
- 不替换 agentTeams：团队任务共享与领取属于另一种所有权。
- 不接管权限：被标为 blocked 不等于获得权限；用户批准不能由 Agent 的状态更新代签。

这些区分也影响命名：不把新工具叫 `workflow`，避免与已存在工具撞名。

### 4.3 推荐界面

```text
工作：修复登录回归                         [展开]
当前：第二版修复待真实账号验证
等待你：提供可复现账号

当前计划
  ✓ 复现并定位问题
  ✓ 修改回调处理
  ! 验证真实账号场景
  ○ 整理交付结果

工作经过
  r1 创建计划
  r2 发现原判断不成立，增加回调检查
  r3 报告修改完成                    [diff]
  r4 本地检查通过                    [结果引用]
  r5 验证受阻，等待账号

说明：修改完成由 Agent 报告；真实场景尚未验证。
```

计划按逻辑次序，经过按发生次序。桌面可用上部摘要、下部时间线；窄屏默认折叠，只露当前与阻塞。先不要用水平甘特图：探索工作通常没有可信工期，长文本和并行分支也难适配。

第一版时间线定位为**语义修订与依据时间线**，不是完整执行 trace。显示时间默认是“状态报告被记录的时间”，不是实际开工/完工时间。未经工具生命周期和步骤身份的明确关联，不应计算精确工时或绘制看似精确的执行跨度。

“等待你”只能来自显式阻塞声明或真实待答/待审批对象；不得仅凭 Agent 没调用工具就推断。

## 5. 领域词汇草案

这里只记录该研究提案的词汇，不建立仓库级已决 GLOSSARY，也不把尚未批准的规则写成 ADR。

| 词 | 在本插件中的含义 | 避免混称 |
| --- | --- | --- |
| Work，工作 | 有目标与完成标准、可跨多个对话轮次推进的一项工作 | turn、session、workflow run |
| Plan，计划 | 对该工作当前有效的步骤安排 | 执行历史、批准过的实现规格 |
| Step，步骤 | 计划中可识别、可更新的行动单位，改名不改变身份 | tool call、聊天消息 |
| Revision，修订 | 一次被接受的计划状态更新 | 模型尝试、工具重试次数 |
| Activity，活动 | 实际已记录的变化或执行事实 | 将来准备做的步骤 |
| Evidence，依据 | 支持状态/结论的可检查引用 | 自动验收证明 |
| Blocker，阻塞 | 使步骤无法继续的显式条件 | Agent 空闲、工具偶发报错 |
| Timeline，时间线 | 对已发生活动的可读投影 | 当前计划、未来日历 |

工作流在这里是“工作状态与推进关系”的描述，不是必须建立一个 WorkflowDefinition 对象。第一版不需要模板和 Run 调度模型。

## 6. 数据模型与状态语义草案

### 6.1 最小数据形状

这是待实现验证的候选形状，不是已经存在的 DSH schema。

```text
WorkSnapshot
  schemaVersion
  workId
  revision
  title
  objective
  status: active | completed | canceled
  steps[]
    id
    content
    status: pending | in_progress | blocked | completed | canceled
    blocker?                 # blocked 必填
    outcome?                 # 说明已得到的结果
    evidenceRefs[]?          # 可选，必须带来源和可解析位置
  updateReason?              # 改目标、取消、回退、重开时必填
```

- workId 由 Host 创建，作用域是所属 Session。Step ID 可由模型提供短标识、由 Host 校验并保持稳定；不使用 content 的哈希作为身份。
- revision、事件时间、事件顺序来自 Host，不让模型自报“已经 r12”或制造历史时间。
- `in_progress` 是最后一次明确报告的步骤状态；是否正在计算由宿主运行状态另外表示。
- evidenceRefs 的具体格式要在实现阶段选定已支持的会话事件/文件/产物引用。不提供任意本机文件读取捷径，不在这里只凭字符串发明可用的深链路。
- 默认一 Session 只有一个 active Work；完成/取消后才能创建下一项，历史仍在原工具调用中。长期多 Work 导航留到下一期。

### 6.2 最小状态表

状态主体：Step。公开 Interface：`work_update` 对完整快照的验证；持久化观察点：该成功调用已提交的 `tool/result`。

| 原状态 | 新状态/操作 | 候选规则 |
| --- | --- | --- |
| 不存在 | 创建 pending | 新 ID 不重复；也可在同次创建中明确开始某步骤 |
| pending | in_progress | 明确开始；可有多个，不强制“只能一个” |
| pending / in_progress | blocked | 必须记录 blocker；不能用 blocked 代替未经请求的权限批准 |
| blocked | pending / in_progress | 说明阻塞解除；清除当前 blocker，旧 blocker 留在历史 |
| in_progress | completed | 记录结果摘要；有依据则附引用，没依据不假称已验证 |
| pending / blocked | completed | 允许已有工作被直接确认完成，但必须解释依据，不能要求伪造一个运行过程 |
| 任一未结束状态 | canceled | 需要原因；不能从清单里静默删除 |
| completed / canceled | pending / in_progress | 显式重开及原因；旧完成/取消记录不覆盖 |
| 任意状态 | 相同状态 | 可改文字/补依据；完全相同快照为 no-op，不增加修订 |
| 任意状态 | 未知状态、重复 ID、缺失旧 ID | 拒绝整次写入，不做半更新 |

工作级规则：

- active → completed：必须有收尾说明，不能仍有 pending / in_progress / blocked；canceled 的步骤必须解释为什么不影响工作交付。
- active → canceled：必须说明取消原因，并处理所有未结束步骤。
- completed / canceled → active：只有显式重开，说明原因；不是 turn/start 自动触发。
- completed 不等于外部审批通过，也不等于工作产生的变更已发布。

这些规则是待用户认可的产品建议，特别是“如何判定整项工作完成”仍应在开发前定稿。

### 6.3 与执行状态正交

以下事件**不自动把步骤置 completed/canceled**：

- turn/end：一轮回答结束不等于工作完成。
- 用户按 Stop：执行停止，不等于工作被取消。
- 工具返回错误：一次尝试失败，不一定阻塞整项工作。
- 子 Agent 结束：子结果未必完成了主步骤。
- 页面断线：观察断线不等于执行停住。

界面可显示“步骤最后报告为进行中；Agent 当前空闲/已停止/状态未知”。它比强行改写业务状态更诚实。

### 6.4 不变式

1. 每个步骤在工作内的 ID 唯一且可追溯；改名不新建身份。
2. 当前快照只来自已接受并提交的更新；失败写入不改变当前计划。
3. 计划修改不删除历史活动，不修改原始聊天。
4. 被取消、跳过或验证失败不能被计作已交付。
5. 时间顺序不冒充依赖关系；第一版不依据位置自动执行步骤。
6. Agent 的声明和宿主已观察事实区分来源。
7. 所有模型需要的工作上下文都能从会话持久记录重建。
8. 不允许跨 Session 写入；fork 继承不是共享所有权。

## 7. DSH 插件的接入方案

### 7.1 推荐：一个核心模块，两个薄适配层

```text
work_read / work_update
          │
          ▼
工作核心模块：校验、修订比较、生成完整快照
          │
          ▼
标准顶层 tool/result.meta
          │
          ▼
sessionProjections：当前状态 + 有界变更摘要
          ├── work_read / 运行时上下文
          └── wire.view → useProjection → TODO 替代面板
```

核心模块的 Interface 应小：读取当前工作、准备一次经过验证的替换。工具负责调用及返回；UI 只读投影。不要把业务验证分别写进 React、工具和 reducer。

第一版无需独立数据库，无需一个新的长期运行 daemon。这里只依赖标准会话日志与投影缓存，不承诺业务工作自动恢复执行。

### 7.2 状态承载：现有 tool/result，而非新事件类型

已验证的能力：

- `ToolDefinition.output` 必须提供 schema 与 render，可提供 `presentationMeta(args, value)`。
- `tool/result` 允许 JSON meta；顶层 batch 会将 result.meta 随标准事件提交。
- projection 可以读取此 meta，只接受自有 namespace、支持的 schemaVersion、成功结果，投影完整快照。
- `ctx.sessionProjections.register()` 必须 await；stateVersion 负责缓存语义变更；Client 使用 wire.view 与 useProjection。[L6][L7]

建议 namespace 类似 `dshWorkTimeline`，实际名称在实现时固定。模型工具结果只需简短确认、workId、revision、当前阻塞等；用于 UI 的完整快照不必全部重复灌入自然语言回复。

**不能做：**

- 第三方随意 append `work/update` 新事件类型。
- 把 `appendPluginRecord()` 当稳定第三方写入接口。当前代码与官方实践明确将它保留给 DSH experimental 包。[L8]
- 在 projection.apply 内进行异步 I/O、发工具、生成新事件。
- 同时将 DB 与 Session 都当权威状态，却不解决提交失败和分叉一致性。

官方 projection 文档要求状态承载事件使用完整 post-change state。即使 UI 展示 diff，持久载体也应保留完整快照；diff 可以由相邻修订计算。[L7]

### 7.3 工具 Interface 建议

候选两个工具，名称不与现有 workflow/goal/plan-mode 工具重叠：

- `work_read`：返回当前 Work、revision、待做/阻塞摘要；可按 ID 读取当前工作中的步骤详情。初期不需要通用查询语言。
- `work_update`：创建或替换一份当前 Work 快照；对已有 Work 带 `workId + expectedRevision`，Host 生成下一个 revision。

校验策略：

- 省略旧步骤 ID 不解释为“完成”或“删除”，直接拒绝并提示显式取消。
- 旧 revision 返回冲突和当前 revision，要求重新读取；不静默覆盖。
- 相同快照无副作用 no-op；显式重开/取消/改变目标需要 reason。
- 默认工具调度不声明 concurrency-safe，让直接调用形成写屏障。
- 第一版仅单 Agent 写入，UI 不直接改状态，因此暂不引入通用命令总线、跨进程锁或多写者事务。

这比四个 CRUD 工具更小，也比原 TODO 保留了更多身份和原因。若实测完整快照 token 成本过高，再考虑按 ID 的批量变化输入；持久化结果仍可为完整快照。

### 7.4 核心限制：当前 Pi codemode 的嵌套 meta 不会独立入日志

已追踪的路径：

1. Pi `NestedCalls.execute` 调用 pipeline.prepare / dispatch / complete。
2. 它向脚本返回 content 和 structuredContent，但没有把子 result.meta 附到外层结果。
3. 嵌套路径没有顶层 batch 的 Session `tool/call` / `tool/result` append。
4. 外层 codemode 只把自身 store 变化等内容包装为自己的 meta。
5. 真正将结果 meta append 到 Session 的代码位于 DSH `BatchSettlement.commit`。[L9][L6]

因此，**“新写工具返回成功及 meta → 当前计划被持久化”只对已核对的顶层调用成立。** 放进 codemode，不能据此保证。

现有 todo_write 在嵌套调用中仍能改变清单，是因为它在 execute 内直接 append 内置 todo/write；不是 Pi 自动替每个子工具保存了结果。

第一版最低成本路线：

- `work_update` 检查 `exec.parent`，嵌套调用在任何变更前拒绝，并告诉模型直接调用。
- 工具 description 明示；但不能只靠 description，必须有运行时拒绝。
- `work_read` 可以是只读，但仍需验证 Pi structured result 适配；不要默认未经 bridge 的工具值形状都正确。
- 在直接调用路径验证“写 → 读 → 新一轮 → 重开会话”后再谈嵌套支持。

后续支持 codemode 需要一个真实提交方案，不只是把 metadata 拼回去：

- 两次嵌套更新如何看到前一次尚未提交的状态？
- 外层脚本失败、用户中断后，已经返回成功的内层更新是否生效？
- 外层重试如何去重？
- 父/子调用记录如何避免重复应用？

解决这些意味着修改 Pi adapter 的持久化/事务语义，应作为单独范围，不应藏进 TODO 插件的第一版。

### 7.5 替换工具时的 scope 与 preset 集成

tools.register：不同作用域可 shadow，同层重复名称拒绝；tools.restrict 对 scoped context 的继承工具做限制，不能把它当任意删除同 scope 插件的 API。[L5]

推荐在后续实施时显式修改本仓库拥有的 Pi preset 集成：

1. 挂载 Work 工具适配。
2. 移除/停用该 preset 的 pi-todo。
3. 将 scopedTools 中的 todo_write 换成 work_read / work_update。
4. 检查 Pi 的已保存工具选择，新会话默认包含新工具。
5. 检查所有提示词中对 TODO 的指令，避免模型仍被要求调用已不存在的工具。

如果要独立 bundle 改已有 preset，当前 Loader patch 对 `config` 是完整替换，不是深合并；preset plugins 是配置数组，不是可以假定独立 patch 的 live Loader 子行。需要完整保留原配置，或由 Pi preset 提供明确兼容入口。[L10]

已有会话保留其 preset revision。配置更新应在新 Session 核验，不能承诺所有已打开会话立即切换。[L10]

### 7.6 UI 接管已获 live contract 支持

**主面板：** `conversation.input.dock`，list slot，当前 TODO entry 的 id 为 `todo`、order 为 0。Inspect 明确同 id 替换同一 cell；可以用自己的渲染器接管，不需要 DOM 查询或 CSS 隐藏。[I1]

**工具调用卡片：** `tool.call.toolview`，key 是精确工具名。为 work_update 注册新 view；原 todo_write 的历史卡片可以保持宿主原实现。Preparing 阶段参数可能不完整，不能提前当已接受计划。[I2]

**旧会话兼容：** Client 插件可能在 profile 内全局接管同一 dock cell，而旧 Session 仍持有旧 preset。替代 renderer 必须按会话数据选择：有 Work 时展示新界面，仅有 todos 时展示兼容清单，两者都无则隐藏；不能因为某个 Session 还没有 Work 就把旧 TODO 全局遮掉。兼容清单可以由插件用公开 payload 自行渲染，不应依赖加载宿主私有 React 模块。

**详情：** `sidebar.right.pane.tab` 支持自有 tab renderer，但还需要 tab type 与打开动作注册，只有 renderer key 不是完整接入。第一版可只用 dock 内展开，避免在未核对额外契约前承诺右栏集成。[I3]

实现时应使用宿主主题 token、locale、现有层级与间距；不 import 未承诺稳定的 Host UI primitive runtime 模块，不替换 app root。

### 7.7 Context 压缩与提示词

`ctx.systemPrompt.context()` 是动态上下文贡献，runtime 在请求 admission 刷新并作为持久 user-role snapshot 接纳；不是直接篡改请求 messages。`section()` 用于静态工具使用规则。[L11]

建议：

- 静态 section 只说明何时创建工作、何时更新、如何读回。
- 动态 context 只放 workId、revision、当前步骤、阻塞和读取入口，不重复整条历史。
- 有效工作跨 turn 保留；模型失去历史时用 work_read。
- 不靠每次工具调用后都注入长提醒来强迫维护清单。
- 区分“插件来源的状态摘要”和用户指令；标题、理由、证据文字不能被提升为更高权限指令。

Pi 当前具体 context 抑制策略与 token 成本仍需实现时验证，不能单凭 API 存在保证每个 preset 都显示相同内容。

## 8. 恢复、迁移和真实边界场景

### 8.1 推荐第一版行为

| 场景 | 应有表现 | 不应发生 |
| --- | --- | --- |
| 下一轮继续同一工作 | 保留当前计划，提示最后修订 | turn/start 自动清空 |
| 用户问一个旁支问题 | 不自动新建/覆盖工作 | 每条消息都变成新 Work |
| 改写步骤文字 | 同 ID 的内容修订 | 当成完成旧项、新建新项 |
| 发现多一步工作 | 新 ID、新修订、说明原因 | 用“进度倒退”掩盖新发现 |
| 中途取消某步骤 | 保留取消状态及原因 | 静默移除 |
| 工具报错后重试成功 | 保留原失败尝试引用 | 重写成从未失败 |
| 已完成后发现问题 | 显式重开、旧结果仍可追溯 | 悄悄撤销完成历史 |
| Agent 空闲但有 in_progress | 显示最后报告与运行状态不一致 | 假称一直在后台运行 |
| 宿主进程重启 | 从日志恢复相同工作状态 | 从前端 localStorage 猜恢复 |
| 插件卸载再装 | 通用工具结果仍可读，投影可重建 | 写入无法重开的自定义 Session 事件 |
| 新子 Agent | 自己的 Work；主计划不自动共享 | 子任务顺便覆盖主清单 |
| fork 子会话 | 标识继承计划，写入归属子 Session | 使用全局 workId 让父子互相覆盖 |
| 并行两个写请求 | 直接路径串行；旧 revision 冲突 | 后写无声吞掉前写 |
| 直接写成功后回复中断 | 已提交的工作状态保留 | 因 final answer 未送出而清空 |
| 写失败/取消、未提交结果 | 当前计划不前进 | 显示“保存成功”但重开消失 |

fork 的状态可由 Host projection 初始化收到的 inheritedEventCount 区分；不要用本机时间猜继承边界。[L7]

### 8.2 老 TODO 的迁移

推荐保留旧工具历史卡片，不改写旧日志。

导入旧清单只能作为**一次新的显式迁移快照**：保存原有 content/status，生成新的稳定 ID，记录来源事件。旧清单没有 ID、原因和依据，不能推导出可信的跨修订身份，也不能伪造过去完成时间。

第一版可不支持迁移，旧会话继续用旧 preset，新会话启用 Work 插件。以后若做“接续旧清单”，必须让用户知道这是导入，而不是无损升级。

回滚也要分层：卸载 Client 贡献可恢复原 slot occupant，但**不会凭空恢复已从 Pi preset 移除的工具**。完整回滚需恢复原 preset 的 pi-todo 与 scopedTools 配置，再以新 Session 验证；保留新 Work 的原始工具记录，不尝试将其无损降级成三态 TODO。

## 9. 分期与成本取舍

### P0：实现前必须做的最小验证

这是未来实施的验收清单，本轮没有创建测试或跑写入实验。

1. 自有工具直接调用产生合法 result.meta；projection、wire、dock 同步更新。
2. work_read 能读回，第二次直接调用能看到前一修订。
3. 新 turn、重开 Session、上下文压缩后，工作语义不丢。
4. 嵌套调用被明确拒绝，不能出现脚本显示成功而实际不持久化。
5. Pi 新 preset 的工具目录、直接执行、工具 picker、codemode 可见性一致。
6. TODO slot 同 id 接管与卸载恢复，旧历史卡片不受损。

P0 的目标不是漂亮 UI，而是消除“写成功但恢复丢状态”的根本风险。

### P1：推荐第一版

- work_read + work_update。
- 一 Session 一个 active Work，稳定 Step ID、五态、理由、结果摘要。
- 完整快照与 revision 校验。
- 输入区摘要与可展开的修订时间线。
- 简短 runtime context；原聊天和权限 UI 保留。
- 仅直接调用可写，UI 只读。
- 不自动启动工具、Agent、后台 job 或 goal。

### P2：有使用证据再加

- 历史 Work 浏览与更多活动分页。
- 显式产物/事件关联、从引用跳回宿主位置。
- 用户编辑/重开，工具与 UI 共用同一 Host operation；需先决定合法持久化路径。
- 轻量步骤依赖，以及主/子 Agent 的显式关联。
- codemode 写入，需要完成前述事务语义。

### 暂不投入

| 功能 | 引入的成本/风险 | 当前发生依据 | 更简单替代 |
| --- | --- | --- | --- |
| 自动将所有工具调用归属步骤 | 并行和异步归属错误、协议改动 | Ona 需要消息 item ID；DSH 未核对到同类业务关联 | 显式依据引用，未归属活动不猜 |
| 完整 DAG 与调度器 | 循环、重试、取消、权限、恢复语义 | 本需求尚未证明需要 | 只展示推进状态，复用现有执行工具 |
| 多 Agent 共享写入 | 并发冲突、跨会话身份、所有权 | 当前 TODO 明确单 owner | 子 Agent 独立，主 Agent 汇总 |
| 独立数据库与事件溯源 | 双写、迁移、fork 一致性 | 会话日志已有必要能力 | result.meta + projection |
| 自动完成检测 | false positive，模型声明冒充验证 | 同类工具的状态本质仍是报告 | 展示来源与证据，保留人工判断 |
| 每步频繁强提醒 | token、延迟、交互打扰 | Ona 报告漂移，但本插件未实测 | 短上下文 + read 工具 + 有界错误反馈 |

这些不是要现在实施的“加固项”。只有真实使用或验证暴露需求，再单独评估与批准。

## 10. 验收指标：什么才算比 TODO 更好

不以界面更复杂或记录更多为成功标准。

### 正确性底线

- 不发生静默丢步骤、身份漂移、未提交就显示成功。
- 同一日志切点的当前状态可重建，fork 不跨 Session 污染。
- 计划变更与执行事实的来源可区分。
- 无新权限绕过；用户待答、审批、最终答案不被折叠隐藏。

### 使用价值

- 用户无需展开所有聊天就能回答：当前在做什么、为什么停、需要我做什么。
- 模型压缩后能通过一次 read 继续正确维护工作。
- 改计划时能说明与上一版的区别，而不是重新列一份看似无关的清单。
- 更新工具调用次数和 token 增量可接受。与原 todo_write 在相同任务上比较，不预先声称节省多少。

建议未来用四类真实场景验证：线性小任务、探索后改计划、用户打断/补条件、并行子任务。遵循仓库规则，不因本报告自行新增单元测试文件；实施时优先现有检查和获准的端到端验证。

## 11. 开发前只需定稿的产品选择

这里不阻塞研究；它们会影响后续实现范围。

1. **只换显示还是替换工具？** 本文推荐替换工具与显示，否则无法可靠加入身份、阻塞和读回。
2. **单会话还是跨会话工作？** 本文推荐第一版限定单会话，但跨 turn 保留。
3. **是否接受写操作暂时必须直接调用？** 接受则插件可保持小范围；不接受则需要把 Pi codemode 的提交协议纳入实施。
4. **用户第一版是否必须直接编辑计划？** 本文推荐先只读，用户通过正常对话纠偏；直接编辑需要额外持久化契约，不能只在 React 改状态。

如果接受上述默认值，下一步应先做 P0 持久化与接管验证，再实现 P1。现在还不应开始做全套工作流设计器。

## 12. 一手来源与本地契约索引

### 外部来源

- **[E1] Ona，Tackling agent reliability: rethinking the todo tool at Ona**。直接读取全文，核对 whole-list、group/item ID、打断与隐藏结果问题：https://ona.com/stories/rethinking-the-todo-tool
- **[E2] Claude Agent SDK，TypeScript reference**。完整获取官方 Markdown 后定位 TaskCreateInput、TaskUpdateInput、TaskGetOutput、TaskListOutput：https://code.claude.com/docs/en/agent-sdk/typescript.md
- **[E3] Claude Agent SDK，Todo tracking**。任务工具的模型/版本可用性与新模型无书面 todo 说明：https://code.claude.com/docs/en/agent-sdk/todo-tracking.md
- **[E4] OpenAI Codex**。官方 repo，通过 gh 读取： [plan.rs](https://github.com/openai/codex/blob/98e1584a082234ae716a3cc69d4c6f2d3631cf2d/codex-rs/core/src/tools/handlers/plan.rs)、[plan_spec.rs](https://github.com/openai/codex/blob/98e1584a082234ae716a3cc69d4c6f2d3631cf2d/codex-rs/core/src/tools/handlers/plan_spec.rs)、[plan_tool.rs](https://github.com/openai/codex/blob/98e1584a082234ae716a3cc69d4c6f2d3631cf2d/codex-rs/protocol/src/plan_tool.rs)。未将搜索结果中的社区 issue 或“默认禁用”说法当作本报告事实。
- **[E5] Linear，Developing the Agent Interaction**。Agent Plan 与活动分离：https://linear.app/developers/agent-interaction
- **[E6] Temporal，Workflow visualization with Temporal**。活动跨度、事件分组、并行与重试：https://temporal.io/blog/lets-visualize-a-workflow
- **[E7] OMG，CMMN**。事件与 case-centered 工作模型：https://www.omg.org/cmmn/
- **[E8] Shape Up，Show Progress**。任务计数不足以判断进度：https://basecamp.com/shapeup/3.4-chapter-13

### 本地来源

以下 `INSTALL/` 指 `/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/`，`REPO/` 指 `/Users/seefs/work/dsh-plugins/`。行号用于本次读取定位，升级后可能变化。

- **[L1]** `INSTALL/dsh-tool-todo/src/index.ts:69-106,119-214`；`README.md`。输入校验、turn/start 清空、直接 append todo/write。
- **[L2]** `INSTALL/dsh-client-ui-conversation/src/client/skeleton/TodoPanel.tsx:70-137`。content key、useProjection、dock 注册。
- **[L3]** `INSTALL/dsh-client-ui-tool/src/client/tool/models/todo-diff-model.ts:17-81`。按 title 比较，处理未知 baseline。
- **[L4]** `REPO/packages/pi-tools/cordis.patch.yml`；`lib/loadout.js:15-85,260-292,362-423`。preset 内 TODO、目录选择、直接及嵌套绑定。
- **[L5]** `INSTALL/dsh-tools/src/index.ts:120-190`；live Service tools。scope、重复注册与 restrict。
- **[L6]** `INSTALL/dsh-tools/src/contracts.ts:17-82`；`src/batch.ts:242-269`；`INSTALL/dsh-session/src/types.ts:365-394`。output/meta、独占调度、顶层结果持久化。
- **[L7]** `INSTALL/dsh-session-projection/README.md:32-143`；`src/index.ts:318-380`；live Service sessionProjections。完整 post-state、同步投影、注册与缓存语义、fork cut。
- **[L8]** `INSTALL/dsh-session/src/index.ts:480-522`；`INSTALL/dsh-agent-preset/skills/dsh-doc/references/practices.md`。第三方持久化扩展限制。
- **[L9]** `REPO/packages/pi-tools/lib/executor.js:1-88,166-204`；`lib/index.js:40-61`；`lib/state.js`。嵌套调用无独立 Session append、外层 state meta 路径。
- **[L10]** `INSTALL/dsh-agent-preset/skills/dsh-doc/references/compositions.md`；`references/composition-reference.md`。完整 config 替换、preset revision、安装与激活边界。
- **[L11]** `INSTALL/dsh-system-prompt/src/index.ts:78-91,589-615`；`INSTALL/dsh-agent-loop/src/agent.ts:442-477`。动态 context 刷新与持久接纳。

### Live Inspect 来源

- **[I1]** Client Slots.listSubTree `{root: "conversation.input.dock"}`：TODO id=todo，order=0；同 id 替换；提供 useProjection 等标准 props。
- **[I2]** Client Slots.listSubTree `{root: "tool.call.toolview"}`：按 tool name 分发；preparing/start/result 三阶段；原 todo-toolview active。
- **[I3]** Client Slots.listSubTree `{root: "sidebar.right.pane.tab"}`：tab renderer keyed 接口，需配合 tab type。
- Host Tool.listTools：当前 Agent 的 todo_write 完整 schema 与读取的源码一致。
- Host Config.listConfigs：tool-todo 顶层 inactive，Pi preset 与 Pi presentation 已挂载；包路径与本地代码相符。

最终证据结论：**UI 替换点、标准工具结果载体与投影链路已核对；Pi 集成与嵌套调用限制已从源码定位；候选工作模型、交互和完成规则仍是提案；全部实现和视觉效果待验证。**
