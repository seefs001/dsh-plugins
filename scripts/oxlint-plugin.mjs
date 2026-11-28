import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SUPPRESSION = /\b(?:oxlint-disable|eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck)\b/i
const LICENSE = /\b(?:SPDX-License-Identifier:|Copyright\b|Licensed under\b|MIT License\b)/i
const ALLOWED_LINE = /^ (?:external: \S|https?:\/\/\S)/
const LEGACY_COMPAT = /\b(?:dsh[-_]inbox|llm-pi-ai\/model-defaults|legacyHost|legacyReview)\b/

const FORBIDDEN_DIALOG_METHODS = new Set(['prompt', 'confirm', 'alert'])
const MODEL_SELECTION_FLAT_FIELDS = new Set(['provider', 'model', 'reasoningEffort'])
const SYNC_FS_METHODS = new Set([
  'existsSync',
  'readFileSync',
  'readdirSync',
  'statSync',
  'lstatSync',
  'writeFileSync',
  'mkdirSync',
  'rmSync',
  'renameSync',
  'cpSync',
  'appendFileSync',
  'copyFileSync',
])

const ALLOWED_EVENTSOURCE_FILES = new Set([
  'packages/acp-workbench/src/client.js',
  'packages/auto-review-model/src/client.js',
  'packages/canvas/src/client.js',
])
const ALLOWED_BODY_OBSERVER_FILES = new Set([
  'packages/session-groups/src/client.js',
])
const ALLOWED_FULL_SESSION_LIST_FILES = new Set([
  'packages/session-groups/src/client.js',
])

function getRelPath(context) {
  const raw = (context.filename ?? context.getFilename?.() ?? '').replaceAll('\\', '/')
  const match = /(?:^|\/)(packages\/.+)$/.exec(raw)
  return match ? match[1] : raw
}

function isTestFile(rel) {
  return /(?:^|\/)test\//.test(rel) || /\.test\.m?[jt]s$/.test(rel)
}

function isPackageFile(rel) {
  return rel.startsWith('packages/')
}

function isClientFile(rel) {
  return isPackageFile(rel) && !isTestFile(rel) && /(?:^|\/)(?:lib\/client|src\/client|client)(?:\.[A-Za-z0-9._-]+)?\.js$/.test(rel)
}

function isServerFile(rel) {
  return isPackageFile(rel) && !isTestFile(rel) && !isClientFile(rel)
}

function unwrapChain(node) {
  return node?.type === 'ChainExpression' ? node.expression : node
}

function propName(node) {
  if (!node) return null
  if (node.type === 'Identifier') return node.name
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  return null
}

function getStringContent(node) {
  if (!node) return null
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  if (node.type === 'TemplateLiteral') return node.quasis.map(q => q.value.raw).join('')
  return null
}

function isAllowedComment(comment) {
  if (comment.type === 'Shebang') return true
  if (comment.type === 'Line' && ALLOWED_LINE.test(comment.value)) return true
  if (comment.loc.start.line <= 5 && LICENSE.test(comment.value)) return true
  return false
}

function isModelSelectionCall(node) {
  const expr = unwrapChain(node)
  if (!expr) return false
  if (expr.type === 'ConditionalExpression') {
    return isModelSelectionCall(expr.consequent) || isModelSelectionCall(expr.alternate)
  }
  if (expr.type === 'LogicalExpression') {
    return isModelSelectionCall(expr.left) || isModelSelectionCall(expr.right)
  }
  if (expr.type !== 'CallExpression') return false
  const callee = unwrapChain(expr.callee)
  const calledUseProjection =
    (callee?.type === 'Identifier' && callee.name === 'useProjection')
    || (callee?.type === 'MemberExpression' && !callee.computed && propName(callee.property) === 'useProjection')
  if (!calledUseProjection) return false
  const firstArg = expr.arguments?.[0]
  return firstArg?.type === 'Literal' && firstArg.value === 'modelSelection'
}

function isDocumentProperty(node, name) {
  const expr = unwrapChain(node)
  return expr?.type === 'MemberExpression'
    && !expr.computed
    && expr.object?.type === 'Identifier'
    && expr.object.name === 'document'
    && propName(expr.property) === name
}

function isSessionsListExpr(node) {
  const expr = unwrapChain(node)
  if (expr?.type !== 'MemberExpression' || expr.computed || propName(expr.property) !== 'list') return false
  const obj = unwrapChain(expr.object)
  return (obj?.type === 'Identifier' && obj.name === 'sessions')
    || (obj?.type === 'MemberExpression' && !obj.computed && propName(obj.property) === 'sessions')
}

function isSessionsListSnapshotCall(node) {
  const expr = unwrapChain(node)
  if (expr?.type !== 'CallExpression') return false
  const callee = unwrapChain(expr.callee)
  return callee?.type === 'MemberExpression'
    && !callee.computed
    && propName(callee.property) === 'getSnapshot'
    && isSessionsListExpr(callee.object)
}

function returnedExpressionOf(fn) {
  if (!fn) return null
  if (fn.type === 'ArrowFunctionExpression' && fn.body.type !== 'BlockStatement') return fn.body
  if (fn.body?.type === 'BlockStatement' && fn.body.body.length === 1 && fn.body.body[0].type === 'ReturnStatement') {
    return fn.body.body[0].argument
  }
  return null
}

function collectDictKeys(objNode, prefix = '', out = new Set()) {
  if (!objNode || objNode.type !== 'ObjectExpression') return null
  for (const prop of objNode.properties) {
    if (prop.type !== 'Property' || prop.computed) return null
    const key = propName(prop.key)
    if (!key) return null
    const full = prefix ? `${prefix}.${key}` : key
    if (prop.value?.type === 'ObjectExpression') {
      if (!collectDictKeys(prop.value, full, out)) return null
    } else {
      out.add(full)
    }
  }
  return out
}

const noComments = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow comments except shebangs, license headers, URLs, and single-line // external: notes.' },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (SUPPRESSION.test(comment.value)) continue
          if (isAllowedComment(comment)) continue
          context.report({
            loc: comment.loc,
            message: 'Remove comment. Make code self-evident, or document an external constraint with "// external: <reason>".',
          })
        }
      },
    }
  },
}

const noSuppressionComments = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow lint and TypeScript suppression comments.' },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (!SUPPRESSION.test(comment.value)) continue
          context.report({
            loc: comment.loc,
            message: 'Do not suppress lint or type checks; fix the underlying code instead.',
          })
        }
      },
    }
  },
}

const noLegacyCompat = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow removed pre-release compatibility tokens.' },
  },
  create(context) {
    function check(node, text) {
      const match = LEGACY_COMPAT.exec(text)
      if (match) {
        context.report({
          node,
          message: `Remove pre-release compatibility reference "${match[0]}".`,
        })
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.raw)
      },
      Identifier(node) {
        check(node, node.name)
      },
    }
  },
}

const noRemovedHostApis = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow removed or nonexistent DSH 0.2.3 host APIs and browser native dialogs.' },
  },
  create(context) {
    const rel = getRelPath(context)
    return {
      Identifier(node) {
        if (isPackageFile(rel) && node.name === 'browserPeer') {
          context.report({
            node,
            message: 'Do not use browserPeer in DSH 0.2.3; do not rely on browserPeer identity checks.',
          })
        }
      },
      MemberExpression(node) {
        if (node.computed) return
        const prop = propName(node.property)
        const obj = unwrapChain(node.object)

        if (prop === 't' && obj?.type === 'MemberExpression' && !obj.computed && propName(obj.property) === 'locale') {
          context.report({
            node,
            message: 'DSH 0.2.3 has no ctx.locale.t(). Register dictionaries with ctx.locale.register(ns, { en, zh }) and use const t = ctx.locale.bind(ns).',
          })
          return
        }

        if (prop === 'events' && (
          (obj?.type === 'Identifier' && obj.name === 'session')
          || (obj?.type === 'MemberExpression' && !obj.computed && propName(obj.property) === 'session')
        )) {
          context.report({
            node,
            message: 'DSH 0.2.3 removed session.events. Use ctx.agents.turnBoundaryOf(session) or session.snapshotEvents() instead.',
          })
          return
        }

        if (prop === 'requestRejection') {
          context.report({
            node,
            message: 'DSH 0.2.3 has no ctx.connection.requestRejection. Handle rejection via HTTP status or explicit guard.',
          })
          return
        }

        if (prop === 'admit' && (
          (obj?.type === 'Identifier' && obj.name === 'connection')
          || (obj?.type === 'MemberExpression' && !obj.computed && propName(obj.property) === 'connection')
        )) {
          context.report({
            node,
            message: 'Do not call ctx.connection.admit(req) in route handlers; use the admitted third handler(req, res, peer) argument from ctx.webServer.register().',
          })
          return
        }

        if (prop === 'register' && (
          (obj?.type === 'Identifier' && obj.name === 'storageDomain')
          || (obj?.type === 'MemberExpression' && !obj.computed && propName(obj.property) === 'storageDomain')
        )) {
          context.report({
            node,
            message: 'DSH 0.2.3 removed storageDomain.register(). Use storageDomain.open(spec) with an "already-open" retry loop.',
          })
          return
        }

        if (FORBIDDEN_DIALOG_METHODS.has(prop) && obj?.type === 'Identifier' && (obj.name === 'window' || obj.name === 'globalThis')) {
          context.report({
            node,
            message: `Do not use ${obj.name}.${prop}() (unavailable in Electron). Use Modal from @deepseek-ai/dsh-client-ui-primitives.`,
          })
        }
      },
      Property(node) {
        if (node.computed || propName(node.key) !== 'locale' || node.value?.type !== 'ObjectExpression') return
        for (const inner of node.value.properties) {
          if (inner.type === 'Property' && !inner.computed && propName(inner.key) === 't') {
            context.report({
              node: inner,
              message: 'Do not stub nonexistent ctx.locale.t(). Stub register(), bind(), subscribe(), and getSnapshot() to match DSH 0.2.3.',
            })
          }
        }
      },
    }
  },
}

const requireCommandAvailable = {
  meta: {
    type: 'problem',
    docs: { description: 'Require an available callback in commandUi.register() declarations.' },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        if (callee?.type !== 'MemberExpression' || callee.computed || propName(callee.property) !== 'register') return
        const target = unwrapChain(callee.object)
        const isCommandUi =
          (target?.type === 'Identifier' && target.name === 'commandUi')
          || (target?.type === 'MemberExpression' && !target.computed && propName(target.property) === 'commandUi')
        if (!isCommandUi) return
        const firstArg = node.arguments?.[0]
        if (!firstArg || firstArg.type !== 'ObjectExpression') return
        const hasAvailableOrSpread = firstArg.properties.some(
          p => p.type === 'SpreadElement' || (p.type === 'Property' && !p.computed && propName(p.key) === 'available'),
        )
        if (!hasAvailableOrSpread) {
          context.report({
            node: firstArg,
            message: 'commandUi.register() must include an "available" callback (e.g. available: () => true); DSH 0.2.3 invokes contribution.available(session) unconditionally.',
          })
        }
      },
    }
  },
}

const noDirectModelSelectionFields = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow reading flat .provider/.model/.reasoningEffort directly on useProjection("modelSelection").' },
  },
  create(context) {
    const scopeStack = [new Set()]
    const current = () => scopeStack[scopeStack.length - 1]
    const hasVar = name => {
      for (let i = scopeStack.length - 1; i >= 0; i -= 1) {
        if (scopeStack[i].has(name)) return true
      }
      return false
    }
    const enter = () => scopeStack.push(new Set())
    const exit = () => scopeStack.pop()

    return {
      FunctionDeclaration: enter,
      'FunctionDeclaration:exit': exit,
      FunctionExpression: enter,
      'FunctionExpression:exit': exit,
      ArrowFunctionExpression: enter,
      'ArrowFunctionExpression:exit': exit,
      VariableDeclarator(node) {
        if (node.id?.type === 'Identifier' && isModelSelectionCall(node.init)) {
          current().add(node.id.name)
        }
      },
      MemberExpression(node) {
        if (node.computed) return
        const prop = propName(node.property)
        if (!MODEL_SELECTION_FLAT_FIELDS.has(prop)) return
        const obj = unwrapChain(node.object)
        const directCall = isModelSelectionCall(obj)
        const trackedIdent = obj?.type === 'Identifier' && hasVar(obj.name)
        if (directCall || trackedIdent) {
          context.report({
            node,
            message: `DSH 0.2.3 modelSelection projection has shape { next, lastUsed }, not flat ".${prop}". Unwrap with projection?.next ?? projection?.lastUsed first.`,
          })
        }
      },
    }
  },
}

const noRootThemeComputedStyle = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow reading host theme variables via getComputedStyle(document.documentElement).' },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        const isGetComputedStyle =
          (callee?.type === 'Identifier' && callee.name === 'getComputedStyle')
          || (callee?.type === 'MemberExpression' && !callee.computed && propName(callee.property) === 'getComputedStyle')
        if (!isGetComputedStyle) return
        if (isDocumentProperty(node.arguments?.[0], 'documentElement')) {
          context.report({
            node: node.arguments[0],
            message: 'DSH --dsw-alias-* tokens live on document.body, not document.documentElement. Pass document.body (or document.body || document.documentElement).',
          })
        }
      },
    }
  },
}

const localeDictParity = {
  meta: {
    type: 'problem',
    docs: { description: 'Require inline en and zh locale dictionaries registered via ctx.locale.register() to have identical keys.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    const objectVars = new Map()
    const pairs = []
    const splitEn = []
    const splitZh = []
    const iteratedContainers = []

    function resolveObj(node) {
      if (!node) return null
      if (node.type === 'ObjectExpression') return node
      if (node.type === 'Identifier') return objectVars.get(node.name) ?? null
      if (node.type === 'MemberExpression' && !node.computed) {
        const parent = resolveObj(node.object)
        const key = propName(node.property)
        if (!parent || !key) return null
        const hit = parent.properties.find(p => p.type === 'Property' && !p.computed && propName(p.key) === key)
        return hit ? resolveObj(hit.value) : null
      }
      return null
    }

    function compareObjects(reportNode, enObj, zhObj) {
      const enKeys = collectDictKeys(enObj)
      const zhKeys = collectDictKeys(zhObj)
      if (!enKeys || !zhKeys) return
      const missingInZh = [...enKeys].filter(k => !zhKeys.has(k)).toSorted()
      const missingInEn = [...zhKeys].filter(k => !enKeys.has(k)).toSorted()
      if (missingInZh.length > 0 || missingInEn.length > 0) {
        const parts = []
        if (missingInZh.length > 0) parts.push(`missing in zh: ${missingInZh.slice(0, 6).join(', ')}`)
        if (missingInEn.length > 0) parts.push(`missing in en: ${missingInEn.slice(0, 6).join(', ')}`)
        context.report({
          node: reportNode,
          message: `Inline en/zh locale dictionaries must have matching keys (${parts.join('; ')}).`,
        })
      }
    }

    function checkCombinedDict(reportNode, expr) {
      const obj = resolveObj(expr)
      if (!obj) return
      const enProp = obj.properties.find(p => p.type === 'Property' && !p.computed && propName(p.key) === 'en')
      const zhProp = obj.properties.find(p => p.type === 'Property' && !p.computed && propName(p.key) === 'zh')
      if (!enProp || !zhProp) return
      const enObj = resolveObj(enProp.value)
      const zhObj = resolveObj(zhProp.value)
      if (enObj && zhObj) compareObjects(reportNode, enObj, zhObj)
    }

    return {
      VariableDeclarator(node) {
        if (node.id?.type === 'Identifier' && node.init?.type === 'ObjectExpression') {
          if (!objectVars.has(node.id.name)) objectVars.set(node.id.name, node.init)
        }
      },
      ForOfStatement(node) {
        const right = unwrapChain(node.right)
        if (
          right?.type === 'CallExpression'
          && right.callee?.type === 'MemberExpression'
          && right.callee.object?.type === 'Identifier'
          && right.callee.object.name === 'Object'
          && propName(right.callee.property) === 'entries'
          && right.arguments?.[0]
        ) {
          const text = context.sourceCode.getText(node.body)
          if (/locale\.register\s*\(/.test(text)) {
            iteratedContainers.push({ node: right.arguments[0], expr: right.arguments[0] })
          }
        }
      },
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        if (callee?.type !== 'MemberExpression' || callee.computed || propName(callee.property) !== 'register') return
        const target = unwrapChain(callee.object)
        if (target?.type !== 'MemberExpression' || target.computed || propName(target.property) !== 'locale') return
        if (node.arguments.length === 2) {
          pairs.push({ node: node.arguments[1], expr: node.arguments[1] })
        } else if (node.arguments.length === 3 && node.arguments[1]?.type === 'Literal') {
          if (node.arguments[1].value === 'en') splitEn.push({ node: node.arguments[2], expr: node.arguments[2] })
          if (node.arguments[1].value === 'zh') splitZh.push({ node: node.arguments[2], expr: node.arguments[2] })
        }
      },
      'Program:exit'() {
        for (const item of pairs) checkCombinedDict(item.node, item.expr)
        for (const item of iteratedContainers) checkCombinedDict(item.node, item.expr)
        const count = Math.min(splitEn.length, splitZh.length)
        for (let i = 0; i < count; i += 1) {
          const enObj = resolveObj(splitEn[i].expr)
          const zhObj = resolveObj(splitZh[i].expr)
          if (enObj && zhObj) compareObjects(splitZh[i].node, enObj, zhObj)
        }
      },
    }
  },
}

const noBroadSessionSubscription = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow subscribing components to the entire session map (s.byId, s.ids, or raw ctx.sessions.list).' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    return {
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        const name = callee?.type === 'Identifier'
          ? callee.name
          : (callee?.type === 'MemberExpression' && !callee.computed ? propName(callee.property) : null)

        if (name === 'useSessions' && node.arguments.length >= 1) {
          const sel = node.arguments[0]
          if (sel?.type === 'ArrowFunctionExpression' || sel?.type === 'FunctionExpression') {
            const param = sel.params?.[0]?.type === 'Identifier' ? sel.params[0].name : null
            const ret = unwrapChain(returnedExpressionOf(sel))
            if (
              param
              && ret?.type === 'MemberExpression'
              && !ret.computed
              && ret.object?.type === 'Identifier'
              && ret.object.name === param
              && (propName(ret.property) === 'byId' || propName(ret.property) === 'ids')
            ) {
              context.report({
                node: sel,
                message: `Do not subscribe to the entire sessions "${propName(ret.property)}" collection. Select a primitive field (e.g. s.byId?.[sessionId]?.cwd ?? '') or derive a cached snapshot with equality checks.`,
              })
            }
          }
          return
        }

        if (name === 'useSource' && isSessionsListExpr(node.arguments?.[0])) {
          if (ALLOWED_FULL_SESSION_LIST_FILES.has(rel)) return
          context.report({
            node,
            message: 'Do not subscribe directly to full ctx.sessions.list. Use a narrowed useSyncExternalStore snapshot returning a primitive or structurally-compared slice.',
          })
          return
        }

        if (name === 'useSyncExternalStore' && node.arguments.length >= 2) {
          if (ALLOWED_FULL_SESSION_LIST_FILES.has(rel)) return
          const snapFn = node.arguments[1]
          if (snapFn?.type === 'ArrowFunctionExpression' || snapFn?.type === 'FunctionExpression') {
            const ret = returnedExpressionOf(snapFn)
            if (isSessionsListSnapshotCall(ret)) {
              context.report({
                node: snapFn,
                message: 'Do not return the full ctx.sessions.list.getSnapshot() from useSyncExternalStore. Derive a primitive or cached slice for the active session.',
              })
            }
          }
        }
      },
    }
  },
}

const requireMobileBackdropFallback = {
  meta: {
    type: 'problem',
    docs: { description: 'Require a mobile/coarse-pointer fallback disabling backdrop-filter in client CSS.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    const HAS_BACKDROP = /(?<![a-z-])backdrop-filter\s*:\s*(?!none\b|initial\b|unset\b)/i
    const HAS_MOBILE_FALLBACK = /@media[^{]*(?:max-width|pointer\s*:\s*coarse)[^{]*\{[\s\S]*?backdrop-filter\s*:\s*none\b/i

    function check(node) {
      const text = getStringContent(node)
      if (!text || !HAS_BACKDROP.test(text)) return
      if (!HAS_MOBILE_FALLBACK.test(text)) {
        context.report({
          node,
          message: 'CSS with backdrop-filter must add a mobile fallback: @media (max-width:768px),(pointer:coarse){...backdrop-filter:none;-webkit-backdrop-filter:none} with an opaque --dsw-alias-bg-* background.',
        })
      }
    }

    return {
      TemplateLiteral: check,
      Literal(node) {
        if (typeof node.value === 'string') check(node)
      },
    }
  },
}

const noUnconstrainedNowrap = {
  meta: {
    type: 'problem',
    docs: { description: 'Require overflow:hidden when a client CSS rule combines min-width:0 and white-space:nowrap.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    const BLOCK_RE = /([^{};@][^{}]*?)\{([^{}]+)\}/g
    const MIN_WIDTH_ZERO = /(?:^|[;\s])min-width\s*:\s*0(?:px|rem|em|%)?(?=\s*(?:;|!|$))/i
    const NOWRAP = /(?:^|[;\s])white-space\s*:\s*nowrap(?=\s*(?:;|!|$))/i
    const OVERFLOW_CLIP = /(?:^|[;\s])overflow(?:-x)?\s*:\s*(?:hidden|clip|auto|scroll)(?=\s*(?:;|!|$))/i

    function check(node) {
      const text = getStringContent(node)
      if (!text || !text.includes('white-space') || !text.includes('min-width')) return
      BLOCK_RE.lastIndex = 0
      let match
      while ((match = BLOCK_RE.exec(text)) !== null) {
        const selector = match[1].trim()
        const body = match[2]
        if (!selector || selector.startsWith('@')) continue
        if (MIN_WIDTH_ZERO.test(body) && NOWRAP.test(body) && !OVERFLOW_CLIP.test(body)) {
          context.report({
            node,
            message: `CSS rule "${selector.slice(0, 60)}" combines min-width:0 and white-space:nowrap without overflow:hidden, causing text overlap on narrow viewports.`,
          })
          return
        }
      }
    }

    return {
      TemplateLiteral: check,
      Literal(node) {
        if (typeof node.value === 'string') check(node)
      },
    }
  },
}

const safeIntervals = {
  meta: {
    type: 'problem',
    docs: { description: 'Require server setInterval timers to call .unref?.() and client setInterval timers to guard document.hidden or self-clear.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isPackageFile(rel) || isTestFile(rel)) return {}

    const serverMode = isServerFile(rel)
    const clientMode = isClientFile(rel)
    const fnBodies = new Map()
    const clientCalls = []
    const serverCalls = []
    const scopeStack = []

    function pushScope(node) {
      scopeStack.push(node)
    }
    function popScope() {
      scopeStack.pop()
    }

    function hasVisibilityOrSelfClear(text) {
      return /\bdocument\.hidden\b|\bvisibilityState\b|\bclearInterval\s*\(/.test(text)
    }

    function escapesRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    return {
      Program: pushScope,
      'Program:exit'() {
        for (const call of clientCalls) {
          const cb = call.arguments?.[0]
          if (!cb) continue
          let bodyText = context.sourceCode.getText(cb)
          if (cb.type === 'Identifier' && fnBodies.has(cb.name)) {
            bodyText = fnBodies.get(cb.name)
          }
          if (!hasVisibilityOrSelfClear(bodyText)) {
            context.report({
              node: call,
              message: 'Client setInterval() must skip work when document.hidden (or document.visibilityState !== "visible") unless it is a bounded self-clearing retry.',
            })
          }
        }

        for (const { call, scope, targetText } of serverCalls) {
          const cb = call.arguments?.[0]
          if (cb) {
            let bodyText = context.sourceCode.getText(cb)
            if (cb.type === 'Identifier' && fnBodies.has(cb.name)) {
              bodyText = fnBodies.get(cb.name)
            }
            if (/\.\s*write\s*\(/.test(bodyText) && !/\bdestroyed\b|\bwritableEnded\b/.test(bodyText)) {
              context.report({
                node: call,
                message: 'Server setInterval() writing to a response stream must guard (res.destroyed || res.writableEnded) before calling .write().',
              })
            }
          }
          const parent = call.parent
          if (
            parent?.type === 'MemberExpression'
            && !parent.computed
            && propName(parent.property) === 'unref'
          ) continue
          if (targetText) {
            const scopeText = context.sourceCode.getText(scope)
            const re = new RegExp(`${escapesRegex(targetText)}\\s*(?:\\?\\.)?\\.unref(?:\\?\\.)?\\s*\\(`)
            if (re.test(scopeText)) continue
          }
          context.report({
            node: call,
            message: 'Server setInterval() must call .unref?.() so background timers do not keep the Host process alive on shutdown.',
          })
        }
        popScope()
      },
      BlockStatement: pushScope,
      'BlockStatement:exit': popScope,
      FunctionDeclaration(node) {
        if (node.id?.name) fnBodies.set(node.id.name, context.sourceCode.getText(node))
      },
      VariableDeclarator(node) {
        if (
          node.id?.type === 'Identifier'
          && (node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression')
        ) {
          fnBodies.set(node.id.name, context.sourceCode.getText(node.init))
        }
      },
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        const isSetInterval =
          (callee?.type === 'Identifier' && callee.name === 'setInterval')
          || (callee?.type === 'MemberExpression' && !callee.computed && propName(callee.property) === 'setInterval')
        if (!isSetInterval) return
        if (clientMode) {
          clientCalls.push(node)
          return
        }
        if (serverMode) {
          const parent = node.parent
          let targetText = null
          if (parent?.type === 'VariableDeclarator' && parent.id?.type === 'Identifier') {
            targetText = parent.id.name
          } else if (parent?.type === 'AssignmentExpression' && parent.right === node) {
            targetText = context.sourceCode.getText(parent.left)
          }
          serverCalls.push({ call: node, scope: scopeStack[scopeStack.length - 1], targetText })
        }
      },
    }
  },
}

const noNewAlwaysOnObservers = {
  meta: {
    type: 'problem',
    docs: { description: 'Prevent adding new EventSource connections or document.body MutationObservers beyond explicit allowlists.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    return {
      NewExpression(node) {
        if (node.callee?.type === 'Identifier' && node.callee.name === 'EventSource') {
          if (ALLOWED_EVENTSOURCE_FILES.has(rel)) return
          context.report({
            node,
            message: 'Do not add new EventSource connections (HTTP/1.1 allows only 6 sockets per origin). Use on-demand GET + write-through + BroadcastChannel, or open SSE only on demand and update the allowlist.',
          })
        }
      },
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        if (callee?.type !== 'MemberExpression' || callee.computed || propName(callee.property) !== 'observe') return
        if (isDocumentProperty(node.arguments?.[0], 'body')) {
          if (ALLOWED_BODY_OBSERVER_FILES.has(rel)) return
          context.report({
            node,
            message: 'Do not add new document.body MutationObservers. Prefer DSH slots or narrow container observers that disconnect immediately after mounting.',
          })
        }
      },
    }
  },
}

const noServerHotSyncFs = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow synchronous fs.*Sync calls inside async Host functions.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isServerFile(rel)) return {}

    const asyncDepth = []
    const isAsync = () => asyncDepth.length > 0 && asyncDepth[asyncDepth.length - 1]
    const enterFn = node => asyncDepth.push(Boolean(node.async))
    const exitFn = () => asyncDepth.pop()

    return {
      FunctionDeclaration: enterFn,
      'FunctionDeclaration:exit': exitFn,
      FunctionExpression: enterFn,
      'FunctionExpression:exit': exitFn,
      ArrowFunctionExpression: enterFn,
      'ArrowFunctionExpression:exit': exitFn,
      CallExpression(node) {
        if (!isAsync()) return
        const callee = unwrapChain(node.callee)
        const name = callee?.type === 'Identifier'
          ? callee.name
          : (callee?.type === 'MemberExpression' && !callee.computed ? propName(callee.property) : null)
        if (name && SYNC_FS_METHODS.has(name)) {
          context.report({
            node,
            message: `Do not call synchronous ${name}() inside an async Host function; use node:fs/promises (or cache once at startup) to avoid blocking the event loop.`,
          })
        }
      },
    }
  },
}

const SKIP_NESTED_FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

function visitFunctionScope(node, isRoot, visitor) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const item of node) visitFunctionScope(item, false, visitor)
    return
  }
  if (typeof node.type !== 'string') return
  if (!isRoot && SKIP_NESTED_FUNCTIONS.has(node.type)) return
  visitor(node)
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range' || key === 'tokens' || key === 'comments') continue
    if (value && typeof value === 'object') visitFunctionScope(value, false, visitor)
  }
}

const noWithdrawViewNode = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow Conversation buildViewNode definitions from returning null once materialized instead of returning hidden visibility.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    const objectVars = new Map()
    const fnVars = new Map()
    const registered = []

    function isConversationEventsRegister(node) {
      const callee = unwrapChain(node.callee)
      if (callee?.type !== 'MemberExpression' || callee.computed || propName(callee.property) !== 'register') return false
      const eventsObj = unwrapChain(callee.object)
      if (eventsObj?.type !== 'MemberExpression' || eventsObj.computed || propName(eventsObj.property) !== 'events') return false
      const convObj = unwrapChain(eventsObj.object)
      return (convObj?.type === 'Identifier' && convObj.name === 'uiConversation')
        || (convObj?.type === 'MemberExpression' && !convObj.computed && propName(convObj.property) === 'uiConversation')
    }

    function analyzeReturnExpr(expr, guardedByCurrent, out) {
      if (!expr) return
      if (expr.type === 'Literal' && expr.value === null) {
        out.returnsNull = true
        if (!guardedByCurrent) out.unguardedNulls.push(expr)
        return
      }
      if (expr.type === 'ConditionalExpression') {
        const testText = context.sourceCode.getText(expr.test)
        const nextGuard = guardedByCurrent || /\bcurrent\b/.test(testText)
        analyzeReturnExpr(expr.consequent, nextGuard, out)
        analyzeReturnExpr(expr.alternate, nextGuard, out)
        return
      }
      out.returnsNonNull = true
    }

    function isGuardedByAncestorCurrent(stmt, stopNode) {
      let cur = stmt.parent
      while (cur && cur !== stopNode) {
        if (cur.type === 'IfStatement' && /\bcurrent\b/.test(context.sourceCode.getText(cur.test))) {
          return true
        }
        cur = cur.parent
      }
      return false
    }

    function checkDefinition(defNode) {
      if (!defNode || defNode.type !== 'ObjectExpression') return
      const prop = defNode.properties.find(p => p.type === 'Property' && !p.computed && propName(p.key) === 'buildViewNode')
      if (!prop) return
      let fn = prop.value
      if (fn?.type === 'Identifier') fn = fnVars.get(fn.name)
      if (!fn || !SKIP_NESTED_FUNCTIONS.has(fn.type)) return

      const out = { returnsNull: false, returnsNonNull: false, unguardedNulls: [] }
      if (fn.type === 'ArrowFunctionExpression' && fn.body.type !== 'BlockStatement') {
        analyzeReturnExpr(fn.body, false, out)
      } else {
        visitFunctionScope(fn.body, true, inner => {
          if (inner.type !== 'ReturnStatement') return
          const guarded = isGuardedByAncestorCurrent(inner, fn)
          analyzeReturnExpr(inner.argument, guarded, out)
        })
      }

      if (!out.returnsNull || !out.returnsNonNull) return
      const fnText = context.sourceCode.getText(fn)
      const readsCurrent = /\.current\b/.test(fnText)
      const emitsHidden = /['"]hidden['"]/.test(fnText)
      if (!readsCurrent || !emitsHidden || out.unguardedNulls.length > 0) {
        context.report({
          node: out.unguardedNulls[0] ?? fn,
          message: 'buildViewNode must not withdraw a materialized target by returning null; read context.current?.get(target) and return { ...current, visibility: "hidden" } when current is non-null.',
        })
      }
    }

    return {
      VariableDeclarator(node) {
        if (node.id?.type !== 'Identifier' || !node.init) return
        if (node.init.type === 'ObjectExpression') objectVars.set(node.id.name, node.init)
        else if (SKIP_NESTED_FUNCTIONS.has(node.init.type)) fnVars.set(node.id.name, node.init)
      },
      FunctionDeclaration(node) {
        if (node.id?.name) fnVars.set(node.id.name, node)
      },
      CallExpression(node) {
        if (!isConversationEventsRegister(node)) return
        const firstArg = node.arguments?.[0]
        if (firstArg) registered.push(firstArg)
      },
      'Program:exit'() {
        for (const arg of registered) {
          const defObj = arg.type === 'Identifier' ? objectVars.get(arg.name) : arg
          checkDefinition(defObj)
        }
      },
    }
  },
}

const LOOP_TYPES = new Set(['ForStatement', 'WhileStatement', 'DoWhileStatement'])

const safeStorageDomainOpen = {
  meta: {
    type: 'problem',
    docs: { description: 'Require server storageDomain.open() calls to retry DomainError("already-open") across plugin reload overlap.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isServerFile(rel)) return {}

    return {
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        if (callee?.type !== 'MemberExpression' || callee.computed || propName(callee.property) !== 'open') return
        const target = unwrapChain(callee.object)
        const isStorageDomain =
          (target?.type === 'Identifier' && target.name === 'storageDomain')
          || (target?.type === 'MemberExpression' && !target.computed && propName(target.property) === 'storageDomain')
        if (!isStorageDomain) return

        let inAlreadyOpenTry = false
        let inLoop = false
        let prev = node
        let cur = node.parent
        while (cur) {
          if (cur.type === 'TryStatement' && cur.block === prev && cur.handler) {
            const catchText = context.sourceCode.getText(cur.handler)
            if (/['"]already-open['"]/.test(catchText)) inAlreadyOpenTry = true
          }
          if (LOOP_TYPES.has(cur.type)) inLoop = true
          if (SKIP_NESTED_FUNCTIONS.has(cur.type)) break
          prev = cur
          cur = cur.parent
        }

        if (!inAlreadyOpenTry || !inLoop) {
          context.report({
            node,
            message: 'storageDomain.open() can throw DomainError("already-open") during DSH plugin reload; wrap it in a bounded retry loop checking error?.code === "already-open".',
          })
        }
      },
    }
  },
}

const SINGLE_CHILD_OWNER_SLOTS = new Set([
  'root',
  'sidebar',
  'rightbar',
  'rightbar.session',
  'main.conversation',
  'conversation.session',
  'conversation.view',
  'conversation.chat.flow',
  'conversation.composer.bar',
  'conversation.composer',
  'conversation.header',
  'conversation.session.header',
  'conversation.chat.aside',
  'conversation.input.model',
  'sidebar.workspaces',
  'sidebar.settings',
])

const CHILDREN_OWNING_HOST_ENTRIES = {
  'tool.call.toolview': { field: 'key', values: new Set(['read_image', 'cordis_run']) },
  'conversation.chat.node': { field: 'key', values: new Set(['user', 'assistant', 'tool-call']) },
  'conversation.session.panel.section': { field: 'id', values: new Set(['environment', 'change-requests']) },
  'conversation.chat.turnTail': { field: 'id', values: new Set(['deliverables']) },
}

function resolveStaticScalar(node, constValues) {
  if (!node) return undefined
  if (node.type === 'Literal') return node.value
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument?.type === 'Literal' && typeof node.argument.value === 'number') {
    return -node.argument.value
  }
  if (node.type === 'Identifier' && constValues.has(node.name)) return constValues.get(node.name)
  return undefined
}

function findObjectProperty(objNode, name) {
  if (!objNode || objNode.type !== 'ObjectExpression') return null
  return objNode.properties.find(p => p.type === 'Property' && !p.computed && propName(p.key) === name) ?? null
}

function isSlotsCall(node, method) {
  const callee = unwrapChain(node?.callee)
  if (callee?.type !== 'MemberExpression' || callee.computed || propName(callee.property) !== method) return false
  const obj = unwrapChain(callee.object)
  return (obj?.type === 'Identifier' && obj.name === 'slots')
    || (obj?.type === 'MemberExpression' && !obj.computed && propName(obj.property) === 'slots')
}

function isCreateElementCall(node) {
  const callee = unwrapChain(node?.callee)
  if (callee?.type === 'Identifier' && callee.name === 'h') return true
  return callee?.type === 'MemberExpression' && !callee.computed && propName(callee.property) === 'createElement'
}

const safeSlotShadowing = {
  meta: {
    type: 'problem',
    docs: { description: 'Prevent unsafe DSH slot shadowing that drops declared children/renderSlot, unguarded base.inject calls, raw base.component delegation, or cached locale.bind inside inject.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    const constValues = new Map()
    const objectVars = new Map()
    const fnVars = new Map()
    const registerCalls = []
    const componentDelegations = []
    const unguardedInjectCalls = []
    let readsSlotEntries = false

    function containsLocaleBind(node) {
      let hit = null
      visitFunctionScope(node, true, inner => {
        if (hit || inner.type !== 'CallExpression') return
        const callee = unwrapChain(inner.callee)
        if (callee?.type !== 'MemberExpression' || callee.computed || propName(callee.property) !== 'bind') return
        const target = unwrapChain(callee.object)
        const isLocale = (target?.type === 'Identifier' && target.name === 'locale')
          || (target?.type === 'MemberExpression' && !target.computed && propName(target.property) === 'locale')
        if (isLocale) hit = inner
      })
      return hit
    }

    return {
      VariableDeclarator(node) {
        if (node.id?.type !== 'Identifier' || !node.init) return
        const name = node.id.name
        if (node.parent?.kind === 'const') {
          const val = resolveStaticScalar(node.init, constValues)
          if (val !== undefined) {
            if (!constValues.has(name)) constValues.set(name, val)
            else if (constValues.get(name) !== val) constValues.set(name, undefined)
          }
        }
        if (node.init.type === 'ObjectExpression') {
          if (!objectVars.has(name)) objectVars.set(name, node.init)
          else objectVars.set(name, null)
        } else if (SKIP_NESTED_FUNCTIONS.has(node.init.type)) {
          if (!fnVars.has(name)) fnVars.set(name, node.init)
          else fnVars.set(name, null)
        }
      },
      FunctionDeclaration(node) {
        if (node.id?.name) {
          if (!fnVars.has(node.id.name)) fnVars.set(node.id.name, node)
          else fnVars.set(node.id.name, null)
        }
      },
      CallExpression(node) {
        if (isSlotsCall(node, 'entries')) {
          readsSlotEntries = true
          return
        }
        if (isSlotsCall(node, 'register')) {
          registerCalls.push(node)
          return
        }
        if (isCreateElementCall(node)) {
          const first = unwrapChain(node.arguments?.[0])
          const second = node.arguments?.[1]
          if (
            first?.type === 'MemberExpression'
            && !first.computed
            && propName(first.property) === 'component'
            && second?.type === 'Identifier'
          ) {
            componentDelegations.push(node)
          }
        }
        const callee = unwrapChain(node.callee)
        if (
          callee?.type === 'MemberExpression'
          && !callee.computed
          && propName(callee.property) === 'inject'
          && !node.optional
        ) {
          const receiver = unwrapChain(callee.object)
          const firstArg = node.arguments?.[0]
          const isContextOrSlots =
            (receiver?.type === 'Identifier' && (receiver.name === 'ctx' || receiver.name === 'scope' || receiver.name === 'slots'))
            || (receiver?.type === 'MemberExpression' && !receiver.computed && (propName(receiver.property) === 'ctx' || propName(receiver.property) === 'slots'))
            || firstArg?.type === 'ArrayExpression'
          if (!isContextOrSlots) unguardedInjectCalls.push(node)
        }
      },
      'Program:exit'() {
        for (const call of registerCalls) {
          const rawOpt = call.arguments?.[0]
          const optObj = rawOpt?.type === 'ObjectExpression'
            ? rawOpt
            : (rawOpt?.type === 'Identifier' ? objectVars.get(rawOpt.name) : null)
          if (!optObj) continue

          const slotName = resolveStaticScalar(findObjectProperty(optObj, 'name')?.value, constValues)
          const entryKey = resolveStaticScalar(findObjectProperty(optObj, 'key')?.value, constValues)
          const entryId = resolveStaticScalar(findObjectProperty(optObj, 'id')?.value, constValues)
          const priority = resolveStaticScalar(findObjectProperty(optObj, 'priority')?.value, constValues)
          const hasChildren = Boolean(findObjectProperty(optObj, 'children'))

          if (typeof slotName === 'string' && SINGLE_CHILD_OWNER_SLOTS.has(slotName)) {
            context.report({
              node: rawOpt,
              message: `Do not shadow host container slot "${slotName}"; shadowing it removes its declared child slots and breaks renderSlot. Register into one of its child slots instead.`,
            })
          } else if (
            slotName === 'sidebar.right.pane.tab'
            && ((typeof entryKey === 'string' && entryKey.startsWith('@deepseek-ai/')) || (typeof priority === 'number' && priority < 0))
          ) {
            context.report({
              node: rawOpt,
              message: 'Do not shadow built-in "sidebar.right.pane.tab" entries (they declare child slots like forge.changes.toolbar and SlotCore forbids duplicate children, causing "renderSlot is not a function"). Register into the tab\'s child slot instead.',
            })
          } else if (typeof slotName === 'string' && Object.hasOwn(CHILDREN_OWNING_HOST_ENTRIES, slotName) && !hasChildren) {
            const spec = CHILDREN_OWNING_HOST_ENTRIES[slotName]
            const targetVal = spec.field === 'key' ? entryKey : entryId
            if (typeof targetVal === 'string' && spec.values.has(targetVal)) {
              context.report({
                node: rawOpt,
                message: `Shadowing "${slotName}" (${targetVal}) drops its declared child slots and breaks renderSlot. Prefer a child/sibling slot, or declare a private mirrored child slot in options.children.`,
              })
            }
          }

          const injectProp = findObjectProperty(optObj, 'inject')
          if (injectProp) {
            let injectFn = injectProp.value
            if (injectFn?.type === 'Identifier') injectFn = fnVars.get(injectFn.name)
            if (injectFn && SKIP_NESTED_FUNCTIONS.has(injectFn.type)) {
              const bindHit = containsLocaleBind(injectFn.body)
              if (bindHit) {
                context.report({
                  node: bindHit,
                  message: 'Do not call ctx.locale.bind() inside slots.register({ inject }); DSH caches inject() per session so delegated translator identity freezes across locale switches. Bind base.locale inside the component keyed on ctx.locale.getSnapshot().revision.',
                })
              }
            }
          }
        }

        if (readsSlotEntries) {
          for (const call of unguardedInjectCalls) {
            context.report({
              node: call,
              message: 'Guard optional slot entry inject with optional chaining (base.inject?.(sessionId)) or a typeof check; shadowed entries may omit inject.',
            })
          }
          for (const call of componentDelegations) {
            context.report({
              node: call,
              message: 'Do not delegate h(base.component, props) directly without merging forwarded base.inject?.(sessionId) and reactive base.locale bindings (or prefer a child/sibling slot instead of shadowing).',
            })
          }
        }
      },
    }
  },
}

const requireSwitchLabel = {
  meta: {
    type: 'problem',
    docs: { description: 'Require every Switch primitive in client plugins to specify a non-empty accessible label.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isClientFile(rel)) return {}

    return {
      CallExpression(node) {
        if (!isCreateElementCall(node)) return
        const comp = unwrapChain(node.arguments?.[0])
        if (comp?.type !== 'Identifier' || comp.name !== 'Switch') return
        const propsArg = node.arguments?.[1]
        if (!propsArg || propsArg.type !== 'ObjectExpression') return
        const hasSpread = propsArg.properties.some(p => p.type === 'SpreadElement')
        if (hasSpread) return
        const labelProp = findObjectProperty(propsArg, 'label')
          ?? findObjectProperty(propsArg, 'aria-label')
          ?? findObjectProperty(propsArg, 'aria-labelledby')
        if (!labelProp) {
          context.report({
            node: propsArg,
            message: 'Switch primitive must include a non-empty accessible "label" prop (e.g. label: t("...")).',
          })
          return
        }
        const staticText = getStringContent(labelProp.value)
        if (staticText !== null && staticText.trim() === '') {
          context.report({
            node: labelProp,
            message: 'Switch "label" prop must not be empty; pass a localized label string.',
          })
        }
      },
    }
  },
}

const CORDIS_CTX_BUILTINS = new Set([
  'accessor',
  'bail',
  'baseUrl',
  'effect',
  'emit',
  'events',
  'extend',
  'fiber',
  'get',
  'inject',
  'intercept',
  'isolate',
  'logger',
  'mixin',
  'on',
  'once',
  'parallel',
  'plugin',
  'provide',
  'reflect',
  'registry',
  'runtime',
  'serial',
  'set',
  'waterfall',
])

const KNOWN_NESTED_SERVICES = {
  uiSession: new Set(['sessionStatus']),
  remote: new Set(['session', 'skills', 'forgePanel', 'sessionStatus', 'userQuestions', 'toolResults']),
}

const serverPackageInjectCache = new Map()

function parseInjectNode(node) {
  const out = new Set()
  if (!node) return out
  if (node.type === 'ArrayExpression') {
    for (const el of node.elements) {
      if (el?.type === 'Literal' && typeof el.value === 'string') out.add(el.value)
    }
  } else if (node.type === 'ObjectExpression') {
    for (const prop of node.properties) {
      if (prop.type === 'Property' && !prop.computed) {
        const key = propName(prop.key)
        if (key) out.add(key)
      }
    }
  }
  return out
}

function readPackageServerInject(filename) {
  const normalized = (filename ?? '').replaceAll('\\', '/')
  const match = /^(.*\/packages\/[^/]+)\//.exec(normalized)
  if (!match) return null
  const pkgRoot = match[1]
  if (serverPackageInjectCache.has(pkgRoot)) return serverPackageInjectCache.get(pkgRoot)
  const indexPath = join(pkgRoot, 'lib', 'index.js')
  let result = null
  if (existsSync(indexPath)) {
    const src = readFileSync(indexPath, 'utf8')
    const set = new Set()
    const arrMatch = /export\s+const\s+inject\s*=\s*\[([^\]]*)\]/s.exec(src)
    if (arrMatch) {
      for (const m of arrMatch[1].matchAll(/['"]([^'"]+)['"]/g)) set.add(m[1])
    } else {
      const objMatch = /export\s+const\s+inject\s*=\s*\{([^}]*)\}/s.exec(src)
      if (objMatch) {
        for (const m of objMatch[1].matchAll(/(?:['"]([^'"]+)['"]|\b([A-Za-z_$][A-Za-z0-9_$]*))\s*:/g)) {
          set.add(m[1] ?? m[2])
        }
      }
    }
    result = set
  }
  serverPackageInjectCache.set(pkgRoot, result)
  return result
}

function findChildInject(allowed, parent) {
  const prefix = `${parent}.`
  for (const name of allowed) {
    if (name.startsWith(prefix)) return name
  }
  return null
}

function isGuardedSessionStatusCall(node, sourceCode) {
  if (node.optional) return true
  let cur = node.parent
  let prev = node
  while (cur) {
    if (cur.type === 'ConditionalExpression' && cur.consequent === prev) {
      if (/\buseSessionStatus\b/.test(sourceCode.getText(cur.test))) return true
    }
    if (cur.type === 'LogicalExpression' && cur.operator === '&&' && cur.right === prev) {
      if (/\buseSessionStatus\b/.test(sourceCode.getText(cur.left))) return true
    }
    if (cur.type === 'IfStatement' && cur.consequent === prev) {
      if (/\buseSessionStatus\b/.test(sourceCode.getText(cur.test))) return true
    }
    if (SKIP_NESTED_FUNCTIONS.has(cur.type)) break
    prev = cur
    cur = cur.parent
  }
  return false
}

const requireDeclaredInject = {
  meta: {
    type: 'problem',
    docs: { description: 'Require Cordis services accessed on ctx (and unguarded useSessionStatus calls) to be declared in plugin inject.' },
  },
  create(context) {
    const rel = getRelPath(context)
    if (!isPackageFile(rel) || isTestFile(rel)) return {}

    const clientMode = isClientFile(rel)
    const serverMode = isServerFile(rel)
    if (!clientMode && !serverMode) return {}

    let topServerInject = null
    let hasTopServerApply = false
    let serverEntryChecked = false
    let clientPluginInject = null
    const scopeStack = [new Map()]
    const fnBindings = new WeakMap()

    function currentScope() {
      return scopeStack[scopeStack.length - 1]
    }

    function lookupAllowed(name) {
      for (let i = scopeStack.length - 1; i >= 0; i -= 1) {
        if (scopeStack[i].has(name)) return scopeStack[i].get(name)
      }
      return null
    }

    function ensureServerBaseInject() {
      if (!serverMode || serverEntryChecked) return topServerInject
      serverEntryChecked = true
      if (topServerInject === null && !hasTopServerApply) {
        topServerInject = readPackageServerInject(context.filename ?? context.getFilename?.())
      }
      return topServerInject
    }

    function reportMissingService(node, prop, allowed) {
      const child = findChildInject(allowed, prop)
      if (child) {
        context.report({
          node,
          message: `Service "${prop}" is not declared in inject (only "${child}" is declared). Accessing ctx.${prop} throws 'cannot get property "${prop}" without inject' in Cordis; add "${prop}" to inject or use ctx.get('${prop}').`,
        })
        return
      }
      context.report({
        node,
        message: `Service "${prop}" is accessed without declaring "${prop}" in inject. Add "${prop}" to inject, or read it optionally via ctx.get('${prop}').`,
      })
    }

    function checkServiceRead(node, prop, allowed) {
      if (!prop || CORDIS_CTX_BUILTINS.has(prop) || prop.startsWith('_')) return
      if (!allowed.has(prop)) {
        reportMissingService(node, prop, allowed)
        return
      }
      const nestedKnown = KNOWN_NESTED_SERVICES[prop]
      if (!nestedKnown) return
      const parent = node.parent?.type === 'ChainExpression' ? node.parent.parent : node.parent
      if (parent?.type === 'MemberExpression' && !parent.computed && unwrapChain(parent.object) === node) {
        const subProp = propName(parent.property)
        if (subProp && nestedKnown.has(subProp) && !allowed.has(`${prop}.${subProp}`)) {
          context.report({
            node: parent,
            message: `Nested service "${prop}.${subProp}" is accessed without declaring "${prop}.${subProp}" in inject. Declare both "${prop}" and "${prop}.${subProp}".`,
          })
        }
      }
    }

    function enterFunction(fnNode) {
      const map = new Map()
      const bound = fnBindings.get(fnNode)
      if (bound) {
        map.set(bound.varName, bound.allowed)
      }
      for (const param of fnNode.params ?? []) {
        if (param.type === 'Identifier') {
          if (bound && param.name === bound.varName) continue
          if (serverMode && param.name === 'ctx') {
            const base = ensureServerBaseInject()
            if (base) map.set('ctx', base)
          } else if (lookupAllowed(param.name)) {
            map.set(param.name, null)
          }
        }
      }
      scopeStack.push(map)
    }

    function exitFunction() {
      scopeStack.pop()
    }

    return {
      Program(program) {
        if (!serverMode) return
        for (const stmt of program.body) {
          if (stmt.type !== 'ExportNamedDeclaration') continue
          const decl = stmt.declaration
          if (decl?.type === 'VariableDeclaration') {
            for (const d of decl.declarations) {
              if (d.id?.type === 'Identifier' && d.id.name === 'inject') {
                topServerInject = parseInjectNode(d.init)
              }
              if (d.id?.type === 'Identifier' && d.id.name === 'apply' && SKIP_NESTED_FUNCTIONS.has(d.init?.type)) {
                hasTopServerApply = true
              }
            }
          } else if (decl?.type === 'FunctionDeclaration' && decl.id?.name === 'apply') {
            hasTopServerApply = true
          }
        }
        if (hasTopServerApply && topServerInject === null) {
          topServerInject = new Set()
        }
        for (const stmt of program.body) {
          if (stmt.type !== 'ExportNamedDeclaration') continue
          const decl = stmt.declaration
          if (decl?.type === 'FunctionDeclaration' && decl.id?.name === 'apply') {
            const first = decl.params?.[0]
            if (first?.type === 'Identifier') {
              fnBindings.set(decl, { varName: first.name, allowed: topServerInject })
            }
          } else if (decl?.type === 'VariableDeclaration') {
            for (const d of decl.declarations) {
              if (d.id?.type === 'Identifier' && d.id.name === 'apply' && SKIP_NESTED_FUNCTIONS.has(d.init?.type)) {
                const first = d.init.params?.[0]
                if (first?.type === 'Identifier') {
                  fnBindings.set(d.init, { varName: first.name, allowed: topServerInject })
                }
              }
            }
          }
        }
      },
      ObjectExpression(node) {
        if (!clientMode) return
        const applyProp = findObjectProperty(node, 'apply')
        if (!applyProp || !SKIP_NESTED_FUNCTIONS.has(applyProp.value?.type)) return
        const injectProp = findObjectProperty(node, 'inject')
        const isPluginObject = Boolean(injectProp)
          || node.parent?.type === 'ReturnStatement'
          || node.parent?.type === 'ExportDefaultDeclaration'
        if (!isPluginObject) return
        const allowed = injectProp ? parseInjectNode(injectProp.value) : new Set()
        clientPluginInject = allowed
        const firstParam = applyProp.value.params?.[0]
        if (firstParam?.type === 'Identifier') {
          fnBindings.set(applyProp.value, { varName: firstParam.name, allowed })
        }
      },
      CallExpression(node) {
        const callee = unwrapChain(node.callee)
        if (
          clientMode
          && callee?.type === 'Identifier'
          && callee.name === 'useSessionStatus'
          && clientPluginInject !== null
          && !clientPluginInject.has('uiSession.sessionStatus')
          && !isGuardedSessionStatusCall(node, context.sourceCode)
        ) {
          context.report({
            node,
            message: 'Calling useSessionStatus requires declaring "uiSession.sessionStatus" in plugin inject (or guarding with typeof useSessionStatus === "function").',
          })
        }

        if (callee?.type === 'MemberExpression' && !callee.computed && propName(callee.property) === 'inject') {
          const depsArg = node.arguments?.[0]
          const cbArg = node.arguments?.[1]
          if (
            depsArg
            && (depsArg.type === 'ArrayExpression' || depsArg.type === 'ObjectExpression')
            && cbArg
            && SKIP_NESTED_FUNCTIONS.has(cbArg.type)
          ) {
            const receiver = unwrapChain(callee.object)
            let parentAllowed = null
            if (receiver?.type === 'Identifier') {
              parentAllowed = lookupAllowed(receiver.name)
            } else if (
              serverMode
              && receiver?.type === 'MemberExpression'
              && !receiver.computed
              && receiver.object?.type === 'ThisExpression'
              && propName(receiver.property) === 'ctx'
            ) {
              parentAllowed = ensureServerBaseInject()
            }
            const merged = new Set(parentAllowed ?? [])
            for (const dep of parseInjectNode(depsArg)) merged.add(dep)
            const firstParam = cbArg.params?.[0]
            if (firstParam?.type === 'Identifier') {
              fnBindings.set(cbArg, { varName: firstParam.name, allowed: merged })
            }
          }
        }
      },
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      VariableDeclarator(node) {
        if (node.id?.type === 'Identifier') {
          if (lookupAllowed(node.id.name)) {
            currentScope().set(node.id.name, null)
          }
          return
        }
        if (node.id?.type === 'ObjectPattern' && node.init) {
          const init = unwrapChain(node.init)
          let allowed = null
          if (init?.type === 'Identifier') {
            allowed = lookupAllowed(init.name)
          } else if (
            serverMode
            && init?.type === 'MemberExpression'
            && !init.computed
            && init.object?.type === 'ThisExpression'
            && propName(init.property) === 'ctx'
          ) {
            allowed = ensureServerBaseInject()
          }
          if (!allowed) return
          for (const prop of node.id.properties) {
            if (prop.type === 'Property' && !prop.computed) {
              checkServiceRead(prop, propName(prop.key), allowed)
            }
          }
        }
      },
      MemberExpression(node) {
        if (node.computed) return
        if (node.parent?.type === 'AssignmentExpression' && node.parent.left === node) return
        if (node.parent?.type === 'UpdateExpression' && node.parent.argument === node) return
        const obj = unwrapChain(node.object)
        let allowed = null
        if (obj?.type === 'Identifier') {
          allowed = lookupAllowed(obj.name)
        } else if (
          serverMode
          && obj?.type === 'MemberExpression'
          && !obj.computed
          && obj.object?.type === 'ThisExpression'
          && propName(obj.property) === 'ctx'
        ) {
          allowed = ensureServerBaseInject()
        }
        if (!allowed) return
        checkServiceRead(node, propName(node.property), allowed)
      },
    }
  },
}

export default {
  meta: { name: 'dsh' },
  rules: {
    'no-comments': noComments,
    'no-suppression-comments': noSuppressionComments,
    'no-legacy-compat': noLegacyCompat,
    'no-removed-host-apis': noRemovedHostApis,
    'require-command-available': requireCommandAvailable,
    'no-direct-model-selection-fields': noDirectModelSelectionFields,
    'no-root-theme-computed-style': noRootThemeComputedStyle,
    'locale-dict-parity': localeDictParity,
    'no-broad-session-subscription': noBroadSessionSubscription,
    'require-mobile-backdrop-fallback': requireMobileBackdropFallback,
    'no-unconstrained-nowrap': noUnconstrainedNowrap,
    'safe-intervals': safeIntervals,
    'no-new-always-on-observers': noNewAlwaysOnObservers,
    'no-server-hot-sync-fs': noServerHotSyncFs,
    'no-withdraw-view-node': noWithdrawViewNode,
    'safe-storage-domain-open': safeStorageDomainOpen,
    'safe-slot-shadowing': safeSlotShadowing,
    'require-switch-label': requireSwitchLabel,
    'require-declared-inject': requireDeclaredInject,
  },
}
