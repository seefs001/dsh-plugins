import Link from 'next/link'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { categories, getPlugin, plugins, pluginsIn, type CategoryId, type PluginInfo } from '@/lib/plugins'

function Surface({ plugin }: { plugin: PluginInfo }) {
  return <span className="dp-tag" title="运行位置">{plugin.surface}</span>
}

/** Install command with the native copy button. */
export function InstallCommand({ slug, local = false }: { slug: string, local?: boolean }) {
  const plugin = getPlugin(slug)
  const command = local
    ? `dsh plugin --profile web add link:$PWD/packages/${plugin.slug}`
    : plugin.install
  return (
    <CodeBlock title={local ? '从本地仓库根目录安装' : '从 GitHub 安装'} className="dp-code my-4">
      <Pre><code>{command}</code></Pre>
    </CodeBlock>
  )
}

/** Manifest facts shown at the top of each plugin page. */
export function PluginFacts({ slug }: { slug: string }) {
  const plugin = getPlugin(slug)
  return (
    <section className="dp-facts not-prose" aria-label="插件信息">
      <dl>
        <div><dt>包名</dt><dd><code>{plugin.name}</code> {plugin.version}</dd></div>
        <div><dt>DSH 版本</dt><dd><code>{plugin.dsh}</code></dd></div>
        <div><dt>运行位置</dt><dd><Surface plugin={plugin} /></dd></div>
        <div>
          <dt>额外要求</dt>
          <dd>{plugin.requires?.length ? plugin.requires.join('；') : '无'}</dd>
        </div>
      </dl>
      <p className="dp-facts-source">
        <a href={`https://github.com/seefs001/dsh-plugins/tree/main/packages/${plugin.slug}`}>源码与 README</a>
      </p>
    </section>
  )
}

function Row({ plugin }: { plugin: PluginInfo }) {
  return (
    <li className="dp-row">
      <div className="dp-row-main">
        <Link href={plugin.href} className="dp-row-title">{plugin.title}</Link>
        <code className="dp-row-name">{plugin.name}</code>
        <p className="dp-row-summary">{plugin.summary}</p>
      </div>
      <div className="dp-row-meta">
        <Surface plugin={plugin} />
        <span className="dp-tag" title="最低 DSH 版本">DSH ≥ {plugin.minDsh}</span>
        {plugin.requires?.map(item => <span key={item} className="dp-tag dp-tag-warn">{item}</span>)}
      </div>
    </li>
  )
}

/** Grouped plugin list; pass a category to show only that group. */
export function PluginDirectory({ category, headingLevel = 2 }: { category?: CategoryId, headingLevel?: 2 | 3 }) {
  const shown = category ? categories.filter(item => item.id === category) : categories
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className="dp-directory not-prose">
      {shown.map(group => (
        <section key={group.id} aria-labelledby={`group-${group.id}`} className="dp-group">
          <Heading id={`group-${group.id}`} className="dp-group-title">{group.title}</Heading>
          <p className="dp-group-description">{group.description}</p>
          <ul className="dp-rows">
            {pluginsIn(group.id).map(plugin => <Row key={plugin.slug} plugin={plugin} />)}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** One row per plugin: version range, surface and external requirements. */
export function RequirementsTable() {
  return (
    <div className="dp-table-wrap not-prose" role="region" aria-label="插件版本与依赖" tabIndex={0}>
      <table className="dp-table">
        <thead>
          <tr><th scope="col">插件</th><th scope="col">版本</th><th scope="col">DSH</th><th scope="col">运行位置</th><th scope="col">额外要求</th></tr>
        </thead>
        <tbody>
          {plugins.map(plugin => (
            <tr key={plugin.slug}>
              <th scope="row"><Link href={plugin.href}>{plugin.title}</Link><br /><code>{plugin.name}</code></th>
              <td>{plugin.version}</td>
              <td><code>{plugin.dsh}</code></td>
              <td>{plugin.surface}</td>
              <td>{plugin.requires?.join('；') ?? '无'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** All GitHub install commands, grouped like the directory. */
export function InstallAll() {
  return (
    <>
      {categories.map(group => (
        <CodeBlock key={group.id} title={group.title} className="dp-code my-4">
          <Pre><code>{pluginsIn(group.id).map(plugin => plugin.install).join('\n')}</code></Pre>
        </CodeBlock>
      ))}
    </>
  )
}
