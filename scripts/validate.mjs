#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const PACKAGES = join(ROOT, 'packages')
const DOCS_PLUGINS = join(ROOT, 'apps', 'docs', 'content', 'docs', 'plugins')
const LOCALES = ['en', 'zh']
const REQUIRED = ['name', 'version', 'description', 'keywords', 'license', 'repository', 'type', 'exports', 'files', 'engines', 'dsh']
const EXPECTED_DSH_ENGINE = '>=0.2.3-alpha.2 <0.3.0'
const FORBIDDEN_PACKAGE_DOCS = ['DESIGN.md', 'ARCHITECTURE.md', 'PASEO-PARITY.md']
const LEGACY_TEXT = /\b(?:dsh[-_]inbox|llm-pi-ai\/model-defaults)\b/

const errors = []
const fail = (scope, msg) => errors.push(`${scope}: ${msg}`)

const slugs = []

for (const dir of readdirSync(PACKAGES).toSorted()) {
  const base = join(PACKAGES, dir)
  const manifestPath = join(base, 'package.json')
  if (!existsSync(manifestPath)) continue
  slugs.push(dir)
  const pkg = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const id = `packages/${dir}`

  for (const field of REQUIRED) if (pkg[field] === undefined) fail(id, `missing "${field}"`)
  if (pkg.name !== `dsh-${dir}`) fail(id, `name "${pkg.name}" should be "dsh-${dir}"`)
  if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(pkg.version ?? '')) fail(id, `invalid version "${pkg.version}"`)
  if (!pkg.keywords?.includes('dsh-plugin')) fail(id, 'keywords must include "dsh-plugin"')
  if (pkg.repository?.directory !== id) fail(id, `repository.directory should be "${id}"`)
  if (pkg.type !== 'module') fail(id, 'type must be "module"')
  if (pkg.engines?.dsh !== EXPECTED_DSH_ENGINE) fail(id, `engines.dsh should be "${EXPECTED_DSH_ENGINE}"`)

  for (const forbidden of FORBIDDEN_PACKAGE_DOCS) {
    if (existsSync(join(base, forbidden))) fail(id, `remove internal design doc "${forbidden}"`)
  }
  for (const entry of pkg.files ?? []) {
    if (!existsSync(join(base, entry))) fail(id, `files entry "${entry}" does not exist`)
  }

  const readmePath = join(base, 'README.md')
  if (!existsSync(readmePath)) fail(id, 'README.md is missing')
  else {
    const legacy = LEGACY_TEXT.exec(readFileSync(readmePath, 'utf8'))
    if (legacy) fail(`${id}/README.md`, `remove legacy reference "${legacy[0]}"`)
  }

  for (const [key, target] of Object.entries(pkg.exports ?? {})) {
    if (typeof target !== 'string' || target.includes('*')) continue
    if (!existsSync(join(base, target))) fail(id, `export "${key}" -> ${target} does not exist`)
  }

  const patchRel = pkg.dsh?.bundle?.patch
  if (!patchRel || !existsSync(join(base, patchRel))) fail(id, 'dsh.bundle.patch is missing')
  else {
    const patch = readFileSync(join(base, patchRel), 'utf8')
    const names = [...patch.matchAll(/^\s+name:\s*['"]?([^'"\s#]+)/gm)].map(m => m[1])
    if (!names.includes(pkg.name)) fail(id, `${patchRel} inserts ${JSON.stringify(names)}, expected "${pkg.name}"`)
    const legacy = LEGACY_TEXT.exec(patch)
    if (legacy) fail(`${id}/${patchRel}`, `remove legacy reference "${legacy[0]}"`)
  }

  if (pkg.dsh?.client) {
    if (pkg.dsh.client.platform !== 'web') fail(id, 'dsh.client.platform must be "web"')
    const clientRel = pkg.exports?.['./client']
    if (!clientRel) fail(id, 'dsh.client is declared but "./client" is not exported')
    else if (existsSync(join(base, clientRel))) {
      const src = readFileSync(join(base, clientRel), 'utf8')
      const m = /__ModuleLoader__\.load\(\{\s*id:\s*['"]([^'"]+)['"]/.exec(src)
      if (m?.[1] !== pkg.name) fail(id, `client bundle id "${m?.[1]}" should be "${pkg.name}"`)
    }
  } else if (pkg.exports?.['./client']) fail(id, '"./client" is exported but dsh.client is not declared')

  const metas = {}
  for (const lang of LOCALES) {
    const file = join(base, 'locale', `${lang}.json`)
    if (!existsSync(file)) { fail(id, `locale/${lang}.json is missing`); continue }
    try {
      const raw = readFileSync(file, 'utf8')
      const legacy = LEGACY_TEXT.exec(raw)
      if (legacy) fail(`${id}/locale/${lang}.json`, `remove legacy reference "${legacy[0]}"`)
      const meta = JSON.parse(raw).meta
      if (!meta?.title || !meta?.description) fail(id, `locale/${lang}.json needs meta.title and meta.description`)
      metas[lang] = Object.keys(meta ?? {}).toSorted().join(',')
    } catch (error) { fail(id, `locale/${lang}.json: ${error.message}`) }
  }
  if (new Set(Object.values(metas)).size > 1) fail(id, 'locale meta keys differ between languages')

  if (!existsSync(join(base, pkg.icon ?? 'icon.svg'))) fail(id, 'icon is missing')
}

const slugSet = new Set(slugs)

const catalogSrc = readFileSync(join(ROOT, 'apps', 'docs', 'lib', 'plugins.ts'), 'utf8')
const catalogSlugs = [...catalogSrc.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1])
const catalogSet = new Set(catalogSlugs)
for (const slug of slugs) if (!catalogSet.has(slug)) fail('apps/docs/lib/plugins.ts', `missing entry for "${slug}"`)
for (const slug of catalogSlugs) if (!slugSet.has(slug)) fail('apps/docs/lib/plugins.ts', `unknown entry "${slug}"`)

const metaPages = JSON.parse(readFileSync(join(DOCS_PLUGINS, 'meta.json'), 'utf8')).pages
  .filter(entry => typeof entry === 'string' && !entry.startsWith('---') && entry !== 'index')
const metaSet = new Set(metaPages)
for (const slug of slugs) if (!metaSet.has(slug)) fail('apps/docs/content/docs/plugins/meta.json', `missing "${slug}"`)
for (const slug of metaPages) if (!slugSet.has(slug)) fail('apps/docs/content/docs/plugins/meta.json', `unknown "${slug}"`)

for (const file of readdirSync(DOCS_PLUGINS).toSorted()) {
  if (!file.endsWith('.mdx') || file === 'index.mdx') continue
  const slug = file.slice(0, -'.mdx'.length)
  if (!slugSet.has(slug)) fail(`apps/docs/content/docs/plugins/${file}`, 'orphan plugin doc')
}

for (const slug of slugs) {
  const mdxPath = join(DOCS_PLUGINS, `${slug}.mdx`)
  if (!existsSync(mdxPath)) { fail(`apps/docs/content/docs/plugins/${slug}.mdx`, 'missing doc page'); continue }
  const mdx = readFileSync(mdxPath, 'utf8')
  if (!mdx.includes(`<PluginFacts slug="${slug}" />`)) fail(`apps/docs/content/docs/plugins/${slug}.mdx`, 'missing <PluginFacts>')
  if (!mdx.includes(`<InstallCommand slug="${slug}" />`)) fail(`apps/docs/content/docs/plugins/${slug}.mdx`, 'missing <InstallCommand>')
  const legacy = LEGACY_TEXT.exec(mdx)
  if (legacy) fail(`apps/docs/content/docs/plugins/${slug}.mdx`, `remove legacy reference "${legacy[0]}"`)
}

for (const file of ['README.md', 'README.zh.md', 'apps/docs/content/docs/configuration.mdx', 'apps/docs/content/docs/compatibility.mdx']) {
  const content = readFileSync(join(ROOT, file), 'utf8')
  const legacy = LEGACY_TEXT.exec(content)
  if (legacy) fail(file, `remove legacy reference "${legacy[0]}"`)
  if (file === 'README.md' || file === 'README.zh.md') {
    for (const slug of slugs) {
      if (!content.includes(`(packages/${slug})`)) fail(file, `missing catalog link for packages/${slug}`)
    }
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(`✖ ${e}`)
  process.exit(1)
}
console.log(`✔ all ${slugs.length} packages and docs valid`)
