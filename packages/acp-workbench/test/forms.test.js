import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formFields, formResponse, urlElicitation, urlResponse } from '../lib/forms.js'

test('formFields and formResponse support boolean, number, integer, and string format fields', () => {
  const fields = formFields({
    mode: 'form',
    message: 'Configure deployment',
    requestedSchema: {
      type: 'object',
      required: ['confirm', 'retries'],
      properties: {
        confirm: { type: 'boolean', title: 'Confirm', default: false },
        retries: { type: 'integer', title: 'Retries', minimum: 1, maximum: 5, default: 2 },
        ratio: { type: 'number', title: 'Ratio', minimum: 0, maximum: 1 },
        email: { type: 'string', title: 'Email', format: 'email' },
      },
    },
  })

  assert.equal(fields.length, 4)
  assert.deepEqual(fields[0], { id: 'confirm', title: 'Confirm', description: '', required: true, kind: 'boolean', defaultValue: false })
  assert.deepEqual(fields[1], { id: 'retries', title: 'Retries', description: '', required: true, kind: 'number', integer: true, min: 1, max: 5, defaultValue: 2 })
  assert.deepEqual(fields[2], { id: 'ratio', title: 'Ratio', description: '', required: false, kind: 'number', integer: false, min: 0, max: 1 })
  assert.equal(fields[3].kind, 'text')

  assert.deepEqual(formResponse(fields, {
    formAction: 'accept',
    content: { confirm: true, retries: 3, ratio: 0.5, email: 'ops@example.com' },
  }), {
    action: 'accept',
    content: { confirm: true, retries: 3, ratio: 0.5, email: 'ops@example.com' },
  })

  assert.throws(() => formResponse(fields, {
    formAction: 'accept',
    content: { confirm: true, retries: 2.5 },
  }), /Invalid form answer/u)

  assert.throws(() => formResponse(fields, {
    formAction: 'accept',
    content: { confirm: true, retries: 10 },
  }), /outside the field limits/u)

  assert.throws(() => formResponse(fields, {
    formAction: 'accept',
    content: { confirm: 'yes', retries: 2 },
  }), /Invalid form answer/u)
})

test('urlElicitation and urlResponse validate safe http(s) URLs and actions', () => {
  const info = urlElicitation({
    mode: 'url',
    message: 'Complete OAuth sign-in',
    url: 'https://example.com/oauth?code=123',
    elicitationId: 'elicit-1',
  })
  assert.deepEqual(info, {
    message: 'Complete OAuth sign-in',
    url: 'https://example.com/oauth?code=123',
    elicitationId: 'elicit-1',
  })

  assert.throws(() => urlElicitation({ mode: 'url', message: 'Bad', url: 'javascript:alert(1)' }))
  assert.throws(() => urlElicitation({ mode: 'url', message: 'Bad', url: 'file:///etc/passwd' }))

  assert.deepEqual(urlResponse({ formAction: 'accept' }), { action: 'accept' })
  assert.deepEqual(urlResponse({ formAction: 'decline' }), { action: 'decline' })
  assert.deepEqual(urlResponse({ cancel: true }), { action: 'cancel' })
})
