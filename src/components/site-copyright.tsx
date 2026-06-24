import { connection } from 'next/server'

import { siteConfig } from '@/config/site'

export const SiteCopyright = async () => {
  await connection()
  const year = new Date().getFullYear()

  return (
    <span>
      © {year} {siteConfig.name}. All rights reserved.
    </span>
  )
}
