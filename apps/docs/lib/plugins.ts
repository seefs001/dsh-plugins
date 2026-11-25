import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type CategoryId = 'models' | 'sessions' | 'conversation' | 'tools'
export type Surface = 'Host' | 'Web' | 'Host + Web'

export const categories: { id: CategoryId, title: string, description: string }[] = [
  { id: 'models', title: '模型与审查', description: '选模型、切换服务档位、带推理强度、管理角色和定制自动审查模型。' },
  { id: 'sessions', title: '会话与工作区', description: '自定义分组、工作区清理、切分支、看 Git 改动、GitHub 面板与防休眠。' },
  { id: 'conversation', title: '对话阅读', description: '图表预览、画布、侧聊、引用跳转、工具快捷操作、回复解释、消息编辑与 ACP 集成。' },
  { id: 'tools', title: '工具与集成', description: '搜索与画图工具、话术与技能速查、Pi 预设、配置备份及外部服务集成。' },
]

interface Entry {
  slug: string
  category: CategoryId
  surface: Surface
  summary: string
  requires?: string[]
}

const entries: Entry[] = [
  { slug: 'model-favorites', category: 'models', surface: 'Host + Web', summary: '在模型列表中加星收藏常用模型，顶部置顶收藏分组并支持模型菜单一键切换与排序。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'model-reference', category: 'models', surface: 'Host + Web', summary: '输入 # 插入模型标签，携带该模型上次的推理强度和快速模式。' },
  { slug: 'service-tier', category: 'models', surface: 'Host + Web', summary: '为 OpenAI Responses 请求切换快速（priority）或超快（ultrafast）档位。', requires: ['openai-responses provider'] },
  { slug: 'remember-model', category: 'models', surface: 'Host', summary: '记住顶层会话刚选好的模型和推理强度，新建会话自动沿用。' },
  { slug: 'title-model', category: 'models', surface: 'Host + Web', summary: '为会话标题单独指定模型，与主对话模型分开配置。', requires: ['已启用的原生标题生成器'] },
  { slug: 'subagent-model', category: 'models', surface: 'Web', summary: '在子代理输入框右下角显示其使用的模型和推理强度。' },
  { slug: 'auto-review-model', category: 'models', surface: 'Host + Web', summary: '为 Auto review 单独指定模型和提示词，并查看当前会话的审查日志。', requires: ['@deepseek-ai/dsh-experimental-auto-review', '@deepseek-ai/dsh-storage-domain'] },
  { slug: 'roles', category: 'models', surface: 'Host + Web', summary: '在侧栏管理带系统提示词与专属技能的角色，按会话切换或通过 # 快捷引用。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'recent-sessions', category: 'sessions', surface: 'Web', summary: '将 @ 菜单中的会话按最近活动时间倒序排列。' },
  { slug: 'session-groups', category: 'sessions', surface: 'Host + Web', summary: '自定义侧栏会话分组与组内置顶，通过 Host 跨浏览器同步。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'workspace-manager', category: 'sessions', surface: 'Host + Web', summary: '检查已保存的工作区目录，并提供一步式闲置清理框（失效工作区、遗留后台任务与干净旧 worktree）。' },
  { slug: 'open-in-default', category: 'sessions', surface: 'Web', summary: '在会话顶栏提供记忆默认编辑器的双半区按钮，点击主按钮直接打开目录，下拉箭头仅切换默认项。', requires: ['@deepseek-ai/dsh-host-open-in-app'] },
  { slug: 'branch-switcher', category: 'sessions', surface: 'Host + Web', summary: '在新会话发送第一条消息前直接切换已有本地 Git 分支。', requires: ['Change requests & worktrees'] },
  { slug: 'git-changes', category: 'sessions', surface: 'Web', summary: '在输入框下方显示当前分支和未提交改动统计，点击打开右侧 diff。', requires: ['Change requests & worktrees'] },
  { slug: 'github-panel', category: 'sessions', surface: 'Host + Web', summary: '会话关联 GitHub 仓库或提及链接时，在右侧会话面板展示概览、PR、Issue、Actions 与发布，点击直接新标签打开 GitHub。', requires: ['已登录的 GitHub CLI (gh)'] },
  { slug: 'keep-awake', category: 'sessions', surface: 'Host', summary: 'DSH Host 运行期间阻止 macOS 闲置休眠。', requires: ['macOS'] },
  { slug: 'diagram-preview', category: 'conversation', surface: 'Web', summary: '在对话中渲染 Mermaid、Graphviz、ECharts 和 SVG 图表，支持放大、导出 PNG/SVG 与切回源码。' },
  { slug: 'canvas', category: 'conversation', surface: 'Host + Web', summary: '沙箱隔离的交互画布（.canvas.tsx / .canvas.html / .canvas.svg）与全局画布应用，支持本地活数据订阅、TypeScript 诊断、持久化状态与版本对比。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'side-chat', category: 'conversation', surface: 'Web', summary: '在右栏用相同预设独立追问，将会话引用带回主聊草稿。' },
  { slug: 'quote-jump', category: 'conversation', surface: 'Web', summary: '把用户消息中的引用渲染为可点击块，点击跳回原文并高亮。' },
  { slug: 'tool-lens', category: 'conversation', surface: 'Web', summary: '在工具调用行直接打开技能文件、完整输出、搜索命中文件和子代理会话。' },
  { slug: 'subagent-peek', category: 'conversation', surface: 'Web', summary: '在主会话顶栏显示子代理计数胶囊与实时状态，点击弹出派生树速览并一键跳转或侧栏打开。' },
  { slug: 'message-actions', category: 'conversation', surface: 'Host + Web', summary: '在回复旁点 Wait, what?，用独立模型调用解释回复内容。', requires: ['@deepseek-ai/dsh-storage-domain', '已配置的模型 provider'] },
  { slug: 'message-edit', category: 'conversation', surface: 'Host + Web', summary: '悬停自己的消息即可就地改写或分叉重发。' },
  { slug: 'ai-mascot', category: 'conversation', surface: 'Web', summary: '右下角可拖拽的 GPT / Claude 小伙伴，跟随当前对话状态活动。', requires: ['可访问外部素材站点'] },
  { slug: 'acp-workbench', category: 'conversation', surface: 'Host + Web', summary: '在 DSH 会话中直接运行 Cursor、Antigravity、Claude Code 等本机 ACP CLI，或委派可续聊子代理。', requires: ['已安装并登录的本机 ACP CLI'] },
  { slug: 'prompt-shortcut', category: 'tools', surface: 'Host + Web', summary: '在 DSH Host 跨浏览器收藏常用话术，支持导入导出与 /snippets，搜索后插入输入框光标处。' },
  { slug: 'cheat-sheet', category: 'tools', surface: 'Host + Web', summary: '搜索会话技能、置顶常用项、按实际使用次数排序，直接插入 /命令。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'web-access', category: 'tools', surface: 'Host + Web', summary: '提供 grok_search 和 openai_search，复用已有 Responses provider 的托管搜索。', requires: ['支持托管搜索的 Responses provider'] },
  { slug: 'image-gen', category: 'tools', surface: 'Host + Web', summary: '提供 openai_image 和 grok_image，复用已有 Responses provider 生成并保存图片。', requires: ['支持托管 image_generation 的 Responses provider'] },
  { slug: 'pi-tools', category: 'tools', surface: 'Host + Web', summary: '独立的 pi 预设：Pi 原版工具、MoeJS codemode、会话工具选择器与 MCP 刷新。', requires: ['rg 与 fd'] },
  { slug: 'pi-mcp', category: 'tools', surface: 'Host + Web', summary: '共享 Pi 的 ~/.pi/agent/mcp.json 到 DSH，修改自动热同步并支持在插件页开关服务器。', requires: ['@deepseek-ai/dsh-mcp-manager'] },
  { slug: 'paseo-hub', category: 'tools', surface: 'Host + Web', summary: '把 DSH Host 注册为 Paseo Hub daemon 运行触发，并提供组织 API 控制台与工具。', requires: ['支持 dsh provider 的 Paseo Hub', '@deepseek-ai/dsh-permission-presets', '@deepseek-ai/dsh-storage-domain'] },
  { slug: 'bark-notify', category: 'tools', surface: 'Host + Web', summary: '智能体提问、提交计划或请求工具审批时通过 Bark 推送到手机。', requires: ['Bark 服务或 Device Key'] },
  { slug: 'config-backup', category: 'tools', surface: 'Host + Web', summary: '导出 Host 与插件中对话无关的配置和数据为单文件，并在侧栏页面通过差异预览仅还原已装插件。' },
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
