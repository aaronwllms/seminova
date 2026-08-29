import {
  AVATAR_BUCKET,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'
import { cliLog } from '@/utils/app-logger-cli'
import { createServiceClient } from '@/supabase/service'

import {
  deleteUserAvatarStorage,
  deleteUserById,
  demoteUser,
  findUserByEmail,
  listAdminUsers,
  promoteUser,
} from './admin-users'
import { loadAdminEnv } from './env'
import { confirmAction } from './prompt'

const MISSING_EMAIL_MESSAGE =
  'Usage: pnpm <command> <email> — email is required'

export const runCliScript = (run: () => Promise<void>, tag: string): void => {
  Promise.resolve()
    .then(() => run())
    .catch(async (error: unknown) => {
      await cliLog.error(tag, 'Unexpected error', error)
      process.exit(1)
    })
}

export const parseEmailArg = (args: string[]): string | null => {
  const email = args[0]?.trim()
  return email || null
}

export const runPromoteAdmin = async (args: string[]): Promise<void> => {
  const email = parseEmailArg(args)

  if (!email) {
    await cliLog.error('promote-admin', MISSING_EMAIL_MESSAGE)
    process.exit(1)
  }

  const env = loadAdminEnv()

  const confirmed = await confirmAction(
    env.supabaseUrl,
    'Promote to admin',
    email,
  )

  if (!confirmed) {
    await cliLog.info('promote-admin', 'Cancelled')
    return
  }

  const client = createServiceClient()
  const result = await promoteUser(client, email)

  if (result.status === 'not_found') {
    await cliLog.error(
      'promote-admin',
      'no user found with that email — sign up first',
    )
    process.exit(1)
  }

  if (result.status === 'already_admin') {
    await cliLog.info('promote-admin', `${result.email} is already an admin`)
    return
  }

  await cliLog.warn('promote-admin', `${result.email} promoted to admin`)
}

export const runDemoteAdmin = async (args: string[]): Promise<void> => {
  const email = parseEmailArg(args)

  if (!email) {
    await cliLog.error('demote-admin', MISSING_EMAIL_MESSAGE)
    process.exit(1)
  }

  const env = loadAdminEnv()

  const confirmed = await confirmAction(
    env.supabaseUrl,
    'Demote from admin',
    email,
  )

  if (!confirmed) {
    await cliLog.info('demote-admin', 'Cancelled')
    return
  }

  const client = createServiceClient()
  const result = await demoteUser(client, email)

  if (result.status === 'not_found') {
    await cliLog.error(
      'demote-admin',
      'no user found with that email — sign up first',
    )
    process.exit(1)
  }

  if (result.status === 'not_admin') {
    await cliLog.info('demote-admin', `${result.email} is not an admin`)
    return
  }

  await cliLog.warn('demote-admin', `${result.email} demoted from admin`)
}

export const runDeleteUser = async (args: string[]): Promise<void> => {
  const email = parseEmailArg(args)

  if (!email) {
    await cliLog.error('delete-user', MISSING_EMAIL_MESSAGE)
    process.exit(1)
  }

  const env = loadAdminEnv()

  const confirmed = await confirmAction(env.supabaseUrl, 'Delete user', email)

  if (!confirmed) {
    await cliLog.info('delete-user', 'Cancelled')
    return
  }

  const client = createServiceClient()
  const user = await findUserByEmail(client, email)

  if (!user) {
    await cliLog.error('delete-user', 'no user found with that email')
    process.exit(1)
  }

  // storage.objects has no owner→auth.users FK (objects_owner_fkey removed on
  // current Supabase; verified 2026-07-15). Auth user first, then avatar cleanup.
  const deleteResult = await deleteUserById(client, user.id)

  if (deleteResult.status === 'not_found') {
    await cliLog.error('delete-user', 'no user found with that email')
    process.exit(1)
  }

  const avatarResult = await deleteUserAvatarStorage(client, user.id)

  if (!avatarResult.ok) {
    await cliLog.warn(
      'delete-user',
      `user deleted but avatar file may remain at ${buildAvatarStoragePath(user.id)} in ${AVATAR_BUCKET}`,
      avatarResult.error,
    )
  }

  await cliLog.warn('delete-user', `${deleteResult.email} deleted`)
}

export const runListAdmins = async (): Promise<void> => {
  loadAdminEnv()
  // loadAdminEnv must run first so a missing var exits with [admin-cli] Missing …, not a factory throw
  const client = createServiceClient()
  const admins = await listAdminUsers(client)

  if (admins.length === 0) {
    await cliLog.info('list-admins', 'no admins found')
    return
  }

  for (const email of admins) {
    await cliLog.info('list-admins', email)
  }
}
