import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { loadClient } from '../../../test-utils/load-client.js'

const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const primitives = {
  DisclosureRow: () => null,
  FileTypeIcon: () => null,
  IconInspectOutlineRegular: () => null,
  Tag: () => null,
  TextShimmer: () => null,
}

test('work-timeline client registers under package name and parses work_update/work_read rows', () => {
  const { id, plugin } = loadClient(clientPath, { '@deepseek-ai/dsh-client-ui-primitives': primitives })
  assert.equal(id, 'dsh-work-timeline')
  const { workRowState, parseWorkUpdate, parseWorkRead, revisionDeltaSummary } = plugin._internal

  assert.equal(workRowState('preparing', {}), 'preparing')
  assert.equal(workRowState('start', { callId: 'c1' }), 'running')
  assert.equal(workRowState('result', { kind: 'tool-result', isError: false }), 'ok')
  assert.equal(workRowState('result', { kind: 'tool-result', isError: true }), 'error')
  assert.equal(workRowState('result', { kind: 'tool-result', isError: true, error: { code: 'interrupted' } }), 'stopped')

  const update = parseWorkUpdate('result', {
    kind: 'tool-result',
    isError: false,
    call: { argsRaw: JSON.stringify({ action: 'replace', reason: 'Step 1 done' }) },
    meta: {
      dshWorkTimeline: {
        version: 1,
        changed: true,
        work: {
          id: 'w1',
          revision: 2,
          reason: 'Step 1 done',
          snapshot: {
            title: 'Ship release',
            objective: 'Finish checks',
            status: 'active',
            outcome: '',
            steps: [{ id: 's1', content: 'Run tests', status: 'completed', blocker: '', outcome: 'All pass' }],
            artifacts: [],
          },
        },
      },
    },
    content: [{ type: 'text', text: '{}' }],
  })
  assert.equal(update.action, 'replace')
  assert.equal(update.revision, 2)
  assert.equal(update.changed, true)
  assert.equal(update.snapshot.title, 'Ship release')

  const read = parseWorkRead('result', {
    kind: 'tool-result',
    isError: false,
    content: [{
      type: 'text',
      text: JSON.stringify({
        current: { id: 'w1', revision: 3, snapshot: { title: 'Audit', objective: 'Check', status: 'active', steps: [], artifacts: [] } },
        history: [{ revision: 1 }, { revision: 2 }],
      }),
    }],
  })
  assert.equal(read.current.revision, 3)
  assert.equal(read.historyCount, 2)

  const t = (key, params) => `${key}:${params?.n ?? ''}`
  assert.equal(
    revisionDeltaSummary({ steps: [{ kind: 'added' }, { kind: 'updated' }], artifacts: [{ kind: 'added' }] }, t),
    'tool.addedCount:2 · tool.updatedCount:1',
  )
})
