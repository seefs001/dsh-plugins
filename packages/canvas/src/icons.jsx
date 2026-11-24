import React from 'react'

const PATHS = {
  Activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  AlertCircle: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 8v4', 'M12 16h.01'],
  AlertTriangle: ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  Archive: ['M21 8v13H3V8', 'M1 3h22v5H1z', 'M10 12h4'],
  ArrowDown: ['M12 5v14', 'M19 12l-7 7-7-7'],
  ArrowLeft: ['M19 12H5', 'M12 19l-7-7 7-7'],
  ArrowRight: ['M5 12h14', 'M12 5l7 7-7 7'],
  ArrowUp: ['M12 19V5', 'M5 12l7-7 7 7'],
  ArrowUpRight: ['M7 17L17 7', 'M7 7h10v10'],
  Bell: ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
  BookOpen: ['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'],
  Bot: ['M12 8V4H8', 'M4 8h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z', 'M2 14h2', 'M20 14h2', 'M9 13v2', 'M15 13v2'],
  Bug: ['M8 2l1.88 1.88', 'M14.12 3.88L16 2', 'M9 7.13v-1a3 3 0 1 1 6 0v1', 'M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6', 'M12 20v-9', 'M6.53 9C4.6 8.8 3 7.1 3 5', 'M6 13H2', 'M3 21c0-2.1 1.7-3.9 3.8-4', 'M20.97 5c0 2.1-1.6 3.8-3.5 4', 'M22 13h-4', 'M17.2 17c2.1.1 3.8 1.9 3.8 4'],
  Calendar: ['M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  Check: ['M20 6L9 17l-5-5'],
  CheckCircle2: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M9 12l2 2 4-4'],
  ChevronDown: ['M6 9l6 6 6-6'],
  ChevronLeft: ['M15 18l-6-6 6-6'],
  ChevronRight: ['M9 18l6-6-6-6'],
  ChevronUp: ['M18 15l-6-6-6 6'],
  Clock: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'],
  Code2: ['M18 16l4-4-4-4', 'M6 8l-4 4 4 4', 'M14.5 4l-5 16'],
  Columns3: ['M3 3h18v18H3z', 'M9 3v18', 'M15 3v18'],
  Copy: ['M9 9h13v13H9z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  Cpu: ['M4 4h16v16H4z', 'M9 9h6v6H9z', 'M9 1v3', 'M15 1v3', 'M9 20v3', 'M15 20v3', 'M20 9h3', 'M20 14h3', 'M1 9h3', 'M1 14h3'],
  Database: ['M12 2C7 2 3 3.8 3 6s4 4 9 4 9-1.8 9-4-4-4-9-4z', 'M21 12c0 2.2-4 4-9 4s-9-1.8-9-4', 'M3 6v12c0 2.2 4 4 9 4s9-1.8 9-4V6'],
  Download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  Edit3: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'],
  ExternalLink: ['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14L21 3'],
  Eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  EyeOff: ['M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94', 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19', 'M1 1l22 22'],
  FileCode: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M10 13l-2 2 2 2', 'M14 17l2-2-2-2'],
  FileText: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  Filter: ['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'],
  Flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
  Folder: ['M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'],
  GitBranch: ['M6 3v12', 'M18 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M18 9a9 9 0 0 1-9 9'],
  GitCommit: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M2 12h6', 'M16 12h6'],
  GitPullRequest: ['M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M13 6h3a2 2 0 0 1 2 2v7', 'M6 9v12'],
  Globe: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  Inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
  Info: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 16v-4', 'M12 8h.01'],
  Layers: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  LayoutDashboard: ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  Link2: ['M9 17H7A5 5 0 0 1 7 7h2', 'M15 7h2a5 5 0 1 1 0 10h-2', 'M8 12h8'],
  ListTodo: ['M3 5h2', 'M3 12h2', 'M3 19h2', 'M9 5h12', 'M9 12h12', 'M9 19h12'],
  Lock: ['M5 11h14v10H5z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  Maximize2: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'],
  MessageSquare: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  Minimize2: ['M4 14h6v6', 'M20 10h-6V4', 'M14 10l7-7', 'M3 21l7-7'],
  Minus: ['M5 12h14'],
  MoreHorizontal: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  Pause: ['M6 4h4v16H6z', 'M14 4h4v16h-4z'],
  Pin: ['M12 17v5', 'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z'],
  Play: ['M5 3l14 9-14 9V3z'],
  Plus: ['M12 5v14', 'M5 12h14'],
  RefreshCw: ['M21 2v6h-6', 'M3 12a9 9 0 0 1 15-6.7L21 8', 'M3 22v-6h6', 'M21 12a9 9 0 0 1-15 6.7L3 16'],
  Search: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M21 21l-4.35-4.35'],
  Send: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4 20-7z'],
  Settings: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'],
  Shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  SlidersHorizontal: ['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'],
  Sparkles: ['M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z', 'M5 3v4', 'M3 5h4', 'M19 17v4', 'M17 19h4'],
  Square: ['M4 4h16v16H4z'],
  Star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  Tag: ['M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z', 'M7 7h.01'],
  Terminal: ['M4 17l6-6-6-6', 'M12 19h8'],
  Trash2: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M10 11v6', 'M14 11v6'],
  Unlock: ['M5 11h14v10H5z', 'M7 11V7a5 5 0 0 1 9.9-1'],
  Wrench: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'],
  X: ['M18 6L6 18', 'M6 6l12 12'],
  XCircle: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M15 9l-6 6', 'M9 9l6 6'],
  Zap: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
}

export const ICON_NAMES = Object.keys(PATHS)

function renderSvg(paths, { size = 16, color = 'currentColor', strokeWidth = 1.75, className, style } = {}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {paths.map((d, idx) => <path key={idx} d={d} />)}
    </svg>
  )
}

export function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.75, className, style }) {
  const paths = PATHS[name]
  if (!paths) return null
  return renderSvg(paths, { size, color, strokeWidth, className, style })
}

export const LUCIDE_ICONS = Object.fromEntries(
  ICON_NAMES.map(name => [
    name,
    function LucideIcon(props) {
      return renderSvg(PATHS[name], props)
    },
  ]),
)
