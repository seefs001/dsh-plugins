# dsh-session-lifecycle

Organize DSH sessions without archiving, stopping or answering them. This is a Host + Web plugin; the sidebar works with Pi agents without a DSH core change.

| Sidebar section | What goes there |
| --- | --- |
| Needs you | Approvals, plan reviews and questions. A child request opens the child that asked it. Only these conversations count toward the badge. |
| Recently returned | Sessions that ended or woke in the last day, newest return first. Background messages do not reorder them. |
| Working | Running sessions, delegated work and queued turns. Collapsed by default; pinning a session or keeping it open preserves its ordinary row. |
| Snoozed / Settled | Sessions you set aside until a time, or put away until a new prompt. Expand a shelf or use the session menu to bring one back. |

Use the session context menu to snooze until a preset or local date/time, settle, or exempt a session from auto-settlement. Placement changes offer Undo; it will not overwrite a newer placement from another client. The plugin does not write the native pin, archive, order or group membership. Search shows native results. In **Triage → Settings**, turn off the Working fold or change the default seven-day idle threshold. The Host checks every minute, even with the page closed. Ordinary completion does not wake a snooze; new decisions and failed turns can. A question that was already open when you snoozed stays deferred.

**Triage** also includes per-question Later, unread turn outcomes, worker failures, registered deliverables, direct links back to the original row and bounded history backfill. A focused conversation acknowledges a turn only after its matching end event arrives. Read marks and lifecycle settings are shared through the Host. Shelf expansion is browser-local.

**Optional summaries** are off on a new profile. The owner can preview the exact root-reply excerpt and choose one provider/model and exact working directory. Trials count toward the 12-call daily UTC quota. There is no history backfill or model fallback for AI calls. Do not enable summaries for sensitive directories.

## Replacing dsh-inbox

Disable the old bundle **before** enabling this one. Both use the same outcome projection and summary storage; they are replacements, not companion plugins. No archive or storage reset is necessary. The same profile reuses its previous summary opt-in, cache and quota. Opening the new UI imports valid old read markers and unexpired per-question reminders from that browser. Markers are removed only after the Host accepts them. Open each browser that used Inbox to import its local marks.

Install through **Plugins → Add plugin** using this package directory. The optional Pi tool `session_lifecycle` acts only on its calling top-level session. Select it in Pi's tool picker if needed; the Web UI does not depend on the tool. Lifecycle HTTP endpoints and summaries require the profile owner.
