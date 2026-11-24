# dsh-model-reference

在输入框键入 `#` 插入模型引用标签，自动带上该模型上次选用的推理强度与快速模式状态，方便在提示词中点名调度子代理或对比模型。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

本地开发：

```bash
dsh plugin --profile web add "link:$PWD/packages/model-reference"
```

## 用法

- 在输入框行首或空格后输入 `#`，按模型名或 provider 筛选，按回车、Tab 或点击插入标签（如 `#GPT-6.1 Sol · High ⚡`）。
- 退格可整块删除标签，复制标签得到 `#provider/model`。
- 发送时标签会展开为结构化文本，历史消息中仍显示为标签：

```text
#model(provider=openai, model=gpt-6.1-sol, reasoning_effort=high, service_tier=priority)
```

- 插入 `#` 引用不会切换当前会话的模型。

## 状态记忆与联动

- **推理强度记忆**：Host 监听顶层会话的 `model/selection` 事件（忽略子代理），按 `provider/model` 记录最后选用的推理强度并写入 `cordis.patch.yml` 的 `efforts` 字段；之后切换回该模型或插入 `#` 标签时自动恢复。
- **快速模式联动**：同时安装 [`dsh-service-tier`](../service-tier) 时，`#` 标签自动同步该模型的 `priority` / `ultrafast` 档位。
- **共享 `#` 菜单**：同时安装 [`dsh-roles`](../roles) 时，模型与角色会合并在同一个 `#` 菜单中分组展示。

完整说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/model-reference)。
