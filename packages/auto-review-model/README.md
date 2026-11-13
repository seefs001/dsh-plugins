# dsh-auto-review-model

Pick which model, and optionally which review prompt, Auto review (`@deepseek-ai/dsh-experimental-auto-review`) uses to judge tool calls. By default Auto review reuses the session's own model; this plugin reroutes only its review requests (`purpose: "auto-review"`) to the provider and model you choose. The main conversation is unaffected.

## Use

1. Enable `@deepseek-ai/dsh-experimental-auto-review` and install this bundle.
2. Open **Plugins → dsh-auto-review-model**. The model list is the Host's live model catalog, the same as the composer's model picker.
3. Choose a model and, optionally, a reasoning effort, then **Save**. "Same as session" restores the built-in behavior.
4. While a session's permission mode is Auto review, the composer tool row shows a **Review: <model>** chip with a count of this session's reviews (red `denied/total` when any review denied or failed). Hover it for the provider, effort, and prompt mode. The chip turns amber when the configured provider is not loaded and reviews fall back to the session model.
5. Click the chip to open this session's review log: time, tool, verdict and risk, the deny reason or failure, and on expand the reviewer model, latency, and the reviewed arguments. **Review settings** in its header opens this plugin's settings; **Clear** deletes the session's records.

## Review log

Every Auto review request carries its Session id. The Host half passes the reviewer stream through unchanged and, when it ends, appends one entry to the `auto_review_log` storage domain (one JSON document per session, `per-record` layout under `~/.dsh/storages` with the json backend). It keeps the latest 200 reviews per session and the 300 most recently reviewed sessions. Arguments are cut to 4,000 characters and reasons to 2,000. Arguments can contain sensitive values; they stay on this machine, and **Clear** removes them. The verdict shown mirrors Auto review's own parser; a review that fails before or after the reviewer answers (for example, an abort) is recorded as failed.

Click a log entry to reveal its reviewed tool call, scroll it into view, and briefly highlight it. For a PTC inner call, the jump may target the outer tool card. If the target is not in the loaded history, the UI shows a hint; it does not fetch older messages automatically.

## Config

| Field | Meaning |
|---|---|
| `provider` | Provider route id. Empty keeps the session model. |
| `model` | Model id. Must be set together with `provider`. |
| `reasoningEffort` | Effort id for that model. Empty uses the model's default. |
| `promptMode` | `default` keeps the built-in review policy; `append` adds `prompt` after it; `replace` uses `prompt` instead of it. |
| `prompt` | Your rules (append) or your complete policy (replace). |

## Review prompt

**Append** is the safer choice. Your rules follow the built-in policy under an `ADDITIONAL USER POLICY` heading, and the risk levels and output format stay as built in.

**Replace** sends your text as the reviewer's whole system prompt. Auto review still parses the answer strictly, so the prompt must make the reviewer return exactly one JSON object: `low+allow`, `medium+allow`, `medium+deny`, or `high+deny`, with an optional `reason` only on deny. Anything else fails the review and blocks the call. **Load built-in prompt** fills the text box with the policy seen on the latest Auto review request, available after Auto review has run once since the Host started.

## How it works

A prepended `llm/stream` listener matches `purpose === "auto-review"`, copies the frozen request with the configured route and system prompt, and starts a new `llm.stream()` for the copy. The copy drops `temperature`: Auto review pins it to 0, and reasoning models reject any sampling temperature. Every other `llm/stream` listener still sees the rerouted request once. If the configured provider is not loaded, the review keeps the session model and a warning is logged.

## Caveats

- The reviewer must return strict JSON (`{"risk":…,"decision":…}`). Weak models fail often, and a failed review blocks the call (`AUTO_REVIEW_FAILED`).
- Auto review is experimental; if it changes its `purpose` tag or request shape, this plugin needs an update.
