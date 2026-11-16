# dsh-roles

Role manager for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI. A role is a detailed prompt plus its own skills. Pick a role for a session in the composer's model menu; the agent then works in that role from its next step.

## Choose a role

- Open the composer's model menu. Below **Model** and **Effort** there is a **Role** row; click it to expand the role list and pick one, or **None** to clear it.
- The active role shows as a chip on the left of the composer. Clicking the chip, or **Manage roles…** in the list, opens the role manager.
- Each session has its own role. A new session starts with no role. Subagent sessions do not show the row.
- A switch applies from the next model step. A running step keeps the prompt it started with.

## Manage roles

Open **Roles** in the sidebar, or **Open role manager** on this bundle's **Plugins** page:

- The left column lists roles in menu order, with skill counts and how many sessions use each role.
- Edit the name, emoji and description inline. The **Prompt**, **Skills**, and **What the model sees** tabs separate editing from inspection; the preview includes unsaved edits.
- **Save** (⌘S / Ctrl+S) stores the role; **Discard** reverts the draft. Unsaved drafts survive role switches and navigation within this loaded page, but not a reload. A new role is only stored after **Create role**.
- The bottom save bar stays visible. Field errors, unsaved markers, and an external-edit warning show the state of the draft.
- **New role** adds a draft. **More actions** contains Duplicate, Move up/down, Reset to built-in and Delete. Duplicating includes unsaved edits. Deleting a role clears it from the sessions that used it.
- Four built-in roles ship with the plugin: 代码审查员 (code reviewer), 架构师 (architect), 调试专家 (debugger) and 技术写作 (technical writer). Each has a detailed prompt and one or two skills. Edit them freely; **Reset to built-in** restores one, and **Restore built-in roles** adds back the ones you deleted.

Limits: 100 stored roles, 20 role-owned skills and 20 local references per role, 40,000 characters per prompt, 60,000 per role-owned skill.

### Reference local skills

In **Skills → Local skill references**, search and check existing skills. The catalog comes from DSH's native skill registry, including its configured user, custom and bundled filesystem roots. Enter a project directory and click **Read skill catalog** to include that project's skills.

Only names are saved in `localSkills`; no files are copied or changed. At runtime, the native `skill` tool resolves each name in the session's own project context, so resource directories and local edits remain intact. A reference missing from that session's catalog is unavailable; the role prompt tells the agent to report it instead of inventing instructions. References do not hide or restrict other session skills. A name cannot be both a reference and a role-owned skill.

**Role-owned skills** below the picker are editable Markdown embedded in the role itself.

## What the model sees

- **Prompt.** The role is added to the system prompt right after the deployment persona and before DSH's own guidance, as `# Active role: <name>` followed by your prompt and the names of the role's skills. It says that an explicit request from the user in the conversation takes precedence.
- **Skills.** The role's skills are served by a skill provider registered on each agent's own scope, so they appear in the `skill` catalog only in sessions using that role and load through the `skill` tool like any other skill. Skill names are kebab-case. A project or user skill with the same name wins over a role skill. Role skills have no files, so they should not refer to relative paths.

Switching roles changes the system prompt, which lowers provider cache reuse for the next request.

## Agent tool

The Host registers a `roles` tool with the same operations as the UI: `list`, `get`, `catalog`, `preview`, `create`, `update`, `duplicate`, `delete`, `move`, `select`, `reset`, and `restore_builtins`. `select` acts on the calling session. The tool description tells the agent to change roles only when the user asks.

`catalog {cwd?}` lists local skill metadata, without loading bodies. `create` / `update` accept `role.localSkills: ["skill-name"]` alongside inline `role.skills`. `preview {role}` renders the prompt without saving.

## Storage

Roles and each session's role live on the Host in the `roles` storage domain. With the default `json` backend the file is `~/.dsh/storages/roles.json`. The Host pushes changes to open pages over server-sent events. Selections whose role no longer exists are dropped, and at most 2,000 session selections are kept.

The plugin needs `@deepseek-ai/dsh-storage-domain` and `@deepseek-ai/dsh-system-prompt`; role skills also need `@deepseek-ai/dsh-skill` and `@deepseek-ai/dsh-tool-skill`. The default profiles include all of them.

## HTTP

| Route | Method | Purpose |
|---|---|---|
| `/roles/state` | GET | All roles and session selections |
| `/roles/op` | POST | Run one operation, same arguments as the tool plus `sessionId` for `select` |
| `/roles/events` | GET | SSE with the full state after every change |

All routes go through the Host's usual connection check.
