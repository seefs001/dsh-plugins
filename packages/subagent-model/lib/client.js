/** Add a read-only child model label; leave the built-in model seat untouched. */
window.__ModuleLoader__.load({
  id: 'dsh-subagent-model',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'subagent-model'
    const DICTS = {
      en: {
        label: 'Subagent model',
        readOnly: 'Read-only: the model is controlled by the parent agent.',
        unrecorded: 'Model not recorded yet',
        providerDefault: 'Provider default',
      },
      zh: {
        label: '子代理模型',
        readOnly: '只读：模型由主代理指定。',
        unrecorded: '尚无模型记录',
        providerDefault: '提供方默认',
      },
    }
    const CSS = `
.dsh-subagent-model{display:flex;align-items:center;gap:4px;min-width:0;max-width:360px;height:28px;padding:0 4px 0 8px;color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:400;line-height:20px;cursor:default}
.dsh-subagent-model__name,.dsh-subagent-model__effort{display:var(--dsh-composer-model-text-display,block);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-subagent-model__effort{flex-shrink:1000;opacity:.78}
.dsh-subagent-model__icon{display:var(--dsh-composer-model-icon-display,none);flex:none}
`

    function ModelIcon() {
      return h('svg', {
        className: 'dsh-subagent-model__icon', viewBox: '0 0 16 16',
        width: 16, height: 16, fill: 'none', stroke: 'currentColor',
        strokeWidth: 1.2, 'aria-hidden': true,
      }, h('ellipse', { cx: 8, cy: 4, rx: 5, ry: 2 }),
      h('path', { d: 'M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2' }))
    }

    return {
      inject: ['slots', 'locale', 'modelDirectories'],
      apply(ctx) {
        for (const [lang, dictionary] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dictionary))
        }
        const t = ctx.locale.bind(NS)
        const subscribeLocale = listener => ctx.locale.subscribe(listener)
        const localeSnapshot = () => ctx.locale.getSnapshot()

        function RecordedModel({ directory, useProjection }) {
          React.useSyncExternalStore(subscribeLocale, localeSnapshot)
          const projection = useProjection('modelSelection')
          const source = React.useMemo(() => ({
            subscribe: listener => directory.subscribe(listener),
            getSnapshot: () => directory.getSnapshot(),
          }), [directory])
          const catalog = React.useSyncExternalStore(source.subscribe, source.getSnapshot)
          // Never use directory.current: before a child has a request header,
          // that directory may substitute the main agent's catalog default.
          const selection = projection?.next ?? projection?.lastUsed
          const group = selection && catalog.groups.find(item => item.id === selection.provider)
          const model = group?.models.find(item => item.id === selection.model)
          const modelName = model?.name ?? selection?.model ?? t('unrecorded')
          const reasoning = model?.reasoning
          const effort = selection?.reasoningEffort ?? reasoning?.defaultEffort
          const effortLabel = effort !== undefined
            ? reasoning?.efforts.find(item => item.id === effort)?.name ?? effort
            : reasoning === undefined ? undefined : t('providerDefault')
          const text = effortLabel === undefined ? modelName : `${modelName} · ${effortLabel}`
          const route = selection ? `${selection.provider}/${selection.model}` : ''
          const title = [text, route, t('readOnly')].filter(Boolean).join('\n')

          return h(React.Fragment, null,
            h('style', null, CSS),
            h('span', {
              className: 'dsh-subagent-model', title,
              role: 'status', 'aria-label': `${t('label')}: ${text}. ${t('readOnly')}`,
            }, h(ModelIcon),
            h('span', { className: 'dsh-subagent-model__name' }, modelName),
            effortLabel === undefined ? null
              : h('span', { className: 'dsh-subagent-model__effort' }, effortLabel)))
        }

        function SubagentModel(props) {
          const subagent = props.useSession(session => session.subagent)
          if (subagent === null) return null
          return h(RecordedModel, props)
        }

        ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
          name: 'conversation.input.right', id: 'subagent-model', order: 2000,
          label: () => t('label'),
          inject: sessionId => ({ directory: ctx.modelDirectories.directoryFor(sessionId).store }),
        }, SubagentModel))
      },
    }
  },
})
