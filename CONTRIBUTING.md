# Contributing

## Layout

```text
packages/<name>/
├── package.json        # name = dsh-<name>, dsh.bundle, optional dsh.client
├── cordis.patch.yml    # bundle patch; inserts at least the dsh-<name> row
├── lib/index.js        # Host half (Cordis plugin, plain ESM)
├── src/client.js       # readable browser source (plus optional src/client.<chunk>.js)
├── lib/client.js       # generated minified browser bundle (built from src/client.js)
├── locale/{en,zh}.json # meta.title / meta.description shown on the Plugins page
├── icon.svg
├── test/*.test.js      # node:test, where a package has tests
└── README.md
```

### Client bundle build workflow

Host halves (`lib/*.js`) are plain ES modules with no build step. Browser halves keep readable source in `packages/<name>/src/client.js` (and optional lazy chunks such as `src/client.page.js` loaded with `require.async('./client.page.js')`) and ship deterministic minified bundles at the `exports["./client"]` path (`lib/client*.js`, or `client.js` for `pi-tools`):

```bash
pnpm run build:clients        # rebuild all minified client bundles via esbuild (scripts/build-clients.mjs)
pnpm run build:clients:check  # verify every committed bundle matches src/client*.js byte-for-byte
```

GitHub Actions CI (`.github/workflows/ci.yml`) and `pnpm run check` run `pnpm run build:clients:check` on every push and pull request so committed bundles always match their readable source.

Additional package-specific builds:

- `canvas`: rebuild the sandbox runtime chunk (`lib/client.runtime.js`) with `pnpm --filter dsh-canvas build` (`prepack` runs it automatically).
- `diagram-preview`: rebuild lazy renderer chunks with `pnpm --filter dsh-diagram-preview build` after updating diagram dependencies.
- `pi-tools`: browser output lives at `client.js` (built from `src/client.js` by `pnpm run build:clients`); rebuild Go runners with `pnpm --filter dsh-pi-tools build:runner:all` after changing `runner/` or Pi dependencies.
- `message-actions`: builds `lib/client.js` and `lib/client.markdown.js` from `src/` with `pnpm --filter dsh-message-actions build` (`prepack` runs it automatically).

## Lint and validation

```bash
pnpm install
pnpm run check      # build:clients:check + oxlint + validate.mjs + node:test
```

`pnpm run lint` runs Oxlint with `.oxlintrc.json` and `scripts/oxlint-plugin.mjs` (`--deny-warnings`):

- `correctness` and `suspicious` are errors.
- `dsh/no-comments`: comments are disallowed except shebangs, top-of-file license headers, single-line URLs, and single-line `// external: <reason>` notes for external dependency, platform, or DSH host constraints we cannot reshape.
- `dsh/no-suppression-comments`: `oxlint-disable`, `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, and `@ts-nocheck` are disallowed.
- `dsh/no-legacy-compat`: removed pre-release compatibility tokens are disallowed.
- DSH 0.2.3 contract & performance rules (`dsh/no-removed-host-apis`, `dsh/require-declared-inject`, `dsh/no-withdraw-view-node`, `dsh/safe-slot-shadowing`, `dsh/require-switch-label`, `dsh/safe-storage-domain-open`, `dsh/require-command-available`, `dsh/no-direct-model-selection-fields`, `dsh/no-root-theme-computed-style`, `dsh/locale-dict-parity`, `dsh/no-broad-session-subscription`, `dsh/require-mobile-backdrop-fallback`, `dsh/no-unconstrained-nowrap`, `dsh/safe-intervals`, `dsh/no-new-always-on-observers`, `dsh/no-server-hot-sync-fs`).

`pnpm run validate` checks:

- Package name `dsh-<directory>`, valid version, `repository.directory`, `type: "module"`, `keywords` containing `dsh-plugin`, `engines.dsh`, zero cross-plugin sibling dependencies, existing `files` entries, and no internal design docs (`DESIGN.md`, `ARCHITECTURE.md`, `PASEO-PARITY.md`).
- `dsh.bundle.patch` exists and inserts a row named after the package; `exports` resolve to files; `./client` parity, `__ModuleLoader__` id match `pkg.name`, `dsh.client.immediately` is not `true`, client size budgets, and `test/client.test.js` coverage for new web plugins.
- `locale/en.json` and `locale/zh.json` exist with identical `meta` keys (`title`, `description`).
- Full parity across `packages/*`, `apps/docs/lib/plugins.ts`, `apps/docs/content/docs/plugins/*.mdx`, `apps/docs/content/docs/plugins/meta.json`, `README.md`, and `README.zh.md`.

## Local development

```bash
dsh plugin --profile web add "link:$PWD/packages/model-reference"
```

## Documentation

```bash
pnpm run docs:dev
pnpm run docs:typecheck
NEXT_PUBLIC_BASE_PATH=/dsh-plugins pnpm run docs:build
```

When adding a package, register it in `apps/docs/lib/plugins.ts`, create `apps/docs/content/docs/plugins/<name>.mdx`, add it to `apps/docs/content/docs/plugins/meta.json`, and update `README.md` and `README.zh.md`.
