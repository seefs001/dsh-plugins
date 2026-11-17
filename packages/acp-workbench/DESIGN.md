# ACP native conversation integration

## Goal and scope

The user explicitly selected BOTH modes: (1) use an ACP agent directly inside the current DSH conversation, and (2) let the DSH lead delegate to a native, continuable ACP child. The normal composer, message history, stop button, queues and subagent tree remain the entry points. The old standalone workbench becomes provider administration / diagnostic fallback, not a second chat product.

Do not build another workspace, terminal or schedule product. Preserve existing DSH features. Do not replace the application root, monkey-patch Agents, hijack the global Agent factory, write custom Session event types, or disguise external tool execution as a request for DSH to execute those tools again.

## Contract findings

- The installed `agents.setFactory()` is exclusive. Replacing the default factory would affect unrelated sessions and cannot replace already live Agents safely.
- `agent/pre-step` can admit/reject messages but cannot claim an externally completed turn: rejection ends the turn as `blocked`. It is not an alternate execution driver.
- The public `llm.registerAdapter()` plus explicit `acp-*` routes can carry a real external-agent turn through the native driver. This is a compatibility bridge, NOT a claim that ACP is a stateless LLM completion API.
- `SubagentProvider.prepareContinuable()` creates a real local DSH child using the normal driver. The official tool MUST explicitly configure `agentOptions: { provider: "acp-…", model: "default" }`: provider `agentRouteDefaults` alone does not select a route when no overrides are supplied. This retains native naming, tree discovery, follow-ups, cancellation and durable messages without a one-shot external SubagentRun facade.
- `Agent.runMaintenance()` claims an idle phase for explicit connection and CLI configuration, including before the first prompt. Composer input queues behind it; native cancel aborts it. Plugin unload cancels and awaits owned maintenance as well as active streams.
- A cold ordinary Session can be explicitly activated through the public `sessionController.resolveAgent()` owner. Read-only snapshots never activate it; the plugin does not take ownership of the global Agent factory or call a model-selection API that persists deployment defaults.
- `uiConversation.events.register()` and a new `conversation.chat.node` key can add ACP execution traces without replacing the shipped assistant renderer. `conversation.composer.dock` supplies pending interactions and child progress, not a second model selector; the shipped subagent tree retains its normal controls.
- Standard assistant text/reasoning/image blocks, cancellation and final messages are committed by DSH. Raw ACP tool/plan/permission events remain plugin-owned, referenced by the bridge's provider replay metadata. They never become DSH executable tool calls.

These contracts were checked against live Inspect and installed owning-package source, including the non-catalogued UI Conversation registration Interface.

## Modules and Interface

- `transport.js`: NDJSON RPC over an owned subprocess. Handles framing, pending requests, errors, cancellation and orderly process exit.
- `store.js`: providers, external session mappings and chunked raw ACP history. Ordered persistence, immutable stored snapshots, explicit storage failures.
- `manager.js`: one external-session operation Interface shared by administration, native bridge and scoped tools. Retains human-only interactions and config changes. Emits an observed event feed; owns live process identity and shutdown.
- `native.js`: maps one DSH Session + ACP provider to one external conversation; registers explicit ACP routes and continuable subagent providers. Translates native input and ACP output, preserves replay references and keeps ambiguous delivery from auto-retrying.
- `index.js`: owned Cordis registrations, owner-authorized HTTP/SSE and model-facing tools. Human authority checks remain at both transport and manager Interface.
- `client.js`: contributes native composer controls, live interaction/trace views and durable Chat nodes. Reuses the original composer and assistant rendering. Retains a small provider administration page.

## Native bridge state model

Subject: one native DSH request and its external conversation binding. Observable seams: the adapter's stream, manager events, native Session messages, and user operations.

| State | Event | Next | Effect / invalid handling |
| --- | --- | --- | --- |
| idle DSH Session | explicit connect / configure | connection maintenance | Claim the native maintenance phase, initialize/load or configure without a model prompt, release it on completion |
| connection maintenance | native stop / unload | disconnected | Abort and await the owned connection; do not submit a prompt |
| no binding | native ACP request | preparing | Persist mapping to exact DSH Session and provider; never share another DSH Session's remote ID |
| disconnected binding | native ACP request | preparing | Initialize and load existing remote session; unsupported load rejects, never silently starts a different conversation |
| preparing | input translated and recorded | running | Persist submitted native message boundary before external side effects; return output through native stream |
| running | tool / plan update | running | Preserve raw trace; render alongside native answer; NEVER yield a native tool-call chunk |
| running | permission / question / plan request | waiting | Persist pending human request and present it in the current conversation |
| waiting | valid human answer | running / waiting | Persist answer before resolving exactly one pending ACP request |
| running / waiting | native stop signal | canceling | Cancel the external turn, expire interactions, await prompt or process cleanup; preserve delivered native output |
| running | external completion | completed | Flush trace, persist native message boundary and replay reference, finish the native stream |
| running / preparing | transport failure | failed | Report failure without automatic retry of an external side effect |
| running | agent JSON-RPC error reply to `session/prompt` | failed run, idle binding | Record `turn-error`, expire this turn's interactions, keep the process and remote session for the next native input; no retry |
| in-flight persisted binding | Host restart | interrupted | No startup process or task; reconnect on explicit native input, never automatically resend ambiguous input |
| completed / failed / interrupted | later native message | preparing | Forward only new native input; include a clearly delimited context handoff when needed |
| any | forked DSH Session | independent binding | New remote conversation with fork context, not reuse of the parent's remote session |

Invariants:

1. At most one prompt per external connection, and the default DSH driver still owns each native turn.
2. The bridge refuses anonymous utility/model-discovery calls. A real live DSH Session and an ACP conversation route are required.
3. Provider routing explicitly says ACP. It does not claim DSH tools, guards, MCP, token accounting or sandbox govern the external CLI.
4. No automatic external-task retry. A lost response can mean an operation already happened; record uncertainty and require new user intent.
5. All user inputs visible to the native model history remain native durable messages; no fabricated Session event types.
6. Raw external tools are informational. They are not dispatched again through DSH's tools pipeline.
7. Native provider replay metadata stores only references and delivery checkpoints, not credentials. Every finished run has a `to` sequence, including runs interrupted by a Host restart, so a trace never spills into later turns. A persisted native assistant message ID also indexes the external run: canceled streams may not deliver finish/replayState, and a fork must still locate the original canceled trace without guessing from its new Session ID.
8. No permission granted by tools or by an expired/duplicate interaction. Mode/config changes remain explicit human actions.
9. Missing usage is unknown. Context-window usage is not relabeled as input token usage.
10. Unload and cancellation await owned subprocess cleanup; stale generation callbacks cannot mutate a new connection.

## External manager lifecycle

The existing manager retains disconnected → starting → idle → running ↔ waiting → idle. Cancel enters canceling and disconnects after its grace period if the provider does not finish. Transport and process failures close the owned connection. An error *reply* from a live connection is an agent decision, not a broken transport: a rejected prompt records `turn-error` and returns to idle, and a rejected mode/model/config change records `configuration-error` and returns to idle with the previous setting. `AcpConnection.stop()` only awaits quiescence; failures already reported through `fail()` are not raised again as cleanup failures. Import preserves a discovered remote ID; archive is metadata only. Host restart marks formerly live records disconnected.

Native-bound records cannot receive independent workbench prompts: the DSH composer owns their inputs. The administration page may inspect them and answer existing human interactions, but must not create a competing turn stream. Model tools get read-only access (`get`, `events`) to native-bound records; archiving or disconnecting one from a tool would otherwise break that conversation's ACP route.

## Context and capability boundaries

On a first ACP use, native conversation content can be handed off as clearly delimited historical context. Only user message IDs committed after the current `step/start` are new tasks. At dispatch, the bridge reads the open turn/step and logged route from the native Session rather than an in-memory `agent/pre-step` observation; late activation or reload must not misclassify a valid first request as a utility call. Later requests do not resend the prior ACP transcript or user tasks completed while another engine was selected. Such intervening work becomes delimited historical context. Closing connections are awaited before reopening the same binding. Native system/developer messages and tool schemas are not reinterpreted as ACP system authority; the CLI owns its own system prompt and tool set. Context limits and unsupported current attachments must be reported, not silently dropped. Current images use the attachment service; normal DSH file lowering provides a read-only host path, with resource links for unlowered file blocks. Historical attachments use textual descriptions rather than bulk retransmission. Resource text is rendered natively; unsupported binary output receives an explicit pointer to raw events.

A model route can be selected from the native picker. Provider configuration, optional model catalog discovery and ACP mode/config controls remain explicit UI operations. Authentication stays with the installed CLI. Cursor private model-catalog discovery is not implemented; the UI uses standard advertised controls. External advertised slash commands are explicit human operations that enter the ordinary native inbox, bypassing only the DSH slash parser. DSH composer slash commands are unchanged.

ACP client filesystem/terminal capabilities remain false unless fully implemented with an explicit authorization model. The external CLI can already manage its own tools. No credential files, account quota endpoints, relay setup or browser automation are implicit parts of this bridge.

## Interface surfaces

The browser half reuses DSH primitives (`Button`, `StateDot`, `DisclosureRow`, `DiffBlock`, `JsonBlock`, `PathLabel`, `Pill`, `Switch`, `Tag`, `SegmentedTabs`) and the host design tokens. One stylesheet is injected for all instances, and all surfaces share one `/acp-workbench/events` EventSource, because each EventSource holds a connection and browsers cap them per origin.

- **Model picker.** Native ACP routes list only the models explicitly checked and saved in ACP Settings, alongside `CLI default`. Discovery, connection and model-option notifications update candidate metadata without changing the selected list. Saving the model selection emits `llm/models-updated`; existing manually configured models remain selected. A concrete selection is applied before the prompt; refusal sends no prompt. `CLI default` retains the CLI’s current model. Refreshing candidates is an explicit provider-settings action that creates an empty session and sends no prompt.
- **Composer dock.** Pending interactions and ACP subagents only. No engine or model configuration, and no empty dock on a normal conversation. ACP subagents are rows with state and stop; a row with a pending interaction opens its latest trace.
- **Chat trace.** One `DisclosureRow` per external run. It is open while the run is active or waiting, and otherwise collapsed to a summary from `run.tools` and `run.files`, which the bridge counts while the turn streams. Events load only when the row is open. The timeline shows tool rows (locations, diffs, raw input/output), plans, one folded CLI-log row, interaction outcomes and errors. Reply text, handshakes and metadata updates are omitted because DSH renders the reply itself; the raw view shows everything.
- **Settings page.** Two tabs. Providers: a list and editor, where the ID of a saved provider is fixed, explicit model-catalog refresh with checkboxes and a separate save action controlling picker visibility, a capability report shown as agent, protocol, sign-in methods and capability tags, and session discovery with import. Records: search and an archived filter, then a detail view with facts, rename, connect/disconnect, stop, archive/restore, configuration, pending interactions and timeline/raw history. Native records retain new-external-context and CLI command controls here; their model choice belongs exclusively to the native picker.

## Verification

No new or modified repository test files. Validate through existing checks and isolated no-model end-to-end exercises using a deterministic ACP process and temporary storage, plus a scratch DOM render of the browser half with stubbed primitives and network. Real Cursor/Antigravity tasks and browser interaction still require separate authorization. Source review, slot registration, protocol handshake and end-to-end lifecycle checks must be reported as distinct evidence levels.
