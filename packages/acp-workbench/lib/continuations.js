import { randomUUID } from 'node:crypto'

const COALESCE_QUIET_MS = 2_000
const COALESCE_MAX_MS = 4_000

function isSubagentDelivery(message) {
  const kind = message?.source?.kind
  return kind === 'agent-message' || kind === 'subagent-settled'
}

function messageChars(message) {
  let total = 0
  for (const block of message?.content ?? []) {
    if (block?.type === 'text' && typeof block.text === 'string') total += block.text.length
  }
  return total
}

function contextLabelOf(message) {
  const source = message?.source
  if (!source || typeof source !== 'object') return ''
  if (source.kind === 'agent-instructions' && Array.isArray(source.changes)) {
    const paths = []
    for (const entry of source.changes) {
      if (typeof entry?.path === 'string' && entry.path && !paths.includes(entry.path)) paths.push(entry.path)
    }
    return paths.join(', ').slice(0, 120)
  }
  return ''
}

function parentRelay(agent, message) {
  const { origin, parentSession } = agent.session.header
  return origin === 'subagent' && parentSession && message.source?.kind === 'agent-message'
    && message.source.form === 'relay' && message.source.senderSessionId === parentSession
}

function waitQuietBatch(ctx, native, agent, signal) {
  return new Promise(resolve => {
    let sawMore = false
    let quietTimer = null
    let maxTimer = null
    let done = false

    const finish = () => {
      if (done) return
      done = true
      clearTimeout(quietTimer)
      clearTimeout(maxTimer)
      stopInbox()
      stopSubEnd()
      signal.removeEventListener('abort', onAbort)
      resolve(sawMore)
    }

    const onAbort = () => finish()

    const armQuiet = () => {
      clearTimeout(quietTimer)
      quietTimer = setTimeout(finish, COALESCE_QUIET_MS)
    }

    const stopInbox = ctx.on('agent/inbox/inserted', ({ agent: target, message }) => {
      if (target !== agent) return
      sawMore = true
      if (!isSubagentDelivery(message)) {
        finish()
        return
      }
      if (!native.hasRunningChildren(agent)) {
        finish()
        return
      }
      armQuiet()
    })

    const stopSubEnd = ctx.on('subagent/end', () => {
      if (!native.hasRunningChildren(agent)) {
        clearTimeout(quietTimer)
        quietTimer = setTimeout(finish, 150)
      }
    })

    signal.addEventListener('abort', onAbort, { once: true })
    maxTimer = setTimeout(finish, COALESCE_MAX_MS)
    armQuiet()
  })
}

export function installContinuations(native, isRoute) {
  const { ctx, disposers } = native
  const coalescedIds = new Set()
  const pendingCleanups = new Set()
  disposers.push(() => {
    for (const cleanup of Array.from(pendingCleanups)) cleanup()
    pendingCleanups.clear()
  })

  // external: DSH send_message and subagent settlements target the next step, while an open ACP request only drains output there.
  disposers.push(ctx.on('agent/pre-step', async ({ agent, turn, modelSelection, signal, messages }, next) => {
    const decision = await next()
    if (decision.kind !== 'enter' || !isRoute(modelSelection.provider)) return decision

    const active = native.active.get(agent.id)
    if (active && active.turn === turn && active.provider === modelSelection.provider) {
      const claimed = new Set(messages.filter(isSubagentDelivery).map(message => message.id))
      if (!claimed.size) return decision
      signal.throwIfAborted()
      const current = []
      for (const message of decision.messages) {
        if (claimed.has(message.id)) agent.followup(message)
        else current.push(message)
      }
      return { ...decision, messages: current }
    }

    if (!active && messages.length > 0 && messages.every(isSubagentDelivery) && !messages.some(m => coalescedIds.has(m.id)) && native.hasRunningChildren(agent)) {
      const sawMore = await waitQuietBatch(ctx, native, agent, signal)
      signal.throwIfAborted()
      if (sawMore) {
        const held = messages.slice()
        for (const msg of held) coalescedIds.add(msg.id)
        let stopStatus = () => {}
        let stopDisposed = () => {}
        const releaseHeld = () => {
          pendingCleanups.delete(releaseHeld)
          stopStatus()
          stopDisposed()
          for (const msg of held) coalescedIds.delete(msg.id)
        }
        stopStatus = ctx.on('agent/status', ({ agent: target, status }) => {
          if (target !== agent || status !== 'idle') return
          pendingCleanups.delete(releaseHeld)
          stopStatus()
          stopDisposed()
          queueMicrotask(() => {
            if (native.closing || ctx.agents.get(agent.id) !== agent) {
              for (const msg of held) coalescedIds.delete(msg.id)
              return
            }
            for (const msg of held) agent.followup(msg)
            setTimeout(() => {
              for (const msg of held) coalescedIds.delete(msg.id)
            }, 10_000)
          })
        })
        stopDisposed = ctx.on('agent/disposed', ({ agent: target }) => {
          if (target !== agent) return
          releaseHeld()
        })
        pendingCleanups.add(releaseHeld)
        return { ...decision, messages: [] }
      }
    }

    return decision
  }))

  // external: DSH built-in context plugins (dsh-time-context, dsh-agent-instructions, dsh-tool-skill) append to decision.messages after next(), so prepend runs outermost after all of them.
  disposers.push(ctx.on('agent/pre-step', async ({ agent, turn, modelSelection }, next) => {
    const decision = await next()
    if (decision.kind !== 'enter' || !isRoute(modelSelection.provider)) return decision
    if (!Array.isArray(decision.messages) || decision.messages.length === 0) return decision
    const policy = typeof native.contextPolicyFor === 'function'
      ? native.contextPolicyFor(modelSelection.provider)
      : { agentInstructions: true, timeContext: true, nowledgeContext: true }
    const kept = []
    const dropped = []
    for (const message of decision.messages) {
      const kind = message?.source?.kind
      if (kind === 'skill-catalog') {
        dropped.push({ kind, action: 'dropped', reason: 'host-only', chars: messageChars(message), stage: 'pre-step' })
        continue
      }
      if (kind === 'agent-instructions' && policy.agentInstructions === false) {
        const label = contextLabelOf(message)
        dropped.push({ kind, ...(label ? { label } : {}), action: 'dropped', reason: 'policy-off', chars: messageChars(message), stage: 'pre-step' })
        continue
      }
      if (kind === 'time-context' && policy.timeContext === false) {
        dropped.push({ kind, action: 'dropped', reason: 'policy-off', chars: messageChars(message), stage: 'pre-step' })
        continue
      }
      kept.push(message)
    }
    if (!dropped.length || !kept.length) return decision
    native.noteSuppressedContext?.(agent.id, turn, dropped)
    return { ...decision, messages: kept }
  }, { prepend: true }))

  const receipts = new WeakMap()
  disposers.push(ctx.on('tools/execute', async (exec, next) => {
    if (exec.name !== 'send_message' || !exec.agent) return next()
    const admitted = new Set()
    const stop = ctx.on('agent/inbox/inserted', ({ agent, message }) => {
      if ((parentRelay(agent, message) || (message.source?.kind === 'agent-message' && message.source.senderSessionId === exec.agent.id)) && isRoute(agent.model.current()?.provider)) {
        admitted.add(message.id)
      }
    })
    try {
      const result = await next()
      if (!result.isError && admitted.has(result.value?.messageId)) receipts.set(exec, result.value.messageId)
      return result
    } finally {
      stop()
    }
  }))

  disposers.push(ctx.on('tools/post-execute', async (exec, result, next) => {
    const decision = await next()
    const id = receipts.get(exec)
    if (!id || result.isError || result.value?.messageId !== id || decision.kind !== 'accept' || 'value' in decision || 'content' in decision) return decision
    const content = [{ type: 'text', text: `DSH accepted follow-up ${id} for ACP agent ${exec.arguments.agent}. It will deliver automatically on the target's next turn; wait for its reply instead of polling.` }]
    if (!exec.parent) return { ...decision, content }
    // external: nested DSH tool calls return the core {messageId} value; deferred context reaches the parent model.
    const notice = { id: randomUUID(), role: 'user', source: { kind: 'acp-delivery', form: 'notice', summary: 'ACP follow-up accepted by DSH' }, content }
    return { ...decision, additionalContexts: [...decision.additionalContexts ?? [], notice] }
  }))
}
