# dsh-title-model

为 DSH 会话标题生成单独指定模型，不影响主对话模型和标题触发规则。需要先在 DSH 设置中启用原生标题生成器（`first-prompt` 或 `all-prompts`）。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/title-model"
```

本地开发：

```bash
dsh plugin --profile web add "link:$PWD/packages/title-model"
```

## 用法

- **界面设置**：打开 **Plugins → dsh-title-model**，为已启用的标题生成器选择模型（或 **跟随会话**）并保存。
- **Agent 工具**：提供 `title_model` 工具，支持 `action: "get"` 查看当前配置、`action: "set"` 传入 `provider` 与 `model`（同为空字符串时恢复跟随会话，多生成器时附带 `generator`）。

## 说明

设置直接写入原生标题生成器的配置条目，仅对之后生成的标题生效。停用插件不会还原该设置；卸载前如需恢复，请先切回 **跟随会话** 并保存。

完整说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/title-model)。
