# dsh-tool-lens

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）聊天流中的工具调用行添加直达右侧栏的快捷操作。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/tool-lens"
```

## 支持的工具行

| 工具 | 快捷操作 |
| --- | --- |
| `skill` | 点击技能名在右侧文件侧栏打开对应 `SKILL.md`，点击行展开指令正文 |
| `grep` / `glob` | 行尾显示命中文件按钮或列表，点击打开文件并定位到首个命中行 |
| `web_search` / `web_fetch` | 行尾显示来源链接或列表，默认在右侧 Browser 面板打开（`Cmd`/`Ctrl` 点击在新标签页打开） |
| `subagent` / `send_message` / `interrupt_agent` | 一键在右侧面板打开对应子代理对话（不含 `external` 外部子代理） |
| `bash`、`job_output`、`terminal_read`、`workflow`、`lsp`、`cordis_inspect`、`session_*` | 输出被写入 spill 文件时，行尾显示 **完整输出** 按钮，点击在右侧预览完整文件 |

仅在浏览器端运行，无独立配置与存储；停用后恢复内置工具行视图。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/tool-lens)。
