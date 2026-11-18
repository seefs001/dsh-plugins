# dsh-cheat-sheet

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框左侧工具栏增加 **技能速查** 面板，搜索当前会话可用的技能、置顶常用项、按实际使用次数排序，并一键将 `/命令` 插入输入框（不自动发送）。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `@deepseek-ai/dsh-storage-domain` |
| 可选文件 | `~/.agents/skills/short-descriptions.zh.json`（存在时展示中文简述） |
| 数据保存 | Host `cheat_sheet` storage domain（置顶列表与实时技能使用次数） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/cheat-sheet"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/cheat-sheet"
```

## 用法与机制

- **搜索与分组**：面板读取当前会话的原生技能目录，支持搜索技能名称与说明，以及筛选仅手动触发的技能；分组为「已置顶」和其余技能，默认按实际使用次数降序排列。
- **插入斜杠命令**：点击或回车某项技能，通过受版本保护的 `insertText` 在光标处插入 `/skill-name `，不直接发送，也不占用斜杠菜单本身。
- **真实计数**：Host 监听实际生效的 `/name` 显式技能调用（`skill-invocation`）与成功的 `skill` 工具调用（包括 `codemode` 嵌套调用），不回溯扫描历史会话，也不把查看/复制算作使用。
- **Agent 工具**：插件同时注册 `cheat_sheet` 工具（`state` 读取置顶与计数，`pin` 设置置顶，计数不可手动改写）。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/cheat-sheet)。
