/**
 * ESLint rule: require surface-elevated on elevated fills so borders stay
 * visible against card / popover / sidebar.
 *
 * // debt: reads class strings only — misses sonner.tsx (--normal-border
 * style object) and workflow-diagram.tsx getNodeColors / backing <rect>
 * (SVG fill attributes). Same ceiling as motion-tier.mjs identifier
 * resolution.
 */

const ELEVATED_FILL = /^(?:bg-card|bg-popover|bg-sidebar)(?:\/\d+)?$/
const SURFACE_ELEVATED = /(?:^|[\s:])surface-elevated(?:\/|\s|$)/

const CN_IMPORT_SOURCE = '@/utils/tailwind'

const baseUtility = (token) =>
  token.includes(':') ? token.slice(token.lastIndexOf(':') + 1) : token

const hasElevatedFill = (value) => {
  if (!value) return false

  return value
    .split(/\s+/)
    .some((token) => ELEVATED_FILL.test(baseUtility(token)))
}

const hasSurfaceElevated = (value) => SURFACE_ELEVATED.test(value)

const scanClassString = (value, report) => {
  if (!value || !hasElevatedFill(value)) return

  if (!hasSurfaceElevated(value)) {
    report(
      'Elevated fills (bg-card, bg-popover, bg-sidebar) require surface-elevated so borders stay visible on the fill.',
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
const surfaceElevatedRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require surface-elevated alongside bg-card, bg-popover, or bg-sidebar',
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

export default surfaceElevatedRule
