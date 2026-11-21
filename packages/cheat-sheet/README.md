# dsh-cheat-sheet

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框左侧工具栏添加一个**技能速查**弹窗：搜索当前会话可用技能、置顶常用项、按实际使用次数排序，并一键把 `/技能名 ` 写入输入框开头。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `@deepseek-ai/dsh-storage-domain` |
| 可选中文说明 | `~/.agents/skills/short-descriptions.zh.json` |
| 数据保存 | Host `cheat_sheet` storage domain |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/cheat-sheet"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/cheat-sheet"
```

## 功能

- **搜索与筛选**：读取当前会话的技能目录，默认聚焦仅手动触发的技能，可按需展开 Agent 可自动调用的技能；若本机存在 `~/.agents/skills/short-descriptions.zh.json`，一并展示中文短说明。
- **置顶与真实计数**：置顶项固定排在最前，其余按实际加载次数降序排列。Host 统计实际生效的 `/skill` 调用与成功的 `skill` 工具调用，跨会话共享。
- **写入命令**：点击或按 `Enter` 将 `/skill-name ` 插到输入框开头，保留已有草稿且不直接发送。
- **Agent 工具**：提供 `cheat_sheet` 工具，用于读取置顶与使用次数（`state`）或切换置顶（`pin`）。

详见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/cheat-sheet)。
