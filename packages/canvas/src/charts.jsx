import React from 'react'
import { useHostTheme } from './context.js'
import { colorPalette, usageColorSequence } from './tokens.js'

function formatTick(value) {
  if (!Number.isFinite(value)) return ''
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
  if (abs >= 10_000) return `${(value / 1_000).toFixed(0)}k`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(Math.abs(value) < 10 ? 2 : 1)
}

function niceMax(rawMax) {
  if (!Number.isFinite(rawMax) || rawMax <= 0) return 1
  const exp = Math.floor(Math.log10(rawMax))
  const base = 10 ** exp
  const frac = rawMax / base
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10
  return nice * base
}

function resolveColor(tone, index, theme) {
  if (typeof tone === 'string') {
    if (tone in theme.chart.palette) return theme.chart.palette[tone]
    if (tone in colorPalette) return colorPalette[tone]
    if (tone.startsWith('#') || tone.startsWith('rgb') || tone.startsWith('hsl')) return tone
  }
  return theme.chart.sequence[index % theme.chart.sequence.length]
}

function ChartHeader({ title, subtitle, legend, theme }) {
  if (!title && !subtitle && (!legend || legend.length === 0)) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px 12px', marginBottom: 10 }}>
      <div>
        {title ? <div style={{ fontSize: 13, fontWeight: 600, color: theme.text.primary, lineHeight: '18px' }}>{title}</div> : null}
        {subtitle ? <div style={{ fontSize: 11, color: theme.text.tertiary, lineHeight: '16px', marginTop: 2 }}>{subtitle}</div> : null}
      </div>
      {legend && legend.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px' }}>
          {legend.map(item => (
            <span key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: theme.text.secondary }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flex: 'none' }} />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ChartCaption({ caption, theme }) {
  if (!caption) return null
  return <div style={{ fontSize: 11, color: theme.text.tertiary, marginTop: 8, lineHeight: '16px' }}>{caption}</div>
}

export function BarChart({
  data = [],
  series,
  title,
  subtitle,
  caption,
  xLabel,
  yLabel,
  height = 240,
  stacked = false,
  horizontal = false,
  referenceLines = [],
  valueFormatter,
  style,
}) {
  const theme = useHostTheme()
  const [hovered, setHovered] = React.useState(null)

  const resolvedSeries = React.useMemo(() => {
    if (Array.isArray(series) && series.length > 0) {
      return series.map((s, idx) => ({
        key: s.key,
        label: s.label ?? s.key,
        color: resolveColor(s.color ?? s.tone, idx, theme),
      }))
    }
    return [{ key: 'value', label: yLabel || 'Value', color: theme.chart.sequence[0] }]
  }, [series, theme, yLabel])

  if (!Array.isArray(data) || data.length === 0) return null

  const formatVal = valueFormatter ?? formatTick
  const rawMax = data.reduce((max, row) => {
    if (stacked) {
      const sum = resolvedSeries.reduce((s, ser) => s + Math.max(0, Number(row[ser.key]) || 0), 0)
      return Math.max(max, sum)
    }
    return resolvedSeries.reduce((m, ser) => Math.max(m, Number(row[ser.key]) || 0), max)
  }, 0)
  const refMax = referenceLines.reduce((m, r) => Math.max(m, Number(r.value) || 0), 0)
  const yMax = niceMax(Math.max(rawMax, refMax))

  if (horizontal) {
    const labelW = 112
    const valueW = 54
    const rowH = 30
    const viewW = 600
    const plotW = viewW - labelW - valueW - 16
    const svgH = Math.max(height, data.length * rowH + 28)
    return (
      <div style={{ width: '100%', ...style }}>
        <ChartHeader title={title} subtitle={subtitle} legend={resolvedSeries.length > 1 ? resolvedSeries : []} theme={theme} />
        <svg viewBox={`0 0 ${viewW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          {data.map((row, idx) => {
            const y = 8 + idx * rowH
            const label = String(row.label ?? row.x ?? idx)
            const total = resolvedSeries.reduce((sum, s) => sum + Math.max(0, Number(row[s.key]) || 0), 0)
            let cursor = labelW
            return (
              <g key={`${label}-${idx}`} onMouseEnter={() => setHovered(idx)} onMouseLeave={() => setHovered(null)}>
                <text x={labelW - 8} y={y + 15} textAnchor="end" fill={theme.text.secondary} fontSize={11} fontFamily={theme.typography.sans}>
                  {label.length > 16 ? `${label.slice(0, 15)}…` : label}
                </text>
                <rect x={labelW} y={y + 4} width={plotW} height={16} rx={3} fill={theme.fill.tertiary} />
                {resolvedSeries.map(ser => {
                  const val = Math.max(0, Number(row[ser.key]) || 0)
                  const w = (val / yMax) * plotW
                  const rect = <rect key={ser.key} x={cursor} y={y + 4} width={Math.max(0, w)} height={16} rx={3} fill={ser.color} opacity={hovered === null || hovered === idx ? 1 : 0.45} />
                  cursor += w
                  return rect
                })}
                <text x={labelW + plotW + 8} y={y + 16} fill={theme.text.primary} fontSize={11} fontFamily={theme.typography.mono}>
                  {formatVal(total)}
                </text>
              </g>
            )
          })}
          {xLabel ? <text x={labelW + plotW / 2} y={svgH - 4} textAnchor="middle" fill={theme.text.tertiary} fontSize={11}>{xLabel}</text> : null}
        </svg>
        <ChartCaption caption={caption} theme={theme} />
      </div>
    )
  }

  const viewW = 620
  const padL = yLabel ? 58 : 46
  const padR = 16
  const padT = 14
  const padB = xLabel ? 44 : 28
  const plotW = viewW - padL - padR
  const plotH = Math.max(120, height - padT - padB)
  const svgH = plotH + padT + padB
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const groupW = plotW / data.length
  const groupPad = Math.min(18, groupW * 0.24)
  const innerW = Math.max(4, groupW - groupPad)

  return (
    <div style={{ width: '100%', ...style }}>
      <ChartHeader title={title} subtitle={subtitle} legend={resolvedSeries.length > 1 ? resolvedSeries : []} theme={theme} />
      <svg viewBox={`0 0 ${viewW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        {ticks.map(t => {
          const y = padT + plotH * (1 - t)
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={viewW - padR} y2={y} stroke={theme.chart.palette.grid} strokeWidth={1} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fill={theme.chart.palette.axis} fontSize={10} fontFamily={theme.typography.mono}>
                {formatVal(yMax * t)}
              </text>
            </g>
          )
        })}
        {referenceLines.map((ref, idx) => {
          const y = padT + plotH * (1 - Math.min(1, Math.max(0, (Number(ref.value) || 0) / yMax)))
          const stroke = resolveColor(ref.tone ?? ref.color ?? 'warn', idx, theme)
          return (
            <g key={`ref-${idx}`}>
              <line x1={padL} y1={y} x2={viewW - padR} y2={y} stroke={stroke} strokeWidth={1} strokeDasharray="4 3" />
              {ref.label ? <text x={viewW - padR} y={y - 4} textAnchor="end" fill={stroke} fontSize={10}>{ref.label}</text> : null}
            </g>
          )
        })}
        {data.map((row, idx) => {
          const x0 = padL + idx * groupW + groupPad / 2
          const label = String(row.label ?? row.x ?? idx)
          const showLabel = data.length <= 12 || idx % Math.ceil(data.length / 10) === 0
          let stackY = padT + plotH
          return (
            <g key={`${label}-${idx}`} onMouseEnter={() => setHovered(idx)} onMouseLeave={() => setHovered(null)}>
              {stacked
                ? resolvedSeries.map(ser => {
                  const val = Math.max(0, Number(row[ser.key]) || 0)
                  const barH = (val / yMax) * plotH
                  stackY -= barH
                  return <rect key={ser.key} x={x0} y={stackY} width={innerW} height={Math.max(0, barH)} rx={2} fill={ser.color} opacity={hovered === null || hovered === idx ? 1 : 0.45} />
                })
                : resolvedSeries.map((ser, sIdx) => {
                  const gap = resolvedSeries.length > 1 ? 3 : 0
                  const barW = Math.max(2, (innerW - gap * (resolvedSeries.length - 1)) / resolvedSeries.length)
                  const val = Math.max(0, Number(row[ser.key]) || 0)
                  const barH = (val / yMax) * plotH
                  return (
                    <rect
                      key={ser.key}
                      x={x0 + sIdx * (barW + gap)}
                      y={padT + plotH - barH}
                      width={barW}
                      height={Math.max(0, barH)}
                      rx={2}
                      fill={ser.color}
                      opacity={hovered === null || hovered === idx ? 1 : 0.45}
                    />
                  )
                })}
              {showLabel ? (
                <text x={x0 + innerW / 2} y={padT + plotH + 16} textAnchor="middle" fill={theme.chart.palette.axis} fontSize={10}>
                  {label.length > 12 ? `${label.slice(0, 11)}…` : label}
                </text>
              ) : null}
            </g>
          )
        })}
        {yLabel ? (
          <text
            x={14}
            y={padT + plotH / 2}
            textAnchor="middle"
            fill={theme.text.tertiary}
            fontSize={10}
            transform={`rotate(-90 14 ${padT + plotH / 2})`}
          >
            {yLabel}
          </text>
        ) : null}
        {xLabel ? <text x={padL + plotW / 2} y={svgH - 6} textAnchor="middle" fill={theme.text.tertiary} fontSize={10}>{xLabel}</text> : null}
      </svg>
      {hovered !== null && data[hovered] ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 6, padding: '6px 10px', borderRadius: theme.radius.sm, background: theme.fill.tertiary, border: `1px solid ${theme.stroke.tertiary}`, fontSize: 11, color: theme.text.secondary }}>
          <strong style={{ color: theme.text.primary }}>{String(data[hovered].label ?? data[hovered].x ?? hovered)}</strong>
          {resolvedSeries.map(ser => (
            <span key={ser.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: ser.color }} />
              <span>{ser.label}:</span>
              <strong style={{ color: theme.text.primary, fontFamily: theme.typography.mono }}>{formatVal(Number(data[hovered][ser.key]) || 0)}</strong>
            </span>
          ))}
        </div>
      ) : null}
      <ChartCaption caption={caption} theme={theme} />
    </div>
  )
}

export function LineChart({
  data = [],
  series,
  title,
  subtitle,
  caption,
  xLabel,
  yLabel,
  height = 240,
  area = false,
  referenceLines = [],
  valueFormatter,
  style,
}) {
  const theme = useHostTheme()
  const [hovered, setHovered] = React.useState(null)

  const resolvedSeries = React.useMemo(() => {
    if (Array.isArray(series) && series.length > 0) {
      return series.map((s, idx) => ({
        key: s.key,
        label: s.label ?? s.key,
        color: resolveColor(s.color ?? s.tone, idx, theme),
      }))
    }
    return [{ key: 'value', label: yLabel || 'Value', color: theme.chart.sequence[0] }]
  }, [series, theme, yLabel])

  if (!Array.isArray(data) || data.length === 0) return null

  const formatVal = valueFormatter ?? formatTick
  let minVal = 0
  let maxVal = 0
  for (const row of data) {
    for (const ser of resolvedSeries) {
      const v = Number(row[ser.key])
      if (Number.isFinite(v)) {
        if (v < minVal) minVal = v
        if (v > maxVal) maxVal = v
      }
    }
  }
  for (const ref of referenceLines) {
    const v = Number(ref.value)
    if (Number.isFinite(v)) maxVal = Math.max(maxVal, v)
  }
  const yMax = niceMax(maxVal)
  const yMin = minVal < 0 ? -niceMax(Math.abs(minVal)) : 0
  const span = Math.max(1e-9, yMax - yMin)

  const viewW = 620
  const padL = yLabel ? 58 : 46
  const padR = 16
  const padT = 14
  const padB = xLabel ? 44 : 28
  const plotW = viewW - padL - padR
  const plotH = Math.max(120, height - padT - padB)
  const svgH = plotH + padT + padB
  const xAt = idx => (data.length === 1 ? padL + plotW / 2 : padL + (idx / (data.length - 1)) * plotW)
  const yAt = val => padT + plotH * (1 - (val - yMin) / span)
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div style={{ width: '100%', ...style }}>
      <ChartHeader title={title} subtitle={subtitle} legend={resolvedSeries.length > 1 ? resolvedSeries : []} theme={theme} />
      <svg viewBox={`0 0 ${viewW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        {ticks.map(t => {
          const val = yMin + span * t
          const y = yAt(val)
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={viewW - padR} y2={y} stroke={theme.chart.palette.grid} strokeWidth={1} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fill={theme.chart.palette.axis} fontSize={10} fontFamily={theme.typography.mono}>
                {formatVal(val)}
              </text>
            </g>
          )
        })}
        {referenceLines.map((ref, idx) => {
          const y = yAt(Number(ref.value) || 0)
          const stroke = resolveColor(ref.tone ?? ref.color ?? 'warn', idx, theme)
          return (
            <g key={`ref-${idx}`}>
              <line x1={padL} y1={y} x2={viewW - padR} y2={y} stroke={stroke} strokeWidth={1} strokeDasharray="4 3" />
              {ref.label ? <text x={viewW - padR} y={y - 4} textAnchor="end" fill={stroke} fontSize={10}>{ref.label}</text> : null}
            </g>
          )
        })}
        {resolvedSeries.map(ser => {
          const pts = data.map((row, idx) => ({ x: xAt(idx), y: yAt(Number(row[ser.key]) || 0) }))
          const linePath = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
          const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${yAt(yMin).toFixed(1)} L ${pts[0].x.toFixed(1)} ${yAt(yMin).toFixed(1)} Z`
          return (
            <g key={ser.key}>
              {area ? <path d={areaPath} fill={ser.color} opacity={0.12} /> : null}
              <path d={linePath} fill="none" stroke={ser.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hovered === idx ? 4 : data.length <= 24 ? 2.5 : 0}
                  fill={ser.color}
                />
              ))}
            </g>
          )
        })}
        {hovered !== null ? (
          <line x1={xAt(hovered)} y1={padT} x2={xAt(hovered)} y2={padT + plotH} stroke={theme.stroke.primary} strokeWidth={1} strokeDasharray="2 2" />
        ) : null}
        {data.map((row, idx) => {
          const x = xAt(idx)
          const step = data.length > 1 ? plotW / (data.length - 1) : plotW
          const label = String(row.label ?? row.x ?? idx)
          const showLabel = data.length <= 10 || idx % Math.ceil(data.length / 8) === 0 || idx === data.length - 1
          return (
            <g key={`hit-${idx}`}>
              <rect
                x={Math.max(padL, x - step / 2)}
                y={padT}
                width={step}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              />
              {showLabel ? (
                <text x={x} y={padT + plotH + 16} textAnchor="middle" fill={theme.chart.palette.axis} fontSize={10}>
                  {label.length > 12 ? `${label.slice(0, 11)}…` : label}
                </text>
              ) : null}
            </g>
          )
        })}
        {yLabel ? (
          <text x={14} y={padT + plotH / 2} textAnchor="middle" fill={theme.text.tertiary} fontSize={10} transform={`rotate(-90 14 ${padT + plotH / 2})`}>
            {yLabel}
          </text>
        ) : null}
        {xLabel ? <text x={padL + plotW / 2} y={svgH - 6} textAnchor="middle" fill={theme.text.tertiary} fontSize={10}>{xLabel}</text> : null}
      </svg>
      {hovered !== null && data[hovered] ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 6, padding: '6px 10px', borderRadius: theme.radius.sm, background: theme.fill.tertiary, border: `1px solid ${theme.stroke.tertiary}`, fontSize: 11, color: theme.text.secondary }}>
          <strong style={{ color: theme.text.primary }}>{String(data[hovered].label ?? data[hovered].x ?? hovered)}</strong>
          {resolvedSeries.map(ser => (
            <span key={ser.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: ser.color }} />
              <span>{ser.label}:</span>
              <strong style={{ color: theme.text.primary, fontFamily: theme.typography.mono }}>{formatVal(Number(data[hovered][ser.key]) || 0)}</strong>
            </span>
          ))}
        </div>
      ) : null}
      <ChartCaption caption={caption} theme={theme} />
    </div>
  )
}

export function PieChart({
  data = [],
  title,
  subtitle,
  caption,
  donut = true,
  size = 180,
  valueFormatter,
  style,
}) {
  const theme = useHostTheme()
  const [hovered, setHovered] = React.useState(null)
  const items = data.filter(d => Number(d?.value) > 0)
  if (items.length === 0) return null

  const total = items.reduce((s, d) => s + Number(d.value), 0)
  const formatVal = valueFormatter ?? formatTick
  const r = size / 2 - 6
  const innerR = donut ? r * 0.56 : 0
  const cx = size / 2
  const cy = size / 2

  let angle = -Math.PI / 2
  const slices = items.map((item, idx) => {
    const val = Number(item.value)
    const frac = val / total
    const start = angle
    const end = angle + frac * Math.PI * 2
    angle = end
    const large = frac > 0.5 ? 1 : 0
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const color = resolveColor(item.color ?? item.tone, idx, theme)
    let d
    if (frac >= 0.9999) {
      d = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
    } else if (innerR > 0) {
      const ix1 = cx + innerR * Math.cos(end)
      const iy1 = cy + innerR * Math.sin(end)
      const ix2 = cx + innerR * Math.cos(start)
      const iy2 = cy + innerR * Math.sin(start)
      d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`
    } else {
      d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    }
    return { ...item, idx, val, frac, color, d }
  })

  const active = hovered !== null ? slices[hovered] : null

  return (
    <div style={{ width: '100%', ...style }}>
      <ChartHeader title={title} subtitle={subtitle} theme={theme} />
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }}>
          {slices.map(s => (
            <path
              key={s.idx}
              d={s.d}
              fill={s.color}
              opacity={hovered === null || hovered === s.idx ? 1 : 0.45}
              stroke={theme.bg.editor}
              strokeWidth={1.5}
              onMouseEnter={() => setHovered(s.idx)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
          {donut ? (
            <g>
              <text x={cx} y={cy - 2} textAnchor="middle" fill={theme.text.primary} fontSize={14} fontWeight={600} fontFamily={theme.typography.mono}>
                {active ? formatVal(active.val) : formatVal(total)}
              </text>
              <text x={cx} y={cy + 14} textAnchor="middle" fill={theme.text.tertiary} fontSize={10}>
                {active ? `${(active.frac * 100).toFixed(1)}%` : 'Total'}
              </text>
            </g>
          ) : null}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 160px', minWidth: 0 }}>
          {slices.map(s => (
            <div
              key={s.idx}
              onMouseEnter={() => setHovered(s.idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '3px 6px',
                borderRadius: theme.radius.xs,
                background: hovered === s.idx ? theme.fill.secondary : 'transparent',
                cursor: 'default',
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, flex: 'none' }} />
              <span style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.text.primary }}>{s.label}</span>
              <span style={{ fontFamily: theme.typography.mono, color: theme.text.secondary }}>{formatVal(s.val)}</span>
              <span style={{ fontFamily: theme.typography.mono, color: theme.text.tertiary, width: 42, textAlign: 'right' }}>{`${(s.frac * 100).toFixed(1)}%`}</span>
            </div>
          ))}
        </div>
      </div>
      <ChartCaption caption={caption} theme={theme} />
    </div>
  )
}

export function UsageBar({ segments = [], total, title, showLegend = true, height = 8, style }) {
  const theme = useHostTheme()
  const valid = segments.filter(s => Number(s?.value) > 0)
  if (valid.length === 0) return null
  const sum = valid.reduce((acc, s) => acc + Number(s.value), 0)
  const denom = Math.max(sum, Number(total) || 0, 1)

  return (
    <div style={{ width: '100%', ...style }}>
      {title ? <div style={{ fontSize: 12, fontWeight: 500, color: theme.text.secondary, marginBottom: 6 }}>{title}</div> : null}
      <div style={{ display: 'flex', width: '100%', height, borderRadius: theme.radius.full, overflow: 'hidden', background: theme.fill.secondary, gap: 1 }}>
        {valid.map((seg, idx) => {
          const colorKey = seg.color ?? usageColorSequence[idx % usageColorSequence.length]
          const bg = resolveColor(colorKey, idx, theme)
          const pct = (Number(seg.value) / denom) * 100
          return <div key={seg.label ?? idx} title={`${seg.label ?? ''}: ${seg.value}`} style={{ width: `${pct}%`, background: bg, minWidth: 2 }} />
        })}
      </div>
      {showLegend ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 8, fontSize: 11, color: theme.text.secondary }}>
          {valid.map((seg, idx) => {
            const colorKey = seg.color ?? usageColorSequence[idx % usageColorSequence.length]
            const bg = resolveColor(colorKey, idx, theme)
            return (
              <span key={seg.label ?? idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: bg }} />
                <span>{seg.label}</span>
                <span style={{ color: theme.text.tertiary, fontFamily: theme.typography.mono }}>{seg.displayValue ?? formatTick(Number(seg.value))}</span>
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
