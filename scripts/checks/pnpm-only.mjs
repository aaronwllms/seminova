import { existsSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const root = process.cwd()

const fail = (message) => {
  console.error(`[check:pnpm-only] ${message}`)
  process.exit(1)
}

for (const lockfile of ['package-lock.json', 'yarn.lock']) {
  const path = join(root, lockfile)
  if (existsSync(path)) {
    fail(
      `Found ${lockfile} at repo root. This project uses pnpm only — delete ${lockfile} and use pnpm-lock.yaml.`,
    )
  }
}

const packageJsonPath = join(root, 'package.json')
if (!existsSync(packageJsonPath)) {
  fail('package.json not found at repo root.')
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const { packageManager } = packageJson

if (!packageManager || typeof packageManager !== 'string') {
  fail(
    'package.json is missing "packageManager". Set it to "pnpm@<version>" (e.g. pnpm@11.0.9).',
  )
}

if (!packageManager.startsWith('pnpm@')) {
  fail(
    `package.json "packageManager" must start with "pnpm@" (found: ${packageManager}).`,
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
