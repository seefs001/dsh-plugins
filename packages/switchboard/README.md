# dsh-switchboard

Connects DSH to a [Switchboard](https://github.com/seefs001/switchboard) relay as the `dsh` harness. Messages from Telegram, Discord, or GitHub run as turns in DSH sessions, replies stream back, and tool approvals can be answered from IM, the relay panel, or the DSH GUI.

Host-only plugin. It has no settings page; configure it in the profile's `cordis.patch.yml`.

## Install

```bash
dsh plugin --profile web add link:/path/to/dsh-plugins/packages/switchboard
```

The inserted row has an empty `relayUrl`, which keeps the connector off. After you edit the config, a profile with HMR enabled recomposes on its own; otherwise restart DSH.

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
        untrustedIsolation: true   # serve isolation: untrusted runs (see below)
        dataDir: ''                # default $DSH_HOME/switchboard (artifact payloads)
```

| Field | Default | Meaning |
|---|---|---|
| `relayUrl` | empty | Relay WebSocket URL. Empty disables the plugin. |
| `hostId` | hostname | Host identity sent in `hello`. |
| `tokenRef` | `SWITCHBOARD_TOKEN` | Name of the host token in DSH credentials, falling back to the environment variable of that name. |
| `workspaces` | `{}` | Alias to absolute path. Paths are `realpath`-ed; missing ones are skipped. |
| `profiles` | see above | DSH preset applied for each relay profile. |
| `approvalMode` | `race` | `race`: relay and GUI both see bound-session approvals, first answer wins. `exclusive`: only the relay answers. |
| `untrustedIsolation` | `true` | Advertise and serve `isolation: untrusted` runs. `false` rejects them with `isolation-unsupported`. |
| `dataDir` | `$DSH_HOME/switchboard` | Artifact payloads waiting for upload (`blobs/`), kept out of the storage-domain document. |

### Permissions

Relay sessions always run with approval policy `ask`. The relay profile maps to a DSH permission preset:

- `readonly` → sandbox `read-only` + `ask`
- `workspace-write` → sandbox `workspace-write` + `ask`

DSH ships no read-only preset. Without one, the plugin writes the sandbox mode and approval policy directly, and the GUI shows the session as `custom`. To get a named preset, add it to the permission presets plugin:

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

### Protocol

The plugin speaks the Switchboard connector protocol. `hello` advertises DSH capabilities: `steer`, `loadSession`, `resume`, `close`, and `untrustedIsolation` (from config).

### Runs

A dispatch creates a session in the workspace or worktree, or resumes the bound one, then prompts it with `requestId = runId` through the same queue the GUI uses. Text deltas, final text, tool calls (with ACP tool kind and file locations), todo plans and reasoning stream back. The run ends at its own turn's `turn/end` with summed token usage and an ACP `stopReason` (`end_turn`, `max_tokens`, `cancelled`).

### GUI turns

A message typed in the GUI on a bound session is announced to the relay (`run.open`, origin `gui`) and streamed to the same chat.

### Approvals

Only bound sessions are intercepted. Each request carries ACP options (`allow-once`/`allow_once`, `reject-once`/`reject_once`), a title, tool kind, file locations and a display-safe summary: control, zero-width, bidi and Unicode-tag characters removed, truncation marked. Relay selections map to `allowed-once` or `rejected`, and `cancelled` stays `cancelled`. In `race` mode the GUI card is removed when the relay answers first. When the GUI answers first, the relay gets `approval.withdrawn` with that selection. When dsh cancels the request, it gets `{outcome: cancelled}` from `harness`.

### Untrusted isolation

Applies to runs with `binding.isolation: untrusted`. The run gets a fresh session. A standard session is never reused, and a tainted session never serves a standard run (`isolation-mismatch`). The profile is forced to `readonly`. A `tools/pre-execute` gate allows only `read`, `read_image`, `grep`, `glob` and `todo_write`, with every path resolved (symlinks followed) inside the session's directory. `bash`, terminals, `run_code`, web tools, MCP tools and subagents are denied, so tool execution has no network path. Approval requests from tainted sessions are rejected without asking anyone. The taint survives `session.close` and restarts.

### Cancel / steer / close

Cancel stops the running turn, or removes a still-queued prompt. Steer uses DSH's steer delivery. `session.close` only forgets the binding; the DSH session stays.

### Worktrees

Applies when the binding has `binding.worktree`. The plugin first fetches the requested refspecs from `origin` with your own git credentials; a refspec without a destination lands under `refs/switchboard/fetched/`. The worktree starts at the exact `start` commit. With a `branch`, one worktree per branch (`.switchboard/worktrees/<branch>`) is reused and reset to `start` on each run. An existing local branch is only taken over when it starts with `switchboard/`. Without a branch, the worktree is detached at `.switchboard/worktrees/<runId>`. `restorePaths` (entries ending in `*` are prefixes) are restored to their `restoreFrom` version, or deleted when absent there, and marked skip-worktree so agent commits never carry the substitution. The commit author is set in that worktree only. At run end, commits since `start` upload as a chunked git bundle, awaited before `run.end`. Worktrees are not removed automatically.

### State

Unacked frames, session bindings and tainted sessions live in the `switchboard_connector` storage domain. Artifact payloads live as files under `dataDir/blobs`, so an unfinished upload resumes after a restart. Runs in flight at a restart are reported as `failed` (`connector-restart`).

## Development

`lib/vendor/switchboard-kit.js` is generated: it bundles `@switchboard/connector-kit`, `@switchboard/protocol` and zod, because plugins have no build step. Rebuild it from the switchboard checkout:

```bash
bun scripts/build-dsh-kit.ts
```
