import { cliLog } from '@/utils/app-logger-cli'

import { runListAdmins } from './lib/cli'

runListAdmins().catch(async (error: unknown) => {
  await cliLog.error('list-admins', 'Unexpected error', error)
  process.exit(1)
})
