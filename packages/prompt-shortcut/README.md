# dsh-prompt-shortcut

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框左侧工具栏增加 **常用片段** 按钮（并支持 `/snippets` 命令），将常用话术或提示词模板保存在本机 DSH Host 上跨浏览器同步，搜索后直接插入光标处或替换选中文字。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/prompt-shortcut"
```

## 用法

- **插入片段**：点击输入框左侧书签按钮或输入 `/snippets`，搜索名称或正文，点击或回车即可插入光标处（或替换选中文字），支持编辑器一次撤销，不自动发送。
- **管理片段**：支持新建、**从当前草稿保存**、编辑、置顶和删除（带撤销条），列表按置顶、最近使用、我的片段分组，最多保存 200 条。
- **导入导出**：支持一键导出或导入 JSON 文件，方便备份与迁移。

片段以纯文本保存在 Host 的 `prompt_shortcut` storage domain（跨浏览器同步，不包含附件）；首次打开时自动从旧版浏览器 `localStorage` 迁移数据，当 Host 存储域不可用时自动回退到当前浏览器 `localStorage`（`dsh-prompt-shortcut:library:v1`）。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/prompt-shortcut)。
