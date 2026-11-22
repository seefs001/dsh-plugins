import { randomUUID } from 'node:crypto'

function parentRelay(agent, message) {
  const { origin, parentSession } = agent.session.header
  return origin === 'subagent' && parentSession && message.source?.kind === 'agent-message'
    && message.source.form === 'relay' && message.source.senderSessionId === parentSession
}

export function installContinuations(native, isRoute) {
  const { ctx, disposers } = native

  // external: DSH send_message targets the next step, but an open ACP request only drains output there.
  disposers.push(ctx.on('agent/pre-step', async ({ agent, turn, modelSelection, signal, messages }, next) => {
    const decision = await next()
    const active = native.active.get(agent.id)
    if (decision.kind !== 'enter' || !active || active.turn !== turn || active.provider !== modelSelection.provider) return decision
    const claimed = new Set(messages.filter(message => parentRelay(agent, message)).map(message => message.id))
    if (!claimed.size) return decision
    signal.throwIfAborted()
    const current = []
    for (const message of decision.messages) {
      if (claimed.has(message.id)) agent.followup(message)
      else current.push(message)
    }
    return { ...decision, messages: current }
  }))

  const receipts = new WeakMap()
  disposers.push(ctx.on('tools/execute', async (exec, next) => {
    if (exec.name !== 'send_message' || !exec.agent) return next()
    const admitted = new Set()
    const stop = ctx.on('agent/inbox/inserted', ({ agent, message }) => {
      if (agent.session.header.parentSession === exec.agent.id && parentRelay(agent, message) && isRoute(agent.model.current()?.provider)) {
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
    const content = [{ type: 'text', text: `DSH accepted follow-up ${id} for ACP child ${exec.arguments.agent}. It is input for a new ACP prompt, not live steering or confirmation the CLI has read it. Wait for the child's reply.` }]
    if (!exec.parent) return { ...decision, content }
    // external: nested DSH tool calls return the core {messageId} value; deferred context reaches the parent model.
    const notice = { id: randomUUID(), role: 'user', source: { kind: 'acp-delivery', form: 'notice', summary: 'ACP follow-up accepted by DSH' }, content }
    return { ...decision, additionalContexts: [...decision.additionalContexts ?? [], notice] }
  }))
}
