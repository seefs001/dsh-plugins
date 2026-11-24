# dsh-canvas

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）中提供沙箱隔离的交互画布与全局应用工作台，支持 `.canvas.tsx`（React）、`.canvas.html`（独立离线 HTML）与 `.canvas.svg`（矢量图），支持零 token 本地数据订阅、白名单宿主动作与全局 `~/.dsh/canvases/` 应用。

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

## 功能

- **按会话启用与全局应用页**：会话内默认零注入，开启后动态暴露 `canvas` skill 与 `canvas_write` / `canvas_check` / `canvas_state` 工具；同时在左侧栏提供独立「画布应用」全屏页面，管理 `~/.dsh/canvases/` 下的跨项目全局应用（内置 **Chief of Staff 全局总控台** 模板）。
- **多格式画布与内置组件**：支持 `.canvas.tsx`（允许从 `dsh/canvas`、`react`、`lucide-react` 导入）、`.canvas.html` 与 `.canvas.svg`；内置 `Markdown`、`CodeBlock`、`Kanban`、`Modal`、`Drawer`、`SplitPane`、`EmptyState`、`ProgressBar`、`SearchInput`、`KeyValue`、`Timeline`、65+ 离线 Lucide 图标、图表与 DAG 组件，以及离线主题跟随 utility CSS 类。
- **零 token 本地数据订阅**：通过 `useCanvasFile` / `useCanvasGlob`（支持 `workspace://` 与 `bots://`，自动解析 JSON 与 Markdown YAML frontmatter，Host 通过 `fs.watch` 与 SSE 实时推送）和 `useHostData('sessions' | 'schedules' | 'git')`，后台脚本或定时任务更新磁盘文件即可实时刷新画布。
- **白名单宿主动作**：在保留严格 CSP（`default-src 'none'`、nonce-only script、`connect-src 'none'`）的前提下，`useCanvasAction()` 支持 `openFile`、`askInChat`、`copyText`、白名单 `patchData`（仅限 `bots://<bot>/ledger/*.{json,md}` 与 `workspace://.dsh/canvas-data/*.{json,md}`，0 token 落盘）、`sendToSession`（跨会话发消息）、`triggerSchedule`（手动触发定时任务）与 `openCanvas`。
- **对话内卡片与交互**：对话流内将 `canvas_write` 渲染成专属 Artifact 卡片；支持运行时错误点击让智能体修复、预览底栏快捷微调输入条、25 次修订 Diff 恢复、全屏预览与导出离线单文件 HTML / SVG。

## 构建运行时

修改 `src/` 下 SDK 运行时代码后重新打包 `lib/client.runtime.js`：

```bash
pnpm --filter dsh-canvas build
```

更多说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/canvas)。
