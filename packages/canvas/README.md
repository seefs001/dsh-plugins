# dsh-canvas

在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）会话旁提供沙箱隔离的交互式 React 画布，基于工作区 `.canvas.tsx` 文件，**按会话按需开启、默认零注入**。

| 项目 | 说明 |
| --- | --- |
| 运行位置 | Host + Web |
| 激活方式 | 按会话手动开关；未开启的会话零 skill、零 tool、零 system prompt 注入 |
| 源码位置 | 工作区 `.canvas.tsx` 文件（默认 `<cwd>/.dsh/canvases/<name>.canvas.tsx`），实时监听热重载 |
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

- **按会话开关，零侵入默认行为**：在输入框旁或右侧画布面板开启当前会话的 Canvas 模式后，才向该会话动态暴露 `canvas` skill、提示词指引以及 `canvas_write` / `canvas_check` / `canvas_state` 工具；关闭后立即卸载。
- **工作区 `.canvas.tsx` 文件与实时热重载**：自动发现并监听工作区内的 `.canvas.tsx` 文件，无论由智能体写入、在 DSH 源码视图编辑还是外部编辑器保存，都会自动重新编译并热更新预览。
- **严格策略校验与 TypeScript 诊断**：单文件仅允许从 `dsh/canvas` 导入，禁止网络调用与动态执行；Host 内置完整 `dsh/canvas` 类型定义，返回精确行号诊断并支持在面板中一键「让智能体修复」。
- **强隔离沙箱与完整 SDK**：使用 `sandbox="allow-scripts"` + 随机 nonce CSP（无 `unsafe-eval`、无网络）+ `MessageChannel` 渲染，内置布局、表单、可排序表格、SVG 柱状图/折线图/饼图、`UsageBar`、`DiffView`、`TodoList`、`DAGView`、`useHostTheme`、`useCanvasState` 与 `useCanvasAction`（`openFile` / `askInChat` / `copyText`）。
- **版本历史与全屏视图**：自动记录每次保存的修订与逐行 Diff，支持一键恢复历史版本以及全屏弹窗浏览宽表与图表。

## 构建运行时

修改 `src/` 下 SDK 运行时代码后重新打包 `lib/client.runtime.js`：

```bash
pnpm --filter dsh-canvas build
```

更多说明见[在线文档](https://seefs001.github.io/dsh-plugins/docs/plugins/canvas)。
