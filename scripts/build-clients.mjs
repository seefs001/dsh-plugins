#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'
import { transform } from '../packages/canvas/node_modules/esbuild/lib/main.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PACKAGES = join(ROOT, 'packages')
const SKIP = new Set(['message-actions'])
const CLIENT_SRC_RE = /^client(?:\.[A-Za-z0-9][A-Za-z0-9._-]*)?\.js$/
const CHECK_ONLY = process.argv.includes('--check')

function resolveOutPath(pkgDir, pkg, fileName) {
  const clientExport = pkg.exports?.['./client']
  if (!clientExport) throw new Error(`${pkg.name}: missing exports["./client"]`)
  const outDir = dirname(join(pkgDir, clientExport))
  return join(outDir, fileName)
}

function validateOutput(pkgName, fileName, code) {
  const idMatch = /__ModuleLoader__\.load\(\{\s*id:\s*['"]([^'"]+)['"]/.exec(code)
  if (idMatch?.[1] !== pkgName) {
    throw new Error(`${pkgName}/${fileName}: built bundle id "${idMatch?.[1]}" does not match "${pkgName}"`)
  }
  if (fileName !== 'client.js') {
    const chunkMatch = /chunk:\s*['"]([^'"]+)['"]/.exec(code)
    if (chunkMatch?.[1] !== fileName) {
      throw new Error(`${pkgName}/${fileName}: built chunk "${chunkMatch?.[1]}" does not match "${fileName}"`)
    }
  }
}

const dirs = readdirSync(PACKAGES).toSorted()
let totalSrc = 0
let totalOut = 0
let totalSrcGz = 0
let totalOutGz = 0
let builtFiles = 0

for (const dir of dirs) {
  if (SKIP.has(dir)) continue
  const pkgDir = join(PACKAGES, dir)
  const srcDir = join(pkgDir, 'src')
  if (!existsSync(srcDir)) continue
  const sources = readdirSync(srcDir).toSorted().filter(name => CLIENT_SRC_RE.test(name))
  if (sources.length === 0) continue

  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
  for (const fileName of sources) {
    const srcPath = join(srcDir, fileName)
    const srcText = readFileSync(srcPath, 'utf8')
    const result = await transform(srcText, {
      loader: 'js',
      minify: true,
      target: 'es2022',
      legalComments: 'none',
    })
    const outText = `${result.code.trimEnd()}\n`
    validateOutput(pkg.name, fileName, outText)
    const outPath = resolveOutPath(pkgDir, pkg, fileName)
    if (CHECK_ONLY) {
      const current = existsSync(outPath) ? readFileSync(outPath, 'utf8') : null
      if (current !== outText) {
        throw new Error(`${dir}/${fileName}: built output is out of date (run pnpm run build:clients)`)
      }
    } else {
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, outText, 'utf8')
    }

    const srcBuf = Buffer.from(srcText, 'utf8')
    const outBuf = Buffer.from(outText, 'utf8')
    const srcGz = zlib.gzipSync(srcBuf, { level: 1 }).length
    const outGz = zlib.gzipSync(outBuf, { level: 1 }).length
    totalSrc += srcBuf.length
    totalOut += outBuf.length
    totalSrcGz += srcGz
    totalOutGz += outGz
    builtFiles++
    console.log(
      `${`${dir}/${fileName}`.padEnd(36)} ${(srcBuf.length / 1024).toFixed(1).padStart(6)}K -> ${(outBuf.length / 1024).toFixed(1).padStart(6)}K`
      + `  (gz1 ${(srcGz / 1024).toFixed(1).padStart(5)}K -> ${(outGz / 1024).toFixed(1).padStart(5)}K)`,
    )
  }
}

console.log(
  `\nBuilt ${builtFiles} client files: ${(totalSrc / 1024).toFixed(1)}K -> ${(totalOut / 1024).toFixed(1)}K`
  + ` (-${(((totalSrc - totalOut) / Math.max(1, totalSrc)) * 100).toFixed(1)}%)`
  + ` | gz1 ${(totalSrcGz / 1024).toFixed(1)}K -> ${(totalOutGz / 1024).toFixed(1)}K`
  + ` (-${(((totalSrcGz - totalOutGz) / Math.max(1, totalSrcGz)) * 100).toFixed(1)}%)`,
)
