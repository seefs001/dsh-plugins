window.__ModuleLoader__.load({
  id: 'dsh-bark-notify',
  factory(require) {
    const React = require('react')
    const { Switch } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'bark-notify'
    const KEY = 'dsh-bark-notify'

    const en = {
      title: 'Bark notifications',
      hint: 'Sends a Bark push notification when a DSH agent pauses for your answer, plan review, or tool approval. The device key is stored only in Host credentials, never in cordis.patch.yml.',
      importTitle: 'Quick fill from Bark URL',
      importPlaceholder: 'Paste https://your-bark-host/DEVICE_KEY/{{title}}/{{content}}?sound=alarm&group=...',
      importApply: 'Fill fields',
      importInvalid: 'Could not find a server URL and device key in that URL.',
      importFilled: 'Fields filled. Click Save to store the device key in Host credentials.',
      enabled: 'Enabled',
      serverUrl: 'Server URL',
      deviceKey: 'Device key',
      keyPlaceholderSet: 'Leave blank to keep the saved key',
      keyPlaceholderEmpty: 'Enter your Bark device key',
      keyStatusCreds: 'Saved in Host credentials ({masked})',
      keyStatusEnv: 'Using DSH_BARK_KEY ({masked})',
      keyStatusNone: 'No device key configured yet',
      clearKey: 'Clear saved key',
      clearKeyConfirm: 'Confirm clear',
      cancel: 'Cancel',
      loading: 'Loading settings…',
      method: 'Request mode',
      methodGet: 'GET path template (/<key>/<title>/<content>)',
      methodPost: 'POST JSON (/<key>)',
      triggersTitle: 'Notify on',
      notifyQuestions: 'Questions, plan reviews, and UI approvals (user-questions/request)',
      notifyApprovals: 'Tool permission approvals (approval/request)',
      notifyErrors: 'Agent turn errors (agent/error)',
      notifyFinished: 'Top-level turn completions (turn/end)',
      notifyAcp: 'External ACP CLI approvals and questions (dsh-acp-workbench)',
      delayMs: 'Delay (ms)',
      delayHint: '0 sends immediately. If > 0 and you answer or cancel before the timer fires, no notification is sent.',
      sound: 'Sound',
      group: 'Group',
      includeContent: 'Include question/tool summary in body',
      openUrl: 'Click-through URL (optional)',
      openUrlPlaceholder: 'For example http://127.0.0.1:3080',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved.',
      test: 'Send test notification',
      testing: 'Sending test…',
      testSent: 'Test notification sent.',
      testFailed: 'Test failed: ',
      loadFailed: 'Could not load settings: ',
      saveFailed: 'Save failed: ',
      retry: 'Retry',
    }

    const zh = {
      title: 'Bark 通知',
      hint: '当 DSH 智能体提问、提交计划审阅或请求工具权限审批时，顺便向手机发送 Bark 推送。Device Key 只保存在本机 Host 凭据中，不会写入 cordis.patch.yml。',
      importTitle: '从 Bark URL 快速填入',
      importPlaceholder: '粘贴 https://你的域名/DEVICE_KEY/{{title}}/{{content}}?sound=alarm&group=...',
      importApply: '解析填入',
      importInvalid: '未能从该 URL 解析出服务器地址和 Device Key。',
      importFilled: '已填入表单，请点击「保存」将 Device Key 写入 Host 凭据。',
      enabled: '启用通知',
      serverUrl: '服务器地址',
      deviceKey: 'Device Key',
      keyPlaceholderSet: '留空则保留当前已存 Key',
      keyPlaceholderEmpty: '输入 Bark Device Key',
      keyStatusCreds: '已保存在 Host 凭据中（{masked}）',
      keyStatusEnv: '当前读取环境变量 DSH_BARK_KEY（{masked}）',
      keyStatusNone: '尚未配置 Device Key',
      clearKey: '清除已存 Key',
      clearKeyConfirm: '确认清除',
      cancel: '取消',
      loading: '正在读取配置…',
      method: '请求方式',
      methodGet: 'GET 路径模板 (/<key>/<title>/<content>)',
      methodPost: 'POST JSON (/<key>)',
      triggersTitle: '触发场景',
      notifyQuestions: '提问、计划审阅与界面授权（user-questions/request）',
      notifyApprovals: '工具权限审批（approval/request）',
      notifyErrors: 'Agent 运行出错（agent/error）',
      notifyFinished: '主会话轮次完成（turn/end）',
      notifyAcp: '外部 ACP CLI 审批与提问（dsh-acp-workbench）',
      delayMs: '延迟推送（毫秒）',
      delayHint: '0 表示立即推送；设为如 3000 时，若你在 3 秒内处理完或取消，则不发通知。',
      sound: '铃声 (sound)',
      group: '分组 (group)',
      includeContent: '正文包含问题或审批摘要',
      openUrl: '点击通知跳转链接（可选）',
      openUrlPlaceholder: '例如 http://127.0.0.1:3080',
      save: '保存',
      saving: '保存中…',
      saved: '已保存。',
      test: '发送测试通知',
      testing: '发送中…',
      testSent: '测试通知已发送。',
      testFailed: '测试失败：',
      loadFailed: '读取配置失败：',
      saveFailed: '保存失败：',
      retry: '重试',
    }

    const CSS = `
.bn{--bn-line:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l3);--bn-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.bn-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.bn-hint,.bn-note{color:var(--dsw-alias-label-secondary);line-height:20px}
.bn-note.ok{color:var(--dsw-alias-state-success-primary)}
.bn-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.bn-note.err{color:var(--dsw-alias-state-error-primary)}
.bn-row{display:grid;grid-template-columns:132px minmax(0,380px);gap:8px;align-items:center}
.bn-row>span{color:var(--dsw-alias-label-secondary)}
.bn input[type=text],.bn input[type=password],.bn input[type=number],.bn input[type=url],.bn select{height:32px;min-width:0;padding:0 10px;border:var(--bn-line);border-radius:var(--bn-r);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}
.bn select{padding:0 26px 0 10px;background:var(--dsw-alias-bg-module-platform) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 8px center/12px 12px;cursor:pointer;appearance:none}
.bn input:disabled,.bn select:disabled{opacity:.6;cursor:default}
.bn-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:520px;min-height:28px;cursor:pointer}
.bn-row:has([role=switch]){cursor:pointer}
.bn-switch-row:has([role=switch]:disabled),.bn-row:has([role=switch]:disabled){cursor:default}
.bn-import{display:flex;gap:8px;align-items:center;max-width:520px}
.bn-import input{flex:1;min-width:0}
.bn-section{display:flex;flex-direction:column;gap:10px;padding-top:14px;border-top:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l1)}
.bn-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.bn-btn{height:30px;padding:0 14px;border:var(--bn-line);border-radius:999px;corner-shape:round;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;transition:background-color .15s}
.bn-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.bn-btn:disabled{opacity:.4;cursor:default}
.bn input:focus-visible,.bn select:focus-visible,.bn-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.bn-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.bn-btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media (pointer:coarse){.bn input[type=text],.bn input[type=password],.bn input[type=number],.bn input[type=url],.bn select{font-size:16px}}
@media (max-width:580px){.bn-row{grid-template-columns:1fr}.bn-import{flex-direction:column;align-items:stretch}}
`

    async function getJson(path, init) {
      const r = await fetch(path, { ...init, headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      return data
    }

    function parseBarkUrlTemplate(raw) {
      let url
      try { url = new URL(String(raw ?? '').trim()) } catch { return null }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
      const segments = url.pathname.split('/').filter(Boolean)
      const key = segments[0] ? decodeURIComponent(segments[0]) : ''
      if (!key || /\{\{.*\}\}/.test(key)) return null
      const patch = { serverUrl: url.origin, deviceKey: key }
      const sound = url.searchParams.get('sound')
      if (sound !== null) patch.sound = sound
      const group = url.searchParams.get('group')
      if (group !== null) patch.group = group
      const openUrl = url.searchParams.get('url')
      if (openUrl !== null) patch.openUrl = openUrl
      return patch
    }

    const DEFAULTS = {
      enabled: true,
      serverUrl: 'https://api.day.app',
      method: 'get',
      notifyQuestions: true,
      notifyApprovals: true,
      notifyErrors: true,
      notifyFinished: false,
      notifyAcp: true,
      delayMs: 0,
      sound: 'alarm',
      group: 'dsh',
      includeContent: true,
      openUrl: '',
      hasKey: false,
      maskedKey: '',
      keySource: 'none',
    }

    function normalize(s) {
      if (!s || typeof s !== 'object') return { ...DEFAULTS }
      return {
        enabled: s.enabled !== false,
        serverUrl: typeof s.serverUrl === 'string' && s.serverUrl ? s.serverUrl : DEFAULTS.serverUrl,
        method: s.method === 'post' ? 'post' : 'get',
        notifyQuestions: s.notifyQuestions !== false,
        notifyApprovals: s.notifyApprovals !== false,
        notifyErrors: s.notifyErrors !== false,
        notifyFinished: s.notifyFinished === true,
        notifyAcp: s.notifyAcp !== false,
        delayMs: Number.isInteger(s.delayMs) && s.delayMs >= 0 ? s.delayMs : 0,
        sound: typeof s.sound === 'string' ? s.sound : DEFAULTS.sound,
        group: typeof s.group === 'string' ? s.group : DEFAULTS.group,
        includeContent: s.includeContent !== false,
        openUrl: typeof s.openUrl === 'string' ? s.openUrl : '',
        hasKey: s.hasKey === true,
        maskedKey: typeof s.maskedKey === 'string' ? s.maskedKey : '',
        keySource: typeof s.keySource === 'string' ? s.keySource : 'none',
      }
    }

    const FIELDS = ['enabled', 'serverUrl', 'method', 'notifyQuestions', 'notifyApprovals', 'notifyErrors', 'notifyFinished', 'notifyAcp', 'delayMs', 'sound', 'group', 'includeContent', 'openUrl']

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'bark-notify: dictionaries')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'bark-notify: styles')
        const t = ctx.locale.bind(NS)

        function Settings() {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const [saved, setSaved] = React.useState(null)
          const [draft, setDraft] = React.useState(null)
          const [deviceKey, setDeviceKey] = React.useState('')
          const [importText, setImportText] = React.useState('')
          const [confirmingClear, setConfirmingClear] = React.useState(false)
          const [status, setStatus] = React.useState({ kind: 'idle' })

          const load = React.useCallback(() => {
            setStatus({ kind: 'idle' })
            getJson('bark-notify/state')
              .then(raw => { const s = normalize(raw); setSaved(s); setDraft(s); setDeviceKey('') })
              .catch(e => setStatus({ kind: 'loadError', message: e.message }))
          }, [])

          React.useEffect(() => { load() }, [load])

          const val = draft ?? DEFAULTS
          const busy = status.kind === 'saving' || status.kind === 'testing' || saved === null
          const dirty = saved !== null && (deviceKey.trim() !== '' || FIELDS.some(f => saved[f] !== val[f]))
          const patch = change => { setDraft(d => ({ ...(d ?? DEFAULTS), ...change })); setStatus({ kind: 'idle' }) }

          const applyImport = () => {
            const parsed = parseBarkUrlTemplate(importText)
            if (!parsed) {
              setStatus({ kind: 'err', message: t('importInvalid') })
              return
            }
            const { deviceKey: parsedKey, ...rest } = parsed
            setDraft(d => ({ ...(d ?? DEFAULTS), ...rest }))
            setDeviceKey(parsedKey)
            setStatus({ kind: 'info', message: t('importFilled') })
          }

          const save = async () => {
            setStatus({ kind: 'saving' })
            try {
              const payload = {
                ...Object.fromEntries(FIELDS.map(f => [f, val[f]])),
                ...(deviceKey.trim() !== '' ? { deviceKey: deviceKey.trim() } : {}),
              }
              const next = normalize(await getJson('bark-notify/set', { method: 'POST', body: JSON.stringify(payload) }))
              setSaved(next)
              setDraft(next)
              setDeviceKey('')
              setStatus({ kind: 'ok', message: t('saved') })
            } catch (e) {
              setStatus({ kind: 'err', message: t('saveFailed') + e.message })
            }
          }

          const clearKey = async () => {
            setConfirmingClear(false)
            setStatus({ kind: 'saving' })
            try {
              const base = saved ?? DEFAULTS
              const payload = { ...Object.fromEntries(FIELDS.map(f => [f, base[f]])), clearKey: true }
              const next = normalize(await getJson('bark-notify/set', { method: 'POST', body: JSON.stringify(payload) }))
              setSaved(next)
              setDeviceKey('')
              setStatus({ kind: 'ok', message: t('saved') })
            } catch (e) {
              setStatus({ kind: 'err', message: t('saveFailed') + e.message })
            }
          }

          const testPush = async () => {
            setStatus({ kind: 'testing' })
            try {
              const payload = {
                ...Object.fromEntries(FIELDS.map(f => [f, val[f]])),
                ...(deviceKey.trim() !== '' ? { deviceKey: deviceKey.trim() } : {}),
              }
              await getJson('bark-notify/test', { method: 'POST', body: JSON.stringify(payload) })
              setStatus({ kind: 'ok', message: t('testSent') })
            } catch (e) {
              setStatus({ kind: 'err', message: t('testFailed') + e.message })
            }
          }

          const keyStatus = saved === null
            ? t('loading')
            : saved.keySource === 'credentials'
              ? t('keyStatusCreds', { masked: saved.maskedKey })
              : saved.keySource === 'env'
                ? t('keyStatusEnv', { masked: saved.maskedKey })
                : t('keyStatusNone')

          return h('div', { className: 'bn' },
            h('h4', { className: 'bn-title' }, t('title')),
            h('div', { className: 'bn-hint' }, t('hint')),

            h('div', { className: 'bn-section' },
              h('div', { className: 'bn-hint' }, t('importTitle')),
              h('div', { className: 'bn-import' },
                h('input', {
                  type: 'text',
                  value: importText,
                  disabled: busy,
                  'aria-label': t('importTitle'),
                  placeholder: t('importPlaceholder'),
                  onChange: e => setImportText(e.target.value),
                  onKeyDown: e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229 && importText.trim() !== '') {
                      e.preventDefault()
                      applyImport()
                    }
                  },
                }),
                h('button', { type: 'button', className: 'bn-btn', disabled: busy || importText.trim() === '', onClick: applyImport }, t('importApply')))),

            h('div', { className: 'bn-section' },
              h('label', { className: 'bn-row' },
                h('span', null, t('enabled')),
                h(Switch, { checked: val.enabled, disabled: busy, label: t('enabled'), onChange: enabled => patch({ enabled }) })),
              h('label', { className: 'bn-row' },
                h('span', null, t('serverUrl')),
                h('input', { type: 'url', value: val.serverUrl, disabled: busy, onChange: e => patch({ serverUrl: e.target.value }) })),
              h('label', { className: 'bn-row' },
                h('span', null, t('deviceKey')),
                h('input', {
                  type: 'password',
                  value: deviceKey,
                  disabled: busy,
                  autoComplete: 'off',
                  placeholder: saved?.hasKey ? t('keyPlaceholderSet') : t('keyPlaceholderEmpty'),
                  onChange: e => { setDeviceKey(e.target.value); setStatus({ kind: 'idle' }) },
                })),
              h('div', { className: 'bn-actions' },
                h('span', { className: `bn-note${saved === null ? '' : saved.hasKey ? ' ok' : ' warn'}` }, keyStatus),
                saved?.keySource === 'credentials'
                  ? (confirmingClear
                    ? h(React.Fragment, null,
                      h('button', { type: 'button', className: 'bn-btn', disabled: busy, onClick: () => void clearKey() }, t('clearKeyConfirm')),
                      h('button', { type: 'button', className: 'bn-btn', disabled: busy, onClick: () => setConfirmingClear(false) }, t('cancel')))
                    : h('button', { type: 'button', className: 'bn-btn', disabled: busy, onClick: () => setConfirmingClear(true) }, t('clearKey')))
                  : null),
              h('label', { className: 'bn-row' },
                h('span', null, t('method')),
                h('select', { value: val.method, disabled: busy, onChange: e => patch({ method: e.target.value }) },
                  h('option', { value: 'get' }, t('methodGet')),
                  h('option', { value: 'post' }, t('methodPost'))))),

            h('div', { className: 'bn-section' },
              h('div', { className: 'bn-hint' }, t('triggersTitle')),
              h('label', { className: 'bn-switch-row' },
                h('span', null, t('notifyQuestions')),
                h(Switch, { checked: val.notifyQuestions, disabled: busy, label: t('notifyQuestions'), onChange: notifyQuestions => patch({ notifyQuestions }) })),
              h('label', { className: 'bn-switch-row' },
                h('span', null, t('notifyApprovals')),
                h(Switch, { checked: val.notifyApprovals, disabled: busy, label: t('notifyApprovals'), onChange: notifyApprovals => patch({ notifyApprovals }) })),
              h('label', { className: 'bn-switch-row' },
                h('span', null, t('notifyErrors')),
                h(Switch, { checked: val.notifyErrors, disabled: busy, label: t('notifyErrors'), onChange: notifyErrors => patch({ notifyErrors }) })),
              h('label', { className: 'bn-switch-row' },
                h('span', null, t('notifyFinished')),
                h(Switch, { checked: val.notifyFinished, disabled: busy, label: t('notifyFinished'), onChange: notifyFinished => patch({ notifyFinished }) })),
              h('label', { className: 'bn-switch-row' },
                h('span', null, t('notifyAcp')),
                h(Switch, { checked: val.notifyAcp, disabled: busy, label: t('notifyAcp'), onChange: notifyAcp => patch({ notifyAcp }) })),
              h('label', { className: 'bn-switch-row' },
                h('span', null, t('includeContent')),
                h(Switch, { checked: val.includeContent, disabled: busy, label: t('includeContent'), onChange: includeContent => patch({ includeContent }) })),
              h('label', { className: 'bn-row' },
                h('span', null, t('delayMs')),
                h('input', {
                  type: 'number',
                  min: 0,
                  max: 600000,
                  step: 500,
                  value: val.delayMs,
                  disabled: busy,
                  onChange: e => patch({ delayMs: Math.max(0, Math.min(600000, Math.trunc(Number(e.target.value) || 0))) }),
                })),
              h('div', { className: 'bn-hint' }, t('delayHint')),
              h('label', { className: 'bn-row' },
                h('span', null, t('sound')),
                h('input', { type: 'text', value: val.sound, disabled: busy, onChange: e => patch({ sound: e.target.value }) })),
              h('label', { className: 'bn-row' },
                h('span', null, t('group')),
                h('input', { type: 'text', value: val.group, disabled: busy, onChange: e => patch({ group: e.target.value }) })),
              h('label', { className: 'bn-row' },
                h('span', null, t('openUrl')),
                h('input', { type: 'url', value: val.openUrl, disabled: busy, placeholder: t('openUrlPlaceholder'), onChange: e => patch({ openUrl: e.target.value }) }))),

            h('div', { className: 'bn-actions' },
              h('button', { type: 'button', className: 'bn-btn primary', disabled: busy || !dirty, onClick: save },
                status.kind === 'saving' ? t('saving') : t('save')),
              h('button', { type: 'button', className: 'bn-btn', disabled: busy || (!saved?.hasKey && deviceKey.trim() === ''), onClick: testPush },
                status.kind === 'testing' ? t('testing') : t('test')),
              status.kind === 'ok' ? h('span', { className: 'bn-note ok' }, status.message) : null,
              status.kind === 'info' ? h('span', { className: 'bn-note' }, status.message) : null,
              status.kind === 'loadError' ? h('span', { className: 'bn-note err', role: 'alert' }, t('loadFailed') + status.message, ' ',
                h('button', { type: 'button', className: 'bn-btn', onClick: load }, t('retry'))) : null,
              status.kind === 'err' ? h('span', { className: 'bn-note err', role: 'alert' }, status.message) : null))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: KEY,
          locale: NS,
        }, Settings))
      },
    }
  },
})
