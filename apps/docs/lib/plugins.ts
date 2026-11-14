import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Plugin facts for the site. Package names, Web halves and titles come from
 * each package's manifest at build time; only the grouping, the short Chinese
 * summary and external requirements are written here. Every plugin targets the
 * latest DSH, so the site shows no version numbers or ranges.
 */

export type CategoryId = 'models' | 'sessions' | 'conversation' | 'tools'
export type Surface = 'Host' | 'Web' | 'Host + Web'

export const categories: { id: CategoryId, title: string, description: string }[] = [
  { id: 'models', title: '模型与审查', description: '选模型、带推理强度、快速模式和工具审查模型。' },
  { id: 'sessions', title: '会话与工作区', description: '整理会话、管理工作区、切分支，以及保持主机唤醒。' },
  { id: 'conversation', title: '对话阅读', description: '在对话里看清压缩、引用、工具输出和回复含义。' },
  { id: 'tools', title: '工具与集成', description: '新增搜索工具、Pi 预设，或把会话接入外部中继。' },
]

interface Entry {
  slug: string
  category: CategoryId
  surface: Surface
  summary: string
  /** Bundles, services or tools the user must provide or enable. */
  requires?: string[]
}

const entries: Entry[] = [
  { slug: 'model-reference', category: 'models', surface: 'Host + Web', summary: '输入 # 插入模型标签，带上该模型上次的推理强度和快速模式。' },
  { slug: 'service-tier', category: 'models', surface: 'Host + Web', summary: '模型选择器旁的 ⚡ 开关，为 Responses 模型发送 service_tier: "priority"。', requires: ['openai-responses provider'] },
  { slug: 'remember-model', category: 'models', surface: 'Host', summary: '新会话使用你最近选择的模型和推理强度。' },
  { slug: 'subagent-model', category: 'models', surface: 'Web', summary: '在子代理输入框显示它记录的模型和推理强度，只读。' },
  { slug: 'auto-review-model', category: 'models', surface: 'Host + Web', summary: '为 Auto review 单独选模型和审查提示词，并查看每个会话的审查日志。', requires: ['@deepseek-ai/dsh-experimental-auto-review'] },
  { slug: 'recent-sessions', category: 'sessions', surface: 'Web', summary: '@ 菜单里的会话按最近活动排序。' },
  { slug: 'session-groups', category: 'sessions', surface: 'Host + Web', summary: '自定义会话分组和组内置顶，所有浏览器与 Agent 共享。' },
  { slug: 'workspace-manager', category: 'sessions', surface: 'Host + Web', summary: '移除保存的工作区记录，清理目录已不存在的条目，不删文件和会话。' },
  { slug: 'branch-switcher', category: 'sessions', surface: 'Host + Web', summary: '新会话发出首条消息前，切换到已有的本地分支。', requires: ['Change requests & worktrees'] },
  { slug: 'git-changes', category: 'sessions', surface: 'Web', summary: '输入框下方显示分支和未提交改动，点开右侧 diff。', requires: ['Change requests & worktrees'] },
  { slug: 'keep-awake', category: 'sessions', surface: 'Host', summary: 'Host 运行期间阻止 macOS 闲置休眠，屏幕仍可熄灭和锁定。', requires: ['macOS'] },
  { slug: 'compaction-status', category: 'conversation', surface: 'Host + Web', summary: '上下文压缩时，在输入框上方显示一行状态和已等待时间。' },
  { slug: 'quote-jump', category: 'conversation', surface: 'Web', summary: '用户消息中的引用变成可点击的块，跳回原文并高亮。' },
  { slug: 'tool-lens', category: 'conversation', surface: 'Web', summary: '工具调用行可直接打开技能文件、完整输出、结果文件和子代理对话。' },
  { slug: 'message-actions', category: 'conversation', surface: 'Host + Web', summary: '在回复旁点 Wait, what?，用独立模型调用解释这条回复，不写入对话。', requires: ['已配置的模型 provider'] },
  { slug: 'ai-mascot', category: 'conversation', surface: 'Web', summary: '右下角的 GPT / Claude 小伙伴，跟随当前对话的真实活动。', requires: ['可访问外部素材站点'] },
  { slug: 'web-access', category: 'tools', surface: 'Host + Web', summary: '新增 grok_search 和 openai_search，复用已有 Responses provider 的托管搜索。', requires: ['支持托管搜索的 Responses provider'] },
  { slug: 'image-gen', category: 'tools', surface: 'Host + Web', summary: '新增 openai_image 和 grok_image，复用已有 Responses provider 的托管 image_generation 工具。', requires: ['支持托管 image_generation 的 Responses provider'] },
  { slug: 'pi-tools', category: 'tools', surface: 'Host + Web', summary: '独立的 pi 预设：Pi 原版编程工具、QuickJS codemode 和可选的 DSH/MCP 工具。', requires: ['rg 与 fd'] },
  { slug: 'pi-mcp', category: 'tools', surface: 'Host', summary: '在 DSH 里使用 Pi 的 ~/.pi/agent/mcp.json，改文件即时生效。', requires: ['@deepseek-ai/dsh-mcp-manager'] },
  { slug: 'switchboard', category: 'tools', surface: 'Host', summary: '把 DSH 接入 Switchboard 中继，让 IM 和 GitHub 请求在 DSH 会话中运行。', requires: ['Switchboard 中继'] },
]

export interface PluginInfo extends Entry {
  name: string
  title: string
  enTitle: string
  description: string
  hasClient: boolean
  href: string
  github: string
  install: string
}

const packagesDir = join(process.cwd(), '..', '..', 'packages')

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

interface Manifest {
  name: string
  dsh?: { client?: unknown }
}

interface LocaleMeta { meta: { title: string, description: string } }

function load(entry: Entry): PluginInfo {
  const dir = join(packagesDir, entry.slug)
  if (!existsSync(join(dir, 'package.json'))) throw new Error(`Unknown plugin package: ${entry.slug}`)
  const manifest = readJson<Manifest>(join(dir, 'package.json'))
  const zh = readJson<LocaleMeta>(join(dir, 'locale', 'zh.json')).meta
  const en = readJson<LocaleMeta>(join(dir, 'locale', 'en.json')).meta
  const github = `github:seefs001/dsh-plugins#main&path:/packages/${entry.slug}`
  return {
    ...entry,
    name: manifest.name,
    title: zh.title,
    enTitle: en.title,
    description: zh.description,
    hasClient: manifest.dsh?.client !== undefined,
    href: `/docs/plugins/${entry.slug}`,
    github,
    install: `dsh plugin --profile web add "${github}"`,
  }
}

export const plugins: PluginInfo[] = entries.map(load)

// Fail the build when a package has no catalog entry, so a new plugin cannot
// ship without a documentation page and a place in the directory.
for (const dir of readdirSync(packagesDir, { withFileTypes: true })) {
  if (dir.isDirectory() && existsSync(join(packagesDir, dir.name, 'package.json'))
    && !entries.some(entry => entry.slug === dir.name)) {
    throw new Error(`packages/${dir.name} is missing from apps/docs/lib/plugins.ts`)
  }
}

export function getPlugin(slug: string): PluginInfo {
  const plugin = plugins.find(item => item.slug === slug)
  if (!plugin) throw new Error(`Unknown plugin: ${slug}`)
  return plugin
}

export function pluginsIn(category: CategoryId): PluginInfo[] {
  return plugins.filter(plugin => plugin.category === category)
}
