# dsh-plugins 项目协作规则

## 仓库定位与基线

- 本仓维护独立的 DeepSeek Harness（DSH）插件，位于 `packages/<name>`，包名固定为 `dsh-<name>`。
- 本机 DSH 安装基线为 `/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/`（`engines.dsh`: `>=0.2.3-alpha.2 <0.3.0`）。
- 改动 `packages/acp-workbench` 时，先读 `packages/acp-workbench/AGENTS.md`（覆盖 ACP 协议、流式桥接、提问/审批交互与子进程/存储约束）。

## 规则与强制检查对照表

以下约束已固化到 `pnpm run check`（`scripts/oxlint-plugin.mjs` 与 `scripts/validate.mjs`）并在 CI 强制执行。若再出现同类重复错误，优先补齐自动化检查，再精简或更新本表。

| 规则 | 强制手段 |
| --- | --- |
| 禁注释（保留 shebang、文件头许可证、单行 URL、`// external: <reason>`）、禁 lint/TS 抑制注释、禁旧兼容标识 | `dsh/no-comments`、`dsh/no-suppression-comments`、`dsh/no-legacy-compat` |
| 禁用 DSH 0.2.3 已移除/禁用接口（`ctx.locale.t`、`session.events`、`requestRejection`、`ctx.connection.admit`、`storageDomain.register`、`browserPeer`、Electron 不可用的 `window.prompt/confirm/alert`，以及测试 stub 虚构 `locale.t`） | `dsh/no-removed-host-apis` |
| `uiConversation.events.register()` 的 `buildViewNode` 禁止对已物化节点返回 `null`（须查 `context.current?.get(target)` 并返回同 `key` 的 `visibility: 'hidden'`） | `dsh/no-withdraw-view-node` |
| 禁覆盖声明了子槽位的宿主槽位/条目（如 `sidebar.right.pane.tab` 内置页与容器槽位，改用子槽位或声明私有镜像子槽位）；委托 `base.component` 须合并 `base.inject?.()` 与按语言版本刷新的翻译函数，禁在缓存的 `inject` 中静态 `ctx.locale.bind()` | `dsh/safe-slot-shadowing` |
| 客户端 `Switch` 必须提供非空 `label`（或 `aria-label` / `aria-labelledby`） | `dsh/require-switch-label` |
| 服务端 `storageDomain.open()` 必须包裹在检查 `error?.code === 'already-open'` 的有界重试循环中 | `dsh/safe-storage-domain-open` |
| `commandUi.register()` 必填 `available` 回调（缺失会导致 `+` / `/` 菜单整体崩溃） | `dsh/require-command-available` |
| `useProjection('modelSelection')` 必须解包 `next ?? lastUsed`，禁止直读 `.provider` / `.model` / `.reasoningEffort` | `dsh/no-direct-model-selection-fields` |
| 读取宿主 `--dsw-alias-*` 必须通过 `document.body`，禁止直传 `document.documentElement` | `dsh/no-root-theme-computed-style` |
| 客户端内联 `en` / `zh` 词典键集合必须完全一致 | `dsh/locale-dict-parity` |
| 禁止整表订阅会话（`useSessions(s => s.byId\|s.ids)`、裸传 `ctx.sessions.list`） | `dsh/no-broad-session-subscription` |
| 客户端 CSS 使用 `backdrop-filter` 必须附带移动端/粗指针降级（`backdrop-filter:none` + 不透明 `--dsw-alias-bg-*`） | `dsh/require-mobile-backdrop-fallback` |
| CSS 同规则同时使用 `min-width:0` 与 `white-space:nowrap` 必须声明 `overflow:hidden` | `dsh/no-unconstrained-nowrap` |
| 服务端 `setInterval` 必须 `.unref?.()` 且写响应流时守卫 `destroyed \|\| writableEnded`；客户端 `setInterval` 必须检查 `document.hidden` / `visibilityState` 或为有界自清理重试 | `dsh/safe-intervals` |
| 禁止在白名单外新增 `EventSource` 或 `document.body` `MutationObserver` | `dsh/no-new-always-on-observers` |
| 禁止在服务端 `async` 函数中调用同步 `fs.*Sync` | `dsh/no-server-hot-sync-fs` |
| 禁 `dsh.client.immediately: true`、同仓零硬依赖、客户端包体体积预算、新 `client.js` 包必填 `test/client.test.js`、禁包内设计文档、目录与文档站全量同步 | `scripts/validate.mjs` |

## 每次修改插件的性能护栏（必查）

每次新增或修改插件（无论功能、样式还是修复），除通过上述静态门禁外，必须主动核对以下 5 项：

1. **订阅最小化**：组件只订阅渲染所需的原始字段或带字段级相等比较的派生快照（`useSyncExternalStore` 缓存），确保工作区其他无关会话流式输出时不触发本组件重渲染。
2. **刷新频率与连接克制**：流式文本/思考/工具增量不得触发全量 snapshot 或全量 trace 拉取；DSH 本地跑在 HTTP/1.1（6 连接槽），默认走按需 `GET` + 写后回写 + `BroadcastChannel` + 窗口唤醒节流刷新；隐藏标签页暂停定时与网络刷新。
3. **移动端与首屏预算**：窄屏（`<=600px` 或 `@container (max-width:460px)`）下底栏/顶栏控件需折叠且不溢出；弹层在粗指针/窄屏关闭毛玻璃滤镜；重型依赖懒加载或池化复用单 iframe，不让 `client.js` 静默膨胀。
4. **Host 内存与存储边界**：`storageDomain` 与 `session_projcache` 启动全量载入内存且不淘汰，写入数据必须设条目数与单条字节上限并做**运行期定期裁剪**（不能只在启动时 prune）；超大临时态放按 session 隔离的内存结构（`WeakMap` 或有上限 LRU）；高频 flush 避免整树 `structuredClone`；所有定时器与监听器在卸载时清理。
5. **可感知性能改动必须量化**：涉及性能修复或热路径改造时，核对并报告真实指标（请求频次、重渲染次数、落盘字节、客户端包体 KiB），不凭代码猜测效果。

## UI 对齐与 DSH 0.2.3 运行时判断要点

- **组件与主题**：复用 `@deepseek-ai/dsh-client-ui-primitives` 组件，自定义样式统一使用 `--dsw-*` 语义令牌并兼顾浅色模式；跨插件共享前端入口（如 `#` 菜单）通过 `window.__DSH_*__` 轻量总线协作。
- **会话内工具视图（`tool.call.toolview`）**：对齐原生 `ToolRow` / `DisclosureRow`（24px 单行披露、4px 展开缩进、双列 `IN`/`OUT` 卡片、分隔点加 `data-shimmer-decoration`、`Inspect` 默认隐藏且 hover/focus 显现并用 `--dsw-alias-border-l3` 边框），不做大块重边框卡片。
- **0.2.3 宿主契约细节**：`uiSession.sessionStatus` 需显式注入；会话流客户端插件需核对 `facets` 声明；会话日志只追加，`surfaceOp: 'replace'` 不会自动隐藏旧界面节点也不会触发续写；`ctx.theme` 通过 `getTheme()` 读快照（`active.colorScheme`）并监听 `theme/change`；`ctx.layout` 切主面板用 `selectPanel(id)`。注册到 `sidebar.panellist` 等启动期槽位的 `label: () => ...` 会在 `@deepseek-ai/dsh-client-ui-sidebar` 激活执行 `syncPanels()` 时同步求值，抛错会导致整个 Web 启动失败。写 `client.js` 前务必查实对应 `@deepseek-ai/dsh-client-*` 源码。
- **查源码与本机联调**：优先使用 `cordis_inspect`，其次直读 `/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/` 对应包（部分包无 `src/`，先看包顶层目录）。本机 `web` profile 通过 `link:` 软链直连本仓并禁用 `hmr`/`client-hmr`：改 `cordis.patch.yml`、`package.json` 或服务端 `lib/*.js` 需重启 `dsh --profile web`；改浏览器端 `client.js` 后刷新页面生效。

## 构建与验证（cwd: `/Users/seefs/work/dsh-plugins`）

大多数包为纯 ESM，无需构建；仅以下 4 个包在改动对应源码后需构建：

- `canvas`：`pnpm --filter dsh-canvas build`
- `diagram-preview`：`pnpm --filter dsh-diagram-preview build`
- `pi-tools`（改 `runner/` 或 Pi 依赖时）：`pnpm --filter dsh-pi-tools build:runner:all`
- `message-actions`（改 `src/` 时）：`pnpm --filter dsh-message-actions build`

常规验证（新增或大改含 `client.js` 的插件时补齐 `test/client.test.js`，按真实 DSH 运行时接口构造最小 stub 覆盖 `plugin.apply(ctx)`、槽位 `label()` 求值与组件首屏渲染）：

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
