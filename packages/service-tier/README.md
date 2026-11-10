# dsh-service-tier

Adds a ⚡ fast-mode toggle beside the model picker in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). When it is on for a model, requests for that model are sent with `service_tier: "priority"`.

The toggle only shows up when the current model's provider uses the **OpenAI Responses API** (`api: openai-responses` in `llm-pi-ai`), because that is the only route that accepts the field.

## How it works

| Half | File | Role |
|---|---|---|
| Host | `lib/index.js` | Hooks the `llm-pi-ai/model-defaults` waterfall and adds `serviceTier: 'priority'` for fast `provider/model` pairs on Responses routes. Serves `GET /service-tier/state` and `POST /service-tier/set`. |
| Browser | `lib/client.js` | Renders the ⚡ button in `conversation.input.right` and toggles it optimistically. |

Both routes require the same authentication as the rest of the Web API. `POST /service-tier/set` accepts `{ "provider": string, "model": string, "fast": boolean }` and bodies up to 16 KiB.

A toggle applies immediately, then persists to your profile's `cordis.patch.yml` through the config editor.

## Configuration

```yaml
- id: service-tier
  config:
    # provider/model -> "priority". Managed by the ⚡ button.
    tiers:
      responses/gpt-6.1-sol: priority
```

## Notes

- Priority processing is billed differently by OpenAI and compatible gateways. Check your provider's pricing before you leave it on.
- [`dsh-model-reference`](../model-reference) reads this plugin's state to add ⚡ to `#` chips.
