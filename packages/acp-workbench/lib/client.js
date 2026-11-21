window.__ModuleLoader__.load({
  id: 'dsh-acp-workbench',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, CodeBlock, DiffBlock, DisclosureRow, Input, JsonBlock, Modal, PathLabel, ReadBlock, SearchBlock, SegmentedTabs, StateDot, Switch, Tag, TerminalBlock, WebBlock, diffTotals,
      IconBranchOutlineRegular, IconBrowseOutlineRegular, IconChecklistOutlineRegular, IconEditOutlineRegular, IconGlobeOutlineRegular, IconPlayOutlineRegular, IconSearchOutlineRegular, IconSparkleRegular,
      IconChevronDownOutlineRegular, IconChevronRightOutlineRegular, IconChevronUpOutlineRegular, IconInfoOutlineRegular, IconPlusOutlineRegular,
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
      delegateHint: 'To delegate from a DSH model, use subagent_cursor, subagent_antigravity, or subagent_acp_claude_code and continue with send_message.',
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
      tierLabel: 'Plan tier', authLabel: 'Account', authSignedIn: 'Signed in', authSignedOut: 'Signed out',
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
      delegateHint: '保留普通 DSH 模型时，可通过 subagent_cursor、subagent_antigravity 或 subagent_acp_claude_code 委派，并用 send_message 续聊。',
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
      tierLabel: '订阅档位', authLabel: '登录状态', authSignedIn: '已登录', authSignedOut: '未登录',
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
.aw-mono{font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;overflow-wrap:anywhere}
.aw-select{height:28px;max-width:200px;min-width:0;padding:0 8px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:inherit;font:inherit;font-size:12px;text-overflow:ellipsis}
.aw-select:disabled{opacity:.55}
.aw-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-field>span:first-child{font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-field .aw-input{width:100%}
.aw-textarea{width:100%;min-height:60px;resize:vertical;padding:8px 10px;border-radius:var(--dsw-radius-sm,8px);border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:inherit;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:18px}
.aw-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}
.aw-confirm-body{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);max-height:50vh;overflow:auto}
.aw-toggle{display:inline-grid;place-items:center;flex:none;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
@media (hover:hover){.aw-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}

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
.aw-switch{display:inline-flex;align-items:center;gap:8px;font-size:12px}
.aw-bar-error{padding:0 12px 8px}
@container (max-width:560px){.aw-bar .aw-hide-narrow{display:none}}

.aw-ask{display:flex;flex-direction:column;gap:10px;padding:12px 14px;min-width:0}
.aw-ask-inline{border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-state-warn-primary)}
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

.aw-child{border-top:.5px solid var(--dsw-alias-border-l1)}
.aw-child-body{padding:0 12px 10px}

.aw-review-patch{overflow:auto;max-width:100%;font:12px/1.55 ui-monospace,monospace}.aw-patch-line{display:grid;grid-template-columns:4em 4em minmax(max-content,1fr);min-width:max-content}.aw-patch-line>span,.aw-patch-line>button{text-align:end;padding:0 6px;color:var(--dsw-alias-label-tertiary)}.aw-patch-line>button{font:inherit;background:none;border:0;cursor:pointer;text-decoration:underline}.aw-patch-line>code{font:inherit;white-space:pre;padding-inline-start:7px}.aw-patch-line[data-side=add]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 10%,transparent)}.aw-patch-line[data-side=del]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,transparent)}.aw-patch-hunk{color:var(--dsw-alias-label-secondary);white-space:pre;padding:3px 0}.aw-review-preview{border-inline-start:2px solid var(--dsw-alias-border-l1);padding-inline-start:10px;min-width:0}
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
.aw-file-link{padding:2px 0;max-width:100%;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
@media (hover:hover){.aw-file-link:hover{text-decoration:underline}}
.aw-call,.aw-call-detail{min-width:0;max-width:100%}.aw-call-meta{display:inline-flex;align-items:center;gap:7px;min-width:0;max-width:100%;margin-inline-start:7px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400}
.aw-call-view{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.aw-call-run{max-width:100%;min-width:0}.aw-call-run-body{margin-inline-start:8px;padding-inline-start:12px;border-inline-start:.5px solid var(--dsw-alias-border-l1);display:grid;gap:3px}.aw-run-summary{display:inline-flex;align-items:baseline;gap:7px;min-width:0;max-width:100%;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:12px}.aw-run-summary .aw-ellipsis{max-width:22em;min-width:0;color:var(--dsw-alias-label-tertiary)}
.aw-call-focus{font-family:var(--ds-font-family-code,ui-monospace,monospace)}.aw-call-status,.aw-exit,.aw-count,.aw-diff-totals{flex:none;white-space:nowrap;font-size:11px;font-variant-numeric:tabular-nums}.aw-call-status{display:inline-flex;align-items:center;gap:4px}.aw-call-status[data-quiet=true]{color:var(--dsw-alias-label-tertiary)}
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
.aw-log{margin:0;max-height:240px;overflow:auto;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--ds-font-family-code,ui-monospace,Menlo,monospace);font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.aw-msg{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);min-width:0}
.aw-msg[data-role=user]{background:var(--dsw-alias-bg-layer-2);margin-left:32px}
.aw-msg-head{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.aw-img{max-width:100%;max-height:360px;border-radius:8px}

.aw-page{container-type:inline-size;display:flex;flex-direction:column;height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base)}
.aw-page-inner{display:flex;flex-direction:column;gap:20px;width:min(100%,1080px);margin:0 auto;padding:28px clamp(20px,3.5vw,44px) 56px}
[data-platform=darwin] .aw-page-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.aw-page-inner{padding:20px 16px 48px}[data-platform=darwin] .aw-page-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.aw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
.aw-head h1{font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.01em}
.aw-head-actions{display:flex;align-items:center;gap:10px;flex:none}
.aw-live{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.aw-banner{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.aw-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.aw-banner>svg{flex:none;margin-top:1px}
.aw-banner-text{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-hub{display:grid;grid-template-columns:minmax(220px,260px) minmax(0,1fr);gap:20px;align-items:start}
@container (max-width:740px){.aw-hub{grid-template-columns:minmax(0,1fr)}}
.aw-rail{display:flex;flex-direction:column;gap:6px;min-width:0;position:sticky;top:16px}
@container (max-width:740px){.aw-rail{position:static}}
.aw-prov{display:flex;flex-direction:column;gap:5px;width:100%;padding:10px 12px;border:.5px solid transparent;border-radius:var(--dsw-radius-md,12px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;min-width:0;transition:background-color .15s,border-color .15s}
@media (hover:hover){.aw-prov:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-prov[aria-current=true]{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l2)}
.aw-prov-top{display:flex;align-items:center;gap:6px;min-width:0}
.aw-prov-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.aw-hero{display:flex;flex-direction:column;gap:12px;padding:16px 18px;border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0}
.aw-hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.aw-hero-title{display:flex;flex-direction:column;gap:4px;min-width:0}
.aw-hero-title h2{font-size:16px;font-weight:600;line-height:22px}
.aw-hero-cmd{display:inline-flex;align-items:center;gap:6px;max-width:100%;font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-hero-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:none}
.aw-catalog-head{display:flex;flex-direction:column;gap:10px}
.aw-catalog-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.aw-catalog-bar .aw-input{flex:1 1 220px}
.aw-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.aw-chip{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;transition:background-color .15s,border-color .15s,color .15s}
@media (hover:hover){.aw-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.aw-chip[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-bg-layer-2));border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font-weight:500}
.aw-dirty{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,var(--dsw-alias-bg-layer-1));border:.5px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 35%,var(--dsw-alias-border-l2));font-size:12px}
.aw-catalog{display:flex;flex-direction:column;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);overflow:hidden;min-width:0}
.aw-model-row{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;cursor:pointer;min-width:0;border-top:.5px solid var(--dsw-alias-border-l1);transition:background-color .12s,opacity .12s}
.aw-model-row:first-child{border-top:0}
@media (hover:hover){.aw-model-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-model-row[data-hidden=true]{opacity:.56}
.aw-model-row input{margin:4px 0 0;flex:none}
.aw-model-body{display:flex;flex-direction:column;gap:4px;flex:1 1 auto;min-width:0}
.aw-model-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;min-width:0}
.aw-model-name{font-weight:500;color:var(--dsw-alias-label-primary)}
.aw-model-id{font-size:11px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.aw-model-desc{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary)}
.aw-pills{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:2px}
.aw-pill{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:999px;font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1);white-space:nowrap}
.aw-pill[data-tone=fast]{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 28%,transparent)}
.aw-pill[data-tone=accent]{color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));background:color-mix(in srgb,var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary)) 10%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary)) 28%,transparent)}
.aw-pill[data-tone=thought]{color:var(--dsw-alias-label-primary)}
.aw-steer{display:flex;align-items:center;gap:8px;padding:6px 8px}
.aw-steer .aw-input{flex:1 1 auto;min-width:0}
.aw-url-link{color:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));text-decoration:underline;overflow-wrap:anywhere;font-size:12px}
.aw-empty-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:36px 20px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);text-align:center;color:var(--dsw-alias-label-secondary)}
.aw-stack{display:flex;flex-direction:column;gap:14px;min-width:0}
.aw-box{display:flex;flex-direction:column;gap:14px;padding:16px;border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-border-l2);min-width:0}
.aw-box-head{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.aw-box-head h2,.aw-box-head h3{font-size:14px;font-weight:500;line-height:20px}
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
.aw-menu-option>svg{flex:none;color:var(--dsw-alias-menu-icon)}
.aw-menu-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.aw-menu-option:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-options{position:fixed;position-area:top span-left;align-self:end;justify-self:end;inset:auto;margin:0 0 8px;
  width:min(420px,anchor-size(width));max-height:min(22rem,calc(100% - 8px - max(12px,var(--dsh-frame-overlay-top,12px))));
  padding:12px;border:0;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu,var(--dsw-alias-bg-overlay));
  backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);
  overflow:auto;overscroll-behavior:contain;pointer-events:auto}
.aw-options:not(:popover-open){display:none}
.aw-found li{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:8px;min-width:0}
@media (hover:hover){.aw-found li:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.aw-empty{padding:24px 12px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:12px}
:is(.aw-dock,.aw-options) details>summary{cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}
.aw-tb{display:inline-flex;align-items:center;gap:2px;flex:none}
.aw-tb-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 7px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;white-space:nowrap;cursor:pointer;transition:background-color .15s,color .15s}
.aw-tb-btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
.aw-tb-btn:disabled{opacity:.55;cursor:default}
.aw-tb-btn:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:-2px}
.aw-tb-btn[data-active=true]{color:var(--dsw-alias-state-warn-primary)}
.aw-tb-icon{width:28px;padding:0}
.aw-tb-pop{position:fixed;inset:auto;margin:0;box-sizing:border-box;min-width:136px;max-width:min(240px,calc(100vw - 16px));padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent);font-size:13px;overflow:auto}
.aw-tb-item{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:30px;padding:4px 8px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.aw-tb-item[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-bg-layer-2))}
.aw-tb-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.aw-tb-item:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:-2px}
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
    const settle = (state, live) => state === 'ongoing' && !live ? 'idle' : state
    const eventLabel = event => [event.type, event.data?.method, updateOf(event)?.sessionUpdate].filter(Boolean).join(' · ')

    function cliParentOf(update) {
      const id = update?._meta?.claudeCode?.parentToolUseId
      return typeof id === 'string' && id.trim() ? id : undefined
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
          row.tool = { ...row.tool, ...defined(foldTerminal(row, update) ?? update) }
          if (parent) row.cliParent = row.cliParent === undefined || row.cliParent === parent ? parent : null
          if (['Agent', 'Task'].includes(update._meta?.claudeCode?.toolName)) row.cliTask = true
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
        } else if (!MESSAGE_UPDATES.has(kind)) rows.push({ kind: 'event', ...event })
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
    function cliActivities(rows) {
      const tools = new Map(), tasks = new Map(), origin = new Map(), requests = new Map(), receiptFor = new Map()
      const keyFor = (r, id) => callKey(id, r.turnId ?? r.data?.turnId)
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
    // external: Claude Code WebSearch emits "Title (url)" lines interleaved with plain text
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
      if (mode === 'count') return null
      const paths = raw?.filenames ?? raw?.paths, listed = Array.isArray(paths) && paths.every(p => typeof p === 'string' && p.trim())
      if (mode !== 'content' && listed && (paths.length || !text)) return { kind: 'paths', paths, total: paths.length, truncated: raw.truncated === true }
      if (mode === 'files_with_matches') return null
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
            !approval && isClaudeCompactTool(tool) ? h(CompactionFacts, { facts: compactionFacts(tool.rawOutput) }) : null,
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
          const title = task ? t('cliTask') : isClaudeCompactTool(tool) ? t('compact.title') : webTitle ? t(webTitle) : face.write ? t('call.write') : kind === 'other' ? tool.title || t('tool') : t('call.' + kind)
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
          const limits = f.kind === 'number'
            ? [f.min != null && tt('formMin', { n: f.min }), f.max != null && tt('formMax', { n: f.max })].filter(Boolean)
            : [f.min > 0 && tt('formMin', { n: f.min }), f.max != null && tt('formMax', { n: f.max })].filter(Boolean)
          return h('fieldset', { className: 'aw-question aw-form-field', disabled }, h('legend', null, f.title, ' ', h('small', { className: 'aw-note' }, tt(f.required ? 'formRequired' : 'formOptional'))),
            f.description && h('p', { className: 'aw-note' }, f.description), limits.length > 0 && h('p', { className: 'aw-note' }, limits.join(' · ')),
            f.kind === 'boolean'
              ? h('label', { className: 'aw-option' },
                h('input', { type: 'checkbox', checked: Boolean(value), onChange: e => set(e.target.checked) }),
                h('span', null, f.title))
              : f.kind === 'number'
                ? h(Input, {
                  type: 'number',
                  className: 'aw-input',
                  step: f.integer ? 1 : 'any',
                  min: f.min ?? undefined,
                  max: f.max ?? undefined,
                  'aria-label': f.title,
                  value: value === undefined ? '' : String(value),
                  onChange: e => {
                    const raw = e.target.value.trim()
                    if (!raw) return set(undefined)
                    const parsed = Number(raw)
                    set(Number.isFinite(parsed) ? parsed : raw)
                  },
                })
                : f.kind === 'text'
                  ? h('textarea', { className: 'aw-input', rows: 2, 'aria-label': f.title, value: value ?? '', onChange: e => set(e.target.value || undefined) })
                  : f.choices.map(c => {
                    const checked = multi ? (value ?? EMPTY).includes(c.value) : value === c.value
                    return h('div', { className: 'aw-section', key: c.value }, h('label', { className: 'aw-option' }, h('input', { type: multi ? 'checkbox' : 'radio', name: group, checked,
                      onChange: e => { if (!multi) return set(c.value); const next = e.target.checked ? [...(value ?? EMPTY), c.value] : value.filter(v => v !== c.value); set(next.length ? next : undefined) } }),
                      h('span', null, c.label, c.description && h('small', { className: 'aw-note aw-form-hint' }, c.description))),
                      c.preview && h('details', { className: 'aw-tech' }, h('summary', null, tt('formPreview')), h('pre', { className: 'aw-log' }, c.preview)))
                  }),
            f.kind === 'single' && !f.required && value !== undefined && h(Button, { size: 'sm', variant: 'ghost', disabled, onClick: () => set(undefined) }, tt('clearField')))
        }

        function InteractionCard({ item, sessionId, cwd, run, disabled, inline }) {
          const tt = useT(), scopeId = React.useId()
          const [answers, setAnswers] = React.useState({})
          const [values, setValues] = React.useState(() => {
            const init = new Map()
            for (const f of item.fields ?? EMPTY) {
              if (f.defaultValue !== undefined) init.set(f.id, f.defaultValue)
              else if (f.kind === 'boolean' && f.required) init.set(f.id, false)
            }
            return init
          })
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
          } else if (item.kind === 'url') {
            const href = item.urlInfo?.url ?? params.url
            body = h('div', { className: 'aw-section' },
              h('strong', null, item.urlInfo?.message ?? params.message),
              href ? h('a', { className: 'aw-url-link aw-mono', href, target: '_blank', rel: 'noopener noreferrer' }, href) : null)
            actions = [
              href ? h('a', { key: 'open', className: 'aw-url-link', href, target: '_blank', rel: 'noopener noreferrer' }, tt('urlOpen')) : null,
              h(Button, { key: 'accept', size: 'sm', variant: 'primary', disabled, onClick: () => send({ formAction: 'accept' }) }, tt('urlAccept')),
              h(Button, { key: 'decline', size: 'sm', variant: 'ghost', disabled, onClick: () => send({ formAction: 'decline' }) }, tt('urlDecline')),
            ].filter(Boolean)
            note = tt('urlHelp')
          } else if (item.kind === 'form') {
            const fields = item.fields ?? EMPTY, invalid = fields.some(f => {
              if (!values.has(f.id)) return f.required
              const v = values.get(f.id)
              if (f.kind === 'boolean') return typeof v !== 'boolean'
              if (f.kind === 'number') {
                if (typeof v !== 'number' || !Number.isFinite(v) || (f.integer && !Number.isInteger(v))) return true
                return (f.min != null && v < f.min) || (f.max != null && v > f.max)
              }
              const length = Array.isArray(v) ? v.length : Array.from(v).length
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
          const title = tt(item.kind === 'plan' ? 'kind.plan' : item.kind === 'url' ? 'urlElicitation' : item.kind)
          return h('section', { className: inline ? 'aw-ask aw-ask-inline' : 'aw-card aw-ask', 'data-tone': 'warn', 'aria-label': title },
            h('div', { className: 'aw-ask-head' }, h(IconWarningTriangleOutlineRegular, { size: 16 }), h('span', null, title)),
            h('div', { className: 'aw-ask-body' }, body),
            h('div', { className: 'aw-ask-actions' }, actions, h('span', { className: 'aw-grow' }),
              h(Button, { size: 'sm', variant: 'ghost', disabled, onClick: () => send({ cancel: true }) }, tt('dismiss'))),
            note ? h('p', { className: 'aw-note' }, note) : null)
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
              options: controls.modes.options.map(item => ({ value: item.value, label: item.name ?? item.value })),
              op: value => ({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, modeId: value }),
            }] : []),
            ...(controls.options ?? []).map(option => option.type === 'boolean'
              ? { id: `__draft_${option.id}`, label: option.name ?? option.id, category: option.category, kind: 'boolean', value: Boolean(controls.values?.[option.id]),
                  op: value => ({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: option.id, value }) }
              : { id: `__draft_${option.id}`, label: option.name ?? option.id, category: option.category, kind: 'select', value: controls.values?.[option.id] ?? option.defaultValue ?? '',
                  options: (option.choices ?? []).map(item => ({ value: item.value, label: item.name ?? item.value })),
                  op: value => ({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: option.id, value }) }),
          ] : []
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

        const GROUPS = ['attention', 'working', 'review', 'recent', 'history']

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
          const tt = useT()
          const canWrite = props.useAccess('session/prompt')
          const view = useNative(props.sessionId)
          const data = view.data
          const sessions = data?.sessions ?? EMPTY
          const own = sessions.filter(s => s.native.sessionId === props.sessionId && s.interactions.length)
          const provider = data?.providers.find(p => p.route === data.selected?.provider)
          const binding = provider ? sessions.findLast(s => s.native.sessionId === props.sessionId && s.native.route === provider.route && !s.native.retired) : null
          useCommandScope(props.sessionId, canWrite && data?.status === 'idle' && !view.error && binding?.state === 'idle' && !binding.archived ? binding.id : null, data?.commandStamp, provider?.label)
          const children = sessions.filter(s => s.native.sessionId !== props.sessionId && !s.native.retired && !s.archived)
          const visible = children.filter(s => ['attention', 'working', 'review'].includes(s.activity.group)).toSorted((a, b) => GROUPS.indexOf(a.activity.group) - GROUPS.indexOf(b.activity.group))
          const quiet = children.filter(s => s.activity.group === 'recent')
          const contextReport = binding && !binding.archived && data.contextReport?.externalId === binding.id ? data.contextReport : null
          const notices = binding && !binding.archived && data.noticeFeed?.externalId === binding.id && data.noticeFeed.remoteId === binding.remoteId && data.noticeFeed.items.length ? data.noticeFeed : null
          const canSteer = !!(binding && !binding.archived && data?.controls?.canSteer && canWrite)
          if (!notices && !contextReport && !own.length && !children.length && !canSteer && !view.error) return null
          const childRow = child => h(ChildRow, { key: child.id, child, sessionId: props.sessionId, view, canWrite })
          return h('div', { className: 'acpw aw-dock' },
            own.flatMap(s => s.interactions.map(item => h(InteractionCard, { key: item.id, item, sessionId: s.id, cwd: s.cwd, run: view.run, disabled: view.busy || !canWrite }))),
            canSteer ? h(SteerBar, { key: 'steer:' + binding.id, sessionId: props.sessionId, externalId: binding.id, view, disabled: view.busy }) : null,
            notices ? h(ConnectionNotices, { key: 'notice:' + binding.id + ':' + notices.connection, report: notices }) : null,
            contextReport ? h(ContextReport, { key: 'context:' + binding.id, report: contextReport, title: tt('contextRecent') }) : null,
            children.length ? h('section', { className: 'aw-card', 'aria-label': tt('children') },
              h('div', { className: 'aw-bar' }, h('span', { className: 'aw-bar-title' }, tt('children')), h('span', { className: 'aw-muted' }, String(children.length))),
              visible.map(childRow), quiet.length ? h('details', null, h('summary', null, tt('quietChildren', { n: quiet.length })), quiet.map(childRow)) : null) : null,
            view.error ? h('p', { className: 'aw-error', role: 'alert' }, view.error) : null)
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
        function AcpTurnReplyToggle({ sessionId, turn, seq }) {
          const tt = useT()
          const view = useNative(sessionId)
          const btnRef = React.useRef(null)
          const steps = (turn?.steps ?? EMPTY).map(step => step.data.get('assistant-step')).filter(Boolean)
          const acpStep = steps.findLast(step => step.finalNode?.source?.provider?.startsWith('acp-'))
          const matchedSession = acpStep
            ? view.data?.sessions.find(s => s.native?.route === acpStep.finalNode.source.provider)
            : view.data?.sessions.find(s => s.native?.sessionId === sessionId && s.native.runs.some(r => r.turn === turn?.turn))
          const matchedRun = matchedSession?.native?.runs.findLast(r => r.turn === turn?.turn)
          const route = acpStep?.finalNode?.source?.provider ?? matchedSession?.native?.route
          const visibleBlocks = steps.flatMap(step => (step.blocks ?? EMPTY).filter(block =>
            block.kind !== 'reasoning' && block.kind !== 'tool-call' && (block.kind !== 'text' || block.text.trim() !== '')))
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

        function ToolbarSelect({ label, description, value, options, disabled, onSelect }) {
          const button = React.useRef(null)
          const popup = React.useRef(null)
          const id = React.useId()
          const current = options.find(item => item.value === value) ?? options[0]
          const display = current?.name ?? value ?? ''
          const tooltip = description ? `${label}: ${display} — ${description}` : `${label}: ${display}`
          const position = event => {
            const panel = popup.current
            if (!panel) return
            const anchor = event.currentTarget.getBoundingClientRect()
            const width = Math.min(200, window.innerWidth - 16)
            const above = anchor.top - 14
            const below = window.innerHeight - anchor.bottom - 14
            const openAbove = above >= 120 || above >= below
            panel.style.left = `${Math.max(8, Math.min(anchor.right - width, window.innerWidth - width - 8))}px`
            panel.style.top = openAbove ? 'auto' : `${anchor.bottom + 6}px`
            panel.style.bottom = openAbove ? `${window.innerHeight - anchor.top + 6}px` : 'auto'
            panel.style.maxHeight = `${Math.max(0, openAbove ? above : below)}px`
          }
          return h(React.Fragment, null,
            h('button', {
              ref: button, type: 'button', className: 'aw-tb-btn', disabled,
              'aria-label': `${label}: ${display}`, title: tooltip,
              'aria-haspopup': 'dialog', popovertarget: id, onClick: position,
            }, h('span', null, display), h(IconChevronDownOutlineRegular, { size: 12, 'aria-hidden': true })),
            h('div', { ref: popup, id, className: 'aw-tb-pop', popover: 'auto', role: 'dialog', 'aria-label': label },
              options.map(option => {
                const active = option.value === value
                return h('button', {
                  key: option.value, type: 'button', className: 'aw-tb-item', 'aria-pressed': active, disabled,
                  title: option.description || undefined,
                  onClick: () => {
                    popup.current?.hidePopover()
                    button.current?.focus()
                    if (!active) onSelect(option.value)
                  },
                }, h('span', null, option.name ?? option.value), active ? h('span', { 'aria-hidden': true }, '✓') : null)
              })))
        }

        function NativeModelControls({ sessionId, useAccess }) {
          const tt = useT()
          const view = useNative(sessionId)
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

          const renderToggle = (opt, iconOnly) => {
            const pair = opt.type === 'select' ? booleanSelectPair(opt.choices) : null
            const rawValue = controls.values?.[opt.id] ?? opt.defaultValue
            const active = opt.type === 'boolean' ? Boolean(rawValue) : pair ? rawValue === pair.on : rawValue === 'true' || rawValue === 'on'
            const nextValue = opt.type === 'boolean' ? !active : pair ? (active ? pair.off : pair.on) : (active ? 'false' : 'true')
            const name = opt.name || opt.id
            const statusText = `${name}: ${active ? 'On' : 'Off'}`
            const tooltip = opt.description ? `${statusText} — ${opt.description}` : statusText
            return h('button', {
              key: opt.id, type: 'button',
              className: iconOnly ? 'aw-tb-btn aw-tb-icon' : 'aw-tb-btn',
              disabled, 'data-active': active, 'aria-pressed': active,
              'aria-label': statusText, title: tooltip,
              onClick: () => view.run({ action: 'native-set-option', dshSessionId: sessionId, route: controls.route, configId: opt.id, value: nextValue }),
            }, iconOnly ? h(FastBolt, { on: active }) : h('span', null, name))
          }

          return h('div', { className: 'acpw aw-tb' },
            modes ? h(ToolbarSelect, {
              label: tt('mode'),
              value: controls.mode ?? modes.options[0].value,
              options: modes.options,
              disabled,
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

        ctx.slots.inject('conversation.input.model.options', () => ctx.slots.register({ name: 'conversation.input.model.options', id: 'acp-settings', order: 40 }, CliMenuOption))
        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({ name: 'conversation.input.overlay', id: 'acp-settings', order: 40 }, CliSettingsOverlay))
        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id: 'acp-model-controls', order: 900 }, NativeModelControls))
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({ name: 'conversation.composer.dock', id: 'acp-native', order: 40 }, NativeDock))
        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({ name: 'conversation.chat.node', key: 'acp-run' }, NativeNode))
        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({ name: 'conversation.chat.turnTail', id: 'acp-reply-collapse', order: 10, locale: NS, inject: sessionId => ({ sessionId }) }, AcpTurnReplyToggle))

        function useWorkbench() {
          const [data, setData] = React.useState({ providers: EMPTY, activeByProvider: {}, authByProvider: {}, defaultCwd: '', storageError: null })
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
            const unsubscribe = subscribeLive(() => { void refresh() })
            return () => { controller.abort(); unsubscribe(); kick.current = null }
          }, [])
          return { data, ready, error, refresh: () => kick.current?.() }
        }

        const blankProvider = () => ({ id: '', label: '', command: '', args: '["acp"]' })
        const formatTokenCount = n => {
          if (!Number.isFinite(n) || n <= 0) return ''
          if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
          if (n >= 1_000) return `${Math.round(n / 1_000)}K`
          return String(n)
        }
        const authSummary = (status, tt) => {
          if (!status) return ''
          const first = status.accounts?.[0]
          const identity = first?.email || first?.name || first?.label || ''
          const state = status.state === 'authenticated' || status.state === 'signed_in' ? tt('authSignedIn')
            : status.state === 'unauthenticated' || status.state === 'signed_out' ? tt('authSignedOut')
              : status.state
          return [state, identity].filter(Boolean).join(' · ')
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

        function ProviderForm({ saved, draft, busy, notice, probeCwd, defaultCwd, onChange, onProbeCwd, onSave, onRemove, onCancel }) {
          const tt = useT()
          return h('form', { className: 'aw-box', onSubmit: onSave },
            h('div', { className: 'aw-box-head' },
              h('h3', { className: 'aw-grow' }, saved ? tt('editProvider') : tt('newProviderTitle')),
              onCancel ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: onCancel }, tt(saved ? 'hideConfig' : 'cancelNew')) : null),
            h('p', { className: 'aw-note' }, tt('providerHint'), ' ', tt('warning')),
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
          return h('label', { className: 'aw-model-row', 'data-hidden': hidden },
            h('input', { type: 'checkbox', checked: !hidden, disabled: busy, onChange: event => onToggle(model.id, event.target.checked) }),
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
                outputLabel ? h('span', { className: 'aw-pill' }, `${tt('ctxOutput')}: ${outputLabel}`) : null) : null))
        }

        function ProviderWorkbench({ providers, activeByProvider, authByProvider, defaultCwd, run, busy, creating, setCreating }) {
          const tt = useT()
          const [editing, setEditing] = React.useState(providers[0]?.id ?? '')
          const [draft, setDraft] = React.useState(() => providers[0] ? { ...providers[0], args: JSON.stringify(providers[0].args) } : blankProvider())
          const [showConfig, setShowConfig] = React.useState(false)
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
          const tier = saved?.advertised?.meta?.tier
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
                  activeLabel ? h('span', null, `· ${activeLabel}`) : null),
                h('span', { className: 'aw-item-sub aw-mono aw-ellipsis' }, [provider.command, ...provider.args].join(' ')))
              })),
            h('div', { className: 'aw-stack' },
              creating || !saved
                ? h(ProviderForm, {
                  saved: null, draft, busy, notice, probeCwd, defaultCwd: activeWorkspacePath || defaultCwd,
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
                    (tier?.name || authText || saved.advertised?.meta?.steering) ? h('div', { className: 'aw-pills' },
                      tier?.name ? h('span', { className: 'aw-pill', 'data-tone': 'accent' }, tier.name) : null,
                      authText ? h('span', { className: 'aw-pill' }, `${tt('authLabel')}: ${authText}`) : null,
                      saved.advertised?.meta?.steering ? h('span', { className: 'aw-pill' }, tt('cap.steering')) : null) : null,
                    modes.length ? h('div', { className: 'aw-pills' },
                      h('span', { className: 'aw-note' }, `${tt('modesLabel')}:`),
                      modes.map(mode => h('span', { key: mode.value, className: 'aw-pill' }, mode.name ?? mode.value))) : null,
                    statusBanner ? h('p', { className: 'aw-note', role: 'status' }, statusBanner) : null),
                  showConfig ? h(ProviderForm, {
                    saved, draft, busy, notice, probeCwd, defaultCwd: activeWorkspacePath || defaultCwd,
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
                activeByProvider: view.data.activeByProvider,
                authByProvider: view.data.authByProvider,
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
