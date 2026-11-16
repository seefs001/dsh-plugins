# dsh-paseo-hub

Connect a [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Host to [Paseo Hub](https://github.com/getpaseo/hub) as a daemon. Hub triggers from GitHub, Slack, Discord, Linear, Telegram, schedules, and manual runs then start DSH sessions on this Host. Hub sees one provider, `dsh`, with your DSH models and your permission presets as modes.

Status: version 0.1.0. Verified end to end against a local Hub (embedded database) and DSH 0.2.2-rc.3: browser sign-in, API key sign-in, enrollment, trigger validation, two manual runs to `succeeded` through `mcp__hub__finish_execution`, Hub env in bash, restart and reconnect, disconnect with revocation, and revocation from Hub's Daemons page. See [Verification](#verification).

Requires a Hub that knows the `dsh` provider. Stock Hub accepts only `claude`, `codex`, `opencode`, and `pi` for unattended triggers; it needs the one-line `dsh` allowlist change described in [Hub side](#hub-side).

## Install

```sh
dsh plugin --profile web add dsh-paseo-hub
```

Then add `dsh-paseo-hub` to the profile's `dsh.profile.bundles`, or enable **Paseo Hub** on the Plugins page.

## Connect

1. Open **Paseo Hub** in the sidebar.
2. Enter the Hub address, for example `https://hub.example.com`. Origin only, no path.
3. Click **Sign in**. The page shows a code and an **Open approval page** link. Approve the CLI login in Hub as an organization owner or admin; the code on both pages must match.
4. The plugin polls Hub, mints a single-use enrollment token, enrolls this Host with `hub.execute`, and connects. The page switches to **Connected**.

Without a browser, paste an organization API key with the **Enroll daemons** scope into the optional field instead. The key is used once to mint the enrollment token and is not stored.

The Host shows up on Hub's **Daemons** page under its hostname. If that name is taken, Hub adds a suffix.

## Write a trigger

```yaml
run:
  target: { daemon: my-mac, cwd: /Users/me/project }
  agent:
    provider: dsh
    model: messages/claude-opus-5-5   # optional: <DSH provider id>/<model id>
    thinkingOptionId: high            # optional: a reasoning effort of that model
    mode: workspace-write             # required: a DSH permission preset
  prompt: Fix the failing test and open a PR.
```

- **provider** is always `dsh`.
- **model** is `<DSH provider id>/<model id>`, exactly as Hub's model picker lists it. Omitted uses the DSH default model.
- **thinkingOptionId** is one of the model's reasoning efforts.
- To keep chatting by replying in Slack, Discord, or Telegram, set `continuation: { mode: conversation }` on the step. With `mode: new`, every mention is a fresh run and replies are ignored.
- **mode** is required for new triggers, as for Claude and Codex. Each mode is a DSH permission preset; the page lists the ones Hub can pick. Hub validates the trigger against this Host before saving, so a wrong model or mode fails at save, not at run time.

## What a run does

For each Hub agent the plugin:

1. Creates a DSH session in the trigger's `cwd`, applies the mode's permission preset, the model, and the effort, and titles it with Hub's title.
2. Mounts Hub's MCP server on that session only. The tools appear as `mcp__hub__reply`, `mcp__hub__finish_execution`, and so on.
3. Allows exactly the Hub tools Hub preapproved, in that session only. Every other tool follows the preset; a preset with `approval: ask` still asks you in the DSH UI.
4. Passes Hub's environment (`PASEO_AGENT_PROVIDER`, `PASEO_AGENT_MODE`, `PASEO_HUB_CONFIG_JSON`, short-lived `GH_TOKEN`/`GITHUB_TOKEN` when the trigger has GitHub authority) to that session's `bash` commands.
5. Streams turns, assistant text, reasoning, and tool calls to Hub. Hub ends the step when the agent calls `finish_execution`.

Each run's directory is added to the sidebar workspace list (existing workspaces are reused; directories of earlier runs are added on start), so Hub sessions appear in the session list. Set `listWorkspaces: false` to keep them out.

Follow-ups, cancel, archive, restore, title, and file reads (attachments) all address the same DSH session: Hub's agent id and workspace id are the DSH session id. The page lists the 20 most recent Hub runs with an **Open** button.

## Configuration

```yaml
- id: paseo-hub
  config:
    modes: {}          # Hub mode -> DSH preset; empty offers every preset under its own name
    defaultMode: ''    # mode for a Hub agent that names none; empty uses the presets default
    agentPreset: ''    # agent preset for Hub sessions; empty uses the deployment default
    listWorkspaces: true  # add each run directory to the sidebar workspace list
```

Example: offer only two modes under Hub-style names.

```yaml
    modes:
      full-access: danger-full-access
      read-only: read-only
```

## Connection states

| State | Meaning |
| --- | --- |
| Not connected | No relationship. Sign in. |
| Signing in | Waiting for browser approval, or enrolling. |
| Connecting / Reconnecting | Socket opening, or retrying with backoff from 1 s to 60 s. **Reconnect now** retries at once. |
| Connected | Hub can dispatch runs here. |
| Revoked | Hub refused this Host's credential or revoked it. Disconnect, then sign in again. |

**Disconnect** revokes the daemon on Hub, deletes the local credential, and keeps every DSH session. If Hub is unreachable, the page says so; revoke the daemon on Hub's Daemons page yourself.

## Limits

- **The agent preset must expose per-session MCP tools.** Hub's `reply` and `finish_execution` are mounted on the run's own session. `standard` exposes them, and so does `pi` from dsh-pi-tools with the per-Agent MCP passthrough (as direct tools, not through codemode). A preset that shows only global MCP servers never sees them: the run cannot reply, and Hub ends the step on its idle timeout.
- **Runs only while the Host runs.** Hub keeps the run pending and fails it on its own timeout if the Host is offline.
- **One Hub per Host.** Disconnect before switching Hubs.
- **Worktrees: `branch-off` only**, and only with the experimental worktree service (`dsh-experimental-worktree`) loaded. `checkout-branch` and `checkout-pr` are refused with a clear error.
- **Only Hub's own MCP server.** A trigger that adds other MCP servers is refused; configure extra MCP servers in DSH instead.
- **No provider options.** Use a mode.
- **Hub env reaches `bash` only.** It goes to the session's bash commands through the shell resolver, not to other tools or MCP servers. Variables named `DSH_*` are dropped.
- Workspace labels are acknowledged but not stored in DSH.

## Security

- The daemon credential is 32 random bytes, kept in DSH credentials (`paseo-hub/daemon`). Hub stores only its SHA-256 verifier.
- The CLI sign-in credential and any pasted API key are used once for the enrollment token and never written.
- Hub tool preapproval and Hub env apply only to sessions this plugin created for Hub. Your own sessions are unchanged.
- File reads are confined to the session's working directory after resolving symlinks, and capped by Hub's `maxBytes`.
- The page and its routes accept only the owner connection.

## Hub side

Hub needs to accept `dsh` for unattended triggers. In `src/triggers/configuration/unattended.ts`, add `"dsh"` to `UNATTENDED_PROVIDERS`. `dsh` keeps the mode requirement. The companion Hub change also updates the refusal text, the trigger editor description, and adds a DeepSeek Harness hint to the empty Daemons page.

## Verification

Checked on 2026-11-16 with Hub built from source (embedded database, `http://127.0.0.1:3917`) and DSH 0.2.2-rc.3 in an isolated `DSH_HOME`:

- Browser sign-in: code shown, approved on `/cli-login`, enrolled, connected, listed as online on Hub's Daemons page.
- API key sign-in, a bad key (clear error, back to not connected), and an origin with a path (refused).
- `POST /api/v1/triggers/validate` with `provider: dsh`: valid config accepted; unknown model and mode rejected with this Host's messages; missing mode rejected by Hub.
- Manual run with `model: messages/claude-opus-5-5`, `mode: workspace-write`: the session read a file and called `mcp__hub__finish_execution` without a prompt; the run `succeeded`.
- Manual run with `mode: danger-full-access`: `bash` printed `provider=dsh mode=danger-full-access` from Hub's env; the run `succeeded`.
- DSH restart: reconnected from stored state; run list kept.
- Disconnect: Hub shows the daemon as Revoked. Revoke from Hub: the page shows Revoked.

Not verified: GitHub, Slack, Discord, Linear, and Telegram triggers end to end; follow-up messages; worktrees; archive and restore from Hub; attachments.
