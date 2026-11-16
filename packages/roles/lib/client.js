/**
 * dsh-roles — browser half.
 *
 * - A "Role" row in the composer's model menu (`conversation.input.model.options`)
 *   expands into the role list; picking one switches this session's role.
 * - A chip on the left of the composer shows the active role.
 * - A dedicated sidebar panel edits roles, previews the model-facing prompt,
 *   and manages inline skills plus references to local skills.
 * - The bundle's Plugins page links to that panel.
 *
 * Roles live on the Host (lib/index.js); this half reads `roles/state`,
 * follows `roles/events` (SSE), and sends every change to `roles/op`.
 */
window.__ModuleLoader__.load({
  id: 'dsh-roles',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'roles'
    const KEY = 'dsh-roles'
    const PANEL_ID = 'roles'
    const PACKAGE = 'dsh-roles'

    const en = {
      panel: 'Roles',
      role: 'Role',
      none: 'None',
      noneHint: 'No role: the agent keeps its usual behavior.',
      manage: 'Manage roles…',
      switchFailed: 'Could not switch role: {message}',
      chipTitle: 'Role for this session: {name}. Click to edit it.',
      intro: 'A role is a detailed prompt plus its own skills. Pick one per session from the Role row of the composer\'s model menu; it applies from the next step.',
      configHint: 'Roles are edited on their own page in the sidebar.',
      openManager: 'Open role manager',
      newRole: 'New role',
      search: 'Search roles',
      noMatches: 'No matching roles.',
      empty: 'No roles yet. Create one, or restore the built-in roles.',
      restore: 'Restore {n} built-in roles',
      restored: 'Restored {n} built-in roles.',
      builtin: 'Built-in',
      modified: 'Edited',
      unsavedNew: 'Not saved yet',
      unsaved: 'Unsaved changes',
      skillsCount: '{n} skills',
      usedBy: 'In use by {n} sessions',
      unused: 'Not in use',
      namePlaceholder: 'Role name',
      descriptionPlaceholder: 'One line shown in the role list and menu',
      pickIcon: 'Choose icon',
      iconCustom: 'Or type any emoji',
      tabPrompt: 'Prompt',
      tabSkills: 'Skills',
      tabPreview: 'What the model sees',
      promptHint: 'Responsibilities, working method, output format, and when to load which skill. Markdown.',
      promptPlaceholder: 'You are now acting as …\n\n## Working method\n1. \n\n## Output format\n- ',
      skillsHint: 'Each skill is loaded on demand through the skill tool, only in sessions using this role. A project or user skill with the same name wins.',
      addSkill: 'Add skill',
      localSkills: 'Local skill references',
      localHint: 'Reference existing skills by name, without copying files. They load through the native skill tool, with their resource directories intact. This does not hide other session skills.',
      localCwd: 'Project directory (optional)',
      localLoad: 'Read skill catalog',
      localSearch: 'Search local skills',
      localEmpty: 'No local skills found in this catalog.',
      localMissing: 'Not found in this catalog; check the session’s project directory.',
      localPartial: 'Discovery is incomplete. Missing entries may still exist.',
      localLimit: 'At most 20 local references per role.',
      inlineSkills: 'Role-owned skills',
      noSkills: 'No role-owned skills. Add one for role-specific reference material, or reference a local skill above.',
      untitledSkill: 'untitled-skill',
      skillName: 'Name',
      skillNameHint: 'kebab-case, such as review-checklist',
      skillDescription: 'Description',
      skillDescriptionHint: 'One line the agent uses to decide when to load it.',
      skillWhen: 'When to use',
      skillWhenHint: 'Optional extra routing guidance.',
      skillContent: 'Content',
      skillContentHint: 'Full instructions in Markdown. Role skills have no files, so do not refer to relative paths.',
      removeSkill: 'Remove skill',
      previewHint: 'Added to the system prompt right after the deployment persona. Unsaved edits are included.',
      previewSkills: 'Skill catalog entries',
      previewLoading: 'Rendering…',
      previewInvalid: 'Fix the highlighted fields to see the preview.',
      save: 'Save',
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
      resetConfirm: 'Restore "{name}" to the built-in text? Your edits to it are lost.',
      delete: 'Delete',
      deleteConfirm: 'Delete role "{name}"?',
      deleteConfirmUsed: 'Delete role "{name}"? {n} sessions use it and go back to no role.',
      conflict: 'This role was changed elsewhere after you started editing. Saving overwrites that change.',
      loadLatest: 'Load latest',
      failed: 'Failed: {message}',
      loadFailed: 'Could not load roles: {message}',
      retry: 'Retry',
      loading: 'Loading roles…',
      chars: '{n} / {max}',
      errName: 'Enter a name.',
      errPrompt: 'Enter a prompt.',
      errTooLong: 'Too long: at most {max} characters.',
      errSkillName: 'Use kebab-case: lowercase letters, digits and single hyphens.',
      errSkillDup: 'Another skill of this role has this name.',
      errSkillDescription: 'Enter a description.',
      errSkillContent: 'Enter the content.',
      errSkills: 'Some skills need attention.',
      copySuffix: 'copy',
      newRoleName: 'New role',
    }
    const zh = {
      panel: '角色',
      role: '角色',
      none: '无',
      noneHint: '不使用角色：Agent 保持默认行为。',
      manage: '管理角色…',
      switchFailed: '切换角色失败：{message}',
      chipTitle: '本会话的角色：{name}。点击编辑。',
      intro: '角色由一段详细提示词和它自带的技能组成。在输入框模型菜单的“角色”一行为每个会话选择，从下一步起生效。',
      configHint: '角色在侧边栏的独立页面里编辑。',
      openManager: '打开角色管理',
      newRole: '新建角色',
      search: '搜索角色',
      noMatches: '没有匹配的角色。',
      empty: '还没有角色。新建一个，或恢复内置角色。',
      restore: '恢复 {n} 个内置角色',
      restored: '已恢复 {n} 个内置角色。',
      builtin: '内置',
      modified: '已修改',
      unsavedNew: '尚未保存',
      unsaved: '有未保存的修改',
      skillsCount: '{n} 个技能',
      usedBy: '{n} 个会话正在使用',
      unused: '未被使用',
      namePlaceholder: '角色名称',
      descriptionPlaceholder: '一句话简介，显示在角色列表和菜单里',
      pickIcon: '选择图标',
      iconCustom: '或输入任意 emoji',
      tabPrompt: '提示词',
      tabSkills: '技能',
      tabPreview: '模型看到的内容',
      promptHint: '职责、工作方式、输出格式，以及什么时候加载哪个技能。支持 Markdown。',
      promptPlaceholder: '你现在担任……\n\n## 工作方式\n1. \n\n## 输出格式\n- ',
      skillsHint: '技能通过 skill 工具按需加载，只出现在使用这个角色的会话里。项目或用户技能同名时优先。',
      addSkill: '添加技能',
      localSkills: '引用本地技能',
      localHint: '按名称引用已有技能，不复制文件。通过原生 skill 工具加载，保留资源目录。本角色不会隐藏会话里的其他技能。',
      localCwd: '项目目录（可选）',
      localLoad: '读取技能目录',
      localSearch: '搜索本地技能',
      localEmpty: '这个目录里没有发现本地技能。',
      localMissing: '当前目录中未找到，请核对使用角色的会话项目目录。',
      localPartial: '技能发现尚未完成，未列出的技能仍可能存在。',
      localLimit: '每个角色最多引用 20 个本地技能。',
      inlineSkills: '角色自带技能',
      noSkills: '还没有角色自带技能。可以在下方编写专用参考材料，或在上方引用已有的本地技能。',
      untitledSkill: '未命名技能',
      skillName: '名称',
      skillNameHint: 'kebab-case，例如 review-checklist',
      skillDescription: '描述',
      skillDescriptionHint: '一句话，Agent 据此判断何时加载。',
      skillWhen: '何时使用',
      skillWhenHint: '可选，补充触发条件。',
      skillContent: '内容',
      skillContentHint: 'Markdown 格式的完整说明。角色技能没有文件，不要引用相对路径。',
      removeSkill: '删除技能',
      previewHint: '紧跟在部署人设之后加入系统提示词。包含未保存的修改。',
      previewSkills: '技能目录条目',
      previewLoading: '正在生成…',
      previewInvalid: '先修正标出的字段，才能预览。',
      save: '保存',
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
      resetConfirm: '把“{name}”恢复为内置内容？你对它的修改会丢失。',
      delete: '删除',
      deleteConfirm: '删除角色“{name}”？',
      deleteConfirmUsed: '删除角色“{name}”？{n} 个会话正在使用它，删除后回到无角色。',
      conflict: '你开始编辑后，这个角色在别处被修改了。保存会覆盖那次修改。',
      loadLatest: '载入最新',
      failed: '失败：{message}',
      loadFailed: '无法加载角色：{message}',
      retry: '重试',
      loading: '正在加载角色…',
      chars: '{n} / {max}',
      errName: '请填写名称。',
      errPrompt: '请填写提示词。',
      errTooLong: '太长了：最多 {max} 字。',
      errSkillName: '使用 kebab-case：小写字母、数字和单个连字符。',
      errSkillDup: '这个角色里已有同名技能。',
      errSkillDescription: '请填写描述。',
      errSkillContent: '请填写内容。',
      errSkills: '有技能需要修改。',
      copySuffix: '副本',
      newRoleName: '新角色',
    }

    // ── Shared store: one SSE stream while anything is mounted. ─────────────
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
      if (data?.roles && body.action !== 'preview') store.set(readyState(data))
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
      es: null,
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
      open() {
        if (store.es) return
        const es = new EventSource('roles/events')
        store.es = es
        es.addEventListener('message', e => {
          let data = null
          try { data = JSON.parse(e.data) } catch {}
          if (data && Array.isArray(data.roles)) store.set(readyState(data))
        })
        es.addEventListener('error', () => {
          if (store.state.status === 'loading') {
            fetch('roles/state', { headers: { accept: 'application/json' } })
              .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(new Error(d?.message ?? `HTTP ${r.status}`)), () => Promise.reject(new Error(`HTTP ${r.status}`))))
              .then(d => store.set(readyState(d)))
              .catch(error => store.set({ status: 'error', error: error.message }))
          }
        })
      },
      close() {
        store.es?.close()
        store.es = null
      },
      reload() {
        store.close()
        store.set({ status: 'loading', error: null })
        if (store.listeners.size > 0) store.open()
      },
    }
    const useRoles = () => React.useSyncExternalStore(store.subscribe, store.get)

    const MENU_CSS = `
.rl-cell{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:auto;min-width:100%;height:34px;padding:0 8px;border:none;border-radius:var(--dsw-radius-md,10px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;text-align:left;cursor:pointer}
.rl-cell:focus-visible{outline:none;background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.rl-cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.rl-cell:disabled{opacity:.5;cursor:default}
.rl-cell-label{flex:0 0 auto;white-space:nowrap}
.rl-cell-value{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;color:var(--dsw-alias-label-tertiary)}
.rl-chev{flex:0 0 auto;width:12px;height:12px;color:var(--dsw-alias-menu-icon,var(--dsw-alias-label-tertiary));transition:transform .15s}
.rl-chev[data-open=true]{transform:rotate(90deg)}
.rl-list{display:flex;flex-direction:column;max-height:240px;overflow-y:auto;margin:0 0 2px 0;padding-left:8px}
.rl-opt-icon{flex:0 0 18px;text-align:center}
.rl-opt-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rl-check{flex:0 0 auto;width:14px;height:14px;color:var(--dsw-alias-label-primary)}
.rl-manage{color:var(--dsw-alias-label-secondary)}
.rl-chip{display:inline-flex;align-items:center;gap:4px;max-width:200px;height:24px;padding:0 8px;border:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:22px;white-space:nowrap;cursor:pointer;transition:background-color .15s}
.rl-chip:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.rl-chip:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.rl-chip b{font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis}
`

    const PAGE_CSS = `
.rlp{--rlp-line:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);--rlp-soft:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1);--rlp-mono:"SF Mono","JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;display:flex;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.rlp :where(button){font:inherit}
.rlp :focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.rlp-side{display:flex;flex-direction:column;flex:0 0 288px;min-width:0;min-height:0;border-right:var(--rlp-soft)}
.rlp-side-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:28px 16px 12px 20px}
[data-platform=darwin] .rlp-side-head,[data-platform=darwin] .rlp-ed-head{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.rlp-h1{margin:0;font-size:20px;line-height:28px;font-weight:500}
.rlp-intro{margin:0;padding:0 20px 12px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.rlp-search{display:flex;align-items:center;gap:6px;margin:0 16px 8px 16px;padding:0 10px;height:32px;border:var(--rlp-line);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary)}
.rlp-search:focus-within{border-color:var(--dsw-alias-brand-primary)}
.rlp-search input{flex:1;min-width:0;height:30px;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit}
.rlp-list{flex:1;min-height:0;overflow:auto;padding:0 8px 8px;list-style:none;margin:0}
.rlp-item{position:relative;display:flex;align-items:flex-start;gap:10px;width:100%;padding:8px 10px;border:0;border-radius:var(--dsw-radius-md,10px);background:transparent;color:inherit;text-align:left;cursor:pointer}
@media (hover:hover){.rlp-item:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-item[aria-current=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.rlp-item-icon{flex:0 0 28px;height:28px;display:grid;place-items:center;border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-size:16px;line-height:1}
.rlp-item-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.rlp-item-top{display:flex;align-items:center;gap:6px;min-width:0}
.rlp-item-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.rlp-item-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.rlp-item-meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rlp-dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-warn-primary)}
.rlp-live{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary)}
.rlp-side-foot{padding:8px 16px 16px;border-top:var(--rlp-soft)}
.rlp-empty{padding:16px 12px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.rlp-main{position:relative;display:flex;flex-direction:column;flex:1;min-width:0;min-height:0}
.rlp-ed-scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable}
.rlp-ed{min-width:0;border:0;max-width:880px;margin:0 auto;padding:0 clamp(20px,4vw,40px) 32px;display:flex;flex-direction:column;gap:16px}
.rlp-local{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.rlp-local-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:end}
.rlp-local-tools .rlp-field{flex:1;min-width:160px}
.rlp-local-list{max-height:300px;overflow:auto;border:var(--rlp-line);border-radius:10px}
.rlp-local-option{display:flex;align-items:flex-start;gap:10px;padding:8px 12px;cursor:pointer}
.rlp-local-option+.rlp-local-option{border-top:var(--rlp-soft)}
.rlp-local-option input{flex:none;margin-top:4px;accent-color:var(--dsw-alias-brand-primary)}
.rlp-local-option>span{min-width:0;display:flex;flex-direction:column;gap:2px;overflow-wrap:anywhere}
.rlp-local-option code{font:12px/18px var(--rlp-mono)}
.rlp-local-option small{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.rlp-ed-head{display:flex;align-items:flex-start;gap:14px;padding-top:28px}
.rlp-icon-btn{flex:none;width:52px;height:52px;display:grid;place-items:center;border:var(--rlp-line);border-radius:14px;background:var(--dsw-alias-bg-layer-1);font-size:26px;line-height:1;cursor:pointer}
@media (hover:hover){.rlp-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-titles{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.rlp-title-input{width:100%;box-sizing:border-box;margin:0;padding:2px 6px;margin-left:-6px;border:var(--dsh-hairline-width,1px) solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:20px;line-height:28px;font-weight:500}
.rlp-desc-input{width:100%;box-sizing:border-box;padding:2px 6px;margin-left:-6px;border:var(--dsh-hairline-width,1px) solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit}
.rlp-title-input:hover,.rlp-desc-input:hover{border-color:var(--dsw-alias-border-l2)}
.rlp-title-input:focus,.rlp-desc-input:focus{outline:0;border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}
.rlp-title-input[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}
.rlp-title-input::placeholder,.rlp-desc-input::placeholder,.rlp textarea::placeholder,.rlp-field input::placeholder{color:var(--dsw-alias-label-tertiary)}
.rlp-badges{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:4px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.rlp-tag{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:20px;white-space:nowrap}
.rlp-tag.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.rlp-head-actions{flex:none;display:flex;align-items:center;gap:8px;padding-top:2px}
.rlp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border:var(--rlp-line);border-radius:16px;background:transparent;color:var(--dsw-alias-label-primary);font-size:13px;white-space:nowrap;cursor:pointer;transition:background-color .15s}
.rlp-btn.sm{height:28px;padding:0 10px;border-radius:14px;font-size:12px}
.rlp-btn.icon{width:32px;padding:0}
.rlp-btn.ghost{border-color:transparent}
@media (hover:hover){.rlp-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-label-on-color))}
@media (hover:hover){.rlp-btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-button-primary-fill))}}
.rlp-btn.danger{color:var(--dsw-alias-state-error-primary)}
.rlp-btn:disabled{opacity:.4;cursor:default}
.rlp-pop-anchor{position:relative}
.rlp-pop{position:absolute;z-index:20;top:calc(100% + 6px);min-width:180px;padding:4px;border:var(--rlp-line);border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2)}
.rlp-pop.right{right:0}
.rlp-pop.left{left:0}
.rlp-menu-item{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 10px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;white-space:nowrap}
@media (hover:hover){.rlp-menu-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-menu-item:disabled{opacity:.4;cursor:default}
.rlp-menu-item.danger{color:var(--dsw-alias-state-error-primary)}
@media (hover:hover){.rlp-menu-item.danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,var(--dsw-alias-interactive-bg-hover))}}
.rlp-menu-sep{height:1px;margin:4px 6px;background:var(--dsw-alias-border-l1)}
.rlp-emoji{width:264px;padding:8px}
.rlp-emoji-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px}
.rlp-emoji-grid button{height:30px;border:0;border-radius:6px;background:transparent;font-size:18px;line-height:1;cursor:pointer}
@media (hover:hover){.rlp-emoji-grid button:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-emoji-grid button[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.rlp-emoji input{box-sizing:border-box;width:100%;height:30px;margin-top:8px;padding:0 8px;border:var(--rlp-line);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}
.rlp-banner{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-state-warn-tertiary,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-state-warn-label,var(--dsw-alias-label-primary));font-size:12px;line-height:18px}
.rlp-banner span{flex:1}
.rlp-tabs{display:flex;gap:4px;border-bottom:var(--rlp-soft);margin-top:4px}
.rlp-tab{position:relative;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 10px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:14px;cursor:pointer}
.rlp-tab[aria-selected=true]{color:var(--dsw-alias-label-primary)}
.rlp-tab[aria-selected=true]::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:2px;border-radius:1px;background:var(--dsw-alias-brand-primary)}
.rlp-count{min-width:16px;height:16px;padding:0 5px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;text-align:center}
.rlp-err-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-error-primary)}
.rlp-hint{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.rlp-err{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.rlp-meter{display:flex;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.rlp-meter b{font-weight:400;font-variant-numeric:tabular-nums}
.rlp-meter b.over{color:var(--dsw-alias-state-error-primary)}
.rlp textarea{box-sizing:border-box;width:100%;padding:12px 14px;border:var(--rlp-line);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:12.5px/1.65 var(--rlp-mono);resize:vertical;tab-size:2}
.rlp textarea:focus{outline:0;border-color:var(--dsw-alias-brand-primary)}
.rlp textarea[aria-invalid=true],.rlp-field input[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}
.rlp textarea.rlp-prompt{min-height:max(320px,calc(100vh - 360px))}
.rlp-skills{display:flex;flex-direction:column;gap:8px}
.rlp-skill{border:var(--rlp-line);border-radius:var(--dsw-radius-md,12px);overflow:hidden}
.rlp-skill[data-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}
.rlp-skill-head{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 4px}
.rlp-skill-fold{flex:1;display:flex;align-items:center;gap:8px;min-width:0;height:32px;padding:0 6px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer}
@media (hover:hover){.rlp-skill-fold:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-skill-name{flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:12px/18px var(--rlp-mono)}
.rlp-skill-name.placeholder{color:var(--dsw-alias-label-tertiary)}
.rlp-skill-desc{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary)}
.rlp-skill-body{display:flex;flex-direction:column;gap:14px;padding:6px 14px 14px;border-top:var(--rlp-soft)}
.rlp-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.rlp-field>label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.rlp-field input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:var(--rlp-line);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit}
.rlp-field input.mono{font:12.5px/20px var(--rlp-mono)}
.rlp-field input:focus{outline:0;border-color:var(--dsw-alias-brand-primary)}
.rlp-field textarea{min-height:220px}
.rlp-row2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:12px}
@media (max-width:720px){.rlp-row2{grid-template-columns:1fr}}
.rlp-chev{flex:none;width:12px;height:12px;color:var(--dsw-alias-label-tertiary);transition:transform .15s}
.rlp-chev[data-open=true]{transform:rotate(90deg)}
.rlp-pre{margin:0;padding:14px 16px;border:var(--rlp-line);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);font:12.5px/1.65 var(--rlp-mono);white-space:pre-wrap;overflow-wrap:anywhere}
.rlp-cat{display:flex;flex-direction:column;border:var(--rlp-line);border-radius:var(--dsw-radius-md,10px)}
.rlp-cat-row{padding:8px 14px;font-size:12px;line-height:18px}
.rlp-cat-row+.rlp-cat-row{border-top:var(--rlp-soft)}
.rlp-cat-row code{font-family:var(--rlp-mono)}
.rlp-h3{margin:4px 0 0;font-size:13px;line-height:20px;font-weight:500}
.rlp-bar{display:flex;align-items:center;gap:10px;padding:10px clamp(20px,4vw,40px);border-top:var(--rlp-soft);background:var(--dsw-alias-bg-base)}
.rlp-bar-msg{flex:1;min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rlp-bar-msg.err{color:var(--dsw-alias-state-error-primary)}
.rlp-bar-msg.ok{color:var(--dsw-alias-state-success-primary)}
.rlp-bar-msg.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.rlp-kbd{color:var(--dsw-alias-label-tertiary);font-size:11px}
.rlp-blank{flex:1;display:grid;place-items:center;padding:24px;color:var(--dsw-alias-label-secondary);text-align:center}
.rlp-blank>div{display:flex;flex-direction:column;align-items:center;gap:12px;max-width:360px}
.rlp-blank-icon{font-size:40px;line-height:1}
@media (max-width:760px){.rlp{flex-direction:column;overflow:auto}.rlp-side{flex:none;max-height:45%;border-right:0;border-bottom:var(--rlp-soft)}.rlp-main{flex:none;min-height:70vh}}
.rlc{display:flex;flex-direction:column;align-items:flex-start;gap:10px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.rlc p{margin:0}
.rlc .rlp-btn{height:30px}
`

    function Chevron({ open, className = 'rl-chev' }) {
      return h('svg', { className, 'data-open': open ? 'true' : 'false', viewBox: '0 0 12 12', width: 12, height: 12, 'aria-hidden': true },
        h('path', { d: 'M4.5 2.5 8 6l-3.5 3.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }
    function Check() {
      return h('svg', { className: 'rl-check', viewBox: '0 0 14 14', width: 14, height: 14, 'aria-hidden': true },
        h('path', { d: 'M3 7.2 5.8 10 11 4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }
    const svg = (size, children) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    }, children)
    /** Sidebar glyph: two overlapping masks. */
    const IconRoles = ({ size = 16 }) => svg(size, [
      h('path', { key: 'a', d: 'M2.5 3.5h6.5v4.2a3.25 3.25 0 0 1-6.5 0z' }),
      h('path', { key: 'b', d: 'M7 7.3h6.5v3.9a3.25 3.25 0 0 1-6.5 0' }),
      h('path', { key: 'c', d: 'M4.4 8.6q1.35 1 2.7 0M9 12.2q1.35-1 2.7 0' }),
    ])
    const IconSearch = ({ size = 14 }) => svg(size, [
      h('circle', { key: 'a', cx: 7, cy: 7, r: 4.25 }),
      h('path', { key: 'b', d: 'M10.2 10.2 13.5 13.5' }),
    ])
    const IconPlus = ({ size = 14 }) => svg(size, h('path', { d: 'M8 3v10M3 8h10' }))
    const IconMore = ({ size = 16 }) => svg(size, [3.5, 8, 12.5].map(x => h('circle', { key: x, cx: x, cy: 8, r: 0.9, fill: 'currentColor' })))
    const IconTrash = ({ size = 14 }) => svg(size, h('path', { d: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5' }))

    const EMOJIS = ['🎭', '🔍', '🏛️', '🐛', '✍️', '🧪', '🛡️', '⚙️', '🚀', '📐', '🧭', '🧠', '📊', '🗂️', '🎨', '🧹', '🔧', '📝', '💡', '🤖', '👩‍💻', '🧑‍🏫', '🕵️', '⚖️', '📚', '🌐', '🔒', '⏱️', '🧩', '📦', '🎯', '🦉']

    // Mirrors the Host's checks in parseDraft, so problems show before a round trip.
    const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

    return {
      inject: ['slots', 'locale', 'layout'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'roles: dictionaries')
        const t = ctx.locale.bind(NS)
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        // The manager page reads `focus` once on mount and whenever it changes.
        const nav = { roleId: null, seq: 0, listeners: new Set() }
        const navStore = {
          subscribe: fn => { nav.listeners.add(fn); return () => nav.listeners.delete(fn) },
          get: () => nav.seq,
        }
        const openManager = (roleId = null) => {
          nav.roleId = roleId
          nav.seq++
          nav.listeners.forEach(fn => fn())
          try { ctx.layout.selectPanel(PANEL_ID) } catch { ctx.get('pluginNavigation')?.openBundle(PACKAGE) }
        }

        // ── Model menu row ────────────────────────────────────────────────
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
            h('style', null, MENU_CSS),
            h('button', {
              type: 'button', role: 'menuitem', className: 'rl-cell', 'aria-expanded': open,
              onClick: () => setOpen(!open),
            },
              h('span', { className: 'rl-cell-label' }, t('role')),
              h('span', { className: 'rl-cell-value' }, current ? roleLabel(current) : t('none')),
              h(Chevron, { open })),
            open ? h('div', { className: 'rl-list', role: 'group', 'aria-label': t('role') },
              h('button', {
                type: 'button', role: 'menuitemradio', 'aria-checked': currentId === null, className: 'rl-cell',
                disabled: busy, title: t('noneHint'), onClick: () => select(null),
              },
                h('span', { className: 'rl-opt-icon' }),
                h('span', { className: 'rl-opt-name' }, t('none')),
                currentId === null ? h(Check) : null),
              roles.map(role => h('button', {
                key: role.id, type: 'button', role: 'menuitemradio', 'aria-checked': role.id === currentId, className: 'rl-cell',
                disabled: busy, title: role.description || role.name, onClick: () => select(role.id),
              },
                h('span', { className: 'rl-opt-icon' }, role.icon),
                h('span', { className: 'rl-opt-name' }, role.name),
                role.id === currentId ? h(Check) : null)),
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

        // ── Composer chip ─────────────────────────────────────────────────
        function RoleChip({ sessionId }) {
          useLocale()
          const { roles, sessions } = useRoles()
          const role = roles.find(r => r.id === sessions[sessionId])
          if (!role) return null
          const title = t('chipTitle', { name: role.name })
          return h('button', { type: 'button', className: 'rl-chip', title, 'aria-label': title, onClick: () => openManager(role.id) },
            h('style', null, MENU_CSS),
            role.icon ? h('span', { 'aria-hidden': true }, role.icon) : null,
            h('b', null, role.name))
        }

        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'roles.chip',
          order: 90,
          locale: NS,
        }, RoleChip))

        // ── Role manager (sidebar panel) ─────────────────────────────────
        // Drafts outlive the page: switching roles or leaving the panel keeps
        // unsaved edits, so no navigation ever asks to discard them. A draft is
        // keyed by role id, or `new:<n>` for a role that is not stored yet.
        const formOf = role => ({
          name: role.name, icon: role.icon, description: role.description, prompt: role.prompt,
          localSkills: role.localSkills ?? [],
          // Stable keys, so a stored copy re-read after any broadcast keeps open skill cards open.
          skills: role.skills.map((s, i) => ({ key: `${role.id ?? 'copy'}:${i}`, name: s.name, description: s.description, whenToUse: s.whenToUse ?? '', content: s.content })),
        })
        const payloadOf = form => ({
          name: form.name.trim(), icon: form.icon.trim(), description: form.description.trim(), prompt: form.prompt,
          localSkills: form.localSkills ?? [],
          skills: form.skills.map(s => ({
            name: s.name.trim(), description: s.description.trim(), content: s.content,
            ...(s.whenToUse.trim() ? { whenToUse: s.whenToUse.trim() } : {}),
          })),
        })
        const sameForm = (a, b) => JSON.stringify(payloadOf(a)) === JSON.stringify(payloadOf(b))
        let skillSeq = 0
        let newSeq = 0

        const ui = {
          state: { selected: null, drafts: {}, tab: 'prompt', query: '' },
          listeners: new Set(),
          subscribe: fn => { ui.listeners.add(fn); return () => ui.listeners.delete(fn) },
          get: () => ui.state,
          set(patch) { ui.state = { ...ui.state, ...patch }; ui.listeners.forEach(fn => fn()) },
          setDraft(key, draft) {
            const drafts = { ...ui.state.drafts }
            if (draft === undefined) delete drafts[key]
            else drafts[key] = draft
            ui.set({ drafts })
          },
        }
        const useUi = () => React.useSyncExternalStore(ui.subscribe, ui.get)
        const isNewKey = key => typeof key === 'string' && key.startsWith('new:')

        /** Whether a draft differs from what is stored (a new draft always does). */
        const isDirty = (key, roles) => {
          const draft = ui.state.drafts[key]
          if (!draft) return false
          if (isNewKey(key)) return true
          const role = roles.find(r => r.id === key)
          return !role || !sameForm(draft.form, formOf(role))
        }
        ctx.effect(() => {
          const warn = e => {
            const { roles } = store.get()
            if (Object.keys(ui.state.drafts).some(key => isDirty(key, roles))) { e.preventDefault(); e.returnValue = '' }
          }
          window.addEventListener('beforeunload', warn)
          return () => window.removeEventListener('beforeunload', warn)
        }, 'roles: warn about unsaved drafts')

        /** Field problems keyed by path; `required` problems only show after a save attempt. */
        function validate(form, limits) {
          const errors = {}
          const put = (path, message, required = false) => { errors[path] = { message, required } }
          if (!form.name.trim()) put('name', t('errName'), true)
          else if (form.name.trim().length > limits.name) put('name', t('errTooLong', { max: limits.name }))
          if (form.description.trim().length > limits.description) put('description', t('errTooLong', { max: limits.description }))
          if (!form.prompt.trim()) put('prompt', t('errPrompt'), true)
          else if (form.prompt.length > limits.prompt) put('prompt', t('errTooLong', { max: limits.prompt }))
          const seen = new Set(form.localSkills ?? [])
          for (const skill of form.skills) {
            const name = skill.name.trim()
            if (!name) put(`${skill.key}.name`, t('errSkillName'), true)
            else if (!SKILL_NAME.test(name) || name.length > 64) put(`${skill.key}.name`, t('errSkillName'))
            else if (seen.has(name)) put(`${skill.key}.name`, t('errSkillDup'))
            seen.add(name)
            if (!skill.description.trim()) put(`${skill.key}.description`, t('errSkillDescription'), true)
            else if (skill.description.trim().length > limits.skillDescription) put(`${skill.key}.description`, t('errTooLong', { max: limits.skillDescription }))
            if (skill.whenToUse.trim().length > limits.whenToUse) put(`${skill.key}.whenToUse`, t('errTooLong', { max: limits.whenToUse }))
            if (!skill.content.trim()) put(`${skill.key}.content`, t('errSkillContent'), true)
            else if (skill.content.length > limits.skillContent) put(`${skill.key}.content`, t('errTooLong', { max: limits.skillContent }))
          }
          return errors
        }

        /** Close a popover on outside pointer-down or Escape. */
        function usePopover() {
          const [open, setOpen] = React.useState(false)
          const ref = React.useRef(null)
          React.useEffect(() => {
            if (!open) return undefined
            const down = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
            const key = e => {
              if (e.key === 'Escape') {
                e.stopPropagation()
                setOpen(false)
                ref.current?.querySelector('button')?.focus()
              }
            }
            document.addEventListener('pointerdown', down, true)
            document.addEventListener('keydown', key, true)
            return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key, true) }
          }, [open])
          return { open, setOpen, ref }
        }

        function EmojiPicker({ value, onChange }) {
          const pop = usePopover()
          return h('div', { className: 'rlp-pop-anchor', ref: pop.ref },
            h('button', {
              type: 'button', className: 'rlp-icon-btn', title: t('pickIcon'), 'aria-label': t('pickIcon'),
              'aria-haspopup': 'dialog', 'aria-expanded': pop.open, onClick: () => pop.setOpen(!pop.open),
            }, value || '🎭'),
            pop.open ? h('div', { className: 'rlp-pop left rlp-emoji', role: 'dialog', 'aria-label': t('pickIcon') },
              h('div', { className: 'rlp-emoji-grid' }, EMOJIS.map(emoji => h('button', {
                key: emoji, type: 'button', 'aria-pressed': emoji === value,
                onClick: () => { onChange(emoji); pop.setOpen(false) },
              }, emoji))),
              h('input', {
                value, placeholder: t('iconCustom'), 'aria-label': t('iconCustom'), maxLength: 8,
                onChange: e => onChange(e.target.value),
                onKeyDown: e => { if (e.key === 'Enter') pop.setOpen(false) },
              })) : null)
        }

        function MoreMenu({ items }) {
          const pop = usePopover()
          return h('div', { className: 'rlp-pop-anchor', ref: pop.ref },
            h('button', {
              type: 'button', className: 'rlp-btn icon ghost', title: t('more'), 'aria-label': t('more'),
              'aria-haspopup': 'menu', 'aria-expanded': pop.open, onClick: () => pop.setOpen(!pop.open),
            }, h(IconMore)),
            pop.open ? h('div', {
              className: 'rlp-pop right', role: 'menu',
              ref: node => { if (node && !node.contains(document.activeElement)) node.querySelector('button:not(:disabled)')?.focus() },
              onKeyDown: e => {
                if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
                e.preventDefault()
                const buttons = [...e.currentTarget.querySelectorAll('button:not(:disabled)')]
                const index = buttons.indexOf(document.activeElement)
                const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
                buttons[next]?.focus()
              },
            }, items.map((item, i) => item === '-'
              ? h('div', { key: `sep${i}`, className: 'rlp-menu-sep', role: 'separator' })
              : h('button', {
                key: item.label, type: 'button', role: 'menuitem', className: `rlp-menu-item${item.danger ? ' danger' : ''}`,
                disabled: item.disabled, onClick: () => { pop.setOpen(false); item.onClick() },
              }, item.label))) : null)
        }

        function Meter({ value, max, hint }) {
          return h('div', { className: 'rlp-meter' },
            h('span', null, hint ?? ''),
            h('b', { className: value > max ? 'over' : undefined }, t('chars', { n: value.toLocaleString(), max: max.toLocaleString() })))
        }

        function FieldError({ error, show }) {
          return error && (show || !error.required) ? h('p', { className: 'rlp-err', role: 'alert' }, error.message) : null
        }

        function SkillCard({ skill, errors, showErrors, limits, onChange, onRemove, open, onToggle }) {
          const set = field => e => onChange({ ...skill, [field]: e.target.value })
          const err = field => errors[`${skill.key}.${field}`]
          const shown = field => { const e = err(field); return e && (showErrors || !e.required) }
          const invalid = ['name', 'description', 'whenToUse', 'content'].some(shown)
          const id = field => `rlp-${skill.key}-${field}`
          return h('div', { className: 'rlp-skill', 'data-invalid': invalid },
            h('div', { className: 'rlp-skill-head' },
              h('button', { type: 'button', className: 'rlp-skill-fold', 'aria-expanded': open, onClick: onToggle },
                h(Chevron, { open, className: 'rlp-chev' }),
                h('span', { className: `rlp-skill-name${skill.name ? '' : ' placeholder'}` }, skill.name || t('untitledSkill')),
                h('span', { className: 'rlp-skill-desc' }, skill.description)),
              h('button', { type: 'button', className: 'rlp-btn icon sm ghost danger', title: t('removeSkill'), 'aria-label': `${t('removeSkill')} ${skill.name}`, onClick: onRemove }, h(IconTrash))),
            open ? h('div', { className: 'rlp-skill-body' },
              h('div', { className: 'rlp-row2' },
                h('div', { className: 'rlp-field' },
                  h('label', { htmlFor: id('name') }, t('skillName')),
                  h('input', { id: id('name'), className: 'mono', value: skill.name, onChange: set('name'), placeholder: 'review-checklist', spellCheck: false, autoComplete: 'off', 'aria-invalid': shown('name') || undefined }),
                  shown('name') ? h(FieldError, { error: err('name'), show: showErrors }) : h('p', { className: 'rlp-hint' }, t('skillNameHint'))),
                h('div', { className: 'rlp-field' },
                  h('label', { htmlFor: id('description') }, t('skillDescription')),
                  h('input', { id: id('description'), value: skill.description, onChange: set('description'), 'aria-invalid': shown('description') || undefined }),
                  shown('description') ? h(FieldError, { error: err('description'), show: showErrors }) : h('p', { className: 'rlp-hint' }, t('skillDescriptionHint')))),
              h('div', { className: 'rlp-field' },
                h('label', { htmlFor: id('whenToUse') }, t('skillWhen')),
                h('input', { id: id('whenToUse'), value: skill.whenToUse, onChange: set('whenToUse'), placeholder: t('skillWhenHint'), 'aria-invalid': shown('whenToUse') || undefined }),
                h(FieldError, { error: err('whenToUse'), show: showErrors })),
              h('div', { className: 'rlp-field' },
                h('label', { htmlFor: id('content') }, t('skillContent')),
                h('textarea', { id: id('content'), value: skill.content, onChange: set('content'), spellCheck: false, rows: 14, 'aria-invalid': shown('content') || undefined }),
                h(FieldError, { error: err('content'), show: showErrors }),
                h(Meter, { value: skill.content.length, max: limits.skillContent, hint: t('skillContentHint') }))) : null)
        }

        function LocalSkills({ selected, inlineNames, onChange }) {
          const [cwd, setCwd] = React.useState('')
          const [query, setQuery] = React.useState('')
          const [catalog, setCatalog] = React.useState({ status: 'loading', skills: [] })
          const sequence = React.useRef(0)
          const load = async (directory = cwd) => {
            const request = ++sequence.current
            setCatalog(s => ({ ...s, status: 'loading', error: null }))
            try {
              const result = await op({ action: 'catalog', ...(directory.trim() ? { cwd: directory.trim() } : {}) })
              if (request === sequence.current) setCatalog({ status: 'ready', skills: result.skills, complete: result.complete })
            } catch (e) {
              if (request === sequence.current) setCatalog(s => ({ ...s, status: 'error', error: e.message }))
            }
          }
          React.useEffect(() => { void load(''); return () => { sequence.current++ } }, [])
          const known = new Set(catalog.skills.map(s => s.name))
          const missing = selected.filter(name => !known.has(name))
          const needle = query.trim().toLocaleLowerCase()
          const rows = [
            ...missing.map(name => ({ name, missing: true })),
            ...catalog.skills,
          ].filter(s => `${s.name} ${s.description ?? ''}`.toLocaleLowerCase().includes(needle))
          const toggle = name => onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name])
          return h('section', { className: 'rlp-local', 'aria-label': t('localSkills') },
            h('h3', { className: 'rlp-h3' }, t('localSkills')),
            h('p', { className: 'rlp-hint' }, t('localHint')),
            h('div', { className: 'rlp-local-tools' },
              h('label', { className: 'rlp-field' },
                h('span', { className: 'rlp-hint' }, t('localCwd')),
                h('input', { value: cwd, placeholder: '/path/to/project', onChange: e => setCwd(e.target.value),
                  onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); void load() } } })),
              h('button', { type: 'button', className: 'rlp-btn', disabled: catalog.status === 'loading', onClick: () => void load() }, t('localLoad'))),
            h('label', { className: 'rlp-field' },
              h('input', { type: 'search', value: query, placeholder: t('localSearch'), 'aria-label': t('localSearch'), onChange: e => setQuery(e.target.value) })),
            catalog.status === 'loading' ? h('p', { className: 'rlp-hint', role: 'status' }, t('loading')) : null,
            catalog.error ? h('p', { className: 'rlp-err', role: 'alert' }, t('failed', { message: catalog.error })) : null,
            catalog.complete === false ? h('p', { className: 'rlp-hint' }, t('localPartial')) : null,
            rows.length ? h('div', { className: 'rlp-local-list' }, rows.map(skill => h('label', { key: skill.name, className: 'rlp-local-option' },
              h('input', {
                type: 'checkbox', checked: selected.includes(skill.name),
                disabled: !selected.includes(skill.name) && (selected.length >= 20 || inlineNames.includes(skill.name)),
                onChange: () => toggle(skill.name),
              }),
              h('span', null, h('code', null, skill.name),
                h('small', null, skill.missing ? (catalog.status === 'ready' ? t('localMissing') : '') : skill.description),
                skill.path ? h('small', null, skill.path) : null))))
              : catalog.status === 'ready' ? h('p', { className: 'rlp-hint' }, t('localEmpty')) : null,
            selected.length >= 20 ? h('p', { className: 'rlp-hint' }, t('localLimit')) : null)
        }

        function Preview({ form, errors }) {
          const [state, setState] = React.useState({ status: 'loading' })
          const blocked = Object.keys(errors).length > 0
          const payload = JSON.stringify(payloadOf(form))
          React.useEffect(() => {
            if (blocked) return undefined
            let live = true
            setState(s => s.status === 'ready' ? s : { status: 'loading' })
            const timer = setTimeout(() => {
              op({ action: 'preview', role: JSON.parse(payload) })
                .then(r => { if (live) setState({ status: 'ready', prompt: r.prompt }) })
                .catch(e => { if (live) setState({ status: 'error', message: e.message }) })
            }, 250)
            return () => { live = false; clearTimeout(timer) }
          }, [payload, blocked])
          if (blocked) return h('p', { className: 'rlp-hint' }, t('previewInvalid'))
          const skills = payloadOf(form).skills
          return h(React.Fragment, null,
            h('p', { className: 'rlp-hint' }, t('previewHint')),
            state.status === 'error' ? h('p', { className: 'rlp-err' }, t('failed', { message: state.message }))
              : h('pre', { className: 'rlp-pre', 'aria-busy': state.status === 'loading' }, state.status === 'ready' ? state.prompt : t('previewLoading')),
            form.localSkills?.length ? h(React.Fragment, null,
              h('h3', { className: 'rlp-h3' }, t('localSkills')),
              h('p', { className: 'rlp-hint' }, form.localSkills.join(', '))) : null,
            skills.length ? h(React.Fragment, null,
              h('h3', { className: 'rlp-h3' }, t('previewSkills')),
              h('div', { className: 'rlp-cat' }, skills.map(s => h('div', { key: s.name, className: 'rlp-cat-row' },
                h('code', null, s.name), ': ', s.description, s.whenToUse ? ` (${s.whenToUse})` : '')))) : null)
        }

        function RoleEditor({ roleKey, stored, roles, sessions, limits, builtinModified, onSaved, onDeleted }) {
          const { drafts, tab } = useUi()
          const draft = drafts[roleKey]
          const isNew = isNewKey(roleKey)
          const base = React.useMemo(() => stored ? formOf(stored) : null, [stored])
          const form = draft?.form ?? base
          const dirty = isNew || (draft !== undefined && !sameForm(draft.form, base))
          const conflict = !isNew && dirty && stored && draft.baseAt !== stored.updatedAt
          const [status, setStatus] = React.useState({ kind: 'idle' })
          const [busy, setBusy] = React.useState(false)
          const [showErrors, setShowErrors] = React.useState(false)
          const [openSkills, setOpenSkills] = React.useState(() => new Set())
          React.useEffect(() => { setStatus({ kind: 'idle' }); setShowErrors(false) }, [roleKey])

          const errors = React.useMemo(() => validate(form, limits), [form, limits])
          const hasErrors = Object.keys(errors).length > 0
          const skillErrors = form.skills.some(s => Object.keys(errors).some(k => k.startsWith(`${s.key}.`) && (showErrors || !errors[k].required)))

          const update = patch => {
            const next = { ...form, ...patch }
            if (!isNew && sameForm(next, base)) ui.setDraft(roleKey, undefined)
            else ui.setDraft(roleKey, { form: next, baseAt: draft?.baseAt ?? stored?.updatedAt ?? 0 })
            if (status.kind !== 'idle') setStatus({ kind: 'idle' })
          }
          const set = field => e => update({ [field]: e.target.value })

          const run = async (body, after) => {
            setBusy(true)
            setStatus({ kind: 'idle' })
            try {
              const result = await op(body)
              await after?.(result)
              return result
            } catch (e) {
              setStatus({ kind: 'err', text: t('failed', { message: e.message }) })
              return null
            } finally {
              setBusy(false)
            }
          }
          const save = () => {
            if (busy || !dirty) return
            if (hasErrors) {
              setShowErrors(true)
              const firstSkill = form.skills.find(s => Object.keys(errors).some(k => k.startsWith(`${s.key}.`)))
              if (!errors.name && !errors.prompt && !errors.description && firstSkill) {
                ui.set({ tab: 'skills' })
                setOpenSkills(prev => new Set(prev).add(firstSkill.key))
              } else if (errors.prompt) ui.set({ tab: 'prompt' })
              setStatus({ kind: 'err', text: errors.name?.message ?? errors.prompt?.message ?? errors.description?.message ?? t('errSkills') })
              return
            }
            const role = payloadOf(form)
            if (isNew) {
              void run({ action: 'create', role }, r => { ui.setDraft(roleKey, undefined); onSaved(r.roleId, t('saved')) })
            } else {
              void run({ action: 'update', roleId: roleKey, role }, () => { ui.setDraft(roleKey, undefined); setStatus({ kind: 'ok', text: t('saved') }) })
            }
          }
          const discard = () => {
            ui.setDraft(roleKey, undefined)
            setShowErrors(false)
            setStatus({ kind: 'idle' })
            if (isNew) onDeleted(roleKey)
          }
          const saveRef = React.useRef(save)
          saveRef.current = save
          React.useEffect(() => {
            const key = e => {
              if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); saveRef.current() }
            }
            document.addEventListener('keydown', key)
            return () => document.removeEventListener('keydown', key)
          }, [])

          const index = stored ? roles.indexOf(stored) : -1
          const used = stored ? Object.values(sessions).filter(id => id === stored.id).length : 0
          const modified = stored?.builtin && builtinModified.includes(stored.id)
          const duplicate = () => {
            const key = `new:${++newSeq}`
            ui.setDraft(key, { form: { ...formOf(payloadOf(form)), name: `${form.name.trim()} ${t('copySuffix')}`.slice(0, limits.name) }, baseAt: 0 })
            onSaved(key)
          }
          const menu = [
            { label: t('duplicate'), onClick: duplicate, disabled: busy || roles.length >= limits.roles },
            ...(isNew ? [] : [
              { label: t('moveUp'), disabled: busy || index <= 0, onClick: () => run({ action: 'move', roleId: stored.id, beforeRoleId: roles[index - 1].id }) },
              { label: t('moveDown'), disabled: busy || index >= roles.length - 1, onClick: () => run({ action: 'move', roleId: stored.id, beforeRoleId: roles[index + 2]?.id }) },
            ]),
            ...(stored?.builtin ? [{ label: t('reset'), disabled: busy || (!modified && !dirty),
              onClick: () => window.confirm(t('resetConfirm', { name: stored.name })) && run({ action: 'reset', roleId: stored.id }, () => ui.setDraft(roleKey, undefined)) }] : []),
            '-',
            isNew
              ? { label: t('discardNew'), danger: true, onClick: discard }
              : { label: t('delete'), danger: true, disabled: busy,
                onClick: () => window.confirm(used ? t('deleteConfirmUsed', { name: stored.name, n: used }) : t('deleteConfirm', { name: stored.name }))
                  && run({ action: 'delete', roleId: stored.id }, () => { ui.setDraft(roleKey, undefined); onDeleted(roleKey) }) },
          ]

          const toggleSkill = key => setOpenSkills(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
          })
          const addSkill = () => {
            const skill = { key: `s${++skillSeq}`, name: '', description: '', whenToUse: '', content: '' }
            update({ skills: [...form.skills, skill] })
            setOpenSkills(prev => new Set(prev).add(skill.key))
          }

          const tabs = [
            { id: 'prompt', label: t('tabPrompt'), flag: (errors.prompt && (showErrors || !errors.prompt.required)) },
            { id: 'skills', label: t('tabSkills'), count: form.skills.length + (form.localSkills?.length ?? 0), flag: skillErrors },
            { id: 'preview', label: t('tabPreview') },
          ]
          const showName = errors.name && (showErrors || !errors.name.required)

          const message = status.kind !== 'idle' ? status
            : dirty ? { kind: 'warn', text: isNew ? t('unsavedNew') : t('unsaved') } : null

          return h('div', { className: 'rlp-main' },
            h('div', { className: 'rlp-ed-scroll' },
              h('fieldset', { className: 'rlp-ed', disabled: busy },
                h('div', { className: 'rlp-ed-head' },
                  h(EmojiPicker, { value: form.icon, onChange: icon => update({ icon }) }),
                  h('div', { className: 'rlp-titles' },
                    h('input', { className: 'rlp-title-input', value: form.name, onChange: set('name'), placeholder: t('namePlaceholder'), 'aria-label': t('namePlaceholder'), 'aria-invalid': showName || undefined, maxLength: limits.name + 20 }),
                    h('input', { className: 'rlp-desc-input', value: form.description, onChange: set('description'), placeholder: t('descriptionPlaceholder'), 'aria-label': t('descriptionPlaceholder') }),
                    showName ? h('p', { className: 'rlp-err', role: 'alert' }, errors.name.message) : null,
                    errors.description ? h('p', { className: 'rlp-err', role: 'alert' }, errors.description.message) : null,
                    h('div', { className: 'rlp-badges' },
                      stored?.builtin ? h('span', { className: 'rlp-tag' }, t('builtin')) : null,
                      modified ? h('span', { className: 'rlp-tag' }, t('modified')) : null,
                      isNew ? h('span', { className: 'rlp-tag warn' }, t('unsavedNew')) : h('span', null, used ? t('usedBy', { n: used }) : t('unused')))),
                  h('div', { className: 'rlp-head-actions' }, h(MoreMenu, { items: menu }))),
                conflict ? h('div', { className: 'rlp-banner', role: 'status' },
                  h('span', null, t('conflict')),
                  h('button', { type: 'button', className: 'rlp-btn sm', onClick: discard }, t('loadLatest'))) : null,
                h('div', { className: 'rlp-tabs', role: 'tablist', 'aria-label': t('role') }, tabs.map((item, i) => h('button', {
                  key: item.id, type: 'button', role: 'tab', className: 'rlp-tab', 'aria-selected': tab === item.id, tabIndex: tab === item.id ? 0 : -1,
                  onClick: () => ui.set({ tab: item.id }),
                  onKeyDown: e => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
                    e.preventDefault()
                    const nextTab = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
                    ui.set({ tab: tabs[nextTab].id })
                    e.currentTarget.parentElement.children[nextTab]?.focus()
                  },
                }, item.label,
                item.count !== undefined ? h('span', { className: 'rlp-count' }, item.count) : null,
                item.flag ? h('span', { className: 'rlp-err-dot', 'aria-hidden': true }) : null))),
                tab === 'prompt' ? h('div', { className: 'rlp-field', role: 'tabpanel' },
                  h('textarea', {
                    className: 'rlp-prompt', value: form.prompt, onChange: set('prompt'), placeholder: t('promptPlaceholder'),
                    spellCheck: false, 'aria-label': t('tabPrompt'), 'aria-invalid': (errors.prompt && (showErrors || !errors.prompt.required)) || undefined,
                  }),
                  h(FieldError, { error: errors.prompt, show: showErrors }),
                  h(Meter, { value: form.prompt.length, max: limits.prompt, hint: t('promptHint') })) : null,
                tab === 'skills' ? h('div', { className: 'rlp-skills', role: 'tabpanel' },
                  h(LocalSkills, { selected: form.localSkills ?? [], inlineNames: form.skills.map(s => s.name.trim()), onChange: localSkills => update({ localSkills }) }),
                  h('h3', { className: 'rlp-h3' }, t('inlineSkills')),
                  h('p', { className: 'rlp-hint' }, t('skillsHint')),
                  form.skills.length === 0 ? h('p', { className: 'rlp-hint' }, t('noSkills')) : null,
                  form.skills.map((skill, i) => h(SkillCard, {
                    key: skill.key, skill, errors, showErrors, limits,
                    open: openSkills.has(skill.key), onToggle: () => toggleSkill(skill.key),
                    onChange: next => update({ skills: form.skills.map((s, j) => j === i ? next : s) }),
                    onRemove: () => update({ skills: form.skills.filter((_, j) => j !== i) }),
                  })),
                  h('div', null, h('button', { type: 'button', className: 'rlp-btn sm', disabled: form.skills.length >= limits.skills, onClick: addSkill },
                    h(IconPlus, { size: 12 }), t('addSkill')))) : null,
                tab === 'preview' ? h('div', { className: 'rlp-field', role: 'tabpanel' }, h(Preview, { form, errors })) : null)),
            h('div', { className: 'rlp-bar' },
              h('span', { className: `rlp-bar-msg${message ? ` ${message.kind}` : ''}`, role: 'status', 'aria-live': 'polite' }, message?.text ?? ''),
              dirty ? h('span', { className: 'rlp-kbd' }, t('saveShortcut')) : null,
              h('button', { type: 'button', className: 'rlp-btn', disabled: busy || !dirty, onClick: discard }, isNew ? t('discardNew') : t('discard')),
              h('button', { type: 'button', className: 'rlp-btn primary', disabled: busy || !dirty, onClick: save },
                busy ? t('saving') : isNew ? t('create') : t('save'))))
        }

        function RolesPage() {
          useLocale()
          const { status, roles, sessions, error, limits, builtinMissing, builtinModified } = useRoles()
          const { selected, drafts, query } = useUi()
          const navSeq = React.useSyncExternalStore(navStore.subscribe, navStore.get)
          const [note, setNote] = React.useState(null)
          const searchRef = React.useRef(null)

          // A chip or menu click names the role to show.
          React.useEffect(() => { if (nav.roleId) ui.set({ selected: nav.roleId, query: '' }) }, [navSeq])

          const newKeys = Object.keys(drafts).filter(isNewKey)
          const exists = key => isNewKey(key) ? drafts[key] !== undefined : roles.some(r => r.id === key)
          React.useEffect(() => {
            if (status !== 'ready') return
            if (selected === null || !exists(selected)) ui.set({ selected: roles[0]?.id ?? newKeys[0] ?? null })
          })

          if (status === 'loading') return h('div', { className: 'rlp' }, h('style', null, PAGE_CSS), h('div', { className: 'rlp-blank' }, t('loading')))
          if (status === 'error') {
            return h('div', { className: 'rlp' }, h('style', null, PAGE_CSS),
              h('div', { className: 'rlp-blank' }, h('div', null,
                h('p', { className: 'rlp-err' }, t('loadFailed', { message: error })),
                h('button', { type: 'button', className: 'rlp-btn', onClick: () => store.reload() }, t('retry')))))
          }

          const usage = {}
          for (const id of Object.values(sessions)) usage[id] = (usage[id] ?? 0) + 1
          const needle = query.trim().toLocaleLowerCase()
          const matches = item => !needle || [item.name, item.description, ...item.skills.map(s => s.name), ...(item.localSkills ?? [])].join('\n').toLocaleLowerCase().includes(needle)
          const rows = [
            ...roles.map(role => ({ key: role.id, role, form: drafts[role.id]?.form ?? role })),
            ...newKeys.map(key => ({ key, role: null, form: drafts[key].form })),
          ].filter(row => matches(row.form))

          const newRole = () => {
            const key = `new:${++newSeq}`
            ui.setDraft(key, { form: { name: t('newRoleName'), icon: '🎭', description: '', prompt: '', skills: [], localSkills: [] }, baseAt: 0 })
            ui.set({ selected: key, tab: 'prompt', query: '' })
          }
          const restore = async () => {
            try {
              const r = await op({ action: 'restore_builtins' })
              setNote(t('restored', { n: r.restored.length }))
            } catch (e) {
              setNote(t('failed', { message: e.message }))
            }
          }
          const atLimit = roles.length + newKeys.length >= limits.roles

          const side = h('aside', { className: 'rlp-side', 'aria-label': t('panel') },
            h('div', { className: 'rlp-side-head' },
              h('h1', { className: 'rlp-h1' }, t('panel')),
              h('button', { type: 'button', className: 'rlp-btn sm', disabled: atLimit, onClick: newRole }, h(IconPlus, { size: 12 }), t('newRole'))),
            h('p', { className: 'rlp-intro' }, t('intro')),
            roles.length + newKeys.length > 6 || needle ? h('label', { className: 'rlp-search' },
              h(IconSearch),
              h('input', { ref: searchRef, type: 'search', value: query, placeholder: t('search'), 'aria-label': t('search'), onChange: e => ui.set({ query: e.target.value }) })) : null,
            h('ul', { className: 'rlp-list', role: 'list' },
              rows.length === 0 ? h('li', { className: 'rlp-empty' }, needle ? t('noMatches') : t('empty')) : null,
              rows.map(({ key, role, form }) => {
                const dirty = isNewKey(key) || (drafts[key] !== undefined && !sameForm(drafts[key].form, formOf(role)))
                const skills = form.skills.length + (form.localSkills?.length ?? 0)
                const meta = [skills ? t('skillsCount', { n: skills }) : null, usage[key] ? t('usedBy', { n: usage[key] }) : null].filter(Boolean).join(' · ')
                return h('li', { key },
                  h('button', { type: 'button', className: 'rlp-item', 'aria-current': key === selected, onClick: () => ui.set({ selected: key }) },
                    h('span', { className: 'rlp-item-icon', 'aria-hidden': true }, form.icon || '🎭'),
                    h('span', { className: 'rlp-item-body' },
                      h('span', { className: 'rlp-item-top' },
                        h('span', { className: 'rlp-item-name' }, form.name || t('namePlaceholder')),
                        usage[key] ? h('span', { className: 'rlp-live', title: t('usedBy', { n: usage[key] }) }) : null,
                        dirty ? h('span', { className: 'rlp-dot', title: isNewKey(key) ? t('unsavedNew') : t('unsaved') }) : null),
                      form.description ? h('span', { className: 'rlp-item-desc' }, form.description) : null,
                      meta ? h('span', { className: 'rlp-item-meta' }, meta) : null)))
              })),
            builtinMissing > 0 || note ? h('div', { className: 'rlp-side-foot' },
              note ? h('p', { className: 'rlp-hint', role: 'status' }, note) : null,
              builtinMissing > 0 ? h('button', { type: 'button', className: 'rlp-btn sm', onClick: restore }, t('restore', { n: builtinMissing })) : null) : null)

          const stored = selected && !isNewKey(selected) ? roles.find(r => r.id === selected) ?? null : null
          const editable = selected && (stored || (isNewKey(selected) && drafts[selected]))
          const main = editable
            ? h(RoleEditor, {
              key: selected, roleKey: selected, stored, roles, sessions, limits, builtinModified,
              onSaved: (id, message) => { ui.set({ selected: id }); setNote(message ?? null) },
              onDeleted: key => {
                const keys = rows.map(r => r.key)
                const at = keys.indexOf(key)
                ui.set({ selected: keys[at + 1] ?? keys[at - 1] ?? null })
              },
            })
            : h('div', { className: 'rlp-main' }, h('div', { className: 'rlp-blank' }, h('div', null,
              h('span', { className: 'rlp-blank-icon', 'aria-hidden': true }, '🎭'),
              h('p', { className: 'rlp-hint' }, t('empty')),
              h('button', { type: 'button', className: 'rlp-btn primary', onClick: newRole }, t('newRole')))))

          return h('section', { className: 'rlp', 'aria-label': t('panel') }, h('style', null, PAGE_CSS), side, main)
        }

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, RolesPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 40, locale: NS, label: () => t('panel'),
        }, IconRoles))

        // The Plugins page points to the panel instead of embedding a second editor.
        function ConfigLink() {
          useLocale()
          return h('div', { className: 'rlc' }, h('style', null, PAGE_CSS),
            h('p', null, t('configHint')),
            h('button', { type: 'button', className: 'rlp-btn', onClick: () => openManager() }, t('openManager')))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: KEY,
          locale: NS,
        }, ConfigLink))
      },
    }
  },
})
