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
  { id: 'models', title: '模型与审查', description: '选模型、切换服务档位、带推理强度、管理角色和定制自动审查模型。' },
  { id: 'sessions', title: '会话与工作区', description: '跨会话收件箱、自定义分组、工作区清理、切分支、看改动与防休眠。' },
  { id: 'conversation', title: '对话阅读', description: '看清上下文压缩、引用跳转、工具快捷操作、回复解释、消息编辑与 ACP 集成。' },
  { id: 'tools', title: '工具与集成', description: '搜索与画图工具、话术与技能速查、Pi 预设、工作时间线及外部服务集成。' },
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
  { slug: 'model-reference', category: 'models', surface: 'Host + Web', summary: '输入 # 插入模型标签，自动带上该模型上次的推理强度和快速模式。' },
  { slug: 'service-tier', category: 'models', surface: 'Host + Web', summary: '给 OpenAI Responses 请求切换快速（priority）或超快（ultrafast）档位。', requires: ['openai-responses provider'] },
  { slug: 'remember-model', category: 'models', surface: 'Host', summary: '记住顶层会话刚选好的模型和推理强度，新建会话直接沿用。' },
  { slug: 'title-model', category: 'models', surface: 'Host + Web', summary: '为对话标题单独选一个模型，不影响主对话模型和标题触发策略。', requires: ['已启用的原生标题生成器'] },
  { slug: 'subagent-model', category: 'models', surface: 'Web', summary: '在子代理输入框右下角显示它记录的模型和推理强度（只读）。' },
  { slug: 'auto-review-model', category: 'models', surface: 'Host + Web', summary: '为 Auto review 单独选模型和审查提示词，并实时查看每个会话的审查日志。', requires: ['@deepseek-ai/dsh-experimental-auto-review', '@deepseek-ai/dsh-storage-domain'] },
  { slug: 'roles', category: 'models', surface: 'Host + Web', summary: '在侧栏管理带系统提示词与专属技能的角色，在模型菜单按会话切换。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'recent-sessions', category: 'sessions', surface: 'Web', summary: '@ 菜单里的会话按最近活动排序，刚聊过的排最前。' },
  { slug: 'inbox', category: 'sessions', surface: 'Host + Web', summary: '跨会话收件箱，只把需要你拍板或回答的会话计入角标，子任务归并到主会话下。' },
  { slug: 'session-groups', category: 'sessions', surface: 'Host + Web', summary: '自定义会话分组和组内置顶，所有浏览器和 Agent 同步共享。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'workspace-manager', category: 'sessions', surface: 'Host + Web', summary: '移除保存过的工作区记录、清理失效目录条目，不动磁盘文件和会话。' },
  { slug: 'branch-switcher', category: 'sessions', surface: 'Host + Web', summary: '新会话发第一条消息前，直接在页面里切换到已有本地分支。', requires: ['Change requests & worktrees'] },
  { slug: 'git-changes', category: 'sessions', surface: 'Web', summary: '在输入框下方显示分支和未提交改动统计，点一下打开右侧 diff。', requires: ['Change requests & worktrees'] },
  { slug: 'keep-awake', category: 'sessions', surface: 'Host', summary: 'DSH Host 运行期间阻止 Mac 闲置休眠，屏幕仍照常熄灭和锁屏。', requires: ['macOS'] },
  { slug: 'compaction-status', category: 'conversation', surface: 'Host + Web', summary: '压缩上下文时，在输入框上方显示状态和已等待时间。' },
  { slug: 'diagram-preview', category: 'conversation', surface: 'Web', summary: '在对话里预览 Mermaid、Graphviz、ECharts 和 SVG 图表，一键切回原代码。' },
  { slug: 'quote-jump', category: 'conversation', surface: 'Web', summary: '把用户消息里的引用变成可点击块，点一下跳回原文并高亮。' },
  { slug: 'tool-lens', category: 'conversation', surface: 'Web', summary: '点工具调用行直接打开技能文件、完整输出、搜索命中文件和子代理对话。' },
  { slug: 'message-actions', category: 'conversation', surface: 'Host + Web', summary: '在回复旁点 Wait, what?，用独立模型把话重新讲明白，不写进主对话。', requires: ['@deepseek-ai/dsh-storage-domain', '已配置的模型 provider'] },
  { slug: 'message-edit', category: 'conversation', surface: 'Host + Web', summary: '悬停自己的消息即可就地改写并默认清空后续上下文，也支持分叉重发。' },
  { slug: 'ai-mascot', category: 'conversation', surface: 'Web', summary: '右下角可拖拽的 GPT / Claude 小伙伴，跟随当前对话的真实活动。', requires: ['可访问外部素材站点'] },
  { slug: 'acp-workbench', category: 'conversation', surface: 'Host + Web', summary: '在原会话直接运行 Cursor、Antigravity、Claude Code 等本机 ACP 工具，或委派可续聊原生子代理。', requires: ['已安装并登录的本机 ACP CLI'] },
  { slug: 'prompt-shortcut', category: 'tools', surface: 'Web', summary: '在当前浏览器存下常用话术，搜索后插入光标处，由你决定何时发送。' },
  { slug: 'cheat-sheet', category: 'tools', surface: 'Host + Web', summary: '搜索可用技能、置顶常用项（按实际使用次数排序），一键把 /命令 填进输入框。', requires: ['@deepseek-ai/dsh-storage-domain'] },
  { slug: 'web-access', category: 'tools', surface: 'Host + Web', summary: '新增 grok_search 和 openai_search，复用已有 Responses provider 的托管搜索。', requires: ['支持托管搜索的 Responses provider'] },
  { slug: 'image-gen', category: 'tools', surface: 'Host + Web', summary: '新增 openai_image 和 grok_image，复用已有 Responses provider 的托管画图并保存为文件。', requires: ['支持托管 image_generation 的 Responses provider'] },
  { slug: 'pi-tools', category: 'tools', surface: 'Host + Web', summary: '独立的 pi 预设：Pi 原版工具与提示词、MoeJS codemode、会话工具选择器与 MCP 刷新。', requires: ['rg 与 fd'] },
  { slug: 'work-timeline', category: 'tools', surface: 'Host + Web', summary: '会话里的工作计划、修订过程和产物面板（替换 Pi 预设的 TODO）；工具由 dsh-work-timeline/tools 提供。' },
  { slug: 'pi-mcp', category: 'tools', surface: 'Host', summary: '在 DSH 里共用 Pi 的 ~/.pi/agent/mcp.json，改文件热同步生效。', requires: ['@deepseek-ai/dsh-mcp-manager'] },
  { slug: 'orbit-bridge', category: 'tools', surface: 'Host + Web', summary: '只读巡检 Orbit 项目，对比上次检查列出新增、变动和消失的任务，不写 Orbit。', requires: ['Orbit MCP 服务器', '@deepseek-ai/dsh-storage-domain'] },
  { slug: 'paseo-hub', category: 'tools', surface: 'Host + Web', summary: '把 DSH Host 作为 daemon 接入 Paseo Hub 运行触发，或通过组织 API 管理触发器。', requires: ['支持 dsh provider 的 Paseo Hub', '@deepseek-ai/dsh-permission-presets', '@deepseek-ai/dsh-storage-domain'] },
  { slug: 'bark-notify', category: 'tools', surface: 'Host + Web', summary: '智能体提问、审阅计划或请求权限审批时，顺便通过 Bark 发送手机推送。', requires: ['Bark 服务或 Device Key'] },
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
