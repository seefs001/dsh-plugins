# dsh-service-tier

Adds a ⚡ fast-mode toggle beside the model picker in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). While it is on for a model, that model's requests are sent with `service_tier: "priority"`.

The toggle appears only when the current model's provider uses the OpenAI Responses API, the only route that accepts the field: either `api: openai-responses` in `llm-pi-ai`, or a pi-ai catalog route such as `openai` that sets no `api` of its own and inherits the catalog's Responses protocol.

## How it works

| Half | File | Role |
|---|---|---|
| Host | `lib/index.js` | Adds `service_tier: "priority"` for fast `provider/model` pairs on Responses routes. DSH 0.2.2-rc.2 removed the `llm-pi-ai/model-defaults` waterfall, so the plugin wraps `streamSimple` on the prototype of the pi-ai `Models` collection that `@deepseek-ai/dsh-llm-pi-ai` uses and sets the field through `onPayload` (`lib/pi-ai-hook.js`). This depends on DSH internals; if the layout changes, the Host log shows `service-tier: priority requests are unavailable`. The rc.1 waterfall is still handled. Serves `GET /service-tier/state` and `POST /service-tier/set`. |
| Browser | `lib/client.js` | Renders the ⚡ button in `conversation.input.right` and updates it optimistically. |

Both routes use the same authentication as the rest of the Web API. `POST /service-tier/set` accepts `{ "provider": string, "model": string, "fast": boolean }` with a body of up to 16 KiB.

A toggle applies immediately and is then saved to the profile's `cordis.patch.yml` through the config editor.

## Configuration

```yaml
- id: service-tier
  config:
    # provider/model -> "priority". Managed by the ⚡ button.
    tiers:
      responses/gpt-6.1-sol: priority
```

## Notes

- OpenAI and compatible gateways bill priority processing differently. Check your provider's pricing before leaving it on.
- [`dsh-model-reference`](../model-reference) reads this plugin's state to add ⚡ to `#` chips.
