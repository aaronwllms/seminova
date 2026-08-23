/**
 * @vitest-environment node
 */
import { ESLint, type Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import eslintConfig, { noRawConsoleRule } from './eslint.config.mjs'

const BOUNDARY_FIXTURE =
  'src/app/(app)/_lib/profile/client-server-boundary.fixture.ts'

const RAW_CONSOLE_BOUNDARY_FIXTURE = 'src/utils/raw-console-boundary.fixture.ts'

const SHIPPED_NO_RAW_CONSOLE_PATHS = [
  'src/supabase/proxy.ts',
  'scripts/admin/lib/cli.ts',
]

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

const isNoRawConsoleBlock = (block: Linter.Config): boolean =>
  block.rules?.['no-console'] === noRawConsoleRule

const getNoRawConsoleBlock = (): Linter.Config => {
  const block = (eslintConfig as Linter.Config[]).find(isNoRawConsoleBlock)

  if (!block?.rules?.['no-console']) {
    throw new Error('Expected no-console block in eslint.config.mjs')
  }

  return block
}

const getLocalRuleBlock = (
  pluginName: 'motion-tier',
  ruleId: 'local/motion-tier',
): Linter.Config => {
  const configs = eslintConfig as Linter.Config[]
  const pluginBlock = configs.find(
    (block) => block.plugins?.local?.rules?.[pluginName],
  )
  const ruleBlock = configs.find((block) => block.rules?.[ruleId] === 'error')

  if (!pluginBlock?.plugins || !ruleBlock?.rules?.[ruleId]) {
    throw new Error(`Expected ${ruleId} block in eslint.config.mjs`)
  }

  return {
    files: ruleBlock.files,
    ignores: ruleBlock.ignores,
    plugins: pluginBlock.plugins,
    rules: ruleBlock.rules,
  }
}

const getMotionTierBlock = (): Linter.Config =>
  getLocalRuleBlock('motion-tier', 'local/motion-tier')

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

describe('eslint no-raw-console guardrail', () => {
  it('should report no-console on the raw-console boundary fixture', async () => {
    const eslint = new ESLint({
      cwd: process.cwd(),
      overrideConfig: [
        {
          files: [RAW_CONSOLE_BOUNDARY_FIXTURE],
          rules: {
            'no-console': getNoRawConsoleBlock().rules!['no-console'],
          },
        },
      ],
    })

    const results = await eslint.lintFiles([RAW_CONSOLE_BOUNDARY_FIXTURE])
    const noConsoleMessages = results.flatMap((result) =>
      result.messages.filter((message) => message.ruleId === 'no-console'),
    )

    expect(noConsoleMessages.length).toBeGreaterThan(0)
  })

  it('should pass no-console on shipped swept paths', async () => {
    const eslint = new ESLint({
      cwd: process.cwd(),
      overrideConfig: [getNoRawConsoleBlock()],
    })

    const results = await eslint.lintFiles(SHIPPED_NO_RAW_CONSOLE_PATHS)
    const noConsoleMessages = results.flatMap((result) =>
      result.messages.filter((message) => message.ruleId === 'no-console'),
    )

    expect(noConsoleMessages).toEqual([])
  })
})

describe('eslint local/motion-tier rule', () => {
  const motionTierBlock = getMotionTierBlock()

  const createMotionTierEslint = (filePath: string) =>
    new ESLint({
      cwd: process.cwd(),
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: [filePath],
          ignores: motionTierBlock.ignores,
          languageOptions: {
            parserOptions: {
              ecmaFeatures: { jsx: true },
            },
          },
          plugins: motionTierBlock.plugins,
          rules: motionTierBlock.rules,
        },
      ],
    })

  it('should report local/motion-tier on bare transition-colors outside ui/', async () => {
    const eslint = createMotionTierEslint('src/components/motion-tier-fail.tsx')

    const results = await eslint.lintText(
      "export const X = () => <div className='transition-colors' />",
      { filePath: 'src/components/motion-tier-fail.tsx' },
    )

    const motionTierMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'local/motion-tier',
      ),
    )

    expect(motionTierMessages.length).toBeGreaterThan(0)
  })

  it('should not report local/motion-tier inside src/components/ui/', async () => {
    const eslint = createMotionTierEslint(
      'src/components/ui/motion-tier-ignored.tsx',
    )

    const results = await eslint.lintText(
      "export const X = () => <div className='transition-colors' />",
      { filePath: 'src/components/ui/motion-tier-ignored.tsx' },
    )

    const motionTierMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'local/motion-tier',
      ),
    )

    expect(motionTierMessages).toEqual([])
  })

  it('should pass local/motion-tier when duration-swept is paired', async () => {
    const eslint = createMotionTierEslint('src/components/motion-tier-pass.tsx')

    const results = await eslint.lintText(
      "export const X = () => <div className='transition-colors duration-swept' />",
      { filePath: 'src/components/motion-tier-pass.tsx' },
    )

    const motionTierMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'local/motion-tier',
      ),
    )

    expect(motionTierMessages).toEqual([])
  })
})
