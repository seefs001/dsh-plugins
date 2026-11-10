# dsh-compaction-status

Shows **Compacting context…** and elapsed time in a compact, single-line status above the DSH composer. It uses the same centered width as the native task dock, rather than stretching across the page. No need to expand process details.

中文：上下文压缩时，在输入框上方显示一行「正在压缩上下文」和已等待时间。与原生任务栏同宽、居中，不使用通栏卡片或第二行说明。中文使用指南见[文档站页面](../../apps/docs/content/docs/plugins/compaction-status.mdx)。

## Requirements

- DSH `>=0.2.2-rc.1 <0.3.0`.
- Node.js `^22.19.0 || >=24.0.0`.
- The Web GUI (`dsh web`). This bundle contains both Host and Web halves; it adds no terminal indicator.
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

Installation and enabling affect every session in that profile, not just the current conversation. With `patchReload: live`, the bundle applies without restarting DSH. Refresh the Web page if it still shows an older Client bundle. There are no plugin settings or extra API keys.

## Use and behavior

During automatic compaction or a manual `/compact`, the dock shows a small spinner, the localized status, and an elapsed timer such as **Elapsed 0:34** / **已等待 0:34**. Hover for the explanatory text. There is no full-width banner, heavy card border, or second line of copy.

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

These checks validate source and bundle metadata, not the rendered result. To verify the running GUI, observe an actual compaction: the single-line status should align with the task dock, remain readable in light and dark themes and narrow windows, then disappear when compaction ends. Live slot registration alone does not establish visual correctness.
