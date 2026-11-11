/**
 * `isolation: untrusted` enforcement (switchboard spec §11.5, spike S6).
 *
 * DSH's Seatbelt profile cannot be tightened per session and nested
 * sandbox-exec is refused, so isolation is enforced at the tool layer: every
 * tool call of a tainted session passes the `tools/pre-execute` gate, which
 * allows only in-process, read-only, workspace-confined tools. No process
 * execution (bash, terminals, run_code), no web tools, no MCP or subagents:
 * tool execution has no network path.
 */
import { realpath } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'

/** The only tools a tainted session may run. Everything else is denied by default. */
export const UNTRUSTED_TOOLS = ['read', 'read_image', 'grep', 'glob', 'todo_write']
const PATH_ARGS = ['file_path', 'path']

const isRecord = v => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Realpath of `p`, or of its nearest existing ancestor joined with the rest. */
async function realish(p) {
  let head = p
  const rest = []
  for (;;) {
    try {
      const real = await realpath(head)
      return rest.length ? `${real}${sep}${rest.toReversed().join(sep)}` : real
    } catch {
      const parent = dirname(head)
      if (parent === head) return p
      rest.push(head.slice(parent.length).replace(/^[/\\]+/, ''))
      head = parent
    }
  }
}

/** Whether `target` (absolute, or relative to `root`) resolves inside `root`, following symlinks. */
export async function insideRoot(root, target) {
  if (target.startsWith('~')) return false
  const rootReal = await realish(resolve(root))
  const real = await realish(resolve(root, target))
  const rel = relative(rootReal, real)
  return !rel.startsWith('..') && !isAbsolute(rel)
}

/** Denial reason for one tool execution in a tainted session, or `undefined` to allow. */
export async function untrustedDenial(exec, cwd) {
  const name = String(exec?.name ?? '')
  if (!UNTRUSTED_TOOLS.includes(name)) return `tool "${name}" is disabled in this untrusted run (read-only, no network, workspace only)`
  const args = isRecord(exec.arguments) ? exec.arguments : {}
  for (const key of PATH_ARGS) {
    const value = args[key]
    if (typeof value === 'string' && value !== '' && !await insideRoot(cwd, value)) return `path "${value}" is outside the workspace of this untrusted run`
  }
  if (name === 'glob' && typeof args.pattern === 'string') {
    const p = args.pattern
    if (isAbsolute(p) || p.startsWith('~') || p.split(/[/\\]/).includes('..')) return 'glob pattern must stay inside the workspace of this untrusted run'
  }
  return undefined
}
