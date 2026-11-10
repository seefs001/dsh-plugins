# Plugin inspector module contract

The inspector is a read-only, zero-dependency Node.js tool. It does not load plugin code, install packages, run package scripts, contact the network, or modify the scanned repository. Report writing belongs to the CLI, not the scanner or renderer. It supplements, rather than replaces, `scripts/validate.mjs`.

## Scanner interface

`scanRepository(root)` in `scan.mjs` is async and returns the JSON-serializable snapshot below. `root` is a filesystem path. A missing/unreadable root or `packages/` directory throws an actionable error. Invalid individual package data becomes a finding so other packages can still be scanned. Package directories are sorted by id. Git metadata is best effort; a non-Git repository is supported.

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
- `capabilities` reflects declared host export (`.`) and Web client (`dsh.client`); use an empty array if neither exists. No runtime assertion is made.
- Export entries flatten conditional/array targets into rows. Only literal local targets are checked; a pattern is inventory-only and `exists: null`.
- `files.docs` means the conventional plugin docs page exists; it does not claim that published documentation is current.
- `sourceFiles` / `sourceBytes` inventory regular JS/TS source files, excluding `node_modules`, `.git`, generated outputs, and test directories. `testFiles` counts existing test/spec files without executing or editing them.
- Dependency kinds: `dependency`, `dev`, `peer`, `optional`. `internal` matches another discovered package name.
- `status`: `error` if any error finding, otherwise `warning` if any warning finding, otherwise `ok`.
- Finding severity is `error`, `warning`, or `info`. `info` describes unavailable information (for example `git-unavailable`) without failing a scan or strict mode.
- `summary.errors` and `summary.warnings` count findings, including repository-level findings, not packages. They do not include `info` findings.
- Missing README/icon/bundle/locale or broken literal exports and required manifest fields are errors. Missing docs page is a warning. Existing test absence is inventory, not a warning.
- Git availability is informational, not an error. Git status paths include untracked files and spaces, parsed with NUL separators. Scanning is not a security or runtime compatibility audit.

## Renderer interface

`renderHtml(report)` in `render-html.mjs` returns a complete standalone HTML string. It performs no I/O, imports no third-party modules, and works when opened offline. All repository-derived text is escaped, including embedded JSON and script-closing sequences. No third-party fonts, scripts, telemetry, or network requests.

The report displays summary counts, a searchable/filterable plugin inventory, a selected plugin detail view, actionable findings with paths, and internal/external dependency inventory. Include clear empty states, keyboard-accessible controls, narrow-screen layout, and a data-embedded JSON download. Prefer Chinese UI with exact package names and finding text preserved. Search must work for plugin name, description, id, and findings; combine status and capability filters. Every displayed quality claim is static, not a claim that runtime tests have passed.

## CLI interface

Lead owns `scripts/inspect-plugins.mjs` and `format-markdown.mjs`. Invocation:

```bash
node scripts/inspect-plugins.mjs [--root DIR] [--format html|json|markdown] [--output FILE] [--strict] [--help]
```

Default: Markdown to stdout. Output paths resolve from the caller's cwd, not `--root`. Diagnostics go to stderr. A report with errors exits 1; `--strict` also exits 1 on warnings; invalid arguments/scanning/writing failure exits 2; help exits 0. Report output is still generated before a finding-based nonzero exit. Never silently overwrite an existing file: require `--force` for replacement. When `--output` is omitted all formats print to stdout. No root package manifest changes are needed.

## Ownership

- `scanner`: `scripts/plugin-inspector/scan.mjs` only.
- `report-ui`: `scripts/plugin-inspector/render-html.mjs` only.
- `docs-review`: `scripts/plugin-inspector/README.md` and `reports/plugin-inspector-review.md` only; read-only review elsewhere.
- Lead: contract, CLI, Markdown formatter, final reports and integration fixes after coordination.

Do not create/modify tests, existing plugins, existing root docs, lockfiles, user changes, or global configuration. Do not commit, publish, install dependencies, or start a replacement DSH server.
