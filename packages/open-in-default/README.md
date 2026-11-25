# dsh-open-in-default

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）会话顶栏放置一个记忆默认编辑器的双半区按钮（Split Button）。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web |
| 前置依赖 | Host 原生 `@deepseek-ai/dsh-host-open-in-app` |
| 数据保存 | 浏览器 `localStorage`（共享 `dsh.open-in-app.choice`） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/open-in-default"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/open-in-default"
```

## 用法

- **左半主按钮**：点击直接用当前记住的默认编辑器（如 Cursor、VS Code、Zed、Finder 等）打开当前会话工作目录。
- **右半下拉箭头**：列出 Host 探测到的全部已安装应用；选择某项仅切换并记住默认偏好，不立即触发打开。若上次记住的应用不再可用，自动回退到可用列表首项。
- 会话未关联目录或 Host 未提供应用打开接口时自动隐藏。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/open-in-default)。
