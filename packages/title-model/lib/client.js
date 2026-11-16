/** A model picker over the native title providers, not an LLM request interceptor. */
window.__ModuleLoader__.load({
  id: 'dsh-title-model',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'title-model'
    const DICTS = {
      en: {
        title: 'Title model',
        hint: 'Choose a model for titles only. The conversation model and the active title strategy stay unchanged.',
        first: 'First-prompt titles', all: 'Conversation-following titles', model: 'Model',
        same: 'Same as session', missing: '(unavailable)', loading: 'Loading…',
        reload: 'Reload settings', retry: 'Retry', save: 'Save', saving: 'Saving…', saved: 'Saved. Applies to subsequent title requests.',
        loadFailed: 'Could not load title settings: ', saveFailed: 'Could not save: ',
        catalogFailed: 'Could not load models: ', partial: 'Some providers could not load their models. You can still select the models shown.',
        empty: 'No supported title generator is active. Enable DSH’s first-prompt titles or Conversation-following titles, then reload settings.',
        privacy: 'Title requests send eligible human prompts to the selected provider and may incur separate charges. Generation failures keep the previous title.',
        persist: 'Choices are saved in the native generator’s configuration. Disabling this plugin does not reset them. Select Same as session and save before removing it if you want to clear the override.',
        cadence: 'Only the model changes. Existing titles are not regenerated now, and manually pinned titles stay pinned.',
      },
      zh: {
        title: '标题模型',
        hint: '仅为标题选择模型。主对话模型和当前标题生成策略保持不变。',
        first: '首条消息标题', all: '随对话更新标题', model: '模型',
        same: '跟随会话', missing: '（不可用）', loading: '加载中…',
        reload: '重新加载设置', retry: '重试', save: '保存', saving: '保存中…', saved: '已保存，将用于后续标题请求。',
        loadFailed: '无法加载标题设置：', saveFailed: '保存失败：',
        catalogFailed: '无法加载模型：', partial: '部分 provider 的模型加载失败，仍可选择已列出的模型。',
        empty: '没有已启用的受支持标题生成器。请先启用 DSH 的首条消息标题或“随对话更新标题”，然后重新加载设置。',
        privacy: '标题请求会将符合条件的用户消息发送到所选 provider，可能产生独立费用。生成失败时保留原有标题。',
        persist: '选择保存在原生标题生成器的配置中，禁用本插件不会重置。如需清除覆盖，请先选择“跟随会话”并保存，再移除插件。',
        cadence: '仅更改模型，不会立即重新生成已有标题，手动固定的标题也不受影响。',
      },
    }
    const CSS = `
.dsh-title-model{display:flex;flex-direction:column;gap:12px;min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.dsh-title-model h4{margin:0;font-size:14px;line-height:20px;font-weight:500}
.dsh-title-model p{margin:0;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dsh-title-model__form{display:flex;flex-direction:column;gap:12px;padding:12px 0;border-top:1px solid var(--dsw-alias-border-l1)}
.dsh-title-model label{display:grid;grid-template-columns:120px minmax(0,360px);gap:8px;align-items:center}
.dsh-title-model select{width:100%;height:32px;min-width:0;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit}
.dsh-title-model button{height:30px;padding:0 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.dsh-title-model button:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
.dsh-title-model :is(button,select):disabled{opacity:.5;cursor:default}
.dsh-title-model :is(button,select):focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-title-model__actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.dsh-title-model .error{color:var(--dsw-alias-state-error-primary)}
.dsh-title-model .success{color:var(--dsw-alias-state-success-primary)}
@media(max-width:560px){.dsh-title-model label{grid-template-columns:1fr}}
`
    const routeKey = (provider, model) => provider === '' ? '' : JSON.stringify([provider, model])

    async function request(path, body) {
      const response = await fetch(path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { accept: 'application/json', ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
      const value = await response.json()
      if (!response.ok) throw new Error(value.message ?? `HTTP ${response.status}`)
      return value
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, DICTS))
        const t = ctx.locale.bind(NS)
        const subscribeLocale = listener => ctx.locale.subscribe(listener)
        const localeSnapshot = () => ctx.locale.getSnapshot()

        function Generator({ generator, catalog, onSaved, onBusy }) {
          const [value, setValue] = React.useState(routeKey(generator.provider, generator.model))
          const [status, setStatus] = React.useState({ kind: 'idle' })
          const savedValue = routeKey(generator.provider, generator.model)
          const busy = status.kind === 'saving'
          const dirty = value !== savedValue
          const options = [h('option', { key: '', value: '' }, t('same'))]
          for (const group of catalog.groups) {
            options.push(h('optgroup', { key: group.id, label: group.name },
              group.models.map(model => h('option', { key: model.id, value: routeKey(group.id, model.id) }, model.name))))
          }
          const known = key => key === '' || catalog.groups.some(group => group.models.some(model => routeKey(group.id, model.id) === key))
          for (const key of new Set([savedValue, value])) {
            if (!known(key)) {
              const [provider, model] = JSON.parse(key)
              options.push(h('option', { key, value: key, disabled: true }, `${provider}/${model} ${t('missing')}`))
            }
          }

          const save = async () => {
            setStatus({ kind: 'saving' })
            onBusy(true)
            try {
              const [provider, model] = value === '' ? ['', ''] : JSON.parse(value)
              const result = await request('title-model/set', { generator: generator.id, provider, model })
              onSaved(result)
              setStatus({ kind: 'ok' })
            } catch (error) {
              setStatus({ kind: 'error', message: error.message })
            } finally { onBusy(false) }
          }

          return h('section', { className: 'dsh-title-model__form' },
            h('h4', null, t(generator.strategy === 'first-prompt' ? 'first' : 'all')),
            h('p', null, generator.id),
            h('label', null, h('span', null, t('model')),
              h('select', { value, disabled: busy, onChange: event => { setValue(event.target.value); setStatus({ kind: 'idle' }) } }, options)),
            h('div', { className: 'dsh-title-model__actions' },
              h('button', { type: 'button', disabled: busy || !dirty || !known(value), onClick: save }, t(busy ? 'saving' : 'save')),
              h('span', { role: status.kind === 'error' ? 'alert' : 'status', className: status.kind === 'error' ? 'error' : 'success' },
                status.kind === 'ok' ? t('saved') : status.kind === 'error' ? `${t('saveFailed')}${status.message}` : '')))
        }

        function Settings() {
          React.useSyncExternalStore(subscribeLocale, localeSnapshot)
          const [state, setState] = React.useState({ status: 'loading', generators: [] })
          const [catalog, setCatalog] = React.useState({ groups: [], partial: false, error: '' })
          const [busy, setBusy] = React.useState(false)
          const [epoch, setEpoch] = React.useState(0)

          React.useEffect(() => {
            let alive = true
            setState(current => ({ ...current, status: 'loading' }))
            request('title-model/state').then(value => {
              if (alive) setState({ status: 'ready', generators: value.generators })
            }).catch(error => {
              if (alive) setState({ status: 'error', generators: [], error: error.message })
            })
            const loadCatalog = async () => {
              try {
                const result = await ctx.remote.session.modelCatalog()
                if (!result.ok) throw new Error(result.error?.message ?? 'Model catalog unavailable')
                if (alive) setCatalog({ groups: result.value.groups, partial: result.value.failures.length > 0, error: '' })
              } catch (error) {
                if (alive) setCatalog(current => ({ ...current, error: error.message }))
              }
            }
            loadCatalog()
            const off = ctx.remote.$on('llm/adapters-updated', loadCatalog)
            return () => { alive = false; off() }
          }, [epoch])

          return h('div', { className: 'dsh-title-model' },
            h('style', null, CSS),
            h('h4', null, t('title')), h('p', null, t('hint')),
            h('div', { className: 'dsh-title-model__actions' },
              h('button', { type: 'button', disabled: busy || state.status === 'loading', onClick: () => setEpoch(current => current + 1) },
                t(state.status === 'error' ? 'retry' : 'reload'))),
            state.status === 'loading' ? h('p', { role: 'status' }, t('loading')) : null,
            state.status === 'error' ? h('p', { className: 'error', role: 'alert' }, `${t('loadFailed')}${state.error}`) : null,
            state.status === 'ready' && state.generators.length === 0 ? h('p', { role: 'status' }, t('empty')) : null,
            catalog.error ? h('p', { className: 'error', role: 'alert' }, `${t('catalogFailed')}${catalog.error}`) : null,
            catalog.partial ? h('p', null, t('partial')) : null,
            state.status !== 'ready' ? null : state.generators.map(generator => h(Generator, {
              key: `${epoch}:${generator.id}`, generator, catalog, onBusy: setBusy,
              onSaved: result => setState({ status: 'ready', generators: result.generators }),
            })),
            h('p', null, t('cadence')), h('p', null, t('privacy')), h('p', null, t('persist')))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config', key: 'dsh-title-model', locale: NS,
        }, Settings))
      },
    }
  },
})
