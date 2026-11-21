import { build } from 'esbuild'
import { readFile, readdir, utimes, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const result = await build({
  absWorkingDir: root,
  entryPoints: ['src/runtime.jsx'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  legalComments: 'eof',
  metafile: true,
  write: false,
})

const runtimeSource = result.outputFiles[0].text
const chunkArtifact = `window.__ModuleLoader__.load({ id: 'dsh-canvas', chunk: 'client.runtime.js', factory: () => ${JSON.stringify(runtimeSource)} })\n`

const licenses = new Map()
for (const input of Object.keys(result.metafile.inputs)) {
  if (!input.includes('node_modules/')) continue
  let dir = dirname(resolve(root, input))
  while (dir !== dirname(dir)) {
    let pkg
    try { pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8')) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    if (pkg) {
      if (!licenses.has(pkg.name)) {
        const licenseFile = (await readdir(dir)).find(name => /^licen[cs]e(?:[.-].*)?$/i.test(name))
        const text = licenseFile ? await readFile(join(dir, licenseFile), 'utf8') : `License: ${pkg.license}`
        licenses.set(pkg.name, `${pkg.name}@${pkg.version}\n${text.trim()}`)
      }
      break
    }
    dir = dirname(dir)
  }
}

await writeFile(
  join(root, 'lib/THIRD_PARTY_LICENSES.txt'),
  [...licenses].toSorted(([a], [b]) => a.localeCompare(b)).map(([, text]) => text).join('\n\n---\n\n') + '\n',
)
await writeFile(join(root, 'lib/client.runtime.js'), chunkArtifact)

// external: dsh revisions sibling chunks using lib/client.js mtime
const clientPath = join(root, 'lib/client.js')
try {
  const now = new Date()
  await utimes(clientPath, now, now)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

console.log(`Built Canvas runtime: ${Buffer.byteLength(runtimeSource)} bytes (${licenses.size} dependency licenses).`)
