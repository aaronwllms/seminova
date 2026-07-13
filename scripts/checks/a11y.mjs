import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const APP_ROOT = join(root, 'src/app')
const SRC_ROOT = join(root, 'src')

const ROUTE_ENTRY_NAMES = new Set(['page.tsx', 'error.tsx'])
const TEST_FILE = /\.(unit\.|integration\.)?test\.(ts|tsx|mjs)$/
const UI_PRIMITIVE_DIR = `${sep}src${sep}components${sep}ui${sep}`

const IMPORT_REGEX =
  /import\s+(?:type\s+)?(?:(?:\{([^}]+)\})|([A-Za-z_$][\w$]*))\s+from\s+['"]([^'"]+)['"]/g
const H1_REGEX = /<h1\b/g
const HEADING_TAG_REGEX = /<(h[1-6]|[A-Z][A-Za-z0-9]*)\b/g
const IMAGE_TAG_REGEX = /<(img|Image|AvatarImage)\b([^>]*?)(\/?)>/g
const EMPTY_ALT_REGEX = /alt\s*=\s*(?:""|''|{\s*['"]{2}\s*})/
const NON_LITERAL_ALT_REGEX = /alt\s*=\s*{/
const DECORATIVE_REGEX =
  /(?:role\s*=\s*["']presentation["']|aria-hidden(?:\s*=\s*["'][^"']*["'])?)/

const fail = (message) => {
  console.error(`[check:a11y] ${message}`)
  process.exit(1)
}

const relativePath = (absolutePath) => relative(root, absolutePath)

const isScannableFile = (filePath) => {
  if (!/\.(ts|tsx)$/.test(filePath)) {
    return false
  }

  if (TEST_FILE.test(filePath)) {
    return false
  }

  if (filePath.includes(UI_PRIMITIVE_DIR)) {
    return false
  }

  return true
}

const resolveImport = (specifier, fromFile) => {
  let base

  if (specifier.startsWith('@/')) {
    base = join(SRC_ROOT, specifier.slice(2))
  } else if (specifier.startsWith('.')) {
    base = join(dirname(fromFile), specifier)
  } else {
    return null
  }

  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    join(base, 'index.tsx'),
    join(base, 'index.ts'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate) && isScannableFile(candidate)) {
      return candidate
    }
  }

  return null
}

const parseImportMap = (content, filePath) => {
  const importMap = new Map()

  for (const match of content.matchAll(IMPORT_REGEX)) {
    const named = match[1]
    const defaultName = match[2]
    const specifier = match[3]
    const resolved = resolveImport(specifier, filePath)

    if (!resolved) {
      continue
    }

    if (defaultName) {
      importMap.set(defaultName, resolved)
    }

    if (named) {
      for (const part of named.split(',')) {
        const trimmed = part.trim()
        if (!trimmed) {
          continue
        }

        const aliasMatch = trimmed.match(
          /^type\s+([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/,
        )
        const plainMatch = trimmed.match(
          /^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/,
        )
        const matchParts = aliasMatch ?? plainMatch

        if (!matchParts) {
          continue
        }

        const localName = matchParts[2] ?? matchParts[1]
        importMap.set(localName, resolved)
      }
    }
  }

  return importMap
}

const buildImportClosure = (seedFiles) => {
  const closure = new Set()
  const queue = [...seedFiles]

  while (queue.length > 0) {
    const filePath = queue.shift()

    if (
      closure.has(filePath) ||
      !existsSync(filePath) ||
      !isScannableFile(filePath)
    ) {
      continue
    }

    closure.add(filePath)
    const content = readFileSync(filePath, 'utf8')
    const importMap = parseImportMap(content, filePath)

    for (const resolved of importMap.values()) {
      if (!closure.has(resolved)) {
        queue.push(resolved)
      }
    }
  }

  return closure
}

const collectRouteEntries = (dir = APP_ROOT, entries = []) => {
  if (!existsSync(dir)) {
    return entries
  }

  for (const name of readdirSync(dir)) {
    const entryPath = join(dir, name)
    const stat = statSync(entryPath)

    if (stat.isDirectory()) {
      collectRouteEntries(entryPath, entries)
      continue
    }

    if (ROUTE_ENTRY_NAMES.has(name)) {
      entries.push(entryPath)
    }
  }

  return entries
}

const collectLayoutChain = (entryFile) => {
  const layouts = []
  const rootLayout = join(APP_ROOT, 'layout.tsx')
  let dir = dirname(entryFile)

  while (dir.startsWith(APP_ROOT) && dir !== APP_ROOT) {
    const layoutPath = join(dir, 'layout.tsx')

    if (existsSync(layoutPath) && layoutPath !== rootLayout) {
      layouts.push(layoutPath)
    }

    dir = dirname(dir)
  }

  return layouts
}

const routeLabel = (entryFile) => {
  const routeDir = relative(APP_ROOT, dirname(entryFile))
  const segments = routeDir
    .split(sep)
    .filter((segment) => segment.length > 0 && !segment.startsWith('('))

  const base = segments.length === 0 ? '/' : `/${segments.join('/')}`
  return entryFile.endsWith('error.tsx') ? `${base} (error)` : base
}

const walkHeadings = (filePath, content, importMap, headings, expanding) => {
  for (const match of content.matchAll(HEADING_TAG_REGEX)) {
    const tagName = match[1]

    if (/^h[1-6]$/.test(tagName)) {
      headings.push({
        level: Number.parseInt(tagName.slice(1), 10),
        file: filePath,
      })
      continue
    }

    const childPath = importMap.get(tagName)

    if (!childPath || expanding.has(childPath)) {
      continue
    }

    expanding.add(childPath)
    const childContent = readFileSync(childPath, 'utf8')
    const childImports = parseImportMap(childContent, childPath)
    walkHeadings(childPath, childContent, childImports, headings, expanding)
    expanding.delete(childPath)
  }
}

const extractHeadingOrder = (entryFile) => {
  const content = readFileSync(entryFile, 'utf8')
  const importMap = parseImportMap(content, entryFile)
  const headings = []
  const expanding = new Set()

  walkHeadings(entryFile, content, importMap, headings, expanding)

  return headings
}

const scanImageAlts = (content, filePath, violations, route) => {
  for (const match of content.matchAll(IMAGE_TAG_REGEX)) {
    const attrs = match[2]
    const hasAlt = /\balt\s*=/.test(attrs)

    if (!hasAlt) {
      violations.push(
        `${route}: image missing alt attribute (${relativePath(filePath)})`,
      )
      continue
    }

    if (NON_LITERAL_ALT_REGEX.test(attrs) && !EMPTY_ALT_REGEX.test(attrs)) {
      continue
    }

    if (!EMPTY_ALT_REGEX.test(attrs)) {
      continue
    }

    if (DECORATIVE_REGEX.test(attrs)) {
      continue
    }

    violations.push(
      `${route}: image has empty alt without decorative exemption (${relativePath(filePath)})`,
    )
  }
}

const countH1 = (content) => {
  const matches = content.match(H1_REGEX)
  return matches ? matches.length : 0
}

const analyzeRoute = (entryFile) => {
  const route = routeLabel(entryFile)
  const layouts = collectLayoutChain(entryFile)
  const closure = buildImportClosure([entryFile, ...layouts])
  const violations = []

  let h1Count = 0
  const h1Files = []

  for (const filePath of closure) {
    const content = readFileSync(filePath, 'utf8')
    const fileH1Count = countH1(content)

    if (fileH1Count > 0) {
      h1Count += fileH1Count
      h1Files.push({ file: relativePath(filePath), count: fileH1Count })
    }

    scanImageAlts(content, filePath, violations, route)
  }

  if (h1Count !== 1) {
    const detail =
      h1Files.length > 0
        ? h1Files.map(({ file, count }) => `${file} (${count})`).join(', ')
        : 'none found'
    violations.unshift(`${route}: expected 1 h1, found ${h1Count} (${detail})`)
  }

  const headings = extractHeadingOrder(entryFile)

  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1]
    const current = headings[index]
    const jump = current.level - previous.level

    if (jump > 1) {
      violations.push(
        `${route}: heading level skips from h${previous.level} to h${current.level} (${relativePath(current.file)})`,
      )
    }
  }

  return violations
}

export const checkA11y = (appRoot = APP_ROOT) => {
  const violations = []
  const entries = collectRouteEntries(appRoot)

  for (const entryFile of entries) {
    violations.push(...analyzeRoute(entryFile))
  }

  return { ok: violations.length === 0, violations }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const result = checkA11y()

  if (!result.ok) {
    for (const violation of result.violations) {
      fail(violation)
    }
  }

  console.log(
    '[check:a11y] OK — one h1 per route, valid image alt text, no skipped heading levels.',
  )
}
