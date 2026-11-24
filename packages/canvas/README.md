# dsh-canvas

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中提供 **Artifacts 级沙箱交互画布与全局动态应用工作台**，支持 `.canvas.tsx`（React）、`.canvas.html`（独立离线 HTML）与 `.canvas.svg`（矢量图），并具备 **0 token 实时本地数据订阅、白名单双向动作与全局 `~/.dsh/canvases/` 应用模式**。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 激活方式 | 会话侧按需开关（未开启零注入）；全局应用通过左侧栏「画布应用」随时访问 |
| 源码位置 | 工作区 `<cwd>/.dsh/canvases/*.canvas.{tsx,html,svg}` 与全局 `~/.dsh/canvases/*.canvas.{tsx,html,svg}`，实时热重载 |
| 状态存储 | Host `canvas` storage domain 保存会话开关、`useCanvasState` 交互状态与最近 25 次修订快照 |

## 安装

```bash
dsh plugin --profile web add "github:seefs001/dsh-plugins#main&path:/packages/canvas"
```

本地开发链接：

```bash
dsh plugin --profile web add "link:$PWD/packages/canvas"
```

## 核心能力

- **按会话零侵入 + 全局独立应用页**：会话内默认零注入，开启后动态暴露 `canvas` skill 与 `canvas_write` / `canvas_check` / `canvas_state` 工具；同时在左侧栏提供独立「画布应用」全屏页面，管理 `~/.dsh/canvases/` 下的跨项目全局应用（内置 **Chief of Staff 全局总控台** 模板）。
- **多格式 Artifact 与完整生态**：支持 `.canvas.tsx`（允许从 `dsh/canvas`、`react`、`lucide-react` 导入）、`.canvas.html` 与 `.canvas.svg`；内置 `Markdown`、`CodeBlock`、`Kanban`、`Modal`、`Drawer`、`SplitPane`、`EmptyState`、`ProgressBar`、`SearchInput`、`KeyValue`、`Timeline`、65+ 离线 Lucide 图标、图表与 DAG 组件，以及离线主题跟随 utility CSS 类。
- **0 Token 响应式活数据订阅**：通过 `useCanvasFile` / `useCanvasGlob`（支持 `workspace://` 与 `bots://`，自动解析 JSON 与 Markdown YAML frontmatter，Host `fs.watch` 经 SSE 毫秒级推送）和 `useHostData('sessions' | 'schedules' | 'git')`，后台脚本/Schedule 更新磁盘文件即可实时刷新画布。
- **白名单双向动作**：在保留严格 CSP（`default-src 'none'`、nonce-only script、`connect-src 'none'`）的前提下，`useCanvasAction()` 支持 `openFile`、`askInChat`、`copyText`、白名单 `patchData`（仅限 `bots://<bot>/ledger/*.{json,md}` 与 `workspace://.dsh/canvas-data/*.{json,md}`，0 token 落盘）、`sendToSession`（跨会话发消息）、`triggerSchedule`（手动触发定时任务）与 `openCanvas`。
- **Artifacts 交互闭环**：对话流内将 `canvas_write` 渲染成专属 Artifact 卡片；支持运行时错误一键让智能体修复、预览底栏快捷微调输入条、25 次修订 Diff 恢复、全屏预览与一键导出离线单文件 HTML / SVG。

## 构建运行时

修改 `src/` 下 SDK 运行时代码后重新打包 `lib/client.runtime.js`：

```bash
pnpm --filter dsh-canvas build
```

更多说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/canvas)。
