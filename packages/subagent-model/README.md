# dsh-subagent-model

在子代理会话输入框右下角只读显示该子代理实际记录的模型与推理强度。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/subagent-model"
```

本地开发：

```bash
dsh plugin --profile web add "link:$PWD/packages/subagent-model"
```

## 工作方式

- 仅在子代理会话中显示，普通主会话保持原生模型选择器不变。
- 读取当前会话的 `modelSelection` projection（优先 `next`，其次 `lastUsed`），结合模型目录展示模型名和推理强度；悬停可查看完整 `provider/model`。
- 无独立配置或存储，不改动子代理的模型路由。

完整说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/subagent-model)。
