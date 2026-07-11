import { ImageResponse } from 'next/og'

import { siteConfig } from '@/config/site'
import { OG_COLORS } from '@/utils/og-image'

export const BRAND_MARK_SIZE = { width: 32, height: 32 } as const
export const BRAND_MARK_CONTENT_TYPE = 'image/png'

export function createBrandMarkImageResponse(): ImageResponse {
  const Logo = siteConfig.Logo

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: OG_COLORS.primary,
        borderRadius: '8px',
      }}
    >
      <Logo
        width={20}
        height={20}
        stroke={OG_COLORS.primaryForeground}
        strokeWidth={2}
      />
    </div>,
    BRAND_MARK_SIZE,
  )
}
