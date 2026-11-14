/**
 * dsh-image-gen — browser half.
 *
 * - Settings on this bundle's Plugins page: per backend, pick a local model
 *   from the Host's live catalog (only Responses routes); plus the output directory.
 * - Conversation rows for `openai_image` / `grok_image`: reuse the built-in
 *   `read_image` row so the generated images show in its gallery.
 */
window.__ModuleLoader__.load({
  id: 'dsh-image-gen',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'image-gen'
    const KEY = 'dsh-image-gen'
    const SEP = '\u0000'

    const en = {
      rowOpenai: 'OpenAI image',
      rowGrok: 'Grok image',
      title: 'Image generation',
      hint: 'Each image tool calls the hosted image_generation tool through one of your local Responses models. The endpoint and key come from that model\'s provider.',
      onlyResponses: 'Only models on openai-responses providers are listed.',
      openaiTitle: 'OpenAI image (openai_image)',
      grokTitle: 'Grok image (grok_image)',
      enabled: 'Enabled',
      model: 'Model',
      loading: 'Loading models…',
      loadFailed: 'Could not load the model list.',
      retry: 'Retry',
      outputDir: 'Output directory',
      outputDirHint: 'Relative to the session working directory, or absolute.',
      none: 'Not set',
      unavailable: '(unavailable)',
      ready: 'Ready',
      notReady: 'Not offered: ',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved. The tools are re-registered.',
      saveFailed: 'Save failed: ',
    }
    const zh = {
      rowOpenai: 'OpenAI 画图',
      rowGrok: 'Grok 画图',
      title: '画图',
      hint: '每个画图工具都通过一个本地 Responses 模型调用托管的 image_generation 工具。地址和 key 取自该模型所在的 provider。',
      onlyResponses: '只列出 openai-responses 类型 provider 下的模型。',
      openaiTitle: 'OpenAI 画图（openai_image）',
      grokTitle: 'Grok 画图（grok_image）',
      enabled: '启用',
      model: '模型',
      loading: '正在加载模型…',
      loadFailed: '无法加载模型列表。',
      retry: '重试',
      outputDir: '输出目录',
      outputDirHint: '相对会话工作目录，或绝对路径。',
      none: '未设置',
      unavailable: '（不可用）',
      ready: '可用',
      notReady: '未提供给模型：',
      save: '保存',
      saving: '保存中…',
      saved: '已保存，工具已重新注册。',
      saveFailed: '保存失败：',
    }

    const CSS = `
.ig{--ig-line:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);--ig-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.ig-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.ig-hint,.ig-note{color:var(--dsw-alias-label-secondary);line-height:20px}
.ig-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.ig-note.err{color:var(--dsw-alias-state-error-primary)}
.ig-note.ok{color:var(--dsw-alias-state-success-primary)}
.ig-row{display:grid;grid-template-columns:120px minmax(0,360px);gap:8px;align-items:center}
.ig-row>span{color:var(--dsw-alias-label-secondary)}
.ig select,.ig input[type=text]{height:32px;min-width:0;padding:0 8px;border:var(--ig-line);border-radius:var(--ig-r);background:var(--dsw-alias-button-elevated-fill,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit}
.ig select{cursor:pointer}
.ig select:disabled,.ig input:disabled{opacity:.6;cursor:default}
.ig input[type=checkbox]{justify-self:start;width:16px;height:16px;cursor:pointer}
.ig select:focus-visible,.ig input:focus-visible,.ig-btn:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.ig-section{display:flex;flex-direction:column;gap:12px;padding-top:16px;border-top:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1)}
.ig-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ig-btn{height:30px;padding:0 14px;border:var(--ig-line);border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;transition:background-color .15s}
.ig-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.ig-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}
.ig-btn:disabled{opacity:.4;cursor:default}
@media (max-width:560px){.ig-row{grid-template-columns:1fr}}
`

    async function getJson(path, init) {
      const r = await fetch(path, { ...init, headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      return data
    }

    const KINDS = ['openai', 'grok']
    const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)
    function normalize(s) {
      const out = { responsesProviders: Array.isArray(s?.responsesProviders) ? s.responsesProviders : [], status: s?.status ?? {}, outputDir: typeof s?.outputDir === 'string' ? s.outputDir : '' }
      for (const kind of KINDS) {
        const b = s?.[kind] ?? {}
        out[kind] = { enabled: b.enabled !== false, provider: typeof b.provider === 'string' ? b.provider : '', model: typeof b.model === 'string' ? b.model : '' }
      }
      return out
    }
    const pickDraft = s => ({ outputDir: s.outputDir, openai: s.openai, grok: s.grok })
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

    return {
      inject: ['slots', 'locale', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'image-gen: dictionaries')
        const t = ctx.locale.bind(NS)

        // The built-in read_image row draws durable images through the
        // tool.call.images gallery. Adapt only its display input: the result's
        // presentation meta carries each saved path and attachment reference.
        function ImageRow(props) {
          const { block, toolName } = props
          const base = [...ctx.slots.entries('tool.call.toolview')]
            .filter(entry => entry.options?.key === 'read_image' && (entry.options.priority ?? 0) >= 0)
            .toSorted((a, b) => (a.options.priority ?? 0) - (b.options.priority ?? 0))[0]
          if (!base) return null

          const settled = 'kind' in block
          const call = settled ? block.call : block
          let args = {}
          try { args = JSON.parse(call?.argsRaw ?? '{}') ?? {} } catch {}
          const prompt = typeof args.prompt === 'string' ? args.prompt : block.args?.text('prompt') ?? ''
          const images = settled && !block.isError && isRecord(block.meta) && Array.isArray(block.meta.images)
            ? block.meta.images.filter(i => isRecord(i) && typeof i.path === 'string' && isRecord(i.attachment))
            : []
          const label = images[0]?.path ?? (prompt || '…')
          const displayCall = { ...call, name: 'read_image', argsRaw: JSON.stringify({ file_path: label }) }
          let display
          if (images.length > 0) {
            const envelope = `<path>${images[0].path}</path>\n<type>image</type>\n<content>\n${images.map(i => i.path).join('\n')}\n</content>`
            display = {
              ...block,
              call: displayCall,
              content: [{ type: 'text', text: envelope }, ...images.map(i => ({ type: 'image', attachment: i.attachment }))],
              meta: { path: images[0].path },
            }
          } else {
            display = settled ? { ...block, call: displayCall } : { ...block, ...displayCall }
          }
          const title = toolName === 'grok_image' ? t('rowGrok') : t('rowOpenai')
          return h(base.component, {
            ...props,
            toolName: 'read_image',
            block: display,
            t: (key, ...rest) => key === 'tool.title.readImage' ? title : props.t(key, ...rest),
          })
        }

        for (const key of ['openai_image', 'grok_image']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            locale: 'conversation',
            priority: -10,
            inject: () => ({ resolveFilePath: path => path }),
            children: { 'tool.call.images': { kind: 'single', scope: 'session' } },
          }, ImageRow))
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
          const loadState = React.useCallback(() => getJson('image-gen/state')
            .then(raw => { const s = normalize(raw); setSaved(s); setDraft(pickDraft(s)) })
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
          const allowed = new Set(saved?.responsesProviders ?? [])
          const groups = catalog.groups.filter(g => allowed.has(g.id))

          const busy = status.kind === 'saving' || saved === null || draft === null
          const dirty = saved !== null && draft !== null && !same(pickDraft(saved), draft)
          const patch = change => { setDraft(d => ({ ...d, ...change })); setStatus({ kind: 'idle' }) }
          const patchKind = (kind, change) => patch({ [kind]: { ...draft[kind], ...change } })

          const save = async () => {
            setStatus({ kind: 'saving' })
            try {
              await getJson('image-gen/set', { method: 'POST', body: JSON.stringify(draft) })
              setStatus({ kind: 'ok' })
              // The save restarts the Host half; read back its fresh status.
              setTimeout(loadState, 800)
            } catch (e) {
              setStatus({ kind: 'err', message: e.message })
            }
          }

          function section(kind) {
            const value = draft?.[kind] ?? { enabled: true, provider: '', model: '' }
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
              patchKind(kind, { provider, model })
            }
            const st = saved?.status?.[kind]
            const unchanged = saved !== null && same(saved[kind], value)
            return h('div', { className: 'ig-section', key: kind },
              h('h4', { className: 'ig-title' }, t(kind === 'grok' ? 'grokTitle' : 'openaiTitle')),
              h('label', { className: 'ig-row' },
                h('span', null, t('enabled')),
                h('input', { type: 'checkbox', checked: value.enabled, disabled: busy, onChange: e => patchKind(kind, { enabled: e.target.checked }) })),
              h('label', { className: 'ig-row' },
                h('span', null, t('model')),
                h('select', { value: key, disabled: busy || !value.enabled, onChange: onModel }, options)),
              unchanged && st && st !== 'disabled'
                ? h('div', { className: `ig-note ${st === 'ready' ? 'ok' : 'warn'}` }, st === 'ready' ? t('ready') : t('notReady') + st)
                : null)
          }

          return h('div', { className: 'ig' },
            h('style', null, CSS),
            h('h4', { className: 'ig-title' }, t('title')),
            h('div', { className: 'ig-hint' }, t('hint'), ' ', t('onlyResponses')),
            catalog.status === 'loading' ? h('div', { className: 'ig-note' }, t('loading')) : null,
            catalog.status === 'error' ? h('div', { className: 'ig-note err' }, t('loadFailed'), ' ',
              h('button', { type: 'button', className: 'ig-btn', onClick: loadCatalog }, t('retry'))) : null,
            h('label', { className: 'ig-row' },
              h('span', null, t('outputDir')),
              h('input', { type: 'text', value: draft?.outputDir ?? '', spellCheck: false, disabled: busy, onChange: e => patch({ outputDir: e.target.value }) })),
            h('div', { className: 'ig-note' }, t('outputDirHint')),
            section('openai'),
            section('grok'),
            h('div', { className: 'ig-actions' },
              h('button', { type: 'button', className: 'ig-btn primary', disabled: busy || !dirty, onClick: save },
                status.kind === 'saving' ? t('saving') : t('save')),
              status.kind === 'ok' ? h('span', { className: 'ig-note ok' }, t('saved')) : null,
              status.kind === 'err' ? h('span', { className: 'ig-note err' }, t('saveFailed') + status.message) : null))
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
