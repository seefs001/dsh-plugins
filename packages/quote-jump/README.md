# dsh-quote-jump

将 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）用户消息中的引用渲染为可点击的引用块；点击（或聚焦后按回车/空格）直接滚动到原文位置并高亮。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/quote-jump"
```

## 用法

- 替换 `conversation.user.text.node` 中的 `quote` 节点，单行与预览场景保持紧凑内联摘录。
- 匹配时忽略空白与换行差异，仅在当前消息之前已加载的对话节点中查找（长引用回退前 48 个非空字符），遇到折叠区块时自动展开并高亮约 2.4 秒。

纯前端运行，无独立配置或存储。详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/quote-jump)。
