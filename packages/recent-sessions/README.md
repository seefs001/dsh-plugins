# dsh-recent-sessions

将 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框 `@` 引用菜单中的会话按最近活动时间倒序排列，同时间戳条目保持原有顺序。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web |
| 数据保存 | 无 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/recent-sessions"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/recent-sessions"
```

## 工作方式

- 包装 `@` 触发源（`reference`）的 `candidates`，解码每条会话的 `dsh-session:` 引用 ID，按 `sessions.list` 中的 `updatedAt` 做稳定降序排序。
- 仅重排各连续会话区块内部顺序，保留原有分组结构与其他非会话条目。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/recent-sessions)。
