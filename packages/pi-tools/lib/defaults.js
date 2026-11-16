import { z } from './harness.js'

// Host-wide default tool selections, one per Agent preset id. The root
// companion owns the storage domain (domains are single-open); every preset
// generation of this package reads the same module-level handle.
export const DEFAULTS_DOMAIN = {
  name: 'pi_tools_defaults',
  version: 1,
  // Stored as changes to the configured defaults, so tools that appear later
  // (for example after an MCP refresh) still follow the configured default.
  tables: { presets: { valueSchema: z.object({ include: z.array(z.string()), exclude: z.array(z.string()) }) } },
}

let domain

/** @returns the saved `{ include, exclude }` changes for a preset, or undefined when none are saved. */
export function savedDefaultsOf(agentPreset) {
  if (!domain || typeof agentPreset !== 'string') return undefined
  return domain.table('presets').get(agentPreset)
}

/** Save `{ include, exclude }`, or reset to the configured defaults with null. */
export async function writeDefaults(agentPreset, changes) {
  if (!domain) throw new Error('Pi tool defaults storage is unavailable')
  const table = domain.table('presets')
  if (changes === null) await table.delete(agentPreset)
  else await table.put(agentPreset, changes)
}

export function openDefaults(ctx, onChange) {
  ctx.inject(['storageDomain'], scope => {
    const ready = scope.storageDomain.open(DEFAULTS_DOMAIN).then(opened => {
      domain = opened
      onChange()
      return opened
    })
    ready.catch(error => scope.logger?.warn?.(`pi-tools: default tool storage is unavailable: ${error?.message ?? error}`))
    scope.effect(() => async () => {
      const opened = await ready.catch(() => undefined)
      if (domain === opened) {
        domain = undefined
        onChange()
      }
      await opened?.close().catch(() => {})
    }, 'pi-tools: default tool storage')
  })
}
