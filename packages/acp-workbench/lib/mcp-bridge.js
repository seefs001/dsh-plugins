import { randomBytes } from 'node:crypto'

const MCP_TOOL_PREFIX = 'mcp__'
const SERVER_NAME_RE = /^[A-Za-z0-9_-]{1,32}$/u
const ACTIVE_MANAGER_STATES = new Set(['connected', 'connecting', 'reconnecting'])
const BLOCKED_MANAGER_STATES = new Set(['disabled', 'closed', 'failed', 'waiting-credentials', 'waiting-authorization'])

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
