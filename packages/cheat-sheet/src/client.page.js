window.__ModuleLoader__.load({
  id: 'dsh-cheat-sheet',
  chunk: 'client.page.js',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement
    const NS = 'cheat-sheet-page'
    const STATE_PATH = 'cheat-sheet/state'
    const OP_PATH = 'cheat-sheet/op'
    const DICTS = {
      en: {
        title: 'Skill cheat sheet',
        intro: 'Shows manual-only skills by default. Pinned skills stay on top, followed by usage count.',
        usage: 'Insert places /name at the start of the composer without sending.',
        keyHint: '↑ ↓ select · Enter inserts · Esc closes',
        search: 'Search name, summary, or use case',
        count: '{shown} of {total} skills',
        loading: 'Loading skills…',
        loadFailed: 'Could not load skills: {message}',
        refresh: 'Refresh',
        retry: 'Retry',
        empty: 'No user-invocable skills in this session.',
        noMatches: 'No matching skills.',
        noDescription: 'No description.',
        about: 'What it does',
        when: 'When to use',
        userOnly: 'Manual only',
        userOnlyHint: 'Invoke explicitly with /name.',
        showAutomatic: 'Include Agent-invocable skills',
        filterHint: 'Hidden skills can still be invoked manually with /name.',
        hiddenAutomatic: '{count} Agent-invocable hidden',
        emptyManual: 'No manual-only skills in this session.',
        showOther: 'Show other skills',
        summaryMissing: 'Author description · no Chinese summary',
        summariesUnavailable: 'Chinese summaries unavailable. Check ~/.agents/skills/short-descriptions.zh.json and refresh.',
        write: 'Insert /{name}',
        writeFailed: 'Could not insert command. Try again.',
        close: 'Close',
        sort: 'Sort',
        sortUsage: 'Most used',
        sortName: 'Name',
        groupPinned: 'Pinned',
        groupOther: 'Other skills',
        groupAll: 'All skills',
        pin: 'Pin',
        pinLabel: 'Pin /{name}',
        pinOnHint: 'Pinned across sessions. Click to unpin.',
        pinOffHint: 'Pin to top across sessions.',
        pinSaving: 'Saving…',
        pinDone: 'Pinned /{name}.',
        unpinDone: 'Unpinned /{name}.',
        pinFailed: 'Pin change failed for /{name}: {message}',
        pinUnavailable: 'Waiting for usage data.',
        loads: '{count} loads',
        loadsOne: '1 load',
        loadsHint: 'Actual /name and Agent skill loads (excludes browsing and inserting).',
        loadsDetail: 'Loaded {count} times.',
        loadsDetailOne: 'Loaded once.',
        countsNote: 'Counts and pins are shared across sessions on this Host.',
        usageLoading: 'Loading pins and usage counts…',
        usageFailed: 'Pins and usage counts unavailable: {message}',
        usageRetry: 'Retry',
        httpError: 'Request failed (HTTP {status}).',
        badState: 'Unexpected server response.',
        networkError: 'Network error: {message}',
        details: 'Skill details',
        selectHint: 'Select a skill to view details.',
        countUnknown: 'Count unavailable',
        tvStopped: 'Stopped',
        tvInspect: 'Inspect',
        tvInput: 'IN',
        tvOutput: 'OUT',
        tvPinsCount: '{n} pinned',
        tvPinned: 'pinned',
        tvUnpinned: 'unpinned',
        backToList: 'Back to list',
      },
      zh: {
        title: '技能速查',
        intro: '默认只看手动触发技能，置顶在前，其余按使用次数排序。',
        usage: '点“写入”会把 /技能名 插到输入框开头，保留已有内容且不发送。',
        keyHint: '↑ ↓ 选择 · Enter 写入 · Esc 关闭',
        search: '搜索名称、中文说明或适用场景',
        count: '{shown} / {total} 个技能',
        loading: '正在读取技能…',
        loadFailed: '读取技能失败：{message}',
        refresh: '刷新',
        retry: '重试',
        empty: '当前会话没有可调用的技能。',
        noMatches: '没有匹配的技能。',
        noDescription: '暂无说明。',
        about: '用途',
        when: '适用场景',
        userOnly: '仅手动',
        userOnlyHint: '需要用 /技能名 手动触发。',
        showAutomatic: '包含 Agent 可自动调用的技能',
        filterHint: '隐藏的技能同样支持手动 /调用。',
        hiddenAutomatic: '已隐藏 {count} 个 Agent 可调用技能',
        emptyManual: '当前会话没有仅限手动调用的技能。',
        showOther: '显示其他技能',
        summaryMissing: '作者原文 · 暂无中文短说明',
        summariesUnavailable: '未读取到中文短说明，请检查 ~/.agents/skills/short-descriptions.zh.json 后刷新。',
        write: '写入 /{name}',
        writeFailed: '写入失败，请稍后重试。',
        close: '关闭',
        sort: '排序',
        sortUsage: '最常用',
        sortName: '名称',
        groupPinned: '已置顶',
        groupOther: '其他技能',
        groupAll: '全部技能',
        pin: '置顶',
        pinLabel: '置顶 /{name}',
        pinOnHint: '已置顶，点击取消。',
        pinOffHint: '固定到顶部（跨会话共享）。',
        pinSaving: '保存中…',
        pinDone: '已置顶 /{name}。',
        unpinDone: '已取消置顶 /{name}。',
        pinFailed: '置顶 /{name} 失败：{message}',
        pinUnavailable: '使用数据尚未就绪。',
        loads: '{count} 次',
        loadsOne: '1 次',
        loadsHint: '统计实际 /技能名 与 Agent 调用次数（不含搜索和写入）。',
        loadsDetail: '已加载 {count} 次。',
        loadsDetailOne: '已加载 1 次。',
        countsNote: '置顶与加载次数在本机所有会话间共享。',
        usageLoading: '正在读取置顶和次数…',
        usageFailed: '置顶和次数暂不可用：{message}',
        usageRetry: '重试',
        httpError: '请求失败（HTTP {status}）。',
        badState: '服务端返回格式异常。',
        networkError: '网络错误：{message}',
        details: '技能详情',
        selectHint: '选择一项查看说明。',
        countUnknown: '次数暂不可用',
        tvStopped: '已中止',
        tvInspect: '查看',
        tvInput: '输入',
        tvOutput: '输出',
        tvPinsCount: '{n} 个置顶',
        tvPinned: '已置顶',
        tvUnpinned: '已取消置顶',
        backToList: '返回列表',
      },
    }

    const CSS = `
.dcs-button,.dcs-icon-button,.dcs-seg button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;cursor:pointer}
.dcs-button svg,.dcs-icon-button svg{flex:none;width:16px;height:16px}
.dcs-button{min-height:30px;padding:4px 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px;white-space:nowrap}
.dcs-button[data-primary]{border-color:transparent;border-radius:999px;corner-shape:round;padding:4px 14px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dcs-button[aria-pressed=true]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.dcs-icon-button{flex:none;width:30px;height:30px;padding:0;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-tertiary)}
.dcs-icon-button[aria-pressed=true]{color:var(--dsw-alias-brand-primary)}
.dcs-button[aria-disabled=true],.dcs-icon-button[aria-disabled=true]{opacity:.5;cursor:default}
.dcs-button[data-busy],.dcs-icon-button[data-busy]{cursor:progress}
.dcs-dialog :focus-visible,.dcs-trigger:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dcs-dialog{box-sizing:border-box;width:min(1080px,calc(100vw - 32px));max-width:none;height:min(680px,calc(100dvh - 48px));max-height:none;margin:auto;padding:0;border:0;border-radius:var(--dsw-radius-lg,16px);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-prominent);font:inherit;font-size:14px;line-height:1.5;overflow:hidden}
.dcs-dialog[open]{display:flex;flex-direction:column}
.dcs-dialog::backdrop{background:var(--dsw-alias-bg-mask-1)}
.dcs-head{display:flex;align-items:flex-start;gap:16px;padding:18px 20px 12px}
.dcs-heading{flex:1;min-width:0}
.dcs-title{margin:0;font-size:16px;line-height:24px;font-weight:500}
.dcs-intro{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dcs-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:0 20px 12px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.dcs-search-box{position:relative;flex:1 1 260px;min-width:0}
.dcs-search-box svg{position:absolute;left:10px;top:50%;width:16px;height:16px;transform:translateY(-50%);color:var(--dsw-alias-label-tertiary);pointer-events:none}
.dcs-search{box-sizing:border-box;width:100%;height:34px;padding:0 10px 0 34px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dcs-search::placeholder{color:var(--dsw-alias-label-tertiary)}
.dcs-tools{display:flex;align-items:center;gap:8px}
.dcs-filters{display:flex;flex:1 0 100%;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 12px;min-height:26px;font-size:12px;line-height:20px}
.dcs-filter{display:inline-flex;align-items:center;gap:7px;cursor:pointer;color:var(--dsw-alias-label-primary)}
.dcs-filter input{margin:0;width:15px;height:15px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}
.dcs-filter-count{color:var(--dsw-alias-label-secondary)}
.dcs-seg{display:inline-flex;padding:2px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-module-platform)}
.dcs-seg button{min-height:26px;padding:2px 10px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px}
.dcs-seg button[aria-pressed=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}
.dcs-seg button[aria-disabled=true]{opacity:.5;cursor:default}
.dcs-banner{display:flex;align-items:center;gap:12px;margin:0;padding:8px 20px;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px}
.dcs-banner[data-quiet]{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}
.dcs-banner span{flex:1;min-width:0;overflow-wrap:anywhere}
.dcs-main{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr)}
.dcs-list-pane{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 8px 12px;border-right:.5px solid var(--dsw-alias-border-l1)}
.dcs-group{margin:10px 8px 4px;color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500;line-height:16px;letter-spacing:.04em;text-transform:uppercase}
.dcs-list{margin:0;padding:0;list-style:none}
.dcs-row{display:flex;align-items:center;gap:2px;border-radius:var(--dsw-radius-sm,8px)}
.dcs-row[data-selected]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.dcs-row-main{flex:1;min-width:0;display:block;margin:0;padding:7px 4px 7px 10px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dcs-row-main:focus-visible{outline-offset:-2px}
.dcs-row .dcs-icon-button{margin-right:4px}
.dcs-line{display:flex;align-items:center;gap:6px;min-width:0}
.dcs-row-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:13px;font-weight:500;line-height:20px}
.dcs-row-desc{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere;margin-top:3px;white-space:normal;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dcs-summary-source{display:block;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}
.dcs-count{flex:none;margin-left:auto;padding-left:8px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px;font-variant-numeric:tabular-nums;white-space:nowrap}
.dcs-count[data-active]{color:var(--dsw-alias-label-secondary)}
.dcs-badge{flex:none;display:inline-block;padding:0 6px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-xs,4px);color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:400;line-height:17px;white-space:nowrap}
.dcs-detail{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px 20px 20px;overflow-wrap:anywhere}
.dcs-detail-name{margin:0;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:15px;font-weight:500;line-height:22px;user-select:text}
.dcs-detail-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcs-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.dcs-note{margin:12px 0 0;padding:8px 10px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcs-section{margin-top:18px}
.dcs-section h4{margin:0 0 4px;color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500;line-height:16px;letter-spacing:.04em;text-transform:uppercase}
.dcs-section p{margin:0;white-space:pre-wrap;color:var(--dsw-alias-label-primary);font-size:13px;line-height:21px}
.dcs-message{flex:1;min-height:0;margin:0;padding:32px 20px;color:var(--dsw-alias-label-secondary);font-size:13px;text-align:center}
.dcs-message[data-error]{color:var(--dsw-alias-state-error-primary)}
.dcs-message .dcs-button{margin-top:12px}
.dcs-empty{margin:0;padding:28px 10px;color:var(--dsw-alias-label-secondary);font-size:13px;text-align:center}
.dcs-empty p{margin:0}.dcs-empty .dcs-button{margin-top:12px}
.dcs-foot{flex:none;display:flex;flex-direction:column;gap:2px;padding:10px 20px 12px;border-top:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcs-foot p{margin:0}
.dcs-foot .dcs-hint{color:var(--dsw-alias-label-tertiary)}
.dcs-feedback{overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dcs-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.dcs-feedback[data-error]{color:var(--dsw-alias-state-error-primary)}
@media(hover:hover){.dcs-trigger:hover,.dcs-button:hover:not([aria-disabled=true]),.dcs-icon-button:hover:not([aria-disabled=true]),.dcs-row:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dcs-button[data-primary]:hover:not([aria-disabled=true]){background:var(--dsw-alias-button-primary-hover);color:var(--dsw-alias-label-primary-foreground)}.dcs-seg button:hover:not([aria-disabled=true]){color:var(--dsw-alias-label-primary)}}
@media(pointer:coarse){.dcs-search{font-size:16px}.dcs-icon-button{width:36px;height:36px}.dcs-button{min-height:36px}}
.dcs-mobile-back{display:none;margin-bottom:10px}
@media(max-width:480px){.dcs-trigger span{display:none}}
@media(max-width:720px){.dcs-dialog{width:calc(100vw - 16px);height:calc(100dvh - 24px)}.dcs-intro{display:none}.dcs-main{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr)}.dcs-list-pane{border-right:0}.dcs-detail{max-height:none;border-top:0;padding:12px 12px 16px}.dcs-main[data-mobile-view=list] .dcs-detail{display:none}.dcs-main[data-mobile-view=detail] .dcs-list-pane{display:none}.dcs-mobile-back{display:inline-flex}.dcs-head{padding:12px 12px 8px}.dcs-toolbar{padding:0 12px 8px}.dcs-banner{padding:8px 12px}.dcs-foot{padding:8px 12px}.dcs-foot p:not([role]){display:none}.dcs-foot .dcs-hint{display:none}}
.dcs-tv{display:flex;flex-direction:column}
.dcs-tv-row{min-width:0}
`

    const svg = (children, props) => h('svg', { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }, ...children)
    const SearchIcon = () => svg([h('circle', { key: 'c', cx: 8.5, cy: 8.5, r: 5 }), h('path', { key: 'p', d: 'm12.5 12.5 4 4' })])
    const CloseIcon = () => svg([h('path', { key: 'p', d: 'm5 5 10 10M15 5 5 15' })])
    const RefreshIcon = () => svg([h('path', { key: 'p', d: 'M16 10a6 6 0 1 1-1.8-4.3M16 3.5v3h-3' })])
    const WriteIcon = () => svg([h('rect', { key: 'r', x: 3, y: 3, width: 14, height: 14, rx: 2 }), h('path', { key: 'p', d: 'M6 10h8m-3-3 3 3-3 3' })])
    const PinIcon = ({ on }) => svg([
      h('path', { key: 'b', d: 'M7.5 3h5l-.9 4.4 2.9 2.6v1.5h-9V10l2.9-2.6z', fill: on ? 'currentColor' : 'none' }),
      h('path', { key: 's', d: 'M10 11.5V17' }),
    ])

    function normalizeState(body) {
      if (!Array.isArray(body?.pinned) || !body?.counts || typeof body.counts !== 'object' || Array.isArray(body.counts)) return null
      const descriptionsAvailable = body.descriptionsAvailable === true && body.descriptions !== null && typeof body.descriptions === 'object'
      return {
        pinned: [...new Set(body.pinned)],
        counts: body.counts,
        descriptions: descriptionsAvailable ? body.descriptions : {},
        descriptionsAvailable,
      }
    }

    async function requestState(t, path, init, signal) {
      let response
      try {
        response = await fetch(path, {
          ...init,
          signal,
          headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) },
        })
      } catch (error) {
        if (signal.aborted) throw error
        throw new Error(t('networkError', { message: error.message }), { cause: error })
      }
      const body = await response.json().catch(() => null)
      if (!response.ok) throw new Error(typeof body?.message === 'string' && body.message ? body.message : t('httpError', { status: response.status }))
      const state = normalizeState(body)
      if (!state) throw new Error(t('badState'))
      return state
    }

    const byName = (a, b) => a.name.localeCompare(b.name)

    function buildSkillView(skills, shared, { query, sort, showAutomatic }) {
      const effectiveSort = shared === null ? 'name' : sort
      const counts = shared?.counts ?? {}
      const descriptions = shared?.descriptions ?? {}
      const pinned = new Set(shared?.pinned ?? [])
      const countOf = name => Object.hasOwn(counts, name) ? counts[name] : 0
      const scoped = skills.filter(skill => showAutomatic || skill.modelInvocable === false)
      const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean)
      const rows = scoped.map(skill => ({
        ...skill,
        summary: Object.hasOwn(descriptions, skill.name) ? descriptions[skill.name] : null,
        loads: shared === null ? null : countOf(skill.name),
        pinned: pinned.has(skill.name),
      })).filter(row => {
        const haystack = `${row.name} /${row.name} ${row.summary ?? ''} ${row.description} ${row.whenToUse ?? ''}`.toLowerCase()
        return terms.every(term => haystack.includes(term))
      }).toSorted((a, b) => Number(b.pinned) - Number(a.pinned)
        || (effectiveSort === 'usage' ? countOf(b.name) - countOf(a.name) : 0)
        || byName(a, b))
      const pinnedRows = rows.filter(row => row.pinned)
      const otherRows = rows.filter(row => !row.pinned)
      const groups = []
      if (pinnedRows.length > 0) groups.push({ key: 'groupPinned', rows: pinnedRows })
      if (otherRows.length > 0) groups.push({ key: pinnedRows.length > 0 ? 'groupOther' : 'groupAll', rows: otherRows })
      const emptyKey = rows.length > 0 ? null
        : skills.length === 0 ? 'empty'
          : !showAutomatic && scoped.length === 0 ? 'emptyManual' : 'noMatches'
      return { rows, groups, effectiveSort, hiddenAutomatic: skills.length - scoped.length, emptyKey }
    }


    function createSheet(ctx, styleRef) {
      const disposes = Object.entries(DICTS).map(([lang, dict]) => ctx.locale.register(NS, lang, dict))
      const pageT = ctx.locale.bind(NS)
      const ensureDialogStyles = () => {
        if (styleRef.dialog || typeof document === 'undefined' || !document.head) return
        styleRef.dialog = document.createElement('style')
        styleRef.dialog.textContent = CSS
        document.head.append(styleRef.dialog)
      }
      function Sheet({ sessionId, listSkills, inputActions, onDismiss }) {
        const t = pageT
        const useStyleEffect = React.useLayoutEffect ?? React.useEffect
        useStyleEffect(ensureDialogStyles, [])
        const dialog = React.useRef(null)
        const search = React.useRef(null)
        const ops = React.useRef(new Set())
        const tRef = React.useRef(t)
        tRef.current = t
        const backdropPress = React.useRef(false)
        const ids = { title: React.useId(), intro: React.useId(), detail: React.useId(), loads: React.useId(), filter: React.useId() }
        const [query, setQuery] = React.useState('')
        const [showAutomatic, setShowAutomatic] = React.useState(false)
        const [sort, setSort] = React.useState('usage')
        const [selected, setSelected] = React.useState(null)
        const [mobileView, setMobileView] = React.useState('list')
        const [revision, setRevision] = React.useState(0)
        const [usageRevision, setUsageRevision] = React.useState(0)
        const [catalog, setCatalog] = React.useState({ phase: 'loading', skills: [] })
        const [usage, setUsage] = React.useState({ phase: 'loading', data: null, retry: false })
        const [saving, setSaving] = React.useState(null)
        const [feedback, setFeedback] = React.useState(null)
  
        React.useLayoutEffect(() => {
          const node = dialog.current
          const opener = document.activeElement
          const controllers = ops.current
          node.showModal()
          search.current.focus()
          return () => {
            for (const controller of controllers) controller.abort()
            if (node.open) node.close()
            if (opener instanceof HTMLElement && opener.isConnected && document.activeElement !== opener) opener.focus()
          }
        }, [])
  
        React.useEffect(() => {
          const abort = new AbortController()
          setCatalog({ phase: 'loading', skills: [] })
          listSkills(sessionId, abort.signal).then(result => {
            if (abort.signal.aborted) return
            if (!result.ok) setCatalog({ phase: 'error', skills: [], error: result.error.message })
            else setCatalog({ phase: 'ready', skills: result.value.skills })
          }).catch(error => {
            if (!abort.signal.aborted) setCatalog({ phase: 'error', skills: [], error: error.message })
          })
          return () => abort.abort()
        }, [sessionId, listSkills, revision])
  
        React.useEffect(() => {
          const abort = new AbortController()
          requestState(tRef.current, STATE_PATH, { method: 'GET' }, abort.signal).then(data => {
            if (!abort.signal.aborted) setUsage({ phase: 'ready', data, retry: false })
          }).catch(error => {
            if (!abort.signal.aborted) setUsage({ phase: 'error', data: null, error: error.message, retry: false })
          })
          return () => abort.abort()
        }, [usageRevision])
  
        const refresh = () => {
          if (catalog.phase === 'loading' || saving) return
          setFeedback(null)
          setUsage({ phase: 'loading', data: null, retry: false })
          setRevision(v => v + 1)
          setUsageRevision(v => v + 1)
        }
        const retryUsage = () => {
          setUsage({ phase: 'loading', data: null, retry: true })
          setUsageRevision(v => v + 1)
        }
  
        const usageReady = usage.phase === 'ready'
        const shared = usageReady ? usage.data : null
        const view = React.useMemo(() => buildSkillView(catalog.skills, shared, { query, sort, showAutomatic }),
          [catalog.skills, shared, query, sort, showAutomatic])
        const { rows: shown, effectiveSort, hiddenAutomatic } = view
        const current = shown.find(skill => skill.name === selected) ?? shown[0] ?? null
  
        const write = name => {
          try {
            const { draftRev } = inputActions.captureInsertion()
            if (!inputActions.insertText(`/${name} `, { start: 0, end: 0, draftRev })) {
              setFeedback({ key: 'writeFailed', error: true })
              return
            }
          } catch {
            setFeedback({ key: 'writeFailed', error: true })
            return
          }
          onDismiss()
        }
  
        const togglePin = async skill => {
          if (!usageReady || saving) return
          const { name } = skill
          const pinned = !skill.pinned
          const controller = new AbortController()
          ops.current.add(controller)
          setSaving(name)
          setFeedback(null)
          try {
            const data = await requestState(t, OP_PATH, {
              method: 'POST', body: JSON.stringify({ action: 'pin', name, pinned }),
            }, controller.signal)
            if (controller.signal.aborted) return
            setUsage({ phase: 'ready', data, retry: false })
            setFeedback({ key: pinned ? 'pinDone' : 'unpinDone', params: { name } })
          } catch (error) {
            if (!controller.signal.aborted) setFeedback({ key: 'pinFailed', params: { name, message: error.message }, error: true })
          } finally {
            ops.current.delete(controller)
            if (!controller.signal.aborted) setSaving(null)
          }
        }
  
        const lastPin = React.useRef(null)
        React.useLayoutEffect(() => {
          const node = dialog.current
          if (!node || !lastPin.current || saving) return
          const active = document.activeElement
          if (!active || active === node || !node.contains(active)) {
            const target = [...node.querySelectorAll('[data-pin-row]')].find(el => el.dataset.pinRow === lastPin.current)
            target?.focus()
          }
          lastPin.current = null
        }, [saving, usage])
  
        const rowButtons = () => [...dialog.current.querySelectorAll('.dcs-row-main')]
        const focusRow = index => {
          const rows = rowButtons()
          if (rows.length === 0) return
          const target = rows[Math.max(0, Math.min(index, rows.length - 1))]
          target.focus()
          target.scrollIntoView({ block: 'nearest' })
        }
        const onSearchKey = event => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            focusRow(current ? shown.indexOf(current) : 0)
          } else if (event.key === 'Enter' && current) {
            event.preventDefault()
            write(current.name)
          } else if (event.key === 'Escape' && query) {
            event.preventDefault()
            setQuery('')
          }
        }
        const onRowKey = (event, index, skill) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            write(skill.name)
            return
          }
          const moves = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: shown.length - 1 }
          if (!(event.key in moves)) return
          event.preventDefault()
          if (moves[event.key] < 0) search.current.focus()
          else focusRow(moves[event.key])
        }
  
        const loadsText = count => t(count === 1 ? 'loadsOne' : 'loads', { count })
        const pinButton = (skill, compact) => {
          const pressed = skill.pinned
          const busy = saving === skill.name
          const unavailable = !usageReady || (saving !== null && !busy)
          const hint = !usageReady ? t('pinUnavailable') : busy ? t('pinSaving') : t(pressed ? 'pinOnHint' : 'pinOffHint')
          return h('button', {
            type: 'button',
            className: compact ? 'dcs-icon-button' : 'dcs-button',
            'aria-pressed': pressed,
            'aria-disabled': unavailable || busy || undefined,
            'aria-busy': busy || undefined,
            'aria-label': compact ? t('pinLabel', { name: skill.name }) : undefined,
            'data-busy': busy || undefined,
            'data-pin-row': compact ? skill.name : undefined,
            title: hint,
            onClick: () => {
              if (compact) lastPin.current = skill.name
              togglePin(skill)
            },
          }, h(PinIcon, { on: pressed }), compact ? null : busy ? t('pinSaving') : t('pin'))
        }
  
        const renderRow = skill => {
          const isCurrent = skill === current
          const count = skill.loads
          const summary = skill.summary
          return h('li', { key: skill.name, className: 'dcs-row', 'data-selected': isCurrent || undefined },
            h('button', {
              type: 'button', className: 'dcs-row-main', 'aria-current': isCurrent || undefined,
              'aria-controls': ids.detail,
              onClick: () => { setSelected(skill.name); setMobileView('detail') },
              onDoubleClick: () => write(skill.name),
              onFocus: () => setSelected(skill.name),
              onKeyDown: event => onRowKey(event, shown.indexOf(skill), skill),
            },
            h('span', { className: 'dcs-line' },
              h('span', { className: 'dcs-row-name' }, `/${skill.name}`),
              skill.modelInvocable === false ? h('span', { className: 'dcs-badge', title: t('userOnlyHint') }, t('userOnly')) : null,
              usageReady
                ? h('span', { className: 'dcs-count', 'data-active': count > 0 || undefined, title: t('loadsHint') }, loadsText(count))
                : h('span', { className: 'dcs-count', title: t('countUnknown') }, h('span', { 'aria-hidden': true }, '—'), h('span', { className: 'dcs-sr' }, t('countUnknown')))),
            h('span', { className: 'dcs-row-desc', lang: summary ? 'zh-CN' : undefined, title: summary ?? skill.description },
              summary ?? h(React.Fragment, null,
                h('span', { className: 'dcs-summary-source' }, t('summaryMissing')),
                skill.description || t('noDescription')))),
            pinButton(skill, true))
        }
  
        const list = () => {
          if (view.emptyKey) return h('div', { className: 'dcs-empty' },
            h('p', null, t(view.emptyKey)),
            hiddenAutomatic > 0 ? h('button', { type: 'button', className: 'dcs-button', onClick: () => setShowAutomatic(true) }, t('showOther')) : null)
          return view.groups.map(({ key, rows }) => h(React.Fragment, { key },
            h('h3', { className: 'dcs-group', id: `${ids.title}-${key}` }, `${t(key)} · ${rows.length}`),
            h('ul', { className: 'dcs-list', 'aria-labelledby': `${ids.title}-${key}` }, ...rows.map(renderRow))))
        }
  
        const detail = () => {
          const backBtn = h('button', { type: 'button', className: 'dcs-button dcs-mobile-back', onClick: () => setMobileView('list') }, `← ${t('backToList')}`)
          if (!current) return h('section', { id: ids.detail, className: 'dcs-detail', 'aria-label': t('details') }, backBtn, h('p', { className: 'dcs-empty' }, t('selectHint')))
          const count = current.loads
          return h('section', { id: ids.detail, className: 'dcs-detail', 'aria-labelledby': `${ids.detail}-name` },
            backBtn,
            h('h3', { id: `${ids.detail}-name`, className: 'dcs-detail-name' }, `/${current.name}`),
            h('div', { className: 'dcs-detail-meta' },
              current.modelInvocable === false ? h('span', { className: 'dcs-badge' }, t('userOnly')) : null,
              usageReady ? h('span', { id: ids.loads, title: t('loadsHint') }, t(count === 1 ? 'loadsDetailOne' : 'loadsDetail', { count })) : h('span', null, t('countUnknown'))),
            h('div', { className: 'dcs-actions' },
              h('button', { type: 'button', className: 'dcs-button', 'data-primary': true, onClick: () => write(current.name) }, h(WriteIcon), t('write', { name: current.name })),
              pinButton(current, false)),
            current.modelInvocable === false ? h('p', { className: 'dcs-note' }, t('userOnlyHint')) : null,
            h('div', { className: 'dcs-section' },
              h('h4', null, t('about')),
              h('p', null, current.description || t('noDescription'))),
            current.whenToUse && current.whenToUse !== current.description
              ? h('div', { className: 'dcs-section' }, h('h4', null, t('when')), h('p', null, current.whenToUse))
              : null)
        }
  
        const waiting = catalog.phase === 'loading' || (usage.phase === 'loading' && !usage.retry)
        let body
        if (catalog.phase === 'error') {
          body = h('div', { className: 'dcs-message', role: 'alert', 'data-error': true },
            h('div', null, t('loadFailed', { message: catalog.error })),
            h('button', { type: 'button', className: 'dcs-button', onClick: refresh }, t('retry')))
        } else if (waiting) {
          body = h('p', { className: 'dcs-message' }, t('loading'))
        } else {
          body = h('div', { className: 'dcs-main', 'data-mobile-view': mobileView },
            h('div', { className: 'dcs-list-pane' }, list()),
            detail())
        }
  
        const statusText = catalog.phase === 'ready' && !waiting
          ? t('count', { shown: shown.length, total: catalog.skills.length })
          : catalog.phase === 'loading' ? t('loading') : ''
        const sortButton = (key, label) => h('button', {
          type: 'button',
          'aria-pressed': effectiveSort === key,
          'aria-disabled': (key === 'usage' && !usageReady) || undefined,
          title: key === 'usage' ? (!usageReady ? t('pinUnavailable') : t('loadsHint')) : undefined,
          onClick: () => { if (key === 'name' || usageReady) setSort(key) },
        }, t(label))
        const refreshBusy = catalog.phase === 'loading' || saving !== null
  
        return ReactDOM.createPortal(h('dialog', {
          ref: dialog, className: 'dcs-dialog', 'aria-labelledby': ids.title, 'aria-describedby': ids.intro,
          onCancel: event => { event.preventDefault(); onDismiss() },
          onPointerDown: event => { backdropPress.current = event.target === dialog.current },
          onClick: event => {
            if (backdropPress.current && event.target === dialog.current) onDismiss()
            backdropPress.current = false
          },
        },
        h('div', { className: 'dcs-head' },
          h('div', { className: 'dcs-heading' },
            h('h2', { id: ids.title, className: 'dcs-title' }, t('title')),
            h('p', { id: ids.intro, className: 'dcs-intro' }, t('intro'))),
          h('button', { type: 'button', className: 'dcs-icon-button', 'aria-label': t('close'), title: t('close'), onClick: onDismiss }, h(CloseIcon))),
        h('div', { className: 'dcs-toolbar' },
          h('div', { className: 'dcs-search-box' },
            h(SearchIcon),
            h('input', {
              ref: search, type: 'search', className: 'dcs-search', value: query, placeholder: t('search'), 'aria-label': t('search'),
              'aria-keyshortcuts': 'ArrowDown Enter', autoComplete: 'off', spellCheck: false,
              onChange: event => { setQuery(event.target.value); setMobileView('list') },
              onKeyDown: onSearchKey,
            })),
          h('div', { className: 'dcs-tools' },
            h('div', { className: 'dcs-seg', role: 'group', 'aria-label': t('sort') },
              sortButton('usage', 'sortUsage'),
              sortButton('name', 'sortName')),
            h('button', {
              type: 'button', className: 'dcs-button', 'aria-disabled': refreshBusy || undefined, 'data-busy': refreshBusy || undefined,
              onClick: refresh,
            }, h(RefreshIcon), t('refresh'))),
          h('div', { className: 'dcs-filters' },
            h('label', { className: 'dcs-filter', title: t('filterHint') },
              h('input', { type: 'checkbox', checked: showAutomatic, 'aria-describedby': ids.filter, onChange: event => setShowAutomatic(event.target.checked) }),
              t('showAutomatic')),
            h('span', { id: ids.filter, className: 'dcs-sr' }, t('filterHint')),
            !showAutomatic && catalog.phase === 'ready' ? h('span', { className: 'dcs-filter-count' }, t('hiddenAutomatic', { count: hiddenAutomatic })) : null)),
        usage.phase === 'error' && catalog.phase === 'ready'
          ? h('div', { className: 'dcs-banner', role: 'alert' },
            h('span', null, t('usageFailed', { message: usage.error })),
            h('button', { type: 'button', className: 'dcs-button', onClick: retryUsage }, t('usageRetry')))
          : usage.phase === 'loading' && usage.retry
            ? h('div', { className: 'dcs-banner', 'data-quiet': true, role: 'status' }, h('span', null, t('usageLoading')))
            : null,
        usageReady && !usage.data.descriptionsAvailable && catalog.phase === 'ready'
          ? h('div', { className: 'dcs-banner', 'data-quiet': true, role: 'status' }, t('summariesUnavailable'))
          : null,
        h('div', { style: { display: 'contents' }, 'aria-busy': waiting }, body),
        h('div', { className: 'dcs-foot' },
          h('p', { role: 'status', 'aria-live': 'polite' }, statusText),
          h('p', null, t('usage')),
          usageReady ? h('p', null, t('countsNote')) : null,
          h('p', { className: 'dcs-hint' }, t('keyHint')),
          h('p', { className: 'dcs-feedback', role: 'status' }, feedback && !feedback.error ? t(feedback.key, feedback.params) : null),
          h('p', { className: 'dcs-feedback', role: 'alert', 'data-error': true }, feedback?.error ? t(feedback.key, feedback.params) : null))), document.body)
      }
      return {
        Sheet,
        dispose() {
          for (const d of disposes) d?.()
        },
      }
    }

    return { createSheet }
  },
})
