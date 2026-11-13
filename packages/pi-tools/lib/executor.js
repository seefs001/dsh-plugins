import { ToolExecutionPipeline, ToolNotFoundError, executeToolBatch, projectToolSchema } from './harness.js'
import { createCodemodeToolDefinition, createToolSearchToolDefinition, invoke } from './pi.js'
import { INTERNAL_PREFIX } from './loadout.js'
import { withCodemodeSyntaxGuidance } from './codemode-syntax.js'

// A read/write barrier for a script's calls. Read-only calls may overlap, while
// mutations and unknown classifiers run alone. Started calls drain on abort.
class NestedCalls {
  constructor(pipeline, parent, maxParallel, structuredResult) {
    this.pipeline = pipeline
    this.structuredResult = structuredResult
    this.parent = parent
    this.maxParallel = maxParallel
    this.queue = []
    this.running = new Set()
    this.exclusive = false
    this.nextId = 0
    this.prepareLane = Promise.resolve()
    this.commitLane = Promise.resolve()
  }

  call(name, args, options = {}) {
    const input = {
      name, arguments: args,
      callId: `${this.parent.callId}/${++this.nextId}`,
      rootCallId: this.parent.rootCallId,
      parent: this.parent.token,
      agent: this.parent.agent,
      toolSet: this.parent.toolSet,
      signal: options.signal ? AbortSignal.any([this.parent.signal, options.signal]) : this.parent.signal,
    }
    const pending = Promise.withResolvers()
    this.queue.push({ input, ...pending })
    this.pump()
    return pending.promise
  }

  pump() {
    while (this.queue.length && !this.exclusive && this.running.size < this.maxParallel) {
      const next = this.queue[0]
      const parallel = this.pipeline.executionMode(next.input).kind === 'parallel'
      if (!parallel && this.running.size) break
      this.queue.shift()
      this.exclusive = !parallel
      const task = this.execute(next.input)
      this.running.add(task)
      void task.then(next.resolve, next.reject).finally(() => {
        this.running.delete(task)
        this.exclusive = false
        this.pump()
      })
      if (!parallel) break
    }
  }

  async execute(input) {
    const previousCommit = this.commitLane
    const committed = Promise.withResolvers()
    this.commitLane = committed.promise
    const preparation = this.prepareLane.then(() => this.pipeline.prepare(input))
    this.prepareLane = preparation.then(() => {}, () => {})
    try {
      const prepared = await preparation
      const dispatched = prepared.kind === 'dispatch' ? await this.pipeline.dispatch(prepared.exec) : prepared
      await previousCommit
      const result = await this.pipeline.complete(prepared.exec, dispatched)
      for (const context of result.additionalContexts ?? []) this.parent.deferContext(context)
      if (result.concludesTurn) this.parent.concludeTurn()
      const structuredContent = this.structuredResult(prepared.exec, result)
      return {
        toolCall: { id: input.callId, name: input.name, arguments: input.arguments },
        isError: result.isError,
        result: {
          content: result.content,
          ...structuredContent !== undefined ? { structuredContent } : {},
        },
      }
    } finally {
      await previousCommit
      committed.resolve()
    }
  }

  async drain() {
    while (this.running.size || this.queue.length) await Promise.allSettled(this.running)
  }
}

export class PiExecutor {
  constructor(ctx, config, loadout) {
    this.ctx = ctx
    this.config = config
    this.loadout = loadout
    this.active = new Set()
    this.structuredErrors = new WeakMap()
    this.disposed = false
    this.pipeline = new ToolExecutionPipeline(ctx, {
      get: (name, scope, toolSet) => !name.startsWith(INTERNAL_PREFIX)
        && (loadout.ownNames.has(name) || loadout.bridges.has(name))
        ? ctx.tools.executable(name, scope, toolSet) : undefined,
    })
    this.nestedPipeline = new ToolExecutionPipeline(ctx, {
      get: (name, scope, toolSet) => loadout.nestedDefinition(name, scope, toolSet),
      reject: name => name === 'codemode' || name === 'tool_search'
        ? new ToolNotFoundError(name, 'This tool is only callable directly by the model') : undefined,
    })
    ctx.on('session/event', (session, event) => {
      if (event.type !== 'sandbox/mode') return
      for (const call of this.active) {
        if (call.session === session && event.data.mode !== call.mode) call.controller.abort(new Error('sandbox mode changed'))
      }
    }, { global: true })
    ctx.effect(() => async () => {
      this.disposed = true
      const calls = [...this.active]
      for (const call of calls) call.controller.abort(new Error('Pi executor disposed'))
      await Promise.allSettled(calls.map(call => call.done))
    })
  }

  describe(definitions) {
    const callable = this.loadout.callable(definitions)
    const visible = definitions.filter(tool => !tool.name.startsWith(INTERNAL_PREFIX)
      && (this.loadout.ownNames.has(tool.name) || this.loadout.bridges.has(tool.name)))
    const scriptTools = new Map(callable.map(tool => [tool.name, tool]))
    const prepared = this.config.codemode ? createCodemodeToolDefinition({ models: false }).prepareLoadout({
      callable,
      declared: visible.map(tool => scriptTools.get(tool.name) ?? tool),
      getExposure: name => this.loadout.exposure(name),
      getNamespace: name => this.loadout.namespace(name),
      getPromptGuidelines: name => this.loadout.guidelines.get(name) ?? [],
    }) : { descriptions: {} }
    return {
      schemas: visible.map(tool => {
        const description = prepared.descriptions[tool.name] ?? tool.description
        return {
          ...projectToolSchema(tool, false),
          description,
        }
      }),
      knownNames: [...new Set([...visible.map(tool => tool.name), ...callable.map(tool => tool.name)])],
    }
  }

  execute(input) {
    return executeToolBatch(input, this.pipeline, () => this.config.maxParallel)
  }

  rememberStructuredError(exec, result) {
    this.structuredErrors.set(exec.token, result)
  }

  structuredResult(exec, result) {
    if (!result.isError) return this.loadout.bridges.has(exec.name) ? result.value : result.value.structuredContent
    const authored = this.structuredErrors.get(exec.token)
    this.structuredErrors.delete(exec.token)
    // A rejected/cancelled or policy-rewritten result must not recover hidden
    // bytes through this Pi-only error-value bridge.
    if (!authored || exec.signal.aborted || result.error?.info || authored.message !== result.error?.message
      || JSON.stringify(authored.content) !== JSON.stringify(result.content)) return undefined
    return authored.value
  }

  async codemode(args, exec) {
    if (this.disposed) throw new Error('Pi executor disposed')
    const controller = new AbortController()
    const done = Promise.withResolvers()
    const call = {
      controller, done: done.promise, session: exec.agent?.session,
      mode: this.ctx.sandboxPolicy.resolve({ session: exec.agent?.session }).mode,
    }
    this.active.add(call)
    const current = { ...exec, signal: AbortSignal.any([exec.signal, controller.signal]) }
    const nested = new NestedCalls(this.nestedPipeline, current, this.config.maxParallel,
      (execution, result) => this.structuredResult(execution, result))
    let writes
    const definition = createCodemodeToolDefinition({
      getToolNamespace: name => this.loadout.namespace(name, exec.agent),
      getToolGuidelines: () => this.loadout.guidelines,
      models: false,
      appendEntry: (_type, value) => { writes = value },
    })
    const store = this.loadout.stateOf(exec.agent).store
    const context = {
      tools: this.loadout.callable(this.ctx.tools.definitions(exec.agent, exec.toolSet), exec.agent),
      executeTool: (name, input, options) => nested.call(name, input, options),
      sessionManager: { getBranch: () => [{ type: 'custom', customType: 'codemode-store', data: { set: store, delete: [] } }] },
    }
    try {
      const native = await invoke(definition, args, current, context)
      const result = withCodemodeSyntaxGuidance(native, nested.nextId, current.signal)
      return { ...result, ...writes && !result.isError ? { state: { version: 1, kind: 'store', writes } } : {} }
    } finally {
      controller.abort(new Error('Script completed'))
      await nested.drain()
      this.active.delete(call)
      done.resolve()
    }
  }

  async search(args, exec) {
    const definitions = this.ctx.tools.definitions(exec.agent, exec.toolSet)
    const callable = this.loadout.callable(definitions, exec.agent)
    const active = definitions.filter(tool => !tool.name.startsWith(INTERNAL_PREFIX)).map(tool => tool.name)
    const definition = createToolSearchToolDefinition({ tools: {
      getAllTools: () => callable,
      getActiveTools: () => active,
      // The original implementation requests activation here. Durable activation
      // happens only when its successful result is committed by the outer batch.
      setActiveTools: () => {},
    } })
    const result = await invoke(definition, args, exec)
    return { ...result, state: { version: 1, kind: 'loaded', names: result.details.loaded } }
  }
}
