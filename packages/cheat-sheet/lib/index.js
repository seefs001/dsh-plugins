import { readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { DOMAIN_SPEC, InputError, explicitSkill, isSkillName, loadedSkill, recordUse, setPinned } from './state.js'

const DESCRIPTIONS_PATH = join(homedir(), '.agents', 'skills', 'short-descriptions.zh.json')
const OBSERVE_FLUSH_DEBOUNCE_MS = 500
let descriptionsCache = null

async function readDescriptions() {
  try {
    const info = await stat(DESCRIPTIONS_PATH)
    const stamp = `${info.mtimeMs}:${info.size}`
    if (descriptionsCache && descriptionsCache.stamp === stamp) return descriptionsCache.value
    const descriptions = JSON.parse(await readFile(DESCRIPTIONS_PATH, 'utf8'))
    if (!descriptions || typeof descriptions !== 'object' || Array.isArray(descriptions)
      || Object.entries(descriptions).some(([key, value]) => !isSkillName(key) || typeof value !== 'string' || !value.trim())) {
      throw new Error('Expected skill names mapped to nonempty Chinese descriptions')
    }
    const value = { descriptions, descriptionsAvailable: true }
    descriptionsCache = { stamp, value }
    return value
  } catch {
    descriptionsCache = null
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

// external: DSH reload can overlap storageDomain close and open
async function openDomain(ctx) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ctx.storageDomain.open(DOMAIN_SPEC)
    } catch (error) {
      if (error?.code !== 'already-open' || attempt >= 20) throw error
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
}

export async function apply(ctx) {
  const domain = await openDomain(ctx)
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
  const pendingUses = []
  let observeTimer = null
  const flushUses = () => {
    if (observeTimer !== null) {
      clearTimeout(observeTimer)
      observeTimer = null
    }
    if (pendingUses.length === 0) return tail
    const batch = pendingUses.splice(0, pendingUses.length)
    return write(state => batch.reduce((acc, skillName) => recordUse(acc, skillName), state))
  }
  ctx.effect(() => async () => {
    await flushUses().catch(() => {})
    await tail
    await domain.close()
  }, 'cheat-sheet: storage')

  const operate = async op => {
    if (op?.action === 'state') {
      await flushUses()
      return domain.global.get()
    }
    if (op?.action === 'pin') {
      await flushUses()
      return write(state => setPinned(state, op.name, op.pinned))
    }
    throw new InputError('action must be state or pin')
  }
  const observe = skillName => {
    if (skillName === undefined) return
    pendingUses.push(skillName)
    if (observeTimer === null) {
      observeTimer = setTimeout(() => {
        observeTimer = null
        flushUses().catch(error => {
          ctx.logger.warn(`cheat-sheet: could not save skill usage: ${error.message}`)
        })
      }, OBSERVE_FLUSH_DEBOUNCE_MS)
      observeTimer.unref?.()
    }
  }
  ctx.on('session/event', (_session, event) => { observe(explicitSkill(event)) })
  ctx.on('tools/result', (exec, result) => { observe(loadedSkill(exec, result)) })

  const register = (path, method, read) => {
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact', path,
      async handler(req, res, peer) {
        if (peer?.principal?.kind !== 'owner') {
          sendJson(res, peer === undefined ? 401 : 403, { message: 'Connection is not authorized' })
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
    description: 'Read Skill cheat sheet pins and usage counts, or pin/unpin a skill by name. Shared across sessions on this Host. Counts are read-only and track live /name and native skill tool loads.',
    parameters: {
      type: 'object', additionalProperties: false,
      properties: {
        action: { type: 'string', enum: ['state', 'pin'], description: 'state reads pins and counts; pin toggles a skill.' },
        name: { type: 'string', description: 'Skill name without leading slash (required for pin).' },
        pinned: { type: 'boolean', description: 'true to pin, false to unpin (required for pin).' },
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
