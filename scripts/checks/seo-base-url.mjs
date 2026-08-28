import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()

const SITE_URL_RESOLVER = join(root, 'src/utils/site-url.ts')

const SCAN_ROOTS = [join(root, 'src')]

const TEST_FILE = /\.(unit\.)?test\.(ts|tsx|mjs)$/

const LOCALHOST_LITERAL = /http:\/\/localhost:3000/
const ENV_READ = /process\.env\.NEXT_PUBLIC_SITE_URL/
const NEW_URL_LITERAL_ORIGIN = /new\s+URL\s*\(\s*['"]https?:\/\/[^'"]+['"]/

const fail = (message) => {
  console.error(`[check:seo-base-url] ${message}`)
  process.exit(1)
}

const isScannableFile = (filePath) => {
  if (!/\.(ts|tsx)$/.test(filePath)) {
    return false
  }

  if (TEST_FILE.test(filePath)) {
    return false
  }

  if (filePath === SITE_URL_RESOLVER) {
    return false
  }

  return true
}

const collectFiles = (entryPath, files = []) => {
  if (!existsSync(entryPath)) {
    return files
  }

  const stat = statSync(entryPath)

  if (stat.isFile()) {
    if (isScannableFile(entryPath)) {
      files.push(entryPath)
    }
    return files
  }

  for (const name of readdirSync(entryPath)) {
    collectFiles(join(entryPath, name), files)
  }

  return files
}

const relativePath = (absolutePath) => relative(root, absolutePath)

export const checkSeoBaseUrl = (scanRoots = SCAN_ROOTS) => {
  const violations = []

  for (const scanRoot of scanRoots) {
    for (const filePath of collectFiles(scanRoot)) {
      const content = readFileSync(filePath, 'utf8')
      const label = relativePath(filePath)

      if (LOCALHOST_LITERAL.test(content)) {
        violations.push(
          `${label}: hardcoded http://localhost:3000 — use getSiteUrl() or metadataBase (only site-url.ts may contain the dev fallback).`,
        )
      }

      if (ENV_READ.test(content)) {
        violations.push(
          `${label}: process.env.NEXT_PUBLIC_SITE_URL must only be read in src/utils/site-url.ts.`,
        )
      }

      if (NEW_URL_LITERAL_ORIGIN.test(content)) {
        violations.push(
          `${label}: new URL() with a literal origin — use getSiteUrl() or metadataBase instead.`,
        )
      }
    }
  }

  return { ok: violations.length === 0, violations }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const result = checkSeoBaseUrl()

  if (!result.ok) {
    for (const violation of result.violations) {
      fail(violation)
    }
  }

  console.log(
    '[check:seo-base-url] OK — no hardcoded dev origin, inline env read, or literal-origin new URL() outside site-url.ts.',
  )
}
