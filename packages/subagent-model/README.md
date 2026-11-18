# dsh-subagent-model

在子代理会话输入框右下角显示该子代理实际记录的模型与推理强度（只读）。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web（Host 入口仅用于加载 bundle） |
| 生效范围 | 仅子代理会话 |
| 数据保存 | 无独立配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/subagent-model"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/subagent-model"
```

## 工作方式

- 读取当前子代理会话的 `modelSelection` projection（优先 `next`，其次 `lastUsed`），并与模型目录匹配显示名称与推理等级（例如 `GPT-6.1 Sol · High` 或 `Provider default`）。
- 悬停标签可查看完整 `provider/model` 路由及只读说明。
- 普通主会话保持 DSH 原生模型选择器不变；子代理的模型仍由主代理决定，本插件不修改路由、提示词或默认模型。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/subagent-model)。
