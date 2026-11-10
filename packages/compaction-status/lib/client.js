/** One session-scoped indicator, outside folded Chat work details. */
window.__ModuleLoader__.load({
  id: 'dsh-compaction-status',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'compaction-status'
    const DICTS = {
      en: {
        title: 'Compacting context…',
        hint: 'Preparing a summary before continuing. This can take a while.',
        elapsed: 'Elapsed {duration}',
      },
      zh: {
        title: '正在压缩上下文',
        hint: '正在整理历史对话摘要，完成后继续；这一步可能需要一些时间。',
        elapsed: '已等待 {duration}',
      },
    }
    // Match the native Todo dock's centered width, including its composer insets.
    const CSS = `
.dsh-compaction-status{
  box-sizing:border-box;
  width:calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));
  max-width:calc(var(--dsh-composer-card-max-width) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));
  flex:none;display:flex;align-items:center;gap:8px;min-width:0;margin:0 auto;padding:4px 12px;
  color:var(--dsw-alias-label-secondary);font-size:13px;line-height:24px;
}
.dsh-compaction-status__spinner{box-sizing:border-box;width:12px;height:12px;flex:none;border:1.5px solid var(--dsw-alias-border-l2);border-top-color:currentColor;border-radius:50%;animation:dsh-compaction-status-spin 1s linear infinite}
.dsh-compaction-status__title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-compaction-status__elapsed{flex:none;margin-left:auto;font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap}
@keyframes dsh-compaction-status-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.dsh-compaction-status__spinner{animation:none}}
`

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        for (const [lang, dictionary] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dictionary))
        }
        const t = ctx.locale.bind(NS)
        const subscribeLocale = fn => ctx.locale.subscribe(fn)
        const localeSnapshot = () => ctx.locale.getSnapshot()

        function Progress({ startedAt }) {
          const [now, setNow] = React.useState(Date.now)
          React.useEffect(() => {
            const timer = setInterval(() => setNow(Date.now()), 1000)
            return () => clearInterval(timer)
          }, [])
          const seconds = Math.max(0, Math.floor((now - startedAt) / 1000))
          const duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
          return h(React.Fragment, null,
            h('style', null, CSS),
            h('aside', { className: 'dsh-compaction-status', title: t('hint') },
              h('span', { className: 'dsh-compaction-status__spinner', 'aria-hidden': true }),
              h('span', { className: 'dsh-compaction-status__title', role: 'status', 'aria-live': 'polite' }, t('title')),
              // Do not announce the clock every second to screen-reader users.
              h('span', { className: 'dsh-compaction-status__elapsed', 'aria-live': 'off' }, t('elapsed', { duration }))))
        }

        function CompactionStatus({ sessionId, useProjection }) {
          const active = useProjection('dsh-compaction-status')
          React.useSyncExternalStore(subscribeLocale, localeSnapshot)
          if (!active) return null
          return h(Progress, { key: `${sessionId}:${active.id}`, startedAt: active.startedAt })
        }

        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock', id: 'compaction-status', order: -10,
        }, CompactionStatus))
      },
    }
  },
})
