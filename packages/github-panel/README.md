# dsh-github-panel

当 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）会话的工作目录关联到 GitHub 仓库时，在右侧会话面板增加 **GitHub** 分栏，展示仓库概览、打开中的 Pull Requests、Issues、GitHub Actions 构建状态与最新发布；点击任意条目可在右侧边栏打开详情页并引用到对话输入框。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 宿主已安装并登录 GitHub CLI（`gh auth login`） |
| 数据保存 | 无（仅内存 TTL 缓存） |

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
- **对话提及提取**：自动扫描当前会话消息中提及的 GitHub 链接（Issue / PR / Actions Run）、跨仓库简写（`owner/repo#123`）以及同仓库编号（`#123`、`PR #123`、`Issue #123`），经单次批量 GraphQL 解析实时状态（含已关闭 / 已合并项），优先列在 **对话提及** 分组中；即使会话不在 GitHub 目录内，提及完整链接也会显示。
- **右侧会话面板**：使用原生分栏与行样式展示仓库信息、对话提及项、打开中的 PR、Issue、近期 Actions 工作流运行和 Latest Release，支持悬停详情卡、列表折叠和一键引用到输入框。当前分支最新 Actions 失败且面板收起时，在标题栏开关显示红点提示。
- **右侧边栏详情**：点击条目打开 **GitHub** 标签页，查看本仓库或跨仓库 PR/Issue 的 Markdown 正文、标签、检查与评论，查看 Actions 各 Job 与步骤并支持重跑失败任务，或浏览最近提交与 Release 说明。
- **企业主机支持**：可在 `cordis.patch.yml` 的 `config.hosts` 中列出额外的 GitHub Enterprise 主机名（默认 `["github.com"]`）。

更多说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/github-panel)。
