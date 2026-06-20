export type ErrorKind = 'operational' | 'fault'

export interface AppError {
  message: string
  kind: ErrorKind
  code?: string
}
