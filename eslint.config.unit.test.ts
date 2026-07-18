/**
 * @vitest-environment node
 */
import { ESLint, type Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

const BOUNDARY_FIXTURE =
  'src/app/(app)/_lib/profile/client-server-boundary.fixture.ts'

const SERVER_ONLY_IMPORT_RULE = {
  files: ['**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error' as const,
      {
        paths: [
          {
            name: '@/utils/app-logger',
            message:
              'appLog is server-only — use clientLog from @/utils/client-logger in client code.',
          },
          {
            name: '@/utils/persist-app-log',
            message:
              'persist-app-log is server-only — use clientLog from @/utils/client-logger in client code.',
          },
          {
            name: '@/supabase/service',
            message:
              'Service client is server-only — use @/supabase/client or server surfaces.',
          },
        ],
      },
    ],
  },
}

describe('eslint server-only import boundary', () => {
  it('should report no-restricted-imports on the boundary fixture', async () => {
    const eslint = new ESLint({
      overrideConfig: [SERVER_ONLY_IMPORT_RULE as unknown as Linter.Config],
      cwd: process.cwd(),
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
