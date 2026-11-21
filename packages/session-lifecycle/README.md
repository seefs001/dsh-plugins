# dsh-session-lifecycle

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中按处理状态整理会话：把待审批和提问提到侧栏顶部，折叠进行中的会话，并通过 Host 同步暂缓、归置和未读轮次结果。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `@deepseek-ai/dsh-storage-domain` |
| 数据保存 | Host `session_lifecycle` 与 `session_lifecycle_summary` storage domain |
| 结果投影 | `session-lifecycle-outcome` |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/session-lifecycle"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/session-lifecycle"
```

## 侧栏分区

| 分区 | 包含内容 |
| --- | --- |
| 需要你 | 等待审批、计划审阅或回答问题的会话；子任务归并到主会话下，点击直接打开提问的子会话。只有此类会话计入角标。 |
| 进行中 | 正在运行、排队等待继续或子任务仍在执行的会话，默认折叠；当前打开或已置顶的会话保留原位。 |
| 最近返回 | 近 24 小时内结束、唤醒或取消归置的会话，按返回时间排序。 |
| 已暂缓 / 已归置 | 设定了提醒时间或手动/自动归置的会话，收在侧栏底部。 |

在会话右键菜单中可选择 **暂缓**（预设或自定义本地时间）、**归置**、**立即唤醒**、**取消归置** 或 **永不自动归置**；每次调整均支持撤销。

在 **待处理 → 设置** 中可开关「折叠进行中的会话」和调整自动归置闲置天数（默认 7 天，可关闭）。Host 每分钟巡检一次：暂缓到期、出现新请求或轮次失败时自动唤醒；给已归置的会话发新消息时自动放回列表。

## 待处理面板与可选摘要

- **待处理面板**：集中查看待处理请求（普通问题可单独「稍后回答」）、未读轮次结果、子任务失败与已登记交付物，支持单条或批量标为已读。
- **可选提取式摘要**：默认关闭。Profile owner 可在 **待处理 → 设置 → 摘要** 中指定单个模型与精确工作目录，仅对启用后新完成的主会话纯文本长回复提取 1–2 句原文作为摘要（每日上限 12 次，按 UTC 重置，缓存最新 100 条）。请勿对敏感目录开启。
- **Agent 工具**：可选注册 `session_lifecycle` 工具，仅操作当前调用的顶层会话。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/session-lifecycle)。
