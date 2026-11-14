# dsh-message-edit

Edit your earlier messages in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Hover one of your messages and click the pencil icon next to Copy, change the text, then pick one of two modes:

| Mode | What happens |
|---|---|
| **Clear later messages** | Forks the session at the last completed turn before the message, sends the edited message there, and opens the new session. The original session is unchanged. The forked prefix is byte-identical, so provider prompt caches still hit. |
| **Keep later messages** | Rewrites the message in place in the current session's model context. Later messages stay, nothing reruns. The chat still shows the original bubble, with an **Edited in context** badge that expands to show what the model now sees. |

Images and files attached to the message keep their place; only the text is replaced.

## How it works

- Browser half (`lib/client.js`): registers in `conversation.chat.user.before`, keyed by the message's `source.rpcId`. That slot has no action row, so the icon is portalled into the bubble's own action row after Copy and reuses its button class; if that row is not found, no icon appears.
- Host half (`lib/index.js`): owner-only `POST /message-edit/op`.
  - Keep mode appends a `user/message` with `surfaceOp: { op: 'replace' }` for that one node, inside `agent.runMaintenance()` so it never races a turn. This is the same core mechanism compaction and the tool-result pruner use, so sessions stay readable without the plugin.
  - Clear mode uses the Client's `sessions.fork({ atSeq })` and then `agent.followup()` on the child.

## Limits

- Keep mode needs an idle agent. Stop the running turn first.
- Keep mode is refused once the message has been compacted.
- The DSH chat renders only appended messages, so a single session cannot visually drop later messages. That is why Clear mode branches.
- Only messages you typed (source kind `user`) get the control; steering rows, injected context and scheduled prompts do not.
- Editing a message invalidates the provider prompt cache from that message onward in Keep mode.
