import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const text = value => String(value ?? '—')
  .replace(/[\r\n]+/g, ' ')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/[\\`*_{}[\]()#!|]/g, '\\$&')

const fileLink = (root, path, label = path) => path
  ? `[${text(label)}](<${pathToFileURL(resolve(root, path)).href}>)`
  : '—'

const statusText = status => ({ ok: '通过', warning: '有警告', error: '有错误' })[status] ?? text(status)
const severityText = severity => ({ error: '错误', warning: '警告', info: '信息' })[severity] ?? text(severity)

function findingRows(findings, root) {
  return findings.map(finding => `| ${severityText(finding.severity)} | ${text(finding.code)} | ${text(finding.message)} | ${fileLink(root, finding.path)} |`)
}

/** Render a static snapshot without claiming runtime compatibility or test success. */
export function renderMarkdown(report) {
  const { summary, repository, root } = report
  const lines = [
    '# 插件仓库体检报告',
    '',
    `仓库：${text(repository.name)} · 生成时间：${text(report.generatedAt)}`,
    '',
    `分支：${text(repository.branch ?? '不可用')} · 提交：${text(repository.head ?? '不可用')} · 工作区：${repository.dirty ? '有未提交改动' : repository.head ? '未发现改动' : 'Git 信息不可用'}`,
    '',
    '> 本报告只做静态扫描。未加载插件、安装依赖、运行测试或验证 DSH 运行时兼容性。未发现静态错误不代表插件功能正常。Git 信息不可用时，不推断工作区干净。',
    '',
    '## 总览',
    '',
    '| 插件 | 错误 | 警告 | Host | Web | 有文档页 | 有改动 |',
    '|---:|---:|---:|---:|---:|---:|---:|',
    `| ${summary.packages} | ${summary.errors} | ${summary.warnings} | ${summary.host} | ${summary.web} | ${summary.documented} | ${summary.changed} |`,
    '',
    '错误和警告按 finding 计数，不是插件数。文档覆盖只检查约定路径是否存在；测试文件数只表示存量，不表示测试已通过。',
    '',
    '## 插件清单',
    '',
    '| 插件 | 版本 | 组成 | 静态状态 | 源码文件 / 字节 | 测试文件 | 文档 | 改动 |',
    '|---|---|---|---|---:|---:|---|---|',
    ...report.plugins.map(plugin => `| ${fileLink(root, plugin.directory, plugin.name)} | ${text(plugin.version)} | ${plugin.capabilities.map(text).join(' + ') || '—'} | ${statusText(plugin.status)} | ${plugin.sourceFiles} / ${plugin.sourceBytes} | ${plugin.testFiles} | ${plugin.docsPath ? fileLink(root, plugin.docsPath, '有') : '缺少'} | ${plugin.changed ? '是' : '否'} |`),
    '',
    '## 仓库级提示',
    ''
  ]

  if (report.findings.length) lines.push('| 级别 | 代码 | 说明 | 位置 |', '|---|---|---|---|', ...findingRows(report.findings, root))
  else lines.push('无仓库级提示。')

  lines.push('', '## 插件详情', '')
  if (!report.plugins.length) lines.push('未发现包含 package.json 的直接插件目录。')
  for (const plugin of report.plugins) {
    lines.push(
      `### ${text(plugin.name)}`,
      '',
      text(plugin.description) || '无描述。',
      '',
      `目录：${fileLink(root, plugin.directory)} · Node：${text(plugin.engines.node)} · DSH：${text(plugin.engines.dsh)}`,
      '',
      `README：${plugin.files.readme ? '有' : '缺少'} · 图标：${plugin.files.icon ? '有' : '缺少'} · Bundle patch：${plugin.files.bundle ? '有' : '缺少'} · 文档页：${plugin.docsPath ? fileLink(root, plugin.docsPath) : '缺少'}`,
      '',
      '**导出**',
      '',
      '| 名称 | 目标 | 文件存在 |',
      '|---|---|---|',
      ...plugin.exports.map(entry => `| ${text(entry.name)} | ${text(entry.target)} | ${entry.exists === null ? '未检查' : entry.exists ? '是' : '否'} |`)
    )
    if (!plugin.exports.length) lines.push('| — | 无导出 | — |')
    lines.push('', '**语言**', '')
    if (plugin.locales.length) {
      lines.push('| 语言 | 标题 | 描述 | Meta 键 |', '|---|---|---|---|', ...plugin.locales.map(locale => `| ${text(locale.language)} | ${text(locale.title)} | ${text(locale.description)} | ${locale.metaKeys.map(text).join(', ')} |`))
    } else lines.push('未发现可用 locale。')
    lines.push('', '**Findings**', '')
    if (plugin.findings.length) lines.push('| 级别 | 代码 | 说明 | 位置 |', '|---|---|---|---|', ...findingRows(plugin.findings, root))
    else lines.push('未发现静态问题。')
    lines.push('')
  }

  lines.push('## 依赖清单', '', '仅按 manifest 声明汇总，不解析锁文件，也不推断传递依赖、实际安装状态或漏洞。', '', '### 仓库内部依赖', '')
  if (report.dependencies.edges.length) {
    lines.push('| 来源 | 目标 | 类型 | 声明范围 |', '|---|---|---|---|', ...report.dependencies.edges.map(edge => `| ${text(edge.from)} | ${text(edge.to)} | ${text(edge.kind)} | ${text(edge.range)} |`))
  } else lines.push('未声明仓库内部依赖。')
  lines.push('', '### 外部依赖', '')
  if (report.dependencies.external.length) {
    lines.push('| 依赖 | 声明范围 | 类型 | 使用插件 |', '|---|---|---|---|', ...report.dependencies.external.map(dependency => `| ${text(dependency.name)} | ${text(dependency.range)} | ${text(dependency.kind)} | ${dependency.usedBy.map(text).join(', ')} |`))
  } else lines.push('插件 manifest 未声明外部依赖。')

  lines.push('', '## 工作区改动快照', '')
  if (repository.changedFiles.length) {
    lines.push('| Git 状态 | 路径 |', '|---|---|', ...repository.changedFiles.map(file => `| ${text(file.status)} | ${fileLink(root, file.path)} |`))
  } else lines.push(repository.head ? '扫描时未发现 Git 改动。' : 'Git 改动信息不可用或为空，请查阅仓库级提示。')
  return `${lines.join('\n')}\n`
}
