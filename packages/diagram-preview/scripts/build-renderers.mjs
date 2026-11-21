import { copyFile, mkdir, readFile, utimes, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const file = path => new URL(path, root)
const libraries = {
  mermaid: 'mermaid/dist/mermaid.min.js',
  graphviz: '@viz-js/viz/dist/viz-global.js',
  echarts: 'echarts/dist/echarts.min.js',
}
for (const [engine, path] of Object.entries(libraries)) {
  const chunk = `client.${engine}.js`
  const vendor = await readFile(file(`node_modules/${path}`), 'utf8')
  await writeFile(file(`lib/${chunk}`), `window.__ModuleLoader__.load({ id: 'dsh-diagram-preview', chunk: '${chunk}', factory: () => ${JSON.stringify(vendor)} })\n`)
}
await mkdir(file('lib/licenses'), { recursive: true })
for (const [source, target] of [
  ['mermaid/LICENSE', 'Mermaid'], ['echarts/LICENSE', 'ECharts'],
  ['echarts/NOTICE', 'ECharts-NOTICE'], ['echarts/licenses/LICENSE-d3', 'ECharts-d3'],
]) await copyFile(file(`node_modules/${source}`), file(`lib/licenses/${target}.txt`))
// external: dsh revisions sibling chunks using lib/client.js mtime
const now = new Date()
await utimes(file('lib/client.js'), now, now)
