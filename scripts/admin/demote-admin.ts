import { runDemoteAdmin } from './lib/cli'

runDemoteAdmin(process.argv.slice(2)).catch((error: unknown) => {
  console.error('[demote-admin] Unexpected error', error)
  process.exit(1)
})
