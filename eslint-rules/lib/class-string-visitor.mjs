/**
 * Shared AST visitor for class-string lint rules (motion-tier, semantic-tokens).
 * Does not resolve identifiers passed as cn() arguments — see rule-file headers.
 */

const CN_IMPORT_SUFFIX = '/utils/tailwind'

const isCnImportSource = (source) => source.endsWith(CN_IMPORT_SUFFIX)

const collectTemplateStatic = (node) => {
  let result = ''
  for (const quasi of node.quasis) {
    result += quasi.value.cooked ?? quasi.value.raw
  }
  return result
}

const scanExpressionStrings = (node, report, scanClassString) => {
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
      scanExpressionStrings(node.right, report, scanClassString)
      break
    case 'ConditionalExpression':
      scanExpressionStrings(node.consequent, report, scanClassString)
      scanExpressionStrings(node.alternate, report, scanClassString)
      break
    default:
      break
  }
}

const scanCvaCall = (node, report, scanClassString) => {
  if (node.arguments.length === 0) return

  scanExpressionStrings(node.arguments[0], report, scanClassString)

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
            scanExpressionStrings(variant.value, report, scanClassString)
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
            scanExpressionStrings(field.value, report, scanClassString)
          }
        }
      }
    }
  }
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {(value: string, report: (message: string) => void) => void} scanClassString
 * @returns {import('eslint').Rule.RuleListener}
 */
export function createClassStringVisitor(context, scanClassString) {
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
        scanExpressionStrings(node.value.expression, report, scanClassString)
      }
    },

    CallExpression(node) {
      if (node.callee.type !== 'Identifier') return

      const report = (message) => {
        context.report({ node, messageId: 'violation', data: { message } })
      }

      if (node.callee.name === 'cva') {
        scanCvaCall(node, report, scanClassString)
        return
      }

      if (cnBindings.has(node.callee.name)) {
        for (const arg of node.arguments) {
          scanExpressionStrings(arg, report, scanClassString)
        }
      }
    },
  }
}
