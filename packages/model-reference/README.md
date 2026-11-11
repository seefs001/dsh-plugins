# dsh-model-reference

Type `#` in the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) composer to pick a model and insert it as a chip, the same way `@` inserts a file or session reference.

The chip carries the reasoning effort that model was last used with, plus fast mode when [`dsh-service-tier`](../service-tier) has it switched on. That lets you write things like *"ask #GPT-6.1 Sol · xhigh ⚡ to review this diff in a subagent"*.

Switching models in the composer picker or `/model` also restores the selected model's saved effort. Choosing Default explicitly clears that model's saved effort. Unsupported saved efforts fall back to the model's normal default.

## What the model sees

A chip serializes into the prompt as:

```text
#model(provider=responses, model=gpt-6.1-sol, reasoning_effort=xhigh, service_tier=priority)
```

Copying a chip puts `#provider/model` on the clipboard.

## Usage

| Key | Action |
|---|---|
| `#` + text | Open the picker and filter by model name, model id, provider name or provider id. Every word must match; `/` and spaces split words. |
| `↑` / `↓` | Move the highlight |
| `Enter` / `Tab` | Insert the highlighted model |
| `Esc` | Close the picker for this query |

## How it works

| Half | File | Role |
|---|---|---|
| Host | `lib/index.js` | Listens for `model/selection` events in top-level sessions, saves the effort per `provider/model` in this plugin's config, and serves it at `GET /model-reference/state`. |
| Browser | `lib/client.js` | Renders the `#` menu in `conversation.input.overlay` and registers the chip codec on the input-trigger pipeline. |

The state route requires the same authentication as the rest of the Web API.

## Configuration

```yaml
- id: model-reference
  config:
    # provider/model -> last reasoning effort. Filled in automatically.
    efforts:
      responses/gpt-6.1-sol: xhigh
```

You do not normally edit this by hand.

## Related

- [`dsh-service-tier`](../service-tier): adds the ⚡ marker to chips.
- [`dsh-recent-sessions`](../recent-sessions): sorts `@` session references newest first. This used to be part of this plugin.
