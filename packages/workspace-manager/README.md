# dsh-workspace-manager

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中查看并清理已保存的工作区记录，支持批量清理目录已不存在的失效条目，同时完整保留磁盘文件和历史会话。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | profile 中的 `workspaceRegistry` 与 Web 端 `workspaces` 服务 |
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

1. 在左侧栏打开 **工作区管理**，查看所有已登记的工作区名称、路径与关联会话数，支持按名称或路径搜索。
2. 点击 **检查目录**：Host 通过只读接口 `GET /workspace-manager/check` 逐一核对路径状态（**目录存在** / **目录不存在** / **不是目录** / **无法检查**）。
3. 点击单行的 **移除**，或点击 **清理失效记录** 批量移除所有「目录不存在」或「不是目录」的条目（每次移除前都会弹窗确认；权限错误等「无法检查」条目会自动保留）。

## 边界说明

- **只删工作区列表记录**，绝不删除磁盘目录、项目文件或任何 DSH 会话日志。
- 若目录位于未挂载的外接硬盘，检查结果也会显示为「目录不存在」，批量清理前请先核对确认列表。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/workspace-manager)。
