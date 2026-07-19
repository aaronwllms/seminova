const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/

export const isValidCursorCreatedAt = (value: string): boolean => {
  if (!ISO_TIMESTAMP_PATTERN.test(value)) {
    return false
  }

  return !Number.isNaN(Date.parse(value))
}
