# dsh-git-changes

Adds a Git changes entry below the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) composer, next to the activity and usage pills. It shows the checked-out branch, the added and deleted lines, and the number of uncommitted files. Click it to open the diff in the right sidebar, already on the Uncommitted scope.

## Requirements

Enable **Change requests & worktrees** (`@deepseek-ai/dsh-experimental-forge-bundle`) on the Plugins page. This plugin reads that panel's data and opens its Local changes tab; without it, the entry does not appear.

## How it works

The plugin runs in the browser (`lib/client.js`). Its Host half is empty; the Loader needs it for the bundle row.

- It registers the `git-changes` entry in the `conversation.composer.dock` slot at order 2, after the shipped pills.
- It follows `forgePanel.follow` for the current session to learn the branch and when the checkout changes, then reads `forgePanel.localDiff({ kind: 'uncommitted' })`, debounced by 400 ms, for the numbers. They count changes against HEAD, including untracked files.
- Clicking opens `dsh-resource://forge-changes/<session>/local`, the same tab the panel's Local changes card opens.
- It wraps the forge changes tab body (`sidebar.right.pane.tab`, priority -10) so that each new Local changes tab switches from Branch to Uncommitted once. A scope you pick afterwards stays.
- A clean checkout shows "No changes". Outside a Git checkout the entry is hidden.

## Limits

- The default scope relies on the forge tab's internal store (`byTab[tab].scope` and its `scoped` action). If a DSH upgrade changes them, the tab opens on Branch again; the entry keeps working.
- A diff larger than the forge panel's `maxDiffBytes` shows "No changes" in the entry.
