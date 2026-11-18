# dsh-session-groups

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）侧栏添加自定义会话分组和组内置顶功能，所有浏览器和 Agent 通过 Host 共享同一份分组数据。

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

- **侧栏文件夹**：分组会作为文件夹显示在侧栏工作区列表上方，支持拖拽会话加入或拖出新建分组。已分组的会话会从默认未分组列表中归类移出（删除分组不会删除会话本身）。
- **组内置顶**：右键会话或点菜单可 **加入分组**、**移到分组**、**在组内置顶 / 取消置顶**、**从分组移除**。置顶会话固定排在所属分组顶部，其余按最近活动排序。
- **独立管理页**：点击侧栏 **会话分组** 面板图标，可集中新建、重命名、调整分组顺序、搜索添加会话或删除分组。
- **Agent 工具**：插件注册 `session_groups` 工具，支持 `list`、`create`、`rename`、`delete`、`move_group`、`add`、`remove`、`pin`。

## 限制与同步

- 每个会话最多属于一个分组（加入新分组时会自动从旧分组移出），最多支持 **200** 个分组。
- Host 通过 `GET /session-groups/events`（SSE）向所有打开的浏览器实时广播变更。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/session-groups)。
