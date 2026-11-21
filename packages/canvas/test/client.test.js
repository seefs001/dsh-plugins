import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)))
const { buildSrcDoc, resolveTargetPath, fileAddress } = plugin._internal

test('registers under package name dsh-canvas', () => {
  assert.equal(id, 'dsh-canvas')
})

test('sandbox srcdoc enforces strict nonce-only CSP with zero network and zero unsafe-eval', () => {
  const html = buildSrcDoc('abc123')
  assert.match(html, /default-src 'none'/)
  assert.match(html, /script-src 'nonce-abc123'/)
  assert.match(html, /connect-src 'none'/)
  assert.ok(!html.includes('unsafe-eval'))
  assert.match(html, /<script nonce="abc123">/)
})

test('resolveTargetPath resolves workspace-relative and absolute paths cleanly', () => {
  assert.equal(resolveTargetPath('/repo', 'src/app.ts'), '/repo/src/app.ts')
  assert.equal(resolveTargetPath('/repo/', '/other/file.ts'), '/other/file.ts')
  assert.equal(
    fileAddress('s-1', '/repo/.dsh/canvases/demo.canvas.tsx'),
    'dsh-resource://file/session/s-1/%2Frepo%2F.dsh%2Fcanvases%2Fdemo.canvas.tsx'.replace(/%2F/g, '/'),
  )
})

test('built client.runtime.js chunk loads under dsh-canvas module id', () => {
  const chunk = readFileSync(fileURLToPath(new URL('../lib/client.runtime.js', import.meta.url)), 'utf8')
  assert.match(chunk, /window\.__ModuleLoader__\.load\(\{\s*id:\s*'dsh-canvas',\s*chunk:\s*'client\.runtime\.js'/)
})
