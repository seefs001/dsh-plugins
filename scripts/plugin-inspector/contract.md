# Plugin inspector module contract

The inspector is a read-only Node.js tool with no dependencies. It does not load plugin code, install packages, run package scripts, contact the network, or modify the scanned repository. Only the CLI writes reports; the scanner and renderer do not. It adds to `scripts/validate.mjs` and does not replace it.

## Scanner interface

`scanRepository(root)` in `scan.mjs` is async and returns the JSON-serializable snapshot below. `root` is a filesystem path. A missing or unreadable root or `packages/` directory throws an error that says what to fix. Invalid data in one package becomes a finding, and the other packages are still scanned. Package directories are sorted by id. Git metadata is best effort, and a repository without Git is supported.

```js
{
  schemaVersion: 1,
  generatedAt: 'ISO timestamp',
  root: '/absolute/scanned/root',
  repository: {
    name: 'root manifest name or directory basename',
    branch: 'branch name or null',
    head: 'short commit or null',
    dirty: false,
    changedFiles: [{ path: 'repo/relative/path', status: '??' }]
  },
  summary: {
    packages: 0,
    errors: 0,
    warnings: 0,
    host: 0,
    web: 0,
    documented: 0,
    changed: 0
  },
  plugins: [{
    id: 'directory-name',
    name: 'dsh-directory-name',
    version: '0.0.0 or null',
    description: 'description or empty string',
    directory: 'packages/directory-name',
    capabilities: ['host', 'web'],
    engines: { node: 'range or null', dsh: 'range or null' },
    exports: [{ name: '.', target: './lib/index.js', exists: true }],
    locales: [{ language: 'en', title: 'Title', description: 'Description', metaKeys: ['description', 'title'] }],
    files: { readme: true, icon: true, bundle: true, docs: true },
    docsPath: 'apps/docs/content/docs/plugins/directory-name.mdx or null',
    dependencies: [{ name: 'dependency-name', range: '^1', kind: 'dependency', internal: false }],
    sourceFiles: 0,
    sourceBytes: 0,
    testFiles: 0,
    changed: false,
    status: 'ok',
    findings: [{ severity: 'error', code: 'stable-code', message: 'Actionable explanation', path: 'repo/relative/path' }]
  }],
  dependencies: {
    edges: [{ from: 'plugin-id', to: 'other-plugin-id', kind: 'dependency', range: '^1' }],
    external: [{ name: 'dependency-name', range: '^1', kind: 'peer', usedBy: ['plugin-id'] }]
  },
  findings: [{ severity: 'warning', code: 'stable-code', message: 'Repository-level finding', path: 'repo/relative/path or null' }]
}
```

- A plugin is every direct, non-symlink directory of `packages/` with a `package.json`; invalid JSON still yields a plugin entry and an error.
- `capabilities` reflects a declared Host export (`.`) and Web client (`dsh.client`), and is an empty array when neither exists. It says nothing about runtime behavior.
- Export entries flatten conditional and array targets into rows. Only literal local targets are checked; a pattern is listed with `exists: null`.
- `files.docs` means the conventional docs page `apps/docs/content/docs/plugins/<id>.mdx` exists. It does not mean the published documentation is current.
- `sourceFiles` and `sourceBytes` count regular JS/TS source files, skipping `node_modules`, `.git`, common build-output directories, and test directories. `testFiles` counts existing test and spec files without running or editing them.
- Dependency kinds: `dependency`, `dev`, `peer`, `optional`. `internal` matches another discovered package name.
- `status`: `error` if any error finding, otherwise `warning` if any warning finding, otherwise `ok`.
- Finding severity is `error`, `warning`, or `info`. `info` reports unavailable information, such as `git-unavailable`, and never fails a scan or strict mode.
- `summary.errors` and `summary.warnings` count findings, including repository-level findings, not packages. They do not include `info` findings.
- A missing README, icon, bundle, or locale, a broken literal export, or a missing required manifest field is an error. A missing docs page is a warning. Having no tests is recorded in the inventory and produces no warning.
- Missing Git is informational. Git status is parsed with NUL separators, so paths with spaces and untracked files are included. A scan is neither a security audit nor a runtime compatibility check.

## Renderer interface

`renderHtml(report)` in `render-html.mjs` returns a complete standalone HTML string. It performs no I/O, imports no third-party modules, and works when opened offline. All repository-derived text is escaped, including embedded JSON and script-closing sequences. No third-party fonts, scripts, telemetry, or network requests.

The report shows summary counts, a plugin inventory with search and filters, a detail view for the selected plugin, findings with paths, and the internal and external dependency inventory. It has clear empty states, keyboard-accessible controls, a narrow-screen layout, and a JSON download built from the embedded data. The UI is in Chinese and keeps package names and finding text exactly as scanned. Search covers plugin name, description, id, and findings, and status and capability filters combine. Every quality claim it displays is static and does not mean that runtime tests passed.

## CLI interface

`scripts/inspect-plugins.mjs` is the CLI entry point; `format-markdown.mjs` formats Markdown reports. Invocation:

```bash
node scripts/inspect-plugins.mjs [--root DIR] [--format html|json|markdown] [--output FILE] [--force] [--strict] [--help]
```

The default is Markdown on stdout, and every format prints to stdout when `--output` is omitted. Output paths resolve from the caller's working directory, not from `--root`. Diagnostics go to stderr. A report with errors exits 1, and `--strict` also exits 1 on warnings. Invalid arguments and scanning or writing failures exit 2; help exits 0. The report is written before a finding-based nonzero exit. An existing output file is never replaced without `--force`. The root package manifest needs no changes.

## Original implementation scope

These assignments and constraints record the initial implementation task, not ongoing ownership. See [CONTRIBUTING.md](../../CONTRIBUTING.md) for current contribution guidance.

- `scanner`: `scripts/plugin-inspector/scan.mjs` only.
- `report-ui`: `scripts/plugin-inspector/render-html.mjs` only.
- `docs-review`: `scripts/plugin-inspector/README.md` and `reports/plugin-inspector-review.md` only; read-only review elsewhere.
- Lead: contract, CLI, Markdown formatter, final reports and integration fixes after coordination.

Do not create/modify tests, existing plugins, existing root docs, lockfiles, user changes, or global configuration. Do not commit, publish, install dependencies, or start a replacement DSH server.
