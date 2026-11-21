const allocate = `const s = require('node:net').createServer(c => c.destroy());
s.on('error', e => { console.error(e.code); process.exitCode = 1 });
s.listen(0, '127.0.0.1', () => { const port = s.address().port; s.close(() => console.log(port)) })`
const sample = `const s = require('node:net').connect({ host: '127.0.0.1', port: Number(process.argv[1]) });
s.once('connect', () => { s.destroy(); console.log('accepting') });
s.once('error', e => { if (e.code === 'ECONNREFUSED') console.log('refused'); else { console.error(e.code); process.exitCode = 1 } });
s.setTimeout(500, () => { s.destroy(); console.log('timeout') })`

export const validServicePort = port => Number.isSafeInteger(port) && port >= 1024 && port <= 65535

async function helper(agent, cwd, args, life) {
  const ctx = agent.ctx, policy = ctx.get('sandboxPolicy')?.resolve({ session: agent.session }), sandbox = ctx.get('sandbox')
  const subprocess = ctx.get('subprocess')
  if (!sandbox || !policy || !subprocess) throw new Error('Port monitoring requires DSH subprocess and sandbox services')
  const signal = AbortSignal.any([life, AbortSignal.timeout(5000)])
  const program = await subprocess.resolveExecutable('node', undefined, signal)
  const { argv } = await sandbox.confine([program, '-e', ...args], { ...policy, mode: 'read-only' }, signal)
  signal.throwIfAborted()
  const child = subprocess.spawn({ argv, cwd, signal, env: { NODE_OPTIONS: undefined }, graceMs: 250,
    stdio: { stdin: 'ignore', stdout: { maxBytes: 256 }, stderr: { maxBytes: 512 } } })
  try {
    const { exitCode } = await child.done
    signal.throwIfAborted()
    const output = child.collected.stdout.readFrom(0)
    if (exitCode !== 0 || output.lossy) throw new Error(`DSH port check unavailable: ${child.collected.stderr.readFrom(0).text.trim() || 'Node helper failed'}`)
    return output.text.trim()
  } finally { child.terminate(); await child.waitForExit() }
}

export async function allocateServicePort(agent, cwd, life) {
  const port = Number(await helper(agent, cwd, [allocate], life))
  if (!validServicePort(port)) throw new Error('DSH could not allocate a loopback service port')
  return port
}

export async function sampleServicePort(agent, run, life) {
  if (!validServicePort(run.servicePort)) throw new Error('This run has no assigned loopback port')
  const state = await helper(agent, run.cwd, [sample, String(run.servicePort)], life)
  if (!['accepting', 'refused', 'timeout'].includes(state)) throw new Error('Unexpected port check result')
  return { terminalId: run.terminalId, port: run.servicePort, state, checkedAt: Date.now() }
}
