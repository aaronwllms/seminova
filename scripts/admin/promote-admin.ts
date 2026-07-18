import { cliLog } from '@/utils/app-logger-cli'

import { runPromoteAdmin } from './lib/cli'

// debt: duplicated async catch-and-exit shape across promote-admin, demote-admin, delete-user,
// and list-admins — any change to CLI catch-and-exit logging requires four edits; extract the
// shared shape into scripts/admin/lib/cli.ts if the pattern grows.
runPromoteAdmin(process.argv.slice(2)).catch(async (error: unknown) => {
  await cliLog.error('promote-admin', 'Unexpected error', error)
  process.exit(1)
})
