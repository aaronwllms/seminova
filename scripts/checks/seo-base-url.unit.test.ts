import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { checkSeoBaseUrl } from './seo-base-url.mjs'

describe('checkSeoBaseUrl', () => {
  it('should pass on shipped SEO scan paths', () => {
    const result = checkSeoBaseUrl()
    expect(result.ok).toBe(true)
    expect(result.violations).toEqual([])
  })

  it('should fail on hardcoded localhost outside site-url.ts', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-seo-check-'))

    try {
      const appDir = join(tempDir, 'src/app')
      mkdirSync(appDir, { recursive: true })
      writeFileSync(
        join(appDir, 'bad-page.tsx'),
        `export const metadata = { metadataBase: new URL('http://localhost:3000') }\n`,
      )

      const result = checkSeoBaseUrl([appDir])
      expect(result.ok).toBe(false)
      expect(result.violations[0]).toContain('bad-page.tsx')
      expect(result.violations[0]).toContain('localhost:3000')
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should fail on inline NEXT_PUBLIC_SITE_URL outside site-url.ts', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-seo-check-'))

    try {
      const appDir = join(tempDir, 'src/app')
      mkdirSync(appDir, { recursive: true })
      writeFileSync(
        join(appDir, 'bad-env.tsx'),
        `const base = process.env.NEXT_PUBLIC_SITE_URL\n`,
      )

      const result = checkSeoBaseUrl([appDir])
      expect(result.ok).toBe(false)
      expect(result.violations[0]).toContain('bad-env.tsx')
      expect(result.violations[0]).toContain('NEXT_PUBLIC_SITE_URL')
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should fail on new URL with a literal https origin', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-seo-check-'))

    try {
      const appDir = join(tempDir, 'src/app')
      mkdirSync(appDir, { recursive: true })
      writeFileSync(
        join(appDir, 'bad-url.tsx'),
        `const url = new URL('https://example.com/page')\n`,
      )

      const result = checkSeoBaseUrl([appDir])
      expect(result.ok).toBe(false)
      expect(result.violations[0]).toContain('bad-url.tsx')
      expect(result.violations[0]).toContain('literal origin')
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should not flag bare https string literals', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-seo-check-'))

    try {
      const siteTs = join(tempDir, 'src/config/site.ts')
      mkdirSync(join(tempDir, 'src/config'), { recursive: true })
      writeFileSync(
        siteTs,
        `const GITHUB_URL = 'https://github.com/aaronwllms/seminova'\nexport { GITHUB_URL }\n`,
      )

      const result = checkSeoBaseUrl([siteTs])
      expect(result.ok).toBe(true)
      expect(result.violations).toEqual([])
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
