# Contributing

## Layout

```text
packages/<name>/
├── package.json        # name = dsh-<name>, dsh.bundle, optional dsh.client
├── cordis.patch.yml    # bundle patch; inserts at least the dsh-<name> row
├── lib/index.js        # Host half (Cordis plugin, ESM)
├── lib/client.js       # optional browser half (window.__ModuleLoader__ bundle)
├── locale/{en,zh}.json # meta.title / meta.description shown on the Plugins page
├── icon.svg
├── test/*.test.js      # node:test, where a package has tests
└── README.md
```

Most packages are plain ES modules with no build step. Four packages build artifacts:

- `canvas`: rebuild the sandbox runtime chunk with `pnpm --filter dsh-canvas build` (`prepack` runs it automatically).
- `diagram-preview`: rebuild lazy renderer chunks with `pnpm --filter dsh-diagram-preview build` after updating diagram dependencies.
- `pi-tools`: browser half lives at `client.js`; rebuild Go runners with `pnpm --filter dsh-pi-tools build:runner:all` after changing `runner/` or Pi dependencies.
- `message-actions`: build `lib/client.js` from `src/client.js` with `pnpm --filter dsh-message-actions build` (`prepack` runs it automatically).

## Lint and validation

```bash
pnpm install
pnpm run check      # oxlint + validate.mjs + node:test
```

`pnpm run lint` runs Oxlint with `.oxlintrc.json` and `scripts/oxlint-plugin.mjs` (`--deny-warnings`):

- `correctness` and `suspicious` are errors.
- `dsh/no-comments`: comments are disallowed except shebangs, top-of-file license headers, single-line URLs, and single-line `// external: <reason>` notes for external dependency, platform, or DSH host constraints we cannot reshape.
- `dsh/no-suppression-comments`: `oxlint-disable`, `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, and `@ts-nocheck` are disallowed.
- `dsh/no-legacy-compat`: removed pre-release compatibility tokens are disallowed.

`pnpm run validate` checks:

- Package name `dsh-<directory>`, valid version, `repository.directory`, `type: "module"`, `keywords` containing `dsh-plugin`, `engines.dsh`, existing `files` entries, and no internal design docs (`DESIGN.md`, `ARCHITECTURE.md`, `PASEO-PARITY.md`).
- `dsh.bundle.patch` exists and inserts a row named after the package; `exports` resolve to files; `./client` parity and `__ModuleLoader__` id match `pkg.name`.
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
