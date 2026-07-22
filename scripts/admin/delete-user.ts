import { runCliScript, runDeleteUser } from './lib/cli'

runCliScript(() => runDeleteUser(process.argv.slice(2)), 'delete-user')
