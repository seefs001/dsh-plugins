# dsh-branch-switcher

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）新会话发送首条消息前，点击页面顶部的分支标签切换已有本地 Git 分支，同时保留原生的「新建工作树」选项。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `Change requests & worktrees`（`@deepseek-ai/dsh-experimental-forge-bundle`） |
| 数据保存 | 无 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/branch-switcher"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/branch-switcher"
```

## 用法

- **页面切换**：在未发送首条消息的新会话顶部，点击分支标签展开本地分支列表（按最近提交时间排序，支持搜索），选中后执行 `git switch --no-guess`。勾选 **新建工作树** 时继续走原生工作树创建流程。
- **命令与工具**：同时注册 `/branch-switcher` 命令与 `branch_switcher` 工具（`list` / `switch`），仅在会话未发首条消息、空闲且非只读策略时可执行切换。

## 注意事项

- 切换的是当前工作目录的真实分支，共用该目录的其他会话和终端会同步变更。
- 仅切换已有本地分支；未提交改动存在冲突或处于只读模式时拒绝切换。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/branch-switcher)。
