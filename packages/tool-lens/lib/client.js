window.__ModuleLoader__.load({
  id: 'dsh-tool-lens',
  factory(require) {
    const React = require('react')
    const {
      DisclosureRow,
      FileTypeIcon,
      IconApiOutlineRegular,
      IconBranchOutlineRegular,
      IconBrowseOutlineRegular,
      IconChecklistOutlineRegular,
      IconClockOutlineRegular,
      IconCodeOutlineRegular,
      IconCordisPluginOutlineRegular,
      IconEditOutlineRegular,
      IconGlobeOutlineRegular,
      IconGoalOutlineRegular,
      IconInspectOutlineRegular,
      IconSearchOutlineRegular,
      IconSkillOutlineRegular,
      IconSparkleRegular,
      IconUsersOutlineRegular,
      Tag,
      TextShimmer,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'toolLens'
    const PRIORITY = -10
    const AUGMENT_PRIORITY = -20
    const MISSING_MS = 2400

    const CSS_TEXT = `
.dtl-card{display:flex;flex-direction:column}
.dtl-row{min-width:0}
.dtl-btn{display:inline-flex;align-items:center;min-width:0;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dtl-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px;border-radius:4px}
.dtl-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.dtl-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.dtl-error{color:var(--dsw-alias-state-error-primary)}
.dtl-stopped{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.dtl-err-badge{flex:0 1 auto;min-width:0;max-width:min(45%,300px);margin-left:8px;gap:5px}
.dtl-err-dot{flex:none;width:4px;height:4px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-error-primary)}
.dtl-err-text{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dtl-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.dtl-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.dtl-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.dtl-io-sec::-webkit-scrollbar-track{margin:6px 0}
.dtl-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.dtl-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.dtl-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.dtl-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.dtl-link{gap:4px;flex:0 1 auto;min-width:0;border-radius:4px}
.dtl-link .dtl-summary{text-decoration:underline dotted;text-decoration-color:currentColor;text-decoration-thickness:1px;text-underline-offset:3px}
.dtl-link-icon{display:inline-flex;flex:none;opacity:0;transition:opacity .1s}
.dtl-link-icon svg{width:12px;height:12px}
@media (hover:hover){
  .dtl-row:hover .dtl-link-icon{opacity:.7}
  .dtl-link:hover .dtl-summary{color:var(--dsw-alias-label-secondary)}
  .dtl-link:hover .dtl-link-icon{opacity:1;color:var(--dsw-alias-label-secondary)}
}
@media (hover:none){.dtl-link-icon{opacity:.7}}
.dtl-link:focus-visible .dtl-link-icon{opacity:1}
.dtl-hint{flex:none;margin-left:8px;font-size:12px;color:var(--dsw-alias-state-error-primary);white-space:nowrap}
.dtl-body{display:flex;flex-direction:column}
.dtl-panel{display:flex;flex-direction:column;max-height:260px;margin:4px 0 4px 4px;overflow:hidden;
  border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block)}
.dtl-panel-head{display:flex;flex:none;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px 6px 12px;
  border-bottom:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-markdown-code-block-banner)}
.dtl-panel-label{color:var(--dsw-alias-label-caption);font-size:11px;font-weight:500;line-height:16px;letter-spacing:.04em;text-transform:uppercase}
.dtl-panel-action{gap:4px;padding:2px 6px;border-radius:6px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.dtl-panel-action svg{width:12px;height:12px}
@media (hover:hover){.dtl-panel-action:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
.dtl-pre{min-height:0;margin:0;padding:10px 12px 12px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;
  font:var(--dsw-font-markdown-code-block-small);color:var(--dsw-alias-label-secondary)}
.dtl-pre::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.dtl-pre::-webkit-scrollbar-track{margin:6px 0}
.dtl-pre[data-error]{color:var(--dsw-alias-state-error-primary)}
.dtl-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;
  border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);
  color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.dtl-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.dtl-card:hover .dtl-inspect{opacity:1}.dtl-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.dtl-inspect{opacity:1}}
.dtl-wrap{position:relative}
.dtl-float{position:absolute;top:0;right:0;display:flex;align-items:center;gap:4px;height:calc(24px + var(--dsh-content-font-delta,0px));
  padding-left:20px;background:linear-gradient(to right,transparent,var(--dsw-alias-bg-base) 18px);opacity:0;transition:opacity 100ms ease}
.dtl-wrap:hover>.dtl-float,.dtl-wrap:focus-within>.dtl-float,.dtl-wrap[data-open]>.dtl-float{opacity:1}
@media (hover:none){.dtl-float{position:static;opacity:1;height:auto;padding-left:0;margin-top:2px;flex-wrap:wrap;background:none}}
.dtl-chip{display:inline-flex;align-items:center;gap:4px;max-width:220px;height:20px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l3);
  border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.dtl-chip svg{flex:none;width:12px;height:12px}
.dtl-chip[aria-pressed=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover-solid)}
@media (hover:hover){.dtl-chip:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
.dtl-chip:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dtl-list{display:flex;flex-direction:column;max-height:240px;margin:4px 0 4px 4px;padding:4px;overflow:auto;list-style:none;
  border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block)}
.dtl-item-row{display:flex;align-items:center;gap:6px;width:100%;padding:2px 6px;border-radius:6px}
@media (hover:hover){.dtl-item-row:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}}
.dtl-item{display:flex;flex:1 1 auto;align-items:center;gap:6px;min-width:0;padding:2px 2px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
@media (hover:hover){.dtl-item-row:hover .dtl-item{color:var(--dsw-alias-label-primary)}}
.dtl-item-primary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dtl-item-secondary{flex:none;max-width:40%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--dsw-alias-label-caption);font-size:11px}
.dtl-lines{display:inline-flex;flex:none;align-items:center;gap:3px;flex-wrap:nowrap}
.dtl-line-btn{padding:0 5px;height:18px;border:.5px solid var(--dsw-alias-border-l3);border-radius:4px;background:var(--dsw-alias-bg-base);
  color:var(--dsw-alias-label-tertiary);font:11px/16px var(--ds-font-family-code,monospace);cursor:pointer}
.dtl-line-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.dtl-line-btn:hover{border-color:var(--dsw-alias-border-l4);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}}
.dtl-item-more{padding:3px 8px;color:var(--dsw-alias-label-caption);font-size:11px}
@media (prefers-reduced-motion:reduce){.dtl-float,.dtl-link-icon,.dtl-inspect{transition:none}}
`

    const svg = (viewBox, children, extra) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox, fill: 'none', strokeWidth: 1, 'aria-hidden': true, ...extra }, ...children)
    const IconSidePanel = () => svg('0 0 16 16', [
      h('rect', { key: 1, x: 2, y: 3, width: 12, height: 10, rx: 2, stroke: 'currentColor', strokeWidth: 1.2 }),
      h('path', { key: 2, d: 'M10 3.6V12.4', stroke: 'currentColor', strokeWidth: 1.2 }),
    ])

    const firstLine = text => { const i = text.indexOf('\n'); return i === -1 ? text : text.slice(0, i) }
    function firstNonEmptyLine(text) {
      if (typeof text !== 'string') return ''
      for (const line of text.split(/\r?\n/u)) {
        const trimmed = line.trim()
        if (trimmed) return trimmed
      }
      return ''
    }
    function hasNonEmptyInput(block) {
      const { raw, args } = parseArgs(block)
      if (args !== null) return Object.keys(args).length > 0
      const trimmed = raw.trim()
      return trimmed !== '' && trimmed !== '{}'
    }

    function resultText(block) {
      if (!('kind' in block)) return null
      const parts = []
      for (const item of block.content ?? []) parts.push(item.type === 'text' ? item.text : JSON.stringify(item, null, 2))
      if (parts.length === 0 && block.error !== undefined) parts.push(`${block.error.name}: ${block.error.code}`)
      return parts.join('\n') || null
    }

    function callState(block) {
      if (!('kind' in block)) return 'running'
      if (block.error?.code === 'interrupted') return 'stopped'
      return block.isError ? 'error' : 'ok'
    }

    function parseArgs(block) {
      const raw = ('kind' in block ? block.call?.argsRaw : block.argsRaw) ?? ''
      try {
        const parsed = JSON.parse(raw)
        if (typeof parsed === 'object' && parsed !== null) return { raw, args: parsed }
      } catch {}
      return { raw, args: null }
    }

    const decodeEntities = text => text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

    function baseDirectory(output) {
      const m = /^Base directory for this skill: (.+)$/m.exec(output ?? '')
      return m === null ? undefined : decodeEntities(m[1].trim())
    }

    function SkillRow(props) {
      const { phase, block, inspect, sessionId, t, openSkill, useDisclosure, useContextMenu } = props
      const { expanded, toggle } = useDisclosure()
      const { getTriggerProps } = useContextMenu()
      const [missing, setMissing] = React.useState(false)
      React.useEffect(() => {
        if (!missing) return undefined
        const timer = setTimeout(() => setMissing(false), MISSING_MS)
        return () => clearTimeout(timer)
      }, [missing])

      if (phase === 'preparing') {
        return h('div', { className: 'dtl-card', 'data-tool': 'skill', 'data-state': 'preparing' },
          h(DisclosureRow, {
            rowClassName: 'dtl-row',
            icon: h(IconSkillOutlineRegular, { size: 14 }),
            title: t('skill.title'),
            running: true,
            open: false,
            expandable: false,
          }))
      }

      const state = callState(block)
      const { raw, args } = parseArgs(block)
      const hasParsedName = typeof args?.name === 'string' && args.name.trim() !== ''
      const name = hasParsedName ? firstLine(args.name) : (raw === '' ? block.callId : firstLine(raw))
      const output = resultText(block)
      const baseDir = baseDirectory(output)
      const skillFilePath = baseDir ? `${baseDir.replace(/[\\/]+$/, '')}/SKILL.md` : undefined
      const expandable = output !== null
      const open = expanded && expandable
      const running = state === 'running'
      const canOpen = state !== 'error' && hasParsedName
      const openFile = event => {
        event.stopPropagation()
        openSkill(args.name, baseDir).then(ok => { if (!ok) setMissing(true) })
      }
      const contextProps = skillFilePath
        ? getTriggerProps(() => ({ kind: 'file', value: { sessionId, path: skillFilePath } }))
        : {}

      const errorLine = state === 'error' && output !== null ? firstNonEmptyLine(output) : ''
      const showErrorBadge = state === 'error' && hasParsedName && errorLine !== ''
      let summary
      if (state === 'stopped') summary = h('span', { className: 'dtl-summary dtl-stopped' }, h(TextShimmer, null, t('skill.stopped')))
      else if (state === 'error' && !hasParsedName && errorLine !== '') summary = h('span', { className: 'dtl-summary dtl-error', title: errorLine }, h(TextShimmer, null, errorLine))
      else if (canOpen) {
        summary = h('button', {
          type: 'button',
          className: 'dtl-btn dtl-link',
          title: t('skill.open'),
          ...contextProps,
          onClick: openFile,
          onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
            contextProps?.onKeyDown?.(event)
          },
        },
        h('span', { className: 'dtl-summary' }, h(TextShimmer, null, name)),
        h('span', { className: 'dtl-link-icon' }, h(IconSidePanel)))
      } else {
        summary = h('span', { className: 'dtl-summary', title: name }, h(TextShimmer, null, name))
      }

      return h('div', { className: 'dtl-card', 'data-tool': 'skill', 'data-state': state },
        h(DisclosureRow, {
          rowClassName: 'dtl-row',
          icon: h(IconSkillOutlineRegular, { size: 14 }),
          title: t('skill.title'),
          running,
          open,
          expandable,
          expandOnRowClick: true,
          keepContentWhenOpen: true,
          onToggle: toggle,
          collapsedContent: h(React.Fragment, null,
            h('span', { className: 'dtl-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
            summary,
            showErrorBadge ? h(Tag, { tone: 'neutral', className: 'dtl-err-badge', title: errorLine },
              h('span', { className: 'dtl-err-dot', 'aria-hidden': true }),
              h('span', { className: 'dtl-err-text', title: errorLine }, errorLine)) : null,
            missing ? h('span', { className: 'dtl-hint', role: 'status' }, t('skill.notFound')) : null),
        },
        open ? h('div', { className: 'dtl-body' },
          h('section', { className: 'dtl-panel', 'aria-label': t('skill.instructions') },
            h('div', { className: 'dtl-panel-head' },
              h('span', { className: 'dtl-panel-label' }, t('skill.instructions')),
              canOpen ? h('button', { type: 'button', className: 'dtl-btn dtl-panel-action', ...contextProps, onClick: openFile }, h(IconSidePanel), t('skill.openShort')) : null),
            h('pre', { className: 'dtl-pre', 'data-error': state === 'error' || undefined }, output)),
          inspect === undefined ? null : h('button', { type: 'button', className: 'dtl-inspect', onClick: inspect },
            h(IconInspectOutlineRegular), t('skill.inspect'))) : null))
    }

    function createSkillResolver(ctx) {
      const catalogs = new Map()
      const catalog = sessionId => {
        let entry = catalogs.get(sessionId)
        if (entry !== undefined) return entry
        entry = ctx.remote.skills.list({ sessionId }, new AbortController().signal)
          .then(result => (result.ok ? result.value.skills : []), () => [])
        catalogs.set(sessionId, entry)
        entry.then(list => { if (list.length === 0 && catalogs.get(sessionId) === entry) catalogs.delete(sessionId) })
        return entry
      }
      const clear = () => catalogs.clear()
      return { catalog, clear }
    }

    const LENSES = [
      { key: 'skill', component: SkillRow },
    ]

    const FILE_INJECT_TOOLS = new Set([
      'read', 'write', 'edit', 'apply_patch',
      'office_render', 'office_convert', 'office_recalculate',
    ])

    const AUGMENTED = [
      'read', 'write', 'edit', 'apply_patch',
      'office_render', 'office_convert', 'office_recalculate',
      'bash', 'pwsh', 'grep', 'glob', 'web_search', 'web_fetch', 'grok_search', 'openai_search',
      'subagent', 'subagent_fork', 'spawn_teammate', 'wait_agent', 'send_message', 'session_send_message', 'interrupt_agent', 'list_agents', 'list_subagent_models',
      'job_list', 'job_output', 'job_kill',
      'terminal_open', 'terminal_read', 'terminal_list', 'terminal_signal', 'terminal_close',
      'workflow', 'ralph', 'lsp',
      'cordis_inspect', 'cordis_inspect_list', 'cordis_inspect_query', 'cordis_inspect_self',
      'session_event_read', 'session_event_search', 'session_event_trace', 'session_search', 'session_trace',
      'create_goal', 'get_goal', 'update_goal',
      'schedule_create', 'schedule_list', 'schedule_view', 'schedule_edit', 'schedule_delete', 'schedule_update',
      'team_task_create', 'team_task_get', 'team_task_update', 'team_task_list',
    ]

    const NATIVE_TITLE_KEYS = {
      read: 'tool.title.read',
      write: 'tool.title.write',
      edit: 'tool.title.edit',
      apply_patch: 'tool.title.applyPatch',
      office_render: 'tool.title.officeRender',
      office_convert: 'tool.title.officeConvert',
      office_recalculate: 'tool.title.officeRecalculate',
      bash: 'tool.title.bash',
      pwsh: 'tool.title.pwsh',
      grep: 'tool.title.grep',
      glob: 'tool.title.glob',
      web_search: 'tool.title.webSearch',
      web_fetch: 'tool.title.webFetch',
      subagent: 'tool.title.subagent',
      subagent_fork: 'tool.title.subagentFork',
      spawn_teammate: 'tool.title.spawnTeammate',
      wait_agent: 'tool.title.waitAgent',
      send_message: 'tool.title.sendMessage',
      session_send_message: 'tool.title.sendMessage',
      interrupt_agent: 'tool.title.interruptAgent',
      list_agents: 'tool.title.listAgents',
      list_subagent_models: 'tool.title.listModels',
      job_list: 'tool.title.listJobs',
      job_output: 'tool.title.readJob',
      job_kill: 'tool.title.killJob',
      terminal_open: 'tool.title.openTerminal',
      terminal_read: 'tool.title.readTerminal',
      terminal_list: 'tool.title.listTerminals',
      terminal_signal: 'tool.title.signalTerminal',
      terminal_close: 'tool.title.closeTerminal',
      workflow: 'tool.title.workflow',
      ralph: 'tool.title.ralph',
      lsp: 'tool.title.lsp',
      cordis_inspect: 'tool.title.inspect',
      cordis_inspect_list: 'tool.title.inspectProviders',
      cordis_inspect_query: 'tool.title.queryRuntime',
      cordis_inspect_self: 'tool.title.inspectPlugins',
      session_event_read: 'tool.title.readEvent',
      session_event_search: 'tool.title.searchEvents',
      session_event_trace: 'tool.title.traceEvent',
      session_search: 'tool.title.searchSessions',
      session_trace: 'tool.title.traceSession',
      create_goal: 'tool.title.createGoal',
      get_goal: 'tool.title.getGoal',
      update_goal: 'tool.title.updateGoal',
      schedule_create: 'tool.title.createSchedule',
      schedule_list: 'tool.title.listSchedules',
      schedule_view: 'tool.title.viewSchedule',
      schedule_edit: 'tool.title.editSchedule',
      schedule_delete: 'tool.title.deleteSchedule',
      schedule_update: 'tool.title.updateSchedule',
      team_task_create: 'tool.title.createTeamTask',
      team_task_get: 'tool.title.getTeamTask',
      team_task_update: 'tool.title.updateTeamTask',
      team_task_list: 'tool.title.listTeamTasks',
    }

    const LSP_TITLE_KEYS = {
      goToDefinition: 'tool.title.findDefinition',
      findReferences: 'tool.title.findReferences',
      goToImplementation: 'tool.title.findImplementation',
      hover: 'tool.title.hoverSymbol',
    }

    const WEB_FETCH_FAILURE_KEYS = {
      WEB_FETCH_DNS_FAILED: 'tool.webFetch.failure.dns',
      WEB_FETCH_CONNECTION_REFUSED: 'tool.webFetch.failure.refused',
      WEB_FETCH_CONNECTION_TIMEOUT: 'tool.webFetch.failure.connectionTimeout',
      WEB_FETCH_CERTIFICATE_INVALID: 'tool.webFetch.failure.certificate',
      WEB_FETCH_CONNECTION_INTERRUPTED: 'tool.webFetch.failure.interrupted',
      WEB_FETCH_NETWORK_UNREACHABLE: 'tool.webFetch.failure.unreachable',
      WEB_FETCH_NETWORK_ERROR: 'tool.webFetch.failure.network',
    }

    const AGENT_TOOLS = new Set([
      'subagent', 'subagent_fork', 'list_subagent_models', 'spawn_teammate',
      'list_agents', 'send_message', 'session_send_message', 'interrupt_agent', 'wait_agent',
    ])

    const positiveInt = value => (typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : undefined)
    const nonEmptyText = (...values) => values.find(v => typeof v === 'string' && v.trim() !== '')

    function displayPath(rawPath, cwd, home) {
      if (typeof rawPath !== 'string') return ''
      const path = firstLine(rawPath).trim()
      if (!path) return ''
      const normPath = path.replace(/\\/g, '/')
      if (typeof cwd === 'string' && cwd) {
        const normCwd = cwd.replace(/\\/g, '/').replace(/\/+$/, '')
        if (normPath === normCwd) return '.'
        if (normCwd && normPath.startsWith(`${normCwd}/`)) return normPath.slice(normCwd.length + 1)
      }
      if (typeof home === 'string' && home) {
        const normHome = home.replace(/\\/g, '/').replace(/\/+$/, '')
        if (normPath === normHome) return '~'
        if (normHome && normPath.startsWith(`${normHome}/`)) return `~/${normPath.slice(normHome.length + 1)}`
      }
      return path
    }

    function patchTargetsSummary(patchText, cwd, home) {
      if (typeof patchText !== 'string' || !patchText) return ''
      const targets = []
      for (const line of patchText.split(/\r?\n/u)) {
        const header = /^\*\*\* (?:Update|Add|Delete) File:\s*(.+)$/u.exec(line)
        if (header) {
          targets.push({ label: displayPath(header[1].trim(), cwd, home) })
          continue
        }
        const move = /^\*\*\* Move to:\s*(.+)$/u.exec(line)
        if (move && targets.length > 0) {
          const prev = targets[targets.length - 1]
          prev.label = `${prev.label} → ${displayPath(move[1].trim(), cwd, home)}`
        }
      }
      return targets.map(item => item.label).filter(Boolean).join(', ')
    }

    function fallbackArgText(block, keys) {
      const view = block?.args
      if (!view || typeof view.text !== 'function') return undefined
      for (const key of keys) {
        const value = view.text(key)
        if (typeof value === 'string' && value.trim() !== '') return value
      }
      return undefined
    }

    function failedToolSummary(toolName, block, cwd, home) {
      const { args } = parseArgs(block)
      const obj = args && !Array.isArray(args) ? args : null
      if (toolName === 'read') {
        const rawPath = nonEmptyText(
          obj?.file_path, obj?.path, obj?.Path, obj?.AbsolutePath, obj?.filePath, obj?.TargetFile, obj?.target_file,
          fallbackArgText(block, ['file_path', 'path', 'Path', 'AbsolutePath', 'filePath']),
        )
        if (!rawPath) {
          const desc = nonEmptyText(obj?.description, fallbackArgText(block, ['description']))
          return desc ? firstLine(desc).trim() : ''
        }
        const base = displayPath(rawPath, cwd, home)
        const offset = positiveInt(obj?.offset ?? obj?.start_line ?? obj?.StartLine)
        const endLine = positiveInt(obj?.end_line ?? obj?.EndLine)
        const limit = positiveInt(obj?.limit)
        if (offset !== undefined && endLine !== undefined) return `${base}:${offset}-${endLine}`
        if (offset !== undefined && limit !== undefined) return limit === 1 ? `${base}:${offset}` : `${base}:${offset}-${offset + limit - 1}`
        if (offset !== undefined) return `${base}:${offset}`
        if (endLine !== undefined) return `${base}:1-${endLine}`
        return base
      }
      if (toolName === 'write' || toolName === 'edit' || toolName.startsWith('office_')) {
        const rawPath = nonEmptyText(obj?.file_path, obj?.path, obj?.input_path, fallbackArgText(block, ['file_path', 'path', 'input_path']))
        return rawPath ? displayPath(rawPath, cwd, home) : ''
      }
      if (toolName === 'apply_patch') {
        const patch = nonEmptyText(obj?.input, fallbackArgText(block, ['input']))
        return patch ? patchTargetsSummary(patch, cwd, home) : ''
      }
      if (toolName === 'bash' || toolName === 'pwsh') {
        const text = nonEmptyText(obj?.description, obj?.command, fallbackArgText(block, ['description', 'command']))
        return text ? firstLine(text).trim() : ''
      }
      if (toolName === 'grep' || toolName === 'glob') {
        const pattern = nonEmptyText(obj?.pattern, obj?.query, fallbackArgText(block, ['pattern', 'query']))
        const dir = nonEmptyText(obj?.path, obj?.file_path, fallbackArgText(block, ['path', 'file_path']))
        return [pattern ? firstLine(pattern).trim() : '', dir ? displayPath(dir, cwd, home) : ''].filter(Boolean).join(' · ')
      }
      if (toolName === 'web_fetch') {
        const url = nonEmptyText(obj?.url, fallbackArgText(block, ['url']))
        return url ? firstLine(url).trim() : ''
      }
      if (toolName === 'web_search') {
        if (Array.isArray(obj?.queries)) {
          const queries = obj.queries.filter(q => typeof q === 'string' && q.trim() !== '').map(q => firstLine(q).trim())
          if (queries.length > 0) return queries.join(', ')
        }
        const query = nonEmptyText(obj?.query, fallbackArgText(block, ['query']))
        return query ? firstLine(query).trim() : ''
      }
      if (toolName === 'subagent' || toolName === 'subagent_fork') {
        const text = nonEmptyText(obj?.description, obj?.prompt, fallbackArgText(block, ['description', 'prompt']))
        return text ? firstLine(text).trim() : ''
      }
      if (AGENT_TOOLS.has(toolName)) {
        const text = nonEmptyText(obj?.name, obj?.agent, obj?.target, obj?.description, fallbackArgText(block, ['name', 'agent', 'target', 'description']))
        return text ? firstLine(text).trim() : ''
      }
      if (toolName === 'lsp') {
        const file = nonEmptyText(obj?.file_path, obj?.path, fallbackArgText(block, ['file_path', 'path']))
        const symbol = nonEmptyText(obj?.symbol, obj?.query, fallbackArgText(block, ['symbol', 'query']))
        const line = positiveInt(obj?.line)
        const loc = file ? `${displayPath(file, cwd, home)}${line ? `:${line}` : ''}` : ''
        return [loc, symbol ? firstLine(symbol).trim() : ''].filter(Boolean).join(' · ')
      }
      if (!obj) {
        const fallback = fallbackArgText(block, ['description', 'title', 'name', 'file_path', 'path', 'query', 'pattern', 'command', 'url'])
        return fallback ? firstLine(fallback).trim() : ''
      }
      const pathKey = nonEmptyText(obj.file_path, obj.path)
      if (pathKey) return displayPath(pathKey, cwd, home)
      const picked = nonEmptyText(
        obj.description, obj.title, obj.name, obj.query, obj.pattern,
        obj.job_id, obj.terminal_id, obj.session_id, obj.schedule_id, obj.goal_id, obj.task_id, obj.id,
        obj.command, obj.url,
      )
      if (picked) return firstLine(picked).trim()
      for (const value of Object.values(obj)) {
        if (typeof value === 'string' && value.trim() !== '') return firstLine(value).trim()
      }
      return ''
    }

    function nativeToolIcon(toolName) {
      if (toolName === 'read' || toolName === 'web_fetch' || toolName.startsWith('office_')) return h(IconBrowseOutlineRegular, { size: 14 })
      if (toolName === 'write' || toolName === 'edit' || toolName === 'apply_patch') return h(IconEditOutlineRegular, { size: 14 })
      if (toolName === 'bash' || toolName === 'pwsh') return h(IconApiOutlineRegular, { size: 14 })
      if (toolName === 'grep' || toolName === 'glob' || toolName === 'lsp' || toolName.startsWith('session_')) return h(IconSearchOutlineRegular, { size: 14 })
      if (toolName === 'web_search') return h(IconGlobeOutlineRegular, { size: 14 })
      if (AGENT_TOOLS.has(toolName)) return h(IconUsersOutlineRegular, { size: 14 })
      if (toolName.startsWith('schedule_')) return h(IconClockOutlineRegular, { size: 14 })
      if (toolName.endsWith('_goal')) return h(IconGoalOutlineRegular, { size: 14 })
      if (toolName.startsWith('cordis_')) return h(IconCordisPluginOutlineRegular, { size: 14 })
      if (toolName.startsWith('terminal_')) return h(IconCodeOutlineRegular, { size: 14 })
      if (toolName.startsWith('job_') || toolName.startsWith('team_task_')) return h(IconChecklistOutlineRegular, { size: 14 })
      if (toolName === 'workflow' || toolName === 'ralph') return h(IconBranchOutlineRegular, { size: 14 })
      return h(IconSparkleRegular, { size: 14 })
    }

    function nativeToolTitleKey(toolName, args) {
      if (toolName === 'lsp' && typeof args?.operation === 'string' && Object.hasOwn(LSP_TITLE_KEYS, args.operation)) {
        return LSP_TITLE_KEYS[args.operation]
      }
      if (toolName === 'cordis_inspect') {
        return args?.query === undefined ? 'tool.title.inspectProviders' : 'tool.title.queryRuntime'
      }
      return NATIVE_TITLE_KEYS[toolName] ?? 'tool.title.generic'
    }

    const LIST_CAP = 50
    const MAX_LINE_JUMPS = 6
    const SPILL_MARK = ' Full formatted result stored at: '
    const CLAUDE_SPILL_MARK = 'full output saved to '

    const settledText = block => ('kind' in block ? resultText(block) : null)
    const metaOf = block => (typeof block.meta === 'object' && block.meta !== null && !Array.isArray(block.meta) ? block.meta : undefined)

    function spillPath(block) {
      const text = settledText(block)
      if (text === null) return undefined
      const at = text.lastIndexOf(SPILL_MARK)
      if (at >= 0) {
        const rest = text.slice(at + SPILL_MARK.length)
        const end = rest.indexOf('. ')
        const path = (end < 0 ? rest.replace(/\)\s*$/, '') : rest.slice(0, end)).trim()
        if (/^(?:\/|[A-Za-z]:[\\/])/.test(path)) return path
      }
      const claudeAt = text.lastIndexOf(CLAUDE_SPILL_MARK)
      if (claudeAt >= 0) {
        const rest = text.slice(claudeAt + CLAUDE_SPILL_MARK.length)
        const end = rest.search(/[\]\r\n]/u)
        const path = (end < 0 ? rest : rest.slice(0, end)).trim()
        if (/^(?:\/|[A-Za-z]:[\\/])/.test(path)) return path
      }
      return undefined
    }

    function subagentChild(toolName, block) {
      if (!('kind' in block) || block.isError) return undefined
      if (toolName === 'subagent' || toolName === 'subagent_fork') {
        const reference = metaOf(block)?.name ?? parseArgs(block).args?.name
        return typeof reference === 'string' && reference !== '' ? reference : undefined
      }
      if (toolName === 'spawn_teammate') {
        const reference = metaOf(block)?.name ?? parseArgs(block).args?.name
        return typeof reference === 'string' && reference !== '' ? reference : undefined
      }
      if (toolName !== 'send_message' && toolName !== 'interrupt_agent' && toolName !== 'wait_agent') return undefined
      const reference = parseArgs(block).args?.agent ?? parseArgs(block).args?.name
      return typeof reference === 'string' && reference !== '' ? reference : undefined
    }

    async function resolveSubagentAddress(sessions, parent, reference) {
      if (reference === 'lead') return undefined
      let current = parent
      const visited = new Set()
      for (let address = sessions.subagentAddress(current); address !== undefined; address = sessions.subagentAddress(current)) {
        if (visited.has(current)) return undefined
        visited.add(current)
        current = address.parentSessionId
      }
      let target
      for (const name of reference.split('/')) {
        const catalog = () => sessions.list.getSnapshot().projectionsBySession?.[current]?.values?.subagentCatalog ?? []
        let entry = catalog().find(item => item.name === name)
        if (entry === undefined) {
          await sessions.refreshProjections(current)
          entry = catalog().find(item => item.name === name)
        }
        if (entry === undefined || entry.mode === 'external') return undefined
        target = { parentSessionId: current, childSessionId: entry.id, mode: entry.mode }
        current = entry.id
      }
      return target
    }

    function searchFiles(block) {
      if (!('kind' in block) || block.isError) return []
      const meta = metaOf(block)
      if (meta?.shape === 'paths' && Array.isArray(meta.paths)) {
        return meta.paths.filter(path => typeof path === 'string').map(path => ({ path }))
      }
      if (meta?.shape === 'matches' && Array.isArray(meta.files)) {
        return meta.files
          .filter(file => typeof file?.path === 'string')
          .map(file => {
            const lines = [...new Set((file.matches ?? [])
              .map(match => match?.lineNumber)
              .filter(line => Number.isInteger(line) && line > 0))]
            return { path: file.path, line: lines[0], lines, count: file.matches?.length }
          })
      }
      return []
    }

    function lspLocations(block) {
      if (!('kind' in block) || block.isError) return []
      const text = settledText(block)
      if (text === null) return []
      const byFile = new Map()
      const pattern = /(?:^|[\s([{"'])((?:\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*|[A-Za-z]:[\\/][A-Za-z0-9._\\/-]+|[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)+)\.[A-Za-z0-9]{1,8}):(\d+)(?::\d+)?/g
      for (const rawLine of text.split('\n')) {
        let match
        while ((match = pattern.exec(rawLine)) !== null) {
          const path = match[1]
          const line = Number(match[2])
          if (!Number.isInteger(line) || line <= 0) continue
          let entry = byFile.get(path)
          if (!entry) {
            entry = { path, line, lines: [] }
            byFile.set(path, entry)
          }
          if (!entry.lines.includes(line)) entry.lines.push(line)
        }
      }
      return [...byFile.values()].map(entry => ({ ...entry, count: entry.lines.length }))
    }

    function webLinks(toolName, block) {
      if (!('kind' in block) || block.isError) return []
      const meta = metaOf(block)
      const isWebUrl = url => {
        if (typeof url !== 'string' || !URL.canParse(url)) return false
        const { protocol } = new URL(url)
        return protocol === 'https:' || protocol === 'http:'
      }
      if ((toolName === 'web_search' || toolName === 'grok_search' || toolName === 'openai_search') && Array.isArray(meta?.sources)) {
        return meta.sources.filter(source => isWebUrl(source?.url)).map(source => ({ url: source.url, title: source.title }))
      }
      if (toolName === 'web_fetch') {
        const url = typeof meta?.url === 'string' ? meta.url : parseArgs(block).args?.url
        if (isWebUrl(url)) return [{ url }]
      }
      return []
    }

    const IconOutput = () => svg('0 0 16 16', [
      h('path', { key: 1, d: 'M3.5 2.5h6l3 3v8h-9z', stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round' }),
      h('path', { key: 2, d: 'M5.5 8h5M5.5 10.5h3.5', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }),
    ])
    const IconChat = () => svg('0 0 16 16', [
      h('path', { key: 1, d: 'M3 3.5h10v7H7l-3 2.5v-2.5H3z', stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round' }),
    ])
    const IconFiles = () => svg('0 0 16 16', [
      h('path', { key: 1, d: 'M5 2.5h5l2.5 2.5v6.5H5z', stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round' }),
      h('path', { key: 2, d: 'M3.5 5v8.5h6.5', stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round' }),
    ])
    const IconGlobe = () => h(IconGlobeOutlineRegular, { size: 12 })

    const fill = (text, n) => text.replace('{n}', String(n))
    const tail = path => path.replace(/\\/g, '/').split('/').filter(Boolean).slice(-2).join('/') || path
    const hostOf = url => { try { return new URL(url).host } catch { return url } }

    function createAugmentLens(ctx) {
      const tt = ctx.locale.bind(NS)
      const subscribeLocale = fn => ctx.locale.subscribe(fn)
      const localeSnapshot = () => ctx.locale.getSnapshot()

      const openUrl = (url, event) => {
        if (event?.metaKey || event?.ctrlKey) { window.open(url, '_blank', 'noopener'); return }
        try {
          ctx.sidebarRight.openTab('browser', { params: { url } })
        } catch (error) {
          console.warn('[dsh-tool-lens] side-panel browser unavailable, opening a tab:', error)
          window.open(url, '_blank', 'noopener')
        }
      }

      const openSubagent = async (parent, reference) => {
        try {
          const address = await resolveSubagentAddress(ctx.sessions, parent, reference)
          if (address === undefined || address.mode === 'external') return
          const query = new URLSearchParams({ parent: address.parentSessionId, mode: address.mode })
          ctx.sidebarRight.openResource(`dsh-resource://subagentchat/session/${encodeURIComponent(address.childSessionId)}?${query}`, {
            kind: 'subagentchat',
            preferNewPane: true,
          })
        } catch (error) {
          console.error('[dsh-tool-lens] open subagent failed:', error)
        }
      }

      const baseEntry = (key, self) => {
        let best
        for (const entry of ctx.slots.entries('tool.call.toolview')) {
          if (entry.options?.key !== key || entry.component === self) continue
          const priority = entry.options.priority ?? 0
          if (priority <= AUGMENT_PRIORITY) continue
          if (best === undefined || priority < (best.options.priority ?? 0)) best = entry
        }
        return best
      }

      function Action({ icon, label, title, pressed, contextProps, onClick }) {
        return h('button', {
          type: 'button',
          className: 'dtl-chip',
          title,
          'aria-pressed': pressed,
          ...contextProps,
          onClick: event => { event.stopPropagation(); onClick(event) },
        }, typeof icon === 'function' ? h(icon) : icon, label)
      }

      function FailedToolRow({ toolName, block, cwd, home, inspect, useDisclosure, t }) {
        const { expanded, toggle } = useDisclosure()
        const { raw, args } = parseArgs(block)
        const summary = failedToolSummary(toolName, block, cwd, home)
        const output = resultText(block)
        const code = 'kind' in block ? block.error?.code : undefined
        const errorBadge = toolName === 'web_fetch' && typeof code === 'string' && Object.hasOwn(WEB_FETCH_FAILURE_KEYS, code)
          ? t(WEB_FETCH_FAILURE_KEYS[code])
          : output !== null ? firstNonEmptyLine(output) : ''
        const displaySummary = summary || errorBadge
        const summaryIsError = summary === '' && errorBadge !== ''
        const showErrorBadge = summary !== '' && errorBadge !== ''
        const inputText = args !== null && Object.keys(args).length > 0
          ? JSON.stringify(args, null, 2)
          : (raw.trim() && raw.trim() !== '{}' ? raw.trim() : null)
        const expandable = inputText !== null || output !== null
        const open = expanded && expandable
        const title = t(nativeToolTitleKey(toolName, args))

        return h('div', { className: 'dtl-card', 'data-tool': toolName, 'data-state': 'error' },
          h(DisclosureRow, {
            rowClassName: 'dtl-row',
            icon: nativeToolIcon(toolName),
            title,
            running: false,
            open,
            expandable,
            expandOnRowClick: true,
            keepContentWhenOpen: true,
            onToggle: toggle,
            collapsedContent: displaySummary ? h(React.Fragment, null,
              h('span', { className: 'dtl-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
              h('span', { className: `dtl-summary${summaryIsError ? ' dtl-error' : ''}`, title: displaySummary }, h(TextShimmer, null, displaySummary)),
              showErrorBadge ? h(Tag, { tone: 'neutral', className: 'dtl-err-badge', title: errorBadge },
                h('span', { className: 'dtl-err-dot', 'aria-hidden': true }),
                h('span', { className: 'dtl-err-text', title: errorBadge }, errorBadge)) : null) : null,
          },
          open ? h('div', { className: 'dtl-body' },
            inputText !== null || output !== null ? h('div', { className: 'dtl-io' },
              inputText !== null ? h('div', { className: 'dtl-io-sec' },
                h('span', { className: 'dtl-io-label' }, t('row.input')),
                h('span', { className: 'dtl-io-text' }, inputText)) : null,
              inputText !== null && output !== null ? h('span', { className: 'dtl-io-div', 'aria-hidden': true }) : null,
              output !== null ? h('div', { className: 'dtl-io-sec' },
                h('span', { className: 'dtl-io-label' }, t('row.output')),
                h('span', { className: 'dtl-io-text', 'data-error': true }, output)) : null) : null,
            inspect === undefined ? null : h('button', { type: 'button', className: 'dtl-inspect', onClick: inspect },
              h(IconInspectOutlineRegular), t('row.inspect'))) : null))
      }

      function AugmentedRow(props) {
        const localeSnap = React.useSyncExternalStore(subscribeLocale, localeSnapshot)
        const localeRev = localeSnap?.revision ?? localeSnap
        const { toolName, block, phase, cwd, home, openFile, sessionId, useContextMenu } = props
        const { getTriggerProps } = useContextMenu()
        const [list, setList] = React.useState(null)
        const isNativeFailure = phase === 'result'
          && 'kind' in block
          && block.isError === true
          && block.error?.code !== 'interrupted'
          && block.error?.code !== 'AUTO_REVIEW_DENIED'
          && Object.hasOwn(NATIVE_TITLE_KEYS, toolName)
        const isParsedFailure = isNativeFailure
          && (failedToolSummary(toolName, block, cwd, home) !== '' || hasNonEmptyInput(block))
        const base = isParsedFailure ? undefined : baseEntry(toolName, AugmentedRow)
        const baseInjected = React.useMemo(() => {
          if (base === undefined) return undefined
          const injectFn = base.inject ?? base.options?.inject
          const injected = typeof injectFn === 'function' ? injectFn(sessionId) : undefined
          return injected && typeof injected === 'object' ? injected : undefined
        }, [base, sessionId])
        const baseProps = React.useMemo(() => {
          if (base === undefined) return null
          const baseLocale = base.locale ?? base.options?.locale
          const boundT = baseLocale && baseLocale !== 'conversation' ? ctx.locale.bind(baseLocale) : undefined
          const baseT = boundT ? (key, params) => boundT(key, params) : undefined
          if (!baseInjected && !baseT) return null
          return {
            ...baseInjected,
            ...(baseT ? { t: baseT } : undefined),
          }
        }, [base, baseInjected, localeRev])
        const inner = isParsedFailure
          ? h(FailedToolRow, props)
          : (base === undefined ? null : h(base.component, baseProps ? { ...props, ...baseProps } : props))
        if (phase === 'preparing') return inner

        const spill = spillPath(block)
        const child = subagentChild(toolName, block)
        const files = toolName === 'grep' || toolName === 'glob' ? searchFiles(block)
          : toolName === 'lsp' ? lspLocations(block) : []
        const links = toolName === 'web_search' || toolName === 'web_fetch' || toolName === 'grok_search' || toolName === 'openai_search'
          ? webLinks(toolName, block) : []
        const actions = []
        if (spill !== undefined) {
          actions.push(h(Action, {
            key: 'spill',
            icon: IconOutput,
            label: tt('lens.spill'),
            title: tt('lens.spillTitle'),
            contextProps: getTriggerProps(() => ({ kind: 'file', value: { sessionId, path: spill } })),
            onClick: () => openFile(spill),
          }))
        }
        if (child !== undefined && child !== 'lead' && sessionId !== undefined) {
          actions.push(h(Action, { key: 'sub', icon: IconChat, label: tt('lens.subagent'), title: tt('lens.subagentTitle'), onClick: () => openSubagent(sessionId, child) }))
        }
        if (files.length === 1 && !(files[0].lines?.length > 1)) {
          const single = files[0]
          actions.push(h(Action, {
            key: 'file',
            icon: h(FileTypeIcon, { path: single.path, size: 12 }),
            label: single.line ? `${tail(single.path)}:${single.line}` : tail(single.path),
            title: single.line ? `${single.path}:${single.line}` : single.path,
            contextProps: getTriggerProps(() => ({ kind: 'file', value: { sessionId, path: single.path, ...(single.line ? { line: single.line } : {}) } })),
            onClick: () => openFile(single.path, single.line ? { line: single.line } : undefined),
          }))
        } else if (files.length > 0) {
          const label = files.length === 1
            ? `${tail(files[0].path)} (${files[0].lines.length})`
            : fill(tt('lens.files'), files.length)
          actions.push(h(Action, { key: 'files', icon: IconFiles, label, title: tt('lens.filesTitle'), pressed: list === 'files', onClick: () => setList(v => (v === 'files' ? null : 'files')) }))
        }
        if (toolName === 'web_fetch' && links.length === 1) {
          actions.push(h(Action, {
            key: 'web',
            icon: IconGlobe,
            label: tt('lens.browse'),
            title: tt('lens.browseTitle'),
            contextProps: getTriggerProps(() => ({ kind: 'url', value: { sessionId, url: links[0].url } })),
            onClick: event => openUrl(links[0].url, event),
          }))
        } else if (links.length > 0) {
          actions.push(h(Action, { key: 'links', icon: IconGlobe, label: fill(tt('lens.sources'), links.length), title: tt('lens.browseTitle'), pressed: list === 'links', onClick: () => setList(v => (v === 'links' ? null : 'links')) }))
        }
        if (actions.length === 0) return inner

        let panel = null
        if (list === 'files' && files.length > 0) {
          panel = h(ItemList, {
            items: files.slice(0, LIST_CAP).map(file => ({
              key: file.path,
              icon: h(FileTypeIcon, { path: file.path, size: 14 }),
              primary: file.path,
              secondary: file.count && !(file.lines?.length > 1) ? `${file.count}` : undefined,
              lines: file.lines?.length > 1 ? file.lines : undefined,
              onLineClick: line => openFile(file.path, { line }),
              contextProps: getTriggerProps(() => ({ kind: 'file', value: { sessionId, path: file.path, ...(file.line ? { line: file.line } : {}) } })),
              onClick: () => openFile(file.path, file.line ? { line: file.line } : undefined),
            })),
            more: files.length - LIST_CAP,
          })
        } else if (list === 'links' && links.length > 0) {
          panel = h(ItemList, {
            items: links.slice(0, LIST_CAP).map((link, i) => ({
              key: `${i}:${link.url}`,
              icon: h(IconGlobeOutlineRegular, { size: 14 }),
              primary: link.title || link.url,
              secondary: hostOf(link.url),
              title: link.url,
              contextProps: getTriggerProps(() => ({ kind: 'url', value: { sessionId, url: link.url } })),
              onClick: event => openUrl(link.url, event),
            })),
            more: links.length - LIST_CAP,
          })
        }

        return h('div', { className: 'dtl-wrap', 'data-tool-lens': toolName, 'data-open': list !== null || undefined },
          inner,
          h('div', { className: 'dtl-float', role: 'toolbar', 'aria-label': tt('lens.actions') }, ...actions),
          panel)
      }

      function ItemList({ items, more }) {
        return h('ul', { className: 'dtl-list' },
          ...items.map(item => h('li', { key: item.key, className: 'dtl-item-row' },
            h('button', {
              type: 'button',
              className: 'dtl-btn dtl-item',
              title: item.title ?? item.primary,
              ...item.contextProps,
              onClick: item.onClick,
            },
            item.icon,
            h('span', { className: 'dtl-item-primary' }, item.primary),
            item.secondary ? h('span', { className: 'dtl-item-secondary' }, item.secondary) : null),
            item.lines ? h('span', { className: 'dtl-lines' },
              item.lines.slice(0, MAX_LINE_JUMPS).map(line => h('button', {
                key: line,
                type: 'button',
                className: 'dtl-line-btn',
                title: `${item.primary}:${line}`,
                onClick: event => { event.stopPropagation(); item.onLineClick(line) },
              }, `:${line}`)),
              item.lines.length > MAX_LINE_JUMPS ? h('span', { className: 'dtl-item-secondary' }, `+${item.lines.length - MAX_LINE_JUMPS}`) : null) : null)),
          more > 0 ? h('li', { key: 'more', className: 'dtl-item-more' }, fill(tt('lens.more'), more)) : null)
      }

      return AugmentedRow
    }

    const DICTS = {
      en: {
        'skill.title': 'Skill',
        'skill.preparing': 'Preparing to load a skill',
        'skill.running': 'Loading skill',
        'skill.failed': 'Skill load failed',
        'skill.stopped': 'Skill load stopped',
        'skill.instructions': 'Instructions',
        'skill.inspect': 'Inspect',
        'skill.open': 'Open SKILL.md in the side panel',
        'skill.openShort': 'Open in side panel',
        'skill.notFound': 'Skill file not found',
        'lens.actions': 'Tool lens actions',
        'lens.spill': 'Full output',
        'lens.spillTitle': 'The output was truncated. Open the full result in the side panel.',
        'lens.subagent': 'Conversation',
        'lens.subagentTitle': "Open this subagent's conversation in the side panel",
        'lens.files': '{n} files',
        'lens.filesTitle': 'List the result files; click one to open it in the side panel',
        'lens.sources': '{n} sources',
        'lens.browse': 'Browse',
        'lens.browseTitle': 'Open in the side-panel browser (Cmd/Ctrl-click for a new tab)',
        'lens.more': '{n} more not shown',
      },
      zh: {
        'skill.title': '加载技能',
        'skill.preparing': '准备加载技能',
        'skill.running': '正在加载技能',
        'skill.failed': '技能加载失败',
        'skill.stopped': '技能加载已中止',
        'skill.instructions': '说明',
        'skill.inspect': '查看',
        'skill.open': '在右侧打开 SKILL.md',
        'skill.openShort': '在右侧打开',
        'skill.notFound': '找不到技能文件',
        'lens.actions': '工具透镜操作',
        'lens.spill': '完整输出',
        'lens.spillTitle': '输出被截断，在右侧打开完整内容',
        'lens.subagent': '对话',
        'lens.subagentTitle': '在右侧打开这个子代理的对话',
        'lens.files': '{n} 个文件',
        'lens.filesTitle': '列出结果文件，点击在右侧打开',
        'lens.sources': '{n} 个来源',
        'lens.browse': '侧栏浏览',
        'lens.browseTitle': '在右侧浏览器打开（Cmd/Ctrl 点击用新标签页）',
        'lens.more': '还有 {n} 个未列出',
      },
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'remote', 'remote.skills', 'sidebarRight'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dict), `tool-lens: ${lang}`)
        }

        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-tool-lens'
          style.textContent = CSS_TEXT
          document.head.appendChild(style)
          return () => style.remove()
        }, 'tool-lens: styles')

        const resolver = createSkillResolver(ctx)
        ctx.on('connection/reset', resolver.clear)
        ctx.effect(() => {
          const offs = [
            ctx.remote.$on?.('agent-preset/selected', resolver.clear),
            ctx.remote.$on?.('plugin-manager/changed', resolver.clear),
          ]
          return () => {
            for (const off of offs) { try { off?.() } catch {} }
            resolver.clear()
          }
        }, 'tool-lens: skill catalog')

        const sessionInject = {
          skill: sessionId => ({
            async openSkill(name, baseDir) {
              const list = await resolver.catalog(sessionId)
              const path = list.find(skill => skill.name === name)?.path
                ?? (baseDir === undefined ? undefined : `${baseDir.replace(/[\\/]+$/, '')}/SKILL.md`)
              if (path === undefined) return false
              const cwd = ctx.sessions.list?.getSnapshot?.().byId?.[sessionId]?.cwd
              try {
                ctx.sidebarRight.openResource(fileAddressFor(sessionId, cwd, path))
                return true
              } catch (error) {
                console.error('[dsh-tool-lens] open skill failed:', error)
                return false
              }
            },
          }),
        }

        for (const lens of LENSES) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview',
            key: lens.key,
            priority: PRIORITY,
            locale: NS,
            ...(sessionInject[lens.key] ? { inject: sessionInject[lens.key] } : {}),
          }, lens.component))
        }

        const sessionDir = sessionId => {
          const live = ctx.sessions.binding?.(sessionId)?.session?.projections?.faceOf?.('workingDirectory')?.getSnapshot?.()
          if (typeof live === 'string' && live) return live
          const snap = ctx.sessions.list?.getSnapshot?.()
          const projected = snap?.projectionsBySession?.[sessionId]?.values?.workingDirectory
            ?? snap?.byId?.[sessionId]?.projectionValues?.workingDirectory
          if (typeof projected === 'string' && projected) return projected
          return snap?.byId?.[sessionId]?.cwd
        }

        const fileInject = sessionId => ({
          resolveFilePath: path => resolveFilePathFor(sessionDir(sessionId), path),
        })

        const AugmentedRow = createAugmentLens(ctx)
        for (const key of AUGMENTED) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            priority: AUGMENT_PRIORITY,
            locale: 'conversation',
            ...(FILE_INJECT_TOOLS.has(key) ? { inject: fileInject } : {}),
          }, AugmentedRow))
        }
      },
      _internal: {
        AUGMENTED,
        baseDirectory,
        failedToolSummary,
        fileAddressFor,
        spillPath,
        subagentChild,
        resolveSubagentAddress,
        searchFiles,
        lspLocations,
        webLinks,
      },
    }

    function encodeSegment(segment) { return encodeURIComponent(segment).replace(/%3A/gi, ':') }
    function sessionFileAddress(sessionId, path) {
      const normalized = path.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '')
      return `dsh-resource://file/session/${encodeSegment(sessionId)}/${normalized.split('/').map(encodeSegment).join('/')}`
    }
    function joinCwd(cwd, rel) {
      const rawBase = typeof cwd === 'string' ? cwd.replace(/\\/g, '/') : ''
      const base = rawBase.replace(/\/+$/, '') || (rawBase.startsWith('/') ? '/' : '')
      if (!base) return rel.replace(/^(?:\.\/)+/, '')
      const joined = base.endsWith('/') ? `${base}${rel}` : `${base}/${rel}`
      const prefixMatch = /^(?:[A-Za-z]:\/|\/\/[^/]+\/[^/]+\/|\/)/.exec(joined)
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
    function resolveFilePathFor(cwd, path) {
      if (typeof path !== 'string' || !path) return ''
      const normalized = path.replace(/\\/g, '/')
      const absolute = normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized) || normalized.startsWith('//')
      return absolute ? normalized : joinCwd(cwd, normalized)
    }
    function fileAddressFor(sessionId, cwd, path) {
      return sessionFileAddress(sessionId, resolveFilePathFor(cwd, path))
    }
  },
})
