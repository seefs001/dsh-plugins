# dsh-work-timeline

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）会话中展示工作计划、修订过程与关联产物，提供输入框摘要条与右侧详情面板。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 工具入口 | `dsh-work-timeline/tools` 导出 `work_read` 与 `work_update`；与 `dsh-pi-tools` 同时启用时自动挂载到 `pi` 预设 |
| 数据保存 | 随会话日志中 `work_update` 的结果（`meta.dshWorkTimeline`）保存，无独立存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/work-timeline"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/work-timeline"
```

## 界面与工具

- **输入框摘要条**：显示当前标题、进度、受阻项与正在推进的步骤，点击打开右侧详情面板。
- **右侧详情面板**：
  - **计划**：各步骤状态（待开始 / 进行中 / 受阻 / 已完成 / 已取消）、受阻原因与阶段结果。
  - **过程**：按修订号（`revision`）查看每轮调整理由与步骤/产物变更（支持标识从来源会话继承的计划）。
  - **产物**：按步骤筛选交付物（`deliverable`）和依据（`evidence`），点击在右侧文件栏打开当前磁盘文件。
- **工具（`dsh-work-timeline/tools`）**：提供 `work_read` 与 `work_update`。`work_update` 要求携带 `expectedRevision` 做并发校验，且需由模型直接调用，不可嵌套在 `codemode` 中。

更多说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/work-timeline)。
