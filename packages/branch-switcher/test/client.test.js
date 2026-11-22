import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const noop = () => null
const primitives = {
  DisclosureRow: noop,
  JsonBlock: noop,
  Tag: noop,
  TextShimmer: noop,
  IconBranchOutlineRegular: noop,
  IconInspectOutlineRegular: noop,
}

test('branch-switcher client uses HTTP endpoint instead of remote.commands', () => {
  const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)), {
    '@deepseek-ai/dsh-client-ui-primitives': primitives,
  })
  assert.equal(id, 'dsh-branch-switcher')
  assert.equal(typeof plugin.apply, 'function')
  assert.deepEqual([...plugin.inject], ['slots', 'locale', 'remote', 'remote.forgePanel'])
  assert.equal(plugin.inject.includes('remote.commands'), false)
})
