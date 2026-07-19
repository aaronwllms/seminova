import { ADMIN_SETTINGS } from '@/constants/admin-paths'

let settingsVisitKey = 0
let previousPathname = ''

/** Bumps when pathname transitions onto settings; safe to call from any admin shell render. */
export const syncAdminSettingsVisitKey = (pathname: string): number => {
  if (pathname !== previousPathname) {
    if (pathname === ADMIN_SETTINGS) {
      settingsVisitKey += 1
    }

    previousPathname = pathname
  }

  return settingsVisitKey
}

/** Resets module state between unit tests. */
export const resetAdminSettingsVisitKeyForTests = (): void => {
  settingsVisitKey = 0
  previousPathname = ''
}
