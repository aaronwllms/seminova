import { runCliScript, runDemoteAdmin } from './lib/cli'

runCliScript(() => runDemoteAdmin(process.argv.slice(2)), 'demote-admin')
