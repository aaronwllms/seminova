import { cliLog } from '@/utils/app-logger-cli'

import { runPromoteAdmin } from './lib/cli'

runPromoteAdmin(process.argv.slice(2)).catch(async (error: unknown) => {
  await cliLog.error('promote-admin', 'Unexpected error', error)
  process.exit(1)
})
