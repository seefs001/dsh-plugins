import { createHash } from 'node:crypto'
import { z } from './harness.js'

const pluginName = 'pi-skill-context'
export { pluginName as name }
export const inject = ['systemPrompt', 'sessionProjections']
const section = 'pi-tools:visible-skills'
const prefix = 'Full skill instructions already in this request (reuse without reloading): '
const validName = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
const hash = text => createHash('sha256').update(text).digest('hex')

function instructions(blocks, name) {
  if (!validName(name) || blocks?.length !== 1 || blocks[0].type !== 'text') return
  const text = blocks[0].text
  const marker = '\n<skill_instructions>\n'
  const end = '\n</skill_instructions>\n</skill_content>'
  const start = text.indexOf(marker)
  if (text.startsWith(`<skill_content name="${name}">\n`) && start >= 0 && text.endsWith(end)) {
    return text.slice(start + marker.length, -end.length)
  }
}

// Nested calls are not model input. Only attest a returned text block if it actually
// contains all the instructions of a successful skill call, even after budget/spill.
export function rememberNestedSkill(skills, name, content) {
  const body = instructions(content, name)
  if (body) skills.set(name, body)
}
export function nestedSkillProofs(skills, blocks) {
  const proofs = []
  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'text' || !skills.size) continue
    const names = []
    for (const [name, body] of skills) {
      if (block.text.includes(body) || block.text.includes(JSON.stringify(body))) names.push(name)
    }
    if (names.length) proofs.push({ index, digest: hash(block.text), names })
  }
  return proofs
}

function slashName(message) {
  const { source, content } = message
  if (source?.kind === 'skill-invocation' && source.form === 'instructions' && instructions(content, source.name)) return source.name
}
function directName(args) {
  try { return (typeof args === 'string' ? JSON.parse(args) : args)?.name } catch { return undefined }
}

// Index immutable evidence, not the current roster. A replacement may retain the
// message id and outer tags while discarding the middle of its instructions.
const proofSchema = z.object({ index: z.number(), digest: z.string(), names: z.array(z.string()) })
const indexDefinition = {
  key: 'pi-tools:skill-evidence', stateVersion: 1,
  stateSchema: z.object({ calls: z.record(z.string(), z.string()), proofs: z.record(z.string(), z.array(proofSchema)), lastText: z.string() }),
  init: () => ({ calls: {}, proofs: {}, lastText: '' }),
  apply(state, event) {
    const { type, data } = event
    if (type === 'tool/call' && data.name === 'skill') {
      const name = directName(data.arguments)
      if (validName(name)) return { ...state, calls: { ...state.calls, [data.callId]: name } }
    }
    if (event.surfaceOp !== 'append' || (type !== 'tool/result' && type !== 'user/message')) return state
    const m = type === 'user/message' ? data : data.message
    if (m.source?.kind === 'runtime-context') {
      const text = m.source.sections?.find(s => s.name === section)?.text ?? ''
      return text === state.lastText ? state : { ...state, lastText: text }
    }
    let name, proofs
    if (type === 'user/message') name = slashName(m)
    else {
      const id = m.toolCallId
      if (Object.hasOwn(state.calls, id)) {
        const { [id]: called, ...calls } = state.calls
        state = { ...state, calls }
        if (!m.isError && instructions(m.content, called)) name = called
      } else if (!m.isError) proofs = data.meta?.pi?.visibleSkillProofs
    }
    if (name) proofs = [{ index: 0, digest: hash(m.content[0].text), names: [name] }]
    return proofs?.length ? { ...state, proofs: { ...state.proofs, [m.id]: proofs } } : state
  },
}

export async function apply(ctx) {
  const index = await ctx.sessionProjections.register(indexDefinition)
  const cache = new WeakMap()
  const proposed = new WeakMap()
  const digests = new WeakMap() // Immutable message blocks survive appends; don't rehash old skill bodies.
  ctx.on('agent/pre-step', async ({ agent }, next) => {
    proposed.delete(agent)
    const decision = await next()
    if (decision.kind === 'enter') {
      const slash = decision.messages.map(m => [m.id, slashName(m)]).filter(([, name]) => name)
      if (slash.length) proposed.set(agent, slash)
    }
    return decision
  }, { prepend: true })
  // A change to an unrelated runtime fact may repropose an entire old snapshot.
  // Keep this section out of that pre-step proposal too. The loop refreshes the
  // canonical snapshot after pre-step, so no redacted copy is written to history.
  ctx.on('agent/pre-step', async (_, next) => {
    const decision = await next()
    if (decision.kind !== 'enter') return decision
    let changed = false
    const messages = decision.messages.flatMap(m => {
      if (m.source?.kind !== 'runtime-context') return [m]
      const own = m.source.sections?.find(s => s.name === section)
      if (!own) return [m]
      changed = true
      const sections = m.source.sections.filter(s => s !== own)
      if (!sections.length) return []
      return [{ ...m, source: { ...m.source, sections }, content: m.content.map(b => b.type === 'text'
        ? { ...b, text: b.text.replace(`\n\n${own.text}`, '').replace(`\n${own.text}\n`, '\n') } : b) }]
    })
    return changed ? { ...decision, messages } : decision
  })
  ctx.systemPrompt.context({
    name: section, order: 220, interpolate: false,
    text: ({ scope, toolSet }) => {
      const session = scope?.session
      if (!session) return ''
      const state = index.stateOf(session)
      // Initial assembly is inspected by prompt-recall middleware. Publish no new
      // facts there. DSH refreshes this provider after routing/compaction, directly
      // before admitting messages. The native runtime-context writer deduplicates.
      if (toolSet) return state.lastText
      const generation = session.surface.contentGeneration
      let hit = cache.get(session)
      if (!hit || hit.proofs !== state.proofs || generation !== hit.generation) {
        const names = new Set()
        if (Object.keys(state.proofs).length) {
          for (const m of session.deriveMessages()) {
            if (m.role !== 'user' && m.role !== 'tool') continue
            for (const proof of state.proofs[m.id] ?? []) {
              const block = m.content[proof.index]
              if (block?.type !== 'text') continue
              if (!digests.has(block)) digests.set(block, hash(block.text))
              if (digests.get(block) === proof.digest) {
                for (const n of proof.names) names.add(n)
              }
            }
          }
        }
        cache.set(session, hit = { generation, proofs: state.proofs, names })
      }
      const names = new Set(hit.names)
      for (const [id, name] of proposed.get(scope) ?? []) {
        // On overflow retry these messages were admitted already; a summary is not the original.
        if (!Object.hasOwn(state.proofs, id)) names.add(name)
      }
      return names.size ? prefix + [...names].toSorted().join(', ') : state.lastText ? 'No full skill instructions are currently retained.' : ''
    },
  })
}
