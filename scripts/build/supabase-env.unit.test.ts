import { describe, expect, it } from 'vitest'

import { checkSupabaseEnv } from './supabase-env.mjs'

describe('checkSupabaseEnv', () => {
  it('should pass when Supabase public env vars are set', () => {
    const result = checkSupabaseEnv({
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'eyJexample',
    })

    expect(result.ok).toBe(true)
    expect(result.violations).toEqual([])
  })

  it('should fail when env vars are missing or placeholders', () => {
    const result = checkSupabaseEnv({
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'your-project-url',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'your-publishable-key',
    })

    expect(result.ok).toBe(false)
    expect(result.violations).toHaveLength(2)
    expect(result.violations[0]).toContain('NEXT_PUBLIC_SUPABASE_URL')
    expect(result.violations[1]).toContain(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    )
  })
})
