# dsh-tool-lens

Adds actions to tool-call rows in the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Chat. Each lens replaces the built-in row of one tool. Disabling the plugin restores the built-in rows.

## Lenses

| Tool | What changes |
|---|---|
| `skill` | The skill name is a link that opens the skill's `SKILL.md` in the right sidebar. The expanded instructions card has the same action in its header. |
| Truncated output (`bash`, `job_output`, `terminal_read`, `cordis_inspect_*`, `session_*`, `workflow`, `lsp`, web tools) | When the result ends with a spill notice, a **Full output** action opens the saved file in the right sidebar. |
| `subagent`, `send_message`, `interrupt_agent` | A **Conversation** action opens the child agent's conversation in the right sidebar. |
| `grep`, `glob` | With one result file, a chip opens it at the first match line. With several, **N files** lists them and you pick one. |
| `web_search`, `web_fetch` | **N sources** / **Browse** opens the page in the right-sidebar browser. Cmd/Ctrl-click opens a new tab. |

## How it works

The plugin runs in the browser (`lib/client.js`). Its Host half is empty; the Loader needs it for the bundle row.

- Each lens registers its tool name in the keyed `tool.call.toolview` slot at priority -10, which shadows the built-in view (priority 0).
- The skill lens draws its own row. The other lenses keep the built-in row: they find the shadowed entry through `ctx.slots.entries()`, render it with the same props, and float their actions over the row's right end, visible on hover or focus. They register only keys whose built-in view uses the `conversation` locale and has no entry-level `inject`, so the props match. If a lens crashes, the slot runtime drops it and the built-in row renders alone.
- The skill lens finds the file through the session's skill catalog (`skills/list`), so single-file skills open too. If the skill is no longer installed, it falls back to `<base directory>/SKILL.md` from the recorded tool output.
- Files open through `ctx.sidebarRight.openResource`, the same path the `/skill` chips in user messages use.

## Limits

- A skill removed after the call, whose output names no base directory, cannot be opened. The row shows a short hint.
- The lenses that keep the built-in row depend on `ctx.slots.entries()`. It is a public method of the slots service, but the Client inspector does not list it. Without it those lenses stay off and the built-in rows render unchanged.
- Many sites refuse to load in a frame. Use Cmd/Ctrl-click when the side-panel browser shows a blank page.
- Tools without a built-in view, such as MCP tools and other generic rows, are not covered.
