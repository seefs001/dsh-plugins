import React from 'react'
import { useCanvasAction, useHostTheme } from './context.js'
import { Icon } from './icons.jsx'

function renderInline(text, theme, dispatch) {
  const tokens = []
  const re = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g
  let last = 0
  let match
  let idx = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) tokens.push(text.slice(last, match.index))
    const raw = match[0]
    if (raw.startsWith('`')) {
      tokens.push(
        <code
          key={idx++}
          style={{
            fontFamily: theme.typography.mono,
            fontSize: '0.9em',
            padding: '1px 5px',
            borderRadius: 4,
            background: theme.bg.chrome,
            border: `1px solid ${theme.stroke.secondary}`,
            color: theme.text.primary,
          }}
        >
          {raw.slice(1, -1)}
        </code>,
      )
    } else if (raw.startsWith('**')) {
      tokens.push(<strong key={idx++} style={{ fontWeight: 600, color: theme.text.primary }}>{raw.slice(2, -2)}</strong>)
    } else if (raw.startsWith('~~')) {
      tokens.push(<del key={idx++} style={{ color: theme.text.tertiary }}>{raw.slice(2, -2)}</del>)
    } else if (raw.startsWith('*')) {
      tokens.push(<em key={idx++}>{raw.slice(1, -1)}</em>)
    } else if (raw.startsWith('[')) {
      const label = match[2]
      const href = match[3]
      const isExternal = /^https?:\/\//i.test(href)
      tokens.push(
        <button
          key={idx++}
          type="button"
          onClick={() => {
            if (isExternal) dispatch({ type: 'copyText', text: href })
            else dispatch({ type: 'openFile', path: href })
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: theme.accent.primary,
            cursor: 'pointer',
            font: 'inherit',
            textDecoration: 'underline',
          }}
          title={isExternal ? `Copy link: ${href}` : `Open ${href}`}
        >
          {label}
        </button>,
      )
    }
    last = match.index + raw.length
  }
  if (last < text.length) tokens.push(text.slice(last))
  return tokens
}

export function CodeBlock({ code, language = '', showLineNumbers = false, maxHeight, style }) {
  const theme = useHostTheme()
  const dispatch = useCanvasAction()
  const [copied, setCopied] = React.useState(false)
  const lines = String(code ?? '').split('\n')

  const copy = () => {
    dispatch({ type: 'copyText', text: String(code ?? '') })
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      style={{
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.stroke.secondary}`,
        background: theme.bg.chrome,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderBottom: `1px solid ${theme.stroke.secondary}`,
          background: theme.bg.elevated,
          fontSize: 11,
          color: theme.text.secondary,
        }}
      >
        <span style={{ fontFamily: theme.typography.mono }}>{language || 'code'}</span>
        <button
          type="button"
          onClick={copy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'transparent',
            border: 'none',
            color: theme.text.secondary,
            cursor: 'pointer',
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          <Icon name={copied ? 'Check' : 'Copy'} size={12} />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '10px 12px',
          overflow: 'auto',
          maxHeight: maxHeight ?? undefined,
          fontFamily: theme.typography.mono,
          fontSize: 12,
          lineHeight: 1.55,
          color: theme.text.primary,
        }}
      >
        {showLineNumbers
          ? lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{ minWidth: 28, textAlign: 'right', color: theme.text.tertiary, userSelect: 'none' }}>{i + 1}</span>
                <span>{line}</span>
              </div>
            ))
          : String(code ?? '')}
      </pre>
    </div>
  )
}

export function Markdown({ content, style }) {
  const theme = useHostTheme()
  const dispatch = useCanvasAction()
  const lines = String(content ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const buf = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      blocks.push(<CodeBlock key={blocks.length} code={buf.join('\n')} language={lang} />)
      continue
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const sizes = [20, 17, 15, 13.5]
      blocks.push(
        <div
          key={blocks.length}
          style={{
            fontSize: sizes[level - 1],
            fontWeight: 650,
            color: theme.text.primary,
            marginTop: level === 1 ? 4 : 10,
            marginBottom: 4,
            lineHeight: 1.35,
          }}
        >
          {renderInline(heading[2], theme, dispatch)}
        </div>,
      )
      i++
      continue
    }
    if (/^---+$|^\*\*\*+$/.test(line.trim())) {
      blocks.push(<hr key={blocks.length} style={{ border: 'none', borderTop: `1px solid ${theme.stroke.secondary}`, margin: '10px 0' }} />)
      i++
      continue
    }
    if (line.trim().startsWith('>')) {
      const buf = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      blocks.push(
        <blockquote
          key={blocks.length}
          style={{
            margin: '6px 0',
            padding: '6px 12px',
            borderLeft: `3px solid ${theme.accent.primary}`,
            background: theme.bg.chrome,
            color: theme.text.secondary,
            borderRadius: '0 6px 6px 0',
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {buf.map((item, idx) => <div key={idx}>{renderInline(item, theme, dispatch)}</div>)}
        </blockquote>,
      )
      continue
    }
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])) {
      const parseRow = row => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim())
      const headers = parseRow(line)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(parseRow(lines[i]))
        i++
      }
      blocks.push(
        <div key={blocks.length} style={{ overflowX: 'auto', border: `1px solid ${theme.stroke.secondary}`, borderRadius: theme.radius.md }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: theme.bg.chrome }}>
                {headers.map((h, hi) => (
                  <th key={hi} style={{ textAlign: 'left', padding: '7px 10px', borderBottom: `1px solid ${theme.stroke.secondary}`, color: theme.text.secondary, fontWeight: 600 }}>
                    {renderInline(h, theme, dispatch)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ borderTop: ri > 0 ? `1px solid ${theme.stroke.secondary}` : 'none' }}>
                  {headers.map((_, ci) => (
                    <td key={ci} style={{ padding: '7px 10px', color: theme.text.primary }}>
                      {renderInline(r[ci] ?? '', theme, dispatch)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line)
      const items = []
      while (i < lines.length && (/^\s*[-*+]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        const cleaned = lines[i].replace(/^\s*(?:[-*+]|\d+\.)\s+/, '')
        const task = /^\[([ xX])\]\s+(.*)$/.exec(cleaned)
        items.push(task ? { checked: task[1].toLowerCase() === 'x', text: task[2], task: true } : { text: cleaned, task: false })
        i++
      }
      const Tag = ordered ? 'ol' : 'ul'
      blocks.push(
        <Tag key={blocks.length} style={{ margin: '4px 0', paddingLeft: ordered ? 20 : 18, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, lineHeight: 1.55, color: theme.text.primary }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ listStyle: item.task ? 'none' : undefined, marginLeft: item.task ? -14 : 0, display: item.task ? 'flex' : undefined, alignItems: item.task ? 'flex-start' : undefined, gap: item.task ? 6 : undefined }}>
              {item.task && <Icon name={item.checked ? 'CheckCircle2' : 'Square'} size={14} color={item.checked ? theme.status.success : theme.text.tertiary} style={{ marginTop: 3 }} />}
              <span style={item.task && item.checked ? { textDecoration: 'line-through', color: theme.text.tertiary } : undefined}>
                {renderInline(item.text, theme, dispatch)}
              </span>
            </li>
          ))}
        </Tag>,
      )
      continue
    }
    const para = []
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('```') && !lines[i].trim().startsWith('>')) {
      para.push(lines[i])
      i++
    }
    blocks.push(
      <p key={blocks.length} style={{ margin: '4px 0', fontSize: 13.5, lineHeight: 1.6, color: theme.text.primary }}>
        {renderInline(para.join(' '), theme, dispatch)}
      </p>,
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {blocks}
    </div>
  )
}

export function Modal({ open, title, subtitle, onClose, width = 560, footer, children }) {
  const theme = useHostTheme()
  React.useEffect(() => {
    if (!open) return undefined
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.48)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: width,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.stroke.primary}`,
          background: theme.bg.editor,
          color: theme.text.primary,
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${theme.stroke.secondary}` }}>
          <div>
            {title && <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: theme.text.secondary, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={{ background: 'transparent', border: 'none', color: theme.text.secondary, cursor: 'pointer', padding: 4, borderRadius: 6 }}
            aria-label="Close"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.stroke.secondary}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function Drawer({ open, title, subtitle, onClose, width = 420, side = 'right', footer, children }) {
  const theme = useHostTheme()
  React.useEffect(() => {
    if (!open) return undefined
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: width,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: side === 'right' ? `1px solid ${theme.stroke.primary}` : 'none',
          borderRight: side === 'left' ? `1px solid ${theme.stroke.primary}` : 'none',
          background: theme.bg.editor,
          color: theme.text.primary,
          boxShadow: '0 0 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${theme.stroke.secondary}` }}>
          <div>
            {title && <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: theme.text.secondary, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={{ background: 'transparent', border: 'none', color: theme.text.secondary, cursor: 'pointer', padding: 4, borderRadius: 6 }}
            aria-label="Close"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.stroke.secondary}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function SplitPane({ left, right, leftWidth = '34%', minLeft = 220, gap = 14, style }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'stretch', flexWrap: 'wrap', ...style }}>
      <div style={{ flex: `0 1 ${leftWidth}`, minWidth: minLeft, minHeight: 0 }}>{left}</div>
      <div style={{ flex: '1 1 320px', minWidth: 260, minHeight: 0 }}>{right}</div>
    </div>
  )
}

export function EmptyState({ icon = 'Inbox', title, description, action, style }) {
  const theme = useHostTheme()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 20px',
        borderRadius: theme.radius.md,
        border: `1px dashed ${theme.stroke.primary}`,
        background: theme.bg.chrome,
        gap: 8,
        ...style,
      }}
    >
      <Icon name={icon} size={24} color={theme.text.tertiary} />
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: theme.text.primary }}>{title}</div>}
      {description && <div style={{ fontSize: 12.5, color: theme.text.secondary, maxWidth: 420, lineHeight: 1.5 }}>{description}</div>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, label, tone = 'accent', height = 8, style }) {
  const theme = useHostTheme()
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  const fill = tone === 'success' ? theme.status.success
    : tone === 'warning' ? theme.status.warn
      : tone === 'error' ? theme.status.error
        : theme.accent.primary
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: theme.text.secondary }}>
          <span>{label}</span>
          <span style={{ fontFamily: theme.typography.mono }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height, borderRadius: 999, background: theme.bg.chrome, border: `1px solid ${theme.stroke.secondary}`, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: fill, borderRadius: 999, transition: 'width 180ms ease' }} />
      </div>
    </div>
  )
}

export function SearchInput({ value = '', onChange, placeholder = 'Search...', style }) {
  const theme = useHostTheme()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 10px',
        height: 32,
        borderRadius: theme.radius.sm,
        border: `1px solid ${theme.stroke.primary}`,
        background: theme.bg.chrome,
        ...style,
      }}
    >
      <Icon name="Search" size={14} color={theme.text.tertiary} />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: theme.text.primary,
          fontSize: 12.5,
          fontFamily: theme.typography.sans,
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.('')}
          style={{ background: 'transparent', border: 'none', color: theme.text.tertiary, cursor: 'pointer', padding: 2, display: 'inline-flex' }}
          aria-label="Clear search"
        >
          <Icon name="X" size={13} />
        </button>
      )}
    </div>
  )
}

export function KeyValue({ items = [], columns = 2, style }) {
  const theme = useHostTheme()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 10, ...style }}>
      {items.map((item, idx) => (
        <div key={item.key ?? idx} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 10px', borderRadius: theme.radius.sm, background: theme.bg.chrome, border: `1px solid ${theme.stroke.secondary}` }}>
          <span style={{ fontSize: 11, color: theme.text.tertiary }}>{item.label}</span>
          <span style={{ fontSize: 13, color: theme.text.primary, fontWeight: 500, overflowWrap: 'anywhere' }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function Timeline({ items = [], style }) {
  const theme = useHostTheme()
  const toneColor = tone => (tone === 'success' ? theme.status.success
    : tone === 'warning' ? theme.status.warn
      : tone === 'error' ? theme.status.error
        : theme.accent.primary)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      {items.map((item, idx) => (
        <div key={item.id ?? idx} style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: toneColor(item.tone), flexShrink: 0 }} />
            {idx < items.length - 1 && <span style={{ width: 1.5, flex: 1, background: theme.stroke.secondary, marginTop: 4 }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.text.primary }}>{item.title}</span>
              {item.time && <span style={{ fontSize: 11, color: theme.text.tertiary, fontFamily: theme.typography.mono }}>{item.time}</span>}
            </div>
            {item.detail && <div style={{ fontSize: 12.5, color: theme.text.secondary, marginTop: 2, lineHeight: 1.5 }}>{item.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Kanban({ columns = [], items = [], onCardClick, onMove, renderFooter, style }) {
  const theme = useHostTheme()
  const toneColor = tone => (tone === 'error' ? theme.categories.red.fg
    : tone === 'warning' ? theme.categories.amber.fg
      : tone === 'success' ? theme.categories.green.fg
        : tone === 'accent' ? theme.accent.primary
          : theme.text.secondary)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, minmax(220px, 1fr))`,
        gap: 12,
        overflowX: 'auto',
        alignItems: 'start',
        ...style,
      }}
    >
      {columns.map((col, colIndex) => {
        const colItems = items.filter(item => item.column === col.id)
        return (
          <div
            key={col.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 10,
              borderRadius: theme.radius.md,
              background: theme.bg.chrome,
              border: `1px solid ${theme.stroke.secondary}`,
              minHeight: 120,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: toneColor(col.tone) }}>{col.title}</span>
              <span style={{ fontSize: 11, fontFamily: theme.typography.mono, padding: '1px 6px', borderRadius: 999, background: theme.bg.elevated, color: theme.text.secondary }}>
                {colItems.length}
              </span>
            </div>
            {colItems.length === 0 ? (
              <div style={{ padding: '14px 8px', textAlign: 'center', fontSize: 12, color: theme.text.tertiary }}>Empty</div>
            ) : (
              colItems.map(card => (
                <div
                  key={card.id}
                  onClick={() => onCardClick?.(card)}
                  style={{
                    padding: '10px 11px',
                    borderRadius: theme.radius.sm,
                    background: theme.bg.editor,
                    border: `1px solid ${theme.stroke.secondary}`,
                    cursor: onCardClick ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text.primary, lineHeight: 1.35 }}>{card.title}</span>
                    {card.badge && (
                      <span style={{ fontSize: 10.5, fontFamily: theme.typography.mono, padding: '1px 6px', borderRadius: 4, background: theme.bg.chrome, color: theme.text.secondary, flexShrink: 0 }}>
                        {card.badge}
                      </span>
                    )}
                  </div>
                  {card.subtitle && (
                    <div style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 1.45 }}>{card.subtitle}</div>
                  )}
                  {Array.isArray(card.tags) && card.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {card.tags.map((tag, ti) => (
                        <span key={ti} style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: theme.bg.chrome, color: theme.text.tertiary }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {(onMove || renderFooter) && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingTop: 4, borderTop: `1px solid ${theme.stroke.secondary}` }}>
                      <div>{renderFooter?.(card)}</div>
                      {onMove && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {colIndex > 0 && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); onMove(card, columns[colIndex - 1].id) }}
                              style={{ background: theme.bg.chrome, border: `1px solid ${theme.stroke.secondary}`, color: theme.text.secondary, borderRadius: 4, padding: '2px 5px', cursor: 'pointer', fontSize: 11 }}
                              title={`Move to ${columns[colIndex - 1].title}`}
                            >
                              ←
                            </button>
                          )}
                          {colIndex < columns.length - 1 && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); onMove(card, columns[colIndex + 1].id) }}
                              style={{ background: theme.bg.chrome, border: `1px solid ${theme.stroke.secondary}`, color: theme.text.secondary, borderRadius: 4, padding: '2px 5px', cursor: 'pointer', fontSize: 11 }}
                              title={`Move to ${columns[colIndex + 1].title}`}
                            >
                              →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}
