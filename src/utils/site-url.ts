export const getSiteUrl = (): URL => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    return new URL(siteUrl)
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`)
  }

  return new URL('http://localhost:3000')
}
