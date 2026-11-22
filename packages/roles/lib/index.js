import { BUILTIN_ROLES } from './builtin.js'

export const name = 'roles'
export const inject = ['storageDomain', 'webServer', 'connection', 'systemPrompt']

export const STATE_PATH = '/roles/state'
export const OP_PATH = '/roles/op'
export const EVENTS_PATH = '/roles/events'
export const TOOL_NAME = 'roles'
export const PROVIDER_NAME = 'dsh-roles'
export const ACTIONS = ['list', 'get', 'catalog', 'preview', 'create', 'update', 'duplicate', 'delete', 'move', 'select', 'reset', 'restore_builtins']

const MAX_BODY_BYTES = 1024 * 1024
const MAX_ROLES = 100
const MAX_SKILLS = 20
const MAX_SESSIONS = 2000
const LIMITS = { name: 60, icon: 8, description: 300, prompt: 40_000, skillDescription: 500, whenToUse: 500, skillContent: 60_000 }
const HEARTBEAT_MS = 25_000
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ROLE_ID = /^[a-z0-9][a-z0-9_-]{0,63}$/
const SKILL_RANK = 250

export class OpError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpError'
  }
}

const str = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
const isSessionId = v => typeof v === 'string' && v.length > 0 && v.length <= 200

function normalizeSkill(raw) {
  if (raw === null || typeof raw !== 'object') return undefined
  const skillName = str(raw.name, 64)
  const description = str(raw.description, LIMITS.skillDescription)
  if (!SKILL_NAME.test(skillName) || !description) return undefined
  const whenToUse = str(raw.whenToUse, LIMITS.whenToUse)
  const content = typeof raw.content === 'string' ? raw.content.slice(0, LIMITS.skillContent) : ''
  return { name: skillName, description, ...(whenToUse ? { whenToUse } : {}), content }
}

function normalizeRole(raw) {
  if (raw === null || typeof raw !== 'object' || typeof raw.id !== 'string' || !ROLE_ID.test(raw.id)) return undefined
  const seen = new Set()
  const skills = []
  for (const s of Array.isArray(raw.skills) ? raw.skills : []) {
    const skill = normalizeSkill(s)
    if (skill && !seen.has(skill.name) && skills.length < MAX_SKILLS) { seen.add(skill.name); skills.push(skill) }
  }
  return {
    id: raw.id,
    name: str(raw.name, LIMITS.name) || 'Role',
    icon: str(raw.icon, LIMITS.icon),
    description: str(raw.description, LIMITS.description),
    prompt: typeof raw.prompt === 'string' ? raw.prompt.slice(0, LIMITS.prompt) : '',
    skills,
    localSkills: [...new Set((Array.isArray(raw.localSkills) ? raw.localSkills : [])
      .filter(n => typeof n === 'string' && n.length <= 64 && SKILL_NAME.test(n)))].slice(0, MAX_SKILLS),
    ...(typeof raw.builtin === 'string' && raw.builtin ? { builtin: raw.builtin } : {}),
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0,
  }
}

export function normalizeLibrary(raw) {
  if (raw === null || typeof raw !== 'object' || !Array.isArray(raw.roles)) {
    throw new TypeError('roles state must be an object with a roles array')
  }
  const seen = new Set()
  const roles = []
  for (const r of raw.roles) {
    const role = normalizeRole(r)
    if (role && !seen.has(role.id)) { seen.add(role.id); roles.push(role) }
  }
  return { version: 1, roles }
}

export function normalizeSelection(raw) {
  if (raw === null || typeof raw !== 'object' || typeof raw.roleId !== 'string' || !ROLE_ID.test(raw.roleId)) {
    throw new TypeError('session role must be { roleId, at }')
  }
  return { roleId: raw.roleId, at: Number.isFinite(raw.at) ? raw.at : 0 }
}

const schemaOf = parse => ({
  parse,
  safeParse(value) {
    try { return { success: true, data: parse(value) } } catch (error) { return { success: false, error } }
  },
})

const builtinRole = (b, now = 0) => normalizeRole({ ...b, id: b.builtin, updatedAt: now })

export const DOMAIN_SPEC = {
  name: 'roles',
  version: 1,
  global: { schema: schemaOf(normalizeLibrary), initial: { version: 1, roles: BUILTIN_ROLES.map(b => builtinRole(b)) } },
  tables: { sessions: { valueSchema: schemaOf(normalizeSelection) } },
}

const newRoleId = () => `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function parseDraft(draft, base = {}) {
  if (draft === null || typeof draft !== 'object') throw new OpError('role must be an object')
  const merged = { ...base, ...draft }
  const roleName = str(merged.name, LIMITS.name)
  if (!roleName) throw new OpError('role name must be a non-empty string')
  if (typeof merged.prompt !== 'string' || !merged.prompt.trim()) throw new OpError('role prompt must be a non-empty string')
  if (merged.prompt.length > LIMITS.prompt) throw new OpError(`role prompt exceeds ${LIMITS.prompt} characters`)
  const rawSkills = merged.skills ?? []
  if (!Array.isArray(rawSkills)) throw new OpError('skills must be an array')
  if (rawSkills.length > MAX_SKILLS) throw new OpError(`a role has at most ${MAX_SKILLS} skills`)
  const names = new Set()
  const skills = rawSkills.map((s, i) => {
    const label = `skills[${i}]`
    if (s === null || typeof s !== 'object') throw new OpError(`${label} must be an object`)
    const skillName = typeof s.name === 'string' ? s.name.trim() : ''
    if (!SKILL_NAME.test(skillName) || skillName.length > 64) throw new OpError(`${label}.name "${skillName}" must be kebab-case, such as review-checklist`)
    if (names.has(skillName)) throw new OpError(`skill "${skillName}" appears twice`)
    names.add(skillName)
    if (!str(s.description, LIMITS.skillDescription)) throw new OpError(`skill "${skillName}" needs a description`)
    if (typeof s.content !== 'string' || !s.content.trim()) throw new OpError(`skill "${skillName}" needs content`)
    if (s.content.length > LIMITS.skillContent) throw new OpError(`skill "${skillName}" content exceeds ${LIMITS.skillContent} characters`)
    return normalizeSkill(s)
  })
  const localSkills = merged.localSkills ?? []
  if (!Array.isArray(localSkills) || localSkills.length > MAX_SKILLS) throw new OpError(`localSkills must be an array of at most ${MAX_SKILLS} names`)
  for (const skillName of localSkills) {
    if (typeof skillName !== 'string' || skillName.length > 64 || !SKILL_NAME.test(skillName)) throw new OpError('localSkills names must be kebab-case')
    if (names.has(skillName)) throw new OpError(`skill "${skillName}" appears twice (inline or local)`)
    names.add(skillName)
  }
  return { name: roleName, icon: str(merged.icon, LIMITS.icon), description: str(merged.description, LIMITS.description), prompt: merged.prompt, skills, localSkills }
}

function requireRole(library, roleId) {
  const role = library.roles.find(r => r.id === roleId)
  if (!role) throw new OpError(`role "${roleId}" does not exist`)
  return role
}

export function applyOp(library, op, now = Date.now()) {
  switch (op?.action) {
    case 'list':
      return { library, result: {} }
    case 'preview':
      return { library, result: { prompt: renderRolePrompt(parseDraft(op.role)) } }
    case 'get':
      return { library, result: { role: requireRole(library, op.roleId) } }
    case 'create': {
      if (library.roles.length >= MAX_ROLES) throw new OpError(`at most ${MAX_ROLES} roles`)
      const role = normalizeRole({ ...parseDraft(op.role), id: newRoleId(), updatedAt: now })
      return { library: { ...library, roles: [...library.roles, role] }, result: { roleId: role.id } }
    }
    case 'update': {
      const current = requireRole(library, op.roleId)
      const role = normalizeRole({ ...current, ...parseDraft(op.role, current), updatedAt: now })
      return { library: { ...library, roles: library.roles.map(r => r === current ? role : r) }, result: { roleId: role.id } }
    }
    case 'duplicate': {
      if (library.roles.length >= MAX_ROLES) throw new OpError(`at most ${MAX_ROLES} roles`)
      const source = requireRole(library, op.roleId)
      const { builtin: _builtin, ...rest } = source
      const role = normalizeRole({ ...rest, id: newRoleId(), name: `${source.name} copy`.slice(0, LIMITS.name), updatedAt: now })
      const at = library.roles.indexOf(source) + 1
      const roles = [...library.roles]
      roles.splice(at, 0, role)
      return { library: { ...library, roles }, result: { roleId: role.id } }
    }
    case 'delete': {
      const role = requireRole(library, op.roleId)
      return { library: { ...library, roles: library.roles.filter(r => r !== role) }, result: {} }
    }
    case 'move': {
      const role = requireRole(library, op.roleId)
      if (op.beforeRoleId !== undefined && op.beforeRoleId !== null) requireRole(library, op.beforeRoleId)
      if (op.beforeRoleId === role.id) return { library, result: {} }
      const rest = library.roles.filter(r => r !== role)
      const at = op.beforeRoleId ? rest.findIndex(r => r.id === op.beforeRoleId) : rest.length
      rest.splice(at, 0, role)
      return { library: { ...library, roles: rest }, result: {} }
    }
    case 'select': {
      if (!isSessionId(op.sessionId)) throw new OpError('sessionId must be a non-empty string')
      const roleId = op.roleId ?? null
      if (roleId !== null) requireRole(library, roleId)
      return { library, result: { sessionId: op.sessionId, roleId }, select: { sessionId: op.sessionId, roleId } }
    }
    case 'reset': {
      const current = requireRole(library, op.roleId)
      const source = BUILTIN_ROLES.find(b => b.builtin === current.builtin)
      if (!source) throw new OpError(`role "${current.id}" is not a built-in role`)
      const role = { ...builtinRole(source, now), id: current.id }
      return { library: { ...library, roles: library.roles.map(r => r === current ? role : r) }, result: { roleId: role.id } }
    }
    case 'restore_builtins': {
      const present = new Set(library.roles.flatMap(r => [r.id, r.builtin]))
      const missing = BUILTIN_ROLES.filter(b => !present.has(b.builtin)).map(b => builtinRole(b, now))
      if (missing.length === 0) return { library, result: { restored: [] } }
      return { library: { ...library, roles: [...library.roles, ...missing] }, result: { restored: missing.map(r => r.id) } }
    }
    default:
      throw new OpError(`action must be one of ${ACTIONS.join(', ')}`)
  }
}

export function renderRolePrompt(role) {
  if (!role) return ''
  const title = `${role.icon ? `${role.icon} ` : ''}${role.name}`
  const lines = [
    `# Active role: ${title}`,
    'The user assigned you this role for the current session. Act in this role on top of the other instructions; an explicit request from the user in the conversation takes precedence over it.',
    '',
    role.prompt.trim(),
  ]
  if (role.skills.length > 0) {
    lines.push('', `Skills that come with this role (load them with the \`skill\` tool when relevant): ${role.skills.map(s => s.name).join(', ')}.`)
  }
  if (role.localSkills?.length) {
    lines.push('', `Local skill references for this role: ${role.localSkills.join(', ')}. Load these by name with the skill tool when relevant, using the current session's skill catalog. These are references, not copies; if a referenced skill is absent from that catalog, report it as unavailable rather than inventing its instructions. Other session skills remain available.`)
  }
  return lines.join('\n')
}

function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

// external: DSH plugin reload can start a new instance before the previous one closes storageDomain
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

const TOOL_DESCRIPTION = [
  'Manage user roles (prompt + inline skills + local skill references) and switch the current session\'s role.',
  'Actions: list; get {roleId}; catalog {cwd?}; preview {role}; create {role}; update {roleId, role}; duplicate {roleId}; delete {roleId}; move {roleId, beforeRoleId?}; select {roleId} (null clears); reset {roleId}; restore_builtins.',
  'role = {name, icon?, description?, prompt, skills?: [{name, description, whenToUse?, content}], localSkills?: [string]}.',
  'Only switch or edit roles when the user asks.',
].join(' ')

const contentKey = r => JSON.stringify([r.name, r.icon, r.description, r.prompt, r.skills, r.localSkills ?? []])
const BUILTIN_KEYS = new Map(BUILTIN_ROLES.map(b => [b.builtin, contentKey(builtinRole(b))]))
const isModifiedBuiltin = role => BUILTIN_KEYS.has(role.builtin) && BUILTIN_KEYS.get(role.builtin) !== contentKey(role)

const summaryOf = r => ({ id: r.id, name: r.name, icon: r.icon, description: r.description, skills: r.skills.map(s => s.name), localSkills: r.localSkills, ...(r.builtin ? { builtin: true } : {}) })

export function apply(ctx) {
  let closed = false
  let tail = Promise.resolve()
  let library = { version: 1, roles: [] }
  let sessions = new Map()
  const ready = openDomain(ctx).then(domain => {
    library = domain.global.get()
    sessions = new Map(domain.table('sessions').entries())
    return domain
  })
  ready.catch(error => ctx.logger?.warn?.(`roles: cannot open storage: ${error?.message ?? error}`))
  ctx.effect(() => async () => {
    closed = true
    await tail
    const domain = await ready.catch(() => null)
    await domain?.close()
  }, 'roles: storage domain')

  ready.then(() => refreshSkills(), () => {})

  const roleOfSession = sessionId => {
    const roleId = sessions.get(sessionId)?.roleId
    return roleId === undefined ? undefined : library.roles.find(r => r.id === roleId)
  }

  const providers = new Map()
  const skillKey = sessionId => {
    const role = roleOfSession(sessionId)
    return role?.skills.length ? JSON.stringify([role.id, role.name, role.skills]) : ''
  }
  const refreshSkills = () => {
    for (const [agent, entry] of providers) {
      const key = skillKey(agent.session.id)
      if (key === entry.key) continue
      entry.key = key
      entry.control?.invalidate()
    }
  }

  const providerFor = agent => ({
    name: PROVIDER_NAME,
    async list() {
      const role = roleOfSession(agent.session.id)
      if (!role) return []
      return role.skills.map(skill => ({
        name: skill.name,
        description: skill.description,
        ...(skill.whenToUse ? { whenToUse: skill.whenToUse } : {}),
        invocation: { modelInvocable: true, userInvocable: true },
        source: 'role',
        provider: PROVIDER_NAME,
        resourceBase: { kind: 'opaque', description: `role "${role.name}" (dsh-roles); this skill has no files` },
        rank: SKILL_RANK,
        locator: { roleId: role.id, name: skill.name },
      }))
    },
    async get(candidate) {
      const role = roleOfSession(agent.session.id)
      const skill = role?.id === candidate.locator?.roleId ? role.skills.find(s => s.name === candidate.name) : undefined
      if (!skill) return undefined
      return {
        name: skill.name,
        description: skill.description,
        ...(skill.whenToUse ? { whenToUse: skill.whenToUse } : {}),
        invocation: candidate.invocation,
        source: 'role',
        provider: PROVIDER_NAME,
        resourceBase: candidate.resourceBase,
        content: skill.content,
      }
    },
  })

  ctx.inject(['agents', 'skills'], scope => {
    const install = agent => {
      if (providers.has(agent)) return
      const entry = { fiber: undefined, control: undefined, key: skillKey(agent.session.id) }
      providers.set(agent, entry)
      entry.fiber = agent.ctx.inject(['skills'], agentScope => {
        agentScope.skills.registerProvider(control => {
          entry.control = control
          return providerFor(agent)
        })
      })
    }
    const uninstall = agent => {
      const entry = providers.get(agent)
      if (!entry) return
      providers.delete(agent)
      entry.fiber?.dispose().catch(error => ctx.logger?.warn?.(`roles: skill provider cleanup failed: ${error?.message ?? error}`))
    }
    for (const agent of scope.agents.list()) install(agent)
    scope.on('agent/created', ({ agent }) => { install(agent) })
    scope.on('agent/disposed', ({ agent }) => { uninstall(agent) })
    scope.effect(() => () => { for (const agent of providers.keys()) uninstall(agent) }, 'roles: skill providers')
  })

  ctx.systemPrompt.section({
    name: 'roles:active-role',
    // external: DSH deployment persona section uses order 0
    order: 5,
    interpolate: false,
    text: ({ agent, scope }) => {
      const sessionId = (agent ?? scope)?.session?.id
      return typeof sessionId === 'string' ? renderRolePrompt(roleOfSession(sessionId)) : ''
    },
  })

  const streams = new Set()
  const snapshot = () => ({
    roles: library.roles,
    sessions: Object.fromEntries([...sessions].map(([id, s]) => [id, s.roleId])),
    builtinModified: library.roles.filter(r => r.builtin && isModifiedBuiltin(r)).map(r => r.id),
    builtinMissing: BUILTIN_ROLES.filter(b => !library.roles.some(r => r.id === b.builtin || r.builtin === b.builtin)).length,
    limits: { ...LIMITS, roles: MAX_ROLES, skills: MAX_SKILLS },
  })
  const broadcast = () => {
    const frame = `data: ${JSON.stringify(snapshot())}\n\n`
    for (const res of streams) res.write(frame)
  }

  const run = async (op, callerSessionId, fromTool = false) => {
    if (op?.action === 'preview') return applyOp(library, op).result
    if (op?.action === 'catalog') {
      const registry = ctx.get('skills')
      if (!registry) throw new OpError('skill registry unavailable')
      if (op.cwd !== undefined && (typeof op.cwd !== 'string' || !op.cwd.trim())) throw new OpError('cwd must be a non-empty directory path')
      const result = await registry.snapshot({ cwd: op.cwd, signal: AbortSignal.timeout(10_000) })
      const skills = result.skills.filter(s => s.invocation.modelInvocable && s.resourceBase?.kind === 'directory' && s.provider !== PROVIDER_NAME)
        .map(s => ({ name: s.name, description: s.description, source: s.source, path: s.path ?? s.resourceBase.path }))
      return { skills, complete: result.complete }
    }
    const task = tail.then(async () => {
      if (closed) throw new OpError('roles are unloading')
      const domain = await ready
      const effective = op?.action === 'select' && op.sessionId === undefined ? { ...op, sessionId: callerSessionId } : op
      const current = domain.global.get()
      const { library: next, result, select } = applyOp(current, effective)
      let changed = false
      if (next !== current) {
        await domain.global.set(next)
        library = next
        changed = true
      }
      const table = domain.table('sessions')
      if (select) {
        const previous = table.get(select.sessionId)?.roleId ?? null
        if (previous !== select.roleId) {
          if (select.roleId === null) await table.delete(select.sessionId)
          else await table.put(select.sessionId, { roleId: select.roleId, at: Date.now() })
          changed = true
        }
      }
      const roleIds = new Set(library.roles.map(r => r.id))
      const entries = [...table.entries()]
      const stale = entries.filter(([, s]) => !roleIds.has(s.roleId)).map(([id]) => id)
      const live = entries.filter(([, s]) => roleIds.has(s.roleId))
      if (live.length > MAX_SESSIONS) {
        stale.push(...live.toSorted((a, b) => a[1].at - b[1].at).slice(0, live.length - MAX_SESSIONS).map(([id]) => id))
      }
      if (stale.length > 0) { await table.deleteMany(stale); changed = true }
      if (changed) {
        sessions = new Map(table.entries())
        refreshSkills()
        broadcast()
      }
      if (op?.action === 'list' && fromTool) {
        return { roles: library.roles.map(summaryOf), currentRoleId: callerSessionId ? sessions.get(callerSessionId)?.roleId ?? null : null }
      }
      return { ...result, ...snapshot() }
    })
    tail = task.catch(() => {})
    return task
  }

  const rejected = (res, peer) => {
    if (peer?.principal?.kind === 'owner') return false
    res.statusCode = peer === undefined ? 401 : 403
    res.end()
    return true
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try {
        await ready
        sendJson(res, 200, snapshot())
      } catch (error) {
        sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
    },
  }), `roles: GET ${STATE_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: OP_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
      const raw = await readBody(req)
      if (raw === null) return sendJson(res, 413, { message: `body exceeds ${MAX_BODY_BYTES} bytes` })
      let op = null
      try { op = JSON.parse(raw) } catch {}
      try {
        sendJson(res, 200, await run(op))
      } catch (error) {
        sendJson(res, error instanceof OpError ? 400 : 500, { message: error?.message ?? String(error) })
      }
    },
  }), `roles: POST ${OP_PATH}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: EVENTS_PATH,
    handler: async (req, res, peer) => {
      if (rejected(res, peer)) return
      if (req.method !== 'GET') return sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
      try { await ready } catch (error) {
        return sendJson(res, 503, { message: `storage unavailable: ${error?.message ?? error}` })
      }
      if (res.destroyed) return
      if (closed) return sendJson(res, 503, { message: 'roles are unloading' })
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      res.write(`retry: 3000\ndata: ${JSON.stringify(snapshot())}\n\n`)
      streams.add(res)
      const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS)
      const drop = () => { clearInterval(heartbeat); streams.delete(res) }
      res.once('close', drop)
    },
  }), `roles: GET ${EVENTS_PATH}`)

  ctx.effect(() => () => {
    for (const res of streams) res.end()
    streams.clear()
  }, 'roles: close event streams')

  ctx.inject(['tools'], toolCtx => {
    const skillSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'kebab-case skill name.' },
        description: { type: 'string', description: 'One-line routing description.' },
        whenToUse: { type: 'string', description: 'Optional extra routing guidance.' },
        content: { type: 'string', description: 'Full skill instructions in Markdown.' },
      },
      required: ['name', 'description', 'content'],
      additionalProperties: false,
    }
    toolCtx.effect(() => toolCtx.tools.register({
      name: TOOL_NAME,
      description: TOOL_DESCRIPTION,
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ACTIONS, description: 'Operation to perform.' },
          cwd: { type: 'string', description: 'catalog: project directory to include workspace skills.' },
          roleId: { type: ['string', 'null'], description: 'Target role id; null with select clears the role.' },
          beforeRoleId: { type: 'string', description: 'move: place before this role; omit to move last.' },
          role: {
            type: 'object',
            description: 'create/update: role fields.',
            properties: {
              name: { type: 'string' },
              icon: { type: 'string', description: 'An emoji.' },
              description: { type: 'string' },
              prompt: { type: 'string', description: 'Role prompt in Markdown.' },
              skills: { type: 'array', items: skillSchema },
              localSkills: { type: 'array', items: { type: 'string' }, description: 'Local skill names loaded via the native skill tool.' },
            },
            additionalProperties: false,
          },
        },
        required: ['action'],
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object' },
        render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      },
      async execute(args, exec) {
        const callerSessionId = exec?.agent?.session?.id
        const { sessionId: _ignored, ...op } = args ?? {}
        const value = await run(op, callerSessionId, true)
        if (op.action === 'list') return value
        const { roles: _roles, sessions: _sessions, ...rest } = value
        return rest
      },
    }), `roles: ${TOOL_NAME} tool`)
  })
}
