import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const GLOBALS_CSS = join(root, 'src/app/globals.css')

const MIN_TEXT_RATIO = 4.5

/** @type {{ base: string; foreground: string; minRatio: number }[]} */
export const TOKEN_PAIRS = [
  { base: 'background', foreground: 'foreground', minRatio: MIN_TEXT_RATIO },
  { base: 'card', foreground: 'card-foreground', minRatio: MIN_TEXT_RATIO },
  {
    base: 'popover',
    foreground: 'popover-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'primary',
    foreground: 'primary-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'secondary',
    foreground: 'secondary-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  { base: 'muted', foreground: 'muted-foreground', minRatio: MIN_TEXT_RATIO },
  { base: 'accent', foreground: 'accent-foreground', minRatio: MIN_TEXT_RATIO },
  {
    base: 'destructive',
    foreground: 'destructive-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'success',
    foreground: 'success-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'warning',
    foreground: 'warning-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'info',
    foreground: 'info-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'sidebar',
    foreground: 'sidebar-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'sidebar-primary',
    foreground: 'sidebar-primary-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
  {
    base: 'sidebar-accent',
    foreground: 'sidebar-accent-foreground',
    minRatio: MIN_TEXT_RATIO,
  },
]

const OKLCH_REGEX =
  /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i

const BLOCK_REGEX = /(?::root(?:\s*,\s*\.light)?|\.dark)\s*\{([^}]*)\}/g
const TOKEN_DECL_REGEX = /--([a-z0-9-]+)\s*:\s*([^;]+);/g

const fail = (message) => {
  console.error(`[check:a11y-contrast] ${message}`)
  process.exit(1)
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const parseOklchNumber = (value) => {
  if (value.endsWith('%')) {
    return Number.parseFloat(value) / 100
  }

  return Number.parseFloat(value)
}

/** @param {string} value */
export const parseOklch = (value) => {
  const trimmed = value.trim()
  const match = trimmed.match(OKLCH_REGEX)

  if (!match) {
    return null
  }

  return {
    l: parseOklchNumber(match[1]),
    c: Number.parseFloat(match[2]),
    h: Number.parseFloat(match[3]),
    alpha: match[4] ? parseOklchNumber(match[4]) : 1,
  }
}

/** @param {{ l: number; c: number; h: number }} oklch */
export const oklchToLinearRgb = ({ l, c, h }) => {
  const hueRad = (h * Math.PI) / 180
  const a = c * Math.cos(hueRad)
  const b = c * Math.sin(hueRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const l3 = l_ ** 3
  const m3 = m_ ** 3
  const s3 = s_ ** 3

  return {
    r: clamp(+4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    g: clamp(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    b: clamp(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
  }
}

/** @param {{ r: number; g: number; b: number }} rgb */
export const relativeLuminance = ({ r, g, b }) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b

// debt: OKLCH alpha — parsed but not composited against the base background
// before contrast; composite against the relevant background token once a
// semantic pair actually uses alpha.
/** @param {string} oklchValue */
export const contrastRatioFromOklch = (baseOklch, foregroundOklch) => {
  const baseLum = relativeLuminance(oklchToLinearRgb(parseOklch(baseOklch)))
  const foregroundLum = relativeLuminance(
    oklchToLinearRgb(parseOklch(foregroundOklch)),
  )
  const lighter = Math.max(baseLum, foregroundLum)
  const darker = Math.min(baseLum, foregroundLum)

  return (lighter + 0.05) / (darker + 0.05)
}

const formatRatio = (ratio) => `${ratio.toFixed(1)}:1`

/** @param {string} cssContent */
export const parseThemeLayers = (cssContent) => {
  /** @type {Record<string, Record<string, string>>} */
  const layers = {}

  for (const match of cssContent.matchAll(BLOCK_REGEX)) {
    const selector = match[0].startsWith(':root') ? ':root' : '.dark'
    /** @type {Record<string, string>} */
    const tokens = {}

    for (const decl of match[1].matchAll(TOKEN_DECL_REGEX)) {
      tokens[decl[1]] = decl[2].trim()
    }

    layers[selector] = tokens
  }

  return layers
}

/** @param {string} cssPath */
export const checkA11yContrast = (cssPath = GLOBALS_CSS) => {
  const cssContent = readFileSync(cssPath, 'utf8')
  const layers = parseThemeLayers(cssContent)
  /** @type {string[]} */
  const violations = []

  for (const layerName of [':root', '.dark']) {
    const tokens = layers[layerName]

    if (!tokens) {
      violations.push(`${layerName}: theme block not found in globals.css`)
      continue
    }

    for (const pair of TOKEN_PAIRS) {
      const baseValue = tokens[pair.base]
      const foregroundValue = tokens[pair.foreground]
      const label = `${layerName} ${pair.base}/${pair.foreground}`

      if (!baseValue) {
        violations.push(`${label}: missing --${pair.base} token`)
        continue
      }

      if (!foregroundValue) {
        violations.push(`${label}: missing --${pair.foreground} token`)
        continue
      }

      // debt: var() indirection — no custom-property resolver; all current
      // tokens are literal OKLCH so this fails clearly; add a CSS custom-property
      // resolver if a token ever uses var() indirection.
      if (
        /\bvar\s*\(/i.test(baseValue) ||
        /\bvar\s*\(/i.test(foregroundValue)
      ) {
        violations.push(
          `${label}: token uses var() indirection — literal OKLCH required`,
        )
        continue
      }

      if (!parseOklch(baseValue)) {
        violations.push(
          `${label}: --${pair.base} is not a literal oklch(...) value`,
        )
        continue
      }

      if (!parseOklch(foregroundValue)) {
        violations.push(
          `${label}: --${pair.foreground} is not a literal oklch(...) value`,
        )
        continue
      }

      const ratio = contrastRatioFromOklch(baseValue, foregroundValue)

      if (ratio < pair.minRatio) {
        violations.push(
          `${label}: ${formatRatio(ratio)} (min ${formatRatio(pair.minRatio)})`,
        )
      }
    }
  }

  return { ok: violations.length === 0, violations }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const result = checkA11yContrast()

  if (!result.ok) {
    for (const violation of result.violations) {
      fail(violation)
    }
  }

  console.log(
    `[check:a11y-contrast] OK — ${TOKEN_PAIRS.length} semantic token pairs meet WCAG AA ${MIN_TEXT_RATIO}:1 in :root and .dark.`,
  )
}
