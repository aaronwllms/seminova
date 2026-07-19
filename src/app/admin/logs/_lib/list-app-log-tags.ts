import type { SupabaseClient } from '@supabase/supabase-js'

export const listAppLogTags = async (
  client: SupabaseClient,
): Promise<string[]> => {
  const { data, error } = await client
    .from('app_logs')
    .select('tag')
    .order('tag', { ascending: true })

  if (error) {
    throw error
  }

  const seen = new Set<string>()
  const tags: string[] = []

  for (const row of data ?? []) {
    if (!seen.has(row.tag)) {
      seen.add(row.tag)
      tags.push(row.tag)
    }
  }

  return tags
}
