/**
 * dsh-tool-lens — browser-only plugin.
 *
 * A set of replacement views for tool-call rows in the Chat. Each lens shadows
 * the built-in view of one tool in the keyed `tool.call.toolview` slot; disabling
 * the plugin restores the built-in rows.
 *
 * Lenses:
 *   - skill: the skill row's name opens the skill's SKILL.md in the right Sidebar.
 */
window.__ModuleLoader__.load({
  id: 'dsh-tool-lens',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'toolLens'
    // Built-in toolviews register at the default priority 0; the lowest priority renders.
    const PRIORITY = -10
    const MISSING_MS = 2400

    const CSS_TEXT = `
.dtl-card{display:flex;flex-direction:column}
.dtl-row{position:relative;display:flex;align-items:center;min-width:0;height:calc(24px + var(--dsh-content-font-delta,0px));
  overflow:hidden;color:var(--dsw-alias-label-tertiary);transition:color .1s}
@media (hover:hover){.dtl-row:hover{color:var(--dsw-alias-label-secondary)}}
.dtl-row[data-expandable]{cursor:pointer}
.dtl-btn{display:inline-flex;align-items:center;min-width:0;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dtl-btn:focus-visible{outline:1.5px solid var(--dsw-alias-brand-primary);outline-offset:1px;border-radius:4px}
.dtl-leading{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;margin-right:6px;
  width:calc(16px + var(--dsh-content-font-delta,0px));height:calc(16px + var(--dsh-content-font-delta,0px));color:inherit}
.dtl-leading svg{width:calc(14px + var(--dsh-content-font-delta,0px));height:calc(14px + var(--dsh-content-font-delta,0px))}
.dtl-icon-idle{display:inline-flex;opacity:1;transition:opacity .1s}
.dtl-chevron{position:absolute;inset:0;margin:auto;opacity:0;transition:opacity .1s}
.dtl-leading[data-open] .dtl-chevron{position:static;opacity:1}
@media (hover:hover){.dtl-row[data-expandable]:hover .dtl-icon-idle{opacity:0}.dtl-row[data-expandable]:hover .dtl-chevron{opacity:1}}
.dtl-title,.dtl-summary{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.dtl-title{flex:none}
.dtl-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.dtl-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dtl-error{color:var(--dsw-alias-state-error-primary)}
.dtl-stopped{color:var(--dsw-alias-state-warn-label)}
.dtl-link{gap:4px;flex:0 1 auto;min-width:0;border-radius:4px}
.dtl-link .dtl-summary{text-decoration:underline;text-decoration-color:transparent;text-underline-offset:3px;transition:text-decoration-color .1s,color .1s}
.dtl-link-icon{display:inline-flex;flex:none;opacity:0;transition:opacity .1s}
.dtl-link-icon svg{width:12px;height:12px}
@media (hover:hover){
  .dtl-row:hover .dtl-link-icon{opacity:.7}
  .dtl-link:hover .dtl-summary{color:var(--dsw-alias-label-primary);text-decoration-color:currentColor}
  .dtl-link:hover .dtl-link-icon{opacity:1;color:var(--dsw-alias-label-primary)}
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
.dtl-pre[data-error]{color:var(--dsw-alias-state-error-primary)}
.dtl-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;
  border:.5px solid var(--dsw-alias-border-l4);border-radius:999px;background:var(--dsw-alias-bg-base);
  color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity .1s}
.dtl-inspect:focus-visible{opacity:1}
@media (hover:hover){.dtl-card:hover .dtl-inspect{opacity:1}.dtl-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.dtl-inspect{opacity:1}}
.dtl-shimmer{animation:dtl-pulse 1.6s ease-in-out infinite}
@keyframes dtl-pulse{0%,100%{opacity:1}50%{opacity:.45}}
.dtl-wrap{position:relative}
.dtl-float{position:absolute;top:0;right:0;display:flex;align-items:center;gap:4px;height:calc(24px + var(--dsh-content-font-delta,0px));
  padding-left:20px;background:linear-gradient(to right,transparent,var(--dsw-alias-bg-base) 18px);opacity:0;transition:opacity .1s}
.dtl-wrap:hover>.dtl-float,.dtl-wrap:focus-within>.dtl-float,.dtl-wrap[data-open]>.dtl-float{opacity:1}
@media (hover:none){.dtl-float{opacity:1}}
.dtl-chip{display:inline-flex;align-items:center;gap:4px;max-width:220px;height:20px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);
  border-radius:999px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.dtl-chip svg{flex:none;width:12px;height:12px}
.dtl-chip[aria-pressed=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover-solid)}
@media (hover:hover){.dtl-chip:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
.dtl-chip:focus-visible{outline:1.5px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dtl-list{display:flex;flex-direction:column;max-height:240px;margin:4px 0 4px 4px;padding:4px;overflow:auto;list-style:none;
  border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block)}
.dtl-item{display:flex;align-items:baseline;gap:8px;width:100%;padding:3px 8px;border-radius:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
@media (hover:hover){.dtl-item:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
.dtl-item-primary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dtl-item-secondary{flex:none;max-width:40%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--dsw-alias-label-caption);font-size:11px}
.dtl-item-more{padding:3px 8px;color:var(--dsw-alias-label-caption);font-size:11px}
@media (prefers-reduced-motion:reduce){.dtl-float{transition:none}}
.dtl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.dtl-row,.dtl-icon-idle,.dtl-chevron,.dtl-link-icon,.dtl-inspect{transition:none}.dtl-shimmer{animation:none}}
`

    // ---- shared pieces -------------------------------------------------------

    const svg = (viewBox, children, extra) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox, fill: 'none', strokeWidth: 1, 'aria-hidden': true, ...extra }, ...children)
    // Glyphs copied from the host icon set so the row matches the built-in one.
    const IconSkill = () => svg('0 0 17 17', [
      h('path', { key: 1, d: 'M4.57788 5.77124H10.7029', stroke: 'currentColor' }),
      h('path', { key: 2, d: 'M4.57788 8.89819H7.91879', stroke: 'currentColor' }),
      h('path', { key: 3, fill: 'currentColor', d: 'M12.1404 1.19446C12.9442 1.19446 13.6404 1.81999 13.6404 2.64465V8.89856H12.6404V2.64465C12.6404 2.42015 12.4411 2.19446 12.1404 2.19446H3.14038C2.83968 2.19446 2.64038 2.42015 2.64038 2.64465V13.0929C2.64082 13.3172 2.84001 13.5421 3.14038 13.5421H8.88159V14.5421H3.14038C2.33675 14.5421 1.6408 13.9172 1.64038 13.0929V2.64465C1.64038 1.81999 2.33651 1.19446 3.14038 1.19446H12.1404Z' }),
      h('path', { key: 4, d: 'M12.0051 15.1056C12.0051 13.6395 10.8166 12.451 9.35059 12.451C10.8166 12.451 12.0051 11.2626 12.0051 9.79651C12.0051 11.2626 13.1936 12.451 14.6597 12.451C13.1936 12.451 12.0051 13.6395 12.0051 15.1056Z', stroke: 'currentColor' }),
    ])
    const IconChevron = () => svg('0 0 16 16', [h('path', { key: 1, d: 'M4 6L7.29289 9.29289C7.68342 9.68342 8.31658 9.68342 8.70711 9.29289L12 6', stroke: 'currentColor' })], { width: 14, height: 14 })
    // Panel-right glyph: a frame with its right column filled, read as "open in the side panel".
    const IconSidePanel = () => svg('0 0 16 16', [
      h('rect', { key: 1, x: 2, y: 3, width: 12, height: 10, rx: 2, stroke: 'currentColor', strokeWidth: 1.2 }),
      h('path', { key: 2, d: 'M10 3.6V12.4', stroke: 'currentColor', strokeWidth: 1.2 }),
    ])

    const firstLine = text => { const i = text.indexOf('\n'); return i === -1 ? text : text.slice(0, i) }

    /** Durable result blocks flattened like the generic Tool row does. */
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

    /** Leading cell: tool glyph at rest, chevron on hover or while open. */
    function Leading({ icon, open, expandable }) {
      if (!expandable) return h('span', { className: 'dtl-leading' }, icon)
      return h('span', { className: 'dtl-leading', 'data-open': open || undefined },
        open ? null : h('span', { className: 'dtl-icon-idle' }, icon),
        h('span', { className: 'dtl-chevron' }, h(IconChevron)))
    }

    // ---- skill lens ----------------------------------------------------------

    const decodeEntities = text => text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

    /** `Base directory for this skill: <dir>` from the recorded `<skill_content>` output. */
    function baseDirectory(output) {
      const m = /^Base directory for this skill: (.+)$/m.exec(output ?? '')
      return m === null ? undefined : decodeEntities(m[1].trim())
    }

    function SkillRow(props) {
      const { t } = props
      if (props.phase === 'preparing') {
        return h('div', { className: 'dtl-card', 'data-tool': 'skill', 'data-state': 'preparing' },
          h('div', { className: 'dtl-row' },
            h(Leading, { icon: h(IconSkill) }),
            h('span', { className: 'dtl-sr' }, t('skill.preparing')),
            h('span', { className: 'dtl-title dtl-shimmer' }, t('skill.title'))))
      }
      return h(StartedSkillRow, props)
    }

    function StartedSkillRow({ block, inspect, t, openSkill }) {
      const state = callState(block)
      const { raw, args } = parseArgs(block)
      const name = typeof args?.name === 'string' && args.name !== '' ? firstLine(args.name) : (raw === '' ? block.callId : firstLine(raw))
      const output = resultText(block)
      const [expanded, setExpanded] = React.useState(false)
      const [missing, setMissing] = React.useState(false)
      React.useEffect(() => {
        if (!missing) return undefined
        const timer = setTimeout(() => setMissing(false), MISSING_MS)
        return () => clearTimeout(timer)
      }, [missing])

      const expandable = output !== null
      const open = expanded && expandable
      const running = state === 'running'
      const canOpen = state !== 'error' && typeof args?.name === 'string' && args.name !== ''
      const toggle = () => { if (expandable) setExpanded(value => !value) }
      const openFile = event => {
        event.stopPropagation()
        openSkill(args.name, baseDirectory(output)).then(ok => { if (!ok) setMissing(true) })
      }

      let summary
      if (state === 'stopped') summary = h('span', { className: 'dtl-summary dtl-stopped' }, t('skill.stopped'))
      else if (state === 'error' && output !== null) summary = h('span', { className: 'dtl-summary dtl-error' }, firstLine(output))
      else if (canOpen) {
        summary = h('button', { type: 'button', className: 'dtl-btn dtl-link', title: t('skill.open'), onClick: openFile },
          h('span', { className: `dtl-summary${running ? ' dtl-shimmer' : ''}` }, name),
          h('span', { className: 'dtl-link-icon' }, h(IconSidePanel)))
      } else summary = h('span', { className: `dtl-summary${running ? ' dtl-shimmer' : ''}` }, name)

      const status = running ? t('skill.running') : state === 'error' ? t('skill.failed') : null
      return h('div', { className: 'dtl-card', 'data-tool': 'skill', 'data-state': state },
        h('div', {
          className: 'dtl-row',
          'data-expandable': expandable || undefined,
          onClick: toggle,
        },
        h('button', {
          type: 'button',
          className: 'dtl-btn',
          'aria-expanded': expandable ? open : undefined,
          disabled: !expandable,
          style: expandable ? undefined : { cursor: 'default' },
          onClick: event => { event.stopPropagation(); toggle() },
        },
        h(Leading, { icon: h(IconSkill), open, expandable }),
        status === null ? null : h('span', { className: 'dtl-sr' }, status),
        h('span', { className: `dtl-title${running ? ' dtl-shimmer' : ''}` }, t('skill.title'))),
        h('span', { className: 'dtl-sep', 'aria-hidden': true }),
        summary,
        missing ? h('span', { className: 'dtl-hint', role: 'status' }, t('skill.notFound')) : null),
        open ? h('div', { className: 'dtl-body' },
          h('section', { className: 'dtl-panel', 'aria-label': t('skill.instructions') },
            h('div', { className: 'dtl-panel-head' },
              h('span', { className: 'dtl-panel-label' }, t('skill.instructions')),
              canOpen ? h('button', { type: 'button', className: 'dtl-btn dtl-panel-action', onClick: openFile }, h(IconSidePanel), t('skill.openShort')) : null),
            h('pre', { className: 'dtl-pre', 'data-error': state === 'error' || undefined }, output)),
          inspect === undefined ? null : h('button', { type: 'button', className: 'dtl-inspect', onClick: inspect }, t('skill.inspect')))
          : null)
    }

    /**
     * Resolve a skill's file through the Session's catalog, which knows single-file
     * skills too; fall back to `<base directory>/SKILL.md` from the recorded output.
     */
    function createSkillResolver(ctx) {
      const catalogs = new Map()
      const catalog = sessionId => {
        let entry = catalogs.get(sessionId)
        if (entry !== undefined) return entry
        entry = ctx.remote.skills.list({ sessionId }, new AbortController().signal)
          .then(result => (result.ok ? result.value.skills : []), () => [])
        catalogs.set(sessionId, entry)
        // A failed or empty answer is retried on the next click.
        entry.then(list => { if (list.length === 0) catalogs.delete(sessionId) })
        return entry
      }
      const clear = () => catalogs.clear()
      return { catalog, clear }
    }

    const LENSES = [
      { key: 'skill', component: SkillRow },
    ]

    // ---- augmenting lenses ---------------------------------------------------
    //
    // These keep the built-in row and float extra actions over its right end.
    // Every target registers with the `conversation` locale and no entry-level
    // inject, so the wrapper renders the built-in component with its own props.

    const AUGMENTED = [
      'bash', 'grep', 'glob', 'web_search', 'web_fetch',
      'subagent', 'send_message', 'interrupt_agent',
      'job_output', 'terminal_read', 'workflow', 'lsp',
      'cordis_inspect_list', 'cordis_inspect_query',
      'session_event_read', 'session_event_search', 'session_event_trace', 'session_search', 'session_trace',
    ]
    const LIST_CAP = 50
    const SPILL_MARK = ' Full formatted result stored at: '

    const settledText = block => ('kind' in block ? resultText(block) : null)
    const metaOf = block => (typeof block.meta === 'object' && block.meta !== null && !Array.isArray(block.meta) ? block.meta : undefined)

    /** Path of the spill-policy file named by the result's final notice. */
    function spillPath(block) {
      const text = settledText(block)
      if (text === null) return undefined
      const at = text.lastIndexOf(SPILL_MARK)
      if (at < 0) return undefined
      const rest = text.slice(at + SPILL_MARK.length)
      const end = rest.indexOf('. ')
      const path = (end < 0 ? rest.replace(/\)\s*$/, '') : rest.slice(0, end)).trim()
      return /^(?:\/|[A-Za-z]:[\\/])/.test(path) ? path : undefined
    }

    /** Session id (rc.1) or model-facing agent name (rc.2) in a settled call. */
    function subagentChild(toolName, block) {
      if (!('kind' in block) || block.isError) return undefined
      if (toolName === 'subagent') {
        const meta = metaOf(block)
        const reference = meta?.subagentId ?? meta?.name
        if (typeof reference === 'string' && reference !== '') return reference
        return /started subagent (\S+)/.exec(settledText(block) ?? '')?.[1]
      }
      if (toolName !== 'send_message' && toolName !== 'interrupt_agent') return undefined
      const args = parseArgs(block).args
      const reference = args?.agent_id ?? args?.agent
      return typeof reference === 'string' && reference !== '' ? reference : undefined
    }

    /** Resolve names through durable catalogs, never use a name as a Session id. */
    async function resolveSubagentAddress(sessions, parent, reference) {
      if (reference === 'lead') return undefined
      const retained = sessions.subagentAddress?.(reference)
      if (retained !== undefined) return retained
      const state = sessions.list.getSnapshot()
      for (const [parentId, projection] of Object.entries(state.projectionsBySession ?? {})) {
        const entry = projection.values?.subagentCatalog?.find(item => item.id === reference)
        if (entry !== undefined) return entry.mode === 'external' ? undefined : {
          parentSessionId: parentId, childSessionId: entry.id, mode: entry.mode,
        }
      }

      // Names are absolute paths from the subagent tree root, also in child chats.
      let current = parent
      const visited = new Set()
      for (let address = sessions.subagentAddress?.(current); address !== undefined; address = sessions.subagentAddress?.(current)) {
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

    /** grep/glob result files from the recorded metadata. */
    function searchFiles(block) {
      if (!('kind' in block) || block.isError) return []
      const meta = metaOf(block)
      if (meta?.shape === 'paths' && Array.isArray(meta.paths)) {
        return meta.paths.filter(path => typeof path === 'string').map(path => ({ path }))
      }
      if (meta?.shape === 'matches' && Array.isArray(meta.files)) {
        return meta.files
          .filter(file => typeof file?.path === 'string')
          .map(file => ({ path: file.path, line: file.matches?.[0]?.lineNumber, count: file.matches?.length }))
      }
      return []
    }

    /** web_search sources, or the fetched URL. */
    function webLinks(toolName, block) {
      if (!('kind' in block) || block.isError) return []
      const meta = metaOf(block)
      if (toolName === 'web_search' && Array.isArray(meta?.sources)) {
        return meta.sources.filter(source => typeof source?.url === 'string').map(source => ({ url: source.url, title: source.title }))
      }
      if (toolName === 'web_fetch') {
        const url = typeof meta?.url === 'string' ? meta.url : parseArgs(block).args?.url
        if (typeof url === 'string' && /^https?:\/\//i.test(url)) return [{ url }]
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
    const IconGlobe = () => svg('0 0 16 16', [
      h('circle', { key: 1, cx: 8, cy: 8, r: 5.5, stroke: 'currentColor', strokeWidth: 1.1 }),
      h('path', { key: 2, d: 'M2.5 8h11M8 2.5c1.8 2 1.8 9 0 11M8 2.5c-1.8 2-1.8 9 0 11', stroke: 'currentColor', strokeWidth: 1.1 }),
    ])

    const fill = (text, n) => text.replace('{n}', String(n))
    const tail = path => path.replace(/\\/g, '/').split('/').filter(Boolean).slice(-2).join('/') || path
    const hostOf = url => { try { return new URL(url).host } catch { return url } }

    /** Build the wrapper component for one plugin activation. */
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

      /** The built-in entry this registration shadows for the same key. */
      const baseEntry = (key, self) => {
        let best
        for (const entry of ctx.slots.entries('tool.call.toolview')) {
          if (entry.options?.key !== key || entry.component === self) continue
          const priority = entry.options.priority ?? 0
          if (priority <= PRIORITY) continue
          if (best === undefined || priority < (best.options.priority ?? 0)) best = entry
        }
        return best
      }

      function Action({ icon, label, title, pressed, onClick }) {
        return h('button', {
          type: 'button',
          className: 'dtl-chip',
          title,
          'aria-pressed': pressed,
          onClick: event => { event.stopPropagation(); onClick(event) },
        }, h(icon), label)
      }

      function AugmentedRow(props) {
        React.useSyncExternalStore(subscribeLocale, localeSnapshot)
        const { toolName, block, phase, openFile, sessionId } = props
        const [list, setList] = React.useState(null)
        const base = baseEntry(toolName, AugmentedRow)
        const inner = base === undefined ? null : h(base.component, props)
        if (phase === 'preparing') return inner

        const spill = spillPath(block)
        const child = subagentChild(toolName, block)
        const files = toolName === 'grep' || toolName === 'glob' ? searchFiles(block) : []
        const links = toolName === 'web_search' || toolName === 'web_fetch' ? webLinks(toolName, block) : []
        const actions = []
        if (spill !== undefined) {
          actions.push(h(Action, { key: 'spill', icon: IconOutput, label: tt('lens.spill'), title: tt('lens.spillTitle'), onClick: () => openFile(spill) }))
        }
        if (child !== undefined && child !== 'lead' && sessionId !== undefined) {
          actions.push(h(Action, { key: 'sub', icon: IconChat, label: tt('lens.subagent'), title: tt('lens.subagentTitle'), onClick: () => openSubagent(sessionId, child) }))
        }
        if (files.length === 1) {
          actions.push(h(Action, { key: 'file', icon: IconFiles, label: tail(files[0].path), title: files[0].path, onClick: () => openFile(files[0].path, files[0].line ? { line: files[0].line } : undefined) }))
        } else if (files.length > 1) {
          actions.push(h(Action, { key: 'files', icon: IconFiles, label: fill(tt('lens.files'), files.length), title: tt('lens.filesTitle'), pressed: list === 'files', onClick: () => setList(v => (v === 'files' ? null : 'files')) }))
        }
        if (toolName === 'web_fetch' && links.length === 1) {
          actions.push(h(Action, { key: 'web', icon: IconGlobe, label: tt('lens.browse'), title: tt('lens.browseTitle'), onClick: event => openUrl(links[0].url, event) }))
        } else if (links.length > 0) {
          actions.push(h(Action, { key: 'links', icon: IconGlobe, label: fill(tt('lens.sources'), links.length), title: tt('lens.browseTitle'), pressed: list === 'links', onClick: () => setList(v => (v === 'links' ? null : 'links')) }))
        }
        if (actions.length === 0) return inner

        let panel = null
        if (list === 'files' && files.length > 1) {
          panel = h(ItemList, {
            items: files.slice(0, LIST_CAP).map(file => ({
              key: file.path,
              primary: file.path,
              secondary: file.count ? `${file.count}` : undefined,
              onClick: () => openFile(file.path, file.line ? { line: file.line } : undefined),
            })),
            more: files.length - LIST_CAP,
          })
        } else if (list === 'links' && links.length > 0) {
          panel = h(ItemList, {
            items: links.slice(0, LIST_CAP).map((link, i) => ({
              key: `${i}:${link.url}`,
              primary: link.title || link.url,
              secondary: hostOf(link.url),
              title: link.url,
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
          ...items.map(item => h('li', { key: item.key },
            h('button', { type: 'button', className: 'dtl-btn dtl-item', title: item.title ?? item.primary, onClick: item.onClick },
              h('span', { className: 'dtl-item-primary' }, item.primary),
              item.secondary ? h('span', { className: 'dtl-item-secondary' }, item.secondary) : null))),
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
        ctx.effect(() => resolver.clear, 'tool-lens: skill catalog')

        const sessionInject = {
          skill: sessionId => ({
            /** @returns whether a file was opened. */
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

        // Augmenting lenses need the raw entry list to find the built-in view they wrap.
        if (typeof ctx.slots.entries !== 'function') {
          console.warn('[dsh-tool-lens] slots.entries is unavailable; augmenting lenses are off')
          return
        }
        const AugmentedRow = createAugmentLens(ctx)
        for (const key of AUGMENTED) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            priority: PRIORITY,
            locale: 'conversation',
          }, AugmentedRow))
        }
      },
      _internal: { baseDirectory, fileAddressFor, spillPath, subagentChild, resolveSubagentAddress, searchFiles, webLinks },
    }

    // ---- file addresses (mirrors @deepseek-ai/dsh-util-workspace-path) --------

    function encodeSegment(segment) { return encodeURIComponent(segment).replace(/%3A/gi, ':') }
    function sessionFileAddress(sessionId, path) {
      const normalized = path.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '')
      return `dsh-resource://file/session/${encodeSegment(sessionId)}/${normalized.split('/').map(encodeSegment).join('/')}`
    }
    function fileAddressFor(sessionId, cwd, path) {
      const normalized = path.replace(/\\/g, '/')
      const absolute = normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized) || normalized.startsWith('//')
      if (!absolute) return sessionFileAddress(sessionId, normalized)
      const root = cwd === undefined ? '' : cwd.replace(/\\/g, '/').replace(/\/+$/, '')
      if (root !== '' && normalized === root) return sessionFileAddress(sessionId, '')
      if (root !== '' && normalized.startsWith(`${root}/`)) return sessionFileAddress(sessionId, normalized.slice(root.length + 1))
      return sessionFileAddress(sessionId, normalized)
    }
  },
})
