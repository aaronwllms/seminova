import { runPromoteAdmin, runCliScript } from './lib/cli'

runCliScript(() => runPromoteAdmin(process.argv.slice(2)), 'promote-admin')
