# dsh-web-access

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）新增 `grok_search`（网页与 X/Twitter 搜索）和 `openai_search` 工具，直接复用 `llm-pi-ai` 中已有的 `openai-responses` provider 地址、Headers 和密钥。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/web-access"
```

## 工具与参数

| 工具 | 托管能力 | 参数 |
| --- | --- | --- |
| `grok_search` | xAI `web_search`、`x_search` | `query`、`sources`（`["web"]` / `["x"]`）、`allowed_domains` / `excluded_domains`（最多 5 个）、`allowed_x_handles` / `excluded_x_handles`（最多 10 个）、`from_date` / `to_date`（`YYYY-MM-DD`） |
| `openai_search` | OpenAI `web_search` | `query`、`allowed_domains`（最多 100 个）、`search_context_size`（`low` / `medium` / `high`）、`user_location`（`country` / `city` / `region` / `timezone`） |

## 配置

1. 在 `llm-pi-ai` 中准备好至少一个 `api: openai-responses` 的 provider 及其密钥。
2. 打开 **Plugins → dsh-web-access**，为 Grok 和 OpenAI 分别启用并选择 provider、模型及 Grok 子工具，点击 **保存**。

会话中任一托管 `web_search` 可用时，插件会自动在该会话隐藏内置 `web_search`（`web_fetch` 不受影响）。配置保存在 profile 的 `cordis.patch.yml`：

```yaml
- id: web-access
  config:
    timeoutMs: 120000
    grok:
      enabled: true
      provider: xai
      model: grok-4
      tools: [web_search, x_search]
    openai:
      enabled: true
      provider: openai
      model: gpt-5
      tools: [web_search]
```

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/web-access)。
