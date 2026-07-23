/**
 * ESLint rule: require motion tier duration utilities alongside transition utilities.
 *
 * Known limitation: this rule does not resolve identifiers passed as cn()
 * arguments back to their declarations (e.g. a shared style constant imported
 * from another file). A bare transition inside such a constant will not be
 * caught. Scoped out deliberately — same ceiling as semantic-tokens.mjs.
 */

const DURATION_TIER = /\b(?:[\w-]+:)?duration-(?:swept|dwell)\b/

const CN_IMPORT_SOURCE = '@/utils/tailwind'

const isTransitionExempt = (baseUtility) => {
  if (baseUtility === 'transition') {
    return false
  }

  if (!baseUtility.startsWith('transition-')) {
    return true
  }

  const suffix = baseUtility.slice('transition-'.length)

  return suffix === 'none' || suffix === 'discrete' || suffix === 'normal'
}

const transitionRequiresTier = (value) => {
  if (!value) return false

  for (const token of value.split(/\s+/)) {
    if (!token) continue

    const baseUtility = token.includes(':')
      ? token.slice(token.lastIndexOf(':') + 1)
      : token

    if (isTransitionExempt(baseUtility)) {
      continue
    }

    return true
  }

  return false
}

const hasDurationTier = (value) => DURATION_TIER.test(value)

const scanClassString = (value, report) => {
  if (!value || !transitionRequiresTier(value)) return

  if (!hasDurationTier(value)) {
    report(
      'Transition utilities require a motion tier duration — add duration-swept or duration-dwell.',
    )
  }
}

const collectTemplateStatic = (node) => {
  let result = ''
  for (const quasi of node.quasis) {
    result += quasi.value.cooked ?? quasi.value.raw
  }
  return result
}

const scanExpressionStrings = (node, report) => {
  if (!node) return

  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') {
        scanClassString(node.value, report)
      }
      break
    case 'TemplateLiteral':
      scanClassString(collectTemplateStatic(node), report)
      break
    case 'LogicalExpression':
      scanExpressionStrings(node.right, report)
      break
    case 'ConditionalExpression':
      scanExpressionStrings(node.consequent, report)
      scanExpressionStrings(node.alternate, report)
      break
    default:
      break
  }
}

const scanCvaCall = (node, report) => {
  if (node.arguments.length === 0) return

  scanExpressionStrings(node.arguments[0], report)

  const options = node.arguments[1]
  if (!options || options.type !== 'ObjectExpression') return

  for (const prop of options.properties) {
    if (prop.type !== 'Property' || prop.key.type !== 'Identifier') continue

    if (
      prop.key.name === 'variants' &&
      prop.value.type === 'ObjectExpression'
    ) {
      for (const variantGroup of prop.value.properties) {
        if (
          variantGroup.type !== 'Property' ||
          variantGroup.value.type !== 'ObjectExpression'
        ) {
          continue
        }
        for (const variant of variantGroup.value.properties) {
          if (variant.type === 'Property') {
            scanExpressionStrings(variant.value, report)
          }
        }
      }
    }

    if (
      prop.key.name === 'compoundVariants' &&
      prop.value.type === 'ArrayExpression'
    ) {
      for (const entry of prop.value.elements) {
        if (!entry || entry.type !== 'ObjectExpression') continue
        for (const field of entry.properties) {
          if (
            field.type === 'Property' &&
            field.key.type === 'Identifier' &&
            field.key.name === 'class'
          ) {
            scanExpressionStrings(field.value, report)
          }
        }
      }
    }
  }
}

const isCnImportSource = (source) =>
  source === CN_IMPORT_SOURCE ||
  source === '@/utils/tailwind' ||
  source.endsWith('/utils/tailwind')

/** @type {import('eslint').Rule.RuleModule} */
const motionTierRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require duration-swept or duration-dwell alongside transition utilities',
    },
    schema: [],
    messages: {
      violation: '{{message}}',
    },
  },
  create(context) {
    const cnBindings = new Set()

    return {
      ImportDeclaration(node) {
        if (!isCnImportSource(node.source.value)) return

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name === 'cn'
          ) {
            cnBindings.add(specifier.local.name)
          }
        }
      },

      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier') return
        if (node.name.name !== 'className' && node.name.name !== 'class') return
        if (!node.value) return

        const report = (message) => {
          context.report({
            node: node.value,
            messageId: 'violation',
            data: { message },
          })
        }

        if (node.value.type === 'Literal') {
          scanClassString(node.value.value, report)
        } else if (node.value.type === 'JSXExpressionContainer') {
          scanExpressionStrings(node.value.expression, report)
        }
      },

      CallExpression(node) {
        if (node.callee.type !== 'Identifier') return

        const report = (message) => {
          context.report({ node, messageId: 'violation', data: { message } })
        }

        if (node.callee.name === 'cva') {
          scanCvaCall(node, report)
          return
        }

        if (cnBindings.has(node.callee.name)) {
          for (const arg of node.arguments) {
            scanExpressionStrings(arg, report)
          }
        }
      },
    }
  },
}

export default motionTierRule
