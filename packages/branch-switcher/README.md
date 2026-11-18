# dsh-branch-switcher

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）新会话发送第一条消息前，直接在页面顶部的分支胶囊里切换到已有的本地 Git 分支；同时保留原生的「新建工作树」勾选与创建流程。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `Change requests & worktrees`（`@deepseek-ai/dsh-experimental-forge-bundle`） |
| 数据保存 | 无独立配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/branch-switcher"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/branch-switcher"
```

## 用法

- **页面切换**：在尚未发送首条消息的新会话页面顶部，点击当前分支标签打开本地分支列表（按最近提交时间排序，支持搜索），选中后即可切换（`git switch --no-guess`）。如果勾选了 **新建工作树**，则继续走原生的新建工作树流程。
- **斜杠命令与工具**：同时注册 `/branch-switcher` 命令与 `branch_switcher` 工具（支持 `list` 与 `switch`），仅在会话尚未产生首轮对话、空闲且非只读策略时允许切换。

## 边界说明

- **切换的是当前实际工作目录的分支**：所有共用同一目录的会话和终端都会看到分支变化。
- 只切换本地已有分支，不执行 `fetch`、不创建新分支、不 `stash`、不强制切换（存在冲突的未提交改动时 Git 会拒绝切换）。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/branch-switcher)。
