# dsh-web-access

Web search tools for DSH. Pick a local Responses model and a search type on the Plugins page; the tool calls that model's hosted search and returns a cited answer.

| Tool | Hosted search types | Parameters the model can pass |
|---|---|---|
| `grok_search` | `web_search`, `x_search`, or both | domains (web), X handles and dates (X) |
| `openai_search` | `web_search` | allowed domains, context size, location |

The two tools exist because xAI and OpenAI hosted search take different parameters. Each tool's schema lists only the options of the search types you enabled.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/web-access"
```

## Configure

Open **Plugins → dsh-web-access**. For each tool:

- **Enabled**: off removes the tool.
- **Model**: any model on an `openai-responses` provider in llm-pi-ai. The endpoint (`baseURL`), key (`apiKeyEnv`), and extra `headers` come from that provider, so you do not enter them twice.
- **Search type**: Grok can use web, X, or both. OpenAI uses web.

Save restarts the plugin and re-registers the tools. A tool is offered to the model only while its provider route exists and its key resolves; the page shows **Ready** or the reason.

At each model step, an available custom web search hides the built-in `web_search` for that agent. Disabling all custom web searches, losing their route/key, or unloading this plugin lifts the restriction and restores the built-in tool's normal availability. X-only Grok search does not replace general web search. `web_fetch` and the built-in providers stay unchanged. Readiness checks do not probe upstream search support or automatically fall back after an HTTP error.

The same settings in `cordis.patch.yml`:

```yaml
- id: web-access
  config:
    timeoutMs: 120000
    grok:
      enabled: true
      provider: responses
      model: grok-4.7-build-fast
      tools: [web_search, x_search]
    openai:
      enabled: true
      provider: responses
      model: gpt-6.1-sol
      tools: [web_search]
```

## Result

The model receives the answer text plus up to 10 sources. Sources are the answer's citations (`url_citation` annotations, response `citations`, or markdown links in the answer); raw search-call results are used only when nothing was cited. The Chat uses the native search row: a compact Grok/OpenAI title, query, search channel, and source count. Expand it to read the formatted answer and source links. Running, stopped, and failed calls retain the native status indicators. Inspect still opens the original tool call, not the display adapter.

## Optional search parameters

Only `query` is required. All optional fields accept `null` as well as omission, including individual location fields. This supports strict Responses clients without filler dates or invented locations. For web-only Grok searches, set X filters to `null`. For non-localized OpenAI searches, set `user_location` to `null`. Empty strings are not substitutes for `null`; contradictory or malformed filters still return errors.

## Caveats

- Whether a gateway forwards hosted `web_search` / `x_search` depends on the gateway and the upstream account. An unsupported type comes back as the endpoint's HTTP error.
- `allowed_x_handles` / `excluded_x_handles` follow xAI's documented `x_search` fields; a gateway may ignore them.
- The plugin only adds search. DSH's built-in `web_fetch` keeps working alongside it.
