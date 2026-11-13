# dsh-branch-switcher

Switch to an existing local Git branch from the branch chip on the **New Session** screen, without checking **New worktree** first. Once **New worktree** is checked, the native base-branch selector and creation flow work as before.

## Requirements

- DSH `>=0.2.2-rc.2 <0.3.0` and the Web GUI.
- **Change requests & worktrees** (`@deepseek-ai/dsh-experimental-forge-bundle`) enabled. This plugin does not enable it for you.
- A Git workspace with local branches, writable under the session's sandbox policy.

## Install locally

```bash
dsh plugin --profile web add link:$PWD/packages/branch-switcher
```

You can also use **Plugins → Add plugin** and select this package directory. If Plugin Manager reports `restart-required`, restart DSH before refreshing the GUI; a page refresh alone does not activate a pending Host change. The bundle is plain JavaScript and needs no build.

## Use

1. Create a new session and select a Git workspace.
2. Before sending the first message, click the branch name beside **New worktree**.
3. Search local branches, select one, and click **Switch branch**.
4. The chip updates once Git succeeds. Send a message to start on that branch, or check **New worktree** for the native isolated-worktree flow.

The menu closes on Escape or an outside click, supports keyboard focus and arrow keys, shows full branch names on hover, and shows Git failures inline with Retry. Switching is disabled in read-only mode. A detached HEAD is labeled as such.

**Switching changes the real shared directory. Other sessions and terminals using that checkout see the new branch too.** Uncommitted changes follow `git switch`: Git keeps compatible changes and refuses a switch that would overwrite them. The plugin does not fetch, create branches, stash, reset, merge, or force a switch. Git rejects branches already checked out in another worktree. Checkout hooks are disabled; configured Git content filters behave normally.

## Commands and agent access

The UI calls the authenticated session command API, with no custom filesystem endpoint:

```text
/branch-switcher {"action":"list"}
/branch-switcher {"action":"switch","branch":"feature/example","root":"/absolute/checkout","current":"main"}
```

The `branch_switcher` tool offers the same operations to agents. Pass the `root` and the nullable `current` returned by the listing. Switching works only in a blank, idle session, so an active agent can list branches but cannot switch the checkout it is running in. Both entry points call `BranchSwitcher.run`, use the session's working directory and sandbox, and return the same result or failure. Command lifecycle records stay out of model history; agent tool calls are recorded like any other tool call.

A switch runs as session maintenance, so a first message that arrives during the Git call waits until it finishes. The switch is refused once the session has started, in read-only mode, or when the session directory or current branch no longer matches the listing; refresh the list and retry. Git runs as an argument array through DSH's managed subprocess service, with bounded output, cancellation, and a 15-second deadline per command. It stays inside the session sandbox and never requests escalation.

## 中文

新建会话后，不必先勾选“新建工作树”，直接点击旁边的分支名，搜索并选择已有的本地分支，再点“切换分支”。成功后分支名随之更新。勾选“新建工作树”后，仍使用 DSH 原生的基准分支选择和创建流程。

切换的是真实的工作目录，共用这个目录的其他会话和终端也会看到新分支。未提交的改动遵循 Git 的规则，可能被覆盖时 Git 会拒绝切换，插件不会自动暂存或强制覆盖。只读模式下不能切换，发送首条消息后也不再提供切换入口。

## Implementation and limits

- The plugin shadows only the native `forge-panel.worktree` entry in `conversation.hero.options` and keeps its injected panel source. Registrations and subscriptions are disposed with the slot and the plugin.
- It relies on the native entry contract shipped with DSH rc.2, so an incompatible future Forge API may need a plugin update. It does not change DSH source, rewrite the DOM, or import Client packages.
- Only existing local branches are listed: the current branch first, then the rest by newest commit. Each Git command is limited to 1 MiB of output and its deadline.
- Refreshing the native panel updates the current session. Other sessions may show their branch later, even though the shared filesystem changed immediately.
- There are no settings and no plugin-owned storage. Git owns branch state, and the session log holds command and tool records. No detail image is shipped, so Plugin Manager shows this README.

Original icon and code: MIT.
