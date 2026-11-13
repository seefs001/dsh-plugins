# pi

An isolated **pi** Agent preset for DeepSeek Harness. It does not change the default preset or other sessions. The implementation stays pinned to **Pi 1.5.0**, even though the preset's display name has no version suffix.

## Capabilities

- `read`, `bash`, `edit`, `write`, `ls`, `find`, and `grep`, with Pi's original names, descriptions, and JSON parameter schemas.
- The original Pi `codemode` extension and its QuickJS worker sandbox. Scripts can call tools, use `Promise.allSettled`, curate output, emit images, and use `store`/`load`, `ALL_TOOLS`, `searchTools`, `describeTool`, and `describeNamespace`.
- The original BM25 `tool_search`. A successful search makes matching tools directly available from the next model call.
- DSH's native `subagent`, `subagent_fork`, `list_subagent_models`, `send_message`, `list_agents`, and `wait_agent`, both directly and through codemode. The Host's existing `spawn`/`fork` providers own creation, conversation inheritance, depth/model policy, messages, completion notices, and cleanup.
- Selected **existing DSH MCP connections**, including resource helpers. The supplied preset selects the `nowledge_mem` tool namespace. It does not start a second MCP client or read/copy MCP credentials.

The plugin depends on `@earendil-works/pi-coding-agent@1.5.0` without a range and checks that version when loading. No global Pi CLI, Pi login, or Pi model configuration is needed. The plugin imports fixed private modules, so upgrading Pi requires a compatibility review.

Most tool bodies are original Pi code. `ls` and `find` use Pi's operation-injection hooks. Pi's `grep` has no subprocess-injection hook, so its search driver is adapted while retaining its original public definition and formatting helpers. This is not a collection of renamed DSH tools.

## Conversation tool selection

Select **pi** on the new-conversation screen, then open **Tools**. The dialog lists Pi tools, additional eligible DSH tools, and tools from the configured MCP connections. Filter by name or description, select individual tools, clear the selection, or restore the preset defaults. **Cancel** discards dialog edits; **Save** applies them to this conversation only. Starting the first turn locks the selection.

The original Pi tools, configured MCP tools, and available native subagent companions are selected by default. Other DSH tools remain opt-in. Existing explicit Session selections are not expanded when new tools become available. Pi keeps ownership of its nine tool names, so deselecting a Pi tool never exposes a same-name DSH fallback. Global bridges require unconditional registrations. `scopedTools` additionally admits explicitly named unconditional native tools mounted in this preset; other presets' private tools are not imported. Selecting tools does not enable another MCP connection or change permissions.

Selections are stored as `agent-preset/options` in an existing blank Session. Refresh and replay restore the committed selection, and forks inherit the log. Before a Session is bound, the choice is only an in-memory draft for the next new conversation. Switching presets resets that draft. Disabled tools are excluded from direct declarations, native QuickJS discovery, and dispatch. Extra DSH tools are directly available and also callable from codemode. Deferred MCP tools still need codemode or tool_search; the dialog warns when both gateways are deselected.

This control needs the companion DSH changes: the session-owned preset options API and `conversation.hero.agentPreset.options` slot. An unmodified release with the same DSH version number does not provide these new interfaces. Updating local source does not restart the running Host.

## Configuration

The bundle supplies this configuration in its preset:

```yaml
mcpServers: [nowledge_mem]
mcpExposure: codemode
scopedTools: [subagent, subagent_fork, list_subagent_models, send_message, list_agents, wait_agent]
```

Other options:

| Option | Default | Meaning |
| --- | --- | --- |
| `tools` | All seven coding tools | Select Pi coding tools. |
| `codemode` | `true` | Enable original QuickJS scripts. |
| `toolSearch` | `true` | Enable deferred-tool discovery and loading. |
| `scopedTools` | `[]` in the plugin | Native DSH tools mounted in this preset to bridge and select by default; cannot name Pi or MCP tools. |
| `mcpServers` | `[]` in the plugin | Global DSH MCP tool namespaces to bridge. |
| `mcpExposure` | `codemode` | `direct`, `codemode`, `deferred`, or `hidden`. |
| `maxParallel` | `10` | Limit for concurrent safe root calls and script subcalls. |
| `rgCommand` | `rg` | Executable name or absolute path in DSH's execution environment. |
| `fdCommand` | `fd` | Executable name or absolute path in DSH's execution environment. |

`rg` and `fd` must already be available to DSH, or be configured explicitly. This adapter does not automatically download binaries or install global dependencies.

Exposure follows Pi's native MCP mapping: both `codemode` and `deferred` become deferred callable tools. Their public schemas and inline catalog entries are initially absent; scripts discover them with `searchTools`/`describeTool`, and `tool_search` can promote either category. `direct` tools have public schemas from the start. `hidden` tools are neither callable nor searchable. `codemode` and `tool_search` themselves are model-only and cannot recurse through scripts.

Namespace aliases use the selected DSH server names. Descriptions and full instructions come from the selected server's public `mcp:<server>` prompt section, observed during successful scoped prompt assembly without changing that assembly. Each scope has its own replaceable snapshot; removed sections clear old metadata. Instructions remain discoverable through `describeNamespace` instead of being inserted into every prompt.

The bridge selects configured unconditional global MCP registrations by namespace and offers other eligible global DSH tools as opt-in conversation choices. Conditional global registrations are not imported. Resource calls must name a selected server. A disconnected or replaced MCP registration cannot be used through an old binding.

The bundle also mounts DSH's native subagent and control plugins inside the Pi preset. `scopedTools` reserves their names and bridges only this preset's native registrations, never a same-name global fallback. Public per-Agent conditional registrations retain the original definition identity, so native identity/depth context still recognizes the tools. Private aliases use the same Session selection and execution pipeline. Removing a provider removes its bindings, and Agent/plugin disposal releases the associated registrations. No scope ancestry is rewritten. The existing Host must provide `spawn` and `fork`; no second backend, profile, or model client is created. Updating this local bundle does not apply its new preset entries to an already installed profile.

Subagent creation returns `{ kind: 'activation', name }`, not the final result. Codemode may start children and return their names; it should not stay alive polling for completion. DSH delivers native completion notices and handles follow-up messages. Model-route and depth decisions remain with DSH, including its normal rejection paths.

## Session state and execution

The session log is the state authority. Successful `tool/result` metadata carries `store` writes or loaded tool names. A projection derives each session's current values; no mutable state is shared between sessions.

```text
idle -> running -> successful result committed -> projection advances
                -> failure / cancellation      -> no state change
restore / fork  -> fold the retained session log
```

Public and internal bindings both obey the Session selection. Separate internal bindings make selected deferred MCP capabilities part of the actual DSH step admission without advertising them to the model. A custom executor hides those internal names and rejects direct attempts to call them. Nested calls use the shared DSH pipeline under their original public names, retaining input validation, guards, pre/post policy, cancellation, and canonical outputs.

Scripts receive Pi's structured `read` and `bash` values. A nonzero `bash` exit remains a failed tool result but resolves to its original structured value inside scripts; inspect `exit_code`. Permission refusals, cancellation, and policy-rewritten errors are not recovered through this bridge.

Safe calls may overlap. Mutations form exclusive barriers; policy preparation and result completion preserve submission order. Script cancellation, permission-mode changes, and plugin disposal abort and drain started nested work. Pi's compact nested-call summaries remain in result metadata; individual nested outputs are not added to the model's history.

Codemode retains Pi's original parameter schema, description, and `constrainedSampling` policy. With the accompanying DSH tool-schema and pi-ai adapter support, Pi selects raw-JavaScript grammar transport where the model supports it and its ordinary JSON `{ "code": "..." }` transport otherwise. Scripts and nested arguments are preserved; there is no extra `input` parameter, source wrapper, guessed repair, or automatic replay. Raw transport removes the model-authored JSON-string layer, but scripts must still be valid JavaScript.

When codemode is selected, its string-construction guidance applies to every string argument, not just shell commands: file contents, edit text, paths, regex/glob patterns, and MCP fields have the same JavaScript boundary. It includes nested Python, literal shell expansion, and multiline heredoc examples.

- Ordinary JavaScript strings interpret backslashes. Use `String.raw` for literal backslashes when the text contains neither backticks nor `${...}`; use ordinary escapes when the conversion is intended.
- `String.raw` still evaluates `${...}`. Escaping interpolation or backticks inside it retains extra backslashes. Preserve literal delimiters using ordinary quoted strings or concatenated raw chunks, not guessed variable values.
- Literal template line endings normalize to LF, including inside `String.raw`. Preserve exact CRLF/CR with explicit escapes or existing string values.
- Pass objects/arrays directly when the schema expects them. Use `JSON.stringify` to produce JSON text from structured values. Codemode's JSON transport encodes the outer input once; `code` contains source, not an already JSON-encoded string literal. Double-encoded source can legally run without calling any tool and is not automatically reinterpreted.
- Use an already available direct tool for a single operation that does not need codemode. Direct arguments are plain JSON values without an extra JavaScript-string layer. This does not authorize enabling tools or changing permissions.

Native `SyntaxError` and `ReferenceError` results gain differentiated recovery guidance only when no nested calls were attempted or recorded and execution was not cancelled. Syntax feedback distinguishes source errors from malformed input to `JSON.parse` or `eval`; reference feedback covers undeclared names and unintended template interpolation. The original error and metadata remain intact; the model must correct the cause before submitting a new call. There is no automatic rewrite, retry, permission change, or replay of partially executed work. Other errors and successful scripts keep their original results, including valid scripts whose string semantics may not match the author's intent. This improves generation and recovery and does not guarantee that a model follows the guidance.

## Web tool cards

The Web companion matches only successful Pi 1.5.0 text results. It provides offset-aware read lines, original edit diffs, written content, codemode call summaries with durations/errors, and loaded-tool names. File navigation uses the execution-time absolute path and line recorded in result metadata. Disclosure follows DSH's turn controls; failed, pending, image-bearing and non-Pi calls retain their existing views. Cards do not promise live script progress.

This uses the additive `tool.call.presentation` chain supplied by the accompanying local DSH frontend change. A DSH build without that slot retains its ordinary cards. The root companion entry sets `presentationOnly: true`, which registers no Host tools, prompt sections, executor or session state. Actual Pi tools stay inside the `pi` preset. Styles and locale registrations leave when the companion unloads.

## Compatibility boundaries

- File access uses `ctx.fs`; publication uses DSH's atomic write with the calling session's sandbox policy. The profile must mount the sandbox-enforcing filesystem provider. DSH replaces a destination symlink instead of writing through it.
- Shell and search processes use DSH's managed subprocess service. Restricted sessions require `ctx.sandbox.confine`; failure never falls back to an unrestricted process. The environment remains DSH-owned and scrubbed.
- Omitting `bash.timeout` adds no timeout. A supplied timeout terminates the command rather than creating a background job. Pi shell settings and fictitious `PI_*` session metadata are not loaded.
- QuickJS scripts do not receive Node, filesystem, network, or timer APIs. Files and network access go through explicitly provided tools. Remote MCP permissions are independent of the local filesystem sandbox.
- Pi's worker limits and output formatting remain in force. Pi owns implementation-temporary spill files; DSH stores returned images as durable attachments with its own admission and normalization limits.
- MCP scripts receive the canonical result envelope, including protocol content and optional structured content. DSH remains authoritative for MCP transport errors and server error results.
- Codemode uses Pi's original `{ "code": "..." }` parameter schema and native sampling policy. Raw-JavaScript transport requires the accompanying DSH metadata passthrough and a pi-ai model with grammar-tool support; it is not forced onto unsupported routes. `models.*`, classifiers, image-model routing, PowerShell, arbitrary Pi extensions, and Pi's agent loop are not loaded.
- Pi's tool/rule sections replace DSH's static tool guidance. DSH still owns model routing, runtime context, project instructions, session persistence, and compaction. Pi tools do not accept DSH escalation parameters; permission denials require a human permission change.

The validated target is the local macOS DSH installation. Remote filesystem/process combinations, live provider requests, and Web tool-card rendering require separate verification.

## Installation and development

Install this directory through DSH Plugin Manager, then select **pi** for a new session. The bundle retains the preset id `pi` and entry id `preset-pi`. It does not rename the global DSH profile, select a new default preset, or modify the shipped presets. Existing sessions retain their composition revision.

This package is plain ESM with no build or installation scripts. It resolves DSH public exports from the running installation, rather than installing a second copy of the runtime. The minimum supported DSH version is `0.2.2-rc.2`. Use the repository's pnpm lockfile; do not update Pi automatically.

The icon is original artwork under this repository's MIT license. Verification uses temporary end-to-end checks and the repository's existing tests; no unit or integration test files are added.
