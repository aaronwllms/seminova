import nextEnv from '@next/env'
import { pathToFileURL } from 'node:url'

const PLACEHOLDER_VALUES = new Set([
  'your-project-url',
  'your-publishable-key',
  '',
])

const fail = (message) => {
  console.error(`[check:supabase-env] ${message}`)
  process.exit(1)
}

export const checkSupabaseEnv = (env = process.env) => {
  const violations = []

  const url = env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || PLACEHOLDER_VALUES.has(url)) {
    violations.push(
      'NEXT_PUBLIC_SUPABASE_URL is missing or still set to the .env.example placeholder.',
    )
  }

  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!key || PLACEHOLDER_VALUES.has(key)) {
    violations.push(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing or still set to the .env.example placeholder.',
    )
  }

  return { ok: violations.length === 0, violations }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const { loadEnvConfig } = nextEnv
  loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error })
  const result = checkSupabaseEnv()

  if (!result.ok) {
    for (const violation of result.violations) {
      fail(violation)
    }
  }

  console.log(
    '[check:supabase-env] OK — Supabase public env vars are configured.',
  )
}
