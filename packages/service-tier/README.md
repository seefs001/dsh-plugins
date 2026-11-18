# dsh-service-tier

Use ⚡ beside the model picker in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) to set a model’s service tier. For `gpt-6.2-sol`, `gpt-6.2-astra`, `gpt-6.1-sol`, and `gpt-6-astra`, choose **Default speed**, **Fast** (`priority`), or **Ultrafast** (`ultrafast`). Default shows an outline bolt, Fast shows one filled bolt, and Ultrafast shows two. Default removes the override and leaves the provider in control. For other models, clicking ⚡ directly toggles Fast. Existing Fast selections stay on `priority`.

The control appears only when the current model's provider uses the OpenAI Responses API: either `api: openai-responses` in `llm-pi-ai`, or a pi-ai catalog route such as `openai` that sets no `api` of its own and inherits the catalog's Responses protocol.

## How it works

| Half | File | Role |
|---|---|---|
| Host | `lib/index.js` | Adds the selected `service_tier` for `provider/model` pairs on Responses routes. The plugin wraps `streamSimple` on the prototype of the pi-ai `Models` collection that `@deepseek-ai/dsh-llm-pi-ai` uses and sets the field through `onPayload` (`lib/pi-ai-hook.js`). This depends on DSH internals; if the layout changes, the Host log shows `service-tier: service tier overrides are unavailable`. Serves `GET /service-tier/state` and `POST /service-tier/set`. |
| Browser | `lib/client.js` | Renders the service tier control in `conversation.input.right` and shows whether the change was saved. |

Both routes use the same authentication as the rest of the Web API. `GET /service-tier/state` includes the `ultrafastModels` list. `POST /service-tier/set` accepts `provider`, `model`, and `tier` (`"priority"`, `"ultrafast"`, or `null` to clear), up to 16 KiB. The original `fast: true` / `false` form still sets priority or clears the override.

The control waits for the config editor to save the change to the profile's `cordis.patch.yml`. If saving fails, the control keeps its previous state and shows the error.

## Configuration

```yaml
- id: service-tier
  config:
    # Default speed has no entry.
    tiers:
      responses/gpt-6.1-sol: priority
      responses/gpt-6.2-sol: ultrafast
```

## Notes

- [Ultrafast](https://developers.openai.com/api/docs/guides/ultrafast-mode) has separate pricing and rate limits. The model list does not guarantee access through your account or gateway.
- [`dsh-model-reference`](../model-reference) reads this plugin's state to add ⚡ to `#` chips.
