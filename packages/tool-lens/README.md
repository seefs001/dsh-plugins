# dsh-tool-lens

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）聊天时间线中的工具调用行添加快捷操作，无需手动翻找输出或输入路径。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web（Host 入口仅用于加载 bundle） |
| 数据保存 | 无独立配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/tool-lens"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/tool-lens"
```

## 支持的快捷操作

| 工具范围 | 提供的快捷操作 |
| --- | --- |
| `skill` | 替换默认行，直接点击技能名在右侧文件侧栏打开对应 `SKILL.md`（支持展开参数与正文） |
| `grep` / `glob` | 在行尾显示命中文件快捷按钮或下拉列表，点击直接打开对应文件与行号 |
| `web_search` / `web_fetch` | 在行尾显示网页来源链接或列表，默认在右侧 Browser 面板打开（按 `Cmd`/`Ctrl` 在新标签页打开） |
| `subagent` / `send_message` / `interrupt_agent` | 一键在右侧面板打开对应子代理对话 |
| 其他增强工具（`bash`、`job_output`、`terminal_read`、`workflow`、`lsp`、`cordis_inspect_*`、`session_*`） | 当结果文本末尾附带 spill 文件路径时，在行尾浮动 **完整输出** 按钮，点击直接在右侧打开该完整输出文件 |

## 边界说明

- 在 `tool.call.toolview` 槽位以更低优先级包装或替换内置视图，停用插件即恢复原状。
- 仅使用聊天事件已记录的元数据与工具输出，不会重跑工具；对于 `external` 模式的外部子代理不提供原生子代理面板跳转。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/tool-lens)。
