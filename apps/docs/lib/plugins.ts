import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type CategoryId = 'models' | 'sessions' | 'conversation' | 'tools'
export type Surface = 'Host' | 'Web' | 'Host + Web'

export const categories: { id: CategoryId, title: string, description: string }[] = [
  { id: 'models', title: '模型与审查', description: '选模型、切换服务档位、带推理强度、管理角色和定制自动审查模型。' },
  { id: 'sessions', title: '会话与工作区', description: '会话整理、搜索、自定义分组、工作区清理、切分支、看改动与防休眠。' },
  { id: 'conversation', title: '对话阅读', description: '压缩状态、图表预览、引用跳转、工具快捷操作、回复解释、消息编辑与 ACP 集成。' },
  { id: 'tools', title: '工具与集成', description: '搜索与画图工具、话术与技能速查、Pi 预设、工作时间线及外部服务集成。' },
]

interface Entry {
  slug: string
  category: CategoryId
  surface: Surface
  summary: string
  requires?: string[]
}

const entries: Entry[] = [
  { slug: 'model-reference', category: 'models', surface: 'Host + Web', summary: '输入 # 插入模型标签，携带该模型上次的推理强度和快速模式。' },
  { slug: 'service-tier', category: 'models', surface: 'Host + Web', summary: '为 OpenAI Responses 请求切换快速（priority）或超快（ultrafast）档位。', requires: ['openai-responses provider'] },
  { slug: 'remember-model', category: 'models', surface: 'Host', summary: '记住顶层会话刚选好的模型和推理强度，新建会话自动沿用。' },
  { slug: 'title-model', category: 'models', surface: 'Host + Web', summary: '为会话标题单独指定模型，与主对话模型分开配置。', requires: ['已启用的原生标题生成器'] },
  { slug: 'subagent-model', category: 'models', surface: 'Web', summary: '在子代理输入框右下角显示其使用的模型和推理强度。' },
  { slug: 'auto-review-model', category: 'models', surface: 'Host + Web', summary: '为 Auto review 单独指定模型和提示词，并查看当前会话的审查日志。', requires: ['@deepseek-ai/dsh-experimental-auto-review', '@deepseek-ai/dsh-storage-domain'] },
  { slug: 'roles', category: 'models', surface: 'Host + Web', summary: '在侧栏管理带系统提示词与专属技能的角色，并在模型菜单按会话切换。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'session-search', category: 'sessions', surface: 'Web', summary: '在侧栏打开搜索面板，按标题、工作区或消息正文查找历史对话。' },
  { slug: 'recent-sessions', category: 'sessions', surface: 'Web', summary: '将 @ 菜单中的会话按最近活动时间倒序排列。' },
  { slug: 'session-lifecycle', category: 'sessions', surface: 'Host + Web', summary: '按需要你、进行中、暂缓和归置整理会话，集中查看待答请求与轮次结果。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'session-groups', category: 'sessions', surface: 'Host + Web', summary: '自定义侧栏会话分组与组内置顶，通过 Host 跨浏览器同步。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'workspace-manager', category: 'sessions', surface: 'Host + Web', summary: '查看已保存的工作区目录并移除失效条目。' },
  { slug: 'branch-switcher', category: 'sessions', surface: 'Host + Web', summary: '在新会话发送第一条消息前直接切换已有本地 Git 分支。', requires: ['Change requests & worktrees'] },
  { slug: 'git-changes', category: 'sessions', surface: 'Web', summary: '在输入框下方显示当前分支和未提交改动统计，点击打开右侧 diff。', requires: ['Change requests & worktrees'] },
  { slug: 'keep-awake', category: 'sessions', surface: 'Host', summary: 'DSH Host 运行期间阻止 macOS 闲置休眠。', requires: ['macOS'] },
  { slug: 'compaction-status', category: 'conversation', surface: 'Host + Web', summary: '上下文压缩期间在输入框上方显示状态和耗时。' },
  { slug: 'diagram-preview', category: 'conversation', surface: 'Web', summary: '在对话中渲染 Mermaid、Graphviz、ECharts 和 SVG 图表，并支持切回源码。' },
  { slug: 'side-chat', category: 'conversation', surface: 'Web', summary: '在右栏用相同预设独立追问，将会话引用带回主聊草稿。' },
  { slug: 'quote-jump', category: 'conversation', surface: 'Web', summary: '把用户消息中的引用渲染为可点击块，点击跳回原文并高亮。' },
  { slug: 'tool-lens', category: 'conversation', surface: 'Web', summary: '在工具调用行直接打开技能文件、完整输出、搜索命中文件和子代理会话。' },
  { slug: 'message-actions', category: 'conversation', surface: 'Host + Web', summary: '在回复旁点 Wait, what?，用独立模型调用解释回复内容。', requires: ['@deepseek-ai/dsh-storage-domain', '已配置的模型 provider'] },
  { slug: 'message-edit', category: 'conversation', surface: 'Host + Web', summary: '悬停自己的消息即可就地改写或分叉重发。' },
  { slug: 'ai-mascot', category: 'conversation', surface: 'Web', summary: '右下角可拖拽的 GPT / Claude 小伙伴，跟随当前对话状态活动。', requires: ['可访问外部素材站点'] },
  { slug: 'acp-workbench', category: 'conversation', surface: 'Host + Web', summary: '在 DSH 会话中直接运行 Cursor、Antigravity、Claude Code 等本机 ACP CLI，或委派可续聊子代理。', requires: ['已安装并登录的本机 ACP CLI'] },
  { slug: 'prompt-shortcut', category: 'tools', surface: 'Web', summary: '在当前浏览器收藏常用话术，搜索后插入输入框光标处。' },
  { slug: 'cheat-sheet', category: 'tools', surface: 'Host + Web', summary: '搜索会话技能、置顶常用项、按实际使用次数排序，一键插入 /命令。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'web-access', category: 'tools', surface: 'Host + Web', summary: '提供 grok_search 和 openai_search，复用已有 Responses provider 的托管搜索。', requires: ['支持托管搜索的 Responses provider'] },
  { slug: 'image-gen', category: 'tools', surface: 'Host + Web', summary: '提供 openai_image 和 grok_image，复用已有 Responses provider 生成并保存图片。', requires: ['支持托管 image_generation 的 Responses provider'] },
  { slug: 'pi-tools', category: 'tools', surface: 'Host + Web', summary: '独立的 pi 预设：Pi 原版工具、MoeJS codemode、会话工具选择器与 MCP 刷新。', requires: ['rg 与 fd'] },
  { slug: 'work-timeline', category: 'tools', surface: 'Host + Web', summary: '在会话内展示工作计划、修订历史与产物面板，工具由 dsh-work-timeline/tools 导出。' },
  { slug: 'pi-mcp', category: 'tools', surface: 'Host', summary: '共享 Pi 的 ~/.pi/agent/mcp.json 到 DSH，修改文件自动热同步。', requires: ['@deepseek-ai/dsh-mcp-manager'] },
  { slug: 'paseo-hub', category: 'tools', surface: 'Host + Web', summary: '把 DSH Host 注册为 Paseo Hub daemon 运行触发，并提供组织 API 控制台与工具。', requires: ['支持 dsh provider 的 Paseo Hub', '@deepseek-ai/dsh-permission-presets', '@deepseek-ai/dsh-storage-domain'] },
  { slug: 'bark-notify', category: 'tools', surface: 'Host + Web', summary: '智能体提问、提交计划或请求工具审批时通过 Bark 推送到手机。', requires: ['Bark 服务或 Device Key'] },
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
