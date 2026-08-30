import { isSafeUrlScheme } from '@/utils/is-safe-url-scheme'

export type BannerMessageSegment =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'link'; content: string; href: string }

const BANNER_MESSAGE_TOKEN_PATTERN =
  /\*\*[^*]+\*\*|\[[^\]]+\]\((?:[^()]|\([^()]*\))*\)/g

export const parseBannerMessage = (message: string): BannerMessageSegment[] => {
  if (message.length === 0) {
    return []
  }

  const segments: BannerMessageSegment[] = []
  let lastIndex = 0

  for (const match of message.matchAll(BANNER_MESSAGE_TOKEN_PATTERN)) {
    const token = match[0]
    const tokenIndex = match.index ?? 0

    if (tokenIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: message.slice(lastIndex, tokenIndex),
      })
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      segments.push({
        type: 'bold',
        content: token.slice(2, -2),
      })
    } else {
      const linkMatch = /^\[([^\]]+)\]\(((?:[^()]|\([^()]*\))*)\)$/.exec(token)
      const label = linkMatch?.[1]
      const href = linkMatch?.[2]

      if (label && href && isSafeUrlScheme(href)) {
        segments.push({
          type: 'link',
          content: label,
          href,
        })
      } else {
        segments.push({ type: 'text', content: token })
      }
    }

    lastIndex = tokenIndex + token.length
  }

  if (lastIndex < message.length) {
    segments.push({
      type: 'text',
      content: message.slice(lastIndex),
    })
  }

  return segments
}
