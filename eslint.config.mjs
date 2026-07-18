import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import vitest from '@vitest/eslint-plugin'
import noUnquarantinedSkipsRule from './eslint-rules/no-unquarantined-skips.mjs'
import semanticTokensRule from './eslint-rules/semantic-tokens.mjs'
import testScopeNamingRule from './eslint-rules/test-scope-naming.mjs'

const SHADCN_PKG_MESSAGE =
  'Primitive-first UI: own components in src/components/ui — do not install shadcn as an npm package.'

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
  {
    files: ['src/**/*.{ts,tsx}', 'scripts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'shadcn-ui', message: SHADCN_PKG_MESSAGE },
            { name: '@shadcn/ui', message: SHADCN_PKG_MESSAGE },
            { name: 'shadcn', message: SHADCN_PKG_MESSAGE },
          ],
          patterns: [
            {
              group: ['@shadcn/*'],
              message: SHADCN_PKG_MESSAGE,
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/ui/**'],
    plugins: {
      local: {
        rules: {
          'semantic-tokens': semanticTokensRule,
        },
      },
    },
    rules: {
      'local/semantic-tokens': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/utils/app-logger.ts',
      'src/utils/persist-app-log.ts',
      'src/utils/app-logger-cli.ts',
      'src/supabase/service.ts',
      'src/utils/app-settings.ts',
      'src/supabase/require-auth.ts',
      'src/supabase/proxy.ts',
      'src/app/auth/confirm/route.ts',
      'src/app/admin/users/actions.ts',
      'src/app/admin/users/_lib/run-admin-user-mutation.ts',
      'src/app/admin/users/_lib/map-users-action-fault.ts',
      'src/app/(app)/_lib/get-current-user-profile.ts',
      'src/app/(app)/_lib/profile/actions.ts',
      'src/app/admin/settings/_lib/actions.ts',
      'src/app/api/client-logs/route.ts',
      '**/*.{test,unit.test,integration.test}.{ts,tsx}',
      'src/**/client-server-boundary.fixture.ts',
      '**/*.boundary.fixture.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
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
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.unit.test.ts',
      '**/*.unit.test.tsx',
      '**/*.integration.test.ts',
      '**/*.integration.test.tsx',
    ],
    plugins: {
      vitest,
      'seminova-test': {
        rules: {
          'no-unquarantined-skips': noUnquarantinedSkipsRule,
          'test-scope-naming': testScopeNamingRule,
        },
      },
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      'seminova-test/no-unquarantined-skips': 'error',
      'seminova-test/test-scope-naming': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression > MemberExpression[property.name='toMatchSnapshot']",
          message:
            'Snapshot tests are banned — write explicit assertions instead.',
        },
        {
          selector:
            "CallExpression > MemberExpression[property.name='toMatchInlineSnapshot']",
          message:
            'Snapshot tests are banned — write explicit assertions instead.',
        },
      ],
    },
  },
])

export default eslintConfig
