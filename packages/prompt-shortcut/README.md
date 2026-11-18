# dsh-prompt-shortcut

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框左侧工具栏增加 **常用片段** 按钮，把常用话术或指令模板保存在当前浏览器中，搜索后直接插入光标处（或替换选中文字），留给你补充调整再决定何时发送。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web（Host 入口仅用于加载 bundle） |
| 数据保存 | 当前浏览器 `localStorage`（`dsh-prompt-shortcut:library:v1`） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/prompt-shortcut"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/prompt-shortcut"
```

## 用法

- **插入片段**：点击输入框左侧书签按钮（若同时启用 `dsh-cheat-sheet`，位于「技能速查」右侧），搜索名称或正文，回车或点击即可将片段插入光标处，或替换当前选中的文字。支持编辑器一次撤销。
- **管理片段**：支持新建、编辑、置顶、删除（带撤销条），也可以直接点击 **从当前草稿保存** 把正在写的内容存下来；删除后按最近使用时间与置顶排序。
- **首次示例**：初次打开会展示一条「示例 · 点一下试试」，可随时移除。

## 边界说明

- 片段仅保存纯文本（不含图片或文件附件），不自动发送消息，也不修改斜杠命令菜单。
- 数据仅存于当前浏览器 `localStorage`，不上传到 Host，也不跨浏览器或设备同步。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/prompt-shortcut)。
