export const buildBannerDismissKey = (
  headline: string,
  detail: string | null,
): string => {
  const input = `${headline}\0${detail ?? ''}`
  let hash = 5381

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}
