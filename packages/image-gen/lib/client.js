window.__ModuleLoader__.load({
  id: 'dsh-image-gen',
  factory(require) {
    const React = require('react')
    const {
      DisclosureRow,
      FileTypeIcon,
      IconBrowseOutlineRegular,
      IconInspectOutlineRegular,
      Switch,
      TextShimmer,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'image-gen'
    const KEY = 'dsh-image-gen'
    const TURN_DATA_KEY = 'image-gen-created'
    const IMAGE_TOOLS = new Set(['openai_image', 'grok_image'])
    const SEP = '\u0000'

    const en = {
      rowOpenai: 'OpenAI image',
      rowGrok: 'Grok image',
      imageCount: '{n} images',
      imageSingle: '1 image',
      stopped: 'Stopped',
      inspect: 'Inspect',
      output: 'OUT',
      revisedPrompt: 'Prompt used',
      openFile: 'Open image file',
      generatedHeading: 'Generated images',
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
      imageCount: '{n} 张图片',
      imageSingle: '1 张图片',
      stopped: '已中止',
      inspect: '查看',
      output: '输出',
      revisedPrompt: '实际提示词',
      openFile: '打开图片文件',
      generatedHeading: '生成的图片',
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
.ig{--ig-line:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l3);--ig-r:var(--dsw-radius-sm,8px);display:flex;flex-direction:column;gap:12px;padding:4px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.ig-title{margin:0;font-size:14px;line-height:20px;font-weight:500}
.ig-hint,.ig-note{color:var(--dsw-alias-label-secondary);line-height:20px}
.ig-note.warn{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.ig-note.err{color:var(--dsw-alias-state-error-primary)}
.ig-note.ok{color:var(--dsw-alias-state-success-primary)}
.ig-row{display:grid;grid-template-columns:132px minmax(0,380px);gap:8px;align-items:center}
.ig-row:has([role=switch]){cursor:pointer}
.ig-row:has([role=switch]:disabled){cursor:default}
.ig-row>span{color:var(--dsw-alias-label-secondary)}
.ig select,.ig input[type=text]{height:32px;min-width:0;padding:0 10px;border:var(--ig-line);border-radius:var(--ig-r);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}
.ig select{cursor:pointer}
.ig select:disabled,.ig input:disabled{opacity:.6;cursor:default}
.ig select:focus-visible,.ig input:focus-visible,.ig-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.ig-section{display:flex;flex-direction:column;gap:12px;padding-top:14px;border-top:var(--dsh-hairline-width,.5px) solid var(--dsw-alias-border-l1)}
.ig-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ig-btn{height:30px;padding:0 14px;border:var(--ig-line);border-radius:999px;corner-shape:round;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;transition:background-color .15s}
.ig-btn.primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.ig-btn:disabled{opacity:.4;cursor:default}
@media (hover:hover){.ig-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.ig-btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}}
@media (pointer:coarse){.ig select,.ig input[type=text]{font-size:16px}}
@media (max-width:560px){.ig-row{grid-template-columns:1fr}}
.ig-card{display:flex;flex-direction:column}
.ig-tool-row{min-width:0}
.ig-sep{flex:none;width:2px;height:2px;margin:0 8px;border-radius:1px;background:var(--dsw-alias-label-caption)}
.ig-summary{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.ig-summary.ig-err{color:var(--dsw-alias-state-error-primary)}
.ig-summary.ig-stop{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary))}
.ig-suffix{flex:none;margin-left:4px;white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px))}
.ig-body{display:flex;flex-direction:column;min-width:0}
.ig-image-body{margin:4px 0 4px 4px}
.ig-meta-list{margin-top:4px;display:flex;flex-direction:column;gap:4px;font:var(--dsw-font-markdown-code-block-small);color:var(--dsw-alias-label-tertiary)}
.ig-meta-item{display:flex;flex-direction:column;gap:2px}
.ig-file-link{display:inline-flex;align-items:center;gap:5px;max-width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.ig-file-path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ig-file-size{flex:none;color:var(--dsw-alias-label-caption)}
@media (hover:hover){.ig-file-link:hover{color:var(--dsw-alias-label-primary)}.ig-file-link:hover .ig-file-path{text-decoration:underline;text-underline-offset:3px}}
.ig-revised{margin-top:2px;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xs-13);overflow-wrap:anywhere}
.ig-revised-label{color:var(--dsw-alias-label-caption);margin-right:6px}
.ig-io{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;margin:4px 0 4px 4px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small)}
.ig-io-sec{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;padding:12px 16px;max-height:150px;overflow-y:auto}
.ig-io-sec::-webkit-scrollbar-thumb{border:2px solid transparent;background-clip:padding-box;border-radius:var(--dsw-radius-sm)}
.ig-io-sec::-webkit-scrollbar-track{margin:6px 0}
.ig-io-label{position:sticky;top:0;align-self:start;color:var(--dsw-alias-label-caption)}
.ig-io-text{min-width:0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-state-error-primary)}
.ig-inspect{display:inline-flex;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer;opacity:0;transition:opacity 100ms ease}
.ig-inspect:focus-visible{opacity:1}
@media (hover:hover){.ig-card:hover .ig-inspect{opacity:1}.ig-inspect:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
@media (hover:none){.ig-inspect{opacity:1}}
.ig-tail{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.ig-tail-files{display:flex;flex-wrap:wrap;gap:6px}
.ig-tail-chip{display:inline-flex;align-items:center;gap:5px;max-width:300px;height:22px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;cursor:pointer}
.ig-tail-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (hover:hover){.ig-tail-chip:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}}
`

    async function getJson(path, init) {
      const r = await fetch(path, { ...init, headers: { accept: 'application/json', ...(init?.body ? { 'content-type': 'application/json' } : {}) } })
      let data = null
      try { data = await r.json() } catch {}
      if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`)
      return data
    }

    // external: dsh child-slot declarations have a single owner, so mirror tool.call.images into a private slot
    function mirrorSlot(ctx, source, target) {
      ctx.slots.inject(target, () => {
        let disposers = []
        const sync = () => {
          for (const dispose of disposers) dispose()
          disposers = []
          for (const entry of ctx.slots.entries(source)) {
            disposers.push(ctx.slots.register({
              ...entry,
              ...entry.options,
              name: target,
            }, entry.component))
          }
        }
        const off = ctx.on('slots/changed', name => { if (name === source) sync() })
        sync()
        return () => {
          off()
          for (const dispose of disposers) dispose()
        }
      })
    }

    const KINDS = ['openai', 'grok']
    const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)
    const firstLine = text => {
      if (typeof text !== 'string') return ''
      const index = text.indexOf('\n')
      return index === -1 ? text : text.slice(0, index)
    }
    const shortPath = (path, cwd, home) => {
      if (cwd && path.startsWith(`${cwd}/`)) return path.slice(cwd.length + 1)
      if (home && path.startsWith(`${home}/`)) return `~/${path.slice(home.length + 1)}`
      return path
    }
    const baseName = path => path.replace(/\\/g, '/').split('/').filter(Boolean).slice(-1)[0] || path
    const formatSize = bytes => {
      if (!Number.isFinite(bytes) || bytes <= 0) return ''
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    const formatDimensions = image => {
      const att = image.attachment
      const parts = []
      if (Number.isFinite(att?.width) && Number.isFinite(att?.height)) parts.push(`${att.width}×${att.height}`)
      const size = formatSize(att?.bytes ?? image.bytes)
      if (size) parts.push(size)
      return parts.join(' · ')
    }
    const resultText = block => {
      if (!block || !('kind' in block) || !Array.isArray(block.content)) return ''
      return block.content.filter(item => item.type === 'text').map(item => item.text).join('\n')
    }
    const parseMetaImages = meta => {
      if (!isRecord(meta) || !Array.isArray(meta.images)) return []
      return meta.images
        .filter(item => isRecord(item) && typeof item.path === 'string' && item.path !== '')
        .map(item => ({
          path: item.path,
          ...(isRecord(item.attachment) ? { attachment: item.attachment } : {}),
          ...(typeof item.revisedPrompt === 'string' && item.revisedPrompt !== '' ? { revisedPrompt: item.revisedPrompt } : {}),
          ...(typeof item.bytes === 'number' ? { bytes: item.bytes } : {}),
        }))
    }
    const parseImageBlock = (phase, block) => {
      const settled = phase === 'result' && block && 'kind' in block
      const call = settled ? block.call : block
      let args = {}
      try {
        const parsed = JSON.parse(call?.argsRaw ?? '{}')
        if (isRecord(parsed)) args = parsed
      } catch {}
      const prompt = typeof args.prompt === 'string' ? args.prompt
        : (typeof block?.meta?.prompt === 'string' ? block.meta.prompt : block?.args?.text?.('prompt') ?? '')
      const state = phase === 'preparing' ? 'preparing'
        : !settled ? 'running'
          : block.error?.code === 'interrupted' ? 'stopped'
            : block.isError ? 'error' : 'ok'
      const images = state === 'ok' ? parseMetaImages(block.meta) : []
      const model = state === 'ok' && typeof block.meta?.model === 'string' ? block.meta.model : ''
      return { state, prompt, images, model, text: settled ? resultText(block) : '' }
    }

    const imageGenTurnDefinition = {
      kind: TURN_DATA_KEY,
      match(event) {
        if (event.type === 'turn/start') return { id: String(event.data.turn), role: 'start' }
        if (event.type === 'tool/call') return { id: String(event.data.turn), role: 'update' }
        if (event.type === 'tool/result' && event.surfaceOp === 'append') {
          return { id: String(event.data.turn), role: 'update' }
        }
        return null
      },
      start(_context, match) {
        return { turn: match.event.data.turn, calls: new Map(), generated: [] }
      },
      update(context, match) {
        if (match.event.type === 'tool/call') {
          if (!IMAGE_TOOLS.has(match.event.data.name)) return context.state
          const calls = new Map(context.state.calls)
          calls.set(String(match.event.data.callId), {
            name: match.event.data.name,
            argsRaw: match.event.data.arguments,
          })
          return { ...context.state, calls }
        }
        if (match.event.type !== 'tool/result') return context.state
        const message = match.event.data.message
        if (message?.isError === true) return context.state
        const callId = String(message?.source?.callId ?? '')
        const call = context.state.calls.get(callId)
        if (!call) return context.state
        const images = parseMetaImages(match.event.data.meta).filter(image => isRecord(image.attachment))
        if (images.length === 0) return context.state
        const entry = { seq: match.event.seq, callId, toolName: call.name, images }
        return { ...context.state, generated: [...context.state.generated, entry] }
      },
      buildLocationData(context, scope, previous) {
        if (scope !== 'turn' || context.state === undefined) return null
        if (previous?.kind === 'turn'
          && previous.turn === context.state.turn
          && previous.key === TURN_DATA_KEY
          && previous.value?.generated === context.state.generated) return previous
        return {
          kind: 'turn',
          turn: context.state.turn,
          key: TURN_DATA_KEY,
          value: { generated: context.state.generated },
        }
      },
    }

    const selectTurnImages = owner => {
      const data = owner.turn?.data?.get?.(TURN_DATA_KEY)
      if (!data || !Array.isArray(data.generated) || data.generated.length === 0) return []
      const bound = owner.turn.end?.seq ?? owner.seq
      const out = []
      for (const entry of data.generated) {
        if (entry.seq <= bound) {
          for (const image of entry.images) out.push(image)
        }
      }
      return out
    }

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
      inject: ['slots', 'locale', 'remote', 'remote.session', 'uiConversation'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'image-gen: dictionaries')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'image-gen: styles')
        const t = ctx.locale.bind(NS)

        function ImageRow({ toolName, phase, block, cwd, home, sessionId, openFile, loadImage, inspect, renderSlot, useDisclosure, useContextMenu }) {
          const { expanded, toggle } = useDisclosure()
          const { getTriggerProps } = useContextMenu()
          const parsed = parseImageBlock(phase, block)
          const title = toolName === 'grok_image' ? t('rowGrok') : t('rowOpenai')
          const running = parsed.state === 'preparing' || parsed.state === 'running'
          const gallery = parsed.images.filter(image => isRecord(image.attachment)).map(image => ({ attachment: image.attachment }))
          const hasBody = (parsed.state === 'ok' && parsed.images.length > 0) || (parsed.state === 'error' && parsed.text.length > 0)
          const open = expanded && hasBody

          let summary = firstLine(parsed.prompt)
          if (parsed.state === 'stopped') summary = t('stopped')
          else if (parsed.state === 'error' && parsed.text) summary = firstLine(parsed.text)
          const countLabel = parsed.state === 'ok' && parsed.images.length > 0
            ? (parsed.images.length === 1 ? t('imageSingle') : t('imageCount', { n: parsed.images.length }))
            : ''

          return h('div', { className: 'ig-card', 'data-tool': toolName, 'data-state': parsed.state },
            h(DisclosureRow, {
              rowClassName: 'ig-tool-row',
              icon: h(IconBrowseOutlineRegular, { size: 14 }),
              title,
              running,
              open,
              expandable: hasBody,
              expandOnRowClick: true,
              keepContentWhenOpen: true,
              onToggle: toggle,
              collapsedContent: parsed.state === 'preparing' ? null : h(React.Fragment, null,
                summary ? h(React.Fragment, null,
                  h('span', { className: 'ig-sep', 'data-shimmer-decoration': true, 'aria-hidden': true }),
                  h('span', { className: `ig-summary${parsed.state === 'error' ? ' ig-err' : parsed.state === 'stopped' ? ' ig-stop' : ''}` },
                    h(TextShimmer, null, summary))) : null,
                countLabel ? h(TextShimmer, { className: 'ig-suffix' }, summary ? `· ${countLabel}` : countLabel) : null),
            },
            open ? h('div', { className: 'ig-body' },
              parsed.images.length > 0 ? h('div', { className: 'ig-image-body' },
                gallery.length > 0 && renderSlot && loadImage
                  ? renderSlot(`image-gen.${toolName}.images`, { images: gallery, loadImage, align: 'start' })
                  : null,
                h('div', { className: 'ig-meta-list' },
                  parsed.images.map((image, index) => {
                    const dims = formatDimensions(image)
                    return h('div', { key: `${image.path}:${index}`, className: 'ig-meta-item' },
                      h('button', {
                        type: 'button',
                        className: 'ig-file-link',
                        title: `${t('openFile')}: ${image.path}`,
                        ...getTriggerProps(() => ({ kind: 'file', value: { sessionId, path: image.path } })),
                        onClick: event => { event.stopPropagation(); openFile(image.path) },
                      },
                      h(FileTypeIcon, { path: image.path, size: 14 }),
                      h('span', { className: 'ig-file-path' }, shortPath(image.path, cwd, home)),
                      dims ? h('span', { className: 'ig-file-size' }, dims) : null),
                      image.revisedPrompt ? h('div', { className: 'ig-revised' },
                        h('span', { className: 'ig-revised-label' }, t('revisedPrompt')),
                        image.revisedPrompt) : null)
                  }))) : null,
              parsed.state === 'error' && parsed.text ? h('div', { className: 'ig-io' },
                h('div', { className: 'ig-io-sec' },
                  h('span', { className: 'ig-io-label' }, t('output')),
                  h('span', { className: 'ig-io-text' }, parsed.text))) : null,
              inspect ? h('button', { type: 'button', className: 'ig-inspect', onClick: inspect },
                h(IconInspectOutlineRegular), t('inspect')) : null) : null))
        }

        for (const key of ['openai_image', 'grok_image']) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            locale: NS,
            priority: -10,
            children: { [`image-gen.${key}.images`]: { kind: 'single', scope: 'session' } },
          }, ImageRow))
          mirrorSlot(ctx, 'tool.call.images', `image-gen.${key}.images`)
        }

        if (ctx.uiConversation?.events?.register) {
          ctx.effect(() => ctx.uiConversation.events.register(imageGenTurnDefinition), 'image-gen: turn data')
          function ImageTurnTail({ turn, seq, openFile, renderSlot, loadImage }) {
            const images = selectTurnImages({ turn, seq })
            if (images.length === 0) return null
            const gallery = images.map(image => ({ attachment: image.attachment }))
            return h('div', { className: 'ig-tail', 'aria-label': t('generatedHeading') },
              renderSlot && loadImage ? renderSlot('image-gen.tail.images', { images: gallery, loadImage, align: 'start' }) : null,
              h('div', { className: 'ig-tail-files' },
                images.map((image, index) => h('button', {
                  key: `${image.path}:${index}`,
                  type: 'button',
                  className: 'ig-tail-chip',
                  title: `${t('openFile')}: ${image.path}`,
                  onClick: () => openFile(image.path),
                }, h(FileTypeIcon, { path: image.path, size: 12 }), h('span', null, baseName(image.path))))))
          }
          ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
            name: 'conversation.chat.turnTail',
            id: 'image-gen-gallery',
            order: 15,
            locale: NS,
            inject: sessionId => ({
              loadImage: attachment => ctx.uiConversation.imageUrl(sessionId, attachment),
            }),
            children: { 'image-gen.tail.images': { kind: 'single', scope: 'session' } },
          }, ImageTurnTail))
          mirrorSlot(ctx, 'tool.call.images', 'image-gen.tail.images')
        }

        function Settings() {
          React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
          const [catalog, setCatalog] = React.useState({ status: 'loading', groups: [] })
          const [saved, setSaved] = React.useState(null)
          const [draft, setDraft] = React.useState(null)
          const [status, setStatus] = React.useState({ kind: 'idle' })

          const catalogRead = React.useRef(0)
          const loadCatalog = React.useCallback(async () => {
            const id = ++catalogRead.current
            setCatalog(c => ({ ...c, status: 'loading' }))
            try {
              const res = await ctx.remote.session.modelCatalog()
              if (id !== catalogRead.current) return
              if (!res.ok) throw res.error ?? new Error('catalog')
              setCatalog({ status: 'ready', groups: res.value.groups })
            } catch {
              if (id === catalogRead.current) setCatalog(c => ({ ...c, status: 'error' }))
            }
          }, [])
          const loadState = React.useCallback(() => getJson('image-gen/state')
            .then(raw => { const s = normalize(raw); setSaved(s); setDraft(pickDraft(s)); setStatus({ kind: 'idle' }) })
            .catch(e => setStatus({ kind: 'loadError', message: e.message })), [])
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
              const raw = await getJson('image-gen/set', { method: 'POST', body: JSON.stringify(draft) })
              const s = normalize({ responsesProviders: saved.responsesProviders, ...raw })
              setSaved(s); setDraft(pickDraft(s)); setStatus({ kind: 'ok' })
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
                h(Switch, { checked: value.enabled, disabled: busy, label: t('enabled'), onChange: enabled => patchKind(kind, { enabled }) })),
              h('label', { className: 'ig-row' },
                h('span', null, t('model')),
                h('select', { value: key, disabled: busy || !value.enabled, onChange: onModel }, options)),
              unchanged && st && st !== 'disabled'
                ? h('div', { className: `ig-note ${st === 'ready' ? 'ok' : 'warn'}` }, st === 'ready' ? t('ready') : t('notReady') + st)
                : null)
          }

          return h('div', { className: 'ig' },
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
              status.kind === 'loadError' ? h('span', { className: 'ig-note err', role: 'alert' }, t('loadFailed'), ' ', status.message, ' ',
                h('button', { type: 'button', className: 'ig-btn', onClick: loadState }, t('retry'))) : null,
              status.kind === 'err' ? h('span', { className: 'ig-note err' }, t('saveFailed') + status.message) : null))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: KEY,
          locale: NS,
        }, Settings))
      },
      _internal: { parseImageBlock, imageGenTurnDefinition, selectTurnImages },
    }
  },
})
