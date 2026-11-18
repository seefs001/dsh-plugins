# dsh-recent-sessions

将 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）输入框 `@` 引用菜单里的会话列表按最近活动时间排序（最新在前），同活动时间保留原有顺序。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Web（Host 入口仅用于加载 bundle） |
| 数据保存 | 无独立配置或存储 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/recent-sessions"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/recent-sessions"
```

## 工作方式

- 包装 `@` 触发源（`reference`）的 `candidates` 返回列表，解码每行会话的 `dsh-session:...` 引用 ID，对照 `sessions.list` 中的 `updatedAt` 进行稳定降序排序。
- 仅重排各连续会话区块内部顺序，不打乱分组结构，也不影响文件引用或新建会话默认列表。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/recent-sessions)。
