# Changelog

## Unreleased

- `dsh-pi-tools`: runs on stock DSH 0.2.2-rc.2 and later without DSH source changes. The tool selection is stored as an ignorable `plugin:dsh-pi-tools/selection` Session record and edited through the `conversation.hero.options` slot and an owner-only `/pi-tools/options` route. Result cards use keyed `tool.call.toolview` entries for `codemode` and `tool_search`; Pi `read`, `write` and `edit` now use DSH's built-in rows. Codemode grammar sampling is restored by wrapping pi-ai's `streamSimple`, for models whose compat enables OpenAI grammar tools.
- `dsh-service-tier`: works again on DSH 0.2.2-rc.2 and later, which removed the `llm-pi-ai/model-defaults` waterfall. The plugin now wraps pi-ai's `streamSimple` and sets `service_tier` through `onPayload`; a changed DSH layout logs a warning instead of failing silently. The ⚡ toggle also appears on pi-ai catalog routes such as `openai` that set no `api` of their own.
- `dsh-image-gen` 0.1.0: adds `openai_image` and `grok_image`, which call hosted `image_generation` on an existing Responses provider and save the images to files. The supplied `pi` preset passes both tools through.
- `dsh-pi-mcp` 0.1.0: a Host-only plugin that registers each server in Pi's `~/.pi/agent/mcp.json` with the DSH MCP manager, converts `${VAR}` to `${credential:VAR}`, and follows file edits without a restart. Skips OAuth, `!command`, and SSE entries with a log warning.
- `dsh-pi-tools`: `mcpServers` accepts `'*'` to bridge every global MCP namespace, including ones registered later. The supplied `pi` preset now uses it.
- `dsh-pi-tools`: the conversation tool picker groups Pi, DSH and MCP tools into collapsible sections with selection counts, section checkboxes (whole section, or only the visible matches while filtering), a selected-only view, and expand/collapse all. Filtering always shows matches regardless of fold state. Save, Cancel, Restore defaults and session locking are unchanged.
- Documentation site: reorganized into install, configuration and data, versions and boundaries, and grouped plugin pages, with pages for `dsh-pi-tools` and `dsh-switchboard`. Plugin versions and DSH ranges are read from package manifests at build time. Replaced references to a nonexistent `patchReload: live` setting with Plugin Manager's `applied` / `restart-required` results.
- `dsh-keep-awake` 0.1.0: a macOS Host-only plugin that prevents automatic idle sleep using the built-in `caffeinate` utility. Keeps display sleep and screen locking unchanged; releases its assertion on plugin disposal or Host exit, including crashes. Includes English and Chinese metadata, an original icon, and usage documentation.
- `dsh-subagent-model` 1.0.0: a read-only model and reasoning-effort label in subagent composers, sourced from the child session's recorded selection. Keeps the main agent's model picker unchanged; includes English and Chinese labels and plugin metadata.
- `dsh-compaction-status` 0.1.0: a compact, single-line compaction indicator above the composer, aligned with the native task dock. Shows elapsed time for automatic compaction and `/compact` without changing compaction behavior.
- `dsh-git-changes` 0.1.0: a composer entry showing the branch and uncommitted changes, including untracked files, with a shortcut to the forge panel. Requires the Change requests & worktrees bundle.
- `dsh-ai-mascot` 0.1.0: draggable GPT / Claude companions that follow the displayed conversation's activity, with compact mode, size and motion preferences, and artwork attribution.
- `dsh-session-groups` 1.0.0: custom session groups in a sidebar panel, with pinned sessions leading each group and a searchable add-session picker. Drag sessions from the sidebar or groups into a group, or onto the new-group drop zone.
- `dsh-auto-review-model` 1.0.0: pick the model, reasoning effort and review prompt that Auto review uses to judge tool calls. A composer chip shows the review model in Auto mode and opens a per-session review log that jumps to each reviewed tool call.
- `dsh-quote-jump` 1.0.0: quotes in user messages become blocks that scroll to the quoted text and highlight it.
- `dsh-tool-lens` 0.1.0: richer tool-call rows; the skill row opens the skill's `SKILL.md` in the right sidebar.
- `dsh-web-access`: custom search uses native expandable tool rows and nullable optional filters. When configured web search is available, it hides built-in `web_search`; X-only search does not replace it, and `web_fetch` stays unchanged.
- Plugin UI styles aligned with host pages and theme tokens (`session-groups`, `auto-review-model`, `model-reference`, `service-tier`).

## 2026-11-10: first public release

- `dsh-model-reference` 1.3.0: type `#` in the composer to insert a model chip with that model's last reasoning effort and fast mode.
- `dsh-service-tier` 1.2.0: a ⚡ toggle beside the model picker that sends `service_tier: "priority"` for OpenAI Responses models.
- `dsh-remember-model` 1.2.0: new sessions start on the model and reasoning effort you picked last.
- `dsh-recent-sessions` 1.0.0: sessions in the `@` menu are listed by last activity, newest first.
- Tests, manifest validation, lint and CI.
