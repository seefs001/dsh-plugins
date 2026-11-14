# dsh-model-reference

Type `#` in the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) composer to pick a model and insert it as a chip, the same way `@` inserts a file or session reference.

The chip carries the reasoning effort that model was last used with, plus fast mode when [`dsh-service-tier`](../service-tier) has it switched on. You can then write a prompt such as *"ask #GPT-6.1 Sol · xhigh ⚡ to review this diff in a subagent"*.

Switching models in the composer picker or with `/model` also restores the selected model's saved effort. Choosing Default for the current model clears its saved effort. A saved effort the model no longer supports is ignored, and the model's normal default applies.

## What the model sees

A chip is serialized into the prompt as:

```text
#model(provider=responses, model=gpt-6.1-sol, reasoning_effort=xhigh, service_tier=priority)
```

This is text for the model; it does not switch the current session's model. Copying a chip puts `#provider/model` on the clipboard.

Sent messages, queued rows, and history show the same chip instead of this text. Hover the chip to see the full `#model(...)` form.

## Usage

| Key | Action |
|---|---|
| `#` + text | Open the picker and filter by model name, model ID, provider name, or provider ID. Every word must match; `/` and spaces separate words. |
| `↑` / `↓` | Move the highlight. |
| `Enter` / `Tab` | Insert the highlighted model. |
| `Esc` | Close the picker for this query. |

## How it works

| Half | File | Role |
|---|---|---|
| Host | `lib/index.js` | Listens for `model/selection` events in top-level sessions, saves the effort per `provider/model` in this plugin's config, and serves it at `GET /model-reference/state`. Subagent selections are ignored. |
| Browser | `lib/client.js` | Renders the `#` menu in `conversation.input.overlay`, registers the chip codec on the input-trigger pipeline, and restores saved efforts when the model changes. |

The state route uses the same authentication as the rest of the Web API.

## Configuration

```yaml
- id: model-reference
  config:
    # provider/model -> last reasoning effort. Filled in automatically.
    efforts:
      responses/gpt-6.1-sol: xhigh
```

The plugin maintains this map; you normally do not edit it.

## Related

- [`dsh-service-tier`](../service-tier) adds the ⚡ marker to chips.
- [`dsh-recent-sessions`](../recent-sessions) sorts `@` session references newest first.
