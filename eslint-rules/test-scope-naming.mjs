/**
 * ESLint rule: .unit.test.* files that mock external session/auth boundaries
 * must use the .integration.test.* suffix per testing.mdc.
 */

const EXTERNAL_BOUNDARY_MOCKS = [
  '@/supabase/require-auth',
  '@/supabase/server',
  'next/headers',
]

const hasExternalBoundaryMock = (sourceCode) =>
  EXTERNAL_BOUNDARY_MOCKS.some((moduleName) =>
    sourceCode.includes(`vi.mock('${moduleName}'`),
  )

const testScopeNamingRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require .integration.test suffix when a component test mocks external session/auth boundaries',
    },
    messages: {
      renameToIntegration:
        'Component tests that mock external session/auth boundaries (@/supabase/require-auth, @/supabase/server, next/headers) must use the .integration.test.* suffix — rename this file per testing.mdc.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()

    if (!/\.unit\.test\.tsx$/.test(filename)) {
      return {}
    }

    return {
      Program(node) {
        const sourceCode = context.sourceCode ?? context.getSourceCode()
        const text = sourceCode.getText(node)

        if (!hasExternalBoundaryMock(text)) {
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
