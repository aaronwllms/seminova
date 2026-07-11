'use server'

import { createClient } from '@/supabase/server'

export type ProbeSessionResult = { success: true } | { success: false }

/**
 * Confirms the proxy-refreshed session on a distinct server request via
 * `getUser()` at the mutation trust boundary. Not a refresh authority.
 */
export const probeSessionAction = async (): Promise<ProbeSessionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { success: false }
  }

  return { success: true }
}
