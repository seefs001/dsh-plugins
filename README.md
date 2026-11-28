<div align="center">

# dsh-plugins

37 standalone plugins for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH): model selection, session organization, conversation reading, and tool integrations.

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[Documentation (中文)](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

English | [中文](README.zh.md)

</div>

## Overview

Each plugin lives in `packages/<name>` and installs, enables, disables, or removes independently.

- **Host**: runs in the DSH service process.
- **Web**: runs in `dsh web`.
- **Host + Web**: spans both.

## Plugin catalog

### Models and review

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-model-favorites`](packages/model-favorites) | Star models in the model list to pin a Favorites section at the top and switch favorites directly from the model menu. | Host + Web |
| [`dsh-model-reference`](packages/model-reference) | Type `#` in the composer to insert a model chip carrying that model's last reasoning effort and fast mode. | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | Switch `priority` (Fast) or `ultrafast` service tiers for OpenAI Responses requests. | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | Remembers the model and reasoning effort picked in top-level sessions as new-session defaults. | Host |
| [`dsh-title-model`](packages/title-model) | Pick a separate model for session titles. | Host + Web |
| [`dsh-subagent-model`](packages/subagent-model) | Shows a subagent's recorded model and reasoning effort in its composer. | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | Route Auto review to a custom model and prompt, with a per-session review log. Requires `@deepseek-ai/dsh-experimental-auto-review`. | Host + Web |
| [`dsh-roles`](packages/roles) | Manage roles (system prompt, inline skills, local skill references) in the sidebar, switch per session, or insert `#` role chips. | Host + Web |

### Sessions and workspaces

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | Sort sessions in the `@` reference menu by recent activity, newest first. | Web |
| [`dsh-session-groups`](packages/session-groups) | Custom sidebar session groups and per-group pins, synced via the Host. | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | Inspect saved workspaces and open a one-step Clean up dialog for invalid workspaces, left-behind jobs, and clean linked worktrees. | Host + Web |
| [`dsh-open-in-default`](packages/open-in-default) | Add a session-header split button that opens the workspace in your remembered editor, while its arrow switches defaults without launching. | Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | Switch local Git branches from the New Session page before the first message. Requires Forge worktrees. | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | Show current branch and uncommitted stats below the composer; click to open local diffs. Requires Forge worktrees. | Web |
| [`dsh-github-panel`](packages/github-panel) | Show linked GitHub repo overview, chat mentions, open PRs, issues, and releases in the right session panel and open items directly on GitHub. Requires GitHub CLI (`gh`). | Host + Web |
| [`dsh-keep-awake`](packages/keep-awake) | Prevent macOS idle sleep while the DSH Host runs. | Host |

### Reading conversations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-diagram-preview`](packages/diagram-preview) | Render Mermaid, Graphviz, ECharts, and SVG blocks in chat, with zoom, PNG/SVG export, and a toggle back to source. | Web |
| [`dsh-canvas`](packages/canvas) | Interactive sandboxed Canvas artifacts (`.canvas.tsx`, `.canvas.html`, `.canvas.svg`) in sessions, with live file subscriptions, TypeScript checking, persistent state, revision diffs, and allowlisted host actions. | Host + Web |
| [`dsh-side-chat`](packages/side-chat) | Open a separate chat in the sidebar with the main session's agent preset and bring its reference back to your draft. | Web |
| [`dsh-quote-jump`](packages/quote-jump) | Turn quotes in user messages into clickable blocks that jump to and highlight the source. | Web |
| [`dsh-annotations`](packages/annotations) | Annotate Git diffs, AI replies, and your own messages, manage them in a composer tray, and implicitly inject pending annotations on the next turn via `agent/pre-step`. | Host + Web |
| [`dsh-tool-lens`](packages/tool-lens) | Open skill files, full spill outputs, search hits, links, and subagent chats directly from tool-call rows. | Web |
| [`dsh-subagent-peek`](packages/subagent-peek) | Show a compact subagent count pill in the session header with live status marks and a tree popover to jump to any descendant. | Web |
| [`dsh-message-actions`](packages/message-actions) | Add **Wait, what?** beside replies to explain them in an isolated model call. | Host + Web |
| [`dsh-message-edit`](packages/message-edit) | Hover your own messages to edit in place or fork and resend. | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | Draggable GPT / Claude companions reacting to the active conversation. Artwork carries separate non-commercial terms. | Web |
| [`dsh-acp-workbench`](packages/acp-workbench) | Run Cursor, Antigravity, Claude Code, or other local ACP CLIs in DSH conversations or as continuable subagents. External CLIs run outside the DSH sandbox. | Host + Web |
| [`dsh-mobile-boost`](packages/mobile-boost) | Reduce mobile layout, blur, and transition overhead when switching pages or focusing the composer. | Web |

### Tools and integrations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-prompt-shortcut`](packages/prompt-shortcut) | Save reusable text snippets on DSH Host (synced across browsers), search, import/export, and insert at cursor. | Host + Web |
| [`dsh-cheat-sheet`](packages/cheat-sheet) | Search session skills, pin favorites, sort by observed usage, and insert `/commands`. | Host + Web |
| [`dsh-web-access`](packages/web-access) | Provide `grok_search` (web + X) and `openai_search` backed by existing Responses providers. | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | Provide `openai_image` and `grok_image` backed by existing Responses providers. | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | Standalone `pi` preset with Pi coding tools, MoeJS `codemode`, per-session tool selection, saved defaults, and MCP refresh. | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | Share Pi's `~/.pi/agent/mcp.json` with DSH, hot-reload changes, and toggle servers in Plugins settings. | Host + Web |
| [`dsh-paseo-hub`](packages/paseo-hub) | Enroll DSH Host as a Paseo Hub daemon and expose an organization API console and tools. | Host + Web |
| [`dsh-bark-notify`](packages/bark-notify) | Send Bark push notifications for agent questions, plan reviews, and tool approvals. | Host + Web |
| [`dsh-config-backup`](packages/config-backup) | Export conversation-independent Host and plugin configs into one portable file (optional AES-256-GCM encryption) and restore with diff preview onto installed plugins. | Host + Web |

## Install

Install a single package from GitHub into a profile (here `web`):

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/model-reference"
```

Replace `model-reference` with any directory name above, or paste the `github:` spec into the **Plugins** page in DSH Web.

Install from a local clone:

```bash
git clone https://github.com/seefs001/dsh-plugins.git
cd dsh-plugins
dsh plugin --profile web add "link:$PWD/packages/model-reference"
```

If Plugin Manager reports `applied`, Host changes take effect immediately; if it reports `restart-required`, restart DSH for that profile. Browser halves load after a page refresh.

## Configuration and storage

- **Profile config (`cordis.patch.yml`)**: `model-reference`, `service-tier`, `remember-model` (optional `onlyAfterTurn`), `auto-review-model`, `github-panel` (`hosts`), `message-actions`, `web-access`, `image-gen`, `pi-mcp` (`disabledServers`, `eagerServers`), and `bark-notify` settings.
- **Host storage domains (`~/.dsh/storages`)**: `model_favorites`, `session_groups`, `roles`, `cheat_sheet`, `prompt_shortcut`, `auto_review_log`, `message_actions`, `pi_tools_defaults`, `paseo_hub`, `acp_workbench`, and `canvas`.
- **DSH credentials**: `bark-notify/device` and `paseo-hub/{daemon,api}`.
- **Session log and `localStorage`**: `pi-tools` selection lives in the session log; browser `localStorage` holds UI preferences (`ai-mascot`, `session-groups` fold states, `github-panel` hidden mentions, `pi-tools` picker view, `paseo-hub` page size, `acp-workbench` trace/reply collapse) and acts as a fallback for `prompt-shortcut` when Host storage is unavailable.

## Documentation

The [documentation site](https://seefs001.github.io/dsh-plugins/) (Chinese) is built with Fumadocs and deployed to GitHub Pages:

```bash
pnpm run docs:dev        # http://localhost:3000
pnpm run docs:typecheck  # MDX + TypeScript check
pnpm run docs:build      # static export to apps/docs/out
```

## Development

Browser-side readable sources live under `packages/<name>/src/client.js` (and optional lazy chunks `src/client.page.js`). Committed runtime bundles (`lib/client*.js`, or `packages/pi-tools/client.js`) are deterministically minified via `esbuild` and verified byte-for-byte in CI (`.github/workflows/ci.yml`):

```bash
pnpm install
pnpm run build:clients        # build minified client bundles from src/client*.js
pnpm run build:clients:check  # verify bundles match src/client*.js byte-for-byte
pnpm run check                # build:clients:check + oxlint + manifest/docs validation + node:test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for package layout, lint rules, and package-specific builds.

## License

Plugin code is licensed under [MIT](LICENSE). `dsh-ai-mascot` references external character artwork under separate non-commercial terms; see [packages/ai-mascot/README.md#artwork-and-rights](packages/ai-mascot/README.md#artwork-and-rights).
