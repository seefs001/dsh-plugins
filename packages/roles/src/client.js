window.__ModuleLoader__.load({
  id: 'dsh-roles',
  factory(require) {
    const React = require('react')
    const {
      Button, DisclosureRow, ReferenceChip, TextShimmer,
      IconCheckOutlineRegular, IconChevronRightOutlineRegular,
      IconInspectOutlineRegular,
      IconUsersOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'roles'
    const KEY = 'dsh-roles'
    const PANEL_ID = 'roles'
    const ROLE_REF_SOURCE = 'roles-reference'
    const HASH_HOST_ID = 'roles'
    const roleLabel = role => `${role.icon ? `${role.icon} ` : ''}${role.name}`

    function sanitizeRoleName(name) {
      return String(name ?? '').replace(/[()\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
    }

    function buildRoleRef(role) {
      const clean = sanitizeRoleName(role.name)
      if (!clean) return role.id
      const params = new URLSearchParams()
      params.set('name', clean)
      return `${role.id}?${params.toString()}`
    }

    function parseRoleRef(ref) {
      const q = ref.indexOf('?')
      const id = q < 0 ? ref : ref.slice(0, q)
      const params = new URLSearchParams(q < 0 ? '' : ref.slice(q + 1))
      const name = params.get('name') ?? undefined
      return { id, ...(name ? { name } : {}) }
    }

    function serializeRoleRef(ref, roles) {
      const r = parseRoleRef(ref)
      const live = roles?.find(item => item.id === r.id)
      const clean = sanitizeRoleName(live?.name ?? r.name)
      return clean ? `#role(id=${r.id}, name=${clean})` : `#role(id=${r.id})`
    }

    const ROLE_SENT = /#role\(id=([a-z0-9][a-z0-9_-]{0,63})(?:,\s*name=([^()\r\n]+?))?\)/gu
    const roleSentRule = {
      id: 'role',
      order: 31,
      match(text, from) {
        ROLE_SENT.lastIndex = from
        const m = ROLE_SENT.exec(text)
        if (!m) return undefined
        const data = { id: m[1] }
        if (m[2] !== undefined) data.name = m[2].trim()
        return { id: 'role', start: m.index, end: m.index + m[0].length, data }
      },
    }

    function roleChipLabel(data, roles) {
      const role = roles?.find(r => r.id === data.id)
      if (role) return `#${roleLabel(role)}`
      return `#${data.name || data.id}`
    }

    function matchRoles(roles, query) {
      const parts = query.toLowerCase().split(/[\s/]+/).filter(Boolean)
      if (parts.length === 0) return roles
      return roles.filter(r => {
        const hay = `${r.name} ${r.id} ${r.description ?? ''}`.toLowerCase()
        return parts.every(p => hay.includes(p))
      })
    }

    function detectHash(card) {
      const sel = window.getSelection()
      if (!card || !sel || sel.rangeCount === 0 || !sel.isCollapsed || sel.anchorOffset <= 0) return null
      const node = sel.anchorNode
      if (!node || node.nodeType !== 3) return null
      const text = node.textContent ?? ''
      if (!text.includes('#') || !card.contains(node)) return null
      const m = /(^|\s)#([^\s#]*)$/u.exec(text.slice(0, sel.anchorOffset))
      return m ? { query: m[2], length: m[2].length + 1 } : null
    }

    function hashMenuBus() {
      if (typeof window === 'undefined') return null
      if (!window.__DSH_HASH_MENU__) {
        const sources = new Map()
        const listeners = new Set()
        const hosts = new Set()
        let rev = 0
        const emit = () => { rev++; listeners.forEach(fn => fn()) }
        window.__DSH_HASH_MENU__ = {
          register(source) {
            sources.set(source.id, source)
            emit()
            return () => {
              if (sources.get(source.id) === source) {
                sources.delete(source.id)
                emit()
              }
            }
          },
          registerHost(hostId) {
            hosts.add(hostId)
            emit()
            return () => {
              hosts.delete(hostId)
              emit()
            }
          },
          isActiveHost(hostId) {
            return hosts.values().next().value === hostId
          },
          listSources() {
            return [...sources.values()].toSorted((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id))
          },
          subscribe(fn) {
            listeners.add(fn)
            return () => listeners.delete(fn)
          },
          getSnapshot() { return rev },
        }
      }
      return window.__DSH_HASH_MENU__
    }

    const Bolt = () => h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': true },
      h('path', { d: 'M9.2 1.5 3.5 9h4l-.8 5.5L12.5 7h-4z', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }))

    const en = {
      panel: 'Roles',
      role: 'Role',
      none: 'None',
      noneHint: 'Use default agent behavior.',
      manage: 'Manage roles…',
      switchFailed: 'Could not switch role: {message}',
      chipTitle: 'Session role: {name}. Click to edit.',
      intro: 'Pair a system prompt with reusable skills and switch roles per session from the model menu.',
      configHint: 'Manage roles from the Roles panel in the sidebar.',
      openManager: 'Open Roles',
      newRole: 'New role',
      search: 'Search roles…',
      filterAll: 'All',
      filterActive: 'In use',
      filterBuiltin: 'Built-in',
      filterCustom: 'Custom',
      resetFilters: 'Reset filters',
      noMatches: 'No matching roles.',
      empty: 'No roles yet. Create one or restore the built-in roles.',
      restore: 'Restore {n} built-in',
      restored: 'Restored {n} built-in roles.',
      builtin: 'Built-in',
      modified: 'Edited',
      unsavedNew: 'Unsaved draft',
      unsaved: 'Unsaved changes',
      skillsCount: '{n} skills',
      usedBy: 'Used by {n} sessions',
      unused: 'Unused',
      namePlaceholder: 'Role name',
      descriptionPlaceholder: 'Short summary shown in lists and menus',
      pickIcon: 'Choose icon',
      iconCustom: 'Or type an emoji',
      tabPrompt: 'Prompt',
      tabSkills: 'Skills',
      tabPreview: 'Preview',
      promptHint: 'Role instructions in Markdown.',
      promptPlaceholder: 'You are acting as …\n\n## Working method\n1. \n\n## Output format\n- ',
      skillsHint: 'Loaded on demand through the skill tool in sessions using this role. Local skills with the same name take precedence.',
      addSkill: 'Add skill',
      localSkills: 'Local skill references',
      localSelectedEmpty: 'No local skills referenced yet.',
      localBrowse: 'Browse local catalog',
      localHide: 'Hide catalog',
      localHint: 'Reference local skills by name without copying files. Other session skills stay available.',
      localCwd: 'Project directory (optional)',
      localLoad: 'Load catalog',
      localSearch: 'Filter local skills…',
      localEmpty: 'No local skills found.',
      localMissing: 'Not found in current catalog',
      localPartial: 'Discovery is incomplete; some skills may be missing.',
      localLimit: 'Up to 20 local references per role.',
      removeRef: 'Remove {name}',
      inlineSkills: 'Role-owned skills',
      noSkills: 'No role-owned skills yet.',
      untitledSkill: 'untitled-skill',
      skillName: 'Name',
      skillNameHint: 'kebab-case, e.g. review-checklist',
      skillDescription: 'Description',
      skillDescriptionHint: 'One line used to decide when to load this skill.',
      skillWhen: 'When to use',
      skillWhenHint: 'Optional routing guidance.',
      skillContent: 'Content',
      skillContentHint: 'Instructions in Markdown. Role skills have no files on disk.',
      removeSkill: 'Remove skill',
      previewHint: 'Injected into the system prompt right after the deployment persona, including unsaved edits.',
      previewSkills: 'Skill catalog entries',
      previewLoading: 'Rendering…',
      previewInvalid: 'Fix highlighted fields to preview.',
      copy: 'Copy',
      copied: 'Copied',
      wrap: 'Wrap',
      unwrap: 'Unwrap',
      save: 'Save changes',
      create: 'Create role',
      saving: 'Saving…',
      saved: 'Saved.',
      discard: 'Discard',
      discardNew: 'Discard draft',
      saveShortcut: '⌘S / Ctrl+S',
      duplicate: 'Duplicate',
      more: 'More actions',
      moveUp: 'Move up',
      moveDown: 'Move down',
      reset: 'Reset to built-in',
      resetConfirm: 'Reset “{name}” to its built-in content? Your edits will be lost.',
      cancel: 'Cancel',
      delete: 'Delete',
      deleteConfirm: 'Delete role “{name}”?',
      deleteConfirmUsed: 'Delete role “{name}”? {n} sessions using it will switch to None.',
      conflict: 'This role changed elsewhere after you started editing. Saving overwrites it.',
      loadLatest: 'Load latest',
      failed: 'Failed: {message}',
      loadFailed: 'Could not load roles: {message}',
      retry: 'Retry',
      loading: 'Loading roles…',
      chars: '{n} / {max}',
      errName: 'Enter a name.',
      errPrompt: 'Enter a prompt.',
      errTooLong: 'At most {max} characters.',
      errSkillName: 'Use kebab-case (lowercase letters, digits, single hyphens).',
      errSkillDup: 'Duplicate skill name in this role.',
      errSkillDescription: 'Enter a description.',
      errSkillContent: 'Enter content.',
      errSkills: 'Fix invalid skills.',
      copySuffix: 'copy',
      newRoleName: 'New role',
      roleSections: 'Role editor sections',
      tvStopped: 'Stopped',
      tvInspect: 'Inspect',
      tvInput: 'IN',
      tvOutput: 'OUT',
      tvCount: '{n} roles',
      hashTitle: 'Reference a role',
      hashAria: 'Roles',
      fast: 'Fast',
      dismiss: 'Dismiss',
    }
    const zh = {
      panel: '角色',
      role: '角色',
      none: '无',
      noneHint: '保持默认行为。',
      manage: '管理角色…',
      switchFailed: '切换角色失败：{message}',
      chipTitle: '当前角色：{name}，点击编辑。',
      intro: '给角色配好系统提示词与专属技能，在输入框的模型菜单里按会话切换。',
      configHint: '请在左侧栏的「角色」面板管理角色。',
      openManager: '打开角色管理',
      newRole: '新建角色',
      search: '搜索角色…',
      filterAll: '全部',
      filterActive: '使用中',
      filterBuiltin: '内置',
      filterCustom: '自定义',
      resetFilters: '重置筛选',
      noMatches: '没有匹配的角色。',
      empty: '还没有角色。新建一个，或恢复内置角色。',
      restore: '恢复 {n} 个内置角色',
      restored: '已恢复 {n} 个内置角色。',
      builtin: '内置',
      modified: '已修改',
      unsavedNew: '未保存草稿',
      unsaved: '有未保存修改',
      skillsCount: '{n} 个技能',
      usedBy: '{n} 个会话使用中',
      unused: '未使用',
      namePlaceholder: '角色名称',
      descriptionPlaceholder: '一句话简介（展示在列表与模型菜单中）',
      pickIcon: '选择图标',
      iconCustom: '或输入 emoji',
      tabPrompt: '提示词',
      tabSkills: '技能',
      tabPreview: '预览',
      promptHint: '支持 Markdown。',
      promptPlaceholder: '你现在担任……\n\n## 工作方式\n1. \n\n## 输出格式\n- ',
      skillsHint: '仅在使用该角色的会话中按需加载；同名本地技能优先。',
      addSkill: '添加技能',
      localSkills: '引用本地技能',
      localSelectedEmpty: '尚未引用本地技能。',
      localBrowse: '浏览本地目录',
      localHide: '收起目录',
      localHint: '按名称引用本地技能，不复制文件，也不隐藏其他会话技能。',
      localCwd: '项目目录（可选）',
      localLoad: '读取目录',
      localSearch: '筛选本地技能…',
      localEmpty: '未发现本地技能。',
      localMissing: '当前目录未找到',
      localPartial: '扫描未完成，部分技能可能尚未列出。',
      localLimit: '每个角色最多引用 20 个本地技能。',
      removeRef: '移除 {name}',
      inlineSkills: '角色自带技能',
      noSkills: '暂无角色自带技能。',
      untitledSkill: '未命名技能',
      skillName: '名称',
      skillNameHint: 'kebab-case，如 review-checklist',
      skillDescription: '描述',
      skillDescriptionHint: '一句话说明，用于决定何时加载。',
      skillWhen: '何时使用',
      skillWhenHint: '可选触发条件。',
      skillContent: '内容',
      skillContentHint: 'Markdown 说明；角色自带技能无本地文件，勿引用相对路径。',
      removeSkill: '删除技能',
      previewHint: '紧跟部署人设写入系统提示词，包含未保存的修改。',
      previewSkills: '技能目录条目',
      previewLoading: '生成中…',
      previewInvalid: '修正标出字段后可预览。',
      copy: '复制',
      copied: '已复制',
      wrap: '换行',
      unwrap: '不换行',
      save: '保存更改',
      create: '创建角色',
      saving: '保存中…',
      saved: '已保存。',
      discard: '放弃修改',
      discardNew: '放弃草稿',
      saveShortcut: '⌘S / Ctrl+S',
      duplicate: '复制',
      more: '更多操作',
      moveUp: '上移',
      moveDown: '下移',
      reset: '恢复内置内容',
      resetConfirm: '将“{name}”恢复为内置内容？当前修改会丢失。',
      cancel: '取消',
      delete: '删除',
      deleteConfirm: '删除角色“{name}”？',
      deleteConfirmUsed: '删除角色“{name}”？正在使用它的 {n} 个会话将回到无角色。',
      conflict: '该角色在别处已被更新，保存会覆盖新内容。',
      loadLatest: '载入最新',
      failed: '失败：{message}',
      loadFailed: '加载角色失败：{message}',
      retry: '重试',
      loading: '加载角色中…',
      chars: '{n} / {max}',
      errName: '请填写名称。',
      errPrompt: '请填写提示词。',
      errTooLong: '最多 {max} 字。',
      errSkillName: '请使用 kebab-case（小写字母、数字和单个连字符）。',
      errSkillDup: '当前角色已有同名技能。',
      errSkillDescription: '请填写描述。',
      errSkillContent: '请填写内容。',
      errSkills: '请先修正技能字段。',
      copySuffix: '副本',
      newRoleName: '新角色',
      roleSections: '角色编辑分区',
      tvStopped: '已中止',
      tvInspect: '查看',
      tvInput: '输入',
      tvOutput: '输出',
      tvCount: '{n} 个角色',
      hashTitle: '引用角色',
      hashAria: '角色',
      fast: '快速',
      dismiss: '关闭',
    }

    const ROLES_SYNC_CHANNEL = 'dsh-roles-sync'
    const ROLES_REFRESH_THROTTLE_MS = 30_000
    const broadcastRoles = data => {
      try { store.channel?.postMessage({ type: 'state', data }) } catch {}
    }

    async function op(body) {
      const r = await fetch('roles/op', {
        signal: AbortSignal.timeout(20_000),
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
      })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      if (data?.roles && body.action !== 'preview') {
        store.set(readyState(data))
        store.lastFetchedAt = Date.now()
        broadcastRoles(data)
      }
      return data
    }

    const readyState = data => ({
      status: 'ready', roles: data.roles ?? [], sessions: data.sessions ?? {}, error: null,
      builtinMissing: data.builtinMissing ?? 0, builtinModified: data.builtinModified ?? [], limits: data.limits ?? store.state.limits,
    })
    const store = {
      state: {
        status: 'loading', roles: [], sessions: {}, error: null, builtinMissing: 0, builtinModified: [],
        limits: { name: 60, icon: 8, description: 300, prompt: 40_000, skillDescription: 500, whenToUse: 500, skillContent: 60_000, roles: 100, skills: 20 },
      },
      listeners: new Set(),
      inflight: null,
      lastFetchedAt: 0,
      channel: null,
      cleanup: null,
      get: () => store.state,
      set(patch) { store.state = { ...store.state, ...patch }; store.listeners.forEach(fn => fn()) },
      subscribe(fn) {
        store.listeners.add(fn)
        if (store.listeners.size === 1) store.open()
        return () => {
          store.listeners.delete(fn)
          if (store.listeners.size === 0) store.close()
        }
      },
      fetchState(force = false) {
        if (!force && store.state.status === 'ready' && Date.now() - store.lastFetchedAt < ROLES_REFRESH_THROTTLE_MS) return
        if (store.inflight) return
        const req = fetch('roles/state', { headers: { accept: 'application/json' }, cache: 'no-store' })
          .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(new Error(d?.message ?? `HTTP ${r.status}`)), () => Promise.reject(new Error(`HTTP ${r.status}`))))
          .then(d => {
            if (d && Array.isArray(d.roles)) {
              store.lastFetchedAt = Date.now()
              store.set(readyState(d))
            }
          })
          .catch(error => {
            if (store.state.status === 'loading') store.set({ status: 'error', error: error.message })
          })
          .finally(() => { if (store.inflight === req) store.inflight = null })
        store.inflight = req
      },
      open() {
        if (store.cleanup) return
        const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(ROLES_SYNC_CHANNEL) : null
        store.channel = channel
        const onWake = () => {
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
          store.fetchState(false)
        }
        const onMessage = event => {
          const data = event?.data?.data
          if (data && Array.isArray(data.roles)) {
            store.lastFetchedAt = Date.now()
            store.set(readyState(data))
          }
        }
        window.addEventListener('focus', onWake)
        document.addEventListener('visibilitychange', onWake)
        channel?.addEventListener('message', onMessage)
        store.cleanup = () => {
          window.removeEventListener('focus', onWake)
          document.removeEventListener('visibilitychange', onWake)
          channel?.removeEventListener('message', onMessage)
          channel?.close()
          if (store.channel === channel) store.channel = null
        }
        store.fetchState(store.state.status !== 'ready')
      },
      close() {
        store.cleanup?.()
        store.cleanup = null
      },
      reload() {
        store.lastFetchedAt = 0
        store.set({ status: 'loading', error: null })
        if (store.listeners.size > 0) store.fetchState(true)
      },
    }
    const useRoles = () => React.useSyncExternalStore(store.subscribe, store.get)

    const MENU_CSS = `
.rl-cell{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:auto;min-width:100%;height:34px;padding:0 8px;border:none;border-radius:var(--dsw-radius-md,10px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;text-align:left;cursor:pointer}
.rl-cell:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px;background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.rl-cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.rl-cell:disabled{opacity:.5;cursor:default}
.rl-cell-label{flex:0 0 auto;white-space:nowrap}
.rl-cell-value{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;color:var(--dsw-alias-label-tertiary)}
.rl-chev{flex:0 0 auto;color:var(--dsw-alias-menu-icon,var(--dsw-alias-label-tertiary));transition:transform .15s}
.rl-chev[data-open=true]{transform:rotate(90deg)}
.rl-list{display:flex;flex-direction:column;max-height:240px;overflow-y:auto;margin:0 0 2px 0;padding-left:8px}
.rl-opt-icon{flex:0 0 18px;text-align:center}
.rl-opt-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rl-check{flex:0 0 auto;color:var(--dsw-alias-label-primary)}
.rl-manage{color:var(--dsw-alias-label-secondary)}
.rl-chip{display:inline-flex;align-items:center;gap:5px;max-width:200px;height:28px;padding:0 8px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;font-weight:500;white-space:nowrap;cursor:pointer;transition:background-color .15s,color .15s}
@media (hover:hover){.rl-chip:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}}
.rl-chip:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.rl-chip b{font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis}
.mh-anchor{display:none}
.mh-menu{position:absolute;left:0;right:0;bottom:calc(100% + 4px);z-index:100;box-sizing:border-box;display:flex;flex-direction:column;max-height:min(320px,45dvh);overflow-y:auto;overscroll-behavior:contain;padding:4px;border-radius:var(--dsw-radius-md,12px);background:var(--dsw-specific-menu);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);backdrop-filter:var(--dsw-menu-backdrop-filter);box-shadow:var(--dsw-elevation-prominent);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1)}
@media (max-width:768px),(pointer:coarse){.mh-menu{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base));backdrop-filter:none;-webkit-backdrop-filter:none}}
.mh-title{padding:5px 8px 2px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary)}
.mh-title:not(:first-child){margin-top:4px;padding-top:7px;border-top:.5px solid var(--dsw-alias-border-l1)}
.mh-item{display:flex;align-items:center;gap:6px;width:100%;min-height:34px;padding:6px 8px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;text-align:left;cursor:pointer}
.mh-item[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover)}
.mh-hash{flex:none;width:18px;text-align:center;color:var(--dsw-alias-menu-icon)}
.mh-name{flex:none;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mh-meta{flex:none;display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.mh-bolt{display:inline-flex;color:var(--dsw-alias-state-warn-primary)}
.mh-desc{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;font-size:12px;color:var(--dsw-alias-label-tertiary)}
[data-composer-card] span[title^="#"]>span[aria-hidden="true"]{display:none}
.rlc{display:flex;flex-direction:column;align-items:flex-start;gap:10px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.rlc p{margin:0}
`

    const TV_CSS = `
.rl-tv{display:flex;flex-direction:column}
.rl-tv-row{min-width:0}
.rl-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.rl-tv-summary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.rl-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.rl-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.rl-tv-body{display:flex;flex-direction:column;min-width:0}
.rl-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.rl-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.rl-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.rl-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.rl-tv-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.rl-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.rl-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.rl-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.rl-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.rl-tv-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.rl-tv:hover .rl-tv-inspect{opacity:1}.rl-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.rl-tv-inspect{opacity:1}}
`

    const svg = (size, children) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    }, children)
    const IconRoles = ({ size = 16 }) => svg(size, [
      h('path', { key: 'a', d: 'M2.5 3.5h6.5v4.2a3.25 3.25 0 0 1-6.5 0z' }),
      h('path', { key: 'b', d: 'M7 7.3h6.5v3.9a3.25 3.25 0 0 1-6.5 0' }),
      h('path', { key: 'c', d: 'M4.4 8.6q1.35 1 2.7 0M9 12.2q1.35-1 2.7 0' }),
    ])

    return {
      inject: ['slots', 'locale', 'layout', 'inputTriggers', 'sessions', 'uiConversation'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'roles: dictionaries')
        const styleRef = { page: null, tv: null }
        const cleanups = []
        const ensureTvStyles = () => {
          if (styleRef.tv || typeof document === 'undefined' || !document.head) return
          styleRef.tv = document.createElement('style')
          styleRef.tv.textContent = TV_CSS
          document.head.append(styleRef.tv)
        }
        ctx.effect(() => {
          if (typeof document === 'undefined') return undefined
          const style = document.createElement('style')
          style.textContent = MENU_CSS
          document.head.append(style)
          return () => {
            style.remove()
            styleRef.tv?.remove()
            styleRef.tv = null
            styleRef.page?.remove()
            styleRef.page = null
            while (cleanups.length) cleanups.pop()?.()
          }
        }, 'roles: styles')
        const t = ctx.locale.bind(NS)
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())

        // external: DSH attaches reference codecs through inputTriggers.registerSource('@')
        ctx.effect(() => ctx.inputTriggers.registerSource({
          trigger: '@', name: ROLE_REF_SOURCE, showGroupTitle: false, order: 1001,
          candidates: async () => [],
          onPick: () => undefined,
          codec: {
            clipboardText: ref => `#${parseRoleRef(ref).id}`,
            serialize: ref => Promise.resolve(serializeRoleRef(ref, store.get().roles)),
          },
        }), 'roles: reference codec source')

        ctx.uiConversation.userText.register(roleSentRule)
        function SentRoleReference({ node, raw }) {
          const { roles } = useRoles()
          return h(ReferenceChip, { label: roleChipLabel(node.data, roles), title: raw })
        }
        ctx.slots.inject('conversation.user.text.node', () => ctx.slots.register({
          name: 'conversation.user.text.node', key: 'role', priority: 100,
        }, SentRoleReference))

        const bus = hashMenuBus()
        if (bus) {
          ctx.effect(() => bus.registerHost(HASH_HOST_ID), 'roles: hash menu host')
          ctx.effect(() => bus.register({
            id: 'roles',
            order: 10,
            title: () => t('hashTitle'),
            onOpen() {
              if (store.get().status === 'error') store.reload()
            },
            subscribe(_sessionId, listener) {
              const offStore = store.subscribe(listener)
              const offLocale = ctx.locale.subscribe(listener)
              return () => { offStore(); offLocale() }
            },
            getItems(_sessionId, query) {
              return matchRoles(store.get().roles, query).map(role => ({
                key: `role:${role.id}`,
                prefix: role.icon || '#',
                name: role.name,
                desc: role.description || role.id,
                raw: role,
              }))
            },
            pick(role, { sessionId, span, inputActions }) {
              const ref = buildRoleRef(role)
              const label = `#${roleLabel(role)}`
              const reference = { source: ROLE_REF_SOURCE, ref, label, clipboardText: `#${role.id}` }
              const actx = ctx.sessions.scope(sessionId)
              const ok = actx?.bail(actx, 'slash/input-insert-reference', { reference, span }) === true
              if (!ok) inputActions.insertText(`${serializeRoleRef(ref, store.get().roles)} `, span)
            },
          }), 'roles: hash menu source')
        }

        function HashMenuBody({ sessionId, useInput, inputActions, bus: activeBus, busRev }) {
          const localeSnap = useLocale()
          const listId = React.useId()
          const draftRev = useInput(s => s.draftRev)
          const phase = useInput(s => s.phase)
          const anchorRef = React.useRef(null)
          const cardRef = React.useRef(null)
          const frameRef = React.useRef(0)
          const [hit, setHit] = React.useState(null)
          const openRef = React.useRef(false)
          openRef.current = hit !== null
          const [index, setIndex] = React.useState(0)
          const [sourceTick, setSourceTick] = React.useState(0)
          const dismissed = React.useRef(null)

          const card = React.useCallback(() => {
            if (cardRef.current?.isConnected) return cardRef.current
            const next = anchorRef.current?.closest('[data-composer-card]') ?? null
            cardRef.current = next
            return next
          }, [])
          React.useLayoutEffect(() => {
            cardRef.current = anchorRef.current?.closest('[data-composer-card]') ?? null
          }, [])
          const recompute = React.useCallback(() => {
            frameRef.current = 0
            if (phase !== 'plain' && phase !== 'claimed') { setHit(null); return }
            const found = detectHash(card())
            if (!found) { dismissed.current = null; setHit(null); return }
            if (dismissed.current === found.query) { setHit(null); return }
            setHit(prev => prev && prev.query === found.query && prev.length === found.length ? prev : found)
          }, [phase, card])
          const scheduleRecompute = React.useCallback(() => {
            if (frameRef.current) return
            frameRef.current = requestAnimationFrame(recompute)
          }, [recompute])
          React.useEffect(() => {
            scheduleRecompute()
          }, [scheduleRecompute, draftRev])
          React.useEffect(() => {
            const onSelectionChange = () => {
              if (!openRef.current) {
                const c = card()
                const active = typeof document !== 'undefined' ? document.activeElement : null
                if (!c || !active || !c.contains(active)) return
              }
              scheduleRecompute()
            }
            document.addEventListener('selectionchange', onSelectionChange)
            return () => {
              document.removeEventListener('selectionchange', onSelectionChange)
              if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = 0 }
            }
          }, [card, scheduleRecompute])

          const open = hit !== null
          const sources = React.useMemo(() => activeBus.listSources(), [activeBus, busRev])
          React.useEffect(() => {
            if (!open) return undefined
            const bump = () => setSourceTick(n => n + 1)
            const offs = sources.map(src => {
              src.onOpen?.(sessionId)
              return src.subscribe?.(sessionId, bump)
            }).filter(Boolean)
            return () => { for (const off of offs) off() }
          }, [open, sources, sessionId])

          const { sections, flat } = React.useMemo(() => {
            if (!open) return { sections: [], flat: [] }
            const nextSections = []
            const nextFlat = []
            for (const source of sources) {
              const items = source.getItems(sessionId, hit.query)
              if (!items.length) continue
              const mapped = items.map(item => {
                const entry = { source, item, flatIndex: nextFlat.length }
                nextFlat.push(entry)
                return entry
              })
              nextSections.push({ id: source.id, title: source.title(), items: mapped })
            }
            return { sections: nextSections, flat: nextFlat }
          }, [open, sources, sessionId, hit, sourceTick, localeSnap])

          React.useEffect(() => { setIndex(0) }, [hit?.query])
          const visible = open && flat.length > 0
          const activeIndex = visible ? Math.min(index, flat.length - 1) : 0

          const pick = React.useCallback(entry => {
            if (!hit || !entry) return
            const caret = inputActions.captureInsertion()
            const span = { start: caret.end - hit.length, end: caret.end, draftRev: caret.draftRev }
            entry.source.pick(entry.item.raw, { sessionId, span, inputActions })
            setHit(null)
          }, [hit, inputActions, sessionId])

          const dismiss = React.useCallback(() => {
            if (hit) dismissed.current = hit.query
            setHit(null)
          }, [hit])

          React.useEffect(() => {
            if (!visible) return undefined
            const onKey = ev => {
              if (ev.isComposing || ev.keyCode === 229) return
              const c = card()
              if (!c || !(ev.target instanceof Node) || !c.contains(ev.target)) return
              let handled = true
              if (ev.key === 'ArrowDown') setIndex(i => (i + 1) % flat.length)
              else if (ev.key === 'ArrowUp') setIndex(i => (i - 1 + flat.length) % flat.length)
              else if ((ev.key === 'Enter' || ev.key === 'Tab') && !ev.shiftKey) pick(flat[Math.min(index, flat.length - 1)])
              else if (ev.key === 'Escape') dismiss()
              else handled = false
              if (handled) { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation() }
            }
            const onDown = ev => {
              const c = card()
              if (!(ev.target instanceof Node) || c?.contains(ev.target)) return
              dismiss()
            }
            window.addEventListener('keydown', onKey, true)
            document.addEventListener('pointerdown', onDown, true)
            return () => {
              window.removeEventListener('keydown', onKey, true)
              document.removeEventListener('pointerdown', onDown, true)
            }
          }, [visible, flat, index, pick, dismiss])

          React.useEffect(() => {
            if (visible) document.getElementById(`${listId}-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
          }, [visible, activeIndex, listId])

          return h(React.Fragment, null,
            h('span', { ref: anchorRef, className: 'mh-anchor' }),
            visible ? h('div', { className: 'mh-menu', role: 'listbox', 'aria-label': t('hashAria'), 'aria-activedescendant': `${listId}-opt-${activeIndex}` },
              sections.map(sec => h(React.Fragment, { key: sec.id },
                h('div', { className: 'mh-title', role: 'presentation' }, sec.title),
                sec.items.map(entry => {
                  const it = entry.item
                  const i = entry.flatIndex
                  return h('button', {
                    key: it.key, id: `${listId}-opt-${i}`, type: 'button', role: 'option',
                    className: 'mh-item', 'aria-selected': i === activeIndex,
                    onMouseDown: ev => { ev.preventDefault(); pick(entry) },
                    onMouseMove: i === activeIndex ? undefined : () => setIndex(i),
                  },
                  h('span', { className: 'mh-hash', 'aria-hidden': true }, it.prefix ?? '#'),
                  h('span', { className: 'mh-name' }, it.name),
                  it.meta || it.fast ? h('span', { className: 'mh-meta' },
                    it.meta ? h('span', null, it.meta) : null,
                    it.fast ? h('span', { className: 'mh-bolt', role: 'img', 'aria-label': t('fast') }, h(Bolt)) : null) : null,
                  it.desc ? h('span', { className: 'mh-desc' }, it.desc) : null)
                })))) : null)
        }

        function HashMenu(props) {
          const activeBus = hashMenuBus()
          const busRev = React.useSyncExternalStore(
            fn => activeBus ? activeBus.subscribe(fn) : () => {},
            () => activeBus ? activeBus.getSnapshot() : 0)
          if (!activeBus || !activeBus.isActiveHost(HASH_HOST_ID)) return null
          return h(HashMenuBody, { ...props, bus: activeBus, busRev })
        }

        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({
          name: 'conversation.input.overlay', id: 'roles-hash-menu', order: 1001,
          label: () => t('hashTitle'),
          inject: sessionId => ({ sessionId }),
        }, HashMenu))
        const nav = { roleId: null, seq: 0, listeners: new Set() }
        const navStore = {
          subscribe: fn => { nav.listeners.add(fn); return () => nav.listeners.delete(fn) },
          get: () => nav.seq,
        }
        const openManager = (roleId = null) => {
          nav.roleId = roleId
          nav.seq++
          nav.listeners.forEach(fn => fn())
          ctx.layout.selectPanel(PANEL_ID)
        }

        function RoleOption({ sessionId, useSession, locked, dismiss, reportFailure }) {
          useLocale()
          const isChild = useSession(snapshot => snapshot.subagent !== null)
          const { roles, sessions } = useRoles()
          const [open, setOpen] = React.useState(false)
          const [pending, setPending] = React.useState(null)
          if (isChild) return null
          const currentId = sessions[sessionId] ?? null
          const current = roles.find(r => r.id === currentId)
          const select = async roleId => {
            if (roleId === currentId) { setOpen(false); return }
            setPending(roleId ?? '')
            try {
              await op({ action: 'select', sessionId, roleId })
              setOpen(false)
            } catch (error) {
              reportFailure(t('switchFailed', { message: error.message }))
            } finally {
              setPending(null)
            }
          }
          const busy = locked || pending !== null
          return h(React.Fragment, null,
            h('button', {
              type: 'button', role: 'menuitem', className: 'rl-cell', 'aria-expanded': open,
              onClick: () => setOpen(!open),
            },
            h('span', { className: 'rl-cell-label' }, t('role')),
            h('span', { className: 'rl-cell-value' }, current ? roleLabel(current) : t('none')),
            h('span', { className: 'rl-chev', 'data-open': open ? 'true' : 'false' }, h(IconChevronRightOutlineRegular, { size: 12 }))),
            open ? h('div', { className: 'rl-list', role: 'group', 'aria-label': t('role') },
              h('button', {
                type: 'button', role: 'menuitemradio', 'aria-checked': currentId === null, className: 'rl-cell',
                disabled: busy, title: t('noneHint'), onClick: () => select(null),
              },
              h('span', { className: 'rl-opt-icon' }),
              h('span', { className: 'rl-opt-name' }, t('none')),
              currentId === null ? h('span', { className: 'rl-check' }, h(IconCheckOutlineRegular, { size: 14 })) : null),
              roles.map(role => h('button', {
                key: role.id, type: 'button', role: 'menuitemradio', 'aria-checked': role.id === currentId, className: 'rl-cell',
                disabled: busy, title: role.description || role.name, onClick: () => select(role.id),
              },
              h('span', { className: 'rl-opt-icon' }, role.icon),
              h('span', { className: 'rl-opt-name' }, role.name),
              role.id === currentId ? h('span', { className: 'rl-check' }, h(IconCheckOutlineRegular, { size: 14 })) : null)),
              h('button', {
                type: 'button', role: 'menuitem', className: 'rl-cell rl-manage',
                onClick: () => { dismiss(); openManager(currentId) },
              },
              h('span', { className: 'rl-opt-icon' }),
              h('span', { className: 'rl-opt-name' }, t('manage')))) : null)
        }

        ctx.slots.inject('conversation.input.model.options', () => ctx.slots.register({
          name: 'conversation.input.model.options',
          id: 'roles',
          order: 50,
          label: () => t('role'),
          locale: NS,
        }, RoleOption))

        function RoleChip({ sessionId }) {
          useLocale()
          const { roles, sessions } = useRoles()
          const role = roles.find(r => r.id === sessions[sessionId])
          if (!role) return null
          const title = t('chipTitle', { name: role.name })
          return h('button', { type: 'button', className: 'rl-chip', title, 'aria-label': title, onClick: () => openManager(role.id) },
            role.icon ? h('span', { 'aria-hidden': true }, role.icon) : null,
            h('b', null, role.name))
        }

        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'roles.chip',
          order: 90,
          locale: NS,
        }, RoleChip))

        let PageComp = null
        let pagePromise = null
        const pageListeners = new Set()
        const initPage = mod => {
          if (!PageComp) {
            const built = mod.createRolesPage({ ctx, t, useLocale, store, useRoles, op, nav, navStore, styleRef })
            PageComp = built.RolesPage
            if (typeof built.dispose === 'function') cleanups.push(built.dispose)
          }
          return PageComp
        }
        const loadPage = () => {
          if (PageComp) return Promise.resolve(PageComp)
          if (!pagePromise) {
            pagePromise = require.async('./client.page.js').then(mod => {
              const comp = initPage(mod)
              pageListeners.forEach(fn => fn())
              return comp
            }).catch(err => {
              pagePromise = null
              throw err
            })
          }
          return pagePromise
        }
        function RolesPageLoader(props) {
          useLocale()
          const [Comp, setComp] = React.useState(() => PageComp)
          const [failed, setFailed] = React.useState(false)
          React.useEffect(() => {
            if (PageComp) { setComp(() => PageComp); return undefined }
            let alive = true
            const onReady = () => { if (alive && PageComp) setComp(() => PageComp) }
            pageListeners.add(onReady)
            loadPage().then(c => { if (alive) setComp(() => c) }, () => { if (alive) setFailed(true) })
            return () => { alive = false; pageListeners.delete(onReady) }
          }, [])
          if (Comp) return h(Comp, props)
          return h('div', { style: { padding: 28, color: 'var(--dsw-alias-label-tertiary)', fontSize: 13 } },
            failed ? t('errLoad') : t('loading'))
        }
        function LazyRolesPage(props) {
          if (!PageComp && typeof require.syncChunk === 'function') {
            PageComp = initPage(require.syncChunk('./client.page.js'))
          }
          if (PageComp) return typeof require.syncChunk === 'function' ? PageComp(props) : h(PageComp, props)
          return h(RolesPageLoader, props)
        }

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, LazyRolesPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 40, locale: NS, label: () => t('panel'),
        }, IconRoles))

        function ConfigLink() {
          useLocale()
          return h('div', { className: 'rlc' },
            h('p', null, t('configHint')),
            h(Button, { size: 'sm', variant: 'outline', onClick: () => openManager() }, t('openManager')))
        }

        function RolesToolRow({ phase, block, inspect, useDisclosure }) {
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(ensureTvStyles, [])
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
            const target = args.role?.name || args.roleId || payload?.role?.name || payload?.roleId
            if (typeof target === 'string' && target) detail = target
            else if (Array.isArray(payload?.roles)) detail = t('tvCount', { n: payload.roles.length })
          }
          const summary = state === 'error' || state === 'stopped' ? detail : [action, detail].filter(Boolean).join(' · ')
          const inputText = Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ''
          const outputText = payload !== null ? JSON.stringify(payload, null, 2) : text
          const expandable = state !== 'preparing' && Boolean(inputText || outputText)
          const open = expanded && expandable
          return h('div', { className: 'rl-tv', 'data-tool': 'roles', 'data-state': state },
            h(DisclosureRow, {
              rowClassName: 'rl-tv-row',
              icon: h(IconUsersOutlineRegular, { size: 14 }),
              title: t('panel'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: state === 'preparing' || !summary ? null : h(React.Fragment, null,
                h('span', { className: 'rl-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `rl-tv-summary${state === 'error' ? ' is-err' : state === 'stopped' ? ' is-stop' : ''}` },
                  h(TextShimmer, null, summary))),
            },
            open ? h('div', { className: 'rl-tv-body' },
              h('div', { className: 'rl-tv-io' },
                inputText ? h('div', { className: 'rl-tv-io-sec' },
                  h('span', { className: 'rl-tv-io-label' }, t('tvInput')),
                  h('span', { className: 'rl-tv-io-text' }, inputText)) : null,
                inputText && outputText ? h('span', { className: 'rl-tv-io-div', 'aria-hidden': true }) : null,
                outputText ? h('div', { className: 'rl-tv-io-sec' },
                  h('span', { className: 'rl-tv-io-label' }, t('tvOutput')),
                  h('span', { className: 'rl-tv-io-text', 'data-error': state === 'error' || undefined }, outputText)) : null),
              inspect ? h('button', { type: 'button', className: 'rl-tv-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('tvInspect')) : null) : null))
        }

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview', key: 'roles', locale: NS, priority: -10,
        }, RolesToolRow))

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: KEY,
          locale: NS,
        }, ConfigLink))
      },
      _internal: { parseRoleRef, serializeRoleRef, roleSentRule, roleChipLabel, matchRoles },
    }
  },
})