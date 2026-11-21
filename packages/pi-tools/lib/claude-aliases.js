// external: models trained on Claude Code emit its tool names and argument shapes
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
    // external: Claude Code Bash timeout is in milliseconds whereas Pi bash uses seconds
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

export function aliasToolCall(block, available) {
  const alias = Object.hasOwn(CLAUDE_CODE_ALIASES, block.name) ? CLAUDE_CODE_ALIASES[block.name] : undefined
  if (!alias || !available(block.name, alias.target)) return block
  let args
  try {
    args = block.arguments ? JSON.parse(block.arguments) : {}
  } catch {
    return { ...block, name: alias.target }
  }
  if (!args || typeof args !== 'object' || Array.isArray(args)) return { ...block, name: alias.target }
  return { ...block, name: alias.target, arguments: JSON.stringify(alias.map(args)) }
}
