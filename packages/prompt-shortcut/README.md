# dsh-prompt-shortcut

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框左侧工具栏增加 **常用片段** 按钮，把常用话术或提示词模板保存在当前浏览器中，搜索后直接插入光标处或替换选中文字。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/prompt-shortcut"
```

## 用法

- **插入片段**：点击输入框左侧书签按钮，搜索名称或正文，点击或回车即可插入光标处（或替换选中文字），支持编辑器一次撤销，不自动发送。
- **管理片段**：支持新建、**从当前草稿保存**、编辑、置顶和删除（带撤销条），列表按置顶、最近使用、我的片段分组。

仅保存纯文本到当前浏览器 `localStorage`（`dsh-prompt-shortcut:library:v1`），不上传 Host，也不跨浏览器同步。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/prompt-shortcut)。
