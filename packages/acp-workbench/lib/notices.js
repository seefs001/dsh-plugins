/** A notice is plain text from a specific remote, never an assistant message or a request for approval. */
function noticeReceipt(event, remoteId) {
  const data = event?.data, params = data?.params, u = params?.update
  if (event?.type !== 'notification' || data?.method !== 'session/update' || typeof remoteId !== 'string' || !remoteId.trim() || params?.sessionId !== remoteId || u?.sessionUpdate !== 'notice' ||
    typeof u.title !== 'string' || !u.title.trim() || typeof u.severity !== 'string' || !u.severity.trim()) return null
  const parent = u._meta?.claudeCode?.parentToolUseId
  return { kind: 'notice', seq: event.seq, at: event.at, phase: data.turnId ? 'turn' : data.noticePhase === 'connect' || data.replay ? 'connect' : 'session',
    severity: u.severity, title: u.title, ...(typeof u.description === 'string' && u.description.trim() && { description: u.description }),
    ...(typeof parent === 'string' && parent.trim() && { cliParent: parent }) }
}

// Only off-turn notices need another surface. Keep lightweight heads for this live connection, not a second inbox on disk.
function rememberNotice(runtime, event) {
  const remoteId = event.data.params?.sessionId, row = noticeReceipt(event, remoteId)
  if (!row || row.phase === 'turn') return
  const { description, title, ...fields } = row
  const head = title.length > 180 ? title.slice(0, 180) + '…' : title
  // session/new can emit notices before returning its real remote ID. Do not let another ID evict its headlines.
  const byRemote = runtime.noticeHeads ??= new Map(), recent = byRemote.get(remoteId) ?? []
  if (!byRemote.has(remoteId)) byRemote.set(remoteId, recent)
  recent.unshift({ ...fields, title: head, hasDetail: !!description || head !== title })
  if (recent.length > 8) recent.pop()
}

function connectionNotices(binding, runtime) {
  if (!binding?.remoteId || binding.archived || binding.native.retired || !runtime || runtime.closing) return null
  const items = runtime.noticeHeads?.get(binding.remoteId)
  return items?.length ? { externalId: binding.id, remoteId: binding.remoteId, connection: runtime.generation, items } : null
}

export { noticeReceipt, rememberNotice, connectionNotices }
