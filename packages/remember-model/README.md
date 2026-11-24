# dsh-remember-model

自动记住顶层会话最后选用的模型和推理强度，新建会话直接沿用。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/remember-model"
```

本地开发：

```bash
dsh plugin --profile web add "link:$PWD/packages/remember-model"
```

## 工作方式

- 纯 Host 插件，无界面。
- 监听顶层会话的 `model/selection` 事件（忽略子代理），写入 DSH 原生的 `agent-default-model` 配置。
- 支持可选配置 `onlyAfterTurn: true`（在 `cordis.patch.yml` 中设置）：开启后仅暂存切换选择，等到该顶层会话实际发起下一轮（`turn/start`）时才写回默认模型，避免误切换污染新会话默认值。
- 400 ms 去抖后广播 `llm/models-updated`，让已连接的浏览器立即刷新默认模型。
- 停用或卸载本插件后，已保存的默认模型留在原生配置中不变。

完整说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/remember-model)。
