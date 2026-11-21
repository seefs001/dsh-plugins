# dsh-session-groups

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）侧栏添加自定义会话分组和组内置顶，分组状态保存在 Host，所有浏览器和 Agent 实时同步。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | `@deepseek-ai/dsh-storage-domain` |
| 数据保存 | Host `session_groups` storage domain |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/session-groups"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/session-groups"
```

## 用法

- **侧栏文件夹**：分组显示在工作区列表上方，支持拖拽会话加入、拖出移回原列表，或拖到新建区直接建组。
- **组内置顶**：右键会话可 **加入分组**、**移到分组**、**组内置顶 / 取消置顶**、**移出分组**；置顶会话排在分组最前，其余按最近活动排序。
- **管理页**：点击左侧栏 **会话分组** 图标，可集中新建、重命名、调整顺序、搜索添加会话或删除分组。
- **Agent 工具**：注册 `session_groups` 工具，支持 `list`、`create`、`rename`、`delete`、`move_group`、`add`、`remove`、`pin`。

## 规则

- 每个会话最多属于一个分组，最多 200 个分组；删除分组仅解散分组，会话保留。
- Host 通过 `GET /session-groups/events`（SSE）向已打开的客户端广播变更。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/session-groups)。
