window.__ModuleLoader__.load({
  id: 'dsh-acp-workbench',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, CodeBlock, DiffBlock, DisclosureRow, Input, JsonBlock, MarkdownText, Menu, Modal, PathLabel, ReadBlock, SearchBlock, SegmentedTabs, StateDot, Switch, Tag, TerminalBlock, TextShimmer, Tooltip, WebBlock, diffTotals, extractMarkdownPlainText,
      IconBranchOutlineRegular, IconBrowseOutlineRegular, IconCheckOutlineRegular, IconChecklistOutlineRegular, IconClockOutlineRegular, IconCloseOutlineRegular, IconCodeOutlineRegular, IconEditOutlineRegular, IconGlobeOutlineRegular, IconInspectOutlineRegular, IconPlayOutlineRegular, IconRightUpOutlineRegular, IconSearchOutlineRegular, IconSparkleRegular, IconStopFillRegular, IconUsersOutlineRegular,
      IconChevronDownOutlineRegular, IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular, IconChevronUpOutlineRegular, IconInfoOutlineRegular, IconPlusOutlineRegular,
      IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const NS = 'acp-workbench'

    const en = {
      startWithPort: 'Run with loopback port', confirmPort: 'Assign a free loopback port to PASEO_PORT with HOST=127.0.0.1 and start this command?', watchPort: 'Watch port', unwatchPort: 'Stop watching', portPending: 'Waiting for port', portCheckAgain: 'Retrying port check', portAccepts: 'TCP connection accepted', portRefused: 'TCP connection refused', portTimeout: 'No TCP response', portFailed: 'Port check unavailable', portHint: 'Checks TCP connectivity on the assigned loopback port.',
      refreshComparison: 'Refresh comparison', commitScope: 'Branch commits', commitStart: 'Commit to review', commitEnd: 'Through commit', chooseCommit: 'Choose a commit', commitOnly: 'Just this commit', rangeSize: '{n} commits', commitHint: 'Shows Git history from the first commit’s parent through the selected commit.', noBranchCommits: 'No commits after this base. Choose an earlier base branch to look further back.', commitTruncated: 'Showing the newest {n} commits.', commitMissing: 'The selected commits no longer form one first-parent range. Choose a commit again.', commitHeadMoved: 'The branch head changed while reading commits. Refresh the comparison.', commitVersion: 'Committed file · {sha}',
      recordedFile: 'File on disk now', recordedLocation: 'Opens the current file on disk at the recorded line.', reportedHits: 'Go to search results ({n})', moreTargets: 'Show more locations', lineGone: 'Line {n} no longer exists in this file.', fileStart: 'Read from the first line', fileChanged: 'The file changed while reading. Reopen its location to reload.',
      beforeFile: 'View old side', beforeAt: 'View old {path} at line {n}', beforePatch: 'Old lines in this patch', beforeWhole: 'Deleted text from this patch', beforeHint: 'Captured patch lines with line numbers from the old file.', beforeFull: 'Read full old version', beforeNone: 'This patch has no old text lines.', beforeIndex: 'Old side · Git index', beforeCommit: 'Old side · commit {sha}', beforeSnapshot: 'Read-only Git snapshot.', beforeIndexHint: 'Read-only Git index snapshot.', beforeGap: 'Old lines {from}–{to} are not in the patch.', beforeLimited: 'Exact old commit unavailable; showing captured patch lines only.',
      reviewFile: 'View file', reviewIndex: 'Staged version (Git index)', reviewDisk: 'Current checkout file', reviewAt: 'View {path} at line {n}', reviewFull: 'Open in Files sidebar', reviewDeleted: 'Deleted in this comparison.', reviewStale: 'This file no longer matches the patch. Refresh the comparison.', reviewPath: 'Cannot locate this file in the reviewed checkout.', reviewEmpty: 'Empty file', reviewPatch: 'Copyable patch', reviewNext: 'Next lines', reviewPrev: 'Previous lines', reviewBack: 'Close file preview', reviewBinary: 'No text lines to navigate.',
      cliTasks: 'CLI tasks in this trace', cliTaskCount: '{n} launch calls', cliLaunchStatus: 'Launch call: {status}', cliTask: 'CLI task', cliOnly: 'View task', cliAll: 'Full trace', cliCalls: '{n} direct calls', cliProgress: 'Task update', cliInput: 'Task input', cliMedia: '{type} · see raw events', cliPreview: 'Preview {type}', cliNoMedia: 'The recorded content is unavailable.', cliLimit: 'Excerpt only · see raw events', cliScope: 'Direct CLI task activity (read-only).', cliOrigin: 'From {task}', cliMissing: 'Launch not in this trace: {task}', cliConflict: 'Conflicting task IDs',
      permitRequested: 'Permission requested', permitLive: 'Needs approval', permitAllowed: 'Allowed', permitAutomatic: 'Allowed by preset', permitDenied: 'Denied', permitExpired: 'Request expired', permitAnswered: 'Decision recorded',
      callView: 'Tool call display', compactCalls: 'Overview', detailedCalls: 'Individual calls', exploration: 'Exploration', readCount: 'Reads: {n}', searchCount: 'Searches: {n}', webCount: 'Web: {n}', distinctPaths: 'Distinct read paths: {n}', groupCalls: '{n} calls', 'call.cancelled': 'Cancelled',
      panel: 'ACP Workbench', panelHint: 'Configure local ACP CLI providers, inspect capabilities, and manage models shown in the DSH picker.',
      schedules: 'Scheduled agents', schDescription: 'Delivers instructions to a DSH conversation on schedule. Delivery does not wait for completion.', schNew: 'Create schedule', schName: 'Task name', schPrompt: 'Instructions at delivery', schTarget: 'Destination', schExisting: 'An existing conversation (heartbeat)', schOnce: 'Create a conversation on the first delivery', schFresh: 'A fresh conversation at every delivery', schChoose: 'Choose a conversation', schPreset: 'DSH agent preset', schDefault: 'Host default', schRouteHint: 'Existing conversations keep their engine and directory. New ones use the project directory and DSH preset.', schTiming: 'Repeat', schAfter: 'Once, after a delay', schEvery: 'At a fixed interval', schDaily: 'Daily at a local time', schCron: 'Cron in a time zone', schMinutes: 'Minutes', schZone: 'IANA time zone', schTime: 'Local time', schExpr: 'Cron (5 fields)', schConfirm: 'Arm this schedule? Each delivery triggers an agent turn.', schUnknown: 'No confirmation received. Refresh the list before trying again.', schEmpty: 'No tasks target this project.', schRefresh: 'Refresh schedules', schActive: 'Active', schPaused: 'Paused', schEnded: 'Ended', schNext: 'Next delivery', schDelivered: 'Last delivery', schQueued: 'Queued or running', schManage: 'Manage task', schPause: 'Pause', schResume: 'Resume', schRun: 'Deliver now', schRunConfirm: 'Deliver these instructions now?', schIncomplete: 'Enter a title, instructions, a valid time and an available destination.', schMissing: 'This task was removed or changed. Refresh before retrying.', schFloor: 'Can deliver again after', schBusy: 'Delivery is already queued, or the minimum delivery interval has not elapsed.', schCadence: 'Cadence', schHistory: 'Delivery history', schNoHistory: 'No saved deliveries yet.', schMore: 'Earlier deliveries', schPruned: 'Some older deliveries are unavailable.', schDelete: 'Delete task', schDeleteConfirm: 'Delete this task and its delivery history? Messages already delivered remain in their conversations.',
      termList: 'Session terminals', termRetry: 'Retry terminal list', termScope: 'Terminals retained by DSH for this conversation.', termEmpty: 'No terminal is retained for this conversation.', termAgent: 'Started by agent', termUser: 'Started by user', termAgentControl: 'Agent control', termLost: 'Terminal roster disconnected.', termMissing: 'This terminal cannot be opened in its conversation.',
      scripts: 'Project scripts', scriptsHint: 'Commands in paseo.json run in the session sandbox. Services using $PASEO_PORT can launch with an assigned loopback port and TCP check.', scriptNone: 'No named scripts in this checkout’s paseo.json.', scriptStart: 'Run', scriptStop: 'Stop process', scriptLog: 'Read output', scriptTerminal: 'Open terminal', scriptConfirm: 'Run this command in a new DSH terminal?', stopScriptConfirm: 'Stop this script and close its terminal?', scriptService: 'Service', scriptTask: 'Script', runHere: 'Owner conversation', scriptUnavailable: 'Terminal no longer retained', scriptExited: 'Exited', scriptStopped: 'Stopped', scriptRunning: 'Running', scriptStarting: 'Starting', scriptFailed: 'Failed', scriptOwner: 'Under manual control', noOutput: 'No output retained', scriptRefresh: 'Refresh scripts', scriptLoading: 'Reading scripts…', scriptExit: 'Exit code',
      projects: 'Projects', addProject: 'Add directory', chooseProject: 'Workspace', agents: 'Conversations', newAgent: 'New agent', local: 'Project directory', worktree: 'Isolated worktree', checkout: 'Isolation', branchName: 'New branch (optional)', baseRef: 'Start from (default: HEAD)', agentName: 'Conversation title (optional)', createAgent: 'Create and open chat', launchHint: 'Creates a new conversation without sending a message.', noProject: 'Add a project directory to start an agent.', noAgents: 'No conversations here yet.', projectFailed: 'Setup stopped. The conversation was kept.', nativeChat: 'DSH conversation', cliDefault: 'CLI default', projectArchive: 'Archived', profiles: 'Launch profile', customLaunch: 'Custom settings', profileName: 'Profile name', saveProfile: 'Save launch settings', removeProfile: 'Delete profile', removeProfileConfirm: 'Delete this launch profile? Existing conversations are unchanged.', unavailableProfile: 'This profile is unavailable. Check its provider, model and worktree support.', effortChoice: 'Reasoning effort', projectTools: 'Workspace tools', filesTab: 'Files', terminalTab: 'New terminal', changesTab: 'Git changes', archiveChat: 'Archive conversation', archiveChatConfirm: 'Archive this DSH conversation? DSH may reclaim an unused, clean managed worktree.', restoreChat: 'Restore conversation',
      shareCheckout: 'Start another agent here', shareHeading: 'Agents in this worktree', sharedCheckout: 'Shared worktree', shareOwner: 'Creator', shareCurrent: 'Selected conversation', shareOpen: 'Create and open conversation', shareDismiss: 'Close form', switchShared: 'Switch agent in this worktree', noSharedPeers: 'No other active participants in this checkout.', shareHint: 'Shared worktree: each agent edits the same files with its own conversation, CLI context, and approvals.', shareArchive: 'Archive this conversation? Its shared worktree belongs to another conversation and will remain intact.', sharePartial: 'This conversation did not finish joining the checkout. Start a new conversation from an active participant.',
      treeInspect: 'Working directory', treeActual: 'Effective directory', treeSource: 'Source checkout', treeRecorded: 'Recorded branch', treeBase: 'Base commit', treeOwned: 'Created here', treeInherited: 'Inherited reference', treeOther: 'Not the current directory', treeDirectory: 'Directory exists', treeMissing: 'Directory missing', treeIncomplete: 'Directory present without a linked-checkout marker', treeOccupied: 'Occupied by a non-directory or symlink', treeEmpty: 'No managed worktree creation in this session’s history.', treeScheduled: 'Checking whether the checkout can be reclaimed…', treeRetained: 'DSH kept the checkout.', treeRemoved: 'DSH removed the checkout directory (branch kept).', treeFailed: 'Cleanup failed. A partial directory may remain; inspect it before continuing.', treeNoReceipt: 'No cleanup receipt from this Host session.', treeRestoreFirst: 'Restore the conversation first before rebuilding its worktree.', treeRestore: 'Rebuild missing worktree', treeRestoreAsk: 'Rebuild the missing directory from its recorded branch? If the branch is gone, DSH recreates it at the base commit. Uncommitted changes cannot be recovered.', treeRebuilt: 'Restored the checkout from its existing branch.', treeRecreated: 'Original branch was gone; recreated at the base commit.', treeBusy: 'Rebuilding the worktree…', treePolicy: 'The conversation must be idle and writable to rebuild its checkout.', treeArchiveRisk: 'Modified or untracked files and active peer sessions prevent reclamation. Git-ignored files are not protected; back them up or enable retain-on-archive first.',
      projectResults: 'Project review', unseen: 'Awaiting review', reviewed: 'Reviewed', markSeen: 'Mark reviewed', resultHistory: 'All results', resultTurn: 'Turn {n}', previousPage: 'Previous page', nextPage: 'Next page', noResults: 'No results to review.', noAllResults: 'No finished ACP runs in this project yet.', reviewHint: 'Each finished run is listed separately. Opening a card does not mark it reviewed or answer requests.', runTrace: 'Run trace', checkoutDiff: 'Checkout changes', gitScope: 'Compare', uncommitted: 'Working tree vs HEAD', staged: 'Staged', unstaged: 'Unstaged', branchDiff: 'Branch vs base', baseBranch: 'Base branch', autoBase: 'Forge default', findBase: 'Find a branch', checkoutHint: 'Live Git status of this checkout (may include changes from other agents).', diffClean: 'No changes in this comparison.', diffOmitted: '{n} untracked files omitted by Forge.', binaryDiff: 'Binary file', largeDiff: 'File exceeds the diff limit', noHunks: 'No text hunks', moreLines: 'Show more lines', moreFiles: 'Show more files', projectRequests: 'Waiting for your response', checkoutUnavailable: 'Git changes are unavailable.',
      attention: 'Needs you', working: 'In progress', review: 'Review', recent: 'Recent', history: 'History', all: 'Current',
      attentionHint: 'Actions here reply directly to the waiting CLI.',
      recoveryHint: 'Check the last turn before continuing; reconnecting does not resend input.',
      firstTurn: 'Send your first message in the composer to start. The CLI uses its own tools and file access.', archivedHint: 'This binding is archived. Restore it to continue using its context.',
      openConversation: 'Open conversation', openRoot: 'Open parent tree', retry: 'Refresh', connectingFeed: 'Connecting…',
      cliOptions: 'CLI settings', hideOptions: 'Close CLI settings', connectOnly: 'Connect without sending a message',
      forkHere: 'Continue in a copy', forkHint: 'Copies the CLI’s latest saved history into a new context without modifying the original.', forkSource: 'Copied from CLI history', resumeExisting: 'Continue a CLI session', resumeHere: 'Continue here', closeHistory: 'Hide sessions',
      previousMessages: 'Previous CLI messages', hidePrevious: 'Hide previous messages', noReplay: 'No earlier messages returned in this page of CLI history.',
      resumePick: 'Connects to a CLI session in this directory; your next message continues that thread.',
      firstUse: 'Choose an ACP model in the DSH model picker and send a message. Its activity will appear here.',
      setup: 'Manage providers', answeredByPreset: 'Full access · automatic', answeredByUser: 'Human response',
      quietChildren: 'Other subagents ({n})', requestCount: '{n} waiting',
      scopeOnce: 'Full access auto-approves one-time requests; persistent choices still ask.',
      tabProviders: 'Providers', tabRecords: 'Activity', live: 'Live', offline: 'Reconnecting…',
      engine: 'ACP engine',
      engineHint: 'Pick an ACP model in the normal model picker to use the standard composer, attachments, and Stop button.',
      delegateHint: 'Delegate across native DSH and ACP CLIs (Cursor, Antigravity, Claude Code) in any direction via spawn_agent, list_providers, send_message, list_agents, and read_agent_result.',
      warning: 'External CLIs run outside the DSH sandbox with their own login, tools, and file access.',
      connect: 'Connect', reconnect: 'Reconnect', disconnect: 'Disconnect',
      newContext: 'New external context', newContextConfirm: 'Start a new external context from the next message? DSH history and earlier records are kept.',
      configuration: 'Configuration', commands: 'CLI commands', directory: 'Directory',
      noConfig: 'Connect to load the models, modes and options this CLI advertises.',
      cliCommandGroup: 'CLI · {name}', cliCommandStale: 'Select this CLI command again from the / menu.',
      model: 'Model', mode: 'Mode', commandPick: 'Command…', commandArgs: 'Arguments', commandRun: 'Run',
      commandHint: 'Sent to the external CLI as a normal message. Slash commands typed in the composer stay in DSH.',
      'notice.feed': 'CLI session notices', 'notice.recent': 'Latest 8 off-turn notices on this connection.', 'notice.info': 'Info', 'notice.warning': 'Warning', 'notice.error': 'Error', 'notice.level': 'CLI · {level}', 'notice.turn': 'Received during this prompt', 'notice.connect': 'Received while connecting', 'notice.session': 'Received between prompts', 'notice.fromTask': 'CLI task: {id}', 'notice.unavailable': 'Could not find this notice in the local record.',
      'compact.late': 'Updated by the CLI after this turn.', 'compact.title': 'CLI context compaction', 'compact.replay': 'Replayed CLI compaction', 'compact.summary': 'Reported summary', 'compact.noSummary': 'No summary in these reports.', 'compact.in_progress': 'Compacting', 'compact.unsettled': 'Last reported in progress', 'compact.completed': 'Compacted', 'compact.failed': 'Compaction failed', 'compact.cancelled': 'Compaction cancelled', 'compact.automatic': 'Automatic', 'compact.manual': 'Manual', 'compact.idle': 'While idle', 'compact.preTokens': 'Before: {n} tokens', 'compact.postTokens': 'After: {n} tokens', 'compact.durationMs': 'Duration: {n} ms', 'compact.attachment': 'Preview attachment · {type}', 'compact.noMedia': 'The recorded attachment is unavailable.',
      contextRecent: 'CLI context · last report', contextRecorded: 'Reported CLI context', contextReplay: 'Context in replayed history', ctxAt: 'Reported at {time}', ctxScope: 'Context window usage (not billing or quota).', ctxCost: 'Cumulative session cost: {amount} {unit}', ctxTotals: 'CLI session token totals', ctxTotalsScope: 'Cumulative session totals reported at the end of this turn.', ctxTotal: 'Total', ctxInput: 'Input', ctxOutput: 'Output', ctxCacheRead: 'Cache read', ctxCacheWrite: 'Cache write', ctxThought: 'Reasoning', ctxModel: 'Reported model: {model}',
      usageContext: 'Context {used} / {size} ({percent}%)', usageCost: 'Cost {amount} {currency}',
      unknownUsage: 'Not reported by this agent.',
      children: 'ACP subagents', childrenWaiting: '{n} waiting', childrenRunning: '{n} in progress', childrenReview: '{n} to review', childrenDone: '{n} completed', childrenIdle: '{n} idle', stop: 'Stop', pending: 'Needs you', expand: 'Show trace', collapse: 'Hide trace',
      'state.starting': 'Connecting', 'state.idle': 'Ready', 'state.running': 'Running', 'state.waiting': 'Needs your response',
      'state.canceling': 'Stopping', 'state.disconnected': 'Disconnected', 'state.error': 'Error', 'state.preparing': 'Preparing',
      'state.completed': 'Completed', 'state.interrupted': 'Interrupted', 'state.failed': 'Failed',
      trace: '{name} execution', traceTools: '{n} tool calls', traceTool: '1 tool call', traceFiles: '{n} files in diffs', traceFile: '1 file in diffs',
      replyCollapsed: '{name} reply collapsed', replyLines: '{n} lines', replyImages: '{n} images', collapseReply: 'Collapse result', expandReply: 'Expand result', collapseExcerpt: 'Collapse reply', expandExcerpt: 'Show full excerpt', collapseTrace: 'Collapse trace',
      handoff: 'DSH context handed off', sameContext: 'Same external context',
      viewTimeline: 'Timeline', viewRaw: 'Raw events', older: 'Load earlier', loading: 'Loading…',
      noEvents: 'No execution events yet.', noActivity: 'No tool activity in this turn.',
      stderr: 'CLI log output', stopReason: 'Turn ended: {reason}', turnError: 'Agent error: {message}', configError: 'Setting refused: {message}',
      planItems: 'Task checklist', planDocument: 'Plan document', planRemoved: 'Plan removed by CLI', planRecorded: 'Plan reported by the CLI.', planOpenFile: 'View current file', planDone: 'Done', planDoing: 'In progress', planPending: 'Pending', planEmpty: 'No listed steps.', morePlanItems: 'Show more steps',
      plan: 'Plan', highPriority: 'High', planProgress: '{done} of {total}',
      'call.read': 'Read file', 'call.search': 'Search', 'call.edit': 'Edit file', 'call.write': 'Write file', writeView: 'Write details', writeInput: 'Requested file content', writePatch: 'Reported patch', writeEmpty: 'The requested content is empty.', 'call.delete': 'Delete', 'call.move': 'Move',
      'call.execute': 'Terminal', 'call.fetch': 'Web', 'call.think': 'Reasoning', 'call.switch_mode': 'Switch mode',
      'call.pending': 'Queued', 'call.in_progress': 'Running', 'call.unfinished': 'No final status', 'call.completed': 'Completed', 'call.failed': 'Failed',
      'patch.launch': 'Launch preview', 'patch.update': 'Patch from a CLI update', 'patch.completed': 'Patch in completion report', 'patch.failed': 'Patch in failure report', 'patch.permission': 'Patch in this permission request', 'patch.recorded': 'Reported patch', patchCurrent: 'Open current file at a reported location', patchFiles: 'Patch files ({n})', patchAll: 'All reported fragments', patchParts: '{n} fragments', patchNoParts: 'No structured text diff for this file.', 'patch.add': 'Add file', 'patch.delete': 'Delete file', 'patch.move': 'Move file', 'patch.updateFile': 'Edit file',
      webSearch: 'Web search', webPage: 'Fetch page', webFind: 'Find in page', webQuery: 'Reported queries', webAddress: 'Page address', webPattern: 'Find on page', webPrompt: 'Requested extraction', webOffset: 'Starting character offset', webAllow: 'Allowed domains', webDeny: 'Blocked domains', webPreview: 'Request preview', webResponse: 'Tool report', webRaw: 'Raw tool output', webUpdate: 'Update from the tool', webFailure: 'Reported failure', webNoReport: 'No result text accompanied this call.', webMore: 'Show more sources ({n} remaining)', webSourceCount: '{n} reported sources',
      fileByName: 'Find by name', fileByDirectory: 'Browse folders', dirRoot: 'Checkout root', dirBack: 'Back to folder', dirHint: 'Lists one folder at a time. Dotfiles are hidden; Git-ignored entries are shown.', dirRefresh: 'Refresh folder', dirRestart: 'Reopen current checkout root', dirCount: '{n} visible entries', dirEmpty: 'No visible entries returned.', dirPartial: 'DSH returned only part of this directory.', dirFolder: 'Folder', dirFile: 'File', dirOther: 'Other', dirBytes: '{n} B', dirMore: 'Show more entries', fileRefresh: 'Repeat search',
      findFile: 'Find a file', fileQuery: 'File name or path', findFileHint: 'Searches this conversation’s current directory, excluding dotfiles and Git-ignored files.', foundFiles: '{n} files returned', fileHitsLimit: 'Result limit reached; narrow the search', fileScanCut: 'Only part of the directory was searched', moreFileHits: 'Show more files', fileHitsBack: 'Back to file results',
      'batch.archive': 'Archive several conversations', 'batch.restore': 'Restore several conversations', 'batch.confirm': 'Review selected conversations', 'batch.choose': 'Check at least one eligible conversation first.', 'batch.archiveNote': 'Archives selected conversations and removes pins. Active sessions and worktree sessions are skipped.', 'batch.restoreNote': 'Restores selected conversations without opening them or rebuilding worktrees.', 'batch.active': 'Active or awaiting input', 'batch.denied': 'No permission', 'batch.changed': 'Membership or archive state changed; refresh and check again.', 'batch.tree': 'Use the individual archive action to review this worktree.', 'batch.result': 'Results by conversation', 'batch.archived': 'Archived', 'batch.restored': 'Restored', 'batch.skipped': 'Not changed',
      findAgent: 'Find conversations', findAgentHint: 'Name, project, engine, directory or DSH session ID', hereProjects: 'This project', everyProject: 'All projects', finderScope: 'Search scope', onlyPinned: 'Pinned only', isPinned: 'Pinned', finderCount: '{n} conversations', finderNoMatch: 'No conversations match these filters.', finderReset: 'Clear filters', projectRename: 'Rename project', projectTitle: 'Project name', sameProjectTitle: 'Another project already has this name.', cancelEdit: 'Cancel', agentMenu: 'Actions for conversation {name}', archivedOpen: 'Restore this conversation before opening it.',
      'call.mcp': 'MCP tool', mcpArgs: 'Arguments', mcpOutput: 'Reported output', mcpContent: 'Display content', mcpStructured: 'Structured result', mcpRequest: 'Request details', mcpDisplayArgs: 'Arguments as displayed by the request', mcpAbsent: 'Raw arguments not provided', mcpTable: 'Records with the same fields', mcpEmpty: 'The tool returned no content blocks.', mcpEmptyDisplay: 'The CLI supplied no display blocks here.', mcpFields: '{n} fields', mcpItems: '{n} items', mcpMore: 'Show more', mcpLess: 'Collapse', mcpSource: 'MCP server',
      streamReport: 'Reported terminal output', finalReport: 'Output reported by the tool', outputView: 'Command output', outputTail: 'Earlier output omitted; showing the last 32 Ki characters.', outputPartial: 'Unknown packet format: showing the latest report and subsequent explicit deltas.', awaitingExit: 'No terminal exit reported',
      exitCode: 'Exit {n}', inspectData: 'Technical details', proposed: 'Requested change', imageResult: 'Tool result image',
      lineNumber: 'Line {n}', linesReturned: '{n} lines returned', pathsReturned: '{n} paths', hitsReturned: '{n} matches · {files} files', noHits: 'No results',
      'decision.accepted': 'Accepted', 'decision.rejected': 'Rejected', 'decision.cancelled': 'Cancelled', 'decision.skipped': 'Skipped', 'decision.answered': 'Answered',
      resource: 'Resource', noExit: 'Exit code not reported', noShellOutput: 'No output reported', terminalSignal: 'Signal {signal}', pathMore: '+{n} more',
      clearField: 'Clear selection', form: 'Question from the CLI', formOptional: 'Optional', formRequired: 'Required', formSubmit: 'Submit answers', formDecline: 'Decline to answer', formPreview: 'Preview option', formHelp: 'Submitted fields are sent to the CLI. Do not enter passwords or tokens.', formMin: 'Minimum: {n}', formMax: 'Maximum: {n}', 'form.accept': 'Answers submitted', 'form.decline': 'Declined to answer', 'form.cancel': 'Dismissed', formWithdrawn: 'Withdrawn by the CLI',
      permission: 'Permission request', question: 'Question from the agent', 'kind.plan': 'Plan for approval',
      permitLaunch: 'Inspect original tool call', permitEarlier: 'Snapshot from when the tool call started.', permitEmpty: 'The CLI did not include arguments, file locations or a preview in this request.', permitPast: 'Inspect permission request', permitReadOnly: 'Recorded request · read only', permitUnavailable: 'The matching permission record is unavailable.', permitCallId: 'Call ID', permitCwd: 'CLI directory', permitOptions: 'Choices offered by the CLI', permitScopeOnce: 'This request only', permitScopeRemember: 'May apply to later requests', permitGrant: 'Allow', permitRefuse: 'Deny', permitSelection: 'Recorded decision: {choice}', permitAutoSelection: 'Preset decision: {choice}',
      permanent: 'An “always” choice may be remembered by the CLI for later requests.',
      approve: 'Approve plan', reject: 'Reject', rejectReason: 'Reason (optional)', answer: 'Submit answers', skip: 'Skip', dismiss: 'Cancel request',
      'event.interaction': 'Asked: {title}', 'event.expired': 'Request expired',
      input: 'Input', output: 'Output', terminal: 'Terminal {id}', tool: 'Tool call',
      user: 'You', assistant: 'Agent', thinking: 'Reasoning', replay: 'History replay',
      truncated: '… {n} characters in total', copy: 'Copy', copied: 'Copied', wrap: 'Wrap lines', unwrap: 'Do not wrap', code: 'Code',
      expandLines: 'Show {n} more lines', collapseLines: 'Show less', expandLinesAria: 'Show {n} hidden lines', collapseLinesAria: 'Hide expanded lines',
      providerList: 'Providers', addProvider: 'New provider', editProvider: 'Edit provider', newProviderTitle: 'New provider',
      providerTemplates: 'Preset templates', providerTemplatesHint: 'Click a template to prefill command and arguments, then customize as needed.',
      providerTemplatesEditHint: 'Click a template to apply its default command and arguments while keeping this provider’s ID and name.',
      templateAdded: 'Added', templateBlank: 'Blank',
      fieldId: 'ID', fieldLabel: 'Display name', fieldCommand: 'Executable', fieldCommandHint: 'Absolute path or a name on PATH.',
      fieldArgs: 'Arguments', fieldArgsHint: 'JSON array of strings, for example ["acp"]. Do not put secrets here.',
      save: 'Save', saved: 'Saved', remove: 'Remove', removeConfirm: 'Remove this provider configuration? Its records are kept.',
      argsInvalid: 'Arguments must be a JSON array of strings.',
      providerHint: 'Sign in with the CLI in a terminal first. Changes take effect on the next connection.',
      check: 'Check this provider', checkHint: 'Runs ACP initialize in this directory to inspect capabilities.',
      cwd: 'Working directory', cwdPlaceholder: '/absolute/path/to/project',
      diagnose: 'Check capabilities', discover: 'Find CLI sessions', capabilities: 'Capabilities', agent: 'Agent', protocol: 'Protocol',
      refreshModels: 'Refresh models', modelsHint: 'Reads candidate models via an empty ACP session without changing your current selection.',
      modelsLoaded: '{n} candidate models found.', modelPickerHint: 'Choose this conversation’s model in the normal DSH model picker.',
      visibleModels: 'Models in the picker', modelSelectionHint: 'All discovered models appear in the DSH model picker by default. Uncheck models you want to hide, then save.',
      saveModels: 'Save model visibility', modelsSaved: 'Model picker updated.', noModels: 'Refresh models to load the choices.',
      modelInfoHint: 'Models appear in the DSH model picker with CLI-reported metadata, reasoning levels, context sizes, and fast mode.',
      modelSearch: 'Search models by name, ID, or description…', showAllModels: 'Show all', hideAllModels: 'Hide all',
      modelCountShown: '{shown} / {total} visible', modelFast: 'Fast', modelUltracode: 'Ultracode', modelContextOptions: '{values}',
      fast: 'Fast', context: 'Context', draftOptionHint: 'Selected options apply automatically on the next message.',
      providerConfig: 'CLI config', hideConfig: 'Hide config', closeDiag: 'Close',
      modesLabel: 'Modes', filterAll: 'All', filterVisible: 'Visible', filterHidden: 'Hidden',
      filterThinking: 'Thinking', filterFast: 'Fast', filterUltracode: 'Ultracode', filterMultiCtx: 'Multi-context',
      unsavedChanges: '{n} unsaved changes', revertChanges: 'Revert', saveChanges: 'Save changes',
      activeConnected: '{n} active', activeWorking: '{n} running', activeWaiting: '{n} waiting',
      noModelsYet: 'No models loaded for this provider yet.', fetchModelsNow: 'Fetch models from CLI',
      noMatchingModels: 'No models match the current search or filter.', resetFilters: 'Reset filters',
      probeDirLabel: 'Probe directory (optional)', probeDirHint: 'Defaults automatically to your active workspace or home directory.',
      modelsBadgeCount: '{shown}/{total} models', modelsNotFetched: 'Not fetched', cancelNew: 'Cancel',
      modelContext: 'Context: {n} tokens', modelOutput: 'Output limit: {n} tokens', modelInput: 'Input: {types}',
      modelEfforts: 'Reasoning: {levels}', modelInfoUnknown: 'No model details advertised', modalityText: 'text', modalityImage: 'image',
      supported: 'Advertised', unsupported: 'Not supported', unreported: 'Not reported', authMethods: 'Sign-in methods', rawResult: 'Raw result', none: 'None advertised',
      tierLabel: 'Plan tier', authLabel: 'Account', authSignedIn: 'Signed in', authSignedOut: 'Signed out', authUnknown: 'Not checked',
      subHeading: 'Subscription & usage', refreshUsage: 'Refresh usage', refreshingUsage: 'Refreshing…', usageUpdated: 'Subscription and usage updated.', usageUpdatedAt: 'Updated {time}', usageOpenDashboard: 'Usage dashboard ↗',
      quotaLimit5h: '5-hour window', quotaLimit7d: '7-day window', quotaLimitModel7d: 'Weekly · {model}', quotaLimitDuration: '{hours}h window', quotaLimitExtra: 'Extra usage',
      quotaStatusWarn: 'Near limit', quotaStatusRejected: 'Limit reached', quotaResetsAt: 'Resets {time}',
      quotaResetCredits: '{n} reset credits available', quotaCreditsBalance: 'Credits: {balance}', quotaCreditsUnlimited: 'Unlimited credits',
      quotaExtraEnabled: 'Extra usage enabled', quotaExtraActive: 'Using extra usage',
      quotaHintUnfetched: 'Click “Refresh usage” to read the signed-in account and subscription quota from this CLI.',
      quotaNoteCliNotExposed: 'This CLI reports account tier only; real-time personal quota is not exposed via CLI or ACP.',
      quotaNoteAcpNotExposed: 'This provider does not expose subscription quota over ACP or non-interactive CLI yet.',
      quotaNoteCustomOrApi: 'No subscription rate limits returned (may be using an API key, custom endpoint, or disabled non-essential traffic).',
      quotaNoteSignedOut: 'CLI is not signed in. Sign in from a terminal, then refresh.',
      localUsageLabel: 'Local DSH activity', localUsage24h: '24h: {sessions} sessions · {turns} turns', localUsage7d: '7d: {sessions} sessions · {turns} turns', localUsageTotal: 'Total: {sessions} sessions · {turns} turns',
      cliActivityLabel: 'This machine (CLI)', cliActivityPeriod: '{period}: {requests} reqs · {sessions} sessions',
      urlElicitation: 'External link confirmation', urlOpen: 'Open link', urlAccept: 'Confirm', urlDecline: 'Decline', urlHelp: 'Inspect the link before opening or confirming.',
      steerLabel: 'Steer active turn', steerPlaceholder: 'Send guidance to the running turn without canceling…', steerSend: 'Steer',
      'cap.loadSession': 'Load session', 'cap.resume': 'Resume', 'cap.fork': 'Fork', 'cap.close': 'Close', 'cap.options': 'Session options',
      'cap.steering': 'Steering', 'cap.additionalDirs': 'Extra dirs', 'cap.image': 'Image input', 'cap.audio': 'Audio input', 'cap.embeddedContext': 'Embedded context',
      'cap.list': 'Session list', 'cap.mcpHttp': 'MCP over HTTP', 'cap.mcpSse': 'MCP over SSE',
      discovered: 'CLI sessions in this directory', more: 'More', noDiscovered: 'No sessions found.',
      loginHint: 'If sign-in fails, run the CLI login command in a terminal, then reconnect.',
      search: 'Search name, provider, directory or session ID', noRecords: 'No execution records yet.', noMatch: 'No records match.',
      nativeTag: 'DSH conversation', childTag: 'Subagent', retiredTag: 'Retired', archivedTag: 'Archived',
      remoteId: 'Remote session', dshSession: 'DSH session', updated: 'Updated', provider: 'Provider',
      rename: 'Rename', archive: 'Archive', unarchive: 'Restore', stopTurn: 'Stop turn', back: 'All records',
      archiveHint: 'Disconnect before archiving. Workspace files and CLI history are kept.',
      nativeReadOnly: 'This record belongs to a DSH conversation. Send messages from that conversation.',
      storageError: 'History could not be saved: {message}',
      confirmTitle: 'Confirm action', confirmAction: 'Confirm', cancelAction: 'Cancel',
      turnTrace: 'ACP trace', turnTraceHide: 'Hide ACP trace', turnTraceHint: 'Inspect ACP execution trace, MCP payloads, compactions, and CLI logs',
      'tool.grepPaths': 'Search', 'tool.enterPlanMode': 'Enter plan mode', 'tool.exitPlanMode': 'Exit plan mode', 'tool.memoryRecall': 'Memory recall',
      'tool.semanticSearch': 'Semantic search', 'tool.workflow': 'Workflow', 'tool.task': 'Task', 'tool.schedule': 'Schedule',
      'tool.swarm': 'Swarm', 'tool.subagents': 'Subagents', 'tool.defineSubagent': 'Define subagent', 'tool.monitor': 'Monitor',
      'tool.spawnAgent': 'Delegate agent', 'tool.listProviders': 'List engines', 'tool.readAgentResult': 'Read agent result',
      'tool.openPlanFile': 'Open plan file', 'tool.inspect': 'Inspect', 'tool.stopped': 'Stopped',
      openInSidebar: 'Open in sidebar', attentionIndicator: '{n} ACP subagents waiting for your response',
      qRecommended: 'Recommended', qCustomPlaceholder: 'Type your answer', qNext: 'Next', qPrev: 'Previous question', qNextAria: 'Next question', qSubmit: 'Submit',
      qMinimize: 'Collapse the question card', qMaximize: 'Expand the question card', qCancel: 'Dismiss all questions',
      qIncomplete: 'Please complete this question first.', qUnanswered: 'Please select an option or enter a custom answer.', qRangeInvalid: 'Enter a value within the allowed range.',
      qYes: 'Yes', qNo: 'No', approvalWaiting: 'Waiting for approval', planReviewHeader: 'Plan review', planApprove: 'Approve', planReject: 'Reject',
      onLabel: 'On', offLabel: 'Off',
      waitNext: 'Waiting for {name} next step', waitNextElapsed: 'Waiting for {name} next step · {duration}',
      waitNextGeneric: 'Waiting for external agent', waitNextGenericElapsed: 'Waiting for external agent · {duration}',
      waitSec: '{s}s', waitMinSec: '{m}m {s}s',
    }
    const zh = {
      panel: 'ACP 工作台', panelHint: '管理本机 ACP CLI 提供方、检测协议能力，并配置出现在 DSH 模型选择器中的模型。',
      confirmTitle: '确认操作', confirmAction: '确认', cancelAction: '取消',
      schedules: '定时任务', schDescription: '到点后把指令发进对话（只负责投递，不等待任务完成）。', schNew: '创建定时任务', schName: '任务名称', schPrompt: '到期发送的指令', schTarget: '投递目标', schExisting: '已有会话（定时唤回）', schOnce: '首次到期建一个会话，后续复用', schFresh: '每次到期都新建会话', schChoose: '选择会话', schPreset: 'DSH Agent 预设', schDefault: 'Host 默认预设', schRouteHint: '已有会话沿用原来的引擎和目录；新建会话使用项目目录和 DSH 预设。', schTiming: '触发方式', schAfter: '延时一次', schEvery: '固定间隔', schDaily: '每天定时', schCron: 'Cron 表达式', schMinutes: '分钟', schZone: 'IANA 时区', schTime: '当地时间', schExpr: '五字段 Cron', schConfirm: '启用这个定时任务？每次到点都会触发 Agent 执行。', schUnknown: '未收到操作回执，请刷新列表确认。', schEmpty: '这个项目还没有定时任务。', schRefresh: '刷新任务', schActive: '已启用', schPaused: '已暂停', schEnded: '已结束', schNext: '下次投递', schDelivered: '最近投递', schQueued: '已入队或还在执行', schManage: '管理任务', schPause: '暂停', schResume: '恢复', schRun: '立即投递', schRunConfirm: '立即把这条指令发给 Agent？', schIncomplete: '请填好任务名称、指令、有效时间和投递目标。', schMissing: '任务已被删除或改动，请刷新后再试。', schFloor: '最早再次投递', schBusy: '上次投递还没结束，或还没到最小间隔时间。', schCadence: '触发规则', schHistory: '投递历史', schNoHistory: '暂无投递记录。', schMore: '更早的投递', schPruned: '部分早期记录已不可用。', schDelete: '删除任务', schDeleteConfirm: '删掉这个任务和投递历史？已发进对话的消息保留。',
      termList: '会话终端', termRetry: '重新连接列表', termScope: 'DSH 为本会话保留的终端。', termEmpty: '本会话没有保留的终端。', termAgent: 'Agent 启动', termUser: '用户启动', termAgentControl: 'Agent 控制', termLost: '终端列表已断开。', termMissing: '无法在所属会话中打开这个终端。',
      scripts: '项目脚本', scriptsHint: '运行当前目录 paseo.json 里的脚本（在会话沙箱内执行）。使用 $PASEO_PORT 的服务支持自动分配回环端口并监测 TCP 连通。', scriptNone: '当前目录的 paseo.json 没有定义脚本。', scriptStart: '运行', scriptStop: '停止进程', scriptLog: '查看输出', scriptTerminal: '打开终端', scriptConfirm: '在新的 DSH 终端中运行这条命令？', stopScriptConfirm: '停止此脚本并关闭它的终端？', scriptService: '服务', scriptTask: '脚本', runHere: '打开所属会话', scriptUnavailable: '终端已不再保留', scriptExited: '已退出', scriptStopped: '已停止', scriptRunning: '运行中', scriptStarting: '启动中', scriptFailed: '失败', scriptOwner: '由用户接管', noOutput: '暂无保留的输出', scriptRefresh: '刷新脚本', scriptLoading: '正在读取脚本…', scriptExit: '退出码',
      projects: '项目', addProject: '添加目录', chooseProject: '工作区', agents: '项目会话', newAgent: '新建 Agent', local: '使用项目目录', worktree: '独立工作树', checkout: '隔离方式', branchName: '新分支名（可选）', baseRef: '起点（默认 HEAD）', agentName: '会话名称（可选）', createAgent: '创建并打开聊天', launchHint: '创建新会话，不自动发送消息。', noProject: '先添加项目目录，再启动 Agent。', noAgents: '这里还没有会话。', projectFailed: '准备未完成，DSH 会话已保留。', nativeChat: 'DSH 会话', cliDefault: 'CLI 默认', projectArchive: '已归档', profiles: '启动配置', customLaunch: '自定义设置', profileName: '配置名称', saveProfile: '保存启动配置', removeProfile: '删除配置', removeProfileConfirm: '删除这套启动配置？已有会话不受影响。', unavailableProfile: '这套启动配置目前不可用，请核对提供方、模型和工作树能力。', effortChoice: '思考强度', projectTools: '工作区工具', filesTab: '文件', terminalTab: '新建终端', changesTab: 'Git 改动', archiveChat: '归档会话', archiveChatConfirm: '归档这个 DSH 会话？空闲且干净的托管工作树可能被 DSH 回收。', restoreChat: '恢复会话',
      shareCheckout: '在这里新建 Agent', shareHeading: '此工作树的 Agent', sharedCheckout: '共享工作树', shareOwner: '创建者', shareCurrent: '所选会话', shareOpen: '创建并打开会话', shareDismiss: '收起', switchShared: '切换同工作树 Agent', noSharedPeers: '当前工作树没有其他活跃会话。', shareHint: '共享工作树：多个 Agent 直接编辑同一份代码，各自保留独立会话、CLI 上下文和审批。', shareArchive: '归档这个会话？它共享的工作树归另一个会话所有，不会被回收。', sharePartial: '此会话未成功加入工作树，请从有效的参与会话重新创建。',
      startWithPort: '带回环端口启动', confirmPort: '分配空闲回环端口写入 PASEO_PORT（HOST=127.0.0.1）并启动？', watchPort: '监测端口', unwatchPort: '结束监测', portPending: '等待端口就绪', portCheckAgain: '复查端口中', portAccepts: 'TCP 已接通', portRefused: 'TCP 连接被拒绝', portTimeout: 'TCP 无响应', portFailed: '无法检查端口', portHint: '检测所分配回环端口的 TCP 连通性。',
      refreshComparison: '刷新比较', commitScope: '分支上的提交', commitStart: '选择提交', commitEnd: '比较到', chooseCommit: '请选择提交', commitOnly: '仅此提交', rangeSize: '{n} 次提交', commitHint: '显示从起始提交第一父提交到所选提交的 Git 历史。', noBranchCommits: '此基线到 HEAD 没有提交，可切换更早的基线分支。', commitTruncated: '仅列出最近 {n} 个提交。', commitMissing: '所选提交不再构成连续的第一父提交范围，请重新选择。', commitHeadMoved: '读取提交时分支 HEAD 已变更，请刷新比较。', commitVersion: '提交中的文件 · {sha}',
      recordedFile: '当前磁盘文件', recordedLocation: '在当前磁盘文件中打开记录的行号。', reportedHits: '定位搜索结果（{n}）', moreTargets: '显示更多位置', lineGone: '当前文件里已没有第 {n} 行。', fileStart: '从第一行读', fileChanged: '阅读期间文件已变化，请重新打开定位。',
      beforeFile: '查看旧版本', beforeAt: '查看旧版 {path} 第 {n} 行', beforePatch: '补丁中的旧行', beforeWhole: '补丁中的完整删除文本', beforeHint: '仅显示补丁捕获的旧行，行号对应旧文件。', beforeFull: '读取完整旧版本', beforeNone: '补丁没有记录旧文本行。', beforeIndex: '旧版本 · Git 索引', beforeCommit: '旧版本 · 提交 {sha}', beforeSnapshot: '只读 Git 快照。', beforeIndexHint: '只读 Git 索引快照。', beforeGap: '补丁未包含旧版第 {from} 至 {to} 行。', beforeLimited: '无法定位精确旧提交，仅显示补丁中的旧行。',
      reviewFile: '查看文件', reviewIndex: '已暂存版本（Git 索引）', reviewDisk: '当前工作树文件', reviewAt: '查看 {path} 第 {n} 行', reviewFull: '在文件侧栏打开', reviewDeleted: '文件在本次比较中被删除。', reviewStale: '文件与补丁不再一致，请刷新比较。', reviewPath: '无法在当前工作树中定位此文件。', reviewEmpty: '空文件', reviewPatch: '可复制的补丁', reviewNext: '后续行', reviewPrev: '前面的行', reviewBack: '关闭文件预览', reviewBinary: '没有可定位的文本行。',
      cliTasks: '本轮 CLI 子任务', cliTaskCount: '{n} 个启动调用', cliLaunchStatus: '启动调用：{status}', cliTask: 'CLI 子任务', cliOnly: '查看子任务', cliAll: '完整轨迹', cliCalls: '{n} 次直接调用', cliProgress: '任务进展', cliInput: '任务输入', cliMedia: '{type} · 见原始事件', cliPreview: '预览 {type}', cliNoMedia: '该条记录的内容不可用。', cliLimit: '仅显示摘录，全文见原始事件', cliScope: 'CLI 子任务的直接活动（只读）。', cliOrigin: '来自 {task}', cliMissing: '本段未见启动调用：{task}', cliConflict: '子任务归属冲突',
      permitRequested: '已请求权限', permitLive: '等你审批', permitAllowed: '已允许', permitAutomatic: '预设自动允许', permitDenied: '已拒绝', permitExpired: '请求已失效', permitAnswered: '已记录决定',
      callView: '工具调用视图', compactCalls: '概览', detailedCalls: '逐条', exploration: '查阅记录', readCount: '读取 {n} 次', searchCount: '搜索 {n} 次', webCount: '网页查询 {n} 次', distinctPaths: '读取路径 {n} 个', groupCalls: '{n} 次调用', 'call.cancelled': '已取消',
      treeInspect: '工作目录', treeActual: '生效目录', treeSource: '来源仓库', treeRecorded: '记录的分支', treeBase: '起点提交', treeOwned: '本会话创建', treeInherited: '继承的工作树', treeOther: '不是当前目录', treeDirectory: '目录存在', treeMissing: '目录缺失', treeIncomplete: '目录存在，但缺少链接工作树标记', treeOccupied: '路径被其他文件或符号链接占用', treeEmpty: '该会话没有托管工作树的创建记录。', treeScheduled: '正在检查是否可以回收工作树…', treeRetained: 'DSH 保留了工作树。', treeRemoved: 'DSH 已回收工作树目录（分支保留）。', treeFailed: '回收失败，可能留有不完整目录，请检查后再继续。', treeNoReceipt: '本次 Host 运行期间没有回收回执。', treeRestoreFirst: '请先恢复会话，再重建工作树。', treeRestore: '重建缺失的工作树', treeRestoreAsk: '按记录的分支重建缺失目录？若原分支已删除，则从起点提交重建；未提交改动无法找回。', treeRebuilt: '已从现有分支恢复工作树目录。', treeRecreated: '原分支已不存在，已从起点提交重建。', treeBusy: '工作树重建中…', treePolicy: '需要会话空闲且允许写入才能重建工作树。', treeArchiveRisk: '未提交修改、未跟踪文件或其他活跃会话会阻止回收。Git 忽略文件不受保护，请先备份或开启归档保留。',
      projectResults: '项目审阅', unseen: '待审阅', reviewed: '已审阅', markSeen: '标为已审阅', resultHistory: '全部结果', resultTurn: '第 {n} 轮', previousPage: '上一页', nextPage: '下一页', noResults: '没有待审阅的结果。', noAllResults: '这个项目还没有结束的 ACP 运行。', reviewHint: '每轮结果单独列出；点开查看不会自动标为已审阅或放行审批。', runTrace: '本轮轨迹', checkoutDiff: '工作树改动', gitScope: '对比范围', uncommitted: '工作树与 HEAD', staged: '已暂存', unstaged: '未暂存', branchDiff: '当前分支与基线', baseBranch: '基线分支', autoBase: 'Forge 默认', findBase: '搜索基线分支', checkoutHint: '当前工作目录的实时 Git 状态（可能包含其他 Agent 的改动）。', diffClean: '当前对比范围没有改动。', diffOmitted: 'Forge 省略了 {n} 个未跟踪文件。', binaryDiff: '二进制文件', largeDiff: '文件超出差异大小限制', noHunks: '没有文本差异块', moreLines: '显示更多行', moreFiles: '显示更多文件', projectRequests: '等待你回应', checkoutUnavailable: '无法读取 Git 改动。',
      attention: '等你回应', working: '进行中', review: '需查看', recent: '最近活动', history: '历史', all: '当前记录',
      attentionHint: '在这里操作会直接把决定发给等待中的 CLI。',
      recoveryHint: '请先核对最后一轮再继续，重新连接不会重发输入。',
      firstTurn: '在输入框发送第一条消息即可开始。CLI 使用自己的工具和文件权限。', archivedHint: '此绑定已归档，恢复后可继续使用原外部上下文。',
      openConversation: '打开会话', openRoot: '打开所属会话树', retry: '刷新', connectingFeed: '正在连接…',
      cliOptions: 'CLI 设置', hideOptions: '收起 CLI 设置', connectOnly: '仅连接，不发送消息',
      forkHere: '从副本继续', forkHint: '复制 CLI 已保存的最新历史到新上下文，不影响原会话。', forkSource: '复制自 CLI 历史', resumeExisting: '接续 CLI 会话', resumeHere: '在这里接续', closeHistory: '收起会话列表',
      previousMessages: '查看 CLI 前文', hidePrevious: '收起前文', noReplay: '这页 CLI 历史中没有更早的消息。',
      resumePick: '连接到此目录的 CLI 会话，下一条消息直接接在该上下文后继续。',
      firstUse: '在 DSH 模型选择器选一个 ACP 模型并发送消息，执行活动就会出现在这里。',
      setup: '管理提供方', answeredByPreset: '完全访问 · 自动回应', answeredByUser: '人工回应',
      quietChildren: '其他子任务（{n}）', requestCount: '{n} 项待回应',
      scopeOnce: '完全访问预设会自动放行单次权限请求，持久授权仍需手动确认。',
      tabProviders: '提供方', tabRecords: '活动', live: '实时', offline: '正在重连…',
      engine: 'ACP 引擎',
      engineHint: '在模型选择器中选择 ACP 模型，照常使用输入框、附件和停止按钮。',
      delegateHint: '原生 DSH 与 ACP CLI（Cursor、Antigravity、Claude Code）之间均可通过 spawn_agent、list_providers、send_message、list_agents、read_agent_result 双向互调。',
      warning: '外部 CLI 不受 DSH 沙箱限制，使用自身的登录态、工具和文件权限。',
      connect: '连接', reconnect: '重新连接', disconnect: '断开',
      newContext: '新建外部上下文', newContextConfirm: '从下一条消息开始新建外部上下文？DSH 历史和旧记录保留。',
      configuration: '配置', commands: 'CLI 命令', directory: '目录',
      noConfig: '连接后会载入此 CLI 公布的模型、模式和选项。',
      cliCommandGroup: 'CLI · {name}', cliCommandStale: '请从 / 菜单重新选择该 CLI 命令。',
      model: '模型', mode: '模式', commandPick: '选择命令…', commandArgs: '参数', commandRun: '运行',
      commandHint: '作为普通消息发给外部 CLI；输入框里的斜杠命令仍由 DSH 处理。',
      'notice.feed': 'CLI 会话提醒', 'notice.recent': '本次连接轮次外收到的最近 8 条提醒。', 'notice.info': '提示', 'notice.warning': '警告', 'notice.error': '错误', 'notice.level': 'CLI · {level}', 'notice.turn': '本轮收到', 'notice.connect': '连接时收到', 'notice.session': '轮次间收到', 'notice.fromTask': 'CLI 任务：{id}', 'notice.unavailable': '本地记录中找不到这条提醒。',
      'compact.late': 'CLI 在该轮结束后补充了回报。', 'compact.title': 'CLI 上下文压缩', 'compact.replay': '回放中的 CLI 压缩', 'compact.summary': 'CLI 报告的摘要', 'compact.noSummary': '这些回报没有提供摘要。', 'compact.in_progress': '压缩中', 'compact.unsettled': '最后报告为进行中', 'compact.completed': '压缩完成', 'compact.failed': '压缩失败', 'compact.cancelled': '压缩已取消', 'compact.automatic': '自动压缩', 'compact.manual': '手动压缩', 'compact.idle': '空闲时压缩', 'compact.preTokens': '压缩前：{n} token', 'compact.postTokens': '压缩后：{n} token', 'compact.durationMs': '耗时：{n} 毫秒', 'compact.attachment': '预览附件 · {type}', 'compact.noMedia': '找不到对应的历史附件。',
      contextRecent: 'CLI 上下文 · 最近报告', contextRecorded: 'CLI 报告的上下文', contextReplay: '回放中的上下文报告', ctxAt: '报告时间：{time}', ctxScope: '当前上下文窗口占用（非计费或额度）。', ctxCost: '会话累计费用：{amount} {unit}', ctxTotals: 'CLI 会话累计 token', ctxTotalsScope: '本轮结束时 CLI 返回的会话累计总量。', ctxTotal: '总计', ctxInput: '输入', ctxOutput: '输出', ctxCacheRead: '缓存读取', ctxCacheWrite: '缓存写入', ctxThought: '推理', ctxModel: '报告模型：{model}',
      usageContext: '上下文 {used} / {size}（{percent}%）', usageCost: '费用 {amount} {currency}',
      unknownUsage: '此 Agent 尚未上报。',
      children: 'ACP 子任务', childrenWaiting: '{n} 待回应', childrenRunning: '{n} 进行中', childrenReview: '{n} 需查看', childrenDone: '{n} 已完成', childrenIdle: '{n} 未运行', stop: '停止', pending: '待处理', expand: '展开轨迹', collapse: '收起轨迹',
      'state.starting': '连接中', 'state.idle': '就绪', 'state.running': '执行中', 'state.waiting': '等待你回应',
      'state.canceling': '停止中', 'state.disconnected': '已断开', 'state.error': '错误', 'state.preparing': '准备中',
      'state.completed': '已完成', 'state.interrupted': '已中断', 'state.failed': '失败',
      trace: '{name} 执行轨迹', traceTools: '{n} 次工具调用', traceTool: '1 次工具调用', traceFiles: '{n} 个文件有差异', traceFile: '1 个文件有差异',
      replyCollapsed: '{name} 回复已折叠', replyLines: '{n} 行', replyImages: '{n} 张图片', collapseReply: '收起结果', expandReply: '展开结果', collapseExcerpt: '收起回复', expandExcerpt: '展开全文', collapseTrace: '收起轨迹',
      handoff: '已交接 DSH 上下文', sameContext: '延续外部上下文',
      viewTimeline: '时间线', viewRaw: '原始事件', older: '加载更早记录', loading: '加载中…',
      noEvents: '尚无执行事件。', noActivity: '本轮没有工具活动。',
      stderr: 'CLI 日志输出', stopReason: '本轮结束：{reason}', turnError: 'Agent 报错：{message}', configError: '设置被拒绝：{message}',
      planItems: '任务清单', planDocument: '方案正文', planRemoved: 'CLI 已移除计划', planRecorded: 'CLI 回报的计划原文。', planOpenFile: '查看当前文件', planDone: '已完成', planDoing: '进行中', planPending: '待开始', planEmpty: '没有列出步骤。', morePlanItems: '显示更多步骤',
      plan: '计划', highPriority: '高', planProgress: '{done}/{total} 项完成',
      'call.read': '读取文件', 'call.search': '搜索', 'call.edit': '编辑文件', 'call.write': '写入文件', writeView: '写入详情', writeInput: '请求写入的正文', writePatch: '报告的补丁', writeEmpty: '请求写入的正文为空。', 'call.delete': '删除', 'call.move': '移动',
      'call.execute': '运行命令', 'call.fetch': '访问网页', 'call.think': '思考', 'call.switch_mode': '切换模式',
      'call.pending': '等待执行', 'call.in_progress': '执行中', 'call.unfinished': '未报告最终状态', 'call.completed': '已完成', 'call.failed': '失败',
      'patch.launch': '启动时的预览', 'patch.update': 'CLI 更新中的补丁', 'patch.completed': '完成回报中的补丁', 'patch.failed': '失败回报中的补丁', 'patch.permission': '本次审批中的补丁', 'patch.recorded': '报告的补丁', patchCurrent: '在当前文件中查看报告的位置', patchFiles: '补丁文件（{n}）', patchAll: '全部报告片段', patchParts: '{n} 个片段', patchNoParts: '该文件没有结构化文本差异。', 'patch.add': '新增文件', 'patch.delete': '删除文件', 'patch.move': '移动文件', 'patch.updateFile': '修改文件',
      webSearch: '网页搜索', webPage: '抓取网页', webFind: '页内查找', webQuery: '报告的查询', webAddress: '网页地址', webPattern: '页内查找内容', webPrompt: '要求提取的内容', webOffset: '起始字符偏移', webAllow: '允许的域名', webDeny: '排除的域名', webPreview: '请求预览', webResponse: '工具回报', webRaw: '原始工具输出', webUpdate: '工具进度更新', webFailure: '失败回报', webNoReport: '此调用未附带结果文本。', webMore: '显示更多来源（剩余 {n} 项）', webSourceCount: '报告了 {n} 条来源',
      fileByName: '按名称查找', fileByDirectory: '浏览目录', dirRoot: '工作目录', dirBack: '返回目录', dirHint: '逐层列出当前目录，隐藏点文件，显示 Git 忽略项。', dirRefresh: '刷新目录', dirRestart: '重新打开当前工作目录', dirCount: '{n} 个可见条目', dirEmpty: '未返回可见条目。', dirPartial: 'DSH 仅返回了部分目录内容。', dirFolder: '目录', dirFile: '文件', dirOther: '其他', dirBytes: '{n} 字节', dirMore: '显示更多条目', fileRefresh: '重新搜索',
      findFile: '查找文件', fileQuery: '文件名或路径', findFileHint: '按名称搜索当前工作目录，排除隐藏文件和 Git 忽略项。', foundFiles: '返回 {n} 个文件', fileHitsLimit: '结果已截断，请缩小范围', fileScanCut: '只检索了部分目录', moreFileHits: '显示更多文件', fileHitsBack: '返回文件结果',
      'batch.archive': '批量归档会话', 'batch.restore': '批量恢复会话', 'batch.confirm': '核对所选会话', 'batch.choose': '请先勾选至少一个可操作的会话。', 'batch.archiveNote': '归档所选会话并取消置顶；运行中、待回应或带工作树的会话将跳过。', 'batch.restoreNote': '恢复所选会话，不自动打开或重建工作树。', 'batch.active': '正在工作或等待回应', 'batch.denied': '无操作权限', 'batch.changed': '项目归属或归档状态已变化，请重新核对。', 'batch.tree': '请在单个会话的归档入口核对工作树。', 'batch.result': '各会话处理结果', 'batch.archived': '已归档', 'batch.restored': '已恢复', 'batch.skipped': '未更改',
      findAgent: '查找会话', findAgentHint: '名称、项目、引擎、目录或 DSH 会话 ID', hereProjects: '当前项目', everyProject: '全部项目', finderScope: '查找范围', onlyPinned: '只看置顶', isPinned: '置顶', finderCount: '{n} 个会话', finderNoMatch: '没有符合这些条件的会话。', finderReset: '清除筛选', projectRename: '重命名项目', projectTitle: '项目名称', sameProjectTitle: '已有同名项目。', cancelEdit: '取消', agentMenu: '会话「{name}」的操作', archivedOpen: '先恢复此会话，再打开聊天。',
      'call.mcp': 'MCP 工具', mcpArgs: '调用参数', mcpOutput: '报告的输出', mcpContent: 'CLI 展示内容', mcpStructured: '结构化结果', mcpRequest: '请求附带的说明', mcpDisplayArgs: '请求中展示的参数', mcpAbsent: '未附原始参数', mcpTable: '相同字段的记录', mcpEmpty: '工具返回了空内容列表。', mcpEmptyDisplay: 'CLI 在这里没有附展示内容。', mcpFields: '{n} 个字段', mcpItems: '{n} 项', mcpMore: '显示更多', mcpLess: '收起', mcpSource: 'MCP 服务',
      streamReport: '终端回报', finalReport: '工具另报的输出', outputView: '命令输出', outputTail: '较早输出已省略，仅显示末尾 32 Ki 字符。', outputPartial: '未知的分包方式：只显示最近一次回报和之后的明确增量。', awaitingExit: '尚无终端退出回报',
      exitCode: '退出码 {n}', inspectData: '技术详情', proposed: '请求的改动', imageResult: '工具返回的图片',
      lineNumber: '第 {n} 行', linesReturned: '返回 {n} 行', pathsReturned: '{n} 个路径', hitsReturned: '{files} 个文件 · {n} 处匹配', noHits: '没有结果',
      'decision.accepted': '已接受', 'decision.rejected': '已拒绝', 'decision.cancelled': '已取消', 'decision.skipped': '已跳过', 'decision.answered': '已回答',
      resource: '资源', noExit: '未报告退出码', noShellOutput: '没有输出', terminalSignal: '信号 {signal}', pathMore: '另 {n} 处',
      clearField: '清除选择', form: 'CLI 提问', formOptional: '选填', formRequired: '必填', formSubmit: '提交回答', formDecline: '不回答', formPreview: '查看选项示例', formHelp: '仅把填写的字段发给 CLI，请勿填写密码或令牌。', formMin: '最少 {n}', formMax: '最多 {n}', 'form.accept': '已提交回答', 'form.decline': '已拒绝回答', 'form.cancel': '已取消', formWithdrawn: 'CLI 已撤回',
      permission: '权限请求', question: 'Agent 提问', 'kind.plan': '计划审批',
      permitLaunch: '查看最初的工具调用', permitEarlier: '工具启动时的调用快照。', permitEmpty: 'CLI 未随本次请求附带参数、文件位置或预览。', permitPast: '查看审批请求', permitReadOnly: '请求记录 · 只读', permitUnavailable: '无法读取对应的审批记录。', permitCallId: '调用 ID', permitCwd: 'CLI 目录', permitOptions: 'CLI 提供的选项', permitScopeOnce: '仅本次请求', permitScopeRemember: '后续请求可能沿用', permitGrant: '允许', permitRefuse: '拒绝', permitSelection: '当时的决定：{choice}', permitAutoSelection: '预设自动决定：{choice}',
      permanent: '选择“总是”类选项后，CLI 可能在后续请求中沿用。',
      approve: '批准计划', reject: '拒绝', rejectReason: '理由（可选）', answer: '提交答案', skip: '跳过', dismiss: '取消请求',
      'event.interaction': '请求：{title}', 'event.expired': '请求已过期',
      input: '输入', output: '输出', terminal: '终端 {id}', tool: '工具调用',
      user: '你', assistant: 'Agent', thinking: '思考', replay: '历史回放',
      truncated: '… 共 {n} 个字符', copy: '复制', copied: '已复制', wrap: '自动换行', unwrap: '取消换行', code: '代码',
      expandLines: '再显示 {n} 行', collapseLines: '收起', expandLinesAria: '显示隐藏的 {n} 行', collapseLinesAria: '收起展开的行',
      providerList: '提供方', addProvider: '新增提供方', editProvider: '编辑提供方', newProviderTitle: '新增提供方',
      providerTemplates: '预设模板', providerTemplatesHint: '点击模板一键填入默认命令与参数，可继续按需修改。',
      providerTemplatesEditHint: '点击模板可套用默认命令与参数（保留当前 ID 与显示名称）。',
      templateAdded: '已添加', templateBlank: '空白配置',
      fieldId: 'ID', fieldLabel: '显示名称', fieldCommand: '可执行文件', fieldCommandHint: '绝对路径或 PATH 中的名称。',
      fieldArgs: '参数', fieldArgsHint: 'JSON 字符串数组，例如 ["acp"]。请勿填写密钥。',
      save: '保存', saved: '已保存', remove: '删除', removeConfirm: '删除此提供方配置？其执行记录仍然保留。',
      argsInvalid: '参数必须是 JSON 字符串数组。',
      providerHint: '先在终端完成 CLI 登录。修改在下次连接时生效。',
      check: '检查提供方', checkHint: '在该目录运行 ACP initialize 检查能力。',
      cwd: '工作目录', cwdPlaceholder: '/项目/的/绝对路径',
      diagnose: '检查能力', discover: '查找 CLI 会话', capabilities: '能力', agent: 'Agent', protocol: '协议',
      refreshModels: '刷新模型', modelsHint: '新建空 ACP 会话读取候选模型，不改变当前选择。',
      modelsLoaded: '发现 {n} 个候选模型。', modelPickerHint: '请在原 DSH 模型选择器中选择此会话使用的模型。',
      visibleModels: '显示在模型选择器中的模型', modelSelectionHint: '刷新或连接后默认在 DSH 模型选择器显示全部可用模型。取消勾选不想显示的模型并保存即可。',
      saveModels: '保存模型显示设置', modelsSaved: '模型列表已更新。', noModels: '请先刷新模型以载入候选项。',
      modelInfoHint: '模型会带着 CLI 公布的元信息、思考强度、上下文窗口和 Fast 属性出现在模型选择器中。',
      modelSearch: '搜索模型名称、ID 或说明…', showAllModels: '全部显示', hideAllModels: '全部隐藏',
      modelCountShown: '已显示 {shown} / {total}', modelFast: 'Fast', modelUltracode: 'Ultracode', modelContextOptions: '{values}',
      fast: '快速', context: '上下文', draftOptionHint: '所选属性会在发送下一条消息时自动应用。',
      providerConfig: 'CLI 配置', hideConfig: '收起配置', closeDiag: '关闭',
      modesLabel: '模式', filterAll: '全部', filterVisible: '已显示', filterHidden: '已隐藏',
      filterThinking: '思考', filterFast: 'Fast', filterUltracode: 'Ultracode', filterMultiCtx: '多上下文',
      unsavedChanges: '{n} 项修改未保存', revertChanges: '撤销', saveChanges: '保存更改',
      activeConnected: '{n} 个已连接', activeWorking: '{n} 个运行中', activeWaiting: '{n} 个待审批',
      noModelsYet: '还没有为这个提供方拉取模型目录。', fetchModelsNow: '从 CLI 拉取模型列表',
      noMatchingModels: '没有符合当前搜索或筛选条件的模型。', resetFilters: '重置筛选',
      probeDirLabel: '探测工作目录（可选）', probeDirHint: '留空时自动使用当前工作区或用户主目录。',
      modelsBadgeCount: '{shown}/{total} 模型', modelsNotFetched: '未拉取', cancelNew: '取消',
      modelContext: '上下文：{n} tokens', modelOutput: '输出上限：{n} tokens', modelInput: '输入：{types}',
      modelEfforts: '思考强度：{levels}', modelInfoUnknown: 'CLI 未公布模型信息', modalityText: '文本', modalityImage: '图片',
      supported: '已公布', unsupported: '不支持', unreported: '未公布', authMethods: '登录方式', rawResult: '原始结果', none: '未公布',
      tierLabel: '订阅档位', authLabel: '登录状态', authSignedIn: '已登录', authSignedOut: '未登录', authUnknown: '未检测',
      subHeading: '订阅与用量', refreshUsage: '刷新用量', refreshingUsage: '刷新中…', usageUpdated: '订阅与用量已刷新。', usageUpdatedAt: '更新于 {time}', usageOpenDashboard: '查看网页用量 ↗',
      quotaLimit5h: '5 小时窗口', quotaLimit7d: '7 天总量', quotaLimitModel7d: '7 天 · {model}', quotaLimitDuration: '{hours} 小时窗口', quotaLimitExtra: '超额用量',
      quotaStatusWarn: '接近上限', quotaStatusRejected: '已达上限', quotaResetsAt: '重置于 {time}',
      quotaResetCredits: '可用免费重置次数：{n}', quotaCreditsBalance: '额度余额：{balance}', quotaCreditsUnlimited: '无限额度',
      quotaExtraEnabled: '已开启超额用量', quotaExtraActive: '正在使用超额用量',
      quotaHintUnfetched: '点击“刷新用量”读取当前 CLI 的登录账号与订阅配额。',
      quotaNoteCliNotExposed: '该 CLI 仅提供订阅档位与账号信息，未暴露个人订阅的实时配额接口。',
      quotaNoteAcpNotExposed: '该提供方目前未通过 ACP 或非交互 CLI 暴露订阅配额。',
      quotaNoteCustomOrApi: '未返回 claude.ai 订阅配额（当前可能使用 API Key、自定义网关，或关闭了非必要流量）。',
      quotaNoteSignedOut: '当前 CLI 未登录，请先在终端完成登录后再刷新。',
      localUsageLabel: 'DSH 本地记录', localUsage24h: '近 24h：{sessions} 会话 · {turns} 轮', localUsage7d: '近 7d：{sessions} 会话 · {turns} 轮', localUsageTotal: '累计：{sessions} 会话 · {turns} 轮',
      cliActivityLabel: '本机 CLI 统计', cliActivityPeriod: '{period}：{requests} 请求 · {sessions} 会话',
      urlElicitation: '外部链接确认', urlOpen: '打开链接', urlAccept: '确认', urlDecline: '拒绝', urlHelp: '请核对链接后再打开或确认。',
      steerLabel: '引导当前轮次', steerPlaceholder: '无需中止，直接向运行中的轮次补充指令…', steerSend: '发送引导',
      'cap.loadSession': '加载会话', 'cap.resume': '恢复会话', 'cap.fork': '分支会话', 'cap.close': '关闭会话', 'cap.options': '会话选项',
      'cap.steering': '运行中引导', 'cap.additionalDirs': '附加目录', 'cap.image': '图片输入', 'cap.audio': '音频输入', 'cap.embeddedContext': '嵌入上下文',
      'cap.list': '会话列表', 'cap.mcpHttp': 'HTTP MCP', 'cap.mcpSse': 'SSE MCP',
      discovered: '此目录下的 CLI 会话', more: '更多', noDiscovered: '没有找到会话。',
      loginHint: '若登录失败，请在终端执行 CLI 的登录命令后重新连接。',
      search: '搜索名称、提供方、目录或会话 ID', noRecords: '还没有执行记录。', noMatch: '没有匹配的记录。',
      nativeTag: 'DSH 会话', childTag: '子任务', retiredTag: '已退役', archivedTag: '已归档',
      remoteId: '远端会话', dshSession: 'DSH 会话', updated: '更新于', provider: '提供方',
      rename: '改名', archive: '归档', unarchive: '恢复归档', stopTurn: '停止本轮', back: '全部记录',
      archiveHint: '归档前请先断开，工作区文件和 CLI 历史保留。',
      nativeReadOnly: '这条记录属于 DSH 会话，请在该会话中发送消息。',
      storageError: '历史记录无法保存：{message}',
      turnTrace: 'ACP 轨迹', turnTraceHide: '收起 ACP 轨迹', turnTraceHint: '查看完整 ACP 执行轨迹、MCP 结构化输出、压缩记录与 CLI 日志',
      'tool.grepPaths': '搜索', 'tool.enterPlanMode': '进入计划模式', 'tool.exitPlanMode': '退出计划模式', 'tool.memoryRecall': '召回记忆',
      'tool.semanticSearch': '语义搜索', 'tool.workflow': '工作流', 'tool.task': '任务', 'tool.schedule': '定时任务',
      'tool.swarm': '多代理协作', 'tool.subagents': '子代理管理', 'tool.defineSubagent': '定义子代理', 'tool.monitor': '监控',
      'tool.spawnAgent': '委派子智能体', 'tool.listProviders': '查询可用引擎', 'tool.readAgentResult': '读取子任务结果',
      'tool.openPlanFile': '打开计划文件', 'tool.inspect': '查看', 'tool.stopped': '已中止',
      openInSidebar: '右侧分屏打开', attentionIndicator: '{n} 个 ACP 子任务等待回应',
      qRecommended: '推荐', qCustomPlaceholder: '输入你的答案', qNext: '下一题', qPrev: '上一题', qNextAria: '下一题', qSubmit: '提交',
      qMinimize: '收起问题卡片', qMaximize: '展开问题卡片', qCancel: '放弃整组问题',
      qIncomplete: '请先完成这道问题。', qUnanswered: '请选择一个选项或填写自定义答案。', qRangeInvalid: '请输入符合范围要求的数值。',
      qYes: '是', qNo: '否', approvalWaiting: '等待审批', planReviewHeader: '计划待审', planApprove: '同意执行', planReject: '拒绝',
      onLabel: '开启', offLabel: '关闭',
      waitNext: '正在等待 {name} 下一步', waitNextElapsed: '正在等待 {name} 下一步 · {duration}',
      waitNextGeneric: '正在等待外部代理下一步', waitNextGenericElapsed: '正在等待外部代理下一步 · {duration}',
      waitSec: '{s}秒', waitMinSec: '{m}分{s}秒',
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
.aw-file-hit{display:grid;text-align:start;gap:2px;width:100%;padding:6px 8px;background:none;color:inherit;border:.5px solid transparent;border-radius:var(--dsw-radius-sm,8px);font:inherit;cursor:pointer;overflow-wrap:anywhere}
.aw-directory-list{display:grid;gap:2px}.aw-dir-entry{grid-template-columns:4em minmax(0,1fr) auto;align-items:center;gap:8px}.aw-dir-entry:disabled{cursor:default}
.aw-file-hit:hover,.aw-file-hit[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.aw-strong{font-weight:500}
.aw-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.aw-note{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.aw-warn{display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.aw-warn>svg{flex:none;margin-top:1px;color:var(--dsw-alias-state-warn-primary)}
.aw-mono{font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;overflow-wrap:anywhere}
.aw-select{height:30px;max-width:220px;min-width:0;padding:0 24px 0 10px;border-radius:var(--dsw-radius-md,10px);border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;text-overflow:ellipsis;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;background-size:12px 12px}
.aw-select:disabled{color:var(--dsw-alias-label-dimmed);opacity:.6;cursor:default}
.aw-menu-item-copy{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:260px;white-space:normal}
.aw-menu-item-label{font-size:13px;line-height:18px;font-weight:400;color:inherit}
.aw-menu-item-desc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.aw-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-field>span:first-child{font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-field .aw-input{width:100%}
.aw-textarea{width:100%;min-height:60px;resize:vertical;padding:8px 12px;border-radius:var(--dsw-radius-lg,12px);border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:18px;outline:none;transition:border-color 120ms ease}
.aw-textarea:focus{border-color:var(--dsw-alias-state-business-primary)}
.aw-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}
.aw-confirm-body{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);max-height:50vh;overflow:auto}

.aw-dock{container-type:inline-size;display:flex;flex-direction:column;gap:var(--dsh-composer-stack-gap,6px);flex:none;margin:0 auto;
  width:calc(100% - 2 * var(--dsh-composer-side-clearance,16px) - 4 * var(--dsh-composer-dock-inset,8px));
  max-width:calc(var(--dsh-composer-card-max-width,760px) - 4 * var(--dsh-composer-dock-inset,8px))}
.aw-card{position:relative;isolation:isolate;border-radius:var(--dsw-radius-lg,12px);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-panel);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
.aw-card::before{content:'';position:absolute;z-index:-1;inset:0;border-radius:inherit;pointer-events:none;background:var(--dsw-specific-menu,var(--dsw-alias-bg-base));backdrop-filter:var(--dsw-menu-backdrop-filter)}
.aw-card[data-tone=warn]{--dsw-elevation-stroke-color:var(--dsw-alias-state-warn-secondary)}
.aw-bar{display:flex;align-items:center;gap:8px;min-height:36px;padding:4px 6px 4px 12px;min-width:0}
.aw-bar-title{font-weight:500;white-space:nowrap}
.aw-quiet .aw-bar{min-height:32px;padding-left:4px}
.aw-quiet .aw-label{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.aw-info{display:flex;flex-direction:column;gap:6px;padding:0 4px 6px}
.aw-panel{display:flex;flex-direction:column;gap:14px;padding:12px;border-top:.5px solid var(--dsw-alias-border-l1);max-height:min(46vh,440px);overflow-y:auto;overscroll-behavior:contain}
.aw-section{display:flex;flex-direction:column;gap:8px;min-width:0}
.aw-section>h3{font-size:12px;font-weight:500;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.aw-config{display:flex;flex-wrap:wrap;gap:10px 16px}
.aw-config .aw-field{flex:1 1 160px;max-width:280px}
.aw-config .aw-select{max-width:none;width:100%}
.aw-model-list{display:flex;flex-direction:column;max-height:280px;overflow-y:auto;overscroll-behavior:contain}
.aw-notice{min-width:0;border-inline-start:2px solid var(--dsw-alias-label-tertiary);padding-inline-start:6px;overflow-wrap:anywhere}.aw-notice[data-level=warning]{border-color:var(--dsw-alias-state-warn-primary)}.aw-notice[data-level=error]{border-color:var(--dsw-alias-state-error-primary)}.aw-batch-choice{display:flex;align-items:center;gap:8px;padding-block:4px;min-width:0;overflow-wrap:anywhere}.aw-batch-choice input{flex:none}.aw-connection-notices{min-width:0}.aw-connection-notices>.aw-section{margin-inline-start:8px}
.aw-compact-summary{display:grid;gap:4px;max-height:18rem;overflow:auto;overflow-wrap:anywhere;overscroll-behavior:contain}
.aw-usage-meter{width:50px;height:5px;border-radius:4px;background:var(--dsw-alias-border-l1);overflow:hidden}.aw-usage-meter>i{display:block;height:100%;background:var(--dsw-alias-label-secondary)}.aw-usage-meta,.aw-usage-detail{font-variant-numeric:tabular-nums}.aw-usage-detail{display:grid;gap:5px;padding:6px 12px 8px 30px}.aw-usage-detail dl{display:grid;grid-template-columns:max-content 1fr;gap:3px 14px;margin:0}.aw-usage-detail dd{margin:0}
.aw-switch{display:inline-flex;align-items:center;gap:8px;font-size:13px;line-height:20px}
.aw-bar-error{padding:0 12px 8px}
@container (max-width:560px){.aw-bar .aw-hide-narrow{display:none}}

.aw-icon-btn{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background-color 120ms ease,color 120ms ease}
@media (hover:hover){.aw-icon-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.aw-icon-btn:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}

.aw-q-card{display:flex;flex-direction:column;width:100%;max-height:min(60vh,520px);padding:0 0 10px;border:0;border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-specific-input-major);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2-darkmode-thin,var(--dsw-alias-border-l2));box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);overflow:hidden;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
.aw-q-card[data-inline=true]{border:.5px solid var(--dsw-alias-border-l2);box-shadow:none}
.aw-q-card[data-minimized=true]{max-height:none;padding-bottom:0}
.aw-q-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-shrink:0;padding:18px 20px 0 24px}
.aw-q-card[data-minimized=true] .aw-q-head{padding-bottom:14px}
.aw-q-heading{flex:1;min-width:0}
.aw-q-eyebrow{margin-bottom:4px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.aw-q-head-actions{display:flex;align-items:center;gap:4px;flex-shrink:0;margin-left:auto}
.aw-q-title{margin:0;font-size:16px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;white-space:pre-wrap}
.aw-q-card[data-minimized=true] .aw-q-title{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.aw-q-body{display:flex;flex:1 1 auto;flex-direction:column;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.aw-q-title-wrap{flex-shrink:0;margin:4px 24px 0}
.aw-q-desc{flex-shrink:0;margin:6px 24px 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;overflow-wrap:anywhere;white-space:pre-wrap}
.aw-q-options{display:flex;flex-direction:column;gap:2px;margin:8px 0 0;padding:4px 12px}
.aw-q-option-wrap{display:flex;flex-direction:column;gap:4px}
.aw-q-option-row{position:relative;width:100%;min-height:40px;flex-shrink:0;border:.5px solid transparent;border-radius:var(--dsw-radius-md,10px);background:transparent;transition:background-color 120ms ease,border-color 120ms ease}
@media (hover:hover){.aw-q-option-row[data-interactive=true]:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-q-option-row[data-selected=true]{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.aw-q-option{display:flex;align-items:flex-start;gap:8px;width:100%;min-width:0;min-height:40px;padding:8px 12px 8px 8px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.aw-q-option:disabled{cursor:default}
.aw-q-num{display:grid;place-items:center;flex:0 0 20px;width:20px;height:20px;margin-top:2px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px}
.aw-q-check{display:grid;place-items:center;flex:0 0 20px;width:20px;height:20px;margin-top:2px}
.aw-q-check::before{content:'';grid-area:1/1;width:14px;height:14px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xs,4px);transition:background-color 120ms ease,border-color 120ms ease}
.aw-q-check>svg{grid-area:1/1}
.aw-q-check[data-checked=true]{color:var(--dsw-alias-label-primary-foreground)}
.aw-q-check[data-checked=true]::before{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-label-primary)}
.aw-q-copy{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.aw-q-line{display:flex;max-width:100%;align-items:baseline;flex-wrap:wrap;gap:2px 6px}
.aw-q-label{font-size:14px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.aw-q-badge{padding:0 4px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-specific-sidebar-nav-item-active-accent);color:var(--dsw-alias-button-info-fill);font-size:11px;line-height:18px;font-weight:600;white-space:nowrap}
.aw-q-opt-desc{display:block;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;font-weight:400;overflow-wrap:anywhere;white-space:pre-wrap}
.aw-q-preview{margin:0 12px 4px 36px}
.aw-q-custom-row{display:flex;align-items:flex-start;gap:8px;width:100%;min-height:40px;flex-shrink:0;padding:8px 12px 8px 8px;border:.5px solid transparent;border-radius:var(--dsw-radius-md,10px);transition:background-color 120ms ease,border-color 120ms ease}
@media (hover:hover){.aw-q-custom-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-q-custom-row:focus-within:not([data-yielded=true]),.aw-q-custom-row[data-active=true]{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
.aw-q-field{display:grid;min-width:0;--dsh-answer-field-padding:0}
.aw-q-field>*{grid-area:1/1;min-width:0;padding:var(--dsh-answer-field-padding);font:inherit;font-size:14px;line-height:24px;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}
.aw-q-field-mirror{box-sizing:content-box;max-height:144px;overflow:hidden;visibility:hidden}
.aw-q-field-input{resize:none;overflow-y:auto;border:0;outline:none;background:transparent;color:var(--dsw-alias-label-primary);caret-color:var(--dsw-alias-state-business-primary)}
.aw-q-field-input::placeholder{color:var(--dsw-alias-label-caption)}
.aw-q-inline{flex:1}
.aw-q-block{min-height:64px;flex-shrink:0;margin:0 12px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-module-platform);--dsh-answer-field-padding:8px 12px;transition:border-color 120ms ease}
.aw-q-block:focus-within{border-color:var(--dsw-alias-state-business-primary)}
.aw-q-num-wrap{margin:0 12px}
.aw-q-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;margin-top:12px;padding:0 24px 0 19px}
.aw-q-pager{display:flex;align-items:center;gap:6px;flex-shrink:0}
.aw-q-progress{padding:0 4px;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:24px;font-weight:500;white-space:nowrap;word-spacing:-2px;font-variant-numeric:tabular-nums}
.aw-q-feedback{flex:1;min-height:16px;color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px;text-align:right;overflow-wrap:anywhere}
.aw-q-actions{display:flex;align-items:center;gap:10px;flex-shrink:0}

.aw-approval-card{display:flex;flex-direction:column;overflow:hidden;width:100%;border:1px solid var(--dsw-alias-state-warn-secondary);border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-specific-input-major);box-shadow:var(--dsw-shadow-lv2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
.aw-approval-card[data-inline=true]{box-shadow:none}
.aw-approval-strip{display:flex;align-items:center;gap:8px;flex-shrink:0;padding:10px 14px 10px 16px;background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-primary);font-size:13px;line-height:18px;font-weight:500}
.aw-approval-strip .aw-icon-btn{margin-left:auto;color:var(--dsw-alias-state-warn-primary)}
.aw-approval-body{display:flex;flex-direction:column;gap:8px;min-width:0;max-height:var(--dsh-composer-text-max-height,min(40vh,360px));overflow-y:auto;overscroll-behavior:contain;padding:12px 16px 0}
.aw-approval-body .aw-call-detail{padding:0}
.aw-approval-headline{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:500;line-height:22px;overflow-wrap:anywhere}
.aw-approval-actions{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;padding:14px 16px}
.aw-approval-hint{margin-right:auto;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
@media (hover:hover){.aw-btn-reject:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);--dsh-button-outline-color:transparent}}
.aw-permit-context{border-inline-start:2px solid var(--dsw-alias-border-l2);padding-inline-start:10px}

.aw-plan-card{display:flex;flex-direction:column;overflow:hidden;width:100%;border:0;border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-specific-input-major);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-panel);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
.aw-plan-card[data-inline=true]{border:.5px solid var(--dsw-alias-border-l2);box-shadow:none}
.aw-plan-strip{display:flex;align-items:center;gap:8px;flex-shrink:0;padding:12px 14px 12px 16px;background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-primary);font-size:14px;line-height:20px;font-weight:500}
.aw-plan-strip .aw-icon-btn{margin-left:auto;color:var(--dsw-alias-state-warn-primary)}
.aw-plan-body{display:flex;flex-direction:column;gap:8px;min-width:0;max-height:min(45vh,380px);overflow-y:auto;overscroll-behavior:contain;padding:14px 16px 8px}
.aw-plan-title{font-size:15px;font-weight:500;line-height:22px;color:var(--dsw-alias-label-primary)}
.aw-plan-overview{font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.aw-plan-footer{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;padding:8px 16px 12px}
.aw-plan-footer .aw-reason{flex:1 1 180px;max-width:320px;margin-right:auto}

.aw-children-card{overflow:hidden}
.aw-children-body{display:flex;flex-direction:column;gap:4px;padding:6px 12px}
.aw-children-head{display:flex;align-items:center;gap:10px;width:100%;padding:0;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.aw-children-lead{display:grid;flex:none;place-items:center;width:16px;height:16px;color:var(--dsw-alias-label-tertiary)}
.aw-children-title{flex:none;font-size:13px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap}
.aw-children-progress{flex:1 1 auto;min-width:0;overflow:hidden;font-size:13px;line-height:20px;font-weight:400;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;text-overflow:ellipsis;white-space:nowrap}
.aw-children-progress-warn{color:var(--dsw-alias-state-warn-primary)}
.aw-children-chevron{display:grid;flex:none;place-items:center;width:16px;height:16px;color:var(--dsw-alias-label-tertiary)}
.aw-children-list{display:flex;flex-direction:column;gap:2px;margin:0 -6px;padding:0;list-style:none;max-height:min(45vh,360px);overflow-y:auto;overscroll-behavior:contain}
.aw-children-fold{display:flex;align-items:center;min-height:24px;margin:4px 6px 0;padding-top:4px;border-top:.5px solid var(--dsw-alias-border-l1)}
.aw-children-fold-btn{display:inline-flex;align-items:center;gap:4px;padding:2px 0;border:0;border-radius:var(--dsw-radius-xs,4px);background:transparent;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;cursor:pointer}
.aw-children-fold-btn:focus-visible{color:var(--dsw-alias-label-secondary)}
@media (hover:hover){.aw-children-fold-btn:hover{color:var(--dsw-alias-label-secondary)}}
.aw-children-fold-chevron{transition:transform 120ms ease;transform:rotate(-90deg)}
.aw-children-fold-chevron[data-open=true]{transform:none}
.aw-child{display:flex;flex-direction:column;min-width:0}
.aw-child-line{position:relative;display:flex;align-items:center;gap:10px;min-height:28px;padding:4px 6px;border-radius:var(--dsw-radius-sm,8px);min-width:0}
@media (hover:hover){.aw-child-line[data-interactive=true]:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-child-line:has(>.aw-child-trigger:focus-visible){outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.aw-child-trigger{display:flex;flex:1 1 auto;align-items:center;gap:10px;min-width:0;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left}
button.aw-child-trigger{cursor:pointer}
button.aw-child-trigger::after{content:'';position:absolute;inset:0;border-radius:inherit}
button.aw-child-trigger:focus-visible{outline:none}
.aw-child-glyph{display:grid;flex:none;place-items:center;width:16px;height:20px}
.aw-child-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:20px;font-weight:400;color:var(--dsw-alias-label-primary)}
.aw-child-status{flex:none;font-size:12px;line-height:20px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.aw-child-status[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}
.aw-child-status[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.aw-child-actions{position:relative;z-index:1;display:inline-flex;flex:none;align-items:center;gap:2px}
.aw-child-action{display:inline-flex;flex:none;align-items:center;justify-content:center;width:24px;height:24px;margin:-2px 0;padding:0;border:0;border-radius:var(--dsw-radius-xs,4px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:color 120ms ease,background-color 120ms ease}
@media (hover:hover){.aw-child-action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.aw-child-stop:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent));color:var(--dsw-alias-state-error-primary)}}
.aw-child-action:disabled{opacity:.4;cursor:default}
.aw-child-chevron{display:grid;flex:none;place-items:center;width:16px;height:20px;color:var(--dsw-alias-label-tertiary);pointer-events:none}
.aw-child-chevron>svg{transition:transform 120ms ease}
.aw-child-chevron[data-open=true]>svg{transform:rotate(180deg)}
.aw-child-ask{margin:4px 6px 6px}
.aw-child-body{margin:2px 6px 6px;padding:6px 0 2px 26px;border-top:.5px solid var(--dsw-alias-border-l1)}
.aw-child-error{margin:2px 6px 4px 32px}
.aw-panel-attention{background:var(--dsw-alias-state-warn-primary)}
.aw-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

.aw-review-patch{overflow:auto;max-width:100%;font:12px/1.55 ui-monospace,monospace}.aw-patch-line{display:grid;grid-template-columns:4em 4em minmax(max-content,1fr);min-width:max-content}.aw-patch-line>span,.aw-patch-line>button{text-align:end;padding:0 6px;color:var(--dsw-alias-label-tertiary)}.aw-patch-line>button{font:inherit;background:none;border:0;cursor:pointer;text-decoration:underline}.aw-patch-line>code{font:inherit;white-space:pre;padding-inline-start:7px}.aw-patch-line[data-side=add]{background:var(--dsw-alias-code-diff-added)}.aw-patch-line[data-side=del]{background:var(--dsw-alias-code-diff-deleted)}.aw-patch-hunk{color:var(--dsw-alias-label-secondary);white-space:pre;padding:3px 0}.aw-review-preview{border-inline-start:2px solid var(--dsw-alias-border-l1);padding-inline-start:10px;min-width:0}
.aw-task-lane{min-width:0;border-inline-start:2px solid var(--dsw-alias-border-l1);padding-inline-start:8px;margin-inline-start:5px}.aw-task-origin{font-size:11px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}.aw-task-nav{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;min-width:0}.aw-task-nav>.aw-strong{overflow-wrap:anywhere}.aw-task-scope{display:grid;gap:4px;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}.aw-task-progress{min-width:0;font-size:13px}.aw-task-progress .aw-text{max-height:12em;overflow:auto}
.aw-trace{margin:2px 0;min-width:0}
.aw-trace-head{display:flex;align-items:center;gap:8px;min-height:28px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.aw-trace-toggle{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;min-height:28px;padding:0 6px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
@media (hover:hover){.aw-trace-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.aw-trace-chevron{flex:none;margin-left:auto;color:var(--dsw-alias-label-tertiary)}
.aw-trace-body{display:flex;flex-direction:column;gap:8px;padding:4px 0 6px;min-width:0}
.aw-trace-foot{display:flex;justify-content:flex-end;padding-top:2px}
.aw-reply-toggle{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;padding:0 6px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;text-align:left;cursor:pointer}
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
.aw-file-link{padding:2px 0;max-width:100%;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
@media (hover:hover){.aw-file-link:hover{text-decoration:underline}}
.aw-call,.aw-call-detail{min-width:0;max-width:100%}.aw-call-meta{display:inline-flex;align-items:center;gap:7px;min-width:0;max-width:100%;margin-inline-start:7px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400}
.aw-call-view{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.aw-call-run{max-width:100%;min-width:0}.aw-call-run-body{margin-inline-start:8px;padding-inline-start:12px;border-inline-start:.5px solid var(--dsw-alias-border-l1);display:grid;gap:3px}.aw-run-summary{display:inline-flex;align-items:baseline;gap:7px;min-width:0;max-width:100%;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:12px}.aw-run-summary .aw-ellipsis{max-width:22em;min-width:0;color:var(--dsw-alias-label-tertiary)}
.aw-call-focus{font-family:var(--ds-font-family-code,ui-monospace,monospace)}.aw-call-status,.aw-exit,.aw-count,.aw-diff-totals{flex:none;white-space:nowrap;font-size:11px;font-variant-numeric:tabular-nums}.aw-call-status{display:inline-flex;align-items:center;gap:4px}.aw-call-status[data-quiet=true]{color:var(--dsw-alias-label-tertiary)}
.aw-call[data-state=failed] :is(.aw-exit,.aw-call-status),.aw-diff-totals span:last-child{color:var(--dsw-alias-state-error-primary)}.aw-diff-totals span:first-child{color:var(--dsw-alias-state-success-primary)}
.aw-code-window,.aw-output{max-height:18rem;overflow:auto;overscroll-behavior:contain}.aw-tech{font-size:12px;color:var(--dsw-alias-label-secondary)}.aw-tech>summary{cursor:pointer;width:fit-content;color:var(--dsw-alias-label-tertiary)}.aw-tech[open]>summary{margin-block-end:6px}
.aw-params:not(:empty){display:grid;gap:3px}.aw-params>div{display:grid;grid-template-columns:minmax(4em,max-content) minmax(0,1fr);gap:8px;font-size:12px}.aw-params dt{color:var(--dsw-alias-label-secondary)}.aw-params dd{white-space:pre-wrap;overflow-wrap:anywhere;max-height:8rem;overflow:auto}.aw-call-detail audio{max-width:100%}
.aw-mcp{min-width:0;display:grid;gap:8px}.aw-mcp-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap;overflow-wrap:anywhere}.aw-mcp-data{display:grid;gap:4px;min-width:0}.aw-mcp-data dl{margin:0;display:grid;gap:2px}.aw-mcp-data dl>div{display:grid;grid-template-columns:minmax(4em,27%) minmax(0,1fr);gap:8px;border-block-end:1px solid var(--dsw-alias-border-l1);padding-block:3px}.aw-mcp-data dt,.aw-mcp-data dd{min-width:0;overflow-wrap:anywhere;margin:0}.aw-mcp-data dt{color:var(--dsw-alias-label-secondary)}.aw-mcp-value{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 ui-monospace,monospace}.aw-mcp-content{display:grid;gap:6px;min-width:0}.aw-mcp-grid{overflow-x:auto;max-width:100%}.aw-mcp-grid table{border-collapse:collapse;font-size:12px;width:100%}.aw-mcp-grid th,.aw-mcp-grid td{text-align:start;vertical-align:top;overflow-wrap:anywhere;min-width:3em;max-width:30em;padding:4px 6px;border-block-end:1px solid var(--dsw-alias-border-l1)}.aw-mcp-grid th{color:var(--dsw-alias-label-secondary);font-weight:500}.aw-mcp-grid th[scope=row]{width:2.5em;min-width:2em}
.aw-plan>ol{display:grid;gap:4px}
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
.aw-log{margin:0;max-height:240px;overflow:auto;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-markdown-code-block);white-space:pre-wrap;overflow-wrap:anywhere;font:var(--dsw-font-markdown-code-block-small,12px/18px var(--ds-font-family-code,ui-monospace,Menlo,monospace));color:var(--dsw-alias-label-secondary)}
.aw-msg{display:flex;flex-direction:column;gap:2px;padding:8px 12px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-card-fill);min-width:0}
.aw-msg[data-role=user]{background:var(--dsw-specific-bubble);border-color:transparent;margin-left:32px}
.aw-msg-head{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.aw-img{max-width:100%;max-height:360px;border-radius:var(--dsw-radius-md,10px)}

.aw-page{container-type:inline-size;display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base)}
.aw-page-inner{display:flex;flex-direction:column;gap:20px;width:min(100%,960px);margin:0 auto;padding:28px clamp(24px,4vw,48px) 56px}
[data-platform=darwin] .aw-page-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.aw-page-inner{padding:20px 20px 48px}[data-platform=darwin] .aw-page-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.aw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.aw-head h1{font-size:20px;line-height:28px;font-weight:500}
.aw-head .aw-note{margin-top:4px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.aw-head-actions{display:flex;align-items:center;gap:10px;flex:none}
.aw-live{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.aw-banner{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-module-platform);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.aw-banner[data-tone=error]{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}
.aw-banner>svg{flex:none;margin-top:1px}
.aw-banner-text{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-hub{display:grid;grid-template-columns:minmax(220px,260px) minmax(0,1fr);gap:20px;align-items:start}
@container (max-width:740px){.aw-hub{grid-template-columns:minmax(0,1fr)}}
.aw-rail{display:flex;flex-direction:column;gap:4px;min-width:0;position:sticky;top:16px}
@container (max-width:740px){.aw-rail{position:static}}
.aw-prov{display:flex;flex-direction:column;gap:4px;width:100%;padding:10px 12px;border:.5px solid transparent;border-radius:var(--dsw-radius-md,10px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;min-width:0;transition:background-color 120ms ease}
@media (hover:hover){.aw-prov:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-prov[aria-current=true]{background:var(--dsw-specific-sidebar-nav-item-active)}
.aw-prov-top{display:flex;align-items:center;gap:6px;min-width:0}
.aw-prov-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.aw-item-sub{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.aw-hero{display:flex;flex-direction:column;gap:12px;padding:16px 18px;border-radius:var(--dsw-radius-xl,16px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-card-fill);min-width:0}
.aw-hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.aw-hero-title{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-hero-title h2{font-size:16px;font-weight:500;line-height:24px}
.aw-hero-cmd{display:inline-flex;align-items:center;gap:6px;max-width:100%;font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-hero-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:none}
.aw-catalog-head{display:flex;flex-direction:column;gap:10px}
.aw-catalog-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.aw-catalog-bar .aw-input{flex:1 1 220px}
.aw-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.aw-chip{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;transition:background-color 120ms ease,border-color 120ms ease,color 120ms ease}
@media (hover:hover){.aw-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.aw-chip[aria-pressed=true]{background:var(--dsw-specific-sidebar-nav-item-active);border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);font-weight:500}
.aw-dirty{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-state-warn-tertiary);border:.5px solid var(--dsw-alias-state-warn-secondary);color:var(--dsw-alias-label-primary);font-size:12px}
.aw-catalog{display:flex;flex-direction:column;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-alias-card-fill);overflow:hidden;min-width:0}
.aw-model-row{display:flex;align-items:center;gap:12px;padding:12px 16px;min-width:0;border-top:.5px solid var(--dsw-alias-border-l1);transition:background-color 120ms ease,opacity 120ms ease}
.aw-model-row:first-child{border-top:0}
@media (hover:hover){.aw-model-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-model-row[data-hidden=true] .aw-model-body{opacity:.52}
.aw-model-body{display:flex;flex-direction:column;gap:4px;flex:1 1 auto;min-width:0}
.aw-model-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;min-width:0}
.aw-model-name{font-size:14px;line-height:20px;font-weight:500;color:var(--dsw-alias-label-primary)}
.aw-model-id{font-size:11px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.aw-model-desc{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.aw-pills{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:2px;min-width:0}
.aw-pill{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:999px;font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l1);white-space:nowrap}
.aw-pill[data-tone=fast]{color:var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-state-warn-tertiary);border-color:transparent}
.aw-pill[data-tone=accent]{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary);border-color:transparent}
.aw-pill[data-tone=error]{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger);border-color:transparent}
.aw-pill[data-tone=thought]{color:var(--dsw-alias-label-primary)}
.aw-sub-card{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:var(--dsw-radius-xl,16px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-card-fill);min-width:0}
.aw-sub-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.aw-sub-head h3{font-size:13px;font-weight:500;line-height:20px}
.aw-sub-account{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;font-size:12px;line-height:18px}
.aw-quota-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.aw-quota-item{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:var(--dsw-radius-md,10px);border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-module-platform);min-width:0}
.aw-quota-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-width:0}
.aw-quota-label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aw-quota-pct{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.aw-quota-pct[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}
.aw-quota-pct[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.aw-quota-track{width:100%;height:6px;border-radius:999px;background:var(--dsw-alias-border-l1);overflow:hidden}
.aw-quota-fill{display:block;height:100%;border-radius:inherit;background:var(--dsw-alias-state-business-primary);transition:width 180ms ease}
.aw-quota-fill[data-tone=warn]{background:var(--dsw-alias-state-warn-primary)}
.aw-quota-fill[data-tone=error]{background:var(--dsw-alias-state-error-primary)}
.aw-quota-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.aw-sub-stats{display:flex;align-items:center;gap:6px 12px;flex-wrap:wrap;padding-top:10px;border-top:.5px solid var(--dsw-alias-border-l1);font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.aw-sub-stats strong{font-weight:500;color:var(--dsw-alias-label-secondary)}
.aw-steer{display:flex;align-items:center;gap:8px;padding:6px 8px}
.aw-steer .aw-input{flex:1 1 auto;min-width:0}
.aw-steer button{flex:none;white-space:nowrap}
.aw-url-link{color:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));text-decoration:underline;overflow-wrap:anywhere;font-size:12px}
.aw-empty-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:36px 20px;border:.5px dashed var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-alias-card-fill);text-align:center;color:var(--dsw-alias-label-secondary)}
.aw-stack{display:flex;flex-direction:column;gap:14px;min-width:0}
.aw-box{display:flex;flex-direction:column;gap:14px;padding:16px;border-radius:var(--dsw-radius-xl,16px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-card-fill);min-width:0}
.aw-box-head{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.aw-box-head h2,.aw-box-head h3{font-size:14px;font-weight:500;line-height:20px}
.aw-templates{display:flex;flex-direction:column;gap:8px;min-width:0}
.aw-templates-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.aw-templates-title{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.aw-template-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
.aw-template{display:flex;flex-direction:column;gap:3px;min-width:0;padding:8px 10px;border-radius:var(--dsw-radius-md,10px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color 120ms ease,border-color 120ms ease}
@media (hover:hover){.aw-template:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l3)}}
.aw-template:disabled{opacity:.55;cursor:default}
.aw-template[aria-pressed=true]{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary)}
.aw-template-top{display:flex;align-items:center;gap:6px;min-width:0}
.aw-template-cmd{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
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
.aw-menu-option{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:100%;height:34px;padding:0 8px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:400;line-height:20px;text-align:start;white-space:nowrap;cursor:pointer;outline:none}
.aw-menu-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;text-align:end;color:var(--dsw-alias-label-tertiary)}
.aw-menu-option>svg{flex:none;color:var(--dsw-alias-label-tertiary)}
.aw-menu-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.aw-menu-option:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-options{position:fixed;position-area:top span-left;align-self:end;justify-self:end;inset:auto;margin:0 0 8px;
  width:min(420px,anchor-size(width));max-height:min(24rem,calc(100% - 8px - max(12px,var(--dsh-frame-overlay-top,12px))));
  padding:14px;border:0;border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-specific-menu,var(--dsw-alias-bg-overlay));
  backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);
  --dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);
  overflow:auto;overscroll-behavior:contain;pointer-events:auto}
.aw-options:not(:popover-open){display:none}
.aw-found li{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:var(--dsw-radius-sm,8px);min-width:0}
@media (hover:hover){.aw-found li:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-empty{padding:24px 12px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:12px}
:is(.aw-dock,.aw-options) details>summary{cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-tb{display:inline-flex;align-items:center;gap:4px;flex:none}
.aw-tb-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 6px 0 8px;border:0;border-radius:var(--dsw-radius-sm,8px);outline:none;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;font-weight:400;white-space:nowrap;cursor:pointer;transition:background-color 120ms ease,color 120ms ease}
@media (hover:hover){.aw-tb-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.aw-tb-btn:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}
.aw-tb-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.aw-tb-btn[data-active=true]{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary);font-weight:500}
.aw-tb-btn[data-active=true][data-tone=fast]{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-primary)}
.aw-tb-btn[data-tone=plan]{background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary);font-weight:500}
@media (hover:hover){.aw-tb-btn[data-tone=plan]:hover:not(:disabled),.aw-tb-btn[data-active=true]:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-business-tertiary),var(--dsw-alias-state-business-primary) 6%)}.aw-tb-btn[data-active=true][data-tone=fast]:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-warn-tertiary),var(--dsw-alias-state-warn-primary) 8%)}}
.aw-tb-icon{width:28px;padding:0}
.aw-tb-chev{display:inline-flex;flex:none;color:var(--dsw-alias-label-caption);transition:transform 120ms ease}
.aw-tb-btn[data-tone=plan] .aw-tb-chev{color:currentColor}
.aw-tb-chev[data-open=true]{transform:rotate(180deg)}
.aw-ctx-root{display:inline-flex;align-items:center;flex:none}
.aw-ctx-btn{--aw-ctx-tint:var(--dsw-alias-label-secondary)}
.aw-ctx-btn[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);--aw-ctx-tint:var(--dsw-alias-label-primary)}
@media (hover:hover){.aw-ctx-btn:hover{--aw-ctx-tint:var(--dsw-alias-label-primary)}}
.aw-ctx-btn[data-tone=warn],.aw-ctx-btn[data-tone=warn]:hover,.aw-ctx-btn[data-tone=warn][aria-expanded=true]{--aw-ctx-tint:var(--dsw-alias-state-warn-primary)}
.aw-ctx-btn[data-tone=danger],.aw-ctx-btn[data-tone=danger]:hover,.aw-ctx-btn[data-tone=danger][aria-expanded=true]{--aw-ctx-tint:var(--dsw-alias-state-error-primary)}
.aw-ctx-track{fill:none;stroke:var(--dsw-alias-border-l3);stroke-width:2}
.aw-ctx-fill{fill:none;stroke:var(--aw-ctx-tint);stroke-width:2;stroke-linecap:round;transition:stroke 120ms ease,stroke-dasharray 180ms ease}
.aw-ctx-pop{position:fixed;inset:auto;margin:0;box-sizing:border-box;width:min(280px,calc(100vw - 24px));padding:12px;border:0;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-specific-menu,var(--dsw-alias-bg-overlay));backdrop-filter:var(--dsw-menu-backdrop-filter);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;overflow:auto;overscroll-behavior:contain;--aw-ctx-tint:var(--dsw-alias-label-secondary)}
.aw-ctx-pop:not(:popover-open){display:none}
.aw-ctx-pop[data-tone=warn]{--aw-ctx-tint:var(--dsw-alias-state-warn-primary)}
.aw-ctx-pop[data-tone=danger]{--aw-ctx-tint:var(--dsw-alias-state-error-primary)}
.aw-ctx-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.aw-ctx-title{color:var(--dsw-alias-label-tertiary);font-size:12px}
.aw-ctx-pct{font-weight:500;color:var(--dsw-alias-label-primary)}
.aw-ctx-pop[data-tone] .aw-ctx-pct{color:var(--aw-ctx-tint)}
.aw-ctx-nums{margin-top:4px;font-size:13px;font-weight:500;line-height:20px;color:var(--dsw-alias-label-primary)}
.aw-ctx-bar{height:4px;margin:8px 0 10px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);overflow:hidden}
.aw-ctx-bar>i{display:block;height:100%;border-radius:999px;background:var(--aw-ctx-tint)}
.aw-ctx-meta{display:flex;flex-direction:column;gap:3px}
.aw-v2-trace{display:flex;flex-direction:column;gap:6px;margin-top:4px;min-width:0}
.aw-v2-trace-btn{display:inline-flex;align-items:center;align-self:flex-start;gap:6px;height:24px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-turn-trigger-bg);color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;line-height:16px;cursor:pointer;transition:background-color 120ms ease,color 120ms ease,border-color 120ms ease}
@media (hover:hover){.aw-v2-trace-btn:hover{background:var(--dsw-alias-turn-trigger-bg-hover);border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}}
.aw-v2-trace-btn[aria-expanded=true]{background:var(--dsw-alias-turn-trigger-bg-hover);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.aw-tv-card{display:flex;flex-direction:column;min-width:0}
.aw-tv-row{min-width:0}
.aw-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.aw-tv-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.aw-tv-suffix{flex:none;margin-left:4px;white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));font-variant-numeric:tabular-nums}
.aw-tv-diff-stat{margin-left:10px;font-family:var(--ds-font-family-code);font-size:calc(var(--dsh-content-font-size-secondary,13px) - 2px);transform:translateY(.5px)}
.aw-tv-row[aria-expanded=true] .aw-tv-diff-added{color:var(--dsw-alias-state-success-primary)}
.aw-tv-row[aria-expanded=true] .aw-tv-diff-removed{color:var(--dsw-alias-state-error-primary)}
@media (hover:hover){.aw-tv-row:hover .aw-tv-diff-added{color:var(--dsw-alias-state-success-primary)}.aw-tv-row:hover .aw-tv-diff-removed{color:var(--dsw-alias-state-error-primary)}}
.aw-tv-error{color:var(--dsw-alias-state-error-primary)}
.aw-tv-stopped{color:var(--dsw-alias-state-warn-label)}
.aw-tv-exit{flex:none;margin-left:8px;gap:5px}
.aw-tv-exit-dot{flex:none;width:4px;height:4px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-error-primary)}
.aw-tv-tag{flex:none;margin-left:6px}
.aw-tv-body{display:flex;flex-direction:column;min-width:0}
.aw-tv-block{margin:4px 0 4px 4px}
.aw-tv-panel{display:flex;flex-direction:column;gap:8px;max-height:320px;margin:4px 0 4px 4px;padding:10px 12px;overflow:auto;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block)}
.aw-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.aw-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.aw-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.aw-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.aw-tv-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.aw-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.aw-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.aw-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.aw-tv-prose{font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary);min-width:0}
.aw-tv-files{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 4px 4px}
.aw-tv-file{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (hover:hover){.aw-tv-file:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.aw-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.aw-tv-inspect:focus-visible{opacity:1}
@media (hover:hover){.aw-tv-card:hover .aw-tv-inspect{opacity:1}.aw-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.aw-tv-inspect{opacity:1}}
.aw-wait{display:flex;align-items:center;gap:6px;max-width:100%;color:var(--dsw-alias-label-tertiary);font-size:var(--dsh-content-font-size,14px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.aw-wait-icon{display:inline-flex;flex:none;align-items:center;justify-content:center;width:calc(16px + var(--dsh-content-font-delta,0px));height:calc(16px + var(--dsh-content-font-delta,0px));color:inherit}
.aw-wait-icon>svg{width:calc(14px + var(--dsh-content-font-delta,0px));height:calc(14px + var(--dsh-content-font-delta,0px))}
.aw-wait-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-width:720px){.aw-q-head{padding:12px 12px 0 18px}.aw-q-title-wrap,.aw-q-desc{margin-inline:18px}.aw-q-options{padding:4px 8px}.aw-q-title{font-size:15px;line-height:21px}.aw-q-option,.aw-q-custom-row{padding:8px 6px}.aw-q-footer{padding:0 12px}}
@media (prefers-reduced-motion:reduce){.aw-q-option-row,.aw-q-custom-row,.aw-tb-btn,.aw-tb-chev{transition:none}}
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
    const isPlainObj = value => typeof value === 'object' && value !== null && !Array.isArray(value)
    function mergeToolUpdate(previous, update) {
      const prev = previous ?? {}, next = defined(update ?? {}), merged = { ...prev, ...next }
      if (isPlainObj(prev.rawInput) && Object.keys(prev.rawInput).length > 0 && isPlainObj(next.rawInput) && Object.keys(next.rawInput).length === 0) merged.rawInput = prev.rawInput
      if (Array.isArray(prev.locations) && prev.locations.length > 0 && Array.isArray(next.locations) && next.locations.length === 0) merged.locations = prev.locations
      if (isPlainObj(prev._meta) && isPlainObj(next._meta)) merged._meta = { ...prev._meta, ...defined(next._meta) }
      return merged
    }
    function mergePermissionToolCall(previous, call) {
      if (!isPlainObj(call)) return previous ?? {}
      const patch = { kind: call.kind, name: call.name, rawInput: call.rawInput, locations: call.locations, _meta: call._meta }
      const hasPrevInput = isPlainObj(previous?.rawInput) && Object.keys(previous.rawInput).length > 0
      const hasCallInput = isPlainObj(call.rawInput) && Object.keys(call.rawInput).length > 0
      if (typeof call.title === 'string' && call.title.trim() && (hasCallInput || !hasPrevInput)) patch.title = call.title
      return mergeToolUpdate(previous, patch)
    }
    const clock = at => { try { return new Date(at).toLocaleTimeString() } catch { return '' } }
    const stamp = at => { try { return new Date(at).toLocaleString() } catch { return String(at ?? '') } }
    const number = value => { try { return new Intl.NumberFormat().format(value) } catch { return String(value) } }
    const settle = (state, live) => state === 'ongoing' && !live ? 'idle' : state
    const eventLabel = event => [event.type, event.data?.method, updateOf(event)?.sessionUpdate].filter(Boolean).join(' · ')

    const AGY_SUBAGENT_CALL_RE = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):.+$/iu
    function cliParentOf(update) {
      const id = update?._meta?.claudeCode?.parentToolUseId
      return typeof id === 'string' && id.trim() ? id : undefined
    }
    function agySubagentIdOf(update) {
      const id = update?.toolCallId
      if (typeof id !== 'string') return undefined
      const match = AGY_SUBAGENT_CALL_RE.exec(id)
      return match ? match[1] : undefined
    }
    function resolveAgyParent(launches, parents, subagentId) {
      if (!subagentId) return undefined
      const existing = parents.get(subagentId)
      if (existing) return existing
      const unbound = launches.find(entry => !entry.boundConvId)
      if (unbound) {
        unbound.boundConvId = subagentId
        parents.set(subagentId, unbound.toolCallId)
        return unbound.toolCallId
      }
      const last = launches.at(-1)
      if (last) {
        parents.set(subagentId, last.toolCallId)
        return last.toolCallId
      }
      return undefined
    }
    function updatePatchFrame(row, update) {
      if (Array.isArray(update.content) && (row.patchFrame || ['edit','move','delete'].includes(update.kind ?? row.tool.kind) || update.content.some(b => b?.type === 'diff'))) {
        const stage = update.sessionUpdate === 'tool_call' ? 'launch' : update.status === 'completed' ? 'completed' : update.status === 'failed' ? 'failed' : 'update'
        const rawKey = ['rawOutput','rawInput'].find(k => update[k]?.call_id === update.toolCallId && update[k]?.changes)
        row.patchFrame = { stage, rawKey }
      } else if (row.patchFrame?.rawKey && update[row.patchFrame.rawKey] != null) row.patchFrame = { stage: row.patchFrame.stage }
    }
    // external: Codex appends terminal_output chunks while Claude Code replaces the full transcript under the same key
    function foldTerminal(row, u) {
      const id = u.toolCallId, m = u._meta, info = m?.terminal_info
      if (u.sessionUpdate === 'tool_call' && row.tool.toolCallId) row.terminal = null
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
    function namedPlan(update) {
      const p = update?.sessionUpdate === 'plan_update' ? update.plan : null
      const id = update?.sessionUpdate === 'plan_removed' ? update.planId : p?.planId
      if (typeof id !== 'string' || !id.trim()) return null
      if (!p) return { id, type: 'removed' }
      if (p.type === 'markdown' && typeof p.content === 'string') return { id, type: 'markdown', content: p.content, ...(typeof p.path === 'string' && p.path && { path: p.path }) }
      if (p.type === 'items' && Array.isArray(p.entries) && p.entries.every(e => typeof e?.content === 'string' && typeof e.status === 'string')) return { id, type: 'items', entries: p.entries }
      return null
    }

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
      return part
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
        return
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

    function noticeReceipt(event, remoteId) {
      const data = event?.data, params = data?.params, u = params?.update
      if (event?.type !== 'notification' || data?.method !== 'session/update' || typeof remoteId !== 'string' || !remoteId.trim() || params?.sessionId !== remoteId || u?.sessionUpdate !== 'notice' ||
        typeof u.title !== 'string' || !u.title.trim() || typeof u.severity !== 'string' || !u.severity.trim()) return null
      const parent = u._meta?.claudeCode?.parentToolUseId
      return { kind: 'notice', seq: event.seq, at: event.at, phase: data.turnId ? 'turn' : data.noticePhase === 'connect' || data.replay ? 'connect' : 'session',
        severity: u.severity, title: u.title, ...(typeof u.description === 'string' && u.description.trim() && { description: u.description }),
        ...(typeof parent === 'string' && parent.trim() && { cliParent: parent }) }
    }

    function cursorTaskToolUpdate(params) {
      if (!isPlainObj(params)) return null
      const id = firstText(params.toolCallId, params.taskId, params.id)
      if (!id) return null
      const rawStatus = typeof params.status === 'string' ? params.status.toLowerCase() : ''
      const status = rawStatus === 'completed' || rawStatus === 'done' || rawStatus === 'succeeded' ? 'completed'
        : rawStatus === 'failed' || rawStatus === 'error' ? 'failed'
          : rawStatus === 'cancelled' || rawStatus === 'canceled' ? 'cancelled'
            : rawStatus === 'pending' ? 'pending' : 'in_progress'
      const description = firstText(params.description, params.title) ?? 'Cursor task'
      const resultText = firstText(params.result, params.output, params.summary, params.error)
      return {
        toolCallId: `cursor_task:${id}`,
        name: 'Agent',
        kind: 'think',
        title: description,
        status,
        rawInput: defined({
          description,
          prompt: typeof params.prompt === 'string' ? params.prompt : undefined,
          model: typeof params.model === 'string' ? params.model : undefined,
          subagent_type: typeof params.subagentType === 'string' ? params.subagentType : typeof params.type === 'string' ? params.type : undefined,
        }),
        ...(resultText ? { content: [{ type: 'content', content: { type: 'text', text: resultText } }] } : {}),
      }
    }

    function timeline(events, remoteId) {
      const rows = []
      const tools = new Map()
      const plans = new Map(), compactions = new Map(), windows = new Map()
      const agyByTurn = new Map()
      const agyStateFor = turnId => {
        const key = turnId ?? null
        let state = agyByTurn.get(key)
        if (!state) { state = { launches: [], parents: new Map() }; agyByTurn.set(key, state) }
        return state
      }
      let section = 0, progressSeq = 0, connectionSeq = 0
      for (const event of events) {
        const data = event.data ?? {}
        const update = updateOf(event)
        const cursorMethod = data.method?.replace(/^_/u, '')
        const agyState = agyStateFor(data.turnId)
        const kind = update?.sessionUpdate, plan = namedPlan(update)
        const parent = cliParentOf(update) ?? resolveAgyParent(agyState.launches, agyState.parents, agySubagentIdOf(update))
        if (event.type === 'initialize') connectionSeq = event.seq
        const totals = event.type === 'turn-result' ? sessionTotals(data.usage) : null
        const role = event.type === 'user-message' ? 'user' : kind === 'agent_message_chunk' ? 'assistant' : kind === 'agent_thought_chunk' ? 'thinking' : kind === 'user_message_chunk' ? 'user' : null
        const text = update?.content?.type === 'text' ? update.content.text : null
        const previous = rows.at(-1)
        if (role || plan || kind === 'plan' || cursorMethod === 'cursor/update_todos') section = event.seq
        if (cursorMethod === 'cursor/task') {
          const taskUpdate = cursorTaskToolUpdate(data.params)
          if (taskUpdate) {
            const key = JSON.stringify([!!data.replay, data.turnId, taskUpdate.toolCallId])
            let row = tools.get(key)
            if (!row) { row = { kind: 'tool', seq: event.seq, section, turnId: data.turnId, tool: {}, cliTask: true, replay: !!data.replay }; tools.set(key, row); rows.push(row) }
            row.tool = mergeToolUpdate(row.tool, taskUpdate)
          }
          continue
        }
        if (role && parent) {
          if (role === 'thinking') continue
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
          row.tool = mergeToolUpdate(row.tool, foldTerminal(row, update) ?? update)
          if (parent) row.cliParent = row.cliParent === undefined || row.cliParent === parent ? parent : null
          const launchName = row.tool.name ?? row.tool._meta?.claudeCode?.toolName
          if (['Agent', 'Task', 'invoke_subagent'].includes(launchName)) {
            row.cliTask = true
            if (launchName === 'invoke_subagent' && row.tool.toolCallId && !agyState.launches.some(item => item.toolCallId === row.tool.toolCallId)) {
              agyState.launches.push({ toolCallId: row.tool.toolCallId, boundConvId: null })
            }
          }
        } else if (kind === 'compaction_update' || kind === 'compaction_summary_chunk') {
          foldCompaction(rows, compactions, data.replay ? ['replay', connectionSeq] : 'live', event, update)
          section = event.seq
        } else if (plan) {
          const key = JSON.stringify(['named', connectionSeq, !!data.replay, data.turnId, plan.id])
          let row = plans.get(key)
          if (!row) {
            row = { kind: 'plan', seq: event.seq, cliParent: parent, turnId: data.turnId, replay: !!data.replay }
            plans.set(key, row); rows.push(row)
          } else if (plan.type !== 'removed') {
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
          if (window) recordWindow(rows, windows, JSON.stringify([connectionSeq, !!data.replay, data.turnId ?? ['event', event.seq]]), event, window)
        } else if (totals) {
          rows.push({ kind: 'usage-totals', seq: event.seq, totals, stopReason: data.stopReason })
        } else if (event.type === 'stderr') {
          if (previous?.kind === 'stderr') previous.text += data.text ?? ''
          else rows.push({ kind: 'stderr', seq: event.seq, text: data.text ?? '' })
        } else if (!MESSAGE_UPDATES.has(kind)) {
          if (event.type === 'interaction' && data.kind === 'permission' && data.params?.toolCall?.toolCallId) {
            const toolRow = tools.get(JSON.stringify([!!data.replay, data.turnId, data.params.toolCall.toolCallId]))
            if (toolRow) toolRow.tool = mergePermissionToolCall(toolRow.tool, data.params.toolCall)
          }
          rows.push({ kind: 'event', ...event })
        }
      }
      return rows
    }

    const kindIcons = new Map(Object.entries({ read: IconBrowseOutlineRegular, search: IconSearchOutlineRegular,
      edit: IconEditOutlineRegular, delete: IconEditOutlineRegular, move: IconBranchOutlineRegular,
      execute: IconPlayOutlineRegular, fetch: IconGlobeOutlineRegular, think: IconSparkleRegular, switch_mode: IconBranchOutlineRegular }))
    const firstText = (...values) => values.find(value => typeof value === 'string' && value.trim() !== '')
    const unwrap = block => block?.type === 'content' ? block.content : block
    const plainText = block => unwrap(block)?.type === 'text' && typeof unwrap(block).text === 'string'
    const unfence = text => /^(`{3,})[^\n`]*\r?\n([\s\S]*)\r?\n\1\s*$/u.exec(text)?.[2] ?? text
    const validDiff = b => b?.type === 'diff' && typeof b.path === 'string' && !!b.path.trim() && typeof b.newText === 'string' && (b.oldText == null || typeof b.oldText === 'string')
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
    function writeIntent(tool, input) {
      const wire = tool.name, meta = tool._meta?.claudeCode?.toolName
      const name = wire ?? meta
      const isWriteName = name === 'Write' || name === 'write_file' || name === 'write_to_file'
      if (tool.kind !== 'edit' || !isWriteName || (meta != null && meta !== 'Write' && meta !== 'write_file' && meta !== 'write_to_file')) return null
      const path = firstText(input.file_path, input.path, input.Path, input.target_file, input.TargetFile)
      if (!path) return null
      const content = input.content ?? input.Content ?? input.CodeContent ?? input.contents ?? input.file_text ?? input.file_content
      return { path, content: typeof content === 'string' ? content : undefined }
    }
    function toolFace(tool, terminal, approval = false) {
      const input = tool.rawInput ?? {}, out = tool.rawOutput ?? {}
      const blocks = Array.isArray(tool.content) ? tool.content.filter(Boolean) : []
      const mcp = mcpIdentity(tool, approval)
      const path = !mcp && tool.kind !== 'fetch' && firstText(input.file_path, input.path, input.Path, input.filePath, input.target_file, input.notebook_path, input.AbsolutePath, input.TargetFile)
      const argv = Array.isArray(input.command) && input.command.length && input.command.every(s => typeof s === 'string') ? input.command : null
      const command = !mcp ? firstText(input.command, input.CommandLine) ?? (argv && (terminal || tool.kind === 'execute') ? JSON.stringify(argv) : undefined) : undefined
      const kind = mcp ? 'mcp' : kindIcons.has(tool.kind) ? tool.kind : blocks.some(validDiff) ? 'edit' : command ? 'execute' : 'other'
      const locations = (Array.isArray(tool.locations) ? tool.locations : []).filter(l => typeof l?.path === 'string' && l.path)
      const seen = new Set(), targets = [...locations, ...blocks.filter(validDiff).map(b => ({ path: b.path })), ...(path ? [{ path }] : [])].filter(l => {
        const key = `${l.path}:${l.line ?? ''}`
        if (seen.has(key) || (!l.line && seen.has(l.path))) return false
        seen.add(key); seen.add(l.path); return true
      })
      const query = firstText(input.pattern, input.query, input.Query, input.SearchTerm, input.glob)
      const web = kind === 'fetch' ? webAction(tool, input) : null
      const focus = mcp ? [mcp.server, mcp.name].filter(Boolean).join(' / ') : kind === 'execute' ? command : web ? firstText(web.pattern, web.url, web.queries?.join(', '), web.query, query) : kind === 'search' ? query : kind === 'think' ? firstText(input.description) : undefined
      const lastExit = tool.toolCallId && tool._meta?.terminal_exit?.terminal_id === tool.toolCallId ? tool._meta.terminal_exit : null
      let exitCode = terminal?.exitCode ?? (out.call_id == null || out.call_id === tool.toolCallId ? [out.exitCode, out.exit_code, out.return_code].find(Number.isInteger) : undefined) ?? (Number.isInteger(lastExit?.exit_code) ? lastExit.exit_code : undefined)
      if (exitCode === undefined && !mcp && kind === 'execute' && tool.status === 'failed') {
        const headText = blocks.filter(plainText).map(b => unwrap(b).text).join('\n') || (typeof out === 'string' ? out : '')
        const m = /^Exit code (-?\d+)\b/u.exec(headText.trimStart())
        if (m) exitCode = Number(m[1])
      }
      const signal = terminal?.signal ?? firstText(lastExit?.signal)
      return { kind, mcp, web, write: !mcp && writeIntent(tool, input), input, blocks, targets, command, focus, exitCode: mcp ? undefined : exitCode, signal: mcp ? undefined : signal, hasTerminal: !!terminal }
    }

    const explorationKinds = new Set(['read', 'search', 'fetch'])
    function callState(tool, face, live) {
      const out = tool.rawOutput
      if (tool.status === 'cancelled' || tool.status === 'canceled') return 'cancelled'
      if (tool.status === 'failed' || (face.exitCode !== undefined && face.exitCode !== 0) || out?.isError === true || out?.is_error === true || face.signal) return 'failed'
      if (tool.status === 'completed') return 'completed'
      return live ? (tool.status === 'in_progress' ? 'in_progress' : 'pending') : 'unfinished'
    }

    const callKey = (id, turn) => JSON.stringify([turn ?? null, id])
    function cliActivities(rows) {
      const tools = new Map(), tasks = new Map(), origin = new Map(), requests = new Map(), receiptFor = new Map()
      const keyFor = (r, id) => callKey(id, r.turnId ?? r.data?.turnId)
      const unbound = r => r.replay || r.data?.replay || (Object.hasOwn(r, 'turnId') && !r.turnId)
      for (const row of rows) if (!unbound(row) && row.tool?.toolCallId) tools.set(keyFor(row, row.tool.toolCallId), row)
      const taskFor = row => {
        let task = tasks.get(row.seq)
        if (!task) { task = { row, title: firstText(row.tool.rawInput?.description, row.tool.rawInput?.Role, row.tool.title) ?? row.tool.toolCallId, calls: 0, permissions: [] }; tasks.set(row.seq, task) }
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

    function webAddress(value) {
      if (typeof value !== 'string' || !/^https?:\/\//iu.test(value) || /[\s\\\p{Cc}]/u.test(value)) return null
      try { const u = new URL(value); return u.hostname && !u.username && !u.password ? value : null } catch { return null }
    }
    const textList = value => Array.isArray(value) && value.every(v => typeof v === 'string') ? value.filter(v => v.trim()) : []
    function webAction(tool, input) {
      const name = firstText(tool.name, tool._meta?.claudeCode?.toolName), same = !tool.name || !tool._meta?.claudeCode?.toolName || tool.name === tool._meta.claudeCode.toolName
      const url = firstText(input.url, input.Url), query = firstText(input.query, input.Query, input.SearchTerm)
      const mode = same && (name === 'WebSearch' || name === 'search_web') ? 'search' : same && (name === 'WebFetch' || name === 'read_url_content') ? 'page' : 'unknown'
      const a = input.action
      if (!name && typeof input.query === 'string' && a && ['search', 'open_page', 'find_in_page'].includes(a.type)) {
        const queries = textList(a.queries)
        return { mode: a.type === 'open_page' ? 'page' : a.type === 'find_in_page' ? 'find' : 'search', url: firstText(a.url), query, queries: [...new Set([...queries, firstText(a.query)].filter(Boolean))], pattern: firstText(a.pattern) }
      }
      return { mode, url, query, prompt: same && name === 'WebFetch' ? firstText(input.prompt) : undefined,
        offset: same && name === 'WebFetch' && Number.isSafeInteger(input.offset) && input.offset >= 0 ? input.offset : undefined,
        allowed: mode === 'search' ? textList(input.allowed_domains) : [], blocked: mode === 'search' ? textList(input.blocked_domains) : [] }
    }
    // external: Claude Code WebSearch emits "Title (url)" lines; Antigravity/Cursor also emit Markdown "[Title](url)" source lines
    function webSections(text, mixed) {
      if (!text) return []
      const sections = [], lines = text.split(/\r?\n/u), seenUrls = new Set()
      for (const line of lines) {
        const trimmed = line.trim()
        if (/^Sources:?$/iu.test(trimmed) && mixed) continue
        const paren = /^(.+) \((https?:\/\/[^\s)]+)\)$/iu.exec(trimmed)
        const md = !paren ? /^(?:[-*+]\s+|\[\d+\]\s+|\d+\.\s+)?\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)(?:\s*[—:-]\s*(.*))?$/iu.exec(trimmed) : null
        const url = paren ? webAddress(paren[2]) : md ? webAddress(md[2]) : null
        if (!url && !mixed) return [{ text }]
        const last = sections.at(-1)
        if (url) {
          if (seenUrls.has(url)) continue
          seenUrls.add(url)
          const title = (paren ? paren[1] : md[1]).trim()
          const source = { title, url }
          if (last?.sources) last.sources.push(source); else sections.push({ sources: [source] })
        }
        else if (last && !last.sources) last.text += '\n' + line
        else sections.push({ text: line })
      }
      return sections
    }
    function numberedRead(text) {
      if (!text) return null
      const rawLines = text.replace(/\r?\n$/u, '').split(/\r?\n/u)
      while (rawLines.length > 0 && (/^(?:Showing lines \d+-\d+ of \d+|Partial read \(|Created At:|Completed At:)/u.test(rawLines[0].trim()) || rawLines[0].trim() === '')) {
        if (rawLines[0].trim() === '' && rawLines.length > 1 && /^\s*\d+(?:\t|→|: )/u.test(rawLines[1])) { rawLines.shift(); continue }
        if (/^(?:Showing lines \d+-\d+ of \d+|Partial read \(|Created At:|Completed At:)/u.test(rawLines[0].trim())) { rawLines.shift(); continue }
        break
      }
      while (rawLines.length > 0 && /^\[File truncated:[^\]]*\]$/u.test(rawLines[rawLines.length - 1].trim())) rawLines.pop()
      if (!rawLines.length) return null
      const rows = rawLines.map(line => /^\s*(\d+)(?:\t|→|: )(.*)$/u.exec(line))
      if (rows.some((row, i) => !row || !Number.isSafeInteger(+row[1]) || +row[1] < 1 || (i && +row[1] <= +rows[i - 1][1]))) return null
      return rows.map(row => ({ number: +row[1], text: row[2] }))
    }
    function searchResult(raw, text, input = {}) {
      const mode = raw?.mode ?? input.output_mode ?? ([true, 'true'].includes(input['-c']) ? 'count' : [true, 'true'].includes(input['-l']) ? 'files_with_matches' : undefined)
      if (mode === 'count') return null
      const paths = raw?.filenames ?? raw?.paths, listed = Array.isArray(paths) && paths.every(p => typeof p === 'string' && p.trim())
      if (mode !== 'content' && listed && (paths.length || !text)) return { kind: 'paths', paths, total: paths.length, truncated: raw.truncated === true }
      const output = mode === 'content' ? firstText(raw?.content, text) : text
      if (!output) return null
      const rawRows = output.replace(/\r?\n$/u, '').split(/\r?\n/u)
      let truncated = raw?.truncated === true
      const rows = []
      for (const line of rawRows) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === '--') continue
        if (/^(?:\.\.\.|…|\[(?:truncated|more|\d+ more|results truncated)|Showing first \d+|Results truncated)/iu.test(trimmed)) { truncated = true; continue }
        rows.push(line)
      }
      if (!rows.length) return null
      if (mode === 'files_with_matches') {
        const cleanPaths = rows.map(line => line.trim()).filter(p => p && !/\s/u.test(p) && (p.includes('/') || p.includes('\\') || /\.[A-Za-z0-9]{1,10}$/u.test(p)))
        if (cleanPaths.length === rows.length) return { kind: 'paths', paths: cleanPaths, total: cleanPaths.length, truncated }
        return null
      }
      const files = new Map()
      const single = mode === 'content' && listed && paths.length === 1 && (raw.numFiles == null || raw.numFiles === 1) ? paths[0] : null
      let matchCount = 0
      for (const line of rows) {
        if (!single && mode === 'content' && /^\d+:/u.test(line)) return null
        const bare = single && /^(\d+):(.*)$/u.exec(line)
        const m = bare ? [null, single, bare[1], bare[2]] : /^(.+?):(\d+):(.*)$/u.exec(line)
        if (!m || !Number.isSafeInteger(+m[2]) || +m[2] < 1) {
          const allPaths = rows.map(r => r.trim())
          if (allPaths.every(p => p && !/\s/u.test(p) && (p.includes('/') || p.includes('\\') || /\.[A-Za-z0-9]{1,10}$/u.test(p)))) {
            return { kind: 'paths', paths: allPaths, total: allPaths.length, truncated }
          }
          return null
        }
        if (!files.has(m[1])) files.set(m[1], { path: m[1], matches: [] })
        files.get(m[1]).matches.push({ lineNumber: +m[2], line: m[3] })
        matchCount++
      }
      return { kind: 'matches', files: [...files.values()], total: matchCount, truncated }
    }

    function booleanSelectPair(choices) {
      if (!Array.isArray(choices) || choices.length !== 2) return null
      const values = choices.map(item => typeof item === 'string' ? item : item?.value ?? item?.id)
      if (values.some(item => typeof item !== 'string' || !item)) return null
      const lower = values.map(item => item.toLowerCase())
      const trueIdx = lower.findIndex(item => item === 'true' || item === 'on')
      const falseIdx = lower.findIndex(item => item === 'false' || item === 'off')
      if (trueIdx < 0 || falseIdx < 0 || trueIdx === falseIdx) return null
      return { on: values[trueIdx], off: values[falseIdx] }
    }

    function providerVisibleModels(provider) {
      const hidden = new Set(provider?.hiddenModels ?? [])
      const advertised = provider?.advertised?.models ?? []
      const advertisedIds = new Set(advertised.map(model => model.id))
      const extras = (provider?.models ?? []).filter(model => {
        if (!model?.id || model.id === 'default' || advertisedIds.has(model.id)) return false
        const base = /^([^[\]]+)\[[^[\]]*\]$/u.exec(model.id)?.[1]?.trim()
        if (base && (advertisedIds.has(base) || (base === 'default' && advertisedIds.has('auto')))) return false
        if (advertised.some(entry => model.id.startsWith(`${entry.id}-`) && entry.reasoning?.efforts?.some(e => e.id.toLowerCase() === model.id.slice(entry.id.length + 1).toLowerCase()))) return false
        return true
      })
      return [...advertised, ...extras].filter(model => model.id !== 'default' && !hidden.has(model.id))
    }

    function configEntries(session, t) {
      const entries = []
      for (const option of session.configOptions ?? []) {
        if (!option?.id) continue
        const label = option.name ?? option.id
        const description = typeof option.description === 'string' ? option.description.trim() : ''
        if (option.type === 'boolean') entries.push({ id: option.id, label, description, category: option.category, kind: 'boolean', value: !!option.currentValue, op: value => ({ configId: option.id, value }) })
        else entries.push({ id: option.id, label, description, category: option.category, kind: 'select', value: option.currentValue ?? '',
          options: (option.options ?? []).flatMap(group => group.options ?? [group]).map(item => ({ value: item.value, label: item.name ?? String(item.value), description: typeof item.description === 'string' ? item.description.trim() : '' })),
          op: value => ({ configId: option.id, value }) })
      }
      if (!entries.some(entry => entry.category === 'mode') && session.modes?.availableModes?.length) {
        entries.push({ id: '__mode', label: t('mode'), category: 'mode', kind: 'select', value: session.modes.currentModeId ?? '',
          options: session.modes.availableModes.map(mode => ({ value: mode.id, label: mode.name ?? mode.id, description: typeof mode.description === 'string' ? mode.description.trim() : '' })), op: value => ({ modeId: value }) })
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

        ctx.effect(() => {
          const style = document.createElement('style')
          style.setAttribute('data-acp-workbench', '')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'acp-workbench: styles')

        const confirmStore = { current: null, resolve: null, listeners: new Set() }
        const notifyConfirm = () => { for (const fn of confirmStore.listeners) fn() }
        const askConfirm = (body, opts = {}) => new Promise(resolve => {
          confirmStore.resolve?.(false)
          confirmStore.resolve = resolve
          confirmStore.current = { body, title: opts.title, confirmLabel: opts.confirmLabel, danger: Boolean(opts.danger) }
          notifyConfirm()
        })
        const finishConfirm = ok => {
          const resolve = confirmStore.resolve
          confirmStore.resolve = null
          confirmStore.current = null
          notifyConfirm()
          resolve?.(ok)
        }
        ctx.effect(() => () => finishConfirm(false), 'acp-workbench: confirm cleanup')
        function ConfirmModal() {
          const tt = useT()
          const item = React.useSyncExternalStore(
            fn => { confirmStore.listeners.add(fn); return () => confirmStore.listeners.delete(fn) },
            () => confirmStore.current,
          )
          React.useEffect(() => () => finishConfirm(false), [])
          if (!item) return null
          return h(Modal, {
            open: true,
            onClose: () => finishConfirm(false),
            title: item.title || tt('confirmTitle'),
            closeLabel: tt('cancelAction'),
            footer: h(React.Fragment, null,
              h(Button, { variant: 'outline', 'data-modal-autofocus': true, onClick: () => finishConfirm(false) }, tt('cancelAction')),
              h(Button, { variant: 'primary', className: item.danger ? 'aw-danger-fill' : undefined, onClick: () => finishConfirm(true) }, item.confirmLabel || tt('confirmAction'))),
          }, h('p', { className: 'aw-confirm-body' }, item.body))
        }

        const feed = { listeners: new Set(), watchers: new Set(), online: 'connectingFeed', stream: null }
        const notify = (set, change) => { for (const listener of Array.from(set)) listener(change) }
        const setOnline = value => { if (feed.online !== value) { feed.online = value; notify(feed.watchers) } }
        function subscribeLive(listener) {
          feed.listeners.add(listener)
          if (!feed.stream) {
            const stream = new EventSource('/acp-workbench/events')
            setOnline('connectingFeed')
            stream.addEventListener('open', () => { if (feed.stream === stream) setOnline('live') })
            stream.addEventListener('message', event => {
              if (feed.stream !== stream) return
              setOnline('live')
              let change
              try { change = JSON.parse(event.data) } catch {}
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
          // external: DSH persists input trigger chip spelling across reloads without plugin metadata
          async matchClaim({ sessionId }, token) {
            const name = qualified.exec(token)?.[1]
            if (name) return commandClaim(name, sessionId, null, t('cliCommandStale'))
          },
          async matchEnter({ sessionId }, line) {
            const name = qualified.exec(line.split(/\s/u, 1)[0])?.[1]
            if (name) return { claim: commandClaim(name, sessionId, null, t('cliCommandStale')) }
          },
        }), 'acp-workbench: CLI composer commands')

        const needsNativeLive = data => Boolean(
          data?.controls
          || data?.selected?.provider?.startsWith('acp-')
          || (Array.isArray(data?.sessions) && data.sessions.length > 0),
        )
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
          const ensureLive = () => {
            if (unsubscribe || !controller) return
            unsubscribe = subscribeLive(change => {
              if (!Array.isArray(change?.conversations) || change.conversations.includes(sessionId)) void refresh()
            })
          }
          const dropLive = () => {
            unsubscribe?.()
            unsubscribe = null
          }
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
                  if (!own.signal.aborted) {
                    if (needsNativeLive(data)) ensureLive()
                    else dropLive()
                    publish({ data, error: '', optionsRoute: current.optionsRoute === data.selected?.provider ? current.optionsRoute : null })
                  }
                } catch (error) { if (!own.signal.aborted) publish({ ...current, error: error.message }) }
              } while (again && !own.signal.aborted)
            } finally { loading = false }
            if (controller && controller !== own) void refresh()
          }
          const stop = () => {
            controller?.abort(); controller = null; dropLive()
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
                if (needsNativeLive(current.data)) ensureLive()
                void refresh()
              }
              return () => { listeners.delete(listener); if (!listeners.size) stop() }
            },
          }
          nativeSources.set(sessionId, source)
          return source
        }
        ctx.effect(() => () => { for (const source of nativeSources.values()) source.stop(); nativeSources.clear() }, 'acp-workbench: native subscriptions')

        function useNative(sessionId, modelKey) {
          const source = React.useMemo(() => nativeSource(sessionId), [sessionId])
          const snapshot = React.useSyncExternalStore(source.subscribe, source.getSnapshot)
          const prevModelKey = React.useRef(modelKey)
          React.useEffect(() => {
            if (prevModelKey.current === modelKey) return
            prevModelKey.current = modelKey
            if (modelKey !== undefined) void source.refresh()
          }, [source, modelKey])
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
        function McpValue({ value, root = false }) {
          const [open, setOpen] = React.useState(false), [limit, more] = React.useState(8)
          if (value === undefined) return h('span', { className: 'aw-note' }, t('mcpAbsent'))
          const array = Array.isArray(value), object = value !== null && typeof value === 'object'
          if (!object) {
            const str = value === '' ? '""' : String(value), cut = str.length > 480
            return h('span', { className: 'aw-mcp-value' }, cut && !open ? str.slice(0, 480) + '…' : str, cut && h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => setOpen(!open) }, t(open ? 'mcpLess' : 'mcpMore')))
          }
          const keys = array ? null : Object.keys(value), count = array ? value.length : keys.length, shown = Math.min(limit, count), label = t(array ? 'mcpItems' : 'mcpFields', { n: count })
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
          // external: Codex ACP sends CallToolResult in rawOutput alongside projected ACP content blocks
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
          const description = terminal && firstText(input.description, input.command_description, input.toolSummary)
          const reportNote = terminal ? [description, display || (!terminalOutput && text)].filter((s, i, all) => s && s !== command && s !== terminal.text && s !== terminalOutput && all.indexOf(s) === i).join('\n') : note
          const base = !face.mcp && firstText(input.cwd, input.workdir, input.working_directory, input.Cwd, input.target_directory), directory = base ? reportedPath(base, cwd) : cwd
          const [inspect, setInspect] = React.useState(false)
          const state = callState(tool, face, live), pending = state === 'in_progress'
          const fileLang = kind === 'read' ? targets[0]?.path.match(/\.([a-z0-9]+)$/iu)?.[1]?.toLowerCase() : undefined
          let body, locations = targets
          if (face.mcp) {
            body = h(McpReport, { tool, face, approval })
          } else if (terminal && !approval) {
            body = h(CommandReport, { term: terminal, face, final: terminalOutput, labels, live, state, cwd: terminal.cwd ?? firstText(input.cwd, input.workdir, input.working_directory, input.Cwd, cwd) })
          } else if (kind === 'execute' && command) {
            const settled = ['completed', 'failed'].includes(tool.status) || exitCode !== undefined || !!signal
            body = !approval && (pending || settled) ? h(TerminalBlock, { labels, command, output: text || undefined,
              cwd: firstText(input.cwd, input.workdir, input.working_directory, input.Cwd, cwd), running: !!pending, exitCode, signal, maxLines: 8,
              runStateDot: pending || !!signal || (exitCode !== undefined && !(state === 'failed' && exitCode === 0)) }) :
              h(React.Fragment, null, h('pre', { className: 'aw-log aw-command' }, command), text ? h('pre', { className: 'aw-log' }, text) : null)
          } else if (kind === 'read' && text && state !== 'failed') {
            const lines = numberedRead(text)
            if (lines && targets.length === 1 && targets[0].line == null) locations = [{ ...targets[0], line: lines[0].number }]
            body = lines ? h(ReadBlock, { labels, label: targets[0]?.path ?? tool.title, lines, lang: fileLang, maxLines: 8 }) : null
          } else if (kind === 'search' && !approval && state !== 'failed') {
            const card = searchResult(tool.rawOutput, text, input)
            const explicit = new Set(Array.isArray(tool.locations) ? tool.locations : [])
            locations = targets.filter(l => explicit.has(l) && (l.line > 0 || (l.path !== input.path && l.path !== input.file_path)))
            if (card) body = h(React.Fragment, null, h(SearchBlock, { ...card, labels, maxLines: 8 }), openFile && h(SearchLocations, { card, openFile, cwd: directory }))
          } else if (face.web) {
            body = h(WebReport, { tool, face, frame: webFrame, state, approval, display, labels })
          }
          if (!body && text) body = !approval && ['read', 'search', 'execute'].includes(kind) ? h('div', { className: 'aw-code-window' },
            h(CodeBlock, { code: text, lang: fileLang || 'text', copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels })) : h('div', { className: 'aw-output aw-text' }, text)
          if (patch.files.size > 1) locations = locations.filter(l => !patch.files.has(l.path))
          const propOld = typeof input.old_string === 'string' ? input.old_string : typeof input.Target === 'string' ? input.Target : undefined
          const propNew = typeof input.new_string === 'string' ? input.new_string : typeof input.Replacement === 'string' ? input.Replacement : undefined
          const proposed = kind === 'edit' && !patch.files.size && targets.length === 1 && (!patchFrame || ['permission','launch'].includes(patchFrame.stage)) && typeof propOld === 'string' && typeof propNew === 'string'
          return h('div', { className: 'aw-detail aw-call-detail' },
            !approval && isClaudeCompactTool(tool) ? h(CompactionFacts, { facts: compactionFacts(tool.rawOutput) }) : null,
            locations.length ? h(ToolTargets, { targets: locations, cwd: directory, openFile }) : null,
            !face.mcp && (kind === 'other' || approval) ? h(FieldList, { value: input, label: t('input'), omit: [command, ...(face.web ? [face.web.url, face.web.query, face.web.prompt, face.web.offset] : []), ...targets.map(l => l.path), face.write?.content, ...(proposed || extras.some(validDiff) ? [propOld, propNew] : [])] }) : null,
            !text && !extras.length && kind === 'other' ? h(FieldList, { value: tool.rawOutput, label: t('output') }) : null,
            proposed ? h('div', { className: 'aw-section' }, h('span', { className: 'aw-note' }, t('proposed')),
              h(DiffBlock, { labels, maxLines: 8, diffs: [{ path: targets[0].path, oldText: propOld, newText: propNew }] })) : null,
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
          const title = task ? t('cliTask') : isClaudeCompactTool(tool) ? t('compact.title') : webTitle ? t(webTitle) : face.write ? t('call.write') : kind === 'other' ? tool.title || t('tool') : t('call.' + kind)
          const path = target && (cwd && target.path.startsWith(cwd + '/') ? target.path.slice(cwd.length + 1) : target.path)
          const summary = focus || (path && path + (target.line > 0 ? ':' + target.line : '')) || (tool.title !== title ? tool.title : null)
          const totals = React.useMemo(() => {
            const diffs = face.blocks.filter(validDiff)
            return diffs.length && !(face.write && patchFrame?.stage === 'launch' && diffs.every(b => b.oldText == null)) ? diffTotals(diffs.map(b => ({ ...b, oldText: b.oldText ?? null }))) : null
          }, [face, patchFrame])
          const expandable = !!(face.mcp || terminal || face.blocks.length || targets.length || focus || tool.rawInput !== undefined || tool.rawOutput !== undefined)
          const failed = state === 'failed'
          const exitLabel = face.signal ? t('terminalSignal', { signal: face.signal }) : exitCode !== undefined && exitCode !== 0 ? t('exitCode', { n: exitCode }) : null
          const countParts = [
            task ? t('cliCalls', { n: task.calls }) : '',
            targets.length > 1 ? t('pathMore', { n: targets.length - 1 }) : '',
          ].filter(Boolean).join(' · ')
          return h('div', { className: 'aw-call', 'data-state': state }, h(DisclosureRow, {
            rowClassName: 'aw-tv-row',
            icon: h(task ? IconBranchOutlineRegular : kindIcons.get(kind) ?? IconInfoOutlineRegular, { size: 14 }), title, open, expandable, onToggle: toggle,
            headerAccessory: task && onTask ? h(Button, { variant: 'ghost', size: 'sm', onClick: onTask, 'data-cli-open': task.row.seq, 'aria-label': `${t('cliOnly')}: ${task.title}` }, t('cliOnly')) : null,
            expandOnRowClick: expandable, keepContentWhenOpen: true, running: live && state === 'in_progress',
            collapsedContent: h(React.Fragment, null,
              summary ? h(React.Fragment, null,
                h('span', { className: 'aw-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `aw-tv-summary${failed && !exitLabel ? ' aw-tv-error' : ''}`, title: summary }, h(TextShimmer, null, summary))) : null,
              exitLabel ? h(Tag, { tone: 'neutral', className: 'aw-tv-exit' }, h('span', { className: 'aw-tv-exit-dot', 'aria-hidden': true }), exitLabel) : null,
              !failed && countParts ? h(TextShimmer, { className: 'aw-tv-suffix' }, `· ${countParts}`) : null,
              permit ? h(Tag, { className: 'aw-tv-tag', tone: ['permitDenied', 'permitLive'].includes(permit.label) ? 'warning' : 'quiet' }, t(permit.label)) : null,
              patchFrame?.stage === 'launch' && (totals || (face.write && face.blocks.some(validDiff))) ? h(Tag, { className: 'aw-tv-tag', tone: 'quiet' }, t('patch.launch')) : null,
              !failed && totals ? h(TextShimmer, { className: 'aw-tv-suffix aw-tv-diff-stat' },
                h('span', { className: 'aw-tv-diff-added' }, `+${totals.added}`), ' ',
                h('span', { className: 'aw-tv-diff-removed' }, `-${totals.removed}`)) : null,
              failed && !exitLabel && !summary ? h(TextShimmer, { className: 'aw-tv-suffix aw-tv-error' }, t('call.' + state)) : null),
          }, open ? h(ToolDetails, { tool, face, live, cwd, openFile, patchFrame, terminal, webFrame }) : null))
        }

        // external: older claude-agent-acp versions report compaction as a think tool named "compact"
        const isClaudeCompactTool = tool => tool.kind === 'think' && tool._meta?.claudeCode?.toolName === 'compact'
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
        const shownBesideReply = row => CONVERSATION_EVENTS.has(row.type) || (row.type === 'lifecycle' && !!row.data?.message)
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
        try { callLevel = normalizeLevel(window.localStorage?.getItem(displayKey)) } catch {}
        const levelSnapshot = () => callLevel
        const setCallLevel = level => {
          callLevel = normalizeLevel(level)
          try { window.localStorage?.setItem(displayKey, callLevel) } catch {}
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
        function PermissionBody({ item, sessionId, cwd, showCallId = false }) {
          const [previous, setPrevious] = React.useState(false), call = item.params?.toolCall ?? {}, face = toolFace(call, null, true)
          const seq = item.callStartSeq, earlier = sessionId && item.turnId && call.toolCallId && Number.isSafeInteger(seq) && seq > 0 && seq < item.requestSeq
          const input = call.rawInput, hasInput = input != null && (typeof input !== 'object' || Object.keys(input).length > 0)
          const backtickTitle = call.kind === 'execute' && typeof call.title === 'string' ? /^`([\s\S]+)`$/u.exec(call.title.trim())?.[1] : null
          const heading = backtickTitle ? t('call.execute') : (call.title || t('tool'))
          const inlineCommand = backtickTitle && !face.command ? backtickTitle : null
          const details = face.mcp || hasInput || call.rawOutput != null || face.targets.length || face.blocks.length
          return h(React.Fragment, null,
            h('div', { className: 'aw-approval-headline' }, heading),
            cwd || (showCallId && call.toolCallId) ? h('div', { className: 'aw-row aw-note' },
              cwd ? h(PathLabel, { path: cwd }) : null,
              showCallId && call.toolCallId ? h('span', { className: 'aw-mono' }, `${t('permitCallId')}: ${call.toolCallId}`) : null) : null,
            inlineCommand ? h('pre', { className: 'aw-log aw-command' }, inlineCommand) : null,
            details ? h(ToolDetails, { tool: call, face, cwd, approval: true, patchFrame: { stage: 'permission', rawKey: 'rawInput' } }) : !inlineCommand ? h('p', { className: 'aw-note' }, t('permitEmpty')) : null,
            earlier ? h('div', { className: 'aw-section' }, h('div', { className: 'aw-row' }, h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': previous, onClick: () => setPrevious(!previous) }, t('permitLaunch'))),
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
              h(PermissionBody, { item: { ...item, requestSeq: event.seq }, sessionId, cwd, showCallId: true }),
              h('div', { className: 'aw-row', role: 'group', 'aria-label': t('permitOptions') }, options.map(o => h(Tag, { key: o.optionId, tone: 'quiet' }, [o.name ?? o.optionId, permissionScope(o)].filter(Boolean).join(' · ')))),
              choice ? h('span', { className: 'aw-note' }, t(data.automatic === 'full-access' ? 'permitAutoSelection' : 'permitSelection', { choice })) : receipt?.kind === 'expired' || receipt?.type === 'interaction-expired' ? h('span', { className: 'aw-note' }, t('event.expired')) : null)
          }
          return h('div', { className: 'aw-section' }, h('div', { className: 'aw-event' }, h(IconInfoOutlineRegular, { size: 14 }), h('span', { className: 'aw-ellipsis' }, t('event.interaction', { title: title || t('permission') })),
            id && (sessionId || row.data) ? h(Button, { size: 'sm', variant: 'ghost', 'aria-expanded': open, onClick: () => setOpen(!open) }, t('permitPast')) : null),
            open ? row.data ? render(row) : h(PinnedPermissionEvent, { key: `${sessionId}:${row.seq}`, sessionId, seq: row.seq, render }) : null)
        }

        function parseRecommendedLabel(raw) {
          const text = typeof raw === 'string' ? raw : ''
          const lead = /^\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*/iu
          const trail = /\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*$/iu
          if (lead.test(text)) return { label: text.replace(lead, '').trim(), recommended: true }
          if (trail.test(text)) return { label: text.replace(trail, '').trim(), recommended: true }
          return { label: text, recommended: false }
        }

        function isImeComposing(event) {
          return Boolean(event.nativeEvent?.isComposing || event.keyCode === 229)
        }

        function AnswerField({ variant, value, placeholder, disabled, autoFocus, ariaLabel, onChange, onKeyDown }) {
          return h('div', { className: `aw-q-field ${variant === 'inline' ? 'aw-q-inline' : 'aw-q-block'}` },
            h('div', { 'aria-hidden': true, className: 'aw-q-field-mirror' }, `${value}\n`),
            h('textarea', {
              autoFocus,
              className: 'aw-q-field-input',
              value,
              disabled,
              rows: 1,
              placeholder,
              'aria-label': ariaLabel,
              onChange,
              onKeyDown,
            }))
        }

        function buildQuestionPages(item) {
          const params = item.params ?? {}
          if (item.kind === 'question') {
            return (params.questions ?? EMPTY).map(question => ({
              id: question.id,
              kind: question.allowMultiple ? 'multiple' : 'single',
              field: null,
              otherField: null,
              eyebrow: params.title || undefined,
              title: question.prompt ?? question.title ?? '',
              description: question.description ?? '',
              required: true,
              choices: (question.options ?? EMPTY).map(option => ({
                value: option.id,
                label: option.label ?? option.id,
                description: option.description ?? '',
              })),
              min: 1,
              max: null,
            }))
          }
          const fields = item.fields ?? EMPTY
          const byId = new Map(fields.map(field => [field.id, field]))
          const consumed = new Set()
          const schemaTitle = firstText(params.requestedSchema?.title)
          const pages = []
          for (const field of fields) {
            if (consumed.has(field.id)) continue
            let otherField = null
            if (field.kind === 'single' || field.kind === 'multiple') {
              const candidate = byId.get(`${field.id}_other`)
              if (candidate && candidate.kind === 'text' && !candidate.required) {
                otherField = candidate
                consumed.add(candidate.id)
              }
            }
            pages.push({
              id: field.id,
              kind: field.kind,
              field,
              otherField,
              eyebrow: schemaTitle || undefined,
              title: field.title,
              description: field.description ?? '',
              required: field.required,
              choices: field.choices ?? EMPTY,
              min: field.min,
              max: field.max,
              integer: field.integer,
            })
          }
          return pages
        }

        function initialQuestionValues(item, pages) {
          const init = new Map()
          for (const page of pages) {
            if (page.field) {
              const f = page.field
              if (f.defaultValue !== undefined) init.set(f.id, f.defaultValue)
              else if (f.kind === 'boolean' && f.required) init.set(f.id, false)
              else if (f.kind === 'single' && page.choices.length && parseRecommendedLabel(page.choices[0].label).recommended) {
                init.set(f.id, page.choices[0].value)
              } else if (f.kind === 'multiple') {
                const rec = page.choices.filter(c => parseRecommendedLabel(c.label).recommended).map(c => c.value)
                if (rec.length) init.set(f.id, rec)
              }
              if (page.otherField?.defaultValue !== undefined) init.set(page.otherField.id, page.otherField.defaultValue)
            } else if (page.kind === 'single' && page.choices.length && parseRecommendedLabel(page.choices[0].label).recommended) {
              init.set(page.id, page.choices[0].value)
            } else if (page.kind === 'multiple') {
              const rec = page.choices.filter(c => parseRecommendedLabel(c.label).recommended).map(c => c.value)
              if (rec.length) init.set(page.id, rec)
            }
          }
          return init
        }

        function validateQuestionPage(item, page, values) {
          if (item.kind === 'question') {
            const v = values.get(page.id)
            const has = page.kind === 'multiple' ? Array.isArray(v) && v.length > 0 : typeof v === 'string' && v.length > 0
            return has ? null : 'qUnanswered'
          }
          const f = page.field
          if (!f) return null
          if (page.otherField && values.has(page.otherField.id)) {
            const ov = values.get(page.otherField.id)
            if (typeof ov !== 'string') return 'qIncomplete'
            const olen = Array.from(ov).length
            if (olen < page.otherField.min || (page.otherField.max != null && olen > page.otherField.max)) return 'qRangeInvalid'
          }
          if (!values.has(f.id)) return f.required ? 'qUnanswered' : null
          const v = values.get(f.id)
          if (f.kind === 'boolean') return typeof v === 'boolean' ? null : 'qIncomplete'
          if (f.kind === 'number') {
            if (typeof v !== 'number' || !Number.isFinite(v) || (f.integer && !Number.isInteger(v))) return 'qRangeInvalid'
            if ((f.min != null && v < f.min) || (f.max != null && v > f.max)) return 'qRangeInvalid'
            return null
          }
          if (f.kind === 'single') return f.choices.some(c => c.value === v) ? null : 'qIncomplete'
          if (f.kind === 'multiple') {
            if (!Array.isArray(v)) return 'qIncomplete'
            if (v.length < f.min || (f.max != null && v.length > f.max)) return 'qRangeInvalid'
            return null
          }
          const len = typeof v === 'string' ? Array.from(v).length : 0
          if (len < f.min || (f.max != null && len > f.max)) return 'qRangeInvalid'
          return null
        }

        function pageHasAnswer(page, values) {
          const v = values.get(page.id)
          const otherText = page.otherField && typeof values.get(page.otherField.id) === 'string'
            ? values.get(page.otherField.id).trim() : ''
          if (page.kind === 'boolean') return values.has(page.id)
          if (page.kind === 'number') return typeof v === 'number' && Number.isFinite(v)
          if (page.kind === 'text') return typeof v === 'string' && v.trim() !== ''
          if (page.kind === 'multiple') return (Array.isArray(v) && v.length > 0) || otherText !== ''
          return (typeof v === 'string' && v !== '') || otherText !== ''
        }

        function QuestionCard({ item, send, disabled, inline }) {
          const tt = useT()
          const headingId = React.useId()
          const bodyRef = React.useRef(null)
          const pages = React.useMemo(() => buildQuestionPages(item), [item])
          const [index, setIndex] = React.useState(0)
          const [minimized, setMinimized] = React.useState(false)
          const [values, setValues] = React.useState(() => initialQuestionValues(item, pages))
          const [feedback, setFeedback] = React.useState(null)
          const isForm = item.kind === 'form'
          const params = item.params ?? {}
          const safeIndex = pages.length ? Math.min(index, pages.length - 1) : 0
          const page = pages[safeIndex] ?? null

          const goTo = nextIndex => {
            if (nextIndex === safeIndex) return
            if (bodyRef.current) bodyRef.current.scrollTop = 0
            setIndex(nextIndex)
            setFeedback(null)
          }

          const updateValues = mutator => {
            setValues(previous => {
              const next = new Map(previous)
              mutator(next)
              return next
            })
            setFeedback(null)
          }

          const submitValues = currentValues => {
            for (let i = 0; i < pages.length; i++) {
              const err = validateQuestionPage(item, pages[i], currentValues)
              if (err) {
                goTo(i)
                setFeedback(pages.length > 1 && i !== safeIndex ? 'qIncomplete' : err)
                return
              }
            }
            if (isForm) {
              const content = {}
              for (const [k, v] of currentValues.entries()) {
                if (typeof v === 'string' && v.trim() === '') {
                  const field = (item.fields ?? EMPTY).find(itemField => itemField.id === k)
                  if (!field?.required && (field?.min ?? 0) === 0) continue
                }
                content[k] = v
              }
              send({ formAction: 'accept', content })
            } else {
              send({
                answers: pages.map(p => {
                  const v = currentValues.get(p.id)
                  const selectedOptionIds = p.kind === 'multiple'
                    ? (Array.isArray(v) ? v : EMPTY)
                    : (typeof v === 'string' && v ? [v] : EMPTY)
                  return { questionId: p.id, selectedOptionIds }
                }),
              })
            }
          }

          const selectOption = choiceValue => {
            if (!page || disabled) return
            let nextValues
            setValues(previous => {
              const next = new Map(previous)
              if (page.kind === 'multiple') {
                const current = Array.isArray(next.get(page.id)) ? next.get(page.id) : EMPTY
                const updated = current.includes(choiceValue)
                  ? current.filter(v => v !== choiceValue)
                  : [...current, choiceValue]
                if (updated.length) next.set(page.id, updated)
                else next.delete(page.id)
              } else {
                next.set(page.id, choiceValue)
                if (page.otherField) next.delete(page.otherField.id)
              }
              nextValues = next
              return next
            })
            setFeedback(null)
            if (page.kind === 'single' && safeIndex < pages.length - 1) {
              goTo(safeIndex + 1)
            }
            return nextValues
          }

          const handleContinue = () => {
            if (!page) { submitValues(values); return }
            const err = validateQuestionPage(item, page, values)
            if (err) { setFeedback(err); return }
            if (safeIndex < pages.length - 1) {
              goTo(safeIndex + 1)
              return
            }
            submitValues(values)
          }

          const handleSkip = () => {
            if (!isForm) { send({ skip: true }); return }
            if (!page || page.required) { send({ formAction: 'decline' }); return }
            const next = new Map(values)
            next.delete(page.id)
            if (page.otherField) next.delete(page.otherField.id)
            setValues(next)
            setFeedback(null)
            if (safeIndex < pages.length - 1) {
              goTo(safeIndex + 1)
              return
            }
            submitValues(next)
          }

          const headerEyebrow = page?.eyebrow ?? (isForm && pages.length !== 1 && params.message ? params.message : undefined)
          const titleText = page ? page.title : (params.message ?? tt(isForm ? 'form' : 'question'))
          const otherValue = page?.otherField && typeof values.get(page.otherField.id) === 'string'
            ? values.get(page.otherField.id) : ''
          const selectedSingle = page?.kind === 'single' ? values.get(page.id) : undefined
          const selectedMulti = page?.kind === 'multiple' && Array.isArray(values.get(page.id)) ? values.get(page.id) : EMPTY
          const limits = page && isForm
            ? (page.kind === 'number'
              ? [page.min != null && tt('formMin', { n: page.min }), page.max != null && tt('formMax', { n: page.max })].filter(Boolean)
              : [page.min > 0 && tt('formMin', { n: page.min }), page.max != null && tt('formMax', { n: page.max })].filter(Boolean))
            : EMPTY
          const descriptionText = [page?.description, limits.length ? limits.join(' · ') : '', !page && params.requestedSchema?.description].filter(Boolean).join('\n')
          const canContinue = !disabled && (!page || (validateQuestionPage(item, page, values) === null && (isForm || pageHasAnswer(page, values))))

          return h('section', {
            className: 'aw-q-card',
            'data-inline': inline || undefined,
            'data-minimized': minimized || undefined,
            'aria-labelledby': headingId,
          },
          h('header', { className: 'aw-q-head' },
            headerEyebrow || minimized ? h('div', { className: 'aw-q-heading' },
              headerEyebrow ? h('div', { className: 'aw-q-eyebrow' }, headerEyebrow) : null,
              minimized ? h('h2', { className: 'aw-q-title', id: headingId }, titleText) : null) : null,
            h('div', { className: 'aw-q-head-actions' },
              h('button', {
                type: 'button', className: 'aw-icon-btn',
                'aria-label': tt(minimized ? 'qMaximize' : 'qMinimize'),
                title: tt(minimized ? 'qMaximize' : 'qMinimize'),
                'aria-expanded': !minimized,
                disabled,
                onClick: () => setMinimized(v => !v),
              }, h(minimized ? IconChevronUpOutlineRegular : IconChevronDownOutlineRegular, { size: 18 })),
              h('button', {
                type: 'button', className: 'aw-icon-btn',
                'aria-label': tt('qCancel'),
                title: tt('qCancel'),
                disabled,
                onClick: () => send({ cancel: true }),
              }, h(IconCloseOutlineRegular, { size: 15 })))),
          !minimized ? h(React.Fragment, null,
            h('div', { ref: bodyRef, className: 'aw-q-body' },
              h('div', { className: 'aw-q-title-wrap' },
                h('h2', { className: 'aw-q-title', id: headingId }, titleText)),
              descriptionText ? h('p', { className: 'aw-q-desc' }, descriptionText) : null,
              page ? h('div', {
                className: 'aw-q-options',
                role: page.kind === 'multiple' ? 'group' : page.kind === 'single' ? 'radiogroup' : undefined,
              },
              page.kind === 'single' || page.kind === 'multiple'
                ? h(React.Fragment, null,
                  page.choices.map((choice, optionIndex) => {
                    const selected = page.kind === 'multiple' ? selectedMulti.includes(choice.value) : selectedSingle === choice.value
                    const parsed = parseRecommendedLabel(choice.label)
                    return h('div', { key: choice.value, className: 'aw-q-option-wrap' },
                      h('div', {
                        className: 'aw-q-option-row',
                        'data-interactive': !disabled || undefined,
                        'data-selected': (selected && page.kind === 'single') || undefined,
                      },
                      h('button', {
                        type: 'button',
                        className: 'aw-q-option',
                        role: page.kind === 'multiple' ? 'checkbox' : 'radio',
                        'aria-checked': selected,
                        disabled,
                        onClick: () => selectOption(choice.value),
                        onKeyDown: event => {
                          if (event.key !== 'Enter') return
                          event.preventDefault()
                          handleContinue()
                        },
                      },
                      page.kind === 'multiple'
                        ? h('span', { className: 'aw-q-check', 'data-checked': selected || undefined, 'aria-hidden': true },
                          selected ? h(IconCheckOutlineRegular, { size: 12 }) : null)
                        : h('span', { className: 'aw-q-num', 'aria-hidden': true }, String(optionIndex + 1)),
                      h('span', { className: 'aw-q-copy' },
                        h('span', { className: 'aw-q-line' },
                          h('span', { className: 'aw-q-label' }, parsed.label),
                          parsed.recommended ? h('span', { className: 'aw-q-badge' }, tt('qRecommended')) : null),
                        choice.description ? h('span', { className: 'aw-q-opt-desc' }, choice.description) : null))),
                      choice.preview ? h('details', { className: 'aw-tech aw-q-preview' },
                        h('summary', null, tt('formPreview')),
                        h('pre', { className: 'aw-log' }, choice.preview)) : null)
                  }),
                  page.otherField ? h('div', {
                    className: 'aw-q-custom-row',
                    'data-active': otherValue !== '' || undefined,
                    'data-yielded': (page.kind === 'single' && selectedSingle !== undefined && otherValue === '') || undefined,
                  },
                  page.kind === 'multiple'
                    ? h('span', { className: 'aw-q-check', 'data-checked': otherValue !== '' || undefined, 'aria-hidden': true },
                      otherValue !== '' ? h(IconCheckOutlineRegular, { size: 12 }) : null)
                    : h('span', { className: 'aw-q-num', 'aria-hidden': true }, h(IconEditOutlineRegular, { size: 12 })),
                  h(AnswerField, {
                    variant: 'inline',
                    value: otherValue,
                    disabled,
                    placeholder: tt('qCustomPlaceholder'),
                    ariaLabel: page.otherField.title || tt('qCustomPlaceholder'),
                    onChange: event => {
                      const nextText = event.target.value
                      updateValues(next => {
                        if (nextText) next.set(page.otherField.id, nextText)
                        else next.delete(page.otherField.id)
                        if (page.kind === 'single' && !page.required && nextText !== '') next.delete(page.id)
                      })
                    },
                    onKeyDown: event => {
                      if (event.key !== 'Enter' || event.shiftKey || isImeComposing(event)) return
                      event.preventDefault()
                      handleContinue()
                    },
                  })) : null)
                : page.kind === 'boolean'
                  ? [true, false].map((boolVal, idx) => {
                    const selected = values.get(page.id) === boolVal
                    return h('div', {
                      key: String(boolVal),
                      className: 'aw-q-option-row',
                      'data-interactive': !disabled || undefined,
                      'data-selected': selected || undefined,
                    },
                    h('button', {
                      type: 'button',
                      className: 'aw-q-option',
                      role: 'radio',
                      'aria-checked': selected,
                      disabled,
                      onClick: () => {
                        updateValues(next => next.set(page.id, boolVal))
                        if (safeIndex < pages.length - 1) goTo(safeIndex + 1)
                      },
                    },
                    h('span', { className: 'aw-q-num', 'aria-hidden': true }, String(idx + 1)),
                    h('span', { className: 'aw-q-copy' }, h('span', { className: 'aw-q-line' }, h('span', { className: 'aw-q-label' }, tt(boolVal ? 'qYes' : 'qNo'))))))
                  })
                  : page.kind === 'number'
                    ? h('div', { className: 'aw-q-num-wrap' },
                      h(Input, {
                        type: 'number',
                        className: 'aw-input',
                        step: page.integer ? 1 : 'any',
                        min: page.min ?? undefined,
                        max: page.max ?? undefined,
                        disabled,
                        'aria-label': page.title,
                        value: values.has(page.id) ? String(values.get(page.id)) : '',
                        onChange: event => {
                          const raw = event.target.value.trim()
                          updateValues(next => {
                            if (!raw) { next.delete(page.id); return }
                            const parsed = Number(raw)
                            next.set(page.id, Number.isFinite(parsed) ? parsed : raw)
                          })
                        },
                      }))
                    : h(AnswerField, {
                      variant: 'block',
                      autoFocus: !disabled && pages.length === 1,
                      value: typeof values.get(page.id) === 'string' ? values.get(page.id) : '',
                      disabled,
                      placeholder: tt('qCustomPlaceholder'),
                      ariaLabel: page.title,
                      onChange: event => {
                        const nextText = event.target.value
                        updateValues(next => {
                          if (nextText) next.set(page.id, nextText)
                          else next.delete(page.id)
                        })
                      },
                      onKeyDown: event => {
                        if (event.key !== 'Enter' || event.shiftKey || isImeComposing(event)) return
                        event.preventDefault()
                        handleContinue()
                      },
                    })) : null),
            h('footer', { className: 'aw-q-footer' },
              pages.length > 0 ? h('div', { className: 'aw-q-pager' },
                h('button', {
                  type: 'button', className: 'aw-icon-btn',
                  'aria-label': tt('qPrev'), title: tt('qPrev'),
                  disabled: disabled || safeIndex === 0,
                  onClick: () => goTo(safeIndex - 1),
                }, h(IconChevronLeftOutlineRegular, { size: 15 })),
                h('span', { className: 'aw-q-progress' }, `${safeIndex + 1} / ${pages.length}`),
                h('button', {
                  type: 'button', className: 'aw-icon-btn',
                  'aria-label': tt('qNextAria'), title: tt('qNextAria'),
                  disabled: disabled || safeIndex >= pages.length - 1,
                  onClick: () => goTo(safeIndex + 1),
                }, h(IconChevronRightOutlineRegular, { size: 15 }))) : h('div'),
              h('div', { className: 'aw-q-feedback', role: 'status' }, feedback ? tt(feedback) : null),
              h('div', { className: 'aw-q-actions' },
                h(Button, { variant: 'outline', disabled, onClick: handleSkip },
                  tt(isForm && (!page || page.required) ? 'formDecline' : 'skip')),
                h(Button, { variant: 'primary', disabled: !canContinue, onClick: handleContinue },
                  tt(safeIndex < pages.length - 1 ? 'qNext' : 'qSubmit'))))) : null)
        }

        function PermissionCard({ item, sessionId, cwd, send, disabled, inline }) {
          const tt = useT()
          const params = item.params ?? {}
          const options = params.options ?? EMPTY
          const allowOnceOptions = options.filter(o => o.kind === 'allow_once')
          const singleAllow = allowOnceOptions.length === 1 ? allowOnceOptions[0] : null
          const rejectOnce = options.find(o => o.kind === 'reject_once') ?? options.find(o => o.kind?.startsWith('reject')) ?? null
          const hasAlways = options.some(o => o.kind?.endsWith('always'))
          const ordered = [...options].toSorted((a, b) => {
            const rank = kind => kind === 'reject_always' ? 0 : kind === 'reject_once' ? 1 : kind === 'allow_always' ? 2 : kind === 'allow_once' ? 4 : 3
            return rank(a.kind) - rank(b.kind)
          })
          const onKeyDown = event => {
            if (disabled || event.defaultPrevented || event.repeat || isImeComposing(event)) return
            const el = event.target
            if (el?.closest?.('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) return
            if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
            if (event.key === 'Enter' && singleAllow && !el?.closest?.('button, a[href], [role="button"], summary')) {
              event.preventDefault()
              event.stopPropagation()
              send({ optionId: singleAllow.optionId })
            } else if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              if (rejectOnce) send({ optionId: rejectOnce.optionId })
              else send({ cancel: true })
            }
          }
          return h('section', {
            className: 'aw-approval-card',
            'data-inline': inline || undefined,
            'aria-label': tt('approvalWaiting'),
            onKeyDown,
          },
          h('div', { className: 'aw-approval-strip' },
            h(StateDot, { state: disabled ? 'ongoing' : 'warning' }),
            h('span', null, tt('approvalWaiting')),
            h('button', {
              type: 'button', className: 'aw-icon-btn',
              'aria-label': tt('dismiss'), title: tt('dismiss'),
              disabled, onClick: () => send({ cancel: true }),
            }, h(IconCloseOutlineRegular, { size: 15 }))),
          h('div', { className: 'aw-approval-body', tabIndex: 0 },
            h(PermissionBody, { item, sessionId, cwd })),
          h('div', { className: 'aw-approval-actions' },
            hasAlways ? h('span', { className: 'aw-approval-hint' }, tt('permanent')) : null,
            ordered.map(option => {
              const isReject = option.kind?.startsWith('reject')
              const isPrimary = option.kind === 'allow_once'
              const scopeHint = [permissionScope(option), option.kind?.endsWith('always') ? tt('permanent') : null].filter(Boolean).join(' · ')
              return h(Button, {
                key: option.optionId,
                variant: isPrimary ? 'primary' : 'outline',
                className: isReject ? 'aw-btn-reject' : undefined,
                disabled,
                title: scopeHint || undefined,
                onClick: () => send({ optionId: option.optionId }),
              }, option.name ?? option.optionId)
            })))
        }

        function PlanCard({ item, send, disabled, inline }) {
          const tt = useT()
          const labels = useDiffLabels()
          const [reason, setReason] = React.useState('')
          const params = item.params ?? {}
          const mdLabels = React.useMemo(() => ({
            code: { copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels },
            footnotes: '',
          }), [labels])
          const heading = params.name || (params.plan && extractMarkdownPlainText ? extractMarkdownPlainText(params.plan, { mode: 'first-line' }) : '') || tt('planReviewHeader')
          return h('section', {
            className: 'aw-plan-card',
            'data-inline': inline || undefined,
            'aria-label': tt('planReviewHeader'),
          },
          h('div', { className: 'aw-plan-strip' },
            h(StateDot, { state: disabled ? 'ongoing' : 'warning' }),
            h('span', null, tt('planReviewHeader')),
            h('button', {
              type: 'button', className: 'aw-icon-btn',
              'aria-label': tt('dismiss'), title: tt('dismiss'),
              disabled, onClick: () => send({ cancel: true }),
            }, h(IconCloseOutlineRegular, { size: 15 }))),
          h('div', { className: 'aw-plan-body' },
            h('h3', { className: 'aw-plan-title' }, heading),
            params.overview ? h('p', { className: 'aw-plan-overview' }, params.overview) : null,
            params.plan ? h('div', { className: 'aw-tv-panel' },
              h('div', { className: 'aw-tv-prose' }, h(MarkdownText, { text: params.plan, labels: mdLabels }))) : null),
          h('div', { className: 'aw-plan-footer' },
            h(Input, { className: 'aw-reason', value: reason, disabled, placeholder: tt('rejectReason'), 'aria-label': tt('rejectReason'), onChange: event => setReason(event.target.value) }),
            h(Button, { variant: 'outline', className: 'aw-btn-reject', disabled, onClick: () => send({ accept: false, ...(reason.trim() ? { reason: reason.trim() } : {}) }) }, tt('planReject')),
            h(Button, { variant: 'primary', disabled, onClick: () => send({ accept: true }) }, tt('planApprove'))))
        }

        function UrlCard({ item, send, disabled, inline }) {
          const tt = useT()
          const params = item.params ?? {}
          const href = item.urlInfo?.url ?? params.url
          return h('section', {
            className: 'aw-approval-card',
            'data-inline': inline || undefined,
            'aria-label': tt('urlElicitation'),
          },
          h('div', { className: 'aw-approval-strip' },
            h(StateDot, { state: disabled ? 'ongoing' : 'warning' }),
            h('span', null, tt('urlElicitation')),
            h('button', {
              type: 'button', className: 'aw-icon-btn',
              'aria-label': tt('dismiss'), title: tt('dismiss'),
              disabled, onClick: () => send({ cancel: true }),
            }, h(IconCloseOutlineRegular, { size: 15 }))),
          h('div', { className: 'aw-approval-body' },
            h('div', { className: 'aw-approval-headline' }, item.urlInfo?.message ?? params.message),
            href ? h('div', { className: 'aw-log' },
              h('a', { className: 'aw-url-link aw-mono', href, target: '_blank', rel: 'noopener noreferrer' }, href)) : null),
          h('div', { className: 'aw-approval-actions' },
            h('span', { className: 'aw-approval-hint' }, tt('urlHelp')),
            h(Button, { variant: 'outline', className: 'aw-btn-reject', disabled, onClick: () => send({ formAction: 'decline' }) }, tt('urlDecline')),
            href ? h('a', { className: 'aw-url-link', href, target: '_blank', rel: 'noopener noreferrer' }, tt('urlOpen')) : null,
            h(Button, { variant: 'primary', disabled, onClick: () => send({ formAction: 'accept' }) }, tt('urlAccept'))))
        }

        function InteractionCard({ item, sessionId, cwd, run, disabled, inline }) {
          const send = response => run({ action: 'respond', sessionId, interactionId: item.id, ...response })
          if (item.kind === 'permission') return h(PermissionCard, { item, sessionId, cwd, send, disabled, inline })
          if (item.kind === 'plan') return h(PlanCard, { item, send, disabled, inline })
          if (item.kind === 'url') return h(UrlCard, { item, send, disabled, inline })
          return h(QuestionCard, { item, send, disabled, inline })
        }

        function ConfigControl({ entry, disabled, onChange, compact }) {
          const tooltip = entry.description ? `${entry.label} — ${entry.description}` : entry.label
          if (entry.kind === 'boolean') {
            return h('span', { className: 'aw-switch', title: tooltip }, h(Switch, { checked: entry.value, disabled, label: entry.label, onChange: value => onChange(entry.op(value)) }), h('span', null, entry.label))
          }
          const known = entry.options.some(option => option.value === entry.value)
          const select = h('select', { className: 'aw-select', value: entry.value, disabled, 'aria-label': entry.label, title: tooltip, onChange: event => onChange(entry.op(event.target.value)) },
            known ? null : h('option', { value: entry.value }, entry.value || '—'),
            entry.options.map(option => h('option', { key: option.value, value: option.value }, option.label)))
          return compact ? select : h('label', { className: 'aw-field', title: tooltip }, h('span', null, entry.label), select)
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

        function encodeSegment(segment) { return encodeURIComponent(segment).replace(/%3A/gi, ':') }
        function joinCwd(cwd, rel) {
          const rawBase = typeof cwd === 'string' ? cwd.replace(/\\/gu, '/') : ''
          const base = rawBase.replace(/\/+$/u, '') || (rawBase.startsWith('/') ? '/' : '')
          if (!base) return rel.replace(/^(?:\.\/)+/u, '')
          const joined = base.endsWith('/') ? `${base}${rel}` : `${base}/${rel}`
          const prefixMatch = /^(?:[A-Za-z]:\/|\/\/[^/]+\/[^/]+\/|\/)/u.exec(joined)
          const prefix = prefixMatch ? prefixMatch[0] : ''
          const parts = []
          for (const segment of joined.slice(prefix.length).split('/')) {
            if (!segment || segment === '.') continue
            if (segment === '..') {
              if (parts.length > 0 && parts[parts.length - 1] !== '..') parts.pop()
              else if (!prefix) parts.push('..')
            } else {
              parts.push(segment)
            }
          }
          return `${prefix}${parts.join('/')}`
        }
        function fileAddressFor(targetSessionId, cwd, path) {
          const normalized = path.replace(/\\/gu, '/')
          const absolute = normalized.startsWith('/') || /^[A-Za-z]:\//u.test(normalized) || normalized.startsWith('//')
          const target = absolute ? normalized : joinCwd(cwd, normalized)
          return `dsh-resource://file/session/${encodeSegment(targetSessionId)}/${target.split('/').map(encodeSegment).join('/')}`
        }
        function makeOpenFile(targetSessionId, cwd) {
          const sidebar = ctx.get('sidebarRight')
          if (!sidebar || !targetSessionId) return undefined
          return (path, opts) => {
            if (typeof path !== 'string' || !path.trim()) return
            const uri = fileAddressFor(targetSessionId, cwd, path)
            try { sidebar.openResource(uri, Number.isInteger(opts?.line) && opts.line > 0 ? { line: opts.line } : undefined) } catch {}
          }
        }

        function NativeTrace({ sessionId, turn, step, messageId, reference, openFile, collapsible = false, defaultOpen = false }) {
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
          const current = view.data?.sessions.find(s => (reference ? s.id === reference.sessionId : s.native.sessionId === sessionId) && s.native.runs.some(matches))
          const session = current ?? fallback
          const run = session?.native.runs.findLast(matches)
          const active = !!run && ACTIVE_RUN.has(run.state)
          const target = run?.to ?? session?.eventSeq ?? 0
          const lateRevision = current ? run?.compactionRevision : view.data?.sessions.find(s => s.id === fallback?.id)?.native.compactionRevision
          const from = run?.from ?? 1
          const traceReady = !!fallback?.native.runs.some(matches)
          const readTrace = React.useRef(null)
          React.useEffect(() => {
            const controller = new AbortController()
            setFallback(previous => reference && previous?.id === reference.sessionId && previous.native.runs.some(r => r.id === reference.turnId) ? previous : null)
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
              (raw ? ready || events.length : traceReady) ? h(TraceList, { key: `${session.id}:${run.id}`, recordId: session.id, remoteId: session.remoteId, events, folded: raw ? undefined : fallback.rows, raw, interactions: current?.interactions ?? EMPTY, live: active, conversation: true, openFile, cwd: session.cwd }) : h('p', { className: 'aw-note' }, tt('loading')),
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
        const stopOperation = session => ({ action: 'native-stop', dshSessionId: session.native.sessionId, externalId: session.id, stopId: session.activity.stopId })

        function childDotState(session) {
          const { group, runState } = session.activity
          if (group === 'attention') return 'warning'
          if (group === 'working') return 'ongoing'
          if (group === 'review') return session.state === 'error' || runState === 'failed' ? 'error' : 'warning'
          return runState === 'completed' ? 'done' : 'idle'
        }

        function childStatus(session, tt) {
          const { group, runState } = session.activity
          if (group === 'attention') return { text: tt('pending'), tone: 'warn' }
          if (group === 'working') {
            if (runState === 'preparing' && !BUSY.has(session.state)) return { text: stateText('preparing'), tone: null }
            return { text: stateText(session.state === 'idle' ? 'running' : session.state), tone: null }
          }
          if (group === 'review') {
            const label = ['failed', 'interrupted'].includes(runState) ? stateText(runState) : stateText('error')
            return { text: label, tone: session.state === 'error' || runState === 'failed' ? 'error' : 'warn' }
          }
          return { text: runState === 'completed' ? stateText('completed') : stateText(session.state), tone: null }
        }

        function ChildRow({ child, sessionId, view, canWrite }) {
          const tt = useT()
          const [expanded, setExpanded] = React.useState(false)
          const [openError, setOpenError] = React.useState('')
          const latest = child.native.runs.at(-1)
          const name = child.native.name ?? child.title
          const status = childStatus(child, tt)
          const s = child.native
          const isNested = s?.rootSessionId && s.sessionId !== s.rootSessionId
          const openLabel = tt(isNested && !s.parentSessionId ? 'openRoot' : 'openConversation')
          const body = h(React.Fragment, null,
            h('span', { className: 'aw-child-glyph', 'aria-hidden': true }, h(StateDot, { state: childDotState(child) })),
            h('span', { className: 'aw-child-name', title: name }, name),
            h('span', { className: 'aw-child-status', 'data-tone': status.tone || undefined }, status.text))
          return h('li', { className: 'aw-child' },
            h('div', { className: 'aw-child-line', 'data-interactive': latest ? 'true' : undefined },
              latest
                ? h('button', { type: 'button', className: 'aw-child-trigger', 'aria-expanded': expanded, 'aria-label': `${name} · ${tt(expanded ? 'collapse' : 'expand')}`, onClick: () => setExpanded(v => !v) }, body)
                : h('span', { className: 'aw-child-trigger' }, body),
              h('div', { className: 'aw-child-actions' },
                s ? h(Tooltip, { label: openLabel, side: 'top', align: 'end', delayMs: 500, portal: true },
                  h('button', { type: 'button', className: 'aw-child-action', 'aria-label': openLabel, onClick: () => {
                    setOpenError('')
                    try { ctx.uiWorkspace.openSession(conversationTarget(s)) } catch (failure) { setOpenError(failure.message) }
                  } }, h(IconRightUpOutlineRegular, { size: 14 }))) : null,
                child.activity.stopId ? h(Tooltip, { label: tt('stop'), side: 'top', align: 'end', delayMs: 500, portal: true },
                  h('button', { type: 'button', className: 'aw-child-action aw-child-stop', 'aria-label': tt('stop'), disabled: !canWrite || view.busy || child.state === 'canceling', onClick: () => view.run(stopOperation(child)) },
                    h(IconStopFillRegular, { size: 12 }))) : null),
              latest ? h('span', { className: 'aw-child-chevron', 'data-open': expanded ? 'true' : undefined, 'aria-hidden': true },
                h(IconChevronDownOutlineRegular, { size: 14 })) : null),
            openError ? h('p', { role: 'alert', className: 'aw-error aw-child-error' }, openError) : null,
            child.interactions.length ? h('div', { className: 'aw-child-ask aw-section' },
              child.interactions.map(item => h(InteractionCard, { key: item.id, item, sessionId: child.id, cwd: child.cwd, run: view.run, disabled: view.busy || !canWrite, inline: true }))) : null,
            expanded && latest ? h('div', { className: 'aw-child-body' }, h(NativeTrace, { sessionId, openFile: makeOpenFile(child.native?.sessionId ?? sessionId, child.cwd), reference: { sessionId: child.id, turnId: latest.id } })) : null)
        }

        function ChildrenCard({ childrenList, visible, quiet, sessionId, view, canWrite }) {
          const tt = useT()
          const hasAttention = visible.some(s => s.activity.group === 'attention')
          const hasActive = visible.length > 0
          const [collapsed, setCollapsed] = React.useState(() => !hasActive)
          const [quietOpen, setQuietOpen] = React.useState(false)
          const prevAttention = React.useRef(hasAttention)
          React.useEffect(() => {
            if (hasAttention && !prevAttention.current) setCollapsed(false)
            prevAttention.current = hasAttention
          }, [hasAttention])
          let waiting = 0, running = 0, review = 0, done = 0, idle = 0
          for (const child of childrenList) {
            const { group, runState } = child.activity
            if (group === 'attention') waiting++
            else if (group === 'working') running++
            else if (group === 'review') review++
            else if (runState === 'completed') done++
            else idle++
          }
          const parts = [
            waiting ? { text: tt('childrenWaiting', { n: waiting }), warn: true } : null,
            running ? { text: tt('childrenRunning', { n: running }), warn: false } : null,
            review ? { text: tt('childrenReview', { n: review }), warn: false } : null,
            done ? { text: tt('childrenDone', { n: done }), warn: false } : null,
            idle ? { text: tt('childrenIdle', { n: idle }), warn: false } : null,
          ].filter(Boolean)
          const childRow = child => h(ChildRow, { key: child.id, child, sessionId, view, canWrite })
          const showQuietDirectly = visible.length === 0
          return h('section', { className: 'aw-card aw-children-card', 'data-tone': hasAttention ? 'warn' : undefined, 'aria-label': tt('children') },
            h('div', { className: 'aw-children-body' },
              h('button', { type: 'button', className: 'aw-children-head', 'aria-expanded': !collapsed, onClick: () => setCollapsed(v => !v) },
                h('span', { className: 'aw-children-lead', 'aria-hidden': true }, h(IconUsersOutlineRegular, { size: 16 })),
                h('span', { className: 'aw-children-title' }, tt('children')),
                h('span', { className: 'aw-children-progress' },
                  parts.map((part, index) => h(React.Fragment, { key: part.text },
                    index > 0 ? '\u2002·\u2002' : null,
                    part.warn ? h('span', { className: 'aw-children-progress-warn' }, part.text) : part.text))),
                h('span', { className: 'aw-children-chevron', 'aria-hidden': true },
                  h(collapsed ? IconChevronUpOutlineRegular : IconChevronDownOutlineRegular, { size: 16 }))),
              !collapsed ? h('ul', { className: 'aw-children-list' },
                visible.map(childRow),
                showQuietDirectly ? quiet.map(childRow) : (quiet.length ? h(React.Fragment, null,
                  h('li', { className: 'aw-children-fold' },
                    h('button', { type: 'button', className: 'aw-children-fold-btn', 'aria-expanded': quietOpen, onClick: () => setQuietOpen(v => !v) },
                      tt('quietChildren', { n: quiet.length }),
                      h(IconChevronDownOutlineRegular, { size: 14, className: 'aw-children-fold-chevron', 'data-open': quietOpen ? 'true' : undefined }))),
                  quietOpen ? quiet.map(childRow) : null) : null)) : null))
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
            page ? h('div', { className: 'aw-previous', role: 'region', 'aria-label': tt('previousMessages'), tabIndex: 0 }, page.events.length ? h(TraceList, { key: binding.id, recordId: binding.id, remoteId: binding.remoteId, openFile: makeOpenFile(binding.native?.sessionId, binding.cwd), events: page.events, cwd: binding.cwd, live: false, conversation: false }) : h('p', { className: 'aw-note' }, tt('noReplay'))) : null,
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
          const revision = binding?.state === 'idle' ? binding.eventSeq : null
          React.useEffect(() => {
            if (!binding) return
            const controller = new AbortController()
            api({ action: 'get', sessionId: binding.id }, controller.signal).then(data => { if (!controller.signal.aborted) { setDetail({ id: binding.id, data }); setError('') } }, failure => { if (!controller.signal.aborted) setError(failure.message) })
            return () => controller.abort()
          }, [binding?.id, revision])
          const blocked = !canWrite || view.busy || view.data.status !== 'idle'
          const enabled = !blocked && binding?.state === 'idle' && !binding.archived
          const controls = view.data?.controls
          const draftEntries = !enabled && controls ? [
            ...(controls.modes?.options?.length > 1 ? [{
              id: '__draft_mode', label: tt('mode'), category: 'mode', kind: 'select',
              value: controls.mode ?? controls.modes.options[0].value,
              options: controls.modes.options.map(item => ({ value: item.value, label: item.name ?? item.value, description: item.description ?? '' })),
              op: value => ({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, modeId: value }),
            }] : []),
            ...(controls.options ?? []).map(option => option.type === 'boolean'
              ? { id: `__draft_${option.id}`, label: option.name ?? option.id, description: option.description ?? '', category: option.category, kind: 'boolean', value: Boolean(controls.values?.[option.id]),
                  op: value => ({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: option.id, value }) }
              : { id: `__draft_${option.id}`, label: option.name ?? option.id, description: option.description ?? '', category: option.category, kind: 'select', value: controls.values?.[option.id] ?? option.defaultValue ?? '',
                  options: (option.choices ?? []).map(item => ({ value: item.value, label: item.name ?? item.value, description: item.description ?? '' })),
                  op: value => ({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: option.id, value }) }),
          ] : []
          const entries = info ? configEntries(info, tt).filter(e => e.category !== 'model' && (e.category !== 'thought_level' || view.data.selected?.model === 'default')) : []
          const title = `${provider.label} · ${tt('cliOptions')}`
          return h(React.Fragment, null, h('div', { style: { anchorName }, 'aria-hidden': true }),
            h('section', { ref: popup, className: 'acpw aw-options aw-section', style: { positionAnchor: anchorName },
              popover: 'auto', role: 'dialog', 'aria-label': title, tabIndex: -1,
              onToggle: e => { if (e.target === e.currentTarget && e.newState === 'closed') view.setOptions(null) } },
            h('div', { className: 'aw-row' }, h('strong', { className: 'aw-grow' }, title), binding ? h(Status, { state: binding.state }) : null,
              h('button', { type: 'button', className: 'aw-icon-btn', 'aria-label': tt('hideOptions'), title: tt('hideOptions'), onClick: close },
                h(IconCloseOutlineRegular, { size: 15 }))),
            binding ? h('p', { className: 'aw-note aw-ellipsis', title: binding.cwd }, binding.title, ' · ', binding.cwd) : null,
            h(WorkspaceTools, { sessionId }),
            h(ForkOrigin, { binding }), binding?.native.imported ? h(PreviousMessages, { binding }) : null,
            !binding || !CONNECTED.has(binding.state) ? h(React.Fragment, null,
              h('p', { className: 'aw-note' }, tt(!binding ? 'firstTurn' : binding.archived ? 'archivedHint' : 'noConfig')),
              draftEntries.length ? h(React.Fragment, null,
                h('div', { className: 'aw-config' }, draftEntries.map(entry => h(ConfigControl, { key: entry.id, entry, disabled: blocked, onChange: values => view.run(values) }))),
                h('p', { className: 'aw-note' }, tt('draftOptionHint'))) : null,
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

        function SteerBar({ sessionId, externalId, view, disabled }) {
          const tt = useT()
          const [text, setText] = React.useState('')
          const submit = async event => {
            event.preventDefault()
            const trimmed = text.trim()
            if (!trimmed || disabled) return
            const result = await view.run({ action: 'native-steer', dshSessionId: sessionId, externalId, text: trimmed })
            if (result) setText('')
          }
          return h('form', { className: 'aw-card aw-steer', onSubmit: submit, 'aria-label': tt('steerLabel') },
            h(Input, { className: 'aw-input', value: text, disabled, placeholder: tt('steerPlaceholder'), 'aria-label': tt('steerLabel'), onChange: e => setText(e.target.value) }),
            h(Button, { type: 'submit', size: 'sm', variant: 'outline', disabled: disabled || !text.trim() }, tt('steerSend')))
        }

        function NativeDock(props) {
          const canWrite = props.useAccess('session/prompt')
          const modelSelection = typeof props.useProjection === 'function' ? props.useProjection('modelSelection') : undefined
          const modelKey = modelSelection ? `${modelSelection.provider ?? ''}/${modelSelection.model ?? ''}` : undefined
          const view = useNative(props.sessionId, modelKey)
          const data = view.data
          const sessions = data?.sessions ?? EMPTY
          const own = sessions.filter(s => s.native.sessionId === props.sessionId && s.interactions.length)
          const provider = data?.providers.find(p => p.route === data.selected?.provider)
          const binding = provider ? sessions.findLast(s => s.native.sessionId === props.sessionId && s.native.route === provider.route && !s.native.retired) : null
          useCommandScope(props.sessionId, canWrite && data?.status === 'idle' && !view.error && binding?.state === 'idle' && !binding.archived ? binding.id : null, data?.commandStamp, provider?.label)
          const attentionChildren = sessions.filter(s => s.native.sessionId !== props.sessionId && !s.native.retired && !s.archived && s.interactions.length > 0)
          const notices = binding && !binding.archived && data.noticeFeed?.externalId === binding.id && data.noticeFeed.remoteId === binding.remoteId && data.noticeFeed.items.length ? data.noticeFeed : null
          const canSteer = !!(binding && !binding.archived && data?.controls?.canSteer && canWrite)
          if (!notices && !own.length && !attentionChildren.length && !canSteer && !view.error) return null
          return h('div', { className: 'acpw aw-dock' },
            own.flatMap(s => s.interactions.map(item => h(InteractionCard, { key: item.id, item, sessionId: s.id, cwd: s.cwd, run: view.run, disabled: view.busy || !canWrite }))),
            canSteer ? h(SteerBar, { key: 'steer:' + binding.id, sessionId: props.sessionId, externalId: binding.id, view, disabled: view.busy }) : null,
            notices ? h(ConnectionNotices, { key: 'notice:' + binding.id + ':' + notices.connection, report: notices }) : null,
            attentionChildren.length ? h(ChildrenCard, { key: props.sessionId, childrenList: attentionChildren, visible: attentionChildren, quiet: EMPTY, sessionId: props.sessionId, view, canWrite }) : null,
            view.error ? h('p', { className: 'aw-error', role: 'alert' }, view.error) : null)
        }

        function AcpAttentionIndicator({ sessionId, panelShown }) {
          const tt = useT()
          const view = useNative(sessionId)
          const sessions = view.data?.sessions ?? EMPTY
          const waiting = sessions.filter(s => s.native.sessionId !== sessionId && !s.native.retired && !s.archived && s.interactions.length > 0).length
          if (panelShown || waiting === 0) return null
          return h('span', { className: 'aw-panel-attention', 'data-acp-attention': '' },
            h('span', { className: 'aw-sr-only' }, tt('attentionIndicator', { n: waiting })))
        }

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
            'assistant/message': event => event.surfaceOp === 'append' ? traceMatch(event) : null,
          },
          start: (_context, match) => traceState(match.event),
          update: (context, match) => ({ ...traceState(match.event, context.state), seq: context.state.seq }),
          buildViewNode: context => context.state?.provider?.startsWith('acp-') && context.state?.reference?.version === 1 ? { key: context.key, id: context.id, kind: 'acp-run', target: 'chat',
            groupTree: 'turn',
            anchorSeq: context.state.seq, location: context.start?.location ?? { kind: 'unresolved' }, visibility: 'visible', data: context.state } : null,
        })
        function NativeNode(props) {
          return h(NativeTrace, { sessionId: props.sessionId, openFile: props.openFile, ...props.node.data,
            collapsible: true, defaultOpen: !props.node.data.messageId })
        }

        const WAIT_DELAY_MS = 2000
        const WAIT_CLOCK_MIN_S = 5
        const waitMatch = event => {
          const turn = event?.data?.turn
          if (typeof turn !== 'number') return null
          return { id: String(turn), role: event.type === 'turn/start' ? 'start' : 'update' }
        }
        const waitUpdate = (state, event) => {
          if (event.type === 'turn/end') {
            return { ...state, closed: true, phase: 'idle', lastSeq: Math.max(state.lastSeq, event.seq) }
          }
          if (event.type === 'assistant/live-chunk') {
            const chunk = event.data?.chunk
            if (!chunk) return state
            if (chunk.type === 'text-delta' && typeof chunk.text === 'string' && chunk.text.trim() !== '') {
              return { ...state, phase: 'text', lastSeq: Math.max(state.lastSeq, event.seq), lastActivityAt: event.time }
            }
            if ((chunk.type === 'reasoning-delta' && typeof chunk.text === 'string' && chunk.text.trim() !== '')
              || chunk.type === 'tool-call-delta'
              || (chunk.type === 'block-start' && chunk.blockType === 'tool-call')
              || (chunk.type === 'block-end' && chunk.block?.type === 'tool-call')) {
              return { ...state, phase: 'active', lastSeq: Math.max(state.lastSeq, event.seq), lastActivityAt: event.time }
            }
            return state
          }
          if (event.type === 'tool/call' || event.type === 'tool/result') {
            return { ...state, phase: 'active', lastSeq: Math.max(state.lastSeq, event.seq), lastActivityAt: event.time }
          }
          if (event.type === 'assistant/message') {
            const blocks = event.data?.message?.content ?? EMPTY
            if (blocks.some(block => block?.type === 'tool-call')) {
              return { ...state, phase: 'active', lastSeq: Math.max(state.lastSeq, event.seq), lastActivityAt: event.time }
            }
            return state
          }
          return state
        }
        ctx.uiConversation.events.register({
          kind: 'acp-wait',
          target: 'chat',
          match: {
            'turn/start': waitMatch,
            'turn/end': waitMatch,
            'assistant/live-chunk': waitMatch,
            'assistant/message': waitMatch,
            'tool/call': waitMatch,
            'tool/result': waitMatch,
          },
          start: (_context, match) => ({
            turn: match.event.data.turn,
            phase: 'idle',
            lastSeq: match.event.seq,
            lastActivityAt: match.event.time,
            closed: false,
          }),
          update: (context, match) => waitUpdate(context.state, match.event),
          publication: match => match.event.type === 'assistant/live-chunk' ? 'animation-frame' : 'immediate',
          buildViewNode: context => {
            const state = context.state
            if (!state || state.closed || state.phase !== 'text') return null
            const location = context.start?.location ?? context.matches[0]?.location
            if ((location?.kind === 'turn' || location?.kind === 'step') && location.turn.status === 'closed') return null
            return {
              key: context.key,
              id: context.id,
              kind: 'acp-wait',
              target: 'chat',
              groupTree: 'turn',
              anchorSeq: Math.floor(state.lastSeq) + 0.9999,
              location: location ?? { kind: 'unresolved' },
              visibility: 'visible',
              data: state,
            }
          },
        })

        function formatWaitDuration(seconds, tt) {
          const total = Math.max(1, Math.floor(seconds))
          if (total < 60) return tt('waitSec', { s: total })
          return tt('waitMinSec', { m: Math.floor(total / 60), s: total % 60 })
        }

        function AcpWaitNode(props) {
          const tt = useT()
          const running = typeof props.useSession === 'function' ? props.useSession(s => s.running) : true
          const view = useNative(props.sessionId)
          const data = props.node.data
          const activityKey = `${data.turn}:${data.lastSeq}:${data.lastActivityAt}`
          const sinceRef = React.useRef({
            key: activityKey,
            at: typeof data.lastActivityAt === 'number' && data.lastActivityAt <= Date.now() && Date.now() - data.lastActivityAt < 3_600_000
              ? data.lastActivityAt
              : Date.now(),
          })
          if (sinceRef.current.key !== activityKey) {
            sinceRef.current = { key: activityKey, at: Date.now() }
          }
          const since = sinceRef.current.at
          const [now, setNow] = React.useState(Date.now)
          const route = view.data?.selected?.provider
          const isAcp = typeof route === 'string' && route.startsWith('acp-')
          const binding = isAcp
            ? view.data?.sessions.findLast(s => s.native?.sessionId === props.sessionId && s.native.route === route && !s.native.retired)
            : null
          const activeRun = binding?.native?.runs?.at(-1)
          const waitingForInput = Boolean(binding?.interactions?.length)
          const active = Boolean(running && isAcp && !waitingForInput && (!activeRun || ACTIVE_RUN.has(activeRun.state)))
          React.useEffect(() => {
            if (!active) return undefined
            const elapsed = Date.now() - since
            let interval = null
            const startTick = () => {
              setNow(Date.now())
              interval = setInterval(() => setNow(Date.now()), 1000)
            }
            if (elapsed >= WAIT_DELAY_MS) {
              startTick()
              return () => { if (interval) clearInterval(interval) }
            }
            const timer = setTimeout(startTick, WAIT_DELAY_MS - elapsed)
            return () => {
              clearTimeout(timer)
              if (interval) clearInterval(interval)
            }
          }, [active, since])
          if (!active) return null
          const elapsedMs = Math.max(0, now - since)
          if (elapsedMs < WAIT_DELAY_MS) return null
          const elapsedSec = Math.floor(elapsedMs / 1000)
          const providerLabel = view.data?.providers.find(p => p.route === route)?.label ?? ''
          const duration = elapsedSec >= WAIT_CLOCK_MIN_S ? formatWaitDuration(elapsedSec, tt) : ''
          const label = providerLabel
            ? (duration ? tt('waitNextElapsed', { name: providerLabel, duration }) : tt('waitNext', { name: providerLabel }))
            : (duration ? tt('waitNextGenericElapsed', { duration }) : tt('waitNextGeneric'))
          return h('div', { className: 'acpw aw-wait', role: 'status', 'aria-live': 'polite' },
            h('span', { className: 'aw-wait-icon', 'aria-hidden': true }, h(IconSparkleRegular, { size: 14 })),
            h(TextShimmer, { active: true, className: 'aw-wait-text' }, label))
        }

        const collapsedRepliesKey = 'dsh-acp-workbench:collapsed-replies:v1'
        const MAX_COLLAPSED_REPLIES = 300
        let collapsedReplies = new Set()
        const collapsedReplyListeners = new Set()
        try {
          const stored = JSON.parse(window.localStorage?.getItem(collapsedRepliesKey) ?? '[]')
          if (Array.isArray(stored)) collapsedReplies = new Set(stored.filter(item => typeof item === 'string').slice(-MAX_COLLAPSED_REPLIES))
        } catch {}
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
          try { window.localStorage?.setItem(collapsedRepliesKey, JSON.stringify([...next])) } catch {}
          for (const listener of collapsedReplyListeners) listener()
        }
        function replyPreviewLine(text) {
          for (const line of text.split(/\r?\n/u)) {
            const clean = line.trim().replace(/^#{1,6}\s+|^>\s*|^[-*+]\s+|`+/gu, '').trim()
            if (clean) return clean.length > 72 ? `${clean.slice(0, 71)}…` : clean
          }
          return ''
        }
        function AcpTurnReplyToggle({ sessionId, turn, seq, openFile }) {
          const tt = useT()
          const view = useNative(sessionId)
          const btnRef = React.useRef(null)
          const [traceOpen, setTraceOpen] = React.useState(false)
          const steps = (turn?.steps ?? EMPTY).map(step => step.data.get('assistant-step')).filter(Boolean)
          const acpStep = steps.findLast(step => step.finalNode?.source?.provider?.startsWith('acp-'))
          const matchedSession = acpStep
            ? view.data?.sessions.find(s => s.native?.route === acpStep.finalNode.source.provider)
            : view.data?.sessions.find(s => s.native?.sessionId === sessionId && s.native.runs.some(r => r.turn === turn?.turn))
          const matchedRun = matchedSession?.native?.runs.findLast(r => r.turn === turn?.turn)
          const route = acpStep?.finalNode?.source?.provider ?? matchedSession?.native?.route
          const visibleBlocks = steps.flatMap(step => (step.blocks ?? EMPTY).filter(block =>
            block.kind !== 'reasoning' && block.kind !== 'tool-call' && (block.kind !== 'text' || block.text.trim() !== '')))
          const isV2AcpTurn = !!route?.startsWith('acp-') && !!matchedRun && matchedRun.nativeVersion >= 2
          const isAcpReply = !!route?.startsWith('acp-') && !!matchedRun && !(matchedRun.nativeVersion >= 2) && visibleBlocks.length > 0
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
          if (isV2AcpTurn) {
            const active = ACTIVE_RUN.has(matchedRun.state)
            const hasAlert = Boolean(matchedRun.error || matchedRun.state === 'failed' || matchedRun.state === 'interrupted')
            const dotState = active ? 'ongoing' : matchedRun.state === 'failed' || matchedRun.error ? 'error' : matchedRun.state === 'interrupted' ? 'warning' : null
            const toolCount = matchedRun.tools > 0 ? (matchedRun.tools === 1 ? tt('traceTool') : tt('traceTools', { n: matchedRun.tools })) : null
            const resolvedOpenFile = openFile ?? makeOpenFile(sessionId, matchedSession?.cwd)
            return h('div', { className: 'acpw aw-v2-trace' },
              h('button', {
                type: 'button',
                className: 'aw-v2-trace-btn',
                'aria-expanded': traceOpen,
                title: tt('turnTraceHint'),
                onClick: () => setTraceOpen(v => !v),
              },
              dotState ? h(StateDot, { state: settle(dotState, active), size: 7 }) : null,
              h('span', null, tt(traceOpen ? 'turnTraceHide' : 'turnTrace')),
              toolCount ? h('span', { className: 'aw-muted' }, `· ${toolCount}`) : null,
              hasAlert && !traceOpen && matchedRun.stopReason && matchedRun.stopReason !== 'end_turn' ? h('span', { className: 'aw-muted' }, `· ${matchedRun.stopReason}`) : null,
              h(traceOpen ? IconChevronUpOutlineRegular : IconChevronDownOutlineRegular, { size: 12 })),
              traceOpen ? h(NativeTrace, {
                sessionId,
                openFile: resolvedOpenFile,
                reference: { sessionId: matchedSession.id, turnId: matchedRun.id },
                collapsible: false,
                defaultOpen: true,
              }) : null)
          }
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
        function FastBolt({ on }) {
          return h('svg', { viewBox: '0 0 16 16', width: 15, height: 15, 'aria-hidden': true },
            h('path', {
              d: 'M9.2 1.5 3.5 9h4l-.8 5.5L12.5 7h-4z',
              fill: on ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round',
            }))
        }

        function ToolbarSelect({ label, description, value, options, disabled, tone, onSelect }) {
          const [open, setOpen] = React.useState(false)
          const current = options.find(item => item.value === value) ?? options[0]
          const display = current?.name ?? value ?? ''
          const tooltip = description ? `${label}: ${display} — ${description}` : current?.description ? `${label}: ${display} — ${current.description}` : `${label}: ${display}`
          const items = options.map(option => ({
            id: option.value,
            label: option.description
              ? h('span', { className: 'aw-menu-item-copy' },
                h('span', { className: 'aw-menu-item-label' }, option.name ?? option.value),
                h('span', { className: 'aw-menu-item-desc' }, option.description))
              : (option.name ?? option.value),
          }))
          return h(Menu, {
            open: open && !disabled,
            items,
            selectedId: value,
            onSelect: id => { setOpen(false); if (id !== value) onSelect(id) },
            onClose: () => setOpen(false),
            side: 'top',
            portal: true,
            anchor: h('button', {
              type: 'button',
              className: 'aw-tb-btn',
              'data-tone': tone || undefined,
              disabled,
              'aria-label': `${label}: ${display}`,
              'aria-haspopup': 'menu',
              'aria-expanded': open && !disabled,
              title: tooltip,
              onClick: () => setOpen(v => !v),
            },
            h('span', { className: 'aw-ellipsis' }, display),
            h('span', { className: 'aw-tb-chev', 'data-open': open && !disabled, 'aria-hidden': true },
              h(IconChevronDownOutlineRegular, { size: 12 }))),
          })
        }

        function NativeModelControls({ sessionId, useAccess, useProjection }) {
          const tt = useT()
          const modelSelection = typeof useProjection === 'function' ? useProjection('modelSelection') : undefined
          const modelKey = modelSelection ? `${modelSelection.provider ?? ''}/${modelSelection.model ?? ''}` : undefined
          const view = useNative(sessionId, modelKey)
          const canWrite = useAccess('session/prompt')
          const controls = view.data?.controls
          if (!controls) return null
          const disabled = !canWrite || view.busy || view.data.status !== 'idle'
          const modes = controls.modes?.options?.length > 1 ? controls.modes : null
          const options = controls.options ?? EMPTY
          const contextOpt = options.find(item => item.id === 'context' && item.type === 'select' && item.choices?.length > 1)
          const fastOpt = options.find(item => item.id === 'fast')
          const extraOptions = options.filter(item => item.id !== 'context' && item.id !== 'fast' && (item.type === 'boolean' || item.choices?.length > 1))
          if (!modes && !contextOpt && !fastOpt && !extraOptions.length) return null

          const currentMode = modes ? (controls.mode ?? modes.options[0].value) : null
          const isPlanMode = typeof currentMode === 'string' && currentMode.toLowerCase() === 'plan'

          const renderToggle = (opt, iconOnly) => {
            const pair = opt.type === 'select' ? booleanSelectPair(opt.choices) : null
            const rawValue = controls.values?.[opt.id] ?? opt.defaultValue
            const active = opt.type === 'boolean' ? Boolean(rawValue) : pair ? rawValue === pair.on : rawValue === 'true' || rawValue === 'on'
            const nextValue = opt.type === 'boolean' ? !active : pair ? (active ? pair.off : pair.on) : (active ? 'false' : 'true')
            const name = opt.name || opt.id
            const statusText = `${name}: ${tt(active ? 'onLabel' : 'offLabel')}`
            const tooltip = opt.description ? `${statusText} · ${opt.description}` : statusText
            const btn = h('button', {
              type: 'button',
              className: iconOnly ? 'aw-tb-btn aw-tb-icon' : 'aw-tb-btn',
              disabled,
              'data-active': active,
              'data-tone': opt.id === 'fast' ? 'fast' : undefined,
              'aria-pressed': active,
              'aria-label': statusText,
              onClick: () => view.run({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: opt.id, value: nextValue }),
            }, iconOnly ? h(FastBolt, { on: active }) : h('span', null, name))
            return Tooltip ? h(Tooltip, { key: opt.id, label: tooltip, side: 'top', portal: true }, btn) : React.cloneElement(btn, { key: opt.id, title: tooltip })
          }

          return h('div', { className: 'acpw aw-tb' },
            modes ? h(ToolbarSelect, {
              label: tt('mode'),
              value: currentMode,
              options: modes.options,
              disabled,
              tone: isPlanMode ? 'plan' : undefined,
              onSelect: modeId => view.run({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, modeId }),
            }) : null,
            contextOpt ? h(ToolbarSelect, {
              label: contextOpt.name || tt('context'),
              description: contextOpt.description,
              value: controls.values?.context ?? contextOpt.defaultValue ?? contextOpt.choices[0].value,
              options: contextOpt.choices,
              disabled,
              onSelect: value => view.run({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: contextOpt.id, value }),
            }) : null,
            fastOpt ? renderToggle(fastOpt, true) : null,
            extraOptions.map(opt => {
              const pair = opt.type === 'select' ? booleanSelectPair(opt.choices) : null
              if (opt.type === 'boolean' || pair) return renderToggle(opt, false)
              return h(ToolbarSelect, {
                key: opt.id,
                label: opt.name || opt.id,
                description: opt.description,
                value: controls.values?.[opt.id] ?? opt.defaultValue ?? opt.choices[0].value,
                options: opt.choices,
                disabled,
                onSelect: value => view.run({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: opt.id, value }),
              })
            }))
        }

        const CTX_RING_R = 5.75
        const CTX_RING_C = 2 * Math.PI * CTX_RING_R

        function NativeContextRing({ sessionId, useProjection }) {
          const tt = useT()
          const modelSelection = typeof useProjection === 'function' ? useProjection('modelSelection') : undefined
          const modelKey = modelSelection ? `${modelSelection.provider ?? ''}/${modelSelection.model ?? ''}` : undefined
          const view = useNative(sessionId, modelKey)
          const data = view.data
          const sessions = data?.sessions ?? EMPTY
          const provider = data?.providers.find(p => p.route === data.selected?.provider)
          const binding = provider ? sessions.findLast(s => s.native.sessionId === sessionId && s.native.route === provider.route && !s.native.retired) : null
          const report = binding && !binding.archived && data.contextReport?.externalId === binding.id ? data.contextReport : null
          const w = report?.window
          const available = Boolean(w && w.size > 0)
          const [open, setOpen] = React.useState(false)
          const btnRef = React.useRef(null)
          const popRef = React.useRef(null)
          const wasOpenRef = React.useRef(false)
          const id = React.useId()

          React.useEffect(() => {
            if (!available && open) {
              popRef.current?.hidePopover?.()
              setOpen(false)
            }
          }, [available, open])

          if (!available) return null

          const ratio = Math.min(1, Math.max(0, w.used / w.size))
          const percent = Math.round(ratio * 100)
          const dash = ratio > 0 ? Math.max(CTX_RING_C * 0.04, CTX_RING_C * ratio) : 0
          const tone = percent >= 95 ? 'danger' : percent >= 80 ? 'warn' : undefined
          const label = tt('usageContext', { used: number(w.used), size: number(w.size), percent: number(percent) })

          const onPointerDown = () => {
            wasOpenRef.current = Boolean(popRef.current?.matches?.(':popover-open'))
          }

          const toggle = () => {
            const panel = popRef.current
            const anchorEl = btnRef.current
            if (!panel || !anchorEl || typeof panel.showPopover !== 'function') return
            if (wasOpenRef.current) {
              wasOpenRef.current = false
              if (panel.matches(':popover-open')) panel.hidePopover()
              return
            }
            if (panel.matches(':popover-open')) {
              panel.hidePopover()
              return
            }
            const rect = anchorEl.getBoundingClientRect()
            const width = Math.min(280, window.innerWidth - 24)
            const above = rect.top - 20
            const below = window.innerHeight - rect.bottom - 20
            const openAbove = above >= 140 || above >= below
            panel.style.left = `${Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))}px`
            panel.style.top = openAbove ? 'auto' : `${rect.bottom + 8}px`
            panel.style.bottom = openAbove ? `${window.innerHeight - rect.top + 8}px` : 'auto'
            panel.style.maxHeight = `${Math.max(80, openAbove ? above : below)}px`
            panel.showPopover()
          }

          const trigger = h('button', {
            ref: btnRef,
            type: 'button',
            className: 'aw-tb-btn aw-tb-icon aw-ctx-btn',
            'data-tone': tone,
            'aria-label': label,
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            'aria-controls': id,
            onPointerDown,
            onClick: toggle,
          },
          h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true },
            h('circle', { className: 'aw-ctx-track', cx: 8, cy: 8, r: CTX_RING_R }),
            dash > 0 ? h('circle', {
              className: 'aw-ctx-fill',
              cx: 8,
              cy: 8,
              r: CTX_RING_R,
              strokeDasharray: `${dash} ${CTX_RING_C}`,
              transform: 'rotate(-90 8 8)',
            }) : null))

          return h('span', { className: 'acpw aw-ctx-root' },
            Tooltip
              ? h(Tooltip, { label, side: 'top', delayMs: 200, disabled: open, portal: true }, trigger)
              : React.cloneElement(trigger, { title: label }),
            h('div', {
              ref: popRef,
              id,
              className: 'acpw aw-ctx-pop',
              'data-tone': tone,
              'data-composer-overlay': '',
              popover: 'auto',
              role: 'dialog',
              'aria-label': tt('contextRecent'),
              onToggle: e => { if (e.target === e.currentTarget) setOpen(e.newState === 'open') },
            },
            h('div', { className: 'aw-ctx-head' },
              h('span', { className: 'aw-ctx-title' }, tt('contextRecent')),
              h('span', { className: 'aw-ctx-pct' }, `${number(percent)}%`)),
            h('div', { className: 'aw-ctx-nums' }, `${number(w.used)} / ${number(w.size)}`),
            h('div', { className: 'aw-ctx-bar', 'aria-hidden': true },
              h('i', { style: { width: `${Math.min(100, ratio * 100)}%` } })),
            h('div', { className: 'aw-ctx-meta' },
              w.model ? h('span', null, tt('ctxModel', { model: w.model })) : null,
              w.cost ? h('span', null, tt('ctxCost', { amount: costNumber(w.cost.amount), unit: w.cost.currency })) : null,
              report.at ? h('span', { className: 'aw-note' }, tt('ctxAt', { time: stamp(report.at) })) : null,
              h('small', { className: 'aw-note' }, tt('ctxScope')))))
        }

        const GREP_PATHS_PRIORITY = -5
        function tvParseArgs(block) {
          const raw = ('kind' in block ? block.call?.argsRaw : block.argsRaw) ?? ''
          try {
            const parsed = JSON.parse(raw)
            if (isPlainObj(parsed)) return { raw, args: parsed }
          } catch {}
          return { raw, args: null }
        }
        function tvResultText(block) {
          if (!('kind' in block)) return null
          const parts = []
          for (const item of block.content ?? EMPTY) {
            if (item?.type === 'text' && typeof item.text === 'string') parts.push(item.text)
            else if (item) parts.push(JSON.stringify(item, null, 2))
          }
          if (!parts.length && block.error !== undefined) parts.push(`${block.error.name ?? 'Error'}: ${block.error.code ?? ''}`)
          return parts.join('\n') || null
        }
        function tvState(phase, block) {
          if (phase === 'preparing') return 'preparing'
          if (!('kind' in block)) return 'running'
          if (block.error?.code === 'interrupted') return 'stopped'
          return block.isError ? 'error' : 'ok'
        }
        function tvFirstLine(text) {
          if (typeof text !== 'string') return ''
          for (const line of text.split(/\r?\n/u)) {
            const clean = line.trim().replace(/^#{1,6}\s+/u, '')
            if (clean) return clean.length > 100 ? `${clean.slice(0, 99)}…` : clean
          }
          return ''
        }

        function findBaseToolView(key, self, minPriority) {
          let best
          for (const entry of ctx.slots.entries('tool.call.toolview')) {
            if (entry.options?.key !== key || entry.component === self) continue
            const priority = entry.options.priority ?? 0
            if (priority <= minPriority) continue
            if (best === undefined || priority < (best.options.priority ?? 0)) best = entry
          }
          return best
        }

        function GrepPathsRow(props) {
          const tt = useT()
          const labels = useToolLabels()
          const { expanded, toggle } = props.useDisclosure()
          const { phase, block, inspect } = props
          const meta = isPlainObj(block?.meta) ? block.meta : null
          const isPathsResult = phase === 'result' && 'kind' in block && !block.isError && meta?.shape === 'paths' && Array.isArray(meta.paths)
          if (!isPathsResult) {
            const base = findBaseToolView('grep', GrepPathsRow, GREP_PATHS_PRIORITY)
            return base ? h(base.component, props) : null
          }
          const { args } = tvParseArgs(block)
          const pattern = firstText(args?.pattern)
          const dir = firstText(args?.path)
          const summary = [pattern, dir].filter(Boolean).join(' · ')
          const paths = meta.paths.filter(p => typeof p === 'string')
          const total = Number.isInteger(meta.total) && meta.total >= 0 ? meta.total : paths.length
          return h('div', { className: 'acpw aw-tv-card', 'data-tool': 'grep', 'data-state': 'ok' },
            h(DisclosureRow, {
              rowClassName: 'aw-tv-row',
              icon: h(IconSearchOutlineRegular, { size: 14 }),
              title: tt('tool.grepPaths'),
              running: false,
              open: expanded,
              expandable: true,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: summary ? h(React.Fragment, null,
                h('span', { className: 'aw-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: 'aw-tv-summary' }, h(TextShimmer, null, summary))) : null,
            },
            expanded ? h('div', { className: 'aw-tv-body' },
              h(SearchBlock, { kind: 'paths', paths, total, truncated: meta.truncated === true, labels, maxLines: 8, className: 'aw-tv-block' }),
              inspect ? h('button', { type: 'button', className: 'aw-tv-inspect', onClick: inspect }, h(IconInspectOutlineRegular), tt('tool.inspect')) : null) : null))
        }

        const ACP_TOOLVIEW_SPECS = {
          ExitPlanMode: { icon: IconChecklistOutlineRegular, titleKey: 'tool.exitPlanMode', mode: 'plan' },
          EnterPlanMode: { icon: IconChecklistOutlineRegular, titleKey: 'tool.enterPlanMode', mode: 'plan' },
          memory_recall: { icon: IconBrowseOutlineRegular, titleKey: 'tool.memoryRecall', mode: 'memory' },
          SemanticSearch: { icon: IconSearchOutlineRegular, titleKey: 'tool.semanticSearch', mode: 'search' },
          codebase_search: { icon: IconSearchOutlineRegular, titleKey: 'tool.semanticSearch', mode: 'search' },
          run_workflow: { icon: IconCodeOutlineRegular, titleKey: 'tool.workflow', mode: 'workflow' },
          manage_task: { icon: IconChecklistOutlineRegular, titleKey: 'tool.task', mode: 'generic' },
          TaskCreate: { icon: IconChecklistOutlineRegular, titleKey: 'tool.task', mode: 'generic' },
          TaskUpdate: { icon: IconChecklistOutlineRegular, titleKey: 'tool.task', mode: 'generic' },
          TaskList: { icon: IconChecklistOutlineRegular, titleKey: 'tool.task', mode: 'generic' },
          TaskGet: { icon: IconChecklistOutlineRegular, titleKey: 'tool.task', mode: 'generic' },
          TaskStop: { icon: IconChecklistOutlineRegular, titleKey: 'tool.task', mode: 'generic' },
          schedule: { icon: IconClockOutlineRegular, titleKey: 'tool.schedule', mode: 'schedule' },
          Monitor: { icon: IconClockOutlineRegular, titleKey: 'tool.monitor', mode: 'generic' },
          swarm: { icon: IconUsersOutlineRegular, titleKey: 'tool.swarm', mode: 'swarm' },
          manage_subagents: { icon: IconUsersOutlineRegular, titleKey: 'tool.subagents', mode: 'generic' },
          define_subagent: { icon: IconUsersOutlineRegular, titleKey: 'tool.defineSubagent', mode: 'subagent_def' },
          ListAgents: { icon: IconUsersOutlineRegular, titleKey: 'tool.subagents', mode: 'generic' },
          spawn_agent: { icon: IconUsersOutlineRegular, titleKey: 'tool.spawnAgent', mode: 'spawn_agent' },
          list_providers: { icon: IconSparkleRegular, titleKey: 'tool.listProviders', mode: 'generic' },
          read_agent_result: { icon: IconBrowseOutlineRegular, titleKey: 'tool.readAgentResult', mode: 'read_agent' },
        }

        function parseJsonSafe(text) {
          if (typeof text !== 'string' || !text.trim().startsWith('{')) return null
          try {
            const parsed = JSON.parse(text)
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
          } catch {
            return null
          }
        }

        function openSubagentAside(parentSessionId, childSessionId) {
          const sidebar = ctx.get('sidebarRight')
          if (sidebar && typeof sidebar.openResource === 'function' && parentSessionId) {
            const query = new URLSearchParams({ parent: parentSessionId, mode: 'continuable' })
            sidebar.openResource(`dsh-resource://subagentchat/session/${encodeURIComponent(childSessionId)}?${query}`, {
              kind: 'subagentchat',
              preferNewPane: true,
            })
            return
          }
          ctx.uiWorkspace.openSession(parentSessionId
            ? { parentSessionId, childSessionId, mode: 'continuable' }
            : childSessionId)
        }

        function acpToolSummary(mode, args) {
          if (!args) return ''
          if (mode === 'spawn_agent') {
            return [
              firstText(args.name, args.label),
              firstText(args.provider) || 'dsh',
              firstText(args.model),
              args.isolation === 'worktree' ? (firstText(args.branch) || 'worktree') : '',
            ].filter(Boolean).join(' · ')
          }
          if (mode === 'read_agent') return firstText(args.agent) || ''
          if (mode === 'plan') return tvFirstLine(args.plan) || firstText(args.planFilePath, args.reason) || ''
          if (mode === 'memory') {
            const paths = Array.isArray(args.paths) ? args.paths.filter(p => typeof p === 'string') : EMPTY
            return firstText(args.query) || paths.slice(0, 3).join(', ')
          }
          if (mode === 'search') return firstText(args.query, args.Query, args.pattern) || ''
          if (mode === 'workflow') return firstText(args.Description, args.ScriptPath) || ''
          if (mode === 'schedule') {
            const timing = firstText(args.CronExpression)
              ?? (Number.isFinite(args.DurationSeconds) ? `${args.DurationSeconds}s` : undefined)
            const flags = [args.IsDaemon ? 'daemon' : '', Number.isInteger(args.MaxIterations) ? `×${args.MaxIterations}` : ''].filter(Boolean).join(' ')
            return [timing, flags, tvFirstLine(args.Prompt)].filter(Boolean).join(' · ')
          }
          if (mode === 'swarm') {
            const action = firstText(args.action)
            const count = Array.isArray(args.tasks) && args.tasks.length > 0 ? args.tasks.length
              : Number.isInteger(args.n) && args.n > 1 ? args.n : 0
            const name = firstText(args.name)
            const target = name && count > 0 ? `${name} × ${count}` : name
            const detail = firstText(args.title, args.model) || tvFirstLine(args.brief)
            return [action, target, detail].filter(Boolean).join(' · ')
          }
          if (mode === 'subagent_def') {
            return [firstText(args.Name, args.name), tvFirstLine(args.Description)].filter(Boolean).join(' · ')
          }
          const action = firstText(args.action, args.Action)
          const detail = firstText(args.subject, args.name, args.Name, args.TaskId, args.CronExpression, args.Prompt, args.description, args.title)
            ?? (Number.isFinite(args.DurationSeconds) ? `${args.DurationSeconds}s` : undefined)
          const inputPreview = tvFirstLine(args.Input)
          return [action, detail, inputPreview].filter(Boolean).join(' · ')
        }

        function omitKeys(obj, keys) {
          if (!obj || typeof obj !== 'object') return null
          const out = {}
          for (const [k, v] of Object.entries(obj)) {
            if (!keys.has(k) && v !== undefined && v !== '') out[k] = v
          }
          return Object.keys(out).length > 0 ? out : null
        }

        function AcpCustomToolRow({ toolName, phase, block, openFile, inspect, useDisclosure }) {
          const tt = useT()
          const labels = useDiffLabels()
          const { expanded, toggle } = useDisclosure()
          const spec = ACP_TOOLVIEW_SPECS[toolName]
          const IconComp = spec?.icon ?? IconSparkleRegular
          const title = tt(spec?.titleKey ?? 'tool')
          const state = tvState(phase, block)
          const running = state === 'preparing' || state === 'running'
          const { raw, args } = tvParseArgs(block)
          const output = tvResultText(block)
          const mode = spec?.mode ?? 'generic'
          const summaryBase = state === 'stopped' ? tt('tool.stopped')
            : state === 'error' && output ? tvFirstLine(output)
              : acpToolSummary(mode, args)
          const planPath = mode === 'plan' ? firstText(args?.planFilePath) : undefined
          const planText = mode === 'plan' ? firstText(args?.plan) : undefined
          const memoryPaths = mode === 'memory' && Array.isArray(args?.paths) ? args.paths.filter(p => typeof p === 'string' && p.trim()) : EMPTY
          const workflowScript = mode === 'workflow' ? firstText(args?.Script) : undefined
          const workflowPath = mode === 'workflow' ? firstText(args?.ScriptPath) : undefined
          const spawned = mode === 'spawn_agent' ? parseJsonSafe(output) : null
          const spawnedId = typeof spawned?.sessionId === 'string' && spawned.sessionId ? spawned.sessionId : null
          const spawnedParent = typeof spawned?.parentSessionId === 'string' && spawned.parentSessionId ? spawned.parentSessionId : null
          const spawnedLabel = firstText(spawned?.agent, args?.name, args?.label)
          const proseText = planText
            ?? (mode === 'swarm' ? firstText(args?.brief) : undefined)
            ?? (mode === 'subagent_def' ? firstText(args?.SystemPrompt) : undefined)
            ?? (mode === 'spawn_agent' ? firstText(args?.prompt) : undefined)
          const omitted = new Set(
            mode === 'plan' ? ['plan', 'planFilePath']
              : mode === 'workflow' ? ['Script', 'ScriptPath']
                : mode === 'swarm' ? ['brief']
                  : mode === 'subagent_def' ? ['SystemPrompt']
                    : mode === 'spawn_agent' ? ['prompt']
                      : [],
          )
          const remainingArgs = args ? omitKeys(args, omitted) : null
          const inputText = remainingArgs ? JSON.stringify(remainingArgs, null, 2)
            : (!proseText && !workflowScript && !workflowPath && raw && raw !== '{}' ? raw : '')
          const hasBody = Boolean(spawnedId || planPath || workflowPath || proseText || memoryPaths.length || workflowScript || output || inputText)
          const expandable = state !== 'preparing' && hasBody
          const open = expanded && expandable
          const mdLabels = React.useMemo(() => ({
            code: { copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels },
            footnotes: '',
          }), [labels])

          return h('div', { className: 'acpw aw-tv-card', 'data-tool': toolName, 'data-state': state },
            h(DisclosureRow, {
              rowClassName: 'aw-tv-row',
              icon: h(IconComp, { size: 14 }),
              title,
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: state === 'preparing' || !summaryBase ? null : h(React.Fragment, null,
                h('span', { className: 'aw-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `aw-tv-summary${state === 'error' ? ' aw-tv-error' : state === 'stopped' ? ' aw-tv-stopped' : ''}` },
                  h(TextShimmer, null, summaryBase))),
            },
            open ? h('div', { className: 'aw-tv-body' },
              spawnedId ? h('div', { className: 'aw-tv-files' },
                h('button', { type: 'button', className: 'aw-tv-file', onClick: () => openSubagentAside(spawnedParent, spawnedId) },
                  tt('openInSidebar'), spawnedLabel ? ` · ${spawnedLabel}` : ''),
                h('button', { type: 'button', className: 'aw-tv-file', onClick: () => ctx.uiWorkspace.openSession(spawnedParent ? { parentSessionId: spawnedParent, childSessionId: spawnedId, mode: 'continuable' } : spawnedId) },
                  tt('openConversation'))) : null,
              planPath ? h('div', { className: 'aw-tv-files' },
                openFile
                  ? h('button', { type: 'button', className: 'aw-tv-file', onClick: () => openFile(planPath) }, tt('tool.openPlanFile'), ' · ', planPath)
                  : h(PathLabel, { path: planPath })) : null,
              workflowPath ? h('div', { className: 'aw-tv-files' },
                openFile
                  ? h('button', { type: 'button', className: 'aw-tv-file', title: workflowPath, onClick: () => openFile(workflowPath) }, workflowPath)
                  : h(PathLabel, { path: workflowPath })) : null,
              memoryPaths.length ? h('div', { className: 'aw-tv-files' },
                memoryPaths.map(path => openFile
                  ? h('button', { key: path, type: 'button', className: 'aw-tv-file', title: path, onClick: () => openFile(path) }, path)
                  : h(PathLabel, { key: path, path }))) : null,
              proseText ? h('div', { className: 'aw-tv-panel' },
                h('div', { className: 'aw-tv-prose' }, h(MarkdownText, { text: proseText, labels: mdLabels }))) : null,
              workflowScript ? h('div', { className: 'aw-code-window aw-tv-block' },
                h(CodeBlock, { code: workflowScript, lang: 'python', copyLabel: labels.copy, copiedLabel: labels.copied, toolbarLabels: labels })) : null,
              inputText || output ? h('div', { className: 'aw-tv-io' },
                inputText ? h('div', { className: 'aw-tv-io-sec' },
                  h('span', { className: 'aw-tv-io-label' }, tt('input')),
                  h('span', { className: 'aw-tv-io-text' }, inputText)) : null,
                inputText && output ? h('span', { className: 'aw-tv-io-div', 'aria-hidden': true }) : null,
                output ? h('div', { className: 'aw-tv-io-sec' },
                  h('span', { className: 'aw-tv-io-label' }, tt('output')),
                  h('span', { className: 'aw-tv-io-text', 'data-error': state === 'error' || undefined }, output)) : null) : null,
              inspect ? h('button', { type: 'button', className: 'aw-tv-inspect', onClick: inspect }, h(IconInspectOutlineRegular), tt('tool.inspect')) : null) : null))
        }

        ctx.slots.inject('conversation.input.model.options', () => ctx.slots.register({ name: 'conversation.input.model.options', id: 'acp-settings', order: 40 }, CliMenuOption))
        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({ name: 'conversation.input.overlay', id: 'acp-settings', order: 40 }, CliSettingsOverlay))
        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id: 'acp-model-controls', order: 900 }, NativeModelControls))
        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id: 'acp-context-ring', order: 2500 }, NativeContextRing))
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'acp-native', order: 40 }, NativeDock))
        ctx.slots.inject('conversation.session.panel.indicator', () => ctx.slots.register({ name: 'conversation.session.panel.indicator', id: 'acp-subagents.attention', order: 20, locale: NS }, AcpAttentionIndicator))
        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({ name: 'conversation.chat.node', key: 'acp-run' }, NativeNode))
        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({ name: 'conversation.chat.node', key: 'acp-wait' }, AcpWaitNode))
        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({ name: 'conversation.chat.turnTail', id: 'acp-reply-collapse', order: 10, locale: NS, inject: sessionId => ({ sessionId }) }, AcpTurnReplyToggle))
        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key: 'grep', priority: GREP_PATHS_PRIORITY, locale: 'conversation' }, GrepPathsRow))
        for (const key of Object.keys(ACP_TOOLVIEW_SPECS)) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key, priority: -5, locale: NS }, AcpCustomToolRow))
        }

        function useWorkbench() {
          const [data, setData] = React.useState({ providers: EMPTY, providerTemplates: EMPTY, activeByProvider: {}, authByProvider: {}, localUsageByProvider: {}, defaultCwd: '', storageError: null })
          const [ready, setReady] = React.useState(false)
          const [error, setError] = React.useState('')
          const kick = React.useRef(null)
          React.useEffect(() => {
            const controller = new AbortController()
            let loading = false
            let again = false
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
                    setError('')
                  } catch (failure) { if (!controller.signal.aborted) setError(failure.message) }
                } while (again && !controller.signal.aborted)
              } finally { loading = false }
            }
            kick.current = refresh
            void refresh()
            let debounceTimer = null
            const unsubscribe = subscribeLive(change => {
              if (change && change.activityChanged === false && Array.isArray(change.conversations)) return
              if (debounceTimer) return
              debounceTimer = setTimeout(() => {
                debounceTimer = null
                void refresh()
              }, 250)
            })
            return () => { clearTimeout(debounceTimer); controller.abort(); unsubscribe(); kick.current = null }
          }, [])
          return { data, ready, error, refresh: () => kick.current?.() }
        }

        const blankProvider = () => ({ id: '', label: '', command: '', args: '["acp"]' })
        const FALLBACK_PROVIDER_TEMPLATES = [
          { id: 'cursor', label: 'Cursor', bin: 'cursor-agent', command: 'cursor-agent', args: ['acp'] },
          { id: 'antigravity', label: 'Antigravity', bin: 'agy', command: 'agy', args: ['acp'] },
          { id: 'claude-code', label: 'Claude Code', bin: 'claude-agent-acp', command: 'claude-agent-acp', args: [] },
          { id: 'codex', label: 'Codex', bin: 'codex-acp', command: 'codex-acp', args: [] },
          { id: 'gemini', label: 'Gemini CLI', bin: 'gemini', command: 'gemini', args: ['--acp'] },
          { id: 'opencode', label: 'OpenCode', bin: 'opencode', command: 'opencode', args: ['acp'] },
          { id: 'copilot', label: 'GitHub Copilot', bin: 'copilot', command: 'copilot', args: ['--acp'] },
        ]
        const nextTemplateIdentity = (template, existingIds) => {
          if (!existingIds.has(template.id)) return { id: template.id, label: template.label }
          let suffix = 2
          while (existingIds.has(`${template.id}-${suffix}`)) suffix += 1
          return { id: `${template.id}-${suffix}`, label: `${template.label} ${suffix}` }
        }
        const templateMatchesDraft = (template, draft) => {
          let args
          try { args = JSON.parse(draft.args) } catch { return false }
          if (!Array.isArray(args)) return false
          const cmd = draft.command.trim()
          const cmdBase = cmd.split(/[\\/]/u).at(-1)
          const sameCmd = cmd === template.command || (template.bin && cmdBase === template.bin)
          return sameCmd && JSON.stringify(args) === JSON.stringify(template.args)
        }
        const formatTokenCount = n => {
          if (!Number.isFinite(n) || n <= 0) return ''
          if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
          if (n >= 1_000) return `${Math.round(n / 1_000)}K`
          return String(n)
        }
        const authSummary = (status, tt) => {
          if (!status) return ''
          const first = status.accounts?.find(item => item?.active) ?? status.accounts?.[0]
          const identity = first?.email || first?.name || first?.label || ''
          const state = status.state === 'authenticated' || status.state === 'signed_in' ? tt('authSignedIn')
            : status.state === 'unauthenticated' || status.state === 'signed_out' ? tt('authSignedOut')
              : status.state
          return [state, identity].filter(Boolean).join(' · ')
        }

        const formatShortTime = iso => {
          if (!iso) return ''
          const date = new Date(iso)
          if (Number.isNaN(date.getTime())) return ''
          const sameDay = new Date().toDateString() === date.toDateString()
          return new Intl.DateTimeFormat(undefined, sameDay
            ? { hour: '2-digit', minute: '2-digit' }
            : { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
        }

        const formatQuotaWindowLabel = (win, tt) => {
          if (win.windowKind === 'five_hour') return tt('quotaLimit5h')
          if (win.windowKind === 'seven_day') return tt('quotaLimit7d')
          if (win.windowKind === 'model_weekly' && win.modelName) return tt('quotaLimitModel7d', { model: win.modelName })
          if (win.windowKind === 'extra_usage') return tt('quotaLimitExtra')
          if (win.windowKind === 'model_window' && win.modelName) {
            return win.windowMinutes ? `${win.modelName} (${+(win.windowMinutes / 60).toFixed(1)}h)` : win.modelName
          }
          if (win.windowKind === 'duration' && win.windowMinutes) {
            return tt('quotaLimitDuration', { hours: +(win.windowMinutes / 60).toFixed(1) })
          }
          return win.label || win.id
        }

        const formatQuotaReset = (win, tt) => {
          if (win.resetsAt) {
            const formatted = formatShortTime(win.resetsAt)
            if (formatted) return tt('quotaResetsAt', { time: formatted })
          }
          if (win.resetsText) return tt('quotaResetsAt', { time: win.resetsText })
          return ''
        }

        const quotaTone = win => {
          if (win.status === 'rejected' || (typeof win.usedPercent === 'number' && win.usedPercent >= 95)) return 'error'
          if (win.status === 'allowed_warning' || (typeof win.usedPercent === 'number' && win.usedPercent >= 80)) return 'warn'
          return 'accent'
        }

        const effectiveAccount = (provider, authStatus) => {
          const cached = provider?.subscription?.account
          const liveFirst = authStatus?.accounts?.find(item => item?.active) ?? authStatus?.accounts?.[0]
          const liveState = authStatus?.state === 'authenticated' || authStatus?.state === 'signed_in' ? 'authenticated'
            : authStatus?.state === 'unauthenticated' || authStatus?.state === 'signed_out' ? 'unauthenticated'
              : liveFirst ? 'authenticated' : undefined
          const tierName = provider?.advertised?.meta?.tier?.name
          const state = liveState ?? cached?.state ?? (tierName ? 'authenticated' : 'unknown')
          const email = liveFirst?.email ?? cached?.email
          const name = liveFirst?.name ?? cached?.name
          const label = liveFirst?.label ?? cached?.label
          const plan = cached?.plan ?? liveFirst?.subscriptionType ?? tierName
          const authDetail = cached?.authDetail ?? liveFirst?.description ?? liveFirst?.detail
          return { state, email, name, label, plan, authDetail }
        }

        const quotaNoteText = (sub, tt) => {
          if (!sub) return tt('quotaHintUnfetched')
          if (sub.quotaNote === 'signed_out') return tt('quotaNoteSignedOut')
          if (sub.quotaNote === 'cli_not_exposed') return tt('quotaNoteCliNotExposed')
          if (sub.quotaNote === 'acp_not_exposed') return tt('quotaNoteAcpNotExposed')
          if (sub.quotaNote === 'custom_endpoint_or_api') return tt('quotaNoteCustomOrApi')
          return ''
        }

        function SubscriptionCard({ provider, authStatus, localUsage, busy, refreshing, onRefresh }) {
          const tt = useT()
          const sub = provider?.subscription ?? null
          const account = effectiveAccount(provider, authStatus)
          const windows = sub?.windows ?? EMPTY
          const dotState = account.state === 'authenticated' ? 'done' : account.state === 'unauthenticated' ? 'warning' : 'idle'
          const stateLabel = account.state === 'authenticated' ? tt('authSignedIn')
            : account.state === 'unauthenticated' ? tt('authSignedOut')
              : tt('authUnknown')
          const identity = account.email || account.name || account.label || ''
          const updatedLabel = sub?.fetchedAt ? tt('usageUpdatedAt', { time: formatShortTime(sub.fetchedAt) }) : ''
          const noteText = windows.length === 0 ? quotaNoteText(sub, tt) : ''
          const credits = sub?.credits
          const extraUsage = sub?.extraUsage
          const activity = sub?.activity
          const hasLocal = localUsage && (localUsage.total.sessions > 0 || localUsage.total.turns > 0)

          return h('section', { className: 'aw-sub-card', 'aria-label': tt('subHeading') },
            h('div', { className: 'aw-sub-head' },
              h('h3', { className: 'aw-grow' }, tt('subHeading')),
              updatedLabel ? h('span', { className: 'aw-note' }, updatedLabel) : null,
              sub?.dashboardUrl ? h('a', { className: 'aw-url-link', href: sub.dashboardUrl, target: '_blank', rel: 'noopener noreferrer' }, tt('usageOpenDashboard')) : null,
              h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: onRefresh }, refreshing ? tt('refreshingUsage') : tt('refreshUsage'))),
            h('div', { className: 'aw-sub-account' },
              h(StateDot, { state: dotState, size: 7 }),
              h('span', { className: 'aw-strong' }, stateLabel),
              identity ? h('span', { className: 'aw-note' }, identity) : null,
              account.plan ? h('span', { className: 'aw-pill', 'data-tone': 'accent' }, account.plan) : null,
              account.authDetail && account.authDetail !== identity && account.authDetail !== account.plan
                ? h('span', { className: 'aw-pill' }, account.authDetail) : null,
              sub?.liveRateLimit?.status === 'rejected'
                ? h('span', { className: 'aw-pill', 'data-tone': 'error' }, tt('quotaStatusRejected'))
                : sub?.liveRateLimit?.status === 'allowed_warning'
                  ? h('span', { className: 'aw-pill', 'data-tone': 'fast' }, tt('quotaStatusWarn')) : null),
            windows.length > 0 ? h('div', { className: 'aw-quota-grid' },
              windows.map(win => {
                const pct = typeof win.usedPercent === 'number' ? Math.max(0, Math.min(100, win.usedPercent)) : null
                const tone = quotaTone(win)
                const resetLabel = formatQuotaReset(win, tt)
                const statusBadge = win.status === 'rejected' ? tt('quotaStatusRejected')
                  : win.status === 'allowed_warning' ? tt('quotaStatusWarn') : ''
                return h('div', { key: win.id, className: 'aw-quota-item' },
                  h('div', { className: 'aw-quota-top' },
                    h('span', { className: 'aw-quota-label' }, formatQuotaWindowLabel(win, tt)),
                    pct !== null ? h('span', { className: 'aw-quota-pct', 'data-tone': tone }, `${pct}%`) : null),
                  pct !== null ? h('div', { className: 'aw-quota-track', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 },
                    h('span', { className: 'aw-quota-fill', 'data-tone': tone, style: { width: `${pct}%` } })) : null,
                  (resetLabel || statusBadge) ? h('div', { className: 'aw-quota-meta' },
                    h('span', null, resetLabel),
                    statusBadge ? h('span', { className: 'aw-pill', 'data-tone': tone === 'error' ? 'error' : 'fast' }, statusBadge) : null) : null)
              })) : null,
            (extraUsage?.enabled || credits?.unlimited || credits?.hasCredits || credits?.resetCreditsAvailable) ? h('div', { className: 'aw-pills' },
              extraUsage?.enabled ? h('span', { className: 'aw-pill', 'data-tone': extraUsage.active ? 'fast' : undefined }, extraUsage.active ? tt('quotaExtraActive') : tt('quotaExtraEnabled')) : null,
              credits?.unlimited ? h('span', { className: 'aw-pill', 'data-tone': 'accent' }, tt('quotaCreditsUnlimited')) : null,
              credits?.hasCredits && credits.balance ? h('span', { className: 'aw-pill' }, tt('quotaCreditsBalance', { balance: credits.balance })) : null,
              credits?.resetCreditsAvailable ? h('span', { className: 'aw-pill' }, tt('quotaResetCredits', { n: credits.resetCreditsAvailable })) : null) : null,
            noteText ? h('p', { className: 'aw-note' }, noteText) : null,
            (hasLocal || activity?.day || activity?.week) ? h('div', { className: 'aw-sub-stats' },
              hasLocal ? h(React.Fragment, null,
                h('strong', null, tt('localUsageLabel')),
                h('span', null, tt('localUsage24h', localUsage.last24h)),
                h('span', null, tt('localUsage7d', localUsage.last7d)),
                h('span', null, tt('localUsageTotal', localUsage.total))) : null,
              (activity?.day || activity?.week) ? h(React.Fragment, null,
                h('strong', null, tt('cliActivityLabel')),
                activity.day ? h('span', null, tt('cliActivityPeriod', { period: '24h', ...activity.day })) : null,
                activity.week ? h('span', null, tt('cliActivityPeriod', { period: '7d', ...activity.week })) : null) : null) : null)
        }

        const capabilityTags = info => {
          const agent = info.agentCapabilities ?? {}
          const sess = agent.sessionCapabilities ?? {}
          return [
            ['cap.loadSession', agent.loadSession],
            ['cap.resume', sess.resume],
            ['cap.fork', sess.fork],
            ['cap.close', sess.close],
            ['cap.options', sess.options],
            ['cap.list', sess.list],
            ['cap.additionalDirs', sess.additionalDirectories],
            ['cap.steering', info._meta?.steering?.supported],
            ['cap.image', agent.promptCapabilities?.image],
            ['cap.audio', agent.promptCapabilities?.audio],
            ['cap.embeddedContext', agent.promptCapabilities?.embeddedContext],
            ['cap.mcpHttp', agent.mcpCapabilities?.http],
            ['cap.mcpSse', agent.mcpCapabilities?.sse],
          ].map(([key, value]) => ({ key, status: value == null ? 'unreported' : value === false ? 'unsupported' : 'supported' }))
        }

        function CapabilityReport({ info, onClose }) {
          const tt = useT()
          const agentInfo = info.agentInfo ?? info.serverInfo
          const authText = authSummary(info.authStatus, tt)
          return h('section', { className: 'aw-box', 'aria-label': tt('capabilities') },
            h('div', { className: 'aw-box-head' },
              h('h3', { className: 'aw-grow' }, tt('capabilities')),
              onClose ? h(Button, { size: 'sm', variant: 'ghost', onClick: onClose }, tt('closeDiag')) : null),
            h('dl', { className: 'aw-facts' },
              agentInfo ? h(React.Fragment, null, h('dt', null, tt('agent')), h('dd', null, [agentInfo.title ?? agentInfo.name, agentInfo.version].filter(Boolean).join(' '))) : null,
              h('dt', null, tt('protocol')), h('dd', null, `ACP v${info.protocolVersion ?? '?'}`),
              info.agentMeta?.tier?.name ? h(React.Fragment, null, h('dt', null, tt('tierLabel')), h('dd', null, info.agentMeta.tier.name)) : null,
              authText ? h(React.Fragment, null, h('dt', null, tt('authLabel')), h('dd', null, authText)) : null,
              h('dt', null, tt('authMethods')), h('dd', null, info.authMethods?.length ? info.authMethods.map(method => method.name ?? method.id).join(', ') : tt('none'))),
            h('div', { className: 'aw-tags', 'aria-label': tt('capabilities') }, capabilityTags(info).map(item => h(Tag, { key: item.key, tone: item.status === 'supported' ? 'success' : 'quiet' }, `${tt(item.key)} · ${tt(item.status)}`))),
            h(Json, { label: tt('rawResult'), payload: info }))
        }

        function ProviderForm({ saved, draft, templates, existingIds, busy, notice, probeCwd, defaultCwd, onApplyTemplate, onResetBlank, onChange, onProbeCwd, onSave, onRemove, onCancel }) {
          const tt = useT()
          const isBlank = !draft.id && !draft.label && !draft.command && draft.args === '["acp"]'
          return h('form', { className: 'aw-box', onSubmit: onSave },
            h('div', { className: 'aw-box-head' },
              h('h3', { className: 'aw-grow' }, saved ? tt('editProvider') : tt('newProviderTitle')),
              onCancel ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: onCancel }, tt(saved ? 'hideConfig' : 'cancelNew')) : null),
            h('p', { className: 'aw-note' }, tt('providerHint'), ' ', tt('warning')),
            templates?.length ? h('div', { className: 'aw-templates' },
              h('div', { className: 'aw-templates-head' },
                h('span', { className: 'aw-templates-title' }, tt('providerTemplates')),
                h('span', { className: 'aw-note aw-grow' }, tt(saved ? 'providerTemplatesEditHint' : 'providerTemplatesHint')),
                !saved ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy || isBlank, onClick: onResetBlank }, tt('templateBlank')) : null),
              h('div', { className: 'aw-template-grid', role: 'group', 'aria-label': tt('providerTemplates') },
                templates.map(template => {
                  const active = templateMatchesDraft(template, draft)
                  const added = !saved && existingIds?.has(template.id)
                  const preview = [template.bin || template.command, ...template.args].join(' ')
                  const fullCmd = [template.command, ...template.args].join(' ')
                  return h('button', {
                    key: template.id, type: 'button', className: 'aw-template',
                    'aria-pressed': active, disabled: busy, title: fullCmd,
                    onClick: () => onApplyTemplate(template),
                  },
                  h('span', { className: 'aw-template-top' },
                    h('span', { className: 'aw-strong aw-ellipsis aw-grow' }, template.label),
                    added ? h(Tag, { tone: 'quiet' }, tt('templateAdded')) : null),
                  h('span', { className: 'aw-template-cmd aw-mono aw-ellipsis' }, preview))
                }))) : null,
            h('div', { className: 'aw-form' },
              h('label', { className: 'aw-field' }, h('span', null, tt('fieldLabel')), h(Input, { className: 'aw-input', value: draft.label, required: true, onChange: onChange('label') })),
              h('label', { className: 'aw-field' }, h('span', null, tt('fieldId')), h(Input, { className: 'aw-input aw-mono', value: draft.id, required: true, pattern: '[a-z][a-z0-9-]*', disabled: !!saved, onChange: onChange('id') })),
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldCommand')), h(Input, { className: 'aw-input aw-mono', value: draft.command, required: true, onChange: onChange('command') }),
                h('span', { className: 'aw-note' }, tt('fieldCommandHint'))),
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldArgs')), h('textarea', { className: 'aw-textarea', value: draft.args, rows: 2, required: true, spellCheck: false, onChange: onChange('args') }),
                h('span', { className: 'aw-note' }, tt('fieldArgsHint'))),
              saved ? h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('probeDirLabel')),
                h(Input, { className: 'aw-input aw-mono', value: probeCwd, disabled: busy, placeholder: defaultCwd || tt('cwdPlaceholder'), onChange: event => onProbeCwd(event.target.value) }),
                h('span', { className: 'aw-note' }, tt('probeDirHint'))) : null),
            h('div', { className: 'aw-row' },
              h(Button, { type: 'submit', size: 'sm', variant: 'primary', disabled: busy }, tt('save')),
              saved ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: onRemove }, tt('remove')) : null,
              notice ? h('span', { className: notice === tt('saved') ? 'aw-note' : 'aw-error', role: 'status' }, notice) : null))
        }

        function ModelRow({ model, hidden, busy, onToggle }) {
          const tt = useT()
          const contextOpt = model.options?.find(opt => opt.id === 'context' && opt.choices?.length)
          const fastOpt = model.options?.find(opt => opt.id === 'fast')
          const ultracodeOpt = model.options?.find(opt => opt.id === 'ultracode')
          const extraOpts = (model.options ?? EMPTY).filter(opt => opt.id !== 'context' && opt.id !== 'fast' && opt.id !== 'ultracode')
          const hasImage = model.inputModalities?.includes('image')
          const contextLabel = contextOpt
            ? contextOpt.choices.map(c => c.name ?? c.value).join(' / ')
            : model.contextWindow ? formatTokenCount(model.contextWindow) : ''
          const outputLabel = model.maxTokens ? formatTokenCount(model.maxTokens) : ''
          const efforts = model.reasoning?.efforts ?? EMPTY
          return h('div', { className: 'aw-model-row', 'data-hidden': hidden },
            h('div', { className: 'aw-model-body' },
              h('div', { className: 'aw-model-head' },
                h('span', { className: 'aw-model-name' }, model.name ?? model.id),
                model.name && model.name !== model.id ? h('span', { className: 'aw-model-id aw-mono' }, model.id) : null),
              model.description ? h('span', { className: 'aw-model-desc' }, model.description) : null,
              efforts.length || contextLabel || fastOpt || ultracodeOpt || extraOpts.length || hasImage || outputLabel ? h('div', { className: 'aw-pills' },
                efforts.length ? h('span', { className: 'aw-pill', 'data-tone': 'thought' }, tt('modelEfforts', { levels: efforts.map(e => e.name ?? e.id).join(' · ') })) : null,
                contextLabel ? h('span', { className: 'aw-pill' }, `${tt('context')}: ${contextLabel}`) : null,
                fastOpt ? h('span', { className: 'aw-pill', 'data-tone': 'fast', title: fastOpt.description || undefined }, `⚡ ${tt('modelFast')}`) : null,
                ultracodeOpt ? h('span', { className: 'aw-pill', 'data-tone': 'accent', title: ultracodeOpt.description || undefined }, tt('modelUltracode')) : null,
                extraOpts.map(opt => h('span', { key: opt.id, className: 'aw-pill', title: opt.description || undefined }, opt.name ?? opt.id)),
                hasImage ? h('span', { className: 'aw-pill' }, tt('modalityImage')) : null,
                outputLabel ? h('span', { className: 'aw-pill' }, `${tt('ctxOutput')}: ${outputLabel}`) : null) : null),
            h(Switch, { checked: !hidden, disabled: busy, label: model.name ?? model.id, onChange: checked => onToggle(model.id, checked) }))
        }

        function ProviderWorkbench({ providers, providerTemplates, activeByProvider, authByProvider, localUsageByProvider, defaultCwd, run, busy, creating, setCreating }) {
          const tt = useT()
          const templates = providerTemplates?.length ? providerTemplates : FALLBACK_PROVIDER_TEMPLATES
          const existingIds = React.useMemo(() => new Set(providers.map(provider => provider.id)), [providers])
          const [editing, setEditing] = React.useState(providers[0]?.id ?? '')
          const [draft, setDraft] = React.useState(() => providers[0] ? { ...providers[0], args: JSON.stringify(providers[0].args) } : blankProvider())
          const [showConfig, setShowConfig] = React.useState(false)
          const [usageRefreshing, setUsageRefreshing] = React.useState(false)
          const [notice, setNotice] = React.useState('')
          const [statusBanner, setStatusBanner] = React.useState('')
          const [probeCwd, setProbeCwd] = React.useState('')
          const [report, setReport] = React.useState(null)
          const [hiddenModels, setHiddenModels] = React.useState(() => providers[0]?.hiddenModels ?? [])
          const [modelQuery, setModelQuery] = React.useState('')
          const [modelFilter, setModelFilter] = React.useState('all')
          const saved = creating ? null : providers.find(provider => provider.id === editing) ?? providers[0] ?? null
          const activeWorkspacePath = ctx.workspaces?.list?.getSnapshot?.().items?.[0]?.path || ''
          const effectiveCwd = probeCwd.trim() || activeWorkspacePath || defaultCwd || ''

          const selectProvider = provider => {
            setCreating(false)
            setEditing(provider?.id ?? '')
            setDraft(provider ? { ...provider, args: JSON.stringify(provider.args) } : blankProvider())
            setShowConfig(false)
            setNotice(''); setStatusBanner(''); setReport(null)
            setHiddenModels(provider?.hiddenModels ?? [])
            setModelQuery(''); setModelFilter('all')
          }

          React.useEffect(() => {
            if (creating) {
              setDraft(blankProvider()); setNotice(''); setStatusBanner(''); setReport(null)
            } else if (!editing && providers[0]) {
              selectProvider(providers[0])
            }
          }, [creating, providers.length])

          const allModels = React.useMemo(() => providerVisibleModels(saved ? { ...saved, hiddenModels: [] } : null), [saved])
          const hiddenSet = React.useMemo(() => new Set(hiddenModels), [hiddenModels])
          const savedHidden = saved?.hiddenModels ?? EMPTY
          const visibleCount = allModels.filter(model => !hiddenSet.has(model.id)).length
          const hiddenCount = allModels.length - visibleCount
          const thinkingCount = allModels.filter(model => !!model.reasoning?.efforts?.length).length
          const fastCount = allModels.filter(model => model.options?.some(opt => opt.id === 'fast')).length
          const ultracodeCount = allModels.filter(model => model.options?.some(opt => opt.id === 'ultracode')).length
          const multiCtxCount = allModels.filter(model => model.options?.some(opt => opt.id === 'context' && opt.choices?.length > 1)).length

          const changedCount = React.useMemo(() => {
            const savedSet = new Set(savedHidden)
            let diff = 0
            for (const model of allModels) {
              if (hiddenSet.has(model.id) !== savedSet.has(model.id)) diff += 1
            }
            return diff
          }, [allModels, hiddenSet, savedHidden])
          const isDirty = !!saved && changedCount > 0

          const needle = modelQuery.trim().toLowerCase()
          const filteredModels = allModels.filter(model => {
            if (modelFilter === 'visible' && hiddenSet.has(model.id)) return false
            if (modelFilter === 'hidden' && !hiddenSet.has(model.id)) return false
            if (modelFilter === 'thinking' && !model.reasoning?.efforts?.length) return false
            if (modelFilter === 'fast' && !model.options?.some(opt => opt.id === 'fast')) return false
            if (modelFilter === 'ultracode' && !model.options?.some(opt => opt.id === 'ultracode')) return false
            if (modelFilter === 'multictx' && !model.options?.some(opt => opt.id === 'context' && opt.choices?.length > 1)) return false
            if (!needle) return true
            return [model.id, model.name, model.description].some(text => text?.toLowerCase().includes(needle))
          })

          const changeField = key => event => { setDraft(old => ({ ...old, [key]: event.target.value })); setNotice('') }
          const applyTemplate = template => {
            if (saved) {
              setDraft(old => ({ ...old, command: template.command, args: JSON.stringify(template.args) }))
            } else {
              const { id, label } = nextTemplateIdentity(template, existingIds)
              setDraft({ id, label, command: template.command, args: JSON.stringify(template.args) })
            }
            setNotice('')
          }
          const resetBlank = () => { setDraft(blankProvider()); setNotice('') }
          const saveProvider = async event => {
            event.preventDefault()
            let args
            try { args = JSON.parse(draft.args) } catch { args = null }
            if (!Array.isArray(args) || args.some(item => typeof item !== 'string')) { setNotice(tt('argsInvalid')); return }
            const value = await run({
              action: 'provider-save',
              provider: { id: draft.id.trim(), label: draft.label, command: draft.command, args, models: saved?.models ?? [], hiddenModels: saved?.hiddenModels ?? [] },
            })
            if (value) {
              setCreating(false)
              setEditing(value.id)
              setDraft({ ...value, args: JSON.stringify(value.args) })
              setHiddenModels(value.hiddenModels ?? [])
              setNotice(tt('saved'))
              setStatusBanner(tt('saved'))
            }
          }
          const removeProvider = async () => {
            if (!saved || !await askConfirm(tt('removeConfirm'), { title: tt('remove'), confirmLabel: tt('remove'), danger: true })) return
            if (await run({ action: 'provider-remove', providerId: saved.id })) {
              selectProvider(providers.find(provider => provider.id !== saved.id) ?? null)
            }
          }
          const refreshModels = async () => {
            if (!saved) return
            setStatusBanner('')
            const value = await run({ action: 'models', providerId: saved.id, cwd: effectiveCwd })
            if (value) setStatusBanner(tt('modelsLoaded', { n: value.models.length }))
          }
          const checkCapabilities = async () => {
            if (!saved) return
            const value = await run({ action: 'diagnose', providerId: saved.id, cwd: effectiveCwd })
            if (value) setReport(value)
          }
          const refreshUsage = async () => {
            if (!saved) return
            setStatusBanner('')
            setUsageRefreshing(true)
            try {
              const value = await run({ action: 'usage', providerId: saved.id, cwd: effectiveCwd })
              if (value) setStatusBanner(tt('usageUpdated'))
            } finally {
              setUsageRefreshing(false)
            }
          }
          const saveVisibility = async () => {
            if (!saved) return
            const value = await run({ action: 'provider-save', provider: { ...saved, hiddenModels } })
            if (value) {
              setHiddenModels(value.hiddenModels ?? [])
              setStatusBanner(tt('modelsSaved'))
            }
          }
          const toggleModel = (id, shown) => {
            setHiddenModels(old => shown ? old.filter(item => item !== id) : [...new Set([...old, id])])
          }
          const modes = saved?.advertised?.modes?.options ?? EMPTY
          const accountInfo = saved ? effectiveAccount(saved, authByProvider?.[saved.id]) : null
          const tierName = accountInfo?.plan || saved?.advertised?.meta?.tier?.name || ''
          const authText = authSummary(saved ? authByProvider?.[saved.id] : null, tt)

          const filterChips = [
            ['all', tt('filterAll'), allModels.length],
            ['visible', tt('filterVisible'), visibleCount],
            ['hidden', tt('filterHidden'), hiddenCount],
            ...(thinkingCount ? [['thinking', tt('filterThinking'), thinkingCount]] : []),
            ...(fastCount ? [['fast', tt('filterFast'), fastCount]] : []),
            ...(ultracodeCount ? [['ultracode', tt('filterUltracode'), ultracodeCount]] : []),
            ...(multiCtxCount ? [['multictx', tt('filterMultiCtx'), multiCtxCount]] : []),
          ]

          return h('div', { className: 'aw-hub' },
            h('nav', { className: 'aw-rail', 'aria-label': tt('providerList') },
              providers.map(provider => {
                const total = providerVisibleModels({ ...provider, hiddenModels: [] }).length
                const shown = providerVisibleModels(provider).length
                const active = activeByProvider?.[provider.id]
                const activeTone = active?.waiting ? 'warning' : active?.working ? 'ongoing' : active?.connected ? 'done' : null
                const activeLabel = active?.waiting
                  ? tt('activeWaiting', { n: active.waiting })
                  : active?.working
                    ? tt('activeWorking', { n: active.working })
                    : active?.connected
                      ? tt('activeConnected', { n: active.connected })
                      : null
                const railPlan = provider.subscription?.account?.plan || provider.advertised?.meta?.tier?.name || ''
                const railWindows = provider.subscription?.windows ?? EMPTY
                const peakPct = railWindows.reduce((max, item) => typeof item.usedPercent === 'number' ? Math.max(max, item.usedPercent) : max, -1)
                return h('button', {
                  key: provider.id, type: 'button', className: 'aw-prov',
                  'aria-current': !creating && saved?.id === provider.id,
                  disabled: busy,
                  onClick: () => selectProvider(provider),
                },
                h('span', { className: 'aw-prov-top' },
                  activeTone ? h(StateDot, { state: activeTone, size: 7 }) : null,
                  h('span', { className: 'aw-strong aw-ellipsis aw-grow' }, provider.label),
                  h(Tag, { tone: 'quiet' }, provider.id)),
                h('span', { className: 'aw-prov-meta' },
                  h('span', null, total ? tt('modelsBadgeCount', { shown, total }) : tt('modelsNotFetched')),
                  railPlan ? h('span', null, `· ${railPlan}`) : null,
                  peakPct >= 0 ? h('span', null, `· ${peakPct}%`) : null,
                  activeLabel ? h('span', null, `· ${activeLabel}`) : null),
                h('span', { className: 'aw-item-sub aw-mono aw-ellipsis' }, [provider.command, ...provider.args].join(' ')))
              })),
            h('div', { className: 'aw-stack' },
              creating || !saved
                ? h(ProviderForm, {
                  saved: null, draft, templates, existingIds, busy, notice, probeCwd, defaultCwd: activeWorkspacePath || defaultCwd,
                  onApplyTemplate: applyTemplate, onResetBlank: resetBlank,
                  onChange: changeField, onProbeCwd: setProbeCwd, onSave: saveProvider,
                  onCancel: providers.length ? () => selectProvider(providers.find(p => p.id === editing) ?? providers[0]) : null,
                })
                : h(React.Fragment, null,
                  h('section', { className: 'aw-hero' },
                    h('div', { className: 'aw-hero-top' },
                      h('div', { className: 'aw-hero-title' },
                        h('h2', null, saved.label),
                        h('span', { className: 'aw-hero-cmd aw-mono aw-ellipsis' }, [saved.command, ...saved.args].join(' '))),
                      h('div', { className: 'aw-hero-actions' },
                        h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: refreshModels }, tt('refreshModels')),
                        h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: checkCapabilities }, tt('diagnose')),
                        h(Button, { size: 'sm', variant: showConfig ? 'outline' : 'ghost', 'aria-expanded': showConfig, disabled: busy, onClick: () => setShowConfig(v => !v) }, tt(showConfig ? 'hideConfig' : 'providerConfig')))),
                    (tierName || authText || saved.advertised?.meta?.steering) ? h('div', { className: 'aw-pills' },
                      tierName ? h('span', { className: 'aw-pill', 'data-tone': 'accent' }, tierName) : null,
                      authText ? h('span', { className: 'aw-pill' }, `${tt('authLabel')}: ${authText}`) : null,
                      saved.advertised?.meta?.steering ? h('span', { className: 'aw-pill' }, tt('cap.steering')) : null) : null,
                    modes.length ? h('div', { className: 'aw-pills' },
                      h('span', { className: 'aw-note' }, `${tt('modesLabel')}:`),
                      modes.map(mode => h('span', { key: mode.value, className: 'aw-pill' }, mode.name ?? mode.value))) : null,
                    statusBanner ? h('p', { className: 'aw-note', role: 'status' }, statusBanner) : null),
                  h(SubscriptionCard, {
                    provider: saved,
                    authStatus: authByProvider?.[saved.id] ?? null,
                    localUsage: localUsageByProvider?.[saved.id] ?? null,
                    busy,
                    refreshing: usageRefreshing,
                    onRefresh: refreshUsage,
                  }),
                  showConfig ? h(ProviderForm, {
                    saved, draft, templates, existingIds, busy, notice, probeCwd, defaultCwd: activeWorkspacePath || defaultCwd,
                    onApplyTemplate: applyTemplate, onResetBlank: resetBlank,
                    onChange: changeField, onProbeCwd: setProbeCwd, onSave: saveProvider, onRemove: removeProvider,
                    onCancel: () => setShowConfig(false),
                  }) : null,
                  report ? h(CapabilityReport, { info: report, onClose: () => setReport(null) }) : null,
                  h('section', { className: 'aw-stack', 'aria-label': tt('visibleModels') },
                    h('div', { className: 'aw-catalog-head' },
                      h('div', { className: 'aw-row' },
                        h('strong', { className: 'aw-grow' }, tt('visibleModels')),
                        allModels.length ? h('span', { className: 'aw-note' }, tt('modelCountShown', { shown: visibleCount, total: allModels.length })) : null,
                        allModels.length ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy || !hiddenCount, onClick: () => setHiddenModels([]) }, tt('showAllModels')) : null,
                        allModels.length ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy || !visibleCount, onClick: () => setHiddenModels(allModels.map(m => m.id)) }, tt('hideAllModels')) : null),
                      allModels.length ? h('div', { className: 'aw-catalog-bar' },
                        h(Input, { type: 'search', className: 'aw-input', value: modelQuery, placeholder: tt('modelSearch'), 'aria-label': tt('modelSearch'), onChange: event => setModelQuery(event.target.value) }),
                        h('div', { className: 'aw-chips', role: 'group' },
                          filterChips.map(([key, label, count]) => h('button', {
                            key, type: 'button', className: 'aw-chip', 'aria-pressed': modelFilter === key,
                            onClick: () => setModelFilter(key),
                          }, label, h('span', { className: 'aw-muted' }, String(count)))))) : null,
                      isDirty ? h('div', { className: 'aw-dirty', role: 'status' },
                        h('span', { className: 'aw-grow' }, tt('unsavedChanges', { n: changedCount })),
                        h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: () => setHiddenModels(savedHidden) }, tt('revertChanges')),
                        h(Button, { type: 'button', size: 'sm', variant: 'primary', disabled: busy, onClick: saveVisibility }, tt('saveChanges'))) : null),
                    !allModels.length
                      ? h('div', { className: 'aw-empty-card' },
                        h('p', null, tt('noModelsYet')),
                        h('p', { className: 'aw-note' }, tt('modelsHint')),
                        h(Button, { size: 'sm', variant: 'primary', disabled: busy, onClick: refreshModels }, tt('fetchModelsNow')))
                      : !filteredModels.length
                        ? h('div', { className: 'aw-empty-card' },
                          h('p', null, tt('noMatchingModels')),
                          h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setModelQuery(''); setModelFilter('all') } }, tt('resetFilters')))
                        : h('div', { className: 'aw-catalog' },
                          filteredModels.map(model => h(ModelRow, {
                            key: model.id, model, hidden: hiddenSet.has(model.id), busy, onToggle: toggleModel,
                          })))),
                  h('p', { className: 'aw-note' }, tt('loginHint')))))
        }

        function Page() {
          const tt = useT()
          const online = useOnline()
          const [busy, setBusy] = React.useState(false)
          const [creating, setCreating] = React.useState(false)
          const inFlight = React.useRef(false)
          const [error, setError] = React.useState('')
          const view = useWorkbench()
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
              h('div', { className: 'aw-head-actions' },
                h('span', { className: 'aw-live', role: 'status' }, h(StateDot, { state: online === 'live' ? 'done' : 'warning', size: 8 }), tt(online)),
                h(Button, { size: 'sm', variant: 'outline', icon: h(IconPlusOutlineRegular, { size: 14 }), disabled: busy, onClick: () => setCreating(true) }, tt('addProvider')))),
            view.data.storageError ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), tt('storageError', { message: view.data.storageError })) : null,
            problem ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), problem, view.error ? h(Button, { size: 'sm', variant: 'ghost', onClick: view.refresh }, tt('retry')) : null) : null,
            !view.ready
              ? (view.error ? null : h('p', { className: 'aw-empty', role: 'status' }, tt('loading')))
              : h(ProviderWorkbench, {
                providers: view.data.providers,
                providerTemplates: view.data.providerTemplates,
                activeByProvider: view.data.activeByProvider,
                authByProvider: view.data.authByProvider,
                localUsageByProvider: view.data.localUsageByProvider,
                defaultCwd: view.data.defaultCwd,
                run, busy, creating, setCreating,
              })),
            h(ConfirmModal))
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
