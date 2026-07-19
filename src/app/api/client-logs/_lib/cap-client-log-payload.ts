export const CLIENT_LOG_MESSAGE_MAX_LENGTH = 2_000 as const

export const CLIENT_LOG_CONTEXT_MAX_BYTES = 8_192 as const

export const truncateClientLogMessage = (message: string): string =>
  message.length <= CLIENT_LOG_MESSAGE_MAX_LENGTH
    ? message
    : message.slice(0, CLIENT_LOG_MESSAGE_MAX_LENGTH)

const byteLength = (value: string): number => Buffer.byteLength(value, 'utf8')

export const truncateClientLogContext = (
  context: Record<string, unknown>,
): Record<string, unknown> => {
  const serialized = JSON.stringify(context)

  if (byteLength(serialized) <= CLIENT_LOG_CONTEXT_MAX_BYTES) {
    return context
  }

  const keys = Object.keys(context).sort()
  const truncated: Record<string, unknown> = { ...context }

  for (let index = keys.length - 1; index >= 0; index -= 1) {
    delete truncated[keys[index]]

    const candidate = { ...truncated, contextTruncated: true }
    if (byteLength(JSON.stringify(candidate)) <= CLIENT_LOG_CONTEXT_MAX_BYTES) {
      return candidate
    }
  }

  return { contextTruncated: true }
}
