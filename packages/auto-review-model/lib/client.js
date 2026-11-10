/**
 * dsh-auto-review-model — browser half.
 *
 * Settings on this bundle's Plugins page: pick the Auto review model from the
 * Host's live model catalog (the same providers and models as the composer's
 * model picker), plus an optional reasoning effort.
 */
window.__ModuleLoader__.load({
  id: 'dsh-auto-review-model',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'auto-review-model'
    const KEY = 'dsh-auto-review-model'
    const SEP = '\u0000'

    const en = {
      title: 'Auto review model',
      hint: 'Auto review sends one extra request per tool call. Choose the model that judges those calls. "Same as session" keeps the built-in behavior.',
      model: 'Model',
      effort: 'Reasoning effort',
      sameAsSession: 'Same as session',
      modelDefault: 'Model default',
      unavailable: '(unavailable)',
      loading: 'Loading models…',
      loadFailed: 'Could not load the model list.',
      partial: 'Some providers failed to load their models.',
      retry: 'Retry',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved.',
      saveFailed: 'Save failed: ',
      warning: 'The reviewer must answer with strict JSON. Small models may fail often, and a failed review blocks the tool call.',
      promptTitle: 'Review prompt',
      promptMode: 'Mode',
      modeDefault: 'Built-in',
      modeAppend: 'Append rules',
      modeReplace: 'Replace',
      appendHint: 'Your rules are added after the built-in policy. Risk levels and the JSON output format stay as built in.',
      replaceHint: 'Your text replaces the built-in policy entirely. It must still make the reviewer return exactly one of: {"risk":"low","decision":"allow"}, {"risk":"medium","decision":"allow"}, {"risk":"medium","decision":"deny","reason":"..."}, {"risk":"high","decision":"deny","reason":"..."}. Any other output fails the review and blocks the call.',
      appendPlaceholder: 'For example:\n- Treat git push as medium risk unless I named the branch.\n- Deleting files under /tmp is low risk.',
      loadDefault: 'Load built-in prompt',
      defaultUnknown: 'The built-in prompt becomes available after Auto review runs once.',
      restartNeeded: 'The Host is still running an older version of this plugin. Restart dsh to enable review prompt settings.',
    }
    const zh = {
      title: '自动审查模型',
      hint: '自动审查会为每次工具调用额外发一次请求。在这里选择负责审查的模型；“跟随会话”保持内置行为。',
      model: '模型',
      effort: '推理强度',
      sameAsSession: '跟随会话',
      modelDefault: '模型默认',
      unavailable: '（不可用）',
      loading: '正在加载模型…',
      loadFailed: '无法加载模型列表。',
      partial: '部分 provider 的模型加载失败。',
      retry: '重试',
      save: '保存',
      saving: '保存中…',
      saved: '已保存。',
      saveFailed: '保存失败：',
      warning: '审查模型必须输出严格的 JSON。小模型可能经常失败，审查失败时该工具调用不会执行。',
      promptTitle: '审查提示词',
      promptMode: '模式',
      modeDefault: '内置',
      modeAppend: '追加规则',
      modeReplace: '替换',
      appendHint: '你的规则会接在内置策略后面。风险分级和 JSON 输出格式保持内置不变。',
      replaceHint: '你的文本会完整替换内置策略，但仍须让审查模型只输出以下之一：{"risk":"low","decision":"allow"}、{"risk":"medium","decision":"allow"}、{"risk":"medium","decision":"deny","reason":"..."}、{"risk":"high","decision":"deny","reason":"..."}。其他输出都会导致审查失败，工具调用被拦下。',
      appendPlaceholder: '例如：\n- git push 一律视为 medium，除非我点名了分支。\n- 删除 /tmp 下的文件视为低风险。',
      loadDefault: '载入内置提示词',
      defaultUnknown: '内置提示词要在自动审查运行过一次后才能载入。',
      restartNeeded: 'Host 仍在运行旧版插件，重启 dsh 后才能使用审查提示词设置。',
    }

    const CSS = `
.arm{--arm-line:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l2);--arm-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.arm-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.arm-hint,.arm-note{color:var(--dsw-alias-label-secondary);line-height:20px}
.arm-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.arm-note.err{color:var(--dsw-alias-state-error-primary)}
.arm-note.ok{color:var(--dsw-alias-state-success-primary)}
.arm-row{display:grid;grid-template-columns:120px minmax(0,360px);gap:8px;align-items:center}
.arm-row>span{color:var(--dsw-alias-label-secondary)}
.arm select{height:32px;min-width:0;padding:0 8px;border:var(--arm-line);border-radius:var(--arm-r);background:var(--dsw-alias-button-elevated-fill,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}
.arm select:disabled,.arm textarea:disabled{opacity:.6;cursor:default}
.arm textarea{min-height:160px;padding:8px 10px;border:var(--arm-line);border-radius:var(--arm-r);background:var(--dsw-alias-markdown-code-block,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:12px/1.6 "SF Mono","JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;resize:vertical}
.arm select:focus-visible,.arm textarea:focus-visible,.arm-btn:focus-visible{outline:2px solid var(--dsw-alias-link,var(--dsw-alias-brand-primary));outline-offset:1px}
.arm-section{display:flex;flex-direction:column;gap:12px;padding-top:16px;border-top:var(--dsh-hairline-width,1px) solid var(--dsw-alias-border-l1)}
.arm-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.arm-btn{height:30px;padding:0 14px;border:var(--arm-line);border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;transition:background-color .15s}
.arm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.arm-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}
.arm-btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary)))}
.arm-btn:disabled{opacity:.4;cursor:default}
@media (max-width:560px){.arm-row{grid-template-columns:1fr}}
`

    async function getJson(path, init) {
      const r = await fetch(path, { ...init, headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      return data
    }

    // Fill fields an older Host omits, so the page never shows an undefined mode.
    const MODES = ['default', 'append', 'replace']
    function normalize(s) {
      const text = v => (typeof v === 'string' ? v : '')
      return {
        provider: text(s?.provider),
        model: text(s?.model),
        reasoningEffort: text(s?.reasoningEffort),
        promptMode: MODES.includes(s?.promptMode) ? s.promptMode : 'default',
        prompt: text(s?.prompt),
        defaultPrompt: text(s?.defaultPrompt),
        // An older Host omits promptMode and silently drops prompt settings.
        legacy: s === null || typeof s !== 'object' || !('promptMode' in s),
      }
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'auto-review-model: dictionaries')
        const t = ctx.locale.bind(NS)

        function Settings() {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const [catalog, setCatalog] = React.useState({ status: 'loading', groups: [], partial: false })
          const [saved, setSaved] = React.useState(null)
          const [draft, setDraft] = React.useState(null)
          const [status, setStatus] = React.useState({ kind: 'idle' })

          const loadCatalog = React.useCallback(async () => {
            setCatalog(c => ({ ...c, status: 'loading' }))
            try {
              const res = await ctx.remote.session.modelCatalog()
              if (!res.ok) throw res.error ?? new Error('catalog')
              setCatalog({ status: 'ready', groups: res.value.groups, partial: res.value.failures.length > 0 })
            } catch {
              setCatalog(c => ({ ...c, status: 'error' }))
            }
          }, [])

          React.useEffect(() => {
            loadCatalog()
            getJson('auto-review-model/state')
              .then(raw => { const s = normalize(raw); setSaved(s); setDraft(s) })
              .catch(e => setStatus({ kind: 'err', message: e.message }))
            const offs = [
              ctx.remote.$on('llm/adapters-updated', loadCatalog),
              ctx.remote.$on('settings/document-updated', loadCatalog),
            ]
            return () => offs.forEach(off => { try { off() } catch {} })
          }, [loadCatalog])

          const value = draft ?? { provider: '', model: '', reasoningEffort: '', promptMode: 'default', prompt: '' }
          const key = value.provider === '' ? '' : `${value.provider}${SEP}${value.model}`
          const found = catalog.groups.find(g => g.id === value.provider)?.models.find(m => m.id === value.model)
          const efforts = found?.reasoning?.efforts ?? []
          const dirty = saved !== null && ['provider', 'model', 'reasoningEffort', 'promptMode', 'prompt'].some(f => saved[f] !== value[f])
          const replaceEmpty = value.promptMode === 'replace' && value.prompt.trim() === ''

          const onModel = e => {
            const [provider = '', model = ''] = e.target.value === '' ? [] : e.target.value.split(SEP)
            setDraft({ ...value, provider, model, reasoningEffort: '' })
            setStatus({ kind: 'idle' })
          }
          const onEffort = e => {
            setDraft({ ...value, reasoningEffort: e.target.value })
            setStatus({ kind: 'idle' })
          }
          const onMode = e => {
            const promptMode = e.target.value
            const prompt = promptMode === 'replace' && value.prompt.trim() === '' && saved?.defaultPrompt ? saved.defaultPrompt : value.prompt
            setDraft({ ...value, promptMode, prompt })
            setStatus({ kind: 'idle' })
          }
          const onPrompt = e => {
            setDraft({ ...value, prompt: e.target.value })
            setStatus({ kind: 'idle' })
          }
          const loadDefault = () => {
            if (saved?.defaultPrompt) setDraft({ ...value, prompt: saved.defaultPrompt })
          }
          const save = async () => {
            setStatus({ kind: 'saving' })
            try {
              const { defaultPrompt: _ignored, legacy: _legacy, ...body } = value
              const s = normalize(await getJson('auto-review-model/set', { method: 'POST', body: JSON.stringify(body) }))
              setSaved(s)
              setDraft(s)
              setStatus({ kind: 'ok' })
            } catch (e) {
              setStatus({ kind: 'err', message: e.message })
            }
          }

          const modelOptions = [h('option', { key: '', value: '' }, t('sameAsSession'))]
          for (const g of catalog.groups) {
            modelOptions.push(h('optgroup', { key: g.id, label: g.name },
              g.models.map(m => h('option', { key: m.id, value: `${g.id}${SEP}${m.id}` }, m.name))))
          }
          if (key !== '' && found === undefined) {
            modelOptions.push(h('option', { key: 'missing', value: key }, `${value.provider}/${value.model} ${t('unavailable')}`))
          }
          const effortOptions = [h('option', { key: '', value: '' }, t('modelDefault'))]
            .concat(efforts.map(ef => h('option', { key: ef.id, value: ef.id }, ef.name)))
          if (value.reasoningEffort !== '' && !efforts.some(ef => ef.id === value.reasoningEffort)) {
            effortOptions.push(h('option', { key: 'missing', value: value.reasoningEffort }, `${value.reasoningEffort} ${t('unavailable')}`))
          }

          const busy = status.kind === 'saving' || saved === null
          return h('div', { className: 'arm' },
            h('style', null, CSS),
            h('h4', { className: 'arm-title' }, t('title')),
            h('div', { className: 'arm-hint' }, t('hint')),
            h('label', { className: 'arm-row' },
              h('span', null, t('model')),
              h('select', { value: key, onChange: onModel, disabled: busy }, modelOptions)),
            value.provider === '' ? null : h('label', { className: 'arm-row' },
              h('span', null, t('effort')),
              h('select', { value: value.reasoningEffort, onChange: onEffort, disabled: busy || (efforts.length === 0 && value.reasoningEffort === '') }, effortOptions)),
            catalog.status === 'loading' ? h('div', { className: 'arm-note' }, t('loading')) : null,
            catalog.status === 'error' ? h('div', { className: 'arm-note err' }, t('loadFailed'), ' ',
              h('button', { type: 'button', className: 'arm-btn', onClick: loadCatalog }, t('retry'))) : null,
            catalog.partial ? h('div', { className: 'arm-note warn' }, t('partial')) : null,
            value.provider === '' ? null : h('div', { className: 'arm-note warn' }, t('warning')),
            h('div', { className: 'arm-section' },
              h('h4', { className: 'arm-title' }, t('promptTitle')),
              saved?.legacy ? h('div', { className: 'arm-note warn' }, t('restartNeeded')) : null,
              h('label', { className: 'arm-row' },
                h('span', null, t('promptMode')),
                h('select', { value: value.promptMode, onChange: onMode, disabled: busy || saved?.legacy },
                  h('option', { value: 'default' }, t('modeDefault')),
                  h('option', { value: 'append' }, t('modeAppend')),
                  h('option', { value: 'replace' }, t('modeReplace')))),
              value.promptMode === 'default' ? null : h('div', { className: value.promptMode === 'replace' ? 'arm-note warn' : 'arm-hint' },
                t(value.promptMode === 'replace' ? 'replaceHint' : 'appendHint')),
              value.promptMode === 'default' ? null : h('textarea', {
                value: value.prompt, onChange: onPrompt, disabled: busy, spellCheck: false,
                placeholder: value.promptMode === 'append' ? t('appendPlaceholder') : '',
                rows: value.promptMode === 'replace' ? 18 : 8,
              }),
              value.promptMode !== 'replace' ? null : h('div', { className: 'arm-actions' },
                h('button', { type: 'button', className: 'arm-btn', disabled: busy || !saved?.defaultPrompt, onClick: loadDefault }, t('loadDefault')),
                saved?.defaultPrompt ? null : h('span', { className: 'arm-note' }, t('defaultUnknown')))),
            h('div', { className: 'arm-actions' },
              h('button', { type: 'button', className: 'arm-btn primary', disabled: busy || !dirty || replaceEmpty, onClick: save },
                status.kind === 'saving' ? t('saving') : t('save')),
              status.kind === 'ok' ? h('span', { className: 'arm-note ok' }, t('saved')) : null,
              status.kind === 'err' ? h('span', { className: 'arm-note err' }, t('saveFailed') + status.message) : null))
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
