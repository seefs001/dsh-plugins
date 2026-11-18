// Opt-in wire probe. No DSH sessions, profile changes, or implicit provider/model.
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [base, model, keyEnv] = process.argv.slice(2)
if (!base || !model || !keyEnv) {
  console.error('Usage: node scripts/probe-responses-compaction.mjs <responses-base-url> <model> <key-env-name>')
  process.exit(1)
}
const url = new URL(base)
if (url.username || url.password || url.search || url.hash || !(url.protocol === 'https:' ||
  (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
  throw new Error('Use HTTPS or a loopback HTTP base URL without credentials, query or fragment')
}
if (!process.env[keyEnv]) {
  console.error('Configured key is absent from the environment; no request sent')
  process.exit(1)
}
const root = url.href.replace(/\/+$/, '')

async function post(path, body) {
  const res = await fetch(`${root}/${path}`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(120_000),
    headers: { authorization: `Bearer ${process.env[keyEnv]}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, ...body }),
  })
  if (!res.ok) {
    // Neither an auth/transient error nor a generic 400 proves the model lacks compaction.
    const details = await res.json().catch(() => null)
    const code = details?.error?.code
    const knownUnsupported = ['unsupported_model', 'unsupported_endpoint', 'model_not_supported'].includes(code)
    throw new Error(`${path}: HTTP ${res.status}; ${knownUnsupported ? 'not supported for this route/model' : 'native capability not verified'}`)
  }
  const data = await res.json()
  if (!Array.isArray(data.output)) throw new Error(`${path}: missing output window`)
  return data.output
}

const message = (role, content) => ({ role, content })
const question = label => `Return only the exact ${label} code previously supplied by the observe tool.`
const tools = [{ type: 'function', name: 'observe', description: 'Return the observation code.',
  parameters: { type: 'object', properties: {}, required: [], additionalProperties: false }, strict: true }]
async function answer(input, expected) {
  const output = await post('responses', { input, tools, store: false, tool_choice: 'none', max_output_tokens: 1024 })
  const text = output.filter(item => item?.type === 'message' && item.role === 'assistant')
    .flatMap(item => item.content).filter(block => block?.type === 'output_text').map(block => block.text).join('').trim()
  if (text !== expected) throw new Error('Responses did not recall the synthetic tool result exactly')
  return output
}

async function probe() {
  const codes = { first: randomUUID().slice(0, 8), second: randomUUID().slice(0, 8) }
  const input = [message('user', 'Observe and remember both labeled codes exactly for later.'),
    { type: 'function_call', name: 'observe', arguments: '{}', call_id: 'call_observe' },
    { type: 'function_call_output', call_id: 'call_observe', output: JSON.stringify(codes) }]
  const window = await post('responses/compact', { input })
  if (!window.some(item => item?.type === 'compaction' && typeof item.encrypted_content === 'string' && item.encrypted_content.length > 0)) {
    throw new Error('No encrypted compaction item returned; no continuation attempted')
  }
  const turn = [...window, message('user', question('first'))]
  const output = await answer(turn, codes.first)
  const dir = await mkdtemp(join(tmpdir(), 'dsh-native-compact-'))
  try {
    // Stateless replay: send every returned item, in order. No previous_response_id or in-memory provider session.
    const file = join(dir, 'window.json')
    await writeFile(file, JSON.stringify([...turn, ...output]), { mode: 0o600, flag: 'wx' })
    const restored = JSON.parse(await readFile(file, 'utf8'))
    // The first reply revealed only `first`; it cannot supply the second answer on replay.
    await answer([...restored, message('user', question('second'))], codes.second)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
  console.log(`Verified compact, continuation and replay of the saved Responses window for ${model}. No DSH session changed.`)
}

await probe().catch(error => { console.error(error.message); process.exitCode = 1 })
