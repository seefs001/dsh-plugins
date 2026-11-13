# dsh-remember-model

New [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) sessions start on the model and reasoning effort you picked most recently.

## How it works

The plugin is Host only (`lib/index.js`), with no browser half and no configuration.

1. When a top-level session records a `model/selection` event, the plugin saves that selection through `agentDefaultModel.saveSelection()`, unless it already is the default. Subagent sessions are skipped because they pick their own models.
2. Browsers cache the model catalog, which carries the default, and reload it only on a few events. So 400 ms after each selection the plugin emits `llm/models-updated`, and connected browsers reload the catalog. Without this, a new session's selector would keep showing the old default.

The saved default is the normal `agent-default-model` config, so you can still change it by hand.
