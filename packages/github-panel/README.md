# dsh-github-panel

当 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）会话的工作目录关联到 GitHub 仓库，或对话中提及 GitHub 链接时，在右侧会话面板增加 **GitHub** 分栏，展示仓库概览、对话提及、打开中的 Pull Requests、Issues 与最新发布；点击任意条目或分组标题直接在新标签页打开 GitHub，并可通过行内菜单让 Agent 审查或排查、引用到输入框。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 宿主已安装并登录 GitHub CLI（`gh auth login`） |
| 数据保存 | 企业主机列表写入 `cordis.patch.yml`（`hosts`）；单会话隐藏的提及项存于浏览器 `localStorage`，其余仅内存 TTL 缓存 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/github-panel"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/github-panel"
```

## 工作方式

- **自动识别**：Host 读取会话当前工作目录的 Git 远端（按上游分支远端、`origin`、`upstream` 优先），未关联 GitHub 仓库且对话中也未提及 GitHub 链接时分栏自动隐藏。
- **对话提及提取与定位**：自动扫描当前会话消息中提及的 GitHub 链接（Issue / PR）、跨仓库简写（`owner/repo#123`）以及同仓库编号（`#123`、`PR #123`、`Issue #123`），经单次批量 GraphQL 解析实时状态（含已关闭 / 已合并项），优先列在 **对话提及** 分组中；悬停可预览提及原句，点击行内定位图标或菜单中的「定位到对话提及处」可直接滚动并高亮对话中的原文位置（多处提及可循环定位，历史轮次按需加载）。
- **右侧会话面板**：使用原生分栏与行样式展示仓库信息、对话提及项、打开中的 PR、Issue 和 Latest Release，支持悬停详情卡与长列表折叠；点击任意条目或分组标题直接在新标签页打开对应的 GitHub 页面。
- **快捷菜单操作**：通过每行右侧的 `…` 菜单让 Agent 审查 PR / 排查 Issue、引用链接到输入框或复制链接。
- **企业主机支持**：可在 DSH Web 的 **Plugins** 页面直接编辑 GitHub Enterprise 主机名列表，或在 `cordis.patch.yml` 的 `config.hosts` 中配置（默认 `["github.com"]`）。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/github-panel)。
