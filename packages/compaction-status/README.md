# dsh-compaction-status

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）执行上下文压缩期间，在输入框上方居中显示一行紧凑的状态与已等待时间。

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/compaction-status"
```

## 工作方式

- Host 注册 `dsh-compaction-status` 会话投影，从 `compaction/start`、`compaction/end`、`turn/end` 与 `session/end-seed` 维护当前压缩状态。
- Web 端仅在压缩进行中展示状态条与秒级计时器，宽度对齐原生任务栏，结束后自动隐藏。无配置项与持久化存储。

详细文档见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/compaction-status)。
