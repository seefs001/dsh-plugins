// Some Messages relays intermittently classify a user turn containing only tool
// results as assistant prefill. Retry the rejected HTTP request, not the agent
// step: tools (including ones with side effects) must not run a second time.
const ERROR = 'This model does not support assistant message prefill. The conversation must end with a user message.'

function toolResultReplay(body, modelId) {
  let payload
  try { payload = JSON.parse(body) } catch { return }
  if (payload?.model !== modelId || !Array.isArray(payload?.messages)) return
  const call = payload.messages.at(-2)
  const result = payload.messages.at(-1)
  if (call?.role !== 'assistant' || !Array.isArray(call.content)
    || result?.role !== 'user' || !Array.isArray(result.content)) return
  const pending = new Set(call.content.filter(block => block?.type === 'tool_use').map(block => block.id))
  if (!result.content.every(block => block?.type === 'tool_result'
    && typeof block.tool_use_id === 'string' && pending.delete(block.tool_use_id)) || pending.size) return
  if (!result.content.length) return
  for (const block of result.content) {
    if (typeof block.content === 'string' && block.content.length) {
      block.content = [{ type: 'text', text: block.content }]
    }
  }
  // Relays that overlook a tool-result-only turn need a visible user-side tail.
  // Delimit the results without inventing a user instruction or approval.
  result.content.push({ type: 'text', text: '[End of tool results.]' })
  return JSON.stringify(payload)
}

export function messagesPrefillTransform(request) {
  const { model, options } = request
  if (model?.api !== 'anthropic-messages') return request
  const send = options?.fetch ?? globalThis.fetch
  let retried = false
  return { ...request, options: { ...options, fetch: async (url, init) => {
    const response = await send(url, init)
    if (retried || response.status !== 400 || init?.method !== 'POST' || typeof init.body !== 'string') return response
    const rejection = await response.clone().json().catch(() => null)
    if (typeof rejection?.error?.message !== 'string' || !rejection.error.message.startsWith(ERROR)) return response
    const body = toolResultReplay(init.body, model.id)
    if (body === undefined || init.signal?.aborted) return response
    retried = true
    await response.body?.cancel()
    const headers = new Headers(init.headers)
    headers.delete('content-length')
    return send(url, { ...init, headers, body })
  } } }
}
