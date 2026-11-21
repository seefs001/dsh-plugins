import React from 'react'
import { useHostTheme } from './context.js'
import { computeDAGLayout } from './dag.js'
import { colorPalette } from './tokens.js'

export function mergeStyle(...styles) {
  return Object.assign({}, ...styles.filter(Boolean))
}

function toneColors(tone, theme) {
  if (tone === 'success' || tone === 'positive') {
    return { fg: theme.categories.green.fg, bg: theme.categories.green.bg, border: theme.categories.green.border }
  }
  if (tone === 'warning' || tone === 'warn') {
    return { fg: theme.categories.amber.fg, bg: theme.categories.amber.bg, border: theme.categories.amber.border }
  }
  if (tone === 'error' || tone === 'negative') {
    return { fg: theme.categories.red.fg, bg: theme.categories.red.bg, border: theme.categories.red.border }
  }
  if (tone === 'info' || tone === 'accent') {
    return { fg: theme.categories.blue.fg, bg: theme.categories.blue.bg, border: theme.categories.blue.border }
  }
  return { fg: theme.text.secondary, bg: theme.fill.secondary, border: theme.stroke.secondary }
}

export function Stack({ gap = 12, align, justify, padding, style, children }) {
  return (
    <div style={mergeStyle({ display: 'flex', flexDirection: 'column', gap, alignItems: align, justifyContent: justify, padding, minWidth: 0 }, style)}>
      {children}
    </div>
  )
}

export function Row({ gap = 10, align = 'center', justify, wrap = false, style, children }) {
  return (
    <div style={mergeStyle({ display: 'flex', flexDirection: 'row', gap, alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : 'nowrap', minWidth: 0 }, style)}>
      {children}
    </div>
  )
}

export function Grid({ columns = 2, gap = 12, minColumnWidth, style, children }) {
  const template = minColumnWidth
    ? `repeat(auto-fit, minmax(${typeof minColumnWidth === 'number' ? `${minColumnWidth}px` : minColumnWidth}, 1fr))`
    : typeof columns === 'number'
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns
  return <div style={mergeStyle({ display: 'grid', gridTemplateColumns: template, gap, minWidth: 0 }, style)}>{children}</div>
}

export function Spacer({ size = 12, flex }) {
  if (flex) return <div style={{ flex: typeof flex === 'number' ? flex : 1 }} />
  return <div style={{ width: size, height: size, flex: 'none' }} />
}

export function Divider({ spacing = 12, style }) {
  const theme = useHostTheme()
  return <hr style={mergeStyle({ border: 0, borderTop: `1px solid ${theme.stroke.tertiary}`, margin: `${spacing}px 0`, width: '100%' }, style)} />
}

export function H1({ style, children }) {
  const theme = useHostTheme()
  return <h1 style={mergeStyle({ margin: 0, fontSize: theme.typography.h1, lineHeight: '28px', fontWeight: 600, color: theme.text.primary, letterSpacing: '-0.015em' }, style)}>{children}</h1>
}

export function H2({ style, children }) {
  const theme = useHostTheme()
  return <h2 style={mergeStyle({ margin: 0, fontSize: theme.typography.h2, lineHeight: '22px', fontWeight: 600, color: theme.text.primary, letterSpacing: '-0.01em' }, style)}>{children}</h2>
}

export function H3({ style, children }) {
  const theme = useHostTheme()
  return <h3 style={mergeStyle({ margin: 0, fontSize: theme.typography.h3, lineHeight: '20px', fontWeight: 600, color: theme.text.primary }, style)}>{children}</h3>
}

export function Text({ size = 'body', tone = 'primary', weight = 'regular', mono = false, style, children }) {
  const theme = useHostTheme()
  const fontSize = size === 'small' ? theme.typography.small : size === 'micro' ? theme.typography.micro : theme.typography.body
  const color = tone === 'secondary'
    ? theme.text.secondary
    : tone === 'tertiary'
      ? theme.text.tertiary
      : tone === 'accent'
        ? theme.accent.primary
        : tone === 'success'
          ? theme.status.success
          : tone === 'warning'
            ? theme.status.warn
            : tone === 'error'
              ? theme.status.error
              : theme.text.primary
  const fontWeight = weight === 'semibold' ? 600 : weight === 'medium' ? 500 : 400
  return (
    <span style={mergeStyle({ fontSize, lineHeight: size === 'micro' ? '16px' : '19px', color, fontWeight, fontFamily: mono ? theme.typography.mono : theme.typography.sans }, style)}>
      {children}
    </span>
  )
}

export function Code({ block = false, style, children }) {
  const theme = useHostTheme()
  if (block) {
    return (
      <pre style={mergeStyle({ margin: 0, padding: '10px 12px', borderRadius: theme.radius.sm, background: theme.fill.tertiary, border: `1px solid ${theme.stroke.tertiary}`, fontFamily: theme.typography.mono, fontSize: 12, lineHeight: '18px', color: theme.text.primary, overflowX: 'auto' }, style)}>
        <code>{children}</code>
      </pre>
    )
  }
  return (
    <code style={mergeStyle({ padding: '1px 5px', borderRadius: theme.radius.xs, background: theme.fill.secondary, fontFamily: theme.typography.mono, fontSize: '0.92em', color: theme.text.primary }, style)}>
      {children}
    </code>
  )
}

export function Link({ href, onClick, style, children }) {
  const theme = useHostTheme()
  const handleClick = event => {
    if (onClick) {
      event.preventDefault()
      onClick(event)
    }
  }
  return (
    <a
      href={href ?? '#'}
      onClick={handleClick}
      rel="noreferrer noopener"
      style={mergeStyle({ color: theme.text.link, textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }, style)}
    >
      {children}
    </a>
  )
}

export function Card({ variant = 'default', size = 'md', style, children }) {
  const theme = useHostTheme()
  const isBorderless = variant === 'borderless'
  return (
    <section
      style={mergeStyle(
        {
          borderRadius: size === 'sm' ? theme.radius.sm : theme.radius.md,
          background: isBorderless ? theme.fill.tertiary : theme.bg.chrome,
          border: isBorderless ? 'none' : `1px solid ${theme.stroke.secondary}`,
          overflow: 'hidden',
          minWidth: 0,
        },
        style,
      )}
    >
      {children}
    </section>
  )
}

export function CardHeader({ title, subtitle, trailing, style, children }) {
  const theme = useHostTheme()
  return (
    <div style={mergeStyle({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${theme.stroke.tertiary}` }, style)}>
      <div style={{ minWidth: 0, flex: '1 1 auto' }}>
        {title ? <div style={{ fontSize: 13, fontWeight: 600, color: theme.text.primary, lineHeight: '18px' }}>{title}</div> : null}
        {subtitle ? <div style={{ fontSize: 11, color: theme.text.tertiary, lineHeight: '16px', marginTop: 2 }}>{subtitle}</div> : null}
        {children}
      </div>
      {trailing ? <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>{trailing}</div> : null}
    </div>
  )
}

export function CardBody({ padding = 14, style, children }) {
  return <div style={mergeStyle({ padding, minWidth: 0 }, style)}>{children}</div>
}

export function Callout({ tone = 'info', title, style, children }) {
  const theme = useHostTheme()
  const palette = toneColors(tone, theme)
  return (
    <div
      style={mergeStyle(
        {
          padding: '10px 12px',
          borderRadius: theme.radius.sm,
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          color: theme.text.primary,
          fontSize: 12.5,
          lineHeight: '19px',
        },
        style,
      )}
    >
      {title ? <div style={{ fontWeight: 600, color: palette.fg, marginBottom: children ? 4 : 0 }}>{title}</div> : null}
      {children ? <div style={{ color: theme.text.secondary }}>{children}</div> : null}
    </div>
  )
}

export function CollapsibleSection({ title, subtitle, trailing, defaultOpen = false, style, children }) {
  const theme = useHostTheme()
  const [open, setOpen] = React.useState(Boolean(defaultOpen))
  return (
    <div style={mergeStyle({ borderTop: `1px solid ${theme.stroke.tertiary}` }, style)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 0',
          border: 0,
          background: 'transparent',
          color: theme.text.primary,
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
        }}
      >
        <span style={{ fontSize: 10, color: theme.text.tertiary, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' }}>▶</span>
        <span style={{ flex: '1 1 auto', minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
          {subtitle ? <span style={{ fontSize: 12, color: theme.text.tertiary, marginLeft: 8 }}>{subtitle}</span> : null}
        </span>
        {trailing ? <span style={{ flex: 'none' }}>{trailing}</span> : null}
      </button>
      {open ? <div style={{ paddingBottom: 12 }}>{children}</div> : null}
    </div>
  )
}

export function Pill({ tone = 'neutral', size = 'sm', style, children }) {
  const theme = useHostTheme()
  const palette = toneColors(tone, theme)
  return (
    <span
      style={mergeStyle(
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: size === 'md' ? '2px 9px' : '1px 7px',
          borderRadius: theme.radius.full,
          fontSize: size === 'md' ? 12 : 11,
          lineHeight: '17px',
          fontWeight: 500,
          color: palette.fg,
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          whiteSpace: 'nowrap',
        },
        style,
      )}
    >
      {children}
    </span>
  )
}

export function Stat({ label, value, detail, tone = 'neutral', style }) {
  const theme = useHostTheme()
  const valueColor = tone === 'positive' || tone === 'success'
    ? theme.status.success
    : tone === 'negative' || tone === 'error'
      ? theme.status.error
      : tone === 'warning' || tone === 'warn'
        ? theme.status.warn
        : tone === 'accent'
          ? theme.accent.primary
          : theme.text.primary
  return (
    <div style={mergeStyle({ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }, style)}>
      <span style={{ fontSize: 11, color: theme.text.tertiary, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 20, lineHeight: '24px', fontWeight: 600, color: valueColor, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {detail ? <span style={{ fontSize: 11, color: theme.text.secondary }}>{detail}</span> : null}
    </div>
  )
}

export function Swatch({ color = 'blue', size = 10, label, style }) {
  const theme = useHostTheme()
  const fill = color in colorPalette ? colorPalette[color] : color
  return (
    <span style={mergeStyle({ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.text.secondary }, style)}>
      <span style={{ width: size, height: size, borderRadius: 2, background: fill, flex: 'none' }} />
      {label ? <span>{label}</span> : null}
    </span>
  )
}

export function Button({ variant = 'secondary', size = 'md', disabled = false, onClick, style, children }) {
  const theme = useHostTheme()
  const isPrimary = variant === 'primary'
  const isGhost = variant === 'ghost'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={mergeStyle(
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          height: size === 'sm' ? 26 : 31,
          padding: size === 'sm' ? '0 9px' : '0 12px',
          borderRadius: theme.radius.sm,
          fontSize: size === 'sm' ? 12 : 12.5,
          fontWeight: 500,
          fontFamily: theme.typography.sans,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          background: isPrimary ? theme.accent.control : isGhost ? 'transparent' : theme.fill.secondary,
          color: isPrimary ? theme.text.onAccent : theme.text.primary,
          border: isPrimary ? `1px solid ${theme.accent.control}` : isGhost ? '1px solid transparent' : `1px solid ${theme.stroke.secondary}`,
          whiteSpace: 'nowrap',
        },
        style,
      )}
    >
      {children}
    </button>
  )
}

export function IconButton({ label, disabled = false, onClick, style, children }) {
  const theme = useHostTheme()
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={mergeStyle(
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          padding: 0,
          borderRadius: theme.radius.sm,
          border: `1px solid ${theme.stroke.secondary}`,
          background: theme.fill.tertiary,
          color: theme.text.secondary,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      )}
    >
      {children}
    </button>
  )
}

export function TextInput({ value, onChange, placeholder, label, disabled = false, style }) {
  const theme = useHostTheme()
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '1 1 auto' }}>
      {label ? <span style={{ fontSize: 11, color: theme.text.tertiary, fontWeight: 500 }}>{label}</span> : null}
      <input
        type="text"
        value={value ?? ''}
        disabled={disabled}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        style={mergeStyle(
          {
            height: 30,
            padding: '0 9px',
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.stroke.secondary}`,
            background: theme.bg.editor,
            color: theme.text.primary,
            fontSize: 12.5,
            fontFamily: theme.typography.sans,
            outline: 'none',
          },
          style,
        )}
      />
    </label>
  )
}

export function TextArea({ value, onChange, placeholder, label, rows = 3, disabled = false, style }) {
  const theme = useHostTheme()
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, width: '100%' }}>
      {label ? <span style={{ fontSize: 11, color: theme.text.tertiary, fontWeight: 500 }}>{label}</span> : null}
      <textarea
        value={value ?? ''}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        style={mergeStyle(
          {
            padding: '7px 9px',
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.stroke.secondary}`,
            background: theme.bg.editor,
            color: theme.text.primary,
            fontSize: 12.5,
            fontFamily: theme.typography.sans,
            resize: 'vertical',
            outline: 'none',
          },
          style,
        )}
      />
    </label>
  )
}

export function Select({ value, onChange, options = [], label, disabled = false, style }) {
  const theme = useHostTheme()
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      {label ? <span style={{ fontSize: 11, color: theme.text.tertiary, fontWeight: 500 }}>{label}</span> : null}
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        style={mergeStyle(
          {
            height: 30,
            padding: '0 8px',
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.stroke.secondary}`,
            background: theme.bg.editor,
            color: theme.text.primary,
            fontSize: 12.5,
            fontFamily: theme.typography.sans,
            cursor: disabled ? 'not-allowed' : 'pointer',
          },
          style,
        )}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label ?? opt.value}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Checkbox({ checked = false, onChange, label, disabled = false, style }) {
  const theme = useHostTheme()
  return (
    <label style={mergeStyle({ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: theme.text.primary, cursor: disabled ? 'not-allowed' : 'pointer' }, style)}>
      <input type="checkbox" checked={Boolean(checked)} disabled={disabled} onChange={e => onChange?.(e.target.checked)} style={{ accentColor: theme.accent.control, margin: 0 }} />
      {label ? <span>{label}</span> : null}
    </label>
  )
}

export function Toggle({ checked = false, onChange, label, disabled = false, style }) {
  const theme = useHostTheme()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      style={mergeStyle({ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, padding: 0, background: 'transparent', color: theme.text.primary, fontSize: 12.5, cursor: disabled ? 'not-allowed' : 'pointer' }, style)}
    >
      <span
        style={{
          width: 30,
          height: 17,
          borderRadius: 999,
          padding: 2,
          background: checked ? theme.accent.control : theme.fill.primary,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          transition: 'background 120ms',
        }}
      >
        <span style={{ width: 13, height: 13, borderRadius: 999, background: theme.text.onAccent }} />
      </span>
      {label ? <span>{label}</span> : null}
    </button>
  )
}

export function Tabs({ value, onChange, items = [], style }) {
  const theme = useHostTheme()
  return (
    <div role="tablist" style={mergeStyle({ display: 'inline-flex', gap: 2, padding: 2, borderRadius: theme.radius.sm, background: theme.fill.secondary, border: `1px solid ${theme.stroke.tertiary}` }, style)}>
      {items.map(item => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(item.value)}
            style={{
              height: 26,
              padding: '0 10px',
              borderRadius: theme.radius.xs,
              border: 0,
              font: 'inherit',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              background: active ? theme.bg.editor : 'transparent',
              color: active ? theme.text.primary : theme.text.secondary,
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function Table({ columns = [], rows = [], sortable = false, compact = false, caption, style }) {
  const theme = useHostTheme()
  const [sort, setSort] = React.useState(null)

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows
    const { key, dir } = sort
    return rows.toSorted((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (av === bv) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [rows, sort])

  if (columns.length === 0 || rows.length === 0) return null

  const toggleSort = key => {
    setSort(prev => (prev && prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  const rowBg = tone => {
    if (tone === 'positive' || tone === 'success') return theme.categories.green.bg
    if (tone === 'warning' || tone === 'warn') return theme.categories.amber.bg
    if (tone === 'negative' || tone === 'error') return theme.categories.red.bg
    if (tone === 'accent' || tone === 'info') return theme.categories.blue.bg
    return 'transparent'
  }

  const pad = compact ? '5px 8px' : '8px 10px'

  return (
    <div style={mergeStyle({ width: '100%', overflowX: 'auto' }, style)}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, lineHeight: '18px' }}>
        <thead>
          <tr>
            {columns.map(col => {
              const canSort = col.sortable ?? sortable
              const isSorted = sort?.key === col.key
              return (
                <th
                  key={col.key}
                  onClick={canSort ? () => toggleSort(col.key) : undefined}
                  style={{
                    padding: pad,
                    textAlign: col.align ?? 'left',
                    fontWeight: 600,
                    fontSize: 11.5,
                    color: theme.text.tertiary,
                    borderBottom: `1px solid ${theme.stroke.secondary}`,
                    whiteSpace: 'nowrap',
                    cursor: canSort ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                  {isSorted ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => (
            <tr key={row.id ?? idx} style={{ background: rowBg(row._tone) }}>
              {columns.map(col => {
                const raw = row[col.key]
                const content = col.render ? col.render(raw, row) : raw
                return (
                  <td
                    key={col.key}
                    style={{
                      padding: pad,
                      textAlign: col.align ?? 'left',
                      color: theme.text.primary,
                      borderBottom: `1px solid ${theme.stroke.tertiary}`,
                      fontFamily: col.mono ? theme.typography.mono : undefined,
                      fontVariantNumeric: col.align === 'right' ? 'tabular-nums' : undefined,
                    }}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {caption ? <div style={{ fontSize: 11, color: theme.text.tertiary, marginTop: 6 }}>{caption}</div> : null}
    </div>
  )
}

export function DiffStats({ added = 0, removed = 0, style }) {
  const theme = useHostTheme()
  return (
    <span style={mergeStyle({ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontFamily: theme.typography.mono }, style)}>
      <span style={{ color: theme.diff.addedText }}>+{added}</span>
      <span style={{ color: theme.diff.removedText }}>-{removed}</span>
    </span>
  )
}

export function DiffView({ lines = [], style }) {
  const theme = useHostTheme()
  if (!Array.isArray(lines) || lines.length === 0) return null
  return (
    <div style={mergeStyle({ width: '100%', overflowX: 'auto', fontFamily: theme.typography.mono, fontSize: 12, lineHeight: '19px' }, style)}>
      {lines.map((line, idx) => {
        const isAdd = line.type === 'added'
        const isDel = line.type === 'removed'
        const isHunk = line.type === 'hunk'
        const bg = isAdd ? theme.diff.addedBg : isDel ? theme.diff.removedBg : isHunk ? theme.fill.secondary : 'transparent'
        const fg = isAdd ? theme.diff.addedText : isDel ? theme.diff.removedText : isHunk ? theme.text.tertiary : theme.text.primary
        const prefix = isAdd ? '+' : isDel ? '-' : isHunk ? '@' : ' '
        return (
          <div key={idx} style={{ display: 'flex', background: bg, color: fg, minWidth: 'max-content' }}>
            <span style={{ width: 42, padding: '0 6px', textAlign: 'right', color: theme.text.quaternary, userSelect: 'none', flex: 'none' }}>{line.oldLine ?? ''}</span>
            <span style={{ width: 42, padding: '0 6px', textAlign: 'right', color: theme.text.quaternary, userSelect: 'none', flex: 'none' }}>{line.newLine ?? ''}</span>
            <span style={{ width: 18, textAlign: 'center', userSelect: 'none', flex: 'none' }}>{prefix}</span>
            <span style={{ whiteSpace: 'pre', paddingRight: 12 }}>{line.content}</span>
          </div>
        )
      })}
    </div>
  )
}

export function TodoList({ items = [], onToggle, style }) {
  const theme = useHostTheme()
  if (items.length === 0) return null
  const badge = status => {
    if (status === 'completed') return { mark: '✓', color: theme.status.success }
    if (status === 'in_progress') return { mark: '●', color: theme.accent.primary }
    if (status === 'blocked') return { mark: '!', color: theme.status.warn }
    if (status === 'canceled') return { mark: '×', color: theme.text.quaternary }
    return { mark: '○', color: theme.text.tertiary }
  }
  return (
    <ul style={mergeStyle({ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }, style)}>
      {items.map(item => {
        const b = badge(item.status)
        const done = item.status === 'completed' || item.status === 'canceled'
        return (
          <li key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, lineHeight: '18px' }}>
            <button
              type="button"
              disabled={!onToggle}
              onClick={() => onToggle?.(item)}
              style={{ border: 0, padding: 0, background: 'transparent', color: b.color, fontSize: 13, lineHeight: '18px', width: 16, textAlign: 'center', cursor: onToggle ? 'pointer' : 'default', flex: 'none' }}
            >
              {b.mark}
            </button>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <span style={{ color: done ? theme.text.tertiary : theme.text.primary, textDecoration: done ? 'line-through' : 'none' }}>{item.label}</span>
              {item.detail ? <div style={{ fontSize: 11.5, color: theme.text.tertiary, marginTop: 1 }}>{item.detail}</div> : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function TodoListCard({ title = 'Checklist', items = [], onToggle, style }) {
  const done = items.filter(i => i.status === 'completed').length
  return (
    <Card style={style}>
      <CardHeader title={title} trailing={<Pill tone={done === items.length && items.length > 0 ? 'success' : 'neutral'}>{done}/{items.length}</Pill>} />
      <CardBody>
        <TodoList items={items} onToggle={onToggle} />
      </CardBody>
    </Card>
  )
}

export function DAGView({ nodes = [], edges = [], direction = 'TB', nodeWidth = 168, nodeHeight = 54, onNodeClick, style }) {
  const theme = useHostTheme()
  const layout = React.useMemo(
    () => computeDAGLayout(nodes, edges, { direction, nodeWidth, nodeHeight }),
    [nodes, edges, direction, nodeWidth, nodeHeight],
  )
  if (layout.nodes.length === 0) return null
  const markerId = React.useId()
  return (
    <div style={mergeStyle({ width: '100%', overflowX: 'auto' }, style)}>
      <svg width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ display: 'block', maxWidth: '100%', height: 'auto' }}>
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
            <path d="M 0 0 L 7 3.5 L 0 7 z" fill={theme.stroke.primary} />
          </marker>
        </defs>
        {layout.edges.map((edge, idx) => (
          <g key={`${edge.from}-${edge.to}-${idx}`}>
            <path d={edge.path} fill="none" stroke={theme.stroke.primary} strokeWidth={1.5} markerEnd={`url(#${markerId})`} />
            {edge.label ? (
              <text x={(edge.x1 + edge.x2) / 2} y={(edge.y1 + edge.y2) / 2 - 4} textAnchor="middle" fill={theme.text.tertiary} fontSize={10}>
                {edge.label}
              </text>
            ) : null}
          </g>
        ))}
        {layout.nodes.map(node => {
          const palette = node.tone ? toneColors(node.tone, theme) : { fg: theme.text.primary, bg: theme.bg.chrome, border: theme.stroke.secondary }
          return (
            <g
              key={node.id}
              onClick={onNodeClick ? () => onNodeClick(node) : undefined}
              style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            >
              <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={theme.radius.sm} fill={palette.bg} stroke={palette.border} strokeWidth={1.25} />
              <text x={node.cx} y={node.subtitle ? node.cy - 4 : node.cy + 4} textAnchor="middle" fill={palette.fg} fontSize={12} fontWeight={600} fontFamily={theme.typography.sans}>
                {node.label}
              </text>
              {node.subtitle ? (
                <text x={node.cx} y={node.cy + 13} textAnchor="middle" fill={theme.text.tertiary} fontSize={10.5} fontFamily={theme.typography.sans}>
                  {node.subtitle}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
