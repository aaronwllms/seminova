import type { Database } from '@/types/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
