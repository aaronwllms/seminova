import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

const fail = (message) => {
  console.error(`[check:checks-wired] ${message}`)
  process.exit(1)
}

const packageJsonPath = join(root, 'package.json')
if (!existsSync(packageJsonPath)) {
  fail('package.json not found at repo root.')
}

const workflowPath = join(root, '.github/workflows/pull-request.yaml')
if (!existsSync(workflowPath)) {
  fail('.github/workflows/pull-request.yaml not found.')
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const scripts = packageJson.scripts ?? {}

const prePush = scripts['pre-push']
if (typeof prePush !== 'string') {
  fail('package.json has no "pre-push" script.')
}

const workflow = readFileSync(workflowPath, 'utf8')

const checkNames = Object.keys(scripts).filter((name) =>
  name.startsWith('check:'),
)

if (checkNames.length === 0) {
  fail('No "check:*" scripts found in package.json.')
}

// A script counts as invoked when the command appears followed by a word
// boundary, so "check:a11y" does not match "check:a11y-contrast".
const isInvoked = (haystack, name) =>
  new RegExp(`pnpm ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w:-])`).test(
    haystack,
  )

const missingFromPrePush = checkNames.filter((name) => !isInvoked(prePush, name))
const missingFromCi = checkNames.filter((name) => !isInvoked(workflow, name))

if (missingFromPrePush.length > 0 || missingFromCi.length > 0) {
  if (missingFromPrePush.length > 0) {
    console.error(
      `[check:checks-wired] Defined but not run by "pre-push": ${missingFromPrePush.join(', ')}`,
    )
  }

  if (missingFromCi.length > 0) {
    console.error(
      `[check:checks-wired] Defined but not run by CI (.github/workflows/pull-request.yaml): ${missingFromCi.join(', ')}`,
    )
  }

  fail(
    'Every "check:*" script must run in both pre-push and CI. Add the missing steps, or delete the script if it is no longer needed.',
  )
}

console.log(
  `[check:checks-wired] OK — all ${checkNames.length} check scripts run in pre-push and CI.`,
)
