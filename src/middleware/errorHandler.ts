// Error handling middleware

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, DatabaseError, DatesOverlapError, ConflictError } from '../utils/AppError';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';
import { ApiErrorResponse } from '../types/common';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error: AppError;
  const errorObj = err as Record<string, any>;

  try {
    // MongoDB duplicate key error
    if (errorObj.code === 11000) {
      const field = Object.keys(errorObj.keyValue || {})[0] || 'field';
      error = new ValidationError(
        `${field} already exists`,
        field,
        'DUPLICATE_KEY'
      );
    }
    // MongoDB validation error
    else if (errorObj.name === 'ValidationError') {
      const errors = Object.values(errorObj.errors || {}).map((val: any) => val.message || 'Validation error');
      error = new ValidationError(`Validation Error: ${errors.join(', ')}`);
    }
    // MongoDB cast error
    else if (errorObj.name === 'CastError') {
      error = new ValidationError(`Invalid ${errorObj.path || 'field'}: ${errorObj.value || 'invalid value'}`);
    }
    // Already an AppError instance
    else if (err instanceof AppError) {
      error = err;
    }
    // Default to AppError if not already
    else {
      logger.error(
        {
          error: errorObj,
          message: errorObj.message || 'Unknown error',
          stack: errorObj.stack,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        },
        '🔴 Unexpected Error'
      );

      error = new AppError('Internal Server Error', 500, false);
    }

    // Build unified error response format
    const response: ApiErrorResponse = {
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError && error.field && { field: error.field }),
        ...(error instanceof ValidationError && error.code && { code: error.code }),
        ...(ENV.NODE_ENV === 'development' && errorObj.details && { details: errorObj.details }),
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    };

    // Handle DatesOverlapError with structured response (HTTP 409 Conflict)
    if (error instanceof DatesOverlapError) {
      response.error.message = error.message;
      response.error.code = 'DATES_OVERLAP';
      if (error.conflictingBookings) {
        response.error.details = {
          conflictingBookings: error.conflictingBookings,
          ...(error.suggestedAlternatives && { suggestedAlternatives: error.suggestedAlternatives }),
        };
      }
    }

    // Handle ConflictError (HTTP 409)
    if (error instanceof ConflictError && !(error instanceof DatesOverlapError)) {
      response.error.code = 'CONFLICT';
      if (error.field) {
        response.error.field = error.field;
      }
    }

    // Log error for monitoring
    if (error.statusCode >= 500) {
      logger.error(
        {
          error: error.message,
          statusCode: error.statusCode,
          path: req.path,
          method: req.method,
          ...(ENV.NODE_ENV === 'development' && { stack: error.stack }),
        },
        'Server Error'
      );
    }

    res.status(error.statusCode).json(response);
  } catch (handlerError) {
    // Fallback if error handler itself fails
    logger.error(
      {
        originalError: errorObj,
        handlerError,
        path: req.path,
      },
      '🔴 Critical: Error handler failed'
    );

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal Server Error',
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}
