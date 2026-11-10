import { execFile } from 'node:child_process'
import { lstat, readFile, readdir, stat } from 'node:fs/promises'
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const REQUIRED = ['name', 'version', 'description', 'keywords', 'license', 'repository', 'type', 'exports', 'files', 'engines', 'dsh']
const DEPENDENCIES = [['dependencies', 'dependency'], ['devDependencies', 'dev'], ['peerDependencies', 'peer'], ['optionalDependencies', 'optional']]
const SKIP_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.nuxt', '.output', '.turbo', 'generated', '__generated__'])
const TEST_DIRECTORIES = new Set(['test', 'tests', '__tests__', 'spec', 'specs'])
const SOURCE_EXTENSION = /\.(?:[cm]?[jt]s|[jt]sx)$/i
const TEST_NAME = /(?:^|[._-])(?:test|spec)(?:[._-]|$)/i
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const nonempty = value => typeof value === 'string' && value.trim().length > 0
const posix = value => value.split(sep).join('/')
const errorText = error => error instanceof Error ? error.message : String(error)
const missing = error => error?.code === 'ENOENT' || error?.code === 'ENOTDIR'
const add = (findings, severity, code, message, path) => findings.push({ severity, code, message, path })
const stripLineEnd = value => value.replace(/\r?\n$/, '')

// Manifest paths must be relative to the package, not arbitrary filesystem paths.
function localPath(base, target) {
  if (!nonempty(target) || isAbsolute(target) || target.includes('\0')) return null
  const absolute = resolve(base, target)
  const rel = relative(base, absolute)
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return null
  return absolute
}

async function fileState(path) {
  try {
    const info = await stat(path)
    return { exists: info.isFile(), error: info.isFile() ? null : 'not a regular file' }
  } catch (error) {
    return { exists: false, error: missing(error) ? null : errorText(error) }
  }
}

async function requiredFile(root, base, target, findings, code, label) {
  const absolute = localPath(base, target)
  const path = absolute ? posix(relative(root, absolute)) : posix(relative(root, base))
  if (!absolute) {
    add(findings, 'error', `${code}-path`, `${label} must name a local file inside the package.`, path)
    return null
  }
  const state = await fileState(absolute)
  if (!state.exists) {
    add(findings, 'error', code, `${label} is missing or unreadable${state.error ? `: ${state.error}` : '.'}`, path)
    return null
  }
  return absolute
}

async function readText(path, root, findings, code) {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    add(findings, 'error', code, `Cannot read file: ${errorText(error)}`, posix(relative(root, path)))
    return null
  }
}

function checkManifest(manifest, plugin) {
  const { findings, directory, id } = plugin
  const path = `${directory}/package.json`
  for (const field of REQUIRED) {
    if (manifest[field] === undefined || manifest[field] === null) {
      add(findings, 'error', 'manifest-required-field', `Add required manifest field "${field}".`, path)
    }
  }
  if (manifest.name !== `dsh-${id}`) add(findings, 'error', 'manifest-name', `Package name must be "dsh-${id}".`, path)
  if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(manifest.version)) {
    add(findings, 'error', 'manifest-version', 'Set a semantic version such as "1.0.0".', path)
  }
  if (!nonempty(manifest.description)) add(findings, 'error', 'manifest-description', 'Provide a non-empty description string.', path)
  if (!nonempty(manifest.license)) add(findings, 'error', 'manifest-license', 'Provide a non-empty license string.', path)
  if (!Array.isArray(manifest.keywords) || !manifest.keywords.includes('dsh-plugin') || manifest.keywords.some(item => typeof item !== 'string')) {
    add(findings, 'error', 'manifest-keywords', 'keywords must be an array of strings including "dsh-plugin".', path)
  }
  if (!isRecord(manifest.repository) || manifest.repository.directory !== directory) {
    add(findings, 'error', 'manifest-repository', `Set repository.directory to "${directory}".`, path)
  }
  if (manifest.type !== 'module') add(findings, 'error', 'manifest-type', 'Set type to "module".', path)
  if (!Array.isArray(manifest.files) || manifest.files.some(item => typeof item !== 'string')) {
    add(findings, 'error', 'manifest-files', 'files must be an array of published file paths.', path)
  }
  if (!isRecord(manifest.engines) || !nonempty(manifest.engines.dsh)) {
    add(findings, 'error', 'manifest-dsh-engine', 'Declare a non-empty engines.dsh range.', path)
  }
  if (isRecord(manifest.engines) && manifest.engines.node !== undefined && !nonempty(manifest.engines.node)) {
    add(findings, 'error', 'manifest-node-engine', 'engines.node must be a non-empty range string when declared.', path)
  }
  if (!isRecord(manifest.dsh)) add(findings, 'error', 'manifest-dsh', 'dsh must be an object containing the bundle declaration.', path)
}

// Conditional and fallback-array branches retain their public subpath name.
function flattenExports(value, name, rows, findings, path) {
  if (typeof value === 'string') {
    rows.push({ name, target: value, exists: null })
    if (!nonempty(value)) add(findings, 'error', 'export-target-invalid', `Export "${name}" has an empty target.`, path)
  } else if (Array.isArray(value)) {
    for (const target of value) flattenExports(target, name, rows, findings, path)
  } else if (isRecord(value)) {
    for (const key of Object.keys(value).toSorted(compare)) {
      flattenExports(value[key], key.startsWith('.') ? key : name, rows, findings, path)
    }
  } else if (value !== null && value !== undefined) {
    add(findings, 'error', 'export-target-invalid', `Export "${name}" must contain strings, conditions, arrays, or null.`, path)
  }
}

async function checkExports(root, base, manifest, plugin) {
  const path = `${plugin.directory}/package.json`
  flattenExports(manifest.exports, '.', plugin.exports, plugin.findings, path)
  for (const row of plugin.exports) {
    if (row.name.includes('*') || row.target.includes('*') || !row.target.startsWith('./')) continue
    const absolute = localPath(base, row.target)
    if (!absolute) {
      row.exists = false
      add(plugin.findings, 'error', 'export-outside-package', `Export "${row.name}" must remain inside the package: ${row.target}`, path)
      continue
    }
    const state = await fileState(absolute)
    row.exists = state.exists
    if (!state.exists) {
      add(plugin.findings, 'error', 'export-missing', `Export "${row.name}" points to a missing or unreadable file: ${row.target}${state.error ? ` (${state.error})` : ''}`, posix(relative(root, absolute)))
    }
  }
  if (plugin.exports.some(row => row.name === '.')) plugin.capabilities.push('host')
}

async function checkAssets(root, base, manifest, plugin) {
  const { findings, directory } = plugin
  plugin.files.readme = Boolean(await requiredFile(root, base, 'README.md', findings, 'readme-missing', 'README.md'))
  const icon = manifest.icon === undefined ? 'icon.svg' : manifest.icon
  plugin.files.icon = Boolean(await requiredFile(root, base, icon, findings, 'icon-missing', 'Plugin icon'))
  const patch = isRecord(manifest.dsh?.bundle) ? manifest.dsh.bundle.patch : null
  const patchPath = await requiredFile(root, base, patch, findings, 'bundle-missing', 'dsh.bundle.patch')
  plugin.files.bundle = Boolean(patchPath)
  if (patchPath) {
    const source = await readText(patchPath, root, findings, 'bundle-unreadable')
    if (source !== null) {
      // Deliberately mirrors validate.mjs: this is not a full YAML parser.
      const names = [...source.matchAll(/^\s+(?:-\s+)?name:\s*(?:"([^"]*)"|'([^']*)'|([^\s#]+))/gm)].map(match => match[1] ?? match[2] ?? match[3])
      if (!names.includes(plugin.name)) {
        add(findings, 'error', 'bundle-name', `Bundle patch must contain a name row for "${plugin.name}".`, posix(relative(root, patchPath)))
      }
    }
  }

  const client = manifest.dsh?.client
  const hasClient = client !== undefined && client !== null
  const clientRows = plugin.exports.filter(row => row.name === './client')
  if (hasClient) {
    plugin.capabilities.push('web')
    if (!isRecord(client) || client.platform !== 'web') {
      add(findings, 'error', 'client-platform', 'Set dsh.client.platform to "web".', `${directory}/package.json`)
    }
    if (clientRows.length === 0) add(findings, 'error', 'client-export-missing', 'dsh.client is declared; add a "./client" export.', `${directory}/package.json`)
    for (const row of clientRows) {
      if (row.exists !== true) continue
      const source = await readText(localPath(base, row.target), root, findings, 'client-unreadable')
      if (source === null) continue
      const match = /__ModuleLoader__\.load\(\{\s*id:\s*['"]([^'"]+)['"]/.exec(source)
      if (match?.[1] !== plugin.name) {
        add(findings, 'error', 'client-bundle-id', `Client bundle must register __ModuleLoader__.load with id "${plugin.name}".`, posix(relative(root, localPath(base, row.target))))
      }
    }
  } else if (clientRows.length > 0) {
    add(findings, 'error', 'client-declaration-missing', '"./client" is exported; declare dsh.client or remove the export.', `${directory}/package.json`)
  }

  const docsPath = `apps/docs/content/docs/plugins/${plugin.id}.mdx`
  const docs = await fileState(join(root, docsPath))
  plugin.files.docs = docs.exists
  plugin.docsPath = docs.exists ? docsPath : null
  if (!docs.exists) add(findings, 'warning', 'docs-missing', `Add the conventional documentation page: ${docsPath}${docs.error ? ` (${docs.error})` : ''}`, docsPath)
}

async function checkLocales(root, base, plugin) {
  const directory = join(base, 'locale')
  let entries = []
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (!missing(error)) add(plugin.findings, 'error', 'locale-directory-unreadable', `Cannot list locales: ${errorText(error)}`, `${plugin.directory}/locale`)
  }
  const languages = entries.filter(entry => entry.isFile() && entry.name.endsWith('.json')).map(entry => entry.name.slice(0, -5)).toSorted(compare)
  for (const language of ['en', 'zh']) {
    if (!languages.includes(language)) add(plugin.findings, 'error', 'locale-missing', `Add locale/${language}.json with meta.title and meta.description.`, `${plugin.directory}/locale/${language}.json`)
  }
  const validMetas = []
  for (const language of languages) {
    const path = join(directory, `${language}.json`)
    const rel = posix(relative(root, path))
    const locale = { language, title: '', description: '', metaKeys: [] }
    plugin.locales.push(locale)
    const source = await readText(path, root, plugin.findings, 'locale-unreadable')
    if (source === null) continue
    let data
    try {
      data = JSON.parse(source)
    } catch (error) {
      add(plugin.findings, 'error', 'locale-json', `Fix invalid locale JSON: ${errorText(error)}`, rel)
      continue
    }
    if (!isRecord(data) || !isRecord(data.meta)) {
      add(plugin.findings, 'error', 'locale-meta', 'Locale must contain a meta object with title and description strings.', rel)
      continue
    }
    locale.title = typeof data.meta.title === 'string' ? data.meta.title : ''
    locale.description = typeof data.meta.description === 'string' ? data.meta.description : ''
    locale.metaKeys = Object.keys(data.meta).toSorted(compare)
    validMetas.push(JSON.stringify(locale.metaKeys))
    if (!nonempty(locale.title) || !nonempty(locale.description)) {
      add(plugin.findings, 'error', 'locale-meta', 'Provide non-empty meta.title and meta.description strings.', rel)
    }
  }
  if (new Set(validMetas).size > 1) add(plugin.findings, 'error', 'locale-meta-mismatch', 'Use the same meta keys in every locale.', `${plugin.directory}/locale`)
}

async function inventory(root, base, plugin) {
  async function walk(directory, inTests = false) {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch (error) {
      add(plugin.findings, 'warning', 'inventory-unreadable', `Source inventory is incomplete: ${errorText(error)}`, posix(relative(root, directory)))
      return
    }
    for (const entry of entries.toSorted((a, b) => compare(a.name, b.name))) {
      if (entry.isSymbolicLink()) continue
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) await walk(path, inTests || TEST_DIRECTORIES.has(entry.name))
      } else if (entry.isFile() && SOURCE_EXTENSION.test(entry.name)) {
        if (inTests || TEST_NAME.test(entry.name)) {
          plugin.testFiles += 1
        } else {
          try {
            const info = await lstat(path)
            if (info.isFile()) {
              plugin.sourceFiles += 1
              plugin.sourceBytes += info.size
            }
          } catch (error) {
            add(plugin.findings, 'warning', 'inventory-unreadable', `Source inventory is incomplete: ${errorText(error)}`, posix(relative(root, path)))
          }
        }
      }
    }
  }
  await walk(base)
}

function collectDependencies(manifest, plugin) {
  for (const [field, kind] of DEPENDENCIES) {
    const values = manifest[field]
    if (values === undefined) continue
    if (!isRecord(values)) {
      add(plugin.findings, 'error', 'dependency-map', `${field} must be an object mapping package names to range strings.`, `${plugin.directory}/package.json`)
      continue
    }
    for (const name of Object.keys(values).toSorted(compare)) {
      if (!nonempty(name) || !nonempty(values[name])) {
        add(plugin.findings, 'error', 'dependency-range', `${field}[${JSON.stringify(name)}] must contain a non-empty range string.`, `${plugin.directory}/package.json`)
        continue
      }
      plugin.dependencies.push({ name, range: values[name], kind, internal: false })
    }
  }
}

function emptyPlugin(id) {
  return {
    id, name: `dsh-${id}`, version: null, description: '', directory: `packages/${id}`,
    capabilities: [], engines: { node: null, dsh: null }, exports: [], locales: [],
    files: { readme: false, icon: false, bundle: false, docs: false }, docsPath: null,
    dependencies: [], sourceFiles: 0, sourceBytes: 0, testFiles: 0,
    changed: false, status: 'ok', findings: [],
  }
}

async function scanPackage(root, id) {
  const plugin = emptyPlugin(id)
  const base = join(root, 'packages', id)
  let manifest = {}
  let manifestName = null
  try {
    const source = await readText(join(base, 'package.json'), root, plugin.findings, 'manifest-unreadable')
    if (source !== null) {
      try {
        const data = JSON.parse(source)
        if (!isRecord(data)) throw new Error('package.json must contain a JSON object')
        manifest = data
        checkManifest(manifest, plugin)
      } catch (error) {
        add(plugin.findings, 'error', 'manifest-json', `Fix invalid package.json: ${errorText(error)}`, `${plugin.directory}/package.json`)
      }
    }
    if (nonempty(manifest.name)) plugin.name = manifestName = manifest.name
    if (typeof manifest.version === 'string') plugin.version = manifest.version
    if (typeof manifest.description === 'string') plugin.description = manifest.description
    if (nonempty(manifest.engines?.node)) plugin.engines.node = manifest.engines.node
    if (nonempty(manifest.engines?.dsh)) plugin.engines.dsh = manifest.engines.dsh
    await checkExports(root, base, manifest, plugin)
    await checkAssets(root, base, manifest, plugin)
    await checkLocales(root, base, plugin)
    collectDependencies(manifest, plugin)
    await inventory(root, base, plugin)
  } catch (error) {
    // A malformed package or a concurrently removed file must not abort its peers.
    add(plugin.findings, 'error', 'package-scan-failed', `Package scan could not finish: ${errorText(error)}`, plugin.directory)
  }
  return { plugin, manifestName }
}

async function gitOutput(root, args) {
  try {
    const { stdout } = await execFileAsync('git', ['--no-optional-locks', '-C', root, ...args], {
      encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 10000,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    })
    return stdout
  } catch {
    return null
  }
}

async function gitSnapshot(root) {
  const [prefixOutput, status, branch, head] = await Promise.all([
    gitOutput(root, ['rev-parse', '--show-prefix']),
    gitOutput(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', '.']),
    gitOutput(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']),
    gitOutput(root, ['rev-parse', '--short', 'HEAD']),
  ])
  const available = prefixOutput !== null && status !== null
  const changedFiles = []
  const changedPaths = new Set()
  const prefix = prefixOutput === null ? null : stripLineEnd(prefixOutput)
  const normalize = path => prefix === null ? null : path.startsWith(prefix) ? path.slice(prefix.length) : null
  const records = status?.split('\0') ?? []
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]
    if (!record || record.length < 4) continue
    const code = record.slice(0, 2)
    const path = normalize(record.slice(3))
    if (path !== null) {
      changedFiles.push({ path, status: code })
      changedPaths.add(path)
    }
    // Porcelain -z puts the destination first, followed by a separate source token.
    if (code.includes('R') || code.includes('C')) {
      const original = records[++index]
      if (original !== undefined) {
        const oldPath = normalize(original)
        if (oldPath !== null) changedPaths.add(oldPath)
      }
    }
  }
  changedFiles.sort((a, b) => compare(a.path, b.path) || compare(a.status, b.status))
  return {
    available,
    branch: !available || branch === null ? null : stripLineEnd(branch) || null,
    head: !available || head === null ? null : stripLineEnd(head) || null,
    dirty: changedPaths.size > 0, changedFiles, changedPaths,
  }
}

function dependencyGraph(results) {
  const byName = new Map()
  for (const { plugin, manifestName } of results) {
    if (manifestName === null) continue
    if (!byName.has(manifestName)) byName.set(manifestName, [])
    byName.get(manifestName).push(plugin.id)
  }
  for (const { plugin, manifestName } of results) {
    if (manifestName !== null && byName.get(manifestName).length > 1) {
      add(plugin.findings, 'error', 'manifest-name-duplicate', `Package name "${manifestName}" is shared by: ${byName.get(manifestName).join(', ')}.`, `${plugin.directory}/package.json`)
    }
  }
  const edges = []
  const external = new Map()
  for (const { plugin } of results) {
    for (const dependency of plugin.dependencies) {
      const { name, range, kind } = dependency
      dependency.internal = byName.has(name)
      if (dependency.internal) {
        for (const target of byName.get(name)) edges.push({ from: plugin.id, to: target, kind, range })
      } else {
        const key = JSON.stringify([name, range, kind])
        if (!external.has(key)) external.set(key, { name, range, kind, usedBy: [] })
        const group = external.get(key)
        if (!group.usedBy.includes(plugin.id)) group.usedBy.push(plugin.id)
      }
    }
  }
  edges.sort((a, b) => compare(a.from, b.from) || compare(a.to, b.to) || compare(a.kind, b.kind) || compare(a.range, b.range))
  return {
    edges,
    external: [...external.values()].toSorted((a, b) => compare(a.name, b.name) || compare(a.kind, b.kind) || compare(a.range, b.range)),
  }
}

/** Read-only static inventory. Never imports plugin code or runs package scripts. */
export async function scanRepository(root) {
  const absoluteRoot = resolve(root)
  let entries
  try {
    await readdir(absoluteRoot)
  } catch (error) {
    throw new Error(`Cannot read repository root "${absoluteRoot}": ${errorText(error)}`, { cause: error })
  }
  try {
    entries = await readdir(join(absoluteRoot, 'packages'), { withFileTypes: true })
  } catch (error) {
    throw new Error(`Cannot read packages directory "${join(absoluteRoot, 'packages')}": ${errorText(error)}`, { cause: error })
  }
  const findings = []
  let name = basename(absoluteRoot)
  try {
    const manifest = JSON.parse(await readFile(join(absoluteRoot, 'package.json'), 'utf8'))
    if (!isRecord(manifest)) throw new Error('package.json must contain a JSON object')
    if (nonempty(manifest.name)) name = manifest.name
  } catch (error) {
    if (!missing(error)) add(findings, 'warning', 'repository-manifest', `Cannot read root package metadata; using directory name: ${errorText(error)}`, 'package.json')
  }
  const git = await gitSnapshot(absoluteRoot)
  if (!git.available) {
    add(findings, 'info', 'git-unavailable', 'Git status is unavailable (Git may be missing, this may not be a repository, or the status command failed). Working-tree cleanliness and changed-package inventory are unknown.', null)
  }
  const results = []
  for (const entry of entries.toSorted((a, b) => compare(a.name, b.name))) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue
    try {
      await lstat(join(absoluteRoot, 'packages', entry.name, 'package.json'))
    } catch (error) {
      if (missing(error)) continue
      // The path is present but inaccessible: keep it as a broken package entry.
    }
    const result = await scanPackage(absoluteRoot, entry.name)
    const { plugin } = result
    const docs = `apps/docs/content/docs/plugins/${plugin.id}.mdx`
    plugin.changed = [...git.changedPaths].some(path => path.startsWith(`${plugin.directory}/`) || path === plugin.directory || path === docs)
    results.push(result)
  }
  const dependencies = dependencyGraph(results)
  const plugins = results.map(({ plugin }) => {
    plugin.findings.sort((a, b) => compare(a.severity, b.severity) || compare(a.code, b.code) || compare(a.path ?? '', b.path ?? '') || compare(a.message, b.message))
    plugin.status = plugin.findings.some(item => item.severity === 'error') ? 'error' : plugin.findings.some(item => item.severity === 'warning') ? 'warning' : 'ok'
    return plugin
  })
  const allFindings = [...findings, ...plugins.flatMap(plugin => plugin.findings)]
  return {
    schemaVersion: 1, generatedAt: new Date().toISOString(), root: absoluteRoot,
    repository: { name, branch: git.branch, head: git.head, dirty: git.dirty, changedFiles: git.changedFiles },
    summary: {
      packages: plugins.length,
      errors: allFindings.filter(item => item.severity === 'error').length,
      warnings: allFindings.filter(item => item.severity === 'warning').length,
      host: plugins.filter(plugin => plugin.capabilities.includes('host')).length,
      web: plugins.filter(plugin => plugin.capabilities.includes('web')).length,
      documented: plugins.filter(plugin => plugin.files.docs).length,
      changed: plugins.filter(plugin => plugin.changed).length,
    },
    plugins, dependencies, findings,
  }
}