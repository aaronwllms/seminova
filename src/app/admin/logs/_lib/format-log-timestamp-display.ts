export const formatLogTimestampDisplay = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const logDateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  })

  const logTimeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  const ms = String(date.getMilliseconds()).padStart(3, '0')

  return `${logDateFormatter.format(date)}, ${logTimeFormatter.format(date)}.${ms}`
}
