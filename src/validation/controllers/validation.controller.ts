// src/validation/controllers/validation.controller.ts

/**
 * Validation Controller
 * 
 * Handles HTTP requests for real-time validation endpoints.
 * 
 * Endpoints:
 * - POST /api/v1/validation/booking - Full booking validation
 * - POST /api/v1/validation/booking/field - Field-specific validation
 * 
 * This controller is the API boundary for the real-time validation system.
 * It does NOT perform business logic, pricing, or database writes.
 * It only orchestrates validation requests and returns FE-ready responses.
 * 
 * @module validation/controllers
 */

import { Request, Response, NextFunction } from 'express';
import { validateBookingData, validateField, ValidationRequest } from '../services/validation.service';
import { logger } from '../../utils/logger';

/**
 * Extract locale from request
 * 
 * Priority:
 * 1. req.body.locale
 * 2. req.headers['accept-language']
 * 3. default: 'en'
 * 
 * @param req - Express request object
 * @returns Detected locale ('en' | 'fr')
 */
function extractLocale(req: Request): 'en' | 'fr' {
  // Priority 1: Body locale
  if (req.body?.locale && (req.body.locale === 'en' || req.body.locale === 'fr')) {
    return req.body.locale;
  }

  // Priority 2: Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const lang = acceptLanguage.toLowerCase().split(',')[0].split('-')[0];
    if (lang === 'fr') {
      return 'fr';
    }
    if (lang === 'en') {
      return 'en';
    }
  }

  // Priority 3: Default to 'en'
  return 'en';
}

/**
 * POST /api/v1/validation/booking
 * 
 * Validate complete booking data in real-time.
 * 
 * Request body:
 * {
 *   data: {
 *     guestId?: string,
 *     itemType?: 'travel_pack' | 'activity' | 'car',
 *     itemId?: string,
 *     numberOfPersons?: number,
 *     numberOfUnits?: number,
 *     numberOfDays?: number,
 *     startDate?: string,
 *     endDate?: string
 *   },
 *   locale?: 'en' | 'fr'
 * }
 * 
 * Response (always 200):
 * {
 *   isValid: boolean,
 *   errors: Array<{
 *     field: string,
 *     code: string,
 *     uiKey: string,
 *     message: string,
 *     severity: 'error' | 'warning',
 *     details?: Record<string, any>
 *   }>,
 *   warnings?: Array<...>,
 *   suggestions?: Array<...>,
 *   metadata: {
 *     validatedAt: string,
 *     locale: 'en' | 'fr',
 *     cacheHit: boolean,
 *     cacheHits: string[],
 *     validationTimeMs: number
 *   }
 * }
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const validateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Track request start time for timeout handling
    (req as any).startTime = Date.now();
    // Validate request body exists
    if (!req.body) {
      res.status(400).json({
        error: 'MISSING_BODY',
        message: 'Request body is required',
        isValid: false,
        errors: [{
          field: 'body',
          code: 'MISSING_BODY',
          uiKey: 'validation.missing_body',
          message: 'Request body is required',
          severity: 'error' as const,
        }],
        metadata: {
          validatedAt: new Date().toISOString(),
          locale: 'en',
          cacheHit: false,
          cacheHits: [],
        },
      });
      return;
    }

    // Extract data from request body
    const data: ValidationRequest = req.body.data || req.body;

    // Extract locale
    const locale = extractLocale(req);

    // Call validation service
    const validationResult = await validateBookingData(data, locale);

    // Always return 200 with validation result
    res.status(200).json(validationResult);
  } catch (error: any) {
    // Log error for monitoring
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
      },
      'Validation controller error'
    );

    // Handle timeout error specifically
    if (error.message === 'VALIDATION_TIMEOUT') {
      // Return timeout error in validation format (always 200)
      res.status(200).json({
        isValid: false,
        errors: [{
          field: 'system',
          code: 'VALIDATION_TIMEOUT',
          uiKey: 'validation.timeout',
          message: 'Validation is taking longer than expected. Some checks may be incomplete. Please try again.',
          severity: 'warning' as const,
          details: {
            timeoutMs: 2000,
            actualTimeMs: Date.now() - (req as any).startTime || 2000,
          },
        }],
        warnings: [{
          field: 'system',
          code: 'VALIDATION_TIMEOUT',
          uiKey: 'validation.timeout',
          message: 'Validation timeout occurred. Some availability checks may be incomplete.',
          severity: 'warning' as const,
        }],
        metadata: {
          validatedAt: new Date().toISOString(),
          locale: extractLocale(req),
          cacheHit: false,
          cacheHits: [],
          validationTimeMs: 2000,
        },
      });
      return;
    }

    // Return error in validation format (always 200)
    res.status(200).json({
      isValid: false,
      errors: [{
        field: 'system',
        code: 'VALIDATION_ERROR',
        uiKey: 'validation.system_error',
        message: 'An error occurred during validation. Please try again.',
        severity: 'error' as const,
        details: process.env.NODE_ENV === 'development' ? {
          error: error.message,
          stack: error.stack,
        } : undefined,
      }],
      metadata: {
        validatedAt: new Date().toISOString(),
        locale: extractLocale(req),
        cacheHit: false,
        cacheHits: [],
      },
    });
  }
};

/**
 * POST /api/v1/validation/booking/field
 * 
 * Validate a single field in real-time.
 * 
 * Request body:
 * {
 *   field: string,        // Required: Field name to validate
 *   value: any,           // Required: Field value to validate
 *   context?: {           // Optional: Other field values for context
 *     guestId?: string,
 *     itemType?: string,
 *     ...
 *   },
 *   locale?: 'en' | 'fr'
 * }
 * 
 * Response (always 200):
 * {
 *   isValid: boolean,
 *   errors: Array<{
 *     field: string,
 *     code: string,
 *     uiKey: string,
 *     message: string,
 *     severity: 'error' | 'warning',
 *     details?: Record<string, any>
 *   }>,
 *   warnings?: Array<...>,
 *   suggestions?: Array<...>,
 *   metadata: {
 *     validatedAt: string,
 *     locale: 'en' | 'fr',
 *     cacheHit: boolean,
 *     cacheHits: string[],
 *     validationTimeMs: number
 *   }
 * }
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const validateFieldEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Track request start time for timeout handling
    (req as any).startTime = Date.now();
    // Validate request body exists
    if (!req.body) {
      res.status(400).json({
        error: 'MISSING_BODY',
        message: 'Request body is required',
        isValid: false,
        errors: [{
          field: 'body',
          code: 'MISSING_BODY',
          uiKey: 'validation.missing_body',
          message: 'Request body is required',
          severity: 'error' as const,
        }],
        metadata: {
          validatedAt: new Date().toISOString(),
          locale: 'en',
          cacheHit: false,
          cacheHits: [],
        },
      });
      return;
    }

    // Validate 'field' is present
    if (!req.body.field || typeof req.body.field !== 'string') {
      res.status(400).json({
        error: 'MISSING_FIELD',
        message: "Field 'field' is required",
        isValid: false,
        errors: [{
          field: 'field',
          code: 'MISSING_FIELD',
          uiKey: 'validation.missing_field',
          message: "Field 'field' is required",
          severity: 'error' as const,
        }],
        metadata: {
          validatedAt: new Date().toISOString(),
          locale: 'en',
          cacheHit: false,
          cacheHits: [],
        },
      });
      return;
    }

    // Extract field, value, and context
    const { field, value, context } = req.body;

    // Extract locale
    const locale = extractLocale(req);

    // Call validation service
    const validationResult = await validateField(field, value, context, locale);

    // Always return 200 with validation result
    res.status(200).json(validationResult);
  } catch (error: any) {
    // Log error for monitoring
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
      },
      'Field validation controller error'
    );

    // Handle timeout error specifically
    if (error.message === 'VALIDATION_TIMEOUT') {
      // Return timeout error in validation format (always 200)
      res.status(200).json({
        isValid: false,
        errors: [{
          field: req.body?.field || 'system',
          code: 'VALIDATION_TIMEOUT',
          uiKey: 'validation.timeout',
          message: 'Validation is taking longer than expected. Some checks may be incomplete. Please try again.',
          severity: 'warning' as const,
          details: {
            timeoutMs: 2000,
            actualTimeMs: Date.now() - (req as any).startTime || 2000,
          },
        }],
        warnings: [{
          field: req.body?.field || 'system',
          code: 'VALIDATION_TIMEOUT',
          uiKey: 'validation.timeout',
          message: 'Validation timeout occurred. Some availability checks may be incomplete.',
          severity: 'warning' as const,
        }],
        metadata: {
          validatedAt: new Date().toISOString(),
          locale: extractLocale(req),
          cacheHit: false,
          cacheHits: [],
          validationTimeMs: 2000,
        },
      });
      return;
    }

    // Return error in validation format (always 200)
    res.status(200).json({
      isValid: false,
      errors: [{
        field: req.body?.field || 'system',
        code: 'VALIDATION_ERROR',
        uiKey: 'validation.system_error',
        message: 'An error occurred during field validation. Please try again.',
        severity: 'error' as const,
        details: process.env.NODE_ENV === 'development' ? {
          error: error.message,
          stack: error.stack,
        } : undefined,
      }],
      metadata: {
        validatedAt: new Date().toISOString(),
        locale: extractLocale(req),
        cacheHit: false,
        cacheHits: [],
      },
    });
  }
};

