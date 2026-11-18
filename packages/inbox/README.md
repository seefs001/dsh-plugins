# dsh-inbox

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）跨会话收件箱，位于左侧边栏。只有需要你审批、审阅计划或回答问题的会话才会计入角标，子任务自动归并到主会话下，不再被 worker 正常结束刷屏。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 可选联动 | 启用「摘要设置」时依赖 `@deepseek-ai/dsh-storage-domain` |
| 数据保存 | 已读/稍后处理标记存于浏览器 `localStorage`；可选摘要规则与结果存于 Host `dsh_inbox_summary` storage domain |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/inbox"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/inbox"
```

## 收件箱分组

| 分组 | 收录内容 | 可执行操作 |
| --- | --- | --- |
| **需要你** | 原生待处理的权限审批、计划审阅与提问（含仍可回答的 `continued` 定时问题） | 跳转到拥有该请求的会话并处理原生卡片；普通提问支持 **稍后（1 小时 / 明天 09:00）** 暂存 |
| **可回看** | 主会话最新一轮的结束状态，或子任务的最新失败结果（含交付产物链接） | 打开所属会话或交付物，或单条/批量 **标为已读** |
| **进行中** | 正在运行或排队等待下一轮的主会话与子任务 | 展开查看，不计入未读角标 |

- 返回入口：从收件箱点进会话后，会话顶部会显示 **返回收件箱** 按钮，自动聚焦回原条目或相邻未读项。
- 会话投影：Host 注册 `dsh-inbox-outcome`（`stateVersion: 2`）会话投影，仅记录轮次边界的 `{ seq, time, reason, file? }`，不存储聊天正文或工具参数。

## 可选提取式摘要

在 **收件箱 → 摘要设置** 中，profile owner 可为**单个指定工作目录**启用提取式摘要：

- 仅对开启后新完成的主会话轮次生效（跳过子任务、已登记交付文件的轮次、短文本、代码块及常见凭据模式）。
- 仅截取最终报告文本前部至多 8 句（上限 2,400 字符），要求指定模型从中选出 **1 到 2 句原文索引**（不自由改写），标注为 AI 选取并保留原文对照。
- 每日上限 **12** 次模型调用（含 **试运行一次**，按 UTC 日期重置），结果最多缓存最新 **100** 条。

## 数据与边界

- 已读标记与 **稍后** 暂存记录以 `dsh-inbox:seen:v1:...` 和 `dsh-inbox:later:v1:...` 保存在当前浏览器 `localStorage`，不跨设备同步，只记录会话 ID 与序号。
- 收件箱不会自动发起模型回复、不会替你批准权限，也不会拦截原生通知。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/inbox)。
