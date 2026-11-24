import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

export const ALLOWED_IMPORT = 'dsh/canvas'
export const ALLOWED_IMPORTS = new Set(['dsh/canvas', 'react', 'lucide-react'])
export const MAX_SOURCE_BYTES = 256 * 1024

const FORBIDDEN_GLOBALS = new Set([
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'eval',
  'Function',
  'importScripts',
  'SharedWorker',
  'Worker',
])

const FORBIDDEN_NAVIGATOR_PROPS = new Set(['sendBeacon'])

const SDK_PATH = fileURLToPath(new URL('./sdk.d.ts', import.meta.url))
const VIRTUAL_ENTRY = '/__dsh_canvas__/canvas.tsx'
const VIRTUAL_SDK = '/__dsh_canvas__/sdk.d.ts'

const COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.React,
  strict: true,
  noImplicitAny: true,
  strictNullChecks: true,
  esModuleInterop: true,
  skipLibCheck: true,
  noEmit: true,
  isolatedModules: true,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
}

const require = createRequire(import.meta.url)
const TS_LIB_DIR = dirname(require.resolve('typescript'))

const libSourceCache = new Map()
let cachedSdkSourceFile = null
let cachedSdkRaw = null
let previousProgram

function getSdkSourceFile() {
  const text = readFileSync(SDK_PATH, 'utf8')
  if (!cachedSdkSourceFile || cachedSdkRaw !== text) {
    cachedSdkRaw = text
    cachedSdkSourceFile = ts.createSourceFile(VIRTUAL_SDK, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS)
    previousProgram = undefined
  }
  return cachedSdkSourceFile
}

function getLibSourceFile(fileName) {
  const key = fileName.startsWith(TS_LIB_DIR) ? fileName : join(TS_LIB_DIR, fileName)
  if (libSourceCache.has(key)) return libSourceCache.get(key)
  try {
    const content = readFileSync(key, 'utf8')
    const sf = ts.createSourceFile(key, content, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS)
    libSourceCache.set(key, sf)
    return sf
  } catch {
    libSourceCache.set(key, undefined)
    return undefined
  }
}

function positionOf(sourceFile, pos) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(Math.max(0, pos))
  return { line: line + 1, column: character + 1 }
}

function isPropertyAccessTarget(node) {
  const parent = node.parent
  if (!parent) return false
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return true
  if (ts.isPropertyAssignment(parent) && parent.name === node) return true
  if (ts.isPropertySignature(parent) && parent.name === node) return true
  if (ts.isMethodDeclaration(parent) && parent.name === node) return true
  if (ts.isMethodSignature(parent) && parent.name === node) return true
  if (ts.isBindingElement(parent) && parent.propertyName === node) return true
  if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) return true
  if (ts.isTypeReferenceNode(parent)) return true
  if (ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)) return true
  if ((ts.isParameter(parent) || ts.isVariableDeclaration(parent) || ts.isFunctionDeclaration(parent)) && parent.name === node) {
    return true
  }
  return false
}

function validatePolicy(sourceFile) {
  const errors = []
  let hasDefaultExport = false
  const report = (node, code, message) => {
    const { line, column } = positionOf(sourceFile, node.getStart(sourceFile))
    errors.push({ severity: 'error', line, column, code, message })
  }

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const spec = ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : ''
      if (!ALLOWED_IMPORTS.has(spec)) {
        report(
          node.moduleSpecifier,
          'CANVAS_IMPORT',
          `Import from "${spec}" is not allowed. Canvas files may import only from "dsh/canvas", "react", or "lucide-react".`,
        )
      }
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const spec = ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : ''
      if (!ALLOWED_IMPORTS.has(spec)) {
        report(
          node.moduleSpecifier,
          'CANVAS_EXPORT_FROM',
          `Re-exporting from "${spec}" is not allowed in Canvas files.`,
        )
      }
    } else if (ts.isExportAssignment(node) && !node.isExportEquals) {
      hasDefaultExport = true
    } else if (
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
      node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
      hasDefaultExport = true
    } else if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const el of node.exportClause.elements) {
        if (el.name.text === 'default') hasDefaultExport = true
      }
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        report(node, 'CANVAS_DYNAMIC_IMPORT', 'Dynamic import() is not allowed in Canvas files.')
      } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
        report(node, 'CANVAS_REQUIRE', 'Direct require() is not allowed; use ES imports from "dsh/canvas", "react", or "lucide-react".')
      }
    } else if (ts.isPropertyAccessExpression(node)) {
      const prop = node.name.text
      const targetText = node.expression.getText(sourceFile)
      if (
        (targetText === 'window' || targetText === 'globalThis' || targetText === 'self') &&
        FORBIDDEN_GLOBALS.has(prop)
      ) {
        report(node, 'CANVAS_FORBIDDEN_API', `Access to ${targetText}.${prop} is forbidden in the Canvas sandbox.`)
      } else if (targetText === 'navigator' && FORBIDDEN_NAVIGATOR_PROPS.has(prop)) {
        report(node, 'CANVAS_FORBIDDEN_API', `Access to navigator.${prop} is forbidden in the Canvas sandbox.`)
      }
    } else if (ts.isIdentifier(node) && FORBIDDEN_GLOBALS.has(node.text) && !isPropertyAccessTarget(node)) {
      report(node, 'CANVAS_FORBIDDEN_API', `Use of "${node.text}" is forbidden in the Canvas sandbox.`)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  if (!hasDefaultExport) {
    errors.push({
      severity: 'error',
      line: 1,
      column: 1,
      code: 'CANVAS_DEFAULT_EXPORT',
      message: 'Canvas file must have a default export React component (`export default function ...`).',
    })
  }
  return errors
}

function typeCheck(entrySourceFile) {
  const sdkSourceFile = getSdkSourceFile()
  const host = {
    getSourceFile(fileName) {
      if (fileName === VIRTUAL_ENTRY) return entrySourceFile
      if (fileName === VIRTUAL_SDK) return sdkSourceFile
      return getLibSourceFile(fileName)
    },
    writeFile() {},
    getDefaultLibFileName: () => 'lib.es2022.d.ts',
    useCaseSensitiveFileNames: () => true,
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => '/__dsh_canvas__',
    getNewLine: () => '\n',
    fileExists(fileName) {
      if (fileName === VIRTUAL_ENTRY || fileName === VIRTUAL_SDK) return true
      return getLibSourceFile(fileName) !== undefined
    },
    readFile() {
      return undefined
    },
    directoryExists: () => true,
    getDirectories: () => [],
  }

  const program = ts.createProgram([VIRTUAL_SDK, VIRTUAL_ENTRY], COMPILER_OPTIONS, host, previousProgram)
  previousProgram = program

  const raw = [
    ...program.getSyntacticDiagnostics(entrySourceFile),
    ...program.getSemanticDiagnostics(entrySourceFile),
  ]

  return raw.map(diag => {
    const loc = diag.file && typeof diag.start === 'number'
      ? positionOf(diag.file, diag.start)
      : { line: 1, column: 1 }
    return {
      severity: diag.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
      line: loc.line,
      column: loc.column,
      code: `TS${diag.code}`,
      message: ts.flattenDiagnosticMessageText(diag.messageText, '\n'),
    }
  })
}

export function compileCanvas(source) {
  if (typeof source !== 'string') {
    return {
      ok: false,
      compiled: null,
      diagnostics: [{ severity: 'error', line: 1, column: 1, code: 'CANVAS_INPUT', message: 'Canvas source must be a string.' }],
    }
  }
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) {
    return {
      ok: false,
      compiled: null,
      diagnostics: [{ severity: 'error', line: 1, column: 1, code: 'CANVAS_SIZE', message: `Canvas source exceeds ${MAX_SOURCE_BYTES} bytes.` }],
    }
  }

  const entrySourceFile = ts.createSourceFile(VIRTUAL_ENTRY, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX)
  const policyDiagnostics = validatePolicy(entrySourceFile)
  const tsDiagnostics = typeCheck(entrySourceFile)
  const diagnostics = [...policyDiagnostics, ...tsDiagnostics]
  const hasErrors = diagnostics.some(d => d.severity === 'error')

  if (hasErrors) {
    return { ok: false, compiled: null, diagnostics }
  }

  const transpiled = ts.transpileModule(source, {
    fileName: VIRTUAL_ENTRY,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
    reportDiagnostics: true,
  })

  const transpileErrors = (transpiled.diagnostics ?? []).map(diag => ({
    severity: 'error',
    line: 1,
    column: 1,
    code: `TS${diag.code}`,
    message: ts.flattenDiagnosticMessageText(diag.messageText, '\n'),
  }))

  if (transpileErrors.length > 0) {
    return { ok: false, compiled: null, diagnostics: [...diagnostics, ...transpileErrors] }
  }

  return {
    ok: true,
    compiled: transpiled.outputText,
    diagnostics,
  }
}

export function compileArtifact(source, kind = 'react') {
  if (kind === 'react') return compileCanvas(source)
  if (typeof source !== 'string') {
    return {
      ok: false,
      compiled: null,
      diagnostics: [{ severity: 'error', line: 1, column: 1, code: 'CANVAS_INPUT', message: 'Artifact source must be a string.' }],
    }
  }
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) {
    return {
      ok: false,
      compiled: null,
      diagnostics: [{ severity: 'error', line: 1, column: 1, code: 'CANVAS_SIZE', message: `Artifact source exceeds ${MAX_SOURCE_BYTES} bytes.` }],
    }
  }

  const diagnostics = []
  if (kind === 'html') {
    if (/<script[^>]+src\s*=/i.test(source)) {
      diagnostics.push({ severity: 'error', line: 1, column: 1, code: 'CANVAS_HTML_EXTERNAL', message: 'External <script src> is forbidden in HTML artifacts.' })
    }
    if (/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/i.test(source)) {
      diagnostics.push({ severity: 'error', line: 1, column: 1, code: 'CANVAS_FORBIDDEN_API', message: 'Network APIs (fetch/XHR/WebSocket/EventSource) are forbidden in HTML artifacts.' })
    }
    return { ok: diagnostics.length === 0, compiled: diagnostics.length === 0 ? source : null, diagnostics }
  }

  if (kind === 'svg') {
    if (!/<svg[\s>]/i.test(source)) {
      diagnostics.push({ severity: 'error', line: 1, column: 1, code: 'CANVAS_SVG_ROOT', message: 'SVG artifact must contain an <svg> element.' })
    }
    if (/<script[\s>]/i.test(source) || /\son[a-z]+\s*=/i.test(source) || /javascript:/i.test(source)) {
      diagnostics.push({ severity: 'error', line: 1, column: 1, code: 'CANVAS_SVG_UNSAFE', message: 'Scripts and inline event handlers are forbidden in SVG artifacts.' })
    }
    return { ok: diagnostics.length === 0, compiled: diagnostics.length === 0 ? source : null, diagnostics }
  }

  return compileCanvas(source)
}

export function getSdkDeclarations() {
  return readFileSync(SDK_PATH, 'utf8')
}

export function formatDiagnosticsSummary(diagnostics) {
  if (!diagnostics.length) return 'No errors.'
  return diagnostics
    .slice(0, 12)
    .map(d => `L${d.line}:${d.column} [${d.code}] ${d.message}`)
    .join('\n')
}
