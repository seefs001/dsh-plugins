import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileCanvas, formatDiagnosticsSummary } from '../lib/compiler.js'
import { STARTER_TEMPLATE } from '../lib/skill.js'
import { computeLineDiff, normalizeSlug, resolveCanvasPath } from '../lib/workspace.js'
import { computeDAGLayout } from '../src/dag.js'

test('compiles starter template with zero TypeScript or policy errors', () => {
  const result = compileCanvas(STARTER_TEMPLATE)
  assert.equal(result.ok, true, formatDiagnosticsSummary(result.diagnostics))
  assert.equal(result.diagnostics.length, 0)
  assert.equal(typeof result.compiled, 'string')
  assert.match(result.compiled, /require\("dsh\/canvas"\)/)
})

test('rejects imports outside dsh/canvas', () => {
  const source = `
import fs from 'node:fs'
import { H1 } from 'dsh/canvas'
export default function Bad() {
  return <H1>{String(Boolean(fs))}</H1>
}
`
  const result = compileCanvas(source)
  assert.equal(result.ok, false)
  assert.equal(result.compiled, null)
  assert.ok(result.diagnostics.some(d => d.code === 'CANVAS_IMPORT'))
})

test('rejects fetch, eval, require, and dynamic import', () => {
  const source = `
import { H1 } from 'dsh/canvas'
export default function Net() {
  fetch('https://example.com')
  eval('1 + 1')
  const mod = import('./other')
  return <H1>{String(Boolean(mod))}</H1>
}
`
  const result = compileCanvas(source)
  assert.equal(result.ok, false)
  assert.equal(result.compiled, null)
  const codes = new Set(result.diagnostics.map(d => d.code))
  assert.ok(codes.has('CANVAS_FORBIDDEN_API'))
  assert.ok(codes.has('CANVAS_DYNAMIC_IMPORT'))
})

test('rejects missing default export', () => {
  const source = `
import { H1 } from 'dsh/canvas'
export function NamedOnly() {
  return <H1>Hello</H1>
}
`
  const result = compileCanvas(source)
  assert.equal(result.ok, false)
  assert.equal(result.compiled, null)
  assert.ok(result.diagnostics.some(d => d.code === 'CANVAS_DEFAULT_EXPORT'))
})

test('reports TypeScript errors for nonexistent SDK exports and invalid props', () => {
  const source = `
import { Pill, NonExistentThing, useHostTheme } from 'dsh/canvas'
export default function Broken() {
  const theme = useHostTheme()
  return (
    <div>
      <NonExistentThing />
      <Pill tone="danger">{theme.colors.bg.primary}</Pill>
    </div>
  )
}
`
  const result = compileCanvas(source)
  assert.equal(result.ok, false)
  assert.ok(result.diagnostics.some(d => d.code.startsWith('TS') && d.message.includes('NonExistentThing')))
  assert.ok(result.diagnostics.some(d => d.code.startsWith('TS') && d.message.includes('danger')))
  assert.ok(result.diagnostics.some(d => d.code.startsWith('TS') && d.message.includes('colors')))
})

test('resolveCanvasPath maps slugs into .dsh/canvases and blocks traversal', () => {
  assert.equal(
    resolveCanvasPath('/tmp/project', 'Latency Audit'),
    '/tmp/project/.dsh/canvases/Latency-Audit.canvas.tsx',
  )
  assert.equal(
    resolveCanvasPath('/tmp/project', 'reports/perf.canvas.tsx'),
    '/tmp/project/reports/perf.canvas.tsx',
  )
  assert.throws(() => resolveCanvasPath('/tmp/project', '../escape.canvas.tsx'), /within the session workspace/)
  assert.throws(() => resolveCanvasPath('/tmp/project', 'notes.tsx'), /\.canvas\.tsx/)
  assert.equal(normalizeSlug('  API_Health.canvas.tsx  '), 'API_Health')
})

test('computeLineDiff produces accurate line counts and types', () => {
  const diff = computeLineDiff('a\nb\nc', 'a\nx\nc\nd')
  assert.equal(diff.added, 2)
  assert.equal(diff.removed, 1)
  assert.ok(diff.lines.some(l => l.type === 'removed' && l.content === 'b'))
  assert.ok(diff.lines.some(l => l.type === 'added' && l.content === 'x'))
  assert.ok(diff.lines.some(l => l.type === 'added' && l.content === 'd'))
})

test('computeDAGLayout ranks nodes topologically and routes edges', () => {
  const layout = computeDAGLayout(
    [
      { id: 'ingest', label: 'Ingest' },
      { id: 'parse', label: 'Parse' },
      { id: 'store', label: 'Store' },
    ],
    [
      { from: 'ingest', to: 'parse' },
      { from: 'parse', to: 'store' },
    ],
    { direction: 'LR' },
  )
  assert.equal(layout.nodes.length, 3)
  assert.equal(layout.edges.length, 2)
  const byId = new Map(layout.nodes.map(n => [n.id, n]))
  assert.ok(byId.get('ingest').x < byId.get('parse').x)
  assert.ok(byId.get('parse').x < byId.get('store').x)
  assert.ok(layout.edges[0].path.startsWith('M '))
})
