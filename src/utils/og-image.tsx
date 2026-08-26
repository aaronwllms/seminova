import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { siteConfig } from '@/config/site'

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

// Mirror :root light-theme tokens in globals.css — update on re-skin.
export const OG_COLORS = {
  background: '#f8fafc',
  foreground: '#1e293b',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  mutedForeground: '#6b7280',
} as const

const interSemiBoldPath = join(
  process.cwd(),
  'src/assets/fonts/Inter-SemiBold.ttf',
)

let interSemiBoldPromise: Promise<ArrayBuffer> | null = null

function loadInterSemiBold(): Promise<ArrayBuffer> {
  if (!interSemiBoldPromise) {
    interSemiBoldPromise = readFile(interSemiBoldPath).then((buffer) =>
      buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      ),
    )
  }

  return interSemiBoldPromise
}

export function formatOgPageTitle(pageTitle: string): string {
  return `${pageTitle} | ${siteConfig.name}`
}

export interface CreateOgImageResponseInput {
  title: string
  description: string
}

export async function createOgImageResponse({
  title,
  description,
}: CreateOgImageResponseInput): Promise<ImageResponse> {
  const fontData = await loadInterSemiBold()
  const Logo = siteConfig.Logo

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '64px',
        backgroundColor: OG_COLORS.background,
        color: OG_COLORS.foreground,
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: OG_COLORS.primary,
          }}
        >
          <Logo
            width={18}
            height={18}
            stroke={OG_COLORS.primaryForeground}
            strokeWidth={2}
          />
        </div>
        <span
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: OG_COLORS.primary,
          }}
        >
          {siteConfig.name}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '32px',
            lineHeight: 1.4,
            color: OG_COLORS.mutedForeground,
            maxWidth: '900px',
          }}
        >
          {description}
        </div>
      </div>
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 600,
        },
      ],
    },
  )
}
