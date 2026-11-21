const SUPPRESSION = /\b(?:oxlint-disable|eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck)\b/i
const LICENSE = /\b(?:SPDX-License-Identifier:|Copyright\b|Licensed under\b|MIT License\b)/i
const ALLOWED_LINE = /^ (?:external: \S|https?:\/\/\S)/
const LEGACY_COMPAT = /\b(?:dsh[-_]inbox|llm-pi-ai\/model-defaults|legacyHost|legacyReview)\b/

function isAllowedComment(comment) {
  if (comment.type === 'Shebang') return true
  if (comment.type === 'Line' && ALLOWED_LINE.test(comment.value)) return true
  if (comment.loc.start.line <= 5 && LICENSE.test(comment.value)) return true
  return false
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

export default {
  meta: { name: 'dsh' },
  rules: {
    'no-comments': noComments,
    'no-suppression-comments': noSuppressionComments,
    'no-legacy-compat': noLegacyCompat,
  },
}
