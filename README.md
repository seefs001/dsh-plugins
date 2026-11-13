<div align="center">

# dsh-plugins

Plugins for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH), maintained by seefs. Each one is a separate bundle for model selection, session management, conversation reading, or new tools.

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[Documentation](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

English | [中文](README.zh.md)

</div>

## Plugins

The minimum DSH version is rc.1 unless the table says rc.2. "Runs in" tells you whether the plugin has a Host half, a browser half, or both.

### Models and review

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | Type `#` in the composer to insert a model chip that carries that model's last reasoning effort and fast mode. | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | A ⚡ toggle beside the model picker sends `service_tier: "priority"` for OpenAI Responses models. | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | New sessions start on the model and reasoning effort you picked last. | Host |
| [`dsh-subagent-model`](packages/subagent-model) | Shows a subagent's recorded model and reasoning effort in its composer. Read-only; the main agent's picker is unchanged. | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | Choose the model and prompt that Auto review uses, and read each session's review log. Needs `@deepseek-ai/dsh-experimental-auto-review`. | Host + Web |

### Sessions and workspaces

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | Sorts sessions in the `@` menu by last activity. | Web |
| [`dsh-session-groups`](packages/session-groups) | Custom session groups with per-group pins, shared by every browser and the agent. | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | Removes saved workspace entries and cleans up ones whose directory is gone. Files and sessions stay. rc.2. | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | Switches to an existing local branch from the New Session screen before the first message. rc.2; needs Change requests & worktrees. | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | Branch and uncommitted-change counts below the composer; click to open the diff. Needs Change requests & worktrees. | Web |
| [`dsh-keep-awake`](packages/keep-awake) | Prevents macOS idle sleep while the Host runs. The display can still sleep and the screen can still lock. rc.2. | Host |

### Reading conversations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-compaction-status`](packages/compaction-status) | A one-line status and elapsed timer above the composer during context compaction. | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | Quotes in your messages become blocks that scroll to the quoted text and highlight it. | Web |
| [`dsh-tool-lens`](packages/tool-lens) | Tool-call rows that open the skill file, full output, result files, or the subagent's conversation. | Web |
| [`dsh-message-actions`](packages/message-actions) | **Wait, what?** beside each reply explains it in an isolated model call that never enters the conversation. rc.2. | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | Draggable GPT / Claude companions that follow the displayed conversation. The artwork has separate non-commercial terms. | Web |

### Tools and integrations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-web-access`](packages/web-access) | Adds `grok_search` (web and X) and `openai_search`, using hosted search on an existing Responses provider. | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | An isolated `pi` preset with Pi 1.5.0's original coding tools, QuickJS codemode, and per-session DSH and MCP tool selection. rc.2 with the preset-options changes; see its README. | Host + Web |
| [`dsh-switchboard`](packages/switchboard) | Connects DSH to a Switchboard relay so Telegram, Discord, and GitHub requests run in DSH sessions. | Host |

Install only what you need. With both `dsh-model-reference` and `dsh-service-tier` installed, `#` chips also carry ⚡.

## Requirements

- DSH `>=0.2.2-rc.1 <0.3.0`. Packages marked rc.2 above require `>=0.2.2-rc.2`.
- Node.js `^22.19.0 || >=24`.
- Plugins with a Web half need the Web GUI (`dsh web`).

## Install

Install one package from GitHub into a profile, here `web`. The `path:` parameter selects the package:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

Replace `model-reference` with any directory name from the tables. You can also paste the same `github:` spec into the **Plugins** page of the Web GUI.

After installation, Plugin Manager selects the bundle. If the profile has HMR enabled, the change applies right away and the result says `applied`. If it says `restart-required`, restart DSH for that profile. Browser halves load after a page refresh.

To install from a local clone instead:

```bash
git clone https://github.com/seefs001/dsh-plugins.git
cd dsh-plugins
dsh plugin --profile web add link:$PWD/packages/model-reference
```

## Configuration

Most settings are made in the GUI and saved to the profile's `cordis.patch.yml` through DSH's config editor. This covers `model-reference` efforts, `service-tier` fast models, the `auto-review-model` model and prompt, the `message-actions` explanation model, and `web-access` search settings. Switchboard has no settings page; edit its row in `cordis.patch.yml`.

Session groups, review logs, reply explanations, and Switchboard's connector state live in Host storage domains (`session_groups`, `auto_review_log`, `message_actions`, `switchboard_connector`). Pi tool selections are written to the session log. AI Mascot keeps its position and display preferences in browser localStorage. Each package README lists its storage limits and privacy notes.

## Documentation

The [documentation site](https://seefs001.github.io/dsh-plugins/) is in Chinese. It covers installation, configuration and data, version requirements and boundaries, and a page per plugin. It is built with Fumadocs and deployed to GitHub Pages.

```bash
pnpm run docs:dev        # local preview
pnpm run docs:typecheck  # documentation types
pnpm run docs:build      # static export to apps/docs/out
```

[apps/docs/README.md](apps/docs/README.md) explains the Pages setup.

## Development

```bash
pnpm install
pnpm run check   # oxlint + manifest validation + node:test
```

Most plugins are plain ES modules with no build step. [CONTRIBUTING.md](CONTRIBUTING.md) lists the layout, the exceptions, and the release steps.

## License

Plugin code is [MIT](LICENSE). AI Mascot references character artwork that has separate, non-commercial terms and is not covered by MIT. See its [artwork and rights notes](packages/ai-mascot/README.md#artwork-and-rights).
