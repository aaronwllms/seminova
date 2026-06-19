import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

export const confirmAction = async (
  projectUrl: string,
  action: string,
  email: string,
): Promise<boolean> => {
  console.log(`Target Supabase project: ${projectUrl}`)

  const rl = readline.createInterface({ input, output })

  try {
    const answer = await rl.question(`${action} ${email}? [y/N] `)
    return answer.trim().toLowerCase() === 'y'
  } finally {
    rl.close()
  }
}
