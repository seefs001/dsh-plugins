# dsh-compaction-status

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）执行上下文压缩期间，在输入框上方居中显示一行紧凑的状态与已等待时间，无需展开过程详情即可了解进度。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 数据保存 | 无独立配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/compaction-status"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/compaction-status"
```

## 工作方式与边界

- Host 注册 `dsh-compaction-status` 会话投影，从原生 `compaction/start` 与 `compaction/end`（以及 `turn/end`、`session/end-seed`）折叠出 `{ id, startedAt, turn }`。
- Web 端仅在当前会话正在压缩时显示状态条与秒级计时器，位置与宽度对齐原生任务栏。
- 仅作只读显示：不会触发压缩，也不会改变压缩速率或模型路由。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/compaction-status)。
