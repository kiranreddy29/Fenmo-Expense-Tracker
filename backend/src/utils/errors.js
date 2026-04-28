export class AppError extends Error {
  constructor(message, statusCode, code, fields = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, fields) {
    super(message, 400, 'VALIDATION_ERROR', fields);
  }
}

export class IdempotencyConflictError extends AppError {
  constructor() {
    super('This idempotency key was already used with a different request body', 409, 'IDEMPOTENCY_CONFLICT');
  }
}

export class MissingIdempotencyKeyError extends AppError {
  constructor() {
    super('Idempotency-Key header is required', 400, 'MISSING_IDEMPOTENCY_KEY');
  }
}
