# dsh-git-changes

Adds a Git changes entry below the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) composer, next to the activity and usage pills: the checked-out branch, the added and deleted lines, and the number of uncommitted files. Click it to open the diff in the right Sidebar, already on the Uncommitted scope.

## Requirements

Enable **Change requests & worktrees** (`@deepseek-ai/dsh-experimental-forge-bundle`) on the Plugins page. This plugin reads that panel's data and opens its Local changes tab. Without it, the entry does not appear.

## How it works

Browser only (`lib/client.js`). The Host half is a no-op that the Loader needs for the bundle row.

- Registers the `git-changes` entry in the `conversation.composer.dock` slot (order 2, after the shipped pills).
- Follows `forgePanel.follow` for the current Session to learn the branch and when the checkout changes, then reads `forgePanel.localDiff({ kind: 'uncommitted' })` (debounced) for the numbers: changes against HEAD, including untracked files.
- Clicking opens `dsh-resource://forge-changes/<session>/local`, the same tab as the panel's Local changes card.
- Wraps the forge changes tab body (`sidebar.right.pane.tab`, priority -10) to switch each new Local changes tab from Branch to Uncommitted once. Choosing another scope afterwards sticks.
- Shows "No changes" for a clean checkout. Hidden outside a Git checkout.

## Limits

- The tab default relies on the forge tab's internal store (`byTab[tab].scope` and its `scoped` action). If a dsh upgrade changes them, the tab opens on Branch again; the entry itself keeps working.
- A diff over the forge panel's `maxDiffBytes` shows "No changes" in the entry.
