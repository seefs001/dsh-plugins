# dsh-message-edit

Edit your earlier messages in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Hover one of your messages and click the pencil icon next to Copy, change the text, then save. Editing defaults to the current session: it does not create or open a fork. Two modes are available:

| Mode | What happens |
|---|---|
| **Overwrite in this session** (default) | Rewrites the message in place in the current session's model context without switching sessions. Later messages stay, nothing reruns. The chat keeps the original bubble and shows an **Edited in context** badge with an expanded preview of what the model now sees. |
| **Fork and resend** (explicit alternative) | Forks the session at the last completed turn before the message, sends the edited message there, and opens the new session. The original session is unchanged. The forked prefix is byte-identical, so provider prompt caches still hit. |

Images and files attached to the message keep their place; only the text is replaced.

## How it works

- Browser half (`lib/client.js`): registers in `conversation.chat.user.before`, keyed by the message's `source.rpcId`. That slot has no action row, so the icon is portalled into the bubble's own action row after Copy and reuses its button class; if that row is not found, no icon appears.
- Host half (`lib/index.js`): owner-only `POST /message-edit/op`.
  - Overwrite mode appends a `user/message` with `surfaceOp: { op: 'replace' }` for that one node, inside `agent.runMaintenance()` so it never races a turn. This is the same core mechanism compaction and the tool-result pruner use, so sessions stay readable without the plugin.
  - Only the explicitly selected Fork mode uses the Client's `sessions.fork({ atSeq })` and then `agent.followup()` on the child.

## Limits

- Overwrite mode needs an idle agent. Stop the running turn first.
- Overwrite mode is refused once the message has been compacted. It never silently switches to Fork mode.
- The DSH chat renders only appended messages. Overwrite changes model context, not the original bubble, and does not visually drop later messages. Use the expanded edit preview to see the saved text.
- Only messages you typed (source kind `user`) get the control; steering rows, injected context and scheduled prompts do not.
- Editing a message invalidates the provider prompt cache from that message onward in Overwrite mode.
