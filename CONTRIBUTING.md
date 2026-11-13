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

Most packages are plain JavaScript with no build step, so a `link:` install runs the source directly. Three packages differ:

- `pi-tools` keeps its browser half in `client.js` at the package root, and its patch also inserts a `pi` agent preset.
- `message-actions` builds `lib/client.js` from `src/client.js` with `pnpm --filter dsh-message-actions build`. `prepack` runs the build.
- `switchboard` vendors `lib/vendor/switchboard-kit.js`, generated in the switchboard repository.

`pnpm run validate` enforces these rules:

- The package name is `dsh-<directory>`, `repository.directory` points at the package, `type` is `module`, `keywords` includes `dsh-plugin`, and `engines.dsh` is set.
- `dsh.bundle.patch` exists and inserts a row named after the package. A declared client bundle uses the package name as its `id`.
- Every export resolves to a file, and `./client` is exported only when `dsh.client` is declared.
- `en` and `zh` locales exist, have the same `meta` keys, and both set `meta.title` and `meta.description`.
- The README and icon exist.

## Develop

Use the pnpm version pinned in the root `package.json` (`packageManager`).

```bash
pnpm install
pnpm run check      # lint + validate + test
```

To try local changes in a profile, link the package:

```bash
dsh plugin --profile web add link:$PWD/packages/model-reference
```

If the profile has HMR enabled, Plugin Manager and HMR recompositions replace plugins whose files changed. Otherwise follow Plugin Manager's `restart-required` result and restart DSH. Browser halves load after a page refresh.

## Documentation

The Fumadocs site lives in `apps/docs`, separate from the plugin packages. Run `pnpm run docs:dev` from the root to preview it.

Plugin versions, DSH ranges, and titles are read from each package's `package.json` and `locale/zh.json` at build time. When you add a package, add an entry to `apps/docs/lib/plugins.ts`, create `apps/docs/content/docs/plugins/<name>.mdx`, and list it in `plugins/meta.json`. The docs build fails if a package has no entry. Keep plugin pages in sync with package READMEs.

[apps/docs/README.md](apps/docs/README.md) covers deployment. Validate with `pnpm run docs:typecheck` and `NEXT_PUBLIC_BASE_PATH=/dsh-plugins pnpm run docs:build`. Pull requests build the site without deploying; changes on `main` deploy through the Documentation workflow once Pages is enabled.

## Release

1. Bump `version` in the package's `package.json` and add an entry to `CHANGELOG.md`.
2. Run `pnpm run check`.
3. Run `npm publish` in `packages/<name>`.
