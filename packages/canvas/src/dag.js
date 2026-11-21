export function computeDAGLayout(nodes, edges, options = {}) {
  const direction = options.direction === 'LR' ? 'LR' : 'TB'
  const nodeWidth = Number.isFinite(options.nodeWidth) ? options.nodeWidth : 168
  const nodeHeight = Number.isFinite(options.nodeHeight) ? options.nodeHeight : 54
  const rankGap = Number.isFinite(options.rankGap) ? options.rankGap : 72
  const nodeGap = Number.isFinite(options.nodeGap) ? options.nodeGap : 28
  const padding = Number.isFinite(options.padding) ? options.padding : 24

  const nodeMap = new Map()
  for (const node of nodes) {
    if (!node || typeof node.id !== 'string' || nodeMap.has(node.id)) continue
    nodeMap.set(node.id, {
      ...node,
      width: Number.isFinite(node.width) ? node.width : nodeWidth,
      height: Number.isFinite(node.height) ? node.height : nodeHeight,
    })
  }
  const ids = [...nodeMap.keys()]
  const incoming = new Map(ids.map(id => [id, new Set()]))
  const outgoing = new Map(ids.map(id => [id, new Set()]))
  const validEdges = []
  for (const edge of edges) {
    if (!edge || !nodeMap.has(edge.from) || !nodeMap.has(edge.to) || edge.from === edge.to) continue
    outgoing.get(edge.from).add(edge.to)
    incoming.get(edge.to).add(edge.from)
    validEdges.push(edge)
  }

  const inDegree = new Map(ids.map(id => [id, incoming.get(id).size]))
  const rankOf = new Map(ids.map(id => [id, 0]))
  const queue = ids.filter(id => inDegree.get(id) === 0)
  const visited = new Set()

  while (queue.length > 0) {
    const id = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    const nextRank = rankOf.get(id) + 1
    for (const target of outgoing.get(id)) {
      if (nextRank > rankOf.get(target)) rankOf.set(target, nextRank)
      const remaining = inDegree.get(target) - 1
      inDegree.set(target, remaining)
      if (remaining === 0) queue.push(target)
    }
  }

  for (const id of ids) {
    if (visited.has(id)) continue
    let best = 0
    for (const src of incoming.get(id)) {
      if (visited.has(src)) best = Math.max(best, rankOf.get(src) + 1)
    }
    rankOf.set(id, best)
  }

  const maxRank = ids.reduce((acc, id) => Math.max(acc, rankOf.get(id) ?? 0), 0)
  const buckets = Array.from({ length: maxRank + 1 }, () => [])
  for (const id of ids) buckets[rankOf.get(id)].push(id)

  for (let r = 1; r < buckets.length; r++) {
    const prevOrder = new Map(buckets[r - 1].map((id, idx) => [id, idx]))
    buckets[r].sort((a, b) => {
      const score = id => {
        const parents = [...incoming.get(id)].filter(p => prevOrder.has(p))
        if (!parents.length) return Number.MAX_SAFE_INTEGER
        return parents.reduce((sum, p) => sum + prevOrder.get(p), 0) / parents.length
      }
      return score(a) - score(b)
    })
  }

  const positioned = new Map()
  const ranks = []
  let width = padding * 2
  let height = padding * 2

  if (direction === 'TB') {
    const rankWidths = buckets.map(bucket => bucket.reduce((sum, id, idx) => sum + nodeMap.get(id).width + (idx > 0 ? nodeGap : 0), 0))
    const widest = Math.max(0, ...rankWidths)
    let cursorY = padding
    for (let r = 0; r < buckets.length; r++) {
      const bucket = buckets[r]
      const rowHeight = bucket.reduce((m, id) => Math.max(m, nodeMap.get(id).height), nodeHeight)
      let cursorX = padding + (widest - rankWidths[r]) / 2
      for (const id of bucket) {
        const n = nodeMap.get(id)
        const y = cursorY + (rowHeight - n.height) / 2
        positioned.set(id, { ...n, rank: r, x: cursorX, y, cx: cursorX + n.width / 2, cy: y + n.height / 2 })
        cursorX += n.width + nodeGap
      }
      ranks.push({ rank: r, nodes: bucket })
      cursorY += rowHeight + (r < buckets.length - 1 ? rankGap : 0)
    }
    width = Math.max(padding * 2, widest + padding * 2)
    height = Math.max(padding * 2, cursorY + padding)
  } else {
    const rankHeights = buckets.map(bucket => bucket.reduce((sum, id, idx) => sum + nodeMap.get(id).height + (idx > 0 ? nodeGap : 0), 0))
    const tallest = Math.max(0, ...rankHeights)
    let cursorX = padding
    for (let r = 0; r < buckets.length; r++) {
      const bucket = buckets[r]
      const colWidth = bucket.reduce((m, id) => Math.max(m, nodeMap.get(id).width), nodeWidth)
      let cursorY = padding + (tallest - rankHeights[r]) / 2
      for (const id of bucket) {
        const n = nodeMap.get(id)
        const x = cursorX + (colWidth - n.width) / 2
        positioned.set(id, { ...n, rank: r, x, y: cursorY, cx: x + n.width / 2, cy: cursorY + n.height / 2 })
        cursorY += n.height + nodeGap
      }
      ranks.push({ rank: r, nodes: bucket })
      cursorX += colWidth + (r < buckets.length - 1 ? rankGap : 0)
    }
    width = Math.max(padding * 2, cursorX + padding)
    height = Math.max(padding * 2, tallest + padding * 2)
  }

  const routedEdges = validEdges.map(edge => {
    const src = positioned.get(edge.from)
    const dst = positioned.get(edge.to)
    if (direction === 'TB') {
      const x1 = src.cx
      const y1 = src.y + src.height
      const x2 = dst.cx
      const y2 = dst.y
      const midY = (y1 + y2) / 2
      return { ...edge, x1, y1, x2, y2, path: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}` }
    }
    const x1 = src.x + src.width
    const y1 = src.cy
    const x2 = dst.x
    const y2 = dst.cy
    const midX = (x1 + x2) / 2
    return { ...edge, x1, y1, x2, y2, path: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}` }
  })

  return {
    direction,
    width: Math.ceil(width),
    height: Math.ceil(height),
    nodes: [...positioned.values()],
    edges: routedEdges,
    ranks,
  }
}
