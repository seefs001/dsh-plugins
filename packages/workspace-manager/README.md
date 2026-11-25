# dsh-workspace-manager

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中检查已保存的工作区目录状态，单条或批量移除失效工作区记录，磁盘文件和历史会话均保留。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `workspaceRegistry` 与 Web 端 `workspaces` 服务 |
| 数据保存 | 无独立存储，直接调用 DSH 原生工作区移除接口 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/workspace-manager"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/workspace-manager"
```

## 用法

1. **一步式闲置清理（Clean up）**：点击侧栏底部的 **清理闲置** 按钮（或工作区管理页右上角入口），自动跳过当前正在查看的会话与工作区，按类默认折叠列出失效工作区、遗留后台任务（无活跃会话仍在运行的 Job）与干净的旧 linked worktree。行尾提供固定宽度的 **移除** / **停止** 按钮，支持单条原地处理或底部一键全部清理；无可清理项时仅弹出轻提示。
2. **工作区管理页**：在左侧栏打开 **工作区管理**，查看已登记的工作区名称、路径与关联会话数，支持按名称或路径过滤、点击 **检查目录** 核对路径状态（**目录存在** / **目录不存在** / **不是目录** / **无法检查**），以及勾选后批量移除失效条目。

未挂载的外接硬盘或网络卷在检查时会显示为「目录不存在」，批量清理前请先核对路径列表。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/workspace-manager)。
