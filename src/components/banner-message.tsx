import Link from 'next/link'

import { cn } from '@/utils/tailwind'
import {
  parseBannerMessage,
  type BannerMessageSegment,
} from '@/utils/parse-banner-message'

interface BannerMessageProps {
  message: string
  linkClassName?: string
}

const renderSegment = (
  segment: BannerMessageSegment,
  index: number,
  linkClassName?: string,
) => {
  if (segment.type === 'bold') {
    return <strong key={index}>{segment.content}</strong>
  }

  if (segment.type === 'link') {
    const className = cn('underline', linkClassName)

    if (segment.href.startsWith('/')) {
      return (
        <Link key={index} href={segment.href} className={className}>
          {segment.content}
        </Link>
      )
    }

    return (
      <a key={index} href={segment.href} className={className}>
        {segment.content}
      </a>
    )
  }

  return <span key={index}>{segment.content}</span>
}

export const BannerMessage = ({
  message,
  linkClassName,
}: BannerMessageProps) => {
  const segments = parseBannerMessage(message)

  if (segments.length === 0) {
    return null
  }

  return (
    <>
      {segments.map((segment, index) =>
        renderSegment(segment, index, linkClassName),
      )}
    </>
  )
}
