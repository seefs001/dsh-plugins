window.__ModuleLoader__.load({
  id: 'dsh-acp-workbench',
  chunk: 'client.page.js',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, Input, StateDot, Switch, Tag,
      IconPlusOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')

    function createPage({ ctx, EMPTY, useT, useOnline, subscribeLive, api, askConfirm, providerVisibleModels, Json }) {
        function useWorkbench() {
          const [data, setData] = React.useState({ providers: EMPTY, providerTemplates: EMPTY, activeByProvider: {}, authByProvider: {}, probeByProvider: {}, localUsageByProvider: {}, defaultCwd: '', storageError: null })
          const [ready, setReady] = React.useState(false)
          const [error, setError] = React.useState('')
          const kick = React.useRef(null)
          React.useEffect(() => {
            const controller = new AbortController()
            let loading = false
            let again = false
            const refresh = async () => {
              if (loading) { again = true; return }
              loading = true
              try {
                do {
                  again = false
                  try {
                    const response = await fetch('/acp-workbench/state', { signal: controller.signal })
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    const next = await response.json()
                    if (controller.signal.aborted) return
                    setData(next)
                    setReady(true)
                    setError('')
                  } catch (failure) { if (!controller.signal.aborted) setError(failure.message) }
                } while (again && !controller.signal.aborted)
              } finally { loading = false }
            }
            kick.current = refresh
            void refresh()
            let debounceTimer = null
            let staleWhileHidden = false
            const onVisibility = () => {
              if (typeof document !== 'undefined' && !document.hidden && staleWhileHidden) {
                staleWhileHidden = false
                void refresh()
              }
            }
            if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility)
            const unsubscribe = subscribeLive(change => {
              if (change && change.activityChanged === false && Array.isArray(change.conversations)) return
              if (typeof document !== 'undefined' && document.hidden) {
                staleWhileHidden = true
                return
              }
              if (debounceTimer) return
              debounceTimer = setTimeout(() => {
                debounceTimer = null
                void refresh()
              }, 250)
            })
            return () => {
              clearTimeout(debounceTimer)
              if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility)
              controller.abort()
              unsubscribe()
              kick.current = null
            }
          }, [])
          return { data, ready, error, refresh: () => kick.current?.() }
        }

        const normalizePolicyDraft = policy => ({
          agentInstructions: policy?.agentInstructions !== false,
          timeContext: policy?.timeContext !== false,
          nowledgeContext: policy?.nowledgeContext !== false,
          systemPromptAppend: policy?.systemPromptAppend === true,
        })
        const providerToDraft = provider => provider ? ({
          ...provider,
          args: JSON.stringify(provider.args),
          contextPolicy: normalizePolicyDraft(provider.contextPolicy),
          additionalDirectoriesText: Array.isArray(provider.additionalDirectories) ? provider.additionalDirectories.join('\n') : '',
          excludedMcpServersText: Array.isArray(provider.excludedMcpServers) ? provider.excludedMcpServers.join(', ') : '',
          systemPromptAppend: typeof provider.systemPromptAppend === 'string' ? provider.systemPromptAppend : '',
        }) : blankProvider()
        const blankProvider = () => ({ id: '', label: '', command: '', args: '["acp"]', contextPolicy: normalizePolicyDraft(null), additionalDirectoriesText: '', excludedMcpServersText: '', systemPromptAppend: '' })
        const FALLBACK_PROVIDER_TEMPLATES = [
          { id: 'cursor', label: 'Cursor', bin: 'cursor-agent', command: 'cursor-agent', args: ['acp'] },
          { id: 'antigravity', label: 'Antigravity', bin: 'agy', command: 'agy', args: ['acp'] },
          { id: 'claude-code', label: 'Claude Code', bin: 'claude-agent-acp', command: 'claude-agent-acp', args: [] },
          { id: 'codex', label: 'Codex', bin: 'codex-acp', command: 'codex-acp', args: [] },
          { id: 'gemini', label: 'Gemini CLI', bin: 'gemini', command: 'gemini', args: ['--acp'] },
          { id: 'opencode', label: 'OpenCode', bin: 'opencode', command: 'opencode', args: ['acp'] },
          { id: 'copilot', label: 'GitHub Copilot', bin: 'copilot', command: 'copilot', args: ['--acp'] },
        ]
        const nextTemplateIdentity = (template, existingIds) => {
          if (!existingIds.has(template.id)) return { id: template.id, label: template.label }
          let suffix = 2
          while (existingIds.has(`${template.id}-${suffix}`)) suffix += 1
          return { id: `${template.id}-${suffix}`, label: `${template.label} ${suffix}` }
        }
        const templateMatchesDraft = (template, draft) => {
          let args
          try { args = JSON.parse(draft.args) } catch { return false }
          if (!Array.isArray(args)) return false
          const cmd = draft.command.trim()
          const cmdBase = cmd.split(/[\\/]/u).at(-1)
          const sameCmd = cmd === template.command || (template.bin && cmdBase === template.bin)
          return sameCmd && JSON.stringify(args) === JSON.stringify(template.args)
        }
        const formatTokenCount = n => {
          if (!Number.isFinite(n) || n <= 0) return ''
          if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
          if (n >= 1_000) return `${Math.round(n / 1_000)}K`
          return String(n)
        }
        const authSummary = (status, tt) => {
          if (!status) return ''
          const first = status.accounts?.find(item => item?.active) ?? status.accounts?.[0]
          const identity = first?.email || first?.name || first?.label || ''
          const state = status.state === 'authenticated' || status.state === 'signed_in' ? tt('authSignedIn')
            : status.state === 'unauthenticated' || status.state === 'signed_out' ? tt('authSignedOut')
              : status.state
          return [state, identity].filter(Boolean).join(' · ')
        }

        const formatShortTime = iso => {
          if (!iso) return ''
          const date = new Date(iso)
          if (Number.isNaN(date.getTime())) return ''
          const sameDay = new Date().toDateString() === date.toDateString()
          return new Intl.DateTimeFormat(undefined, sameDay
            ? { hour: '2-digit', minute: '2-digit' }
            : { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
        }

        const formatQuotaWindowLabel = (win, tt) => {
          if (win.windowKind === 'five_hour') return tt('quotaLimit5h')
          if (win.windowKind === 'seven_day') return tt('quotaLimit7d')
          if (win.windowKind === 'model_weekly' && win.modelName) return tt('quotaLimitModel7d', { model: win.modelName })
          if (win.windowKind === 'extra_usage') return tt('quotaLimitExtra')
          if (win.windowKind === 'model_window' && win.modelName) {
            return win.windowMinutes ? `${win.modelName} (${+(win.windowMinutes / 60).toFixed(1)}h)` : win.modelName
          }
          if (win.windowKind === 'duration' && win.windowMinutes) {
            return tt('quotaLimitDuration', { hours: +(win.windowMinutes / 60).toFixed(1) })
          }
          return win.label || win.id
        }

        const formatQuotaReset = (win, tt) => {
          if (win.resetsAt) {
            const formatted = formatShortTime(win.resetsAt)
            if (formatted) return tt('quotaResetsAt', { time: formatted })
          }
          if (win.resetsText) return tt('quotaResetsAt', { time: win.resetsText })
          return ''
        }

        const quotaTone = win => {
          if (win.status === 'rejected' || (typeof win.usedPercent === 'number' && win.usedPercent >= 95)) return 'error'
          if (win.status === 'allowed_warning' || (typeof win.usedPercent === 'number' && win.usedPercent >= 80)) return 'warn'
          return 'accent'
        }

        const effectiveAccount = (provider, authStatus) => {
          const cached = provider?.subscription?.account
          const liveFirst = authStatus?.accounts?.find(item => item?.active) ?? authStatus?.accounts?.[0]
          const liveState = authStatus?.state === 'authenticated' || authStatus?.state === 'signed_in' ? 'authenticated'
            : authStatus?.state === 'unauthenticated' || authStatus?.state === 'signed_out' ? 'unauthenticated'
              : liveFirst ? 'authenticated' : undefined
          const tierName = provider?.advertised?.meta?.tier?.name
          const state = liveState ?? cached?.state ?? (tierName ? 'authenticated' : 'unknown')
          const email = liveFirst?.email ?? cached?.email
          const name = liveFirst?.name ?? cached?.name
          const label = liveFirst?.label ?? cached?.label
          const plan = cached?.plan ?? liveFirst?.subscriptionType ?? tierName
          const authDetail = cached?.authDetail ?? liveFirst?.description ?? liveFirst?.detail
          return { state, email, name, label, plan, authDetail }
        }

        const quotaNoteText = (sub, tt) => {
          if (!sub) return tt('quotaHintUnfetched')
          if (sub.quotaNote === 'signed_out') return tt('quotaNoteSignedOut')
          if (sub.quotaNote === 'cli_not_exposed') return tt('quotaNoteCliNotExposed')
          if (sub.quotaNote === 'acp_not_exposed') return tt('quotaNoteAcpNotExposed')
          if (sub.quotaNote === 'custom_endpoint_or_api') return tt('quotaNoteCustomOrApi')
          return ''
        }

        function SubscriptionCard({ provider, authStatus, localUsage, authMethods, canLogout, busy, refreshing, authBusy, onRefresh, onAuthenticate, onLogout }) {
          const tt = useT()
          const sub = provider?.subscription ?? null
          const account = effectiveAccount(provider, authStatus)
          const windows = sub?.windows ?? EMPTY
          const methods = Array.isArray(authMethods) ? authMethods : EMPTY
          const [selectedMethod, setSelectedMethod] = React.useState(methods[0]?.id ?? '')
          React.useEffect(() => {
            if (!methods.length) setSelectedMethod('')
            else if (!methods.some(item => item.id === selectedMethod)) setSelectedMethod(methods[0].id)
          }, [provider?.id, methods.length])
          const dotState = account.state === 'authenticated' ? 'done' : account.state === 'unauthenticated' ? 'warning' : 'idle'
          const stateLabel = account.state === 'authenticated' ? tt('authSignedIn')
            : account.state === 'unauthenticated' ? tt('authSignedOut')
              : tt('authUnknown')
          const identity = account.email || account.name || account.label || ''
          const updatedLabel = sub?.fetchedAt ? tt('usageUpdatedAt', { time: formatShortTime(sub.fetchedAt) }) : ''
          const noteText = windows.length === 0 ? quotaNoteText(sub, tt) : ''
          const credits = sub?.credits
          const extraUsage = sub?.extraUsage
          const activity = sub?.activity
          const hasLocal = localUsage && (localUsage.total.sessions > 0 || localUsage.total.turns > 0)

          return h('section', { className: 'aw-sub-card', 'aria-label': tt('subHeading') },
            h('div', { className: 'aw-sub-head' },
              h('h3', { className: 'aw-grow' }, tt('subHeading')),
              updatedLabel ? h('span', { className: 'aw-note' }, updatedLabel) : null,
              sub?.dashboardUrl ? h('a', { className: 'aw-url-link', href: sub.dashboardUrl, target: '_blank', rel: 'noopener noreferrer' }, tt('usageOpenDashboard')) : null,
              h(Button, { size: 'sm', variant: 'outline', disabled: busy || authBusy, onClick: onRefresh }, refreshing ? tt('refreshingUsage') : tt('refreshUsage'))),
            h('div', { className: 'aw-sub-account' },
              h(StateDot, { state: dotState, size: 7 }),
              h('span', { className: 'aw-strong' }, stateLabel),
              identity ? h('span', { className: 'aw-note' }, identity) : null,
              account.plan ? h('span', { className: 'aw-pill', 'data-tone': 'accent' }, account.plan) : null,
              account.authDetail && account.authDetail !== identity && account.authDetail !== account.plan
                ? h('span', { className: 'aw-pill' }, account.authDetail) : null,
              sub?.liveRateLimit?.status === 'rejected'
                ? h('span', { className: 'aw-pill', 'data-tone': 'error' }, tt('quotaStatusRejected'))
                : sub?.liveRateLimit?.status === 'allowed_warning'
                  ? h('span', { className: 'aw-pill', 'data-tone': 'fast' }, tt('quotaStatusWarn')) : null),
            (methods.length > 0 || canLogout) ? h('div', { className: 'aw-row' },
              methods.length > 0 && onAuthenticate ? h(React.Fragment, null,
                h('select', {
                  className: 'aw-select',
                  'aria-label': tt('authMethodLabel'),
                  value: selectedMethod || methods[0].id,
                  disabled: busy || authBusy,
                  onChange: event => setSelectedMethod(event.target.value),
                }, methods.map(method => h('option', { key: method.id, value: method.id }, method.name || method.id))),
                h(Button, {
                  size: 'sm',
                  variant: 'ghost',
                  disabled: busy || authBusy || !(selectedMethod || methods[0]?.id),
                  onClick: () => onAuthenticate(selectedMethod || methods[0].id),
                }, authBusy === 'login' ? tt('authSigningIn') : tt('authSignIn'))) : null,
              canLogout && onLogout ? h(Button, {
                size: 'sm',
                variant: 'ghost',
                className: 'aw-danger-text',
                disabled: busy || authBusy,
                onClick: onLogout,
              }, authBusy === 'logout' ? tt('authSigningOut') : tt('authSignOut')) : null) : null,
            windows.length > 0 ? h('div', { className: 'aw-quota-grid' },
              windows.map(win => {
                const pct = typeof win.usedPercent === 'number' ? Math.max(0, Math.min(100, win.usedPercent)) : null
                const tone = quotaTone(win)
                const resetLabel = formatQuotaReset(win, tt)
                const statusBadge = win.status === 'rejected' ? tt('quotaStatusRejected')
                  : win.status === 'allowed_warning' ? tt('quotaStatusWarn') : ''
                return h('div', { key: win.id, className: 'aw-quota-item' },
                  h('div', { className: 'aw-quota-top' },
                    h('span', { className: 'aw-quota-label' }, formatQuotaWindowLabel(win, tt)),
                    pct !== null ? h('span', { className: 'aw-quota-pct', 'data-tone': tone }, `${pct}%`) : null),
                  pct !== null ? h('div', { className: 'aw-quota-track', role: 'progressbar', 'aria-label': formatQuotaWindowLabel(win, tt), 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 },
                    h('span', { className: 'aw-quota-fill', 'data-tone': tone, style: { width: `${pct}%` } })) : null,
                  (resetLabel || statusBadge) ? h('div', { className: 'aw-quota-meta' },
                    h('span', null, resetLabel),
                    statusBadge ? h('span', { className: 'aw-pill', 'data-tone': tone === 'error' ? 'error' : 'fast' }, statusBadge) : null) : null)
              })) : null,
            (extraUsage?.enabled || credits?.unlimited || credits?.hasCredits || credits?.resetCreditsAvailable) ? h('div', { className: 'aw-pills' },
              extraUsage?.enabled ? h('span', { className: 'aw-pill', 'data-tone': extraUsage.active ? 'fast' : undefined }, extraUsage.active ? tt('quotaExtraActive') : tt('quotaExtraEnabled')) : null,
              credits?.unlimited ? h('span', { className: 'aw-pill', 'data-tone': 'accent' }, tt('quotaCreditsUnlimited')) : null,
              credits?.hasCredits && credits.balance ? h('span', { className: 'aw-pill' }, tt('quotaCreditsBalance', { balance: credits.balance })) : null,
              credits?.resetCreditsAvailable ? h('span', { className: 'aw-pill' }, tt('quotaResetCredits', { n: credits.resetCreditsAvailable })) : null) : null,
            noteText ? h('p', { className: 'aw-note' }, noteText) : null,
            (hasLocal || activity?.day || activity?.week) ? h('div', { className: 'aw-sub-stats' },
              hasLocal ? h(React.Fragment, null,
                h('strong', null, tt('localUsageLabel')),
                h('span', null, tt('localUsage24h', localUsage.last24h)),
                h('span', null, tt('localUsage7d', localUsage.last7d)),
                h('span', null, tt('localUsageTotal', localUsage.total))) : null,
              (activity?.day || activity?.week) ? h(React.Fragment, null,
                h('strong', null, tt('cliActivityLabel')),
                activity.day ? h('span', null, tt('cliActivityPeriod', { period: '24h', ...activity.day })) : null,
                activity.week ? h('span', null, tt('cliActivityPeriod', { period: '7d', ...activity.week })) : null) : null) : null)
        }

        const capabilityTags = info => {
          const agent = info.agentCapabilities ?? {}
          const sess = agent.sessionCapabilities ?? {}
          return [
            ['cap.loadSession', agent.loadSession],
            ['cap.resume', sess.resume],
            ['cap.fork', sess.fork],
            ['cap.close', sess.close],
            ['cap.options', sess.options],
            ['cap.list', sess.list],
            ['cap.additionalDirs', sess.additionalDirectories],
            ['cap.steering', info._meta?.steering?.supported],
            ['cap.authLogout', agent.auth?.logout],
            ['cap.systemPromptAppend', agent._meta?.antigravity?.systemPrompt?.append],
            ['cap.image', agent.promptCapabilities?.image],
            ['cap.audio', agent.promptCapabilities?.audio],
            ['cap.embeddedContext', agent.promptCapabilities?.embeddedContext],
            ['cap.mcpHttp', agent.mcpCapabilities?.http],
            ['cap.mcpSse', agent.mcpCapabilities?.sse],
          ].map(([key, value]) => ({ key, status: value == null ? 'unreported' : value === false ? 'unsupported' : 'supported' }))
        }

        const formatLatencyMs = ms => {
          if (!Number.isFinite(ms) || ms < 0) return ''
          if (ms < 1) return '<1 ms'
          if (ms < 1000) return `${Math.round(ms)} ms`
          return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)} s`
        }
        const engineFamilyOf = provider => {
          const id = (provider?.id ?? '').toLowerCase()
          const cmd = (provider?.command ?? '').split(/[\\/]/u).at(-1)?.toLowerCase() ?? ''
          const label = (provider?.label ?? '').toLowerCase()
          if (id.includes('antigravity') || cmd === 'agy' || label.includes('antigravity')) return 'antigravity'
          if (id.includes('claude') || cmd.includes('claude') || label.includes('claude')) return 'claude-code'
          if (id.includes('cursor') || cmd === 'cursor-agent' || cmd === 'agent' || label.includes('cursor')) return 'cursor'
          if (id.includes('codex') || cmd.includes('codex') || label.includes('codex')) return 'codex'
          if (id.includes('hermes') || cmd === 'hermes' || label.includes('hermes')) return 'hermes'
          if (id.includes('gemini') || cmd === 'gemini' || label.includes('gemini')) return 'gemini'
          if (id.includes('opencode') || cmd === 'opencode' || label.includes('opencode')) return 'opencode'
          if (id.includes('copilot') || cmd === 'copilot' || label.includes('copilot')) return 'copilot'
          return 'generic'
        }
        function EngineGlyph({ family, size = 13 }) {
          const svgProps = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
          if (family === 'cursor') return h('svg', svgProps, h('path', { d: 'M3.5 2.5 12.5 8l-4 1.2L7.3 13.5 3.5 2.5Z' }))
          if (family === 'antigravity') return h('svg', svgProps, h('path', { d: 'M8 2.2 13 13H9.8L8 9.2 6.2 13H3L8 2.2Z' }))
          if (family === 'claude-code') return h('svg', svgProps, h('path', { d: 'M8 2v12M2 8h12M3.8 3.8l8.4 8.4M12.2 3.8l-8.4 8.4' }))
          if (family === 'codex') return h('svg', svgProps, h('circle', { cx: 8, cy: 8, r: 5.5 }), h('path', { d: 'M6 6.2 8.2 8 6 9.8M9 9.8h1.8' }))
          if (family === 'hermes') return h('svg', svgProps, h('path', { d: 'M2.5 10.5c2.2-4.8 6.4-6.5 11-7-1.6 3.8-4.2 6.2-8.2 7.2M4 12.5h8' }))
          if (family === 'gemini') return h('svg', svgProps, h('path', { d: 'M8 2c.7 3.2 2.8 5.3 6 6-3.2.7-5.3 2.8-6 6-.7-3.2-2.8-5.3-6-6 3.2-.7 5.3-2.8 6-6Z' }))
          if (family === 'copilot') return h('svg', svgProps, h('rect', { x: 2.5, y: 4.5, width: 11, height: 7.5, rx: 3 }), h('path', { d: 'M6 8.2h.01M10 8.2h.01' }))
          return h('svg', svgProps, h('rect', { x: 2, y: 3, width: 12, height: 10, rx: 2 }), h('path', { d: 'm5 6.5 2 1.5-2 1.5M8.5 9.5H11' }))
        }
        const engineReadiness = (provider, active, probe, tt) => {
          if (active?.waiting > 0) return { dotState: 'warning', label: tt('activeWaiting', { n: active.waiting }), tone: 'warn' }
          if (active?.working > 0) return { dotState: 'ongoing', label: tt('activeWorking', { n: active.working }), tone: 'active' }
          if (active?.connected > 0) return { dotState: 'done', label: tt('engineConnected', { n: active.connected }), tone: 'ok' }
          if (probe?.status === 'error') return { dotState: 'error', label: tt('engineError'), tone: 'error' }
          if (probe?.status === 'ready') return { dotState: 'done', label: tt('engineReady'), tone: 'ok' }
          if (provider?.advertised?.models?.length > 0) return { dotState: 'idle', label: tt('engineConfigured'), tone: 'muted' }
          return { dotState: 'idle', label: tt('engineUnchecked'), tone: 'muted' }
        }
        function EngineStatusRow({ provider, active, probe, showId = false }) {
          const tt = useT()
          const family = engineFamilyOf(provider)
          const readiness = engineReadiness(provider, active, probe, tt)
          const latencyText = probe?.status === 'ready' && Number.isFinite(probe.latencyMs) ? formatLatencyMs(probe.latencyMs) : ''
          return h('span', { className: 'aw-engine-row', 'data-engine': family, 'data-engine-status': readiness.tone },
            h('span', { className: 'aw-engine-rail' }, h(StateDot, { state: readiness.dotState, size: 7 })),
            h('span', { className: 'aw-engine-badge', 'data-engine': family, title: provider.id }, h(EngineGlyph, { family, size: 13 })),
            h('span', { className: 'aw-engine-main' },
              h('span', { className: 'aw-strong aw-ellipsis' }, provider.label),
              showId ? h(Tag, { tone: 'quiet' }, provider.id) : null,
              h('span', { className: 'aw-engine-sep', 'aria-hidden': true }, '·'),
              h('span', { className: 'aw-engine-state', 'data-tone': readiness.tone, title: probe?.error || undefined }, readiness.label)),
            latencyText ? h('span', { className: 'aw-engine-latency', title: tt('probeLatency') }, latencyText) : null)
        }

        function CapabilityReport({ info, onClose }) {
          const tt = useT()
          const agentInfo = info.agentInfo ?? info.serverInfo
          const authText = authSummary(info.authStatus, tt)
          const latencyText = Number.isFinite(info.latencyMs) ? formatLatencyMs(info.latencyMs) : ''
          return h('section', { className: 'aw-box', 'aria-label': tt('capabilities') },
            h('div', { className: 'aw-box-head' },
              h('h3', { className: 'aw-grow' }, tt('capabilities')),
              onClose ? h(Button, { size: 'sm', variant: 'ghost', onClick: onClose }, tt('closeDiag')) : null),
            h('dl', { className: 'aw-facts' },
              agentInfo ? h(React.Fragment, null, h('dt', null, tt('agent')), h('dd', null, [agentInfo.title ?? agentInfo.name, agentInfo.version].filter(Boolean).join(' '))) : null,
              h('dt', null, tt('protocol')), h('dd', null, `ACP v${info.protocolVersion ?? '?'}`),
              latencyText ? h(React.Fragment, null, h('dt', null, tt('probeLatency')), h('dd', null, latencyText)) : null,
              info.agentMeta?.tier?.name ? h(React.Fragment, null, h('dt', null, tt('tierLabel')), h('dd', null, info.agentMeta.tier.name)) : null,
              authText ? h(React.Fragment, null, h('dt', null, tt('authLabel')), h('dd', null, authText)) : null,
              h('dt', null, tt('authMethods')), h('dd', null, info.authMethods?.length ? info.authMethods.map(method => method.name ?? method.id).join(', ') : tt('none'))),
            h('div', { className: 'aw-tags', 'aria-label': tt('capabilities') }, capabilityTags(info).map(item => h(Tag, { key: item.key, tone: item.status === 'supported' ? 'success' : 'quiet' }, `${tt(item.key)} · ${tt(item.status)}`))),
            h(Json, { label: tt('rawResult'), payload: info }))
        }

        function ProviderForm({ saved, draft, templates, existingIds, busy, notice, probeCwd, defaultCwd, onApplyTemplate, onResetBlank, onChange, onPolicyChange, onProbeCwd, onSave, onRemove, onCancel }) {
          const tt = useT()
          const isBlank = !draft.id && !draft.label && !draft.command && draft.args === '["acp"]'
          const policy = normalizePolicyDraft(draft.contextPolicy)
          return h('form', { className: 'aw-box', onSubmit: onSave },
            h('div', { className: 'aw-box-head' },
              h('h3', { className: 'aw-grow' }, saved ? tt('editProvider') : tt('newProviderTitle')),
              onCancel ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: onCancel }, tt(saved ? 'hideConfig' : 'cancelNew')) : null),
            h('p', { className: 'aw-note' }, tt('providerHint'), ' ', tt('warning')),
            templates?.length ? h('div', { className: 'aw-templates' },
              h('div', { className: 'aw-templates-head' },
                h('span', { className: 'aw-templates-title' }, tt('providerTemplates')),
                h('span', { className: 'aw-note aw-grow' }, tt(saved ? 'providerTemplatesEditHint' : 'providerTemplatesHint')),
                !saved ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy || isBlank, onClick: onResetBlank }, tt('templateBlank')) : null),
              h('div', { className: 'aw-template-grid', role: 'group', 'aria-label': tt('providerTemplates') },
                templates.map(template => {
                  const active = templateMatchesDraft(template, draft)
                  const added = !saved && existingIds?.has(template.id)
                  const preview = [template.bin || template.command, ...template.args].join(' ')
                  const fullCmd = [template.command, ...template.args].join(' ')
                  return h('button', {
                    key: template.id, type: 'button', className: 'aw-template',
                    'aria-pressed': active, disabled: busy, title: fullCmd,
                    onClick: () => onApplyTemplate(template),
                  },
                  h('span', { className: 'aw-template-top' },
                    h('span', { className: 'aw-strong aw-ellipsis aw-grow' }, template.label),
                    added ? h(Tag, { tone: 'quiet' }, tt('templateAdded')) : null),
                  h('span', { className: 'aw-template-cmd aw-mono aw-ellipsis' }, preview))
                }))) : null,
            h('div', { className: 'aw-form' },
              h('label', { className: 'aw-field' }, h('span', null, tt('fieldLabel')), h(Input, { className: 'aw-input', value: draft.label, required: true, onChange: onChange('label') })),
              h('label', { className: 'aw-field' }, h('span', null, tt('fieldId')), h(Input, { className: 'aw-input aw-mono', value: draft.id, required: true, pattern: '[a-z][a-z0-9-]*', disabled: !!saved, onChange: onChange('id') })),
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldCommand')), h(Input, { className: 'aw-input aw-mono', value: draft.command, required: true, onChange: onChange('command') }),
                h('span', { className: 'aw-note' }, tt('fieldCommandHint'))),
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldArgs')), h('textarea', { className: 'aw-textarea', value: draft.args, rows: 2, required: true, spellCheck: false, onChange: onChange('args') }),
                h('span', { className: 'aw-note' }, tt('fieldArgsHint'))),
              saved ? h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('probeDirLabel')),
                h(Input, { className: 'aw-input aw-mono', value: probeCwd, disabled: busy, placeholder: defaultCwd || tt('cwdPlaceholder'), onChange: event => onProbeCwd(event.target.value) }),
                h('span', { className: 'aw-note' }, tt('probeDirHint'))) : null,
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldExtraDirs')),
                h('textarea', { className: 'aw-textarea aw-mono', value: draft.additionalDirectoriesText ?? '', rows: 2, spellCheck: false, placeholder: tt('fieldExtraDirsPlaceholder'), disabled: busy, onChange: onChange('additionalDirectoriesText') }),
                h('span', { className: 'aw-note' }, tt('fieldExtraDirsHint'))),
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldExcludedMcp')),
                h(Input, { className: 'aw-input aw-mono', value: draft.excludedMcpServersText ?? '', spellCheck: false, placeholder: tt('fieldExcludedMcpPlaceholder'), disabled: busy, onChange: onChange('excludedMcpServersText') }),
                h('span', { className: 'aw-note' }, tt('fieldExcludedMcpHint'))),
              h('label', { className: 'aw-field aw-wide' }, h('span', null, tt('fieldSystemAppend')),
                h('textarea', { className: 'aw-textarea', value: draft.systemPromptAppend ?? '', rows: 2, placeholder: tt('fieldSystemAppendPlaceholder'), disabled: busy, onChange: onChange('systemPromptAppend') }),
                h('span', { className: 'aw-note' }, tt('fieldSystemAppendHint')))),
            onPolicyChange ? h('div', { className: 'aw-ctx-scope' },
              h('strong', null, tt('ctxScopeTitle')),
              h('p', { className: 'aw-note' }, tt('ctxScopeOwned')),
              h('div', { className: 'aw-ctx-switches' },
                h('div', { className: 'aw-ctx-switch-row' },
                  h('span', null, tt('ctxPolicyAgentInstructions')),
                  h(Switch, { checked: policy.agentInstructions, disabled: busy, label: tt('ctxPolicyAgentInstructions'), onChange: checked => onPolicyChange('agentInstructions', checked) })),
                h('div', { className: 'aw-ctx-switch-row' },
                  h('span', null, tt('ctxPolicyTimeContext')),
                  h(Switch, { checked: policy.timeContext, disabled: busy, label: tt('ctxPolicyTimeContext'), onChange: checked => onPolicyChange('timeContext', checked) })),
                h('div', { className: 'aw-ctx-switch-row' },
                  h('span', null, tt('ctxPolicyNowledge')),
                  h(Switch, { checked: policy.nowledgeContext, disabled: busy, label: tt('ctxPolicyNowledge'), onChange: checked => onPolicyChange('nowledgeContext', checked) })),
                h('div', { className: 'aw-ctx-switch-row' },
                  h('span', null, tt('ctxPolicySystemPromptAppend')),
                  h(Switch, { checked: policy.systemPromptAppend, disabled: busy, label: tt('ctxPolicySystemPromptAppend'), onChange: checked => onPolicyChange('systemPromptAppend', checked) })))) : null,
            h('div', { className: 'aw-row' },
              h(Button, { type: 'submit', size: 'sm', variant: 'primary', disabled: busy }, tt('save')),
              saved ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', className: 'aw-danger-text', disabled: busy, onClick: onRemove }, tt('remove')) : null,
              notice ? h('span', { className: notice === tt('saved') ? 'aw-note' : 'aw-error', role: notice === tt('saved') ? 'status' : 'alert' }, notice) : null))
        }

        function ModelRow({ model, hidden, busy, onToggle }) {
          const tt = useT()
          const contextOpt = model.options?.find(opt => opt.id === 'context' && opt.choices?.length)
          const fastOpt = model.options?.find(opt => opt.id === 'fast')
          const ultracodeOpt = model.options?.find(opt => opt.id === 'ultracode')
          const extraOpts = (model.options ?? EMPTY).filter(opt => opt.id !== 'context' && opt.id !== 'fast' && opt.id !== 'ultracode')
          const hasImage = model.inputModalities?.includes('image')
          const contextLabel = contextOpt
            ? contextOpt.choices.map(c => c.name ?? c.value).join(' / ')
            : model.contextWindow ? formatTokenCount(model.contextWindow) : ''
          const outputLabel = model.maxTokens ? formatTokenCount(model.maxTokens) : ''
          const efforts = model.reasoning?.efforts ?? EMPTY
          return h('div', { className: 'aw-model-row', 'data-hidden': hidden },
            h('div', { className: 'aw-model-body' },
              h('div', { className: 'aw-model-head' },
                h('span', { className: 'aw-model-name' }, model.name ?? model.id),
                model.name && model.name !== model.id ? h('span', { className: 'aw-model-id aw-mono' }, model.id) : null),
              model.description ? h('span', { className: 'aw-model-desc' }, model.description) : null,
              efforts.length || contextLabel || fastOpt || ultracodeOpt || extraOpts.length || hasImage || outputLabel ? h('div', { className: 'aw-pills' },
                efforts.length ? h('span', { className: 'aw-pill', 'data-tone': 'thought' }, tt('modelEfforts', { levels: efforts.map(e => e.name ?? e.id).join(' · ') })) : null,
                contextLabel ? h('span', { className: 'aw-pill' }, `${tt('context')}: ${contextLabel}`) : null,
                fastOpt ? h('span', { className: 'aw-pill', 'data-tone': 'fast', title: fastOpt.description || undefined }, `⚡ ${tt('modelFast')}`) : null,
                ultracodeOpt ? h('span', { className: 'aw-pill', 'data-tone': 'accent', title: ultracodeOpt.description || undefined }, tt('modelUltracode')) : null,
                extraOpts.map(opt => h('span', { key: opt.id, className: 'aw-pill', title: opt.description || undefined }, opt.name ?? opt.id)),
                hasImage ? h('span', { className: 'aw-pill' }, tt('modalityImage')) : null,
                outputLabel ? h('span', { className: 'aw-pill' }, `${tt('ctxOutput')}: ${outputLabel}`) : null) : null),
            h(Switch, { checked: !hidden, disabled: busy, label: model.name ?? model.id, onChange: checked => onToggle(model.id, checked) }))
        }

        function ProviderWorkbench({ providers, providerTemplates, activeByProvider, authByProvider, probeByProvider, localUsageByProvider, defaultCwd, run, busy, creating, setCreating }) {
          const tt = useT()
          const templates = providerTemplates?.length ? providerTemplates : FALLBACK_PROVIDER_TEMPLATES
          const existingIds = React.useMemo(() => new Set(providers.map(provider => provider.id)), [providers])
          const [editing, setEditing] = React.useState(providers[0]?.id ?? '')
          const [draft, setDraft] = React.useState(() => providerToDraft(providers[0]))
          const [showConfig, setShowConfig] = React.useState(false)
          const [usageRefreshing, setUsageRefreshing] = React.useState(false)
          const [authBusy, setAuthBusy] = React.useState('')
          const [notice, setNotice] = React.useState('')
          const [statusBanner, setStatusBanner] = React.useState('')
          const [probeCwd, setProbeCwd] = React.useState('')
          const [report, setReport] = React.useState(null)
          const [hiddenModels, setHiddenModels] = React.useState(() => providers[0]?.hiddenModels ?? [])
          const [modelQuery, setModelQuery] = React.useState('')
          const [modelFilter, setModelFilter] = React.useState('all')
          const saved = creating ? null : providers.find(provider => provider.id === editing) ?? providers[0] ?? null
          const activeWorkspacePath = ctx.workspaces?.list?.getSnapshot?.().items?.[0]?.path || ''
          const effectiveCwd = probeCwd.trim() || activeWorkspacePath || defaultCwd || ''

          const selectProvider = provider => {
            setCreating(false)
            setEditing(provider?.id ?? '')
            setDraft(providerToDraft(provider))
            setShowConfig(false)
            setNotice(''); setStatusBanner(''); setReport(null)
            setHiddenModels(provider?.hiddenModels ?? [])
            setModelQuery(''); setModelFilter('all')
          }

          React.useEffect(() => {
            if (creating) {
              setDraft(blankProvider()); setNotice(''); setStatusBanner(''); setReport(null)
            } else if (!editing && providers[0]) {
              selectProvider(providers[0])
            }
          }, [creating, providers.length])

          const allModels = React.useMemo(() => providerVisibleModels(saved ? { ...saved, hiddenModels: [] } : null), [saved])
          const hiddenSet = React.useMemo(() => new Set(hiddenModels), [hiddenModels])
          const savedHidden = saved?.hiddenModels ?? EMPTY
          const visibleCount = allModels.filter(model => !hiddenSet.has(model.id)).length
          const hiddenCount = allModels.length - visibleCount
          const thinkingCount = allModels.filter(model => !!model.reasoning?.efforts?.length).length
          const fastCount = allModels.filter(model => model.options?.some(opt => opt.id === 'fast')).length
          const ultracodeCount = allModels.filter(model => model.options?.some(opt => opt.id === 'ultracode')).length
          const multiCtxCount = allModels.filter(model => model.options?.some(opt => opt.id === 'context' && opt.choices?.length > 1)).length

          const changedCount = React.useMemo(() => {
            const savedSet = new Set(savedHidden)
            let diff = 0
            for (const model of allModels) {
              if (hiddenSet.has(model.id) !== savedSet.has(model.id)) diff += 1
            }
            return diff
          }, [allModels, hiddenSet, savedHidden])
          const isDirty = !!saved && changedCount > 0

          const needle = modelQuery.trim().toLowerCase()
          const filteredModels = allModels.filter(model => {
            if (modelFilter === 'visible' && hiddenSet.has(model.id)) return false
            if (modelFilter === 'hidden' && !hiddenSet.has(model.id)) return false
            if (modelFilter === 'thinking' && !model.reasoning?.efforts?.length) return false
            if (modelFilter === 'fast' && !model.options?.some(opt => opt.id === 'fast')) return false
            if (modelFilter === 'ultracode' && !model.options?.some(opt => opt.id === 'ultracode')) return false
            if (modelFilter === 'multictx' && !model.options?.some(opt => opt.id === 'context' && opt.choices?.length > 1)) return false
            if (!needle) return true
            return [model.id, model.name, model.description].some(text => text?.toLowerCase().includes(needle))
          })

          const changeField = key => event => { setDraft(old => ({ ...old, [key]: event.target.value })); setNotice('') }
          const changePolicy = (key, checked) => {
            setDraft(old => ({ ...old, contextPolicy: { ...normalizePolicyDraft(old.contextPolicy), [key]: checked } }))
            setNotice('')
          }
          const applyTemplate = template => {
            if (saved) {
              setDraft(old => ({ ...old, command: template.command, args: JSON.stringify(template.args) }))
            } else {
              const { id, label } = nextTemplateIdentity(template, existingIds)
              setDraft({ ...blankProvider(), id, label, command: template.command, args: JSON.stringify(template.args) })
            }
            setNotice('')
          }
          const resetBlank = () => { setDraft(blankProvider()); setNotice('') }
          const saveProvider = async event => {
            event.preventDefault()
            let args
            try { args = JSON.parse(draft.args) } catch { args = null }
            if (!Array.isArray(args) || args.some(item => typeof item !== 'string')) { setNotice(tt('argsInvalid')); return }
            const extraDirs = String(draft.additionalDirectoriesText ?? '')
              .split(/\r?\n/u)
              .map(line => line.trim())
              .filter(Boolean)
            if (extraDirs.some(dir => !/^(\/|[a-zA-Z]:[\\/])/u.test(dir))) {
              setNotice(tt('extraDirsInvalid'))
              return
            }
            const excludedMcp = String(draft.excludedMcpServersText ?? '')
              .split(/[\r\n,\s]+/u)
              .map(item => item.trim())
              .filter(Boolean)
            if (excludedMcp.some(name => !/^[A-Za-z0-9_-]{1,64}$/u.test(name))) {
              setNotice(tt('excludedMcpInvalid'))
              return
            }
            const value = await run({
              action: 'provider-save',
              provider: {
                id: draft.id.trim(),
                label: draft.label,
                command: draft.command,
                args,
                models: saved?.models ?? [],
                hiddenModels: saved?.hiddenModels ?? [],
                contextPolicy: normalizePolicyDraft(draft.contextPolicy),
                additionalDirectories: extraDirs,
                excludedMcpServers: excludedMcp,
                systemPromptAppend: String(draft.systemPromptAppend ?? '').trim(),
              },
            })
            if (value) {
              setCreating(false)
              setEditing(value.id)
              setDraft(providerToDraft(value))
              setHiddenModels(value.hiddenModels ?? [])
              setNotice(tt('saved'))
              setStatusBanner(tt('saved'))
            }
          }
          const removeProvider = async () => {
            if (!saved || !await askConfirm(tt('removeConfirm'), { title: tt('remove'), confirmLabel: tt('remove'), danger: true })) return
            if (await run({ action: 'provider-remove', providerId: saved.id })) {
              selectProvider(providers.find(provider => provider.id !== saved.id) ?? null)
            }
          }
          const refreshModels = async () => {
            if (!saved) return
            setStatusBanner('')
            const value = await run({ action: 'models', providerId: saved.id, cwd: effectiveCwd })
            if (value) setStatusBanner(tt('modelsLoaded', { n: value.models.length }))
          }
          const checkCapabilities = async () => {
            if (!saved) return
            const value = await run({ action: 'diagnose', providerId: saved.id, cwd: effectiveCwd })
            if (value) setReport(value)
          }
          const refreshUsage = async () => {
            if (!saved) return
            setStatusBanner('')
            setUsageRefreshing(true)
            try {
              const value = await run({ action: 'usage', providerId: saved.id, cwd: effectiveCwd })
              if (value) setStatusBanner(tt('usageUpdated'))
            } finally {
              setUsageRefreshing(false)
            }
          }
          const authenticateProvider = async methodId => {
            if (!saved || !methodId) return
            setStatusBanner('')
            setAuthBusy('login')
            try {
              const value = await run({ action: 'auth-login', providerId: saved.id, methodId, cwd: effectiveCwd })
              if (value) setStatusBanner(tt('authSignedInDone', { method: methodId }))
            } finally {
              setAuthBusy('')
            }
          }
          const logoutProvider = async () => {
            if (!saved) return
            if (!await askConfirm(tt('authSignOutConfirm', { label: saved.label }), { title: tt('authSignOut'), confirmLabel: tt('authSignOut'), danger: true })) return
            setStatusBanner('')
            setAuthBusy('logout')
            try {
              const value = await run({ action: 'auth-logout', providerId: saved.id, cwd: effectiveCwd })
              if (value) setStatusBanner(tt('authSignedOutDone', { label: saved.label }))
            } finally {
              setAuthBusy('')
            }
          }
          const saveVisibility = async () => {
            if (!saved) return
            const value = await run({ action: 'provider-save', provider: { ...saved, hiddenModels } })
            if (value) {
              setHiddenModels(value.hiddenModels ?? [])
              setStatusBanner(tt('modelsSaved'))
            }
          }
          const toggleModel = (id, shown) => {
            setHiddenModels(old => shown ? old.filter(item => item !== id) : [...new Set([...old, id])])
          }
          const modes = saved?.advertised?.modes?.options ?? EMPTY
          const accountInfo = saved ? effectiveAccount(saved, authByProvider?.[saved.id]) : null
          const tierName = accountInfo?.plan || saved?.advertised?.meta?.tier?.name || ''
          const authText = authSummary(saved ? authByProvider?.[saved.id] : null, tt)

          const filterChips = [
            ['all', tt('filterAll'), allModels.length],
            ['visible', tt('filterVisible'), visibleCount],
            ['hidden', tt('filterHidden'), hiddenCount],
            ...(thinkingCount ? [['thinking', tt('filterThinking'), thinkingCount]] : []),
            ...(fastCount ? [['fast', tt('filterFast'), fastCount]] : []),
            ...(ultracodeCount ? [['ultracode', tt('filterUltracode'), ultracodeCount]] : []),
            ...(multiCtxCount ? [['multictx', tt('filterMultiCtx'), multiCtxCount]] : []),
          ]

          return h('div', { className: 'aw-hub' },
            h('nav', { className: 'aw-rail', 'aria-label': tt('providerList') },
              providers.map(provider => {
                const total = providerVisibleModels({ ...provider, hiddenModels: [] }).length
                const shown = providerVisibleModels(provider).length
                const active = activeByProvider?.[provider.id]
                const probe = probeByProvider?.[provider.id]
                const railPlan = provider.subscription?.account?.plan || provider.advertised?.meta?.tier?.name || ''
                const railWindows = provider.subscription?.windows ?? EMPTY
                const peakPct = railWindows.reduce((max, item) => typeof item.usedPercent === 'number' ? Math.max(max, item.usedPercent) : max, -1)
                return h('button', {
                  key: provider.id, type: 'button', className: 'aw-prov',
                  'aria-current': !creating && saved?.id === provider.id,
                  disabled: busy,
                  onClick: () => selectProvider(provider),
                },
                h(EngineStatusRow, { provider, active, probe }),
                h('span', { className: 'aw-prov-sub' },
                  h('span', null, total ? tt('modelsBadgeCount', { shown, total }) : tt('modelsNotFetched')),
                  railPlan ? h('span', null, `· ${railPlan}`) : null,
                  peakPct >= 0 ? h('span', null, `· ${peakPct}%`) : null),
                h('span', { className: 'aw-prov-sub aw-mono aw-ellipsis' }, [provider.command, ...provider.args].join(' ')))
              })),
            h('div', { className: 'aw-stack' },
              creating || !saved
                ? h(ProviderForm, {
                  saved: null, draft, templates, existingIds, busy, notice, probeCwd, defaultCwd: activeWorkspacePath || defaultCwd,
                  onApplyTemplate: applyTemplate, onResetBlank: resetBlank,
                  onChange: changeField, onPolicyChange: changePolicy, onProbeCwd: setProbeCwd, onSave: saveProvider,
                  onCancel: providers.length ? () => selectProvider(providers.find(p => p.id === editing) ?? providers[0]) : null,
                })
                : h(React.Fragment, null,
                  h('section', { className: 'aw-hero' },
                    h('div', { className: 'aw-hero-top' },
                      h('div', { className: 'aw-hero-title' },
                        h('h2', null, saved.label),
                        h('span', { className: 'aw-hero-cmd aw-mono aw-ellipsis' }, [saved.command, ...saved.args].join(' '))),
                      h('div', { className: 'aw-hero-actions' },
                        h(Button, { size: 'sm', variant: 'outline', disabled: busy, onClick: refreshModels }, tt('refreshModels')),
                        h(Button, { size: 'sm', variant: 'ghost', disabled: busy, onClick: checkCapabilities }, tt('diagnose')),
                        h(Button, { size: 'sm', variant: showConfig ? 'outline' : 'ghost', 'aria-expanded': showConfig, disabled: busy, onClick: () => setShowConfig(v => !v) }, tt(showConfig ? 'hideConfig' : 'providerConfig')))),
                    h('div', { className: 'aw-hero-status' },
                      h(EngineStatusRow, { provider: saved, active: activeByProvider?.[saved.id], probe: probeByProvider?.[saved.id], showId: true })),
                    (tierName || authText || saved.advertised?.meta?.steering) ? h('div', { className: 'aw-pills' },
                      tierName ? h('span', { className: 'aw-pill', 'data-tone': 'accent' }, tierName) : null,
                      authText ? h('span', { className: 'aw-pill' }, `${tt('authLabel')}: ${authText}`) : null,
                      saved.advertised?.meta?.steering ? h('span', { className: 'aw-pill' }, tt('cap.steering')) : null) : null,
                    modes.length ? h('div', { className: 'aw-pills' },
                      h('span', { className: 'aw-note' }, `${tt('modesLabel')}:`),
                      modes.map(mode => h('span', { key: mode.value, className: 'aw-pill' }, mode.name ?? mode.value))) : null,
                    statusBanner ? h('p', { className: 'aw-note', role: 'status' }, statusBanner) : null),
                  h(SubscriptionCard, {
                    provider: saved,
                    authStatus: authByProvider?.[saved.id] ?? null,
                    localUsage: localUsageByProvider?.[saved.id] ?? null,
                    authMethods: report?.authMethods ?? saved.advertised?.meta?.authMethods ?? EMPTY,
                    canLogout: Boolean(report?.agentCapabilities?.auth?.logout ?? saved.advertised?.meta?.authLogout),
                    busy,
                    refreshing: usageRefreshing,
                    authBusy,
                    onRefresh: refreshUsage,
                    onAuthenticate: authenticateProvider,
                    onLogout: logoutProvider,
                  }),
                  showConfig ? h(ProviderForm, {
                    saved, draft, templates, existingIds, busy, notice, probeCwd, defaultCwd: activeWorkspacePath || defaultCwd,
                    onApplyTemplate: applyTemplate, onResetBlank: resetBlank,
                    onChange: changeField, onPolicyChange: changePolicy, onProbeCwd: setProbeCwd, onSave: saveProvider, onRemove: removeProvider,
                    onCancel: () => setShowConfig(false),
                  }) : null,
                  report ? h(CapabilityReport, { info: report, onClose: () => setReport(null) }) : null,
                  h('section', { className: 'aw-stack', 'aria-label': tt('visibleModels') },
                    h('div', { className: 'aw-catalog-head' },
                      h('div', { className: 'aw-row' },
                        h('strong', { className: 'aw-grow' }, tt('visibleModels')),
                        allModels.length ? h('span', { className: 'aw-note' }, tt('modelCountShown', { shown: visibleCount, total: allModels.length })) : null,
                        allModels.length ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy || !hiddenCount, onClick: () => setHiddenModels([]) }, tt('showAllModels')) : null,
                        allModels.length ? h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy || !visibleCount, onClick: () => setHiddenModels(allModels.map(m => m.id)) }, tt('hideAllModels')) : null),
                      allModels.length ? h('div', { className: 'aw-catalog-bar' },
                        h(Input, { type: 'search', className: 'aw-input', value: modelQuery, placeholder: tt('modelSearch'), 'aria-label': tt('modelSearch'), onChange: event => setModelQuery(event.target.value) }),
                        h('div', { className: 'aw-chips', role: 'group', 'aria-label': tt('visibleModels') },
                          filterChips.map(([key, label, count]) => h('button', {
                            key, type: 'button', className: 'aw-chip', 'aria-pressed': modelFilter === key,
                            onClick: () => setModelFilter(key),
                          }, label, h('span', { className: 'aw-muted' }, String(count)))))) : null,
                      isDirty ? h('div', { className: 'aw-dirty', role: 'status' },
                        h('span', { className: 'aw-grow' }, tt('unsavedChanges', { n: changedCount })),
                        h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: () => setHiddenModels(savedHidden) }, tt('revertChanges')),
                        h(Button, { type: 'button', size: 'sm', variant: 'primary', disabled: busy, onClick: saveVisibility }, tt('saveChanges'))) : null),
                    !allModels.length
                      ? h('div', { className: 'aw-empty-card' },
                        h('p', null, tt('noModelsYet')),
                        h('p', { className: 'aw-note' }, tt('modelsHint')),
                        h(Button, { size: 'sm', variant: 'primary', disabled: busy, onClick: refreshModels }, tt('fetchModelsNow')))
                      : !filteredModels.length
                        ? h('div', { className: 'aw-empty-card' },
                          h('p', null, tt('noMatchingModels')),
                          h(Button, { size: 'sm', variant: 'ghost', onClick: () => { setModelQuery(''); setModelFilter('all') } }, tt('resetFilters')))
                        : h('div', { className: 'aw-catalog' },
                          filteredModels.map(model => h(ModelRow, {
                            key: model.id, model, hidden: hiddenSet.has(model.id), busy, onToggle: toggleModel,
                          })))),
                  h('p', { className: 'aw-note' }, tt('loginHint')))))
        }

        function Page() {
          const tt = useT()
          const online = useOnline()
          const [busy, setBusy] = React.useState(false)
          const [creating, setCreating] = React.useState(false)
          const inFlight = React.useRef(false)
          const [error, setError] = React.useState('')
          const view = useWorkbench()
          const run = async op => {
            if (inFlight.current) return null
            inFlight.current = true
            setBusy(true); setError('')
            try { const result = await api(op); view.refresh(); return result }
            catch (failure) { setError(failure.message); return null }
            finally { inFlight.current = false; setBusy(false) }
          }
          const problem = error || view.error
          return h('div', { className: 'acpw aw-page' }, h('div', { className: 'aw-page-inner' },
            h('header', { className: 'aw-head' },
              h('div', { className: 'aw-grow' }, h('h1', null, tt('panel')), h('p', { className: 'aw-note' }, tt('panelHint'))),
              h('div', { className: 'aw-head-actions' },
                h('span', { className: 'aw-live', role: 'status' }, h(StateDot, { state: online === 'live' ? 'done' : 'warning', size: 8 }), tt(online)),
                h(Button, { size: 'sm', variant: 'outline', icon: h(IconPlusOutlineRegular, { size: 14 }), disabled: busy, onClick: () => setCreating(true) }, tt('addProvider')))),
            view.data.storageError ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), tt('storageError', { message: view.data.storageError })) : null,
            problem ? h('div', { className: 'aw-banner', 'data-tone': 'error', role: 'alert' }, h(IconWarningTriangleOutlineRegular, { size: 14 }), problem, view.error ? h(Button, { size: 'sm', variant: 'ghost', onClick: view.refresh }, tt('retry')) : null) : null,
            !view.ready
              ? (view.error ? null : h('p', { className: 'aw-empty', role: 'status' }, tt('loading')))
              : h(ProviderWorkbench, {
                providers: view.data.providers,
                providerTemplates: view.data.providerTemplates,
                activeByProvider: view.data.activeByProvider,
                authByProvider: view.data.authByProvider,
                probeByProvider: view.data.probeByProvider,
                localUsageByProvider: view.data.localUsageByProvider,
                defaultCwd: view.data.defaultCwd,
                run, busy, creating, setCreating,
              })))
        }
      return { Page }
    }

    return { createPage }
  },
})
