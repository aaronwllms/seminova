import { demoteUser, listAdminUsers, promoteUser } from './admin-users'
import { loadAdminEnv } from './env'
import { confirmAction } from './prompt'
import { createServiceClient } from './service-client'

const MISSING_EMAIL_MESSAGE =
  'Usage: pnpm <command> <email> — email is required'

export const parseEmailArg = (args: string[]): string | null => {
  const email = args[0]?.trim()
  return email || null
}

export const runPromoteAdmin = async (args: string[]): Promise<void> => {
  const email = parseEmailArg(args)

  if (!email) {
    console.error(`[promote-admin] ${MISSING_EMAIL_MESSAGE}`)
    process.exit(1)
  }

  const env = loadAdminEnv()

  const confirmed = await confirmAction(
    env.supabaseUrl,
    'Promote to admin',
    email,
  )

  if (!confirmed) {
    console.log('[promote-admin] Cancelled')
    return
  }

  const client = createServiceClient(env)
  const result = await promoteUser(client, email)

  if (result.status === 'not_found') {
    console.error(
      '[promote-admin] no user found with that email — sign up first',
    )
    process.exit(1)
  }

  if (result.status === 'already_admin') {
    console.log(`[promote-admin] ${result.email} is already an admin`)
    return
  }

  console.warn(`[promote-admin] ${result.email} promoted to admin`)
}

export const runDemoteAdmin = async (args: string[]): Promise<void> => {
  const email = parseEmailArg(args)

  if (!email) {
    console.error(`[demote-admin] ${MISSING_EMAIL_MESSAGE}`)
    process.exit(1)
  }

  const env = loadAdminEnv()

  const confirmed = await confirmAction(
    env.supabaseUrl,
    'Demote from admin',
    email,
  )

  if (!confirmed) {
    console.log('[demote-admin] Cancelled')
    return
  }

  const client = createServiceClient(env)
  const result = await demoteUser(client, email)

  if (result.status === 'not_found') {
    console.error(
      '[demote-admin] no user found with that email — sign up first',
    )
    process.exit(1)
  }

  if (result.status === 'not_admin') {
    console.log(`[demote-admin] ${result.email} is not an admin`)
    return
  }

  console.warn(`[demote-admin] ${result.email} demoted from admin`)
}

export const runListAdmins = async (): Promise<void> => {
  const env = loadAdminEnv()
  const client = createServiceClient(env)
  const admins = await listAdminUsers(client)

  if (admins.length === 0) {
    console.log('[list-admins] no admins found')
    return
  }

  console.log('[list-admins] Admins:')
  for (const email of admins) {
    console.log(`  ${email}`)
  }
}
