/** Read-only Host directory checks; registry mutations use the native Workspace API. */
import { stat } from 'node:fs/promises'

export const name = 'workspace-manager'
export const inject = ['workspaceRegistry', 'webServer', 'connection']

/** Check only a registered path. Permission and I/O failures are not missing directories. */
async function inspect(workspace) {
  const row = { workspaceId: workspace.id, path: workspace.path }
  try {
    const entry = await stat(row.path)
    return { ...row, status: entry.isDirectory() ? 'directory' : 'not-directory' }
  } catch (error) {
    if (error.code === 'ENOENT') return { ...row, status: 'missing' }
    if (error.code === 'ENOTDIR') return { ...row, status: 'not-directory' }
    return { ...row, status: 'unavailable', code: error.code ?? 'UNKNOWN' }
  }
}

/** Register an authenticated, read-only scan of saved workspace paths. */
export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/workspace-manager/check',
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) {
        res.statusCode = rejection
        res.end()
        return
      }
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.setHeader('cache-control', 'no-store')
      if (req.method !== 'GET') {
        res.statusCode = 405
        res.setHeader('allow', 'GET')
        res.end(JSON.stringify({ message: 'GET only' }))
        return
      }
      try {
        const checks = []
        for (const workspace of ctx.workspaceRegistry.list()) checks.push(await inspect(workspace))
        res.end(JSON.stringify({ checks }))
      } catch (error) {
        res.statusCode = 503
        res.end(JSON.stringify({ message: error.message ?? String(error) }))
      }
    },
  }), 'workspace-manager: directory checks')
}
