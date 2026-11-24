# dsh-plugins 项目协作规则

## 仓库定位与基线

- 本仓维护独立的 DeepSeek Harness（DSH）插件，位于 `packages/<name>`，包名固定为 `dsh-<name>`。
- 本机 DSH 安装基线为 `/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/`（`engines.dsh`: `>=0.2.3-alpha.2 <0.3.0`）。
- 保持同仓零硬依赖：任意 `packages/<name>` 必须可在兼容 DSH profile 中单独安装，不依赖同仓其他包。
- 改动 `packages/acp-workbench` 时，先读 `packages/acp-workbench/AGENTS.md`（覆盖 ACP 协议、流式桥接、提问/审批交互与子进程/存储约束）。

## 代码风格与静态约束

- `pnpm run lint` 使用 Oxlint（`--deny-warnings`）与 `scripts/oxlint-plugin.mjs`：
  - `dsh/no-comments`：除 shebang、文件头许可证、单行 URL 和单行 `// external: <reason>`（说明不可改变的外部依赖、平台或 DSH 宿主限制）外，禁止写注释。
  - `dsh/no-suppression-comments`：禁止 `oxlint-disable`、`eslint-disable`、`@ts-ignore`、`@ts-expect-error`、`@ts-nocheck`。
  - `dsh/no-legacy-compat`：禁止残留已移除的旧版兼容标识（如 `dsh-inbox`、`llm-pi-ai/model-defaults`）。
- 禁止在包目录下放置内部设计文档（`DESIGN.md`、`ARCHITECTURE.md`、`PASEO-PARITY.md`），`scripts/validate.mjs` 会拒绝。

## 前端 UI 与性能约定

- 组件与主题：复用 `@deepseek-ai/dsh-client-ui-primitives` 原语，不用 `window.prompt()` / `window.confirm()`（Electron 不可用）或手写 `<dialog>`。DSH 的 `--dsw-alias-*` 声明在 `body` 与 `body[data-ds-dark-theme]`（不在 `document.documentElement`），读取宿主主题必须读 `document.body`；自定义样式统一使用 `--dsw-*` 语义令牌并兼顾浅色模式。
- 会话内工具视图（`tool.call.toolview`）：对齐原生 `ToolRow` / `DisclosureRow`（24px 单行披露、4px 展开缩进、双列 `IN`/`OUT` 卡片、分隔点加 `data-shimmer-decoration`、`Inspect` 默认隐藏且 hover/focus 显现并用 `--dsw-alias-border-l3` 边框），不做大块重边框卡片。
- 连接与首屏：DSH 本地运行在 HTTP/1.1（6 连接槽），不常驻 `EventSource`；默认走按需 `GET` + 写后回写 + `BroadcastChannel` 跨标签同步 + 窗口唤醒节流刷新，仅在面板打开或活跃流式会话时按需建连。`package.json` 不加 `dsh.client.immediately: true`；重型前端依赖懒加载或池化复用单 iframe。
- 主线程与跨插件协作：定位目标 DOM 后立即断开 `document.body` `MutationObserver`，改用局部观察并合并到 `requestAnimationFrame`，页面隐藏时跳过定时刷新。跨插件共享前端入口（如 `#` 菜单）通过 `window.__DSH_*__` 轻量总线协作，保持零硬依赖。

## 服务端存储与 DSH 0.2.3 运行时事实

- 持久存储边界：`storageDomain` 与 `session_projcache` 启动时全量载入内存且不淘汰，写入数据必须设体积上限并裁剪去重（不落盘整页原始 HTML 或未裁剪大 diff）；超大临时态放按 session 隔离的内存结构（如 `WeakMap` 或有上限 LRU），高频 flush 避免整树 `structuredClone`。
- 0.2.3 API 现状：`Session` 无 `session.events`（轮次边界用 `ctx.agents.turnBoundaryOf(session)`，事件快照用 `session.snapshotEvents()`）；无 `ctx.connection.requestRejection`；不用 `browserPeer` 做身份相等判断；`uiSession.sessionStatus` 需显式注入；会话流客户端插件需核对 `facets` 声明。会话日志只追加，`surfaceOp: 'replace'` 不会自动隐藏旧界面节点，也不会自动触发续写。
- 查源码与联调：查 DSH 服务、事件、配置 schema、工具与前端槽位时，优先使用 `cordis_inspect`，其次直读 `/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/` 对应包（部分包如 `dsh-client-ui-primitives`、`dsh-client-ui-slots` 无 `src/`，先看包顶层目录再搜索）。
- 本机 `web` profile 通过 `link:` 软链直连本仓（无需重跑 `dsh plugin add`），开启 `patchReload: live` 但 `hmr.config.root` 为空：
  - 修改 `~/.dsh/profiles/web/cordis.patch.yml` 或 `package.json` 会触发对应行热重载；
  - 修改 `packages/*/lib/*.js` 需重启 `dsh --profile web` 才生效；
  - 修改浏览器端 `client.js` 后刷新页面加载。

## 构建与验证（cwd: `/Users/seefs/work/dsh-plugins`）

大多数包为纯 ESM，无需构建；仅以下 4 个包在改动对应源码后需构建：

- `canvas`：`pnpm --filter dsh-canvas build`
- `diagram-preview`：`pnpm --filter dsh-diagram-preview build`
- `pi-tools`（改 `runner/` 或 Pi 依赖时）：`pnpm --filter dsh-pi-tools build:runner:all`
- `message-actions`（改 `src/` 时）：`pnpm --filter dsh-message-actions build`

常规验证（改动插件内联中英文词典时同步保持 `en`/`zh` 键对齐）：

```bash
pnpm run check                           # oxlint + scripts/validate.mjs + node --test
node --test packages/<name>/test/*.test.js
pnpm run docs:typecheck                  # 改动 apps/docs 时运行
```

## 新增或移除插件的同步清单

改动 `packages/*` 目录成员时，必须同步更新（`scripts/validate.mjs` 强校验）：

1. `README.md` 与 `README.zh.md`
2. `apps/docs/lib/plugins.ts`
3. `apps/docs/content/docs/plugins/<slug>.mdx` 与 `apps/docs/content/docs/plugins/meta.json`
4. 包内 `locale/{en,zh}.json`（`meta.title`、`meta.description` 键完全一致）、`icon.svg`、`README.md`、`cordis.patch.yml`
