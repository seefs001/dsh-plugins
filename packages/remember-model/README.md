# dsh-remember-model

记住你在顶层会话中刚切换的模型与推理强度，并在保存后通知所有已连接的浏览器刷新模型目录，让新建会话立即沿用上次选择。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host |
| 生效条件 | 仅顶层会话（排除子代理会话） |
| 数据保存 | DSH 原生的 `agent-default-model` 配置 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/remember-model"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/remember-model"
```

## 工作方式

1. 监听会话的 `model/selection` 事件。
2. 过滤掉子代理会话，只记录用户在主会话做出的模型与推理强度选择。
3. 写入 DSH 原生的 `agentDefaultModel.saveSelection(...)`。
4. 延迟 400 ms 去抖后触发 `llm/models-updated`，让已连接的浏览器同步刷新默认模型显示。

## 边界

- 不提供 Web 界面或独立配置项。
- 停用或卸载本插件后，已写入 DSH 的默认模型仍然保留。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/remember-model)。
