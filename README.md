<div align="center">

# dsh-plugins

seefs's plugin collection for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`), making it faster to pick and switch models.

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
```

You can also use the **Plugins** page in the Web GUI and paste the same spec. Installing a bundle selects it, and with `patchReload: live` it takes effect without a restart.

From a local clone:

```bash
git clone https://github.com/seefs001/dsh-plugins.git
dsh plugin --profile web add link:$PWD/dsh-plugins/packages/model-reference
```

## Configuration

Plugins that keep state (`model-reference` efforts, `service-tier` fast models) save it into your profile's `cordis.patch.yml` through dsh's config editor, so it survives restarts and upgrades. See each package's README for its keys.

## Development

```bash
pnpm install
pnpm run check   # oxlint + manifest validation + node:test
```

The plugins are plain ES modules with no build step. Layout and conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
