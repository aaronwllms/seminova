import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { checkA11yStructure } from './a11y-structure.mjs'

describe('checkA11yStructure', () => {
  it('should pass on shipped app routes', () => {
    const result = checkA11yStructure()
    expect(result.ok).toBe(true)
    expect(result.violations).toEqual([])
  })

  it('should fail when a route closure has no h1', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-a11y-check-'))

    try {
      const appDir = join(tempDir, 'src/app/missing-h1')
      mkdirSync(appDir, { recursive: true })
      writeFileSync(
        join(appDir, 'page.tsx'),
        `export default function Page() { return <main><p>No title</p></main> }\n`,
      )

      const result = checkA11yStructure(join(tempDir, 'src/app'))
      expect(result.ok).toBe(false)
      expect(result.violations[0]).toContain('/missing-h1')
      expect(result.violations[0]).toContain('expected 1 h1, found 0')
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should reach relatively imported components in the closure', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-a11y-check-'))

    try {
      const routeDir = join(tempDir, 'src/app/relative-import')
      const componentsDir = join(routeDir, '_components')
      mkdirSync(componentsDir, { recursive: true })
      writeFileSync(
        join(componentsDir, 'section.tsx'),
        `export function Section() { return <section><h1>Title</h1></section> }\n`,
      )
      writeFileSync(
        join(routeDir, 'page.tsx'),
        `import { Section } from './_components/section'\nexport default function Page() { return <Section /> }\n`,
      )

      const result = checkA11yStructure(join(tempDir, 'src/app'))
      expect(result.ok).toBe(true)
      expect(result.violations).toEqual([])
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should fail on empty image alt without decorative exemption', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-a11y-check-'))

    try {
      const routeDir = join(tempDir, 'src/app/bad-alt')
      const componentsDir = join(routeDir, '_components')
      mkdirSync(componentsDir, { recursive: true })
      writeFileSync(
        join(componentsDir, 'hero.tsx'),
        `import Image from 'next/image'\nexport function Hero() { return <Image src="/logo.png" alt="" width={32} height={32} /> }\n`,
      )
      writeFileSync(
        join(routeDir, 'page.tsx'),
        `import { Hero } from './_components/hero'\nexport default function Page() { return <main><h1>Home</h1><Hero /></main> }\n`,
      )

      const result = checkA11yStructure(join(tempDir, 'src/app'))
      expect(result.ok).toBe(false)
      expect(result.violations.some((v) => v.includes('empty alt'))).toBe(true)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should fail on skipped heading levels', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-a11y-check-'))

    try {
      const appDir = join(tempDir, 'src/app/skipped-heading')
      mkdirSync(appDir, { recursive: true })
      writeFileSync(
        join(appDir, 'page.tsx'),
        `export default function Page() { return <main><h1>Title</h1><h3>Sub</h3></main> }\n`,
      )

      const result = checkA11yStructure(join(tempDir, 'src/app'))
      expect(result.ok).toBe(false)
      expect(
        result.violations.some((v) => v.includes('heading level skips')),
      ).toBe(true)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
