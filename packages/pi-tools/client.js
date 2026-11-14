window.__ModuleLoader__.load({
  id: 'dsh-pi-tools',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, Checkbox, Input, Modal, IconChevronRightOutlineRegular, IconSearchOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const NS = 'pi-tools'
    const supported = new Set(['read', 'write', 'edit', 'codemode', 'tool_search'])
    const en = {
      tools: 'Tools', chooseTools: 'Tools for this conversation',
      toolsHint: 'Applies only to this conversation. The selection locks when its first turn starts.',
      defaults: 'Restore defaults', all: 'Select all', none: 'Clear', cancel: 'Cancel', save: 'Save', saving: 'Saving…',
      searchTools: 'Filter tools', loading: 'Loading tools…', noMatches: 'No matching tools', unavailable: 'Tool options are unavailable.',
      noGateway: 'Selected MCP tools need codemode or tool_search to become callable.',
      selectedCount: '{selected} of {total} selected', matchCount: '{count} matching', selectedOnly: 'Selected only',
      expandAll: 'Expand all', collapseAll: 'Collapse all', sectionCount: '{selected}/{total}',
      sectionToggle: '{section}: {selected} of {total} selected', filterExpanded: 'Shown expanded while filtering',
      selectSection: 'Select all in {section}', clearSection: 'Clear all in {section}',
      selectMatches: 'Select {count} shown in {section}', clearMatches: 'Clear {count} shown in {section}',
      familyPi: 'Pi', familyDsh: 'DSH', familyMcp: 'MCP', optInTag: 'opt-in',
      sectionPi: 'Pi coding tools', sectionAgents: 'Agents and delegation', sectionPlanning: 'Plans, goals and todos',
      sectionJobs: 'Jobs and schedules', sectionWeb: 'Web and search', sectionFiles: 'Presentation and Office',
      sectionInteraction: 'Skills and questions', sectionPlugins: 'Plugins', sectionOther: 'Other DSH tools',
      sectionMcpResources: 'MCP resources', sectionMcpServer: 'Server {server}',
      read: 'Read', write: 'Write', edit: 'Edit', codemode: 'Script', tool_search: 'Tool search',
      output: 'Output', written: 'Written content', diff: 'Applied diff', loaded: 'Loaded tools',
      calls: 'Tool calls', inspect: 'Inspect call', open: 'Open file', noCalls: 'No tool calls',
      ok: 'Succeeded', error: 'Failed', cancelled: 'Cancelled', running: 'Running', unknown: 'Unknown',
    }
    const zh = {
      tools: '工具', chooseTools: '本对话保留的工具',
      toolsHint: '仅影响当前新对话。第一轮开始后，工具选择会锁定。',
      defaults: '恢复默认', all: '全选', none: '清空', cancel: '取消', save: '保存', saving: '保存中…',
      searchTools: '筛选工具', loading: '正在加载工具…', noMatches: '没有匹配的工具', unavailable: '工具选项暂不可用。',
      noGateway: '已保留的 MCP 工具需要 codemode 或 tool_search 才能调用。',
      selectedCount: '已保留 {selected}/{total}', matchCount: '匹配 {count} 个', selectedOnly: '只看已保留',
      expandAll: '全部展开', collapseAll: '全部折叠', sectionCount: '{selected}/{total}',
      sectionToggle: '{section}：已保留 {selected}/{total}', filterExpanded: '筛选时自动展开',
      selectSection: '全选{section}', clearSection: '清空{section}',
      selectMatches: '选中{section}中显示的 {count} 个', clearMatches: '清空{section}中显示的 {count} 个',
      familyPi: 'Pi', familyDsh: 'DSH', familyMcp: 'MCP', optInTag: '非默认',
      sectionPi: 'Pi 编程工具', sectionAgents: '代理与委派', sectionPlanning: '计划、目标与待办',
      sectionJobs: '作业与定时', sectionWeb: '网页与搜索', sectionFiles: '展示与 Office',
      sectionInteraction: '技能与提问', sectionPlugins: '插件', sectionOther: '其他 DSH 工具',
      sectionMcpResources: 'MCP 资源', sectionMcpServer: '服务 {server}',
      read: '读取', write: '写入', edit: '编辑', codemode: '脚本', tool_search: '工具搜索',
      output: '输出', written: '写入内容', diff: '实际差异', loaded: '已加载工具',
      calls: '工具调用', inspect: '检查调用', open: '打开文件', noCalls: '未调用工具',
      ok: '成功', error: '失败', cancelled: '已取消', running: '运行中', unknown: '未知',
    }
    const css = `
.pi-tools-card{min-width:0;color:var(--dsw-alias-label-secondary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.pi-tools-head{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.pi-tools-card button{font:inherit;color:inherit;border:0;background:transparent;padding:0;cursor:pointer;text-align:left}
.pi-tools-card button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px;border-radius:3px}
.pi-tools-toggle{display:flex;align-items:center;gap:6px;flex:none}
.pi-tools-toggle span:first-child{width:14px;text-align:center}
.pi-tools-file{min-width:0;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
.pi-tools-summary{min-width:0;overflow-wrap:anywhere}
.pi-tools-badge{font-size:11px;color:var(--dsw-alias-label-secondary);margin-left:auto}
.pi-tools-body{margin:6px 0 8px 20px;min-width:0;color:var(--dsw-alias-label-primary)}
.pi-tools-body pre{margin:4px 0 8px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font:calc(var(--dsh-content-font-size-secondary,13px) - 1px)/1.6 var(--ds-font-family-code,monospace);white-space:pre;overflow:auto;max-height:420px}
.pi-tools-line{display:block;min-height:1.6em}
.pi-tools-number{display:inline-block;min-width:4ch;margin-right:14px;text-align:right;color:var(--dsw-alias-label-secondary);user-select:none}
.pi-tools-plus{color:var(--dsw-alias-state-success-primary)}
.pi-tools-minus,.pi-tools-error{color:var(--dsw-alias-state-error-primary)}
.pi-tools-note{font-size:12px;overflow-wrap:anywhere;color:var(--dsw-alias-label-secondary)}
.pi-tools-calls{list-style:none;padding:0;margin:0 0 8px}
.pi-tools-call{border-left:2px solid var(--dsw-alias-border-l1);padding:2px 0 2px 10px;margin:4px 0}
.pi-tools-call-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.pi-tools-call code,.pi-tools-loaded code{overflow-wrap:anywhere;font:calc(var(--dsh-content-font-size-secondary,13px) - 1px)/1.6 var(--ds-font-family-code,monospace)}
.pi-tools-loaded{padding-left:20px;margin:4px 0 8px}
.pi-tools-inspect{font-size:12px!important;text-decoration:underline;text-underline-offset:3px}
.pi-tools-picker{width:min(720px,100%);max-height:100%}
.pi-tools-picker .pi-tools-error{margin:10px 0 0;font-size:13px}
.pi-tools-options-toolbar{display:flex;gap:8px 14px;align-items:center;flex-wrap:wrap}
.pi-tools-options-filter{flex:1 1 260px;min-width:0}
.pi-tools-options-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:10px 0}
.pi-tools-options-count{margin-left:auto;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.pi-tools-options-warning{margin:0 0 10px;padding:8px 10px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label);font-size:12px;line-height:18px}
.pi-tools-options-list{max-height:min(52vh,520px);overflow:auto;overscroll-behavior:contain;border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,12px)}
.pi-tools-options-empty{margin:0;padding:16px 12px;font-size:13px;color:var(--dsw-alias-label-secondary)}
.pi-tools-section+.pi-tools-section{border-top:0.5px solid var(--dsw-alias-border-l3)}
.pi-tools-section-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:8px;padding:0 12px;background:var(--dsw-alias-bg-layer-2)}
.pi-tools-check{flex:none;width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}
.pi-tools-check:disabled{cursor:default;opacity:.5}
.pi-tools-check:focus-visible,.pi-tools-section-toggle:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px;border-radius:4px}
.pi-tools-section-toggle{flex:1;min-width:0;display:flex;align-items:center;gap:8px;min-height:40px;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;font-weight:500;text-align:left;cursor:pointer}
.pi-tools-section-toggle:disabled{cursor:default}
.pi-tools-section-chevron{flex:none;color:var(--dsw-alias-label-tertiary);transition:transform var(--ds-transition-duration,150ms) var(--ds-ease-in-out,ease)}
.pi-tools-section-toggle[aria-expanded=true] .pi-tools-section-chevron{transform:rotate(90deg)}
.pi-tools-section-toggle:disabled .pi-tools-section-chevron{opacity:.4}
.pi-tools-section-family{flex:none;padding:0 6px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px}
.pi-tools-section-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pi-tools-section-count{margin-left:auto;flex:none;font-size:12px;font-weight:400;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.pi-tools-section-list{list-style:none;margin:0;padding:0 0 6px}
.pi-tools-option-label{display:flex;gap:10px;align-items:flex-start;padding:6px 12px 6px 36px;cursor:pointer}
.pi-tools-option-label .pi-tools-check{margin-top:2px}
.pi-tools-option-label:has(.pi-tools-check:disabled){cursor:default}
.pi-tools-option-text{min-width:0;display:flex;flex-direction:column;gap:2px}
.pi-tools-option-name{display:flex;gap:6px;align-items:center;flex-wrap:wrap;color:var(--dsw-alias-label-primary);font:13px/20px var(--ds-font-family-code,monospace);overflow-wrap:anywhere}
.pi-tools-option-tag{padding:0 5px;border:0.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xs,4px);color:var(--dsw-alias-label-tertiary);font:11px/16px var(--ds-font-family,inherit)}
.pi-tools-option-description{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
@media(hover:hover){.pi-tools-option-label:hover{background:var(--dsw-alias-interactive-bg-hover)}}
@media(prefers-reduced-motion:reduce){.pi-tools-section-chevron{transition:none}}
@media(max-width:560px){.pi-tools-options-count{margin-left:0;flex-basis:100%}.pi-tools-option-label{padding-left:12px}.pi-tools-section-family{display:none}.pi-tools-options-list{max-height:min(46vh,520px)}}
@media(max-width:520px){.pi-tools-body{margin-left:0}.pi-tools-badge{margin-left:0}.pi-tools-file{flex-basis:100%}}
`

    // The selector admits only this adapter's successful text results. Other
    // presets, preparation, failures and image-bearing calls keep DSH's views.
    function select(owner) {
      if (owner.phase !== 'result' || owner.block.isError || owner.block.meta?.piVersion !== '1.5.0'
        || !supported.has(owner.toolName) || owner.block.content.some(block => block.type !== 'text')) return null
      let args
      try { args = JSON.parse(owner.block.call?.argsRaw ?? '') } catch { return null }
      if (!args || typeof args !== 'object' || Array.isArray(args)) return null
      return { args, details: owner.block.meta.pi ?? {}, file: owner.block.meta.piFile }
    }

    function duration(ms) {
      return typeof ms === 'number' && Number.isFinite(ms) && ms >= 0
        ? ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s` : ''
    }

    // Group subcalls by name in first-call order, e.g. "grep × 2, read".
    function callSummary(calls, t) {
      if (!calls.length) return t('noCalls')
      const counts = new Map()
      for (const call of calls) {
        const name = typeof call?.name === 'string' && call.name ? call.name : '?'
        counts.set(name, (counts.get(name) ?? 0) + 1)
      }
      return [...counts].map(([name, count]) => count > 1 ? `${name} × ${count}` : name).join(', ')
    }

    function pathLabel(path, cwd, home) {
      if (cwd && path.startsWith(`${cwd}/`)) return path.slice(cwd.length + 1)
      if (home && path.startsWith(`${home}/`)) return `~/${path.slice(home.length + 1)}`
      return path
    }

    function textBlock(text, label) {
      return h('pre', { tabIndex: 0, 'aria-label': label }, text)
    }

    function readBody(text, args, details, line, label) {
      if (details.truncation?.firstLineExceedsLimit) return textBlock(text, label)
      const truncated = details.truncation?.content
      const suffix = /\n\n\[\d+ more lines in file\. Use offset=\d+ to continue\.\]$/.exec(text)
      // Use native truncation metadata; a user-limit notice has exactly the
      // requested line count before its suffix. Never number the notice itself.
      const limited = Number.isInteger(args.limit) && suffix
        && text.slice(0, suffix.index).split('\n').length === args.limit
      const body = typeof truncated === 'string' ? truncated : limited ? text.slice(0, suffix.index) : text
      const notice = text.startsWith(body) ? text.slice(body.length).trim() : ''
      return h(React.Fragment, null,
        h('pre', { tabIndex: 0, 'aria-label': label }, body.split('\n').map((value, index) =>
          h('span', { className: 'pi-tools-line', key: index },
            h('span', { className: 'pi-tools-number', 'aria-hidden': true }, line + index), value || '\u200b'))),
        notice ? h('div', { className: 'pi-tools-note' }, notice) : null)
    }

    function PiCard({ matched, toolName, block, callId, cwd, home, openFile, inspect, useDisclosure, t }) {
      const { expanded, toggle } = useDisclosure()
      const { args, details, file } = matched
      const path = typeof file?.path === 'string' ? file.path : typeof args.path === 'string' ? args.path : ''
      const requestedLine = file?.line ?? (toolName === 'edit' ? details.firstChangedLine : args.offset)
      const line = Number.isInteger(requestedLine) && requestedLine > 0 ? requestedLine : 1
      const text = block.content.map(item => item.text).join('\n')
      const calls = Array.isArray(details.calls) ? details.calls : []
      const loaded = Array.isArray(details.loaded) ? details.loaded.filter(name => typeof name === 'string') : []
      const bodyId = `pi-tool-body-${callId}`
      const summary = toolName === 'codemode' ? callSummary(calls, t)
        : toolName === 'tool_search' ? `${t('loaded')}: ${loaded.length}` : ''
      const elapsed = duration(block.time - block.callTime)
      let body
      if (!expanded) {
        body = null
      } else if (toolName === 'read') {
        body = readBody(text, args, details, line, t('read'))
      } else if (toolName === 'edit' && typeof details.diff === 'string') {
        body = h(React.Fragment, null,
          h('div', { className: 'pi-tools-note' }, t('diff')),
          h('pre', { tabIndex: 0, 'aria-label': t('diff') }, details.diff.split('\n').map((value, index) =>
            h('span', { key: index, className: `pi-tools-line${value.startsWith('+') ? ' pi-tools-plus' : value.startsWith('-') ? ' pi-tools-minus' : ''}` }, value || '\u200b'))))
      } else if (toolName === 'write' && typeof args.content === 'string') {
        body = h(React.Fragment, null, h('div', { className: 'pi-tools-note' }, t('written')), textBlock(args.content, t('written')))
      } else if (toolName === 'codemode') {
        body = h(React.Fragment, null,
          calls.length ? h('ul', { className: 'pi-tools-calls' }, calls.map((call, index) =>
            h('li', { className: 'pi-tools-call', key: `${call.id ?? ''}:${index}` },
              h('div', { className: 'pi-tools-call-head' },
                h('code', null, call.name),
                h('span', { className: call.status === 'error' || call.status === 'cancelled' ? 'pi-tools-error' : 'pi-tools-note' },
                  t(['ok', 'error', 'cancelled', 'running'].includes(call.status) ? call.status : 'unknown')),
                h('span', { className: 'pi-tools-note' }, duration(call.durationMs))),
              typeof call.error === 'string' ? h('div', { className: 'pi-tools-error' }, call.error) : null)))
            : h('div', { className: 'pi-tools-note' }, t('noCalls')),
          textBlock(text, t('output')))
      } else if (toolName === 'tool_search') {
        body = h(React.Fragment, null,
          h('ul', { className: 'pi-tools-loaded' }, loaded.map(name => h('li', { key: name }, h('code', null, name)))),
          textBlock(text, t('output')))
      } else {
        body = textBlock(text, t('output'))
      }
      return h('div', { className: 'pi-tools-card', 'data-pi-tool': toolName },
        h('div', { className: 'pi-tools-head' },
          h('button', { type: 'button', className: 'pi-tools-toggle', onClick: toggle, 'aria-expanded': expanded, 'aria-controls': bodyId },
            h('span', { 'aria-hidden': true }, expanded ? '▾' : '▸'), h('span', null, t(toolName))),
          path ? h('button', { type: 'button', className: 'pi-tools-file', title: `${t('open')}: ${path}:${line}`, onClick: () => openFile(path, { line }) }, pathLabel(path, cwd, home), `:${line}`) : null,
          summary ? h('span', { className: 'pi-tools-summary' }, summary) : null,
          h('span', { className: 'pi-tools-badge' }, ['Pi', elapsed].filter(Boolean).join(' · '))),
        expanded ? h('div', { className: 'pi-tools-body', id: bodyId }, body,
          inspect ? h('button', { type: 'button', className: 'pi-tools-inspect', onClick: inspect }, t('inspect')) : null) : null)
    }

    const OPTIONS_PATH = 'pi-tools/options'

    async function optionsRequest(init) {
      const response = await fetch(init?.body ? OPTIONS_PATH : init.url, {
        method: init?.body ? 'POST' : 'GET',
        headers: { accept: 'application/json', ...init?.body ? { 'content-type': 'application/json' } : {} },
        ...init?.body ? { body: JSON.stringify(init.body) } : {},
      })
      const value = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(value.message || `HTTP ${response.status}`)
      return value
    }

    // Stock DSH renders this row only for a blank Session. The Host decides
    // whether the Session belongs to a Pi preset and is still editable.
    const CARD_KEYS = ['codemode', 'tool_search']

    // A keyed view must render every call of its name: unmatched phases
    // (preparing, running, failed, images) use a plain status row.
    function PiPlainRow({ toolName, phase, block, inspect, t }) {
      const failed = phase === 'result' && block?.isError
      const status = phase === 'result' ? (failed ? 'error' : 'ok') : 'running'
      const text = phase === 'result' && Array.isArray(block?.content)
        ? block.content.filter(item => item.type === 'text').map(item => item.text).join('\n') : ''
      return h('div', { className: 'pi-tools-card', 'data-pi-tool': toolName },
        h('div', { className: 'pi-tools-head' },
          h('span', null, t(toolName)),
          h('span', { className: failed ? 'pi-tools-error' : 'pi-tools-note' }, t(status)),
          inspect ? h('button', { type: 'button', className: 'pi-tools-inspect', onClick: inspect }, t('inspect')) : null),
        failed && text ? h('div', { className: 'pi-tools-body' }, textBlock(text, t('output'))) : null)
    }

    function PiToolView(props) {
      const matched = select(props)
      if (matched) return h(PiCard, { ...props, matched })
      return h(PiPlainRow, props)
    }

    function PiToolOptions({ sessionId, useSessions, t }) {
      const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset)
      const [state, setState] = React.useState({ status: 'loading' })
      const load = React.useCallback(async () => {
        try {
          const value = await optionsRequest({ url: `${OPTIONS_PATH}?sessionId=${encodeURIComponent(sessionId)}` })
          setState({ status: 'live', value })
          return value
        } catch (failure) {
          setState({ status: 'failed', failure })
          return undefined
        }
      }, [sessionId])
      React.useEffect(() => { void load() }, [load, preset])
      const value = state.status === 'live' ? state.value : undefined
      if (!value?.applicable || !value.editable) return null
      const save = async tools => {
        try {
          await optionsRequest({ body: { sessionId, tools } })
          await load()
          return undefined
        } catch (failure) {
          return failure instanceof Error ? failure.message : String(failure)
        }
      }
      return h(PiToolPicker, { catalog: value.catalog, committed: value.tools, reload: load, save, t })
    }

    // Presentation-only sections. The catalog's group still decides Pi / DSH /
    // MCP membership; unknown DSH tools fall back to "Other".
    const DSH_SECTIONS = [
      ['agents', ['subagent', 'subagent_fork', 'list_subagent_models', 'send_message', 'list_agents', 'wait_agent', 'workflow']],
      ['planning', ['todo_write', 'create_goal', 'get_goal', 'update_goal', 'exit_plan_mode']],
      ['jobs', ['job_list', 'job_output', 'job_kill', 'schedule_create', 'schedule_list', 'schedule_view', 'schedule_edit']],
      ['web', ['web_fetch', 'web_search', 'grok_search', 'openai_search']],
      ['files', ['present', 'office_render', 'office_convert', 'office_recalculate']],
      ['interaction', ['skill', 'ask_user_question']],
      ['plugins', ['plugin_manager', 'plugin_market', 'cordis_inspect_list', 'cordis_inspect_query']],
    ]
    const DSH_SECTION_OF = new Map(DSH_SECTIONS.flatMap(([id, names]) => names.map(name => [name, id])))
    const DSH_PREFIXES = [['job_', 'jobs'], ['schedule_', 'jobs'], ['office_', 'files'], ['subagent', 'agents']]
    const DSH_ORDER = [...DSH_SECTIONS.map(([id]) => id), 'other']
    const LARGE_CATALOG = 16

    function sectionOf(tool) {
      if (tool.group === 'pi') return { id: 'pi', family: 'familyPi', key: 'sectionPi', rank: 0, sort: '' }
      if (tool.group === 'mcp') {
        const server = /^mcp__(.+?)__/.exec(tool.name)?.[1]
        return server
          ? { id: `mcp:${server}`, family: 'familyMcp', key: 'sectionMcpServer', params: { server }, rank: 100, sort: server }
          : { id: 'mcp:resources', family: 'familyMcp', key: 'sectionMcpResources', rank: 200, sort: '' }
      }
      const known = DSH_SECTION_OF.get(tool.name)
        ?? DSH_PREFIXES.find(([prefix]) => tool.name.startsWith(prefix))?.[1] ?? 'other'
      return { id: `dsh:${known}`, family: 'familyDsh', key: `section${known[0].toUpperCase()}${known.slice(1)}`,
        rank: 10 + DSH_ORDER.indexOf(known), sort: '' }
    }

    function buildSections(tools, t) {
      const sections = new Map()
      for (const tool of tools) {
        const section = sectionOf(tool)
        if (!sections.has(section.id)) {
          sections.set(section.id, { ...section, label: t(section.key, section.params), tools: [] })
        }
        sections.get(section.id).tools.push(tool)
      }
      return [...sections.values()].toSorted((a, b) => a.rank - b.rank || a.sort.localeCompare(b.sort))
    }

    // A native checkbox: the shared Checkbox primitive has no mixed state.
    // It changes only the rows passed in, so a filtered section never touches hidden tools.
    function SectionCheckbox({ rows, selected, labels, disabled, onChange }) {
      const ref = React.useRef(null)
      const count = rows.filter(tool => selected.has(tool.name)).length
      const all = rows.length > 0 && count === rows.length
      React.useEffect(() => {
        if (ref.current) ref.current.indeterminate = count > 0 && !all
      })
      return h('input', {
        ref, type: 'checkbox', className: 'pi-tools-check', checked: all,
        disabled: disabled || rows.length === 0, 'aria-label': all ? labels.clear : labels.select,
        title: all ? labels.clear : labels.select,
        onChange: () => onChange(rows.map(tool => tool.name), !all),
      })
    }

    function PiToolPicker({ catalog, committed, reload, save, t }) {
      const disabled = false
      const [open, setOpen] = React.useState(false)
      const [draft, setDraft] = React.useState(undefined)
      const [query, setQuery] = React.useState('')
      const [selectedOnly, setSelectedOnly] = React.useState(false)
      const [collapsed, setCollapsed] = React.useState({})
      const [saving, setSaving] = React.useState(false)
      const [error, setError] = React.useState(undefined)
      const uid = React.useId()
      const ready = Array.isArray(catalog?.tools) && Array.isArray(catalog?.defaults)
      const tools = ready ? catalog.tools : []
      const selected = draft ?? committed ?? (ready ? catalog.defaults : [])
      const selectedSet = new Set(selected)
      const defaults = new Set(ready ? catalog.defaults : [])
      const filter = query.trim().toLowerCase()
      const filtering = filter !== '' || selectedOnly
      const sections = buildSections(tools, t)
      // Filtering always shows every matching row, whatever the stored fold state.
      const folded = section => !filtering
        && (collapsed[section.id] ?? (tools.length > LARGE_CATALOG && section.id !== 'pi'))
      const shown = sections.map(section => ({
        ...section,
        rows: section.tools.filter(tool => (!selectedOnly || selectedSet.has(tool.name))
          && (!filter || `${tool.name} ${tool.description ?? ''} ${section.label}`.toLowerCase().includes(filter))),
      })).filter(section => !filtering || section.rows.length)
      const matchCount = shown.reduce((sum, section) => sum + section.rows.length, 0)
      const anyFolded = sections.some(folded)
      const noGateway = ready && catalog.mcpExposure !== 'direct'
        && !selectedSet.has('codemode') && !selectedSet.has('tool_search')
        && tools.some(tool => tool.group === 'mcp' && selectedSet.has(tool.name))
      // Keep the original order and any saved names that left the catalog.
      const setMany = (names, checked) => {
        const changed = new Set(names)
        setDraft(checked
          ? [...selected, ...names.filter(name => !selectedSet.has(name))]
          : selected.filter(name => !changed.has(name)))
      }
      const close = () => { if (!saving) setOpen(false) }
      const commit = async () => {
        if (!ready || saving || disabled) return
        setSaving(true)
        setError(undefined)
        try {
          const refusal = await save([...selected])
          if (refusal) setError(refusal)
          else setOpen(false)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setSaving(false)
        }
      }
      const status = [t('selectedCount', { selected: tools.filter(tool => selectedSet.has(tool.name)).length, total: tools.length }),
        filtering ? t('matchCount', { count: matchCount }) : ''].filter(Boolean).join(' · ')
      const renderSection = (section, index) => {
        const isFolded = folded(section)
        const headId = `${uid}-head-${index}`
        const bodyId = `${uid}-body-${index}`
        const count = section.tools.filter(tool => selectedSet.has(tool.name)).length
        const partial = filtering && section.rows.length !== section.tools.length
        return h('section', { key: section.id, className: 'pi-tools-section', 'aria-labelledby': headId },
          h('div', { className: 'pi-tools-section-head' },
            h(SectionCheckbox, {
              rows: section.rows, selected: selectedSet, disabled: saving, onChange: setMany,
              labels: partial
                ? { select: t('selectMatches', { count: section.rows.length, section: section.label }),
                    clear: t('clearMatches', { count: section.rows.length, section: section.label }) }
                : { select: t('selectSection', { section: section.label }), clear: t('clearSection', { section: section.label }) },
            }),
            h('button', {
              type: 'button', id: headId, className: 'pi-tools-section-toggle',
              'aria-expanded': !isFolded, 'aria-controls': bodyId, disabled: filtering,
              'aria-label': t('sectionToggle', { section: section.label, selected: count, total: section.tools.length }),
              title: filtering ? t('filterExpanded') : undefined,
              onClick: () => setCollapsed(state => ({ ...state, [section.id]: !isFolded })),
            },
            h(IconChevronRightOutlineRegular, { size: 14, className: 'pi-tools-section-chevron', 'aria-hidden': true }),
            h('span', { className: 'pi-tools-section-family', 'aria-hidden': true }, t(section.family)),
            h('span', { className: 'pi-tools-section-label', 'aria-hidden': true }, section.label),
            h('span', { className: 'pi-tools-section-count', 'aria-hidden': true },
              t('sectionCount', { selected: count, total: section.tools.length })))),
          h('ul', { id: bodyId, className: 'pi-tools-section-list', hidden: isFolded },
            isFolded ? null : section.rows.map(tool => {
              const descriptionId = `${uid}-desc-${tool.name}`
              return h('li', { key: tool.name, className: 'pi-tools-option' },
                h('label', { className: 'pi-tools-option-label' },
                  h('input', { type: 'checkbox', className: 'pi-tools-check', checked: selectedSet.has(tool.name), disabled: saving,
                    'aria-describedby': tool.description ? descriptionId : undefined,
                    onChange: event => setMany([tool.name], event.target.checked) }),
                  h('span', { className: 'pi-tools-option-text' },
                    h('span', { className: 'pi-tools-option-name' }, tool.name,
                      defaults.has(tool.name) ? null : h('span', { className: 'pi-tools-option-tag' }, t('optInTag'))),
                    tool.description ? h('span', { id: descriptionId, className: 'pi-tools-option-description', title: tool.description },
                      tool.description) : null)))
            })))
      }
      return h(React.Fragment, null,
        h(Button, { variant: 'ghost', disabled, onClick: () => {
          setDraft(undefined); setQuery(''); setSelectedOnly(false); setError(undefined); setOpen(true); void reload()
        } }, t('tools')),
        h(Modal, {
          open, onClose: close, title: t('chooseTools'), closeLabel: t('cancel'),
          description: t('toolsHint'), className: 'pi-tools-picker',
          footer: h(React.Fragment, null,
            h(Button, { variant: 'ghost', onClick: close, disabled: saving }, t('cancel')),
            h(Button, { variant: 'primary', onClick: commit, disabled: !ready || saving || disabled },
              t(saving ? 'saving' : 'save'))),
        },
        !ready ? h('p', { role: 'status' }, t('unavailable')) : h(React.Fragment, null,
          h('div', { className: 'pi-tools-options-toolbar' },
            h(Input, { type: 'search', className: 'pi-tools-options-filter', value: query,
              icon: h(IconSearchOutlineRegular, { size: 16 }),
              'aria-label': t('searchTools'), placeholder: t('searchTools'), 'data-modal-autofocus': true,
              onChange: event => setQuery(event.target.value) }),
            h(Checkbox, { label: t('selectedOnly'), checked: selectedOnly, disabled: saving, onChange: setSelectedOnly })),
          h('div', { className: 'pi-tools-options-actions' },
            h(Button, { variant: 'outline', size: 'sm', disabled: saving, onClick: () => setDraft([...catalog.defaults]) }, t('defaults')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: saving, onClick: () => setDraft(tools.map(tool => tool.name)) }, t('all')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: saving, onClick: () => setDraft([]) }, t('none')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: filtering || sections.length < 2,
              onClick: () => setCollapsed(Object.fromEntries(sections.map(section => [section.id, !anyFolded]))) },
            t(anyFolded ? 'expandAll' : 'collapseAll')),
            h('span', { className: 'pi-tools-options-count', role: 'status' }, status)),
          noGateway ? h('p', { className: 'pi-tools-options-warning' }, t('noGateway')) : null,
          h('div', { className: 'pi-tools-options-list' },
            shown.length ? shown.map(renderSection) : h('p', { className: 'pi-tools-options-empty' }, t('noMatches')))),
        error ? h('p', { role: 'alert', className: 'pi-tools-error' }, error) : null))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }))
        ctx.slots.inject('conversation.hero.options', () => ctx.slots.register({
          name: 'conversation.hero.options', id: 'pi-tools', locale: NS,
          inject: sessionId => ({ sessionId }),
        }, PiToolOptions))
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-pi-tools'
          style.textContent = css
          document.head.append(style)
          return () => style.remove()
        })
        // Stock DSH dispatches cards by tool name. Only names without a
        // built-in view are claimed; Pi read/write/edit keep DSH's own rows.
        ctx.slots.inject('tool.call.toolview', function* () {
          for (const key of CARD_KEYS) {
            yield ctx.slots.register({ name: 'tool.call.toolview', key, locale: NS }, PiToolView)
          }
        })
      },
    }
  },
})
