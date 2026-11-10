/**
 * dsh-session-groups — browser half.
 *
 * - A "Session groups" launcher in the sidebar panel list opens a main panel
 *   that lists the custom groups; pinned sessions lead each group, the rest
 *   follow by last activity.
 * - The session right-click menu gains "Add to group", "Pin in group" and
 *   "Remove from group".
 *
 * Groups live on the Host (lib/index.js); this half reads them over
 * `session-groups/state`, follows `session-groups/events` (SSE), and sends
 * every change to `session-groups/op`.
 */
window.__ModuleLoader__.load({
  id: 'dsh-session-groups',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'session-groups'
    const PANEL_ID = 'session-groups'

    const EN = {
      panel: 'Session groups',
      newGroup: 'New group',
      defaultName: 'New group',
      empty: 'No groups yet. Create one here, or right-click a session and choose Add to group.',
      emptyGroup: 'No sessions. Use Add session, or right-click a session in the sidebar.',
      addSession: 'Add session',
      searchPlaceholder: 'Search sessions',
      noMatches: 'No matching sessions',
      rename: 'Rename',
      delete: 'Delete group',
      deleteConfirm: 'Delete group "{name}"? Its sessions are not deleted.',
      moveUp: 'Move up',
      moveDown: 'Move down',
      pin: 'Pin in group',
      unpin: 'Unpin in group',
      remove: 'Remove from group',
      addTo: 'Add to group',
      moveTo: 'Move to group',
      menuNewGroup: 'New group…',
      unknownSession: 'Unavailable session',
      loadFailed: 'Could not load session groups',
      opFailed: 'Could not update session groups',
      retry: 'Retry',
      collapse: 'Collapse',
      expand: 'Expand',
      sessions: '{n} sessions',
    }
    const ZH = {
      panel: '会话分组',
      newGroup: '新建分组',
      defaultName: '新分组',
      empty: '还没有分组。在这里新建，或在会话上右键选“加入分组”。',
      emptyGroup: '暂无会话。点“添加会话”，或在侧边栏会话上右键加入。',
      addSession: '添加会话',
      searchPlaceholder: '搜索会话',
      noMatches: '没有匹配的会话',
      rename: '重命名',
      delete: '删除分组',
      deleteConfirm: '删除分组“{name}”？其中的会话不会被删除。',
      moveUp: '上移',
      moveDown: '下移',
      pin: '组内置顶',
      unpin: '取消组内置顶',
      remove: '移出分组',
      addTo: '加入分组',
      moveTo: '移到分组',
      menuNewGroup: '新建分组…',
      unknownSession: '不可用的会话',
      loadFailed: '无法加载会话分组',
      opFailed: '更新会话分组失败',
      retry: '重试',
      collapse: '收起',
      expand: '展开',
      sessions: '{n} 个会话',
    }

    // ---------------------------------------------------------------- store
    /** Host-owned groups plus local view state (collapsed groups, the group being renamed). */
    function createStore() {
      let state = { groups: [], status: 'loading', error: null }
      let view = { collapsed: new Set(), editing: null }
      const listeners = new Set()
      const emit = () => listeners.forEach(fn => fn())
      return {
        getSnapshot: () => state,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
        set(patch) { state = { ...state, ...patch }; emit() },
        view: () => view,
        setView(patch) { view = { ...view, ...patch }; state = { ...state }; emit() },
      }
    }

    async function postOp(op) {
      const r = await fetch('session-groups/op', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(op),
      })
      const body = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(body.message ?? `HTTP ${r.status}`)
      return body
    }

    // --------------------------------------------------------------- helpers
    const groupOf = (groups, sessionId) => groups.find(g => g.sessionIds.includes(sessionId))

    /** Pinned members first in pin order, then the rest newest first. */
    function orderedMembers(group, byId) {
      const pinned = new Set(group.pinned)
      const rest = group.sessionIds.filter(id => !pinned.has(id))
        .map((id, k) => ({ id, k, at: byId[id]?.updatedAt ?? 0 }))
        .toSorted((a, b) => b.at - a.at || a.k - b.k)
        .map(x => x.id)
      return [...group.pinned, ...rest]
    }

    function relativeTime(ms, locale) {
      if (!ms) return ''
      const diff = Math.max(0, Date.now() - ms)
      const rtf = new Intl.RelativeTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { numeric: 'auto', style: 'narrow' })
      const min = Math.round(diff / 60000)
      if (min < 1) return rtf.format(0, 'minute')
      if (min < 60) return rtf.format(-min, 'minute')
      const hr = Math.round(min / 60)
      if (hr < 24) return rtf.format(-hr, 'hour')
      const day = Math.round(hr / 24)
      if (day < 30) return rtf.format(-day, 'day')
      return new Date(ms).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en')
    }

    // ----------------------------------------------------------------- icons
    const svg = (size, children, extra = {}) => h('svg', {
      viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...extra,
    }, children)
    const IconGroups = ({ size = 16 }) => svg(size, [
      h('path', { key: 'a', d: 'M2 4.5h4l1.2 1.3H14v6.7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z' }),
      h('path', { key: 'b', d: 'M2 4.5v-1a1 1 0 0 1 1-1h2.6l1.2 1.3' }),
    ])
    const IconPin = ({ size = 14, filled }) => svg(size, [
      h('path', { key: 'a', d: 'M6 2.5h4l-.6 3.6 2.1 2.2v1H4.5v-1l2.1-2.2z', fill: filled ? 'currentColor' : 'none' }),
      h('path', { key: 'b', d: 'M8 9.3V13.5' }),
    ])
    const IconPlus = ({ size = 14 }) => svg(size, h('path', { d: 'M8 3v10M3 8h10' }))
    const IconChevron = ({ size = 12, open }) => svg(size, h('path', { d: 'M6 4l4 4-4 4' }),
      { style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' } })
    const IconX = ({ size = 14 }) => svg(size, h('path', { d: 'M4 4l8 8M12 4l-8 8' }))
    const IconEdit = ({ size = 14 }) => svg(size, h('path', { d: 'M3 13h2.5L12.5 6 10 3.5 3 10.5z' }))
    const IconUp = ({ size = 14 }) => svg(size, h('path', { d: 'M4 10l4-4 4 4' }))
    const IconDown = ({ size = 14 }) => svg(size, h('path', { d: 'M4 6l4 4 4-4' }))
    const IconTrash = ({ size = 14 }) => svg(size, h('path', { d: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5' }))

    const CSS = `
.sg-page{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
.sg-inner{max-width:760px;margin:0 auto;padding:32px 24px 48px}
.sg-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
.sg-title{font-size:20px;font-weight:600;margin:0}
.sg-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.sg-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.sg-icon{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}
.sg-icon:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.sg-icon[aria-pressed=true]{color:var(--dsw-alias-brand-primary)}
.sg-icon.sg-danger:hover{color:var(--dsw-alias-state-error-primary)}
.sg-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px;border:1px dashed var(--dsw-alias-border-l2);border-radius:12px}
.sg-error{display:flex;align-items:center;gap:12px;padding:10px 14px;margin-bottom:16px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-state-error-primary);font-size:13px}
.sg-group{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);margin-bottom:12px}
.sg-ghead{display:flex;align-items:center;gap:6px;padding:6px 8px 6px 6px;min-height:40px}
.sg-gname{flex:1;min-width:0;display:flex;align-items:baseline;gap:8px;cursor:pointer;user-select:none}
.sg-gname b{font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sg-count{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.sg-gactions{display:flex;gap:2px;opacity:0;transition:opacity 100ms}
.sg-ghead:hover .sg-gactions,.sg-ghead:focus-within .sg-gactions{opacity:1}
.sg-input{flex:1;min-width:0;height:28px;padding:0 8px;border:1px solid var(--dsw-alias-brand-primary);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;outline:none}
.sg-list{padding:0 6px 6px}
.sg-row{display:flex;align-items:center;gap:8px;height:34px;padding:0 6px 0 10px;border-radius:8px;cursor:pointer}
.sg-row:hover{background:var(--dsw-alias-bg-layer-2)}
.sg-row .sg-pinmark{color:var(--dsw-alias-brand-primary);display:inline-flex;flex:none}
.sg-row .sg-dot{width:14px;flex:none}
.sg-rtitle{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
.sg-rtitle.sg-missing{color:var(--dsw-alias-label-secondary);font-style:italic}
.sg-time{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.sg-ractions{display:none;gap:2px}
.sg-row:hover .sg-ractions,.sg-row:focus-within .sg-ractions{display:flex}
.sg-row:hover .sg-time,.sg-row:focus-within .sg-time{display:none}
.sg-gempty{padding:8px 12px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.sg-picker{margin:4px 6px 8px;padding:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-overlay)}
.sg-picker .sg-input{width:100%;box-sizing:border-box;border-color:var(--dsw-alias-border-l2);font-size:13px}
.sg-picker .sg-input:focus{border-color:var(--dsw-alias-brand-primary)}
.sg-pick{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;text-align:left;cursor:pointer}
.sg-pick:hover,.sg-pick:focus{background:var(--dsw-alias-bg-layer-2);outline:none}
.sg-pick span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sg-pick small{color:var(--dsw-alias-label-secondary);font-size:11px}
.sg-picklist{max-height:260px;overflow:auto;margin-top:4px}
`

    return {
      inject: ['slots', 'locale', 'sessions', 'uiWorkspace', 'contextMenus', 'layout'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'session-groups: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'session-groups: zh')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), t(key))

        const store = createStore()

        // Load once, then follow Host pushes; EventSource reconnects by itself.
        const load = () => fetch('session-groups/state', { headers: { accept: 'application/json' } })
          .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
          .then(d => store.set({ groups: d.groups ?? [], status: 'ready', error: null }))
          .catch(error => store.set({ status: 'error', error: String(error?.message ?? error) }))
        ctx.effect(() => {
          void load()
          const es = new EventSource('session-groups/events')
          es.addEventListener('message', ev => {
            try { store.set({ groups: JSON.parse(ev.data).groups ?? [], status: 'ready', error: null }) } catch {}
          })
          return () => es.close()
        }, 'session-groups: follow Host state')

        /** Run one Host operation; the reply carries the complete groups. Failures surface as a toast. */
        const op = async payload => {
          try {
            const reply = await postOp(payload)
            if (Array.isArray(reply.groups)) store.set({ groups: reply.groups, status: 'ready', error: null })
            return reply
          } catch (error) {
            ctx.contextMenus.notify(`${t('opFailed')}: ${error?.message ?? error}`, false)
            throw error
          }
        }

        const openPanel = () => { try { ctx.layout.selectPanel(PANEL_ID) } catch {} }

        // ------------------------------------------------- session context menu
        ctx.effect(() => ctx.contextMenus.register({
          id: 'session-groups',
          target: 'session',
          order: 150,
          observe: () => [store, ctx.locale],
          resolve: ({ sessionId }) => {
            const { groups } = store.getSnapshot()
            const current = groupOf(groups, sessionId)
            const children = groups.filter(g => g !== current).map(g => ({
              id: `to-${g.id}`,
              label: g.name,
              run: () => op({ action: 'add', groupId: g.id, sessionId }).then(() => {}),
            }))
            children.push({
              id: 'new',
              label: t('menuNewGroup'),
              separatorBefore: groups.length > (current ? 1 : 0),
              run: async () => {
                const { groupId } = await op({ action: 'create', name: t('defaultName'), sessionId })
                store.setView({ editing: groupId })
                openPanel()
              },
            })
            const actions = [{
              id: 'add',
              label: current ? t('moveTo') : t('addTo'),
              icon: { key: 'session-groups.folder' },
              failureLabel: t('opFailed'),
              children,
            }]
            if (current) {
              const pinned = current.pinned.includes(sessionId)
              actions.push({
                id: 'pin',
                label: `${pinned ? t('unpin') : t('pin')} · ${current.name}`,
                icon: { key: 'session-groups.pin' },
                failureLabel: t('opFailed'),
                run: () => op({ action: 'pin', sessionId, pinned: !pinned }).then(() => {}),
              }, {
                id: 'remove',
                label: t('remove'),
                icon: { key: 'session-groups.remove' },
                failureLabel: t('opFailed'),
                run: () => op({ action: 'remove', sessionId }).then(() => {}),
              })
            }
            return actions
          },
        }), 'session-groups: session menu')

        for (const [key, Icon] of [['session-groups.folder', IconGroups], ['session-groups.pin', IconPin], ['session-groups.remove', IconX]]) {
          ctx.slots.inject('contextMenu.icon', () => ctx.slots.register({ name: 'contextMenu.icon', key }, () => h(Icon, { size: 16 })))
        }

        // ------------------------------------------------------------- hooks
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const useGroups = () => React.useSyncExternalStore(store.subscribe, store.getSnapshot)
        const useSessions = () => React.useSyncExternalStore(
          fn => ctx.sessions.list.subscribe(fn),
          () => ctx.sessions.list.getSnapshot(),
        )

        // -------------------------------------------------------- components
        function GroupName({ group, editing }) {
          const [value, setValue] = React.useState(group.name)
          const ref = React.useRef(null)
          React.useEffect(() => {
            if (editing) { setValue(group.name); requestAnimationFrame(() => { ref.current?.focus(); ref.current?.select() }) }
          }, [editing, group.name])
          if (!editing) return null
          const commit = () => {
            store.setView({ editing: null })
            const name = value.trim()
            if (name && name !== group.name) void op({ action: 'rename', groupId: group.id, name }).catch(() => {})
          }
          return h('input', {
            ref, className: 'sg-input', value, maxLength: 80, 'aria-label': t('rename'),
            onChange: e => setValue(e.target.value),
            onBlur: commit,
            onKeyDown: e => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') { e.preventDefault(); store.setView({ editing: null }) }
            },
          })
        }

        function Picker({ group, groups, list, onClose }) {
          const [query, setQuery] = React.useState('')
          const ref = React.useRef(null)
          React.useEffect(() => { ref.current?.focus() }, [])
          const grouped = new Map()
          for (const g of groups) for (const id of g.sessionIds) grouped.set(id, g)
          const q = query.trim().toLowerCase()
          const candidates = list.ids
            .map(id => list.byId[id])
            .filter(s => s && !s.blank && s.origin !== 'subagent' && grouped.get(s.id) !== group)
            .filter(s => !q || (s.displayTitle ?? '').toLowerCase().includes(q) || s.id.includes(q))
            .toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
            .slice(0, 50)
          return h('div', {
            className: 'sg-picker',
            onKeyDown: e => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } },
          },
          h('input', {
            ref, className: 'sg-input', value: query, placeholder: t('searchPlaceholder'),
            onChange: e => setQuery(e.target.value),
          }),
          h('div', { className: 'sg-picklist', role: 'listbox' },
            candidates.length === 0
              ? h('div', { className: 'sg-gempty' }, t('noMatches'))
              : candidates.map(s => h('button', {
                key: s.id, type: 'button', className: 'sg-pick', role: 'option',
                onClick: () => { void op({ action: 'add', groupId: group.id, sessionId: s.id }).catch(() => {}) },
              },
              h('span', null, s.displayTitle || s.id),
              grouped.get(s.id) ? h('small', null, grouped.get(s.id).name) : null))))
        }

        function SessionRow({ id, summary, pinned, locale }) {
          const title = summary?.displayTitle || summary?.title
          const open = () => { if (summary) ctx.uiWorkspace.openSession(id) }
          const stop = fn => e => { e.stopPropagation(); fn() }
          return h('div', {
            className: 'sg-row', role: 'button', tabIndex: 0, title: title ?? id,
            onClick: open,
            onKeyDown: e => { if (e.key === 'Enter' && e.target === e.currentTarget) open() },
          },
          pinned ? h('span', { className: 'sg-pinmark' }, h(IconPin, { size: 13, filled: true })) : h('span', { className: 'sg-dot' }),
          h('span', { className: `sg-rtitle${summary ? '' : ' sg-missing'}` }, title ?? `${t('unknownSession')} · ${id.slice(0, 8)}`),
          h('span', { className: 'sg-time' }, relativeTime(summary?.updatedAt, locale)),
          h('span', { className: 'sg-ractions' },
            h('button', {
              type: 'button', className: 'sg-icon', 'aria-pressed': pinned,
              title: pinned ? t('unpin') : t('pin'), 'aria-label': pinned ? t('unpin') : t('pin'),
              onClick: stop(() => void op({ action: 'pin', sessionId: id, pinned: !pinned }).catch(() => {})),
            }, h(IconPin, { filled: pinned })),
            h('button', {
              type: 'button', className: 'sg-icon sg-danger', title: t('remove'), 'aria-label': t('remove'),
              onClick: stop(() => void op({ action: 'remove', sessionId: id }).catch(() => {})),
            }, h(IconX))))
        }

        function Group({ group, index, count, groups, list, locale, view }) {
          const [picking, setPicking] = React.useState(false)
          const collapsed = view.collapsed.has(group.id)
          const editing = view.editing === group.id
          const toggle = () => {
            const next = new Set(view.collapsed)
            if (collapsed) next.delete(group.id); else next.add(group.id)
            store.setView({ collapsed: next })
          }
          const members = orderedMembers(group, list.byId)
          const pinned = new Set(group.pinned)
          const iconBtn = (label, icon, onClick, extra = {}) => h('button', {
            type: 'button', className: `sg-icon${extra.danger ? ' sg-danger' : ''}`, title: label, 'aria-label': label,
            disabled: extra.disabled, style: extra.disabled ? { opacity: 0.35, cursor: 'default' } : undefined, onClick,
          }, icon)
          return h('section', { className: 'sg-group' },
            h('div', { className: 'sg-ghead' },
              iconBtn(collapsed ? t('expand') : t('collapse'), h(IconChevron, { open: !collapsed }), toggle),
              editing
                ? h(GroupName, { group, editing })
                : h('div', { className: 'sg-gname', onClick: toggle, onDoubleClick: () => store.setView({ editing: group.id }) },
                  h('b', null, group.name),
                  h('span', { className: 'sg-count' }, tf('sessions', { n: group.sessionIds.length }))),
              h('div', { className: 'sg-gactions' },
                iconBtn(t('addSession'), h(IconPlus), () => { setPicking(p => !p); if (collapsed) toggle() }),
                iconBtn(t('rename'), h(IconEdit), () => store.setView({ editing: group.id })),
                iconBtn(t('moveUp'), h(IconUp), () => void op({ action: 'move_group', groupId: group.id, beforeGroupId: groups[index - 1]?.id }).catch(() => {}), { disabled: index === 0 }),
                iconBtn(t('moveDown'), h(IconDown), () => void op({ action: 'move_group', groupId: group.id, beforeGroupId: groups[index + 2]?.id }).catch(() => {}), { disabled: index === count - 1 }),
                iconBtn(t('delete'), h(IconTrash), () => {
                  if (window.confirm(tf('deleteConfirm', { name: group.name }))) void op({ action: 'delete', groupId: group.id }).catch(() => {})
                }, { danger: true }))),
            collapsed ? null : h('div', { className: 'sg-list' },
              picking ? h(Picker, { group, groups, list, onClose: () => setPicking(false) }) : null,
              members.length === 0 && !picking ? h('div', { className: 'sg-gempty' }, t('emptyGroup')) : null,
              members.map(id => h(SessionRow, { key: id, id, summary: list.byId[id], pinned: pinned.has(id), locale }))))
        }

        function GroupsPage() {
          const loc = useLocale()
          const { groups, status, error } = useGroups()
          const list = useSessions()
          const view = store.view()
          const create = async () => {
            try {
              const { groupId } = await op({ action: 'create', name: t('defaultName') })
              store.setView({ editing: groupId })
            } catch {}
          }
          return h('div', { className: 'sg-page' },
            h('style', null, CSS),
            h('div', { className: 'sg-inner' },
              h('div', { className: 'sg-head' },
                h('h1', { className: 'sg-title' }, t('panel')),
                h('button', { type: 'button', className: 'sg-btn', onClick: create }, h(IconPlus), t('newGroup'))),
              status === 'error'
                ? h('div', { className: 'sg-error' }, `${t('loadFailed')}: ${error}`,
                  h('button', { type: 'button', className: 'sg-btn', onClick: () => void load() }, t('retry')))
                : null,
              status === 'ready' && groups.length === 0 ? h('div', { className: 'sg-empty' }, t('empty')) : null,
              groups.map((group, index) => h(Group, {
                key: group.id, group, index, count: groups.length, groups, list, locale: loc.active, view,
              }))))
        }

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: PANEL_ID, locale: NS,
        }, GroupsPage))

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 20, locale: NS, label: () => t('panel'),
        }, ({ size }) => h(IconGroups, { size: size ?? 16 })))
      },
      _internal: { orderedMembers, groupOf },
    }
  },
})
