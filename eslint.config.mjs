import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import vitest from '@vitest/eslint-plugin'
import motionTierRule from './eslint-rules/motion-tier.mjs'
import noUnquarantinedSkipsRule from './eslint-rules/no-unquarantined-skips.mjs'
import semanticTokensRule from './eslint-rules/semantic-tokens.mjs'
import testScopeNamingRule from './eslint-rules/test-scope-naming.mjs'

const SHADCN_PKG_MESSAGE =
  'Primitive-first UI: own components in src/components/ui — do not install shadcn as an npm package.'

/** Mirrors logging.mdc exempt surfaces — keep in sync with logging.mdc. */
export const NO_RAW_CONSOLE_IGNORES = [
  '**/*.{test,unit.test,integration.test}.{ts,tsx}',
  'src/utils/persist-app-log.ts',
  'src/utils/app-log-console.ts',
  'src/utils/env.ts',
  'scripts/admin/lib/prompt.ts',
  'src/**/raw-console-boundary.fixture.ts',
]

export const noRawConsoleRule = 'error'

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
    name: 'seminova/no-shadcn-pkg',
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
    plugins: {
      local: {
        rules: {
          'semantic-tokens': semanticTokensRule,
          'motion-tier': motionTierRule,
        },
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/ui/**'],
    rules: {
      'local/semantic-tokens': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/ui/**'],
    rules: {
      'local/motion-tier': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'scripts/admin/**/*.{ts,tsx}'],
    ignores: NO_RAW_CONSOLE_IGNORES,
    rules: {
      'no-console': noRawConsoleRule,
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
      'src/app/admin/logs/actions.ts',
      'src/app/admin/users/_lib/run-admin-user-mutation.ts',
      'src/app/admin/_lib/map-admin-action-fault.ts',
      'src/app/(app)/_lib/get-current-user-profile.ts',
      'src/app/(app)/_lib/profile/actions.ts',
      'src/app/(app)/_lib/profile/probe-session-action.ts',
      'src/app/auth/_lib/sign-up/actions.ts',
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
        {
          selector:
            "CallExpression > MemberExpression[property.name='toHaveClass']",
          message:
            'Assert user-visible behavior instead of CSS classes — see testing.mdc.',
        },
        {
          selector:
            "CallExpression[callee.property.name='querySelector'] > Literal[value=/^\\./]",
          message:
            'Do not probe DOM via CSS class selectors — use role/name/text queries.',
        },
        {
          selector:
            "CallExpression[callee.property.name='querySelectorAll'] > Literal[value=/^\\./]",
          message:
            'Do not probe DOM via CSS class selectors — use role/name/text queries.',
        },
      ],
    },
  },
])

export default eslintConfig
