import { cliLog } from '@/utils/app-logger-cli'

import { runDemoteAdmin } from './lib/cli'

runDemoteAdmin(process.argv.slice(2)).catch(async (error: unknown) => {
  await cliLog.error('demote-admin', 'Unexpected error', error)
  process.exit(1)
})
