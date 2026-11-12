import { constants } from 'node:os'
import { detectImageMimeType, getShellConfig, resolveToCwd } from './pi.js'
import { findPaths, runLines } from './search.js'

const MAX_TIMEOUT_MS = 2_147_483_647

export function createOperations(ctx, exec, cwd, config = {}) {
  const signal = exec.signal
  const policy = ctx.sandboxPolicy.resolve({ session: exec.agent?.session })
  const resolve = path => ctx.fs.resolve(path, { cwd, signal })

  async function file(path) {
    const target = await resolve(path)
    const info = await ctx.fs.stat(target, signal)
    if (!info) throw Object.assign(new Error(`ENOENT: no such file, open '${path}'`), { code: 'ENOENT' })
    if (info.type !== 'file') throw Object.assign(new Error(`Not a regular file: ${path}`), { code: 'EISDIR' })
    return { target, info }
  }

  async function readFile(path) {
    const { target, info } = await file(path)
    // Bound the backend read by the observed size, not an arbitrary compatibility limit.
    if (!Number.isSafeInteger(info.size) || info.size < 0) {
      throw new Error('Pi tools require a filesystem provider that reports regular-file sizes')
    }
    return Buffer.from(await ctx.fs.readBytes(target, signal, info.size))
  }

  async function writeFile(path, content) {
    await ctx.fs.writeText(await resolve(path), content, undefined, signal, policy)
  }

  const exists = async path => (await ctx.fs.stat(await resolve(path), signal)) !== undefined
  const processPath = async input => ctx.fs.processPath(await resolve(input))
  const stat = async input => {
    const value = await ctx.fs.stat(await resolve(input), signal)
    if (!value) throw new Error(`Path not found: ${input}`)
    return value
  }
  const pending = new Set()
  const lines = (kind, args, onLine) => {
    const command = kind === 'fd' ? config.fdCommand ?? 'fd' : config.rgCommand ?? 'rg'
    const task = runLines(ctx, command, args, cwd, signal, policy, onLine)
    pending.add(task)
    void task.then(() => pending.delete(task), () => pending.delete(task))
    return task
  }
  return {
    drain: () => Promise.allSettled(pending),
    ls: {
      exists,
      stat: async input => {
        const info = await stat(input)
        return { isDirectory: () => info.type === 'directory' }
      },
      readdir: async input => (await ctx.fs.listDir(await resolve(input), signal)).map(entry => entry.name),
    },
    find: {
      exists,
      glob: async (pattern, root, options) => findPaths({ exists, lines }, pattern, await processPath(root), options.limit),
    },
    grep: {
      path: input => processPath(resolveToCwd(input, cwd)), lines,
      isDirectory: async input => (await stat(input)).type === 'directory',
      readFile: async input => (await readFile(input)).toString('utf8'),
    },
    read: {
      readFile,
      access: async path => { await file(path) },
      detectImageMimeType: async path => detectImageMimeType(await ctx.fs.readByteRange(
        await resolve(path), { offset: 0, length: 4100 }, signal,
      )),
    },
    edit: { readFile, writeFile, access: async path => { await file(path) } },
    write: {
      writeFile,
      // writeText creates parents after the sandbox fence, as part of atomic publication.
      // Creating directories through Node here would bypass that fence.
      mkdir: async () => {},
    },
    bash: {
      exec: (command, workdir, options) => runShell(ctx, command, workdir, options, policy),
    },
  }
}

async function runShell(ctx, command, cwd, { signal, timeout, onData }, policy) {
  if (timeout !== undefined && (!Number.isFinite(timeout) || timeout <= 0)) {
    throw new Error('Invalid timeout: must be a finite number of seconds')
  }
  if (timeout !== undefined && timeout * 1000 > MAX_TIMEOUT_MS) {
    throw new Error(`Invalid timeout: maximum is ${MAX_TIMEOUT_MS / 1000} seconds`)
  }
  signal?.throwIfAborted()
  const shell = getShellConfig()
  const stdin = shell.commandTransport === 'stdin'
  let argv = [shell.shell, ...shell.args, ...(stdin ? [] : [command])]
  if (policy.mode !== 'danger-full-access') {
    // No unconfined fallback if a runner is missing or refuses this policy.
    argv = (await ctx.sandbox.confine(argv, policy, signal)).argv
  }
  signal?.throwIfAborted()
  const process = ctx.subprocess.spawn({
    argv,
    cwd,
    stdio: { stdin: stdin ? { data: command } : 'ignore', stdout: 'pipe', stderr: 'pipe' },
    graceMs: 100,
    signal,
    // Keep DSH's scrubbed environment; do not reinject Pi's copy of process.env.
  })
  let timedOut = false
  const timer = timeout === undefined ? undefined : setTimeout(() => {
    timedOut = true
    process.terminate()
  }, timeout * 1000)
  process.stdout.on('data', onData)
  process.stderr.on('data', onData)
  try {
    const result = await process.done
    if (timedOut || signal?.aborted) await process.waitForExit()
    if (signal?.aborted) throw new Error('aborted')
    if (timedOut) throw new Error(`timeout:${timeout}`)
    return { exitCode: result.exitCode ?? (result.signal ? 128 + (constants.signals[result.signal] ?? 0) : null) }
  } finally {
    clearTimeout(timer)
    process.stdout.off('data', onData)
    process.stderr.off('data', onData)
  }
}
