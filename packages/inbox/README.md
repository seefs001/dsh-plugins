# dsh-inbox

A Web sidebar for the times a person needs to get involved. If six workers finish and the coordinator keeps going, that makes **zero** new badge entries. When the coordinator asks a question, the badge shows **one** conversation. A child with a live approval appears under its root, but opens the child that owns the decision.

## Using the Inbox

| Section | What appears | What you can do |
| --- | --- | --- |
| Needs you | Native pending approvals, questions and plan reviews, plus verifiable timed questions that still accept a reply | Open the owning conversation and use its native card. Opening a row does not answer it. |
| Updates | The latest known root turn end or newer reported child failure, with its owner and time | Open the source or registered deliverable, or mark only this version read. A normal end does not mean the entire task succeeded. |
| In progress | Roots with a running turn, running descendants or a queued next turn | Expand if interested; no badge or notification. |

Ordinary named questions have **Later** (one hour or tomorrow at 09:00 local time). It parks that session/call ID in this browser, not the whole conversation. Another request from the same root can still appear. Returning from the native session via **Back to Inbox** restores the prior row or an adjacent surviving item. Without a trustworthy low-risk question contract, Inbox does not submit *any* question inline.

Outside the Later shelf, each root appears in **one** section: a request wins over ongoing work, which wins over an update. A normal stop stays on the working shelf for up to two seconds so the coordinator has time to resume. A new request is never delayed. An ordinary fork is a separate root; inherited events are not new outcomes. Archived trees, blank roots, roots requiring migration, and workers without a visible root do not manufacture entries.

## Recovery and read marks

- The Host registers the `dsh-inbox-outcome` session projection. It folds committed turn boundaries and uses DSH's existing checkpoint, replay and control stream. Its v2 wire value is null or `{ seq, time, reason, file?: true }`; `file` means a Work Timeline snapshot in that turn registered a deliverable, not that a filesystem check passed. File paths are resolved only after a user asks to open one. It stores no conversation text, tool output, approval, or answer. Explicit cancellation and synthetic fork endings do not create news. An interrupted turn is labeled as such when DSH supplies the recovery event.
- Opening the panel reads available Host list summaries. For older sessions without an Inbox summary, it asks the native projection reader for up to eight more recent roots, **in sequence**. Use **Check next batch** for more. A cached continued question without a live card is checked against the native projection before it counts as a dormant request. A queued reply removes it from the derived list; historical approval events never create an answerable card. A failed, unavailable or migration-gated read is not an empty inbox. Cold summaries are hints, not a continuously verified copy of every log.
- First use has no read marks. Existing known outcomes may appear under Updates, but never in the badge. Only an explicit mark, or a matching turn end in the **focused, visible main conversation's loaded history**, acknowledges that outcome. Merely opening the Inbox or starting navigation does not. **Mark shown updates read** covers only the displayed rows and sequence numbers. Other pages, later ends and pending decisions are untouched.
- Read marks live in this browser origin's local storage. Tabs share them; another browser or device starts with its own marks. Denied storage falls back to memory for this visit. Marks contain a session ID and sequence only; clearing site data resets them. They are not synced to the Host.
- The plugin reads DSH's session and workspace views. It does not start agents, scan session files, take over a waterfall, answer requests, grant permissions, or send notifications. It does not suppress notifications from DSH or other plugins. Agents get no Inbox tool. Source lookup and optional summaries use one owner-only Host HTTP endpoint; the native reader and Web navigation remain authoritative. Offline recovery means replay **after reconnecting to a reachable Host**, not an offline approval UI.

## Optional extractive summaries

In **Inbox → Summary settings**, the profile owner selects one fixed provider/model and one **exact working directory**. Everything else stays opted out. Choose a visible root update to preview the exact report excerpt; **Try once** may charge once but does not enable automation. Saving the route is a separate action; it never backfills old turns. You can disable it even if the model catalog is unavailable. The Host may work while the page is closed.

- Only new, completed root turns observed from start to end after opt-in qualify. Later turns supersede the 10-second stability window. Workers, turns with registered files, short answers, code blocks and recognized credential patterns are skipped. Free-text filtering cannot guarantee secret detection: do not opt sensitive directories in.
- Only numbered excerpts from the final root assistant report are sent, up to 2,400 characters of source. No prior user messages, paths from settings, tool output, hidden reasoning, attachments or question drafts are added. The model can only select one or two existing sentences. The UI labels them AI-selected, shows their source and never turns generated text into actions. An assistant claim is not independent verification.
- No silent fallback. A single in-flight request per profile, with a persisted budget of 12 provider attempts per UTC day including trials. Disabling cancels waiting work and requests cancellation of work already submitted. Failures may still incur cost. Busy or failed turns keep native facts, without retries. The latest 100 successful automatic results stay in the Host storage domain, separate from conversations. Read marks and snoozes are local to the browser. No model call is made by opening the Inbox or changing a select field.

## Try the local package

Targets the DSH 0.2.2-rc.3 session projection and Web slot contracts. The Web profile needs the native workspace, sidebar and session UI. Domain cards are handled by the corresponding native question/approval plugins.

From the repository root, to install in a **chosen test profile**:

```sh
dsh plugin --profile "${PROFILE:?set PROFILE to your test profile}" add "link:$PWD/packages/inbox"
```

Set PROFILE to the intended test profile first; follow the Plugin Manager result, then refresh its Web page. No build step or external dependency is needed. The source entry points are `lib/index.js` (Host fold), `lib/summary.js` (owner-only opt-in and extraction), and `lib/client.js` (aggregation, local marks, native navigation and layout).
