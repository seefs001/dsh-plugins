# dsh-plugins 项目协作规则

## 仓库定位与基线

- 本仓维护 31 个独立的 DeepSeek Harness（DSH）插件，位于 `packages/<name>`，包名固定为 `dsh-<name>`。
- 本机 DSH 安装基线为 `/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/`（`engines.dsh`: `>=0.2.3-alpha.2 <0.3.0`）。
- 保持同仓零硬依赖：任意 `packages/<name>` 必须可在兼容 DSH profile 中单独安装，不依赖同仓其他包。

## 代码风格与静态约束

- `pnpm run lint` 使用 Oxlint（`--deny-warnings`）与 `scripts/oxlint-plugin.mjs`：
  - `dsh/no-comments`：除 shebang、文件头许可证、单行 URL 和单行 `// external: <reason>`（说明不可改变的外部依赖、平台或 DSH 宿主限制）外，禁止写注释。
  - `dsh/no-suppression-comments`：禁止 `oxlint-disable`、`eslint-disable`、`@ts-ignore`、`@ts-expect-error`、`@ts-nocheck`。
  - `dsh/no-legacy-compat`：禁止残留已移除的旧版兼容标识（如 `dsh-inbox`、`llm-pi-ai/model-defaults`）。
- 禁止在包目录下放置内部设计文档（`DESIGN.md`、`ARCHITECTURE.md`、`PASEO-PARITY.md`），`scripts/validate.mjs` 会拒绝。

## 核对 DSH 运行时事实

- 查 DSH 服务、事件、配置 schema、工具与前端槽位时，优先使用 `cordis_inspect`，其次直读 `/Users/seefs/.bun/install/global/node_modules/@deepseek-ai/` 对应包源码，不凭记忆猜 API。
- 本机 `web` profile 开启 `patchReload: live`，但 `hmr.config.root` 为空：
  - 修改 `~/.dsh/profiles/web/cordis.patch.yml` 或 `package.json` 会触发对应行热重载；
  - 修改 `packages/*/lib/*.js` 需重启 `dsh --profile web` 才生效；
  - 修改浏览器端 `client.js` 后刷新页面加载。

## 构建与验证（cwd: `/Users/seefs/work/dsh-plugins`）

大多数包为纯 ESM，无需构建；仅以下 4 个包在改动对应源码后需构建：

- `canvas`：`pnpm --filter dsh-canvas build`
- `diagram-preview`：`pnpm --filter dsh-diagram-preview build`
- `pi-tools`（改 `runner/` 或 Pi 依赖时）：`pnpm --filter dsh-pi-tools build:runner:all`
- `message-actions`（改 `src/` 时）：`pnpm --filter dsh-message-actions build`

常规验证：

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
