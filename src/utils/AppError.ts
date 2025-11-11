export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Enhanced error classes for Data Layer
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly code?: string;

  constructor(message: string, field?: string, code?: string) {
    super(message, 400);
    this.field = field;
    this.code = code;
  }
}

export class DatabaseError extends AppError {
  public readonly operation?: string;

  constructor(
    message: string = 'Database operation failed',
    operation?: string
  ) {
    super(message, 500, false);
    this.operation = operation;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  public readonly resource?: string;

  constructor(message: string = 'Resource not found', resource?: string) {
    super(message, 404);
    this.resource = resource;
  }
}

export class ConflictError extends AppError {
  public readonly field?: string;

  constructor(message: string = 'Resource already exists', field?: string) {
    super(message, 409);
    this.field = field;
  }
}

// Rate limiting error
export class TooManyRequestsError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

// State transition error
export class StateTransitionError extends ValidationError {
  public readonly currentStatus?: string;
  public readonly targetStatus?: string;
  public readonly validTransitions?: string[];

  constructor(
    message: string,
    currentStatus?: string,
    targetStatus?: string,
    validTransitions?: string[]
  ) {
    super(message, 'state_transition', 'INVALID_STATE_TRANSITION');
    this.currentStatus = currentStatus;
    this.targetStatus = targetStatus;
    this.validTransitions = validTransitions;
  }
}