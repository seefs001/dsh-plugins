import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Load from the running Harness only, never from another installed generation:
// the MCP client must register tools into this process's tool registry.
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
// `ws` reports the upgrade status, which tells a revoked credential (401/403)
// from a network failure. It ships with the MCP client's dependency tree.
const mcpRequire = createRequire(require.resolve('@deepseek-ai/dsh-mcp-client'))
const wsModule = await import(pathToFileURL(mcpRequire.resolve('ws')).href)

export const McpClient = mcpClient
export const Schema = schemastery.default
export const WebSocket = wsModule.WebSocket ?? wsModule.default
