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

import { createClassStringVisitor } from './lib/class-string-visitor.mjs'

const HEX_COLOR =
  /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![0-9a-fA-F])/g

const NUMERIC_TAILWIND_SCALE =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|divide|placeholder|caret|accent|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g

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
    return createClassStringVisitor(context, scanClassString)
  },
}

export default semanticTokensRule
