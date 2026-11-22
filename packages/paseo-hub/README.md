# dsh-paseo-hub

将 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Host 作为 daemon 接入 [Paseo Hub](https://github.com/getpaseo/hub)，在本地把 Hub 触发的任务跑成原生 DSH 会话；同时内置组织 API 控制台与 Agent 工具。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 支持 `dsh` provider 的 Paseo Hub、`@deepseek-ai/dsh-permission-presets`、`@deepseek-ai/dsh-storage-domain` |
| 数据保存 | Host `paseo_hub` storage domain + DSH credentials（`paseo-hub/daemon`、`paseo-hub/api`） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/paseo-hub"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/paseo-hub"
```

## 快速开始

1. 在左侧栏打开 **Paseo Hub**，填入 Hub origin（如 `https://hub.example.com`），点击**登录**并在浏览器批准授权码；无浏览器时可用含 `daemons:enroll` 权限的组织 API Key 一次性注册。
2. 在 Hub 触发器中把 `provider` 设为 `dsh`，建议显式指定对应的 DSH 权限预设作为 `mode`：

```yaml
run:
  target: { daemon: my-mac, cwd: /Users/me/project }
  agent:
    provider: dsh
    model: messages/claude-opus-5-5   # 可选：<DSH provider>/<模型>
    thinkingOptionId: high            # 可选：推理强度
    mode: workspace-write             # 可选：映射 DSH 权限预设
  prompt: 修复失败的测试并开 PR。
```

新版 Hub 的表单会在 daemon 提供权限模式时要求选择；YAML 可以省略 `mode`，此时插件使用映射后的默认权限预设。无人值守任务建议显式指定。

要在 Hub 的工作目录下拉框中显示项目，在该插件的 Host 配置中设置 `sharedProjectPaths`，例如 `sharedProjectPaths: ["/Users/me/project"]`。默认不公开任何目录，仍可手填绝对路径。这只是目录建议，不限制运行可使用的路径；开启 `listWorkspaces` 也不会把侧栏目录分享给 Hub。

## 面板与 Agent 工具

侧栏 **Paseo Hub** 包含 5 个标签页：**概览**、**运行**、**活动**、**Hub API**（触发器 YAML 校验与安装、手动触发、组织资源查询、旧版配置 bundle）和**设置**。

- **`paseo_hub`**（只读）：`status`、`check`、`projects`、`triggers`、`get-trigger`、`resources`、`setup-resources`、`validate-trigger`、`validate-configuration`。
- **`paseo_hub_write`**（写入，默认关闭）：`install-trigger`、`install-configuration`、`dispatch`，需在 **Hub API** 页显式勾选开启。

## 说明

- Hub 的 `reply`、`finish_execution` MCP 工具及环境变量（`PASEO_*`、`GH_TOKEN`）仅挂载到对应 Hub 会话；所用预设需支持会话级 MCP 工具（如 `standard` 或 `pi`）。
- Hub 续聊默认 `queue`，等待当前轮次结束；`steer` 请求 DSH 在最近的步骤边界接收输入。两者的回执都只确认 DSH 已接收，不代表模型已处理。`interrupt` 会被拒绝，不会改为排队；需要停止时请单独取消运行。
- worktree 支持 `branch-off` 模式（需启用 worktree 服务）；一台 Host 同一时间接入一个 Hub。

详见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/paseo-hub)。
