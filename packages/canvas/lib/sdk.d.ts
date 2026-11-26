declare const React: {
  createElement: (...args: any[]) => CanvasReactElement
  Fragment: (props: { children?: CanvasReactNode }) => CanvasReactElement | null
}

declare namespace JSX {
  type Element = CanvasReactElement
  interface ElementChildrenAttribute {
    children: {}
  }
  interface IntrinsicAttributes {
    key?: string | number | null
  }
  interface IntrinsicElements {
    [elemName: string]: Record<string, any>
  }
}

interface CanvasReactElement {
  type: any
  props: any
  key: string | number | null
}

type CanvasReactNode =
  | CanvasReactElement
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly CanvasReactNode[]

type CanvasCSSProperties = Record<string, string | number | undefined>

type CanvasRefObject<T> = { current: T }

declare module 'dsh/canvas' {
  export type CSSProperties = CanvasCSSProperties
  export type ReactNode = CanvasReactNode
  export type ReactElement = CanvasReactElement
  export type RefObject<T> = CanvasRefObject<T>

  export const Fragment: (props: { children?: ReactNode }) => ReactElement | null

  export function useState<S>(initialState: S | (() => S)): [S, (action: S | ((prev: S) => S)) => void]
  export function useState<S = undefined>(): [S | undefined, (action: S | undefined | ((prev: S | undefined) => S | undefined)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly unknown[]): T
  export function useRef<T>(initialValue: T): RefObject<T>
  export function useRef<T = undefined>(): RefObject<T | undefined>
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void]

  export type Color = 'blue' | 'indigo' | 'violet' | 'teal' | 'green' | 'amber' | 'orange' | 'red' | 'pink' | 'slate'

  export interface CategoryTone {
    readonly fg: string
    readonly bg: string
    readonly border: string
  }

  export type CategoryPalette = Record<Color, CategoryTone>

  export interface ChartPalette {
    readonly primary: string
    readonly secondary: string
    readonly tertiary: string
    readonly quaternary: string
    readonly positive: string
    readonly negative: string
    readonly neutral: string
    readonly grid: string
    readonly axis: string
  }

  export interface CanvasTokens {
    readonly bg: {
      readonly editor: string
      readonly chrome: string
      readonly elevated: string
    }
    readonly text: {
      readonly primary: string
      readonly secondary: string
      readonly tertiary: string
      readonly quaternary: string
      readonly link: string
      readonly onAccent: string
    }
    readonly fill: {
      readonly primary: string
      readonly secondary: string
      readonly tertiary: string
      readonly quaternary: string
    }
    readonly stroke: {
      readonly primary: string
      readonly secondary: string
      readonly tertiary: string
    }
    readonly accent: {
      readonly primary: string
      readonly control: string
    }
    readonly status: {
      readonly success: string
      readonly warn: string
      readonly error: string
      readonly info: string
    }
    readonly diff: {
      readonly addedBg: string
      readonly addedText: string
      readonly removedBg: string
      readonly removedText: string
    }
  }

  export interface CanvasHostTheme extends CanvasTokens {
    readonly kind: 'dark' | 'light'
    readonly tokens: CanvasTokens
    readonly categories: CategoryPalette
    readonly radius: {
      readonly xs: number
      readonly sm: number
      readonly md: number
      readonly lg: number
      readonly full: number
    }
    readonly typography: {
      readonly sans: string
      readonly mono: string
      readonly h1: number
      readonly h2: number
      readonly h3: number
      readonly body: number
      readonly small: number
      readonly micro: number
    }
    readonly chart: {
      readonly palette: ChartPalette
      readonly sequence: readonly string[]
    }
  }

  export type SetCanvasState<T> = (action: T | ((prev: T) => T)) => void

  export type CanvasAction =
    | { type: 'openFile'; path: string; line?: number; column?: number }
    | { type: 'askInChat'; prompt: string }
    | { type: 'copyText'; text: string }
    | {
        type: 'patchData'
        uri: string
        mode?: 'merge' | 'replace' | 'upsertItem' | 'removeItem'
        patch?: Record<string, any>
        value?: any
        item?: Record<string, any>
        id?: string | number
        listKey?: string
        idKey?: string
        content?: string
      }
    | { type: 'sendToSession'; sessionId: string; prompt: string; mode?: 'queue' | 'steer' }
    | { type: 'triggerSchedule'; taskId: string }
    | { type: 'openCanvas'; path: string }

  export interface CanvasFileOptions {
    parse?: 'auto' | 'json' | 'text' | 'markdown' | 'lines'
  }

  export interface CanvasFileResult<T = any> {
    loading: boolean
    exists: boolean
    data: T | null
    content: string
    frontmatter: Record<string, any> | null
    path: string
    relativePath: string
    mtimeMs: number
    error: string
    refresh: () => void
  }

  export interface CanvasGlobOptions {
    parse?: 'auto' | 'json' | 'text' | 'markdown' | 'lines'
    frontmatter?: boolean
    limit?: number
  }

  export interface CanvasGlobEntry<T = any> {
    uri: string
    exists: boolean
    path: string
    relativePath: string
    mtimeMs: number
    size: number
    data: T | null
    content: string
    frontmatter: Record<string, any> | null
    error: string
  }

  export interface CanvasGlobResult<T = any> {
    loading: boolean
    files: readonly CanvasGlobEntry<T>[]
    error: string
    refresh: () => void
  }

  export type HostDataSource = 'sessions' | 'schedules' | 'git'

  export interface HostSessionInfo {
    id: string
    title: string
    cwd: string
    status: string
    updatedAt: number
  }

  export interface HostScheduleInfo {
    id: string
    title: string
    status: string
    scheduledAt: string
    scheduledAtLocal: string
    targetKind: string
    targetSessionId: string
  }

  export interface HostGitInfo {
    isGit: boolean
    branch: string
    dirtyCount: number
    files: readonly { status: string; path: string }[]
    worktrees: readonly { path: string; branch: string; head: string }[]
  }

  export interface CanvasHostDataResult<T = any> {
    loading: boolean
    data: T | null
    error: string
    refresh: () => void
  }

  export function useHostTheme(): CanvasHostTheme
  export function useCanvasState<T>(key: string, defaultValue: T): [T, SetCanvasState<T>]
  export function useCanvasAction(): (action: CanvasAction) => void
  export function useCanvasFile<T = any>(uri: string, options?: CanvasFileOptions): CanvasFileResult<T>
  export function useCanvasGlob<T = any>(pattern: string, options?: CanvasGlobOptions): CanvasGlobResult<T>
  export function useHostData(source: 'sessions', params?: { cwd?: string }): CanvasHostDataResult<readonly HostSessionInfo[]>
  export function useHostData(source: 'schedules', params?: { active?: boolean }): CanvasHostDataResult<readonly HostScheduleInfo[]>
  export function useHostData(source: 'git', params?: { cwd?: string }): CanvasHostDataResult<HostGitInfo>
  export function useHostData<T = any>(source: HostDataSource, params?: Record<string, any>): CanvasHostDataResult<T>

  export const colorPalette: Record<Color, string>
  export const categoryPaletteDark: CategoryPalette
  export const categoryPaletteLight: CategoryPalette
  export const usageColorSequence: readonly Color[]
  export const canvasTokens: CanvasHostTheme
  export const canvasTokensLight: CanvasHostTheme

  export function mergeStyle(...styles: readonly (CSSProperties | undefined | false | null)[]): CSSProperties

  export interface StackProps {
    gap?: number
    align?: CSSProperties['alignItems']
    justify?: CSSProperties['justifyContent']
    padding?: number | string
    style?: CSSProperties
    children?: ReactNode
  }
  export function Stack(props: StackProps): ReactElement

  export interface RowProps {
    gap?: number
    align?: CSSProperties['alignItems']
    justify?: CSSProperties['justifyContent']
    wrap?: boolean
    style?: CSSProperties
    children?: ReactNode
  }
  export function Row(props: RowProps): ReactElement

  export interface GridProps {
    columns?: number | string
    gap?: number
    minColumnWidth?: number | string
    style?: CSSProperties
    children?: ReactNode
  }
  export function Grid(props: GridProps): ReactElement

  export function Spacer(props: { size?: number; flex?: boolean | number }): ReactElement
  export function Divider(props: { spacing?: number; style?: CSSProperties }): ReactElement

  export function H1(props: { style?: CSSProperties; children?: ReactNode }): ReactElement
  export function H2(props: { style?: CSSProperties; children?: ReactNode }): ReactElement
  export function H3(props: { style?: CSSProperties; children?: ReactNode }): ReactElement

  export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error'
  export type TextWeight = 'regular' | 'medium' | 'semibold'
  export interface TextProps {
    size?: 'body' | 'small' | 'micro'
    tone?: TextTone
    weight?: TextWeight
    mono?: boolean
    style?: CSSProperties
    children?: ReactNode
  }
  export function Text(props: TextProps): ReactElement

  export function Code(props: { block?: boolean; style?: CSSProperties; children?: ReactNode }): ReactElement
  export function Link(props: { href?: string; onClick?: () => void; style?: CSSProperties; children?: ReactNode }): ReactElement

  export type CardVariant = 'default' | 'borderless'
  export type CardSize = 'sm' | 'md'
  export function Card(props: { variant?: CardVariant; size?: CardSize; style?: CSSProperties; children?: ReactNode }): ReactElement
  export function CardHeader(props: { title?: ReactNode; subtitle?: ReactNode; trailing?: ReactNode; style?: CSSProperties; children?: ReactNode }): ReactElement
  export function CardBody(props: { padding?: number | string; style?: CSSProperties; children?: ReactNode }): ReactElement

  export type CalloutTone = 'info' | 'success' | 'warning' | 'error' | 'neutral'
  export function Callout(props: { tone?: CalloutTone; title?: ReactNode; style?: CSSProperties; children?: ReactNode }): ReactElement

  export function CollapsibleSection(props: {
    title: ReactNode
    subtitle?: ReactNode
    trailing?: ReactNode
    defaultOpen?: boolean
    style?: CSSProperties
    children?: ReactNode
  }): ReactElement

  export type PillTone = 'neutral' | 'info' | 'accent' | 'success' | 'positive' | 'warning' | 'warn' | 'error' | 'negative'
  export type PillSize = 'sm' | 'md'
  export function Pill(props: { tone?: PillTone; size?: PillSize; style?: CSSProperties; children?: ReactNode }): ReactElement

  export type StatTone = 'neutral' | 'accent' | 'positive' | 'success' | 'warning' | 'warn' | 'negative' | 'error'
  export function Stat(props: { label: string; value: ReactNode; detail?: ReactNode; tone?: StatTone; style?: CSSProperties }): ReactElement

  export function Swatch(props: { color?: Color | string; size?: number; label?: string; style?: CSSProperties }): ReactElement

  export function Button(props: {
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md'
    disabled?: boolean
    onClick?: () => void
    style?: CSSProperties
    children?: ReactNode
  }): ReactElement

  export function IconButton(props: {
    label: string
    disabled?: boolean
    onClick?: () => void
    style?: CSSProperties
    children?: ReactNode
  }): ReactElement

  export function TextInput(props: {
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    label?: string
    disabled?: boolean
    style?: CSSProperties
  }): ReactElement

  export function TextArea(props: {
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    label?: string
    rows?: number
    disabled?: boolean
    style?: CSSProperties
  }): ReactElement

  export interface SelectOption {
    value: string
    label?: string
  }
  export function Select(props: {
    value: string
    onChange?: (value: string) => void
    options: readonly SelectOption[]
    label?: string
    disabled?: boolean
    style?: CSSProperties
  }): ReactElement

  export function Checkbox(props: {
    checked: boolean
    onChange?: (checked: boolean) => void
    label?: string
    disabled?: boolean
    style?: CSSProperties
  }): ReactElement

  export function Toggle(props: {
    checked: boolean
    onChange?: (checked: boolean) => void
    label?: string
    disabled?: boolean
    style?: CSSProperties
  }): ReactElement

  export function Tabs(props: {
    value: string
    onChange?: (value: string) => void
    items: readonly { value: string; label: string }[]
    style?: CSSProperties
  }): ReactElement

  export type TableColumnAlign = 'left' | 'center' | 'right'
  export type TableRowTone = 'neutral' | 'positive' | 'success' | 'warning' | 'warn' | 'negative' | 'error' | 'accent' | 'info'
  export interface TableColumn<Row extends Record<string, any> = Record<string, any>> {
    key: string
    label: string
    align?: TableColumnAlign
    sortable?: boolean
    mono?: boolean
    render?: (value: any, row: Row) => ReactNode
  }
  export interface TableProps<Row extends Record<string, any> = Record<string, any>> {
    columns: readonly TableColumn<Row>[]
    rows: readonly (Row & { id?: string | number; _tone?: TableRowTone })[]
    sortable?: boolean
    compact?: boolean
    caption?: string
    style?: CSSProperties
  }
  export function Table<Row extends Record<string, any> = Record<string, any>>(props: TableProps<Row>): ReactElement | null

  export interface ChartSeries {
    key: string
    label?: string
    color?: Color | string
    tone?: string
  }
  export interface ChartReferenceLine {
    value: number
    label?: string
    color?: Color | string
    tone?: string
  }
  export type ChartDataPoint = Record<string, string | number | undefined>

  export interface BarChartProps {
    data: readonly ChartDataPoint[]
    series?: readonly ChartSeries[]
    title?: string
    subtitle?: string
    caption?: string
    xLabel?: string
    yLabel?: string
    height?: number
    stacked?: boolean
    horizontal?: boolean
    referenceLines?: readonly ChartReferenceLine[]
    valueFormatter?: (value: number) => string
    style?: CSSProperties
  }
  export function BarChart(props: BarChartProps): ReactElement | null

  export interface LineChartProps {
    data: readonly ChartDataPoint[]
    series?: readonly ChartSeries[]
    title?: string
    subtitle?: string
    caption?: string
    xLabel?: string
    yLabel?: string
    height?: number
    area?: boolean
    referenceLines?: readonly ChartReferenceLine[]
    valueFormatter?: (value: number) => string
    style?: CSSProperties
  }
  export function LineChart(props: LineChartProps): ReactElement | null

  export interface PieChartProps {
    data: readonly { label: string; value: number; color?: Color | string; tone?: string }[]
    title?: string
    subtitle?: string
    caption?: string
    donut?: boolean
    size?: number
    valueFormatter?: (value: number) => string
    style?: CSSProperties
  }
  export function PieChart(props: PieChartProps): ReactElement | null

  export interface UsageBarSegment {
    label: string
    value: number
    color?: Color | string
    displayValue?: string
  }
  export function UsageBar(props: {
    segments: readonly UsageBarSegment[]
    total?: number
    title?: string
    showLegend?: boolean
    height?: number
    style?: CSSProperties
  }): ReactElement | null

  export type DiffLineType = 'context' | 'added' | 'removed' | 'hunk'
  export interface DiffLineData {
    type: DiffLineType
    content: string
    oldLine?: number
    newLine?: number
  }
  export function DiffView(props: { lines: readonly DiffLineData[]; style?: CSSProperties }): ReactElement | null
  export function DiffStats(props: { added: number; removed: number; style?: CSSProperties }): ReactElement

  export type TodoStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'canceled'
  export interface TodoItem {
    id: string
    label: string
    status: TodoStatus
    detail?: string
  }
  export function TodoList(props: { items: readonly TodoItem[]; onToggle?: (item: TodoItem) => void; style?: CSSProperties }): ReactElement | null
  export function TodoListCard(props: { title?: string; items: readonly TodoItem[]; onToggle?: (item: TodoItem) => void; style?: CSSProperties }): ReactElement

  export interface DAGLayoutNode {
    id: string
    label: string
    subtitle?: string
    tone?: PillTone
    width?: number
    height?: number
  }
  export interface DAGLayoutEdge {
    from: string
    to: string
    label?: string
  }
  export interface DAGLayoutOptions {
    direction?: 'TB' | 'LR'
    nodeWidth?: number
    nodeHeight?: number
    rankGap?: number
    nodeGap?: number
    padding?: number
  }
  export interface DAGLayoutResult {
    direction: 'TB' | 'LR'
    width: number
    height: number
    nodes: readonly (DAGLayoutNode & { rank: number; x: number; y: number; cx: number; cy: number; width: number; height: number })[]
    edges: readonly (DAGLayoutEdge & { x1: number; y1: number; x2: number; y2: number; path: string })[]
    ranks: readonly { rank: number; nodes: readonly string[] }[]
  }
  export function computeDAGLayout(nodes: readonly DAGLayoutNode[], edges: readonly DAGLayoutEdge[], options?: DAGLayoutOptions): DAGLayoutResult
  export function DAGView(props: {
    nodes: readonly DAGLayoutNode[]
    edges: readonly DAGLayoutEdge[]
    direction?: 'TB' | 'LR'
    nodeWidth?: number
    nodeHeight?: number
    onNodeClick?: (node: DAGLayoutNode) => void
    style?: CSSProperties
  }): ReactElement | null

  export type IconName =
    | 'Activity' | 'AlertCircle' | 'AlertTriangle' | 'Archive'
    | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowUpRight'
    | 'Bell' | 'BookOpen' | 'Bot' | 'Bug' | 'Calendar'
    | 'Check' | 'CheckCircle2' | 'ChevronDown' | 'ChevronLeft' | 'ChevronRight' | 'ChevronUp'
    | 'Clock' | 'Code2' | 'Columns3' | 'Copy' | 'Cpu' | 'Database' | 'Download'
    | 'Edit3' | 'ExternalLink' | 'Eye' | 'EyeOff' | 'FileCode' | 'FileText' | 'Filter' | 'Flame' | 'Folder'
    | 'GitBranch' | 'GitCommit' | 'GitPullRequest' | 'Globe' | 'Inbox' | 'Info'
    | 'Layers' | 'LayoutDashboard' | 'Link2' | 'ListTodo' | 'Lock' | 'Maximize2' | 'MessageSquare' | 'Minimize2' | 'Minus' | 'MoreHorizontal'
    | 'Pause' | 'Pin' | 'Play' | 'Plus' | 'RefreshCw' | 'Search' | 'Send' | 'Settings' | 'Shield' | 'SlidersHorizontal' | 'Sparkles' | 'Square' | 'Star'
    | 'Tag' | 'Terminal' | 'Trash2' | 'Unlock' | 'Wrench' | 'X' | 'XCircle' | 'Zap'

  export const ICON_NAMES: readonly IconName[]

  export interface IconProps {
    name?: IconName
    size?: number
    color?: string
    strokeWidth?: number
    className?: string
    style?: CSSProperties
  }

  export function Icon(props: IconProps & { name: IconName }): ReactElement | null

  export function Markdown(props: { content: string; style?: CSSProperties }): ReactElement

  export function CodeBlock(props: {
    code: string
    language?: string
    showLineNumbers?: boolean
    maxHeight?: number | string
    style?: CSSProperties
  }): ReactElement

  export function Modal(props: {
    open: boolean
    title?: ReactNode
    subtitle?: ReactNode
    onClose?: () => void
    width?: number
    footer?: ReactNode
    children?: ReactNode
  }): ReactElement | null

  export function Drawer(props: {
    open: boolean
    title?: ReactNode
    subtitle?: ReactNode
    onClose?: () => void
    width?: number
    side?: 'left' | 'right'
    footer?: ReactNode
    children?: ReactNode
  }): ReactElement | null

  export function SplitPane(props: {
    left: ReactNode
    right: ReactNode
    leftWidth?: number | string
    minLeft?: number
    gap?: number
    style?: CSSProperties
  }): ReactElement

  export function EmptyState(props: {
    icon?: IconName
    title?: ReactNode
    description?: ReactNode
    action?: ReactNode
    style?: CSSProperties
  }): ReactElement

  export function ProgressBar(props: {
    value: number
    max?: number
    label?: ReactNode
    tone?: 'accent' | 'success' | 'warning' | 'error'
    height?: number
    style?: CSSProperties
  }): ReactElement

  export function SearchInput(props: {
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    style?: CSSProperties
  }): ReactElement

  export interface KeyValueItem {
    key?: string
    label: ReactNode
    value: ReactNode
  }

  export function KeyValue(props: {
    items: readonly KeyValueItem[]
    columns?: number
    style?: CSSProperties
  }): ReactElement

  export interface TimelineItem {
    id?: string
    title: ReactNode
    detail?: ReactNode
    time?: string
    tone?: 'accent' | 'success' | 'warning' | 'error'
  }

  export function Timeline(props: {
    items: readonly TimelineItem[]
    style?: CSSProperties
  }): ReactElement

  export interface KanbanColumn {
    id: string
    title: string
    tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'error'
  }

  export interface KanbanCard {
    id: string
    column: string
    title: string
    subtitle?: string
    badge?: string
    tags?: readonly string[]
    [key: string]: any
  }

  export function Kanban<T extends KanbanCard = KanbanCard>(props: {
    columns: readonly KanbanColumn[]
    items: readonly T[]
    onCardClick?: (card: T) => void
    onMove?: (card: T, toColumn: string) => void
    renderFooter?: (card: T) => ReactNode
    style?: CSSProperties
  }): ReactElement
}

declare module 'react' {
  import type {
    CSSProperties,
    ReactNode,
    ReactElement,
    RefObject,
  } from 'dsh/canvas'
  export type { CSSProperties, ReactNode, ReactElement, RefObject }
  export const Fragment: (props: { children?: ReactNode }) => ReactElement | null
  export function useState<S>(initialState: S | (() => S)): [S, (action: S | ((prev: S) => S)) => void]
  export function useState<S = undefined>(): [S | undefined, (action: S | undefined | ((prev: S | undefined) => S | undefined)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly unknown[]): T
  export function useRef<T>(initialValue: T): RefObject<T>
  export function useRef<T = undefined>(): RefObject<T | undefined>
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void]
  export function createElement(...args: any[]): ReactElement
  const ReactDefault: {
    Fragment: typeof Fragment
    useState: typeof useState
    useEffect: typeof useEffect
    useMemo: typeof useMemo
    useCallback: typeof useCallback
    useRef: typeof useRef
    useReducer: typeof useReducer
    createElement: typeof createElement
  }
  export default ReactDefault
}

declare module 'lucide-react' {
  import type { IconProps, ReactElement } from 'dsh/canvas'
  type LucideComponent = (props: Omit<IconProps, 'name'>) => ReactElement | null
  export const Activity: LucideComponent
  export const AlertCircle: LucideComponent
  export const AlertTriangle: LucideComponent
  export const Archive: LucideComponent
  export const ArrowDown: LucideComponent
  export const ArrowLeft: LucideComponent
  export const ArrowRight: LucideComponent
  export const ArrowUp: LucideComponent
  export const ArrowUpRight: LucideComponent
  export const Bell: LucideComponent
  export const BookOpen: LucideComponent
  export const Bot: LucideComponent
  export const Bug: LucideComponent
  export const Calendar: LucideComponent
  export const Check: LucideComponent
  export const CheckCircle2: LucideComponent
  export const ChevronDown: LucideComponent
  export const ChevronLeft: LucideComponent
  export const ChevronRight: LucideComponent
  export const ChevronUp: LucideComponent
  export const Clock: LucideComponent
  export const Code2: LucideComponent
  export const Columns3: LucideComponent
  export const Copy: LucideComponent
  export const Cpu: LucideComponent
  export const Database: LucideComponent
  export const Download: LucideComponent
  export const Edit3: LucideComponent
  export const ExternalLink: LucideComponent
  export const Eye: LucideComponent
  export const EyeOff: LucideComponent
  export const FileCode: LucideComponent
  export const FileText: LucideComponent
  export const Filter: LucideComponent
  export const Flame: LucideComponent
  export const Folder: LucideComponent
  export const GitBranch: LucideComponent
  export const GitCommit: LucideComponent
  export const GitPullRequest: LucideComponent
  export const Globe: LucideComponent
  export const Inbox: LucideComponent
  export const Info: LucideComponent
  export const Layers: LucideComponent
  export const LayoutDashboard: LucideComponent
  export const Link2: LucideComponent
  export const ListTodo: LucideComponent
  export const Lock: LucideComponent
  export const Maximize2: LucideComponent
  export const MessageSquare: LucideComponent
  export const Minimize2: LucideComponent
  export const Minus: LucideComponent
  export const MoreHorizontal: LucideComponent
  export const Pause: LucideComponent
  export const Pin: LucideComponent
  export const Play: LucideComponent
  export const Plus: LucideComponent
  export const RefreshCw: LucideComponent
  export const Search: LucideComponent
  export const Send: LucideComponent
  export const Settings: LucideComponent
  export const Shield: LucideComponent
  export const SlidersHorizontal: LucideComponent
  export const Sparkles: LucideComponent
  export const Square: LucideComponent
  export const Star: LucideComponent
  export const Tag: LucideComponent
  export const Terminal: LucideComponent
  export const Trash2: LucideComponent
  export const Unlock: LucideComponent
  export const Wrench: LucideComponent
  export const X: LucideComponent
  export const XCircle: LucideComponent
  export const Zap: LucideComponent
}
