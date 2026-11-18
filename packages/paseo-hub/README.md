# dsh-paseo-hub

将 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Host 作为一个 daemon 接入 [Paseo Hub](https://github.com/getpaseo/hub)，把 Hub 的 GitHub、Slack、Discord、Linear、Telegram、定时和手动触发派发到本机运行为原生 DSH 会话；同时内置只读/可控写入的组织 API 控制台与 Agent 工具。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 前置依赖 | 支持 `dsh` provider 的 Paseo Hub + `@deepseek-ai/dsh-permission-presets` + `@deepseek-ai/dsh-storage-domain` |
| 数据保存 | Host `paseo_hub` storage domain + DSH credentials（`paseo-hub/daemon` 与 `paseo-hub/api`） |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/paseo-hub"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/paseo-hub"
```

## 接入与触发配置

1. 打开左侧栏 **Paseo Hub**，输入 Hub origin（如 `https://hub.example.com`），点击 **登录** 并在浏览器批准一次性注册码（无浏览器时可用含 `daemons:enroll` 权限的组织 Key 注册，仅用一次不落盘）。
2. 在 Hub 触发器中指定 `provider: dsh` 与必填 `mode`（映射到 DSH 权限预设）：

```yaml
run:
  target: { daemon: my-mac, cwd: /Users/me/project }
  agent:
    provider: dsh
    model: messages/claude-opus-5-5   # 可选：<DSH provider id>/<模型 id>
    thinkingOptionId: high            # 可选：推理强度
    mode: workspace-write             # 必填：DSH 权限预设
  prompt: 修复失败的测试并开 PR。
```

## 面板与 Agent 工具

侧栏 **Paseo Hub** 提供 5 个标签页：**概览**、**运行**、**活动**、**Hub API**（支持触发器 YAML 编辑校验、防重放 `deliveryKey` 手动触发、项目/资源查询与旧版配置 bundle）和 **设置**。

- **只读工具 `paseo_hub`**：查询 `status`、`check`、`projects`、`triggers`、`get-trigger`、`resources`、`setup-resources`、`validate-trigger`、`validate-configuration`。
- **写入工具 `paseo_hub_write`**：`install-trigger`、`install-configuration`、`dispatch`（**默认关闭**，仅人类可在页面显式开启）。

## 边界与安全

- Hub 的 `reply` 与 `finish_execution` MCP 工具及环境变量（`PASEO_*`、`GH_TOKEN`）仅注入由 Hub 启动的对应 DSH 会话，不影响你自己的普通会话；预设必须能使用会话级 MCP 工具（如 `standard` 或 `pi`）。
- 仅支持 `branch-off` worktree（需启用实验性 worktree 服务），一台 Host 同一时间只接入一个 Hub。
- 组织 API 请求严格锁定已保存的 origin，不跟随重定向，daemon 与 API 密钥均保存在 DSH credentials，从不返回前端或工具。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/paseo-hub)。
