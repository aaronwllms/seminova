import { runListAdmins } from './lib/cli'

runListAdmins().catch((error: unknown) => {
  console.error('[list-admins] Unexpected error', error)
  process.exit(1)
})
