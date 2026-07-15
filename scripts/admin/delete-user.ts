import { runDeleteUser } from './lib/cli'

runDeleteUser(process.argv.slice(2)).catch((error: unknown) => {
  console.error('[delete-user] Unexpected error', error)
  process.exit(1)
})
