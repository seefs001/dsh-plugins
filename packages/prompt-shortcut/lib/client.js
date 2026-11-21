window.__ModuleLoader__.load({
  id: 'dsh-prompt-shortcut',
  factory(require) {
    const React = require('react')
    const { createPortal } = require('react-dom')
    const { createElement: h, useState, useRef, useLayoutEffect, useId } = React
    const NS = 'prompt-shortcut'
    const KEY = 'dsh-prompt-shortcut:library:v1'
    const SAMPLE_HIDDEN_KEY = 'dsh-prompt-shortcut:sample-hidden:v1'
    const dicts = {
      zh: {
        title: '常用片段', new: '新建', edit: '编辑片段', close: '关闭', search: '搜索名称或正文', clear: '清除搜索',
        pinned: '置顶', recent: '最近使用', yours: '我的片段', more: '更多：{title}', pin: '置顶', unpin: '取消置顶',
        remove: '删除', removed: '已删除「{title}」。', undo: '撤销', save: '保存片段', cancel: '取消',
        name: '名称', nameHint: '默认使用正文首句', body: '片段正文', bodyHint: '写下你经常会说的话…',
        first: '写下我的第一条', fromDraft: '把这段话存下来', fromDraftShort: '从当前草稿保存', empty: '有些话不用每次重写。',
        removeSample: '移除示例', sampleRemoved: '已移除示例。', sample: '示例 · 点一下试试', sampleTitle: '先说结论', sampleBody: '先告诉我该不该改，再解释最重要的原因。',
        noMatches: '没找到匹配的片段。', insert: '插入光标处', replace: '替换选中文字', noSend: '不会自动发送',
        local: '只保存在此浏览器，不包含附件。', failed: '无法读写本地片段。请检查浏览器存储空间或权限。',
        changed: '草稿已变化或暂不可编辑。请关闭面板，重新定位光标后再试。', missing: '这条片段已被移除，请重新打开面板。',
        shortcutHint: '↑ ↓ 选择 · Enter 插入', replaceHint: '↑ ↓ 选择 · Enter 替换选中文字', saved: '已保存「{title}」。',
      },
      en: {
        title: 'Prompt shortcuts', new: 'New', edit: 'Edit snippet', close: 'Close', search: 'Search names or text', clear: 'Clear search',
        pinned: 'Pinned', recent: 'Recently used', yours: 'My snippets', more: 'More: {title}', pin: 'Pin', unpin: 'Unpin',
        remove: 'Delete', removed: 'Deleted “{title}”.', undo: 'Undo', save: 'Save snippet', cancel: 'Cancel',
        name: 'Name', nameHint: 'Defaults to the first sentence', body: 'Snippet text', bodyHint: 'Something you often say…',
        first: 'Write my first snippet', fromDraft: 'Save this draft as a snippet', fromDraftShort: 'Save from draft', empty: 'Keep a phrase for next time.',
        removeSample: 'Remove example', sampleRemoved: 'Example removed.', sample: 'Example · try it', sampleTitle: 'Start with the conclusion', sampleBody: 'Tell me whether to make the change, then explain the most important reason.',
        noMatches: 'No matching snippets.', insert: 'Insert at cursor', replace: 'Replace selected text', noSend: 'Nothing is sent',
        local: 'Saved only in this browser, without attachments.', failed: 'Could not access your snippets. Check browser storage permissions and space.',
        changed: 'The draft changed or is busy. Close this panel, place the cursor, then try again.', missing: 'This snippet was removed. Reopen the panel to refresh.',
        shortcutHint: '↑ ↓ choose · Enter to insert', replaceHint: '↑ ↓ choose · Enter to replace selection', saved: 'Saved “{title}”.',
      },
    }

    const css = `
      .ps-trigger,.ps-panel{--ps-surface:var(--dsw-alias-bg-layer-1);--ps-ink:var(--dsw-alias-label-primary);--ps-muted:var(--dsw-alias-label-secondary);--ps-wash:color-mix(in srgb,var(--ps-ink) 6%,var(--ps-surface));--ps-line:color-mix(in srgb,var(--ps-ink) 13%,var(--ps-surface))}
      @supports(color:oklch(from white l 0 h)){.ps-trigger,.ps-panel{--ps-surface:oklch(from var(--dsw-alias-bg-layer-1) l 0 h);--ps-ink:oklch(from var(--dsw-alias-label-primary) l 0 h);--ps-muted:oklch(from var(--dsw-alias-label-secondary) l 0 h)}}
      .ps-trigger,.ps-panel button,.ps-panel input,.ps-panel textarea{box-sizing:border-box;font:inherit;color:inherit}
      .ps-trigger,.ps-panel button{border:0;background:transparent;cursor:pointer}
      .ps-trigger{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:4px 9px;border:1px solid transparent;border-radius:8px;font-size:12px;line-height:20px;white-space:nowrap;color:var(--ps-muted)}
      .ps-trigger:hover,.ps-trigger[aria-expanded=true]{color:var(--ps-ink);background:var(--ps-wash)}
      .ps-glyph{width:14px;height:14px;flex:none;vertical-align:middle}.ps-trigger .ps-glyph{width:16px;height:16px}
      .ps-trigger:focus-visible,.ps-panel :focus-visible{outline:2px solid var(--ps-muted);outline-offset:-2px}
      .ps-seat{position:absolute;inset:0 0 auto;height:0;min-width:0;z-index:1}
      .ps-panel{position:absolute;inset:auto 0 calc(100% + 6px);box-sizing:border-box;width:100%;max-width:none;max-height:min(25rem,45dvh,var(--ps-headroom,100dvh));margin:0;padding:4px;overflow:auto;border:1px solid var(--ps-line);border-radius:14px 14px 6px 6px;background:var(--ps-surface);color:var(--ps-ink);font:inherit;font-size:12px;line-height:1.45;box-shadow:0 2px 6px color-mix(in srgb,var(--ps-ink) 5%,transparent)}
      .ps-panel[open]{display:flex;flex-direction:column}.ps-panel[data-below]{inset:var(--ps-drop) 0 auto}
      @media(prefers-reduced-motion:no-preference){.ps-panel[open]{animation:ps-reveal 110ms ease-out}@keyframes ps-reveal{from{opacity:0;translate:0 3px}to{opacity:1;translate:0 0}}}
      .ps-panel::backdrop{background:transparent}.ps-panel[data-sheet]{position:fixed;inset:auto 0 var(--ps-mobile-bottom,0px);width:100%;max-height:var(--ps-mobile-height,75dvh);border-radius:16px 16px 0 0;padding-bottom:max(4px,env(safe-area-inset-bottom))}
      .ps-panel button{border-radius:5px;padding:4px 7px}.ps-panel button:hover{background:var(--ps-wash);color:var(--ps-ink)}.ps-panel button:disabled{opacity:.45;cursor:default}
      .ps-head,.ps-actions,.ps-foot,.ps-feedback{display:flex;gap:6px;align-items:center;flex:none}.ps-head{min-height:28px;padding:0 3px;color:var(--ps-muted)}.ps-head h2{flex:1;margin:0;font:inherit;font-weight:500}.ps-head .ps-mark,.ps-head .ps-count{min-width:24px;text-align:center}.ps-count{font-variant-numeric:tabular-nums}.ps-panel .ps-close,.ps-panel .ps-more{display:grid;place-items:center;width:26px;height:26px;padding:0;color:var(--ps-muted)}
      .ps-searchbar{display:flex;align-items:center;gap:6px;margin:2px 4px;padding:0 6px;border-block:1px solid var(--ps-line);color:var(--ps-muted)}.ps-panel .ps-search{width:100%;min-height:30px;min-width:0;padding:3px 2px;background:transparent;border:0;outline:none;color:var(--ps-ink)}.ps-searchbar:focus-within{border-bottom-color:var(--ps-muted)}
      .ps-scroll,.ps-editor{overflow:auto;overscroll-behavior:contain;min-height:0}.ps-scroll{padding:2px}.ps-group{margin:5px 0 1px;padding-inline:28px;font-size:11px;font-weight:500;color:var(--ps-muted)}
      .ps-item{display:flex;gap:2px;align-items:center;border-radius:5px}.ps-item[data-active]{background:var(--ps-wash)}.ps-panel .ps-row{flex:1;min-width:0;display:flex;align-items:center;gap:8px;min-height:28px;padding:3px 6px;text-align:start}.ps-row .ps-glyph{color:var(--ps-muted);width:13px}.ps-row strong,.ps-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ps-row strong{flex:0 1 auto;max-width:45%;font-size:12px;font-weight:550}.ps-row span{flex:1;min-width:0;color:var(--ps-muted)}
      .ps-actions{padding:2px 6px 4px 26px;flex-wrap:wrap}.ps-panel .ps-danger,.ps-panel .ps-error{color:var(--dsw-alias-state-error-primary)}.ps-panel .ps-error{margin:4px 8px}
      .ps-empty{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px;color:var(--ps-muted)}.ps-empty p{margin:0}.ps-panel .ps-primary{padding:3px 9px;border:1px solid var(--ps-line);background:var(--ps-wash);color:var(--ps-ink);font-weight:500}.ps-panel .ps-primary:hover{border-color:var(--ps-muted)}
      .ps-foot,.ps-feedback{justify-content:space-between;gap:8px;flex-wrap:wrap;padding:5px 8px 1px;border-top:1px solid var(--ps-line);color:var(--ps-muted);font-size:11px}.ps-feedback{overflow-wrap:anywhere}.ps-foot button,.ps-feedback button{font-size:12px}
      .ps-editor{padding:8px 10px}.ps-editor label{display:block;margin:0 0 8px;color:var(--ps-muted)}.ps-editor input,.ps-editor textarea{display:block;width:100%;margin-top:3px;padding:6px 8px;border:1px solid var(--ps-line);border-radius:6px;background:var(--ps-surface);color:var(--ps-ink);font-size:13px}.ps-editor textarea{resize:vertical}.ps-editor .ps-actions{justify-content:flex-end;padding:4px 0 0}.ps-editor small{color:var(--ps-muted)}
      @media(max-width:480px){.ps-trigger{min-width:36px;padding-inline:6px}.ps-trigger span{display:none}}
      @media(max-width:600px){.ps-keys{display:none}.ps-panel button,.ps-panel .ps-row,.ps-panel .ps-more,.ps-panel .ps-close{min-height:44px}.ps-panel .ps-more,.ps-panel .ps-close{min-width:44px}.ps-panel .ps-search,.ps-editor input,.ps-editor textarea{font-size:16px}.ps-group{margin-top:6px}}
    `

    function readLibrary() {
      const rows = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      if (!Array.isArray(rows) || !rows.every(r => r && typeof r.id === 'string' && typeof r.title === 'string' && typeof r.body === 'string')) throw new Error('Invalid snippet library')
      return rows
    }

    function groupRows(rows, query) {
      const q = query.trim().toLocaleLowerCase()
      const matches = rows.filter(r => !q || `${r.title}\n${r.body}`.toLocaleLowerCase().includes(q))
      return [
        ['pinned', matches.filter(r => r.pinnedAt).toSorted((a, b) => a.pinnedAt - b.pinnedAt)],
        ['recent', matches.filter(r => !r.pinnedAt && r.usedAt).toSorted((a, b) => b.usedAt - a.usedAt)],
        ['yours', matches.filter(r => !r.pinnedAt && !r.usedAt)],
      ].filter(([, list]) => list.length)
    }

    function suggestTitle(body) {
      const first = body.trim().split(/[\n。！？!?]|\.\s/u, 1)[0]
      return Array.from(first || body.trim()).slice(0, 40).join('')
    }

    function button(label, onClick, props = {}) {
      return h('button', { type: 'button', onClick, ...props }, label)
    }

    function Icon({ name = 'bookmark' }) {
      const paths = { bookmark: 'M5 3h10v14l-5-3-5 3z', file: 'M5 2.5h6l4 4V17H5zM11 2.5v4h4M7.5 10h5m-5 3h4', down: 'm5 8 5 5 5-5', search: 'M13 8.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-1 3.5 4 4', more: 'M4 10h.2M10 10h.2M16 10h.2' }
      return h('svg', { className: 'ps-glyph', viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: name === 'more' ? 2.8 : 1.6, strokeLinejoin: 'round', strokeLinecap: 'round', 'aria-hidden': true }, h('path', { d: paths[name] }))
    }

    const seatId = sessionId => 'ps-stash-drawer-' + sessionId
    function DrawerSeat({ sessionId }) {
      return h('div', { id: seatId(sessionId), className: 'ps-seat' })
    }

    function Panel({ t, anchor, sessionId, span, useInput, inputActions, dismiss }) {
      const dialog = useRef(null)
      const primary = useRef(null)
      const bodyField = useRef(null)
      const rowRefs = useRef(new Map())
      const headingId = useId()
      const seat = document.getElementById(seatId(sessionId))
      const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width:600px)').matches)
      const sheet = narrow || !seat
      const [highlight, setHighlight] = useState(null)
      const draft = useInput(s => s.draft)
      const [rows, setRows] = useState(null)
      const [error, setError] = useState('')
      const [query, setQuery] = useState('')
      const [form, setForm] = useState(null)
      const [more, setMore] = useState(null)
      const [deleted, setDeleted] = useState(null)
      const [sampleHidden, setSampleHidden] = useState(false)
      const [saved, setSaved] = useState('')
      const editing = form !== null
      const ready = rows !== null
      const hasItems = Boolean(rows?.length)
      const replace = span.start !== span.end
      const insertLabel = t(replace ? 'replace' : 'insert')
      const sample = { title: t('sampleTitle'), body: t('sampleBody') }
      const groups = groupRows(rows ?? [], query)
      const visible = groups.flatMap(([, list]) => list)
      const active = visible.find(row => row.id === highlight) ?? visible[0]

      useLayoutEffect(() => {
        function refresh() {
          try {
            const hidden = localStorage.getItem(SAMPLE_HIDDEN_KEY) === '1'
            setSampleHidden(hidden)
            if (!hidden) setDeleted(last => last?.sample ? null : last)
            setRows(readLibrary()); setError('')
          } catch { setError('failed') }
        }
        function onStorage(e) { if (e.key === KEY || e.key === SAMPLE_HIDDEN_KEY || e.key === null) refresh() }
        const media = window.matchMedia('(max-width:600px)')
        function resize() { setNarrow(media.matches) }
        refresh()
        media.addEventListener('change', resize)
        window.addEventListener('storage', onStorage)
        return () => { media.removeEventListener('change', resize); window.removeEventListener('storage', onStorage) }
      }, [])

      useLayoutEffect(() => {
        const el = dialog.current
        if (!sheet) {
          function position() {
            const top = seat.getBoundingClientRect().top
            const viewport = window.visualViewport
            const viewTop = viewport?.offsetTop ?? 0
            const viewBottom = viewTop + (viewport?.height ?? window.innerHeight)
            const above = top - viewTop - 12
            const belowEdge = anchor.getBoundingClientRect().bottom + 8
            const below = viewBottom - belowEdge - 6
            const flip = above < 160 && below > above
            el.toggleAttribute('data-below', flip)
            el.style.setProperty('--ps-drop', (belowEdge - top) + 'px')
            el.style.setProperty('--ps-headroom', Math.max(0, flip ? below : above) + 'px')
          }
          el.show(); position()
          const resize = new ResizeObserver(position)
          resize.observe(seat)
          window.addEventListener('resize', position)
          return () => { resize.disconnect(); window.removeEventListener('resize', position); if (el.open) el.close() }
        }
        function fitKeyboard() {
          const viewport = window.visualViewport
          const height = viewport?.height ?? window.innerHeight
          el.style.setProperty('--ps-mobile-bottom', Math.max(0, window.innerHeight - (viewport?.offsetTop ?? 0) - height) + 'px')
          el.style.setProperty('--ps-mobile-height', Math.min(height * .85, 560) + 'px')
        }
        el.showModal(); fitKeyboard()
        window.visualViewport?.addEventListener('resize', fitKeyboard)
        window.visualViewport?.addEventListener('scroll', fitKeyboard)
        return () => {
          window.visualViewport?.removeEventListener('resize', fitKeyboard)
          window.visualViewport?.removeEventListener('scroll', fitKeyboard)
          if (el.open) el.close()
        }
      }, [anchor, seat, sheet])

      useLayoutEffect(() => {
        if (sheet || editing) return
        function outside(e) {
          const path = e.composedPath()
          if (!path.includes(dialog.current) && !path.includes(anchor)) dismiss()
        }
        document.addEventListener('pointerdown', outside, true)
        return () => document.removeEventListener('pointerdown', outside, true)
      }, [anchor, dismiss, editing, sheet])

      useLayoutEffect(() => {
        if (ready) (editing ? bodyField.current : primary.current)?.focus()
      }, [editing, hasItems, ready, sheet])

      function change(transform) {
        try {
          const next = transform(readLibrary())
          if (!next) { setError('missing'); return false }
          localStorage.setItem(KEY, JSON.stringify(next)); setRows(next); setError(''); setSaved('')
          return true
        } catch { setError('failed'); return false }
      }
      function update(id, fn) {
        return change(items => items.some(r => r.id === id) && items.map(r => r.id === id ? fn(r) : r))
      }
      function begin(row, text = '') {
        setMore(null); setSaved(''); setError(''); setForm({ id: row?.id, title: row?.title ?? null, body: row?.body ?? text })
      }
      function save(e) {
        e.preventDefault()
        const title = form.title?.trim() || suggestTitle(form.body)
        if (!title || !form.body.trim()) return
        const body = form.body
        const ok = form.id ? update(form.id, r => ({ ...r, title, body })) : change(items => [
          { id: Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8, '0')).join(''), title, body, pinnedAt: 0, usedAt: 0 }, ...items,
        ])
        if (ok) { setForm(null); setQuery(''); setSaved(title) }
      }
      function insert(row) {
        // external: close modal dialog before native editor sets selection, or top-layer focus traps it
        const el = dialog.current
        el.close()
        if (!inputActions.insertText(row.body, span)) {
          if (sheet) el.showModal(); else el.show()
          setError('changed'); primary.current?.focus(); return
        }
        if (row.id) update(row.id, r => ({ ...r, usedAt: Date.now() }))
        dismiss()
      }
      function remove(row) {
        let removed
        const ok = change(items => {
          const index = items.findIndex(r => r.id === row.id)
          if (index < 0) return null
          removed = { row: items[index], index }
          return items.toSpliced(index, 1)
        })
        if (ok) { setDeleted(removed); setMore(null); primary.current?.focus() }
      }
      function hideSample(hidden) {
        try {
          if (hidden) localStorage.setItem(SAMPLE_HIDDEN_KEY, '1')
          else localStorage.removeItem(SAMPLE_HIDDEN_KEY)
          setSampleHidden(hidden); setDeleted(hidden ? { sample: true } : null)
          setSaved(''); setError(''); primary.current?.focus()
        } catch { setError('failed') }
      }
      function undoDelete() {
        if (deleted.sample) { hideSample(false); return }
        const { row, index } = deleted
        if (change(items => items.some(r => r.id === row.id) ? items : items.toSpliced(index, 0, row))) {
          setDeleted(null); setQuery(''); primary.current?.focus()
        }
      }
      function onListKey(e) {
        if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229 || !active) return
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); e.stopPropagation()
          const next = (visible.indexOf(active) + (e.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length
          rowRefs.current.get(visible[next].id)?.focus()
        } else if (e.key === 'Enter') {
          e.preventDefault(); e.stopPropagation(); insert(active)
        }
      }
      function renderRow(row, example = false) {
        return h('div', { key: row.id || 'example' }, h('div', { className: 'ps-item', 'data-active': !example && row === active || undefined,
          onPointerMove: e => { if (!example && e.pointerType === 'mouse' && row.id !== highlight) setHighlight(row.id) },
          onFocus: () => { if (!example) setHighlight(row.id) },
        }, button(h(React.Fragment, null, h(Icon, { name: 'file' }), h('strong', null, row.title), h('span', null, row.body)), () => insert(row), {
            className: 'ps-row', title: `${insertLabel}\n${row.body}`, 'aria-label': `${insertLabel}: ${row.title}. ${row.body}`,
            ref: el => { if (el) rowRefs.current.set(row.id, el); else rowRefs.current.delete(row.id) },
            onKeyDown: example ? undefined : onListKey,
          }),
          example ? button(t('removeSample'), () => hideSample(true)) : button(h(Icon, { name: 'more' }), () => setMore(more === row.id ? null : row.id), {
            className: 'ps-more', 'aria-label': t('more', { title: row.title }), title: t('more', { title: row.title }), 'aria-expanded': more === row.id,
          })),
          !example && more === row.id && h('div', { className: 'ps-actions' },
            button(t(row.pinnedAt ? 'unpin' : 'pin'), () => {
              if (update(row.id, r => ({ ...r, pinnedAt: r.pinnedAt ? 0 : Date.now() }))) { setMore(null); primary.current?.focus() }
            }), button(t('edit'), () => begin(row)), button(t('remove'), () => remove(row), { className: 'ps-danger' })))
      }
      const list = rows !== null && h(React.Fragment, null,
        hasItems && h('div', { className: 'ps-searchbar' }, h(Icon, { name: 'search' }), h('input', { type: 'search', className: 'ps-search', ref: primary, value: query, placeholder: t('search'), 'aria-label': t('search'),
          onChange: e => { setQuery(e.target.value); setMore(null); setHighlight(null) }, onKeyDown: onListKey })),
        h('div', { className: 'ps-scroll' }, hasItems ? (visible.length ? groups.map(([name, items]) => h('section', { key: name },
          h('h3', { className: 'ps-group' }, t(name)), items.map(r => renderRow(r)))) : h('div', { className: 'ps-empty' }, h('p', null, t('noMatches')),
          button(t('clear'), () => { setQuery(''); primary.current?.focus() }))) : h(React.Fragment, null,
          h('div', { className: 'ps-empty' }, h('p', null, t('empty')),
            button(t(draft.trim() ? 'fromDraft' : 'first'), () => begin(null, draft), { className: 'ps-primary', ref: primary })),
          !sampleHidden && h(React.Fragment, null, h('h3', { className: 'ps-group' }, t('sample')), renderRow(sample, true)))),
        h('footer', { className: 'ps-foot' }, h('span', null, `${insertLabel} · ${t('noSend')}`),
          hasItems && draft.trim() ? button(t('fromDraftShort'), () => begin(null, draft)) : hasItems && h('span', { className: 'ps-keys' }, t(replace ? 'replaceHint' : 'shortcutHint'))))
      const editor = editing && h('form', { className: 'ps-editor', onSubmit: save },
        h('label', null, t('body'), h('textarea', { ref: bodyField, rows: 4, value: form.body, required: true, placeholder: t('bodyHint'), onChange: e => setForm({ ...form, body: e.target.value }) })),
        h('label', null, t('name'), h('input', { value: form.title ?? suggestTitle(form.body), placeholder: t('nameHint'), onChange: e => setForm({ ...form, title: e.target.value }) })),
        h('small', null, t('local')), h('div', { className: 'ps-actions' }, button(t('cancel'), () => { setForm(null); setError('') }),
          h('button', { type: 'submit', className: 'ps-primary', disabled: !form.body.trim() }, t('save'))))
      return createPortal(h('dialog', { ref: dialog, className: 'ps-panel', 'data-sheet': sheet || undefined, 'aria-labelledby': headingId,
        onKeyDown: e => {
          if (sheet || e.key !== 'Escape' || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return
          e.preventDefault(); e.stopPropagation()
          if (editing) { setForm(null); setError('') } else dismiss()
        },
        onCancel: e => { e.preventDefault(); if (editing) { setForm(null); setError('') } else dismiss() },
        onClick: e => {
          if (sheet && !editing && e.target === dialog.current) {
            const r = dialog.current.getBoundingClientRect()
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dismiss()
          } },
      }, h('header', { className: 'ps-head' }, h('span', { className: 'ps-mark' }, h(Icon)), h('h2', { id: headingId }, t(editing ? (form.id ? 'edit' : 'new') : 'title')),
        !editing && hasItems && button(`＋ ${t('new')}`, () => begin(null)),
        !editing && ready && h('span', { className: 'ps-count' }, rows.length),
        !editing && button(h(Icon, { name: 'down' }), dismiss, { className: 'ps-close', title: t('close'), 'aria-label': t('close') })),
      editing ? editor : list,
      error && h('p', { className: 'ps-error', role: 'alert' }, t(error)),
      !editing && saved && h('div', { className: 'ps-feedback', role: 'status' }, t('saved', { title: saved })),
      !editing && deleted && h('div', { className: 'ps-feedback' },
        h('span', { role: 'status' }, deleted.sample ? t('sampleRemoved') : t('removed', { title: deleted.row.title })), button(t('undo'), undoDelete))), sheet ? document.body : seat)
    }

    function Launcher(props) {
      const [span, setSpan] = useState(null)
      const anchor = useRef(null)
      const pressed = useRef(null)
      return h(React.Fragment, null, h('style', null, css), button(h(React.Fragment, null,
        h(Icon), h('span', null, props.t('title'))),
      e => { setSpan(span ? null : (e.detail > 0 && pressed.current) || props.inputActions.captureInsertion()); pressed.current = null }, {
        ref: anchor, className: 'ps-trigger', 'aria-haspopup': 'dialog', 'aria-expanded': Boolean(span), 'aria-label': props.t('title'), title: props.t('title'),
        onPointerDown: () => { pressed.current = props.inputActions.captureInsertion() },
        onMouseDown: e => e.preventDefault(),
      }), span && h(Panel, { ...props, span, anchor: anchor.current, dismiss: () => setSpan(null) }))
    }
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(dicts)) ctx.effect(() => ctx.locale.register(NS, lang, dict))
        ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({
          name: 'conversation.input.overlay', id: `${NS}.drawer`,
        }, DrawerSeat))
        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left', id: NS, locale: NS, order: 81,
        }, props => h(Launcher, { ...props, key: props.sessionId })))
      },
    }
  },
})
