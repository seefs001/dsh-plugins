import { createHash } from 'node:crypto'
import { emptyState } from './state.js'
import { prepareArguments, toToolExposure } from './pi.js'
import { scopeOf, scopeChainOf } from './harness.js'

export const INTERNAL_PREFIX = 'pi_internal_'
export const RESOURCE_TOOLS = new Set(['list_mcp_resources', 'list_mcp_resource_templates', 'read_mcp_resource'])
export const OPTION_KEY = 'pi-tools'
const PI_NAMES = new Set(['read', 'bash', 'edit', 'write', 'grep', 'find', 'ls', 'codemode', 'tool_search'])

// Public and script bindings share implementations and the original policy name.
export class PiLoadout {
  constructor(ctx, config, state, definitions) {
    this.ctx = ctx
    this.config = config
    this.scope = scopeOf(ctx)
    this.scopedNames = new Set(config.scopedTools)
    this.globalNames = new Set(config.globalTools)
    if ((this.scopedNames.size || this.globalNames.size) && this.scope === undefined) throw new Error('Pi scoped tools require a preset scope')
    for (const name of [...this.scopedNames, ...this.globalNames]) {
      if (PI_NAMES.has(name) || name.startsWith(INTERNAL_PREFIX) || this.isMcp(name)) {
        throw new Error(`Pi native tool lists must name native DSH tools, not Pi or MCP tools: ${name}`)
      }
    }
    this.agentBindings = new Map()
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
      for (const record of this.bridges.values()) record.dispose?.()
      this.bridges.clear()
      this.internal.clear()
      for (const agent of this.agentBindings.keys()) this.releaseAgent(agent)
    })
    if (this.scopedNames.size || this.globalNames.size) {
      ctx.on('agent/created', ({ agent }) => { this.bindAgent(agent); this.sync() })
      ctx.on('agent/disposed', ({ agent }) => this.releaseAgent(agent))
      ctx.on('session/event', (_session, event) => {
        if (event.type === 'agent-preset/options' || event.type === 'agent-preset/selected') this.sync()
      }, { global: true })
    }
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
    return this.ownNames.has(name) || this.bridges.get(name)?.sourceScope !== undefined || this.bridges.get(name)?.passthrough === true
      || (this.isMcp(name) && this.accepts(name))
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
      for (const agent of this.agentBindings.keys()) {
        if (!this.contains(agent)) this.releaseAgent(agent)
      }
      const globals = this.ctx.tools.definitions()
      // Reserve scoped names even before their provider arrives. A global
      // shadow at this scope would collide with the native plugin's registration.
      const available = new Map(globals.filter(tool => this.accepts(tool.name) && !this.scopedNames.has(tool.name)
        && (this.globalNames.has(tool.name) || this.ctx.tools.executable(tool.name) === tool))
        .map(tool => [tool.name, { original: tool, passthrough: this.globalNames.has(tool.name) }]))
      for (const name of this.scopedNames) {
        const original = this.ctx.tools.get(name, this.scope)
        if (original && this.ctx.tools.get(name) !== original) available.set(name, { original, sourceScope: this.scope, passthrough: true })
      }
      for (const [name, record] of this.bridges) {
        const current = available.get(name)
        if (current?.original === record.original && current.sourceScope === record.sourceScope && current.passthrough === record.passthrough) continue
        record.dispose?.()
        this.internal.delete(record.alias)
        this.bridges.delete(name)
      }
      for (const [name, { original, sourceScope, passthrough }] of available) {
        if (this.bridges.has(name)) continue
        if (passthrough) {
          // Keep native registrations and their step-time conditions. A disabled
          // scoped tool gets a false shadow, never an unconditional script alias.
          const record = { original, direct: original, sourceScope, passthrough,
            dispose: () => this.releaseScopedBindings(name) }
          this.bridges.set(name, record)
          continue
        }
        const alias = INTERNAL_PREFIX + createHash('sha256').update(name).digest('hex').slice(0, 24)
        const execute = async (input, exec) => {
          if (this.ctx.tools.executable(name, sourceScope) !== original) throw new Error(`Tool is no longer available: ${name}`)
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
        const record = { alias, original, sourceScope, passthrough, direct, nested, dispose: () => { releaseDirect(); releaseInternal() } }
        this.bridges.set(name, record)
        this.internal.set(alias, name)
      }
      if (this.scopedNames.size || this.globalNames.size) {
        for (const agent of this.ctx.get('agents')?.list() ?? []) this.bindAgent(agent)
        for (const agent of this.agentBindings.keys()) this.syncAgentMask(agent)
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

  contains(agent) {
    return this.scope !== undefined && scopeChainOf(scopeOf(agent.ctx)).includes(this.scope)
  }

  bindAgent(agent) {
    if (this.disposed || this.agentBindings.has(agent) || !this.contains(agent)) return
    this.agentBindings.set(agent, { bindings: new Map() })
    for (const record of this.bridges.values()) {
      if (record.sourceScope !== undefined) this.bindScopedTool(agent, record)
    }
  }

  bindScopedTool(agent, record) {
    const name = record.original.name
    const bindings = this.agentBindings.get(agent).bindings
    const previous = bindings.get(name)
    if (this.enabled(name, agent)) {
      bindings.delete(name)
      previous?.()
    } else if (!previous) {
      bindings.set(name, agent.ctx.tools.register(record.direct, { when: () => false }))
    }
  }

  releaseScopedBindings(name) {
    for (const { bindings } of this.agentBindings.values()) {
      const dispose = bindings.get(name)
      bindings.delete(name)
      dispose?.()
    }
  }

  syncAgentMask(agent) {
    const record = this.agentBindings.get(agent)
    for (const bridge of this.bridges.values()) {
      if (bridge.sourceScope !== undefined) this.bindScopedTool(agent, bridge)
    }
    const deny = [...this.bridges].filter(([name, bridge]) => bridge.passthrough && bridge.sourceScope === undefined && !this.enabled(name, agent))
      .map(([name]) => name).toSorted()
    const key = JSON.stringify(deny)
    if (record.maskKey === key) return
    const next = deny.length ? agent.ctx.tools.restrict({ deny }) : undefined
    const previous = record.releaseMask
    record.releaseMask = next
    record.maskKey = key
    previous?.()
  }

  releaseAgent(agent) {
    const record = this.agentBindings.get(agent)
    if (!record) return
    this.agentBindings.delete(agent)
    for (const dispose of record.bindings.values()) dispose()
    record.releaseMask?.()
  }

  delegationPrompt(scope) {
    if (!['subagent', 'subagent_fork'].some(name => this.bridges.get(name)?.sourceScope !== undefined && this.enabled(name, scope))) return ''
    return '\n\nDSH subagent creation returns an activation name, not the completed result. Start independent children together and continue independent work while they run. When only waiting remains, end the turn so DSH can deliver completion notices; do not poll or keep a codemode script running while waiting. Collect required child results before the final answer. Coordinate concurrent file edits explicitly, then review the final diff and run relevant checks. Use only the selected delegation and control tools.'
  }

  nestedDefinition(name, scope, toolSet) {
    if (name.startsWith(INTERNAL_PREFIX) || name === 'codemode' || name === 'tool_search') return undefined
    const record = this.bridges.get(name)
    if (!record) return this.ownNames.has(name) ? this.ctx.tools.executable(name, scope, toolSet) : undefined
    if (record.passthrough) {
      if (this.ctx.tools.get(name, record.sourceScope) !== record.original) return undefined
      return this.ctx.tools.executable(name, scope, toolSet) === record.original ? record.original : undefined
    }
    if (this.ctx.tools.executable(name, record.sourceScope) !== record.original) return undefined
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
      if (this.bridges.has(name) && !this.bridges.get(name).passthrough && !this.internal.has(definition.name)) continue
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
