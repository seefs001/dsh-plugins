# Workflow / Timeline 替代 Todo：概念与产品实践调研

调研日期：2026-11-16，Asia/Shanghai。

范围：先按“任务组织方式，尤其是 Agent 工作台”理解问题。研究一手文档、产品作者的说明，不修改实现，不预设用户要引入工作流引擎。下文将**来源事实**与**设计判断**分开。未核对当前 DSH/Paseo 的实现，不将建议描述成现有功能。

## 结论

**Workflow 和 timeline 可以替代 todo 作为工作主界面，但不能单独替代所有 todo 的语义。**

- **Todo / task**：还有什么要做，谁负责，什么算完成。
- **Workflow**：工作如何推进，当前处在什么阶段，有哪些条件、依赖和等待。
- **Timeline**：若指执行历史，则记录发生了什么、产生了什么结果、为什么改变方向；若指排期，则表示工作计划在什么时间发生。这两者必须区分。

在本次样本中，没有发现“workflow + timeline 替代 todo”是一个统一命名、统一规范的产品范式。更准确的概括是：**从待办清单中心，转向工作过程和成果中心；把待办保留为可执行事项的视图。**这是本文综合判断，不是某份文档的原话。

对 Agent 工作台，本文建议优先考虑：**工作目标 + 当前状态/下一步 + 精选执行时间线 + 少量待处理事项**。不建议第一步就做完整 DAG 编辑器或事件溯源系统。

## 1. 三个概念不是同一层的互斥选项

| 概念 | 核心对象 | 主要回答 | 更擅长的事 | 单独使用的缺口 |
| --- | --- | --- | --- | --- |
| Todo / task | 可执行工作项 | 还有什么要做？ | 捕捉承诺、分派、优先级、验收 | 很难表达循环、等待、尝试过程和未知工作 |
| Workflow | 流程规则，以及一次执行的当前状态 | 工作如何推进？现在在哪？ | 阶段、依赖、条件、并行、审批、异常路径 | 有流程不等于工作项、输出和历史都被记录 |
| Timeline：执行历史 | 按时间呈现的活动、决策和结果 | 刚才发生了什么？依据是什么？ | 追溯、协作、接管、定位阻塞来源 | 历史不会自动生成未来承诺、责任人和下一步 |
| Timeline：排期 | 带日期/跨度的项目或工作 | 什么时候做？如何协调？ | 里程碑、跨团队依赖、资源和工期 | 排期本身不负责执行，也不等于执行历史 |

“Workflow”本身也有不同强度：Linear 用它表示按团队定义的有序 issue 状态；Anthropic 在 Agent 架构文章里用它表示通过预定义代码路径编排 LLM 和工具。二者不能直接等同为“已经有可执行工作流引擎”。[S1][S2]

因此要先确定打算替代的是哪一层：

1. **界面层**：不再用一长串 checkbox 当默认工作界面。
2. **工作模型层**：不再把一切工作压成 pending / in progress / done。
3. **Agent 工具层**：是否仍要模型显式维护一份计划清单。
4. **执行系统层**：是否需要持久化、恢复、调度和权限控制。

这四件事可以分别演进。替换界面不意味着必须替换执行系统。

## 2. 一手实践说明了什么

### 2.1 Shape Up：最明确地反对“拿待办数量代表进度”

**来源事实：**

- 《Show Progress》明确说 to-do 不足以判断状态。清单里没有未完成项，可能是做完，也可能是下一批任务尚未被发现。
- 清单可能随着工作推进反而增长，所以不能仅靠剩余数量判断项目离完成有多远。
- Hill Chart 将视角从“完成/未完成”改成“未知/已解决”：上坡是搞清楚方案，下坡是执行已明确的工作。[S3]
- 这不是删除任务。《Map the Scopes》仍然把 scope 表示为 to-do list，具体任务放在 list 内。[S4]

**设计判断：**

值得替代的是“完成 7/10 项，所以完成了 70%”这种进度表达。对研究、排障和 Agent 编程，显示“关键未知是否解决、结果是否验证、当前被什么阻塞”，通常比计数更有意义。

注意 Hill Chart 是另一种状态表达，不是 timeline。不能因为它弱化 todo 计数，就把它称为时间线方案。

### 2.2 Linear：任务、工作流、排期和 Agent 活动同时存在

**来源事实：**

- Issue 是基本工作单位，随所属团队的 workflow 流转；workflow 是有序的 issue 状态组。[S1]
- 产品的 Timeline 是项目排期视图，明确只展示 projects，不展示 individual issues。[S5]
- AgentSession 另有活动记录。Agent 可发送 `thought`、`action`、`elicitation`、`response`、`error`，用户可产生 `prompt`；会话生命周期依据最后发出的活动自动管理。[S6]
- 同一份文档还提供 Agent Plan，明确是一份随执行变化的 session-level checklist。读取时标为 technology preview，可新增、修改、删除步骤，状态为 pending / inProgress / completed / canceled。[S6]

**设计判断：**

这是重要的反例：**活动时间线与动态计划可以并存**。活动解释过去，计划表达当前预期，issue 承载长期工作身份。不要让一个对象承担全部职责。

若借鉴活动分类，界面应显示公开进展摘要、工具动作与结果、问题和交付物，不应要求暴露模型内部推理。

### 2.3 Temporal / LangGraph：历史能参与恢复，但“有时间线”不等于“可恢复”

**来源事实：**

- Temporal Event History 是持久化的 append-only event log，用于状态存续，也可作为调试审计记录。[S7]
- LangGraph 的 checkpointer 保存 thread 的 graph state，文档将对话连续性、人工介入、time travel 和故障容错列为用途；跨 thread 数据由 store 承担。[S8]

**设计判断：**

可以借鉴“当前状态”和“执行历史”分开保存的思想，但 UI 时间线不是恢复机制。若没有检查点、输入输出、执行位置和副作用策略，显示“重试”按钮也不能保证安全恢复。

时间顺序也不是依赖关系。并行工作可能交错展示；重试可能针对同一工作步骤产生多个尝试。因此 timeline 不能替代 workflow 的因果和依赖语义。

### 2.4 Claude Code：Todo 工具不是唯一选择，也不是所有模型都必须维护清单

**来源事实：**

- 当前工具参考写明：在提供相关任务工具的会话中，`TodoWrite` 默认让位于 `TaskCreate` / `TaskGet` / `TaskList` / `TaskUpdate`，可以通过配置重新启用。[S9]
- Todo tracking 文档同时说明，较新的模型可以在没有书面 todo 清单的情况下跟踪多步骤工作；这些工具的默认可用性依赖模型和版本。文档建议在应用需要读取工具调用来记录任务活动或显示进度时再选择启用。[S10]

**设计判断：**

应区分两个需求：模型为了执行而维护计划，以及人为了理解工作而需要进度。前者可能弱化，后者并未因此消失。这也不是“Claude Code 改成 timeline”的证据。

以上是读取时的在线文档行为，不代表本地安装版本或其他 harness 的实现。

### 2.5 Ona：仍以 Todo 作为聚合执行细节的界面

**来源事实：**

- Ona 的工程文章说明，todo 不只辅助模型执行，也把多组工具调用和消息聚合到高层步骤下，用户按需展开细节。
- 作者把七个清单操作工具合成一个全量写入工具，降低工具选择复杂度，并让前端读取完整状态，而非必须重放增量变化。[S11]

**设计判断：**

这说明“更复杂的状态/事件架构一定优于 todo”不成立。若痛点只是列表更新不可靠、执行细节太多，简化现有清单和分组展示可能已经足够，无需工作流引擎。

## 3. “替代 Todo”具体可以走哪条路线

以下为本文对方案的归纳，不是行业标准分类。

### 路线 A：Workflow-first，按工作过程组织

将单个工作从“待办条目”提升为有阶段、条件和责任边界的工作对象。例如显示“正在调查问题，等待访问权限，拿到权限后继续验证”，而非只标为 in progress。

适合：重复流程、多参与者交接、审批、依赖和恢复需求明显的工作。

收益：等待与执行区分清楚，能表达并行和回退，也更容易控制哪些动作需要人介入。

代价：必须维护流程规则。探索型工作如果被提前固定为完整 DAG，计划会频繁失真。Workflow 不应被限定为只能单向推进；对开放任务，可以只固定关键边界，让内部步骤动态变化。[S2 为固定路径与动态 Agent 的区别提供依据；此处取舍为本文判断。]

### 路线 B：Timeline-first，按实际发生的工作组织

默认展示有意义的进展、决策、产物、失败和用户介入。用户先看“现在状态”和“最近发生什么”，再展开原始执行细节。

适合：长时间 Agent 执行、研究和排障、频繁调整计划、异步接管。

收益：能看见尝试过程和结果依据，不必从大量聊天与工具调用中自行拼出工作经过。

代价：历史记录容易膨胀。必须另外保留“当前状态、下一步、待我处理”，否则只剩流水账。时间线中的旧计划应保留为历史，不能与当前有效计划混成一份承诺。

### 路线 C：组合式，以工作为中心

工作对象承载身份、目标和结果；workflow 描述推进规则或当前阶段；timeline 展示活动证据；todo 只作为仍可执行、仍待处理事项的视图。

这是本文对 Agent 工作台的优先建议。它替换的是 todo 的中心地位，并不要求消灭任务。

## 4. 对 Agent 工作台的最小概念建议

以下仅为概念建议，不是已批准的实现规格，也不要求引入以下全部字段或实体。

### 4.1 主界面优先回答五个问题

1. 这项工作的目标与完成标准是什么？
2. 当前真的在做什么，还是已经停住？
3. 如果停住，在等谁、等什么？
4. 最近产生了什么可检查的结果？
5. 我现在需要决策、补信息、审核，还是不需要介入？

推荐的信息层级：

```text
工作：修复登录回归
目标：修复重定向失败，保留已有登录行为

当前：等待用户提供可复现账号
下一步：拿到账号后验证修复
待我处理：提供账号；尚不需要批准发布

执行时间线
  发现异常重定向，附请求记录
  排除缓存问题，附检查结果
  修改回调处理，附 diff
  本地检查通过，真实账号场景尚未验证
  请求用户提供账号

展开：当前计划 / 原始工具结果 / 已失效计划
```

这个例子只说明信息组织，不意味着必须采用固定流程阶段。

### 4.2 必须区分的概念

| 概念 | 含义 | 常见混淆 |
| --- | --- | --- |
| Work item | 长期工作的身份、目标、负责人和结果要求 | 把一条聊天或一次运行等同于整个工作 |
| Plan | 当前对未来步骤的预期，可修改 | 把计划写成已经发生的事实 |
| Workflow definition | 可选的流程规则或模板 | 把模板状态当成当前实例状态 |
| Run / attempt | 对工作的一次执行或尝试 | 把失败重试覆盖成没有发生过 |
| Activity / event | 实际发生的动作、决策或结果 | 把时间先后当作因果依赖 |
| Artifact / evidence | 可检查的产物、验证记录和结论依据 | 把“模型说完成”当成验收完成 |
| Todo / action view | 尚未处理的可执行事项或承诺 | 从历史记录自动猜出所有未来责任 |

不要求为每一行单独建表。这里是语义边界，不是数据库设计。

### 4.3 哪些 Todo 语义必须留下

- 尚未启动、但已经答应要做的工作。
- 明确责任人与优先级的下一步动作。
- 未来某个时间必须处理的承诺。
- 待审批、待回复、待审核的事项。
- 当前工作结束后仍然存在的 follow-up。

它们不一定叫 todo，可以叫待处理、下一步或收件箱，但不能指望纯执行历史完整代替它们。

### 4.4 不必一开始就做的东西

- 完整可视化 DAG 编辑器。
- 全量 event sourcing、所有界面都依赖事件重放。
- 每次工具调用都强制生成一个独立任务。
- 用完成任务数自动计算可信进度百分比。
- 为所有工作预先规定完整流程和所有异常分支。

更简单的起点：**工作卡片 + 显式当前状态 + 按工作分组的进展记录 + 待处理事项 + 产物链接**。仅当重复流程、持久化恢复或权限编排确实成为痛点，再评估更强的 workflow 能力。这与 Anthropic 建议先选择最简单方案、按需增加复杂度的原则一致。[S2]

## 5. 补充：Workflow 与 Timeline 融合，有没有现成叫法？

补充问题：是否有既表达流程推进，又表达执行经过的成熟概念？

**有接近的模型和产品叫法，但本次核对未找到对这种融合界面的统一标准名称。**

### 5.1 Workflow execution timeline：执行可视化的直接叫法

Temporal 的官方文章将其称为 Workflow 的 Timeline view。它不是简单追加日志，而是把相关事件组合为一个活动跨度：例如 scheduled / started / completed 合并为同一行，并显示持续时间、并行关系、失败和重试。[S12]

这已经融合了 workflow 的执行结构与时间维度。但它主要表达实际运行，不代表完整展示尚未走到的流程分支，也不是管理长期承诺的全部模型。

可用于检索的词：`workflow execution timeline`、`workflow visualization`。前者是描述性表达，不是独立标准。

### 5.2 Case Management / Adaptive Case Management：更接近工作组织模型

OMG 的 CMMN 官方介绍明确使用 event-centered approach 和 case file 概念，支持随着情况变化、以不可预先确定的顺序开展活动，并将其定位为 BPMN 的补充。[S13]

它把一件持续处理的事项作为中心，而非只把预定步骤串起来。对于研究、故障处理、客户问题和 Agent 开放式工作，这个视角有借鉴价值。

需要严格区分：**Case Management / Adaptive Case Management 是已有领域概念；CMMN 是正式建模标准；“workflow + timeline”界面不是 CMMN 的定义。** 不能声称采用时间线就实现了 ACM。

### 5.3 产品层经常是“同一事项的流程 + 活动记录”

Microsoft 的 Business Process Flow 用阶段和步骤指导记录处理，Timeline 则显示与记录关联的活动历史，也允许创建邮件和任务。[S14][S15] 这体现的是在同一工作上下文中并置过程与历史，而非另一个统一命名的范式。

### 5.4 如果为 Agent 工作台命名

本文建议使用 **工作时间线（Work Timeline）** 作为产品描述，定义为“以工作为中心，将当前推进状态与关键执行记录关联呈现”。这是建议命名，不是行业标准。

更明确的技术描述可以是 **workflow-driven activity timeline**，同样属于描述性用语。

一个可能的融合界面会包含：过去的执行事实、当前正在进行/等待的状态、未来仍可修改的计划。三者可以关联展示，但必须视觉区分：未来计划不是已发生事件；工作流的并行与依赖也不能被压扁为纯时间顺序。

不建议将这种界面直接命名为 Event Sourcing。事件溯源是状态持久化与重建的架构选择，并不是工作流时间线的同义词。

## 6. 尚未由来源解决的问题

- 用户所说的 timeline 具体是执行历史还是未来排期？本文以执行历史为主，已将另一含义单列。
- 目标产品是单 Agent 会话、多 Agent 工作台，还是个人长期任务管理？前两者更需要执行可见性，后者更需要捕捉承诺、提醒和优先级。
- 现有产品的痛点究竟是清单需要模型维护、进度失真，还是缺少后台运行和接管能力？三者对应的最小改动不同。
- 是否真的需要恢复执行，还是只需要回看过程？不能从一个 timeline UI 推导出执行引擎需求。

这些问题会影响实现选择，但不影响概念结论：**workflow 组织推进，timeline 解释经过，task 承载可执行承诺。**

## 来源与核对方式

所有来源均为官方文档、官方书籍或产品团队的一手工程说明。通过搜索定位，再直接读取原文相关段落；部分 HTML 响应有长度截断，Linear 相关页面另行完整提取正文，Claude / LangGraph 使用官方 Markdown 端点核对。未登录产品 UI、未运行这些产品进行功能验证。在线文档会变化，以下结论以读取时内容为准。

- **[S1] Linear，Conceptual model**：https://linear.app/docs/conceptual-model
- **[S2] Anthropic，Building effective agents**：https://www.anthropic.com/research/building-effective-agents
- **[S3] Basecamp，Shape Up，Show Progress**：https://basecamp.com/shapeup/3.4-chapter-13
- **[S4] Basecamp，Shape Up，Map the Scopes**：https://basecamp.com/shapeup/3.3-chapter-12
- **[S5] Linear，Timeline**：https://linear.app/docs/timeline
- **[S6] Linear，Developing the Agent Interaction**：https://linear.app/developers/agent-interaction
- **[S7] Temporal，Events and Event History**：https://docs.temporal.io/workflow-execution/event
- **[S8] LangGraph，Persistence**：https://docs.langchain.com/oss/python/langgraph/persistence （核对正文：https://docs.langchain.com/oss/python/langgraph/persistence.md）
- **[S9] Claude Code，Tools reference**：https://code.claude.com/docs/en/tools-reference （核对正文：https://code.claude.com/docs/en/tools-reference.md）
- **[S10] Claude Agent SDK，Todo tracking**：https://code.claude.com/docs/en/agent-sdk/todo-tracking （核对正文：https://code.claude.com/docs/en/agent-sdk/todo-tracking.md）
- **[S11] Ona，Tackling agent reliability: rethinking the todo tool at Ona**：https://ona.com/stories/rethinking-the-todo-tool
- **[S12] Temporal，Workflow visualization with Temporal**：https://temporal.io/blog/lets-visualize-a-workflow
- **[S13] OMG，Case Management Model and Notation**：https://www.omg.org/cmmn/
- **[S14] Microsoft，Business process flows overview**：https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/customize/business-process-flows-overview?view=op-9-1
- **[S15] Microsoft，Set up the timeline control**：https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/set-up-timeline-control
