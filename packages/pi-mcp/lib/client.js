window.__ModuleLoader__.load({
  id: 'dsh-pi-mcp',
  factory(require) {
    const React = require('react')
    const { Button, Switch, Tag } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'pi-mcp'
    const KEY = 'dsh-pi-mcp'

    const DICTS = {
      en: {
        title: 'Pi MCP Servers',
        hint: 'Mirrors servers from your Pi mcp.json into DSH. Toggle servers on or off immediately without editing YAML.',
        sourceFile: 'Source file',
        reload: 'Reload',
        loading: 'Loading MCP servers…',
        loadFailed: 'Could not load Pi MCP state: ',
        saveFailed: 'Could not update disabled servers: ',
        fileMissing: 'mcp.json was not found at the path above.',
        empty: 'No MCP servers configured in mcp.json.',
        active: 'Active',
        disabled: 'Disabled',
        disabledEnv: 'Disabled by env',
        disabledFile: 'Disabled in mcp.json',
        skipped: 'Skipped',
      },
      zh: {
        title: 'Pi MCP 服务器',
        hint: '将 Pi 的 mcp.json 中的服务器镜像到 DSH。直接切换开关即可实时生效，无需手改 YAML。',
        sourceFile: '配置文件',
        reload: '重新加载',
        loading: '正在读取 MCP 服务器…',
        loadFailed: '读取 Pi MCP 状态失败：',
        saveFailed: '更新服务器开关失败：',
        fileMissing: '未在上方路径找到 mcp.json 文件。',
        empty: 'mcp.json 中暂未配置任何 MCP 服务器。',
        active: '已启用',
        disabled: '已禁用',
        disabledEnv: '由环境变量禁用',
        disabledFile: 'mcp.json 中已关闭',
        skipped: '已跳过',
      },
    }

    const CSS = `
.pm-wrap{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13)}
.pm-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.pm-title{margin:0;font:var(--dsw-font-sm-14);font-weight:600}
.pm-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.45}
.pm-file{font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.pm-list{display:flex;flex-direction:column;gap:6px}
.pm-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:var(--dsw-radius-sm,8px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base)}
.pm-row-main{display:flex;flex-direction:column;gap:3px;min-width:0}
.pm-row-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.pm-name{font-weight:500}
.pm-reason{font-size:12px;color:var(--dsw-alias-state-warn-primary)}
.pm-error{font-size:12px;color:var(--dsw-alias-state-error-primary)}
`

    async function fetchJson(url, init) {
      const res = await fetch(url, { cache: 'no-store', ...init })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
      return data
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dict), `pi-mcp: ${lang}`)
        }
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-pi-mcp'
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'pi-mcp: styles')

        function Settings({ t }) {
          const [state, setState] = React.useState(null)
          const [busy, setBusy] = React.useState(false)
          const [error, setError] = React.useState('')

          const load = React.useCallback(async (reload = false) => {
            setBusy(true)
            setError('')
            try {
              const next = await fetchJson(reload ? 'pi-mcp/state?reload=1' : 'pi-mcp/state')
              setState(next)
            } catch (err) {
              setError(t('loadFailed') + (err instanceof Error ? err.message : String(err)))
            } finally {
              setBusy(false)
            }
          }, [t])

          React.useEffect(() => { void load(false) }, [load])

          const toggleServer = async (serverName, enabled) => {
            if (!state) return
            const current = new Set(state.disabledServers ?? [])
            if (enabled) current.delete(serverName)
            else current.add(serverName)
            setBusy(true)
            setError('')
            try {
              const next = await fetchJson('pi-mcp/set', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ disabledServers: [...current] }),
              })
              setState(next)
            } catch (err) {
              setError(t('saveFailed') + (err instanceof Error ? err.message : String(err)))
            } finally {
              setBusy(false)
            }
          }

          return h('div', { className: 'pm-wrap' },
            h('div', { className: 'pm-head' },
              h('h4', { className: 'pm-title' }, t('title')),
              h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: () => void load(true) }, t('reload'))),
            h('div', { className: 'pm-hint' }, t('hint')),
            state?.file && h('div', { className: 'pm-file' }, `${t('sourceFile')}: ${state.file}`),
            error && h('div', { className: 'pm-error', role: 'alert' }, error),
            state?.error && h('div', { className: 'pm-error', role: 'alert' }, state.error),
            !state && !error && h('div', { className: 'pm-hint' }, t('loading')),
            state && !state.exists && !state.error && h('div', { className: 'pm-hint' }, t('fileMissing')),
            state && state.exists && !state.error && state.servers.length === 0 && h('div', { className: 'pm-hint' }, t('empty')),
            state && state.servers.length > 0 && h('div', { className: 'pm-list' }, state.servers.map(server => {
              const locked = server.disabledByEnv || server.disabledInFile
              const checked = !server.disabledByConfig && !locked
              return h('div', { key: server.name, className: 'pm-row' },
                h('div', { className: 'pm-row-main' },
                  h('div', { className: 'pm-row-top' },
                    h('span', { className: 'pm-name' }, server.name),
                    server.transport && h(Tag, { tone: 'quiet' }, server.transport),
                    server.active && h(Tag, { tone: 'success' }, t('active')),
                    server.disabledByEnv && h(Tag, { tone: 'quiet' }, t('disabledEnv')),
                    server.disabledInFile && h(Tag, { tone: 'quiet' }, t('disabledFile')),
                    !server.active && server.disabledByConfig && h(Tag, { tone: 'quiet' }, t('disabled')),
                    server.skippedReason && h(Tag, { tone: 'danger' }, t('skipped'))),
                  server.skippedReason && h('div', { className: 'pm-reason' }, server.skippedReason)),
                h(Switch, {
                  checked,
                  disabled: busy || locked,
                  label: server.name,
                  onChange: next => void toggleServer(server.name, next),
                }))
            })))
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
