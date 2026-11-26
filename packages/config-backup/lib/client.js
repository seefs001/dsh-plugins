window.__ModuleLoader__.load({
  id: 'dsh-config-backup',
  factory(require) {
    const React = require('react')
    const {
      Button, Checkbox, Input, Modal, StateDot, Switch, Tag,
      IconCheckOutlineRegular, IconChevronDownOutlineRegular, IconChevronRightOutlineRegular,
      IconInfoOutlineRegular, IconRefreshOutlineRegular, IconWarningTriangleOutlineRegular,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const h = React.createElement
    const NS = 'config-backup'

    const EN = {
      panel: 'Config backup',
      description: 'Export conversation-independent Host and plugin configs into a single portable file, and restore with diff preview onto installed plugins.',
      profileBadge: 'Profile: {name}',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      tabExport: 'Export backup',
      tabImport: 'Import & restore',
      loading: 'Scanning Host configs and storage domains…',
      loadFailed: 'Could not load backup inventory',
      statConfigs: 'Plugin configs',
      statDomains: 'Storage domains',
      statHomeFiles: 'Home files',
      statCredentials: 'Credentials',
      optionsTitle: 'Export options',
      optSecrets: 'Include plugin secret fields',
      optSecretsHint: 'Off by default. Secrets declared with role("secret") are stripped and preserved on target machines.',
      optCredentials: 'Include .credentials.yaml & .env',
      optCredentialsHint: 'Sensitive files are excluded unless explicitly enabled.',
      optNormalizeHome: 'Normalize home paths ({{$HOME}})',
      optNormalizeHomeHint: 'Replaces your home directory prefix so paths adapt across machines.',
      optPassphrase: 'Encryption passphrase (optional)',
      optPassphrasePlaceholder: 'Leave empty for plain JSON, or enter ≥ 4 chars for AES-256-GCM',
      optPassphraseConfirm: 'Confirm passphrase',
      passphraseMismatch: 'Passphrases do not match.',
      passphraseTooShort: 'Passphrase must be at least 4 characters.',
      unencryptedSecretWarn: 'Secrets or credential files are included without a passphrase. Set a passphrase before transferring this file.',
      sectionConfigs: 'Plugin & Host config overrides',
      sectionDomains: 'Host & plugin storage domains',
      sectionHomeFiles: 'Home-level files (~/.dsh)',
      sectionCredentials: 'Credential files (sensitive)',
      selectAll: 'Select all',
      selectDefault: 'Defaults',
      clearAll: 'Clear',
      emptySection: 'No items detected in this profile.',
      exportBtn: 'Export backup ({n})',
      exporting: 'Exporting…',
      exportDone: 'Exported {filename} ({size}) — {configs} configs, {domains} domains, {files} home files.',
      exportFailed: 'Export failed',
      keysCount: '{n} keys',
      secretBadge: '{n} secret',
      globalScope: 'global',
      recordsCount: '{n} records',
      excludedTables: 'excludes: {list}',
      oversized: '> 2 MB limit',
      catPlugin: 'Plugin',
      catHost: 'Host',
      catOptional: 'Optional',
      catOther: 'Other',
      note_rolesLibrary: 'Role library only (session selections excluded)',
      note_cheatSheetPins: 'Pinned skills and usage counts',
      note_piToolsPresets: 'Default tool presets',
      note_promptShortcuts: 'Saved prompt snippets',
      note_acpProviders: 'ACP CLI providers (sessions and chunks excluded)',
      note_paseoPairing: 'Paseo Hub pairing config (runs and events excluded)',
      note_workspacePaths: 'Saved workspace entries (local directory paths)',
      note_scheduleJobs: 'Scheduled jobs',
      note_sessionIds: 'Contains session IDs; usually unneeded across machines',
      note_unknownDomain: 'Third-party open storage domain',
      dropTitle: 'Select or drop a backup JSON file',
      dropHint: 'Only installed plugins and active storage domains in this profile will be restored.',
      chooseFile: 'Choose file',
      changeFile: 'Change file',
      invalidFile: 'Selected file is not valid JSON.',
      encryptedTitle: 'Encrypted backup file',
      encryptedHint: 'Enter the passphrase used during export to inspect differences.',
      unlockPlaceholder: 'Enter passphrase…',
      unlockBtn: 'Unlock & preview',
      unlocking: 'Decrypting…',
      previewFailed: 'Could not preview backup',
      sourceMeta: 'Source profile: {profile} · Exported: {time}',
      encryptedTag: 'Encrypted',
      redactedTag: 'Secrets redacted',
      tableModeLabel: 'Table records:',
      tableModeMerge: 'Merge (keep local extras)',
      tableModeReplace: 'Replace (match backup)',
      filterAll: 'All ({n})',
      filterActionable: 'Changed ({n})',
      filterUninstalled: 'Uninstalled ({n})',
      filterUnchanged: 'Unchanged ({n})',
      selectChanged: 'Select changed',
      statusNew: 'New',
      statusModified: 'Modified',
      statusUnchanged: 'Unchanged',
      statusUninstalled: 'Not installed · skipped',
      statusIncompatible: 'Incompatible · skipped',
      preservedSecrets: 'Keeps {n} local secret(s)',
      restartBadge: 'Restart advised',
      showDiff: 'Diff',
      hideDiff: 'Hide diff',
      diffTruncated: '…and {n} more changes',
      credMeta: 'Local {local} lines → Backup {backup} lines (contents hidden)',
      applyBtn: 'Apply selected ({n})',
      applying: 'Applying…',
      confirmTitle: 'Apply backup to profile “{profile}”?',
      confirmBody: 'This will update {configs} config overrides, {domains} storage domains, {files} home files, and {creds} credential files on this Host.',
      confirmReplaceWarn: 'Replace mode is active: local table records not present in the backup will be deleted.',
      confirmCredWarn: 'Credential files (.credentials.yaml / .env) will be overwritten.',
      confirmApply: 'Apply restore',
      cancel: 'Cancel',
      applyDone: 'Restore finished: {applied} applied, {skipped} skipped, {failed} failed.',
      applyFailed: 'Restore failed',
      restartNotice: 'Restart DSH Host to reload in-memory caches for: {items}',
      noDiffMatches: 'No items match the current filter.',
      linesCount: '{n} lines',
    }

    const ZH = {
      panel: '配置备份',
      description: '将 Host 与插件中对话无关的配置和数据导出为单个可迁移文件，支持差异预览并仅还原当前已装插件。',
      profileBadge: '当前 Profile：{name}',
      refresh: '刷新',
      refreshing: '刷新中…',
      tabExport: '导出备份',
      tabImport: '导入恢复',
      loading: '正在扫描 Host 配置与数据域…',
      loadFailed: '读取备份清单失败',
      statConfigs: '插件配置',
      statDomains: '数据域',
      statHomeFiles: '全局文件',
      statCredentials: '凭据文件',
      optionsTitle: '导出选项',
      optSecrets: '包含插件密钥字段',
      optSecretsHint: '默认关闭。声明为 role("secret") 的字段会被剥离，导入时保留目标机原有密钥。',
      optCredentials: '包含 .credentials.yaml 与 .env',
      optCredentialsHint: '高敏感凭据默认不导出，需手动开启。',
      optNormalizeHome: '主目录路径归一化（{{$HOME}}）',
      optNormalizeHomeHint: '替换本机主目录前缀，跨机器导入时自动展开为目标机路径。',
      optPassphrase: '加密口令（可选）',
      optPassphrasePlaceholder: '留空导出明文 JSON，输入 ≥ 4 位字符启用 AES-256-GCM 加密',
      optPassphraseConfirm: '确认口令',
      passphraseMismatch: '两次输入的口令不一致。',
      passphraseTooShort: '口令至少需要 4 个字符。',
      unencryptedSecretWarn: '当前已勾选密钥或凭据文件但未设置加密口令，跨机传输前建议加密。',
      sectionConfigs: '插件与宿主配置覆写（cordis.patch.yml）',
      sectionDomains: '宿主与插件数据域（storageDomain）',
      sectionHomeFiles: '全局文件（~/.dsh）',
      sectionCredentials: '凭据文件（敏感）',
      selectAll: '全选',
      selectDefault: '推荐项',
      clearAll: '清空',
      emptySection: '当前 profile 下没有可导出项。',
      exportBtn: '导出备份文件 ({n})',
      exporting: '正在导出…',
      exportDone: '已导出 {filename}（{size}）：{configs} 项配置、{domains} 个数据域、{files} 个全局文件。',
      exportFailed: '导出失败',
      keysCount: '{n} 个配置键',
      secretBadge: '含 {n} 项密钥',
      globalScope: 'global',
      recordsCount: '{n} 条记录',
      excludedTables: '已排除：{list}',
      oversized: '超过 2 MB 上限',
      catPlugin: '插件',
      catHost: '宿主',
      catOptional: '可选',
      catOther: '其他',
      note_rolesLibrary: '仅角色库（已排除按会话绑定表）',
      note_cheatSheetPins: '置顶技能与使用频次',
      note_piToolsPresets: '预设默认工具集',
      note_promptShortcuts: '快捷提示词库',
      note_acpProviders: 'ACP CLI 提供方配置（已排除会话与分片）',
      note_paseoPairing: 'Paseo Hub 配对配置（已排除运行日志）',
      note_workspacePaths: '已保存的工作区列表（含本地路径）',
      note_scheduleJobs: '定时任务配置',
      note_sessionIds: '包含会话 ID 映射，跨机器迁移通常不需要',
      note_unknownDomain: '第三方已打开的数据域',
      dropTitle: '选择或拖入备份 JSON 文件',
      dropHint: '仅还原当前 profile 中已安装的插件配置和已启用的数据域，未安装项自动跳过。',
      chooseFile: '选择文件',
      changeFile: '更换文件',
      invalidFile: '所选文件不是有效的 JSON。',
      encryptedTitle: '已加密的备份文件',
      encryptedHint: '输入导出时设置的口令以解密并预览差异。',
      unlockPlaceholder: '输入口令…',
      unlockBtn: '解密并预览',
      unlocking: '解密中…',
      previewFailed: '解析或预览备份失败',
      sourceMeta: '来源 Profile：{profile} · 导出时间：{time}',
      encryptedTag: '已加密',
      redactedTag: '密钥已脱敏',
      tableModeLabel: '表记录恢复方式：',
      tableModeMerge: '合并写入（保留本机额外记录）',
      tableModeReplace: '完全替换（与备份一致）',
      filterAll: '全部 ({n})',
      filterActionable: '有变更 ({n})',
      filterUninstalled: '未安装 ({n})',
      filterUnchanged: '无变化 ({n})',
      selectChanged: '选中变更项',
      statusNew: '新增',
      statusModified: '已修改',
      statusUnchanged: '无变化',
      statusUninstalled: '未安装 · 跳过',
      statusIncompatible: '版本不兼容 · 跳过',
      preservedSecrets: '将保留本机 {n} 项密钥',
      restartBadge: '建议重启',
      showDiff: '查看差异',
      hideDiff: '收起差异',
      diffTruncated: '…其余 {n} 项变更已折叠',
      credMeta: '本机 {local} 行 → 备份 {backup} 行（敏感内容不回显）',
      applyBtn: '应用所选恢复 ({n})',
      applying: '正在恢复…',
      confirmTitle: '确认将备份恢复到 “{profile}”？',
      confirmBody: '本次将写入 {configs} 项插件配置、{domains} 个数据域、{files} 个全局文件和 {creds} 个凭据文件。',
      confirmReplaceWarn: '当前为“完全替换”模式：数据表中未出现在备份里的本机记录将被删除。',
      confirmCredWarn: '将覆盖本机凭据文件（.credentials.yaml / .env）。',
      confirmApply: '确认恢复',
      cancel: '取消',
      applyDone: '恢复完成：成功 {applied} 项，跳过 {skipped} 项，失败 {failed} 项。',
      applyFailed: '恢复失败',
      restartNotice: '以下项目存在内存缓存，建议重启 DSH Host 使全部状态同步：{items}',
      noDiffMatches: '当前筛选条件下没有匹配项。',
      linesCount: '{n} 行',
    }

    const useSource = source => React.useSyncExternalStore(
      fn => source.subscribe(fn), () => source.getSnapshot())

    function IconArchive({ size = 16 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('rect', { x: 3, y: 4, width: 18, height: 4, rx: 1 }),
        h('path', { d: 'M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8' }),
        h('path', { d: 'M10 12h4' }))
    }

    function IconDownload({ size = 14 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M12 3v12m0 0-4-4m4 4 4-4' }),
        h('path', { d: 'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' }))
    }

    function IconUpload({ size = 14 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M12 15V3m0 0-4 4m4-4 4 4' }),
        h('path', { d: 'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' }))
    }

    function IconLock({ size = 14 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('rect', { x: 5, y: 11, width: 14, height: 10, rx: 2 }),
        h('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }))
    }

    function formatBytes(bytes) {
      if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes ?? 0} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    function formatTime(iso) {
      if (!iso) return '—'
      try {
        return new Date(iso).toLocaleString()
      } catch {
        return iso
      }
    }

    const CSS = `
.cb-page{container-type:inline-size;height:100%;overflow-y:auto;overscroll-behavior:contain;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.cb-page *,.cb-page *::before,.cb-page *::after{box-sizing:border-box}
.cb-page :focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.cb-inner{display:flex;flex-direction:column;gap:18px;width:min(100%,1080px);margin:0 auto;padding:28px clamp(20px,3.5vw,44px) 60px}
[data-platform=darwin] .cb-inner{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
@media (max-width:767px){.cb-inner{padding:20px 16px 48px}[data-platform=darwin] .cb-inner{padding-top:calc(20px + var(--dsh-frame-top-clearance,0px))}}
.cb-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
.cb-head-copy{display:flex;flex-direction:column;gap:4px;flex:1 1 300px;min-width:0}
.cb-title-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cb-title{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.01em}
.cb-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.cb-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cb-tabs{display:inline-flex;align-items:center;gap:4px;padding:3px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);align-self:flex-start}
.cb-tab{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border:none;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-weight:500;cursor:pointer;transition:background-color .15s,color .15s}
@media (hover:hover){.cb-tab:hover:not([aria-selected=true]){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.cb-tab[aria-selected=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.08)}
.cb-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
@container (max-width:680px){.cb-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
.cb-stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1)}
.cb-stat-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.cb-stat-val{font-size:20px;line-height:26px;font-weight:600;font-variant-numeric:tabular-nums}
.cb-banner{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.cb-banner>svg{flex:none;margin-top:2px}
.cb-banner-text{flex:1;min-width:0;overflow-wrap:anywhere}
.cb-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 7%,var(--dsw-alias-bg-layer-1))}
.cb-banner[data-tone=warn]{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 32%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 8%,var(--dsw-alias-bg-layer-1))}
.cb-banner[data-tone=warn]>svg{color:var(--dsw-alias-state-warn-primary)}
.cb-banner[data-tone=success]{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 32%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 8%,var(--dsw-alias-bg-layer-1))}
.cb-banner[data-tone=success]>svg{color:var(--dsw-alias-state-success-primary)}
.cb-card{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1)}
.cb-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.cb-card-title{margin:0;font-size:14px;line-height:20px;font-weight:600}
.cb-card-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.cb-opt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@container (max-width:680px){.cb-opt-grid{grid-template-columns:1fr}}
.cb-opt{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base)}
.cb-opt-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
.cb-opt-label{font-size:13px;font-weight:500}
.cb-opt-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.cb-pass-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@container (max-width:640px){.cb-pass-row{grid-template-columns:1fr}}
.cb-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.cb-row{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);transition:border-color .15s}
.cb-row[data-selected=true]{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 42%,var(--dsw-alias-border-l2))}
.cb-row[data-disabled=true]{opacity:.68}
.cb-row-main{display:flex;align-items:flex-start;gap:10px}
.cb-row-copy{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
.cb-row-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.cb-row-name{font-weight:600;word-break:break-word}
.cb-row-sub{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.cb-row-right{display:flex;align-items:center;gap:8px;flex:none}
.cb-mono{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px}
.cb-footer-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 16px max(12px,env(safe-area-inset-bottom));border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1);position:sticky;bottom:0;z-index:2}
@container (max-width:600px){.cb-footer-bar{padding:10px 12px max(10px,env(safe-area-inset-bottom));justify-content:flex-end}.cb-footer-hint{display:none}}
.cb-dropzone{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:34px 20px;border:1.5px dashed var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1);text-align:center;cursor:pointer;transition:border-color .15s,background-color .15s}
.cb-dropzone[data-over=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 6%,var(--dsw-alias-bg-layer-1))}
.cb-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.cb-pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.cb-pill{padding:4px 10px;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;transition:background-color .15s,color .15s}
@media (hover:hover){.cb-pill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.cb-pill[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));font-weight:500}
.cb-mode{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.cb-select{height:30px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}
@media (pointer:coarse){.cb-select{font-size:16px;height:36px;min-height:36px}}
.cb-diff-box{margin-left:26px;padding:8px 10px;border-radius:var(--dsw-radius-sm,6px);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:4px;max-height:260px;overflow:auto}
@container (max-width:560px){.cb-diff-box{margin-left:0}}
.cb-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.cb-diff-line{display:flex;align-items:baseline;gap:8px;font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px;line-height:16px;white-space:pre-wrap;word-break:break-all}
.cb-diff-line[data-kind=add]{color:var(--dsw-alias-state-success-primary)}
.cb-diff-line[data-kind=remove]{color:var(--dsw-alias-state-error-primary)}
.cb-diff-line[data-kind=change]{color:var(--dsw-alias-state-warn-primary)}
.cb-diff-path{font-weight:600;color:var(--dsw-alias-label-primary)}
.cb-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary)}
.cb-unlock{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cb-unlock-input{flex:1 1 240px;min-width:0}
.cb-results{display:flex;flex-direction:column;gap:4px;margin-top:6px}
.cb-result-line{display:flex;align-items:center;gap:8px;font-size:12px}
`

    async function apiJson(path, options) {
      const response = await fetch(path, {
        cache: 'no-store',
        headers: { accept: 'application/json', ...(options?.body ? { 'content-type': 'application/json' } : {}) },
        ...options,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const err = new Error(data?.message || `HTTP ${response.status}`)
        err.code = data?.code || `HTTP_${response.status}`
        throw err
      }
      return data
    }

    return {
      name: 'dsh-config-backup',
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'config-backup: locale')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, 'config-backup: styles')

        const t = ctx.locale.bind(NS)
        const tf = (key, vars) => t(key, vars)

        function statusTagTone(status) {
          if (status === 'new') return 'success'
          if (status === 'modified') return 'warning'
          if (status === 'incompatible') return 'danger'
          return 'outline'
        }

        function statusLabel(status) {
          if (status === 'new') return t('statusNew')
          if (status === 'modified') return t('statusModified')
          if (status === 'unchanged') return t('statusUnchanged')
          if (status === 'uninstalled') return t('statusUninstalled')
          return t('statusIncompatible')
        }

        function ConfigBackupPage() {
          useSource(ctx.locale)
          const [tab, setTab] = React.useState('export')

          const [inventory, setInventory] = React.useState(null)
          const [loadingInv, setLoadingInv] = React.useState(false)
          const [invError, setInvError] = React.useState('')

          const [selConfigs, setSelConfigs] = React.useState(() => new Set())
          const [selDomains, setSelDomains] = React.useState(() => new Set())
          const [selHomeFiles, setSelHomeFiles] = React.useState(() => new Set())
          const [selCredentials, setSelCredentials] = React.useState(() => new Set())
          const [includeSecrets, setIncludeSecrets] = React.useState(false)
          const [includeCredentials, setIncludeCredentials] = React.useState(false)
          const [normalizeHome, setNormalizeHome] = React.useState(true)
          const [passphrase, setPassphrase] = React.useState('')
          const [passphraseConfirm, setPassphraseConfirm] = React.useState('')
          const [exporting, setExporting] = React.useState(false)
          const [exportNotice, setExportNotice] = React.useState(null)

          const fileInputRef = React.useRef(null)
          const [dragOver, setDragOver] = React.useState(false)
          const [importFilename, setImportFilename] = React.useState('')
          const [rawBundle, setRawBundle] = React.useState(null)
          const [needsUnlock, setNeedsUnlock] = React.useState(false)
          const [unlockPass, setUnlockPass] = React.useState('')
          const [tableMode, setTableMode] = React.useState('merge')
          const [preview, setPreview] = React.useState(null)
          const [previewLoading, setPreviewLoading] = React.useState(false)
          const [importError, setImportError] = React.useState('')
          const [importFilter, setImportFilter] = React.useState('all')
          const [expanded, setExpanded] = React.useState(() => new Set())
          const [impConfigs, setImpConfigs] = React.useState(() => new Set())
          const [impDomains, setImpDomains] = React.useState(() => new Set())
          const [impHomeFiles, setImpHomeFiles] = React.useState(() => new Set())
          const [impCredentials, setImpCredentials] = React.useState(() => new Set())
          const [confirmOpen, setConfirmOpen] = React.useState(false)
          const [applying, setApplying] = React.useState(false)
          const [applyResult, setApplyResult] = React.useState(null)

          const loadInventory = React.useCallback(async () => {
            setLoadingInv(true)
            setInvError('')
            try {
              const data = await apiJson('config-backup/inventory')
              setInventory(data)
              setSelConfigs(new Set(data.configs.filter(i => i.defaultSelected).map(i => i.id)))
              setSelDomains(new Set(data.domains.filter(i => i.defaultSelected).map(i => i.name)))
              setSelHomeFiles(new Set(data.homeFiles.filter(i => i.defaultSelected).map(i => i.id)))
              setSelCredentials(new Set())
            } catch (error) {
              setInvError(`${t('loadFailed')}: ${error.message}`)
            } finally {
              setLoadingInv(false)
            }
          }, [])

          React.useEffect(() => {
            void loadInventory()
          }, [loadInventory])

          const toggleSet = (setter, key, checked) => {
            setter(prev => {
              const next = new Set(prev)
              if (checked) next.add(key)
              else next.delete(key)
              return next
            })
          }

          const selectedExportCount = selConfigs.size + selDomains.size + selHomeFiles.size + (includeCredentials ? selCredentials.size : 0)

          const runExport = async () => {
            setExportNotice(null)
            if (passphrase.length > 0 && passphrase.length < 4) {
              setExportNotice({ tone: 'error', text: t('passphraseTooShort') })
              return
            }
            if (passphrase.length > 0 && passphrase !== passphraseConfirm) {
              setExportNotice({ tone: 'error', text: t('passphraseMismatch') })
              return
            }
            setExporting(true)
            try {
              const data = await apiJson('config-backup/export', {
                method: 'POST',
                body: JSON.stringify({
                  configIds: [...selConfigs],
                  domainNames: [...selDomains],
                  homeFileIds: [...selHomeFiles],
                  credentialIds: includeCredentials ? [...selCredentials] : [],
                  includeSecrets,
                  includeCredentials,
                  normalizeHome,
                  passphrase,
                }),
              })
              const blob = new Blob([`${JSON.stringify(data.bundle, null, 2)}\n`], { type: 'application/json;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = data.filename
              document.body.appendChild(link)
              link.click()
              link.remove()
              setTimeout(() => URL.revokeObjectURL(url), 1000)
              setExportNotice({
                tone: 'success',
                text: tf('exportDone', {
                  filename: data.filename,
                  size: formatBytes(data.bytes),
                  configs: data.stats.configs,
                  domains: data.stats.domains,
                  files: data.stats.homeFiles,
                }),
              })
            } catch (error) {
              setExportNotice({ tone: 'error', text: `${t('exportFailed')}: ${error.message}` })
            } finally {
              setExporting(false)
            }
          }

          const fetchPreview = React.useCallback(async (bundleObj, pass, mode, opts = {}) => {
            setPreviewLoading(true)
            setImportError('')
            if (!opts.keepApplyResult) setApplyResult(null)
            try {
              const data = await apiJson('config-backup/preview', {
                method: 'POST',
                body: JSON.stringify({ bundle: bundleObj, passphrase: pass, tableMode: mode }),
              })
              setPreview(data)
              setNeedsUnlock(false)
              setImpConfigs(new Set(data.configs.filter(i => i.defaultSelected).map(i => i.id)))
              setImpDomains(new Set(data.domains.filter(i => i.defaultSelected).map(i => i.name)))
              setImpHomeFiles(new Set(data.homeFiles.filter(i => i.defaultSelected).map(i => i.id)))
              setImpCredentials(new Set())
              setExpanded(new Set())
            } catch (error) {
              if (error.code === 'PASSPHRASE_REQUIRED' || error.code === 'WRONG_PASSPHRASE') {
                setNeedsUnlock(true)
              }
              setImportError(`${t('previewFailed')}: ${error.message}`)
            } finally {
              setPreviewLoading(false)
            }
          }, [])

          const handleBackupFile = async file => {
            if (!file) return
            setImportError('')
            setApplyResult(null)
            setPreview(null)
            setUnlockPass('')
            setImportFilename(file.name)
            let parsed
            try {
              parsed = JSON.parse(await file.text())
            } catch {
              setImportError(t('invalidFile'))
              setRawBundle(null)
              setNeedsUnlock(false)
              return
            }
            setRawBundle(parsed)
            if (parsed?.encrypted === true) {
              setNeedsUnlock(true)
              return
            }
            setNeedsUnlock(false)
            await fetchPreview(parsed, '', tableMode)
          }

          const handleTableModeChange = async nextMode => {
            setTableMode(nextMode)
            if (rawBundle && preview) {
              await fetchPreview(rawBundle, unlockPass, nextMode)
            }
          }

          const selectedImportCount = impConfigs.size + impDomains.size + impHomeFiles.size + impCredentials.size

          const runApply = async () => {
            if (!rawBundle) return
            setConfirmOpen(false)
            setApplying(true)
            setImportError('')
            try {
              const result = await apiJson('config-backup/apply', {
                method: 'POST',
                body: JSON.stringify({
                  bundle: rawBundle,
                  passphrase: unlockPass,
                  tableMode,
                  configIds: [...impConfigs],
                  domainNames: [...impDomains],
                  homeFileIds: [...impHomeFiles],
                  credentialIds: [...impCredentials],
                }),
              })
              setApplyResult(result)
              await Promise.all([
                loadInventory(),
                fetchPreview(rawBundle, unlockPass, tableMode, { keepApplyResult: true }),
              ])
            } catch (error) {
              setImportError(`${t('applyFailed')}: ${error.message}`)
            } finally {
              setApplying(false)
            }
          }

          const matchesFilter = item => {
            if (importFilter === 'all') return true
            if (importFilter === 'actionable') return item.status === 'new' || item.status === 'modified'
            if (importFilter === 'uninstalled') return item.status === 'uninstalled' || item.status === 'incompatible'
            return item.status === 'unchanged'
          }

          const toggleExpand = key => {
            setExpanded(prev => {
              const next = new Set(prev)
              if (next.has(key)) next.delete(key)
              else next.add(key)
              return next
            })
          }

          const renderDiffLines = (changes, truncated) => h('div', { className: 'cb-diff-box' },
            changes.map((entry, idx) => h('div', { key: `${entry.path}-${idx}`, className: 'cb-diff-line', 'data-kind': entry.kind },
              h('span', null, entry.kind === 'add' ? '+' : entry.kind === 'remove' ? '-' : '~'),
              h('span', { className: 'cb-diff-path' }, entry.path),
              entry.kind === 'change'
                ? h('span', null, `${entry.before} → ${entry.after}`)
                : h('span', null, entry.kind === 'add' ? entry.after : entry.before))),
            truncated > 0 ? h('div', { className: 'cb-note' }, tf('diffTruncated', { n: truncated })) : null)

          const renderTextDiff = (lines, truncated) => h('div', { className: 'cb-diff-box' },
            lines.map((entry, idx) => h('div', { key: idx, className: 'cb-diff-line', 'data-kind': entry.kind },
              h('span', null, entry.kind === 'add' ? '+' : '-'),
              h('span', null, entry.line))),
            truncated > 0 ? h('div', { className: 'cb-note' }, tf('diffTruncated', { n: truncated })) : null)

          const renderExportTab = () => {
            if (loadingInv && !inventory) {
              return h('div', { className: 'cb-empty', role: 'status' },
                h(StateDot, { state: 'ongoing', size: 16 }),
                h('p', null, t('loading')))
            }
            if (!inventory) return null
            const showUnencryptedWarn = (includeSecrets || (includeCredentials && selCredentials.size > 0)) && passphrase.length === 0

            return h(React.Fragment, null,
              h('div', { className: 'cb-stats' },
                h('div', { className: 'cb-stat' },
                  h('span', { className: 'cb-stat-label' }, t('statConfigs')),
                  h('span', { className: 'cb-stat-val' }, `${selConfigs.size} / ${inventory.configs.length}`)),
                h('div', { className: 'cb-stat' },
                  h('span', { className: 'cb-stat-label' }, t('statDomains')),
                  h('span', { className: 'cb-stat-val' }, `${selDomains.size} / ${inventory.domains.length}`)),
                h('div', { className: 'cb-stat' },
                  h('span', { className: 'cb-stat-label' }, t('statHomeFiles')),
                  h('span', { className: 'cb-stat-val' }, `${selHomeFiles.size} / ${inventory.homeFiles.length}`)),
                h('div', { className: 'cb-stat' },
                  h('span', { className: 'cb-stat-label' }, t('statCredentials')),
                  h('span', { className: 'cb-stat-val' }, `${includeCredentials ? selCredentials.size : 0} / ${inventory.credentials.length}`))),

              h('section', { className: 'cb-card' },
                h('div', { className: 'cb-card-head' },
                  h('h2', { className: 'cb-card-title' }, t('optionsTitle'))),
                h('div', { className: 'cb-opt-grid' },
                  h('div', { className: 'cb-opt' },
                    h('div', { className: 'cb-opt-copy' },
                      h('span', { className: 'cb-opt-label' }, t('optNormalizeHome')),
                      h('span', { className: 'cb-opt-hint' }, t('optNormalizeHomeHint'))),
                    h(Switch, { checked: normalizeHome, label: t('optNormalizeHome'), onChange: setNormalizeHome })),
                  h('div', { className: 'cb-opt' },
                    h('div', { className: 'cb-opt-copy' },
                      h('span', { className: 'cb-opt-label' }, t('optSecrets')),
                      h('span', { className: 'cb-opt-hint' }, t('optSecretsHint'))),
                    h(Switch, { checked: includeSecrets, label: t('optSecrets'), onChange: setIncludeSecrets })),
                  h('div', { className: 'cb-opt' },
                    h('div', { className: 'cb-opt-copy' },
                      h('span', { className: 'cb-opt-label' }, t('optCredentials')),
                      h('span', { className: 'cb-opt-hint' }, t('optCredentialsHint'))),
                    h(Switch, {
                      checked: includeCredentials,
                      label: t('optCredentials'),
                      onChange: next => {
                        setIncludeCredentials(next)
                        if (next) setSelCredentials(new Set(inventory.credentials.map(i => i.id)))
                        else setSelCredentials(new Set())
                      },
                    }))),
                h('div', { className: 'cb-pass-row' },
                  h(Input, {
                    type: 'password',
                    value: passphrase,
                    placeholder: t('optPassphrasePlaceholder'),
                    'aria-label': t('optPassphrase'),
                    onChange: event => setPassphrase(event.target.value),
                  }),
                  passphrase.length > 0
                    ? h(Input, {
                      type: 'password',
                      value: passphraseConfirm,
                      placeholder: t('optPassphraseConfirm'),
                      'aria-label': t('optPassphraseConfirm'),
                      onChange: event => setPassphraseConfirm(event.target.value),
                    })
                    : null),
                showUnencryptedWarn
                  ? h('div', { className: 'cb-banner', 'data-tone': 'warn' },
                    h(IconWarningTriangleOutlineRegular, { size: 15 }),
                    h('span', { className: 'cb-banner-text' }, t('unencryptedSecretWarn')))
                  : null),

              h('section', { className: 'cb-card' },
                h('div', { className: 'cb-card-head' },
                  h('h2', { className: 'cb-card-title' }, t('sectionConfigs')),
                  h('div', { className: 'cb-card-actions' },
                    h(Button, { size: 'sm', variant: 'ghost', onClick: () => setSelConfigs(new Set(inventory.configs.map(i => i.id))) }, t('selectAll')),
                    h(Button, { size: 'sm', variant: 'ghost', onClick: () => setSelConfigs(new Set()) }, t('clearAll')))),
                inventory.configs.length === 0
                  ? h('p', { className: 'cb-note' }, t('emptySection'))
                  : h('ul', { className: 'cb-list' }, inventory.configs.map(item => {
                    const checked = selConfigs.has(item.id)
                    return h('li', { key: item.id, className: 'cb-row', 'data-selected': checked || undefined },
                      h('div', { className: 'cb-row-main' },
                        h(Checkbox, { checked, label: h('span', { className: 'cb-sr-only' }, item.id), onChange: next => toggleSet(setSelConfigs, item.id, next) }),
                        h('div', { className: 'cb-row-copy' },
                          h('div', { className: 'cb-row-top' },
                            h('span', { className: 'cb-row-name' }, item.id),
                            h(Tag, { tone: 'quiet' }, tf('keysCount', { n: item.keys.length })),
                            item.secretCount > 0 ? h(Tag, { tone: 'warning' }, tf('secretBadge', { n: item.secretCount })) : null),
                          h('div', { className: 'cb-row-sub cb-mono' }, `${item.name} · ${item.keys.join(', ')}`)),
                        h('span', { className: 'cb-note' }, formatBytes(item.bytes))))
                  }))),

              h('section', { className: 'cb-card' },
                h('div', { className: 'cb-card-head' },
                  h('h2', { className: 'cb-card-title' }, t('sectionDomains')),
                  h('div', { className: 'cb-card-actions' },
                    h(Button, { size: 'sm', variant: 'ghost', onClick: () => setSelDomains(new Set(inventory.domains.filter(i => i.defaultSelected).map(i => i.name))) }, t('selectDefault')),
                    h(Button, { size: 'sm', variant: 'ghost', onClick: () => setSelDomains(new Set(inventory.domains.filter(i => !i.oversized).map(i => i.name))) }, t('selectAll')),
                    h(Button, { size: 'sm', variant: 'ghost', onClick: () => setSelDomains(new Set()) }, t('clearAll')))),
                inventory.domains.length === 0
                  ? h('p', { className: 'cb-note' }, t('emptySection'))
                  : h('ul', { className: 'cb-list' }, inventory.domains.map(item => {
                    const checked = selDomains.has(item.name)
                    const scopes = [
                      ...(item.hasGlobal ? [t('globalScope')] : []),
                      ...item.includedTables,
                    ]
                    const catKey = item.category === 'plugin' ? 'catPlugin' : item.category === 'host' ? 'catHost' : item.category === 'optional' ? 'catOptional' : 'catOther'
                    return h('li', { key: item.name, className: 'cb-row', 'data-selected': checked || undefined, 'data-disabled': item.oversized || undefined },
                      h('div', { className: 'cb-row-main' },
                        h(Checkbox, { checked, disabled: item.oversized, label: h('span', { className: 'cb-sr-only' }, item.name), onChange: next => toggleSet(setSelDomains, item.name, next) }),
                        h('div', { className: 'cb-row-copy' },
                          h('div', { className: 'cb-row-top' },
                            h('span', { className: 'cb-row-name' }, item.name),
                            h(Tag, { tone: item.category === 'optional' ? 'outline' : 'quiet' }, t(catKey)),
                            scopes.length > 0 ? h(Tag, { tone: 'quiet' }, scopes.join(' + ')) : null,
                            item.recordCount > 0 ? h(Tag, { tone: 'quiet' }, tf('recordsCount', { n: item.recordCount })) : null,
                            item.oversized ? h(Tag, { tone: 'danger' }, t('oversized')) : null),
                          h('div', { className: 'cb-row-sub' },
                            [
                              item.noteKey ? t(`note_${item.noteKey}`) : null,
                              item.excludedTables.length > 0 ? tf('excludedTables', { list: item.excludedTables.join(', ') }) : null,
                            ].filter(Boolean).join(' · '))),
                        h('span', { className: 'cb-note' }, formatBytes(item.bytes))))
                  }))),

              h('section', { className: 'cb-card' },
                h('div', { className: 'cb-card-head' },
                  h('h2', { className: 'cb-card-title' }, t('sectionHomeFiles')),
                  h('div', { className: 'cb-card-actions' },
                    h(Button, { size: 'sm', variant: 'ghost', onClick: () => setSelHomeFiles(new Set(inventory.homeFiles.map(i => i.id))) }, t('selectAll')),
                    h(Button, { size: 'sm', variant: 'ghost', onClick: () => setSelHomeFiles(new Set()) }, t('clearAll')))),
                inventory.homeFiles.length === 0
                  ? h('p', { className: 'cb-note' }, t('emptySection'))
                  : h('ul', { className: 'cb-list' }, inventory.homeFiles.map(item => {
                    const checked = selHomeFiles.has(item.id)
                    return h('li', { key: item.id, className: 'cb-row', 'data-selected': checked || undefined },
                      h('div', { className: 'cb-row-main' },
                        h(Checkbox, { checked, label: h('span', { className: 'cb-sr-only' }, `~/.dsh/${item.relPath}`), onChange: next => toggleSet(setSelHomeFiles, item.id, next) }),
                        h('div', { className: 'cb-row-copy' },
                          h('div', { className: 'cb-row-top' },
                            h('span', { className: 'cb-row-name cb-mono' }, `~/.dsh/${item.relPath}`),
                            h(Tag, { tone: 'quiet' }, tf('linesCount', { n: item.lines })))),
                        h('span', { className: 'cb-note' }, formatBytes(item.bytes))))
                  }))),

              includeCredentials
                ? h('section', { className: 'cb-card' },
                  h('div', { className: 'cb-card-head' },
                    h('h2', { className: 'cb-card-title' }, t('sectionCredentials'))),
                  inventory.credentials.length === 0
                    ? h('p', { className: 'cb-note' }, t('emptySection'))
                    : h('ul', { className: 'cb-list' }, inventory.credentials.map(item => {
                      const checked = selCredentials.has(item.id)
                      return h('li', { key: item.id, className: 'cb-row', 'data-selected': checked || undefined },
                        h('div', { className: 'cb-row-main' },
                          h(Checkbox, { checked, label: h('span', { className: 'cb-sr-only' }, `~/.dsh/${item.relPath}`), onChange: next => toggleSet(setSelCredentials, item.id, next) }),
                          h('div', { className: 'cb-row-copy' },
                            h('div', { className: 'cb-row-top' },
                              h('span', { className: 'cb-row-name cb-mono' }, `~/.dsh/${item.relPath}`),
                              h(Tag, { tone: 'warning' }, tf('linesCount', { n: item.lines })))),
                          h('span', { className: 'cb-note' }, formatBytes(item.bytes))))
                    })))
                : null,

              exportNotice
                ? h('div', { className: 'cb-banner', 'data-tone': exportNotice.tone, role: exportNotice.tone === 'error' ? 'alert' : 'status' },
                  exportNotice.tone === 'error'
                    ? h(IconWarningTriangleOutlineRegular, { size: 15 })
                    : h(IconCheckOutlineRegular, { size: 15 }),
                  h('span', { className: 'cb-banner-text' }, exportNotice.text))
                : null,

              h('div', { className: 'cb-footer-bar' },
                h('span', { className: passphrase.length >= 4 ? 'cb-note' : 'cb-note cb-footer-hint' },
                  passphrase.length >= 4
                    ? h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, h(IconLock, { size: 13 }), t('encryptedTag'))
                    : t('optSecretsHint')),
                h(Button, {
                  variant: 'primary',
                  disabled: exporting || selectedExportCount === 0,
                  icon: h(IconDownload, { size: 14 }),
                  onClick: () => void runExport(),
                }, exporting ? t('exporting') : tf('exportBtn', { n: selectedExportCount }))))
          }

          const renderImportTab = () => {
            const filteredConfigs = (preview?.configs ?? []).filter(matchesFilter)
            const filteredDomains = (preview?.domains ?? []).filter(matchesFilter)
            const filteredHomeFiles = (preview?.homeFiles ?? []).filter(matchesFilter)
            const filteredCredentials = (preview?.credentials ?? []).filter(matchesFilter)
            const totalFiltered = filteredConfigs.length + filteredDomains.length + filteredHomeFiles.length + filteredCredentials.length

            return h(React.Fragment, null,
              h('input', {
                ref: fileInputRef,
                type: 'file',
                accept: '.json,application/json',
                style: { display: 'none' },
                onChange: event => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  void handleBackupFile(file)
                },
              }),

              !rawBundle
                ? h('div', {
                  className: 'cb-dropzone',
                  'data-over': dragOver || undefined,
                  onClick: () => fileInputRef.current?.click(),
                  onDragOver: event => { event.preventDefault(); setDragOver(true) },
                  onDragLeave: event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false) },
                  onDrop: event => {
                    event.preventDefault()
                    setDragOver(false)
                    const file = event.dataTransfer?.files?.[0]
                    void handleBackupFile(file)
                  },
                },
                h(IconUpload, { size: 24 }),
                h('div', { style: { fontWeight: 600 } }, t('dropTitle')),
                h('p', { className: 'cb-note', style: { maxWidth: 460 } }, t('dropHint')),
                h(Button, { variant: 'outline', size: 'sm', onClick: event => { event.stopPropagation(); fileInputRef.current?.click() } }, t('chooseFile')))
                : h('div', { className: 'cb-card' },
                  h('div', { className: 'cb-card-head' },
                    h('div', { className: 'cb-row-top' },
                      h('span', { className: 'cb-row-name cb-mono' }, importFilename),
                      preview?.meta?.encrypted || rawBundle?.encrypted ? h(Tag, { tone: 'warning' }, t('encryptedTag')) : null,
                      preview?.meta?.options?.includeSecrets === false ? h(Tag, { tone: 'quiet' }, t('redactedTag')) : null),
                    h('div', { className: 'cb-card-actions' },
                      h(Button, { size: 'sm', variant: 'outline', onClick: () => fileInputRef.current?.click() }, t('changeFile')))),
                  preview?.meta
                    ? h('p', { className: 'cb-note' }, tf('sourceMeta', {
                      profile: preview.meta.source?.profile ?? '?',
                      time: formatTime(preview.meta.exportedAt),
                    }))
                    : null),

              needsUnlock && rawBundle
                ? h('section', { className: 'cb-card' },
                  h('div', { className: 'cb-row-top' },
                    h(IconLock, { size: 15 }),
                    h('h2', { className: 'cb-card-title' }, t('encryptedTitle'))),
                  h('p', { className: 'cb-note' }, t('encryptedHint')),
                  h('div', { className: 'cb-unlock' },
                    h(Input, {
                      type: 'password',
                      className: 'cb-unlock-input',
                      value: unlockPass,
                      placeholder: t('unlockPlaceholder'),
                      'aria-label': t('unlockPlaceholder'),
                      onChange: event => setUnlockPass(event.target.value),
                      onKeyDown: event => {
                        if (event.key === 'Enter' && unlockPass) void fetchPreview(rawBundle, unlockPass, tableMode)
                      },
                    }),
                    h(Button, {
                      variant: 'primary',
                      disabled: previewLoading || !unlockPass,
                      onClick: () => void fetchPreview(rawBundle, unlockPass, tableMode),
                    }, previewLoading ? t('unlocking') : t('unlockBtn'))))
                : null,

              importError
                ? h('div', { className: 'cb-banner', 'data-tone': 'error', role: 'alert' },
                  h(IconWarningTriangleOutlineRegular, { size: 15 }),
                  h('span', { className: 'cb-banner-text' }, importError))
                : null,

              applyResult
                ? h('div', { className: 'cb-banner', 'data-tone': applyResult.failed > 0 ? 'warn' : 'success', role: 'status' },
                  applyResult.failed > 0
                    ? h(IconWarningTriangleOutlineRegular, { size: 15 })
                    : h(IconCheckOutlineRegular, { size: 15 }),
                  h('div', { className: 'cb-banner-text' },
                    h('div', null, tf('applyDone', {
                      applied: applyResult.applied,
                      skipped: applyResult.skipped,
                      failed: applyResult.failed,
                    })),
                    applyResult.restartRecommended
                      ? h('div', { style: { marginTop: 4 } }, tf('restartNotice', { items: applyResult.restartItems.join(', ') }))
                      : null,
                    applyResult.results.some(r => r.status === 'failed')
                      ? h('div', { className: 'cb-results' },
                        applyResult.results.filter(r => r.status === 'failed').map(r =>
                          h('div', { key: `${r.kind}:${r.id}`, className: 'cb-result-line' },
                            h(Tag, { tone: 'danger' }, r.id),
                            h('span', null, r.message))))
                      : null))
                : null,

              previewLoading && !preview
                ? h('div', { className: 'cb-empty', role: 'status' },
                  h(StateDot, { state: 'ongoing', size: 16 }),
                  h('p', null, t('loading')))
                : null,

              preview
                ? h(React.Fragment, null,
                  h('div', { className: 'cb-toolbar' },
                    h('div', { className: 'cb-pills' },
                      [
                        ['all', tf('filterAll', { n: preview.summary.total })],
                        ['actionable', tf('filterActionable', { n: preview.summary.actionable })],
                        ['uninstalled', tf('filterUninstalled', { n: preview.summary.uninstalled + preview.summary.incompatible })],
                        ['unchanged', tf('filterUnchanged', { n: preview.summary.unchanged })],
                      ].map(([id, label]) => h('button', {
                        key: id,
                        type: 'button',
                        className: 'cb-pill',
                        'aria-pressed': importFilter === id,
                        onClick: () => setImportFilter(id),
                      }, label))),
                    h('div', { className: 'cb-mode' },
                      h('span', null, t('tableModeLabel')),
                      h('select', {
                        className: 'cb-select',
                        'aria-label': t('tableModeLabel'),
                        value: tableMode,
                        disabled: previewLoading || applying,
                        onChange: event => void handleTableModeChange(event.target.value),
                      },
                      h('option', { value: 'merge' }, t('tableModeMerge')),
                      h('option', { value: 'replace' }, t('tableModeReplace'))),
                      h(Button, {
                        size: 'sm',
                        variant: 'ghost',
                        onClick: () => {
                          setImpConfigs(new Set(preview.configs.filter(i => i.defaultSelected).map(i => i.id)))
                          setImpDomains(new Set(preview.domains.filter(i => i.defaultSelected).map(i => i.name)))
                          setImpHomeFiles(new Set(preview.homeFiles.filter(i => i.defaultSelected).map(i => i.id)))
                        },
                      }, t('selectChanged')),
                      h(Button, {
                        size: 'sm',
                        variant: 'ghost',
                        onClick: () => {
                          setImpConfigs(new Set())
                          setImpDomains(new Set())
                          setImpHomeFiles(new Set())
                          setImpCredentials(new Set())
                        },
                      }, t('clearAll')))),

                  totalFiltered === 0
                    ? h('div', { className: 'cb-empty' }, h('p', null, t('noDiffMatches')))
                    : null,

                  filteredConfigs.length > 0
                    ? h('section', { className: 'cb-card' },
                      h('h2', { className: 'cb-card-title' }, t('sectionConfigs')),
                      h('ul', { className: 'cb-list' }, filteredConfigs.map(item => {
                        const disabled = item.status === 'uninstalled' || item.status === 'incompatible'
                        const checked = !disabled && impConfigs.has(item.id)
                        const expKey = `cfg:${item.id}`
                        const isOpen = expanded.has(expKey)
                        return h('li', { key: item.id, className: 'cb-row', 'data-selected': checked || undefined, 'data-disabled': disabled || undefined },
                          h('div', { className: 'cb-row-main' },
                            h(Checkbox, { checked, disabled, label: h('span', { className: 'cb-sr-only' }, item.id), onChange: next => toggleSet(setImpConfigs, item.id, next) }),
                            h('div', { className: 'cb-row-copy' },
                              h('div', { className: 'cb-row-top' },
                                h('span', { className: 'cb-row-name' }, item.id),
                                h(Tag, { tone: statusTagTone(item.status) }, statusLabel(item.status)),
                                item.preservedSecrets > 0 ? h(Tag, { tone: 'quiet' }, tf('preservedSecrets', { n: item.preservedSecrets })) : null),
                              h('div', { className: 'cb-row-sub cb-mono' }, item.reason ? `${item.name} · ${item.reason}` : item.name)),
                            item.changes.length > 0
                              ? h('div', { className: 'cb-row-right' },
                                h(Button, {
                                  size: 'sm',
                                  variant: 'ghost',
                                  icon: h(isOpen ? IconChevronDownOutlineRegular : IconChevronRightOutlineRegular, { size: 13 }),
                                  onClick: () => toggleExpand(expKey),
                                }, isOpen ? t('hideDiff') : `${t('showDiff')} (${item.changes.length + item.truncated})`))
                              : null),
                          isOpen && item.changes.length > 0 ? renderDiffLines(item.changes, item.truncated) : null)
                      })))
                    : null,

                  filteredDomains.length > 0
                    ? h('section', { className: 'cb-card' },
                      h('h2', { className: 'cb-card-title' }, t('sectionDomains')),
                      h('ul', { className: 'cb-list' }, filteredDomains.map(item => {
                        const disabled = item.status === 'uninstalled' || item.status === 'incompatible'
                        const checked = !disabled && impDomains.has(item.name)
                        const expKey = `dom:${item.name}`
                        const isOpen = expanded.has(expKey)
                        const ts = item.tableSummary
                        const tableDelta = ts && (ts.added || ts.modified || ts.removed)
                          ? `+${ts.added} ~${ts.modified}${ts.removed ? ` -${ts.removed}` : ''}`
                          : null
                        return h('li', { key: item.name, className: 'cb-row', 'data-selected': checked || undefined, 'data-disabled': disabled || undefined },
                          h('div', { className: 'cb-row-main' },
                            h(Checkbox, { checked, disabled, label: h('span', { className: 'cb-sr-only' }, item.name), onChange: next => toggleSet(setImpDomains, item.name, next) }),
                            h('div', { className: 'cb-row-copy' },
                              h('div', { className: 'cb-row-top' },
                                h('span', { className: 'cb-row-name' }, item.name),
                                h(Tag, { tone: statusTagTone(item.status) }, statusLabel(item.status)),
                                tableDelta ? h(Tag, { tone: 'quiet' }, tableDelta) : null,
                                item.restartRecommended && !disabled ? h(Tag, { tone: 'outline' }, t('restartBadge')) : null),
                              item.reason ? h('div', { className: 'cb-row-sub' }, item.reason) : null),
                            item.changes.length > 0
                              ? h('div', { className: 'cb-row-right' },
                                h(Button, {
                                  size: 'sm',
                                  variant: 'ghost',
                                  icon: h(isOpen ? IconChevronDownOutlineRegular : IconChevronRightOutlineRegular, { size: 13 }),
                                  onClick: () => toggleExpand(expKey),
                                }, isOpen ? t('hideDiff') : `${t('showDiff')} (${item.changes.length + item.truncated})`))
                              : null),
                          isOpen && item.changes.length > 0 ? renderDiffLines(item.changes, item.truncated) : null)
                      })))
                    : null,

                  filteredHomeFiles.length > 0
                    ? h('section', { className: 'cb-card' },
                      h('h2', { className: 'cb-card-title' }, t('sectionHomeFiles')),
                      h('ul', { className: 'cb-list' }, filteredHomeFiles.map(item => {
                        const checked = impHomeFiles.has(item.id)
                        const expKey = `file:${item.id}`
                        const isOpen = expanded.has(expKey)
                        return h('li', { key: item.id, className: 'cb-row', 'data-selected': checked || undefined },
                          h('div', { className: 'cb-row-main' },
                            h(Checkbox, { checked, label: h('span', { className: 'cb-sr-only' }, `~/.dsh/${item.relPath}`), onChange: next => toggleSet(setImpHomeFiles, item.id, next) }),
                            h('div', { className: 'cb-row-copy' },
                              h('div', { className: 'cb-row-top' },
                                h('span', { className: 'cb-row-name cb-mono' }, `~/.dsh/${item.relPath}`),
                                h(Tag, { tone: statusTagTone(item.status) }, statusLabel(item.status)),
                                item.added || item.removed ? h(Tag, { tone: 'quiet' }, `+${item.added} -${item.removed}`) : null)),
                            item.lines.length > 0
                              ? h('div', { className: 'cb-row-right' },
                                h(Button, {
                                  size: 'sm',
                                  variant: 'ghost',
                                  icon: h(isOpen ? IconChevronDownOutlineRegular : IconChevronRightOutlineRegular, { size: 13 }),
                                  onClick: () => toggleExpand(expKey),
                                }, isOpen ? t('hideDiff') : t('showDiff')))
                              : null),
                          isOpen && item.lines.length > 0 ? renderTextDiff(item.lines, item.truncated) : null)
                      })))
                    : null,

                  filteredCredentials.length > 0
                    ? h('section', { className: 'cb-card' },
                      h('h2', { className: 'cb-card-title' }, t('sectionCredentials')),
                      h('ul', { className: 'cb-list' }, filteredCredentials.map(item => {
                        const checked = impCredentials.has(item.id)
                        return h('li', { key: item.id, className: 'cb-row', 'data-selected': checked || undefined },
                          h('div', { className: 'cb-row-main' },
                            h(Checkbox, { checked, label: h('span', { className: 'cb-sr-only' }, `~/.dsh/${item.relPath}`), onChange: next => toggleSet(setImpCredentials, item.id, next) }),
                            h('div', { className: 'cb-row-copy' },
                              h('div', { className: 'cb-row-top' },
                                h('span', { className: 'cb-row-name cb-mono' }, `~/.dsh/${item.relPath}`),
                                h(Tag, { tone: statusTagTone(item.status) }, statusLabel(item.status))),
                              h('div', { className: 'cb-row-sub' }, tf('credMeta', { local: item.currentLines, backup: item.backupLines })))))
                      })))
                    : null,

                  h('div', { className: 'cb-footer-bar' },
                    h('span', { className: 'cb-note' },
                      h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
                        h(IconInfoOutlineRegular, { size: 14 }),
                        t('dropHint'))),
                    h(Button, {
                      variant: 'primary',
                      disabled: applying || previewLoading || selectedImportCount === 0,
                      onClick: () => setConfirmOpen(true),
                    }, applying ? t('applying') : tf('applyBtn', { n: selectedImportCount }))))
                : null)
          }

          return h('div', { className: 'cb-page' },
            h('div', { className: 'cb-inner' },
              h('header', { className: 'cb-head' },
                h('div', { className: 'cb-head-copy' },
                  h('div', { className: 'cb-title-row' },
                    h('h1', { className: 'cb-title' }, t('panel')),
                    inventory?.profile ? h(Tag, { tone: 'quiet' }, tf('profileBadge', { name: inventory.profile })) : null),
                  h('p', { className: 'cb-note' }, t('description'))),
                h('div', { className: 'cb-head-actions' },
                  h(Button, {
                    size: 'sm',
                    variant: 'outline',
                    disabled: loadingInv,
                    icon: h(IconRefreshOutlineRegular, { size: 14 }),
                    onClick: () => void loadInventory(),
                  }, loadingInv ? t('refreshing') : t('refresh')))),

              invError
                ? h('div', { className: 'cb-banner', 'data-tone': 'error', role: 'alert' },
                  h(IconWarningTriangleOutlineRegular, { size: 15 }),
                  h('span', { className: 'cb-banner-text' }, invError))
                : null,

              h('div', { className: 'cb-tabs', role: 'tablist' },
                h('button', {
                  type: 'button',
                  role: 'tab',
                  className: 'cb-tab',
                  'aria-selected': tab === 'export',
                  onClick: () => setTab('export'),
                }, h(IconDownload, { size: 14 }), t('tabExport')),
                h('button', {
                  type: 'button',
                  role: 'tab',
                  className: 'cb-tab',
                  'aria-selected': tab === 'import',
                  onClick: () => setTab('import'),
                }, h(IconUpload, { size: 14 }), t('tabImport'))),

              tab === 'export' ? renderExportTab() : renderImportTab()),

            confirmOpen
              ? h(Modal, {
                open: true,
                onClose: () => setConfirmOpen(false),
                title: tf('confirmTitle', { profile: inventory?.profile ?? 'current' }),
                closeLabel: t('cancel'),
                footer: h(React.Fragment, null,
                  h(Button, { variant: 'outline', 'data-modal-autofocus': true, onClick: () => setConfirmOpen(false) }, t('cancel')),
                  h(Button, { variant: 'primary', onClick: () => void runApply() }, t('confirmApply'))),
              },
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                h('p', { style: { margin: 0 } }, tf('confirmBody', {
                  configs: impConfigs.size,
                  domains: impDomains.size,
                  files: impHomeFiles.size,
                  creds: impCredentials.size,
                })),
                tableMode === 'replace' && impDomains.size > 0
                  ? h('div', { className: 'cb-banner', 'data-tone': 'warn' },
                    h(IconWarningTriangleOutlineRegular, { size: 15 }),
                    h('span', { className: 'cb-banner-text' }, t('confirmReplaceWarn')))
                  : null,
                impCredentials.size > 0
                  ? h('div', { className: 'cb-banner', 'data-tone': 'warn' },
                    h(IconWarningTriangleOutlineRegular, { size: 15 }),
                    h('span', { className: 'cb-banner-text' }, t('confirmCredWarn')))
                  : null))
              : null)
        }

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: NS, locale: NS,
        }, ConfigBackupPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: NS, order: 48, locale: NS, label: () => t('panel'),
        }, IconArchive))
      },
    }
  },
})
