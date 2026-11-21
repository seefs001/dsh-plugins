window.__ModuleLoader__.load({
  id: 'dsh-title-model',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'title-model'
    const DICTS = {
      en: {
        title: 'Title model',
        hint: 'Pick a separate model for session titles. Conversation model and title cadence stay unchanged.',
        first: 'First-prompt titles', all: 'Conversation-following titles', model: 'Model',
        same: 'Same as session', missing: '(unavailable)', loading: 'Loading…',
        reload: 'Reload', retry: 'Retry', save: 'Save', saving: 'Saving…', saved: 'Saved.',
        loadFailed: 'Could not load title settings: ', saveFailed: 'Save failed: ',
        catalogFailed: 'Could not load models: ', partial: 'Some providers failed to load their models.',
        empty: 'No active title generator. Enable first-prompt or conversation-following titles in DSH settings, then reload.',
        note: 'Writes directly to the native title generator config (persists if this plugin is disabled) and applies to new titles only.',
      },
      zh: {
        title: '标题模型',
        hint: '单独指定标题生成模型，不影响主对话模型和触发规则。',
        first: '首条消息标题', all: '随对话更新标题', model: '模型',
        same: '跟随会话', missing: '（不可用）', loading: '加载中…',
        reload: '重新加载', retry: '重试', save: '保存', saving: '保存中…', saved: '已保存。',
        loadFailed: '无法加载标题设置：', saveFailed: '保存失败：',
        catalogFailed: '无法加载模型：', partial: '部分 provider 的模型加载失败。',
        empty: '未启用标题生成器。先在 DSH 设置中开启「首条消息标题」或「随对话更新标题」，再点重新加载。',
        note: '直接写入原生标题生成器配置（停用插件不会还原），仅对后续生成的标题生效。',
      },
    }
    const CSS = `
.dsh-title-model{display:flex;flex-direction:column;gap:12px;min-width:0;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.dsh-title-model h4{margin:0;font-size:14px;line-height:20px;font-weight:500}
.dsh-title-model p{margin:0;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dsh-title-model__form{display:flex;flex-direction:column;gap:12px;padding-top:14px;border-top:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l1)}
.dsh-title-model label{display:grid;grid-template-columns:132px minmax(0,380px);gap:8px;align-items:center}
.dsh-title-model label>span{color:var(--dsw-alias-label-secondary)}
.dsh-title-model select{width:100%;height:32px;min-width:0;padding:0 10px;border:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:inherit;font:inherit;cursor:pointer}
.dsh-title-model button{height:30px;padding:0 14px;border:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:transparent;color:inherit;font:inherit;cursor:pointer;transition:background-color .15s}
.dsh-title-model button.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dsh-title-model :is(button,select):disabled{opacity:.4;cursor:default}
.dsh-title-model :is(button,select):focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dsh-title-model__actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.dsh-title-model .error{color:var(--dsw-alias-state-error-primary)}
.dsh-title-model .success{color:var(--dsw-alias-state-success-primary)}
@media(hover:hover){.dsh-title-model button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dsh-title-model button.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media(pointer:coarse){.dsh-title-model select{font-size:16px}}
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
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'title-model: styles')
        const t = ctx.locale.bind(NS)
        const subscribeLocale = listener => ctx.locale.subscribe(listener)
        const localeSnapshot = () => ctx.locale.getSnapshot()

        function Generator({ generator, catalog, saving, onSaved, onBusy }) {
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
              h('button', { type: 'button', className: 'primary', disabled: saving || !dirty || !known(value), onClick: save }, t(busy ? 'saving' : 'save')),
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
            let catalogRequest = 0
            const loadCatalog = async () => {
              const id = ++catalogRequest
              try {
                const result = await ctx.remote.session.modelCatalog()
                if (!result.ok) throw new Error(result.error?.message ?? 'Model catalog unavailable')
                if (alive && id === catalogRequest) setCatalog({ groups: result.value.groups, partial: result.value.failures.length > 0, error: '' })
              } catch (error) {
                if (alive && id === catalogRequest) setCatalog(current => ({ ...current, error: error.message }))
              }
            }
            loadCatalog()
            const off = ctx.remote.$on('llm/adapters-updated', loadCatalog)
            return () => { alive = false; off() }
          }, [epoch])

          return h('div', { className: 'dsh-title-model' },
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
              key: `${epoch}:${generator.id}`, generator, catalog, saving: busy, onBusy: setBusy,
              onSaved: result => setState({ status: 'ready', generators: result.generators }),
            })),
            h('p', null, t('note')))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config', key: 'dsh-title-model', locale: NS,
        }, Settings))
      },
    }
  },
})
