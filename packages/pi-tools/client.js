window.__ModuleLoader__.load({
  id: 'dsh-pi-tools',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { Button, Checkbox, Modal } = require('@deepseek-ai/dsh-client-ui-primitives')
    const NS = 'pi-tools'
    const supported = new Set(['read', 'write', 'edit', 'codemode', 'tool_search'])
    const en = {
      tools: 'Tools', chooseTools: 'Tools for this conversation',
      toolsHint: 'Applies only to this conversation. The selection locks when its first turn starts.',
      defaults: 'Restore defaults', all: 'Select all', none: 'Clear', cancel: 'Cancel', save: 'Save', saving: 'Saving…',
      piGroup: 'Pi tools', harnessGroup: 'Additional DSH tools', mcpGroup: 'MCP tools', searchTools: 'Filter tools',
      selected: 'Selected', loading: 'Loading tools…', noMatches: 'No matching tools', unavailable: 'Tool options are unavailable.',
      noGateway: 'Selected MCP tools need codemode or tool_search to become callable.',
      read: 'Read', write: 'Write', edit: 'Edit', codemode: 'Script', tool_search: 'Tool search',
      output: 'Output', written: 'Written content', diff: 'Applied diff', loaded: 'Loaded tools',
      calls: 'Tool calls', inspect: 'Inspect call', open: 'Open file', noCalls: 'No tool calls',
      ok: 'Succeeded', error: 'Failed', cancelled: 'Cancelled', running: 'Running', unknown: 'Unknown',
    }
    const zh = {
      tools: '工具', chooseTools: '本对话保留的工具',
      toolsHint: '仅影响当前新对话。第一轮开始后，工具选择会锁定。',
      defaults: '恢复默认', all: '全选', none: '清空', cancel: '取消', save: '保存', saving: '保存中…',
      piGroup: 'Pi 工具', harnessGroup: '额外的 DSH 工具', mcpGroup: 'MCP 工具', searchTools: '筛选工具',
      selected: '已保留', loading: '正在加载工具…', noMatches: '没有匹配的工具', unavailable: '工具选项暂不可用。',
      noGateway: '已保留的 MCP 工具需要 codemode 或 tool_search 才能调用。',
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
.pi-tools-picker{width:min(640px,calc(100vw - 48px))}
.pi-tools-options-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}
.pi-tools-options-filter{box-sizing:border-box;width:100%;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit}
.pi-tools-options-list{max-height:50vh;overflow:auto;overscroll-behavior:contain}
.pi-tools-options-list fieldset{border:0;min-width:0;margin:12px 0;padding:0}
.pi-tools-options-list legend{font-weight:600;margin-bottom:8px}
.pi-tools-option{padding:7px 0;overflow-wrap:anywhere}
.pi-tools-option label{align-items:flex-start}
.pi-tools-option-description{margin:3px 0 0 26px;font-size:12px;color:var(--dsw-alias-label-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
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
      const summary = toolName === 'codemode' ? `${t('calls')}: ${calls.length}`
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

    function PiToolOptions(props) {
      return props.agentPreset === 'pi' ? h(PiToolPicker, props) : null
    }

    function PiToolPicker({ options, disabled, save, t, useResource }) {
      const [open, setOpen] = React.useState(false)
      const [draft, setDraft] = React.useState(undefined)
      const [query, setQuery] = React.useState('')
      const [saving, setSaving] = React.useState(false)
      const [error, setError] = React.useState(undefined)
      const resource = useResource(open ? 'dsh-resource://pi-tool-options/catalog' : '')
      const catalog = resource.status === 'live' ? resource.value?.[NS] : undefined
      const ready = Array.isArray(catalog?.tools) && Array.isArray(catalog?.defaults)
      const tools = ready ? catalog.tools : []
      const selected = draft ?? options[NS]?.tools ?? (ready ? catalog.defaults : [])
      const groupOf = tool => tool.group === 'pi' || tool.group === 'mcp' ? tool.group : 'harness'
      const filter = query.trim().toLowerCase()
      const visible = tools.filter(tool => `${tool.name} ${tool.description}`.toLowerCase().includes(filter))
      const noGateway = ready && catalog.mcpExposure !== 'direct'
        && !selected.includes('codemode') && !selected.includes('tool_search')
        && tools.some(tool => groupOf(tool) === 'mcp' && selected.includes(tool.name))
      const close = () => { if (!saving) setOpen(false) }
      const commit = async () => {
        if (!ready || saving || disabled) return
        setSaving(true)
        setError(undefined)
        try {
          const refusal = await save({ ...options, [NS]: { tools: [...selected] } })
          if (refusal) setError(refusal)
          else setOpen(false)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setSaving(false)
        }
      }
      return h(React.Fragment, null,
        h(Button, { variant: 'ghost', disabled, onClick: () => {
          setDraft(undefined); setQuery(''); setError(undefined); setOpen(true)
        } }, t('tools')),
        h(Modal, {
          open, onClose: close, title: t('chooseTools'), closeLabel: t('cancel'),
          description: t('toolsHint'), className: 'pi-tools-picker',
          footer: h(React.Fragment, null,
            h(Button, { variant: 'ghost', onClick: close, disabled: saving }, t('cancel')),
            h(Button, { variant: 'primary', onClick: commit, disabled: !ready || saving || disabled },
              t(saving ? 'saving' : 'save'))),
        },
        !ready ? h('p', { role: resource.status === 'failed' ? 'alert' : 'status' },
          resource.status === 'failed' ? resource.failure.message
            : t(resource.status === 'loading' ? 'loading' : 'unavailable')) : h(React.Fragment, null,
          h('input', { type: 'search', className: 'pi-tools-options-filter', value: query,
            'aria-label': t('searchTools'), placeholder: t('searchTools'), 'data-modal-autofocus': true,
            onChange: event => setQuery(event.target.value) }),
          h('div', { className: 'pi-tools-options-actions' },
            h(Button, { variant: 'outline', disabled: saving, onClick: () => setDraft([...catalog.defaults]) }, t('defaults')),
            h(Button, { variant: 'ghost', disabled: saving, onClick: () => setDraft(tools.map(tool => tool.name)) }, t('all')),
            h(Button, { variant: 'ghost', disabled: saving, onClick: () => setDraft([]) }, t('none')),
            h('span', { className: 'pi-tools-note' }, `${t('selected')}: ${selected.length}/${tools.length}`)),
          noGateway ? h('p', { className: 'pi-tools-note' }, t('noGateway')) : null,
          h('div', { className: 'pi-tools-options-list' },
            ...['pi', 'harness', 'mcp'].map(group => {
              const rows = visible.filter(tool => groupOf(tool) === group)
              return rows.length ? h('fieldset', { key: group, disabled: saving },
                h('legend', null, t(`${group}Group`)),
                ...rows.map(tool => h('div', { key: tool.name, className: 'pi-tools-option' },
                  h(Checkbox, { label: tool.name, checked: selected.includes(tool.name), disabled: saving,
                    onChange: checked => setDraft(checked ? [...selected, tool.name] : selected.filter(name => name !== tool.name)) }),
                  h('p', { className: 'pi-tools-option-description', title: tool.description }, tool.description)))) : null
            }),
            visible.length ? null : h('p', null, t('noMatches')))),
        error ? h('p', { role: 'alert', className: 'pi-tools-error' }, error) : null))
    }

    return {
      inject: ['slots', 'locale', 'resources', 'remote', 'remote.agentPresets'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }))
        ctx.effect(() => ctx.resources.register({
          protocol: 'pi-tool-options',
          async *open(_address, { signal }) {
            const result = await ctx.remote.agentPresets.options('pi')
            if (!signal.aborted) yield result
          },
        }))
        ctx.slots.inject('conversation.hero.agentPreset.options', () => ctx.slots.register({
          name: 'conversation.hero.agentPreset.options', id: 'pi-tools', locale: NS,
        }, PiToolOptions))
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-pi-tools'
          style.textContent = css
          document.head.append(style)
          return () => style.remove()
        })
        ctx.slots.inject('tool.call.presentation', () => ctx.slots.register({
          name: 'tool.call.presentation', locale: NS, select,
        }, PiCard))
      },
    }
  },
})
