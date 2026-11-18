# dsh-orbit-bridge

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）提供对 [Orbit](https://github.com/coollabsio/orbit) 项目的**只读**巡检桥（P1 阶段）。记录每次完整读取的基准快照，对比前后两次检查列出新增、变动与消失的任务，所有结果仅保存在 Host 本地，从不向 Orbit 写入任何数据。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 已连接的 Orbit MCP 服务器 + `@deepseek-ai/dsh-storage-domain` |
| 数据保存 | Host `orbit_bridge` storage domain（`routines` 与 `runs` 表） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/orbit-bridge"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/orbit-bridge"
```

## 两种检查模式

1. **人工点击「立即检查」**（侧栏 **Orbit 执行桥** 页面，仅 owner 权限可操作）：Host 不启动 Agent，直接通过受管工具管线读取 Orbit 项目任务，并生成纯程序对比的变动摘要。
2. **受限 Agent 巡检**（配合 `orbit_bridge_observe` 与 `orbit_bridge_submit_outcome` 工具）：
   - 必须运行在**已确认生效（active）**的规则及**工具集严格受限**的会话中（仅允许 `orbit_bridge_observe`、`orbit_bridge_submit_outcome` 及对应的 Orbit 只读 MCP 工具，包含跨项目越权检查）。
   - 发现变动时进入 `running`，要求模型提交引用精确 `changeKeys` 的结构化 `facts`（20 分钟超时记为 `no_outcome`）；无变动或首次基准直接结束，不消耗额外汇报。

## 状态与边界

- **规则生命周期**：新建为 `draft`，编辑后回退 `draft` 并需重新人工确认（`confirm`）才对 Agent 开放；支持 `pause` / `resume` / `archive`。每条规则最多保留最近 **30** 条 Run 记录（始终保留基线所依赖的 Run），面板最多建 **20** 条规则。
- **不自动创建定时任务**：面板可辅助填写 `RRULE` 与预设生成「定时任务草稿 JSON」（标注未审阅），需由你自行前往自动化页创建。
- **只读原则**：不修改 Orbit 任务、不发评论、不读写聊天/文档、不触发部署。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/orbit-bridge)。
