import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

export const ALLOWED_IMPORT = 'dsh/canvas'
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
let previousProgram

function getSdkSourceFile() {
  if (!cachedSdkSourceFile) {
    const text = readFileSync(SDK_PATH, 'utf8')
    cachedSdkSourceFile = ts.createSourceFile(VIRTUAL_SDK, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS)
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
  if (ts.isTypeReferenceNode(parent) || ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)) return true
  if (ts.isParameter(parent) && parent.name === node) return true
  if (ts.isVariableDeclaration(parent) && parent.name === node) return true
  if (ts.isFunctionDeclaration(parent) && parent.name === node) return true
  if (ts.isJsxAttribute(parent) && parent.name === node) return true
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
      if (spec !== ALLOWED_IMPORT) {
        report(
          node.moduleSpecifier,
          'CANVAS_IMPORT',
          `Import from "${spec}" is not allowed. Canvas files may import only from "${ALLOWED_IMPORT}".`,
        )
      }
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const spec = ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : ''
      if (spec !== ALLOWED_IMPORT) {
        report(
          node.moduleSpecifier,
          'CANVAS_EXPORT_FROM',
          `Re-exporting from "${spec}" is not allowed in Canvas files.`,
        )
      }
    } else if (ts.isExportAssignment(node) && !node.isExportEquals) {
      hasDefaultExport = true
    } else if (
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node))
      && node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
      hasDefaultExport = true
    } else if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      if (node.exportClause.elements.some(el => el.name.text === 'default')) hasDefaultExport = true
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        report(node, 'CANVAS_DYNAMIC_IMPORT', 'Dynamic import() is not allowed in Canvas files.')
      } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
        report(node, 'CANVAS_REQUIRE', 'Direct require() calls are not allowed. Use ES imports from "dsh/canvas".')
      }
    } else if (ts.isPropertyAccessExpression(node)) {
      const targetName = ts.isIdentifier(node.expression) ? node.expression.text : ''
      const propName = node.name.text
      if ((targetName === 'window' || targetName === 'globalThis' || targetName === 'self') && FORBIDDEN_GLOBALS.has(propName)) {
        report(node, 'CANVAS_FORBIDDEN_API', `Access to ${targetName}.${propName} is not allowed in Canvas files.`)
      } else if (targetName === 'navigator' && FORBIDDEN_NAVIGATOR_PROPS.has(propName)) {
        report(node, 'CANVAS_FORBIDDEN_API', `Access to navigator.${propName} is not allowed in Canvas files.`)
      }
    } else if (ts.isIdentifier(node) && FORBIDDEN_GLOBALS.has(node.text) && !isPropertyAccessTarget(node)) {
      report(node, 'CANVAS_FORBIDDEN_API', `Global "${node.text}" is not allowed in Canvas files. Embed all data inline.`)
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
      message: 'Canvas file must default-export a React component (e.g. `export default function MyCanvas() { ... }`).',
    })
  }
  return errors
}

function runTypeCheck(sourceFile) {
  const sdkFile = getSdkSourceFile()
  const host = {
    getSourceFile(fileName) {
      if (fileName === VIRTUAL_ENTRY) return sourceFile
      if (fileName === VIRTUAL_SDK) return sdkFile
      return getLibSourceFile(fileName)
    },
    getDefaultLibFileName: options => join(TS_LIB_DIR, ts.getDefaultLibFileName(options)),
    writeFile() {},
    getCurrentDirectory: () => '/__dsh_canvas__',
    getCanonicalFileName: fileName => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists(fileName) {
      if (fileName === VIRTUAL_ENTRY || fileName === VIRTUAL_SDK) return true
      return getLibSourceFile(fileName) !== undefined
    },
    readFile() { return undefined },
    resolveModuleNames(moduleNames) {
      return moduleNames.map(name => (name === ALLOWED_IMPORT ? { resolvedFileName: VIRTUAL_SDK, isExternalLibraryImport: true } : undefined))
    },
  }

  const program = ts.createProgram([VIRTUAL_SDK, VIRTUAL_ENTRY], COMPILER_OPTIONS, host, previousProgram)
  previousProgram = program

  const rawDiagnostics = [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ]

  return rawDiagnostics.map(diag => {
    const start = typeof diag.start === 'number' ? diag.start : 0
    const { line, column } = positionOf(sourceFile, start)
    return {
      severity: diag.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
      line,
      column,
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
      diagnostics: [{ severity: 'error', line: 1, column: 1, code: 'CANVAS_SOURCE', message: 'Canvas source must be a string.' }],
    }
  }
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) {
    return {
      ok: false,
      compiled: null,
      diagnostics: [{ severity: 'error', line: 1, column: 1, code: 'CANVAS_SIZE', message: `Canvas source exceeds ${MAX_SOURCE_BYTES} bytes.` }],
    }
  }

  const sourceFile = ts.createSourceFile(VIRTUAL_ENTRY, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX)
  const policyErrors = validatePolicy(sourceFile)
  const tsDiagnostics = runTypeCheck(sourceFile)

  const seen = new Set()
  const diagnostics = []
  for (const diag of [...policyErrors, ...tsDiagnostics]) {
    const key = `${diag.line}:${diag.column}:${diag.code}:${diag.message}`
    if (!seen.has(key)) {
      seen.add(key)
      diagnostics.push(diag)
    }
  }

  const hasPolicyBlock = policyErrors.length > 0
  const hasSyntaxError = tsDiagnostics.some(d => /^TS1\d{3}$/.test(d.code))
  let compiled = null

  if (!hasPolicyBlock && !hasSyntaxError) {
    const emitted = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true,
      },
      fileName: VIRTUAL_ENTRY,
    })
    compiled = emitted.outputText
  }

  const errorCount = diagnostics.filter(d => d.severity === 'error').length
  return {
    ok: errorCount === 0 && typeof compiled === 'string',
    compiled,
    diagnostics,
  }
}

export function formatDiagnosticsSummary(diagnostics) {
  if (!Array.isArray(diagnostics) || diagnostics.length === 0) return 'Canvas TypeScript check: no errors'
  const errors = diagnostics.filter(d => d.severity === 'error')
  if (errors.length === 0) return 'Canvas TypeScript check: no errors'
  const lines = errors.slice(0, 12).map(d => `  L${d.line}:${d.column} [${d.code}] ${d.message}`)
  const extra = errors.length > 12 ? `\n  ...and ${errors.length - 12} more error(s)` : ''
  return `Canvas TypeScript check: ${errors.length} error(s)\n${lines.join('\n')}${extra}`
}

export function getSdkDeclarations() {
  return readFileSync(SDK_PATH, 'utf8')
}
