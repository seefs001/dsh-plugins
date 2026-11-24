import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, rename, rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  CREDENTIAL_FILES,
  HOME_FILES,
  classifyDomain,
  discoverOpenDomains,
  domainHasGlobal,
  domainTableNames,
  domainVersion,
  selectDomainTables,
} from './catalog.js'
import { BUNDLE_FORMAT, BUNDLE_VERSION, BackupError, decryptBundle, encryptBundle, isEncryptedEnvelope } from './crypto.js'
import {
  collectSecretPaths,
  deepEqual,
  diffTables,
  diffText,
  diffValues,
  expandHomePaths,
  isPlainObject,
  mergeLayers,
  normalizeHomePaths,
  restorePreservedSecrets,
  stripSecretsBySchema,
} from './diff.js'

const SELF_ENTRY_ID = 'config-backup'
const MAX_DOMAIN_EXPORT_BYTES = 2 * 1024 * 1024

async function readOptionalUtf8(filePath) {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

async function writeAtomic(filePath, content, mode) {
  await mkdir(dirname(filePath), { recursive: true })
  const tmp = join(dirname(filePath), `.${randomUUID()}.tmp`)
  try {
    const handle = await open(tmp, 'wx', mode)
    try {
      await handle.writeFile(content, 'utf8')
      await handle.sync()
    } finally {
      await handle.close()
    }
    await rename(tmp, filePath)
  } catch (error) {
    await rm(tmp, { force: true }).catch(() => {})
    throw error
  }
}

function byteLength(value) {
  return Buffer.byteLength(typeof value === 'string' ? value : JSON.stringify(value), 'utf8')
}

function schemaOf(entry) {
  const schema = entry?.fiber?.runtime?.Config
  return schema !== undefined && typeof schema.toJSON === 'function' ? schema : undefined
}

function hasEffectiveOverride(override, inherited) {
  if (!isPlainObject(override) || Object.keys(override).length === 0) return false
  return !deepEqual(mergeLayers(inherited, override), inherited)
}

function readDomainSnapshot(domain, rule) {
  const availableTables = domainTableNames(domain)
  const includedTables = selectDomainTables(rule, availableTables)
  const hasGlobal = rule.includeGlobal && domainHasGlobal(domain)
  const globalValue = hasGlobal ? structuredClone(domain.global.get()) : undefined
  const tables = {}
  let recordCount = 0
  for (const table of includedTables) {
    const entries = Object.fromEntries([...domain.table(table).entries()].map(([k, v]) => [k, structuredClone(v)]))
    tables[table] = entries
    recordCount += Object.keys(entries).length
  }
  const payload = {
    name: domain.name,
    version: domainVersion(domain),
    hasGlobal,
    ...(hasGlobal ? { global: globalValue } : {}),
    includedTables,
    tables,
  }
  return { payload, recordCount, availableTables }
}

function formatStamp(date) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

function isEmptyHomePatch(content) {
  if (content === null) return true
  const stripped = content.replace(/^\s*#.*$/gm, '').trim()
  return stripped === '' || stripped === '[]'
}

export async function inspectInventory(ctx) {
  const home = ctx.profileContext.home
  const profileName = ctx.profileContext.name
  const configs = []
  for (const { entry, inherited, override } of ctx.configEditor.configuration()) {
    const id = entry.options.id
    if (id === SELF_ENTRY_ID) continue
    if (!hasEffectiveOverride(override, inherited)) continue
    const schema = schemaOf(entry)
    const secretPaths = schema ? collectSecretPaths(schema, override) : []
    configs.push({
      id,
      name: entry.options.name,
      keys: Object.keys(override).toSorted(),
      secretCount: secretPaths.length,
      bytes: byteLength(override),
      defaultSelected: true,
    })
  }
  configs.sort((a, b) => a.id.localeCompare(b.id))

  const storageDomain = ctx.get('storageDomain')
  const openDomains = discoverOpenDomains(storageDomain)
  const domains = []
  for (const [domainName, domain] of openDomains) {
    const rule = classifyDomain(domainName)
    if (!rule) continue
    const { payload, recordCount, availableTables } = readDomainSnapshot(domain, rule)
    const bytes = byteLength(payload)
    const oversized = bytes > MAX_DOMAIN_EXPORT_BYTES
    domains.push({
      name: domainName,
      version: payload.version,
      category: rule.category,
      defaultSelected: oversized ? false : rule.defaultSelected,
      hasGlobal: payload.hasGlobal,
      includedTables: payload.includedTables,
      excludedTables: availableTables.filter(table => !payload.includedTables.includes(table)),
      recordCount,
      bytes,
      oversized,
      restartRecommended: Boolean(rule.restartRecommended),
      noteKey: rule.noteKey ?? null,
    })
  }
  const categoryRank = { plugin: 0, host: 1, optional: 2, other: 3 }
  domains.sort((a, b) => (categoryRank[a.category] ?? 9) - (categoryRank[b.category] ?? 9) || a.name.localeCompare(b.name))

  const homeFiles = []
  for (const spec of HOME_FILES) {
    const content = await readOptionalUtf8(join(home, spec.relPath))
    if (content === null) continue
    if (spec.id === 'home-patch' && isEmptyHomePatch(content)) continue
    homeFiles.push({
      id: spec.id,
      relPath: spec.relPath,
      bytes: byteLength(content),
      lines: content.split('\n').length,
      defaultSelected: spec.defaultSelected,
    })
  }

  const credentials = []
  for (const spec of CREDENTIAL_FILES) {
    const content = await readOptionalUtf8(join(home, spec.relPath))
    if (content === null || content.trim() === '') continue
    credentials.push({
      id: spec.id,
      relPath: spec.relPath,
      bytes: byteLength(content),
      lines: content.split('\n').length,
      defaultSelected: false,
    })
  }

  return {
    profile: profileName,
    homeDir: home,
    platform: process.platform,
    configs,
    domains,
    homeFiles,
    credentials,
  }
}

export async function buildExportBundle(ctx, request = {}) {
  const home = ctx.profileContext.home
  const osHome = homedir()
  const includeSecrets = Boolean(request.includeSecrets)
  const includeCredentials = Boolean(request.includeCredentials)
  const normalizeHome = request.normalizeHome !== false
  const passphrase = typeof request.passphrase === 'string' ? request.passphrase : ''
  const selectedConfigs = Array.isArray(request.configIds) ? new Set(request.configIds) : null
  const selectedDomains = Array.isArray(request.domainNames) ? new Set(request.domainNames) : null
  const selectedHomeFiles = Array.isArray(request.homeFileIds) ? new Set(request.homeFileIds) : null
  const selectedCredentials = Array.isArray(request.credentialIds) ? new Set(request.credentialIds) : null

  const transform = value => (normalizeHome ? normalizeHomePaths(value, osHome) : value)

  const configs = []
  for (const { entry, inherited, override } of ctx.configEditor.configuration()) {
    const id = entry.options.id
    if (id === SELF_ENTRY_ID) continue
    if (!hasEffectiveOverride(override, inherited)) continue
    if (selectedConfigs && !selectedConfigs.has(id)) continue
    const schema = schemaOf(entry)
    let exportedOverride = structuredClone(override)
    let redactedSecretPaths = []
    if (!includeSecrets && schema) {
      const stripped = stripSecretsBySchema(schema, exportedOverride)
      exportedOverride = stripped.value
      redactedSecretPaths = stripped.secretPaths
    }
    configs.push({
      id,
      name: entry.options.name,
      override: transform(exportedOverride),
      redactedSecretPaths,
    })
  }
  configs.sort((a, b) => a.id.localeCompare(b.id))

  const storageDomain = ctx.get('storageDomain')
  const openDomains = discoverOpenDomains(storageDomain)
  const domains = []
  for (const [domainName, domain] of openDomains) {
    const rule = classifyDomain(domainName)
    if (!rule) continue
    if (selectedDomains) {
      if (!selectedDomains.has(domainName)) continue
    } else if (!rule.defaultSelected) {
      continue
    }
    const { payload } = readDomainSnapshot(domain, rule)
    if (byteLength(payload) > MAX_DOMAIN_EXPORT_BYTES) {
      throw new BackupError('DOMAIN_TOO_LARGE', `Domain "${domainName}" exceeds the 2 MB export limit`, 400)
    }
    domains.push({
      name: payload.name,
      version: payload.version,
      hasGlobal: payload.hasGlobal,
      ...(payload.hasGlobal ? { global: transform(payload.global) } : {}),
      includedTables: payload.includedTables,
      tables: transform(payload.tables),
    })
  }
  domains.sort((a, b) => a.name.localeCompare(b.name))

  const homeFiles = []
  for (const spec of HOME_FILES) {
    if (selectedHomeFiles && !selectedHomeFiles.has(spec.id)) continue
    const content = await readOptionalUtf8(join(home, spec.relPath))
    if (content === null) continue
    if (spec.id === 'home-patch' && isEmptyHomePatch(content)) continue
    homeFiles.push({
      id: spec.id,
      relPath: spec.relPath,
      content,
    })
  }

  const credentials = []
  if (includeCredentials) {
    for (const spec of CREDENTIAL_FILES) {
      if (selectedCredentials && !selectedCredentials.has(spec.id)) continue
      const content = await readOptionalUtf8(join(home, spec.relPath))
      if (content === null || content.trim() === '') continue
      credentials.push({
        id: spec.id,
        relPath: spec.relPath,
        content,
      })
    }
  }

  const now = new Date()
  const payload = {
    format: BUNDLE_FORMAT,
    version: BUNDLE_VERSION,
    encrypted: false,
    exportedAt: now.toISOString(),
    source: {
      profile: ctx.profileContext.name,
      platform: process.platform,
    },
    options: {
      includeSecrets,
      includeCredentials: credentials.length > 0,
      normalizeHome,
    },
    configs,
    domains,
    homeFiles,
    credentials,
  }

  const output = passphrase ? await encryptBundle(payload, passphrase) : payload
  const safeProfile = String(ctx.profileContext.name || 'dsh').replace(/[^a-zA-Z0-9_-]+/g, '-')
  const filename = `dsh-config-backup-${safeProfile}-${formatStamp(now)}.json`
  return {
    filename,
    encrypted: Boolean(passphrase),
    bytes: byteLength(output),
    stats: {
      configs: configs.length,
      domains: domains.length,
      homeFiles: homeFiles.length,
      credentials: credentials.length,
    },
    bundle: output,
  }
}

async function unwrapBundle(rawBundle, passphrase) {
  if (!isPlainObject(rawBundle)) {
    throw new BackupError('INVALID_BUNDLE', 'Backup file must be a JSON object', 400)
  }
  if (rawBundle.format !== BUNDLE_FORMAT) {
    throw new BackupError('INVALID_BUNDLE', 'File is not a dsh-config-backup archive', 400)
  }
  if (rawBundle.version !== BUNDLE_VERSION) {
    throw new BackupError('UNSUPPORTED_VERSION', `Unsupported backup version: ${rawBundle.version}`, 400)
  }
  const encrypted = isEncryptedEnvelope(rawBundle)
  const payload = encrypted ? await decryptBundle(rawBundle, passphrase) : rawBundle
  if (!isPlainObject(payload) || payload.format !== BUNDLE_FORMAT || payload.version !== BUNDLE_VERSION) {
    throw new BackupError('INVALID_BUNDLE', 'Decrypted backup payload is malformed', 400)
  }
  return { payload, encrypted }
}

function resolveDesiredConfig(item, current, inherited, expand) {
  const importedOverride = expand(structuredClone(item.override ?? {}))
  let desired = mergeLayers(inherited, importedOverride)
  const redactedPaths = Array.isArray(item.redactedSecretPaths) ? item.redactedSecretPaths : []
  const restored = restorePreservedSecrets(desired, current, redactedPaths)
  desired = restored.value
  return { desired, preservedSecrets: restored.preservedCount, redactedPaths }
}

export async function previewImport(ctx, request = {}) {
  const { payload, encrypted } = await unwrapBundle(request.bundle, request.passphrase)
  const tableMode = request.tableMode === 'replace' ? 'replace' : 'merge'
  const shouldExpand = payload.options?.normalizeHome !== false
  const osHome = homedir()
  const expand = value => (shouldExpand ? expandHomePaths(value, osHome) : value)
  const home = ctx.profileContext.home

  const configMap = new Map()
  for (const row of ctx.configEditor.configuration()) {
    configMap.set(row.entry.options.id, row)
  }

  const configs = []
  for (const item of Array.isArray(payload.configs) ? payload.configs : []) {
    if (!item || typeof item.id !== 'string' || item.id === SELF_ENTRY_ID) continue
    const live = configMap.get(item.id)
    if (!live) {
      configs.push({
        id: item.id,
        name: item.name ?? item.id,
        status: 'uninstalled',
        reason: 'Plugin entry is not installed in this profile',
        changes: [],
        truncated: 0,
        preservedSecrets: 0,
        defaultSelected: false,
      })
      continue
    }
    const current = structuredClone(live.entry.options.config ?? {})
    const { desired, preservedSecrets, redactedPaths } = resolveDesiredConfig(item, current, live.inherited, expand)
    const schema = schemaOf(live.entry)
    const secretPaths = [
      ...(schema ? collectSecretPaths(schema, current) : []),
      ...(schema ? collectSecretPaths(schema, desired) : []),
      ...redactedPaths,
    ]
    const unchanged = deepEqual(current, desired)
    const isNew = !hasEffectiveOverride(live.override, live.inherited) && !unchanged
    const diff = unchanged ? { changes: [], truncated: 0 } : diffValues(current, desired, secretPaths)
    configs.push({
      id: item.id,
      name: live.entry.options.name,
      status: unchanged ? 'unchanged' : isNew ? 'new' : 'modified',
      changes: diff.changes,
      truncated: diff.truncated,
      preservedSecrets,
      redactedCount: redactedPaths.length,
      defaultSelected: !unchanged,
    })
  }

  const storageDomain = ctx.get('storageDomain')
  const domains = []
  for (const item of Array.isArray(payload.domains) ? payload.domains : []) {
    if (!item || typeof item.name !== 'string') continue
    const live = storageDomain?.get?.(item.name)
    if (!live) {
      domains.push({
        name: item.name,
        version: item.version ?? 1,
        status: 'uninstalled',
        reason: 'Storage domain is not active in this profile',
        changes: [],
        truncated: 0,
        tableSummary: { added: 0, modified: 0, removed: 0 },
        restartRecommended: false,
        defaultSelected: false,
      })
      continue
    }
    const liveVersion = domainVersion(live)
    const compatibleVersions = live.unit?.descriptor?.compatibleVersions ?? []
    const itemVersion = Number.isInteger(item.version) ? item.version : 1
    if (itemVersion !== liveVersion && !compatibleVersions.includes(itemVersion)) {
      domains.push({
        name: item.name,
        version: itemVersion,
        liveVersion,
        status: 'incompatible',
        reason: `Schema version mismatch (backup v${itemVersion}, host v${liveVersion})`,
        changes: [],
        truncated: 0,
        tableSummary: { added: 0, modified: 0, removed: 0 },
        restartRecommended: false,
        defaultSelected: false,
      })
      continue
    }

    const rule = classifyDomain(item.name) ?? { restartRecommended: true }
    const changes = []
    let truncated = 0
    let hasGlobalDiff = false
    if (item.hasGlobal && domainHasGlobal(live)) {
      const currentGlobal = live.global.get()
      const nextGlobal = expand(structuredClone(item.global))
      if (!deepEqual(currentGlobal, nextGlobal)) {
        hasGlobalDiff = true
        const gDiff = diffValues(currentGlobal, nextGlobal)
        changes.push(...gDiff.changes.map(entry => ({ ...entry, path: `global.${entry.path}` })))
        truncated += gDiff.truncated
      }
    }

    const availableTables = new Set(domainTableNames(live))
    const beforeTables = {}
    const afterTables = {}
    const backupTables = isPlainObject(item.tables) ? item.tables : {}
    for (const [tableName, records] of Object.entries(backupTables)) {
      if (!availableTables.has(tableName) || !isPlainObject(records)) continue
      beforeTables[tableName] = Object.fromEntries(live.table(tableName).entries())
      afterTables[tableName] = expand(structuredClone(records))
    }
    const tDiff = diffTables(beforeTables, afterTables, tableMode)
    const remainingSlots = Math.max(0, 80 - changes.length)
    changes.push(...tDiff.changes.slice(0, remainingSlots))
    truncated += tDiff.truncated + Math.max(0, tDiff.changes.length - remainingSlots)

    const hasTableDiff = tDiff.added > 0 || tDiff.modified > 0 || tDiff.removed > 0
    const unchanged = !hasGlobalDiff && !hasTableDiff
    domains.push({
      name: item.name,
      version: itemVersion,
      hasGlobal: Boolean(item.hasGlobal && domainHasGlobal(live)),
      includedTables: Object.keys(afterTables).toSorted(),
      status: unchanged ? 'unchanged' : 'modified',
      changes,
      truncated,
      tableSummary: { added: tDiff.added, modified: tDiff.modified, removed: tDiff.removed },
      restartRecommended: Boolean(rule.restartRecommended),
      defaultSelected: !unchanged,
    })
  }

  const allowedHomeMap = new Map(HOME_FILES.map(spec => [spec.id, spec]))
  const homeFiles = []
  for (const item of Array.isArray(payload.homeFiles) ? payload.homeFiles : []) {
    if (!item || typeof item.id !== 'string' || typeof item.content !== 'string') continue
    const spec = allowedHomeMap.get(item.id)
    if (!spec) continue
    const current = await readOptionalUtf8(join(home, spec.relPath))
    const unchanged = current === item.content
    const diff = unchanged ? { added: 0, removed: 0, lines: [], truncated: 0 } : diffText(current ?? '', item.content)
    homeFiles.push({
      id: spec.id,
      relPath: spec.relPath,
      status: unchanged ? 'unchanged' : current === null ? 'new' : 'modified',
      added: diff.added,
      removed: diff.removed,
      lines: diff.lines,
      truncated: diff.truncated,
      defaultSelected: !unchanged,
    })
  }

  const allowedCredMap = new Map(CREDENTIAL_FILES.map(spec => [spec.id, spec]))
  const credentials = []
  for (const item of Array.isArray(payload.credentials) ? payload.credentials : []) {
    if (!item || typeof item.id !== 'string' || typeof item.content !== 'string') continue
    const spec = allowedCredMap.get(item.id)
    if (!spec) continue
    const current = await readOptionalUtf8(join(home, spec.relPath))
    const unchanged = current === item.content
    credentials.push({
      id: spec.id,
      relPath: spec.relPath,
      status: unchanged ? 'unchanged' : current === null ? 'new' : 'modified',
      currentLines: current ? current.split('\n').length : 0,
      backupLines: item.content.split('\n').length,
      defaultSelected: false,
    })
  }

  const allItems = [...configs, ...domains, ...homeFiles, ...credentials]
  const summary = {
    total: allItems.length,
    actionable: allItems.filter(i => i.status === 'new' || i.status === 'modified').length,
    unchanged: allItems.filter(i => i.status === 'unchanged').length,
    uninstalled: allItems.filter(i => i.status === 'uninstalled').length,
    incompatible: allItems.filter(i => i.status === 'incompatible').length,
  }

  return {
    meta: {
      exportedAt: payload.exportedAt ?? null,
      source: payload.source ?? null,
      options: payload.options ?? {},
      encrypted,
      tableMode,
    },
    summary,
    configs,
    domains,
    homeFiles,
    credentials,
  }
}

export async function applyImport(ctx, request = {}) {
  const { payload } = await unwrapBundle(request.bundle, request.passphrase)
  const tableMode = request.tableMode === 'replace' ? 'replace' : 'merge'
  const shouldExpand = payload.options?.normalizeHome !== false
  const osHome = homedir()
  const expand = value => (shouldExpand ? expandHomePaths(value, osHome) : value)
  const home = ctx.profileContext.home

  const selectedConfigs = new Set(Array.isArray(request.configIds) ? request.configIds : [])
  const selectedDomains = new Set(Array.isArray(request.domainNames) ? request.domainNames : [])
  const selectedHomeFiles = new Set(Array.isArray(request.homeFileIds) ? request.homeFileIds : [])
  const selectedCredentials = new Set(Array.isArray(request.credentialIds) ? request.credentialIds : [])

  const results = []
  const restartItems = []

  const allowedHomeMap = new Map(HOME_FILES.map(spec => [spec.id, spec]))
  for (const item of Array.isArray(payload.homeFiles) ? payload.homeFiles : []) {
    if (!item || !selectedHomeFiles.has(item.id) || typeof item.content !== 'string') continue
    const spec = allowedHomeMap.get(item.id)
    if (!spec) continue
    try {
      await writeAtomic(join(home, spec.relPath), item.content, 0o644)
      results.push({ kind: 'homeFile', id: spec.id, status: 'applied' })
      if (spec.id === 'home-patch') restartItems.push(spec.relPath)
    } catch (error) {
      results.push({ kind: 'homeFile', id: spec.id, status: 'failed', message: error?.message ?? String(error) })
    }
  }

  for (const item of Array.isArray(payload.configs) ? payload.configs : []) {
    if (!item || !selectedConfigs.has(item.id) || item.id === SELF_ENTRY_ID) continue
    const entry = ctx.configEditor.entries().find(row => row.options.id === item.id)
    if (!entry) {
      results.push({ kind: 'config', id: item.id, status: 'skipped', message: 'Not installed in this profile' })
      continue
    }
    try {
      await ctx.configEditor.edit(entry, (current, inherited) => {
        const { desired } = resolveDesiredConfig(item, current, inherited, expand)
        return desired
      })
      results.push({ kind: 'config', id: item.id, status: 'applied' })
    } catch (error) {
      results.push({ kind: 'config', id: item.id, status: 'failed', message: error?.message ?? String(error) })
    }
  }

  const storageDomain = ctx.get('storageDomain')
  for (const item of Array.isArray(payload.domains) ? payload.domains : []) {
    if (!item || !selectedDomains.has(item.name)) continue
    const live = storageDomain?.get?.(item.name)
    if (!live) {
      results.push({ kind: 'domain', id: item.name, status: 'skipped', message: 'Domain is not active in this profile' })
      continue
    }
    const liveVersion = domainVersion(live)
    const compatibleVersions = live.unit?.descriptor?.compatibleVersions ?? []
    const itemVersion = Number.isInteger(item.version) ? item.version : 1
    if (itemVersion !== liveVersion && !compatibleVersions.includes(itemVersion)) {
      results.push({ kind: 'domain', id: item.name, status: 'skipped', message: `Version mismatch (backup v${itemVersion}, host v${liveVersion})` })
      continue
    }
    try {
      if (item.hasGlobal && domainHasGlobal(live) && item.global !== undefined) {
        const nextGlobal = expand(structuredClone(item.global))
        if (!deepEqual(live.global.get(), nextGlobal)) {
          await live.global.set(nextGlobal)
        }
      }
      const availableTables = new Set(domainTableNames(live))
      const backupTables = isPlainObject(item.tables) ? item.tables : {}
      for (const [tableName, records] of Object.entries(backupTables)) {
        if (!availableTables.has(tableName) || !isPlainObject(records)) continue
        const table = live.table(tableName)
        const nextRecords = expand(structuredClone(records))
        if (tableMode === 'replace') {
          const toDelete = [...table.keys()].filter(key => !Object.hasOwn(nextRecords, key))
          if (toDelete.length > 0) await table.deleteMany(toDelete)
        }
        for (const [key, value] of Object.entries(nextRecords)) {
          if (!deepEqual(table.get(key), value)) {
            await table.put(key, value)
          }
        }
      }
      results.push({ kind: 'domain', id: item.name, status: 'applied' })
      const rule = classifyDomain(item.name)
      if (rule?.restartRecommended) restartItems.push(item.name)
    } catch (error) {
      results.push({ kind: 'domain', id: item.name, status: 'failed', message: error?.message ?? String(error) })
    }
  }

  const allowedCredMap = new Map(CREDENTIAL_FILES.map(spec => [spec.id, spec]))
  for (const item of Array.isArray(payload.credentials) ? payload.credentials : []) {
    if (!item || !selectedCredentials.has(item.id) || typeof item.content !== 'string') continue
    const spec = allowedCredMap.get(item.id)
    if (!spec) continue
    try {
      await writeAtomic(join(home, spec.relPath), item.content, 0o600)
      results.push({ kind: 'credential', id: spec.id, status: 'applied' })
      restartItems.push(spec.relPath)
    } catch (error) {
      results.push({ kind: 'credential', id: spec.id, status: 'failed', message: error?.message ?? String(error) })
    }
  }

  return {
    applied: results.filter(r => r.status === 'applied').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    failed: results.filter(r => r.status === 'failed').length,
    restartRecommended: restartItems.length > 0,
    restartItems: [...new Set(restartItems)],
    results,
  }
}
