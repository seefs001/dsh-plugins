# dsh-remember-model

Makes [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) start new sessions on the model and reasoning effort you picked most recently.

## How it works

Host only (`lib/index.js`), no browser half and no configuration.

1. When a top-level session records a `model/selection` event, the plugin saves that selection through `agentDefaultModel.saveSelection()`. Subagent sessions are skipped because they pick their own models.
2. Browsers cache the model catalog, which carries the default, and only reload it on a few events. So 400 ms after each save the plugin emits `llm/models-updated`, and every connected browser reloads the catalog. Without this, the selector in a new session would keep showing the old default.

The saved default is the normal `agent-default-model` config, so you can still change it by hand.
