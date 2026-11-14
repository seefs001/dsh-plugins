# Orbit bridge P1 实施记录

日期：2026-11-14。依据：`/Users/seefs/work/skills/docs/research/2026-11-14-orbit-dsh-always-on-design.md` 的 P1“最小只读执行桥”。主报告未修改。

## 结论

新增 `packages/orbit-bridge`（`dsh-orbit-bridge` 0.1.0，Host + Web）。本地静态检查通过；未安装到任何 profile，页面、Agent 工具、guard 对实际 preset 的效果、Schedule 和重启恢复均未在运行中的 DSH 验证。

## 实现范围

| 报告要求 | 实现 | 状态 |
|---|---|---|
| Routine / RunAggregate，绑定 scope 与 revision | `orbit_bridge` storage domain，表 `routines`、`runs`；任何确认、暂停、恢复、归档、修改都让 revision 加一并取消进行中的运行 | 已实现，未实机验证 |
| 完整分页与 Observation | `get_me` + 每项目 `list_task_statuses`、`list_tasks` 全分页；cursor 空、重复、无效，缺 `next_cursor`，页数或任务数超限，项目交叉，必填字段缺失均为 partial | 已实现，未实机验证 |
| 两种基线 | 每次从已提交 runs 推导，无独立指针；partial 不移动任何基线，未提交结果只移动 observed | 已实现 |
| 连接身份 | `get_me` 的用户、工作区、token ID、scopes、授权项目生成指纹；无法验证即 partial；指纹或 scope 变化只建新基线 | 已实现 |
| 去重 | 每规则、每 Agent 最多一个进行中运行；变化相对已处理基线计算；稳定变化键 | 已实现 |
| 受限 observe/submitOutcome | `orbit_bridge_observe`、`orbit_bridge_submit_outcome`；调用方可见工具超出允许集即拒绝；运行中 guard 拒绝其他工具和范围外项目；取消信号向读取传播，取消后不推进基线 | 已实现，未实机验证 |
| 复用原生 Schedule | 只生成 `ScheduleCreateRequest` 草稿，`reviewed: false`、`createdByBridge: false`；不调用 Schedule 服务 | 已实现 |
| 规则卡、结果卡、暂停、错误 | 侧边栏面板 + main 页；用户确认类操作只走 owner HTTP（`connection.admit` 且 principal 为 owner） | 已实现，未在浏览器验证 |
| 时间规则（T09） | 未做；README、文档、页面写明只报告项目变化 | 未实现 |

P2 到 P5（webhook、写动作、Decision、外发通知、多 worker）均未开始。

## 契约来源

- 工具管线：已安装 DSH 0.2.2-rc.3 的 `dsh-tools/src/{executor,contracts,pipeline,index}.ts`，以及 lead 提供的运行时检查结果 `runtime-contracts.json`。`ctx.tools.execute(ToolBatchInput)` 整批执行；无 Agent 时 `ask` 判为 `APPROVAL_UNAVAILABLE`；`restrict` 只作用于全局工具，故另加 guard。
- MCP 结果：`dsh-mcp-client/src/tools.ts`，成功值 `{ content, structuredContent? }`，`isError` 抛错转为失败结果。
- Orbit：本会话只读调用 `list_projects`、`list_tasks`（含翻页和无效 cursor）、`list_task_statuses`、`get_me`。`structuredContent` 为 `{ items, next_cursor }`，末页 `next_cursor: null`。
- PTC 执行器：`dsh-tool-executor-ptc/src/index.ts` 只接受 `run_code` 直接调用，因此桥在 PTC 下失败即关闭。
- 本环境的子代理没有 Inspect 工具；运行时数据来自 lead 保存的检查文件。

## 已知限制

- 只支持原生工具执行器。
- `orbit_bridge_observe` 被调用前插件不限制会话；没有现成的受限 preset，preset 是否受限需人工确认。
- 开发连接带 `tasks:write`、`docs:write`；Host 自身不调用写工具，但这是源码性质，不是沙箱。
- 单 Host，无跨进程协调。
- Agent 运行在读取完成 20 分钟后未提交结果判为失败；没有定时器，只在读取状态、开始新运行或提交时惰性检查。读取阶段卡住的运行依赖 MCP 自身超时或重启恢复。
- Routine 与 Run 两表无事务：暂停或修改已写入、取消运行写失败时，旧运行仍为 running，但 observe 复用前先校验状态、确认和 revision，旧运行不会被复活，迟到提交也因 revision 不符被拒。

## 监工复核结论

- 指定实现模型：`messages/claude-opus-5-5`，推理强度 `xhigh`。另由同型号子代理做独立 UI/UX 静态审查。
- lead 已复读关键读取、状态转换、结果提交、权限闸门和最终差异。审查发现的分页缺字段、同 Agent 多 run、范围外读取、取消传播、卸载收尾、旧 revision 覆盖，以及暂停写入后取消 run 失败时的复用窗口均已修正。
- UI 审查的 H1–H3、M1–M3 已复核通过，无残留阻塞项；这只表示已列出问题的静态复核通过，不是浏览器验收。
- lead 独立运行现有测试，32 项通过；最终三个 JavaScript 文件语法检查、包结构校验及 `git diff --check` 通过。
- 交付级别：未提交、未安装的 P1 本地实现。没有受限 preset 和真实 Host 联调证据，不能认定常驻运行或完整 P1 运行验收已经完成。后续须另行批准安装、权限配置及 Schedule 创建。

## 验证

- `pnpm run lint`、`pnpm run validate`：通过。
- `node --check` 三个 lib 文件：通过。
- `pnpm run test`：现有 32 项通过（本包无测试）。
- `pnpm run docs:typecheck`：在 UI 修复和 mdx 更新之后运行，exit 0；最后一轮只改 Host 复用闸门和文档措辞，未重跑。
- `npm pack --dry-run`（包目录）：包含 README、patch、icon、lib、locale、package.json。
- 早期在 `/tmp/ob-smoke/run.mjs` 用模拟服务跑过一次冒烟（首扫基线、无变化、仅 version 变化、分页失败、cursor 循环、项目交叉、grant 撤销、身份变化、Agent 拒绝与 guard、暂停后迟到提交），之后按审查意见修改了代码且未重跑。它不是实际 Host 集成验收，未执行真实故障注入。
