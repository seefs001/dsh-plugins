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

export const CHIEF_GLOBAL_TEMPLATE = `import React, { useMemo, useState } from 'react'
import { Bot, BookOpen, Calendar, Check, Columns3, Inbox, Play, RefreshCw, Send } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Grid,
  H1,
  Kanban,
  Markdown,
  Pill,
  Row,
  SearchInput,
  SplitPane,
  Stack,
  Stat,
  Tabs,
  Text,
  useCanvasAction,
  useCanvasGlob,
  useCanvasState,
  useHostData,
} from 'dsh/canvas'

interface BotItem {
  id: string
  title: string
  status: string
  question?: string
  waitFor?: string
  updatedAt?: string
  links?: { pr?: string; branch?: string }
  botSlug: string
  sourceUri: string
}

const COLUMNS = [
  { id: 'needs_you', title: 'Needs You', tone: 'error' as const },
  { id: 'working', title: 'Working', tone: 'accent' as const },
  { id: 'waiting', title: 'Waiting', tone: 'warning' as const },
  { id: 'planned', title: 'Planned', tone: 'neutral' as const },
  { id: 'done', title: 'Done', tone: 'success' as const },
]

export default function ChiefOfStaffBoard() {
  const [tab, setTab] = useCanvasState<'board' | 'wiki' | 'schedules'>('tab', 'board')
  const [query, setQuery] = useState('')
  const [selectedWiki, setSelectedWiki] = useState('')
  const dispatch = useCanvasAction()

  const itemFiles = useCanvasGlob<{ items?: BotItem[] }>('bots://*/ledger/items.json', { parse: 'json' })
  const wikiFiles = useCanvasGlob('bots://*/wiki/**/*.md', { parse: 'markdown' })
  const schedules = useHostData('schedules')
  const sessions = useHostData('sessions')

  const allItems = useMemo(() => {
    const out: BotItem[] = []
    for (const file of itemFiles.files) {
      const botSlug = file.relativePath.split('/')[0] || 'default'
      const list = Array.isArray(file.data?.items) ? file.data.items : []
      for (const raw of list) {
        if (!raw || typeof raw !== 'object') continue
        out.push({
          ...raw,
          id: String(raw.id ?? ''),
          title: String(raw.title ?? 'Untitled'),
          status: String(raw.status ?? 'planned'),
          botSlug,
          sourceUri: file.uri,
        })
      }
    }
    const q = query.trim().toLowerCase()
    if (!q) return out
    return out.filter(i => i.title.toLowerCase().includes(q) || i.botSlug.toLowerCase().includes(q))
  }, [itemFiles.files, query])

  const needsYouCount = allItems.filter(i => i.status === 'needs_you').length
  const activeCount = allItems.filter(i => i.status === 'working' || i.status === 'waiting').length
  const scheduleList = schedules.data ?? []
  const sessionList = sessions.data ?? []

  const activeWiki = wikiFiles.files.find(f => f.uri === selectedWiki) ?? wikiFiles.files[0]

  const moveItem = (card: BotItem, nextStatus: string) => {
    dispatch({
      type: 'patchData',
      uri: card.sourceUri,
      mode: 'upsertItem',
      listKey: 'items',
      item: { id: card.id, status: nextStatus, updatedAt: new Date().toISOString() },
    })
  }

  return (
    <Stack gap={16}>
      <Row justify="space-between" wrap>
        <Stack gap={4}>
          <Row gap={8} align="center">
            <Bot size={20} />
            <H1>Chief of Staff Control Plane</H1>
          </Row>
          <Text tone="secondary" size="small">
            Live view across ~/.dsh/bots/* ledgers, wikis, schedules, and sessions. Updates automatically with 0 tokens.
          </Text>
        </Stack>
        <Row gap={8}>
          <Button size="sm" variant="secondary" onClick={() => { itemFiles.refresh(); wikiFiles.refresh(); schedules.refresh(); sessions.refresh() }}>
            <RefreshCw size={13} /> Refresh
          </Button>
          <Button size="sm" variant="primary" onClick={() => dispatch({ type: 'askInChat', prompt: 'Review all needs_you items across my bots and propose next actions.' })}>
            <Send size={13} /> Triage in chat
          </Button>
        </Row>
      </Row>

      <Grid columns={4} gap={12}>
        <Card><CardBody><Stat label="Needs You" value={needsYouCount} tone={needsYouCount > 0 ? 'warning' : 'positive'} /></CardBody></Card>
        <Card><CardBody><Stat label="In Flight" value={activeCount} detail="Working / Waiting" /></CardBody></Card>
        <Card><CardBody><Stat label="Wiki Pages" value={wikiFiles.files.length} detail="Across all bots" /></CardBody></Card>
        <Card><CardBody><Stat label="Schedules" value={scheduleList.length} detail={\`\${sessionList.length} sessions\`} /></CardBody></Card>
      </Grid>

      <Row justify="space-between" wrap>
        <Tabs
          value={tab}
          onChange={v => setTab(v as 'board' | 'wiki' | 'schedules')}
          items={[
            { value: 'board', label: \`Board (\${allItems.length})\` },
            { value: 'wiki', label: \`Wiki (\${wikiFiles.files.length})\` },
            { value: 'schedules', label: \`Schedules (\${scheduleList.length})\` },
          ]}
        />
        {tab === 'board' && <SearchInput value={query} onChange={setQuery} placeholder="Filter items or bot..." style={{ width: 220 }} />}
      </Row>

      {tab === 'board' && (
        allItems.length === 0 ? (
          <EmptyState
            icon="Inbox"
            title="No ledger items found yet"
            description="Create ~/.dsh/bots/<project>/ledger/items.json (or ask Chief of Staff to bootstrap this workspace) and items will appear here live."
          />
        ) : (
          <Kanban
            columns={COLUMNS}
            items={allItems.map(item => ({
              ...item,
              column: COLUMNS.some(c => c.id === item.status) ? item.status : 'planned',
              badge: item.botSlug,
              subtitle: item.question || item.waitFor || item.links?.pr || '',
              tags: [item.id, ...(item.links?.branch ? [item.links.branch] : [])].filter(Boolean),
            }))}
            onMove={(card, toCol) => moveItem(card, toCol)}
            renderFooter={card => (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dispatch({ type: 'askInChat', prompt: \`Let us resolve item \${card.id} (\${card.botSlug}): \${card.title}\` })}
              >
                <Check size={12} /> Act
              </Button>
            )}
          />
        )
      )}

      {tab === 'wiki' && (
        wikiFiles.files.length === 0 ? (
          <EmptyState icon="BookOpen" title="No wiki pages yet" description="Pages saved under ~/.dsh/bots/<project>/wiki/*.md show up automatically." />
        ) : (
          <SplitPane
            left={
              <Card>
                <CardHeader title="Wiki Files" />
                <CardBody>
                  <Stack gap={6}>
                    {wikiFiles.files.map(file => (
                      <Button
                        key={file.uri}
                        size="sm"
                        variant={activeWiki?.uri === file.uri ? 'primary' : 'ghost'}
                        onClick={() => setSelectedWiki(file.uri)}
                        style={{ justifyContent: 'flex-start' }}
                      >
                        {file.relativePath}
                      </Button>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
            }
            right={
              <Card>
                <CardHeader
                  title={activeWiki?.relativePath || 'Select a page'}
                  trailing={activeWiki ? <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'openFile', path: activeWiki.path })}>Open file</Button> : null}
                />
                <CardBody>
                  {activeWiki ? <Markdown content={activeWiki.content} /> : <Text tone="secondary">Select a wiki page on the left.</Text>}
                </CardBody>
              </Card>
            }
          />
        )
      )}

      {tab === 'schedules' && (
        <Grid columns={2} gap={12}>
          <Card>
            <CardHeader title="Scheduled Tasks" subtitle="Click Run to execute immediately" trailing={<Calendar size={15} />} />
            <CardBody>
              {scheduleList.length === 0 ? (
                <Text tone="secondary" size="small">No schedules registered on this DSH host.</Text>
              ) : (
                <Stack gap={8}>
                  {scheduleList.map(task => (
                    <Row key={task.id} justify="space-between" align="center">
                      <Stack gap={2}>
                        <Text weight="medium">{task.title}</Text>
                        <Text tone="secondary" size="small">{task.scheduledAtLocal || task.scheduledAt || task.status}</Text>
                      </Stack>
                      <Row gap={6}>
                        <Pill tone={task.status === 'active' ? 'success' : 'neutral'}>{task.status}</Pill>
                        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'triggerSchedule', taskId: task.id })}>
                          <Play size={12} /> Run
                        </Button>
                      </Row>
                    </Row>
                  ))}
                </Stack>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Sessions" subtitle="Send a quick follow-up to any session" trailing={<Columns3 size={15} />} />
            <CardBody>
              {sessionList.length === 0 ? (
                <Text tone="secondary" size="small">No sessions found.</Text>
              ) : (
                <Stack gap={8}>
                  {sessionList.slice(0, 12).map(s => (
                    <Row key={s.id} justify="space-between" align="center">
                      <Stack gap={2}>
                        <Text weight="medium">{s.title || s.id}</Text>
                        <Text tone="secondary" size="small">{s.cwd || s.id}</Text>
                      </Stack>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dispatch({ type: 'sendToSession', sessionId: s.id, prompt: 'Report current status and any blockers.' })}
                      >
                        <Send size={12} /> Ping
                      </Button>
                    </Row>
                  ))}
                </Stack>
              )}
            </CardBody>
          </Card>
        </Grid>
      )}
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
  { id: 'chief-global', title: 'Chief of Staff Control Plane', kind: 'react', slug: 'chief-control-plane', description: 'Live global Kanban, Wiki browser, Schedules, and Sessions across ~/.dsh/bots/*.', source: CHIEF_GLOBAL_TEMPLATE },
  { id: 'repo-radar', title: 'Repository Radar', kind: 'react', slug: 'repo-radar', description: 'Live Git status, worktrees, and DSH schedules for the current repo.', source: REPO_RADAR_TEMPLATE },
  { id: 'html-prototype', title: 'HTML Artifact Prototype', kind: 'html', slug: 'prototype', description: 'Self-contained offline .canvas.html interactive prototype.', source: HTML_PROTOTYPE_TEMPLATE },
]

export const SKILL_CONTENT = `# DSH Canvas Authoring Guide

Canvas renders live interactive artifacts beside a DSH conversation or as standalone global apps under \`~/.dsh/canvases/\`.

## Supported Formats
- \`.canvas.tsx\` (default): TypeScript React app compiled with strict TS checks and live data hooks.
- \`.canvas.html\`: Self-contained offline HTML/CSS/JS prototype (no external script tags or network calls).
- \`.canvas.svg\`: Standalone vector diagram (no inline scripts or event handlers).

## Imports & Sandbox Rules (.canvas.tsx)
1. Allowed imports: \`'dsh/canvas'\`, \`'react'\`, and \`'lucide-react'\` (curated offline icon set).
2. Must \`export default function MyCanvas() { ... }\`.
3. Forbidden: \`fetch\`, \`XMLHttpRequest\`, \`WebSocket\`, \`EventSource\`, \`eval\`, \`Function\`, \`Worker\`, dynamic \`import()\`, \`require()\`.
4. Always use \`canvas_write\` to save and verify artifacts (pass \`scope: 'global'\` to write to \`~/.dsh/canvases/\`).

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
- \`{ type: 'openCanvas', path, scope?: 'workspace' | 'global' }\`

## Rich Components & Styling
- Layout & Typography: \`Stack\`, \`Row\`, \`Grid\`, \`SplitPane\`, \`Spacer\`, \`Divider\`, \`H1\`–\`H3\`, \`Text\`, \`Code\`, \`Link\`.
- Surfaces & Feedback: \`Card\`, \`CardHeader\`, \`CardBody\`, \`Callout\`, \`CollapsibleSection\`, \`Modal\`, \`Drawer\`, \`EmptyState\`, \`Pill\`, \`Stat\`, \`Swatch\`, \`ProgressBar\`, \`KeyValue\`, \`Timeline\`.
- Interactive & Artifacts: \`Button\`, \`IconButton\`, \`TextInput\`, \`SearchInput\`, \`TextArea\`, \`Select\`, \`Checkbox\`, \`Toggle\`, \`Tabs\`, \`Table\`, \`Kanban\`, \`Markdown\`, \`CodeBlock\`, \`DiffView\`, \`DiffStats\`, \`TodoList\`, \`TodoListCard\`, \`DAGView\`, \`Icon\`.
- Charts: \`BarChart\`, \`LineChart\`, \`PieChart\`, \`UsageBar\`.
- Offline utility classes are also available in \`className\` (\`flex\`, \`flex-col\`, \`grid\`, \`gap-2..6\`, \`p-2..6\`, \`rounded\`, \`rounded-lg\`, \`border\`, \`bg-surface\`, \`text-sm\`, \`text-muted\`, \`font-mono\`, \`w-full\`, \`items-center\`, \`justify-between\`, \`truncate\`).
`

export function buildSystemPromptSection(cwd) {
  const location = cwd ? `${cwd}/.dsh/canvases/<name>.canvas.tsx` : '.dsh/canvases/<name>.canvas.tsx'
  return [
    '## Canvas Mode',
    'Canvas mode is enabled for this session. Use `canvas_write` (and `canvas_check` / `canvas_state`) to create or update live interactive artifacts beside the chat.',
    `- Workspace artifacts default to \`${location}\` (supports \`.canvas.tsx\`, \`.canvas.html\`, \`.canvas.svg\`); pass \`scope: "global"\` for \`~/.dsh/canvases/\`.`,
    '- React canvases may import from `dsh/canvas`, `react`, and `lucide-react`, and can subscribe to live data via `useCanvasFile`, `useCanvasGlob`, and `useHostData`.',
    '- Load the `canvas` skill before authoring a complex artifact to review all components, live data hooks, and host actions.',
  ].join('\n')
}
