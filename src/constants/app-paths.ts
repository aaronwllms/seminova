export const PROFILE_PATH = '/profile' as const

// While APP_HOME === PROFILE_PATH, the admin-side Profile link in AdminNavUser
// doubles as the switch into the app, so no separate "open app" entry is needed.
// When a product moves APP_HOME off /profile, add an "Open app" entry targeting
// APP_HOME to AdminNavUser — mirroring the admin-console switch in AppNavUser — so
// admins get a direct switch to the app home rather than reaching it indirectly
// through Profile.
export const APP_HOME = PROFILE_PATH
