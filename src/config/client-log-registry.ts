export const CLIENT_LOG_KEYS = [
  'app-error',
  'admin-error',
  'auth-error',
  'avatar-storage',
  'auth-form-error',
] as const

export type ClientLogKey = (typeof CLIENT_LOG_KEYS)[number]

const clientLogKeySet = new Set<string>(CLIENT_LOG_KEYS)

export const isClientLogKey = (key: string): key is ClientLogKey =>
  clientLogKeySet.has(key)

export const toClientLogTag = (key: ClientLogKey): string => `client-${key}`
