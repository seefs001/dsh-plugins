# dsh-session-search

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）侧栏「新建会话」下方增加 **搜索会话** 入口，打开支持键盘导航的会话搜索面板（侧栏收起时显示为放大镜图标）。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web |
| 数据保存 | 无独立存储，直接调用 DSH 原生会话与正文搜索服务 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/session-search"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/session-search"
```

## 用法

- 空搜索时按最近活动时间列出未归档的主会话（最多 20 条，不含空白会话与子代理）。
- 输入关键词同时匹配标题、工作区、会话 ID 与正文内容，正文命中后补齐片段摘要。
- 支持 `↑` / `↓` 选择、`Enter` 打开、`Esc` 或点击面板外关闭。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/session-search)。
