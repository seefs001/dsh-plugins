export const DOMAIN_RULES = {
  roles: {
    category: 'plugin',
    defaultSelected: true,
    includeGlobal: true,
    includeTables: [],
    restartRecommended: true,
    noteKey: 'rolesLibrary',
  },
  cheat_sheet: {
    category: 'plugin',
    defaultSelected: true,
    includeGlobal: true,
    includeTables: [],
    restartRecommended: false,
    noteKey: 'cheatSheetPins',
  },
  pi_tools_defaults: {
    category: 'plugin',
    defaultSelected: true,
    includeGlobal: false,
    includeTables: ['presets'],
    restartRecommended: false,
    noteKey: 'piToolsPresets',
  },
  prompt_shortcut: {
    category: 'plugin',
    defaultSelected: true,
    includeGlobal: true,
    includeTables: [],
    restartRecommended: false,
    noteKey: 'promptShortcuts',
  },
  acp_workbench: {
    category: 'plugin',
    defaultSelected: true,
    includeGlobal: true,
    includeTables: ['providers'],
    restartRecommended: true,
    noteKey: 'acpProviders',
  },
  paseo_hub: {
    category: 'plugin',
    defaultSelected: true,
    includeGlobal: true,
    includeTables: [],
    restartRecommended: true,
    noteKey: 'paseoPairing',
  },
  workspace: {
    category: 'host',
    defaultSelected: true,
    includeGlobal: true,
    includeTables: '*',
    restartRecommended: true,
    noteKey: 'workspacePaths',
  },
  schedule: {
    category: 'host',
    defaultSelected: true,
    includeGlobal: true,
    includeTables: '*',
    restartRecommended: true,
    noteKey: 'scheduleJobs',
  },
  session_groups: {
    category: 'optional',
    defaultSelected: false,
    includeGlobal: true,
    includeTables: [],
    restartRecommended: false,
    noteKey: 'sessionIds',
  },
}

export const EXCLUDED_DOMAINS = new Set([
  'session_projcache',
  'dsh-context',
  'auto_review_log',
  'message_actions',
  'forge_panel_change_requests',
  'canvas',
])

const EXCLUDED_DOMAIN_RE = /(?:cache|projcache|_log$|^log_|summary)/i

export const HOME_FILES = [
  { id: 'agents-md', relPath: 'AGENTS.md', defaultSelected: true },
  { id: 'home-patch', relPath: 'cordis.patch.yml', defaultSelected: true },
]

export const CREDENTIAL_FILES = [
  { id: 'credentials-yaml', relPath: '.credentials.yaml' },
  { id: 'dotenv', relPath: '.env' },
]

export function classifyDomain(name) {
  if (EXCLUDED_DOMAINS.has(name)) return null
  if (Object.hasOwn(DOMAIN_RULES, name)) return DOMAIN_RULES[name]
  if (EXCLUDED_DOMAIN_RE.test(name)) return null
  return {
    category: 'other',
    defaultSelected: false,
    includeGlobal: true,
    includeTables: '*',
    restartRecommended: true,
    noteKey: 'unknownDomain',
  }
}

export function discoverOpenDomains(storageDomain) {
  if (!storageDomain || typeof storageDomain.get !== 'function') return new Map()
  const names = new Set(Object.keys(DOMAIN_RULES))
  // external: DomainFacility exposes open domain names on its Map field in DSH 0.2.3
  if (storageDomain.domains && typeof storageDomain.domains.keys === 'function') {
    for (const key of storageDomain.domains.keys()) names.add(key)
  }
  const found = new Map()
  for (const name of [...names].toSorted()) {
    const domain = storageDomain.get(name)
    if (domain) found.set(name, domain)
  }
  return found
}

export function domainHasGlobal(domain) {
  return Boolean(domain?.globalHandle !== undefined)
}

export function domainTableNames(domain) {
  if (domain?.tables && typeof domain.tables.keys === 'function') {
    return [...domain.tables.keys()].toSorted()
  }
  const descriptorTables = domain?.unit?.descriptor?.tables
  if (Array.isArray(descriptorTables)) return [...descriptorTables].toSorted()
  return []
}

export function domainVersion(domain) {
  const version = domain?.unit?.descriptor?.version
  return Number.isInteger(version) ? version : 1
}

export function selectDomainTables(rule, availableTables) {
  if (rule.includeTables === '*') return [...availableTables]
  if (!Array.isArray(rule.includeTables)) return []
  const available = new Set(availableTables)
  return rule.includeTables.filter(table => available.has(table))
}
