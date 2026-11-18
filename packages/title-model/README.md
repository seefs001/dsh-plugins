# dsh-title-model

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的会话标题生成单独指定模型，不改变主对话模型，也不修改标题生成时机或触发策略。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | profile 已启用原生标题生成器（`first-prompt` 或 `all-prompts`） |
| 数据保存 | 直接写入原生标题生成器配置 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/title-model"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/title-model"
```

## 用法与配置

### 界面配置

1. 确保 DSH 设置中已开启「首条消息标题」（`@deepseek-ai/dsh-session-title-first-prompt-llm`）或「随对话更新标题」（`@deepseek-ai/dsh-session-title-all-prompts-llm`）。
2. 打开 **Plugins → dsh-title-model**。
3. 为每个已启用的标题生成器选择独立模型（或选择 **跟随会话**），点击 **保存**。

### Agent 工具

插件注册了 `title_model` 工具（仅读写标题模型路由）：

- `get`：查看当前各已启用标题生成器的 `id`、`strategy`、`provider` 与 `model`。
- `set`：指定 `provider` 与 `model`（两者需同时提供，或同时传空字符串恢复跟随会话），可选 `generator` ID。

## 数据与边界

- 设置直接通过 `configEditor` 保存在原生标题生成器条目中，停用本插件不会回滚；卸载前如需恢复，请先切回 **跟随会话** 并保存。
- 只影响之后生成的标题；已有标题和用户固定的标题不变。
- 本插件不替你开启标题生成器，也不改变其触发频率或提示词。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/title-model)。
