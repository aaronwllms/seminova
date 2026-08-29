/**
 * ESLint rule: require motion tier duration utilities alongside transition utilities.
 *
 * Known limitation: this rule does not resolve identifiers passed as cn()
 * arguments back to their declarations (e.g. a shared style constant imported
 * from another file). A bare transition inside such a constant will not be
 * caught. Scoped out deliberately — same ceiling as semantic-tokens.mjs.
 */

import { createClassStringVisitor } from './lib/class-string-visitor.mjs'

const DURATION_TIER = /\b(?:[\w-]+:)?duration-(?:swept|dwell)\b/

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
    return createClassStringVisitor(context, scanClassString)
  },
}

export default motionTierRule
