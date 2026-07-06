/**
 * ESLint rule: disabled Vitest tests require a QUARANTINE comment.
 *
 * Based on @vitest/eslint-plugin no-disabled-tests detection (skip, x-prefix,
 * .todo) with an allowed exception when a preceding comment matches:
 *   QUARANTINE: <reason> … https://github.com/<org>/<repo>/issues/<n>
 */

const QUARANTINE_PATTERN =
  /QUARANTINE:\s*.+https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+/i

const VITEST_FN_NAMES = new Set(['describe', 'it', 'test', 'suite'])
const DISABLED_MEMBERS = new Set(['skip', 'todo'])

const hasQuarantineComment = (node, sourceCode) => {
  const comments = sourceCode.getCommentsBefore(node)
  return comments.some((comment) => QUARANTINE_PATTERN.test(comment.value))
}

const isDisabledVitestCall = (node) => {
  const { callee } = node

  if (callee.type === 'Identifier') {
    const name = callee.name
    return name.startsWith('x') && VITEST_FN_NAMES.has(name.slice(1))
  }

  if (callee.type !== 'MemberExpression') return false

  let current = callee
  let hasDisabledMember = false

  while (current.type === 'MemberExpression') {
    if (
      current.property.type === 'Identifier' &&
      DISABLED_MEMBERS.has(current.property.name)
    ) {
      hasDisabledMember = true
    }
    current = current.object
  }

  return (
    hasDisabledMember &&
    current.type === 'Identifier' &&
    VITEST_FN_NAMES.has(current.name)
  )
}

const noUnquarantinedSkipsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require QUARANTINE comment with GitHub issue URL for skipped or todo tests',
    },
    messages: {
      missingQuarantine:
        'Disabled or todo tests require a preceding comment: QUARANTINE: <reason> with a GitHub issue URL (https://github.com/<org>/<repo>/issues/<n>).',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    return {
      CallExpression(node) {
        if (!isDisabledVitestCall(node)) return
        if (hasQuarantineComment(node, sourceCode)) return

        context.report({
          node,
          messageId: 'missingQuarantine',
        })
      },
    }
  },
}

export default noUnquarantinedSkipsRule
