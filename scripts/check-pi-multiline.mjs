// Diagnostic for the supplied Intel/Google input. Tool calls are captured, never executed.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { PiExecutor } from '../packages/pi-tools/lib/executor.js'
import { createTools } from '../packages/pi-tools/lib/index.js'
const original=JSON.parse(readFileSync(new URL('./fixtures/pi-multiline-python.json',import.meta.url),'utf8'))
const captures=[]
const definitions=[{name:'bash',description:'Capture arguments only; never run a command',parameters:{type:'object',properties:{command:{type:'string'},timeout:{type:'number'}},required:['command']}}]
const config={tools:[],codemode:true,toolSearch:false,maxParallel:10}
const executor=Object.assign(Object.create(PiExecutor.prototype),{
  ctx:{tools:{definitions:()=>definitions},sandboxPolicy:{resolve:()=>({mode:'read-only'})}},
  config,active:new Set(),disposed:false,structuredErrors:new WeakMap(),
  loadout:{namespace:()=>undefined,guidelines:new Map(),stateOf:()=>({store:{}}),callable:()=>definitions,bridges:new Map()},
  nestedPipeline:{
    executionMode:()=>({kind:'parallel'}),
    prepare:async input=>({kind:'dispatch',exec:{...input,token:Symbol()}}),
    dispatch:async exec=>{captures.push({name:exec.name,args:exec.arguments});return {isError:false,value:{},content:[{type:'text',text:'captured, not executed'}]}},
    complete:async(_exec,result)=>result,
  },
})
const context=()=>({callId:'intel-quoting-check',rootCallId:'intel-quoting-check',token:Symbol(),signal:AbortSignal.timeout(15000),deferContext(){},concludeTurn(){}})
const text=result=>result.content.filter(block=>block.type==='text').map(block=>block.text).join('\n')
const failed=await executor.codemode(original,context())
assert(failed.isError)
assert.equal(captures.length,0)
assert.match(text(failed),/SyntaxError: unexpected end of string\n\s+at codemode\.js:1:83/)
assert(text(failed).includes('Codemode JavaScript syntax recovery'))
console.log('PASS original reproduces SyntaxError at codemode.js:1:83 with zero calls')
const publicTool=createTools({workingDirectory:{defaultDirectory:process.cwd()}},config,executor).find(tool=>tool.name==='codemode')
await assert.rejects(publicTool.execute(original,context()),/Codemode JavaScript syntax recovery/)
assert.equal(captures.length,0)
console.log('PASS current local public tool reports recovery guidance; it does not rewrite or replay the input')

// Locate only the two known command boundaries in this exact supplied fixture.
const spans=[]
let cursor=0
for(const timeout of [25,20]){
  const start=original.code.indexOf('command:"',cursor)+'command:'.length
  const end=original.code.indexOf(`",timeout:${timeout}}`,start+1)
  assert(start>=0&&original.code[start]==='"'&&end>start)
  const command=original.code.slice(start+1,end)
  assert(!command.includes('`')&&!command.includes('${'))
  assert(command.includes("re.sub(r'\\s+'"))
  spans.push({start,end,command,timeout})
  cursor=end+1
}
function wrap(raw){
  let source=original.code
  for(const span of spans.toReversed())source=source.slice(0,span.start)+(raw?'String.raw`':'`')+span.command+'`'+source.slice(span.end+1)
  return {code:source}
}
const naive=await executor.codemode(wrap(false),context())
assert(!naive.isError,text(naive))
assert.equal(captures.length,2)
for(const item of captures){
  assert(item.args.command.includes("re.sub(r's+'"))
  assert(!item.args.command.includes("re.sub(r'\\s+'"))
}
console.log('PASS counterexample: plain backticks parse but silently change Python regex \\s+ to s+')
captures.length=0
const corrected=wrap(true)
const success=await executor.codemode(corrected,context())
assert(!success.isError,text(success))
assert.deepEqual(captures,spans.map(({command,timeout})=>({name:'bash',args:{command,timeout}})))
for(const {command}of spans){
  const shell=spawnSync('/bin/bash',['-n'],{input:command,encoding:'utf8'})
  assert.equal(shell.status,0,shell.stderr)
  assert(command.startsWith("python3 - <<'PY'\n")&&command.endsWith('\nPY'))
  const python=command.slice("python3 - <<'PY'\n".length,-'\nPY'.length)
  const parsed=spawnSync('python3',['-c','import ast,sys; ast.parse(sys.stdin.read()); print("AST OK")'],{input:python,encoding:'utf8'})
  assert.equal(parsed.status,0,parsed.stderr)
}
assert.equal(executor.active.size,0)
console.log('PASS String.raw correction preserves both complete command strings and timeouts byte-for-byte')
console.log('PASS both shell heredocs and Python programs pass syntax-only checks')
const serialized=JSON.stringify(corrected,null,2)+'\n'
assert.deepEqual(JSON.parse(serialized),corrected)
assert.deepEqual(corrected,JSON.parse(readFileSync(new URL('./fixtures/pi-multiline-python-corrected.json',import.meta.url),'utf8')))
console.log('PASS committed corrected input matches the verified source')
console.log('No HTTP requests or supplied bash/Python operations were executed; only argument capture and syntax checks ran.')
