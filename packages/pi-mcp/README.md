# dsh-pi-mcp

读取 Pi 的 `~/.pi/agent/mcp.json`（或 `PI_CODING_AGENT_DIR` 下的 `mcp.json`），将启用的 MCP 服务器注册到 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH），并监听文件变更热更新。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host |
| 前置依赖 | `@deepseek-ai/dsh-mcp-manager`（默认 profile 已内置） |
| 数据保存 | 直接读取本地 `mcp.json`，不另存配置 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/pi-mcp"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/pi-mcp"
```

## 转换与热更新

- **传输方式**：支持 `stdio`（展开开头 `~/`，映射 `command`、`args`、`env`、`cwd`）和 `streamable-http`（映射 `url`、`headers`），并将秒级 `timeout` 转为毫秒。
- **延迟加载**：将 `exposure: "deferred"` / `"on-demand"` 映射为 DSH MCP 的 `toolLoading: "on-demand"`（`"eager"` / `"direct"` 映射为 `"eager"`）。用 `config.eagerServers` 指定仅在 DSH 中直接注册工具的服务名，不改写 Pi 配置。
- **按服务跳过**：支持在 `cordis.patch.yml` 的 `config.disabledServers` 或环境变量 `DSH_PI_MCP_DISABLED_SERVERS`（逗号分隔）指定跳过同步的服务名，不影响 Pi 自身配置。
- **环境变量引用**：`${VAR}` 转换为 DSH 的 `${credential:VAR}`，由 DSH 凭据与运行环境解析。
- **跳过项**：忽略 `enabled: false`、带 `oauth` 字段、`!command` 动态命令、不合法的服务名，以及仅 `-` 和 `_` 不同的重名服务，并写入警告日志。
- **文件监听**：监听所在目录（300 ms 去抖）以捕获原子保存；文件损坏或无法解析时保留当前已注册列表。

更多说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/pi-mcp)。
