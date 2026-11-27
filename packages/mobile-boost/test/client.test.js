import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const { id, plugin } = loadClient(fileURLToPath(new URL('../lib/client.js', import.meta.url)))
const { STYLE_ATTR, CSS, mountStyles } = plugin._internal

test('registers under the package name', () => {
  assert.equal(id, 'dsh-mobile-boost')
  assert.deepEqual([...plugin.inject], [])
})

test('scopes all rules to mobile media query and avoids desktop changes', () => {
  assert.match(CSS, /^@media \(max-width:768px\),\(pointer:coarse\)\{/)
  assert.match(CSS, /content-visibility:auto/)
  assert.match(CSS, /--dsw-menu-backdrop-filter:none/)
  assert.match(CSS, /touch-action:manipulation/)
})

test('apply registers effect safely and mountStyles cleans up on dispose', () => {
  let effectCount = 0
  plugin.apply({
    effect(fn) {
      effectCount += 1
      fn()
    },
  })
  assert.equal(effectCount, 1)

  const appended = []
  let removed = false
  const fakeDoc = {
    createElement(tag) {
      assert.equal(tag, 'style')
      return {
        dataset: {},
        textContent: '',
        remove() { removed = true },
      }
    },
    head: {
      appendChild(node) { appended.push(node) },
    },
  }
  const dispose = mountStyles(fakeDoc)
  assert.equal(appended.length, 1)
  assert.equal(appended[0].dataset.plugin, STYLE_ATTR)
  assert.equal(appended[0].textContent, CSS)
  assert.equal(removed, false)
  dispose()
  assert.equal(removed, true)
})
