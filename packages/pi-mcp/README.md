# dsh-pi-mcp

Use the MCP servers configured for Pi in DeepSeek Harness. One file, `~/.pi/agent/mcp.json`, configures both.

## What it does

- Reads `$PI_CODING_AGENT_DIR/mcp.json`, defaulting to `~/.pi/agent/mcp.json`.
- Registers each enabled server with the DSH MCP manager (`ctx.mcpManager.register`). Tools appear as `mcp__<server>__<tool>`.
- Watches the file. Adding, changing, disabling, or removing a server takes effect without a restart. An invalid file keeps the current servers.
- Disabling or removing the plugin withdraws every server it registered.

## Field mapping

| Pi field | DSH |
|---|---|
| `command`, `args`, `env`, `cwd` | stdio entry; a leading `~/` expands to the home directory |
| `url`, `headers` | Streamable HTTP entry |
| `${VAR}` in any string | `${credential:VAR}`: a stored DSH credential, otherwise the launch environment |
| `timeout` (seconds) | `toolCallTimeoutMs` |
| `enabled: false` | not registered |
| `description`, `exposure`, `toolExposure` | ignored; the agent preset decides exposure |

Skipped with a log warning: `oauth`, `!command` values, `sse`, invalid names, and names that collide after `-`/`_` normalization or with an existing DSH server. Project `.pi/mcp.json` files are not read; the DSH MCP manager serves the whole Host.

Stdio servers start with DSH's scrubbed environment plus their `env`. Pass credentials explicitly through `env` with `${VAR}`.

Prefer `${VAR}` over literal tokens in `headers`: diagnostics redact only resolved credential values.

## Use with the pi preset

Set `mcpServers: ['*']` on `dsh-pi-tools` to bridge every global MCP namespace, including servers this plugin adds later.
