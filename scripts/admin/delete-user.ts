import { cliLog } from '@/utils/app-logger-cli'

import { runDeleteUser } from './lib/cli'

runDeleteUser(process.argv.slice(2)).catch(async (error: unknown) => {
  await cliLog.error('delete-user', 'Unexpected error', error)
  process.exit(1)
})
