import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { checkNoProfilesRoleMigrations } from './no-profiles-role.mjs'

describe('checkNoProfilesRoleMigrations', () => {
  it('should pass on shipped migrations', () => {
    const result = checkNoProfilesRoleMigrations()
    expect(result.ok).toBe(true)
    expect(result.violations).toEqual([])
  })

  it('should fail when a migration adds role to public.profiles', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-migrations-'))

    try {
      writeFileSync(
        join(tempDir, '20260703120000_add_profiles_role.sql'),
        `alter table public.profiles add column role text;\n`,
      )

      const result = checkNoProfilesRoleMigrations(tempDir)
      expect(result.ok).toBe(false)
      expect(result.violations[0]).toContain('add_profiles_role.sql')
      expect(result.violations[0]).toContain('role column')
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('should ignore role mentions in SQL line comments', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'seminova-migrations-'))

    try {
      writeFileSync(
        join(tempDir, '20260703130000_comment_only.sql'),
        `create table public.profiles (id uuid primary key);\n-- No role column on profiles\n`,
      )

      const result = checkNoProfilesRoleMigrations(tempDir)
      expect(result.ok).toBe(true)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
