import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// external: resolve DSH runtime packages from the running install so MCP client shares this process's registry
const anchor = process.env.DSH_INSTALL_DIR
  ? join(process.env.DSH_INSTALL_DIR, 'package.json')
  : process.argv[1]
if (!anchor) throw new Error('dsh-paseo-hub must run inside a DSH installation')
const require = createRequire(realpathSync(anchor))
const load = specifier => import(pathToFileURL(require.resolve(specifier)).href)

const [mcpClient, schemastery] = await Promise.all([
  load('@deepseek-ai/dsh-mcp-client'),
  load('@deepseek-ai/schemastery'),
])
// external: Node's built-in WebSocket hides HTTP upgrade status; reuse ws from dsh-mcp-client to detect 401/403 revocation
const mcpRequire = createRequire(require.resolve('@deepseek-ai/dsh-mcp-client'))
const wsModule = await import(pathToFileURL(mcpRequire.resolve('ws')).href)

export const McpClient = mcpClient
export const Schema = schemastery.default
export const WebSocket = wsModule.WebSocket ?? wsModule.default
