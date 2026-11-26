window.__ModuleLoader__.load({
  id: 'dsh-web-access',
  factory(require) {
    const React = require('react')
    const {
      DisclosureRow,
      IconGlobeOutlineRegular,
      IconInspectOutlineRegular,
      Switch,
      Tag,
      TextShimmer,
      WebBlock,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'web-access'
    const KEY = 'dsh-web-access'
    const SEP = '\u0000'

    const en = {
      searchGrok: 'Grok search',
      searchOpenai: 'OpenAI search',
      searchWeb: 'Web',
      searchHosted: 'Hosted search',
      searchSources: '{n} sources',
      searchStopped: 'Stopped',
      searchInspect: 'Inspect',
      searchError: 'Error',
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
      searchSources: '{n} 个来源',
      searchStopped: '已中止',
      searchInspect: '查看',
      searchError: '错误',
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
.wa{--wa-line:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l3);--wa-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.wa-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.wa-hint,.wa-note{color:var(--dsw-alias-label-secondary);line-height:20px}
.wa-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.wa-note.err{color:var(--dsw-alias-state-error-primary)}
.wa-note.ok{color:var(--dsw-alias-state-success-primary)}
.wa-row{display:grid;grid-template-columns:132px minmax(0,380px);gap:8px;align-items:center}
.wa-row:has([role=switch]){cursor:pointer}
.wa-row:has([role=switch]:disabled){cursor:default}
.wa-row>span{color:var(--dsw-alias-label-secondary)}
.wa select{height:32px;min-width:0;padding:0 10px;border:var(--wa-line);border-radius:var(--wa-r);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}
.wa select:disabled{opacity:.6;cursor:default}
.wa select:focus-visible,.wa-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wa-section{display:flex;flex-direction:column;gap:12px;padding-top:14px;border-top:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l1)}
.wa-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.wa-btn{height:30px;padding:0 14px;border:var(--wa-line);border-radius:999px;corner-shape:round;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;transition:background-color .15s}
.wa-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.wa-btn:disabled{opacity:.4;cursor:default}
@media (hover:hover){.wa-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.wa-btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media (pointer:coarse){.wa select{font-size:16px}}
@media (max-width:560px){.wa-row{grid-template-columns:1fr}}
.wa-card{display:flex;flex-direction:column}
.wa-tool-row{min-width:0}
.wa-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.wa-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.wa-summary.wa-err{color:var(--dsw-alias-state-error-primary)}
.wa-summary.wa-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.wa-err-badge{flex:0 1 auto;min-width:0;max-width:min(45%,300px);margin-left:8px;gap:5px}
.wa-err-dot{flex:none;width:4px;height:4px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-state-error-primary)}
.wa-err-text{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wa-suffix{flex:none;margin-left:4px;white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.wa-body{display:flex;flex-direction:column;min-width:0}
.wa-web{margin:4px 0 4px 4px}
.wa-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.wa-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.wa-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.wa-io-sec::-webkit-scrollbar-track{margin:6px 0}
.wa-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.wa-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.wa-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.wa-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.wa-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.wa-inspect:focus-visible{opacity:1;outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (hover:hover){.wa-card:hover .wa-inspect{opacity:1}.wa-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.wa-inspect{opacity:1}}
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

    function firstLine(text) {
      if (typeof text !== 'string') return ''
      const index = text.indexOf('\n')
      return index === -1 ? text : text.slice(0, index)
    }

    function resultText(block) {
      if (!block || !('kind' in block) || !Array.isArray(block.content)) return ''
      return block.content.filter(item => item.type === 'text').map(item => item.text).join('\n')
    }

    function parseSearchBlock(toolName, phase, block) {
      const settled = phase === 'result' && block && 'kind' in block
      const call = settled ? block.call : block
      let args = {}
      try {
        const parsed = JSON.parse(call?.argsRaw ?? '{}')
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed
      } catch {}
      const query = typeof args.query === 'string' ? args.query : block?.args?.text?.('query') ?? ''
      const meta = settled && !block.isError && block.meta && typeof block.meta === 'object' ? block.meta : {}
      const sources = Array.isArray(meta.sources) ? meta.sources : []
      const answer = typeof meta.answer === 'string' ? meta.answer : ''
      const channels = toolName === 'openai_search' ? ['web'] : Array.isArray(args.sources) ? args.sources : undefined
      const state = phase === 'preparing' ? 'preparing'
        : !settled ? 'running'
          : block.error?.code === 'interrupted' ? 'stopped'
            : block.isError ? 'error' : 'ok'
      return { state, query, answer, sources, channels, model: typeof meta.model === 'string' ? meta.model : '', text: settled ? resultText(block) : '' }
    }

    function webLabels(ct) {
      return {
        noResults: ct('web.noResults'),
        sourcesTruncated: ct('web.sourcesTruncated'),
        http: code => ct('web.http', { code }),
        contentTruncated: ct('web.contentTruncated'),
        markdown: {
          code: {
            copyLabel: ct('copy'),
            copiedLabel: ct('copied'),
            toolbarLabels: {
              codeLabel: ct('codeBlock.title'),
              wrapLabel: ct('codeBlock.wrap'),
              unwrapLabel: ct('codeBlock.unwrap'),
            },
          },
          footnotes: ct('web.footnotes'),
        },
      }
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'web-access: dictionaries')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'web-access: styles')
        const t = ctx.locale.bind(NS)
        const ct = ctx.locale.bind('conversation')

        function SearchRow({ toolName, phase, block, inspect, useDisclosure }) {
          const localeSnap = React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const { expanded, toggle } = useDisclosure()
          const parsed = parseSearchBlock(toolName, phase, block)
          const labels = React.useMemo(() => webLabels(ct), [localeSnap])
          const title = toolName === 'grok_search' ? t('searchGrok') : t('searchOpenai')
          const running = parsed.state === 'preparing' || parsed.state === 'running'
          const channel = Array.isArray(parsed.channels) && parsed.channels.length === 1
            ? (parsed.channels[0] === 'x' ? 'X' : t('searchWeb'))
            : Array.isArray(parsed.channels) && parsed.channels.includes('web') && parsed.channels.includes('x')
              ? `${t('searchWeb')} + X` : t('searchHosted')
          const hasWebResult = parsed.state === 'ok' && (parsed.answer.length > 0 || parsed.sources.length > 0)
          const hasErrorBody = parsed.state === 'error' && parsed.text.length > 0
          const expandable = hasWebResult || hasErrorBody
          const open = expanded && expandable

          const errorLine = parsed.state === 'error' && parsed.text ? firstLine(parsed.text) : ''
          const showErrorBadge = parsed.state === 'error' && Boolean(parsed.query && errorLine)
          const summaryIsError = parsed.state === 'error' && !parsed.query && Boolean(errorLine)
          let summary = parsed.query
          if (parsed.state === 'stopped') summary = t('searchStopped')
          else if (summaryIsError) summary = errorLine
          const settledWithCue = parsed.state === 'error' || parsed.state === 'stopped'
          const suffix = settledWithCue ? '' : [
            channel,
            parsed.state === 'ok' ? t('searchSources', { n: parsed.sources.length }) : '',
          ].filter(Boolean).join(' · ')

          return h('div', { className: 'wa-card', 'data-tool': toolName, 'data-state': parsed.state },
            h(DisclosureRow, {
              rowClassName: 'wa-tool-row',
              icon: h(IconGlobeOutlineRegular, { size: 14 }),
              title,
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: parsed.state === 'preparing' ? null : h(React.Fragment, null,
                summary ? h(React.Fragment, null,
                  h('span', { className: 'wa-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                  h('span', {
                    className: `wa-summary${summaryIsError ? ' wa-err' : parsed.state === 'stopped' ? ' wa-stop' : ''}`,
                    title: summary,
                  }, h(TextShimmer, null, summary))) : null,
                showErrorBadge ? h(Tag, { tone: 'neutral', className: 'wa-err-badge', title: errorLine },
                  h('span', { className: 'wa-err-dot', 'aria-hidden': true }),
                  h('span', { className: 'wa-err-text', title: errorLine }, errorLine)) : null,
                suffix ? h(TextShimmer, { className: 'wa-suffix' }, summary ? `· ${suffix}` : suffix) : null),
            },
            open ? h('div', { className: 'wa-body' },
              hasWebResult ? h(WebBlock, {
                kind: 'search',
                answer: parsed.answer || undefined,
                sources: parsed.sources,
                truncated: false,
                labels,
                className: 'wa-web',
              }) : null,
              hasErrorBody ? h('div', { className: 'wa-io' },
                parsed.query ? h('div', { className: 'wa-io-sec' },
                  h('span', { className: 'wa-io-label' }, ct('row.input')),
                  h('span', { className: 'wa-io-text' }, parsed.query)) : null,
                parsed.query ? h('span', { className: 'wa-io-div', 'aria-hidden': true }) : null,
                h('div', { className: 'wa-io-sec' },
                  h('span', { className: 'wa-io-label' }, ct('row.output')),
                  h('span', { className: 'wa-io-text', 'data-error': true }, parsed.text))) : null,
              inspect ? h('button', { type: 'button', className: 'wa-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('searchInspect')) : null) : null))
        }

        for (const key of ['grok_search', 'openai_search']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview', key, locale: NS, priority: -10,
          }, SearchRow))
        }

        function Settings() {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const [catalog, setCatalog] = React.useState({ status: 'loading', groups: [] })
          const [saved, setSaved] = React.useState(null)
          const [draft, setDraft] = React.useState(null)
          const [status, setStatus] = React.useState({ kind: 'idle' })

          const catalogRead = React.useRef(0)
          const loadCatalog = React.useCallback(async () => {
            const id = ++catalogRead.current
            setCatalog(c => ({ ...c, status: 'loading' }))
            try {
              const res = await ctx.remote.session.modelCatalog()
              if (id !== catalogRead.current) return
              if (!res.ok) throw res.error ?? new Error('catalog')
              setCatalog({ status: 'ready', groups: res.value.groups })
            } catch {
              if (id === catalogRead.current) setCatalog(c => ({ ...c, status: 'error' }))
            }
          }, [])
          const loadState = React.useCallback(() => getJson('web-access/state')
            .then(raw => { const s = normalize(raw); setSaved(s); setDraft({ grok: s.grok, openai: s.openai }); setStatus({ kind: 'idle' }) })
            .catch(e => setStatus({ kind: 'loadError', message: e.message })), [])

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
              const raw = await getJson('web-access/set', { method: 'POST', body: JSON.stringify(draft) })
              const s = normalize({ responsesProviders: saved.responsesProviders, ...raw })
              setSaved(s); setDraft({ grok: s.grok, openai: s.openai }); setStatus({ kind: 'ok' })
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
                h(Switch, { checked: value.enabled, disabled: busy, label: t('enabled'), onChange: enabled => patch(kind, { enabled }) })),
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
            h('h4', { className: 'wa-title' }, t('title')),
            h('div', { className: 'wa-hint' }, t('hint'), ' ', t('onlyResponses')),
            catalog.status === 'loading' ? h('div', { className: 'wa-note' }, t('loading')) : null,
            catalog.status === 'error' ? h('div', { className: 'wa-note err', role: 'alert' }, t('loadFailed'), ' ',
              h('button', { type: 'button', className: 'wa-btn', onClick: loadCatalog }, t('retry'))) : null,
            section('grok'),
            section('openai'),
            h('div', { className: 'wa-actions' },
              h('button', { type: 'button', className: 'wa-btn primary', disabled: busy || !dirty, onClick: save },
                status.kind === 'saving' ? t('saving') : t('save')),
              status.kind === 'ok' ? h('span', { className: 'wa-note ok', role: 'status' }, t('saved')) : null,
              status.kind === 'loadError' ? h('span', { className: 'wa-note err', role: 'alert' }, t('loadFailed'), ' ', status.message, ' ',
                h('button', { type: 'button', className: 'wa-btn', onClick: loadState }, t('retry'))) : null,
              status.kind === 'err' ? h('span', { className: 'wa-note err', role: 'alert' }, t('saveFailed') + status.message) : null))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: KEY,
          locale: NS,
        }, Settings))
      },
      _internal: { parseSearchBlock, webLabels },
    }
  },
})
