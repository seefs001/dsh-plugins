window.__ModuleLoader__.load({
  id: 'dsh-roles',
  chunk: 'client.page.js',
  factory(require) {
    const React = require('react')
    const {
      Button, Checkbox, CodeBlock, Input, Modal, PathLabel, SegmentedTabs, StateDot, Tag,
      IconChevronRightOutlineRegular, IconCloseOutlineRegular,
      IconEllipsisOutlineRegular, IconPlusOutlineRegular, IconRefreshOutlineRegular,
      IconSearchOutlineRegular, IconTrashOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement

    const PAGE_CSS = `
.rlp-page{--rlp-mono:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);container-type:inline-size;height:100%;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.rlp-page *,.rlp-page *::before,.rlp-page *::after{box-sizing:border-box}
.rlp-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.rlp-inner{display:flex;flex-direction:column;gap:20px;width:100%;max-width:calc(960px + 2 * clamp(24px,4vw,48px));margin:0 auto;padding:28px clamp(24px,4vw,48px) 48px}
[data-platform=darwin] .rlp-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.rlp-inner{padding:20px 20px 48px}[data-platform=darwin] .rlp-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.rlp-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.rlp-head-copy{display:flex;flex-direction:column;gap:4px;flex:1 1 280px;min-width:0}
.rlp-h1{margin:0;font-size:20px;line-height:28px;font-weight:500}
.rlp-note{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;overflow-wrap:anywhere}
.rlp-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:none}
.rlp-hub{display:grid;grid-template-columns:minmax(236px,276px) minmax(0,1fr);gap:20px;align-items:start}
@container (max-width:760px){.rlp-hub{grid-template-columns:minmax(0,1fr)}}
.rlp-rail{display:flex;flex-direction:column;gap:10px;min-width:0;position:sticky;top:16px}
@container (max-width:760px){.rlp-rail{position:static}}
.rlp-chips{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.rlp-chip{display:inline-flex;align-items:center;gap:4px;height:25px;padding:0 9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;cursor:pointer;transition:background-color .15s,border-color .15s,color .15s}
@media (hover:hover){.rlp-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.rlp-chip[aria-pressed=true]{background:var(--dsw-specific-sidebar-nav-item-active);border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);font-weight:500}
.rlp-chip-n{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.rlp-list{display:flex;flex-direction:column;gap:4px;list-style:none;margin:0;padding:0;max-height:calc(100dvh - 260px);overflow-y:auto}
@container (max-width:760px){.rlp-list{max-height:300px}}
.rlp-item{display:flex;align-items:flex-start;gap:10px;width:100%;padding:9px 10px;border:.5px solid transparent;border-radius:var(--dsw-radius-md,12px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .15s,border-color .15s}
@media (hover:hover){.rlp-item:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-item[aria-current=true]{background:var(--dsw-specific-sidebar-nav-item-active)}
.rlp-item-icon{flex:0 0 30px;height:30px;display:grid;place-items:center;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-module-platform);font-size:16px;line-height:1}
.rlp-item-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.rlp-item-top{display:flex;align-items:center;gap:6px;min-width:0}
.rlp-item-name{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;font-size:13px;line-height:18px}
.rlp-item-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px}
.rlp-item-meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rlp-stack{display:flex;flex-direction:column;gap:14px;min-width:0;border:0;margin:0;padding:0}
.rlp-hero{display:flex;flex-direction:column;gap:12px;padding:16px 18px;border-radius:var(--dsw-radius-xl,16px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-card-fill);min-width:0}
.rlp-hero-top{display:flex;align-items:flex-start;gap:14px}
.rlp-icon-btn{flex:none;width:52px;height:52px;display:grid;place-items:center;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,16px);background:var(--dsw-alias-bg-base);font-size:26px;line-height:1;cursor:pointer;transition:background-color .15s,border-color .15s}
@media (hover:hover){.rlp-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-titles{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px}
.rlp-badges{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.rlp-dirty{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 12px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-state-warn-tertiary);border:.5px solid var(--dsw-alias-state-warn-secondary);font-size:12px}
.rlp-dirty[data-tone=err]{background:var(--dsw-alias-interactive-bg-hover-danger);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,transparent);color:var(--dsw-alias-state-error-primary)}
.rlp-dirty[data-tone=ok]{background:var(--dsw-alias-state-success-tertiary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 30%,transparent);color:var(--dsw-alias-state-success-primary)}
.rlp-dirty-msg{flex:1 1 auto;min-width:0;font-weight:500}
.rlp-kbd{color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}
.rlp-banner{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l1);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.rlp-banner[data-tone=warn]{border-color:var(--dsw-alias-state-warn-secondary);background:var(--dsw-alias-state-warn-tertiary)}
.rlp-banner[data-tone=warn]>svg{color:var(--dsw-alias-state-warn-primary)}
.rlp-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,transparent);background:var(--dsw-alias-interactive-bg-hover-danger)}
.rlp-banner>svg{flex:none}
.rlp-banner-text{flex:1;min-width:0;overflow-wrap:anywhere}
.rlp-box{display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:var(--dsw-radius-xl,16px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-card-fill);min-width:0}
.rlp-box-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.rlp-box-title{display:flex;align-items:center;gap:8px;min-width:0}
.rlp-box-title h3{margin:0;font-size:14px;line-height:20px;font-weight:500}
.rlp-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.rlp-field>label,.rlp-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.rlp-page textarea{width:100%;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:12.5px/1.65 var(--rlp-mono);resize:vertical;tab-size:2}
.rlp-page textarea:focus{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary))}
.rlp-page textarea[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}
.rlp-page textarea.rlp-prompt{min-height:max(300px,calc(100dvh - 420px))}
.rlp-err{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.rlp-meter{display:flex;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.rlp-meter b{font-weight:400;font-variant-numeric:tabular-nums}
.rlp-meter b.over{color:var(--dsw-alias-state-error-primary)}
.rlp-ref-pills{display:flex;flex-wrap:wrap;gap:6px}
.rlp-ref-pill{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 6px 0 9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-module-platform);font:12px/18px var(--rlp-mono);color:var(--dsw-alias-label-primary)}
.rlp-ref-pill[data-missing=true]{border-color:var(--dsw-alias-state-warn-secondary);background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-primary)}
.rlp-ref-x{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:0;border-radius:999px;background:transparent;color:inherit;cursor:pointer;opacity:.7}
@media (hover:hover){.rlp-ref-x:hover{opacity:1;background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-local-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}
.rlp-local-tools .rlp-field{flex:1 1 200px}
.rlp-local-list{max-height:280px;overflow:auto;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-base)}
.rlp-local-option{display:flex;align-items:flex-start;gap:10px;padding:9px 12px;border-top:.5px solid var(--dsw-alias-border-l1)}
.rlp-local-option:first-child{border-top:0}
@media (hover:hover){.rlp-local-option:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-local-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.rlp-local-name{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font:12px/18px var(--rlp-mono)}
.rlp-skill{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-base);overflow:hidden}
.rlp-skill[data-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}
.rlp-skill-head{display:flex;align-items:center;gap:6px;padding:6px 8px 6px 6px}
.rlp-skill-fold{flex:1;display:flex;align-items:center;gap:8px;min-width:0;height:30px;padding:0 6px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
@media (hover:hover){.rlp-skill-fold:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-skill-name{flex:none;max-width:42%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:12px/18px var(--rlp-mono);font-weight:500}
.rlp-skill-name.placeholder{color:var(--dsw-alias-label-tertiary);font-weight:400}
.rlp-skill-desc{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px}
.rlp-skill-body{display:flex;flex-direction:column;gap:12px;padding:12px 14px 14px;border-top:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-module-platform)}
.rlp-skill-body textarea{min-height:200px}
.rlp-row2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:12px}
@container (max-width:600px){.rlp-row2{grid-template-columns:1fr}}
.rlp-cat{display:flex;flex-direction:column;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-base);overflow:hidden}
.rlp-cat-row{padding:9px 12px;font-size:12px;line-height:18px;border-top:.5px solid var(--dsw-alias-border-l1)}
.rlp-cat-row:first-child{border-top:0}
.rlp-cat-row code{font-family:var(--rlp-mono)}
.rlp-pop-anchor{position:relative}
.rlp-pop{position:absolute;z-index:20;top:calc(100% + 6px);min-width:180px;max-width:calc(100vw - 24px);padding:4px;border:0;border-radius:var(--dsw-radius-lg,16px);background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-2));backdrop-filter:var(--dsw-menu-backdrop-filter);-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent)}
@media (max-width:768px),(pointer:coarse){.rlp-pop{background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-base));backdrop-filter:none;-webkit-backdrop-filter:none}}
.rlp-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.rlp-pop.right{right:0}
.rlp-pop.left{left:0}
.rlp-menu-item{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 10px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;white-space:nowrap}
@media (hover:hover){.rlp-menu-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-menu-item:disabled{opacity:.4;cursor:default}
.rlp-menu-item.danger{color:var(--dsw-alias-state-error-primary)}
@media (hover:hover){.rlp-menu-item.danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,var(--dsw-alias-interactive-bg-hover))}}
.rlp-menu-sep{height:.5px;margin:4px 6px;background:var(--dsw-alias-border-l1)}
.rlp-emoji{width:min(264px,calc(100vw - 32px));max-width:calc(100vw - 32px);padding:8px}
.rlp-emoji-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px}
.rlp-emoji-grid button{height:30px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;font-size:18px;line-height:1;cursor:pointer}
@media (hover:hover){.rlp-emoji-grid button:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.rlp-emoji-grid button[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover))}
.rlp-emoji-custom{margin-top:8px}
.rlp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 20px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:14px}
.rlp-empty p{margin:0}
.rlp-danger-text{color:var(--dsw-alias-state-error-primary)}
.rlp-danger-fill{--dsw-alias-button-primary-fill:var(--dsw-alias-state-error-primary);--dsw-alias-button-primary-hover:var(--dsw-alias-state-error-primary);--dsw-alias-label-primary-foreground:var(--dsw-alias-label-on-color,#fff);color:var(--dsw-alias-label-on-color,#fff)}
.rlp-mono-input input{font-family:var(--rlp-mono);font-size:12.5px}
@media (pointer:coarse){.rlp-page textarea{font-size:16px}}
`

    const EMOJIS = ['🎭', '🔍', '🏛️', '🐛', '✍️', '🧪', '🛡️', '⚙️', '🚀', '📐', '🧭', '🧠', '📊', '🗂️', '🎨', '🧹', '🔧', '📝', '💡', '🤖', '👩‍💻', '🧑‍🏫', '🕵️', '⚖️', '📚', '🌐', '🔒', '⏱️', '🧩', '📦', '🎯', '🦉']
    const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

    function createRolesPage({ ctx, t, useLocale, store, useRoles, op, nav, navStore, styleRef }) {
      const ensurePageStyles = () => {
        if (styleRef.page || typeof document === 'undefined' || !document.head) return
        styleRef.page = document.createElement('style')
        styleRef.page.textContent = PAGE_CSS
        document.head.append(styleRef.page)
      }
        const formOf = role => ({
          name: role.name, icon: role.icon, description: role.description, prompt: role.prompt,
          localSkills: role.localSkills ?? [],
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
          state: { selected: null, drafts: {}, tab: 'prompt', query: '', filter: 'all' },
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

        const isDirty = (key, roles) => {
          const draft = ui.state.drafts[key]
          if (!draft) return false
          if (isNewKey(key)) return true
          const role = roles.find(r => r.id === key)
          return !role || !sameForm(draft.form, formOf(role))
        }
      const warn = e => {
        const { roles } = store.get()
        if (Object.keys(ui.state.drafts).some(key => isDirty(key, roles))) { e.preventDefault(); e.returnValue = '' }
      }
      if (typeof window !== 'undefined') window.addEventListener('beforeunload', warn)
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

        function usePopover() {
          const [open, setOpen] = React.useState(false)
          const ref = React.useRef(null)
          React.useEffect(() => {
            if (!open) return undefined
            const down = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
            const key = e => {
              if (!e.isComposing && e.keyCode !== 229 && e.key === 'Escape') {
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
              h(Input, {
                className: 'rlp-emoji-custom',
                value, placeholder: t('iconCustom'), 'aria-label': t('iconCustom'), maxLength: 8,
                onChange: e => onChange(e.target.value),
                onKeyDown: e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) pop.setOpen(false) },
              })) : null)
        }

        function MoreMenu({ items }) {
          const pop = usePopover()
          return h('div', { className: 'rlp-pop-anchor', ref: pop.ref },
            h(Button, {
              size: 'sm', variant: 'ghost',
              icon: h(IconEllipsisOutlineRegular, { size: 15 }),
              title: t('more'), 'aria-label': t('more'),
              'aria-haspopup': 'menu', 'aria-expanded': pop.open,
              onClick: () => pop.setOpen(!pop.open),
            }),
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
          return h('div', { className: 'rlp-skill', 'data-invalid': invalid || undefined },
            h('div', { className: 'rlp-skill-head' },
              h('button', { type: 'button', className: 'rlp-skill-fold', 'aria-expanded': open, onClick: onToggle },
                h('span', { className: 'rl-chev', 'data-open': open ? 'true' : 'false' }, h(IconChevronRightOutlineRegular, { size: 12 })),
                invalid ? h(StateDot, { state: 'error', size: 7 }) : null,
                h('span', { className: `rlp-skill-name${skill.name ? '' : ' placeholder'}` }, skill.name || t('untitledSkill')),
                h('span', { className: 'rlp-skill-desc' }, skill.description)),
              h(Button, {
                size: 'sm', variant: 'ghost', className: 'rlp-danger-text',
                icon: h(IconTrashOutlineRegular, { size: 13 }),
                title: t('removeSkill'), 'aria-label': `${t('removeSkill')} ${skill.name}`,
                onClick: onRemove,
              })),
            open ? h('div', { className: 'rlp-skill-body' },
              h('div', { className: 'rlp-row2' },
                h('div', { className: 'rlp-field' },
                  h('label', { htmlFor: id('name') }, t('skillName')),
                  h(Input, { id: id('name'), className: 'rlp-mono-input', value: skill.name, onChange: set('name'), placeholder: 'review-checklist', spellCheck: false, autoComplete: 'off', 'aria-invalid': shown('name') || undefined }),
                  shown('name') ? h(FieldError, { error: err('name'), show: showErrors }) : h('p', { className: 'rlp-note' }, t('skillNameHint'))),
                h('div', { className: 'rlp-field' },
                  h('label', { htmlFor: id('description') }, t('skillDescription')),
                  h(Input, { id: id('description'), value: skill.description, onChange: set('description'), 'aria-invalid': shown('description') || undefined }),
                  shown('description') ? h(FieldError, { error: err('description'), show: showErrors }) : h('p', { className: 'rlp-note' }, t('skillDescriptionHint')))),
              h('div', { className: 'rlp-field' },
                h('label', { htmlFor: id('whenToUse') }, t('skillWhen')),
                h(Input, { id: id('whenToUse'), value: skill.whenToUse, onChange: set('whenToUse'), placeholder: t('skillWhenHint'), 'aria-invalid': shown('whenToUse') || undefined }),
                h(FieldError, { error: err('whenToUse'), show: showErrors })),
              h('div', { className: 'rlp-field' },
                h('label', { htmlFor: id('content') }, t('skillContent')),
                h('textarea', { id: id('content'), value: skill.content, onChange: set('content'), spellCheck: false, rows: 12, 'aria-invalid': shown('content') || undefined }),
                h(FieldError, { error: err('content'), show: showErrors }),
                h(Meter, { value: skill.content.length, max: limits.skillContent, hint: t('skillContentHint') }))) : null)
        }

        function LocalSkills({ selected, inlineNames, onChange }) {
          const [cwd, setCwd] = React.useState('')
          const [query, setQuery] = React.useState('')
          const [browsing, setBrowsing] = React.useState(false)
          const [catalog, setCatalog] = React.useState({ status: 'loading', skills: [] })
          const sequence = React.useRef(0)

          const workspacePaths = React.useMemo(() => {
            const items = ctx.get('workspaces')?.list?.getSnapshot?.()?.items ?? []
            return [...new Set(items.map(w => w.path).filter(Boolean))]
          }, [])

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

          return h('section', { className: 'rlp-box', 'aria-label': t('localSkills') },
            h('div', { className: 'rlp-box-head' },
              h('div', { className: 'rlp-box-title' },
                h('h3', null, t('localSkills')),
                h(Tag, { tone: 'neutral' }, `${selected.length} / 20`)),
              h(Button, {
                size: 'sm', variant: browsing ? 'outline' : 'ghost',
                'aria-expanded': browsing,
                onClick: () => setBrowsing(v => !v),
              }, t(browsing ? 'localHide' : 'localBrowse'))),
            h('p', { className: 'rlp-note' }, t('localHint')),
            selected.length > 0
              ? h('div', { className: 'rlp-ref-pills' }, selected.map(name => {
                const isMissing = catalog.status === 'ready' && !known.has(name)
                return h('span', { key: name, className: 'rlp-ref-pill', 'data-missing': isMissing || undefined, title: isMissing ? t('localMissing') : name },
                  isMissing ? h(StateDot, { state: 'warning', size: 6 }) : null,
                  name,
                  h('button', {
                    type: 'button', className: 'rlp-ref-x',
                    'aria-label': t('removeRef', { name }),
                    onClick: () => toggle(name),
                  }, h(IconCloseOutlineRegular, { size: 11 })))
              }))
              : h('p', { className: 'rlp-note' }, t('localSelectedEmpty')),
            browsing ? h(React.Fragment, null,
              h('div', { className: 'rlp-local-tools' },
                h('div', { className: 'rlp-field' },
                  h('span', { className: 'rlp-label' }, t('localCwd')),
                  h(Input, {
                    className: 'rlp-mono-input',
                    'aria-label': t('localCwd'),
                    value: cwd, placeholder: workspacePaths[0] || '/path/to/project',
                    list: workspacePaths.length ? 'rlp-workspace-paths' : undefined,
                    onChange: e => setCwd(e.target.value),
                    onKeyDown: e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void load() } },
                  })),
                workspacePaths.length ? h('datalist', { id: 'rlp-workspace-paths' }, workspacePaths.map(p => h('option', { key: p, value: p }))) : null,
                h(Button, {
                  size: 'sm', variant: 'outline',
                  icon: catalog.status === 'loading' ? h(StateDot, { state: 'ongoing', size: 12 }) : h(IconRefreshOutlineRegular, { size: 13 }),
                  disabled: catalog.status === 'loading',
                  onClick: () => void load(),
                }, t('localLoad'))),
              h(Input, {
                type: 'search',
                icon: h(IconSearchOutlineRegular, { size: 14 }),
                value: query, placeholder: t('localSearch'), 'aria-label': t('localSearch'),
                onChange: e => setQuery(e.target.value),
              }),
              catalog.error ? h('p', { className: 'rlp-err', role: 'alert' }, t('failed', { message: catalog.error })) : null,
              catalog.complete === false ? h('p', { className: 'rlp-note' }, t('localPartial')) : null,
              rows.length ? h('div', { className: 'rlp-local-list' }, rows.map(skill => {
                const checked = selected.includes(skill.name)
                const disabled = !checked && (selected.length >= 20 || inlineNames.includes(skill.name))
                return h('div', { key: skill.name, className: 'rlp-local-option' },
                  h(Checkbox, { checked, disabled, label: h('span', { className: 'rlp-sr-only' }, skill.name), onChange: () => toggle(skill.name) }),
                  h('div', { className: 'rlp-local-body' },
                    h('span', { className: 'rlp-local-name' },
                      h('strong', null, skill.name),
                      skill.missing && catalog.status === 'ready' ? h(Tag, { tone: 'warning' }, t('localMissing')) : null),
                    skill.description ? h('span', { className: 'rlp-note' }, skill.description) : null,
                    skill.path ? h(PathLabel, { path: skill.path }) : null))
              })) : catalog.status === 'ready' ? h('p', { className: 'rlp-note' }, t('localEmpty')) : null,
              selected.length >= 20 ? h('p', { className: 'rlp-note' }, t('localLimit')) : null) : null)
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
          if (blocked) return h('div', { className: 'rlp-empty' }, h('p', null, t('previewInvalid')))
          const skills = payloadOf(form).skills
          const toolbarLabels = { copy: t('copy'), copied: t('copied'), wrap: t('wrap'), unwrap: t('unwrap') }
          return h('div', { className: 'rlp-stack' },
            h('p', { className: 'rlp-note' }, t('previewHint')),
            state.status === 'error'
              ? h('p', { className: 'rlp-err', role: 'alert' }, t('failed', { message: state.message }))
              : h(CodeBlock, {
                code: state.status === 'ready' ? state.prompt : t('previewLoading'),
                lang: 'markdown',
                copyLabel: t('copy'),
                copiedLabel: t('copied'),
                toolbarLabels,
              }),
            form.localSkills?.length ? h('section', { className: 'rlp-box' },
              h('div', { className: 'rlp-box-title' }, h('h3', null, t('localSkills'))),
              h('div', { className: 'rlp-ref-pills' }, form.localSkills.map(name => h(Tag, { key: name, tone: 'neutral' }, name)))) : null,
            skills.length ? h('section', { className: 'rlp-box' },
              h('div', { className: 'rlp-box-title' }, h('h3', null, t('previewSkills')), h(Tag, { tone: 'neutral' }, skills.length)),
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

          const [confirmState, setConfirmState] = React.useState(null)
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
              onClick: () => setConfirmState({
                title: t('reset'),
                description: t('resetConfirm', { name: stored.name }),
                confirmLabel: t('reset'),
                danger: false,
                onConfirm: () => run({ action: 'reset', roleId: stored.id }, () => ui.setDraft(roleKey, undefined)),
              }) }] : []),
            '-',
            isNew
              ? { label: t('discardNew'), danger: true, onClick: discard }
              : { label: t('delete'), danger: true, disabled: busy,
                onClick: () => setConfirmState({
                  title: t('delete'),
                  description: used ? t('deleteConfirmUsed', { name: stored.name, n: used }) : t('deleteConfirm', { name: stored.name }),
                  confirmLabel: t('delete'),
                  danger: true,
                  onConfirm: () => run({ action: 'delete', roleId: stored.id }, () => { ui.setDraft(roleKey, undefined); onDeleted(roleKey) }),
                }) },
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

          const totalSkills = form.skills.length + (form.localSkills?.length ?? 0)
          const promptErr = Boolean(errors.prompt && (showErrors || !errors.prompt.required))
          const tabItems = [
            { id: 'rlp-tab-prompt', panelId: 'rlp-panel', value: 'prompt', label: promptErr ? `${t('tabPrompt')} •` : t('tabPrompt') },
            { id: 'rlp-tab-skills', panelId: 'rlp-panel', value: 'skills', label: `${t('tabSkills')} (${totalSkills})${skillErrors ? ' •' : ''}` },
            { id: 'rlp-tab-preview', panelId: 'rlp-panel', value: 'preview', label: t('tabPreview') },
          ]
          const showName = errors.name && (showErrors || !errors.name.required)

          return h('fieldset', { className: 'rlp-stack', disabled: busy },
            h('section', { className: 'rlp-hero' },
              h('div', { className: 'rlp-hero-top' },
                h(EmojiPicker, { value: form.icon, onChange: icon => update({ icon }) }),
                h('div', { className: 'rlp-titles' },
                  h(Input, {
                    value: form.name, onChange: set('name'),
                    placeholder: t('namePlaceholder'), 'aria-label': t('namePlaceholder'),
                    'aria-invalid': showName || undefined, maxLength: limits.name + 20,
                  }),
                  showName ? h('p', { className: 'rlp-err', role: 'alert' }, errors.name.message) : null,
                  h(Input, {
                    value: form.description, onChange: set('description'),
                    placeholder: t('descriptionPlaceholder'), 'aria-label': t('descriptionPlaceholder'),
                  }),
                  errors.description ? h('p', { className: 'rlp-err', role: 'alert' }, errors.description.message) : null,
                  h('div', { className: 'rlp-badges' },
                    stored?.builtin ? h(Tag, { tone: 'neutral' }, t('builtin')) : null,
                    modified ? h(Tag, { tone: 'outline' }, t('modified')) : null,
                    isNew
                      ? h(Tag, { tone: 'warning' }, t('unsavedNew'))
                      : h(Tag, { tone: used ? 'success' : 'quiet' }, used ? t('usedBy', { n: used }) : t('unused')))),
                h(MoreMenu, { items: menu }))),

            conflict ? h('div', { className: 'rlp-banner', 'data-tone': 'warn', role: 'status' },
              h(IconWarningTriangleOutlineRegular, { size: 14 }),
              h('span', { className: 'rlp-banner-text' }, t('conflict')),
              h(Button, { size: 'sm', variant: 'outline', onClick: discard }, t('loadLatest'))) : null,

            dirty || status.kind !== 'idle' ? h('div', {
              className: 'rlp-dirty',
              'data-tone': status.kind === 'err' ? 'err' : !dirty && status.kind === 'ok' ? 'ok' : undefined,
              role: 'status', 'aria-live': 'polite',
            },
            h('span', { className: 'rlp-dirty-msg' }, status.kind !== 'idle' ? status.text : isNew ? t('unsavedNew') : t('unsaved')),
            dirty ? h('span', { className: 'rlp-kbd' }, t('saveShortcut')) : null,
            dirty ? h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: discard }, isNew ? t('discardNew') : t('discard')) : null,
            dirty ? h(Button, { size: 'sm', variant: 'primary', disabled: busy, onClick: save }, busy ? t('saving') : isNew ? t('create') : t('save')) : null) : null,

            h(SegmentedTabs, {
              size: 'sm',
              label: t('roleSections'),
              value: tab,
              onChange: next => ui.set({ tab: next }),
              items: tabItems,
            }),

            h('div', { id: 'rlp-panel', role: 'tabpanel', className: 'rlp-stack' },
              tab === 'prompt' ? h('section', { className: 'rlp-box' },
                h('textarea', {
                  className: 'rlp-prompt', value: form.prompt, onChange: set('prompt'), placeholder: t('promptPlaceholder'),
                  spellCheck: false, 'aria-label': t('tabPrompt'), 'aria-invalid': promptErr || undefined,
                }),
                h(FieldError, { error: errors.prompt, show: showErrors }),
                h(Meter, { value: form.prompt.length, max: limits.prompt, hint: t('promptHint') })) : null,

              tab === 'skills' ? h(React.Fragment, null,
                h(LocalSkills, { selected: form.localSkills ?? [], inlineNames: form.skills.map(s => s.name.trim()), onChange: localSkills => update({ localSkills }) }),
                h('section', { className: 'rlp-box', 'aria-label': t('inlineSkills') },
                  h('div', { className: 'rlp-box-head' },
                    h('div', { className: 'rlp-box-title' },
                      h('h3', null, t('inlineSkills')),
                      h(Tag, { tone: 'neutral' }, `${form.skills.length} / ${limits.skills}`)),
                    h(Button, {
                      size: 'sm', variant: 'outline',
                      icon: h(IconPlusOutlineRegular, { size: 13 }),
                      disabled: form.skills.length >= limits.skills,
                      onClick: addSkill,
                    }, t('addSkill'))),
                  h('p', { className: 'rlp-note' }, t('skillsHint')),
                  form.skills.length === 0
                    ? h('div', { className: 'rlp-empty' }, h('p', null, t('noSkills')))
                    : form.skills.map((skill, i) => h(SkillCard, {
                      key: skill.key, skill, errors, showErrors, limits,
                      open: openSkills.has(skill.key), onToggle: () => toggleSkill(skill.key),
                      onChange: next => update({ skills: form.skills.map((s, j) => j === i ? next : s) }),
                      onRemove: () => update({ skills: form.skills.filter((_, j) => j !== i) }),
                    })))) : null,

              tab === 'preview' ? h(Preview, { form, errors }) : null),

            confirmState ? h(Modal, {
              open: true,
              onClose: () => setConfirmState(null),
              title: confirmState.title,
              closeLabel: t('cancel'),
              description: confirmState.description,
              footer: h(React.Fragment, null,
                h(Button, { variant: 'outline', 'data-modal-autofocus': true, onClick: () => setConfirmState(null) }, t('cancel')),
                h(Button, {
                  variant: 'primary',
                  className: confirmState.danger ? 'rlp-danger-fill' : undefined,
                  onClick: () => { const fn = confirmState.onConfirm; setConfirmState(null); void fn() },
                }, confirmState.confirmLabel)),
            }) : null)
        }

        function RolesPage() {
          useLocale()
          const useStyleEffect = React.useLayoutEffect ?? React.useEffect
          useStyleEffect(ensurePageStyles, [])
          const { status, roles, sessions, error, limits, builtinMissing, builtinModified } = useRoles()
          const { selected, drafts, query, filter } = useUi()
          const navSeq = React.useSyncExternalStore(navStore.subscribe, navStore.get)
          const [note, setNote] = React.useState(null)

          React.useEffect(() => { if (nav.roleId) ui.set({ selected: nav.roleId, query: '', filter: 'all' }) }, [navSeq])

          const newKeys = Object.keys(drafts).filter(isNewKey)
          const exists = key => isNewKey(key) ? drafts[key] !== undefined : roles.some(r => r.id === key)
          React.useEffect(() => {
            if (status !== 'ready') return
            if (selected !== null && exists(selected)) return
            const fallback = roles[0]?.id ?? newKeys[0] ?? null
            if (fallback !== selected) ui.set({ selected: fallback })
          })

          const usage = {}
          for (const id of Object.values(sessions)) usage[id] = (usage[id] ?? 0) + 1

          const allRows = [
            ...roles.map(role => ({ key: role.id, role, form: drafts[role.id]?.form ?? role })),
            ...newKeys.map(key => ({ key, role: null, form: drafts[key].form })),
          ]
          const activeCount = allRows.filter(r => (usage[r.key] ?? 0) > 0).length
          const builtinCount = allRows.filter(r => Boolean(r.role?.builtin)).length
          const customCount = allRows.length - builtinCount

          const needle = query.trim().toLocaleLowerCase()
          const matches = item => !needle || [item.name, item.description, ...item.skills.map(s => s.name), ...(item.localSkills ?? [])].join('\n').toLocaleLowerCase().includes(needle)
          const rows = allRows.filter(row => {
            if (filter === 'active' && !(usage[row.key] > 0)) return false
            if (filter === 'builtin' && !row.role?.builtin) return false
            if (filter === 'custom' && Boolean(row.role?.builtin)) return false
            return matches(row.form)
          })

          const newRole = () => {
            const key = `new:${++newSeq}`
            ui.setDraft(key, { form: { name: t('newRoleName'), icon: '🎭', description: '', prompt: '', skills: [], localSkills: [] }, baseAt: 0 })
            ui.set({ selected: key, tab: 'prompt', query: '', filter: 'all' })
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
          const filterChips = [
            ['all', t('filterAll'), allRows.length],
            ...(activeCount ? [['active', t('filterActive'), activeCount]] : []),
            ...(builtinCount ? [['builtin', t('filterBuiltin'), builtinCount]] : []),
            ...(customCount ? [['custom', t('filterCustom'), customCount]] : []),
          ]

          const stored = selected && !isNewKey(selected) ? roles.find(r => r.id === selected) ?? null : null
          const editable = selected && (stored || (isNewKey(selected) && drafts[selected]))

          return h('section', { className: 'rlp-page', 'aria-label': t('panel') },
            h('div', { className: 'rlp-inner' },
              h('header', { className: 'rlp-head' },
                h('div', { className: 'rlp-head-copy' },
                  h('h1', { className: 'rlp-h1' }, t('panel')),
                  h('p', { className: 'rlp-note' }, t('intro'))),
                h('div', { className: 'rlp-head-actions' },
                  builtinMissing > 0
                    ? h(Button, { size: 'sm', variant: 'outline', onClick: () => void restore() }, t('restore', { n: builtinMissing }))
                    : null,
                  h(Button, {
                    size: 'sm', variant: 'primary',
                    icon: h(IconPlusOutlineRegular, { size: 14 }),
                    disabled: atLimit || status !== 'ready',
                    onClick: newRole,
                  }, t('newRole')))),

              note ? h('div', { className: 'rlp-banner', role: 'status' },
                h('span', { className: 'rlp-banner-text' }, note),
                h(Button, { size: 'sm', variant: 'ghost', 'aria-label': t('dismiss'), title: t('dismiss'), icon: h(IconCloseOutlineRegular, { size: 12 }), onClick: () => setNote(null) })) : null,

              status === 'loading'
                ? h('div', { className: 'rlp-empty', role: 'status' },
                  h(StateDot, { state: 'ongoing', size: 16 }),
                  h('p', null, t('loading')))
                : status === 'error'
                  ? h('div', { className: 'rlp-banner', 'data-tone': 'error', role: 'alert' },
                    h(IconWarningTriangleOutlineRegular, { size: 14 }),
                    h('span', { className: 'rlp-banner-text' }, t('loadFailed', { message: error })),
                    h(Button, { size: 'sm', variant: 'outline', onClick: () => store.reload() }, t('retry')))
                  : h('div', { className: 'rlp-hub' },
                    h('aside', { className: 'rlp-rail', 'aria-label': t('panel') },
                      allRows.length > 3 || needle ? h(Input, {
                        type: 'search',
                        icon: h(IconSearchOutlineRegular, { size: 14 }),
                        value: query, placeholder: t('search'), 'aria-label': t('search'),
                        onChange: e => ui.set({ query: e.target.value }),
                      }) : null,
                      filterChips.length > 1 ? h('div', { className: 'rlp-chips', role: 'group', 'aria-label': t('panel') },
                        filterChips.map(([key, label, n]) => h('button', {
                          key, type: 'button', className: 'rlp-chip', 'aria-pressed': filter === key,
                          onClick: () => ui.set({ filter: key }),
                        }, label, h('span', { className: 'rlp-chip-n' }, n)))) : null,
                      rows.length === 0
                        ? h('div', { className: 'rlp-empty' },
                          h('p', null, needle || filter !== 'all' ? t('noMatches') : t('empty')),
                          needle || filter !== 'all'
                            ? h(Button, { size: 'sm', variant: 'ghost', onClick: () => ui.set({ query: '', filter: 'all' }) }, t('resetFilters'))
                            : null)
                        : h('ul', { className: 'rlp-list', role: 'list' }, rows.map(({ key, role, form }) => {
                          const dirty = isNewKey(key) || (drafts[key] !== undefined && !sameForm(drafts[key].form, formOf(role)))
                          const skills = form.skills.length + (form.localSkills?.length ?? 0)
                          const meta = [skills ? t('skillsCount', { n: skills }) : null, usage[key] ? t('usedBy', { n: usage[key] }) : null].filter(Boolean).join(' · ')
                          return h('li', { key },
                            h('button', {
                              type: 'button', className: 'rlp-item',
                              'aria-current': key === selected || undefined,
                              onClick: () => ui.set({ selected: key }),
                            },
                            h('span', { className: 'rlp-item-icon', 'aria-hidden': true }, form.icon || '🎭'),
                            h('span', { className: 'rlp-item-body' },
                              h('span', { className: 'rlp-item-top' },
                                h('span', { className: 'rlp-item-name' }, form.name || t('namePlaceholder')),
                                usage[key] ? h(StateDot, { state: 'done', size: 6 }) : null,
                                dirty ? h(StateDot, { state: 'warning', size: 6 }) : null),
                              form.description ? h('span', { className: 'rlp-item-desc' }, form.description) : null,
                              meta ? h('span', { className: 'rlp-item-meta' }, meta) : null)))
                        }))),

                    editable
                      ? h(RoleEditor, {
                        key: selected, roleKey: selected, stored, roles, sessions, limits, builtinModified,
                        onSaved: (id, message) => { ui.set({ selected: id }); setNote(message ?? null) },
                        onDeleted: key => {
                          const keys = rows.map(r => r.key)
                          const at = keys.indexOf(key)
                          ui.set({ selected: keys[at + 1] ?? keys[at - 1] ?? null })
                        },
                      })
                      : h('div', { className: 'rlp-empty' },
                        h('span', { style: { fontSize: 32, lineHeight: 1 }, 'aria-hidden': true }, '🎭'),
                        h('p', null, t('empty')),
                        h(Button, { size: 'sm', variant: 'primary', icon: h(IconPlusOutlineRegular, { size: 14 }), onClick: newRole }, t('newRole'))))))
        }
      return {
        RolesPage,
        dispose() {
          if (typeof window !== 'undefined') window.removeEventListener('beforeunload', warn)
        },
      }
    }

    return { createRolesPage }
  },
})
