# Changelog

## 2026-11-10: first public release

### Breaking

- Packages were renamed from `@local/dsh-*` to unscoped `dsh-*` names, and their plugin row ids changed:

  | Before | After | Row id |
  |---|---|---|
  | `@local/dsh-model-hash` | `dsh-model-reference` | `model-hash` → `model-reference` |
  | `@local/dsh-service-tier` | `dsh-service-tier` | `service-tier` (unchanged) |
  | `@local/dsh-remember-model` | `dsh-remember-model` | `remember-model` (unchanged) |

- `dsh-model-reference` now serves `GET /model-reference/state` (was `/model-hash/state`).

### Added

- `dsh-recent-sessions` 1.0.0: sorting `@` sessions newest first, split out of `dsh-model-reference`.
- Tests, manifest validation, lint and CI.

### Changed

- `dsh-model-reference` 1.3.0: the `@` session sorting moved to `dsh-recent-sessions`. The bundled config no longer ships personal efforts.
- `dsh-service-tier` 1.2.0: oversized bodies answer `413`, `405` answers carry `Allow`, and empty `provider`/`model` values are rejected.
- `dsh-remember-model` 1.2.0: non-string `reasoningEffort` values are ignored.
- All packages declare `engines.dsh`, keywords, repository and license.
