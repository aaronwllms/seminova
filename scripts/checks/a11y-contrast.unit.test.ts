import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  checkA11yContrast,
  contrastRatioFromOklch,
  parseOklch,
} from './a11y-contrast.mjs'

const MINIMAL_THEME_CSS = `
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0 0 0);
  --primary: oklch(0.5 0.2 260);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.9 0.01 260);
  --secondary-foreground: oklch(0.2 0.03 260);
  --muted: oklch(0.95 0.01 260);
  --muted-foreground: oklch(0.45 0.02 260);
  --accent: oklch(0.92 0.03 260);
  --accent-foreground: oklch(0.2 0.03 260);
  --destructive: oklch(0.55 0.2 25);
  --destructive-foreground: oklch(1 0 0);
  --success: oklch(0.45 0.14 150);
  --success-foreground: oklch(1 0 0);
  --warning: oklch(0.55 0.18 45);
  --warning-foreground: oklch(1 0 0);
  --sidebar: oklch(0.95 0.01 260);
  --sidebar-foreground: oklch(0.2 0.03 260);
  --sidebar-primary: oklch(0.5 0.2 260);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.92 0.03 260);
  --sidebar-accent-foreground: oklch(0.2 0.03 260);
}
.dark {
  --background: oklch(0.2 0.04 260);
  --foreground: oklch(0.93 0.01 260);
  --card: oklch(0.28 0.04 260);
  --card-foreground: oklch(0.93 0.01 260);
  --popover: oklch(0.28 0.04 260);
  --popover-foreground: oklch(0.93 0.01 260);
  --primary: oklch(0.68 0.16 277);
  --primary-foreground: oklch(0.2 0.04 260);
  --secondary: oklch(0.33 0.03 260);
  --secondary-foreground: oklch(0.87 0.01 260);
  --muted: oklch(0.24 0.04 260);
  --muted-foreground: oklch(0.71 0.02 260);
  --accent: oklch(0.37 0.03 260);
  --accent-foreground: oklch(0.87 0.01 260);
  --destructive: oklch(0.64 0.21 25);
  --destructive-foreground: oklch(0.2 0.04 260);
  --success: oklch(0.63 0.17 149);
  --success-foreground: oklch(0.2 0.04 260);
  --warning: oklch(0.7 0.18 52);
  --warning-foreground: oklch(0.2 0.04 260);
  --sidebar: oklch(0.28 0.04 260);
  --sidebar-foreground: oklch(0.93 0.01 260);
  --sidebar-primary: oklch(0.68 0.16 277);
  --sidebar-primary-foreground: oklch(0.2 0.04 260);
  --sidebar-accent: oklch(0.37 0.03 260);
  --sidebar-accent-foreground: oklch(0.87 0.01 260);
}
`

describe('contrastRatioFromOklch', () => {
  it('should compute 21:1 for black on white', () => {
    expect(contrastRatioFromOklch('oklch(1 0 0)', 'oklch(0 0 0)')).toBeCloseTo(
      21,
      0,
    )
  })

  it('should parse percentage lightness in oklch values', () => {
    expect(parseOklch('oklch(100% 0 0)')).toEqual({
      l: 1,
      c: 0,
      h: 0,
      alpha: 1,
    })
  })
})

describe('checkA11yContrast', () => {
  it('should pass on shipped globals.css', () => {
    const result = checkA11yContrast()
    expect(result.ok).toBe(true)
    expect(result.violations).toEqual([])
  })

  it('should fail when a token pair is below 4.5:1', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-a11y-contrast-'))

    try {
      const cssPath = join(tempDir, 'globals.css')
      writeFileSync(
        cssPath,
        MINIMAL_THEME_CSS.replace(
          '--muted-foreground: oklch(0.45 0.02 260);',
          '--muted-foreground: oklch(0.8 0.02 260);',
        ),
      )

      const result = checkA11yContrast(cssPath)
      expect(result.ok).toBe(false)
      expect(
        result.violations.some((v) =>
          v.includes(':root muted/muted-foreground'),
        ),
      ).toBe(true)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
