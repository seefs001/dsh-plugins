import { spawnSync } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = new URL('../', import.meta.url)
const platforms = ['darwin-arm64', 'darwin-x64', 'linux-arm64', 'linux-x64', 'win32-arm64', 'win32-x64']
const binaryName = target => target.startsWith('win32-') ? 'moejs.exe' : 'moejs'
if (process.argv.includes('--check')) {
  const files = ['lib/generated/moe-execute.js', 'bin/NOTICE', ...platforms.map(p => `bin/${p}/${binaryName(p)}`)]
  for (const file of files) {
    try { await access(new URL(file, root)) }
    catch { throw new Error(`Missing ${file}; run pnpm build:runner:all before packaging`) }
  }
  process.exit(0)
}
const pi = import.meta.resolve('@earendil-works/pi-coding-agent')
const lib = import.meta.resolve('@earendil-works/pi-codemode')
const { PRELUDE_SOURCE } = await import(new URL('./runtime/prelude-source.js', lib))
const src = new URL('extensions/codemode/execute.js', pi)
const version = JSON.parse(await readFile(new URL('../package.json', pi))).version
if (version !== '1.7.0') throw new Error(`Review the executor adapter for Pi ${version}`)
let body = await readFile(src, 'utf8')
function replace(from, to) {
  if (body.split(from).length !== 2) throw new Error(`Pi executor changed: ${from}`)
  body = body.replace(from, () => to)
}
replace('import { CodemodeSandbox, loadQuickJSWasm, ', 'import { ')
replace('import { getCodemodeWorkerSpecifier, getQuickJSWasmPath } from "../../config.js";\n', '')
replace('new CodemodeSandbox({', 'new CodemodeSandboxBase({')
replace('            wasm: loadQuickJSWasm(getQuickJSWasmPath()),\n            workerUrl: getCodemodeWorkerSpecifier(),\n            acquireWorker: () => {', '        }, (data, events) => options.runnerPool.launch(data, events, () => {')
replace('                return releaseCodemodeWorker;\n            },\n        });', '                return releaseCodemodeWorker;\n            }));')
body = body.replace(/^import \{ (.+?) \} from "(.+?)";$/gm, (_, names, spec) =>
  `const { ${names} } = await import(${spec.startsWith('.') ? `new URL(${JSON.stringify(spec)}, upstream)` : 'codemode'});`)
body = body.replace('//# sourceMappingURL=execute.js.map', '')
const header = `// Generated from Pi ${version} (MIT), see bin/NOTICE. Do not edit.\nconst pi = import.meta.resolve('@earendil-works/pi-coding-agent');\nconst upstream = new URL('extensions/codemode/execute.js', pi);\nconst codemode = import.meta.resolve('@earendil-works/pi-codemode');\nconst { CodemodeSandboxBase } = await import(new URL('./portable.js',codemode));\n`
await mkdir(new URL('lib/generated/',root),{recursive:true})
await writeFile(new URL('lib/generated/moe-execute.js',root),header+body)
await writeFile(new URL('runner/prelude.js',root),PRELUDE_SOURCE)
const cwd = fileURLToPath(new URL('runner/',root))
function go(args, env = {}) {
  const r = spawnSync('go',args,{cwd, env:{...process.env,CGO_ENABLED:'0',GOWORK:'off',...env},encoding:'utf8'})
  if (r.error || r.status !== 0) throw r.error ?? new Error(r.stderr)
  return r.stdout.trim()
}
const targets = process.argv.includes('--all') ? platforms : [`${process.platform}-${process.arch}`]
for (const target of targets) {
  const [os,arch] = target.split('-')
  const dir = new URL(`bin/${target}/`,root)
  await mkdir(dir,{recursive:true})
  go(['build','-mod=readonly','-trimpath','-buildvcs=false','-ldflags=-s -w','-o',fileURLToPath(new URL(binaryName(target),dir)),'.'],{GOOS:os==='win32'?'windows':os,GOARCH:arch==='x64'?'amd64':arch})
  console.log(`Built ${target}`)
}
const notices = ['Pi coding agent and Pi Code Mode: MIT. https://github.com/earendil-works/pi']
for (const name of ['github.com/MoeForge/moejs','github.com/MoeForge/moego']) {
  const dir = pathToFileURL(`${go(['list','-m','-f','{{.Dir}}',name])}/`)
  for (const file of ['LICENSE','THIRD_PARTY_NOTICES']) {
    try { notices.push(`${name}/${file}\n${await readFile(new URL(file,dir),'utf8')}`) } catch (e) { if(e.code!=='ENOENT') throw e }
  }
}
const piLicense = new URL('../LICENSE',pi)
try { notices.push(await readFile(piLicense,'utf8')) } catch (e) { if(e.code!=='ENOENT') throw e; notices.push(await readFile(new URL('PI-LICENSE',import.meta.url),'utf8')) }
await writeFile(new URL('bin/NOTICE',root),notices.join('\n\n'))
