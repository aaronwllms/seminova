export type AuthErrorSource = 'confirm' | 'invalid_link'

const AUTH_ERROR_MESSAGES: Record<AuthErrorSource, string> = {
  confirm:
    "We couldn't verify that link. It may have expired or already been used. Request a new one and try again.",
  invalid_link:
    "That link isn't valid. Check the URL from your email and try again.",
}

export const AUTH_ERROR_GENERIC_MESSAGE =
  'Something went wrong. Please try again, or contact support if this continues.'

export const getAuthErrorMessage = (source: string | undefined): string => {
  if (source && source in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[source as AuthErrorSource]
  }

  return AUTH_ERROR_GENERIC_MESSAGE
}
