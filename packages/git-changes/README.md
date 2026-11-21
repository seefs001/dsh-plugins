# dsh-git-changes

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框下方显示当前 Git 分支、未提交增删行数与变更文件数，点击打开右侧 Forge 本地变更面板（默认切到「未提交」范围）。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web |
| 前置依赖 | `Change requests & worktrees`（`@deepseek-ai/dsh-experimental-forge-bundle`） |
| 数据保存 | 无 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/git-changes"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/git-changes"
```

## 工作方式

- 订阅 `forgePanel.follow` 流，仓库状态变化时以 400 ms 防抖调用 `forgePanel.localDiff({ kind: 'uncommitted' })` 统计增删行数、文件数与未跟踪文件提示。
- 点击打开右侧 `local` 变更面板，并将新开标签的默认对比范围设为 **未提交**。
- 非 Git 仓库或未启用 Forge 时自动隐藏。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/git-changes)。
