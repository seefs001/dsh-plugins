<div align="center">

# dsh-plugins

seefs's plugin collection for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`): model selection, session management, web search, Git diffs, and conversation companions.

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[Documentation](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

English | [中文](README.zh.md)

</div>

## Plugins

| Package | What it does | Halves |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | Type `#` in the composer to insert a model chip with that model's last reasoning effort and fast mode. | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | A ⚡ toggle beside the model picker that sends `service_tier: "priority"` for OpenAI Responses models. | Host + Web |
| [`dsh-subagent-model`](<packages/subagent-model/README.md>) | A read-only model and reasoning-effort label in subagent composers; the main agent's picker stays unchanged. | Web |
| [`dsh-remember-model`](packages/remember-model) | New sessions start on the model and reasoning effort you picked last. | Host |
| [`dsh-keep-awake`](<packages/keep-awake/README.md>) | Prevents macOS idle sleep while DSH runs; the display can still sleep and the screen can lock. Requires DSH rc.2 or newer. | Host |
| [`dsh-recent-sessions`](packages/recent-sessions) | Sessions in the `@` menu are listed by last activity, newest first. | Web |
| [`dsh-session-groups`](packages/session-groups) | Drag sessions into custom groups, reorder groups, and pin sessions within a group. | Host + Web |
| [`dsh-compaction-status`](packages/compaction-status) | A compact status and elapsed timer above the composer during automatic compaction or `/compact`. | Host + Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | Pick the Auto review model and prompt; inspect the session review log and jump to reviewed calls. Needs `@deepseek-ai/dsh-experimental-auto-review`. | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | Quotes in user messages become blocks; clicking one scrolls to the quoted text and highlights it. | Web |
| [`dsh-tool-lens`](packages/tool-lens) | Richer tool-call rows. The skill row opens the skill's `SKILL.md` in the right sidebar. | Web |
| [`dsh-web-access`](packages/web-access) | `grok_search` (web + X) and `openai_search` tools. Pick a local Responses model and search type on the Plugins page. | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | Branch and uncommitted-change counts below the composer; click to open the right-sidebar diff. Requires Change requests & worktrees. | Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | Draggable GPT / Claude companions that follow the displayed conversation's activity. | Web |

Install only what you need. Some plugins require an enabled dsh experimental bundle or a configured provider; see each package's requirements. `dsh-model-reference` and `dsh-service-tier` work well together: with both installed, `#` chips also carry ⚡.

## Requirements

- dsh `>=0.2.2-rc.1 <0.3.0`
- Node.js `^22.19.0 || >=24`
- The browser plugins need the Web GUI (`dsh web`).

## Install

Install from GitHub into a profile (here `web`). The `path:` parameter picks one package from this repository:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/service-tier"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/subagent-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/remember-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/recent-sessions"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/session-groups"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/compaction-status"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/auto-review-model"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/quote-jump"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/tool-lens"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/web-access"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/git-changes"
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/ai-mascot"
```

You can also use the **Plugins** page in the Web GUI and paste the same spec. Installing a bundle selects it, and with `patchReload: live` it takes effect without a restart.

From a local clone:

```bash
git clone https://github.com/seefs001/dsh-plugins.git
dsh plugin --profile web add link:$PWD/dsh-plugins/packages/model-reference
```

## Configuration

Plugin settings (`model-reference` efforts, `service-tier` fast models, `auto-review-model` model and prompt, and `web-access` search settings) are saved to your profile's `cordis.patch.yml` through dsh's config editor. Session groups and review logs use the Host's `session_groups` and `auto_review_log` storage domains instead. AI Mascot keeps its position, size, compact-mode and motion preferences in browser localStorage, not the profile. See each package's README for storage limits and privacy notes.

## Documentation

The [documentation site](https://seefs001.github.io/dsh-plugins/) uses Fumadocs and includes a GitHub Pages deployment workflow. It covers installation, all plugins, configuration, and development.

```bash
pnpm run docs:dev        # local preview
pnpm run docs:typecheck  # documentation types
pnpm run docs:build      # static export to apps/docs/out
```

See [apps/docs/README.md](apps/docs/README.md) for the first Pages deployment.

## Development

```bash
pnpm install
pnpm run check   # oxlint + manifest validation + node:test
```

The plugins are plain ES modules with no build step. Layout and conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Plugin code: [MIT](LICENSE). AI Mascot's referenced character artwork has separate, non-commercial usage terms and is not covered by MIT. See its [artwork and attribution notes](packages/ai-mascot/README.md#artwork-and-rights).
