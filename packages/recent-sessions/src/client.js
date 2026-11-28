window.__ModuleLoader__.load({
  id: 'dsh-recent-sessions',
  factory() {
    const REFERENCE_SOURCE = 'reference'
    const RETRY_MS = 500
    const MAX_RETRIES = 60

    function sessionIdOf(row) {
      if (row?.icon !== 'session' || typeof row.value !== 'string') return undefined
      try {
        const m = /\(dsh-session:([A-Za-z0-9_-]+)\)$/u.exec(JSON.parse(row.value).mention ?? '')
        if (!m) return undefined
        const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/')
        const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4))
        return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))))
      } catch {
        return undefined
      }
    }

    const timeOf = v => typeof v === 'number' ? v : typeof v === 'string' ? Date.parse(v) || 0 : 0

    function sortRows(rows, byId) {
      const out = rows.slice()
      let i = 0
      while (i < out.length) {
        if (out[i].icon !== 'session') { i++; continue }
        let j = i
        while (j < out.length && out[j].icon === 'session' && out[j].section === out[i].section) j++
        const block = out.slice(i, j).map((row, k) => ({ row, k, at: timeOf(byId[sessionIdOf(row)]?.updatedAt) }))
        block.sort((a, b) => b.at - a.at || a.k - b.k)
        block.forEach((b, k) => { out[i + k] = b.row })
        i = j
      }
      return out
    }

    return {
      inject: ['inputTriggers', 'sessions'],
      apply(ctx) {
        // external: DSH reference trigger registers asynchronously on inputTriggers.live.sources
        let patched = null
        const tryPatch = () => {
          if (patched) return true
          const src = ctx.inputTriggers.live?.sources?.find(s => s.trigger === '@' && s.name === REFERENCE_SOURCE)
          if (!src) return false
          const original = src.candidates
          src.candidates = async function (...args) {
            const rows = await original.apply(this, args)
            if (!Array.isArray(rows)) return rows
            return sortRows(rows, ctx.sessions.list?.getSnapshot?.().byId ?? {})
          }
          patched = { src, original }
          return true
        }

        ctx.effect(() => {
          let tries = 0
          const timer = tryPatch() ? null : setInterval(() => {
            if (tryPatch() || ++tries > MAX_RETRIES) clearInterval(timer)
          }, RETRY_MS)
          return () => {
            if (timer) clearInterval(timer)
            if (patched) {
              patched.src.candidates = patched.original
              patched = null
            }
          }
        }, 'recent-sessions: @ session order')
      },
      _internal: { sessionIdOf, sortRows },
    }
  },
})
