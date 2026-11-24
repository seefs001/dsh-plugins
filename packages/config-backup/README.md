# dsh-config-backup

Export conversation-independent Host and plugin configurations to a single portable JSON file (plain or AES-256-GCM encrypted), and restore with field-level diff preview onto installed plugins in another machine or profile.

## What is included

- **Profile config overrides (`cordis.patch.yml`)**: reads explicit user overrides via `configEditor.configuration()`. Secret fields declared with `role('secret')` are stripped by default and preserved on the target Host when importing a redacted backup.
- **Conversation-independent storage domains**: exports live open `storageDomain` entries with domain/table filtering:
  - Included by default: `roles` (library only), `cheat_sheet`, `pi_tools_defaults` (`presets`), `prompt_shortcut`, `acp_workbench` (`global` + `providers`), `paseo_hub` (`global`), `workspace`, and `schedule`.
  - Optional (unchecked by default): `session_groups`, `session_lifecycle`, and unknown open domains.
  - Always excluded: caches and per-session logs (`session_projcache`, `dsh-context`, `auto_review_log`, `message_actions`, `forge_panel_change_requests`, `canvas`, `session_lifecycle_summary`).
- **Home-level files**: `~/.dsh/AGENTS.md` and non-empty `~/.dsh/cordis.patch.yml`.
- **Credentials (opt-in)**: `~/.dsh/.credentials.yaml` and `~/.dsh/.env` are excluded by default and unchecked by default on import.

## Portability & restore rules

- **Installed plugins only**: entries or storage domains not installed/active in the target profile are marked as skipped and never force-written.
- **Home path normalization**: optional `{{$HOME}}` normalization on export and automatic expansion to the target machine's home directory on import.
- **Diff preview & modes**: inspect field-level config/domain diffs and line-level file diffs before applying; choose between **Merge** (keep extra local table records) and **Replace** (mirror backup tables).
- **Optional encryption**: set a passphrase to encrypt the archive with `scrypt` + `AES-256-GCM`.

## Install

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/config-backup"
```

After restarting DSH (if prompted) and refreshing the page, open **Config backup** from the left sidebar.
