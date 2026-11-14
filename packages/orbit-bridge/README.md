# dsh-orbit-bridge

A read-only watch over [Orbit](https://github.com/coollabsio/orbit) projects for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Host. This is the P1 "minimal read-only execution bridge": it reads every task of the chosen projects, compares the complete read with the last processed one, and keeps the result on the Host. It never writes to Orbit, never sends messages, and never creates a Schedule.

Status: version 0.1.0, not yet installed in any profile. The Web page and the agent tools have not been exercised in a running DSH. See [Verification](#verification).

Key limits:

- **Native tool executor only.** Under a PTC executor (`run_code`), the bridge's direct Orbit reads are rejected and every run fails.
- **No ready unattended path.** Agent runs need a session whose preset exposes only the bridge tools and three Orbit read tools. No such preset ships with this plugin, and the plugin cannot check a preset before a scheduled session starts.
- **Project changes only.** No due-date or staleness rules.

## What it reports

Changes of project tasks against the last processed check:

- **New**: a task id that was not in the baseline.
- **Status**: a different `status_id`, shown as old → new status name.
- **Changed**: a different title, priority, assignees, labels, parent, milestone, cycle, due dates, estimate, or description (compared by digest).
- **Missing or no longer visible**: a task in the baseline that the complete read no longer returned. It may be deleted, moved out of scope, or hidden by an access change; the bridge does not call it done.

Orbit `version` is stored as evidence and never decides a change: a task whose version moved but whose compared fields stayed equal reports nothing.

Not implemented: time rules such as "due soon" or "not updated for N days", blocking detection, comments, docs, and chat. The bridge reports project changes only.

## Routines and runs

A **Routine** is a watch over 1–10 Orbit project ids through one MCP server name (default `orbit`, so the tools are `mcp__orbit__*`). It is `draft`, `active`, `paused`, or `archived`, and carries a `revision`. Every edit returns it to draft; confirm, pause, resume, archive, and edit each raise the revision and cancel any open run of that routine.

A **Run** is one check. Its states:

| State | Meaning |
|---|---|
| `running` | Reading Orbit, or (agent runs) waiting for the agent's outcome |
| `baseline` | First complete read, or the scope or connection identity changed: recorded as the new baseline, no change list |
| `no_change` | Complete read, nothing changed since the last processed run |
| `succeeded` | Complete read with changes, and a result was recorded |
| `failed` | Partial read, interrupted by a Host restart, or no agent outcome 20 minutes after the read finished |
| `cancelled` | The routine changed or the calling tool was cancelled while the run was open |

Only `baseline`, `no_change`, and `succeeded` runs with a complete read count as processed.

The 20-minute limit has no timer. The Host applies it lazily when the page loads state, when a new run starts, and when an outcome is submitted; until then an overdue run still shows as waiting.

### Two baselines

- **Last complete read** (observed): the newest run whose read was complete, processed or not.
- **Last processed result** (processed): the newest `baseline`, `no_change`, or `succeeded` run.

Both are derived from the stored runs on every read; there is no separate pointer that can drift. A complete read whose agent outcome never arrives moves the observed baseline but not the processed one, so the same changes appear again on the next check. A partial read moves neither.

A run is compared only with a processed run of the same scope digest (server name, sorted project ids, snapshot format) and the same connection identity fingerprint. Otherwise it records a new baseline.

### Complete reads

Each check calls, through `ctx.tools.execute()`:

1. `get_me`: the user or service account id, workspace id, token id, token scopes, and granted project ids form a non-secret identity fingerprint. Missing fields, no `tasks:read`, or a routine project outside the grant fail the read.
2. `list_task_statuses` and `list_tasks` for each project, every page, 100 per page.

The read becomes **partial**, and produces no change list, when any call fails or returns an error, a page lacks `items` or `next_cursor`, a cursor is empty, repeated, or rejected, a project needs more than 50 pages, the routine holds more than 2,000 tasks, a task belongs to another project than the one requested, or a task or status lacks a required field (`identifier`, `title`, `status_id`, `version`, `assignee_ids`, `label_ids`; status `id`, `name`, `category`). A partial run keeps its counts and errors for diagnosis, not its task data.

The run stores task snapshots (ids, identifiers, links, compared fields, description digest), not descriptions or comments. Calls made with `ctx.tools.execute()` and no `log` add no tool-call events to a Session; the run record is the evidence of what was read.

### Duplicate triggers

- A routine has at most one open run. Another check while one is open is refused.
- An agent has at most one open run. Calling observe again for the same routine returns that run only if the routine is still active, confirmed, and at the run's revision; otherwise, or for another routine, the call is refused.
- Changes are computed against the processed baseline, so a change that was processed does not reappear. Each change carries a stable key derived from the routine, scope, task, kind, and new field values.

## Web page

Click **Orbit bridge** in the sidebar panel list. Each routine card shows the scope, the forbidden actions, the offline limit, three times (last run started, last complete read, last processed result), the connection workspace and scopes, and a warning when the connection also holds write scopes. Buttons:

- **Check now** (draft or active): an attended, program-only check. It records a program-generated change list and is labelled as not being model analysis. The first check records a baseline.
- **Confirm and enable** (draft), **Pause**, **Resume**, **Archive**, **Edit**. Editing an active or paused routine returns it to draft; agent runs are refused until it is confirmed again. The form keeps the revision it was opened at, so a change from another page makes the save fail instead of overwriting it.

A running run reads "Reading Orbit" until the read finishes, then "Waiting for the agent outcome". The change list is always program-generated; for agent runs only the summary, facts, and inferences come from the agent. Program summaries and error kinds are localized in the page; the raw error detail stays visible.

Every operation sends the revision the page loaded, and the Host refuses it if the routine changed since. Recent runs show state, read coverage, the change list with Orbit links, the agent's facts and inferences when present, and errors.

## Agent tools

| Tool | Use |
|---|---|
| `orbit_bridge_observe` `{ routineId }` | Start a check of an active, confirmed routine. Returns `runId`, `state`, and `changes`. `running` means changes were found and an outcome is required; other states are final. |
| `orbit_bridge_submit_outcome` `{ runId, summary, facts, inferences?, limitations? }` | Record the outcome. Each fact cites `changeKeys` from the run. Refused for another session's run, a closed run, unknown keys, or a routine that was paused or changed after the run started. |

Both tools fail closed:

- `orbit_bridge_observe` refuses unless every tool the calling Agent can see is one of the two bridge tools or `mcp__<server>__get_me`, `list_task_statuses`, `list_tasks`. An ordinary full-tool session is refused; use **Check now** instead.
- While a run is open, a tool guard denies that Agent every other tool, and denies `list_tasks` and `list_task_statuses` for projects outside the routine. The guard also covers tools registered after the check started and scope-local tools that a restriction would not hide.
- The reads run in the calling Agent's scope, so its tool policy applies. Without an Agent (Check now), a policy that asks for approval denies the read.
- PTC executors accept only `run_code` as a direct call, so the bridge's direct reads fail there and the run fails. Use a native executor.

What this does not cover: before `orbit_bridge_observe` runs, nothing in this plugin limits the session. A preset that exposes other tools could call them first; the bridge then refuses the run but cannot undo those calls. Whether a preset is truly restricted must be checked by a person.

## Schedule draft

A routine may hold a draft Schedule: an RRULE (one `DTSTART` line and one `RRULE` line), a target (`new` or `new_once`), an agent preset, and an optional directory. With RRULE and preset set, the page shows a `ScheduleCreateRequest` JSON (`title`, `prompt`, `timing: { kind: 'rrule' }`, `target.create.agentPreset`) that you can create yourself on the Automation tasks page.

The draft is always marked not reviewed (`reviewed: false`, `createdByBridge: false`). The bridge does not call the Schedule service, does not check the preset, and cannot tell whether you created the Schedule elsewhere. Pausing a routine only makes the bridge refuse runs; a Schedule you created keeps opening sessions until you pause it on the Automation tasks page. Schedule delivery only proves that the instruction reached a Session inbox; the run state shows whether a check finished.

## Owner operations

| Route | Method | Purpose |
|---|---|---|
| `/orbit-bridge/state` | GET | Routines, recent runs, Schedule drafts |
| `/orbit-bridge/op` | POST | `create`, `update`, `confirm`, `pause`, `resume`, `archive`, `check`; all but `create` need `expectedRevision` |

Both routes require `ctx.connection.admit()` to return a Peer whose principal kind is `owner`. No agent tool can confirm, pause, resume, archive, or edit a routine.

## Storage

The `orbit_bridge` storage domain holds tables `routines` and `runs` (with the default `json` backend, `~/.dsh/storages/orbit_bridge.json`). The Host keeps the newest 30 runs per routine plus the runs both baselines depend on. Writes are serialized inside the plugin; Orbit reads run outside that queue. A run left `running` by a stopped Host becomes `failed` (`interrupted`) on the next start. There is one Host and no cross-process coordination.

## Trust boundary

The Host half is trusted local code. It does not open Orbit HTTP connections or read Orbit credentials; it reaches Orbit only through `ctx.tools.execute()` and keeps its data only in the storage domain, besides serving its two local HTTP routes. These properties come from this source, not from a sandbox. The Orbit connection used in development holds `tasks:write` and `docs:write`; a dedicated read-only Orbit token is safer for unattended use.

## Verification

Done: `oxlint` and `node scripts/validate.mjs` pass; Host and Client files pass `node --check`. The Orbit envelope (`structuredContent: { items, next_cursor }`, `next_cursor: null` on the last page, an error for an invalid cursor, the `get_me` fields) was confirmed with read-only calls. Tool, storage-domain, connection, and slot contracts were read from the installed DSH 0.2.2-rc.3 sources and its runtime inspection output.

Not done: installing the bundle, the Web page in a browser, agent tools in a real session, the guard against a live preset, a Schedule, restart recovery, and fault injection against a real Host.

Requires `@deepseek-ai/dsh-storage-domain`, the tool registry, the Web server, and an Orbit MCP server registered under the configured name.
