# dsh-web-access

Web search tools for DSH. On the Plugins page, pick a local Responses model and a search type for each tool. The tool calls that model's hosted search and returns an answer with cited sources.

| Tool | Hosted search types | Parameters the model can pass |
|---|---|---|
| `grok_search` | `web_search`, `x_search`, or both | domains (web), X handles and dates (X) |
| `openai_search` | `web_search` | allowed domains, context size, location |

There are two tools because xAI and OpenAI hosted search take different parameters. Each tool's schema lists only the options for the search types you enabled.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/web-access"
```

## Configure

Open **Plugins → dsh-web-access**. For each tool:

- **Enabled**: turning it off removes the tool.
- **Model**: any model on an `openai-responses` provider in llm-pi-ai. The endpoint (`baseURL`), key (`apiKeyEnv`), and extra `headers` come from that provider, so you do not enter them twice.
- **Search type**: Grok can use web, X, or both. OpenAI uses web.

Saving restarts the plugin and re-registers the tools. A tool is offered to the model only while its provider route exists and its key resolves; the page shows **Ready** or the reason it is not.

When an agent is created or resumed, an available custom web search hides the built-in `web_search` before the first model step, so the tool timeline does not add it only to remove it on the next step. The plugin refreshes this restriction at each model step. Disabling every custom web search, losing their route or key, or unloading this plugin lifts the restriction, and the built-in tool is available as usual. An X-only Grok search does not replace general web search. `web_fetch` and the built-in providers are unchanged. Readiness checks do not probe whether the upstream supports search, and a tool does not fall back after an HTTP error.

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

The model receives the answer text and up to 10 sources. Sources are the answer's citations (`url_citation` annotations, response `citations`, or markdown links in the answer); raw search-call results are used only when the answer cites nothing. The Chat shows the native search row: a short Grok or OpenAI title, the query, the search channel, and the source count. Expand it to read the formatted answer and source links. Running, stopped, and failed calls keep the native status indicators. Inspect opens the original tool call.

## Optional search parameters

Only `query` is required. Every optional field can be omitted or set to `null`, including each location field, so strict Responses clients do not have to invent dates or locations. For web-only Grok searches, set X filters to `null`. For non-localized OpenAI searches, set `user_location` to `null`. An empty string does not count as `null`, and contradictory or malformed filters still return errors.

## Caveats

- Whether a gateway forwards hosted `web_search` / `x_search` depends on the gateway and the upstream account. An unsupported type returns the endpoint's HTTP error.
- `allowed_x_handles` / `excluded_x_handles` follow xAI's documented `x_search` fields; a gateway may ignore them.
- The plugin only adds search. DSH's built-in `web_fetch` keeps working alongside it.
