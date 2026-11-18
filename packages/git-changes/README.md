# dsh-git-changes

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框下方显示当前 Git 分支名、未提交的增删行数与变更文件数，点击直接打开右侧 Forge 变更面板（默认切到「未提交」范围）。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web（Host 入口仅用于加载 bundle） |
| 前置依赖 | `Change requests & worktrees`（`@deepseek-ai/dsh-experimental-forge-bundle`） |
| 数据保存 | 无独立配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/git-changes"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/git-changes"
```

## 工作方式

- 订阅 `forgePanel.follow` 流，并在仓库状态变化时以 400 ms 防抖调用 `forgePanel.localDiff({ kind: 'uncommitted' })` 计算 `+新增 / -删除` 与文件数（含未跟踪文件提示）。
- 点击胶囊通过 `sidebarRight.openResource('dsh-resource://forge-changes/<sessionId>/local')` 打开右侧本地变更面板，并把新开标签的默认对比范围从分支对比调整为 **未提交**。
- 当工作目录不是 Git 仓库或未启用 Forge bundle 时自动隐藏，不执行任何外部 `git` 子进程。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/git-changes)。
