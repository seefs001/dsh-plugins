import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import {
  ArrowRight, Brain, FolderTree, Globe, Hash, History, LoaderCircle, Quote, ScanEye, ShieldCheck, Terminal, Zap,
} from 'lucide-react'
import { baseOptions } from '@/lib/layout.shared'
import { repository } from '@/lib/site'

const plugins = [
  { slug: 'model-reference', icon: Hash, title: '模型引用', tag: 'Host + Web', description: '输入 # 插入模型标签，把推理强度和快速模式一起带进提示词。' },
  { slug: 'service-tier', icon: Zap, title: '快速模式', tag: 'Host + Web', description: '模型选择器旁的一键 ⚡，为 Responses 模型开启优先处理。' },
  { slug: 'remember-model', icon: Brain, title: '记住模型', tag: 'Host', description: '新会话沿用上次选择的模型和推理强度，不用反复切换。' },
  { slug: 'recent-sessions', icon: History, title: '最近会话', tag: 'Web', description: '@ 菜单按最近活动排列会话，更快找到刚才的上下文。' },
  { slug: 'session-groups', icon: FolderTree, title: '会话分组', tag: 'Host + Web', description: '给会话分组、排序和置顶，浏览器和 Agent 共享同一份状态。' },
  { slug: 'compaction-status', icon: LoaderCircle, title: '压缩状态', tag: 'Host + Web', description: '输入框上方的一行压缩状态与计时，不必展开过程详情。' },
  { slug: 'auto-review-model', icon: ShieldCheck, title: '自动审查模型', tag: 'Host + Web', description: '为 Auto review 单独选择模型与审查策略，不影响主对话。' },
  { slug: 'quote-jump', icon: Quote, title: '引用跳转', tag: 'Web', description: '点击引用块回到对话中的原文，让上下文触手可及。' },
  { slug: 'tool-lens', icon: ScanEye, title: '工具透镜', tag: 'Web', description: '直接从工具调用打开技能、完整输出、文件和子会话。' },
  { slug: 'web-access', icon: Globe, title: '联网搜索', tag: 'Host + Web', description: '通过已有 Responses 模型搜索网页与 X，返回带来源的回答。' },
]

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto w-full max-w-6xl px-6">
        <section className="relative border-x border-b border-fd-border px-6 py-20 md:px-12 md:py-28">
          <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-fd-background px-3 py-1.5 text-xs text-fd-muted-foreground">
            <span className="size-1.5 rounded-full bg-fd-primary" />
            为 DeepSeek Harness 而造 · 开源插件集
          </div>
          <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight md:text-6xl md:leading-tight">
            让你的 <span className="font-mono text-fd-primary">dsh</span>
            <br />更顺手一点。
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-fd-muted-foreground md:text-lg">
            从一次模型切换，到一组井然有序的会话。{plugins.length} 个可选插件，补齐日常工作流里的小细节。需要哪个，就装哪个。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/docs/quick-start" className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90">
              开始使用 <ArrowRight className="size-4" />
            </Link>
            <Link href="/docs/plugins" className="rounded-lg border bg-fd-background px-5 py-3 text-sm font-medium transition-colors hover:bg-fd-accent">
              浏览插件
            </Link>
          </div>
          <div className="mt-12 max-w-2xl overflow-hidden rounded-xl border bg-fd-card shadow-sm">
            <div className="flex items-center gap-2 border-b px-4 py-3 text-xs text-fd-muted-foreground">
              <Terminal className="size-3.5" /> 安装第一个插件
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-7 md:text-sm"><code>{'dsh plugin --profile web add \\\n  "github:seefs001/dsh-plugins#main&path:/packages/model-reference"'}</code></pre>
          </div>
          <p className="mt-4 text-xs text-fd-muted-foreground">dsh ≥ 0.2.2-rc.1、&lt; 0.3.0 · Node.js ^22.19.0 或 ≥ 24 · MIT</p>
        </section>

        <section className="py-16 md:py-20" aria-labelledby="plugins-heading">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-3 font-mono text-xs tracking-widest text-fd-primary uppercase">Small plugins. Better flow.</p>
              <h2 id="plugins-heading" className="text-2xl font-semibold tracking-tight">按需组合，不必全装</h2>
            </div>
            <Link href="/docs/plugins" className="inline-flex items-center gap-2 text-sm text-fd-muted-foreground hover:text-fd-primary">
              查看全部文档 <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plugins.map(({ slug, icon: Icon, title, tag, description }) => (
              <Link key={slug} href={`/docs/plugins/${slug}`} className="group rounded-xl border bg-fd-card p-6 transition-colors hover:border-fd-primary/40 hover:bg-fd-accent/50">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="size-5 text-fd-primary" />
                  <span className="rounded-md border px-2 py-0.5 font-mono text-[10px] text-fd-muted-foreground">{tag}</span>
                </div>
                <h3 className="flex items-center justify-between font-medium">{title}<ArrowRight className="size-4 text-fd-muted-foreground transition-transform group-hover:translate-x-1" /></h3>
                <p className="mt-2 text-sm leading-7 text-fd-muted-foreground">{description}</p>
                <p className="mt-5 font-mono text-xs text-fd-muted-foreground">dsh-{slug}</p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t py-8 text-xs text-fd-muted-foreground">
          <p>seefs 的社区插件集，与 DeepSeek 官方无隶属关系。</p>
          <div className="flex gap-5">
            <a href={`${repository}/blob/main/LICENSE`}>MIT License</a>
            <a href={repository}>GitHub ↗</a>
            <a href="https://fumadocs.dev">Built with Fumadocs</a>
          </div>
        </footer>
      </div>
    </HomeLayout>
  )
}
