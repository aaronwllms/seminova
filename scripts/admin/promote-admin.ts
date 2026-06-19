import { runPromoteAdmin } from './lib/cli'

runPromoteAdmin(process.argv.slice(2)).catch((error: unknown) => {
  console.error('[promote-admin] Unexpected error', error)
  process.exit(1)
})
