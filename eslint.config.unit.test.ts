/**
 * @vitest-environment node
 */
import { ESLint, type Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import eslintConfig from './eslint.config.mjs'

const BOUNDARY_FIXTURE =
  'src/app/(app)/_lib/profile/client-server-boundary.fixture.ts'

const isServerOnlyImportBlock = (block: Linter.Config): boolean => {
  const rule = block.rules?.['no-restricted-imports']

  if (!Array.isArray(rule)) {
    return false
  }

  const options = rule[1]

  if (!options || typeof options !== 'object' || !('paths' in options)) {
    return false
  }

  const paths = options.paths

  return (
    Array.isArray(paths) &&
    paths.some(
      (path) =>
        typeof path === 'object' &&
        path !== null &&
        'name' in path &&
        path.name === '@/utils/app-logger',
    )
  )
}

const getServerOnlyImportRule = (): Linter.RuleEntry => {
  const block = (eslintConfig as Linter.Config[]).find(isServerOnlyImportBlock)

  if (!block?.rules?.['no-restricted-imports']) {
    throw new Error(
      'Expected server-only no-restricted-imports block in eslint.config.mjs',
    )
  }

  return block.rules['no-restricted-imports']
}

describe('eslint server-only import boundary', () => {
  it('should report no-restricted-imports on the boundary fixture', async () => {
    const eslint = new ESLint({
      cwd: process.cwd(),
      overrideConfig: [
        {
          files: [BOUNDARY_FIXTURE],
          rules: {
            'no-restricted-imports': getServerOnlyImportRule(),
          },
        },
      ],
    })

    const results = await eslint.lintFiles([BOUNDARY_FIXTURE])
    const restrictedImportMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'no-restricted-imports',
      ),
    )

    expect(restrictedImportMessages.length).toBeGreaterThan(0)
    expect(restrictedImportMessages[0]?.message).toContain(
      'appLog is server-only',
    )
  })
})
