import { RpcError } from './transport.js'

const object = value => !!value && typeof value === 'object' && !Array.isArray(value)
const text = v => typeof v === 'string'
const finite = v => typeof v === 'number' && Number.isFinite(v)
const allows = (value, keys) => object(value) && Object.keys(value).every(k => keys.includes(k) || k === '_meta')
const unsupported = () => { throw new RpcError('Cannot display this ACP form schema', -32602) }

function options(schema, titled) {
  const values = schema[titled] ?? schema.enum
  if (!Array.isArray(values) || !values.length || (schema[titled] && schema.enum)) unsupported()
  const labels = schema.enumNames
  if (labels != null && (!Array.isArray(labels) || labels.length !== values.length || !labels.every(text))) unsupported()
  const choices = values.map((v, i) => {
    if (schema[titled]) {
      if (!allows(v, ['const', 'title', 'description']) || !text(v.const) || !text(v.title) || (v.description != null && !text(v.description))) unsupported()
      const preview = v._meta?.['_claude/askUserQuestionOption']?.preview
      return { value: v.const, label: v.title, description: v.description ?? '', ...(text(preview) && { preview }) }
    }
    if (!text(v)) unsupported()
    return { value: v, label: labels?.[i] ?? v }
  })
  if (new Set(choices.map(c => c.value)).size !== choices.length) unsupported()
  return choices
}

export function urlElicitation(params) {
  if (params?.mode !== 'url' || !text(params.message) || !text(params.url)) unsupported()
  let parsed
  try { parsed = new URL(params.url) } catch { unsupported() }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') unsupported()
  return {
    message: params.message,
    url: parsed.href,
    ...(text(params.elicitationId) && params.elicitationId ? { elicitationId: params.elicitationId } : {}),
  }
}

export function urlResponse(op) {
  if (op.cancel === true) return { action: 'cancel' }
  if (op.formAction === 'decline') return { action: 'decline' }
  if (op.formAction === 'accept') return { action: 'accept' }
  throw new Error('Choose an advertised elicitation action')
}

export function formFields(params) {
  const s = params.requestedSchema
  if (params.mode !== 'form' || !text(params.message) || !allows(s, ['type', 'title', 'description', 'properties', 'required', '$schema', 'additionalProperties']) || (s.type != null && s.type !== 'object') || !object(s.properties) || (s.title != null && !text(s.title)) || (s.description != null && !text(s.description)) || (s.additionalProperties != null && typeof s.additionalProperties !== 'boolean')) unsupported()
  const required = s.required ?? []
  if (!Array.isArray(required) || !required.every(k => text(k) && Object.hasOwn(s.properties, k))) unsupported()
  return Object.entries(s.properties).map(([id, p]) => {
    if (!object(p) || (p.title != null && !text(p.title)) || (p.description != null && !text(p.description))) unsupported()
    const field = { id, title: p.title ?? id, description: p.description ?? '', required: required.includes(id) }
    const base = ['type', 'title', 'description', 'default']
    if (p.type === 'boolean') {
      if (!allows(p, base) || (p.default != null && typeof p.default !== 'boolean')) unsupported()
      return { ...field, kind: 'boolean', ...(typeof p.default === 'boolean' ? { defaultValue: p.default } : {}) }
    }
    if (p.type === 'number' || p.type === 'integer') {
      if (!allows(p, [...base, 'minimum', 'maximum'])) unsupported()
      const min = p.minimum ?? null
      const max = p.maximum ?? null
      if ((min !== null && !finite(min)) || (max !== null && !finite(max)) || (min !== null && max !== null && max < min)) unsupported()
      if (p.default != null && (!finite(p.default) || (p.type === 'integer' && !Number.isInteger(p.default)))) unsupported()
      return {
        ...field,
        kind: 'number',
        integer: p.type === 'integer',
        min,
        max,
        ...(finite(p.default) ? { defaultValue: p.default } : {}),
      }
    }
    if (p.type === 'string' && (p.oneOf || p.enum) && allows(p, [...base, 'oneOf', 'enum', 'enumNames'])) {
      return { ...field, kind: 'single', choices: options(p, 'oneOf'), ...(text(p.default) ? { defaultValue: p.default } : {}) }
    }
    const array = p.type === 'array'
    if (array) {
      if (!allows(p, [...base, 'items', 'minItems', 'maxItems']) || !allows(p.items, ['type', 'enum', 'anyOf']) || (p.items.type != null && p.items.type !== 'string')) unsupported()
    } else if (p.type !== 'string' || !allows(p, [...base, 'minLength', 'maxLength', 'format'])) unsupported()
    const min = p[array ? 'minItems' : 'minLength'] ?? 0, max = p[array ? 'maxItems' : 'maxLength'] ?? null
    if (!Number.isSafeInteger(min) || min < 0 || (max !== null && (!Number.isSafeInteger(max) || max < min))) unsupported()
    return {
      ...field,
      kind: array ? 'multiple' : 'text',
      min,
      max,
      ...(array && { choices: options(p.items, 'anyOf') }),
      ...(text(p.default) && !array ? { defaultValue: p.default } : {}),
      ...(array && Array.isArray(p.default) && p.default.every(text) ? { defaultValue: p.default } : {}),
    }
  })
}

export function formResponse(fields, op) {
  if (op.cancel === true) return { action: 'cancel' }
  if (op.formAction === 'decline') return { action: 'decline' }
  const values = op.content
  if (op.formAction !== 'accept' || !object(values) || Object.keys(values).some(k => !fields.some(f => f.id === k))) throw new Error('Choose an advertised form action and fields')
  for (const f of fields) {
    if (!Object.hasOwn(values, f.id)) { if (f.required) throw new Error('Answer the required fields'); continue }
    const v = values[f.id]
    if (f.kind === 'boolean') {
      if (typeof v !== 'boolean') throw new Error('Invalid form answer')
      continue
    }
    if (f.kind === 'number') {
      if (!finite(v) || (f.integer && !Number.isInteger(v))) throw new Error('Invalid form answer')
      if ((f.min != null && v < f.min) || (f.max != null && v > f.max)) throw new Error('Answer is outside the field limits')
      continue
    }
    const listed = x => f.choices.some(c => c.value === x)
    if (f.kind === 'single' ? !listed(v) : f.kind === 'multiple' ? !Array.isArray(v) || !v.every(listed) || new Set(v).size !== v.length : !text(v)) throw new Error('Invalid form answer')
    const length = f.kind === 'multiple' ? v.length : Array.from(v).length
    if (length < f.min || (f.max != null && length > f.max)) throw new Error('Answer is outside the field limits')
  }
  return { action: 'accept', content: values }
}
