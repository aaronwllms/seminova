import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const migrationsDir = join(root, 'supabase/migrations')

const PREFIX = '[check:admin-gate]'

const fail = (message) => {
  console.error(`${PREFIX} ${message}`)
  process.exit(1)
}

const stripLineComments = (sql) =>
  sql
    .split('\n')
    .map((line) => line.replace(/--.*$/, ''))
    .join('\n')

const CREATE_PROFILES_WITH_ROLE =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?profiles\s*\([^)]*\brole\b[^)]*\)/is

const ALTER_PROFILES_ADD_ROLE =
  /alter\s+table\s+(?:only\s+)?(?:public\.)?profiles\s+[^;]*\badd\b[^;]*\brole\b/is

export const checkNoProfilesRoleMigrations = (dir = migrationsDir) => {
  if (!existsSync(dir)) {
    return { ok: true, violations: [] }
  }

  const violations = []

  for (const file of readdirSync(dir).filter((name) => name.endsWith('.sql'))) {
    const sql = stripLineComments(readFileSync(join(dir, file), 'utf8'))

    if (CREATE_PROFILES_WITH_ROLE.test(sql)) {
      violations.push(
        `${file}: create table public.profiles must not include a role column — admin gate stays on app_metadata.role.`,
      )
    }

    if (ALTER_PROFILES_ADD_ROLE.test(sql)) {
      violations.push(
        `${file}: alter table public.profiles must not add a role column — admin gate stays on app_metadata.role.`,
      )
    }
  }

  return { ok: violations.length === 0, violations }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const result = checkNoProfilesRoleMigrations()

  if (!result.ok) {
    for (const violation of result.violations) {
      console.error(`${PREFIX} ${violation}`)
    }
    fail(
      `${result.violations.length} violation(s) — fix the items listed above.`,
    )
  }

  console.log(
    '[check:admin-gate] OK — no migrations add a role column to public.profiles.',
  )
}
