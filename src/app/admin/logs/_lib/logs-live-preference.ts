export const LOGS_LIVE_ENABLED_STORAGE_KEY = 'admin-logs-live-enabled'

export const readLogsLiveEnabledPreference = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(LOGS_LIVE_ENABLED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const writeLogsLiveEnabledPreference = (enabled: boolean): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      LOGS_LIVE_ENABLED_STORAGE_KEY,
      enabled ? 'true' : 'false',
    )
  } catch {
    // silent no-op when storage is unavailable
  }
}
