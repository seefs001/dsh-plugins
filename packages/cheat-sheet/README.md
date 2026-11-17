# dsh-cheat-sheet

A searchable reference for the skills you can invoke yourself in the current DSH session, with persistent pins and default usage-frequency ordering.

## Use

1. Click **Skill cheat sheet** (**技能速查**) beside the composer.
2. The wider list shows a short Chinese description of each known skill's operation. Search names, Chinese summaries, author descriptions, or use cases. Select a skill to read its complete author-provided description and **When to use** guidance in the details pane. On narrow screens, details appear below the list.
3. Pin frequently needed skills. Pinned skills appear first; each group defaults to highest usage count first, with name order breaking ties. Unpinning keeps the skill in the catalog.
4. Click **Insert /name** to write the command and a trailing space at the start of the input, then add your request. Existing text, reference chips, and attachments are kept. A successful insertion closes the sheet; it never submits a message or runs the skill.

By default, only **Manual only** skills are shown: these require explicit `/name` invocation and cannot be loaded by the Agent (`modelInvocable: false`). Turn on **Include skills the Agent can also invoke** to see the remaining user-invocable skills. Those hidden skills still support manual invocation; this filter does not change permissions. It also applies to pinned skills. The switch resets to off whenever you reopen the sheet, but refresh preserves your current choice. An empty manual-only list offers a button to show the other skills. Model-only skills remain excluded by DSH's native `skills/list` Remote.

The catalog follows the session's workspace and agent preset, rather than scanning a fixed skills directory. It is fetched each time you open the sheet; **Refresh** reads it again while open. No catalog, search, or visibility-switch state is persisted. Pins and counts are saved on the Host, shared across sessions and browsers by skill name. Only skills available to the current session are displayed; a pin never grants access to a skill.

### What counts as use

The Host counts successful native `/name` skill loads and successful native `skill` tool calls, including nested codemode calls. Counts start when this version is enabled. Existing session history is not scanned or backfilled. Agent-initiated loads count too; inserting commands, searching, refreshing, failed calls, and ordinary prose mentioning a skill do not.

Counts persist across plugin reloads and Host restarts. The sheet rereads them on opening or **Refresh**, not through polling. Counts describe observed, saved loads, not complete historical usage or unique tasks.

### Agent tool

The `cheat_sheet` tool exposes the same state and pin operation as the UI:

- `{ "action": "state" }` reads `{ pinned, counts }`.
- `{ "action": "pin", "name": "dsh-doc", "pinned": true }` pins a skill; use `false` to unpin.

The tool cannot edit counts or run skills. As with other plugin tools, a preset's tool policy may need to allow `cheat_sheet` before an agent can use it.

## Install

In the Web GUI, open **Plugins → Add plugin** and choose this package directory, or install a published GitHub revision:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/cheat-sheet"
```

From a local clone, run at the repository root:

```bash
dsh plugin --profile web add link:$PWD/packages/cheat-sheet
```

Follow Plugin Manager's `applied` / `restart-required` result. Refresh the Web page to load the browser half.

## Implementation and limits

- Requires DSH 0.2.2-rc.3 or later in the 0.2.x line, with the Web composer and native `remote.skills` capability.
- The Host uses `storageDomain`, `webServer`, `connection`, and `tools`, and reads the separate user-owned Chinese-summary JSON. The `cheat_sheet` storage domain holds only pin names and aggregate counts, not descriptions, skill bodies, or session messages. The Web half contributes a `conversation.input.left` entry without replacing the native slash menu.
- Uses the existing session-addressed `skills/list` Remote. Browsing and pinning do not load skill bodies, call a model, change skills or configuration, or add conversation context. Counter observers read only the skill name from native committed invocation events and successful tool outcomes.
- Chinese operation summaries come from the Host user's `~/.agents/skills/short-descriptions.zh.json`, a flat object mapping skill names to one-sentence strings. The requested Claude model prepared 114 entries for this local installation; this user-owned JSON is not bundled with the plugin. The Host rereads it on opening, refresh, and confirmed pin operations, so later text edits need no code rebuild or restart. Missing or invalid JSON shows a notice and falls back to author descriptions without disabling pins or counts. Unknown skill names show labeled author text; update the JSON when adding or replacing a skill. Details always retain the original author description and use cases. Search matches both the Chinese summaries and original text. No runtime translation or model call is made.
- A refresh replaces the list; skills changed elsewhere while the sheet is open appear on the next refresh or reopening.
- Slash names shared with Host commands follow DSH's native command precedence. The cheat sheet does not change invocation routing.
- Only appears with a session composer. The catalog is session-scoped; pins and same-name counts are Host-wide across sessions using the same plugin instance. Different definitions with the same name share a count and pin. Disabled periods and earlier history are not counted.
- Uses a native modal dialog for focus containment. Escape clears a nonempty focused search first, then dismisses the dialog. Arrow keys navigate skill rows; Enter in search inserts the selected command. Insertion uses the session's native `inputActions.captureInsertion()` and a revision-guarded `insertText()` at the start of the draft, never `setDraft()` or `submit()`. A changed or submission-locked draft refuses insertion; the sheet stays open with an error so you can retry.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the caller-first view contract, ownership boundaries, alternatives, and synthesis rationale. The Client's private `buildSkillView` joins skill metadata with the shared snapshot and owns filtering, search, ordering, groups, and empty states; renderers consume complete rows instead of querying Host dictionaries.

## Verification

This update is checked locally for JavaScript syntax, lint, bundle metadata and packaging, alongside the repository's existing tests. Live pin persistence, counter updates, rendered appearance, keyboard interaction, composer insertion, and the catalog flow require verification in a running DSH. Updating an already loaded Host module may require restarting DSH; browser refresh alone does not activate the counter backend.
