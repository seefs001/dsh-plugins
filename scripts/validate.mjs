#!/usr/bin/env node
/**
 * Static checks for every package under packages/: manifest fields, exports
 * that resolve to real files, bundle patch row names, locale metadata parity,
 * and client bundle ids matching the package name.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const PACKAGES = join(ROOT, 'packages')
const LOCALES = ['en', 'zh']
const REQUIRED = ['name', 'version', 'description', 'keywords', 'license', 'repository', 'type', 'exports', 'files', 'engines', 'dsh']

const errors = []
const fail = (pkg, msg) => errors.push(`${pkg}: ${msg}`)

for (const dir of readdirSync(PACKAGES).toSorted()) {
  const base = join(PACKAGES, dir)
  const manifestPath = join(base, 'package.json')
  if (!existsSync(manifestPath)) continue
  const pkg = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const id = `packages/${dir}`

  for (const field of REQUIRED) if (pkg[field] === undefined) fail(id, `missing "${field}"`)
  if (pkg.name !== `dsh-${dir}`) fail(id, `name "${pkg.name}" should be "dsh-${dir}"`)
  if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(pkg.version ?? '')) fail(id, `invalid version "${pkg.version}"`)
  if (!pkg.keywords?.includes('dsh-plugin')) fail(id, 'keywords must include "dsh-plugin"')
  if (pkg.repository?.directory !== id) fail(id, `repository.directory should be "${id}"`)
  if (pkg.type !== 'module') fail(id, 'type must be "module"')
  if (!pkg.engines?.dsh) fail(id, 'engines.dsh is required')
  if (!existsSync(join(base, 'README.md'))) fail(id, 'README.md is missing')

  // Every non-pattern export must point at an existing file.
  for (const [key, target] of Object.entries(pkg.exports ?? {})) {
    if (typeof target !== 'string' || target.includes('*')) continue
    if (!existsSync(join(base, target))) fail(id, `export "${key}" -> ${target} does not exist`)
  }

  // Bundle patch: one insert row named after the package.
  const patchRel = pkg.dsh?.bundle?.patch
  if (!patchRel || !existsSync(join(base, patchRel))) fail(id, 'dsh.bundle.patch is missing')
  else {
    const patch = readFileSync(join(base, patchRel), 'utf8')
    const names = [...patch.matchAll(/^\s+name:\s*['"]?([^'"\s#]+)/gm)].map(m => m[1])
    if (!names.includes(pkg.name)) fail(id, `${patchRel} inserts ${JSON.stringify(names)}, expected "${pkg.name}"`)
    if (names.some(n => n.startsWith('@local/'))) fail(id, `${patchRel} still references an @local/ package`)
  }

  // Browser half: declared, exported, and registered under the package name.
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

  // Locales: every language present, with the same meta keys.
  const metas = {}
  for (const lang of LOCALES) {
    const file = join(base, 'locale', `${lang}.json`)
    if (!existsSync(file)) { fail(id, `locale/${lang}.json is missing`); continue }
    try {
      const meta = JSON.parse(readFileSync(file, 'utf8')).meta
      if (!meta?.title || !meta?.description) fail(id, `locale/${lang}.json needs meta.title and meta.description`)
      metas[lang] = Object.keys(meta ?? {}).toSorted().join(',')
    } catch (error) { fail(id, `locale/${lang}.json: ${error.message}`) }
  }
  if (new Set(Object.values(metas)).size > 1) fail(id, 'locale meta keys differ between languages')

  if (!existsSync(join(base, pkg.icon ?? 'icon.svg'))) fail(id, 'icon is missing')
}

if (errors.length > 0) {
  for (const e of errors) console.error(`✖ ${e}`)
  process.exit(1)
}
console.log('✔ all packages valid')
