# dsh-work-timeline

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）会话内展示当前工作计划、修订记录与关联产物（交付物和证据文件），在输入框摘要条和右侧详情面板中呈现，替换 `pi` 预设原有的 TODO 清单。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 工具来源 | `work_read` 与 `work_update` 由 `dsh-work-timeline/tools` 导出；与新版 `dsh-pi-tools` 同时启用时自动接入 `pi` 预设 |
| 数据保存 | 随会话日志中成功的 `work_update` 工具结果（`meta.dshWorkTimeline`）保存，无独立 storage domain |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/work-timeline"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/work-timeline"
```

## 界面与工具

- **输入框摘要条**：显示当前工作标题、完成进度、受阻提示及正在推进的步骤，点击打开右侧详情面板。
- **右侧三视图**：
  - **计划**：各步骤状态（待开始 / 进行中 / 受阻 / 已完成 / 已取消）、受阻原因与阶段结论。
  - **过程**：按修订版本号（`revision`）展示每次变更理由与步骤/产物增删改历史（最近 20 条，支持从分叉会话继承标记）。
  - **产物**：按步骤筛选 `deliverable`（交付物）与 `evidence`（证据），点击文件链接在文件侧栏打开当前磁盘文件（非历史快照）。
- **工具入口（`dsh-work-timeline/tools`）**：注册 `work_read` 与 `work_update`（需显式携带 `expectedRevision` 乐观并发检查，禁止在 `codemode` 内嵌套调用）。

## 边界说明

- 仅反映 Agent 通过 `work_update` 主动汇报的状态，不自动执行工作流、不授权工具权限，也不替代原生 `exit_plan_mode` 或 Goal。
- 只启用本包时，默认提供投影与展示界面，不向全局注册工具。与新版 `dsh-pi-tools` 同时启用时，`pi` 预设自动获得工具；其他预设可显式挂载 `dsh-work-timeline/tools`。Pi 不会代为安装本包。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/work-timeline)。
