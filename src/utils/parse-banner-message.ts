export type BannerMessageSegment =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'link'; content: string; href: string }

const BANNER_MESSAGE_TOKEN_PATTERN =
  /\*\*[^*]+\*\*|\[[^\]]+\]\((?:[^()]|\([^()]*\))*\)/g

export const isValidBannerLinkHref = (href: string): boolean => {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return true
  }

  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

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

      if (linkMatch && isValidBannerLinkHref(linkMatch[2])) {
        segments.push({
          type: 'link',
          content: linkMatch[1],
          href: linkMatch[2],
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
