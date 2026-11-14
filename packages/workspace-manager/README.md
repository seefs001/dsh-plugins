# dsh-workspace-manager

管理 DSH 保存的工作区记录。插件包含 Host 和 Web 两部分，需要默认 Web profile 里的 Workspace 服务。

## 安装

在仓库根目录运行，不需要构建：

```bash
dsh plugin --profile web add "link:$PWD/packages/workspace-manager"
```

这条命令会修改所选的 profile。启用后刷新网页，点击侧边栏的 **工作区管理**（英文界面为 **Workspace manager**）。

也可以用 GitHub 地址安装 `main` 上已推送的版本：`github:seefs001/dsh-plugins#main&path:/packages/workspace-manager`。

## 使用

- 页面列出所有保存的工作区，包括没有会话的、目录已在磁盘上删除的，可以按名称或完整路径搜索。
- 点 **移除** 并确认，这条记录就从原生工作区列表和选择器里消失。目录不需要存在。
- 打开页面时会检查一次目录，点 **检查目录** 可以重新检查。检查在运行 DSH Host 的电脑上进行。
- 点 **清理失效记录** 会重新检查全部工作区，列出要移除的路径，确认后逐条移除。它针对全部工作区，不受搜索条件影响。
- 只有路径不存在（ENOENT），或路径本身、某个父路径不是目录（ENOTDIR）的记录会进入批量清理。权限不足、I/O 错误等情况显示为 **无法检查**，不进入批量清理。

## 数据与安全

磁盘目录和 DSH 的工作区记录相互独立，删除目录不会自动移除记录。插件调用原生的 `workspaces.delete(workspaceId)`：文件、会话日志和正在运行的会话都保留。插件不改核心代码，也不直接编辑 storage 文件。工作区移除后，它的会话仍可以从原生的全部会话和搜索入口打开。

目录检查只是当下的快照。断开的外置磁盘或网络挂载也可能显示为不存在，所以插件不会在后台自动移除记录。确认前请核对完整路径。即使确认后才发现挂载已经恢复，磁盘上的内容也没有被删除。

清理结束后显示成功移除的数量。中途失败时，已经移除的记录保持移除，剩下的不再继续，并显示错误；解决问题后可以重试。确认使用浏览器原生的确认框，插件不另存状态。移除和同步使用 DSH 原生 Workspace API 的权限和推送机制。

## HTTP

`GET /workspace-manager/check` 返回 `{ checks: [{ workspaceId, path, status, code? }] }`，`status` 为 `directory`、`missing`、`not-directory` 或 `unavailable`。路由走 Host 的常规连接检查，只检查已注册的路径，不接受任意路径，也不执行移除。

## English

The **Workspace manager** panel lists every saved workspace, including empty ones and ones whose directory no longer exists. You can remove one entry, or use **Clean up invalid entries** to recheck all workspaces and confirm the full list of missing and non-directory paths. The search filter does not limit cleanup. Files and sessions are never deleted, and permission or I/O errors never make an entry a cleanup candidate. Checks run on the DSH Host, not the browser device. An unmounted drive can look missing, so cleanup is always manual. Removal uses the native Workspace API and updates the built-in picker. If one removal fails, the panel reports how many succeeded and stops.
