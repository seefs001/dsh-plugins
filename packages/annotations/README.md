# dsh-annotations

Annotate Git changes, AI replies, and your own messages in DeepSeek Harness (DSH). Pending annotations live in a compact tray above the composer and are injected automatically into the next turn via `agent/pre-step` as a collapsible `ContextInjectionRow`, keeping user bubbles clean.

## Features

- **Unified text selection bar**: extends the native chat selection floating bar with side-by-side **Quote text | Annotate** actions (plus `Cmd/Ctrl+Shift+A`), distinguishing AI replies from your own messages and anchoring excerpts with surrounding context.
- **Git diff integration**: adds an **Annotate** action to Forge diff line comments (`forge.diff.comment.actions`), file-level annotation via `forge.changes.file.menu`, and inline annotation cards via `forgeChanges.registerAnnotations` + `forge.diff.line.annotation`.
- **Composer dock tray**: shows pending annotations (`A1`, `A2`, ...) above the input box with per-item enable/disable toggles, click-to-jump with CSS Custom Highlight API, edit, re-queue from sent history, clear, and one-click send.
- **Implicit `agent/pre-step` injection**: serializes enabled draft annotations into a structured `<user-annotations>` block on step 1 of the next user turn, and marks them consumed only after the injected `user/message` lands in `session/event`.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/annotations"
```

## Storage

Stored per session in DSH `storageDomain` (`annotations`), bounded to 120 sessions and 80 annotations per session with runtime pruning.
