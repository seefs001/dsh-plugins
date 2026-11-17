/** Host persistence, actual-load counters, and shared UI/tool pin operations. */
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { DOMAIN_SPEC, InputError, explicitSkill, isSkillName, loadedSkill, recordUse, setPinned } from './state.js'

const DESCRIPTIONS_PATH = join(homedir(), '.agents', 'skills', 'short-descriptions.zh.json')

async function readDescriptions() {
  try {
    const descriptions = JSON.parse(await readFile(DESCRIPTIONS_PATH, 'utf8'))
    if (!descriptions || typeof descriptions !== 'object' || Array.isArray(descriptions)
      || Object.entries(descriptions).some(([key, value]) => !isSkillName(key) || typeof value !== 'string' || !value.trim())) {
      throw new Error('Expected skill names mapped to nonempty Chinese descriptions')
    }
    return { descriptions, descriptionsAvailable: true }
  } catch {
    // Optional display data must not disable pins or make a committed pin look failed.
    return { descriptions: {}, descriptionsAvailable: false }
  }
}

export const name = 'cheat-sheet'
export const inject = ['storageDomain', 'webServer', 'connection', 'tools']

function sendJson(res, status, value, headers = {}) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  for (const [key, headerValue] of Object.entries(headers)) res.setHeader(key, headerValue)
  res.end(JSON.stringify(value))
}

async function readOp(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > 8192) throw new InputError('Request body is too large')
    chunks.push(chunk)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new InputError('Invalid JSON') }
}

export async function apply(ctx) {
  const domain = await ctx.storageDomain.open(DOMAIN_SPEC)
  // Reading the old state and committing the next must share one queue:
  // concurrent browser pins and tool observations must not overwrite each other.
  let tail = Promise.resolve()
  const write = change => {
    const result = tail.then(async () => {
      const current = domain.global.get()
      const next = change(current)
      if (next !== current) await domain.global.set(next)
      return domain.global.get()
    })
    tail = result.catch(() => {})
    return result
  }
  ctx.effect(() => async () => {
    await tail
    await domain.close()
  }, 'cheat-sheet: storage')

  // One operation implementation for both HTTP and agent tool callers.
  const operate = async op => {
    if (op?.action === 'state') {
      await tail
      return domain.global.get()
    }
    if (op?.action === 'pin') return write(state => setPinned(state, op.name, op.pinned))
    throw new InputError('action must be state or pin')
  }
  const observe = skillName => {
    if (skillName === undefined) return
    write(state => recordUse(state, skillName)).catch(error => {
      ctx.logger.warn(`cheat-sheet: could not save skill usage: ${error.message}`)
    })
  }
  // Constant-time live observations only. No session scans, replay, text matching,
  // catalog reads, or copy clicks count as invocations.
  ctx.on('session/event', (_session, event) => { observe(explicitSkill(event)) })
  ctx.on('tools/result', (exec, result) => { observe(loadedSkill(exec, result)) })

  const register = (path, method, read) => {
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact', path,
      async handler(req, res) {
        const rejection = ctx.connection.requestRejection(req)
        if (rejection !== undefined) {
          sendJson(res, rejection, { message: 'Connection is not authorized' })
          return
        }
        if (req.method !== method) {
          sendJson(res, 405, { message: 'Method not allowed' }, { allow: method })
          return
        }
        try {
          const state = await operate(await read(req))
          sendJson(res, 200, { ...state, ...await readDescriptions() })
        } catch (error) {
          sendJson(res, error instanceof InputError ? 400 : 500, { message: error.message })
        }
      },
    }), `cheat-sheet: ${path}`)
  }
  register('/cheat-sheet/state', 'GET', () => ({ action: 'state' }))
  register('/cheat-sheet/op', 'POST', readOp)

  ctx.tools.register({
    name: 'cheat_sheet',
    description: 'Read the Skill cheat sheet pins and observed skill-load counts, or pin/unpin a skill by name. Pins and counts are shared by this Host across sessions. Counts include successful explicit /name loads and successful native skill tool calls observed since this plugin was enabled; past sessions are not scanned. Pinning never invokes a skill. Counts cannot be edited.',
    parameters: {
      type: 'object', additionalProperties: false,
      properties: {
        action: { type: 'string', enum: ['state', 'pin'], description: 'state reads preferences and counts; pin sets the pinned state.' },
        name: { type: 'string', description: 'Skill name without the leading slash. Required for pin.' },
        pinned: { type: 'boolean', description: 'true to pin, false to unpin. Required for pin.' },
      },
      required: ['action'],
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          pinned: { type: 'array', items: { type: 'string' } },
          counts: { type: 'object', additionalProperties: true },
        },
        required: ['pinned', 'counts'],
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    execute: args => operate(args),
    isConcurrencySafe: args => args.action === 'state',
  })
}
