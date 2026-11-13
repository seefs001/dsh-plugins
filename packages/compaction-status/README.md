# dsh-compaction-status

Shows **Compacting context…** and the elapsed time in one line above the DSH composer, at the same centered width as the native task dock. You do not have to expand process details to see it.

中文：上下文压缩时，在输入框上方显示一行「正在压缩上下文」和已等待时间，与原生任务栏同宽、居中。中文指南见[文档站](https://seefs001.github.io/dsh-plugins/docs/plugins/compaction-status/)。

## Requirements

- DSH `>=0.2.2-rc.1 <0.3.0`.
- Node.js `^22.19.0 || >=24.0.0`.
- The Web GUI (`dsh web`). The bundle has Host and Web halves and adds no terminal indicator.
- The existing DSH compaction lifecycle. The plugin displays status; it does not enable or schedule compaction.

## Install

Install into the same profile that runs your Web GUI, here `web`:

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/compaction-status"
```

You can also paste that GitHub spec into the Web GUI's **Plugins** page. The GitHub command requires the package to be available on `main`; for unpublished local changes, install from the repository root instead:

```bash
dsh plugin --profile web add link:$PWD/packages/compaction-status
```

Installing and enabling the bundle affects every session in that profile. If the profile has HMR enabled, Plugin Manager reports `applied` and no restart is needed; if it reports `restart-required`, restart DSH. Refresh the Web page if it still shows an older Client bundle. There are no plugin settings or extra API keys.

## Use and behavior

During automatic compaction or a manual `/compact`, the dock shows a small spinner, the localized status, and an elapsed timer such as **Elapsed 0:34** / **已等待 0:34**. Hover for the explanatory text.

- The status is outside folded process details and stays above the composer while you read older messages.
- The timer uses the original `compaction/start` timestamp, in minutes and seconds. It measures elapsed wall time, not percentage complete or estimated time remaining.
- Refreshing or reconnecting to the same running Host lifecycle preserves that start time. Restoring or forking a session clears inherited, unfinished work at `session/end-seed`.
- A matching `compaction/end` hides the status on either success or failure. An enclosing `turn/end` also clears unfinished automatic compaction. Native error reporting remains unchanged.
- The status follows the displayed session; switching sessions does not mix timers.
- English and Chinese labels follow the GUI locale. Theme colors follow the Host; reduced-motion preferences stop the spinner animation.

The plugin does not change compaction thresholds, summarization models, model calls, or historical summary rows. It cannot make summarization faster. Using `/compact` to verify the indicator still performs real compaction and may make a model request.

## Configuration and data

The Host derives the `dsh-compaction-status` session projection from durable `compaction/start` and `compaction/end` events. It does not create a separate custom session record or store browser preferences. Normal Host projection caching still applies.

Disabling the bundle removes the projection and dock entry without changing the compaction process.

## Implementation

The Host registers the projection with `sessionProjections`. The Client reads it through the session-scoped dock's `useProjection` hook and registers one `conversation.input.dock` entry, ordered before the task dock. Only the local clock ticks once a second; the Client does not poll session events or request extra model calls.

Width follows the native task dock's `--dsh-composer-*` layout variables, including its side clearances and insets. The plugin does not style the Host's task, goal, queue, or composer elements.

The schemas use the dependency-free `parse` / `safeParse` validator interface used elsewhere in this JavaScript plugin collection.

## Verify

From the repository root:

```bash
pnpm exec oxlint --deny-warnings packages/compaction-status
pnpm run validate
```

These checks cover source and bundle metadata. To check the rendered result, watch a real compaction in the running GUI: the status should line up with the task dock, stay readable in light and dark themes and narrow windows, and disappear when compaction ends.
