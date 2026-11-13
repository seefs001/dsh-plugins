# dsh-branch-switcher

Switch an existing local Git branch from the branch chip on the **New Session** screen, without checking **New worktree** first. The native worktree base selector and creation flow remain unchanged once that option is checked.

## Requirements

- DSH `>=0.2.2-rc.2 <0.3.0` and the Web GUI.
- Enable **Change requests & worktrees** (`@deepseek-ai/dsh-experimental-forge-bundle`). This plugin does not enable it automatically.
- A Git workspace with existing local branches. The checkout must be writable under the Session's sandbox policy.

## Install locally

```bash
dsh plugin --profile web add link:$PWD/packages/branch-switcher
```

Or use **Plugins → Add plugin** and select this package directory. Follow Plugin Manager's application result: if it reports **restart required**, restart DSH before refreshing the existing GUI. A page refresh alone cannot activate a pending Host change. No application rebuild is required for this plain JavaScript bundle.

## Use

1. Create a new Session and select a Git workspace.
2. Before sending its first message, click the branch name beside **New worktree**.
3. Search local branches, select one, then click **Switch branch**.
4. The chip updates after Git succeeds. Send a message to start on that checkout, or check **New worktree** to use the native isolated-worktree flow.

The menu supports Escape and outside-click dismissal, keyboard focus, arrow navigation, full branch names on hover, and inline Git failures with Retry. Read-only mode disables switching. A detached HEAD is labeled explicitly.

**Switching changes the actual shared directory. Other Sessions and terminals using that checkout see the new branch too.** Uncommitted changes follow normal `git switch` behavior: Git keeps compatible changes and refuses a switch that would overwrite them. The plugin does not fetch, create branches, stash, reset, merge, or force a switch. Branches checked out in another worktree are left to Git to reject. Checkout hooks are disabled; configured Git content filters retain their normal behavior.

## Commands and agent access

The UI calls the authenticated Session command API, not a custom filesystem endpoint:

```text
/branch-switcher {"action":"list"}
/branch-switcher {"action":"switch","branch":"feature/example","root":"/absolute/checkout","current":"main"}
```

`branch_switcher` exposes the same operations to agents. Use the `root` and nullable `current` from the listing. Switching is intentionally limited to a blank, idle Session; an active agent can list branches but cannot switch its own running checkout through this tool. Both entry points call `BranchSwitcher.run`, use the Session's working directory and sandbox, and return the same result or failure. Command lifecycle records stay outside model history; agent tool calls retain ordinary tool history.

The switch claims Session maintenance so a first message arriving during Git waits until switching settles. It rejects a stale directory or current-branch selection. Git runs as argument arrays through DSH's managed subprocess service, with bounded output, cancellation, and a 15-second deadline per command. It does not bypass the Session sandbox or request escalation.

## 中文

新建会话后，不必先勾选“新建工作树”，直接点击右侧分支名，搜索并选择已有本地分支，再点“切换分支”。成功后分支名更新；勾选“新建工作树”后仍使用 DSH 原生的基准分支选择与创建流程。

这会切换真实工作目录，共用目录的其他会话也会受影响。未提交改动遵循 Git 原生规则，可能覆盖改动时会报错，不会自动暂存或强制覆盖。只读模式禁用切换，发送首条消息后不再提供切换入口。

## Implementation and limits

- Shadows only the native `forge-panel.worktree` list entry in `conversation.hero.options`, preserving its injected panel source. Registrations and subscriptions are disposed with the slot/plugin.
- Requires the native entry contract shipped with DSH rc.2. A future incompatible Forge API may need a plugin update. No DSH source changes, DOM rewriting, or Client package imports.
- Existing local branches only, newest commits first after the current branch. The list is bounded by 1 MiB output and a per-command deadline.
- Refreshing the native panel updates the current Session. Other Sessions may refresh their displayed branch later, even though their shared filesystem changed immediately.
- No settings or plugin-owned persistent storage. Git owns branch state; the Session log owns command/tool records. No optional detail image is shipped; Plugin Manager falls back to this README.

Original icon and code: MIT.
