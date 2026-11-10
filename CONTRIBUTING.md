# Contributing

## Layout

```text
packages/<name>/
├── package.json        # name = dsh-<name>, dsh.bundle + optional dsh.client
├── cordis.patch.yml    # bundle patch: one insert row, id = <name>
├── lib/index.js        # Host half (Cordis plugin, ESM)
├── lib/client.js       # browser half, optional (window.__ModuleLoader__ bundle)
├── locale/{en,zh}.json # meta.title / meta.description shown in the Plugins page
├── icon.svg
├── test/*.test.js      # node:test
└── README.md
```

Rules that `pnpm run validate` enforces:

- The package name is `dsh-<directory>`, and both the patch row `name` and the client bundle `id` use it.
- `en` and `zh` locales exist and have the same `meta` keys.
- Every export resolves to a file, and `./client` is exported only when `dsh.client` is declared.
- `keywords` includes `dsh-plugin`, and `engines.dsh` is set.

The plugins are plain JavaScript with no build step, so a `link:` install runs the source directly.

## Develop

```bash
pnpm install
pnpm run check      # lint + validate + test
```

To try local changes in a profile, link the package and select its bundle:

```bash
dsh plugin --profile web add link:$PWD/packages/model-reference
```

Restart dsh, or rely on `patchReload: live`, to pick up Host changes. Browser bundles reload with the page.

## Release

1. Bump `version` in the package's `package.json` and add an entry to `CHANGELOG.md`.
2. `pnpm run check`
3. `cd packages/<name> && npm publish`
