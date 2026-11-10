# Changelog

## Unreleased

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
