import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { ArrowRight, BookOpen, Download, Settings2, ShieldAlert, Wrench } from 'lucide-react'
import { PluginDirectory } from '@/components/plugins'
import { baseOptions } from '@/lib/layout.shared'
import { getPlugin, plugins, supportedRange } from '@/lib/plugins'
import { repository } from '@/lib/site'

const paths = [
  { href: '/docs/quick-start', icon: Download, title: '安装', text: '从 GitHub 或本地仓库安装单个插件，确认它已生效。' },
  { href: '/docs/configuration', icon: Settings2, title: '配置与数据', text: '设置写在哪里，Host、profile 和浏览器各保存什么。' },
  { href: '/docs/compatibility', icon: ShieldAlert, title: '版本与边界', text: '每个插件的 DSH 版本、依赖，以及它不会改变的行为。' },
  { href: '/docs/development', icon: Wrench, title: '开发与发布', text: '链接源码、运行检查、维护文档和发布包。' },
]

export default function HomePage() {
  const example = getPlugin('model-reference')
  return (
    <HomeLayout {...baseOptions()}>
      <div className="dp-home mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className="dp-hero" aria-labelledby="home-title">
          <div className="dp-hero-text">
            <p className="dp-eyebrow">DeepSeek Harness 插件集</p>
            <h1 id="home-title">dsh-plugins</h1>
            <p className="dp-lead">
              {plugins.length} 个相互独立的 DSH 插件，覆盖模型选择、会话整理、对话阅读和工具扩展。
              每个插件是一个 bundle，可以单独安装、启用和移除。
            </p>
            <div className="dp-actions">
              <Link href="/docs/quick-start" className="dp-button dp-button-primary">安装插件 <ArrowRight aria-hidden className="size-4" /></Link>
              <Link href="/docs/plugins" className="dp-button">浏览插件</Link>
            </div>
            <p className="dp-meta">
              支持 DSH <code>{supportedRange}</code>，部分插件需要 rc.2 · Node.js <code>^22.19.0</code> 或 <code>&gt;=24</code> · 代码使用 MIT 许可
            </p>
          </div>
          <div className="dp-hero-code">
            <CodeBlock title={`安装 ${example.title}`} className="dp-code">
              <Pre><code>{`dsh plugin --profile web add \\
  "${example.github}"`}</code></Pre>
            </CodeBlock>
            <p className="dp-hero-note">
              把 <code>web</code> 换成你的 profile。也可以在 Web 界面的 Plugins 页粘贴 <code>github:</code> 地址。
            </p>
          </div>
        </section>

        <nav className="dp-paths" aria-label="文档入口">
          {paths.map(({ href, icon: Icon, title, text }) => (
            <Link key={href} href={href} className="dp-path">
              <Icon aria-hidden className="dp-path-icon" />
              <span className="dp-path-title">{title}</span>
              <span className="dp-path-text">{text}</span>
            </Link>
          ))}
        </nav>

        <section className="dp-home-directory" aria-labelledby="directory-title">
          <div className="dp-section-head">
            <h2 id="directory-title">插件目录</h2>
            <Link href="/docs/plugins" className="dp-inline-link"><BookOpen aria-hidden className="size-4" /> 全部插件文档</Link>
          </div>
          <PluginDirectory headingLevel={3} />
        </section>

        <footer className="dp-footer">
          <p>seefs 维护的社区插件集，与 DeepSeek 官方无隶属关系。AI 小伙伴引用的角色素材另有非商业条款。</p>
          <div>
            <a href={`${repository}/blob/main/LICENSE`}>MIT License</a>
            <a href={repository}>GitHub</a>
            <a href="https://fumadocs.dev">Fumadocs</a>
          </div>
        </footer>
      </div>
    </HomeLayout>
  )
}
