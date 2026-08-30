import { revalidatePath } from 'next/cache'

const PROFILE_DIALOG_HOST_PATHS = ['/(app)', '/admin', '/(marketing)'] as const

export const revalidateProfileDialogHosts = (): void => {
  for (const path of PROFILE_DIALOG_HOST_PATHS) {
    revalidatePath(path, 'layout')
  }
}
