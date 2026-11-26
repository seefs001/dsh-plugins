window.__ModuleLoader__.load({
  id: 'dsh-pi-tools',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, Checkbox, CodeBlock, DiffBlock, DisclosureRow, Input, Modal, ReadBlock, SearchBlock, Tag, TerminalBlock, TextShimmer,
      diffTotals, languageForPath,
      IconApiOutlineRegular, IconBrowseOutlineRegular, IconChevronRightOutlineRegular, IconCodeOutlineRegular,
      IconEditOutlineRegular, IconInspectOutlineRegular, IconSearchOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const NS = 'pi-tools'
    const PI_VERSION = '1.6.0'
    const DIRECT_KEYS = ['codemode', 'tool_search', 'find', 'ls']
    const WRAPPED_KEYS = ['edit', 'write', 'read', 'grep', 'bash']
    const KILOBYTE = 1024
    const en = {
      tools: 'Tools', chooseTools: 'Tools for this conversation',
      toolsHint: 'Applies only to this conversation. The selection locks when its first turn starts.',
      defaults: 'Restore defaults', all: 'Select all', none: 'Clear', cancel: 'Cancel', save: 'Save', saving: 'Saving…',
      searchTools: 'Filter tools', noMatches: 'No matching tools', unavailable: 'Tool options are unavailable.',
      noGateway: 'Selected MCP tools need codemode or tool_search to become callable.',
      selectedCount: '{selected} of {total} selected', matchCount: '{count} matching', selectedOnly: 'Selected only',
      expandAll: 'Expand all', collapseAll: 'Collapse all', sectionCount: '{selected}/{total}',
      sectionToggle: '{section}: {selected} of {total} selected', filterExpanded: 'Shown expanded while filtering',
      selectSection: 'Select all in {section}', clearSection: 'Clear all in {section}',
      selectMatches: 'Select {count} shown in {section}', clearMatches: 'Clear {count} shown in {section}',
      familyPi: 'Pi', familyDsh: 'DSH', familyMcp: 'MCP', optInTag: 'opt-in',
      showDetails: 'Per-tool settings', showSimple: 'Simple view',
      saveDefaults: 'Set as default', resetDefaults: 'Use preset defaults', customDefaults: 'Custom defaults',
      defaultsSaved: 'Saved as the default for new conversations of this preset.', defaultsReset: 'Defaults reset to the preset configuration.',
      refreshMcp: 'Refresh MCP', refreshingMcp: 'Refreshing MCP…', mcpRefreshed: 'MCP refreshed: {summary}', mcpNone: 'No MCP servers to refresh.',
      simpleHint: 'Turn whole groups on or off. Open per-tool settings to pick single tools.',
      sectionPi: 'Pi coding tools', sectionAgents: 'Agents and delegation', sectionPlanning: 'Work, plans and goals',
      sectionJobs: 'Jobs and schedules', sectionWeb: 'Web, search and images', sectionFiles: 'Presentation and Office',
      sectionInteraction: 'Skills and questions', sectionPlugins: 'Plugins', sectionOther: 'Other DSH tools',
      sectionMcpResources: 'MCP resources', sectionMcpServer: 'Server {server}',
      codemode: 'Script', tool_search: 'Tool search', edit: 'Edit', write: 'Write', read: 'Read', grep: 'Search', find: 'Find files', ls: 'List directory', bash: 'Shell',
      input: 'IN', output: 'OUT', editDiff: 'Edit', diff: 'Applied diff', loaded: 'Loaded tools',
      inspect: 'Inspect', open: 'Open file', noCalls: 'No tool calls',
      stepProgress: '{done}/{total} steps', stepsFailed: '{count} failed',
      streamingKb: '{kb} KB',
      ok: 'Succeeded', error: 'Failed', running: 'Running', stopped: 'Stopped',
    }
    const zh = {
      tools: '工具', chooseTools: '本对话保留的工具',
      toolsHint: '仅影响当前新对话。第一轮开始后，工具选择会锁定。',
      defaults: '恢复默认', all: '全选', none: '清空', cancel: '取消', save: '保存', saving: '保存中…',
      searchTools: '筛选工具', noMatches: '没有匹配的工具', unavailable: '工具选项暂不可用。',
      noGateway: '已保留的 MCP 工具需要 codemode 或 tool_search 才能调用。',
      selectedCount: '已保留 {selected}/{total}', matchCount: '匹配 {count} 个', selectedOnly: '只看已保留',
      expandAll: '全部展开', collapseAll: '全部折叠', sectionCount: '{selected}/{total}',
      sectionToggle: '{section}：已保留 {selected}/{total}', filterExpanded: '筛选时自动展开',
      selectSection: '全选{section}', clearSection: '清空{section}',
      selectMatches: '选中{section}中显示的 {count} 个', clearMatches: '清空{section}中显示的 {count} 个',
      familyPi: 'Pi', familyDsh: 'DSH', familyMcp: 'MCP', optInTag: '非默认',
      showDetails: '逐个设置', showSimple: '精简视图',
      saveDefaults: '设为默认', resetDefaults: '恢复预设默认', customDefaults: '自定义默认',
      defaultsSaved: '已设为此预设新对话的默认工具。', defaultsReset: '默认工具已恢复为预设配置。',
      refreshMcp: '刷新 MCP', refreshingMcp: '正在刷新 MCP…', mcpRefreshed: 'MCP 已刷新：{summary}', mcpNone: '没有可刷新的 MCP 服务。',
      simpleHint: '按分组开关工具。需要单独挑选时，点「逐个设置」。',
      sectionPi: 'Pi 编程工具', sectionAgents: '代理与委派', sectionPlanning: '工作、计划与目标',
      sectionJobs: '作业与定时', sectionWeb: '网页、搜索与画图', sectionFiles: '展示与 Office',
      sectionInteraction: '技能与提问', sectionPlugins: '插件', sectionOther: '其他 DSH 工具',
      sectionMcpResources: 'MCP 资源', sectionMcpServer: '服务 {server}',
      codemode: '脚本', tool_search: '工具搜索', edit: '编辑', write: '写入', read: '读取', grep: '搜索', find: '查找文件', ls: '列出目录', bash: '终端',
      input: '输入', output: '输出', editDiff: '编辑', diff: '实际差异', loaded: '已加载工具',
      inspect: '查看', open: '打开文件', noCalls: '未调用工具',
      stepProgress: '{done}/{total} 步', stepsFailed: '{count} 步失败',
      streamingKb: '{kb} KB',
      ok: '成功', error: '失败', running: '运行中', stopped: '已中止',
    }
    const css = `
.pi-tools-card{display:flex;flex-direction:column;min-width:0}
[data-chat-call-id] > :not([data-subcalls]):has([data-pi-fold-steps="closed"]) ~ [data-subcalls]{display:none}
.pi-tools-row{min-width:0}
.pi-tools-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.pi-tools-file{flex:0 1 auto;min-width:0;max-width:100%;margin:0;padding:0;border:0;background:transparent;color:inherit;font:inherit;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));cursor:pointer;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-decoration:underline dotted;text-decoration-color:currentColor;text-decoration-thickness:1px;text-underline-offset:3px}
.pi-tools-file:focus-visible,.pi-tools-inspect:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px;border-radius:var(--dsw-radius-xs,4px)}
.pi-tools-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.pi-tools-suffix{flex:none;margin-left:4px;white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));font-variant-numeric:tabular-nums}
.pi-tools-diff-stat{margin-left:10px;font-family:var(--ds-font-family-code);font-size:calc(var(--dsh-content-font-size-secondary,13px) - 2px);transform:translateY(.5px)}
.pi-tools-row[aria-expanded=true] .pi-tools-diff-added{color:var(--dsw-alias-state-success-primary)}
.pi-tools-row[aria-expanded=true] .pi-tools-diff-removed{color:var(--dsw-alias-state-error-primary)}
@media(hover:hover){.pi-tools-row:hover .pi-tools-diff-added{color:var(--dsw-alias-state-success-primary)}.pi-tools-row:hover .pi-tools-diff-removed{color:var(--dsw-alias-state-error-primary)}}
.pi-tools-error{color:var(--dsw-alias-state-error-primary)}
.pi-tools-stopped{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.pi-tools-body{display:flex;flex-direction:column;min-width:0}
.pi-tools-block{margin:4px 0 4px 4px}
.pi-tools-terminal{margin:4px 0 4px 4px;--dsl-terminal-font:var(--dsw-font-markdown-code-block-small);--dsl-terminal-line-height:18px;--dsl-terminal-output-max-height:224px;--dsl-terminal-command-whitespace:pre-wrap;border:.5px solid var(--dsw-alias-border-l1)}
.pi-tools-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.pi-tools-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.pi-tools-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.pi-tools-io-sec::-webkit-scrollbar-track{margin:6px 0}
.pi-tools-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.pi-tools-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.pi-tools-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.pi-tools-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.pi-tools-loaded{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 4px 4px;padding:0;list-style:none}
.pi-tools-note{margin:4px 0 4px 4px;font:var(--dsw-font-xs-13);overflow-wrap:anywhere;color:var(--dsw-alias-label-tertiary)}
.pi-tools-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.pi-tools-inspect:focus-visible{opacity:1}
@media(hover:hover){.pi-tools-card:hover .pi-tools-inspect{opacity:1}.pi-tools-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media(hover:none){.pi-tools-inspect{opacity:1}}
.pi-tools-picker{width:min(720px,100%);max-height:100%}
.pi-tools-picker .pi-tools-error{margin:10px 0 0;font-size:13px}
.pi-tools-picker .pi-tools-notice{margin:10px 0 0;font-size:13px;color:var(--dsw-alias-label-secondary)}
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
.pi-tools-simple-row{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 12px;cursor:pointer;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.pi-tools-simple-row+.pi-tools-simple-row{border-top:0.5px solid var(--dsw-alias-border-l3)}
.pi-tools-simple-hint{margin:0 0 10px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.pi-tools-section-list{list-style:none;margin:0;padding:0 0 6px}
.pi-tools-option-label{display:flex;gap:10px;align-items:flex-start;padding:6px 12px 6px 36px;cursor:pointer}
.pi-tools-option-label .pi-tools-check{margin-top:2px}
.pi-tools-option-label:has(.pi-tools-check:disabled){cursor:default}
.pi-tools-option-text{min-width:0;display:flex;flex-direction:column;gap:2px}
.pi-tools-option-name{display:flex;gap:6px;align-items:center;flex-wrap:wrap;color:var(--dsw-alias-label-primary);font:13px/20px var(--ds-font-family-code,monospace);overflow-wrap:anywhere}
.pi-tools-option-tag{padding:0 5px;border:0.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xs,4px);color:var(--dsw-alias-label-tertiary);font:11px/16px var(--dsw-font-family,inherit)}
.pi-tools-option-description{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
@media(hover:hover){.pi-tools-simple-row:hover,.pi-tools-option-label:hover{background:var(--dsw-alias-interactive-bg-hover)}}
@media(prefers-reduced-motion:reduce){.pi-tools-section-chevron,.pi-tools-inspect{transition:none}}
@media(max-width:560px){.pi-tools-options-count{margin-left:0;flex-basis:100%}.pi-tools-option-label{padding-left:12px}.pi-tools-section-family{display:none}.pi-tools-options-list{max-height:min(46vh,520px)}}
`

    function isPiCall(owner) {
      if (DIRECT_KEYS.includes(owner.toolName)) return true
      if (owner.phase === 'result') return owner.block?.meta?.piVersion === PI_VERSION
      const args = owner.block?.args
      if (!args) return false
      if (owner.toolName === 'edit' || owner.toolName === 'write' || owner.toolName === 'read') {
        return Boolean(args.has?.('path') && !args.has?.('file_path'))
      }
      return false
    }

    function parseJson(raw) {
      if (typeof raw !== 'string' || !raw) return {}
      try {
        const value = JSON.parse(raw)
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
      } catch {
        return {}
      }
    }

    function rowState(phase, block) {
      if (phase === 'preparing') return 'preparing'
      if (phase !== 'result' || !block || !('kind' in block)) return 'running'
      if (block.error?.code === 'interrupted') return 'stopped'
      return block.isError ? 'error' : 'ok'
    }

    function resultText(block) {
      if (!block || !('kind' in block) || !Array.isArray(block.content)) return ''
      return block.content.filter(item => item.type === 'text').map(item => item.text).join('\n')
    }

    function firstLine(text) {
      if (typeof text !== 'string') return ''
      const index = text.indexOf('\n')
      return index === -1 ? text : text.slice(0, index)
    }

    function duration(ms) {
      return typeof ms === 'number' && Number.isFinite(ms) && ms >= 0
        ? ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s` : ''
    }

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

    function streamingKb(block, fields) {
      const args = block?.args
      if (!args?.has || !args?.stringLength) return null
      let chars = 0
      let seen = false
      for (const key of fields) {
        if (!args.has(key)) continue
        seen = true
        chars += args.stringLength(key, { step: KILOBYTE }) ?? 0
      }
      return seen ? Math.max(1, Math.ceil(chars / KILOBYTE)) : null
    }

    function toolIcon(toolName) {
      if (toolName === 'codemode') return h(IconCodeOutlineRegular, { size: 14 })
      if (toolName === 'edit' || toolName === 'write') return h(IconEditOutlineRegular, { size: 14 })
      if (toolName === 'read') return h(IconBrowseOutlineRegular, { size: 14 })
      if (toolName === 'bash') return h(IconApiOutlineRegular, { size: 14 })
      return h(IconSearchOutlineRegular, { size: 14 })
    }

    function convLabels(ct) {
      const code = { codeLabel: ct('codeBlock.title'), wrapLabel: ct('codeBlock.wrap'), unwrapLabel: ct('codeBlock.unwrap') }
      return {
        code,
        diff: {
          ...code, copy: ct('copy'), copied: ct('copied'),
          collapseAria: ct('diff.collapseAria'), expandAria: count => ct('diff.expandAria', { count }),
          collapse: ct('collapse'), expand: count => ct('diff.expandRest', { count }),
        },
        read: {
          ...code, window: (shown, total) => ct('read.window', { shown, total }),
          copy: ct('copy'), copied: ct('copied'),
          collapseAria: ct('read.collapseAria'), expandAria: count => ct('read.expandAria', { count }),
          collapse: ct('collapse'), expand: count => ct('read.expandRest', { count }),
        },
        search: {
          pathsSummary: (shown, total, truncated) => ct(truncated ? 'search.paths.truncated' : 'search.paths', { shown, total }),
          matchesSummary: (shown, total, files, truncated) => ct(truncated ? 'search.matches.truncated' : 'search.matches', { shown, total, files }),
          copy: ct('copy'), copied: ct('copied'), noResults: ct('search.noResults'),
          collapseAria: ct('search.collapseAria'), expandAria: count => ct('search.expandAria', { count }),
          collapse: ct('collapse'), expand: count => ct('search.expandRest', { count }),
        },
        terminal: {
          commandLine: line => ct('terminal.commandLine', { n: line }),
          signal: signal => ct('terminal.signal', { signal }),
          exitCode: exitCode => ct('terminal.exitCode', { code: exitCode }),
          noExitCode: ct('terminal.noExitCode'),
          running: ct('terminal.running'), failed: ct('terminal.failed'), done: ct('terminal.done'),
          copy: ct('copy'), copied: ct('copied'), noOutput: ct('terminal.noOutput'),
          collapseAria: ct('terminal.collapseAria'), collapse: ct('collapse'),
          expandAria: hidden => ct('terminal.expandAria', { n: hidden }),
          expand: hidden => ct('terminal.expandRest', { n: hidden }),
        },
      }
    }

    function stepSuffix(children, running, t) {
      if (!children?.length) return null
      const failed = children.filter(child => child.isError).length
      const progress = running ? t('stepProgress', {
        done: children.filter(child => child.kind === 'tool-result').length, total: children.length,
      }) : ''
      if (!progress && !failed) return null
      return h(React.Fragment, null,
        progress ? h(TextShimmer, { className: 'pi-tools-suffix' }, `· ${progress}`) : null,
        failed ? h(TextShimmer, { className: 'pi-tools-suffix pi-tools-error' }, `· ${t('stepsFailed', { count: failed })}`) : null)
    }

    function ioCard(sections) {
      const visible = sections.filter(item => item && item.text)
      if (!visible.length) return null
      return h('div', { className: 'pi-tools-io' },
        visible.map((item, index) => h(React.Fragment, { key: item.label },
          index > 0 ? h('span', { className: 'pi-tools-io-div', 'aria-hidden': true }) : null,
          h('div', { className: 'pi-tools-io-sec' },
            h('span', { className: 'pi-tools-io-label' }, item.label),
            h('span', { className: 'pi-tools-io-text', 'data-error': item.isError || undefined }, item.text)))))
    }

    function PiRow({ toolName, phase, block, cwd, home, sessionId, openFile, inspect, expanded, toggle, useContextMenu, t, ct }) {
      const { getTriggerProps } = useContextMenu()
      const settled = phase === 'result' && block && 'kind' in block
      const state = rowState(phase, block)
      const running = state === 'preparing' || state === 'running'
      const rawArgs = settled ? block.call?.argsRaw : block?.argsRaw
      const args = parseJson(rawArgs)
      const meta = settled && !block.isError && block.meta && typeof block.meta === 'object' ? block.meta : {}
      const details = meta.pi && typeof meta.pi === 'object' ? meta.pi : {}
      const file = meta.piFile && typeof meta.piFile === 'object' ? meta.piFile : undefined
      const text = settled ? resultText(block) : ''
      const labels = React.useMemo(() => convLabels(ct), [ct])

      const path = typeof file?.path === 'string' ? file.path
        : typeof meta.path === 'string' ? meta.path
          : typeof args.path === 'string' ? args.path
            : block?.args?.complete?.('path') ? block.args.text('path') : ''
      const requestedLine = file?.line ?? details.firstChangedLine ?? (typeof args.offset === 'number' ? args.offset : undefined)
      const line = Number.isInteger(requestedLine) && requestedLine > 0 ? requestedLine : undefined
      const diffs = Array.isArray(meta.diffs) && meta.diffs.length > 0 ? meta.diffs : null
      const totals = React.useMemo(() => (diffs ? diffTotals(diffs) : null), [diffs])
      const readLines = Array.isArray(meta.lines) && typeof meta.totalLines === 'number' ? meta.lines : null
      const searchMatches = meta.shape === 'matches' && Array.isArray(meta.files) ? meta.files : null
      const searchPaths = meta.shape === 'paths' && Array.isArray(meta.paths) ? meta.paths : null
      const calls = Array.isArray(details.calls) ? details.calls : []
      const loaded = Array.isArray(details.loaded) ? details.loaded.filter(name => typeof name === 'string') : []
      const elapsed = settled ? duration(block.time - block.callTime) : ''
      const kb = running
        ? streamingKb(block, toolName === 'codemode' ? ['code'] : toolName === 'write' ? ['content'] : toolName === 'edit' ? ['oldText', 'newText'] : [])
        : null
      const codeInput = toolName === 'codemode'
        ? (typeof args.code === 'string' ? args.code : block?.args?.text?.('code') ?? '')
        : ''
      const queryInput = toolName === 'tool_search'
        ? (typeof args.query === 'string' ? args.query : block?.args?.text?.('query') ?? '')
        : ''
      const commandInput = toolName === 'bash'
        ? (typeof args.command === 'string' ? args.command : block?.args?.text?.('command') ?? '')
        : ''

      let summary = ''
      if (state === 'stopped') summary = t('stopped')
      else if (state === 'error' && text) summary = firstLine(text)
      else if (toolName === 'codemode') summary = settled ? callSummary(calls, t) : firstLine(block?.args?.textPrefix?.('code', 120) ?? '')
      else if (toolName === 'tool_search') summary = settled && loaded.length ? loaded.slice(0, 4).join(', ') + (loaded.length > 4 ? ` +${loaded.length - 4}` : '') : firstLine(queryInput)
      else if (toolName === 'grep' || toolName === 'find') summary = firstLine(typeof args.pattern === 'string' ? args.pattern : block?.args?.text?.('pattern') ?? '')
      else if (toolName === 'ls') summary = path ? pathLabel(path, cwd, home) : '.'
      else if (toolName === 'bash') summary = firstLine(commandInput)

      const settledWithCue = state === 'error' || state === 'stopped'
      const isFileTool = (toolName === 'edit' || toolName === 'write' || toolName === 'read') && Boolean(path) && !settledWithCue
      const hasBody = state !== 'preparing' && Boolean(
        diffs || readLines || searchMatches || searchPaths || (toolName === 'bash' && (commandInput || text))
        || codeInput || queryInput || loaded.length || typeof details.diff === 'string' || text,
      )
      const open = expanded && hasBody
      const fileContextProps = isFileTool
        ? getTriggerProps(() => ({ kind: 'file', value: { sessionId, path, ...(line ? { line } : {}) } }))
        : undefined

      const collapsedContent = state === 'preparing' ? null : h(React.Fragment, null,
        isFileTool ? h(React.Fragment, null,
          h('span', { className: 'pi-tools-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
          h('button', {
            type: 'button',
            className: 'pi-tools-file',
            title: `${t('open')}: ${path}${line ? `:${line}` : ''}`,
            ...fileContextProps,
            onClick: event => { event.stopPropagation(); openFile(path, line ? { line } : undefined) },
            onKeyDown: event => {
              if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
              fileContextProps?.onKeyDown?.(event)
            },
          }, h(TextShimmer, null, `${pathLabel(path, cwd, home)}${line && toolName !== 'write' ? `:${line}` : ''}`)))
          : summary ? h(React.Fragment, null,
            h('span', { className: 'pi-tools-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
            h('span', { className: `pi-tools-summary${state === 'error' ? ' pi-tools-error' : state === 'stopped' ? ' pi-tools-stopped' : ''}` },
              h(TextShimmer, null, summary))) : null,
        !settledWithCue && kb !== null ? h(TextShimmer, { className: 'pi-tools-suffix' }, t('streamingKb', { kb })) : null,
        !settledWithCue && totals && state === 'ok' ? h(TextShimmer, { className: 'pi-tools-suffix pi-tools-diff-stat' },
          h('span', { className: 'pi-tools-diff-added' }, `+${totals.added}`), ' ',
          h('span', { className: 'pi-tools-diff-removed' }, `-${totals.removed}`)) : null,
        !settledWithCue && toolName === 'codemode' ? stepSuffix(block?.subCalls, running, t) : null,
        !settledWithCue && elapsed ? h(TextShimmer, { className: 'pi-tools-suffix' }, `· ${elapsed}`) : null)

      let body = null
      if (open) {
        if (diffs) {
          body = h(DiffBlock, { diffs, labels: labels.diff, maxLines: 12, className: 'pi-tools-block' })
        } else if (toolName === 'edit' && typeof details.diff === 'string') {
          body = h(CodeBlock, { code: details.diff, lang: 'diff', diff: true, copyLabel: ct('copy'), copiedLabel: ct('copied'), toolbarLabels: labels.code, className: 'pi-tools-block' })
        } else if (toolName === 'read' && readLines) {
          body = h(ReadBlock, {
            label: pathLabel(meta.path || path, cwd, home),
            lines: readLines,
            totalLines: meta.totalLines,
            lang: languageForPath(meta.path || path),
            labels: labels.read,
            maxLines: 12,
            className: 'pi-tools-block',
          })
        } else if (searchMatches) {
          body = h(SearchBlock, { kind: 'matches', files: searchMatches, total: meta.total ?? searchMatches.length, truncated: Boolean(meta.truncated), labels: labels.search, maxLines: 10, className: 'pi-tools-block' })
        } else if (searchPaths) {
          body = h(SearchBlock, { kind: 'paths', paths: searchPaths, total: meta.total ?? searchPaths.length, truncated: Boolean(meta.truncated), labels: labels.search, maxLines: 10, className: 'pi-tools-block' })
        } else if (toolName === 'bash') {
          body = h(TerminalBlock, {
            command: commandInput,
            cwd: meta.cwd || cwd,
            home,
            output: text,
            running,
            labels: labels.terminal,
            maxLines: Infinity,
            className: 'pi-tools-terminal',
          })
        } else if (toolName === 'codemode') {
          body = h(React.Fragment, null,
            codeInput ? h(CodeBlock, { code: codeInput, lang: 'javascript', copyLabel: ct('copy'), copiedLabel: ct('copied'), toolbarLabels: labels.code, className: 'pi-tools-block' }) : null,
            settled && !calls.length && !block.isError ? h('div', { className: 'pi-tools-note' }, t('noCalls')) : null,
            text ? ioCard([{ label: t('output'), text, isError: state === 'error' }]) : null)
        } else if (toolName === 'tool_search') {
          body = h(React.Fragment, null,
            loaded.length ? h('ul', { className: 'pi-tools-loaded' }, loaded.map(name => h('li', { key: name }, h(Tag, null, name)))) : null,
            ioCard([
              queryInput ? { label: t('input'), text: queryInput, isError: false } : null,
              text ? { label: t('output'), text, isError: state === 'error' } : null,
            ]))
        } else if (text) {
          body = ioCard([{ label: t('output'), text, isError: state === 'error' }])
        }
      }

      return h('div', {
        className: 'pi-tools-card',
        'data-pi-tool': toolName,
        'data-state': state,
        'data-pi-fold-steps': toolName === 'codemode' ? (open ? 'open' : 'closed') : undefined,
      },
      h(DisclosureRow, {
        rowClassName: 'pi-tools-row',
        icon: toolIcon(toolName),
        title: t(toolName),
        running,
        open,
        expandable: hasBody,
        expandOnRowClick: true,
        keepContentWhenOpen: true,
        onToggle: toggle,
        collapsedContent,
      },
      open ? h('div', { className: 'pi-tools-body' },
        body,
        inspect ? h('button', { type: 'button', className: 'pi-tools-inspect', onClick: inspect },
          h(IconInspectOutlineRegular), t('inspect')) : null) : null))
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

    function PiToolView({ nativeBase, nativeProps, ct, ...props }) {
      const disclosure = props.useDisclosure()
      if (nativeBase && !isPiCall(props)) {
        return h(nativeBase, { ...props, ...nativeProps, useDisclosure: () => disclosure })
      }
      return h(PiRow, { ...props, ...disclosure, ct })
    }

    function PiToolOptions({ sessionId, useSessions, t }) {
      const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset)
      return h(SessionOptions, { key: JSON.stringify([sessionId, preset]), sessionId, t })
    }

    function SessionOptions({ sessionId, t }) {
      const [state, setState] = React.useState({ status: 'loading' })
      const requestId = React.useRef(0)
      const load = React.useCallback(async () => {
        const id = ++requestId.current
        try {
          const value = await optionsRequest({ url: `${OPTIONS_PATH}?sessionId=${encodeURIComponent(sessionId)}` })
          if (id === requestId.current) setState({ status: 'live', value })
          return value
        } catch (failure) {
          if (id === requestId.current) setState(old => ({ ...old, status: 'failed', failure }))
          return undefined
        }
      }, [sessionId])
      React.useEffect(() => { void load(); return () => { requestId.current++ } }, [load])
      const value = state.value
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
      const act = async body => {
        const result = await optionsRequest({ body: { sessionId, ...body } })
        await load()
        return result
      }
      return h(React.Fragment, null, h(PiToolPicker, { catalog: value.catalog, committed: value.tools, reload: load, save, act, t }),
        state.failure ? h('span', { role: 'alert', className: 'pi-tools-error' }, t('unavailable'), ' ', state.failure.message) : null)
    }

    const DSH_SECTIONS = [
      ['agents', ['subagent', 'subagent_fork', 'list_subagent_models', 'send_message', 'list_agents', 'wait_agent', 'workflow']],
      ['planning', ['timeline_tree', 'timeline_tasks', 'timeline_pull', 'timeline_read', 'timeline_reply', 'create_goal', 'get_goal', 'update_goal', 'exit_plan_mode']],
      ['jobs', ['job_list', 'job_output', 'job_kill', 'schedule_create', 'schedule_list', 'schedule_view', 'schedule_edit']],
      ['web', ['web_fetch', 'web_search', 'grok_search', 'openai_search', 'openai_image', 'grok_image']],
      ['files', ['present', 'office_render', 'office_convert', 'office_recalculate']],
      ['interaction', ['skill', 'ask_user_question']],
      ['plugins', ['plugin_manager', 'plugin_market', 'cordis_inspect']],
    ]
    const DSH_SECTION_OF = new Map(DSH_SECTIONS.flatMap(([id, names]) => names.map(name => [name, id])))
    const DSH_PREFIXES = [['job_', 'jobs'], ['schedule_', 'jobs'], ['office_', 'files'], ['subagent', 'agents'], ['timeline_', 'planning']]
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

    // external: DSH Checkbox primitive lacks indeterminate state, so this uses a native checkbox
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

    const VIEW_KEY = 'dsh-pi-tools:picker-view'
    function readView() {
      try { return localStorage.getItem(VIEW_KEY) === 'detailed' ? 'detailed' : 'simple' } catch { return 'simple' }
    }
    function writeView(view) {
      try { localStorage.setItem(VIEW_KEY, view) } catch {}
    }

    function mcpSummary(servers, t) {
      if (!servers.length) return t('mcpNone')
      return t('mcpRefreshed', { summary: servers.map(server => server.state === 'connected'
        ? `${server.name} (${server.toolCount})` : `${server.name}: ${server.error ?? server.state}`).join(', ') })
    }

    function PiToolPicker({ catalog, committed, reload, save, act, t }) {
      const [view, setViewState] = React.useState(readView)
      const setView = next => { setViewState(next); writeView(next) }
      const simple = view === 'simple'
      const [open, setOpen] = React.useState(false)
      const [draft, setDraft] = React.useState(undefined)
      const [query, setQuery] = React.useState('')
      const [selectedOnly, setSelectedOnly] = React.useState(false)
      const [collapsed, setCollapsed] = React.useState({})
      const [saving, setSaving] = React.useState(false)
      const [error, setError] = React.useState(undefined)
      const [notice, setNotice] = React.useState(undefined)
      const [busy, setBusy] = React.useState(undefined)
      const uid = React.useId()
      const ready = Array.isArray(catalog?.tools) && Array.isArray(catalog?.defaults)
      const tools = ready ? catalog.tools : []
      const selected = draft ?? committed ?? (ready ? catalog.defaults : [])
      const selectedSet = new Set(selected)
      const defaults = new Set(ready ? catalog.defaults : [])
      const filter = query.trim().toLowerCase()
      const filtering = filter !== '' || selectedOnly
      const sections = buildSections(tools, t)
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
      const setMany = (names, checked) => {
        const changed = new Set(names)
        setDraft(checked
          ? [...selected, ...names.filter(name => !selectedSet.has(name))]
          : selected.filter(name => !changed.has(name)))
      }
      const locked = saving || Boolean(busy)
      const close = () => { if (!locked) setOpen(false) }
      const run = async (kind, body, describe) => {
        if (!ready || locked) return
        setBusy(kind)
        setError(undefined)
        setNotice(undefined)
        try {
          setNotice(describe(await act(body)))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(undefined)
        }
      }
      const saveDefaults = () => run('defaults', { action: 'save-defaults', tools: [...selected] }, () => t('defaultsSaved'))
      const resetDefaults = () => run('defaults', { action: 'save-defaults', tools: null }, () => t('defaultsReset'))
      const refreshMcp = () => run('mcp', { action: 'refresh-mcp' }, result => mcpSummary(result?.servers ?? [], t))
      const extraActions = h(React.Fragment, null,
        h(Button, { variant: 'ghost', size: 'sm', disabled: locked, onClick: saveDefaults }, t('saveDefaults')),
        catalog?.customDefaults
          ? h(Button, { variant: 'ghost', size: 'sm', disabled: locked, onClick: resetDefaults, title: t('customDefaults') }, t('resetDefaults'))
          : null,
        h(Button, { variant: 'ghost', size: 'sm', disabled: locked, onClick: refreshMcp },
          t(busy === 'mcp' ? 'refreshingMcp' : 'refreshMcp')))
      const commit = async () => {
        if (!ready || locked) return
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
      const renderSimpleRow = section => {
        const count = section.tools.filter(tool => selectedSet.has(tool.name)).length
        return h('label', { key: section.id, className: 'pi-tools-simple-row',
          title: section.tools.map(tool => tool.name).join(', ') },
        h(SectionCheckbox, {
          rows: section.tools, selected: selectedSet, disabled: locked, onChange: setMany,
          labels: { select: t('selectSection', { section: section.label }), clear: t('clearSection', { section: section.label }) },
        }),
        h('span', { className: 'pi-tools-section-family', 'aria-hidden': true }, t(section.family)),
        h('span', { className: 'pi-tools-section-label' }, section.label),
        h('span', { className: 'pi-tools-section-count' },
          t('sectionCount', { selected: count, total: section.tools.length })))
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
              rows: section.rows, selected: selectedSet, disabled: locked, onChange: setMany,
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
                  h('input', { type: 'checkbox', className: 'pi-tools-check', checked: selectedSet.has(tool.name), disabled: locked,
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
        h(Button, { variant: 'ghost', onClick: () => {
          setDraft(undefined); setQuery(''); setSelectedOnly(false); setError(undefined); setNotice(undefined); setOpen(true); void reload()
        } }, t('tools')),
        h(Modal, {
          open, onClose: close, title: t('chooseTools'), closeLabel: t('cancel'),
          description: t('toolsHint'), className: 'pi-tools-picker',
          footer: h(React.Fragment, null,
            h(Button, { variant: 'ghost', onClick: close, disabled: locked }, t('cancel')),
            h(Button, { variant: 'primary', onClick: commit, disabled: !ready || locked },
              t(saving ? 'saving' : 'save'))),
        },
        !ready ? h('p', { role: 'status' }, t('unavailable')) : simple ? h(React.Fragment, null,
          h('p', { className: 'pi-tools-simple-hint' }, t('simpleHint')),
          h('div', { className: 'pi-tools-options-actions' },
            h(Button, { variant: 'outline', size: 'sm', disabled: locked, onClick: () => setDraft([...catalog.defaults]) }, t('defaults')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: locked, onClick: () => setView('detailed') }, t('showDetails')),
            extraActions,
            h('span', { className: 'pi-tools-options-count', role: 'status' }, status)),
          noGateway ? h('p', { className: 'pi-tools-options-warning' }, t('noGateway')) : null,
          h('div', { className: 'pi-tools-options-list' },
            sections.length ? sections.map(renderSimpleRow) : h('p', { className: 'pi-tools-options-empty' }, t('noMatches')))
        ) : h(React.Fragment, null,
          h('div', { className: 'pi-tools-options-toolbar' },
            h(Input, { type: 'search', className: 'pi-tools-options-filter', value: query,
              icon: h(IconSearchOutlineRegular, { size: 16 }),
              'aria-label': t('searchTools'), placeholder: t('searchTools'), 'data-modal-autofocus': true,
              onChange: event => setQuery(event.target.value) }),
            h(Checkbox, { label: t('selectedOnly'), checked: selectedOnly, disabled: locked, onChange: setSelectedOnly })),
          h('div', { className: 'pi-tools-options-actions' },
            h(Button, { variant: 'outline', size: 'sm', disabled: locked, onClick: () => setDraft([...catalog.defaults]) }, t('defaults')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: locked, onClick: () => setDraft(tools.map(tool => tool.name)) }, t('all')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: locked, onClick: () => setDraft([]) }, t('none')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: locked || filtering || sections.length < 2,
              onClick: () => setCollapsed(Object.fromEntries(sections.map(section => [section.id, !anyFolded]))) },
            t(anyFolded ? 'expandAll' : 'collapseAll')),
            h(Button, { variant: 'ghost', size: 'sm', disabled: locked,
              onClick: () => { setQuery(''); setSelectedOnly(false); setView('simple') } }, t('showSimple')),
            extraActions,
            h('span', { className: 'pi-tools-options-count', role: 'status' }, status)),
          noGateway ? h('p', { className: 'pi-tools-options-warning' }, t('noGateway')) : null,
          h('div', { className: 'pi-tools-options-list' },
            shown.length ? shown.map(renderSection) : h('p', { className: 'pi-tools-options-empty' }, t('noMatches')))),
        notice ? h('p', { role: 'status', className: 'pi-tools-notice' }, notice) : null,
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
        ctx.slots.inject('tool.call.toolview', function* () {
          const ct = ctx.locale.bind('conversation')
          for (const key of DIRECT_KEYS) {
            yield ctx.slots.register({
              name: 'tool.call.toolview', key, locale: NS,
              inject: () => ({ ct }),
            }, PiToolView)
          }
          // external: DSH stock toolviews expect native tool meta shapes; priority -1 handles Pi calls and delegates others
          for (const key of WRAPPED_KEYS) {
            yield ctx.slots.register({
              name: 'tool.call.toolview', key, priority: -1, locale: NS,
              inject: sessionId => {
                const base = ctx.slots.entries('tool.call.toolview').find(entry =>
                  entry.options.key === key && (entry.options.priority ?? 0) >= 0)
                return {
                  ct,
                  ...(base ? {
                    nativeBase: base.component,
                    nativeProps: { ...base.inject?.(sessionId), t: ctx.locale.bind(base.locale ?? 'conversation') },
                  } : {}),
                }
              },
            }, PiToolView)
          }
        })
      },
      _internal: { isPiCall, parseJson, rowState, duration, callSummary, pathLabel, streamingKb, PiRow, PiToolView, DIRECT_KEYS, WRAPPED_KEYS },
    }
  },
})
