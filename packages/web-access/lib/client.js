/**
 * dsh-web-access — browser half.
 *
 * Settings on this bundle's Plugins page: per backend, pick a local model from
 * the Host's live catalog (only Responses routes) and the hosted search types
 * it may use. The Host derives endpoint and key from the chosen route.
 */
window.__ModuleLoader__.load({
  id: 'dsh-web-access',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'web-access'
    const KEY = 'dsh-web-access'
    const SEP = '\u0000'

    const en = {
      searchGrok: 'Grok search',
      searchOpenai: 'OpenAI search',
      searchWeb: 'Web',
      searchHosted: 'Hosted search',
      searchSources: 'sources',
      title: 'Web access',
      hint: 'Each search tool calls a hosted search through one of your local Responses models. The endpoint and key come from that model\'s provider.',
      grokTitle: 'Grok search (grok_search)',
      openaiTitle: 'OpenAI search (openai_search)',
      enabled: 'Enabled',
      model: 'Model',
      searchType: 'Search type',
      none: 'Not set',
      unavailable: '(unavailable)',
      typeWeb: 'Web (web_search)',
      typeX: 'X (x_search)',
      typeBoth: 'Web + X',
      typeWebOnly: 'Web (web_search) only',
      onlyResponses: 'Only models on openai-responses providers are listed.',
      ready: 'Ready',
      notReady: 'Not offered: ',
      loading: 'Loading models…',
      loadFailed: 'Could not load the model list.',
      retry: 'Retry',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved. The tools are re-registered.',
      saveFailed: 'Save failed: ',
    }
    const zh = {
      searchGrok: 'Grok 搜索',
      searchOpenai: 'OpenAI 搜索',
      searchWeb: '网页',
      searchHosted: '托管搜索',
      searchSources: '个来源',
      title: '联网搜索',
      hint: '每个搜索工具都通过一个本地 Responses 模型调用托管搜索。地址和 key 取自该模型所在的 provider。',
      grokTitle: 'Grok 搜索（grok_search）',
      openaiTitle: 'OpenAI 搜索（openai_search）',
      enabled: '启用',
      model: '模型',
      searchType: '搜索类型',
      none: '未设置',
      unavailable: '（不可用）',
      typeWeb: '网页（web_search）',
      typeX: 'X（x_search）',
      typeBoth: '网页 + X',
      typeWebOnly: '仅网页（web_search）',
      onlyResponses: '只列出 openai-responses 类型 provider 下的模型。',
      ready: '可用',
      notReady: '未提供给模型：',
      loading: '正在加载模型…',
      loadFailed: '无法加载模型列表。',
      retry: '重试',
      save: '保存',
      saving: '保存中…',
      saved: '已保存，工具已重新注册。',
      saveFailed: '保存失败：',
    }

    const CSS = `
.wa{--wa-line:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);--wa-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.wa-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.wa-hint,.wa-note{color:var(--dsw-alias-label-secondary);line-height:20px}
.wa-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.wa-note.err{color:var(--dsw-alias-state-error-primary)}
.wa-note.ok{color:var(--dsw-alias-state-success-primary)}
.wa-row{display:grid;grid-template-columns:120px minmax(0,360px);gap:8px;align-items:center}
.wa-row>span{color:var(--dsw-alias-label-secondary)}
.wa select{height:32px;min-width:0;padding:0 8px;border:var(--wa-line);border-radius:var(--wa-r);background:var(--dsw-alias-button-elevated-fill,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}
.wa select:disabled{opacity:.6;cursor:default}
.wa input[type=checkbox]{justify-self:start;width:16px;height:16px;cursor:pointer}
.wa select:focus-visible,.wa-btn:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.wa-section{display:flex;flex-direction:column;gap:12px;padding-top:16px;border-top:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1)}
.wa-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.wa-btn{height:30px;padding:0 14px;border:var(--wa-line);border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;transition:background-color .15s}
.wa-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.wa-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}
.wa-btn:disabled{opacity:.4;cursor:default}
@media (max-width:560px){.wa-row{grid-template-columns:1fr}}
`

    async function getJson(path, init) {
      const r = await fetch(path, { ...init, headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      return data
    }

    const KINDS = ['grok', 'openai']
    const blank = kind => ({ enabled: true, provider: '', model: '', tools: kind === 'grok' ? ['web_search', 'x_search'] : ['web_search'] })
    function normalize(s) {
      const out = { responsesProviders: Array.isArray(s?.responsesProviders) ? s.responsesProviders : [], status: s?.status ?? {} }
      for (const kind of KINDS) {
        const b = s?.[kind] ?? {}
        out[kind] = {
          enabled: b.enabled !== false,
          provider: typeof b.provider === 'string' ? b.provider : '',
          model: typeof b.model === 'string' ? b.model : '',
          tools: Array.isArray(b.tools) ? b.tools : blank(kind).tools,
        }
      }
      return out
    }
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

    return {
      inject: ['slots', 'locale', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'web-access: dictionaries')
        const t = ctx.locale.bind(NS)

        // The built-in web view is keyed to web_search, not presentation.card.
        // Adapt only its display input. Keep persisted calls and inspect untouched.
        function SearchRow(props) {
          const { block, toolName } = props
          const entries = [...ctx.slots.entries('tool.call.toolview')]
            .filter(entry => entry.options?.key === 'web_search' && (entry.options.priority ?? 0) >= 0)
            .toSorted((a, b) => (a.options.priority ?? 0) - (b.options.priority ?? 0))
          const base = entries[0]
          if (!base) return null

          const settled = 'kind' in block
          const call = settled ? block.call : block
          let args = {}
          try { args = JSON.parse(call?.argsRaw ?? '{}') ?? {} } catch {}
          const query = typeof args.query === 'string' ? args.query : block.args?.text('query') ?? ''
          const meta = block.meta
          const sources = Array.isArray(meta?.sources) ? meta.sources : []
          const channels = toolName === 'openai_search' ? ['web'] : args.sources
          const channel = Array.isArray(channels) && channels.length === 1
            ? channels[0] === 'x' ? 'X' : t('searchWeb')
            : Array.isArray(channels) && channels.includes('web') && channels.includes('x')
              ? `${t('searchWeb')} + X` : t('searchHosted')
          const count = settled && !block.isError ? ` · ${sources.length} ${t('searchSources')}` : ''
          const summary = [query, channel].filter(Boolean).join(' · ') + count
          const displayCall = { ...call, name: 'web_search', argsRaw: JSON.stringify({ queries: [query || '…'] }) }
          // Native web card validation requires truncated, including older results.
          const display = {
            ...block,
            ...(settled ? { call: displayCall, meta: { ...meta, truncated: meta?.truncated === true } } : displayCall),
            args: {
              text: key => key === 'description' ? summary : block.args?.text(key),
              complete: key => key === 'description' || (block.args?.complete(key) ?? false),
            },
          }
          const title = toolName === 'grok_search' ? t('searchGrok') : t('searchOpenai')
          return h(base.component, {
            ...props,
            toolName: 'web_search',
            block: display,
            t: (key, ...rest) => key === 'tool.title.webSearch' ? title : props.t(key, ...rest),
          })
        }

        for (const key of ['grok_search', 'openai_search']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview', key, locale: 'conversation', priority: -10,
          }, SearchRow))
        }

        function Settings() {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const [catalog, setCatalog] = React.useState({ status: 'loading', groups: [] })
          const [saved, setSaved] = React.useState(null)
          const [draft, setDraft] = React.useState(null)
          const [status, setStatus] = React.useState({ kind: 'idle' })

          const loadCatalog = React.useCallback(async () => {
            setCatalog(c => ({ ...c, status: 'loading' }))
            try {
              const res = await ctx.remote.session.modelCatalog()
              if (!res.ok) throw res.error ?? new Error('catalog')
              setCatalog({ status: 'ready', groups: res.value.groups })
            } catch {
              setCatalog(c => ({ ...c, status: 'error' }))
            }
          }, [])
          const loadState = React.useCallback(() => getJson('web-access/state')
            .then(raw => { const s = normalize(raw); setSaved(s); setDraft({ grok: s.grok, openai: s.openai }) })
            .catch(e => setStatus({ kind: 'err', message: e.message })), [])

          React.useEffect(() => {
            loadCatalog()
            loadState()
            const offs = [
              ctx.remote.$on('llm/adapters-updated', loadCatalog),
              ctx.remote.$on('settings/document-updated', loadCatalog),
            ]
            return () => offs.forEach(off => { try { off() } catch {} })
          }, [loadCatalog, loadState])

          const busy = status.kind === 'saving' || saved === null || draft === null
          const allowed = new Set(saved?.responsesProviders ?? [])
          const groups = catalog.groups.filter(g => allowed.has(g.id))
          const dirty = saved !== null && draft !== null && KINDS.some(k => !same(saved[k], draft[k]))

          const patch = (kind, change) => { setDraft(d => ({ ...d, [kind]: { ...d[kind], ...change } })); setStatus({ kind: 'idle' }) }

          const save = async () => {
            setStatus({ kind: 'saving' })
            try {
              await getJson('web-access/set', { method: 'POST', body: JSON.stringify(draft) })
              setStatus({ kind: 'ok' })
              // The save restarts the Host half; read back its fresh status.
              setTimeout(loadState, 800)
            } catch (e) {
              setStatus({ kind: 'err', message: e.message })
            }
          }

          function section(kind) {
            const value = draft?.[kind] ?? blank(kind)
            const key = value.provider === '' ? '' : `${value.provider}${SEP}${value.model}`
            const found = catalog.groups.find(g => g.id === value.provider)?.models.find(m => m.id === value.model)
            const options = [h('option', { key: '', value: '' }, t('none'))]
            for (const g of groups) {
              options.push(h('optgroup', { key: g.id, label: g.name },
                g.models.map(m => h('option', { key: m.id, value: `${g.id}${SEP}${m.id}` }, m.name))))
            }
            if (key !== '' && (found === undefined || !allowed.has(value.provider))) {
              options.push(h('option', { key: 'missing', value: key }, `${value.provider}/${value.model} ${t('unavailable')}`))
            }
            const onModel = e => {
              const [provider = '', model = ''] = e.target.value === '' ? [] : e.target.value.split(SEP)
              patch(kind, { provider, model })
            }
            const typeValue = value.tools.length === 2 ? 'both' : value.tools[0] === 'x_search' ? 'x' : 'web'
            const onType = e => patch(kind, { tools: { web: ['web_search'], x: ['x_search'], both: ['web_search', 'x_search'] }[e.target.value] })
            const st = saved?.status?.[kind]
            const unchanged = saved !== null && same(saved[kind], value)
            return h('div', { className: 'wa-section', key: kind },
              h('h4', { className: 'wa-title' }, t(kind === 'grok' ? 'grokTitle' : 'openaiTitle')),
              h('label', { className: 'wa-row' },
                h('span', null, t('enabled')),
                h('input', { type: 'checkbox', checked: value.enabled, disabled: busy, onChange: e => patch(kind, { enabled: e.target.checked }) })),
              h('label', { className: 'wa-row' },
                h('span', null, t('model')),
                h('select', { value: key, onChange: onModel, disabled: busy || !value.enabled }, options)),
              h('label', { className: 'wa-row' },
                h('span', null, t('searchType')),
                kind === 'grok'
                  ? h('select', { value: typeValue, onChange: onType, disabled: busy || !value.enabled },
                    h('option', { value: 'web' }, t('typeWeb')),
                    h('option', { value: 'x' }, t('typeX')),
                    h('option', { value: 'both' }, t('typeBoth')))
                  : h('select', { value: 'web', disabled: true }, h('option', { value: 'web' }, t('typeWebOnly')))),
              unchanged && st && st !== 'disabled'
                ? h('div', { className: `wa-note ${st === 'ready' ? 'ok' : 'warn'}` }, st === 'ready' ? t('ready') : t('notReady') + st)
                : null)
          }

          return h('div', { className: 'wa' },
            h('style', null, CSS),
            h('h4', { className: 'wa-title' }, t('title')),
            h('div', { className: 'wa-hint' }, t('hint'), ' ', t('onlyResponses')),
            catalog.status === 'loading' ? h('div', { className: 'wa-note' }, t('loading')) : null,
            catalog.status === 'error' ? h('div', { className: 'wa-note err' }, t('loadFailed'), ' ',
              h('button', { type: 'button', className: 'wa-btn', onClick: loadCatalog }, t('retry'))) : null,
            section('grok'),
            section('openai'),
            h('div', { className: 'wa-actions' },
              h('button', { type: 'button', className: 'wa-btn primary', disabled: busy || !dirty, onClick: save },
                status.kind === 'saving' ? t('saving') : t('save')),
              status.kind === 'ok' ? h('span', { className: 'wa-note ok' }, t('saved')) : null,
              status.kind === 'err' ? h('span', { className: 'wa-note err' }, t('saveFailed') + status.message) : null))
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
