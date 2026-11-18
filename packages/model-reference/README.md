# dsh-model-reference

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框键入 `#` 选择模型并插入引用标签，自动带上该模型上次使用的推理强度与快速模式状态，方便在提示词里点名调度子代理或对比模型。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 可选联动 | 安装 [`dsh-service-tier`](../service-tier) 后，标签同步携带 `⚡` |
| 数据保存 | profile 的 `cordis.patch.yml`（`efforts` 字段） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/model-reference"
```

## 用法

1. 在输入框中输入 `#`（前面为空格或位于行首），按模型名或 provider 筛选，回车或点击插入标签，例如 `#GPT-6.1 Sol · xhigh ⚡`。
2. 退格可整块删除标签，复制标签会得到 `#provider/model`。
3. 发送给模型时，标签序列化为结构化文本：

```text
#model(provider=..., model=..., reasoning_effort=..., service_tier=priority)
```

4. Host 监听顶层会话的 `model/selection` 事件，按 `provider/model` 记住你最近选用的推理强度（子代理会话不会覆盖该偏好）。

## 配置与边界

Host 配置由插件自动写入 `cordis.patch.yml`：

```yaml
- id: model-reference
  config:
    efforts:
      openai/gpt-6.1-sol: xhigh
```

- 插入 `#` 引用不会切换当前会话自己的模型。
- 复制包含 `#` 标签的历史消息再粘贴时，仅粘贴为文本（可再通过 `#` 重新插入）。
- 暴露只读接口 `GET /model-reference/state`（需 owner 鉴权）。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/model-reference)。
