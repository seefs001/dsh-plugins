window.__ModuleLoader__.load({
  id: 'dsh-open-in-default',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const {
      IconChevronDownOutlineRegular, IconRightUpOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'open-in-default'
    const CHOICE_KEY = 'dsh.open-in-app.choice'
    const APPS_ROUTE = 'open-in-app/apps'
    const OPEN_ROUTE = 'open-in-app/open'
    const ICON_PREFIX = 'open-in-app/icon'

    const APP_NAMES = {
      finder: { en: 'Finder', zh: '访达' },
      explorer: { en: 'File Explorer', zh: '文件资源管理器' },
      filemanager: { en: 'Files', zh: '文件管理器' },
      cursor: { en: 'Cursor', zh: 'Cursor' },
      vscode: { en: 'VS Code', zh: 'VS Code' },
      vscodeinsiders: { en: 'VS Code Insiders', zh: 'VS Code Insiders' },
      windsurf: { en: 'Windsurf', zh: 'Windsurf' },
      zed: { en: 'Zed', zh: 'Zed' },
      sublimetext: { en: 'Sublime Text', zh: 'Sublime Text' },
      xcode: { en: 'Xcode', zh: 'Xcode' },
      androidstudio: { en: 'Android Studio', zh: 'Android Studio' },
      intellij: { en: 'IntelliJ IDEA', zh: 'IntelliJ IDEA' },
      pycharm: { en: 'PyCharm', zh: 'PyCharm' },
      webstorm: { en: 'WebStorm', zh: 'WebStorm' },
      phpstorm: { en: 'PhpStorm', zh: 'PhpStorm' },
      goland: { en: 'GoLand', zh: 'GoLand' },
      rider: { en: 'Rider', zh: 'Rider' },
      rustrover: { en: 'RustRover', zh: 'RustRover' },
      fork: { en: 'Fork', zh: 'Fork' },
      sourcetree: { en: 'Sourcetree', zh: 'Sourcetree' },
      github: { en: 'GitHub Desktop', zh: 'GitHub Desktop' },
      tower: { en: 'Tower', zh: 'Tower' },
      gitkraken: { en: 'GitKraken', zh: 'GitKraken' },
      smartgit: { en: 'SmartGit', zh: 'SmartGit' },
      sublimemerge: { en: 'Sublime Merge', zh: 'Sublime Merge' },
      ghostty: { en: 'Ghostty', zh: 'Ghostty' },
      warp: { en: 'Warp', zh: 'Warp' },
      iterm: { en: 'iTerm', zh: 'iTerm' },
      kitty: { en: 'kitty', zh: 'kitty' },
      terminal: { en: 'Terminal', zh: '终端' },
      windowsterminal: { en: 'Windows Terminal', zh: 'Windows 终端' },
      gitbash: { en: 'Git Bash', zh: 'Git Bash' },
      gnometerminal: { en: 'GNOME Terminal', zh: 'GNOME 终端' },
      konsole: { en: 'Konsole', zh: 'Konsole' },
    }

    const COPY = {
      en: {
        openIn: 'Open in {app}',
        chooseDefault: 'Choose default editor',
        menuHint: 'Select default (does not launch)',
        selected: 'Default',
        savedDefault: 'Default set to {app}',
        openFailed: 'Could not open in {app}',
      },
      zh: {
        openIn: '在 {app} 中打开',
        chooseDefault: '切换默认编辑器',
        menuHint: '仅切换默认项，不立即打开',
        selected: '默认',
        savedDefault: '默认编辑器已设为 {app}',
        openFailed: '无法在 {app} 中打开',
      },
    }

    const CSS = `
.oid-split{display:inline-flex;align-items:stretch;box-sizing:border-box;height:24px;overflow:hidden;border:0;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--dsw-alias-border-l3));border-radius:var(--dsw-radius-sm,6px);background:none;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family,inherit);flex:none}
.oid-main,.oid-arrow{display:inline-flex;align-items:center;justify-content:center;border:0;background:none;color:inherit;cursor:pointer;font-size:11px;line-height:16px;white-space:nowrap}
.oid-main{gap:4px;min-width:24px;padding:3px 6px;max-width:132px}
.oid-arrow{min-width:22px;padding:3px 4px 3px 3px;border-left:.5px solid var(--dsw-alias-border-l4,var(--dsw-alias-border-l3));color:var(--dsw-alias-label-secondary)}
.oid-main:disabled,.oid-arrow:disabled{cursor:default;opacity:.55}
.oid-main:focus-visible,.oid-arrow:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px;background:var(--dsw-alias-interactive-bg-hover)}
@media (hover:hover){.oid-main:hover:not(:disabled),.oid-arrow:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
.oid-arrow[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.oid-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@container (max-width:460px){.oid-label{display:none}}
.oid-icon{width:13px;height:13px;flex:none;border-radius:2px;object-fit:contain}
.oid-menu{position:fixed;z-index:9999;min-width:196px;max-width:min(260px,calc(100vw - 16px));max-height:min(360px,calc(100dvh - 16px));overflow-y:auto;overscroll-behavior:contain;padding:4px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));box-shadow:var(--dsw-elevation-medium,0 8px 24px rgba(0,0,0,.18));display:flex;flex-direction:column;gap:2px}
@media (pointer:coarse){.oid-split{height:30px}.oid-main{min-width:30px;padding:4px 8px}.oid-arrow{min-width:28px;padding:4px 6px}.oid-item{min-height:38px;padding:8px 10px}}
.oid-menu-hint{padding:4px 8px 6px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary);border-bottom:.5px solid var(--dsw-alias-border-l1);margin-bottom:2px}
.oid-item{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:16px;text-align:left;cursor:pointer}
.oid-item:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px;background:var(--dsw-alias-interactive-bg-hover)}
.oid-item-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.oid-item-tag{flex:none;font-size:10px;padding:1px 5px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-secondary)}
@media (hover:hover){.oid-item:hover{background:var(--dsw-alias-interactive-bg-hover)}}
`

    function readChoice() {
      try {
        const raw = localStorage.getItem(CHOICE_KEY)
        if (!raw) return ''
        try {
          const parsed = JSON.parse(raw)
          return typeof parsed === 'string' ? parsed : ''
        } catch {
          return raw
        }
      } catch {
        return ''
      }
    }

    function writeChoice(appId) {
      try {
        localStorage.setItem(CHOICE_KEY, JSON.stringify(appId))
      } catch {}
    }

    function resolveAppName(id, lang) {
      const entry = APP_NAMES[id]
      if (!entry) return id
      return lang?.startsWith('zh') ? entry.zh : entry.en
    }

    function resolvePreferred(apps, choice) {
      if (!Array.isArray(apps) || apps.length === 0) return null
      return apps.includes(choice) ? choice : apps[0]
    }

    function resolveSessionPath(sessionId, list, workspaces) {
      const row = list?.byId?.[sessionId]
      if (row?.cwd) return row.cwd
      const ws = (workspaces?.items ?? []).find(item => Array.isArray(item.sessionIds) && item.sessionIds.includes(sessionId))
      return ws?.path || ''
    }

    function AppIcon({ appId, size = 14 }) {
      const [failed, setFailed] = React.useState(false)
      React.useEffect(() => { setFailed(false) }, [appId])
      if (failed) return h(IconRightUpOutlineRegular, { size })
      return h('img', {
        src: `${ICON_PREFIX}/${appId}`,
        width: size,
        height: size,
        className: 'oid-icon',
        alt: '',
        draggable: false,
        onError: () => setFailed(true),
      })
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'workspaces'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, COPY), `${NS}: dictionaries`)
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, `${NS}: styles`)

        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, () => String(v)), t(key))

        let state = { apps: null, choice: readChoice(), busy: false }
        const listeners = new Set()
        const store = {
          getSnapshot: () => state,
          subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
        }
        const update = patch => {
          state = { ...state, ...patch }
          for (const fn of listeners) fn()
        }

        let alive = true
        const controller = new AbortController()
        const loadApps = async () => {
          try {
            const res = await fetch(APPS_ROUTE, { headers: { accept: 'application/json' }, signal: controller.signal })
            if (!res.ok) { update({ apps: [] }); return }
            const body = await res.json().catch(() => null)
            const apps = Array.isArray(body?.apps) ? body.apps.filter(id => typeof id === 'string') : []
            if (alive) update({ apps })
          } catch {
            if (alive) update({ apps: [] })
          }
        }
        void loadApps()

        ctx.effect(() => {
          const onStorage = event => {
            if (event.key === CHOICE_KEY) update({ choice: readChoice() })
          }
          window.addEventListener('storage', onStorage)
          return () => {
            alive = false
            controller.abort()
            window.removeEventListener('storage', onStorage)
            listeners.clear()
          }
        }, `${NS}: lifecycle`)

        const notify = (text, ok) => {
          const menus = ctx.get?.('contextMenus')
          if (typeof menus?.notify === 'function') menus.notify(text, ok)
        }

        const chooseDefault = appId => {
          writeChoice(appId)
          update({ choice: appId })
          const lang = ctx.locale.getSnapshot().active
          notify(tf('savedDefault', { app: resolveAppName(appId, lang) }), true)
        }

        const launch = async (appId, path) => {
          if (state.busy || !appId || !path) return
          update({ busy: true })
          try {
            const res = await fetch(OPEN_ROUTE, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ app: appId, path }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
          } catch {
            const lang = ctx.locale.getSnapshot().active
            notify(tf('openFailed', { app: resolveAppName(appId, lang) }), false)
          } finally {
            if (alive) update({ busy: false })
          }
        }

        const useSource = source => React.useSyncExternalStore(fn => source.subscribe(fn), () => source.getSnapshot())
        const subscribePathSources = onStoreChange => {
          const offSessions = ctx.sessions.list.subscribe(onStoreChange)
          const offWorkspaces = ctx.workspaces.list.subscribe(onStoreChange)
          return () => {
            if (typeof offSessions === 'function') offSessions()
            if (typeof offWorkspaces === 'function') offWorkspaces()
          }
        }

        function OpenInDefaultButton({ sessionId }) {
          const localeSnap = useSource(ctx.locale)
          const path = React.useSyncExternalStore(
            subscribePathSources,
            () => resolveSessionPath(sessionId, ctx.sessions.list.getSnapshot(), ctx.workspaces.list.getSnapshot()),
          )
          const view = useSource(store)
          const [menuRect, setMenuRect] = React.useState(null)
          const anchorRef = React.useRef(null)
          const arrowRef = React.useRef(null)
          const menuRef = React.useRef(null)

          React.useEffect(() => {
            if (!menuRect) return undefined
            const onDown = e => {
              if (menuRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return
              setMenuRect(null)
            }
            const onKey = e => {
              if (e.key === 'Escape') {
                setMenuRect(null)
                arrowRef.current?.focus?.()
              }
            }
            const onScroll = () => setMenuRect(null)
            window.addEventListener('pointerdown', onDown, true)
            window.addEventListener('keydown', onKey)
            window.addEventListener('resize', onScroll)
            return () => {
              window.removeEventListener('pointerdown', onDown, true)
              window.removeEventListener('keydown', onKey)
              window.removeEventListener('resize', onScroll)
            }
          }, [menuRect !== null])

          const apps = view.apps
          const preferred = resolvePreferred(apps, view.choice)
          if (!path || !preferred) return null

          const lang = localeSnap?.active ?? 'en'
          const preferredName = resolveAppName(preferred, lang)
          const openLabel = tf('openIn', { app: preferredName })
          const menuOpen = menuRect !== null

          const toggleMenu = () => {
            if (menuOpen) { setMenuRect(null); return }
            const rect = anchorRef.current?.getBoundingClientRect()
            if (rect) setMenuRect(rect)
          }

          return h(React.Fragment, null,
            h('div', { ref: anchorRef, className: 'oid-split', 'data-open-in-default': '' },
              h('button', {
                type: 'button',
                className: 'oid-main',
                disabled: view.busy,
                title: openLabel,
                'aria-label': openLabel,
                onClick: () => void launch(preferred, path),
              },
              h(AppIcon, { appId: preferred, size: 14 }),
              h('span', { className: 'oid-label' }, preferredName)),
              apps.length > 1 && h('button', {
                ref: arrowRef,
                type: 'button',
                className: 'oid-arrow',
                disabled: view.busy,
                title: t('chooseDefault'),
                'aria-label': t('chooseDefault'),
                'aria-haspopup': 'menu',
                'aria-expanded': menuOpen,
                onClick: toggleMenu,
              }, h(IconChevronDownOutlineRegular, { size: 11 }))),
            menuOpen && ReactDOM.createPortal(
              h('div', {
                ref: menuRef,
                className: 'oid-menu',
                role: 'menu',
                'aria-label': t('chooseDefault'),
                onKeyDown: e => {
                  const list = [...(menuRef.current?.querySelectorAll('[role=menuitemradio]:not(:disabled)') ?? [])]
                  if (!list.length) return
                  const at = list.indexOf(document.activeElement)
                  if (e.key === 'ArrowDown') { e.preventDefault(); list[(at + 1 + list.length) % list.length]?.focus() }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); list[(at - 1 + list.length) % list.length]?.focus() }
                  else if (e.key === 'Home') { e.preventDefault(); list[0]?.focus() }
                  else if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus() }
                },
                style: {
                  top: `${Math.max(8, Math.min(menuRect.bottom + 6, window.innerHeight - 240))}px`,
                  left: `${Math.max(8, Math.min(menuRect.right - 220, window.innerWidth - 268))}px`,
                },
              },
              h('div', { className: 'oid-menu-hint' }, t('menuHint')),
              apps.map(appId => {
                const name = resolveAppName(appId, lang)
                const isDefault = appId === preferred
                return h('button', {
                  key: appId,
                  type: 'button',
                  role: 'menuitemradio',
                  'aria-checked': isDefault,
                  className: 'oid-item',
                  onClick: () => {
                    chooseDefault(appId)
                    setMenuRect(null)
                  },
                },
                h(AppIcon, { appId, size: 14 }),
                h('span', { className: 'oid-item-name' }, name),
                isDefault && h('span', { className: 'oid-item-tag' }, t('selected')))
              })),
              document.body))
        }

        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: NS,
          order: 15,
          locale: NS,
        }, OpenInDefaultButton))
      },
      _internal: { COPY, APP_NAMES, resolvePreferred, resolveSessionPath, resolveAppName },
    }
  },
})
