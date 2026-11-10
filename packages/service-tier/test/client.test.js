import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

test('client bundle registers under the package name', () => {
  const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)))
  assert.equal(id, 'dsh-service-tier')
  assert.equal(typeof plugin.apply, 'function')
})
