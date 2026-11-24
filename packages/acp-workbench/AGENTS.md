# dsh-acp-workbench 协作约定

## 流式桥接与工具映射（`lib/native.js`、`lib/native-tools.js`、`lib/client.js`）

- 上游 `agy acp` 不流式上报工具参数，仅在整步结束（`usage_update` 之后）一次性发出带完整 `rawInput` 的 `tool_call`。空参数 `tool_call` 先通过 `preparingToolName` 立即进入 DSH `preparing` 态；正文后的长时间静默由前端 `acp-wait` 会话节点提示，不写持久日志、不改写原生 `AssistantNodeView`。
- 工具映射分两层：可语义对齐 DSH 原生工具的放 `lib/native-tools.js`（如 `update_steps` 映射到 `todo_write`、`manage_task` 映射到 `job_*`、`manage_subagents` 映射到 `list_agents` / `interrupt_agent`），其余放 `lib/client.js` 的 `ACP_TOOLVIEW_SPECS` 自定义披露行。

## 交互卡片、模式记忆与订阅用量（`lib/client.js`、`lib/native.js`、`lib/manager.js`、`lib/subscription.js`）

- 提问与审批对齐原生组件：`elicitation/create` 中 Antigravity 会把自定义回答拆成配对字段 `qN` + `qN_other`，选项可能含 `(Recommended)` / `（推荐）` 前后缀，需合并展示并对齐 DSH `QuestionComposer`；权限审批、计划审批分别对齐 `ApprovalCard`、`PlanReviewPanel`。
- 模式与模型选项持久化在 `provider.defaults`（含 `byModel`）：仅顶层用户会话读写，`origin === 'subagent'` 的子代理不继承也不污染；`manager.saveProvider` 保存配置时必须保留已有 `defaults`。
- 订阅用量无统一 ACP 标准，统一通过 `lib/subscription.js` 走各提供方的官方稳定接口并仅在用户交互触发时查询，不做后台轮询。

## 存储、连接与子进程生命周期（`lib/store.js`、`lib/manager.js`、`lib/client.js`）

- `chunks` 落盘裁剪 >32 KB 的大 `diff` 并剥离同 chunk 内同 `toolCallId` 的中间态重复 `diff`（`liveEvent` 保持原文）；flush 使用浅数组拷贝与防抖，避免整块 `structuredClone`。
- 非 ACP 会话不连接 `/acp-workbench/events` SSE；可恢复的空闲子进程受 `idleDisconnectMs` 与 `maxIdleRuntimes` 自动回收，保留 `remoteId` 供透明重连。
