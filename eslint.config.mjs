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
