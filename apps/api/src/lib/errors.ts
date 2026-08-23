export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(details?: unknown) {
    super('VALIDATION', 400, 'Validation failed', details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', 401, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', 403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(what: string) {
    super('NOT_FOUND', 404, `${what} not found`)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', 409, message)
  }
}
