/**
 * dsh-paseo-hub — browser half.
 *
 * A "Paseo Hub" launcher in the sidebar panel list opens a main panel that
 * signs this Host in to a Hub, shows the connection, the modes Hub can pick,
 * and recent Hub runs, and disconnects. Every change goes to the Host over
 * `paseo-hub/op`; the page reloads `paseo-hub/state` every 2 seconds while
 * signing in and every 10 seconds otherwise.
 */
window.__ModuleLoader__.load({
  id: 'dsh-paseo-hub',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'paseo-hub'
    const PANEL_ID = 'paseo-hub'

    const EN = {
      panel: 'Paseo Hub',
      intro: 'Run Paseo Hub automations on this DSH Host. Hub triggers from GitHub, Slack, Discord, Linear, and Telegram start DSH sessions here with provider "dsh". Runs happen only while this Host is running.',
      origin: 'Hub address',
      originHint: 'The address you open Hub at, for example https://hub.example.com.',
      apiKey: 'Organization API key (optional)',
      apiKeyHint: 'Leave empty to approve the sign-in in your browser. A key needs the "Enroll daemons" scope.',
      signIn: 'Sign in',
      signingIn: 'Waiting for approval',
      openApproval: 'Open approval page',
      code: 'Confirm this code in Hub',
      expires: 'Expires',
      cancel: 'Cancel',
      enrolling: 'Enrolling this Host…',
      status: 'Status',
      state_not_connected: 'Not connected',
      state_signing_in: 'Signing in',
      state_connecting: 'Connecting',
      state_connected: 'Connected',
      state_reconnecting: 'Reconnecting',
      state_revoked: 'Revoked',
      hub: 'Hub',
      daemon: 'Daemon',
      since: 'Connected since',
      enrolled: 'Enrolled',
      reconnect: 'Reconnect now',
      disconnect: 'Disconnect',
      disconnectText: 'Disconnect from {hub}? Hub revokes this daemon, its triggers stop reaching this Host, and existing DSH sessions stay.',
      modes: 'Modes Hub can choose',
      modesHint: 'Each Hub mode is a DSH permission preset. A trigger names one with agent.mode; the run never gets a wider preset.',
      noPresets: 'No permission presets are configured, so Hub runs cannot start. Configure @deepseek-ai/dsh-permission-presets.',
      defaultMode: 'default',
      triggerYaml: 'Trigger agent',
      runs: 'Recent Hub runs',
      noRuns: 'No Hub runs yet.',
      running: 'Running',
      archived: 'Archived',
      idle: 'Idle',
      openSession: 'Open',
      loadFailed: 'Could not load Paseo Hub',
      opFailed: 'Failed',
      retry: 'Retry',
      never: 'never',
    }
    const ZH = {
      panel: 'Paseo Hub',
      intro: '在这台 DSH Host 上运行 Paseo Hub 自动化。Hub 来自 GitHub、Slack、Discord、Linear 和 Telegram 的触发会在这里启动 DSH 会话，provider 为 "dsh"。只在 Host 运行期间工作。',
      origin: 'Hub 地址',
      originHint: '你打开 Hub 用的地址，例如 https://hub.example.com。',
      apiKey: '组织 API key（可选）',
      apiKeyHint: '留空则在浏览器里批准登录。使用 key 时需要 “Enroll daemons” 权限。',
      signIn: '登录',
      signingIn: '等待批准',
      openApproval: '打开批准页面',
      code: '在 Hub 中核对此代码',
      expires: '过期时间',
      cancel: '取消',
      enrolling: '正在注册这台 Host…',
      status: '状态',
      state_not_connected: '未连接',
      state_signing_in: '登录中',
      state_connecting: '连接中',
      state_connected: '已连接',
      state_reconnecting: '重连中',
      state_revoked: '已撤销',
      hub: 'Hub',
      daemon: 'Daemon',
      since: '连接时间',
      enrolled: '注册时间',
      reconnect: '立即重连',
      disconnect: '断开',
      disconnectText: '断开与 {hub} 的连接？Hub 会撤销这个 daemon，它的触发不再到达这台 Host，已有的 DSH 会话保留。',
      modes: 'Hub 可选的 mode',
      modesHint: '每个 Hub mode 对应一个 DSH 权限预设。触发器用 agent.mode 指定，运行不会拿到更宽的预设。',
      noPresets: '没有配置权限预设，Hub 运行无法启动。请配置 @deepseek-ai/dsh-permission-presets。',
      defaultMode: '默认',
      triggerYaml: '触发器 agent 写法',
      runs: '最近的 Hub 运行',
      noRuns: '还没有 Hub 运行。',
      running: '运行中',
      archived: '已归档',
      idle: '空闲',
      openSession: '打开',
      loadFailed: '无法加载 Paseo Hub',
      opFailed: '失败',
      retry: '重试',
      never: '从未',
    }

    const CSS = `
.ph-page{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
.ph-inner{max-width:760px;margin:0 auto;padding:24px 24px 48px;display:flex;flex-direction:column;gap:16px}
.ph-h1{margin:0;font-size:20px;line-height:28px;font-weight:600}
.ph-muted{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}
.ph-card{border:.5px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);padding:16px;display:flex;flex-direction:column;gap:12px}
.ph-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ph-title{font-size:15px;line-height:22px;font-weight:600;margin:0;flex:1;min-width:0}
.ph-badge{font-size:12px;line-height:18px;padding:0 8px;border-radius:9px;border:.5px solid currentColor;color:var(--dsw-alias-label-secondary)}
.ph-badge[data-tone=ok]{color:var(--dsw-alias-state-success-primary)}
.ph-badge[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}
.ph-badge[data-tone=error]{color:var(--dsw-alias-state-error-primary)}
.ph-btn{height:28px;padding:0 12px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.ph-btn:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary)}
.ph-btn:disabled{opacity:.5;cursor:default}
.ph-btn[data-primary]{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}
.ph-grid{display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;font-size:13px;line-height:20px;margin:0}
.ph-grid dt{color:var(--dsw-alias-label-secondary)}
.ph-grid dd{margin:0;min-width:0;overflow-wrap:anywhere}
.ph-note{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);margin:0}
.ph-warn{font-size:12px;line-height:18px;color:var(--dsw-alias-state-warn-primary);margin:0;overflow-wrap:anywhere}
.ph-error{font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary);margin:0;overflow-wrap:anywhere}
.ph-field{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.ph-input{height:30px;padding:0 8px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.ph-code{font-family:ui-monospace,monospace;font-size:22px;line-height:30px;letter-spacing:2px;margin:0}
.ph-pre{margin:0;padding:8px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-family:ui-monospace,monospace;font-size:12px;line-height:18px;white-space:pre-wrap;overflow-wrap:anywhere}
.ph-section{font-size:13px;font-weight:600;margin:0}
.ph-list{display:flex;flex-direction:column}
.ph-item{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:.5px solid var(--dsw-alias-border-l1);font-size:13px;line-height:20px}
.ph-item:first-child{border-top:0}
.ph-item-main{flex:1;min-width:0;display:flex;flex-direction:column}
.ph-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`
    const STATE_TONE = { connected: 'ok', connecting: 'warn', reconnecting: 'warn', signing_in: 'warn', revoked: 'error', not_connected: undefined }

    async function request(path, init) {
      const res = await fetch(path, { ...init, headers: { accept: 'application/json', ...init?.body ? { 'content-type': 'application/json' } : {} } })
      let body = null
      try { body = await res.json() } catch {}
      if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`)
      return body
    }

    function IconHub({ size }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true },
        h('circle', { cx: 6.5, cy: 6.5, r: 2.5 }),
        h('circle', { cx: 17.5, cy: 6.5, r: 2.5 }),
        h('circle', { cx: 12, cy: 17, r: 3 }),
        h('path', { d: 'M8 8.5l2.6 5.6M16 8.5l-2.6 5.6' }))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', EN), 'paseo-hub: en')
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH), 'paseo-hub: zh')
        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), t(key))
        const useLocale = () => React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
        const fmt = iso => iso ? new Date(iso).toLocaleString() : t('never')

        function useHub() {
          const [state, setState] = React.useState({ data: null, error: null })
          const load = React.useCallback(async signal => {
            try {
              const data = await request('paseo-hub/state', { signal })
              setState({ data, error: null })
            } catch (error) {
              if (error?.name !== 'AbortError') setState(prev => ({ data: prev.data, error: String(error?.message ?? error) }))
            }
          }, [])
          const fast = state.data?.state === 'signing_in' || state.data?.state === 'connecting'
          React.useEffect(() => {
            const controller = new AbortController()
            void load(controller.signal)
            const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(controller.signal) }, fast ? 2_000 : 10_000)
            return () => { clearInterval(timer); controller.abort() }
          }, [load, fast])
          const op = React.useCallback(async payload => {
            try {
              await request('paseo-hub/op', { method: 'POST', body: JSON.stringify(payload) })
              await load()
              return null
            } catch (error) {
              return String(error?.message ?? error)
            }
          }, [load])
          return { ...state, load, op }
        }

        function ActionButton({ label, onRun, primary, disabled, confirmText, type = 'button' }) {
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState(null)
          const mounted = React.useRef(true)
          React.useEffect(() => () => { mounted.current = false }, [])
          const click = async event => {
            event?.preventDefault?.()
            if (confirmText && !window.confirm(confirmText)) return
            setBusy(true)
            setError(null)
            const message = await onRun()
            if (!mounted.current) return
            setBusy(false)
            setError(message)
          }
          return h(React.Fragment, null,
            h('button', { type, className: 'ph-btn', 'data-primary': primary ? '' : undefined, disabled: disabled || busy, 'aria-busy': busy, onClick: click }, label),
            error ? h('span', { className: 'ph-error', role: 'alert' }, `${t('opFailed')}: ${error}`) : null)
        }

        function SignInCard({ data, op }) {
          const [origin, setOrigin] = React.useState(() => data.login?.origin ?? data.hubOrigin ?? '')
          const [apiKey, setApiKey] = React.useState('')
          return h('form', { className: 'ph-card', onSubmit: e => e.preventDefault() },
            h('label', { className: 'ph-field' }, t('origin'),
              h('input', { className: 'ph-input', type: 'url', required: true, placeholder: 'https://hub.example.com', value: origin, autoComplete: 'url', onChange: e => setOrigin(e.target.value) }),
              h('span', { className: 'ph-note' }, t('originHint'))),
            h('label', { className: 'ph-field' }, t('apiKey'),
              h('input', { className: 'ph-input', type: 'password', value: apiKey, autoComplete: 'off', onChange: e => setApiKey(e.target.value) }),
              h('span', { className: 'ph-note' }, t('apiKeyHint'))),
            data.lastError ? h('p', { className: 'ph-error', role: 'alert' }, data.lastError) : null,
            h('div', { className: 'ph-row' },
              h(ActionButton, { type: 'submit', label: t('signIn'), primary: true, disabled: !origin.trim(), onRun: () => op({ action: 'sign-in', origin, ...apiKey.trim() ? { apiKey } : {} }) })))
        }

        function PendingCard({ data, op }) {
          const login = data.login
          return h('section', { className: 'ph-card', 'aria-live': 'polite' },
            h('div', { className: 'ph-row' },
              h('h2', { className: 'ph-title' }, login?.method === 'browser' ? t('signingIn') : t('enrolling')),
              h('span', { className: 'ph-badge', 'data-tone': 'warn' }, t('state_signing_in'))),
            login?.method === 'browser' ? h(React.Fragment, null,
              h('p', { className: 'ph-note' }, t('code')),
              h('p', { className: 'ph-code' }, login.userCode),
              h('dl', { className: 'ph-grid' },
                h('dt', null, t('hub')), h('dd', null, login.origin),
                h('dt', null, t('expires')), h('dd', null, fmt(login.expiresAt))),
              h('div', { className: 'ph-row' },
                h('a', { className: 'ph-btn', 'data-primary': '', href: login.verificationUriComplete, target: '_blank', rel: 'noreferrer' }, t('openApproval')),
                h(ActionButton, { label: t('cancel'), onRun: () => op({ action: 'cancel-sign-in' }) }))) : null)
        }

        function ConnectionCard({ data, op }) {
          return h('section', { className: 'ph-card' },
            h('div', { className: 'ph-row' },
              h('h2', { className: 'ph-title' }, data.slug ?? data.hubOrigin),
              h('span', { className: 'ph-badge', 'data-tone': STATE_TONE[data.state] }, t(`state_${data.state}`))),
            h('dl', { className: 'ph-grid' },
              h('dt', null, t('hub')), h('dd', null, h('a', { href: data.hubOrigin, target: '_blank', rel: 'noreferrer', style: { color: 'var(--dsw-alias-brand-primary)' } }, data.hubOrigin)),
              h('dt', null, t('daemon')), h('dd', null, `${data.slug ?? ''} · ${data.daemonId}`),
              h('dt', null, t('since')), h('dd', null, data.state === 'connected' ? fmt(data.connectedAt) : '—'),
              h('dt', null, t('enrolled')), h('dd', null, fmt(data.enrolledAt))),
            data.lastError ? h('p', { className: data.state === 'revoked' ? 'ph-error' : 'ph-warn', role: 'status' }, data.lastError) : null,
            h('div', { className: 'ph-row' },
              data.state === 'connected' ? null : h(ActionButton, { label: t('reconnect'), onRun: () => op({ action: 'reconnect' }) }),
              h(ActionButton, { label: t('disconnect'), onRun: () => op({ action: 'disconnect' }), confirmText: tf('disconnectText', { hub: data.hubOrigin }) })))
        }

        function ModesCard({ data }) {
          const sample = data.modes[0]
          return h('section', { className: 'ph-card' },
            h('p', { className: 'ph-section' }, t('modes')),
            h('p', { className: 'ph-note' }, t('modesHint')),
            !data.presetsAvailable || data.modes.length === 0
              ? h('p', { className: 'ph-warn' }, t('noPresets'))
              : h('div', { className: 'ph-row' }, data.modes.map(mode => h('span', { key: mode.id, className: 'ph-badge', title: mode.preset },
                  mode.id === data.defaultModeId ? `${mode.label} (${t('defaultMode')})` : mode.label))),
            sample ? h(React.Fragment, null,
              h('p', { className: 'ph-note' }, t('triggerYaml')),
              h('pre', { className: 'ph-pre' }, `agent:\n  provider: dsh\n  model: <provider>/<model>   # optional\n  mode: ${data.defaultModeId ?? sample.id}`)) : null)
        }

        function RunsCard({ runs }) {
          return h('section', { className: 'ph-card' },
            h('p', { className: 'ph-section' }, t('runs')),
            runs.length === 0 ? h('p', { className: 'ph-note' }, t('noRuns')) : h('div', { className: 'ph-list' },
              runs.map(run => h('div', { key: run.sessionId, className: 'ph-item' },
                h('div', { className: 'ph-item-main' },
                  h('span', { className: 'ph-ellipsis' }, run.title || run.sessionId),
                  h('span', { className: 'ph-note ph-ellipsis' }, `${fmt(run.createdAt)} · ${run.modeId ?? ''}${run.model ? ` · ${run.model}` : ''} · ${run.cwd}`)),
                h('span', { className: 'ph-badge', 'data-tone': run.running ? 'warn' : undefined }, run.running ? t('running') : run.archivedAt ? t('archived') : t('idle')),
                ctx.get('uiWorkspace') ? h('button', { type: 'button', className: 'ph-btn', onClick: () => ctx.get('uiWorkspace')?.openSession(run.sessionId) }, t('openSession')) : null))))
        }

        function HubPage() {
          useLocale()
          const { data, error, load, op } = useHub()
          const enrolled = data?.daemonId != null
          return h('div', { className: 'ph-page' },
            h('style', null, CSS),
            h('div', { className: 'ph-inner' },
              h('h1', { className: 'ph-h1' }, t('panel')),
              h('p', { className: 'ph-muted' }, t('intro')),
              error ? h('div', { className: 'ph-row' },
                h('p', { className: 'ph-error', role: 'alert' }, `${t('loadFailed')}: ${error}`),
                h('button', { type: 'button', className: 'ph-btn', onClick: () => load() }, t('retry'))) : null,
              data && !enrolled && data.state !== 'signing_in' ? h(SignInCard, { data, op }) : null,
              data && data.state === 'signing_in' ? h(PendingCard, { data, op }) : null,
              data && enrolled ? h(ConnectionCard, { data, op }) : null,
              data ? h(ModesCard, { data }) : null,
              data && enrolled ? h(RunsCard, { runs: data.runs }) : null))
        }

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, HubPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 45, locale: NS, label: () => t('panel'),
        }, ({ size }) => h(IconHub, { size: size ?? 16 })))
      },
    }
  },
})
