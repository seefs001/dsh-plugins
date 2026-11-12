import { createHash } from 'node:crypto'
import { emptyState } from './state.js'
import { prepareArguments, toToolExposure } from './pi.js'

export const INTERNAL_PREFIX = 'pi_internal_'
export const RESOURCE_TOOLS = new Set(['list_mcp_resources', 'list_mcp_resource_templates', 'read_mcp_resource'])
export const OPTION_KEY = 'pi-tools'
const PI_NAMES = new Set(['read', 'bash', 'edit', 'write', 'grep', 'find', 'ls', 'codemode', 'tool_search'])

// Public and script bindings share implementations and the original policy name.
export class PiLoadout {
  constructor(ctx, config, state, definitions) {
    this.ctx = ctx
    this.config = config
    this.state = state
    this.ownNames = new Set(definitions.map(tool => tool.name))
    this.nativeCatalog = definitions.map(({ name, description }) => ({ name, description, group: 'pi' }))
    this.guidelines = new Map(definitions.map(tool => [tool.name, tool.promptGuidelines ?? []]))
    this.outputs = new Map(definitions.map(tool => [tool.name, tool.outputSchema]))
    this.bridges = new Map()
    this.internal = new Map()
    this.namespaces = new WeakMap()
    ctx.on('system-prompt/assemble', async (_assembly, context, next) => {
      const presentation = await next()
      if (context.scope && !context.signal?.aborted && !this.disposed) {
        this.captureNamespaces(context.scope, presentation.sections)
      }
      return presentation
    })
    this.updating = false
    this.disposed = false
    ctx.effect(() => () => {
      this.disposed = true
      this.releaseMask?.()
      for (const record of this.bridges.values()) record.dispose()
      this.bridges.clear()
      this.internal.clear()
    })
    this.sync()
    ctx.on('tools/change', () => this.sync())
    ctx.agentPresets.registerOptions({
      key: OPTION_KEY,
      describe: () => this.catalog(),
      parse: value => this.parseSelection(value),
    })
    ctx.tools.guard(exec => this.enabled(this.internal.get(exec.name) ?? exec.name, exec.agent)
      ? undefined : `Tool is disabled for this Pi session: ${exec.name}`)
  }

  stateOf(agent) {
    return agent?.session ? this.state.stateOf(agent.session) : emptyState()
  }

  enabled(name, agent) {
    const selected = agent?.session ? this.ctx.agentPresets.optionsForSession(agent.session)[OPTION_KEY] : undefined
    if (selected !== undefined) {
      if (!selected || !Array.isArray(selected.tools) || !selected.tools.every(tool => typeof tool === 'string')) {
        throw new Error('Invalid saved Pi tool selection')
      }
      return selected.tools.includes(name)
    }
    return this.ownNames.has(name) || (this.isMcp(name) && this.accepts(name))
  }

  catalog() {
    const tools = [
      ...this.nativeCatalog,
      ...[...this.bridges.values()].map(({ original }) => ({
        name: original.name, description: original.description,
        group: this.isMcp(original.name) ? 'mcp' : 'dsh',
      })).toSorted((a, b) => a.name.localeCompare(b.name)),
    ]
    return { tools, defaults: tools.filter(tool => this.enabled(tool.name)).map(tool => tool.name),
      mcpExposure: this.config.mcpExposure }
  }

  parseSelection(value) {
    if (!value || !Array.isArray(value.tools) || !value.tools.every(name => typeof name === 'string')) {
      throw new Error('Pi tool selection must contain a tools array of tool names')
    }
    const available = new Set(this.catalog().tools.map(tool => tool.name))
    for (const name of value.tools) {
      if (!available.has(name)) throw new Error(`Pi tool is no longer available: ${name}`)
    }
    return { tools: [...new Set(value.tools)].toSorted() }
  }

  serverOf(name) {
    return this.config.mcpServers.find(server => name.startsWith(`mcp__${server}__`))
  }

  isMcp(name) {
    return name.startsWith('mcp__') || RESOURCE_TOOLS.has(name)
  }

  accepts(name) {
    if (PI_NAMES.has(name) || name.startsWith(INTERNAL_PREFIX)) return false
    if (!this.isMcp(name)) return true
    return this.config.mcpExposure !== 'hidden' && this.config.mcpServers.length > 0
      && (this.serverOf(name) !== undefined || RESOURCE_TOOLS.has(name))
  }

  sync() {
    if (this.updating || this.disposed) return
    this.updating = true
    try {
      const globals = this.ctx.tools.definitions()
      const available = new Map(globals.filter(tool => this.accepts(tool.name)
        && this.ctx.tools.executable(tool.name) === tool).map(tool => [tool.name, tool]))
      for (const [name, record] of this.bridges) {
        if (available.get(name) === record.original) continue
        record.dispose()
        this.internal.delete(record.alias)
        this.bridges.delete(name)
      }
      for (const [name, original] of available) {
        if (this.bridges.has(name)) continue
        const alias = INTERNAL_PREFIX + createHash('sha256').update(name).digest('hex').slice(0, 24)
        const execute = async (input, exec) => {
          if (this.ctx.tools.executable(name) !== original) throw new Error(`Tool is no longer available: ${name}`)
          const args = prepareArguments(original, input, exec)
          if (RESOURCE_TOOLS.has(name) && !this.config.mcpServers.includes(args.server)) {
            throw new Error(`MCP server is not enabled in this preset: ${args.server}`)
          }
          return original.execute(args, exec)
        }
        const direct = { ...original, execute }
        const nested = { ...original, name: alias, execute }
        const releaseInternal = this.ctx.tools.register(nested, {
          when: ({ agent }) => this.enabled(name, agent),
        })
        const releaseDirect = this.ctx.tools.register(direct, {
          when: ({ agent }) => this.enabled(name, agent) && (!this.isMcp(name)
            || this.config.mcpExposure === 'direct' || this.stateOf(agent).loaded.includes(name)),
        })
        const record = { alias, original, direct, nested, dispose: () => { releaseDirect(); releaseInternal() } }
        this.bridges.set(name, record)
        this.internal.set(alias, name)
      }
      // An Agent inherits this preset's registrations, so name restrictions
      // would hide its shadows too. Keep conditional shadows and mask only
      // unbridged globals; false conditions never fall through to a global.
      const deny = globals.filter(tool => !this.ownNames.has(tool.name) && !this.bridges.has(tool.name))
        .map(tool => tool.name).toSorted()
      const key = JSON.stringify(deny)
      if (key !== this.maskKey) {
        const next = deny.length ? this.ctx.tools.restrict({ deny }) : undefined
        const previous = this.releaseMask
        this.releaseMask = next
        this.maskKey = key
        previous?.()
      }
    } finally {
      this.updating = false
    }
  }

  nestedDefinition(name, scope, toolSet) {
    if (name.startsWith(INTERNAL_PREFIX) || name === 'codemode' || name === 'tool_search') return undefined
    const record = this.bridges.get(name)
    if (!record) return this.ownNames.has(name) ? this.ctx.tools.executable(name, scope, toolSet) : undefined
    if (this.ctx.tools.executable(name) !== record.original) return undefined
    if (this.ctx.tools.get(name, scope) !== record.direct) return undefined
    return this.ctx.tools.executable(record.alias, scope, toolSet)
  }

  captureNamespaces(scope, sections) {
    const snapshot = new Map()
    for (const server of this.config.mcpServers) {
      const text = sections.find(section => section.name === `mcp:${server}`)?.text.trim()
      if (!text) continue
      const prefix = `### MCP server: ${server}\n\n`
      const instructions = text.startsWith(prefix) ? text.slice(prefix.length) : text
      const description = instructions.split('\n').find(line => line.trim())?.replace(/^#+\s*/, '').trim()
      snapshot.set(server, { description: description || `MCP server ${server}`, instructions })
    }
    this.namespaces.set(scope, snapshot)
  }

  namespace(name, scope) {
    const server = this.serverOf(name)
    return server === undefined ? undefined : {
      name: `mcp__${server}`, aliases: [server], description: `MCP server ${server}`,
      ...scope ? this.namespaces.get(scope)?.get(server) : {},
    }
  }

  exposure(name) {
    return this.isMcp(name) ? toToolExposure(this.config.mcpExposure) : 'direct'
  }

  callable(definitions, scope) {
    const result = new Map()
    for (const definition of definitions) {
      if (definition.name === 'codemode' || definition.name === 'tool_search') continue
      const name = this.internal.get(definition.name) ?? definition.name
      if (this.bridges.has(name) && !this.internal.has(definition.name)) continue
      if (!this.bridges.has(name) && !this.ownNames.has(name)) continue
      const structured = this.bridges.has(name) ? definition.output.schema : this.outputs.get(name)
      result.set(name, {
        name, description: definition.description, parameters: definition.parameters,
        ...(structured ? { outputSchema: structured } : {}),
        namespace: this.namespace(name, scope),
        exposure: this.exposure(name),
      })
    }
    return [...result.values()]
  }
}
