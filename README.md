<div align="center">

# dsh-plugins

seefs's personal plugins for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH), built for daily use and kept current with the latest DSH. Each one is a separate bundle for model selection, session management, conversation reading, or new tools.

[![CI](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/seefs001/dsh-plugins/actions/workflows/ci.yml)
[Documentation](https://seefs001.github.io/dsh-plugins/) · [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

English | [中文](README.zh.md)

</div>

## Plugins

"Runs in" tells you whether the plugin has a Host half, a browser half, or both.

### Models and review

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-model-reference`](packages/model-reference) | Type `#` in the composer to insert a model chip carrying that model's last reasoning effort and fast mode. | Host + Web |
| [`dsh-service-tier`](packages/service-tier) | Pick Fast or Ultrafast (on supported models) for OpenAI Responses requests. | Host + Web |
| [`dsh-remember-model`](packages/remember-model) | Remembers the model and reasoning effort you picked last and starts new sessions with them. | Host |
| [`dsh-title-model`](packages/title-model) | Pick a separate model for session titles without changing the conversation model or title strategy. | Host + Web |
| [`dsh-subagent-model`](packages/subagent-model) | Shows a subagent's recorded model and reasoning effort beside its composer (read-only). | Web |
| [`dsh-auto-review-model`](packages/auto-review-model) | Pick a separate model and custom prompt for Auto review, and browse each session's review log. Needs `@deepseek-ai/dsh-experimental-auto-review`. | Host + Web |
| [`dsh-roles`](packages/roles) | Manage roles with custom prompts and skills in the sidebar, and switch them per session from the model menu. | Host + Web |

### Sessions and workspaces

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-recent-sessions`](packages/recent-sessions) | Sorts sessions in the `@` menu by recent activity, newest first. | Web |
| [`dsh-inbox`](packages/inbox) | A quiet inbox for sessions waiting on you and recent turn results; subtasks roll up under their parent. | Host + Web |
| [`dsh-session-groups`](packages/session-groups) | Custom session groups with per-group pins, shared across browsers and agents. | Host + Web |
| [`dsh-workspace-manager`](packages/workspace-manager) | Removes saved workspace entries and cleans up missing directories without touching files or sessions. | Host + Web |
| [`dsh-branch-switcher`](packages/branch-switcher) | Switch to an existing local branch right from the New Session page before your first message. Needs Change requests & worktrees. | Host + Web |
| [`dsh-git-changes`](packages/git-changes) | Shows the current branch and uncommitted changes below the composer; click to open the diff. Needs Change requests & worktrees. | Web |
| [`dsh-keep-awake`](packages/keep-awake) | Keeps your Mac from idle sleeping while the Host runs, while still letting the display sleep and lock. | Host |

### Reading conversations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-compaction-status`](packages/compaction-status) | Shows compaction status and elapsed time above the composer during context compaction. | Host + Web |
| [`dsh-quote-jump`](packages/quote-jump) | Turns quotes in your messages into clickable blocks that jump back to and highlight the source. | Web |
| [`dsh-tool-lens`](packages/tool-lens) | Adds quick actions to tool-call rows to open skill files, full outputs, result files, or subagent chats. | Web |
| [`dsh-message-actions`](packages/message-actions) | **Wait, what?** beside each reply explains it in an isolated model call without touching the conversation. | Host + Web |
| [`dsh-message-edit`](packages/message-edit) | **Edit** your messages in place (clearing later context by default, or keeping it), or fork and resend. | Host + Web |
| [`dsh-ai-mascot`](packages/ai-mascot) | Draggable GPT / Claude companions that react to the active conversation. Artwork has separate non-commercial terms. | Web |
| [`dsh-acp-workbench`](packages/acp-workbench) | Run Cursor, Antigravity, or other local ACP agents directly in DSH conversations or as continuable subagents, with traces and approvals in place. External CLIs run outside the DSH sandbox. | Host + Web |

### Tools and integrations

| Package | What it does | Runs in |
|---|---|---|
| [`dsh-prompt-shortcut`](packages/prompt-shortcut) | Save personal snippets in this browser and insert them at the cursor without sending. | Web |
| [`dsh-cheat-sheet`](packages/cheat-sheet) | Search available skills, pin favorites, sort by actual usage, and insert slash commands into the composer. | Host + Web |
| [`dsh-web-access`](packages/web-access) | Adds `grok_search` (web and X) and `openai_search` using hosted search on an existing Responses provider. | Host + Web |
| [`dsh-image-gen`](packages/image-gen) | Adds `openai_image` and `grok_image` using hosted image generation on an existing Responses provider, saving images to files. | Host + Web |
| [`dsh-pi-tools`](packages/pi-tools) | An isolated `pi` preset with Pi coding tools, QuickJS codemode, per-session tool selection, saved defaults, and MCP refresh. | Host + Web |
| [`dsh-work-timeline`](packages/work-timeline) | Shows a session's work plan, revisions, and linked artifacts in chat (replaces the Pi preset's TODO list; `work_read` and `work_update` come from `dsh-pi-tools`). | Host + Web |
| [`dsh-pi-mcp`](packages/pi-mcp) | Shares Pi's `~/.pi/agent/mcp.json` with DSH and follows file edits live. | Host |
| [`dsh-orbit-bridge`](packages/orbit-bridge) | Read-only watch over Orbit projects tracking new, changed, and missing tasks against the last check. Never writes to Orbit. | Host + Web |
| [`dsh-paseo-hub`](packages/paseo-hub) | Run Paseo Hub triggers locally as DSH sessions, inspect runs and activity, or manage triggers via the organization API. | Host + Web |

Install only what you need. With both `dsh-model-reference` and `dsh-service-tier` installed, `#` chips also carry ⚡.

## Requirements

- The latest DSH. These plugins are for my own use and only track the newest DSH and this repository's `main` branch; older versions are not supported.
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

Most settings are made in the GUI and saved to the profile's `cordis.patch.yml` through DSH's config editor. This covers `model-reference` efforts, `service-tier` fast models, the `auto-review-model` model and prompt, the native title generator’s model through `title-model`, the `message-actions` explanation model, and `web-access` search settings.

Session groups, review logs, reply explanations, and Orbit bridge routines and runs live in Host storage domains (`session_groups`, `auto_review_log`, `message_actions`, `orbit_bridge`). Roles and selections use the `roles` domain. Paseo Hub keeps its daemon relationship, local runs and activity in `paseo_hub`; daemon credentials and the separately saved organization API key use DSH credentials. Pi tool selections are written to the session log, while saved preset defaults use `pi_tools_defaults`. Work timeline snapshots travel in the session log's `work_update` tool results. AI Mascot keeps its position and display preferences in browser localStorage. Each package README lists its storage limits and privacy notes.

## Documentation

The [documentation site](https://seefs001.github.io/dsh-plugins/) is in Chinese. It covers installation, configuration and data, dependencies and boundaries, and a page per plugin. It is built with Fumadocs and deployed to GitHub Pages.

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
