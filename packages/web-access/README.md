# dsh-web-access

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）新增 `grok_search`（网页与 X/Twitter 搜索）和 `openai_search` 工具，直接复用 `llm-pi-ai` 中已有 OpenAI Responses provider 的地址、Headers 与密钥，无需重复配置 API Key。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `llm-pi-ai` 中配置有 `api: openai-responses` 的 provider 及对应密钥 |
| 数据保存 | profile 的 `cordis.patch.yml` |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/web-access"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/web-access"
```

## 工具与参数

| 工具 | 托管搜索能力 | 模型可传参数 |
| --- | --- | --- |
| `grok_search` | xAI 托管 `web_search` 与 `x_search` | `query`、`sources`（`["web"]` / `["x"]`）、`allowed_domains` / `excluded_domains`（最多 5 个）、`allowed_x_handles` / `excluded_x_handles`（最多 10 个）、`from_date` / `to_date`（`YYYY-MM-DD`） |
| `openai_search` | OpenAI 托管 `web_search` | `query`、`allowed_domains`（最多 100 个）、`search_context_size`（`low` / `medium` / `high`）、`user_location`（`country` / `city` / `region` / `timezone`） |

## 配置与边界

1. 打开 **Plugins → dsh-web-access**，为 Grok 与 OpenAI 分别开启开关、选择 `openai-responses` provider 与模型（Grok 可勾选 `web_search` / `x_search` 子工具），点击 **保存**。
2. 插件从对应 provider 读取 `baseURL`、`headers` 和 `apiKeyEnv`（优先从 DSH credentials 解析，其次环境变量），并在参数验证与错误日志中自动脱敏密钥。
3. **自动隐藏冗余内置搜索**：当某会话中至少一个托管 `web_search` 工具就绪可用时，插件会自动在该会话隐藏 DSH 内置 `web_search`，避免模型混淆；`web_fetch` 保持不变。

配置示例（写入 `cordis.patch.yml`）：

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

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/web-access)。
