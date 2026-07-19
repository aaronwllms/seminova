export const buildStructuredCopyText = (
  fields: Record<string, unknown>,
): string => {
  const filtered: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(fields)) {
    if (value !== null && value !== undefined) {
      filtered[key] = value
    }
  }

  return JSON.stringify(filtered, null, 2)
}
