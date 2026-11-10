# dsh-session-groups

Custom session groups for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI. Each group has its own pinned sessions, which stay at the top of that group.

## Use

- Click **Session groups** in the sidebar panel list to open the groups page.
- **New group** creates a group; double-click a name or use the pencil to rename it.
- Hover a group header to add sessions, rename, reorder, or delete the group. Deleting a group keeps its sessions.
- Hover a session row to pin it in its group or remove it. Pinned sessions lead the group, newest pin first; the rest follow by last activity.
- Right-click a session in the sidebar for **Add to group** / **Move to group**, **Pin in group**, and **Remove from group**.

A session belongs to at most one group. Adding it to another group moves it there. The built-in workspace list and its own pins are not changed.

## Storage

Groups are stored on the Host in the `session_groups` storage domain, so every browser connected to the same dsh and the agent see the same groups. With the default `json` backend the file is `~/.dsh/storages/session_groups.json`. The Host pushes changes to open pages over server-sent events.

Requires the `@deepseek-ai/dsh-storage-domain` row, which the default profiles include.

## Agent tool

The Host registers a `session_groups` tool with the same operations as the UI: `list`, `create`, `rename`, `delete`, `move_group`, `add`, `remove`, `pin`. Every call returns the complete resulting groups.

## HTTP

| Route | Method | Purpose |
|---|---|---|
| `/session-groups/state` | GET | Current groups |
| `/session-groups/op` | POST | One operation, same shape as the tool arguments |
| `/session-groups/events` | GET | Server-sent events with the complete state after each change |

All routes use the Host's normal connection check.
