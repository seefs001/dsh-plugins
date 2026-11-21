export const SKILL_NAME = 'canvas'
export const SKILL_DESCRIPTION = 'Author live interactive .canvas.tsx React artifacts in the workspace for analytical reports, data visualizations, tables, audits, and interactive tools.'
export const SKILL_WHEN_TO_USE = 'Use when Canvas mode is enabled for the session and the user would benefit from a standalone visual or interactive artifact beside the chat.'

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

export function buildSystemPromptSection(cwd) {
  const dir = cwd ? `${cwd.replace(/\/+$/, '')}/.dsh/canvases/` : '.dsh/canvases/'
  return [
    'Canvas mode is enabled for this session.',
    `When producing a standalone analytical report, visual breakdown, interactive explorer, architecture graph, or large structured table that benefits from living beside the chat, author a single \`.canvas.tsx\` file under \`${dir}<slug>.canvas.tsx\` (or use \`canvas_write\`).`,
    'Canvas files must import ONLY from `dsh/canvas`, default-export a React component, inline all real data, and make zero network calls.',
    'After writing or editing a `.canvas.tsx` file, check diagnostics (returned directly by `canvas_write` or via `canvas_check`) and fix any TypeScript or policy errors before concluding.',
    'Load the `canvas` skill for complete `dsh/canvas` SDK components, hooks, and visual design guidelines.',
  ].join('\n')
}

export const SKILL_CONTENT = `# DSH Canvas Authoring Guide

A Canvas is a single \`.canvas.tsx\` React component file stored in the workspace (default: \`<cwd>/.dsh/canvases/<kebab-name>.canvas.tsx\`) that DSH compiles, type-checks, and renders live in a sandboxed side panel beside the conversation.

## When to create a Canvas

Use a Canvas for standalone visual or interactive deliverables:
- Quantitative analyses, benchmarks, latency/cost breakdowns, trend charts
- Security audits, architecture reviews, dependency DAGs, categorized findings
- Large sortable/filterable tables or diff comparisons
- Interactive checklists, triage boards, or repeatable explorers

Skip a Canvas for short factual answers, normal code edits, or intermediate tool steps.

## Hard File Rules (enforced by compiler)

1. Single \`.canvas.tsx\` file per canvas — no helper modules or CSS files.
2. Import **only** from \`'dsh/canvas'\`. No relative imports, no npm packages, no Node built-ins.
3. Default-export the top-level React component function.
4. Inline all data directly in the file. **No \`fetch()\`, \`XMLHttpRequest\`, \`WebSocket\`, \`EventSource\`, \`eval\`, or dynamic \`import()\`**.
5. Always verify TypeScript diagnostics via \`canvas_write\` (auto-checks) or \`canvas_check\` and fix every error before finishing.

## Design Guidelines

- **Flat, minimal, purposeful**: no gradients, no box-shadows, no emojis as UI icons or bullets, no decorative colored borders everywhere.
- **Visual hierarchy**: one primary element stands out; mix open sections with cards rather than wrapping every block in identical cards.
- **Theme tokens only**: read colors from \`useHostTheme()\` (\`theme.bg.editor\`, \`theme.text.secondary\`, \`theme.stroke.secondary\`, \`theme.accent.primary\`, \`theme.fill.tertiary\`) instead of hardcoded hex values.
- **Self-describing charts**: include a specific metric title, axis labels with units, legend for multi-series, and a source/time-range caption.
- **No empty states**: never render placeholder or zeroed data; omit empty sections.

## \`dsh/canvas\` Public SDK Surface

### React & Host Hooks
- React: \`Fragment\`, \`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`, \`useRef\`, \`useReducer\`
- \`useHostTheme()\`: returns \`{ kind, bg: { editor, chrome, elevated }, text: { primary, secondary, tertiary, quaternary, link, onAccent }, fill: { primary, secondary, tertiary, quaternary }, stroke: { primary, secondary, tertiary }, accent: { primary, control }, status: { success, warn, error, info }, diff: { addedBg, addedText, removedBg, removedText }, categories, radius, typography, chart: { palette, sequence } }\`
- \`useCanvasState<T>(key, defaultValue)\`: persistent React state synced to Host storage (survives reloads & hot edits; readable by agent via \`canvas_state\`)
- \`useCanvasAction()\`: returns \`dispatch(action)\` with:
  - \`{ type: 'openFile', path: string, line?: number, column?: number }\`
  - \`{ type: 'askInChat', prompt: string }\`
  - \`{ type: 'copyText', text: string }\`

### Layout, Surfaces & Typography
- Layout: \`Stack\`, \`Row\`, \`Grid\`, \`Spacer\`, \`Divider\`, \`mergeStyle\`
- Typography: \`H1\`, \`H2\`, \`H3\`, \`Text\` (\`size\`: \`'body'|'small'|'micro'\`, \`tone\`: \`'primary'|'secondary'|'tertiary'|'accent'|'success'|'warning'|'error'\`, \`weight\`: \`'regular'|'medium'|'semibold'\`, \`mono\`), \`Code\` (\`block?\`), \`Link\`
- Surfaces: \`Card\` (\`variant\`: \`'default'|'borderless'\`, \`size\`: \`'sm'|'md'\`), \`CardHeader\` (\`title\`, \`subtitle\`, \`trailing\`), \`CardBody\`, \`Callout\` (\`tone\`: \`'info'|'success'|'warning'|'error'|'neutral'\`), \`CollapsibleSection\`
- Indicators: \`Pill\` (\`tone\`: \`'neutral'|'info'|'accent'|'success'|'positive'|'warning'|'warn'|'error'|'negative'\`), \`Stat\` (\`label\`, \`value\`, \`detail?\`, \`tone?\`), \`Swatch\`

### Forms & Navigation
- \`Button\` (\`variant\`: \`'primary'|'secondary'|'ghost'\`, \`size\`: \`'sm'|'md'\`), \`IconButton\`
- \`TextInput\`, \`TextArea\`, \`Select\` (\`options: { value, label? }[]\`), \`Checkbox\`, \`Toggle\`, \`Tabs\` (\`items: { value, label }[]\`)

### Data Visualization & Domain Components
- \`Table\`: \`columns: { key, label, align?, sortable?, mono?, render? }[]\`, \`rows\`, \`sortable?\`, \`compact?\`, \`caption?\`
- \`BarChart\`: \`data\`, \`series?: { key, label?, color?, tone? }[]\`, \`title\`, \`xLabel\`, \`yLabel\`, \`stacked?\`, \`horizontal?\`, \`referenceLines?\`, \`caption\`
- \`LineChart\`: \`data\`, \`series?\`, \`title\`, \`xLabel\`, \`yLabel\`, \`area?\`, \`referenceLines?\`, \`caption\`
- \`PieChart\`: \`data: { label, value, color?, tone? }[]\`, \`title\`, \`donut?\`, \`size?\`, \`caption\`
- \`UsageBar\`: \`segments: { label, value, color?, displayValue? }[]\`, \`total?\`, \`title?\`, \`showLegend?\`
- \`DiffView\` (\`lines: { type: 'context'|'added'|'removed'|'hunk', content, oldLine?, newLine? }[]\`), \`DiffStats\` (\`added\`, \`removed\`)
- \`TodoList\`, \`TodoListCard\` (\`items: { id, label, status: 'pending'|'in_progress'|'blocked'|'completed'|'canceled', detail? }[]\`)
- \`DAGView\` (\`nodes: { id, label, subtitle?, tone? }[]\`, \`edges: { from, to, label? }[]\`, \`direction?: 'TB'|'LR'\`, \`onNodeClick?\`) and \`computeDAGLayout\`
`
