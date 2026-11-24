import { watch } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { convertConfig } from './convert.js'

export const name = 'pi-mcp'
export const inject = ['mcpManager']

const RELOAD_DELAY_MS = 300

export function piConfigPath(env = process.env) {
  return join(env.PI_CODING_AGENT_DIR || join(homedir(), '.pi', 'agent'), 'mcp.json')
}

function resolveDisabledServers(config, env = process.env) {
  const fromConfig = Array.isArray(config?.disabledServers)
    ? config.disabledServers.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean)
    : []
  const fromEnv = typeof env.DSH_PI_MCP_DISABLED_SERVERS === 'string'
    ? env.DSH_PI_MCP_DISABLED_SERVERS.split(',').map(item => item.trim()).filter(Boolean)
    : []
  return [...new Set([...fromConfig, ...fromEnv])]
}

export async function apply(ctx, config = {}) {
  const logger = ctx.logger
  const file = piConfigPath()
  const disabledServers = resolveDisabledServers(config)
  const active = new Map()
  let disposed = false
  let timer
  let running = Promise.resolve()

  const unregister = server => {
    active.get(server)?.dispose()
    active.delete(server)
  }

  const read = async () => {
    let text
    try {
      text = await readFile(file, 'utf8')
    } catch (error) {
      if (error.code === 'ENOENT') return new Map()
      throw error
    }
    let parsed
    try { parsed = JSON.parse(text) } catch (error) {
      // external: JSON.parse error messages quote raw input, which can leak secret headers or env values
      throw new Error('invalid JSON', { cause: error })
    }
    const { entries, skipped } = convertConfig(parsed, { disabledServers })
    for (const { name: server, reason } of skipped) logger.warn(`pi-mcp: skipped "${server}": ${reason}`)
    return entries
  }

  const reconcile = async () => {
    let entries
    try {
      entries = await read()
    } catch (error) {
      logger.warn(`pi-mcp: cannot read ${file}; keeping current servers: ${error.message}`)
      return
    }
    if (disposed) return
    for (const [server, { key }] of active) {
      const next = entries.get(server)
      if (!next || JSON.stringify(next) !== key) unregister(server)
    }
    for (const [server, entry] of entries) {
      if (active.has(server)) continue
      try {
        const dispose = ctx.mcpManager.register(server, entry)
        active.set(server, { key: JSON.stringify(entry), dispose })
        logger.info(`pi-mcp: registered "${server}" (${entry.transport})`)
      } catch (error) {
        logger.warn(`pi-mcp: cannot register "${server}": ${error.message}`)
      }
    }
  }

  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      running = running.then(reconcile)
    }, RELOAD_DELAY_MS)
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
    return () => {
      disposed = true
      clearTimeout(timer)
      watcher?.close()
      for (const server of active.keys()) unregister(server)
    }
  }, 'pi-mcp: watch mcp.json')

  running = reconcile()
  await running
}
