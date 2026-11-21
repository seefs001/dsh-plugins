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

  export function useHostTheme(): CanvasHostTheme
  export function useCanvasState<T>(key: string, defaultValue: T): [T, SetCanvasState<T>]
  export function useCanvasAction(): (action: CanvasAction) => void

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
}
