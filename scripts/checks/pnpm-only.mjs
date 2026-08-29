import { existsSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()

const fail = (message) => {
  console.error(`[check:pnpm-only] ${message}`)
  process.exit(1)
}

export function checkPnpmOnly({ foreignLockfiles, packageManager }) {
  const violations = []

  for (const lockfile of foreignLockfiles) {
    violations.push(
      `Found ${lockfile} at repo root. This project uses pnpm only — delete ${lockfile} and use pnpm-lock.yaml.`,
    )
  }

  if (!packageManager || typeof packageManager !== 'string') {
    violations.push(
      'package.json is missing "packageManager". Set it to "pnpm@<version>" (e.g. pnpm@11.0.9).',
    )
  } else if (!packageManager.startsWith('pnpm@')) {
    violations.push(
      `package.json "packageManager" must start with "pnpm@" (found: ${packageManager}).`,
    )
  }

  return {
    ok: violations.length === 0,
    violations,
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const foreignLockfiles = ['package-lock.json', 'yarn.lock'].filter(
    (lockfile) => existsSync(join(root, lockfile)),
  )

  const packageJsonPath = join(root, 'package.json')
  if (!existsSync(packageJsonPath)) {
    fail('package.json not found at repo root.')
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const { packageManager } = packageJson

  const result = checkPnpmOnly({ foreignLockfiles, packageManager })

  if (!result.ok) {
    for (const violation of result.violations) {
      console.error(`[check:pnpm-only] ${violation}`)
    }
    fail(
      `${result.violations.length} violation(s) — fix the items listed above.`,
    )
  }

  try {
    const installedVersion = execSync('pnpm --version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const pinnedVersion = packageManager.match(/^pnpm@([^+]+)/)?.[1]

    if (pinnedVersion && pinnedVersion !== installedVersion) {
      console.warn(
        `[check:pnpm-only] Warning: packageManager pins pnpm@${pinnedVersion} but installed pnpm is ${installedVersion}.`,
      )
    }
  } catch {
    console.warn(
      '[check:pnpm-only] Warning: could not read installed pnpm version.',
    )
  }

  console.log(
    '[check:pnpm-only] OK — pnpm only (no npm/yarn lockfiles; packageManager set).',
  )
}
