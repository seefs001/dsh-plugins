export const SKILL_NAME = 'canvas'
export const SKILL_DESCRIPTION = 'Author live interactive .canvas.tsx React apps, .canvas.html prototypes, and .canvas.svg graphics with live workspace/bot data binding, persistent state, and host actions.'
export const SKILL_WHEN_TO_USE = 'Use when Canvas mode is enabled for the session and the user would benefit from a standalone visual artifact, live dashboard, or interactive tool beside the chat.'

export const STARTER_TEMPLATE = `import {
  BarChart,
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H1,
  Pill,
  Row,
  Stack,
  Stat,
  Text,
  useCanvasAction,
  useCanvasState,
} from 'dsh/canvas'

const METRICS = [
  { label: 'Mon', requests: 1240, errors: 14 },
  { label: 'Tue', requests: 1580, errors: 11 },
  { label: 'Wed', requests: 1490, errors: 19 },
  { label: 'Thu', requests: 1820, errors: 9 },
  { label: 'Fri', requests: 2110, errors: 12 },
]

export default function StarterCanvas() {
  const [metric, setMetric] = useCanvasState<'requests' | 'errors'>('metric', 'requests')
  const dispatch = useCanvasAction()
  const totalRequests = METRICS.reduce((sum, row) => sum + row.requests, 0)
  const totalErrors = METRICS.reduce((sum, row) => sum + row.errors, 0)
  const errorRate = ((totalErrors / totalRequests) * 100).toFixed(2)

  return (
    <Stack gap={16}>
      <Row justify="space-between" wrap>
        <Stack gap={4}>
          <H1>Workspace Canvas</H1>
          <Text tone="secondary" size="small">
            Edit this .canvas.tsx file on disk or ask the agent to build a custom interactive view.
          </Text>
        </Stack>
        <Row gap={8}>
          <Button
            size="sm"
            variant={metric === 'requests' ? 'primary' : 'secondary'}
            onClick={() => setMetric('requests')}
          >
            Requests
          </Button>
          <Button
            size="sm"
            variant={metric === 'errors' ? 'primary' : 'secondary'}
            onClick={() => setMetric('errors')}
          >
            Errors
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: 'askInChat', prompt: 'Update this canvas with real metrics from the current repository.' })}
          >
            Ask in chat
          </Button>
        </Row>
      </Row>

      <Grid columns={3} gap={12}>
        <Card>
          <CardBody>
            <Stat label="Total Requests" value={totalRequests.toLocaleString()} detail="5-day sample" />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat label="Errors" value={totalErrors} detail="HTTP 5xx" tone="warning" />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat label="Error Rate" value={\`\${errorRate}%\`} detail="Target < 1.0%" tone="positive" />
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader
          title={metric === 'requests' ? 'Daily Request Volume' : 'Daily Error Volume'}
          trailing={<Pill tone={metric === 'requests' ? 'info' : 'warning'}>{metric}</Pill>}
        />
        <CardBody>
          <BarChart
            data={METRICS}
            series={[{ key: metric, label: metric === 'requests' ? 'Requests' : 'Errors', tone: metric === 'requests' ? 'primary' : 'negative' }]}
            xLabel="Day"
            yLabel={metric === 'requests' ? 'Requests (count)' : 'Errors (count)'}
            caption="Source: Starter sample data"
          />
        </CardBody>
      </Card>
    </Stack>
  )
}
`

export const REPO_RADAR_TEMPLATE = `import React from 'react'
import { GitBranch, Play, RefreshCw, Terminal } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Grid,
  H1,
  KeyValue,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasAction,
  useHostData,
} from 'dsh/canvas'

export default function RepoRadar() {
  const git = useHostData('git')
  const schedules = useHostData('schedules')
  const dispatch = useCanvasAction()
  const info = git.data

  return (
    <Stack gap={16}>
      <Row justify="space-between" wrap>
        <Stack gap={4}>
          <Row gap={8} align="center">
            <GitBranch size={18} />
            <H1>Repository Radar</H1>
          </Row>
          <Text tone="secondary" size="small">Live git status, worktrees, and active DSH schedules.</Text>
        </Stack>
        <Button size="sm" variant="secondary" onClick={() => { git.refresh(); schedules.refresh() }}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </Row>

      <Grid columns={3} gap={12}>
        <Card><CardBody><Stat label="Branch" value={info?.branch || 'n/a'} /></CardBody></Card>
        <Card><CardBody><Stat label="Uncommitted" value={info?.dirtyCount ?? 0} tone={(info?.dirtyCount ?? 0) > 0 ? 'warning' : 'positive'} /></CardBody></Card>
        <Card><CardBody><Stat label="Worktrees" value={info?.worktrees.length ?? 0} /></CardBody></Card>
      </Grid>

      <Card>
        <CardHeader title="Changed Files" trailing={<Terminal size={15} />} />
        <CardBody>
          {!info?.files.length ? (
            <EmptyState icon="CheckCircle2" title="Working tree clean" description="No uncommitted changes detected." />
          ) : (
            <Table
              rows={info.files.map((f, idx) => ({ id: idx, status: f.status, path: f.path }))}
              columns={[
                { key: 'status', label: 'Status', mono: true },
                {
                  key: 'path',
                  label: 'Path',
                  mono: true,
                  render: (_value, row) => (
                    <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'openFile', path: row.path })}>
                      {row.path}
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Active Schedules" />
        <CardBody>
          {!(schedules.data?.length) ? (
            <Text tone="secondary" size="small">No schedules configured.</Text>
          ) : (
            <KeyValue
              columns={2}
              items={schedules.data.map(task => ({
                key: task.id,
                label: task.title,
                value: (
                  <Row justify="space-between" align="center">
                    <Pill tone={task.status === 'active' ? 'success' : 'neutral'}>{task.scheduledAtLocal || task.status}</Pill>
                    <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'triggerSchedule', taskId: task.id })}>
                      <Play size={12} /> Run
                    </Button>
                  </Row>
                ),
              }))}
            />
          )}
        </CardBody>
      </Card>
    </Stack>
  )
}
`

export const HTML_PROTOTYPE_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Interactive HTML Artifact</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 24px; background: var(--cv-bg, #111318); color: var(--cv-text, #eceff4); }
    .card { max-width: 680px; margin: 0 auto; padding: 20px; border-radius: 12px; background: var(--cv-surface, #171a21); border: 1px solid var(--cv-border, rgba(255,255,255,0.12)); }
    button { margin-top: 12px; padding: 8px 14px; border-radius: 8px; border: none; background: var(--cv-accent, #4f8ff7); color: #fff; cursor: pointer; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Interactive HTML Artifact</h1>
    <p>Edit this <code>.canvas.html</code> file to build self-contained offline HTML/CSS/JS prototypes.</p>
    <button id="btn">Clicked 0 times</button>
  </div>
  <script>
    let count = 0
    const btn = document.getElementById('btn')
    btn.addEventListener('click', () => {
      count += 1
      btn.textContent = 'Clicked ' + count + ' times'
    })
  </script>
</body>
</html>
`

export const CANVAS_TEMPLATES = [
  { id: 'starter', title: 'Workspace Metrics', kind: 'react', slug: 'overview', description: 'Starter dashboard with charts, stats, and persistent state.', source: STARTER_TEMPLATE },
  { id: 'repo-radar', title: 'Repository Radar', kind: 'react', slug: 'repo-radar', description: 'Live Git status, worktrees, and DSH schedules for the current repo.', source: REPO_RADAR_TEMPLATE },
  { id: 'html-prototype', title: 'HTML Artifact Prototype', kind: 'html', slug: 'prototype', description: 'Self-contained offline .canvas.html interactive prototype.', source: HTML_PROTOTYPE_TEMPLATE },
]

export const SKILL_CONTENT = `# DSH Canvas Authoring Guide

Canvas renders live interactive artifacts beside a DSH conversation.

## Supported Formats
- \`.canvas.tsx\` (default): TypeScript React app compiled with strict TS checks and live data hooks.
- \`.canvas.html\`: Self-contained offline HTML/CSS/JS prototype (no external script tags or network calls).
- \`.canvas.svg\`: Standalone vector diagram (no inline scripts or event handlers).

## Imports & Sandbox Rules (.canvas.tsx)
1. Allowed imports: \`'dsh/canvas'\`, \`'react'\`, and \`'lucide-react'\` (curated offline icon set).
2. Must \`export default function MyCanvas() { ... }\`.
3. Forbidden: \`fetch\`, \`XMLHttpRequest\`, \`WebSocket\`, \`EventSource\`, \`eval\`, \`Function\`, \`Worker\`, dynamic \`import()\`, \`require()\`.
4. Always use \`canvas_write\` to save and verify artifacts.

## Live Data Hooks (0-token reactive updates)
- \`useCanvasFile(uri, { parse?: 'auto' | 'json' | 'text' | 'markdown' | 'lines' })\`
- \`useCanvasGlob(pattern, { parse?, frontmatter?, limit? })\`
  - Allowed URI schemes: \`workspace://<relPath>\` and \`bots://<relPath>\` (\`~/.dsh/bots/\`).
  - Host watches subscribed directories and pushes updates automatically whenever files change on disk.
- \`useHostData('sessions' | 'schedules' | 'git')\`
  - Live DSH sessions, scheduled tasks, and workspace Git status/worktrees.
- \`useCanvasState(key, defaultValue)\` persists UI state across reloads; read it with \`canvas_state\`.

## Host Actions (\`useCanvasAction()\`)
- \`{ type: 'openFile', path, line?, column? }\`
- \`{ type: 'askInChat', prompt }\`
- \`{ type: 'copyText', text }\`
- \`{ type: 'patchData', uri, mode?: 'merge' | 'replace' | 'upsertItem' | 'removeItem', ... }\` (writes allowed only under \`bots://<bot>/ledger/*.{json,md}\` or \`workspace://.dsh/canvas-data/*.{json,md}\`)
- \`{ type: 'sendToSession', sessionId, prompt, mode?: 'queue' | 'steer' }\`
- \`{ type: 'triggerSchedule', taskId }\`
- \`{ type: 'openCanvas', path }\`

## Rich Components & Styling
- Layout & Typography: \`Stack\`, \`Row\`, \`Grid\`, \`SplitPane\`, \`Spacer\`, \`Divider\`, \`H1\`–\`H3\`, \`Text\`, \`Code\`, \`Link\`.
- Surfaces & Feedback: \`Card\`, \`CardHeader\`, \`CardBody\`, \`Callout\`, \`CollapsibleSection\`, \`Modal\`, \`Drawer\`, \`EmptyState\`, \`Pill\`, \`Stat\`, \`Swatch\`, \`ProgressBar\`, \`KeyValue\`, \`Timeline\`.
- Interactive & Artifacts: \`Button\`, \`IconButton\`, \`TextInput\`, \`SearchInput\`, \`TextArea\`, \`Select\`, \`Checkbox\`, \`Toggle\`, \`Tabs\`, \`Table\`, \`Kanban\`, \`Markdown\`, \`CodeBlock\`, \`DiffView\`, \`DiffStats\`, \`TodoList\`, \`TodoListCard\`, \`DAGView\`, \`Icon\`.
- Charts: \`BarChart\`, \`LineChart\`, \`PieChart\`, \`UsageBar\`.
- Offline utility classes are also available in \`className\` (\`flex\`, \`flex-col\`, \`grid\`, \`gap-2..6\`, \`p-2..6\`, \`rounded\`, \`rounded-lg\`, \`border\`, \`bg-surface\`, \`text-sm\`, \`text-muted\`, \`font-mono\`, \`w-full\`, \`items-center\`, \`justify-between\`, \`truncate\`).
`

export function buildSystemPromptSection() {
  return [
    '## Canvas Mode',
    'Canvas mode is enabled for this session. Use `canvas_write` (and `canvas_check` / `canvas_state`) to create or update live interactive artifacts beside the chat.',
    '- Workspace artifacts default to `.dsh/canvases/<name>.canvas.tsx` relative to the session working directory (supports `.canvas.tsx`, `.canvas.html`, `.canvas.svg`).',
    '- React canvases may import from `dsh/canvas`, `react`, and `lucide-react`, and can subscribe to live data via `useCanvasFile`, `useCanvasGlob`, and `useHostData`.',
    '- Load the `canvas` skill before authoring a complex artifact to review all components, live data hooks, and host actions.',
  ].join('\n')
}
