import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import semanticTokensRule from './eslint-rules/semantic-tokens.mjs'

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
])

export default eslintConfig
