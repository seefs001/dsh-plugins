window.__ModuleLoader__.load({
  id: 'dsh-acp-workbench',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, CodeBlock, DiffBlock, DisclosureRow, Input, JsonBlock, PathLabel, ReadBlock, SearchBlock, SegmentedTabs, StateDot, Switch, Tag, TerminalBlock, WebBlock, diffTotals,
      IconBranchOutlineRegular, IconBrowseOutlineRegular, IconChecklistOutlineRegular, IconEditOutlineRegular, IconGlobeOutlineRegular, IconPlayOutlineRegular, IconSearchOutlineRegular, IconSparkleRegular,
      IconChevronDownOutlineRegular, IconChevronRightOutlineRegular, IconChevronUpOutlineRegular, IconInfoOutlineRegular, IconPlusOutlineRegular,
      IconStopFillRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const NS = 'acp-workbench'

    const en = {
      startWithPort: 'Run with loopback port', confirmPort: 'Assign a free port as PASEO_PORT and set HOST=127.0.0.1. Start this command? No proxy or public URL is created.', watchPort: 'Watch port', unwatchPort: 'Stop watching', portPending: 'Waiting for port', portCheckAgain: 'Confirming connection failure', portAccepts: 'TCP connection accepted', portRefused: 'TCP connection refused', portTimeout: 'No TCP response', portFailed: 'Port check unavailable', portHint: 'Checks the assigned loopback port, not HTTP responses or the identity of the listening process.',
      refreshComparison: 'Refresh comparison', commitScope: 'Branch commits', commitStart: 'Commit to review', commitEnd: 'Through commit', chooseCommit: 'Choose a commit', commitOnly: 'Just this commit', rangeSize: '{n} commits', commitHint: 'Shows Git history, not this agent’s turn. The patch starts at the first commit’s first parent and ends at the selected commit. Uncommitted changes are excluded.', noBranchCommits: 'There are no commits after this base. To look further back, choose an earlier base branch.', commitTruncated: 'Only the newest {n} commits are listed.', commitMissing: 'The selected commits are no longer in this list as one first-parent range. Choose a commit again.', commitHeadMoved: 'The branch head changed while reading commits. Refresh the comparison.', commitVersion: 'Committed file · {sha}',
      recordedFile: 'File on disk now', recordedLocation: 'The path and line come from the recorded call. The preview reads the current file, not its historical contents.', reportedHits: 'Go to search results ({n})', moreTargets: 'Show more locations', lineGone: 'Line {n} no longer exists in this file.', fileStart: 'Read from the first line', fileChanged: 'The file changed while you were reading it. Reopen its location to reload.',
      beforeFile: 'View old side', beforeAt: 'View old {path} at line {n}', beforePatch: 'Old lines in this patch', beforeWhole: 'Deleted text from this patch', beforeHint: 'Only captured lines are shown. Numbering is from the old file.', beforeFull: 'Read full old version', beforeNone: 'This patch has no old text lines.', beforeIndex: 'Old side · Git index', beforeCommit: 'Old side · commit {sha}', beforeSnapshot: 'Read-only Git text. This is not the current file.', beforeIndexHint: 'Read from the current Git index and checked against the comparison, not from disk.', beforeGap: 'Old lines {from}–{to} are not in the patch.', beforeLimited: 'Forge did not identify an exact old commit here. Only the captured patch lines are available.',
      reviewFile: 'View file', reviewIndex: 'Staged version (Git index)', reviewDisk: 'Current checkout file', reviewAt: 'View {path} at line {n}', reviewFull: 'Open in Files sidebar', reviewDeleted: 'Deleted in this comparison; there is no new side.', reviewStale: 'This file no longer matches the patch. Refresh the comparison.', reviewPath: 'Cannot locate this file in the reviewed checkout.', reviewEmpty: 'Empty file', reviewPatch: 'Copyable patch', reviewNext: 'Next lines', reviewPrev: 'Previous lines', reviewBack: 'Close file preview', reviewBinary: 'No text lines to navigate.',
      cliTasks: 'CLI tasks in this trace', cliTaskCount: '{n} launch calls', cliLaunchStatus: 'Launch call: {status}', cliTask: 'CLI task', cliOnly: 'View task', cliAll: 'Full trace', cliCalls: '{n} direct calls', cliProgress: 'Task update', cliInput: 'Task input', cliMedia: '{type} · see raw events', cliPreview: 'Preview {type}', cliNoMedia: 'The recorded content is unavailable.', cliLimit: 'Excerpt only · see raw events', cliScope: 'Direct activity reported by the CLI. This is not a DSH conversation.', cliOrigin: 'From {task}', cliMissing: 'Launch not in this trace: {task}', cliConflict: 'Conflicting task IDs',
      permitRequested: 'Permission requested', permitLive: 'Needs approval', permitAllowed: 'Allowed', permitAutomatic: 'Allowed by preset', permitDenied: 'Denied', permitExpired: 'Request expired', permitAnswered: 'Decision recorded',
      callView: 'Tool call display', compactCalls: 'Overview', detailedCalls: 'Individual calls', exploration: 'Exploration', readCount: 'Reads: {n}', searchCount: 'Searches: {n}', webCount: 'Web: {n}', distinctPaths: 'Distinct read paths: {n}', groupCalls: '{n} calls', 'call.cancelled': 'Cancelled',
      panel: 'ACP Workbench', panelHint: 'Start agents in a project and follow their work in DSH conversations.',
      schedules: 'Scheduled agents', schDescription: 'A delivery puts instructions in a DSH conversation. It does not mean the agent finished the work.', schNew: 'Create schedule', schName: 'Task name', schPrompt: 'Instructions at delivery', schTarget: 'Destination', schExisting: 'An existing conversation (heartbeat)', schOnce: 'Create a conversation on the first delivery', schFresh: 'A fresh conversation at every delivery', schChoose: 'Choose a conversation', schPreset: 'DSH agent preset', schDefault: 'Host default', schRouteHint: 'An existing conversation keeps its selected engine and checkout. New ones use the project directory and DSH preset, not an ACP launch profile.', schTiming: 'Repeat', schAfter: 'Once, after a delay', schEvery: 'At a fixed interval', schDaily: 'Daily at a local time', schCron: 'Cron in a time zone', schMinutes: 'Minutes', schZone: 'IANA time zone', schTime: 'Local time', schExpr: 'Cron (5 fields)', schConfirm: 'Arm this schedule? Each delivery may start a real agent turn.', schUnknown: 'No confirmation received. Refresh the list before trying again.', schEmpty: 'No tasks target this project.', schRefresh: 'Refresh schedules', schActive: 'Active', schPaused: 'Paused', schEnded: 'Ended', schNext: 'Next delivery', schDelivered: 'Last delivery', schQueued: 'Queued or running', schManage: 'Manage task', schPause: 'Pause', schResume: 'Resume', schRun: 'Deliver now', schRunConfirm: 'Deliver these instructions now? This may start a real agent turn.', schIncomplete: 'Enter a title, instructions, a valid time and an available destination.', schMissing: 'This task was removed or changed. Refresh before retrying.', schFloor: 'Can deliver again after', schBusy: 'Delivery is already queued, or the minimum delivery interval has not elapsed.', schCadence: 'Cadence', schHistory: 'Delivery history', schNoHistory: 'No saved deliveries yet.', schMore: 'Earlier deliveries', schPruned: 'Some older deliveries are unavailable.', schDelete: 'Delete task', schDeleteConfirm: 'Delete this task and its delivery history? Messages already delivered remain in their conversations.',
      termList: 'Session terminals', termRetry: 'Retry terminal list', termScope: 'Terminals retained by DSH for this conversation. Listing them does not attach a client.', termEmpty: 'No terminal is retained for this conversation.', termAgent: 'Started by agent', termUser: 'Started by user', termAgentControl: 'Agent control', termLost: 'Terminal roster disconnected.', termMissing: 'This terminal cannot be opened in its conversation.',
      scripts: 'Project scripts', scriptsHint: 'Commands in this checkout’s paseo.json run in the session sandbox. For services that use $PASEO_PORT, choose a loopback port at launch to check TCP readiness.', scriptNone: 'No named scripts in this checkout’s paseo.json.', scriptStart: 'Run', scriptStop: 'Stop process', scriptLog: 'Read output', scriptTerminal: 'Open terminal', scriptConfirm: 'Run this checkout’s command in a new DSH terminal?', stopScriptConfirm: 'Stop this script and close its terminal?', scriptService: 'Service', scriptTask: 'Script', runHere: 'Owner conversation', scriptUnavailable: 'Terminal no longer retained', scriptExited: 'Exited', scriptStopped: 'Stopped', scriptRunning: 'Running', scriptStarting: 'Starting', scriptFailed: 'Failed', scriptOwner: 'Under manual control', noOutput: 'No output retained', scriptRefresh: 'Refresh scripts', scriptLoading: 'Reading scripts…', scriptExit: 'Exit code',
      projects: 'Projects', addProject: 'Add directory', chooseProject: 'Workspace', agents: 'Conversations', newAgent: 'New agent', local: 'Project directory', worktree: 'Isolated worktree', checkout: 'Isolation', branchName: 'New branch (optional)', baseRef: 'Start from (default: HEAD)', agentName: 'Conversation title (optional)', createAgent: 'Create and open chat', launchHint: 'Creates a separate conversation. No prompt is sent.', noProject: 'Add a project directory to start an agent.', noAgents: 'No conversations here yet.', projectFailed: 'Setup stopped. The conversation was kept. No prompt was sent.', nativeChat: 'DSH conversation', cliDefault: 'CLI default', projectArchive: 'Archived', profiles: 'Launch profile', customLaunch: 'Custom settings', profileName: 'Profile name', saveProfile: 'Save launch settings', removeProfile: 'Delete profile', removeProfileConfirm: 'Delete this launch profile? Existing conversations are unchanged.', unavailableProfile: 'This profile is unavailable. Check its provider, model and worktree support.', effortChoice: 'Reasoning effort', projectTools: 'Workspace tools', filesTab: 'Files', terminalTab: 'New terminal', changesTab: 'Git changes', archiveChat: 'Archive conversation', archiveChatConfirm: 'Archive this DSH conversation? DSH may reclaim an unused, clean managed worktree. Active work will not be stopped.', restoreChat: 'Restore conversation',
      shareCheckout: 'Start another agent here', shareHeading: 'Agents in this worktree', sharedCheckout: 'Shared worktree', shareOwner: 'Creator', shareCurrent: 'Selected conversation', shareOpen: 'Create and open conversation', shareDismiss: 'Close form', switchShared: 'Switch agent in this worktree', noSharedPeers: 'No other active participants in this checkout.', shareHint: 'These agents edit the same files. Each has its own conversation, CLI history and approvals. No history or prompt will be copied.', shareArchive: 'Archive this participant? Its checkout belongs to a different conversation. Archiving this participant will not reclaim that shared checkout.', sharePartial: 'This conversation did not finish joining the checkout. Start a new conversation from an active participant.',
      treeInspect: 'Working directory', treeActual: 'Effective directory', treeSource: 'Source checkout', treeRecorded: 'Recorded branch', treeBase: 'Base commit', treeOwned: 'Created here', treeInherited: 'Inherited reference', treeOther: 'Not the current directory', treeDirectory: 'Directory exists', treeMissing: 'Directory missing', treeIncomplete: 'Directory present without a linked-checkout marker', treeOccupied: 'Occupied by a non-directory or symlink', treeEmpty: 'No managed worktree creation in this session’s history.', treeScheduled: 'Checking whether the checkout can be reclaimed…', treeRetained: 'DSH kept the checkout.', treeRemoved: 'DSH removed the checkout, not the branch.', treeFailed: 'Cleanup failed. A partial directory may remain; inspect it before continuing.', treeNoReceipt: 'No cleanup receipt from this Host lifetime. Directory state is shown separately.', treeRestoreFirst: 'Unarchive the conversation first. That does not rebuild the checkout.', treeRestore: 'Rebuild missing worktree', treeRestoreAsk: 'Rebuild the missing directory from its recorded branch? If the branch is gone DSH recreates it at the base commit. This does not recover uncommitted work or change the session’s directory.', treeRebuilt: 'Restored the checkout from its existing branch.', treeRecreated: 'The original branch was gone. DSH recreated it at the base commit, not at any later tip.', treeBusy: 'Rebuilding the worktree…', treePolicy: 'The conversation must be idle and writable to rebuild its checkout.', treeArchiveRisk: 'Git-visible modified and untracked files or another session using this worktree keep it in place. Ignored files and changes hidden from Git status are not protected. To keep those, cancel and back them up or enable DSH’s retain-on-archive setting first.',
      projectResults: 'Project review', unseen: 'Awaiting review', reviewed: 'Reviewed', legacyReview: 'Earlier run', markSeen: 'Mark reviewed', resultHistory: 'All results', resultTurn: 'Turn {n}', previousPage: 'Previous page', nextPage: 'Next page', noResults: 'No results to review.', noAllResults: 'No finished ACP runs in this project yet.', reviewHint: 'Results belong to individual runs. Reading a card does not dismiss it or answer a request.', runTrace: 'Run trace', checkoutDiff: 'Checkout changes', gitScope: 'Compare', uncommitted: 'Working tree vs HEAD', staged: 'Staged', unstaged: 'Unstaged', branchDiff: 'Branch vs base', baseBranch: 'Base branch', autoBase: 'Forge default', findBase: 'Find a branch', checkoutHint: 'Live Git state for this conversation’s current checkout. It may include other agents’ work and is not a patch for this run.', diffClean: 'No changes in this comparison.', diffOmitted: '{n} untracked files omitted by Forge.', binaryDiff: 'Binary file', largeDiff: 'File exceeds the diff limit', noHunks: 'No text hunks', moreLines: 'Show more lines', moreFiles: 'Show more files', projectRequests: 'Waiting for your response', checkoutUnavailable: 'Git changes are unavailable.',
      attention: 'Needs you', working: 'In progress', review: 'Review', recent: 'Recent', history: 'History', all: 'Current',
      attentionHint: 'A response here goes to the waiting CLI. Opening the conversation does not answer it.',
      recoveryHint: 'Check the last turn before sending anything else. Reconnecting does not resend your message.',
      firstTurn: 'Send your first message in the composer to get started. The CLI uses its own tools and file access.', resumeHint: 'Your external context is saved. Reconnect without sending a task, or continue with a new message.',
      readyAfterError: 'The connection is ready. Review the last turn, then use the composer for a new instruction.', archivedHint: 'This binding is archived. Restore it to continue using its context.',
      openConversation: 'Open conversation', openRoot: 'Open parent tree', retry: 'Refresh', connectingFeed: 'Connecting…',
      cliOptions: 'CLI settings', hideOptions: 'Close CLI settings', connectOnly: 'Connect without sending a message',
      forkHere: 'Continue in a copy', forkHint: 'A copy starts from the latest history saved by the CLI. It does not move the original session or send a prompt.', forkSource: 'Copied from CLI history', forkReady: 'Your copy is saved. Send the next message here to work in the copy, or connect without sending a task.', resumeExisting: 'Continue a CLI session', resumeHere: 'Continue here', closeHistory: 'Hide sessions',
      importedReady: 'Connected to “{name}”. Your next message continues that conversation.', previousMessages: 'Previous CLI messages', hidePrevious: 'Hide previous messages', noReplay: 'No earlier messages returned in this page of CLI history.',
      resumePick: 'Choose a session from this project. Opening it sends no message. Your next message continues the CLI thread without copying the earlier DSH conversation.',
      firstUse: 'Choose an ACP model in the DSH model picker and send a message. Its activity will appear here.',
      setup: 'Manage providers', answeredByPreset: 'Full access · automatic', answeredByUser: 'Human response',
      quietChildren: 'Other subagents ({n})', requestCount: '{n} waiting',
      scopeOnce: 'Full access can grant one-time requests. Persistent choices still need you.',
      tabProviders: 'Providers', tabRecords: 'Activity', live: 'Live', offline: 'Reconnecting…',
      engine: 'ACP engine', useEngine: 'Run this conversation through {name}', showInfo: 'About ACP engines', hideInfo: 'Hide details',
      engineHint: 'Choose a specific model under an ACP provider in the normal model picker. Keep using the normal composer, attachments and Stop button; replies stay in this timeline.',
      delegateHint: 'To delegate from a DSH model, use subagent_cursor, subagent_antigravity or subagent_acp_claude_code. Continue a child with send_message.',
      warning: 'External agents use their own login, tools, and file access outside the DSH sandbox. Approvals apply only to requests the CLI sends.',
      engineOn: '{name} · ACP', notConnected: 'Connects on your next message',
      connect: 'Connect', reconnect: 'Reconnect', disconnect: 'Disconnect', cancelConnect: 'Cancel',
      newContext: 'New external context', newContextConfirm: 'Start a new external conversation from the next message? DSH history and earlier execution records are kept.',
      restoreTo: 'Back to {model}', restoreTitle: 'Switch this conversation back to the DSH model it used before',
      restoreHint: 'No earlier DSH model was saved for this conversation. Use the model picker to switch back.',
      moreOptions: 'Show engine options', lessOptions: 'Hide engine options', switchEngine: 'Switch engine',
      connection: 'Connection', configuration: 'Configuration', commands: 'CLI commands', usage: 'Usage', directory: 'Directory',
      noConfig: 'Connect to load the models, modes and options this CLI advertises.',
      cliCommandGroup: 'CLI · {name}', cliCommandStale: 'Select this CLI command again from the / menu. Its original selection is no longer current.',
      model: 'Model', mode: 'Mode', commandPick: 'Command…', commandArgs: 'Arguments', commandRun: 'Run',
      commandHint: 'Sent to the external CLI as a normal message. Slash commands typed in the composer still belong to DSH.',
      'notice.feed': 'CLI session notices', 'notice.recent': 'Up to eight off-turn notices received on this connection, newest first. These are not permission requests.', 'notice.info': 'Info', 'notice.warning': 'Warning', 'notice.error': 'Error', 'notice.level': 'CLI · {level}', 'notice.turn': 'Received during this prompt', 'notice.connect': 'Received while connecting', 'notice.session': 'Received between prompts', 'notice.fromTask': 'CLI task: {id}', 'notice.unavailable': 'Could not find this notice in the local record.',
      'compact.late': 'Updated by the CLI after this turn.', 'compact.title': 'CLI context compaction', 'compact.replay': 'Replayed CLI compaction', 'compact.summary': 'Reported summary', 'compact.noSummary': 'No summary in these reports.', 'compact.in_progress': 'Compacting', 'compact.unsettled': 'Last reported in progress', 'compact.completed': 'Compacted', 'compact.failed': 'Compaction failed', 'compact.cancelled': 'Compaction cancelled', 'compact.automatic': 'Automatic', 'compact.manual': 'Manual', 'compact.idle': 'While idle', 'compact.preTokens': 'Before: {n} tokens', 'compact.postTokens': 'After: {n} tokens', 'compact.durationMs': 'Duration: {n} ms', 'compact.attachment': 'Preview attachment · {type}', 'compact.noMedia': 'The recorded attachment is unavailable.',
      contextRecent: 'CLI context · last report', contextRecorded: 'Reported CLI context', contextReplay: 'Context in replayed history', ctxAt: 'Reported at {time}', ctxScope: 'Context window usage, not billed tokens or quota.', ctxCost: 'Cumulative session cost: {amount} {unit}', ctxTotals: 'CLI session token totals', ctxTotalsScope: 'Cumulative session totals reported when this prompt ended (not a single-turn cost).', ctxTotal: 'Total', ctxInput: 'Input', ctxOutput: 'Output', ctxCacheRead: 'Cache read', ctxCacheWrite: 'Cache write', ctxThought: 'Reasoning', ctxModel: 'Reported model: {model}',
      usageContext: 'Context {used} / {size} ({percent}%)', usageCost: 'Cost {amount} {currency}',
      unknownUsage: 'Not reported by this agent (ACP does not expose account quota).',
      children: 'ACP subagents', stop: 'Stop', pending: 'Needs you', expand: 'Show trace', collapse: 'Hide trace',
      'state.starting': 'Connecting', 'state.idle': 'Ready', 'state.running': 'Running', 'state.waiting': 'Needs your response',
      'state.canceling': 'Stopping', 'state.disconnected': 'Disconnected', 'state.error': 'Error', 'state.preparing': 'Preparing',
      'state.completed': 'Completed', 'state.interrupted': 'Interrupted', 'state.failed': 'Failed',
      trace: '{name} execution', traceTools: '{n} tool calls', traceTool: '1 tool call', traceFiles: '{n} files in diffs', traceFile: '1 file in diffs',
      replyCollapsed: '{name} reply collapsed', replyLines: '{n} lines', replyImages: '{n} images', collapseReply: 'Collapse result', expandReply: 'Expand result', collapseExcerpt: 'Collapse reply', expandExcerpt: 'Show full excerpt', collapseTrace: 'Collapse trace',
      handoff: 'DSH context handed off', sameContext: 'Same external context',
      viewTimeline: 'Timeline', viewRaw: 'Raw events', older: 'Load earlier', loading: 'Loading…',
      noEvents: 'No execution events yet.', noActivity: 'No tool activity in this turn.',
      stderr: 'CLI log output', stopReason: 'Turn ended: {reason}', turnError: 'Agent error: {message}', configError: 'Setting refused: {message}',
      planItems: 'Task checklist', planDocument: 'Plan document', planRemoved: 'Plan removed by CLI', planRecorded: 'Content reported by the CLI at this point in the conversation.', planOpenFile: 'View current file', planDone: 'Done', planDoing: 'In progress', planPending: 'Pending', planEmpty: 'No listed steps.', morePlanItems: 'Show more steps',
      plan: 'Plan', highPriority: 'High', planProgress: '{done} of {total}',
      'call.read': 'Read file', 'call.search': 'Search', 'call.edit': 'Edit file', 'call.write': 'Write file', writeView: 'Write details', writeInput: 'Requested file content', writePatch: 'Reported patch', writeEmpty: 'The requested content is empty.', 'call.delete': 'Delete', 'call.move': 'Move',
      'call.execute': 'Terminal', 'call.fetch': 'Web', 'call.think': 'Reasoning', 'call.switch_mode': 'Switch mode',
      'call.pending': 'Queued', 'call.in_progress': 'Running', 'call.unfinished': 'No final status', 'call.completed': 'Completed', 'call.failed': 'Failed',
      'patch.launch': 'Launch preview', 'patch.update': 'Patch from a CLI update', 'patch.completed': 'Patch in completion report', 'patch.failed': 'Patch in failure report', 'patch.permission': 'Patch in this permission request', 'patch.recorded': 'Reported patch', patchCurrent: 'Open current file at a reported location', patchFiles: 'Patch files ({n})', patchAll: 'All reported fragments', patchParts: '{n} fragments', patchNoParts: 'No structured text diff for this file.', 'patch.add': 'Add file', 'patch.delete': 'Delete file', 'patch.move': 'Move file', 'patch.updateFile': 'Edit file',
      webSearch: 'Web search', webPage: 'Fetch page', webFind: 'Find in page', webQuery: 'Reported queries', webAddress: 'Page address', webPattern: 'Find on page', webPrompt: 'Requested extraction', webOffset: 'Starting character offset', webAllow: 'Allowed domains', webDeny: 'Blocked domains', webPreview: 'Request preview', webResponse: 'Tool report', webRaw: 'Raw tool output', webUpdate: 'Update from the tool', webFailure: 'Reported failure', webNoReport: 'No result text accompanied this call.', webMore: 'Show more sources ({n} remaining)', webSourceCount: '{n} reported sources',
      fileByName: 'Find by name', fileByDirectory: 'Browse folders', dirRoot: 'Checkout root', dirBack: 'Back to folder', dirHint: 'Lists one folder at a time. Dotfiles are hidden; Git ignore rules do not filter this view.', dirRefresh: 'Refresh folder', dirRestart: 'Reopen current checkout root', dirCount: '{n} visible entries', dirEmpty: 'No visible entries returned.', dirPartial: 'DSH returned only part of this directory.', dirFolder: 'Folder', dirFile: 'File', dirOther: 'Other', dirBytes: '{n} B', dirMore: 'Show more entries', fileRefresh: 'Repeat search',
      findFile: 'Find a file', fileQuery: 'File name or path', findFileHint: 'Search names in this conversation’s current directory. Hidden and Git-ignored files are excluded.', foundFiles: '{n} files returned', fileHitsLimit: 'Result limit reached; narrow the search', fileScanCut: 'Only part of the directory was searched', moreFileHits: 'Show more files', fileHitsBack: 'Back to file results',
      'batch.archive': 'Archive several conversations', 'batch.restore': 'Restore several conversations', 'batch.confirm': 'Review selected conversations', 'batch.choose': 'Check at least one eligible conversation first.', 'batch.archiveNote': 'Select conversations in this project. DSH removes their pins. Active sessions and sessions with a recorded worktree are skipped. No activity is stopped.', 'batch.restoreNote': 'Restore only the checked conversations to this project. This does not open them, start an agent, restore pins or rebuild a worktree.', 'batch.active': 'Active or awaiting input', 'batch.denied': 'No permission', 'batch.changed': 'Membership or archive state changed; refresh and check again.', 'batch.tree': 'Use the individual archive action to review this worktree.', 'batch.result': 'Results by conversation', 'batch.archived': 'Archived', 'batch.restored': 'Restored', 'batch.skipped': 'Not changed',
      findAgent: 'Find conversations', findAgentHint: 'Name, project, engine, directory or DSH session ID', hereProjects: 'This project', everyProject: 'All projects', finderScope: 'Search scope', onlyPinned: 'Pinned only', isPinned: 'Pinned', finderCount: '{n} conversations', finderNoMatch: 'No conversations match these filters.', finderReset: 'Clear filters', projectRename: 'Rename project', projectTitle: 'Project name', sameProjectTitle: 'Another project already has this name.', cancelEdit: 'Cancel', agentMenu: 'Actions for conversation {name}', archivedOpen: 'Restore this conversation before opening it.',
      'call.mcp': 'MCP tool', mcpArgs: 'Arguments', mcpOutput: 'Reported output', mcpContent: 'Display content', mcpStructured: 'Structured result', mcpRequest: 'Request details', mcpDisplayArgs: 'Arguments as displayed by the request', mcpAbsent: 'Raw arguments not provided', mcpTable: 'Records with the same fields', mcpEmpty: 'The tool returned no content blocks.', mcpEmptyDisplay: 'The CLI supplied no display blocks here.', mcpFields: '{n} fields', mcpItems: '{n} items', mcpMore: 'Show more', mcpLess: 'Collapse', mcpSource: 'MCP server',
      streamReport: 'Reported terminal output', finalReport: 'Output reported by the tool', outputView: 'Command output', outputTail: 'Earlier output omitted; showing the last 32 Ki characters.', outputPartial: 'Unknown packet format: showing the latest report and subsequent explicit deltas.', awaitingExit: 'No terminal exit reported',
      exitCode: 'Exit {n}', inspectData: 'Technical details', proposed: 'Requested change', imageResult: 'Tool result image',
      lineNumber: 'Line {n}', linesReturned: '{n} lines returned', pathsReturned: '{n} paths', hitsReturned: '{n} matches · {files} files', noHits: 'No results',
      'decision.accepted': 'Accepted', 'decision.rejected': 'Rejected', 'decision.cancelled': 'Cancelled', 'decision.skipped': 'Skipped', 'decision.answered': 'Answered',
      resource: 'Resource', noExit: 'Exit code not reported', noShellOutput: 'No output reported', terminalSignal: 'Signal {signal}', pathMore: '+{n} more',
      clearField: 'Clear selection', form: 'Question from the CLI', formOptional: 'Optional', formRequired: 'Required', formSubmit: 'Submit answers', formDecline: 'Decline to answer', formPreview: 'Preview option', formHelp: 'Only submitted fields go to this CLI. Do not enter passwords or tokens.', formMin: 'Minimum: {n}', formMax: 'Maximum: {n}', 'form.accept': 'Answers submitted', 'form.decline': 'Declined to answer', 'form.cancel': 'Dismissed', formWithdrawn: 'Withdrawn by the CLI',
      permission: 'Permission request', question: 'Question from the agent', 'kind.plan': 'Plan for approval',
      permitLaunch: 'Inspect original tool call', permitEarlier: 'Reported when the tool started. These are not the terms of this permission request.', permitEmpty: 'The CLI did not include arguments, file locations or a preview in this request.', permitPast: 'Inspect permission request', permitReadOnly: 'Recorded request · read only', permitUnavailable: 'The matching permission record is unavailable.', permitCallId: 'Call ID', permitCwd: 'CLI directory', permitOptions: 'Choices offered by the CLI', permitScopeOnce: 'This request only', permitScopeRemember: 'May apply to later requests', permitGrant: 'Allow', permitRefuse: 'Deny', permitSelection: 'Recorded decision: {choice}', permitAutoSelection: 'Preset decision: {choice}',
      permanent: 'An “always” choice may be remembered by the CLI for later requests.',
      approve: 'Approve plan', reject: 'Reject', rejectReason: 'Reason (optional)', answer: 'Submit answers', skip: 'Skip', dismiss: 'Cancel request',
      'event.interaction': 'Asked: {title}', 'event.answered': 'Response sent', 'event.expired': 'Request expired',
      input: 'Input', output: 'Output', terminal: 'Terminal {id}', tool: 'Tool call',
      user: 'You', assistant: 'Agent', thinking: 'Reasoning', replay: 'History replay',
      truncated: '… {n} characters in total', copy: 'Copy', copied: 'Copied', wrap: 'Wrap lines', unwrap: 'Do not wrap', code: 'Code',
      expandLines: 'Show {n} more lines', collapseLines: 'Show less', expandLinesAria: 'Show {n} hidden lines', collapseLinesAria: 'Hide expanded lines',
      providerList: 'Providers', addProvider: 'New provider', editProvider: 'Edit provider', newProviderTitle: 'New provider',
      fieldId: 'ID', fieldLabel: 'Display name', fieldCommand: 'Executable', fieldCommandHint: 'Absolute path or a name on PATH.',
      fieldArgs: 'Arguments', fieldArgsHint: 'JSON array of strings, for example ["acp"]. Never put credentials here.',
      save: 'Save', saved: 'Saved', remove: 'Remove', removeConfirm: 'Remove this provider configuration? Its records are kept.',
      argsInvalid: 'Arguments must be a JSON array of strings.',
      providerHint: 'Log in with the CLI in a terminal first. Saving never starts a process; changes apply to the next connection.',
      check: 'Check this provider', checkHint: 'Starts the CLI in the directory and runs ACP initialize only. No task is sent.',
      cwd: 'Working directory', cwdPlaceholder: '/absolute/path/to/project',
      diagnose: 'Check capabilities', discover: 'Find CLI sessions', capabilities: 'Capabilities', agent: 'Agent', protocol: 'Protocol',
      refreshModels: 'Refresh models', modelsHint: 'Creates an empty ACP session to read candidate models. No task is sent and your model picker stays unchanged.',
      modelsLoaded: '{n} candidate models found.', modelPickerHint: 'Choose this conversation’s model in the normal DSH model picker.',
      visibleModels: 'Models in the picker', modelSelectionHint: 'Check the models you want to show, then save. CLI default is always available.',
      saveModels: 'Save model selection', modelsSaved: 'Model picker updated.', noModels: 'Refresh models to load the choices.',
      modelInfoHint: 'CLI-reported details follow the selected models into the picker. Unknown capacities are not filled in. Use the picker’s reasoning control when advertised.',
      modelContext: 'Context: {n} tokens', modelOutput: 'Output limit: {n} tokens', modelInput: 'Input: {types}',
      modelEfforts: 'Reasoning: {levels}', modelInfoUnknown: 'No model details advertised', modalityText: 'text', modalityImage: 'image',
      supported: 'Advertised', unsupported: 'Not supported', unreported: 'Not reported', authMethods: 'Sign-in methods', rawResult: 'Raw result', none: 'None advertised',
      'cap.loadSession': 'Resume sessions', 'cap.image': 'Image input', 'cap.audio': 'Audio input', 'cap.embeddedContext': 'Embedded context',
      'cap.list': 'Session list', 'cap.mcpHttp': 'MCP over HTTP', 'cap.mcpSse': 'MCP over SSE',
      discovered: 'CLI sessions in this directory', import: 'Import', more: 'More', noDiscovered: 'No sessions found.',
      importHint: 'Importing adds a local record only; connect it to load the conversation.',
      loginHint: 'If sign-in fails, run the CLI login command in a terminal, then reconnect.',
      search: 'Search name, provider, directory or session ID', showArchived: 'Show archived', noRecords: 'No execution records yet.', noMatch: 'No records match.',
      nativeTag: 'DSH conversation', childTag: 'Subagent', standaloneTag: 'Standalone', retiredTag: 'Retired', archivedTag: 'Archived',
      pickRecord: 'Select a record to inspect its history.', remoteId: 'Remote session', dshSession: 'DSH session', updated: 'Updated', provider: 'Provider',
      rename: 'Rename', archive: 'Archive', unarchive: 'Restore', stopTurn: 'Stop turn', back: 'All records',
      archiveHint: 'Disconnect before archiving. Archiving never deletes workspace files or CLI history.',
      nativeReadOnly: 'This record belongs to a DSH conversation. Send messages from that conversation.',
      storageError: 'History could not be saved: {message}',
    }
    const zh = {
      panel: 'ACP 工作台', panelHint: '在项目里启动多个 Agent，回到各自的 DSH 会话继续。',
      schedules: '定时任务', schDescription: '到点后 DSH 会把指令发进对话（只负责投递，不跟踪任务是否做完）。', schNew: '创建定时任务', schName: '任务名称', schPrompt: '到期发送的指令', schTarget: '投递目标', schExisting: '已有会话（定时唤回）', schOnce: '首次到期建一个会话，后续复用', schFresh: '每次到期都新建会话', schChoose: '选择会话', schPreset: 'DSH Agent 预设', schDefault: 'Host 默认预设', schRouteHint: '已有会话沿用原来的引擎和目录；新建会话则走项目目录和 DSH 预设，不套用 ACP 启动配置。', schTiming: '触发方式', schAfter: '延时一次', schEvery: '固定间隔', schDaily: '每天定时', schCron: 'Cron 表达式', schMinutes: '分钟', schZone: 'IANA 时区', schTime: '当地时间', schExpr: '五字段 Cron', schConfirm: '启用这个定时任务？每次到点都会把指令发给 Agent 执行。', schUnknown: '没收到操作回执，刷新列表确认一下再决定要不要重试。', schEmpty: '这个项目还没有定时任务。', schRefresh: '刷新任务', schActive: '已启用', schPaused: '已暂停', schEnded: '已结束', schNext: '下次投递', schDelivered: '最近投递', schQueued: '已入队或还在执行', schManage: '管理任务', schPause: '暂停', schResume: '恢复', schRun: '立即投递', schRunConfirm: '现在就把这条指令发出去？会直接触发 Agent。', schIncomplete: '请填好任务名称、指令、有效时间，并选好投递目标。', schMissing: '任务可能已被删除或改动，刷新一下再试。', schFloor: '最早再次投递', schBusy: '上次投递还没结束，或还没到下一次允许触发的时间。', schCadence: '触发规则', schHistory: '投递历史', schNoHistory: '暂无投递记录。', schMore: '更早的投递', schPruned: '部分早期记录已不可用。', schDelete: '删除任务', schDeleteConfirm: '删掉这个任务和投递历史？已经发进对话的消息不会撤回。',
      termList: '会话终端', termRetry: '重新连接列表', termScope: 'DSH 为本会话保留的终端。查看列表不会连接终端。', termEmpty: '本会话没有保留的终端。', termAgent: 'Agent 启动', termUser: '用户启动', termAgentControl: 'Agent 控制', termLost: '终端列表已断开。', termMissing: '无法在所属会话中打开这个终端。',
      scripts: '项目脚本', scriptsHint: '命令来自当前工作目录的 paseo.json，在会话沙箱内运行。使用 $PASEO_PORT 的服务可选择带端口启动，随后检查 TCP 是否可连接。', scriptNone: '这个工作目录的 paseo.json 没有定义脚本。', scriptStart: '运行', scriptStop: '停止进程', scriptLog: '查看输出', scriptTerminal: '打开终端', scriptConfirm: '在新的 DSH 终端中运行这条命令？', stopScriptConfirm: '停止此脚本并关闭它的终端？', scriptService: '服务', scriptTask: '脚本', runHere: '打开所属会话', scriptUnavailable: '终端已不再保留', scriptExited: '已退出', scriptStopped: '已停止', scriptRunning: '运行中', scriptStarting: '启动中', scriptFailed: '失败', scriptOwner: '由用户接管', noOutput: '暂无保留的输出', scriptRefresh: '刷新脚本', scriptLoading: '正在读取脚本…', scriptExit: '退出码',
      projects: '项目', addProject: '添加目录', chooseProject: '工作区', agents: '项目会话', newAgent: '新建 Agent', local: '使用项目目录', worktree: '独立工作树', checkout: '隔离方式', branchName: '新分支名（可选）', baseRef: '起点（默认 HEAD）', agentName: '会话名称（可选）', createAgent: '创建并打开聊天', launchHint: '每次创建独立会话，第一条消息由你在聊天输入框发送。', noProject: '先添加项目目录，再启动 Agent。', noAgents: '这里还没有会话。', projectFailed: '准备未完成。DSH 会话已保留，没有发送消息。', nativeChat: 'DSH 会话', cliDefault: 'CLI 默认', projectArchive: '已归档', profiles: '启动配置', customLaunch: '自定义设置', profileName: '配置名称', saveProfile: '保存启动配置', removeProfile: '删除配置', removeProfileConfirm: '删除这套启动配置？已有会话不受影响。', unavailableProfile: '这套启动配置目前不可用，请核对提供方、模型和工作树能力。', effortChoice: '思考强度', projectTools: '工作区工具', filesTab: '文件', terminalTab: '新建终端', changesTab: 'Git 改动', archiveChat: '归档会话', archiveChatConfirm: '归档这个 DSH 会话？DSH 可能回收未使用且干净的托管工作树。不会停止运行中的任务。', restoreChat: '恢复会话',
      shareCheckout: '在这里新建 Agent', shareHeading: '此工作树的 Agent', sharedCheckout: '共享工作树', shareOwner: '创建者', shareCurrent: '所选会话', shareOpen: '创建并打开会话', shareDismiss: '收起', switchShared: '切换同工作树 Agent', noSharedPeers: '当前工作树没有其他未归档的参与会话。', shareHint: '这些 Agent 直接编辑同一份文件。每个 Agent 的对话、CLI 历史和审批各自独立。新会话不会复制历史，也不会自动发送提示。', shareArchive: '归档这个参与会话？它不是共享工作树的创建者，归档此会话不会回收该工作树。', sharePartial: '此会话尚未成功加入工作树。请从有效的参与会话重新创建。',
      startWithPort: '带回环端口启动', confirmPort: '将空闲端口写入 PASEO_PORT，设置 HOST=127.0.0.1。启动这条命令？不会创建代理或公网 URL。', watchPort: '监测端口', unwatchPort: '结束监测', portPending: '等待端口就绪', portCheckAgain: '连接失败，等待复查', portAccepts: 'TCP 已接通', portRefused: 'TCP 连接被拒绝', portTimeout: 'TCP 无响应', portFailed: '无法检查端口', portHint: '只检查分配的回环端口，不验证 HTTP 响应或监听进程身份。',
      refreshComparison: '刷新比较', commitScope: '分支上的提交', commitStart: '选择提交', commitEnd: '比较到', chooseCommit: '请选择提交', commitOnly: '仅此提交', rangeSize: '{n} 次提交', commitHint: '这里显示 Git 历史，不代表本轮 Agent 的改动。补丁从起始提交的第一父提交比较到所选结束提交，不含未提交的修改。', noBranchCommits: '此基线到 HEAD 没有提交。可以选择更早的基线分支。', commitTruncated: '只列出最近 {n} 个提交。', commitMissing: '所选提交已不在列表中，或不再构成连续的第一父提交范围，请重新选择。', commitHeadMoved: '读取提交时分支的 HEAD 已改变，请刷新比较。', commitVersion: '提交中的文件 · {sha}',
      recordedFile: '当前磁盘文件', recordedLocation: '按当时记录的路径和行号打开当前磁盘上的文件（不是历史快照）。', reportedHits: '定位搜索结果（{n}）', moreTargets: '显示更多位置', lineGone: '当前文件里已经没有第 {n} 行了。', fileStart: '从第一行读', fileChanged: '刚看的时候文件又变了，重新点一下文件位置吧。',
      beforeFile: '查看旧版本', beforeAt: '查看旧版 {path} 第 {n} 行', beforePatch: '补丁中的旧行', beforeWhole: '补丁中的完整删除文本', beforeHint: '只显示补丁记录的行，行号来自旧文件。', beforeFull: '读取完整旧版本', beforeNone: '补丁没有记录旧文本行。', beforeIndex: '旧版本 · Git 索引', beforeCommit: '旧版本 · 提交 {sha}', beforeSnapshot: '这是只读的 Git 文本，不是当前磁盘文件。', beforeIndexHint: '完整文本来自打开时的 Git 索引，已和补丁核对，不是磁盘文件。', beforeGap: '补丁未包含旧版第 {from} 至 {to} 行。', beforeLimited: 'Forge 未提供确定的旧提交，只能查看补丁已记录的旧行。',
      reviewFile: '查看文件', reviewIndex: '已暂存版本（Git 索引）', reviewDisk: '当前工作树文件', reviewAt: '查看 {path} 第 {n} 行', reviewFull: '在文件侧栏打开', reviewDeleted: '文件在这份比较中被删除，没有新侧内容。', reviewStale: '文件与这份补丁不再一致，请刷新比较。', reviewPath: '无法在审阅的工作树中定位此文件。', reviewEmpty: '空文件', reviewPatch: '可复制的补丁', reviewNext: '后续行', reviewPrev: '前面的行', reviewBack: '关闭文件预览', reviewBinary: '没有可定位的文本行。',
      cliTasks: '本轮 CLI 子任务', cliTaskCount: '{n} 个启动调用', cliLaunchStatus: '启动调用：{status}', cliTask: 'CLI 子任务', cliOnly: '查看子任务', cliAll: '完整轨迹', cliCalls: '{n} 次直接调用', cliProgress: '任务进展', cliInput: '任务输入', cliMedia: '{type} · 见原始事件', cliPreview: '预览 {type}', cliNoMedia: '该条记录的内容不可用。', cliLimit: '仅显示摘录，全文见原始事件', cliScope: '仅显示 CLI 报告给此任务的直接活动。这里不是可发消息的 DSH 会话。', cliOrigin: '来自 {task}', cliMissing: '本段未见启动调用：{task}', cliConflict: '子任务归属冲突',
      permitRequested: '已请求权限', permitLive: '等你审批', permitAllowed: '已允许', permitAutomatic: '预设自动允许', permitDenied: '已拒绝', permitExpired: '请求已失效', permitAnswered: '已记录决定',
      callView: '工具调用视图', compactCalls: '概览', detailedCalls: '逐条', exploration: '查阅记录', readCount: '读取 {n} 次', searchCount: '搜索 {n} 次', webCount: '网页查询 {n} 次', distinctPaths: '读取路径 {n} 个', groupCalls: '{n} 次调用', 'call.cancelled': '已取消',
      treeInspect: '工作目录', treeActual: '生效目录', treeSource: '来源仓库', treeRecorded: '记录的分支', treeBase: '起点提交', treeOwned: '本会话创建', treeInherited: '继承的工作树', treeOther: '不是当前目录', treeDirectory: '目录存在', treeMissing: '目录缺失', treeIncomplete: '目录存在，但缺少链接工作树标记', treeOccupied: '路径被其他文件或符号链接占用', treeEmpty: '该会话没有托管工作树的创建记录。', treeScheduled: 'DSH 正在检查是否可以回收工作树…', treeRetained: 'DSH 保留了工作树。', treeRemoved: 'DSH 已回收工作树目录，未删除分支。', treeFailed: '回收失败，可能留下不完整目录。请检查后再继续。', treeNoReceipt: '本次 Host 运行期间没有可用的回收回执。目录现状另列。', treeRestoreFirst: '请先恢复会话。恢复会话本身不会重建目录。', treeRestore: '重建缺失的工作树', treeRestoreAsk: '按记录的分支重建缺失目录？如果原分支已不存在，DSH 将从起点提交重建分支，无法找回未提交的文件，也不会切换会话目录。', treeRebuilt: '已从现有分支恢复工作树目录。', treeRecreated: '原分支已不存在，已从起点提交重建，而不是从后续提交恢复。', treeBusy: '工作树重建中…', treePolicy: '重建需要会话空闲，且会话策略允许写入。', treeArchiveRisk: 'Git 可见的修改、未跟踪文件或另一会话仍在使用该工作树，都可阻止回收。忽略规则或索引标记隐藏的文件不受此保护。需要保留时，请取消并先备份，或在 DSH 设置中启用归档时保留工作树。',
      projectResults: '项目审阅', unseen: '待审阅', reviewed: '已审阅', legacyReview: '早期记录', markSeen: '标为已审阅', resultHistory: '全部结果', resultTurn: '第 {n} 轮', previousPage: '上一页', nextPage: '下一页', noResults: '没有待审阅的结果。', noAllResults: '这个项目还没有结束的 ACP 运行。', reviewHint: '每一轮分开记录。点开查看不会自动标为已读，也不会代你处理审批。', runTrace: '本轮轨迹', checkoutDiff: '工作树改动', gitScope: '对比范围', uncommitted: '工作树与 HEAD', staged: '已暂存', unstaged: '未暂存', branchDiff: '当前分支与基线', baseBranch: '基线分支', autoBase: 'Forge 默认', findBase: '搜索基线分支', checkoutHint: '这是当前工作目录的实时 Git 状态，可能包含其他 Agent 的改动，不一定是这一轮改的。', diffClean: '当前对比范围没有改动。', diffOmitted: 'Forge 另省略了 {n} 个未跟踪文件。', binaryDiff: '二进制文件', largeDiff: '文件超出差异大小限制', noHunks: '没有文本差异块', moreLines: '显示更多行', moreFiles: '显示更多文件', projectRequests: '等待你回应', checkoutUnavailable: '无法读取 Git 改动。',
      attention: '等你回应', working: '进行中', review: '需查看', recent: '最近活动', history: '历史', all: '当前记录',
      attentionHint: '在这里操作会直接把决定发给等待中的 CLI；只打开会话看一眼不会触发审批。',
      recoveryHint: '先核对最后一轮，再决定是否发送新消息。重新连接不会重发原任务。',
      firstTurn: '在输入框发送第一条消息即可开始。CLI 使用自己的工具和文件权限。', resumeHint: '外部上下文已保留。你可以只重新连接，也可以直接发送新消息继续。',
      readyAfterError: '连接仍然可用。请先核对上一轮，再在输入框给出新的指令。', archivedHint: '此绑定已归档。恢复后可以继续使用原外部上下文。',
      openConversation: '打开会话', openRoot: '打开所属会话树', retry: '刷新', connectingFeed: '正在连接…',
      cliOptions: 'CLI 设置', hideOptions: '收起 CLI 设置', connectOnly: '仅连接，不发送消息',
      forkHere: '从副本继续', forkHint: '副本从 CLI 已保存的最新记录开始。不会接管原会话，也不会发送提示词。', forkSource: '复制自 CLI 历史', forkReady: '副本已保存。下一条消息只发给副本；也可以先连接，不发送任务。', resumeExisting: '接续 CLI 会话', resumeHere: '在这里接续', closeHistory: '收起会话列表',
      importedReady: '已接续「{name}」。下一条消息会发到这个会话。', previousMessages: '查看 CLI 前文', hidePrevious: '收起前文', noReplay: 'CLI 的这页历史中没有更早的消息。',
      resumePick: '选择旧会话只会连接。下一条消息从 CLI 原上下文继续，不会把本页之前的 DSH 对话一并发过去。',
      firstUse: '在 DSH 模型选择器选一个 ACP 模型并发送消息，执行活动就会出现在这里。',
      setup: '管理提供方', answeredByPreset: '完全访问 · 自动回应', answeredByUser: '人工回应',
      quietChildren: '其他子任务（{n}）', requestCount: '{n} 项待回应',
      scopeOnce: '完全访问可自动同意单次请求，持久授权仍需你选择。',
      tabProviders: '提供方', tabRecords: '活动', live: '实时', offline: '正在重连…',
      engine: 'ACP 引擎', useEngine: '用 {name} 执行当前会话', showInfo: '了解 ACP 引擎', hideInfo: '收起说明',
      engineHint: '在原模型选择器中选择 ACP 提供方下的具体模型。输入框、附件和停止按钮照常使用，回复保留在当前时间线。',
      delegateHint: '保留普通 DSH 模型，可用 subagent_cursor、subagent_antigravity 或 subagent_acp_claude_code 委派，再用 send_message 续聊。',
      warning: '外部 Agent 用的是自己的登录态、工具和文件权限，不受 DSH 沙箱限制；审批也只覆盖 CLI 实际发来的请求。',
      engineOn: '{name} · ACP', notConnected: '发送消息时自动连接',
      connect: '连接', reconnect: '重新连接', disconnect: '断开', cancelConnect: '取消',
      newContext: '新建外部上下文', newContextConfirm: '从下一条消息开始新建外部对话？DSH 历史和旧执行记录仍然保留。',
      restoreTo: '切回 {model}', restoreTitle: '把当前会话切回之前使用的 DSH 模型',
      restoreHint: '没有保存此会话之前的 DSH 模型，请用模型选择器切回。',
      moreOptions: '展开引擎选项', lessOptions: '收起引擎选项', switchEngine: '切换引擎',
      connection: '连接', configuration: '配置', commands: 'CLI 命令', usage: '用量', directory: '目录',
      noConfig: '连接后会载入此 CLI 公布的模型、模式和选项。',
      cliCommandGroup: 'CLI · {name}', cliCommandStale: '原来的命令选择已失效，请从 / 菜单重新选择 CLI 命令。',
      model: '模型', mode: '模式', commandPick: '选择命令…', commandArgs: '参数', commandRun: '运行',
      commandHint: '作为普通消息发给外部 CLI。输入框中的斜杠命令仍由 DSH 处理。',
      'notice.feed': 'CLI 会话提醒', 'notice.recent': '列出本次连接在轮次外收到的最近八条提醒，最新的在前。不需要审批。', 'notice.info': '提示', 'notice.warning': '警告', 'notice.error': '错误', 'notice.level': 'CLI · {level}', 'notice.turn': '本轮收到', 'notice.connect': '连接时收到', 'notice.session': '轮次间收到', 'notice.fromTask': 'CLI 任务：{id}', 'notice.unavailable': '本地记录中找不到这条提醒。',
      'compact.late': 'CLI 在该轮结束后补充了回报。', 'compact.title': 'CLI 上下文压缩', 'compact.replay': '回放中的 CLI 压缩', 'compact.summary': 'CLI 报告的摘要', 'compact.noSummary': '这些回报没有提供摘要。', 'compact.in_progress': '压缩中', 'compact.unsettled': '最后报告为进行中', 'compact.completed': '压缩完成', 'compact.failed': '压缩失败', 'compact.cancelled': '压缩已取消', 'compact.automatic': '自动压缩', 'compact.manual': '手动压缩', 'compact.idle': '空闲时压缩', 'compact.preTokens': '压缩前：{n} token', 'compact.postTokens': '压缩后：{n} token', 'compact.durationMs': '耗时：{n} 毫秒', 'compact.attachment': '预览附件 · {type}', 'compact.noMedia': '找不到对应的历史附件。',
      contextRecent: 'CLI 上下文 · 最近报告', contextRecorded: 'CLI 报告的上下文', contextReplay: '回放中的上下文报告', ctxAt: '报告时间：{time}', ctxScope: '这是当前上下文窗口占用，不是计费 token 或剩余额度。', ctxCost: '会话累计费用：{amount} {unit}', ctxTotals: 'CLI 会话累计 token', ctxTotalsScope: '这轮结束时 CLI 返回的会话累计总量，不是单轮消耗。', ctxTotal: '总计', ctxInput: '输入', ctxOutput: '输出', ctxCacheRead: '缓存读取', ctxCacheWrite: '缓存写入', ctxThought: '推理', ctxModel: '报告模型：{model}',
      usageContext: '上下文 {used} / {size}（{percent}%）', usageCost: '费用 {amount} {currency}',
      unknownUsage: '此 Agent 还没上报（ACP 不提供账号剩余额度）。',
      children: 'ACP 子任务', stop: '停止', pending: '待处理', expand: '展开轨迹', collapse: '收起轨迹',
      'state.starting': '连接中', 'state.idle': '就绪', 'state.running': '执行中', 'state.waiting': '等待你回应',
      'state.canceling': '停止中', 'state.disconnected': '已断开', 'state.error': '错误', 'state.preparing': '准备中',
      'state.completed': '已完成', 'state.interrupted': '已中断', 'state.failed': '失败',
      trace: '{name} 执行轨迹', traceTools: '{n} 次工具调用', traceTool: '1 次工具调用', traceFiles: '{n} 个文件有差异', traceFile: '1 个文件有差异',
      replyCollapsed: '{name} 回复已折叠', replyLines: '{n} 行', replyImages: '{n} 张图片', collapseReply: '收起结果', expandReply: '展开结果', collapseExcerpt: '收起回复', expandExcerpt: '展开全文', collapseTrace: '收起轨迹',
      handoff: '已交接 DSH 上下文', sameContext: '延续外部上下文',
      viewTimeline: '时间线', viewRaw: '原始事件', older: '加载更早记录', loading: '加载中…',
      noEvents: '尚无执行事件。', noActivity: '本轮没有工具活动。',
      stderr: 'CLI 日志输出', stopReason: '本轮结束：{reason}', turnError: 'Agent 报错：{message}', configError: '设置被拒绝：{message}',
      planItems: '任务清单', planDocument: '方案正文', planRemoved: 'CLI 已移除计划', planRecorded: '以下是 CLI 在此次对话中回报的原文。', planOpenFile: '查看当前文件', planDone: '已完成', planDoing: '进行中', planPending: '待开始', planEmpty: '没有列出步骤。', morePlanItems: '显示更多步骤',
      plan: '计划', highPriority: '高', planProgress: '{done}/{total} 项完成',
      'call.read': '读取文件', 'call.search': '搜索', 'call.edit': '编辑文件', 'call.write': '写入文件', writeView: '写入详情', writeInput: '请求写入的正文', writePatch: '报告的补丁', writeEmpty: '请求写入的正文为空。', 'call.delete': '删除', 'call.move': '移动',
      'call.execute': '运行命令', 'call.fetch': '访问网页', 'call.think': '思考', 'call.switch_mode': '切换模式',
      'call.pending': '等待执行', 'call.in_progress': '执行中', 'call.unfinished': '未报告最终状态', 'call.completed': '已完成', 'call.failed': '失败',
      'patch.launch': '启动时的预览', 'patch.update': 'CLI 更新中的补丁', 'patch.completed': '完成回报中的补丁', 'patch.failed': '失败回报中的补丁', 'patch.permission': '本次审批中的补丁', 'patch.recorded': '报告的补丁', patchCurrent: '在当前文件中查看报告的位置', patchFiles: '补丁文件（{n}）', patchAll: '全部报告片段', patchParts: '{n} 个片段', patchNoParts: '该文件没有结构化文本差异。', 'patch.add': '新增文件', 'patch.delete': '删除文件', 'patch.move': '移动文件', 'patch.updateFile': '修改文件',
      webSearch: '网页搜索', webPage: '抓取网页', webFind: '页内查找', webQuery: '报告的查询', webAddress: '网页地址', webPattern: '页内查找内容', webPrompt: '要求提取的内容', webOffset: '起始字符偏移', webAllow: '允许的域名', webDeny: '排除的域名', webPreview: '请求预览', webResponse: '工具回报', webRaw: '原始工具输出', webUpdate: '工具进度更新', webFailure: '失败回报', webNoReport: '此调用未附带结果文本。', webMore: '显示更多来源（剩余 {n} 项）', webSourceCount: '报告了 {n} 条来源',
      fileByName: '按名称查找', fileByDirectory: '浏览目录', dirRoot: '工作目录', dirBack: '返回目录', dirHint: '只列当前目录，不显示隐藏项；此视图不过滤 Git 忽略项。', dirRefresh: '刷新目录', dirRestart: '重新打开当前工作目录', dirCount: '{n} 个可见条目', dirEmpty: '未返回可见条目。', dirPartial: 'DSH 仅返回了部分目录内容。', dirFolder: '目录', dirFile: '文件', dirOther: '其他', dirBytes: '{n} 字节', dirMore: '显示更多条目', fileRefresh: '重新搜索',
      findFile: '查找文件', fileQuery: '文件名或路径', findFileHint: '按名称搜索此会话的实际工作目录，排除隐藏文件和 Git 忽略项。', foundFiles: '返回 {n} 个文件', fileHitsLimit: '结果已截断，请缩小范围', fileScanCut: '只检索了部分目录', moreFileHits: '显示更多文件', fileHitsBack: '返回文件结果',
      'batch.archive': '批量归档会话', 'batch.restore': '批量恢复会话', 'batch.confirm': '核对所选会话', 'batch.choose': '请先勾选至少一个可操作的会话。', 'batch.archiveNote': '只归档在本项目勾选的会话，并取消其置顶。正在工作、等待回应或有工作树记录的会话会跳过，不会停止任务。', 'batch.restoreNote': '只恢复本项目勾选的会话，不打开聊天、不启动 Agent、不恢复置顶，也不重建工作树。', 'batch.active': '正在工作或等待回应', 'batch.denied': '无操作权限', 'batch.changed': '项目归属或归档状态已变化，请重新核对。', 'batch.tree': '请在单个会话的归档入口核对工作树。', 'batch.result': '各会话处理结果', 'batch.archived': '已归档', 'batch.restored': '已恢复', 'batch.skipped': '未更改',
      findAgent: '查找会话', findAgentHint: '名称、项目、引擎、目录或 DSH 会话 ID', hereProjects: '当前项目', everyProject: '全部项目', finderScope: '查找范围', onlyPinned: '只看置顶', isPinned: '置顶', finderCount: '{n} 个会话', finderNoMatch: '没有符合这些条件的会话。', finderReset: '清除筛选', projectRename: '重命名项目', projectTitle: '项目名称', sameProjectTitle: '已有同名项目。', cancelEdit: '取消', agentMenu: '会话「{name}」的操作', archivedOpen: '先恢复此会话，再打开聊天。',
      'call.mcp': 'MCP 工具', mcpArgs: '调用参数', mcpOutput: '报告的输出', mcpContent: 'CLI 展示内容', mcpStructured: '结构化结果', mcpRequest: '请求附带的说明', mcpDisplayArgs: '请求中展示的参数', mcpAbsent: '未附原始参数', mcpTable: '相同字段的记录', mcpEmpty: '工具返回了空内容列表。', mcpEmptyDisplay: 'CLI 在这里没有附展示内容。', mcpFields: '{n} 个字段', mcpItems: '{n} 项', mcpMore: '显示更多', mcpLess: '收起', mcpSource: 'MCP 服务',
      streamReport: '终端回报', finalReport: '工具另报的输出', outputView: '命令输出', outputTail: '较早输出已省略，仅显示末尾 32 Ki 字符。', outputPartial: '未知的分包方式：只显示最近一次回报和之后的明确增量。', awaitingExit: '尚无终端退出回报',
      exitCode: '退出码 {n}', inspectData: '技术详情', proposed: '请求的改动', imageResult: '工具返回的图片',
      lineNumber: '第 {n} 行', linesReturned: '返回 {n} 行', pathsReturned: '{n} 个路径', hitsReturned: '{files} 个文件 · {n} 处匹配', noHits: '没有结果',
      'decision.accepted': '已接受', 'decision.rejected': '已拒绝', 'decision.cancelled': '已取消', 'decision.skipped': '已跳过', 'decision.answered': '已回答',
      resource: '资源', noExit: '未报告退出码', noShellOutput: '没有输出', terminalSignal: '信号 {signal}', pathMore: '另 {n} 处',
      clearField: '清除选择', form: 'CLI 提问', formOptional: '选填', formRequired: '必填', formSubmit: '提交回答', formDecline: '不回答', formPreview: '查看选项示例', formHelp: '仅把填写的字段交给本次提问的 CLI。请勿填写密码或令牌。', formMin: '最少 {n}', formMax: '最多 {n}', 'form.accept': '已提交回答', 'form.decline': '已拒绝回答', 'form.cancel': '已取消', formWithdrawn: 'CLI 已撤回',
      permission: '权限请求', question: 'Agent 提问', 'kind.plan': '计划审批',
      permitLaunch: '查看最初的工具调用', permitEarlier: '这是工具启动时的报告，不代表本次请求的授权范围。', permitEmpty: 'CLI 没有随本次请求提供参数、文件位置或预览。', permitPast: '查看审批请求', permitReadOnly: '请求记录 · 只读', permitUnavailable: '无法读取对应的审批记录。', permitCallId: '调用 ID', permitCwd: 'CLI 目录', permitOptions: 'CLI 提供的选项', permitScopeOnce: '仅本次请求', permitScopeRemember: '后续请求可能沿用', permitGrant: '允许', permitRefuse: '拒绝', permitSelection: '当时的决定：{choice}', permitAutoSelection: '预设自动决定：{choice}',
      permanent: '选择“总是”类选项后，CLI 可能在后续请求中沿用。',
      approve: '批准计划', reject: '拒绝', rejectReason: '理由（可选）', answer: '提交答案', skip: '跳过', dismiss: '取消请求',
      'event.interaction': '请求：{title}', 'event.answered': '已回应', 'event.expired': '请求已过期',
      input: '输入', output: '输出', terminal: '终端 {id}', tool: '工具调用',
      user: '你', assistant: 'Agent', thinking: '思考', replay: '历史回放',
      truncated: '… 共 {n} 个字符', copy: '复制', copied: '已复制', wrap: '自动换行', unwrap: '取消换行', code: '代码',
      expandLines: '再显示 {n} 行', collapseLines: '收起', expandLinesAria: '显示隐藏的 {n} 行', collapseLinesAria: '收起展开的行',
      providerList: '提供方', addProvider: '新增提供方', editProvider: '编辑提供方', newProviderTitle: '新增提供方',
      fieldId: 'ID', fieldLabel: '显示名称', fieldCommand: '可执行文件', fieldCommandHint: '绝对路径或 PATH 中的名称。',
      fieldArgs: '参数', fieldArgsHint: 'JSON 字符串数组，例如 ["acp"]。不要填写密钥。',
      save: '保存', saved: '已保存', remove: '删除', removeConfirm: '删除此提供方配置？其执行记录仍然保留。',
      argsInvalid: '参数必须是 JSON 字符串数组。',
      providerHint: '先在终端完成 CLI 登录。保存不会启动进程，修改在下次连接时生效。',
      check: '检查提供方', checkHint: '在该目录启动 CLI，只执行 ACP initialize，不发送任务。',
      cwd: '工作目录', cwdPlaceholder: '/项目/的/绝对路径',
      diagnose: '检查能力', discover: '查找 CLI 会话', capabilities: '能力', agent: 'Agent', protocol: '协议',
      refreshModels: '刷新模型', modelsHint: '新建空 ACP 会话读取候选模型，不发送任务，也不会自动改变主模型选择器。',
      modelsLoaded: '发现 {n} 个候选模型。', modelPickerHint: '请在原 DSH 模型选择器中选择此会话使用的模型。',
      visibleModels: '显示在模型选择器中的模型', modelSelectionHint: '勾选需要显示的模型并保存。CLI default 始终保留。',
      saveModels: '保存模型选择', modelsSaved: '模型列表已更新。', noModels: '请先刷新模型以载入候选项。',
      modelInfoHint: '已选模型会携带 CLI 公布的信息。未公布的容量不补猜测值；支持思考强度时，可在原模型选择器中调整。',
      modelContext: '上下文：{n} tokens', modelOutput: '输出上限：{n} tokens', modelInput: '输入：{types}',
      modelEfforts: '思考强度：{levels}', modelInfoUnknown: 'CLI 未公布模型信息', modalityText: '文本', modalityImage: '图片',
      supported: '已公布', unsupported: '不支持', unreported: '未公布', authMethods: '登录方式', rawResult: '原始结果', none: '未公布',
      'cap.loadSession': '恢复会话', 'cap.image': '图片输入', 'cap.audio': '音频输入', 'cap.embeddedContext': '嵌入上下文',
      'cap.list': '会话列表', 'cap.mcpHttp': 'HTTP MCP', 'cap.mcpSse': 'SSE MCP',
      discovered: '此目录下的 CLI 会话', import: '导入', more: '更多', noDiscovered: '没有找到会话。',
      importHint: '导入只创建本地记录，主动连接后才会载入对话。',
      loginHint: '若登录失败，请在终端执行 CLI 的登录命令后重新连接。',
      search: '搜索名称、提供方、目录或会话 ID', showArchived: '显示已归档', noRecords: '还没有执行记录。', noMatch: '没有匹配的记录。',
      nativeTag: 'DSH 会话', childTag: '子任务', standaloneTag: '独立', retiredTag: '已退役', archivedTag: '已归档',
      pickRecord: '选择一条记录查看历史。', remoteId: '远端会话', dshSession: 'DSH 会话', updated: '更新于', provider: '提供方',
      rename: '改名', archive: '归档', unarchive: '恢复归档', stopTurn: '停止本轮', back: '全部记录',
      archiveHint: '归档前请先断开。归档不会删除工作区文件或 CLI 历史。',
      nativeReadOnly: '这条记录属于 DSH 会话，请在该会话中发送消息。',
      storageError: '历史记录无法保存：{message}',
    }

    const CSS = `
.acpw{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
:where(.acpw) *,:where(.acpw) *::before,:where(.acpw) *::after{box-sizing:border-box}
:where(.acpw) :is(p,h1,h2,h3,ul,ol,dl,dd,fieldset,legend){margin:0;padding:0}
:where(.acpw) :is(ul,ol){list-style:none}
:where(.acpw) fieldset{border:0;min-width:0}
.acpw :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.aw-muted{color:var(--dsw-alias-label-tertiary)}
.aw-ellipsis{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.aw-row{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.aw-grow{flex:1 1 auto;min-width:0}
.aw-file-hit{display:grid;text-align:start;gap:2px;width:100%;padding:6px 8px;background:none;color:inherit;border:1px solid transparent;border-radius:6px;font:inherit;cursor:pointer;overflow-wrap:anywhere}
.aw-directory-list{display:grid;gap:2px}.aw-dir-entry{grid-template-columns:4em minmax(0,1fr) auto;align-items:center;gap:8px}.aw-dir-entry:disabled{cursor:default}
.aw-file-hit:hover,.aw-file-hit[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.aw-strong{font-weight:500}
.aw-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.aw-note{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.aw-warn{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.aw-warn>svg{flex:none;margin-top:1px;color:var(--dsw-alias-state-warn-primary)}
.aw-mono{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;overflow-wrap:anywhere}
.aw-select{height:28px;max-width:200px;min-width:0;padding:0 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:inherit;font:inherit;font-size:12px;text-overflow:ellipsis}
.aw-select:disabled{opacity:.55}
.aw-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-field>span:first-child{font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-field .aw-input{width:100%}
.aw-textarea{width:100%;min-height:60px;resize:vertical;padding:8px 10px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:inherit;font-family:var(--dsw-font-mono,ui-monospace,Menlo,monospace);font-size:12px;line-height:18px}
.aw-toggle{display:inline-grid;place-items:center;flex:none;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
@media (hover:hover){.aw-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}

/* Composer dock: same column, surface and type scale as the host Todo and Goal cards. */
.aw-dock{container-type:inline-size;display:flex;flex-direction:column;gap:6px;flex:none;margin:0 auto;
  width:calc(100% - 2 * var(--dsh-composer-side-clearance,16px) - 4 * var(--dsh-composer-dock-inset,8px));
  max-width:calc(var(--dsh-composer-card-max-width,760px) - 4 * var(--dsh-composer-dock-inset,8px))}
.aw-card{position:relative;isolation:isolate;border-radius:var(--dsw-radius-md,12px);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-panel)}
.aw-card::before{content:'';position:absolute;z-index:-1;inset:0;border-radius:inherit;pointer-events:none;background:var(--dsw-specific-menu,var(--dsw-alias-bg-base));backdrop-filter:var(--dsw-menu-backdrop-filter)}
.aw-card[data-tone=warn]{--dsw-elevation-stroke-color:var(--dsw-alias-state-warn-primary)}
.aw-bar{display:flex;align-items:center;gap:8px;min-height:36px;padding:4px 6px 4px 12px;min-width:0}
.aw-bar-title{font-weight:500;white-space:nowrap}
.aw-quiet .aw-bar{min-height:32px;padding-left:4px}
.aw-quiet .aw-label{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.aw-info{display:flex;flex-direction:column;gap:6px;padding:0 4px 6px}
.aw-pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.aw-panel{display:flex;flex-direction:column;gap:14px;padding:12px;border-top:1px solid var(--dsw-alias-border-l1);max-height:min(46vh,440px);overflow-y:auto;overscroll-behavior:contain}
.aw-section{display:flex;flex-direction:column;gap:8px;min-width:0}
.aw-section>h3{font-size:12px;font-weight:500;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.aw-config{display:flex;flex-wrap:wrap;gap:10px 16px}
.aw-config .aw-field{flex:1 1 160px;max-width:280px}
.aw-config .aw-select{max-width:none;width:100%}
.aw-model-list{display:flex;flex-direction:column;max-height:280px;overflow-y:auto;overscroll-behavior:contain}
.aw-notice{min-width:0;border-inline-start:2px solid var(--dsw-alias-label-tertiary);padding-inline-start:6px;overflow-wrap:anywhere}.aw-notice[data-level=warning]{border-color:var(--dsw-alias-state-warn-primary)}.aw-notice[data-level=error]{border-color:var(--dsw-alias-state-error-primary)}.aw-batch-choice{display:flex;align-items:center;gap:8px;padding-block:4px;min-width:0;overflow-wrap:anywhere}.aw-batch-choice input{flex:none}.aw-connection-notices{min-width:0}.aw-connection-notices>.aw-section{margin-inline-start:8px}
.aw-compact-summary{display:grid;gap:4px;max-height:18rem;overflow:auto;overflow-wrap:anywhere;overscroll-behavior:contain}
.aw-usage-meter{width:50px;height:5px;border-radius:4px;background:var(--dsw-alias-border-l1);overflow:hidden}.aw-usage-meter>i{display:block;height:100%;background:var(--dsw-alias-label-secondary)}.aw-usage-meta,.aw-usage-detail{font-variant-numeric:tabular-nums}.aw-usage-detail{display:grid;gap:5px;padding:6px 12px 8px 30px}.aw-usage-detail dl{display:grid;grid-template-columns:max-content 1fr;gap:3px 14px;margin:0}.aw-usage-detail dd{margin:0}
.aw-switch{display:inline-flex;align-items:center;gap:8px;font-size:12px}
.aw-bar-error{padding:0 12px 8px}
.aw-engine-hint{display:grid;gap:4px;padding:8px 12px}
@container (max-width:560px){.aw-bar .aw-hide-narrow{display:none}}

/* Pending human interaction */
.aw-ask{display:flex;flex-direction:column;gap:10px;padding:12px 14px;min-width:0}
.aw-ask-inline{border-radius:10px;border:1px solid var(--dsw-alias-state-warn-primary)}
.aw-ask-head{display:flex;align-items:center;gap:8px;font-weight:500}
.aw-ask-head>svg{color:var(--dsw-alias-state-warn-primary);flex:none}
.aw-ask-body{display:flex;flex-direction:column;gap:8px;min-width:0;max-height:min(40vh,360px);overflow:auto}
.aw-ask-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.aw-ask-actions .aw-reason{flex:1 1 160px;max-width:280px}
.aw-permit-option{display:inline-flex;align-items:flex-start;flex-direction:column;gap:2px;max-width:100%}.aw-permit-option small{color:var(--dsw-alias-label-secondary);font-size:11px}.aw-permit-context{border-inline-start:2px solid var(--dsw-alias-border-l2);padding-inline-start:10px}
.aw-question{display:flex;flex-direction:column;gap:4px}
.aw-form-field{padding:8px 0;border:0}.aw-form-hint{display:block}.aw-form-field textarea{resize:vertical}
.aw-question legend{font-weight:500;margin-bottom:4px}
.aw-option{display:flex;align-items:flex-start;gap:8px;padding:5px 8px;border-radius:8px;cursor:pointer}
@media (hover:hover){.aw-option:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-option input{margin:3px 0 0;flex:none}

/* ACP subagents */
.aw-child{border-top:1px solid var(--dsw-alias-border-l1)}
.aw-child-body{padding:0 12px 10px}

.aw-review-patch{overflow:auto;max-width:100%;font:12px/1.55 ui-monospace,monospace}.aw-patch-line{display:grid;grid-template-columns:4em 4em minmax(max-content,1fr);min-width:max-content}.aw-patch-line>span,.aw-patch-line>button{text-align:end;padding:0 6px;color:var(--dsw-alias-label-tertiary)}.aw-patch-line>button{font:inherit;background:none;border:0;cursor:pointer;text-decoration:underline}.aw-patch-line>code{font:inherit;white-space:pre;padding-inline-start:7px}.aw-patch-line[data-side=add]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 10%,transparent)}.aw-patch-line[data-side=del]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,transparent)}.aw-patch-hunk{color:var(--dsw-alias-label-secondary);white-space:pre;padding:3px 0}.aw-review-preview{border-inline-start:2px solid var(--dsw-alias-border-l1);padding-inline-start:10px;min-width:0}
/* Execution trace (chat node and records) */
.aw-task-lane{min-width:0;border-inline-start:2px solid var(--dsw-alias-border-l1);padding-inline-start:8px;margin-inline-start:5px}.aw-task-origin{font-size:11px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}.aw-task-nav{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;min-width:0}.aw-task-nav>.aw-strong{overflow-wrap:anywhere}.aw-task-scope{display:grid;gap:4px;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}.aw-task-progress{min-width:0;font-size:13px}.aw-task-progress .aw-text{max-height:12em;overflow:auto}
.aw-trace{margin:2px 0;min-width:0}
.aw-trace-head{display:flex;align-items:center;gap:8px;min-height:28px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.aw-trace-toggle{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;min-height:28px;padding:0 6px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
@media (hover:hover){.aw-trace-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.aw-trace-chevron{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary)}
.aw-trace-body{display:flex;flex-direction:column;gap:8px;padding:4px 0 6px;min-width:0}
.aw-trace-foot{display:flex;justify-content:flex-end;padding-top:2px}
.aw-reply-toggle{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;padding:0 6px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;text-align:left;cursor:pointer}
@media (hover:hover){.aw-reply-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.aw-reply-toggle[data-open=true]{width:fit-content;padding:0 8px}
.aw-reply-clamped{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.aw-trace-meta{display:flex;align-items:center;flex-wrap:wrap;gap:4px 12px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:0}
.aw-trace-meta .aw-path{max-width:min(100%,360px)}
.aw-summary{color:var(--dsw-alias-label-tertiary);font-size:12px;margin-left:8px;font-weight:400}
.aw-list{display:flex;flex-direction:column;gap:2px;min-width:0}
.aw-detail{display:flex;flex-direction:column;gap:8px;padding:2px 0 8px 26px;min-width:0}
.aw-patch-select{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0;font-size:12px}.aw-patch-select select{max-width:100%;min-width:0}
.aw-locs{display:flex;flex-direction:column;align-items:flex-start;gap:2px;font-size:12px;min-width:0}
.aw-file-link{padding:2px 0;max-width:100%;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}.aw-file-link:hover{text-decoration:underline}
.aw-call,.aw-call-detail{min-width:0;max-width:100%}.aw-call-meta{display:inline-flex;align-items:center;gap:7px;min-width:0;max-width:100%;margin-inline-start:7px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400}
.aw-call-view{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.aw-call-run{max-width:100%;min-width:0}.aw-call-run-body{margin-inline-start:8px;padding-inline-start:12px;border-inline-start:1px solid var(--dsw-alias-border-l1);display:grid;gap:3px}.aw-run-summary{display:inline-flex;align-items:baseline;gap:7px;min-width:0;max-width:100%;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:12px}.aw-run-summary .aw-ellipsis{max-width:22em;min-width:0;color:var(--dsw-alias-label-tertiary)}
.aw-call-focus{font-family:var(--dsw-font-mono,ui-monospace,monospace)}.aw-call-status,.aw-exit,.aw-count,.aw-diff-totals{flex:none;white-space:nowrap;font-size:11px;font-variant-numeric:tabular-nums}.aw-call-status{display:inline-flex;align-items:center;gap:4px}.aw-call-status[data-quiet=true]{color:var(--dsw-alias-label-tertiary)}
.aw-call[data-state=failed] :is(.aw-exit,.aw-call-status),.aw-diff-totals span:last-child{color:var(--dsw-alias-state-error-primary)}.aw-diff-totals span:first-child{color:var(--dsw-alias-state-success-primary)}
.aw-code-window,.aw-output{max-height:18rem;overflow:auto;overscroll-behavior:contain}.aw-tech{font-size:12px;color:var(--dsw-alias-label-secondary)}.aw-tech>summary{cursor:pointer;width:fit-content}.aw-tech[open]>summary{margin-block-end:6px}
.aw-params:not(:empty){display:grid;gap:3px}.aw-params>div{display:grid;grid-template-columns:minmax(4em,max-content) minmax(0,1fr);gap:8px;font-size:12px}.aw-params dt{color:var(--dsw-alias-label-secondary)}.aw-params dd{white-space:pre-wrap;overflow-wrap:anywhere;max-height:8rem;overflow:auto}.aw-call-detail audio{max-width:100%}
.aw-mcp{min-width:0;display:grid;gap:8px}.aw-mcp-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap;overflow-wrap:anywhere}.aw-mcp-data{display:grid;gap:4px;min-width:0}.aw-mcp-data dl{margin:0;display:grid;gap:2px}.aw-mcp-data dl>div{display:grid;grid-template-columns:minmax(4em,27%) minmax(0,1fr);gap:8px;border-block-end:1px solid var(--dsw-alias-border-l1);padding-block:3px}.aw-mcp-data dt,.aw-mcp-data dd{min-width:0;overflow-wrap:anywhere;margin:0}.aw-mcp-data dt{color:var(--dsw-alias-label-secondary)}.aw-mcp-value{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 ui-monospace,monospace}.aw-mcp-content{display:grid;gap:6px;min-width:0}.aw-mcp-grid{overflow-x:auto;max-width:100%}.aw-mcp-grid table{border-collapse:collapse;font-size:12px;width:100%}.aw-mcp-grid th,.aw-mcp-grid td{text-align:start;vertical-align:top;overflow-wrap:anywhere;min-width:3em;max-width:30em;padding:4px 6px;border-block-end:1px solid var(--dsw-alias-border-l1)}.aw-mcp-grid th{color:var(--dsw-alias-label-secondary);font-weight:500}.aw-mcp-grid th[scope=row]{width:2.5em;min-width:2em}
.aw-plan>ol{display:grid;gap:4px}.aw-ask-body .aw-call-detail{padding:0}
.aw-text{white-space:pre-wrap;overflow-wrap:anywhere}
.aw-plan{display:flex;flex-direction:column;gap:4px;padding:4px 0 4px 4px}
.aw-plan-id{min-width:0;max-width:24ch;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--dsw-alias-label-tertiary);font-size:11px}
.aw-plan>h3{font-size:12px;font-weight:500;color:var(--dsw-alias-label-tertiary)}
.aw-plan li{display:flex;align-items:flex-start;gap:8px;min-width:0}
.aw-plan li>span:first-child{margin-top:4px;flex:none}
.aw-plan li[data-status=completed] .aw-plan-text{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}
.aw-event{display:flex;align-items:center;gap:8px;min-height:24px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:0;overflow-wrap:anywhere}
.aw-event[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.aw-event>svg{flex:none}
.aw-log{margin:0;max-height:240px;overflow:auto;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--dsw-font-mono,ui-monospace,Menlo,monospace);font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.aw-msg{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);min-width:0}
.aw-msg[data-role=user]{background:var(--dsw-alias-bg-layer-2);margin-left:32px}
.aw-msg-head{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.aw-img{max-width:100%;max-height:360px;border-radius:8px}

/* Sidebar page */
.aw-page{container-type:inline-size;display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base)}
.aw-page-inner{display:flex;flex-direction:column;gap:16px;width:min(100%,980px);margin:0 auto;padding:20px 24px 40px}
.aw-head{display:flex;align-items:flex-start;gap:12px}
.aw-head h1{font-size:18px;line-height:26px;font-weight:600}
.aw-live{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;margin-top:4px}
.aw-tabs{max-width:340px}
.aw-banner{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.aw-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.aw-banner>svg{flex:none;margin-top:1px}
.aw-banner-text{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-split{display:grid;grid-template-columns:minmax(200px,250px) minmax(0,1fr);gap:16px;align-items:start}
@container (max-width:700px){.aw-split{grid-template-columns:minmax(0,1fr)}}
.aw-nav{display:flex;flex-direction:column;gap:2px;min-width:0}
.aw-item{display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;min-width:0}
@media (hover:hover){.aw-item:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-item[aria-current=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-bg-layer-2))}
.aw-item-top{display:flex;align-items:center;gap:8px;min-width:0}
.aw-item-sub{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:0}
.aw-stack{display:flex;flex-direction:column;gap:16px;min-width:0}
.aw-box{display:flex;flex-direction:column;gap:14px;padding:16px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);min-width:0}
.aw-box-head{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.aw-box-head h2{font-size:14px;font-weight:600;line-height:20px}
.aw-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.aw-form .aw-wide{grid-column:1/-1}
@container (max-width:560px){.aw-form{grid-template-columns:minmax(0,1fr)}}
.aw-facts{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:4px 16px;font-size:12px;line-height:18px}
.aw-facts dt{color:var(--dsw-alias-label-tertiary)}
.aw-facts dd{min-width:0;overflow-wrap:anywhere}
.aw-tags{display:flex;flex-wrap:wrap;gap:6px}
.aw-found{display:flex;flex-direction:column;gap:2px}
.aw-previous{max-height:12rem;overflow:auto;overscroll-behavior:contain}
:is(.aw-dock,.aw-options) .aw-found{max-height:12rem;overflow:auto;overscroll-behavior:contain}
/* Match the native model menu cells, including the trailing value and chevron. */
.aw-menu-option{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:100%;height:34px;padding:0 8px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:400;line-height:20px;text-align:start;white-space:nowrap;cursor:pointer;outline:none}
.aw-menu-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;text-align:end;color:var(--dsw-alias-label-tertiary)}
.aw-menu-option>svg{flex:none;color:var(--dsw-alias-menu-icon)}
.aw-menu-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.aw-menu-option:hover{background:var(--dsw-alias-interactive-bg-hover)}}
/* The popover's top layer escapes the composer's containment; the slot anchors it to the card. */
.aw-options{position:fixed;position-area:top span-left;align-self:end;justify-self:end;inset:auto;margin:0 0 8px;
  width:min(420px,anchor-size(width));max-height:min(22rem,calc(100% - 8px - max(12px,var(--dsh-frame-overlay-top,12px))));
  padding:12px;border:0;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu,var(--dsw-alias-bg-overlay));
  backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);
  overflow:auto;overscroll-behavior:contain;pointer-events:auto}
.aw-options:not(:popover-open){display:none}
.aw-found li{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:8px;min-width:0}
@media (hover:hover){.aw-found li:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-empty{padding:24px 12px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:12px}
.aw-filter{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.aw-filter .aw-input{flex:1 1 220px}
.aw-inbox-row{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.aw-inbox-row>.aw-item{flex:1 1 180px;min-width:0}
:is(.aw-dock,.aw-options) details>summary{cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}
`

    const ACTIVE_RUN = new Set(['preparing', 'running', 'waiting', 'canceling'])
    const CONNECTED = new Set(['starting', 'idle', 'running', 'waiting', 'canceling'])
    const BUSY = new Set(['starting', 'running', 'waiting', 'canceling'])
    const DOT = { preparing: 'ongoing', starting: 'ongoing', running: 'ongoing', canceling: 'ongoing', waiting: 'warning', idle: 'done', completed: 'done', error: 'error', failed: 'error' }
    const TOOL_DOT = { in_progress: 'ongoing', completed: 'done', failed: 'error' }
    const PLAN_DOT = { in_progress: 'ongoing', completed: 'done' }
    const MESSAGE_UPDATES = new Set(['agent_message_chunk', 'agent_thought_chunk', 'user_message_chunk'])
    const EMPTY = []

    async function api(op, signal) {
      const response = await fetch('/acp-workbench/op', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(op), signal })
      const value = await response.json().catch(() => null)
      if (!response.ok) throw new Error(value?.message ?? `HTTP ${response.status}`)
      if (value === null && op.action !== 'native-trace') throw new Error('Invalid response from ACP Workbench')
      return value
    }
    const uniqueEvents = events => [...new Map(events.map(event => [event.seq, event])).values()].toSorted((a, b) => a.seq - b.seq)
    const updateOf = event => event?.data?.method === 'session/update' ? event.data.params?.update ?? null : null
    const defined = value => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null))
    const clock = at => { try { return new Date(at).toLocaleTimeString() } catch { return '' } }
    const stamp = at => { try { return new Date(at).toLocaleString() } catch { return String(at ?? '') } }
    const number = value => { try { return new Intl.NumberFormat().format(value) } catch { return String(value) } }
    /** Live dots spin; once the turn has ended an unfinished item no longer claims progress. */
    const settle = (state, live) => state === 'ongoing' && !live ? 'idle' : state
    const eventLabel = event => [event.type, event.data?.method, updateOf(event)?.sessionUpdate].filter(Boolean).join(' · ')

    // Same wire evidence as the Host run fold. Legacy record pages use the original event stream.
    function cliParentOf(update) {
      const id = update?._meta?.claudeCode?.parentToolUseId
      return typeof id === 'string' && id.trim() ? id : undefined
    }
    // A later status-only frame does not turn a launch preview into a completion patch.
    // Keep a pointer to the raw field, not a second copy of its patch text. Drop it if replaced.
    function updatePatchFrame(row, update) {
      if (Array.isArray(update.content) && (row.patchFrame || ['edit','move','delete'].includes(update.kind ?? row.tool.kind) || update.content.some(b => b?.type === 'diff'))) {
        const stage = update.sessionUpdate === 'tool_call' ? 'launch' : update.status === 'completed' ? 'completed' : update.status === 'failed' ? 'failed' : 'update'
        const rawKey = ['rawOutput','rawInput'].find(k => update[k]?.call_id === update.toolCallId && update[k]?.changes)
        row.patchFrame = { stage, rawKey }
      } else if (row.patchFrame?.rawKey && update[row.patchFrame.rawKey] != null) row.patchFrame = { stage: row.patchFrame.stage }
    }
    // Display terminals are reports, not the ACP terminal/create capability. Bind solely to the
    // terminal reference announced by this call. Codex sends chunks as terminal_output;
    // Claude uses the same key to REPLACE its streamed foreground transcript.
    function foldTerminal(row, u) {
      const id = u.toolCallId, m = u._meta, info = m?.terminal_info
      if (u.sessionUpdate === 'tool_call' && row.tool.toolCallId) row.terminal = null // ambiguous repeated launch
      if (typeof id !== 'string' || !id || !m || row.terminal === null) return
      if (!row.terminal && info?.terminal_id === id && Array.isArray(u.content) && u.content.some(b => b?.type === 'terminal' && b.terminalId === id)) {
        const input = u.rawInput, mode = ['Bash','PowerShell'].includes(m.claudeCode?.toolName) ? 'replace'
          : input?.call_id === id && Array.isArray(input.command) && Array.isArray(input.parsed_cmd) ? 'append' : 'unknown'
        row.terminal = { id, mode, ...(typeof info.cwd === 'string' && { cwd: info.cwd }) }
      }
      const term = row.terminal
      if (!term || term.exited || (info && info.terminal_id !== id)) return
      const delta = m.terminal_output_delta, packet = delta ?? m.terminal_output
      if (packet?.terminal_id === id && typeof packet.data === 'string') {
        const append = !!delta || term.mode === 'append', old = append ? term.text ?? '' : '', limit = 32768
        term.clipped = (append && !!term.clipped) || old.length + packet.data.length > limit
        term.text = (old + packet.data.slice(-limit)).slice(-limit)
        if (!delta && term.mode === 'unknown') term.partial = true
      }
      const exit = m.terminal_exit
      if (exit?.terminal_id === id) {
        term.exited = true
        if (Number.isInteger(exit.exit_code)) term.exitCode = exit.exit_code
        if (typeof exit.signal === 'string' && exit.signal.trim()) term.signal = exit.signal
      }
      if (packet?.terminal_id === id) {
        const meta = { ...m }; delete meta.terminal_output; delete meta.terminal_output_delta
        return { ...u, _meta: meta }
      }
    }
    // Named ACP plans are complete replacements; unsupported frames must not erase a known plan.
    function namedPlan(update) {
      const p = update?.sessionUpdate === 'plan_update' ? update.plan : null
      const id = update?.sessionUpdate === 'plan_removed' ? update.planId : p?.planId
      if (typeof id !== 'string' || !id.trim()) return null
      if (!p) return { id, type: 'removed' }
      if (p.type === 'markdown' && typeof p.content === 'string') return { id, type: 'markdown', content: p.content, ...(typeof p.path === 'string' && p.path && { path: p.path }) }
      if (p.type === 'items' && Array.isArray(p.entries) && p.entries.every(e => typeof e?.content === 'string' && typeof e.status === 'string')) return { id, type: 'items', entries: p.entries }
      return null
    }

    /** Fold transport chunks into readable rows, retaining sequence numbers for raw-event inspection. */
    const tokenCount = n => Number.isSafeInteger(n) && n >= 0

    function contextWindow(update) {
      if (update?.sessionUpdate !== 'usage_update' || !tokenCount(update.used) || !tokenCount(update.size) || !update.size) return null
      const cost = update.cost, model = update._meta?.['_claude/model']
      return { used: update.used, size: update.size, ...(typeof model === 'string' && model.trim() && { model }), ...(Number.isFinite(cost?.amount) && cost.amount >= 0 && typeof cost.currency === 'string' && cost.currency.trim() && { cost: { amount: cost.amount, currency: cost.currency } }) }
    }

    function sessionTotals(usage) {
      if (!tokenCount(usage?.totalTokens) || !tokenCount(usage.inputTokens) || !tokenCount(usage.outputTokens)) return null
      return Object.fromEntries(['totalTokens', 'inputTokens', 'outputTokens', 'cachedReadTokens', 'cachedWriteTokens', 'thoughtTokens'].filter(k => tokenCount(usage[k])).map(k => [k, usage[k]]))
    }

    function recordWindow(rows, windows, key, event, window) {
      let row = windows.get(key)
      if (!row) {
        row = { kind: 'usage-window', seq: event.seq, turnId: event.data.turnId ?? null, replay: !!event.data.replay }
        windows.set(key, row); rows.push(row)
      }
      row.window = window; row.at = event.at
    }

    // ID-addressed ACP compaction, not an executable tool or a DSH context mutation.
    function compactionFacts(value) {
      if (!value || typeof value !== 'object') return null
      const facts = {}
      if (['automatic', 'idle', 'manual'].includes(value.trigger)) facts.trigger = value.trigger
      for (const name of ['preTokens', 'postTokens', 'durationMs']) if (Number.isSafeInteger(value[name]) && value[name] >= 0) facts[name] = value[name]
      return Object.keys(facts).length ? facts : null
    }

    function summaryPart(b, seq, index) {
      if (!b || typeof b.type !== 'string') return null
      if (b.type === 'text') return typeof b.text === 'string' ? { type: 'text', text: b.text } : null
      const r = b.type === 'resource' ? b.resource : b
      if (!r || typeof r !== 'object') return null
      const part = { type: b.type, seq, index }
      for (const key of ['mimeType', 'uri', 'name', 'description']) if (typeof r[key] === 'string') part[key] = r[key]
      if (b.type === 'resource' && typeof r.text === 'string') part.text = r.text
      return part // no base64, remote fetch, file read or executable markup in a trace row
    }

    function foldCompaction(rows, entities, scope, event, update) {
      const id = update.compactionId, chunk = update.sessionUpdate === 'compaction_summary_chunk', sid = event.data.params?.sessionId
      if (typeof id !== 'string' || !id.trim() || typeof sid !== 'string' || !sid || (!chunk && (typeof update.status !== 'string' || !update.status.trim()))) return
      const part = chunk ? summaryPart(update.content, event.seq, -1) : null
      if (chunk && !part) return
      const key = JSON.stringify([scope, sid, id]); let row = entities.get(key)
      if (!row) {
        row = { kind: 'compaction', seq: event.seq, id, sid, status: 'in_progress', parts: [], replay: !!event.data.replay, turnId: event.data.turnId ?? null }
        rows.push(row); entities.set(key, row)
      }
      if (event.data.compactionOwner && event.data.compactionOwner !== event.data.turnId) row.late = true
      if (chunk) {
        const last = row.parts.at(-1)
        if (part.type === 'text' && last?.type === 'text') last.text += part.text
        else row.parts.push(part)
        return // chunk metadata is local to the content, not a patch to the entity
      }
      row.status = update.status
      if (update.summary === null) row.parts = []
      else if (Array.isArray(update.summary)) row.parts = update.summary.map((entry, index) => summaryPart(entry, event.seq, index)).filter(Boolean)
      if (update.error === null || typeof update.error === 'string') row.error = update.error
      if (Object.hasOwn(update, '_meta')) {
        const meta = update._meta?.jetbrains?.air?.contextCompaction
        row.facts = meta?.version === 1 ? compactionFacts(meta) : null
        const parent = cliParentOf(update)
        row.cliParent = row.cliParent === undefined || row.cliParent === parent ? parent : null
      }
    }

    /** A notice is plain text from a specific remote, never an assistant message or a request for approval. */
    function noticeReceipt(event, remoteId) {
      const data = event?.data, params = data?.params, u = params?.update
      if (event?.type !== 'notification' || data?.method !== 'session/update' || typeof remoteId !== 'string' || !remoteId.trim() || params?.sessionId !== remoteId || u?.sessionUpdate !== 'notice' ||
        typeof u.title !== 'string' || !u.title.trim() || typeof u.severity !== 'string' || !u.severity.trim()) return null
      const parent = u._meta?.claudeCode?.parentToolUseId
      return { kind: 'notice', seq: event.seq, at: event.at, phase: data.turnId ? 'turn' : data.noticePhase === 'connect' || data.replay ? 'connect' : 'session',
        severity: u.severity, title: u.title, ...(typeof u.description === 'string' && u.description.trim() && { description: u.description }),
        ...(typeof parent === 'string' && parent.trim() && { cliParent: parent }) }
    }

    function timeline(events, remoteId) {
      const rows = []
      const tools = new Map()
      const plans = new Map(), compactions = new Map(), windows = new Map()
      let section = 0, progressSeq = 0, connectionSeq = 0
      for (const event of events) {
        const data = event.data ?? {}
        const update = updateOf(event)
        const kind = update?.sessionUpdate, parent = cliParentOf(update), plan = namedPlan(update)
        if (event.type === 'initialize') connectionSeq = event.seq
        const totals = event.type === 'turn-result' ? sessionTotals(data.usage) : null
        const role = event.type === 'user-message' ? 'user' : kind === 'agent_message_chunk' ? 'assistant' : kind === 'agent_thought_chunk' ? 'thinking' : kind === 'user_message_chunk' ? 'user' : null
        const text = update?.content?.type === 'text' ? update.content.text : null
        const previous = rows.at(-1)
        if (role || plan || kind === 'plan' || data.method?.replace(/^_/, '') === 'cursor/update_todos') section = event.seq
        if (role && parent) {
          if (role === 'thinking') continue // diagnostics retain the raw frame
          const content = update.content, value = text ?? content?.resource?.text, input = role === 'user'
          if (typeof value === 'string' && previous?.kind === 'task-progress' && !previous.media && previous.input === input && previous.cliParent === parent && previous.turnId === data.turnId && previous.replay === !!data.replay && progressSeq === event.seq - 1) {
            const remaining = 16384 - previous.text.length
            previous.text += value.slice(0, remaining); if (value.length > remaining) previous.clipped = true
          } else if (value || typeof value !== 'string') rows.push({ kind: 'task-progress', seq: event.seq, cliParent: parent, turnId: data.turnId, replay: !!data.replay, input,
            ...(typeof value === 'string' ? { text: value.slice(0, 16384), clipped: value.length > 16384 } : { media: content?.mimeType || content?.type || 'content', content }) })
          progressSeq = event.seq
        } else if (role && (text !== null || event.type === 'user-message')) {
          const value = text ?? data.text ?? ''
          if (previous?.kind === 'message' && previous.role === role && previous.turnId === data.turnId && previous.replay === !!data.replay) previous.text += value
          else rows.push({ kind: 'message', seq: event.seq, at: event.at, role, text: value, replay: !!data.replay, turnId: data.turnId })
        } else if (role && update?.content) {
          rows.push({ kind: 'content', seq: event.seq, role, content: update.content, replay: !!data.replay })
        } else if (kind === 'tool_call' || kind === 'tool_call_update') {
          const key = JSON.stringify([!!data.replay, data.turnId, update.toolCallId])
          let row = tools.get(key)
          if (!row) { row = { kind: 'tool', seq: event.seq, section, turnId: data.turnId, tool: {}, replay: !!data.replay }; tools.set(key, row); rows.push(row) }
          updatePatchFrame(row, update)
          if ((update.kind ?? row.tool.kind) === 'fetch' && Array.isArray(update.content)) {
            row.webFrame = update.sessionUpdate === 'tool_call' ? 'launch' : update.status === 'failed' ? 'failure' : update.status === 'completed' || update.rawOutput != null ? 'result' : 'update'
          }
          row.tool = { ...row.tool, ...defined(foldTerminal(row, update) ?? update) }
          if (parent) row.cliParent = row.cliParent === undefined || row.cliParent === parent ? parent : null
          if (['Agent', 'Task'].includes(update._meta?.claudeCode?.toolName)) row.cliTask = true
        } else if (kind === 'compaction_update' || kind === 'compaction_summary_chunk') {
          // The record view follows a session entity, even for updates between prompts. Separate each imported replay.
          foldCompaction(rows, compactions, data.replay ? ['replay', connectionSeq] : 'live', event, update)
          section = event.seq
        } else if (plan) {
          const key = JSON.stringify(['named', connectionSeq, !!data.replay, data.turnId, plan.id])
          let row = plans.get(key)
          if (!row) {
            row = { kind: 'plan', seq: event.seq, cliParent: parent, turnId: data.turnId, replay: !!data.replay }
            plans.set(key, row); rows.push(row)
          } else if (plan.type !== 'removed') {
            // The ID belongs to the session, not a tool call. A reset may omit the parent stamp.
            if (row.plan.type === 'removed') row.cliParent = parent
            else if (row.cliParent !== parent) row.cliParent = null
          }
          row.plan = plan
        } else if (kind === 'plan' || data.method?.replace(/^_/, '') === 'cursor/update_todos') {
          const key = JSON.stringify([!!data.replay, data.turnId, data.method, data.params?.toolCallId, parent])
          let row = plans.get(key)
          if (!row) { row = { kind: 'plan', seq: event.seq, entries: [], cliParent: parent, turnId: data.turnId, replay: !!data.replay }; plans.set(key, row); rows.push(row) }
          const entries = update?.entries ?? data.params?.todos ?? []
          row.entries = data.params?.merge ? [...new Map([...row.entries, ...entries].map(entry => [entry.id, entry])).values()] : entries
        } else if (kind === 'notice') {
          const row = noticeReceipt(event, remoteId)
          if (row) { rows.push({ ...row, turnId: data.turnId ?? null }); section = event.seq }
        } else if (kind === 'usage_update') {
          const window = !parent && typeof data.params?.sessionId === 'string' && data.params.sessionId && contextWindow(update)
          // Without a known turn (including imported history) do not collapse unrelated observations.
          if (window) recordWindow(rows, windows, JSON.stringify([connectionSeq, !!data.replay, data.turnId ?? ['event', event.seq]]), event, window)
        } else if (totals) {
          rows.push({ kind: 'usage-totals', seq: event.seq, totals, stopReason: data.stopReason })
        } else if (event.type === 'stderr') {
          if (previous?.kind === 'stderr') previous.text += data.text ?? ''
          else rows.push({ kind: 'stderr', seq: event.seq, text: data.text ?? '' })
        } else if (!MESSAGE_UPDATES.has(kind)) rows.push({ kind: 'event', ...event })
      }
      return rows
    }

    // ACP kinds are stable across engines. Labels and opaque arguments are not. These
    // are display models, never DSH tool invocations or requests to read today's files.
    const kindIcons = new Map(Object.entries({ read: IconBrowseOutlineRegular, search: IconSearchOutlineRegular,
      edit: IconEditOutlineRegular, delete: IconEditOutlineRegular, move: IconBranchOutlineRegular,
      execute: IconPlayOutlineRegular, fetch: IconGlobeOutlineRegular, think: IconSparkleRegular, switch_mode: IconBranchOutlineRegular }))
    const firstText = (...values) => values.find(value => typeof value === 'string' && value.trim() !== '')
    const unwrap = block => block?.type === 'content' ? block.content : block
    const plainText = block => unwrap(block)?.type === 'text' && typeof unwrap(block).text === 'string'
    const unfence = text => /^(`{3,})[^\n`]*\r?\n([\s\S]*)\r?\n\1\s*$/u.exec(text)?.[2] ?? text
    const validDiff = b => b?.type === 'diff' && typeof b.path === 'string' && !!b.path.trim() && typeof b.newText === 'string' && (b.oldText == null || typeof b.oldText === 'string')
    // Use adapter identity fields, not a display title or the names of a tool's arguments.
    function mcpIdentity(call, approval) {
      const wireName = firstText(call.name), metaName = firstText(call._meta?.claudeCode?.toolName), raw = call.rawInput
      if (wireName && metaName && wireName !== metaName) return null
      const name = wireName || metaName
      if (name) {
        if (!name.startsWith('mcp__')) return null
        const i = name.indexOf('__', 5)
        return i > 5 && firstText(name.slice(5, i)) && firstText(name.slice(i + 2)) ? { source: 'claude', server: name.slice(5, i), name: name.slice(i + 2), args: raw } : null
      }
      if (firstText(raw?.server) && firstText(raw.tool) && Object.hasOwn(raw, 'arguments') && call.title === `Tool: ${raw.server}/${raw.tool}`)
        return { source: 'codex', server: raw.server, name: raw.tool, args: raw.arguments }
      const request = raw?.request, meta = request?._meta, prefix = 'mcp_tool_call_approval_'
      if (approval && firstText(call.toolCallId) && request?.mode === 'form' && meta?.codex_approval_kind === 'mcp_tool_call' && firstText(raw.server_name) && (typeof raw.id === 'string' || Number.isSafeInteger(raw.id)) &&
        call.toolCallId === (typeof raw.id === 'string' && raw.id.startsWith(prefix) ? raw.id.slice(prefix.length) : `mcp-elicitation:${raw.id}`)) {
        return { source: 'elicitation', server: raw.server_name, name: firstText(meta.tool_title), args: meta.tool_params, displayArgs: meta.tool_params_display, connector: firstText(meta.connector_name), message: firstText(request.message) }
      }
      return null
    }
    // Claude's Write sends file text in rawInput. A null old side on its launch diff is not proof of creation.
    function writeIntent(tool, input) {
      const wire = tool.name, meta = tool._meta?.claudeCode?.toolName
      if (tool.kind !== 'edit' || (wire ?? meta) !== 'Write' || (meta != null && meta !== 'Write')) return null
      const path = typeof input.file_path === 'string' ? input.file_path : input.path
      if (!firstText(path)) return null
      const content = input.content ?? input.file_text ?? input.file_content
      return { path, content: typeof content === 'string' ? content : undefined }
    }
    function toolFace(tool, terminal, approval = false) {
      const input = tool.rawInput ?? {}, out = tool.rawOutput ?? {}
      const blocks = Array.isArray(tool.content) ? tool.content.filter(Boolean) : []
      const mcp = mcpIdentity(tool, approval)
      const path = !mcp && tool.kind !== 'fetch' && firstText(input.file_path, input.path, input.filePath, input.AbsolutePath, input.TargetFile)
      const argv = Array.isArray(input.command) && input.command.length && input.command.every(s => typeof s === 'string') ? input.command : null
      // Display argv as reported; joining it into a shell command would lose argument boundaries.
      const command = !mcp ? firstText(input.command, input.CommandLine) ?? (argv && (terminal || tool.kind === 'execute') ? JSON.stringify(argv) : undefined) : undefined
      const kind = mcp ? 'mcp' : kindIcons.has(tool.kind) ? tool.kind : blocks.some(validDiff) ? 'edit' : command ? 'execute' : 'other'
      const locations = (Array.isArray(tool.locations) ? tool.locations : []).filter(l => typeof l?.path === 'string' && l.path)
      const seen = new Set(), targets = [...locations, ...blocks.filter(validDiff).map(b => ({ path: b.path })), ...(path ? [{ path }] : [])].filter(l => {
        const key = `${l.path}:${l.line ?? ''}`
        if (seen.has(key) || (!l.line && seen.has(l.path))) return false
        seen.add(key); seen.add(l.path); return true
      })
      const query = firstText(input.pattern, input.query, input.Query, input.SearchTerm)
      const web = kind === 'fetch' ? webAction(tool, input) : null
      const focus = mcp ? [mcp.server, mcp.name].filter(Boolean).join(' / ') : kind === 'execute' ? command : web ? firstText(web.pattern, web.url, web.queries?.join(', '), web.query, query) : kind === 'search' ? query : kind === 'think' ? firstText(input.description) : undefined
      const lastExit = tool.toolCallId && tool._meta?.terminal_exit?.terminal_id === tool.toolCallId ? tool._meta.terminal_exit : null
      const exitCode = terminal?.exitCode ?? (out.call_id == null || out.call_id === tool.toolCallId ? [out.exitCode, out.exit_code, out.return_code].find(Number.isInteger) : undefined) ?? (Number.isInteger(lastExit?.exit_code) ? lastExit.exit_code : undefined)
      const signal = terminal?.signal ?? firstText(lastExit?.signal)
      return { kind, mcp, web, write: !mcp && writeIntent(tool, input), input, blocks, targets, command, focus, exitCode: mcp ? undefined : exitCode, signal: mcp ? undefined : signal, hasTerminal: !!terminal }
    }

    const explorationKinds = new Set(['read', 'search', 'fetch'])
    function callState(tool, face, live) {
      const out = tool.rawOutput
      if (tool.status === 'cancelled' || tool.status === 'canceled') return 'cancelled'
      if (tool.status === 'failed' || (face.exitCode !== undefined && face.exitCode !== 0) || (face.mcp ? face.mcp.source === 'codex' && Array.isArray(out?.content) && out.isError === true : out?.isError === true || out?.is_error === true) || face.signal) return 'failed'
      if (tool.status === 'completed') return 'completed'
      return live ? (tool.status === 'in_progress' ? 'in_progress' : 'pending') : 'unfinished'
    }

    const callKey = (id, turn) => JSON.stringify([turn ?? null, id])
    /** One read-only index per trace. The same tool ID in a different turn is unrelated.
     * Keep chronological rows intact; the focused view selects the launcher and its direct evidence. */
    function cliActivities(rows) {
      const tools = new Map(), tasks = new Map(), origin = new Map(), requests = new Map(), receiptFor = new Map()
      const keyFor = (r, id) => callKey(id, r.turnId ?? r.data?.turnId)
      // Unbound record-page notifications have no proven turn. A Host-folded trace is already scoped to a single run.
      const unbound = r => r.replay || r.data?.replay || (Object.hasOwn(r, 'turnId') && !r.turnId)
      for (const row of rows) if (!unbound(row) && row.tool?.toolCallId) tools.set(keyFor(row, row.tool.toolCallId), row)
      const taskFor = row => {
        let task = tasks.get(row.seq)
        if (!task) { task = { row, title: firstText(row.tool.rawInput?.description, row.tool.title) ?? row.tool.toolCallId, calls: 0, permissions: [] }; tasks.set(row.seq, task) }
        return task
      }
      for (const row of rows) {
        if (unbound(row)) continue
        if (row.cliTask) taskFor(row)
        const request = row.kind === 'interaction' || row.type === 'interaction'
        let id = row.cliParent
        if (request) {
          const requestCall = row.data?.params?.toolCall, call = tools.get(keyFor(row, row.toolCallId ?? requestCall?.toolCallId))
          if (call) receiptFor.set(row.seq, call.seq)
          const reported = id ?? cliParentOf(requestCall)
          id = call?.cliParent === null || (reported && call?.cliParent && reported !== call.cliParent) ? null : reported ?? call?.cliParent
        }
        if (id) {
          const parent = tools.get(keyFor(row, id))
          if (parent && parent !== row) { const task = taskFor(parent); origin.set(row.seq, task); if (row.tool) task.calls++ }
        }
        if (request) requests.set(row.id ?? row.data?.id, row.seq)
        else if (row.kind === 'answered' || row.kind === 'expired' || row.type === 'interaction-result' || row.type === 'interaction-expired') {
          const seq = requests.get(row.id ?? row.data?.id)
          if (origin.has(seq)) origin.set(row.seq, origin.get(seq))
          if (receiptFor.has(seq)) receiptFor.set(row.seq, receiptFor.get(seq))
        }
      }
      for (const [id, seq] of requests) {
        const direct = origin.get(seq), launch = tasks.get(receiptFor.get(seq))
        if (direct) direct.permissions.push(id)
        if (launch && launch !== direct) launch.permissions.push(id)
      }
      return { tasks, origin, receiptFor }
    }

    /** Show the exact permission receipt on its call; never infer a decision from the tool's final status. */
    function callPermissions(rows) {
      const byCall = new Map(), byRequest = new Map()
      for (const row of rows) {
        const raw = row.data, req = row.kind === 'interaction' && row.interaction === 'permission' ? row :
          row.type === 'interaction' && raw?.kind === 'permission' ? { id: raw.id, toolCallId: raw.params?.toolCall?.toolCallId, turnId: raw.turnId } : null
        if (req?.id && req.toolCallId) {
          const key = callKey(req.toolCallId, req.turnId), list = byCall.get(key) ?? [], item = { id: req.id, label: 'permitRequested' }
          list.push(item); byCall.set(key, list); byRequest.set(req.id, item)
        } else if (row.kind === 'answered' || row.type === 'interaction-result' || row.kind === 'expired' || row.type === 'interaction-expired') {
          const data = raw ?? row, item = byRequest.get(data.id)
          if (!item) continue
          const kind = data.optionKind
          item.label = row.kind === 'expired' || row.type === 'interaction-expired' ? 'permitExpired' :
            data.automatic === 'full-access' ? 'permitAutomatic' : ['allow_once', 'allow_always'].includes(kind) ? 'permitAllowed' : ['reject_once', 'reject_always'].includes(kind) ? 'permitDenied' : 'permitAnswered'
          item.choice = data.optionName ?? data.optionId ?? data.result?.outcome?.optionId
        }
      }
      return byCall
    }

    /** A view over canonical rows; never reorder, replace or execute provider calls. Only completed, plainly presented exploration is compactable. */
    function projectCallRuns(rows, cwd, approvals = callPermissions(rows), tasks = new Map()) {
      const items = []
      let run, groups = 0
      for (const row of rows) {
        const tool = row.tool
        if (row.kind !== 'tool' || row.replay || row.terminal || tasks.has(row.seq) || row.cliTask || row.cliParent !== undefined || !tool?.toolCallId || !explorationKinds.has(tool.kind) || tool.status !== 'completed' || approvals.has(callKey(tool.toolCallId, row.turnId))) { items.push(row); run = null; continue }
        const face = toolFace(tool), raw = tool.rawOutput
        const rawBlocks = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : EMPTY
        if (face.mcp || callState(tool, face, false) !== 'completed' || raw?.error || face.command || face.input.old_string !== undefined || face.input.new_string !== undefined ||
          face.blocks.some(b => !plainText(b)) || rawBlocks.some(b => !plainText(b))) { items.push(row); run = null; continue }
        if (!run || run.section !== row.section || run.turnId !== row.turnId) {
          run = { kind: 'call-run', seq: row.seq, section: row.section, turnId: row.turnId, rows: [], reads: 0, searches: 0, web: 0, paths: new Set(), last: null }
        }
        run.rows.push(row)
        if (tool.kind === 'read') { run.reads++; for (const file of face.targets) run.paths.add(file.path) }
        else if (tool.kind === 'search') run.searches++
        else run.web++
        const path = face.targets[0]?.path
        run.last = face.focus || (path && (cwd && path.startsWith(cwd + '/') ? path.slice(cwd.length + 1) : path)) || null
        if (run.rows.length === 1) items.push(row)
        else if (run.rows.length === 2) { items[items.length - 1] = run; groups++ }
      }
      return { items, groups, approvals }
    }

    // Build result bodies on expansion only. Prefer ACP display content over the raw
    // result; keep non-text blocks such as screenshots alongside a terminal transcript.
    function resultBody(tool, face) {
      const { blocks } = face, raw = tool.rawOutput
      const display = blocks.filter(plainText).map(b => unfence(unwrap(b).text)).join('\n')
      const rawBlocks = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []
      const io = [raw?.stdout, raw?.stderr].filter(x => typeof x === 'string' && x).join('\n')
      const terminalOutput = (face.kind === 'execute' || face.hasTerminal) && (raw?.call_id == null || raw.call_id === tool.toolCallId) ? firstText(raw?.aggregated_output) ?? (io || firstText(raw?.output)) : undefined
      const patchOutput = face.kind === 'edit' && raw?.call_id === tool.toolCallId && typeof raw?.success === 'boolean' && raw.changes && typeof raw.changes === 'object' ? io : undefined
      const text = terminalOutput || display || patchOutput || firstText(raw, raw?.output, raw?.content, raw?.text, raw?.error?.message, raw?.error, raw?.message) || rawBlocks.filter(plainText).map(b => unfence(unwrap(b).text)).join('\n')
      return { text, terminalOutput, display, note: terminalOutput && display && display !== text ? display : patchOutput && display && patchOutput !== text ? patchOutput : null, extras: (blocks.length ? blocks : rawBlocks).filter(b => b && !plainText(b) && !(Array.isArray(tool.content) && !blocks.length && validDiff(b))) }
    }

    // Only parse complete, recognizable formats. An arbitrary CLI result must not
    // acquire invented file line numbers, match counts or shell exit codes.
    function webAddress(value) {
      if (typeof value !== 'string' || !/^https?:\/\//iu.test(value) || /[\s\\\p{Cc}]/u.test(value)) return null
      try { const u = new URL(value); return u.hostname && !u.username && !u.password ? value : null } catch { return null }
    }
    const textList = value => Array.isArray(value) && value.every(v => typeof v === 'string') ? value.filter(v => v.trim()) : []
    function webAction(tool, input) {
      const name = firstText(tool.name, tool._meta?.claudeCode?.toolName), same = !tool.name || !tool._meta?.claudeCode?.toolName || tool.name === tool._meta.claudeCode.toolName
      const url = firstText(input.url, input.Url), query = firstText(input.query, input.Query, input.SearchTerm)
      const mode = same && name === 'WebSearch' ? 'search' : same && name === 'WebFetch' ? 'page' : 'unknown'
      const a = input.action
      if (!name && typeof input.query === 'string' && a && ['search', 'open_page', 'find_in_page'].includes(a.type)) {
        const queries = textList(a.queries)
        return { mode: a.type === 'open_page' ? 'page' : a.type === 'find_in_page' ? 'find' : 'search', url: firstText(a.url), query, queries: [...new Set([...queries, firstText(a.query)].filter(Boolean))], pattern: firstText(a.pattern) }
      }
      return { mode, url, query, prompt: same && name === 'WebFetch' ? firstText(input.prompt) : undefined,
        offset: same && name === 'WebFetch' && Number.isSafeInteger(input.offset) && input.offset >= 0 ? input.offset : undefined,
        allowed: mode === 'search' ? textList(input.allowed_domains) : [], blocked: mode === 'search' ? textList(input.blocked_domains) : [] }
    }
    // The Claude adapter emits one “Title (url)” line per hit, interleaved with plain commentary.
    // Don't parse a fetched page, an error or a query as a list of visited URLs.
    function webSections(text, mixed) {
      if (!text) return []
      const sections = [], lines = text.split(/\r?\n/u)
      for (const line of lines) {
        const hit = /^(.+) \((https?:\/\/[^\s]+)\)$/iu.exec(line), url = hit && webAddress(hit[2])
        if (!url && !mixed) return [{ text }]
        const last = sections.at(-1)
        if (url) { const source = { title: hit[1], url }; if (last?.sources) last.sources.push(source); else sections.push({ sources: [source] }) }
        else if (last && !last.sources) last.text += '\n' + line
        else sections.push({ text: line })
      }
      return sections
    }
    function numberedRead(text) {
      const rows = text.replace(/\r?\n$/u, '').split(/\r?\n/u).map(line => /^\s*(\d+)\t(.*)$/u.exec(line))
      if (rows.some((row, i) => !row || !Number.isSafeInteger(+row[1]) || +row[1] < 1 || (i && +row[1] <= +rows[i - 1][1]))) return null
      return rows.map(row => ({ number: +row[1], text: row[2] }))
    }
    function searchResult(raw, text, input = {}) {
      const mode = raw?.mode ?? input.output_mode ?? ([true, 'true'].includes(input['-c']) ? 'count' : undefined)
      // Grep count output is not a line location. Keep its original text instead of numbering or linking it.
      if (mode === 'count') return null
      const paths = raw?.filenames ?? raw?.paths, listed = Array.isArray(paths) && paths.every(p => typeof p === 'string' && p.trim())
      if (mode !== 'content' && listed && (paths.length || !text)) return { kind: 'paths', paths, total: paths.length, truncated: raw.truncated === true }
      if (mode === 'files_with_matches') return null // prose or an unstructured file list is not path:line:content
      const output = mode === 'content' ? firstText(raw?.content, text) : text
      if (!output) return null
      const files = new Map(), rows = output.replace(/\r?\n$/u, '').split(/\r?\n/u)
      const single = mode === 'content' && listed && paths.length === 1 && (raw.numFiles == null || raw.numFiles === 1) ? paths[0] : null
      for (const line of rows) {
        if (!single && mode === 'content' && /^\d+:/u.test(line)) return null
        const bare = single && /^(\d+):(.*)$/u.exec(line)
        const m = bare ? [null, single, bare[1], bare[2]] : /^(.+?):(\d+):(.*)$/u.exec(line)
        if (!m || !Number.isSafeInteger(+m[2]) || +m[2] < 1) return null
        if (!files.has(m[1])) files.set(m[1], { path: m[1], matches: [] })
        files.get(m[1]).matches.push({ lineNumber: +m[2], line: m[3] })
      }
      return { kind: 'matches', files: [...files.values()], total: rows.length, truncated: raw?.truncated === true }
    }

    // Membership comes from the current target, never the unrelated session that edited the task.
    function schedulesInProject(project, tasks) {
      return tasks.filter(({ target }) => target.kind === 'session' ? project.sessionIds.includes(target.sessionId) : target.create?.cwd === project.path)
    }
    function scheduleRequest(project, draft, roots, presets) {
      const title = draft.title.trim(), prompt = draft.prompt.trim()
      if (!title || !prompt) return null
      let target
      if (draft.target === 'session') {
        if (!roots.some(r => r.id === draft.sessionId)) return null
        target = { kind: 'session', sessionId: draft.sessionId }
      } else {
        if (!['new_once', 'new'].includes(draft.target) || (draft.preset && !presets.some(p => p.id === draft.preset && !p.broken))) return null
        target = { kind: draft.target, create: { cwd: project.path, ...(draft.preset ? { agentPreset: draft.preset } : {}) } }
      }
      let timing
      if (draft.cadence === 'after' || draft.cadence === 'every') {
        const seconds = Number(draft.minutes) * 60
        if (!Number.isSafeInteger(seconds) || seconds < (draft.cadence === 'every' ? 60 : 1)) return null
        timing = { kind: draft.cadence, [draft.cadence + '_seconds']: seconds }
      } else if (draft.cadence === 'daily' && draft.time && draft.zone.trim()) timing = { kind: 'daily', daily: { time: draft.time, time_zone: draft.zone.trim() } }
      else if (draft.cadence === 'cron' && draft.expr.trim() && draft.zone.trim()) timing = { kind: 'cron', cron: { expression: draft.expr.trim(), time_zone: draft.zone.trim() } }
      else return null
      return { title, prompt, timing, target }
    }

    /** Ordered, labelled controls for every option the CLI actually advertised. */
    function configEntries(session, t) {
      const entries = []
      for (const option of session.configOptions ?? []) {
        if (!option?.id) continue
        const label = option.name ?? option.id
        if (option.type === 'boolean') entries.push({ id: option.id, label, category: option.category, kind: 'boolean', value: !!option.currentValue, op: value => ({ configId: option.id, value }) })
        else entries.push({ id: option.id, label, category: option.category, kind: 'select', value: option.currentValue ?? '',
          options: (option.options ?? []).flatMap(group => group.options ?? [group]).map(item => ({ value: item.value, label: item.name ?? String(item.value) })),
          op: value => ({ configId: option.id, value }) })
      }
      if (!entries.some(entry => entry.category === 'mode') && session.modes?.availableModes?.length) {
        entries.push({ id: '__mode', label: t('mode'), category: 'mode', kind: 'select', value: session.modes.currentModeId ?? '',
          options: session.modes.availableModes.map(mode => ({ value: mode.id, label: mode.name ?? mode.id })), op: value => ({ modeId: value }) })
      }
      if (!entries.some(entry => entry.category === 'model') && session.models?.availableModels?.length) {
        entries.push({ id: '__model', label: t('model'), category: 'model', kind: 'select', value: session.models.currentModelId ?? '',
          options: session.models.availableModels.map(model => ({ value: model.modelId, label: model.name ?? model.modelId })), op: value => ({ modelId: value }) })
      }
      return entries
    }

    return {
      name: 'acp-workbench', inject: ['slots', 'locale', 'uiWorkspace', 'uiConversation', 'workspaces', 'sessions', 'inputTriggers'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'acp-workbench: locale')
        const t = ctx.locale.bind(NS)
        const subscribeLocale = listener => ctx.locale.subscribe(listener)
        const localeSnapshot = () => ctx.locale.getSnapshot()
        function useT() { React.useSyncExternalStore(subscribeLocale, localeSnapshot); return t }
        const stateText = state => t(`state.${state}`)

        // One stylesheet for every dock, trace and page instance.
        ctx.effect(() => {
          const style = document.createElement('style')
          style.setAttribute('data-acp-workbench', '')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'acp-workbench: styles')

        // One shared change feed. Browsers cap concurrent connections per origin, so every
        // dock, trace and page subscribes here instead of opening its own EventSource.
        const feed = { listeners: new Set(), watchers: new Set(), online: 'connectingFeed', stream: null }
        // Copy first: a listener may unsubscribe while being notified.
        const notify = (set, change) => { for (const listener of Array.from(set)) listener(change) }
        const setOnline = value => { if (feed.online !== value) { feed.online = value; notify(feed.watchers) } }
        function subscribeLive(listener) {
          feed.listeners.add(listener)
          if (!feed.stream) {
            const stream = new EventSource('/acp-workbench/events')
            setOnline('connectingFeed')
            stream.addEventListener('open', () => { if (feed.stream === stream) setOnline('live') })
            // The server sends the current revision on every (re)connect, so a message also covers recovery.
            stream.addEventListener('message', event => {
              if (feed.stream !== stream) return
              setOnline('live')
              let change
              try { change = JSON.parse(event.data) } catch { /* Unknown revision format: refresh all subscribers. */ }
              notify(feed.listeners, change)
            })
            stream.addEventListener('error', () => { if (feed.stream === stream) setOnline('offline') })
            feed.stream = stream
          }
          return () => {
            feed.listeners.delete(listener)
            if (!feed.listeners.size) { feed.stream?.close(); feed.stream = null }
          }
        }
        const watchOnline = listener => { feed.watchers.add(listener); return () => feed.watchers.delete(listener) }
        const useOnline = () => React.useSyncExternalStore(watchOnline, () => feed.online)
        ctx.effect(() => () => { feed.stream?.close(); feed.stream = null; feed.listeners.clear(); feed.watchers.clear() }, 'acp-workbench: live updates')

        // Only a mounted writable composer fetches its CLI catalog. The reserved
        // leading /cli: spelling stays inert on paste or restore, even without a catalog.
        const commandScopes = new Map()
        function useCommandScope(sessionId, id, revision, label) {
          React.useEffect(() => {
            if (!id || !revision) return
            const scope = { id, stamp: revision, label, commands: null }
            commandScopes.set(sessionId, scope)
            return () => { if (commandScopes.get(sessionId) === scope) commandScopes.delete(sessionId) }
          }, [sessionId, id, revision, label])
        }
        const qualified = /^\/cli:([^\s]+)$/u
        function commandClaim(name, sessionId, scope, hint) {
          return { name: 'cli:' + name, token: '/cli:' + name + ' ', hint, attachments: false,
            async submit(args) {
              const live = commandScopes.get(sessionId)
              if (!scope || scope.id !== live?.id || scope.stamp !== live.stamp) return { kind: 'error', text: t('cliCommandStale') }
              try {
                await api({ action: 'native-command', dshSessionId: sessionId, externalId: scope.id, commandStamp: scope.stamp, command: name, arguments: args })
                return { kind: 'success' }
              } catch (error) { return { kind: 'error', text: error.message } }
            } }
        }
        ctx.effect(() => ctx.inputTriggers.registerSource({
          trigger: '/', name: 'acp-workbench', showGroupTitle: false, order: 50,
          async candidates({ sessionId }, { position, query, signal }) {
            const scope = commandScopes.get(sessionId)
            if (!scope || position !== 'leading' || signal.aborted) return EMPTY
            if (!scope.commands) {
              const detail = await api({ action: 'get', sessionId: scope.id }, signal)
              if (signal.aborted || commandScopes.get(sessionId) !== scope || detail.commandStamp !== scope.stamp) return EMPTY
              scope.commands = detail.commands
            }
            const needle = query.toLowerCase().replace(/^cli:/, '')
            const rank = c => { const n = c.name.toLowerCase(); return n === needle ? 0 : n.startsWith(needle) ? 1 : 2 }
            return scope.commands.filter(c => c.name.toLowerCase().includes(needle)).toSorted((a, b) => rank(a) - rank(b)).map(c => ({
              name: '/cli:' + c.name, section: t('cliCommandGroup', { name: scope.label }),
              description: [c.description, c.input?.hint].filter(Boolean).join(' · '), value: scope.stamp }))
          },
          onPick({ candidate, session: { sessionId }, position, via, action }) {
            if (position !== 'leading' || via !== 'menu' || action !== 'pick') return
            const scope = commandScopes.get(sessionId), name = candidate.name.slice('/cli:'.length)
            const item = scope && scope.stamp === candidate.value && scope.commands?.find(c => c.name === name)
            return { claim: commandClaim(name, sessionId, item ? scope : null, item?.input?.hint || item?.description) }
          },
          // DSH persists the chip spelling, not its credential. Never bind a restored draft to
          // whatever engine happens to be selected now. Keep the arguments editable on error.
          async matchClaim({ sessionId }, token) {
            const name = qualified.exec(token)?.[1]
            if (name) return commandClaim(name, sessionId, null, t('cliCommandStale'))
          },
          async matchEnter({ sessionId }, line) {
            const name = qualified.exec(line.split(/\s/u, 1)[0])?.[1]
            if (name) return { claim: commandClaim(name, sessionId, null, t('cliCommandStale')) }
          },
        }), 'acp-workbench: CLI composer commands')

        const nativeSources = new Map()
        function nativeSource(sessionId) {
          const existing = nativeSources.get(sessionId)
          if (existing) return existing
          const listeners = new Set()
          let current = { data: null, error: '' }
          let controller = null
          let unsubscribe = null
          let loading = false
          let again = false
          const publish = value => { current = value; notify(listeners) }
          const refresh = async () => {
            if (!controller) return
            if (loading) { again = true; return }
            const own = controller
            loading = true
            try {
              do {
                again = false
                try {
                  const data = await api({ action: 'native-snapshot', dshSessionId: sessionId }, own.signal)
                  if (!own.signal.aborted) publish({ data, error: '', optionsRoute: current.optionsRoute === data.selected?.provider ? current.optionsRoute : null })
                } catch (error) { if (!own.signal.aborted) publish({ ...current, error: error.message }) }
              } while (again && !own.signal.aborted)
            } finally { loading = false }
            // A new subscription began while the previous one was still loading.
            if (controller && controller !== own) void refresh()
          }
          const stop = () => {
            controller?.abort(); controller = null; unsubscribe?.(); unsubscribe = null
            current = { data: null, error: '' }
            if (nativeSources.get(sessionId) === source) nativeSources.delete(sessionId)
          }
          const source = {
            getSnapshot: () => current,
            setOptions: route => publish({ ...current, optionsRoute: route }),
            refresh,
            stop,
            subscribe(listener) {
              listeners.add(listener)
              if (listeners.size === 1) {
                nativeSources.set(sessionId, source)
                controller = new AbortController()
                unsubscribe = subscribeLive(change => {
                  if (!Array.isArray(change?.conversations) || change.conversations.includes(sessionId)) void refresh()
                })
                void refresh()
              }
              return () => { listeners.delete(listener); if (!listeners.size) stop() }
            },
          }
          nativeSources.set(sessionId, source)
          return source
        }
        ctx.effect(() => () => { for (const source of nativeSources.values()) source.stop(); nativeSources.clear() }, 'acp-workbench: native subscriptions')

        function useNative(sessionId) {
          const source = React.useMemo(() => nativeSource(sessionId), [sessionId])
          const snapshot = React.useSyncExternalStore(source.subscribe, source.getSnapshot)
          const [pending, setPending] = React.useState(0)
          const [error, setError] = React.useState('')
          const run = React.useCallback(async op => {
            setPending(count => count + 1); setError('')
            try { const result = await api(op); void source.refresh(); return result }
            catch (failure) { setError(failure.message); return null }
            finally { setPending(count => count - 1) }
          }, [source])
          return { ...snapshot, setOptions: source.setOptions, busy: pending > 0, error: error || snapshot.error, run }
        }

        function useDiffLabels() {
          const locale = React.useSyncExternalStore(subscribeLocale, localeSnapshot)
          return React.useMemo(() => ({
            copy: t('copy'), copied: t('copied'), wrapLabel: t('wrap'), unwrapLabel: t('unwrap'), codeLabel: t('code'),
            expand: n => t('expandLines', { n }), collapse: t('collapseLines'), expandAria: n => t('expandLinesAria', { n }), collapseAria: t('collapseLinesAria'),
          }), [locale])
        }
        const truncated = n => t('truncated', { n: number(n) })
        const Json = ({ label, payload, open }) => h(JsonBlock, { label, payload, defaultOpen: !!open, truncatedLabel: truncated })
        const Toggle = ({ open, onClick, label }) => h('button', { type: 'button', className: 'aw-toggle', 'aria-expanded': open, 'aria-label': label, title: label, onClick },
          h(open ? IconChevronUpOutlineRegular : IconChevronDownOutlineRegular, { size: 14 }))
        function Status({ state, live = true }) {
          return h('span', { className: 'aw-row', style: { gap: 6, flexWrap: 'nowrap' } }, h(StateDot, { state: settle(DOT[state] ?? 'idle', live), size: 8 }), h('span', { className: 'aw-ellipsis' }, stateText(state)))
        }

        function useToolLabels() {
          const common = useDiffLabels()
          return React.useMemo(() => ({ ...common,
            window: shown => t('linesReturned', { n: shown }), pathsSummary: shown => t('pathsReturned', { n: shown }),
            matchesSummary: (shown, _total, files) => t('hitsReturned', { n: shown, files }), noResults: t('noHits'),
            commandLine: n => t('lineNumber', { n }), signal: signal => t('terminalSignal', { signal }), exitCode: n => t('exitCode', { n }),
            noExitCode: t('noExit'), running: t('call.in_progress'), failed: t('call.failed'), done: t('call.completed'), noOutput: t('noShellOutput'),
          }), [common])
        }

        // Index only the fragments from this call. An empty side can be an insertion/deletion
        // inside a file; only an explicit, same-frame FileChange identifies a file operation.
        function patchInventory(tool, blocks, frame) {
          const files = new Map(), diffs = []
          const get = path => { if (!files.has(path)) files.set(path, { path, fragments: [] }); return files.get(path) }
          for (const b of blocks) if (validDiff(b)) {
            const diff = { path: b.path, oldText: b.oldText ?? null, newText: b.newText }
            get(b.path).fragments.push(diff); diffs.push(diff)
          }
          const raw = frame?.rawKey && tool[frame.rawKey], changes = raw?.changes
          if (tool.kind === 'edit' && tool.toolCallId && raw?.call_id === tool.toolCallId && changes && typeof changes === 'object' && !Array.isArray(changes)) {
            const paths = new Set([...files.keys(), ...(Array.isArray(tool.locations) ? tool.locations : EMPTY).map(l => l?.path)])
            for (const [from, op] of Object.entries(changes)) {
              const type = op?.type
              if (!from || !(type === 'update' ? typeof op.unified_diff === 'string' && (op.move_path == null || (typeof op.move_path === 'string' && op.move_path)) : ['add','delete'].includes(type) && typeof op.content === 'string')) continue
              const path = type === 'update' && op.move_path || from
              if (!paths.has(path)) continue
              const file = get(path)
              // Two sources claiming the same destination are not an unambiguous move.
              if (file.op !== undefined) { file.op = null; continue }
              file.op = { kind: path !== from ? 'move' : type === 'update' ? 'updateFile' : type, from }
            }
          }
          return { files, diffs }
        }

        function PatchPreview({ inventory, frame, targets, cwd, openFile }) {
          const labels = useDiffLabels(), [selection, select] = React.useState(null)
          const { files, diffs } = inventory
          if (!files.size) return null
          const all = selection === '' && files.size > 1, file = files.get(selection) ?? files.values().next().value
          const items = all ? diffs : file.fragments, stage = frame?.stage ?? 'recorded'
          const locations = files.size > 1 ? targets.filter(l => (all ? files.has(l.path) : l.path === file.path) && (l.line > 0 || (openFile && reportedPath(l.path, cwd)))) : EMPTY
          return h('section', { className: 'aw-section aw-patch', 'aria-label': t('patch.' + stage) },
            h('div', { className: 'aw-row' }, h(Tag, { tone: 'quiet' }, t('patch.' + stage)), files.size > 1 ? h('label', { className: 'aw-patch-select' }, t('patchFiles', { n: files.size }),
              h('select', { className: 'aw-select', value: all ? '' : file.path, onChange: e => select(e.target.value) },
                h('option', { value: '' }, t('patchAll')), [...files.values()].map(f => h('option', { key: f.path, value: f.path }, (f.op ? t('patch.' + f.op.kind) + ' · ' : '') + f.path)))) : null,
              items.length > 1 ? h('span', { className: 'aw-note' }, t('patchParts', { n: items.length })) : null),
            !all && file.op ? h('div', { className: 'aw-row' }, h(Tag, { tone: 'quiet' }, t('patch.' + file.op.kind)), file.op.kind === 'move' ? h(React.Fragment, null, h(PathLabel, { path: file.op.from }), ' → ', h(PathLabel, { path: file.path })) : h(PathLabel, { path: file.path })) : null,
            items.length ? h(DiffBlock, { key: all ? 'all:' : 'file:' + file.path, labels, maxLines: 10, diffs: items }) : h('p', { className: 'aw-note' }, t('patchNoParts')),
            locations.length ? h('div', { className: 'aw-section' }, openFile ? h('span', { className: 'aw-note' }, t('patchCurrent')) : null, h(ToolTargets, { key: all ? 'all:' : 'file:' + file.path, targets: locations, cwd, openFile })) : null)
        }

        function WritePreview({ write, inventory, frame, targets, cwd, openFile, labels }) {
          const [selection, select] = React.useState(null)
          const hasPatch = inventory.files.size > 0
          const view = hasPatch ? selection ?? (frame?.stage === 'launch' ? 'input' : 'patch') : 'input'
          return h('section', { className: 'aw-section aw-write', 'aria-label': t('writeView') },
            h('div', { className: 'aw-row' }, hasPatch ? h('label', null, t('writeView'), ' ', h('select', { className: 'aw-select', value: view, onChange: e => select(e.target.value) },
              h('option', { value: 'input' }, t('writeInput')), h('option', { value: 'patch' }, t('writePatch')))) : h(Tag, { tone: 'quiet' }, t('writeInput')),
              view === 'input' && h(PathLabel, { path: write.path })),
            view === 'patch' ? h(PatchPreview, { inventory, frame, targets, cwd, openFile }) : write.content === '' ? h('p', { className: 'aw-note' }, t('writeEmpty')) :
              h('div', { className: 'aw-code-window' }, h(CodeBlock, { code: write.content, lang: write.path.match(/\.([a-z0-9]+)$/iu)?.[1].toLowerCase() ?? 'text', copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels })))
        }

        function Block({ block }) {
          const content = block.type === 'content' ? block.content : block
          if (block.type === 'terminal') return h('p', { className: 'aw-note' }, t('terminal', { id: block.terminalId ?? '' }))
          if (content?.type === 'text') return h('div', { className: 'aw-text' }, content.text)
          if (content?.type === 'image' && content.data && /^image\/(png|jpeg|webp|gif)$/.test(content.mimeType ?? '')) {
            return h('img', { className: 'aw-img', src: `data:${content.mimeType};base64,${content.data}`, alt: t('imageResult'), loading: 'lazy' })
          }
          if (content?.type === 'resource_link') return h('div', { className: 'aw-field' },
            /^https?:\/\//iu.test(content.uri) ? h('a', { href: content.uri, target: '_blank', rel: 'noopener noreferrer' }, content.name || content.uri) : h('span', { className: 'aw-mono' }, content.name || content.uri),
            content.description ? h('p', { className: 'aw-note' }, content.description) : null)
          if (content?.type === 'resource' && typeof content.resource?.text === 'string') {
            return h('div', { className: 'aw-field' }, h('span', { className: 'aw-mono' }, content.resource.uri ?? ''), h('pre', { className: 'aw-log' }, content.resource.text))
          }
          if (content?.type === 'audio' && typeof content.data === 'string' && /^audio\/(wav|mpeg|ogg|mp4|webm)$/u.test(content.mimeType)) return h('audio', { controls: true, preload: 'none', 'aria-label': content.mimeType, src: `data:${content.mimeType};base64,${content.data}` })
          if (content?.resource?.blob || content?.data) return h('p', { className: 'aw-note' }, [t('resource'), content.resource?.uri, content.resource?.mimeType || content.mimeType].filter(Boolean).join(' · '))
          return h(Json, { label: content?.type ?? block.type ?? 'content', payload: block })
        }

        // A recorded CLI path is not relative to the project panel or to today's DSH workingDirectory.
        // A URI, a shell expansion or a drive-relative Windows path isn't a concrete disk location.
        function reportedPath(path, cwd) {
          if (typeof path !== 'string' || !path.trim() || /\p{Cc}/u.test(path) || /^~(?:[\\/]|$)/u.test(path)) return null
          const windows = p => /^(?:[A-Za-z]:[\\/]|\\\\[^\\/?.][^\\/]*[\\/][^\\/]+)/u.test(p)
          if (windows(path)) return cwd?.startsWith('/') && !cwd.startsWith('//') ? null : path.replace(/\\/gu, '/')
          if (/^(?:[a-z][\w.+-]*:|\\)/iu.test(path)) return null
          if (path.startsWith('/')) return path.includes('\\') || (windows(cwd) && !path.startsWith('//')) ? null : path
          if (!cwd || (!windows(cwd) && (!cwd.startsWith('/') || path.includes('\\')))) return null
          return cwd.replace(/\\/gu, '/').replace(/\/+$/u, '') + '/' + (windows(cwd) ? path.replace(/\\/gu, '/') : path)
        }
        function ToolTargets({ targets, openFile, cwd }) {
          const [limit, setLimit] = React.useState(8)
          return h('div', { className: 'aw-locs' }, targets.slice(0, limit).map(({ path, line }) => {
            const absolute = reportedPath(path, cwd), hasLine = Number.isSafeInteger(line) && line > 0
            const label = path + (hasLine ? ':' + line : '')
            return openFile && absolute ? h('button', { type: 'button', className: 'aw-file-link', key: JSON.stringify([path, line]), title: label, onClick: () => openFile(absolute, hasLine ? { line } : undefined) }, h(PathLabel, { path: label })) : h(PathLabel, { key: JSON.stringify([path, line]), path: label })
          }), targets.length > limit ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setLimit(n => n + 16) }, t('moreTargets')) : null)
        }
        function SearchLocations({ card, openFile, cwd }) {
          const [open, setOpen] = React.useState(false)
          const locations = React.useMemo(() => {
            const seen = new Set(), result = []
            const add = (path, line) => {
              const key = JSON.stringify([path, line]); if (seen.has(key) || !reportedPath(path, cwd)) return
              result.push({ path, line }); seen.add(key)
            }
            if (card.kind === 'paths') for (const path of card.paths) add(path)
            else for (const file of card.files) for (const match of file.matches) add(file.path, match.lineNumber)
            return result
          }, [card, cwd])
          return locations.length ? h('div', { className: 'aw-section' }, h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => setOpen(!open) }, t('reportedHits', { n: locations.length })), open ? h(ToolTargets, { targets: locations, cwd, openFile }) : null) : null
        }

        function FieldList({ value, omit = [], label }) {
          if (!value || typeof value !== 'object' || Array.isArray(value)) return null
          const fields = Object.entries(value).filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v) && !omit.includes(v)).slice(0, 8)
          return fields.length ? h('div', { className: 'aw-field' }, h('span', null, label), h('dl', { className: 'aw-params' }, fields.map(([key, v]) =>
            h('div', { key }, h('dt', null, key), h('dd', null, String(v).slice(0, 1000), String(v).length > 1000 ? '…' : ''))))) : null
        }

        // Chat, Activity and the permission dock use the same recorded data. Approval
        // previews show intent, never imply that the command or edit already ran.
        function CommandReport({ term, face, final, cwd, labels, live, state }) {
          const [selected, select] = React.useState('stream'), gotStream = typeof term.text === 'string'
          const distinct = gotStream && final != null && final !== term.text, useFinal = !gotStream || (distinct && selected === 'final')
          const text = useFinal ? final : term.text, clipped = useFinal ? text?.length > 32768 : term.clipped
          const running = live && state === 'in_progress' && !term.exited, { exitCode, signal } = face
          return h('section', { className: 'aw-section aw-command-report', 'aria-label': t('outputView') },
            h('div', { className: 'aw-row' }, distinct ? h('label', null, t('outputView'), ' ', h('select', { className: 'aw-select', value: useFinal ? 'final' : 'stream', onChange: e => select(e.target.value) },
              h('option', { value: 'stream' }, t('streamReport')), h('option', { value: 'final' }, t('finalReport')))) : h(Tag, { tone: 'quiet' }, t(useFinal && final != null ? 'finalReport' : 'streamReport')),
              exitCode === 0 && h(Tag, { tone: 'quiet' }, t('exitCode', { n: 0 })), !term.exited && exitCode === undefined && !running && h('span', { className: 'aw-note' }, t('awaitingExit'))),
            !useFinal && term.partial && h('span', { className: 'aw-note' }, t('outputPartial')), clipped && h('span', { className: 'aw-note' }, t('outputTail')),
            face.command ? h(TerminalBlock, { command: face.command, output: text?.slice(-32768), cwd, labels, maxLines: 10, running,
              signal, exitCode: exitCode ?? (term.exited && !signal ? null : undefined), runStateDot: running || (!!signal || exitCode !== undefined) && !(state === 'failed' && exitCode === 0) }) :
              h(React.Fragment, null, h('span', { className: 'aw-note' }, signal ? t('terminalSignal', { signal }) : exitCode !== undefined ? t('exitCode', { n: exitCode }) : term.exited ? t('noExit') : null),
                text ? h('pre', { className: 'aw-log' }, text.slice(-32768)) : null))
        }
        // Nested values open on demand. A string remains a literal even when it looks like JSON,
        // a file name or a command. Raw MCP data never becomes an actionable workspace target.
        function McpValue({ value, root = false }) {
          const [open, setOpen] = React.useState(false), [limit, more] = React.useState(8)
          if (value === undefined) return h('span', { className: 'aw-note' }, t('mcpAbsent'))
          const array = Array.isArray(value), object = value !== null && typeof value === 'object'
          if (!object) {
            const str = value === '' ? '""' : String(value), cut = str.length > 480
            return h('span', { className: 'aw-mcp-value' }, cut && !open ? str.slice(0, 480) + '…' : str, cut && h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => setOpen(!open) }, t(open ? 'mcpLess' : 'mcpMore')))
          }
          const keys = array ? null : Object.keys(value), count = array ? value.length : keys.length, shown = Math.min(limit, count), label = t(array ? 'mcpItems' : 'mcpFields', { n: count })
          // Small, flat record lists can be scanned as a table. Never sample a few rows and silently drop other fields.
          const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v)
          const columns = array && (root || open) && count >= 2 && count <= 128 && plain(value[0]) ? Object.keys(value[0]) : EMPTY
          const table = columns.length > 0 && columns.length <= 5 && value.every(row => plain(row) && Object.keys(row).length === columns.length && columns.every(k => Object.hasOwn(row, k) && (row[k] == null || typeof row[k] !== 'object')))
          return h('div', { className: 'aw-mcp-data' }, root || !count ? h('span', { className: 'aw-note' }, label) : h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => setOpen(!open) }, label),
            table ? h('div', { className: 'aw-mcp-grid' }, h('table', { 'aria-label': t('mcpTable') }, h('thead', null, h('tr', null, h('th', { scope: 'col' }, '#'), columns.map(k => h('th', { key: k, scope: 'col' }, k)))),
              h('tbody', null, value.slice(0, shown).map((row, i) => h('tr', { key: i }, h('th', { scope: 'row' }, i + 1), columns.map(k => h('td', { key: k }, h(McpValue, { value: row[k] })))))))) :
            (root || open) && count > 0 && h('dl', null, Array.from({ length: shown }, (_, i) => { const key = array ? i : keys[i]; return h('div', { key }, h('dt', null, array ? '#' + (i + 1) : key), h('dd', null, h(McpValue, { value: value[key] }))) })),
            (root || open) && count > shown && h(Button, { size: 'sm', variant: 'ghost', onClick: () => more(n => n + 12) }, t('mcpMore')))
        }
        function McpDisplayArgs({ entries }) {
          const [limit, more] = React.useState(8)
          return h('div', { className: 'aw-mcp-data' }, h('dl', null, entries.slice(0, limit).map((entry, i) => {
            const key = firstText(entry?.display_name, entry?.name), known = key && Object.hasOwn(entry, 'value')
            return h('div', { key: i }, h('dt', null, key || '#' + (i + 1), key && firstText(entry.name) && entry.name !== key && h('small', { className: 'aw-note' }, ' · ' + entry.name)),
              h('dd', null, h(McpValue, { value: known ? entry.value : entry })))
          })), entries.length > limit && h(Button, { size: 'sm', variant: 'ghost', onClick: () => more(n => n + 12) }, t('mcpMore')))
        }
        function McpReport({ tool, face, approval }) {
          const id = React.useId(), [chosen, choose] = React.useState(null), m = face.mcp, raw = tool.rawOutput
          // The Codex adapter forwards CallToolResult as rawOutput and also projects the ACP-compatible
          // content blocks. Render the original list once, including unrecognized items in original order.
          const envelope = !approval && m.source === 'codex' && Array.isArray(raw?.content)
          const hasStructure = envelope && Object.hasOwn(raw, 'structuredContent'), rawItems = envelope ? raw.content : null
          const display = face.blocks.filter(b => !validDiff(b)), hasDisplay = Array.isArray(tool.content)
          const content = rawItems ?? display, result = !approval && (content.length > 0 || raw != null)
          const tabs = [['args', 'mcpArgs']]
          if (result) tabs.push(['result', envelope || !display.length ? 'mcpOutput' : 'mcpContent'])
          if (envelope && hasDisplay && (display.length || rawItems.length)) tabs.push(['display', 'mcpContent'])
          const tab = tabs.some(([v]) => v === chosen) ? chosen : result ? 'result' : 'args'
          const section = (key, node) => h('div', { className: 'aw-mcp-content' }, h('span', { className: 'aw-note' }, t(key)), node)
          const part = (b, i) => {
            const c = unwrap(b)
            if (!c || typeof c !== 'object' || typeof c.type !== 'string' || (c.type === 'text' && typeof c.text !== 'string') ||
              (c.type === 'resource_link' && (typeof c.uri !== 'string' || typeof c.name !== 'string' || (c.description != null && typeof c.description !== 'string'))))
              return h(McpValue, { value: b, root: true, key: i })
            return h(Block, { block: b, key: i })
          }
          const serverPart = (b, i) => b && ['text','image','audio','resource','resource_link'].includes(b.type) ? part(b, i) : h(Json, { key: i, label: firstText(b?.type) || t('mcpOutput'), payload: b })
          return h('section', { className: 'aw-mcp', 'aria-label': t('call.mcp') }, h('div', { className: 'aw-mcp-head' }, h(Tag, { tone: 'quiet', title: t('mcpSource') }, m.server), m.name && h('strong', null, m.name), m.connector && h('span', { className: 'aw-note' }, m.connector)),
            result ? h(SegmentedTabs, { size: 'sm', label: t('call.mcp'), value: tab, onChange: choose, items: tabs.map(([v,k]) => ({ id: id + v, panelId: id, value: v, label: t(k) })) }) : null,
            h('div', { id, className: 'aw-mcp-content', ...(result && { role: 'tabpanel', 'aria-labelledby': id + tab }) }, tab === 'display' ? (display.length ? display.map(part) : h('span', { className: 'aw-note' }, t('mcpEmptyDisplay'))) : tab === 'args' ? h(React.Fragment, null,
              section('mcpArgs', h(McpValue, { value: m.args, root: true })),
              Array.isArray(m.displayArgs) && section('mcpDisplayArgs', h(McpDisplayArgs, { entries: m.displayArgs })), approval && (content.length || m.message) ? section('mcpRequest', content.length ? content.map(part) : h('div', { className: 'aw-text' }, m.message)) : null) : h(React.Fragment, null,
              hasStructure && section('mcpStructured', h(McpValue, { value: raw.structuredContent, root: true })), content.length ? h('div', { className: 'aw-mcp-content' }, content.map(envelope ? serverPart : part)) : !envelope ? h(McpValue, { value: raw, root: true }) : !hasStructure && h('span', { className: 'aw-note' }, t('mcpEmpty')))))
        }
        function WebReport({ tool, face, frame, state, approval, display, labels }) {
          const w = face.web, [limit, more] = React.useState(8)
          const field = (label, value) => value != null && value !== '' ? h('div', { className: 'aw-field' }, h('span', { className: 'aw-note' }, t(label)), h('div', { className: 'aw-text' }, value)) : null
          const address = w.url && (webAddress(w.url) ? h('a', { href: w.url, target: '_blank', rel: 'noopener noreferrer' }, w.url) : w.url)
          const raw = tool.rawOutput, rb = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []
          const rawText = firstText(raw, raw?.error?.message, raw?.error, raw?.message, raw?.output, raw?.text, typeof raw?.content === 'string' && raw.content) || rb.filter(plainText).map(b => unfence(unwrap(b).text)).join('\n')
          const projected = frame !== 'launch' && (display !== w.prompt || frame === 'result' || frame === 'failure') ? display : null
          const preview = frame === 'launch' || approval, report = !approval && (projected || rawText)
          const failed = state === 'failed' || frame === 'failure'
          const sections = report && !failed && (w.mode === 'search' || (w.mode === 'unknown' && !w.url && w.query && !firstText(tool.name, tool._meta?.claudeCode?.toolName))) && projected && frame !== 'update' ? webSections(projected, w.mode === 'search') : []
          const sources = sections.reduce((n, s) => n + (s.sources?.length ?? 0), 0)
          let left = limit, hiddenSources = false
          const terms = [...new Set([...(w.queries ?? []), w.query].filter(Boolean))]
          const label = frame === 'failure' || failed && frame !== 'update' && frame !== 'result' ? 'webFailure' : !projected ? 'webRaw' : frame === 'update' ? 'webUpdate' : 'webResponse'
          return h('div', { className: 'aw-section aw-web-report' }, field('webQuery', terms.join('\n')), field('webAddress', address), field('webPattern', w.pattern), field('webPrompt', w.prompt),
            field('webOffset', w.offset), field('webAllow', w.allowed?.join(', ')), field('webDeny', w.blocked?.join(', ')),
            preview && display && display !== w.prompt ? field('webPreview', display) : null,
            report ? h('div', { className: 'aw-section' }, h('div', { className: 'aw-row' }, h('strong', { className: 'aw-strong' }, t(label)), sources > 0 && h(Tag, { tone: 'quiet' }, t('webSourceCount', { n: sources }))), sources ? sections.map((section, i) => {
              if (hiddenSources) return null
              if (!section.sources) return section.text && h('div', { key: i, className: 'aw-output aw-text' }, section.text)
              const visible = section.sources.slice(0, left); left -= visible.length; hiddenSources = visible.length < section.sources.length
              return visible.length ? h(WebBlock, { key: i, kind: 'search', sources: visible, truncated: false, labels }) : null
            }) : h('div', { className: 'aw-output aw-text' }, report), sources > limit && h(Button, { size: 'sm', variant: 'ghost', onClick: () => more(limit + 12) }, t('webMore', { n: sources - limit }))) :
              !approval && (state === 'completed' || state === 'failed') ? h('p', { className: 'aw-note' }, t('webNoReport')) : null)
        }

        function ToolDetails({ tool, face, live, approval, cwd, openFile, patchFrame, terminal, webFrame }) {
          const labels = useToolLabels()
          const { text, note, extras, terminalOutput, display } = React.useMemo(() => face.mcp ? { extras: face.blocks.filter(validDiff) } : resultBody(tool, face), [tool, face])
          const evidence = face.blocks.length || !extras.length ? patchFrame : undefined
          const patch = React.useMemo(() => patchInventory(tool, extras, evidence), [tool, extras, evidence])
          const { input, targets, kind, command, exitCode, signal } = face
          const description = terminal && firstText(input.description, input.command_description)
          const reportNote = terminal ? [description, display || (!terminalOutput && text)].filter((s, i, all) => s && s !== command && s !== terminal.text && s !== terminalOutput && all.indexOf(s) === i).join('\n') : note
          const base = !face.mcp && firstText(input.cwd, input.workdir, input.Cwd), directory = base ? reportedPath(base, cwd) : cwd
          const [inspect, setInspect] = React.useState(false)
          const state = callState(tool, face, live), pending = state === 'in_progress'
          const fileLang = kind === 'read' ? targets[0]?.path.match(/\.([a-z0-9]+)$/iu)?.[1]?.toLowerCase() : undefined
          let body, locations = targets
          if (face.mcp) {
            body = h(McpReport, { tool, face, approval })
          } else if (terminal && !approval) {
            body = h(CommandReport, { term: terminal, face, final: terminalOutput, labels, live, state, cwd: terminal.cwd ?? firstText(input.cwd, input.workdir, input.Cwd, cwd) })
          } else if (kind === 'execute' && command) {
            // If execution did not finish, do not let a terminal card imply a successful exit.
            const settled = ['completed', 'failed'].includes(tool.status) || exitCode !== undefined || !!signal
            body = !approval && (pending || settled) ? h(TerminalBlock, { labels, command, output: text || undefined,
              cwd: firstText(input.cwd, input.workdir, input.Cwd, cwd), running: !!pending, exitCode, signal, maxLines: 8,
              runStateDot: pending || !!signal || (exitCode !== undefined && !(state === 'failed' && exitCode === 0)) }) :
              h(React.Fragment, null, h('pre', { className: 'aw-log aw-command' }, command), text ? h('pre', { className: 'aw-log' }, text) : null)
          } else if (kind === 'read' && text && state !== 'failed') {
            const lines = numberedRead(text)
            if (lines && targets.length === 1 && targets[0].line == null) locations = [{ ...targets[0], line: lines[0].number }]
            body = lines ? h(ReadBlock, { labels, label: targets[0]?.path ?? tool.title, lines, lang: fileLang, maxLines: 8 }) : null
          } else if (kind === 'search' && !approval && state !== 'failed') {
            const card = searchResult(tool.rawOutput, text, input)
            // Some adapters also put the search root in locations. Without a line it isn't evidence of a file hit.
            const explicit = new Set(Array.isArray(tool.locations) ? tool.locations : [])
            locations = targets.filter(l => explicit.has(l) && (l.line > 0 || (l.path !== input.path && l.path !== input.file_path)))
            if (card) body = h(React.Fragment, null, h(SearchBlock, { ...card, labels, maxLines: 8 }), openFile && h(SearchLocations, { card, openFile, cwd: directory }))
          } else if (face.web) {
            body = h(WebReport, { tool, face, frame: webFrame, state, approval, display, labels })
          }
          if (!body && text) body = ['read', 'search', 'execute'].includes(kind) ? h('div', { className: 'aw-code-window' },
            h(CodeBlock, { code: text, lang: fileLang || 'text', copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels })) : h('div', { className: 'aw-output aw-text' }, text)
          if (patch.files.size > 1) locations = locations.filter(l => !patch.files.has(l.path))
          const proposed = kind === 'edit' && !patch.files.size && targets.length === 1 && (!patchFrame || ['permission','launch'].includes(patchFrame.stage)) && typeof input.old_string === 'string' && typeof input.new_string === 'string'
          return h('div', { className: 'aw-detail aw-call-detail' },
            !approval && legacyCompaction(tool) ? h(CompactionFacts, { facts: compactionFacts(tool.rawOutput) }) : null,
            locations.length ? h(ToolTargets, { targets: locations, cwd: directory, openFile }) : null,
            !face.mcp && (kind === 'other' || approval) ? h(FieldList, { value: input, label: t('input'), omit: [command, ...(face.web ? [face.web.url, face.web.query, face.web.prompt, face.web.offset] : []), ...targets.map(l => l.path), face.write?.content, ...(proposed || extras.some(validDiff) ? [input.old_string, input.new_string] : [])] }) : null,
            !text && !extras.length && kind === 'other' ? h(FieldList, { value: tool.rawOutput, label: t('output') }) : null,
            proposed ? h('div', { className: 'aw-section' }, h('span', { className: 'aw-note' }, t('proposed')),
              h(DiffBlock, { labels, maxLines: 8, diffs: [{ path: targets[0].path, oldText: input.old_string, newText: input.new_string }] })) : null,
            !face.mcp && reportNote ? h('p', { className: 'aw-note aw-output' }, reportNote) : null, body,
            face.write?.content !== undefined ? h(WritePreview, { write: face.write, inventory: patch, frame: evidence, targets, cwd: directory, openFile, labels }) :
              h(PatchPreview, { inventory: patch, frame: evidence, targets, cwd: directory, openFile }),
            !face.mcp && extras.filter(b => !validDiff(b) && !(terminal && b.type === 'terminal' && b.terminalId === terminal.id)).map((block, i) => h(Block, { key: i, block })),
            tool.rawInput !== undefined || tool.rawOutput !== undefined ? h('details', { className: 'aw-tech', onToggle: event => setInspect(event.currentTarget.open) }, h('summary', null, t('inspectData')),
              inspect && tool.rawInput !== undefined ? h(Json, { label: t('input'), payload: tool.rawInput, open: true }) : null,
              inspect && tool.rawOutput !== undefined ? h(Json, { label: t('output'), payload: tool.rawOutput, open: true }) : null) : null)
        }

        function ToolRow({ tool, live, openFile, cwd, expanded, onExpand, permit, task, onTask, patchFrame, terminal, webFrame }) {
          const [ownOpen, setOpen] = React.useState(false)
          const open = expanded ?? ownOpen
          const toggle = () => onExpand ? onExpand() : setOpen(!ownOpen)
          const face = React.useMemo(() => toolFace(tool, terminal), [tool, terminal])
          const { kind, focus, targets, exitCode } = face, target = targets[0]
          const state = callState(tool, face, live)
          const webTitle = { search: 'webSearch', page: 'webPage', find: 'webFind' }[face.web?.mode]
          const title = task ? t('cliTask') : legacyCompaction(tool) ? t('compact.title') : webTitle ? t(webTitle) : face.write ? t('call.write') : kind === 'other' ? tool.title || t('tool') : t('call.' + kind)
          const path = target && (cwd && target.path.startsWith(cwd + '/') ? target.path.slice(cwd.length + 1) : target.path)
          const summary = focus || (path && path + (target.line > 0 ? ':' + target.line : '')) || (tool.title !== title ? tool.title : null)
          const totals = React.useMemo(() => {
            const diffs = face.blocks.filter(validDiff)
            return diffs.length && !(face.write && patchFrame?.stage === 'launch' && diffs.every(b => b.oldText == null)) ? diffTotals(diffs.map(b => ({ ...b, oldText: b.oldText ?? null }))) : null
          }, [face, patchFrame])
          const expandable = !!(face.mcp || terminal || face.blocks.length || targets.length || focus || tool.rawInput !== undefined || tool.rawOutput !== undefined)
          return h('div', { className: 'aw-call', 'data-state': state }, h(DisclosureRow, {
            icon: h(task ? IconBranchOutlineRegular : kindIcons.get(kind) ?? IconInfoOutlineRegular, { size: 14 }), title, open, expandable, onToggle: toggle,
            headerAccessory: task && onTask ? h(Button, { variant: 'ghost', size: 'sm', onClick: onTask, 'data-cli-open': task.row.seq, 'aria-label': `${t('cliOnly')}: ${task.title}` }, t('cliOnly')) : null,
            expandOnRowClick: expandable, keepContentWhenOpen: true, running: live && state === 'in_progress',
            collapsedContent: h('span', { className: 'aw-call-meta' },
              summary ? h('span', { className: 'aw-ellipsis aw-call-focus', title: summary }, summary) : null,
              task ? h('span', { className: 'aw-count' }, t('cliCalls', { n: task.calls })) : null,
              targets.length > 1 ? h('span', { className: 'aw-count' }, t('pathMore', { n: targets.length - 1 })) : null,
              permit ? h('span', { title: permit.choice }, h(Tag, { tone: ['permitDenied', 'permitLive'].includes(permit.label) ? 'warning' : 'quiet' }, t(permit.label))) : null,
              patchFrame?.stage === 'launch' && (totals || (face.write && face.blocks.some(validDiff))) ? h(Tag, { tone: 'quiet' }, t('patch.launch')) : null,
              totals ? h('span', { className: 'aw-diff-totals' }, h('span', null, '+' + totals.added), ' ', h('span', null, '−' + totals.removed)) : null,
              h('span', { className: 'aw-call-status', 'data-quiet': state === 'completed' }, h(StateDot, { size: 8, state: TOOL_DOT[state] ?? 'idle' }), task ? t('cliLaunchStatus', { status: t('call.' + state) }) : t('call.' + state)),
              face.signal || (exitCode !== undefined && exitCode !== 0) ? h('span', { className: 'aw-exit' }, face.signal ? t('terminalSignal', { signal: face.signal }) : t('exitCode', { n: exitCode })) : null),
          }, open ? h(ToolDetails, { tool, face, live, cwd, openFile, patchFrame, terminal, webFrame }) : null))
        }

        // Only the legacy Claude adapter's explicit synthetic tool identity qualifies, not its translated title.
        const legacyCompaction = tool => tool.kind === 'think' && tool._meta?.claudeCode?.toolName === 'compact'
        function CompactionFacts({ facts }) {
          if (!facts) return null
          return h('div', { className: 'aw-row aw-usage-meta' }, facts.trigger && h(Tag, { tone: 'quiet' }, t('compact.' + facts.trigger)),
            ['preTokens', 'postTokens', 'durationMs'].filter(key => facts[key] != null).map(key => h('span', { key }, t('compact.' + key, { n: number(facts[key]) }))))
        }

        function SummaryMedia({ row, part, events, recordId }) {
          const [open, toggle] = React.useState(false), [block, setBlock] = React.useState(null), [error, fail] = React.useState('')
          React.useEffect(() => {
            if (!open) return
            const abort = new AbortController(), known = events.find(e => e.seq === part.seq)
            const read = async () => {
              const event = known ?? (await api({ action: 'events', sessionId: recordId, after: part.seq - 1, limit: 1 }, abort.signal)).events?.[0], update = updateOf(event)
              const value = part.index === -1 ? update?.sessionUpdate === 'compaction_summary_chunk' && update.content : update?.sessionUpdate === 'compaction_update' && update.summary?.[part.index]
              if (event?.seq !== part.seq || event.data.params?.sessionId !== row.sid || update?.compactionId !== row.id || !!event.data.replay !== row.replay || value?.type !== part.type || value.mimeType !== part.mimeType || typeof value.data !== 'string' || !value.data) throw new Error(t('compact.noMedia'))
              if (!abort.signal.aborted) setBlock(value)
            }
            read().catch(e => { if (!abort.signal.aborted) fail(e.message) })
            return () => abort.abort()
          }, [open, part.seq, part.index, part.type, part.mimeType, row.id, row.sid, row.replay, recordId, events])
          return h('div', { className: 'aw-section' }, h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => { toggle(!open); setBlock(null); fail('') } }, t('compact.attachment', { type: part.mimeType })),
            open ? block ? h(Block, { block }) : h('span', { className: error ? 'aw-error' : 'aw-note' }, error || t('loading')) : null)
        }

        function CompactionRow({ row, liveTurn, recordId, events }) {
          const [open, toggle] = React.useState(false)
          const known = ['in_progress', 'completed', 'failed', 'cancelled'].includes(row.status)
          const state = known ? t('compact.' + (row.status === 'in_progress' && !liveTurn ? 'unsettled' : row.status)) : row.status
          return h(DisclosureRow, { icon: h(IconInfoOutlineRegular, { size: 14 }), title: t(row.replay ? 'compact.replay' : 'compact.title'), open, expandable: true, expandOnRowClick: true, keepContentWhenOpen: true, onToggle: () => toggle(!open),
            collapsedContent: h('span', { className: 'aw-call-meta' }, h(StateDot, { size: 8, state: row.status === 'in_progress' && liveTurn ? 'ongoing' : row.status === 'completed' ? 'done' : row.status === 'failed' ? 'error' : 'idle' }), state) },
            open ? h('div', { className: 'aw-detail aw-section' }, h('span', { className: 'aw-note aw-mono' }, row.id), row.late && h('small', { className: 'aw-note' }, t('compact.late')), h(CompactionFacts, { facts: row.facts }),
              row.error && h('p', { className: 'aw-error' }, row.error), row.parts.length ? h('div', { className: 'aw-compact-summary', 'aria-label': t('compact.summary') }, row.parts.map((b, i) => {
                if (b.type === 'text') return h('div', { key: i, className: 'aw-text' }, b.text)
                const key = b.seq + ':' + b.index, preview = b.type === 'image' ? /^image\/(png|jpeg|gif|webp)$/u.test(b.mimeType) : b.type === 'audio' && /^audio\/(wav|mpeg|ogg|mp4|webm)$/u.test(b.mimeType)
                return preview && (recordId || events.length) ? h(SummaryMedia, { key, row, part: b, events, recordId }) : h('div', { key, className: 'aw-field' }, h('span', { className: 'aw-mono' }, b.name || b.mimeType || b.type), b.uri && h('span', { className: 'aw-note' }, b.uri), b.description && h('span', null, b.description), b.text != null && h('pre', { className: 'aw-log' }, b.text))
              })) : h('small', { className: 'aw-note' }, t('compact.noSummary'))) : null)
        }

        function PlanDocument({ plan, openFile, cwd }) {
          const [open, toggle] = React.useReducer(v => !v, false), labels = useToolLabels()
          const firstLine = plan.content.trimStart().split('\n', 1)[0].replace(/^#{1,6}\s+/u, '').trim()
          const title = firstLine.length > 100 ? firstLine.slice(0, 100) + '…' : firstLine || t('planDocument')
          const absolute = plan.path && reportedPath(plan.path) && reportedPath(plan.path, cwd)
          return h(DisclosureRow, { icon: h(IconChecklistOutlineRegular, { size: 14 }), title, open, expandable: true, onToggle: toggle, expandOnRowClick: true, keepContentWhenOpen: true,
            collapsedContent: h('span', { className: 'aw-plan-id', title: plan.id }, t('planDocument'), ' · ', plan.id) },
            open ? h('div', { className: 'aw-detail aw-section' }, h('span', { className: 'aw-note' }, t('planRecorded')),
              plan.content ? h('div', { className: 'aw-code-window' }, h(CodeBlock, { code: plan.content, lang: 'markdown', copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels })) : null,
              plan.path && h('div', { className: 'aw-row' }, h(PathLabel, { path: plan.path }), absolute && openFile && h(Button, { size: 'sm', variant: 'ghost', onClick: () => openFile(absolute) }, t('planOpenFile')))) : null)
        }

        function PlanRow({ row, live, openFile, cwd }) {
          const plan = row.plan, [limit, show] = React.useState(12)
          if (plan?.type === 'markdown') return h(PlanDocument, { plan, openFile, cwd })
          if (plan?.type === 'removed') return h('div', { className: 'aw-row aw-note' }, h(IconChecklistOutlineRegular, { size: 14 }), t('planRemoved'), h('code', { className: 'aw-plan-id', title: plan.id }, plan.id))
          const entries = plan?.entries ?? row.entries ?? EMPTY, done = entries.filter(e => e.status === 'completed').length, name = t(plan ? 'planItems' : 'plan')
          return h('section', { className: 'aw-plan', 'aria-label': name },
            h('h3', { className: 'aw-row' }, h(IconChecklistOutlineRegular, { size: 14 }), name, plan && h('code', { className: 'aw-plan-id', title: plan.id }, plan.id), entries.length > 0 && h('span', { className: 'aw-count' }, t('planProgress', { done, total: entries.length }))),
            entries.length ? h('ol', null, entries.slice(0, limit).map((entry, index) => h('li', { key: entry.id ?? index, 'data-status': entry.status },
              h(StateDot, { state: settle(PLAN_DOT[entry.status] ?? 'idle', live), appearance: 'step', size: 12 }),
              h('span', { className: 'aw-plan-text aw-grow' }, entry.content ?? entry.title ?? ''),
              entry.priority === 'high' ? h(Tag, { tone: 'warning' }, t('highPriority')) : null,
              h('small', { className: 'aw-note' }, entry.status === 'completed' ? t('planDone') : entry.status === 'in_progress' ? t('planDoing') : entry.status === 'pending' ? t('planPending') : typeof entry.status === 'string' ? entry.status : '')))) : h('p', { className: 'aw-note' }, t('planEmpty')),
            entries.length > limit && h(Button, { size: 'sm', variant: 'ghost', onClick: () => show(n => n + 12) }, t('morePlanItems')))
        }

        function StderrRow({ text }) {
          const [open, setOpen] = React.useState(false)
          const toggle = React.useCallback(() => setOpen(value => !value), [])
          const lines = text.split('\n').filter(Boolean).length
          return h(DisclosureRow, {
            icon: h(IconInfoOutlineRegular, { size: 14 }), title: t('stderr'), open, expandable: true, onToggle: toggle, expandOnRowClick: true,
            collapsedContent: h('span', { className: 'aw-summary' }, String(lines)),
          }, open ? h('div', { className: 'aw-detail' }, h('pre', { className: 'aw-log' }, text)) : null)
        }

        function MessageRow({ row }) {
          const head = h('div', { className: 'aw-msg-head' }, h('span', null, t(row.role)), row.replay ? h(Tag, { tone: 'quiet' }, t('replay')) : null,
            row.at ? h('span', null, clock(row.at)) : null)
          return h('div', { className: 'aw-msg', 'data-role': row.role }, head, h('div', { className: row.role === 'thinking' ? 'aw-text aw-muted' : 'aw-text' }, row.text))
        }

        const CONVERSATION_EVENTS = new Set(['turn-error', 'configuration-error', 'interaction', 'interaction-result', 'interaction-expired'])
        // Handshakes, metadata updates and routine lifecycle are useful in records, noise beside a reply.
        const shownBesideReply = row => CONVERSATION_EVENTS.has(row.type) || (row.type === 'lifecycle' && !!row.data?.message)
        /** Lifecycle, results and interaction outcomes as single quiet lines. */
        function EventRow({ row, live }) {
          const data = row.data ?? {}
          switch (row.type) {
            case 'lifecycle':
              return h('div', { className: 'aw-event', 'data-tone': data.state === 'error' ? 'error' : undefined },
                h(StateDot, { state: settle(DOT[data.state] ?? 'idle', live), size: 8 }), h('span', null, stateText(data.state)),
                data.message || data.reason ? h('span', { className: 'aw-ellipsis', title: data.message ?? data.reason }, `· ${data.message ?? data.reason}`) : null)
            case 'turn-result': return h('div', { className: 'aw-event' }, t('stopReason', { reason: data.stopReason ?? '—' }))
            case 'turn-error': return h('div', { className: 'aw-event', 'data-tone': 'error' }, t('turnError', { message: data.message ?? '' }))
            case 'configuration-error': return h('div', { className: 'aw-event', 'data-tone': 'error' }, t('configError', { message: data.message ?? '' }))
            case 'interaction': return h('div', { className: 'aw-event' }, h(IconInfoOutlineRegular, { size: 14 }),
              h('span', { className: 'aw-ellipsis' }, t('event.interaction', { title: data.params?.toolCall?.title ?? data.params?.name ?? data.params?.title ?? data.params?.message ?? t(data.kind === 'plan' ? 'kind.plan' : data.kind ?? 'permission') })))
            case 'interaction-result': {
              const result = data.result?.outcome ?? {}
              const action = data.result?.action
              const decision = ['accept', 'decline', 'cancel'].includes(action) ? t('form.' + action) : data.optionName ?? result.optionId ?? (['answered', 'accepted', 'rejected', 'cancelled', 'skipped'].includes(result.outcome) ? t('decision.' + result.outcome) : result.outcome)
              return h('div', { className: 'aw-section' }, h('div', { className: 'aw-event' }, t(data.automatic === 'full-access' ? 'answeredByPreset' : 'answeredByUser'),
                decision ? h(Tag, { tone: 'quiet' }, decision) : null, result.reason ? h('span', null, result.reason) : null),
                data.answers?.map((answer, index) => h('div', { key: index, className: 'aw-note' }, answer.prompt, ': ', answer.choices.join(', '))))
            }
            case 'interaction-expired': return h('div', { className: 'aw-event' }, t('event.expired'), data.reason ? h('span', { className: 'aw-mono' }, data.reason === 'withdrawn' ? t('formWithdrawn') : data.reason) : null)
            default: return h(Json, { label: eventLabel(row), payload: row.data })
          }
        }

        const displayKey = 'dsh-acp-workbench:tool-detail', levelListeners = new Set()
        const normalizeLevel = level => level === 'detailed' ? 'detailed' : 'overview'
        let callLevel = 'overview'
        try { callLevel = normalizeLevel(window.localStorage?.getItem(displayKey)) } catch { /* storage may be unavailable */ }
        const levelSnapshot = () => callLevel
        const setCallLevel = level => {
          callLevel = normalizeLevel(level)
          try { window.localStorage?.setItem(displayKey, callLevel) } catch { /* keep this page's choice */ }
          for (const listener of levelListeners) listener()
        }
        function watchLevel(listener) { levelListeners.add(listener); return () => levelListeners.delete(listener) }

        function CallRun({ run, open, toggle, renderTool }) {
          const tt = useT()
          const parts = [[run.reads, 'readCount'], [run.searches, 'searchCount'], [run.web, 'webCount']].filter(([n]) => n).map(([n, label]) => tt(label, { n }))
          return h('div', { className: 'aw-call-run' }, h(DisclosureRow, { title: tt('exploration'), icon: h(IconBrowseOutlineRegular, { size: 14 }), open, expandable: true, onToggle: toggle, expandOnRowClick: true, keepContentWhenOpen: true,
            collapsedContent: h('span', { className: 'aw-run-summary' }, h('span', null, parts.join(' · ')), run.last ? h('span', { className: 'aw-ellipsis', title: run.last }, run.last) : null) },
            open ? h('div', { className: 'aw-call-run-body' }, h('span', { className: 'aw-note' }, [tt('groupCalls', { n: run.rows.length }), run.paths.size ? tt('distinctPaths', { n: run.paths.size }) : null].filter(Boolean).join(' · ')), run.rows.map(renderTool)) : null))
        }

        function CliTaskIndex({ tasks, origin, live, interactions, onSelect }) {
          const [open, setOpen] = React.useState(false)
          const pending = new Set(live ? interactions.map(item => item.id) : EMPTY)
          const waiting = task => task.permissions.some(id => pending.has(id))
          const ordered = [...tasks.values()].toSorted((a, b) => a.row.seq - b.row.seq)
          return h(DisclosureRow, { icon: h(IconBranchOutlineRegular, { size: 14 }), title: t('cliTasks'), open, expandable: true, expandOnRowClick: true, keepContentWhenOpen: true, onToggle: () => setOpen(!open),
            collapsedContent: h('span', { className: 'aw-call-meta' }, t('cliTaskCount', { n: tasks.size }), ordered.some(waiting) ? h(Tag, { tone: 'warning' }, t('permitLive')) : null) },
            open ? h('div', { className: 'aw-call-run-body' }, ordered.map(task => {
              const launcher = task.row.tool, state = callState(launcher, toolFace(launcher), live), parent = origin.get(task.row.seq)
              return h('div', { key: task.row.seq, className: 'aw-task-nav' }, h(StateDot, { size: 8, state: TOOL_DOT[state] ?? 'idle' }),
                h(Button, { size: 'sm', variant: 'ghost', onClick: () => onSelect(task.row.seq) }, task.title),
                h('span', { className: 'aw-note' }, [t('cliLaunchStatus', { status: t('call.' + state) }), t('cliCalls', { n: task.calls }), parent && t('cliOrigin', { task: parent.title })].filter(Boolean).join(' · ')), waiting(task) ? h(Tag, { tone: 'warning' }, t('permitLive')) : null)
            })) : null)
        }

        function TaskMedia({ row, recordId }) {
          const [block, setBlock] = React.useState(row.content), [failure, setFailure] = React.useState('')
          React.useEffect(() => {
            if (row.content || !recordId) return
            const abort = new AbortController()
            void api({ action: 'events', sessionId: recordId, after: row.seq - 1, limit: 1 }, abort.signal).then(page => {
              if (abort.signal.aborted) return
              const event = page.events?.[0], update = updateOf(event)
              if (event?.seq !== row.seq || cliParentOf(update) !== row.cliParent || update?.sessionUpdate !== (row.input ? 'user_message_chunk' : 'agent_message_chunk') || !update.content) setFailure(t('cliNoMedia'))
              else setBlock(update.content)
            }).catch(error => { if (!abort.signal.aborted) setFailure(error.message) })
            return () => abort.abort()
          }, [recordId, row.seq, row.cliParent, row.input, row.content])
          return block ? h(Block, { block }) : h('span', { className: failure ? 'aw-error' : 'aw-note' }, failure || t('loading'))
        }

        function TaskProgress({ row, recordId }) {
          const [open, setOpen] = React.useState(false)
          return h('div', { className: 'aw-task-progress' }, h('span', { className: 'aw-note' }, t(row.input ? 'cliInput' : 'cliProgress')),
            row.media ? (recordId || row.content ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => setOpen(!open) }, t('cliPreview', { type: row.media })) : h('span', { className: 'aw-note' }, t('cliMedia', { type: row.media }))) : h('div', { className: 'aw-text' }, row.text),
            open ? h(TaskMedia, { row, recordId }) : null, row.clipped ? h('span', { className: 'aw-note' }, t('cliLimit')) : null)
        }

        function TraceList({ events = EMPTY, folded, raw, live, conversation, openFile, cwd, interactions = EMPTY, recordId, activeTurnId, remoteId }) {
          const rows = React.useMemo(() => raw ? EMPTY : folded ?? timeline(events, remoteId), [events, folded, raw, remoteId])
          const { tasks, origin, receiptFor } = React.useMemo(() => cliActivities(rows), [rows])
          const [taskSeq, viewTask] = React.useState(null), scope = tasks.get(taskSeq)
          const traceNode = React.useRef(null), previousTask = React.useRef(null)
          React.useEffect(() => {
            if (previousTask.current === taskSeq) return
            const selector = taskSeq === null ? `[data-cli-open="${previousTask.current}"]` : '.aw-task-scope'
            traceNode.current?.querySelector(selector)?.focus()
            previousTask.current = taskSeq
          }, [taskSeq])
          const visible = React.useMemo(() => scope ? rows.filter(row => row.seq === scope.row.seq || origin.get(row.seq) === scope || receiptFor.get(row.seq) === scope.row.seq) : rows, [rows, scope, origin, receiptFor])
          const approvals = React.useMemo(() => callPermissions(rows), [rows])
          const receipts = React.useMemo(() => new Map(rows.filter(r => r.kind === 'answered' || r.kind === 'expired' || r.type === 'interaction-result' || r.type === 'interaction-expired').map(r => [r.id ?? r.data?.id, r])), [rows])
          const { items: compact, groups } = React.useMemo(() => projectCallRuns(visible, cwd, approvals, tasks), [visible, cwd, approvals, tasks])
          const level = React.useSyncExternalStore(watchLevel, levelSnapshot, levelSnapshot), tab = React.useId()
          const [opened, setOpened] = React.useState(() => new Set())
          const flip = key => setOpened(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })
          const renderTool = row => {
            const linked = row.replay ? null : approvals.get(callKey(row.tool.toolCallId, row.turnId))
            const pending = live && linked?.findLast(p => p.label === 'permitRequested' && interactions.some(item => item.id === p.id))
            const permit = pending ? { label: 'permitLive' } : linked?.at(-1)
            return h(ToolRow, { key: `tool:${row.seq}`, tool: row.tool, patchFrame: row.patchFrame, terminal: row.terminal, webFrame: row.webFrame, live: live && !row.replay, cwd, openFile, permit, task: tasks.get(row.seq), onTask: scope?.row.seq === row.seq ? null : () => viewTask(row.seq), expanded: opened.has(row.seq), onExpand: () => flip(row.seq) })
          }
          if (raw) {
            if (!events.length) return h('p', { className: 'aw-note' }, t('noEvents'))
            return h('div', { className: 'aw-list' }, events.map(event => h(Json, { key: event.seq, label: `#${event.seq} · ${eventLabel(event)} · ${clock(event.at)}`, payload: event })))
          }
          const renderRow = row => {
            const key = `${row.kind}:${row.seq}`
            if (row.kind === 'tool') return renderTool(row)
            if (row.kind === 'task-progress') return h(TaskProgress, { key, row, recordId })
            if (row.kind === 'call-run') {
              // A live item can finish and join a group while someone is reading it. Keep that detail visible.
              const open = opened.has(key) || row.rows.some(r => opened.has(r.seq))
              const toggle = () => open ? setOpened(prev => { const next = new Set(prev); next.delete(key); for (const r of row.rows) next.delete(r.seq); return next }) : flip(key)
              return h(CallRun, { key, run: row, open, toggle, renderTool })
            }
            if (row.kind === 'notice') return h(NoticeRow, { key, row })
            if (row.kind === 'compaction') return h(CompactionRow, { key, row, liveTurn: live && !row.replay && (conversation || (activeTurnId && row.turnId === activeTurnId)), recordId, events })
            if (row.kind === 'usage-window') return h(ContextReport, { key, report: row, title: t(row.replay ? 'contextReplay' : 'contextRecorded') })
            if (row.kind === 'usage-totals') return h(SessionTokens, { key, row })
            if (row.kind === 'plan') return h(PlanRow, { key, row, openFile, cwd, live: live && !row.replay })
            if (row.kind === 'stderr' || row.kind === 'log') return h(StderrRow, { key, text: row.text })
            if (row.kind === 'error') return h('div', { key, className: 'aw-event', 'data-tone': 'error' }, row.message)
            if ((row.kind === 'interaction' && row.interaction === 'permission') || (row.type === 'interaction' && row.data?.kind === 'permission')) return h(PermissionHistory, { key, row, sessionId: recordId, cwd, receipt: receipts.get(row.id ?? row.data?.id) })
            if (row.kind === 'interaction') return h(EventRow, { key, live, row: { type: 'interaction', data: { kind: row.interaction, params: { title: row.title } } } })
            if (row.kind === 'answered') return h(EventRow, { key, live, row: { type: 'interaction-result', data: { automatic: row.automatic, optionName: row.optionName, answers: row.answers, result: { action: row.formAction, outcome: { outcome: row.outcome, optionId: row.optionId, reason: row.reason } } } } })
            if (row.kind === 'expired') return h(EventRow, { key, live, row: { type: 'interaction-expired', data: { reason: row.reason } } })
            // DSH already renders the reply itself beside a conversation trace.
            if (row.kind === 'message') return conversation ? null : h(MessageRow, { key, row })
            if (row.kind === 'content') return conversation ? null : h('div', { key, className: 'aw-msg' }, h(Block, { block: row.content }))
            return conversation && !shownBesideReply(row) ? null : h(EventRow, { key, row, live })
          }
          const items = (level === 'detailed' ? visible : compact).map(row => {
            const node = renderRow(row), source = origin.get(row.seq)
            if (!node || (!source && row.cliParent === undefined) || (scope && source === scope)) return node
            const label = source ? t('cliOrigin', { task: source.title }) : row.cliParent ? t('cliMissing', { task: row.cliParent }) : t('cliConflict')
            return h('div', { key: `origin:${row.seq}`, className: 'aw-task-lane' }, h('span', { className: 'aw-task-origin' }, label), node)
          }).filter(Boolean)
          if (!items.length) return conversation && !live ? null : h('p', { className: 'aw-note' }, t(conversation ? 'noActivity' : 'noEvents'))
          const id = value => `${tab}-${value}`, panel = `${tab}-calls`
          return h('div', { className: 'aw-list', ref: traceNode }, scope ? h('section', { className: 'aw-task-scope', tabIndex: -1, 'aria-label': t('cliTask') }, h('div', { className: 'aw-task-nav' }, h(Button, { size: 'sm', variant: 'ghost', onClick: () => viewTask(null) }, t('cliAll')),
            origin.get(scope.row.seq) ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => viewTask(origin.get(scope.row.seq).row.seq) }, t('cliOrigin', { task: origin.get(scope.row.seq).title })) : null,
            h(IconBranchOutlineRegular, { size: 14 }), h('strong', { className: 'aw-strong' }, scope.title)), h('span', { className: 'aw-note' }, t('cliScope'))) : tasks.size > 1 ? h(CliTaskIndex, { tasks, origin, live, interactions, onSelect: viewTask }) : null,
            groups ? h('div', { className: 'aw-call-view' }, h(SegmentedTabs, { size: 'sm', label: t('callView'), value: level, onChange: setCallLevel, items: [
            { id: id('overview'), panelId: panel, value: 'overview', label: t('compactCalls') }, { id: id('detailed'), panelId: panel, value: 'detailed', label: t('detailedCalls') }] })) : null,
            h('div', { className: 'aw-list', id: panel, ...(groups ? { role: 'tabpanel', 'aria-labelledby': id(level) } : {}) }, items))
        }

        // Read one position only on disclosure. A stored request is evidence, never another actionable dock.
        function PinnedPermissionEvent({ sessionId, seq, render }) {
          const [data, setData] = React.useState(null)
          React.useEffect(() => {
            const abort = new AbortController()
            void api({ action: 'events', sessionId, after: seq - 1, limit: 1 }, abort.signal).then(page => {
              if (!abort.signal.aborted) setData({ event: page.events?.find(event => event.seq === seq) })
            }).catch(error => { if (!abort.signal.aborted) setData({ error: error.message }) })
            return () => abort.abort()
          }, [sessionId, seq])
          return !data ? h('p', { className: 'aw-note' }, t('loading')) : (data.event && render(data.event)) || h('p', { className: 'aw-error', role: 'alert' }, data.error || t('permitUnavailable'))
        }
        function permissionScope(option) {
          if (!['allow_once','reject_once','allow_always','reject_always'].includes(option.kind)) return null
          return t(option.kind.startsWith('allow') ? 'permitGrant' : 'permitRefuse') + ' · ' + t(option.kind.endsWith('once') ? 'permitScopeOnce' : 'permitScopeRemember')
        }
        function PermissionBody({ item, sessionId, cwd }) {
          const [previous, setPrevious] = React.useState(false), call = item.params?.toolCall ?? {}, face = toolFace(call, null, true)
          const seq = item.callStartSeq, earlier = sessionId && item.turnId && call.toolCallId && Number.isSafeInteger(seq) && seq > 0 && seq < item.requestSeq
          const input = call.rawInput, hasInput = input != null && (typeof input !== 'object' || Object.keys(input).length > 0)
          const details = face.mcp || hasInput || call.rawOutput != null || face.targets.length || face.blocks.length
          return h(React.Fragment, null,
            h('strong', { className: 'aw-text' }, call.title || t('tool')),
            h('div', { className: 'aw-note' }, [call.toolCallId && `${t('permitCallId')}: ${call.toolCallId}`, cwd && `${t('permitCwd')}: ${cwd}`].filter(Boolean).join(' · ')),
            details ? h(ToolDetails, { tool: call, face, cwd, approval: true, patchFrame: { stage: 'permission', rawKey: 'rawInput' } }) : h('p', { className: 'aw-note' }, t('permitEmpty')),
            earlier ? h('div', { className: 'aw-section' }, h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': previous, onClick: () => setPrevious(!previous) }, t('permitLaunch')),
              previous ? h('div', { className: 'aw-section aw-permit-context' }, h('p', { className: 'aw-note' }, t('permitEarlier')), h(PinnedPermissionEvent, { key: `${sessionId}:${seq}`, sessionId, seq, render: event => {
                const update = updateOf(event)
                if (event.type !== 'notification' || event.data.replay || event.data.turnId !== item.turnId || update?.sessionUpdate !== 'tool_call' || update.toolCallId !== call.toolCallId || cliParentOf(update) !== cliParentOf(call)) return null
                return h(React.Fragment, null, update.title && h('span', { className: 'aw-strong aw-text' }, update.title), h(ToolDetails, { tool: update, face: toolFace(update), cwd, approval: true, patchFrame: { stage: 'launch', rawKey: 'rawInput' } }))
              } })) : null) : null)
        }
        function PermissionHistory({ row, receipt, sessionId, cwd }) {
          const [open, setOpen] = React.useState(false), id = row.id ?? row.data?.id, title = row.title ?? row.data?.params?.toolCall?.title
          const render = event => {
            const item = event.data, call = item?.params?.toolCall
            if (event.type !== 'interaction' || item?.kind !== 'permission' || !id || item.id !== id || (row.toolCallId != null && row.toolCallId !== call?.toolCallId)) return null
            const data = receipt?.data ?? receipt, outcome = data?.result?.outcome ?? data
            const options = Array.isArray(item.params?.options) ? item.params.options : EMPTY
            const chosen = options.find(option => option.optionId === outcome?.optionId)
            const choice = data?.optionName ?? chosen?.name ?? outcome?.optionId ?? (outcome?.outcome === 'cancelled' ? t('decision.cancelled') : null)
            return h('div', { className: 'aw-section aw-permit-context' }, h(Tag, { tone: 'quiet' }, t('permitReadOnly')),
              h(PermissionBody, { item: { ...item, requestSeq: event.seq }, sessionId, cwd }),
              h('div', { className: 'aw-row', role: 'group', 'aria-label': t('permitOptions') }, options.map(o => h(Tag, { key: o.optionId, tone: 'quiet' }, [o.name ?? o.optionId, permissionScope(o)].filter(Boolean).join(' · ')))),
              choice ? h('span', { className: 'aw-note' }, t(data.automatic === 'full-access' ? 'permitAutoSelection' : 'permitSelection', { choice })) : receipt?.kind === 'expired' || receipt?.type === 'interaction-expired' ? h('span', { className: 'aw-note' }, t('event.expired')) : null)
          }
          return h('div', { className: 'aw-section' }, h('div', { className: 'aw-event' }, h(IconInfoOutlineRegular, { size: 14 }), h('span', { className: 'aw-ellipsis' }, t('event.interaction', { title: title || t('permission') })),
            id && (sessionId || row.data) ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => setOpen(!open) }, t('permitPast')) : null),
            open ? row.data ? render(row) : h(PinnedPermissionEvent, { key: `${sessionId}:${row.seq}`, sessionId, seq: row.seq, render }) : null)
        }
        function FormField({ field, value, set, disabled, group }) {
          const tt = useT(), f = field, multi = f.kind === 'multiple'
          return h('fieldset', { className: 'aw-question aw-form-field', disabled }, h('legend', null, f.title, ' ', h('small', { className: 'aw-note' }, tt(f.required ? 'formRequired' : 'formOptional'))),
            f.description && h('p', { className: 'aw-note' }, f.description), (f.min > 0 || f.max != null) && h('p', { className: 'aw-note' }, [f.min > 0 && tt('formMin', { n: f.min }), f.max != null && tt('formMax', { n: f.max })].filter(Boolean).join(' · ')),
            f.kind === 'text' ? h('textarea', { className: 'aw-input', rows: 2, 'aria-label': f.title, value: value ?? '', onChange: e => set(e.target.value || undefined) }) : f.choices.map(c => {
              const checked = multi ? (value ?? EMPTY).includes(c.value) : value === c.value
              return h('div', { className: 'aw-section', key: c.value }, h('label', { className: 'aw-option' }, h('input', { type: multi ? 'checkbox' : 'radio', name: group, checked,
                onChange: e => { if (!multi) return set(c.value); const next = e.target.checked ? [...(value ?? EMPTY), c.value] : value.filter(v => v !== c.value); set(next.length ? next : undefined) } }),
                h('span', null, c.label, c.description && h('small', { className: 'aw-note aw-form-hint' }, c.description))),
                c.preview && h('details', { className: 'aw-tech' }, h('summary', null, tt('formPreview')), h('pre', { className: 'aw-log' }, c.preview)))
            }), f.kind === 'single' && !f.required && value !== undefined && h(Button, { size: 'sm', variant: 'ghost', disabled, onClick: () => set(undefined) }, tt('clearField')))
        }

        function InteractionCard({ item, sessionId, cwd, run, disabled, inline }) {
          const tt = useT(), scopeId = React.useId()
          const [answers, setAnswers] = React.useState({}), [values, setValues] = React.useState(() => new Map())
          const [reason, setReason] = React.useState('')
          const params = item.params ?? {}
          const send = response => run({ action: 'respond', sessionId, interactionId: item.id, ...response })
          let body
          let actions
          let note = null
          if (item.kind === 'permission') {
            const options = params.options ?? EMPTY
            body = h(PermissionBody, { item, sessionId, cwd })
            actions = options.map((option, i) => h('span', { key: option.optionId, className: 'aw-permit-option' }, h(Button, {
              size: 'sm', disabled, 'aria-describedby': `${scopeId}-${i}`, onClick: () => send({ optionId: option.optionId }),
              variant: option.kind === 'allow_once' ? 'primary' : option.kind?.startsWith('reject') ? 'ghost' : 'outline',
              title: option.kind?.endsWith('always') ? tt('permanent') : undefined,
            }, option.name ?? option.optionId), h('small', { id: `${scopeId}-${i}` }, permissionScope(option))))
            if (options.some(option => option.kind?.endsWith('always'))) note = tt('permanent')
          } else if (item.kind === 'form') {
            const fields = item.fields ?? EMPTY, invalid = fields.some(f => {
              if (!values.has(f.id)) return f.required
              const v = values.get(f.id), length = Array.isArray(v) ? v.length : Array.from(v).length
              return length < f.min || (f.max != null && length > f.max)
            })
            body = h('div', { className: 'aw-section' }, h('strong', null, params.message),
              params.requestedSchema?.title && h('span', null, params.requestedSchema.title), params.requestedSchema?.description && h('p', { className: 'aw-note' }, params.requestedSchema.description), fields.map((field, i) => h(FormField, { key: field.id, field, disabled, group: scopeId + ':' + i, value: values.get(field.id),
              set: v => setValues(previous => { const next = new Map(previous); if (v === undefined) next.delete(field.id); else next.set(field.id, v); return next }) })))
            actions = [h(Button, { key: 'submit', size: 'sm', variant: 'primary', disabled: disabled || invalid, onClick: () => send({ formAction: 'accept', content: Object.fromEntries(values) }) }, tt('formSubmit')),
              h(Button, { key: 'decline', size: 'sm', variant: 'ghost', disabled, onClick: () => send({ formAction: 'decline' }) }, tt('formDecline'))]
            note = tt('formHelp')
          } else if (item.kind === 'plan') {
            body = [
              params.name ? h('span', { key: 'name', className: 'aw-strong' }, params.name) : null,
              params.overview ? h('p', { key: 'overview', className: 'aw-note' }, params.overview) : null,
              params.plan ? h('pre', { key: 'plan', className: 'aw-log' }, params.plan) : null,
            ]
            actions = [
              h(Button, { key: 'approve', size: 'sm', variant: 'primary', disabled, onClick: () => send({ accept: true }) }, tt('approve')),
              h(Input, { key: 'reason', className: 'aw-reason', value: reason, disabled, placeholder: tt('rejectReason'), 'aria-label': tt('rejectReason'), onChange: event => setReason(event.target.value) }),
              h(Button, { key: 'reject', size: 'sm', variant: 'outline', disabled, onClick: () => send({ accept: false, ...(reason.trim() ? { reason: reason.trim() } : {}) }) }, tt('reject')),
            ]
          } else {
            const questions = params.questions ?? EMPTY
            body = [
              params.title ? h('span', { key: 'title', className: 'aw-strong' }, params.title) : null,
              ...questions.map(question => h('fieldset', { key: question.id, className: 'aw-question' }, h('legend', null, question.prompt ?? question.title ?? ''),
                (question.options ?? EMPTY).map(option => h('label', { key: option.id, className: 'aw-option' },
                  h('input', {
                    type: question.allowMultiple ? 'checkbox' : 'radio', name: `${item.id}-${question.id}`, disabled,
                    checked: (answers[question.id] ?? EMPTY).includes(option.id),
                    onChange: event => setAnswers(old => ({ ...old, [question.id]: question.allowMultiple
                      ? event.target.checked ? [...(old[question.id] ?? []), option.id] : (old[question.id] ?? []).filter(id => id !== option.id)
                      : [option.id] })),
                  }),
                  h('span', null, option.label ?? option.id, option.description ? h('span', { className: 'aw-note', style: { display: 'block' } }, option.description) : null))))),
            ]
            actions = [
              h(Button, { key: 'answer', size: 'sm', variant: 'primary', disabled: disabled || questions.some(question => !answers[question.id]?.length),
                onClick: () => send({ answers: questions.map(question => ({ questionId: question.id, selectedOptionIds: answers[question.id] ?? [] })) }) }, tt('answer')),
              h(Button, { key: 'skip', size: 'sm', variant: 'ghost', disabled, onClick: () => send({ skip: true }) }, tt('skip')),
            ]
          }
          const title = tt(item.kind === 'plan' ? 'kind.plan' : item.kind)
          return h('section', { className: inline ? 'aw-ask aw-ask-inline' : 'aw-card aw-ask', 'data-tone': 'warn', 'aria-label': title },
            h('div', { className: 'aw-ask-head' }, h(IconWarningTriangleOutlineRegular, { size: 16 }), h('span', null, title)),
            h('div', { className: 'aw-ask-body' }, body),
            h('div', { className: 'aw-ask-actions' }, actions, h('span', { className: 'aw-grow' }),
              h(Button, { size: 'sm', variant: 'ghost', disabled, onClick: () => send({ cancel: true }) }, tt('dismiss'))),
            note ? h('p', { className: 'aw-note' }, note) : null)
        }

        function ConfigControl({ entry, disabled, onChange, compact }) {
          if (entry.kind === 'boolean') {
            return h('span', { className: 'aw-switch' }, h(Switch, { checked: entry.value, disabled, label: entry.label, onChange: value => onChange(entry.op(value)) }), h('span', null, entry.label))
          }
          const known = entry.options.some(option => option.value === entry.value)
          const select = h('select', { className: 'aw-select', value: entry.value, disabled, 'aria-label': entry.label, title: entry.label, onChange: event => onChange(entry.op(event.target.value)) },
            known ? null : h('option', { value: entry.value }, entry.value || '—'),
            entry.options.map(option => h('option', { key: option.value, value: option.value }, option.label)))
          return compact ? select : h('label', { className: 'aw-field' }, h('span', null, entry.label), select)
        }

        const costNumber = n => new Intl.NumberFormat(undefined, { maximumSignificantDigits: 21 }).format(n)
        const noticeLevel = severity => ['info', 'warning', 'error'].includes(severity) ? t('notice.' + severity) : severity
        const noticeIcon = severity => h(severity === 'warning' || severity === 'error' ? IconWarningTriangleOutlineRegular : IconInfoOutlineRegular, { size: 14 })

        function NoticeRow({ row, recordId, remoteId }) {
          const [open, toggle] = React.useState(false), [detail, setDetail] = React.useState(null), [failure, fail] = React.useState('')
          React.useEffect(() => {
            if (!open || !row.hasDetail || detail) return
            const controller = new AbortController()
            api({ action: 'events', sessionId: recordId, after: row.seq - 1, limit: 1 }, controller.signal).then(page => {
              if (controller.signal.aborted) return
              const receipt = noticeReceipt(page.events?.[0], remoteId)
              if (!receipt || receipt.seq !== row.seq || receipt.phase !== row.phase || receipt.severity !== row.severity) throw new Error(t('notice.unavailable'))
              setDetail(receipt); fail('')
            }).catch(e => { if (!controller.signal.aborted) fail(e.message) })
            return () => controller.abort()
          }, [open, detail, row.hasDetail, row.seq, row.phase, row.severity, recordId, remoteId])
          const notice = detail ?? row, tone = ['warning', 'error'].includes(row.severity) ? row.severity : 'info'
          return h('div', { className: 'aw-notice', 'data-level': tone }, h(DisclosureRow, { title: row.title, icon: noticeIcon(row.severity), open, expandable: true, expandOnRowClick: true, keepContentWhenOpen: true, onToggle: () => { fail(''); toggle(!open) },
            collapsedContent: h('span', { className: 'aw-call-meta' }, t('notice.level', { level: noticeLevel(row.severity) })) },
            open ? h('div', { className: 'aw-detail aw-section' }, h('small', { className: 'aw-note' }, t('notice.' + row.phase), row.at && h('time', { dateTime: row.at }, ' · ', stamp(row.at))),
              row.cliParent && h('span', { className: 'aw-note' }, t('notice.fromTask', { id: row.cliParent })),
              notice.title !== row.title && h('strong', { className: 'aw-text' }, notice.title), notice.description && h('div', { className: 'aw-text' }, notice.description),
              row.hasDetail && !detail && h('small', { className: failure ? 'aw-error' : 'aw-note' }, failure || t('loading'))) : null))
        }

        function ConnectionNotices({ report }) {
          const [open, toggle] = React.useState(false), latest = report.items[0]
          return h('section', { className: 'aw-connection-notices', 'aria-label': t('notice.feed') }, h(DisclosureRow, { title: t('notice.feed'), icon: noticeIcon(latest.severity), open, expandable: true, expandOnRowClick: true, keepContentWhenOpen: true, onToggle: () => toggle(!open),
            collapsedContent: h('span', { className: 'aw-call-meta aw-ellipsis' }, noticeLevel(latest.severity), ' · ', latest.title) },
            open ? h('div', { className: 'aw-section' }, h('small', { className: 'aw-note' }, t('notice.recent')), report.items.map(item => h(NoticeRow, { key: item.seq, row: item, recordId: report.externalId, remoteId: report.remoteId }))) : null))
        }

        function ContextReport({ report, title }) {
          const tt = useT(), [open, setOpen] = React.useState(false), w = report.window, percent = Math.round(w.used / w.size * 100)
          return h(DisclosureRow, { title, open, expandable: true, expandOnRowClick: true, keepContentWhenOpen: true, onToggle: () => setOpen(!open),
            collapsedContent: h('span', { className: 'aw-call-meta aw-usage-meta' }, h('span', { className: 'aw-usage-meter', 'aria-hidden': true }, h('i', { style: { width: Math.min(100, percent) + '%' } })), number(percent) + '%') },
            open ? h('div', { className: 'aw-usage-detail' }, h('strong', null, tt('usageContext', { used: number(w.used), size: number(w.size), percent: number(percent) })),
              w.model && h('span', null, tt('ctxModel', { model: w.model })), w.cost && h('span', null, tt('ctxCost', { amount: costNumber(w.cost.amount), unit: w.cost.currency })),
              report.at && h('span', { className: 'aw-note' }, tt('ctxAt', { time: stamp(report.at) })), h('small', { className: 'aw-note' }, tt('ctxScope'))) : null)
        }

        function SessionTokens({ row }) {
          const tt = useT(), [open, setOpen] = React.useState(false), v = row.totals
          const labels = { totalTokens: 'ctxTotal', inputTokens: 'ctxInput', outputTokens: 'ctxOutput', cachedReadTokens: 'ctxCacheRead', cachedWriteTokens: 'ctxCacheWrite', thoughtTokens: 'ctxThought' }
          return h(DisclosureRow, { title: tt('ctxTotals'), open, expandable: true, expandOnRowClick: true, keepContentWhenOpen: true, onToggle: () => setOpen(!open),
            collapsedContent: h('span', { className: 'aw-call-meta aw-usage-meta' }, number(v.totalTokens)) }, open ? h('div', { className: 'aw-usage-detail' },
              h('dl', null, Object.entries(labels).filter(([key]) => v[key] != null).map(([key, label]) => h(React.Fragment, { key }, h('dt', null, tt(label)), h('dd', null, number(v[key]))))),
              h('small', { className: 'aw-note' }, tt('ctxTotalsScope')), row.stopReason && h('small', { className: 'aw-note' }, tt('stopReason', { reason: row.stopReason }))) : null)
        }

        function usageText(usage) {
          if (!usage) return t('unknownUsage')
          const parts = []
          if (Number.isFinite(usage.used) && Number.isFinite(usage.size) && usage.size > 0) {
            parts.push(t('usageContext', { used: number(usage.used), size: number(usage.size), percent: Math.round(usage.used / usage.size * 100) }))
          }
          if (Number.isFinite(usage.cost?.amount)) parts.push(t('usageCost', { amount: costNumber(usage.cost.amount), currency: usage.cost.currency ?? '' }))
          return parts.length ? parts.join(' · ') : null
        }

        function CommandForm({ session, onRun, disabled }) {
          const tt = useT()
          const [command, setCommand] = React.useState('')
          const [args, setArgs] = React.useState('')
          React.useEffect(() => { setCommand(''); setArgs('') }, [session.id, session.commandStamp])
          const chosen = session.commands.find(item => item.name === command)
          const submit = async event => {
            event.preventDefault()
            if (disabled || !chosen) return
            if (await onRun(command, args)) setArgs('')
          }
          return h('form', { className: 'aw-section', onSubmit: submit },
            h('div', { className: 'aw-row', style: { flexWrap: 'nowrap' } },
              h('select', { className: 'aw-select', value: command, disabled, 'aria-label': tt('commands'), onChange: event => { setCommand(event.target.value); setArgs('') } },
                h('option', { value: '' }, tt('commandPick')), session.commands.map(item => h('option', { key: item.name, value: item.name }, `/${item.name}`))),
              h(Input, { className: 'aw-grow', value: args, disabled: disabled || !command, placeholder: chosen?.input?.hint || tt('commandArgs'), 'aria-label': tt('commandArgs'), onChange: event => setArgs(event.target.value) }),
              h(Button, { type: 'submit', size: 'sm', variant: 'outline', disabled: disabled || !chosen || session.state !== 'idle' }, tt('commandRun'))),
            h('p', { className: 'aw-note' }, chosen?.description || tt('commandHint')))
        }

        /** Inline execution steps beside the native reply; transport diagnostics are opt-in. */
        function NativeTrace({ sessionId, turn, step, messageId, reference, openFile, collapsible = !reference, defaultOpen = !!reference }) {
          const tt = useT()
          const view = useNative(sessionId)
          const [open, setOpen] = React.useState(defaultOpen)
          const [fallback, setFallback] = React.useState(null)
          const [events, setEvents] = React.useState(EMPTY)
          const [ready, setReady] = React.useState(false)
          const [raw, setRaw] = React.useState(false)
          const [error, setError] = React.useState('')
          const [loadingOlder, setLoadingOlder] = React.useState(false)
          const after = React.useRef(0)
          const started = React.useRef(false)
          const generation = React.useRef(0)
          const traceRef = React.useRef(null)
          const matches = run => reference ? run.id === reference.turnId : messageId && run.messageId ? run.messageId === messageId : run.turn === turn && run.step === step
          // The snapshot carries recent runs only; an older run falls back to an exact lookup.
          const current = view.data?.sessions.find(s => (reference ? s.id === reference.sessionId : s.native.sessionId === sessionId) && s.native.runs.some(matches))
          const session = current ?? fallback
          const run = session?.native.runs.findLast(matches)
          const active = !!run && ACTIVE_RUN.has(run.state)
          const target = run?.to ?? session?.eventSeq ?? 0
          const lateRevision = current ? run?.compactionRevision : view.data?.sessions.find(s => s.id === fallback?.id)?.native.compactionRevision
          const from = run?.from ?? 1
          const traceReady = !!fallback?.native.runs.some(matches)
          // Streaming snapshots can arrive faster than the first trace response. Finish that
          // read, then catch up once; only changing the identity of the run aborts the reader.
          const readTrace = React.useRef(null)
          React.useEffect(() => {
            const controller = new AbortController()
            setFallback(null)
            let loading = false, again = false
            readTrace.current = async () => {
              if (loading) { again = true; return }
              loading = true
              try {
                do {
                  again = false
                  const value = await api({ action: 'native-trace', dshSessionId: sessionId, turn, step, messageId,
                    ...(reference ? { externalId: reference.sessionId, runId: reference.turnId } : {}) }, controller.signal)
                  if (controller.signal.aborted) return
                  setFallback(value); setError('')
                } while (again)
              } catch (failure) { if (!controller.signal.aborted) setError(failure.message) } finally { loading = false }
            }
            return () => { controller.abort(); readTrace.current = null }
          }, [sessionId, turn, step, messageId, reference?.sessionId, reference?.turnId])
          React.useEffect(() => { void readTrace.current?.() }, [sessionId, turn, step, messageId, reference?.sessionId, reference?.turnId, target, lateRevision])
          React.useEffect(() => {
            started.current = false
            generation.current++
            setLoadingOlder(false)
            setEvents(EMPTY)
            setReady(false)
          }, [session?.id, run?.id, raw])
          // Raw diagnostics stay lazy and paged; the normal timeline already has all folded rows.
          React.useEffect(() => {
            if (!raw || !session || !run) return
            if (!started.current) { after.current = Math.max(0, from - 1, target - 200); started.current = true }
            if (after.current >= target) { setReady(true); return }
            const controller = new AbortController()
            const own = generation.current
            void (async () => {
              try {
                while (after.current < target && !controller.signal.aborted) {
                  const page = await api({ action: 'events', sessionId: session.id, after: after.current, limit: 200 }, controller.signal)
                  if (controller.signal.aborted || own !== generation.current) return
                  if (page.next <= after.current) break
                  after.current = Math.min(page.next, target)
                  setEvents(old => uniqueEvents([...old, ...page.events.filter(event => event.seq <= target && event.seq >= from)]))
                }
                setReady(true)
                setError('')
              } catch (failure) { if (!controller.signal.aborted) setError(failure.message) }
            })()
            return () => controller.abort()
          }, [session?.id, run?.id, target, raw])
          if (!session || !run) return error ? h('p', { className: 'aw-error', role: 'alert' }, error) : null
          const older = async () => {
            const own = generation.current
            const first = events[0]?.seq ?? target + 1
            setLoadingOlder(true)
            try {
              const page = await api({ action: 'events', sessionId: session.id, after: Math.max(from - 1, first - 201), limit: Math.min(200, first - from) })
              if (own === generation.current) setEvents(old => uniqueEvents([...page.events.filter(event => event.seq >= from && event.seq < first), ...old]))
            } catch (failure) { if (own === generation.current) setError(failure.message) } finally { if (own === generation.current) setLoadingOlder(false) }
          }
          const name = view.data?.providers.find(provider => provider.id === session.providerId)?.label ?? session.providerId
          const state = active ? (run.state === 'preparing' ? 'preparing' : session.state) : run.state
          const files = run.files?.length ?? 0
          const summary = [
            state === 'completed' ? null : stateText(state),
            run.tools ? (run.tools === 1 ? tt('traceTool') : tt('traceTools', { n: run.tools })) : null,
            files ? (files === 1 ? tt('traceFile') : tt('traceFiles', { n: files })) : null,
          ].filter(Boolean).join(' · ')
          const expanded = !collapsible || open
          const headMeta = h(React.Fragment, null,
            h(StateDot, { state: settle(DOT[state] ?? 'idle', active) }),
            h('span', null, tt('trace', { name })),
            summary ? h('span', { className: 'aw-ellipsis', title: summary }, summary) : null)
          return h('section', { ref: traceRef, className: 'acpw aw-trace', 'aria-label': tt('trace', { name }) },
            h('div', { className: 'aw-trace-head' },
              collapsible
                ? h('button', { type: 'button', className: 'aw-trace-toggle', 'aria-expanded': open, 'aria-label': tt(open ? 'collapse' : 'expand') + ' · ' + tt('trace', { name }), onClick: () => setOpen(v => !v) },
                  headMeta,
                  h(open ? IconChevronUpOutlineRegular : IconChevronDownOutlineRegular, { size: 14, className: 'aw-trace-chevron' }))
                : h(React.Fragment, null, headMeta, h('span', { className: 'aw-grow' })),
              expanded ? h(Button, { size: 'sm', variant: 'ghost', 'aria-pressed': raw, onClick: () => setRaw(!raw) }, tt(raw ? 'viewTimeline' : 'viewRaw')) : null),
            expanded ? h('div', { className: 'aw-trace-body' },
              raw ? h('div', { className: 'aw-trace-meta' }, h(PathLabel, { path: session.cwd, className: 'aw-path' }),
                run.handoff !== undefined ? h('span', null, tt(run.handoff ? 'handoff' : 'sameContext')) : null,
                events[0]?.seq > from ? h(Button, { size: 'sm', variant: 'ghost', disabled: loadingOlder, onClick: older }, tt('older')) : null) : null,
              run.stopReason && run.stopReason !== 'end_turn' ? h('p', { className: 'aw-note' }, tt('stopReason', { reason: run.stopReason })) : null,
              (raw ? ready || events.length : traceReady) ? h(TraceList, { key: `${session.id}:${run.id}`, recordId: session.id, events, folded: raw ? undefined : fallback.rows, raw, interactions: current?.interactions ?? EMPTY, live: active, conversation: true, openFile, cwd: session.cwd }) : h('p', { className: 'aw-note' }, tt('loading')),
              run.error ? h('p', { className: 'aw-error', role: 'alert' }, run.error) : null,
              error || view.error ? h('p', { className: 'aw-error', role: 'alert' }, error || view.error) : null,
              collapsible ? h('div', { className: 'aw-trace-foot' }, h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setOpen(false); requestAnimationFrame(() => traceRef.current?.scrollIntoView({ block: 'nearest' })) } }, tt('collapseTrace'))) : null) : (
              (run.error || error || view.error) ? h('div', { className: 'aw-trace-body' },
                run.error ? h('p', { className: 'aw-error', role: 'alert' }, run.error) : null,
                error || view.error ? h('p', { className: 'aw-error', role: 'alert' }, error || view.error) : null) : null))
        }

        function conversationTarget(s) {
          return s.rootSessionId && s.sessionId !== s.rootSessionId
            ? s.parentSessionId ? { parentSessionId: s.parentSessionId, childSessionId: s.sessionId, mode: 'unknown' } : s.rootSessionId
            : s.sessionId
        }

        function projectConversationTarget(id, row, record) {
          if (record?.native.parentSessionId) return conversationTarget(record.native)
          // An ordinary fork also has a durable parent. Only delegated agents use a child address.
          if (row?.origin === 'subagent' && row.parentId) return { parentSessionId: row.parentId, childSessionId: id, mode: 'unknown' }
          return record ? conversationTarget(record.native) : id
        }

        function OpenConversation({ session }) {
          const tt = useT()
          const [error, setError] = React.useState('')
          const s = session.native
          if (!s) return null
          const child = s.rootSessionId && s.sessionId !== s.rootSessionId
          const target = conversationTarget(s)
          return h(React.Fragment, null, h(Button, { size: 'sm', variant: 'ghost', onClick: () => {
            setError(''); try { ctx.uiWorkspace.openSession(target) } catch (failure) { setError(failure.message) }
          } }, tt(child && !s.parentSessionId ? 'openRoot' : 'openConversation')), error ? h('span', { role: 'alert', className: 'aw-error' }, error) : null)
        }
        const stopOperation = session => session.native
          ? { action: 'native-stop', dshSessionId: session.native.sessionId, externalId: session.id, stopId: session.activity.stopId }
          : { action: 'cancel', sessionId: session.id, stopId: session.activity.stopId }

        // Turn outcome and connection state are different facts: a failed turn may still
        // have a healthy connection. Never present an idle connection as a successful run.
        function activityLabel(session) {
          const { group, runState } = session.activity
          if (group === 'working' && runState === 'preparing' && !BUSY.has(session.state)) return stateText('preparing')
          const connection = stateText(session.state)
          return ['recent', 'review'].includes(group) && ['completed', 'interrupted', 'failed'].includes(runState)
            ? `${stateText(runState)} · ${connection}` : connection
        }

        function ChildRow({ child, sessionId, view, canWrite }) {
          const tt = useT()
          const [expanded, setExpanded] = React.useState(false)
          const latest = child.native.runs.at(-1)
          return h('div', { className: 'aw-child' },
            h('div', { className: 'aw-bar' },
              h(StateDot, { state: DOT[child.state] ?? 'idle' }),
              h('span', { className: 'aw-strong aw-ellipsis' }, child.native.name ?? child.title),
              h('span', { className: 'aw-muted' }, activityLabel(child)),
              h('span', { className: 'aw-grow' }), h(OpenConversation, { session: child }),
              child.activity.stopId ? h(Button, { size: 'sm', variant: 'ghost', disabled: !canWrite || view.busy || child.state === 'canceling', onClick: () => view.run(stopOperation(child)) }, tt('stop')) : null,
              latest ? h(Toggle, { open: expanded, label: tt(expanded ? 'collapse' : 'expand'), onClick: () => setExpanded(!expanded) }) : null),
            child.interactions.map(item => h(InteractionCard, { key: item.id, item, sessionId: child.id, cwd: child.cwd, run: view.run, disabled: view.busy || !canWrite, inline: true })),
            expanded && latest ? h('div', { className: 'aw-child-body' }, h(NativeTrace, { sessionId, reference: { sessionId: child.id, turnId: latest.id } })) : null)
        }

        function PreviousMessages({ binding }) {
          const tt = useT()
          const [page, setPage] = React.useState(null)
          const [pending, setPending] = React.useState(false)
          const [error, setError] = React.useState('')
          const range = binding.native.replayRange
          if (!range || range.to < range.from) return null
          const earlier = async () => {
            const end = page ? page.from - 1 : range.to
            const from = Math.max(range.from, end - 39)
            setPending(true); setError('')
            try {
              const data = await api({ action: 'events', sessionId: binding.id, after: from - 1, limit: end - from + 1 })
              const messages = data.events.filter(e => e.data?.replay && ['user_message_chunk', 'agent_message_chunk', 'compaction_update', 'compaction_summary_chunk'].includes(updateOf(e)?.sessionUpdate))
              setPage(old => ({ from, events: [...messages, ...(old?.events ?? [])] }))
            } catch (failure) { setError(failure.message) } finally { setPending(false) }
          }
          return h('div', { className: 'aw-section' }, h('div', { className: 'aw-row' },
            h(Button, { size: 'sm', variant: 'ghost', disabled: pending, 'aria-expanded': !!page, onClick: () => page ? setPage(null) : earlier() }, tt(page ? 'hidePrevious' : pending ? 'loading' : 'previousMessages')),
            page && page.from > range.from ? h(Button, { size: 'sm', variant: 'ghost', disabled: pending, onClick: earlier }, tt('older')) : null),
            page ? h('div', { className: 'aw-previous', role: 'region', 'aria-label': tt('previousMessages'), tabIndex: 0 }, page.events.length ? h(TraceList, { key: binding.id, events: page.events, cwd: binding.cwd, live: false, conversation: false }) : h('p', { className: 'aw-note' }, tt('noReplay'))) : null,
            error ? h('p', { className: 'aw-error', role: 'alert' }, error) : null)
        }

        function ForkOrigin({ binding }) {
          const tt = useT(), from = binding?.native.forkedFrom
          return from ? h('div', { className: 'aw-section' }, h('strong', { className: 'aw-note' }, tt('forkSource')), from.title && h('span', { className: 'aw-strong' }, from.title), h('code', { className: 'aw-note aw-wrap' }, from.remoteId)) : null
        }

        function CliHistory({ provider, view, sessionId, disabled }) {
          const tt = useT()
          const [page, setPage] = React.useState(null)
          const load = async cursor => {
            const next = await view.run({ action: 'native-discover', route: provider.route, dshSessionId: sessionId, cursor })
            if (next) setPage(old => ({ ...next, sessions: [...new Map([...(cursor && old?.cwd === next.cwd ? old.sessions : []), ...next.sessions.map(s => ({ ...s, cursor }))].map(s => [s.sessionId, s])).values()] }))
          }
          return h('div', { className: 'aw-section' },
            h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'ghost', disabled, 'aria-expanded': !!page, onClick: () => page ? setPage(null) : load() }, tt(view.busy ? 'loading' : page ? 'closeHistory' : 'resumeExisting'))),
            page ? h(React.Fragment, null,
              h('p', { className: 'aw-note' }, tt('resumePick'), ' ', h(PathLabel, { path: page.cwd })), page.canFork && page.sessions.length > 0 && h('p', { className: 'aw-note' }, tt('forkHint')),
              page.sessions.length ? h('ul', { className: 'aw-found' }, page.sessions.map(s => h('li', { key: s.sessionId },
                h('div', { className: 'aw-grow aw-ellipsis' }, h('strong', { className: 'aw-strong', title: s.sessionId }, s.title || s.sessionId),
                  s.updatedAt ? h('div', { className: 'aw-item-sub' }, stamp(s.updatedAt)) : null),
                s.native ? h(OpenConversation, { session: s }) : h(Button, { size: 'sm', variant: 'outline', disabled, onClick: () => view.run({ action: 'native-adopt', dshSessionId: sessionId, route: provider.route, cwd: page.cwd, remoteId: s.sessionId, title: s.title }) }, tt('resumeHere')),
                page.canFork && h(Button, { size: 'sm', variant: 'outline', disabled, onClick: () => view.run({ action: 'native-fork', dshSessionId: sessionId, route: provider.route, cwd: page.cwd, remoteId: s.sessionId, cursor: s.cursor }) }, tt('forkHere'))))) : h('p', { className: 'aw-note', role: 'status' }, tt('noDiscovered')),
              page.nextCursor ? h(Button, { size: 'sm', variant: 'ghost', disabled, onClick: () => load(page.nextCursor) }, tt('more')) : null) : null)
        }

        // The model menu stays compact. Its single ACP action opens controls in this conversation,
        // never a second composer or a page that loses the user's draft.
        function CliMenuOption({ sessionId, dismiss }) {
          const tt = useT()
          const view = useNative(sessionId)
          const provider = view.data?.providers.find(p => p.route === view.data.selected?.provider)
          if (!provider) return null
          return h('button', { type: 'button', role: 'menuitem', className: 'aw-menu-option', 'aria-haspopup': 'dialog', onClick: () => { dismiss(); view.setOptions(provider.route) } },
            h('span', null, tt('cliOptions')), h('span', { className: 'aw-menu-value' }, provider.label),
            h(IconChevronRightOutlineRegular, { size: 12, 'aria-hidden': true }))
        }

        function WorkspaceTools({ sessionId }) {
          const tt = useT()
          const sidebar = ctx.get('sidebarRight'), tabs = ctx.get('sidebarRightTabs')
          if (!sidebar || !tabs) return null
          const entries = [['files', 'filesTab'], ['forge-changes', 'changesTab'], ['terminal', 'terminalTab']].filter(([kind]) => tabs.get(kind))
          if (!entries.length) return null
          return h('div', { className: 'aw-row', role: 'group', 'aria-label': tt('projectTools') }, entries.map(([kind, label]) => h(Button, { key: kind, size: 'sm', variant: 'outline', onClick: e => {
            const target = sidebar.commandTarget(e.currentTarget)
            if (target?.sessionId !== sessionId) return
            if (kind === 'forge-changes') sidebar.openResource('dsh-resource://forge-changes/' + encodeURIComponent(sessionId) + '/local')
            else sidebar.openTabFromTarget(kind, target)
          } }, tt(label))))
        }

        function CliSettingsOverlay({ sessionId, useAccess }) {
          const view = useNative(sessionId)
          const canWrite = useAccess('session/prompt')
          const data = view.data
          const provider = data?.providers.find(p => p.route === data.selected?.provider && p.route === view.optionsRoute)
          if (!provider) return null
          const binding = data.sessions.findLast(s => s.native.sessionId === sessionId && s.native.route === provider.route && !s.native.retired)
          return h(CliOptions, { key: `${sessionId}:${provider.route}`, sessionId, provider, binding, view, canWrite })
        }

        function CliOptions({ sessionId, provider, binding, view, canWrite }) {
          const tt = useT()
          const popup = React.useRef(null)
          const anchorName = '--aw-cli-' + React.useId().replace(/[^\w-]/g, '')
          const [detail, setDetail] = React.useState(null)
          const [error, setError] = React.useState('')
          const info = detail?.id === binding?.id ? detail?.data : null
          const close = () => popup.current?.hidePopover()
          React.useLayoutEffect(() => {
            const panel = popup.current
            panel.showPopover()
            panel.focus({ preventScroll: true })
            return () => panel.hidePopover()
          }, [])
          // Fetch configuration only while the panel is open. No model catalogs in token updates.
          const revision = binding?.state === 'idle' ? binding.eventSeq : null
          React.useEffect(() => {
            if (!binding) return
            const controller = new AbortController()
            api({ action: 'get', sessionId: binding.id }, controller.signal).then(data => { if (!controller.signal.aborted) { setDetail({ id: binding.id, data }); setError('') } }, failure => { if (!controller.signal.aborted) setError(failure.message) })
            return () => controller.abort()
          }, [binding?.id, revision])
          const blocked = !canWrite || view.busy || view.data.status !== 'idle'
          const enabled = !blocked && binding?.state === 'idle' && !binding.archived
          const entries = info ? configEntries(info, tt).filter(e => e.category !== 'model' && (e.category !== 'thought_level' || view.data.selected?.model === 'default')) : []
          const title = `${provider.label} · ${tt('cliOptions')}`
          return h(React.Fragment, null, h('div', { style: { anchorName }, 'aria-hidden': true }),
            h('section', { ref: popup, className: 'acpw aw-options aw-section', style: { positionAnchor: anchorName },
              popover: 'auto', role: 'dialog', 'aria-label': title, tabIndex: -1,
              onToggle: e => { if (e.target === e.currentTarget && e.newState === 'closed') view.setOptions(null) } },
            h('div', { className: 'aw-row' }, h('strong', { className: 'aw-grow' }, title), binding ? h(Status, { state: binding.state }) : null,
              h(Button, { size: 'sm', variant: 'ghost', onClick: close }, tt('hideOptions'))),
            binding ? h('p', { className: 'aw-note aw-ellipsis', title: binding.cwd }, binding.title, ' · ', binding.cwd) : null,
            h(WorkspaceTools, { sessionId }),
            h(ForkOrigin, { binding }), binding?.native.imported ? h(PreviousMessages, { binding }) : null,
            !binding || !CONNECTED.has(binding.state) ? h(React.Fragment, null,
              h('p', { className: 'aw-note' }, tt(!binding ? 'firstTurn' : binding.archived ? 'archivedHint' : 'noConfig')),
              h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'outline', disabled: blocked || binding?.archived, onClick: () => view.run({ action: 'native-connect', dshSessionId: sessionId, externalId: binding?.id, route: provider.route }) }, tt('connectOnly'))),
              !binding ? h(CliHistory, { key: sessionId + ':' + provider.route, sessionId, provider, view, disabled: blocked }) : null) : null,
            binding && !info && !error ? h('p', { className: 'aw-note', role: 'status' }, tt('loading')) : null,
            entries.length ? h('div', { className: 'aw-config' }, entries.map(entry => h(ConfigControl, { key: entry.id, entry, disabled: !enabled, onChange: values => view.run({ action: 'configure', sessionId: binding.id, ...values }) }))) : null,
            info?.commands?.length ? h(CommandForm, { session: info, disabled: !enabled, onRun: async (command, args) => {
              const result = await view.run({ action: 'native-command', dshSessionId: sessionId, externalId: binding.id, commandStamp: info.commandStamp, command, arguments: args })
              if (result) close()
              return !!result
            } }) : null,
            info?.usage && view.data?.contextReport?.externalId !== binding?.id ? h('p', { className: 'aw-note' }, usageText(info.usage)) : null,
            error || view.error ? h('p', { role: 'alert', className: 'aw-error' }, error || view.error) : null))
        }

        /** Contextual help only. The native composer still owns all new input and the Stop button. */
        function EngineHint({ provider, binding, sessionId, view, canWrite }) {
          const tt = useT()
          const blocked = !canWrite || view.busy || view.data.status !== 'idle'
          const issue = binding.activity.issue
          const disconnected = !CONNECTED.has(binding.state)
          const freshCopy = binding.native.forkedFrom && binding.state === 'disconnected' && !binding.native.runs.length && !binding.lastError && !binding.stopReason
          return h('section', { className: 'aw-card aw-engine-hint', 'aria-label': tt('connection') },
            h('div', { className: 'aw-row' }, h(StateDot, { size: 8, state: issue ? 'warning' : 'idle' }), h('strong', null, provider.label),
              h(Status, { state: binding.state })),
            h('p', { className: 'aw-note' }, tt(binding.archived ? 'archivedHint' : freshCopy ? 'forkReady' : binding.state === 'idle' ? (binding.activity.group === 'review' ? 'readyAfterError' : 'importedReady') : binding.activity.group === 'review' ? 'recoveryHint' : 'resumeHint', { name: binding.title })),
            h(ForkOrigin, { binding }), binding.native.imported && binding.state === 'idle' && !binding.native.runs.length ? h(PreviousMessages, { key: binding.id, binding }) : null,
            issue ? h('p', { className: 'aw-error' }, issue) : null,
            h('div', { className: 'aw-row' },
              binding.archived ? h(Button, { size: 'sm', variant: 'outline', disabled: blocked, onClick: () => view.run({ action: 'restore', sessionId: binding.id }) }, tt('unarchive')) : null,
              !binding.archived && disconnected ? h(Button, { size: 'sm', variant: 'outline', disabled: blocked, onClick: () => view.run({ action: 'native-connect', dshSessionId: sessionId, externalId: binding.id }) }, tt(binding.remoteId && !freshCopy ? 'reconnect' : 'connect')) : null,
              !binding.archived && binding.activity.group === 'review' ? h(Button, { size: 'sm', variant: 'ghost', disabled: blocked, onClick: () => { if (window.confirm(tt('newContextConfirm'))) void view.run({ action: 'native-reset', externalId: binding.id }) } }, tt('newContext')) : null))
        }

        function CheckoutSwitcher({ sessionId, workspaceId, providers }) {
          const tt = useT(), workspaces = useList(ctx.workspaces.list), catalog = useList(ctx.sessions.list)
          const [open, toggle] = React.useState(false), [result, show] = React.useState(null), [error, fail] = React.useState(''), [version, refresh] = React.useReducer(n => n + 1, 0)
          const project = workspaces.items.find(w => w.workspaceId === workspaceId), member = project?.sessionIds.includes(sessionId)
          const members = open && member ? project.sessionIds.filter(id => !workspaces.archivedSessionIds.includes(id)).join(':') : ''
          React.useEffect(() => {
            if (!open || !member) return
            const controller = new AbortController(); show(null); fail('')
            api({ action: 'checkout-info', workspaceId, dshSessionId: sessionId }, controller.signal).then(v => { if (!controller.signal.aborted) show(v) }, e => { if (!controller.signal.aborted) fail(e.message) })
            return () => controller.abort()
          }, [open, member, members, workspaceId, sessionId, version])
          if (!member) return null
          const trees = result?.trees.filter(w => w.inUseHere && w.participants?.includes(sessionId) && w.participants.length > 1)
          return h('section', { className: 'aw-card' }, h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => toggle(!open) }, tt('switchShared')), open ? h(Button, { size: 'sm', variant: 'ghost', onClick: refresh }, tt('schRefresh')) : null),
            open && (error ? h('p', { role: 'alert', className: 'aw-error' }, error) : !result ? h('p', { className: 'aw-note' }, tt('loading')) : !trees.length ? h('p', { className: 'aw-note' }, tt('noSharedPeers')) : trees.map(tree => h('div', { key: tree.revision, className: 'aw-section' }, h(PathLabel, { path: tree.path }), h(SharedCheckout, { tree, value: result, group: { catalog, providers, related: new Map() } })))) )
        }

        // From the global project page an inactive session does not yet have a Sidebar seat.
        // Consume the click in the arriving conversation's committed render, never in the previously active sidebar.
        let arrivingSidebar = null
        function clearArrival() { const intent = arrivingSidebar; arrivingSidebar = null; intent?.unsubscribe?.() }
        ctx.effect(() => clearArrival, 'acp-workbench: sidebar navigation')
        function openInConversation(sessionId, target, kind, open) {
          const sidebar = ctx.get('sidebarRight'), missing = () => new Error(t(kind === 'terminal' ? 'termMissing' : 'reviewPath'))
          clearArrival()
          if (!sidebar || !ctx.get('sidebarRightTabs')?.get(kind)) throw missing()
          if (sidebar.mounted.getSnapshot() === sessionId) { open(sidebar); return }
          const intent = { sessionId, kind, open, sidebar }
          arrivingSidebar = intent
          try {
            ctx.uiWorkspace.openSession(target ?? sessionId)
            if (sidebar.mounted.getSnapshot() !== sessionId) throw missing()
            if (arrivingSidebar === intent) intent.unsubscribe = sidebar.mounted.subscribe(() => { if (sidebar.mounted.getSnapshot() !== sessionId) clearArrival() })
          } catch (failure) { clearArrival(); throw failure }
        }
        function openReviewResource(sessionId, target, address, line) {
          openInConversation(sessionId, target, 'text', sidebar => sidebar.openResource(address, { destination: 'sidebar', ...(line ? { params: { line } } : {}) }))
        }
        function openRetainedTerminal(sessionId, target, terminalId) {
          openInConversation(sessionId, target, 'terminal', sidebar => {
            const terminals = ctx.get('webTerminals')
            if (!terminals || !terminalId) throw new Error(t('termMissing'))
            const before = sidebar.tabsIn(sessionId)
            const existing = before.find(tab => tab.kind === 'terminal' && (terminals.boundTerminal(sessionId, tab.contentId) ?? sidebar.tabDomain.occurrence(sessionId, tab).navigation.getSnapshot().params?.terminalId) === terminalId)
            if (existing) { if (!sidebar.isExpanded()) sidebar.toggleExpanded(); sidebar.focus(existing.id); return }
            if (terminals.isRepresented(sessionId, terminalId)) throw new Error(t('termMissing'))
            sidebar.openTabIn(sessionId, 'terminal', { params: { terminalId } })
            const opened = sidebar.tabsIn(sessionId).find(tab => tab.kind === 'terminal' && !before.some(prev => prev.id === tab.id) && sidebar.tabDomain.occurrence(sessionId, tab).navigation.getSnapshot().params?.terminalId === terminalId)
            if (!opened) throw new Error(t('termMissing'))
            terminals.bind(sessionId, opened.contentId, terminalId)
          })
        }
        function useArrivingSidebar(sessionId, canAttach) {
          const [failure, setFailure] = React.useState(null)
          React.useEffect(() => {
            const intent = arrivingSidebar
            if (!intent || intent.sessionId !== sessionId || intent.sidebar.mounted.getSnapshot() !== sessionId) return
            clearArrival()
            try {
              if (intent.kind === 'terminal' && !canAttach) throw new Error(t('termMissing'))
              intent.open(intent.sidebar); setFailure(null)
            } catch (e) { setFailure({ sessionId, message: e.message }) }
          })
          return failure?.sessionId === sessionId ? failure.message : null
        }

        function NativeDock(props) {
          const navigationError = useArrivingSidebar(props.sessionId, props.useAccess('terminal/attach'))
          const tt = useT()
          const canWrite = props.useAccess('session/prompt')
          const view = useNative(props.sessionId)
          const data = view.data
          const sessions = data?.sessions ?? EMPTY
          const own = sessions.filter(s => s.native.sessionId === props.sessionId && s.interactions.length)
          const provider = data?.providers.find(p => p.route === data.selected?.provider)
          const binding = provider ? sessions.findLast(s => s.native.sessionId === props.sessionId && s.native.route === provider.route && !s.native.retired) : null
          useCommandScope(props.sessionId, canWrite && data?.status === 'idle' && !view.error && binding?.state === 'idle' && !binding.archived ? binding.id : null, data?.commandStamp, provider?.label)
          const hint = binding && !own.length && (binding.archived || binding.activity.group === 'review' || (binding.state === 'disconnected' && binding.activity.group === 'recent') || (binding.native.imported && !binding.native.runs.length && binding.state === 'idle'))
          const children = sessions.filter(s => s.native.sessionId !== props.sessionId && !s.native.retired && !s.archived)
          const visible = children.filter(s => ['attention', 'working', 'review'].includes(s.activity.group)).toSorted((a, b) => GROUPS.indexOf(a.activity.group) - GROUPS.indexOf(b.activity.group))
          const quiet = children.filter(s => s.activity.group === 'recent')
          const contextReport = binding && !binding.archived && data.contextReport?.externalId === binding.id ? data.contextReport : null
          const notices = binding && !binding.archived && data.noticeFeed?.externalId === binding.id && data.noticeFeed.remoteId === binding.remoteId && data.noticeFeed.items.length ? data.noticeFeed : null
          if (!notices && !contextReport && !hint && !own.length && !children.length && !data?.checkoutGroup && !view.error && !navigationError) return null
          const childRow = child => h(ChildRow, { key: child.id, child, sessionId: props.sessionId, view, canWrite })
          return h('div', { className: 'acpw aw-dock' },
            own.flatMap(s => s.interactions.map(item => h(InteractionCard, { key: item.id, item, sessionId: s.id, cwd: s.cwd, run: view.run, disabled: view.busy || !canWrite }))),
            hint ? h(EngineHint, { key: `${props.sessionId}:${provider.route}`, provider, binding, sessionId: props.sessionId, view, canWrite }) : null,
            notices ? h(ConnectionNotices, { key: 'notice:' + binding.id + ':' + notices.connection, report: notices }) : null,
            contextReport ? h(ContextReport, { key: 'context:' + binding.id, report: contextReport, title: tt('contextRecent') }) : null,
            data?.checkoutGroup ? h(CheckoutSwitcher, { key: props.sessionId, sessionId: props.sessionId, workspaceId: data.checkoutGroup, providers: data.providers }) : null,
            children.length ? h('section', { className: 'aw-card', 'aria-label': tt('children') },
              h('div', { className: 'aw-bar' }, h('span', { className: 'aw-bar-title' }, tt('children')), h('span', { className: 'aw-muted' }, String(children.length))),
              visible.map(childRow), quiet.length ? h('details', null, h('summary', null, tt('quietChildren', { n: quiet.length })), quiet.map(childRow)) : null) : null,
            navigationError || view.error ? h('p', { className: 'aw-error', role: 'alert' }, navigationError || view.error) : null)
        }

        ctx.uiConversation.events.register({
          kind: 'acp-route',
          match: { 'request/context': event => ({ id: String(event.seq), role: 'start' }) },
          start: (_context, match) => ({ provider: match.event.data.provider }),
          update: (_context, match) => ({ provider: match.event.data.provider }),
        })
        const traceMatch = event => ({ id: `${event.data.turn}:${event.data.step}`, role: 'start' })
        const traceState = (event, previous) => {
          const source = event.data.message?.source
          return { turn: event.data.turn, step: event.data.step, seq: event.seq,
            provider: source ? source.provider : previous?.provider,
            reference: source?.replayState?.response?.acp ?? previous?.reference, messageId: event.data.message?.id ?? previous?.messageId }
        }
        ctx.uiConversation.events.register({
          kind: 'acp-run', target: 'chat',
          match: {
            'assistant/live-chunk': event => event.data.chunk.type === 'block-start' ? traceMatch(event) : null,
            'assistant/message': event => event.surfaceOp === 'append' ? traceMatch(event) : null,
          },
          start: (_context, match, reader) => traceState(match.event, reader.previous('acp-route')?.state),
          update: (context, match) => ({ ...traceState(match.event, context.state), seq: context.state.seq }),
          buildViewNode: context => context.state?.provider?.startsWith('acp-') ? { key: context.key, id: context.id, kind: 'acp-run', target: 'chat',
            // Tool activity from every ACP engine stays visible outside the native process disclosure.
            groupTree: 'turn',
            anchorSeq: context.state.seq, location: context.start?.location ?? { kind: 'unresolved' }, visibility: 'visible', data: context.state } : null,
        })
        function NativeNode(props) {
          return h(NativeTrace, { sessionId: props.sessionId, openFile: props.openFile, ...props.node.data })
        }

        const collapsedRepliesKey = 'dsh-acp-workbench:collapsed-replies:v1'
        const MAX_COLLAPSED_REPLIES = 300
        let collapsedReplies = new Set()
        const collapsedReplyListeners = new Set()
        try {
          const stored = JSON.parse(window.localStorage?.getItem(collapsedRepliesKey) ?? '[]')
          if (Array.isArray(stored)) collapsedReplies = new Set(stored.filter(item => typeof item === 'string').slice(-MAX_COLLAPSED_REPLIES))
        } catch { /* storage may be unavailable */ }
        const subscribeCollapsedReplies = listener => { collapsedReplyListeners.add(listener); return () => collapsedReplyListeners.delete(listener) }
        const isReplyCollapsed = key => collapsedReplies.has(key)
        const setReplyCollapsed = (key, value) => {
          if (collapsedReplies.has(key) === value) return
          const next = new Set(collapsedReplies)
          if (value) {
            next.add(key)
            while (next.size > MAX_COLLAPSED_REPLIES) next.delete(next.values().next().value)
          } else next.delete(key)
          collapsedReplies = next
          try { window.localStorage?.setItem(collapsedRepliesKey, JSON.stringify([...next])) } catch { /* keep memory copy */ }
          for (const listener of collapsedReplyListeners) listener()
        }
        function replyPreviewLine(text) {
          for (const line of text.split(/\r?\n/u)) {
            const clean = line.trim().replace(/^#{1,6}\s+|^>\s*|^[-*+]\s+|`+/gu, '').trim()
            if (clean) return clean.length > 72 ? `${clean.slice(0, 71)}…` : clean
          }
          return ''
        }
        function AcpTurnReplyToggle({ sessionId, turn, seq }) {
          const tt = useT()
          const view = useNative(sessionId)
          const btnRef = React.useRef(null)
          const steps = (turn?.steps ?? EMPTY).map(step => step.data.get('assistant-step')).filter(Boolean)
          const acpStep = steps.findLast(step => step.finalNode?.source?.provider?.startsWith('acp-'))
          const matchedSession = acpStep
            ? view.data?.sessions.find(s => s.native?.route === acpStep.finalNode.source.provider)
            : view.data?.sessions.find(s => s.native?.sessionId === sessionId && s.native.runs.some(r => r.turn === turn?.turn))
          const route = acpStep?.finalNode?.source?.provider ?? matchedSession?.native?.route
          const visibleBlocks = steps.flatMap(step => (step.blocks ?? EMPTY).filter(block =>
            block.kind !== 'reasoning' && block.kind !== 'tool-call' && (block.kind !== 'text' || block.text.trim() !== '')))
          const isAcpReply = !!route?.startsWith('acp-') && visibleBlocks.length > 0
          const messageId = acpStep?.finalNode?.messageId ?? steps.at(-1)?.finalNode?.messageId
          const replyKey = `${sessionId}:${turn?.turn ?? 0}:${messageId ?? seq}`
          const collapsed = React.useSyncExternalStore(
            subscribeCollapsedReplies,
            () => isAcpReply && isReplyCollapsed(replyKey),
            () => false,
          )
          React.useLayoutEffect(() => {
            const turnNo = turn?.turn
            const container = btnRef.current?.closest('[data-chat-flow-kind="turn-tail"]')?.parentElement
            if (!isAcpReply || turnNo == null || !container) return undefined
            const selector = `[data-chat-flow-kind="assistant-step"][data-chat-turn="${CSS.escape(String(turnNo))}"]:not([data-chat-group-part="reasoning"])`
            const targets = [...container.querySelectorAll(selector)]
            const reveal = () => setReplyCollapsed(replyKey, false)
            for (const element of targets) {
              if (collapsed) {
                element.setAttribute('hidden', 'until-found')
                element.setAttribute('data-acp-reply-hidden', 'true')
                element.addEventListener('beforematch', reveal)
              } else if (element.hasAttribute('data-acp-reply-hidden')) {
                element.removeAttribute('hidden')
                element.removeAttribute('data-acp-reply-hidden')
              }
            }
            return () => {
              for (const element of targets) {
                element.removeEventListener('beforematch', reveal)
                if (element.hasAttribute('data-acp-reply-hidden')) {
                  element.removeAttribute('hidden')
                  element.removeAttribute('data-acp-reply-hidden')
                }
              }
            }
          }, [isAcpReply, collapsed, replyKey, turn?.turn, steps.length])
          if (!isAcpReply) return null
          const providerLabel = view.data?.providers.find(p => p.route === route)?.label ?? route.slice(4)
          const fullText = visibleBlocks.filter(b => b.kind === 'text').map(b => b.text).join('\n\n')
          const lineCount = fullText.trim() ? fullText.trim().split(/\r?\n/u).length : 0
          const imageCount = visibleBlocks.filter(b => b.kind === 'image').length
          const preview = replyPreviewLine(fullText)
          const meta = [
            lineCount ? tt('replyLines', { n: lineCount }) : null,
            imageCount ? tt('replyImages', { n: imageCount }) : null,
            preview || null,
          ].filter(Boolean).join(' · ')
          const toggle = () => {
            const next = !collapsed
            setReplyCollapsed(replyKey, next)
            if (next) requestAnimationFrame(() => btnRef.current?.scrollIntoView({ block: 'nearest' }))
          }
          if (!collapsed) {
            return h('button', {
              ref: btnRef, type: 'button', className: 'acpw aw-reply-toggle', 'data-open': 'true',
              'aria-expanded': true, 'aria-label': `${tt('collapseReply')} · ${providerLabel}`, onClick: toggle,
            }, h('span', null, tt('collapseReply')), h(IconChevronUpOutlineRegular, { size: 14 }))
          }
          const interrupted = steps.some(step => step.finalNode?.interrupted)
          return h('button', {
            ref: btnRef, type: 'button', className: 'acpw aw-reply-toggle',
            'aria-expanded': false, 'aria-label': `${tt('expandReply')} · ${providerLabel}`, onClick: toggle,
          },
            h(StateDot, { state: interrupted ? 'warning' : 'done', size: 8 }),
            h('span', null, tt('replyCollapsed', { name: providerLabel })),
            meta ? h('span', { className: 'aw-ellipsis', title: preview || meta }, meta) : null,
            h(IconChevronDownOutlineRegular, { size: 14, className: 'aw-trace-chevron' }))
        }
        ctx.slots.inject('conversation.input.model.options', () => ctx.slots.register({ name: 'conversation.input.model.options', id: 'acp-settings', order: 40 }, CliMenuOption))
        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({ name: 'conversation.input.overlay', id: 'acp-settings', order: 40 }, CliSettingsOverlay))
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({ name: 'conversation.composer.dock', id: 'acp-native', order: 40 }, NativeDock))
        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({ name: 'conversation.chat.node', key: 'acp-run' }, NativeNode))
        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({ name: 'conversation.chat.turnTail', id: 'acp-reply-collapse', order: 10, locale: NS, inject: sessionId => ({ sessionId }) }, AcpTurnReplyToggle))

        /* ---------------------------------------------------------------- sidebar page */

        function useWorkbench(selected) {
          const [data, setData] = React.useState({ providers: EMPTY, sessions: EMPTY, storageError: null })
          const [ready, setReady] = React.useState(false)
          const [detail, setDetail] = React.useState(null)
          const [events, setEvents] = React.useState(EMPTY)
          const [error, setError] = React.useState('')
          const kick = React.useRef(null)
          const active = React.useRef(null)
          React.useEffect(() => {
            const controller = new AbortController()
            active.current = controller
            let cursor = null
            let loading = false
            let again = false
            setDetail(null)
            setEvents(EMPTY)
            const refresh = async () => {
              if (loading) { again = true; return }
              loading = true
              try {
                do {
                  again = false
                  try {
                    const response = await fetch('/acp-workbench/state', { signal: controller.signal })
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    const next = await response.json()
                    if (controller.signal.aborted) return
                    setData(next)
                    setReady(true)
                    if (selected) {
                      const session = await api({ action: 'get', sessionId: selected }, controller.signal)
                      if (controller.signal.aborted) return
                      setDetail(session)
                      if (cursor === null) cursor = Math.max(0, (session.eventSeq ?? 0) - 200)
                      if (cursor < (session.eventSeq ?? 0)) {
                        const page = await api({ action: 'events', sessionId: selected, after: cursor, limit: 200 }, controller.signal)
                        if (controller.signal.aborted) return
                        cursor = page.next
                        setEvents(old => uniqueEvents([...old, ...page.events]))
                        if (page.more) again = true
                      }
                    }
                    setError('')
                  } catch (failure) { if (!controller.signal.aborted) setError(failure.message) }
                } while (again && !controller.signal.aborted)
              } finally { loading = false }
            }
            kick.current = refresh
            void refresh()
            const unsubscribe = subscribeLive(change => { if (change?.activityChanged !== false) void refresh() })
            return () => { controller.abort(); unsubscribe(); kick.current = null }
          }, [selected])
          const older = async () => {
            const first = events[0]?.seq ?? 1
            if (first <= 1) return
            const signal = active.current?.signal
            const page = await api({ action: 'events', sessionId: selected, after: Math.max(0, first - 201), limit: Math.min(200, first - 1) }, signal)
            if (!signal?.aborted) setEvents(old => uniqueEvents([...page.events, ...old]))
          }
          return { data, ready, detail: detail?.id === selected ? detail : null, events, error, older, refresh: () => kick.current?.() }
        }

        const blankProvider = () => ({ id: '', label: '', command: '', args: '["acp"]' })
        const capabilityTags = info => {
          const agent = info.agentCapabilities ?? {}
          return [
            ['cap.loadSession', agent.sessionCapabilities?.resume || agent.loadSession], ['cap.list', agent.sessionCapabilities?.list], ['cap.image', agent.promptCapabilities?.image],
            ['cap.audio', agent.promptCapabilities?.audio], ['cap.embeddedContext', agent.promptCapabilities?.embeddedContext],
            ['cap.mcpHttp', agent.mcpCapabilities?.http], ['cap.mcpSse', agent.mcpCapabilities?.sse],
          ].map(([key, value]) => ({ key, status: value == null ? 'unreported' : value === false ? 'unsupported' : 'supported' }))
        }

        function CapabilityReport({ info }) {
          const tt = useT()
          const agentInfo = info.agentInfo ?? info.serverInfo
          return h('div', { className: 'aw-section' },
            h('dl', { className: 'aw-facts' },
              agentInfo ? h(React.Fragment, null, h('dt', null, tt('agent')), h('dd', null, [agentInfo.title ?? agentInfo.name, agentInfo.version].filter(Boolean).join(' '))) : null,
              h('dt', null, tt('protocol')), h('dd', null, `ACP v${info.protocolVersion ?? '?'}`),
              h('dt', null, tt('authMethods')), h('dd', null, info.authMethods?.length ? info.authMethods.map(method => method.name ?? method.id).join(', ') : tt('none'))),
            h('div', { className: 'aw-tags', 'aria-label': tt('capabilities') }, capabilityTags(info).map(item => h(Tag, { key: item.key, tone: item.status === 'supported' ? 'success' : 'quiet' }, `${tt(item.key)} · ${tt(item.status)}`))),
            h(Json, { label: tt('rawResult'), payload: info }))
        }

        function ProvidersTab({ providers, run, busy, cwdHint, onImported }) {
          const tt = useT()
          const [editing, setEditing] = React.useState(providers[0]?.id ?? '')
          const [draft, setDraft] = React.useState(() => providers[0] ? { ...providers[0], args: JSON.stringify(providers[0].args) } : blankProvider())
          const [notice, setNotice] = React.useState('')
          const [cwd, setCwd] = React.useState(cwdHint ?? '')
          const [report, setReport] = React.useState(null)
          const [discovery, setDiscovery] = React.useState(null)
          const [modelCount, setModelCount] = React.useState(null)
          const [selectedModels, setSelectedModels] = React.useState(() => providers[0]?.models ?? [])
          const [modelsSaved, setModelsSaved] = React.useState(false)
          const saved = providers.find(provider => provider.id === editing)
          const modelChoices = [...[...(saved?.advertised?.models ?? []), ...(saved?.models ?? []), ...selectedModels]
            .reduce((map, model) => map.set(model.id, { ...map.get(model.id), ...model }), new Map()).values()].filter(model => model.id !== 'default')
          const modelInfo = model => [model.description,
            model.inputModalities?.length ? tt('modelInput', { types: model.inputModalities.map(type => tt(type === 'image' ? 'modalityImage' : 'modalityText')).join(' / ') }) : null,
            model.contextWindow ? tt('modelContext', { n: model.contextWindow }) : null,
            model.maxTokens ? tt('modelOutput', { n: model.maxTokens }) : null,
            model.reasoning ? tt('modelEfforts', { levels: model.reasoning.efforts.map(effort => effort.name).join(' / ') }) : null,
          ].filter(Boolean).join(' · ') || tt('modelInfoUnknown')
          const canSaveModels = !!saved && !busy && JSON.stringify(selectedModels) !== JSON.stringify(saved.models ?? [])
          const edit = provider => {
            setEditing(provider?.id ?? '')
            setDraft(provider ? { ...provider, args: JSON.stringify(provider.args) } : blankProvider())
            setNotice(''); setReport(null); setDiscovery(null); setModelCount(null)
            setSelectedModels(provider?.models ?? []); setModelsSaved(false)
          }
          React.useEffect(() => { if (!editing && providers[0] && !draft.id && !draft.command) edit(providers[0]) }, [providers.length])
          // Records arrive after the first render; offer the latest record's directory once known.
          React.useEffect(() => { if (!cwd && cwdHint) setCwd(cwdHint) }, [cwdHint])
          const change = key => event => { setDraft(old => ({ ...old, [key]: event.target.value })); setNotice('') }
          const save = async event => {
            event.preventDefault()
            let args
            try { args = JSON.parse(draft.args) } catch { args = null }
            if (!Array.isArray(args) || args.some(item => typeof item !== 'string')) { setNotice(tt('argsInvalid')); return }
            const value = await run({ action: 'provider-save', provider: { id: draft.id.trim(), label: draft.label, command: draft.command, args, models: saved?.models ?? [] } })
            if (value) { setEditing(value.id); setNotice(tt('saved')) }
          }
          const remove = async () => {
            if (!saved || !window.confirm(tt('removeConfirm'))) return
            if (await run({ action: 'provider-remove', providerId: saved.id })) edit(providers.find(provider => provider.id !== saved.id))
          }
          const discover = async cursor => {
            const value = await run({ action: 'discover', providerId: saved.id, cwd, ...(cursor ? { cursor } : {}) })
            if (value) setDiscovery(old => cursor && old ? { ...value, sessions: [...old.sessions, ...(value.sessions ?? [])] } : { ...value, sessions: value.sessions ?? [] })
          }
          const saveModels = async () => {
            const value = await run({ action: 'provider-save', provider: { ...saved, models: selectedModels } })
            if (value) { setSelectedModels(value.models); setModelsSaved(true) }
          }
          const canCheck = !!saved && !busy && !!cwd.trim()
          return h('div', { className: 'aw-split' },
            h('nav', { className: 'aw-nav', 'aria-label': tt('providerList') },
              providers.map(provider => h('button', { key: provider.id, type: 'button', className: 'aw-item', 'aria-current': provider.id === editing, disabled: busy, onClick: () => edit(provider) },
                h('span', { className: 'aw-item-top' }, h('span', { className: 'aw-strong aw-ellipsis' }, provider.label), h(Tag, { tone: 'quiet' }, provider.id)),
                h('span', { className: 'aw-item-sub aw-mono aw-ellipsis' }, [provider.command, ...provider.args].join(' ')))),
              h(Button, { size: 'sm', variant: 'ghost', icon: h(IconPlusOutlineRegular, { size: 14 }), disabled: busy, onClick: () => edit(null) }, tt('addProvider'))),
            h('div', { className: 'aw-stack' },
              h('form', { className: 'aw-box', onSubmit: save },
                h('div', { className: 'aw-box-head' }, h('h2', null, saved ? tt('editProvider') : tt('newProviderTitle'))),
                h('p', { className: 'aw-note' }, tt('providerHint')),
                h('div', { className: 'aw-form' },
                  h('label', { className: 'aw-field' }, h('span', null, tt('fieldLabel')), h(Input, { className: 'aw-input', value: draft.label, required: true, onChange: change('label') })),
                  h('label', { className: 'aw-field' }, h('span', null, tt('fieldId')), h(Input, { className: 'aw-input aw-mono', value: draft.id, required: true, pattern: '[a-z][a-z0-9-]*', disabled: !!saved, onChange: change('id') })),
                  h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldCommand')), h(Input, { className: 'aw-input aw-mono', value: draft.command, required: true, onChange: change('command') }),
                    h('span', { className: 'aw-note' }, tt('fieldCommandHint'))),
                  h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldArgs')), h('textarea', { className: 'aw-textarea', value: draft.args, rows: 2, required: true, spellCheck: false, onChange: change('args') }),
                    h('span', { className: 'aw-note' }, tt('fieldArgsHint')))),
                h('div', { className: 'aw-row' },
                  h(Button, { type: 'submit', size: 'sm', variant: 'primary', disabled: busy }, tt('save')),
                  saved ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: remove }, tt('remove')) : null,
                  notice ? h('span', { className: notice === tt('saved') ? 'aw-note' : 'aw-error', role: 'status' }, notice) : null)),
              saved ? h('section', { className: 'aw-box', 'aria-label': tt('check') },
                h('div', { className: 'aw-box-head' }, h('h2', null, tt('check'))),
                h('p', { className: 'aw-note' }, tt('checkHint')),
                h('label', { className: 'aw-field' }, h('span', null, tt('cwd')), h(Input, { className: 'aw-input aw-mono', value: cwd, disabled: busy, placeholder: tt('cwdPlaceholder'), onChange: event => { setCwd(event.target.value); setReport(null); setDiscovery(null); setModelCount(null) } })),
                h('div', { className: 'aw-row' },
                  h(Button, { size: 'sm', variant: 'outline', disabled: !canCheck, onClick: async () => { const value = await run({ action: 'diagnose', providerId: saved.id, cwd: cwd.trim() }); if (value) setReport(value) } }, tt('diagnose')),
                  h(Button, { size: 'sm', variant: 'outline', disabled: !canCheck, onClick: async () => { const value = await run({ action: 'models', providerId: saved.id, cwd: cwd.trim() }); if (value) setModelCount(value.models.length) } }, tt('refreshModels')),
                  h(Button, { size: 'sm', variant: 'ghost', disabled: !canCheck, onClick: () => discover() }, tt('discover'))),
                h('p', { className: 'aw-note' }, tt('modelsHint')),
                modelCount !== null ? h('p', { className: 'aw-note', role: 'status' }, tt('modelsLoaded', { n: modelCount })) : null,
                h('fieldset', { className: 'aw-section' },
                  h('legend', { className: 'aw-strong' }, tt('visibleModels')),
                  h('p', { className: 'aw-note' }, tt('modelSelectionHint')),
                  h('p', { className: 'aw-note' }, tt('modelInfoHint')),
                  modelChoices.length ? h('div', { className: 'aw-model-list' }, modelChoices.map(model => h('label', { key: model.id, className: 'aw-option' },
                    h('input', { type: 'checkbox', checked: selectedModels.some(item => item.id === model.id), disabled: busy, onChange: event => {
                      const checked = event.target.checked
                      setSelectedModels(old => checked ? [...old, { id: model.id, name: model.name ?? model.id }] : old.filter(item => item.id !== model.id))
                      setModelsSaved(false)
                    } }),
                    h('span', { className: 'aw-grow' }, h('span', null, model.name ?? model.id),
                      h('span', { className: 'aw-item-sub aw-mono', style: { display: 'block' } }, model.id),
                      h('span', { className: 'aw-item-sub', style: { display: 'block' } }, modelInfo(model))))))
                    : h('p', { className: 'aw-note' }, tt('noModels')),
                  h('div', { className: 'aw-row' },
                    h(Button, { size: 'sm', variant: 'primary', disabled: !canSaveModels, onClick: saveModels }, tt('saveModels')),
                    modelsSaved ? h('span', { className: 'aw-note', role: 'status' }, tt('modelsSaved')) : null)),
                report ? h(CapabilityReport, { info: report }) : null,
                discovery ? h('div', { className: 'aw-section' }, h('h3', { className: 'aw-note' }, tt('discovered')), h('p', { className: 'aw-note' }, tt('importHint')),
                  discovery.sessions.length ? h('ul', { className: 'aw-found' }, discovery.sessions.map(found => h('li', { key: found.sessionId },
                    h('span', { className: 'aw-grow' }, h('span', { className: 'aw-ellipsis', style: { display: 'block' } }, found.title ?? found.sessionId),
                      h('span', { className: 'aw-item-sub aw-mono aw-ellipsis', style: { display: 'block' } }, [found.cwd, found.updatedAt ? stamp(found.updatedAt) : null].filter(Boolean).join(' · '))),
                    h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: async () => {
                      const value = await run({ action: 'import', providerId: saved.id, remoteId: found.sessionId, cwd: found.cwd ?? cwd.trim(), ...(found.title ? { title: found.title } : {}) })
                      if (value) onImported(value.id)
                    } }, tt('import'))))) : h('p', { className: 'aw-empty' }, tt('noDiscovered')),
                  discovery.nextCursor ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => discover(discovery.nextCursor) }, tt('more')) : null) : null,
                h('p', { className: 'aw-note' }, tt('loginHint'))) : null))
        }

        function recordKind(session) {
          if (!session.native) return 'standaloneTag'
          return session.native.sessionId === session.native.rootSessionId || !session.native.rootSessionId ? 'nativeTag' : 'childTag'
        }

        function RecordDetail({ session, events, view, run, busy, onBack, providers }) {
          const tt = useT()
          const [raw, setRaw] = React.useState(false)
          const [title, setTitle] = React.useState(session.title)
          const [historyError, setHistoryError] = React.useState('')
          const [paging, setPaging] = React.useState(false)
          const loadOlder = async () => {
            setPaging(true); setHistoryError('')
            try { await view.older() } catch (failure) { if (failure.name !== 'AbortError') setHistoryError(failure.message) } finally { setPaging(false) }
          }
          React.useEffect(() => setTitle(session.title), [session.id, session.title])
          const connected = CONNECTED.has(session.state)
          const provider = providers.find(item => item.id === session.providerId)
          const entries = configEntries(session, tt).filter(entry => !session.native || entry.category !== 'model')
          const activity = session.activity
          return h('div', { className: 'aw-stack' },
            h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'ghost', onClick: onBack }, `← ${tt('back')}`), h('span', { className: 'aw-grow' }), h(OpenConversation, { session })),
            activity?.group === 'attention' ? h('p', { className: 'aw-note' }, tt('attentionHint')) : null,
            session.interactions?.map(item => h(InteractionCard, { key: item.id, item, sessionId: session.id, cwd: session.cwd, run, disabled: busy, inline: true })),
            h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' },
                h('h2', null, session.title),
                h('span', { className: 'aw-grow' }),
                h(Status, { state: session.state })),
              h('form', { className: 'aw-row', onSubmit: event => { event.preventDefault(); if (title.trim() && title !== session.title) void run({ action: 'rename', sessionId: session.id, title }) } },
                h(Input, { className: 'aw-grow', value: title, 'aria-label': tt('rename'), onChange: event => setTitle(event.target.value) }),
                h(Button, { type: 'submit', size: 'sm', variant: 'ghost', disabled: busy || !title.trim() || title === session.title }, tt('rename'))),
              h('div', { className: 'aw-tags' }, h(Tag, { tone: 'outline' }, provider?.label ?? session.providerId), h(Tag, { tone: 'quiet' }, tt(recordKind(session))),
                session.native?.retired ? h(Tag, { tone: 'quiet' }, tt('retiredTag')) : null, session.archived ? h(Tag, { tone: 'quiet' }, tt('archivedTag')) : null),
              h('dl', { className: 'aw-facts' },
                h('dt', null, tt('directory')), h('dd', null, h(PathLabel, { path: session.cwd })),
                session.remoteId ? h(React.Fragment, null, h('dt', null, tt('remoteId')), h('dd', { className: 'aw-mono' }, session.remoteId)) : null,
                session.native ? h(React.Fragment, null, h('dt', null, tt('dshSession')), h('dd', { className: 'aw-mono' }, session.native.sessionId)) : null,
                h('dt', null, tt('updated')), h('dd', null, stamp(session.updatedAt))),
              activity?.group === 'review' ? h('p', { className: 'aw-note' }, tt('recoveryHint')) : null,
              activity?.issue ? h('p', { className: 'aw-error' }, activity.issue) : null,
              session.native ? h('p', { className: 'aw-note' }, tt('nativeReadOnly'), ' ', tt('modelPickerHint')) : null,
              h('div', { className: 'aw-row' },
                connected ? h(Button, { size: 'sm', variant: 'outline', disabled: busy || !!activity?.stopId, onClick: () => run({ action: 'disconnect', sessionId: session.id, unlessRunning: true }) }, tt('disconnect'))
                  : h(Button, { size: 'sm', variant: 'outline', disabled: busy || session.archived || !!session.native?.retired || !provider, onClick: () => run(session.native ? { action: 'native-connect', dshSessionId: session.native.sessionId, externalId: session.id } : { action: 'connect', sessionId: session.id }) }, tt(session.remoteId ? 'reconnect' : 'connect')),
                activity?.stopId ? h(Button, { size: 'sm', variant: 'ghost', icon: h(IconStopFillRegular, { size: 14 }), disabled: busy || session.state === 'canceling', onClick: () => run(stopOperation(session)) }, tt('stopTurn')) : null,
                session.native && !session.native.retired ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy || BUSY.has(session.state), onClick: () => { if (window.confirm(tt('newContextConfirm'))) void run({ action: 'native-reset', externalId: session.id }) } }, tt('newContext')) : null,
                session.archived
                  ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => run({ action: 'restore', sessionId: session.id }) }, tt('unarchive'))
                  : h(Button, { size: 'sm', variant: 'ghost', disabled: busy || connected, title: tt('archiveHint'), onClick: () => run({ action: 'archive', sessionId: session.id }) }, tt('archive')))),
            entries.length || session.usage ? h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' }, h('h2', null, tt('configuration'))),
              entries.length ? h('div', { className: 'aw-config' }, entries.map(entry => h(ConfigControl, { key: entry.id, entry, disabled: busy || session.state !== 'idle',
                onChange: values => run({ action: 'configure', sessionId: session.id, ...values }) }))) : null,
              h('p', { className: 'aw-note' }, usageText(session.usage) ?? '')) : null,
            session.native && !session.native.retired && session.commands?.length ? h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' }, h('h2', null, tt('commands'))),
              h(CommandForm, { session, disabled: busy || session.state !== 'idle',
                onRun: async (command, args) => !!(await run({ action: 'native-command', dshSessionId: session.native.sessionId, externalId: session.id, commandStamp: session.commandStamp, command, arguments: args })) })) : null,
            h('section', { className: 'aw-box' },
              h('div', { className: 'aw-box-head' }, h('h2', null, tt(raw ? 'viewRaw' : 'viewTimeline')), h('span', { className: 'aw-grow' }),
                events[0]?.seq > 1 ? h(Button, { size: 'sm', variant: 'ghost', disabled: paging, onClick: loadOlder }, tt('older')) : null,
                h(Button, { size: 'sm', variant: 'ghost', 'aria-pressed': raw, onClick: () => setRaw(!raw) }, tt(raw ? 'viewTimeline' : 'viewRaw'))),
              historyError ? h('p', { className: 'aw-error', role: 'alert' }, historyError) : null,
              h(TraceList, { key: session.id, recordId: session.id, remoteId: session.remoteId, events, raw, cwd: session.cwd, interactions: session.interactions, live: BUSY.has(session.state), activeTurnId: session.activity?.stopId, conversation: false })))
        }

        const GROUPS = ['attention', 'working', 'review', 'recent', 'history']
        function ActivityInbox({ view, run, busy, selected, onSelect, providers, onSetup }) {
          const tt = useT()
          const [query, setQuery] = React.useState('')
          const [filter, setFilter] = React.useState('all')
          const [limit, setLimit] = React.useState(40)
          const byProvider = React.useMemo(() => new Map(providers.map(p => [p.id, p.label])), [providers])
          const groups = React.useMemo(() => {
            const result = Object.fromEntries(GROUPS.map(key => [key, []]))
            const needle = query.trim().toLowerCase()
            for (const s of view.data.sessions) {
              if (!needle || [s.title, s.providerId, byProvider.get(s.providerId), s.cwd, s.native?.sessionId, s.remoteId, s.id].some(v => v?.toLowerCase().includes(needle))) result[s.activity.group].push(s)
            }
            return result
          }, [view.data.sessions, byProvider, query])
          if (selected && view.detail) return h(RecordDetail, { key: selected, session: view.detail, events: view.events, view, run, busy, providers, onBack: () => onSelect(null) })
          if (selected) return h('div', { className: 'aw-stack' }, h(Button, { variant: 'ghost', size: 'sm', onClick: () => onSelect(null) }, tt('back')), view.error ? null : h('p', { className: 'aw-empty', role: 'status' }, tt('loading')))
          if (!view.data.sessions.length) return h('section', { className: 'aw-box' }, h('h2', null, tt('noRecords')), h('p', { className: 'aw-note' }, tt('firstUse')), h('div', { className: 'aw-row' }, h(Button, { size: 'sm', onClick: onSetup }, tt('setup'))))
          const keys = filter === 'all' ? GROUPS.filter(key => key !== 'history') : [filter]
          const count = keys.reduce((n, key) => n + groups[key].length, 0)
          let remaining = limit
          return h('div', { className: 'aw-stack' },
            h('div', { className: 'aw-filter' }, h(Input, { type: 'search', className: 'aw-input', value: query, placeholder: tt('search'), 'aria-label': tt('search'), onChange: event => { setQuery(event.target.value); setLimit(40) } })),
            h('div', { className: 'aw-row', role: 'group', 'aria-label': tt('tabRecords') }, ['all', 'attention', 'working', 'review', 'history'].map(key => h(Button, { key, size: 'sm', variant: key === filter ? 'outline' : 'ghost', 'aria-pressed': key === filter, onClick: () => { setFilter(key); setLimit(40) } }, key === 'all' ? tt(key) : tt(key) + ' · ' + groups[key].length))),
            !count ? h('p', { className: 'aw-empty' }, tt('noMatch')) : null,
            keys.map(key => {
              const list = groups[key].slice(0, remaining)
              remaining -= list.length
              if (!list.length) return null
              return h('section', { className: 'aw-box', key },
                h('div', { className: 'aw-box-head' }, h('h2', null, tt(key)), h('span', { className: 'aw-muted' }, groups[key].length)),
                key === 'attention' || key === 'review' ? h('p', { className: 'aw-note' }, tt(key === 'attention' ? 'attentionHint' : 'recoveryHint')) : null,
                list.map(s => h('div', { key: s.id, className: 'aw-inbox-row' },
                  h('button', { type: 'button', className: 'aw-item', onClick: () => onSelect(s.id) },
                    h('span', { className: 'aw-item-top' }, h(StateDot, { state: key === 'review' ? 'warning' : DOT[s.state] ?? 'idle', size: 8 }), h('span', { className: 'aw-strong aw-ellipsis aw-grow' }, s.title), h(Tag, { tone: 'quiet' }, tt(recordKind(s)))),
                    h('span', { className: 'aw-item-sub aw-ellipsis' }, [byProvider.get(s.providerId) ?? s.providerId, s.cwd, stamp(s.updatedAt)].join(' · ')),
                    h('span', { className: 'aw-item-sub aw-ellipsis' }, s.activity.pending ? tt('requestCount', { n: s.activity.pending }) + ' · ' + tt(s.activity.request === 'plan' ? 'kind.plan' : s.activity.request) : s.activity.issue || (s.native?.retired ? tt('retiredTag') : s.archived ? tt('archivedTag') : activityLabel(s)))),
                  h(OpenConversation, { session: s }))))
            }),
            count > limit ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setLimit(n => n + 40) }, tt('more')) : null)
        }

        const useList = source => React.useSyncExternalStore(fn => source.subscribe(fn), () => source.getSnapshot())
        async function scheduleValue(call, tt) {
          let result
          try { result = await call() } catch { throw new Error(tt('schUnknown')) }
          if (!result?.ok) throw new Error(result?.error?.message || tt('schUnknown'))
          if (result.value?.code) throw new Error(tt(result.value.code === 'schedule_execution_pending' ? 'schBusy' : 'schMissing'))
          return result.value
        }

        function ScheduleHistory({ id, available }) {
          const tt = useT(), [pages, setPages] = React.useState([]), [cursor, setCursor] = React.useState(null), [error, setError] = React.useState('')
          React.useEffect(() => {
            let current = true
            scheduleValue(() => ctx.remote.schedule.history({ id, limit: 8, ...(cursor ? { before: cursor } : {}) }), tt).then(page => {
              if (current) { setPages(old => cursor ? [...old, page] : [page]); setError('') }
            }, e => { if (current) setError(e.message) })
            return () => { current = false }
          }, [id, cursor])
          const last = pages.at(-1)
          return h('div', { className: 'aw-detail' }, error ? h('p', { className: 'aw-error', role: 'alert' }, error) : null,
            !pages.length && !error ? h('p', { className: 'aw-note' }, tt('loading')) : null,
            last && !pages[0].records.length ? h('p', { className: 'aw-note' }, tt('schNoHistory')) : null,
            pages.flatMap(p => p.records).map(r => h('div', { key: r.messageId, className: 'aw-section' }, h('div', { className: 'aw-row' }, h('time', null, stamp(r.deliveredAt)),
              available.has(r.targetSessionId) ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => ctx.uiWorkspace.openSession(r.targetSessionId) }, tt('openConversation')) : null),
              r.prompt ? h('div', { className: 'aw-text' }, r.prompt) : null)),
            last?.nextBefore ? h(Button, { size: 'sm', variant: 'ghost', disabled: last.nextBefore === cursor, onClick: () => setCursor(last.nextBefore) }, tt('schMore')) : null,
            last?.earlierRecordsUnavailable || last?.earlierRecordsPruned ? h('p', { className: 'aw-note' }, tt('schPruned')) : null)
        }

        function ProjectSchedules({ project, catalog, hidden, access }) {
          const tt = useT(), remote = React.useMemo(() => ctx.get('remote'), [])
          const roots = project.sessionIds.filter(id => !hidden.has(id) && catalog.byId[id] && catalog.byId[id].origin !== 'subagent' && !catalog.byId[id].parentId)
            .map(id => ({ id, name: catalog.byId[id].title || catalog.byId[id].displayTitle || id }))
          const available = new Set(roots.map(r => r.id))
          const [draft, setDraft] = React.useState(() => ({ title: '', prompt: '', target: roots.length ? 'session' : 'new_once', sessionId: roots[0]?.id ?? '', preset: '',
            cadence: 'after', minutes: '15', time: '09:00', expr: '0 9 * * 1-5', zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }))
          const [tasks, setTasks] = React.useState(null), [presets, setPresets] = React.useState([]), [version, refresh] = React.useReducer(x => x + 1, 0)
          const [form, showForm] = React.useState(false), [busy, setBusy] = React.useState(false), [error, setError] = React.useState(''), [readError, setReadError] = React.useState(''), [history, setHistory] = React.useState(null)
          const lock = React.useRef(false)
          React.useEffect(() => {
            const changed = () => refresh(), dispose = remote.$on('schedule/changed', changed), reset = ctx.on('connection/reset', changed)
            return () => { dispose(); reset() }
          }, [remote])
          React.useEffect(() => {
            let current = true
            scheduleValue(() => remote.schedule.catalog(), tt).then(items => { if (current) { setTasks(items); setReadError('') } }, e => { if (current) setReadError(e.message) })
            return () => { current = false }
          }, [version, remote])
          React.useEffect(() => {
            if (!access.preset || !form) return
            let current = true
            scheduleValue(() => remote.agentPresets.list(), tt).then(v => { if (current) setPresets(v.presets) }, () => { if (current) setPresets([]) })
            return () => { current = false }
          }, [form, access.preset, remote])
          const field = (k, v) => setDraft(d => ({ ...d, [k]: v }))
          const request = scheduleRequest(project, draft, roots, presets)
          const operate = async (kind, task) => {
            if (lock.current) return
            const message = kind === 'create' ? 'schConfirm' : kind === 'run' ? 'schRunConfirm' : kind === 'delete' ? 'schDeleteConfirm' : null
            if (kind === 'create' && !request) { setError(tt('schIncomplete')); return }
            if (message && !window.confirm(tt(message) + '\n\n' + (task?.title ?? draft.title) + '\n' + (task?.prompt ?? draft.prompt))) return
            lock.current = true; setBusy(true); setError('')
            try {
              if (kind === 'create') { await scheduleValue(() => remote.schedule.create(request), tt); showForm(false); setDraft(d => ({ ...d, title: '', prompt: '' })) }
              else if (kind === 'run') await scheduleValue(() => remote.schedule.run({ id: task.id }), tt)
              else await scheduleValue(() => remote.schedule.edit(kind === 'delete' ? { id: task.id, action: 'delete', expectedUpdatedAt: task.updatedAt ?? null }
                : { id: task.id, action: 'update', patch: { active: kind === 'resume' }, expectedUpdatedAt: task.updatedAt ?? null }), tt)
            } catch (e) { setError(e.message) } finally { lock.current = false; setBusy(false); refresh() }
          }
          const choice = (k, label, options) => h('label', { className: 'aw-field' }, h('span', null, tt(label)), h('select', { className: 'aw-select', value: draft[k], disabled: busy, onChange: e => field(k, e.target.value) }, options.map(([id, name]) => h('option', { key: id, value: id }, name))))
          const input = (k, label, type = 'text') => h('label', { className: 'aw-field' }, h('span', null, tt(label)), h(Input, { type, className: 'aw-input', required: true, value: draft[k], disabled: busy, onChange: e => field(k, e.target.value) }))
          const visible = tasks && schedulesInProject(project, tasks)
          const floor = visible?.reduce((next, task) => { const at = Date.parse(task.deliveryFloorEndsAt); return at > Date.now() ? Math.min(at, next) : next }, Infinity)
          React.useEffect(() => {
            if (!Number.isFinite(floor)) return
            const timer = setTimeout(refresh, Math.max(0, Math.min(2147483647, floor - Date.now() + 100))); return () => clearTimeout(timer)
          }, [floor])
          const titles = { active: 'schActive', paused: 'schPaused', ended: 'schEnded' }
          const dest = { session: 'schExisting', new_once: 'schOnce', new: 'schFresh' }, canTab = ctx.get('sidebarRightTabs')?.get('scheduleTask') && ctx.get('sidebarRight')
          return h('section', { className: 'aw-box' }, h('div', { className: 'aw-row' }, h('h2', { className: 'aw-grow' }, tt('schedules')), h(Button, { size: 'sm', variant: 'ghost', onClick: refresh }, tt('schRefresh')),
            access.create ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, 'aria-expanded': form, onClick: () => showForm(!form) }, tt('schNew')) : null),
            h('p', { className: 'aw-note' }, tt('schDescription')),
            form && access.create ? h('form', { className: 'aw-section', onSubmit: e => { e.preventDefault(); void operate('create') } }, h('div', { className: 'aw-form' }, input('title', 'schName'),
              choice('target', 'schTarget', Object.entries(dest).filter(([k]) => k !== 'session' || roots.length).map(([k, v]) => [k, tt(v)])),
              draft.target === 'session' ? choice('sessionId', 'schChoose', roots.map(r => [r.id, r.name])) : choice('preset', 'schPreset', [['', tt('schDefault')], ...presets.filter(p => !p.broken).map(p => [p.id, p.name || p.id])]),
              choice('cadence', 'schTiming', [['after','schAfter'],['every','schEvery'],['daily','schDaily'],['cron','schCron']].map(([k,v]) => [k, tt(v)])),
              ['after','every'].includes(draft.cadence) ? input('minutes', 'schMinutes', 'number') : h(React.Fragment, null, draft.cadence === 'daily' ? input('time', 'schTime', 'time') : input('expr', 'schExpr'), input('zone', 'schZone')),
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('schPrompt')), h('textarea', { className: 'aw-textarea', rows: 3, required: true, disabled: busy, value: draft.prompt, onChange: e => field('prompt', e.target.value) }))),
              h('p', { className: 'aw-note' }, tt('schRouteHint')), h(Button, { size: 'sm', type: 'submit', variant: 'primary', disabled: busy || !request }, tt('schNew'))) : null,
            readError || error ? h('p', { role: 'alert', className: 'aw-error' }, error || readError) : null,
            !readError && !visible?.length ? h('p', { className: 'aw-note' }, tt(tasks ? 'schEmpty' : 'loading')) : null,
            visible?.map(task => {
              const anchor = task.target.kind === 'session' && available.has(task.target.sessionId) ? task.target.sessionId : roots[0]?.id
              const cadence = { after: task.afterSeconds + ' s', at: stamp(task.scheduledAt), every: tt('schEvery') + ' · ' + task.everySeconds / 60 + ' min',
                daily: task.time + ' · ' + task.timeZone, weekly: task.weekdays?.join(', ') + ' · ' + task.time + ' · ' + task.timeZone,
                cron: task.expression + ' · ' + task.timeZone, rrule: task.rrule }[task.kind]
              const cooling = Date.parse(task.deliveryFloorEndsAt) > Date.now()
              const last = task.lastDelivery, sessionName = task.target.kind === 'session' ? catalog.byId[task.target.sessionId]?.title : null
              const button = (key, fn, disabled) => h(Button, { size: 'sm', variant: 'ghost', disabled: busy || disabled, onClick: fn }, tt(key))
              return h('article', { key: task.id, className: 'aw-card aw-section' }, h('div', { className: 'aw-row' }, h(StateDot, { size: 8, state: task.executionActive ? 'ongoing' : 'idle' }), h('strong', { className: 'aw-grow' }, task.title), h('span', { className: 'aw-note' }, tt(titles[task.status]))),
                h('div', { className: 'aw-note' }, sessionName || tt(dest[task.target.kind]), task.status === 'active' ? ' · ' + tt('schNext') + ' ' + stamp(task.scheduledAt) : ''),
                h('div', { className: 'aw-note' }, tt('schCadence'), ': ', cadence),
                cooling ? h('div', { className: 'aw-note' }, tt('schFloor'), ' ', stamp(task.deliveryFloorEndsAt)) : null,
                h('div', { className: 'aw-text' }, task.prompt), last ? h('div', { className: 'aw-note' }, tt('schDelivered'), ' ', stamp(last.deliveredAt), task.executionActive ? ' · ' + tt('schQueued') : '') : null,
                h('div', { className: 'aw-row' }, access.run ? button('schRun', () => operate('run', task), !!task.executionActive || cooling) : null,
                  access.edit && task.status !== 'ended' ? button(task.status === 'active' ? 'schPause' : 'schResume', () => operate(task.status === 'active' ? 'pause' : 'resume', task)) : null,
                  access.history ? button('schHistory', () => setHistory(history === task.id ? null : task.id)) : null,
                  canTab && anchor ? button('schManage', () => { ctx.uiWorkspace.openSession(anchor); canTab.openTabIn(anchor, 'scheduleTask', { params: { sessionId: anchor, id: task.id } }) }) : null,
                  access.edit ? button('schDelete', () => operate('delete', task)) : null),
                access.history && history === task.id ? h(ScheduleHistory, { key: task.id + ':' + version, id: task.id, available }) : null)
            }))
        }

        function ProjectScripts({ sessionId, targetFor, useSessionAccess }) {
          const tt = useT()
          const [data, setData] = React.useState(null), [error, setError] = React.useState(''), [busy, setBusy] = React.useState(false)
          const [version, refresh] = React.useReducer(v => v + 1, 0), [log, setLog] = React.useState(null)
          const lock = React.useRef(false)
          React.useEffect(() => {
            const controller = new AbortController(); let timer
            const read = async () => {
              try {
                const result = await api({ action: 'script-list', dshSessionId: sessionId }, controller.signal)
                if (controller.signal.aborted) return
                setData(result)
                if (result.runs.some(r => r.state === 'running' || r.state === 'starting')) timer = setTimeout(read, 2000)
              } catch (e) { if (!controller.signal.aborted) setError(e.message) }
            }
            void read(); return () => { controller.abort(); clearTimeout(timer) }
          }, [sessionId, version])
          const act = async (action, entry, assignPort) => {
            if (lock.current) return
            if (action === 'script-start' && !window.confirm([tt(assignPort ? 'confirmPort' : 'scriptConfirm'), data.cwd, entry.command].join('\n\n'))) return
            if (action === 'script-stop' && !window.confirm(tt('stopScriptConfirm'))) return
            lock.current = true; setBusy(true); setError(''); setLog(null)
            try {
              const result = await api({ action, dshSessionId: sessionId, name: entry.name, terminalId: entry.terminalId, revision: entry.revision, ...(assignPort ? { assignPort: true } : {}) })
              if (action === 'script-log') setLog({ name: entry.name, text: result.text })
            } catch (e) { setError(e.message) } finally { lock.current = false; setBusy(false); refresh() }
          }
          return h(ProjectScriptsView, { sessionId, targetFor, useSessionAccess, data, error, busy, log, act, reload: () => { setError(''); refresh() } })
        }

        // Only an opened monitor samples the assigned port. Listing scripts and terminal status stays passive.
        function ServiceReadiness({ sessionId, run }) {
          const tt = useT(), [sample, show] = React.useState(null)
          const { terminalId, servicePort, startedAt, name } = run
          React.useEffect(() => {
            const abort = new AbortController(); let timer, failures = 0, last = 0
            const poll = async () => {
              try {
                const value = await api({ action: 'script-health', dshSessionId: sessionId, name, terminalId }, abort.signal)
                if (abort.signal.aborted) return
                if (value.terminalId !== terminalId || value.port !== servicePort || !Number.isFinite(value.checkedAt) || !['accepting','refused','timeout'].includes(value.state)) throw new Error(tt('portFailed'))
                if (last !== value.checkedAt) { failures = value.state === 'accepting' ? 0 : failures + 1; last = value.checkedAt }
                show({ label: !failures ? 'portAccepts' : failures < 2 ? 'portCheckAgain' : value.state === 'refused' ? 'portRefused' : 'portTimeout', at: last })
                timer = setTimeout(poll, 3000)
              } catch (e) { if (!abort.signal.aborted) show({ label: 'portFailed', error: e.message }) }
            }
            timer = setTimeout(poll, Math.max(0, Math.min(5000, startedAt + 5000 - Date.now())))
            return () => { clearTimeout(timer); abort.abort() }
          }, [sessionId, terminalId, servicePort, startedAt, name])
          return h('div', { className: 'aw-section' }, h('div', { className: 'aw-row', role: 'status' }, h(Tag, { tone: sample?.label === 'portAccepts' ? 'success' : !sample || sample.label === 'portCheckAgain' ? 'quiet' : 'warning' }, tt(sample?.label ?? 'portPending')), sample?.at ? h('time', { className: 'aw-note' }, clock(sample.at)) : null),
            h('p', { className: 'aw-note' }, tt('portHint')), sample?.error ? h('p', { className: 'aw-error' }, sample.error) : null)
        }
        function ProjectScriptsView({ sessionId, targetFor, useSessionAccess, data, error, busy, log, act, reload }) {
          const tt = useT(), toolLabels = useToolLabels(), [watching, watch] = React.useState(null)
          const defs = new Map(data?.definitions.map(s => [s.name, s])), runs = new Map(data?.runs.map(s => [s.name, s]))
          const names = [...new Set([...defs.keys(), ...runs.keys()])], labels = { running: 'scriptRunning', starting: 'scriptStarting', failed: 'scriptFailed', exited: 'scriptExited', stopped: 'scriptStopped', unavailable: 'scriptUnavailable' }
          return h('section', { className: 'aw-box', 'aria-label': tt('scripts') }, h('div', { className: 'aw-row' }, h('h2', { className: 'aw-grow' }, tt('scripts')), h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: reload }, tt('scriptRefresh'))),
            h('p', { className: 'aw-note' }, tt('scriptsHint')), data ? h(PathLabel, { path: data.cwd }) : null,
            error || data?.configError ? h('p', { role: 'alert', className: 'aw-error' }, error || data.configError) : null,
            !names.length && !error && !data?.configError ? h('p', { className: 'aw-note' }, tt(data ? 'scriptNone' : 'scriptLoading')) : null,
            names.map(name => {
              const def = defs.get(name), run = runs.get(name), live = run?.state === 'running' || run?.state === 'starting', own = run?.sessionId === sessionId
              return h('article', { key: name, className: 'aw-card aw-section' }, h('div', { className: 'aw-row' }, h('strong', { className: 'aw-grow' }, name), h('span', { className: 'aw-note' }, tt((def ?? run).type === 'service' ? 'scriptService' : 'scriptTask'))),
                def ? h('pre', { className: 'aw-log aw-command' }, def.command) : null,
                run ? h('div', { className: 'aw-note' }, tt(labels[run.state] ?? 'scriptUnavailable'), run.exitCode != null ? ' · ' + tt('scriptExit') + ' ' + run.exitCode : '', run.takenOver ? ' · ' + tt('scriptOwner') : '') : null,
                run?.servicePort ? h('div', { className: 'aw-row' }, h('code', null, `127.0.0.1:${run.servicePort}`),
                  run.state === 'running' && own && !run.takenOver ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': watching === run.terminalId, onClick: () => watch(watching === run.terminalId ? null : run.terminalId) }, tt(watching === run.terminalId ? 'unwatchPort' : 'watchPort')) : null) : null,
                run?.state === 'running' && own && !run.takenOver && run.servicePort && watching === run.terminalId ? h(ServiceReadiness, { key: run.terminalId, sessionId, run }) : null,
                h('div', { className: 'aw-row' }, def && !live ? h(Button, { size: 'sm', disabled: busy, onClick: () => act('script-start', def) }, tt('scriptStart')) : null,
                  def?.autoPort && !live ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => act('script-start', def, true) }, tt('startWithPort')) : null,
                  live && own && !run.takenOver ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => act('script-stop', run) }, tt('scriptStop')) : null,
                  own ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => act('script-log', run) }, tt('scriptLog')) : null,
                  run?.retained ? h(OpenTerminalButton, { sessionId: run.sessionId, terminalId: run.terminalId, target: targetFor(run.sessionId), useSessionAccess }) : null,
                  run && !own && !run.retained ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => ctx.uiWorkspace.openSession(run.sessionId) }, tt('runHere')) : null),
                log?.name === name && run ? h('div', { className: 'aw-output' }, run.command && (live || run.exitCode != null) ? h(TerminalBlock, {
                  labels: toolLabels, command: run.command, cwd: run.cwd, output: log.text, running: live, exitCode: run.exitCode ?? undefined, maxLines: 12,
                }) : h('pre', { className: 'aw-log' }, log.text || tt('noOutput'))) : null)
            }))
        }

        function patchRows(file) {
          const rows = []
          for (const hunk of file.hunks) {
            let old = hunk.oldStart, next = hunk.newStart
            rows.push({ header: true, text: `@@ -${old},${hunk.oldLines} +${next},${hunk.newLines} @@` })
            for (const text of hunk.lines) {
              const sign = text[0]
              rows.push({ text, old: sign === ' ' || sign === '-' ? old++ : null, next: sign === ' ' || sign === '+' ? next++ : null })
            }
          }
          return rows
        }
        const reviewResult = result => { if (!result.ok) throw new Error(result.error?.message ?? t('checkoutUnavailable')); return result.value }
        const pageLines = 16
        function checkoutPath(root, path) {
          if (!root || !path || path.includes('\\') || /\p{Cc}/u.test(path) || /^[A-Za-z]:/u.test(path) || path.split('/').some(part => !part || part === '..' || part === '.')) return null
          return root.replace(/\\/g, '/').replace(/\/+$/, '') + '/' + path
        }
        function fileAddress(sessionId, absolute) {
          // DSH file/session addresses accept absolute paths. Do not strip the effective cwd: the preview resolves relative paths against header.cwd.
          return 'dsh-resource://file/session/' + encodeURIComponent(sessionId) + '/' + absolute.split('/').map(part => encodeURIComponent(part).replace(/%3A/giu, ':')).join('/')
        }
        function verifyWindow(patch, offset, lines, eof) {
          for (const row of patch) if (row.next >= offset && (eof || row.next < offset + lines.length)) {
            if (lines[row.next - offset]?.replace(/\r$/u, '') !== row.text.slice(1).replace(/\r$/u, '')) throw new Error(t('reviewStale'))
          }
        }
        function FilePreview({ sessionId, target, scope, file, absolute, patch = EMPTY, selection, close, closeLabel }) {
          const tt = useT(), labels = useToolLabels(), index = scope?.kind === 'staged', recorded = !scope
          const found = scope?.kind === 'file-search', commit = scope?.commits?.to, snapshot = index || !!commit, stale = recorded || found ? 'fileChanged' : 'reviewStale'
          const heading = commit ? tt('commitVersion', { sha: commit.slice(0, 8) }) : tt(recorded ? 'recordedFile' : index ? 'reviewIndex' : 'reviewDisk')
          const [offset, setOffset] = React.useState(selection), [data, setData] = React.useState(null), [error, setError] = React.useState(''), [busy, setBusy] = React.useState(false)
          const generation = React.useRef(null), inspected = React.useRef(null), preview = React.useRef(null)
          React.useEffect(() => { preview.current?.focus() }, [])
          const side = ctx.get('sidebarRight') && ctx.get('sidebarRightTabs')?.get('text')
          React.useEffect(() => {
            const abort = new AbortController(); generation.current = abort; setError(''); setData(null); setBusy(false)
            void (async () => {
              let lines, eof, disk, noText = file.binary || file.oversized
              if (snapshot) {
                if (!inspected.current) {
                  const text = reviewResult(await ctx.remote.forgePanel.localText(sessionId, scope, file.path, abort.signal))
                  const all = text.split('\n'); if (all.at(-1) === '') all.pop()
                  verifyWindow(patch, 1, all, true); if (abort.signal.aborted) return; inspected.current = all
                }
                lines = inspected.current.slice(offset - 1, offset - 1 + pageLines); eof = offset - 1 + lines.length >= inspected.current.length
              } else {
                const files = ctx.remote.workspaceFiles, stat = reviewResult(await files.stat(sessionId, absolute, abort.signal))
                disk = { path: stat.absolutePath.replace(/\\/g, '/'), version: stat.version }
                if (!recorded && disk.path !== absolute) throw new Error(tt('reviewPath'))
                if (inspected.current && (inspected.current.path !== disk.path || inspected.current.version !== disk.version)) throw new Error(tt(stale))
                if (!noText) {
                  const reply = await files.read(sessionId, disk.path, { offset, limit: pageLines }, abort.signal)
                  if ((recorded || found) && !reply.ok && reply.error?.code === 'workspace-file/not-text') noText = true
                  else {
                    const page = reviewResult(reply)
                    if (page.absolutePath.replace(/\\/g, '/') !== disk.path || page.version !== disk.version) throw new Error(tt(stale))
                    lines = page.lines ? page.text.split('\n') : []; eof = page.eof; verifyWindow(patch, offset, lines, eof)
                  }
                }
                if (noText) { lines = []; eof = true }
                if (abort.signal.aborted) return
                inspected.current = disk
              }
              if (!abort.signal.aborted) setData({ lines, eof, offset, disk, noText })
            })().catch(e => { if (!abort.signal.aborted) setError(e.message) })
            return () => abort.abort()
          }, [absolute, file, snapshot, offset, patch, scope, sessionId])
          const openInSidebar = async () => {
            const abort = generation.current; if (!data || abort?.signal.aborted) return
            setBusy(true); setError('')
            try {
              const stat = reviewResult(await ctx.remote.workspaceFiles.stat(sessionId, absolute, abort.signal))
              if (abort.signal.aborted) return
              if (stat.version !== data.disk.version || stat.absolutePath.replace(/\\/g, '/') !== data.disk.path) throw new Error(tt(stale))
              openReviewResource(sessionId, target, fileAddress(sessionId, data.disk.path), data.lines.length ? data.offset : null)
            } catch (e) { if (!abort.signal.aborted) setError(e.message) } finally { if (!abort.signal.aborted) setBusy(false) }
          }
          const current = data?.offset === offset ? data : null
          return h('section', { ref: preview, tabIndex: -1, className: 'aw-review-preview aw-section', 'aria-label': heading },
            h('div', { className: 'aw-row' }, h(Tag, { tone: 'quiet', title: commit }, heading), h(PathLabel, { path: file.path }), h(Button, { variant: 'ghost', size: 'sm', onClick: close }, tt(closeLabel ?? (found ? 'fileHitsBack' : 'reviewBack')))),
            recorded ? h('p', { className: 'aw-note' }, tt('recordedLocation')) : null,
            error ? h('p', { className: 'aw-error', role: 'alert' }, error) : !current ? h('p', { className: 'aw-note' }, tt('loading')) : current.lines.length ? h(ReadBlock, { label: file.path + ':' + offset, labels, lines: current.lines.map((text, i) => ({ number: offset + i, text })), lang: file.path.match(/\.([a-z0-9]+)$/iu)?.[1], maxLines: pageLines }) : h('p', { className: 'aw-note' }, tt(current.noText ? 'reviewBinary' : recorded && (offset > 1 || file.line) ? 'lineGone' : 'reviewEmpty', { n: offset })),
            current && !error ? h('div', { className: 'aw-row' }, !current.lines.length && offset > 1 && !current.noText ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setOffset(1) }, tt('fileStart')) : offset > 1 && !current.noText ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setOffset(Math.max(1, offset - pageLines)) }, tt('reviewPrev')) : null,
              !current.eof ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setOffset(offset + pageLines) }, tt('reviewNext')) : null,
              !snapshot && side && (current.lines.length || !file.line || current.noText || offset !== file.line) ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: openInSidebar }, tt('reviewFull')) : null) : null)
        }
        const fullOid = sha => typeof sha === 'string' && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/u.test(sha)
        // Old-line navigation never reads the working file. The patch is already available even
        // when Forge cannot identify a complete old blob (e.g. an arbitrary branch merge base).
        function BeforePreview({ sessionId, file, patch, source, comparison, line, close }) {
          const tt = useT(), labels = useToolLabels(), path = file.previousPath || file.path
          const captured = React.useMemo(() => patch.filter(r => r.old > 0), [patch])
          const whole = file.status === 'deleted' && captured.length === file.deletions && captured.length > 0 && captured.every((r, i) => r.old === i + 1 && r.text.startsWith('-'))
          const [position, move] = React.useState(line ?? captured[0]?.old ?? 1), [asked, ask] = React.useState(false), [full, setFull] = React.useState(null), [error, setError] = React.useState('')
          const preview = React.useRef(null)
          React.useEffect(() => { preview.current?.focus() }, [])
          React.useEffect(() => {
            if (!asked || !source) return
            const abort = new AbortController(), signal = abort.signal
            void (async () => {
              const forge = ctx.remote.forgePanel
              let sha = source.sha
              if (source.kind === 'head') {
                const value = reviewResult(await forge.localCommits(sessionId, source.branch ? 'refs/heads/' + source.branch : null, signal))
                sha = value.headSha
                if (!fullOid(sha) || !sha.startsWith(source.head)) throw new Error(tt('commitHeadMoved'))
              }
              if (source.kind !== 'index' && !fullOid(sha)) throw new Error(tt('reviewStale'))
              // Forge localText reads the index or the named commit blob, using the old path for renames.
              const readScope = source.kind === 'index' ? { kind: 'staged' } : { kind: 'branch', base: null, commits: { from: sha, to: sha } }
              signal.throwIfAborted()
              const text = reviewResult(await forge.localText(sessionId, readScope, path, signal)), lines = text.split('\n')
              if (lines.at(-1) === '') lines.pop()
              if (captured.some(r => lines[r.old - 1]?.replace(/\r$/u, '') !== r.text.slice(1).replace(/\r$/u, ''))) throw new Error(tt('reviewStale'))
              if (source.kind !== 'commit') {
                signal.throwIfAborted()
                const check = reviewResult(await forge.localDiff(sessionId, comparison, signal))
                if (!check.files.some(f => f.path === file.path && f.digest === file.digest)) throw new Error(tt('reviewStale'))
              }
              if (!signal.aborted) setFull({ sha, lines })
            })().catch(e => { if (!signal.aborted) setError(e.message) })
            return () => abort.abort()
          }, [asked, source, sessionId, comparison, path, file, captured])
          const index = full ? position - 1 : Math.max(0, captured.findIndex(r => r.old >= position)), total = full?.lines.length ?? captured.length
          const page = full ? full.lines.slice(index, index + pageLines).map((text, i) => ({ number: i + index + 1, text })) : captured.slice(index, index + pageLines).map(r => ({ number: r.old, text: r.text.slice(1) }))
          const groups = []
          for (const row of page) {
            if (groups.at(-1)?.at(-1).number !== row.number - 1) groups.push([])
            groups.at(-1).push(row)
          }
          const at = i => full ? i + 1 : captured[i].old
          const heading = full ? full.sha ? tt('beforeCommit', { sha: full.sha.slice(0, 8) }) : tt('beforeIndex') : tt(whole ? 'beforeWhole' : 'beforePatch')
          return h('section', { ref: preview, tabIndex: -1, className: 'aw-review-preview aw-section', 'aria-label': heading },
            h('div', { className: 'aw-row' }, h(Tag, { tone: 'quiet', title: full?.sha }, heading), h(PathLabel, { path }), h(Button, { variant: 'ghost', size: 'sm', onClick: close }, tt('reviewBack'))),
            h('p', { className: 'aw-note' }, tt(full ? full.sha ? 'beforeSnapshot' : 'beforeIndexHint' : !source && !whole ? 'beforeLimited' : 'beforeHint')),
            page.length ? groups.map((group, i) => h(React.Fragment, { key: group[0].number }, i > 0 && h('p', { className: 'aw-note' }, tt('beforeGap', { from: groups[i - 1].at(-1).number + 1, to: group[0].number - 1 })),
              h(ReadBlock, { label: path + ':' + group[0].number, labels, lines: group, lang: path.match(/\.([a-z0-9]+)$/iu)?.[1], maxLines: pageLines }))) : h('p', { className: 'aw-note' }, tt(full ? 'reviewEmpty' : 'beforeNone')),
            error && h('p', { role: 'alert', className: 'aw-error' }, error), h('div', { className: 'aw-row' }, index > 0 && h(Button, { size: 'sm', variant: 'ghost', onClick: () => move(at(Math.max(0, index - pageLines))) }, tt('reviewPrev')),
              index + pageLines < total && h(Button, { size: 'sm', variant: 'ghost', onClick: () => move(at(index + pageLines)) }, tt('reviewNext')),
              source && !asked && h(Button, { size: 'sm', variant: 'outline', onClick: () => ask(true) }, tt('beforeFull')), asked && !full && !error && h('span', { className: 'aw-note' }, tt('loading'))))
        }
        function CheckoutFile({ file, root, sessionId, target, scope, before }) {
          const tt = useT(), labels = useToolLabels(), [open, setOpen] = React.useState(false), [lines, setLines] = React.useState(80), [selection, select] = React.useState(null), [copyPatch, setCopyPatch] = React.useState(false)
          const patch = React.useMemo(() => open ? patchRows(file) : EMPTY, [file, open]), absolute = checkoutPath(root, file.path)
          const opener = React.useRef(null), close = () => { select(null); opener.current?.focus() }
          const locate = (event, line, old = false) => { opener.current = event.currentTarget; select(previous => ({ line, old, request: (previous?.request ?? 0) + 1 })) }
          const canReadOld = file.status !== 'added' && !file.untracked && !file.binary && !file.oversized && !!checkoutPath(root, file.previousPath || file.path) && (before || patch.some(r => r.old > 0))
          const canRead = !!absolute && file.status !== 'deleted' && !((scope?.kind === 'staged' || scope?.commits) && (file.binary || file.oversized))
          return h('div', { className: 'aw-section' }, h('button', { className: 'aw-item', type: 'button', 'aria-expanded': open, onClick: () => setOpen(!open) },
            h('span', { className: 'aw-item-top' }, h('strong', { className: 'aw-grow aw-ellipsis' }, file.previousPath ? file.previousPath + ' → ' + file.path : file.path), h(Tag, { tone: 'quiet' }, '+' + file.additions + ' / −' + file.deletions))),
            open && h(React.Fragment, null, h('div', { className: 'aw-row' }, canRead ? h(Button, { size: 'sm', variant: 'outline', onClick: e => locate(e, 1) }, tt('reviewFile')) : null,
              canReadOld ? h(Button, { size: 'sm', variant: 'outline', onClick: e => locate(e, null, true) }, tt('beforeFile')) : null,
              file.status === 'deleted' ? h('span', { className: 'aw-note' }, tt('reviewDeleted')) : null,
              patch.length ? h(Button, { size: 'sm', variant: 'ghost', 'aria-pressed': copyPatch, onClick: () => setCopyPatch(!copyPatch) }, tt('reviewPatch')) : null),
              selection?.old && canReadOld ? h(BeforePreview, { key: selection.request, sessionId, file, patch, source: before, comparison: scope, line: selection.line, close }) : canRead && selection !== null && !selection.old ? h(FilePreview, { key: selection.request, sessionId, target, file, scope, absolute, patch, selection: selection.line, close }) : null,
              patch.length ? h(React.Fragment, null, copyPatch ? h(CodeBlock, { code: patch.slice(0, lines).map(row => row.text).join('\n'), lang: 'diff', copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels }) : h('div', { className: 'aw-review-patch' }, patch.slice(0, lines).map((row, i) => row.header ? h('div', { key: i, className: 'aw-patch-hunk' }, row.text) : h('div', { key: i, className: 'aw-patch-line', 'data-side': row.text[0] === '+' ? 'add' : row.text[0] === '-' ? 'del' : 'context' }, canReadOld && row.old > 0 ? h('button', { type: 'button', 'aria-label': tt('beforeAt', { path: file.previousPath || file.path, n: row.old }), onClick: e => locate(e, row.old, true) }, row.old) : h('span', null, row.old), canRead && row.next > 0 ? h('button', { type: 'button', 'aria-label': tt('reviewAt', { path: file.path, n: row.next }), onClick: e => locate(e, row.next) }, row.next) : h('span', null, row.next), h('code', null, row.text)))),
                patch.length > lines ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setLines(n => n + 120) }, tt('moreLines')) : null) : h('p', { className: 'aw-note' }, tt(file.binary ? 'binaryDiff' : file.oversized ? 'largeDiff' : 'noHunks'))))
        }

        function ReviewBase({ sessionId, base, select }) {
          const tt = useT(), [query, setQuery] = React.useState(''), [choices, setChoices] = React.useState(null), [error, setError] = React.useState('')
          React.useEffect(() => {
            const abort = new AbortController()
            const timer = setTimeout(async () => {
              try {
                const result = await ctx.remote.forgePanel.diffBases(sessionId, query, abort.signal)
                if (abort.signal.aborted) return
                if (!result.ok) throw new Error(result.error?.message || tt('checkoutUnavailable'))
                setChoices(result.value); setError('')
              } catch (e) { if (!abort.signal.aborted) setError(e.message) }
            }, query ? 180 : 0)
            return () => { clearTimeout(timer); abort.abort() }
          }, [sessionId, query])
          const refs = [...(choices?.local || []), ...(choices?.remote || [])]
          return h('div', { className: 'aw-row' }, h(Input, { className: 'aw-input', type: 'search', value: query, placeholder: tt('findBase'), 'aria-label': tt('findBase'), onChange: e => setQuery(e.target.value) }),
            h('label', { className: 'aw-field' }, tt('baseBranch'), h('select', { className: 'aw-select', value: base, onChange: e => select(e.target.value) },
              h('option', { value: '' }, tt('autoBase') + (choices?.automatic ? ': ' + choices.automatic.name : '')),
              base && !refs.some(r => r.ref === base) ? h('option', { value: base }, base) : null,
              refs.map(r => h('option', { key: r.ref, value: r.ref }, r.name)))),
            error ? h('p', { role: 'alert', className: 'aw-error' }, error) : null)
        }

        function ReviewCheckout({ sessionId, target }) {
          const tt = useT(), [location, setLocation] = React.useState(null), [retry, retryLocation] = React.useReducer(n => n + 1, 0)
          React.useEffect(() => {
            const abort = new AbortController(); let stream
            setLocation(null)
            void (async () => {
              stream = ctx.remote.forgePanel.follow(sessionId, abort.signal)
              for await (const frame of stream) {
                if (abort.signal.aborted) return
                const checkout = frame.checkout
                setLocation(checkout.state === 'ready' ? { sessionId, ...checkout.checkout, createdBase: frame.worktree?.created?.path === checkout.checkout.root ? frame.worktree.created.baseCommit : null } : checkout.state === 'pending' ? null : { error: checkout.message || tt('checkoutUnavailable') })
              }
              if (!abort.signal.aborted) setLocation({ error: tt('checkoutUnavailable') })
            })().catch(e => { if (!abort.signal.aborted) setLocation({ error: e.message }) })
            return () => { abort.abort(); stream?.dispose() }
          }, [sessionId, retry])
          if (location?.error) return h('div', { className: 'aw-section' }, h('p', { className: 'aw-error', role: 'alert' }, location.error), h(Button, { size: 'sm', onClick: retryLocation }, tt('refreshComparison')))
          return location?.sessionId === sessionId ? h(CheckoutComparison, { key: JSON.stringify([sessionId, location.root, location.branch]), sessionId, target, root: location.root, head: location.commit, branchName: location.branch, createdBase: location.createdBase }) : h('p', { className: 'aw-note' }, tt('loading'))
        }
        function CheckoutComparison({ sessionId, target, root, head, branchName, createdBase }) {
          const tt = useT(), [scope, setScope] = React.useState('uncommitted'), [base, setBase] = React.useState(''), [version, refresh] = React.useReducer(n => n + 1, 0)
          const commits = scope === 'commits', branch = scope === 'branch' || commits
          const before = React.useMemo(() => scope === 'unstaged' ? { kind: 'index' } : scope === 'branch' ? !base && fullOid(createdBase) ? { kind: 'commit', sha: createdBase } : null : head ? { kind: 'head', head, branch: branchName } : null, [scope, base, head, branchName, createdBase])
          const comparison = React.useMemo(() => branch ? { kind: 'branch', base: base || null, commits: null } : { kind: scope }, [scope, base])
          return h('div', { className: 'aw-detail' }, h('p', { className: 'aw-note' }, tt(commits ? 'commitHint' : 'checkoutHint')), h(PathLabel, { path: root }),
            h('div', { className: 'aw-row' }, h('label', null, tt('gitScope'), ' ', h('select', { className: 'aw-select', value: scope, onChange: e => setScope(e.target.value) },
              ['uncommitted','staged','unstaged','branch','commits'].map(k => h('option', { key: k, value: k }, tt(k === 'branch' ? 'branchDiff' : k === 'commits' ? 'commitScope' : k))))), h(Button, { size: 'sm', variant: 'ghost', onClick: refresh }, tt('refreshComparison'))),
            branch ? h(ReviewBase, { sessionId, base, select: setBase }) : null,
            commits ? h(CommitComparison, { key: base, sessionId, target, root, base, head, version }) : h(CheckoutDiff, { key: JSON.stringify([scope, base, head, version]), sessionId, target, root, comparison, before }))
        }
        // Forge lists parents before children. A consecutive list segment is a range only while
        // every following commit names its predecessor as first parent; a merge can break that chain.
        function commitEnds(commits, from) {
          const i = commits.findIndex(c => c.sha === from)
          if (i < 0) return EMPTY
          let end = i + 1
          while (end < commits.length && commits[end].parent === commits[end - 1].sha) end++
          return commits.slice(i, end)
        }
        function CommitComparison({ sessionId, target, root, base, head, version }) {
          const tt = useT(), [listing, setListing] = React.useState(null), [range, setRange] = React.useState(null)
          React.useEffect(() => {
            const abort = new AbortController()
            void (async () => {
              const value = reviewResult(await ctx.remote.forgePanel.localCommits(sessionId, base || null, abort.signal))
              if (head && !value.headSha.startsWith(head)) throw new Error(tt('commitHeadMoved'))
              if (!abort.signal.aborted) setListing({ head, version, value })
            })().catch(e => { if (!abort.signal.aborted) setListing({ head, version, error: e.message }) })
            return () => abort.abort()
          }, [sessionId, base, head, version])
          const comparison = React.useMemo(() => ({ kind: 'branch', base: base || null, commits: range }), [base, range])
          const parent = listing?.value?.commits.find(c => c.sha === range?.from)?.parent
          const before = React.useMemo(() => fullOid(parent) ? { kind: 'commit', sha: parent } : null, [parent])
          if (!listing || listing.version !== version || listing.head !== head) return h('p', { className: 'aw-note' }, tt('loading'))
          if (listing.error) return h('p', { className: 'aw-error', role: 'alert' }, listing.error)
          const { commits } = listing.value, ends = commitEnds(commits, range?.from), last = ends.findIndex(c => c.sha === range?.to), selected = ends[last]
          const option = c => h('option', { key: c.sha, value: c.sha }, `${c.sha.slice(0, 8)} · ${c.title}`)
          return h('div', { className: 'aw-section' }, range && !selected ? h('p', { className: 'aw-error', role: 'alert' }, tt('commitMissing')) : null,
            !commits.length ? h('p', { className: 'aw-note' }, tt('noBranchCommits')) : h('div', { className: 'aw-row' },
              h('label', { className: 'aw-field' }, tt('commitStart'), h('select', { className: 'aw-select', value: selected ? range.from : '', onChange: e => setRange(e.target.value ? { from: e.target.value, to: e.target.value } : null) }, h('option', { value: '' }, tt('chooseCommit')), commits.toReversed().map(option))),
              selected && ends.length > 1 ? h('label', { className: 'aw-field' }, tt('commitEnd'), h('select', { className: 'aw-select', value: range.to, onChange: e => setRange({ from: range.from, to: e.target.value }) }, h('option', { value: range.from }, tt('commitOnly')), ends.slice(1).map(option))) : null),
            listing.value.truncated ? h('p', { className: 'aw-note' }, tt('commitTruncated', { n: commits.length })) : null,
            selected ? h('div', { className: 'aw-row' }, h(Tag, { tone: 'quiet' }, last ? tt('rangeSize', { n: last + 1 }) : selected.sha.slice(0, 8)), h('strong', null, selected.title), h('span', { className: 'aw-note' }, [selected.author, selected.authoredAt && stamp(selected.authoredAt)].filter(Boolean).join(' · '))) : null,
            selected ? h(CheckoutDiff, { key: JSON.stringify([version, head, range.from, range.to]), sessionId, target, root, comparison, before }) : null)
        }
        function CheckoutDiff({ sessionId, target, root, comparison, before }) {
          const tt = useT(), [diff, setDiff] = React.useState(null), [error, setError] = React.useState(''), [limit, setLimit] = React.useState(20)
          React.useEffect(() => {
            const abort = new AbortController(); setDiff(null); setError('')
            void (async () => {
              try {
                const result = await ctx.remote.forgePanel.localDiff(sessionId, comparison, abort.signal)
                if (abort.signal.aborted) return
                if (!result.ok) throw new Error(result.error?.message || tt('checkoutUnavailable'))
                setDiff(result.value)
              } catch (e) { if (!abort.signal.aborted) setError(e.message) }
            })()
            return () => abort.abort()
          }, [sessionId, comparison])
          return h(React.Fragment, null,
            diff?.base ? h('p', { className: 'aw-note' }, tt('gitScope'), ': ', diff.base) : null,
            error ? h('p', { className: 'aw-error', role: 'alert' }, error) : !diff ? h('p', { className: 'aw-note' }, tt('loading')) : h(React.Fragment, null,
              !diff.files.length && !diff.omitted ? h('p', { className: 'aw-note' }, tt('diffClean')) : null,
              diff.files.slice(0, limit).map(file => h(CheckoutFile, { key: file.path + ':' + file.digest, file, root, target, sessionId, scope: comparison, before })),
              diff.files.length > limit ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setLimit(n => n + 20) }, tt('moreFiles')) : null,
              diff.omitted ? h('p', { className: 'aw-note' }, tt('diffOmitted', { n: diff.omitted })) : null))
        }

        function ResultCard({ item, catalog, providers, writable, changes, busy, mark }) {
          const tt = useT(), [open, setOpen] = React.useState(null), [selected, select] = React.useState(null), [replyOpen, setReplyOpen] = React.useState(false)
          const openFile = (path, options) => select(previous => ({ path, line: options?.line, request: (previous?.request ?? 0) + 1 }))
          const target = item.parentSessionId ? conversationTarget(item) : item.sessionId, opener = React.useRef(null)
          const closeFile = () => { select(null); if (opener.current?.isConnected) opener.current.focus() }
          const toggle = (key, label) => h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open === key, onClick: () => { select(null); setOpen(open === key ? null : key) } }, tt(label))
          const name = catalog.byId[item.sessionId]?.title || item.title, provider = providers.find(p => p.id === item.providerId)?.label || item.providerId
          const longReply = !!item.reply && (item.reply.length > 200 || item.reply.split('\n').length > 3)
          return h('article', { className: 'aw-card aw-section', onClickCapture: event => { const link = event.target.closest?.('.aw-file-link'); if (link) opener.current = link } }, h('div', { className: 'aw-row' }, h(StateDot, { state: DOT[item.state] || 'warning', size: 8 }), h('strong', { className: 'aw-grow' }, name), h(Tag, { tone: 'quiet' }, tt(item.reviewed === 'seen' ? 'reviewed' : item.reviewed === 'legacy' ? 'legacyReview' : 'unseen'))),
            h('div', { className: 'aw-note' }, [provider, tt('resultTurn', { n: item.turn }), stateText(item.state), stamp(item.at)].join(' · ')),
            item.reply ? h(React.Fragment, null,
              h('p', { className: longReply && !replyOpen ? 'aw-text aw-reply-clamped' : 'aw-text' }, item.reply),
              longReply ? h('div', null, h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': replyOpen, onClick: () => setReplyOpen(v => !v) }, tt(replyOpen ? 'collapseExcerpt' : 'expandExcerpt'))) : null) : null,
            item.error ? h('p', { className: 'aw-error' }, item.error) : null,
            h('div', { className: 'aw-note' }, [item.cwd, item.tools ? tt('traceTools', { n: item.tools }) : null, item.fileCount ? tt('traceFiles', { n: item.fileCount }) : null].filter(Boolean).join(' · ')),
            item.files.length ? h(ToolTargets, { targets: item.files.map(path => ({ path })), cwd: item.cwd, openFile }) : null,
            h('div', { className: 'aw-row' }, toggle('trace', 'runTrace'), changes ? toggle('diff', 'checkoutDiff') : null, h(OpenConversation, { session: { native: item } }),
              writable && item.reviewed !== 'seen' ? h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => mark(item) }, tt('markSeen')) : null),
            selected ? h(FilePreview, { key: selected.request, file: selected, absolute: selected.path, sessionId: item.sessionId, target, selection: selected.line ?? 1, close: closeFile }) : null,
            open === 'trace' ? h(NativeTrace, { sessionId: item.sessionId, reference: { sessionId: item.recordId, turnId: item.id }, openFile }) : null,
            open === 'diff' ? h(ReviewCheckout, { sessionId: item.sessionId, target }) : null)
        }

        function ProjectResults({ project, data, hidden, catalog, busy, run }) {
          const tt = useT(), [filter, setFilter] = React.useState('pending'), [pages, setPages] = React.useState([]), [snapshot, setSnapshot] = React.useState(null), [error, setError] = React.useState('')
          const [version, refresh] = React.useReducer(n => n + 1, 0)
          const members = new Set(project.sessionIds), records = data.sessions.filter(s => s.native && !s.archived && !hidden.has(s.native.sessionId) && !hidden.has(s.native.rootSessionId) && (members.has(s.native.sessionId) || members.has(s.native.rootSessionId)))
          const waiting = records.filter(s => s.activity.pending > 0 && !s.native.retired)
          const revision = records.map(s => s.id + ':' + s.reviewRevision).toSorted().join('|'), before = pages.at(-1), pageKey = filter + ':' + (before || '')
          React.useEffect(() => {
            const controller = new AbortController()
            api({ action: 'project-results', workspaceId: project.workspaceId, filter, before }, controller.signal).then(value => { if (!controller.signal.aborted) { setSnapshot({ ...value, key: pageKey }); setError('') } }, e => { if (!controller.signal.aborted) setError(e.message) })
            return () => controller.abort()
          }, [project.workspaceId, revision, pageKey, version])
          const page = snapshot?.key === pageKey ? snapshot : null
          const mark = async item => { if (await run({ action: 'project-reviewed', workspaceId: project.workspaceId, recordId: item.recordId, runId: item.id })) refresh() }
          const select = key => { setFilter(key); setPages([]); setError('') }
          return h('section', { className: 'aw-box' }, h('div', { className: 'aw-row' }, h('h2', { className: 'aw-grow' }, tt('projectResults')), h(Button, { size: 'sm', variant: 'ghost', onClick: refresh }, tt('schRefresh'))),
            waiting.length ? h('div', { className: 'aw-section' }, h('h3', null, tt('projectRequests')), waiting.map(s => h('div', { key: s.id, className: 'aw-row' }, h(StateDot, { state: 'warning', size: 8 }), h('span', { className: 'aw-grow' }, catalog.byId[s.native.sessionId]?.title || s.title, ' · ', tt('requestCount', { n: s.activity.pending })), h(OpenConversation, { session: s })))) : null,
            h('div', { className: 'aw-row' }, ['pending','all'].map(key => h(Button, { key, size: 'sm', variant: key === filter ? 'outline' : 'ghost', 'aria-pressed': key === filter, onClick: () => select(key) }, (key === 'pending' ? tt('unseen') + (page ? ' · ' + page.pending : '') : tt('resultHistory'))))), h('p', { className: 'aw-note' }, tt('reviewHint')),
            error ? h('p', { role: 'alert', className: 'aw-error' }, error) : !page ? h('p', { className: 'aw-note' }, tt('loading')) : null,
            page?.items.map(item => h(ResultCard, { key: item.id, item, catalog, providers: data.providers, writable: data.projects.reviewWritable, changes: data.projects.changes, busy, mark })),
            page && !page.items.length && !error ? h('p', { className: 'aw-note' }, tt(filter === 'pending' ? 'noResults' : 'noAllResults')) : null,
            h('div', { className: 'aw-row' }, before ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setPages(old => old.slice(0,-1)) }, tt('previousPage')) : null,
              page?.next ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => setPages(old => [...old, page.next]) }, tt('nextPage')) : null))
        }

        const treeLocation = state => state === 'directory' ? 'treeDirectory' : state === 'missing' ? 'treeMissing' : state === 'incomplete' ? 'treeIncomplete' : 'treeOccupied'
        function SharedCheckout({ tree, value, group, refresh }) {
          const tt = useT(), [form, show] = React.useState(false), [providerId, pick] = React.useState(''), [title, name] = React.useState('')
          const [pending, wait] = React.useState(false), [error, fail] = React.useState(''), [created, remember] = React.useState(null)
          const locked = React.useRef(false), mounted = React.useRef(false)
          React.useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
          const provider = providerId || group.providers[0]?.id, isMember = tree.participants?.includes(value.sessionId)
          const canCreate = group.writable && group.enabled && !value.archived && isMember && !tree.incompleteJoin && tree.location === 'directory' && value.current === 'directory'
          const members = tree.participants ?? []
          const create = async event => {
            event.preventDefault(); if (locked.current || !canCreate || !provider || created) return
            locked.current = true; wait(true); fail('')
            try {
              const result = await api({ action: 'project-launch', workspaceId: group.workspaceId, isolation: 'shared', checkoutSessionId: value.sessionId, checkoutRevision: tree.revision, providerId: provider, title })
              if (!mounted.current) return
              remember(result); refresh()
              if (result.ready) await ctx.uiWorkspace.openSession(result.sessionId); else fail(result.error)
            } catch (e) { if (mounted.current) fail(e.message) } finally { locked.current = false; if (mounted.current) wait(false) }
          }
          return h('div', { className: 'aw-section' }, h('div', { className: 'aw-row' }, h('strong', { className: 'aw-grow' }, tt('shareHeading')), canCreate && !form ? h(Button, { variant: 'outline', size: 'sm', onClick: () => show(true) }, tt('shareCheckout')) : null),
            members.map(id => {
              const row = group.catalog.byId[id], record = group.related.get(id), here = id === value.sessionId
              const target = projectConversationTarget(id, row, record)
              return h('div', { key: id, className: 'aw-inbox-row' }, h('button', { type: 'button', className: 'aw-item', 'aria-current': here || undefined, onClick: () => ctx.uiWorkspace.openSession(target) },
                h('span', { className: 'aw-item-top' }, h(StateDot, { size: 8, state: record ? DOT[record.state] ?? 'idle' : row?.running ? 'ongoing' : 'idle' }), h('strong', { className: 'aw-ellipsis' }, row?.title || record?.title || row?.displayTitle || id)),
                h('span', { className: 'aw-item-sub aw-ellipsis' }, record ? [group.providers.find(p => p.id === record.providerId)?.label ?? record.providerId, activityLabel(record)].join(' · ') : tt('nativeChat'))),
                record?.activity.group === 'attention' ? h(Tag, { tone: 'warning' }, tt('attention')) : null, here ? h(Tag, { tone: 'quiet' }, tt('shareCurrent')) : null, id === tree.ownerId ? h(Tag, { tone: 'quiet' }, tt('shareOwner')) : null)
            }),
            tree.incompleteJoin ? h('p', { className: 'aw-error' }, tt('sharePartial')) : null,
            canCreate && form ? h('form', { className: 'aw-card aw-section', onSubmit: create }, h('strong', null, tt('shareCheckout')), h(PathLabel, { path: tree.path }), h('p', { className: 'aw-note' }, tt('shareHint')),
              h('div', { className: 'aw-form' }, h('label', { className: 'aw-field' }, h('span', null, tt('engine')), h('select', { className: 'aw-select', disabled: pending || !!created, value: provider ?? '', onChange: e => pick(e.target.value) }, group.providers.map(p => h('option', { key: p.id, value: p.id }, p.label)))),
                h('label', { className: 'aw-field' }, h('span', null, tt('agentName')), h(Input, { value: title, disabled: pending || !!created, maxLength: 160, onChange: e => name(e.target.value) }))),
              h('div', { className: 'aw-row' }, h(Button, { type: 'submit', size: 'sm', variant: 'primary', disabled: pending || !provider || !!created }, tt('shareOpen')), h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: pending, onClick: () => { show(false); remember(null); fail('') } }, tt('shareDismiss')))) : null,
            created ? h('div', { className: 'aw-row' }, !created.ready ? tt('projectFailed') : null, h(Button, { size: 'sm', variant: 'ghost', onClick: () => ctx.uiWorkspace.openSession(created.sessionId) }, tt('openConversation'))) : null,
            error ? h('p', { className: 'aw-error', role: 'alert' }, error) : null)
        }

        function CheckoutState({ value, writable, rebuilding, rebuild, receipt, refresh, group }) {
          const tt = useT(), cleanupKey = { scheduled: 'treeScheduled', retained: 'treeRetained', removed: 'treeRemoved', failed: 'treeFailed' }[value.cleanup?.status]
          return h('section', { className: 'aw-card aw-section', 'aria-label': tt('treeInspect') },
            h('div', { className: 'aw-row' }, h('strong', { className: 'aw-grow' }, tt('treeActual')), h(Tag, { tone: 'quiet' }, tt(treeLocation(value.current))), h(Button, { size: 'sm', variant: 'ghost', onClick: refresh }, tt('schRefresh'))), h(PathLabel, { path: value.cwd }),
            value.archived && (value.trees.length || cleanupKey) ? h('p', { className: value.cleanup?.status === 'failed' ? 'aw-error' : 'aw-note', role: 'status' }, tt(cleanupKey || 'treeNoReceipt')) : null,
            !value.trees.length ? h('p', { className: 'aw-note' }, tt('treeEmpty')) : null,
            value.trees.map(w => h('div', { key: w.revision, className: 'aw-section' }, h('div', { className: 'aw-row' }, h(Tag, { tone: 'quiet' }, tt(w.owned ? 'treeOwned' : w.shared ? 'sharedCheckout' : 'treeInherited')), h('strong', { className: 'aw-grow aw-ellipsis' }, tt('treeRecorded'), ': ', w.branch), h('span', { className: 'aw-note' }, tt(treeLocation(w.location)))),
              h(PathLabel, { path: w.path }), h('div', { className: 'aw-note' }, tt('treeSource'), ': ', w.repositoryRoot, ' · ', tt('treeBase'), ': ', w.baseCommit.slice(0,12)),
              !w.inUseHere ? h('p', { className: 'aw-note' }, tt('treeOther')) : null,
              group && w.ownerId && (w.participants?.length || w.incompleteJoin) ? h(SharedCheckout, { tree: w, value, group, refresh }) : null,
              w.owned && w.inUseHere && w.location === 'missing' ? value.archived ? h('p', { className: 'aw-note' }, tt('treeRestoreFirst')) : writable ? h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'outline', disabled: rebuilding || value.restoring || value.readOnly || value.busy, onClick: () => rebuild(w) }, tt(rebuilding || value.restoring ? 'treeBusy' : 'treeRestore')), value.busy || value.readOnly ? h('span', { className: 'aw-note' }, tt('treePolicy')) : null) : null : null)),
            receipt ? h('p', { className: 'aw-note', role: 'status' }, tt(receipt.branchRecreated ? 'treeRecreated' : 'treeRebuilt'), ' ', receipt.path) : null)
        }

        function CheckoutDetails({ workspaceId, sessionId, archived, writable, group, membership }) {
          const tt = useT(), [value, setValue] = React.useState(null), [error, setError] = React.useState(''), [receipt, setReceipt] = React.useState(null)
          const [rebuilding, setRebuilding] = React.useState(false), [version, refresh] = React.useReducer(n => n + 1, 0), lock = React.useRef(false)
          React.useEffect(() => {
            const abort = new AbortController(); let timer
            const read = async () => {
              try {
                const next = await api({ action: 'checkout-info', workspaceId, dshSessionId: sessionId }, abort.signal)
                if (abort.signal.aborted) return
                setValue(next); if (next.cleanup?.status === 'scheduled' || next.restoring) timer = setTimeout(read, 600)
              } catch (e) { if (!abort.signal.aborted) setError(e.message) }
            }
            void read(); return () => { abort.abort(); clearTimeout(timer) }
          }, [workspaceId, sessionId, archived, membership, version])
          const rebuild = async w => {
            if (lock.current || !window.confirm([tt('treeRestoreAsk'), w.path, w.branch + ' · ' + w.baseCommit].join('\n\n'))) return
            lock.current = true; setRebuilding(true); setError(''); setReceipt(null)
            try { setReceipt(await api({ action: 'checkout-restore', workspaceId, dshSessionId: sessionId, revision: w.revision })) }
            catch (e) { setError(e.message) } finally { lock.current = false; setRebuilding(false); refresh() }
          }
          return h('div', { className: 'aw-detail' }, error ? h('p', { className: 'aw-error', role: 'alert' }, error, ' ', h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setError(''); refresh() } }, tt('retry'))) : null,
            value ? h(CheckoutState, { value, writable, rebuilding, rebuild, receipt, group, refresh: () => { setError(''); refresh() } }) : !error ? h('p', { className: 'aw-note' }, tt('loading')) : null)
        }

        const fileSearchScope = { kind: 'file-search' }
        /** Search names in one session's effective working directory. Typing never reads file contents. */
        function OpenTerminalButton({ sessionId, target, terminalId, useSessionAccess }) {
          const tt = useT(), [error, fail] = React.useState(''), allowed = useSessionAccess(sessionId, 'terminal/attach')
          if (!allowed || !ctx.get('webTerminals') || !ctx.get('sidebarRightTabs')?.get('terminal') || !ctx.get('sidebarRight')) return null
          return h(React.Fragment, null, h(Button, { size: 'sm', variant: 'outline', onClick: () => {
            try { fail(''); openRetainedTerminal(sessionId, target, terminalId) } catch (e) { fail(e.message) }
          } }, tt('scriptTerminal')), error && h('span', { role: 'alert', className: 'aw-error' }, error))
        }
        function TerminalListToggle({ sessionId, open, toggle, useSessionAccess }) {
          const allowed = useSessionAccess(sessionId, 'terminal/watch'), tt = useT()
          return allowed && ctx.get('webTerminals') ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: toggle }, tt('termList')) : null
        }
        function ProjectTerminals({ sessionId, target, useSessionAccess }) {
          const allowed = useSessionAccess(sessionId, 'terminal/watch')
          return allowed && ctx.get('webTerminals') ? h(TerminalRoster, { key: sessionId, sessionId, target, useSessionAccess }) : null
        }
        function TerminalRoster({ sessionId, target, useSessionAccess }) {
          const tt = useT(), [version, retry] = React.useReducer(n => n + 1, 0), [result, report] = React.useState(null)
          React.useEffect(() => {
            let active = true
            const stream = ctx.remote.$stream({ name: 'ACP session terminals', open: signal => ctx.remote.terminal.watch(sessionId, signal),
              ended: () => new Error(t('termLost')), carrierFailed: () => { if (active) report({ version, error: t('termLost') }) } })
            void (async () => {
              try { for await (const frame of stream) { if (!active) break; report({ version, rows: frame.value }); frame.accept() } }
              catch (e) { if (active) report({ version, error: e.message }) }
              finally { await stream.dispose() }
            })()
            return () => { active = false; void stream.dispose() }
          }, [sessionId, version])
          const value = result?.version === version ? result : null
          return h('section', { className: 'aw-detail aw-section', 'aria-label': tt('termList') }, h('div', { className: 'aw-row' }, h('strong', { className: 'aw-grow' }, tt('termList')), value?.rows && h(Tag, { tone: 'quiet' }, String(value.rows.length))),
            h('span', { className: 'aw-note' }, tt('termScope')),
            !value ? h('p', { className: 'aw-note' }, tt('loading')) : value.error ? h('div', { className: 'aw-row' }, h('span', { role: 'alert', className: 'aw-error' }, value.error), h(Button, { size: 'sm', variant: 'ghost', onClick: retry }, tt('termRetry'))) : !value.rows.length ? h('p', { className: 'aw-note' }, tt('termEmpty')) : value.rows.map(row =>
              h('div', { key: row.id, className: 'aw-section' }, h('div', { className: 'aw-row' }, h('strong', { className: 'aw-grow aw-ellipsis', title: row.title }, row.title || row.id), h(Tag, { tone: row.state === 'failed' || row.exitCode ? 'warning' : 'quiet' }, tt({ running: 'scriptRunning', exited: 'scriptExited', failed: 'scriptFailed' }[row.state])),
                h(OpenTerminalButton, { sessionId, target, terminalId: row.id, useSessionAccess })),
                h('span', { className: 'aw-note' }, [row.shell?.name, tt(row.origin === 'agent' ? 'termAgent' : 'termUser'), tt(row.control === 'agent' ? 'termAgentControl' : 'scriptOwner'), Number.isInteger(row.exitCode) && tt('scriptExit') + ': ' + row.exitCode].filter(Boolean).join(' · ')),
                h(PathLabel, { path: row.cwd }), h('small', { className: 'aw-note aw-mono' }, row.id), row.error && h('span', { className: 'aw-error' }, row.error))))
        }

        function ProjectFileFinder(props) {
          const tt = useT(), [mode, select] = React.useState('name'), tabs = React.useId(), panel = tabs + 'files'
          return h('section', { className: 'aw-detail aw-section', 'aria-label': tt('findFile') }, h('div', { className: 'aw-row' }, h(IconBrowseOutlineRegular, { size: 14 }), h('strong', { className: 'aw-grow' }, tt('findFile')),
            h(SegmentedTabs, { size: 'sm', label: tt('findFile'), value: mode, onChange: select, items: [['name', 'fileByName'], ['directory', 'fileByDirectory']].map(([value, key]) => ({ id: tabs + value, panelId: panel, value, label: tt(key) })) })),
            h('div', { id: panel, role: 'tabpanel', 'aria-labelledby': tabs + mode, className: 'aw-section' }, h(mode === 'name' ? ProjectFileSearch : ProjectDirectory, props)))
        }

        function LocatedProjectFile({ workspaceId, sessionId, target, cwd, chosen, close, reopenRoot }) {
          const tt = useT(), [location, locate] = React.useState(null)
          React.useEffect(() => {
            const abort = new AbortController()
            api({ action: 'project-file-locate', workspaceId, dshSessionId: sessionId, path: chosen.path, expectedCwd: cwd }, abort.signal).then(
              v => { if (!abort.signal.aborted) locate({ chosen, cwd, absolute: v.absolute.replace(/\\/g, '/') }) },
              e => { if (!abort.signal.aborted) locate({ chosen, cwd, error: e.message }) })
            return () => abort.abort()
          }, [workspaceId, sessionId, chosen, cwd])
          if (location?.chosen !== chosen || location.cwd !== cwd) return h('p', { role: 'status', className: 'aw-note' }, tt('loading'))
          return location.error ? h('div', { className: 'aw-row' }, h('span', { role: 'alert', className: 'aw-error' }, location.error), reopenRoot && h(Button, { size: 'sm', variant: 'ghost', onClick: reopenRoot }, tt('dirRestart'))) :
            h(FilePreview, { key: location.absolute, target, sessionId, scope: fileSearchScope, absolute: location.absolute, file: chosen, selection: 1, close, closeLabel: reopenRoot ? 'dirBack' : 'fileHitsBack' })
        }

        function ProjectDirectory({ workspaceId, sessionId, target }) {
          const tt = useT(), [request, move] = React.useState(() => ({ path: '' })), [answer, publish] = React.useState(null)
          const [limit, more] = React.useState(24), [chosen, choose] = React.useState(null), trigger = React.useRef(null), breadcrumb = React.useRef(null)
          const go = (path, expectedCwd) => { choose(null); more(24); move({ path, expectedCwd }); breadcrumb.current?.focus() }
          React.useEffect(() => {
            const abort = new AbortController()
            api({ action: 'project-file-directory', workspaceId, dshSessionId: sessionId, ...request }, abort.signal).then(
              result => { if (!abort.signal.aborted) publish({ request, result }) }, e => { if (!abort.signal.aborted) publish({ request, error: e.message }) })
            return () => abort.abort()
          }, [workspaceId, sessionId, request])
          const current = answer?.request === request ? answer : null, result = current?.result, cwd = result?.cwd ?? request.expectedCwd
          const segments = request.path ? request.path.split('/') : [], entries = React.useMemo(() => result ? [...result.entries.filter(e => e.type === 'directory'), ...result.entries.filter(e => e.type !== 'directory')] : EMPTY, [result])
          return h(React.Fragment, null, h('nav', { ref: breadcrumb, tabIndex: -1, className: 'aw-row', 'aria-label': tt('fileByDirectory') }, ['', ...segments].map((name, i) => {
            const path = segments.slice(0, i).join('/')
            return h(Button, { key: path, size: 'sm', variant: 'ghost', disabled: i === segments.length, 'aria-current': i === segments.length ? 'location' : undefined, onClick: () => go(path, cwd) }, i ? name : tt('dirRoot'))
          })), h('div', { className: 'aw-row' }, h('span', { className: 'aw-note aw-grow' }, tt('dirHint')), h(Button, { size: 'sm', variant: 'ghost', onClick: () => go(request.path, cwd) }, tt('dirRefresh'))),
            !current ? h('p', { role: 'status', className: 'aw-note' }, tt('loading')) : current.error ? h('div', { className: 'aw-row' }, h('span', { role: 'alert', className: 'aw-error' }, current.error), h(Button, { variant: 'outline', size: 'sm', onClick: () => go('') }, tt('dirRestart'))) : h(React.Fragment, null,
              h(PathLabel, { path: result.cwd }), h('span', { className: 'aw-note', role: 'status' }, entries.length ? tt('dirCount', { n: entries.length }) : tt('dirEmpty'), result.truncated ? ' · ' + tt('dirPartial') : ''),
              h('div', { className: 'aw-directory-list' }, entries.slice(0, limit).map(entry => {
                const path = [request.path, entry.name].filter(Boolean).join('/'), folder = entry.type === 'directory'
                return h('button', { key: entry.name, type: 'button', title: path, className: 'aw-file-hit aw-dir-entry', disabled: !folder && entry.type !== 'file', 'aria-pressed': folder ? undefined : chosen?.path === path,
                  onClick: e => { if (folder) go(path, cwd); else { trigger.current = e.currentTarget; choose(chosen?.path === path ? null : { path }) } } },
                  h('span', { className: 'aw-note' }, tt(folder ? 'dirFolder' : entry.type === 'file' ? 'dirFile' : 'dirOther')), h('strong', { className: 'aw-ellipsis' }, entry.name), Number.isSafeInteger(entry.size) && !folder && h('small', { className: 'aw-note' }, tt('dirBytes', { n: entry.size })))
              })), limit < entries.length && h(Button, { variant: 'ghost', size: 'sm', onClick: () => more(n => n + 24) }, tt('dirMore')),
              chosen && h(LocatedProjectFile, { workspaceId, sessionId, target, cwd, chosen, reopenRoot: () => go(''), close: () => { choose(null); trigger.current?.focus() } })))
        }

        function ProjectFileSearch({ workspaceId, sessionId, target }) {
          const tt = useT(), [input, typeQuery] = React.useState(''), [answer, publish] = React.useState(null), [version, refresh] = React.useReducer(n => n + 1, 0)
          const [limit, show] = React.useState(12), [chosen, choose] = React.useState(null)
          const query = input.trim(), trigger = React.useRef(null)
          React.useEffect(() => {
            if (!query) return
            const abort = new AbortController()
            const timer = setTimeout(async () => {
              try {
                const result = await api({ action: 'project-file-search', workspaceId, dshSessionId: sessionId, query }, abort.signal)
                if (!abort.signal.aborted) publish({ query, version, result })
              } catch (e) { if (!abort.signal.aborted) publish({ query, version, error: e.message }) }
            }, 150)
            return () => { clearTimeout(timer); abort.abort() }
          }, [workspaceId, sessionId, query, version])
          const current = answer?.query === query && answer.version === version ? answer : null, result = current?.result
          const clear = () => { publish(null); choose(null); show(12) }
          return h(React.Fragment, null, query && h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'ghost', onClick: () => { clear(); refresh() } }, tt('fileRefresh'))),
            h(Input, { className: 'aw-input', type: 'search', maxLength: 200, 'aria-label': tt('fileQuery'), placeholder: tt('fileQuery'), value: input, onChange: e => { if (e.target.value.trim() !== query) clear(); typeQuery(e.target.value) } }),
            h('p', { className: 'aw-note' }, tt('findFileHint')), current?.error && h('p', { className: 'aw-error', role: 'alert' }, current.error),
            query && !current ? h('p', { className: 'aw-note', role: 'status' }, tt('loading')) : null,
            result && h(React.Fragment, null, h(PathLabel, { path: result.cwd }), h('p', { role: 'status', className: 'aw-note' }, tt('foundFiles', { n: result.paths.length }), result.truncated ? ' · ' + tt('fileHitsLimit') : '', result.incomplete ? ' · ' + tt('fileScanCut') : ''),
              result.paths.slice(0, limit).map(path => h('button', { type: 'button', className: 'aw-file-hit', key: path, 'aria-pressed': chosen?.path === path, title: path, onClick: e => { trigger.current = e.currentTarget; choose(chosen?.path === path ? null : { path }) } }, h('strong', null, path.split('/').at(-1)), path.includes('/') && h('span', { className: 'aw-note' }, path.slice(0, path.lastIndexOf('/') + 1)))),
              limit < result.paths.length && h(Button, { size: 'sm', variant: 'ghost', onClick: () => show(limit + 12) }, tt('moreFileHits'))),
            chosen && result && h(LocatedProjectFile, { workspaceId, sessionId, target, cwd: result.cwd, chosen, close: () => { choose(null); trigger.current?.focus() } }))
        }

        function ProjectTitle({ project, items, useWorkspaceAccess }) {
          const allowed = useWorkspaceAccess(project.workspaceId, 'workspace/rename'), tt = useT()
          const [draft, setDraft] = React.useState(null), [saving, save] = React.useState(false), [error, fail] = React.useState('')
          const name = draft?.trim(), duplicate = name && items.some(w => w.workspaceId !== project.workspaceId && w.title === name)
          const blocked = !allowed || saving || !name || name === project.title || duplicate
          const submit = async event => {
            event.preventDefault(); if (blocked) return
            save(true); fail('')
            try { await ctx.workspaces.rename(project.workspaceId, name); setDraft(null) }
            catch (e) { fail(e.message || String(e)) } finally { save(false) }
          }
          return h('div', { className: 'aw-section' }, h('div', { className: 'aw-row' }, h(PathLabel, { path: project.path }), allowed && draft === null && h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setDraft(project.title); fail('') } }, tt('projectRename'))),
            allowed && draft !== null && h('form', { className: 'aw-row', onSubmit: submit }, h(Input, { className: 'aw-input', autoFocus: true, value: draft, 'aria-label': tt('projectTitle'), disabled: saving, onChange: e => { setDraft(e.target.value); fail('') }, onKeyDown: e => { if (e.nativeEvent.isComposing && e.key === 'Enter') e.preventDefault(); else if (e.key === 'Escape' && !saving) setDraft(null) } }),
              h(Button, { size: 'sm', type: 'submit', variant: 'primary', disabled: !!blocked }, tt('save')), h(Button, { size: 'sm', type: 'button', variant: 'ghost', disabled: saving, onClick: () => setDraft(null) }, tt('cancelEdit')),
              (duplicate || error) ? h('span', { role: 'alert', className: 'aw-error' }, duplicate ? tt('sameProjectTitle') : error) : null))
        }

        function ArchiveChoice({ member, archived, held, disabled, useSessionAccess }) {
          const tt = useT(), allowed = useSessionAccess(member.id, archived ? 'workspace/unarchiveSession' : 'workspace/archiveSession')
          return h('label', { className: 'aw-batch-choice' }, h('input', { type: 'checkbox', name: 'dsh-session', value: member.id, disabled: disabled || !allowed || held }),
            h('span', { className: 'aw-section' }, h('strong', null, member.title), h('small', { className: 'aw-note aw-mono' }, member.id)),
            (!allowed || held) && h(Tag, { tone: 'quiet' }, tt(allowed ? 'batch.active' : 'batch.denied')))
        }

        // This is a view over explicit DSH session IDs, never a bulk archive of external records or tabs.
        function ArchiveBatch({ project, members, archived, data, busy, useSessionAccess, open, show }) {
          const tt = useT(), [choose, remind] = React.useState(false), [running, spin] = React.useState(false), [outcomes, report] = React.useState([])
          const lock = React.useRef(null), latest = React.useRef(data); latest.current = data
          React.useEffect(() => () => lock.current?.abort(), [])
          const label = tt(archived ? 'batch.restore' : 'batch.archive')
          const held = id => !archived && (ctx.sessions.list.getSnapshot().byId[id]?.running || latest.current.sessions.some(s =>
            (s.native?.sessionId === id || s.native?.rootSessionId === id) && ['working', 'attention'].includes(s.activity?.group)))
          const submit = async event => {
            event.preventDefault()
            if (lock.current || busy) return
            const ids = new Set(new FormData(event.currentTarget).getAll('dsh-session'))
            const targets = members.filter(m => ids.has(m.id)) // visible, authorized and individually checked
            remind(!targets.length)
            if (!targets.length) return
            if (!window.confirm([label + ' · ' + project.title, ...targets.map(m => m.title + ' (' + m.id + ')'), tt(archived ? 'batch.restoreNote' : 'batch.archiveNote')].join('\n'))) return
            const controller = new AbortController(); lock.current = controller; spin(true); report([])
            const available = id => {
              const state = ctx.workspaces.list.getSnapshot()
              return state.phase === 'ready' && state.items.find(w => w.workspaceId === project.workspaceId)?.sessionIds.includes(id) && state.archivedSessionIds.includes(id) === archived
            }
            try {
              for (const { id, title } of targets) {
                if (controller.signal.aborted) break
                let reason = '', ok = false
                try {
                  if (!available(id)) reason = tt('batch.changed')
                  else if (held(id)) reason = tt('batch.active')
                  else if (!archived) {
                    // A managed checkout can be reclaimed on archive. Keep that decision in its single-session flow.
                    const state = await api({ action: 'checkout-info', workspaceId: project.workspaceId, dshSessionId: id }, controller.signal)
                    if (state.sessionId !== id || state.archived || !available(id)) reason = tt('batch.changed')
                    else if (state.busy || state.restoring || held(id)) reason = tt('batch.active')
                    else if (state.trees.length) reason = tt('batch.tree')
                  }
                  if (controller.signal.aborted) break
                  if (!reason) {
                    if (archived) await ctx.uiWorkspace.unarchiveSession(id)
                    else await ctx.uiWorkspace.archiveSession(id, { stopActivity: false })
                    ok = true
                  }
                } catch (e) { reason = e.message || String(e) }
                if (!controller.signal.aborted) report(old => [...old, { id, title, ok, reason }])
              }
            } finally { if (!controller.signal.aborted) { lock.current = null; spin(false) } }
          }
          return h('section', { className: 'aw-section' }, h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, disabled: running || busy || (!open && !members.length), onClick: () => { show(!open); report([]); remind(false) } }, label)),
            open && h('form', { className: 'aw-box aw-section', onSubmit: submit, onChange: () => remind(false), 'aria-label': label }, h('p', { className: 'aw-note' }, tt(archived ? 'batch.restoreNote' : 'batch.archiveNote')),
              members.map(m => h(ArchiveChoice, { key: m.id, member: m, archived, held: held(m.id), disabled: running || busy, useSessionAccess })),
              h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'outline', type: 'submit', disabled: running || busy || !members.length }, tt(running ? 'loading' : 'batch.confirm'))),
              choose && h('small', { className: 'aw-note', role: 'status' }, tt('batch.choose')),
              outcomes.length > 0 && h('ul', { className: 'aw-section', 'aria-label': tt('batch.result'), 'aria-live': 'polite' }, outcomes.map(o => h('li', { key: o.id, className: 'aw-row', title: o.id }, h(Tag, { tone: o.ok ? 'quiet' : 'warning' }, tt(o.ok ? archived ? 'batch.restored' : 'batch.archived' : 'batch.skipped')), h('span', null, o.title), o.reason && h('span', { className: 'aw-note' }, o.reason))))))
        }

        function Projects({ data, run, busy, onRecord, scheduleAccess, renderFactorySlot, useSessionAccess = () => false, useWorkspaceAccess = () => false }) {
          const tt = useT()
          const workspaces = useList(ctx.workspaces.list), catalog = useList(ctx.sessions.list)
          const [projectId, select] = React.useState(null), [adding, setAdding] = React.useState(false), [error, setError] = React.useState('')
          const [checkoutId, setCheckoutId] = React.useState(null), [inspectId, inspect] = React.useState(null), [fileId, setFileId] = React.useState(null)
          const [scriptsId, setScriptsId] = React.useState(null), [terminalId, setTerminalId] = React.useState(null), [scheduling, showSchedules] = React.useState(false)
          const [query, search] = React.useState(''), [scope, setScope] = React.useState('project'), [pinsOnly, filterPins] = React.useState(false)
          const [form, setForm] = React.useState(false), [archived, showArchived] = React.useState(false), [partial, setPartial] = React.useState(null)
          const [draft, setDraft] = React.useState({ provider: '', model: 'default', effort: '', isolation: 'local', title: '', branch: '', from: '', profileName: '', profileId: '' })
          const project = workspaces.items.find(w => w.workspaceId === projectId) ?? workspaces.items[0]
          const provider = draft.provider ? data.providers.find(p => p.id === draft.provider) : data.providers[0]
          const model = provider?.models?.some(m => m.id === draft.model) ? draft.model : 'default'
          const effortsFor = (p, m) => p?.advertised?.models?.find(item => item.id === m)?.reasoning?.efforts ?? p?.models?.find(item => item.id === m)?.reasoning?.efforts ?? []
          const efforts = effortsFor(provider, model), profiles = data.projects?.profiles ?? []
          const field = (key, value) => setDraft(d => ({ ...d, [key]: value, ...(key === 'provider' ? { model: 'default', effort: '' } : key === 'model' ? { effort: '' } : {}) }))
          const applyProfile = id => {
            const p = profiles.find(item => item.id === id)
            if (!p) { setDraft(d => ({ ...d, profileId: '', profileName: '' })); return }
            const source = data.providers.find(item => item.id === p.providerId)
            if (!source || (p.isolation === 'worktree' && !data.projects.worktree) || (p.model !== 'default' && !source.models?.some(m => m.id === p.model)) || (p.effort && !effortsFor(source, p.model).some(e => e.id === p.effort))) { setError(tt('unavailableProfile')); return }
            setError(''); setDraft(d => ({ ...d, provider: p.providerId, model: p.model, effort: p.effort ?? '', isolation: p.isolation, profileId: id, profileName: p.name }))
          }
          const saveProfile = async () => {
            const value = await run({ action: 'profile-save', id: draft.profileId || undefined, name: draft.profileName, providerId: provider.id, model, effort: draft.effort || undefined, isolation: draft.isolation })
            if (value) field('profileId', value.id)
          }
          const removeProfile = async () => {
            if (window.confirm(tt('removeProfileConfirm')) && await run({ action: 'profile-remove', id: draft.profileId })) applyProfile('')
          }
          const resetFinder = () => { search(''); filterPins(false); setScope('project') }
          const changeProject = id => { select(id); resetFinder(); setTerminalId(null); setFileId(null); setScriptsId(null); setCheckoutId(null); inspect(null); setForm(false); setPartial(null); setError(''); showArchived(false) }
          const add = async () => {
            setAdding(true); setError('')
            try { const path = await ctx.uiWorkspace.pickDirectory(); if (path) changeProject((await ctx.workspaces.create({ path })).workspaceId) }
            catch (e) { setError(e.message) } finally { setAdding(false) }
          }
          const archive = async (owner, sessionId, restore) => {
            setError(''); setAdding(true)
            try {
              if (restore) await ctx.uiWorkspace.unarchiveSession(sessionId)
              else {
                const state = data.projects?.checkouts ? await api({ action: 'checkout-info', workspaceId: owner.workspaceId, dshSessionId: sessionId }) : null
                const owned = state?.trees.filter(w => w.owned) ?? []
                const note = [tt(!owned.length && state?.trees.some(w => w.shared) ? 'shareArchive' : 'archiveChatConfirm'), catalog.byId[sessionId]?.displayTitle || sessionId, ...owned.map(w => w.path + ' · ' + w.branch), owned.length ? tt('treeArchiveRisk') : null].filter(Boolean).join('\n\n')
                if (!window.confirm(note)) return
                await ctx.uiWorkspace.archiveSession(sessionId, { stopActivity: false })
              }
              if (data.projects?.checkouts) { showArchived(!restore); filterPins(false); inspect(sessionId); setCheckoutId(null); setScriptsId(null) }
            } catch (e) { setError(e.message) } finally { setAdding(false) }
          }
          const submit = async e => {
            e.preventDefault(); setPartial(null)
            if (!project || !provider || model !== draft.model) { setError(tt('unavailableProfile')); return }
            const result = await run({ action: 'project-launch', workspaceId: project.workspaceId, providerId: provider.id, title: draft.title, model, effort: draft.effort || undefined,
              isolation: draft.isolation, ...(draft.isolation === 'worktree' ? { branch: draft.branch, from: draft.from } : {}) })
            if (result?.ready) ctx.uiWorkspace.openSession(result.sessionId)
            else if (result) setPartial(result)
          }
          const choice = (label, value, options, change) => h('label', { className: 'aw-field' }, h('span', null, tt(label)), h('select', { className: 'aw-select', value, disabled: busy || adding, onChange: e => change(e.target.value) }, options.map(([id, name]) => h('option', { key: id, value: id }, name))))
          const input = (key, label, maxLength) => h('label', { className: 'aw-field' }, h('span', null, tt(label)), h(Input, { className: 'aw-input', maxLength, value: draft[key], disabled: busy, onChange: e => field(key, e.target.value) }))
          const related = new Map()
          for (const s of data.sessions) if (s.native && !s.native.retired && !related.has(s.native.sessionId)) related.set(s.native.sessionId, s)
          const hidden = new Set(workspaces.archivedSessionIds)
          const pinned = new Set(workspaces.pinnedSessionIds), words = query.toLowerCase().trim().split(/\s+/u).filter(Boolean)
          const groups = (scope === 'all' ? workspaces.items : project ? [project] : []).map(owner => {
            const members = []
            for (const id of owner.sessionIds) {
              if (hidden.has(id) !== archived || (pinsOnly && !pinned.has(id))) continue
              const row = catalog.byId[id], s = related.get(id), engine = s && (data.providers.find(p => p.id === s.providerId)?.label || s.providerId)
              const title = row?.title || row?.displayTitle || s?.title || id
              const fields = [title, owner.title, owner.path, id, engine, s?.providerId, s?.cwd, row?.cwd].filter(Boolean).map(v => v.toLowerCase())
              if (words.every(word => fields.some(value => value.includes(word)))) members.push({ id, title, row, s, engine })
            }
            // Pinning is owned by DSH. Keep the workspace's own order inside each block.
            members.sort((a, b) => Number(pinned.has(b.id)) - Number(pinned.has(a.id)))
            return { owner, members }
          }).filter(group => group.members.length)
          const count = groups.reduce((n, g) => n + g.members.length, 0), filtered = words.length > 0 || pinsOnly
          const [selectionView, setSelectionView] = React.useState(null)
          const batchKey = scope === 'project' && data.projects?.reviewWritable && (archived || data.projects.checkouts) ? JSON.stringify([project?.workspaceId, archived, query, pinsOnly]) : null
          const selecting = !!batchKey && batchKey === selectionView
          React.useEffect(() => setSelectionView(null), [batchKey])
          const sessionMenu = (id, row, title) => renderFactorySlot?.('contextMenu.button', { target: { kind: 'session', value: { sessionId: id, displayTitle: row.title || '' } }, label: tt('agentMenu', { name: title }), size: 'sm' })
          return h('div', { className: 'aw-stack' }, h('section', { className: 'aw-box' },
            h('div', { className: 'aw-row' }, h('h2', { className: 'aw-grow' }, tt('projects')), h(Button, { size: 'sm', variant: 'ghost', disabled: busy || adding, onClick: add }, tt('addProject'))),
            project ? h(React.Fragment, null, choice('chooseProject', project.workspaceId, workspaces.items.map(w => [w.workspaceId, w.title]), changeProject), h(ProjectTitle, { key: project.workspaceId, project, items: workspaces.items, useWorkspaceAccess }),
              h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'primary', disabled: busy || !provider || !data.projects?.enabled, 'aria-expanded': form, onClick: () => { setForm(!form); setPartial(null) } }, tt('newAgent')),
                scheduleAccess?.catalog && data.projects?.schedule ? h(Button, { size: 'sm', variant: 'outline', 'aria-expanded': scheduling, onClick: () => showSchedules(!scheduling) }, tt('schedules')) : null)) : h('p', { className: 'aw-note' }, tt(workspaces.phase === 'ready' ? 'noProject' : 'loading')),
            (error || workspaces.error) ? h('p', { role: 'alert', className: 'aw-error' }, error || workspaces.error.message) : null),
            project && data.projects?.review && !form && !scheduling ? h(ProjectResults, { key: project.workspaceId, project, data, hidden, catalog, busy, run }) : null,
            project && scheduling && scheduleAccess?.catalog && data.projects?.schedule ? h(ProjectSchedules, { key: project.workspaceId, project, catalog, hidden, access: scheduleAccess }) : null,
            project && form ? h('form', { className: 'aw-box', onSubmit: submit }, h('h2', null, tt('newAgent')), h('div', { className: 'aw-form' },
              choice('profiles', draft.profileId, [['', tt('customLaunch')], ...profiles.map(p => [p.id, p.name])], applyProfile),
              choice('engine', provider?.id, data.providers.map(p => [p.id, p.label]), v => field('provider', v)),
              choice('model', model, [['default', tt('cliDefault')], ...(provider?.models ?? []).filter(m => m.id !== 'default').map(m => [m.id, m.name ?? m.id])], v => field('model', v)),
              efforts.length ? choice('effortChoice', draft.effort, [['', tt('cliDefault')], ...efforts.map(e => [e.id, e.name ?? e.id])], v => field('effort', v)) : null,
              input('title', 'agentName', 160), choice('checkout', draft.isolation, (data.projects?.worktree ? ['local', 'worktree'] : ['local']).map(v => [v, tt(v)]), v => field('isolation', v)),
              draft.isolation === 'worktree' ? h(React.Fragment, null, input('branch', 'branchName', 200), input('from', 'baseRef', 250)) : null),
              h('details', { className: 'aw-tech' }, h('summary', null, tt('saveProfile')), input('profileName', 'profileName', 80), h('div', { className: 'aw-row' },
                h(Button, { type: 'button', size: 'sm', disabled: busy || !provider || !draft.profileName.trim(), onClick: saveProfile }, tt('saveProfile')),
                draft.profileId ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: removeProfile }, tt('removeProfile')) : null)),
              h('p', { className: 'aw-note' }, tt('launchHint')), partial ? h('div', { className: 'aw-error', role: 'alert' }, tt('projectFailed'), ' ', partial.error, ' ', h(Button, { size: 'sm', type: 'button', onClick: () => ctx.uiWorkspace.openSession(partial.sessionId) }, tt('openConversation'))) : null,
              h(Button, { type: 'submit', variant: 'primary', size: 'sm', disabled: busy || !provider || !!partial || model !== draft.model || (draft.isolation === 'worktree' && !data.projects?.worktree) }, tt('createAgent'))) : null,
            project ? h('section', { className: 'aw-box aw-agent-finder', 'aria-label': tt('findAgent') }, h('div', { className: 'aw-row' }, h('h2', { className: 'aw-grow' }, tt('agents')), h(Button, { size: 'sm', variant: 'ghost', 'aria-pressed': archived, onClick: () => { showArchived(!archived); filterPins(false) } }, tt('projectArchive'))),
              h('div', { className: 'aw-row' }, h(Input, { type: 'search', className: 'aw-input aw-grow', value: query, 'aria-label': tt('findAgent'), placeholder: tt('findAgentHint'), onChange: e => search(e.target.value) }),
                h('select', { className: 'aw-select', value: scope, 'aria-label': tt('finderScope'), onChange: e => setScope(e.target.value) }, h('option', { value: 'project' }, tt('hereProjects')), h('option', { value: 'all' }, tt('everyProject'))),
                !archived && h(Button, { size: 'sm', variant: pinsOnly ? 'outline' : 'ghost', 'aria-pressed': pinsOnly, onClick: () => filterPins(!pinsOnly) }, tt('onlyPinned'))),
              h('div', { className: 'aw-row' }, h('span', { role: 'status', className: 'aw-note' }, count ? tt('finderCount', { n: count }) : tt(filtered ? 'finderNoMatch' : 'noAgents')), filtered && h(Button, { size: 'sm', variant: 'ghost', onClick: () => { search(''); filterPins(false) } }, tt('finderReset'))),
              batchKey && h(ArchiveBatch, { key: batchKey, project, members: groups[0]?.members ?? EMPTY, archived, data, busy: busy || adding, useSessionAccess, open: selecting, show: value => setSelectionView(value ? batchKey : null) }),
              !selecting && groups.map(({ owner, members }) => h('div', { key: owner.workspaceId, className: 'aw-section' }, scope === 'all' ? h('div', { className: 'aw-row' }, h('strong', { className: 'aw-strong' }, owner.title), h(PathLabel, { path: owner.path })) : null,
              members.map(({ id, title, row, s, engine }) => {
                const target = projectConversationTarget(id, row, s)
                return h(React.Fragment, { key: id }, h('div', { className: 'aw-inbox-row' }, h('button', { type: 'button', className: 'aw-item', disabled: archived, title: archived ? tt('archivedOpen') : title, onClick: () => ctx.uiWorkspace.openSession(target) },
                  h('span', { className: 'aw-item-top' }, h(StateDot, { state: s ? DOT[s.state] ?? 'idle' : row?.running ? 'ongoing' : 'idle', size: 8 }), h('strong', { className: 'aw-ellipsis' }, title), !archived && pinned.has(id) ? h(Tag, { tone: 'quiet' }, tt('isPinned')) : null),
                  h('span', { className: 'aw-item-sub aw-ellipsis' }, s ? [engine, activityLabel(s), s.cwd].join(' · ') : tt('nativeChat'))),
                  row && sessionMenu(id, row, title),
                  !archived && h(TerminalListToggle, { sessionId: id, open: terminalId === id, toggle: () => setTerminalId(terminalId === id ? null : id), useSessionAccess }),
                  data.projects?.fileSearch && !archived ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': fileId === id, onClick: () => setFileId(fileId === id ? null : id) }, tt('findFile')) : null,
                  data.projects?.checkouts ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': inspectId === id, onClick: () => inspect(inspectId === id ? null : id) }, tt('treeInspect')) : null,
                  data.projects?.changes && !archived ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': checkoutId === id, onClick: () => setCheckoutId(checkoutId === id ? null : id) }, tt('checkoutDiff')) : null,
                  data.projects?.scripts && !archived ? h(Button, { variant: 'ghost', size: 'sm', 'aria-expanded': scriptsId === id, onClick: () => setScriptsId(scriptsId === id ? null : id) }, tt('scripts')) : null,
                  s ? h(Button, { variant: 'ghost', size: 'sm', onClick: () => onRecord(s.id) }, tt(s.activity.group === 'attention' ? 'attention' : 'viewTimeline')) : null,
                  h(Button, { size: 'sm', variant: 'ghost', disabled: busy || adding || (!archived && !!row?.running), onClick: () => archive(owner, id, archived) }, tt(archived ? 'restoreChat' : 'archiveChat'))),
                  !archived && terminalId === id ? h(ProjectTerminals, { key: 'terminals:' + owner.workspaceId + ':' + id, sessionId: id, target, useSessionAccess }) : null,
                  data.projects?.fileSearch && !archived && fileId === id ? h(ProjectFileFinder, { key: owner.workspaceId + ':' + id, workspaceId: owner.workspaceId, sessionId: id, target }) : null,
                  data.projects?.checkouts && inspectId === id ? h(CheckoutDetails, { key: id + ':' + archived, workspaceId: owner.workspaceId, sessionId: id, archived, writable: data.projects.reviewWritable, membership: owner.sessionIds.filter(sid => !hidden.has(sid)).join(':'), group: { workspaceId: owner.workspaceId, enabled: data.projects.sharing, writable: data.projects.reviewWritable, providers: data.providers, catalog, related } }) : null,
                  data.projects?.changes && !archived && checkoutId === id ? h(ReviewCheckout, { key: id, sessionId: id }) : null)
              })))) : null, !archived && scriptsId && groups.some(g => g.members.some(m => m.id === scriptsId)) ? h(ProjectScripts, { key: scriptsId, sessionId: scriptsId, useSessionAccess, targetFor: id => projectConversationTarget(id, catalog.byId[id], related.get(id)) }) : null)
        }

        function Page({ useRemoteAccess = () => false, useSessionAccess, useWorkspaceAccess, renderFactorySlot }) {
          const scheduleAccess = { catalog: useRemoteAccess('schedule/catalog'), create: useRemoteAccess('schedule/create'), edit: useRemoteAccess('schedule/edit'),
            run: useRemoteAccess('schedule/run'), history: useRemoteAccess('schedule/history'), preset: useRemoteAccess('agentPresets/list') }
          const tt = useT()
          const online = useOnline()
          const [tab, setTab] = React.useState('projects')
          const [selected, setSelected] = React.useState(null)
          const [busy, setBusy] = React.useState(false)
          const inFlight = React.useRef(false)
          const [error, setError] = React.useState('')
          const view = useWorkbench(tab === 'records' ? selected : null)
          const run = async op => {
            if (inFlight.current) return null
            inFlight.current = true
            setBusy(true); setError('')
            try { const result = await api(op); view.refresh(); return result }
            catch (failure) { setError(failure.message); return null }
            finally { inFlight.current = false; setBusy(false) }
          }
          const problem = error || view.error
          return h('div', { className: 'acpw aw-page' }, h('div', { className: 'aw-page-inner' },
            h('header', { className: 'aw-head' },
              h('div', { className: 'aw-grow' }, h('h1', null, tt('panel')), h('p', { className: 'aw-note' }, tt('panelHint'))),
              h('span', { className: 'aw-live', role: 'status' }, h(StateDot, { state: online === 'live' ? 'done' : 'warning', size: 8 }), tt(online))),
            h(SegmentedTabs, { className: 'aw-tabs', size: 'sm', label: tt('panel'), value: tab, onChange: setTab, items: [
              { value: 'projects', label: tt('projects'), id: 'aw-tab-projects', panelId: 'aw-panel-projects' },
              { value: 'records', label: tt('tabRecords'), id: 'aw-tab-records', panelId: 'aw-panel-records' },
              { value: 'providers', label: tt('tabProviders'), id: 'aw-tab-providers', panelId: 'aw-panel-providers' },
            ] }),
            view.data.storageError ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), tt('storageError', { message: view.data.storageError })) : null,
            problem ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), problem, view.error ? h(Button, { size: 'sm', variant: 'ghost', onClick: view.refresh }, tt('retry')) : null) : null,
            h('div', { role: 'tabpanel', id: `aw-panel-${tab}`, 'aria-labelledby': `aw-tab-${tab}` },
              !view.ready ? (view.error ? null : h('p', { className: 'aw-empty', role: 'status' }, tt('loading'))) : tab === 'providers'
                ? h('div', { className: 'aw-stack' },
                  h('div', { className: 'aw-banner' }, h(IconInfoOutlineRegular, { size: 14 }),
                    h('div', { className: 'aw-banner-text' }, h('span', null, tt('engineHint')), h('span', null, tt('delegateHint')), h('span', null, tt('warning')), h('span', null, tt('scopeOnce')))),
                  h(ProvidersTab, { providers: view.data.providers, run, busy, cwdHint: view.data.sessions[0]?.cwd, onImported: id => { setSelected(id); setTab('records') } }))
                : tab === 'projects' ? h(Projects, { data: view.data, run, busy, scheduleAccess, useSessionAccess, useWorkspaceAccess, renderFactorySlot, onRecord: id => { setSelected(id); setTab('records') } })
                : h(ActivityInbox, { view, run, busy, selected, onSelect: setSelected, providers: view.data.providers, onSetup: () => setTab('providers') }))))
        }
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: NS, locale: NS }, Page))
        function Icon({ size = 16 }) {
          return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
            h('rect', { x: 3, y: 4, width: 18, height: 13, rx: 2 }), h('path', { d: 'm7 8 3 2.5L7 13m6 0h4M8 21h8m-4-4v4' }))
        }
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: NS, order: 46, locale: NS, label: () => t('panel') }, Icon))
      },
    }
  },
})
