import { randomBytes } from 'node:crypto'

const MCP_TOOL_PREFIX = 'mcp__'
export const MCP_PROXY_SERVER_NAME = 'dsh_mcp'
const SERVER_NAME_RE = /^[A-Za-z0-9_-]{1,32}$/u
const ACTIVE_MANAGER_STATES = new Set(['connected', 'connecting', 'reconnecting'])
const BLOCKED_MANAGER_STATES = new Set(['disabled', 'closed', 'failed', 'waiting-credentials', 'waiting-authorization'])
const MAX_SUMMARY_DESC_CHARS = 160
const DEFAULT_LIST_LIMIT = 50
const MAX_LIST_LIMIT = 200
const MAX_DESC_SERVERS = 12

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function managerServerStates(ctx) {
  const states = new Map()
  const manager = ctx?.get?.('mcpManager')
  if (typeof manager?.list !== 'function') return states
  let views
  try {
    views = manager.list()
  } catch {
    return states
  }
  if (!Array.isArray(views)) return states
  for (const view of views) {
    if (!view || typeof view.name !== 'string' || !view.name) continue
    states.set(view.name, {
      configured: view.configured !== false,
      state: typeof view.status?.state === 'string' ? view.status.state : 'unknown',
    })
  }
  return states
}

function sortedNames(names) {
  return [...names].toSorted((a, b) => b.length - a.length)
}

export function parseMcpToolName(publicName, knownServers = []) {
  if (typeof publicName !== 'string' || !publicName.startsWith(MCP_TOOL_PREFIX)) return null
  for (const server of knownServers) {
    const prefix = `${MCP_TOOL_PREFIX}${server}__`
    if (publicName.startsWith(prefix)) {
      const toolName = publicName.slice(prefix.length)
      if (toolName) return { server, toolName }
    }
  }
  const sep = publicName.indexOf('__', MCP_TOOL_PREFIX.length)
  if (sep <= MCP_TOOL_PREFIX.length) return null
  const server = publicName.slice(MCP_TOOL_PREFIX.length, sep)
  const toolName = publicName.slice(sep + 2)
  if (!SERVER_NAME_RE.test(server) || !toolName) return null
  return { server, toolName }
}

function visibleDefinitions(ctx, caller) {
  const tools = ctx?.get?.('tools')
  if (typeof tools?.definitions !== 'function') return []
  try {
    const defs = tools.definitions(caller)
    return Array.isArray(defs) ? defs : []
  } catch {
    return []
  }
}

export function discoverDshMcpServers(ctx, caller, excludedNames = new Set()) {
  const states = managerServerStates(ctx)
  const knownServers = sortedNames(states.keys())
  const servers = new Set()

  for (const [name, info] of states) {
    if (excludedNames.has(name) || !SERVER_NAME_RE.test(name)) continue
    if (info.configured && ACTIVE_MANAGER_STATES.has(info.state)) servers.add(name)
  }

  for (const definition of visibleDefinitions(ctx, caller)) {
    const parsed = parseMcpToolName(definition?.name, knownServers)
    if (!parsed || excludedNames.has(parsed.server)) continue
    const info = states.get(parsed.server)
    if (info && (!info.configured || BLOCKED_MANAGER_STATES.has(info.state))) continue
    servers.add(parsed.server)
  }

  return [...servers]
}

function normalizeInputSchema(parameters) {
  if (!isPlainObject(parameters)) return { type: 'object', properties: {} }
  if (typeof parameters.type === 'string') return parameters
  return { type: 'object', ...parameters }
}

export function listForwardedMcpTools(ctx, serverName, caller) {
  if (!SERVER_NAME_RE.test(serverName)) return []
  const states = managerServerStates(ctx)
  const info = states.get(serverName)
  if (info && (!info.configured || BLOCKED_MANAGER_STATES.has(info.state))) return []

  const knownServers = sortedNames(new Set([...states.keys(), serverName]))
  const listed = []
  for (const definition of visibleDefinitions(ctx, caller)) {
    const parsed = parseMcpToolName(definition?.name, knownServers)
    if (!parsed || parsed.server !== serverName) continue
    listed.push({
      name: parsed.toolName,
      description: typeof definition.description === 'string' ? definition.description : '',
      inputSchema: normalizeInputSchema(definition.parameters),
    })
  }
  return listed
}

function findForwardedDefinition(ctx, serverName, toolName, caller) {
  const tools = ctx?.get?.('tools')
  const directName = `${MCP_TOOL_PREFIX}${serverName}__${toolName}`
  if (typeof tools?.get === 'function') {
    try {
      const direct = tools.get(directName, caller)
      if (direct) return direct
    } catch {}
  }
  const states = managerServerStates(ctx)
  const knownServers = sortedNames(new Set([...states.keys(), serverName]))
  for (const definition of visibleDefinitions(ctx, caller)) {
    const parsed = parseMcpToolName(definition?.name, knownServers)
    if (parsed && parsed.server === serverName && parsed.toolName === toolName) return definition
  }
  return null
}

function sanitizeMcpContentBlock(block) {
  if (!isPlainObject(block)) {
    return { type: 'text', text: typeof block === 'string' ? block : JSON.stringify(block) }
  }
  if (block.type === 'image' && Object.hasOwn(block, 'attachment')) {
    const { attachment: _attachment, ...rest } = block
    return rest
  }
  return block
}

function formatForwardedToolResult(definition, argsObj, value) {
  if (isPlainObject(value) && Array.isArray(value.content)) {
    const content = value.content.map(sanitizeMcpContentBlock)
    return {
      content,
      ...(value.structuredContent !== undefined ? { structuredContent: value.structuredContent } : {}),
      ...(value.isError === true ? { isError: true } : {}),
    }
  }
  let content = null
  if (typeof definition.output?.render === 'function') {
    try {
      const rendered = definition.output.render(argsObj, value)
      if (Array.isArray(rendered) && rendered.length > 0) {
        content = rendered.map(sanitizeMcpContentBlock)
      }
    } catch {}
  }
  if (!content) {
    const text = typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2)
    content = [{ type: 'text', text }]
  }
  return {
    content,
    ...(isPlainObject(value) ? { structuredContent: value } : {}),
  }
}

export async function callForwardedMcpTool(ctx, serverName, toolName, toolArgs, caller, signal) {
  if (!SERVER_NAME_RE.test(serverName) || typeof toolName !== 'string' || !toolName) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Invalid MCP tool target "${serverName}/${String(toolName)}".` }],
    }
  }
  const states = managerServerStates(ctx)
  const info = states.get(serverName)
  if (info && (!info.configured || BLOCKED_MANAGER_STATES.has(info.state))) {
    return {
      isError: true,
      content: [{ type: 'text', text: `MCP server "${serverName}" is not active.` }],
    }
  }
  const definition = findForwardedDefinition(ctx, serverName, toolName, caller)
  if (!definition || typeof definition.execute !== 'function') {
    return {
      isError: true,
      content: [{ type: 'text', text: `Unknown tool "${toolName}" on MCP server "${serverName}".` }],
    }
  }
  const argsObj = isPlainObject(toolArgs) ? toolArgs : {}
  const callId = `acp_mcp_${randomBytes(8).toString('hex')}`
  const exec = {
    callId,
    rootCallId: callId,
    name: definition.name,
    arguments: argsObj,
    ...(caller ? { agent: caller } : {}),
    signal,
    token: Symbol('acp-mcp-bridge'),
    deferContext() {},
  }
  const tools = ctx?.get?.('tools')
  if (typeof tools?.checkGuards === 'function') {
    const denial = tools.checkGuards(exec)
    if (denial !== undefined) {
      const reason = typeof denial === 'string' ? denial : (denial?.reason ?? 'Tool call denied by DSH policy')
      return {
        isError: true,
        content: [{ type: 'text', text: reason }],
      }
    }
  }
  try {
    const value = await definition.execute(argsObj, exec)
    return formatForwardedToolResult(definition, argsObj, value)
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: error?.message ?? String(error) }],
    }
  }
}

function compactDescription(raw, max = MAX_SUMMARY_DESC_CHARS) {
  if (typeof raw !== 'string') return ''
  const singleLine = raw.replace(/\s+/gu, ' ').trim()
  if (singleLine.length <= max) return singleLine
  return `${singleLine.slice(0, max - 1)}…`
}

function jsonToolResult(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  }
}

function errorToolResult(text) {
  return {
    isError: true,
    content: [{ type: 'text', text }],
  }
}

function parseProxyArguments(raw) {
  if (raw === undefined || raw === null) return { ok: true, value: {} }
  if (isPlainObject(raw)) return { ok: true, value: raw }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return { ok: true, value: {} }
    try {
      const parsed = JSON.parse(trimmed)
      if (isPlainObject(parsed)) return { ok: true, value: parsed }
    } catch {}
  }
  return { ok: false, error: 'arguments must be a JSON object.' }
}

export function proxyMcpToolList(ctx, caller, excludedNames = new Set()) {
  const servers = discoverDshMcpServers(ctx, caller, excludedNames)
  const listed = servers.slice(0, MAX_DESC_SERVERS).join(', ')
  const suffix = servers.length > MAX_DESC_SERVERS ? `, +${servers.length - MAX_DESC_SERVERS} more` : ''
  const listDescription = servers.length
    ? `List or search DSH MCP tools (servers: ${listed}${suffix}).`
    : 'List or search DSH MCP tools.'
  return [
    {
      name: 'list_tools',
      description: listDescription,
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          server: { type: 'string', description: 'MCP server name.' },
          query: { type: 'string', description: 'Filter keywords.' },
          limit: { type: 'integer', description: 'Max items (default 50).' },
        },
      },
    },
    {
      name: 'get_tool_schema',
      description: 'Get input schema for a DSH MCP tool.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          server: { type: 'string' },
          tool: { type: 'string' },
        },
        required: ['server', 'tool'],
      },
    },
    {
      name: 'call_tool',
      description: 'Call a DSH MCP tool by server and name.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          server: { type: 'string' },
          tool: { type: 'string' },
          arguments: { type: 'object' },
        },
        required: ['server', 'tool'],
      },
    },
  ]
}

export async function callProxyMcpTool(ctx, toolName, toolArgs, caller, signal, excludedNames = new Set()) {
  const args = isPlainObject(toolArgs) ? toolArgs : {}
  const availableServers = discoverDshMcpServers(ctx, caller, excludedNames)
  const availableSet = new Set(availableServers)

  if (toolName === 'list_tools') {
    const server = typeof args.server === 'string' ? args.server.trim() : ''
    const query = typeof args.query === 'string' ? args.query.trim() : ''
    const rawLimit = Number(args.limit)
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIST_LIMIT) : DEFAULT_LIST_LIMIT

    if (!server && !query) {
      let totalTools = 0
      const servers = availableServers.map(name => {
        const count = listForwardedMcpTools(ctx, name, caller).length
        totalTools += count
        return { name, toolCount: count }
      })
      return jsonToolResult({
        servers,
        totalTools,
        hint: 'Pass server and/or query to list matching tools, then get_tool_schema and call_tool.',
      })
    }

    if (server && !availableSet.has(server)) {
      return errorToolResult(`Unknown or inactive MCP server "${server}". Available servers: ${availableServers.join(', ') || '(none)'}.`)
    }

    const targetServers = server ? [server] : availableServers
    const terms = query ? query.toLowerCase().split(/\s+/u).filter(Boolean) : []
    const matched = []
    for (const srv of targetServers) {
      for (const item of listForwardedMcpTools(ctx, srv, caller)) {
        if (terms.length) {
          const haystack = `${srv} ${item.name} ${item.description}`.toLowerCase()
          if (!terms.every(term => haystack.includes(term))) continue
        }
        matched.push({
          server: srv,
          name: item.name,
          description: compactDescription(item.description),
        })
      }
    }
    const items = matched.slice(0, limit)
    return jsonToolResult({
      servers: targetServers,
      total: matched.length,
      returned: items.length,
      truncated: matched.length > items.length,
      tools: items,
    })
  }

  if (toolName === 'get_tool_schema') {
    const server = typeof args.server === 'string' ? args.server.trim() : ''
    const targetTool = typeof args.tool === 'string' ? args.tool.trim() : ''
    if (!server || !targetTool) return errorToolResult('Both "server" and "tool" are required.')
    if (!availableSet.has(server)) {
      return errorToolResult(`Unknown or inactive MCP server "${server}". Available servers: ${availableServers.join(', ') || '(none)'}.`)
    }
    const definition = findForwardedDefinition(ctx, server, targetTool, caller)
    if (!definition) {
      const candidates = listForwardedMcpTools(ctx, server, caller)
      const lower = targetTool.toLowerCase()
      const suggestions = candidates
        .map(item => item.name)
        .filter(name => name.toLowerCase().includes(lower) || lower.includes(name.toLowerCase()))
        .slice(0, 8)
      const hint = suggestions.length ? ` Similar tools: ${suggestions.join(', ')}.` : ''
      return errorToolResult(`Unknown tool "${targetTool}" on MCP server "${server}".${hint}`)
    }
    return jsonToolResult({
      server,
      tool: targetTool,
      description: typeof definition.description === 'string' ? definition.description : '',
      inputSchema: normalizeInputSchema(definition.parameters),
    })
  }

  if (toolName === 'call_tool') {
    const server = typeof args.server === 'string' ? args.server.trim() : ''
    const targetTool = typeof args.tool === 'string' ? args.tool.trim() : ''
    if (!server || !targetTool) return errorToolResult('Both "server" and "tool" are required.')
    if (!availableSet.has(server)) {
      return errorToolResult(`Unknown or inactive MCP server "${server}". Available servers: ${availableServers.join(', ') || '(none)'}.`)
    }
    const parsedArgs = parseProxyArguments(args.arguments)
    if (!parsedArgs.ok) return errorToolResult(parsedArgs.error)
    return callForwardedMcpTool(ctx, server, targetTool, parsedArgs.value, caller, signal)
  }

  return errorToolResult(`Unknown dsh_mcp tool "${String(toolName)}". Available: list_tools, get_tool_schema, call_tool.`)
}
