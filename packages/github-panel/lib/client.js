window.__ModuleLoader__.load({
  id: 'dsh-github-panel',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, HoverCard, HoverCardGroup, Menu, StateDot,
      IconCloseOutlineRegular, IconCopyOutlineRegular, IconEllipsisOutlineRegular,
      IconRefreshOutlineRegular, IconRightUpOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')

    const NS = 'githubPanel'
    const SECTION_ID = 'github'
    const CONFIG_KEY = 'dsh-github-panel'
    const CHANNEL_NAME = 'dsh-github-panel'
    const REFRESH_THROTTLE_MS = 60_000
    const MENTION_DEBOUNCE_MS = 900
    const MAX_SESSIONS = 24
    const MENTION_FOLD_LIMIT = 4
    const PR_FOLD_LIMIT = 4
    const ISSUE_FOLD_LIMIT = 4
    const RUN_FOLD_LIMIT = 3

    const CSS_TEXT = `
.ghp-section{display:flex;flex-direction:column;gap:2px}
.ghp-group{display:flex;flex-direction:column;margin-top:4px}
.ghp-group-head{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:22px;padding:2px 6px 1px;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12);font-weight:500}
.ghp-group-btn{display:inline-flex;align-items:center;gap:5px;min-width:0;padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer}
@media (hover:hover){.ghp-group-btn:hover{color:var(--dsw-alias-label-primary)}}
.ghp-group-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px;border-radius:var(--dsw-radius-xs)}
.ghp-count{color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12);font-variant-numeric:tabular-nums;white-space:nowrap}
.ghp-num{color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12);font-variant-numeric:tabular-nums;white-space:nowrap}
.ghp-meta-inline{display:inline-flex;align-items:center;gap:6px;font-variant-numeric:tabular-nums}
.ghp-icon-open{color:var(--dsw-alias-state-success-primary)}
.ghp-icon-draft{color:var(--dsw-alias-label-tertiary)}
.ghp-icon-merged{color:var(--dsw-alias-state-business-primary)}
.ghp-icon-closed{color:var(--dsw-alias-state-error-primary)}
.ghp-icon-warn{color:var(--dsw-alias-state-warning-primary)}
.ghp-quiet{padding:4px 6px;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12)}
.ghp-indicator{background:var(--dsw-alias-state-error-primary)}
.ghp-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.ghp-cfg{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13)}
.ghp-cfg h4{margin:0;font:var(--dsw-font-sm-14);font-weight:600}
.ghp-cfg textarea{width:100%;min-height:76px;padding:8px;box-sizing:border-box;border-radius:var(--dsw-radius-sm,8px);border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:inherit;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;resize:vertical}
.ghp-cfg-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ghp-cfg-hint{color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12)}
.ghp-cfg-err{color:var(--dsw-alias-state-error-primary);font:var(--dsw-font-xxs-12)}
`

    const DICTS = {
      en: {
        sectionTitle: 'GitHub',
        openOnGitHub: 'Open on GitHub',
        openPrs: 'Open Pull Requests on GitHub',
        openIssues: 'Open Issues on GitHub',
        openActions: 'Open Actions on GitHub',
        openReleases: 'Open Releases on GitHub',
        refresh: 'Refresh GitHub',
        copyUrl: 'Copy URL',
        copyCommand: 'Copy',
        copied: 'Copied to clipboard',
        copyFailed: 'Could not copy to clipboard',
        cite: 'Add to composer',
        cited: 'Added reference to composer',
        citeBusy: 'Composer is busy; try again when editable',
        rerunFailed: 'Rerun failed jobs',
        rerunSent: 'Requested rerun of failed jobs',
        rerunFailedErr: 'Could not rerun failed jobs',
        retry: 'Retry',
        loadFailed: 'Could not load GitHub data',
        signInTitle: 'Sign in to {host}',
        ghUnavailable: 'GitHub CLI (gh) unavailable',
        rateLimited: 'GitHub API rate limit reached',
        repoNotFound: 'GitHub repository not found',
        private: 'Private',
        archived: 'Archived',
        currentBranch: 'Branch',
        stars: 'Stars',
        forks: 'Forks',
        mentioned: 'Mentioned in chat',
        pullRequests: 'Pull Requests',
        issues: 'Issues',
        actions: 'Actions',
        latestRelease: 'Latest release',
        draft: 'Draft',
        open: 'Open',
        closed: 'Closed',
        merged: 'Merged',
        assignees: 'Assignees',
        emptySection: 'No open PRs, issues, or recent runs',
        showMore: 'Show {n} more',
        showLess: 'Show less',
        foldName: '{label} in {group}',
        ciFailedIndicator: 'GitHub Actions failed',
        statusSuccess: 'Passed',
        statusFailure: 'Failed',
        statusRunning: 'Running',
        statusCancelled: 'Cancelled',
        statusNeutral: 'Neutral',
        updated: 'Updated {ago}',
        published: 'Published {ago}',
        justNow: 'just now',
        minutesAgo: '{n}m ago',
        hoursAgo: '{n}h ago',
        daysAgo: '{n}d ago',
        filesChanged: '{n} files',
        moreActions: 'More actions for {name}',
        hideMention: 'Hide from this session',
        mentionHidden: 'Hidden from this session',
        undo: 'Undo',
        askAgentPr: 'Ask Agent to review',
        askAgentIssue: 'Ask Agent to investigate',
        askAgentRun: 'Ask Agent to diagnose',
        promptPr: 'Please review PR {ref} ({title}) for key changes, risks, and suggestions:\n{url}',
        promptIssue: 'Please analyze Issue {ref} ({title}) and propose a fix:\n{url}',
        promptRun: 'Please diagnose the failed GitHub Actions run "{name}" ({title}):\n{url}',
        cfgTitle: 'GitHub hosts',
        cfgHint: 'Enter allowed GitHub hostnames (one per line or comma-separated). Applies immediately.',
        cfgSave: 'Save hosts',
        cfgSaving: 'Saving…',
        cfgSaved: 'Hosts saved.',
        cfgFailed: 'Could not save hosts: ',
      },
      zh: {
        sectionTitle: 'GitHub',
        openOnGitHub: '在 GitHub 中打开',
        openPrs: '在 GitHub 中打开 PR 列表',
        openIssues: '在 GitHub 中打开 Issues',
        openActions: '在 GitHub 中打开 Actions',
        openReleases: '在 GitHub 中打开 Releases',
        refresh: '刷新 GitHub 状态',
        copyUrl: '复制链接',
        copyCommand: '复制',
        copied: '已复制到剪贴板',
        copyFailed: '复制失败',
        cite: '引用到输入框',
        cited: '已添加到输入框（未发送）',
        citeBusy: '输入框当前不可编辑，请稍后重试',
        rerunFailed: '重跑失败任务',
        rerunSent: '已触发重跑失败任务',
        rerunFailedErr: '重跑失败任务出错',
        retry: '重试',
        loadFailed: '读取 GitHub 数据失败',
        signInTitle: '登录 {host}',
        ghUnavailable: '宿主未安装 GitHub CLI (gh)',
        rateLimited: '已触发 GitHub API 速率限制',
        repoNotFound: '未找到对应的 GitHub 仓库',
        private: '私有',
        archived: '已归档',
        currentBranch: '当前分支',
        stars: 'Star',
        forks: 'Fork',
        mentioned: '对话提及',
        pullRequests: 'Pull Requests',
        issues: 'Issues',
        actions: 'Actions',
        latestRelease: '最新发布',
        draft: '草稿',
        open: '打开',
        closed: '已关闭',
        merged: '已合并',
        assignees: '负责人',
        emptySection: '暂无打开的 PR、Issue 或近期构建',
        showMore: '显示其余 {n} 项',
        showLess: '收起',
        foldName: '{group}：{label}',
        ciFailedIndicator: 'GitHub Actions 失败',
        statusSuccess: '已通过',
        statusFailure: '失败',
        statusRunning: '运行中',
        statusCancelled: '已取消',
        statusNeutral: '其他',
        updated: '更新于 {ago}',
        published: '发布于 {ago}',
        justNow: '刚刚',
        minutesAgo: '{n} 分钟前',
        hoursAgo: '{n} 小时前',
        daysAgo: '{n} 天前',
        filesChanged: '{n} 个文件',
        moreActions: '{name} 的更多操作',
        hideMention: '从此会话隐藏',
        mentionHidden: '已从此会话隐藏',
        undo: '撤销',
        askAgentPr: '让 Agent 审查',
        askAgentIssue: '让 Agent 排查',
        askAgentRun: '让 Agent 诊断',
        promptPr: '请帮我审查 PR {ref}（{title}）的关键改动、风险点与改进建议：\n{url}',
        promptIssue: '请帮我分析 Issue {ref}（{title}）的原因并给出修复方案：\n{url}',
        promptRun: '请帮我排查 GitHub Actions 失败运行「{name}」（{title}）的根因：\n{url}',
        cfgTitle: 'GitHub 主机列表',
        cfgHint: '填写允许的 GitHub 主机名（每行一个或逗号分隔），保存后立即生效。',
        cfgSave: '保存主机',
        cfgSaving: '保存中…',
        cfgSaved: '主机配置已保存。',
        cfgFailed: '保存主机失败：',
      },
    }

    const IconGitHub = ({ size = 16 }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': true,
    }, h('path', {
      fillRule: 'evenodd',
      d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z',
    }))

    const IconPullRequest = ({ size = 16, className }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', className, 'aria-hidden': true,
    },
    h('circle', { cx: 4.5, cy: 3.5, r: 1.5 }),
    h('circle', { cx: 4.5, cy: 12.5, r: 1.5 }),
    h('circle', { cx: 11.5, cy: 12.5, r: 1.5 }),
    h('path', { d: 'M4.5 5v6M11.5 11V6.5a2 2 0 0 0-2-2H8M9.5 3 8 4.5 9.5 6' }))

    const IconIssue = ({ size = 16, className }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, className, 'aria-hidden': true,
    },
    h('circle', { cx: 8, cy: 8, r: 6 }),
    h('circle', { cx: 8, cy: 8, r: 1.4, fill: 'currentColor', stroke: 'none' }))

    const IconTag = ({ size = 16, className }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.35, strokeLinecap: 'round', strokeLinejoin: 'round', className, 'aria-hidden': true,
    },
    h('path', { d: 'M2.5 8.2V3.5a1 1 0 0 1 1-1h4.7l5.3 5.3a1 1 0 0 1 0 1.4l-4.3 4.3a1 1 0 0 1-1.4 0L2.5 8.2z' }),
    h('circle', { cx: 5.5, cy: 5.5, r: 0.9, fill: 'currentColor', stroke: 'none' }))

    const IconQuote = ({ size = 14 }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    },
    h('path', { d: 'M3 4.5h10M3 8h7M3 11.5h5M11 10l2 2 2-2M13 8v4' }))

    const IconPrompt = ({ size = 14 }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    },
    h('path', { d: 'M8 2.2 9.4 6l3.8 1.4L9.4 8.8 8 12.6 6.6 8.8 2.8 7.4 6.6 6z' }))

    function fmt(template, vars = {}) {
      let out = String(template ?? '')
      for (const [key, value] of Object.entries(vars)) {
        out = out.replaceAll(`{${key}}`, String(value))
      }
      return out
    }

    function formatAgo(iso, t) {
      if (!iso) return ''
      const ms = Date.parse(iso)
      if (!Number.isFinite(ms)) return ''
      const diff = Math.max(0, Date.now() - ms)
      const mins = Math.floor(diff / 60_000)
      if (mins < 1) return t('justNow')
      if (mins < 60) return fmt(t('minutesAgo'), { n: mins })
      const hours = Math.floor(mins / 60)
      if (hours < 24) return fmt(t('hoursAgo'), { n: hours })
      const days = Math.floor(hours / 24)
      return fmt(t('daysAgo'), { n: days })
    }

    function dotStateForRun(status, conclusion) {
      const s = String(status || '').toLowerCase()
      const c = String(conclusion || '').toLowerCase()
      if (s === 'in_progress' || s === 'queued' || s === 'waiting' || s === 'pending' || s === 'requested') return 'ongoing'
      if (c === 'success') return 'completed'
      if (c === 'failure' || c === 'timed_out' || c === 'startup_failure' || c === 'action_required') return 'failed'
      return 'idle'
    }

    function statusLabelForRun(status, conclusion, t) {
      const dot = dotStateForRun(status, conclusion)
      if (dot === 'ongoing') return t('statusRunning')
      if (dot === 'completed') return t('statusSuccess')
      if (dot === 'failed') return t('statusFailure')
      if (String(conclusion || '').toLowerCase() === 'cancelled') return t('statusCancelled')
      return t('statusNeutral')
    }

    function dotStateForCheck(state) {
      const s = String(state || '').toUpperCase()
      if (s === 'SUCCESS') return 'completed'
      if (s === 'FAILURE' || s === 'ERROR') return 'failed'
      if (s === 'PENDING' || s === 'EXPECTED') return 'ongoing'
      return 'idle'
    }

    function prIconClassFor(pr) {
      if (pr.state === 'MERGED') return 'ghp-icon-merged'
      if (pr.state === 'CLOSED') return 'ghp-icon-closed'
      return pr.isDraft ? 'ghp-icon-draft' : 'ghp-icon-open'
    }

    function issueIconClassFor(issue) {
      return issue.state === 'CLOSED' ? 'ghp-icon-merged' : 'ghp-icon-open'
    }

    function itemStatusInfo(item, t) {
      if (item.kind === 'run') {
        return { state: dotStateForRun(item.status, item.conclusion), label: statusLabelForRun(item.status, item.conclusion, t) }
      }
      if (item.kind === 'pr') {
        if (item.state === 'MERGED') return { state: 'completed', label: t('merged') }
        if (item.state === 'CLOSED') return { state: 'failed', label: t('closed') }
        if (item.isDraft) return { state: 'idle', label: t('draft') }
        if (item.checksState) return { state: dotStateForCheck(item.checksState), label: item.checksState }
        return { state: 'completed', label: t('open') }
      }
      if (item.state === 'CLOSED') return { state: 'idle', label: t('closed') }
      return { state: 'completed', label: t('open') }
    }

    function openExternal(url) {
      if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    function latestBranchRunFailed(data) {
      if (!data?.linked || data.authState !== 'ready' || !Array.isArray(data.runs) || data.runs.length === 0) return false
      const branch = data.remote?.branch || data.repo?.defaultBranch
      const matched = branch ? data.runs.find(run => run.headBranch === branch) : data.runs[0]
      if (!matched) return false
      return dotStateForRun(matched.status, matched.conclusion) === 'failed'
    }

    function createStoreRegistry() {
      const stores = new Map()
      let channel = null
      try {
        if (typeof BroadcastChannel === 'function') channel = new BroadcastChannel(CHANNEL_NAME)
      } catch {}

      function ensureStore(sessionId) {
        let store = stores.get(sessionId)
        if (store) return store
        const listeners = new Set()
        let snapshot = { loading: false, loaded: false, data: null, error: null, fetchedAt: 0 }
        let inflight = null
        let lastCwdKey = null

        const emit = () => { for (const fn of listeners) fn() }
        const set = patch => {
          snapshot = { ...snapshot, ...patch }
          emit()
        }

        async function fetchOverview(force = false, cwdHint) {
          if (cwdHint !== undefined) lastCwdKey = cwdHint
          if (inflight && !force) return inflight
          set({ loading: true, error: null })
          const qs = new URLSearchParams({ sessionId })
          if (force) qs.set('refresh', '1')
          const promise = fetch(`github-panel/overview?${qs.toString()}`, { cache: 'no-store' })
            .then(async res => {
              const json = await res.json().catch(() => null)
              if (!res.ok || !json?.ok) throw new Error(json?.message || `HTTP ${res.status}`)
              return json.value
            })
            .then(value => {
              set({ loading: false, loaded: true, data: value, error: null, fetchedAt: Date.now() })
              if (force && channel) {
                try { BroadcastChannel.prototype.postMessage.call(channel, { type: 'refresh', sessionId }) } catch {}
              }
              return value
            })
            .catch(err => {
              set({ loading: false, loaded: true, error: err instanceof Error ? err.message : String(err) })
              return null
            })
            .finally(() => {
              if (inflight === promise) inflight = null
            })
          inflight = promise
          return promise
        }

        store = {
          subscribe: fn => {
            listeners.add(fn)
            return () => listeners.delete(fn)
          },
          getSnapshot: () => snapshot,
          ensure(cwdHint) {
            const cwdChanged = cwdHint !== undefined && lastCwdKey !== null && lastCwdKey !== cwdHint
            if (!snapshot.loaded || cwdChanged) {
              void fetchOverview(cwdChanged, cwdHint)
            } else {
              lastCwdKey = cwdHint ?? lastCwdKey
            }
          },
          refresh(force = true) {
            return fetchOverview(force, lastCwdKey ?? undefined)
          },
          maybeRefreshStale() {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
            if (!snapshot.loaded || snapshot.loading) return
            if (Date.now() - snapshot.fetchedAt >= REFRESH_THROTTLE_MS) {
              void fetchOverview(false, lastCwdKey ?? undefined)
            }
          },
        }
        stores.set(sessionId, store)
        while (stores.size > MAX_SESSIONS) {
          const oldest = stores.keys().next().value
          if (oldest === undefined || oldest === sessionId) break
          stores.delete(oldest)
        }
        return store
      }

      const onChannelMessage = event => {
        const msg = event?.data
        if (msg?.type === 'refresh' && typeof msg.sessionId === 'string') {
          const store = stores.get(msg.sessionId)
          if (store) void store.refresh(false)
        }
      }
      channel?.addEventListener('message', onChannelMessage)

      return {
        ensureStore,
        dispose() {
          try {
            channel?.removeEventListener('message', onChannelMessage)
            channel?.close()
          } catch {}
          stores.clear()
        },
      }
    }

    function useOverview(registry, sessionId, cwdHint, activityKey) {
      const store = React.useMemo(
        () => (sessionId ? registry.ensureStore(sessionId) : null),
        [registry, sessionId],
      )
      const empty = React.useRef({ loading: false, loaded: false, data: null, error: null, fetchedAt: 0 }).current
      const snap = React.useSyncExternalStore(
        store ? store.subscribe : () => () => {},
        store ? store.getSnapshot : () => empty,
        () => empty,
      )
      React.useEffect(() => {
        if (!store) return undefined
        store.ensure(cwdHint)
        const onWake = () => store.maybeRefreshStale()
        window.addEventListener('focus', onWake)
        document.addEventListener('visibilitychange', onWake)
        return () => {
          window.removeEventListener('focus', onWake)
          document.removeEventListener('visibilitychange', onWake)
        }
      }, [store, cwdHint])

      const prevActivity = React.useRef(activityKey)
      React.useEffect(() => {
        if (!store || activityKey === undefined) return undefined
        if (prevActivity.current === activityKey) return undefined
        prevActivity.current = activityKey
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return undefined
        const timer = setTimeout(() => {
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
          void store.refresh(false)
        }, MENTION_DEBOUNCE_MS)
        return () => clearTimeout(timer)
      }, [store, activityKey])

      return { snap, store }
    }

    function readActivityKey(useConversation, useSession) {
      const nodeCount = typeof useConversation === 'function'
        ? useConversation(conv => {
          const view = conv?.views?.get?.('chat')
          return Array.isArray(view?.nodes) ? view.nodes.length : 0
        })
        : 0
      const running = typeof useSession === 'function'
        ? Boolean(useSession(s => s?.running))
        : false
      return `${nodeCount}:${running ? 1 : 0}`
    }

    function RowMenu({ label, entries }) {
      const [open, setOpen] = React.useState(false)
      const items = entries.map(entry => entry.separator ? { type: 'separator', id: entry.id } : entry.item)
      const onSelect = id => {
        setOpen(false)
        const found = entries.find(entry => !entry.separator && entry.item.id === id)
        found?.run?.()
      }
      return h(Menu, {
        open,
        onClose: () => setOpen(false),
        portal: true,
        align: 'end',
        anchor: h('button', {
          type: 'button',
          'aria-label': label,
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          onClick: () => setOpen(v => !v),
        }, h(IconEllipsisOutlineRegular, { size: 16 })),
        items,
        onSelect,
      })
    }

    function mentionKeyOf(item) {
      return item.kind === 'run' ? `run:${item.fullName}:${item.id}` : `${item.kind}:${item.fullName}:${item.number}`
    }

    function readHiddenMentions(sessionId) {
      if (!sessionId) return new Set()
      try {
        const raw = JSON.parse(localStorage.getItem(`dsh-github-panel:hidden:${sessionId}`) ?? '[]')
        return new Set(Array.isArray(raw) ? raw.filter(v => typeof v === 'string') : [])
      } catch {
        return new Set()
      }
    }

    function writeHiddenMentions(sessionId, set) {
      if (!sessionId) return
      try {
        const list = [...set].slice(-64)
        if (list.length === 0) localStorage.removeItem(`dsh-github-panel:hidden:${sessionId}`)
        else localStorage.setItem(`dsh-github-panel:hidden:${sessionId}`, JSON.stringify(list))
      } catch {}
    }

    function citeTextForMention(item) {
      if (item.kind === 'pr') return `PR ${item.fullName}#${item.number}: ${item.title} (${item.url})`
      if (item.kind === 'issue') return `Issue ${item.fullName}#${item.number}: ${item.title} (${item.url})`
      return `GitHub Actions "${item.name}" (${item.displayTitle}): ${item.url}`
    }

    function agentPromptFor(kind, item, defaultFullName, t) {
      if (!item?.url) return null
      const repoRef = item.fullName || defaultFullName || ''
      if (kind === 'pr') {
        return {
          label: t('askAgentPr'),
          text: fmt(t('promptPr'), { ref: `${repoRef}#${item.number}`, title: item.title, url: item.url }),
        }
      }
      if (kind === 'issue') {
        return {
          label: t('askAgentIssue'),
          text: fmt(t('promptIssue'), { ref: `${repoRef}#${item.number}`, title: item.title, url: item.url }),
        }
      }
      return {
        label: t('askAgentRun'),
        text: fmt(t('promptRun'), { name: item.name || 'Actions', title: item.displayTitle, url: item.url }),
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(DICTS)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dict), `github-panel: ${lang}`)
        }
        const translate = ctx.locale.bind(NS)

        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.plugin = 'dsh-github-panel'
          style.textContent = CSS_TEXT
          document.head.appendChild(style)
          return () => style.remove()
        }, 'github-panel: styles')

        const registry = createStoreRegistry()
        ctx.effect(() => () => registry.dispose(), 'github-panel: store registry')

        const notify = (text, ok = true) => {
          try { ctx.get('contextMenus')?.notify?.(text, ok) } catch {}
        }

        async function copyText(text, t) {
          try {
            await navigator.clipboard.writeText(text)
            notify(t('copied'), true)
          } catch {
            notify(t('copyFailed'), false)
          }
        }

        function insertReference(inputActions, text, t) {
          if (!inputActions) return
          const span = inputActions.captureInsertion()
          const lead = span.end > 0 ? ' ' : ''
          const ok = inputActions.insertText(`${lead}${text} `, { ...span, start: span.end })
          notify(t(ok ? 'cited' : 'citeBusy'), ok)
        }

        async function triggerRerun(sessionId, runId, target, store, t) {
          try {
            const payload = { sessionId, action: 'rerun-failed', runId }
            if (target?.owner && target?.repo) {
              payload.host = target.host || 'github.com'
              payload.owner = target.owner
              payload.repo = target.repo
            }
            const response = await fetch('github-panel/action', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(payload),
            })
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.ok) throw new Error(json?.message || `HTTP ${response.status}`)
            notify(t('rerunSent'), true)
            void store?.refresh(true)
            return true
          } catch (err) {
            notify(`${t('rerunFailedErr')}: ${err instanceof Error ? err.message : String(err)}`, false)
            return false
          }
        }

        function GitHubSection({ sessionId, useProjection, useConversation, useSession, inputActions, renderFactorySlot, t }) {
          const cwd = typeof useProjection === 'function' ? useProjection('workingDirectory') : undefined
          const activityKey = readActivityKey(useConversation, useSession)
          const { snap, store } = useOverview(registry, sessionId, cwd, activityKey)
          const [mentionsExpanded, setMentionsExpanded] = React.useState(false)
          const [hiddenKeys, setHiddenKeys] = React.useState(() => readHiddenMentions(sessionId))
          const [prsExpanded, setPrsExpanded] = React.useState(false)
          const [issuesExpanded, setIssuesExpanded] = React.useState(false)
          const [runsExpanded, setRunsExpanded] = React.useState(false)

          React.useEffect(() => { setHiddenKeys(readHiddenMentions(sessionId)) }, [sessionId])

          const hideMention = item => {
            const k = mentionKeyOf(item)
            const next = new Set(hiddenKeys)
            next.add(k)
            writeHiddenMentions(sessionId, next)
            setHiddenKeys(next)
            try {
              ctx.get('contextMenus')?.notify?.(t('mentionHidden'), true, {
                label: t('undo'),
                run: () => {
                  const restored = readHiddenMentions(sessionId)
                  restored.delete(k)
                  writeHiddenMentions(sessionId, restored)
                  setHiddenKeys(new Set(restored))
                },
              })
            } catch {}
          }

          const data = snap.data
          const mentions = (data?.mentions ?? []).filter(item => !hiddenKeys.has(mentionKeyOf(item)))
          if (!snap.loaded || (!data?.linked && mentions.length === 0)) return null

          const linked = Boolean(data?.linked)
          const remote = data.remote
          const repo = data.repo
          const fullName = repo?.fullName || remote?.fullName || ''
          const repoUrl = repo?.url || remote?.url || ''
          const prs = data.pullRequests ?? []
          const issues = data.issues ?? []
          const runs = data.runs ?? []
          const latestRelease = data.latestRelease

          const renderDetails = details => renderFactorySlot('conversation.session.panel.details', details)

          const repoDetailParts = []
          if (repo?.defaultBranch) repoDetailParts.push(repo.defaultBranch)
          if (typeof repo?.stars === 'number') repoDetailParts.push(`★ ${repo.stars}`)
          if (repo?.isPrivate) repoDetailParts.push(t('private'))
          if (repo?.isArchived) repoDetailParts.push(t('archived'))

          const repoRowEl = linked
            ? h('div', { 'data-session-panel-row': '' },
              h('button', {
                type: 'button',
                'data-row-part': 'body',
                onClick: () => openExternal(repoUrl),
              },
              h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(IconGitHub, { size: 16 })),
              repoDetailParts.length > 0
                ? h('span', { 'data-row-part': 'lines' },
                  h('span', { 'data-row-part': 'content' }, fullName),
                  h('span', { 'data-row-part': 'detail' }, repoDetailParts.join(' · ')))
                : h('span', { 'data-row-part': 'content' }, fullName)),
              h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                label: fmt(t('moreActions'), { name: fullName }),
                entries: [
                  { item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(repoUrl) },
                  { item: { id: 'prs', label: t('openPrs'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(`${repoUrl}/pulls`) },
                  { item: { id: 'issues', label: t('openIssues'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(`${repoUrl}/issues`) },
                  { item: { id: 'actions', label: t('openActions'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(`${repoUrl}/actions`) },
                  { item: { id: 'releases', label: t('openReleases'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(`${repoUrl}/releases`) },
                  { separator: true, id: 'sep-util' },
                  { item: { id: 'refresh', label: t('refresh'), icon: h(IconRefreshOutlineRegular, { size: 14 }) }, run: () => void store?.refresh(true) },
                  { item: { id: 'copy', label: t('copyUrl'), icon: h(IconCopyOutlineRegular, { size: 14 }) }, run: () => void copyText(repoUrl, t) },
                ],
              })))
            : null

          const repoHoverLines = []
          if (repo?.description) repoHoverLines.push(repo.description)
          if (repo) {
            repoHoverLines.push(`${t('stars')}: ${repo.stars} · ${t('forks')}: ${repo.forks}${repo.primaryLanguage ? ` · ${repo.primaryLanguage.name}` : ''}`)
          }
          if (remote?.branch) repoHoverLines.push(`${t('currentBranch')}: ${remote.branch}`)

          const authNode = linked && data.authState !== 'ready'
            ? h('div', { role: 'status', 'data-session-panel-row': '' },
              h('span', { 'data-row-part': 'body' },
                h('span', { 'data-row-part': 'icon', 'aria-hidden': true },
                  h(IconWarningTriangleOutlineRegular, { size: 16, className: 'ghp-icon-warn' })),
                h('span', { 'data-row-part': 'lines' },
                  h('span', { 'data-row-part': 'content' },
                    data.authState === 'unauthenticated' ? fmt(t('signInTitle'), { host: remote.host })
                      : data.authState === 'unavailable' ? t('ghUnavailable')
                        : data.authState === 'rate-limited' ? t('rateLimited')
                          : data.authState === 'not-found' ? t('repoNotFound')
                            : t('loadFailed')),
                  h('span', { 'data-row-part': 'detail' }, data.loginCommand || data.error || ''))),
              h('span', { 'data-row-part': 'trailing' },
                data.loginCommand
                  ? h(Button, { size: 'sm', variant: 'outline', onClick: () => void copyText(data.loginCommand, t) }, t('copyCommand'))
                  : h(Button, { size: 'sm', variant: 'outline', onClick: () => void store?.refresh(true) }, t('retry'))))
            : null

          const mentionFoldable = mentions.length > MENTION_FOLD_LIMIT + 1
          const shownMentions = mentionFoldable && !mentionsExpanded ? mentions.slice(0, MENTION_FOLD_LIMIT) : mentions

          const prFoldable = prs.length > PR_FOLD_LIMIT + 1
          const shownPrs = prFoldable && !prsExpanded ? prs.slice(0, PR_FOLD_LIMIT) : prs

          const issueFoldable = issues.length > ISSUE_FOLD_LIMIT + 1
          const shownIssues = issueFoldable && !issuesExpanded ? issues.slice(0, ISSUE_FOLD_LIMIT) : issues

          const runFoldable = runs.length > RUN_FOLD_LIMIT + 1
          const shownRuns = runFoldable && !runsExpanded ? runs.slice(0, RUN_FOLD_LIMIT) : runs

          const hasAnyContent = mentions.length > 0 || prs.length > 0 || issues.length > 0 || runs.length > 0 || Boolean(latestRelease)

          return h('div', { className: 'ghp-section', 'data-github-panel': '' },
            h(HoverCardGroup, null,
              repoRowEl && h(HoverCard, {
                grouped: true,
                anchor: repoRowEl,
                content: renderDetails({ title: fullName, lines: repoHoverLines }),
              }),
              authNode,

              mentions.length > 0 && h('div', { className: 'ghp-group' },
                h('div', { className: 'ghp-group-head' },
                  h('span', null, t('mentioned')),
                  h('span', { className: 'ghp-count' }, mentions.length)),
                ...shownMentions.map(item => {
                  const key = item.kind === 'run' ? `m-run-${item.fullName}-${item.id}` : `m-${item.kind}-${item.fullName}-${item.number}`
                  const crossRepo = !linked || item.fullName.toLowerCase() !== fullName.toLowerCase()
                  const title = item.kind === 'run' ? item.displayTitle : item.title
                  const trailingText = item.kind === 'run'
                    ? formatAgo(item.updatedAt || item.createdAt, t)
                    : `#${item.number}`
                  const iconEl = item.kind === 'pr'
                    ? h(IconPullRequest, { size: 16, className: prIconClassFor(item) })
                    : item.kind === 'issue'
                      ? h(IconIssue, { size: 16, className: issueIconClassFor(item) })
                      : h(StateDot, { state: dotStateForRun(item.status, item.conclusion), size: 8 })
                  const checkDot = item.kind === 'pr' && item.state === 'OPEN' && item.checksState ? dotStateForCheck(item.checksState) : null
                  const subDetail = crossRepo
                    ? item.fullName
                    : (item.kind === 'run' ? [item.name, item.headBranch].filter(Boolean).join(' · ') : '')
                  const prompt = agentPromptFor(item.kind, item, fullName, t)

                  const rowEl = h('div', { key, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openExternal(item.url),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, iconEl),
                    subDetail
                      ? h('span', { 'data-row-part': 'lines' },
                        h('span', { 'data-row-part': 'content' }, title),
                        h('span', { 'data-row-part': 'detail' }, subDetail))
                      : h('span', { 'data-row-part': 'content' }, title)),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-meta-inline' },
                      checkDot && h(StateDot, { state: checkDot, size: 7 }),
                      trailingText && h('span', { className: 'ghp-num' }, trailingText)),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: title }),
                      entries: [
                        ...(item.url ? [{ item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(item.url) }] : []),
                        ...(item.kind === 'run' && dotStateForRun(item.status, item.conclusion) === 'failed' ? [{
                          item: { id: 'rerun', label: t('rerunFailed'), icon: h(IconRefreshOutlineRegular, { size: 14 }) },
                          run: () => void triggerRerun(sessionId, item.id, item, store, t),
                        }] : []),
                        ...(prompt && inputActions ? [{ item: { id: 'ask', label: prompt.label, icon: h(IconPrompt, { size: 14 }) }, run: () => insertReference(inputActions, prompt.text, t) }] : []),
                        ...(inputActions ? [{ item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, citeTextForMention(item), t) }] : []),
                        ...(item.url ? [{ item: { id: 'copy', label: t('copyUrl'), icon: h(IconCopyOutlineRegular, { size: 14 }) }, run: () => void copyText(item.url, t) }] : []),
                        { separator: true, id: `sep-hide-${key}` },
                        { item: { id: 'hide', label: t('hideMention'), icon: h(IconCloseOutlineRegular, { size: 14 }) }, run: () => hideMention(item) },
                      ],
                    })))

                  const hoverLines = []
                  if (item.kind === 'pr') {
                    hoverLines.push(`${item.fullName}#${item.number}${item.author ? ` · @${item.author}` : ''}${item.headRefName ? ` · ${item.headRefName} → ${item.baseRefName}` : ''}`)
                    if (item.updatedAt) hoverLines.push(`+${item.additions ?? 0} −${item.deletions ?? 0} · ${fmt(t('updated'), { ago: formatAgo(item.updatedAt, t) })}`)
                  } else if (item.kind === 'issue') {
                    hoverLines.push(`${item.fullName}#${item.number}${item.author ? ` · @${item.author}` : ''}${item.updatedAt ? ` · ${fmt(t('updated'), { ago: formatAgo(item.updatedAt, t) })}` : ''}`)
                  } else {
                    hoverLines.push([item.fullName, item.name, item.headBranch && `@${item.headBranch}`].filter(Boolean).join(' · '))
                  }
                  if (item.labels?.length) hoverLines.push(item.labels.map(l => l.name).join(', '))

                  return h(HoverCard, {
                    key: `hc-${key}`,
                    grouped: true,
                    anchor: rowEl,
                    content: renderDetails({
                      title,
                      lines: hoverLines,
                      status: item.unresolved ? undefined : itemStatusInfo(item, t),
                    }),
                  })
                }),
                mentionFoldable && renderFactorySlot('conversation.session.panel.fold', {
                  expanded: mentionsExpanded,
                  label: mentionsExpanded ? t('showLess') : fmt(t('showMore'), { n: mentions.length - MENTION_FOLD_LIMIT }),
                  name: fmt(t('foldName'), {
                    group: t('mentioned'),
                    label: mentionsExpanded ? t('showLess') : fmt(t('showMore'), { n: mentions.length - MENTION_FOLD_LIMIT }),
                  }),
                  onToggle: () => setMentionsExpanded(v => !v),
                })),

              linked && data.authState === 'ready' && prs.length > 0 && h('div', { className: 'ghp-group' },
                h('div', { className: 'ghp-group-head' },
                  h('button', {
                    type: 'button',
                    className: 'ghp-group-btn',
                    title: t('openPrs'),
                    onClick: () => openExternal(`${repoUrl}/pulls`),
                  }, t('pullRequests')),
                  h('span', { className: 'ghp-count' }, data.pullRequestsTotal ?? prs.length)),
                ...shownPrs.map(pr => {
                  const prIconClass = prIconClassFor(pr)
                  const checkDot = pr.checksState ? dotStateForCheck(pr.checksState) : null
                  const prompt = agentPromptFor('pr', pr, fullName, t)
                  const rowEl = h('div', { key: `pr-${pr.number}`, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openExternal(pr.url),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(IconPullRequest, { size: 16, className: prIconClass })),
                    h('span', { 'data-row-part': 'content' }, pr.title)),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-meta-inline' },
                      checkDot && h(StateDot, { state: checkDot, size: 7 }),
                      h('span', { className: 'ghp-num' }, `#${pr.number}`)),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: `#${pr.number}` }),
                      entries: [
                        { item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(pr.url) },
                        ...(prompt && inputActions ? [{ item: { id: 'ask', label: prompt.label, icon: h(IconPrompt, { size: 14 }) }, run: () => insertReference(inputActions, prompt.text, t) }] : []),
                        ...(inputActions ? [{ item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, `PR #${pr.number}: ${pr.title} (${pr.url})`, t) }] : []),
                        { item: { id: 'copy', label: t('copyUrl'), icon: h(IconCopyOutlineRegular, { size: 14 }) }, run: () => void copyText(pr.url, t) },
                      ],
                    })))
                  const prLines = [
                    `#${pr.number} · @${pr.author} · ${pr.headRefName} → ${pr.baseRefName}`,
                    `+${pr.additions} −${pr.deletions} · ${fmt(t('filesChanged'), { n: pr.changedFiles })} · ${fmt(t('updated'), { ago: formatAgo(pr.updatedAt, t) })}`,
                  ]
                  if (pr.labels?.length) prLines.push(pr.labels.map(l => l.name).join(', '))
                  return h(HoverCard, {
                    key: `pr-hc-${pr.number}`,
                    grouped: true,
                    anchor: rowEl,
                    content: renderDetails({
                      title: pr.title,
                      lines: prLines,
                      status: pr.isDraft ? { state: 'idle', label: t('draft') }
                        : checkDot ? { state: checkDot, label: pr.checksState } : undefined,
                    }),
                  })
                }),
                prFoldable && renderFactorySlot('conversation.session.panel.fold', {
                  expanded: prsExpanded,
                  label: prsExpanded ? t('showLess') : fmt(t('showMore'), { n: prs.length - PR_FOLD_LIMIT }),
                  name: fmt(t('foldName'), {
                    group: t('pullRequests'),
                    label: prsExpanded ? t('showLess') : fmt(t('showMore'), { n: prs.length - PR_FOLD_LIMIT }),
                  }),
                  onToggle: () => setPrsExpanded(v => !v),
                })),

              linked && data.authState === 'ready' && issues.length > 0 && h('div', { className: 'ghp-group' },
                h('div', { className: 'ghp-group-head' },
                  h('button', {
                    type: 'button',
                    className: 'ghp-group-btn',
                    title: t('openIssues'),
                    onClick: () => openExternal(`${repoUrl}/issues`),
                  }, t('issues')),
                  h('span', { className: 'ghp-count' }, data.issuesTotal ?? issues.length)),
                ...shownIssues.map(issue => {
                  const prompt = agentPromptFor('issue', issue, fullName, t)
                  const rowEl = h('div', { key: `issue-${issue.number}`, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openExternal(issue.url),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(IconIssue, { size: 16, className: 'ghp-icon-open' })),
                    h('span', { 'data-row-part': 'content' }, issue.title)),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-num' }, `#${issue.number}`),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: `#${issue.number}` }),
                      entries: [
                        { item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(issue.url) },
                        ...(prompt && inputActions ? [{ item: { id: 'ask', label: prompt.label, icon: h(IconPrompt, { size: 14 }) }, run: () => insertReference(inputActions, prompt.text, t) }] : []),
                        ...(inputActions ? [{ item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, `Issue #${issue.number}: ${issue.title} (${issue.url})`, t) }] : []),
                        { item: { id: 'copy', label: t('copyUrl'), icon: h(IconCopyOutlineRegular, { size: 14 }) }, run: () => void copyText(issue.url, t) },
                      ],
                    })))
                  const issueLines = [
                    `#${issue.number} · @${issue.author} · ${fmt(t('updated'), { ago: formatAgo(issue.updatedAt, t) })}`,
                  ]
                  if (issue.labels?.length) issueLines.push(issue.labels.map(l => l.name).join(', '))
                  if (issue.assignees?.length) issueLines.push(`${t('assignees')}: ${issue.assignees.map(a => `@${a}`).join(', ')}`)
                  return h(HoverCard, {
                    key: `issue-hc-${issue.number}`,
                    grouped: true,
                    anchor: rowEl,
                    content: renderDetails({ title: issue.title, lines: issueLines }),
                  })
                }),
                issueFoldable && renderFactorySlot('conversation.session.panel.fold', {
                  expanded: issuesExpanded,
                  label: issuesExpanded ? t('showLess') : fmt(t('showMore'), { n: issues.length - ISSUE_FOLD_LIMIT }),
                  name: fmt(t('foldName'), {
                    group: t('issues'),
                    label: issuesExpanded ? t('showLess') : fmt(t('showMore'), { n: issues.length - ISSUE_FOLD_LIMIT }),
                  }),
                  onToggle: () => setIssuesExpanded(v => !v),
                })),

              linked && data.authState === 'ready' && runs.length > 0 && h('div', { className: 'ghp-group' },
                h('div', { className: 'ghp-group-head' },
                  h('button', {
                    type: 'button',
                    className: 'ghp-group-btn',
                    title: t('openActions'),
                    onClick: () => openExternal(`${repoUrl}/actions`),
                  }, t('actions')),
                  h('span', { className: 'ghp-count' }, runs.length)),
                ...shownRuns.map(run => {
                  const dot = dotStateForRun(run.status, run.conclusion)
                  const isFailed = dot === 'failed'
                  const prompt = agentPromptFor('run', run, fullName, t)
                  const rowEl = h('div', { key: `run-${run.id}`, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openExternal(run.url),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(StateDot, { state: dot, size: 8 })),
                    h('span', { 'data-row-part': 'lines' },
                      h('span', { 'data-row-part': 'content' }, run.displayTitle),
                      h('span', { 'data-row-part': 'detail' }, [run.name, run.headBranch].filter(Boolean).join(' · ')))),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-num' }, formatAgo(run.updatedAt || run.createdAt, t)),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: run.displayTitle }),
                      entries: [
                        ...(run.url ? [{ item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(run.url) }] : []),
                        ...(isFailed ? [{ item: { id: 'rerun', label: t('rerunFailed'), icon: h(IconRefreshOutlineRegular, { size: 14 }) }, run: () => void triggerRerun(sessionId, run.id, null, store, t) }] : []),
                        ...(prompt && inputActions ? [{ item: { id: 'ask', label: prompt.label, icon: h(IconPrompt, { size: 14 }) }, run: () => insertReference(inputActions, prompt.text, t) }] : []),
                        ...(inputActions ? [{ item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, `GitHub Actions "${run.name}" (${run.displayTitle}): ${run.url}`, t) }] : []),
                        ...(run.url ? [{ item: { id: 'copy', label: t('copyUrl'), icon: h(IconCopyOutlineRegular, { size: 14 }) }, run: () => void copyText(run.url, t) }] : []),
                      ],
                    })))
                  const runLines = [
                    [run.name, run.headBranch && `@${run.headBranch}`, run.event].filter(Boolean).join(' · '),
                    [run.actor && `@${run.actor}`, run.headSha, formatAgo(run.updatedAt || run.createdAt, t)].filter(Boolean).join(' · '),
                  ]
                  return h(HoverCard, {
                    key: `run-hc-${run.id}`,
                    grouped: true,
                    anchor: rowEl,
                    content: renderDetails({
                      title: run.displayTitle,
                      lines: runLines,
                      status: { state: dot, label: statusLabelForRun(run.status, run.conclusion, t) },
                    }),
                  })
                }),
                runFoldable && renderFactorySlot('conversation.session.panel.fold', {
                  expanded: runsExpanded,
                  label: runsExpanded ? t('showLess') : fmt(t('showMore'), { n: runs.length - RUN_FOLD_LIMIT }),
                  name: fmt(t('foldName'), {
                    group: t('actions'),
                    label: runsExpanded ? t('showLess') : fmt(t('showMore'), { n: runs.length - RUN_FOLD_LIMIT }),
                  }),
                  onToggle: () => setRunsExpanded(v => !v),
                })),

              linked && data.authState === 'ready' && latestRelease && h('div', { className: 'ghp-group' },
                h('div', { className: 'ghp-group-head' },
                  h('button', {
                    type: 'button',
                    className: 'ghp-group-btn',
                    title: t('openReleases'),
                    onClick: () => openExternal(`${repoUrl}/releases`),
                  }, t('latestRelease'))),
                h(HoverCard, {
                  grouped: true,
                  anchor: h('div', { 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openExternal(latestRelease.url),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(IconTag, { size: 16 })),
                    h('span', { 'data-row-part': 'content' }, latestRelease.name && latestRelease.name !== latestRelease.tagName
                      ? `${latestRelease.tagName} · ${latestRelease.name}` : latestRelease.tagName)),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-num' }, formatAgo(latestRelease.publishedAt, t)),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: latestRelease.tagName }),
                      entries: [
                        { item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(latestRelease.url) },
                        { item: { id: 'copy', label: t('copyUrl'), icon: h(IconCopyOutlineRegular, { size: 14 }) }, run: () => void copyText(latestRelease.url, t) },
                      ],
                    }))),
                  content: renderDetails({
                    title: latestRelease.name || latestRelease.tagName,
                    lines: [
                      latestRelease.tagName,
                      latestRelease.publishedAt ? fmt(t('published'), { ago: formatAgo(latestRelease.publishedAt, t) }) : '',
                    ].filter(Boolean),
                  }),
                })),

              linked && data.authState === 'ready' && !hasAnyContent && h('div', { className: 'ghp-quiet' }, t('emptySection'))))
        }

        function GitHubSectionActions({ sessionId }) {
          const { snap } = useOverview(registry, sessionId)
          const data = snap.data
          if (!snap.loaded || !data) return null
          const mentionCount = data.mentions?.length ?? 0
          if (!data.linked) {
            return mentionCount > 0 ? h('span', { className: 'ghp-count' }, mentionCount) : null
          }
          if (data.authState !== 'ready') {
            return mentionCount > 0 ? h('span', { className: 'ghp-count' }, mentionCount) : null
          }
          const parts = []
          if (data.pullRequestsTotal > 0) parts.push(`${data.pullRequestsTotal} PR`)
          if (data.issuesTotal > 0) parts.push(`${data.issuesTotal} Issue`)
          if (parts.length === 0 && mentionCount > 0) parts.push(String(mentionCount))
          if (parts.length === 0 && typeof data.repo?.stars === 'number' && data.repo.stars > 0) {
            parts.push(`★ ${data.repo.stars}`)
          }
          if (parts.length === 0) return null
          return h('span', { className: 'ghp-count' }, parts.join(' · '))
        }

        function GitHubIndicator({ sessionId, panelShown, t }) {
          const { snap } = useOverview(registry, sessionId)
          if (panelShown) return null
          if (!latestBranchRunFailed(snap.data)) return null
          return h('span', { className: 'ghp-indicator' },
            h('span', { className: 'ghp-sr' }, t('ciFailedIndicator')))
        }

        function ConfigPanel({ t }) {
          const [text, setText] = React.useState('github.com')
          const [busy, setBusy] = React.useState(false)
          const [status, setStatus] = React.useState({ tone: '', text: '' })

          React.useEffect(() => {
            fetch('github-panel/config', { cache: 'no-store' })
              .then(r => r.json())
              .then(json => {
                if (json?.ok && Array.isArray(json.value?.hosts)) setText(json.value.hosts.join('\n'))
              })
              .catch(() => {})
          }, [])

          const save = async () => {
            setBusy(true)
            setStatus({ tone: '', text: '' })
            try {
              const hosts = text.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
              const res = await fetch('github-panel/config', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ hosts }),
              })
              const json = await res.json().catch(() => null)
              if (!res.ok || !json?.ok) throw new Error(json?.message || `HTTP ${res.status}`)
              setText((json.value?.hosts ?? ['github.com']).join('\n'))
              setStatus({ tone: 'ok', text: t('cfgSaved') })
            } catch (err) {
              setStatus({ tone: 'err', text: t('cfgFailed') + (err instanceof Error ? err.message : String(err)) })
            } finally {
              setBusy(false)
            }
          }

          return h('div', { className: 'ghp-cfg' },
            h('h4', null, t('cfgTitle')),
            h('div', { className: 'ghp-cfg-hint' }, t('cfgHint')),
            h('textarea', { value: text, disabled: busy, onChange: e => setText(e.target.value) }),
            h('div', { className: 'ghp-cfg-foot' },
              h(Button, { size: 'sm', variant: 'primary', disabled: busy, onClick: () => void save() }, busy ? t('cfgSaving') : t('cfgSave')),
              status.text && h('span', { className: status.tone === 'err' ? 'ghp-cfg-err' : 'ghp-cfg-hint', role: 'status' }, status.text)))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: CONFIG_KEY,
          locale: NS,
        }, ConfigPanel))

        ctx.slots.inject('conversation.session.panel.section', function* () {
          yield ctx.slots.register({
            name: 'conversation.session.panel.section',
            id: SECTION_ID,
            order: 150,
            label: () => translate('sectionTitle'),
            locale: NS,
          }, GitHubSection)
          yield ctx.slots.register({
            name: 'conversation.session.panel.section.actions',
            key: SECTION_ID,
            locale: NS,
          }, GitHubSectionActions)
        })

        ctx.slots.inject('conversation.session.panel.indicator', () => ctx.slots.register({
          name: 'conversation.session.panel.indicator',
          id: 'github.ci',
          order: 50,
          locale: NS,
        }, GitHubIndicator))
      },
    }
  },
})
