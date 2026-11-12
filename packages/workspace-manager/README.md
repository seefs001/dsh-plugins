# dsh-workspace-manager

管理 DSH 保存的工作区记录。**Host + Web**，需要 DSH `>=0.2.2-rc.2 <0.3.0` 和默认 Web profile 的 Workspace 服务。

## 安装

从本地仓库安装，无需构建：

```bash
dsh plugin --profile web add "link:$PWD/packages/workspace-manager"
```

在仓库根目录运行。启用后刷新网页，点击侧边栏的 **工作区管理 / Workspace manager**。安装命令会修改所选 profile。

发布到仓库后也可用 `github:seefs001/dsh-plugins#main&path:/packages/workspace-manager` 安装。

## 使用

- 页面列出所有已保存的工作区，包括没有会话、已经在磁盘上删除的目录。支持按名称或完整路径搜索。
- 点 **移除** 并确认，将该记录从原生工作区列表和选择器移除。目录不必存在。
- 打开页面会检查目录；点 **检查目录** 可重新检查。检查在运行 DSH Host 的电脑执行。
- 点 **清理失效记录** 会重新检查所有工作区，列出待移除路径，确认后逐项移除。该动作针对全部工作区，不受搜索条件影响。
- 只有路径不存在（ENOENT）、路径本身或父路径不是目录（ENOTDIR）的记录进入批量清理。权限不足、I/O 错误等显示为 **无法检查**，不会进入批量清理。

## 数据与安全

磁盘目录与 DSH 的工作区记录相互独立，删除目录不会自动移除记录。本插件调用原生 `workspaces.delete(workspaceId)`，保留文件、会话日志和正在运行的会话；不修改核心代码，不直接编辑 storage 文件。工作区移除后，其会话仍可从原生全部会话/搜索入口访问。

目录检查是即时快照。断开的外置磁盘或网络挂载也可能显示为不存在，所以插件不在后台自动移除记录。确认前请核对完整路径；确认后才发现挂载恢复，也不会删除任何磁盘内容。

每次清理完成后显示成功数量。若中途失败，已成功移除的记录保留该结果，停止后续移除并显示错误；解决后可重试。浏览器的原生确认框负责确认，不另存插件状态。移除同步沿用 DSH 原生 Workspace API 的权限与推送机制。

## HTTP

`GET /workspace-manager/check` 返回 `{ checks: [{ workspaceId, path, status, code? }] }`。状态为 `directory`、`missing`、`not-directory` 或 `unavailable`。路由使用 Host 的正常连接检查，只读取已注册路径，不接受任意路径，不执行移除。

## English

The **Workspace manager** panel lists every saved workspace, including empty ones and paths that no longer exist. Remove one entry, or use **Clean up invalid entries** to rescan and confirm the full list of missing/non-directory paths. Search does not limit bulk cleanup. Files and sessions are never deleted. Permission and I/O errors are not cleanup candidates. Checks run on the DSH Host, not the browser device. Unmounted drives may look missing, so cleanup is always manual. Removal uses the native Workspace API and updates the built-in picker; a partial failure reports the completed count and stops the remaining operations.
