/**
 * Slim the full ESLint flat config to a single named rule for hard-constraint gates.
 * Returns new config objects — never mutates the input (eslint.config.unit.test.ts reads it).
 *
 * @param {import('eslint').Linter.Config[]} config
 * @param {string} ruleName
 * @param {{ configName?: string }} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function namedGate(config, ruleName, options = {}) {
  const { configName } = options
  let found = false

  const result = config.map((block) => {
    const matchesBlock =
      configName !== undefined
        ? block.name === configName && block.rules?.[ruleName] !== undefined
        : block.rules?.[ruleName] !== undefined

    if (matchesBlock) {
      found = true
      return {
        ...block,
        rules: { [ruleName]: block.rules[ruleName] },
      }
    }

    if (block.rules) {
      return { ...block, rules: {} }
    }

    return { ...block }
  })

  if (!found) {
    throw new Error(
      configName !== undefined
        ? `Named gate: no config block named "${configName}" with rule "${ruleName}"`
        : `Named gate: no config block with rule "${ruleName}"`,
    )
  }

  return [
    ...result,
    {
      linterOptions: {
        reportUnusedDisableDirectives: 'off',
      },
    },
  ]
}
