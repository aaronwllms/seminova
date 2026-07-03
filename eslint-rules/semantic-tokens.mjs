/**
 * ESLint rule: enforce semantic tokens — no raw hex colors or numeric Tailwind
 * palette scales in class-string contexts.
 *
 * Known limitation: this rule does not resolve identifiers passed as cn()
 * arguments back to their declarations (e.g. a shared style constant imported
 * from another file). A raw color value inside such a constant will not be
 * caught. Scoped out deliberately — see docs/adr/ADR-0002-dissolve-locked-rules-enforce-deterministically.md
 * for rationale (deterministic checks catch the common inline paths; full
 * cross-file constant resolution is deferred to avoid false negatives from
 * incomplete analysis and to keep the rule maintainable).
 */

const HEX_COLOR =
  /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![0-9a-fA-F])/g

const NUMERIC_TAILWIND_SCALE =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|divide|placeholder|caret|accent|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g

const CN_IMPORT_SOURCE = '@/utils/tailwind'

const scanClassString = (value, report) => {
  if (!value) return

  for (const match of value.matchAll(HEX_COLOR)) {
    report(
      `Raw hex color "${match[0]}" is not allowed — use semantic tokens from globals.css.`,
    )
  }

  for (const match of value.matchAll(NUMERIC_TAILWIND_SCALE)) {
    report(
      `Numeric Tailwind color scale "${match[0]}" is not allowed — use semantic tokens (e.g. bg-background, text-foreground).`,
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
const semanticTokensRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw hex colors and numeric Tailwind palette scales outside semantic tokens',
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

export default semanticTokensRule
