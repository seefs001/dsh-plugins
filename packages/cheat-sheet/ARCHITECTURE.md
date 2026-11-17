# Skill cheat sheet architecture

## Problem

功能不变：保留原生会话技能目录、本机中文 JSON、共享置顶与真实加载计数。当前问题是 `Sheet` 同时合并字典、过滤、搜索、排序、分组和决定空状态，行、详情和置顶按钮还会各自查询原始字典。一条展示规则的修改容易分散到多个调用点。

## Usage (caller's view)

组件先获取目录和共享状态，再调用一次私有纯函数；渲染端只读取行数据。

```js
const view = buildSkillView(catalog.skills, usageReady ? usage.data : null, {
  query, sort, showAutomatic,
})
const current = view.rows.find(row => row.name === selected) ?? view.rows[0] ?? null

// 列表与详情使用同一批行对象，不再分别查询名称字典。
const lists = view.groups.map(({ key, rows }) =>
  h('ul', { key, 'aria-label': t(key) }, ...rows.map(renderRow)))

// 无选中行时没有置顶动作；按钮内部在点击时才发起操作。
const pinAction = current ? pinButton(current, false) : null
// 点击后：POST { action: 'pin', name: current.name, pinned: !current.pinned }
// 收到 Host 确认前不更改展示状态。
```

## Shape

下面是结构草图；实现仍为普通 JavaScript，JSDoc 记录契约，不引入 TypeScript 构建。

```ts
type SkillInfo = {
  name: string
  description: string
  whenToUse?: string
  modelInvocable: boolean
}
type SharedData = {
  pinned: string[]
  counts: Record<string, number>
  descriptions: Record<string, string>
}
type SkillRow = SkillInfo & {
  summary: string | null // null：没有中文摘要，使用作者原文
  loads: number | null  // null：次数未知；0：已读取状态，尚无记录
  pinned: boolean
}
type ViewOptions = { query: string; sort: 'usage' | 'name'; showAutomatic: boolean }
type SkillView = {
  rows: SkillRow[]
  groups: { key: 'groupPinned' | 'groupOther' | 'groupAll'; rows: SkillRow[] }[]
  effectiveSort: 'usage' | 'name'
  hiddenAutomatic: number
  emptyKey: 'empty' | 'emptyManual' | 'noMatches' | null
}
function buildSkillView(skills: SkillInfo[], shared: SharedData | null, options: ViewOptions): SkillView
```

| 所有者 | 掌握的知识 | 不承担的职责 |
| --- | --- | --- |
| DSH `remote.skills.list` | 当前会话哪些技能可供用户调用、是否允许 Agent 调用 | 插件收藏、次数、中文文案 |
| `lib/state.js` | 持久化状态约束、纯状态转换、成功加载事件识别 | HTTP、文件读取、列表展示 |
| `lib/index.js` | 单一写入队列、HTTP/工具适配、读取本机 JSON | 过滤、搜索、排序、技能注册 |
| `buildSkillView`，位于 `lib/client.js` | 按名关联数据、空值含义、过滤、搜索、排序、分组及空状态 | 网络、React、文件 I/O、状态写入 |
| `Sheet`，位于 `lib/client.js` | 请求生命周期、交互、选择、焦点、渲染 | 再次按名称查询底层字典、复制展示规则 |

写入命令属于 `Sheet` 的交互适配：只使用当前会话 Slot 提供的 `inputActions`，先捕获 `draftRev`，再以 `start: 0, end: 0` 的范围写入 `/技能名 `。不使用整份草稿替换、DOM 输入操作或提交接口；保留原文、引用片段与附件。成功后关闭弹窗，失败则留在弹窗内提示重试。

这是一个私有函数边界，不是新增 Service、导出模块或持久化模型。它集中完整展示策略，避免为加载、转换、分组各建一层，遵循 interface-depth 和 boundary-discipline。

目录与共享状态仍分别读取。共享状态不可用时，`loads` 为 `null`，按名称排列并禁用置顶，不伪造零次。共享状态有效但缺少某个技能的计数时，才得到 `0`。投影函数自己完成名称排序，不依赖调用方预先整理目录。分组与键盘导航共用同一批有序行对象。

## Synthesis decision

比较了两种完整结构，按 1–5 分自评；这是设计判断，不是运行测量。

| 准则 | A：原生目录 + Client 投影 | B：Host 完整视图接口 |
| --- | --- | --- |
| 保留原生目录权威 | 5 | 5 |
| 可选插件状态失败时仍可浏览目录 | 5 | 2 |
| 搜索和过滤不新增请求 | 5 | 2 |
| 渲染端不泄漏底层字典 | 3，需修订 | 5 |
| 不扩大接口、依赖和迁移范围 | 5 | 2 |

选择 A。吸收 B 的完整行结构和 `null` 表示未知次数的设计，消除 A 中渲染端仍查询字典的问题。拒绝 B 的新 `/cheat-sheet/view` 协议：它把展示选项变成网络参数，让基本浏览依赖插件端点；再增加原生回退、缓存或防抖会扩大本次任务。

本轮未获额外子代理委派授权，由主代理顺序构造并筛选两个方案；未进行跨模型评审，不宣称存在独立裁判意见。

## Tradeoffs accepted

- 接受目录与共享状态不是跨来源的原子快照，换取原生能力和可选插件状态的故障隔离。
- 接受中文摘要随现有共享状态响应返回，换取不新增端点、缓存或读取路径；工具输出仍只有置顶和次数。
- 接受 CSS、交互和纯投影留在同一个 Client 工件，换取不新增构建系统或模块加载层。职责通过一个具名函数明确隔开，而不是靠增加文件数量。
- 接受 JSDoc 而非编译期强类型证明，保留现有 plain-JavaScript 发布方式；存储、JSON 和 HTTP 边界继续执行已有运行时校验。

## Alternatives considered

- **Host 完整视图接口**：能隐藏更多关联逻辑，但会引入新的目录依赖、请求参数和失败耦合。本次只有一个交互式消费者，不值得扩大公共接口。
- **只按加载、过滤、排序拆小工具**：表面上文件更短，但调用方仍需掌握阶段顺序和原始字典，属于 temporal decomposition，未解决知识泄漏。

## Open questions and risks

- 是否需要跨多个消费者提供统一视图？当前没有这个需求；有真实消费者后再重新评估 Host 视图接口。
- 浏览器中的焦点、输入法、输入框写入和真实次数变化是否与预期一致？未获浏览器验证授权，本轮不验证，也不以静态检查代替。
- 本机 JSON 读取是否已在运行 Host 激活？用户选择暂不重启，留待下次 Host 重载后确认；本轮不改变这个决定。

## Implementation and verification

已在 `client.js` 实现私有纯投影，移除组件中的字典查询、预排序和重复分组规则。渲染器使用完整行，置顶请求仍等待 Host 确认。本轮未修改 Host、HTTP 或持久化格式，也未修改中文 JSON。

语法检查、oxlint（0 警告）、现有 38 项测试、包校验通过；打包清单确认包含本文档。既有测试不代表视图函数或浏览器交互已得到专项覆盖，本轮未新增测试、未做浏览器验证、未重启服务。实现未出现重复变通或需要推翻草图的偏离。
