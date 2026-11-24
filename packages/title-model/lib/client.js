window.__ModuleLoader__.load({
  id: 'dsh-title-model',
  factory(require) {
    const React = require('react')
    const {
      DisclosureRow, TextShimmer,
      IconInspectOutlineRegular, IconSettingsOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
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
        tvStopped: 'Stopped', tvInspect: 'Inspect', tvInput: 'IN', tvOutput: 'OUT', tvCount: '{n} generators',
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
        tvStopped: '已中止', tvInspect: '查看', tvInput: '输入', tvOutput: '输出', tvCount: '{n} 个生成器',
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
.dtm-tv{display:flex;flex-direction:column}
.dtm-tv-row{min-width:0}
.dtm-tv-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.dtm-tv-summary{flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.dtm-tv-summary.is-err{color:var(--dsw-alias-state-error-primary)}
.dtm-tv-summary.is-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.dtm-tv-body{display:flex;flex-direction:column;min-width:0}
.dtm-tv-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.dtm-tv-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.dtm-tv-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.dtm-tv-io-sec::-webkit-scrollbar-track{margin:6px 0}
.dtm-tv-io-div{grid-column:1/-1;height:.5px;background:var(--dsw-alias-border-l2)}
.dtm-tv-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.dtm-tv-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.dtm-tv-io-text[data-error]{color:var(--dsw-alias-state-error-primary)}
.dtm-tv-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.dtm-tv-inspect:focus-visible{opacity:1}
@media(hover:hover){.dtm-tv:hover .dtm-tv-inspect{opacity:1}.dtm-tv-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media(hover:none){.dtm-tv-inspect{opacity:1}}
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

        function TitleModelToolRow({ phase, block, inspect, useDisclosure }) {
          const { expanded, toggle } = useDisclosure()
          const settled = phase === 'result' && block && 'kind' in block
          const call = settled ? block.call : block
          let args = {}
          try {
            const parsed = JSON.parse(call?.argsRaw ?? '{}')
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed
          } catch {}
          const text = settled && Array.isArray(block.content)
            ? block.content.filter(item => item.type === 'text').map(item => item.text).join('\n') : ''
          let payload = null
          if (text) { try { payload = JSON.parse(text) } catch {} }
          const action = typeof args.action === 'string' ? args.action : block?.args?.text?.('action') ?? ''
          const state = phase === 'preparing' ? 'preparing'
            : !settled ? 'running'
              : block.error?.code === 'interrupted' ? 'stopped'
                : block.isError ? 'error' : 'ok'
          const running = state === 'preparing' || state === 'running'
          let detail = ''
          if (state === 'stopped') detail = t('tvStopped')
          else if (state === 'error') detail = text.split('\n')[0] || ''
          else if (action === 'set') {
            detail = args.provider && args.model ? `${args.provider}/${args.model}` : t('same')
          } else if (Array.isArray(payload?.generators)) {
            detail = t('tvCount', { n: payload.generators.length })
          }
          const summary = state === 'error' || state === 'stopped' ? detail : [action, detail].filter(Boolean).join(' · ')
          const inputText = Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ''
          const outputText = payload !== null ? JSON.stringify(payload, null, 2) : text
          const expandable = state !== 'preparing' && Boolean(inputText || outputText)
          const open = expanded && expandable
          return h('div', { className: 'dtm-tv', 'data-tool': 'title_model', 'data-state': state },
            h(DisclosureRow, {
              rowClassName: 'dtm-tv-row',
              icon: h(IconSettingsOutlineRegular, { size: 14 }),
              title: t('title'),
              running,
              open,
              expandable,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: state === 'preparing' || !summary ? null : h(React.Fragment, null,
                h('span', { className: 'dtm-tv-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                h('span', { className: `dtm-tv-summary${state === 'error' ? ' is-err' : state === 'stopped' ? ' is-stop' : ''}` },
                  h(TextShimmer, null, summary))),
            },
            open ? h('div', { className: 'dtm-tv-body' },
              h('div', { className: 'dtm-tv-io' },
                inputText ? h('div', { className: 'dtm-tv-io-sec' },
                  h('span', { className: 'dtm-tv-io-label' }, t('tvInput')),
                  h('span', { className: 'dtm-tv-io-text' }, inputText)) : null,
                inputText && outputText ? h('span', { className: 'dtm-tv-io-div', 'aria-hidden': true }) : null,
                outputText ? h('div', { className: 'dtm-tv-io-sec' },
                  h('span', { className: 'dtm-tv-io-label' }, t('tvOutput')),
                  h('span', { className: 'dtm-tv-io-text', 'data-error': state === 'error' || undefined }, outputText)) : null),
              inspect ? h('button', { type: 'button', className: 'dtm-tv-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('tvInspect')) : null) : null))
        }

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview', key: 'title_model', locale: NS, priority: -10,
        }, TitleModelToolRow))

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config', key: 'dsh-title-model', locale: NS,
        }, Settings))
      },
    }
  },
})
