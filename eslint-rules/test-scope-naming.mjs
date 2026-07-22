/**
 * ESLint rule: .unit.test.* files that mock external session/auth boundaries
 * must use the .integration.test.* suffix per testing.mdc.
 */

const EXTERNAL_BOUNDARY_MOCKS = [
  '@/supabase/require-auth',
  '@/supabase/server',
  '@/supabase/client',
  'next/headers',
]

const hasExternalBoundaryMock = (sourceCode) =>
  EXTERNAL_BOUNDARY_MOCKS.some((moduleName) =>
    sourceCode.includes(`vi.mock('${moduleName}'`),
  )

const ACTIONS_MOCK_PATTERN =
  /vi\.mock\(['"](\.\.?\/actions|\@\/[^'"]+\/actions)['"]/

const isLibUnitTest = (filename) =>
  /\/_lib\/.*\.unit\.test\.tsx$/.test(filename)

const isComponentsUnitTest = (filename) =>
  /\/_components\/.*\.unit\.test\.tsx$/.test(filename)

const hasColocatedActionsMock = (sourceCode) =>
  ACTIONS_MOCK_PATTERN.test(sourceCode)

const testScopeNamingRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require .integration.test suffix when a component test mocks external session/auth boundaries or colocated server actions',
    },
    messages: {
      renameToIntegration:
        'Component tests that mock external session/auth boundaries (@/supabase/require-auth, @/supabase/server, @/supabase/client, next/headers) or colocated actions must use the .integration.test.* suffix — rename this file per testing.mdc.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()

    if (!/\.unit\.test\.tsx$/.test(filename) || isLibUnitTest(filename)) {
      return {}
    }

    return {
      Program(node) {
        const sourceCode = context.sourceCode ?? context.getSourceCode()
        const text = sourceCode.getText(node)

        const mocksExternalBoundary = hasExternalBoundaryMock(text)
        const mocksColocatedActions =
          isComponentsUnitTest(filename) && hasColocatedActionsMock(text)

        if (!mocksExternalBoundary && !mocksColocatedActions) {
          return
        }

        context.report({
          node,
          messageId: 'renameToIntegration',
        })
      },
    }
  },
}

export default testScopeNamingRule
