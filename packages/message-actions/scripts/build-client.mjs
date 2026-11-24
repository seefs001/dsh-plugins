import { build } from 'esbuild'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const sharedBuild = {
  absWorkingDir: root,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives'],
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  legalComments: 'eof',
  metafile: true,
  write: false,
}

const [result, markdownResult] = await Promise.all([
  build({ ...sharedBuild, entryPoints: ['src/client.js'] }),
  build({ ...sharedBuild, entryPoints: ['src/markdown.js'] }),
])

for (const meta of [result.metafile, markdownResult.metafile]) {
  for (const output of Object.values(meta.outputs)) {
    for (const entry of output.imports) {
      if (entry.external && !['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives'].includes(entry.path)) {
        throw new Error(`Unexpected Client runtime import: ${entry.path}`)
      }
    }
  }
}
const artifact = `window.__ModuleLoader__.load({
  id: 'dsh-message-actions',
  factory(require) {
    globalThis.__dshMessageActionsRequireAsync = require.async
    const module = { exports: {} }
${result.outputFiles[0].text}
    return module.exports.default
  },
})
`
const markdownChunk = `window.__ModuleLoader__.load({
  id: 'dsh-message-actions',
  chunk: 'client.markdown.js',
  factory(require) {
    const module = { exports: {} }
${markdownResult.outputFiles[0].text}
    return module.exports
  },
})
`

const licenses = new Map()
for (const meta of [result.metafile, markdownResult.metafile]) {
  for (const input of Object.keys(meta.inputs)) {
    if (!input.includes('node_modules/')) continue
    let dir = dirname(resolve(root, input))
    while (dir !== dirname(dir)) {
      let pkg
      try { pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8')) }
      catch (error) { if (error.code !== 'ENOENT') throw error }
      if (pkg) {
        if (!licenses.has(pkg.name)) {
          const license = (await readdir(dir)).find(name => /^licen[cs]e(?:[.-].*)?$/i.test(name))
          const text = license ? await readFile(join(dir, license), 'utf8') : `License: ${pkg.license}`
          licenses.set(pkg.name, `${pkg.name}@${pkg.version}\n${text.trim()}`)
        }
        break
      }
      dir = dirname(dir)
    }
  }
}
await writeFile(join(root, 'lib/THIRD_PARTY_LICENSES.txt'), [...licenses].toSorted(([a], [b]) => a.localeCompare(b)).map(([, text]) => text).join('\n\n---\n\n') + '\n')
await writeFile(join(root, 'lib/client.js'), artifact)
await writeFile(join(root, 'lib/client.markdown.js'), markdownChunk)
console.log(`Built Client: ${Buffer.byteLength(artifact)} bytes (+ lazy markdown chunk ${Buffer.byteLength(markdownChunk)} bytes); ${licenses.size} dependency licenses; React remains external.`)
