# dsh-service-tier

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框右侧模型选择器旁增加 `⚡` 档位按钮，为 OpenAI Responses 协议请求设置 `service_tier`（快速 `priority` 或超快 `ultrafast`）。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 生效范围 | 仅限使用 `openai-responses` 协议的 provider |
| 数据保存 | profile 的 `cordis.patch.yml`（`tiers` 字段） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/service-tier"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/service-tier"
```

## 用法

- 当当前模型所属的 provider 使用 `openai-responses` 协议时，模型选择器旁会出现 `⚡` 按钮：
  - **支持 Ultrafast 的模型**（`gpt-6.2-sol`、`gpt-6.2-astra`、`gpt-6.1-sol`、`gpt-6-astra`）：点击弹出菜单选择 **默认速度**（空心闪电）、**快速**（单实心闪电，`priority`）或 **超快**（双实心闪电，`ultrafast`）。
  - **其他 Responses 模型**：点击直接切换 **快速**（`priority`）与 **默认速度**。
- 仅在配置编辑器内 `api: openai-responses` 或 pi-ai 目录中默认走 Responses 协议的路由上显示；其他路由不显示图标也不修改请求。

## 配置与边界

设置通过 `POST /service-tier/set` 保存到 `cordis.patch.yml`：

```yaml
- id: service-tier
  config:
    tiers:
      responses/gpt-6.1-sol: priority
      responses/gpt-6.2-sol: ultrafast
```

- 通过包装 `@deepseek-ai/dsh-llm-pi-ai` 请求入口的 `onPayload` 注入 `service_tier`（同时兼容旧版 `llm-pi-ai/model-defaults` waterfall）。
- 选择 **默认速度** 会移除该模型的覆盖项，由提供方默认策略接管。
- 使用 `priority` 或 `ultrafast` 档位需由上游模型服务支持，并可能产生对应档位计费。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/service-tier)。
