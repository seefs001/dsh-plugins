import { watch } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { convertConfig, convertServer } from './convert.js'

export const name = 'pi-mcp'
export const inject = ['mcpManager']

export const STATE_PATH = '/pi-mcp/state'
export const SET_PATH = '/pi-mcp/set'

const RELOAD_DELAY_MS = 300
const MAX_BODY_BYTES = 16 * 1024

function canonicalize(value, seen) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) return 'null'
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return 'null'
    return JSON.stringify(value)
  }
  if (typeof value.toJSON === 'function') return canonicalize(value.toJSON(), seen)
  if (seen.has(value)) return '"[Circular]"'
  seen.add(value)
  try {
    if (Array.isArray(value)) {
      return `[${value.map(item => canonicalize(item, seen)).join(',')}]`
    }
    const parts = []
    for (const key of Object.keys(value).toSorted()) {
      const item = value[key]
      if (item === undefined || typeof item === 'function' || typeof item === 'symbol') continue
      parts.push(`${JSON.stringify(key)}:${canonicalize(item, seen)}`)
    }
    return `{${parts.join(',')}}`
  } finally {
    seen.delete(value)
  }
}

export function entrySignature(entry) {
  return canonicalize(entry, new Set())
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

export async function reconcileServers(active, entries, { register, logger, isDisposed } = {}) {
  const removed = []
  const updated = []
  const added = []
  const kept = []
  const failed = []
  const nextSignatures = new Map()
  for (const [server, entry] of entries) {
    nextSignatures.set(server, entrySignature(entry))
  }
  const toDispose = []
  for (const [server, record] of active) {
    const nextSig = nextSignatures.get(server)
    if (nextSig !== undefined && nextSig === record.signature) {
      kept.push(server)
      continue
    }
    active.delete(server)
    toDispose.push({ server, record, replaced: nextSig !== undefined })
  }
  for (const { server, record, replaced } of toDispose) {
    try {
      await record.dispose?.()
    } catch (error) {
      logger?.warn?.(`pi-mcp: cannot dispose "${server}": ${errorMessage(error)}`)
    }
    if (!replaced) removed.push(server)
  }
  if (isDisposed?.()) return { kept, added, updated, removed, failed }
  const replacedSet = new Set(toDispose.filter(item => item.replaced).map(item => item.server))
  for (const [server, entry] of entries) {
    if (active.has(server)) continue
    if (isDisposed?.()) break
    const signature = nextSignatures.get(server)
    try {
      const dispose = register(server, entry)
      if (isDisposed?.()) {
        try {
          await dispose?.()
        } catch {}
        break
      }
      active.set(server, { signature, dispose })
      if (replacedSet.has(server)) updated.push(server)
      else added.push(server)
      logger?.info?.(`pi-mcp: registered "${server}" (${entry.transport})`)
    } catch (error) {
      failed.push({ server, error: errorMessage(error) })
      logger?.warn?.(`pi-mcp: cannot register "${server}": ${errorMessage(error)}`)
    }
  }
  return { kept, added, updated, removed, failed }
}

export function piConfigPath(env = process.env) {
  return join(env.PI_CODING_AGENT_DIR || join(homedir(), '.pi', 'agent'), 'mcp.json')
}

function resolveEnvDisabled(env = process.env) {
  return typeof env.DSH_PI_MCP_DISABLED_SERVERS === 'string'
    ? env.DSH_PI_MCP_DISABLED_SERVERS.split(',').map(item => item.trim()).filter(Boolean)
    : []
}

function normalizeDisabledList(list) {
  return [...new Set(
    (Array.isArray(list) ? list : [])
      .filter(item => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean),
  )]
}

function sendJson(res, status, data, headers = {}) {
  if (res.writableEnded || res.destroyed) return
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  })
  res.end(JSON.stringify(data))
}

async function readJsonBody(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.byteLength
    if (bytes > MAX_BODY_BYTES) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected JSON object')
  return parsed
}

export async function apply(ctx, config = {}) {
  const logger = ctx.logger
  const file = piConfigPath()
  let configDisabled = normalizeDisabledList(config?.disabledServers)
  const active = new Map()
  let lastSnapshot = { file, exists: false, error: null, servers: [] }
  let disposed = false
  let timer
  let running = Promise.resolve()

  const read = async () => {
    let text
    try {
      text = await readFile(file, 'utf8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        lastSnapshot = { file, exists: false, error: null, servers: [] }
        return new Map()
      }
      throw error
    }
    let parsed
    try { parsed = JSON.parse(text) } catch (error) {
      // external: JSON.parse error messages quote raw input, which can leak secret headers or env values
      lastSnapshot = { file, exists: true, error: 'invalid JSON', servers: [] }
      throw new Error('invalid JSON', { cause: error })
    }
    const envDisabled = new Set(resolveEnvDisabled())
    const disabledList = [...new Set([...configDisabled, ...envDisabled])]
    const disabledSet = new Set(disabledList)
    const { entries, skipped } = convertConfig(parsed, {
      disabledServers: disabledList,
      eagerServers: config?.eagerServers,
    })
    const skippedMap = new Map(skipped.map(s => [s.name, s.reason]))
    for (const { name: server, reason } of skipped) logger.warn(`pi-mcp: skipped "${server}": ${reason}`)

    const rawServers = parsed?.mcpServers && typeof parsed.mcpServers === 'object' && !Array.isArray(parsed.mcpServers)
      ? parsed.mcpServers
      : {}
    const servers = Object.entries(rawServers).map(([serverName, raw]) => {
      const disabledByEnv = envDisabled.has(serverName)
      const disabledByConfig = disabledSet.has(serverName)
      const disabledInFile = raw?.enabled === false
      let transport = null
      try {
        transport = convertServer(serverName, { ...raw, enabled: true })?.transport ?? null
      } catch {}
      return {
        name: serverName,
        transport,
        disabledByConfig: configDisabled.includes(serverName),
        disabledByEnv,
        disabledInFile,
        enabled: !disabledByConfig && !disabledInFile && !skippedMap.has(serverName),
        skippedReason: skippedMap.get(serverName) ?? null,
      }
    })
    lastSnapshot = { file, exists: true, error: null, servers }
    return entries
  }

  let reconciling = false
  const reconcile = async () => {
    if (disposed) return
    reconciling = true
    try {
      let entries
      try {
        entries = await read()
      } catch (error) {
        logger.warn(`pi-mcp: cannot read ${file}; keeping current servers: ${errorMessage(error)}`)
        return
      }
      if (disposed) return
      await reconcileServers(active, entries, {
        register: (server, entry) => ctx.mcpManager.register(server, entry),
        logger,
        isDisposed: () => disposed,
      })
    } finally {
      reconciling = false
    }
  }

  const enqueue = () => {
    running = running.then(reconcile, reconcile)
    return running
  }

  const statePayload = (overrideDisabled = null) => {
    if (overrideDisabled !== null) {
      const disabledSet = new Set(overrideDisabled)
      return {
        ...lastSnapshot,
        disabledServers: overrideDisabled,
        servers: lastSnapshot.servers.map(item => {
          const disabledByConfig = disabledSet.has(item.name)
          const enabled = !disabledByConfig && !item.disabledByEnv && !item.disabledInFile && !item.skippedReason
          return {
            ...item,
            disabledByConfig,
            enabled,
            active: enabled,
          }
        }),
      }
    }
    return {
      ...lastSnapshot,
      disabledServers: configDisabled,
      servers: lastSnapshot.servers.map(item => ({
        ...item,
        active: active.has(item.name),
      })),
    }
  }

  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      void enqueue()
    }, RELOAD_DELAY_MS)
  }

  const disposeActive = async () => {
    const pending = []
    for (const [server, record] of active) {
      active.delete(server)
      try {
        const res = record.dispose?.()
        if (res && typeof res.then === 'function') pending.push(res)
      } catch (error) {
        logger?.warn?.(`pi-mcp: cannot dispose "${server}": ${errorMessage(error)}`)
      }
    }
    if (pending.length > 0) await Promise.allSettled(pending)
  }

  ctx.effect(() => {
    // external: fs.watch on a single file misses atomic rename saves
    let watcher
    try {
      watcher = watch(dirname(file), (_event, changed) => {
        if (!changed || changed === basename(file)) schedule()
      })
      watcher.on('error', error => logger.warn(`pi-mcp: stopped watching ${file}: ${error.message}`))
    } catch (error) {
      logger.warn(`pi-mcp: cannot watch ${file}; changes need a plugin reload: ${error.message}`)
    }
    return async () => {
      disposed = true
      clearTimeout(timer)
      watcher?.close()
      if (!reconciling) {
        await disposeActive()
        return
      }
      await running.catch(() => {})
      await disposeActive()
    }
  }, 'pi-mcp: watch mcp.json')

  ctx.inject(['webServer'], scope => {
    scope.effect(() => scope.webServer.register({
      kind: 'exact',
      path: STATE_PATH,
      handler: async (req, res, peer) => {
        if (peer?.principal?.kind !== 'owner') {
          sendJson(res, peer === undefined ? 401 : 403, { message: 'Unauthorized' })
          return
        }
        if (req.method !== 'GET') {
          sendJson(res, 405, { message: 'GET only' }, { allow: 'GET' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://127.0.0.1')
        if (url.searchParams.get('reload') === '1') {
          clearTimeout(timer)
          enqueue()
        }
        await running
        sendJson(res, 200, statePayload())
      },
    }), 'pi-mcp: state route')

    scope.effect(() => scope.webServer.register({
      kind: 'exact',
      path: SET_PATH,
      handler: async (req, res, peer) => {
        if (peer?.principal?.kind !== 'owner') {
          sendJson(res, peer === undefined ? 401 : 403, { message: 'Unauthorized' })
          return
        }
        if (req.method !== 'POST') {
          sendJson(res, 405, { message: 'POST only' }, { allow: 'POST' })
          return
        }
        try {
          const body = await readJsonBody(req)
          const nextDisabled = normalizeDisabledList(body.disabledServers)
          const entry = ctx.fiber?.entry
          const editor = ctx.get('configEditor')
          if (entry && editor) {
            await editor.edit(entry, current => ({ ...current, disabledServers: nextDisabled }))
          }
          configDisabled = nextDisabled
          if (disposed) {
            sendJson(res, 200, statePayload(nextDisabled))
            return
          }
          clearTimeout(timer)
          await enqueue()
          sendJson(res, 200, statePayload())
        } catch (error) {
          sendJson(res, 400, { message: errorMessage(error) })
        }
      },
    }), 'pi-mcp: set route')
  })

  await enqueue()
}
