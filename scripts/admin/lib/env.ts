import { loadServiceEnvForCli, type ServiceSupabaseEnv } from '@/utils/env'

export type AdminEnv = ServiceSupabaseEnv

export const loadAdminEnv = (): AdminEnv => loadServiceEnvForCli()
