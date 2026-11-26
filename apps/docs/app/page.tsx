import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { ArrowRight, BookOpen, Download, Settings2, ShieldAlert, Wrench } from 'lucide-react'
import { PluginDirectory } from '@/components/plugins'
import { baseOptions } from '@/lib/layout.shared'
import { getPlugin, plugins } from '@/lib/plugins'
import { repository } from '@/lib/site'

const paths = [
  { href: '/docs/quick-start', icon: Download, title: '安装', text: '从 GitHub 或本地目录安装单个插件。' },
  { href: '/docs/configuration', icon: Settings2, title: '配置与数据', text: '各插件的配置项、存储域、凭据和浏览器数据位置。' },
  { href: '/docs/compatibility', icon: ShieldAlert, title: '依赖与运行', text: '每个插件需要的前置 bundle 与外部工具。' },
  { href: '/docs/development', icon: Wrench, title: '开发与检查', text: '本地链接调试、静态检查、测试与文档站构建。' },
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
              {plugins.length} 个独立的 DeepSeek Harness 插件，覆盖模型选择、会话管理、对话阅读和工具扩展，按需单独安装。
            </p>
            <div className="dp-actions">
              <Link href="/docs/quick-start" className="dp-button dp-button-primary">开始安装 <ArrowRight aria-hidden className="size-4" /></Link>
              <Link href="/docs/plugins" className="dp-button">浏览插件</Link>
            </div>
            <p className="dp-meta">
              开源协议：MIT
            </p>
          </div>
          <div className="dp-hero-code">
            <CodeBlock title={`安装 ${example.title}`} className="dp-code">
              <Pre><code>{`dsh plugin --profile web add \\
  "${example.github}"`}</code></Pre>
            </CodeBlock>
            <p className="dp-hero-note">
              把 <code>web</code> 换成你的 profile，或在 Web 界面的 Plugins 页面粘贴 <code>github:</code> 地址。
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
          <p>代码采用 MIT 协议；AI 吉祥物引用的外部角色素材适用独立的非商业条款。</p>
          <div>
            <a href={`${repository}/blob/main/LICENSE`} target="_blank" rel="noreferrer noopener">MIT License</a>
            <a href={repository} target="_blank" rel="noreferrer noopener">GitHub</a>
            <a href="https://fumadocs.dev" target="_blank" rel="noreferrer noopener">Fumadocs</a>
          </div>
        </footer>
      </div>
    </HomeLayout>
  )
}
