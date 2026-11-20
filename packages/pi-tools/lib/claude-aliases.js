// Models trained on Claude Code often call its tool names (Bash, Read, Edit...)
// with its argument shapes even when only Pi's tools are declared. The
// declarations stay unchanged; such calls are rewritten to the equivalent Pi
// call before dispatch. Results pair with the model's call by callId, so the
// model's own message keeps the name it chose.

const path = args => args.file_path ?? args.path ?? args.notebook_path

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined))
}

function editOf(item) {
  return { oldText: item.old_string ?? item.oldText, newText: item.new_string ?? item.newText }
}

function number(value) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const CLAUDE_CODE_ALIASES = {
  Bash: {
    target: 'bash',
    // Claude Code's timeout is in milliseconds; Pi's is in seconds.
    map: args => compact({ command: args.command, timeout: number(args.timeout) === undefined ? undefined : Math.max(1, Math.ceil(number(args.timeout) / 1000)) }),
  },
  Read: {
    target: 'read',
    map: args => compact({ path: path(args), offset: number(args.offset), limit: number(args.limit) }),
  },
  Write: {
    target: 'write',
    map: args => compact({ path: path(args), content: args.content }),
  },
  // Pi requires each oldText to match once, so a replace_all over several
  // matches fails instead of silently replacing only one of them.
  Edit: {
    target: 'edit',
    map: args => compact({ path: path(args), edits: Array.isArray(args.edits) ? args.edits.map(editOf) : [editOf(args)] }),
  },
  MultiEdit: {
    target: 'edit',
    map: args => compact({ path: path(args), edits: Array.isArray(args.edits) ? args.edits.map(editOf) : undefined }),
  },
  Grep: {
    target: 'grep',
    map: args => {
      const around = [args['-C'], args.context, args['-A'], args['-B']].map(number).filter(value => value !== undefined)
      return compact({
        pattern: args.pattern,
        path: args.path,
        glob: args.glob ?? (typeof args.type === 'string' && args.type ? `*.${args.type}` : undefined),
        ignoreCase: args['-i'] ?? args.ignoreCase,
        context: around.length ? Math.max(...around) : undefined,
        limit: number(args.head_limit ?? args.limit),
      })
    },
  },
  Glob: {
    target: 'find',
    map: args => compact({ pattern: args.pattern, path: args.path }),
  },
  LS: {
    target: 'ls',
    map: args => compact({ path: args.path }),
  },
}

/**
 * Rewrite one model tool-call block when it names a Claude Code tool.
 * @param block `{ id, name, arguments }` with arguments as a JSON string
 * @param available whether a Pi tool name may run for this call
 * @returns the rewritten block, or the original one
 */
export function aliasToolCall(block, available) {
  const alias = Object.hasOwn(CLAUDE_CODE_ALIASES, block.name) ? CLAUDE_CODE_ALIASES[block.name] : undefined
  if (!alias || !available(block.name, alias.target)) return block
  let args
  try {
    args = block.arguments ? JSON.parse(block.arguments) : {}
  } catch {
    // Invalid JSON keeps its text so validation reports it under the Pi tool.
    return { ...block, name: alias.target }
  }
  if (!args || typeof args !== 'object' || Array.isArray(args)) return { ...block, name: alias.target }
  return { ...block, name: alias.target, arguments: JSON.stringify(alias.map(args)) }
}
