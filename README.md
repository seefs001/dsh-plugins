<div align="center">

# dsh-plugins

seefs's personal plugin collection for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH). 32 standalone bundles for model selection, session organization, conversation reading, and tool integrations, kept current with the latest DSH.

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[Documentation (中文)](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

English | [中文](README.zh.md)

</div>

## Overview

Each plugin lives in `packages/<name>` as an independent bundle that you can install, enable, disable, or remove on its own.

- **Requirements**: Latest DSH and this repository's `main` branch (no backward compatibility is kept for older DSH releases). Plugins with a `Web` half require `dsh web`.
- **Runs in**: `Host` runs in the DSH service process; `Web` runs in the browser UI; `Host + Web` spans both.

## Plugin Catalog

### Models and review

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | Type `#` in the composer to insert a model chip carrying that model's last reasoning effort and fast mode. | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | Switch `priority` (Fast) or `ultrafast` service tiers for OpenAI Responses requests. | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | Remembers the model and reasoning effort picked in top-level sessions and updates new-session defaults. | Host |
| [`dsh-title-model`](packages/title-model) | Pick a separate model for session titles without changing the conversation model or title strategy. | Host + Web |
| [`dsh-subagent-model`](packages/subagent-model) | Displays a subagent's recorded model and reasoning effort in its composer (read-only). | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | Route Auto review to a custom model and prompt, and inspect per-session review logs. Requires `@deepseek-ai/dsh-experimental-auto-review`. | Host + Web |
| [`dsh-roles`](packages/roles) | Manage roles (system prompt + inline skills + local skill references) in the sidebar and switch them per session. | Host + Web |

### Sessions and workspaces

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | Sorts sessions in the `@` reference menu by recent activity, newest first. | Web |
| [`dsh-inbox`](packages/inbox) | Cross-session inbox counting only conversations waiting on you, rolling subagents under their root, with optional extractive summaries. | Host + Web |
| [`dsh-session-groups`](packages/session-groups) | Custom sidebar session groups and per-group pins, synced across browsers and agents via the Host. | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | Inspect saved workspace directories and remove stale entries without touching files or sessions on disk. | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | Switch to an existing local Git branch from the New Session page before the first message. Requires Forge worktrees. | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | Shows current branch and uncommitted line/file stats below the composer; click to open the local diff. Requires Forge worktrees. | Web |
| [`dsh-keep-awake`](packages/keep-awake) | Prevents macOS idle sleep while the DSH Host runs, leaving display sleep and screen lock intact. | Host |

### Reading conversations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-compaction-status`](packages/compaction-status) | Shows context compaction status and elapsed timer above the composer. | Host + Web |
| [`dsh-diagram-preview`](packages/diagram-preview) | Preview Mermaid, Graphviz, ECharts and SVG in chat, or switch back to the original code. | Web |
| [`dsh-quote-jump`](packages/quote-jump) | Renders quotes in user messages as clickable blocks that jump back to and highlight the source. | Web |
| [`dsh-tool-lens`](packages/tool-lens) | Adds quick actions on tool-call rows to open skill files, full spill outputs, search hits, web links, or subagent chats. | Web |
| [`dsh-message-actions`](packages/message-actions) | Adds **Wait, what?** beside replies to explain them in an isolated model call without touching the conversation. | Host + Web |
| [`dsh-message-edit`](packages/message-edit) | Hover your own messages to edit in place (clearing later context by default, or keeping it) or fork and resend. | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | Draggable GPT / Claude companions reacting to the active conversation. Artwork has separate non-commercial terms. | Web |
| [`dsh-acp-workbench`](packages/acp-workbench) | Run Cursor, Antigravity, Claude Code, or other local ACP CLIs inside DSH conversations or as continuable subagents, with project workflows, traces, and approvals. External CLIs run outside the DSH sandbox. | Host + Web |

### Tools and integrations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-prompt-shortcut`](packages/prompt-shortcut) | Save personal text snippets in this browser, search, and insert at cursor without sending. | Web |
| [`dsh-cheat-sheet`](packages/cheat-sheet) | Search session skills, pin favorites, sort by observed real usage, and insert `/commands` into the composer. | Host + Web |
| [`dsh-web-access`](packages/web-access) | Adds `grok_search` (web + X) and `openai_search` backed by existing Responses providers. | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | Adds `openai_image` and `grok_image` backed by existing Responses providers, saving images to disk and attachments. | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | Isolated `pi` preset with Pi coding tools, QuickJS `codemode`, per-session tool selection, saved defaults, and MCP refresh. | Host + Web |
| [`dsh-work-timeline`](packages/work-timeline) | Session work plan, revision history, and artifact panel (replaces TODO in `pi`; tools exported from `dsh-work-timeline/tools`). | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | Shares Pi's `~/.pi/agent/mcp.json` with DSH and hot-reloads file changes. | Host |
| [`dsh-orbit-bridge`](packages/orbit-bridge) | Read-only watch over Orbit projects tracking new, changed, and missing tasks against the previous check. Never writes to Orbit. | Host + Web |
| [`dsh-paseo-hub`](packages/paseo-hub) | Enroll DSH Host as a Paseo Hub daemon to run Hub triggers locally, plus an organization API console and tools. | Host + Web |
| [`dsh-bark-notify`](packages/bark-notify) | Send Bark push notifications when an agent asks a question, submits a plan, or requests tool approval. | Host + Web |

## Install

Install a single package from GitHub into a profile (here `web`):

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

Replace `model-reference` with any directory name from the tables above, or paste the `github:` spec into the **Plugins** page in DSH Web.

To install from a local clone instead:

```bash
git clone https://github.com/seefs001/dsh-plugins.git
cd dsh-plugins
dsh plugin --profile web add "link:$PWD/packages/model-reference"
```

If Plugin Manager reports `applied`, Host changes are live immediately; if it reports `restart-required`, restart DSH for that profile. Browser halves load on page refresh.

## Configuration and Storage

- **Profile config (`cordis.patch.yml`)**: `model-reference` efforts, `service-tier` tiers, `auto-review-model` route & prompt, `message-actions` route, `web-access`, `image-gen`, and `bark-notify` non-secret settings (written via DSH `configEditor`).
- **Host storage domains (`~/.dsh/storages`)**: `session_groups`, `roles`, `cheat_sheet`, `auto_review_log`, `message_actions`, `dsh_inbox_summary`, `pi_tools_defaults`, `orbit_bridge`, `paseo_hub`, and `acp_workbench`.
- **DSH credentials**: `bark-notify/device` and `paseo-hub/{daemon,api}` (never written to `cordis.patch.yml`).
- **Session log & browser `localStorage`**: `pi-tools` selection & `work-timeline` snapshots travel in the session log; `inbox` read marks, `prompt-shortcut` snippets, and `ai-mascot` preferences stay in browser `localStorage`.

See each package's `README.md` or the documentation site for limits, privacy details, and exact boundaries.

## Documentation

The [documentation site](https://seefs001.github.io/dsh-plugins/) (in Chinese) is built with Fumadocs and deployed to GitHub Pages.

```bash
pnpm run docs:dev        # local preview (http://localhost:3000)
pnpm run docs:typecheck  # MDX + TypeScript check
pnpm run docs:build      # static export to apps/docs/out
```

See [apps/docs/README.md](apps/docs/README.md) for deployment notes.

## Development

```bash
pnpm install
pnpm run check   # oxlint + manifest validation + node:test
```

Most packages are plain ES modules with no build step. See [CONTRIBUTING.md](CONTRIBUTING.md) for layout rules, exceptions (`pi-tools`, `message-actions`), and release steps.

## License

Plugin code is licensed under [MIT](LICENSE). `dsh-ai-mascot` references external character artwork governed by separate non-commercial terms; see [packages/ai-mascot/README.md#artwork-and-rights](packages/ai-mascot/README.md#artwork-and-rights).
