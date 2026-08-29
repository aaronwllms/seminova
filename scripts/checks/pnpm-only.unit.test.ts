import { describe, expect, it } from 'vitest'

import { checkPnpmOnly } from './pnpm-only.mjs'

describe('checkPnpmOnly', () => {
  it('should pass with no foreign lockfiles and a pnpm packageManager pin', () => {
    const result = checkPnpmOnly({
      foreignLockfiles: [],
      packageManager: 'pnpm@11.0.9',
    })

    expect(result.ok).toBe(true)
    expect(result.violations).toEqual([])
  })

  it('should fail when a foreign lockfile is present', () => {
    const result = checkPnpmOnly({
      foreignLockfiles: ['package-lock.json'],
      packageManager: 'pnpm@11.0.9',
    })

    expect(result.ok).toBe(false)
    expect(result.violations[0]).toContain('package-lock.json')
  })

  it('should fail when packageManager does not start with pnpm@', () => {
    const result = checkPnpmOnly({
      foreignLockfiles: [],
      packageManager: 'yarn@1.22.0',
    })

    expect(result.ok).toBe(false)
    expect(result.violations[0]).toContain('must start with "pnpm@"')
  })
})
