const padTwo = (value: number): string => String(value).padStart(2, '0')

export const isoToDatetimeLocalValue = (iso: string | null): string => {
  if (!iso) {
    return ''
  }

  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return [
    date.getFullYear(),
    padTwo(date.getMonth() + 1),
    padTwo(date.getDate()),
  ]
    .join('-')
    .concat(`T${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`)
}

export const datetimeLocalToIso = (value: string): string | null => {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const date = new Date(trimmed)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}
