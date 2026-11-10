<div align="center">

# dsh-plugins

seefs's plugin collection for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`): faster model picking and switching, plus a few Web UI improvements.

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

English | [中文](README.zh.md)

</div>

## Plugins

| Package | What it does | Halves |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | Type `#` in the composer to insert a model chip with that model's last reasoning effort and fast mode. | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | A ⚡ toggle beside the model picker that sends `service_tier: "priority"` for OpenAI Responses models. | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | New sessions start on the model and reasoning effort you picked last. | Host |
| [`dsh-recent-sessions`](packages/recent-sessions) | Sessions in the `@` menu are listed by last activity, newest first. | Web |
| [`dsh-session-groups`](packages/session-groups) | Custom session groups in a sidebar panel, with pinned sessions leading each group. | Host + Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | Pick the model and review prompt that Auto review uses to judge tool calls. Needs `@deepseek-ai/dsh-experimental-auto-review`. | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | Quotes in user messages become blocks; clicking one scrolls to the quoted text and highlights it. | Web |
| [`dsh-tool-lens`](packages/tool-lens) | Richer tool-call rows. The skill row opens the skill's `SKILL.md` in the right sidebar. | Web |

Each plugin works on its own. `dsh-model-reference` and `dsh-service-tier` work well together: with both installed, `#` chips also carry ⚡.

## Requirements

- dsh `>=0.2.2-rc.1 <0.3.0`
- Node.js `^22.19.0 || >=24`
- The browser plugins need the Web GUI (`dsh web`).

## Install

Install from GitHub into a profile (here `web`). The `path:` parameter picks one package from this repository:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/service-tier"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/remember-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/recent-sessions"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/session-groups"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/auto-review-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/quote-jump"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/tool-lens"
```

You can also use the **Plugins** page in the Web GUI and paste the same spec. Installing a bundle selects it, and with `patchReload: live` it takes effect without a restart.

From a local clone:

```bash
git clone https://github.com/seefs001/dsh-plugins.git
dsh plugin --profile web add link:$PWD/dsh-plugins/packages/model-reference
```

## Configuration

Plugins that keep state (`model-reference` efforts, `service-tier` fast models, `session-groups` groups, `auto-review-model` model and prompt) save it into your profile's `cordis.patch.yml` through dsh's config editor, so it survives restarts and upgrades. See each package's README for its keys.

## Development

```bash
pnpm install
pnpm run check   # oxlint + manifest validation + node:test
```

The plugins are plain ES modules with no build step. Layout and conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
