export const name = 'side-chat'

const SIDE_CHAT_PREFIX = 'sc.'
const SIDE_CHAT_GUIDANCE = [
  '## Side Chat Session',
  'This conversation is a Side Chat attached to a main DSH conversation. It shares the same workspace directory but keeps an independent message history.',
  '- Focus on answering the user\'s side question, explaining code or replies, and exploring ideas without disturbing the main conversation.',
  '- Do not modify workspace files or run mutating commands unless the user explicitly asks you to make changes in this side chat.',
].join('\n')

export function isSideChatSession(sessionId) {
  return typeof sessionId === 'string' && sessionId.startsWith(SIDE_CHAT_PREFIX)
}

export function apply(ctx) {
  ctx.get?.('systemPrompt')?.section?.({
    name: 'side-chat:scope',
    order: 70,
    interpolate: false,
    replacement: '',
    retirement: 'This session is no longer constrained by side-chat rules.',
    text: ({ agent, scope }) => {
      const sessionId = (agent ?? scope)?.session?.id
      return isSideChatSession(sessionId) ? SIDE_CHAT_GUIDANCE : ''
    },
  })
}
