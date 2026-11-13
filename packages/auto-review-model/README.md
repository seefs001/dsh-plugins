# dsh-auto-review-model

Choose which model, and optionally which review prompt, Auto review (`@deepseek-ai/dsh-experimental-auto-review`) uses to judge tool calls. By default Auto review uses the session's own model. This plugin reroutes only the review requests (`purpose: "auto-review"`) to the provider and model you choose, and the main conversation is unaffected.

## Use

1. Enable `@deepseek-ai/dsh-experimental-auto-review` and install this bundle.
2. Open **Plugins → dsh-auto-review-model**. The model list is the Host's live model catalog, the same one the composer's model picker uses.
3. Choose a model and, optionally, a reasoning effort, then click **Save**. **Same as session** restores the built-in behavior.
4. While a session's permission mode is Auto review, the composer tool row shows a **Review: <model>** chip with the number of reviews in this session. When any review denied or failed, the count turns red and reads `denied/total`. Hover the chip for the provider, effort, and prompt mode. The chip turns amber when the configured provider is not loaded and reviews fall back to the session model.
5. Click the chip to open the session's review log. Each entry shows the time, tool, verdict and risk, and the deny reason or failure; expand it for the reviewer model, latency, and reviewed arguments. **Review settings** in the header opens this plugin's settings, and **Clear** deletes the session's records.

## Review log

Every Auto review request carries its session ID. The Host half passes the reviewer stream through unchanged, and when the stream ends it appends one entry to the `auto_review_log` storage domain. With the JSON backend the domain uses a `per-record` layout under `~/.dsh/storages`, one document per session. The log keeps the latest 200 reviews per session and the 300 most recently reviewed sessions. Arguments are cut to 4,000 characters and reasons to 2,000. Arguments can contain sensitive values; they stay on this machine, and **Clear** removes them.

The verdict follows Auto review's own parser. A review that fails before or after the reviewer answers, for example because it was aborted, is recorded as failed.

Click a log entry to scroll its tool call into view and briefly highlight it. For an inner PTC call, the jump may land on the outer tool card. If the call is not in the loaded history, the UI says so; it does not fetch older messages automatically.

## Config

| Field | Meaning |
|---|---|
| `provider` | Provider route ID. Empty keeps the session model. |
| `model` | Model ID. Set it together with `provider`. |
| `reasoningEffort` | Effort ID for that model. Empty uses the model's default. |
| `promptMode` | `default` keeps the built-in review policy; `append` adds `prompt` after it; `replace` uses `prompt` in its place. |
| `prompt` | Your extra rules for `append`, or your complete policy for `replace`. |

## Review prompt

**Append** is the safer choice. Your rules follow the built-in policy under an `ADDITIONAL USER POLICY` heading, and the built-in risk levels and output format stay in force.

**Replace** sends your text as the reviewer's whole system prompt. Auto review still parses the answer strictly, so the prompt must make the reviewer return exactly one JSON object: `low+allow`, `medium+allow`, `medium+deny`, or `high+deny`, with an optional `reason` only on deny. Any other answer fails the review and blocks the call. **Load built-in prompt** fills the text box with the policy from the latest Auto review request, which exists only after Auto review has run once since the Host started.

## How it works

A prepended `llm/stream` listener matches `purpose === "auto-review"`, copies the frozen request with the configured route and system prompt, and starts a new `llm.stream()` for the copy. The copy drops `temperature`: Auto review pins it to 0, and reasoning models reject a sampling temperature. Every other `llm/stream` listener still sees the rerouted request once. If the configured provider is not loaded, the review keeps the session model and the Host logs a warning.

## Caveats

- The reviewer must return strict JSON (`{"risk":…,"decision":…}`). Weak models fail often, and a failed review blocks the call (`AUTO_REVIEW_FAILED`).
- Auto review is experimental. If it changes its `purpose` tag or request shape, this plugin needs an update.
