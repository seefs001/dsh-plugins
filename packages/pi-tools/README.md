# pi

An isolated `pi` Agent preset for DeepSeek Harness. It runs Pi 1.5.0's original coding tools and QuickJS codemode inside DSH's sessions, permissions, sandbox, model routing, and MCP connections. The default preset and other sessions are unchanged. The preset's display name has no version suffix, but the implementation is pinned to Pi 1.5.0.

The Chinese guide is on the [documentation site](https://seefs001.github.io/dsh-plugins/docs/plugins/pi-tools/).

## Requirements

- DSH `>=0.2.2-rc.2 <0.3.0`. No DSH source changes are required. The package uses an ignorable `plugin:dsh-pi-tools/selection` Session record, the `conversation.hero.options` slot, and keyed `tool.call.toolview` entries. Codemode grammar sampling also wraps an internal pi-ai entry point; see [Codemode strings](#codemode-strings).
- `rg` and `fd` available in DSH's execution environment, or configured with `rgCommand` and `fdCommand`. The adapter does not download binaries.
- No global Pi CLI, Pi login, or Pi model configuration.

The package depends on `@earendil-works/pi-coding-agent@1.5.0` and `@earendil-works/pi-ai@1.5.0` without ranges and checks the version when it loads. It imports fixed private Pi modules, so upgrading Pi needs a compatibility review.

## Tools

### Original Pi tools

- `read`, `bash`, `edit`, `write`, `ls`, `find`, and `grep`, with Pi's original names, descriptions, and JSON parameter schemas.
- `codemode`: Pi's original codemode extension and QuickJS worker sandbox, with its original `{ "code": string }` parameter. Scripts can call tools, use `Promise.allSettled`, curate output, emit images, and use `store`/`load`, `ALL_TOOLS`, `searchTools`, `describeTool`, and `describeNamespace`.
- `tool_search`: Pi's original BM25 search. A successful search makes the matching tools directly callable from the next model call.

Most tool bodies are Pi's own code. `ls` and `find` use Pi's operation-injection hooks. Pi's `grep` has no subprocess-injection hook, so its search driver is adapted while the public definition and formatting helpers stay original.

### Native DSH features mounted in the preset

The bundle mounts these native DSH plugins inside the `pi` preset. Their tools keep their native registrations and conditions:

| Area | Tools and features |
| --- | --- |
| Subagents | `subagent`, `subagent_fork`, `list_subagent_models`, `send_message`, `list_agents`, `wait_agent` |
| Questions and skills | `ask_user_question`; the `skill` tool; `/` completion for project, user, and DSH bundled skill directories; `/name` injects the skill through the native pre-step pipeline with model/user invocation policies unchanged |
| Jobs, schedules, goals | `job_list`, `job_output`, `job_kill`; `schedule_create`, `schedule_list`, `schedule_view`, `schedule_edit`; `create_goal`, `get_goal`, `update_goal` and the `/goal` command |
| Plans and todos | `todo_write`; an isolated plan mode with `exit_plan_mode` |
| Web and presentation | `web_fetch`, `web_search`, `present` |
| Office | `office_render`, `office_convert`, `office_recalculate` |
| Plugin development | `plugin_manager`, `plugin_market`, `cordis_inspect_list`, `cordis_inspect_query` (the creator preset's runtime inspection; the Host side comes from the web-app bundle), the `dsh-doc` skill |
| Other | `workflow` (isolated workflow engine), time context, project instructions (up to 64 KiB), compaction and `/compact` |

The bundled skill directory is located through `DSH_INSTALL_DIR`, or the process entry point when that variable is unset, never through an external bundle's base URL.

`workflow` is DSH's native tool and runs on DSH's PTC runtime. It is separate from Pi's `codemode`, which stays on QuickJS with `{ code: string }`.

Plan mode reuses the standard preset's plan prompt. The preset does not copy the standard preset's same-name file and terminal tools, its persona, or its extra tool-result pruner. Like the creator preset, it enables the read-only plugin market tool and runtime inspection.

The global `grok_search` and `openai_search` from [`dsh-web-access`](../web-access), and `openai_image` and `grok_image` from [`dsh-image-gen`](../image-gen), pass through unchanged when configured and ready.

### Native conditions still apply

A tool that appears in the picker is not necessarily callable right now:

- `schedule_*` tools register only when the Host provides the schedule service.
- `plugin_manager` and `plugin_market` load only when a profile context exists; `plugin_market` also needs the Host plugin market service.
- `cordis_inspect_query` needs a connected page for Client providers.
- Office tools become available on the step after the matching Office skill is loaded. Without the Office service they report unavailable, as in native DSH.
- `exit_plan_mode` follows the native plan state.
- `grok_search` and `openai_search` are callable only while their route and credentials are ready. `web_search` follows the native web provider's availability. Registered search tools can remain visible in the picker while they are unavailable to the model.

The picker shows the catalog the Host actually returns, so the count varies by environment. Codemode calls go through the current step's real tool admission and never use an alias that bypasses Office or plan conditions.

### MCP

Selected existing DSH MCP connections are bridged, including resource helpers. The supplied preset selects every global namespace with `'*'`, so servers added later through the DSH MCP manager, such as those `dsh-pi-mcp` reads from Pi's `mcp.json`, appear without a config change. The plugin does not start a second MCP client or read or copy MCP credentials. Remote MCP access is not limited by the local filesystem sandbox.

## Choosing tools for a session

Select **pi** on the new-conversation screen, then open **Tools**. The dialog groups Pi tools, DSH tools by purpose, and MCP tools by server.

- The dialog opens in a simple view: one row per section with a checkbox, a selected count, and **Restore defaults**. Hover a row to see its tool names. **Per-tool settings** switches to the detailed view below; **Simple view** switches back. The browser remembers the last view.

In the detailed view:

- The filter matches tool names, descriptions, and section names. While filtering, every section with a match is shown expanded and its fold button is disabled; clearing the filter restores the previous fold state.
- Each section header has a checkbox. Without a filter it selects or clears the whole section. With a filter it acts only on the visible matches and says so in its label, so hidden tools are never changed.
- Folding or expanding a section never changes a selection.
- **Selected only** narrows the list to selected tools. **Expand all** / **Collapse all** toggle every section. Large catalogs start with only the Pi section expanded.
- **Restore defaults**, **Select all**, and **Clear** act on the whole catalog. Tools outside the defaults are tagged **opt-in**.
- A warning appears when MCP tools are selected but neither `codemode` nor `tool_search` is.

**Cancel** discards the dialog's edits. **Save** applies them to this conversation only. The selection locks when the first turn starts, and later saves are refused.

The defaults are the Pi tools, the configured MCP tools, the native tools mounted in the preset except those listed in `optInTools`, and the two passthrough searches. The supplied preset lists `present`, the Office tools, and the plugin development tools (`plugin_manager`, `plugin_market`, `cordis_inspect_list`, `cordis_inspect_query`) as opt-in. Other global DSH tools on the Host are opt-in. New tools are not added to an existing explicit selection; a new session or **Restore defaults** picks up the new defaults.

## How the selection applies

- The **Tools** button appears in the new-session row of a blank Pi session. Saving appends an ignorable `plugin:dsh-pi-tools/selection` record through `POST /pi-tools/options`; the Host refuses it once the first turn has started. Refresh and replay restore the committed selection, forks inherit the log, and switching presets resets it. A DSH build without this plugin still opens the session and skips the record.
- A selected preset-scoped native tool keeps its original registration and condition. A deselected one is blocked by an agent-level `false` shadow registration, so no same-name global tool falls through. Global passthrough tools keep their registrations and use per-agent restrictions for selection.
- Pi owns its nine tool names, so deselecting a Pi tool never exposes a same-name DSH tool.
- Deselected tools are excluded from model declarations, QuickJS discovery, and dispatch.
- Selecting tools does not enable another MCP connection or change permissions.

## Configuration

The bundle supplies this configuration in its preset:

```yaml
mcpServers: ['*']
mcpExposure: codemode
scopedTools: [subagent, subagent_fork, list_subagent_models, send_message, list_agents, wait_agent,
  ask_user_question, skill, job_list, job_output, job_kill, schedule_create, schedule_list,
  schedule_view, schedule_edit, create_goal, get_goal, update_goal, todo_write, web_fetch,
  web_search, present, office_render, office_convert, office_recalculate, exit_plan_mode,
  workflow, plugin_manager, plugin_market, cordis_inspect_list, cordis_inspect_query]
globalTools: [grok_search, openai_search, openai_image, grok_image]
optInTools: [present, office_render, office_convert, office_recalculate,
  plugin_manager, plugin_market, cordis_inspect_list, cordis_inspect_query]
```

| Option | Plugin default | Meaning |
| --- | --- | --- |
| `tools` | All seven coding tools | Which Pi coding tools to enable. |
| `codemode` | `true` | Enable original QuickJS scripts. |
| `toolSearch` | `true` | Enable deferred-tool discovery and loading. |
| `scopedTools` | `[]` | Native DSH tools mounted in this preset. Selected by default, keeping their native registration and conditions. Cannot name Pi or MCP tools. |
| `globalTools` | `[]` | Named global native tools enabled by default through passthrough, keeping their own admission conditions. |
| `optInTools` | `[]` | Names from `scopedTools` or `globalTools` that stay in the picker but are off by default. |
| `mcpServers` | `[]` | Global DSH MCP tool namespaces to bridge. `'*'` bridges every namespace, including ones registered later. |
| `mcpExposure` | `codemode` | `direct`, `codemode`, `deferred`, or `hidden`. |
| `maxParallel` | `10` | Limit for concurrent safe root calls and script subcalls. |
| `rgCommand` | `rg` | Executable name or absolute path in DSH's execution environment. |
| `fdCommand` | `fd` | Executable name or absolute path in DSH's execution environment. |

Exposure follows Pi's native MCP mapping. Both `codemode` and `deferred` become deferred callable tools: their schemas start hidden, scripts discover them with `searchTools`/`describeTool`, and `tool_search` can promote them. `direct` tools have public schemas from the start. `hidden` tools are neither callable nor searchable. `codemode` and `tool_search` themselves are model-only and cannot recurse through scripts.

Namespace aliases use the selected DSH server names. Descriptions and full instructions come from each server's public `mcp:<server>` prompt section, captured during successful scoped prompt assembly without changing it. Each scope has its own snapshot, and removed sections clear old metadata. Instructions stay discoverable through `describeNamespace` and are not added to every prompt.

Ordinary MCP bridges select configured unconditional global registrations by namespace. Resource calls must name a selected server. A disconnected or replaced MCP registration cannot be used through an old binding.

Updating this local bundle does not apply its new preset entries to an already installed profile. Existing sessions keep their composition revision.

## Subagents and questions

The existing Host `spawn` and `fork` providers own subagent creation, conversation inheritance, depth and model policy, messages, completion notices, and cleanup. No second backend, profile, or model client is created.

Subagent creation returns `{ kind: 'activation', name }`, not the final result. Codemode may start children and return their names, but it should not stay alive polling for completion. DSH delivers native completion notices and handles follow-up messages.

`ask_user_question` uses the native schema and answer service, directly or from codemode. Root sessions wait for the UI, including skip and cancellation. Native DSH rejects subagents asking the human directly; children should send the question to their parent with `send_message`. Explicit codemode timeout options also bound any wait inside a script.

## Session state and execution

The session log is the state authority. Successful `tool/result` metadata carries `store` writes or loaded tool names, and a projection derives each session's current values. Sessions share no mutable state.

```text
idle -> running -> successful result committed -> projection advances
                -> failure / cancellation      -> no state change
restore / fork  -> fold the retained session log
```

Separate internal bindings make selected deferred MCP tools part of the real DSH step admission without advertising them to the model. A custom executor hides those internal names and rejects direct calls to them. Nested calls use the shared DSH pipeline under their original public names, with input validation, guards, pre/post policy, cancellation, and canonical outputs.

Scripts receive Pi's structured `read` and `bash` values. A nonzero `bash` exit is still a failed tool result but resolves to its structured value inside scripts; check `exit_code`. Permission refusals, cancellation, and policy-rewritten errors are not recovered through this bridge.

Safe calls may overlap. Mutations form exclusive barriers, and policy preparation and result completion keep submission order. Script cancellation, permission-mode changes, and plugin disposal abort and drain started nested work. Pi's compact nested-call summaries stay in result metadata; individual nested outputs are not added to the model's history.

## Codemode strings

Codemode keeps Pi's original parameter schema, description, and `constrainedSampling` policy. Stock DSH drops that policy before the request reaches pi-ai, so the root companion entry re-attaches it to the exact Pi codemode declaration by wrapping `streamSimple` on the prototype of the pi-ai `Models` collection that `@deepseek-ai/dsh-llm-pi-ai` uses (`lib/pi-ai-hook.js`). pi-ai then uses raw-JavaScript grammar transport where the model's compat enables OpenAI grammar tools, and JSON `{ "code": "..." }` otherwise. DSH does not let a profile set that compat flag, so custom routes stay on JSON. The hook depends on DSH internals; if the layout changes, the Host log shows `pi-tools: codemode grammar sampling is unavailable` and codemode uses JSON. There is no extra `input` parameter, source wrapper, guessed repair, or automatic replay. Raw transport removes the JSON-string layer, but scripts must still be valid JavaScript.

When codemode is selected, its string guidance covers every string argument: file contents, edit text, paths, regex and glob patterns, and MCP fields. It includes nested Python, literal shell expansion, and multiline heredoc examples.

- Ordinary JavaScript strings interpret backslashes. Use `String.raw` for literal backslashes when the text has no backticks or `${...}`.
- `String.raw` still evaluates `${...}`. Escaping interpolation or backticks inside it keeps the extra backslashes. Build literal delimiters from ordinary quoted strings or concatenated raw chunks.
- Template line endings normalize to LF, including inside `String.raw`. Use explicit escapes for exact CRLF or CR.
- Pass objects and arrays directly when the schema expects them, and use `JSON.stringify` to produce JSON text. `code` contains source, not an already JSON-encoded string literal; double-encoded source can run without calling any tool and is not reinterpreted.
- Use an available direct tool for a single operation that does not need a script. This does not authorize enabling tools or changing permissions.

`SyntaxError` and `ReferenceError` results get specific recovery guidance only when no nested call was attempted and the run was not cancelled. Syntax feedback separates source errors from malformed input to `JSON.parse` or `eval`; reference feedback covers undeclared names and unintended template interpolation. The original error and metadata stay intact, and nothing is rewritten, retried, or replayed. The guidance helps models recover; it cannot guarantee they follow it.

## Web tool cards

The Web half claims the keyed `codemode` and `tool_search` views, which have no DSH built-in view. Successful Pi 1.5.0 text results show codemode call summaries with durations and errors, and loaded tool names. Pending and failed calls show a plain status row; failed calls include the error text. Pi `read`, `write` and `edit` keep DSH's built-in rows. Disclosure follows DSH's turn controls, and cards do not show live script progress.

The root companion entry sets `presentationOnly: true`, which registers no Host tools, prompt sections, executor, or session state. It serves the `/pi-tools/options` route for the owner, which finds the live Pi preset generation that owns the session. The Pi tools exist only inside the `pi` preset. Styles and locale registrations go away when the companion unloads.

## Compatibility boundaries

- File access uses `ctx.fs`; writes use DSH's atomic write with the calling session's sandbox policy. The profile must mount the sandbox-enforcing filesystem provider. DSH replaces a destination symlink instead of writing through it.
- Shell and search processes use DSH's managed subprocess service. Restricted sessions require `ctx.sandbox.confine`, and a failure never falls back to an unrestricted process. The environment stays DSH-owned and scrubbed.
- Omitting `bash.timeout` adds no timeout. A supplied timeout terminates the command; it does not create a background job. Pi shell settings and fictitious `PI_*` session metadata are not loaded.
- QuickJS scripts get no Node, filesystem, network, or timer APIs. Files and network go through the provided tools.
- Pi's worker limits and output formatting stay in force. Pi owns its temporary spill files; DSH stores returned images as durable attachments with its own admission and normalization limits.
- MCP scripts receive the canonical result envelope, including protocol content and optional structured content. DSH stays authoritative for MCP transport errors and server error results.
- `models.*`, classifiers, image-model routing, PowerShell, arbitrary Pi extensions, and Pi's agent loop are not loaded.
- Pi's tool and rule sections replace DSH's static tool guidance. DSH still owns model routing, runtime context, project instructions, session persistence, and compaction. Pi tools do not accept DSH escalation parameters; a permission denial needs a human permission change.

## Installation and development

Install this directory through DSH Plugin Manager, then select **pi** for a new session. The bundle keeps the preset id `pi` and entry id `preset-pi`. It does not rename the profile, change the default preset, or modify the shipped presets.

The package is plain ESM with no build or installation scripts. It resolves DSH's public exports from the running installation and does not install a second copy of the runtime. Use the repository's pnpm lockfile and do not update Pi automatically.

The validated target is a local macOS DSH installation. Remote filesystem and process combinations, live provider requests, Web card rendering in an installed GUI, and sessions created before an update need separate checks. After installing a new version, verify in a new `pi` session.

The reported multiline Python failure is kept in [the original input](../../scripts/fixtures/pi-multiline-python.json) and [the corrected input](../../scripts/fixtures/pi-multiline-python-corrected.json). The correction uses `String.raw` for both commands, because plain backticks accept the line breaks but turn Python's `r'\s+'` into `r's+'`. The check reproduces the exact QuickJS error, exercises the public recovery feedback, compares captured arguments byte for byte, and parses the shell and Python syntax without running the network operations. It adds no production rewriting or retries.

Run it from the repository root inside DSH, which supplies `DSH_INSTALL_DIR`:

```sh
node scripts/check-pi-multiline.mjs
```

Outside DSH, set `DSH_INSTALL_DIR` to the runtime package directory that contains DSH's dependencies. In a source checkout this is `apps/cli`, not the monorepo root.

The icon is original artwork under this repository's MIT license.
