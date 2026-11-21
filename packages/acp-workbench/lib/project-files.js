import { isAbsolute, resolve } from 'node:path'

const visibleName = name => typeof name === 'string' && !!name && !name.startsWith('.') && !/[/\\\p{Cc}]/u.test(name)
const visiblePath = path => typeof path === 'string' && !isAbsolute(path) && !/^[A-Za-z]:/u.test(path) && path.split('/').every(visibleName)

export class ProjectFiles {
  constructor(ctx) { this.ctx = ctx; this.life = new AbortController() }
  enabled() { return ['workspaceRegistry', 'workingDirectory', 'workspaceFiles', 'sessionQuery'].every(key => !!this.ctx.get(key)) }

  async run(op, signal) {
    if (!this.enabled()) throw new Error('DSH workspace file search is unavailable')
    const registry = this.ctx.get('workspaceRegistry'), files = this.ctx.get('workspaceFiles'), sessionId = op.dshSessionId
    const directory = async () => {
      signal.throwIfAborted()
      if (!registry.get(op.workspaceId)?.sessionIds.includes(sessionId) || registry.archivedSessionIds.includes(sessionId)) throw new Error('Select an active project conversation')
      const path = await this.ctx.get('sessionQuery').inspectSession(sessionId, s => this.ctx.get('workingDirectory').get(s), signal)
      if (!path || !isAbsolute(path)) throw new Error('The session has no current working directory')
      return resolve(path)
    }
    const cwd = await directory(), scope = { sessionId, workspaceRoot: cwd }
    let result
    if (op.action === 'project-file-search') {
      const query = typeof op.query === 'string' && op.query.trim()
      if (!query || query.length > 200 || /\p{Cc}/u.test(query)) throw new Error('Enter a file name or relative path, up to 200 characters')
      const { matches, truncated, incomplete } = await files.search(scope, { query, excludedPaths: [], includeHidden: false, respectGitignore: true }, signal)
      result = { cwd, paths: matches.filter(m => m.type === 'file').map(m => m.path), truncated, incomplete }
    } else if (op.action === 'project-file-directory') {
      const path = op.path
      if (path !== '' && !visiblePath(path)) throw new Error('Select a directory in this checkout')
      if ((path !== '' || op.expectedCwd !== undefined) && op.expectedCwd !== cwd) throw new Error('The session working directory changed. Reopen the checkout root.')
      const listing = await files.list(scope, path || '.', signal)
      if (listing.path !== path) throw new Error('The directory no longer resolves to this checkout path')
      result = { cwd, path, entries: listing.entries.filter(e => visibleName(e.name)), truncated: listing.truncated }
    } else if (op.action === 'project-file-locate') {
      const path = op.path
      if (op.expectedCwd !== cwd) throw new Error('The session working directory changed. Search again.')
      if (!visiblePath(path)) throw new Error('Select a file from this checkout')
      const absolute = resolve(cwd, path), stat = await files.stat(scope, path, signal)
      if (stat.absolutePath !== absolute) throw new Error('The path no longer names the same file in this checkout')
      result = { absolute }
    } else throw new Error('Unknown project file operation')
    if (await directory() !== cwd) throw new Error('The session working directory changed. Reopen the current checkout.')
    return result
  }
}
