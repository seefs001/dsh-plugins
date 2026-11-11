# dsh-switchboard

Connects dsh to a [Switchboard](https://github.com/seefs001/switchboard) relay as the `dsh` harness. Messages from Telegram, Discord or GitHub run as turns in dsh sessions, replies stream back, and tool approvals can be answered from IM, the relay panel, or the dsh GUI.

Host-only plugin. It has no settings page; configure it in the profile's `cordis.patch.yml`.

## Install

```bash
dsh plugin --profile web add link:/path/to/dsh-plugins/packages/switchboard
```

Restart dsh (or rely on `patchReload: live`) after editing the config.

## Configure

```yaml
- insert:
    - id: switchboard
      name: dsh-switchboard
      config:
        relayUrl: wss://switchboard.example.com/connect
        hostId: macbook            # must match hosts.<id> in switchboard.yaml; default: hostname
        tokenRef: SWITCHBOARD_TOKEN # dsh credential reference, then environment variable
        workspaces:                # aliases the relay may use; must match the relay's registry
          app: /Users/me/work/app
        profiles:                  # switchboard profile -> dsh permission preset
          readonly: read-only
          workspace-write: workspace-write
        approvalMode: race         # race | exclusive
```

| Field | Default | Meaning |
|---|---|---|
| `relayUrl` | empty | Relay WebSocket URL. Empty disables the plugin. |
| `hostId` | hostname | Host identity sent in `hello`. |
| `tokenRef` | `SWITCHBOARD_TOKEN` | Name of the host token in dsh credentials, falling back to the environment variable of that name. |
| `workspaces` | `{}` | Alias to absolute path. Paths are `realpath`-ed; missing ones are skipped. |
| `profiles` | see above | dsh preset applied for each relay profile. |
| `approvalMode` | `race` | `race`: relay and GUI both see bound-session approvals, first answer wins. `exclusive`: only the relay answers. |

### Permissions

Relay sessions always run with approval policy `ask`. The relay profile maps to a dsh permission preset:

- `readonly` → sandbox `read-only` + `ask`
- `workspace-write` → sandbox `workspace-write` + `ask`

dsh ships no read-only preset. Without one, the plugin writes the sandbox mode and approval policy directly, and the GUI shows the session as `custom`. To get a named preset, add it to the permission presets plugin:

```yaml
- name: '@deepseek-ai/dsh-permission-presets'
  config:
    presets:
      read-only:
        sandbox: read-only
        approval: ask
      workspace-write:
        sandbox: workspace-write
        approval: ask
      danger-full-access:
        sandbox: danger-full-access
        approval: never
```

A mapped preset with approval `never`, or a sandbox wider than the profile allows, fails the run. It never widens.

## Behavior

- **Runs.** A dispatch creates a session in the workspace, or resumes the bound one, then prompts it with `requestId = runId` through the same queue the GUI uses. Text deltas, final text, tool calls, todo plans and reasoning stream back. The run ends at its own turn's `turn/end` and carries the summed token usage.
- **GUI turns.** A message typed in the GUI on a bound session is announced to the relay (`run.open`, origin `gui`) and streamed to the same chat.
- **Approvals.** Only bound sessions are intercepted. In `race` mode the GUI card is removed when the relay answers first; when the GUI answers first the relay is told the approval was withdrawn. Cancelling a run cancels its pending approvals.
- **Cancel / steer / close.** Cancel stops the running turn, or removes a still-queued prompt. Steer uses dsh's steer delivery. `session.close` only forgets the binding; the dsh session stays.
- **Worktrees.** When the relay asks for a worktree, the session runs in `<workspace>/.switchboard/worktrees/<runId>` on the requested branch, with the commit author set in that worktree only. When the run ends, any new commits are uploaded as a git bundle (`base..branch`, with commit list and diffstat). Worktrees are not removed automatically.
- **State.** Unacked frames and session bindings live in the `switchboard_connector` storage domain, so a restart resends what the relay has not stored. Runs that were in flight are reported as `failed` (`connector-restart`).

## Development

`lib/vendor/switchboard-kit.js` is generated: it bundles `@switchboard/connector-kit`, `@switchboard/protocol` and zod, because plugins have no build step. Rebuild it from the switchboard checkout:

```bash
bun scripts/build-dsh-kit.ts
```
