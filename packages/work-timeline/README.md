# Work timeline

DSH 会话内的工作计划、修订过程与产物面板。它替换 Pi 的 TODO，不运行工作流，不代替 goal、权限审批或 plan mode。

## 使用

更新后的 `dsh-pi-tools` 依赖本包，并在原 **pi** preset 挂载 `dsh-work-timeline/tools`。不新增 preset。

- `work_update` 创建/更新当前工作；必须直接调用，不支持 codemode 嵌套写入。
- `work_read` 返回完整当前快照和 revision；`history: true` 同时返回最近 20 次修订。
- 输入框上方的摘要条显示标题、当前步骤或阻塞原因、完成数和进度；点击打开右侧详情。也可从右侧面板的工作时间线入口打开。
- 详情顶部是概览：报告状态、标题、目标、进度（取消的步骤单独计数，不算完成）。随后列出需要关注的步骤：受阻步骤优先，其次是报告进行中的步骤，再次是下一步；首屏最多 2 项并提示剩余数量，点击可定位到计划。显式 `role: deliverable` 的交付物前置为文件入口，最多 3 个，其余进入产物视图。修订号、更新时间、状态来源说明和继承说明收在“详情”里；展开详情同时显示完整的标题、目标和结果。整个面板只有一个滚动区域。
- **计划**以步骤轨道展示状态、阻塞和结果，当前步骤高亮，步骤下的关联文件可直接预览。
- **过程**按修订倒序展示原因与步骤/产物状态变化，可跳回对应步骤或产物。
- **产物**按交付物与依据分组，可按步骤筛选，点击文件复用宿主预览。
- 视图标签支持方向键、Home、End 切换。
- 旧会话没有 Work 时，输入区继续显示原 todos projection 的兼容清单。

本包的独立 bundle 只提供投影与 UI。其他 preset 如需使用工具，需要显式挂载 `dsh-work-timeline/tools` 并暴露两个工具；不安装第二份 React 或外部预览服务。

## 第一次写入

```json
{
  "action": "create",
  "expectedRevision": 0,
  "reason": "开始定位登录回归",
  "snapshot": {
    "title": "修复登录回归",
    "objective": "定位回调失败原因，完成修复并说明验证范围",
    "status": "active",
    "steps": [
      { "id": "diagnose", "content": "复现并定位原因", "status": "in_progress" },
      { "id": "fix", "content": "实施修复", "status": "pending" }
    ],
    "artifacts": []
  }
}
```

后续使用 `action: replace`，传入返回的 `workId`、当前 `expectedRevision` 和完整 snapshot。改名、重排保留 ID。创建下一项工作也必须传当前修订，不能每次用 0。每次被接受的非空变化递增 revision；相同快照不新增修订；旧 revision 拒绝，不静默覆盖。

产物示例（路径换成当前 Session 的实际绝对路径）：

```json
{
  "id": "report",
  "title": "问题定位报告",
  "path": "/absolute/workspace/reports/login.md",
  "stepId": "diagnose",
  "role": "deliverable",
  "description": "记录复现条件、原因和后续验证范围"
}
```

`role: evidence` 表示支撑结论的依据。文件引用只打开当前内容，不复制文件、不保存版本，也不验证文件内容。缺失、删除或无权限的文件由宿主预览报告错误。不要用产物引用代替真正的检查结果。

## 状态模型

主体是当前 Session 的 Work，公开写入接口是 `work_update`；只有成功顶层工具结果入日志之后状态才可见。

| 状态/事件 | 行为 |
| --- | --- |
| 首次 create | 创建 Work，revision=1 |
| 当前 Work active 时 create | 拒绝，先结束或取消原工作 |
| replace 当前身份与修订 | 校验完整快照，变化时递增 revision |
| 修改、取消、重开 | 必须提供 reason；记录新修订，旧历史不覆盖 |
| 步骤 pending / in_progress / blocked / completed / canceled 之间切换 | 显式报告；blocked 必填 blocker；离开 blocked 清除 blocker；completed 必填 outcome |
| 删除旧步骤或产物 ID | 拒绝；取消步骤应保留 canceled 记录 |
| Work completed / canceled | 必填 outcome，不能留有未结束步骤；允许用有理由的新修订重开 |
| 相同快照 | no-op，不制造时间线记录 |
| 错误、取消、嵌套调用 | 不提交状态 |
| turn/start / turn/end / Stop | 不修改业务状态；面板明确显示最后报告值而非实际运行状态 |
| fork | 精确 inheritedEventCount 标识继承快照；后续写入只属于子 Session |

完成状态是 Agent 的报告，不自动等于验收成功。每 Session 仅保留一个当前 Work。开始下一项后，原 Work 仍在原始工具记录中，当前详情不提供跨 Work 浏览。

## 持久化与接入

- 成功的标准 `tool/result.meta.dshWorkTimeline` 承载完整 Work 快照。
- `dsh-work-timeline` projection 提供当前状态与最近 100 次修订摘要，`wire.summary: false` 避免扩大会话列表。
- Client 只订阅 Host 投影，不自行折叠日志或写业务状态。
- 输入区接管 `conversation.input.dock` 的 `todo` cell；详情使用正式 Sidebar tab type。
- 工具由 preset scoped 注册；Host 根插件保持历史投影在没有活跃 Agent 时可用。
- 不写自定义 Session 事件，不建数据库，不注入整个执行历史。
- 文件预览使用当前 Session 的资源地址，由宿主维持文件权限和预览生命周期。

## 本地安装与验证边界

本仓库使用 pnpm workspace。先在仓库根安装工作区依赖，再通过 DSH plugin manager 安装/更新本地 `packages/pi-tools`；它会挂载 Work Timeline，无需另外启用独立 bundle。修改本地文件不等于 profile 的 preset 已更新。安装影响整个 profile，应先获得授权。

更新后必须新建 **pi** 会话。已有会话及其工具选择保留原 revision；有自定义工具默认值时检查 work_read/work_update 是否已选择。

回滚需要恢复 Pi preset 中的 pi-todo、scopedTools 与提示词，并恢复旧包依赖后更新 bundle、新建会话。仅卸载 Client 视图不会恢复旧工具。Work 记录仍是标准 Session 事件，可由通用工具结果查看，不改写旧 TODO 日志。

UI 当前只读。不包含历史文件版本、任意 HTML/React 运行沙箱、自动任务归属、共享任务调度或直接编辑。

## 开发验证

`pnpm exec oxlint --deny-warnings packages/work-timeline/lib packages/pi-tools/client.js` 检查受影响 JavaScript；`pnpm run validate` 检查包与资源；`pnpm run test` 执行仓库现有测试。

本轮本地验证通过：受影响文件 lint、包静态验证、仓库原有 17 项测试。另在隔离的内存 Cordis context 中使用安装版 DSH 原生 executor、Session 和 projection，确认写入/读回、修订冲突拒绝、no-op、JSON 序列化后重放、checkpoint 恢复、fork 继承、嵌套写入拒绝和取消不改状态。没有新增或修改测试文件。

尚未更新运行 profile，也未验证 Pi 的真实模型回合、磁盘落盘后重启恢复、UI 点击、明暗主题或移动端效果。这些需要获准安装及浏览器验证后确认；隔离检查不等于端到端验收。
