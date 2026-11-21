# dsh-service-tier

在输入框模型选择器旁添加 `⚡` 按钮，按 `provider/model` 为 OpenAI Responses 请求切换快速（`priority`）或超快（`ultrafast`）服务档位。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/service-tier"
```

本地开发：

```bash
dsh plugin --profile web add "link:$PWD/packages/service-tier"
```

## 用法

仅当当前模型所属 provider 走 `openai-responses` 协议（显式配置 `api: openai-responses` 或内置目录默认走 Responses）时显示 `⚡` 按钮：

- **支持 Ultrafast 的模型**（`gpt-6.2-sol`、`gpt-6.2-astra`、`gpt-6.1-sol`、`gpt-6-astra`）：点击菜单选择 **默认速度**、**快速**（单闪电，`priority`）或 **超快**（双闪电，`ultrafast`）。
- **其他 Responses 模型**：点击切换 **默认速度** 与 **快速**（`priority`）。

## 配置与机制

选择保存在 `cordis.patch.yml` 的 `tiers` 字段，发送请求时通过 pi-ai 的 `onPayload` 注入 `service_tier`（选 **默认速度** 会移除覆盖项）：

```yaml
- id: service-tier
  config:
    tiers:
      responses/gpt-6.1-sol: priority
      responses/gpt-6.2-sol: ultrafast
```

同时安装 [`dsh-model-reference`](../model-reference) 时，`#` 模型标签会同步带上 `⚡` 标记。

完整说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/service-tier)。
