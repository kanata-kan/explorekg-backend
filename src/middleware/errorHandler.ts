// Error handling middleware

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, DatabaseError, DatesOverlapError, ConflictError } from '../utils/AppError';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error = err;

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ValidationError(
      `${field} already exists`,
      field,
      'DUPLICATE_KEY'
    );
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val: any) => val.message);
    error = new ValidationError(`Validation Error: ${errors.join(', ')}`);
  }

  // MongoDB cast error
  if (err.name === 'CastError') {
    error = new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  // Default to AppError if not already
  if (!(error instanceof AppError)) {
    logger.error(
      {
        error: err,
        path: req.path,
        method: req.method,
        ip: req.ip,
      },
      '🔴 Unexpected Error'
    );

    error = new AppError('Internal Server Error', 500, false);
  }

  const response: any = {
    success: false,
    error: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(ENV.NODE_ENV === 'development' && {
      stack: error.stack,
      originalError: err.message !== error.message ? err.message : undefined,
    }),
    ...(error instanceof ValidationError &&
      error.field && { field: error.field }),
    ...(error instanceof ValidationError && error.code && { code: error.code }),
  };

  // Handle DatesOverlapError with structured response (HTTP 409 Conflict)
  if (error instanceof DatesOverlapError) {
    response.error = 'DatesOverlap';
    response.message = error.message;
    if (error.conflictingBookings) {
      response.conflictingBookings = error.conflictingBookings;
    }
    if (error.suggestedAlternatives) {
      response.suggestedAlternatives = error.suggestedAlternatives;
    }
  }

  // Handle ConflictError (HTTP 409)
  if (error instanceof ConflictError && !(error instanceof DatesOverlapError)) {
    response.error = 'Conflict';
    response.message = error.message;
    if (error.field) {
      response.field = error.field;
    }
  }

  res.status(error.statusCode).json(response);
}
