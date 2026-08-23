import { AppError } from './errors.js'

export function throwIfDbError(
  error: { message: string } | null,
  fallback = 'Database operation failed',
): void {
  if (error) {
    throw new AppError('DB_ERROR', 500, error.message || fallback)
  }
}
