window.__ModuleLoader__.load({
  id: 'dsh-github-panel',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      Button, HoverCard, HoverCardGroup, Input, MarkdownText, Menu, SegmentedTabs, StateDot, Tag, Tooltip,
      IconChevronLeftOutlineRegular, IconCloseOutlineRegular, IconCopyOutlineRegular, IconEllipsisOutlineRegular,
      IconRefreshOutlineRegular, IconRightUpOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')

    const NS = 'githubPanel'
    const SECTION_ID = 'github'
    const TAB_ID = 'dsh-github-panel'
    const TAB_KIND = 'github-panel'
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

.ghp-tab{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13)}
.ghp-tab-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}
.ghp-tab-title-wrap{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
.ghp-tab-title{font:var(--dsw-font-sm-14);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ghp-tab-actions{display:inline-flex;align-items:center;gap:4px;flex:none}
.ghp-tab-nav{display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;flex-wrap:wrap}
.ghp-tab-body{flex:1;min-height:0;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px}
.ghp-search{margin-bottom:2px}
.ghp-card{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}
.ghp-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(108px,1fr));gap:8px}
.ghp-stat{display:flex;flex-direction:column;gap:2px;padding:10px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-1);cursor:pointer;text-align:left;color:inherit;font:inherit}
@media (hover:hover){.ghp-stat:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.ghp-stat-val{font-size:16px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}
.ghp-stat-label{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary)}
.ghp-desc{margin:0;color:var(--dsw-alias-label-secondary);line-height:1.5}
.ghp-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.ghp-item{display:flex;align-items:flex-start;gap:10px;width:100%;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);color:inherit;font:inherit;text-align:left;cursor:pointer;box-sizing:border-box}
@media (hover:hover){.ghp-item:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l3)}}
.ghp-item-icon{flex:none;margin-top:2px;display:inline-flex;align-items:center;justify-content:center}
.ghp-item-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.ghp-item-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.ghp-item-title{font-weight:500;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.ghp-item-sub{display:flex;align-items:center;flex-wrap:wrap;gap:6px;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12)}
.ghp-labels{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}
.ghp-label{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-12);line-height:16px}
.ghp-label-dot{width:7px;height:7px;border-radius:999px;flex:none}
.ghp-add{color:var(--dsw-alias-state-success-primary)}
.ghp-del{color:var(--dsw-alias-state-error-primary)}
.ghp-detail-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.ghp-detail-actions{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap}
.ghp-detail-title{margin:0;font-size:16px;font-weight:600;line-height:1.4;overflow-wrap:anywhere}
.ghp-prose{padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);overflow-wrap:anywhere}
.ghp-comments{display:flex;flex-direction:column;gap:8px}
.ghp-comment{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}
.ghp-comment-head{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxs-12)}
.ghp-comment-author{font-weight:600;color:var(--dsw-alias-label-primary)}
.ghp-jobs{display:flex;flex-direction:column;gap:8px}
.ghp-job{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}
.ghp-job-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ghp-job-name{display:inline-flex;align-items:center;gap:8px;font-weight:500;min-width:0}
.ghp-steps{display:flex;flex-direction:column;gap:3px;padding-left:18px;margin:0;list-style:none}
.ghp-step{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-12)}
.ghp-empty{padding:24px 12px;text-align:center;color:var(--dsw-alias-label-tertiary)}
.ghp-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}
.ghp-banner-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.ghp-code{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ghp-tab-chip{display:inline-flex;align-items:center;gap:6px;min-width:0}
.ghp-tab-chip svg{flex:none;width:14px;height:14px}
.ghp-cfg{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13)}
.ghp-cfg h4{margin:0;font:var(--dsw-font-sm-14);font-weight:600}
.ghp-cfg textarea{width:100%;min-height:76px;padding:8px;box-sizing:border-box;border-radius:var(--dsw-radius-sm,8px);border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:inherit;font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12px;resize:vertical}
.ghp-cfg-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
`

    const DICTS = {
      en: {
        sectionTitle: 'GitHub',
        tabTitle: 'GitHub',
        openPanel: 'Open GitHub details',
        openOnGitHub: 'Open on GitHub',
        openPrs: 'Open Pull Requests on GitHub',
        openIssues: 'Open Issues on GitHub',
        openActions: 'Open Actions on GitHub',
        refresh: 'Refresh GitHub',
        copyUrl: 'Copy URL',
        copyCommand: 'Copy',
        copied: 'Copied to clipboard',
        copyFailed: 'Could not copy to clipboard',
        cite: 'Add to composer',
        cited: 'Added reference to composer',
        citeBusy: 'Composer is busy; try again when editable',
        viewDetails: 'View details',
        rerunFailed: 'Rerun failed jobs',
        rerunSent: 'Requested rerun of failed jobs',
        rerunFailedErr: 'Could not rerun failed jobs',
        retry: 'Retry',
        back: 'Back',
        loading: 'Loading GitHub data…',
        loadFailed: 'Could not load GitHub data',
        notLinked: 'This session is not linked to a GitHub repository.',
        signInTitle: 'Sign in to {host}',
        ghUnavailable: 'GitHub CLI (gh) unavailable',
        rateLimited: 'GitHub API rate limit reached',
        repoNotFound: 'GitHub repository not found',
        private: 'Private',
        public: 'Public',
        archived: 'Archived',
        defaultBranch: 'Default branch',
        currentBranch: 'Branch',
        stars: 'Stars',
        forks: 'Forks',
        mentioned: 'Mentioned in chat',
        mentionedShort: 'Mentioned',
        pullRequests: 'Pull Requests',
        issues: 'Issues',
        actions: 'Actions',
        commits: 'Commits',
        overview: 'Overview',
        latestRelease: 'Latest release',
        release: 'Release',
        releases: 'Releases',
        prerelease: 'Pre-release',
        draft: 'Draft',
        open: 'Open',
        closed: 'Closed',
        merged: 'Merged',
        approved: 'Approved',
        changesRequested: 'Changes requested',
        reviewRequired: 'Review required',
        checks: 'Checks',
        jobs: 'Jobs',
        comments: 'Comments',
        assignees: 'Assignees',
        reviewers: 'Reviewers',
        milestone: 'Milestone',
        assets: 'Assets',
        noDescription: 'No description provided.',
        emptySection: 'No open PRs, issues, or recent runs',
        emptyMentions: 'No GitHub issues, PRs, or runs mentioned in this conversation.',
        emptyPrs: 'No open pull requests.',
        emptyIssues: 'No open issues.',
        emptyRuns: 'No recent workflow runs.',
        emptyCommits: 'No recent commits.',
        filterPlaceholder: 'Filter by title, #number, or author…',
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
        tabTitle: 'GitHub',
        openPanel: '在右栏打开 GitHub 详情',
        openOnGitHub: '在 GitHub 中打开',
        openPrs: '在 GitHub 中打开 PR 列表',
        openIssues: '在 GitHub 中打开 Issues',
        openActions: '在 GitHub 中打开 Actions',
        refresh: '刷新 GitHub 状态',
        copyUrl: '复制链接',
        copyCommand: '复制',
        copied: '已复制到剪贴板',
        copyFailed: '复制失败',
        cite: '引用到输入框',
        cited: '已添加到输入框（未发送）',
        citeBusy: '输入框当前不可编辑，请稍后重试',
        viewDetails: '查看详情',
        rerunFailed: '重跑失败任务',
        rerunSent: '已触发重跑失败任务',
        rerunFailedErr: '重跑失败任务出错',
        retry: '重试',
        back: '返回',
        loading: '正在读取 GitHub 数据…',
        loadFailed: '读取 GitHub 数据失败',
        notLinked: '当前会话未关联 GitHub 仓库。',
        signInTitle: '登录 {host}',
        ghUnavailable: '宿主未安装 GitHub CLI (gh)',
        rateLimited: '已触发 GitHub API 速率限制',
        repoNotFound: '未找到对应的 GitHub 仓库',
        private: '私有',
        public: '公开',
        archived: '已归档',
        defaultBranch: '默认分支',
        currentBranch: '当前分支',
        stars: 'Star',
        forks: 'Fork',
        mentioned: '对话提及',
        mentionedShort: '提及',
        pullRequests: 'Pull Requests',
        issues: 'Issues',
        actions: 'Actions',
        commits: '提交',
        overview: '概览',
        latestRelease: '最新发布',
        release: '发布',
        releases: '发布',
        prerelease: '预发布',
        draft: '草稿',
        open: '打开',
        closed: '已关闭',
        merged: '已合并',
        approved: '已批准',
        changesRequested: '请求修改',
        reviewRequired: '待评审',
        checks: '检查',
        jobs: '任务',
        comments: '评论',
        assignees: '负责人',
        reviewers: '评审者',
        milestone: '里程碑',
        assets: '附件',
        noDescription: '暂无描述。',
        emptySection: '暂无打开的 PR、Issue 或近期构建',
        emptyMentions: '当前对话暂未提及 GitHub Issue、PR 或构建记录。',
        emptyPrs: '暂无打开的 Pull Request。',
        emptyIssues: '暂无打开的 Issue。',
        emptyRuns: '暂无近期工作流运行记录。',
        emptyCommits: '暂无近期提交。',
        filterPlaceholder: '按标题、编号或作者筛选…',
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

    const IconCommit = ({ size = 16, className }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', className, 'aria-hidden': true,
    },
    h('circle', { cx: 8, cy: 8, r: 2.5 }),
    h('path', { d: 'M2 8h3.5M10.5 8H14' }))

    const IconQuote = ({ size = 14 }) => h('svg', {
      width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    },
    h('path', { d: 'M3 4.5h10M3 8h7M3 11.5h5M11 10l2 2 2-2M13 8v4' }))

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

    function formatBytes(bytes) {
      if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

    function safeHexColor(hex) {
      if (typeof hex !== 'string') return null
      const clean = hex.replace(/^#/, '')
      return /^[0-9a-fA-F]{6}$/.test(clean) ? `#${clean}` : null
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

    function detailSpecForMention(item) {
      return {
        kind: item.kind,
        id: item.kind === 'run' ? String(item.id) : String(item.number),
        host: item.host,
        owner: item.owner,
        repo: item.repo,
      }
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

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs'],
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

        function openSidebar(params, dismissOverlay) {
          try {
            ctx.sidebarRight.openTab(TAB_KIND, params ? { params } : undefined)
            dismissOverlay?.()
          } catch (error) {
            console.error('[dsh-github-panel] open tab failed:', error)
          }
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

        function GitHubSection({ sessionId, useProjection, useConversation, useSession, inputActions, dismissOverlay, renderFactorySlot, t }) {
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
                onClick: () => openSidebar({ tab: 'overview' }, dismissOverlay),
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
                  { item: { id: 'panel', label: t('openPanel'), icon: h(IconGitHub, { size: 14 }) }, run: () => openSidebar({ tab: 'overview' }, dismissOverlay) },
                  { item: { id: 'refresh', label: t('refresh'), icon: h(IconRefreshOutlineRegular, { size: 14 }) }, run: () => void store?.refresh(true) },
                  { separator: true, id: 'sep-links' },
                  { item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(repoUrl) },
                  { item: { id: 'prs', label: t('openPrs'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(`${repoUrl}/pulls`) },
                  { item: { id: 'issues', label: t('openIssues'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(`${repoUrl}/issues`) },
                  { item: { id: 'actions', label: t('openActions'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(`${repoUrl}/actions`) },
                  { separator: true, id: 'sep-copy' },
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
                  h('button', {
                    type: 'button',
                    className: 'ghp-group-btn',
                    onClick: () => openSidebar({ tab: 'mentioned' }, dismissOverlay),
                  }, t('mentioned')),
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

                  const rowEl = h('div', { key, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => {
                        if (item.unresolved) {
                          openExternal(item.url)
                          return
                        }
                        openSidebar({ tab: 'mentioned', detail: detailSpecForMention(item) }, dismissOverlay)
                      },
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
                        ...(!item.unresolved ? [{
                          item: { id: 'detail', label: t('viewDetails'), icon: h(IconGitHub, { size: 14 }) },
                          run: () => openSidebar({ tab: 'mentioned', detail: detailSpecForMention(item) }, dismissOverlay),
                        }] : []),
                        ...(item.kind === 'run' && dotStateForRun(item.status, item.conclusion) === 'failed' ? [{
                          item: { id: 'rerun', label: t('rerunFailed'), icon: h(IconRefreshOutlineRegular, { size: 14 }) },
                          run: () => void triggerRerun(sessionId, item.id, item, store, t),
                        }] : []),
                        { item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, citeTextForMention(item), t) },
                        ...(item.url ? [{ item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(item.url) }] : []),
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
                    onClick: () => openSidebar({ tab: 'prs' }, dismissOverlay),
                  }, t('pullRequests')),
                  h('span', { className: 'ghp-count' }, data.pullRequestsTotal ?? prs.length)),
                ...shownPrs.map(pr => {
                  const prIconClass = prIconClassFor(pr)
                  const checkDot = pr.checksState ? dotStateForCheck(pr.checksState) : null
                  const rowEl = h('div', { key: `pr-${pr.number}`, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openSidebar({ tab: 'prs', detail: { kind: 'pr', id: String(pr.number) } }, dismissOverlay),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(IconPullRequest, { size: 16, className: prIconClass })),
                    h('span', { 'data-row-part': 'content' }, pr.title)),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-meta-inline' },
                      checkDot && h(StateDot, { state: checkDot, size: 7 }),
                      h('span', { className: 'ghp-num' }, `#${pr.number}`)),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: `#${pr.number}` }),
                      entries: [
                        { item: { id: 'detail', label: t('viewDetails'), icon: h(IconPullRequest, { size: 14 }) }, run: () => openSidebar({ tab: 'prs', detail: { kind: 'pr', id: String(pr.number) } }, dismissOverlay) },
                        { item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, `PR #${pr.number}: ${pr.title} (${pr.url})`, t) },
                        { item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(pr.url) },
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
                    onClick: () => openSidebar({ tab: 'issues' }, dismissOverlay),
                  }, t('issues')),
                  h('span', { className: 'ghp-count' }, data.issuesTotal ?? issues.length)),
                ...shownIssues.map(issue => {
                  const rowEl = h('div', { key: `issue-${issue.number}`, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openSidebar({ tab: 'issues', detail: { kind: 'issue', id: String(issue.number) } }, dismissOverlay),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(IconIssue, { size: 16, className: 'ghp-icon-open' })),
                    h('span', { 'data-row-part': 'content' }, issue.title)),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-num' }, `#${issue.number}`),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: `#${issue.number}` }),
                      entries: [
                        { item: { id: 'detail', label: t('viewDetails'), icon: h(IconIssue, { size: 14 }) }, run: () => openSidebar({ tab: 'issues', detail: { kind: 'issue', id: String(issue.number) } }, dismissOverlay) },
                        { item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, `Issue #${issue.number}: ${issue.title} (${issue.url})`, t) },
                        { item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(issue.url) },
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
                    onClick: () => openSidebar({ tab: 'actions' }, dismissOverlay),
                  }, t('actions')),
                  h('span', { className: 'ghp-count' }, runs.length)),
                ...shownRuns.map(run => {
                  const dot = dotStateForRun(run.status, run.conclusion)
                  const isFailed = dot === 'failed'
                  const rowEl = h('div', { key: `run-${run.id}`, 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openSidebar({ tab: 'actions', detail: { kind: 'run', id: String(run.id) } }, dismissOverlay),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(StateDot, { state: dot, size: 8 })),
                    h('span', { 'data-row-part': 'lines' },
                      h('span', { 'data-row-part': 'content' }, run.displayTitle),
                      h('span', { 'data-row-part': 'detail' }, [run.name, run.headBranch].filter(Boolean).join(' · ')))),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-num' }, formatAgo(run.updatedAt || run.createdAt, t)),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: run.displayTitle }),
                      entries: [
                        { item: { id: 'detail', label: t('viewDetails'), icon: h(IconGitHub, { size: 14 }) }, run: () => openSidebar({ tab: 'actions', detail: { kind: 'run', id: String(run.id) } }, dismissOverlay) },
                        ...(isFailed ? [{ item: { id: 'rerun', label: t('rerunFailed'), icon: h(IconRefreshOutlineRegular, { size: 14 }) }, run: () => void triggerRerun(sessionId, run.id, null, store, t) }] : []),
                        { item: { id: 'cite', label: t('cite'), icon: h(IconQuote, { size: 14 }) }, run: () => insertReference(inputActions, `GitHub Actions "${run.name}" (${run.displayTitle}): ${run.url}`, t) },
                        ...(run.url ? [{ item: { id: 'open', label: t('openOnGitHub'), icon: h(IconRightUpOutlineRegular, { size: 14 }) }, run: () => openExternal(run.url) }] : []),
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
                h('div', { className: 'ghp-group-head' }, h('span', null, t('latestRelease'))),
                h(HoverCard, {
                  grouped: true,
                  anchor: h('div', { 'data-session-panel-row': '' },
                    h('button', {
                      type: 'button',
                      'data-row-part': 'body',
                      onClick: () => openSidebar({ tab: 'overview', detail: { kind: 'release', id: latestRelease.tagName } }, dismissOverlay),
                    },
                    h('span', { 'data-row-part': 'icon', 'aria-hidden': true }, h(IconTag, { size: 16 })),
                    h('span', { 'data-row-part': 'content' }, latestRelease.name && latestRelease.name !== latestRelease.tagName
                      ? `${latestRelease.tagName} · ${latestRelease.name}` : latestRelease.tagName)),
                    h('span', { 'data-row-part': 'trailing', className: 'ghp-num' }, formatAgo(latestRelease.publishedAt, t)),
                    h('span', { 'data-row-part': 'menu' }, h(RowMenu, {
                      label: fmt(t('moreActions'), { name: latestRelease.tagName }),
                      entries: [
                        { item: { id: 'detail', label: t('viewDetails'), icon: h(IconTag, { size: 14 }) }, run: () => openSidebar({ tab: 'overview', detail: { kind: 'release', id: latestRelease.tagName } }, dismissOverlay) },
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

        function LabelChips({ labels }) {
          if (!Array.isArray(labels) || labels.length === 0) return null
          return h('div', { className: 'ghp-labels' }, labels.map(label => {
            const hex = safeHexColor(label.color)
            return h('span', { key: label.name, className: 'ghp-label' },
              hex && h('span', { className: 'ghp-label-dot', style: { background: hex } }),
              label.name)
          }))
        }

        function DetailView({ sessionId, detailReq, onBack, store, inputActions, t }) {
          const [state, setState] = React.useState({ loading: true, data: null, error: null })
          const [rerunning, setRerunning] = React.useState(false)

          const load = React.useCallback((force = false) => {
            let active = true
            setState(prev => ({ ...prev, loading: true, error: null }))
            const qs = new URLSearchParams({ sessionId, kind: detailReq.kind, id: detailReq.id })
            if (detailReq.owner && detailReq.repo) {
              qs.set('host', detailReq.host || 'github.com')
              qs.set('owner', detailReq.owner)
              qs.set('repo', detailReq.repo)
            }
            if (force) qs.set('refresh', '1')
            fetch(`github-panel/detail?${qs.toString()}`, { cache: 'no-store' })
              .then(async res => {
                const json = await res.json().catch(() => null)
                if (!res.ok || !json?.ok) throw new Error(json?.message || `HTTP ${res.status}`)
                return json.value
              })
              .then(value => { if (active) setState({ loading: false, data: value, error: null }) })
              .catch(err => { if (active) setState({ loading: false, data: null, error: err instanceof Error ? err.message : String(err) }) })
            return () => { active = false }
          }, [sessionId, detailReq.kind, detailReq.id, detailReq.host, detailReq.owner, detailReq.repo])

          React.useEffect(() => load(false), [load])

          const d = state.data
          const citeText = d?.kind === 'pr' ? `PR ${d.fullName ? `${d.fullName}` : ''}#${d.number}: ${d.title} (${d.url})`
            : d?.kind === 'issue' ? `Issue ${d.fullName ? `${d.fullName}` : ''}#${d.number}: ${d.title} (${d.url})`
              : d?.kind === 'run' ? `GitHub Actions "${d.name}" (${d.displayTitle}): ${d.url}`
                : d?.kind === 'release' ? `Release ${d.tagName}: ${d.url}`
                  : null
          const agentPrompt = d?.kind === 'pr'
            ? fmt(t('promptPr'), { ref: `${d.fullName || ''}#${d.number}`, title: d.title, url: d.url })
            : d?.kind === 'issue'
              ? fmt(t('promptIssue'), { ref: `${d.fullName || ''}#${d.number}`, title: d.title, url: d.url })
              : d?.kind === 'run'
                ? fmt(t('promptRun'), { name: d.name || 'Actions', title: d.displayTitle, url: d.url })
                : null
          const agentLabel = d?.kind === 'pr' ? t('askAgentPr') : d?.kind === 'issue' ? t('askAgentIssue') : t('askAgentRun')

          return h('div', { className: 'ghp-tab-body' },
            h('div', { className: 'ghp-detail-bar' },
              h(Button, {
                size: 'sm', variant: 'ghost',
                icon: h(IconChevronLeftOutlineRegular, { size: 14 }),
                onClick: onBack,
              }, t('back')),
              h('div', { className: 'ghp-detail-actions' },
                agentPrompt && inputActions && h(Button, {
                  size: 'sm', variant: 'primary',
                  onClick: () => insertReference(inputActions, agentPrompt, t),
                }, agentLabel),
                citeText && inputActions && h(Button, {
                  size: 'sm', variant: 'outline',
                  icon: h(IconQuote, { size: 14 }),
                  onClick: () => insertReference(inputActions, citeText, t),
                }, t('cite')),
                d?.url && h(Button, {
                  size: 'sm', variant: 'outline',
                  icon: h(IconCopyOutlineRegular, { size: 14 }),
                  onClick: () => void copyText(d.url, t),
                }, t('copyUrl')),
                d?.url && h(Button, {
                  size: 'sm', variant: 'outline',
                  icon: h(IconRightUpOutlineRegular, { size: 14 }),
                  onClick: () => openExternal(d.url),
                }, t('openOnGitHub')),
                h(Tooltip, { label: t('refresh') },
                  h(Button, {
                    size: 'sm', variant: 'ghost',
                    icon: h(IconRefreshOutlineRegular, { size: 14 }),
                    'aria-label': t('refresh'),
                    onClick: () => load(true),
                  })))),

            state.loading && h('div', { className: 'ghp-empty' }, t('loading')),
            !state.loading && state.error && h('div', { className: 'ghp-banner' },
              h('div', { className: 'ghp-banner-text' },
                h('strong', null, t('loadFailed')),
                h('span', { className: 'ghp-code' }, state.error)),
              h(Button, { size: 'sm', variant: 'outline', onClick: () => load(true) }, t('retry'))),

            !state.loading && d?.kind === 'pr' && h(React.Fragment, null,
              h('h2', { className: 'ghp-detail-title' }, `${d.title} `, h('span', { className: 'ghp-num' }, `#${d.number}`)),
              h('div', { className: 'ghp-item-sub' },
                d.fullName && h(Tag, { tone: 'quiet' }, d.fullName),
                h(Tag, { tone: d.isDraft ? 'quiet' : d.state === 'MERGED' ? 'accent' : d.state === 'OPEN' ? 'success' : 'danger' },
                  d.isDraft ? t('draft') : d.state === 'MERGED' ? t('merged') : d.state === 'OPEN' ? t('open') : t('closed')),
                h('span', null, `@${d.author}`),
                h('span', null, `${d.headRefName} → ${d.baseRefName}`),
                h('span', { className: 'ghp-add' }, `+${d.additions}`),
                h('span', { className: 'ghp-del' }, `−${d.deletions}`),
                h('span', null, fmt(t('filesChanged'), { n: d.changedFiles })),
                d.reviewDecision === 'APPROVED' && h(Tag, { tone: 'success' }, t('approved')),
                d.reviewDecision === 'CHANGES_REQUESTED' && h(Tag, { tone: 'danger' }, t('changesRequested')),
                d.reviewDecision === 'REVIEW_REQUIRED' && h(Tag, { tone: 'quiet' }, t('reviewRequired'))),
              h(LabelChips, { labels: d.labels }),
              d.reviewers?.length > 0 && h('div', { className: 'ghp-item-sub' }, `${t('reviewers')}: ${d.reviewers.join(', ')}`),
              d.checks?.length > 0 && h('div', { className: 'ghp-card' },
                h('strong', null, `${t('checks')} (${d.checks.length})`),
                h('div', { className: 'ghp-steps', style: { paddingLeft: 0 } }, d.checks.map((chk, idx) => {
                  const dot = dotStateForRun(chk.status, chk.conclusion)
                  return h('div', { key: `${chk.name}-${idx}`, className: 'ghp-step' },
                    h(StateDot, { state: dot, size: 7 }),
                    chk.url
                      ? h('a', { href: chk.url, target: '_blank', rel: 'noopener noreferrer', style: { color: 'inherit' } }, chk.name)
                      : h('span', null, chk.name))
                }))),
              h('div', { className: 'ghp-prose' },
                d.body ? h(MarkdownText, { text: d.body }) : h('span', { className: 'ghp-quiet' }, t('noDescription'))),
              d.comments?.length > 0 && h('div', { className: 'ghp-comments' },
                h('strong', null, `${t('comments')} (${d.commentsTotal})`),
                ...d.comments.map(comment => h('div', { key: comment.id, className: 'ghp-comment' },
                  h('div', { className: 'ghp-comment-head' },
                    h('span', { className: 'ghp-comment-author' }, `@${comment.author}`),
                    h('span', null, formatAgo(comment.createdAt, t))),
                  h(MarkdownText, { text: comment.body }))))),

            !state.loading && d?.kind === 'issue' && h(React.Fragment, null,
              h('h2', { className: 'ghp-detail-title' }, `${d.title} `, h('span', { className: 'ghp-num' }, `#${d.number}`)),
              h('div', { className: 'ghp-item-sub' },
                d.fullName && h(Tag, { tone: 'quiet' }, d.fullName),
                h(Tag, { tone: d.state === 'OPEN' ? 'success' : 'quiet' }, d.state === 'OPEN' ? t('open') : t('closed')),
                h('span', null, `@${d.author}`),
                h('span', null, fmt(t('updated'), { ago: formatAgo(d.updatedAt, t) })),
                d.milestone && h('span', null, `${t('milestone')}: ${d.milestone.title}`)),
              h(LabelChips, { labels: d.labels }),
              d.assignees?.length > 0 && h('div', { className: 'ghp-item-sub' }, `${t('assignees')}: ${d.assignees.map(a => `@${a}`).join(', ')}`),
              h('div', { className: 'ghp-prose' },
                d.body ? h(MarkdownText, { text: d.body }) : h('span', { className: 'ghp-quiet' }, t('noDescription'))),
              d.comments?.length > 0 && h('div', { className: 'ghp-comments' },
                h('strong', null, `${t('comments')} (${d.commentsTotal})`),
                ...d.comments.map(comment => h('div', { key: comment.id, className: 'ghp-comment' },
                  h('div', { className: 'ghp-comment-head' },
                    h('span', { className: 'ghp-comment-author' }, `@${comment.author}`),
                    h('span', null, formatAgo(comment.createdAt, t))),
                  h(MarkdownText, { text: comment.body }))))),

            !state.loading && d?.kind === 'run' && h(React.Fragment, null,
              h('h2', { className: 'ghp-detail-title' }, d.displayTitle),
              h('div', { className: 'ghp-item-sub' },
                d.fullName && h(Tag, { tone: 'quiet' }, d.fullName),
                h(StateDot, { state: dotStateForRun(d.status, d.conclusion), size: 8 }),
                h('span', null, statusLabelForRun(d.status, d.conclusion, t)),
                d.name && h('span', null, d.name),
                d.headBranch && h('span', null, d.headBranch),
                d.event && h('span', null, d.event),
                d.actor && h('span', null, `@${d.actor}`),
                d.headSha && h('span', { className: 'ghp-code' }, d.headSha)),
              dotStateForRun(d.status, d.conclusion) === 'failed' && h('div', null,
                h(Button, {
                  size: 'sm', variant: 'outline', disabled: rerunning,
                  icon: h(IconRefreshOutlineRegular, { size: 14 }),
                  onClick: async () => {
                    setRerunning(true)
                    const ok = await triggerRerun(sessionId, d.id, d, store, t)
                    setRerunning(false)
                    if (ok) load(true)
                  },
                }, t('rerunFailed'))),
              h('div', { className: 'ghp-jobs' },
                h('strong', null, `${t('jobs')} (${d.jobs?.length ?? 0})`),
                ...(d.jobs ?? []).map(job => {
                  const jDot = dotStateForRun(job.status, job.conclusion)
                  return h('div', { key: job.id, className: 'ghp-job' },
                    h('div', { className: 'ghp-job-head' },
                      h('span', { className: 'ghp-job-name' },
                        h(StateDot, { state: jDot, size: 8 }),
                        h('span', null, job.name)),
                      job.url && h(Button, {
                        size: 'sm', variant: 'ghost',
                        icon: h(IconRightUpOutlineRegular, { size: 13 }),
                        'aria-label': t('openOnGitHub'),
                        onClick: () => openExternal(job.url),
                      })),
                    job.steps?.length > 0 && h('ul', { className: 'ghp-steps' },
                      job.steps.map(step => h('li', { key: `${job.id}-${step.number}`, className: 'ghp-step' },
                        h(StateDot, { state: dotStateForRun(step.status, step.conclusion), size: 6 }),
                        h('span', null, step.name)))))
                }))),

            !state.loading && d?.kind === 'release' && h(React.Fragment, null,
              h('h2', { className: 'ghp-detail-title' }, d.name || d.tagName),
              h('div', { className: 'ghp-item-sub' },
                h(Tag, { tone: d.isPrerelease ? 'quiet' : 'accent' }, d.tagName),
                d.isPrerelease && h(Tag, { tone: 'quiet' }, t('prerelease')),
                d.author && h('span', null, `@${d.author}`),
                d.publishedAt && h('span', null, fmt(t('published'), { ago: formatAgo(d.publishedAt, t) }))),
              h('div', { className: 'ghp-prose' },
                d.body ? h(MarkdownText, { text: d.body }) : h('span', { className: 'ghp-quiet' }, t('noDescription'))),
              d.assets?.length > 0 && h('div', { className: 'ghp-card' },
                h('strong', null, `${t('assets')} (${d.assets.length})`),
                ...d.assets.map(asset => h('div', { key: asset.name, className: 'ghp-job-head' },
                  asset.url
                    ? h('a', { href: asset.url, target: '_blank', rel: 'noopener noreferrer', style: { color: 'inherit' } }, asset.name)
                    : h('span', null, asset.name),
                  h('span', { className: 'ghp-num' }, formatBytes(asset.size)))))))
        }

        function GitHubSidebarTab({ sessionId, useTabInfo, useProjection, useConversation, useSession, inputActions, t }) {
          const cwd = typeof useProjection === 'function' ? useProjection('workingDirectory') : undefined
          const activityKey = readActivityKey(useConversation, useSession)
          const { snap, store } = useOverview(registry, sessionId, cwd, activityKey)
          const tabInfo = typeof useTabInfo === 'function' ? useTabInfo() : null
          const nav = tabInfo?.tab?.navigation
          const [activeTab, setActiveTab] = React.useState('overview')
          const [detail, setDetail] = React.useState(null)
          const [query, setQuery] = React.useState('')
          const lastRev = React.useRef(-1)

          React.useEffect(() => {
            if (!nav || nav.revision === lastRev.current) return
            lastRev.current = nav.revision
            const params = nav.params
            if (params?.tab) setActiveTab(params.tab)
            if (params?.detail) setDetail(params.detail)
            else if (params?.tab) setDetail(null)
          }, [nav?.revision, nav?.params])

          const data = snap.data
          const mentions = data?.mentions ?? []
          const linked = Boolean(data?.linked)

          if (!snap.loaded && snap.loading) {
            return h('section', { className: 'ghp-tab', 'aria-label': t('tabTitle') },
              h('div', { className: 'ghp-empty' }, t('loading')))
          }
          if (!linked && mentions.length === 0) {
            return h('section', { className: 'ghp-tab', 'aria-label': t('tabTitle') },
              h('div', { className: 'ghp-empty' }, t('notLinked')))
          }

          const remote = data.remote
          const repo = data.repo
          const fullName = repo?.fullName || remote?.fullName || t('tabTitle')
          const repoUrl = repo?.url || remote?.url || ''
          const prs = data.pullRequests ?? []
          const issues = data.issues ?? []
          const runs = data.runs ?? []
          const commits = data.commits ?? []
          const needle = query.trim().toLowerCase()
          const matches = (...fields) => !needle || fields.some(f => String(f ?? '').toLowerCase().includes(needle))

          const effectiveTab = !linked ? 'mentioned' : (activeTab === 'mentioned' && mentions.length === 0 ? 'overview' : activeTab)
          const tabItems = linked
            ? [
              ...(mentions.length > 0 ? [{ id: 'ghp-t-mentioned', panelId: 'ghp-panel', value: 'mentioned', label: `${t('mentionedShort')} (${mentions.length})` }] : []),
              { id: 'ghp-t-overview', panelId: 'ghp-panel', value: 'overview', label: t('overview') },
              { id: 'ghp-t-prs', panelId: 'ghp-panel', value: 'prs', label: `${t('pullRequests')} (${data.pullRequestsTotal ?? prs.length})` },
              { id: 'ghp-t-issues', panelId: 'ghp-panel', value: 'issues', label: `${t('issues')} (${data.issuesTotal ?? issues.length})` },
              { id: 'ghp-t-actions', panelId: 'ghp-panel', value: 'actions', label: `${t('actions')} (${runs.length})` },
              { id: 'ghp-t-commits', panelId: 'ghp-panel', value: 'commits', label: t('commits') },
            ]
            : [{ id: 'ghp-t-mentioned', panelId: 'ghp-panel', value: 'mentioned', label: `${t('mentioned')} (${mentions.length})` }]

          return h('section', { className: 'ghp-tab', 'aria-label': fullName },
            h('div', { className: 'ghp-tab-head' },
              h('div', { className: 'ghp-tab-title-wrap' },
                h(IconGitHub, { size: 16 }),
                h('span', { className: 'ghp-tab-title', title: fullName }, fullName),
                repo?.isPrivate && h(Tag, { tone: 'quiet' }, t('private')),
                repo?.isArchived && h(Tag, { tone: 'quiet' }, t('archived'))),
              h('div', { className: 'ghp-tab-actions' },
                h(Tooltip, { label: t('refresh') },
                  h(Button, {
                    size: 'sm', variant: 'ghost',
                    icon: h(IconRefreshOutlineRegular, { size: 14 }),
                    'aria-label': t('refresh'),
                    disabled: snap.loading,
                    onClick: () => void store?.refresh(true),
                  })),
                repoUrl && h(Tooltip, { label: t('openOnGitHub') },
                  h(Button, {
                    size: 'sm', variant: 'ghost',
                    icon: h(IconRightUpOutlineRegular, { size: 14 }),
                    'aria-label': t('openOnGitHub'),
                    onClick: () => openExternal(repoUrl),
                  })))),

            !detail && tabItems.length > 1 && h('div', { className: 'ghp-tab-nav' },
              h(SegmentedTabs, {
                size: 'sm',
                label: t('tabTitle'),
                value: effectiveTab,
                onChange: next => { setActiveTab(next); setQuery('') },
                items: tabItems,
              })),

            detail
              ? h(DetailView, {
                sessionId,
                detailReq: detail,
                onBack: () => setDetail(null),
                store,
                inputActions,
                t,
              })
              : h('div', { id: 'ghp-panel', role: 'tabpanel', className: 'ghp-tab-body' },
                linked && data.authState !== 'ready' && effectiveTab !== 'mentioned' && h('div', { className: 'ghp-banner' },
                  h('div', { className: 'ghp-banner-text' },
                    h('strong', null, data.authState === 'unauthenticated' ? fmt(t('signInTitle'), { host: remote.host }) : t('loadFailed')),
                    h('span', { className: 'ghp-code' }, data.loginCommand || data.error || '')),
                  data.loginCommand
                    ? h(Button, { size: 'sm', variant: 'outline', onClick: () => void copyText(data.loginCommand, t) }, t('copyCommand'))
                    : h(Button, { size: 'sm', variant: 'outline', onClick: () => void store?.refresh(true) }, t('retry'))),

                effectiveTab !== 'overview' && h('div', { className: 'ghp-search' },
                  h(Input, {
                    value: query,
                    placeholder: t('filterPlaceholder'),
                    'aria-label': t('filterPlaceholder'),
                    onChange: e => setQuery(e.target.value),
                  })),

                effectiveTab === 'mentioned' && (() => {
                  const filtered = mentions.filter(item => matches(
                    item.title, item.displayTitle, item.fullName, item.number ? `#${item.number}` : '', item.author, item.name,
                  ))
                  if (filtered.length === 0) return h('div', { className: 'ghp-empty' }, t('emptyMentions'))
                  return h('ul', { className: 'ghp-list' }, filtered.map(item => {
                    const key = item.kind === 'run' ? `tab-m-run-${item.fullName}-${item.id}` : `tab-m-${item.kind}-${item.fullName}-${item.number}`
                    const title = item.kind === 'run' ? item.displayTitle : item.title
                    const iconEl = item.kind === 'pr'
                      ? h(IconPullRequest, { size: 16, className: prIconClassFor(item) })
                      : item.kind === 'issue'
                        ? h(IconIssue, { size: 16, className: issueIconClassFor(item) })
                        : h(StateDot, { state: dotStateForRun(item.status, item.conclusion), size: 8 })
                    return h('li', { key },
                      h('button', {
                        type: 'button',
                        className: 'ghp-item',
                        onClick: () => {
                          if (item.unresolved) openExternal(item.url)
                          else setDetail(detailSpecForMention(item))
                        },
                      },
                      h('span', { className: 'ghp-item-icon' }, iconEl),
                      h('span', { className: 'ghp-item-main' },
                        h('span', { className: 'ghp-item-top' },
                          h('span', { className: 'ghp-item-title' }, title),
                          h('span', { className: 'ghp-num' }, item.kind === 'run' ? formatAgo(item.updatedAt || item.createdAt, t) : `#${item.number}`)),
                        h('span', { className: 'ghp-item-sub' },
                          h('span', null, item.fullName),
                          !item.unresolved && h(Tag, { tone: 'quiet' }, itemStatusInfo(item, t).label),
                          item.author && h('span', null, `@${item.author}`),
                          item.updatedAt && h('span', null, formatAgo(item.updatedAt, t))),
                        h(LabelChips, { labels: item.labels }))))
                  }))
                })(),

                linked && data.authState === 'ready' && effectiveTab === 'overview' && h(React.Fragment, null,
                  h('div', { className: 'ghp-card' },
                    h('p', { className: 'ghp-desc' }, repo?.description || t('noDescription')),
                    h('div', { className: 'ghp-item-sub' },
                      repo?.defaultBranch && h('span', null, `${t('defaultBranch')}: ${repo.defaultBranch}`),
                      remote?.branch && h('span', null, `${t('currentBranch')}: ${remote.branch}`),
                      repo?.primaryLanguage && h('span', null, repo.primaryLanguage.name),
                      repo && h('span', null, `★ ${repo.stars} · ${t('forks')} ${repo.forks}`))),
                  h('div', { className: 'ghp-stats' },
                    mentions.length > 0 && h('button', { type: 'button', className: 'ghp-stat', onClick: () => setActiveTab('mentioned') },
                      h('span', { className: 'ghp-stat-val' }, mentions.length),
                      h('span', { className: 'ghp-stat-label' }, t('mentionedShort'))),
                    h('button', { type: 'button', className: 'ghp-stat', onClick: () => setActiveTab('prs') },
                      h('span', { className: 'ghp-stat-val' }, data.pullRequestsTotal ?? prs.length),
                      h('span', { className: 'ghp-stat-label' }, t('pullRequests'))),
                    h('button', { type: 'button', className: 'ghp-stat', onClick: () => setActiveTab('issues') },
                      h('span', { className: 'ghp-stat-val' }, data.issuesTotal ?? issues.length),
                      h('span', { className: 'ghp-stat-label' }, t('issues'))),
                    h('button', { type: 'button', className: 'ghp-stat', onClick: () => setActiveTab('actions') },
                      h('span', { className: 'ghp-stat-val' }, runs.length),
                      h('span', { className: 'ghp-stat-label' }, t('actions')))),
                  data.latestRelease && h('button', {
                    type: 'button',
                    className: 'ghp-item',
                    onClick: () => setDetail({ kind: 'release', id: data.latestRelease.tagName }),
                  },
                  h('span', { className: 'ghp-item-icon' }, h(IconTag, { size: 16 })),
                  h('span', { className: 'ghp-item-main' },
                    h('span', { className: 'ghp-item-top' },
                      h('span', { className: 'ghp-item-title' }, `${t('latestRelease')}: ${data.latestRelease.tagName}`),
                      h('span', { className: 'ghp-num' }, formatAgo(data.latestRelease.publishedAt, t))),
                    data.latestRelease.name && data.latestRelease.name !== data.latestRelease.tagName &&
                      h('span', { className: 'ghp-item-sub' }, data.latestRelease.name))),
                  commits.length > 0 && h('div', { className: 'ghp-card' },
                    h('strong', null, t('commits')),
                    h('div', { className: 'ghp-list' }, commits.slice(0, 5).map(commit =>
                      h('a', {
                        key: commit.oid,
                        href: commit.url,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'ghp-item',
                        style: { textDecoration: 'none' },
                      },
                      h('span', { className: 'ghp-item-icon' }, h(IconCommit, { size: 15 })),
                      h('span', { className: 'ghp-item-main' },
                        h('span', { className: 'ghp-item-top' },
                          h('span', { className: 'ghp-item-title' }, commit.headline),
                          h('span', { className: 'ghp-code' }, commit.shortOid)),
                        h('span', { className: 'ghp-item-sub' }, `@${commit.author} · ${formatAgo(commit.committedDate, t)}`))))))),

                linked && data.authState === 'ready' && effectiveTab === 'prs' && (() => {
                  const filtered = prs.filter(pr => matches(pr.title, `#${pr.number}`, pr.author, pr.headRefName))
                  if (filtered.length === 0) return h('div', { className: 'ghp-empty' }, t('emptyPrs'))
                  return h('ul', { className: 'ghp-list' }, filtered.map(pr => h('li', { key: pr.number },
                    h('button', {
                      type: 'button',
                      className: 'ghp-item',
                      onClick: () => setDetail({ kind: 'pr', id: String(pr.number) }),
                    },
                    h('span', { className: 'ghp-item-icon' }, h(IconPullRequest, { size: 16, className: prIconClassFor(pr) })),
                    h('span', { className: 'ghp-item-main' },
                      h('span', { className: 'ghp-item-top' },
                        h('span', { className: 'ghp-item-title' }, pr.title),
                        h('span', { className: 'ghp-num' }, `#${pr.number}`)),
                      h('span', { className: 'ghp-item-sub' },
                        pr.checksState && h(StateDot, { state: dotStateForCheck(pr.checksState), size: 7 }),
                        h('span', null, `@${pr.author}`),
                        h('span', null, `${pr.headRefName} → ${pr.baseRefName}`),
                        h('span', { className: 'ghp-add' }, `+${pr.additions}`),
                        h('span', { className: 'ghp-del' }, `−${pr.deletions}`),
                        h('span', null, formatAgo(pr.updatedAt, t))),
                      h(LabelChips, { labels: pr.labels }))))))
                })(),

                linked && data.authState === 'ready' && effectiveTab === 'issues' && (() => {
                  const filtered = issues.filter(issue => matches(issue.title, `#${issue.number}`, issue.author))
                  if (filtered.length === 0) return h('div', { className: 'ghp-empty' }, t('emptyIssues'))
                  return h('ul', { className: 'ghp-list' }, filtered.map(issue => h('li', { key: issue.number },
                    h('button', {
                      type: 'button',
                      className: 'ghp-item',
                      onClick: () => setDetail({ kind: 'issue', id: String(issue.number) }),
                    },
                    h('span', { className: 'ghp-item-icon' }, h(IconIssue, { size: 16, className: 'ghp-icon-open' })),
                    h('span', { className: 'ghp-item-main' },
                      h('span', { className: 'ghp-item-top' },
                        h('span', { className: 'ghp-item-title' }, issue.title),
                        h('span', { className: 'ghp-num' }, `#${issue.number}`)),
                      h('span', { className: 'ghp-item-sub' },
                        h('span', null, `@${issue.author}`),
                        issue.commentsCount > 0 && h('span', null, `${issue.commentsCount} ${t('comments')}`),
                        h('span', null, formatAgo(issue.updatedAt, t))),
                      h(LabelChips, { labels: issue.labels }))))))
                })(),

                linked && data.authState === 'ready' && effectiveTab === 'actions' && (() => {
                  const filtered = runs.filter(run => matches(run.displayTitle, run.name, run.headBranch, run.actor, run.event))
                  if (filtered.length === 0) return h('div', { className: 'ghp-empty' }, t('emptyRuns'))
                  return h('ul', { className: 'ghp-list' }, filtered.map(run => {
                    const dot = dotStateForRun(run.status, run.conclusion)
                    return h('li', { key: run.id },
                      h('button', {
                        type: 'button',
                        className: 'ghp-item',
                        onClick: () => setDetail({ kind: 'run', id: String(run.id) }),
                      },
                      h('span', { className: 'ghp-item-icon' }, h(StateDot, { state: dot, size: 8 })),
                      h('span', { className: 'ghp-item-main' },
                        h('span', { className: 'ghp-item-top' },
                          h('span', { className: 'ghp-item-title' }, run.displayTitle),
                          h('span', { className: 'ghp-num' }, formatAgo(run.updatedAt || run.createdAt, t))),
                        h('span', { className: 'ghp-item-sub' },
                          run.name && h('span', null, run.name),
                          run.headBranch && h('span', null, run.headBranch),
                          run.event && h('span', null, run.event),
                          run.actor && h('span', null, `@${run.actor}`)))))
                  }))
                })(),

                linked && data.authState === 'ready' && effectiveTab === 'commits' && (() => {
                  const filtered = commits.filter(c => matches(c.headline, c.shortOid, c.author))
                  if (filtered.length === 0) return h('div', { className: 'ghp-empty' }, t('emptyCommits'))
                  return h('ul', { className: 'ghp-list' }, filtered.map(commit => h('li', { key: commit.oid },
                    h('a', {
                      href: commit.url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'ghp-item',
                      style: { textDecoration: 'none' },
                    },
                    h('span', { className: 'ghp-item-icon' }, h(IconCommit, { size: 15 })),
                    h('span', { className: 'ghp-item-main' },
                      h('span', { className: 'ghp-item-top' },
                        h('span', { className: 'ghp-item-title' }, commit.headline),
                        h('span', { className: 'ghp-code' }, commit.shortOid)),
                      h('span', { className: 'ghp-item-sub' }, `@${commit.author} · ${formatAgo(commit.committedDate, t)}`))))))
                })()))
        }

        function TabTitle({ t }) {
          return h('span', { className: 'ghp-tab-chip' }, h(IconGitHub, { size: 14 }), h('span', null, t('tabTitle')))
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
            h('div', { className: 'ghp-item-sub' }, t('cfgHint')),
            h('textarea', { value: text, disabled: busy, onChange: e => setText(e.target.value) }),
            h('div', { className: 'ghp-cfg-foot' },
              h(Button, { size: 'sm', variant: 'primary', disabled: busy, onClick: () => void save() }, busy ? t('cfgSaving') : t('cfgSave')),
              status.text && h('span', { className: status.tone === 'err' ? 'ghp-del' : 'ghp-item-sub', role: 'status' }, status.text)))
        }

        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: TAB_ID,
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

        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: TAB_ID,
          kind: TAB_KIND,
          keepMounted: true,
          title: () => translate('tabTitle'),
        }), 'github-panel: right sidebar tab')

        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: TAB_ID,
          locale: NS,
        }, GitHubSidebarTab))

        ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab.title',
          key: TAB_ID,
          locale: NS,
        }, TabTitle))
      },
    }
  },
})
