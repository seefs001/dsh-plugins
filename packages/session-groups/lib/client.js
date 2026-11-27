window.__ModuleLoader__.load({
  id: 'dsh-session-groups',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const {
      Button, Checkbox, DisclosureRow, Input, Menu, Modal, StateDot, Tag, TextShimmer,
      IconChevronDownOutlineRegular, IconChevronUpOutlineRegular,
      IconCloseOutlineRegular, IconEditOutlineRegular, IconFolderCloseRegular, IconFolderOpenRegular,
      IconInspectOutlineRegular, IconPinFillRegular, IconPinOutlineRegular, IconPlusOutlineRegular, IconSearchOutlineRegular,
      IconTrashOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'session-groups'
    const PANEL_ID = 'session-groups'
    const UNGROUPED_KEY = '__ungrouped__'

    const EN = {
      panel: 'Session groups',
      intro: 'Organize sidebar conversations into synced groups and pin important threads at the top.',
      newGroup: 'New group',
      defaultName: 'New group',
      groupsHeading: 'Groups',
      ungrouped: 'Ungrouped sessions',
      ungroupedIntro: 'Conversations not assigned to any group yet. Select several to file them at once, or drag any row onto a group on the left.',
      empty: 'No groups yet.',
      emptyHint: 'Create a group here, or right-click any session in the sidebar and choose Add to group.',
      emptyGroup: 'No sessions in this group yet.',
      emptyGroupHint: 'Add sessions with the button above, or drag any session onto this group.',
      emptyUngrouped: 'Every conversation is already organized into a group.',
      addSession: 'Add sessions',
      closePicker: 'Done adding',
      searchPlaceholder: 'Search sessions to add…',
      filterGroupSessions: 'Filter sessions in this group…',
      filterUngrouped: 'Search ungrouped sessions…',
      noMatches: 'No sessions match “{q}”',
      noFilterMatches: 'No sessions match the current filter.',
      resetFilters: 'Reset filters',
      noCandidates: 'Every session is already in this group.',
      moreResults: 'Showing the first {n}. Keep typing to narrow down.',
      inGroup: 'In {name}',
      clear: 'Clear search',
      done: 'Done',
      hintMove: 'Select',
      hintAdd: 'Add',
      hintClose: 'Close',
      rename: 'Rename',
      delete: 'Delete group',
      cancel: 'Cancel',
      deleteConfirm: 'Delete group “{name}”? Conversations are kept.',
      moveUp: 'Move up',
      moveDown: 'Move down',
      pin: 'Pin in group',
      unpin: 'Unpin in group',
      pinnedBadge: '{n} pinned',
      runningBadge: '{n} running',
      remove: 'Remove from group',
      addTo: 'Add to group',
      moveTo: 'Move to group',
      moveToPick: 'Move to…',
      addToPick: 'Add to group…',
      menuNewGroup: 'New group…',
      unknownSession: 'Unavailable session',
      loadFailed: 'Session groups are not syncing.',
      loading: 'Loading session groups…',
      synced: 'Synced',
      syncing: 'Syncing…',
      offline: 'Not syncing',
      opFailed: 'Could not update session groups',
      retry: 'Retry',
      collapse: 'Collapse',
      expand: 'Expand',
      sessions: '{n} sessions',
      sessionOne: '1 session',
      dropNew: 'Drop here to create a new group',
      dropInto: 'Drag sessions here',
      filterAll: 'All',
      filterPinned: 'Pinned',
      filterRunning: 'Running',
      selectShown: 'Select shown',
      clearSelection: 'Clear',
      selectedCount: '{n} selected',
      addSelectedTo: 'Add to group',
      createWithSelected: 'New group with selected',
      selectSession: 'Select {title}',
      tvStopped: 'Stopped',
      tvInspect: 'Inspect',
      tvInput: 'IN',
      tvOutput: 'OUT',
      tvGroupsCount: '{n} groups',
      tvPinned: 'Pinned',
      tvUnpinned: 'Unpinned',
    }
    const ZH = {
      panel: '会话分组',
      intro: '把侧边栏会话整理到跨端同步的自定义分组中，并可在组内置顶重要对话。',
      newGroup: '新建分组',
      defaultName: '新分组',
      groupsHeading: '分组',
      ungrouped: '未分组会话',
      ungroupedIntro: '尚未归入任何分组的会话。可多选批量归类，或直接拖拽到左侧任意分组。',
      empty: '还没有分组。',
      emptyHint: '点击右上角新建分组，或在侧边栏会话上右键选择“加入分组”。',
      emptyGroup: '这个分组还没有会话。',
      emptyGroupHint: '点击上方“添加会话”，或直接把会话拖到此分组。',
      emptyUngrouped: '所有会话都已归类到分组中。',
      addSession: '添加会话',
      closePicker: '完成添加',
      searchPlaceholder: '搜索要添加的会话…',
      filterGroupSessions: '筛选组内会话…',
      filterUngrouped: '搜索未分组会话…',
      noMatches: '没有匹配“{q}”的会话',
      noFilterMatches: '没有符合当前筛选条件的会话。',
      resetFilters: '重置筛选',
      noCandidates: '所有会话都已在这个分组里。',
      moreResults: '只显示前 {n} 条，继续输入可缩小范围',
      inGroup: '在“{name}”中',
      clear: '清除搜索',
      done: '完成',
      hintMove: '选择',
      hintAdd: '添加',
      hintClose: '关闭',
      rename: '重命名',
      delete: '删除分组',
      cancel: '取消',
      deleteConfirm: '删除分组“{name}”？会话会保留。',
      moveUp: '上移',
      moveDown: '下移',
      pin: '组内置顶',
      unpin: '取消组内置顶',
      pinnedBadge: '{n} 置顶',
      runningBadge: '{n} 运行中',
      remove: '移出分组',
      addTo: '加入分组',
      moveTo: '移到分组',
      moveToPick: '移到…',
      addToPick: '加入分组…',
      menuNewGroup: '新建分组…',
      unknownSession: '不可用的会话',
      loadFailed: '会话分组未同步。',
      loading: '正在加载会话分组…',
      synced: '已同步',
      syncing: '同步中…',
      offline: '未同步',
      opFailed: '更新会话分组失败',
      retry: '重试',
      collapse: '收起',
      expand: '展开',
      sessions: '{n} 个会话',
      sessionOne: '1 个会话',
      dropNew: '拖到这里新建分组',
      dropInto: '把会话拖到这里',
      filterAll: '全部',
      filterPinned: '已置顶',
      filterRunning: '运行中',
      selectShown: '全选当前',
      clearSelection: '取消选择',
      selectedCount: '已选 {n} 个会话',
      addSelectedTo: '加入所选分组',
      createWithSelected: '新建分组并加入',
      selectSession: '选择 {title}',
      tvStopped: '已中止',
      tvInspect: '查看',
      tvInput: '输入',
      tvOutput: '输出',
      tvGroupsCount: '{n} 个分组',
      tvPinned: '已置顶',
      tvUnpinned: '已取消置顶',
    }

    const COLLAPSED_KEY = 'dsh-session-groups.collapsed'
    function readCollapsed() {
      try {
        const raw = JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? '[]')
        return new Set(Array.isArray(raw) ? raw.filter(x => typeof x === 'string') : [])
      } catch { return new Set() }
    }

    function createStore() {
      let state = { groups: [], status: 'loading' }
      let view = { collapsed: readCollapsed(), editing: null, pendingDelete: null, selected: null }
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

    const groupOf = (groups, sessionId) => groups.find(g => g.sessionIds.includes(sessionId))

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

    const svg = (size, children, extra = {}) => h('svg', {
      viewBox: '0 0 16 16', width: size, height: size, fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...extra,
    }, children)
    const IconGroups = ({ size = 16 }) => svg(size, [
      h('path', { key: 'a', d: 'M2 4.5h4l1.2 1.3H14v6.7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z' }),
      h('path', { key: 'b', d: 'M2 4.5v-1a1 1 0 0 1 1-1h2.6l1.2 1.3' }),
    ])
    const IconChevron = ({ size = 12, open }) => svg(size, h('path', { d: 'M6 4l4 4-4 4' }),
      { style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' } })

    const CSS = `
.sg-page{container-type:inline-size;height:100%;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.sg-page *,.sg-page *::before,.sg-page *::after{box-sizing:border-box}
.sg-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.sg-inner{display:flex;flex-direction:column;gap:20px;width:min(100%,1080px);margin:0 auto;padding:28px clamp(20px,3.5vw,44px) 56px}
[data-platform=darwin] .sg-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.sg-inner{padding:20px 16px 48px}[data-platform=darwin] .sg-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.sg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
.sg-head-copy{display:flex;flex-direction:column;gap:4px;flex:1 1 280px;min-width:0}
.sg-title{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.01em}
.sg-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.sg-head-actions{display:flex;align-items:center;gap:10px;flex:none}
.sg-live{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.sg-banner{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.sg-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,var(--dsw-alias-border-l2))}
.sg-banner>svg{flex:none}
.sg-banner-text{flex:1;min-width:0}
.sg-hub{display:grid;grid-template-columns:minmax(220px,260px) minmax(0,1fr);gap:20px;align-items:start}
@container (max-width:740px){.sg-hub{grid-template-columns:minmax(0,1fr)}}
.sg-rail{display:flex;flex-direction:column;gap:6px;min-width:0;position:sticky;top:16px}
@container (max-width:740px){.sg-rail{position:static}}
.sg-rail-label{display:flex;align-items:center;justify-content:space-between;padding:0 8px 2px;font-size:11px;line-height:16px;font-weight:500;color:var(--dsw-alias-label-tertiary);letter-spacing:.02em;text-transform:uppercase}
.sg-rail-sep{height:.5px;margin:6px 4px;background:var(--dsw-alias-border-l1)}
.sg-rail-item{display:flex;flex-direction:column;gap:4px;width:100%;padding:9px 11px;border:.5px solid transparent;border-radius:var(--dsw-radius-md,12px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;min-width:0;transition:background-color .15s,border-color .15s,box-shadow .15s}
@media (hover:hover){.sg-rail-item:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.sg-rail-item[aria-current=true]{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l2)}
.sg-rail-item.sg-dropping{background:var(--dsw-alias-interactive-bg-hover);box-shadow:inset 0 0 0 1.5px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.sg-rail-top{display:flex;align-items:center;gap:7px;min-width:0}
.sg-rail-icon{display:inline-flex;flex:none;color:var(--dsw-alias-label-tertiary)}
.sg-rail-item[aria-current=true] .sg-rail-icon{color:var(--dsw-alias-label-primary)}
.sg-rail-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;font-size:13px;line-height:18px}
.sg-rail-count{flex:none;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.sg-rail-meta{display:flex;align-items:center;gap:6px;padding-left:22px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.sg-stack{display:flex;flex-direction:column;gap:14px;min-width:0}
.sg-hero{display:flex;flex-direction:column;gap:10px;padding:16px 18px;border-radius:var(--dsw-radius-md,12px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0}
.sg-hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.sg-hero-title{display:flex;flex-direction:column;gap:4px;flex:1 1 220px;min-width:0}
.sg-hero-title h2{margin:0;font-size:16px;line-height:22px;font-weight:600;overflow-wrap:anywhere}
.sg-hero-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:none}
.sg-pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sg-rename{width:100%;max-width:360px;height:30px;padding:0 8px;border:.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:15px;font-weight:600;outline:none}
.sg-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sg-bar-search{flex:1 1 220px;min-width:0}
.sg-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sg-chip{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;transition:background-color .15s,border-color .15s,color .15s}
@media (hover:hover){.sg-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.sg-chip[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-bg-layer-2));border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font-weight:500}
.sg-chip-n{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.sg-batch{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 12px;border-radius:var(--dsw-radius-md,10px);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,var(--dsw-alias-bg-layer-1));border:.5px solid color-mix(in srgb,var(--dsw-alias-state-business-primary) 26%,var(--dsw-alias-border-l2));font-size:12px}
.sg-batch-count{flex:1 1 auto;font-weight:500}
.sg-select{height:28px;max-width:190px;min-width:0;padding:0 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}
.sg-list{display:flex;flex-direction:column;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);overflow:hidden;min-width:0}
.sg-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-top:.5px solid var(--dsw-alias-border-l1);cursor:pointer;min-width:0;transition:background-color .12s}
.sg-row:first-child{border-top:0}
.sg-row[draggable=true]{cursor:grab}
@media (hover:hover){.sg-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.sg-row[data-selected=true]{background:var(--dsw-alias-bg-layer-1)}
.sg-lead{display:inline-flex;align-items:center;justify-content:center;width:16px;flex:none;color:var(--dsw-alias-label-tertiary)}
.sg-lead[data-pinned=true]{color:var(--dsw-alias-label-primary)}
.sg-row-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}
.sg-row-top{display:flex;align-items:center;gap:6px;min-width:0}
.sg-rtitle{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13.5px;line-height:20px;font-weight:500}
.sg-rtitle.sg-missing{color:var(--dsw-alias-label-tertiary);font-weight:400}
.sg-row-sub{display:flex;align-items:center;gap:6px;min-width:0;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.sg-row-end{display:flex;align-items:center;gap:4px;flex:none}
.sg-ractions{display:flex;align-items:center;gap:4px;flex:none}
.sg-danger-text{color:var(--dsw-alias-state-error-primary)}
.sg-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}
.sg-sp{display:flex;flex-direction:column;gap:8px;padding:12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1);animation:sg-in .14s ease}
@keyframes sg-in{from{opacity:0;transform:translateY(-3px)}}
.sg-sp-results{display:flex;flex-direction:column;gap:2px;max-height:260px;overflow-y:auto;scrollbar-width:thin}
.sg-result{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 8px 0 10px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
.sg-result[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover)}
.sg-result-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.sg-result-title mark{background:none;color:var(--dsw-alias-label-primary);font-weight:600}
.sg-result-title.sg-plain{color:var(--dsw-alias-label-primary)}
.sg-result-meta{flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.sg-result-add{display:inline-flex;flex:none;color:var(--dsw-alias-label-tertiary);opacity:0;transition:opacity .12s}
.sg-result[aria-selected=true] .sg-result-add{opacity:1}
.sg-spfoot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:8px;border-top:.5px solid var(--dsw-alias-border-l1)}
.sg-hint{display:flex;gap:10px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden}
.sg-hint kbd{display:inline-block;min-width:16px;margin-right:4px;padding:0 3px;border:.5px solid var(--dsw-alias-border-l2);border-radius:4px;font:inherit;font-size:10px;line-height:14px;text-align:center;color:var(--dsw-alias-label-secondary)}
.sg-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:40px 20px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);text-align:center;color:var(--dsw-alias-label-secondary)}
.sg-empty p{margin:0}
.sg-dropzone{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 12px;border:1px dashed var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-md,10px);color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;transition:border-color .12s,background-color .12s,color .12s}
.sg-dropzone.sg-dropping{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
@container (max-width:560px){.sg-row{flex-wrap:wrap;align-items:flex-start;row-gap:8px}.sg-row-body{flex:1 1 calc(100% - 36px)}.sg-row-end{width:100%;justify-content:flex-end;flex-wrap:wrap;gap:6px}.sg-select{max-width:none;flex:1 1 120px}}
.sg-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
@container (max-width:560px){.sg-row{flex-wrap:wrap}.sg-ractions{width:100%;justify-content:flex-end;padding-top:4px}}
@media (hover:none){.sg-hint{display:none}}
@media (pointer:coarse){.sg-rename,.sg-select{font-size:16px;height:36px;min-height:36px}}
@media (prefers-reduced-motion:reduce){.sg-sp{animation:none}.sg-page *{transition:none!important}}
`

    const SIDEBAR_CSS = `
.sgs-host:only-child{display:none}
.sgs-root{margin-bottom:10px;padding-bottom:8px;border-bottom:.5px solid var(--dsw-alias-border-l1,transparent)}
.sgs-root>*+*,.sgs-folder>*+*{margin-top:2px}
.sgs-folder{border-radius:var(--dsw-radius-md,8px);transition:box-shadow .12s var(--ds-ease-in-out,ease)}
.sgs-folder.sgs-dropping{box-shadow:inset 0 0 0 1.5px var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary))}
.sgs-row{position:relative;display:flex;align-items:center;height:32px;border-radius:var(--dsw-radius-md,8px);border-inline:var(--dsh-sidebar-paint-inset,3px) solid transparent;background-clip:padding-box;box-sizing:border-box;padding:0 8px 0 calc(var(--dsh-sidebar-row-padding,12px) - var(--dsh-sidebar-paint-inset,3px));cursor:pointer;user-select:none;-webkit-user-select:none;color:var(--dsw-alias-label-primary);outline:none}
.sgs-row:focus-visible{box-shadow:inset 0 0 0 1.5px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.sgs-row.sgs-selected{background-color:var(--dsw-alias-interactive-bg-hover)}
.sgs-row.sgs-bulk-selected{background-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,var(--dsw-alias-interactive-bg-hover));box-shadow:inset 2px 0 0 var(--dsw-alias-state-business-primary)}
.sgs-bulk{display:flex;align-items:center;gap:4px;height:32px;border-radius:var(--dsw-radius-md,8px);border-inline:var(--dsh-sidebar-paint-inset,3px) solid transparent;background-clip:padding-box;box-sizing:border-box;padding:0 6px 0 calc(var(--dsh-sidebar-row-padding,12px) - var(--dsh-sidebar-paint-inset,3px));background-color:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.sgs-bulk-count{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;font-variant-numeric:tabular-nums}
.sgs-bulk-actions{flex:none;display:inline-flex;align-items:center;gap:2px}
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
@media (hover:none){.sgs-row .sgs-actions{display:inline-flex}.sgs-row .sgs-rest{display:none}}
.sgs-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.sgs-btn:disabled{opacity:.4;cursor:default}
.sgs-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (pointer:coarse){.sgs-row{min-height:38px;height:auto;padding-block:4px}.sgs-btn{width:30px;height:30px}}
@media (hover:hover){.sgs-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.sgs-btn.sgs-danger:hover{color:var(--dsw-alias-state-error-primary)}}
.sgs-btn[aria-pressed=true]{color:var(--dsw-alias-label-primary)}
.sgs-running{width:6px;height:6px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));animation:sgs-pulse 1.4s ease-in-out infinite}
@keyframes sgs-pulse{50%{opacity:.35}}
.sgs-rename{flex:1;min-width:0;height:24px;margin:0 0 0 var(--dsh-sidebar-label-gap,6px);padding:0 6px;border:.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));border-radius:var(--dsw-radius-sm,6px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:20px;outline:none}
.sgs-hint{height:28px;padding-inline-start:calc(var(--dsh-sidebar-row-padding,12px) + 16px + var(--dsh-sidebar-label-gap,6px));font-size:12px;line-height:28px;color:var(--dsw-alias-label-tertiary)}
.sgs-dropnew{border:1px dashed var(--dsw-alias-border-l4,var(--dsw-alias-border-l2));color:var(--dsw-alias-label-tertiary)}
.sgs-dropnew .sgs-title{color:inherit;font-size:13px}
.sgs-dropnew.sgs-dropping{border-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
@media (pointer:coarse){.sgs-rename{font-size:16px}}
@media (prefers-reduced-motion:reduce){.sgs-running{animation:none}.sgs-folder{transition:none}}
.sg-tv{display:flex;flex-direction:column}
.sg-tv-row{min-width:0}
.sg-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.sg-tv-summary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.sg-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.sg-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.sg-tv-body{display:flex;flex-direction:column;min-width:0}
.sg-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.sg-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.sg-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.sg-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.sg-tv-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.sg-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.sg-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.sg-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.sg-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.sg-tv-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.sg-tv:hover .sg-tv-inspect{opacity:1}.sg-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.sg-tv-inspect{opacity:1}}
`

    return {
      inject: ['slots', 'locale', 'sessions', 'uiWorkspace', 'contextMenus', 'layout'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'session-groups: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'session-groups: zh')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS + SIDEBAR_CSS
          document.head.append(style)
          return () => style.remove()
        }, 'session-groups: styles')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, () => String(v)), t(key))

        const store = createStore()
        const GROUPS_REFRESH_THROTTLE_MS = 15_000
        let groupsChannel = null
        let lastFetchedAt = 0
        let inflight = null

        const applyGroups = (groups, share = false) => {
          if (!Array.isArray(groups)) return false
          lastFetchedAt = Date.now()
          store.set({ groups, status: 'ready' })
          if (share && groupsChannel) {
            try { BroadcastChannel.prototype.postMessage.call(groupsChannel, { groups }) } catch {}
          }
          return true
        }

        const fetchGroups = (force = false) => {
          if (!force && store.getSnapshot().status === 'ready' && Date.now() - lastFetchedAt < GROUPS_REFRESH_THROTTLE_MS) return
          if (inflight) return
          if (store.getSnapshot().status !== 'ready') store.set({ status: 'loading' })
          const req = fetch('session-groups/state', { headers: { accept: 'application/json' }, cache: 'no-store' })
            .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
            .then(data => {
              if (!applyGroups(data?.groups, false)) store.set({ status: 'error' })
            })
            .catch(() => {
              if (store.getSnapshot().status !== 'ready') store.set({ status: 'error' })
            })
            .finally(() => { if (inflight === req) inflight = null })
          inflight = req
        }

        const connect = () => {
          lastFetchedAt = 0
          fetchGroups(true)
        }
        ctx.effect(() => {
          const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('dsh-session-groups-sync') : null
          groupsChannel = channel
          const onWake = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
            fetchGroups(false)
          }
          const onMessage = event => {
            if (Array.isArray(event?.data?.groups)) applyGroups(event.data.groups, false)
          }
          window.addEventListener('focus', onWake)
          document.addEventListener('visibilitychange', onWake)
          channel?.addEventListener('message', onMessage)
          fetchGroups(true)
          return () => {
            window.removeEventListener('focus', onWake)
            document.removeEventListener('visibilitychange', onWake)
            channel?.removeEventListener('message', onMessage)
            channel?.close()
            if (groupsChannel === channel) groupsChannel = null
          }
        }, 'session-groups: follow Host state')

        const op = async payload => {
          try {
            const res = await postOp(payload)
            if (Array.isArray(res?.groups)) applyGroups(res.groups, true)
            return res
          } catch (error) {
            ctx.contextMenus.notify(`${t('opFailed')}: ${error?.message ?? error}`, false)
            throw error
          }
        }

        const addMany = async (groupId, sessionIds) => {
          if (!sessionIds.length) return
          try {
            const res = await postOp({ action: 'add_many', groupId, sessionIds })
            if (Array.isArray(res?.groups)) applyGroups(res.groups, true)
          } catch {
            for (const sessionId of sessionIds) {
              await op({ action: 'add', groupId, sessionId })
            }
          }
        }

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
                store.setView({ editing: `sidebar:${groupId}` })
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

        for (const [key, Icon] of [
          ['session-groups.folder', IconGroups],
          ['session-groups.pin', ({ size }) => h(IconPinOutlineRegular, { size })],
          ['session-groups.remove', ({ size }) => h(IconCloseOutlineRegular, { size })],
        ]) {
          ctx.slots.inject('contextMenu.icon', () => ctx.slots.register({ name: 'contextMenu.icon', key }, () => h(Icon, { size: 16 })))
        }

        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const useGroups = () => React.useSyncExternalStore(store.subscribe, store.getSnapshot)
        const useSessions = () => React.useSyncExternalStore(
          fn => ctx.sessions.list.subscribe(fn),
          () => ctx.sessions.list.getSnapshot(),
        )
        const useSidebarSessions = (groups, showCurrent) => {
          const tracked = React.useMemo(() => {
            const ids = []
            const seen = new Set()
            for (const g of groups) {
              for (const id of g.sessionIds) {
                if (seen.has(id)) continue
                seen.add(id)
                ids.push(id)
              }
            }
            return { ids, seen }
          }, [groups])
          const cacheRef = React.useRef({ byId: {}, currentId: undefined })
          const getSnapshot = React.useCallback(() => {
            const raw = ctx.sessions.list.getSnapshot()
            const rawById = raw?.byId ?? {}
            const prev = cacheRef.current
            let currentId
            if (showCurrent) {
              for (const id of tracked.ids) {
                const s = rawById[id]
                if (s && (s.retainedBy?.mainView ?? 0) > 0) {
                  currentId = id
                  break
                }
              }
            }
            let changed = prev.currentId !== currentId
            const nextById = {}
            for (const id of tracked.ids) {
              const s = rawById[id]
              const prevEntry = prev.byId[id]
              if (!s) {
                if (prevEntry !== undefined) changed = true
                continue
              }
              if (
                prevEntry
                && prevEntry.displayTitle === s.displayTitle
                && prevEntry.title === s.title
                && prevEntry.running === s.running
                && prevEntry.updatedAt === s.updatedAt
                && prevEntry.origin === s.origin
              ) {
                nextById[id] = prevEntry
              } else {
                changed = true
                nextById[id] = {
                  id: s.id,
                  displayTitle: s.displayTitle,
                  title: s.title,
                  running: s.running,
                  updatedAt: s.updatedAt,
                  origin: s.origin,
                }
              }
            }
            if (!changed && Object.keys(nextById).length === Object.keys(prev.byId).length) return prev
            const next = { byId: nextById, currentId }
            cacheRef.current = next
            return next
          }, [tracked, showCurrent])
          return React.useSyncExternalStore(
            fn => ctx.sessions.list.subscribe(fn),
            getSnapshot,
          )
        }

        const MEMBER_MIME = 'application/x-dsh-session-group-member'
        const GROUP_MIME = 'application/x-dsh-session-group'
        const hasType = (e, type) => Array.from(e.dataTransfer?.types ?? []).includes(type)
        const carriesText = e => hasType(e, 'text/plain')

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
              const source = latest.current.list ?? ctx.sessions.list.getSnapshot()
              const summary = id ? source?.byId?.[id] : undefined
              if (!summary || summary.blank) return
              e.preventDefault()
              e.stopPropagation()
              latest.current.onSession(id)
            },
          }
          return { over, props }
        }

        function GroupName({ group, className = 'sg-rename' }) {
          const [value, setValue] = React.useState(group.name)
          const ref = React.useRef(null)
          const cancelled = React.useRef(false)
          React.useLayoutEffect(() => { ref.current?.focus(); ref.current?.select() }, [])
          const commit = () => {
            if (cancelled.current) return
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
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') { e.preventDefault(); cancelled.current = true; store.setView({ editing: null }) }
            },
          })
        }

        function highlight(text, q) {
          if (!q) return text
          const at = text.toLowerCase().indexOf(q)
          if (at < 0) return text
          return [text.slice(0, at), h('mark', { key: 'm' }, text.slice(at, at + q.length)), text.slice(at + q.length)]
        }

        const PICK_LIMIT = 50
        const dirName = cwd => (cwd ?? '').split(/[\\/]/).filter(Boolean).pop() ?? ''
        const countLabel = n => n === 1 ? t('sessionOne') : tf('sessions', { n })

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
              .filter(s => !q || (s.displayTitle ?? '').toLowerCase().includes(q) || dirName(s.cwd).toLowerCase().includes(q) || s.id.startsWith(q))
              .toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
            return { items: all.slice(0, PICK_LIMIT).map(s => ({ s, owner: owner.get(s.id) })), total: all.length }
          }, [list, groups, group, q])
          const current = Math.min(active, Math.max(items.length - 1, 0))
          React.useEffect(() => {
            listRef.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' })
          }, [current, items])
          const add = item => { if (item) void op({ action: 'add', groupId: group.id, sessionId: item.s.id }).catch(() => {}) }
          const onKeyDown = e => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.max(0, Math.min(current + 1, items.length - 1))) }
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
            h(Input, {
              ref: inputRef,
              type: 'search',
              icon: h(IconSearchOutlineRegular, { size: 14 }),
              value: query,
              placeholder: t('searchPlaceholder'),
              'aria-label': t('searchPlaceholder'),
              role: 'combobox',
              'aria-expanded': true,
              'aria-controls': `sg-results-${group.id}`,
              'aria-activedescendant': items[current] ? `sg-opt-${group.id}-${items[current].s.id}` : undefined,
              onChange: e => { setQuery(e.target.value); setActive(0) },
              onKeyDown,
            }),
            items.length > 0 ? h('div', { ref: listRef, id: `sg-results-${group.id}`, className: 'sg-sp-results', role: 'listbox' },
              items.map((item, i) => h('button', {
                key: item.s.id, id: `sg-opt-${group.id}-${item.s.id}`, type: 'button', tabIndex: -1,
                className: 'sg-result', role: 'option', 'aria-selected': i === current,
                onMouseMove: () => { if (i !== current) setActive(i) },
                onMouseDown: e => e.preventDefault(),
                onClick: () => { add(item); inputRef.current?.focus() },
              },
              h('span', { className: `sg-result-title${q ? '' : ' sg-plain'}` }, highlight(item.s.displayTitle || item.s.id, q)),
              h('span', { className: 'sg-result-meta' }, item.owner ? tf('inGroup', { name: item.owner.name }) : dirName(item.s.cwd)),
              h('span', { className: 'sg-result-add' }, h(IconPlusOutlineRegular, { size: 14 }))))) : null,
            status ? h('p', { className: 'sg-note' }, status) : null,
            h('div', { className: 'sg-spfoot' },
              h('div', { className: 'sg-hint' }, kbd('↑↓', t('hintMove')), kbd('↵', t('hintAdd')), kbd('Esc', t('hintClose'))),
              h(Button, { size: 'sm', variant: 'ghost', onClick: onClose }, t('done'))))
        }

        function RailGroupItem({ group, index, groups, list, selected, onSelect }) {
          const [over, setOver] = React.useState(false)
          const depth = React.useRef(0)
          const runningCount = group.sessionIds.filter(id => list.byId[id]?.running).length
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
              if (!group.sessionIds.includes(id)) void op({ action: 'add', groupId: group.id, sessionId: id }).catch(() => {})
            },
          }
          const meta = [
            group.pinned.length ? tf('pinnedBadge', { n: group.pinned.length }) : null,
            runningCount ? tf('runningBadge', { n: runningCount }) : null,
          ].filter(Boolean).join(' · ')
          return h('button', {
            type: 'button',
            className: `sg-rail-item${over ? ' sg-dropping' : ''}`,
            'aria-current': selected || undefined,
            draggable: true,
            onDragStart: e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData(GROUP_MIME, group.id)
            },
            onClick: onSelect,
            ...dropProps,
          },
          h('span', { className: 'sg-rail-top' },
            h('span', { className: 'sg-rail-icon' }, h(selected ? IconFolderOpenRegular : IconFolderCloseRegular, { size: 15 })),
            h('span', { className: 'sg-rail-name' }, group.name),
            runningCount > 0 ? h(StateDot, { state: 'ongoing', size: 10 }) : null,
            h('span', { className: 'sg-rail-count' }, group.sessionIds.length)),
          meta ? h('span', { className: 'sg-rail-meta' }, meta) : null)
        }

        function MemberRow({ id, summary, group, groups, pinned, locale }) {
          const title = summary?.displayTitle || summary?.title
          const open = () => { if (summary) ctx.uiWorkspace.openSession(id) }
          const stop = fn => e => { e.stopPropagation(); fn() }
          const otherGroups = groups.filter(g => g.id !== group.id)
          const dir = dirName(summary?.cwd)
          return h('div', {
            className: 'sg-row', role: 'button', tabIndex: 0, title: title ?? id,
            draggable: Boolean(summary),
            onDragStart: summary ? e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', id)
            } : undefined,
            onClick: open,
            onKeyDown: e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); open() } },
          },
          h('span', { className: 'sg-lead', 'data-pinned': pinned || undefined },
            summary?.running
              ? h(StateDot, { state: 'ongoing', size: 11 })
              : pinned ? h(IconPinFillRegular, { size: 13 }) : null),
          h('div', { className: 'sg-row-body' },
            h('div', { className: 'sg-row-top' },
              h('span', { className: `sg-rtitle${summary ? '' : ' sg-missing'}` }, title ?? `${t('unknownSession')} · ${id.slice(0, 8)}`),
              dir ? h(Tag, { tone: 'quiet' }, dir) : null),
            summary?.updatedAt ? h('div', { className: 'sg-row-sub' }, relativeTime(summary.updatedAt, locale)) : null),
          h('div', { className: 'sg-ractions', onClick: e => e.stopPropagation() },
            otherGroups.length > 0
              ? h('select', {
                className: 'sg-select',
                value: '',
                'aria-label': t('moveTo'),
                onChange: e => {
                  const target = e.target.value
                  if (target) void op({ action: 'add', groupId: target, sessionId: id }).catch(() => {})
                },
              },
              h('option', { value: '' }, t('moveToPick')),
              otherGroups.map(g => h('option', { key: g.id, value: g.id }, g.name)))
              : null,
            h(Button, {
              size: 'sm', variant: pinned ? 'outline' : 'ghost',
              icon: h(pinned ? IconPinFillRegular : IconPinOutlineRegular, { size: 13 }),
              'aria-pressed': pinned,
              title: pinned ? t('unpin') : t('pin'),
              'aria-label': pinned ? t('unpin') : t('pin'),
              onClick: stop(() => void op({ action: 'pin', sessionId: id, pinned: !pinned }).catch(() => {})),
            }),
            h(Button, {
              size: 'sm', variant: 'ghost', className: 'sg-danger-text',
              icon: h(IconCloseOutlineRegular, { size: 13 }),
              title: t('remove'), 'aria-label': t('remove'),
              onClick: stop(() => void op({ action: 'remove', sessionId: id }).catch(() => {})),
            })))
        }

        function GroupWorkspace({ group, index, groups, list, locale, view }) {
          const [picking, setPicking] = React.useState(false)
          const [query, setQuery] = React.useState('')
          const [filter, setFilter] = React.useState('all')
          React.useEffect(() => { setPicking(false); setQuery(''); setFilter('all') }, [group.id])

          const editing = view.editing === `page:${group.id}`
          const members = React.useMemo(() => orderedMembers(group, list.byId), [group, list.byId])
          const pinnedSet = React.useMemo(() => new Set(group.pinned), [group.pinned])
          const runningCount = members.filter(id => list.byId[id]?.running).length

          const q = query.trim().toLowerCase()
          const filtered = React.useMemo(() => members.filter(id => {
            const s = list.byId[id]
            if (filter === 'pinned' && !pinnedSet.has(id)) return false
            if (filter === 'running' && !s?.running) return false
            if (!q) return true
            const hay = `${s?.displayTitle ?? ''} ${s?.title ?? ''} ${dirName(s?.cwd)} ${id}`.toLowerCase()
            return hay.includes(q)
          }), [members, list.byId, pinnedSet, filter, q])

          const hasFilters = Boolean(q) || filter !== 'all'
          const filterChips = [
            ['all', t('filterAll'), members.length],
            ...(group.pinned.length ? [['pinned', t('filterPinned'), group.pinned.length]] : []),
            ...(runningCount ? [['running', t('filterRunning'), runningCount]] : []),
          ]

          return h('div', { className: 'sg-stack' },
            h('section', { className: 'sg-hero' },
              h('div', { className: 'sg-hero-top' },
                h('div', { className: 'sg-hero-title' },
                  editing
                    ? h(GroupName, { group })
                    : h('h2', { onDoubleClick: () => store.setView({ editing: `page:${group.id}` }) }, group.name),
                  h('div', { className: 'sg-pills' },
                    h(Tag, { tone: 'neutral' }, countLabel(members.length)),
                    group.pinned.length ? h(Tag, { tone: 'outline' }, tf('pinnedBadge', { n: group.pinned.length })) : null,
                    runningCount ? h(Tag, { tone: 'info' }, tf('runningBadge', { n: runningCount })) : null)),
                h('div', { className: 'sg-hero-actions' },
                  h(Button, {
                    size: 'sm', variant: picking ? 'primary' : 'outline',
                    icon: h(IconPlusOutlineRegular, { size: 13 }),
                    'aria-pressed': picking,
                    onClick: () => setPicking(p => !p),
                  }, picking ? t('closePicker') : t('addSession')),
                  h(Button, {
                    size: 'sm', variant: 'ghost',
                    icon: h(IconEditOutlineRegular, { size: 13 }),
                    title: t('rename'), 'aria-label': t('rename'),
                    onClick: () => store.setView({ editing: `page:${group.id}` }),
                  }),
                  h(Button, {
                    size: 'sm', variant: 'ghost',
                    icon: h(IconChevronUpOutlineRegular, { size: 13 }),
                    title: t('moveUp'), 'aria-label': t('moveUp'),
                    disabled: index === 0,
                    onClick: () => void op({ action: 'move_group', groupId: group.id, beforeGroupId: groups[index - 1]?.id }).catch(() => {}),
                  }),
                  h(Button, {
                    size: 'sm', variant: 'ghost',
                    icon: h(IconChevronDownOutlineRegular, { size: 13 }),
                    title: t('moveDown'), 'aria-label': t('moveDown'),
                    disabled: index === groups.length - 1,
                    onClick: () => void op({ action: 'move_group', groupId: group.id, beforeGroupId: groups[index + 2]?.id }).catch(() => {}),
                  }),
                  h(Button, {
                    size: 'sm', variant: 'ghost', className: 'sg-danger-text',
                    icon: h(IconTrashOutlineRegular, { size: 13 }),
                    title: t('delete'), 'aria-label': t('delete'),
                    onClick: () => store.setView({ pendingDelete: group }),
                  })))),

            picking ? h(Picker, { group, groups, list, onClose: () => setPicking(false) }) : null,

            members.length > 0 ? h('div', { className: 'sg-bar' },
              h(Input, {
                type: 'search', className: 'sg-bar-search',
                icon: h(IconSearchOutlineRegular, { size: 14 }),
                value: query,
                placeholder: t('filterGroupSessions'),
                'aria-label': t('filterGroupSessions'),
                onChange: e => setQuery(e.target.value),
              }),
              filterChips.length > 1 ? h('div', { className: 'sg-chips', role: 'group', 'aria-label': t('filterGroupSessions') },
                filterChips.map(([key, label, n]) => h('button', {
                  key, type: 'button', className: 'sg-chip', 'aria-pressed': filter === key,
                  onClick: () => setFilter(key),
                }, label, h('span', { className: 'sg-chip-n' }, n)))) : null) : null,

            members.length === 0
              ? h('div', { className: 'sg-empty' },
                h(IconFolderOpenRegular, { size: 22 }),
                h('p', null, t('emptyGroup')),
                h('p', { className: 'sg-note' }, t('emptyGroupHint')),
                !picking ? h(Button, { size: 'sm', variant: 'outline', icon: h(IconPlusOutlineRegular, { size: 13 }), onClick: () => setPicking(true) }, t('addSession')) : null)
              : filtered.length === 0
                ? h('div', { className: 'sg-empty' },
                  h('p', null, t('noFilterMatches')),
                  hasFilters ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setQuery(''); setFilter('all') } }, t('resetFilters')) : null)
                : h('div', { className: 'sg-list' },
                  filtered.map(id => h(MemberRow, {
                    key: id, id, summary: list.byId[id], group, groups, pinned: pinnedSet.has(id), locale,
                  }))))
        }

        function useRangeSelect(order, valid) {
          const [selected, setSelected] = React.useState(() => new Set())
          const [anchor, setAnchor] = React.useState(null)
          const ids = React.useMemo(() => [...selected].filter(id => valid(id)), [selected, valid])
          const set = React.useMemo(() => new Set(ids), [ids])
          const clear = React.useCallback(() => { setSelected(new Set()); setAnchor(null) }, [])
          const selectAll = React.useCallback(list => setSelected(new Set(list)), [])
          const toggle = React.useCallback((id, checked, shiftKey = false) => {
            if (id === null) { clear(); return }
            setSelected(prev => {
              const next = new Set(prev)
              const flag = checked === undefined ? !next.has(id) : checked
              if (shiftKey && anchor !== null) {
                const from = order.indexOf(anchor), to = order.indexOf(id)
                if (from >= 0 && to >= 0) {
                  for (let i = Math.min(from, to), end = Math.max(from, to); i <= end; i++) {
                    if (flag) next.add(order[i]); else next.delete(order[i])
                  }
                  return next
                }
              }
              if (flag) next.add(id); else next.delete(id)
              return next
            })
            setAnchor(id)
          }, [anchor, clear, order])
          React.useEffect(() => {
            if (ids.length === 0) return undefined
            const onKey = e => { if (e.key === 'Escape') clear() }
            window.addEventListener('keydown', onKey)
            return () => window.removeEventListener('keydown', onKey)
          }, [ids.length, clear])
          return { ids, set, toggle, clear, selectAll }
        }

        function UngroupedWorkspace({ sessions, groups, locale, onCreateWith }) {
          const [query, setQuery] = React.useState('')
          const [targetGroup, setTargetGroup] = React.useState(groups[0]?.id ?? '')
          const [busy, setBusy] = React.useState(false)

          React.useEffect(() => {
            if (!groups.some(g => g.id === targetGroup)) setTargetGroup(groups[0]?.id ?? '')
          }, [groups, targetGroup])

          const validIds = React.useMemo(() => new Set(sessions.map(s => s.id)), [sessions])
          const q = query.trim().toLowerCase()
          const filtered = React.useMemo(() => sessions.filter(s => {
            if (!q) return true
            return `${s.displayTitle ?? ''} ${s.title ?? ''} ${dirName(s.cwd)} ${s.id}`.toLowerCase().includes(q)
          }), [sessions, q])
          const order = React.useMemo(() => filtered.map(s => s.id), [filtered])
          const isValid = React.useCallback(id => validIds.has(id), [validIds])
          const { ids: selectedIds, set: selected, toggle, clear: clearSel, selectAll } = useRangeSelect(order, isValid)

          const addSelected = async () => {
            if (!selectedIds.length || !targetGroup || busy) return
            setBusy(true)
            try { await addMany(targetGroup, selectedIds); clearSel() } catch {} finally { setBusy(false) }
          }

          const createSelected = async () => {
            if (!selectedIds.length || busy) return
            setBusy(true)
            try { await onCreateWith(selectedIds); clearSel() } finally { setBusy(false) }
          }

          return h('div', { className: 'sg-stack' },
            h('section', { className: 'sg-hero' },
              h('div', { className: 'sg-hero-top' },
                h('div', { className: 'sg-hero-title' },
                  h('h2', null, t('ungrouped')),
                  h('p', { className: 'sg-note' }, t('ungroupedIntro'))),
                h(Tag, { tone: 'neutral' }, countLabel(sessions.length)))),

            sessions.length > 0 ? h('div', { className: 'sg-bar' },
              h(Input, {
                type: 'search', className: 'sg-bar-search',
                icon: h(IconSearchOutlineRegular, { size: 14 }),
                value: query,
                placeholder: t('filterUngrouped'),
                'aria-label': t('filterUngrouped'),
                onChange: e => setQuery(e.target.value),
              }),
              filtered.length > 0 ? h(Button, {
                size: 'sm', variant: 'ghost', disabled: busy,
                onClick: () => selectAll(order),
              }, t('selectShown')) : null) : null,

            selectedIds.length > 0 ? h('div', { className: 'sg-batch', role: 'region', 'aria-live': 'polite' },
              h('span', { className: 'sg-batch-count' }, tf('selectedCount', { n: selectedIds.length })),
              groups.length > 0 ? h('select', {
                className: 'sg-select', value: targetGroup, disabled: busy,
                'aria-label': t('addTo'),
                onChange: e => setTargetGroup(e.target.value),
              }, groups.map(g => h('option', { key: g.id, value: g.id }, g.name))) : null,
              groups.length > 0 ? h(Button, { size: 'sm', variant: 'primary', disabled: busy || !targetGroup, onClick: () => void addSelected() }, t('addSelectedTo')) : null,
              h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => void createSelected() }, t('createWithSelected')),
              h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: clearSel }, t('clearSelection'))) : null,

            sessions.length === 0
              ? h('div', { className: 'sg-empty' },
                h(IconGroups, { size: 22 }),
                h('p', null, t('emptyUngrouped')))
              : filtered.length === 0
                ? h('div', { className: 'sg-empty' },
                  h('p', null, t('noFilterMatches')),
                  h(Button, { size: 'sm', variant: 'ghost', onClick: () => setQuery('') }, t('resetFilters')))
                : h('div', { className: 'sg-list' },
                  filtered.map(s => {
                    const title = s.displayTitle || s.title || s.id
                    const checked = selected.has(s.id)
                    const dir = dirName(s.cwd)
                    return h('div', {
                      key: s.id, className: 'sg-row', 'data-selected': checked || undefined,
                      role: 'button', tabIndex: 0, title,
                      draggable: true,
                      onDragStart: e => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', s.id)
                      },
                      onClick: e => {
                        if (e.shiftKey || e.metaKey || e.ctrlKey) { e.preventDefault(); toggle(s.id, !checked, e.shiftKey); return }
                        ctx.uiWorkspace.openSession(s.id)
                      },
                      onKeyDown: e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); ctx.uiWorkspace.openSession(s.id) } },
                    },
                    h('span', { onClick: e => { e.stopPropagation(); if (e.shiftKey) { e.preventDefault(); toggle(s.id, !checked, true) } } },
                    h(Checkbox, {
                      checked, disabled: busy,
                      label: h('span', { className: 'sg-sr-only' }, tf('selectSession', { title })),
                      title: tf('selectSession', { title }),
                      onChange: next => toggle(s.id, next, false),
                    })),
                    h('div', { className: 'sg-row-body' },
                      h('div', { className: 'sg-row-top' },
                        s.running ? h(StateDot, { state: 'ongoing', size: 10 }) : null,
                        h('span', { className: 'sg-rtitle' }, title),
                        dir ? h(Tag, { tone: 'quiet' }, dir) : null),
                      s.updatedAt ? h('div', { className: 'sg-row-sub' }, relativeTime(s.updatedAt, locale)) : null),
                    h('div', { className: 'sg-ractions', onClick: e => e.stopPropagation() },
                      groups.length > 0
                        ? h('select', {
                          className: 'sg-select', value: '', disabled: busy,
                          'aria-label': t('addTo'),
                          onChange: e => {
                            const target = e.target.value
                            if (target) void op({ action: 'add', groupId: target, sessionId: s.id }).catch(() => {})
                          },
                        },
                        h('option', { value: '' }, t('addToPick')),
                        groups.map(g => h('option', { key: g.id, value: g.id }, g.name)))
                        : h(Button, {
                          size: 'sm', variant: 'outline', disabled: busy,
                          onClick: () => void onCreateWith([s.id]),
                        }, t('newGroup'))))
                  })))
        }

        function GroupsPage() {
          const loc = useLocale()
          const { groups, status } = useGroups()
          const list = useSessions()
          const view = store.view()
          const dragging = useDocumentDragging()

          const ungrouped = React.useMemo(() => {
            const grouped = new Set()
            for (const g of groups) for (const id of g.sessionIds) grouped.add(id)
            return list.ids
              .map(id => list.byId[id])
              .filter(s => s && !s.blank && s.origin !== 'subagent' && !grouped.has(s.id))
              .toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
          }, [groups, list])

          const activeKey = view.selected === UNGROUPED_KEY
            ? UNGROUPED_KEY
            : groups.some(g => g.id === view.selected)
              ? view.selected
              : groups[0]?.id ?? UNGROUPED_KEY

          const create = async sessionIds => {
            try {
              const payload = Array.isArray(sessionIds) && sessionIds.length
                ? (sessionIds.length === 1
                  ? { action: 'create', name: t('defaultName'), sessionId: sessionIds[0] }
                  : { action: 'create', name: t('defaultName'), sessionIds })
                : { action: 'create', name: t('defaultName') }
              const { groupId } = await op(payload)
              store.setView({ selected: groupId, editing: `page:${groupId}` })
            } catch {}
          }

          const newDrop = useSessionDrop(list, sessionId => void create([sessionId]))
          const selectedIndex = groups.findIndex(g => g.id === activeKey)
          const selectedGroup = selectedIndex >= 0 ? groups[selectedIndex] : null
          const syncDot = status === 'ready' ? 'done' : status === 'error' ? 'error' : 'ongoing'
          const syncLabel = status === 'ready' ? t('synced') : status === 'error' ? t('offline') : t('syncing')

          return h('section', { className: 'sg-page', 'aria-label': t('panel') },
            h('div', { className: 'sg-inner' },
              h('header', { className: 'sg-head' },
                h('div', { className: 'sg-head-copy' },
                  h('h1', { className: 'sg-title' }, t('panel')),
                  h('p', { className: 'sg-note' }, t('intro'))),
                h('div', { className: 'sg-head-actions' },
                  h('span', { className: 'sg-live', role: 'status' }, h(StateDot, { state: syncDot, size: 8 }), syncLabel),
                  h(Button, {
                    size: 'sm', variant: 'primary',
                    icon: h(IconPlusOutlineRegular, { size: 14 }),
                    onClick: () => void create(),
                  }, t('newGroup')))),

              status === 'error'
                ? h('div', { className: 'sg-banner', 'data-tone': 'error', role: 'alert' },
                  h(IconWarningTriangleOutlineRegular, { size: 14 }),
                  h('span', { className: 'sg-banner-text' }, t('loadFailed')),
                  h(Button, { size: 'sm', variant: 'outline', onClick: connect }, t('retry')))
                : null,

              status === 'loading'
                ? h('div', { className: 'sg-empty', role: 'status' },
                  h(StateDot, { state: 'ongoing', size: 16 }),
                  h('p', null, t('loading')))
                : h('div', { className: 'sg-hub' },
                  h('nav', { className: 'sg-rail', 'aria-label': t('groupsHeading') },
                    h('div', { className: 'sg-rail-label' },
                      h('span', null, t('groupsHeading')),
                      h('span', null, groups.length)),
                    groups.length === 0
                      ? h('p', { className: 'sg-note', style: { padding: '6px 8px' } }, t('empty'))
                      : groups.map((group, index) => h(RailGroupItem, {
                        key: group.id, group, index, groups, list,
                        selected: activeKey === group.id,
                        onSelect: () => store.setView({ selected: group.id, editing: null }),
                      })),
                    dragging || newDrop.over
                      ? h('div', { className: `sg-dropzone${newDrop.over ? ' sg-dropping' : ''}`, ...newDrop.props },
                        h(IconPlusOutlineRegular, { size: 14 }), t('dropNew'))
                      : null,
                    h('div', { className: 'sg-rail-sep' }),
                    h('button', {
                      type: 'button',
                      className: 'sg-rail-item',
                      'aria-current': activeKey === UNGROUPED_KEY || undefined,
                      onClick: () => store.setView({ selected: UNGROUPED_KEY, editing: null }),
                    },
                    h('span', { className: 'sg-rail-top' },
                      h('span', { className: 'sg-rail-icon' }, h(IconGroups, { size: 15 })),
                      h('span', { className: 'sg-rail-name' }, t('ungrouped')),
                      h('span', { className: 'sg-rail-count' }, ungrouped.length)))),

                  selectedGroup
                    ? h(GroupWorkspace, { group: selectedGroup, index: selectedIndex, groups, list, locale: loc.active, view })
                    : groups.length === 0 && ungrouped.length === 0
                      ? h('div', { className: 'sg-empty' },
                        h(IconGroups, { size: 26 }),
                        h('p', null, t('empty')),
                        h('p', { className: 'sg-note' }, t('emptyHint')),
                        h(Button, { size: 'sm', variant: 'primary', icon: h(IconPlusOutlineRegular, { size: 14 }), onClick: () => void create() }, t('newGroup')))
                      : h(UngroupedWorkspace, { sessions: ungrouped, groups, locale: loc.active, onCreateWith: create }))))
        }

        const useConversationActive = () => React.useSyncExternalStore(
          fn => ctx.layout.panelInfo.subscribe(fn),
          () => ctx.layout.panelInfo.getSnapshot().activePanelId == null,
        )

        function useListArea() {
          const [found, setFound] = React.useState({ area: null, searching: false })
          React.useEffect(() => {
            let frame = 0
            let watchedArea = null
            let watchedRoot = null
            let watchedInput = null
            let bodyObserver = null
            let rootObserver = null

            const detachInput = () => {
              if (watchedInput) {
                watchedInput.removeEventListener('input', schedule)
                watchedInput = null
              }
            }
            const detachRoot = () => {
              rootObserver?.disconnect()
              rootObserver = null
              watchedRoot = null
            }
            const attachBody = () => {
              if (bodyObserver) return
              bodyObserver = new MutationObserver(schedule)
              bodyObserver.observe(document.body, { childList: true, subtree: true })
            }
            const detachBody = () => {
              bodyObserver?.disconnect()
              bodyObserver = null
            }
            const check = () => {
              frame = 0
              const area = watchedArea?.isConnected ? watchedArea : document.querySelector('[data-sidebar-list-area]')
              const input = watchedInput?.isConnected ? watchedInput : document.querySelector('[data-sidebar-workspace-header] input')
              watchedArea = area
              if (input !== watchedInput) {
                detachInput()
                if (input) {
                  watchedInput = input
                  watchedInput.addEventListener('input', schedule)
                }
              }
              if (area) {
                detachBody()
                const root = area.parentElement ?? document.body
                if (root !== watchedRoot) {
                  detachRoot()
                  watchedRoot = root
                  rootObserver = new MutationObserver(schedule)
                  rootObserver.observe(root, { childList: true })
                }
              } else {
                detachRoot()
                attachBody()
              }
              const searching = Boolean(input && input.value.trim())
              setFound(prev => prev.area === area && prev.searching === searching ? prev : { area, searching })
            }
            const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
            const onPanelChange = () => {
              if (watchedArea?.isConnected && watchedInput?.isConnected) return
              schedule()
            }
            check()
            const offLayout = ctx.layout.panelInfo.subscribe(onPanelChange)
            return () => {
              offLayout()
              detachBody()
              detachRoot()
              detachInput()
              if (frame) cancelAnimationFrame(frame)
            }
          }, [])
          return found
        }

        const SidebarMember = React.memo(function SidebarMember({ id, summary, group, pinned, current, bulkSelected, hasBulkSelection, onBulkToggle, locale }) {
          const title = summary.displayTitle || summary.title || id
          const stop = fn => e => { e.preventDefault(); e.stopPropagation(); fn() }
          const open = () => ctx.uiWorkspace.openSession(id)
          return h('div', {
            className: `sgs-row sgs-member${current ? ' sgs-selected' : ''}${bulkSelected ? ' sgs-bulk-selected' : ''}`,
            'data-group-session-id': id,
            'data-bulk-selected': bulkSelected || undefined,
            role: 'treeitem', 'aria-selected': bulkSelected || current, tabIndex: 0, title,
            draggable: true,
            onDragStart: e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', id)
              e.dataTransfer.setData(MEMBER_MIME, id)
            },
            onClick: e => {
              if (e.shiftKey || e.metaKey || e.ctrlKey) { e.preventDefault(); e.stopPropagation(); window.getSelection?.()?.removeAllRanges?.(); onBulkToggle(id, e.shiftKey); return }
              if (hasBulkSelection) onBulkToggle(null, false)
              open()
            },
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
            pinned ? h('span', { className: 'sgs-pinmark', title: t('unpin') }, h(IconPinFillRegular, { size: 12 })) : null),
          h('span', { className: 'sgs-actions' },
            h('button', {
              type: 'button', className: 'sgs-btn', tabIndex: -1, 'aria-pressed': pinned,
              title: pinned ? t('unpin') : t('pin'), 'aria-label': pinned ? t('unpin') : t('pin'),
              onClick: stop(() => void op({ action: 'pin', sessionId: id, pinned: !pinned }).catch(() => {})),
            }, h(pinned ? IconPinFillRegular : IconPinOutlineRegular, { size: 13 })),
            h('button', {
              type: 'button', className: 'sgs-btn', tabIndex: -1,
              title: `${t('remove')} · ${group.name}`, 'aria-label': t('remove'),
              onClick: stop(() => void op({ action: 'remove', sessionId: id }).catch(() => {})),
            }, h(IconCloseOutlineRegular, { size: 13 }))))
        })

        const SidebarFolder = React.memo(function SidebarFolder({ group, index, groups, byId, view, currentId, bulkSet, hasBulkSelection, onBulkToggle, locale }) {
          const collapsed = view.collapsed.has(group.id)
          const editing = view.editing === `sidebar:${group.id}`
          const [over, setOver] = React.useState(false)
          const depth = React.useRef(0)
          const setCollapsed = value => {
            const next = new Set(view.collapsed)
            if (value) next.add(group.id); else next.delete(group.id)
            store.setView({ collapsed: next })
          }
          const members = orderedMembers(group, byId)
            .filter(id => byId[id] && byId[id].origin !== 'subagent')
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
              const summary = id ? ctx.sessions.list.getSnapshot()?.byId?.[id] : undefined
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
              onDoubleClick: stop(() => store.setView({ editing: `sidebar:${group.id}` })),
              onKeyDown: e => {
                if (e.target !== e.currentTarget) return
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(!collapsed) }
                if (e.key === 'F2') { e.preventDefault(); store.setView({ editing: `sidebar:${group.id}` }) }
              },
            },
            h('span', { className: `sgs-slot sgs-folder-icon${containsCurrent && collapsed ? ' sgs-active' : ''}` },
              h('span', { className: 'sgs-glyph' }, h(collapsed ? IconFolderCloseRegular : IconFolderOpenRegular, { size: 15 })),
              h('span', { className: 'sgs-chev' }, h(IconChevron, { size: 12, open: !collapsed }))),
            editing
              ? h(GroupName, { group, className: 'sgs-rename' })
              : h('span', { className: 'sgs-title sgs-gname' }, group.name),
            editing ? null : h('span', { className: 'sgs-rest' }, h('span', { className: 'sgs-count' }, members.length)),
            editing ? null : h('span', { className: 'sgs-actions' },
              h('button', {
                type: 'button', className: 'sgs-btn', tabIndex: -1, title: t('rename'), 'aria-label': t('rename'),
                onClick: stop(() => store.setView({ editing: `sidebar:${group.id}` })),
              }, h(IconEditOutlineRegular, { size: 13 })),
              h('button', {
                type: 'button', className: 'sgs-btn sgs-danger', tabIndex: -1, title: t('delete'), 'aria-label': t('delete'),
                onClick: stop(() => {
                  store.setView({ pendingDelete: group })
                }),
              }, h(IconTrashOutlineRegular, { size: 13 })))),
            collapsed ? null : members.length === 0
              ? h('div', { className: 'sgs-hint' }, t('dropInto'))
              : members.map(id => h(SidebarMember, {
                key: id, id, summary: byId[id], group, pinned: pinned.has(id), current: id === currentId,
                bulkSelected: bulkSet.has(id), hasBulkSelection, onBulkToggle, locale,
              })))
        })

        function SidebarGroups() {
          const { area, searching } = useListArea()
          const loc = useLocale()
          const { groups } = useGroups()
          const showCurrent = useConversationActive()
          const { byId, currentId } = useSidebarSessions(groups, showCurrent)
          const view = store.view()
          const dragging = useDocumentDragging()
          const [bulkBusy, setBulkBusy] = React.useState(false)
          const [bulkMenu, setBulkMenu] = React.useState(false)
          const visibleMemberIds = React.useMemo(() => groups.flatMap(g =>
            view.collapsed.has(g.id) ? [] : orderedMembers(g, byId).filter(id => byId[id] && byId[id].origin !== 'subagent')), [groups, byId, view.collapsed])
          const validMember = React.useCallback(id => Boolean(byId[id] && byId[id].origin !== 'subagent'), [byId])
          const { ids: activeBulkIds, set: activeBulkSet, toggle: toggleBulk, clear: clearBulk } = useRangeSelect(visibleMemberIds, validMember)
          const onBulkToggle = React.useCallback((id, shiftKey) => { if (id === null) setBulkMenu(false); toggleBulk(id, undefined, shiftKey) }, [toggleBulk])
          const runBulk = async fn => {
            if (!activeBulkIds.length || bulkBusy) return
            setBulkBusy(true); setBulkMenu(false)
            try { await fn(); clearBulk() } catch {} finally { setBulkBusy(false) }
          }
          const moveBulkTo = target => { if (target) void runBulk(() => addMany(target, activeBulkIds)) }
          const removeBulk = () => runBulk(async () => { for (const sessionId of activeBulkIds) await op({ action: 'remove', sessionId }) })
          const host = React.useMemo(() => {
            const el = document.createElement('div')
            el.className = 'sgs-host'
            return el
          }, [])
          const hideCss = React.useMemo(() => {
            if (searching) return ''
            const hidden = groups.flatMap(g => g.sessionIds).filter(id => /^[\w.:-]+$/.test(id))
            return hidden.length === 0 ? ''
              : `${hidden.map(id => `[data-sidebar-list-area] [data-row-key="session:${id}"]`).join(',')}{display:none!important}`
          }, [searching, groups])
          const hideStyleRef = React.useRef(null)
          React.useLayoutEffect(() => {
            if (!area) return undefined
            if (area.firstChild !== host) area.insertBefore(host, area.firstChild)
            return () => host.remove()
          }, [area, host])
          React.useLayoutEffect(() => {
            if (!area || !hideCss) {
              hideStyleRef.current?.remove()
              hideStyleRef.current = null
              return undefined
            }
            let el = hideStyleRef.current
            if (!el) {
              el = document.createElement('style')
              el.dataset.plugin = 'dsh-session-groups-hide'
              hideStyleRef.current = el
            }
            if (el.textContent !== hideCss) el.textContent = hideCss
            if (el.parentNode !== host) host.insertBefore(el, host.firstChild)
            return undefined
          }, [area, host, hideCss])
          React.useEffect(() => () => {
            hideStyleRef.current?.remove()
            hideStyleRef.current = null
          }, [])
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
          const newDrop = useSessionDrop(null, sessionId => {
            void op({ action: 'create', name: t('defaultName'), sessionId })
              .then(({ groupId }) => store.setView({ editing: `sidebar:${groupId}` }))
              .catch(() => {})
          })
          const confirmModal = view.pendingDelete ? h(Modal, {
            open: true,
            onClose: () => store.setView({ pendingDelete: null }),
            title: t('delete'),
            closeLabel: t('cancel'),
            description: tf('deleteConfirm', { name: view.pendingDelete.name }),
            footer: h(React.Fragment, null,
              h(Button, { variant: 'outline', 'data-modal-autofocus': true, onClick: () => store.setView({ pendingDelete: null }) }, t('cancel')),
              h(Button, {
                variant: 'primary', className: 'sg-danger-fill',
                onClick: () => {
                  const target = view.pendingDelete
                  store.setView({ pendingDelete: null })
                  if (target) void op({ action: 'delete', groupId: target.id }).catch(() => {})
                },
              }, t('delete'))),
          }) : null
          if (!area) return confirmModal
          const showDropNew = !searching && (dragging || newDrop.over)
          return h(React.Fragment, null,
            ReactDOM.createPortal(
              searching || (groups.length === 0 && !showDropNew) ? null : h('div', {
                className: 'sgs-root', role: 'tree', 'aria-label': t('panel'),
              },
              activeBulkIds.length > 0 ? h('div', { className: 'sgs-bulk', role: 'region', 'aria-live': 'polite' },
                h('span', { className: 'sgs-bulk-count' }, tf('selectedCount', { n: activeBulkIds.length })),
                h('span', { className: 'sgs-bulk-actions' },
                  groups.length > 1 ? h(Menu, {
                    open: bulkMenu, onClose: () => setBulkMenu(false), portal: true, align: 'end',
                    items: groups.map(g => ({ id: g.id, label: g.name, icon: h(IconFolderOpenRegular, { size: 14 }) })),
                    onSelect: moveBulkTo,
                    anchor: h('button', { type: 'button', className: 'sgs-btn', disabled: bulkBusy, title: t('moveTo'), 'aria-label': t('moveTo'), 'aria-haspopup': 'menu', 'aria-expanded': bulkMenu, onClick: () => setBulkMenu(v => !v) }, h(IconFolderOpenRegular, { size: 13 })),
                  }) : null,
                  h('button', { type: 'button', className: 'sgs-btn sgs-danger', disabled: bulkBusy, title: t('remove'), 'aria-label': t('remove'), onClick: () => void removeBulk() }, h(IconTrashOutlineRegular, { size: 13 })),
                  h('button', { type: 'button', className: 'sgs-btn', disabled: bulkBusy, title: t('clearSelection'), 'aria-label': t('clearSelection'), onClick: () => onBulkToggle(null, false) }, h(IconCloseOutlineRegular, { size: 13 })))) : null,
              groups.map((group, index) => h(SidebarFolder, {
                key: group.id, group, index, groups, byId, view, currentId,
                bulkSet: activeBulkSet, hasBulkSelection: activeBulkIds.length > 0, onBulkToggle, locale: loc.active,
              })),
              showDropNew ? h('div', { className: `sgs-row sgs-dropnew${newDrop.over ? ' sgs-dropping' : ''}`, ...newDrop.props },
                h('span', { className: 'sgs-slot' }, h(IconPlusOutlineRegular, { size: 14 })),
                h('span', { className: 'sgs-title' }, t('dropNew'))) : null), host),
            confirmModal)
        }

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'session-groups-sidebar', order: 1000,
        }, SidebarGroups))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: PANEL_ID, locale: NS,
        }, GroupsPage))

        function SessionGroupsToolRow({ phase, block, inspect, useDisclosure }) {
          const { expanded, toggle } = useDisclosure()
          const settled = phase === 'result' && block && 'kind' in block
          const call = settled ? block.call : block
          let args = {}
          try {
            const parsed = JSON.parse(call?.argsRaw ?? '{}')
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed
          } catch {}
          const text = settled && Array.isArray(block.content)
            ? block.content.filter(item => item.type === 'text').map(item => item.text).join('\n') : ''
          let payload = null
          if (text) { try { payload = JSON.parse(text) } catch {} }
          const action = typeof args.action === 'string' ? args.action : block?.args?.text?.('action') ?? ''
          const state = phase === 'preparing' ? 'preparing'
            : !settled ? 'running'
              : block.error?.code === 'interrupted' ? 'stopped'
                : block.isError ? 'error' : 'ok'
          const running = state === 'preparing' || state === 'running'
          let detail = ''
          if (state === 'stopped') detail = t('tvStopped')
          else if (state === 'error') detail = text.split('\n')[0] || ''
          else {
            const parts = []
            if (typeof args.name === 'string' && args.name) parts.push(args.name)
            else if (typeof args.groupId === 'string' && args.groupId) parts.push(args.groupId)
            if (typeof args.pinned === 'boolean') parts.push(t(args.pinned ? 'tvPinned' : 'tvUnpinned'))
            if (Array.isArray(payload?.groups)) parts.push(tf('tvGroupsCount', { n: payload.groups.length }))
            detail = parts.join(' · ')
          }
          const summary = state === 'error' || state === 'stopped' ? detail : [action, detail].filter(Boolean).join(' · ')
          const inputText = Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ''
          const outputText = payload !== null ? JSON.stringify(payload, null, 2) : text
          const expandable = state !== 'preparing' && Boolean(inputText || outputText)
          const open = expanded && expandable
          return h('div', { className: 'sg-tv', 'data-tool': 'session_groups', 'data-state': state },
            h(DisclosureRow, {
              rowClassName: 'sg-tv-row',
              icon: h(IconFolderOpenRegular, { size: 14 }),
              title: t('panel'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: state === 'preparing' || !summary ? null : h(React.Fragment, null,
                h('span', { className: 'sg-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `sg-tv-summary${state === 'error' ? ' is-err' : state === 'stopped' ? ' is-stop' : ''}` },
                  h(TextShimmer, null, summary))),
            },
            open ? h('div', { className: 'sg-tv-body' },
              h('div', { className: 'sg-tv-io' },
                inputText ? h('div', { className: 'sg-tv-io-sec' },
                  h('span', { className: 'sg-tv-io-label' }, t('tvInput')),
                  h('span', { className: 'sg-tv-io-text' }, inputText)) : null,
                inputText && outputText ? h('span', { className: 'sg-tv-io-div', 'aria-hidden': true }) : null,
                outputText ? h('div', { className: 'sg-tv-io-sec' },
                  h('span', { className: 'sg-tv-io-label' }, t('tvOutput')),
                  h('span', { className: 'sg-tv-io-text', 'data-error': state === 'error' || undefined }, outputText)) : null),
              inspect ? h('button', { type: 'button', className: 'sg-tv-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('tvInspect')) : null) : null))
        }

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview', key: 'session_groups', locale: NS, priority: -10,
        }, SessionGroupsToolRow))

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 20, locale: NS, label: () => t('panel'),
        }, ({ size }) => h(IconGroups, { size: size ?? 16 })))
      },
      _internal: { orderedMembers, groupOf },
    }
  },
})
