window.__ModuleLoader__.load({
  id: 'dsh-config-backup',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'config-backup'
    const EN = { panel: 'Config backup', loading: 'Loading…', loadFailed: 'Could not load backup page' }
    const ZH = { panel: '配置备份', loading: '正在加载…', loadFailed: '加载配置备份页面失败' }

    function IconArchive({ size = 16 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('rect', { x: 3, y: 4, width: 18, height: 4, rx: 1 }),
        h('path', { d: 'M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8' }),
        h('path', { d: 'M10 12h4' }))
    }

    return {
      name: 'dsh-config-backup',
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'config-backup: locale')
        const styleRef = { el: null }
        const cleanups = []
        ctx.effect(() => () => {
          styleRef.el?.remove()
          styleRef.el = null
          while (cleanups.length) cleanups.pop()?.()
        }, 'config-backup: styles')

        const t = ctx.locale.bind(NS)
        let PageComp = null
        let pagePromise = null
        const listeners = new Set()
        const initPage = mod => {
          if (!PageComp) {
            const built = mod.createConfigBackupPage(ctx, styleRef)
            PageComp = built.ConfigBackupPage
            if (typeof built.dispose === 'function') cleanups.push(built.dispose)
          }
          return PageComp
        }
        const loadPage = () => {
          if (PageComp) return Promise.resolve(PageComp)
          if (!pagePromise && typeof require.async === 'function') {
            pagePromise = require.async('./client.page.js').then(mod => {
              const comp = initPage(mod)
              for (const fn of listeners) fn()
              return comp
            }, err => {
              pagePromise = null
              throw err
            })
          }
          return pagePromise
        }
        function PageLoader(props) {
          const [err, setErr] = React.useState(null)
          const [, setTick] = React.useState(0)
          React.useEffect(() => {
            const onReady = () => setTick(n => n + 1)
            listeners.add(onReady)
            if (!PageComp) loadPage()?.catch(e => setErr(e?.message || t('loadFailed')))
            return () => { listeners.delete(onReady) }
          }, [])
          if (PageComp) return h(PageComp, props)
          if (err) return h('div', { style: { padding: 24, color: 'var(--dsw-alias-state-error-primary)' } }, err)
          return h('div', { style: { padding: 24, color: 'var(--dsw-alias-label-secondary)' } }, t('loading'))
        }
        function LazyConfigBackupPage(props) {
          if (typeof require.syncChunk === 'function') {
            return initPage(require.syncChunk('./client.page.js'))(props)
          }
          return PageComp ? h(PageComp, props) : h(PageLoader, props)
        }

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: NS, locale: NS,
        }, LazyConfigBackupPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: NS, order: 48, locale: NS, label: () => t('panel'),
        }, IconArchive))
      },
    }
  },
})
