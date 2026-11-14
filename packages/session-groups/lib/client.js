/**
 * dsh-session-groups — browser half.
 *
 * - A "Session groups" launcher in the sidebar panel list opens a main panel
 *   that lists the custom groups; pinned sessions lead each group, the rest
 *   follow by last activity.
 * - The sidebar session list shows the groups as folders above the built-in
 *   Workspace list; grouped sessions leave that list while they belong to a
 *   group, so it keeps only the remaining sessions.
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
    const ReactDOM = require('react-dom')
    const h = React.createElement
    const NS = 'session-groups'
    const PANEL_ID = 'session-groups'

    const EN = {
      panel: 'Session groups',
      newGroup: 'New group',
      defaultName: 'New group',
      empty: 'No groups yet. Right-click a session in the sidebar and choose Add to group, or',
      emptyGroup: 'No sessions yet.',
      addSession: 'Add session',
      searchPlaceholder: 'Search sessions',
      noMatches: 'No sessions match "{q}"',
      noCandidates: 'Every session is already in this group',
      moreResults: 'Showing the first {n}. Keep typing to narrow down.',
      inGroup: 'In {name}',
      clear: 'Clear search',
      done: 'Done',
      hintMove: 'Select',
      hintAdd: 'Add',
      hintClose: 'Close',
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
      dropNew: 'Drop here to create a new group',
      dropInto: 'Drag sessions here',
    }
    const ZH = {
      panel: '会话分组',
      newGroup: '新建分组',
      defaultName: '新分组',
      empty: '还没有分组。在侧边栏会话上右键选“加入分组”，或者',
      emptyGroup: '还没有会话。',
      addSession: '添加会话',
      searchPlaceholder: '搜索会话',
      noMatches: '没有匹配“{q}”的会话',
      noCandidates: '所有会话都已在这个分组里',
      moreResults: '只显示前 {n} 条，继续输入可缩小范围',
      inGroup: '在“{name}”中',
      clear: '清除搜索',
      done: '完成',
      hintMove: '选择',
      hintAdd: '添加',
      hintClose: '关闭',
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
      dropNew: '拖到这里新建分组',
      dropInto: '把会话拖到这里',
    }

    // ---------------------------------------------------------------- store
    /** Host-owned groups plus local view state (collapsed groups, the group being renamed). */
    // Collapsed groups are a browser-local view preference shared by the sidebar and the page.
    const COLLAPSED_KEY = 'dsh-session-groups.collapsed'
    function readCollapsed() {
      try {
        const raw = JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? '[]')
        return new Set(Array.isArray(raw) ? raw.filter(x => typeof x === 'string') : [])
      } catch { return new Set() }
    }

    function createStore() {
      let state = { groups: [], status: 'loading', error: null }
      let view = { collapsed: readCollapsed(), editing: null }
      const listeners = new Set()
      const emit = () => listeners.forEach(fn => fn())
      return {
        getSnapshot: () => state,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
        set(patch) { state = { ...state, ...patch }; emit() },
        view: () => view,
        setView(patch) {
          view = { ...view, ...patch }
          if (patch.collapsed) { try { localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...patch.collapsed])) } catch {} }
          state = { ...state }
          emit()
        },
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
    const IconFolderClosed = ({ size = 16 }) => svg(size,
      h('path', { d: 'M2 4.2a1 1 0 0 1 1-1h3l1.3 1.4H13a1 1 0 0 1 1 1v6.2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z' }))
    const IconFolderOpen = ({ size = 16 }) => svg(size, [
      h('path', { key: 'a', d: 'M2 11.8V4.2a1 1 0 0 1 1-1h3l1.3 1.4H12a1 1 0 0 1 1 1V7' }),
      h('path', { key: 'b', d: 'M2 11.8 3.6 7.7a1 1 0 0 1 .9-.7h9.1a.6.6 0 0 1 .6.8l-1.4 4a1 1 0 0 1-.9.7H3a1 1 0 0 1-1-.7z' }),
    ])
    const IconPin = ({ size = 14, filled }) => svg(size, [
      h('path', { key: 'a', d: 'M6 2.5h4l-.6 3.6 2.1 2.2v1H4.5v-1l2.1-2.2z', fill: filled ? 'currentColor' : 'none' }),
      h('path', { key: 'b', d: 'M8 9.3V13.5' }),
    ])
    const IconSearch = ({ size = 16 }) => svg(size, [
      h('circle', { key: 'a', cx: 7, cy: 7, r: 4.25 }),
      h('path', { key: 'b', d: 'M10.2 10.2 13.5 13.5' }),
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
.sg-page{--sg-hover:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));--sg-tertiary:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));--sg-caption:var(--dsw-alias-label-caption,var(--sg-tertiary));--sg-border:var(--dsw-alias-border-l4,var(--dsw-alias-border-l2));--sg-ease:var(--ds-ease-in-out,ease);--sg-r-xs:var(--dsw-radius-xs,4px);--sg-r-sm:var(--dsw-radius-sm,6px);--sg-r-md:var(--dsw-radius-md,8px);--sg-r-lg:var(--dsw-radius-lg,12px);--sg-focus:var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
.sg-page button:focus-visible{outline:2px solid var(--sg-focus);outline-offset:-2px}
.sg-inner{max-width:1008px;margin:0 auto;padding:30px 24px 64px}
.sg-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
.sg-title{margin:0;font-size:20px;line-height:28px;font-weight:500}
.sg-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px 0 10px;border:.5px solid var(--sg-border);border-radius:var(--sg-r-md);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:18px;cursor:pointer;transition:background-color .15s var(--sg-ease)}
.sg-btn:hover{background:var(--sg-hover)}
.sg-btn.sg-primary{padding:0 14px 0 12px;border:0;border-radius:999px;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}
.sg-btn.sg-primary:hover{background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary)))}
.sg-page .sg-btn.sg-primary:focus-visible{outline-offset:2px}
.sg-icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--sg-r-sm);background:transparent;color:var(--sg-tertiary);cursor:pointer;flex:none;transition:background-color .15s var(--sg-ease),color .15s var(--sg-ease)}
.sg-icon:hover:not(:disabled){background:var(--sg-hover);color:var(--dsw-alias-label-primary)}
.sg-icon:disabled{opacity:.35;cursor:default}
.sg-icon[aria-pressed=true]{background:var(--sg-hover);color:var(--dsw-alias-label-primary)}
.sg-icon.sg-danger:hover{color:var(--dsw-alias-state-error-primary)}
.sg-emptystate{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:96px;padding:0 24px;text-align:center;color:var(--sg-tertiary);font-size:13px;line-height:20px}
.sg-emptystate>svg{color:var(--sg-caption);margin-bottom:4px}
.sg-link{padding:0;border:0;background:none;color:var(--dsw-alias-link,var(--dsw-alias-brand-primary));font:inherit;cursor:pointer}
.sg-error{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 8px 8px 14px;margin-bottom:16px;border:.5px solid var(--sg-border);border-radius:var(--sg-r-md);color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:18px}
.sg-group{padding:4px;border:.5px solid var(--sg-border);border-radius:var(--sg-r-lg)}
.sg-group+.sg-group{margin-top:12px}
.sg-ghead{display:flex;align-items:center;gap:4px;height:36px;padding:0 4px 0 2px;border-radius:var(--sg-r-md)}
.sg-gname{flex:1;min-width:0;display:flex;align-items:center;gap:8px;height:100%;cursor:pointer;user-select:none}
.sg-gname b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:20px;font-weight:500}
.sg-count{flex:none;font-size:12px;line-height:20px;color:var(--sg-tertiary)}
.sg-gactions{display:flex;gap:2px;opacity:0;transition:opacity .12s var(--sg-ease)}
.sg-ghead:hover .sg-gactions,.sg-ghead:focus-within .sg-gactions,.sg-gactions:has([aria-pressed=true]){opacity:1}
.sg-rename{flex:1;min-width:0;height:28px;padding:0 6px;border:.5px solid var(--sg-focus);border-radius:var(--sg-r-sm);background:var(--dsw-alias-button-elevated-fill,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:20px;font-weight:500;outline:none}
.sg-list>*+*{margin-top:2px}
.sg-row{display:flex;align-items:center;gap:8px;height:32px;padding:0 6px 0 10px;border-radius:var(--sg-r-md);cursor:pointer;transition:background-color .12s var(--sg-ease)}
.sg-row:hover,.sg-row:focus-visible{background:var(--sg-hover);outline:none}
.sg-lead{display:inline-flex;align-items:center;justify-content:center;width:16px;flex:none;color:var(--sg-caption)}
.sg-rtitle{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:20px}
.sg-rtitle.sg-missing{color:var(--sg-caption)}
.sg-time{flex:none;font-size:10px;line-height:16px;color:var(--sg-tertiary)}
.sg-ractions{display:none;gap:2px;margin-right:-2px}
.sg-ractions .sg-icon{width:24px;height:24px}
.sg-row:hover .sg-ractions,.sg-row:focus-within .sg-ractions{display:flex}
.sg-row:hover .sg-time,.sg-row:focus-within .sg-time{display:none}
.sg-gempty{padding:6px 10px 10px 34px;font-size:12px;line-height:18px;color:var(--sg-tertiary)}
.sg-sp{margin:2px 0 6px;padding:6px;border-radius:var(--sg-r-lg);background:var(--dsw-alias-bg-layer-1);box-shadow:inset 0 0 0 .5px var(--sg-border);animation:sg-in .16s var(--sg-ease)}
@keyframes sg-in{from{opacity:0;transform:translateY(-3px)}}
.sg-search{display:flex;align-items:center;height:32px;padding-right:4px;border:.5px solid var(--sg-border);border-radius:var(--sg-r-md);background:var(--dsw-alias-bg-base);color:var(--sg-tertiary);transition:border-color .15s var(--sg-ease)}
.sg-search:focus-within{border-color:var(--sg-focus)}
.sg-search-icon{display:inline-flex;align-items:center;justify-content:center;width:30px;flex:none}
.sg-search-input{flex:1;min-width:0;height:100%;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:18px}
.sg-search-input::placeholder{color:var(--sg-tertiary)}
.sg-search-input::-webkit-search-cancel-button{display:none}
.sg-clear{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--sg-r-sm);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}
.sg-clear:hover{background:var(--sg-hover)}
.sg-results{max-height:288px;overflow-y:auto;margin-top:4px;scrollbar-width:thin}
.sg-results>*+*{margin-top:2px}
.sg-result{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 6px 0 10px;border:0;border-radius:var(--sg-r-md);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
.sg-result[aria-selected=true]{background:var(--sg-hover)}
.sg-result-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.sg-result-title mark{background:none;color:var(--dsw-alias-label-primary);font-weight:600}
.sg-result-title.sg-plain{color:var(--dsw-alias-label-primary)}
.sg-result-meta{flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:17px;color:var(--sg-tertiary)}
.sg-result-add{display:inline-flex;flex:none;color:var(--sg-tertiary);opacity:0;transition:opacity .12s var(--sg-ease)}
.sg-result[aria-selected=true] .sg-result-add{opacity:1}
.sg-status{padding:10px 10px;font-size:12px;line-height:18px;color:var(--sg-tertiary)}
.sg-spfoot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;padding:6px 0 0 10px;border-top:.5px solid var(--dsw-alias-border-l1)}
.sg-hint{display:flex;gap:12px;font-size:11px;line-height:16px;color:var(--sg-tertiary);white-space:nowrap;overflow:hidden}
.sg-hint kbd{display:inline-block;min-width:16px;margin-right:4px;padding:0 3px;border:.5px solid var(--sg-border);border-radius:var(--sg-r-xs);font:inherit;font-size:10px;line-height:14px;text-align:center;color:var(--dsw-alias-label-secondary)}
.sg-textbtn{flex:none;height:24px;padding:0 10px;border:0;border-radius:var(--sg-r-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
.sg-textbtn:hover{background:var(--sg-hover);color:var(--dsw-alias-label-primary)}
.sg-group{transition:box-shadow .12s var(--sg-ease),background-color .12s var(--sg-ease)}
.sg-group.sg-dropping{background:var(--sg-hover);box-shadow:inset 0 0 0 1.5px var(--sg-focus)}
.sg-row[draggable=true]{cursor:grab}
.sg-dropzone{display:flex;align-items:center;justify-content:center;gap:8px;height:56px;margin-top:12px;border:1px dashed var(--sg-border);border-radius:var(--sg-r-lg);color:var(--sg-tertiary);font-size:13px;line-height:18px;transition:border-color .12s var(--sg-ease),background-color .12s var(--sg-ease),color .12s var(--sg-ease)}
.sg-dropzone.sg-dropping{border-color:var(--sg-focus);background:var(--sg-hover);color:var(--dsw-alias-label-primary)}
@media (hover:none){.sg-gactions{opacity:1}.sg-ractions{display:flex}.sg-time,.sg-hint{display:none}}
@media (pointer:coarse){.sg-search-input,.sg-rename{font-size:16px}}
@media (prefers-reduced-motion:reduce){.sg-sp{animation:none}.sg-page *{transition:none!important}}
`

    // Sidebar folders. Geometry follows the built-in Workspace rows through the
    // sidebar's inherited --dsh-sidebar-* properties.
    const SIDEBAR_CSS = `
.sgs-host:only-child{display:none}
.sgs-root{margin-bottom:10px;padding-bottom:8px;border-bottom:.5px solid var(--dsw-alias-border-l1,transparent)}
.sgs-root>*+*,.sgs-folder>*+*{margin-top:2px}
.sgs-folder{border-radius:var(--dsw-radius-md,8px);transition:box-shadow .12s var(--ds-ease-in-out,ease)}
.sgs-folder.sgs-dropping{box-shadow:inset 0 0 0 1.5px var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary))}
.sgs-row{position:relative;display:flex;align-items:center;height:32px;border-radius:var(--dsw-radius-md,8px);border-inline:var(--dsh-sidebar-paint-inset,3px) solid transparent;background-clip:padding-box;box-sizing:border-box;padding:0 8px 0 calc(var(--dsh-sidebar-row-padding,12px) - var(--dsh-sidebar-paint-inset,3px));cursor:pointer;user-select:none;-webkit-user-select:none;color:var(--dsw-alias-label-primary);outline:none}
.sgs-row:focus-visible{box-shadow:inset 0 0 0 1.5px var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary))}
.sgs-row.sgs-selected{background-color:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.sgs-row:hover{background-color:var(--dsw-alias-interactive-bg-hover)}}
.sgs-slot{flex:none;display:inline-flex;align-items:center;justify-content:center;width:16px;height:20px;color:var(--dsw-alias-label-tertiary)}
.sgs-folder-icon.sgs-active{color:var(--dsw-alias-state-business-primary)}
.sgs-chev{display:none;align-items:center}
@media (hover:hover){.sgs-head:hover .sgs-chev{display:inline-flex}.sgs-head:hover .sgs-glyph{display:none}}
.sgs-glyph{display:inline-flex}
.sgs-title{flex:1;min-width:0;margin:0 6px 0 var(--dsh-sidebar-label-gap,6px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:20px}
.sgs-member .sgs-title{color:var(--dsw-alias-label-primary)}
.sgs-rest{flex:none;display:inline-flex;align-items:center;gap:4px}
.sgs-time,.sgs-count{font-size:10px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.sgs-count{font-size:12px;line-height:20px}
.sgs-pinmark{display:inline-flex;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary))}
.sgs-actions{flex:none;display:none;align-items:center;gap:2px;margin-right:-4px}
@media (hover:hover){.sgs-row:hover .sgs-actions,.sgs-row:focus-within .sgs-actions{display:inline-flex}.sgs-row:hover .sgs-rest,.sgs-row:focus-within .sgs-rest{display:none}}
@media (hover:none){.sgs-head .sgs-actions{display:inline-flex}.sgs-head .sgs-rest{display:none}}
.sgs-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.sgs-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.12))}
.sgs-btn[aria-pressed=true]{color:var(--dsw-alias-label-primary)}
.sgs-btn.sgs-danger:hover{color:var(--dsw-alias-state-error-primary)}
.sgs-running{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));animation:sgs-pulse 1.4s ease-in-out infinite}
@keyframes sgs-pulse{50%{opacity:.35}}
.sgs-rename{flex:1;min-width:0;height:24px;margin:0 0 0 var(--dsh-sidebar-label-gap,6px);padding:0 6px;border:.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));border-radius:var(--dsw-radius-sm,6px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:20px;outline:none}
.sgs-hint{height:28px;padding-inline-start:calc(var(--dsh-sidebar-row-padding,12px) + 16px + var(--dsh-sidebar-label-gap,6px));font-size:12px;line-height:28px;color:var(--dsw-alias-label-tertiary)}
.sgs-dropnew{border:1px dashed var(--dsw-alias-border-l4,var(--dsw-alias-border-l2));color:var(--dsw-alias-label-tertiary)}
.sgs-dropnew .sgs-title{color:inherit;font-size:13px}
.sgs-dropnew.sgs-dropping{border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
@media (pointer:coarse){.sgs-rename{font-size:16px}}
@media (prefers-reduced-motion:reduce){.sgs-running{animation:none}.sgs-folder{transition:none}}
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

        // -------------------------------------------------------------- drag
        // Sidebar session rows drag with `text/plain` = session id; rows on this
        // page do the same, so one drop path serves both sources.
        const carriesText = e => Array.from(e.dataTransfer?.types ?? []).includes('text/plain')

        /** True while any document drag is in progress (reveals the new-group zone). */
        function useDocumentDragging() {
          const [dragging, setDragging] = React.useState(false)
          React.useEffect(() => {
            const on = e => { if (carriesText(e)) setDragging(true) }
            const off = () => setDragging(false)
            document.addEventListener('dragstart', on)
            document.addEventListener('dragend', off)
            document.addEventListener('drop', off)
            return () => {
              document.removeEventListener('dragstart', on)
              document.removeEventListener('dragend', off)
              document.removeEventListener('drop', off)
            }
          }, [])
          return dragging
        }

        /** Drop-target props that accept a known session id; `over` drives the highlight. */
        function useSessionDrop(list, onSession) {
          const [over, setOver] = React.useState(false)
          const depth = React.useRef(0)
          const latest = React.useRef({ list, onSession })
          latest.current = { list, onSession }
          const props = {
            onDragEnter: e => {
              if (!carriesText(e)) return
              e.preventDefault()
              depth.current += 1
              setOver(true)
            },
            onDragOver: e => {
              if (!carriesText(e)) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            },
            onDragLeave: () => {
              depth.current = Math.max(0, depth.current - 1)
              if (depth.current === 0) setOver(false)
            },
            onDrop: e => {
              depth.current = 0
              setOver(false)
              const id = e.dataTransfer?.getData('text/plain')?.trim()
              const summary = id ? latest.current.list.byId[id] : undefined
              if (!summary || summary.blank) return
              e.preventDefault()
              e.stopPropagation()
              latest.current.onSession(id)
            },
          }
          return { over, props }
        }

        // -------------------------------------------------------- components
        function GroupName({ group, editing, className = 'sg-rename' }) {
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
            ref, className, value, maxLength: 80, 'aria-label': t('rename'),
            onClick: e => e.stopPropagation(),
            onDoubleClick: e => e.stopPropagation(),
            onChange: e => setValue(e.target.value),
            onBlur: commit,
            onKeyDown: e => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') { e.preventDefault(); store.setView({ editing: null }) }
            },
          })
        }

        /** Wrap the first case-insensitive match of `q` in <mark>. */
        function highlight(text, q) {
          if (!q) return text
          const at = text.toLowerCase().indexOf(q)
          if (at < 0) return text
          return [text.slice(0, at), h('mark', { key: 'm' }, text.slice(at, at + q.length)), text.slice(at + q.length)]
        }

        const PICK_LIMIT = 50
        const dirName = cwd => (cwd ?? '').split(/[\\/]/).filter(Boolean).pop() ?? ''

        function Picker({ group, groups, list, onClose }) {
          const [query, setQuery] = React.useState('')
          const [active, setActive] = React.useState(0)
          const inputRef = React.useRef(null)
          const listRef = React.useRef(null)
          React.useEffect(() => { inputRef.current?.focus() }, [])
          const q = query.trim().toLowerCase()
          const { items, total } = React.useMemo(() => {
            const owner = new Map()
            for (const g of groups) for (const id of g.sessionIds) owner.set(id, g)
            const all = list.ids
              .map(id => list.byId[id])
              .filter(s => s && !s.blank && s.origin !== 'subagent' && owner.get(s.id) !== group)
              .filter(s => !q || (s.displayTitle ?? '').toLowerCase().includes(q) || s.id.startsWith(q))
              .toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
            return { items: all.slice(0, PICK_LIMIT).map(s => ({ s, owner: owner.get(s.id) })), total: all.length }
          }, [list, groups, group, q])
          const current = Math.min(active, Math.max(items.length - 1, 0))
          React.useEffect(() => {
            listRef.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' })
          }, [current, items])
          const add = item => { if (item) void op({ action: 'add', groupId: group.id, sessionId: item.s.id }).catch(() => {}) }
          const onKeyDown = e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(current + 1, items.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(current - 1, 0)) }
            else if (e.key === 'Enter') { e.preventDefault(); add(items[current]) }
            else if (e.key === 'Escape') {
              e.preventDefault(); e.stopPropagation()
              if (query) { setQuery(''); setActive(0) } else onClose()
            }
          }
          const status = items.length === 0
            ? (q ? tf('noMatches', { q: query.trim() }) : t('noCandidates'))
            : total > PICK_LIMIT ? tf('moreResults', { n: PICK_LIMIT }) : null
          const kbd = (key, label) => h('span', null, h('kbd', null, key), label)
          return h('div', { className: 'sg-sp' },
            h('div', { className: 'sg-search' },
              h('span', { className: 'sg-search-icon' }, h(IconSearch)),
              h('input', {
                ref: inputRef, className: 'sg-search-input', type: 'search', value: query,
                placeholder: t('searchPlaceholder'), 'aria-label': t('searchPlaceholder'),
                role: 'combobox', 'aria-expanded': true, 'aria-controls': `sg-results-${group.id}`,
                'aria-activedescendant': items[current] ? `sg-opt-${group.id}-${items[current].s.id}` : undefined,
                onChange: e => { setQuery(e.target.value); setActive(0) },
                onKeyDown,
              }),
              query ? h('button', {
                type: 'button', className: 'sg-clear', title: t('clear'), 'aria-label': t('clear'),
                onClick: () => { setQuery(''); setActive(0); inputRef.current?.focus() },
              }, h(IconX, { size: 14 })) : null),
            items.length > 0 ? h('div', { ref: listRef, id: `sg-results-${group.id}`, className: 'sg-results', role: 'listbox' },
              items.map((item, i) => h('button', {
                key: item.s.id, id: `sg-opt-${group.id}-${item.s.id}`, type: 'button', tabIndex: -1,
                className: 'sg-result', role: 'option', 'aria-selected': i === current,
                onMouseMove: () => { if (i !== current) setActive(i) },
                onMouseDown: e => e.preventDefault(),
                onClick: () => { add(item); inputRef.current?.focus() },
              },
              h('span', { className: `sg-result-title${q ? '' : ' sg-plain'}` }, highlight(item.s.displayTitle || item.s.id, q)),
              h('span', { className: 'sg-result-meta' }, item.owner ? tf('inGroup', { name: item.owner.name }) : dirName(item.s.cwd)),
              h('span', { className: 'sg-result-add' }, h(IconPlus, { size: 14 }))))) : null,
            status ? h('div', { className: 'sg-status' }, status) : null,
            h('div', { className: 'sg-spfoot' },
              h('div', { className: 'sg-hint' }, kbd('↑↓', t('hintMove')), kbd('↵', t('hintAdd')), kbd('Esc', t('hintClose'))),
              h('button', { type: 'button', className: 'sg-textbtn', onClick: onClose }, t('done'))))
        }

        function SessionRow({ id, summary, pinned, locale }) {
          const title = summary?.displayTitle || summary?.title
          const open = () => { if (summary) ctx.uiWorkspace.openSession(id) }
          const stop = fn => e => { e.stopPropagation(); fn() }
          return h('div', {
            className: 'sg-row', role: 'button', tabIndex: 0, title: title ?? id,
            draggable: Boolean(summary),
            onDragStart: summary ? e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', id)
            } : undefined,
            onClick: open,
            onKeyDown: e => { if (e.key === 'Enter' && e.target === e.currentTarget) open() },
          },
          h('span', { className: 'sg-lead' }, pinned ? h(IconPin, { size: 14, filled: true }) : null),
          h('span', { className: `sg-rtitle${summary ? '' : ' sg-missing'}` }, title ?? `${t('unknownSession')} · ${id.slice(0, 8)}`),
          h('span', { className: 'sg-time' }, relativeTime(summary?.updatedAt, locale)),
          h('span', { className: 'sg-ractions' },
            h('button', {
              type: 'button', className: 'sg-icon', 'aria-pressed': pinned,
              title: pinned ? t('unpin') : t('pin'), 'aria-label': pinned ? t('unpin') : t('pin'),
              onClick: stop(() => void op({ action: 'pin', sessionId: id, pinned: !pinned }).catch(() => {})),
            }, h(IconPin, { size: 15, filled: pinned })),
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
          const drop = useSessionDrop(list, sessionId => {
            if (group.sessionIds.includes(sessionId)) return
            if (collapsed) toggle()
            void op({ action: 'add', groupId: group.id, sessionId }).catch(() => {})
          })
          const members = orderedMembers(group, list.byId)
          const pinned = new Set(group.pinned)
          const iconBtn = (label, icon, onClick, extra = {}) => h('button', {
            type: 'button', className: `sg-icon${extra.danger ? ' sg-danger' : ''}`, title: label, 'aria-label': label,
            disabled: extra.disabled, 'aria-pressed': extra.pressed, onClick,
          }, icon)
          return h('section', { className: `sg-group${drop.over ? ' sg-dropping' : ''}`, ...drop.props },
            h('div', { className: 'sg-ghead' },
              iconBtn(collapsed ? t('expand') : t('collapse'), h(IconChevron, { open: !collapsed }), toggle),
              editing
                ? h(GroupName, { group, editing })
                : h('div', { className: 'sg-gname', onClick: toggle, onDoubleClick: () => store.setView({ editing: group.id }) },
                  h('b', null, group.name),
                  h('span', { className: 'sg-count' }, tf('sessions', { n: group.sessionIds.length }))),
              h('div', { className: 'sg-gactions' },
                iconBtn(t('addSession'), h(IconPlus, { size: 15 }), () => { setPicking(p => !p); if (collapsed) toggle() }, { pressed: picking }),
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
          const create = async sessionId => {
            try {
              const { groupId } = await op(sessionId
                ? { action: 'create', name: t('defaultName'), sessionId }
                : { action: 'create', name: t('defaultName') })
              store.setView({ editing: groupId })
            } catch {}
          }
          const dragging = useDocumentDragging()
          const newDrop = useSessionDrop(list, sessionId => void create(sessionId))
          return h('div', { className: 'sg-page' },
            h('style', null, CSS),
            h('div', { className: 'sg-inner' },
              h('div', { className: 'sg-head' },
                h('h1', { className: 'sg-title' }, t('panel')),
                h('button', { type: 'button', className: 'sg-btn sg-primary', onClick: () => void create() }, h(IconPlus, { size: 14 }), t('newGroup'))),
              status === 'error'
                ? h('div', { className: 'sg-error' }, `${t('loadFailed')}: ${error}`,
                  h('button', { type: 'button', className: 'sg-btn', onClick: () => void load() }, t('retry')))
                : null,
              status === 'ready' && groups.length === 0
                ? h('div', { className: 'sg-emptystate' }, h(IconGroups, { size: 32 }),
                  h('div', null, t('empty'), ' ', h('button', { type: 'button', className: 'sg-link', onClick: () => void create() }, t('newGroup'))))
                : null,
              groups.map((group, index) => h(Group, {
                key: group.id, group, index, count: groups.length, groups, list, locale: loc.active, view,
              })),
              status === 'ready' && (dragging || newDrop.over)
                ? h('div', { className: `sg-dropzone${newDrop.over ? ' sg-dropping' : ''}`, ...newDrop.props },
                  h(IconPlus, { size: 14 }), t('dropNew'))
                : null))
        }

        // ------------------------------------------------- sidebar folders
        // The built-in Workspace browser owns the session list; it marks its
        // scroller `data-sidebar-list-area` and each Session row
        // `data-row-key="session:<id>"` as stable integration markers. The
        // groups render as folders at the top of that scroller, and a style
        // rule hides grouped sessions from the built-in rows below.
        const MEMBER_MIME = 'application/x-dsh-session-group-member'
        const GROUP_MIME = 'application/x-dsh-session-group'
        const hasType = (e, type) => Array.from(e.dataTransfer?.types ?? []).includes(type)
        const usePanelInfo = () => React.useSyncExternalStore(
          fn => ctx.layout.panelInfo.subscribe(fn),
          () => ctx.layout.panelInfo.getSnapshot(),
        )

        /** The Workspace browser's list scroller, and whether its search is showing results instead. */
        function useListArea() {
          const [found, setFound] = React.useState({ area: null, searching: false })
          React.useEffect(() => {
            let frame = 0
            const check = () => {
              frame = 0
              const area = document.querySelector('[data-sidebar-list-area]')
              const input = document.querySelector('[data-sidebar-workspace-header] input')
              const searching = Boolean(input && input.value.trim())
              setFound(prev => prev.area === area && prev.searching === searching ? prev : { area, searching })
            }
            const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
            check()
            const observer = new MutationObserver(schedule)
            observer.observe(document.body, { childList: true, subtree: true })
            document.addEventListener('input', schedule, true)
            return () => {
              observer.disconnect()
              document.removeEventListener('input', schedule, true)
              if (frame) cancelAnimationFrame(frame)
            }
          }, [])
          return found
        }

        function SidebarMember({ id, summary, group, pinned, current, locale }) {
          const title = summary.displayTitle || summary.title || id
          const stop = fn => e => { e.preventDefault(); e.stopPropagation(); fn() }
          const open = () => ctx.uiWorkspace.openSession(id)
          return h('div', {
            className: `sgs-row sgs-member${current ? ' sgs-selected' : ''}`,
            role: 'treeitem', 'aria-selected': current, tabIndex: 0, title,
            draggable: true,
            onDragStart: e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', id)
              e.dataTransfer.setData(MEMBER_MIME, id)
            },
            onClick: open,
            onKeyDown: e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); open() } },
            onContextMenu: e => {
              e.preventDefault()
              e.stopPropagation()
              ctx.contextMenus.open({ kind: 'session', value: { sessionId: id, displayTitle: summary.title ?? '' } }, { x: e.clientX, y: e.clientY })
            },
          },
          h('span', { className: 'sgs-slot' }, summary.running ? h('span', { className: 'sgs-running', 'aria-hidden': true }) : null),
          h('span', { className: 'sgs-title' }, title),
          h('span', { className: 'sgs-rest' },
            h('span', { className: 'sgs-time' }, relativeTime(summary.updatedAt, locale)),
            pinned ? h('span', { className: 'sgs-pinmark', title: t('unpin') }, h(IconPin, { size: 13, filled: true })) : null),
          h('span', { className: 'sgs-actions' },
            h('button', {
              type: 'button', className: 'sgs-btn', tabIndex: -1, 'aria-pressed': pinned,
              title: pinned ? t('unpin') : t('pin'), 'aria-label': pinned ? t('unpin') : t('pin'),
              onClick: stop(() => void op({ action: 'pin', sessionId: id, pinned: !pinned }).catch(() => {})),
            }, h(IconPin, { size: 14, filled: pinned })),
            h('button', {
              type: 'button', className: 'sgs-btn', tabIndex: -1,
              title: `${t('remove')} · ${group.name}`, 'aria-label': t('remove'),
              onClick: stop(() => void op({ action: 'remove', sessionId: id }).catch(() => {})),
            }, h(IconX, { size: 14 }))))
        }

        function SidebarFolder({ group, index, groups, list, view, currentId, locale }) {
          const collapsed = view.collapsed.has(group.id)
          const editing = view.editing === group.id
          const [over, setOver] = React.useState(false)
          const depth = React.useRef(0)
          const setCollapsed = value => {
            const next = new Set(view.collapsed)
            if (value) next.add(group.id); else next.delete(group.id)
            store.setView({ collapsed: next })
          }
          const members = orderedMembers(group, list.byId)
            .filter(id => list.byId[id] && list.byId[id].origin !== 'subagent')
          const pinned = new Set(group.pinned)
          const containsCurrent = currentId !== undefined && group.sessionIds.includes(currentId)
          const accepts = e => hasType(e, GROUP_MIME) || hasType(e, 'text/plain')
          const dropProps = {
            onDragEnter: e => { if (!accepts(e)) return; e.preventDefault(); depth.current += 1; setOver(true) },
            onDragOver: e => { if (!accepts(e)) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move' },
            onDragLeave: () => { depth.current = Math.max(0, depth.current - 1); if (depth.current === 0) setOver(false) },
            onDrop: e => {
              depth.current = 0
              setOver(false)
              if (hasType(e, GROUP_MIME)) {
                e.preventDefault(); e.stopPropagation()
                const dragged = e.dataTransfer.getData(GROUP_MIME)
                const from = groups.findIndex(g => g.id === dragged)
                if (from < 0 || from === index) return
                const beforeGroupId = from < index ? groups[index + 1]?.id : group.id
                void op({ action: 'move_group', groupId: dragged, beforeGroupId }).catch(() => {})
                return
              }
              const id = e.dataTransfer.getData('text/plain')?.trim()
              const summary = id ? list.byId[id] : undefined
              if (!summary || summary.blank) return
              e.preventDefault(); e.stopPropagation()
              if (collapsed) setCollapsed(false)
              if (!group.sessionIds.includes(id)) void op({ action: 'add', groupId: group.id, sessionId: id }).catch(() => {})
            },
          }
          const stop = fn => e => { e.preventDefault(); e.stopPropagation(); fn() }
          return h('div', { className: `sgs-folder${over ? ' sgs-dropping' : ''}`, role: 'group', ...dropProps },
            h('div', {
              className: 'sgs-row sgs-head', role: 'treeitem', 'aria-expanded': !collapsed, tabIndex: 0,
              draggable: !editing,
              onDragStart: e => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData(GROUP_MIME, group.id)
              },
              onClick: () => { if (!editing) setCollapsed(!collapsed) },
              onDoubleClick: stop(() => store.setView({ editing: group.id })),
              onKeyDown: e => {
                if (e.target !== e.currentTarget) return
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(!collapsed) }
                if (e.key === 'F2') { e.preventDefault(); store.setView({ editing: group.id }) }
              },
            },
            h('span', { className: `sgs-slot sgs-folder-icon${containsCurrent && collapsed ? ' sgs-active' : ''}` },
              h('span', { className: 'sgs-glyph' }, h(collapsed ? IconFolderClosed : IconFolderOpen, { size: 16 })),
              h('span', { className: 'sgs-chev' }, h(IconChevron, { size: 12, open: !collapsed }))),
            editing
              ? h(GroupName, { group, editing, className: 'sgs-rename' })
              : h('span', { className: 'sgs-title sgs-gname' }, group.name),
            editing ? null : h('span', { className: 'sgs-rest' }, h('span', { className: 'sgs-count' }, members.length)),
            editing ? null : h('span', { className: 'sgs-actions' },
              h('button', {
                type: 'button', className: 'sgs-btn', tabIndex: -1, title: t('rename'), 'aria-label': t('rename'),
                onClick: stop(() => store.setView({ editing: group.id })),
              }, h(IconEdit, { size: 14 })),
              h('button', {
                type: 'button', className: 'sgs-btn sgs-danger', tabIndex: -1, title: t('delete'), 'aria-label': t('delete'),
                onClick: stop(() => {
                  if (window.confirm(tf('deleteConfirm', { name: group.name }))) void op({ action: 'delete', groupId: group.id }).catch(() => {})
                }),
              }, h(IconTrash, { size: 14 })))),
            collapsed ? null : members.length === 0
              ? h('div', { className: 'sgs-hint' }, t('dropInto'))
              : members.map(id => h(SidebarMember, {
                key: id, id, summary: list.byId[id], group, pinned: pinned.has(id), current: id === currentId, locale,
              })))
        }

        function SidebarGroups() {
          const { area, searching } = useListArea()
          const loc = useLocale()
          const { groups } = useGroups()
          const list = useSessions()
          const panel = usePanelInfo()
          const view = store.view()
          const dragging = useDocumentDragging()
          const host = React.useMemo(() => {
            const el = document.createElement('div')
            el.className = 'sgs-host'
            return el
          }, [])
          // Keep the folders first in the scroller; the browser's own children follow.
          React.useLayoutEffect(() => {
            if (!area) return undefined
            if (area.firstChild !== host) area.insertBefore(host, area.firstChild)
            return () => host.remove()
          }, [area, host])
          // Dropping a group member back onto the built-in list removes it from its group.
          React.useEffect(() => {
            if (!area) return undefined
            const outside = e => hasType(e, MEMBER_MIME) && !host.contains(e.target)
            const over = e => { if (outside(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' } }
            const drop = e => {
              if (!outside(e)) return
              const id = e.dataTransfer.getData(MEMBER_MIME)
              e.preventDefault()
              e.stopPropagation()
              if (id) void op({ action: 'remove', sessionId: id }).catch(() => {})
            }
            area.addEventListener('dragover', over)
            area.addEventListener('drop', drop)
            return () => { area.removeEventListener('dragover', over); area.removeEventListener('drop', drop) }
          }, [area, host])
          const newDrop = useSessionDrop(list, sessionId => {
            void op({ action: 'create', name: t('defaultName'), sessionId })
              .then(({ groupId }) => store.setView({ editing: groupId }))
              .catch(() => {})
          })
          if (!area) return null
          const currentId = panel.activePanelId == null
            ? Object.values(list.byId).find(s => (s.retainedBy?.mainView ?? 0) > 0)?.id
            : undefined
          const hidden = searching ? [] : groups.flatMap(g => g.sessionIds).filter(id => /^[\w.:-]+$/.test(id))
          const hideCss = hidden.length === 0 ? ''
            : `${hidden.map(id => `[data-sidebar-list-area] [data-row-key="session:${id}"]`).join(',')}{display:none!important}`
          const showDropNew = !searching && (dragging || newDrop.over)
          return ReactDOM.createPortal(h(React.Fragment, null,
            h('style', null, SIDEBAR_CSS + hideCss),
            searching || (groups.length === 0 && !showDropNew) ? null : h('div', {
              className: 'sgs-root', role: 'tree', 'aria-label': t('panel'),
            },
            groups.map((group, index) => h(SidebarFolder, {
              key: group.id, group, index, groups, list, view, currentId, locale: loc.active,
            })),
            showDropNew ? h('div', { className: `sgs-row sgs-dropnew${newDrop.over ? ' sgs-dropping' : ''}`, ...newDrop.props },
              h('span', { className: 'sgs-slot' }, h(IconPlus, { size: 14 })),
              h('span', { className: 'sgs-title' }, t('dropNew'))) : null)), host)
        }

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'session-groups-sidebar', order: 1000,
        }, SidebarGroups))

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
