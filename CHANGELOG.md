# Changelog

## Unreleased

- `dsh-session-groups` 1.0.0: custom session groups in a sidebar panel, with pinned sessions leading each group and a searchable add-session picker.
- `dsh-auto-review-model` 1.0.0: pick the model, reasoning effort and review prompt that Auto review uses to judge tool calls. A composer chip shows the review model in Auto mode and opens a per-session review log that jumps to each reviewed tool call.
- `dsh-quote-jump` 1.0.0: quotes in user messages become blocks that scroll to the quoted text and highlight it.
- `dsh-tool-lens` 0.1.0: richer tool-call rows; the skill row opens the skill's `SKILL.md` in the right sidebar.
- Plugin UI styles aligned with host pages and theme tokens (`session-groups`, `auto-review-model`, `model-reference`, `service-tier`).

## 2026-11-10: first public release

- `dsh-model-reference` 1.3.0: type `#` in the composer to insert a model chip with that model's last reasoning effort and fast mode.
- `dsh-service-tier` 1.2.0: a ⚡ toggle beside the model picker that sends `service_tier: "priority"` for OpenAI Responses models.
- `dsh-remember-model` 1.2.0: new sessions start on the model and reasoning effort you picked last.
- `dsh-recent-sessions` 1.0.0: sessions in the `@` menu are listed by last activity, newest first.
- Tests, manifest validation, lint and CI.
