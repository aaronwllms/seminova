/**
 * @vitest-environment node
 */
import { ESLint, type Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import eslintConfig, { noRawConsoleRule } from './eslint.config.mjs'
import { namedGate } from './eslint.named-gate.mjs'

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

type LocalRulePluginName =
  | 'motion-tier'
  | 'semantic-tokens'
  | 'no-unquarantined-skips'
  | 'test-scope-naming'

type LocalRuleId =
  | 'local/motion-tier'
  | 'local/semantic-tokens'
  | 'seminova-test/no-unquarantined-skips'
  | 'seminova-test/test-scope-naming'

const getLocalRuleBlock = (
  pluginName: LocalRulePluginName,
  ruleId: LocalRuleId,
): Linter.Config => {
  const configs = eslintConfig as Linter.Config[]
  const namespace = ruleId.slice(0, ruleId.indexOf('/'))
  const pluginBlock = configs.find(
    (block) => block.plugins?.[namespace]?.rules?.[pluginName],
  )
  const ruleBlock = configs.find((block) => block.rules?.[ruleId] === 'error')

  if (!pluginBlock?.plugins || !ruleBlock?.rules?.[ruleId]) {
    throw new Error(`Expected ${ruleId} block in eslint.config.mjs`)
  }

  return {
    files: ruleBlock.files,
    ignores: ruleBlock.ignores ?? [],
    plugins: pluginBlock.plugins,
    rules: ruleBlock.rules,
  }
}

const getMotionTierBlock = (): Linter.Config =>
  getLocalRuleBlock('motion-tier', 'local/motion-tier')

const getSemanticTokensBlock = (): Linter.Config =>
  getLocalRuleBlock('semantic-tokens', 'local/semantic-tokens')

const getNoUnquarantinedSkipsBlock = (): Linter.Config =>
  getLocalRuleBlock(
    'no-unquarantined-skips',
    'seminova-test/no-unquarantined-skips',
  )

const getTestScopeNamingBlock = (): Linter.Config =>
  getLocalRuleBlock('test-scope-naming', 'seminova-test/test-scope-naming')

const createLocalRuleEslint = (block: Linter.Config, filePath: string) =>
  new ESLint({
    cwd: process.cwd(),
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: [filePath],
        ignores: block.ignores,
        languageOptions: {
          parserOptions: {
            ecmaFeatures: { jsx: true },
          },
        },
        plugins: block.plugins,
        rules: block.rules,
      },
    ],
  })

const createNamedGateEslint = (config: Linter.Config[]) =>
  new ESLint({
    cwd: process.cwd(),
    overrideConfigFile: true,
    overrideConfig: config,
  })

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

  it('should report local/motion-tier on bare transition-colors outside ui/', async () => {
    const eslint = createLocalRuleEslint(
      motionTierBlock,
      'src/components/motion-tier-fail.tsx',
    )

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
    const eslint = createLocalRuleEslint(
      motionTierBlock,
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
    const eslint = createLocalRuleEslint(
      motionTierBlock,
      'src/components/motion-tier-pass.tsx',
    )

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

describe('eslint local/semantic-tokens rule', () => {
  const semanticTokensBlock = getSemanticTokensBlock()

  it('should report local/semantic-tokens on hex color in className', async () => {
    const filePath = 'src/components/semantic-tokens-hex-fail.tsx'
    const eslint = createLocalRuleEslint(semanticTokensBlock, filePath)

    const results = await eslint.lintText(
      "export const X = () => <div className='bg-[#ff0000]' />",
      { filePath },
    )

    const semanticTokensMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'local/semantic-tokens',
      ),
    )

    expect(semanticTokensMessages.length).toBeGreaterThan(0)
    expect(semanticTokensMessages[0]?.message).toContain('#ff0000')
    expect(semanticTokensMessages[0]?.message).toContain('semantic tokens')
  })

  it('should report local/semantic-tokens on numeric scale inside cva variant', async () => {
    const filePath = 'src/components/semantic-tokens-cva-fail.tsx'
    const eslint = createLocalRuleEslint(semanticTokensBlock, filePath)

    const results = await eslint.lintText(
      "export const button = cva('text-foreground', { variants: { tone: { danger: 'bg-red-500' } } })",
      { filePath },
    )

    const semanticTokensMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'local/semantic-tokens',
      ),
    )

    expect(semanticTokensMessages.length).toBeGreaterThan(0)
    expect(semanticTokensMessages[0]?.message).toMatch(
      /bg-red-500|Numeric Tailwind/,
    )
  })

  it('should report local/semantic-tokens on numeric scale inside cn()', async () => {
    const filePath = 'src/components/semantic-tokens-cn-fail.tsx'
    const eslint = createLocalRuleEslint(semanticTokensBlock, filePath)

    const results = await eslint.lintText(
      "import { cn } from '@/utils/tailwind'\nexport const X = () => cn('bg-red-500')",
      { filePath },
    )

    const semanticTokensMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'local/semantic-tokens',
      ),
    )

    expect(semanticTokensMessages.length).toBeGreaterThan(0)
    expect(semanticTokensMessages[0]?.message).toContain('bg-red-500')
  })

  it('should pass local/semantic-tokens on clean semantic tokens', async () => {
    const filePath = 'src/components/semantic-tokens-pass.tsx'
    const eslint = createLocalRuleEslint(semanticTokensBlock, filePath)

    const results = await eslint.lintText(
      "export const X = () => <div className='bg-background text-foreground' />",
      { filePath },
    )

    const semanticTokensMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'local/semantic-tokens',
      ),
    )

    expect(semanticTokensMessages).toEqual([])
  })
})

describe('eslint seminova-test/no-unquarantined-skips rule', () => {
  const skipBlock = getNoUnquarantinedSkipsBlock()
  const filePath = 'src/components/skip-fail.unit.test.ts'

  it('should report seminova-test/no-unquarantined-skips on a bare it.skip', async () => {
    const eslint = createLocalRuleEslint(skipBlock, filePath)

    const results = await eslint.lintText("it.skip('flaky', () => {})", {
      filePath,
    })

    const skipMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'seminova-test/no-unquarantined-skips',
      ),
    )

    expect(skipMessages.length).toBeGreaterThan(0)
    expect(skipMessages[0]?.message).toContain('QUARANTINE')
  })

  it('should pass seminova-test/no-unquarantined-skips when the skip is quarantined', async () => {
    const eslint = createLocalRuleEslint(skipBlock, filePath)

    const results = await eslint.lintText(
      "// QUARANTINE: flaky https://github.com/aaronwllms/seminova/issues/1\nit.skip('flaky', () => {})",
      { filePath },
    )

    const skipMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'seminova-test/no-unquarantined-skips',
      ),
    )

    expect(skipMessages).toEqual([])
  })
})

describe('eslint seminova-test/test-scope-naming rule', () => {
  const namingBlock = getTestScopeNamingBlock()
  const filePath = 'src/components/scope-fail.unit.test.tsx'

  it('should report seminova-test/test-scope-naming when a unit file mocks @/supabase/client', async () => {
    const eslint = createLocalRuleEslint(namingBlock, filePath)

    const results = await eslint.lintText(
      "vi.mock('@/supabase/client', () => ({}))\nit('works', () => {})",
      { filePath },
    )

    const namingMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'seminova-test/test-scope-naming',
      ),
    )

    expect(namingMessages.length).toBeGreaterThan(0)
    expect(namingMessages[0]?.message).toContain('.integration.test')
  })

  it('should pass seminova-test/test-scope-naming when a unit file has no boundary mock', async () => {
    const eslint = createLocalRuleEslint(namingBlock, filePath)

    const results = await eslint.lintText("it('works', () => {})", {
      filePath,
    })

    const namingMessages = results.flatMap((result) =>
      result.messages.filter(
        (message) => message.ruleId === 'seminova-test/test-scope-naming',
      ),
    )

    expect(namingMessages).toEqual([])
  })
})

describe('eslint named gate isolation', () => {
  const semanticTokensGate = namedGate(eslintConfig, 'local/semantic-tokens')
  const shadcnGate = namedGate(eslintConfig, 'no-restricted-imports', {
    configName: 'seminova/no-shadcn-pkg',
  })
  const noRawConsoleGate = namedGate(eslintConfig, 'no-console')

  it('should ignore console.log when scoped to the semantic-tokens gate', async () => {
    const filePath = 'src/components/gate-isolation-console.tsx'
    const eslint = createNamedGateEslint(semanticTokensGate)

    const results = await eslint.lintText("console.log('x')", { filePath })

    expect(results.flatMap((result) => result.messages)).toEqual([])
  })

  it('should report local/semantic-tokens when scoped to the semantic-tokens gate', async () => {
    const filePath = 'src/components/gate-isolation-tokens-fail.tsx'
    const eslint = createNamedGateEslint(semanticTokensGate)

    const results = await eslint.lintText(
      "export const X = () => <div className='bg-red-500' />",
      { filePath },
    )

    const messages = results.flatMap((result) => result.messages)

    expect(
      messages.some((message) => message.ruleId === 'local/semantic-tokens'),
    ).toBe(true)
    expect(messages.some((message) => message.ruleId === 'no-console')).toBe(
      false,
    )
  })

  it('should ignore server-only imports when scoped to the shadcn gate', async () => {
    const filePath = 'src/components/gate-isolation-service.tsx'
    const eslint = createNamedGateEslint(shadcnGate)

    const results = await eslint.lintText(
      "import { createServiceClient } from '@/supabase/service'",
      { filePath },
    )

    expect(results.flatMap((result) => result.messages)).toEqual([])
  })

  it('should report no-restricted-imports on shadcn packages when scoped to the shadcn gate', async () => {
    const filePath = 'src/components/gate-isolation-shadcn-fail.tsx'
    const eslint = createNamedGateEslint(shadcnGate)

    const results = await eslint.lintText("import 'shadcn'", { filePath })

    const messages = results.flatMap((result) => result.messages)

    expect(
      messages.some((message) => message.ruleId === 'no-restricted-imports'),
    ).toBe(true)
    expect(messages[0]?.message).toContain('Primitive-first UI')
  })

  it('should report no-console when scoped to the no-raw-console gate', async () => {
    const filePath = 'src/components/gate-isolation-console-fail.tsx'
    const eslint = createNamedGateEslint(noRawConsoleGate)

    const results = await eslint.lintText("console.log('x')", { filePath })

    const messages = results.flatMap((result) => result.messages)

    expect(messages.some((message) => message.ruleId === 'no-console')).toBe(
      true,
    )
  })
})
