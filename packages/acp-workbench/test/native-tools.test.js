import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  hasToolInput,
  isToolTerminal,
  makeCallId,
  mapPlanTodos,
  mapToolCall,
  mapToolResult,
  sanitizeToolName,
} from '../lib/native-tools.js'

test('makeCallId and sanitizeToolName produce wire-safe identifiers', () => {
  const a = makeCallId()
  const b = makeCallId()
  assert.match(a, /^acp_[0-9a-f]{16}$/u)
  assert.notEqual(a, b)
  assert.equal(sanitizeToolName('mcp__github__list_issues'), 'mcp__github__list_issues')
  assert.equal(sanitizeToolName('  Read File / path  '), 'Read_File_path')
  assert.equal(sanitizeToolName(''), 'acp_tool')
  assert.equal(sanitizeToolName('a'.repeat(100)).length, 64)
})

test('hasToolInput and isToolTerminal classify lifecycle state', () => {
  assert.equal(hasToolInput({ status: 'pending', rawInput: {} }), false)
  assert.equal(hasToolInput({ status: 'pending', rawInput: { file_path: 'a.js' } }), true)
  assert.equal(hasToolInput({ status: 'pending', locations: [{ path: 'a.js' }] }), true)
  assert.equal(hasToolInput({ status: 'in_progress', rawInput: {} }), true)
  assert.equal(isToolTerminal({ status: 'in_progress' }), false)
  assert.equal(isToolTerminal({ status: 'completed' }), true)
  assert.equal(isToolTerminal({ status: 'failed' }), true)
  assert.equal(isToolTerminal({ status: 'cancelled' }), true)
})

test('read tool maps arguments, content envelope, and line metadata', () => {
  const tool = {
    kind: 'read',
    name: 'Read',
    status: 'completed',
    rawInput: { file_path: '/repo/src/app.js', offset: 10, limit: 20 },
    content: [{ type: 'content', content: { type: 'text', text: '10\tconst a = 1\n11\tconst b = 2\n' } }],
  }
  const mapped = mapToolCall(tool)
  assert.equal(mapped.name, 'read')
  assert.deepEqual(mapped.argumentsObj, { file_path: '/repo/src/app.js', offset: 10, limit: 20 })
  const result = mapToolResult(mapped, tool)
  assert.equal(result.isError, false)
  assert.equal(result.content[0].text, '<path>/repo/src/app.js</path>\n<type>file</type>\n<content>\n10\tconst a = 1\n11\tconst b = 2\n</content>')
  assert.deepEqual(result.meta, {
    path: '/repo/src/app.js',
    offset: 10,
    lines: [
      { number: 10, text: 'const a = 1' },
      { number: 11, text: 'const b = 2' },
    ],
    totalLines: 11,
  })
})

test('edit, write, and apply_patch tools map diffs cleanly', () => {
  const editTool = {
    kind: 'edit',
    name: 'Edit',
    status: 'completed',
    rawInput: { file_path: '/repo/a.js', old_string: 'old', new_string: 'new' },
  }
  const editCall = mapToolCall(editTool)
  assert.equal(editCall.name, 'edit')
  const editResult = mapToolResult(editCall, editTool)
  assert.equal(editResult.isError, false)
  assert.deepEqual(editResult.meta, {
    path: '/repo/a.js',
    diffs: [{ path: '/repo/a.js', oldText: 'old', newText: 'new' }],
  })

  const writeTool = {
    kind: 'edit',
    name: 'Write',
    status: 'completed',
    rawInput: { file_path: '/repo/new.js', content: 'export const x = 1\n' },
  }
  const writeCall = mapToolCall(writeTool)
  assert.equal(writeCall.name, 'write')
  const writeResult = mapToolResult(writeCall, writeTool)
  assert.deepEqual(writeResult.meta, {
    path: '/repo/new.js',
    diffs: [{ path: '/repo/new.js', oldText: null, newText: 'export const x = 1\n' }],
  })

  const multiPatch = {
    kind: 'edit',
    status: 'completed',
    content: [
      { type: 'diff', path: '/repo/a.js', oldText: '1', newText: '2' },
      { type: 'diff', path: '/repo/b.js', oldText: '3', newText: '4' },
    ],
  }
  const patchCall = mapToolCall(multiPatch)
  assert.equal(patchCall.name, 'apply_patch')
  assert.match(patchCall.argumentsObj.input, /\*\*\* Begin Patch/u)
  assert.match(patchCall.argumentsObj.input, /\*\*\* Update File: \/repo\/a\.js/u)
  assert.match(patchCall.argumentsObj.input, /\*\*\* Update File: \/repo\/b\.js/u)
  const patchResult = mapToolResult(patchCall, multiPatch)
  assert.equal(patchResult.meta.diffs.length, 2)
})

test('bash tool maps exit codes, signals, and cwd for TerminalBlock', () => {
  const okTool = {
    kind: 'execute',
    name: 'Bash',
    title: 'Run tests',
    status: 'completed',
    rawInput: { command: 'pnpm test', description: 'Run unit tests', workdir: '/repo' },
    rawOutput: { stdout: 'all green', exitCode: 0 },
  }
  const okCall = mapToolCall(okTool)
  assert.equal(okCall.name, 'bash')
  assert.deepEqual(okCall.argumentsObj, { command: 'pnpm test', description: 'Run unit tests', workdir: '/repo' })
  const okResult = mapToolResult(okCall, okTool, undefined, { cwd: '/repo' })
  assert.equal(okResult.isError, false)
  assert.equal(okResult.content[0].text, 'all green')
  assert.deepEqual(okResult.meta, { cwd: '/repo' })

  const failTool = {
    kind: 'execute',
    status: 'failed',
    rawInput: { command: 'exit 2' },
    rawOutput: { stderr: 'boom', exitCode: 2 },
  }
  const failCall = mapToolCall(failTool)
  const failResult = mapToolResult(failCall, failTool, undefined, { cwd: '/repo' })
  assert.equal(failResult.isError, false)
  assert.equal(failResult.content[0].text, 'boom\n[exit code: 2]')

  const sigResult = mapToolResult(failCall, { kind: 'execute', status: 'failed' }, { text: 'killed', signal: 'SIGTERM', cwd: '/repo' })
  assert.equal(sigResult.isError, false)
  assert.equal(sigResult.content[0].text, 'killed\n[killed by signal: SIGTERM]')
})

test('grep and glob tools validate include patterns and parse search results', () => {
  const grepTool = {
    kind: 'search',
    name: 'Grep',
    status: 'completed',
    rawInput: { pattern: 'foo', path: 'src', include: '*.js,*.ts' },
    content: [{ type: 'content', content: { type: 'text', text: 'src/a.js:4:const foo = 1\nsrc/b.js:9:return foo' } }],
  }
  const grepCall = mapToolCall(grepTool)
  assert.equal(grepCall.name, 'grep')
  assert.equal(grepCall.argumentsObj.include, undefined)
  const grepResult = mapToolResult(grepCall, grepTool)
  assert.deepEqual(grepResult.meta, {
    shape: 'matches',
    files: [
      { path: 'src/a.js', matches: [{ lineNumber: 4, line: 'const foo = 1' }] },
      { path: 'src/b.js', matches: [{ lineNumber: 9, line: 'return foo' }] },
    ],
    total: 2,
    truncated: false,
  })

  const braceGrepCall = mapToolCall({
    kind: 'search',
    name: 'Grep',
    rawInput: { pattern: 'foo', include: '*.{js,ts}' },
  })
  assert.equal(braceGrepCall.argumentsObj.include, '*.{js,ts}')

  const globTool = {
    kind: 'search',
    name: 'Glob',
    status: 'completed',
    rawInput: { pattern: '**/*.js', path: 'src' },
    rawOutput: { filenames: ['src/a.js', 'src/b.js'] },
  }
  const globCall = mapToolCall(globTool)
  assert.equal(globCall.name, 'glob')
  const globResult = mapToolResult(globCall, globTool)
  assert.deepEqual(globResult.meta, {
    shape: 'paths',
    paths: ['src/a.js', 'src/b.js'],
    total: 2,
    truncated: false,
  })
})

test('web_search, web_fetch, mcp, todo_write, and cancellation map properly', () => {
  const searchTool = {
    kind: 'fetch',
    name: 'WebSearch',
    status: 'completed',
    rawInput: { query: 'dsh plugins' },
    content: [{ type: 'content', content: { type: 'text', text: 'DSH Docs (https://example.com/docs)\nSummary line' } }],
  }
  const searchCall = mapToolCall(searchTool)
  assert.equal(searchCall.name, 'web_search')
  assert.deepEqual(searchCall.argumentsObj, { queries: ['dsh plugins'] })
  const searchResult = mapToolResult(searchCall, searchTool)
  assert.deepEqual(searchResult.meta, {
    sources: [{ title: 'DSH Docs', url: 'https://example.com/docs' }],
    answer: 'Summary line',
    truncated: false,
  })

  const fetchTool = {
    kind: 'fetch',
    name: 'WebFetch',
    status: 'completed',
    rawInput: { url: 'https://example.com' },
    rawOutput: { statusCode: 200, text: 'hello' },
  }
  const fetchCall = mapToolCall(fetchTool)
  assert.equal(fetchCall.name, 'web_fetch')
  const fetchResult = mapToolResult(fetchCall, fetchTool)
  assert.deepEqual(fetchResult.meta, { url: 'https://example.com', statusCode: 200, truncated: false })

  const mcpCall = mapToolCall({
    name: 'mcp__linear__get_issue',
    rawInput: { id: 'ENG-1' },
  })
  assert.equal(mcpCall.name, 'mcp__linear__get_issue')
  assert.deepEqual(mcpCall.argumentsObj, { id: 'ENG-1' })

  const todos = mapPlanTodos([
    { content: 'Inspect files', status: 'done' },
    { content: 'Inspect files', status: 'pending' },
    { text: 'Patch code', status: 'active' },
    { title: 'Run tests', status: 'todo' },
  ])
  assert.deepEqual(todos, [
    { content: 'Inspect files', status: 'completed' },
    { content: 'Patch code', status: 'in_progress' },
    { content: 'Run tests', status: 'pending' },
  ])

  const aborted = mapToolResult(fetchCall, fetchTool, undefined, { aborted: true })
  assert.equal(aborted.isError, true)
  assert.equal(aborted.error.code, 'ABORTED')
})
