# dsh-message-edit

Edit your earlier messages in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Hover one of your messages and click the pencil icon next to Copy, change the text, then save. Editing defaults to the current session: it does not create or open a fork. Two modes are available:

| Mode | What happens |
|---|---|
| **Overwrite in this session** (default) | Rewrites the message in place in the current session's model context without switching sessions. **Clear later context** is checked by default: all later messages and tool results are removed from model context. Uncheck it to keep them. Nothing reruns, and completed actions are not undone. The original message bubble displays the saved text with an **Edited** badge, and Copy copies that text. |
| **Fork and resend** (explicit alternative) | Forks the session at the last completed turn before the message, sends the edited message there, and opens the new session. The original session is unchanged. The forked prefix is byte-identical, so provider prompt caches still hit. |

Images and files attached to the message keep their place; only the text is replaced.

## How it works

- Browser half (`lib/client.js`): replaces the `user` renderer in `conversation.chat.node`, resolving saved edits by `source.rpcId`. It passes the edited text and original attachments to the built-in `conversation.chat.user.content` factory, and owns the Copy and Edit controls. The `conversation.chat.user.before` decoration slot remains available; no DOM patching or portals are needed.
- Host half (`lib/index.js`): owner-only `POST /message-edit/op`.
  - Overwrite mode appends a `user/message` with `surfaceOp: { op: 'replace' }` covering this message through the last current surface node (or just this message when **Clear later context** is unchecked), inside `agent.runMaintenance()` so it never races a turn. This is the same core mechanism compaction and the tool-result pruner use, so sessions stay readable without the plugin.
  - Only the explicitly selected Fork mode uses the Client's `sessions.fork({ atSeq })` and then `agent.followup()` on the child.

## Limits

- Overwrite mode needs an idle agent. Stop the running turn first.
- Overwrite mode is refused once the message has been compacted or cleared from context. It never silently switches to Fork mode.
- Unchanged text can still be saved to clear later context. With clearing unchecked, unchanged text is not submitted.
- While this plugin is enabled, the bubble and Copy use the saved text, including after a page reload. Disabling it restores the built-in renderer's original text; the saved model-context edit remains in the session log.
- Clearing later context does not visually drop later messages or undo completed actions.
- Only messages you typed (source kind `user`) get the control; steering rows, injected context and scheduled prompts do not.
- Editing a message invalidates the provider prompt cache from that message onward in Overwrite mode.
