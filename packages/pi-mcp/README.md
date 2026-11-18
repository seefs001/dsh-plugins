# dsh-pi-mcp

把 Pi 的用户级 MCP 配置文件（`~/.pi/agent/mcp.json`，支持 `PI_CODING_AGENT_DIR` 环境变量重定向）共享给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH），并实时监听文件修改自动热同步。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host |
| 前置依赖 | `@deepseek-ai/dsh-mcp-manager`（默认 profile 已包含） |
| 数据保存 | 读取本地 `mcp.json`，不另存配置或复制密钥 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/pi-mcp"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/pi-mcp"
```

## 转换与同步规则

- **支持的传输**：`stdio`（带 `command`，展开 `~/` 并映射 `args` / `env` / `cwd`）以及 `streamable-http`（带 `url` 与 `headers`），支持 `timeout`（秒转毫秒）。
- **凭据安全引用**：自动把 Pi 写法 `${VAR}` 转换为 DSH 的 `${credential:VAR}`，由 DSH credentials 与运行环境解析，密钥不落入日志或配置文件。
- **跳过项与冲突**：`enabled: false`、带 `oauth` 配置、`!command` 外部命令求值、非法服务名，以及仅 `-` 与 `_` 不同的重名条目会被安全跳过并记警告日志。
- **原子保存保护**：监听 `mcp.json` 所在目录（300 ms 去抖）；如果文件正在写入或 JSON 临时损坏，保留当前已注册的服务器列表不中断服务。

更多使用说明见[在线中文文档](https://seefs001.github.io/dsh-plugins/docs/plugins/pi-mcp)。
