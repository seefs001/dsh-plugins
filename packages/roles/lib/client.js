/**
 * dsh-roles — browser half.
 *
 * - A "Role" row in the composer's model menu (`conversation.input.model.options`)
 *   expands into the role list; picking one switches this session's role.
 * - A chip on the left of the composer shows the active role.
 * - The bundle's Plugins page (`plugins.bundle.config`) is the role manager:
 *   create, edit, duplicate, reorder and delete roles, with a detailed prompt
 *   and any number of skills per role.
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
    const PACKAGE = 'dsh-roles'

    const en = {
      role: 'Role',
      none: 'None',
      noneHint: 'No role: the agent keeps its usual behavior.',
      manage: 'Manage roles…',
      switchFailed: 'Could not switch role: {message}',
      chipTitle: 'Role for this session: {name}. Click to manage roles.',
      skillsCount: '{n} skills',
      title: 'Roles',
      hint: 'A role is a detailed prompt plus its own skills. Pick a role in the composer\'s model menu; it is added to that session\'s system prompt from the next step, and its skills join the session\'s skill catalog.',
      newRole: 'New role',
      restore: 'Restore built-in roles',
      restored: 'Restored {n} built-in roles.',
      nothingRestored: 'All built-in roles are present.',
      empty: 'No roles yet.',
      builtin: 'Built-in',
      name: 'Name',
      icon: 'Icon',
      description: 'Description',
      descriptionHint: 'Shown in the role list.',
      prompt: 'Prompt',
      promptHint: 'Detailed instructions: responsibilities, working method, output format, and when to load which skill.',
      skills: 'Skills',
      skillsHint: 'Loaded on demand through the skill tool, only in sessions using this role. Names are kebab-case and should not clash with other skills.',
      addSkill: 'Add skill',
      skillName: 'Name',
      skillDescription: 'Description',
      skillWhen: 'When to use',
      skillContent: 'Content (Markdown)',
      removeSkill: 'Remove skill',
      noSkills: 'No skills.',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved.',
      discard: 'Discard changes',
      duplicate: 'Duplicate',
      delete: 'Delete',
      deleteConfirm: 'Delete role "{name}"? Sessions using it go back to no role.',
      reset: 'Reset to built-in',
      resetConfirm: 'Restore "{name}" to the built-in text? Your edits are lost.',
      moveUp: 'Move up',
      moveDown: 'Move down',
      unsaved: 'Unsaved changes',
      leaveConfirm: 'Discard unsaved changes?',
      failed: 'Failed: {message}',
      loadFailed: 'Could not load roles: {message}',
      retry: 'Retry',
      usedBy: 'Used by {n} sessions',
      chars: '{n} characters',
      newRoleName: 'New role',
      newRolePrompt: 'You are now acting as …\n\n## Working method\n1. \n\n## Output format\n- ',
    }
    const zh = {
      role: '角色',
      none: '无',
      noneHint: '不使用角色：Agent 保持默认行为。',
      manage: '管理角色…',
      switchFailed: '切换角色失败：{message}',
      chipTitle: '本会话的角色：{name}。点击管理角色。',
      skillsCount: '{n} 个技能',
      title: '角色',
      hint: '角色由一段详细提示词和它自带的技能组成。在输入框的模型菜单里选择角色，从下一步起它会加入该会话的系统提示词，技能也会加入该会话的技能目录。',
      newRole: '新建角色',
      restore: '恢复内置角色',
      restored: '已恢复 {n} 个内置角色。',
      nothingRestored: '内置角色都在。',
      empty: '还没有角色。',
      builtin: '内置',
      name: '名称',
      icon: '图标',
      description: '简介',
      descriptionHint: '显示在角色列表里。',
      prompt: '提示词',
      promptHint: '详细说明：职责、工作方式、输出格式，以及什么时候加载哪个技能。',
      skills: '技能',
      skillsHint: '通过 skill 工具按需加载，只在使用这个角色的会话里出现。名称用 kebab-case，不要和其他技能重名。',
      addSkill: '添加技能',
      skillName: '名称',
      skillDescription: '描述',
      skillWhen: '何时使用',
      skillContent: '内容（Markdown）',
      removeSkill: '删除技能',
      noSkills: '没有技能。',
      save: '保存',
      saving: '保存中…',
      saved: '已保存。',
      discard: '放弃修改',
      duplicate: '复制',
      delete: '删除',
      deleteConfirm: '删除角色“{name}”？正在使用它的会话会回到无角色。',
      reset: '恢复内置内容',
      resetConfirm: '把“{name}”恢复为内置内容？你的修改会丢失。',
      moveUp: '上移',
      moveDown: '下移',
      unsaved: '有未保存的修改',
      leaveConfirm: '放弃未保存的修改？',
      failed: '失败：{message}',
      loadFailed: '无法加载角色：{message}',
      retry: '重试',
      usedBy: '{n} 个会话正在使用',
      chars: '{n} 字',
      newRoleName: '新角色',
      newRolePrompt: '你现在担任……\n\n## 工作方式\n1. \n\n## 输出格式\n- ',
    }

    // ── Shared store: one SSE stream while anything is mounted. ─────────────
    async function op(body) {
      const r = await fetch('roles/op', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
      })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      if (data?.roles) store.set({ status: 'ready', roles: data.roles, sessions: data.sessions ?? {}, error: null })
      return data
    }

    const store = {
      state: { status: 'loading', roles: [], sessions: {}, error: null },
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
          if (data && Array.isArray(data.roles)) store.set({ status: 'ready', roles: data.roles, sessions: data.sessions ?? {}, error: null })
        })
        es.addEventListener('error', () => {
          if (store.state.status === 'loading') {
            fetch('roles/state', { headers: { accept: 'application/json' } })
              .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(new Error(d?.message ?? `HTTP ${r.status}`)), () => Promise.reject(new Error(`HTTP ${r.status}`))))
              .then(d => store.set({ status: 'ready', roles: d.roles ?? [], sessions: d.sessions ?? {}, error: null }))
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
.rlm{--rlm-line:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);--rlm-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.rlm-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.rlm-hint,.rlm-note{color:var(--dsw-alias-label-secondary)}
.rlm-note.err{color:var(--dsw-alias-state-error-primary)}
.rlm-note.ok{color:var(--dsw-alias-state-success-primary)}
.rlm-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.rlm-body{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px;align-items:start}
@media (max-width:720px){.rlm-body{grid-template-columns:1fr}}
.rlm-side{display:flex;flex-direction:column;gap:2px;padding:4px;border:var(--rlm-line);border-radius:var(--dsw-radius-md,12px)}
.rlm-item{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:4px 8px;border:0;border-radius:var(--rlm-r);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.rlm-item:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.rlm-item[aria-current=true]{background:var(--dsw-alias-interactive-bg-selected,var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2)))}
.rlm-item:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:-2px}
.rlm-item-icon{flex:0 0 20px;text-align:center}
.rlm-item-text{display:flex;flex-direction:column;min-width:0;flex:1}
.rlm-item-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rlm-item-meta{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:11px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rlm-dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-warn-primary)}
.rlm-side-actions{display:flex;flex-direction:column;gap:6px;padding:6px 4px 2px}
.rlm-editor{display:flex;flex-direction:column;gap:12px;min-width:0}
.rlm-row{display:grid;grid-template-columns:96px minmax(0,1fr);gap:8px;align-items:start}
.rlm-row>span{padding-top:6px;color:var(--dsw-alias-label-secondary)}
@media (max-width:560px){.rlm-row{grid-template-columns:1fr}.rlm-row>span{padding-top:0}}
.rlm-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.rlm-sub{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:12px;line-height:18px}
.rlm input,.rlm textarea{box-sizing:border-box;width:100%;min-width:0;padding:5px 8px;border:var(--rlm-line);border-radius:var(--rlm-r);background:var(--dsw-alias-button-elevated-fill,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit}
.rlm input{height:32px}
.rlm input.rlm-icon{width:64px;text-align:center}
.rlm textarea{min-height:120px;padding:8px 10px;background:var(--dsw-alias-markdown-code-block,var(--dsw-alias-bg-layer-1));font:12px/1.6 "SF Mono","JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;resize:vertical}
.rlm textarea.rlm-prompt{min-height:280px}
.rlm input:focus-visible,.rlm textarea:focus-visible,.rlm-btn:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.rlm input:disabled,.rlm textarea:disabled{opacity:.6}
.rlm-section{display:flex;flex-direction:column;gap:10px;padding-top:14px;border-top:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1)}
.rlm-section-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rlm-skill{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:var(--rlm-line);border-radius:var(--dsw-radius-md,12px)}
.rlm-skill-head{display:flex;align-items:center;gap:8px}
.rlm-skill-head>button.rlm-fold{flex:1;display:flex;align-items:center;gap:6px;min-width:0;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.rlm-skill-name{font-family:"SF Mono","JetBrains Mono",ui-monospace,Menlo,monospace;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rlm-skill-desc{flex:1;min-width:0;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rlm-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.rlm-spacer{flex:1}
.rlm-btn{height:30px;padding:0 14px;border:var(--rlm-line);border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;white-space:nowrap;transition:background-color .15s}
.rlm-btn.sm{height:26px;padding:0 10px;font-size:12px}
.rlm-btn.icon{width:26px;height:26px;padding:0}
.rlm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.rlm-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}
.rlm-btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary)))}
.rlm-btn.danger{color:var(--dsw-alias-state-error-primary)}
.rlm-btn:disabled{opacity:.4;cursor:default}
.rlm-btn.wide{width:100%}
.rlm-tag{padding:0 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.15));color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px}
`

    function Chevron({ open }) {
      return h('svg', { className: 'rl-chev', 'data-open': open ? 'true' : 'false', viewBox: '0 0 12 12', 'aria-hidden': true },
        h('path', { d: 'M4.5 2.5 8 6l-3.5 3.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }
    function Check() {
      return h('svg', { className: 'rl-check', viewBox: '0 0 14 14', 'aria-hidden': true },
        h('path', { d: 'M3 7.2 5.8 10 11 4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }

    const roleLabel = role => `${role.icon ? `${role.icon} ` : ''}${role.name}`

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'roles: dictionaries')
        const t = ctx.locale.bind(NS)
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const openManager = () => ctx.get('pluginNavigation')?.openBundle(PACKAGE)

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
                onClick: () => { dismiss(); openManager() },
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
          return h('button', { type: 'button', className: 'rl-chip', title, 'aria-label': title, onClick: openManager },
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

        // ── Role manager (Plugins page) ───────────────────────────────────
        const draftOf = role => ({
          name: role.name, icon: role.icon, description: role.description, prompt: role.prompt,
          skills: role.skills.map((s, i) => ({ key: `${role.id}:${i}:${s.name}`, name: s.name, description: s.description, whenToUse: s.whenToUse ?? '', content: s.content })),
        })
        const payloadOf = draft => ({
          name: draft.name, icon: draft.icon, description: draft.description, prompt: draft.prompt,
          skills: draft.skills.map(({ key: _key, ...s }) => ({ ...s, ...(s.whenToUse.trim() ? {} : { whenToUse: undefined }) })),
        })
        const sameDraft = (a, b) => JSON.stringify(payloadOf(a)) === JSON.stringify(payloadOf(b))
        let skillSeq = 0

        function SkillEditor({ skill, onChange, onRemove, disabled }) {
          const [open, setOpen] = React.useState(skill.name === '')
          const set = field => e => onChange({ ...skill, [field]: e.target.value })
          return h('div', { className: 'rlm-skill' },
            h('div', { className: 'rlm-skill-head' },
              h('button', { type: 'button', className: 'rlm-fold', 'aria-expanded': open, onClick: () => setOpen(!open) },
                h(Chevron, { open }),
                h('span', { className: 'rlm-skill-name' }, skill.name || '—'),
                h('span', { className: 'rlm-skill-desc' }, skill.description)),
              h('button', { type: 'button', className: 'rlm-btn sm danger', disabled, onClick: onRemove }, t('removeSkill'))),
            open ? h(React.Fragment, null,
              h('label', { className: 'rlm-row' }, h('span', null, t('skillName')),
                h('input', { value: skill.name, onChange: set('name'), disabled, placeholder: 'review-checklist', spellCheck: false })),
              h('label', { className: 'rlm-row' }, h('span', null, t('skillDescription')),
                h('input', { value: skill.description, onChange: set('description'), disabled })),
              h('label', { className: 'rlm-row' }, h('span', null, t('skillWhen')),
                h('input', { value: skill.whenToUse, onChange: set('whenToUse'), disabled })),
              h('label', { className: 'rlm-row' }, h('span', null, t('skillContent')),
                h('div', { className: 'rlm-field' },
                  h('textarea', { value: skill.content, onChange: set('content'), disabled, spellCheck: false, rows: 12 }),
                  h('span', { className: 'rlm-sub' }, t('chars', { n: skill.content.length }))))) : null)
        }

        function Manager() {
          useLocale()
          const { status, roles, sessions, error } = useRoles()
          const [selectedId, setSelectedId] = React.useState(null)
          const [draft, setDraft] = React.useState(null)
          const [notice, setNotice] = React.useState({ kind: 'idle' })
          const [busy, setBusy] = React.useState(false)

          const selected = roles.find(r => r.id === selectedId) ?? null
          const dirty = selected !== null && draft !== null && !sameDraft(draft, draftOf(selected))

          // Follow the first role, and reload the draft when the stored role changes and the user has no edits.
          React.useEffect(() => {
            if (status !== 'ready') return
            if (selected === null) {
              const first = roles[0] ?? null
              setSelectedId(first?.id ?? null)
              setDraft(first ? draftOf(first) : null)
            }
          }, [status, roles, selected])
          const lastStored = React.useRef(null)
          React.useEffect(() => {
            if (selected === null) return
            const prev = lastStored.current
            lastStored.current = selected
            if (prev !== null && prev.id === selected.id && prev !== selected && draft !== null && sameDraft(draft, draftOf(prev))) {
              setDraft(draftOf(selected))
            }
          }, [selected, draft])

          const guard = () => !dirty || window.confirm(t('leaveConfirm'))
          const choose = role => {
            if (role.id === selectedId || !guard()) return
            setSelectedId(role.id)
            setDraft(draftOf(role))
            setNotice({ kind: 'idle' })
          }
          const act = async (body, after) => {
            setBusy(true)
            setNotice({ kind: 'idle' })
            try {
              const result = await op(body)
              after?.(result)
            } catch (e) {
              setNotice({ kind: 'err', text: t('failed', { message: e.message }) })
            } finally {
              setBusy(false)
            }
          }
          const focusRole = id => {
            const role = store.get().roles.find(r => r.id === id)
            setSelectedId(id)
            setDraft(role ? draftOf(role) : null)
          }

          if (status === 'loading') return h('div', { className: 'rlm' }, h('style', null, PAGE_CSS), h('div', { className: 'rlm-note' }, '…'))
          if (status === 'error') {
            return h('div', { className: 'rlm' }, h('style', null, PAGE_CSS),
              h('div', { className: 'rlm-note err' }, t('loadFailed', { message: error })),
              h('div', null, h('button', { type: 'button', className: 'rlm-btn', onClick: () => store.reload() }, t('retry'))))
          }

          const usage = {}
          for (const id of Object.values(sessions)) usage[id] = (usage[id] ?? 0) + 1
          const index = selected ? roles.indexOf(selected) : -1
          const set = field => e => { setDraft({ ...draft, [field]: e.target.value }); setNotice({ kind: 'idle' }) }
          const setSkill = (i, skill) => { setDraft({ ...draft, skills: draft.skills.map((s, j) => j === i ? skill : s) }); setNotice({ kind: 'idle' }) }

          const side = h('div', { className: 'rlm-side' },
            roles.length === 0 ? h('div', { className: 'rlm-note', style: { padding: '8px' } }, t('empty')) : null,
            roles.map(role => h('button', {
              key: role.id, type: 'button', className: 'rlm-item', 'aria-current': role.id === selectedId, onClick: () => choose(role),
            },
              h('span', { className: 'rlm-item-icon' }, role.icon),
              h('span', { className: 'rlm-item-text' },
                h('span', { className: 'rlm-item-name' }, role.name),
                h('span', { className: 'rlm-item-meta' },
                  [role.skills.length ? t('skillsCount', { n: role.skills.length }) : null, usage[role.id] ? t('usedBy', { n: usage[role.id] }) : null].filter(Boolean).join(' · ') || role.description)),
              role.id === selectedId && dirty ? h('span', { className: 'rlm-dot', title: t('unsaved') }) : null)),
            h('div', { className: 'rlm-side-actions' },
              h('button', {
                type: 'button', className: 'rlm-btn sm wide', disabled: busy,
                onClick: () => guard() && act({ action: 'create', role: { name: t('newRoleName'), icon: '🎭', prompt: t('newRolePrompt'), skills: [] } }, r => focusRole(r.roleId)),
              }, t('newRole')),
              h('button', {
                type: 'button', className: 'rlm-btn sm wide', disabled: busy,
                onClick: () => act({ action: 'restore_builtins' }, r => setNotice({ kind: 'ok', text: r.restored.length ? t('restored', { n: r.restored.length }) : t('nothingRestored') })),
              }, t('restore'))))

          const editor = selected === null || draft === null ? h('div', { className: 'rlm-editor' }, h('div', { className: 'rlm-note' }, t('empty'))) : h('div', { className: 'rlm-editor' },
            h('div', { className: 'rlm-actions' },
              h('h4', { className: 'rlm-title' }, roleLabel(selected)),
              selected.builtin ? h('span', { className: 'rlm-tag' }, t('builtin')) : null,
              h('span', { className: 'rlm-spacer' }),
              h('button', { type: 'button', className: 'rlm-btn sm icon', title: t('moveUp'), 'aria-label': t('moveUp'), disabled: busy || index <= 0,
                onClick: () => act({ action: 'move', roleId: selected.id, beforeRoleId: roles[index - 1].id }) }, '↑'),
              h('button', { type: 'button', className: 'rlm-btn sm icon', title: t('moveDown'), 'aria-label': t('moveDown'), disabled: busy || index >= roles.length - 1,
                onClick: () => act({ action: 'move', roleId: selected.id, beforeRoleId: roles[index + 2]?.id }) }, '↓'),
              h('button', { type: 'button', className: 'rlm-btn sm', disabled: busy,
                onClick: () => guard() && act({ action: 'duplicate', roleId: selected.id }, r => focusRole(r.roleId)) }, t('duplicate')),
              selected.builtin ? h('button', { type: 'button', className: 'rlm-btn sm', disabled: busy,
                onClick: () => window.confirm(t('resetConfirm', { name: selected.name })) && act({ action: 'reset', roleId: selected.id }, r => focusRole(r.roleId)) }, t('reset')) : null,
              h('button', { type: 'button', className: 'rlm-btn sm danger', disabled: busy,
                onClick: () => window.confirm(t('deleteConfirm', { name: selected.name })) && act({ action: 'delete', roleId: selected.id }, () => { setSelectedId(null); setDraft(null) }) }, t('delete'))),
            h('label', { className: 'rlm-row' }, h('span', null, t('name')),
              h('div', { className: 'rlm-actions', style: { flexWrap: 'nowrap' } },
                h('input', { className: 'rlm-icon', value: draft.icon, onChange: set('icon'), disabled: busy, 'aria-label': t('icon'), placeholder: '🎭' }),
                h('input', { value: draft.name, onChange: set('name'), disabled: busy, 'aria-label': t('name') }))),
            h('label', { className: 'rlm-row' }, h('span', null, t('description')),
              h('div', { className: 'rlm-field' },
                h('input', { value: draft.description, onChange: set('description'), disabled: busy }),
                h('span', { className: 'rlm-sub' }, t('descriptionHint')))),
            h('label', { className: 'rlm-row' }, h('span', null, t('prompt')),
              h('div', { className: 'rlm-field' },
                h('textarea', { className: 'rlm-prompt', value: draft.prompt, onChange: set('prompt'), disabled: busy, spellCheck: false }),
                h('span', { className: 'rlm-sub' }, `${t('promptHint')} ${t('chars', { n: draft.prompt.length })}`))),
            h('div', { className: 'rlm-section' },
              h('div', { className: 'rlm-section-head' },
                h('h4', { className: 'rlm-title' }, `${t('skills')} (${draft.skills.length})`),
                h('button', { type: 'button', className: 'rlm-btn sm', disabled: busy,
                  onClick: () => setDraft({ ...draft, skills: [...draft.skills, { key: `new:${++skillSeq}`, name: '', description: '', whenToUse: '', content: '' }] }) }, t('addSkill'))),
              h('div', { className: 'rlm-hint' }, t('skillsHint')),
              draft.skills.length === 0 ? h('div', { className: 'rlm-note' }, t('noSkills')) : null,
              draft.skills.map((skill, i) => h(SkillEditor, {
                key: skill.key, skill, disabled: busy,
                onChange: next => setSkill(i, next),
                onRemove: () => setDraft({ ...draft, skills: draft.skills.filter((_, j) => j !== i) }),
              }))),
            h('div', { className: 'rlm-actions' },
              h('button', { type: 'button', className: 'rlm-btn primary', disabled: busy || !dirty,
                onClick: () => act({ action: 'update', roleId: selected.id, role: payloadOf(draft) }, r => { focusRole(r.roleId); setNotice({ kind: 'ok', text: t('saved') }) }) },
              busy ? t('saving') : t('save')),
              h('button', { type: 'button', className: 'rlm-btn', disabled: busy || !dirty, onClick: () => { setDraft(draftOf(selected)); setNotice({ kind: 'idle' }) } }, t('discard')),
              dirty && notice.kind === 'idle' ? h('span', { className: 'rlm-note warn' }, t('unsaved')) : null,
              notice.kind === 'ok' ? h('span', { className: 'rlm-note ok' }, notice.text) : null,
              notice.kind === 'err' ? h('span', { className: 'rlm-note err' }, notice.text) : null))

          return h('div', { className: 'rlm' },
            h('style', null, PAGE_CSS),
            h('h4', { className: 'rlm-title' }, t('title')),
            h('div', { className: 'rlm-hint' }, t('hint')),
            h('div', { className: 'rlm-body' }, side, editor))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: KEY,
          locale: NS,
        }, Manager))
      },
    }
  },
})
