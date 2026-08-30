import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { compareWiredChecks } from './checks-wired.mjs'

describe('compareWiredChecks', () => {
  it('should pass on shipped package.json scripts and CI workflow', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    )
    const workflowText = readFileSync(
      join(process.cwd(), '.github/workflows/pull-request.yaml'),
      'utf8',
    )

    const result = compareWiredChecks(packageJson.scripts ?? {}, workflowText)

    expect(result.ok).toBe(true)
    expect(result.missingFromPrePush).toEqual([])
    expect(result.missingFromCi).toEqual([])
  })

  it('should not treat check:a11y-contrast as invoking check:a11y', () => {
    const scripts = {
      'pre-push': 'pnpm check:a11y-contrast',
      'check:a11y': 'node scripts/checks/a11y.mjs',
      'check:a11y-contrast': 'node scripts/checks/a11y-contrast.mjs',
    }
    const workflowText = 'pnpm check:a11y-contrast'

    const result = compareWiredChecks(scripts, workflowText)

    expect(result.ok).toBe(false)
    expect(result.missingFromPrePush).toContain('check:a11y')
    expect(result.missingFromCi).toContain('check:a11y')
    expect(result.missingFromPrePush).not.toContain('check:a11y-contrast')
    expect(result.missingFromCi).not.toContain('check:a11y-contrast')
  })
})
