window.__ModuleLoader__.load({
  id: 'dsh-session-search',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-session-search'
    const LIMIT = 20
    const dictionaries = {
      zh: {
        title: '搜索会话', placeholder: '输入标题、工作区或聊过的内容…', recent: '最近会话', results: '搜索结果',
        close: '关闭', loading: '正在载入会话…', searching: '正在搜索对话内容…', failed: '正文搜索暂不可用，仍可按标题或工作区查找。',
        unavailable: '暂时无法读取会话列表。', empty: '还没有最近会话。', none: '没有匹配的会话，试试其他关键词。',
        more: '仅显示前 20 条，请缩小搜索范围。', choose: '选择', open: '打开',
      },
      en: {
        title: 'Search sessions', placeholder: 'Search titles, workspaces or messages…', recent: 'Recent sessions', results: 'Search results',
        close: 'Close', loading: 'Loading sessions…', searching: 'Searching messages…', failed: 'Message search is unavailable. You can still search titles and workspaces.',
        unavailable: 'The session list is unavailable.', empty: 'No recent sessions yet.', none: 'No matching sessions. Try a different keyword.',
        more: 'Showing the first 20 results. Refine your search for more.', choose: 'Select', open: 'Open',
      },
    }
    const css = `
      .dsss-actions { display:grid; gap:4px; width:100%; min-width:0 }
      .dsss-trigger { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; min-height:34px; padding:4px; border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:14px; cursor:pointer }
      .dsss-trigger:hover,.dsss-close:hover { background:var(--dsw-alias-bg-layer-2) }
      .dsss-trigger:focus-visible,.dsss-close:focus-visible { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:-2px }
      .dsss-dialog { box-sizing:border-box; width:min(680px,calc(100vw - 24px)); height:min(490px,80dvh); max-width:none; max-height:none; padding:0; position:fixed; inset:0; margin:auto; border:1px solid var(--dsw-alias-border-l2); border-radius:16px; background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-primary); font:inherit; pointer-events:auto; box-shadow:0 18px 70px color-mix(in srgb,var(--dsw-alias-label-primary) 17%,transparent); overflow:hidden }
      .dsss-dialog[open] { display:flex; flex-direction:column }
      .dsss-dialog::backdrop { background:color-mix(in srgb,var(--dsw-alias-label-secondary) 35%,transparent) }
      .dsss-head { display:flex; align-items:center; gap:12px; padding:18px; border-bottom:1px solid var(--dsw-alias-border-l1) }
      .dsss-head input { flex:1; min-width:0; border:0; padding:3px 0; outline:none; font:inherit; font-size:18px; background:transparent; color:inherit }
      .dsss-head input::placeholder,.dsss-meta,.dsss-snippet,.dsss-caption,.dsss-footer,.dsss-status { color:var(--dsw-alias-label-secondary) }
      .dsss-close { font:inherit; font-size:12px; color:var(--dsw-alias-label-secondary); background:transparent; border:1px solid var(--dsw-alias-border-l2); border-radius:6px; padding:4px 7px; cursor:pointer }
      .dsss-caption { margin:0; padding:12px 18px 6px; font-size:12px; font-weight:600 }
      .dsss-list { flex:1; min-height:0; overflow:auto; padding:0 8px 8px; overscroll-behavior:contain }
      .dsss-row { border-radius:9px; padding:10px; display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:3px 12px; cursor:pointer }
      .dsss-row:hover { background:var(--dsw-alias-bg-layer-2) }
      .dsss-row[aria-selected=true] { background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,var(--dsw-alias-bg-overlay)) }
      .dsss-row strong,.dsss-meta,.dsss-snippet { overflow:hidden; white-space:nowrap; text-overflow:ellipsis }
      .dsss-row strong { font-size:14px; font-weight:600 }
      .dsss-meta,.dsss-snippet { font-size:12px }
      .dsss-snippet { grid-column:1/-1 }
      .dsss-status { margin:0; padding:6px 18px; font-size:13px }
      .dsss-status:empty { display:none }
      .dsss-list:empty { flex:0; padding:0 }
      .dsss-list:empty + .dsss-status { flex:1; display:grid; place-items:center; text-align:center }
      .dsss-footer { padding:9px 18px; border-top:1px solid var(--dsw-alias-border-l1); text-align:end; font-size:12px }
      .dsss-footer kbd { font-family:inherit; color:var(--dsw-alias-label-primary) }
    `
    function SearchIcon({ size }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true },
        h('circle', { cx: 10.5, cy: 10.5, r: 6.5 }), h('path', { d: 'm15.5 15.5 5 5', strokeLinecap: 'round' }))
    }

    function catalog(ids, byId, workspaces, archivedIds) {
      const workspace = new Map(), archived = new Set(archivedIds)
      for (const ws of workspaces) for (const id of ws.sessionIds) workspace.set(id, ws.title)
      return ids.flatMap(id => {
        const row = byId[id]
        if (!row || row.blank || row.origin === 'subagent' || archived.has(id)) return []
        return [{ id, title: row.displayTitle, workspace: workspace.get(id) || row.cwd || '', updatedAt: row.updatedAt }]
      }).toSorted((a, b) => b.updatedAt - a.updatedAt)
    }

    function results(rows, query, page) {
      if (!query) return { items: rows.slice(0, LIMIT), more: false }
      const q = query.toLowerCase()
      const matches = new Map(rows.filter(row => [row.title, row.workspace, row.id].some(s => s.toLowerCase().includes(q))).map(row => [row.id, row]))
      if (page) {
        const byId = new Map(rows.map(row => [row.id, row]))
        for (const hit of page.items) {
          const row = byId.get(hit.sessionId)
          if (row) matches.set(row.id, { ...row, snippet: hit.snippet })
        }
      }
      return { items: Array.from(matches.values()).slice(0, LIMIT), more: matches.size > LIMIT || page?.hasMore }
    }

    function useMessageSearch(search, query) {
      const [reply, setReply] = React.useState(null)
      React.useEffect(() => {
        setReply(null)
        if (!query) return
        const controller = new AbortController()
        const timer = setTimeout(async () => {
          try {
            const response = await search(query, controller.signal)
            if (!controller.signal.aborted) setReply({ query, page: response.ok ? response.value : null })
          } catch {
            if (!controller.signal.aborted) setReply({ query, page: null })
          }
        }, 250)
        return () => { clearTimeout(timer); controller.abort() }
      }, [search, query])
      return reply?.query === query ? reply : null
    }

    function Palette({ t, useSessions, useWorkspaces, locale, search, openSession, dismiss }) {
      const dialog = React.useRef(null), input = React.useRef(null), activeRow = React.useRef(null)
      const listId = React.useId()
      const [text, setText] = React.useState(''), [selectedId, select] = React.useState(null)
      const ids = useSessions(s => s.ids), byId = useSessions(s => s.byId), sessionPhase = useSessions(s => s.phase)
      const workspaces = useWorkspaces(s => s.items), archived = useWorkspaces(s => s.archivedSessionIds)
      const workspacePhase = useWorkspaces(s => s.phase), workspaceState = useWorkspaces(s => s.state)
      const query = text.trim(), reply = useMessageSearch(search, query)
      const rows = React.useMemo(() => catalog(ids, byId, workspaces, archived), [ids, byId, workspaces, archived])
      const { items, more } = React.useMemo(() => results(rows, query, reply?.page), [rows, query, reply])
      const index = Math.max(0, items.findIndex(row => row.id === selectedId))
      const date = React.useMemo(() => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }), [locale])
      const ready = sessionPhase === 'ready' && workspacePhase === 'ready'
      let status = ''
      if (workspaceState === 'error') status = t('unavailable')
      else if (!ready) status = t('loading')
      else if (query && !reply) status = t('searching')
      else if (query && !reply.page) status = t('failed')
      else if (!items.length) status = t(query ? 'none' : 'empty')
      else if (more) status = t('more')

      React.useLayoutEffect(() => {
        const el = dialog.current
        el.showModal()
        input.current.focus()
        return () => el.close()
      }, [])
      React.useEffect(() => { activeRow.current?.scrollIntoView({ block: 'nearest' }) }, [index, query])
      function open(row) {
        dismiss()
        openSession(row.id)
      }
      function onKeyDown(event) {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || !items.length || !ready) return
        const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
        if (delta) {
          event.preventDefault()
          select(items[(index + delta + items.length) % items.length].id)
        } else if (event.key === 'Enter') {
          event.preventDefault()
          open(items[index])
        }
      }
      return h('dialog', { className: 'dsss-dialog', ref: dialog, 'aria-label': t('title'),
        onCancel: e => { e.preventDefault(); dismiss() },
        onClick: e => {
          if (e.target !== dialog.current) return
          const b = dialog.current.getBoundingClientRect()
          if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dismiss()
        } },
      h('div', { className: 'dsss-head' }, h(SearchIcon, { size: 22 }),
        h('input', { ref: input, type: 'text', role: 'combobox', value: text, maxLength: 500, autoComplete: 'off', 'aria-label': t('title'),
          'aria-autocomplete': 'list', 'aria-controls': listId, 'aria-expanded': true, 'aria-activedescendant': ready && items.length ? `${listId}-${index}` : undefined,
          placeholder: t('placeholder'), onKeyDown, onChange: e => { select(null); setText(e.target.value) } }),
        h('button', { type: 'button', className: 'dsss-close', onClick: dismiss, 'aria-label': t('close'), title: t('close') }, 'Esc')),
      h('h2', { className: 'dsss-caption', id: `${listId}-caption` }, t(query ? 'results' : 'recent')),
      h('div', { className: 'dsss-list', role: 'listbox', id: listId, 'aria-labelledby': `${listId}-caption` }, ready && items.map((row, i) =>
        h('div', { className: 'dsss-row', role: 'option', key: row.id, id: `${listId}-${i}`, 'aria-selected': i === index, ref: i === index ? activeRow : undefined,
          onMouseDown: e => e.preventDefault(), onClick: () => open(row) },
        h('strong', null, row.title), h('span', { className: 'dsss-meta' }, date.format(row.updatedAt)),
        row.workspace && h('span', { className: 'dsss-snippet' }, row.workspace), row.snippet && h('span', { className: 'dsss-snippet' }, row.snippet)))),
      h('p', { className: 'dsss-status', role: 'status' }, status),
      h('div', { className: 'dsss-footer' }, h('kbd', null, '↑ ↓'), ' ', t('choose'), '　', h('kbd', null, '↵'), ' ', t('open')))
    }
    return {
      inject: ['slots', 'locale', 'sessions', 'uiWorkspace'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(dictionaries)) ctx.effect(() => ctx.locale.register(NS, lang, dict))
        const search = (query, signal) => ctx.sessions.search(query, signal)
        const openSession = id => ctx.uiWorkspace.openSession(id)
        function Launcher(props) {
          const [opened, setOpened] = React.useState(false)
          const { t } = props
          return h('div', { className: 'dsss-actions' }, h('style', null, css), props.children,
            h('button', { className: 'dsss-trigger', type: 'button', 'aria-label': t('title'), 'aria-haspopup': 'dialog', title: t('title'), onClick: () => setOpened(true) },
              h(SearchIcon, { size: 16 }), props.wide && t('title')),
            opened && h(Palette, { ...props, locale: ctx.locale.getLocale().active, search, openSession, dismiss: () => setOpened(false) }))
        }
        ctx.slots.inject('sidebar.session.action', () => ctx.slots.register({ name: 'sidebar.session.action', id: NS, locale: NS }, Launcher))
      },
    }
  },
})
