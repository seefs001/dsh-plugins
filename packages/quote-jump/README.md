# dsh-quote-jump

将 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）用户消息中的引用渲染为可点击的引用块；点击（或聚焦后按回车/空格）直接滚动回原文位置并高亮约 2.4 秒。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web（Host 入口仅用于加载 bundle） |
| 数据保存 | 无独立配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/quote-jump"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/quote-jump"
```

## 工作方式与边界

- 替换 `conversation.user.text.node` 中的 `quote` 节点（单行/预览场景保持紧凑内联摘录）。
- 匹配时自动忽略空白字符和换行差异，只在当前消息**之前**的对话节点中查找（优先完整匹配，过长时回退前 48 个非空字符），遇到折叠区块（`details` 或 `hidden="until-found"`）会自动展开。
- 使用 `CSS.highlights` 与边框闪烁高亮定位结果。如果原文尚未加载（需向上滚动加载更早消息），会提示「原文不在当前已加载的对话里」。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/quote-jump)。
