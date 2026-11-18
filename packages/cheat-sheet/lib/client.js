/** Session-scoped cheat sheet for user-invocable skills, with shared pins and load counts. */
window.__ModuleLoader__.load({
  id: 'dsh-cheat-sheet',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement
    const NS = 'cheat-sheet'
    const STATE_PATH = 'cheat-sheet/state'
    const OP_PATH = 'cheat-sheet/op'
    const DICTS = {
      en: {
        title: 'Skill cheat sheet',
        intro: 'Manual-only skills are shown by default. Include Agent-invocable skills below if needed. Pinned skills come first, then the most loaded ones.',
        usage: 'Insert /name at the start of the input, then add your request. Existing content is kept; nothing is sent or run.',
        keyHint: '↑ ↓ choose a skill · Enter in search inserts the selected command · Esc closes',
        search: 'Search names, Chinese summaries and use cases',
        count: '{shown} of {total} skills',
        loading: 'Loading skills…',
        loadFailed: 'Could not load skills: {message}',
        refresh: 'Refresh',
        retry: 'Retry',
        empty: 'No user-invocable skills in this session.',
        noMatches: 'No matching skills. Try another search.',
        noDescription: 'This skill has no description.',
        about: 'What it does',
        when: 'When to use',
        userOnly: 'Manual only',
        userOnlyHint: 'The agent cannot load this skill on its own. Invoke it explicitly with /name.',
        showAutomatic: 'Include skills the Agent can also invoke',
        filterHint: 'Off by default: only manual-only skills are shown. Hidden skills still support manual invocation. Pins follow this filter too.',
        hiddenAutomatic: '{count} Agent-invocable skills hidden',
        emptyManual: 'No manual-only skills in this session. Include Agent-invocable skills to browse the other skills you can invoke manually.',
        showOther: 'Show other skills',
        summaryMissing: 'Author description · Chinese summary not yet available',
        summariesUnavailable: 'Chinese summaries are unavailable. Check ~/.agents/skills/short-descriptions.zh.json and refresh; after updating the reader, reload the Host plugin first. Pins and counts still work.',
        write: 'Insert /{name}',
        writeFailed: 'Could not insert the command. The input may be submitting or its content may have changed. Wait and try again.',
        close: 'Close',
        sort: 'Sort',
        sortUsage: 'Most used',
        sortName: 'Name',
        groupPinned: 'Pinned',
        groupOther: 'Other skills',
        groupAll: 'All skills',
        pin: 'Pin to top',
        pinLabel: 'Pin /{name} to top',
        pinOnHint: 'Pinned for everyone using this Harness. Press to unpin.',
        pinOffHint: 'Keep this skill at the top of the list for everyone using this Harness.',
        pinSaving: 'Saving…',
        pinDone: 'Pinned /{name}.',
        unpinDone: 'Unpinned /{name}.',
        pinFailed: 'Could not confirm the pin change for /{name}: {message} Refresh to check the saved state.',
        pinUnavailable: 'Pinning is unavailable until usage data loads.',
        loads: '{count} loads',
        loadsOne: '1 load',
        loadsHint: 'Actual loads counted since usage tracking was enabled, combining manual /name and Agent loads. Earlier history is not included. Inserting commands and searching are not counted.',
        loadsDetail: 'Loaded {count} times since usage tracking was enabled, manual and Agent loads combined.',
        loadsDetailOne: 'Loaded once since usage tracking was enabled, manual and Agent loads combined.',
        countsNote: 'Counts are actual loads since usage tracking was enabled, manual and Agent combined. Pins and counts are shared across sessions.',
        usageLoading: 'Loading pins and usage counts…',
        usageFailed: 'Pins and usage counts are unavailable: {message} Skills are listed by name and pinning is disabled.',
        usageRetry: 'Retry',
        httpError: 'Request failed (HTTP {status}).',
        badState: 'The server returned unexpected data.',
        networkError: 'Network error: {message}',
        details: 'Skill details',
        selectHint: 'Select a skill to see what it does.',
        countUnknown: 'Load count unavailable',
      },
      zh: {
        title: '技能速查',
        intro: '默认只看仅限手动调用的技能，可按需显示 Agent 也能调用的技能。置顶优先，组内按使用次数降序。',
        usage: '点击“写入”，把 /技能名 放到输入框开头，再补充需求。已有内容会保留，不会自动发送或执行。',
        keyHint: '↑ ↓ 选择技能 · 在搜索框按 Enter 写入所选命令 · Esc 关闭',
        search: '搜索名称、中文短说明和适用场景',
        count: '{shown} / {total} 个技能',
        loading: '正在读取技能…',
        loadFailed: '读取技能失败：{message}',
        refresh: '刷新',
        retry: '重试',
        empty: '当前会话没有可主动调用的技能。',
        noMatches: '没有匹配的技能，换个关键词试试。',
        noDescription: '这个技能没有提供用途说明。',
        about: '用途',
        when: '适用场景',
        userOnly: '仅限手动调用',
        userOnlyHint: 'Agent 不能自行加载这个技能，需要你用 /技能名 显式调用。',
        showAutomatic: '包含 Agent 可自动调用的技能',
        filterHint: '默认关闭，只显示“仅限手动调用”的技能。隐藏项仍支持手动调用，置顶项也遵循此过滤。',
        hiddenAutomatic: '已隐藏 {count} 个 Agent 可调用技能',
        emptyManual: '当前会话没有仅限手动调用的技能。开启“包含 Agent 可自动调用的技能”，可查看其他支持手动调用的技能。',
        showOther: '显示其他技能',
        summaryMissing: '作者原文 · 中文短说明待补充',
        summariesUnavailable: '中文短说明暂不可用。请检查 ~/.agents/skills/short-descriptions.zh.json 并刷新；刚更新读取逻辑时需重新加载 Host 插件。置顶和次数仍可使用。',
        write: '写入 /{name}',
        writeFailed: '写入失败，输入框可能正在提交或内容已变化，请稍后重试。',
        close: '关闭',
        sort: '排序',
        sortUsage: '最常用',
        sortName: '名称',
        groupPinned: '已置顶',
        groupOther: '其他技能',
        groupAll: '全部技能',
        pin: '置顶',
        pinLabel: '置顶 /{name}',
        pinOnHint: '已置顶，对使用此 Harness 的所有人生效。再次点击取消置顶。',
        pinOffHint: '把这个技能固定在列表顶部，对使用此 Harness 的所有人生效。',
        pinSaving: '正在保存…',
        pinDone: '已置顶 /{name}。',
        unpinDone: '已取消置顶 /{name}。',
        pinFailed: '未能确认 /{name} 的置顶是否已保存：{message} 请刷新核对实际状态。',
        pinUnavailable: '使用数据加载成功后才能置顶。',
        loads: '加载 {count} 次',
        loadsOne: '加载 1 次',
        loadsHint: '启用统计后累计的实际加载次数，包含手动 /技能名 和 Agent 调用，不含启用前的历史。写入命令和搜索不计入。',
        loadsDetail: '启用统计以来实际加载 {count} 次，包含手动和 Agent 调用。',
        loadsDetailOne: '启用统计以来实际加载 1 次，包含手动和 Agent 调用。',
        countsNote: '次数为启用统计后的实际加载次数，合计手动和 Agent 调用。置顶和次数在各会话间共享。',
        usageLoading: '正在读取置顶和使用次数…',
        usageFailed: '置顶和使用次数暂不可用：{message} 技能按名称排列，暂时不能置顶。',
        usageRetry: '重试',
        httpError: '请求失败（HTTP {status}）。',
        badState: '服务端返回的数据格式不正确。',
        networkError: '网络错误：{message}',
        details: '技能详情',
        selectHint: '选择一个技能查看用途。',
        countUnknown: '加载次数暂不可用',
      },
    }

    const CSS = `
.dcs-trigger,.dcs-button,.dcs-icon-button,.dcs-seg button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;cursor:pointer}
.dcs-trigger{min-height:30px;padding:4px 9px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px;white-space:nowrap}
.dcs-trigger svg,.dcs-button svg,.dcs-icon-button svg{flex:none;width:16px;height:16px}
.dcs-button{min-height:30px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px;white-space:nowrap}
.dcs-button[data-primary]{border-color:var(--dsw-alias-button-primary-fill);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dcs-button[aria-pressed=true]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.dcs-icon-button{flex:none;width:30px;height:30px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary)}
.dcs-icon-button[aria-pressed=true]{color:var(--dsw-alias-brand-primary)}
.dcs-trigger:hover,.dcs-button:hover,.dcs-icon-button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dcs-button[data-primary]:hover{background:var(--dsw-alias-button-primary-hover);color:var(--dsw-alias-label-primary-foreground)}
.dcs-button[aria-disabled=true],.dcs-icon-button[aria-disabled=true]{opacity:.5;cursor:default}
.dcs-button[aria-disabled=true]:hover,.dcs-icon-button[aria-disabled=true]:hover{background:transparent}
.dcs-button[data-busy],.dcs-icon-button[data-busy]{cursor:progress}
.dcs-dialog :focus-visible,.dcs-trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dcs-dialog{box-sizing:border-box;width:min(1080px,calc(100vw - 32px));max-width:none;height:min(680px,calc(100dvh - 48px));max-height:none;margin:auto;padding:0;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:1.5;overflow:hidden}
.dcs-dialog[open]{display:flex;flex-direction:column}
.dcs-dialog::backdrop{background:var(--dsw-alias-bg-mask-1,color-mix(in srgb,var(--dsw-alias-bg-base) 65%,transparent))}
.dcs-head{display:flex;align-items:flex-start;gap:16px;padding:18px 20px 12px}
.dcs-heading{flex:1;min-width:0}
.dcs-title{margin:0;font-size:18px;line-height:26px;font-weight:600}
.dcs-intro{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dcs-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:0 20px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dcs-search-box{position:relative;flex:1 1 260px;min-width:0}
.dcs-search-box svg{position:absolute;left:10px;top:50%;width:16px;height:16px;transform:translateY(-50%);color:var(--dsw-alias-label-tertiary);pointer-events:none}
.dcs-search{box-sizing:border-box;width:100%;min-height:36px;padding:7px 10px 7px 34px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dcs-search::placeholder{color:var(--dsw-alias-label-tertiary)}
.dcs-tools{display:flex;align-items:center;gap:8px}
.dcs-filters{display:flex;flex:1 0 100%;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 12px;min-height:26px;font-size:12px;line-height:20px}
.dcs-filter{display:inline-flex;align-items:center;gap:7px;cursor:pointer;color:var(--dsw-alias-label-primary)}
.dcs-filter input{margin:0;width:15px;height:15px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}
.dcs-filter-count{color:var(--dsw-alias-label-secondary)}
.dcs-seg{display:inline-flex;padding:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1)}
.dcs-seg button{min-height:26px;padding:2px 10px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px}
.dcs-seg button:hover{color:var(--dsw-alias-label-primary)}
.dcs-seg button[aria-pressed=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}
.dcs-seg button[aria-disabled=true]{opacity:.5;cursor:default}
.dcs-banner{display:flex;align-items:center;gap:12px;margin:0;padding:8px 20px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-state-warn-tertiary,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px}
.dcs-banner[data-quiet]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary)}
.dcs-banner span{flex:1;min-width:0;overflow-wrap:anywhere}
.dcs-main{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr)}
.dcs-list-pane{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 8px 12px;border-right:1px solid var(--dsw-alias-border-l1)}
.dcs-group{margin:10px 8px 4px;color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:600;line-height:16px;letter-spacing:.04em;text-transform:uppercase}
.dcs-list{margin:0;padding:0;list-style:none}
.dcs-row{display:flex;align-items:center;gap:2px;border-radius:10px}
.dcs-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dcs-row[data-selected]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.dcs-row-main{flex:1;min-width:0;display:block;margin:0;padding:7px 4px 7px 10px;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dcs-row-main:focus-visible{outline-offset:-2px}
.dcs-row .dcs-icon-button{margin-right:4px}
.dcs-line{display:flex;align-items:center;gap:6px;min-width:0}
.dcs-row-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:600;line-height:20px}
.dcs-row-desc{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere;margin-top:3px;white-space:normal;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dcs-summary-source{display:block;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}
.dcs-count{flex:none;margin-left:auto;padding-left:8px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px;font-variant-numeric:tabular-nums;white-space:nowrap}
.dcs-count[data-active]{color:var(--dsw-alias-label-secondary)}
.dcs-badge{flex:none;display:inline-block;padding:0 6px;border:1px solid var(--dsw-alias-border-l2);border-radius:5px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:400;line-height:17px;white-space:nowrap}
.dcs-detail{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px 20px 20px;overflow-wrap:anywhere}
.dcs-detail-name{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;font-weight:600;line-height:24px;user-select:text}
.dcs-detail-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcs-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.dcs-note{margin:12px 0 0;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcs-section{margin-top:18px}
.dcs-section h4{margin:0 0 4px;color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:600;line-height:16px;letter-spacing:.04em;text-transform:uppercase}
.dcs-section p{margin:0;white-space:pre-wrap;color:var(--dsw-alias-label-primary);font-size:13px;line-height:21px}
.dcs-message{flex:1;min-height:0;margin:0;padding:32px 20px;color:var(--dsw-alias-label-secondary);font-size:13px;text-align:center}
.dcs-message[data-error]{color:var(--dsw-alias-state-error-primary)}
.dcs-message .dcs-button{margin-top:12px}
.dcs-empty{margin:0;padding:28px 10px;color:var(--dsw-alias-label-secondary);font-size:13px;text-align:center}
.dcs-empty p{margin:0}.dcs-empty .dcs-button{margin-top:12px}
.dcs-foot{flex:none;display:flex;flex-direction:column;gap:2px;padding:10px 20px 12px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcs-foot p{margin:0}
.dcs-foot .dcs-hint{color:var(--dsw-alias-label-tertiary)}
.dcs-feedback{overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}

.dcs-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.dcs-feedback[data-error]{color:var(--dsw-alias-state-error-primary)}
@media(max-width:720px){.dcs-main{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto}.dcs-list-pane{border-right:0}.dcs-detail{max-height:44dvh;border-top:1px solid var(--dsw-alias-border-l1);padding:14px 12px 16px}.dcs-head{padding:14px 12px 10px}.dcs-toolbar{padding:0 12px 10px}.dcs-banner{padding:8px 12px}.dcs-foot{padding:10px 12px}.dcs-foot .dcs-hint{display:none}}
`

    const svg = (children, props) => h('svg', { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }, ...children)
    const SheetIcon = () => svg([h('rect', { key: 'r', x: 3.5, y: 2.5, width: 13, height: 15, rx: 2 }), h('path', { key: 'p', d: 'M7 6.5h6M7 10h6M7 13.5h3' })])
    const SearchIcon = () => svg([h('circle', { key: 'c', cx: 8.5, cy: 8.5, r: 5 }), h('path', { key: 'p', d: 'm12.5 12.5 4 4' })])
    const CloseIcon = () => svg([h('path', { key: 'p', d: 'm5 5 10 10M15 5 5 15' })])
    const RefreshIcon = () => svg([h('path', { key: 'p', d: 'M16 10a6 6 0 1 1-1.8-4.3M16 3.5v3h-3' })])
    const WriteIcon = () => svg([h('rect', { key: 'r', x: 3, y: 3, width: 14, height: 14, rx: 2 }), h('path', { key: 'p', d: 'M6 10h8m-3-3 3 3-3 3' })])
    const PinIcon = ({ on }) => svg([
      h('path', { key: 'b', d: 'M7.5 3h5l-.9 4.4 2.9 2.6v1.5h-9V10l2.9-2.6z', fill: on ? 'currentColor' : 'none' }),
      h('path', { key: 's', d: 'M10 11.5V17' }),
    ])

    // Accept only the agreed state shape; anything else is reported, never guessed.
    function normalizeState(body) {
      const pinned = body?.pinned
      const counts = body?.counts
      if (!Array.isArray(pinned) || pinned.some(name => typeof name !== 'string')) return null
      if (!counts || typeof counts !== 'object' || Array.isArray(counts)) return null
      const entries = Object.entries(counts)
      if (entries.some(([, value]) => !Number.isSafeInteger(value) || value < 0)) return null
      const descriptions = body.descriptions
      const descriptionsAvailable = body.descriptionsAvailable === true
        && descriptions !== null && typeof descriptions === 'object' && !Array.isArray(descriptions)
        && Object.values(descriptions).every(value => typeof value === 'string' && value.trim())
      return { pinned: [...new Set(pinned)], counts: Object.fromEntries(entries), descriptions: descriptionsAvailable ? descriptions : {}, descriptionsAvailable }
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

    /** @typedef {{name: string, description: string, whenToUse?: string, modelInvocable: boolean}} SkillInfo */
    /** @typedef {{pinned: string[], counts: Record<string, number>, descriptions: Record<string, string>}} SharedData */
    /** @typedef {SkillInfo & {summary: string | null, loads: number | null, pinned: boolean}} SkillRow */
    /** @typedef {{query: string, sort: 'usage' | 'name', showAutomatic: boolean}} ViewOptions */
    /** @typedef {{rows: SkillRow[], groups: {key: 'groupPinned' | 'groupOther' | 'groupAll', rows: SkillRow[]}[], effectiveSort: 'usage' | 'name', hiddenAutomatic: number, emptyKey: 'empty' | 'emptyManual' | 'noMatches' | null}} SkillView */

    /**
     * Owns all read-side joins and display policies, without I/O or input mutation.
     * A null shared snapshot means unknown loads, not zero; dictionaries stay private.
     * @param {SkillInfo[]} skills
     * @param {SharedData | null} shared
     * @param {ViewOptions} options
     * @returns {SkillView}
     */
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
      /** @type {SkillView['groups']} */
      const groups = []
      if (pinnedRows.length > 0) groups.push({ key: 'groupPinned', rows: pinnedRows })
      if (otherRows.length > 0) groups.push({ key: pinnedRows.length > 0 ? 'groupOther' : 'groupAll', rows: otherRows })
      const emptyKey = rows.length > 0 ? null
        : skills.length === 0 ? 'empty'
          : !showAutomatic && scoped.length === 0 ? 'emptyManual' : 'noMatches'
      return { rows, groups, effectiveSort, hiddenAutomatic: skills.length - scoped.length, emptyKey }
    }

    function Sheet({ sessionId, listSkills, inputActions, t, onDismiss }) {
      const dialog = React.useRef(null)
      const search = React.useRef(null)
      const ops = React.useRef(new Set())
      // Locale lookups may change identity between renders; fetch effects must not re-run for that.
      const tRef = React.useRef(t)
      tRef.current = t
      const backdropPress = React.useRef(false)
      const ids = { title: React.useId(), intro: React.useId(), detail: React.useId(), loads: React.useId(), filter: React.useId() }
      const [query, setQuery] = React.useState('')
      const [showAutomatic, setShowAutomatic] = React.useState(false)
      const [sort, setSort] = React.useState('usage')
      const [selected, setSelected] = React.useState(null)
      const [revision, setRevision] = React.useState(0)
      const [usageRevision, setUsageRevision] = React.useState(0)
      const [catalog, setCatalog] = React.useState({ phase: 'loading', skills: [] })
      const [usage, setUsage] = React.useState({ phase: 'loading', data: null, retry: false })
      const [saving, setSaving] = React.useState(null)
      const [feedback, setFeedback] = React.useState(null)

      // Layout effect: close() runs before the portal node leaves the DOM, so the browser restores focus.
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

      // Skills: fetched on each opening and explicit refresh; no cross-session cache.
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

      // Shared pins and counts: fetched on opening, refresh and retry only.
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
          // A zero-length prefix span keeps existing text, selection content and chips.
          // Never rebuild the draft with setDraft or submit it on the user's behalf.
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

      // No optimistic update: the list changes only when the Host confirms the new state.
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

      // A pinned row moves to another group and remounts; keep keyboard focus on its pin button.
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
        // Enter or Escape that confirms an IME candidate must not insert or clear.
        if (event.nativeEvent.isComposing || event.keyCode === 229) return
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          focusRow(current ? shown.indexOf(current) : 0)
        } else if (event.key === 'Enter' && current) {
          event.preventDefault()
          write(current.name)
        } else if (event.key === 'Escape' && query) {
          // First Escape clears the search; the next one closes the dialog.
          event.preventDefault()
          setQuery('')
        }
      }
      const onRowKey = (event, index) => {
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
            onClick: () => setSelected(skill.name),
            onFocus: () => setSelected(skill.name),
            onKeyDown: event => onRowKey(event, shown.indexOf(skill)),
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
        if (!current) return h('section', { id: ids.detail, className: 'dcs-detail', 'aria-label': t('details') }, h('p', { className: 'dcs-empty' }, t('selectHint')))
        const count = current.loads
        return h('section', { id: ids.detail, className: 'dcs-detail', 'aria-labelledby': `${ids.detail}-name` },
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
        body = h('div', { className: 'dcs-main' },
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
        title: key === 'usage' && !usageReady ? t('pinUnavailable') : t('loadsHint'),
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
            onChange: event => setQuery(event.target.value),
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

    function Trigger(props) {
      const [open, setOpen] = React.useState(false)
      return h(React.Fragment, null,
        h('style', null, CSS),
        h('button', {
          type: 'button', className: 'dcs-trigger', title: props.t('title'), 'aria-haspopup': 'dialog',
          onClick: () => setOpen(true),
        }, h(SheetIcon), props.t('title')),
        open ? h(Sheet, { ...props, key: props.sessionId, onDismiss: () => setOpen(false) }) : null)
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.skills'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dict), `cheat-sheet: ${lang}`)
        }
        const listSkills = (sessionId, signal) => ctx.remote.skills.list({ sessionId }, signal)
        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left', id: 'cheat-sheet', order: 80, locale: NS,
          inject: () => ({ listSkills }),
        }, Trigger))
      },
    }
  },
})
