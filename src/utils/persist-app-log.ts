import { createServiceClient } from '@/supabase/service'
import type { AppLogContext, AppLogInsert } from '@/types/app-logs'

const toJsonSafeContext = (value: unknown): AppLogContext => {
  try {
    JSON.parse(JSON.stringify(value))
  } catch {
    return { unserializable: String(value) }
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return { value }
}

export const normalizeLogContext = (context?: unknown): AppLogContext => {
  if (context === undefined) {
    return null
  }

  if (context instanceof Error) {
    return toJsonSafeContext({
      name: context.name,
      message: context.message,
      stack: context.stack,
    })
  }

  return toJsonSafeContext(context)
}

export const persistAppLogRow = async (input: AppLogInsert): Promise<void> => {
  try {
    const client = createServiceClient()
    const { error } = await client.from('app_logs').insert({
      level: input.level,
      tag: input.tag,
      message: input.message,
      context: input.context,
    })

    if (error) {
      // Persist failures cannot route through appLog/cliLog — that would recurse back
      // into persistAppLogRow. Epic 5's raw-console guardrail must exempt this site.
      console.error('[persist-app-log] Failed to insert log row', error)
    }
  } catch (error) {
    // Persist failures cannot route through appLog/cliLog — that would recurse back
    // into persistAppLogRow. Epic 5's raw-console guardrail must exempt this site.
    console.error('[persist-app-log] Failed to insert log row', error)
  }
}
